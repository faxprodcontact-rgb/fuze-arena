// Décor « forêt enchantée » de l'écran de combat (préfixe df-), viewBox 0 0 390 844 (taille de l'écran).
// Clairière (zone des combattants) de y≈388 à 600 ; de 600 à 844, bande de terre calme sous le HUD et les boutons.
// Même recette que tools/gu-build.cjs : pièce = clipPath (forme) + aplat + ombres/reflets découpés + contour.
// Différence voulue avec les persos : contours plus fins (1.2 à 2.4) et plus clairs (couleur sombre de la matière,
// pas #1b1530), pas de doublure, et plus on est loin, plus c'est pâle et bleuté (perspective atmosphérique).
// node tools/df-build.cjs  → écrit art/decor-foret.svg
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'art', 'decor-foret.svg');
const PRE = 'df';
const n0 = v => String(Math.round(v));               // coordonnées entières (décor : suffisant, et léger)
const n1 = v => String(Math.round(v * 10) / 10);
const defs = [], ids = new Set();
function uid(name) { let id = `${PRE}-${name}`, k = 2; while (ids.has(id)) id = `${PRE}-${name}-${k++}`; ids.add(id); return id; }
let nClip = 0;
function clip(name, d) { const id = uid('c' + (nClip++).toString(36)); defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return `url(#${id})`; }
function grad(name, xml) { const id = uid(name); defs.push(xml.replace('@ID', id)); return `url(#${id})`; }
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
const s = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
// boîte englobante d'un tracé en commandes absolues M/L/C/Q (paires de nombres)
function bbox(d) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number), xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  const x = Math.min(...xs) - 3, y = Math.min(...ys) - 3;
  return [x, y, Math.max(...xs) - x + 3, Math.max(...ys) - y + 3].map(n0);
}
// pièce dessinée à la main : clip + aplat + ombres + contour
function part(name, d, fill, shades = [], sw = 2, oc = '#000', box = bbox(d)) {
  const c = clip(name, d);
  return `<!-- ${name} -->\n<g clip-path="${c}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="${fill}"/>${shades.join('')}</g>` + (sw ? s(d, oc, sw) : '');
}

// ---------- compactage des tracés, sans perte (le décor doit rester sous 45 000 o) ----------
// Chaque commande est réécrite en absolu ou en relatif, la plus courte des deux ; L horizontal/vertical → h/v ;
// pas d'espace avant un nombre négatif. Les drapeaux d'arc restent séparés par des espaces (lisibles partout).
const fmtN = v => { let r = Math.round(v * 100) / 100; return String(Object.is(r, -0) ? 0 : r); };
const joinN = a => a.map(fmtN).reduce((o, t) => o + (o && t[0] !== '-' ? ' ' : '') + t, '');
function minD(d) {
  const tok = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)/g), K = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 };
  let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0, out = '';
  while (i < tok.length) {
    if (/[a-z]/i.test(tok[i])) { cmd = tok[i++]; if (/z/i.test(cmd)) { cx = sx; cy = sy; out += 'Z'; continue; } }
    else if (cmd === 'M') cmd = 'L'; else if (cmd === 'm') cmd = 'l';
    const U = cmd.toUpperCase(), rel = cmd !== U, k = K[U], a = tok.slice(i, i + k).map(Number); i += k;
    let A;                                                     // forme absolue
    if (U === 'H') A = [rel ? cx + a[0] : a[0]]; else if (U === 'V') A = [rel ? cy + a[0] : a[0]];
    else if (U === 'A') { A = a.slice(); if (rel) { A[5] += cx; A[6] += cy; } }
    else A = a.map((v, j) => rel ? v + (j % 2 ? cy : cx) : v);
    let R;                                                     // forme relative
    if (U === 'H') R = [A[0] - cx]; else if (U === 'V') R = [A[0] - cy];
    else if (U === 'A') { R = A.slice(); R[5] -= cx; R[6] -= cy; }
    else R = A.map((v, j) => v - (j % 2 ? cy : cx));
    const cand = out === '' ? [U + joinN(A)] : [U + joinN(A), U.toLowerCase() + joinN(R)];
    if (U === 'L' && fmtN(R[1]) === '0') cand.push('h' + joinN([R[0]]));
    if (U === 'L' && fmtN(R[0]) === '0') cand.push('v' + joinN([R[1]]));
    out += cand.reduce((x, y) => y.length < x.length ? y : x);
    if (U === 'H') cx = A[0]; else if (U === 'V') cy = A[0]; else { cx = A[k - 2]; cy = A[k - 1]; }
    if (U === 'M') { sx = cx; sy = cy; }
  }
  return out;
}

