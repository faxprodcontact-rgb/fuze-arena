// =====================================================================
//  MOTEUR DU JEU — règles pures (pas d'affichage). Pourra tourner
//  plus tard sur le serveur pour que personne ne puisse tricher.
// =====================================================================
import {
  CLASSES, SPELLS, SPELL_LIST, ITEMS, ITEM_LIST, RARITIES, STAT_KEYS, SLOT_ORDER, SETS,
  MAX_LEVEL, POINTS_PER_LEVEL, WINS_PER_COMBAT_CHEST, CHEST_INTERVAL_MS, CHEST_MAX, CHEST_ODDS, MAX_ACTIVE_SPELLS,
  DUNGEON_INTERVAL_MS, DUNGEON_MAX, WAR, FRIENDS,
} from './data.js?v=20261017175233';
import { makeRng, hashStr, pickWeighted } from './rng.js?v=20261017175233';

// ----------------------------- Progression -----------------------------
export const xpForLevel = (lvl) => 50 + 15 * lvl;
export const totalPoints = (lvl) => lvl * POINTS_PER_LEVEL;
export const spentPoints = (hero) => STAT_KEYS.reduce((a, k) => a + (hero.alloc[k] || 0), 0);
export const freePoints = (hero) => totalPoints(hero.level) - spentPoints(hero);

export function classSpells(classId) {
  return SPELL_LIST.filter(s => s.cls === classId).sort((a, b) => a.lvl - b.lvl);
}
export function unlockedSpells(classId, level) {
  return classSpells(classId).filter(s => s.lvl <= level);
}

/** Ajoute de l'XP. Renvoie { levels, newSpells } */
export function gainXp(hero, amount) {
  const before = hero.level;
  hero.xp += amount;
  while (hero.level < MAX_LEVEL && hero.xp >= xpForLevel(hero.level)) {
    hero.xp -= xpForLevel(hero.level);
    hero.level++;
  }
  if (hero.level >= MAX_LEVEL) hero.xp = 0;
  const newSpells = classSpells(hero.classId).filter(s => s.lvl > before && s.lvl <= hero.level);
  for (const s of newSpells) {
    if (hero.spells.length < MAX_ACTIVE_SPELLS) hero.spells.push(s.id);
  }
  return { levels: hero.level - before, newSpells };
}

// ------------------------------- Objets --------------------------------
export function itemStats(itemId, rarity) {
  const it = ITEMS[itemId];
  const m = RARITIES[rarity].mult;
  const out = {};
  for (const k in it.stats) out[k] = Math.round(it.stats[k] * m);
  return out;
}

export function equippedItems(hero) {
  const out = {};
  for (const slot of SLOT_ORDER) {
    const uid = hero.equipped[slot];
    const it = uid && hero.inventory.find(i => i.uid === uid);
    if (it) out[slot] = it;
  }
  return out;
}

// ------------------------------- Stats ---------------------------------
export function computeStats(hero) {
  const c = CLASSES[hero.classId];
  const st = {};
  const eq = equippedItems(hero);
  for (const k of STAT_KEYS) {
    st[k] = c.base[k] + c.growth[k] * (hero.level - 1) + (hero.alloc[k] || 0);
  }
  for (const slot in eq) {
    const s = itemStats(eq[slot].itemId, eq[slot].rarity);
    for (const k in s) st[k] += s[k];
  }
  // Bonus de panoplie (en %)
  for (const a of activeSets(hero)) {
    if (!a.bonus) continue;
    for (const k in a.bonus) st[k] *= 1 + a.bonus[k];
  }
  for (const k of STAT_KEYS) st[k] = Math.round(st[k]);
  return st;
}

/** Panoplies portées : [{ setId, count, bonus }] (bonus = null si moins de 3 pièces) */
export function activeSets(hero) {
  const eq = equippedItems(hero);
  const counts = {};
  for (const slot in eq) {
    const set = ITEMS[eq[slot].itemId].set;
    if (set) counts[set] = (counts[set] || 0) + 1;
  }
  return Object.entries(counts).map(([setId, count]) => ({
    setId, count,
    bonus: count >= 5 ? SETS[setId].bonus5 : count >= 3 ? SETS[setId].bonus3 : null,
  }));
}

export const maxHp = (st, level) => Math.round(60 + st.vit * 8 + level * 4);
export const critChance = (lck) => 0.05 + 0.45 * lck / (lck + 120);
export const dodgeChance = (lck) => 0.03 + 0.25 * lck / (lck + 200);

