// =====================================================================
//  ÉCRAN DE COMBAT — rejoue le combat calculé avec des animations 2D
// =====================================================================
import { CLASSES } from './data.js?v=20261018141408';
import { heroCanvas, weaponCanvas, weaponPivot, petCanvas, monsterCanvas, whiteOf, lw, lh, HAND, handOf, IDLE_ANGLE, HERO_W, HERO_H } from './sprites.js?v=20261018141408';
import { SFX, setQuiet, startMusic, stopMusic } from './sfx.js?v=20261018141408';


const S = 3;                      // taille d'un pixel de sprite
const FONT = '"Press Start 2P", monospace';
const HERO_K = 1.15;              // les héros sont affichés 15 % plus grands en combat

const EASE = {
  linear: t => t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inQuad: t => t * t,
  inOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  outBack: t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

// ------------------------------ Décor ------------------------------
// Un thème = palette + éléments de décor. 'arena' est l'arène entre joueurs.
const THEMES = {
  arena: { sky: ['#241f4f', '#2f2a66', '#45367a', '#6a4285', '#94508a', '#c4628a', '#e98078', '#f5a46b'], sun: ['#ffd27a', '#ffe9b0'], cloud: '#f7b8a0',
    r1: '#5a3f78', r2: '#43325f', walls: ['#5d5468', '#6f667c', '#4a4254'], banners: true, grass: ['#4f8f43', '#6fb35a'], ground: ['#c49a6c', '#b88d60', '#9c7650', '#a07a52'] },
  cave: { sky: ['#120e16', '#17121c', '#1d1622', '#231a28', '#2a1f2e', '#2f2433', '#352838', '#3a2d3d'], r1: '#2b2230', r2: '#221a26',
    stalactites: '#3a2f40', crystals: '#4cd964', grass: ['#3d3a45', '#55505e'], ground: ['#4a4452', '#433d4a', '#36313d', '#3d3845'] },
  forest: { sky: ['#1d3b4f', '#24495c', '#2c5a68', '#376b72', '#467c78', '#5a8c7a', '#719b7b', '#8aa97c'], sun: ['#fff3b0', '#ffffff'],
    r1: '#2d5a3a', r2: '#1f4630', trees: ['#163a24', '#1f4a2e'], grass: ['#3f7d3a', '#5aa04a'], ground: ['#6b5236', '#5f4830', '#4f3c28', '#5a4430'] },
  crypt: { sky: ['#14121e', '#191626', '#1f1b2e', '#262137', '#2c2640', '#322b48', '#383050', '#3e3558'], sun: ['#d8d4ff', '#ffffff'],
    r1: '#2a2540', r2: '#201c32', tombs: '#5d5870', grass: ['#3d4a45', '#52605a'], ground: ['#4f4a5c', '#47425a', '#3a3548', '#423d52'] },
  swamp: { sky: ['#1e2a22', '#24332a', '#2b3d31', '#344839', '#3d5342', '#4a5f4a', '#566b52', '#63775a'], sun: ['#d6e8a0', '#eef7c8'],
    r1: '#2f4232', r2: '#243526', trees: ['#1a2a1c', '#223424'], grass: ['#4a6b3a', '#5f8048'], ground: ['#4a5a3a', '#435233', '#36432a', '#3d4a30'] },
  mine: { sky: ['#140f0c', '#1a1310', '#211813', '#281d16', '#2f2219', '#36271c', '#3d2c1f', '#443122'], r1: '#2e221a', r2: '#241a14',
    stalactites: '#3e3026', beams: '#6b4423', crystals: '#7ff0ff', grass: ['#4a3a2e', '#5e4a3a'], ground: ['#5a4636', '#523f30', '#44342a', '#4a3a2e'] },
  volcano: { sky: ['#2a0f0f', '#3d1410', '#521a12', '#6b2212', '#842c12', '#a03a14', '#bf4d18', '#d9651d'], sun: ['#ffb347', '#ffe08a'],
    r1: '#3a1a14', r2: '#2a120e', lava: '#ff7a1a', grass: ['#5a2a1a', '#7a3a1a'], ground: ['#3a2a26', '#33241f', '#2a1d19', '#30221d'] },
  glacier: { sky: ['#7fb3d9', '#8cbde0', '#9ac7e6', '#a8d1ec', '#b6dbf1', '#c4e4f5', '#d2ecf8', '#e0f3fb'], sun: ['#ffffff', '#ffffff'], cloud: '#ffffff',
    r1: '#a8c8e0', r2: '#8fb3d0', grass: ['#d8ecf8', '#ffffff'], ground: ['#e6f2fa', '#d4e6f2', '#b8d0e2', '#c8dcea'] },
  castle: { sky: ['#0f0d1a', '#151226', '#1c1733', '#241c40', '#2c214d', '#35265a', '#3e2b66', '#473073'], sun: ['#f4f0ff', '#ffffff'],
    r1: '#251d3a', r2: '#1b152c', walls: ['#3a3348', '#4a4258', '#2a2436'], banners: true, grass: ['#2e2a3a', '#403a50'], ground: ['#3d3548', '#362f40', '#2c2636', '#322b3d'] },
  training: { sky: ['#5aa0d8', '#68aadd', '#76b4e2', '#84bee7', '#92c8ec', '#a0d2f1', '#aedcf6', '#bce6fb'], sun: ['#fff3b0', '#ffffff'], cloud: '#ffffff',
    r1: '#6fa86a', r2: '#5a9456', trees: ['#2f6b3a', '#3a7d45'], grass: ['#4f8f43', '#6fb35a'], ground: ['#8fbf5a', '#83b352', '#6f9d45', '#7aa94c'] },
  meeting: { sky: ['#2a0a12', '#3a0d18', '#4d1220', '#601628', '#741a30', '#8a2038', '#a02640', '#b82e48'], sun: ['#ffd84a', '#fff3b0'],
    r1: '#3a1020', r2: '#2a0a16', walls: ['#5a1424', '#7a1c30', '#3a0d18'], banners: true, crowd: '#1f0a12',
    grass: ['#5a1424', '#7a1c30'], ground: ['#8a2038', '#7a1c30', '#5a1424', '#6a1828'] },
  abyss: { sky: ['#05030a', '#090612', '#0e091a', '#130c22', '#18102a', '#1d1332', '#22163a', '#271942'], sun: ['#c38bff', '#ffffff'],
    r1: '#1a1030', r2: '#120a24', lava: '#a64dff', grass: ['#2a1a3a', '#3d2650'], ground: ['#24183a', '#1f1532', '#18102a', '#1c132e'] },
};

const BG = {};
function background(themeId = 'arena') {
  if (BG[themeId]) return BG[themeId];
  const T = THEMES[themeId] || THEMES.arena;
  const w = 160, h = 90;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  const disc = (cx, cy, r, col) => { x.fillStyle = col; for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) x.fillRect(cx + xx, cy + yy, 1, 1); };
  T.sky.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 7, w, 7); });
  if (T.sun) { disc(118, 40, 8, T.sun[0]); disc(116, 38, 5, T.sun[1]); }
  if (T.cloud) {
    x.fillStyle = T.cloud;
    [[14, 12, 22], [60, 6, 16], [96, 18, 20], [138, 10, 14]].forEach(([cx, cy, cw]) => {
      x.fillRect(cx, cy, cw, 2); x.fillRect(cx + 3, cy - 2, cw - 8, 2); x.fillRect(cx + 6, cy - 3, 5, 1);
    });
  }
  const ridge = (base, a1, f1, a2, f2, ph, col) => {
    x.fillStyle = col;
    for (let i = 0; i < w; i++) {
      const top = Math.round(base + a1 * Math.sin(i * f1 + ph) + a2 * Math.sin(i * f2 + ph * 2));
      x.fillRect(i, top, 1, h - top);
    }
  };
  ridge(47, 6, 0.07, 3, 0.19, 0, T.r1);
  ridge(55, 4, 0.05, 2, 0.23, 1.3, T.r2);
  if (T.trees) {
    for (let i = 0; i < w; i += 11) {
      const th = 14 + ((i * 7) % 9), tx = i + ((i * 3) % 5);
      x.fillStyle = T.trees[(i / 11) % 2 | 0];
      for (let j = 0; j < th; j++) { const half = Math.floor((j * 5) / th) + 1; x.fillRect(tx - half, 68 - th + j, half * 2 + 1, 1); }
    }
  }
  if (T.stalactites) {
    x.fillStyle = T.stalactites;
    for (let i = 0; i < w; i += 9) { const len = 6 + ((i * 13) % 14); for (let j = 0; j < len; j++) { const half = Math.max(0, 2 - Math.floor((j * 3) / len)); x.fillRect(i - half, j, half * 2 + 1, 1); } }
  }
  if (T.crystals) {
    x.fillStyle = T.crystals;
    [[20, 62], [70, 64], [128, 61], [150, 65]].forEach(([cx, cy]) => { x.fillRect(cx, cy - 4, 2, 6); x.fillRect(cx - 2, cy - 1, 2, 3); x.fillRect(cx + 2, cy - 2, 2, 4); });
  }
  if (T.beams) {
    x.fillStyle = T.beams;
    [[24], [80], [136]].forEach(([bx]) => { x.fillRect(bx, 30, 3, 38); x.fillRect(bx + 22, 30, 3, 38); x.fillRect(bx - 2, 28, 29, 3); });
  }
  if (T.walls) {
    const [wl, wh, wd] = T.walls;
    x.fillStyle = wl; x.fillRect(0, 60, w, 8);
    x.fillStyle = wh; x.fillRect(0, 60, w, 1);
    x.fillStyle = wd;
    for (let i = 0; i < w; i += 8) { x.fillRect(i, 57, 5, 3); x.fillRect(i + 4, 63, 1, 5); }
    for (let i = 0; i < w; i += 8) { x.fillStyle = wh; x.fillRect(i, 57, 5, 1); }
  }
  if (T.banners) {
    [[18, '#c0392b'], [52, '#2e5aa8'], [108, '#2e5aa8'], [142, '#c0392b']].forEach(([bx, col]) => {
      x.fillStyle = '#3a3344'; x.fillRect(bx + 2, 50, 1, 8);
      x.fillStyle = col; x.fillRect(bx, 52, 5, 9); x.fillRect(bx + 1, 61, 3, 1);
      x.fillStyle = '#e5b33a'; x.fillRect(bx + 2, 55, 1, 2);
    });
  }
  if (T.crowd) {
    x.fillStyle = T.crowd;
    for (let i = 0; i < w; i += 5) { const hgt = 3 + ((i * 7) % 3); x.fillRect(i, 68 - hgt, 4, hgt); x.fillRect(i + 1, 68 - hgt - 2, 2, 2); }
  }
  if (T.tombs) {
    x.fillStyle = T.tombs;
    [[16, 4], [44, 3], [100, 4], [146, 3]].forEach(([tx, tw]) => { x.fillRect(tx, 61, tw * 2, 7); x.fillRect(tx + 1, 60, tw * 2 - 2, 1); x.fillStyle = '#3a3548'; x.fillRect(tx + tw - 1, 62, 2, 4); x.fillRect(tx + tw - 2, 63, 4, 1); x.fillStyle = T.tombs; });
  }
  // sol
  const [g1, g2] = T.grass, [d1, d2, d3, d4] = T.ground;
  x.fillStyle = g1; x.fillRect(0, 68, w, 3);
  x.fillStyle = g2; x.fillRect(0, 68, w, 1);
  x.fillStyle = d1; x.fillRect(0, 71, w, h - 71);
  for (let yy = 71; yy < h; yy += 4) for (let xx = (yy / 4) % 2 ? 0 : 4; xx < w; xx += 8) { x.fillStyle = d2; x.fillRect(xx, yy, 4, 4); }
  x.fillStyle = d3;
  for (let i = 0; i < 40; i++) { const px = (i * 37) % w, py = 72 + ((i * 53) % 17); x.fillRect(px, py, 1, 1); }
  x.fillStyle = d4; x.fillRect(0, 71, w, 1);
  if (T.lava) {
    x.fillStyle = T.lava;
    [[10, 78, 14], [52, 84, 10], [96, 76, 18], [140, 86, 12]].forEach(([lx, ly, lw]) => { x.fillRect(lx, ly, lw, 1); x.fillRect(lx + 3, ly + 1, lw - 6, 1); });
  }
  BG[themeId] = c;
  return c;
}

