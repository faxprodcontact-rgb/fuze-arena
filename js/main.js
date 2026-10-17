// =====================================================================
//  INTERFACE — écrans Héros / Coffres / Sac / Arène / Donjons / Guerre
// =====================================================================
import {
  CLASSES, STATS, STAT_KEYS, RARITIES, ITEMS, SLOTS, SLOT_ORDER, SPELLS, FRIENDS,
  CHEST_MAX, CHEST_ODDS, MAX_ACTIVE_SPELLS, WINS_PER_COMBAT_CHEST, MAX_LEVEL,
  DUNGEONS, DUNGEON_MAX, SETS, WAR,
} from './data.js?v=20261017174919';
import * as E from './engine.js?v=20261017174919';
import { playBattle, idlePreview } from './battle.js?v=20261017174919';
import { itemIcon, chestCanvas, paint, heroPortrait, monsterCanvas, clatCanvas } from './sprites.js?v=20261017174919';
import { hashStr, makeRng } from './rng.js?v=20261017174919';
import * as NET from './net.js?v=20261017174919';
import { SFX, unlock as unlockSound, getPref, setPref, startMusic, stopMusic } from './sfx.js?v=20261017174919';

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
      const h = E.activeHero(p.data);
      const snap = E.snapshot({ ...h, name: p.pseudo });
      return { id: p.id, name: p.pseudo, classId: h.classId, level: h.level, snap, section: p.data.war && p.data.war.section, done: acc.fights.done[p.id] };
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
  root.querySelectorAll('canvas[data-portrait]').forEach(c => paint(c, heroPortrait(c.dataset.portrait, CLASSES[c.dataset.portrait].weapon), { scale: 4 }));
  root.querySelectorAll('canvas[data-monster]').forEach(c => paint(c, monsterCanvas(c.dataset.monster), { scale: 3 }));
  root.querySelectorAll('canvas[data-clat]').forEach(c => paint(c, clatCanvas(), { scale: 3 }));
  root.querySelectorAll('canvas[data-chest]').forEach(c => paint(c, chestCanvas(c.dataset.chest, c.dataset.open === '1'), { scale: 6 }));
  root.querySelectorAll('canvas[data-hero]').forEach(c => stopPreviews.push(idlePreview(c, c.dataset.hero, c.dataset.pet || null)));
}

function render() {
  stopPreviews.forEach(f => f());
  stopPreviews = [];
  if (!acc) { if (NET.online) renderAuth(); else renderCreate(); return; }
  hero = E.activeHero(acc);
  ensureDay();
  E.ensureWar(acc, others());
  E.refreshChests(acc);
  E.refreshDungeon(acc);
  const need = E.xpForLevel(hero.level);
  const xpPct = hero.level >= MAX_LEVEL ? 100 : Math.round((hero.xp / need) * 100);
  const fightsLeft = opponents().filter(o => !o.done).length;
  const chests = acc.chest.stored + acc.combatChests + acc.warChests;
  const warLeft = acc.war.section ? Math.max(0, WAR.attacksPerDay - Object.keys(acc.war.done).length) + (acc.war.pending ? 1 : 0) : 1;
  const pts = E.freePoints(hero);
  const fusable = countFusable();

  app.innerHTML = `
    <header class="topbar">
      <div class="tb-portrait"><canvas class="px" data-portrait="${hero.classId}"></canvas></div>
      <div class="tb-info">
        <div class="tb-name">${esc(acc.pseudo)}<span>${CLASSES[hero.classId].name} Nv.${hero.level}</span></div>
        <div class="xpbar"><div style="width:${xpPct}%"></div></div>
      </div>
      <button class="tb-gear ${tab === 'chat' ? 'on' : ''}" data-act="tab" data-id="chat" aria-label="Tchat">💬<span class="badge" id="chat-badge" ${chatUnread ? '' : 'hidden'}>${chatUnread}</span></button>
      <button class="tb-gear ${tab === 'ranking' ? 'on' : ''}" data-act="tab" data-id="ranking" aria-label="Classement">🏆</button>
      <button class="tb-gear" data-act="settings" aria-label="Réglages">⚙︎</button>
    </header>
    <main id="view">${VIEWS[tab]()}</main>
    <nav class="tabs">
      ${tabBtn('hero', 'Héros', pts)}
      ${tabBtn('chests', 'Coffres', chests)}
      ${tabBtn('bag', 'Sac', fusable)}
      ${tabBtn('fights', 'Arène', fightsLeft)}
      ${tabBtn('dungeons', 'Donjons', acc.dungeon.stored)}
      ${tabBtn('war', 'Guerre', warLeft)}
    </nav>`;
  hydrate(app);
  paintTabIcons();
  if (tab === 'chat') { markChatSeen(); scrollChat(); }
}

