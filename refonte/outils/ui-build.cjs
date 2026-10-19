// Générateur des ICÔNES D'INTERFACE de la refonte : écrit art/ui/*.svg (viewBox 0 0 64 64).
// Même recette que le guerrier (art/guerrier.svg) ramenée à l'échelle d'une icône :
//   doublure trait 6 (= 3 px de contour extérieur) + pièce : clipPath, aplat, ombres/reflets découpés, contour 2.2.
// Lumière en haut à gauche, contour #1b1530, palette commune du STYLE.md.
const fs = require('fs'), path = require('path');
// node tools/ui-build.cjs [nom1,nom2]  → ne réécrit que ces icônes (sans argument : toutes).
// UI_OUT=dossier node tools/ui-build.cjs sac → écrit ailleurs (brouillons), sans toucher art/ui.
const ONLY = process.argv[2] ? process.argv[2].split(',') : null;
const OUT = process.env.UI_OUT ? path.resolve(process.env.UI_OUT) : path.join(__dirname, '..', 'art', 'ui');
fs.mkdirSync(OUT, { recursive: true });

const O = '#1b1530', W = '#ffffff';
const C = {
  st: '#c3cce0', stL: '#eef2fa', stM: '#9ba7c3', stS: '#6f7a9b', stD: '#4a5273',
  au: '#f7bc2a', auL: '#ffe168', auS: '#cd7e15', auD: '#8f4c0a', auH: '#fff7c4',
  le: '#94593a', leL: '#c58a58', leS: '#6a3a24', leD: '#45230f', leH: '#e0a875',
  wo: '#9a6234', woL: '#c98f55', woS: '#6b3d1f', woD: '#45230f',
  re: '#e3343d', reL: '#ff6d60', reS: '#a81d35', reD: '#6e1129',
  gr: '#4ea83c', grL: '#8edc5e', grS: '#2f7432', grD: '#1c4a26',
  bl: '#3773d8', blL: '#6aaeff', blS: '#23499c', blD: '#162f6c',
  cr: '#f3e6c8', crL: '#fffaf0', crS: '#cdb68e', crD: '#9c8460',
};
const STOPS = {
  gold: [[0, '#fff7c4'], [0.45, '#f7bc2a'], [1, '#d98a16']],
  steel: [[0, '#f7f9ff'], [0.45, '#c3cce0'], [1, '#8a95b2']],
};

// ---------- géométrie (tracés absolus M L C Q Z seulement, pour la boîte englobante) ----------
const f = v => +(+v).toFixed(2);
const circ = (cx, cy, r) => ell(cx, cy, r, r);
function ell(cx, cy, rx, ry) {
  const k = 0.5523, a = rx * k, b = ry * k;
  return `M${f(cx - rx)} ${f(cy)}C${f(cx - rx)} ${f(cy - b)} ${f(cx - a)} ${f(cy - ry)} ${f(cx)} ${f(cy - ry)}C${f(cx + a)} ${f(cy - ry)} ${f(cx + rx)} ${f(cy - b)} ${f(cx + rx)} ${f(cy)}C${f(cx + rx)} ${f(cy + b)} ${f(cx + a)} ${f(cy + ry)} ${f(cx)} ${f(cy + ry)}C${f(cx - a)} ${f(cy + ry)} ${f(cx - rx)} ${f(cy + b)} ${f(cx - rx)} ${f(cy)}Z`;
}
function rr(x, y, w, h, r) {
  const k = r * 0.4477;
  return `M${f(x + r)} ${f(y)}L${f(x + w - r)} ${f(y)}C${f(x + w - k)} ${f(y)} ${f(x + w)} ${f(y + k)} ${f(x + w)} ${f(y + r)}L${f(x + w)} ${f(y + h - r)}C${f(x + w)} ${f(y + h - k)} ${f(x + w - k)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)}L${f(x + r)} ${f(y + h)}C${f(x + k)} ${f(y + h)} ${f(x)} ${f(y + h - k)} ${f(x)} ${f(y + h - r)}L${f(x)} ${f(y + r)}C${f(x)} ${f(y + k)} ${f(x + k)} ${f(y)} ${f(x + r)} ${f(y)}Z`;
}
const poly = pts => 'M' + pts.map(p => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';
// transforme toutes les paires (x,y) d'un tracé absolu
function mapPts(d, fn) {
  if (/[^MLCQZ0-9.\s,\-e]/.test(d)) throw new Error('tracé non absolu : ' + d);
  const toks = d.match(/[MLCQZ]|-?\d*\.?\d+(?:e-?\d+)?/g);
  let out = '', nums = [];
  for (const t of toks) {
    if (/[MLCQZ]/.test(t)) { out += t; continue; }
    nums.push(+t);
    if (nums.length === 2) { const [x, y] = fn(nums[0], nums[1]); out += (/[MLCQZ]$/.test(out) ? '' : ' ') + f(x) + ' ' + f(y); nums = []; }
  }
  return out;
}
const tr = (d, dx, dy) => mapPts(d, (x, y) => [x + dx, y + dy]);
const sc = (d, s, cx = 32, cy = 32, sy = s) => mapPts(d, (x, y) => [cx + (x - cx) * s, cy + (y - cy) * sy]);
const mir = (d, ax = 32) => mapPts(d, (x, y) => [2 * ax - x, y]);
const rot = (d, a, cx = 32, cy = 32) => { const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180); return mapPts(d, (x, y) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
function bbox(d) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number); const xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  const x = Math.min(...xs) - 1, y = Math.min(...ys) - 1;
  return [x, y, Math.max(...xs) - x + 1, Math.max(...ys) - y + 1].map(f);
}
// polyligne épaisse (coche) : jointures en onglet, bouts ronds
function thick(pts, w) {
  const h = w / 2, n = pts.length, k = 0.5523;
  const dir = []; for (let i = 0; i < n - 1; i++) { const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1], L = Math.hypot(dx, dy); dir.push([dx / L, dy / L]); }
  const nr = d => [-d[1], d[0]];
  const side = sg => pts.map((p, i) => {
    let m;
    if (i === 0) m = nr(dir[0]); else if (i === n - 1) m = nr(dir[n - 2]);
    else { const a = nr(dir[i - 1]), b = nr(dir[i]), s = [a[0] + b[0], a[1] + b[1]], L = Math.hypot(...s); const u = [s[0] / L, s[1] / L]; const cs = u[0] * a[0] + u[1] * a[1]; m = [u[0] / cs, u[1] / cs]; }
    return [p[0] + sg * h * m[0], p[1] + sg * h * m[1]];
  });
  const A = side(1), B = side(-1);
  const cap = (c, u, v) => { // demi-cercle de c+h*u vers c-h*u en passant par c+h*v
    const P = (a, b) => `${f(c[0] + h * a[0] + k * h * b[0])} ${f(c[1] + h * a[1] + k * h * b[1])}`;
    const mu = [-u[0], -u[1]];
    return `C${P(u, v)} ${P(v, u)} ${f(c[0] + h * v[0])} ${f(c[1] + h * v[1])}C${P(v, mu)} ${P(mu, v)} ${f(c[0] - h * u[0])} ${f(c[1] - h * u[1])}`;
  };
  let d = `M${f(A[0][0])} ${f(A[0][1])}`;
  for (let i = 1; i < n; i++) d += `L${f(A[i][0])} ${f(A[i][1])}`;
  d += cap(pts[n - 1], nr(dir[n - 2]), dir[n - 2]);
  for (let i = n - 2; i >= 0; i--) d += `L${f(B[i][0])} ${f(B[i][1])}`;
  d += cap(pts[0], nr(dir[0]).map(v => -v), dir[0].map(v => -v));
  return d + 'Z';
}
// formes d'ombre (peuvent utiliser des arcs : elles sont découpées par le clip)
const P = (a, r, cx, cy) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
function cres(cx, cy, r, a1, a2, big = 60) { // zone hors du cercle (cx,cy,r) entre les angles a1→a2 (sens horaire)
  const p1 = P(a1, r, cx, cy), p2 = P(a2, r, cx, cy), q1 = P(a1, r + big, cx, cy), q2 = P(a2, r + big, cx, cy), qm = P((a1 + a2) / 2, r + big * 1.5, cx, cy);
  return `M${f(p1[0])} ${f(p1[1])}A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${f(p2[0])} ${f(p2[1])}L${f(q2[0])} ${f(q2[1])}L${f(qm[0])} ${f(qm[1])}L${f(q1[0])} ${f(q1[1])}Z`;
}
function comma(cx, cy, r, a1, a2, r2) { // reflet en virgule le long d'un arc (bouts pointus)
  const p1 = P(a1, r, cx, cy), p2 = P(a2, r, cx, cy);
  return `M${f(p1[0])} ${f(p1[1])}A${r} ${r} 0 0 1 ${f(p2[0])} ${f(p2[1])}A${r2} ${r2} 0 0 0 ${f(p1[0])} ${f(p1[1])}Z`;
}
function arc(cx, cy, r, a1, a2) { const p1 = P(a1, r, cx, cy), p2 = P(a2, r, cx, cy); return `M${f(p1[0])} ${f(p1[1])}A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${f(p2[0])} ${f(p2[1])}`; }
const sparkD = (cx, cy, R, k = 0.26) => `M${f(cx)} ${f(cy - R)}L${f(cx + k * R)} ${f(cy - k * R)}L${f(cx + R)} ${f(cy)}L${f(cx + k * R)} ${f(cy + k * R)}L${f(cx)} ${f(cy + R)}L${f(cx - k * R)} ${f(cy + k * R)}L${f(cx - R)} ${f(cy)}L${f(cx - k * R)} ${f(cy - k * R)}Z`;