export function powerScore(snap) {
  const s = snap.stats;
  return Math.round(snap.maxHp / 6 + s.atk + s.mag + s.def * 1.2 + s.spd * 1.3 + s.lck);
}

/** « Photo » du héros utilisée pour un combat */
export function snapshot(hero) {
  const stats = computeStats(hero);
  const eq = equippedItems(hero);
  return {
    name: hero.name,
    classId: hero.classId,
    level: hero.level,
    stats,
    maxHp: maxHp(stats, hero.level),
    spells: hero.spells.filter(id => SPELLS[id] && SPELLS[id].lvl <= hero.level),
    pet: eq.pet ? { itemId: eq.pet.itemId, rarity: eq.pet.rarity } : null,
    hat: eq.hat ? { itemId: eq.hat.itemId, rarity: eq.hat.rarity } : null,
  };
}

// ------------------------------- Combat --------------------------------
const GAUGE = 1000;
const RAGE_START = 40;    // après 40 actions, les dégâts augmentent
const MAX_ACTIONS = 160;

function isSelfOnly(sp) { return !sp.mult; }

/**
 * Simule un combat complet. Renvoie { log, winner }.
 * Le log est rejoué ensuite par l'écran de combat avec les animations.
 */
export function simulate(A, B, seed) {
  const rng = makeRng(seed);
  const F = [A, B].map((s, i) => ({
    i, s, hp: s.maxHp, max: s.maxHp, shield: 0, gauge: rng() * 200,
    cds: {}, buffs: [], dots: [], stun: 0, stunImmune: 0,
  }));
  const log = [];
  let actions = 0;
  let rage = 1;

  const stat = (f, k) => {
    let pct = 0;
    for (const b of f.buffs) if (b.stat === k) pct += b.pct;
    return Math.max(1, f.s.stats[k] * (1 + pct));
  };
  const power = (f, scale) => scale === 'mix'
    ? (stat(f, 'atk') + stat(f, 'mag')) * 0.9
    : stat(f, scale);

  const summary = () => F.map(f => ({
    hp: f.hp, shield: Math.round(f.shield),
    tags: [
      ...f.buffs.map(b => ({ n: b.name, k: b.pct > 0 ? 'buff' : 'debuff' })),
      ...f.dots.map(d => ({ n: d.name, k: d.kind })),
      ...(f.stun > 0 ? [{ n: 'Étourdi', k: 'stun' }] : []),
    ],
  }));
  const push = (e) => { e.s = summary(); log.push(e); };

  const worth = (sp, f, foe) => {
    if (!isSelfOnly(sp)) return true;
    const effs = sp.effects || [];
    if (effs.some(e => e.k === 'heal')) return f.hp / f.max < 0.6;
    if (effs.some(e => e.k === 'shield')) return f.shield < f.max * 0.05;
    if (effs.some(e => e.k === 'buff')) return !f.buffs.some(b => b.src === sp.id);
    return true;
  };

  const choose = (f, foe) => {
    for (const id of f.s.spells) {
      const sp = SPELLS[id];
      if (!sp || (f.cds[id] || 0) > 0) continue;
      if (worth(sp, f, foe)) return sp;
    }
    return { ...(f.s.basic || CLASSES[f.s.classId].basic), id: null };
  };

  const perform = (f, foe, sp) => {
    const act = { type: 'action', actor: f.i, id: sp.id, name: sp.name, fx: sp.fx, melee: !!sp.melee, selfOnly: isSelfOnly(sp), hits: sp.mult ? (sp.hits || 1) : 0, results: [] };
    const R = act.results;
    let landed = false;

    if (sp.mult) {
      for (let h = 0; h < (sp.hits || 1); h++) {
        if (foe.hp <= 0) break;
        if (rng() < dodgeChance(stat(foe, 'lck'))) {
          R.push({ step: h, type: 'dodge', target: foe.i });
          continue;
        }
        let dmg = power(f, sp.scale) * sp.mult;
        const def = stat(foe, 'def') * (1 - (sp.pierce || 0));
        dmg *= 100 / (100 + def);
        dmg *= 0.9 + rng() * 0.2;
        if (sp.execute && foe.hp / foe.max < 0.35) dmg *= 1 + sp.execute;
        const crit = rng() < critChance(stat(f, 'lck')) + (sp.crit || 0);
        if (crit) dmg *= 1.6;
        dmg = Math.max(1, Math.round(dmg * rage));
        const absorbed = Math.min(Math.round(foe.shield), dmg);
        foe.shield = Math.max(0, foe.shield - absorbed);
        foe.hp = Math.max(0, foe.hp - (dmg - absorbed));
        landed = true;
        R.push({ step: h, type: 'hit', target: foe.i, dmg, absorbed, crit, hp: foe.hp });
        if (sp.lifesteal) {
          const amount = Math.round(dmg * sp.lifesteal);
          f.hp = Math.min(f.max, f.hp + amount);
          R.push({ step: h, type: 'heal', target: f.i, amount, hp: f.hp });
        }
      }
    }

    const last = Math.max(0, (sp.hits || 1) - 1);
    for (const e of sp.effects || []) {
      const onFoe = e.k === 'dot' || e.k === 'stun' || e.k === 'debuff';
      if (onFoe && (!landed || foe.hp <= 0)) continue;
      if (e.k === 'dot') {
        const dmg = Math.max(1, Math.round(power(f, sp.scale) * e.mult * 100 / (100 + stat(foe, 'def') * 0.5)));
        foe.dots = foe.dots.filter(d => d.kind !== e.kind);
        foe.dots.push({ kind: e.kind, name: e.name, dmg, turns: e.turns });
        R.push({ step: last, type: 'status', target: foe.i, k: e.kind, n: e.name });
      } else if (e.k === 'stun') {
        if (foe.stunImmune <= 0 && rng() < e.chance) {
          foe.stun = 1;
          R.push({ step: last, type: 'status', target: foe.i, k: 'stun', n: 'Étourdi' });
        }
      } else if (e.k === 'debuff') {
        foe.buffs = foe.buffs.filter(b => b.src !== sp.id);
        foe.buffs.push({ stat: e.stat, pct: -e.pct, turns: e.turns, src: sp.id, name: `${STAT_SHORT[e.stat]} −${Math.round(e.pct * 100)}%` });
        R.push({ step: last, type: 'status', target: foe.i, k: 'debuff', n: `${STAT_SHORT[e.stat]} −${Math.round(e.pct * 100)}%` });
      } else if (e.k === 'buff') {
        f.buffs = f.buffs.filter(b => b.src !== sp.id);
        f.buffs.push({ stat: e.stat, pct: e.pct, turns: e.turns + 1, src: sp.id, name: `${STAT_SHORT[e.stat]} +${Math.round(e.pct * 100)}%` });
        R.push({ step: last, type: 'status', target: f.i, k: 'buff', n: `${STAT_SHORT[e.stat]} +${Math.round(e.pct * 100)}%` });
      } else if (e.k === 'heal') {
        const amount = Math.round(e.pctMax ? f.max * e.pctMax : power(f, e.scale) * e.mult);
        f.hp = Math.min(f.max, f.hp + amount);
        R.push({ step: last, type: 'heal', target: f.i, amount, hp: f.hp });
      } else if (e.k === 'shield') {
        const amount = Math.round(power(f, e.scale) * e.mult);
        f.shield = Math.min(f.max * 0.6, f.shield + amount);
        R.push({ step: last, type: 'shield', target: f.i, amount, shield: Math.round(f.shield) });
      }
    }
    if (sp.id) f.cds[sp.id] = sp.cd;
    push(act);
  };

  let winner = null;
  while (winner === null) {
    // Jauge de vitesse : le plus rapide joue plus souvent
    let actor = null;
    while (!actor) {
      for (const f of F) f.gauge += stat(f, 'spd') + 60;
      const ready = F.filter(f => f.gauge >= GAUGE).sort((a, b) => b.gauge - a.gauge);
      actor = ready[0] || null;
    }
    actor.gauge -= GAUGE;
    const foe = F[1 - actor.i];
    actions++;

    if (actions === RAGE_START) push({ type: 'rage' });
    if (actions >= RAGE_START && actions % 5 === 0) rage += 0.15;

    // Recharges des sorts
    for (const id in actor.cds) if (actor.cds[id] > 0) actor.cds[id]--;

    // Dégâts sur la durée (brûlure, poison)
    for (const d of actor.dots) {
      const dmg = Math.max(1, Math.round(d.dmg * rage));
      actor.hp = Math.max(0, actor.hp - dmg);
      d.turns--;
      push({ type: 'dot', target: actor.i, k: d.kind, n: d.name, dmg, hp: actor.hp });
      if (actor.hp <= 0) break;
    }
    actor.dots = actor.dots.filter(d => d.turns > 0);
    if (actor.hp <= 0) { winner = foe.i; break; }

    if (actor.stun > 0) {
      actor.stun = 0;
      actor.stunImmune = 2;
      push({ type: 'stunned', target: actor.i });
    } else {
      perform(actor, foe, choose(actor, foe));
      if (foe.hp <= 0) { winner = actor.i; break; }
    }

    // Fin du tour : effets temporaires
    for (const b of actor.buffs) b.turns--;
    actor.buffs = actor.buffs.filter(b => b.turns > 0);
    if (actor.stunImmune > 0) actor.stunImmune--;

    if (actions >= MAX_ACTIONS) {
      winner = F[0].hp / F[0].max >= F[1].hp / F[1].max ? 0 : 1;
    }
  }
  push({ type: 'end', winner });
  return { log, winner };
}

