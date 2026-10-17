// =====================================================================
//  PIXEL ART — tous les dessins du jeu sont générés ici, pixel par pixel
// =====================================================================
import { ITEMS, RARITIES, COSMETIC } from './data.js?v=20261018010512';

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
function toCanvas(g) {
  const c = document.createElement('canvas');
  c.width = g.w; c.height = g.h;
  const ctx = c.getContext('2d');
  g.p.forEach((col, i) => { if (col) { ctx.fillStyle = col; ctx.fillRect(i % g.w, Math.floor(i / g.w), 1, 1); } });
  return c;
}
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
export const HAND = { x: 14, y: 17 };   // point où l'arme est tenue
export const HERO_W = 22, HERO_H = 28;

/** Dessin d'un héros ; dyeId = teinture achetée à la boutique (facultatif) */
export function heroCanvas(classId, dyeId = null) {
  return cached(`hero:${classId}:${dyeId || ''}`, () => {
    const dye = dyeId && COSMETIC[dyeId] ? COSMETIC[dyeId].dye : null;
    const L = { ...LOOKS[classId], ...(dye || {}) };
    const g = grid(HERO_W, HERO_H);
    const eye = '#1b1530';
    if (L.cape) { rect(g, 4, 12, 3, 11, shade(L.cape, -0.15)); rect(g, 5, 22, 3, 1, shade(L.cape, -0.3)); }
    if (L.quiver) {
      rect(g, 4, 10, 2, 7, '#7a4e2a'); rect(g, 4, 10, 1, 7, '#5a3a1e');
      set(g, 4, 9, '#eeeeee'); set(g, 5, 8, '#d63031'); set(g, 5, 9, '#eeeeee'); set(g, 4, 8, '#d63031');
    }
    // jambes
    rect(g, 8, 19, 2, 4, shade(L.legs, -0.3)); rect(g, 7, 23, 3, 2, shade(L.boots, -0.25));
    rect(g, 11, 19, 2, 4, L.legs); rect(g, 11, 23, 3, 2, L.boots);
    // bras arrière
    rect(g, 6, 12, 2, 5, shade(L.sleeve, -0.3)); rect(g, 6, 17, 2, 1, shade(L.skin, -0.2));
    // torse
    rect(g, 7, 12, 7, 7, L.body); rect(g, 7, 12, 1, 7, shade(L.body, -0.2)); rect(g, 13, 12, 1, 6, shade(L.body, 0.2));
    if (L.robe) {
      rect(g, 6, 18, 9, 5, L.body); rect(g, 6, 18, 1, 5, shade(L.body, -0.25)); rect(g, 14, 18, 1, 5, shade(L.body, 0.15));
      rect(g, 7, 16, 7, 1, L.accent); rect(g, 10, 17, 1, 5, L.accent);
    } else {
      rect(g, 7, 18, 7, 1, '#5a3a22'); set(g, 11, 18, '#e5b33a');
    }
    if (classId === 'guerrier' || classId === 'paladin') { rect(g, 9, 13, 3, 5, L.accent); rect(g, 9, 13, 3, 1, shade(L.accent, 0.25)); }
    if (classId === 'paladin') { set(g, 10, 14, '#e5b33a'); set(g, 10, 15, '#e5b33a'); set(g, 9, 15, '#e5b33a'); set(g, 11, 15, '#e5b33a'); set(g, 10, 16, '#e5b33a'); }
    if (classId === 'archer') { rect(g, 7, 12, 7, 1, '#7a4e2a'); set(g, 8, 13, '#7a4e2a'); set(g, 9, 14, '#7a4e2a'); set(g, 10, 15, '#7a4e2a'); }
    // cou + tête
    rect(g, 9, 11, 3, 1, shade(L.skin, -0.15));
    rect(g, 7, 4, 7, 7, L.skin); rect(g, 13, 8, 1, 2, shade(L.skin, -0.1));
    rect(g, 7, 4, 7, 2, L.hair); rect(g, 7, 6, 2, 3, L.hair);
    let eyeY = 7;
    // couvre-chef
    if (L.head === 'helmet') {
      rect(g, 6, 3, 9, 4, L.headC); rect(g, 6, 3, 9, 1, shade(L.headC, 0.3)); rect(g, 6, 7, 3, 3, L.headC);
      rect(g, 6, 6, 9, 1, shade(L.headC, -0.25));
      rect(g, 9, 1, 3, 2, L.headA); set(g, 8, 2, L.headA); set(g, 12, 2, shade(L.headA, -0.3));
      eyeY = 8;
    } else if (L.head === 'wizard') {
      rect(g, 5, 4, 11, 1, L.headC); rect(g, 7, 3, 7, 1, L.headC); rect(g, 7, 2, 6, 1, L.headC);
      rect(g, 6, 1, 4, 1, L.headC); rect(g, 4, 0, 3, 1, L.headC);
      set(g, 10, 2, L.headA); rect(g, 7, 3, 7, 1, shade(L.headC, -0.15)); set(g, 9, 3, L.headA);
      rect(g, 10, 9, 4, 2, L.beard); rect(g, 11, 11, 2, 2, L.beard); set(g, 12, 13, L.beard);
    } else if (L.head === 'hood') {
      rect(g, 6, 3, 8, 3, L.headC); rect(g, 6, 6, 3, 5, L.headC); rect(g, 5, 5, 1, 3, L.headC); set(g, 4, 7, L.headC);
      rect(g, 6, 3, 8, 1, shade(L.headC, 0.2)); rect(g, 9, 6, 5, 1, shade(L.headC, -0.3));
    } else if (L.head === 'circlet') {
      rect(g, 7, 3, 7, 3, L.hair); rect(g, 6, 5, 2, 5, L.hair);
      rect(g, 7, 5, 7, 1, L.headC); set(g, 12, 5, '#4fc3f7');
    }
    set(g, 10, eyeY, eye); set(g, 12, eyeY, eye);
    // bras avant
    rect(g, 12, 13, 2, 4, L.sleeve); rect(g, 13, 17, 2, 1, L.skin); set(g, 14, 16, L.skin);
    return toCanvas(outline(g));
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
    return toCanvas(outline(fromMap(w.rows, w.pal)));
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
    return toCanvas(outline(fromMap(PET_MAPS[it.icon], pal)));
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

export function monsterCanvas(id) {
  return cached('monster:' + id, () => {
    const M = MONSTERS[id];
    return toCanvas(outline(fromMap(M.rows, M.pal)));
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
  cap: ['.....mmmmmm....', '...mmlmmmmmmm..', '..mlmmmmmmmmmm.', '..mmmmmaammmmm.', '..mmmmmaammmmm.', '..ddddddddddmmmmm', '............ddddd'],
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
  burger: ['a..........a', '.a........a.', '..a......a..', '...a....a...', '....mmmm....', '...mmwmmm...', '..GGGGGGGG..', '..bbbbbbbb..', '..yyyyyyyy..', '...mmmmmm...'],
});

Object.assign(PET_MAPS, {
  cat: ['.m.....m..', '.mm...mm..', '.mmmmmmm..', 'mmemmmemm.', 'mmmmpmmmm.', '.mmmmmmm..', '..mmmmm...', '.mmmmmmm..', '.mmlmmmmm.m', '.mmlmmmmm.m', '.mmmmmmmmmm', '..d.d..d.d.'],
  catFat: ['..m.....m...', '..mm...mm...', '..mmmmmmm...', '.mmemmmemm..', '.mmmmpmmmm..', '..mmmmmmm...', '.mmmmmmmmm..', 'mmmmmmmmmmm.m', 'mmmllllmmmm.m', 'mmmllllmmmmmm', 'mmmmmmmmmmmm.', '.dd.d..d.dd..'],
  catThin: ['.m....m..', '.mm..mm..', '.mmmmmm..', '.memmem..', '.mmmpmm..', '..mmmm...', '..mmmm...', '..mlmm..m', '..mlmm..m', '..mmmm.m.', '..mmmmm..', '..d..d...'],
  catBig: ['..m......m...', '..mm....mm...', '..mmmmmmmm...', '.mmmmmmmmmm..', '.mmemmmmemm..', '.mmmmmpmmmm..', '..mmmmmmmm...', '.mmmmmmmmmm..', 'mmmmmmmmmmmm.m', 'mmmmllllmmmm.m', 'mmmmllllmmmmmm', 'mmmmmmmmmmmmm.', '.ddd.d..d.ddd.'],
  catTiger: ['.m.....m..', '.mm...mm..', '.mkmkmkm..', 'mmemmmemm.', 'mmmmpmmmm.', '.mmmmmmm..', '..mmmmm...', '.mkmmmkmm.', '.mmlmmmmmkm', '.kmlmmmkm.k', '.mmmmmmmmmm', '..d.d..d.d.'],
  dog: ['.........mmm...', '........mmmmmm.', '........mmemmmn', '.m......mmmmmm.', '.mm.....dmmm...', '..mmmmmmmmmm...', '..mmmmmmmmmm...', '..mlllmmmmm....', '..mm.m...m.mm..', '..mm.m...m.mm..'],
  greyhound: ['..........mm....', '.........mmmmmmn', '.........mem....', '.m.......mm.....', '..m.mmmmmmm.....', '..mmmmmmmmmm....', '...mmmm..mmm....', '...m..m..m..m...', '...m..m..m..m...', '..m...m..m...m..'],
  canecorso: ['........mmmmm..', '.......mmmmmmm.', '.......mmemmmmn', '.......mmmmmmmm', '.m.....dmmmmmd.', '.mm...mmmmmm...', '..mmmmmmmmmm...', '..mmmmmmmmmm...', '..mlllmmmmm....', '..mm.mm..mm.mm.', '..mm.mm..mm.mm.'],
  shepherd: ['.........m..m..', '.........mmmm..', '........mmmemm.', '........mmmmmmn', '.mm.....mmmm...', 'mmmmmmmmmmmm...', '.mmmmmmmmmmm...', '..mlllmmmmm....', '..mm.m...m.mm..', '..mm.m...m.mm..'],
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
    return toCanvas(outline(fromMap(ICON_MAPS[it.icon], pal)));
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
    return toCanvas(outline(fromMap(open ? opened : closed, pal)));
  });
}

// =====================================================================
//  Aide : dessiner un sprite dans un <canvas> de l'interface
// =====================================================================
export function paint(canvas, sprite, { scale = 4, pad = 0, bg = null } = {}) {
  canvas.width = sprite.width * scale + pad * 2;
  canvas.height = sprite.height * scale + pad * 2;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(sprite, pad, pad, sprite.width * scale, sprite.height * scale);
}

/** Portrait : héros + son arme */
export function heroPortrait(classId, weaponKind, dyeId = null) {
  return cached(`portrait:${classId}:${dyeId || ''}`, () => {
    const h = heroCanvas(classId, dyeId);
    const w = weaponCanvas(weaponKind);
    const [px, py] = weaponPivot(weaponKind);
    const c = document.createElement('canvas');
    c.width = HERO_W + 6; c.height = HERO_H;
    const ctx = c.getContext('2d');
    ctx.drawImage(h, 0, 0);
    ctx.drawImage(w, HAND.x - px + (weaponKind === 'bow' ? 0 : 0), HAND.y - py);
    return c;
  });
}

export function rarityColor(r) { return RARITIES[r].color; }

// =====================================================================
//  PIERRE CLAT (monnaie verte)
// =====================================================================
export function clatCanvas() {
  return cached('clat', () => toCanvas(outline(fromMap(
    ['...ll...', '..lwml..', '.lmmmmd.', 'lmmmmmmd', 'dmmmmmdd', '.dmmmdd.', '..dmdd..', '...dd...'],
    { m: '#2ecc71', l: '#a8f0c0', d: '#1e8449', w: '#ffffff' },
  ))));
}