// ---------- éléments ----------
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
const s = (d, c, w = 1.4, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
const ci = (cx, cy, r, fill, extra = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}"${extra}/>`;
const spark = (cx, cy, R, fill = W) => p(sparkD(cx, cy, R), fill);
// étincelle qui dépasse de la silhouette : plus grasse et cernée, pour rester visible sur fond clair
const sparkO = (cx, cy, R, fill = W) => `<path d="${sparkD(cx, cy, R, 0.34)}" fill="${fill}" stroke="${O}" stroke-width="1.3"/>`;

function icon(name) {
  const PX = name + '-', defs = [], ids = new Set();
  const slug = n => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const uid = n => { let id = PX + slug(n); while (ids.has(id)) id += '-b'; ids.add(id); return id; };
  const I = {
    grad(n, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) { const id = uid(n); defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`); return `url(#${id})`; },
    rgrad(n, stops, cx = 0.5, cy = 0.5, r = 0.5) { const id = uid(n); defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`); return `url(#${id})`; },
    clip(n, d) { const id = uid(n); defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return id; },
    // pièce : aplat (ou dégradé) + ombres/reflets découpés + contour
    part(n, d, fill, shades = [], sw = 2.2) {
      const id = I.clip(n, d), [x, y, w, h] = bbox(d);
      return `<!-- ${n} -->\n<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${shades.join('')}</g>\n` + (sw ? `<path d="${d}" fill="none" stroke="${O}" stroke-width="${sw}"/>` : '');
    },
    // biseau cel-shading : bande d'ombre en bas à droite, bande claire en haut à gauche (à mettre dans les ombres d'une pièce dont l'aplat = couleur d'ombre)
    bevel(n, d, light, base, sh = [1.6, 2], li = [1.4, 1.6]) {
      const id = I.clip(n + ' (zone éclairée)', tr(d, -sh[0], -sh[1])), [x, y, w, h] = bbox(d);
      return `<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${light}"/>${p(tr(d, li[0], li[1]), base)}</g>`;
    },
    rivet(cx, cy, r = 1.7, fill) { return ci(cx, cy, r, fill || I.goldUrl, ` stroke="${O}" stroke-width="1.1"`) + ci(cx - r * 0.35, cy - r * 0.35, r * 0.32, W); },
    gem(cx, cy, r, base, light, shade) { // gemme ronde à facette
      const id = I.clip('gemme ' + f(cx) + ' ' + f(cy), circ(cx, cy, r));
      return `<g clip-path="url(#${id})">${ci(cx, cy, r + 1, base)}${p(cres(cx - r * 0.35, cy - r * 0.35, r, -30, 120), shade)}${p(comma(cx, cy, r * 0.62, 190, 265, r * 1.2), light)}</g>` + ci(cx, cy, r, 'none', ` stroke="${O}" stroke-width="1.4"`) + ci(cx - r * 0.38, cy - r * 0.4, Math.max(0.6, r * 0.24), W);
    },
    write(title, body) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n<!-- Fuze Arena : icône d'interface ${title} (préfixe ${PX}). Style de la refonte : contour #1b1530, lumière en haut à gauche. -->\n<defs>\n${defs.join('\n')}\n</defs>\n<g stroke-linejoin="round" stroke-linecap="round">\n${body}\n</g>\n</svg>\n`;
      if (!ONLY || ONLY.includes(name)) fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
      return svg.length;
    },
  };
  let gold = null;   // dégradé or créé seulement s'il sert
  Object.defineProperty(I, 'goldUrl', { get: () => gold || (gold = I.grad('gold', STOPS.gold)) });
  return I;
}
const back = (ds, w = 6) => `<g fill="${O}" stroke="${O}" stroke-width="${w}">${ds.map(d => `<path d="${d}"/>`).join('')}</g>`;

// =====================================================================
//  CRÂNE (commun aux 3 médaillons) : repère local centré en 0,0
// =====================================================================
const SK = {
  head: 'M0 -18C10.5 -18 17.5 -11 17.5 -1.5C17.5 4 15 7.5 11.5 9.5L11.5 13.5C11.5 16.5 9.5 18.5 6.5 18.5L-6.5 18.5C-9.5 18.5 -11.5 16.5 -11.5 13.5L-11.5 9.5C-15 7.5 -17.5 4 -17.5 -1.5C-17.5 -11 -10.5 -18 0 -18Z',
  eyeL: 'M-13.2 -2.5C-13 -6.5 -9 -8 -5 -6.2C-2.4 -5 -1.8 -1.8 -3 1.2C-4.2 4 -8.4 4.8 -10.8 3C-12.4 1.8 -13.3 -0.2 -13.2 -2.5Z',
  eyeLangry: 'M-13.6 -5.2C-10 -5.6 -5.6 -4.2 -2.4 -1.2C-2 2 -3.8 4.4 -7.4 4.6C-11 4.8 -13.6 2.6 -14 -0.4C-14.2 -2.2 -14 -3.8 -13.6 -5.2Z',
  nose: 'M0 4.2C1.2 5.8 2.4 7.2 2.6 8.4C2.8 9.4 1.4 9.8 0 8.8C-1.4 9.8 -2.8 9.4 -2.6 8.4C-2.4 7.2 -1.2 5.8 0 4.2Z',
};
const mir0 = d => mir(d, 0);
// skull(I, nom, transform, couleurs, options)
function skull(I, n, transform, K, opt = {}) {
  const sw = opt.sw || 2.2;
  const eye = opt.angry ? SK.eyeLangry : SK.eyeL;
  let out = `<g transform="${transform}">\n`;
  const sh = [
    p('M5 -19.5C12 -15 15.5 -6 13.5 1C12.5 4.5 10.5 7 8 8.5L8 21L21 21L21 -19.5Z', K.s),
    p('M-14 8.6C-6 11.4 6 11.4 14 8.6L14 12.6C6 14.6 -6 14.6 -14 12.6Z', K.s),
    p('M14.2 -10C16.4 -4 15.6 2 12 6.2L11 21L21 21L21 -10Z', K.d),
  ];
  if (K.l) sh.push(p('M-14.2 -2.5C-14.2 -10 -9.2 -15 -2.5 -15.8C-8 -13 -11.6 -8.5 -12.2 -2.5Z', K.l));
  if (opt.crack) sh.push(s('M8.6 -17L7.2 -13.4L9.6 -11.4L8 -8', K.d, 1.2));
  if (K.l) sh.push(ci(3, -15.2, 1.1, K.h || W));
  out += I.part(n + ' : crâne', SK.head, K.b, sh, sw) + '\n';
  if (opt.teeth) { // rangée de dents claires (boss)
    out += I.part(n + ' : dents', 'M-8.6 12.2L8.6 12.2L8.6 16.4C3 17.6 -3 17.6 -8.6 16.4Z', opt.teeth, [p('M2 10L10 10L10 19L2 19Z', opt.teethS)], 1.4) + '\n';
    out += s('M-4.3 12.4L-4.3 17.2M0 12.4L0 17.6M4.3 12.4L4.3 17.2', O, 1.3) + '\n';
  } else {
    out += `<!-- ${n} : dents -->\n` + s('M-8.6 15.2C-3 16.4 3 16.4 8.6 15.2M-4.4 12.6L-4.4 18.4M0 12.8L0 18.6M4.4 12.6L4.4 18.4', O, 1.3) + '\n';
  }
  out += `<!-- ${n} : orbites et nez -->\n` + p(eye, K.eye || O) + p(mir0(eye), K.eye || O) + p(SK.nose, K.eye || O) + '\n';
  if (opt.glow) { // yeux qui brillent
    const [ex, ey] = opt.angry ? [-7.6, 0.4] : [-8, -1.6];
    out += `<!-- ${n} : yeux de braise -->\n`;
    for (const sx of [1, -1]) out += ci(sx * ex, ey, 3.6, opt.glow, ' opacity="0.35"') + ci(sx * ex, ey, 2.3, opt.glow) + ci(sx * ex - 0.6, ey - 0.6, 0.9, W);
    out += '\n';
  } else if (opt.glint) {
    out += ci(-9.4, -3.2, 1.2, opt.glint) + ci(6.6, -3.2, 1.2, opt.glint) + '\n';
  }
  return out + '</g>';
}

const sizes = {};
// =====================================================================
//  1. CRÂNE VAGUE : vague de monstres à venir (crâne gris, médaillon sombre)
// =====================================================================
{
  const I = icon('crane-vague');
  const ring = I.grad('anneau', [[0, '#b4bdd4'], [0.5, '#7f89a6'], [1, '#4f5776']], 0, 0, 0.5, 1);
  const disc = I.rgrad('fond', [[0, '#463c88'], [0.6, '#2a2350'], [1, '#1d1838']], 0.4, 0.35, 0.7);
  const rivF = I.grad('rivet', STOPS.steel);
  const b = [];
  b.push('<!-- ===== DOUBLURE (contour extérieur épais) ===== -->', back([circ(32, 32, 28)]));
  b.push('<!-- ===== MÉDAILLON ===== -->');
  b.push(I.part('médaillon : anneau d\'acier sombre', circ(32, 32, 28), ring, [
    p(cres(29, 29, 28, -30, 120), '#4a5273'),
    p(comma(32, 32, 25, 195, 250, 34), '#e4e9f5'),
    ci(36.2, 7.4, 1.1, W),
    s(arc(32, 32, 26.4, 100, 160), C.st, 1.2),
  ]));
  b.push(I.part('médaillon : fond creusé', circ(32, 32, 21.5), disc, [
    p(cres(34.6, 34.6, 21.5, 165, 290), '#15112b'),
    s(arc(32, 32, 20.6, 15, 75), '#5d5590', 1.3),
  ], 1.8));
  b.push('<!-- médaillon : rivets -->', [[14.5, 14.5], [49.5, 14.5], [14.5, 49.5], [49.5, 49.5]].map(([x, y]) => I.rivet(x, y, 1.9, rivF)).join(''));
  b.push('<!-- ===== CRÂNE GRIS ===== -->');
  b.push(skull(I, 'crâne', 'translate(32 31.6) scale(0.95)', { b: '#cdd3e2', s: '#9aa2bd', d: '#6f7898', l: '#f4f6fb' }, { crack: true, glint: '#8f97b4', sw: 2.3 }));
  sizes['crane-vague'] = I.write('CRÂNE VAGUE : vague de monstres à venir', b.join('\n'));
}

// =====================================================================
//  2. CRÂNE BOSS : crâne rouge à cornes, médaillon cerclé d'or
// =====================================================================
{
  const I = icon('crane-boss');
  const disc = I.rgrad('fond', [[0, '#7a1631'], [0.6, '#3d0f24'], [1, '#26091a']], 0.4, 0.35, 0.7);
  const horn = 'M18.5 31.5C11 30 5.5 24 5 16.5C4.8 12 6 7.5 8.5 4.5C9.5 9 11.5 13.5 15 16.5C18.5 19.5 22.5 21 26 21.5Z';
  const hornR = mir(horn);
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([circ(32, 35, 25.5), horn, hornR]));
  b.push('<!-- ===== MÉDAILLON CERCLÉ D\'OR ===== -->');
  b.push(I.part('médaillon : anneau d\'or', circ(32, 35, 25.5), I.goldUrl, [
    p(cres(29.5, 32.5, 25.5, -30, 120), C.auS),
    p(cres(27.5, 30.5, 25.5, 0, 90), C.auD),
    p(comma(32, 35, 22.6, 140, 190, 30), C.auH),
    s(arc(32, 35, 23.8, 95, 135), C.auH, 1.1),
  ]));
  b.push(I.part('médaillon : fond creusé', circ(32, 35, 19.5), disc, [
    p(cres(34.4, 37.4, 19.5, 165, 290), '#1a0612'),
    s(arc(32, 35, 18.6, 15, 75), '#a8304f', 1.3),
  ], 1.8));
  b.push('<!-- médaillon : rivets et gemme -->', I.rivet(9.5, 35, 1.9) + I.rivet(54.5, 35, 1.9) + I.gem(32, 57.6, 2.7, C.re, C.reL, C.reS));
  b.push('<!-- ===== CORNES ===== -->');
  const hornShades = (d, k) => [I.bevel('corne ' + k, d, C.crL, C.cr, [1.4, 1.8], [1.2, 1.2]),
    s(k === 'gauche' ? 'M8.2 26C10.4 24.6 12.8 22 14.2 19.2M5.2 18C7.6 17.6 10.6 16 12 13.6M5.6 11C7.4 11 9.2 10 10.2 8.6' : mir('M8.2 26C10.4 24.6 12.8 22 14.2 19.2M5.2 18C7.6 17.6 10.6 16 12 13.6M5.6 11C7.4 11 9.2 10 10.2 8.6'), C.crD, 1.3)];
  b.push(I.part('corne gauche', horn, C.crS, hornShades(horn, 'gauche')));
  b.push(I.part('corne droite', hornR, C.crS, hornShades(hornR, 'droite')));
  b.push('<!-- ===== CRÂNE ROUGE ===== -->');
  b.push(skull(I, 'crâne', 'translate(32 37.2) scale(0.9)', { b: C.re, s: C.reS, d: C.reD, l: '#ff8f80', h: '#ffe1dc' }, { angry: true, glow: '#ffe168', teeth: C.crL, teethS: C.crS, sw: 2.5 }));
  sizes['crane-boss'] = I.write('CRÂNE BOSS : vague du boss', b.join('\n'));
}

// =====================================================================
//  3. CRÂNE FAIT : médaillon éteint + coche verte = vague finie
// =====================================================================
{
  const I = icon('crane-fait');
  const ring = I.grad('anneau', [[0, '#7d8197'], [0.5, '#585c72'], [1, '#3a3d50']], 0, 0, 0.5, 1);
  const disc = I.rgrad('fond', [[0, '#353247'], [1, '#211e2e']], 0.4, 0.35, 0.7);
  const check = thick([[14.5, 33], [26, 44.5], [50, 16]], 10.5);
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([circ(32, 32, 28), check]));
  b.push('<!-- ===== MÉDAILLON ÉTEINT ===== -->');
  b.push(I.part('médaillon : anneau terni', circ(32, 32, 28), ring, [
    p(cres(29, 29, 28, -30, 120), '#34364a'),
    p(comma(32, 32, 25, 195, 250, 34), '#9da2b8'),
    s(arc(32, 32, 26.4, 100, 160), '#8a8fa6', 1.2),
  ]));
  b.push(I.part('médaillon : fond éteint', circ(32, 32, 21.5), disc, [
    p(cres(34.6, 34.6, 21.5, 165, 290), '#17141f'),
  ], 1.8));
  b.push('<!-- médaillon : rivets ternis -->', [[14.5, 14.5], [49.5, 14.5], [14.5, 49.5], [49.5, 49.5]].map(([x, y]) => I.rivet(x, y, 1.9, '#6d7188')).join(''));
  b.push('<!-- ===== CRÂNE ÉTEINT (fantôme) ===== -->');
  b.push(skull(I, 'crâne éteint', 'translate(32 32) scale(0.9)', { b: '#4b4762', s: '#3d3a52', d: '#353248', eye: '#1b1530' }, { sw: 2.2 }));
  b.push('<!-- ===== COCHE VERTE ===== -->');
  b.push(I.part('coche', check, C.grS, [
    I.bevel('coche', check, C.grL, C.gr, [1.4, 2.2], [1.6, 1.6]),
    s('M18.4 32.4L24.2 38.2', '#d9f7b8', 1.5), s('M28.6 36.8L45 17.2', '#d9f7b8', 1.6),
  ], 2.4));
  sizes['crane-fait'] = I.write('CRÂNE FAIT : vague terminée', b.join('\n'));
}

// =====================================================================
//  4. SABLIER doré
// =====================================================================
{
  const I = icon('sablier');
  const capT = rr(7.5, 3.5, 49, 8.6, 3.4), capB = rr(7.5, 51.9, 49, 8.6, 3.4);
  const lipT = rr(11.6, 10.6, 40.8, 6.4, 1.8), lipB = rr(11.6, 47, 40.8, 6.4, 1.8);
  const pil = 'M12.6 16L17.4 16C17.4 20.6 16.8 24.8 16.8 27.4C19 29 19 35 16.8 36.6C16.8 39.2 17.4 43.4 17.4 48L12.6 48C12.6 43.4 13.2 39.2 13.2 36.6C11 35 11 29 13.2 27.4C13.2 24.8 12.6 20.6 12.6 16Z';
  const pilR = mir(pil);
  const glass = 'M19.8 15C19.8 23.8 24.6 27.8 30 32C24.6 36.2 19.8 40.2 19.8 49L44.2 49C44.2 40.2 39.4 36.2 34 32C39.4 27.8 44.2 23.8 44.2 15Z';
  const SA = { l: '#ffd98a', b: '#ffab3d', s: '#e07b22' };
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([capT, capB, lipT, lipB, pil, pilR, glass]));
  b.push('<!-- ===== VERRE ET SABLE ===== -->');
  b.push(I.part('verre (sable dedans)', glass, '#bfe9fb', [
    p('M38.6 14C40 21 38 26.8 33.4 31.8C38 37.2 40 43 39 50L46 50L46 14Z', '#8cc8e6'),
    // sable du haut
    p('M19 22C26 25.4 38 25.4 45 22L45 34L19 34Z', SA.b),
    p('M37.6 23.6C39.2 26.6 37.4 29.4 33.4 32L45 34L45 22Z', SA.s),
    p('M22.6 24C24.6 25.2 26.8 26 29.4 26.4C28 28 25.8 27.8 24.2 26.4Z', SA.l),
    s('M19 22C26 25.4 38 25.4 45 22', O, 1.3),
    // filet de sable
    s('M32 31L32 41.6', SA.b, 1.9),
    // tas du bas
    p('M18.6 50C21.8 44.4 26.8 41 32 41C37.2 41 42.2 44.4 45.4 50Z', SA.b),
    p('M35.8 41.8C39.8 43.6 43.2 46.6 45 50L33 50C36.2 47.4 37 44.8 35.8 41.8Z', SA.s),
    p('M24.2 46.4C26 44.2 28.6 42.8 31 42.6C29 44.2 27.4 45.6 26.4 47.4Z', SA.l),
    s('M18.6 50C21.8 44.4 26.8 41 32 41C37.2 41 42.2 44.4 45.4 50', O, 1.3),
    // reflets du verre
    p('M22.6 17.4C22.8 20.6 23.8 22.4 25.4 23.6C24.6 21.8 24.4 19.8 24.6 17.4Z', W),
    p('M22.8 47C22.8 43.6 24 41 26.4 39.2C25.4 41.6 24.8 44 24.8 47Z', W),
    ci(40.4, 18.4, 1, W),
  ]));
  b.push('<!-- ===== MONTANTS TOURNÉS ===== -->');
  for (const [k, d] of [['gauche', pil], ['droit', pilR]]) {
    const sx = k === 'gauche' ? 0 : 34;
    b.push(I.part('montant ' + k, d, I.goldUrl, [p(`M${15.4 + sx} 10L${20 + sx} 10L${20 + sx} 54L${15.4 + sx} 54Z`, C.auS), s(`M${14.3 + sx} 18L${14.6 + sx} 26M${14.2 + sx} 38.4L${14.5 + sx} 46`, C.auH, 1.1)], 1.9));
  }
  b.push('<!-- ===== BAGUES ET SOCLES ===== -->');
  for (const [k, d, y] of [['haut', lipT, 10.6], ['bas', lipB, 47]]) {
    b.push(I.part('bague ' + k, d, C.au, [p(`M10 ${y + 4}L54 ${y + 4}L54 ${y + 8}L10 ${y + 8}Z`, C.auS), p(`M45 ${y - 1}L54 ${y - 1}L54 ${y + 8}L45 ${y + 8}Z`, C.auS), p(`M48.6 ${y + 4}L54 ${y + 4}L54 ${y + 8}L48.6 ${y + 8}Z`, C.auD), s(`M14.6 ${y + 2.6}L40 ${y + 2.6}`, C.auH, 1.1)], 1.9));
  }
  for (const [k, d, y] of [['haut', capT, 3.5], ['bas', capB, 51.9]]) {
    b.push(I.part('socle ' + k, d, I.goldUrl, [
      p(`M6 ${y + 5.2}L58 ${y + 5.2}L58 ${y + 11}L6 ${y + 11}Z`, C.auS),
      p(`M48 ${y - 1}L58 ${y - 1}L58 ${y + 11}L48 ${y + 11}Z`, C.auS),
      s(`M12.6 ${y + 2.5}L36 ${y + 2.5}`, C.auH, 1.3),
      s(`M11 ${y + 5.2}L53 ${y + 5.2}`, C.auD, 1.1),
    ]));
    b.push(I.gem(32, y + 4.4, 2.3, C.re, C.reL, C.reS));
  }
  b.push(spark(13.6, 6.8, 3.2));
  sizes.sablier = I.write('SABLIER doré', b.join('\n'));
}

// =====================================================================
//  5. PAUSE : bouton carré vert bombé
// =====================================================================
{
  const I = icon('pause');
  const lip = rr(5.5, 7, 53, 52.5, 12.5), face = rr(5.5, 5, 53, 48.5, 12.5);
  const bar1 = rr(19.6, 16.5, 8.8, 25, 2.6), bar2 = rr(35.6, 16.5, 8.8, 25, 2.6);
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([rr(5.5, 5, 53, 54.5, 12.5)]));
  b.push('<!-- ===== BOUTON ===== -->');
  b.push(I.part('bouton : tranche du bas', lip, C.grS, [p('M44 40L64 40L64 64L44 64Z', C.grD), s('M12 56.2C24 57.2 40 57.2 52 56.2', C.gr, 1.2)]));
  b.push(I.part('bouton : face bombée', face, C.gr, [
    p('M58.5 24C58.5 41 50 51 34 53.5L58.5 53.5Z', '#3f9436'),
    p('M10 11C10 8.6 12.6 7.4 16 7.4L48 7.4C51.4 7.4 54 8.6 54 11L54 18.4C40 23.2 24 23.2 10 18.4Z', C.grL),
    p('M9.4 33C8.8 22 10.6 13.4 16.8 9.8C13.4 15 12.2 22.4 12.2 33Z', W),
    ci(20.6, 9.2, 1.1, W),
    s('M11 47.6C16 51 24 52 32 52', C.grL, 1.3),
  ]));
  b.push('<!-- bouton : ombre portée des barres -->', p(tr(bar1, 1.6, 2.2), C.grS) + p(tr(bar2, 1.6, 2.2), C.grS));
  b.push('<!-- ===== BARRES PAUSE ===== -->');
  for (const [k, d, x] of [['gauche', bar1, 19.6], ['droite', bar2, 35.6]]) {
    b.push(I.part('barre ' + k, d, W, [p(`M${x + 5.6} 14L${x + 12} 14L${x + 12} 44L${x + 5.6} 44Z`, '#d3eec4'), p(`M${x - 2} 37.6L${x + 12} 37.6L${x + 12} 44L${x - 2} 44Z`, '#d3eec4')], 2));
  }
  sizes.pause = I.write('PAUSE : bouton vert', b.join('\n'));
}