// ---------- générateur de touffes de feuillage (bords festonnés en arcs de cercle) ----------
function rng(seed) { let x = (seed * 9301 + 49297) % 233280 || 1; return () => (x = (x * 9301 + 49297) % 233280) / 233280; }
const LIGHT = Math.atan2(-1.25, -1);                 // lumière en haut à gauche
// arc de A vers B (sens horaire à l'écran = bosse vers l'extérieur d'un contour horaire)
function arcInfo(A, B, r) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
  r = Math.max(r, L / 2 + 0.01);
  const nx = dy / L, ny = -dx / L, h = Math.sqrt(r * r - L * L / 4);
  const C = [(A[0] + B[0]) / 2 - nx * h, (A[1] + B[1]) / 2 - ny * h];
  const a0 = Math.atan2(A[1] - C[1], A[0] - C[0]);
  let da = Math.atan2(B[1] - C[1], B[0] - C[0]) - a0; while (da < 0) da += 2 * Math.PI;
  return { C, r, a0, da, L, nx, ny };
}
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
// croissant de lumière le long d'un arc, centré sur la direction de la lumière (± spread)
function rimLight(ai, spread = 0.95, thick = 0.5) {
  const { C, r, a0, da } = ai;
  const c = angDiff(LIGHT, a0);                       // position de la lumière dans l'arc
  let t0 = Math.max(0, (c < 0 ? c + 2 * Math.PI : c) - spread), t1 = Math.min(da, (c < 0 ? c + 2 * Math.PI : c) + spread);
  if (c < 0 && c + 2 * Math.PI > da + spread) { t0 = 0; t1 = Math.min(da, c + spread); }
  if (t1 - t0 < 0.35) return '';
  const P0 = [C[0] + r * Math.cos(a0 + t0), C[1] + r * Math.sin(a0 + t0)], P1 = [C[0] + r * Math.cos(a0 + t1), C[1] + r * Math.sin(a0 + t1)];
  const ch = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), sag = r * (1 - Math.cos((t1 - t0) / 2)) * (1 - thick);
  const r3 = (sag * sag + ch * ch / 4) / (2 * Math.max(sag, 0.3));
  const x0 = Math.round(P0[0]), y0 = Math.round(P0[1]), dx = Math.round(P1[0]) - x0, dy = Math.round(P1[1]) - y0;
  return `M${x0} ${y0}a${n0(r)} ${n0(r)} 0 0 1 ${dx} ${dy}a${n0(r3)} ${n0(r3)} 0 0 0 ${-dx} ${-dy}Z`;
}
// touffe : ellipse (cx,cy,rx,ry) découpée en n bosses ; o.k = rondeur des bosses ; o.flat = bosses du bas aplaties
function puff(cx, cy, rx, ry, n, seed, o = {}) {
  const R = rng(seed), a0 = o.a0 ?? (-Math.PI / 2 - Math.PI / n), pts = [];
  for (let i = 0; i < n; i++) {
    const t = a0 + i * 2 * Math.PI / n + (R() - 0.5) * (o.ja ?? 0.3) * 2 * Math.PI / n, j = 1 + (R() - 0.5) * 2 * (o.jr ?? 0.1);
    pts.push([cx + rx * Math.cos(t) * j, cy + ry * Math.sin(t) * j].map(v => Math.round(v)));
  }
  const P = scallop(pts, o, [cx - rx * 1.25 - 12, cy - ry * 1.25 - 12, rx * 2.5 + 24, ry * 2.5 + 24].map(n0));
  return Object.assign(P, { e: [cx, cy, rx, ry] });
}
// contour festonné fermé à partir de points (sens horaire à l'écran)
function scallop(pts, o = {}, box) {
  let d = `M${pts[0][0]} ${pts[0][1]}`; const arcs = [];
  for (let i = 0; i < pts.length; i++) {
    const A = pts[i], B = pts[(i + 1) % pts.length];
    if (o.open && i === pts.length - 1) { d += `L${B[0]} ${B[1]}`; break; }
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ny = -(B[0] - A[0]) / L;
    let k = o.k ?? 0.58; if (o.flat && ny > 0.55) k = 1.6;
    const r = Math.round(Math.max(L * k, L / 2 + 0.5));
    d += `a${r} ${r} 0 0 1 ${B[0] - A[0]} ${B[1] - A[1]}`;
    arcs.push(arcInfo(A, B, r));
  }
  if (!box) { const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]); box = [Math.min(...xs) - 30, Math.min(...ys) - 30, Math.max(...xs) - Math.min(...xs) + 60, Math.max(...ys) - Math.min(...ys) + 60]; }
  return { d: d + 'Z', arcs, box };
}
// feuillage cel-shadé : ombre (forme décalée vers le haut-gauche par-dessus un fond d'ombre), ombre profonde,
// croissants de lumière sur les bosses tournées vers la lumière, petits creux de feuilles, contour
function foliage(name, P, col, o = {}) {
  const c = clip(name, P.d), [x, y, w, h] = P.box, sh = o.sh ?? [7, 9];
  let g = `<!-- ${name} -->\n<g clip-path="${c}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col.dp || col.sh}"/>`;
  if (col.dp) g += `<path transform="translate(${n0(-sh[0] * 0.4)} ${n0(-sh[1] * 0.4)})" d="${P.d}" fill="${col.sh}"/>`;
  g += `<path transform="translate(${-sh[0]} ${-sh[1]})" d="${P.d}" fill="${col.b}"/>`;
  if (col.l && P.e && o.lk !== 0) {
    // zone éclairée : la même touffe réduite et poussée vers le haut-gauche → bord festonné, 3 tons nets
    const [cx, cy, rx, ry] = P.e, k = o.lk ?? 0.7;
    g += `<path transform="translate(${n1(cx * (1 - k) - rx * 0.24)} ${n1(cy * (1 - k) - ry * 0.32)}) scale(${k})" d="${P.d}" fill="${col.l}"/>`;
  } else if (col.l) { const rl = P.arcs.map(a => rimLight(a, o.spread ?? 0.95, o.thick ?? 0.45)).join(''); if (rl) g += p(rl, col.l); }
  if (o.extra) g += o.extra;
  g += '</g>';
  if (o.sw !== 0) g += s(P.d, col.o, o.sw ?? 2);
  return g;
}

// ====================== PALETTE DU DÉCOR ======================
// plus c'est loin, plus c'est pâle et bleuté ; contour = teinte sombre de la matière
const C = {
  far1: '#9dd3cb', far1l: '#b6e3d9',
  far2: { b: '#82c2bb', l: '#a0d6cb', sh: '#6eaeab' },
  back: { b: '#8fd09a', l: '#b6e6ad', sh: '#71b48c', o: '#4f8f7c' },          // arbres du milieu, au fond
  backTrunk: { b: '#a08f80', l: '#bcae9c', sh: '#82746c', o: '#5d6f68' },
  edge: { b: '#86c98e', l: '#addf9f', sh: '#6aae86', o: '#4b8a74' },          // buissons au bord de la clairière
  leaf: { b: '#5cb85c', l: '#8bd466', sh: '#3a9257', dp: '#2b7350', o: '#1f5240' },  // grands arbres
  leafBack: { b: '#4aa45a', l: '#80cc68', sh: '#33844f', dp: '#276647', o: '#1f5240' },
  bark: { b: '#8f6243', l: '#b88458', sh: '#694330', dp: '#4b2e22', o: '#3e2519' },
  front: { b: '#4fb05a', l: '#86d066', sh: '#2f8a4e', o: '#18402f' },  // premier plan
};