// ------------------------------ Combat ------------------------------
/**
 * Joue un combat dans le canvas. Renvoie { promise, setSpeed, skip, destroy }.
 */
const NO_SFX = new Proxy({}, { get: () => () => {} });

/**
 * Joue un combat dans le canvas.
 * training = entraînement silencieux (pas de musique ni de bruitages) ; onEntry = appelé à chaque étape.
 */
export function playBattle(canvas, A, B, result, { theme = 'arena', victory = null, training = false, onEntry = null, onBegin = null, spellBar = false } = {}) {
  // Taille « logique » de la scène, recalculée selon l'écran (propre à chaque combat).
  // Téléphone en hauteur : scène étroite et haute (persos plus gros), sinon format large.
  let W = 480, H = 270, GROUND = 228, PORTRAIT = false;
  let SAFE_TOP = 0, SAFE_BOT = 0;
  const sfx = training ? NO_SFX : SFX;
  const ctx = canvas.getContext('2d');
  let k = 1, speed = 1, alive = true, last = performance.now(), time = 0, shake = 0;
  const tweens = [], timers = [], effects = [], texts = [];
  let banner = null;
  let F = [];

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const aspect = Math.max(0.3, r.height / Math.max(1, r.width));
    PORTRAIT = aspect > 1.1;
    W = PORTRAIT ? 240 : 480;
    H = Math.round(W * aspect);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    k = canvas.width / W;
    // zones réservées en haut (encoche) et en bas (boutons), en unités de la scène
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    SAFE_TOP = (parseFloat(cs.paddingTop) || 0) * W / r.width;
    SAFE_BOT = (parseFloat(cs.paddingBottom) || 0) * W / r.width;
    probe.remove();
    GROUND = PORTRAIT ? Math.round(H * 0.62) : H - 42;
    F.forEach(f => { f.baseX = baseXOf(f.i, f.sw); });
  }
  // Position de départ ; un gros boss est décalé pour rester entièrement à l'écran
  const baseXOf = (i, sw = HERO_W) => {
    const x = (PORTRAIT ? (i === 0 ? 0.25 : 0.75) : (i === 0 ? 0.3125 : 0.6875)) * W;
    const half = (sw * S) / 2 + 4;
    return i === 0 ? Math.max(x, half) : Math.min(x, W - half);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const mk = (snap, i) => {
    const weapon = snap.monster ? null : CLASSES[snap.classId].weapon;
    const sprite = snap.monster ? monsterCanvas(snap.monster) : heroCanvas(snap.classId, snap.dye);
    const idle = weapon ? IDLE_ANGLE[weapon] : 0;
    const k = snap.monster ? 1 : HERO_K;     // les héros sont dessinés un peu plus grands
    return {
      k, pose: 'idle', spriteAtk: snap.monster ? null : heroCanvas(snap.classId, snap.dye, 'atk'),
      i, snap, weapon, idle, dir: i === 0 ? 1 : -1, baseX: 0,
      offX: 0, offY: 0, rot: 0, flash: 0, alpha: 1, squash: 0,
      wAng: idle, wOff: 0, run: false, spin: 0, phase: i * 1.7, petDX: 0, petDY: 0,
      hp: snap.hp ?? snap.maxHp, max: snap.maxHp, hpShown: snap.hp ?? snap.maxHp, hpLag: snap.hp ?? snap.maxHp, shield: 0, shieldShown: 0,
      tags: [], dead: false, stars: 0, petHop: 0, glow: 0, glowColor: '#fff',
      // les boss sont dessinés plus gros (4 px au lieu de 3)
      sprite, sw: snap.monster ? lw(sprite) * 4 / 3 : HERO_W * k, sh: snap.monster ? lh(sprite) * 4 / 3 : HERO_H * k,
      wSprite: weapon ? weaponCanvas(weapon) : null, pivot: weapon ? weaponPivot(weapon) : [0, 0],
      pet: snap.pet ? petCanvas(snap.pet.itemId) : null,
    };
  };
  F = [mk(A, 0), mk(B, 1)];
  F.forEach(f => { f.baseX = baseXOf(f.i, f.sw); });

  // ---------- tweens & timers (suivent la vitesse du combat) ----------
  function tween(obj, to, dur, ease = 'outQuad') {
    return new Promise(res => {
      const from = {};
      for (const key in to) from[key] = obj[key];
      tweens.push({ obj, from, to, dur: Math.max(1, dur), t: 0, ease: EASE[ease], res });
    });
  }
  function wait(ms) { return new Promise(res => timers.push({ t: ms, res })); }

  // ---------- positions ----------
  const fx = (f) => f.baseX + f.offX * f.dir;
  const center = (f) => ({ x: fx(f), y: GROUND - f.sh * S * 0.55 + f.offY });
  // familier : flotte derrière son maître
  const petBox = (f) => {
    const pw = lw(f.pet) * 2, ph = lh(f.pet) * 2;
    const x = fx(f) - (PORTRAIT ? 34 : 52) * f.dir - pw / 2 + f.petDX;
    const y = GROUND - 64 + Math.sin(time * 4 + f.phase) * 4 - f.petHop * 10 + f.petDY;
    return { x, y, pw, ph, cx: x + pw / 2, cy: y + ph / 2 };
  };
  const handPos = (f) => f.weapon ? {
    x: fx(f) + (-f.sw * S / 2 + handOf(f.pose).x * S * f.k) * f.dir,
    y: GROUND + f.offY - f.sh * S + handOf(f.pose).y * S * f.k,
  } : { x: fx(f) + f.sw * S * 0.3 * f.dir, y: GROUND + f.offY - f.sh * S * 0.6 };

  // ---------- particules & textes ----------
  function burst(x, y, n, colors, { speed: sp = 120, up = 0, grav = 300, life = 600, size = 3, glow = null } = {}) {
    if (glow === null) glow = !colors.some(c => /c49a6c|e0c49a/i.test(c));   // tout brille, sauf la poussière du sol
    for (let j = 0; j < n; j++) {
      const a = Math.random() * Math.PI * 2;
      const v = sp * (0.4 + Math.random() * 0.6);
      effects.push({
        kind: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, g: grav,
        life, max: life, color: colors[j % colors.length], size: size * (0.6 + Math.random() * 0.6), glow,
      });
    }
  }
  function float(text, x, y, color, size = 10, opts = {}) {
    texts.push({ text, x, y, vy: opts.vy ?? -40, life: opts.life ?? 1000, max: opts.life ?? 1000, color, size, pop: 0 });
  }

  // ---------- application des résultats ----------
  const STATUS_COLOR = { burn: '#ff9f43', poison: '#7bed6f', stun: '#feca57', buff: '#ffd84a', debuff: '#c38bff' };

  async function hitFx(T, crit) {
    (crit ? sfx.crit : sfx.hit)();
    T.flash = 1;
    shake = Math.max(shake, crit ? 7 : 3);
    const c = center(T);
    effects.push({ kind: 'flare', x: c.x, y: c.y, r: crit ? 46 : 28, color: crit ? '#ffd84a' : '#ffffff', life: crit ? 260 : 160, max: crit ? 260 : 160 });
    effects.push({ kind: 'ring', x: c.x, y: c.y, r0: 6, r1: crit ? 60 : 36, color: crit ? '#ffd84a' : '#ffffff', life: 240, max: 240, thin: true });
    burst(c.x, c.y, crit ? 18 : 10, crit ? ['#fff', '#ffd84a', '#ff6b6b'] : ['#fff', '#ff6b6b', '#ffb3b3'], { speed: crit ? 200 : 140, up: 40 });
    tween(T, { offX: -12, rot: -8 }, 90).then(() => tween(T, { offX: 0, rot: 0 }, 220, 'outBack'));
    tween(T, { flash: 0 }, 220, 'linear');
  }

  function apply(r) {
    const T = F[r.target];
    const c = center(T);
    if (r.type === 'hit') {
      T.hp = r.hp;
      T.shield = Math.max(0, T.shield - r.absorbed);
      hitFx(T, r.crit);
      if (r.crit) float('CRITIQUE !', c.x, c.y - 52, '#ffd84a', 8, { vy: -25 });
      float(String(r.dmg - r.absorbed), c.x + (Math.random() * 20 - 10), c.y - 34, r.crit ? '#ffd84a' : '#ffffff', r.crit ? 16 : 12);
      if (r.absorbed > 0) { float(`(${r.absorbed})`, c.x + 26 * T.dir * -1, c.y - 14, '#7fd6ff', 7); burst(c.x, c.y, 8, ['#7fd6ff', '#e0f7ff'], { speed: 160 }); }
    } else if (r.type === 'dodge') {
      sfx.dodge();
      tween(T, { offX: -26, offY: -14 }, 140).then(() => tween(T, { offX: 0, offY: 0 }, 260, 'outQuad'));
      float('Esquive !', c.x, c.y - 40, '#e0f7ff', 8);
    } else if (r.type === 'heal') {
      sfx.heal();
      T.hp = r.hp;
      float('+' + r.amount, c.x, c.y - 34, '#7bed6f', 12);
      for (let j = 0; j < 14; j++) effects.push({ kind: 'plus', x: c.x + (Math.random() * 50 - 25), y: c.y + 20 - Math.random() * 30, vy: -50 - Math.random() * 40, life: 900, max: 900 });
      T.glow = 1; T.glowColor = '#7bed6f'; tween(T, { glow: 0 }, 600, 'linear');
    } else if (r.type === 'shield') {
      sfx.shield();
      T.shield = r.shield;
      float('Bouclier', c.x, c.y - 40, '#7fd6ff', 8);
      burst(c.x, c.y, 14, ['#7fd6ff', '#e0f7ff', '#ffffff'], { speed: 90, grav: -40 });
    } else if (r.type === 'status') {
      float(r.n, c.x, c.y - 56, STATUS_COLOR[r.k] || '#fff', 7, { vy: -18, life: 1200 });
      if (r.k === 'stun') { T.stars = 1; sfx.stun(); }
    }
  }

  // ---------- effets visuels de sorts ----------
  function projectile(kind, from, to, dur) {
    const p = { kind: 'proj', type: kind, x: from.x, y: from.y, life: 1e9, max: 1e9, angle: Math.atan2(to.y - from.y, to.x - from.x), t: 0 };
    effects.push(p);
    const arc = kind === 'arrow' || kind === 'poisonArrow' ? -30 : 0;
    const o = { t: 0 };
    return new Promise(res => {
      const tw = { obj: o, from: { t: 0 }, to: { t: 1 }, dur, t: 0, ease: EASE.linear, res: () => { p.life = 0; res(); } };
      tw.onStep = () => {
        const t = o.t;
        const nx = from.x + (to.x - from.x) * t;
        const ny = from.y + (to.y - from.y) * t + arc * Math.sin(Math.PI * t);
        p.angle = Math.atan2(ny - p.y, nx - p.x) || p.angle;
        p.x = nx; p.y = ny;
        trail(p);
      };
      tweens.push(tw);
    });
  }
  function trail(p) {
    const T = {
      fireball: ['#ff9f43', '#ffd84a', '#ff5e3a'], bolt: ['#c38bff', '#ffffff'], ice: ['#bff3ff', '#ffffff'],
      drain: ['#8a3bd1', '#c38bff'], poisonArrow: ['#7bed6f', '#3fbf3f'], meteor: ['#ff9f43', '#ffd84a', '#ff3a1a', '#666'],
      spore: ['#7bed6f', '#b8ffb0', '#9b59b6'], rock: ['#8d8a84', '#5f5c57'], spit: ['#7bed6f', '#2f9e3f'],
    }[p.type];
    if (!T || Math.random() > 0.8) return;
    effects.push({ kind: 'p', x: p.x + (Math.random() * 6 - 3), y: p.y + (Math.random() * 6 - 3), vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, g: -20, life: 350, max: 350, color: T[Math.floor(Math.random() * T.length)], size: p.type === 'meteor' ? 5 : 3, glow: true });
  }

  async function skyStrike(kind, T, dur) {
    const c = center(T);
    if (kind === 'lightning') {
      sfx.bolt();
      effects.push({ kind: 'bolt', x: c.x, y: c.y, life: 260, max: 260, seed: Math.random() });
      effects.push({ kind: 'flashScreen', life: 120, max: 120, color: '#e8f4ff' });
      await wait(80);
    } else if (kind === 'holy') {
      sfx.magic();
      effects.push({ kind: 'pillar', x: c.x, life: 520, max: 520 });
      await wait(260);
      burst(c.x, c.y, 16, ['#fff3b0', '#ffd84a', '#ffffff'], { speed: 120, grav: -60 });
    } else if (kind === 'meteor') {
      sfx.fire();
      await projectile('meteor', { x: c.x - 160 * T.dir * -1, y: -30 }, { x: c.x, y: c.y + 10 }, dur);
      sfx.boom();
      burst(c.x, c.y + 10, 30, ['#ff9f43', '#ffd84a', '#ff3a1a', '#555'], { speed: 260, up: 80, size: 4 });
      shake = 12;
    } else if (kind === 'firerain') {
      sfx.fire();
      const ox = Math.random() * 40 - 20;
      await projectile('fireball', { x: c.x + ox - 40, y: -10 }, { x: c.x + ox / 2, y: c.y }, dur);
      burst(c.x, c.y, 10, ['#ff9f43', '#ffd84a'], { speed: 140 });
    } else if (kind === 'rain') {
      sfx.arrow();
      const ox = Math.random() * 40 - 20;
      await projectile('arrow', { x: c.x + ox + 20 * T.dir, y: -10 }, { x: c.x + ox / 3, y: c.y }, dur);
    } else if (kind === 'trap') {
      effects.push({ kind: 'trap', x: c.x, y: GROUND - 4, life: 500, max: 500 });
      await wait(200);
    }
  }

  async function selfFx(f, fxk) {
    const c = center(f);
    if (fxk === 'roar') {
      sfx.roar();
      for (let j = 0; j < 3; j++) { effects.push({ kind: 'ring', x: c.x, y: c.y, r0: 10, r1: 90, color: '#ff6b6b', life: 500, max: 500 }); await wait(110); }
      shake = 5;
    } else if (fxk === 'shield') {
      effects.push({ kind: 'ring', x: c.x, y: c.y, r0: 60, r1: 44, color: '#7fd6ff', life: 400, max: 400 });
    } else if (fxk === 'buff') {
      sfx.buff();
      for (let j = 0; j < 10; j++) effects.push({ kind: 'up', x: c.x + (Math.random() * 50 - 25), y: c.y + 30, vy: -70 - Math.random() * 40, life: 800, max: 800 });
      f.glow = 1; f.glowColor = '#ffd84a'; tween(f, { glow: 0 }, 700, 'linear');
    } else if (fxk === 'heal') {
      effects.push({ kind: 'pillar', x: c.x, life: 520, max: 520, color: '#7bed6f' });
    }
  }

  // ---------- séquences d'action ----------
  const byStep = (results, s) => results.filter(r => r.step === s);

  async function swing(f) {
    sfx.swing();
    if (!f.weapon) {
      await tween(f, { offX: f.offX - 8, squash: 0.15 }, 120);
      await tween(f, { offX: f.offX + 20, squash: -0.1 }, 80, 'inQuad');
      tween(f, { squash: 0 }, 160);
    } else if (f.weapon === 'hammer' || f.weapon === 'sword') {
      await tween(f, { wAng: -80, offX: f.offX - 4 }, 110);
      await tween(f, { wAng: 130, offX: f.offX + 12 }, 80, 'inQuad');
    }
  }

  async function doMelee(f, T, e) {
    f.run = true;
    f.pose = 'atk';
    const dist = Math.abs(T.baseX - f.baseX) - (f.sw + T.sw) * S / 2 - 4;
    await tween(f, { offX: dist }, 320, 'inOutQuad');
    f.run = false;
    for (let s = 0; s < e.hits; s++) {
      if (e.fx === 'whirl') {
        tween(f, { spin: f.spin + 360 }, 220, 'linear');
        await tween(f, { wAng: 130 }, 120);
        effects.push({ kind: 'slash', x: center(T).x, y: center(T).y, dir: f.dir, life: 200, max: 200, big: true });
      } else {
        await swing(f);
        const c = center(T);
        if (e.fx === 'bash') { effects.push({ kind: 'impact', x: c.x - 10 * f.dir, y: c.y, life: 220, max: 220 }); burst(c.x, GROUND - 4, 8, ['#c49a6c', '#e0c49a'], { speed: 90, up: 60 }); }
        else effects.push({ kind: 'slash', x: c.x - 6 * f.dir, y: c.y, dir: f.dir, life: 200, max: 200 });
      }
      byStep(e.results, s).forEach(apply);
      await wait(e.hits > 1 ? 120 : 220);
      tween(f, { wAng: f.idle, offX: dist }, 160);
    }
    f.spin = 0;
    f.run = true;
    f.pose = 'idle';
    await tween(f, { offX: 0, wAng: f.idle }, 300, 'inOutQuad');
    f.run = false;
  }

  async function doRanged(f, T, e) {
    const sky = ['lightning', 'holy', 'meteor', 'firerain', 'rain', 'trap'].includes(e.fx);
    f.pose = 'atk';
    // posture d'attaque
    if (f.weapon === 'bow') await tween(f, { wOff: -6 }, 160);
    else if (!f.weapon) await tween(f, { squash: 0.12, offX: -6 }, 160);
    else await tween(f, { wAng: -30, offY: -6 }, 160);
    for (let s = 0; s < e.hits; s++) {
      if (f.weapon === 'bow' && !sky) { f.wOff = 2; tween(f, { wOff: s < e.hits - 1 ? -6 : 0 }, 160); }
      if (sky) {
        await skyStrike(e.fx, T, e.fx === 'meteor' ? 420 : 240);
      } else {
        const from = handPos(f);
        const to = center(T);
        const type = e.fx;
        if (!f.weapon) tween(f, { squash: -0.08, offX: 4 }, 100);
        ({ arrow: sfx.arrow, poisonArrow: sfx.arrow, fireball: sfx.fire, rock: sfx.swing }[type] || sfx.magic)();
        await projectile(type, { x: from.x, y: from.y - 6 }, to, type === 'arrow' || type === 'poisonArrow' ? 260 : 340);
        if (e.fx === 'fireball') burst(to.x, to.y, 12, ['#ff9f43', '#ffd84a', '#ff5e3a'], { speed: 150 });
        if (e.fx === 'ice') burst(to.x, to.y, 12, ['#bff3ff', '#ffffff', '#6fe3ff'], { speed: 150 });
      }
      const rs = byStep(e.results, s);
      rs.forEach(r => {
        if (r.type === 'heal' && r.target === f.i && e.fx === 'drain') {
          const c = center(T), h = center(f);
          for (let j = 0; j < 8; j++) effects.push({ kind: 'p', x: c.x, y: c.y, vx: (h.x - c.x) * 1.6 + (Math.random() - 0.5) * 60, vy: (h.y - c.y) * 1.6 - 40 + Math.random() * 40, g: 0, life: 600, max: 600, color: '#7bed6f', size: 3 });
        }
        apply(r);
      });
      await wait(e.hits > 2 ? 60 : 160);
    }
    f.pose = 'idle';
    await tween(f, { wAng: f.idle, offY: 0, wOff: 0, squash: 0, offX: 0 }, 220);
  }

  async function doSelf(f, e) {
    await tween(f, { offY: -10, wAng: -20 }, 160);
    await selfFx(f, e.fx);
    e.results.forEach(apply);
    await wait(260);
    await tween(f, { offY: 0, wAng: f.idle }, 200);
  }

  // Attaque du familier : il bondit sur l'ennemi, crache un projectile ou soigne son maître
  async function doPet(f, T, e) {
    if (!f.pet) { e.results.forEach(apply); return; }
    const b = petBox(f);
    float(e.name, b.cx, b.y - 8, '#9fe8ff', 7, { vy: -12, life: 1000 });
    if (e.pet === 'pounce') {
      const to = center(T);
      const dx = to.x - b.cx - 18 * f.dir, dy = to.y - b.cy;
      sfx.swing();
      await tween(f, { petDX: dx * 0.5, petDY: dy * 0.5 - 30 }, 170, 'outQuad');
      await tween(f, { petDX: dx, petDY: dy }, 130, 'inQuad');
      for (let s = 0; s < Math.max(1, e.hits); s++) {
        const c = center(T);
        effects.push({ kind: 'claw', x: c.x - 4 * f.dir, y: c.y, life: 220, max: 220 });
        byStep(e.results, s).forEach(apply);
        await wait(e.hits > 1 ? 150 : 120);
      }
      await tween(f, { petDX: 0, petDY: 0 }, 320, 'inOutQuad');
    } else if (e.pet === 'self') {
      await tween(f, { petDY: -18 }, 150);
      for (let j = 0; j < 8; j++) effects.push({ kind: 'plus', x: b.cx + (Math.random() * 30 - 15), y: b.cy, vy: -40 - Math.random() * 30, life: 700, max: 700 });
      e.results.forEach(apply);
      await tween(f, { petDY: 0 }, 200);
    } else {
      await tween(f, { petDY: -10 }, 120);
      for (let s = 0; s < Math.max(1, e.hits); s++) {
        ({ bark: sfx.roar, spit: sfx.dot }[e.fx] || sfx.magic)();
        await projectile(e.fx, { x: b.cx, y: b.cy }, center(T), 300);
        byStep(e.results, s).forEach(apply);
      }
      await tween(f, { petDY: 0 }, 160);
    }
  }

  function sync(s) {
    if (!s) return;
    s.forEach((st, i) => { F[i].hp = st.hp; F[i].shield = st.shield; F[i].tags = st.tags; if (!st.tags.some(t => t.k === 'stun')) F[i].stars = Math.min(F[i].stars, 0.999); });
  }

  async function playEntry(e) {
    if (e.type === 'action' && e.pet) {
      await doPet(F[e.actor], F[1 - e.actor], e);
      await wait(120);
    } else if (e.type === 'action') {
      const f = F[e.actor], T = F[1 - e.actor];
      if (e.id) { const c = center(f); float(e.name, c.x, GROUND - f.sh * S - 20, '#ffe08a', 7, { vy: -10, life: 1100 }); }
      f.petHop = 1; tween(f, { petHop: 0 }, 400, 'linear');
      if (e.selfOnly) await doSelf(f, e);
      else if (e.melee) await doMelee(f, T, e);
      else await doRanged(f, T, e);
      await wait(180);
    } else if (e.type === 'dot') {
      sfx.dot();
      const T = F[e.target], c = center(T);
      T.hp = e.hp;
      const cols = e.k === 'burn' ? ['#ff9f43', '#ffd84a', '#ff5e3a'] : ['#7bed6f', '#3fbf3f', '#b8ffb0'];
      burst(c.x, c.y, 10, cols, { speed: 60, grav: -80 });
      T.glow = 1; T.glowColor = cols[0]; tween(T, { glow: 0 }, 400, 'linear');
      float(String(e.dmg), c.x, c.y - 30, cols[0], 10);
      await wait(420);
    } else if (e.type === 'stunned') {
      const T = F[e.target], c = center(T);
      T.stars = 1;
      float('Étourdi…', c.x, c.y - 50, '#feca57', 8);
      await wait(700);
      T.stars = 0;
    } else if (e.type === 'rage') {
      sfx.rage();
      banner = { text: 'RAGE DE L’ARÈNE !', sub: 'Les dégâts augmentent', life: 1600, max: 1600 };
      shake = 6;
      await wait(1200);
    } else if (e.type === 'end' && e.winner < 0) {
      // fin d'un assaut de raid : personne ne tombe
      if (!training) { stopMusic(); setQuiet(false); }
      await wait(300);
    } else if (e.type === 'end') {
      if (!training) { stopMusic(); setQuiet(false); }
      (e.winner === 0 ? sfx.win : sfx.lose)();
      const win = F[e.winner], lose = F[1 - e.winner];
      lose.dead = true;
      tween(lose, { rot: -85, alpha: 0.35, offX: -20 }, 600, 'outQuad');
      burst(center(lose).x, GROUND - 6, 16, ['#c49a6c', '#e0c49a'], { speed: 120, up: 40 });
      await wait(500);
      if (victory && e.winner === 0) {
        const c = center(win);
        for (let j = 0; j < 4; j++) setTimeout(() => burst(c.x + (Math.random() - 0.5) * 80, c.y - 40 - Math.random() * 40, 26, victory, { speed: 200, up: 120, grav: 160, life: 1200, size: 4 }), j * 250 / speed);
      }
      for (let j = 0; j < 3; j++) { await tween(win, { offY: -26 }, 180); await tween(win, { offY: 0 }, 180, 'inQuad'); }
      await wait(300);
    }
    sync(e.s);
  }

  // ---------- boucle de rendu ----------
  function update(dt) {
    time += dt / 1000;
    for (let j = tweens.length - 1; j >= 0; j--) {
      const tw = tweens[j];
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.dur);
      const ev = tw.ease(p);
      for (const key in tw.to) tw.obj[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * ev;
      if (tw.onStep) tw.onStep();
      if (p >= 1) { tweens.splice(j, 1); tw.res(); }
    }
    for (let j = timers.length - 1; j >= 0; j--) { timers[j].t -= dt; if (timers[j].t <= 0) { const t = timers.splice(j, 1)[0]; t.res(); } }
    const s = dt / 1000;
    for (let j = effects.length - 1; j >= 0; j--) {
      const e = effects[j];
      e.life -= dt;
      if (e.kind === 'p') { e.vy += e.g * s; e.x += e.vx * s; e.y += e.vy * s; }
      if (e.kind === 'plus' || e.kind === 'up') e.y += e.vy * s;
      if (e.life <= 0) effects.splice(j, 1);
    }
    for (let j = texts.length - 1; j >= 0; j--) {
      const t = texts[j];
      t.life -= dt; t.y += t.vy * s; t.vy *= 0.97; t.pop = Math.min(1, t.pop + s * 8);
      if (t.life <= 0) texts.splice(j, 1);
    }
    if (banner) { banner.life -= dt; if (banner.life <= 0) banner = null; }
    shake = Math.max(0, shake - s * 30);
    for (const f of F) {
      f.hpShown += (f.hp - f.hpShown) * Math.min(1, s * 12);
      f.hpLag += (f.hpShown - f.hpLag) * Math.min(1, s * 2.5);
      if (f.hpLag < f.hpShown) f.hpLag = f.hpShown;
      f.shieldShown += (f.shield - f.shieldShown) * Math.min(1, s * 10);
    }
  }

  function drawFighter(f) {
    const x = fx(f);
    const run = f.run ? -Math.abs(Math.sin(time * 18)) * 5 : 0;
    const bob = f.dead ? 0 : Math.sin(time * 3 + f.phase) * 1.2;
    const y = GROUND + f.offY + run;
    // ombre
    ctx.globalAlpha = 0.25 * f.alpha;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, GROUND + 2, Math.max(10, f.sw * S * 0.4 - Math.min(10, -f.offY * 0.3)), 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = f.alpha;
    // familier
    if (f.pet) {
      const { x: px, y: py, pw, ph } = petBox(f);
      ctx.save();
      ctx.translate(px + pw / 2, 0); ctx.scale(f.dir, 1); ctx.translate(-(px + pw / 2), 0);
      ctx.drawImage(f.pet, px, py, pw, ph);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f.dir, 1);
    const pivotY = -f.sh * S / 2;
    ctx.translate(0, pivotY);
    ctx.rotate(((f.rot + f.spin) * Math.PI) / 180);
    ctx.translate(0, -pivotY);
    const breathe = 1 + Math.sin(time * 3 + f.phase) * (f.weapon ? 0.015 : 0.04);
    ctx.scale(1 + f.squash, breathe - f.squash);
    const SW = f.sw * S, SH = f.sh * S;
    const sx = -SW / 2, sy = -SH + bob;
    // aura (soin / bonus)
    if (f.glow > 0.01) {
      ctx.globalAlpha = f.glow * 0.6 * f.alpha;
      const wsp = whiteOf(f.sprite);
      for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) ctx.drawImage(tint(wsp, f.glowColor), sx + dx, sy + dy, SW, SH);
      ctx.globalAlpha = f.alpha;
    }
    const body = f.pose === 'atk' && f.spriteAtk ? f.spriteAtk : f.sprite;
    ctx.drawImage(body, sx, sy, SW, SH);
    if (f.flash > 0.01) { ctx.globalAlpha = f.flash * f.alpha; ctx.drawImage(whiteOf(body), sx, sy, SW, SH); ctx.globalAlpha = f.alpha; }
    if (!f.wSprite) { ctx.restore(); drawAfter(f); return; }
    // arme (dans la main, qui bouge en pose d'attaque)
    const H = handOf(f.pose), WS = S * f.k;
    const hx = sx + H.x * WS + (f.weapon === 'bow' ? f.wOff : 0), hy = sy + H.y * WS;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate((f.wAng * Math.PI) / 180);
    const [px, py] = f.pivot;
    ctx.drawImage(f.wSprite, -px * WS, -py * WS, lw(f.wSprite) * WS, lh(f.wSprite) * WS);
    if (f.flash > 0.01) { ctx.globalAlpha = f.flash * f.alpha; ctx.drawImage(whiteOf(f.wSprite), -px * WS, -py * WS, lw(f.wSprite) * WS, lh(f.wSprite) * WS); }
    ctx.restore();
    ctx.restore();
    drawAfter(f);
  }

  function drawAfter(f) {
    // bouclier
    if (f.shieldShown > 1) {
      const c = center(f);
      ctx.globalAlpha = 0.25 + Math.sin(time * 5) * 0.05;
      ctx.fillStyle = '#7fd6ff';
      ctx.beginPath(); ctx.ellipse(c.x, c.y + 4, Math.max(44, f.sw * S * 0.65), Math.max(52, f.sh * S * 0.65), 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.7; ctx.strokeStyle = '#e0f7ff'; ctx.lineWidth = 2; ctx.stroke();
    }
    // étoiles d'étourdissement
    if (f.stars > 0.5) {
      const c = { x: fx(f), y: GROUND - f.sh * S - 4 + f.offY };
      ctx.globalAlpha = 1;
      for (let j = 0; j < 3; j++) {
        const a = time * 5 + (j * Math.PI * 2) / 3;
        star(c.x + Math.cos(a) * 18, c.y + Math.sin(a) * 5, '#feca57');
      }
    }
    ctx.globalAlpha = 1;
  }

  const tintCache = new Map();
  function tint(src, color) {
    const key = color;
    if (!tintCache.has(src)) tintCache.set(src, new Map());
    const m = tintCache.get(src);
    if (!m.has(key)) {
      const c = document.createElement('canvas');
      c.width = src.width; c.height = src.height;
      const x = c.getContext('2d');
      x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
      m.set(key, c);
    }
    return m.get(key);
  }

  function star(x, y, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x - 1, y - 4, 2, 8); ctx.fillRect(x - 4, y - 1, 8, 2); ctx.fillRect(x - 2, y - 2, 4, 4);
  }

  function drawEffect(e) {
    const p = 1 - e.life / e.max;
    if (e.kind === 'p') {
      const a = Math.max(0, e.life / e.max);
      if (e.glow) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * 0.35; ctx.fillStyle = e.color;
        ctx.fillRect(e.x - e.size * 1.5, e.y - e.size * 1.5, e.size * 3, e.size * 3);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size);
    } else if (e.kind === 'flare') {
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r);
      g.addColorStop(0, e.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = (1 - p) * 0.8; ctx.fillStyle = g;
      ctx.fillRect(e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
      ctx.globalCompositeOperation = 'source-over';
    } else if (e.kind === 'plus') {
      ctx.globalAlpha = Math.max(0, e.life / e.max);
      ctx.fillStyle = '#7bed6f';
      ctx.fillRect(e.x - 1, e.y - 4, 3, 9); ctx.fillRect(e.x - 4, e.y - 1, 9, 3);
    } else if (e.kind === 'up') {
      ctx.globalAlpha = Math.max(0, e.life / e.max);
      ctx.fillStyle = '#ffd84a';
      ctx.fillRect(e.x - 1, e.y, 3, 8); ctx.fillRect(e.x - 3, e.y + 2, 7, 2); ctx.fillRect(e.x - 2, e.y + 1, 5, 1);
    } else if (e.kind === 'proj') {
      ctx.globalAlpha = 1;
      drawProjectile(e);
    } else if (e.kind === 'slash') {
      const r = (e.big ? 50 : 36) * (0.8 + p * 0.3);
      const a0 = e.dir > 0 ? -1.9 : Math.PI + 1.9, a1 = e.dir > 0 ? 0.9 : Math.PI - 0.9;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (1 - p) * 0.5; ctx.strokeStyle = e.color || '#9fd8ff'; ctx.lineWidth = e.big ? 14 : 10;
      ctx.beginPath(); ctx.arc(e.x, e.y, r, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = e.big ? 5 : 3;
      ctx.beginPath(); ctx.arc(e.x, e.y, r, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.globalAlpha = (1 - p) * 0.8;
      ctx.beginPath(); ctx.arc(e.x, e.y, r - 7, Math.min(a0, a1) + 0.3, Math.max(a0, a1) - 0.3); ctx.stroke();
    } else if (e.kind === 'impact') {
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = '#fff3b0';
      const r = 10 + p * 24;
      for (let j = 0; j < 8; j++) {
        const a = (j * Math.PI) / 4;
        ctx.fillRect(e.x + Math.cos(a) * r - 3, e.y + Math.sin(a) * r - 3, 6, 6);
      }
    } else if (e.kind === 'ring') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (1 - p) * (e.thin ? 0.7 : 1);
      ctx.strokeStyle = e.color; ctx.lineWidth = e.thin ? 2 : 4;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r0 + (e.r1 - e.r0) * p, 0, Math.PI * 2); ctx.stroke();
      if (!e.thin) { ctx.globalAlpha = (1 - p) * 0.35; ctx.lineWidth = 10; ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over';
    } else if (e.kind === 'bolt') {
      ctx.globalAlpha = 1 - p * 0.7;
      let x = e.x + 10, y = -10;
      const pts = [[x, y]];
      let sd = e.seed * 1000;
      while (y < e.y) { sd = (sd * 9301 + 49297) % 233280; x = e.x + ((sd / 233280) - 0.5) * 30; y += 22; pts.push([x, Math.min(y, e.y)]); }
      const path = (list) => { ctx.beginPath(); ctx.moveTo(list[0][0], list[0][1]); list.forEach(q => ctx.lineTo(q[0], q[1])); };
      ctx.globalCompositeOperation = 'lighter';
      path(pts); ctx.strokeStyle = '#4fa8ff'; ctx.lineWidth = 14; ctx.globalAlpha = (1 - p) * 0.35; ctx.stroke();
      // petites branches
      ctx.lineWidth = 2; ctx.globalAlpha = (1 - p) * 0.8; ctx.strokeStyle = '#bfe6ff';
      pts.forEach((q, i) => { if (i % 2 && i < pts.length - 1) { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + (i % 4 ? 16 : -16), q[1] + 12); ctx.stroke(); } });
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1 - p * 0.7;
      path(pts); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 2; ctx.stroke();
    } else if (e.kind === 'pillar') {
      const w = 40 * (1 - p * 0.5);
      ctx.globalCompositeOperation = 'lighter';
      const lg = ctx.createLinearGradient(e.x - w, 0, e.x + w, 0);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(0.5, e.color || '#fff3b0'); lg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.7; ctx.fillStyle = lg;
      ctx.fillRect(e.x - w, 0, w * 2, GROUND);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.8;
      ctx.fillStyle = e.color || '#fff3b0';
      ctx.fillRect(e.x - w / 2, 0, w, GROUND);
      ctx.globalAlpha *= 0.8; ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.x - w / 6, 0, w / 3, GROUND);
      // étincelles qui montent dans le rayon
      ctx.fillStyle = '#ffffff';
      for (let j = 0; j < 8; j++) { const sy = GROUND - ((p * 300 + j * 47) % GROUND); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9; ctx.fillRect(e.x - w / 2 + ((j * 13) % w), sy, 2, 2); }
    } else if (e.kind === 'trap') {
      ctx.globalAlpha = 1;
      const close = Math.min(1, p * 3);
      ctx.fillStyle = '#9aa3ad';
      for (let j = -3; j <= 3; j++) {
        ctx.fillRect(e.x + j * 6 - 2, e.y - 14 + close * 8, 4, 8);
        ctx.fillRect(e.x + j * 6 - 2, e.y + 6 - close * 8, 4, 8);
      }
      ctx.fillStyle = '#5c6670'; ctx.fillRect(e.x - 22, e.y - 2, 44, 4);
    } else if (e.kind === 'claw') {
      ctx.globalAlpha = 1 - p;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
      for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(e.x - 12 + j * 8, e.y - 14 + p * 6); ctx.lineTo(e.x + 4 + j * 8, e.y + 12 + p * 6); ctx.stroke(); }
    } else if (e.kind === 'flashScreen') {
      ctx.globalAlpha = (1 - p) * 0.5;
      ctx.fillStyle = e.color; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }

  const HALO = { fireball: '#ff8a2a', meteor: '#ff6a1a', ice: '#7fe7ff', bolt: '#b06bff', drain: '#8a3bd1', spore: '#7bed6f', spit: '#7bed6f', poisonArrow: '#7bed6f' };
  function drawProjectile(e) {
    const hc = HALO[e.type];
    if (hc) {
      const r = e.type === 'meteor' ? 40 : 22;
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
      g.addColorStop(0, hc); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.55 + Math.sin(time * 40) * 0.1; ctx.fillStyle = g;
      ctx.fillRect(e.x - r, e.y - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.type === 'arrow' || e.type === 'poisonArrow') {
      ctx.rotate(e.angle);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-14, -1, 18, 3);
      ctx.fillStyle = e.type === 'poisonArrow' ? '#7bed6f' : '#d9dee5'; ctx.fillRect(4, -3, 5, 7); ctx.fillRect(9, -1, 2, 3);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-16, -4, 5, 3); ctx.fillRect(-16, 2, 5, 3);
    } else if (e.type === 'fireball' || e.type === 'meteor') {
      const r = (e.type === 'meteor' ? 16 : 8) * (1 + Math.sin(time * 50) * 0.08);
      ctx.rotate(time * 6);
      ctx.fillStyle = '#ff5e3a'; ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.fillStyle = '#ff9f43'; ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
      ctx.fillStyle = '#ffe08a'; ctx.fillRect(-r * 0.35, -r * 0.35, r * 0.7, r * 0.7);
    } else if (e.type === 'ice') {
      ctx.rotate(e.angle);
      ctx.fillStyle = '#6fe3ff'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(0, -6); ctx.lineTo(-10, 0); ctx.lineTo(0, 6); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-2, -2, 6, 3);
    } else if (e.type === 'bolt') {
      ctx.fillStyle = '#8a3bd1'; ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = '#e0c8ff'; ctx.fillRect(-3, -3, 6, 6);
    } else if (e.type === 'spore') {
      ctx.fillStyle = '#3fbf3f'; ctx.fillRect(-7, -7, 14, 14);
      ctx.fillStyle = '#b8ffb0'; ctx.fillRect(-4, -4, 8, 8);
      ctx.fillStyle = '#9b59b6'; ctx.fillRect(-1, -1, 3, 3);
    } else if (e.type === 'rock') {
      ctx.rotate(e.x * 0.05);
      ctx.fillStyle = '#5f5c57'; ctx.fillRect(-9, -8, 18, 16);
      ctx.fillStyle = '#8d8a84'; ctx.fillRect(-7, -8, 14, 12);
      ctx.fillStyle = '#b3b0a8'; ctx.fillRect(-5, -6, 5, 4);
    } else if (e.type === 'spit') {
      ctx.fillStyle = '#2f9e3f'; ctx.fillRect(-6, -5, 12, 10);
      ctx.fillStyle = '#7bed6f'; ctx.fillRect(-4, -3, 7, 6);
    } else if (e.type === 'bark') {
      ctx.rotate(e.angle);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(-j * 7, 0, 6 + j * 3, -0.9, 0.9); ctx.stroke(); }
    } else if (e.type === 'drain') {
      ctx.fillStyle = '#3d1366'; ctx.fillRect(-8, -8, 16, 16);
      ctx.fillStyle = '#8a3bd1'; ctx.fillRect(-5, -5, 10, 10);
      ctx.fillStyle = '#7bed6f'; ctx.fillRect(-2, -2, 4, 4);
    }
    ctx.restore();
  }

  function drawText(t) {
    const a = Math.min(1, t.life / 300);
    ctx.globalAlpha = a;
    const sc = 0.6 + 0.4 * EASE.outBack(t.pop);
    ctx.font = `${Math.round(t.size * sc)}px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = '#16121f'; ctx.lineJoin = 'round';
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
  }

  function drawHud() {
    F.forEach((f, i) => {
      if (training && i === 1) return;
      const left = PORTRAIT || i === 0;
      const bw = PORTRAIT ? W - 24 : 190, bh = PORTRAIT ? 14 : 12;
      const x = PORTRAIT ? 12 : (i === 0 ? 12 : W - 12 - bw);
      const y = PORTRAIT ? (i === 1 ? SAFE_TOP + 46 : H - SAFE_BOT - (spellBar ? 150 : 112)) : 18;
      ctx.font = `${PORTRAIT ? 9 : 8}px ${FONT}`; ctx.textBaseline = 'alphabetic';
      ctx.textAlign = left ? 'left' : 'right';
      ctx.lineWidth = 3; ctx.strokeStyle = '#16121f';
      const label = `${f.snap.name}  Nv.${f.snap.level}`;
      const tx = left ? x : x + bw;
      const nc = f.snap.nameColor === 'rainbow' ? `hsl(${(time * 120) % 360},90%,65%)` : (f.snap.nameColor || '#ffffff');
      ctx.strokeText(label, tx, y - 4); ctx.fillStyle = nc; ctx.fillText(label, tx, y - 4);
      ctx.fillStyle = '#16121f'; ctx.fillRect(x - 2, y - 2, bw + 4, bh + 4);
      ctx.fillStyle = '#3a2f45'; ctx.fillRect(x, y, bw, bh);
      const pct = (v) => Math.max(0, Math.min(1, v / f.max));
      const dirFill = (p, col) => { ctx.fillStyle = col; const w = bw * p; ctx.fillRect(left ? x : x + bw - w, y, w, bh); };
      dirFill(pct(f.hpLag), '#ffe08a');
      const hp = pct(f.hpShown);
      dirFill(hp, hp > 0.5 ? '#4cd964' : hp > 0.25 ? '#feca57' : '#ff5d6c');
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, y, bw, 3);
      if (f.shieldShown > 1) {
        ctx.fillStyle = '#7fd6ff';
        const w = bw * Math.min(1, f.shieldShown / f.max);
        ctx.fillRect(left ? x : x + bw - w, y + bh - 4, w, 4);
      }
      ctx.font = `7px ${FONT}`; ctx.textAlign = 'center';
      const hpTxt = `${Math.max(0, Math.round(f.hpShown))}/${f.max}`;
      ctx.lineWidth = 3; ctx.strokeText(hpTxt, x + bw / 2, y + bh - 2); ctx.fillStyle = '#ffffff'; ctx.fillText(hpTxt, x + bw / 2, y + bh - 2);
      // états
      let cx = left ? x : x + bw;
      ctx.font = `6px ${FONT}`;
      for (const t of f.tags) {
        const w = ctx.measureText(t.n).width + 8;
        const bx = left ? cx : cx - w;
        ctx.fillStyle = 'rgba(22,18,31,0.8)'; ctx.fillRect(bx, y + bh + 5, w, 11);
        ctx.fillStyle = STATUS_COLOR[t.k] || '#fff'; ctx.textAlign = 'left';
        ctx.fillText(t.n, bx + 4, y + bh + 13);
        cx += (left ? 1 : -1) * (w + 3);
      }
    });
    if (banner) {
      const p = 1 - banner.life / banner.max;
      ctx.globalAlpha = Math.min(1, Math.min(p * 6, (1 - p) * 4));
      ctx.fillStyle = 'rgba(22,18,31,0.75)'; ctx.fillRect(0, H / 2 - 30, W, 52);
      ctx.textAlign = 'center'; ctx.font = `14px ${FONT}`; ctx.fillStyle = '#ff6b6b';
      ctx.fillText(banner.text, W / 2, H / 2 - 4);
      ctx.font = `7px ${FONT}`; ctx.fillStyle = '#ffffff';
      ctx.fillText(banner.sub, W / 2, H / 2 + 14);
      ctx.globalAlpha = 1;
    }
  }

  function drawBackground() {
    const T = THEMES[theme] || THEMES.arena;
    const bg = background(theme);
    const sb = (W + 12) / 160;              // le décor fait toute la largeur
    const top = GROUND - 75 * sb;           // la ligne du sol tombe sous les pieds
    ctx.fillStyle = T.sky[0];
    ctx.fillRect(-10, -10, W + 20, top + 12);
    // quelques étoiles au-dessus du décor (écran en hauteur)
    if (top > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let j = 0; j < 30; j++) ctx.fillRect((j * 97) % W, (j * 53) % Math.max(1, top), 2, 2);
    }
    ctx.drawImage(bg, -6, top, W + 12, 90 * sb);
    // le sol continue jusqu'en bas, en s'assombrissant
    const band = 19 * sb;
    for (let y = top + 90 * sb; y < H + 10; y += band) ctx.drawImage(bg, 0, 71, 160, 19, -6, y, W + 12, band);
    const g = ctx.createLinearGradient(0, top + 90 * sb, 0, H);
    g.addColorStop(0, 'rgba(10,8,16,0)'); g.addColorStop(1, 'rgba(10,8,16,0.65)');
    ctx.fillStyle = g;
    ctx.fillRect(-10, top + 90 * sb, W + 20, H);
  }

  function render() {
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
    ctx.save();
    ctx.translate(sx, sy);
    drawBackground();
    const order = [...F].sort((a, b) => (a.dead ? -1 : 0) - (b.dead ? -1 : 0));
    order.forEach(drawFighter);
    effects.forEach(drawEffect);
    texts.forEach(drawText);
    ctx.restore();
    drawHud();
  }

  function frame(now) {
    if (!alive) return;
    const dt = Math.min(50, now - last);
    last = now;
    update(dt * speed);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const promise = (async () => {
    await (document.fonts ? document.fonts.load(`8px ${FONT}`).catch(() => {}) : Promise.resolve());
    if (!training) startMusic();
    await wait(training ? 200 : 600);
    let idx = 0;
    const nextEntry = result.log ? () => result.log[idx++] || null : () => result.next();
    for (let e = nextEntry(); e; e = nextEntry()) {
      if (!alive) return;
      if (onBegin) onBegin(e);
      await playEntry(e);
      if (onEntry && alive) onEntry(e);
    }
    await wait(400);
  })();

  return {
    promise,
    setSpeed(v) { speed = v; if (!training) setQuiet(v > 3); },
    skip() { speed = 40; if (!training) setQuiet(true); },
    destroy() { alive = false; ro.disconnect(); if (!training) { stopMusic(); setQuiet(false); } },
  };
}

/** Petit héros animé pour les écrans de menu */
export function idlePreview(canvas, classId, petItemId = null, dyeId = null) {
  const ctx = canvas.getContext('2d');
  const sprite = heroCanvas(classId, dyeId);
  const weapon = CLASSES[classId].weapon;
  const wS = weaponCanvas(weapon), [px, py] = weaponPivot(weapon);
  const pet = petItemId ? petCanvas(petItemId) : null;
  const sc = 4;
  const Wc = (HERO_W + 26) * sc, Hc = (HERO_H + 4) * sc;
  canvas.width = Wc; canvas.height = Hc;
  let alive = true;
  const t0 = performance.now();
  function loop(now) {
    if (!alive || !canvas.isConnected) return;
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, Wc, Hc);
    ctx.imageSmoothingEnabled = false;
    const ox = 18 * sc, oy = 3 * sc + Math.sin(t * 3) * 2;
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(ox + HERO_W * sc / 2, (HERO_H + 2.5) * sc, 9 * sc, 2 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    if (pet) ctx.drawImage(pet, 2 * sc, 6 * sc + Math.sin(t * 4) * 6, lw(pet) * sc * 0.75, lh(pet) * sc * 0.75);
    ctx.drawImage(sprite, ox, oy, HERO_W * sc, HERO_H * sc);
    ctx.save();
    ctx.translate(ox + HAND.x * sc, oy + HAND.y * sc);
    ctx.rotate(((IDLE_ANGLE[weapon] + Math.sin(t * 3) * 3) * Math.PI) / 180);
    ctx.drawImage(wS, -px * sc, -py * sc, lw(wS) * sc, lh(wS) * sc);
    ctx.restore();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return () => { alive = false; };
}

/**
 * Entraînement en boucle (écran Héros) : mkFight() fabrique un nouveau combat à chaque manche.
 * Renvoie une fonction pour tout arrêter.
 */
export function playTraining(canvas, mkFight, { onEntry = null, speed = 1.3 } = {}) {
  let ctl = null, stopped = false;
  const next = () => {
    if (stopped || !canvas.isConnected) return;
    const { me, foe, result } = mkFight();
    ctl = playBattle(canvas, me, foe, result, { theme: 'training', training: true, onEntry });
    ctl.setSpeed(speed);
    ctl.promise.then(() => { if (ctl) ctl.destroy(); next(); });
  };
  next();
  return () => { stopped = true; if (ctl) ctl.destroy(); };
}

/**
 * Guerre des sections : 4 héros bleus contre 4 héros rouges qui se battent en boucle (pour le décor).
 * blue / red = [{ name, classId, dye }]. Renvoie une fonction pour tout arrêter.
 */
export function playSkirmish(canvas, blue, red, { colors = ['#3d9bff', '#ff5d6c'] } = {}) {
  const ctx = canvas.getContext('2d');
  const W = 360;
  let H = 202, GROUND = 176, k = 1, alive = true, last = performance.now(), time = 0, shake = 0;
  const SC = 2.9;
  const tweens = [], effects = [], texts = [];
  const score = [0, 0];
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    k = canvas.width / W;
    H = Math.round(W * (r.height / Math.max(1, r.width)));
    GROUND = H - 16;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const tween = (obj, to, dur, ease = 'outQuad') => new Promise(res => {
    const from = {};
    for (const key in to) from[key] = obj[key];
    tweens.push({ obj, from, to, dur, t: 0, ease: EASE[ease], res });
  });
  const wait = (ms) => tween({ v: 0 }, { v: 1 }, ms, 'linear');
  const float = (text, x, y, color, size = 9) => texts.push({ text, x, y, vy: -36, life: 900, max: 900, color, size });
  const burst = (x, y, n, cols) => {
    for (let j = 0; j < n; j++) {
      const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 90;
      effects.push({ kind: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 500, max: 500, color: cols[j % cols.length] });
    }
  };

  // Emplacements : 2 au premier rang, 2 derrière
  const SLOTS = [[0.43, 0], [0.25, 2], [0.345, -22], [0.15, -20]];
  const mk = (m, side, j) => {
    const weapon = CLASSES[m.classId].weapon;
    const [px, dy] = SLOTS[j % SLOTS.length];
    return {
      ...m, side, dir: side === 0 ? 1 : -1, slotX: side === 0 ? px : 1 - px, dy,
      sprite: heroCanvas(m.classId, m.dye || null), spriteAtk: heroCanvas(m.classId, m.dye || null, 'atk'), pose: 'idle',
      weapon, wS: weaponCanvas(weapon), pivot: weaponPivot(weapon),
      idle: IDLE_ANGLE[weapon], wAng: IDLE_ANGLE[weapon], offX: 0, offY: 0, rot: 0, alpha: 1, flash: 0,
      hp: 1, shown: 1, dead: false, busy: false, cd: 0.6 + Math.random() * 1.8, phase: Math.random() * 6,
      ranged: weapon === 'staff' || weapon === 'bow',
    };
  };
  const F = [...blue.slice(0, 4).map((m, j) => mk(m, 0, j)), ...red.slice(0, 4).map((m, j) => mk(m, 1, j))];
  const baseX = (f) => f.slotX * W;
  const posX = (f) => baseX(f) + f.offX * f.dir;
  const footY = (f) => GROUND + f.dy + f.offY;
  const mid = (f) => ({ x: posX(f), y: footY(f) - HERO_H * SC * 0.55 });

  function hurt(T, f) {
    if (T.dead) return;
    const crit = Math.random() < 0.15;
    const dmg = (0.14 + Math.random() * 0.16) * (crit ? 1.8 : 1);
    T.hp = Math.max(0, T.hp - dmg);
    T.flash = 1; tween(T, { flash: 0 }, 220, 'linear');
    tween(T, { offX: -8 }, 80).then(() => tween(T, { offX: 0 }, 200, 'outBack'));
    const c = mid(T);
    burst(c.x, c.y, crit ? 12 : 7, crit ? ['#fff', '#ffd84a'] : ['#fff', '#ff6b6b']);
    float(String(Math.round(dmg * 100 + Math.random() * 9)), c.x, c.y - 26, crit ? '#ffd84a' : '#ffffff', crit ? 12 : 9);
    shake = Math.max(shake, crit ? 4 : 2);
    if (T.hp <= 0) {
      T.dead = true;
      score[1 - T.side]++;
      tween(T, { rot: -85, alpha: 0.3 }, 500);
      setTimeout(() => { if (!alive) return; T.dead = false; T.hp = 1; T.rot = 0; tween(T, { alpha: 1 }, 400, 'linear'); }, 3200);
    }
  }

  async function act(f) {
    const foes = F.filter(x => x.side !== f.side && !x.dead);
    if (!foes.length) return;
    const T = foes[Math.floor(Math.random() * foes.length)];
    f.busy = true;
    f.pose = 'atk';
    if (f.ranged) {
      await tween(f, { wAng: f.idle - 25, offY: -4 }, 150);
      const from = { x: posX(f) + 10 * f.dir, y: footY(f) - HERO_H * SC * 0.6 }, to = mid(T);
      const p = { kind: 'shot', x: from.x, y: from.y, arrow: f.weapon === 'bow', angle: Math.atan2(to.y - from.y, to.x - from.x), life: 1e9, max: 1e9 };
      effects.push(p);
      const o = { t: 0 };
      await new Promise(res => tweens.push({ obj: o, from: { t: 0 }, to: { t: 1 }, dur: 320, t: 0, ease: EASE.linear, res,
        onStep: () => { p.x = from.x + (to.x - from.x) * o.t; p.y = from.y + (to.y - from.y) * o.t - (p.arrow ? 20 * Math.sin(Math.PI * o.t) : 0); } }));
      p.life = 0;
      hurt(T, f);
      await tween(f, { wAng: f.idle, offY: 0 }, 200);
    } else {
      const dist = Math.abs(baseX(T) - baseX(f)) - HERO_W * SC * 0.9;
      await tween(f, { offX: dist }, 340, 'inOutQuad');
      await tween(f, { wAng: -80 }, 110);
      await tween(f, { wAng: 130 }, 80, 'inQuad');
      const c = mid(T);
      effects.push({ kind: 'slash', x: c.x - 4 * f.dir, y: c.y, dir: f.dir, life: 200, max: 200 });
      hurt(T, f);
      await wait(150);
      await tween(f, { offX: 0, wAng: f.idle }, 320, 'inOutQuad');
    }
    f.busy = false;
    f.pose = 'idle';
    f.cd = 1.3 + Math.random() * 1.8;
  }

  function update(dt) {
    time += dt / 1000;
    for (let j = tweens.length - 1; j >= 0; j--) {
      const tw = tweens[j];
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.dur), ev = tw.ease(p);
      for (const key in tw.to) tw.obj[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * ev;
      if (tw.onStep) tw.onStep();
      if (p >= 1) { tweens.splice(j, 1); tw.res(); }
    }
    const s = dt / 1000;
    for (let j = effects.length - 1; j >= 0; j--) {
      const e = effects[j];
      e.life -= dt;
      if (e.kind === 'p') { e.vy += 260 * s; e.x += e.vx * s; e.y += e.vy * s; }
      if (e.life <= 0) effects.splice(j, 1);
    }
    for (let j = texts.length - 1; j >= 0; j--) { const t = texts[j]; t.life -= dt; t.y += t.vy * s; if (t.life <= 0) texts.splice(j, 1); }
    shake = Math.max(0, shake - s * 20);
    for (const f of F) {
      f.shown += (f.hp - f.shown) * Math.min(1, s * 8);
      if (f.dead || f.busy) continue;
      f.cd -= s;
      if (f.cd <= 0) act(f);
    }
  }

  function drawOne(f) {
    const x = posX(f), y = footY(f) + Math.sin(time * 3 + f.phase) * 1;
    const SW = HERO_W * SC, SH = HERO_H * SC;
    ctx.globalAlpha = 0.25 * f.alpha; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, footY(f) + 2, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = f.alpha;
    ctx.save();
    ctx.translate(x, y); ctx.scale(f.dir, 1);
    ctx.translate(0, -SH / 2); ctx.rotate((f.rot * Math.PI) / 180); ctx.translate(0, SH / 2);
    const body = f.pose === 'atk' ? f.spriteAtk : f.sprite;
    ctx.drawImage(body, -SW / 2, -SH, SW, SH);
    if (f.flash > 0.01) { ctx.globalAlpha = f.flash * f.alpha; ctx.drawImage(whiteOf(body), -SW / 2, -SH, SW, SH); ctx.globalAlpha = f.alpha; }
    const H = handOf(f.pose);
    ctx.translate(-SW / 2 + H.x * SC, -SH + H.y * SC);
    ctx.rotate((f.wAng * Math.PI) / 180);
    ctx.drawImage(f.wS, -f.pivot[0] * SC, -f.pivot[1] * SC, lw(f.wS) * SC, lh(f.wS) * SC);
    ctx.restore();
    // nom + barre de vie
    if (!f.dead) {
      const top = footY(f) - SH - 6;
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#16121f'; ctx.fillRect(x - 17, top, 34, 5);
      ctx.fillStyle = colors[f.side]; ctx.fillRect(x - 16, top + 1, 32 * Math.max(0, f.shown), 3);
      ctx.font = `6px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.lineWidth = 3; ctx.strokeStyle = '#16121f';
      const name = String(f.name || '').slice(0, 9);
      ctx.strokeText(name, x, top - 3); ctx.fillStyle = '#ffffff'; ctx.fillText(name, x, top - 3);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    const bg = background('castle');
    const sb = (W + 12) / 160, top = GROUND - 75 * sb;
    ctx.fillStyle = THEMES.castle.sky[0]; ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.drawImage(bg, -6, top, W + 12, 90 * sb);
    [...F].sort((a, b) => a.dy - b.dy).forEach(drawOne);
    for (const e of effects) {
      const p = 1 - e.life / e.max;
      if (e.kind === 'p') { ctx.globalAlpha = Math.max(0, e.life / e.max); ctx.fillStyle = e.color; ctx.fillRect(e.x - 1.5, e.y - 1.5, 3, 3); }
      else if (e.kind === 'slash') {
        ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
        const a0 = e.dir > 0 ? -1.9 : Math.PI + 1.9, a1 = e.dir > 0 ? 0.9 : Math.PI - 0.9;
        ctx.arc(e.x, e.y, 26, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
      } else if (e.kind === 'shot') {
        ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(e.x, e.y);
        if (e.arrow) { ctx.rotate(e.angle); ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-10, -1, 14, 2); ctx.fillStyle = '#e8eef5'; ctx.fillRect(3, -2, 4, 4); }
        else { ctx.fillStyle = '#8a3bd1'; ctx.fillRect(-4, -4, 8, 8); ctx.fillStyle = '#e0c8ff'; ctx.fillRect(-2, -2, 4, 4); }
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    for (const t of texts) {
      ctx.globalAlpha = Math.min(1, t.life / 300);
      ctx.font = `${t.size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3; ctx.strokeStyle = '#16121f'; ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // tableau des K.O.
    ctx.font = `9px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.lineWidth = 3; ctx.strokeStyle = '#16121f';
    ctx.textAlign = 'left'; ctx.strokeText(`K.O. ${score[0]}`, 10, 16); ctx.fillStyle = colors[0]; ctx.fillText(`K.O. ${score[0]}`, 10, 16);
    ctx.textAlign = 'right'; ctx.strokeText(`K.O. ${score[1]}`, W - 10, 16); ctx.fillStyle = colors[1]; ctx.fillText(`K.O. ${score[1]}`, W - 10, 16);
  }

  function frame(now) {
    if (!alive) return;
    if (!canvas.isConnected) { stop(); return; }
    const dt = Math.min(50, now - last);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  function stop() { alive = false; ro.disconnect(); }
  requestAnimationFrame(frame);
  return stop;
}
