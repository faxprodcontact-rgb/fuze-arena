// =====================================================================
//  INTERFACE — écrans Héros / Coffres / Sac / Arène / Donjons / Guerre
// =====================================================================
import {
  CLASSES, STATS, STAT_KEYS, RARITIES, ITEMS, SLOTS, SLOT_ORDER, SPELLS, FRIENDS,
  CHEST_MAX, CHEST_ODDS, OPEN_MAX, MAX_ACTIVE_SPELLS, WINS_PER_COMBAT_CHEST, MAX_LEVEL,
  THRONE, AUTO, DUNGEONS, DUNGEON_RUNS, DUNGEON_KEYS_MAX, DUNGEON_SKIP_KEEP, HORDE, SETS, WAR, COSMETICS, COSMETIC, RAID, TOWER, MISSIONS_BONUS,
  KEY_PRICE, SHOP_DAILY, CHAMP, PVP, SELL_PRICE, STAT_RESET_COST, PETS, PET_EVERY, ITEM_LIST,
} from './data.js?v=20261019191031';
import * as E from './engine.js?v=20261019191031';
import { playBattle, playTraining, idlePreview, playSkirmish, dollPreview, playMelee, loadDecorArt } from './battle.js?v=20261019191031';
import { itemIcon, chestCanvas, paint, heroPortrait, monsterCanvas, clatCanvas, keyCanvas, spellIcon, modeEmblem, uiIcon, loadHeroArt, loadMonsterArt, loadIconArt, loadItemArt } from './sprites.js?v=20261019191031';
import { hashStr, makeRng } from './rng.js?v=20261019191031';
import { APP_VERSION } from './version.js?v=20261019191031';
import { PATCH_NOTES } from './patchnotes.js?v=20261019191031';
import * as NET from './net.js?v=20261019191031';
import { SFX, unlock as unlockSound, getPref, setPref, startMusic, stopMusic } from './sfx.js?v=20261019191031';

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
let lastTab = null;
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
/** Petite icône en pixel art (à la place d'un emoji) */
/** Les persos rangés du plus haut niveau (à gauche) au plus bas, avec leur place d'origine dans le compte */
const byLevel = (heroes) => heroes.map((h, i) => [h, i]).sort(([a, i], [b, j]) => b.level - a.level || b.xp - a.xp || i - j);
const ico = (name, cls = '') => `<canvas class="px ico ${cls}" data-ico="${name}"></canvas>`;
function hydrate(root = document) {
  root.querySelectorAll('canvas[data-icon]').forEach(c => paint(c, itemIcon(c.dataset.icon), { scale: 4 }));
  root.querySelectorAll('canvas[data-portrait]').forEach(c => paint(c, heroPortrait(c.dataset.portrait, CLASSES[c.dataset.portrait].weapon, c.dataset.dye || null), { scale: 4 }));
  root.querySelectorAll('canvas[data-monster]').forEach(c => paint(c, monsterCanvas(c.dataset.monster), { scale: 3 }));
  root.querySelectorAll('canvas[data-clat]').forEach(c => paint(c, clatCanvas(), { scale: 3 }));
  root.querySelectorAll('canvas[data-key]').forEach(c => paint(c, keyCanvas(), { scale: 3 }));
  root.querySelectorAll('canvas[data-emblem]').forEach(c => paint(c, modeEmblem(c.dataset.emblem), { scale: 4 }));
  root.querySelectorAll('canvas[data-ico]').forEach(c => paint(c, uiIcon(c.dataset.ico), { scale: 4 }));
  root.querySelectorAll('canvas[data-spell]').forEach(c => paint(c, spellIcon(c.dataset.spell), { scale: 3 }));
  root.querySelectorAll('canvas[data-chest]').forEach(c => paint(c, chestCanvas(c.dataset.chest, c.dataset.open === '1'), { scale: 6 }));
  root.querySelectorAll('canvas[data-hero]').forEach(c => stopPreviews.push(idlePreview(c, c.dataset.hero, c.dataset.pet || null, c.dataset.dye || null)));
  root.querySelectorAll('canvas[data-auto]').forEach(c => stopPreviews.push(startAutoVisual(c)));
  root.querySelectorAll('canvas[data-doll]').forEach(c => stopPreviews.push(dollPreview(c, c.dataset.doll, c.dataset.pet || null, c.dataset.dye || null)));
}