let body = '';
// ====================== CIEL ======================
const ciel = grad('ciel', `<linearGradient id="@ID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fcbd8"/><stop offset="0.38" stop-color="#9ee6dc"/><stop offset="0.72" stop-color="#cdf3cf"/><stop offset="1" stop-color="#e2f7c8"/></linearGradient>`);
body += `<!-- ===== CIEL ===== -->\n<rect x="0" y="0" width="390" height="420" fill="${ciel}"/>\n`;
// halo du soleil (en haut à gauche, derrière le feuillage) : disques concentriques en opacité, sans contour
body += `<!-- halo du soleil -->\n<g fill="#fffbe0"><circle cx="170" cy="78" r="120" opacity="0.18"/><circle cx="170" cy="78" r="78" opacity="0.25"/><circle cx="170" cy="78" r="46" opacity="0.4"/><circle cx="170" cy="78" r="24" opacity="0.7"/></g>\n`;
// petits nuages cartoon
function cloud(x, y, w, seed) {
  const P = puff(x, y, w, w * 0.32, 7, seed, { k: 0.62, flat: true, jr: 0.06 });
  return foliage('nuage', P, { b: '#f6fffc', sh: '#cdefe9' }, { sh: [3, 4], sw: 0 });
}
// petit nuage dessiné à la main : à droite, un vrai demi-cercle (r 6,5 : corde 5,12 = 13) au lieu d'un bout coupé net
const nuage2 = { d: 'M114 221a12 12 0 0 1 20 0a6.5 6.5 0 0 1 5 12a30 30 0 0 1 -17 2a32 32 0 0 1 -20 -3a4 4 0 0 1 -2 -6a9 9 0 0 1 14 -5Z', box: [92, 208, 58, 34] };
body += cloud(232, 150, 40, 3) + foliage('nuage', nuage2, { b: '#f6fffc', sh: '#cdefe9' }, { sh: [3, 4], sw: 0 }) + '\n';

// ====================== ARBRES LOINTAINS ======================
// rangée 1 : silhouettes très pâles (sans contour)
function ridge(xs, ys, rk, yb) {
  const pts = xs.map((x, i) => [x, ys[i]]);
  let d = `M${xs[0]} ${yb}L${pts[0][0]} ${pts[0][1]}`; const arcs = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const A = pts[i], B = pts[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]), r = Math.round(Math.max(L * rk[i % rk.length], L / 2 + 0.5));
    d += `a${r} ${r} 0 0 1 ${B[0] - A[0]} ${B[1] - A[1]}`; arcs.push(arcInfo(A, B, r));
  }
  return { d: d + `L${xs[xs.length - 1]} ${yb}Z`, arcs, box: [Math.min(...xs) - 4, Math.min(...ys) - 40, Math.max(...xs) - Math.min(...xs) + 8, yb - Math.min(...ys) + 44] };
}
{
  const R1 = ridge([-10, 18, 52, 80, 118, 150, 186, 222, 252, 290, 322, 356, 400], [262, 236, 250, 232, 258, 246, 266, 250, 262, 240, 252, 228, 248], [0.62, 0.55, 0.7], 400);
  // sapins pointus qui dépassent (pour qu'on lise « forêt » et pas « collines ») : 3 étages, moitié gauche éclairée
  const fir = (x, yb, h, w) => {
    const t = [[0, -h], [w * 0.32, -h * 0.62], [w * 0.18, -h * 0.6], [w * 0.62, -h * 0.26], [w * 0.4, -h * 0.25], [w, 0]].map(([a, b]) => [Math.round(x + a), Math.round(yb + b)]);
    const L = t.map(([a, b]) => [2 * x - a, b]).reverse();
    return { full: 'M' + [...t, ...L.slice(0, -1)].map(q => q.join(' ')).join('L') + 'Z', left: 'M' + [...L.slice(0, -1), [x, yb]].map(q => q.join(' ')).join('L') + 'Z' };
  };
  const F = [[150, 292, 100, 30], [208, 300, 74, 24], [264, 296, 112, 30]].map(a => fir(...a));
  body += `<!-- ===== ARBRES LOINTAINS ===== -->\n<!-- rangée 1 : sapins -->\n` + p(F.map(q => q.full).join(''), C.far1) + p(F.map(q => q.left).join(''), C.far1l) + p(R1.d, C.far1) + '\n';
  // rangée 2 : un peu plus soutenue, cel-shadée, sans contour, avec quelques troncs fins
  const R2 = ridge([-10, 30, 62, 96, 128, 168, 200, 236, 268, 300, 334, 366, 400], [300, 276, 292, 284, 306, 296, 312, 300, 292, 304, 284, 296, 280], [0.6, 0.66, 0.56], 400);
  body += `<!-- rangée 2 -->\n` + foliage('lointains', R2, { b: C.far2.b, l: C.far2.l, sh: C.far2.sh }, { sh: [5, 7], sw: 0, spread: 0.9, thick: 0.5 }) + '\n';
}
// brume au pied des arbres lointains
body += `<!-- brume -->\n<path d="M-10 352C60 340 130 350 200 344C270 338 330 348 400 340L400 400L-10 400Z" fill="#e6f8de" opacity="0.55"/>\n`;

// ====================== ARBRES DU FOND (MILIEU) ======================
function backTree(x, yb, h, lean, seed, flip) {
  const t = C.backTrunk, w = 9;
  const d = `M${x - w} ${yb}C${x - w + 2} ${yb - h * 0.4} ${x - w + lean} ${yb - h * 0.7} ${x - 5 + lean} ${yb - h}L${x + 5 + lean} ${yb - h}C${x + w + lean} ${yb - h * 0.7} ${x + w - 1} ${yb - h * 0.4} ${x + w + 3} ${yb}Z`;
  let g = part('tronc-fond', d, t.b, [p(`M${x + 1} ${yb + 2}C${x + 3} ${yb - h * 0.4} ${x + 2 + lean} ${yb - h * 0.7} ${x + 1 + lean} ${yb - h}L${x + 20 + lean} ${yb - h}L${x + 20} ${yb + 2}Z`, t.sh),
    s(`M${x - w + 3} ${yb - 4}C${x - w + 4} ${yb - h * 0.4} ${x - w + 2 + lean} ${yb - h * 0.6} ${x - 2 + lean} ${yb - h * 0.85}`, t.l, 2)], 1.4, t.o);
  const cx = x + lean, cy = yb - h - 14;
  g += foliage('feuillage-fond', puff(cx - 2 * flip, cy - 4, 38, 30, 9, seed + 2, { flat: true }), C.back, { sh: [6, 8], sw: 1.5 });
  return g;
}
body += `<!-- ===== ARBRES DU FOND ===== -->\n` + backTree(98, 384, 74, -6, 11, 1) + backTree(296, 382, 82, 7, 21, -1) + '\n';

