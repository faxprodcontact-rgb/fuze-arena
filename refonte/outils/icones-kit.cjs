// Atelier des icônes (refonte) : briques communes à icones.cjs (interface) et objets.cjs (objets, sorts, familiers).
// Style de la maquette (refonte/art/ui/*.svg) : contour #1b1530 de 2,2, « doublure » de 6 sous chaque pièce,
// volume en 3 tons décalés vers le haut-gauche (ombre en bas à droite), reflet clair et étincelles blanches. viewBox 64 × 64.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'refonte', 'art', 'ui');
const OUT = path.join(ROOT, 'art', 'ui');
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
    svg(title, tool = 'icones.cjs') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n<!-- Fuze Arena : « ${title} » (préfixe ${prefix}-), générée par refonte/outils/${tool} -->\n<defs>${defs.join('')}</defs>\n<g stroke-linejoin="round" stroke-linecap="round">\n${body.join('\n')}\n</g>\n</svg>\n`;
    },
    write(name, title) {
      const svg = I.svg(title);
      fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
      return svg.length;
    },
  };
  return I;
}

function mixc(hex, t, to) {
  const n = parseInt(hex.slice(1), 16), m = parseInt(to.slice(1), 16);
  const c = [16, 8, 0].map(s => (n >> s) & 255), d = [16, 8, 0].map(s => (m >> s) & 255);
  return '#' + c.map((v, i) => Math.round(v + (d[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
// [clair, base, ombre, profonde] à partir d'une couleur de base
const tn = (b) => [mixc(b, 0.42, '#ffffff'), b, mixc(b, 0.26, '#1b1530'), mixc(b, 0.48, '#1b1530')];
module.exports = { fs, path, ROOT, SRC, OUT, O, r1, T, P, E, RR, poly, star, spark4, Icon, mixc, tn, bboxOf };
