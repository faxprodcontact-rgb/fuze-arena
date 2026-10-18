// =====================================================================
//  PIXEL ART — tous les dessins du jeu sont générés ici, pixel par pixel
// =====================================================================
import { ITEMS, RARITIES, COSMETIC, SPELLS } from './data.js?v=20261018144729';

const OUT = '#16121f';
const cache = new Map();

// ---------- outils de grille ----------
function grid(w, h) { return { w, h, p: new Array(w * h).fill(null) }; }
function set(g, x, y, c) { if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.p[y * g.w + x] = c; }
function get(g, x, y) { return (x < 0 || y < 0 || x >= g.w || y >= g.h) ? null : g.p[y * g.w + x]; }
function rect(g, x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, c); }
function outline(g, c = OUT) {
  const o = { w: g.w, h: g.h, p: g.p.slice() };
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (!get(g, x, y) && (get(g, x - 1, y) || get(g, x + 1, y) || get(g, x, y - 1) || get(g, x, y + 1))) o.p[y * g.w + x] = c;
  }
  return o;
}
function fromMap(rows, pal) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const g = grid(w + 2, h + 2);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) set(g, x + 1, y + 1, pal[ch]); }));
  return g;
}
function toCanvas(g, u = 1) {
  const c = document.createElement('canvas');
  c.width = g.w; c.height = g.h;
  c.lw = g.w / u; c.lh = g.h / u;   // taille « logique » (en pixels du dessin d'origine)
  const ctx = c.getContext('2d');
  g.p.forEach((col, i) => { if (col) { ctx.fillStyle = col; ctx.fillRect(i % g.w, Math.floor(i / g.w), 1, 1); } });
  return c;
}

// =====================================================================
//  RENDU HD — chaque dessin est affiné automatiquement :
//  1. lissage des diagonales (×2, algorithme Scale2x)
//  2. volume : reflets en haut à gauche, ombres en bas à droite, léger dégradé
//  3. contour en 2 épaisseurs : une teinte sombre de la couleur voisine, puis le noir
// =====================================================================
export const U = 2;
/** Taille logique d'un dessin (les dessins HD sont 2× plus fins mais gardent la même taille à l'écran) */
export const lw = (c) => c.lw || c.width;
export const lh = (c) => c.lh || c.height;

function scale2x(g) {
  const o = grid(g.w * 2, g.h * 2);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const P = get(g, x, y), A = get(g, x, y - 1), B = get(g, x + 1, y), C = get(g, x - 1, y), D = get(g, x, y + 1);
    let e0 = P, e1 = P, e2 = P, e3 = P;
    if (C === A && C !== D && A !== B) e0 = A;
    if (A === B && A !== C && B !== D) e1 = B;
    if (D === C && D !== B && C !== A) e2 = C;
    if (B === D && B !== A && D !== C) e3 = D;
    set(o, x * 2, y * 2, e0); set(o, x * 2 + 1, y * 2, e1); set(o, x * 2, y * 2 + 1, e2); set(o, x * 2 + 1, y * 2 + 1, e3);
  }
  return o;
}
function upscale(g, k = 2) {
  const o = grid(g.w * k, g.h * k);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) set(o, x, y, get(g, Math.floor(x / k), Math.floor(y / k)));
  return o;
}

const shadeCache = new Map();
function shadeC(hex, amt) {
  const k = hex + amt.toFixed(2);
  if (!shadeCache.has(k)) shadeCache.set(k, shade(hex, amt));
  return shadeCache.get(k);
}

function lighting(g, k = 1) {
  const o = { w: g.w, h: g.h, p: g.p.slice() };
  let top = g.h, bot = 0;
  for (let i = 0; i < g.p.length; i++) if (g.p[i]) { const y = Math.floor(i / g.w); top = Math.min(top, y); bot = Math.max(bot, y); }
  const span = Math.max(1, bot - top);
  // distance jusqu'au vide dans une direction (0 = pas de vide à moins de n pixels)
  const gap = (x, y, dx, dy, n) => { for (let d = 1; d <= n; d++) if (!get(g, x + dx * d, y + dy * d)) return d; return 0; };
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const c = get(g, x, y);
    if (!c) continue;
    const up = get(g, x, y - 1), dn = get(g, x, y + 1);
    let a = 0.12 * (1 - (2 * (y - top)) / span);             // dégradé : plus clair en haut
    const gu = gap(x, y, 0, -1, 2 * k), gd = gap(x, y, 0, 1, 2 * k), gl = gap(x, y, -1, 0, 2 * k), gr = gap(x, y, 1, 0, 2 * k);
    if (gu) a += gu <= k ? 0.34 : 0.16; else if (up !== c) a += 0.07;
    if (gd) a -= gd <= k ? 0.32 : 0.15; else if (dn !== c) a -= 0.08;
    if (gl) a += gl <= k ? 0.12 : 0.05;
    if (gr) a -= gr <= k ? 0.16 : 0.07;
    if (k > 1 && gu && gl && gu <= k && gl <= 2 * k) a += 0.15;   // petit reflet brillant en haut à gauche
    if (Math.abs(a) > 0.015) o.p[y * g.w + x] = shadeC(c, Math.max(-0.5, Math.min(0.55, a)));
  }
  return o;
}

function outline2(g, w = 1) {
  const ring = (src, colorOf) => {
    const o = { w: src.w, h: src.h, p: src.p.slice() };
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      if (get(src, x, y)) continue;
      const n = get(src, x, y + 1) || get(src, x, y - 1) || get(src, x - 1, y) || get(src, x + 1, y);
      if (n) o.p[y * src.w + x] = colorOf(n);
    }
    return o;
  };
  let out = g;
  for (let i = 0; i < w; i++) out = ring(out, (n) => (n === OUT ? OUT : shadeC(n, -0.72)));
  for (let i = 0; i < w; i++) out = ring(out, () => OUT);
  return out;
}

/** Dessin HD complet à partir d'une grille de pixels */
function render(g) { return toCanvas(outline2(lighting(scale2x(g))), U); }
/** Très haute définition (×4, encore plus lisse) : pour les icônes, les familiers, les coffres et la monnaie */
function renderHi(g) { return toCanvas(outline2(lighting(scale2x(scale2x(g)), 2), 2), 4); }
function cached(key, fn) { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); }

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

/** Version blanche d'un sprite (flash quand on est touché) */
export function whiteOf(src) {
  return cached(src, () => {
    const c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    c.lw = lw(src); c.lh = lh(src);
    return c;
  });
}

// =====================================================================
//  HÉROS (vue de profil, regard vers la droite)
// =====================================================================
const LOOKS = {
  guerrier: { skin: '#f1c08f', hair: '#5a3a22', body: '#9aa3ad', accent: '#c0392b', legs: '#4a4f57', boots: '#3b2a20', sleeve: '#8a939e', head: 'helmet', headC: '#aeb6c0', headA: '#d63031' },
  mage: { skin: '#f1c08f', hair: '#d9d9e3', body: '#5b3fa8', accent: '#e5b33a', legs: '#5b3fa8', boots: '#2b2140', sleeve: '#4e3594', head: 'wizard', headC: '#4a2f91', headA: '#ffd84a', robe: true, beard: '#ececf4' },
  archer: { skin: '#e8b58a', hair: '#7a4e2a', body: '#4e8c3c', accent: '#7a4e2a', legs: '#6b4a2b', boots: '#3b2a20', sleeve: '#3f7d3a', head: 'hood', headC: '#3f7d3a', quiver: true },
  paladin: { skin: '#f1c08f', hair: '#e8c25a', body: '#e8e1cf', accent: '#2e5aa8', legs: '#8c8f99', boots: '#6b5a3a', sleeve: '#d4ccb5', head: 'circlet', headC: '#e5b33a', cape: '#2e5aa8' },
};
export const HAND = { x: 15.5, y: 17.5 };   // point où l'arme est tenue (garde) : assez en avant pour dégager le visage
// Inclinaison de l'arme en garde (en degrés, vers l'avant)
export const IDLE_ANGLE = { sword: 38, staff: 16, bow: 26, hammer: 34 };
export const HAND_ATK = { x: 16.5, y: 14.5 };   // pose d'attaque : bras tendu vers l'avant
export const HERO_W = 22, HERO_H = 28;
export const handOf = (pose) => (pose === 'atk' ? HAND_ATK : HAND);

// Petits outils de dessin (grille 2× plus fine que la taille logique du héros)
function ellipse(g, cx, cy, rx, ry, c) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
    if (dx * dx + dy * dy <= 1) set(g, x, y, c);
  }
}
function tri(g, pts, c) {   // triangle plein
  const [[x1, y1], [x2, y2], [x3, y3]] = pts;
  const minX = Math.floor(Math.min(x1, x2, x3)), maxX = Math.ceil(Math.max(x1, x2, x3));
  const minY = Math.floor(Math.min(y1, y2, y3)), maxY = Math.ceil(Math.max(y1, y2, y3));
  const sgn = (ax, ay, bx, by, cx, cy) => (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const px = x + 0.5, py = y + 0.5;
    const d1 = sgn(px, py, x1, y1, x2, y2), d2 = sgn(px, py, x2, y2, x3, y3), d3 = sgn(px, py, x3, y3, x1, y1);
    if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) set(g, x, y, c);
  }
}

/**
 * Dessin d'un héros (vue de profil, regard vers la droite), en haute définition.
 * dyeId = teinture achetée à la boutique ; pose = 'idle' (garde) ou 'atk' (attaque : penché en avant, bras tendu).
 */