const STAT_SHORT = { vit: 'VIT', atk: 'ATQ', mag: 'MAG', def: 'DÉF', spd: 'VIT+', lck: 'CHA' };

// ------------------------------- Coffres -------------------------------
/** Recharge un stock (coffres, entrées de donjon) selon le temps écoulé. */
function refreshStock(c, interval, max, now = Date.now()) {
  if (c.stored >= max) { c.last = now; return; }
  const gained = Math.floor((now - c.last) / interval);
  if (gained > 0) {
    c.stored = Math.min(max, c.stored + gained);
    c.last = c.stored >= max ? now : c.last + gained * interval;
  }
}
function nextIn(c, interval, max, now = Date.now()) {
  if (c.stored >= max) return 0;
  return Math.max(0, c.last + interval - now);
}
export const refreshChests = (hero, now) => refreshStock(hero.chest, CHEST_INTERVAL_MS, CHEST_MAX, now);
export const nextChestIn = (hero, now) => nextIn(hero.chest, CHEST_INTERVAL_MS, CHEST_MAX, now);
export const refreshDungeon = (hero, now) => refreshStock(hero.dungeon, DUNGEON_INTERVAL_MS, DUNGEON_MAX, now);
export const nextDungeonIn = (hero, now) => nextIn(hero.dungeon, DUNGEON_INTERVAL_MS, DUNGEON_MAX, now);