// =====================================================================
//  6. COFFRE en bois cerclé d'or
// =====================================================================
{
  const I = icon('coffre');
  const lid = 'M7 30L7 21.5C7 14 13 9.5 21 9.5L43 9.5C51 9.5 57 14 57 21.5L57 30Z';
  const body = 'M8 30L56 30L55.5 54.4C55.5 56.4 54.4 57.5 52.4 57.5L11.6 57.5C9.6 57.5 8.5 56.4 8.5 54.4Z';
  const strapL = 'M13 30L13 11.9C15 10.9 17 10.3 19 10L19 30Z', strapR = mir(strapL);
  const bStrapL = 'M13.4 33L18.8 33L18.8 57.5L13.4 57.5Z', bStrapR = mir(bStrapL);
  const rim = rr(5.5, 27, 53, 6.6, 2.4);
  const lock = 'M26 25.4L38 25.4L38 36C38 40.2 35.2 43 32 44.6C28.8 43 26 40.2 26 36Z';
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([lid, body, rim, lock]));
  b.push('<!-- ===== CAISSE ===== -->');
  b.push(I.part('caisse', body, C.wo, [
    p('M48 28L58 28L58 60L48 60Z', C.woS),
    p('M6 33.6L58 33.6L58 37.4C40 38.6 24 38.6 6 37.4Z', C.woS),
    s('M9 45.6L55 45.6', C.woD, 1.4), s('M9.4 47.2L47 47.2', C.woL, 1.1),
    s('M10.6 40L10.4 44M10.6 50L10.4 55', C.woL, 1.2),
  ]));
  b.push(I.part('caisse : montant d\'or gauche', bStrapL, I.goldUrl, [p('M16.4 30L20 30L20 58L16.4 58Z', C.auS), p('M12 33.6L20 33.6L20 37L12 37Z', C.auS)], 1.8));
  b.push(I.part('caisse : montant d\'or droit', bStrapR, I.goldUrl, [p('M48.6 30L52 30L52 58L48.6 58Z', C.auS), p('M44 33.6L52 33.6L52 37L44 37Z', C.auS)], 1.8));
  b.push('<!-- caisse : rivets -->', I.rivet(16.1, 43.6, 1.4) + I.rivet(16.1, 52.6, 1.4) + I.rivet(47.9, 43.6, 1.4) + I.rivet(47.9, 52.6, 1.4));
  b.push('<!-- ===== COUVERCLE BOMBÉ ===== -->');
  b.push(I.part('couvercle', lid, C.wo, [
    p('M5 9L60 9L60 14.6C46 13.2 20 13.2 5 14.6Z', C.woL),
    p('M5 24L60 24L60 31L5 31Z', C.woS),
    p('M48.6 8L60 8L60 31L48.6 31Z', C.woS),
    p('M48.6 24L60 24L60 31L48.6 31Z', C.woD),
    s('M8 18.6L56 18.6', C.woD, 1.4), s('M8.4 20.2L48 20.2', C.woL, 1.1),
    s('M10 23L10 27M10.6 13.6L11.6 16.2', C.woL, 1.2),
  ]));
  b.push(I.part('couvercle : montant d\'or gauche', strapL, I.goldUrl, [p('M16.4 9L20 9L20 31L16.4 31Z', C.auS), p('M12 24L20 24L20 31L12 31Z', C.auS), s('M14.4 13.4L14.4 22.6', C.auH, 1.1)], 1.8));
  b.push(I.part('couvercle : montant d\'or droit', strapR, I.goldUrl, [p('M48.6 9L52 9L52 31L48.6 31Z', C.auS), p('M44 24L52 24L52 31L44 31Z', C.auD)], 1.8));
  b.push('<!-- couvercle : rivets -->', I.rivet(16.1, 18.2, 1.4) + I.rivet(47.9, 18.2, 1.4));
  b.push(I.part('rebord d\'or du couvercle', rim, I.goldUrl, [
    p('M5 30.6L60 30.6L60 35L5 35Z', C.auS), p('M49 26L60 26L60 35L49 35Z', C.auD),
    s('M8.6 28.9L44 28.9', C.auH, 1.2),
  ]));
  b.push('<!-- ===== SERRURE ===== -->');
  b.push(I.part('serrure', lock, I.goldUrl, [
    p('M32 22L40 22L40 46L32 46Z', C.auS), p('M24 37.6C27 40.4 37 40.4 40 37.6L40 46L24 46Z', C.auD),
    s('M27.8 27.6L27.8 35.6', C.auH, 1.2),
  ]));
  b.push('<!-- serrure : trou de clef -->', p(circ(32, 32.2, 2.5) + 'M30.6 33.6L33.4 33.6L34.2 39L29.8 39Z', O));
  b.push(sparkO(9.6, 10.4, 4.8));
  sizes.coffre = I.write('COFFRE en bois cerclé d\'or', b.join('\n'));
}