export function heroCanvas(classId, dyeId = null, pose = 'idle') {
  return cached(`hero2:${classId}:${dyeId || ''}:${pose}`, () => {
    const dye = dyeId && COSMETIC[dyeId] ? COSMETIC[dyeId].dye : null;
    const L = { ...LOOKS[classId], ...(dye || {}) };
    const g = grid(HERO_W * 2, HERO_H * 2);
    const atk = pose === 'atk';
    const ux = atk ? 3 : 0, uy = atk ? 1 : 0;            // le haut du corps se penche en avant
    const R = (x, y, w, h, c) => rect(g, x + ux, y + uy, w, h, c);   // haut du corps
    const skin = L.skin, skinD = shade(L.skin, -0.18), eye = '#1b1530';
    const robe = !!L.robe;

    // --- cape (paladin) et carquois (archer), derrière tout le reste
    if (L.cape) {
      const cp = shade(L.cape, -0.1);
      tri(g, [[14 + ux, 24 + uy], [21 + ux, 24 + uy], [5 + (atk ? 0 : 2), 48]], cp);
      rect(g, 6 + (atk ? -1 : 1), 46, 6, 3, shade(L.cape, -0.3));
    }
    if (L.quiver) {
      R(9, 18, 5, 17, '#7a4e2a'); R(9, 18, 1, 17, '#5a3a1e'); R(9, 21, 5, 1, '#c99a5b'); R(9, 31, 5, 1, '#c99a5b');
      R(9, 14, 1, 4, '#eeeeee'); R(11, 13, 1, 5, '#eeeeee'); R(13, 15, 1, 3, '#eeeeee');
      R(8, 13, 2, 2, '#d63031'); R(10, 12, 2, 2, '#d63031'); R(12, 14, 2, 2, '#d63031');
    }

    // --- jambes et bottes (les jambes s'écartent en pose d'attaque)
    if (!robe) {
      const bl = atk ? -3 : 0, fl = atk ? 3 : 0;
      const legD = shade(L.legs, -0.3), bootD = shade(L.boots, -0.25);
      rect(g, 15 + bl, 38, 5, 9, legD); rect(g, 14 + bl, 46, 7, 4, bootD); rect(g, 14 + bl, 49, 7, 1, shade(bootD, -0.4));
      rect(g, 22 + fl, 38, 5, 9, L.legs); rect(g, 22 + fl, 46, 7, 4, L.boots); rect(g, 22 + fl, 49, 7, 1, shade(L.boots, -0.45));
      rect(g, 22 + fl, 46, 7, 1, shade(L.boots, 0.25));
      if (classId === 'paladin' || classId === 'guerrier') { rect(g, 22 + fl, 41, 5, 2, shade(L.legs, 0.3)); rect(g, 15 + bl, 41, 5, 2, shade(legD, 0.2)); }   // genouillères
    }

    // --- bras arrière
    R(11, 25, 4, 9, shade(L.sleeve, -0.32)); R(11, 33, 4, 3, shade(skin, -0.25));

    // --- torse (ou robe du mage)
    if (robe) {
      tri(g, [[14 + ux, 24 + uy], [28 + ux, 24 + uy], [33, 50]], L.body);
      tri(g, [[14 + ux, 24 + uy], [33, 50], [9, 50]], L.body);
      tri(g, [[14 + ux, 24 + uy], [16 + ux, 24 + uy], [9, 50]], shade(L.body, -0.2));
      R(14, 24, 15, 14, L.body);
      rect(g, 9, 48, 25, 2, L.accent);                     // ourlet doré
      tri(g, [[21 + ux, 30 + uy], [23 + ux, 30 + uy], [22, 48]], L.accent);
      R(14, 35, 15, 2, L.accent); R(21, 35, 2, 2, shade(L.accent, 0.4));   // ceinture
      rect(g, 13, 50, 6, 2, shade(L.boots, -0.1)); rect(g, 24, 50, 7, 2, L.boots);   // bouts des chaussures
    } else {
      R(14, 24, 15, 14, L.body);
      R(14, 24, 2, 14, shade(L.body, -0.22)); R(27, 25, 2, 12, shade(L.body, 0.18));
      R(14, 36, 15, 2, '#5a3a22'); R(20, 36, 3, 2, '#e5b33a');   // ceinture + boucle
    }
    if (classId === 'guerrier') {
      R(18, 25, 7, 11, L.accent); R(18, 25, 7, 1, shade(L.accent, 0.3)); R(18, 35, 7, 1, shade(L.accent, -0.3));
      R(17, 25, 1, 11, '#e5b33a'); R(25, 25, 1, 11, '#e5b33a');
      ellipse(g, 15 + ux, 25 + uy, 3.5, 2.5, L.headC); ellipse(g, 27 + ux, 25 + uy, 3.5, 2.5, L.headC);   // épaulières
      R(13, 24, 4, 1, shade(L.headC, 0.35)); R(25, 24, 4, 1, shade(L.headC, 0.35));
    }
    if (classId === 'paladin') {
      R(17, 25, 9, 11, L.accent === '#2e5aa8' ? '#e8e1cf' : shade(L.body, 0.15));
      R(20, 26, 3, 9, '#e5b33a'); R(18, 28, 7, 3, '#e5b33a'); R(21, 27, 1, 7, '#fff3b0');
      ellipse(g, 15 + ux, 25 + uy, 3.5, 2.5, '#c3cad3'); ellipse(g, 27 + ux, 25 + uy, 3.5, 2.5, '#c3cad3');
    }
    if (classId === 'archer') {
      for (let i = 0; i < 12; i++) R(15 + i, 24 + i, 2, 2, '#7a4e2a');   // bandoulière
      R(14, 24, 15, 2, shade(L.body, 0.2));
    }
    if (classId === 'mage') { R(16, 24, 11, 3, L.accent); R(17, 25, 9, 1, shade(L.accent, 0.4)); }   // col doré

    // --- cou et tête
    R(19, 21, 5, 3, skinD);
    ellipse(g, 21.5 + ux, 15 + uy, 7.5, 7, skin);
    R(27, 15, 2, 3, skinD);                                   // nez
    R(18, 14, 2, 3, skinD); R(18, 15, 1, 1, shade(skin, -0.35));   // oreille
    // cheveux (derrière et dessus)
    if (L.hair) { ellipse(g, 19.5 + ux, 11 + uy, 7, 4, L.hair); R(14, 11, 4, 7, L.hair); R(15, 18, 2, 2, shade(L.hair, -0.2)); }
    let eyeY = 14;

    // --- couvre-chef
    if (L.head === 'helmet') {
      ellipse(g, 21.5 + ux, 11 + uy, 9, 6.5, L.headC);
      R(12, 12, 19, 3, L.headC); R(12, 14, 6, 6, L.headC);
      R(12, 14, 19, 1, shade(L.headC, -0.35));                // rebord
      R(26, 12, 2, 8, shade(L.headC, -0.15));                 // nasal
      R(16, 7, 8, 1, shade(L.headC, 0.45)); R(14, 9, 3, 2, shade(L.headC, 0.3));
      R(15, 12, 1, 1, '#ffffff');
      // plumet
      R(18, 1, 6, 4, L.headA); R(16, 2, 3, 5, L.headA); R(14, 4, 3, 5, shade(L.headA, -0.2)); R(19, 1, 4, 1, shade(L.headA, 0.35));
      eyeY = 16;
    } else if (L.head === 'wizard') {
      R(9, 9, 25, 3, L.headC); R(9, 11, 25, 1, shade(L.headC, -0.35));          // bord du chapeau
      tri(g, [[13 + ux, 9 + uy], [29 + ux, 9 + uy], [8 + ux, 1]], L.headC);
      tri(g, [[13 + ux, 9 + uy], [18 + ux, 9 + uy], [8 + ux, 1]], shade(L.headC, -0.2));
      R(14, 7, 15, 2, L.headA); R(20, 7, 3, 2, shade(L.headA, 0.4));           // ruban doré
      R(17, 3, 2, 2, L.headA); set(g, 18 + ux, 2 + uy, '#ffffff');
      // longue barbe
      tri(g, [[20 + ux, 18 + uy], [30 + ux, 18 + uy], [26 + ux, 34 + uy]], L.beard);
      R(21, 18, 9, 4, L.beard); R(25, 22, 3, 8, shade(L.beard, -0.08));
      R(23, 19, 3, 1, '#c9c9d6');                                              // moustache
    } else if (L.head === 'hood') {
      ellipse(g, 20.5 + ux, 13 + uy, 9, 8.5, L.headC);
      tri(g, [[12 + ux, 12 + uy], [16 + ux, 22 + uy], [9 + ux, 26 + uy]], L.headC);   // la capuche retombe dans le dos
      ellipse(g, 23.5 + ux, 16 + uy, 5, 5, skin);             // ouverture du visage
      R(19, 10, 10, 2, shade(L.headC, -0.3));                 // ombre de la capuche sur le front
      R(15, 6, 9, 1, shade(L.headC, 0.3));
      R(27, 15, 2, 3, skinD);
    } else if (L.head === 'circlet') {
      ellipse(g, 20 + ux, 11 + uy, 8, 5, L.hair); R(13, 12, 5, 11, L.hair); R(13, 20, 3, 4, shade(L.hair, -0.15));
      R(15, 11, 15, 2, L.headC); R(24, 11, 3, 2, '#4fc3f7'); set(g, 25 + ux, 11 + uy, '#e0f7ff');
      eyeY = 15;
    }
    // yeux, sourcils, bouche
    R(23, eyeY, 2, 2, eye); set(g, 24 + ux, eyeY + uy, '#ffffff');
    R(27, eyeY, 1, 2, eye);
    if (L.head !== 'helmet') R(22, eyeY - 2, 3, 1, shade(L.hair || '#5a3a22', -0.3));
    if (L.head !== 'wizard') R(24, 19, 3, 1, atk ? '#8e2b2b' : shade(skin, -0.35));
    if (atk && L.head !== 'wizard') R(25, 20, 1, 1, '#8e2b2b');     // cri de combat

    // --- bras avant (tendu en pose d'attaque)
    if (atk) {
      R(24, 25, 6, 4, L.sleeve); R(29, 25, 4, 3, L.sleeve); R(31, 26, 3, 4, skin); R(32, 26, 2, 1, shade(skin, 0.2));
    } else {
      R(24, 25, 4, 7, L.sleeve); R(25, 25, 2, 1, shade(L.sleeve, 0.25)); R(26, 30, 4, 4, L.sleeve); R(29, 33, 4, 4, skin); R(30, 32, 2, 1, skin);
    }
    return toCanvas(outline2(lighting(g)), U);
  });
}

// =====================================================================
//  ARMES (tenues à la main, pivot = poignée)
// =====================================================================
const WEAPON_MAPS = {
  sword: {
    rows: ['..w..', '.lwl.', '.lwl.', '.lwl.', '.lwl.', '.lwl.', '.lwl.', '.lwl.', '.lwl.', '.lwl.', 'ggggg', '..b..', '..b..', '..b..', '..g..'],
    pal: { w: '#f4f8fc', l: '#aab4c0', g: '#d4a437', b: '#6b4423' }, pivot: [3, 13],
  },
  staff: {
    rows: ['.ccc.', 'cwcCc', 'ccccc', '.cCc.', '.g.g.', '..b..', '..b..', '..b..', '..b..', '..b..', '..b..', '..b..', '..b..', '..b..', '..b..', '..b..', '..b..', '..d..'],
    pal: { c: '#6fe3ff', C: '#2ab0e0', w: '#ffffff', g: '#d4a437', b: '#7a4e2a', d: '#4a2f1a' }, pivot: [3, 12],
  },
  bow: {
    rows: ['bb....', '.sb...', '.s.b..', '.s..b.', '.s..b.', '.s...b', '.s...b', '.s...g', '.s...b', '.s...b', '.s..b.', '.s..b.', '.s.b..', '.sb...', 'bb....'],
    pal: { b: '#8a5a2b', s: '#e8e8e8', g: '#d4a437' }, pivot: [6, 8],
  },
  hammer: {
    rows: ['lllllll', 'lwwwwll', 'lmmmmml', 'lmmmmml', 'ddddddd', '...b...', '...b...', '...b...', '...b...', '...b...', '...b...', '...b...', '...g...'],
    pal: { l: '#c3cad3', w: '#eef2f6', m: '#8f96a0', d: '#5c6670', b: '#7a4e2a', g: '#e5b33a' }, pivot: [4, 11],
  },
};
export function weaponCanvas(kind) {
  return cached('weapon:' + kind, () => {
    const w = WEAPON_MAPS[kind];
    return renderHi(fromMap(w.rows, w.pal));
  });
}
export function weaponPivot(kind) { return WEAPON_MAPS[kind].pivot; }

// =====================================================================
//  FAMILIERS
// =====================================================================
const PET_MAPS = {
  slime: ['...mmmm...', '..mmmmlm..', '.mmmmmmlm.', '.mmemmemm.', 'mmmmmmmmmm', 'mmmmmmmmmm', '.dddddddd.'],
  chick: ['..mmmm...', '.mmmmmm..', '.mmmemmoo', 'mmmmmmm..', 'dmmmmmm..', '.dmmmmm..', '..mmmm...', '..o..o...'],
  bat: ['d....mmm....d', 'dd..mmmmm..dd', 'ddd.memem.ddd', '.ddmmmmmmmdd.', '..d.mmmmm.d..', '.....m.m.....'],
  wisp: ['....l....', '...lml...', '..lmml...', '.lmmmml..', '.mmemem..', '.mmmmmm..', '..mmmm...', '...mm....'],
};
export function petCanvas(itemId) {
  return cached('pet:' + itemId, () => {
    const it = ITEMS[itemId];
    const [m, l] = it.colors;
    const pal = { m, l, d: shade(m, -0.35), e: it.eye || '#1b1530', o: '#ff9f43', w: '#fff', k: shade(m, -0.55), p: '#ff8fa3', n: '#1b1530' };
    return renderHi(fromMap(PET_MAPS[it.icon], pal));
  });
}