// ====================== SOL DE LA CLAIRIÈRE ======================
const sol = grad('sol', `<linearGradient id="@ID" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2e894"/><stop offset="0.4" stop-color="#a6da7e"/><stop offset="1" stop-color="#88c867"/></linearGradient>`);
const solD = 'M-10 392C60 384 120 390 196 386C270 382 330 388 400 384L400 610L-10 610Z';
body += `<!-- ===== SOL ===== -->\n` + p(solD, sol) + '\n';
{ // frange de brins d'herbe sur le bord du fond (casse la ligne droite de l'horizon)
  const R = rng(17); let d = 'M96 392';
  for (let x = 96; x < 300; x += 6) { const h = 4 + Math.round(R() * 6), tip = Math.round(R() * 4 - 1); d += `l${3 + tip} ${-h}l${3 - tip} ${h}`; }
  body += `<!-- frange d'herbe -->\n` + p(d + 'L300 396L96 396Z', '#c0e692') + '\n';
}
// zones d'ombre des grands arbres sur les côtés (bords francs, couleur d'ombre de l'herbe)
body += `<!-- ombre des arbres sur l'herbe -->\n` + p('M-10 396C40 398 90 404 116 416C96 432 52 440 30 470C16 490 4 520 -10 530Z', '#8fca6c') + p('M400 392C356 394 300 400 274 414C300 428 344 436 362 468C372 488 384 512 400 520Z', '#8fca6c') + '\n';
// flaque de lumière au centre (là où tombent les rayons) : dégradé radial doux
const flaque = grad('flaque', `<radialGradient id="@ID"><stop offset="0" stop-color="#f6fccc" stop-opacity="0.75"/><stop offset="0.55" stop-color="#eef9bc" stop-opacity="0.4"/><stop offset="1" stop-color="#eef9bc" stop-opacity="0"/></radialGradient>`);
body += `<!-- lumière au sol -->\n<ellipse cx="232" cy="452" rx="170" ry="42" fill="${flaque}"/>\n`;

// buissons du bord de la clairière (bande festonnée basse)
{
  const E = ridge([-10, 14, 40, 64, 92, 112], [384, 368, 374, 362, 376, 392], [0.6, 0.56], 400);
  const E2 = ridge([268, 292, 318, 344, 368, 400], [392, 372, 364, 372, 360, 376], [0.6, 0.56], 400);
  body += `<!-- buissons du bord -->\n` + foliage('bord-gauche', E, C.edge, { sh: [5, 6], sw: 1.5 }) + foliage('bord-droite', E2, C.edge, { sh: [5, 6], sw: 1.5 }) + '\n';
}

// touffes d'herbe (3 brins, tracé relatif) et fleurs (discrètes au centre, plus nombreuses sur les côtés)
function tuft(x, y, k) {
  const r = v => n0(v * k);
  return `M${n0(x - 5 * k)} ${n0(y)}q0 ${r(-5)} ${r(-4)} ${r(-8)}q${r(5)} ${r(2)} ${r(7)} ${r(5)}q${r(1)} ${r(-5)} ${r(2)} ${r(-9)}q${r(2)} ${r(5)} ${r(2)} ${r(9)}q${r(2)} ${r(-3)} ${r(6)} ${r(-4)}q${r(-3)} ${r(3)} ${r(-3)} ${r(7)}Z`;
}
{
  const T = [[30, 420, 1.2], [70, 434, 1], [14, 472, 1.4], [118, 414, 0.9], [52, 522, 1.3], [20, 568, 1.5], [150, 474, 0.9], [250, 414, 0.9], [292, 474, 1], [338, 426, 1.1], [372, 456, 1.3], [356, 524, 1.2], [376, 584, 1.5], [214, 592, 1]];
  body += `<!-- touffes d'herbe -->\n` + p(T.map(t => tuft(...t)).join(''), '#74b556') + p(T.map(([x, y, k]) => tuft(Math.round(x - 1.3 * k), Math.round(y - 0.6 * k), k * 0.72)).join(''), '#b0de84') + '\n';
  // petites fleurs : croix à bouts ronds (= 4 pétales) en 2 passes (contour puis couleur) + coeur doré
  const F = [[22, 442, '#ffffff'], [44, 490, '#ffd1e6'], [12, 532, '#ffffff'], [84, 454, '#fff3a0'], [362, 440, '#ffffff'], [344, 496, '#ffd1e6'], [380, 542, '#fff3a0'], [318, 452, '#ffffff'], [60, 576, '#ffd1e6'], [330, 586, '#ffffff']];
  const cross = l => l.map(([x, y]) => `M${x - 2} ${y}h4M${x} ${y - 2}v4`).join('');
  body += `<!-- fleurs -->\n` + s(cross(F), '#4f8f5a', 6.2) + ['#ffffff', '#ffd1e6', '#fff3a0'].map(c => s(cross(F.filter(f => f[2] === c)), c, 4.4)).join('') + s(F.map(([x, y]) => `M${x} ${y}h0`).join(''), '#f7bc2a', 2.6) + '\n';
}

// ====================== RAYONS DE LUMIÈRE ======================
const ray = grad('rayon', `<linearGradient id="@ID" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.55"/><stop offset="0.6" stop-color="#fffbe0" stop-opacity="0.22"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></linearGradient>`);
body += `<!-- ===== RAYONS DE LUMIÈRE ===== -->\n<g fill="${ray}">` +
  ['M128 60L152 52L262 470L214 476Z', 'M164 50L178 46L300 452L278 456Z', 'M190 56L214 50L350 430L316 438Z', 'M110 80L120 76L196 452L176 456Z'].map(d => `<path d="${d}"/>`).join('') + '</g>\n';