export function rollItem(rng, kind) {
  const odds = Array.isArray(kind) ? kind : CHEST_ODDS[kind];
  const rarity = pickWeighted(rng, odds);
  const item = ITEM_LIST[Math.floor(rng() * ITEM_LIST.length)];
  return { itemId: item.id, rarity };
}

export function addItem(hero, itemId, rarity) {
  const it = { uid: `i${hero.nextUid++}`, itemId, rarity };
  hero.inventory.push(it);
  return it;
}

/**
 * Ouvre un coffre. kind = 'normal' | 'combat' | 'war'.
 * Les coffres « normaux » se rechargent pour chaque personnage ; les coffres de combat
 * et de guerre sont gagnés par le compte. Les objets vont toujours au perso actif.
 */
export function openChest(acc, hero, kind, rng = Math.random) {
  if (kind === 'normal') {
    refreshChests(hero);
    if (hero.chest.stored <= 0) return null;
    if (hero.chest.stored >= CHEST_MAX) hero.chest.last = Date.now();
    hero.chest.stored--;
  } else if (kind === 'war') {
    if (acc.warChests <= 0) return null;
    acc.warChests--;
  } else {
    if (acc.combatChests <= 0) return null;
    acc.combatChests--;
  }
  const n = kind === 'war' ? WAR.warChestItems : kind === 'combat' ? 2 : 1;
  const items = [];
  for (let i = 0; i < n; i++) {
    const r = rollItem(rng, kind);
    items.push(addItem(hero, r.itemId, r.rarity));
  }
  const xp = kind === 'war' ? 120 : kind === 'combat' ? 60 : 20;
  const lv = gainXp(hero, xp);
  return { items, xp, ...lv };
}

// ------------------------------- Fusion --------------------------------
export function stackOf(hero, itemId, rarity) {
  return hero.inventory.filter(i => i.itemId === itemId && i.rarity === rarity);
}

