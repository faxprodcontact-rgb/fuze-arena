// Skins élémentaires des héros (feu, glace, lumière, ténèbres) : à partir des 4 dessins de base (art/heros/<classe>.svg),
// toutes les couleurs (armure, tissu, cheveux, cuir, or, arme) sont refaites dans la gamme de l'élément, les yeux prennent
// la couleur de l'élément, et on ajoute des pièces : flammes, cristaux, auréole et ailes, cornes et ailes de chauve-souris.
// Écrit art/heros/skins/<classe>-<élément>.svg (même découpage en sections que les dessins de base) et refonte/apercu-skins.svg.
// node refonte/outils/skins.cjs
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'art', 'heros'), OUT = path.join(SRC, 'skins');
const CLASSES = ['guerrier', 'mage', 'archer', 'paladin'];
const O = '#1b1530';

// ---------------------------------------------------------------- couleurs
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
function hsl(h) {
  const [r, g, b] = hex2(h), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hh * 60, s, l];
}
const mix = (a, b, t) => '#' + hex2(a).map((v, i) => Math.round((v + (hex2(b)[i] - v) * t) * 255).toString(16).padStart(2, '0')).join('');
const STOPS = [0.15, 0.35, 0.55, 0.75, 0.92];
function ramp(list, l) {
  if (l <= STOPS[0]) return list[0];
  for (let i = 1; i < STOPS.length; i++) if (l <= STOPS[i]) return mix(list[i - 1], list[i], (l - STOPS[i - 1]) / (STOPS[i] - STOPS[i - 1]));
  return mix(list[4], '#ffffff', Math.min(1, (l - 0.92) / 0.08) * 0.6);
}
const KEEP = new Set([O, '#ffffff', '#7a2433']);
const SKIN = new Set(['#fdd2ad', '#eea07e', '#e0a875', '#ffc4b2', '#c8705c', '#ffe9d6', '#ff8b7e', '#e8706e', '#fff3d6']);
const GLOW = new Set(['#16225e', '#2d74dc', '#8fe3ff', '#c6f4ff', '#0b78b0', '#27c4ea', '#8ff5ff', '#f0ffff', '#e8ffff', '#0f2f5c', '#2f8fd8', '#b8ecff', '#d2f4ff']);
const HAIR = new Set(['#a8714a', '#6e4329', '#48291a', '#fff2a8', '#ffd45a', '#e0a42c', '#a8701a', '#e2e7f2', '#aeb7cf', '#7f88a6']);
function kind(h) {
  const [hh, s, l] = hsl(h);
  if (GLOW.has(h)) return 'glow';
  if (HAIR.has(h)) return 'hair';
  if (s < 0.35 || (l > 0.9 && s < 0.6)) return 'metal';
  if (hh >= 15 && hh <= 40 && s < 0.67 && l < 0.6) return 'leather';
  if (hh >= 34 && hh <= 55 && s > 0.7) return 'accent';
  return 'primary';
}
const EL = {
  feu: { name: 'Feu',
    primary: ['#2a0606', '#7a1208', '#d6340f', '#ff7a1a', '#ffd27a'], metal: ['#1a0e10', '#3c1c18', '#6a2c1e', '#b04a1e', '#ff9a4a'],
    hair: ['#5a0a04', '#b8260a', '#ff6a12', '#ffb03a', '#ffe680'],
    leather: ['#1a0a06', '#3a160a', '#5e2410', '#8a3a1a', '#b8643a'], accent: ['#a01a06', '#e8460e', '#ff8a1a', '#ffc23a', '#fff0a0'],
    glow: ['#7a1000', '#ff4a00', '#ff9a1a', '#ffd23a', '#fff6c0'], skin: null },
  glace: { name: 'Glace',
    primary: ['#081a40', '#123c86', '#2f78d6', '#7cc4ff', '#dff4ff'], hair: ['#3a6a9a', '#7ab4e0', '#c4e6ff', '#eef8ff', '#ffffff'], metal: ['#2c4a66', '#5a86ac', '#9cc8e6', '#d8f0ff', '#ffffff'],
    leather: ['#14243c', '#24405e', '#3a6286', '#5c8cb4', '#8cbadc'], accent: ['#4a8ac8', '#8cc8f0', '#c8ecff', '#eefaff', '#ffffff'],
    glow: ['#0a3a7a', '#2a9aff', '#7ad8ff', '#c8f4ff', '#ffffff'], skin: { '#fdd2ad': '#f6dcd0', '#eea07e': '#d8aaa8', '#e0a875': '#e0b8b0', '#ffe9d6': '#fff0ec' } },
  lumiere: { name: 'Lumière',
    primary: ['#5a3a08', '#a87414', '#e8b432', '#ffe48a', '#fffbe8'], hair: ['#a8701a', '#e0a42c', '#ffd45a', '#fff2a8', '#fffbe0'], metal: ['#7a7262', '#b8b0a0', '#e2dccc', '#f8f4ea', '#ffffff'],
    leather: ['#5a4020', '#8a6a3a', '#b8945a', '#dcc08a', '#f4e4bc'], accent: ['#c08a10', '#f2c22a', '#ffe060', '#fff2a8', '#fffde8'],
    glow: ['#a87400', '#ffcc00', '#ffe680', '#fff6c8', '#ffffff'], skin: null },
  tenebres: { name: 'Ténèbres',
    primary: ['#0a0414', '#1e0a34', '#3c145e', '#6a2a9a', '#a464e0'], hair: ['#120a1e', '#2a1a40', '#4a3466', '#7a62a0', '#b8a6dc'], metal: ['#08070c', '#16131e', '#2a2638', '#423c56', '#68608a'],
    leather: ['#0a0610', '#1a1222', '#2a1e36', '#3e2e4e', '#5a4670'], accent: ['#5a0a3a', '#a0186a', '#e0309a', '#ff6ac0', '#ffb8e4'],
    glow: ['#3a0060', '#8a20ff', '#c070ff', '#e8b8ff', '#ffffff'],
    skin: { '#fdd2ad': '#d4c8e2', '#eea07e': '#a898bc', '#e0a875': '#b8acd0', '#ffe9d6': '#ece4f4', '#c8705c': '#7a6890', '#ffc4b2': '#dccdec', '#ff8b7e': '#b07ac8', '#e8706e': '#9a5ab8', '#fff3d6': '#f2ecf8' } },
};
function remap(txt, E) {
  return txt.replace(/#[0-9a-fA-F]{6}\b/g, (raw) => {
    const h = raw.toLowerCase();
    if (KEEP.has(h)) return raw;
    if (SKIN.has(h)) return (E.skin && E.skin[h]) || raw;
    return ramp(E[kind(h)], hsl(h)[2]);
  });
}