// =====================================================================
//  BOSS DE DONJON (regard vers la droite)
// =====================================================================
const MONSTERS = {
  slimeKing: {
    pal: { m: '#4cd964', l: '#a8f0a0', d: '#2a9a45', w: '#ffffff', e: '#1b1530', y: '#ffd84a', Y: '#e5a92a', r: '#d63031' },
    rows: [
      '.......y.y.y......', '.......yYyYy......', '.......yyyyy......', '.....mmmmmmmmm....', '...mmmmmmmmmmlmm..',
      '..mmmmmmmmmmmmllm.', '.mmmmmmmmwwmmwwmm.', '.mmmmmmmmweemmwem.', 'mmmmmmmmmmmmmmmmmm', 'mmmmmmmmmmmrrrmmmm',
      'mmmmmmmmmmmmmmmmmm', 'dmmmmmmmmmmmmmmmmd', '.dddddddddddddddd.',
    ],
  },
  goblin: {
    pal: { m: '#7bc043', d: '#4e8a2a', w: '#ffffff', e: '#d63031', k: '#3b2a20', t: '#8a5a2b', T: '#6b4423', b: '#d4a437', c: '#a0703c', C: '#7a4e2a' },
    rows: [
      '......mmmm.........', '.....mmmmmm........', 'mm..mmmmmmmm..mm...', '.mmmmmmmmewmmewm...', '..mmmmmmmmmmmmm....',
      '....mmmmmmkkkkm....', '.....mmmmmwkwkm..cc', '......mmmmmm....ccc', '....tttttttttt..cC.', '...mttttttttttmcC..',
      '...mttttbttttt.mC..', '...m.TTTTTTTT......', '.....tttttttt......', '.....dd....dd......', '.....dd....dd......', '....ddd...ddd......',
    ],
  },
  skeleton: {
    pal: { w: '#ece6d6', s: '#bdb5a0', k: '#3a3344', r: '#ff3b3b', a: '#8f96a0', A: '#c3cad3' },
    rows: [
      '....wwwww.......', '...wwwwwww......', '...wwrwwrw......', '...wwwwwww......', '....wkwkw.......',
      '.....www.....A..', '...wwwwwww...A..', '..w.wkwkw.w..A..', '..w.wwwww.w..A..', '..w.wkwkw.w.aaa.',
      '..s.wwwww.s..a..', '.....s.s........', '....ww.ww.......', '....w...w.......', '....w...w.......', '...ww...ww......',
    ],
  },
  mushroom: {
    pal: { r: '#9b59b6', R: '#6c3483', w: '#b8f5a0', s: '#efe2c4', S: '#cdbd98', e: '#1b1530', k: '#5a3a5e' },
    rows: [
      '.....rrrrrrr......', '...rrrwwrrrrrr....', '..rrrrwwrrrrwwr...', '.rrwwrrrrrrrwwrr..', '.rrwwrrrrwwrrrrr..',
      'rrrrrrrrrwwrrrrrr.', 'RRRRRRRRRRRRRRRRR.', '....sssssssss.....', '....sssssesses....', '....sssssssss.....',
      '....sssskkkss.....', '....Sssssssss.....', '...SSsssssssss....', '..SSS.......sss...',
    ],
  },
  golem: {
    pal: { m: '#8d8a84', l: '#b3b0a8', d: '#5f5c57', y: '#7ff0ff', g: '#5aa04a' },
    rows: [
      '......mmmmmm........', '.....mlllllmm.......', '.....mlmmmmmm.......', '.....mmmmyymy.......', '.....mmmmmmmm.......',
      '..ggmmmmmmmmmmmm....', '.mmlmmmmmmmmmmlmm...', 'mmlmmmmddmmmmmmlmm..', 'mmmmm.mmmmmmmm.mmm..', 'mmmm..mmmyymmm..mmm.',
      'mmm...mmmmmmmm...mm.', 'ddd...mmmmmmmm...ddd', '......mmm..mmm......', '......mmm..mmm......', '.....mmmm..mmmm.....', '.....dddd..dddd.....',
    ],
  },
  ghost: {
    pal: { m: '#d6d4ff', l: '#ffffff', d: '#9c98e0', k: '#2a2050' },
    rows: [
      '.....mmmmmm.....', '...mmlllmmmmm...', '..mmllmmmmmmmm..', '.mmlmmmmmmmmmmm.', '.mmmmmmmkkmmkkm.',
      '.mmmmmmmkkmmkkm.', '.mmmmmmmmmmmmmm.', '.mmmmmmmmkkkkmm.', 'mmmmmmmmmmkkmmm.', 'mmmmmmmmmmmmmmmm',
      'dmmmmmmmmmmmmmmm', '.dmmmmmmmmmmmmm.', '.ddmmmmmmmmmmmd.', '.dd.dmmm.dmm.dd.', '.d...dd...d...d.',
    ],
  },
  fireElem: {
    pal: { y: '#ffe08a', o: '#ff9f43', r: '#ff5e3a', R: '#c0392b', w: '#ffffff', k: '#3a1a10' },
    rows: [
      '......y.....y...', '.....yy....yy...', '....yoy...yoy...', '....yooy.yooy...', '...yoooyyoooy...',
      '...yoorrrrooy...', '..yoorrrrrrooy..', '..yorrrwkrrwkry.', '..yorrrrrrrrroy.', '..yorrrRkkRrroy.',
      '...yorrrrrrroy..', '...yoorrrrrooy..', '....yoorrrooy...', '.....yoorrooy...', '......yoooy.....', '.......yoy......', '........y.......',
    ],
  },
  yeti: {
    pal: { w: '#f4f8ff', s: '#c9d6ea', b: '#6fa8dc', B: '#3d78b0', k: '#1b1530', W: '#ffffff' },
    rows: [
      '.....wwwwwww......', '....wwwwwwwww.....', '...wwwwbbbbbww....', '...wwwbbkbbkbw....', '...wwwbbbbbbbw....',
      '...wwwbbWWWWbw....', '....wwwbbbbbw.....', '..wwwwwwwwwwwwww..', '.wwwwwwwwwwwwwwww.', 'wwwswwwwwwwwwwswww',
      'www.wwwwwwwwww.www', 'bbb.wwwwwwwwww.bbb', '....swwwwwwwws....', '....wwww..wwww....', '....wwww..wwww....', '...BBBBB..BBBBB...',
    ],
  },
  vampire: {
    pal: { k: '#2a2238', s: '#e8e0f0', r: '#c0392b', R: '#8e2b2b', e: '#ff3b3b', w: '#ffffff', y: '#e5b33a' },
    rows: [
      '....kkkkk.....', '...kkkkkkk....', '...kssssskk...', '..ksseesesk...', '...sssssss....',
      '...sswswss....', '....sssss.....', '..RRkkkkkkRR..', '.RRRkwwwwkRRR.', 'RRRRkwyywkRRRR',
      'RRRrkwwwwkrRRR', 'RRr.kkkkkk.rRR', 'RRr.kkkkkk.rRR', 'Rr..kkkkkk..rR', 'r...kk..kk...r', '....kk..kk....', '...kkk..kkk...',
    ],
  },
  demon: {
    pal: { r: '#c0392b', l: '#e55a4a', y: '#ffd84a', k: '#1b1530', w: '#ffffff', d: '#4a1d5c', D: '#6c2a85', h: '#3a3344' },
    rows: [
      '..h..............h..', '..hh....rrrr....hh..', '...hh..rrrrrr..hh...', '....hrrrrrrrrrrh....', '.....rrryrryrrr.....',
      '.....rrrrrrrrrr.....', '......rrkkkkrr......', 'D.....rrwrrwrr.....D', 'DD..rrrrrrrrrrrr..DD', 'DDd.rrrrrrrrrrrr.dDD',
      'DDdrrrlrrrrrrlrrrdDD', 'Ddrrr.rrrrrrrr.rrrdD', 'd.rr..rrrrrrrr..rr.d', '......rrrrrrrr......', '......rrr..rrr......',
      '......rrr..rrr......', '.....kkkk..kkkk.....',
    ],
  },
  dragon: {
    pal: { m: '#c0392b', l: '#f5b041', d: '#7b241c', D: '#a93226', y: '#ffd84a', e: '#1b1530', w: '#ffffff', k: '#2a1a10' },
    rows: [
      '..................kk........', '.................mmk.........', '................mmmm.........', '...............mmyemm........',
      '........dd....mmmmmmmmmm.....', '.......dddd...mmmmmmwkwkw....', '......dDDDdd..mmmmmmmmmm.....', '.....dDDDDDd..mmmmm..........',
      '....dDDDDDDd.mmmmm...........', '...dDDDDDDDmmmmmm............', '..dddddddmmmmmmmm............', '.....mmmmmmmmmmmmm...........',
      '...mmmmllllllmmmmm...........', '.mmmmmllllllllmmmm...........', 'mmm..mllllllllmmm............', 'm....mmmmmmmmmmm.............',
      '.....mm..mm..mm..............', '....mmm.mmm.mmm..............',
    ],
  },
};

// ---------- Monstres supplémentaires (un 2e boss possible par donjon) ----------
Object.assign(MONSTERS, {
  rat: {
    pal: { m: '#8d7f74', l: '#b3a497', d: '#5e534b', p: '#ff9fb0', e: '#ff3b3b', w: '#ffffff', k: '#1b1530' },
    rows: ['..........pp......', '.........pmmp.....', '........mmmmm.....', '.......mmmmemm....', '......mmmmmmmmmp..', '.....mmmmmmmmmwkp.',
      '..mmmmmmmmmmmmw...', '.mmmmlllmmmmmm....', 'mmmlllllmmmmmm....', 'mmmmmmmmmmmmm.....', 'pmmdmmmmmmdmm.....', 'p.mdd....mdd......', '.p................'],
  },
  wolf: {
    pal: { m: '#7d8796', l: '#c9d1da', d: '#4a5260', e: '#ffd84a', k: '#1b1530', w: '#ffffff' },
    rows: ['...........m..m...', '..........mm.mm...', '..........mmmmm...', '.........mmmemmmk.', '.........mmmmmmmm.', '....mmmmmmmmmlwl..',
      '..mmmmmmmmmmmll...', '.mmmmmmmmmmmmm....', 'mmllllllmmmmmm....', 'm.mllllmmmmmm.....', 'm..mmm...mmm......', '...mm.....mm......', '...dd.....dd......'],
  },
  zombie: {
    pal: { s: '#8fbf6a', S: '#6a9a4a', c: '#5a6b8c', C: '#3d4a66', p: '#4a3a2e', e: '#ff3b3b', k: '#1b1530', r: '#a83232' },
    rows: ['.....ssss.......', '....sssssS......', '....sesesS......', '....ssssSS......', '.....sksS.......', '......ss........', '....ccccccc.....',
      '...ccrccccc.ssss', '...cccccccsssss.', '..ss.ccccc......', '..s..CCCCC......', '.....pp.pp......', '.....pp.pp......', '....ppp.ppp.....'],
  },
  frog: {
    pal: { m: '#4f9a3a', l: '#9ad46a', d: '#2f6a24', k: '#1b1530', p: '#c0392b', w: '#ffffff' },
    rows: ['......mm...mm.....', '.....mwkm.mwkm....', '....mmmmmmmmmmm...', '...mmmmmmmmmmmmm..', '..mmmmmmmmmmmmmmm.', '..mmmmmmmmmmmkkkk.',
      '.mmmllllmmmmmmppp.', '.mmllllllmmmmmm...', 'mmmllllllllmmmmm..', 'mmmmllllllmmmmmm..', 'dmmmmmmmmmmmmmmd..', '.ddd.dd....dd.ddd.'],
  },
  spider: {
    pal: { m: '#3a2f4a', l: '#6b5a8a', d: '#241c30', e: '#ff3b3b', r: '#c0392b' },
    rows: ['.......mmmmm.......', '..d...mmlmmmm...d..', '...d.mmmmmmmmm.d...', '....dmmmmmmmmmd....', '.dddmmmmrmmmmmmddd.', 'd...mmmmmmmmeemm..d',
      '...dmmmmmmmmeemd...', '..d.dmmmmmmmmmd.d..', '.d...d.mmmmm.d...d.', 'd...d.........d...d'],
  },
  mummy: {
    pal: { w: '#e8dcc0', s: '#c9b994', d: '#9a8a6a', e: '#ffd84a', k: '#1b1530' },
    rows: ['....wwwww......', '...wsswwws.....', '...wkekkew.....', '...wwssww......', '....swwws......', '...wwswwwssww..', '..wswwswwwwws..',
      '..ws.wwsww.....', '..ws.swwws.....', '.....wwsww.....', '.....ws.sw.....', '.....ws.ws.....', '....wwd.wwd....'],
  },
  salamander: {
    pal: { m: '#d9481e', l: '#ff9f43', y: '#ffd84a', d: '#8a2a10', k: '#1b1530' },
    rows: ['.................mmm..', '...............mmmmmm.', '..............mmmkmmmm', '.......mmmmmmmmmmmmmmy', '.....mmmmmmmmmmmmmmm..', '...mmmmlylmmlylmmmm...', '..mmmmllllllllllmm....', '.mmm.mmm.....mmm......', 'mm...dd......dd.......', 'myy...................', '.yy...................'],
  },
  polarBear: {
    pal: { w: '#f4f8ff', s: '#c9d6ea', k: '#1b1530', d: '#9aaac0' },
    rows: ['.............ww....', '............wwww...', '...........wwwwkw..', '...........wwwwwwkk', '......wwwwwwwwwwss.', '....wwwwwwwwwwww...', '...wwwwwwwwwwwwww..', '..wwwwwwwwwwwwwww..', '..wwwswwwwwwwwsww..', '..wwwswwwwwwwwsww..', '..wwww.......wwww..', '..wwss.......wwss..', '..dddd.......dddd..'],
  },
  blackKnight: {
    pal: { a: '#3a3448', l: '#6b6480', d: '#1f1a2a', r: '#c0392b', s: '#c9d1da', y: '#e5b33a' },
    rows: ['......rr.........', '.....rrr.........', '....aaaaa........', '...aallaaa.......', '...aarrara.......', '...aaaaaaa.......', '....adada........',
      '..aaaaaaaaa....s.', '.alaaayaaala..s..', '.aa.aayaa.aa.s...', '.aa.aaaaa.aysy...', '.ll.aaaaa..yy....', '....aa.aa........', '....aa.aa........', '...daa.daa.......'],
  },
  abyssEye: {
    pal: { p: '#6c2a85', l: '#a64dff', d: '#3d1366', w: '#ffffff', r: '#ff3b3b', k: '#1b1530', t: '#8a3bd1' },
    rows: ['..t....t....t.....', '..t....t...t......', '...t...t..t.......', '....ppppppp.......', '..ppplllpppp......', '.ppllwwwwwppp.....', '.plwwwrrwwwpp.....',
      'pplwwrkkrwwppp....', 'pplwwrkkrwwppp....', '.plwwwrrwwwpp.....', '.ppplwwwwlppp.....', '..pppppppppp......', '...d.d.d.d.d......', '....d.d.d.d.......'],
  },
  hydra: {
    pal: { m: '#2f8a5a', l: '#7bd49a', d: '#1c5a3a', y: '#ffd84a', k: '#1b1530' },
    rows: ['...........mmm..........', '.....mmm...mmym...mmm...', '....mmymm..mmmm..mmymm..', '....mmmm....mm....mmmm..', '.....mm.....mm.....mm...', '.....mmm....mm....mmm...', '......mmm...mm...mmm....', '.......mmmmmmmmmmmm.....', '......mmmmmmmmmmmmmm....', '....mmmmmllllllmmmmmm...', '...mmmmmllllllllmmmmmm..', '..mmmmmmmmmmmmmmmmmmm...', '..dmmm.mmm....mmm.mmmd..', '...ddd..dd.....dd..ddd..'],
  },
});