function tabBtn(id, label, badge) {
  return `<button class="tab ${tab === id ? 'on' : ''}" data-act="tab" data-id="${id}">
    <canvas class="px" data-tabicon="${id}"></canvas>${label}
    ${badge > 0 ? `<span class="badge">${badge}</span>` : ''}</button>`;
}
function paintTabIcons() {
  const src = {
    hero: () => heroPortrait(hero.classId, CLASSES[hero.classId].weapon),
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
    <section class="card chars">
      <div class="row"><h2 style="margin:0">Mes personnages</h2><span class="spacer"></span><span class="pill">${acc.heroes.length} / ${E.MAX_HEROES}</span></div>
      <div class="char-row">
        ${acc.heroes.map((h, i) => `
          <button class="char ${i === acc.active ? 'on' : ''}" data-act="switchHero" data-i="${i}">
            <canvas class="px" data-portrait="${h.classId}"></canvas>
            <b>${CLASSES[h.classId].name}</b><small>Nv.${h.level}</small>
          </button>`).join('')}
        ${acc.heroes.length < E.MAX_HEROES ? '<button class="char add" data-act="newHeroModal"><span>+</span><small>Nouveau</small></button>' : ''}
      </div>
      <p class="hint" style="margin:10px 0 0">Chaque personnage a son niveau et ses objets. C’est ton personnage <b>actif</b> qui combat dans l’Arène et la Guerre.</p>
    </section>

    <section class="card hero-card">
      <div class="hero-stage"><canvas class="px" data-hero="${hero.classId}" data-pet="${eq.pet ? eq.pet.itemId : ''}"></canvas></div>
      <div class="hero-meta">
        <div class="cls">${CLASSES[hero.classId].name}</div>
        <div class="lvl">Nv.${hero.level}</div>
        <div class="xp">${hero.level >= MAX_LEVEL ? 'Niveau max !' : `XP ${hero.xp} / ${need}`}</div>
        <div class="big">❤ ${hp} PV</div>
        <div class="row" style="flex-wrap:wrap;gap:6px">
          <span class="pill gold">Puissance ${E.powerScore(snap)}</span>
          <span class="pill">${hero.stats.wins} V · ${hero.stats.losses} D</span>
          <span class="pill clat"><canvas class="px" data-clat></canvas>${acc.clat}</span>
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
  const n = acc.chest.stored;
  const wait = E.nextChestIn(acc);
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
      <p class="hint">Un combat classé par adversaire et par jour. ${WINS_PER_COMBAT_CHEST} victoires = 1 coffre de combat. Ensuite, tu peux faire des <b>revanches</b> pour le fun : chaque revanche gagnée rapporte 1 Pierre Clat.</p>
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
          <div class="av"><canvas class="px" data-portrait="${o.classId}"></canvas></div>
          <div class="o-body">
            <div class="o-name">${esc(o.name)}</div>
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
  const n = acc.dungeon.stored;
  return `
    <section class="card">
      <h2>Donjons</h2>
      <p class="hint">Bats le boss pour gagner de l’XP et 1 objet. Plus le donjon est haut, plus l’XP et les objets sont bons. Même en cas de défaite, tu gagnes un peu d’XP.</p>
      <div class="row" style="flex-wrap:wrap;gap:6px">
        <span class="pill gold">Entrées : ${n} / ${DUNGEON_MAX}</span>
        <span class="pill" data-timer="dungeon">${n >= DUNGEON_MAX ? 'Entrées au maximum' : `Prochaine entrée dans ${fmt(E.nextDungeonIn(acc))}`}</span>
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
  const me = { name: acc.pseudo, classId: hero.classId, level: hero.level, wins: wins(acc), me: true };
  let rest;
  if (NET.online) {
    rest = players.map(p => { const h = E.activeHero(p.data); return { name: p.pseudo, classId: h.classId, level: h.level, wins: wins(p.data) }; });
  } else {
    const totalMine = hero.stats.wins + hero.stats.losses;
    rest = opponents().map(o => {
      const r = makeRng(hashStr('rank' + o.id));
      return { name: o.name, classId: o.classId, level: o.level, wins: Math.round(totalMine * (0.3 + r() * 0.6)) };
    });
  }
  const key = rankMode === 'level' ? 'level' : 'wins';
  return [me, ...rest].sort((a, b) => b[key] - a[key] || (b.me ? 1 : 0) - (a.me ? 1 : 0));
}

function viewRanking() {
  const list = rankingEntries();
  const key = rankMode === 'level' ? 'level' : 'wins';
  const medal = ['🥇', '🥈', '🥉'];
  return `
    <section class="card">
      <h2>Classement</h2>
      <div class="seg">
        <button class="${rankMode === 'level' ? 'on' : ''}" data-act="rank" data-mode="level">Par niveau</button>
        <button class="${rankMode === 'wins' ? 'on' : ''}" data-act="rank" data-mode="wins">Par victoires</button>
      </div>
      <p class="hint" style="margin-top:12px">${NET.online ? 'Niveau du personnage actif · victoires de tous les personnages.' : 'Hors ligne : tes amis sont des bots.'}</p>
      ${list.map((e, i) => `
        <div class="opp rank ${e.me ? 'me' : ''}">
          <div class="pos">${medal[i] || i + 1}</div>
          <div class="av"><canvas class="px" data-portrait="${e.classId}"></canvas></div>
          <div class="o-body">
            <div class="o-name">${esc(e.name)}${e.me ? ' <span class="pill gold">toi</span>' : ''}</div>
            <div class="o-sub">${CLASSES[e.classId].name}</div>
          </div>
          <div class="score">${key === 'level' ? `Nv.${e.level}` : `${e.wins} V`}</div>
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
          <div class="o-body"><div class="o-name">${esc(m.name)}</div><div class="o-sub">${CLASSES[m.classId].name}</div></div>
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
  const me = E.snapshot({ ...hero, name: acc.pseudo });
  const result = E.simulate(me, opp.snap, hashStr(war.day + foeId + 'guerre' + acc.pseudo));
  const won = result.winner === 0;
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
  return `<div class="msg ${mine ? 'me' : ''}">${mine ? '' : `<b>${esc(m.pseudo)}</b>`}<span class="txt">${esc(m.text)}</span><small>${timeOf(m.created_at)}</small></div>`;
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
  try { onChatMessage(await NET.sendMessage(acc.pseudo, text)); }
  catch (e) { toast(e.message); input.value = text; chatDraft = text; }
}

const VIEWS = { hero: viewHero, chests: viewChests, bag: viewBag, fights: viewFights, dungeons: viewDungeons, ranking: viewRanking, war: viewWar, chat: viewChat };

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
function runBattle({ me, foe, result, theme, title, rewardsHtml, rewards }) {
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
  battleCtl = playBattle(ov.querySelector('#arena'), me, foe, result, { theme });
  battleCtl.speedIdx = 0;
  battleCtl.promise.then(() => {
    ov.querySelector('.battle-ctrl').remove();
    const slot = ov.querySelector('#result-slot');
    slot.innerHTML = `
      <div class="result">
        <h2 class="${won ? 'win' : 'lose'}">${won ? 'VICTOIRE !' : 'DÉFAITE…'}</h2>
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
  const me = E.snapshot({ ...hero, name: acc.pseudo });
  const seed = hashStr(acc.fights.day + foeId + acc.pseudo);
  const result = E.simulate(me, opp.snap, seed);
  const won = result.winner === 0;
  // Le résultat est enregistré tout de suite : impossible de « rejouer » en quittant
  acc.fights.done[foeId] = won ? 'win' : 'loss';
  const rw = E.fightRewards(acc, hero, opp.level, won);
  save();
  runBattle({
    me, foe: opp.snap, result, theme: 'arena', rewards: rw,
    title: `${esc(me.name)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    rewardsHtml: `
      <div class="rw">
        <span class="pill gold">+${rw.xp} XP</span>
        ${won ? `<span class="pill green">Coffre de combat ${acc.winProgress}/${WINS_PER_COMBAT_CHEST}</span>` : ''}
        ${rw.chest ? '<span class="pill red">Coffre de combat gagné !</span>' : ''}
      </div>`,
  });
}

/** Revanche amicale : autant qu'on veut, juste pour le fun (+1 Pierre Clat si victoire) */
function startFriendly(foeId) {
  ensureDay();
  if (!acc.fights.done[foeId]) return;
  const opp = opponents().find(o => o.id === foeId);
  if (!opp) return;
  const me = E.snapshot({ ...hero, name: acc.pseudo });
  const result = E.simulate(me, opp.snap, (Math.random() * 2 ** 31) | 0);
  const won = result.winner === 0;
  E.friendlyRewards(acc, won);
  save();
  runBattle({
    me, foe: opp.snap, result, theme: 'arena', rewards: null,
    title: `Revanche · ${esc(me.name)} <span style="color:var(--gold)">VS</span> ${esc(opp.snap.name)}`,
    rewardsHtml: won
      ? `<div class="rw"><span class="pill clat"><canvas class="px" data-clat></canvas>+1 Pierre Clat (${acc.clat})</span></div>`
      : '<p style="color:var(--muted);margin:0">C’était pour le fun : rien de perdu !</p>',
  });
}

function startDungeon(id) {
  const d = DUNGEONS.find(x => x.id === id);
  if (!d || hero.level < d.lvl) return;
  if (!E.useDungeonCharge(acc)) { toast('Plus d’entrée de donjon. Reviens plus tard !'); return; }
  const me = E.snapshot({ ...hero, name: acc.pseudo });
  const boss = E.buildMonster(d);
  const result = E.simulate(me, boss, (Math.random() * 2 ** 31) | 0);
  const won = result.winner === 0;
  const rw = E.dungeonRewards(hero, d, won);
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
    if (NET.online && ['fights', 'war', 'ranking'].includes(d.id)) refreshPlayers().then(() => { if (tab === d.id && !modalRoot.innerHTML && !document.querySelector('.battle')) render(); });
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
    acc = null; hero = null; players = []; chatMsgs = []; chatUnread = 0; authMode = 'login';
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
    if (d.c === 'chests') acc.chest.stored = CHEST_MAX;
    if (d.c === 'combat') acc.combatChests += 2;
    if (d.c === 'fights') { acc.fights.done = {}; acc.dungeon.stored = DUNGEON_MAX; acc.war.done = {}; }
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
  const before = acc.chest.stored + acc.dungeon.stored * 10;
  E.refreshChests(acc);
  E.refreshDungeon(acc);
  const busy = modalRoot.innerHTML || document.querySelector('.battle') || tab === 'chat';
  if (acc.chest.stored + acc.dungeon.stored * 10 !== before) { save(); if (!busy) render(); return; }
  if (acc.fights.day !== E.dayKey() && !busy) { render(); return; }
  const t = document.querySelector('[data-timer="chest"]');
  if (t && acc.chest.stored < CHEST_MAX) t.innerHTML = `Prochain coffre dans <b>${fmt(E.nextChestIn(acc))}</b>`;
  const d = document.querySelector('[data-timer="day"]');
  if (d) d.textContent = `Nouveaux combats dans ${fmt(msToMidnight())}`;
  const wk = document.querySelector('[data-timer="week"]');
  if (wk) wk.textContent = `Fin dans ${fmtLong(E.msToWeekEnd())}`;
  const dj = document.querySelector('[data-timer="dungeon"]');
  if (dj && acc.dungeon.stored < DUNGEON_MAX) dj.textContent = `Prochaine entrée dans ${fmt(E.nextDungeonIn(acc))}`;
}, 1000);

// En ligne : on recharge les autres joueurs de temps en temps, et on sauvegarde avant de quitter
if (NET.online) {
  NET.setSaveErrorHandler((msg) => toast(`Sauvegarde en ligne impossible (${msg}). Nouvel essai…`));
  setInterval(() => { if (acc && !document.querySelector('.battle')) refreshPlayers(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') NET.flush(); });
}

async function boot() {
  if (NET.online) {
    app.innerHTML = '<div class="create"><h1 class="logo">FUZE<span>ARENA</span></h1><p class="lead">Connexion…</p></div>';
    try {
      const row = await NET.restore();
      if (row && row.data) {
        acc = E.migrate(row.data);
        acc.pseudo = row.pseudo;
        await refreshPlayers();
        await initChat();
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
}
boot();