// ====================== GRANDS ARBRES (CÔTÉS) ======================
const B = C.bark;
// --- arbre de gauche ---
{
  // branche qui part vers la droite dans le feuillage
  const br = 'M38 190C52 160 76 136 108 120C116 114 124 106 132 98L138 108C128 120 118 130 108 140C86 156 68 180 50 214Z';
  let g = `<!-- ===== GRAND ARBRE GAUCHE ===== -->\n` + part('branche-gauche', br, B.b, [p('M58 200C66 168 80 148 104 132L140 114L160 130L90 240Z', B.sh), s('M46 180C60 156 82 138 112 126', B.l, 2.2), s('M84 150C86 144 92 140 96 140', B.dp, 1.6)], 2, B.o);
  g += foliage('touffe-branche-gauche', puff(100, 152, 20, 13, 7, 91, { flat: true }), C.leaf, { sh: [4, 5], sw: 1.8 });
  // tronc tordu
  const tr = 'M-12 96L58 92C52 120 44 150 50 176C56 200 72 222 72 254C72 284 56 306 58 336C59 360 70 378 86 394C70 400 40 402 -12 404Z';
  g += part('tronc-gauche', tr, B.b, [
    // ombre (côté droit, suit la torsion) et ombre profonde
    p('M30 92C24 124 22 152 30 178C40 206 52 228 50 258C48 288 36 310 40 340C42 362 52 380 64 398L100 398L100 92Z', B.sh),
    p('M46 92C40 126 36 152 42 176C50 202 64 224 62 256C60 286 48 308 50 338C52 362 62 380 76 396L100 396L100 92Z', B.dp),
    // lumière réfléchie verte (l'herbe éclairée) au bord droit
    s('M66 236C70 262 64 286 60 306', '#7fae6a', 2.5),
    // reflet côté gauche, en spirale (torsion)
    p('M-12 150C2 160 10 180 8 206C6 232 -6 252 -12 262Z', B.l), p('M-12 300C4 310 14 330 14 352C14 372 6 386 -4 400L-12 400Z', B.l),
    // veines d'écorce en spirale
    s('M14 110C28 140 24 168 12 190M26 214C38 240 40 268 30 292M8 316C22 334 30 356 26 380M38 120C44 140 40 160 34 174M52 270C46 292 44 312 48 332', B.dp, 2),
    s('M2 122C10 136 10 150 4 164M-2 276C8 286 12 298 10 310', B.l, 1.6),
    // petites plaques d'écorce (côté éclairé)
    s('M6 222C10 232 10 242 6 250M20 196C23 203 23 210 21 216M14 300C17 307 17 314 15 320M30 344C33 352 33 360 31 366', B.sh, 1.5),
    // noeud de l'écorce
    p('M24 252C30 244 42 246 44 256C46 266 36 272 28 268C22 264 20 258 24 252Z', B.dp), p('M26 254C30 249 38 250 40 256C36 252 30 252 28 258Z', B.l),
  ], 2.2, B.o);
  // racines
  const r1 = 'M30 392C46 384 70 386 86 394C100 400 116 406 132 414C112 418 92 416 74 410C60 404 44 402 30 402Z';
  const r2 = 'M-12 396C2 392 18 396 26 404C18 412 6 420 -12 424Z';
  g += `<!-- ombre des racines -->\n<ellipse cx="54" cy="414" rx="70" ry="8" fill="#6faa58" opacity="0.6"/>\n`;
  g += part('racine-gauche', r1, B.b, [p('M30 402C50 404 70 408 86 412L132 416L132 430L30 430Z', B.sh), p('M28 400C40 400 58 402 74 410C90 416 110 418 132 414L132 420L28 420Z', B.dp), s('M40 390C56 386 74 388 90 396C102 402 112 406 122 410', B.l, 2)], 2, B.o);
  g += part('racine-gauche-2', r2, B.b, [p('M-12 412C4 410 14 406 26 404L30 430L-12 430Z', B.sh), s('M-8 396C4 394 14 396 20 400', B.l, 2)], 2, B.o);
  body += g + '\n';
}
// --- arbre de droite ---
{
  const br = 'M352 190C338 160 314 136 282 120C274 114 268 106 262 96L254 106C262 120 272 132 282 140C304 156 322 180 342 214Z';
  let g = `<!-- ===== GRAND ARBRE DROITE ===== -->\n` + part('branche-droite', br, B.b, [p('M332 200C324 168 310 148 286 132L250 114L230 130L300 240Z', B.sh), s('M344 180C330 156 308 138 278 126', B.l, 2.2)], 2, B.o);
  g += foliage('touffe-branche-droite', puff(294, 150, 20, 13, 7, 92, { flat: true }), C.leaf, { sh: [4, 5], sw: 1.8 });
  const tr = 'M402 96L334 92C342 122 350 150 344 178C338 204 322 226 324 258C326 290 342 310 340 338C338 362 326 380 310 394C328 400 360 402 402 404Z';
  g += part('tronc-droite', tr, B.b, [
    // le côté gauche (vers la clairière) est éclairé, le côté droit à l'ombre
    p('M362 92C370 124 374 152 366 178C356 206 344 228 346 258C348 290 362 312 358 340C356 362 346 380 334 398L404 398L404 92Z', B.sh),
    p('M384 92C390 124 392 152 386 178C378 206 368 228 370 258C372 290 384 312 380 340C378 362 370 380 360 398L404 398L404 92Z', B.dp),
    p('M336 100C344 124 348 150 342 174C336 200 324 220 326 250C328 230 340 206 350 182C358 158 352 124 346 100Z', B.l),
    p('M326 262C328 290 342 306 342 330C346 312 336 292 330 268Z', B.l),
    s('M352 112C358 140 356 166 346 186M342 222C334 246 336 270 346 292M352 318C346 340 340 360 330 378M374 140C370 166 362 190 360 214M366 300C372 320 372 344 364 364', B.dp, 2),
    s('M342 128C345 136 345 144 342 150M334 214C337 221 337 228 335 234M332 300C335 307 335 314 333 320', B.sh, 1.5),
    // creux dans le tronc
    p('M352 238C356 226 370 226 372 240C374 254 368 266 360 266C352 266 350 250 352 238Z', '#2e1b14'), s('M352 238C356 226 370 226 372 240', B.l, 1.8),
    p('M354 250C356 244 362 244 364 250C364 258 356 260 354 250Z', '#45291d'),
    // mousse
    p('M324 360C332 350 346 350 352 360C356 368 348 374 338 372C330 374 322 370 324 360Z', '#79bf55'), p('M328 360C334 354 342 354 346 360C340 358 334 358 330 364Z', '#a8e07a'),
  ], 2.2, B.o);
  const r1 = 'M362 392C346 384 322 386 306 394C292 400 276 406 260 414C280 418 300 416 318 410C332 404 348 402 362 402Z';
  const r2 = 'M402 394C388 392 374 396 368 404C376 412 388 420 402 424Z';
  g += `<!-- ombre des racines -->\n<ellipse cx="336" cy="414" rx="72" ry="8" fill="#6faa58" opacity="0.6"/>\n`;
  g += part('racine-droite', r1, B.b, [p('M362 402C342 404 322 408 306 412L260 416L260 430L362 430Z', B.sh), p('M364 400C352 400 334 402 318 410C302 416 282 418 260 414L260 420L364 420Z', B.dp), s('M350 388C334 386 318 390 306 396', B.l, 2)], 2, B.o);
  g += part('racine-droite-2', r2, B.b, [p('M402 414C390 412 378 408 368 404L364 430L402 430Z', B.sh)], 2, B.o);
  body += g + '\n';
}