MONSTERS.scarecrow = {
  pal: { h: '#d9a441', H: '#b8862f', s: '#c9a26b', k: '#3b2a20', y: '#f1d27a', r: '#b5452f', b: '#3d6fd1', p: '#7a4e2a' },
  rows: [
    '......hhhhhh......', '.....hhhhhhhh.....', '...HHHHHHHHHHHH...', '.....ssssssss.....', '.....sskssskss....',
    '.....ssssssss.....', '.....sskkkkss.....', '......ssssss......', '.y.......pp.....y.', 'yyyrrrrrrrrrrrryyy',
    '..rrrrrrrrrrrrrr..', '......rrrrrr......', '......rrbbrr......', '......rrbbrr......', '......rrrrrr......',
    '......yyyyyy......', '.......y..y.......', '........pp........', '........pp........', '........pp........',
    '........pp........', '.......pppp.......', '......pppppp......',
  ],
};

MONSTERS.melenchon = {
  pal: { h: '#c9c9cf', s: '#f1c08f', k: '#1b1530', w: '#eef4fb', b: '#2b3350', r: '#d63031', m: '#7a1f1f', d: '#22283d' },
  rows: [
    '.................sss..', '........hhhh....sssss.', '......hhsssshh..sssss.', '.....hsssssssh...sss..',
    '.....hssssssssh..bbb..', '.....hkkkskkkh...bbb..', '.....kwwkskwwk...bbb..', '.....skkksskkks..bbb..',
    '......sssssssss.bbb...', '......sssmmmsss.bbb...', '.......sssssss.bbb....', '........sssss.bbbb....',
    '.....bbbbwrwbbbbb.....', '....bbbbbwrrwbbbb.....', '...bbbbbbwrrwbbbb.....', '...bbbbbbbrrbbbbb.....',
    '...sbbbbbbrrbbbbb.....', '...ssbbbbbbbbbbbb.....', '.....bbbbbbbbbbbb.....', '.....dddddddddddd.....',
    '.....ddddd..ddddd.....', '.....ddddd..ddddd.....', '.....ddddd..ddddd.....', '....kkkkkk..kkkkkk....',
  ],
};