/** Fusionne 2 objets identiques en 1 de rareté supérieure. */
export function fuse(hero, itemId, rarity) {
  if (rarity >= RARITIES.length - 1) return null;
  const stack = stackOf(hero, itemId, rarity);
  if (stack.length < 2) return null;
  // On consomme en priorité les objets non équipés
  const equippedUids = new Set(Object.values(hero.equipped));
  stack.sort((a, b) => (equippedUids.has(a.uid) ? 1 : 0) - (equippedUids.has(b.uid) ? 1 : 0));
  const used = stack.slice(0, 2);
  const wasEquipped = used.some(u => equippedUids.has(u.uid));
  hero.inventory = hero.inventory.filter(i => !used.includes(i));
  const res = addItem(hero, itemId, rarity + 1);
  const slot = ITEMS[itemId].slot;
  if (wasEquipped) hero.equipped[slot] = res.uid;
  return res;
}

// ------------------------------- Bots ----------------------------------
const BOT_WEIGHTS = {
  guerrier: { vit: 0.35, atk: 0.4, def: 0.25 },
  mage: { mag: 0.42, vit: 0.33, def: 0.1, spd: 0.15 },
  archer: { atk: 0.4, spd: 0.2, lck: 0.2, vit: 0.2 },
  paladin: { vit: 0.3, def: 0.25, mag: 0.25, atk: 0.2 },
};

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Crée un adversaire « bot » stable pour la journée, proche du niveau du joueur. */
export function buildBot(friend, heroLevel, day) {
  const rng = makeRng(hashStr(friend.id + day));
  const level = Math.max(1, Math.min(MAX_LEVEL, heroLevel + Math.floor(rng() * 4) - 2));
  const hero = newHero(friend.name, friend.classId);
  hero.level = level;
  // Points de stats
  const w = BOT_WEIGHTS[friend.classId];
  const keys = Object.keys(w);
  const weights = keys.map(k => w[k]);
  for (let p = 0; p < totalPoints(level); p++) {
    const k = keys[pickWeighted(rng, weights)];
    hero.alloc[k] = (hero.alloc[k] || 0) + 1;
  }
  // Équipement
  for (const slot of SLOT_ORDER) {
    if (rng() > Math.min(0.9, 0.25 + level * 0.01)) continue;
    const pool = ITEM_LIST.filter(i => i.slot === slot);
    const item = pool[Math.floor(rng() * pool.length)];
    const rarity = Math.min(4, Math.floor(rng() * (1 + level / 25)));
    const it = addItem(hero, item.id, rarity);
    hero.equipped[slot] = it.uid;
  }
  // Sorts : les plus forts débloqués, soins/boucliers en priorité
  const un = unlockedSpells(friend.classId, level).reverse();
  const kindRank = (s) => (s.effects || []).some(e => e.k === 'heal') ? 0 : (s.effects || []).some(e => e.k === 'shield') ? 1 : 2;
  const support = un.filter(isSelfOnly).sort((a, b) => kindRank(a) - kindRank(b)).slice(0, 1);
  const attacks = un.filter(s => !isSelfOnly(s)).slice(0, MAX_ACTIVE_SPELLS - support.length);
  hero.spells = [...support, ...attacks].map(s => s.id);
  return hero;
}

// ------------------------------- Compte & personnages -------------------
// Un compte = un joueur. Il peut avoir plusieurs personnages : chacun a son niveau, ses objets,
// son stock de coffres et ses entrées de donjon. Les combats d'arène du jour, les coffres de
// combat/guerre et la section sont partagés par le compte.
export const MAX_HEROES = 4;

export function newHero(name, classId, id = 'h1') {
  return {
    id,
    name,
    classId,
    level: 1,
    xp: 0,
    alloc: {},
    inventory: [],
    equipped: {},
    nextUid: 1,
    spells: [classSpells(classId)[0].id],
    stats: { wins: 0, losses: 0, dungeons: 0 },
    dungeonClears: {},
    chest: { stored: 2, last: Date.now() },
    dungeon: { stored: DUNGEON_MAX, last: Date.now() },
  };
}

export function newAccount(pseudo, classId) {
  return {
    v: 2,
    pseudo,
    active: 0,
    nextHeroId: 2,
    heroes: [newHero(pseudo, classId, 'h1')],
    combatChests: 0,
    warChests: 0,
    winProgress: 0,
    fights: { day: '', done: {}, lvl: 1 },
    war: newWarState(),
    titles: { warHero: 0 },
    clat: 0,
  };
}

export const activeHero = (acc) => acc.heroes[acc.active] || acc.heroes[0];