function render() {
  stopPreviews.forEach(f => f());
  stopPreviews = [];
  if (!acc) { if (NET.online) renderAuth(); else renderCreate(); return; }
  hero = E.activeHero(acc);
  if (E.applySpecialReset(acc)) { save(); setTimeout(() => toast('Remise à zéro spéciale de 20 h : tout est rechargé !'), 400); }
  if (E.applyLevelFixes(acc).length) { save(); hero = E.activeHero(acc); setTimeout(() => toast('Correction : un perso monté trop vite pendant les changements d’XP a été remis à son niveau.'), 600); }
  ensureDay();
  E.ensureWar(acc, others());
  acc.heroes.forEach(h => { E.refreshChests(h); E.dungeonRuns(h); });
  updateXpBonus();
  const need = E.xpForLevel(hero.level);
  const xpPct = hero.level >= MAX_LEVEL ? 100 : Math.round((hero.xp / need) * 100);
  const fightsLeft = opponents().filter(o => !o.done).length;
  const chests = E.openableChests(hero) + acc.combatChests + acc.warChests;
  const pts = E.freePoints(hero);
  const combatBadge = fightsLeft + claimableMissions();
  const socialBadge = chatUnread + journalUnseen;
  const fusable = countFusable();

  app.innerHTML = `
    <header class="topbar cls-${hero.classId}">
      <button class="tb-portrait" data-act="tab" data-id="hero" aria-label="Héros"><canvas class="px" data-portrait="${hero.classId}" data-dye="${hero.dye || ''}"></canvas><span class="tb-lvl">${hero.level}</span></button>
      <div class="tb-info">
        <div class="tb-name">${nameHtml(acc.pseudo, acc)}</div>
        <div class="tb-sub"><span class="tb-cls">${CLASSES[hero.classId].name}</span><span class="tb-flouze"><canvas class="px" data-clat></canvas>${fmtNum(acc.clat)}</span></div>
        <div class="xpbar"><div style="width:${xpPct}%"></div><span>${hero.level >= MAX_LEVEL ? 'NIVEAU MAX' : `XP ${fmtNum(hero.xp)} / ${fmtNum(need)}`}</span></div>
      </div>
      <button class="tb-gear" data-act="patchNotes" aria-label="Notes de mise à jour">${ico('scroll')}<span class="badge dot" id="patch-badge" ${patchUnseen() ? '' : 'hidden'}>!</span></button>
      <button class="tb-gear ${tab === 'chat' ? 'on' : ''}" data-act="tab" data-id="chat" aria-label="Tchat">${ico('chat')}<span class="badge" id="chat-badge" ${chatUnread ? '' : 'hidden'}>${chatUnread}</span></button>
      <button class="tb-gear" data-act="settings" aria-label="Réglages">${ico('gear')}</button>
    </header>
    <main id="view" class="${tab === 'chat' ? 'is-chat' : ''}">${PARENT[tab] ? `<button class="backbar" data-act="tab" data-id="${PARENT[tab]}">‹ ${PARENT_NAME[PARENT[tab]]}</button>` : ''}${VIEWS[tab]()}</main>
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
  // petite animation d'entrée quand on change d'onglet
  if (tab !== lastTab) { document.getElementById('view')?.classList.add('enter'); lastTab = tab; }
  if (tab === 'chat') { markChatSeen(); scrollChat(); }
  if (tab === 'journal') markJournalSeen();
  if (tab === 'hero') startTraining();
  if (tab === 'war') startSkirmish();
  maybeShowGift();
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
  const gx = E.gearExtras(hero);
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const box = (ico, label, val, sub) => `<div class="ts"><span><i class="ts-ico">${ico}</i>${label}</span><b>${val}</b><small>${sub}</small></div>`;
  const speedRatio = T.foeActs ? (T.acts / T.foeActs).toFixed(1) : '—';
  return [
    box(ico('swords'), 'Dégâts moyens', T.hits ? Math.round(T.dmg / T.hits) : '—', `record ${T.maxHit}`),
    box(ico('boom'), 'Critiques', `${pct(T.crits, T.hits)} %`, `chance ${Math.round(E.finalCrit(st.lck, gx.crit) * 100)} %`),
    box(ico('wind'), 'Esquives', `${pct(T.dodges, T.foeHits + T.dodges)} %`, `chance ${Math.round(E.finalDodge(st.lck, gx.dodge) * 100)} %`),
    box(ico('shield'), 'Défense', `−${Math.round((1 - 100 / (100 + st.def)) * 100)} %`, `dégâts reçus ${T.foeHits ? Math.round(T.taken / T.foeHits) : '—'}`),
    box(ico('bolt'), 'Vitesse', `×${speedRatio}`, 'actions par coup reçu'),
    box(ico('heart'), 'Soins', T.heal, `PV max ${E.maxHp(st, hero.level)}`),
  ].join('');
}

/** Record d'entraînement (plus gros coup) de tous les joueurs, tous persos confondus */
function trainingBest() {
  let best = { dmg: (acc.trainRecord && acc.trainRecord.dmg) || 0, name: acc.pseudo, data: acc };
  if (NET.online) for (const p of players) { const r = p.data.trainRecord; if (r && r.dmg > best.dmg) best = { dmg: r.dmg, name: p.pseudo, data: p.data }; }
  return best;
}
const trainRecHtml = () => { const b = trainingBest(); return b.dmg ? `${ico('trophy')} <b>${esc(b.name)}</b> a mis <b>${fmtNum(b.dmg)}</b> dégâts` : `${ico('trophy')} Pas encore de record`; };

function onTrainingEntry(e) {
  onTrainSpells(e);
  if (!T || e.type !== 'action' || e.pet) return;
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
  if (el) { el.innerHTML = trainingStatsHtml(); hydrate(el); }
  // nouveau record personnel ?
  if (T.maxHit > ((acc.trainRecord && acc.trainRecord.dmg) || 0)) {
    const isTop = T.maxHit > trainingBest().dmg;
    acc.trainRecord = { dmg: T.maxHit, classId: hero.classId };
    E.missionEvent(acc, 'train_rec');
    save();
    const r = document.getElementById('train-rec');
    if (r) { r.innerHTML = trainRecHtml(); hydrate(r); if (isTop) { r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); } }
  }
}

// Sorts de l'entraînement : les sorts de combat du perso, sous l'épouvantail. Toucher un sort le fait lancer
// par le héros à sa prochaine action (combat en direct), et affiche ce qu'il a fait.
let trainFight = null, trainCast = null;
const trainSpellList = () => hero.spells.filter(id => SPELLS[id] && SPELLS[id].lvl <= hero.level).slice(0, MAX_ACTIVE_SPELLS);
function trainSpellsHtml() {
  const list = trainSpellList();
  if (!list.length) return '';
  return `<div class="train-spells" id="train-spells">
    ${list.map((id, i) => `<button class="tsp" data-act="trainCast" data-id="${id}" data-i="${i}" aria-label="${esc(SPELLS[id].name)}"><canvas class="px" data-spell="${id}"></canvas><span class="cd"></span></button>`).join('')}
  </div><div class="train-cast" id="train-cast">Touche un sort pour le lancer</div>`;
}
/** Recharges des sorts (en tours) et sort lancé : met à jour les boutons et la ligne de résultat */
function onTrainSpells(e) {
  const box = document.getElementById('train-spells');
  if (box && e.s && e.s[0] && e.s[0].cd) box.querySelectorAll('.tsp').forEach(b => {
    const left = Math.max(0, (e.s[0].cd[+b.dataset.i] || 0) - 1);
    b.classList.toggle('wait', left > 0);
    b.querySelector('.cd').textContent = left || '';
  });
  if (e.type !== 'action' || e.actor !== 0 || e.pet || !trainCast) return;
  // le héros vient d'agir : on repasse en automatique
  if (trainFight) trainFight.setManual(false);
  const asked = trainCast;
  trainCast = null;
  if (box) box.querySelectorAll('.tsp.queued').forEach(b => b.classList.remove('queued'));
  const out = document.getElementById('train-cast');
  if (!out) return;
  if (e.id !== asked) { out.innerHTML = `${esc(SPELLS[asked].name)} pas prêt : réessaie`; return; }
  const dmg = e.results.filter(r => r.type === 'hit' && r.target === 1).reduce((a, r) => a + r.dmg, 0);
  const crit = e.results.some(r => r.type === 'hit' && r.target === 1 && r.crit);
  const heal = e.results.filter(r => r.type === 'heal' && r.target === 0).reduce((a, r) => a + r.amount, 0);
  const parts = [dmg ? `<b>${fmtNum(dmg)}</b> dégâts${crit ? ' <em>critique</em>' : ''}` : '', heal ? `<b class="g">+${fmtNum(heal)}</b> PV` : ''].filter(Boolean);
  out.innerHTML = `${esc(SPELLS[asked].name)} : ${parts.join(' · ') || 'effet lancé'}`;
  out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop');
}

function startTraining() {
  const cv = document.getElementById('train-cv');
  if (!cv) return;
  resetTraining();
  stopPreviews.push(playTraining(cv, () => {
    const me = mySnap();
    const foe = dummySnap(hero.level);
    trainCast = null;
    trainFight = E.createFight(me, foe, (Math.random() * 2 ** 31) | 0, { maxActions: 30, timeoutWinner: false });
    return { me, foe, result: trainFight };
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
    combat: () => uiIcon('swords'),
    social: () => modeEmblem('players'),
    shop: () => clatCanvas(),
    chests: () => chestCanvas('normal', false),
    bag: () => uiIcon('bag'),
    fights: () => uiIcon('swords'),
    dungeons: () => modeEmblem('dungeons'),
    war: () => modeEmblem('war'),
  };
  app.querySelectorAll('canvas[data-tabicon]').forEach(c => paint(c, src[c.dataset.tabicon](), { scale: 2 }));
}

function countFusable() {
  const seen = new Set();
  let n = 0;
  for (const it of hero.inventory) {
    const key = it.itemId + ':' + it.rarity;
    if (seen.has(key) || it.rarity >= RARITIES.length - 1 || E.fusionLocked(hero, it.rarity)) continue;
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
      <img class="logo-img" src="icons/icon.svg?v=2" alt=""><h1 class="logo">FUZE<span>ARENA</span></h1>
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
      <img class="logo-img" src="icons/icon.svg?v=2" alt=""><h1 class="logo">FUZE<span>ARENA</span></h1>
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
    NET.joinPresence(acc.pseudo, onPresence).catch(() => {});
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
  const raw = E.computeStats({ ...hero, equipped: {}, alloc: {} });   // classe + niveau seulement
  const gx = E.gearExtras(hero);
  const hp = E.maxHp(st, hero.level);
  const pts = E.freePoints(hero);
  const snap = E.snapshot(hero);
  const eq = E.equippedItems(hero);
  const all = E.classSpells(hero.classId);
  const active = hero.spells.map(id => SPELLS[id]).filter(Boolean);
  const others = all.filter(s => !hero.spells.includes(s.id));
  const need = E.xpForLevel(hero.level);
  const power = E.powerScore(snap);
  const defender = acc.heroes.length > 1 && E.strongestHero(acc) === hero;
  const xpPct = hero.level >= MAX_LEVEL ? 100 : Math.round((hero.xp / need) * 100);
  const sets = E.activeSets(hero).filter(a => a.bonus);
  const aff = E.petAffinity(eq.pet && eq.pet.itemId, hero.classId);
  const title = titleOf(acc);
  return `
    <section class="hero-banner cls-${hero.classId}">
      <div class="hb-main">
        <div class="hb-id">
          <div class="hb-name">${nameHtml(acc.pseudo, acc)}</div>
          <div class="hb-title">${title ? `« ${esc(title)} »` : 'Sans titre'}</div>
          <div class="hb-class">${CLASSES[hero.classId].name}${defender ? ' · <b>défenseur</b>' : ''}${acc.war.section ? ` · <span style="color:${WAR.sections[acc.war.section].color}">${WAR.sections[acc.war.section].name}</span>` : ''}</div>
        </div>
        <div class="hb-lvl"><small>NIV.</small><b>${hero.level}</b></div>
      </div>
      <div class="hb-xp"><div style="width:${xpPct}%"></div><span>${hero.level >= MAX_LEVEL ? 'Niveau max !' : `XP ${hero.xp} / ${need}`}</span></div>
      <div class="hb-stats">
        <div><small>Puissance</small><b class="gold">${fmtNum(power)}</b></div>
        <div><small>Vie</small><b>${fmtNum(hp)}</b></div>
        <div><small>Victoires</small><b>${hero.stats.wins}<i>/${hero.stats.wins + hero.stats.losses}</i></b></div>
      </div>
      <div class="hb-chips">
        <span class="pill clat"><canvas class="px" data-clat></canvas>${acc.clat}</span>
        <span class="pill gold"><canvas class="px" data-key></canvas>${hero.keys}</span>
        ${E.getAltXpBonus() > 1 ? `<span class="pill green">Perso secondaire XP ×${E.getAltXpBonus()}</span>` : ''}
        ${E.getXpBonus() > 1 ? `<span class="pill green">Rattrapage +${Math.round((E.getXpBonus() - 1) * 100)} % XP</span>` : ''}
        ${acc.titles.warHero ? `<span class="pill gold">${ico('swords')} Héros de guerre ×${acc.titles.warHero}</span>` : ''}
      </div>
    </section>

    <section class="card train hx hx-gold">
      <div class="hx-head"><span class="hx-ico">${ico('swords')}</span><div><h2>Entraînement</h2><small>Tes stats en action contre l’épouvantail</small></div></div>
      <div class="train-wrap framed"><canvas id="train-cv"></canvas><div class="train-rec" id="train-rec">${trainRecHtml()}</div><i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i></div>
      <div class="hero-switch">
        ${byLevel(acc.heroes).map(([h, i]) => `
          <button class="hs ${i === acc.active ? 'on' : ''}" data-act="switchHero" data-i="${i}" aria-label="${CLASSES[h.classId].name} niveau ${h.level}">
            <canvas class="px" data-portrait="${h.classId}" data-dye="${h.dye || ''}"></canvas><small>Nv.${h.level}</small>
          </button>`).join('')}
      </div>
      ${trainSpellsHtml()}
      <div class="train-stats" id="train-stats">${trainingStatsHtml()}</div>
    </section>

    <section class="card hx hx-blue">
      <div class="hx-head"><span class="hx-ico">${ico('sparkle')}</span><div><h2>Caractéristiques</h2><small>${pts > 0 ? 'Touche les + pour placer tes points' : 'Tu gagnes 3 points à chaque niveau'}</small></div>
        ${pts > 0 ? `<span class="pts-badge">${pts}<small>point${pts > 1 ? 's' : ''}</small></span>` : ''}</div>
      <div class="stat-sum">
        <div><small>${ico('heart')} Vie</small><b>${fmtNum(hp)}</b></div>
        <div><small>${ico('boom')} Critique</small><b>${Math.round(E.finalCrit(st.lck, gx.crit) * 100)} %</b><i>${gx.crit ? `dont +${pctTxt(gx.crit)} équip.` : 'max 40 %'}</i></div>
        <div><small>${ico('wind')} Esquive</small><b>${Math.round(E.finalDodge(st.lck, gx.dodge) * 100)} %</b><i>${gx.dodge ? `dont +${pctTxt(gx.dodge)} équip.` : 'max 25 %'}</i></div>
      </div>
      <div class="stat-legend">
        <span><i class="sl-base"></i>Base (classe + niveau)</span>
        <span><i class="sl-pts"></i>Tes points</span>
        <span><i class="sl-eq"></i>Équipement</span>
      </div>
      ${STAT_KEYS.map(k => `
        <div class="stat-row" style="--sc:${STATS[k].color}">
          <span class="st-ico">${STAT_ICO[k]}</span>
          <div style="flex:1;min-width:0">
            <div class="stat-name">${STATS[k].name}</div>
            <div class="stat-desc">${STATS[k].desc}</div>
            <div class="st-bar"><i style="width:${Math.round(100 * st[k] / Math.max(...STAT_KEYS.map(x => st[x])))}%"></i></div>
          </div>
          <div class="stat-val">${st[k]}
            <div class="stat-split">
              <span class="sl-base">${raw[k]}</span>
              ${(hero.alloc[k] || 0) > 0 ? `<span class="sl-pts">+${hero.alloc[k]}</span>` : ''}
              ${st[k] - base[k] > 0 ? `<span class="sl-eq">+${st[k] - base[k]}</span>` : ''}
            </div>
          </div>
          <button class="plus" data-act="addStat" data-k="${k}" ${pts > 0 ? '' : 'disabled'}>+</button>
        </div>`).join('')}
      ${sets.length || aff ? `
        <div class="bonus-box">
          <div class="sub" style="margin:0 0 6px">BONUS ACTIFS</div>
          ${sets.map(a => `<div class="set-line on">${SETS[a.setId].name} (${a.count} pièces) : ${bonusText(a.bonus)}</div>`).join('')}
          ${aff ? `<div class="set-line on">Familier ${esc(ITEMS[eq.pet.itemId].name)} : +5 % ${STATS[aff.stat].name}</div>` : ''}
        </div>` : ''}
      ${E.spentPoints(hero) > 0 ? `<div class="derived"><span class="spacer"></span><button class="btn small" data-act="resetStats" ${acc.clat < STAT_RESET_COST ? 'disabled' : ''}>Replacer mes points · ${STAT_RESET_COST}<canvas class="px" data-clat></canvas></button></div>` : ''}
    </section>

    <section class="card spells-card hx cls-${hero.classId}">
      <div class="hx-head"><span class="hx-ico">${ico('magic')}</span><div><h2>Sorts</h2><small>${MAX_ACTIVE_SPELLS} sorts en combat · touche un sort pour l’équiper ou le retirer</small></div></div>
      <div class="spell-slots">
        ${Array.from({ length: MAX_ACTIVE_SPELLS }, (_, i) => {
          const sp = active[i];
          return sp
            ? `<button class="sslot filled" data-act="spellInfo" data-id="${sp.id}"><canvas class="px" data-spell="${sp.id}"></canvas><small>${esc(sp.name)}</small></button>`
            : `<div class="sslot"><span class="sempty">Vide</span></div>`;
        }).join('')}
      </div>
      <div class="sub">TA COLLECTION · ${all.filter(s => s.lvl <= hero.level).length} / ${all.length} DÉBLOQUÉS</div>
      <div class="spell-grid">
        ${all.map(sp => {
          const locked = sp.lvl > hero.level;
          const pos = hero.spells.indexOf(sp.id);
          return `<button class="sgrid ${locked ? 'locked' : ''} ${pos >= 0 ? 'on' : ''}" data-act="spellInfo" data-id="${sp.id}">
            <canvas class="px" data-spell="${sp.id}"></canvas>
            ${locked ? `<span class="slock">Nv.${sp.lvl}</span>` : ''}
            <small>${esc(sp.name)}</small>
          </button>`;
        }).join('')}
      </div>
    </section>`;
}

/** Fiche d'un sort : l'équiper, le retirer ou changer sa place */
function openSpell(id) {
  const sp = SPELLS[id];
  if (!sp) return;
  const locked = sp.lvl > hero.level;
  const pos = hero.spells.indexOf(id);
  const active = hero.spells.map(x => SPELLS[x]).filter(Boolean);
  const full = active.length >= MAX_ACTIVE_SPELLS;
  openModal(`
    <div class="item-head">
      <div class="big-ic spell-ic"><canvas class="px" data-spell="${id}"></canvas></div>
      <div>
        <h3>${esc(sp.name)}</h3>
        <div class="rar" style="color:var(--gold)">${locked ? `Débloqué au niveau ${sp.lvl}` : pos >= 0 ? 'Équipé' : 'Dans ta collection'}</div>
        <div style="color:var(--muted);font-size:13px;margin-top:6px">Recharge : ${sp.cd} tours${sp.lvl > 1 ? ` · sort du niveau ${sp.lvl}` : ''}</div>
      </div>
    </div>
    <p style="margin:0 0 6px;line-height:1.45">${esc(sp.desc)}</p>
    ${locked ? '<p class="hint" style="margin-top:10px">Monte de niveau pour le débloquer.</p>' : pos >= 0 ? '' : full ? `
      <div class="sub">REMPLACER UN SORT ÉQUIPÉ</div>
      <div class="spell-replace">
        ${active.map((o, i) => `<button class="sslot filled" data-act="spellReplace" data-id="${id}" data-i="${i}"><canvas class="px" data-spell="${o.id}"></canvas><small>${esc(o.name)}</small></button>`).join('')}
      </div>` : ''}
    <div class="close-row">
      ${locked ? '' : pos >= 0 ? `<button class="btn danger" data-act="spellRemove" data-id="${id}">Retirer</button>` : full ? '' : `<button class="btn primary" data-act="spellEquip" data-id="${id}">Équiper</button>`}
      <button class="btn" data-act="closeModal">Fermer</button>
    </div>`);
}

// ------------------------------ Vue Coffres ------------------------------
function viewChests() {
  const n = hero.chest.stored;
  const keys = hero.keys || 0;
  const all = n + keys;
  const wait = E.nextChestIn(hero);
  const total = all + acc.combatChests + acc.warChests;
  // barre des chances de rareté
  const oddsBar = (odds) => `
    <div class="odds-bar">${odds.map((p, r) => p > 0 ? `<i style="flex:${p};background:${RARITIES[r].color}"></i>` : '').join('')}</div>
    <div class="odds-legend">${odds.map((p, r) => p > 0 ? `<span><b style="background:${RARITIES[r].color}"></b>${RARITIES[r].name} ${p} %</span>` : '').join('')}</div>`;
  // compteur d'ouvertures depuis le début et bonus de chance
  const luckLine = (kind) => {
    const L = E.chestLuck(acc, kind);
    return `<div class="v-luck"><span><b>${L.count}</b> ouvert${L.count > 1 ? 's' : ''}</span>${L.bonus ? `<span class="lk">Bonus +${L.bonus} %</span>` : ''}<span>${L.next ? `Bonus +2 % dans <b>${L.next}</b>` : 'Bonus au maximum'}</span></div>`;
  };
  const card = ({ kind, title, sub, count, cls, body, buttons, odds }) => `
    <section class="vault ${cls} ${count > 0 ? 'has' : ''}">
      <div class="v-head"><h2>${title}</h2><span class="v-count">×${count}</span></div>
      <div class="v-stage"><div class="v-rays"></div><canvas class="px" data-chest="${kind}"></canvas></div>
      <div class="v-sub">${sub}</div>
      ${body || ''}
      <div class="v-btns">${buttons}</div>
      ${luckLine(kind)}
      ${oddsBar(odds)}
    </section>`;
  return `
    <section class="vault-top">
      <div><h1>Salle des coffres</h1><p>${total ? `<b>${total}</b> coffre${total > 1 ? 's' : ''} à ouvrir pour ton ${CLASSES[hero.classId].name}` : 'Aucun coffre à ouvrir pour l’instant'}</p></div>
      <span class="pill gold"><canvas class="px" data-key></canvas>${keys} clef${keys > 1 ? 's' : ''}</span>
    </section>
    ${card({
      kind: 'normal', title: 'Coffre', count: all, cls: 'v-normal', odds: E.chestOdds(acc, 'normal'),
      sub: n >= CHEST_MAX ? 'Stock plein ! Ouvre-les vite.' : `<span data-timer="chest">Prochain coffre dans <b>${fmt(wait)}</b></span>`,
      body: `<div class="v-stock">${Array.from({ length: CHEST_MAX }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}<span>${n}/${CHEST_MAX} en stock${keys ? ` + ${keys} clef${keys > 1 ? 's' : ''}` : ''}</span></div>`,
      buttons: `<button class="btn primary" data-act="openChest" data-kind="normal" ${all > 0 ? '' : 'disabled'}>Ouvrir${n <= 0 && keys > 0 ? ' (clef)' : ''}</button>
        <button class="btn green" data-act="openAll" ${all > 1 ? '' : 'disabled'}>${all > OPEN_MAX ? `Ouvrir ${OPEN_MAX}` : `Tout ouvrir (${all})`}</button>`,
    })}
    ${card({
      kind: 'combat', title: 'Coffre de combat', count: acc.combatChests, cls: 'v-combat', odds: E.chestOdds(acc, 'combat'),
      sub: `Gagne ${WINS_PER_COMBAT_CHEST} combats d’arène pour en obtenir un. Il contient <b>2 objets</b> !`,
      body: `<div class="pips">${Array.from({ length: WINS_PER_COMBAT_CHEST }, (_, i) => `<div class="pip ${i < acc.winProgress ? 'on' : ''}"></div>`).join('')}</div>`,
      buttons: `<button class="btn danger" data-act="openChest" data-kind="combat" ${acc.combatChests > 0 ? '' : 'disabled'}>Ouvrir</button>`,
    })}
    ${card({
      kind: 'war', title: 'Coffre de guerre', count: acc.warChests, cls: 'v-war', odds: E.chestOdds(acc, 'war'),
      sub: `Gagné à la guerre des sections et au raid. <b>${WAR.warChestItems} objets</b>, jamais de Commun !`,
      buttons: `<button class="btn" style="background:linear-gradient(#d9a8ff,#8c3fe0)" data-act="openChest" data-kind="war" ${acc.warChests > 0 ? '' : 'disabled'}>Ouvrir</button>`,
    })}`;
}

// ------------------------------ Vue Sac ------------------------------
let bagMode = 'rarity';   // 'rarity' = classé par rareté, 'slot' = par emplacement (arme, chapeau…), 'set' = par panoplie
let bagSet = 'all';       // panoplie affichée ('all', un id de panoplie ou 'pet')

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

const groupOf = (itemId) => ITEMS[itemId].set || 'pet';
const STAT_ICO = { vit: 'VIE', atk: 'ATQ', mag: 'MAG', def: 'DÉF', spd: 'VIT', lck: 'CHA' };
const SLOT_GLYPH = { hat: ico('helmet'), weapon: ico('swords'), armor: ico('shield'), boots: ico('boot'), amulet: ico('amulet'), pet: ico('paw') };
const groupName = (g) => (g === 'pet' ? 'Familiers' : SETS[g].name.replace(/^Panoplie (de |d’|du )?/, ''));

function invGrid(list) {
  return `<div class="inv">${list.map(s => `
    <button class="it r${s.rarity}" style="--rc:${RARITIES[s.rarity].color}" data-act="item" data-id="${s.itemId}" data-r="${s.rarity}">
      <canvas class="px" data-icon="${s.itemId}"></canvas>
      ${s.items.length > 1 ? `<span class="n">x${s.items.length}</span>` : ''}
      ${s.equipped ? '<span class="eq">ÉQUIPÉ</span>' : ''}
      ${s.items.length >= 2 && s.rarity < RARITIES.length - 1 && !E.fusionLocked(hero, s.rarity) ? '<span class="fu">✦</span>' : ''}
    </button>`).join('')}</div>`;
}

/** Choix d'un objet pour un emplacement : l'objet porté en haut, puis tous ceux qui vont à cet endroit */
function openSlotPicker(slot) {
  const cur = E.equippedItems(hero)[slot];
  const list = stacks().filter(s => ITEMS[s.itemId].slot === slot);
  const statsTxt = (itemId, r) => Object.entries(E.itemStats(itemId, r)).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([k, v]) => `<i style="color:${STATS[k].color}">+${v} ${STATS[k].short}</i>`).join(' ');
  const row = (s) => `
    <button class="pick-row ${s.equipped ? 'on' : ''}" style="--rc:${RARITIES[s.rarity].color}" data-act="${s.equipped ? 'item' : 'equip'}" data-id="${s.itemId}" data-r="${s.rarity}">
      <span class="it r${s.rarity} pick-ic" style="--rc:${RARITIES[s.rarity].color}"><canvas class="px" data-icon="${s.itemId}"></canvas>${s.items.length > 1 ? `<span class="n">x${s.items.length}</span>` : ''}</span>
      <span class="pick-txt"><b>${esc(ITEMS[s.itemId].name)}</b><small style="color:${RARITIES[s.rarity].color}">${RARITIES[s.rarity].name}${ITEMS[s.itemId].set ? ` · ${esc(SETS[ITEMS[s.itemId].set].name)}` : ''}</small><small class="pick-st">${statsTxt(s.itemId, s.rarity)}</small></span>
      <span class="pick-go">${s.equipped ? 'Porté' : 'Équiper'}</span>
    </button>`;
  openModal(`
    <h3>${SLOT_GLYPH[slot]} ${SLOTS[slot].name}</h3>
    <p class="hint" style="margin-top:4px">${list.length ? 'Touche un objet pour l’équiper tout de suite.' : 'Aucun objet pour cet emplacement : va ouvrir des coffres !'}</p>
    <div class="pick-list">${list.map(row).join('')}</div>
    <div class="close-row">
      ${cur ? `<button class="btn" data-act="item" data-id="${cur.itemId}" data-r="${cur.rarity}">Voir la fiche</button><button class="btn danger" data-act="unequip" data-slot="${slot}">Retirer</button>` : ''}
      <button class="btn" data-act="closeModal">Fermer</button>
    </div>`);
}

function viewBag() {
  const eq = E.equippedItems(hero);
  const slotHtml = (slot) => {
    const it = eq[slot];
    return it
      ? `<button class="slot filled r${it.rarity}" style="--rc:${RARITIES[it.rarity].color}" data-act="slotPick" data-slot="${slot}"><canvas class="px" data-icon="${it.itemId}"></canvas><span class="sl-name">${SLOTS[slot].name}</span></button>`
      : `<button class="slot empty-slot" data-act="slotPick" data-slot="${slot}"><span class="sl-ghost">${SLOT_GLYPH[slot]}</span><span class="sl-name">${SLOTS[slot].name}</span></button>`;
  };
  const power = E.powerScore(E.snapshot(hero));
  const filled = Object.keys(eq).length;
  const setsOn = E.activeSets(hero).filter(a => a.bonus);
  const st = stacks();
  const eqUids = new Set(Object.values(hero.equipped));
  const commons = hero.inventory.filter(i => i.rarity === 0 && !eqUids.has(i.uid)).length;
  let body = '';
  if (!st.length) body = '<p class="empty">Ton sac est vide. Va ouvrir des coffres !</p>';
  else if (bagMode === 'rarity') {
    body = [...RARITIES].reverse().map(R => {
      const list = st.filter(s => s.rarity === R.id);
      if (!list.length) return '';
      const n = list.reduce((t, s) => t + s.items.length, 0);
      return `<div class="bag-head r${R.id}" style="--rc:${R.color}"><i class="gem"></i><span>${R.name}</span><small>${n} objet${n > 1 ? 's' : ''} · revente ${SELL_PRICE[R.id]} Flouze</small></div>${invGrid(list)}`;
    }).join('');
  } else if (bagMode === 'slot') {
    // par emplacement : chapeaux, armes, armures… (les plus rares d'abord), avec l'objet porté
    body = SLOT_ORDER.map(slot => {
      const list = st.filter(s => ITEMS[s.itemId].slot === slot).sort((a, b) => b.rarity - a.rarity);
      if (!list.length) return '';
      const n = list.reduce((t, s) => t + s.items.length, 0);
      const worn = hero.inventory.find(i => i.uid === hero.equipped[slot]);
      return `<div class="bag-head set"><span>${SLOTS[slot].name}</span><small>${n} objet${n > 1 ? 's' : ''}${worn ? ` · porté : ${esc(ITEMS[worn.itemId].name)} (${RARITIES[worn.rarity].name})` : ''}</small></div>${invGrid(list)}`;
    }).join('');
  } else {
    const groups = [...Object.keys(SETS), 'pet'];
    const owned = (g) => st.filter(s => groupOf(s.itemId) === g);
    const chips = `<div class="chips">
      <button class="chip ${bagSet === 'all' ? 'on' : ''}" data-act="bagSet" data-id="all">Toutes</button>
      ${groups.filter(g => owned(g).length).map(g => `<button class="chip ${bagSet === g ? 'on' : ''}" data-act="bagSet" data-id="${g}">${groupName(g)} <small>${owned(g).length}</small></button>`).join('')}
    </div>`;
    const show = bagSet === 'all' ? groups : [bagSet];
    body = chips + show.map(g => {
      const list = owned(g);
      if (!list.length) return bagSet === 'all' ? '' : '<p class="empty">Aucun objet de cette panoplie.</p>';
      if (g === 'pet') return `<div class="bag-head set"><span>Familiers</span><small>affinité + attaque en combat</small></div>${invGrid(list)}`;
      const slots = new Set(list.map(s => ITEMS[s.itemId].slot));
      const worn = (E.activeSets(hero).find(a => a.setId === g) || {}).count || 0;
      return `<div class="bag-head set"><span>${SETS[g].name}</span><small>${slots.size}/5 pièces trouvées · ${worn} portée${worn > 1 ? 's' : ''}</small></div>
        <div class="set-mini"><span class="${worn >= 3 ? 'on' : ''}">3 : ${bonusText(SETS[g].bonus3)}</span><span class="${worn >= 5 ? 'on' : ''}">5 : ${bonusText(SETS[g].bonus5)}</span></div>
        ${invGrid(list.sort((a, b) => SLOT_ORDER.indexOf(ITEMS[a.itemId].slot) - SLOT_ORDER.indexOf(ITEMS[b.itemId].slot) || b.rarity - a.rarity))}`;
    }).join('');
  }
  return `
    <section class="arm-top cls-${hero.classId}">
      <div class="at-main">
        <div><h1>Armurerie</h1><p>${CLASSES[hero.classId].name} Nv.${hero.level}</p></div>
        <div class="at-power"><small>PUISSANCE</small><b>${fmtNum(power)}</b></div>
      </div>
      <div class="at-chips">
        <span class="pill ${filled === 6 ? 'gold' : ''}">${ico('swords')} ${filled}/6 équipés</span>
        <span class="pill">${ico('bag')} ${hero.inventory.length} objet${hero.inventory.length > 1 ? 's' : ''}</span>
        ${setsOn.length ? setsOn.map(a => `<span class="pill green">${groupName(a.setId)} ${a.count}/5</span>`).join('') : '<span class="pill">Aucune panoplie active</span>'}
      </div>
    </section>
    <section class="card armory cls-${hero.classId}">
      <div class="doll">
        <div class="doll-col">${['hat', 'armor', 'boots'].map(slotHtml).join('')}</div>
        <div class="doll-stage"><canvas class="px" data-doll="${hero.classId}" data-pet="${eq.pet ? eq.pet.itemId : ''}" data-dye="${hero.dye || ''}"></canvas>
          <div class="doll-name">${CLASSES[hero.classId].name} <span>Nv.${hero.level}</span></div></div>
        <div class="doll-col">${['weapon', 'amulet', 'pet'].map(slotHtml).join('')}</div>
      </div>
    </section>
    <section class="card hx bag-card ${infoCls('bag')}" data-info="bag" style="--hc:#c9a24a">
      ${secHead(ico('bag'), 'Sac', `${hero.inventory.length} objet${hero.inventory.length > 1 ? 's' : ''}${countFusable() ? ` · <b class="fuse-hint">${countFusable()} fusion${countFusable() > 1 ? 's' : ''} possible${countFusable() > 1 ? 's' : ''}</b>` : ''}`)}
      <div class="rar-strip">${RARITIES.map(R => { const n = hero.inventory.filter(i => i.rarity === R.id).length; return `<div class="${n ? '' : 'none'}" style="--rc:${R.color}"><i></i><b>${n}</b><small>${R.name}</small></div>`; }).join('')}</div>
      <div class="seg seg3" style="margin-bottom:12px">
        <button class="${bagMode === 'rarity' ? 'on' : ''}" data-act="bagMode" data-mode="rarity">Par rareté</button>
        <button class="${bagMode === 'slot' ? 'on' : ''}" data-act="bagMode" data-mode="slot">Par type</button>
        <button class="${bagMode === 'set' ? 'on' : ''}" data-act="bagMode" data-mode="set">Par panoplie</button>
      </div>
      ${countFusable() ? `<button class="btn small block fuse-all" style="margin-bottom:12px;background:linear-gradient(#c58bff,#8c3fe0)" data-act="fuseAll">${ico('sparkle')} Tout fusionner</button>` : ''}
      ${body}
      ${commons ? `<button class="btn small block sell-all" style="margin-top:14px" data-act="sellCommons">Vendre tous les Communs non équipés (${commons}) · +${commons * SELL_PRICE[0]}<canvas class="px" data-clat></canvas></button>` : ''}
      <div class="more-txt">2 objets identiques (même objet, même rareté) = 1 objet de la rareté au-dessus. Mythique et Chaotique ne s’obtiennent que par fusion, et la fusion en Chaotique s’ouvre au niveau ${E.CHAOS_LEVEL}. Touche un objet pour l’équiper, le fusionner ou le vendre. L’objet équipé n’est jamais vendu.</div>
      ${moreBtn('bag')}
    </section>`;
}

/** Liste des objets obtenus par « Tout fusionner », les plus rares d'abord */
function fuseSummary(made) {
  const groups = {};
  for (const it of made) (groups[it.itemId + ':' + it.rarity] ||= { ...it, n: 0 }).n++;
  return Object.values(groups).sort((a, b) => b.rarity - a.rarity).map(g => `
    <div class="fl-row" style="--rc:${RARITIES[g.rarity].color}">
      <span class="it r${g.rarity}" style="--rc:${RARITIES[g.rarity].color}"><canvas class="px" data-icon="${g.itemId}"></canvas></span>
      <b>${esc(ITEMS[g.itemId].name)}</b><small>${RARITIES[g.rarity].name}${g.n > 1 ? ` ×${g.n}` : ''}</small>
    </div>`).join('');
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

const pctTxt = (v) => `${Math.round(v * 1000) / 10} %`;
/** Lignes « Critique » / « Esquive » d'un objet (armes et bottes), comparées à l'objet porté */
function extraLines(itemId, rarity, cur) {
  const x = E.itemExtras(itemId, rarity);
  const c = cur ? E.itemExtras(cur.itemId, cur.rarity) : null;
  const line = (name, color, v, old) => {
    const d = c ? Math.round((v - old) * 1000) / 10 : 0;
    return `<div class="st-line"><span style="color:${color}">${name}</span><span>+${pctTxt(v)}${d ? ` <span class="${d > 0 ? 'up' : 'down'}">(${d > 0 ? '+' : ''}${d} %)</span>` : ''}</span></div>`;
  };
  return (x.crit ? line('Coups critiques', '#ffd45a', x.crit, c ? c.crit : 0) : '') + (x.dodge ? line('Esquive', '#7fd6ff', x.dodge, c ? c.dodge : 0) : '');
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
  const locked = E.fusionLocked(hero, rarity);
  const canFuse = stack.length >= 2 && rarity < RARITIES.length - 1 && !locked;
  const spare = stack.filter(s => s.uid !== curUid).length;
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
    ${extraLines(itemId, rarity, cur)}
    ${it.set ? setBox(it.set) : ''}
    ${PETS[itemId] ? petBox(itemId, rarity) : ''}
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
      </div>` : locked ? `<p class="hint" style="margin-top:12px">La fusion en <b style="color:${next.color}">${next.name}</b> s’ouvre au <b>niveau ${E.CHAOS_LEVEL}</b> (ton ${CLASSES[hero.classId].name} est niveau ${hero.level})${stack.length < 2 ? ' : garde aussi un 2ᵉ exemplaire' : ''}.</p>`
      : (rarity < RARITIES.length - 1 ? `<p class="hint" style="margin-top:12px">Trouve un 2ᵉ exemplaire pour le fusionner en <b style="color:${next.color}">${next.name}</b>.</p>` : `<p class="hint" style="margin-top:12px">Rareté maximale !</p>`)}
    ${spare ? `
      <div class="sell-box">
        <span>Revente : <b>${SELL_PRICE[rarity]}</b> Flouze pièce${isEq ? ' (l’objet équipé est gardé)' : ''}</span>
        <div class="row" style="gap:6px;margin-top:8px">
          <button class="btn small" style="flex:1" data-act="sell" data-id="${itemId}" data-r="${rarity}" data-n="1">Vendre 1 · +${SELL_PRICE[rarity]}<canvas class="px" data-clat></canvas></button>
          ${spare > 1 ? `<button class="btn small" style="flex:1" data-act="sell" data-id="${itemId}" data-r="${rarity}" data-n="${spare}">Vendre les ${spare} · +${spare * SELL_PRICE[rarity]}<canvas class="px" data-clat></canvas></button>` : ''}
        </div>
      </div>` : ''}
    <div class="close-row">
      ${isEq
        ? `<button class="btn" data-act="unequip" data-slot="${slot}">Retirer</button>`
        : `<button class="btn primary" data-act="equip" data-id="${itemId}" data-r="${rarity}">Équiper</button>`}
      <button class="btn" data-act="closeModal">Fermer</button>
    </div>`);
}

/** Fiche d'un familier : son affinité de classe et son attaque */
function petBox(itemId, rarity) {
  const P = PETS[itemId];
  const on = P.aff[0] === hero.classId;
  const boost = Math.round(20 * rarity);
  return `
    <div class="set-box pet-box">
      <div class="row"><b>Attaque : ${esc(P.atk.name)}</b><span class="spacer"></span><span class="pill">toutes les ${PET_EVERY} actions</span></div>
      <div class="set-line">${esc(P.atk.desc)}${boost ? ` <b style="color:var(--green)">+${boost} % (rareté)</b>` : ''}</div>
      <div class="set-line ${on ? 'on' : ''}">Affinité ${CLASSES[P.aff[0]].name} : +5 % ${STATS[P.aff[1]].name}${on ? ' ✓' : ` (ton perso est ${CLASSES[hero.classId].name})`}</div>
    </div>`;
}

// ------------------------------ Vue Combats ------------------------------
// ------------------------------ En-tête commun des modes de combat ------------------------------
/** Bandeau d'un mode : dessin, titre, 3 compteurs, et les règles cachées derrière le « + » jaune */
function modeHead({ id, c, art, title, sub, chips = [], extra = '', info }) {
  return `
    <section class="card mhead ${infoCls(id)}" data-info="${id}" style="--tc:${c}">
      <div class="mh-top">
        <span class="mh-art">${art}</span>
        <div class="mh-txt"><h2>${title}</h2><small>${sub}</small></div>
      </div>
      ${chips.length ? `<div class="mh-chips">${chips.join('')}</div>` : ''}
      ${extra}
      <div class="more-txt">${info}</div>
      ${moreBtn(id)}
    </section>`;
}
const mchip = (ico, label, val, cls = '') => `<div class="mchip ${cls}"><span class="mc-ico">${ico}</span><small>${label}</small><b>${val}</b></div>`;
const secHead = (ico, title, sub = '', right = '') => `<div class="hx-head"><span class="hx-ico">${ico}</span><div><h2>${title}</h2>${sub ? `<small>${sub}</small>` : ''}</div>${right}</div>`;
/** Sa puissance comparée à la tienne */
function powerCmp(foeSnap) {
  const r = E.powerScore(foeSnap) / Math.max(1, E.powerScore(E.snapshot(hero)));
  if (r > 1.12) return '<span class="cmp hard">Costaud</span>';
  if (r < 0.88) return '<span class="cmp easy">Facile</span>';
  return '<span class="cmp even">Serré</span>';
}
const foeAv = (o) => `<span class="foe-av"><canvas class="px" data-portrait="${o.classId}" data-dye="${o.dye || ''}"></canvas></span>`;
const foeInfo = (o, data = o.data) => `
  <div class="foe-body">
    <div class="foe-name">${dotHtml(o.id)}${nameHtml(o.name, data)}</div>
    <div class="foe-sub">${CLASSES[o.classId].name} · Nv.${o.level} · ${ico('bolt')}${E.powerScore(o.snap)}</div>
    ${powerCmp(o.snap)}
  </div>`;

function viewFights() {
  const list = opponents();
  const todo = list.filter(o => !o.done), done = list.filter(o => o.done);
  const clatGot = acc.fights.clat || {};
  return modeHead({
    id: 'arena', c: '#ff5d6c', art: '<canvas class="px" data-emblem="arena"></canvas>',
    title: 'Arène', sub: 'Affronte chacun de tes potes une fois par jour',
    chips: [
      mchip(ico('swords'), 'Combats classés', `${todo.length} / ${list.length}`, todo.length ? 'hot' : ''),
      mchip('<canvas class="px" data-chest="combat"></canvas>', 'Coffre de combat', `${acc.winProgress} / ${WINS_PER_COMBAT_CHEST}`),
      mchip(ico('clock'), 'Remise à zéro', `<span data-timer="day3">${fmt(msToMidnight())}</span>`),
    ],
    info: `<b>${ico('swords')} Combat classé</b> : un par pote et par jour. Chaque victoire avance ton coffre de combat (${WINS_PER_COMBAT_CHEST} victoires = 1 coffre). Tout repart à zéro à minuit. L’Arène ne rapporte pas d’XP.<br><br>
      <b>↻ Revanche</b> : une fois le combat classé fait, rejoue autant que tu veux, pour le fun. La 1ʳᵉ revanche gagnée contre chaque pote rapporte <b>1 Flouze</b> par jour.<br><br>
      <b>Costaud · Serré · Facile</b> : sa puissance comparée à la tienne.`,
  }) + `
    <section class="card hx" style="--hc:#ff5d6c">
      ${secHead(ico('swords'), 'À combattre', 'Combat classé : coffre de combat', `<span class="pill ${todo.length ? 'red' : 'green'}">${todo.length}</span>`)}
      ${!list.length ? `<p class="empty">${NET.online ? 'Personne d’autre n’est encore inscrit. Invite tes potes !' : 'Aucun adversaire.'}</p>`
        : !todo.length ? '<div class="all-done">✓ Tous tes combats classés sont faits !<small>Nouveaux combats à minuit. En attendant, fais des revanches.</small></div>' : ''}
      ${todo.map(o => `
        <div class="foe todo">${foeAv(o)}${foeInfo(o)}
          <button class="foe-btn fight" data-act="fight" data-id="${o.id}"><i>${ico('swords')}</i>Combattre</button>
        </div>`).join('')}
    </section>
    ${done.length ? `
    <section class="card hx" style="--hc:#9d93d6">
      ${secHead('↻', 'Déjà affrontés', 'Revanches illimitées, pour le fun')}
      ${done.map(o => {
        const won = o.done === 'win';
        return `
        <div class="foe ${won ? 'win' : 'loss'}">${foeAv(o)}<span class="foe-res">${won ? 'GAGNÉ' : 'PERDU'}</span>${foeInfo(o)}
          <button class="foe-btn re" data-act="friendly" data-id="${o.id}"><i>↻</i>Revanche<small>${clatGot[o.id] ? 'pour le fun' : '+1 Flouze'}</small></button>
        </div>`;
      }).join('')}
    </section>` : ''}`;
}

// ------------------------------ Vue Donjons ------------------------------
function viewDungeons() {
  const left = E.totalRunsLeft(hero);
  return modeHead({
    id: 'dungeons', c: '#4cd964', art: '<canvas class="px" data-emblem="dungeons"></canvas>',
    title: 'Donjons', sub: 'Bats les boss pour gagner des clefs',
    chips: [
      mchip(ico('swords'), 'Combats dispo', left, left ? 'hot' : ''),
      mchip('<canvas class="px" data-key></canvas>', 'Clefs gagnées', `${E.keysEarned(hero)} / ${DUNGEON_KEYS_MAX}`, E.keysLeftToEarn(hero) ? '' : 'full'),
      mchip(ico('clock'), 'Remise à zéro', `<span data-timer="half">${fmt(E.msToNextHalf())}</span>`),
    ],
    info: `Chaque entrée est une <b>vague</b> : 2 monstres différents d’affilée, puis le boss. Tes PV ne remontent presque pas entre deux combats : si tu tombes, la vague s’arrête. Chaque donjon a <b>2 boss possibles</b>, tirés au hasard.<br><br>
      Chaque donjon se fait <b>${DUNGEON_RUNS} fois toutes les 12 h</b> (minuit et midi), pour chacun de tes persos.<br><br>
      Bats le boss : de l’XP et <b>1 clef</b> (1 clef = 1 coffre), jusqu’à <b>${DUNGEON_KEYS_MAX} clefs toutes les 12 h</b>. Ensuite, tu gagnes seulement l’XP. Chaque monstre battu rapporte un peu d’XP en plus, et même en cas de défaite tu gagnes un peu d’XP.<br><br>
      <b>${ico('skip')} Passer</b> : tes ${DUNGEON_SKIP_KEEP} donjons débloqués les plus durs se font en vrai. Les autres peuvent être passés d’un coup : tu reçois les récompenses de tes vagues restantes, mais avec <b>la moitié de l’XP</b>.`,
  }) + `
    <section class="card hx" style="--hc:#4cd964">
      ${secHead(ico('skull'), 'Choisis ton donjon', `${DUNGEONS.filter(d => hero.level >= d.lvl).length} / ${DUNGEONS.length} débloqués`)}
      ${DUNGEONS.map(d => {
        const locked = hero.level < d.lvl, n = E.runsLeft(hero, d), clears = hero.dungeonClears[d.id] || 0;
        const skip = !locked && n > 0 && E.canSkipDungeon(hero, d), keyOk = E.keysLeftToEarn(hero) > 0;
        return `
        <div class="dgn ${locked ? 'locked' : n ? '' : 'empty'}">
          <div class="dgn-art"><canvas class="px" data-monster="${d.sprite}"></canvas>${d.alt ? `<canvas class="px alt" data-monster="${d.alt.sprite}"></canvas>` : ''}</div>
          <div class="dgn-body">
            <div class="dgn-name">${d.name}</div>
            <div class="dgn-sub">${d.boss}${d.alt ? ` ou ${d.alt.boss}` : ''}</div>
            ${locked ? `<div class="dgn-lock">${ico('lock')} Niveau ${d.lvl} requis</div>`
              : `<div class="dgn-rw"><span>+${E.waveXp(d)} XP</span><span class="${keyOk ? '' : 'off'}"><canvas class="px" data-key></canvas>+1</span>${clears ? `<em>vaincu ${clears}×</em>` : ''}</div>`}
          </div>
          ${locked ? '' : `
          <div class="dgn-go">
            <button class="foe-btn fight" data-act="dungeon" data-id="${d.id}" ${n > 0 ? '' : 'disabled'}><i class="emo"><canvas class="px" data-emblem="skull"></canvas></i>${n > 0 ? 'Entrer' : 'Fini'}</button>
            ${skip ? `<button class="btn small blue skip-btn" data-act="skipDungeon" data-id="${d.id}">${ico('skip')} Passer ×${n}<small>½ XP</small></button>`
              : `<span class="runs">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(DUNGEON_RUNS - n)}</span>`}
          </div>`}
        </div>`;
      }).join('')}
    </section>`;
}

// ------------------------------ Vue Classement ------------------------------
/** Le familier équipé d'un perso (pour l'afficher) */
const petOf = (h) => { const uid = h.equipped && h.equipped.pet; const it = uid && h.inventory.find(i => i.uid === uid); return it ? it.itemId : ''; };

function rankingEntries(key = rankMode) {
  ensureDay();
  const wins = (a) => a.heroes.reduce((t, h) => t + h.stats.wins, 0);
  const tow = (a) => Math.max(0, ...a.heroes.map(h => (h.tower && h.tower.best) || 0));
  const sh = E.strongestHero(acc);
  const hor = (a) => (a.horde && a.horde.best) || 0;
  const pow = (h) => Math.round(E.powerScore(E.snapshot(h)));   // puissance du perso le plus fort
  const me = { id: myId(), name: acc.pseudo, data: acc, classId: sh.classId, dye: sh.dye, pet: petOf(sh), level: sh.level, power: pow(sh), wins: wins(acc), tower: tow(acc), horde: hor(acc), me: true };
  let rest;
  if (NET.online) {
    rest = players.map(p => { const h = E.strongestHero(p.data); return { id: p.id, name: p.pseudo, data: p.data, classId: h.classId, dye: h.dye, pet: petOf(h), level: h.level, power: pow(h), wins: wins(p.data), tower: tow(p.data), horde: hor(p.data) }; });
  } else {
    const totalMine = hero.stats.wins + hero.stats.losses;
    rest = opponents().map(o => {
      const r = makeRng(hashStr('rank' + o.id));
      return { name: o.name, classId: o.classId, level: o.level, power: Math.round(E.powerScore(o.snap)), wins: Math.round(totalMine * (0.3 + r() * 0.6)), tower: Math.round(o.level * 0.75), horde: Math.max(1, Math.round(o.level / 4)) };
    });
  }
  return [me, ...rest].sort((a, b) => b[key] - a[key] || b.wins - a.wins || (b.me ? 1 : 0) - (a.me ? 1 : 0));
}

const RANK_MODES = [['level', 'Niveau'], ['wins', 'Victoires'], ['tower', 'Tour'], ['horde', 'Horde']];
const rankScore = (key) => (e) => (key === 'power' ? `Puiss. ${fmtNum(e.power)}` : key === 'level' ? `Nv.${e.level}` : key === 'wins' ? `${e.wins} V` : key === 'tower' ? `Étage ${e.tower}` : `${e.horde} monstres`);

function viewRanking() {
  const list = rankingEntries();
  const key = rankMode;
  const medal = [ico('medal1'), ico('medal2'), ico('medal3')];
  const scoreOf = rankScore(key);
  const myPos = list.findIndex(e => e.me) + 1;
  return modeHead({
    id: 'ranking', c: '#ffd45a', art: '<canvas class="px" data-emblem="ranking"></canvas>',
    title: 'Classement', sub: 'Qui est le plus fort du groupe ?',
    chips: [
      mchip(ico('trophy'), 'Ta place', `${myPos} / ${list.length}`, myPos <= 3 ? 'hot' : ''),
      mchip(ico('medal1'), 'En tête', esc(list[0].name)),
      mchip(ico('star'), 'Ton score', scoreOf(list[myPos - 1])),
    ],
    info: `<b>Niveau</b> : ton perso le plus fort. <b>Victoires</b> : celles de tous tes persos. <b>Tour</b> : ton meilleur étage. <b>Horde</b> : ton record de monstres battus.<br><br>Touche un joueur pour voir sa carte.${NET.online ? '' : '<br><br>Hors ligne : tes amis sont des bots.'}`,
  }) + `
    <section class="card hx" style="--hc:#ffd45a">
      <div class="seg seg4">${RANK_MODES.map(([k, n]) => `<button class="${key === k ? 'on' : ''}" data-act="rank" data-mode="${k}">${n}</button>`).join('')}</div>
      ${podium(list, scoreOf)}
      ${list.slice(3).map((e, j) => ({ e, i: j + 3 })).map(({ e, i }) => `
        <button class="opp rank ${e.me ? 'me' : ''}" ${e.id ? `data-act="playerCard" data-id="${e.id}"` : ''}>
          <div class="pos">${medal[i] || i + 1}</div>
          <div class="av"><canvas class="px" data-portrait="${e.classId}" data-dye="${e.dye || ''}"></canvas></div>
          <div class="o-body">
            <div class="o-name">${dotHtml(e.id)}${nameHtml(e.name, e.data)}${e.me ? ' <span class="pill gold">toi</span>' : ''}</div>
            <div class="o-sub">${CLASSES[e.classId].name} ${titleHtml(e.data)}</div>
          </div>
          <div class="score">${scoreOf(e)}</div>
        </button>`).join('')}
    </section>`;
}

/** Message de podium d'un joueur (les 3 premiers peuvent en écrire un) */
const podMsg = (e) => (e.data && e.data.podiumMsg && e.data.podiumMsg.text) || '';

/** Podium des 3 premiers (2e à gauche, 1er au milieu, 3e à droite), avec leur message au-dessus de la tête */
function podium(list, scoreOf, { bubbles = false } = {}) {
  const top = list.slice(0, 3);
  if (!top.length) return '';
  const order = [1, 0, 2].filter(i => top[i]);
  return `<div class="podium ${bubbles ? 'big' : ''}">${order.map(i => {
    const e = top[i], msg = bubbles ? podMsg(e) : '';
    return `
    <button class="pod p${i + 1} ${e.me ? 'me' : ''}" ${e.id ? `data-act="playerCard" data-id="${e.id}"` : ''}>
      ${msg ? `<span class="pod-bubble">${esc(msg)}</span>` : ''}
      ${i === 0 ? `<span class="pod-crown">${ico('crown')}</span>` : ''}
      <div class="pod-av">${bubbles ? `<canvas class="px" data-hero="${e.classId}" data-pet="${e.pet || ''}" data-dye="${e.dye || ''}"></canvas>` : `<canvas class="px" data-portrait="${e.classId}" data-dye="${e.dye || ''}"></canvas>`}</div>
      <div class="pod-name">${dotHtml(e.id)}${nameHtml(e.name, e.data)}</div>
      <div class="pod-score">${scoreOf(e)}</div>
      <div class="pod-step"><span>${ico(['medal1', 'medal2', 'medal3'][i])}</span><b>${i + 1}</b></div>
    </button>`;
  }).join('')}</div>`;
}

// ------------------------------ Vue Guerre ------------------------------
const fmtLong = (ms) => { const d = Math.floor(ms / 86400000); return (d > 0 ? `${d} j ` : '') + fmt(ms % 86400000); };
const secTag = (sec) => `<b style="color:${WAR.sections[sec].color}">${WAR.sections[sec].name}</b>`;

const WAR_RULES = () => `<details class="rules"><summary>Règles de la guerre</summary>${WAR_RULES_UL()}</details>`;
const WAR_RULES_UL = () => `
    <ul class="rules-ul">
      <li>2 sections de ${WAR.maxPerSection} joueurs maximum. Chacun choisit la sienne. Un changement possible par mois.</li>
      <li>Une guerre dure 7 jours complets, puis la suivante commence aussitôt.</li>
      <li>Chaque jour, tu peux attaquer <b>une fois chaque combattant</b> de l’autre section. Tout repart à zéro à minuit.</li>
      <li>Victoire contre plus fort que toi : <b>+3 pts</b>. Contre un niveau égal : <b>+2</b>. Contre plus faible : <b>+1</b>.</li>
      <li>Si ton attaque échoue, la section adverse gagne <b>+1 pt</b> de défense.</li>
      <li>Fin de semaine : la section avec le plus de points gagne. Ses membres ayant fait au moins ${WAR.minAttacks} attaques reçoivent un <b>Coffre de guerre</b> (${WAR.warChestItems} objets, jamais de Commun).</li>
      <li>La section perdante (${WAR.minAttacks} attaques minimum) reçoit 1 coffre de combat. En cas d’égalité, tout le monde a un coffre de combat.</li>
      <li>Le meilleur marqueur de la semaine devient <b>Héros de guerre</b> et reçoit un coffre de guerre en plus.</li>
    </ul>`;

function viewWar() {
  const war = acc.war;
  const head = (sub, chips, extra = '') => modeHead({
    id: 'war', c: '#3d9bff', art: '<canvas class="px" data-emblem="war"></canvas>',
    title: 'Guerre', sub, chips, extra, info: WAR_RULES_UL(),
  });
  if (!war.section) {
    return head('Choisis ton camp pour la guerre', [], `
      <div class="sec-pick" style="margin-top:12px">
        ${Object.entries(WAR.sections).map(([id, s]) => `
          <button class="sec-card" style="--sc:${s.color}" data-act="joinSection" data-sec="${id}">
            <span class="flag"></span><b>${s.name}</b>
            <small>${NET.online ? `${E.sectionCount(acc, id, players)} / ${WAR.maxPerSection} joueurs` : 'Rejoindre'}</small>
          </button>`).join('')}
      </div>`);
  }
  const mine = war.section, other = E.otherSide(mine);
  const { score, members } = E.warStandings(acc, E.weekKey(), others());
  const total = Math.max(1, score[mine] + score[other]);
  const enemies = opponents().filter(o => o.section === other);
  const allies = members.filter(m => m.section === mine);
  const wk = E.warWeek(acc);
  const myPower = E.powerScore(E.snapshot(hero));
  const left = enemies.filter(o => !war.done[o.id]).length;
  const p = war.pending;
  const outcomeTxt = p && ({ win: 'Victoire de ta section !', loss: 'Défaite de ta section…', tie: 'Égalité !' }[p.outcome]);
  const lead = score[mine] - score[other];
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
    ${head(`Ton camp : ${secTag(mine)}`, [
      mchip(ico('swords'), 'Attaques du jour', `${left} / ${enemies.length}`, left ? 'hot' : ''),
      mchip(ico('star'), 'Tes points', wk.points),
      mchip(ico('hourglass'), 'Fin de la guerre', `<span data-endlong="${Date.now() + E.msToWeekEnd()}">${fmtLong(E.msToWeekEnd())}</span>`),
    ])}
    <section class="card hx" style="--hc:#3d9bff">
      ${secHead(ico('crown'), 'Score de la semaine', lead > 0 ? 'Ta section mène !' : lead < 0 ? 'Ta section est derrière : attaque !' : 'Égalité parfaite')}
      <div class="train-wrap war-wrap"><canvas id="war-cv"></canvas></div>
      <div class="score-row">
        <div>${secTag(mine)}<div class="sc">${score[mine]}</div></div>
        <div class="vs">VS</div>
        <div style="text-align:right">${secTag(other)}<div class="sc">${score[other]}</div></div>
      </div>
      <div class="score-bar"><div style="width:${score[mine] + score[other] ? (score[mine] / total) * 100 : 50}%;background:${WAR.sections[mine].color}"></div><div style="flex:1;background:${WAR.sections[other].color}"></div></div>
      <div class="war-min ${wk.attacks >= WAR.minAttacks ? 'ok' : ''}">${wk.attacks >= WAR.minAttacks ? '✓' : '!'} Tes attaques cette semaine : <b>${wk.attacks} / ${WAR.minAttacks}</b> minimum pour la récompense</div>
    </section>
    <section class="card hx" style="--hc:#ff5d6c">
      ${secHead(ico('swords'), 'Attaquer', `1 attaque par adversaire et par jour · nouvelles dans <span data-timer="day3">${fmt(msToMidnight())}</span>`, `<span class="pill ${left ? 'red' : 'green'}">${left}</span>`)}
      ${enemies.length ? '' : '<p class="empty">Personne dans l’autre section pour l’instant.</p>'}
      ${enemies.map(o => {
        const done = war.done[o.id];
        const pts = E.warPoints(myPower, E.powerScore(o.snap));
        return `
        <div class="foe ${done ? (done === 'win' ? 'win' : 'loss') : 'todo'}">${foeAv(o)}${done ? `<span class="foe-res">${done === 'win' ? 'GAGNÉ' : 'PERDU'}</span>` : ''}${foeInfo(o)}
          ${done ? '<span class="foe-wait">Demain</span>' : `<button class="foe-btn fight" data-act="warAttack" data-id="${o.id}"><i>${ico('swords')}</i>Attaquer<small>+${pts} pts</small></button>`}
        </div>`;
      }).join('')}
    </section>
    <section class="card hx" style="--hc:${WAR.sections[mine].color}">
      ${secHead(ico('shield'), 'Ta section', WAR.sections[mine].name)}
      <div class="opp rank me"><div class="o-body"><div class="o-name">${esc(acc.pseudo)} <span class="pill gold">toi</span></div></div><div class="score">${wk.points} pts</div></div>
      ${allies.map(m => `
        <div class="opp rank"><div class="av"><canvas class="px" data-portrait="${m.classId}"></canvas></div>
          <div class="o-body"><div class="o-name">${nameHtml(m.name, m.data)}</div><div class="o-sub">${CLASSES[m.classId].name}</div></div>
          <div class="score">${m.points} pts</div></div>`).join('')}
      ${war.log.length ? `<div class="sub">TES ATTAQUES</div>${war.log.map(l => `<div class="log-line">${l.won ? ico('check') : ico('cross')} ${esc(l.name)} ${l.won ? `<b>+${l.pts}</b>` : '(+1 pour eux)'}</div>`).join('')}` : ''}
      <button class="btn small" style="margin-top:12px" data-act="changeSection">Changer de section</button>
    </section>`;
}