// ---------- Boss d'origine redessinés plus finement (res 1.5 = 1,5 fois plus de détails, même taille à l'écran) ----------
Object.assign(MONSTERS, {
  slimeKing: { res: 1.5, pal: { m: '#4cd964', l: '#a8f0a0', d: '#2a9a45', D: '#1e7a35', w: '#ffffff', e: '#1b1530', y: '#ffd84a', Y: '#e5a92a', r: '#d63031', p: '#ff8fa3' },
    rows: ['...........y..y..y.........', '...........yy.yy.yy........', '...........yYyyYyyY........', '...........yyyyyyyy........', '.........mmmmmmmmmmmm......', '......mmmmmmmmmmmmmmmmm....', '....mmmmmmmmmmmmmmmlllmmm..', '...mmmmmmmmmmmmmmmmmllllmm.', '..mmmmmmmmmmmmmwwwmmmmlwwwm', '..mmmmmmmmmmmmwwweemmmwweem', '.mmmmmmmmmmmmmwwweemmmwweem', '.mmmmmmmmmmmmmmwwwmmmmmwwmm', 'mmmmmmmmmmmmmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmpmmmrrrrmmpm', 'mmmmmmmmmmmmmmmmmmmmrrmmmmm', 'dmmmmmmmmmmmmmmmmmmmmmmmmmd', 'dddmmmmmmmmmmmmmmmmmmmmmddd', '.ddddddddddddddddddddddddd.', '...DDDDDDDDDDDDDDDDDDDDD...'] },
  goblin: { res: 1.5, pal: { m: '#7bc043', l: '#a6e06a', d: '#4e8a2a', w: '#ffffff', e: '#d63031', k: '#3b2a20', t: '#8a5a2b', T: '#6b4423', b: '#d4a437', c: '#a0703c', C: '#7a4e2a', s: '#f4f0e0', r: '#c0392b' },
    rows: ['...........mmmmm............', '..........mmmmmmm...........', '.mm......rrrrrrrrr.....mm...', '..mmm...mmmmmmmmmmm..mmm....', '...mmmmmmmmmmmmmmmmmmmm.....', '....mmmmmmmmwwemmwwemm......', '.....mmmmmmmmeemmmeemm......', '......mmmmmmmmmmmmmmmm......', '......mmmmmmkkkkkkkmmm......', '.......mmmmmksksskkmm.......', '........mmmmmmmmmmmm.....cc.', '.........mmmmmmmmmm.....cccc', '.......tttttttttttttt..ccccC', '......mtttttttttttttm.ccCC..', '.....mmttttttbbtttttmmcC....', '.....mm.TTTTTbbTTTT.mmC.....', '.....mm.tttttttttt...C......', '......m.tttttttttt..........', '........tttt..tttt..........', '........dddd..dddd..........', '........dddd..dddd..........', '.......ddddd..ddddd.........', '.......kkkkk..kkkkk.........'] },
  skeleton: { res: 1.5, pal: { w: '#ece6d6', s: '#bdb5a0', k: '#3a3344', r: '#ff3b3b', a: '#8f96a0', A: '#c3cad3', y: '#e5b33a', Y: '#fff3b0', p: '#5a3a7a' },
    rows: ['.......yyyyyy...........', '.......yYyyYy...........', '......wwwwwwww..........', '.....wwwwwwwwww.........', '.....wwkkwwwkkw.........', '.....wwkrwwwkrw.........', '.....wwwwwkwwww.........', '......wwwwwwwww.........', '......wkwkwkwkw.........', '.......wwwwwww......A...', '....pppp.www.pppp...A...', '...ppwwwwwwwwwwwpp..A...', '...pw.wkwwwwkw.wp...A...', '...pw.wwwwwwww.wp...A...', '...pw.wkwwwwkw.wp..aaa..', '...ps.wwwwwwww.sp..sa...', '...p...wkwwkw...p.ss....', '..pp...wwwwww...pp......', '..p.....s..s.....p......', '.......ww...ww..........', '.......w.....w..........', '.......w.....w..........', '......ww.....ww.........', '.....sss.....sss........'] },
  mushroom: { res: 1.5, pal: { r: '#9b59b6', R: '#6c3483', l: '#c39bd3', w: '#b8f5a0', s: '#efe2c4', S: '#cdbd98', e: '#1b1530', k: '#5a3a5e', p: '#ff8fa3' },
    rows: ['.........rrrrrrrr.........', '......rrrrrrwwrrrrrr......', '....rrrrlrrwwwwrrrrrrr....', '...rrrlllrrrwwrrrrwwrrr...', '..rrrllrrrrrrrrrrwwwwrrr..', '.rrwwrrrrrrrrrrrrrwwrrrrr.', '.rwwwwrrrrwwrrrrrrrrrrrrr.', 'rrrwwrrrrwwwwrrrrrrrrwwrrr', 'rrrrrrrrrrwwrrrrrrrrwwwwrr', 'RRRRRRRRRRRRRRRRRRRRRRRRRR', '.RRRRRRRRRRRRRRRRRRRRRRRR.', '.......ssssssssssss.......', '......ssssssssssssss......', '......sssssseessseess.....', '......sssssseessseess.....', '......sspssssssssspss.....', '......ssssssskkkkssss.....', '.......sssssskkkssss......', '.......Ssssssssssss.......', '......SSSssssssssssS......', '.....SSS..........SSS.....', '....SSSS..........SSSS....'] },
  golem: { res: 1.5, pal: { m: '#8d8a84', l: '#b3b0a8', d: '#5f5c57', y: '#7ff0ff', g: '#5aa04a', k: '#4a4844' },
    rows: ['..........mmmmmmmm............', '.........mllllllmmm...........', '.........mlmmmmmmmm...........', '.........mmmmmmyymy...........', '.........mmmkmmyymm...........', '.........mmmmmmmmmm...........', '....ggg.mmmmmmmmmmmmmm........', '..mmmmmmmmmmmmmmmmmmmmmmm.....', '.mmlllmmmmmmmmkmmmmmmlllmm....', 'mmllmmmmmmmmmmmkmmmmmmmlmmm...', 'mmlmmmmmmmyymmmmmmmmmmmmmmm...', 'mmmmm..mmmyymmmmmmmm..mmmmm...', 'mmmm...mmmmmmmmmmmmm...mmmmm..', 'mmmm...mmmmmkmmmmmmm....mmmm..', 'dddd...mmmmmmkmmmmmm....dddd..', 'dddd...mmmmmmmmmmmmm....dddd..', '.......mmmmmm..mmmmmm.........', '.......mmmmm....mmmmm.........', '.......mmmmm....mmmmm.........', '......mmmmmm....mmmmmm........', '......dddddd....dddddd........'] },
  ghost: { res: 1.5, pal: { m: '#d6d4ff', l: '#ffffff', d: '#9c98e0', k: '#2a2050', e: '#7fe7ff' },
    rows: ['........mmmmmmm.........', '......mmllllmmmmm.......', '.....mmllmmmmmmmmm......', '....mmlmmmmmmmmmmmm.....', '...mmlmmmmmmmmmmmmmm....', '...mmmmmmmmkkkmmkkkm....', '...mmmmmmmmkekmmkekm....', '...mmmmmmmmkkkmmkkkm....', '..mmmmmmmmmmmmmmmmmmm...', '..mmmmmmmmmmmkkkkmmmm...', '..mmmmmmmmmmkkkkkkmmm...', '.mmmmmmmmmmmmkkkkmmmmm..', '.mmmmmmmmmmmmmmmmmmmmm..', 'mmmmmmmmmmmmmmmmmmmmmmm.', 'dmmmmmmmmmmmmmmmmmmmmmm.', 'ddmmmmmmmmmmmmmmmmmmmmd.', '.ddmmmmmmmmmmmmmmmmmmdd.', '.ddd.dmmmm.dmmmm.dmmdd..', '..d...dmm...dmm...dd....', '.......d.....d..........'] },
  fireElem: { res: 1.5, pal: { y: '#ffe08a', o: '#ff9f43', r: '#ff5e3a', R: '#c0392b', w: '#ffffff', k: '#3a1a10' },
    rows: ['.........y.......y......', '........yy......yy......', '.......yoy.....yoy....y.', '.......yooy...yooy...yy.', '......yooooy.yoooy..yoy.', '......yoorooyyooooy.yoy.', '.....yoorrrrooooooyyooy.', '.....yorrrrrrrrrroooooy.', '....yoorrrrrrrrrrrroooy.', '....yorrrrrwwkrrrwwkroy.', '....yorrrrrwkkrrrwkkroy.', '....yorrrrrrrrrrrrrrrroy', '....yorrrrrrRkkkkRrrrroy', '.....yorrrrrrRkkRrrrrroy', '.....yoorrrrrrrrrrrrroy.', '......yoorrrrrrrrrrrooy.', '.......yoorrrrrrrrrooy..', '........yoorrrrrrrooy...', '.........yooorrrroooy...', '..........yyooooooyy....', '...........yyooooyy.....', '.............yooy.......', '..............yy........'] },
  yeti: { res: 1.5, pal: { w: '#f4f8ff', s: '#c9d6ea', b: '#6fa8dc', B: '#3d78b0', k: '#1b1530', W: '#ffffff', i: '#bfe6ff' },
    rows: ['........wwwwwwww..........', '......wwwwwwwwwwww........', '.....wwwwbbbbbbbwww.......', '.....wwwbbkbbbbkbbw.......', '.....wwwbbbbbbbbbbw.......', '.....wwwbbWbWbWbbbw.......', '.....wwwbbbbbbbbbbw.......', '......wwwbbWbWbbbw........', '...wwwwwwwwwwwwwwwwwww....', '..wwwwwwwwwwwwwwwwwwwwww..', '.wwwwwwwssssssssswwwwwwww.', 'wwwswwwwssssssssswwwwwswww', 'www.wwwwssssssssswwwww.www', 'www.wwwwwwwwwwwwwwwwww.www', 'sss.wwwwwwwwwwwwwwwwww.sss', 'iii..wwwwwwwwwwwwwwwww.iii', '.....wwwwwww...wwwwwww....', '.....wwwwww.....wwwwww....', '.....wwwwww.....wwwwww....', '....BBBBBBB.....BBBBBBB...'] },
  vampire: { res: 1.5, pal: { k: '#2a2238', s: '#e8e0f0', r: '#c0392b', R: '#8e2b2b', e: '#ff3b3b', w: '#ffffff', y: '#e5b33a', h: '#1b1530' },
    rows: ['.......hhhhhhh........', '......hhhhhhhhh.......', '.....hhhssshhhhh......', '.....hhsssssssh.......', '.....hssseesesh.......', '......ssssssss........', '......sssswsws........', '.......ssssss.........', '...RR..kwwwwk..RR.....', '..RRRRkkwyywkkRRRR....', '.RRRrRkkkwwkkkRrRRR...', 'RRRrrRkkkkkkkkRrrRRR..', 'RRrr.Rkkkkkkkkk.rrRR..', 'RRr..RkkkkyykkR..rRR..', 'Rr...RkkkkkkkkR...rR..', 'r....Rkkkkkkkkk....r..', '.....Rkkkkkkkkk.......', '.....Rkkkk.kkkk.......', '.....Rkkk...kkk.......', '......kkk...kkk.......', '.....kkkk...kkkk......'] },
  demon: { res: 1.5, pal: { r: '#c0392b', l: '#e55a4a', y: '#ffd84a', k: '#1b1530', w: '#ffffff', d: '#4a1d5c', D: '#6c2a85', h: '#3a3344', H: '#5c5670' },
    rows: ['..h....................h..', '..hh..................hh..', '...hH......rrrrr.....Hh...', '....hhH..rrrrrrrrr.Hhh....', '.....hhrrrrrrrrrrrrrhh....', '......rrrrlyyrrlyyrrr.....', '......rrrrrkyrrrkyrrr.....', '......rrrrrrrrrrrrrrr.....', '.......rrrrkwkwkwkrr......', 'D......rrrrkkkkkkrrr.....D', 'DD......rrrrrrrrrrr.....DD', 'DDd...rrrrrrrrrrrrrrr..dDD', 'DDDdrrrrrllrrrrrllrrrrdDDD', 'DDdrrrrrlllrrrrrlllrrrrdDD', 'Dd.rrr..rrrrrrrrrrr..rrr.dD', 'd..rrr..rrrrrrrrrrr..rrr..d', '...kk...rrrrrrrrrrr...kk...', '........rrrrrrrrrrr........', '........rrrr...rrrr........', '........rrrr...rrrr........', '.......rrrrr...rrrrr.......', '.......kkkkk...kkkkk.......'] },
  dragon: { res: 1.5, pal: { m: '#c0392b', l: '#f5b041', d: '#7b241c', D: '#a93226', y: '#ffd84a', e: '#1b1530', w: '#ffffff', k: '#2a1a10' },
    rows: ['...........................kk...........', '..........................kkk...........', '.........................mmmk...........', '........................mmmmmm..........', '.......................mmmyemmm.........', '.......dd..............mmmmmmmmmmm......', '......dDDd............mmmmmmmmmwkwk.....', '.....dDDDDd...........mmmmmmmmmmmmm.....', '....dDDDDDDd.........mmmmmlll...........', '...dDDDDDDDDd.......mmmmmlll............', '..dDDDDDDDDDDd.....mmmmmlll.............', '.dDDDDDDDDDDDDdmmmmmmmmlll..............', 'dddddddddDDDDmmmmmmmmmlll...............', '........mmmmmmmmmmmmmmll................', '.....mmmmmmmmmlllllllmmm................', '...mmmmmmmmmlllllllllmmm................', '.mmmmmmmmmmlllllllllllmm................', 'mmm...mmmmmmlllllllllmm.................', 'm....mmmmmmmmmmmmmmmmm..................', '....mmm..mmm....mmm.mmm.................', '...mmmm.mmmm...mmmm.mmmm................', '...kkk..kkk....kkk..kkk.................'] },
  melenchon: { res: 1.5, pal: { h: '#c9c9cf', H: '#9a9aa3', s: '#f1c08f', S: '#d9a070', k: '#1b1530', w: '#eef4fb', g: '#2b2b33', b: '#2b3350', B: '#3d4a70', r: '#d63031', m: '#7a1f1f', d: '#22283d' },
    rows: ['.........................sss..', '........................sssss.', '.......................sssssss', '.......................sSsSsSs', '........hhhhhh.........sssssss', '......hhhhhhhhhh.......sssss..', '.....hhhsssssssshh......bbb...', '.....hhssssssssssh......bbb...', '....hhsssssssssssh.....bbbb...', '....hgggggsgggggs......bbb....', '....gwkkwgggwkkwgs....bbbb....', '....ggggggsgggggss...bbbb.....', '.....ssssssSssssss..bbbb......', '.....sssssssSsssss.bbbb.......', '......sssmmmmmsss.bbbb........', '......sssswwwssss.bbb.........', '.......sssssssss.bbbb.........', '........SsssssS.bbbb..........', '.....bbbbwwrwwbbbbbb..........', '....bbbbbwwrrwwbbbbb..........', '...bbbBbbwrrrwbbBbbb..........', '...bbbBbbbrrrbbbBbbb..........', '..sbbbBbbbrrrbbbBbbb..........', '..ssbbbbbbbrbbbbbbbb..........', '..ss.bbbbbbbbbbbbbbb..........', '.....bbbbbbbbbbbbbbb..........', '.....ddddddddddddddd..........', '.....dddddd...dddddd..........', '.....dddddd...dddddd..........', '.....dddddd...dddddd..........', '....kkkkkkk...kkkkkkk.........'] },
  scarecrow: { res: 1.5, pal: { h: '#d9a441', H: '#b8862f', s: '#c9a26b', S: '#a8844f', k: '#3b2a20', y: '#f1d27a', r: '#b5452f', R: '#8e3524', b: '#3d6fd1', p: '#7a4e2a', P: '#5a3a1e' },
    rows: ['..........hhhhhhh..........', '........hhhhhhhhhhh........', '.......hhHhhhhhhhHhh.......', '...HHHHHHHHHHHHHHHHHHHHH...', '....HHHHHHHHHHHHHHHHHHH....', '........sssssssssss........', '........sskkssskkss........', '........sskkssskkss........', '........sssssssssss........', '........sskssssskss........', '........ssskkkkksss........', '.........Sssssssss.........', '..........yySSSyy..........', '.yy.........ppp.........yy.', 'yyyrrrrrrrrrrrrrrrrrrrrryyy', '.yyrrrrrrrrrrrrrrrrrrrrryy.', '....rrrrRrrrrrrrrRrrrr.....', '.........rrrrrrrrr.........', '.........rrbbbrrrr.........', '.........rrbbbrrrr.........', '.........rrrrrrRrr.........', '.........RRRRRRRRR.........', '.........yyyyyyyyy.........', '..........yyy.yyy..........', '.............pp............', '.............pp............', '.............pp............', '.............pp............', '............pppp...........', '..........PPPPPPPP.........'] },
});

export function monsterCanvas(id) {
  return cached('monster:' + id, () => {
    const M = MONSTERS[id];
    const c = render(fromMap(M.rows, M.pal));
    if (M.res) { c.lw /= M.res; c.lh /= M.res; }
    return c;
  });
}