// ====================== FEUILLAGES DES GRANDS ARBRES ======================
{
  let g = `<!-- ===== FEUILLAGES ===== -->\n`;
  // gauche : arrière (plus sombre) puis devant
  g += foliage('feuillage-g1', puff(150, 6, 76, 46, 9, 31, { flat: true }), C.leafBack, { sh: [8, 10], lk: 0 });
  g += foliage('feuillage-g2', puff(30, 40, 92, 78, 11, 32), C.leaf, { sh: [10, 12], lk: 0.6 });
  g += foliage('feuillage-g3', puff(108, 82, 54, 38, 9, 33, { flat: true }), C.leaf, { sh: [8, 10] });
  g += foliage('feuillage-g4', puff(-4, 168, 42, 50, 8, 34), C.leaf, { sh: [8, 10] });
  // droite
  g += foliage('feuillage-d1', puff(248, 2, 74, 42, 9, 41, { flat: true }), C.leafBack, { sh: [8, 10], lk: 0 });
  g += foliage('feuillage-d2', puff(362, 34, 86, 76, 11, 42), C.leaf, { sh: [10, 12], lk: 0.6 });
  g += foliage('feuillage-d3', puff(286, 76, 52, 36, 9, 43, { flat: true }), C.leaf, { sh: [8, 10] });
  g += foliage('feuillage-d4', puff(396, 168, 40, 50, 8, 44), C.leaf, { sh: [8, 10] });
  body += g;
}
// lianes qui pendent
function vine(x, y0, y1, sway, seed) {
  const R = rng(seed);
  let d = `M${x} ${y0}C${x + sway} ${n0(y0 + (y1 - y0) * 0.35)} ${x - sway} ${n0(y0 + (y1 - y0) * 0.7)} ${n0(x + sway * 0.3)} ${y1}`;
  let leaves = '';
  for (let t = 0.18; t < 1; t += 0.16) {
    const yy = y0 + (y1 - y0) * t, xx = x + sway * Math.sin(t * Math.PI * 1.6) * 0.55, side = (Math.round(t * 10) % 2 ? 1 : -1), sz = 4 + R() * 1.5;
    leaves += `M${n0(xx)} ${n0(yy)}q${n0(side * sz)} ${n0(-sz * 0.9)} ${n0(side * sz * 1.9)} ${n0(sz * 0.2)}q${n0(-side * sz)} ${n0(sz * 0.5)} ${n0(-side * sz * 1.9)} ${n0(-sz * 0.2)}Z`;
  }
  return s(d, '#2f7a4a', 1.6) + p(leaves, '#6cc062', ' stroke="#1f5240" stroke-width="1"');
}
body += `<!-- lianes -->\n` + vine(124, 108, 200, 8, 5) + vine(270, 104, 186, -8, 7) + vine(70, 150, 214, 6, 9) + '\n';