export function addCharacter(acc, classId) {
  if (acc.heroes.length >= MAX_HEROES) return null;
  const h = newHero(acc.pseudo, classId, `h${acc.nextHeroId++}`);
  acc.heroes.push(h);
  acc.active = acc.heroes.length - 1;
  return h;
}

function newWarState() {
  return { section: null, sides: {}, joinedAt: 0, day: '', done: {}, log: [], pending: null, weeks: {}, lastWeek: '' };
}

function cleanItems(hero) {
  hero.inventory = hero.inventory.filter(i => ITEMS[i.itemId]);
  for (const slot in hero.equipped) {
    if (!hero.inventory.some(i => i.uid === hero.equipped[slot])) delete hero.equipped[slot];
  }
}

/** Met à niveau une ancienne sauvegarde (un seul héros) vers un compte */
export function migrate(save) {
  let acc = save;
  if (save.v !== 2) {
    const h = save;
    acc = newAccount(h.name, h.classId);
    acc.heroes = [{
      id: 'h1', name: h.name, classId: h.classId, level: h.level, xp: h.xp, alloc: h.alloc || {},
      inventory: h.inventory || [], equipped: h.equipped || {}, nextUid: h.nextUid || 1, spells: h.spells || [],
      stats: { wins: 0, losses: 0, dungeons: 0, ...(h.stats || {}) }, dungeonClears: h.dungeonClears || {},
    }];
    for (const k of ['combatChests', 'warChests', 'winProgress', 'fights', 'titles']) if (h[k] !== undefined) acc[k] = h[k];
    if (h.chest) acc.heroes[0].chest = h.chest;
    if (h.dungeon) acc.heroes[0].dungeon = h.dungeon;
    if (h.war) {
      const w = newWarState();
      Object.assign(w, { section: h.war.section, sides: h.war.sides || {}, joinedAt: h.war.joinedAt || 0, day: h.war.day || '', done: h.war.done || {}, log: h.war.log || [], pending: h.war.pending || null });
      if (h.war.week) { w.weeks[h.war.week] = { points: h.war.points || 0, enemyBonus: h.war.enemyBonus || 0, attacks: h.war.attacks || 0 }; w.lastWeek = h.war.week; }
      acc.war = w;
    }
  }
  acc.heroes.forEach(cleanItems);
  // Coffres et donjons passés du compte aux personnages : le 1er perso garde le stock du compte
  acc.heroes.forEach((h, i) => {
    if (!h.chest) h.chest = (i === 0 && acc.chest) ? acc.chest : { stored: 2, last: Date.now() };
    if (!h.dungeon) h.dungeon = (i === 0 && acc.dungeon) ? acc.dungeon : { stored: DUNGEON_MAX, last: Date.now() };
  });
  delete acc.chest;
  delete acc.dungeon;
  if (!acc.war.weeks) acc.war.weeks = {};
  if (!acc.titles) acc.titles = { warHero: 0 };
  if (acc.clat === undefined) acc.clat = 0;
  return acc;
}

/** Récompenses après un combat d'arène */
export function fightRewards(acc, hero, foeLevel, won) {
  const xp = won ? 30 + 3 * Math.min(foeLevel, hero.level + 5) : 12 + foeLevel;
  const lv = gainXp(hero, xp);
  let chest = false;
  if (won) {
    hero.stats.wins++;
    acc.winProgress++;
    if (acc.winProgress >= WINS_PER_COMBAT_CHEST) { acc.winProgress -= WINS_PER_COMBAT_CHEST; acc.combatChests++; chest = true; }
  } else hero.stats.losses++;
  return { xp, chest, ...lv };
}

/** Combat amical (revanche) : ni XP, ni victoire au classement, ni coffre — juste 1 Pierre Clat si on gagne */
export function friendlyRewards(acc, won) {
  if (won) acc.clat++;
  return { clat: won ? 1 : 0 };
}

// ------------------------------ Donjons --------------------------------
export const DUNGEON_HP_MULT = 1.15;      // les boss ont un peu plus de PV
/** Difficulté : un peu plus dure au début, plus douce à haut niveau (où l'équipement compte beaucoup) */
export const dungeonDifficulty = (lvl) => 1.35 - 0.004 * lvl;

export function dungeonXp(d) { return 25 + 5 * d.lvl; }

/** Chances de rareté du coffre de donjon : meilleures dans les donjons de haut niveau */
export function dungeonOdds(d) {
  const t = Math.floor(d.lvl / 10);
  return [60 - 4 * t, 28, 9 + 2 * t, 2.5 + 1.2 * t, 0.5 + 0.6 * t];
}