// =====================================================================
//  ICÔNES D'OBJETS
// =====================================================================
const ICON_MAPS = {
  toque: ['..mm.mmm.mm..', '.mmmmmmmmmmm.', 'mmmlmmmmmmmmd', 'mmlmmmmmmmmmd', 'mmmmmmmmmmmmd', '.mmmmmmmmmmd.', '..mmmmmmmmd..', '..aaaaaaaaa..', '..aAaaaaaaa..', '..aaaaaaaaa..'],
  helmet: ['....mmmmm....', '..mmlllmmmm..', '.mmlmmmmmmmd.', '.mlmmmmmmmmd.', 'mmmmmmmmmmmmd', 'mmmdddddddmmd', 'mmmd.....dmmd', 'mmmd.....dmmd', '.mmd.....dmd.', '..aa.....aa..'],
  wizard: ['.........aa..', '........mm...', '.......mmm...', '......mmmm...', '.....mmamm...', '....mmmmmmm..', '....mmmmmmd..', '...mmmmmmmmd.', '...aaaaaaaaa.', 'mmmmmmmmmmmmm', '.ddddddddddd.'],
  sword: ['..........ll', '.........lwl', '........lwl.', '.......lwl..', '......lwl...', '.....lwl....', '..a.lwl.....', '...alw......', '...daa......', '..d..a......', '.d..........', 'a...........'],
  staff: ['.........ccc', '........cwcc', '........cccc', '.......dccc.', '......d.....', '.....m......', '....m.......', '...m........', '..m.........', '.m..........', 'm...........'],
  bow: ['...mmm......', '..m...ms....', '.m.....s....', '.m......s...', 'm........s..', 'm.........s.', 'm.........s.', 'm........s..', '.m......s...', '.m.....s....', '..m...ms....', '...mmm......'],
  hammer: ['......lllll.', '.....lwwwll.', '....lmmmmmld', '.....mmmmmd.', '......mmmd..', '.....a.d....', '....a.......', '...a........', '..a.........', '.a..........', 'a...........'],
  armor: ['.mm.....mm..', 'mmmm...mmmm.', 'mmlmmmmmmmmd', 'mmlmmmmmmmmd', '.mlmmaammmd.', '..mmmaammd..', '..mmmmmmmd..', '..mmmmmmmd..', '..aaaaaaaa..', '..mmmmmmmd..', '..mmmmmmmd..'],
  robe: ['..mm....mm..', '.mmmm..mmmm.', 'mmmlmaammmmd', 'mmlmmaammmmd', '.mlmmmmmmmd.', '..mlmmmmmd..', '..mmmmammd..', '.mmmmmmmmmd.', '.mmamammammd', 'mmmmmmmmmmmd', 'aaaaaaaaaaaa'],
  leather: ['.mm.....mm..', 'mmmm...mmmm.', 'mmmmmmmmmmmd', 'mdmmmmmmmmdd', '.mdmmmmmmdd.', '..mdaaaamd..', '..mmmammmd..', '..mmmmmmmd..', '..ddddddddd.', '..mmmmmmmd..'],
  boots: ['..mmmm......', '..mlmm......', '..mlmm......', '..mmmm......', '..aaaa......', '..mmmm......', '..mmmmm.....', '..mmmmmmmm..', '.mmmmmmmmmm.', '.dddddddddd.'],
  sandals: ['....aa......', '...amma.....', '...mmmm.....', '...mmmm.....', '...amma.....', '...mmmm.....', '..mmmmmm....', '.mmmmmmmm...', 'dddddddddd..'],
  amulet: ['..aa....aa..', '.a........a.', '.a........a.', '..a......a..', '...a....a...', '....amma....', '...mmmmmm...', '..mmlmmmmm..', '..mlmmmmmd..', '...mmmmmd...', '....mmdd....'],
  necklace: ['a..........a', '.a........a.', '..a......a..', '...a.mm.a...', '....amma....', '...m.mm.m...', '..m..mm..m..', '..m.......m.', '.mm.......mm'],
};

// ---------- Panoplies des potes ----------
Object.assign(ICON_MAPS, {
  // Chapeaux
  ponytail: ['...mmmmmm.....', '..mmmmmmmm....', '.mmmlmmmmmm...', '.mmlmmmmmmmaa.', '.mmssssmmmmamm', '.msssssmmmm..mm', '.msesssmmm...mm', '.msssssmm.....m', '..sssssm......m', '...sSS........'],
  bald: ['...ssssssss...', '..sswwsssssS..', '.sswsssssssSS.', '.sssssssssssS.', 'Ssssssssssssss', '.sseesssseesS.', '.sssssssssssS.', '.sssssSSsssS..', '..sssssssssS..', '...SsssssSS...', '....SSSSSS....'],
  glasses: ['.mmmm....mmmm.', 'mwgggm..mwgggm', 'mggggmmmmggggm', 'mggggm..mggggm', '.mmmm....mmmm.'],
  halo: ['..w........w..', '...mmmmmmmm...', '.mmllllllllmm.', 'mmm........mmm', '.mmmmmmmmmmmm.', '...dddddddd...', '.w..........w.'],
  cap: ['.....mmmmm.......', '...mmmlmmmmm.....', '..mmlmmmmmmmm....', '.mmlmmmaammmmm...', '.mmmmmmaammmmm...', '.mmmmmmmmmmmmm...', '.ddddddddddmmmmmm', '...........ddddddd'],
  gel: ['..m..m..m..m..', '.mm.mm.mm.mm.m', '.mmmmmmmmmmmmm', 'mmlmmmlmmmlmmm', 'mmmmmmmmmmmmmm', 'msssssssssssm.', '.ssesssssesss.', '.ssssssssssss.', '..ssssSSsssS..', '...sssssssS...'],
  santa: ['...........ww.', '.........mmww.', '.......mmmm...', '.....mmmmmm...', '...mmmmmmmmm..', '..mmmmmmmmmmm.', '.mmlmmmmmmmmmm', 'wwwwwwwwwwwwww', 'wwwwwwwwwwwwww'],
  // Armes
  stick: ['..........aa', '.........aaa', '........mma.', '.......mm...', '......mm....', '.....mm.....', '....mm......', '...mm.......', '..mm........', '.mm.........', 'mm..........'],
  knife: ['..........ll', '.........lml', '........lml.', '.......lml..', '......lml...', '.....lmd....', '....kk......', '...aaa......', '..aaa.......', '.aaa........', '.aa.........'],
  jknife: ['...........l', '..........lm', '.........lm.', '........lm..', '.......lm...', '......lm....', '.....lmd....', '....kk......', '...aa.......', '..aa........', '.aa.........', 'aa..........'],
  karambit: ['....mmm.....', '..mml.......', '.ml.........', '.ml.........', '.mml........', '..mmmk......', '.....kaa....', '......aaa...', '.......aaa..', '.......akka.', '........aa..'],
  bottle: ['....aa....', '....aa....', '....mm....', '....mm....', '...mmmm...', '..mmmmmm..', '..mlmmmm..', '..mlwwwm..', '..mlwawm..', '..mmwwwm..', '..mmmmmm..', '..dddddd..'],
  fist: ['...ssssss...', '..sSsSsSss..', '..ssssssss..', '.sssssssss..', '.ssssssssS..', '..ssssssS...', '...aaaa.....', '...aaaa.....', '...aaaa.....'],
  bigarm: ['.......sss..', '......sssss.', '......sSsss.', '.......sss..', '.......sss..', '.ssss..sss..', 'sssssssssS..', 'ssssssssSS..', '.sssssSSS...', '..sSSSSS....'],
  hookah: ['...w.w....', '....w.....', '...w......', '...aaaa...', '..aAAAAa..', '....kk....', '....mm..k.', '....mm...k', '...mmmm..k', '..mmlmmm.k', '.mmlmmmmmk', '.mmmmmmmm.', '..mmmmmm..'],
  camera: ['..kkk.........', '.kkkkkkkkkkkk.', 'kmmmmmmmmmmmmk', 'kmmmmaaaammmmk', 'kmmmallllammmk', 'kmmmalwglammmk', 'kmmmallllammmk', 'kmmmmaaaammmmk', 'kmmmmmmmmmmmmk', '.kkkkkkkkkkkk.'],
  spatula: ['.........mmm', '........mlmm', '........mmmm', '........mmm.', '.......mm...', '......mm....', '.....mm.....', '....mm......', '...mm.......', '..dd........', '.dd.........'],
  // Armures
  sweater: ['...mm..mm...', '.mmmmmmmmmm.', 'mmmmmmmmmmmm', 'mmlmaaaammmm', 'mmlmmmmmmmmm', 'mmlmaaaammmm', 'mm.mmmmmmm.mm', 'dd.mmmmmmm.dd', '...mmmmmmm...', '...ddddddd...'],
  torso: ['..ss....ss..', '.ssssssssss.', 'ssssssssssss', 'sssSssssSsss', 'ssssSssSssss', '.ssssssssss.', '..ssSssSss..', '..ssssssss..', '..sSsSsSss..', '..ssssssss..'],
  toga: ['..mm........', '.mmmm.......', '.mmmmmm.....', '.mmlmmmmm...', '.mmllmmmmmm.', '.mmmllmmmmm.', '.mmmmllmmmm.', '..mmmmlmmm..', '..mmmmmmmm..', '..mmmmmmmm..', '..aaaaaaaa..'],
  jacket: ['.mm.....mm..', 'mmmm.ww.mmmm', 'mmmmmwwmmmmm', 'mmlmmkmmmmmm', 'mmlmmkmmmamm', 'mmlmmkmmmmmm', '.mlmmkmmmmm.', '..mmmkmmmm..', '..mmmkmmmm..', '..dddddddd..'],
  tshirt: ['.mmm....mmm.', 'mmmmm..mmmmm', 'mmmmmmmmmmmm', '.mmmmmmmmmm.', '..mmmmmmmm..', '..mmdmmmdm..', '..mmmddmmm..', '..mmmmmmmm..', '..dddddddd..'],
  sportbag: ['....kkkk....', '...k....k...', '..k......k..', '.mmmmmmmmmm.', 'mmlllmmmmmmm', 'mmmmmmmmmmmm', 'mwwwwwwwwwwm', 'mmmmmmmmmmmm', 'mmmmmmmmmmmm', '.dddddddddd.'],
  gimbal: ['...aaaaaaa..', '...awwwwwa..', '...aaaaaaa..', '.....mm.....', '...mmmm.....', '...m...mm...', '...m....m...', '...mmmmmm...', '.....mm.....', '.....mm.....', '.....mm.....', '....mmmm....'],
  apron: ['....k..k....', '....k..k....', '...mmmmmm...', '...mmmmmm...', '.kkmmaammkk.', '...mmaammm..', '..mmmmmmmm..', '..mmmmmmmmm.', '..mmlmmmmmm.', '..mmmmmmmmm.', '..aaaaaaaaa.'],
  // Bottes
  chunky: ['...mmmm.......', '..mmmmmmm.....', '..mmlmmmmmmm..', '.mmmmaammmmmm.', '.mmmmmmmmmmmmm', 'wwwwwwwwwwwwww', 'wwwwwwwwwwwwww', 'awwawwawwawwaw', '.aaaaaaaaaaaa.'],
  sneaker: ['....mmm.......', '...mmmmm......', '...mlmmmmm....', '..mmmmmaammm..', '..mmmmaammmmm.', '.mmmmmmmmmmmmm', 'wwwwwwwwwwwwww', '.kkkkkkkkkkkk.'],
  nb: ['....mmm.......', '...mmmmm......', '...mlmmmmm....', '..mmmaamammm..', '..mmmamaammmm.', '.mmmmmmmmmmmmm', 'wwwwwwwwwwwwww', '.kkkkkkkkkkkk.'],
  birk: ['...aaa.aaa....', '..aaaaaaaaa...', '..a.......aa..', 'mmmmmmmmmmmmm.', 'mllllllllllmm.', '.kkkkkkkkkkk..'],
  italian: ['....mmmm......', '...mmmmmmm....', '...mlwmmmmmm..', '..mmmmmmmmmmm.', '.mmmmmmmmmmmmm', '.kkkkkkkkkkkkk'],
  rug: ['.w.w.w.w.w.w.w', 'mmmmmmmmmmmmmm', 'maaaaaaaaaaaam', 'mammmmmmmmmmam', 'mamaaaaaaaamam', 'mamammmmmmamam', 'mamaaaaaaaamam', 'mammmmmmmmmmam', 'maaaaaaaaaaaam', 'mmmmmmmmmmmmmm', '.w.w.w.w.w.w.w'],
  crocs: ['....mmmm......', '...mmmmmmm....', 'aa.mkmmkmmmm..', 'a.mmmmmkmmmmm.', 'a.mkmmmmmkmmmm', '.mmmmmmmmmmmmm', '.ddddddddddddd'],
  // Amulettes
  key: ['a..........a', '.a........a.', '..a......a..', '...a....a...', '....a..a....', '.....mm.....', '....m..m....', '....m..m....', '.....mm.....', '.....mm.....', '.....mmm....', '.....mm.....', '.....mmm....'],
  chain: ['ml........lm', 'mlm......mlm', '.lml....lml.', '..lmlmmlml..', '...lmllml...', '....lmml....', '.....ll.....'],
  talisman: ['a..........a', '.a........a.', '..a......a..', '...a....a...', '....mmmm....', '...mllmmm...', '..mlmkkmmd..', '..mmkAAkmd..', '..mmmkkmmd..', '...mmmmdd...', '....dddd....'],
  gram: ['a..........a', '.a........a.', '..a......a..', '...a....a...', '....a..a....', '....aaaa....', '...mmmmmm...', '...mwwwwm...', '...mwwwwm...', '...mwwwwm...', '...mmmmmm...'],
  rosary: ['.m.m.m.m.m.m', 'm..........m', '.m........m.', '..m......m..', '...m.m.m.m..', '.....aa.....', '....aaaa....', '.....aa.....', '.....aa.....'],
  judas: ['a..........a', '.a........a.', '..a......a..', '...a....a...', '....mmmm....', '...mmggmm...', '..mmgwggmm..', '..mmggggmm..', '...mmggmm...', '....mmmm....'],
  spot: ['a..........a', '.a........a.', '..a......a..', '...a....a...', '....mmmm....', '....mlmm....', '...mmmmmm...', '...wwwwww...', '..yyyyyyyy..', '.y..y..y..y.'],
  hardhat: ['.....mmmm.....', '...mmlmmmmm...', '..mlmmaammmm..', '..mlmmaammmm..', '.mmmmmmmmmmmm.', 'mmmmmmmmmmmmmm', 'dddddddddddddd'],
  trowel: ['.....mm.....', '....mlmm....', '...mlmmmm...', '..mlmmmmmm..', '.mmmmmmmmmm.', '..mmmmmmmm..', '...mmmmmm...', '....mmmm....', '.....kk.....', '.....kk.....', '.....aa.....', '....aaaa....', '....aaaa....', '.....aa.....'],
  gaiter: ['..mmmmmmmm..', '.mlmmmmmmmm.', '.mmaammaamm.', '.mmmmmmmmmm.', '.mmaammaamm.', '.mmmmmmmmmm.', '..dddddddd..'],
  fries: ['..a.a..a.a..', '..aAa.aAa...', '.a.aAaAa.a..', '.aAaAaAaAa..', '..aAaAaAa...', '.mmmmmmmmmm.', '.mlmmyymmmd.', '..mlmyymmd..', '..mlmmmmmd..', '...mmmmmd...', '...mmmmmd...', '....dddd....'],
  mcshirt: ['.mmm....mmm.', 'mmmmm..mmmmm', 'mmmmmmmmmmmm', '.mmmmmmmmmm.', '..maamaamm..', '..mamaamam..', '..mammmmam..', '..mammmmam..', '..mmmmmmmm..', '..dddddddd..'],
  headband: ['..mmmmmmmmmm....', '.mmllllllllmm...', 'mmmaaammmmmmmmm.', 'mmmmmmmmmmmmmmmm', '.dddddddddddddm.', '............mmm.', '...........mm.m.', '..........mm...m'],
  ball: ['....mmmm....', '..mmlmmmmm..', '.mlmmkkmmmd.', '.mlmkkkkmmd.', 'mmmmkkkkmmmd', 'mmkmmkkmmkmd', 'mkkkmmmmkkkd', '.mkmmmmmmkd.', '.mmmkkkkmmd.', '..mmkkkkmd..', '....dddd....'],
  jersey: ['.mm......mm.', 'mmmmwmmwmmmm', 'mmmmmwwmmmmm', '.mmmmmmmmmm.', '..mamaaamm..', '..mamamamm..', '..mamamamm..', '..mamaaamm..', '..mmmmmmmm..', '..dddddddd..'],
  cleats: ['...mmmm.......', '..mmmmmmm.....', '..mlmmmmmmmm..', '.mmmmaammmmmm.', '.mmmmmmmmmmmmm', 'wwwwwwwwwwwwww', '.k.k..k..k.k..'],
  medal: ['.aa......aa.', '..aa....aa..', '...aa..aa...', '....aaaa....', '....mmmm....', '...mmllmm...', '..mmlmmmmd..', '..mmmyymmd..', '..mmmyymmd..', '...mmmmdd...', '....dddd....'],
  burger: ['a..........a', '.a........a.', '..a......a..', '...a....a...', '....mmmm....', '...mmwmmm...', '..GGGGGGGG..', '..bbbbbbbb..', '..yyyyyyyy..', '...mmmmmm...'],
});