// =====================================================================
//  7. CLEF dorée (dessinée verticale, tournée de 45°)
// =====================================================================
{
  const I = icon('clef');
  const bow = circ(32, 46.6, 10.6);
  const lobes = [circ(32, 57, 3.6), circ(21.6, 46.6, 3.6), circ(42.4, 46.6, 3.6)];
  const collar = rr(25.6, 32.2, 12.8, 5, 2);
  const shaft = 'M28.4 33.4L28.4 10C28.4 8 30 6.4 32 6.4C34 6.4 35.6 8 35.6 10L35.6 33.4Z';
  const bit = 'M35 9L44.4 9C45.4 9 46 9.6 46 10.6L46 14.4L41.4 14.4L41.4 17.4L46 17.4L46 21.4C46 22.4 45.4 23 44.4 23L35 23Z';
  const goldH = I.grad('or-horizontal', [[0, '#fff7c4'], [0.4, '#f7bc2a'], [1, '#d98a16']], 0, 0, 1, 0);
  const b = [];
  b.push('<!-- ===== CLEF (repère vertical, tourné de 45°) ===== -->', '<g transform="translate(-1.6 -0.8) rotate(45 32 32)">');
  b.push('<!-- doublure -->', back([bow, ...lobes, collar, shaft, bit]));
  b.push('<!-- anneau : lobes -->');
  lobes.forEach((d, i) => b.push(I.part('anneau : lobe ' + (i + 1), d, I.goldUrl, [p(cres([32, 21.6, 42.4][i] - 1.4, [57, 46.6, 46.6][i], 3.6, -80, 80), C.auS)], 1.8)));
  b.push(I.part('panneton', bit, goldH, [p('M42.4 8L47 8L47 24L42.4 24Z', C.auS), s('M37 11.4L43.4 11.4', C.auH, 1.1)], 2));
  b.push(I.part('tige', shaft, goldH, [p('M32.6 5L37 5L37 35L32.6 35Z', C.auS), s('M30.4 11L30.4 31', C.auH, 1.2)], 2.1));
  b.push(I.part('bague', collar, goldH, [p('M33 31L40 31L40 38L33 38Z', C.auS), p('M36.4 31L40 31L40 38L36.4 38Z', C.auD)], 1.9));
  b.push(I.part('anneau', bow, I.grad('or-anneau', [[0, '#fff7c4'], [0.4, '#f7bc2a'], [1, '#cd7e15']], 0, 0, 1, 0.3), [
    p(cres(30.2, 46.6, 10.6, -80, 80), C.auS),
    p(comma(32, 46.6, 8.8, 150, 215, 12), C.auH),
    s(circ(32, 46.6, 6.6), C.auD, 1.2),
  ]));
  b.push('<!-- anneau : gemme bleue -->', I.gem(32, 46.6, 4.6, C.bl, C.blL, C.blS));
  b.push('</g>');
  b.push(sparkO(50.2, 9.8, 4.6));
  sizes.clef = I.write('CLEF dorée', b.join('\n'));
}