/** Crée le boss d'un donjon à partir de son niveau et de son profil */
export function buildMonster(d) {
  const avg = 8 + 1.25 * d.lvl;
  const stats = {};
  for (const k of STAT_KEYS) stats[k] = Math.max(1, Math.round(avg * d.profile[k] * dungeonDifficulty(d.lvl)));
  return {
    name: d.boss,
    monster: d.sprite,
    classId: null,
    level: d.lvl,
    stats,
    maxHp: Math.round(maxHp(stats, d.lvl) * DUNGEON_HP_MULT),
    spells: d.spells.slice(),
    basic: d.basic,
    pet: null,
    hat: null,
  };
}

/** Consomme une entrée de donjon. Renvoie false s'il n'y en a plus. */
export function useDungeonCharge(hero) {
  refreshDungeon(hero);
  if (hero.dungeon.stored <= 0) return false;
  if (hero.dungeon.stored >= DUNGEON_MAX) hero.dungeon.last = Date.now();
  hero.dungeon.stored--;
  return true;
}

/** Récompenses de donjon : XP selon le niveau du donjon + 1 objet si victoire */
export function dungeonRewards(hero, d, won, rng = Math.random) {
  const xp = won ? dungeonXp(d) : Math.round(dungeonXp(d) * 0.4);
  const lv = gainXp(hero, xp);
  let item = null;
  if (won) {
    const r = rollItem(rng, dungeonOdds(d));
    item = addItem(hero, r.itemId, r.rarity);
    hero.stats.dungeons++;
    hero.dungeonClears[d.id] = (hero.dungeonClears[d.id] || 0) + 1;
  }
  return { xp, item, ...lv };
}

// ------------------------------ Guerre des sections --------------------
const otherSide = (sec) => (sec === 'rouge' ? 'bleue' : 'rouge');
export { otherSide };

function mondayOf(d) { const m = new Date(d); m.setHours(0, 0, 0, 0); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; }
export const weekKey = (d = new Date()) => dayKey(mondayOf(d));
export function msToWeekEnd(d = new Date()) { const m = mondayOf(d); m.setDate(m.getDate() + 7); return m - d; }
const daysElapsedInWeek = (d = new Date()) => ((d.getDay() + 6) % 7) + 1;

/** Points gagnés en battant un ennemi : plus il est fort, plus ça rapporte */
export function warPoints(myPower, foePower) {
  const r = foePower / Math.max(1, myPower);
  return r >= 1.1 ? 3 : r >= 0.9 ? 2 : 1;
}

/** Stats de guerre du compte pour une semaine */
export function warWeek(acc, week = weekKey()) {
  if (!acc.war.weeks[week]) acc.war.weeks[week] = { points: 0, enemyBonus: 0, attacks: 0 };
  return acc.war.weeks[week];
}

/** Membres de chaque section (online : les vrais joueurs ; local : des bots) */
export function sectionCount(acc, section, others) {
  if (others) return others.filter(p => p.data.war && p.data.war.section === section).length;
  return Object.values(acc.war.sides).filter(s => s === section).length;
}

/**
 * Rejoindre une section. Online : refusé si la section a déjà WAR.maxPerSection joueurs.
 * Local : les bots se répartissent pour faire 4 contre 4.
 */
export function joinSection(acc, section, others = null) {
  if (others && sectionCount(acc, section, others) >= WAR.maxPerSection) return false;
  const war = acc.war;
  war.sides = {};
  if (!others) {
    const rng = makeRng(hashStr('sides' + acc.pseudo + Date.now()));
    const ids = FRIENDS.map(f => f.id).sort(() => rng() - 0.5);
    const enemies = Math.min(WAR.maxPerSection, ids.length);
    ids.forEach((id, i) => { war.sides[id] = i < enemies ? otherSide(section) : section; });
  }
  war.section = section;
  war.joinedAt = Date.now();
  war.lastWeek = weekKey();
  return true;
}

export function canChangeSection(acc, now = Date.now()) {
  const wait = acc.war.joinedAt + WAR.changeCooldownDays * 86400000 - now;
  return { ok: wait <= 0, wait: Math.max(0, wait) };
}