// ====================== PREMIER PLAN ======================
// fougère : tige courbe + folioles alternées
function fern(x, y, len, ang, bend, seed, col = C.front) {
  const pts = [], N = 7;
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = ang + bend * t * t;
    const prev = pts[i - 1] || [x, y];
    pts.push(i ? [prev[0] + Math.cos(a) * len / N, prev[1] + Math.sin(a) * len / N] : [x, y]);
  }
  let stem = `M${n0(pts[0][0])} ${n0(pts[0][1])}`; for (let i = 1; i <= N; i++) stem += `L${n0(pts[i][0])} ${n0(pts[i][1])}`;
  let lf = '', lfL = '', lfN = -1;
  for (let i = 1; i < N; i++) {
    const t = i / N, a = ang + bend * t * t, L = len * 0.24 * (1 - t * 0.75), [px, py] = pts[i];
    for (const sd of [-1, 1]) {
      const b = a + sd * 1.05, dx = Math.cos(b) * L, dy = Math.sin(b) * L, w = L * 0.32;
      const nx = -Math.sin(b) * w, ny = Math.cos(b) * w, up = ny < 0 ? 1 : -1;
      const M = sd < 0 ? `M${n0(px)} ${n0(py)}` : '';
      // foliole en relatif : aller par un bord, retour par l'autre
      lf += `${M}q${n0(dx / 2 + nx)} ${n0(dy / 2 + ny)} ${n0(dx)} ${n0(dy)}q${n0(-dx / 2 - nx)} ${n0(-dy / 2 - ny)} ${n0(-dx)} ${n0(-dy)}Z`;
      // moitié éclairée (côté haut) de chaque foliole
      if (up === 1 || i < 3) { lfL += `${lfN === i ? '' : `M${n0(px)} ${n0(py)}`}q${n0(dx / 2 + nx * up)} ${n0(dy / 2 + ny * up)} ${n0(dx)} ${n0(dy)}q${n0(-dx / 2 + nx * up * 0.2)} ${n0(-dy / 2 + ny * up * 0.2)} ${n0(-dx)} ${n0(-dy)}Z`; lfN = i; }   // après Z on est revenu au noeud : pas besoin de M
    }
  }
  return `<!-- fougère -->\n` + p(lf, col.sh, ` stroke="${col.o}" stroke-width="1.6"`) + p(lfL, col.l) + s(stem, col.o, 2.2) + s(stem, col.b, 1);
}
{
  let g = `<!-- ===== PREMIER PLAN ===== -->\n`;
  // buissons au pied des troncs
  g += foliage('buisson-g1', puff(14, 400, 44, 30, 9, 51, { flat: true }), C.front, { sh: [6, 8], sw: 2.2 });
  g += fern(-4, 440, 96, -1.05, 0.9, 1) + fern(6, 446, 80, -0.55, 0.7, 2);
  g += foliage('buisson-g2', puff(-6, 446, 34, 24, 8, 52, { flat: true }), C.front, { sh: [6, 7], sw: 2.2 });
  g += foliage('buisson-d1', puff(380, 396, 46, 30, 9, 53, { flat: true }), C.front, { sh: [6, 8], sw: 2.2 });
  g += fern(396, 438, 96, -2.1, -0.9, 3) + fern(386, 446, 78, -2.6, -0.7, 4);
  g += foliage('buisson-d2', puff(398, 444, 34, 24, 8, 54, { flat: true }), C.front, { sh: [6, 7], sw: 2.2 });
  // champignons lumineux
  function shroom(x, y, k) {
    const cap = `M${n1(x - 8 * k)} ${n1(y - 7 * k)}C${n1(x - 8 * k)} ${n1(y - 17 * k)} ${n1(x + 8 * k)} ${n1(y - 17 * k)} ${n1(x + 8 * k)} ${n1(y - 7 * k)}C${n1(x + 4 * k)} ${n1(y - 5 * k)} ${n1(x - 4 * k)} ${n1(y - 5 * k)} ${n1(x - 8 * k)} ${n1(y - 7 * k)}Z`;
    const stem = `M${n1(x - 2.6 * k)} ${n1(y - 7 * k)}C${n1(x - 3 * k)} ${n1(y - 3 * k)} ${n1(x - 3.4 * k)} ${n1(y)} ${n1(x - 3.6 * k)} ${n1(y)}L${n1(x + 3.4 * k)} ${n1(y)}C${n1(x + 3 * k)} ${n1(y - 3 * k)} ${n1(x + 2.6 * k)} ${n1(y - 5 * k)} ${n1(x + 2.6 * k)} ${n1(y - 7 * k)}Z`;
    return `<g fill="#8ff5ff"><circle cx="${x}" cy="${n1(y - 9 * k)}" r="${n1(16 * k)}" opacity="0.18"/><circle cx="${x}" cy="${n1(y - 9 * k)}" r="${n1(10 * k)}" opacity="0.28"/></g>` +
      p(stem, '#f3ecd8', ' stroke="#1d4a5a" stroke-width="1.4"') + p(cap, '#46cfe6', ' stroke="#1d4a5a" stroke-width="1.6"') +
      p(`M${n1(x - 6 * k)} ${n1(y - 9 * k)}C${n1(x - 6 * k)} ${n1(y - 14 * k)} ${n1(x - 1 * k)} ${n1(y - 15.5 * k)} ${n1(x + 2 * k)} ${n1(y - 15 * k)}C${n1(x - 2 * k)} ${n1(y - 14 * k)} ${n1(x - 4 * k)} ${n1(y - 12 * k)} ${n1(x - 6 * k)} ${n1(y - 9 * k)}Z`, '#c9fdff') +
      `<circle cx="${n1(x + 3 * k)}" cy="${n1(y - 11 * k)}" r="${n1(1.6 * k)}" fill="#e9ffff"/><circle cx="${n1(x - 1.5 * k)}" cy="${n1(y - 8.6 * k)}" r="${n1(1.1 * k)}" fill="#e9ffff"/>`;
  }
  g += `<!-- champignons lumineux -->\n` + shroom(96, 404, 1) + shroom(108, 408, 0.7) + shroom(286, 404, 0.9) + '\n';
  body += g;
}