// =====================================================================
//  8. FLOUZE : billets verts (monnaie du jeu)
// =====================================================================
{
  const I = icon('flouze');
  const M = { l: '#8ff0a8', b: '#3cbf6a', s: '#22894c', d: '#145c36', p: '#d5f9de' };
  const bill = rr(8.5, 19, 47, 26, 3.4);
  const billB = rot(tr(bill, -1.5, -3.5), -14), billF = rot(tr(bill, 1, 3.5), 6);
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([billB, billF]));
  b.push('<!-- ===== BILLET DU DESSOUS ===== -->');
  b.push(`<g transform="rotate(-14 32 32)">`);
  b.push(I.part('billet du dessous', tr(bill, -1.5, -3.5), M.s, [
    I.bevel('billet du dessous', tr(bill, -1.5, -3.5), M.l, '#33ad5f', [1.2, 1.4], [1.2, 1.2]),
    s(rr(10, 18.5, 41, 20, 1.6), M.l, 1.1),
    p(circ(30.5, 28.5, 6.6), M.p), s(circ(30.5, 28.5, 6.6), O, 1.3),
  ]));
  b.push('</g>');
  b.push('<!-- ===== BILLET DU DESSUS ===== -->');
  b.push(`<g transform="rotate(6 32 32)">`);
  const fb = tr(bill, 1, 3.5);
  b.push(I.part('billet du dessus', fb, M.s, [
    I.bevel('billet du dessus', fb, M.l, M.b, [1.4, 1.8], [1.2, 1.2]),
    s(rr(12.6, 25.6, 39.8, 19.8, 1.8), M.l, 1.2),
    s('M19.4 30.2L19.4 40.8M46.6 30.2L46.6 40.8', M.s, 2.2),
    p(circ(15.8, 28.8, 1.6), M.l), p(circ(50.2, 42.2, 1.6), M.l),
  ]));
  b.push('<!-- billet du dessus : médaillon au F de Flouze -->');
  b.push(I.part('billet du dessus : médaillon', circ(33, 35.5, 7.6), M.p, [p(cres(32, 34.5, 7.6, -20, 110), '#a9ebbc')], 1.5));
  b.push(s('M30.6 31.6L36 31.6M30.6 31.6L30.6 39.6M30.6 35.4L34.8 35.4', M.d, 2.2));
  b.push('</g>');
  b.push(sparkO(53.2, 15.6, 4.6));
  sizes.flouze = I.write('FLOUZE : billets verts', b.join('\n'));
}

