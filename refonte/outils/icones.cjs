// Icônes de l'interface (refonte) : écrit art/ui/<nom>.svg (viewBox 64 × 64) pour tout le jeu.
// node refonte/outils/icones.cjs
// Style de la maquette (refonte/art/ui/*.svg) : contour #1b1530 de 2,2, « doublure » de 6 sous chaque dessin,
// volume en 3 tons décalés vers le haut-gauche (ombre en bas à droite), reflet clair et étincelles blanches.
// Les 15 icônes de la maquette sont reprises telles quelles (copiées sous le nom utilisé par le jeu).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'refonte', 'art', 'ui');
const OUT = path.join(ROOT, 'art', 'ui');
fs.mkdirSync(OUT, { recursive: true });
const O = '#1b1530';
const r1 = v => +(+v).toFixed(2);

// tons : [clair, base, ombre, profonde]
const T = {
  gold: ['#fff7c4', '#f7bc2a', '#cd7e15', '#8f4c0a'],
  steel: ['#ffffff', '#c3cce0', '#9ba7c3', '#6f7a9b'],
  white: ['#ffffff', '#f4f6fb', '#cdd3e2', '#9aa2bd'],
  red: ['#ff8a7a', '#e3343d', '#a81d35', '#6e1129'],
  blue: ['#9fd0ff', '#3773d8', '#23499c', '#162f6c'],
  green: ['#c4f79a', '#4ea83c', '#2f7432', '#1c4a26'],
  purple: ['#d6b8ff', '#7d47cc', '#532b96', '#351868'],
  wood: ['#e0a875', '#9a6234', '#6b3d1f', '#45230f'],
  leather: ['#e0a875', '#b07a48', '#7a4e2a', '#4b2e1a'],
  bone: ['#ffffff', '#f3ecd8', '#cdbf9e', '#9c8a68'],
  paper: ['#fffaf0', '#f3e6c8', '#cdb68e', '#9c8460'],
  skin: ['#ffe9d6', '#fdd2ad', '#eea07e', '#c8705c'],
  stone: ['#d8d4ea', '#9a94b8', '#6e6890', '#4a4466'],
  orange: ['#ffe08a', '#ff8a2a', '#d0561a', '#8a2e0e'],
  silver: ['#ffffff', '#d4dae8', '#a8b2c8', '#77819c'],
  bronze: ['#ffd2a0', '#d98a4a', '#a85e2a', '#6e3a18'],
  cyan: ['#e8ffff', '#5ad8f0', '#2a9ec4', '#156a8e'],
  night: ['#6a5ad0', '#3b2f8a', '#2a2066', '#1a1448'],
};

// ---------------------------------------------------------------- formes { d, box }
function bboxOf(d) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number), xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  const x = Math.min(...xs), y = Math.min(...ys);
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
}
const P = d => ({ d, box: bboxOf(d) });
const E = (cx, cy, rx, ry = rx) => ({ d: `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx + rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx - rx)} ${r1(cy)}Z`, box: [cx - rx, cy - ry, 2 * rx, 2 * ry] });
const RR = (x, y, w, h, r) => ({ d: `M${r1(x + r)} ${r1(y)}L${r1(x + w - r)} ${r1(y)}Q${r1(x + w)} ${r1(y)} ${r1(x + w)} ${r1(y + r)}L${r1(x + w)} ${r1(y + h - r)}Q${r1(x + w)} ${r1(y + h)} ${r1(x + w - r)} ${r1(y + h)}L${r1(x + r)} ${r1(y + h)}Q${r1(x)} ${r1(y + h)} ${r1(x)} ${r1(y + h - r)}L${r1(x)} ${r1(y + r)}Q${r1(x)} ${r1(y)} ${r1(x + r)} ${r1(y)}Z`, box: [x, y, w, h] });
const poly = pts => P('M' + pts.map(q => `${r1(q[0])} ${r1(q[1])}`).join('L') + 'Z');
function star(cx, cy, n, R, r, a0 = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = a0 + i * Math.PI / n, rr = i % 2 ? r : R; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return poly(pts);
}
const spark4 = (x, y, r) => { const k = r * 0.28; return `M${r1(x)} ${r1(y - r)}L${r1(x + k)} ${r1(y - k)}L${r1(x + r)} ${r1(y)}L${r1(x + k)} ${r1(y + k)}L${r1(x)} ${r1(y + r)}L${r1(x - k)} ${r1(y + k)}L${r1(x - r)} ${r1(y)}L${r1(x - k)} ${r1(y - k)}Z`; };