/** Animation de la guerre : les 4 bleus contre les 4 rouges, en boucle */
function startSkirmish() {
  const cv = document.getElementById('war-cv');
  if (!cv || !acc.war.section) return;
  const { members } = E.warStandings(acc, E.weekKey(), others());
  const sh = E.strongestHero(acc);
  const all = [...members.map(m => {
    const h = m.data ? E.strongestHero(m.data) : null;
    return { name: m.name, classId: m.classId, dye: h ? h.dye : null, section: m.section };
  }), { name: acc.pseudo, classId: sh.classId, dye: sh.dye, section: acc.war.section }];
  const side = (sec) => {
    const list = all.filter(m => m.section === sec);
    // s'il manque du monde, des recrues viennent compléter l'équipe
    const cls = Object.keys(CLASSES);
    for (let i = list.length; i < WAR.maxPerSection; i++) list.push({ name: 'Recrue', classId: cls[i % cls.length], dye: null });
    return list;
  };
  stopPreviews.push(playSkirmish(cv, side('bleue'), side('rouge'), { colors: [WAR.sections.bleue.color, WAR.sections.rouge.color] }));
}

function startWarAttack(foeId) {
  E.ensureWar(acc, others());
  const war = acc.war;
  if (war.done[foeId]) return;
  const opp = opponents().find(o => o.id === foeId);
  if (!opp) return;
  const me = mySnap();
  const seed = hashStr(war.day + foeId + 'guerre' + acc.pseudo);
  runBattle({
    me, foe: opp.snap, seed, theme: 'castle', victory: myVictory(),
    title: `${ico('swords')} ${secTag(war.section)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    finish: (result) => {
      const won = result.winner === 0;
      E.missionEvent(acc, 'war');
      if (won) E.missionEvent(acc, 'war_win');
      logFight('war', foeId, opp.name, me, opp.snap, seed, won);
      const rw = E.warAttackResult(acc, hero, { id: foeId, name: opp.name, level: opp.level }, won, E.powerScore(me), E.powerScore(opp.snap));
      save();
      return {
        rewards: rw,
        rewardsHtml: `
          <div class="rw">
            ${won ? `<span class="pill green">+${rw.pts} pts pour ta section</span>` : '<span class="pill red">+1 pt pour la section adverse</span>'}
          </div>`,
      };
    },
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
  const txt = esc(m.text).replace(/\[\[combat:(\d+)\]\]/g, '<button class="btn small" data-act="replayId" data-id="$1">' + ico('play') + ' Revoir le combat</button>').replace(/⚔️?/g, ico('swords'));
  return `<div class="msg ${mine ? 'me' : ''}">${mine ? '' : `<b>${nameHtml(m.pseudo, dataOfPseudo(m.pseudo))}</b>`}<span class="txt">${txt}</span><small>${timeOf(m.created_at)}</small></div>`;
};

function viewChat() {
  if (!NET.online) return offlineCard('Tchat', 'Le tchat marche seulement dans la version en ligne.');
  return modeHead({
    id: 'chat', c: '#3d9bff', art: '<canvas class="px" data-emblem="talk"></canvas>',
    title: 'Tchat', sub: 'Chambrer les potes',
    chips: [
      mchip('<i class="dot-on"></i>', 'En ligne', `${onlineCount()} / ${players.length + 1}`),
      mchip(ico('chat'), 'Messages', chatMsgs.length),
      mchip(ico('swords'), 'Combats partagés', chatMsgs.filter(m => /\[\[combat:/.test(m.text)).length),
    ],
    info: 'Écris en bas de l’écran. Depuis le Journal, tu peux partager un combat : il apparaît ici avec un bouton pour le revoir.',
  }) + `
    <section class="card hx chat" style="--hc:#3d9bff">
      <div class="chat-list" id="chat-list">${chatMsgs.length ? chatMsgs.map(msgHtml).join('') : '<p class="empty" id="chat-empty">Aucun message. Lance la discussion !</p>'}</div>
    </section>
    <div class="chat-bar">
      <input id="chat-input" maxlength="300" placeholder="Écris un message…" value="${esc(chatDraft)}" autocomplete="off" enterkeyhint="send">
      <button class="btn primary" data-act="sendChat">Envoyer</button>
    </div>`;
}

// le tchat défile avec la page : on descend tout en bas (dernier message juste au-dessus de la barre d'écriture)
function scrollChat() {
  if (!document.getElementById('chat-list')) return;
  requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
}
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
    const list = document.getElementById('chat-list');
    list.insertAdjacentHTML('beforeend', msgHtml(m));
    hydrate(list.lastElementChild);
    scrollChat();
    markChatSeen();
  } else if (m.user_id !== NET.myId()) {
    chatUnread++;
    const b = document.getElementById('chat-badge');
    if (b) { b.hidden = false; b.textContent = chatUnread; }
    setBadge('social', chatUnread + journalUnseen);
    SFX.message();
    toast(`${m.pseudo} : ${m.text.length > 40 ? m.text.slice(0, 40) + '…' : m.text}`);
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
const NAME_FX = ['rainbow', 'fire', 'galaxy'];   // pseudos animés
const nameHtml = (name, data) => {
  const col = colorOf(data);
  const fx = NAME_FX.includes(col);
  return `<span class="pname ${fx ? col : ''}" ${col && !fx ? `style="color:${col}"` : ''}>${esc(name)}</span>`;
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
const PARENT = { throne: 'combat', pvp: 'combat', fights: 'combat', dungeons: 'combat', horde: 'combat', tower: 'combat', raid: 'combat', war: 'combat', bets: 'combat', champ: 'combat', journal: 'social', chat: 'social', ranking: 'social', players: 'social' };
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
  return list.filter(m => !acc.missions.claimed[m.id] && E.missionProgress(acc, m) >= m.n).length;
}

// petit « + » jaune en bas à droite d'une carte : montre / cache le texte d'explication
const infoOpen = new Set();
const moreBtn = (id) => `<button class="more-btn" data-act="info" data-id="${id}" aria-label="Plus d’infos">${infoOpen.has(id) ? '−' : '+'}</button>`;
const infoCls = (id) => `info-card${infoOpen.has(id) ? ' open' : ''}`;

// icône de chaque mission : emblème du mode, sprite ou petit symbole
const MISSION_ICO = {
  arena_win: 'e:arena', arena_fight: 'e:arena', rematch: 'e:arena', rematch_win: 'e:arena', revenge: 'e:arena', fight: 'e:arena', win: 'e:arena', manual_win: 'e:arena',
  dungeon_win: 'e:dungeons', dungeon: 'e:dungeons', dungeon_kinds: 'e:dungeons', tower: 'e:tower', tower_try: 'e:tower',
  raid: 'm:melenchon', raid_dmg: 'm:melenchon', war: 'e:war', war_win: 'e:war', bet: 'e:bets',
  chest: 'c', key_use: 'k', sell: 'f',
  fuse: 'i:sparkle', equip: 'i:shield', stat: 'i:plus', level: 'i:up', spell: 'i:magic', crit: 'i:boom', dodge: 'i:wind', pet: 'i:paw', chat: 'i:chat', share: 'i:chat', train_rec: 'i:trophy',
};
function missionIco(ev) {
  const k = ev === 'raid' || ev === 'raid_dmg' ? `m:${curRaid().sprite}` : MISSION_ICO[ev] || 'i:star';
  if (k.startsWith('e:')) return `<canvas class="px" data-emblem="${k.slice(2)}"></canvas>`;
  if (k.startsWith('i:')) return ico(k.slice(2));
  if (k.startsWith('m:')) return `<canvas class="px" data-monster="${k.slice(2)}"></canvas>`;
  if (k === 'c') return '<canvas class="px" data-chest="normal"></canvas>';
  if (k === 'k') return '<canvas class="px" data-key></canvas>';
  if (k === 'f') return '<canvas class="px" data-clat></canvas>';
  return `<i>${k}</i>`;
}

function missionsCard() {
  const list = E.ensureMissions(acc);
  const M = acc.missions;
  const nClaimed = list.filter(m => M.claimed[m.id]).length;
  return `
    <section class="card hx hx-green cbt-missions ${infoCls('missions')}" data-info="missions">
      <div class="hx-head"><span class="hx-ico">${ico('target')}</span><div><h2>Missions</h2><small data-timer="half">Nouvelles missions dans ${fmt(E.msToNextHalf())}</small></div></div>
      <div class="mgrid">
        ${list.map(m => {
          const p = Math.min(m.n, E.missionProgress(acc, m));
          const done = p >= m.n, claimed = M.claimed[m.id];
          return `
          <div class="mq ${claimed ? 'claimed' : done ? 'ready' : ''}">
            <div class="mq-ico">${missionIco(m.ev)}</div>
            <div class="mq-txt">${esc(m.text)}</div>
            <div class="mq-bar"><i style="width:${(p / m.n) * 100}%"></i></div>
            ${claimed
              ? '<div class="mq-done">✓ Fait</div>'
              : done
                ? `<button class="btn small green mq-btn" data-act="claimMission" data-id="${m.id}">+${m.reward}<canvas class="px" data-clat></canvas></button>`
                : `<div class="mq-prog">${p.toLocaleString('fr-FR')}/${m.n.toLocaleString('fr-FR')} · +${m.reward}<canvas class="px" data-clat></canvas></div>`}
          </div>`;
        }).join('')}
      </div>
      <div class="mq-bonus ${nClaimed >= list.length ? 'got' : ''}">
        <span class="pips">${list.map((m, i) => `<i class="${i < nClaimed ? 'on' : ''}"></i>`).join('')}</span>
        <span>Bonus des 3 missions : <b>+${MISSIONS_BONUS}</b></span><canvas class="px" data-clat></canvas>
      </div>
      <p class="more-txt">Fais les 3 missions pour gagner <b>+${MISSIONS_BONUS}</b> Flouze en bonus. 3 nouvelles missions, tirées au hasard, arrivent toutes les 12 h (minuit et midi).</p>
      ${moreBtn('missions')}
    </section>`;
}

function charsCard() {
  return `
    <section class="card hx hx-gold cbt-chars ${infoCls('chars')}" data-info="chars">
      <div class="hx-head"><span class="hx-ico">${ico('swords')}</span><div><h2>Ton combattant</h2><small>${CLASSES[hero.classId].name} Nv.${hero.level} part au combat</small></div><span class="pill">${acc.heroes.length} / ${E.MAX_HEROES}</span></div>
      <div class="fighters">
        ${byLevel(acc.heroes).map(([h, i]) => `
          <button class="fighter cls-${h.classId} ${i === acc.active ? 'on' : ''}" data-act="switchHero" data-i="${i}">
            ${E.openableChests(h) ? '<span class="badge pip" title="Des coffres à ouvrir"></span>' : ''}
            <span class="f-stage"><canvas class="px" data-portrait="${h.classId}" data-dye="${h.dye || ''}"></canvas></span>
            <b>${CLASSES[h.classId].name}</b><small>Nv.${h.level}</small>
          </button>`).join('')}
        ${acc.heroes.length >= E.MAX_HEROES ? '' : acc.heroes.length < E.heroSlots(acc)
          ? '<button class="fighter add" data-act="newHeroModal"><span>+</span><small>Nouveau</small></button>'
          : `<div class="fighter add locked"><span>${ico('lock')}</span><small>Niveau ${E.nextHeroLevel(acc)}</small></div>`}
      </div>
      <p class="more-txt">C’est ton perso <b>actif</b> qui part se battre (arène, donjons, tour, raid, guerre). Chaque perso a son niveau, ses objets, ses coffres, ses clefs et ses donjons. Quand on t’attaque, c’est ton perso <b>le plus fort</b> qui défend.<br>Nouveaux persos : le 2ᵉ au niveau <b>15</b>, le 3ᵉ au niveau <b>30</b> et le 4ᵉ au niveau <b>50</b> (niveau de ton perso le plus haut).</p>
      ${moreBtn('chars')}
    </section>`;
}

// ------------------------------ Hub Combats ------------------------------
function viewCombat() {
  const fightsLeft = opponents().filter(o => !o.done).length;
  const raidLeft = RAID.attemptsPerHalf - E.raidState(acc).used;
  const warLeft = acc.war.section ? opponents().filter(o => o.section === E.otherSide(acc.war.section) && !acc.war.done[o.id]).length : 0;
  const runs = E.totalRunsLeft(hero);
  const duels = bets.challenges.filter(c => c.status === 'pending' && c.to_id === myId()).length;
  const tiles = [
    { id: 'fights', name: 'Arène', sub: `${fightsLeft} combat${fightsLeft > 1 ? 's' : ''} restant${fightsLeft > 1 ? 's' : ''}`, tag: 'Affronte tes potes', emblem: 'arena', badge: fightsLeft, wide: true, c: '#ff5d6c' },
    { id: 'pvp', name: 'PvP en direct', sub: NET.online ? `${players.filter(p => isOnline(p.id)).length} pote${players.filter(p => isOnline(p.id)).length > 1 ? 's' : ''} en ligne` : 'En ligne seulement', tag: 'Ton équipe contre celle d’un pote connecté', emblem: 'pvp', badge: pvpIncoming().length, wide: true, c: '#b05cff' },
    { id: 'dungeons', name: 'Donjons', sub: `${runs} combat${runs > 1 ? 's' : ''} dispo`, emblem: 'dungeons', badge: runs, c: '#4cd964' },
    { id: 'tower', name: 'Tour infinie', sub: `Étage ${hero.tower.best + 1}`, emblem: 'tower', badge: 0, c: '#a77bff' },
    { id: 'raid', name: curRaid().name, sub: `${raidLeft}/${RAID.attemptsPerHalf} assauts`, monster: curRaid().sprite, badge: raidLeft, c: '#ff8a3d' },
    { id: 'war', name: 'Guerre', sub: acc.war.section ? WAR.sections[acc.war.section].name : 'Choisis ton camp', emblem: 'war', badge: warLeft, c: '#3d9bff' },
    { id: 'throne', name: 'Le trône', sub: throneInfo.order.length ? `Ta place : ${throneRank() + 1} / ${throneInfo.order.length}` : 'Deviens le roi', tag: 'Défie ceux au-dessus de toi et prends leur place', emblem: 'throne', badge: 0, wide: true, c: '#ffd45a' },
    { id: 'horde', name: 'La Horde', sub: `${E.hordeRunsLeft(acc)}/${HORDE.runsPerHalf} essais`, tag: 'Des monstres à la chaîne : va le plus loin possible', emblem: 'horde', badge: E.hordeRunsLeft(acc), wide: true, c: '#ff3d6e' },
    { id: 'champ', name: 'Championnat', sub: champSub(), tag: 'Tournoi à 8 chaque semaine, combats à 19 h 30', emblem: 'champ', badge: 0, wide: true, c: '#ffd45a' },
  ];
  return autoCard() + charsCard() + missionsCard() + `
    <section class="modes">
      ${tiles.map(t => `
        <button class="mode ${t.wide ? 'wide' : ''}" data-act="tab" data-id="${t.id}" style="--tc:${t.c}">
          <span class="m-art"><canvas class="px" ${t.monster ? `data-monster="${t.monster}"` : `data-emblem="${t.emblem}"`}></canvas></span>
          <span class="m-txt"><b>${t.name}</b><small>${t.sub}</small>${t.wide ? `<em>${t.tag}</em>` : ''}</span>
          ${t.wide ? '<span class="m-go">›</span>' : ''}
          ${t.badge > 0 ? `<span class="badge">${t.badge}</span>` : ''}
        </button>`).join('')}
    </section>`;
}

// ------------------------------ Hub Social ------------------------------
function viewSocial() {
  const tiles = [
    { id: 'journal', name: 'Journal', sub: 'Revois tes combats', emblem: 'journal', badge: journalUnseen, c: '#ff8a3d' },
    { id: 'chat', name: 'Tchat', sub: 'Chambrer les potes', emblem: 'talk', badge: chatUnread, c: '#3d9bff' },
    { id: 'ranking', name: 'Classement', sub: 'Qui est le plus fort ?', emblem: 'ranking', badge: 0, c: '#ffd45a' },
    { id: 'players', name: 'Joueurs', sub: NET.online ? `<i class="dot-on"></i>${onlineCount()} en ligne` : 'En ligne seulement', emblem: 'players', badge: 0, c: '#4cd964' },
  ];
  const list = rankingEntries('power');
  const meTop = list.slice(0, 3).some(e => e.me);
  const myMsg = (acc.podiumMsg && acc.podiumMsg.text) || '';
  return `
    <section class="modes">
      ${tiles.map(t => `
        <button class="mode" data-act="tab" data-id="${t.id}" style="--tc:${t.c}">
          <span class="m-art"><canvas class="px" data-emblem="${t.emblem}"></canvas></span>
          <span class="m-txt"><b>${t.name}</b><small>${t.sub}</small></span>
          ${t.badge > 0 ? `<span class="badge">${t.badge}</span>` : ''}
        </button>`).join('')}
    </section>
    <section class="card hx podium-card ${infoCls('podium')}" data-info="podium" style="--hc:#ffd45a">
      ${secHead(ico('crown'), 'Podium des champions', 'Les 3 plus puissants du groupe')}
      ${podium(list, rankScore('power'), { bubbles: true })}
      ${meTop ? `<button class="btn block pod-edit" data-act="podiumMsg">${ico('chat')} ${myMsg ? 'Changer mon message' : 'Écrire mon message de champion'}</button>` : ''}
      <div class="more-txt">Les 3 joueurs du podium (classés à la puissance de leur perso le plus fort) peuvent afficher un petit message dans une bulle au-dessus de leur héros. Tout le monde le voit ici. Si tu sors du podium, ton message disparaît.</div>
      ${moreBtn('podium')}
    </section>`;
}

function openPodiumMsg() {
  const cur = (acc.podiumMsg && acc.podiumMsg.text) || '';
  openModal(`
    <h3>${ico('crown')} Ton message de champion</h3>
    <p class="hint" style="margin-top:8px">Il s’affiche dans une bulle au-dessus de ton héros, sur le podium. 60 caractères maximum.</p>
    <input id="pod-msg" class="pod-input" maxlength="60" value="${esc(cur)}" placeholder="Ex. : Venez me chercher !" autocomplete="off">
    <div class="row" style="gap:8px;margin-top:12px">
      ${cur ? '<button class="btn block" data-act="podiumMsgSave" data-clear="1">Effacer</button>' : '<button class="btn block" data-act="closeModal">Annuler</button>'}
      <button class="btn primary block" data-act="podiumMsgSave">Enregistrer</button>
    </div>`, { center: true });
  setTimeout(() => document.getElementById('pod-msg')?.focus(), 50);
}

// ------------------------------ Joueurs en ligne ------------------------------
let onlineIds = new Set();
const isOnline = (id) => NET.online && onlineIds.has(id);
const onlineCount = () => [...onlineIds].length || (NET.online ? 1 : 0);
const dotHtml = (id) => (NET.online ? `<i class="${isOnline(id) ? 'dot-on' : 'dot-off'}" title="${isOnline(id) ? 'En ligne' : 'Hors ligne'}"></i>` : '');
const agoText = (iso) => {
  if (!iso) return 'jamais vu';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 2) return 'vu à l’instant';
  if (m < 60) return `vu il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `vu il y a ${h} h`;
  const d = Math.round(h / 24);
  return `vu il y a ${d} jour${d > 1 ? 's' : ''}`;
};

function onPresence(ids) {
  onlineIds = new Set(ids);
  if (['players', 'social', 'fights', 'ranking'].includes(tab)) softRender();
}

function viewPlayers() {
  if (!NET.online) return offlineCard('Joueurs', 'La liste des joueurs marche seulement dans la version en ligne.');
  const me = NET.myId();
  const rows = [{ id: me, name: acc.pseudo, data: acc, me: true }, ...players.map(p => ({ id: p.id, name: p.pseudo, data: p.data, seen: p.updated_at }))];
  rows.sort((a, b) => (isOnline(b.id) ? 1 : 0) - (isOnline(a.id) ? 1 : 0) || (b.me ? 1 : 0) - (a.me ? 1 : 0) || String(b.seen || '').localeCompare(String(a.seen || '')));
  const n = rows.filter(r => isOnline(r.id)).length;
  const strongest = rows.map(r => ({ r, p: E.powerScore(snapOf(r.data, E.strongestHero(r.data), r.name)) })).sort((a, b) => b.p - a.p)[0];
  return modeHead({
    id: 'players', c: '#4cd964', art: '<canvas class="px" data-emblem="players"></canvas>',
    title: 'Joueurs', sub: 'Touche un joueur pour voir sa carte',
    chips: [
      mchip('<i class="dot-on"></i>', 'En ligne', `${n} / ${rows.length}`, n > 1 ? 'hot' : ''),
      mchip(ico('bolt'), 'Le plus puissant', esc(strongest.r.name)),
      mchip('<canvas class="px" data-emblem="players"></canvas>', 'Joueurs', rows.length),
    ],
    info: 'Le voyant passe au vert dès qu’un pote ouvre l’appli. Touche un joueur pour voir sa carte : son héros, son équipement, sa puissance et ses records.',
  }) + `
    <section class="card hx" style="--hc:#4cd964">
      ${rows.map(r => {
        const h = E.strongestHero(r.data);
        const sec = r.data.war && r.data.war.section;
        const pow = E.powerScore(snapOf(r.data, h, r.name));
        return `
        <button class="foe player-row ${isOnline(r.id) ? 'on' : 'away'}" data-act="playerCard" data-id="${r.id}">
          <span class="foe-av"><canvas class="px" data-portrait="${h.classId}" data-dye="${h.dye || ''}"></canvas></span>
          <div class="foe-body">
            <div class="foe-name">${dotHtml(r.id)}${nameHtml(r.name, r.data)}${r.me ? ' <span class="pill gold">toi</span>' : ''}</div>
            <div class="foe-sub">${CLASSES[h.classId].name} · Nv.${h.level} · ${ico('bolt')}${pow}${sec ? ` · <span style="color:${WAR.sections[sec].color}">${WAR.sections[sec].name}</span>` : ''}</div>
            <span class="cmp ${isOnline(r.id) ? 'easy' : 'off'}">${isOnline(r.id) ? 'En ligne' : esc(agoText(r.seen))}</span>
          </div>
          <span class="pr-go">›</span>
        </button>`;
      }).join('')}
    </section>`;
}

const CLASS_COLOR = { guerrier: '#ff5d6c', mage: '#a77bff', archer: '#4cd964', paladin: '#ffd45a' };

/** Carte d'identité d'un joueur : son héros le plus fort, son équipement, sa puissance, ses records */
function openPlayerCard(id, heroIdx = null) {
  const isMe = id === myId();
  const p = isMe ? null : players.find(x => String(x.id) === String(id));
  if (!isMe && !p) return;
  const data = isMe ? acc : p.data, name = isMe ? acc.pseudo : p.pseudo;
  const strong = E.strongestHero(data);
  const h = heroIdx !== null && data.heroes[heroIdx] ? data.heroes[heroIdx] : strong;
  const snap = snapOf(data, h, name);
  const st = E.computeStats(h);
  const hp = E.maxHp(st, h.level);
  const itemOf = (slot) => { const uid = h.equipped && h.equipped[slot]; return uid ? h.inventory.find(i => i.uid === uid) : null; };
  const cell = (slot) => {
    const it = itemOf(slot);
    return it
      ? `<div class="idc-slot it r${it.rarity}" style="--rc:${RARITIES[it.rarity].color}"><canvas class="px" data-icon="${it.itemId}"></canvas><small>${esc(ITEMS[it.itemId].name)}</small></div>`
      : `<div class="idc-slot empty"><span class="sl-ghost">${SLOT_GLYPH[slot]}</span><small>${SLOTS[slot].name}</small></div>`;
  };
  const wins = data.heroes.reduce((t, x) => t + x.stats.wins, 0);
  const tower = Math.max(0, ...data.heroes.map(x => (x.tower && x.tower.best) || 0));
  const sec = data.war && data.war.section;
  const online = isMe || isOnline(id);
  const msg = data.podiumMsg && data.podiumMsg.text;
  openModal(`
    <div class="idcard" style="--cc:${CLASS_COLOR[h.classId]}">
      <div class="idc-head">
        <div class="idc-name">${dotHtml(id)}${nameHtml(name, data)}</div>
        ${titleHtml(data)}
        <div class="idc-sub">${CLASSES[h.classId].name} · Nv.${h.level} · ${online ? '<span class="good">En ligne</span>' : esc(agoText(p && p.updated_at))}</div>
        ${msg ? `<div class="idc-msg">« ${esc(msg)} »</div>` : ''}
      </div>
      <div class="idc-doll">
        <div class="idc-col">${['hat', 'armor', 'boots'].map(cell).join('')}</div>
        <div class="idc-hero"><canvas class="px" data-hero="${h.classId}" data-pet="${petOf(h)}" data-dye="${h.dye || ''}"></canvas></div>
        <div class="idc-col">${['weapon', 'amulet', 'pet'].map(cell).join('')}</div>
      </div>
      <div class="idc-power"><div><small>Puissance</small><b>${fmtNum(E.powerScore(snap))}</b></div><div><small>Vie</small><b>${fmtNum(hp)}</b></div></div>
      <div class="idc-stats">${STAT_KEYS.map(k => `<div style="--sc:${STATS[k].color}"><small>${STATS[k].name}</small><b>${fmtNum(st[k])}</b></div>`).join('')}</div>
      <div class="idc-rec">
        <span>${ico('trophy')} <b>${wins}</b> victoires</span>
        <span>${ico('up')} Tour <b>${tower}</b></span>
        <span>${ico('skull')} Horde <b>${(data.horde && data.horde.best) || 0}</b></span>
        ${sec ? `<span style="color:${WAR.sections[sec].color}">${ico('shield')} ${WAR.sections[sec].name}</span>` : ''}
      </div>
      ${data.heroes.length > 1 ? `<div class="idc-heroes">${byLevel(data.heroes).map(([x, i]) => `<button class="${x === h ? 'on' : ''}" data-act="playerCard" data-id="${id}" data-h="${i}"><canvas class="px" data-portrait="${x.classId}" data-dye="${x.dye || ''}"></canvas><small>Nv.${x.level}</small></button>`).join('')}</div>` : ''}
    </div>
    <div class="close-row"><button class="btn" data-act="closeModal">Fermer</button></div>`, { center: true });
}

// ------------------------------ Notes de mise à jour ------------------------------
const PATCH_SEEN = 'fuze-patch-seen';
/** Notes visibles par ce compte (une note avec « for » n'est montrée qu'aux pseudos listés) */
const myNotes = () => PATCH_NOTES.filter(n => !n.for || (acc && n.for.some(p => p.toLowerCase() === (acc.pseudo || '').trim().toLowerCase())));
const giftWaiting = () => myNotes().find(n => n.gift && !(acc.gifts && acc.gifts[n.gift.id]));
function patchUnseen() {
  if (acc && giftWaiting()) return true;
  try { return localStorage.getItem(PATCH_SEEN) !== myNotes()[0].id; } catch (e) { return false; }
}
let giftShown = false;   // le cadeau s'ouvre tout seul une fois par lancement
function maybeShowGift() {
  if (giftShown || !acc || !giftWaiting() || modalRoot.innerHTML || document.querySelector('.battle')) return;
  giftShown = true;
  setTimeout(() => { if (!modalRoot.innerHTML && !document.querySelector('.battle')) openPatchNotes(); }, 700);
}
/** Ce que contient un cadeau (Flouze et/ou coffres de combat) */
const giftLabel = (g) => [g.amount ? `${g.amount} Flouze` : '', g.chests ? `${g.chests} coffre${g.chests > 1 ? 's' : ''}` : '', g.combatChests ? `${g.combatChests} coffre${g.combatChests > 1 ? 's' : ''} de combat` : ''].filter(Boolean).join(' + ');
function openPatchNotes() {
  try { localStorage.setItem(PATCH_SEEN, myNotes()[0].id); } catch (e) { /* stockage indisponible */ }
  const b = document.getElementById('patch-badge');
  if (b) b.hidden = !giftWaiting();
  const giftBox = (g) => {
    const got = acc.gifts && acc.gifts[g.id];
    return `
      <div class="gift ${got ? 'got' : ''}">
        <div class="gift-art"><canvas class="px" data-chest="war" data-open="${got ? 1 : 0}"></canvas></div>
        <p>${esc(g.text)}</p>
        ${got ? `<div class="gift-done">${ico('check')} ${giftLabel(g)} récupéré${g.amount ? 's' : ''}</div>`
          : `<button class="btn primary block gift-btn" data-act="claimGift" data-id="${g.id}">Récupérer ${g.amount ? `${g.amount}<canvas class="px" data-clat></canvas>` : giftLabel(g)}</button>`}
      </div>`;
  };
  openModal(`
    <div class="modal-top"><h3>Notes de mise à jour</h3><button class="modal-x" data-act="closeModal" aria-label="Fermer">×</button></div>
    <p class="hint" style="margin-top:6px">Les nouveautés du jeu, la plus récente en premier.</p>
    ${myNotes().map((n, i) => `
      <details class="patch" ${i === 0 || (n.gift && !(acc.gifts && acc.gifts[n.gift.id])) ? 'open' : ''}>
        <summary><span class="pdate">${n.date} · ${n.time}</span><b>${esc(n.title)}</b>${i === 0 ? '<span class="pill gold">NOUVEAU</span>' : ''}</summary>
        ${n.gift ? giftBox(n.gift) : ''}
        ${n.sections.map(sec => `<div class="psec">${esc(sec.title)}</div><ul>${sec.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul>`).join('')}
      </details>`).join('')}
    <div class="close-row"><button class="btn" data-act="closeModal">Fermer</button></div>`);
}

// ------------------------------ Journal des combats ------------------------------
let journal = [];
let journalUnseen = 0;
const JOURNAL_SEEN = 'fuze-journal-seen';
const KIND_NAME = { arena: 'Arène', war: 'Guerre', rematch: 'Revanche', revenge: 'Vengeance', throne: 'Trône' };

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
  if (row.kind === 'throne') {   // le trône : mêlée à 4 contre 4, rejouée à l'identique avec la même graine
    const A = row.a_snap.team, B = row.d_snap.team;
    runMelee({
      teamA: A, teamB: B, fight: E.createMelee(A, B, Number(row.seed)),
      title: `Rediffusion · ${esc(row.attacker_name)} <span style="color:var(--gold)">VS</span> ${esc(row.defender_name)}`,
      finish: (r) => ({ headline: `${(r.winner === 0 ? row.attacker_name : row.defender_name).toUpperCase()} GAGNE !`, headClass: 'win' }),
    });
    return;
  }
  const result = E.simulate(row.a_snap, row.d_snap, Number(row.seed));
  const winName = result.winner === 0 ? row.attacker_name : row.defender_name;
  runBattle({
    me: row.a_snap, foe: row.d_snap, result, theme: row.kind === 'war' ? 'castle' : 'arena', track: false,
    title: `Rediffusion · ${esc(row.attacker_name)} <span style="color:var(--gold)">VS</span> ${esc(row.defender_name)}`,
    finish: () => ({ headline: `${winName.toUpperCase()} GAGNE !`, headClass: 'win' }),
  });
}

function viewJournal() {
  if (!NET.online) return offlineCard('Journal', 'Le journal des combats marche seulement en ligne.');
  const me = NET.myId();
  const res = journal.map(f => { const attacked = f.defender_id === me; return attacked ? f.winner === 1 : f.winner === 0; });
  const nWin = res.filter(Boolean).length;
  const nAtt = journal.filter(f => f.defender_id === me).length;
  return modeHead({
    id: 'journal', c: '#ff8a3d', art: '<canvas class="px" data-emblem="journal"></canvas>',
    title: 'Journal', sub: 'Tes derniers combats contre les potes',
    chips: [
      mchip(ico('check'), 'Gagnés', nWin, nWin ? 'hot' : ''),
      mchip(ico('cross'), 'Perdus', journal.length - nWin),
      mchip(ico('swords'), 'On t’a attaqué', nAtt),
    ],
    info: `${ico('play')} <b>Revoir</b> le combat. ${ico('chat')} <b>Partager</b> dans le tchat. <b>Vengeance</b> : quand on t’a attaqué, tu peux répondre tout de suite (pour le fun).`,
  }) + `
    <section class="card hx" style="--hc:#ff8a3d">
      ${journal.length ? journal.map((f, i) => {
        const attacked = f.defender_id === me;
        const youWon = res[i];
        const other = attacked ? f.attacker_name : f.defender_name;
        const otherId = attacked ? f.attacker_id : f.defender_id;
        const o = players.find(x => x.id === otherId);
        const oh = o ? E.strongestHero(o.data) : null;
        return `
        <div class="foe jrow2 ${youWon ? 'win' : 'loss'}">
          <span class="foe-av">${oh ? `<canvas class="px" data-portrait="${oh.classId}" data-dye="${oh.dye || ''}"></canvas>` : ico('swords')}</span>
          <span class="foe-res">${youWon ? 'GAGNÉ' : 'PERDU'}</span>
          <div class="foe-body">
            <div class="foe-name">${attacked ? `${ico('swords')} ${esc(other)} t’a attaqué` : `Tu as attaqué ${esc(other)}`}</div>
            <div class="foe-sub">${KIND_NAME[f.kind] || f.kind} · ${timeOf(f.created_at)}</div>
          </div>
          <div class="j-btns">
            <button class="ibtn" data-act="replayLog" data-id="${f.id}" aria-label="Revoir">${ico('play')}</button>
            <button class="ibtn" data-act="shareLog" data-id="${f.id}" aria-label="Partager">${ico('chat')}</button>
            ${attacked && o && f.kind !== 'throne' ? `<button class="ibtn red" data-act="revenge" data-id="${otherId}" aria-label="Vengeance">${ico('fist')}</button>` : ''}
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
    E.missionEvent(acc, 'chat'); E.missionEvent(acc, 'share'); save();
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
    const all = await NET.fetchChallenges();
    const ch = all.filter(c => !isPvp(c));
    pvpRows = all.filter(isPvp);
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
  return modeHead({
    id: 'bets', c: '#ffd45a', art: '<canvas class="px" data-emblem="bets"></canvas>',
    title: 'Paris & duels', sub: 'Défie un pote, tout le monde parie',
    chips: [
      mchip('<canvas class="px" data-clat></canvas>', 'Ton Flouze', acc.clat),
      mchip(ico('swords'), 'Défis reçus', received.length, received.length ? 'hot' : ''),
      mchip(ico('dice'), 'Paris ouverts', open.length),
    ],
    extra: gains.ids.length ? `<button class="btn block ${gains.total ? 'green' : ''}" style="margin-top:12px" data-act="claimBets">${gains.total ? `Récupérer ${gains.total} Flouze` : 'Voir mes paris perdus'}</button>` : '',
    info: `<b>1.</b> Défie un pote.<br><b>2.</b> S’il accepte, tout le monde a <b>24 h</b> pour miser du Flouze sur le gagnant.<br><b>3.</b> Le combat se joue tout seul, avec le perso le plus fort de chacun.<br><b>4.</b> Les gagnants touchent leur mise × la cote. Plus un combattant est donné perdant, plus sa cote est haute.`,
  }) + `
    ${received.length ? `<section class="card hx" style="--hc:#ff5d6c">${secHead(ico('swords'), 'Défis reçus', 'On te provoque : réponds !')}${received.map(c => `
      <div class="foe todo"><span class="foe-av big-ico">${ico('swords')}</span><div class="foe-body"><div class="foe-name">${esc(c.from_name)} te défie !</div><div class="foe-sub">${timeOf(c.created_at)}</div></div>
        <div class="foe-col"><button class="btn small green" data-act="acceptDuel" data-id="${c.id}">Accepter</button><button class="btn small" data-act="declineDuel" data-id="${c.id}">Refuser</button></div></div>`).join('')}</section>` : ''}

    ${open.length ? `<section class="card hx" style="--hc:#ffd45a">${secHead(ico('dice'), 'Paris ouverts', 'Mise sur le gagnant avant le combat')}${open.map(c => {
      const [oA, oB] = duelOdds(c);
      const mine = myBets(c);
      return `
      <div class="duel">
        <div class="d-vs">${duelSide(c.from_snap, oA, c.from_name)}<span class="vs">VS</span>${duelSide(c.to_snap, oB, c.to_name)}</div>
        <div class="d-info">Mises : <b>${pot(c, 0)}</b> – <b>${pot(c, 1)}</b> · combat dans <b data-countdown="${fightAt(c)}">${fmt(fightAt(c) - now)}</b></div>
        ${mine.length ? `<div class="d-info">Tes paris : ${mine.map(w => `${w.amount} sur ${esc(w.side === 0 ? c.from_name : c.to_name)} (×${w.odds})`).join(', ')}</div>` : ''}
        <div class="bet-row">
          <input id="bet-${c.id}" type="number" min="1" max="1000" value="5" inputmode="numeric">
          <button class="btn small primary" data-act="placeBet" data-id="${c.id}" data-side="0">${esc(c.from_name)} ×${oA}</button>
          <button class="btn small primary" data-act="placeBet" data-id="${c.id}" data-side="1">${esc(c.to_name)} ×${oB}</button>
        </div>
      </div>`;
    }).join('')}</section>` : ''}

    <section class="card hx" style="--hc:#ffd45a">
      ${secHead(ico('fist'), 'Lancer un défi', 'Choisis ton adversaire')}
      ${players.length ? players.map(p => {
        const h = E.strongestHero(p.data);
        const o = { id: p.id, name: p.pseudo, data: p.data, classId: h.classId, dye: h.dye, level: h.level, snap: snapOf(p.data, h, p.pseudo) };
        return `
        <div class="foe ${busy.has(p.id) ? 'busy' : 'todo'}">${foeAv(o)}${foeInfo(o)}
          ${busy.has(p.id) ? '<span class="foe-wait">En cours</span>' : `<button class="foe-btn fight gold" data-act="challenge" data-id="${p.id}"><i>${ico('fist')}</i>Défier</button>`}
        </div>`;
      }).join('') : '<p class="empty">Personne d’autre n’est inscrit.</p>'}
      ${sent.map(c => `<div class="log-line">${ico('hourglass')} En attente de ${esc(c.to_name)} <button class="btn small" data-act="cancelDuel" data-id="${c.id}">Annuler</button></div>`).join('')}
    </section>

    ${done.length ? `<section class="card hx" style="--hc:#9d93d6">${secHead(ico('flag'), 'Derniers résultats')}${done.map(c => {
      const win = duelResult(c).winner;
      return `<div class="opp"><div class="o-body"><div class="o-name">${ico('trophy')} ${esc(win === 0 ? c.from_name : c.to_name)} a gagné</div><div class="o-sub">${esc(c.from_name)} vs ${esc(c.to_name)}</div></div>
        <button class="btn small" data-act="replayDuel" data-id="${c.id}">${ico('play')} Revoir</button></div>`;
    }).join('')}</section>` : ''}`;
}

// ------------------------------ Combat auto ------------------------------
// Tes 4 persos enchaînent les paliers tout seuls (un toutes les 30 s), même jeu fermé (rattrapé au retour, 8 h max).
// Le combat montré en haut de l'onglet Combats est exactement celui qui est compté (même graine).
let autoVis = { n: -1, played: 0 };   // combat affiché et nombre d'événements déjà joués (pour reprendre au même endroit)
let autoCtl = null;
let autoAway = null;                  // rattrapage en cours après une absence : { fights, rewards, from }
const autoTeam = () => throneTeam(acc, acc.pseudo);
const autoLabel = (g) => `Difficulté ${E.autoDiff(g)} · Palier ${E.autoPalier(g)}`;

function autoTick() {
  const st = E.autoState(acc);
  if (st.g > E.AUTO_LAST) return;
  const pending = Math.floor((Math.min(Date.now() - st.last, AUTO.offlineMaxMs)) / AUTO.palierMs);
  if (!pending) return;
  if (autoCtl && pending < 3) return;   // le petit écran montre les combats : ils s'enchaînent tout seuls, sans attendre
  if (pending > 2 && !autoAway) autoAway = { fights: 0, rewards: 0, from: st.g };
  const res = E.autoCatchUp(acc, autoTeam(), 30);
  if (!res.length) return;
  save();
  if (autoCtl && autoVis.n < st.n) autoCtl.skip();   // le combat affiché est déjà compté : on le termine vite
  const rewards = res.filter(r => r.reward).length;
  if (autoAway) {
    autoAway.fights += res.length; autoAway.rewards += rewards;
    if (Date.now() - st.last < AUTO.palierMs) {   // rattrapage fini
      toast(`Combat auto pendant ton absence : ${autoAway.fights} combats, maintenant ${autoLabel(st.g > E.AUTO_LAST ? E.AUTO_LAST : st.g)}${autoAway.rewards ? ` · +${autoAway.rewards} coffre${autoAway.rewards > 1 ? 's' : ''} en réserve` : ''}`);
      autoAway = null;
    }
  } else if (rewards) {
    toast(`Combat auto : palier ${E.autoPalier(res.find(r => r.reward).g)} franchi ! +1 coffre en réserve`);
  }
  const box = document.querySelector('[data-auto-info]');
  if (box) { box.innerHTML = autoInfoHtml(); hydrate(box); }
}

function autoInfoHtml() {
  const st = E.autoState(acc);
  if (st.g > E.AUTO_LAST) return `<p class="auto-done">${ico('crown')} Les ${AUTO.diffs} difficultés sont terminées : bravo !</p>${autoBankHtml(st)}`;
  const p = E.autoPalier(st.g), next = Math.ceil(p / 10) * 10;
  const inTen = ((p - 1) % 10) + 1;
  return `
    <div class="auto-head"><b>${autoLabel(st.g)}</b><small>Record : ${autoLabel(st.best)}</small></div>
    <div class="auto-bar"><i style="width:${(inTen - 1) * 10}%"></i><span>Palier ${next} : 1 coffre</span></div>
    <div class="auto-next">Les combats s’enchaînent sans pause</div>
    ${autoBankHtml(st)}`;
}
function autoBankHtml(st) {
  const n = st.bank.chests;
  const xp = hero.level < MAX_LEVEL ? Math.round(E.xpForLevel(hero.level) * E.autoXpFrac(acc)) : 0;
  const what = [n ? `${n} coffre${n > 1 ? 's' : ''}` : '', xp ? `${xp} XP` : ''].filter(Boolean).join(' + ');
  return what ? `
    <button class="btn primary block auto-claim" data-act="claimAuto">Récupérer ${what} ${n ? '<canvas class="px" data-chest="normal"></canvas>' : ''}</button>`
    : '<p class="auto-empty">Réserve vide : 1 coffre tous les 10 paliers, et un peu d’XP à chaque victoire.</p>';
}

function autoCard() {
  const st = E.autoState(acc);
  const done = st.g > E.AUTO_LAST;
  return `
    <section class="card hx auto-card ${infoCls('auto')}" data-info="auto" style="--hc:#4cd964">
      ${secHead(ico('swords'), 'Combat auto', 'Tes persos se battent tout seuls, même jeu fermé')}
      ${done ? '' : '<div class="auto-stage"><canvas data-auto></canvas></div>'}
      <div data-auto-info>${autoInfoHtml()}</div>
      <div class="more-txt">${AUTO.diffs} difficultés de ${AUTO.paliers} paliers, à la suite. Tes ${THRONE.team} persos enchaînent les combats sans pause. Jeu fermé ou sur un autre écran, ça continue (un palier toutes les ${AUTO.palierMs / 1000} s, jusqu’à 8 h de rattrapage). Tous les 10 paliers : <b>1 coffre</b> mis en réserve (pas de clef). Quand tu récupères la réserve, les coffres vont à ton perso actif. Une défaite te renvoie au début de la dizaine (perdu au 37 → retour au 31). Chaque victoire met aussi un peu d’XP en réserve (${String(AUTO.xpPerWin * 100).replace('.', ',')} % d’un niveau, au plus ${String(AUTO.xpDayCap * 100).replace('.', ',')} % d’un niveau par jour), pour ton perso actif.</div>
      ${moreBtn('auto')}
    </section>`;
}

/** Affiche en boucle le combat auto en cours dans le petit écran (sans le son) */
function startAutoVisual(canvas) {
  const holder = { stop: () => {} };
  const play = () => {
    const st = E.autoState(acc);
    if (st.g > E.AUTO_LAST || !canvas.isConnected) return;
    const n = st.n, g = st.g;
    const team = autoTeam(), mons = E.autoMonsters(g);
    const skip = autoVis.n === n ? autoVis.played : 0;
    autoVis = { n, played: 0 };
    const short = team.map(m => ({ ...m, name: CLASSES[m.classId].name }));
    const ctl = playMelee(canvas, short, mons, E.createMelee(team, mons, E.autoSeed(acc, n)), {
      silent: true, skipFirst: skip, speed: 4, colors: ['#3d9bff', '#ff5d6c'], theme: ['cave', 'forest', 'crypt', 'swamp', 'mine', 'volcano', 'glacier', 'castle', 'abyss', 'meeting'][E.autoDiff(g) - 1],
      onEvent: () => { if (autoVis.n === n) autoVis.played++; },
    });
    autoCtl = ctl;
    if (E.autoState(acc).n > n) ctl.skip();
    let stopped = false;
    holder.stop = () => { stopped = true; ctl.destroy(); if (autoCtl === ctl) autoCtl = null; };
    ctl.promise.then(() => {
      if (stopped || !canvas.isConnected) return;
      // le combat affiché est fini : on le compte tout de suite (même graine, même résultat) et le suivant démarre aussitôt
      const st2 = E.autoState(acc);
      if (st2.n === n) {
        const r = E.autoResolve(acc, team);
        st2.last = Date.now();
        save();
        if (r.reward) toast(`Combat auto : palier ${E.autoPalier(r.g)} franchi ! +1 coffre en réserve`);
        const box = document.querySelector('[data-auto-info]');
        if (box) { box.innerHTML = autoInfoHtml(); hydrate(box); }
      }
      ctl.destroy();
      play();
    });
  };
  play();
  return () => holder.stop();
}

// ------------------------------ Le trône ------------------------------
// Classement de la semaine (lundi 0 h) : l'ordre de départ par puissance, puis chaque victoire contre quelqu'un
// au-dessus de soi échange les deux places. En ligne, l'ordre de départ et les défis sont rangés dans le journal
// des combats (kind « throne_start » et « throne »). Hors ligne, contre les bots.
let throneInfo = { week: '', order: [], prevWeek: '', prevOrder: [] };
let throneLoading = null, throneError = '';
const throneRank = (id = myId()) => throneInfo.order.indexOf(id);

/** L'équipe du trône d'un compte : ses 4 persos, les plus forts devant */
const throneTeam = (data, pseudo) => teamOf(data, pseudo).reverse();
/** Équipe d'un bot hors ligne : 4 persos autour de son niveau */
function botThroneTeam(o) {
  const classes = [o.classId, ...Object.keys(CLASSES).filter(c => c !== o.classId)].slice(0, 3);
  return [0, 1, 2, 3].map(j => E.snapshot(E.buildBot({ id: `${o.id}-t${j}`, name: o.name, classId: classes[j % classes.length] }, Math.max(1, o.level - j * 2), E.throneWeek())));
}
/** Tous les prétendants au trône : moi et les autres joueurs (ou les bots hors ligne) */
function throneContenders() {
  const me = { id: myId(), name: acc.pseudo, data: acc, team: throneTeam(acc, acc.pseudo) };
  const rest = NET.online
    ? players.filter(p => p.data && p.data.heroes && p.data.heroes.length).map(p => ({ id: p.id, name: p.pseudo, data: p.data, team: throneTeam(p.data, p.pseudo) }))
    : opponents().map(o => ({ id: o.id, name: o.name, data: null, classId: o.classId, team: botThroneTeam(o) }));
  return [me, ...rest].map(c => ({ ...c, power: Math.round(c.team.reduce((t, m) => t + E.powerScore(m), 0)) }));
}
const byPower = (list) => [...list].sort((a, b) => b.power - a.power).map(c => c.id);

function loadThrone() {
  if (throneLoading) return throneLoading;
  throneError = '';
  throneLoading = (async () => {
    try {
      const all = throneContenders();
      const ids = byPower(all);
      const week = E.throneWeek();
      const prevWeek = E.throneWeek(new Date(E.throneWeekStart() - 3 * 86400000));
      if (!NET.online) {
        // hors ligne : le classement est gardé dans la sauvegarde
        acc.throne ||= { claimed: {} };
        let L = acc.throne.local;
        if (!L || L.week !== week) {
          if (L && L.week === prevWeek) acc.throne.prev = { week: prevWeek, order: E.throneRanking(L.order, L.fights, ids) };
          L = acc.throne.local = { week, order: ids, fights: [] };
          save();
        }
        const P = acc.throne.prev && acc.throne.prev.week === prevWeek ? acc.throne.prev : null;
        throneInfo = { week, order: E.throneRanking(L.order, L.fights, ids), prevWeek, prevOrder: P ? P.order : [] };
        return;
      }
      const since = new Date(E.throneWeekStart() - 7 * 86400000).toISOString();
      let rows = await NET.fetchThrone(since);
      const startOf = (w) => rows.find(r => r.kind === 'throne_start' && r.a_snap && r.a_snap.week === w);
      const fightsOf = (w) => rows.filter(r => r.kind === 'throne' && r.a_snap && r.a_snap.week === w);
      if (!startOf(week)) {
        // premier passage de la semaine : on fixe l'ordre de départ, par puissance (le plus ancien enregistrement fait foi)
        await NET.logFight({ defender_id: null, attacker_name: acc.pseudo, defender_name: '', kind: 'throne_start', winner: 0, seed: 0, a_snap: { week, order: ids }, d_snap: {} });
        rows = await NET.fetchThrone(since);
      }
      const start = startOf(week), prev = startOf(prevWeek);
      throneInfo = {
        week, prevWeek,
        order: E.throneRanking(start ? start.a_snap.order : ids, fightsOf(week), ids),
        prevOrder: prev ? E.throneRanking(prev.a_snap.order, fightsOf(prevWeek), ids) : [],
      };
    } catch (e) {
      throneError = e.message || 'Erreur inconnue';
    } finally {
      throneLoading = null;
    }
  })();
  return throneLoading;
}

function viewThrone() {
  if (throneInfo.week !== E.throneWeek() || !throneInfo.order.length) {
    if (throneError) {
      return `<section class="card"><h2>Le trône</h2><p class="auth-msg">Impossible de charger le trône : ${esc(throneError)}</p>
        <button class="btn primary block" style="margin-top:12px" data-act="retryThrone">Réessayer</button></section>`;
    }
    if (!throneLoading) loadThrone().then(() => { if (tab === 'throne') softRender(); });
    return offlineCard('Le trône', 'Chargement du classement…');
  }
  const all = throneContenders();
  const byId = Object.fromEntries(all.map(c => [c.id, c]));
  const list = throneInfo.order.map(id => byId[id]).filter(Boolean);
  const me = myId();
  const myRank = list.findIndex(c => c.id === me);
  const king = list[0];
  // récompense de la semaine dernière
  const prevRank = throneInfo.prevOrder.indexOf(me);
  const claimed = acc.throne && acc.throne.claimed && acc.throne.claimed[throneInfo.prevWeek] !== undefined;
  const prevCard = prevRank >= 0 && !claimed ? `
    <section class="card war-reward">
      <h2>Trône : la semaine dernière</h2>
      <div class="big-res">${prevRank === 0 ? 'Tu étais le roi !' : `Tu as fini ${prevRank + 1}ᵉ`}</div>
      <p class="hint">+${E.throneKeys(prevRank)} clef${E.throneKeys(prevRank) > 1 ? 's' : ''} pour chacun de tes persos.</p>
      <button class="btn primary block" data-act="claimThrone">Récupérer mes clefs</button>
    </section>` : '';
  const heroOf = (c) => (c.data ? E.strongestHero(c.data) : { classId: c.classId || c.team[0].classId, dye: null });
  const canFight = (i) => myRank > i;   // on ne défie que ceux au-dessus de soi
  const fightBtn = (c, i) => (canFight(i) ? `<button class="btn small danger tr-go" data-act="throneFight" data-id="${c.id}">${ico('swords')} Défier</button>` : '');
  const card = (c, i) => {
    const h = heroOf(c);
    return `
      <div class="tr-card ${c.id === me ? 'me' : ''}">
        <span class="tr-rank">${i + 1}</span>
        <canvas class="px" data-portrait="${h.classId}" data-dye="${h.dye || ''}"></canvas>
        <div class="tr-name">${nameHtml(c.name, c.data)}</div>
        <small class="tr-pow">${ico('bolt')} ${fmtNum(c.power)}</small>
        ${fightBtn(c, i)}
      </div>`;
  };
  // pyramide sous le roi : 2, puis 3, puis 4… joueurs par rangée
  const rows = [];
  for (let i = 1, n = 2; i < list.length; i += n, n++) rows.push(list.slice(i, i + n).map((c, j) => card(c, i + j)).join(''));
  const kh = heroOf(king);
  const kpet = king.data ? petOf(kh) : '';
  return prevCard + modeHead({
    id: 'throne', c: '#ffd45a', art: '<canvas class="px" data-emblem="throne"></canvas>',
    title: 'Le trône', sub: 'Défie ceux au-dessus de toi et prends leur place',
    chips: [
      mchip(ico('crown'), 'Ta place', `${myRank + 1} / ${list.length}`, myRank === 0 ? 'hot' : ''),
      mchip(ico('medal1'), 'Le roi', esc(king.name)),
      mchip(ico('hourglass'), 'Fin de semaine', `<span data-endlong="${Date.now() + E.msToNextThroneWeek()}">${fmtLong(E.msToNextThroneWeek())}</span>`),
    ],
    info: `Tout le monde est classé, au début de la semaine, selon la <b>puissance de ses 4 persos</b>. Défie qui tu veux <b>au-dessus de toi</b>, autant de fois que tu veux : si tu gagnes, vous échangez vos places ; si tu perds, rien ne bouge.<br><br>Combat à <b>4 contre 4</b> : tous tes persos contre tous les siens, en même temps, chacun selon sa vitesse.<br><br>Lundi à 0 h, chaque perso du compte reçoit : <b>${THRONE.keys[0]} clefs</b> pour le roi, <b>${THRONE.keys[1]}</b> pour le 2ᵉ, <b>${THRONE.keys[2]}</b> pour le 3ᵉ, <b>${THRONE.keysRest}</b> pour tous les autres. Puis le classement repart selon la puissance.`,
  }) + `
    <section class="card hx throne-hall" style="--hc:#ffd45a">
      <div class="tr-king ${king.id === me ? 'me' : ''}">
        <span class="tr-crown">${ico('crown')}</span>
        <div class="tr-king-art"><canvas class="px" data-hero="${kh.classId}" data-pet="${kpet}" data-dye="${kh.dye || ''}"></canvas></div>
        <div class="tr-king-name">${nameHtml(king.name, king.data)}</div>
        <small class="tr-pow">${ico('bolt')} ${fmtNum(king.power)} · Roi de la semaine</small>
        ${fightBtn(king, 0)}
      </div>
      ${rows.map((r, j) => `<div class="tr-row" style="--n:${j + 2}">${r}</div>`).join('')}
    </section>`;
}

function claimThroneReward() {
  const rank = throneInfo.prevOrder.indexOf(myId());
  if (rank < 0) return;
  const n = E.claimThrone(acc, throneInfo.prevWeek, rank);
  if (!n) return;
  SFX.loot(3); save(); render();
  toast(`+${n} clef${n > 1 ? 's' : ''} pour chacun de tes persos !`);
}

/** Défi du trône : mon équipe contre la sienne, en mêlée à 4 contre 4 */
function startThrone(targetId) {
  const all = throneContenders();
  const foe = all.find(c => c.id === targetId), meC = all.find(c => c.id === myId());
  const ri = throneRank(targetId), mi = throneRank();
  if (!foe || !meC || ri < 0 || mi <= ri) { toast('Tu ne peux défier que quelqu’un au-dessus de toi.'); return; }
  const seed = (Math.random() * 2 ** 31) | 0;
  const week = throneInfo.week;
  const fight = E.createMelee(meC.team, foe.team, seed);
  runMelee({
    teamA: meC.team, teamB: foe.team, fight,
    title: `Le trône <span style="color:var(--gold)">·</span> ${esc(acc.pseudo)} <span style="color:var(--gold)">VS</span> ${esc(foe.name)} (${ri + 1}ᵉ)`,
    finish: (result) => {
      const won = result.winner === 0;
      const row = { attacker_id: myId(), defender_id: foe.id, winner: won ? 0 : 1 };
      if (NET.online) {
        NET.logFight({ defender_id: foe.id, attacker_name: acc.pseudo, defender_name: foe.name, kind: 'throne', winner: won ? 0 : 1, seed, a_snap: { week, team: meC.team }, d_snap: { team: foe.team } })
          .then(r => { journal.unshift({ ...r, ...row, attacker_name: acc.pseudo, defender_name: foe.name, kind: 'throne', seed, a_snap: { week, team: meC.team }, d_snap: { team: foe.team } }); return loadThrone(); })
          .then(() => { if (tab === 'throne' && !document.querySelector('.battle')) softRender(); })
          .catch(e => toast(e.message));
      } else if (acc.throne && acc.throne.local && acc.throne.local.week === week) {
        acc.throne.local.fights.push(row);
      }
      if (won) { const o = throneInfo.order; o[mi] = foe.id; o[ri] = myId(); }   // échange des places tout de suite à l'écran
      save();
      return {
        headline: won ? (ri === 0 ? 'TU ES LE ROI !' : `TU PRENDS LA ${ri + 1}ᵉ PLACE !`) : 'DÉFAITE…',
        headClass: won ? 'win' : 'lose',
        rewardsHtml: `<p style="color:var(--muted);margin:0">${won ? `${esc(foe.name)} descend à ta place (${mi + 1}ᵉ).` : 'Tu gardes ta place. Retente quand tu veux !'}</p>`,
      };
    },
  });
}

/** Écran de combat du trône (mêlée), sur le même modèle que runBattle */
function runMelee({ teamA, teamB, fight, title, finish }) {
  stopPreviews.forEach(f => f());
  stopPreviews = [];
  const short = (team) => team.map(m => ({ ...m, name: CLASSES[m.classId].name }));
  const ov = document.createElement('div');
  ov.className = 'battle';
  ov.innerHTML = `
    <div class="battle-vs">${title}</div>
    <div class="battle-wrap"><canvas id="arena"></canvas></div>
    <div class="battle-ctrl">
      <div class="ctrl-row">
        <button class="btn small" data-act="speed" id="speed-btn">Vitesse x1</button>
        <button class="btn small" data-act="toggleSound" id="snd-btn" aria-label="Son">${ico(getPref('sfx') || getPref('music') ? 'speaker' : 'mute')}</button>
      </div>
    </div>
    <div class="battle-after" id="result-slot"></div>`;
  document.body.appendChild(ov);
  hydrate(ov);
  battleFight = null;
  battleCtl = playMelee(ov.querySelector('#arena'), short(teamA), short(teamB), fight, { colors: ['#3d9bff', '#ff5d6c'] });
  battleCtl.speedIdx = 0;
  battleCtl.promise.then(() => {
    const result = fight.result();
    const out = finish(result) || {};
    const won = result.winner === 0;
    ov.querySelector('.battle-ctrl')?.remove();
    const slot = ov.querySelector('#result-slot');
    slot.innerHTML = `
      <div class="result">
        <h2 class="${out.headClass || (won ? 'win' : 'lose')}">${pxCaps(out.headline || (won ? 'VICTOIRE' : 'DÉFAITE…')).replace(/\s*!+\s*$/, '')}</h2>
        ${out.rewardsHtml || ''}
        <button class="btn primary" data-act="endFight">Continuer</button>
      </div>`;
    hydrate(slot);
  });
}

// ------------------------------ PvP en direct ------------------------------
// Un défi PvP est une ligne de la table des défis marquée from_snap.pvp, avec l'équipe de chaque joueur.
// Le combat est calculé de la même façon chez les deux joueurs et chez ceux qui regardent.
let pvpRows = [];
const pvpCache = {};
const isPvp = (c) => !!(c && c.from_snap && c.from_snap.pvp);
/** L'équipe d'un joueur : tous ses persos (4 max), du plus faible au plus fort */
const teamOf = (data, pseudo) => data.heroes.map(h => snapOf(data, h, pseudo)).sort((a, b) => E.powerScore(a) - E.powerScore(b)).slice(0, 4);
const dataOfId = (id) => (id === myId() ? acc : (players.find(p => p.id === id) || {}).data);
function rowTeams(c) {
  const t = (snap, id, name) => (snap && snap.team) || (dataOfId(id) ? teamOf(dataOfId(id), name) : []);
  return [t(c.from_snap, c.from_id, c.from_name), t(c.to_snap, c.to_id, c.to_name)];
}
const pvpResult = (c) => (pvpCache[c.id] ||= E.simulateRelay(...rowTeams(c), Number(c.seed) || 1));
const pvpExpired = (c) => c.status === 'pending' && Date.now() - new Date(c.created_at).getTime() > PVP.expireMs;
const pvpIncoming = () => pvpRows.filter(c => c.status === 'pending' && c.to_id === myId() && !pvpExpired(c));
/** Les 4 persos d'une équipe, côte à côte (case vide si le joueur en a moins) */
const teamStrip = (team, cls = '') => `<div class="tm-strip ${cls}">${[0, 1, 2, 3].map(i => {
  const s = team[i];
  return s ? `<div class="tm-h cls-${s.classId}"><canvas class="px" data-portrait="${s.classId}" data-dye="${s.dye || ''}"></canvas><b>Nv.${s.level}</b></div>`
    : '<div class="tm-h empty"><span>—</span></div>';
}).join('')}</div>`;
const teamPower = (team) => team.reduce((t, s) => t + E.powerScore(s), 0);

function viewPvp() {
  if (!NET.online) return offlineCard('PvP en direct', 'Le PvP marche seulement en ligne, contre tes potes connectés.');
  const me = myId();
  const myTeam = teamOf(acc, acc.pseudo);
  const online = players.filter(p => isOnline(p.id));
  const open = pvpRows.filter(c => c.status === 'pending' && !pvpExpired(c));
  const incoming = open.filter(c => c.to_id === me), outgoing = open.filter(c => c.from_id === me);
  const busy = new Set(open.flatMap(c => [c.from_id, c.to_id]));
  const matches = pvpRows.filter(c => c.status === 'accepted').slice(0, 12);
  const left = E.pvpRewardsLeft(acc);
  return modeHead({
    id: 'pvp', c: '#b05cff', art: '<canvas class="px" data-emblem="pvp"></canvas>',
    title: 'PvP en direct', sub: 'Ton équipe contre celle d’un pote connecté',
    chips: [
      mchip('<i class="dot-on"></i>', 'Potes en ligne', online.length, online.length ? 'hot' : ''),
      mchip('<canvas class="px" data-clat></canvas>', 'Gains du jour', `${PVP.rewardsPerDay - left} / ${PVP.rewardsPerDay}`),
      mchip(ico('swords'), 'Ton équipe', `${myTeam.length} perso${myTeam.length > 1 ? 's' : ''}`),
    ],
    info: `Défie un pote <b>connecté</b> : il reçoit une notification et a 3 minutes pour accepter. Le match se lance aussitôt pour vous deux.<br><br>
      Tous vos persos entrent l’un après l’autre, du plus faible au plus fort. Quand un perso tombe, le suivant de son équipe arrive ; le gagnant du duel garde ses PV. L’équipe qui n’a plus personne perd. Avec moins de 4 persos, tu peux jouer, mais tu es désavantagé.<br><br>
      Le gagnant touche <b>${PVP.reward} Flouze</b> (${PVP.rewardsPerDay} fois par jour maximum). Tout le monde peut regarder les matchs.`,
  }) + `
    <section class="card hx" style="--hc:#b05cff">
      ${secHead(ico('star'), 'Ton équipe', `Puissance totale ${fmtNum(teamPower(myTeam))}`)}
      ${teamStrip(myTeam, 'big')}
    </section>
    ${incoming.length ? `<section class="card hx" style="--hc:#ff5d6c">${secHead(ico('swords'), 'On te défie', 'Réponds vite : 3 minutes')}${incoming.map(c => `
      <div class="foe todo"><span class="foe-av big-ico">${ico('swords')}</span><div class="foe-body"><div class="foe-name">${esc(c.from_name)} te défie</div><div class="foe-sub">${timeOf(c.created_at)}</div></div>
        <button class="foe-btn fight" data-act="pvpVs" data-id="${c.id}"><i>${ico('swords')}</i>Voir</button></div>`).join('')}</section>` : ''}
    <section class="card hx" style="--hc:#b05cff">
      ${secHead('<i class="dot-on"></i>', 'Défier un pote', online.length ? 'Choisis ton adversaire' : 'Personne en ligne pour l’instant')}
      ${online.length ? online.map(p => {
        const t = teamOf(p.data, p.pseudo);
        const waiting = outgoing.find(c => c.to_id === p.id);
        return `
        <div class="pvp-row">
          <div class="pr-top"><div class="foe-name">${dotHtml(p.id)}${nameHtml(p.pseudo, p.data)}</div><small>${ico('bolt')}${fmtNum(teamPower(t))}</small></div>
          ${teamStrip(t)}
          ${waiting ? `<div class="pr-wait">${ico('hourglass')} En attente de sa réponse… <button class="btn small" data-act="pvpCancel" data-id="${waiting.id}">Annuler</button></div>`
            : `<button class="btn danger block" data-act="pvpChallenge" data-id="${p.id}" ${busy.has(p.id) || busy.has(me) ? 'disabled' : ''}>${ico('swords')} Défier ${esc(p.pseudo)}</button>`}
        </div>`;
      }).join('') : '<p class="empty">Dès qu’un pote ouvre l’appli, il apparaît ici.</p>'}
    </section>
    <section class="card hx" style="--hc:#ffd45a">
      ${secHead(ico('play'), 'Matchs', 'Les derniers combats PvP : regarde-les tous')}
      ${matches.length ? matches.map(c => {
        const r = pvpResult(c);
        const mine = c.from_id === me || c.to_id === me;
        const won = mine && r.winner === (c.from_id === me ? 0 : 1);
        return `
        <div class="pvp-match ${mine ? (won ? 'win' : 'loss') : ''}">
          <div class="pm-names"><b class="${r.winner === 0 ? 'w' : ''}">${esc(c.from_name)}</b><span>VS</span><b class="${r.winner === 1 ? 'w' : ''}">${esc(c.to_name)}</b></div>
          <small>${timeOf(c.accepted_at || c.created_at)} · ${ico('trophy')} ${esc(r.winner === 0 ? c.from_name : c.to_name)}</small>
          <button class="ibtn" data-act="pvpWatch" data-id="${c.id}" aria-label="Regarder">${ico('play')}</button>
        </div>`;
      }).join('') : '<p class="empty">Aucun match pour l’instant.</p>'}
    </section>`;
}

/** Écran VS : les deux équipes côte à côte (et, pour un défi reçu, accepter / refuser) */
function openPvpVs(c, invite = false) {
  const [A, B0] = rowTeams(c);
  const B = invite ? teamOf(acc, acc.pseudo) : B0;
  openModal(`
    <div class="pvp-vs">
      <div class="vs-title">${invite ? `${esc(c.from_name)} te défie` : 'Match PvP'}</div>
      <div class="vs-grid">
        <div class="vs-side blue"><b>${esc(c.from_name)}</b>${teamStrip(A, 'col')}<small>${ico('bolt')}${fmtNum(teamPower(A))}</small></div>
        <div class="vs-mid">VS</div>
        <div class="vs-side red"><b>${esc(c.to_name)}</b>${teamStrip(B, 'col')}<small>${ico('bolt')}${fmtNum(teamPower(B))}</small></div>
      </div>
      ${invite
        ? `<div class="row" style="gap:8px;margin-top:14px"><button class="btn block" data-act="pvpDecline" data-id="${c.id}">Refuser</button><button class="btn danger block" data-act="pvpAccept" data-id="${c.id}">${ico('swords')} Accepter</button></div>`
        : `<button class="btn danger block big-go" data-act="pvpWatch" data-id="${c.id}">${ico('play')} Regarder le match</button>`}
      <div class="close-row"><button class="btn" data-act="closeModal">Fermer</button></div>
    </div>`, { center: true });
}

async function pvpChallenge(id) {
  const p = players.find(x => x.id === id);
  if (!p || !isOnline(p.id)) { toast('Ce pote n’est plus en ligne.'); return; }
  try {
    const row = await NET.createPvp(p.id, acc.pseudo, p.pseudo, { pvp: 1, team: teamOf(acc, acc.pseudo) }, (Math.random() * 2 ** 31) | 0);
    if (row) pvpRows.unshift(row);
    toast(`Défi envoyé à ${p.pseudo} : il a 3 minutes pour répondre.`);
  } catch (e) { toast(e.message); }
  softRender();
}

async function pvpAccept(id) {
  const c = pvpRows.find(x => x.id === id);
  if (!c || pvpExpired(c)) { closeModal(); toast('Ce défi a expiré.'); await refreshBets(); softRender(); return; }
  const patch = { status: 'accepted', accepted_at: new Date().toISOString(), to_snap: { pvp: 1, team: teamOf(acc, acc.pseudo) } };
  try { await NET.answerChallenge(c.id, patch); } catch (e) { toast(e.message); return; }
  Object.assign(c, patch);
  closeModal();
  watchPvp(c);
}

function onPvpLive(row) {
  const me = myId();
  const i = pvpRows.findIndex(c => c.id === row.id);
  if (i >= 0) pvpRows[i] = { ...pvpRows[i], ...row }; else pvpRows.unshift(row);
  const free = !document.querySelector('.battle') && !modalRoot.innerHTML;
  if (row.status === 'pending' && row.to_id === me) {
    SFX.message();
    if (free) openPvpVs(row, true); else toast(`${row.from_name} te défie en PvP ! Va dans Combats › PvP.`);
  } else if (row.status === 'accepted' && row.from_id === me) {
    SFX.message();
    if (free) openPvpVs(pvpRows.find(c => c.id === row.id)); else toast(`${row.to_name} a accepté ton défi PvP !`);
  } else if (row.status === 'declined' && row.from_id === me) toast(`${row.to_name} a refusé ton défi.`);
  if (tab === 'pvp' || tab === 'combat') softRender();
}

/** Regarder un match (en direct ou en rediffusion). Le gagnant touche son Flouze. */
function watchPvp(c) {
  const [A, B] = rowTeams(c);
  if (!A.length || !B.length) { toast('Match introuvable.'); return; }
  const result = pvpResult(c);
  const me = myId();
  const mySide = c.from_id === me ? 0 : c.to_id === me ? 1 : -1;
  const pips = (n, tot) => `<span class="pips-vs">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(tot - n)}</span>`;
  const head = (sc) => `${esc(c.from_name)} ${pips(sc[0], A.length)} <span style="color:var(--gold)">VS</span> ${pips(sc[1], B.length)} ${esc(c.to_name)}`;
  runBattle({
    me: A[0], foe: B[0], result, theme: 'arena', track: false, noBar: true, title: head([A.length, B.length]),
    onEvent: (e) => { if (e.score) { const t = document.querySelector('.battle-vs'); if (t) t.innerHTML = head(e.score); } },
    finish: (r) => {
      const wName = r.winner === 0 ? c.from_name : c.to_name;
      const iWon = mySide >= 0 && r.winner === mySide;
      const got = iWon ? E.pvpReward(acc, c.id) : 0;
      if (got) save();
      return {
        won: mySide < 0 || iWon,
        headline: mySide < 0 ? `${wName} GAGNE` : iWon ? 'VICTOIRE' : 'DÉFAITE',
        headClass: mySide < 0 || iWon ? 'win' : 'lose',
        rewardsHtml: got ? `<div class="rw"><span class="pill clat"><canvas class="px" data-clat></canvas>+${got} Flouze</span></div>`
          : iWon ? '<p style="color:var(--muted);margin:0">Gain déjà touché, ou maximum du jour atteint.</p>' : '',
      };
    },
  });
}

// ------------------------------ Championnat ------------------------------
// Tableau de 8 joueurs tiré au hasard chaque lundi ; quarts, demies et finale à 19 h 30 les trois premiers jours.
// En ligne, le tableau et chaque match joué sont rangés dans le journal des combats (le plus ancien enregistrement fait foi) ;
// hors ligne (jeu de test), dans la sauvegarde. Le premier joueur qui ouvre le jeu après 19 h 30 fait jouer les matchs du jour.
let champInfo = { week: '', slots: [], matches: {}, prev: null };
let champLoading = null, champError = '';
const champWeekStart = (week) => { const [y, m, d] = week.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const champRes = (matches) => Object.fromEntries(Object.entries(matches).map(([k, v]) => [k, v.ids[v.winner]]));
/** Joue les matchs dont l'heure est passée et qui n'ont pas encore de résultat ; save(key, match) les enregistre */
async function champPlay(week, slots, matches, byId, store) {
  const start = champWeekStart(week);
  for (let r = 0; r < CHAMP.days.length; r++) {
    if (Date.now() < E.champRoundAt(start, r)) break;
    const tree = E.champTree(slots, champRes(matches));
    for (let m = 0; m < tree[r].length; m++) {
      const x = tree[r][m], key = `${r}-${m}`;
      if (x.bye || x.a === undefined || x.b === undefined || matches[key]) continue;
      const A = byId[x.a], B = byId[x.b];
      if (!A || !B) continue;
      const seed = E.champSeed(week, r, m);
      const res = E.champMatch(A.team, B.team, seed);
      const row = { r, m, ids: [x.a, x.b], names: [A.name, B.name], teams: [A.team, B.team], games: res.games, wins: res.wins, winner: res.winner };
      matches[key] = await store(key, row, seed) || row;
    }
  }
}
function loadChamp() {
  if (champLoading) return champLoading;
  champError = '';
  champLoading = (async () => {
    try {
      const all = throneContenders();
      const byId = Object.fromEntries(all.map(c => [c.id, c]));
      const ids = all.map(c => c.id);
      const week = E.throneWeek();
      const prevWeek = E.throneWeek(new Date(E.throneWeekStart() - 3 * 86400000));
      if (!NET.online) {
        acc.champ ||= { claimed: {} };
        let L = acc.champ.local;
        if (!L || L.week !== week) {
          if (L && L.week === prevWeek) acc.champ.prev = L;
          L = acc.champ.local = { week, slots: E.champSlots(ids, week), matches: {} };
        }
        await champPlay(week, L.slots, L.matches, byId, async () => null);
        save();
        const P = acc.champ.prev && acc.champ.prev.week === prevWeek ? acc.champ.prev : null;
        champInfo = { week, slots: L.slots, matches: L.matches, prev: P };
        return;
      }
      const since = new Date(E.throneWeekStart() - 7 * 86400000).toISOString();
      let rows = await NET.fetchChamp(since);
      const startOf = (w) => rows.find(r => r.kind === 'champ_start' && r.a_snap && r.a_snap.week === w);
      const matchesOf = (w) => {
        const out = {};
        for (const r of rows) if (r.kind === 'champ' && r.a_snap && r.a_snap.week === w && !out[r.a_snap.key]) out[r.a_snap.key] = r.a_snap;
        return out;
      };
      if (!startOf(week)) {
        await NET.logFight({ defender_id: null, attacker_name: acc.pseudo, defender_name: '', kind: 'champ_start', winner: 0, seed: 0, a_snap: { week, slots: E.champSlots(ids, week) }, d_snap: {} });
        rows = await NET.fetchChamp(since);
      }
      const slots = startOf(week).a_snap.slots, matches = matchesOf(week);
      let played = false;
      await champPlay(week, slots, matches, byId, async (key, row, seed) => {
        played = true;
        await NET.logFight({ defender_id: null, attacker_name: row.names[0], defender_name: row.names[1], kind: 'champ', winner: row.winner, seed, a_snap: { week, key, ...row }, d_snap: {} });
        return null;
      });
      if (played) {   // relire : si quelqu'un d'autre a joué le même match en même temps, le premier enregistré compte
        rows = await NET.fetchChamp(since);
        Object.assign(matches, matchesOf(week));
      }
      const ps = startOf(prevWeek);
      champInfo = { week, slots, matches, prev: ps ? { week: prevWeek, slots: ps.a_snap.slots, matches: matchesOf(prevWeek) } : null };
    } catch (e) {
      champError = e.message || 'Erreur inconnue';
    } finally {
      champLoading = null;
    }
  })();
  return champLoading;
}
/** Petit texte de la tuile du championnat */
function champSub() {
  if (champInfo.week !== E.throneWeek()) return 'Tableau de la semaine';
  const nx = champNext();
  if (!nx) { const t = E.champTree(champInfo.slots, champRes(champInfo.matches)); const w = t[2][0].winner; const c = w && throneContenders().find(x => x.id === w); return c ? `Champion : ${c.name}` : 'Finale jouée'; }
  return `${CHAMP.roundNames[nx.r]} à 19 h 30`;
}
/** Prochain tour à jouer cette semaine (ou null si la finale est passée) */
function champNext() {
  const start = champWeekStart(champInfo.week);
  for (let r = 0; r < CHAMP.days.length; r++) if (Date.now() < E.champRoundAt(start, r)) return { r, at: E.champRoundAt(start, r) };
  return null;
}
const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
function viewChamp() {
  if (champInfo.week !== E.throneWeek() || !champInfo.slots.length) {
    if (champError) return `<section class="card"><h2>Championnat</h2><p class="auth-msg">Impossible de charger le championnat : ${esc(champError)}</p>
      <button class="btn primary block" style="margin-top:12px" data-act="retryChamp">Réessayer</button></section>`;
    if (!champLoading) loadChamp().then(() => { if (tab === 'champ') softRender(); });
    return offlineCard('Championnat', 'Chargement du tableau…');
  }
  const nx = champNext();
  const all = throneContenders();
  const byId = Object.fromEntries(all.map(c => [c.id, c]));
  const me = myId();
  const tree = E.champTree(champInfo.slots, champRes(champInfo.matches));
  const fin = tree[2][0];
  const start = champWeekStart(champInfo.week);
  const heroOf = (c) => (c && c.data ? E.strongestHero(c.data) : c ? { classId: c.classId || c.team[0].classId, dye: null } : null);
  const who = (id, won, lost) => {
    if (id === undefined) return '<div class="ch-p tbd"><span class="ch-av"></span><span class="ch-n">À venir</span></div>';
    if (id === null) return '<div class="ch-p empty"><span class="ch-av"></span><span class="ch-n">Place vide</span></div>';
    const c = byId[id], h = heroOf(c);
    return `<div class="ch-p ${won ? 'won' : ''} ${lost ? 'lost' : ''} ${id === me ? 'me' : ''}">
      <span class="ch-av">${h ? `<canvas class="px" data-portrait="${h.classId}" data-dye="${h.dye || ''}"></canvas>` : ''}</span>
      <span class="ch-n">${c ? nameHtml(c.name, c.data) : '?'}</span></div>`;
  };
  const round = (r) => {
    const at = E.champRoundAt(start, r), d = new Date(at);
    const when = `${DAY_NAMES[d.getDay()]} ${CHAMP.hour} h ${String(CHAMP.minute).padStart(2, '0')}`;
    return `
      <section class="card hx ch-round" style="--hc:${['#3d9bff', '#b05cff', '#ffd45a'][r]}">
        ${secHead(ico(r === 2 ? 'trophy' : 'swords'), CHAMP.roundNames[r], Date.now() < at ? `Le ${when}` : 'Joué', Date.now() < at ? `<span class="pill" data-endlong="${at}">${fmtLong(at - Date.now())}</span>` : '')}
        ${tree[r].map((x, m) => {
          const M = champInfo.matches[`${r}-${m}`];
          const done = x.winner !== undefined && x.winner !== null;
          const score = M ? `<b class="ch-sc">${M.wins[0]} - ${M.wins[1]}</b>` : x.bye && done ? '<b class="ch-sc bye">Qualifié</b>' : '<b class="ch-sc">VS</b>';
          return `
            <div class="ch-match ${M ? 'played' : ''}">
              ${who(x.a, done && x.winner === x.a, done && x.a !== null && x.winner !== x.a)}
              ${score}
              ${who(x.b, done && x.winner === x.b, done && x.b !== null && x.winner !== x.b)}
              ${M ? `<button class="btn small blue ch-watch" data-act="champMatch" data-k="${r}-${m}">${ico('play')} Revoir</button>` : ''}
            </div>`;
        }).join('')}
      </section>`;
  };
  // récompenses (cette semaine ou la semaine dernière), à récupérer une fois
  const claimCard = (info) => {
    if (!info) return '';
    const t = E.champTree(info.slots, champRes(info.matches)), place = E.champPlace(t, me);
    acc.champ ||= { claimed: {} };
    if (!place || acc.champ.claimed[info.week]) return '';
    const txt = { win: ['Tu es champion !', 'Un coffre de guerre pour toi.'], second: ['Tu es finaliste !', 'Un coffre de combat pour toi.'], other: ['Merci d’avoir joué !', `Un coffre pour ton ${CLASSES[hero.classId].name}.`] }[place];
    return `<section class="card war-reward"><h2>Championnat${info.week !== champInfo.week ? ' de la semaine dernière' : ''}</h2><div class="big-res">${txt[0]}</div><p class="hint">${txt[1]}</p>
      <button class="btn primary block" data-act="claimChamp" data-w="${info.week}">Récupérer ma récompense</button></section>`;
  };
  // l'heure d'un tour est passée et un match n'a pas encore de résultat : on le fait jouer
  const due = tree.some((rd, r) => Date.now() >= E.champRoundAt(start, r) && rd.some((x, m) => !x.bye && x.a != null && x.b != null && !champInfo.matches[`${r}-${m}`]));
  if (due && !champLoading) setTimeout(() => loadChamp().then(() => { if (tab === 'champ') softRender(); }), 0);
  const myPlace = E.champPlace(tree, me);
  const inIt = champInfo.slots.includes(me);
  const champion = fin.winner ? byId[fin.winner] : null;
  return claimCard(champInfo.prev) + claimCard(champInfo) + modeHead({
    id: 'champ', c: '#ffd45a', art: '<canvas class="px" data-emblem="champ"></canvas>',
    title: 'Championnat', sub: 'Tournoi à 8, les combats se lancent tout seuls à 19 h 30',
    chips: [
      mchip(ico('trophy'), champion ? 'Champion' : 'Prochain tour', champion ? esc(champion.name) : nx ? CHAMP.roundNames[nx.r] : '—', champion ? 'hot' : ''),
      mchip(ico('flag'), 'Toi', !inIt ? 'Pas inscrit' : myPlace === 'win' ? 'Champion' : myPlace === 'second' ? 'Finaliste' : tree.some((rd, r) => rd.some(x => x.winner !== undefined && x.winner !== null && x.winner !== me && (x.a === me || x.b === me))) ? 'Éliminé' : 'En course'),
      mchip(ico('hourglass'), nx ? 'Prochain combat' : 'Nouveau tableau', `<span data-endlong="${nx ? nx.at : Date.now() + E.msToNextThroneWeek()}">${fmtLong(nx ? nx.at - Date.now() : E.msToNextThroneWeek())}</span>`),
    ],
    info: `Chaque lundi, un tableau de <b>8 joueurs</b> est tiré au hasard (s’il manque quelqu’un, son adversaire passe directement). Les combats se lancent tout seuls à <b>19 h 30</b> : quarts de finale le lundi, demi-finales le mardi, finale le mercredi. Chaque match se joue en <b>3 manches</b> (2 manches gagnées suffisent), tes 4 persos contre les 4 siens en relais, sans soin entre deux duels. Tu peux revoir chaque manche.<br><br>Récompenses : <b>coffre de guerre</b> pour le champion, <b>coffre de combat</b> pour le finaliste, <b>1 coffre</b> pour tous les autres. Puis tout recommence le lundi suivant.`,
  }) + [0, 1, 2].map(round).join('');
}
/** Fiche d'un match : les manches, chacune à revoir */
function openChampMatch(key) {
  const M = champInfo.matches[key];
  if (!M) return;
  openModal(`
    <h3>${CHAMP.roundNames[M.r]} : ${esc(M.names[0])} contre ${esc(M.names[1])}</h3>
    <p class="hint" style="margin-top:6px">${esc(M.names[M.winner])} gagne ${M.wins[M.winner]} manche${M.wins[M.winner] > 1 ? 's' : ''} à ${M.wins[1 - M.winner]}.</p>
    <div class="ch-games">${M.games.map((g, i) => `
      <button class="ch-game" data-act="champGame" data-k="${key}" data-g="${i}"><b>Manche ${i + 1}</b><span>${esc(M.names[g.winner])} gagne</span>${ico('play')}</button>`).join('')}
    </div>
    <div class="close-row"><button class="btn" data-act="closeModal">Fermer</button></div>`);
}
function watchChampGame(key, gi) {
  const M = champInfo.matches[key], g = M && M.games[gi];
  if (!g) return;
  closeModal();
  const [A, B] = M.teams;
  const result = E.simulateRelay(A, B, g.seed);
  const pips = (n, tot) => `<span class="pips-vs">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(tot - n)}</span>`;
  const head = (sc) => `${esc(M.names[0])} ${pips(sc[0], A.length)} <span style="color:var(--gold)">VS</span> ${pips(sc[1], B.length)} ${esc(M.names[1])}`;
  runBattle({
    me: A[0], foe: B[0], result, theme: 'castle', track: false, noBar: true, title: head([A.length, B.length]),
    onEvent: (e) => { if (e.score) { const t = document.querySelector('.battle-vs'); if (t) t.innerHTML = head(e.score); } },
    finish: (r) => ({ won: true, headline: `${M.names[r.winner]} GAGNE`, headClass: 'win', rewardsHtml: `<p style="color:var(--muted);margin:0">Manche ${gi + 1} sur ${M.games.length}</p>` }),
  });
}

// ------------------------------ Raid ------------------------------
let raidInfo = { week: '', raid: null, hits: [], prev: null, prevHits: [], prevWeek: '' };
/** Le boss du raid en cours (avant le chargement : le dernier connu) */
const curRaid = () => E.raidDef((raidInfo.raid && raidInfo.raid.boss) || acc.raid.lastTag || RAID.tag);
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
  const botHits = (key, days, level) => FRIENDS.flatMap(f => {
    const out = [];
    for (let d = 0; d < days; d++) {
      const r = makeRng(hashStr('raid' + key + f.id + d));
      const n = Math.floor(r() * 4);
      for (let i = 0; i < n; i++) out.push({ user_id: f.id, pseudo: f.name, damage: Math.round(E.raidExpectedDamage(level) * (0.6 + r() * 0.8)) });
    }
    return out;
  });
  const hitsOf = (k) => { const R = L[k]; return [...R.hits, ...botHits(k, Math.min(RAID_DAYS, Math.floor((Date.now() - R.start) / 86400000) + 1), R.level)]; };
  const keys = Object.keys(L).filter(k => L[k].start).sort((a, b) => L[b].start - L[a].start);
  // raid en cours : pas fini et boss encore debout (s'il est battu, le suivant arrive tout de suite)
  let curKey = keys.find(k => E.isRaidTag(L[k].tag) && Date.now() < raidEndOf(L[k].start) && !raidSummary(L[k], hitsOf(k)).killed);
  if (!curKey) {
    const tag = keys.length ? E.nextRaidTag(L[keys[0]].tag) : RAID.tag;   // boss suivant de la rotation
    curKey = tag + E.dayKey();
    const lv = groupLevels();
    L[curKey] = { start: Date.now(), tag, hp: E.raidHp(lv, tag), level: Math.round(lv.reduce((a, b) => a + b, 0) / lv.length), hits: [] };
  }
  const prevKey = Object.keys(L).filter(k => k !== curKey && L[k].start).sort((a, b) => L[b].start - L[a].start)[0] || '';
  for (const k of Object.keys(L)) if (k !== curKey && k !== prevKey) delete L[k];
  const cur = L[curKey];
  const res = { week: curKey, prevWeek: prevKey, endsAt: raidEndOf(cur.start), raid: { hp: cur.hp, level: cur.level, boss: cur.tag }, hits: hitsOf(curKey), prev: null, prevHits: [] };
  if (prevKey) { const P = L[prevKey]; res.prev = { hp: P.hp, level: P.level, boss: P.tag }; res.prevHits = hitsOf(prevKey); }
  return res;
}

// Le boss a toujours au moins RAID.minHp PV
const fixRaid = (r) => (r ? { ...r, hp: Math.max(RAID.minHp, r.hp) } : r);

/** Raid en ligne : le plus récent encore actif (7 jours après son ouverture), sinon on en ouvre un nouveau */
function loadRaid() {
  if (!NET.online) { raidInfo = localRaid(); acc.raid.lastTag = raidInfo.raid.boss; save(); return Promise.resolve(); }
  if (raidLoading) return raidLoading;   // déjà en route : on attend la même réponse
  raidError = '';
  raidLoading = (async () => {
    try {
      const list = (await NET.fetchLatestRaids()).map(fixRaid);
      const endOf = (r) => raidEndOf(new Date(r.created_at).getTime());
      let raid = list.find(r => E.isRaidTag(r.boss) && Date.now() < endOf(r)) || null;
      // boss déjà battu : pas besoin d'attendre la fin des 7 jours, le suivant arrive tout de suite
      if (raid && raidSummary(raid, await NET.fetchRaidHits(raid.week)).killed) raid = null;
      const prev = list.find(r => r !== raid) || null;
      if (!raid) {
        // raid fini : on ouvre le boss suivant de la rotation (le même pour tout le monde, donc le même nom de semaine)
        const tag = E.nextRaidTag(list[0] && list[0].boss);
        const lv = groupLevels();
        const week = (tag === RAID.tag ? 'v3' : tag.replace(':', '-')) + '-' + E.dayKey();
        raid = fixRaid(await NET.openRaid(week, tag, E.raidHp(lv, tag), Math.round(lv.reduce((a, b) => a + b, 0) / lv.length)));
      }
      if (!raid) throw new Error('Le raid n’a pas pu être ouvert.');
      const [hits, prevHits] = await Promise.all([NET.fetchRaidHits(raid.week), prev ? NET.fetchRaidHits(prev.week) : []]);
      if (raidSummary(raid, hits).killed) throw new Error('Le boss suivant n’a pas pu être ouvert.');   // évite de recharger en boucle
      raidInfo = { week: raid.week, raid, hits, prev, prevHits, prevWeek: prev ? prev.week : '', endsAt: endOf(raid) };
      acc.raid.lastTag = raid.boss;
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
  // raid fini, ou boss battu : on charge le suivant
  if (!raidInfo.raid || Date.now() >= raidInfo.endsAt || raidSummary(raidInfo.raid, raidInfo.hits).killed) {
    // Important : ne lancer le chargement qu'une fois (sinon l'écran se redessine en boucle et l'appli se fige)
    if (raidError) {
      return `<section class="card"><h2>Raid : ${curRaid().name}</h2>
        <p class="auth-msg">Impossible de charger le raid : ${esc(raidError)}</p>
        <button class="btn primary block" style="margin-top:12px" data-act="retryRaid">Réessayer</button></section>`;
    }
    if (!raidLoading) loadRaid().then(() => { if (tab === 'raid') softRender(); });
    return offlineCard(`Raid : ${curRaid().name}`, 'Chargement du raid…');
  }
  const me = myId();
  const S = raidSummary(raidInfo.raid, raidInfo.hits);
  const left = RAID.attemptsPerHalf - E.raidState(acc).used;
  const mine = S.board.find(b => b.id === me);
  const isMvp = S.board[0] && S.board[0].id === me;
  const canClaim = S.killed && mine && !acc.raid.claimed[raidInfo.week];
  let prevCard = '';
  if (raidInfo.prev && !acc.raid.claimed[raidInfo.prevWeek]) {
    const P = raidSummary(raidInfo.prev, raidInfo.prevHits);
    const PB = E.raidDef(raidInfo.prev.boss);
    const pm = P.board.find(b => b.id === me);
    if (pm) prevCard = `
      <section class="card war-reward">
        <h2>Raid précédent</h2>
        <div class="big-res">${P.killed ? `${PB.name} est tombé${PB.f ? 'e' : ''} !` : `${PB.name} a résisté…`}</div>
        <p class="hint">Tu lui as infligé ${fmtNum(pm.dmg)} dégâts.</p>
        <button class="btn primary block" data-act="claimRaid" data-week="${raidInfo.prevWeek}">Récupérer ma récompense</button>
      </section>`;
  }
  const R = RAID.rewards;
  const hp = raidInfo.raid.hp;
  const B = curRaid();
  return prevCard + modeHead({
    id: 'raid', c: '#ff8a3d', art: `<span class="mh-fire">${ico('fire')}</span>`,
    title: `Raid : ${B.name}`, sub: B.cycle ? `Tour ${B.cycle + 1} : il revient plus fort !` : 'Tout le groupe tape le même boss',
    chips: [
      mchip(ico('swords'), 'Tes assauts', `${left} / ${RAID.attemptsPerHalf}`, left && !S.killed ? 'hot' : ''),
      mchip(ico('clock'), 'Nouveaux assauts', `<span data-timer="half">${fmt(E.msToNextHalf())}</span>`),
      mchip(ico('hourglass'), 'Fin du raid', `<span data-endlong="${raidInfo.endsAt}">${fmtLong(raidInfo.endsAt - Date.now())}</span>`),
    ],
    info: `Tout le groupe tape le même boss. <b>${RAID.attemptsPerHalf} assauts</b> par compte toutes les 12 h (minuit et midi). Le raid dure 7 jours.<br><br>S’il tombe avant la fin : <b>${R.killChests} coffre de guerre + ${R.killClat} Flouze</b> pour chaque participant, et un coffre de guerre en plus pour celui qui a fait le plus de dégâts. Sinon, ${R.failClat} Flouze de consolation.<br><br><b>XP</b> : chaque assaut rapporte de l’XP à ton perso actif.`,
  }) + `
    <section class="card hx boss-stage raid-stage" style="--hc:#ff8a3d">
      <div class="bs-tag">BOSS · Nv.${raidInfo.raid.level}</div>
      <div class="bs-art"><canvas class="px" data-monster="${B.sprite}"></canvas></div>
      <div class="bs-name">${B.name}</div>
      <div class="hp-bar"><i style="width:${(S.remaining / hp) * 100}%"></i><span>${S.killed ? 'VAINCU !' : `${fmtNum(S.remaining)} / ${fmtNum(hp)} PV`}</span></div>
      ${canClaim
        ? `<button class="btn primary block big-go" data-act="claimRaid" data-week="${raidInfo.week}">Récupérer ma récompense</button>`
        : `<button class="btn danger block big-go" data-act="attackRaid" ${left > 0 && !S.killed ? '' : 'disabled'}>${S.killed ? 'Boss vaincu' : left > 0 ? `${ico('swords')} Attaquer` : 'Plus d’assaut : reviens plus tard'}</button>`}
    </section>
    <section class="card hx" style="--hc:#ff8a3d">
      ${secHead(ico('trophy'), 'Dégâts du raid', `${fmtNum(S.total)} dégâts au total`)}
      ${S.board.length ? S.board.map((b, i) => `
        <div class="opp rank ${b.id === me ? 'me' : ''}"><div class="pos">${[ico('medal1'), ico('medal2'), ico('medal3')][i] || i + 1}</div>
          <div class="o-body"><div class="o-name">${nameHtml(b.pseudo, dataOfPseudo(b.pseudo))}</div></div><div class="score">${fmtNum(b.dmg)}</div></div>`).join('')
        : '<p class="empty">Personne ne l’a encore attaqué.</p>'}
    </section>`;
}

function attackRaid() {
  const st = E.raidState(acc);
  if (st.used >= RAID.attemptsPerHalf || !raidInfo.raid) return;
  const S = raidSummary(raidInfo.raid, raidInfo.hits);
  if (S.killed) return;
  const me = mySnap();
  const B = curRaid();
  const boss = E.raidBoss(raidInfo.raid.level, raidInfo.raid.hp, S.remaining, B.tag);
  st.used++;
  E.missionEvent(acc, 'raid');
  save();
  const week = raidInfo.week;
  const h = hero;
  runBattle({
    me, foe: boss, seed: (Math.random() * 2 ** 31) | 0, sim: { maxActions: RAID.maxActions, timeoutWinner: false },
    theme: B.theme, manual: true, victory: myVictory(), title: `Raid · ${B.name}`,
    finish: (result) => {
      const dmg = E.damageDealt(result, S.remaining);
      const hit = { user_id: myId(), pseudo: acc.pseudo, damage: dmg };
      if (raidInfo.week === week) raidInfo.hits.push(hit);
      if (NET.online) NET.addRaidHit(week, acc.pseudo, dmg).catch(e => toast(e.message));
      else if (acc.raid.local[week]) acc.raid.local[week].hits.push(hit);
      E.missionEvent(acc, 'raid_dmg', dmg);
      const lv = E.raidAssaultXp(h);
      save();
      const killed = dmg >= S.remaining;
      return {
        rewards: lv,
        headline: killed ? `${B.name.toUpperCase()} EST TOMBÉ${B.f ? 'E' : ''} !` : `${fmtNum(dmg)} DÉGÂTS`, headClass: 'win',
        rewardsHtml: `<div class="rw"><span class="pill gold">${fmtNum(dmg)} dégâts infligés</span><span class="pill">Reste ${fmtNum(Math.max(0, S.remaining - dmg))} PV</span>${xpPills(lv)}</div>`,
      };
    },
  });
}

function claimRaid(week) {
  const cur = week === raidInfo.week;
  const S = cur ? raidSummary(raidInfo.raid, raidInfo.hits) : raidSummary(raidInfo.prev, raidInfo.prevHits);
  const me = myId();
  const rw = E.raidReward(acc, week, S.killed, S.board[0] && S.board[0].id === me, S.board.some(b => b.id === me));
  if (!rw) return;
  save(); render();
  toast(`Récompense : ${rw.chests ? `${rw.chests} coffre${rw.chests > 1 ? 's' : ''} de guerre + ` : ''}${rw.clat} Flouze !`);
}

// ------------------------------ La Horde ------------------------------
function viewHorde() {
  const st = E.hordeState(acc);
  const left = E.hordeRunsLeft(acc);
  const ex = [3, 10, 20, 30].map(k => `<span><b>${k}</b> monstres <i>→</i> <b>${E.hordeFlouze(k)}</b><canvas class="px" data-clat></canvas></span>`).join('');
  return modeHead({
    id: 'horde', c: '#ff3d6e', art: '<canvas class="px" data-emblem="horde"></canvas>',
    title: 'La Horde', sub: 'Des monstres à la chaîne : va le plus loin possible',
    chips: [
      mchip(ico('swords'), 'Essais', `${left} / ${HORDE.runsPerHalf}`, left ? 'hot' : ''),
      mchip(ico('trophy'), 'Ton record', `${st.best || 0}`),
      mchip(ico('clock'), 'Nouveaux essais', `<span data-timer="half">${fmt(E.msToNextHalf())}</span>`),
    ],
    info: `Les monstres arrivent l’un après l’autre, sans pause, et de plus en plus forts (le 1<sup>er</sup> est niveau 1). <b>Aucun soin</b> entre deux monstres : tu gardes tes PV jusqu’à tomber.<br><br>
      Tu gagnes du Flouze selon le nombre de monstres battus. <b>${HORDE.runsPerHalf} essais toutes les 12 h</b> (minuit et midi), pour tout le compte : c’est ton perso actif qui se bat.<br><br><b>XP</b> : chaque essai rapporte aussi de l’XP à ton perso actif. Plus tu vas loin, plus tu en gagnes.`,
  }) + `
    <section class="card hx horde-stage" style="--hc:#ff3d6e">
      ${secHead(ico('flag'), 'Combien tu gagnes', 'Flouze selon les monstres battus')}
      <div class="horde-ex">${ex}</div>
      <button class="btn danger block big-go" data-act="startHorde" ${left ? '' : 'disabled'}>${left ? `${ico('swords')} Lancer la horde` : 'Plus d’essai : reviens à minuit ou à midi'}</button>
    </section>
    <section class="card hx" style="--hc:#ff3d6e">
      ${secHead(ico('trophy'), 'Classement', 'Le record de chaque joueur')}
      ${hordeBoard().map((r, i) => `
        <div class="opp rank ${r.me ? 'me' : ''}"><div class="pos">${[ico('medal1'), ico('medal2'), ico('medal3')][i] || i + 1}</div>
          <div class="av"><canvas class="px" data-portrait="${r.classId}"></canvas></div>
          <div class="o-body"><div class="o-name">${nameHtml(r.name, r.data)}</div><div class="o-sub">${CLASSES[r.classId].name}</div></div>
          <div class="score">${r.best} monstre${r.best > 1 ? 's' : ''}</div></div>`).join('')}
    </section>`;
}

/** Classement de la horde : le record de chaque joueur (monstres battus en un essai) */
function hordeBoard() {
  const row = (name, data, best, me = false) => { const h = data ? E.strongestHero(data) : null; return { name, data, best, classId: h ? h.classId : 'guerrier', me }; };
  const rows = [row(acc.pseudo, acc, E.hordeState(acc).best || 0, true)];
  if (NET.online) players.forEach(p => rows.push(row(p.pseudo, p.data, (p.data.horde && p.data.horde.best) || 0)));
  else opponents().forEach(o => rows.push({ name: o.name, data: null, classId: o.classId, best: Math.max(1, Math.round(o.level / 4)) }));
  return rows.sort((a, b) => b.best - a.best || (b.me ? 1 : 0) - (a.me ? 1 : 0));
}

function startHorde() {
  if (E.hordeRunsLeft(acc) <= 0) { toast('Plus d’essai : reviens à minuit ou à midi.'); return; }
  E.hordeState(acc).used++;
  save();
  const me = mySnap();
  const seed = (Math.random() * 2 ** 31) | 0;
  const live = E.createHorde(me, seed);
  const h = hero;
  const head = (kills) => `La Horde <span style="color:var(--gold)">·</span> ${kills} monstre${kills > 1 ? 's' : ''} battu${kills > 1 ? 's' : ''} <span style="color:var(--gold)">·</span> +${E.hordeFlouze(kills)} <canvas class="px ico" data-clat></canvas>`;
  runBattle({
    me, foe: E.hordeMonster(seed, 0), live, theme: 'abyss', manual: true, victory: myVictory(), skip: true,
    title: head(0),
    onEvent: (e) => {
      if (e.type !== 'kill') return;
      const t = document.querySelector('.battle-vs');
      if (t) { t.innerHTML = head(e.kills); hydrate(t); }
    },
    finish: (result) => {
      const rw = E.hordeResult(acc, result.kills, h);
      save();
      return {
        rewards: rw,
        headline: `${result.kills} MONSTRE${result.kills > 1 ? 'S' : ''}`, headClass: result.kills ? 'win' : 'lose',
        rewardsHtml: `
          <div class="rw"><span class="pill clat"><canvas class="px" data-clat></canvas>+${rw.flouze} Flouze</span>${xpPills(rw)}${rw.record ? '<span class="pill gold">Nouveau record</span>' : ''}</div>
          <p style="color:var(--muted);margin:0">Encore ${E.hordeRunsLeft(acc)} essai${E.hordeRunsLeft(acc) > 1 ? 's' : ''} d’ici ${fmt(E.msToNextHalf())}.</p>`,
      };
    },
  });
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
  const next = t.best + 1;
  const m = E.towerMonster(next);
  const prize = TOWER.clatPerFloor + (next % 10 === 0 ? TOWER.clatEvery10 : 0);
  return modeHead({
    id: 'tower', c: '#a77bff', art: '<canvas class="px" data-emblem="tower"></canvas>',
    title: 'Tour infinie', sub: 'Monte le plus haut possible : elle ne s’arrête jamais',
    chips: [
      mchip('▲', 'Prochain étage', next, 'hot'),
      mchip(ico('trophy'), `Record ${CLASSES[hero.classId].name}`, t.best),
      mchip('<canvas class="px" data-clat></canvas>', 'Récompense', `+${prize}`),
    ],
    info: `Chaque étage est plus dur que le précédent. Tentatives <b>illimitées</b> : si tu perds, tu restes bloqué à cet étage jusqu’à le gagner.<br><br><b>+${TOWER.clatPerFloor} Flouze</b> par nouvel étage, et <b>+${TOWER.clatEvery10}</b> en plus tous les 10 étages. Chaque perso a son propre record.<br><br><b>XP</b> : chaque étage réussi rapporte de l’XP (une défaite ne rapporte rien).`,
  }) + `
    <section class="card hx boss-stage" style="--hc:#a77bff">
      <div class="bs-tag">ETAGE ${next}</div>
      <div class="bs-art"><canvas class="px" data-monster="${m.dungeon.sprite}"></canvas></div>
      <div class="bs-name">${m.snap.name} <span class="pill">Nv.${m.snap.level}</span></div>
      <button class="btn danger block big-go" data-act="attackTower">${ico('swords')} Attaquer l’étage ${next}</button>
    </section>
    <section class="card hx" style="--hc:#a77bff">
      ${secHead(ico('trophy'), 'Classement', 'Le meilleur étage de chaque joueur')}
      ${towerBoard().map((r, i) => `
        <div class="opp rank ${r.me ? 'me' : ''}"><div class="pos">${[ico('medal1'), ico('medal2'), ico('medal3')][i] || i + 1}</div>
          <div class="av"><canvas class="px" data-portrait="${r.classId}"></canvas></div>
          <div class="o-body"><div class="o-name">${nameHtml(r.name, r.data)}</div><div class="o-sub">${CLASSES[r.classId].name}</div></div>
          <div class="score">Étage ${r.floor}</div></div>`).join('')}
    </section>`;
}

function attackTower() {
  const t = E.towerState(hero);
  const next = t.best + 1;
  const m = E.towerMonster(next);
  const me = mySnap();
  const h = hero;
  runBattle({
    me, foe: m.snap, seed: (Math.random() * 2 ** 31) | 0, theme: m.theme, manual: true, victory: myVictory(),
    title: `Tour · Étage ${next}`,
    finish: (result) => {
      const won = result.winner === 0;
      const rw = E.towerResult(acc, h, won, m.snap.level);
      E.missionEvent(acc, 'tower_try');
      if (won) E.missionEvent(acc, 'tower');
      save();
      return {
        rewards: rw,
        headline: won ? `ÉTAGE ${next} RÉUSSI !` : 'ÉCHEC…', headClass: won ? 'win' : 'lose',
        rewardsHtml: won
          ? `<div class="rw"><span class="pill clat"><canvas class="px" data-clat></canvas>+${rw.clat} Flouze</span>${xpPills(rw)}</div>`
          : '<p style="color:var(--muted);margin:0">Tu restes à cet étage : réessaie autant que tu veux !</p>',
      };
    },
  });
}

// ------------------------------ Boutique ------------------------------
let shopKind = 'skin';
const SHOP_TABS = [['skin', 'Skins'], ['title', 'Titres'], ['color', 'Pseudo'], ['victory', 'Victoire']];

function viewShop() {
  const owned = new Set(acc.cosmetics.owned);
  const daily = E.dailyShop(acc);
  const left = daily.filter(d => !d.bought).length;
  let list = COSMETICS.filter(c => c.kind === shopKind);
  if (shopKind === 'skin') list = [...list.filter(c => c.cls === hero.classId), ...COSMETICS.filter(c => c.kind === 'dye' && owned.has(c.id))];
  list.sort((a, b) => (a.kind === 'dye') - (b.kind === 'dye') || a.price - b.price);
  const isOn = (c) => (c.kind === 'dye' || c.kind === 'skin' ? hero.dye === c.id : acc.cosmetics[c.kind] === c.id);
  const preview = (c) => {
    if (c.kind === 'title') return `<span class="ptitle big">« ${esc(c.name)} »</span>`;
    if (c.kind === 'color') { const fx = NAME_FX.includes(c.color); return `<span class="pname big ${fx ? c.color : ''}" ${fx ? '' : `style="color:${c.color}"`}>${esc(acc.pseudo)}</span>`; }
    if (c.kind === 'dye' || c.kind === 'skin') return `<canvas class="px" data-hero="${hero.classId}" data-dye="${c.id}"></canvas>`;
    return `<div class="dots">${c.colors.map(col => `<i style="background:${col}"></i>`).join('')}</div>`;
  };
  return modeHead({
    id: 'shop', c: '#ffd45a', art: '<canvas class="px" data-emblem="shop"></canvas>',
    title: 'Boutique', sub: 'Dépense ton Flouze',
    chips: [
      mchip('<canvas class="px" data-clat></canvas>', 'Ton Flouze', fmtNum(acc.clat), 'hot'),
      mchip('<canvas class="px" data-key></canvas>', `Clefs ${CLASSES[hero.classId].name}`, hero.keys),
      mchip(ico('bag'), 'Objets du jour', `${left} / ${SHOP_DAILY.count}`),
    ],
    info: `<b>Clef</b> : ouvre 1 coffre de ton perso actif. <b>Objets du jour</b> : 3 objets au hasard, du Commun à l’Épique (${SHOP_DAILY.prices.join(' / ')} Flouze selon la rareté), un seul exemplaire de chaque, renouvelés à minuit. <b>Apparences</b> : pour frimer, aucun effet sur la force. Les skins vont à ton perso actif (change-le en haut de l’onglet Combats).`,
  }) + `
    <section class="card hx merchant" style="--hc:#ffd45a">
      ${secHead(ico('star'), 'Le marchand', `Nouveaux objets dans <span data-timer="day3">${fmt(msToMidnight())}</span>`)}
      <div class="key-deal">
        <span class="kd-art"><canvas class="px" data-key></canvas></span>
        <div class="o-body"><b>Clef</b><small>Ouvre 1 coffre de ton ${CLASSES[hero.classId].name} · tu en as ${hero.keys}</small></div>
        <button class="foe-btn fight gold" data-act="buyKey" ${acc.clat < KEY_PRICE ? 'disabled' : ''}><i><canvas class="px ico" data-clat></canvas></i>${KEY_PRICE}</button>
      </div>
      <div class="daily">
        ${daily.map(d => `
          <div class="dl ${d.bought ? 'sold' : ''}">
            <div class="it r${d.rarity} dl-ico" style="--rc:${RARITIES[d.rarity].color}"><canvas class="px" data-icon="${d.itemId}"></canvas></div>
            <b>${esc(ITEMS[d.itemId].name)}</b><small>${SLOTS[ITEMS[d.itemId].slot].name} · <span style="color:${RARITIES[d.rarity].color}">${RARITIES[d.rarity].name}</span></small>
            <small class="dl-st">${Object.entries(E.itemStats(d.itemId, d.rarity)).filter(([, v]) => v > 0).sort((x, y) => y[1] - x[1]).slice(0, 2).map(([k, v]) => `<i style="color:${STATS[k].color}">+${v} ${STATS[k].short}</i>`).join(' ')}</small>
            ${d.bought ? '<span class="dl-sold">Acheté</span>'
              : `<button class="btn small green" data-act="buyDaily" data-i="${d.i}" ${acc.clat < d.price ? 'disabled' : ''}>${d.price}<canvas class="px" data-clat></canvas></button>`}
          </div>`).join('')}
      </div>
    </section>
    <section class="card hx" style="--hc:#b05cff">
      ${secHead(ico('magic'), 'Apparences', shopKind === 'skin' ? `Skins de ton ${CLASSES[hero.classId].name}` : 'Pour frimer : aucun effet sur la force')}
      <div class="seg seg4">${SHOP_TABS.map(([k, n]) => `<button class="${shopKind === k ? 'on' : ''}" data-act="shopKind" data-k="${k}">${n}</button>`).join('')}</div>
      <div class="shop ${shopKind === 'skin' ? 'skins' : ''}">
        ${list.map(c => `
          <div class="shop-item ${isOn(c) ? 'on' : ''} ${owned.has(c.id) ? 'owned' : ''}">
            <div class="sh-prev">${preview(c)}</div>
            <div class="sh-name">${esc(c.name)}${c.kind === 'dye' ? '<small>ancienne teinture</small>' : ''}</div>
            ${owned.has(c.id)
              ? `<button class="btn small ${isOn(c) ? '' : 'primary'}" data-act="equipCos" data-id="${c.id}">${isOn(c) ? 'Retirer' : 'Porter'}</button>`
              : `<button class="btn small green" data-act="buyCos" data-id="${c.id}" ${acc.clat < c.price ? 'disabled' : ''}>${c.price}<canvas class="px" data-clat></canvas></button>`}
          </div>`).join('')}
      </div>
    </section>`;
}

// ------------------------------ En direct ------------------------------
function onLive(kind, row) {
  if (kind === 'challenge' && isPvp(row)) { onPvpLive(row); return; }
  if (kind === 'fight') {
    journal.unshift(row);
    journalUnseen++;
    setBadge('social', journalUnseen + chatUnread);
    const won = row.winner === 0;
    SFX.message();
    if (row.kind === 'throne') {
      toast(`${row.attacker_name} t’a défié pour le trône : ${won ? 'il prend ta place !' : 'tu gardes ta place !'}`);
      loadThrone().then(() => { if (tab === 'throne' && !document.querySelector('.battle')) softRender(); });
    } else toast(`${row.attacker_name} t’a attaqué (${KIND_NAME[row.kind] || ''}) : ${won ? 'il a gagné' : 'tu as gagné'} !`);
    if (tab === 'journal') { markJournalSeen(); softRender(); }
  } else if (kind === 'challenge') {
    if (row.to_id === NET.myId() && row.status === 'pending') { SFX.message(); toast(`${row.from_name} te défie en duel !`); }
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

/** Bonus d'XP de rattrapage selon le retard sur le perso le plus haut du jeu (tous les persos de tous les joueurs, les miens compris) */
function updateXpBonus() {
  const top = Math.max(...[acc, ...players.map(p => p.data)].flatMap(a => (a && a.heroes || []).map(h => h.level)));
  const catchup = NET.online ? E.catchupBonus(hero.level, top) : 1;
  E.setXpBonus(catchup, E.altXpBonus(acc, hero));   // persos secondaires : ×2 en plus, jusqu'au niveau du perso le plus haut du compte
}

const VIEWS = { throne: viewThrone, hero: viewHero, chests: viewChests, bag: viewBag, fights: viewFights, dungeons: viewDungeons, ranking: viewRanking, war: viewWar, chat: viewChat,
  combat: viewCombat, social: viewSocial, shop: viewShop, tower: viewTower, raid: viewRaid, horde: viewHorde, pvp: viewPvp, bets: viewBets, champ: viewChamp, journal: viewJournal, players: viewPlayers };

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
  if (lv.levels > 0) { SFX.level(); E.missionEvent(acc, 'level', lv.levels); save(); toast(`Niveau ${hero.level} ! +${lv.levels * 3} points de caractéristiques`); }
  for (const s of lv.newSpells || []) toast(`Nouveau sort : ${s.name}`);
  if (lv.lvlKeys > 0) toast(`+${lv.lvlKeys} clef${lv.lvlKeys > 1 ? 's' : ''} de montée de niveau !`);
}

// ------------------------------ Ouverture de coffre ------------------------------
function openChestFlow(kind, all = false) {
  const res = all ? E.openAllChests(acc, hero) : E.openChest(acc, hero, kind);
  if (!res) return;
  E.missionEvent(acc, 'chest', all ? res.count : 1);
  E.missionEvent(acc, 'key_use', all ? res.keys : res.key ? 1 : 0);
  save();
  SFX.chest();
  openModal(`
    <div class="open-stage ${res.items.length > 4 ? 'many' : ''}">
      <h3>${all ? `${res.count} coffres${res.keys ? ` (dont ${res.keys} avec une clef)` : ''}` : ({ combat: 'Coffre de combat', war: 'Coffre de guerre' }[kind] || (res.key ? 'Coffre (clef)' : 'Coffre'))}</h3>
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
      <div class="loot ${res.items.length > 4 ? 'many' : ''}">
        ${res.items.map((it, i) => `
          <div class="loot-card" style="--rc:${RARITIES[it.rarity].color};animation-delay:${Math.min(i * 0.18, 2)}s">
            <canvas class="px" data-icon="${it.itemId}"></canvas>
            <div class="ln">${esc(ITEMS[it.itemId].name)}</div>
            ${ITEMS[it.itemId].set ? `<div class="ls">${SETS[ITEMS[it.itemId].set].name}</div>` : ''}
            <div class="rar" style="color:${RARITIES[it.rarity].color}">${RARITIES[it.rarity].name}</div>
          </div>`).join('')}
      </div>
      <p class="loot-xp">+${res.xp} XP${all && E.openableChests(hero) > 0 ? ` · encore ${E.openableChests(hero)} coffre${E.openableChests(hero) > 1 ? 's' : ''} à ouvrir` : ''}</p>
      ${res.items.some(it => E.stackOf(hero, it.itemId, it.rarity).length >= 2 && it.rarity < RARITIES.length - 1 && !E.fusionLocked(hero, it.rarity)) ? '<p style="color:#c58bff;font-weight:800;margin:6px 0 0">✦ Une fusion est possible !</p>' : ''}
      <div class="close-row"><button class="btn primary" data-act="closeAndRender">Super !</button></div>`;
    hydrate(document.getElementById('loot'));
    announce(res);
  }, 900);
}

// ------------------------------ Combat ------------------------------
let battleCtl = null;
let battleFight = null;      // combat en direct (le mode manuel est possible)
const MANUAL_PREF = 'fuze-manual';
const manualPref = () => { try { return localStorage.getItem(MANUAL_PREF) === '1'; } catch (e) { return false; } };
const setManualPref = (v) => { try { localStorage.setItem(MANUAL_PREF, v ? '1' : '0'); } catch (e) { /* stockage indisponible */ } };

/** Compte ce qui s'est passé dans un combat, pour les missions */
function trackBattle(result) {
  let spells = 0, crits = 0, dodges = 0, pet = 0;
  for (const e of result.log) {
    if (e.type !== 'action') continue;
    if (e.actor === 0) {
      if (e.pet) pet++; else if (e.id) spells++;
      crits += e.results.filter(r => r.type === 'hit' && r.crit && r.target === 1).length;
    } else dodges += e.results.filter(r => r.type === 'dodge' && r.target === 0).length;
  }
  E.missionEvent(acc, 'fight');
  if (result.winner === 0) E.missionEvent(acc, 'win');
  if (result.winner === 0 && result.usedManual) E.missionEvent(acc, 'manual_win');
  E.missionEvent(acc, 'spell', spells);
  E.missionEvent(acc, 'crit', crits);
  E.missionEvent(acc, 'dodge', dodges);
  E.missionEvent(acc, 'pet', pet);
}

/** Barre des 4 sorts sous le héros : recharge, sort lancé, sort demandé (manuel) */
function updateSpellBar(e) {
  const bar = document.getElementById('spellbar');
  if (!bar || !e.s) return;
  const cds = e.s[0].cd || [];
  bar.querySelectorAll('.sb').forEach(b => {
    const left = Math.max(0, (cds[+b.dataset.i] || 0) - 1);
    b.classList.toggle('ready', left === 0);
    b.querySelector('.cd').textContent = left ? left : '';
    if (e.type === 'action' && e.actor === 0 && e.id === b.dataset.id) {
      b.classList.remove('fire'); void b.offsetWidth; b.classList.add('fire');
    }
    // sort demandé (manuel) : reste en surbrillance tant que le héros ne l'a pas lancé
    b.classList.toggle('queued', !!battleFight && battleFight.queued === b.dataset.id);
  });
}

/**
 * Combat en plein écran puis panneau de résultat.
 * - Contre un vrai joueur (manual = false) : combat calculé d'avance, mode auto obligatoire,
 *   et finish(result) est appelé tout de suite (impossible de « rejouer » en quittant).
 * - En donjon, à la tour et au raid (manual = true) : combat en direct, on peut passer en manuel ;
 *   finish(result) est appelé à la fin. finish renvoie { rewardsHtml, rewards, headline, headClass }.
 */
// La police pixel dessine les majuscules accentuées (É, À…) plus petites : on enlève l'accent des majuscules dans les gros titres
const PX_CAPS = { À: 'A', Â: 'A', Ä: 'A', É: 'E', È: 'E', Ê: 'E', Ë: 'E', Î: 'I', Ï: 'I', Ô: 'O', Ö: 'O', Ù: 'U', Û: 'U', Ü: 'U', Ç: 'C' };
const pxCaps = (t) => String(t);   // Lilita One affiche bien les capitales accentuées
/** Pastilles de récompense : XP gagnée et clefs de montée de niveau */
const xpPills = (rw) => `${rw && rw.xp ? `<span class="pill gold">+${fmtNum(rw.xp)} XP</span>` : ''}${rw && rw.lvlKeys ? `<span class="pill gold"><canvas class="px" data-key></canvas>+${rw.lvlKeys} clef${rw.lvlKeys > 1 ? 's' : ''} (niveau)</span>` : ''}`;
let waveNext = null;   // combat suivant d'une vague de donjon
function runBattle({ me, foe, theme, title, result = null, seed = 0, sim = {}, manual = false, victory = null, finish, track = true, live = null, onEvent = null, noBar = false, skip = false }) {
  stopPreviews.forEach(f => f());
  stopPreviews = [];
  let out = null;
  battleFight = null;
  if (live) { battleFight = live; live.setManual(manualPref()); }   // combat déjà préparé (la Horde)
  else if (manual) battleFight = E.createFight(me, foe, seed, { ...sim, manual: manualPref() });
  else {
    if (!result) result = E.simulate(me, foe, seed, sim);
    out = finish(result) || {};
    if (track) trackBattle(result);
  }
  const fight = battleFight;
  const spells = noBar ? [] : (me.spells || []).filter(id => SPELLS[id]);
  const ov = document.createElement('div');
  ov.className = 'battle';
  ov.innerHTML = `
    <div class="battle-vs">${title}</div>
    <div class="battle-wrap"><canvas id="arena"></canvas></div>
    <div class="battle-ctrl">
      ${spells.length ? `<div class="spellbar" id="spellbar">
        ${spells.map((id, i) => `<button class="sb ready" data-act="cast" data-id="${id}" data-i="${i}" aria-label="${esc(SPELLS[id].name)}"><canvas class="px" data-spell="${id}"></canvas><span class="cd"></span></button>`).join('')}
        ${fight ? `<button class="sb-mode ${fight.manual ? 'man' : ''}" data-act="toggleManual" id="mode-btn">${fight.manual ? 'MANUEL' : 'AUTO'}</button>`
          : `<span class="sb-mode lock">AUTO ${ico('lock')}</span>`}
      </div>` : ''}
      <div class="ctrl-row">
        <button class="btn small" data-act="speed" id="speed-btn">Vitesse x1</button>
        ${skip ? `<button class="btn small" data-act="skip">Passer ${ico('skip')}</button>` : ''}
        <button class="btn small" data-act="toggleSound" id="snd-btn" aria-label="Son">${ico(getPref('sfx') || getPref('music') ? 'speaker' : 'mute')}</button>
      </div>
    </div>
    <div class="battle-after" id="result-slot"></div>`;
  document.body.appendChild(ov);
  hydrate(ov);
  battleCtl = playBattle(ov.querySelector('#arena'), me, foe, fight || result, { theme, victory, spellBar: spells.length > 0, onBegin: (e) => { updateSpellBar(e); if (onEvent) onEvent(e); } });
  battleCtl.speedIdx = 0;
  battleCtl.promise.then(() => {
    if (fight) {
      result = fight.result();
      out = finish(result) || {};
      if (track) trackBattle(result);
      save();
    }
    battleFight = null;
    const won = out.won ?? result.winner === 0;
    ov.querySelector('.battle-ctrl')?.remove();
    const slot = ov.querySelector('#result-slot');
    slot.innerHTML = `
      <div class="result">
        <h2 class="${out.headClass || (won ? 'win' : 'lose')}">${pxCaps(out.headline || (won ? 'VICTOIRE' : 'DÉFAITE…')).replace(/\s*!+\s*$/, '')}</h2>
        ${out.rewardsHtml || ''}
        ${out.next ? `<button class="btn primary" data-act="waveNext">${out.nextLabel}</button>` : '<button class="btn primary" data-act="endFight">Continuer</button>'}
      </div>`;
    waveNext = out.next || null;
    hydrate(slot);
    announce(out.rewards);
  });
}

function startFight(foeId) {
  ensureDay();
  if (acc.fights.done[foeId]) return;
  const opp = opponents().find(o => o.id === foeId);
  if (!opp) return;
  const me = mySnap();
  const seed = hashStr(acc.fights.day + foeId + acc.pseudo);
  runBattle({
    me, foe: opp.snap, seed, theme: 'arena', victory: myVictory(),
    title: `${esc(me.name)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    finish: (result) => {
      const won = result.winner === 0;
      // Le résultat est enregistré tout de suite : impossible de « rejouer » en quittant
      acc.fights.done[foeId] = won ? 'win' : 'loss';
      const rw = E.fightRewards(acc, hero, opp.level, won);
      E.missionEvent(acc, 'arena_fight');
      if (won) E.missionEvent(acc, 'arena_win');
      logFight('arena', foeId, opp.name, me, opp.snap, seed, won);
      save();
      return {
        rewards: rw,
        rewardsHtml: `
          <div class="rw">
            ${won ? `<span class="pill green">Coffre de combat ${acc.winProgress}/${WINS_PER_COMBAT_CHEST}</span>` : ''}
            ${rw.chest ? '<span class="pill red">Coffre de combat gagné !</span>' : ''}
          </div>`,
      };
    },
  });
}

/** Revanche ou vengeance : autant qu'on veut, pour le fun (1 Flouze par adversaire et par jour) */
function startFriendly(foeId, revenge = false) {
  ensureDay();
  if (!revenge && !acc.fights.done[foeId]) return;
  const opp = opponents().find(o => o.id === foeId);
  if (!opp) return;
  const me = mySnap();
  const seed = (Math.random() * 2 ** 31) | 0;
  runBattle({
    me, foe: opp.snap, seed, theme: 'arena', victory: myVictory(),
    title: `${revenge ? 'Vengeance' : 'Revanche'} · ${esc(me.name)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    finish: (result) => {
      const won = result.winner === 0;
      const rw = E.friendlyRewards(acc, won, foeId);
      E.missionEvent(acc, revenge ? 'revenge' : 'rematch');
      if (won && !revenge) E.missionEvent(acc, 'rematch_win');
      logFight(revenge ? 'revenge' : 'rematch', foeId, opp.name, me, opp.snap, seed, won);
      save();
      return {
        rewardsHtml: rw.clat
          ? `<div class="rw"><span class="pill clat"><canvas class="px" data-clat></canvas>+1 Flouze (${acc.clat})</span></div>`
          : `<p style="color:var(--muted);margin:0">${won ? 'Flouze déjà gagné contre lui aujourd’hui.' : 'C’était pour le fun : rien de perdu !'}</p>`,
      };
    },
  });
}

function startDungeon(id) {
  const d = DUNGEONS.find(x => x.id === id);
  if (!d || hero.level < d.lvl) return;
  if (!E.useDungeonRun(hero, d)) { toast('Plus de combat dans ce donjon. Reviens à minuit ou à midi !'); return; }
  E.missionEvent(acc, 'dungeon');
  save();
  const h = hero;
  const me = mySnap();
  const wave = E.dungeonWave(d);           // 2 monstres différents, puis l'un des 2 boss du donjon
  const last = wave.length - 1;
  // petite frise de la vague : monstres battus, monstre en cours, boss
  const waveBar = (i, won) => `<div class="wave-bar">${wave.map((f, j) => `<span class="${j < i || (j === i && won) ? 'ok' : j === i ? 'ko' : ''} ${j === last ? 'boss' : ''}">${j === last ? ico('crown') : j + 1}</span>`).join('<i></i>')}</div>`;
  const title = (i) => `${esc(d.name)} <span style="color:var(--gold)">·</span> ${i === last ? `BOSS : ${esc(wave[i].name)}` : `Monstre ${i + 1}/${last} : ${esc(wave[i].name)}`}`;
  // la vague se joue d'une traite, comme la Horde : le monstre tombe et le suivant arrive aussitôt
  const live = E.createWave(me, wave, (Math.random() * 2 ** 31) | 0);
  let cur = 0;
  runBattle({
    me, foe: wave[0], live, theme: d.theme, manual: true, victory: myVictory(),
    title: title(0),
    onEvent: (e) => {
      if (e.type !== 'nextFoe') return;
      cur++;
      const t = document.querySelector('.battle-vs');
      if (t) t.innerHTML = title(cur);
    },
    finish: (result) => {
      const won = result.winner === 0;
      const i = won ? last : result.kills;   // monstre sur lequel la vague s'est arrêtée
      const rw = E.dungeonRewards(h, d, won, won ? last : i);
      if (won) { E.missionEvent(acc, 'dungeon_win'); E.missionEvent(acc, 'dungeon_kinds', 1, d.id); }
      save();
      return {
        rewards: rw,
        headline: won ? 'DONJON TERMINÉ !' : 'DÉFAITE…',
        rewardsHtml: `${waveBar(i, won)}
          <div class="rw">${xpPills(rw)}</div>
          ${rw.key ? `
            <div class="loot-card" style="--rc:#ffd45a">
              <canvas class="px" data-key></canvas>
              <div class="ln">+1 clef</div>
              <div class="ls">Tu en as ${h.keys} : 1 clef = 1 coffre</div>
            </div>` : rw.keyCapped ? `<p style="color:var(--muted);margin:0">Tu as déjà gagné tes ${DUNGEON_KEYS_MAX} clefs : nouvelles clefs à minuit ou à midi.</p>`
            : `<p style="color:var(--muted);margin:0">${i === last ? 'Le boss était trop fort…' : `${esc(wave[i].name)} t’a arrêté avant le boss…`} Améliore ton héros et reviens !</p>`}
          <p style="color:var(--muted);margin:0">Encore ${E.runsLeft(h, d)} vague${E.runsLeft(h, d) > 1 ? 's' : ''} dans ce donjon d’ici ${fmt(E.msToNextHalf())}.</p>`,
      };
    },
  });
}

/** Passe d'un coup les combats restants d'un donjon facile (la moitié de l'XP) */
function skipDungeonFlow(id, sure = false) {
  const d = DUNGEONS.find(x => x.id === id);
  if (!d || !E.canSkipDungeon(hero, d)) return;
  const n = E.runsLeft(hero, d);
  if (!n) return;
  if (!sure) {
    const keys = Math.min(n, E.keysLeftToEarn(hero));
    openModal(`
      <h3>${ico('skip')} Passer « ${esc(d.name)} » ?</h3>
      <p class="hint" style="margin-top:8px">Tes <b>${n} vague${n > 1 ? 's' : ''}</b> restante${n > 1 ? 's' : ''} compte${n > 1 ? 'nt' : ''} comme gagnée${n > 1 ? 's' : ''}, mais avec <b>la moitié de l’XP</b>.</p>
      <div class="rw" style="justify-content:center;margin:12px 0">
        <span class="pill gold">+${n * Math.round(E.waveXp(d) / 2)} XP</span>
        <span class="pill gold"><canvas class="px" data-key></canvas>+${keys} clef${keys > 1 ? 's' : ''}</span>
      </div>
      <div class="row" style="gap:8px"><button class="btn block" data-act="closeModal">Annuler</button><button class="btn primary block" data-act="skipDungeonGo" data-id="${d.id}">${ico('skip')} Passer</button></div>`, { center: true });
    return;
  }
  closeModal();
  const rw = E.skipDungeon(hero, d);
  if (!rw) return;
  E.missionEvent(acc, 'dungeon', rw.runs);
  E.missionEvent(acc, 'dungeon_win', rw.runs);
  E.missionEvent(acc, 'dungeon_kinds', 1, d.id);
  save(); render();
  SFX.loot(1);
  toast(`${d.name} passé : +${rw.xp} XP${rw.keys ? ` · +${rw.keys} clef${rw.keys > 1 ? 's' : ''}` : ''}`);
  announce(rw);
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
      <button class="btn small" data-act="cheat" data-c="clat">+100 Flouze</button>
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
    if (d.id === 'champ' || d.id === 'combat') (NET.online ? refreshPlayers() : Promise.resolve()).then(loadChamp).then(() => { if (tab === d.id) softRender(); });
    if (NET.online && ['fights', 'war', 'ranking', 'bets', 'tower', 'horde', 'pvp', 'combat', 'players', 'social'].includes(d.id)) refreshPlayers().then(() => { if (tab === d.id) softRender(); });
    if (d.id === 'journal') loadJournal().then(() => { if (tab === 'journal') { markJournalSeen(); softRender(); } });
    if (d.id === 'bets' || d.id === 'pvp') refreshBets().then(() => { if (tab === d.id) softRender(); });
    if (d.id === 'raid') loadRaid().then(() => { if (tab === 'raid') softRender(); });
    if (d.id === 'throne') refreshPlayers().then(loadThrone).then(() => { if (tab === 'throne') softRender(); });
  },
  authMode: (d) => { authMode = d.mode; renderAuth(); },
  auth: () => doAuth(),
  soundPref: (d) => { setPref(d.k, !getPref(d.k)); openSettings(); },
  toggleSound: () => {
    const on = !(getPref('sfx') || getPref('music'));
    setPref('sfx', on); setPref('music', on);
    if (on) startMusic(); else stopMusic();
    const b = document.getElementById('snd-btn');
    if (b) { b.innerHTML = ico(on ? 'speaker' : 'mute'); hydrate(b); }
  },
  sendChat: () => sendChat(),
  info: (d, el) => {
    const card = el.closest('[data-info]');
    const on = card.classList.toggle('open');
    if (on) infoOpen.add(d.id); else infoOpen.delete(d.id);
    el.textContent = on ? '−' : '+';
  },
  skipDungeon: (d) => skipDungeonFlow(d.id),
  pvpChallenge: (d) => pvpChallenge(d.id),
  pvpAccept: (d) => pvpAccept(+d.id),
  pvpDecline: async (d) => { closeModal(); try { await NET.answerChallenge(+d.id, { status: 'declined' }); } catch (e) { toast(e.message); } await refreshBets(); softRender(); },
  pvpCancel: async (d) => { try { await NET.answerChallenge(+d.id, { status: 'cancelled' }); } catch (e) { toast(e.message); } await refreshBets(); softRender(); },
  pvpWatch: (d) => { const c = pvpRows.find(x => String(x.id) === String(d.id)); closeModal(); if (c) watchPvp(c); },
  pvpVs: (d) => { const c = pvpRows.find(x => String(x.id) === String(d.id)); if (c) openPvpVs(c, c.status === 'pending' && c.to_id === myId()); },
  claimGift: (d) => {
    const n = myNotes().find(x => x.gift && x.gift.id === d.id);
    const got = n ? E.claimGift(acc, n.gift, hero) : 0;
    if (!got) return;
    SFX.loot(4); save(); render(); openPatchNotes();
    toast(`+${giftLabel(n.gift)}, cadeau !`);
  },
  playerCard: (d) => openPlayerCard(d.id, d.h !== undefined ? +d.h : null),
  podiumMsg: () => openPodiumMsg(),
  throneFight: (d) => startThrone(d.id),
  claimThrone: () => claimThroneReward(),
  retryChamp: () => { champError = ''; loadChamp().then(() => { if (tab === 'champ') softRender(); }); },
  champMatch: (d) => openChampMatch(d.k),
  champGame: (d) => watchChampGame(d.k, +d.g),
  claimChamp: (d) => {
    const info = d.w === champInfo.week ? champInfo : champInfo.prev;
    if (!info) return;
    const place = E.champPlace(E.champTree(info.slots, champRes(info.matches)), myId());
    acc.champ ||= { claimed: {} };
    if (!place || acc.champ.claimed[info.week]) return;
    acc.champ.claimed[info.week] = place;
    E.champReward(acc, hero, place);
    SFX.loot(place === 'win' ? 4 : 2); save(); render();
    toast({ win: 'Coffre de guerre récupéré !', second: 'Coffre de combat récupéré !', other: `Coffre ajouté pour ton ${CLASSES[hero.classId].name} !` }[place]);
  },
  claimAuto: () => {
    const r = E.autoClaim(acc, hero);
    if (!r.chests && !r.xp) return;
    SFX.loot(2); save(); render();
    toast(`${[r.chests ? `+${r.chests} coffre${r.chests > 1 ? 's' : ''}` : '', r.xp ? `+${r.xp} XP` : ''].filter(Boolean).join(' et ')} pour ${CLASSES[hero.classId].name}${r.chests ? ' : va les ouvrir dans Coffres !' : ''}`);
    announce(r.lv);
  },
  retryThrone: () => { throneError = ''; loadThrone().then(() => { if (tab === 'throne') softRender(); }); },
  podiumMsgSave: (d) => {
    const v = d.clear ? '' : (document.getElementById('pod-msg')?.value || '').trim().slice(0, 60);
    acc.podiumMsg = v ? { text: v, at: Date.now() } : null;
    save(); closeModal(); render();
    toast(v ? 'Message enregistré !' : 'Message effacé.');
  },
  startHorde: () => startHorde(),
  skipDungeonGo: (d) => skipDungeonFlow(d.id, true),
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
    E.missionEvent(acc, 'stat');
    save(); render();
  },
  resetStats: () => {
    if (acc.clat < STAT_RESET_COST) { toast(`Il faut ${STAT_RESET_COST} Flouze pour replacer tes points.`); return; }
    if (!confirm(`Replacer tous tes points pour ${STAT_RESET_COST} Flouze ?`)) return;
    E.resetStats(acc, hero); save(); render(); toast(`Points remis à zéro (−${STAT_RESET_COST} Flouze). Replace-les comme tu veux !`);
  },
  spellUp: (d) => { const i = hero.spells.indexOf(d.id); if (i > 0) { [hero.spells[i - 1], hero.spells[i]] = [hero.spells[i], hero.spells[i - 1]]; save(); render(); } },
  spellDown: (d) => { const i = hero.spells.indexOf(d.id); if (i >= 0 && i < hero.spells.length - 1) { [hero.spells[i + 1], hero.spells[i]] = [hero.spells[i], hero.spells[i + 1]]; save(); render(); } },
  spellOff: (d) => { hero.spells = hero.spells.filter(id => id !== d.id); save(); render(); },
  spellInfo: (d) => openSpell(d.id),
  trainCast: (d) => {
    const b = document.querySelector(`.tsp[data-i="${d.i}"]`);
    if (!trainFight || !b) return;
    if (b.classList.contains('wait')) { toast(`${SPELLS[d.id].name} se recharge encore.`); return; }
    trainCast = d.id;
    trainFight.setManual(true);
    trainFight.queue(d.id);
    document.querySelectorAll('.tsp.queued').forEach(x => x.classList.remove('queued'));
    b.classList.add('queued');
    SFX.click();
  },
  spellEquip: (d) => {
    if (hero.spells.length < MAX_ACTIVE_SPELLS && !hero.spells.includes(d.id) && SPELLS[d.id].lvl <= hero.level) { hero.spells.push(d.id); save(); }
    closeModal(); render(); SFX.click();
  },
  spellReplace: (d) => {
    const i = +d.i;
    if (!hero.spells.includes(d.id) && hero.spells[i] && SPELLS[d.id].lvl <= hero.level) { hero.spells[i] = d.id; save(); }
    closeModal(); render(); SFX.click();
  },
  spellRemove: (d) => { hero.spells = hero.spells.filter(x => x !== d.id); save(); closeModal(); render(); },
  spellMove: (d) => {
    const i = hero.spells.indexOf(d.id), j = i + +d.d;
    if (i >= 0 && j >= 0 && j < hero.spells.length) { [hero.spells[i], hero.spells[j]] = [hero.spells[j], hero.spells[i]]; save(); render(); openSpell(d.id); }
  },
  spellOn: (d) => { if (hero.spells.length < MAX_ACTIVE_SPELLS && !hero.spells.includes(d.id)) { hero.spells.push(d.id); save(); render(); } },
  openChest: (d) => openChestFlow(d.kind),
  openAll: () => openChestFlow('normal', true),
  buyDaily: (d) => {
    const it = E.buyDaily(acc, hero, +d.i);
    if (!it) { toast(`Il faut ${E.dailyShop(acc)[+d.i].price} Flouze.`); return; }
    SFX.loot(it.rarity); save(); render();
    toast(`${ITEMS[it.itemId].name} ajouté au sac de ton ${CLASSES[hero.classId].name} !`);
  },
  buyKey: () => {
    if (!E.buyKey(acc, hero)) { toast(`Il faut ${KEY_PRICE} Flouze.`); return; }
    SFX.loot(2); save(); render();
    toast(`Clef achetée pour ton ${CLASSES[hero.classId].name} !`);
  },
  bagMode: (d) => { bagMode = d.mode; render(); },
  bagSet: (d) => { bagSet = d.id; render(); },
  sell: (d) => {
    const r = E.sellItems(acc, hero, d.id, +d.r, +d.n || 1);
    if (!r) return;
    E.missionEvent(acc, 'sell', r.n);
    SFX.click(); save(); render();
    if (E.stackOf(hero, d.id, +d.r).length) openItem(d.id, +d.r); else closeModal();
    toast(`Vendu : +${r.gain} Flouze`);
  },
  sellCommons: () => {
    const eqUids = new Set(Object.values(hero.equipped));
    const list = hero.inventory.filter(i => i.rarity === 0 && !eqUids.has(i.uid));
    if (!list.length) return;
    if (!confirm(`Vendre ${list.length} objet(s) Commun(s) pour ${list.length * SELL_PRICE[0]} Flouze ?`)) return;
    const ids = [...new Set(list.map(i => i.itemId))];
    let gain = 0;
    for (const id of ids) { const r = E.sellItems(acc, hero, id, 0, 999); if (r) gain += r.gain; }
    E.missionEvent(acc, 'sell', list.length);
    SFX.loot(1); save(); render();
    toast(`Vendu : +${gain} Flouze`);
  },
  cast: (d) => {
    const f = battleFight;
    if (!f) { toast('Contre un vrai joueur, le mode auto est obligatoire.'); return; }
    if (!f.manual) { toast('Passe en mode MANUEL pour lancer tes sorts toi-même.'); return; }
    const b = document.querySelector(`.sb[data-i="${d.i}"]`);
    if (!b || !b.classList.contains('ready')) return;
    f.queue(d.id);
    document.querySelectorAll('.sb.queued').forEach(x => x.classList.remove('queued'));
    b.classList.add('queued');
  },
  toggleManual: () => {
    const f = battleFight;
    if (!f) return;
    f.setManual(!f.manual);
    setManualPref(f.manual);
    const btn = document.getElementById('mode-btn');
    if (btn) { btn.textContent = f.manual ? 'MANUEL' : 'AUTO'; btn.classList.toggle('man', f.manual); }
    document.querySelectorAll('.sb.queued').forEach(x => x.classList.remove('queued'));
    toast(f.manual ? 'Mode manuel : touche un sort prêt pour le lancer.' : 'Mode auto : ton héros lance ses sorts tout seul.');
  },
  item: (d) => openItem(d.id, +d.r),
  equip: (d) => {
    const stack = E.stackOf(hero, d.id, +d.r);
    if (!stack.length) return;
    hero.equipped[ITEMS[d.id].slot] = stack[0].uid;
    E.missionEvent(acc, 'equip');
    save(); closeModal(); render(); toast(`${ITEMS[d.id].name} équipé !`);
  },
  slotPick: (d) => openSlotPicker(d.slot),
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
  fuseAll: (d) => {
    // d'abord, on montre ce que ça va donner (sur une copie du sac), puis on confirme
    const preview = E.fuseAll(JSON.parse(JSON.stringify(hero)));
    if (!preview.fusions) return;
    if (!d.sure) {
      openModal(`
        <h3>${ico('sparkle')} Tout fusionner ?</h3>
        <p class="hint" style="margin-top:8px"><b>${preview.fusions} fusion${preview.fusions > 1 ? 's' : ''}</b> en chaîne : les objets obtenus sont refusionnés tant que c’est possible. Ton équipement reste équipé (avec sa nouvelle rareté).</p>
        <div class="fuse-list">${fuseSummary(preview.made)}</div>
        <div class="close-row"><button class="btn" data-act="closeModal">Annuler</button><button class="btn primary" data-act="fuseAll" data-sure="1">Fusionner</button></div>`);
      return;
    }
    const res = E.fuseAll(hero);
    for (let i = 0; i < res.fusions; i++) E.missionEvent(acc, 'fuse');
    SFX.fuse();
    save();
    closeModal();
    render();
    const best = Math.max(...res.made.map(it => it.rarity));
    openModal(`
      <h3>${ico('sparkle')} ${res.fusions} fusion${res.fusions > 1 ? 's' : ''} réussie${res.fusions > 1 ? 's' : ''} !</h3>
      <div class="fuse-list">${fuseSummary(res.made)}</div>
      <div class="close-row"><button class="btn primary" data-act="closeModal">Super</button></div>`);
    SFX.loot(best);
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
    toast(`+${got} Flouze !`);
  },
  attackRaid: () => attackRaid(),
  retryRaid: () => { raidError = ''; render(); },
  claimRaid: (d) => claimRaid(d.week),
  attackTower: () => attackTower(),
  shopKind: (d) => { shopKind = d.k; render(); },
  buyCos: (d) => {
    const c = COSMETIC[d.id];
    if (!E.buyCosmetic(acc, d.id)) { toast('Pas assez de Flouze.'); return; }
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
    if (amount < 1) { toast('Mise au moins 1 Flouze.'); return; }
    if (amount > acc.clat) { toast('Pas assez de Flouze.'); return; }
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
    if (g.total) { SFX.loot(3); toast(`+${g.total} Flouze gagné aux paris !`); } else toast('Paris perdus… la prochaine sera la bonne !');
  },
  replayDuel: (d) => {
    const c = bets.challenges.find(x => String(x.id) === d.id);
    if (!c) return;
    const result = duelResult(c);
    const winName = result.winner === 0 ? c.from_name : c.to_name;
    runBattle({ me: c.from_snap, foe: c.to_snap, result, theme: 'arena', track: false,
      title: `Duel · ${esc(c.from_name)} <span style="color:var(--gold)">VS</span> ${esc(c.to_name)}`,
      finish: () => ({ headline: `${winName.toUpperCase()} GAGNE !`, headClass: 'win' }) });
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
  skip: () => { if (battleFight) battleFight.setManual(false); if (battleCtl) battleCtl.skip(); },
  waveNext: () => {
    const go = waveNext;
    waveNext = null;
    if (battleCtl) battleCtl.destroy();
    battleCtl = null;
    document.querySelector('.battle')?.remove();
    if (go) go(); else render();
  },
  endFight: () => {
    if (battleCtl) battleCtl.destroy();
    battleCtl = null;
    document.querySelector('.battle')?.remove();
    render();
  },
  settings: openSettings,
  patchNotes: () => openPatchNotes(),
  rename: () => {
    const v = (document.getElementById('rename').value || '').trim();
    if (v) { acc.pseudo = v; acc.heroes.forEach(h => { h.name = v; }); save(); closeModal(); render(); }
  },
  cheat: (d) => {
    if (NET.online) return;
    if (d.c === 'chests') hero.chest.stored = CHEST_MAX;
    if (d.c === 'combat') acc.combatChests += 2;
    if (d.c === 'fights') { acc.fights.done = {}; acc.fights.clat = {}; hero.runs = { half: '', used: {} }; acc.war.done = {}; acc.raid.used = 0; }
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

// Minuteurs (coffres, fin de journée, combat auto)
setInterval(() => {
  if (!acc) return;
  if (!hero) return;
  autoTick();
  if (E.applySpecialReset(acc)) { save(); softRender(); toast('Remise à zéro spéciale de 20 h : tout est rechargé !'); return; }
  const before = hero.chest.stored;
  E.refreshChests(hero);
  const busy = modalRoot.innerHTML || document.querySelector('.battle') || tab === 'chat';
  if (hero.chest.stored !== before) { save(); if (!busy) render(); return; }
  if ((acc.fights.day !== E.dayKey() || acc.missions.day !== E.halfKey() || hero.runs.half !== E.halfKey()) && !busy) { render(); return; }
  const t = document.querySelector('[data-timer="chest"]');
  if (t && hero.chest.stored < CHEST_MAX) t.innerHTML = `Prochain coffre dans <b>${fmt(E.nextChestIn(hero))}</b>`;
  const d = document.querySelector('[data-timer="day"]');
  if (d) d.textContent = `Nouveaux combats dans ${fmt(msToMidnight())}`;
  const d3 = document.querySelector('[data-timer="day3"]');
  if (d3) d3.textContent = fmt(msToMidnight());
  document.querySelectorAll('[data-timer="half"]').forEach(el => { el.textContent = el.textContent.replace(/\d\d:\d\d:\d\d/, fmt(E.msToNextHalf())); });
  document.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = fmt(+el.dataset.countdown - Date.now()); });
  document.querySelectorAll('[data-endlong]').forEach(el => { el.textContent = fmtLong(Math.max(0, +el.dataset.endlong - Date.now())); });
  const wk = document.querySelector('[data-timer="week"]');
  if (wk) wk.textContent = `Fin dans ${fmtLong(E.msToWeekEnd())}`;
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
  // dessins vectoriels des héros (refonte) : chargés une fois avant le premier affichage
  await Promise.all([loadHeroArt().catch(() => {}), loadMonsterArt().catch(() => {}), loadDecorArt().catch(() => {}), loadIconArt().catch(() => {}), loadItemArt().catch(() => {})]);
  if (NET.online) {
    app.innerHTML = '<div class="create"><img class="logo-img" src="icons/icon.svg?v=2" alt=""><h1 class="logo">FUZE<span>ARENA</span></h1><p class="lead">Connexion…</p></div>';
    try {
      const row = await NET.restore();
      if (row && row.data) {
        acc = E.migrate(row.data);
        acc.pseudo = row.pseudo;
        await refreshPlayers();
        await Promise.all([initChat(), initLive()]);
        NET.joinPresence(acc.pseudo, onPresence).catch(() => {});
      }
    } catch (e) {
      app.innerHTML = `<div class="create"><img class="logo-img" src="icons/icon.svg?v=2" alt=""><h1 class="logo">FUZE<span>ARENA</span></h1><p class="auth-msg">${esc(e.message)}</p><button class="btn primary block" onclick="location.reload()">Réessayer</button></div>`;
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