/** Points des bots sur la semaine (simulés jour par jour, toujours les mêmes) */
function botWarWeek(acc, week, days) {
  const members = [];
  const score = { rouge: 0, bleue: 0 };
  for (const f of FRIENDS) {
    const side = acc.war.sides[f.id];
    if (!side) continue;
    let pts = 0;
    for (let day = 0; day < days; day++) {
      const rng = makeRng(hashStr(`war${week}${f.id}${day}`));
      const n = rng() < 0.15 ? 0 : WAR.attacksPerDay;        // certains jours, un pote ne joue pas
      for (let a = 0; a < n; a++) {
        if (rng() < 0.55) { const p = 1 + Math.floor(rng() * 3); pts += p; score[side] += p; }
        else score[otherSide(side)] += 1;                     // défense réussie pour l'autre camp
      }
    }
    members.push({ id: f.id, name: f.name, classId: f.classId, section: side, points: pts });
  }
  return { members, score };
}

/**
 * Classement de la guerre pour une semaine.
 * others = liste des autres joueurs en ligne ([{ id, pseudo, data }]) ou null en local.
 */
export function warStandings(acc, week = weekKey(), others = null) {
  const done = week === weekKey() ? daysElapsedInWeek() : 7;
  const res = others ? { members: [], score: { rouge: 0, bleue: 0 } } : botWarWeek(acc, week, done);
  if (others) {
    for (const p of others) {
      const w = p.data.war;
      if (!w || !w.section) continue;
      const st = (w.weeks && w.weeks[week]) || { points: 0, enemyBonus: 0 };
      res.score[w.section] += st.points;
      res.score[otherSide(w.section)] += st.enemyBonus;
      const h = activeHero(p.data);
      res.members.push({ id: p.id, name: p.pseudo, classId: h.classId, section: w.section, points: st.points });
    }
  }
  if (acc.war.section) {
    const mine = acc.war.weeks[week] || { points: 0, enemyBonus: 0 };
    res.score[acc.war.section] += mine.points;
    res.score[otherSide(acc.war.section)] += mine.enemyBonus;
  }
  return res;
}

/** Remet à zéro les attaques du jour et clôture la semaine passée si besoin */
export function ensureWar(acc, others = null) {
  const war = acc.war;
  const today = dayKey();
  if (war.day !== today) { war.day = today; war.done = {}; }
  const w = weekKey();
  if (!war.section || war.lastWeek === w) return;
  if (war.lastWeek) {
    const prev = war.lastWeek;
    const st = warStandings(acc, prev, others);
    const me = war.weeks[prev] || { points: 0, enemyBonus: 0, attacks: 0 };
    const mine = st.score[war.section], theirs = st.score[otherSide(war.section)];
    const outcome = mine > theirs ? 'win' : mine < theirs ? 'loss' : 'tie';
    const eligible = me.attacks >= WAR.minAttacks;
    const mvp = me.points > 0 && me.points >= Math.max(0, ...st.members.map(m => m.points));
    war.pending = {
      week: prev, outcome, mine, theirs, points: me.points, attacks: me.attacks, eligible, mvp,
      warChests: (eligible && outcome === 'win' ? 1 : 0) + (mvp ? 1 : 0),
      combatChests: eligible && outcome !== 'win' ? 1 : 0,
    };
  }
  war.lastWeek = w;
  war.log = [];
  // On garde seulement les 4 dernières semaines
  const keep = Object.keys(war.weeks).sort().slice(-4);
  for (const k of Object.keys(war.weeks)) if (!keep.includes(k)) delete war.weeks[k];
}

export function claimWarReward(acc) {
  const p = acc.war.pending;
  if (!p) return null;
  acc.warChests += p.warChests;
  acc.combatChests += p.combatChests;
  if (p.mvp) acc.titles.warHero++;
  acc.war.pending = null;
  return p;
}

/** Enregistre une attaque de guerre et ses récompenses */
export function warAttackResult(acc, hero, foe, won, myPower, foePower) {
  const war = acc.war;
  const wk = warWeek(acc);
  const pts = won ? warPoints(myPower, foePower) : 0;
  if (won) wk.points += pts; else wk.enemyBonus += 1;
  wk.attacks++;
  war.done[foe.id] = won ? 'win' : 'loss';
  war.log.unshift({ name: foe.name, won, pts, at: Date.now() });
  war.log = war.log.slice(0, 20);
  const xp = won ? 20 + 2 * Math.min(foe.level, hero.level + 5) : 8 + foe.level;
  const lv = gainXp(hero, xp);
  return { pts, xp, ...lv };
}
