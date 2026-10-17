// =====================================================================
//  INTERFACE — écrans Héros / Coffres / Sac / Arène / Donjons / Guerre
// =====================================================================
import {
  CLASSES, STATS, STAT_KEYS, RARITIES, ITEMS, SLOTS, SLOT_ORDER, SPELLS, FRIENDS,
  CHEST_MAX, CHEST_ODDS, MAX_ACTIVE_SPELLS, WINS_PER_COMBAT_CHEST, MAX_LEVEL,
  DUNGEONS, DUNGEON_MAX, SETS, WAR, COSMETICS, COSMETIC, RAID, TOWER, MISSIONS_BONUS,
} from './data.js?v=20261018010327';
import * as E from './engine.js?v=20261018010327';
import { playBattle, playTraining, idlePreview } from './battle.js?v=20261018010327';
import { itemIcon, chestCanvas, paint, heroPortrait, monsterCanvas, clatCanvas } from './sprites.js?v=20261018010327';
import { hashStr, makeRng } from './rng.js?v=20261018010327';
import { APP_VERSION } from './version.js?v=20261018010327';
import * as NET from './net.js?v=20261018010327';
import { SFX, unlock as unlockSound, getPref, setPref, startMusic, stopMusic } from './sfx.js?v=20261018010327';

// ------------------------------ Sauvegarde ------------------------------
// Hors ligne : sauvegarde dans le téléphone. En ligne : sur le serveur.
const KEY = 'fuze-save-v1';
let memSave = null;
function load() {
  try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) { /* stockage indisponible */ }
  return memSave;
}
function save() {
  memSave = acc;
  if (NET.online) { NET.queueSave(acc); return; }
  try { localStorage.setItem(KEY, JSON.stringify(acc)); } catch (e) { /* stockage indisponible */ }
}
function wipe() {
  memSave = null;
  try { localStorage.removeItem(KEY); } catch (e) { /* stockage indisponible */ }
}

let acc = null;        // le compte (pseudo, coffres, section…)
let hero = null;       // le personnage actif du compte
let players = [];      // les autres joueurs (en ligne)
let tab = 'hero';
let rankMode = 'level';
let pickedClass = 'guerrier';
let authMode = 'signup';
let stopPreviews = [];
let chatMsgs = [];     // messages du tchat
let chatUnread = 0;
let chatDraft = '';

const others = () => (NET.online ? players : null);

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// ------------------------------ Journée & adversaires ------------------------------
function ensureDay() {
  const day = E.dayKey();
  if (acc.fights.day !== day) acc.fights = { day, done: {}, lvl: hero.level };
}
const msToMidnight = () => { const d = new Date(); const m = new Date(d); m.setHours(24, 0, 0, 0); return m - d; };

/** Adversaires : les vrais joueurs en ligne (leur perso actif), sinon des bots */
function opponents() {
  if (NET.online) {
    return players.map(p => {
      const h = E.strongestHero(p.data);   // on affronte toujours son perso le plus fort
      const snap = snapOf(p.data, h, p.pseudo);
      return { id: p.id, name: p.pseudo, classId: h.classId, level: h.level, dye: h.dye, data: p.data, snap, section: p.data.war && p.data.war.section, done: acc.fights.done[p.id] };
    });
  }
  return FRIENDS.map(f => {
    const bot = E.buildBot(f, acc.fights.lvl || hero.level, acc.fights.day);
    return { id: f.id, name: f.name, classId: f.classId, level: bot.level, snap: E.snapshot(bot), section: acc.war.sides[f.id], done: acc.fights.done[f.id] };
  });
}

async function refreshPlayers() {
  if (!NET.online || !acc) return;
  try { players = await NET.fetchOthers(); } catch (e) { toast(e.message); }
}

// ------------------------------ Rendu ------------------------------
function hydrate(root = document) {
  root.querySelectorAll('canvas[data-icon]').forEach(c => paint(c, itemIcon(c.dataset.icon), { scale: 4 }));
  root.querySelectorAll('canvas[data-portrait]').forEach(c => paint(c, heroPortrait(c.dataset.portrait, CLASSES[c.dataset.portrait].weapon, c.dataset.dye || null), { scale: 4 }));
  root.querySelectorAll('canvas[data-monster]').forEach(c => paint(c, monsterCanvas(c.dataset.monster), { scale: 3 }));
  root.querySelectorAll('canvas[data-clat]').forEach(c => paint(c, clatCanvas(), { scale: 3 }));
  root.querySelectorAll('canvas[data-chest]').forEach(c => paint(c, chestCanvas(c.dataset.chest, c.dataset.open === '1'), { scale: 6 }));
  root.querySelectorAll('canvas[data-hero]').forEach(c => stopPreviews.push(idlePreview(c, c.dataset.hero, c.dataset.pet || null, c.dataset.dye || null)));
}

function render() {
  stopPreviews.forEach(f => f());
  stopPreviews = [];
  if (!acc) { if (NET.online) renderAuth(); else renderCreate(); return; }
  hero = E.activeHero(acc);
  ensureDay();
  E.ensureWar(acc, others());
  acc.heroes.forEach(h => { E.refreshChests(h); E.refreshDungeon(h); });
  updateXpBonus();
  const need = E.xpForLevel(hero.level);
  const xpPct = hero.level >= MAX_LEVEL ? 100 : Math.round((hero.xp / need) * 100);
  const fightsLeft = opponents().filter(o => !o.done).length;
  const chests = hero.chest.stored + acc.combatChests + acc.warChests;
  const pts = E.freePoints(hero);
  const combatBadge = fightsLeft + claimableMissions();
  const socialBadge = chatUnread + journalUnseen;
  const fusable = countFusable();

  app.innerHTML = `
    <header class="topbar">
      <div class="tb-portrait"><canvas class="px" data-portrait="${hero.classId}" data-dye="${hero.dye || ''}"></canvas></div>
      <div class="tb-info">
        <div class="tb-name">${esc(acc.pseudo)}<span>${CLASSES[hero.classId].name} Nv.${hero.level}</span></div>
        <div class="xpbar"><div style="width:${xpPct}%"></div></div>
      </div>
      <button class="tb-gear ${tab === 'chat' ? 'on' : ''}" data-act="tab" data-id="chat" aria-label="Tchat">💬<span class="badge" id="chat-badge" ${chatUnread ? '' : 'hidden'}>${chatUnread}</span></button>
      <button class="tb-gear" data-act="settings" aria-label="Réglages">⚙︎</button>
    </header>
    <main id="view">${PARENT[tab] ? `<button class="backbar" data-act="tab" data-id="${PARENT[tab]}">‹ ${PARENT_NAME[PARENT[tab]]}</button>` : ''}${VIEWS[tab]()}</main>
    <nav class="tabs">
      ${tabBtn('hero', 'Héros', pts)}
      ${tabBtn('chests', 'Coffres', chests)}
      ${tabBtn('bag', 'Sac', fusable)}
      ${tabBtn('combat', 'Combats', combatBadge)}
      ${tabBtn('social', 'Social', socialBadge)}
      ${tabBtn('shop', 'Boutique', 0)}
    </nav>`;
  hydrate(app);
  paintTabIcons();
  if (tab === 'chat') { markChatSeen(); scrollChat(); }
  if (tab === 'journal') markJournalSeen();
  if (tab === 'hero') startTraining();
}

// ------------------------------ Entraînement (onglet Héros) ------------------------------
// Ton perso tape un épouvantail en continu ; les compteurs montrent l'effet de tes stats.
let T = null;
const resetTraining = () => { T = { acts: 0, foeActs: 0, hits: 0, dmg: 0, crits: 0, maxHit: 0, foeHits: 0, dodges: 0, taken: 0, heal: 0 }; };