// =====================================================================
//  9. COURONNE dorée sertie
// =====================================================================
{
  const I = icon('couronne');
  const body = 'M11.6 46L7.6 21.4C12.6 26 17.2 29.2 21.8 29.2C25.8 29.2 29.2 23 32 14.6C34.8 23 38.2 29.2 42.2 29.2C46.8 29.2 51.4 26 56.4 21.4L52.4 46Z';
  const band = 'M10.2 39C22 43.4 42 43.4 53.8 39L52.6 49.6C41 54 23 54 11.4 49.6Z';
  const velvet = 'M14.4 33C15.6 22 22.6 17.6 32 17.6C41.4 17.6 48.4 22 49.6 33Z';
  const balls = [[7.6, 20.4, 3.5], [56.4, 20.4, 3.5], [32, 12.2, 3.9]];
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([velvet, body, band, ...balls.map(([x, y, r]) => circ(x, y, r))]));
  b.push(I.part('velours rouge', velvet, C.re, [p('M36 14L52 14L52 34L36 34Z', C.reS), p('M18 26C19.4 22.6 22.6 20.4 26.4 19.6C23.6 21.6 21.6 23.8 20.6 26.6Z', C.reL)], 1.8));
  b.push('<!-- ===== COURONNE ===== -->');
  b.push(I.part('fleurons', body, I.goldUrl, [
    p('M41 12C44 24 45 34 43.4 48L60 48L60 12Z', C.auS),
    p('M32 13L32 46L42 46L42 13Z', '#e9a321'),
    p('M7.6 21.4L14 27.2L14.8 46L12 46Z', C.auH),
    s('M9.8 24.2L13.2 38.6', C.auH, 1.2), s('M21.8 30.6L22.4 38.4', C.auH, 1.1),
  ]));
  b.push('<!-- fleuron central : losange bleu -->', I.part('losange bleu', 'M32 23L35.4 28.4L32 33.8L28.6 28.4Z', C.bl, [p('M32 22L37 22L37 35L32 35Z', C.blS), p('M30 26.6L32 24.4L32 27.4Z', C.blL)], 1.5));
  b.push(I.part('bandeau', band, I.goldUrl, [
    p('M5 47C22 52.4 42 52.4 60 47L60 56L5 56Z', C.auS),
    p('M44 36L60 36L60 56L44 56Z', C.auS),
    p('M48 46L60 46L60 56L48 56Z', C.auD),
    s('M13 41.6C24 45.2 36 45.6 44 44.4', C.auH, 1.2),
  ]));
  b.push('<!-- bandeau : gemmes -->', I.gem(20.4, 46.6, 2.7, C.bl, C.blL, C.blS) + I.gem(43.6, 46.6, 2.7, C.bl, C.blL, C.blS));
  b.push(I.part('gemme rouge centrale', ell(32, 47.4, 4, 3.6), C.re, [p(cres(30.8, 46.2, 3.8, -30, 120), C.reS), p(comma(32, 47.4, 2.5, 190, 265, 3.4), C.reL)], 1.5) + ci(30.6, 46, 0.9, W));
  b.push('<!-- ===== BOULES DES POINTES ===== -->');
  balls.forEach(([x, y, r], i) => b.push(I.part('boule ' + (i + 1), circ(x, y, r), I.goldUrl, [p(cres(x - 1, y - 1, r, -30, 120), C.auS), ci(x - r * 0.35, y - r * 0.4, r * 0.3, W)], 1.8)));
  b.push(sparkO(51.4, 13.6, 4.4));
  sizes.couronne = I.write('COURONNE dorée sertie', b.join('\n'));
}

// =====================================================================
//  10. ÉPÉE (attaque) : même lame que le guerrier, en diagonale
// =====================================================================
{
  const I = icon('epee');
  const blade = 'M-7 -8L-6.4 -38L0 -50L6.4 -38L7 -8Z';
  const guard = 'M-16.6 -12.4C-16.6 -14 -15.2 -15 -13.6 -14.4L-4.6 -11.6L4.6 -11.6L13.6 -14.4C15.2 -15 16.6 -14 16.6 -12.4L16.6 -9.2C16.6 -7.6 15.2 -6.8 13.6 -7.2L4.8 -6.8C3.2 -4.2 -3.2 -4.2 -4.8 -6.8L-13.6 -7.2C-15.2 -6.8 -16.6 -7.6 -16.6 -9.2Z';
  const grip = 'M-3.7 -5L3.7 -5L3.7 9.4L-3.7 9.4Z';
  const pommel = circ(0, 12.8, 4.8);
  const steel = I.grad('acier', [[0, '#f7f9ff'], [0.45, '#c3cce0'], [1, '#8a95b2']], 0, 0, 1, 0.35);
  const goldH = I.grad('or-horizontal', [[0, '#fff7c4'], [0.45, '#f7bc2a'], [1, '#d98a16']], 0, 0, 1, 0);
  const b = [];
  b.push('<!-- ===== ÉPÉE (repère local : main en 0,0, lame vers le haut) ===== -->', '<!-- pivot arme : 20.4,43.4 -->', '<g transform="translate(20.4 43.4) rotate(45)">');
  b.push('<!-- doublure -->', back([blade, guard, grip, pommel]));
  b.push(I.part('lame', blade, steel, [
    p('M0 -52L9 -52L9 -6L0 -6Z', C.stM),
    p('M4.4 -40L9 -40L9 -6L4.6 -6Z', C.stS),
    s('M0 -12L0 -36', C.stS, 2.6), s('M-0.7 -13L-0.7 -35', W, 0.8),
    s('M-4.6 -10.5L-4.2 -37L-1.2 -44', W, 1.4),
    s('M5.4 -10L5.2 -36', C.stL, 1),
  ]));
  b.push(sparkO(-6, -43.4, 4.3));
  b.push(I.part('poignée en cuir', grip, C.le, [p('M0.8 -6L5 -6L5 10L0.8 10Z', C.leS), s('M-3.7 -1.6L3.7 0.6M-3.7 2.6L3.7 4.8M-3.7 6.8L3.7 9', C.leD, 1.2), s('M-2.2 -3L-2.2 8', C.leL, 1.1)], 1.8));
  b.push(I.part('garde dorée', guard, goldH, [p('M-17 -9.6L17 -9.6L17 -2L-17 -2Z', C.auS), p('M6 -16L18 -16L18 -2L6 -2Z', C.auS), p('M12 -16L18 -16L18 -2L12 -2Z', C.auD), s('M-14.8 -12.6L-6 -10.2', C.auH, 1.2)], 2));
  b.push('<!-- garde : gemme rouge -->', I.gem(0, -7.2, 2.9, C.re, C.reL, C.reS));
  b.push(I.part('pommeau', pommel, goldH, [p(cres(-1.4, 12.8, 4.8, -80, 80), C.auS), ci(-1.8, 11, 1.2, W)], 2));
  b.push('</g>');
  sizes.epee = I.write('ÉPÉE : attaque', b.join('\n'));
}