Object.assign(PET_MAPS, {
  cat: ['.m.....m..', '.mm...mm..', '.mmmmmmm..', 'mmemmmemm.', 'mmmmpmmmm.', '.mmmmmmm..', '..mmmmm...', '.mmmmmmm..', '.mmlmmmmm.m', '.mmlmmmmm.m', '.mmmmmmmmmm', '..d.d..d.d.'],
  catFat: ['..m.....m...', '..mm...mm...', '..mmmmmmm...', '.mmemmmemm..', '.mmmmpmmmm..', '..mmmmmmm...', '.mmmmmmmmm..', 'mmmmmmmmmmm.m', 'mmmllllmmmm.m', 'mmmllllmmmmmm', 'mmmmmmmmmmmm.', '.dd.d..d.dd..'],
  catThin: ['.m....m..', '.mm..mm..', '.mmmmmm..', '.memmem..', '.mmmpmm..', '..mmmm...', '..mmmm...', '..mlmm..m', '..mlmm..m', '..mmmm.m.', '..mmmmm..', '..d..d...'],
  catBig: ['..m......m...', '..mm....mm...', '..mmmmmmmm...', '.mmmmmmmmmm..', '.mmemmmmemm..', '.mmmmmpmmmm..', '..mmmmmmmm...', '.mmmmmmmmmm..', 'mmmmmmmmmmmm.m', 'mmmmllllmmmm.m', 'mmmmllllmmmmmm', 'mmmmmmmmmmmmm.', '.ddd.d..d.ddd.'],
  catTiger: ['.m.....m..', '.mm...mm..', '.mkmkmkm..', 'mmemmmemm.', 'mmmmpmmmm.', '.mmmmmmm..', '..mmmmm...', '.mkmmmkmm.', '.mmlmmmmmkm', '.kmlmmmkm.k', '.mmmmmmmmmm', '..d.d..d.d.'],
  dog: ['............mm...', '...........mmmm..', '..........mmmemm.', '..........mmmmmmn', '.m........mmmmm..', '.mm......dmmm....', '..mmmmmmmmmmm....', '..mmmmmmmmmmm....', '..mmlllllmmmm....', '..mmlllllmmm.....', '..mm.mm...mm.mm..', '..mm.mm...mm.mm..', '..dd.dd...dd.dd..'],
  greyhound: ['.............mm...', '............mmmmm.', '............memmmn', '.m.........mm.....', '..m.......mmm.....', '..mmmmmmmmmmm.....', '...mmmmmmmmmm.....', '...mmllllmmm......', '...m..m...m..m....', '...m..m...m..m....', '..m...m...m...m...', '..d...d...d...d...'],
  canecorso: ['...........mmmmm...', '..........mmmmmmm..', '..........mmemmmmn.', '..........mmmmmmmmm', '.m........dmmmmmd..', '.mm......mmmmmm....', '..mmmmmmmmmmmmm....', '..mmmmmmmmmmmmm....', '..mmmlllllmmmm.....', '..mmm.mm...mmmm....', '..mmm.mm...mm.mm...', '..ddd.dd...dd.dd...'],
  shepherd: ['...........m..m...', '...........mmmm...', '..........mmmemm..', '..........mmmmmmmn', '.mm.......mmmmm...', 'mmmm.....mmmm.....', '.mmmmmmmmmmmm.....', '..mmmmmmmmmmm.....', '..mmlllllmmmm.....', '..mm.mm...mm.mm...', '..mm.mm...mm.mm...', '..dd.dd...dd.dd...'],
  snake: ['.......mmm...', '......mmemm..', '......mmmmmpp', '.......mmm...', '....mmmmm....', '...mlmmm.....', '..mmm........', '..mmmmmmmmm..', '...mmlmmmmmm.', '.mmmmmmmmmmm.', 'mmllllmmmmm..', '.mmmmmmmm....'],
});

export function itemIcon(itemId) {
  return cached('icon:' + itemId, () => {
    const it = ITEMS[itemId];
    if (it.slot === 'pet') return petCanvas(itemId);
    const [m, a] = it.colors;
    const skin = it.skin || '#f1c08f';
    const pal = {
      m, l: shade(m, 0.4), d: shade(m, -0.35), w: '#ffffff', a, A: shade(a, 0.4), c: a,
      s: skin, S: shade(skin, -0.18), k: '#2a2238', g: '#bfe6ff', y: '#ffe08a', G: '#4cd964', b: '#6b4423', e: '#1b1530',
    };
    return renderHi(fromMap(ICON_MAPS[it.icon], pal));
  });
}

// =====================================================================
//  COFFRES
// =====================================================================
export function chestCanvas(kind = 'normal', open = false) {
  return cached(`chest:${kind}:${open}`, () => {
    const wood = { combat: '#8e2b2b', war: '#3d2a6b' }[kind] || '#8a5a2b';
    const band = { combat: '#c9ccd6', war: '#ffd84a' }[kind] || '#e5b33a';
    const pal = { w: wood, W: shade(wood, 0.25), d: shade(wood, -0.35), b: band, B: shade(band, 0.4), k: '#2a1d10', g: '#fff3b0' };
    const closed = [
      '.bwwwwwwwwwwwwb.', 'bWWWWWWWWWWWWWWb', 'bwwwwwwwwwwwwwwb', 'bwwwwwwwwwwwwwwb', 'bbbbbbbBBbbbbbbb',
      'bwwwwwwbkbwwwwwb', 'bwwwwwwbbbwwwwwb', 'bwwwwwwwwwwwwwwb', 'bwwwwwwwwwwwwwwb', 'bdddddddddddddb', 'bbbbbbbbbbbbbbbb',
    ];
    const opened = [
      '.bwwwwwwwwwwwwb.', 'bddddddddddddddb', '.bbbbbbbbbbbbbb.', '..gggggggggggg..', 'bgggggggBggggggb',
      'bwwwwwwbkbwwwwwb', 'bwwwwwwbbbwwwwwb', 'bwwwwwwwwwwwwwwb', 'bwwwwwwwwwwwwwwb', 'bdddddddddddddb', 'bbbbbbbbbbbbbbbb',
    ];
    return renderHi(fromMap(open ? opened : closed, pal));
  });
}

// =====================================================================
//  Aide : dessiner un sprite dans un <canvas> de l'interface
// =====================================================================
export function paint(canvas, sprite, { scale = 4, pad = 0, bg = null } = {}) {
  // échelle entière par rapport au dessin HD, pour des pixels bien nets
  const u = sprite.width / lw(sprite);
  const k = Math.max(u, Math.round(scale / u) * u);
  canvas.width = lw(sprite) * k + pad * 2;
  canvas.height = lh(sprite) * k + pad * 2;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(sprite, pad, pad, lw(sprite) * k, lh(sprite) * k);
}

/** Portrait : héros + son arme */
export function heroPortrait(classId, weaponKind, dyeId = null) {
  return cached(`portrait:${classId}:${dyeId || ''}`, () => {
    const h = heroCanvas(classId, dyeId);
    const w = weaponCanvas(weaponKind);
    const [px, py] = weaponPivot(weaponKind);
    const c = document.createElement('canvas');
    c.width = (HERO_W + 10) * U; c.height = HERO_H * U;
    c.lw = HERO_W + 10; c.lh = HERO_H;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(h, 0, 0);
    ctx.translate(HAND.x * U, HAND.y * U);
    ctx.rotate((IDLE_ANGLE[weaponKind] * Math.PI) / 180);
    ctx.drawImage(w, -px * U, -py * U, lw(w) * U, lh(w) * U);
    return c;
  });
}

export function rarityColor(r) { return RARITIES[r].color; }

// =====================================================================
//  FLOUZE (monnaie : une liasse de billets verts) et CLEF
// =====================================================================
export function clatCanvas() {
  return cached('flouze', () => renderHi((fromMap(
    ['..dddddddddd', '..dGGGGGGGGd', 'dddddddddddd', 'dGGGGGGGGGGd', 'dGlGGwwGGlGd', 'dGGGwGGwGGGd', 'dGGGwGGwGGGd', 'dGlGGwwGGlGd', 'dGGGGGGGGGGd', 'dddddddddddd'],
    { G: '#2ecc71', d: '#1e8449', l: '#a8f0c0', w: '#e8fff0' },
  ))));
}
export function keyCanvas() {
  return cached('key', () => renderHi((fromMap(
    ['.yyy........', 'yYYYy.......', 'yY.Yyyyyyyyy', 'yYYYy...y.y.', '.yyy....y.y.'],
    { y: '#e5b33a', Y: '#ffe08a' },
  ))));
}