function dummySnap(level) {
  const p = Math.round(4 + level * 0.8);   // tape doucement : il montre ta défense sans te tuer
  return {
    name: 'Épouvantail', monster: 'scarecrow', classId: null, level,
    stats: { vit: 999, atk: p, mag: p, def: 0, spd: 25, lck: 0 }, maxHp: 99999999, spells: [],
    basic: { name: 'Coup de balai', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, pet: null,
  };
}

function trainingStatsHtml() {
  if (!T) resetTraining();
  const st = E.computeStats(hero);
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const box = (ico, label, val, sub) => `<div class="ts"><span>${ico} ${label}</span><b>${val}</b><small>${sub}</small></div>`;
  const speedRatio = T.foeActs ? (T.acts / T.foeActs).toFixed(1) : '—';
  return [
    box('⚔', 'Dégâts moyens', T.hits ? Math.round(T.dmg / T.hits) : '—', `record ${T.maxHit}`),
    box('💥', 'Critiques', `${pct(T.crits, T.hits)} %`, `chance ${Math.round(E.critChance(st.lck) * 100)} %`),
    box('💨', 'Esquives', `${pct(T.dodges, T.foeHits + T.dodges)} %`, `chance ${Math.round(E.dodgeChance(st.lck) * 100)} %`),
    box('🛡', 'Défense', `−${Math.round((1 - 100 / (100 + st.def)) * 100)} %`, `dégâts reçus ${T.foeHits ? Math.round(T.taken / T.foeHits) : '—'}`),
    box('⚡', 'Vitesse', `×${speedRatio}`, 'actions par coup reçu'),
    box('❤', 'Soins', T.heal, `PV max ${E.maxHp(st, hero.level)}`),
  ].join('');
}

function onTrainingEntry(e) {
  if (!T || e.type !== 'action') return;
  if (e.actor === 0) {
    T.acts++;
    for (const r of e.results) {
      if (r.target === 1 && r.type === 'hit') { T.hits++; T.dmg += r.dmg; if (r.crit) T.crits++; T.maxHit = Math.max(T.maxHit, r.dmg); }
      if (r.target === 0 && r.type === 'heal') T.heal += r.amount;
    }
  } else {
    T.foeActs++;
    for (const r of e.results) {
      if (r.target === 0 && r.type === 'hit') { T.foeHits++; T.taken += r.dmg; }
      if (r.target === 0 && r.type === 'dodge') T.dodges++;
    }
  }
  const el = document.getElementById('train-stats');
  if (el) el.innerHTML = trainingStatsHtml();
}

function startTraining() {
  const cv = document.getElementById('train-cv');
  if (!cv) return;
  resetTraining();
  stopPreviews.push(playTraining(cv, () => {
    const me = mySnap();
    const foe = dummySnap(hero.level);
    return { me, foe, result: E.simulate(me, foe, (Math.random() * 2 ** 31) | 0, { maxActions: 30, timeoutWinner: false }) };
  }, { onEntry: onTrainingEntry }));
}

function tabBtn(id, label, badge) {
  return `<button class="tab ${tab === id || PARENT[tab] === id ? 'on' : ''}" data-act="tab" data-id="${id}">
    <canvas class="px" data-tabicon="${id}"></canvas>${label}
    <span class="badge" id="badge-${id}" ${badge > 0 ? '' : 'hidden'}>${badge}</span></button>`;
}
function paintTabIcons() {
  const src = {
    hero: () => heroPortrait(hero.classId, CLASSES[hero.classId].weapon, hero.dye),
    combat: () => itemIcon('loic_weapon'),
    social: () => itemIcon('tom_weapon'),
    shop: () => clatCanvas(),
    chests: () => chestCanvas('normal', false),
    bag: () => itemIcon('simon_armor'),
    fights: () => itemIcon('loic_weapon'),
    dungeons: () => monsterCanvas('skeleton'),
    war: () => itemIcon('guillaume_weapon'),
  };
  app.querySelectorAll('canvas[data-tabicon]').forEach(c => paint(c, src[c.dataset.tabicon](), { scale: 2 }));
}

function countFusable() {
  const seen = new Set();
  let n = 0;
  for (const it of hero.inventory) {
    const key = it.itemId + ':' + it.rarity;
    if (seen.has(key) || it.rarity >= RARITIES.length - 1) continue;
    seen.add(key);
    if (E.stackOf(hero, it.itemId, it.rarity).length >= 2) n++;
  }
  return n;
}

// ------------------------------ Création / connexion ------------------------------
const classGrid = () => `
  <div class="class-grid">
    ${Object.entries(CLASSES).map(([id, c]) => `
      <button class="class-card ${pickedClass === id ? 'sel' : ''}" data-act="pickClass" data-id="${id}">
        <canvas class="px" data-portrait="${id}"></canvas>
        <b>${c.name}</b><small>${c.desc}</small>
      </button>`).join('')}
  </div>`;

function renderCreate() {
  app.innerHTML = `
    <div class="create">
      <h1 class="logo">FUZE<span>ARENA</span></h1>
      <p class="lead">Choisis ta classe. Tu pourras la faire évoluer jusqu’au niveau 100.</p>
      ${classGrid()}
      <label class="field">Ton pseudo
        <input id="hero-name" maxlength="14" placeholder="ex : Tu sais ce que c'est un pseudo" autocomplete="off">
      </label>
      <button class="btn primary block" data-act="create">Commencer l’aventure</button>
    </div>`;
  hydrate(app);
}

function renderAuth(msg = '') {
  const signup = authMode === 'signup';
  app.innerHTML = `
    <div class="create">
      <h1 class="logo">FUZE<span>ARENA</span></h1>
      <div class="seg">
        <button class="${signup ? 'on' : ''}" data-act="authMode" data-mode="signup">Créer mon compte</button>
        <button class="${!signup ? 'on' : ''}" data-act="authMode" data-mode="login">Me connecter</button>
      </div>
      ${signup ? `<p class="lead">Choisis la classe de ton premier personnage.</p>${classGrid()}` : '<p class="lead">Content de te revoir !</p>'}
      <label class="field">Pseudo
        <input id="auth-pseudo" maxlength="14" placeholder="ex : Tu sais ce que c'est un pseudo" autocomplete="username">
      </label>
      <label class="field">Mot de passe (6 caractères minimum)
        <input id="auth-pass" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}">
      </label>
      ${msg ? `<p class="auth-msg">${esc(msg)}</p>` : ''}
      <button class="btn primary block" data-act="auth" id="auth-btn">${signup ? 'Créer mon compte' : 'Me connecter'}</button>
    </div>`;
  hydrate(app);
}

async function doAuth() {
  const pseudo = (document.getElementById('auth-pseudo').value || '').trim();
  const pass = document.getElementById('auth-pass').value || '';
  if (!pseudo || pass.length < 6) { renderAuth('Entre un pseudo et un mot de passe de 6 caractères minimum.'); return; }
  const btn = document.getElementById('auth-btn');
  btn.disabled = true; btn.textContent = 'Connexion…';
  try {
    let row;
    if (authMode === 'signup') {
      row = await NET.signUp(pseudo, pass, E.newAccount(pseudo, pickedClass));
    } else {
      row = await NET.signIn(pseudo, pass);
      if (!row.data) { row.data = E.newAccount(row.pseudo || pseudo, pickedClass); await NET.createRow(row.pseudo || pseudo, row.data); }
    }
    acc = E.migrate(row.data);
    acc.pseudo = row.pseudo || acc.pseudo;
    await refreshPlayers();
    initChat().then(() => render());
    initLive().then(() => softRender());
    tab = authMode === 'signup' ? 'chests' : 'hero';
    render();
    toast(authMode === 'signup' ? 'Bienvenue ! Tu as 2 coffres à ouvrir.' : `Salut ${acc.pseudo} !`);
  } catch (e) {
    renderAuth(e.message);
  }
}

// ------------------------------ Panoplies ------------------------------
const bonusText = (b) => Object.entries(b).map(([k, v]) => `+${Math.round(v * 100)} % ${STATS[k].name}`).join(', ');

function setBox(setId) {
  const set = SETS[setId];
  const active = E.activeSets(hero).find(a => a.setId === setId);
  const n = active ? active.count : 0;
  return `
    <div class="set-box">
      <div class="row"><b>${set.name}</b><span class="spacer"></span><span class="pill ${n >= 3 ? 'gold' : ''}">${n} / 5 portées</span></div>
      <div class="set-line ${n >= 3 ? 'on' : ''}">3 pièces : ${bonusText(set.bonus3)}</div>
      <div class="set-line ${n >= 5 ? 'on' : ''}">5 pièces : ${bonusText(set.bonus5)}</div>
    </div>`;
}

// ------------------------------ Vue Héros ------------------------------
function viewHero() {
  const st = E.computeStats(hero);
  const base = E.computeStats({ ...hero, equipped: {} });
  const hp = E.maxHp(st, hero.level);
  const pts = E.freePoints(hero);
  const snap = E.snapshot(hero);
  const eq = E.equippedItems(hero);
  const all = E.classSpells(hero.classId);
  const active = hero.spells.map(id => SPELLS[id]).filter(Boolean);
  const others = all.filter(s => !hero.spells.includes(s.id));
  const need = E.xpForLevel(hero.level);
  return `
    <section class="card train">
      <div class="row"><h2 style="margin:0">Entraînement</h2><span class="spacer"></span><span class="pill">Tes stats en action</span></div>
      <div class="train-wrap"><canvas id="train-cv"></canvas></div>
      <div class="train-stats" id="train-stats">${trainingStatsHtml()}</div>
    </section>

    <section class="card chars">
      <div class="row"><h2 style="margin:0">Mes personnages</h2><span class="spacer"></span><span class="pill">${acc.heroes.length} / ${E.MAX_HEROES}</span></div>
      <div class="char-row">
        ${acc.heroes.map((h, i) => `
          <button class="char ${i === acc.active ? 'on' : ''}" data-act="switchHero" data-i="${i}">
            ${h.chest.stored + h.dungeon.stored ? `<span class="badge" title="Coffres + donjons dispo">${h.chest.stored + h.dungeon.stored}</span>` : ''}
            <canvas class="px" data-portrait="${h.classId}" data-dye="${h.dye || ''}"></canvas>
            <b>${CLASSES[h.classId].name}</b><small>Nv.${h.level}</small>
          </button>`).join('')}
        ${acc.heroes.length < E.MAX_HEROES ? '<button class="char add" data-act="newHeroModal"><span>+</span><small>Nouveau</small></button>' : ''}
      </div>
      <p class="hint" style="margin:10px 0 0">Chaque personnage a son niveau, ses objets, ses coffres et ses donjons. Quand tu attaques, c’est ton perso <b>actif</b> qui combat. Quand on t’attaque, c’est ton perso <b>le plus fort</b> qui défend.</p>
    </section>

    <section class="card hero-card">
      <div class="hero-stage"><canvas class="px" data-hero="${hero.classId}" data-pet="${eq.pet ? eq.pet.itemId : ''}" data-dye="${hero.dye || ''}"></canvas></div>
      <div class="hero-meta">
        <div class="cls">${nameHtml(acc.pseudo, acc)} ${titleHtml(acc)}</div>
        <div class="cls">${CLASSES[hero.classId].name}${acc.heroes.length > 1 && E.strongestHero(acc) === hero ? ' · <span style="color:var(--gold)">défenseur</span>' : ''}</div>
        <div class="lvl">Nv.${hero.level}</div>
        <div class="xp">${hero.level >= MAX_LEVEL ? 'Niveau max !' : `XP ${hero.xp} / ${need}`}</div>
        <div class="big">❤ ${hp} PV</div>
        <div class="row" style="flex-wrap:wrap;gap:6px">
          <span class="pill gold">Puissance ${E.powerScore(snap)}</span>
          <span class="pill">${hero.stats.wins} V · ${hero.stats.losses} D</span>
          <span class="pill clat"><canvas class="px" data-clat></canvas>${acc.clat}</span>
          ${E.getXpBonus() > 1 ? `<span class="pill green">Rattrapage +${Math.round((E.getXpBonus() - 1) * 100)} % XP</span>` : ''}
          ${acc.war.section ? `<span class="pill" style="color:${WAR.sections[acc.war.section].color}">${WAR.sections[acc.war.section].name}</span>` : ''}
          ${acc.titles.warHero ? `<span class="pill gold">⚔ Héros de guerre ×${acc.titles.warHero}</span>` : ''}
        </div>
      </div>
    </section>
    ${E.activeSets(hero).filter(a => a.bonus).map(a => `
      <section class="card set-active">
        <b>${SETS[a.setId].name}</b> <span class="pill gold">${a.count} pièces</span>
        <div class="set-line on">${bonusText(a.bonus)}</div>
      </section>`).join('')}

    <section class="card">
      <h2>Caractéristiques</h2>
      <p class="hint">${pts > 0 ? `<b style="color:var(--green)">${pts} point${pts > 1 ? 's' : ''} à placer</b>. ` : ''}Tu gagnes 3 points à chaque niveau.</p>
      ${STAT_KEYS.map(k => `
        <div class="stat-row">
          <span class="stat-dot" style="background:${STATS[k].color}"></span>
          <div style="flex:1;min-width:0">
            <div class="stat-name">${STATS[k].name}</div>
            <div class="stat-desc">${STATS[k].desc}</div>
          </div>
          <div class="stat-val">${st[k]}${st[k] - base[k] > 0 ? `<small>+${st[k] - base[k]} équip.</small>` : ''}</div>
          <button class="plus" data-act="addStat" data-k="${k}" ${pts > 0 ? '' : 'disabled'}>+</button>
        </div>`).join('')}
      <div class="derived">
        <span class="pill">Critique ${Math.round(E.critChance(st.lck) * 100)} %</span>
        <span class="pill">Esquive ${Math.round(E.dodgeChance(st.lck) * 100)} %</span>
        <span class="spacer"></span>
        ${E.spentPoints(hero) > 0 ? `<button class="btn small" data-act="resetStats">Replacer mes points</button>` : ''}
      </div>
    </section>

    <section class="card">
      <h2>Sorts</h2>
      <p class="hint">Ton héros se bat tout seul. Il lance ses sorts actifs <b>dans cet ordre</b> dès qu’ils sont prêts (max ${MAX_ACTIVE_SPELLS}). Sinon, il fait une attaque de base.</p>
      ${active.map((s, i) => `
        <div class="spell">
          <div class="num">${i + 1}</div>
          <div class="sp-body">
            <div class="sp-name">${s.name} <span class="pill">⟳ ${s.cd} tours</span></div>
            <div class="sp-desc">${s.desc}</div>
          </div>
          <div class="sp-btns">
            <button class="ic" data-act="spellUp" data-id="${s.id}" ${i === 0 ? 'disabled' : ''} aria-label="Monter">▲</button>
            <button class="ic" data-act="spellDown" data-id="${s.id}" ${i === active.length - 1 ? 'disabled' : ''} aria-label="Descendre">▼</button>
            <button class="ic" data-act="spellOff" data-id="${s.id}" aria-label="Retirer">✕</button>
          </div>
        </div>`).join('') || '<p class="empty">Aucun sort actif.</p>'}
      ${others.length ? `<div class="sub">AUTRES SORTS</div>` : ''}
      ${others.map(s => {
        const locked = s.lvl > hero.level;
        return `
        <div class="spell ${locked ? 'locked' : ''}">
          <div class="num">${locked ? '🔒' : '+'}</div>
          <div class="sp-body">
            <div class="sp-name">${s.name} ${locked ? `<span class="pill">Niveau ${s.lvl}</span>` : `<span class="pill">⟳ ${s.cd} tours</span>`}</div>
            <div class="sp-desc">${s.desc}</div>
          </div>
          ${locked ? '' : `<button class="btn small green" data-act="spellOn" data-id="${s.id}" ${active.length >= MAX_ACTIVE_SPELLS ? 'disabled' : ''}>Activer</button>`}
        </div>`;
      }).join('')}
    </section>`;
}

// ------------------------------ Vue Coffres ------------------------------
function viewChests() {
  const n = hero.chest.stored;
  const wait = E.nextChestIn(hero);
  const odds = (kind) => CHEST_ODDS[kind].map((p, r) => p > 0 ? `<span class="pill" style="color:${RARITIES[r].color}">${RARITIES[r].name} ${p}%</span>` : '').join('');
  return `
    <section class="card chest-card ${n > 0 ? 'has' : ''}">
      <h2 style="margin:0">Coffre</h2>
      <canvas class="px" data-chest="normal"></canvas>
      <div class="count">${n} / ${CHEST_MAX}</div>
      <div class="timer" data-timer="chest">${n >= CHEST_MAX ? 'Stock plein ! Ouvre-les vite.' : `Prochain coffre dans <b>${fmt(wait)}</b>`}</div>
      <button class="btn primary block" data-act="openChest" data-kind="normal" ${n > 0 ? '' : 'disabled'}>Ouvrir</button>
      <div class="odds">${odds('normal')}</div>
    </section>

    <section class="card chest-card combat ${acc.combatChests > 0 ? 'has' : ''}">
      <h2 style="margin:0">Coffre de combat</h2>
      <canvas class="px" data-chest="combat"></canvas>
      <div class="count">${acc.combatChests}</div>
      <div class="timer">Gagne ${WINS_PER_COMBAT_CHEST} combats pour en obtenir un. Il contient 2 objets !</div>
      <div class="pips">${Array.from({ length: WINS_PER_COMBAT_CHEST }, (_, i) => `<div class="pip ${i < acc.winProgress ? 'on' : ''}"></div>`).join('')}</div>
      <button class="btn danger block" data-act="openChest" data-kind="combat" ${acc.combatChests > 0 ? '' : 'disabled'}>Ouvrir</button>
      <div class="odds">${odds('combat')}</div>
    </section>

    <section class="card chest-card war ${acc.warChests > 0 ? 'has' : ''}">
      <h2 style="margin:0">Coffre de guerre</h2>
      <canvas class="px" data-chest="war"></canvas>
      <div class="count">${acc.warChests}</div>
      <div class="timer">Gagné par la section victorieuse chaque semaine. Il contient ${WAR.warChestItems} objets, jamais de Commun !</div>
      <button class="btn block" style="background:linear-gradient(#c58bff,#7a3fd0)" data-act="openChest" data-kind="war" ${acc.warChests > 0 ? '' : 'disabled'}>Ouvrir</button>
      <div class="odds">${odds('war')}</div>
    </section>`;
}

// ------------------------------ Vue Sac ------------------------------
function stacks() {
  const map = new Map();
  const eqUids = new Set(Object.values(hero.equipped));
  for (const it of hero.inventory) {
    const key = it.itemId + ':' + it.rarity;
    if (!map.has(key)) map.set(key, { itemId: it.itemId, rarity: it.rarity, items: [], equipped: false });
    const s = map.get(key);
    s.items.push(it);
    if (eqUids.has(it.uid)) s.equipped = true;
  }
  return [...map.values()].sort((a, b) => b.rarity - a.rarity || SLOT_ORDER.indexOf(ITEMS[a.itemId].slot) - SLOT_ORDER.indexOf(ITEMS[b.itemId].slot) || a.itemId.localeCompare(b.itemId));
}

function viewBag() {
  const eq = E.equippedItems(hero);
  const st = stacks();
  return `
    <section class="card">
      <h2>Équipement</h2>
      <div class="slots">
        ${SLOT_ORDER.map(slot => {
          const it = eq[slot];
          return it
            ? `<button class="slot filled" style="--rc:${RARITIES[it.rarity].color}" data-act="item" data-id="${it.itemId}" data-r="${it.rarity}"><canvas class="px" data-icon="${it.itemId}"></canvas>${SLOTS[slot].name}</button>`
            : `<div class="slot">${SLOTS[slot].name}<br>—</div>`;
        }).join('')}
      </div>
    </section>
    <section class="card">
      <h2>Sac <span style="color:var(--muted)">(${hero.inventory.length})</span></h2>
      <p class="hint">2 objets identiques = 1 objet de rareté supérieure. Touche un objet pour l’équiper ou le fusionner.</p>
      ${st.length ? `<div class="inv">
        ${st.map(s => `
          <button class="it" style="--rc:${RARITIES[s.rarity].color}" data-act="item" data-id="${s.itemId}" data-r="${s.rarity}">
            <canvas class="px" data-icon="${s.itemId}"></canvas>
            ${s.items.length > 1 ? `<span class="n">x${s.items.length}</span>` : ''}
            ${s.equipped ? '<span class="eq">ÉQUIPÉ</span>' : ''}
            ${s.items.length >= 2 && s.rarity < RARITIES.length - 1 ? '<span class="fu">✦</span>' : ''}
          </button>`).join('')}
      </div>` : '<p class="empty">Ton sac est vide. Va ouvrir des coffres !</p>'}
    </section>`;
}

function statLines(stats, compare = null) {
  const keys = STAT_KEYS.filter(k => (stats[k] || 0) || (compare && compare[k]));
  return keys.map(k => {
    const v = stats[k] || 0;
    let diff = '';
    if (compare) {
      const d = v - (compare[k] || 0);
      if (d) diff = ` <span class="${d > 0 ? 'up' : 'down'}">(${d > 0 ? '+' : ''}${d})</span>`;
    }
    return `<div class="st-line"><span style="color:${STATS[k].color}">${STATS[k].name}</span><span>+${v}${diff}</span></div>`;
  }).join('');
}

function openItem(itemId, rarity) {
  const it = ITEMS[itemId];
  const stack = E.stackOf(hero, itemId, rarity);
  if (!stack.length) { closeModal(); render(); return; }
  const stats = E.itemStats(itemId, rarity);
  const slot = it.slot;
  const curUid = hero.equipped[slot];
  const isEq = stack.some(s => s.uid === curUid);
  const cur = !isEq && curUid ? hero.inventory.find(i => i.uid === curUid) : null;
  const curStats = cur ? E.itemStats(cur.itemId, cur.rarity) : null;
  const canFuse = stack.length >= 2 && rarity < RARITIES.length - 1;
  const R = RARITIES[rarity];
  const next = RARITIES[rarity + 1];
  openModal(`
    <div class="item-head">
      <div class="big-ic" style="--rc:${R.color}"><canvas class="px" data-icon="${itemId}"></canvas></div>
      <div>
        <h3>${esc(it.name)}</h3>
        <div class="rar" style="color:${R.color}">${R.name}</div>
        <div style="color:var(--muted);font-size:13px;margin-top:6px">${SLOTS[slot].name} · ${stack.length} exemplaire${stack.length > 1 ? 's' : ''}</div>
      </div>
    </div>
    ${statLines(stats, curStats)}
    ${it.set ? setBox(it.set) : ''}
    ${cur ? `<p class="hint" style="margin-top:8px">Comparé à ton ${SLOTS[slot].name.toLowerCase()} actuel : ${esc(ITEMS[cur.itemId].name)} (${RARITIES[cur.rarity].name})</p>` : ''}
    ${canFuse ? `
      <div class="fuse-box">
        <div style="font-weight:800">Fusion disponible !</div>
        <div class="fuse-anim" id="fuse-anim">
          <div class="it" style="--rc:${R.color}"><canvas class="px" data-icon="${itemId}"></canvas></div>
          <b>+</b>
          <div class="it" style="--rc:${R.color}"><canvas class="px" data-icon="${itemId}"></canvas></div>
          <b>→</b>
          <div class="it" style="--rc:${next.color}"><canvas class="px" data-icon="${itemId}"></canvas></div>
        </div>
        ${statLines(E.itemStats(itemId, rarity + 1), stats)}
        <button class="btn block" style="margin-top:12px;background:linear-gradient(#c58bff,#8c3fe0)" data-act="fuse" data-id="${itemId}" data-r="${rarity}">Fusionner en ${next.name}</button>
      </div>` : (rarity < RARITIES.length - 1 ? `<p class="hint" style="margin-top:12px">Trouve un 2ᵉ exemplaire pour le fusionner en <b style="color:${next.color}">${next.name}</b>.</p>` : `<p class="hint" style="margin-top:12px">Rareté maximale !</p>`)}
    <div class="close-row">
      ${isEq
        ? `<button class="btn" data-act="unequip" data-slot="${slot}">Retirer</button>`
        : `<button class="btn primary" data-act="equip" data-id="${itemId}" data-r="${rarity}">Équiper</button>`}
      <button class="btn" data-act="closeModal">Fermer</button>
    </div>`);
}

// ------------------------------ Vue Combats ------------------------------
function viewFights() {
  const list = opponents();
  const left = list.filter(o => !o.done).length;
  return `
    <section class="card">
      <h2>Arène du jour</h2>
      <p class="hint">Un combat classé par adversaire et par jour. ${WINS_PER_COMBAT_CHEST} victoires = 1 coffre de combat. Ensuite, tu peux faire des <b>revanches</b> pour le fun : la 1ʳᵉ revanche gagnée contre chaque adversaire rapporte 1 Pierre Clat par jour.</p>
      <div class="row" style="flex-wrap:wrap;gap:6px">
        <span class="pill gold">${left} combat${left > 1 ? 's' : ''} restant${left > 1 ? 's' : ''}</span>
        <span class="pill clat"><canvas class="px" data-clat></canvas>${acc.clat} Pierre${acc.clat > 1 ? 's' : ''} Clat</span>
        <span class="pill">Coffre de combat ${acc.winProgress}/${WINS_PER_COMBAT_CHEST}</span>
        <span class="pill" data-timer="day">Nouveaux combats dans ${fmt(msToMidnight())}</span>
      </div>
    </section>
    <section class="card">
      <h2>Adversaires</h2>
      ${list.length ? '' : `<p class="empty">${NET.online ? 'Personne d’autre n’est encore inscrit. Invite tes potes !' : 'Aucun adversaire.'}</p>`}
      ${list.map(o => `
        <div class="opp ${o.done ? 'done' : ''}">
          <div class="av"><canvas class="px" data-portrait="${o.classId}" data-dye="${o.dye || ''}"></canvas></div>
          <div class="o-body">
            <div class="o-name">${nameHtml(o.name, o.data)} ${titleHtml(o.data)}</div>
            <div class="o-sub">${CLASSES[o.classId].name} · Nv.${o.level} · Puissance ${E.powerScore(o.snap)}</div>
          </div>
          ${o.done
            ? `<div class="done-col"><span class="pill ${o.done === 'win' ? 'green' : 'red'}">${o.done === 'win' ? 'VICTOIRE' : 'DÉFAITE'}</span>
               <button class="btn small" data-act="friendly" data-id="${o.id}">Revanche</button></div>`
            : `<button class="btn small primary" data-act="fight" data-id="${o.id}">Combattre</button>`}
        </div>`).join('')}
    </section>`;
}

// ------------------------------ Vue Donjons ------------------------------
function viewDungeons() {
  const n = hero.dungeon.stored;
  return `
    <section class="card">
      <h2>Donjons</h2>
      <p class="hint">Bats le boss pour gagner de l’XP et 1 objet. Plus le donjon est haut, plus l’XP et les objets sont bons. Même en cas de défaite, tu gagnes un peu d’XP.</p>
      <div class="row" style="flex-wrap:wrap;gap:6px">
        <span class="pill gold">Entrées : ${n} / ${DUNGEON_MAX}</span>
        <span class="pill" data-timer="dungeon">${n >= DUNGEON_MAX ? 'Entrées au maximum' : `Prochaine entrée dans ${fmt(E.nextDungeonIn(hero))}`}</span>
      </div>
    </section>
    <section class="card">
      ${DUNGEONS.map(d => {
        const locked = hero.level < d.lvl;
        const clears = hero.dungeonClears[d.id] || 0;
        return `
        <div class="opp dj ${locked ? 'locked' : ''}">
          <div class="av"><canvas class="px" data-monster="${d.sprite}"></canvas></div>
          <div class="o-body">
            <div class="o-name">${d.name}</div>
            <div class="o-sub">${d.boss} · Nv.${d.lvl}${clears ? ` · vaincu ${clears}×` : ''}</div>
            ${locked ? '' : `<div class="o-sub" style="color:var(--gold)">+${E.dungeonXp(d)} XP · 1 objet</div>`}
          </div>
          ${locked
            ? `<span class="pill">🔒 Nv.${d.lvl}</span>`
            : `<button class="btn small danger" data-act="dungeon" data-id="${d.id}" ${n > 0 ? '' : 'disabled'}>Entrer</button>`}
        </div>`;
      }).join('')}
    </section>`;
}

// ------------------------------ Vue Classement ------------------------------
function rankingEntries() {
  ensureDay();
  const wins = (a) => a.heroes.reduce((t, h) => t + h.stats.wins, 0);
  const tow = (a) => Math.max(0, ...a.heroes.map(h => (h.tower && h.tower.best) || 0));
  const sh = E.strongestHero(acc);
  const me = { name: acc.pseudo, data: acc, classId: sh.classId, dye: sh.dye, level: sh.level, wins: wins(acc), tower: tow(acc), me: true };
  let rest;
  if (NET.online) {
    rest = players.map(p => { const h = E.strongestHero(p.data); return { name: p.pseudo, data: p.data, classId: h.classId, dye: h.dye, level: h.level, wins: wins(p.data), tower: tow(p.data) }; });
  } else {
    const totalMine = hero.stats.wins + hero.stats.losses;
    rest = opponents().map(o => {
      const r = makeRng(hashStr('rank' + o.id));
      return { name: o.name, classId: o.classId, level: o.level, wins: Math.round(totalMine * (0.3 + r() * 0.6)), tower: Math.round(o.level * 0.75) };
    });
  }
  const key = rankMode;
  return [me, ...rest].sort((a, b) => b[key] - a[key] || (b.me ? 1 : 0) - (a.me ? 1 : 0));
}

function viewRanking() {
  const list = rankingEntries();
  const key = rankMode;
  const medal = ['🥇', '🥈', '🥉'];
  return `
    <section class="card">
      <h2>Classement</h2>
      <div class="seg seg3">
        <button class="${rankMode === 'level' ? 'on' : ''}" data-act="rank" data-mode="level">Niveau</button>
        <button class="${rankMode === 'wins' ? 'on' : ''}" data-act="rank" data-mode="wins">Victoires</button>
        <button class="${rankMode === 'tower' ? 'on' : ''}" data-act="rank" data-mode="tower">Tour</button>
      </div>
      <p class="hint" style="margin-top:12px">${NET.online ? 'Niveau du personnage le plus fort · victoires de tous les personnages · meilleur étage de la tour.' : 'Hors ligne : tes amis sont des bots.'}</p>
      ${list.map((e, i) => `
        <div class="opp rank ${e.me ? 'me' : ''}">
          <div class="pos">${medal[i] || i + 1}</div>
          <div class="av"><canvas class="px" data-portrait="${e.classId}" data-dye="${e.dye || ''}"></canvas></div>
          <div class="o-body">
            <div class="o-name">${nameHtml(e.name, e.data)}${e.me ? ' <span class="pill gold">toi</span>' : ''}</div>
            <div class="o-sub">${CLASSES[e.classId].name} ${titleHtml(e.data)}</div>
          </div>
          <div class="score">${key === 'level' ? `Nv.${e.level}` : key === 'wins' ? `${e.wins} V` : `Étage ${e.tower}`}</div>
        </div>`).join('')}
    </section>`;
}

// ------------------------------ Vue Guerre ------------------------------
const fmtLong = (ms) => { const d = Math.floor(ms / 86400000); return (d > 0 ? `${d} j ` : '') + fmt(ms % 86400000); };
const secTag = (sec) => `<b style="color:${WAR.sections[sec].color}">${WAR.sections[sec].name}</b>`;

const WAR_RULES = () => `
  <details class="rules">
    <summary>Règles de la guerre</summary>
    <ul>
      <li>2 sections de ${WAR.maxPerSection} joueurs maximum. Chacun choisit la sienne. Un changement possible par mois.</li>
      <li>Une guerre dure une semaine, du lundi 00:00 au dimanche 23:59.</li>
      <li>${WAR.attacksPerDay} attaques de guerre par jour, contre les membres de l’autre section (1 fois max par adversaire et par jour).</li>
      <li>Victoire contre plus fort que toi : <b>+3 pts</b>. Contre un niveau égal : <b>+2</b>. Contre plus faible : <b>+1</b>.</li>
      <li>Si ton attaque échoue, la section adverse gagne <b>+1 pt</b> de défense.</li>
      <li>Fin de semaine : la section avec le plus de points gagne. Ses membres ayant fait au moins ${WAR.minAttacks} attaques reçoivent un <b>Coffre de guerre</b> (${WAR.warChestItems} objets, jamais de Commun).</li>
      <li>La section perdante (${WAR.minAttacks} attaques minimum) reçoit 1 coffre de combat. En cas d’égalité, tout le monde a un coffre de combat.</li>
      <li>Le meilleur marqueur de la semaine devient <b>Héros de guerre</b> et reçoit un coffre de guerre en plus.</li>
    </ul>
  </details>`;

function viewWar() {
  const war = acc.war;
  if (!war.section) {
    return `
      <section class="card">
        <h2>Guerre des sections</h2>
        <p class="hint">Choisis ton camp ! Chaque semaine, les deux sections s’affrontent. La section gagnante remporte un coffre de guerre, le meilleur coffre du jeu.</p>
        <div class="sec-pick">
          ${Object.entries(WAR.sections).map(([id, s]) => `
            <button class="sec-card" style="--sc:${s.color}" data-act="joinSection" data-sec="${id}">
              <span class="flag"></span><b>${s.name}</b>
              <small>${NET.online ? `${E.sectionCount(acc, id, players)} / ${WAR.maxPerSection} joueurs` : 'Rejoindre'}</small>
            </button>`).join('')}
        </div>
        ${WAR_RULES()}
      </section>`;
  }
  const mine = war.section, other = E.otherSide(mine);
  const { score, members } = E.warStandings(acc, E.weekKey(), others());
  const total = Math.max(1, score[mine] + score[other]);
  const enemies = opponents().filter(o => o.section === other);
  const allies = members.filter(m => m.section === mine);
  const wk = E.warWeek(acc);
  const myPower = E.powerScore(E.snapshot(hero));
  const left = WAR.attacksPerDay - Object.keys(war.done).length;
  const p = war.pending;
  const outcomeTxt = p && ({ win: 'Victoire de ta section !', loss: 'Défaite de ta section…', tie: 'Égalité !' }[p.outcome]);
  return `
    ${p ? `
      <section class="card war-reward">
        <h2>Résultat de la semaine dernière</h2>
        <div class="big-res">${outcomeTxt}</div>
        <p class="hint">${p.mine} pts contre ${p.theirs}. Tu as marqué ${p.points} pts en ${p.attacks} attaque${p.attacks > 1 ? 's' : ''}.${p.mvp ? ' Tu es le <b>Héros de guerre</b> de la semaine !' : ''}${!p.eligible ? ` Il fallait ${WAR.minAttacks} attaques minimum pour la récompense.` : ''}</p>
        <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:12px">
          ${p.warChests ? `<span class="pill gold">${p.warChests} coffre${p.warChests > 1 ? 's' : ''} de guerre</span>` : ''}
          ${p.combatChests ? `<span class="pill red">1 coffre de combat</span>` : ''}
          ${!p.warChests && !p.combatChests ? '<span class="pill">Pas de récompense</span>' : ''}
        </div>
        <button class="btn primary block" data-act="claimWar">${p.warChests || p.combatChests ? 'Récupérer' : 'OK'}</button>
      </section>` : ''}
    <section class="card">
      <h2>Guerre de la semaine</h2>
      <div class="score-row">
        <div>${secTag(mine)}<div class="sc">${score[mine]}</div></div>
        <div class="vs">VS</div>
        <div style="text-align:right">${secTag(other)}<div class="sc">${score[other]}</div></div>
      </div>
      <div class="score-bar"><div style="width:${(score[mine] / total) * 100}%;background:${WAR.sections[mine].color}"></div><div style="flex:1;background:${WAR.sections[other].color}"></div></div>
      <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:12px">
        <span class="pill" data-timer="week">Fin dans ${fmtLong(E.msToWeekEnd())}</span>
        <span class="pill gold">Tes points : ${wk.points}</span>
        <span class="pill ${wk.attacks >= WAR.minAttacks ? 'green' : ''}">Attaques : ${wk.attacks}/${WAR.minAttacks} min.</span>
      </div>
    </section>
    <section class="card">
      <h2>Attaquer · ${left} restante${left > 1 ? 's' : ''} aujourd’hui</h2>
      ${enemies.length ? '' : '<p class="empty">Personne dans l’autre section pour l’instant.</p>'}
      ${enemies.map(o => {
        const done = war.done[o.id];
        const pts = E.warPoints(myPower, E.powerScore(o.snap));
        return `
        <div class="opp ${done ? 'done' : ''}">
          <div class="av"><canvas class="px" data-portrait="${o.classId}"></canvas></div>
          <div class="o-body">
            <div class="o-name">${esc(o.name)}</div>
            <div class="o-sub">${CLASSES[o.classId].name} · Nv.${o.level} · Puissance ${E.powerScore(o.snap)}</div>
          </div>
          ${done
            ? `<span class="pill ${done === 'win' ? 'green' : 'red'}">${done === 'win' ? 'GAGNÉ' : 'PERDU'}</span>`
            : `<button class="btn small danger" data-act="warAttack" data-id="${o.id}" ${left > 0 ? '' : 'disabled'}>+${pts} pts</button>`}
        </div>`;
      }).join('')}
    </section>
    <section class="card">
      <h2>Ta section</h2>
      <div class="opp rank me"><div class="o-body"><div class="o-name">${esc(acc.pseudo)} <span class="pill gold">toi</span></div></div><div class="score">${wk.points} pts</div></div>
      ${allies.map(m => `
        <div class="opp rank"><div class="av"><canvas class="px" data-portrait="${m.classId}"></canvas></div>
          <div class="o-body"><div class="o-name">${nameHtml(m.name, m.data)}</div><div class="o-sub">${CLASSES[m.classId].name}</div></div>
          <div class="score">${m.points} pts</div></div>`).join('')}
      ${war.log.length ? `<div class="sub">TES ATTAQUES</div>${war.log.map(l => `<div class="log-line">${l.won ? '✅' : '❌'} ${esc(l.name)} ${l.won ? `<b>+${l.pts}</b>` : '(+1 pour eux)'}</div>`).join('')}` : ''}
      ${WAR_RULES()}
      <button class="btn small" style="margin-top:12px" data-act="changeSection">Changer de section</button>
    </section>`;
}

function startWarAttack(foeId) {
  E.ensureWar(acc, others());
  const war = acc.war;
  if (war.done[foeId] || Object.keys(war.done).length >= WAR.attacksPerDay) return;
  const opp = opponents().find(o => o.id === foeId);
  if (!opp) return;
  const me = mySnap();
  const seed = hashStr(war.day + foeId + 'guerre' + acc.pseudo);
  const result = E.simulate(me, opp.snap, seed);
  const won = result.winner === 0;
  E.missionEvent(acc, 'war');
  logFight('war', foeId, opp.name, me, opp.snap, seed, won);
  const rw = E.warAttackResult(acc, hero, { id: foeId, name: opp.name, level: opp.level }, won, E.powerScore(me), E.powerScore(opp.snap));
  save();
  runBattle({
    me, foe: opp.snap, result, theme: 'castle', rewards: rw,
    title: `⚔ ${secTag(war.section)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    rewardsHtml: `
      <div class="rw">
        <span class="pill gold">+${rw.xp} XP</span>
        ${won ? `<span class="pill green">+${rw.pts} pts pour ta section</span>` : '<span class="pill red">+1 pt pour la section adverse</span>'}
      </div>`,
  });
}

// ------------------------------ Tchat ------------------------------
const CHAT_SEEN = 'fuze-chat-seen';
const timeOf = (iso) => {
  const d = new Date(iso);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return E.dayKey(d) === E.dayKey() ? hm : `${d.getDate()}/${d.getMonth() + 1} ${hm}`;
};
const msgHtml = (m) => {
  const mine = m.user_id === NET.myId();
  const txt = esc(m.text).replace(/\[\[combat:(\d+)\]\]/g, '<button class="btn small" data-act="replayId" data-id="$1">▶ Revoir le combat</button>');
  return `<div class="msg ${mine ? 'me' : ''}">${mine ? '' : `<b>${nameHtml(m.pseudo, dataOfPseudo(m.pseudo))}</b>`}<span class="txt">${txt}</span><small>${timeOf(m.created_at)}</small></div>`;
};

function viewChat() {
  if (!NET.online) return '<section class="card"><h2>Tchat</h2><p class="hint">Le tchat marche seulement dans la version en ligne.</p></section>';
  return `
    <section class="card chat">
      <h2>Tchat</h2>
      <div class="chat-list" id="chat-list">${chatMsgs.length ? chatMsgs.map(msgHtml).join('') : '<p class="empty" id="chat-empty">Aucun message. Lance la discussion !</p>'}</div>
    </section>
    <div class="chat-bar">
      <input id="chat-input" maxlength="300" placeholder="Écris un message…" value="${esc(chatDraft)}" autocomplete="off" enterkeyhint="send">
      <button class="btn primary" data-act="sendChat">Envoyer</button>
    </div>`;
}

function scrollChat() { const l = document.getElementById('chat-list'); if (l) l.scrollTop = l.scrollHeight; }
function markChatSeen() {
  chatUnread = 0;
  const b = document.getElementById('chat-badge');
  if (b) b.hidden = true;
  const last = chatMsgs[chatMsgs.length - 1];
  if (last) { try { localStorage.setItem(CHAT_SEEN, last.created_at); } catch (e) { /* stockage indisponible */ } }
}

function onChatMessage(m) {
  if (chatMsgs.some(x => x.id === m.id)) return;
  chatMsgs.push(m);
  chatMsgs = chatMsgs.slice(-100);
  if (tab === 'chat' && document.getElementById('chat-list')) {
    document.getElementById('chat-empty')?.remove();
    document.getElementById('chat-list').insertAdjacentHTML('beforeend', msgHtml(m));
    scrollChat();
    markChatSeen();
  } else if (m.user_id !== NET.myId()) {
    chatUnread++;
    const b = document.getElementById('chat-badge');
    if (b) { b.hidden = false; b.textContent = chatUnread; }
    setBadge('social', chatUnread + journalUnseen);
    SFX.message();
    toast(`💬 ${m.pseudo} : ${m.text.length > 40 ? m.text.slice(0, 40) + '…' : m.text}`);
  }
}

async function initChat() {
  if (!NET.online) return;
  try {
    chatMsgs = await NET.fetchMessages();
    let seen = '';
    try { seen = localStorage.getItem(CHAT_SEEN) || ''; } catch (e) { /* stockage indisponible */ }
    chatUnread = chatMsgs.filter(m => m.user_id !== NET.myId() && m.created_at > seen).length;
    await NET.subscribeChat(onChatMessage);
  } catch (e) { /* le tchat est optionnel : le jeu continue sans */ }
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const text = (input && input.value || '').trim();
  if (!text) return;
  input.value = ''; chatDraft = '';
  try { onChatMessage(await NET.sendMessage(acc.pseudo, text)); E.missionEvent(acc, 'chat'); save(); }
  catch (e) { toast(e.message); input.value = text; chatDraft = text; }
}

// ------------------------------ Apparences ------------------------------
const cosOf = (data) => (data && data.cosmetics) || { owned: [], title: null, color: null, victory: null };
const titleOf = (data) => { const t = cosOf(data).title; return t && COSMETIC[t] ? COSMETIC[t].name : ''; };
const colorOf = (data) => { const c = cosOf(data).color; return c && COSMETIC[c] ? COSMETIC[c].color : null; };
const nameHtml = (name, data) => {
  const col = colorOf(data);
  return `<span class="pname ${col === 'rainbow' ? 'rainbow' : ''}" ${col && col !== 'rainbow' ? `style="color:${col}"` : ''}>${esc(name)}</span>`;
};
const titleHtml = (data) => { const t = titleOf(data); return t ? `<span class="ptitle">« ${esc(t)} »</span>` : ''; };
const dataOfPseudo = (pseudo) => (pseudo === acc.pseudo ? acc : (players.find(p => p.pseudo === pseudo) || {}).data);

/** « Photo » d'un perso pour un combat, avec ses apparences */
function snapOf(data, h, name) {
  const s = E.snapshot({ ...h, name });
  s.dye = h.dye || null;
  s.title = titleOf(data);
  s.nameColor = colorOf(data);
  return s;
}
const mySnap = () => snapOf(acc, hero, acc.pseudo);
const myVictory = () => { const v = acc.cosmetics.victory; return v && COSMETIC[v] ? COSMETIC[v].colors : null; };
const myId = () => (NET.online ? NET.myId() : 'me');
const fmtNum = (n) => Math.round(n).toLocaleString('fr-FR');
const offlineCard = (title, text) => `<section class="card"><h2>${title}</h2><p class="hint">${text}</p></section>`;
const softRender = () => { if (!modalRoot.innerHTML && !document.querySelector('.battle') && tab !== 'chat') render(); };

// ------------------------------ Navigation (hubs) ------------------------------
const PARENT = { fights: 'combat', dungeons: 'combat', tower: 'combat', raid: 'combat', war: 'combat', bets: 'combat', journal: 'social', chat: 'social', ranking: 'social' };
const PARENT_NAME = { combat: 'Combats', social: 'Social' };

function setBadge(id, n) {
  const b = document.getElementById('badge-' + id);
  if (!b) return;
  b.hidden = !(n > 0);
  b.textContent = n;
}

// ------------------------------ Missions du jour ------------------------------
function claimableMissions() {
  const list = E.ensureMissions(acc);
  return list.filter(m => !acc.missions.claimed[m.id] && (acc.missions.progress[m.id] || 0) >= m.n).length;
}

function missionsCard() {
  const list = E.ensureMissions(acc);
  const M = acc.missions;
  return `
    <section class="card missions">
      <h2>Missions du jour</h2>
      ${list.map(m => {
        const p = Math.min(m.n, M.progress[m.id] || 0);
        const done = p >= m.n, claimed = M.claimed[m.id];
        return `
        <div class="mission ${claimed ? 'claimed' : ''}">
          <div class="m-body">
            <div>${esc(m.text)}</div>
            <div class="mbar"><div style="width:${(p / m.n) * 100}%"></div></div>
          </div>
          ${claimed
            ? '<span class="pill green">✓</span>'
            : `<button class="btn small ${done ? 'green' : ''}" data-act="claimMission" data-id="${m.id}" ${done ? '' : 'disabled'}>${p}/${m.n} · +${m.reward}<canvas class="px" data-clat></canvas></button>`}
        </div>`;
      }).join('')}
      <p class="hint" style="margin:10px 0 0">Les 3 missions faites = <b>+${MISSIONS_BONUS}</b> Pierres Clat en bonus. Nouvelles missions dans <span data-timer="day2">${fmt(msToMidnight())}</span>.</p>
    </section>`;
}

// ------------------------------ Hub Combats ------------------------------
function viewCombat() {
  const fightsLeft = opponents().filter(o => !o.done).length;
  const towerLeft = TOWER.attemptsPerDay - E.towerState(hero).used;
  const raidLeft = RAID.attemptsPerDay - E.raidState(acc).used;
  const warLeft = acc.war.section ? Math.max(0, WAR.attacksPerDay - Object.keys(acc.war.done).length) : 0;
  const duels = bets.challenges.filter(c => c.status === 'pending' && c.to_id === myId()).length;
  const tiles = [
    { id: 'fights', name: 'Arène', sub: `${fightsLeft} combat${fightsLeft > 1 ? 's' : ''} restant${fightsLeft > 1 ? 's' : ''}`, icon: 'loic_weapon', badge: fightsLeft },
    { id: 'dungeons', name: 'Donjons', sub: `${hero.dungeon.stored}/${DUNGEON_MAX} entrées`, monster: 'skeleton', badge: hero.dungeon.stored },
    { id: 'tower', name: 'Tour infinie', sub: `Record : étage ${hero.tower.best}`, monster: 'golem', badge: towerLeft },
    { id: 'raid', name: `Raid : ${RAID.boss.name}`, sub: `${raidLeft}/${RAID.attemptsPerDay} assauts`, monster: RAID.boss.sprite, badge: raidLeft },
    { id: 'war', name: 'Guerre', sub: acc.war.section ? WAR.sections[acc.war.section].name : 'Choisis ton camp', icon: 'guillaume_weapon', badge: warLeft },
    { id: 'bets', name: 'Paris & duels', sub: 'Mise tes Pierres Clat', clat: true, badge: duels },
  ];
  return missionsCard() + `
    <section class="card">
      <div class="tiles">
        ${tiles.map(t => `
          <button class="tile" data-act="tab" data-id="${t.id}">
            <canvas class="px" ${t.monster ? `data-monster="${t.monster}"` : t.clat ? 'data-clat' : `data-icon="${t.icon}"`}></canvas>
            <b>${t.name}</b><small>${t.sub}</small>
            ${t.badge > 0 ? `<span class="badge">${t.badge}</span>` : ''}
          </button>`).join('')}
      </div>
    </section>`;
}

// ------------------------------ Hub Social ------------------------------
function viewSocial() {
  const tiles = [
    { id: 'journal', name: 'Journal', sub: 'Revois tes combats, venge-toi', icon: 'loic_weapon', badge: journalUnseen },
    { id: 'chat', name: 'Tchat', sub: 'Chambrer les potes', icon: 'tom_weapon', badge: chatUnread },
    { id: 'ranking', name: 'Classement', sub: 'Niveau, victoires, tour', icon: 'guillaume_hat', badge: 0 },
  ];
  return `
    <section class="card">
      <div class="tiles">
        ${tiles.map(t => `
          <button class="tile" data-act="tab" data-id="${t.id}">
            <canvas class="px" data-icon="${t.icon}"></canvas>
            <b>${t.name}</b><small>${t.sub}</small>
            ${t.badge > 0 ? `<span class="badge">${t.badge}</span>` : ''}
          </button>`).join('')}
      </div>
    </section>`;
}

// ------------------------------ Journal des combats ------------------------------
let journal = [];
let journalUnseen = 0;
const JOURNAL_SEEN = 'fuze-journal-seen';
const KIND_NAME = { arena: 'Arène', war: 'Guerre', rematch: 'Revanche', revenge: 'Vengeance' };

async function loadJournal() {
  if (!NET.online) return;
  try {
    journal = await NET.fetchMyFights();
    let seen = '';
    try { seen = localStorage.getItem(JOURNAL_SEEN) || ''; } catch (e) { /* stockage indisponible */ }
    journalUnseen = journal.filter(f => f.defender_id === NET.myId() && f.created_at > seen).length;
  } catch (e) { /* le journal est optionnel */ }
}
function markJournalSeen() {
  journalUnseen = 0;
  const top = journal.find(f => f.defender_id === NET.myId());
  if (top) { try { localStorage.setItem(JOURNAL_SEEN, top.created_at); } catch (e) { /* stockage indisponible */ } }
}

/** Enregistre un combat dans le journal (en ligne) */
function logFight(kind, foeId, foeName, me, foeSnap, seed, won) {
  if (!NET.online) return;
  const row = { defender_id: foeId, attacker_name: acc.pseudo, defender_name: foeName, kind, winner: won ? 0 : 1, seed, a_snap: me, d_snap: foeSnap };
  NET.logFight(row).then(r => journal.unshift({ ...row, ...r, attacker_id: NET.myId() })).catch(() => {});
}

function replayFight(row) {
  const result = E.simulate(row.a_snap, row.d_snap, Number(row.seed));
  const winName = result.winner === 0 ? row.attacker_name : row.defender_name;
  runBattle({
    me: row.a_snap, foe: row.d_snap, result, theme: row.kind === 'war' ? 'castle' : 'arena', rewards: null,
    title: `Rediffusion · ${esc(row.attacker_name)} <span style="color:var(--gold)">VS</span> ${esc(row.defender_name)}`,
    headline: `${winName.toUpperCase()} GAGNE !`, headClass: 'win', rewardsHtml: '',
  });
}

function viewJournal() {
  if (!NET.online) return offlineCard('Journal', 'Le journal des combats marche seulement en ligne.');
  const me = NET.myId();
  return `
    <section class="card">
      <h2>Journal des combats</h2>
      <p class="hint">Les combats où on t’a attaqué et ceux que tu as lancés. ▶ pour revoir, 💬 pour partager dans le tchat.</p>
      ${journal.length ? journal.map(f => {
        const attacked = f.defender_id === me;
        const youWon = attacked ? f.winner === 1 : f.winner === 0;
        const other = attacked ? f.attacker_name : f.defender_name;
        const otherId = attacked ? f.attacker_id : f.defender_id;
        return `
        <div class="jrow ${youWon ? 'win' : 'lose'}">
          <div class="j-body">
            <div class="j-title">${attacked ? `⚔ <b>${esc(other)}</b> t’a attaqué` : `Tu as attaqué <b>${esc(other)}</b>`}</div>
            <div class="o-sub">${KIND_NAME[f.kind] || f.kind} · ${timeOf(f.created_at)} · ${youWon ? '<span class="good">gagné</span>' : '<span class="bad">perdu</span>'}</div>
          </div>
          <div class="j-btns">
            <button class="btn small" data-act="replayLog" data-id="${f.id}" aria-label="Revoir">▶</button>
            <button class="btn small" data-act="shareLog" data-id="${f.id}" aria-label="Partager">💬</button>
            ${attacked && players.some(p => p.id === otherId) ? `<button class="btn small danger" data-act="revenge" data-id="${otherId}">Vengeance</button>` : ''}
          </div>
        </div>`;
      }).join('') : '<p class="empty">Aucun combat pour l’instant.</p>'}
    </section>`;
}

async function shareFight(id) {
  const f = journal.find(x => String(x.id) === String(id));
  if (!f) return;
  try {
    const m = await NET.sendMessage(acc.pseudo, `⚔️ ${f.attacker_name} vs ${f.defender_name} (${KIND_NAME[f.kind] || ''}) [[combat:${f.id}]]`);
    onChatMessage(m);
    E.missionEvent(acc, 'chat'); save();
    toast('Combat partagé dans le tchat !');
  } catch (e) { toast(e.message); }
}

async function replayById(id) {
  let f = journal.find(x => String(x.id) === String(id));
  if (!f) { try { f = await NET.fetchFight(id); } catch (e) { toast(e.message); return; } }
  if (f) replayFight(f); else toast('Combat introuvable.');
}

// ------------------------------ Paris & duels ------------------------------
let bets = { challenges: [], wagers: [] };
const BET_WINDOW = 86400000;
const fightAt = (c) => new Date(c.accepted_at).getTime() + BET_WINDOW;
const duelCache = {};
const duelResult = (c) => (duelCache[c.id] ||= E.simulate(c.from_snap, c.to_snap, Number(c.seed)));
const duelOdds = (c) => E.betOdds(E.powerScore(c.from_snap), E.powerScore(c.to_snap));

async function refreshBets() {
  if (!NET.online) return;
  try {
    const ch = await NET.fetchChallenges();
    const w = await NET.fetchWagers(ch.filter(c => c.status === 'accepted').map(c => c.id));
    bets = { challenges: ch, wagers: w };
  } catch (e) { toast(e.message); }
}

/** Mes gains de paris pas encore récupérés */
function pendingWinnings() {
  const me = NET.myId(), now = Date.now();
  const paid = new Set(acc.paidWagers);
  let total = 0;
  const ids = [];
  for (const c of bets.challenges) {
    if (c.status !== 'accepted' || now < fightAt(c)) continue;
    const winner = duelResult(c).winner;
    for (const w of bets.wagers) {
      if (w.challenge_id !== c.id || w.user_id !== me || paid.has(w.id)) continue;
      ids.push(w.id);
      if (w.side === winner) total += Math.round(w.amount * Number(w.odds));
    }
  }
  return { total, ids };
}

function duelSide(snap, odds, name) {
  return `
    <div class="d-side">
      <canvas class="px" data-portrait="${snap.classId}" data-dye="${snap.dye || ''}"></canvas>
      <b>${esc(name)}</b><small>Nv.${snap.level} · ${E.powerScore(snap)}</small>
      ${odds ? `<span class="pill gold">cote ${odds}</span>` : ''}
    </div>`;
}

function viewBets() {
  if (!NET.online) return offlineCard('Paris & duels', 'Les paris marchent seulement en ligne.');
  const me = NET.myId(), now = Date.now();
  const ch = bets.challenges;
  const received = ch.filter(c => c.status === 'pending' && c.to_id === me);
  const sent = ch.filter(c => c.status === 'pending' && c.from_id === me);
  const open = ch.filter(c => c.status === 'accepted' && now < fightAt(c));
  const done = ch.filter(c => c.status === 'accepted' && now >= fightAt(c)).slice(0, 8);
  const busy = new Set(ch.filter(c => c.status === 'pending' || (c.status === 'accepted' && now < fightAt(c))).filter(c => c.from_id === me || c.to_id === me).flatMap(c => [c.from_id, c.to_id]));
  const gains = pendingWinnings();
  const pot = (c, side) => bets.wagers.filter(w => w.challenge_id === c.id && w.side === side).reduce((t, w) => t + w.amount, 0);
  const myBets = (c) => bets.wagers.filter(w => w.challenge_id === c.id && w.user_id === me);
  return `
    <section class="card">
      <h2>Paris & duels</h2>
      <p class="hint">Défie un pote. S’il accepte, tout le monde a <b>24 h</b> pour miser des Pierres Clat. Ensuite le combat se joue (avec le perso le plus fort de chacun) et les gagnants touchent leur mise × la cote.</p>
      <div class="row" style="flex-wrap:wrap;gap:6px">
        <span class="pill clat"><canvas class="px" data-clat></canvas>${acc.clat} Pierres Clat</span>
        ${gains.ids.length ? `<button class="btn small ${gains.total ? 'green' : ''}" data-act="claimBets">${gains.total ? `Récupérer ${gains.total} Pierres Clat` : 'Voir mes paris perdus'}</button>` : ''}
      </div>
    </section>

    ${received.length ? `<section class="card"><h2>Défis reçus</h2>${received.map(c => `
      <div class="opp"><div class="o-body"><div class="o-name">${esc(c.from_name)} te défie !</div><div class="o-sub">${timeOf(c.created_at)}</div></div>
        <div class="done-col"><button class="btn small green" data-act="acceptDuel" data-id="${c.id}">Accepter</button><button class="btn small" data-act="declineDuel" data-id="${c.id}">Refuser</button></div></div>`).join('')}</section>` : ''}

    ${open.length ? `<section class="card"><h2>Paris ouverts</h2>${open.map(c => {
      const [oA, oB] = duelOdds(c);
      const mine = myBets(c);
      return `
      <div class="duel">
        <div class="d-vs">${duelSide(c.from_snap, oA, c.from_name)}<span class="vs">VS</span>${duelSide(c.to_snap, oB, c.to_name)}</div>
        <div class="o-sub" style="text-align:center">Mises : ${pot(c, 0)} – ${pot(c, 1)} · combat dans <b data-countdown="${fightAt(c)}">${fmt(fightAt(c) - now)}</b></div>
        ${mine.length ? `<div class="o-sub" style="text-align:center">Tes paris : ${mine.map(w => `${w.amount} sur ${esc(w.side === 0 ? c.from_name : c.to_name)} (×${w.odds})`).join(', ')}</div>` : ''}
        <div class="bet-row">
          <input id="bet-${c.id}" type="number" min="1" max="1000" value="5" inputmode="numeric">
          <button class="btn small primary" data-act="placeBet" data-id="${c.id}" data-side="0">${esc(c.from_name)} ×${oA}</button>
          <button class="btn small primary" data-act="placeBet" data-id="${c.id}" data-side="1">${esc(c.to_name)} ×${oB}</button>
        </div>
      </div>`;
    }).join('')}</section>` : ''}

    <section class="card">
      <h2>Lancer un défi</h2>
      ${players.length ? players.map(p => {
        const h = E.strongestHero(p.data);
        return `
        <div class="opp">
          <div class="av"><canvas class="px" data-portrait="${h.classId}" data-dye="${h.dye || ''}"></canvas></div>
          <div class="o-body"><div class="o-name">${nameHtml(p.pseudo, p.data)}</div><div class="o-sub">${CLASSES[h.classId].name} · Nv.${h.level}</div></div>
          <button class="btn small danger" data-act="challenge" data-id="${p.id}" ${busy.has(p.id) ? 'disabled' : ''}>${busy.has(p.id) ? 'En cours' : 'Défier'}</button>
        </div>`;
      }).join('') : '<p class="empty">Personne d’autre n’est inscrit.</p>'}
      ${sent.map(c => `<div class="log-line">⏳ En attente de ${esc(c.to_name)} <button class="btn small" data-act="cancelDuel" data-id="${c.id}">Annuler</button></div>`).join('')}
    </section>

    ${done.length ? `<section class="card"><h2>Derniers résultats</h2>${done.map(c => {
      const win = duelResult(c).winner;
      return `<div class="opp"><div class="o-body"><div class="o-name">${esc(win === 0 ? c.from_name : c.to_name)} a gagné</div><div class="o-sub">${esc(c.from_name)} vs ${esc(c.to_name)}</div></div>
        <button class="btn small" data-act="replayDuel" data-id="${c.id}">▶ Revoir</button></div>`;
    }).join('')}</section>` : ''}`;
}

// ------------------------------ Raid ------------------------------
let raidInfo = { week: '', raid: null, hits: [], prev: null, prevHits: [], prevWeek: '' };
let raidLoading = null;   // chargement en cours (une seule requête à la fois)
let raidError = '';

function groupLevels() {
  const mine = E.strongestHero(acc).level;
  if (NET.online) return [mine, ...players.map(p => E.strongestHero(p.data).level)];
  return [mine, ...opponents().map(o => o.level)];
}

const RAID_DAYS = 7;
const raidEndOf = (startMs) => startMs + RAID_DAYS * 86400000;

/** Raid hors ligne (bots) : dure 7 jours à partir de son ouverture */
function localRaid() {
  const L = acc.raid.local;
  const keys = Object.keys(L).filter(k => L[k].start).sort((a, b) => L[b].start - L[a].start);
  let curKey = keys.find(k => Date.now() < raidEndOf(L[k].start));
  if (!curKey) {
    curKey = E.dayKey();
    const lv = groupLevels();
    L[curKey] = { start: Date.now(), hp: E.raidHp(lv), level: Math.round(lv.reduce((a, b) => a + b, 0) / lv.length), hits: [] };
  }
  const prevKey = Object.keys(L).filter(k => k !== curKey && L[k].start && Date.now() >= raidEndOf(L[k].start)).sort((a, b) => L[b].start - L[a].start)[0] || '';
  for (const k of Object.keys(L)) if (k !== curKey && k !== prevKey) delete L[k];
  const botHits = (key, days, level) => FRIENDS.flatMap(f => {
    const out = [];
    for (let d = 0; d < days; d++) {
      const r = makeRng(hashStr('raid' + key + f.id + d));
      const n = Math.floor(r() * 4);
      for (let i = 0; i < n; i++) out.push({ user_id: f.id, pseudo: f.name, damage: Math.round(E.raidExpectedDamage(level) * (0.6 + r() * 0.8)) });
    }
    return out;
  });
  const cur = L[curKey];
  const days = Math.min(RAID_DAYS, Math.floor((Date.now() - cur.start) / 86400000) + 1);
  const res = { week: curKey, prevWeek: prevKey, endsAt: raidEndOf(cur.start), raid: { hp: cur.hp, level: cur.level }, hits: [...cur.hits, ...botHits(curKey, days, cur.level)], prev: null, prevHits: [] };
  if (prevKey) { const P = L[prevKey]; res.prev = { hp: P.hp, level: P.level }; res.prevHits = [...P.hits, ...botHits(prevKey, RAID_DAYS, P.level)]; }
  return res;
}

// Les raids ouverts avant le passage à 1 assaut par jour avaient 2× trop de PV : on les corrige pour tout le monde
const RAID_TAG = RAID.boss.id + ':v2';
const fixRaid = (r) => (r && r.boss === RAID.boss.id ? { ...r, hp: Math.round(r.hp * 0.5) } : r);

/** Raid en ligne : le plus récent encore actif (7 jours après son ouverture), sinon on en ouvre un nouveau */
function loadRaid() {
  if (!NET.online) { raidInfo = localRaid(); return Promise.resolve(); }
  if (raidLoading) return raidLoading;   // déjà en route : on attend la même réponse
  raidError = '';
  raidLoading = (async () => {
    try {
      const list = (await NET.fetchLatestRaids()).map(fixRaid);
      const endOf = (r) => raidEndOf(new Date(r.created_at).getTime());
      let raid = list.find(r => Date.now() < endOf(r)) || null;
      const prev = list.find(r => r !== raid && Date.now() >= endOf(r)) || null;
      if (!raid) {
        const lv = groupLevels();
        raid = fixRaid(await NET.openRaid(E.dayKey(), RAID_TAG, E.raidHp(lv), Math.round(lv.reduce((a, b) => a + b, 0) / lv.length)));
      }
      if (!raid) throw new Error('Le raid n’a pas pu être ouvert.');
      const [hits, prevHits] = await Promise.all([NET.fetchRaidHits(raid.week), prev ? NET.fetchRaidHits(prev.week) : []]);
      raidInfo = { week: raid.week, raid, hits, prev, prevHits, prevWeek: prev ? prev.week : '', endsAt: endOf(raid) };
    } catch (e) {
      raidError = e.message || 'Erreur inconnue';
    } finally {
      raidLoading = null;
    }
  })();
  return raidLoading;
}

function raidSummary(raid, hits) {
  const total = hits.reduce((t, h) => t + h.damage, 0);
  const by = {};
  for (const h of hits) { (by[h.user_id] ||= { pseudo: h.pseudo, dmg: 0 }).dmg += h.damage; }
  const board = Object.entries(by).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.dmg - a.dmg);
  const remaining = Math.max(0, raid.hp - total);
  return { total, remaining, killed: remaining <= 0, board };
}

function viewRaid() {
  if (!raidInfo.raid || Date.now() >= raidInfo.endsAt) {
    // Important : ne lancer le chargement qu'une fois (sinon l'écran se redessine en boucle et l'appli se fige)
    if (raidError) {
      return `<section class="card"><h2>Raid : ${RAID.boss.name}</h2>
        <p class="auth-msg">Impossible de charger le raid : ${esc(raidError)}</p>
        <button class="btn primary block" style="margin-top:12px" data-act="retryRaid">Réessayer</button></section>`;
    }
    if (!raidLoading) loadRaid().then(() => { if (tab === 'raid') softRender(); });
    return offlineCard(`Raid : ${RAID.boss.name}`, 'Chargement du raid…');
  }
  const me = myId();
  const S = raidSummary(raidInfo.raid, raidInfo.hits);
  const left = RAID.attemptsPerDay - E.raidState(acc).used;
  const mine = S.board.find(b => b.id === me);
  const isMvp = S.board[0] && S.board[0].id === me;
  const canClaim = S.killed && mine && !acc.raid.claimed[raidInfo.week];
  let prevCard = '';
  if (raidInfo.prev && !acc.raid.claimed[raidInfo.prevWeek]) {
    const P = raidSummary(raidInfo.prev, raidInfo.prevHits);
    const pm = P.board.find(b => b.id === me);
    if (pm) prevCard = `
      <section class="card war-reward">
        <h2>Raid précédent</h2>
        <div class="big-res">${P.killed ? `${RAID.boss.name} est tombé !` : `${RAID.boss.name} a résisté…`}</div>
        <p class="hint">Tu lui as infligé ${fmtNum(pm.dmg)} dégâts.</p>
        <button class="btn primary block" data-act="claimRaid" data-week="${raidInfo.prevWeek}">Récupérer ma récompense</button>
      </section>`;
  }
  const R = RAID.rewards;
  return `
    ${prevCard}
    <section class="card raid">
      <h2>Raid en cours</h2>
      <div class="raid-boss"><canvas class="px" data-monster="${RAID.boss.sprite}"></canvas></div>
      <div class="raid-name">${RAID.boss.name} <span class="pill">Nv.${raidInfo.raid.level}</span></div>
      <div class="score-bar raid-bar"><div style="width:${(S.remaining / raidInfo.raid.hp) * 100}%;background:#ff5d6c"></div><div style="flex:1;background:#3a2f45"></div></div>
      <div class="o-sub" style="text-align:center;margin-top:6px">${S.killed ? '<b style="color:var(--green)">VAINCU !</b>' : `${fmtNum(S.remaining)} / ${fmtNum(raidInfo.raid.hp)} PV`}</div>
      <div class="row" style="flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px">
        <span class="pill gold">Assauts : ${left} / ${RAID.attemptsPerDay}</span>
        <span class="pill">Fin dans <b data-endlong="${raidInfo.endsAt}">${fmtLong(raidInfo.endsAt - Date.now())}</b></span>
      </div>
      ${canClaim
        ? `<button class="btn primary block" style="margin-top:12px" data-act="claimRaid" data-week="${raidInfo.week}">Récupérer ma récompense</button>`
        : `<button class="btn danger block" style="margin-top:12px" data-act="attackRaid" ${left > 0 && !S.killed ? '' : 'disabled'}>${S.killed ? 'Boss vaincu' : 'Attaquer'}</button>`}
      <p class="hint" style="margin:12px 0 0">Tout le groupe tape le même boss. Le raid dure 7 jours. S’il tombe avant la fin : <b>${R.killChests} coffre de guerre + ${R.killClat} Pierres Clat</b> pour chaque participant, et un coffre de guerre en plus pour le meilleur. Sinon, ${R.failClat} Pierres Clat de consolation.</p>
    </section>
    <section class="card">
      <h2>Dégâts du raid</h2>
      ${S.board.length ? S.board.map((b, i) => `
        <div class="opp rank ${b.id === me ? 'me' : ''}"><div class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</div>
          <div class="o-body"><div class="o-name">${nameHtml(b.pseudo, dataOfPseudo(b.pseudo))}</div></div><div class="score">${fmtNum(b.dmg)}</div></div>`).join('')
        : '<p class="empty">Personne ne l’a encore attaqué.</p>'}
    </section>`;
}

function attackRaid() {
  const st = E.raidState(acc);
  if (st.used >= RAID.attemptsPerDay || !raidInfo.raid) return;
  const S = raidSummary(raidInfo.raid, raidInfo.hits);
  if (S.killed) return;
  const me = mySnap();
  const boss = E.raidBoss(raidInfo.raid.level, raidInfo.raid.hp, S.remaining);
  const result = E.simulate(me, boss, (Math.random() * 2 ** 31) | 0, { maxActions: RAID.maxActions, timeoutWinner: false });
  const dmg = E.damageDealt(result, S.remaining);
  st.used++;
  E.missionEvent(acc, 'raid');
  const hit = { user_id: myId(), pseudo: acc.pseudo, damage: dmg };
  raidInfo.hits.push(hit);
  if (NET.online) NET.addRaidHit(raidInfo.week, acc.pseudo, dmg).catch(e => toast(e.message));
  else acc.raid.local[raidInfo.week].hits.push(hit);
  save();
  const killed = dmg >= S.remaining;
  runBattle({
    me, foe: boss, result, theme: RAID.boss.theme, rewards: null, victory: killed ? myVictory() : null,
    title: `Raid · ${RAID.boss.name}`,
    headline: killed ? `${RAID.boss.name.toUpperCase()} EST TOMBÉ !` : `${fmtNum(dmg)} DÉGÂTS`, headClass: 'win',
    rewardsHtml: `<div class="rw"><span class="pill gold">${fmtNum(dmg)} dégâts infligés</span><span class="pill">Reste ${fmtNum(Math.max(0, S.remaining - dmg))} PV</span></div>`,
  });
}

function claimRaid(week) {
  const cur = week === raidInfo.week;
  const S = cur ? raidSummary(raidInfo.raid, raidInfo.hits) : raidSummary(raidInfo.prev, raidInfo.prevHits);
  const me = myId();
  const rw = E.raidReward(acc, week, S.killed, S.board[0] && S.board[0].id === me, S.board.some(b => b.id === me));
  if (!rw) return;
  save(); render();
  toast(`Récompense : ${rw.chests ? `${rw.chests} coffre${rw.chests > 1 ? 's' : ''} de guerre + ` : ''}${rw.clat} Pierres Clat !`);
}

// ------------------------------ Tour infinie ------------------------------
function towerBoard() {
  const bestOf = (data) => data.heroes.reduce((b, h) => ((h.tower && h.tower.best) > b.floor ? { floor: h.tower.best, classId: h.classId } : b), { floor: 0, classId: data.heroes[0].classId });
  const meB = bestOf(acc);
  const rows = [{ name: acc.pseudo, data: acc, ...meB, me: true }];
  if (NET.online) players.forEach(p => rows.push({ name: p.pseudo, data: p.data, ...bestOf(p.data) }));
  else opponents().forEach(o => rows.push({ name: o.name, data: null, floor: Math.round(o.level * 0.75), classId: o.classId }));
  return rows.sort((a, b) => b.floor - a.floor || (b.me ? 1 : 0) - (a.me ? 1 : 0));
}

function viewTower() {
  const t = E.towerState(hero);
  const left = TOWER.attemptsPerDay - t.used;
  const next = t.best + 1;
  const m = E.towerMonster(next);
  return `
    <section class="card raid">
      <h2>Tour infinie</h2>
      <p class="hint">Chaque étage est plus dur que le précédent, et la tour ne s’arrête jamais. +${TOWER.clatPerFloor} Pierre Clat par nouvel étage, +${TOWER.clatEvery10} tous les 10 étages.</p>
      <div class="raid-boss"><canvas class="px" data-monster="${m.dungeon.sprite}"></canvas></div>
      <div class="raid-name">Étage ${next} · ${m.snap.name} <span class="pill">Nv.${m.snap.level}</span></div>
      <div class="row" style="flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px">
        <span class="pill gold">Record de ton ${CLASSES[hero.classId].name} : étage ${t.best}</span>
        <span class="pill">Tentatives : ${left} / ${TOWER.attemptsPerDay}</span>
      </div>
      <button class="btn danger block" style="margin-top:12px" data-act="attackTower" ${left > 0 ? '' : 'disabled'}>Attaquer l’étage ${next}</button>
    </section>
    <section class="card">
      <h2>Classement de la tour</h2>
      ${towerBoard().map((r, i) => `
        <div class="opp rank ${r.me ? 'me' : ''}"><div class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</div>
          <div class="av"><canvas class="px" data-portrait="${r.classId}"></canvas></div>
          <div class="o-body"><div class="o-name">${nameHtml(r.name, r.data)}</div><div class="o-sub">${CLASSES[r.classId].name}</div></div>
          <div class="score">Étage ${r.floor}</div></div>`).join('')}
    </section>`;
}

function attackTower() {
  const t = E.towerState(hero);
  if (t.used >= TOWER.attemptsPerDay) return;
  const next = t.best + 1;
  const m = E.towerMonster(next);
  const me = mySnap();
  const result = E.simulate(me, m.snap, (Math.random() * 2 ** 31) | 0);
  const won = result.winner === 0;
  const rw = E.towerResult(acc, hero, won);
  if (won) E.missionEvent(acc, 'tower');
  save();
  runBattle({
    me, foe: m.snap, result, theme: m.theme, rewards: null, victory: won ? myVictory() : null,
    title: `Tour · Étage ${next}`,
    headline: won ? `ÉTAGE ${next} RÉUSSI !` : 'ÉCHEC…', headClass: won ? 'win' : 'lose',
    rewardsHtml: won
      ? `<div class="rw"><span class="pill clat"><canvas class="px" data-clat></canvas>+${rw.clat} Pierre${rw.clat > 1 ? 's' : ''} Clat</span></div>`
      : `<p style="color:var(--muted);margin:0">Encore ${TOWER.attemptsPerDay - t.used} tentative(s) aujourd’hui.</p>`,
  });
}

// ------------------------------ Boutique ------------------------------
let shopKind = 'title';
const SHOP_TABS = [['title', 'Titres'], ['color', 'Pseudo'], ['dye', 'Teintures'], ['victory', 'Victoire']];

function viewShop() {
  const owned = new Set(acc.cosmetics.owned);
  const list = COSMETICS.filter(c => c.kind === shopKind).sort((a, b) => a.price - b.price);
  const isOn = (c) => (c.kind === 'dye' ? hero.dye === c.id : acc.cosmetics[c.kind] === c.id);
  const preview = (c) => {
    if (c.kind === 'title') return `<span class="ptitle big">« ${esc(c.name)} »</span>`;
    if (c.kind === 'color') return `<span class="pname big ${c.color === 'rainbow' ? 'rainbow' : ''}" ${c.color !== 'rainbow' ? `style="color:${c.color}"` : ''}>${esc(acc.pseudo)}</span>`;
    if (c.kind === 'dye') return `<canvas class="px" data-portrait="${hero.classId}" data-dye="${c.id}"></canvas>`;
    return `<div class="dots">${c.colors.map(col => `<i style="background:${col}"></i>`).join('')}</div>`;
  };
  return `
    <section class="card">
      <h2>Boutique</h2>
      <p class="hint">Des apparences pour frimer, payées en Pierres Clat. Aucun effet sur la force.${shopKind === 'dye' ? ` Les teintures s’appliquent à ton personnage actif (${CLASSES[hero.classId].name}).` : ''}</p>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="pill clat"><canvas class="px" data-clat></canvas>${acc.clat} Pierres Clat</span></div>
      <div class="seg seg4" style="margin-top:12px">
        ${SHOP_TABS.map(([k, n]) => `<button class="${shopKind === k ? 'on' : ''}" data-act="shopKind" data-k="${k}">${n}</button>`).join('')}
      </div>
    </section>
    <section class="card">
      <div class="shop">
        ${list.map(c => `
          <div class="shop-item ${isOn(c) ? 'on' : ''}">
            <div class="sh-prev">${preview(c)}</div>
            <div class="sh-name">${esc(c.name)}</div>
            ${owned.has(c.id)
              ? `<button class="btn small ${isOn(c) ? '' : 'primary'}" data-act="equipCos" data-id="${c.id}">${isOn(c) ? 'Retirer' : 'Porter'}</button>`
              : `<button class="btn small green" data-act="buyCos" data-id="${c.id}" ${acc.clat < c.price ? 'disabled' : ''}>${c.price}<canvas class="px" data-clat></canvas></button>`}
          </div>`).join('')}
      </div>
    </section>`;
}

// ------------------------------ En direct ------------------------------
function onLive(kind, row) {
  if (kind === 'fight') {
    journal.unshift(row);
    journalUnseen++;
    setBadge('social', journalUnseen + chatUnread);
    const won = row.winner === 0;
    SFX.message();
    toast(`⚔ ${row.attacker_name} t’a attaqué (${KIND_NAME[row.kind] || ''}) : ${won ? 'il a gagné' : 'tu as gagné'} !`);
    if (tab === 'journal') { markJournalSeen(); softRender(); }
  } else if (kind === 'challenge') {
    if (row.to_id === NET.myId() && row.status === 'pending') { SFX.message(); toast(`🎲 ${row.from_name} te défie en duel !`); }
    refreshBets().then(() => { if (tab === 'bets' || tab === 'combat') softRender(); });
  } else if (kind === 'wager') {
    if (tab === 'bets') refreshBets().then(softRender);
  } else if (kind === 'raid') {
    if (tab === 'raid') loadRaid().then(softRender);
  }
}

async function initLive() {
  if (!NET.online) return;
  await Promise.all([loadJournal(), refreshBets()]);
  try { await NET.subscribeLive(onLive); } catch (e) { /* le direct est optionnel */ }
}

/** Bonus d'XP de rattrapage selon le retard sur les autres */
function updateXpBonus() {
  if (!NET.online || !players.length) { E.setXpBonus(1); return; }
  E.setXpBonus(E.catchupBonus(hero.level, players.map(p => E.strongestHero(p.data).level)));
}

const VIEWS = { hero: viewHero, chests: viewChests, bag: viewBag, fights: viewFights, dungeons: viewDungeons, ranking: viewRanking, war: viewWar, chat: viewChat,
  combat: viewCombat, social: viewSocial, shop: viewShop, tower: viewTower, raid: viewRaid, bets: viewBets, journal: viewJournal };

// ------------------------------ Modales & toasts ------------------------------
function openModal(html, { center = false } = {}) {
  modalRoot.innerHTML = `<div class="modal-bg ${center ? 'mid' : ''}" data-act="bgClose"><div class="modal ${center ? 'center' : ''}">${html}</div></div>`;
  hydrate(modalRoot);
}
function closeModal() { modalRoot.innerHTML = ''; }

function toast(text) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  root.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3100);
}
function announce(lv) {
  if (!lv) return;
  if (lv.levels > 0) { SFX.level(); toast(`Niveau ${hero.level} ! +${lv.levels * 3} points de caractéristiques`); }
  for (const s of lv.newSpells || []) toast(`Nouveau sort : ${s.name}`);
}

// ------------------------------ Ouverture de coffre ------------------------------
function openChestFlow(kind) {
  const res = E.openChest(acc, hero, kind);
  if (!res) return;
  E.missionEvent(acc, 'chest');
  save();
  SFX.chest();
  openModal(`
    <div class="open-stage">
      <h3>${{ combat: 'Coffre de combat', war: 'Coffre de guerre' }[kind] || 'Coffre'}</h3>
      <div class="rays" id="chest-wrap"><canvas class="px chest-big shake" id="chest-cv" data-chest="${kind}"></canvas></div>
      <div id="loot"></div>
    </div>`, { center: true });
  const cv = document.getElementById('chest-cv');
  setTimeout(() => {
    paint(cv, chestCanvas(kind, true), { scale: 6 });
    cv.classList.remove('shake');
    cv.classList.add('burst');
    SFX.loot(Math.max(...res.items.map(it => it.rarity)));
    document.getElementById('loot').innerHTML = `
      <div class="loot">
        ${res.items.map((it, i) => `
          <div class="loot-card" style="--rc:${RARITIES[it.rarity].color};animation-delay:${i * 0.18}s">
            <canvas class="px" data-icon="${it.itemId}"></canvas>
            <div class="ln">${esc(ITEMS[it.itemId].name)}</div>
            ${ITEMS[it.itemId].set ? `<div class="ls">${SETS[ITEMS[it.itemId].set].name}</div>` : ''}
            <div class="rar" style="color:${RARITIES[it.rarity].color}">${RARITIES[it.rarity].name}</div>
          </div>`).join('')}
      </div>
      <p style="color:var(--muted);margin:14px 0 0">+${res.xp} XP</p>
      ${res.items.some(it => E.stackOf(hero, it.itemId, it.rarity).length >= 2 && it.rarity < RARITIES.length - 1) ? '<p style="color:#c58bff;font-weight:800;margin:6px 0 0">✦ Une fusion est possible !</p>' : ''}
      <div class="close-row"><button class="btn primary" data-act="closeAndRender">Super !</button></div>`;
    hydrate(document.getElementById('loot'));
    announce(res);
  }, 900);
}

// ------------------------------ Combat ------------------------------
let battleCtl = null;

/** Affiche un combat en plein écran puis le panneau de résultat */
function runBattle({ me, foe, result, theme, title, rewardsHtml, rewards, victory = null, headline = null, headClass = null }) {
  stopPreviews.forEach(f => f());
  stopPreviews = [];
  const won = result.winner === 0;
  const ov = document.createElement('div');
  ov.className = 'battle';
  ov.innerHTML = `
    <div class="battle-vs">${title}</div>
    <div class="battle-wrap"><canvas id="arena"></canvas></div>
    <div class="battle-ctrl">
      <button class="btn small" data-act="speed" id="speed-btn">Vitesse x1</button>
      <button class="btn small" data-act="skip">Passer ⏭</button>
      <button class="btn small" data-act="toggleSound" id="snd-btn" aria-label="Son">${getPref('sfx') || getPref('music') ? '🔊' : '🔇'}</button>
    </div>
    <div class="battle-after" id="result-slot"></div>`;
  document.body.appendChild(ov);
  battleCtl = playBattle(ov.querySelector('#arena'), me, foe, result, { theme, victory });
  battleCtl.speedIdx = 0;
  battleCtl.promise.then(() => {
    ov.querySelector('.battle-ctrl').remove();
    const slot = ov.querySelector('#result-slot');
    slot.innerHTML = `
      <div class="result">
        <h2 class="${headClass || (won ? 'win' : 'lose')}">${headline || (won ? 'VICTOIRE !' : 'DÉFAITE…')}</h2>
        ${rewardsHtml}
        <button class="btn primary" data-act="endFight">Continuer</button>
      </div>`;
    hydrate(slot);
    announce(rewards);
  });
}

function startFight(foeId) {
  ensureDay();
  if (acc.fights.done[foeId]) return;
  const opp = opponents().find(o => o.id === foeId);
  if (!opp) return;
  const me = mySnap();
  const seed = hashStr(acc.fights.day + foeId + acc.pseudo);
  const result = E.simulate(me, opp.snap, seed);
  const won = result.winner === 0;
  // Le résultat est enregistré tout de suite : impossible de « rejouer » en quittant
  acc.fights.done[foeId] = won ? 'win' : 'loss';
  const rw = E.fightRewards(acc, hero, opp.level, won);
  E.missionEvent(acc, 'arena_fight');
  if (won) E.missionEvent(acc, 'arena_win');
  logFight('arena', foeId, opp.name, me, opp.snap, seed, won);
  save();
  runBattle({
    me, foe: opp.snap, result, theme: 'arena', rewards: rw, victory: myVictory(),
    title: `${esc(me.name)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    rewardsHtml: `
      <div class="rw">
        <span class="pill gold">+${rw.xp} XP</span>
        ${won ? `<span class="pill green">Coffre de combat ${acc.winProgress}/${WINS_PER_COMBAT_CHEST}</span>` : ''}
        ${rw.chest ? '<span class="pill red">Coffre de combat gagné !</span>' : ''}
      </div>`,
  });
}

/** Revanche ou vengeance : autant qu'on veut, pour le fun (1 Pierre Clat par adversaire et par jour) */
function startFriendly(foeId, revenge = false) {
  ensureDay();
  if (!revenge && !acc.fights.done[foeId]) return;
  const opp = opponents().find(o => o.id === foeId);
  if (!opp) return;
  const me = mySnap();
  const seed = (Math.random() * 2 ** 31) | 0;
  const result = E.simulate(me, opp.snap, seed);
  const won = result.winner === 0;
  const rw = E.friendlyRewards(acc, won, foeId);
  E.missionEvent(acc, revenge ? 'revenge' : 'rematch');
  logFight(revenge ? 'revenge' : 'rematch', foeId, opp.name, me, opp.snap, seed, won);
  save();
  runBattle({
    me, foe: opp.snap, result, theme: 'arena', rewards: null, victory: myVictory(),
    title: `${revenge ? 'Vengeance' : 'Revanche'} · ${esc(me.name)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    rewardsHtml: rw.clat
      ? `<div class="rw"><span class="pill clat"><canvas class="px" data-clat></canvas>+1 Pierre Clat (${acc.clat})</span></div>`
      : `<p style="color:var(--muted);margin:0">${won ? 'Pierre Clat déjà gagnée contre lui aujourd’hui.' : 'C’était pour le fun : rien de perdu !'}</p>`,
  });
}

function startDungeon(id) {
  const d = DUNGEONS.find(x => x.id === id);
  if (!d || hero.level < d.lvl) return;
  if (!E.useDungeonCharge(hero)) { toast('Plus d’entrée de donjon. Reviens plus tard !'); return; }
  const me = mySnap();
  const boss = E.buildMonster(d);
  const result = E.simulate(me, boss, (Math.random() * 2 ** 31) | 0);
  const won = result.winner === 0;
  const rw = E.dungeonRewards(hero, d, won);
  if (won) E.missionEvent(acc, 'dungeon_win');
  save();
  runBattle({
    me, foe: boss, result, theme: d.theme, rewards: rw,
    title: `${esc(d.name)} <span style="color:var(--gold)">·</span> ${esc(d.boss)}`,
    rewardsHtml: `
      <div class="rw"><span class="pill gold">+${rw.xp} XP</span></div>
      ${rw.item ? `
        <div class="loot-card" style="--rc:${RARITIES[rw.item.rarity].color}">
          <canvas class="px" data-icon="${rw.item.itemId}"></canvas>
          <div class="ln">${esc(ITEMS[rw.item.itemId].name)}</div>
          ${ITEMS[rw.item.itemId].set ? `<div class="ls">${SETS[ITEMS[rw.item.itemId].set].name}</div>` : ''}
          <div class="rar" style="color:${RARITIES[rw.item.rarity].color}">${RARITIES[rw.item.rarity].name}</div>
        </div>` : '<p style="color:var(--muted);margin:0">Le boss était trop fort… Améliore ton héros et reviens !</p>'}`,
  });
}

// ------------------------------ Réglages ------------------------------
function openSettings() {
  openModal(`
    <h3>Réglages</h3>
    ${NET.online ? `<p class="hint" style="margin-top:8px">Connecté en tant que <b>${esc(acc.pseudo)}</b>. Ta progression est sauvegardée en ligne.</p>` : `
      <label class="field" style="margin-top:12px">Pseudo
        <input id="rename" maxlength="14" value="${esc(acc.pseudo)}">
      </label>
      <button class="btn block" style="margin-top:10px" data-act="rename">Renommer</button>`}
    ${NET.online ? '' : `
    <div class="sub">OUTILS DE TEST (hors ligne uniquement)</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="btn small" data-act="cheat" data-c="chests">+5 coffres</button>
      <button class="btn small" data-act="cheat" data-c="combat">+2 coffres combat</button>
      <button class="btn small" data-act="cheat" data-c="fights">Recharger combats + donjons</button>
      <button class="btn small" data-act="cheat" data-c="lvl">+5 niveaux</button>
      <button class="btn small" data-act="cheat" data-c="weekEnd">Finir la guerre</button>
      <button class="btn small" data-act="cheat" data-c="clat">+100 Pierres Clat</button>
    </div>`}
    <div class="sub">SON</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="btn small ${getPref('sfx') ? 'green' : ''}" data-act="soundPref" data-k="sfx">Bruitages : ${getPref('sfx') ? 'oui' : 'non'}</button>
      <button class="btn small ${getPref('music') ? 'green' : ''}" data-act="soundPref" data-k="music">Musique : ${getPref('music') ? 'oui' : 'non'}</button>
    </div>
    <div class="sub">PERSONNAGE</div>
    ${acc.heroes.length > 1 ? `<button class="btn danger block" data-act="deleteHero">Supprimer ce ${CLASSES[hero.classId].name} (Nv.${hero.level})</button>` : '<p class="hint">Tu ne peux pas supprimer ton seul personnage.</p>'}
    ${NET.online ? '<button class="btn block" style="margin-top:10px" data-act="logout">Me déconnecter</button>' : `
      <div class="sub">DANGER</div>
      <button class="btn danger block" data-act="wipe">Tout effacer</button>`}
    <div class="close-row"><button class="btn" data-act="closeModal">Fermer</button></div>`);
}

function openNewHero() {
  openModal(`
    <h3>Nouveau personnage</h3>
    <p class="hint" style="margin-top:8px">Il commence au niveau 1 avec un sac vide. Tes autres personnages gardent tout.</p>
    ${classGrid()}
    <div class="close-row">
      <button class="btn primary" data-act="createHero">Créer</button>
      <button class="btn" data-act="closeModal">Annuler</button>
    </div>`);
}

// ------------------------------ Actions ------------------------------
const ACTIONS = {
  tab: (d) => {
    SFX.click();
    tab = d.id; render(); window.scrollTo(0, 0);
    if (NET.online && ['fights', 'war', 'ranking', 'bets', 'tower', 'combat'].includes(d.id)) refreshPlayers().then(() => { if (tab === d.id) softRender(); });
    if (d.id === 'journal') loadJournal().then(() => { if (tab === 'journal') { markJournalSeen(); softRender(); } });
    if (d.id === 'bets') refreshBets().then(() => { if (tab === 'bets') softRender(); });
    if (d.id === 'raid') loadRaid().then(() => { if (tab === 'raid') softRender(); });
  },
  authMode: (d) => { authMode = d.mode; renderAuth(); },
  auth: () => doAuth(),
  soundPref: (d) => { setPref(d.k, !getPref(d.k)); openSettings(); },
  toggleSound: () => {
    const on = !(getPref('sfx') || getPref('music'));
    setPref('sfx', on); setPref('music', on);
    if (on) startMusic(); else stopMusic();
    const b = document.getElementById('snd-btn');
    if (b) b.textContent = on ? '🔊' : '🔇';
  },
  sendChat: () => sendChat(),
  switchHero: (d) => {
    const i = +d.i;
    if (i === acc.active) return;
    acc.active = i; save(); render();
    toast(`${CLASSES[E.activeHero(acc).classId].name} activé !`);
  },
  newHeroModal: () => openNewHero(),
  createHero: () => {
    const h = E.addCharacter(acc, pickedClass);
    if (!h) return;
    save(); closeModal(); render();
    toast(`Nouveau ${CLASSES[h.classId].name} créé !`);
  },
  deleteHero: () => {
    if (acc.heroes.length <= 1) return;
    if (!confirm(`Supprimer ce ${CLASSES[hero.classId].name} niveau ${hero.level} et tous ses objets ? C’est définitif.`)) return;
    acc.heroes.splice(acc.active, 1);
    acc.active = 0;
    save(); closeModal(); render();
  },
  logout: async () => {
    await NET.signOut();
    acc = null; hero = null; players = []; chatMsgs = []; chatUnread = 0; journal = []; journalUnseen = 0; authMode = 'login';
    closeModal(); render();
  },
  pickClass: (d) => {
    pickedClass = d.id;
    document.querySelectorAll('.class-card').forEach(c => c.classList.toggle('sel', c.dataset.id === d.id));
  },
  create: () => {
    const name = (document.getElementById('hero-name').value || '').trim();
    if (!name) { document.getElementById('hero-name').focus(); toast('Choisis un pseudo !'); return; }
    acc = E.newAccount(name, pickedClass);
    save();
    tab = 'chests';
    render();
    toast('Bienvenue ! Tu as 2 coffres à ouvrir.');
  },
  addStat: (d) => {
    if (E.freePoints(hero) <= 0) return;
    hero.alloc[d.k] = (hero.alloc[d.k] || 0) + 1;
    save(); render();
  },
  resetStats: () => { hero.alloc = {}; save(); render(); toast('Points remis à zéro. Replace-les comme tu veux !'); },
  spellUp: (d) => { const i = hero.spells.indexOf(d.id); if (i > 0) { [hero.spells[i - 1], hero.spells[i]] = [hero.spells[i], hero.spells[i - 1]]; save(); render(); } },
  spellDown: (d) => { const i = hero.spells.indexOf(d.id); if (i >= 0 && i < hero.spells.length - 1) { [hero.spells[i + 1], hero.spells[i]] = [hero.spells[i], hero.spells[i + 1]]; save(); render(); } },
  spellOff: (d) => { hero.spells = hero.spells.filter(id => id !== d.id); save(); render(); },
  spellOn: (d) => { if (hero.spells.length < MAX_ACTIVE_SPELLS && !hero.spells.includes(d.id)) { hero.spells.push(d.id); save(); render(); } },
  openChest: (d) => openChestFlow(d.kind),
  item: (d) => openItem(d.id, +d.r),
  equip: (d) => {
    const stack = E.stackOf(hero, d.id, +d.r);
    if (!stack.length) return;
    hero.equipped[ITEMS[d.id].slot] = stack[0].uid;
    save(); closeModal(); render(); toast(`${ITEMS[d.id].name} équipé !`);
  },
  unequip: (d) => { delete hero.equipped[d.slot]; save(); closeModal(); render(); },
  fuse: (d) => {
    const anim = document.getElementById('fuse-anim');
    if (anim) anim.classList.add('shake');
    setTimeout(() => {
      const res = E.fuse(hero, d.id, +d.r);
      if (!res) return;
      SFX.fuse();
      E.missionEvent(acc, 'fuse');
      save();
      render();
      openItem(res.itemId, res.rarity);
      const ic = modalRoot.querySelector('.big-ic');
      if (ic) ic.classList.add('burst');
      toast(`Fusion réussie : ${ITEMS[res.itemId].name} ${RARITIES[res.rarity].name} !`);
    }, 600);
  },
  fight: (d) => startFight(d.id),
  friendly: (d) => startFriendly(d.id),
  revenge: (d) => startFriendly(d.id, true),
  replayLog: (d) => replayById(d.id),
  replayId: (d) => replayById(d.id),
  shareLog: (d) => shareFight(d.id),
  claimMission: (d) => {
    const got = E.claimMission(acc, d.id);
    if (!got) return;
    SFX.loot(1); save(); render();
    toast(`+${got} Pierres Clat !`);
  },
  attackRaid: () => attackRaid(),
  retryRaid: () => { raidError = ''; render(); },
  claimRaid: (d) => claimRaid(d.week),
  attackTower: () => attackTower(),
  shopKind: (d) => { shopKind = d.k; render(); },
  buyCos: (d) => {
    const c = COSMETIC[d.id];
    if (!E.buyCosmetic(acc, d.id)) { toast('Pas assez de Pierres Clat.'); return; }
    E.equipCosmetic(acc, hero, d.id);
    SFX.loot(2); save(); render();
    toast(`${c.name} acheté !`);
  },
  equipCos: (d) => { E.equipCosmetic(acc, hero, d.id); SFX.click(); save(); render(); },
  challenge: async (d) => {
    const p = players.find(x => x.id === d.id);
    if (!p) return;
    try { await NET.createChallenge(p.id, acc.pseudo, p.pseudo); toast(`Défi envoyé à ${p.pseudo} !`); } catch (e) { toast(e.message); }
    await refreshBets(); softRender();
  },
  acceptDuel: async (d) => {
    const c = bets.challenges.find(x => String(x.id) === d.id);
    const p = c && players.find(x => x.id === c.from_id);
    if (!p) { toast('Joueur introuvable.'); return; }
    try {
      await NET.answerChallenge(c.id, {
        status: 'accepted', accepted_at: new Date().toISOString(), seed: (Math.random() * 2 ** 31) | 0,
        from_snap: snapOf(p.data, E.strongestHero(p.data), p.pseudo),
        to_snap: snapOf(acc, E.strongestHero(acc), acc.pseudo),
      });
      toast('Duel accepté ! Les paris sont ouverts pendant 24 h.');
    } catch (e) { toast(e.message); }
    await refreshBets(); softRender();
  },
  declineDuel: async (d) => { try { await NET.answerChallenge(+d.id, { status: 'declined' }); } catch (e) { toast(e.message); } await refreshBets(); softRender(); },
  cancelDuel: async (d) => { try { await NET.answerChallenge(+d.id, { status: 'cancelled' }); } catch (e) { toast(e.message); } await refreshBets(); softRender(); },
  placeBet: async (d) => {
    const c = bets.challenges.find(x => String(x.id) === d.id);
    if (!c) return;
    const amount = Math.floor(+document.getElementById('bet-' + c.id).value || 0);
    if (amount < 1) { toast('Mise au moins 1 Pierre Clat.'); return; }
    if (amount > acc.clat) { toast('Pas assez de Pierres Clat.'); return; }
    const side = +d.side;
    const odds = duelOdds(c)[side];
    acc.clat -= amount; save();
    try {
      await NET.placeWager(c.id, acc.pseudo, side, amount, odds);
      E.missionEvent(acc, 'bet'); save();
      SFX.click();
      toast(`Pari placé : ${amount} sur ${side === 0 ? c.from_name : c.to_name} (×${odds})`);
    } catch (e) { acc.clat += amount; save(); toast(e.message); }
    await refreshBets(); softRender();
  },
  claimBets: () => {
    const g = pendingWinnings();
    if (!g.ids.length) return;
    acc.clat += g.total;
    acc.paidWagers = [...acc.paidWagers, ...g.ids].slice(-300);
    save(); render();
    if (g.total) { SFX.loot(3); toast(`+${g.total} Pierres Clat gagnées aux paris !`); } else toast('Paris perdus… la prochaine sera la bonne !');
  },
  replayDuel: (d) => {
    const c = bets.challenges.find(x => String(x.id) === d.id);
    if (!c) return;
    const result = duelResult(c);
    const winName = result.winner === 0 ? c.from_name : c.to_name;
    runBattle({ me: c.from_snap, foe: c.to_snap, result, theme: 'arena', rewards: null,
      title: `Duel · ${esc(c.from_name)} <span style="color:var(--gold)">VS</span> ${esc(c.to_name)}`,
      headline: `${winName.toUpperCase()} GAGNE !`, headClass: 'win', rewardsHtml: '' });
  },
  dungeon: (d) => startDungeon(d.id),
  warAttack: (d) => startWarAttack(d.id),
  joinSection: async (d) => {
    const s = WAR.sections[d.sec];
    if (!confirm(`Rejoindre la ${s.name} ? Tu ne pourras changer qu’une fois par mois.`)) return;
    await refreshPlayers();
    if (!E.joinSection(acc, d.sec, others())) { toast(`La ${s.name} est complète (${WAR.maxPerSection} max).`); render(); return; }
    save(); render(); toast(`Bienvenue dans la ${s.name} !`);
  },
  changeSection: async () => {
    const c = E.canChangeSection(acc);
    if (!c.ok) { toast(`Changement possible dans ${Math.ceil(c.wait / 86400000)} jour(s).`); return; }
    const other = E.otherSide(acc.war.section);
    if (!confirm(`Passer dans la ${WAR.sections[other].name} ? Tes points de la semaine resteront à ton ancienne section.`)) return;
    await refreshPlayers();
    if (!E.joinSection(acc, other, others())) { toast(`La ${WAR.sections[other].name} est complète (${WAR.maxPerSection} max).`); return; }
    save(); render();
  },
  claimWar: () => {
    const p = E.claimWarReward(acc);
    save(); render();
    if (p && (p.warChests || p.combatChests)) toast('Récompense ajoutée dans tes coffres !');
  },
  rank: (d) => { rankMode = d.mode; render(); },
  speed: () => {
    if (!battleCtl) return;
    const speeds = [1, 2, 3];
    battleCtl.speedIdx = (battleCtl.speedIdx + 1) % speeds.length;
    battleCtl.setSpeed(speeds[battleCtl.speedIdx]);
    document.getElementById('speed-btn').textContent = `Vitesse x${speeds[battleCtl.speedIdx]}`;
  },
  skip: () => battleCtl && battleCtl.skip(),
  endFight: () => {
    if (battleCtl) battleCtl.destroy();
    battleCtl = null;
    document.querySelector('.battle')?.remove();
    render();
  },
  settings: openSettings,
  rename: () => {
    const v = (document.getElementById('rename').value || '').trim();
    if (v) { acc.pseudo = v; acc.heroes.forEach(h => { h.name = v; }); save(); closeModal(); render(); }
  },
  cheat: (d) => {
    if (NET.online) return;
    if (d.c === 'chests') hero.chest.stored = CHEST_MAX;
    if (d.c === 'combat') acc.combatChests += 2;
    if (d.c === 'fights') { acc.fights.done = {}; acc.fights.clat = {}; hero.dungeon.stored = DUNGEON_MAX; acc.war.done = {}; hero.tower.used = 0; acc.raid.used = 0; }
    if (d.c === 'clat') acc.clat += 100;
    if (d.c === 'weekEnd' && acc.war.section) {
      const cur = E.warWeek(acc);
      acc.war.weeks['2000-01-03'] = { ...cur, attacks: Math.max(cur.attacks, WAR.minAttacks) };
      acc.war.lastWeek = '2000-01-03';
    }
    if (d.c === 'lvl') { let lv = { levels: 0, newSpells: [] }; for (let i = 0; i < 5; i++) { const r = E.gainXp(hero, E.xpForLevel(hero.level) - hero.xp); lv.levels += r.levels; lv.newSpells.push(...r.newSpells); } announce(lv); }
    save(); closeModal(); render();
  },
  wipe: () => {
    if (!confirm('Tout effacer (tous tes personnages) pour de bon ?')) return;
    wipe(); acc = null; hero = null; closeModal(); render();
  },
  closeModal: () => closeModal(),
  closeAndRender: () => { closeModal(); render(); },
  bgClose: (d, el, ev) => { if (ev.target === el) { closeModal(); render(); } },
};

document.addEventListener('click', (ev) => {
  unlockSound();
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) fn(el.dataset, el, ev);
});

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter') return;
  if (ev.target.id === 'chat-input') { ev.preventDefault(); sendChat(); return; }
  if (document.getElementById('auth-btn')) doAuth();
});
document.addEventListener('input', (ev) => { if (ev.target.id === 'chat-input') chatDraft = ev.target.value; });

// Minuteurs (coffres, fin de journée)
setInterval(() => {
  if (!acc) return;
  if (!hero) return;
  const before = hero.chest.stored + hero.dungeon.stored * 10;
  E.refreshChests(hero);
  E.refreshDungeon(hero);
  const busy = modalRoot.innerHTML || document.querySelector('.battle') || tab === 'chat';
  if (hero.chest.stored + hero.dungeon.stored * 10 !== before) { save(); if (!busy) render(); return; }
  if (acc.fights.day !== E.dayKey() && !busy) { render(); return; }
  const t = document.querySelector('[data-timer="chest"]');
  if (t && hero.chest.stored < CHEST_MAX) t.innerHTML = `Prochain coffre dans <b>${fmt(E.nextChestIn(hero))}</b>`;
  const d = document.querySelector('[data-timer="day"]');
  if (d) d.textContent = `Nouveaux combats dans ${fmt(msToMidnight())}`;
  const d2 = document.querySelector('[data-timer="day2"]');
  if (d2) d2.textContent = fmt(msToMidnight());
  document.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = fmt(+el.dataset.countdown - Date.now()); });
  document.querySelectorAll('[data-endlong]').forEach(el => { el.textContent = fmtLong(Math.max(0, +el.dataset.endlong - Date.now())); });
  const wk = document.querySelector('[data-timer="week"]');
  if (wk) wk.textContent = `Fin dans ${fmtLong(E.msToWeekEnd())}`;
  const dj = document.querySelector('[data-timer="dungeon"]');
  if (dj && hero.dungeon.stored < DUNGEON_MAX) dj.textContent = `Prochaine entrée dans ${fmt(E.nextDungeonIn(hero))}`;
}, 1000);

// En ligne : on recharge les autres joueurs de temps en temps, et on sauvegarde avant de quitter
if (NET.online) {
  NET.setSaveErrorHandler((msg) => toast(`Sauvegarde en ligne impossible (${msg}). Nouvel essai…`));
  setInterval(() => { if (acc && !document.querySelector('.battle')) refreshPlayers(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') NET.flush(); });
}

// ------------------------------ Mise à jour automatique ------------------------------
// Le téléphone peut garder une ancienne version en mémoire : on compare avec version.json
// (jamais en cache) et on recharge la page si une nouvelle version est en ligne.
async function checkUpdate() {
  try {
    const r = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return;
    const { v } = await r.json();
    if (!v || v === APP_VERSION) return;
    if (document.querySelector('.battle') || modalRoot.innerHTML) return;   // pas en plein combat
    let tried = null;
    try { tried = sessionStorage.getItem('fuze-update'); } catch (e) { /* stockage indisponible */ }
    if (tried === v) { toast('Nouvelle version disponible : ferme et rouvre l’appli.'); return; }
    try { sessionStorage.setItem('fuze-update', v); } catch (e) { /* stockage indisponible */ }
    if (NET.online) await NET.flush();
    location.reload();
  } catch (e) { /* pas de réseau : on réessaiera */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });
setInterval(checkUpdate, 5 * 60 * 1000);

async function boot() {
  if (NET.online) {
    app.innerHTML = '<div class="create"><h1 class="logo">FUZE<span>ARENA</span></h1><p class="lead">Connexion…</p></div>';
    try {
      const row = await NET.restore();
      if (row && row.data) {
        acc = E.migrate(row.data);
        acc.pseudo = row.pseudo;
        await refreshPlayers();
        await Promise.all([initChat(), initLive()]);
      }
    } catch (e) {
      app.innerHTML = `<div class="create"><h1 class="logo">FUZE<span>ARENA</span></h1><p class="auth-msg">${esc(e.message)}</p><button class="btn primary block" onclick="location.reload()">Réessayer</button></div>`;
      return;
    }
  } else {
    const saved = load();
    if (saved) acc = E.migrate(saved);
  }
  render();
  checkUpdate();
}
boot();