// =====================================================================
//  11. BOUCLIER bleu et or
// =====================================================================
{
  const I = icon('bouclier');
  const shield = 'M32 5.4C39.6 9.4 47.6 10.4 55.6 9.4C57 31 52 47.6 32 58.6C12 47.6 7 31 8.4 9.4C16.4 10.4 24.4 9.4 32 5.4Z';
  const field = sc(shield, 0.8, 32, 30.6);
  const cross = mapPts('M125 184C124 178 122 174 120 170L138 170C136 174 134 178 133 184C138 183 142 181 146 179L146 197C142 195 138 193 133 192C134 198 136 203 138 208L120 208C122 203 124 198 125 192C120 193 116 195 112 197L112 179C116 181 120 183 125 184Z', (x, y) => [32 + (x - 129) * 0.62, 30 + (y - 188) * 0.62]);
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([shield]));
  b.push(I.part('bordure dorée', shield, I.goldUrl, [
    p('M32 0L64 0L64 64L32 64Z', C.auS),
    p('M44 44L64 20L64 64L30 64Z', C.auD),
    s('M11.6 12.6C18 13 25 12.2 31 9.2', C.auH, 1.3),
    s('M11.2 16C11.2 28 14 38.6 21 46', C.auH, 1.1),
  ]));
  b.push(I.part('champ bleu', field, C.bl, [
    p('M32 0L64 0L64 64L32 64Z', C.blS),
    p('M40 46L60 24L60 64L32 64Z', C.blD),
    p('M14.2 14.2C14.4 26 16.4 35.6 22 43C19.8 42.6 16.2 36 15 28C14.4 23.6 14.2 18.6 14.2 14.2Z', C.blL),
    p('M17.4 13.4C21 13.6 24.4 13.2 27.6 12.2C24.6 14.2 21 15 17.4 15.2Z', W),
  ], 1.8));
  b.push('<!-- champ : croix dorée du paladin -->');
  b.push(I.part('croix dorée', cross, I.goldUrl, [p('M32 30L44 22.6L44 44L32 44Z', C.auS), p('M20 34.9L32 30L32 44L20 44Z', C.auS), s('M23.4 26.6C25.2 27.2 27 27.8 28.6 28.1M28.2 20.3L29.4 25.6', C.auH, 1.1)], 1.8));
  b.push('<!-- bordure : rivets -->', I.rivet(13.6, 13.2, 1.5) + I.rivet(50.4, 13.2, 1.5) + I.rivet(32, 53, 1.5));
  b.push(sparkO(13, 7.2, 4.8));
  sizes.bouclier = I.write('BOUCLIER bleu et or', b.join('\n'));
}

// =====================================================================
//  12. CŒUR rouge (vie)
// =====================================================================
{
  const I = icon('coeur');
  const heart = 'M32 56.4C24 50.6 6.8 39.6 6.8 23.8C6.8 15 13.4 8.8 21 8.8C26 8.8 30 11.8 32 16C34 11.8 38 8.8 43 8.8C50.6 8.8 57.2 15 57.2 23.8C57.2 39.6 40 50.6 32 56.4Z';
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([heart]));
  b.push(I.part('cœur', heart, C.reD, [
    p(tr(heart, -1.4, -1.6), C.reS),
    p(tr(heart, -3.6, -4), C.re),
    p('M10.4 24C10.4 17 15 12.6 21 12.6C25.4 12.6 28 15.4 28.8 19.6C25 17.4 19.6 17.8 16.2 21.6C13.8 24.2 12.8 28 13 32C11.2 29.8 10.4 27 10.4 24Z', C.reL),
    p('M13.4 22.6C13.6 17.8 16.6 14.6 20.8 14.2C18 16 16 18.6 15.4 22.4Z', W),
    ci(23.6, 14.6, 1.2, W),
    p('M41.6 13.4C44.6 13 47.6 14 49.6 16C47.2 15.4 44.4 15.4 42 16Z', C.reL),
    s('M10.2 33.4C14.4 40.6 21.6 46.2 28 50.6', C.reL, 1.2),
    spark(46.2, 20.4, 3.2),
  ]));
  sizes.coeur = I.write('CŒUR : vie', b.join('\n'));
}

// =====================================================================
//  13. ÉCLAIR jaune (puissance)
// =====================================================================
{
  const I = icon('eclair');
  const bolt = 'M28.4 4L46.6 4L37.6 23.4L51.4 23.4L21.6 60L27.6 35.2L13 35.2Z';
  const Y = { h: '#fffbe0', l: '#fff59a', b: '#ffd93b', s: '#f5a623', d: '#d9771a' };
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([bolt]));
  const lit = I.clip('éclair (zone éclairée)', tr(bolt, -2, -2)), lit2 = I.clip('éclair (hors bande claire)', tr(bolt, 1.6, 1.4));
  b.push(I.part('éclair', bolt, Y.s, [
    `<g clip-path="url(#${lit})"><rect x="12" y="3" width="40" height="58" fill="${Y.l}"/>${p(tr(bolt, 1.6, 1.4), Y.b)}`,
    `<g clip-path="url(#${lit2})">${p('M37.5 4L46.6 4L37.6 23.4L27.6 35.2L20.3 35.2Z', '#ffc12e')}${p('M44.5 23.4L51.4 23.4L21.6 60Z', '#ffc12e')}</g></g>`,
    p('M44.5 23.4L53 23.4L53 30Z', Y.s),
    s('M29.6 6.6L17.6 32.8', Y.h, 1.4),
    s('M31.4 36L26.4 52.6', Y.h, 1.1),
  ]));
  b.push(sparkO(21.4, 11.2, 4.6, Y.h));
  sizes.eclair = I.write('ÉCLAIR : puissance', b.join('\n'));
}

// =====================================================================
//  14. ÉTOILE dorée (facettes)
// =====================================================================
{
  const I = icon('etoile');
  const cx = 32, cy = 34.4, R = 27.6, r = 13.6;
  const pt = (a, rad) => [cx + rad * Math.cos(a * Math.PI / 180), cy + rad * Math.sin(a * Math.PI / 180)];
  const pts = []; for (let i = 0; i < 10; i++) pts.push(pt(-90 + 36 * i, i % 2 ? r : R));
  const star = poly(pts);
  const L = [-0.55, -0.83];
  const facets = [];
  for (let i = 0; i < 10; i += 2) {
    const tip = pts[i], prev = pts[(i + 9) % 10], next = pts[(i + 1) % 10];
    for (const q of [prev, next]) {
      // normale extérieure de l'arête pointe → creux
      const ex = q[0] - tip[0], ey = q[1] - tip[1]; let nx = ey, ny = -ex; const mx = (q[0] + tip[0]) / 2 - cx, my = (q[1] + tip[1]) / 2 - cy;
      if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
      const nl = Math.hypot(nx, ny), dot = (nx * L[0] + ny * L[1]) / nl;
      const col = dot > 0.55 ? C.auL : dot > 0.05 ? C.au : dot > -0.6 ? '#e59a1c' : C.auS;
      facets.push(p(poly([[cx, cy], tip, q]), col));
    }
  }
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([star]));
  b.push(I.part('étoile à facettes', star, C.au, [
    ...facets,
    s(`M${cx} ${cy}L${f(pts[0][0])} ${f(pts[0][1])}`, C.auH, 0.8),
    p('M29.2 13.2L31.4 8.6L31.6 15.4Z', W),
  ]));
  b.push(sparkO(46.4, 16.4, 4.4));
  sizes.etoile = I.write('ÉTOILE dorée', b.join('\n'));
}