// =====================================================================
//  ICÔNES DE SORTS — une petite illustration par sort
// =====================================================================
const GLYPHS = {
  sword: ['..........ww', '.........wlw', '........wlw.', '.......wlw..', '......wlw...', '.....wlw....', '..y.wlw.....', '...ywl......', '...nyy......', '..n...y.....', '.n..........', 'n...........'],
  roar: ['..mmmm...w..', '.mmmmmm...w.', 'mmkmmkmm.w.w', 'mmmmmmmm..w.', 'mmkkkkmm.w.w', 'mmkrrkmm..w.', '.mkkkkm..w..', '..mmmm......'],
  hammer: ['..ssssssss..', '..swwwwwws..', '..ssssssss..', '..dddddddd..', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....yy.....'],
  shield: ['.mmmmmmmmmm.', '.mllllllllm.', '.mlmmmmmmdm.', '.mlmmyymmdm.', '.mlmyyyymdm.', '.mlmmyymmdm.', '..mlmmmmdm..', '..mlmmmmdm..', '...mlmmdm...', '....mmmm....', '.....mm.....'],
  whirl: ['....wwww....', '..ww....w...', '.w.......w..', '.w..ll....w.', 'w..l..l...w.', 'w..l...l..w.', 'w...l..l..w.', '.w...ll...w.', '.w.......w..', '..w....ww...', '...wwww..ww.', '.........w..'],
  bash: ['.....yy.....', '.y...yy...y.', '..y..ww..y..', '...wwwwww...', '...wwoowww..', 'yywwoorrowwy', '...wwoowww..', '...wwwwww...', '..y..ww..y..', '.y...yy...y.', '.....yy.....'],
  heart: ['.rr...rr.', 'rwrr.rrrr', 'rwrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'],
  charge: ['w.....mmm...', '.w....mmm...', 'w.....mmm...', '.ww...mmmm..', 'w....mmmmmm.', '.w..mmmmmmmm', '....dddddddd'],
  skull: ['..wwwwwww..', '.wwwwwwwww.', 'wwwwwwwwwww', 'wwkkwwwkkww', 'wwkkwwwkkww', 'wwwwwkwwwww', '.wwwwwwwww.', '..wkwkwkw..', '..wwwwwww..'],
  flame: ['.....o......', '....oo......', '...ooo..o...', '...oyoo.oo..', '..ooyyooooo.', '..oyyyyyoo..', '.ooywwyyoo..', '.oyywwwyyo..', '.oyyyyyyyo..', '..ooyyyoo...', '...ooooo....'],
  bolt: ['......yyyy..', '.....yyyy...', '....yyyy....', '...yyyy.....', '..yyyyyyyy..', '......yyy...', '.....yyy....', '....yyy.....', '...yy.......', '..y.........'],
  snow: ['.....c.....', '...c.c.c...', '....ccc....', '.c..ccc..c.', '..c.cwc.c..', 'cccccwccccc', '..c.cwc.c..', '.c..ccc..c.', '....ccc....', '...c.c.c...', '.....c.....'],
  cube: ['...cccccc...', '..cwwwwwcc..', '.cccccccccc.', '.cwllllldcc.', '.cwlkkkldcc.', '.cwlkkkldcc.', '.cwllllldc..', '.ccccccccc..'],
  firerain: ['oo..........', '.oyo...oo...', '..oyo...oyo.', '...yy....oyo', '..........yy', '.....oo.....', '......oyo...', '.......oyo..', '........yy..'],
  drop: ['.....p.....', '.....p.....', '....ppp....', '...ppppp...', '..pplpppp..', '..plppppp..', '.pplpppppp.', '.pplpppppp.', '.ppppppppd.', '..ppppppd..', '...ppddd...'],
  star: ['.....y.....', '.....y.....', '....yyy....', 'yyyyywyyyyy', '.yyywwwyyy.', '..yyywyyy..', '...yyyyy...', '..yyy.yyy..', '..yy...yy..', '.yy.....yy.'],
  meteor: ['...........w', '.........ww.', '.......ww...', '......ow....', '...ooyyoo...', '..oyywyyo...', '.ooywwyyo...', '.oyyyyyoo...', '..ooyyoo....', '...oooo.....'],
  arrow: ['.......ssss.', '........sss.', '.......s.ss.', '......n...s.', '.....n......', '....n.......', '...n........', '.wn.........', 'ww..........', '.w..........'],
  arrow2: ['......sss...', '.......ss.ss', '......n.s.ss', '.....n..n..s', '....n..n....', '...n..n.....', '.wn..n......', 'ww..n.......', '.wwn........', 'ww..........'],
  wind: ['..wwwww.....', '.......w....', '.wwwwwww....', '............', '...wwwwwwww.', '...........w', '.wwwwwwwwww.', '............', '..wwww......', '......w.....'],
  trap: ['s.s.s.s.s.s', 'sssssssssss', '.s.......s.', '.s...k...s.', '.s.......s.', 'sssssssssss', 's.s.s.s.s.s'],
  eye: ['....mmmm....', '..mmwwwwmm..', '.mwwwbbwwwm.', 'mwwwbkkbwwwm', '.mwwwbbwwwm.', '..mmwwwwmm..', '....mmmm....'],
  rain: ['.n...n...n.', '.n...n...n.', '.n...n...n.', '.n...n...n.', '.n...n...n.', 'sss.sss.sss', '.s...s...s.'],
  target: ['...rrrrr...', '..rwwwwwr..', '.rwrrrrrwr.', '.rwrwwwrwr.', '.rwrwrwrwr.', '.rwrwwwrwr.', '.rwrrrrrwr.', '..rwwwwwr..', '...rrrrr...'],
  cross: ['....ggg....', '....gwg....', '....gwg....', 'gggggwggggg', 'gwwwwwwwwwg', 'gggggwggggg', '....gwg....', '....gwg....', '....ggg....'],
  sun: ['.....y.....', '..y..y..y..', '...yyyyy...', '..yywwwyy..', 'yyywwwwwyyy', '..yywwwyy..', '...yyyyy...', '..y..y..y..', '.....y.....'],
  pillar: ['...wwwww...', '...wyyyw...', '...wyyyw...', '...wyyyw...', '...wyyyw...', '...wyyyw...', '...wyyyw...', '.yyyyyyyyy.', 'yy.......yy'],
  wings: ['ww.......ww', 'www.....www', 'wwww.y.wwww', 'wwwwwyywwww', '.wwwyyyyww.', '..wwwyyyw..', '...wwyyw...', '....wyyw...', '.....yy....'],
};
const GLYPH_PAL = { w: '#ffffff', l: '#aab4c0', y: '#ffd84a', n: '#8a5a2b', m: '#f1c08f', k: '#2a2238', r: '#ff5d6c', s: '#c9d1da', d: '#5c6670',
  o: '#ff9f43', c: '#7fe7ff', p: '#a64dff', g: '#4cd964', b: '#3d9bff' };
const SPELL_ART = {
  g1: ['sword'], g10: ['roar'], g20: ['hammer'], g30: ['shield', { m: '#9aa3ad', l: '#e8eef5', d: '#5c6670' }], g40: ['whirl'], g50: ['bash'],
  g60: ['heart'], g70: ['charge', { m: '#8a5a2b', d: '#5a3a22' }], g80: ['sword', { w: '#ff9a9a', l: '#d63031' }], g90: ['skull'],
  g100: ['hammer', { s: '#ffd84a', w: '#fff3b0', d: '#b8860b' }],
  m1: ['flame'], m10: ['bolt'], m20: ['shield', { m: '#2ab0e0', l: '#e0f7ff', d: '#1a6f99', y: '#ffffff' }], m30: ['snow'], m40: ['firerain'],
  m50: ['drop'], m60: ['star', { y: '#c38bff' }], m70: ['cube'], m80: ['flame', { o: '#ff3a1a', y: '#ff9f43' }], m90: ['meteor'],
  m100: ['meteor', { o: '#c0392b', y: '#ff5e3a' }],
  a1: ['arrow'], a10: ['arrow', { s: '#7bed6f' }], a20: ['arrow2'], a30: ['wind'], a40: ['arrow', { s: '#48dbfb', n: '#2a2238' }], a50: ['trap'],
  a60: ['eye'], a70: ['rain'], a80: ['arrow', { s: '#ff5d6c' }], a90: ['target'], a100: ['rain', { s: '#ffd84a' }],
  p1: ['hammer', { s: '#e8e1cf' }], p10: ['cross'], p20: ['shield', { m: '#e5b33a', l: '#fff3b0', d: '#b8860b', y: '#2e5aa8' }], p30: ['sun'],
  p40: ['hammer', { s: '#c3cad3', w: '#ffffff' }], p50: ['shield', { m: '#2e5aa8', l: '#8fb3ff', d: '#1c3566' }], p60: ['sun', { y: '#ffe08a' }],
  p70: ['sword', { w: '#fff3b0', l: '#ffd84a', y: '#ffffff' }], p80: ['heart', { r: '#7bed6f' }], p90: ['pillar'], p100: ['wings'],
};
const CLASS_TILE = { guerrier: '#7a2e2e', mage: '#3d2a7a', archer: '#2f5a2a', paladin: '#6b5a2a', monster: '#3a3344' };
const BADGES = {
  stun: [['.y.', 'yyy', '.y.'], '#ffd84a'], burn: [['.o.', 'ooo', 'ooo'], '#ff9f43'], poison: [['.g.', 'ggg', 'ggg'], '#7bed6f'],
  steal: [['r.r', 'rrr', '.r.'], '#ff5d6c'], debuff: [['ppp', 'ppp', '.p.'], '#c38bff'], buff: [['.y.', 'yyy', 'yyy'], '#ffd84a'], heal: [['.g.', 'ggg', '.g.'], '#4cd964'],
};
function spellBadge(sp) {
  if (sp.lifesteal) return 'steal';
  for (const e of sp.effects || []) {
    if (e.k === 'stun') return 'stun';
    if (e.k === 'dot') return e.kind === 'poison' ? 'poison' : 'burn';
    if (e.k === 'debuff') return 'debuff';
    if (e.k === 'heal' && sp.mult) return 'heal';
  }
  return null;
}
/** Icône carrée d'un sort (16×16 pixels) */
export function spellIcon(id) {
  return cached('spell:' + id, () => {
    const sp = SPELLS[id] || {};
    const [gname, over] = SPELL_ART[id] || ['star'];
    const rows = GLYPHS[gname];
    const S = 18, g = grid(S, S);
    const bg = CLASS_TILE[sp.cls] || CLASS_TILE.monster;
    rect(g, 1, 0, S - 2, S, bg); rect(g, 0, 1, S, S - 2, bg);
    rect(g, 1, 1, S - 2, 1, shade(bg, 0.3)); rect(g, 1, S - 2, S - 2, 1, shade(bg, -0.35));
    const pal = { ...GLYPH_PAL, ...(over || {}) };
    const gw = Math.max(...rows.map(r => r.length)), gh = rows.length;
    const ox = Math.floor((S - gw) / 2), oy = Math.floor((S - gh) / 2);
    const art = grid(S, S);
    rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) set(art, ox + x, oy + y, pal[ch]); }));
    const hd = upscale(g, 4);
    outline2(lighting(scale2x(scale2x(art)), 2), 2).p.forEach((c, i) => { if (c) hd.p[i] = c; });
    const b = spellBadge(sp);
    if (b) {
      const [map, col] = BADGES[b];
      const bd = grid(S, S);
      rect(bd, S - 6, S - 6, 5, 5, OUT);
      map.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') set(bd, S - 5 + x, S - 5 + y, col); }));
      upscale(bd, 4).p.forEach((c, i) => { if (c) hd.p[i] = c; });
    }
    return toCanvas(hd, 4);
  });
}