// ---------------------------------------------------------------- pièces ajoutées (contour épais + aplat, style des dessins)
// Repères de chaque classe dans le cadre 240 × 300 : haut du crâne, centre de la tête, dos (épaules)
const A = {
  guerrier: { top: [130, 46], head: [128, 96], back: [104, 186], hw: 40 },
  mage: { top: [122, 14], head: [128, 104], back: [108, 186], hw: 40 },
  archer: { top: [128, 50], head: [128, 100], back: [102, 186], hw: 40 },
  paladin: { top: [124, 50], head: [124, 100], back: [100, 186], hw: 40 },
};
const out2 = (d, fill, sw = 6) => `<path d="${d}" fill="${fill}" stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const flat = (d, fill) => `<path d="${d}" fill="${fill}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
const T = (x, y, s = 1, extra = '') => `transform="translate(${x} ${y}) scale(${s})${extra}"`;
const FLAME = 'M0 0C-14 -6 -20 -22 -12 -36C-10 -26 -4 -22 -2 -26C-6 -40 2 -54 14 -62C10 -48 18 -40 22 -30C24 -38 30 -40 32 -46C38 -30 36 -12 24 -2C16 4 8 4 0 0Z';
const FLAME_IN = 'M4 -4C-4 -10 -6 -20 0 -28C2 -20 8 -18 10 -22C10 -30 14 -36 20 -40C20 -30 24 -24 24 -16C24 -8 16 -2 4 -4Z';
function fire(c, id) {
  const a = A[c], [tx, ty] = a.top, [bx, by] = a.back;
  const grad = `<defs><linearGradient id="${id}-fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3a0a"/><stop offset="0.55" stop-color="#ff9a1a"/><stop offset="1" stop-color="#ffe46a"/></linearGradient></defs>`;
  const fl = (x, y, s, r = 0) => `<g ${T(x, y, s, ` rotate(${r})`)}>${out2(FLAME, `url(#${id}-fl)`, 6)}${flat(FLAME_IN, '#fff2a0')}</g>`;
  // couronne de flammes autour du haut de la tête (derrière la tête) + manteau de flammes dans le dos
  const crown = [fl(tx - 44, ty + 34, 1.05, -32), fl(tx + 36, ty + 28, 1.1, 26), fl(tx - 14, ty + 18, 1.5, -6), fl(tx + 10, ty + 20, 1.2, 10)].join('');
  const cape = [fl(bx - 40, by + 96, 2.0, -16), fl(bx - 20, by + 50, 1.7, -6), fl(bx - 52, by + 40, 1.4, -34), fl(bx + 70, by + 30, 1.2, 28)].join('');
  return { defs: grad, back: cape, behindHead: crown, front: '' };
}
function ice(c, id) {
  const a = A[c], [tx, ty] = a.top, [bx, by] = a.back;
  const grad = `<defs><linearGradient id="${id}-ic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#bfeaff"/><stop offset="1" stop-color="#4aa6ff"/></linearGradient></defs>`;
  const shard = (x, y, h, w, r) => `<g ${T(x, y, 1, ` rotate(${r})`)}>${out2(`M0 0L${-w} ${-h * 0.35}L0 ${-h}L${w} ${-h * 0.35}Z`, `url(#${id}-ic)`, 5)}<path d="M0 ${-h}L0 0L${w} ${-h * 0.35}Z" fill="#7cc4ff" opacity="0.55"/><path d="M${-w * 0.45} ${-h * 0.4}L0 ${-h * 0.85}" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const crown = [shard(tx - 28, ty + 16, 40, 10, -24), shard(tx + 26, ty + 14, 40, 10, 22), shard(tx - 2, ty + 8, 60, 13, 0), shard(tx - 46, ty + 30, 26, 8, -46), shard(tx + 44, ty + 28, 26, 8, 44)].join('');
  const back = [shard(bx - 4, by + 6, 96, 18, -30), shard(bx + 12, by + 0, 74, 15, -10), shard(bx - 20, by + 26, 70, 14, -56), shard(bx + 66, by + 4, 60, 13, 28), shard(bx + 50, by - 4, 46, 11, 8)].join('');
  return { defs: grad, back, behindHead: '', front: crown };
}
function light(c, id) {
  const a = A[c], [tx, ty] = a.top, [bx, by] = a.back;
  const grad = `<defs><radialGradient id="${id}-hl" cx="0.5" cy="0.5" r="0.5"><stop offset="0.6" stop-color="#fff6c8" stop-opacity="0"/><stop offset="0.8" stop-color="#ffe680" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd23a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-wg" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#fff2c0"/><stop offset="1" stop-color="#f2c44a"/></linearGradient></defs>`;
  const halo = `<g ${T(tx, ty - 16)}><ellipse rx="44" ry="13" fill="url(#${id}-hl)"/><ellipse rx="30" ry="8" fill="none" stroke="${O}" stroke-width="9"/><ellipse rx="30" ry="8" fill="none" stroke="#ffd23a" stroke-width="5"/><ellipse rx="30" ry="8" fill="none" stroke="#fff6c8" stroke-width="1.6" transform="translate(0 -1.5)"/></g>`;
  const feather = (x, y, len, r) => `<g ${T(x, y, 1, ` rotate(${r})`)}>${out2(`M0 -4C${-len * 0.3} -22 ${-len * 0.8} -26 ${-len} -10C${-len * 0.9} 2 ${-len * 0.82} 8 ${-len * 0.7} 10C${-len * 0.4} 16 ${-len * 0.15} 14 0 10Z`, `url(#${id}-wg)`, 5)}<path d="M${-len * 0.1} 2C${-len * 0.4} -2 ${-len * 0.7} -6 ${-len * 0.92} -8" fill="none" stroke="#e8b84a" stroke-width="2" stroke-linecap="round"/></g>`;
  const wing = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip} 1)">${[feather(6, 40, 70, -32), feather(4, 30, 92, -16), feather(2, 18, 110, 0), feather(0, 6, 122, 16), feather(0, -4, 130, 32)].join('')}</g>`;
  return { defs: grad, back: wing(bx + 16, by - 30, 1) + wing(bx + 56, by - 36, -0.8), behindHead: '', front: halo };
}
function dark(c, id) {
  const a = A[c], [tx, ty] = a.top, [bx, by] = a.back;
  const grad = `<defs><linearGradient id="${id}-hn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a1e36"/><stop offset="0.6" stop-color="#4a3a5e"/><stop offset="1" stop-color="#c070ff"/></linearGradient>
    <linearGradient id="${id}-bw" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a2a8a"/><stop offset="1" stop-color="#1a0a2c"/></linearGradient></defs>`;
  const horn = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip} 1)">${out2('M0 0C-6 -14 -4 -30 8 -42C4 -30 8 -20 18 -14C12 -10 8 -4 8 4Z', `url(#${id}-hn)`, 5)}<path d="M3 -6C0 -16 2 -26 7 -34" fill="none" stroke="#c070ff" stroke-width="2" stroke-linecap="round" opacity="0.8"/></g>`;
  const horns = `<g transform="translate(${tx - 28} ${ty + 20}) scale(1.35)">${horn(0, 0, 1)}</g><g transform="translate(${tx + 28} ${ty + 20}) scale(1.35)">${horn(0, 0, -1)}</g>`;
  const bat = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip} 1)">${out2('M0 0C-20 -30 -60 -52 -96 -46C-86 -36 -84 -26 -88 -16C-76 -22 -66 -18 -62 -8C-52 -16 -40 -12 -36 -2C-26 -8 -14 -6 -6 6Z', `url(#${id}-bw)`, 6)}<path d="M-4 0C-30 -24 -60 -40 -90 -42M-8 2C-34 -12 -56 -18 -62 -8M-8 4C-24 -4 -34 -4 -36 -2" fill="none" stroke="#8a40c8" stroke-width="2.4" stroke-linecap="round"/></g>`;
  return { defs: grad, back: `<g transform="translate(${bx + 14} ${by - 14}) scale(1.55)">${bat(0, 0, 1)}</g><g transform="translate(${bx + 52} ${by - 20}) scale(1.2)">${bat(0, 0, -1)}</g>`, behindHead: '', front: horns };
}
const MAKERS = { feu: fire, glace: ice, lumiere: light, tenebres: dark };