// =====================================================================
//  15. SAC d'aventurier
// =====================================================================
{
  const I = icon('sac');
  // Silhouette de SAC (et non de caisse) : col étroit (~30) sous la couverture, ventre renflé (~41) et fond arrondi.
  const body = 'M21 17.6L43 17.6C45.6 17.6 46.8 18.6 47.4 20.6C48.6 25 52.4 31 52.6 41C52.8 52 45.6 59.4 32 59.4C18.4 59.4 11.2 52 11.4 41C11.6 31 15.4 25 16.6 20.6C17.2 18.6 18.4 17.6 21 17.6Z';
  // poches latérales collées au ventre : elles prolongent la courbe au lieu de faire un bloc
  const pocketL = 'M14.4 39.6C10.6 39.6 8.2 42 8.2 45.6L8.2 47.8C8.2 52.4 11.4 55.8 17.4 56.8L18 46Z', pocketR = mir(pocketL);
  const roll = 'M14 7.4L50 7.4C53.6 7.4 55.8 10 55.8 13.4C55.8 16.8 53.6 19.4 50 19.4L14 19.4C10.4 19.4 8.2 16.8 8.2 13.4C8.2 10 10.4 7.4 14 7.4Z';
  // rabat : suit les flancs (retrait 1.4) et se termine en langue arrondie
  const flap = 'M21.4 18.4L42.6 18.4C44.8 18.4 45.8 19.4 46.2 21C47.2 25 50 29.4 50.4 33.6C50.8 38.6 42.4 43.6 32 43.6C21.6 43.6 13.2 38.6 13.6 33.6C14 29.4 16.8 25 17.8 21C18.2 19.4 19.2 18.4 21.4 18.4Z';
  const strap = 'M29.6 38.6L34.4 38.6L34.4 55L29.6 55Z';
  const buckle = rr(27.4, 43.6, 9.2, 7.6, 1.6);
  const tie1 = rr(20.4, 5.8, 4, 15.4, 1.2), tie2 = mir(tie1);
  // couture en tirets le long d'une courbe de Bézier (segments courts, sans dasharray)
  const bz = (q, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * q[0][k] + 3 * u * u * t * q[1][k] + 3 * u * t * t * q[2][k] + t * t * t * q[3][k]); };
  function dashes(q, dash, gap, keep = () => true) {
    const pts = []; for (let i = 0; i <= 200; i++) pts.push(bz(q, i / 200));
    let out = '', acc = 0, on = true, cur = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc += L;
      if (on) cur.push(pts[i]);
      if (acc >= (on ? dash : gap)) {
        if (on && cur.length > 1) { const a = cur[0], z = cur[cur.length - 1], m = cur[cur.length >> 1]; if (keep(m)) out += `M${f(a[0])} ${f(a[1])}Q${f(2 * m[0] - (a[0] + z[0]) / 2)} ${f(2 * m[1] - (a[1] + z[1]) / 2)} ${f(z[0])} ${f(z[1])}`; }
        on = !on; acc = 0; cur = [pts[i]];
      }
    }
    return out;
  }
  const stitchR = [[46.8, 33.4], [47, 37], [40.6, 40.4], [32, 40.4]];
  const stitchL = stitchR.map(([x, y]) => [64 - x, y]);
  const outsideStrap = m => Math.abs(m[0] - 32) > 4.6;
  const b = [];
  b.push('<!-- ===== DOUBLURE ===== -->', back([pocketL, pocketR, body, roll, tie1, tie2]));
  b.push('<!-- ===== POCHES LATÉRALES ===== -->');
  b.push(I.part('poche gauche', pocketL, C.le, [
    p('M4 43.2C7.4 41 11 40.6 16 40.8L16 43.4C11 43.2 7.6 43.8 4 45.8Z', C.leL),     // rebord éclairé
    p('M4 50.6C7.6 54 12 55 18 54.2L18 60L4 60Z', C.leS),                    // ombre du bas
    s('M10.8 46.4L10.8 48C10.8 50 11.8 51.6 13.6 52.6', C.leS, 1.1),             // couture
  ], 2));
  b.push(I.part('poche droite', pocketR, C.leS, [
    p('M60 43.2C56.6 41 53 40.6 48 40.8L48 43.4C53 43.2 56.4 43.8 60 45.8Z', C.le),
    p('M60 46.6C58.6 52 54.6 55 47 56.6L60 60Z', C.leD),
    s('M53.2 46.4L53.2 48C53.2 50 52.2 51.6 50.4 52.6', C.le, 1.1),
  ], 2));
  b.push('<!-- ===== CORPS DU SAC ===== -->');
  b.push(I.part('corps', body, C.le, [
    p(tr(flap, 0.6, 3.4), C.leS),                                                   // ombre portée du rabat
    p('M41.6 14C45 24 47.6 33 47.4 42C47.2 50.6 43 56.6 35 60.6L60 64L60 14Z', C.leS),   // croissant d'ombre à droite
    p('M49.8 38C50.2 47 46.6 54.6 37.4 58.6L60 64L60 38Z', C.leD),                      // ombre profonde bas-droite
    s('M15.2 42.4C15.4 47.4 17.6 51.4 21.6 54', C.leL, 1.4),                          // arête éclairée à gauche
    s('M19.4 54.4C23.4 56.4 27.6 57.2 32 57.2C36.4 57.2 40.6 56.4 44.6 54.4', C.leD, 1.1), // couture du fond
  ]));
  b.push(I.part('rabat', flap, C.le, [
    p('M41 16C43.6 24 46.4 29.6 46.6 34.6C46.8 38 44.6 40.6 40.8 42.6L56 50L56 16Z', C.leS),
    p('M8 32.4C12 37.6 22 40.6 32 40.6C42 40.6 52 37.6 56 32.4L56 50L8 50Z', C.leS),
    p('M50 29C49.6 35.4 45 39.6 33 44.4L56 50L56 29Z', C.leD),                         // ombre profonde : croissant le long du bord bas-droit
    s('M19.6 22.6C18.8 26 17.2 29.4 16.8 32.6', C.leL, 1.4),
    s(dashes(stitchL, 2.6, 2.2, outsideStrap) + dashes(stitchR, 2.6, 2.2, outsideStrap), C.leH, 1.1),
  ]));
  b.push(I.part('sangle', strap, C.leS, [p('M32.6 37L36 37L36 57L32.6 57Z', C.leD)], 1.8));
  b.push(I.part('boucle dorée', buckle, I.goldUrl, [p('M32 42L38 42L38 53L32 53Z', C.auS), p(rr(30, 45.8, 4, 3.2, 0.8), C.leD), s('M29.6 45L33 45', C.auH, 1)], 1.8));
  b.push('<!-- ===== COUVERTURE ROULÉE ===== -->');
  b.push(I.part('couverture roulée', roll, C.re, [
    p('M5 15.4C20 16.8 44 16.8 58 15.4L58 21L5 21Z', C.reS),
    p('M48.6 5L58 5L58 21L48.6 21Z', C.reS),
    p('M48.6 15.4L58 15.4L58 21L48.6 21Z', C.reD),
    p('M14 9.8L44 9.8C44 11 43 11.6 41.6 11.6L14 11.6C12.6 11.6 12.4 10.4 14 9.8Z', C.reL),
    p('M15.6 5L18.6 5L18.6 22L15.6 22Z', C.cr), p('M15.6 15.6L18.6 15.6L18.6 22L15.6 22Z', C.crS),
    p('M45.4 5L48.4 5L48.4 22L45.4 22Z', C.crS), p('M45.4 15.6L48.4 15.6L48.4 22L45.4 22Z', C.crD),
    s('M11.6 13.4C11.6 11.6 13.6 11.2 14.6 12.6C15.6 14.2 14 16.2 12.2 15.6', C.reD, 1.2),
  ]));
  for (const [k, d, x] of [['gauche', tie1, 20.4], ['droit', tie2, 39.6]]) {
    b.push(I.part('lanière ' + k, d, C.le, [p(`M${x + 2.4} 4L${x + 6} 4L${x + 6} 23L${x + 2.4} 23Z`, C.leS), s(`M${x + 1.2} 8.4L${x + 1.2} 18.6`, C.leL, 1)], 1.8));
  }
  sizes.sac = I.write('SAC d\'aventurier', b.join('\n'));
}

console.log(Object.entries(sizes).map(([k, v]) => `${k}: ${(v / 1024).toFixed(1)} Ko`).join(' | '));