// ====================== BANDE DE TERRE SOUS LE HUD (600 → 844) ======================
// Bord avant de la clairière = motte d'herbe vue de face (bosses festonnées, cel-shading, contour en bas seulement :
// en haut elle prolonge la clairière, une arête claire marque le pli). Dessous, la terre en coupe, calme et de plus
// en plus sombre vers le bas pour porter le HUD : 3 couches à bords francs, ombre portée de la motte, radicelles,
// quelques cailloux sur les côtés, centre presque vide.
{
  const E = { l: '#8a5a3d', c1: '#6b4430', c2: '#56372a', c3: '#432a20', sh: '#3a2219', o: '#2b1913' };
  const G = { b: '#6aaa4a', sh: '#4b8a3c', o: '#24502c', rim: '#b4e28c' };
  let g = `<!-- ===== TERRE SOUS LE HUD ===== -->\n<!-- terre : 3 couches -->\n<rect x="0" y="600" width="390" height="244" fill="${E.c1}"/>`;
  const l2 = 'M-10 684C40 676 90 688 150 680C210 672 270 686 330 678C360 674 380 676 400 680', l3 = 'M-10 764C60 756 120 768 190 760C260 752 330 764 400 758';
  // le trait de 1.5 sur le bord haut de chaque couche ; ses autres bords sont hors cadre, donc invisibles
  g += p(l2 + 'L400 850L-10 850Z', E.c2, ` stroke="${E.sh}" stroke-width="1.5"`) + p(l3 + 'L400 850L-10 850Z', E.c3, ` stroke="${E.sh}" stroke-width="1.5"`) + '\n';
  // grains : trous sombres et petits graviers clairs
  const dots = l => l.map(([x, y]) => `M${x} ${y}h0`).join('');
  g += `<!-- grains -->\n` + s(dots([[34, 704], [98, 646], [124, 744], [266, 650], [304, 750], [356, 734]]), E.sh, 3.2) +
    s(dots([[110, 700], [44, 742], [280, 708], [140, 662]]), E.l, 2.6) + '\n';
  // cailloux : 4 facettes (bosses plates), recette des feuillages en gris-violet, reflet = un point
  const ST = [[26, 652, 12, 8, 1], [362, 648, 13, 9, 4], [72, 720, 7, 5, 2], [328, 714, 6, 4, 5]];
  const SP = ST.map(([x, y, rx, ry, sd]) => puff(x, y, rx, ry, 4, sd, { k: 0.8, jr: 0.08, ja: 0.25 }));
  g += foliage('cailloux', { d: SP.map(q => q.d).join(''), box: [10, 634, 368, 94] }, { b: '#968fab', sh: '#69627f', o: E.o }, { sh: [2, 3], sw: 1.6 }) +
    s(dots(ST.map(([x, y, rx, ry]) => [Math.round(x - rx * 0.45), Math.round(y - ry * 0.4)])), '#c6bfd8', 2.6) + '\n';
  // motte : bord haut = fin de la clairière (léger arrondi), bord bas = bosses
  const R = rng(61), bot = [[400, 605]];
  while (bot[bot.length - 1][0] > -10) { const nx = Math.max(-10, bot[bot.length - 1][0] - 25 - Math.round(R() * 14)); bot.push([nx, 605 + Math.round(R() * 5) + (nx > 100 && nx < 290 ? 2 : 0)]); }
  const arcs = (pts, k) => pts.slice(1).map((B2, i) => { const A = pts[i], L = Math.hypot(B2[0] - A[0], B2[1] - A[1]), r = Math.round(Math.max(L * k, L / 2 + 0.5)); return `a${r} ${r} 0 0 1 ${B2[0] - A[0]} ${B2[1] - A[1]}`; }).join('');
  const sb = bot.map(([x, y]) => [x + 3, y + 7]);
  // radicelles : pendues à quelques creux entre les bosses, elles sortent de l'ombre de la motte
  g += `<!-- radicelles -->\n` + s([2, 4, 7, 10, 12].filter(i => i < bot.length - 1).map((i, k) => { const [x, y] = bot[i], q = k % 2 ? -1 : 1; return `M${x + 3} ${y + 6}c${-q} 5 ${2 * q} 8 ${-q} ${12 + 2 * (k % 3)}`; }).join(''), E.o, 1.4) + '\n';
  g += `<!-- ombre de la motte -->\n` + p(`M-10 603L403 603L403 ${sb[0][1]}${arcs(sb, 0.8)}Z`, E.sh) + '\n';
  const top = 'M-10 593C120 600 270 600 400 593';
  // cel-shading sans clip : la forme en couleur d'ombre, puis la même avec les bosses remontées de (−2, −4) mais le
  // bord haut inchangé (rien ne déborde) ; contour en bas seulement, arête claire sur le pli
  const bumps = arcs(bot, 0.62);
  g += `<!-- motte -->\n` + p(`${top}L400 605${bumps}Z`, G.sh) + p(`${top}L398 601${bumps}Z`, G.b) + s(`M400 605${bumps}`, G.o, 2.2) + s(top, G.rim, 2.4) + '\n';
  body += g;
}

// ====================== LUCIOLES ET ÉTINCELLES ======================
{
  const L = [[150, 168], [216, 236], [104, 262], [292, 300], [262, 330], [120, 318], [182, 360], [318, 232], [146, 372], [240, 120], [94, 222]];
  // un point = trait de longueur 0 à bouts ronds (plus léger que des cercles)
  const dots = L.map(([x, y]) => `M${x} ${y}h0`).join('');
  body += `<!-- ===== LUCIOLES ===== -->\n` + s(dots, '#f4ff9a', 14, ' opacity="0.18"') + s(dots, '#f4ff9a', 7, ' opacity="0.4"') + s(dots, '#fffff0', 3.2) + '\n';
  const star = (x, y, r) => { const k = r * 0.3; return `M${x} ${y - r}L${n1(x + k)} ${n1(y - k)}L${x + r} ${y}L${n1(x + k)} ${n1(y + k)}L${x} ${y + r}L${n1(x - k)} ${n1(y + k)}L${x - r} ${y}L${n1(x - k)} ${n1(y - k)}Z`; };
  body += `<!-- étincelles -->\n` + p([star(196, 196, 5), star(268, 270, 4), star(176, 300, 3), star(310, 180, 3)].join(''), '#ffffff', ' opacity="0.85"') + '\n';
}

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844">
<!-- Fuze Arena : décor de combat « clairière » (préfixe df-), 390 × 844, généré par tools/df-build.cjs.
     Combattants sur l'herbe de y≈388 à 600 ; terre sous le HUD de 600 à 844. -->
<defs>
${defs.join('\n')}
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
${body}</g>
</svg>
`;
// contrôles : éléments interdits, préfixe des id, références, taille
const bad = [];
if (process.env.NOMIN) { /* pour comparer : sortie non compactée */ } else svg = svg.replace(/ d="([^"]*)"/g, (m, d) => ` d="${minD(d)}"`);
if (/<style|<script|<animate|<image|<text|<foreignObject|<filter|<use|class=|@keyframes|href=/.test(svg)) bad.push('élément interdit');
const all = [...svg.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
for (const id of all) if (!id.startsWith(PRE + '-')) bad.push('id sans préfixe : ' + id);
if (new Set(all).size !== all.length) bad.push('id en double');
for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) if (!svg.includes(`id="${m[1]}"`)) bad.push('référence manquante : ' + m[1]);
if (/NaN|undefined/.test(svg)) bad.push('NaN/undefined dans le tracé');
fs.writeFileSync(OUT, svg);
const ko = Buffer.byteLength(svg) / 1024;
if (Buffer.byteLength(svg) >= 45000) bad.push("trop gros (" + Buffer.byteLength(svg) + " o, limite 45 000)");
console.log('écrit', OUT, ko.toFixed(1) + ' Ko', bad.length ? 'PROBLÈMES : ' + bad.join(', ') : 'OK');