// ---------------------------------------------------------------- assemblage
function build(c, el) {
  let t = fs.readFileSync(path.join(SRC, c + '.svg'), 'utf8');
  const id = `${c.slice(0, 2)}${el.slice(0, 2)}`;
  // identifiants uniques (dégradés, découpes) pour pouvoir mettre plusieurs dessins sur une même page
  const ids = [...t.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  for (const x of ids) t = t.split(`"${x}"`).join(`"${id}-${x}"`).split(`#${x})`).join(`#${id}-${x})`).split(`"#${x}"`).join(`"#${id}-${x}"`);
  t = remap(t, EL[el]);
  const P = MAKERS[el](c, id);
  // les pièces du dos vont juste après le titre de la 1re section après l'ombre (le jeu ne garde que ce qui suit ce titre)
  const i0 = t.indexOf('<!-- ===== OMBRE AU SOL'), i1 = t.indexOf('\n', t.indexOf('<!-- =====', i0 + 10)) + 1;
  const iHead = t.indexOf('<!-- ===== TÊTE'), iW = t.indexOf('<!-- ===== ARME');
  t = t.slice(0, i1) + `<!-- skin ${el} : dans le dos -->${P.back}\n` + t.slice(i1, iHead) + `<!-- skin ${el} : derrière la tête -->${P.behindHead}\n`
    + t.slice(iHead, iW) + `<!-- skin ${el} : devant -->${P.front}\n` + t.slice(iW);
  t = t.replace('</defs>', `${P.defs.replace(/<\/?defs>/g, '')}</defs>`);
  return t;
}
fs.mkdirSync(OUT, { recursive: true });
const sheet = [];
CLASSES.forEach((c, row) => {
  const base = fs.readFileSync(path.join(SRC, c + '.svg'), 'utf8').replace(/<svg [^>]*>/, `<svg x="0" y="${row * 300}" width="240" height="300" viewBox="-30 -40 300 340">`);
  sheet.push(base);
  Object.keys(EL).forEach((el, col) => {
    const svg = build(c, el);
    fs.writeFileSync(path.join(OUT, `${c}-${el}.svg`), svg);
    sheet.push(svg.replace(/<svg [^>]*>/, `<svg x="${(col + 1) * 240}" y="${row * 300}" width="240" height="300" viewBox="-30 -40 300 340">`));
  });
});
fs.writeFileSync(path.join(ROOT, 'refonte', 'apercu-skins.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200"><rect width="1200" height="1200" fill="#2a2470"/>${sheet.join('\n')}</svg>`);
console.log('16 skins écrits dans art/heros/skins/, aperçu : refonte/apercu-skins.svg');