// ---------------------------------------------------------------- une icône
function Icon(prefix) {
  const defs = [], body = [];
  let n = 0;
  const id = k => `${prefix}-${k}${n++}`;
  // doublure (contour extérieur épais) juste sous chaque pièce : les pièces de devant recouvrent celles de derrière
  const dbl = (d, w = 6) => `<path d="${d}" fill="${O}" stroke="${O}" stroke-width="${w}"/>`;
  const I = {
    defs, body,
    // volume cel-shadé : profonde (fond), ombre et base décalées vers le haut-gauche, reflet, contour
    vol(sh, t, o = {}) {
      const [L, B, S, D] = typeof t === 'string' ? T[t] : t;
      const c = id('c');
      defs.push(`<clipPath id="${c}"><path d="${sh.d}"/></clipPath>`);
      const k = o.k ?? 3.2, [x, y, w, h] = sh.box;
      let g = (o.dbl === false ? '' : dbl(sh.d, o.dw ?? 6)) + `<g clip-path="url(#${c})"><rect x="-8" y="-8" width="80" height="80" fill="${D}"/>`;
      g += `<path transform="translate(${r1(-k * 0.4)} ${r1(-k * 0.45)})" d="${sh.d}" fill="${S}"/>`;
      g += `<path transform="translate(${r1(-k)} ${r1(-k * 1.1)})" d="${sh.d}" fill="${B}"/>`;
      if (o.hl !== false) {
        const hx = x + w * 0.3, hy = y + h * 0.26;
        g += `<ellipse cx="${r1(hx)}" cy="${r1(hy)}" rx="${r1(Math.max(1.2, w * 0.2))}" ry="${r1(Math.max(0.9, h * 0.12))}" transform="rotate(-28 ${r1(hx)} ${r1(hy)})" fill="${L}"/>`;
        if (o.gloss !== false && w > 10 && h > 10) g += `<circle cx="${r1(x + w * 0.2)}" cy="${r1(y + h * 0.2)}" r="${r1(Math.min(w, h) * 0.05 + 0.6)}" fill="#ffffff"/>`;
      }
      if (o.extra) g += o.extra;
      g += '</g>';
      if (o.sw !== 0) g += `<path d="${sh.d}" fill="none" stroke="${O}" stroke-width="${o.sw ?? 2.2}"/>`;
      body.push(g);
    },
    // aplat avec contour (petits détails)
    flat(sh, fill, sw = 1.6, extra = '') { body.push(`<path d="${sh.d || sh}" fill="${fill}"${sw ? ` stroke="${O}" stroke-width="${sw}"` : ''}${extra}/>`); },
    // trait épais cerné (cordes, poignées, vagues) : contour sombre puis couleur, puis reflet fin
    rope(d, col, w = 4, hi = null) {
      body.push(`<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + 4.4}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>` + (hi ? `<path d="${d}" fill="none" stroke="${hi}" stroke-width="${Math.max(1, w * 0.3)}" transform="translate(-0.6 -0.8)"/>` : ''));
    },
    line(d, col = O, w = 2) { body.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`); },
    spark(x, y, r, col = '#ffffff') { body.push(`<path d="${spark4(x, y, r)}" fill="${col}" stroke="${O}" stroke-width="1.3"/>`); },
    glow(cx, cy, r, col, a = 0.75) {
      const g = id('h');
      defs.push(`<radialGradient id="${g}"><stop offset="0" stop-color="${col}" stop-opacity="${a}"/><stop offset="0.55" stop-color="${col}" stop-opacity="${a * 0.35}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`);
      body.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>`);
    },
    raw(x) { body.push(x); },
    // reprend une icône de la maquette (ids renommés), avec transformation et changement de couleurs
    embed(name, transform = '', map = null) {
      let s = fs.readFileSync(fs.existsSync(path.join(SRC, name + '.svg')) ? path.join(SRC, name + '.svg') : path.join(OUT, name + '.svg'), 'utf8');
      const tag = id('e');
      s = s.replace(/id="([^"]+)"/g, (m, a) => `id="${tag}-${a}"`).replace(/url\(#([^)]+)\)/g, (m, a) => `url(#${tag}-${a})`);
      if (map) s = s.replace(/#[0-9a-fA-F]{6}\b/g, h => map[h.toLowerCase()] || h);
      const dd = (s.match(/<defs>([\s\S]*?)<\/defs>/) || ['', ''])[1];
      const inner = s.replace(/^[\s\S]*?<g stroke-linejoin="round" stroke-linecap="round">/, '').replace(/<\/g>\s*<\/svg>\s*$/, '');
      defs.push(dd);
      body.push(`<g transform="${transform}">${inner}</g>`);
    },
    write(name, title) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n<!-- Fuze Arena : icône « ${title} » (préfixe ${prefix}-), générée par refonte/outils/icones.cjs -->\n<defs>${defs.join('')}</defs>\n<g stroke-linejoin="round" stroke-linecap="round">\n${body.join('\n')}\n</g>\n</svg>\n`;
      fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
      return svg.length;
    },
  };
  return I;
}
const ICONS = {};
const def = (name, title, fn) => { ICONS[name] = () => { const I = Icon(name.replace(/[^a-z0-9]/gi, '').slice(0, 10)); fn(I); return I.write(name, title); }; };

// ---------------------------------------------------------------- reprises de la maquette
const COPY = { heart: 'coeur', star: 'etoile', crown: 'couronne', shield: 'bouclier', bolt: 'eclair', hourglass: 'sablier', bag: 'sac', key: 'clef', flouze: 'flouze', sword: 'epee', pause: 'pause', 'skull-wave': 'crane-vague', 'skull-boss': 'crane-boss', 'skull-done': 'crane-fait', 'coffre-normal': 'coffre' };
for (const [name, src] of Object.entries(COPY)) ICONS[name] = () => { const s = fs.readFileSync(path.join(SRC, src + '.svg'), 'utf8'); fs.writeFileSync(path.join(OUT, name + '.svg'), s); return s.length; };

// ---------------------------------------------------------------- petites icônes
def('swords', 'deux épées croisées', I => { I.embed('epee', 'translate(-6 0)'); I.embed('epee', 'translate(70 0) scale(-1 1)'); });
def('trophy', 'coupe', I => {
  I.rope('M18 14C7 13 7 28 20 29', '#f7bc2a', 4, '#fff7c4'); I.rope('M46 14C57 13 57 28 44 29', '#f7bc2a', 4, '#fff7c4');
  I.vol(P('M28 37L36 37L35 47L29 47Z'), 'gold', { hl: false });
  I.vol(RR(18, 46, 28, 11, 3), 'wood'); I.flat(RR(24, 49, 16, 4.5, 1.5), '#f7bc2a', 1.3);
  I.vol(P('M15 8L49 8L47 24C46 33 40 39 32 39C24 39 18 33 17 24Z'), 'gold');
  I.raw(`<path d="${star(32, 22, 5, 6.5, 2.8).d}" fill="#fff7c4" stroke="#cd7e15" stroke-width="1.2"/>`);
  I.spark(51, 8, 4.5);
});
def('play', 'lecture', I => { I.vol(P('M20 12C20 9 23 7.5 26 9.5L50 29C52.5 31 52.5 33 50 35L26 54.5C23 56.5 20 55 20 52Z'), 'white'); });
def('skip', 'passer', I => {
  I.vol(P('M10 16C10 13 13 12 15 14L30 29C32 31 32 33 30 35L15 50C13 52 10 51 10 48Z'), 'white', { gloss: false });
  I.vol(P('M28 16C28 13 31 12 33 14L48 29C50 31 50 33 48 35L33 50C31 52 28 51 28 48Z'), 'white', { gloss: false });
  I.vol(RR(48, 14, 7, 36, 2.5), 'white', { hl: false });
});
def('chat', 'bulle de discussion', I => {
  I.vol(P('M8 15C8 10 12 7 17 7L47 7C52 7 56 10 56 15L56 35C56 40 52 43 47 43L27 43L15 54L18 43L17 43C12 43 8 40 8 35Z'), 'white');
  for (const x of [21, 32, 43]) I.flat(E(x, 25, 3.8), '#3773d8', 1.6);
});
def('sparkle', 'étincelle', I => { I.vol(P(spark4(30, 34, 24)), 'gold'); I.spark(50, 12, 6); I.spark(12, 12, 3.5); });
def('magic', 'magie', I => { I.vol(P(spark4(30, 34, 24)), 'purple'); I.spark(50, 12, 6, '#e8d8ff'); I.spark(12, 12, 3.5, '#e8d8ff'); });
def('clock', 'horloge', I => {
  I.vol(RR(27, 3, 10, 7, 2), 'gold', { hl: false });
  I.vol(E(32, 35, 25), 'gold');
  I.vol(E(32, 35, 18.5), 'white', { dbl: false, sw: 1.8 });
  I.line('M32 21v3M32 46v3M18 35h3M43 35h3', '#9aa2bd', 2.2);
  I.line('M32 35L32 24', O, 3.4); I.line('M32 35L41 39', O, 3.4);
  I.flat(E(32, 35, 3), '#e3343d', 1.4);
});
def('fist', 'poing', I => {
  I.vol(RR(12, 22, 40, 34, 10), 'skin');
  for (let i = 0; i < 4; i++) I.vol(RR(13 + i * 9.5, 12, 10, 20, 5), 'skin', { k: 2, gloss: false });
  I.vol(P('M10 38C10 31 16 29 23 31L38 34C43 35 43 42 38 43L21 44C14 44 10 43 10 38Z'), 'skin', { k: 2 });
  I.vol(RR(18, 53, 28, 8, 3), 'red', { hl: false, k: 1.4 });
});
def('check', 'validé', I => { I.vol(P('M7 34L19 22L28 31L46 9L58 21L28 55Z'), 'green'); });
def('wind', 'vent', I => {
  I.rope('M6 20H36C45 20 47 9 39 8C35 8 33 11 34 14', '#bfe8ff', 4.5, '#ffffff');
  I.rope('M6 33H50C58 33 59 44 52 45C48 45 46 42 47 39', '#bfe8ff', 4.5, '#ffffff');
  I.rope('M10 46H30C37 46 38 55 32 56', '#bfe8ff', 4.5, '#ffffff');
});
def('lock', 'cadenas', I => {
  I.rope('M21 30V20C21 12 26 7 32 7C38 7 43 12 43 20V30', '#c3cce0', 5, '#ffffff');
  I.vol(RR(12, 27, 40, 31, 6), 'gold');
  I.flat(P('M28.5 39A3.5 3.5 0 1 1 35.5 39L35 50H29Z'), O, 0);
});
def('flag', 'drapeau', I => {
  I.vol(RR(10, 8, 6, 52, 2.5), 'wood', { hl: false });
  I.vol(P('M16 10C25 5 34 14 44 9C48 7 52 6 56 6L56 31C48 35 40 28 30 32C25 34 20 35 16 34Z'), 'red');
  I.vol(E(13, 7, 4.5), 'gold', { hl: false });
});
def('dice', 'dé', I => {
  I.raw(`<path d="M32 6L56 17L56 46L32 58L8 46L8 17Z" fill="${O}" stroke="${O}" stroke-width="6"/>`);
  I.flat(P('M32 6L56 17L32 28L8 17Z'), '#ffffff', 2);
  I.flat(P('M8 17L32 28L32 58L8 46Z'), '#e4e8f4', 2);
  I.flat(P('M32 28L56 17L56 46L32 58Z'), '#b8c0d8', 2);
  I.flat(E(32, 17, 3.4, 2), O, 0); I.flat(E(15, 29, 2.4, 3), O, 0); I.flat(E(25, 45, 2.4, 3), O, 0);
  I.flat(E(39, 32, 2.4, 3), O, 0); I.flat(E(44, 38, 2.4, 3), O, 0); I.flat(E(49, 44, 2.4, 3), O, 0);
});
def('cross', 'croix', I => { I.vol(P('M9 18L18 9L32 23L46 9L55 18L41 32L55 46L46 55L32 41L18 55L9 46L23 32Z'), 'red'); });
def('boom', 'explosion', I => {
  I.vol(star(32, 33, 11, 29, 16), 'orange', { gloss: false });
  I.vol(star(31, 33, 8, 16, 9), ['#ffffff', '#ffe168', '#f7bc2a', '#cd7e15'], { dbl: false, sw: 1.6, k: 2 });
  I.flat(E(29, 30, 4), '#ffffff', 0);
});
def('up', 'progression', I => { I.vol(P('M32 5L57 31L43 31L43 58L21 58L21 31L7 31Z'), 'green'); });
def('target', 'cible', I => {
  I.vol(E(30, 34, 25), 'red');
  I.flat(E(30, 34, 18.5), '#ffffff', 1.8); I.flat(E(30, 34, 12), '#e3343d', 1.8); I.flat(E(30, 34, 5.5), '#ffffff', 1.6);
  I.rope('M30 34L54 10', '#9a6234', 3); I.flat(P('M52 6L60 4L58 12L54 10Z'), '#ffffff', 1.4);
});
def('scroll', 'parchemin', I => {
  I.vol(RR(14, 12, 36, 40, 2), 'paper');
  I.line('M20 22H44M20 29H44M20 36H38M20 43H42', '#b8a070', 2.2);
  I.vol(RR(8, 6, 48, 10, 5), 'paper', { k: 2 }); I.vol(RR(8, 48, 48, 10, 5), 'paper', { k: 2 });
});
def('paw', 'patte', I => {
  I.vol(P('M18 46C18 37 25 32 32 32C39 32 46 37 46 46C46 53 41 57 32 57C23 57 18 53 18 46Z'), 'leather');
  for (const [x, y] of [[13, 27], [24, 15], [40, 15], [51, 27]]) I.vol(E(x, y, 6, 7.5), 'leather', { k: 2 });
});
def('helmet', 'casque', I => {
  I.vol(P('M24 8C26 2 38 2 40 8L38 16L26 16Z'), 'red', { hl: false, k: 2 });
  I.vol(P('M11 42C11 22 19 10 32 10C45 10 53 22 53 42L53 52L11 52Z'), 'steel');
  I.flat(RR(16, 31, 32, 5, 2), O, 0);
  I.vol(RR(29, 33, 6, 19, 2.5), 'steel', { hl: false, dbl: false, k: 1.6 });
  I.vol(RR(8, 49, 48, 8, 3), 'gold');
  I.spark(22, 16, 4);
});
def('gear', 'réglages', I => {
  const pts = [];
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; for (const [da, r] of [[-0.24, 21], [-0.16, 28], [0.16, 28], [0.24, 21]]) pts.push([32 + Math.cos(a + da) * r, 32 + Math.sin(a + da) * r]); }
  I.vol(poly(pts), 'steel');
  I.flat(E(32, 32, 8), '#2e2550', 2);
});
def('fire', 'feu', I => {
  I.vol(P('M32 4C36 14 48 20 50 34C52 48 43 59 32 59C21 59 12 50 14 37C15 29 20 25 22 18C26 24 26 28 28 30C30 22 28 12 32 4Z'), ['#ffb08a', '#ff5a1f', '#c83a14', '#8a1e0e']);
  I.flat(P('M32 22C36 30 43 34 43 44C43 52 38 57 32 57C26 57 21 52 22 45C23 40 26 38 27 34C29 38 30 40 31 40C31 34 30 28 32 22Z'), '#ffb02e', 0);
  I.flat(P('M32 38C34 43 38 46 38 50C38 54 35 56 32 56C29 56 26 54 26 50C26 47 29 45 32 38Z'), '#fff3a0', 0);
});
def('boot', 'botte', I => {
  I.vol(P('M18 10L38 10L38 36L50 41C56 43 57 51 53 54L16 54C14 54 13 52 13.5 50L17 34Z'), 'leather');
  I.vol(RR(15, 6, 26, 9, 3), ['#ffe0b8', '#d8a06a', '#a8743e', '#6e4a22'], { hl: false });
  I.vol(RR(12, 51, 45, 7, 3), ['#6a5a50', '#45230f', '#2e1608', '#1e0e04'], { hl: false, k: 1.4 });
});
def('amulet', 'amulette', I => {
  I.rope('M13 5C13 23 23 30 32 31C41 30 51 23 51 5', '#f7bc2a', 2.6, '#fff7c4');
  I.vol(P('M32 26L47 41L32 59L17 41Z'), 'gold');
  I.vol(P('M32 32L41 41L32 52L23 41Z'), 'purple', { dbl: false, sw: 1.6, k: 2 });
});
const NUM = { 1: 'M28 34L33 30V50', 2: 'M27 34C28 29 37 29 37 34C37 39 27 44 27 49H38', 3: 'M27 31H37L31 38C37 37 39 42 37 46C35 50 29 50 27 47' };
for (const [k, t, rib] of [[1, 'gold', ['#e3343d', '#3773d8']], [2, 'silver', ['#3773d8', '#e3343d']], [3, 'bronze', ['#4ea83c', '#e3343d']]]) {
  def('medal' + k, 'médaille ' + k, I => {
    I.vol(P('M18 3L30 3L35 22L26 26Z'), [rib[0], rib[0], rib[0], rib[0]].map((c, i) => i ? c : '#ffffff'), { hl: false, k: 1.4 });
    I.vol(P('M46 3L34 3L29 22L38 26Z'), [rib[1], rib[1], rib[1], rib[1]].map((c, i) => i ? c : '#ffffff'), { hl: false, k: 1.4 });
    I.vol(E(32, 40, 18), t);
    I.flat(E(32, 40, 12.5), 'none', 1.6, ` stroke-opacity="0.35"`);
    I.raw(`<path d="${NUM[k]}" fill="none" stroke="${T[t][3]}" stroke-width="4"/>`);
  });
}
def('speaker', 'son', I => {
  I.vol(RR(8, 23, 13, 18, 3), 'steel', { hl: false }); I.vol(P('M19 23L35 10L35 54L19 41Z'), 'steel');
  I.rope('M42 24C46 28 46 36 42 40', '#9fd0ff', 3.5); I.rope('M48 17C56 25 56 39 48 47', '#9fd0ff', 3.5);
});
def('mute', 'muet', I => {
  I.vol(RR(8, 23, 13, 18, 3), 'steel', { hl: false }); I.vol(P('M19 23L35 10L35 54L19 41Z'), 'steel');
  I.vol(P('M40 25L44 21L49 26L54 21L58 25L53 30L58 35L54 39L49 34L44 39L40 35L45 30Z'), 'red', { hl: false, k: 1.6 });
});
def('plus', 'plus', I => { I.vol(P('M25 7H39V25H57V39H39V57H25V39H7V25H25Z'), 'green'); });
def('skull', 'crâne', I => { skull(I, 32, 34, 1.15, '#5dff9a'); });

// crâne (pour plusieurs emblèmes) : x, y = centre du crâne, k = taille
function skull(I, x, y, k, eye) {
  const s = v => r1(v * k);
  I.vol(P(`M${r1(x - 18 * k)} ${r1(y)}C${r1(x - 18 * k)} ${r1(y - 14 * k)} ${r1(x - 9 * k)} ${r1(y - 20 * k)} ${x} ${r1(y - 20 * k)}C${r1(x + 9 * k)} ${r1(y - 20 * k)} ${r1(x + 18 * k)} ${r1(y - 14 * k)} ${r1(x + 18 * k)} ${r1(y)}C${r1(x + 18 * k)} ${r1(y + 7 * k)} ${r1(x + 14 * k)} ${r1(y + 10 * k)} ${r1(x + 11 * k)} ${r1(y + 11 * k)}L${r1(x + 11 * k)} ${r1(y + 18 * k)}L${r1(x - 11 * k)} ${r1(y + 18 * k)}L${r1(x - 11 * k)} ${r1(y + 11 * k)}C${r1(x - 14 * k)} ${r1(y + 10 * k)} ${r1(x - 18 * k)} ${r1(y + 7 * k)} ${r1(x - 18 * k)} ${r1(y)}Z`), 'bone');
  for (const dx of [-7.5, 7.5]) {
    I.flat(E(x + dx * k, y + 1 * k, 5.6 * k, 5 * k), O, 0);
    I.glow(r1(x + dx * k), r1(y + 1.5 * k), r1(6 * k), eye, 0.9);
    I.flat(E(x + dx * k, y + 1.5 * k, 2.4 * k, 2.2 * k), eye, 0);
    I.flat(E(x + dx * k - 0.8 * k, y + 0.7 * k, 0.9 * k), '#ffffff', 0);
  }
  I.flat(P(`M${x} ${r1(y + 6 * k)}L${r1(x + 2.6 * k)} ${r1(y + 10 * k)}L${r1(x - 2.6 * k)} ${r1(y + 10 * k)}Z`), O, 0);
  I.line(`M${r1(x - 5 * k)} ${r1(y + 13 * k)}V${r1(y + 18 * k)}M${x} ${r1(y + 13 * k)}V${r1(y + 18 * k)}M${r1(x + 5 * k)} ${r1(y + 13 * k)}V${r1(y + 18 * k)}`, O, s(1.8));
}

// ---------------------------------------------------------------- emblèmes des modes de jeu
def('emb-arena', 'arène', I => { I.embed('epee', 'translate(-4 -4)'); I.embed('epee', 'translate(68 -4) scale(-1 1)'); I.embed('bouclier', 'translate(14 18) scale(0.56)'); I.spark(52, 46, 4.5); });
def('emb-dungeons', 'donjons', I => {
  I.vol(P('M6 60V28C6 13 18 4 32 4C46 4 58 13 58 28V60Z'), 'stone');
  I.line('M6 40H14M50 40H58M6 50H14M50 50H58M18 9L21 15M46 9L43 15M32 4V10', '#4a4466', 1.8);
  I.flat(P('M15 60V30C15 20 22 13 32 13C42 13 49 20 49 30V60Z'), '#241c3a', 2);
  skull(I, 32, 38, 0.75, '#5dff9a');
  I.line('M19 60V30M27 60V18M37 60V18M45 60V30M15 48H49', '#6e6890', 2.6);
});
function helmetSide(I, x, flip, t) {
  const f = v => r1(x + v * flip);
  I.vol(P(`M${f(-14)} 52C${f(-16)} 34 ${f(-10)} 18 ${f(4)} 16C${f(14)} 15 ${f(17)} 24 ${f(16)} 32L${f(16)} 52Z`), t);
  I.flat(P(`M${f(2)} 30L${f(16)} 30L${f(16)} 35L${f(2)} 35Z`), O, 0);
  I.vol(P(`M${f(-4)} 16C${f(-12)} 6 ${f(-20)} 8 ${f(-24)} 14C${f(-16)} 12 ${f(-10)} 16 ${f(-6)} 22Z`), t === 'blue' ? 'gold' : 'gold', { hl: false, k: 1.6 });
  I.vol(RR(Math.min(f(-16), f(18)), 49, 34, 7, 3), 'gold', { hl: false, k: 1.6 });
}
def('emb-pvp', 'défi en direct', I => {
  I.embed('helmet', 'translate(-3 14) scale(0.62)', { '#ff8a7a': '#9fd0ff', '#e3343d': '#3773d8', '#a81d35': '#23499c', '#6e1129': '#162f6c', '#c3cce0': '#8fbfff', '#9ba7c3': '#4a86e0', '#6f7a9b': '#2a5cb0' });
  I.embed('helmet', 'translate(67 14) scale(-0.62 0.62)', { '#c3cce0': '#ff9a8a', '#9ba7c3': '#e3504a', '#6f7a9b': '#a82a35' });
  I.embed('eclair', 'translate(17 2) scale(0.47)');
});
def('emb-shop', 'boutique', I => {
  I.vol(P('M20 25C10 33 8 46 13 53C18 60 46 60 51 53C56 46 54 33 44 25Z'), 'leather');
  I.vol(P('M22 22C19 13 25 9 28 13C30 7 34 7 36 13C39 9 45 13 42 22Z'), 'leather', { k: 2 });
  I.vol(RR(22, 20, 20, 7, 3.5), 'gold', { hl: false, k: 1.4 });
  I.vol(E(32, 43, 9), 'gold', { k: 2 }); I.raw(`<path d="M29 38H36M29 38V48M29 43H34" fill="none" stroke="#8f4c0a" stroke-width="2.6"/>`);
  I.vol(E(12, 55, 6, 3.5), 'gold', { hl: false, k: 1.2 }); I.vol(E(52, 56, 6, 3.5), 'gold', { hl: false, k: 1.2 });
  I.spark(52, 18, 4.5);
});
def('emb-journal', 'journal', I => {
  I.vol(P('M3 20C14 14 26 16 32 22C38 16 50 14 61 20L61 56C50 51 38 52 32 58C26 52 14 51 3 56Z'), 'blue', { hl: false });
  I.vol(P('M7 17C17 13 27 15 32 21L32 54C26 49 17 48 7 51Z'), 'paper', { dbl: false, sw: 1.8 });
  I.vol(P('M57 17C47 13 37 15 32 21L32 54C38 49 47 48 57 51Z'), 'paper', { dbl: false, sw: 1.8, hl: false });
  I.line('M12 25C18 23 24 24 28 27M12 32C18 30 24 31 28 34M12 39C18 37 24 38 28 41M36 27C40 24 46 23 52 25M36 34C40 31 46 30 52 32', '#b8a070', 1.8);
  I.vol(P('M42 15L49 15L49 36L45.5 32L42 36Z'), 'red', { hl: false, k: 1.4 });
});
def('emb-talk', 'discussion', I => {
  I.vol(P('M24 6C24 3 26 2 29 2L55 2C58 2 60 4 60 7L60 25C60 28 58 30 55 30L54 30L56 39L46 30L29 30C26 30 24 28 24 25Z'), 'blue');
  I.vol(P('M4 23C4 20 6 18 9 18L39 18C42 18 44 20 44 23L44 43C44 46 42 48 39 48L21 48L10 58L12 48L9 48C6 48 4 46 4 43Z'), 'white');
  for (const x of [14, 24, 34]) I.flat(E(x, 33, 3.2), '#3773d8', 1.4);
});
def('emb-throne', 'trône', I => {
  I.vol(P('M14 44V14C14 8 20 4 32 4C44 4 50 8 50 14V44Z'), 'gold');
  I.vol(P('M19 42V16C19 12 24 9 32 9C40 9 45 12 45 16V42Z'), 'red', { dbl: false, sw: 1.8 });
  I.vol(RR(8, 30, 9, 22, 3), 'gold', { hl: false, k: 1.6 }); I.vol(RR(47, 30, 9, 22, 3), 'gold', { hl: false, k: 1.6 });
  I.vol(RR(12, 40, 40, 10, 4), 'red');
  I.vol(RR(12, 48, 6, 13, 2), 'gold', { hl: false, k: 1.4 }); I.vol(RR(46, 48, 6, 13, 2), 'gold', { hl: false, k: 1.4 });
  I.embed('couronne', 'translate(17 11) scale(0.47)');
});
def('emb-ranking', 'classement', I => {
  I.vol(RR(4, 40, 18, 21, 2.5), 'silver'); I.vol(RR(42, 45, 18, 16, 2.5), 'bronze'); I.vol(RR(21, 31, 22, 30, 2.5), 'gold');
  I.raw(`<path d="M30 39L33 37V50" fill="none" stroke="#8f4c0a" stroke-width="3"/><path d="M10 47C10 44 16 44 16 47C16 50 10 52 10 55H16" fill="none" stroke="#77819c" stroke-width="2.4"/><path d="M48 50H54L50 54C54 54 54 59 50 59" fill="none" stroke="#6e3a18" stroke-width="2.4"/>`);
  I.rope('M25 11C19 11 19 19 26 20', '#f7bc2a', 2.4); I.rope('M39 11C45 11 45 19 38 20', '#f7bc2a', 2.4);
  I.vol(P('M24 6L40 6L39 16C38 22 35 24 32 24C29 24 26 22 25 16Z'), 'gold', { k: 2 });
  I.vol(RR(27, 24, 10, 6, 2), 'gold', { hl: false, k: 1.4 });
});
function head(I, x, y, k, helm) {
  I.vol(E(x, y + 3 * k, 9 * k, 9 * k), 'skin', { k: 2 * k });
  I.vol(P(`M${r1(x - 10 * k)} ${r1(y + 2 * k)}C${r1(x - 10 * k)} ${r1(y - 9 * k)} ${r1(x - 4 * k)} ${r1(y - 12 * k)} ${x} ${r1(y - 12 * k)}C${r1(x + 4 * k)} ${r1(y - 12 * k)} ${r1(x + 10 * k)} ${r1(y - 9 * k)} ${r1(x + 10 * k)} ${r1(y + 2 * k)}L${r1(x + 6 * k)} ${r1(y)}L${r1(x - 6 * k)} ${r1(y)}Z`), helm, { k: 2 * k });
  for (const dx of [-3.2, 3.2]) I.flat(E(x + dx * k, y + 4 * k, 1.4 * k, 1.9 * k), O, 0);
  I.vol(P(`M${r1(x - 13 * k)} ${r1(y + 26 * k)}C${r1(x - 13 * k)} ${r1(y + 16 * k)} ${r1(x - 8 * k)} ${r1(y + 12 * k)} ${x} ${r1(y + 12 * k)}C${r1(x + 8 * k)} ${r1(y + 12 * k)} ${r1(x + 13 * k)} ${r1(y + 16 * k)} ${r1(x + 13 * k)} ${r1(y + 26 * k)}Z`), helm, { k: 2 * k, hl: false });
}
def('emb-players', 'joueurs', I => { head(I, 13, 30, 0.85, 'blue'); head(I, 51, 30, 0.85, 'red'); head(I, 32, 24, 1.05, 'gold'); });
def('emb-horde', 'horde', I => { skull(I, 17, 42, 0.62, '#ff4a3a'); skull(I, 47, 42, 0.62, '#ff4a3a'); skull(I, 32, 24, 0.72, '#ff4a3a'); });
def('emb-skull', 'crâne du donjon', I => { skull(I, 32, 34, 1.2, '#5dff9a'); });
def('emb-tower', 'tour infinie', I => {
  I.rope('M32 3V14', '#9a6234', 2.4); I.vol(P('M33 3L46 7L33 11Z'), 'red', { hl: false, k: 1.2 });
  I.vol(P('M20 28L32 11L44 28Z'), 'purple');
  I.vol(P('M19 62L21 28L43 28L45 62Z'), 'stone');
  I.line('M21 38H43M20 48H44M27 28V38M37 38V48M30 48V62', '#4a4466', 1.6);
  I.flat(P('M28 40V34C28 31 30 30 32 30C34 30 36 31 36 34V40Z'), '#2a2048', 1.6); I.flat(P('M29.5 39V35C29.5 33 34.5 33 34.5 35V39Z'), '#ffd36a', 0);
  I.vol(P('M16 25H48V31H16Z'), 'stone', { hl: false, k: 1.4 });
});
def('emb-war', 'guerre', I => {
  I.vol(P('M33 60L13 6L18 4L37 58Z'), 'wood', { hl: false, k: 1.4 });
  I.vol(P('M31 60L51 6L46 4L27 58Z'), 'wood', { hl: false, k: 1.4 });
  I.vol(P('M14 8C8 9 4 13 2 16L8 38C11 34 16 32 22 30Z'), 'red', { k: 2 });
  I.vol(P('M50 8C56 9 60 13 62 16L56 38C53 34 48 32 42 30Z'), 'blue', { k: 2 });
  I.vol(E(15, 6, 3.5), 'gold', { hl: false, k: 1 }); I.vol(E(49, 6, 3.5), 'gold', { hl: false, k: 1 });
  I.embed('bouclier', 'translate(19 26) scale(0.42)');
});
def('emb-bets', 'paris et duels', I => { I.embed('flouze', 'translate(-6 -4) rotate(-14 32 32) scale(0.92)'); I.embed('flouze', 'translate(10 10) rotate(8 32 32) scale(0.92)'); I.spark(54, 10, 4.5); });

// ---------------------------------------------------------------- coffres : normal / combat, fermé / ouvert
const STEEL = { '#fff7c4': '#ffffff', '#f7bc2a': '#c3cce0', '#d98a16': '#8a95b2', '#cd7e15': '#9ba7c3', '#8f4c0a': '#6f7a9b', '#ffe168': '#eef2fa' };
const REDWOOD = { '#c98f55': '#ff6d60', '#9a6234': '#c42a3a', '#6b3d1f': '#8a1e2e', '#45230f': '#5a0e1e' };
ICONS['coffre-combat'] = () => { let s = fs.readFileSync(path.join(SRC, 'coffre.svg'), 'utf8').replace(/#[0-9a-fA-F]{6}\b/g, h => ({ ...STEEL, ...REDWOOD })[h.toLowerCase()] || h).replace(/id="coffre-/g, 'id="coffrec-').replace(/url\(#coffre-/g, 'url(#coffrec-'); fs.writeFileSync(path.join(OUT, 'coffre-combat.svg'), s); return s.length; };
function openChest(name, map) {
  ICONS[name] = () => {
    let s = fs.readFileSync(path.join(SRC, 'coffre.svg'), 'utf8');
    if (map) s = s.replace(/#[0-9a-fA-F]{6}\b/g, h => map[h.toLowerCase()] || h);
    const pre = name.replace(/[^a-z]/g, '');
    s = s.replace(/id="coffre-/g, `id="${pre}-`).replace(/url\(#coffre-/g, `url(#${pre}-`);
    const defs = s.match(/<defs>([\s\S]*?)<\/defs>/)[1];
    const sec = {}; const parts = s.split(/<!-- ===== (.+?) ===== -->/);
    for (let i = 1; i < parts.length; i += 2) sec[parts[i]] = parts[i + 1].replace(/<\/g>\s*<\/svg>\s*$/, '');
    const dbl = sec['DOUBLURE'].match(/<path [^>]*\/>/g);   // couvercle, caisse, rebord, serrure
    const lidG = `<g transform="translate(1 -9) rotate(-12 8 30)"><g fill="${O}" stroke="${O}" stroke-width="6">${dbl[0]}${dbl[2]}</g>${sec['COUVERCLE BOMBÉ']}</g>`;
    const glowId = pre + '-lueur';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n<!-- Fuze Arena : coffre ouvert (préfixe ${pre}-), d'après refonte/art/ui/coffre.svg -->\n<defs>${defs}<radialGradient id="${glowId}"><stop offset="0" stop-color="#fff7c4" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffd45a" stop-opacity="0.45"/><stop offset="1" stop-color="#ffd45a" stop-opacity="0"/></radialGradient></defs>\n<g stroke-linejoin="round" stroke-linecap="round">\n` +
      `<g transform="translate(4 8) scale(0.875)"><circle cx="32" cy="26" r="30" fill="url(#${glowId})"/>${lidG}` +
      `<g fill="${O}" stroke="${O}" stroke-width="6">${dbl[1]}</g><path d="M9 30L55 30L54 36L10 36Z" fill="#2a1408"/><path d="M14 31L50 31L48 34L16 34Z" fill="#ffd45a"/>${sec['CAISSE']}` +
      `<path d="M20 22L22 8M32 20V2M44 22L42 8" stroke="#fff7c4" stroke-width="2.4" opacity="0.8"/><path d="${spark4(48, 12, 4.5)}" fill="#ffffff" stroke="${O}" stroke-width="1.3"/><path d="${spark4(16, 14, 3.5)}" fill="#ffffff" stroke="${O}" stroke-width="1.3"/></g>\n</g>\n</svg>\n`;
    fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
    return svg.length;
  };
}
const PURPLE = { '#c98f55': '#b57cf2', '#9a6234': '#7d47cc', '#6b3d1f': '#532b96', '#45230f': '#351868' };
ICONS['coffre-war'] = () => { const s = fs.readFileSync(path.join(SRC, 'coffre.svg'), 'utf8').replace(/#[0-9a-fA-F]{6}\b/g, h => PURPLE[h.toLowerCase()] || h).replace(/id="coffre-/g, 'id="coffrew-').replace(/url\(#coffre-/g, 'url(#coffrew-'); fs.writeFileSync(path.join(OUT, 'coffre-war.svg'), s); return s.length; };
openChest('coffre-war-ouvert', PURPLE);
openChest('coffre-normal-ouvert');
openChest('coffre-combat-ouvert', { ...STEEL, ...REDWOOD });

const want = process.argv.slice(2);
let total = 0, n = 0;
for (const [name, fn] of Object.entries(ICONS)) if (!want.length || want.includes(name)) { total += fn(); n++; }
console.log(n, 'icônes,', (total / 1024).toFixed(0), 'Ko');
