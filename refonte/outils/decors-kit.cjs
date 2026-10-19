// Atelier des décors de combat (refonte) : briques pour dessiner dans le style du guide (art/STYLE.md),
// avec les règles du décor de la maquette (outils/df-build.cjs) : contours plus fins et de la couleur sombre
// de la matière (pas #1b1530), pas de doublure, et plus c'est loin, plus c'est pâle (perspective atmosphérique).
//
// Repère d'un décor : 480 × 660. 3 px = 1 unité de l'ancien décor pixel (160 × 90), décalé de 130 unités vers le
// haut : le nouveau décor monte jusqu'en haut de l'écran du téléphone. Repères :
//   y ≈ 570 : fond du sol (horizon)        y = 615 : pieds des combattants        y = 660 : bas du décor
// Au-delà de 660, le jeu prolonge avec la couleur « deep » du thème (la terre sous le HUD).
// 3 plans, qui bougent à des vitesses différentes : loin (montagnes), milieu, sol (+ grands éléments du devant).
const fs = require('fs');

const n0 = v => String(Math.round(v));
const n1 = v => String(Math.round(v * 10) / 10);
function mix(hex, t, to) {
  const n = parseInt(hex.slice(1), 16), m = parseInt(to.slice(1), 16);
  const c = [16, 8, 0].map(s => (n >> s) & 255), d = [16, 8, 0].map(s => (m >> s) & 255);
  return '#' + c.map((v, i) => Math.round(v + (d[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
// 4 tons + contour à partir d'une couleur de base
const tones = (b, k = 1) => ({ l: mix(b, 0.3 * k, '#ffffff'), b, sh: mix(b, 0.24 * k, '#1b1530'), dp: mix(b, 0.42 * k, '#1b1530'), o: mix(b, 0.62, '#1b1530') });
// même chose, noyé dans la brume (plus c'est loin, plus on tend vers la couleur du ciel)
const hazed = (t, sky, a) => Object.fromEntries(Object.entries(t).map(([k, v]) => [k, mix(v, a, sky)]));
function rng(seed) { let x = (seed * 9301 + 49297) % 233280 || 1; return () => (x = (x * 9301 + 49297) % 233280) / 233280; }
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
const s = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
const poly = pts => 'M' + pts.map(q => `${n1(q[0])} ${n1(q[1])}`).join('L') + 'Z';
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// ---------------------------------------------------------------- document
function Doc(prefix) {
  const defs = [], P = { loin: [], milieu: [], sol: [] };
  let n = 0;
  const id = k => `${prefix}-${k}${(n++).toString(36)}`;
  const D = {
    P,
    add(plan, xml) { P[plan].push(xml); },
    defs(xml) { defs.push(xml); },
    clip(d) { const i = id('c'); defs.push(`<clipPath id="${i}"><path d="${d}"/></clipPath>`); return `url(#${i})`; },
    // dégradé vertical en coordonnées de l'écran (y0 → y1)
    vgrad(y0, y1, stops) {
      const i = id('g');
      defs.push(`<linearGradient id="${i}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`);
      return `url(#${i})`;
    },
    // halo de lumière : un seul disque en dégradé radial (cœur → 0)
    glow(plan, cx, cy, r, color, a = 0.6) {
      const i = id('h');
      defs.push(`<radialGradient id="${i}"><stop offset="0" stop-color="${color}" stop-opacity="${a}"/><stop offset="0.5" stop-color="${color}" stop-opacity="${a * 0.4}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
      P[plan].push(`<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="url(#${i})"/>`);
    },
    // pièce : clip + aplat + ombres/reflets découpés + contour
    part(d, fill, shades = [], sw = 2, oc = '#000') {
      return `<g clip-path="${D.clip(d)}"><rect x="-60" y="-60" width="600" height="800" fill="${fill}"/>${shades.join('')}</g>` + (sw ? s(d, oc, sw) : '');
    },
    write(file, title, ranges = { loin: [0, 600], milieu: [0, 660], sol: [0, 660] }) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 660">\n<!-- Fuze Arena : décor de combat « ${title} » (préfixe ${prefix}-), 480 × 660, généré par refonte/outils/decors.cjs.\n     3 plans (loin, milieu, sol) ; horizon y≈570, pieds des combattants y=615. -->\n<defs>${defs.join('')}</defs>\n<g stroke-linejoin="round" stroke-linecap="round">\n`;
      for (const k of ['loin', 'milieu', 'sol']) svg += `<!-- PLAN ${k} ${ranges[k][0]} ${ranges[k][1]} -->\n${P[k].join('\n')}\n<!-- FIN ${k} -->\n`;
      svg += `</g>\n</svg>\n`;
      fs.writeFileSync(file, svg);
      return Buffer.byteLength(svg);
    },
  };
  return D;
}

// ---------------------------------------------------------------- touffes festonnées (feuillage, nuages, buissons)
const LIGHT = Math.atan2(-1.25, -1);
function arcInfo(A, B, r) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
  r = Math.max(r, L / 2 + 0.01);
  const nx = dy / L, ny = -dx / L, h = Math.sqrt(r * r - L * L / 4);
  const C = [(A[0] + B[0]) / 2 - nx * h, (A[1] + B[1]) / 2 - ny * h];
  const a0 = Math.atan2(A[1] - C[1], A[0] - C[0]);
  let da = Math.atan2(B[1] - C[1], B[0] - C[0]) - a0; while (da < 0) da += 2 * Math.PI;
  return { C, r, a0, da };
}
function scallop(pts, o = {}) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length; i++) {
    const A = pts[i], B = pts[(i + 1) % pts.length];
    if (o.open && i === pts.length - 1) { d += `L${B[0]} ${B[1]}`; break; }
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, ny = -(B[0] - A[0]) / L;
    let k = o.k ?? 0.58; if (o.flat && ny > 0.55) k = 1.6;
    const r = Math.round(Math.max(L * k, L / 2 + 0.5));
    d += `a${r} ${r} 0 0 1 ${B[0] - A[0]} ${B[1] - A[1]}`;
  }
  return d + 'Z';
}
// touffe : ellipse (cx, cy, rx, ry) en n bosses
function puff(cx, cy, rx, ry, n, seed, o = {}) {
  const R = rng(seed), a0 = o.a0 ?? (-Math.PI / 2 - Math.PI / n), pts = [];
  for (let i = 0; i < n; i++) {
    const t = a0 + i * 2 * Math.PI / n + (R() - 0.5) * (o.ja ?? 0.3) * 2 * Math.PI / n, j = 1 + (R() - 0.5) * 2 * (o.jr ?? 0.1);
    pts.push([cx + rx * Math.cos(t) * j, cy + ry * Math.sin(t) * j].map(v => Math.round(v)));
  }
  return { d: scallop(pts, o), e: [cx, cy, rx, ry] };
}
// crête arrondie (collines, buissons en rang, haies) : points du haut, fermée en bas à yb
function hillRow(xs, ys, yb, rk = [0.6]) {
  let d = `M${xs[0]} ${yb}L${xs[0]} ${ys[0]}`;
  for (let i = 0; i + 1 < xs.length; i++) {
    const L = Math.hypot(xs[i + 1] - xs[i], ys[i + 1] - ys[i]), r = Math.round(Math.max(L * rk[i % rk.length], L / 2 + 0.5));
    d += `a${r} ${r} 0 0 1 ${xs[i + 1] - xs[i]} ${ys[i + 1] - ys[i]}`;
  }
  const minY = Math.min(...ys), minX = Math.min(...xs), maxX = Math.max(...xs);
  return { d: d + `L${xs[xs.length - 1]} ${yb}Z`, e: [(minX + maxX) / 2, (minY + yb) / 2, (maxX - minX) / 2, (yb - minY) / 2] };
}
// feuillage cel-shadé : fond d'ombre, même forme décalée vers le haut-gauche en couleur de base, zone éclairée
// (la forme réduite poussée vers le haut-gauche), contour
function foliage(D, P, c, o = {}) {
  const sh = o.sh ?? [7, 9];
  let g = `<g clip-path="${D.clip(P.d)}"><rect x="-60" y="-60" width="600" height="800" fill="${c.dp || c.sh}"/>`;
  if (c.dp) g += `<path transform="translate(${n0(-sh[0] * 0.4)} ${n0(-sh[1] * 0.4)})" d="${P.d}" fill="${c.sh}"/>`;
  g += `<path transform="translate(${-sh[0]} ${-sh[1]})" d="${P.d}" fill="${c.b}"/>`;
  if (c.l && P.e && o.lk !== 0) {
    const [cx, cy, rx, ry] = P.e, k = o.lk ?? 0.68;
    g += `<path transform="translate(${n1(cx * (1 - k) - rx * 0.24)} ${n1(cy * (1 - k) - ry * 0.32)}) scale(${k})" d="${P.d}" fill="${c.l}"/>`;
  }
  if (o.extra) g += o.extra;
  g += '</g>';
  if (o.sw !== 0) g += s(P.d, c.o, o.sw ?? 2);
  return g;
}

// ---------------------------------------------------------------- montagnes (arêtes droites, faces éclairée/ombrée)
// pts = ligne de crête [[x, y], …] (sommets et creux en alternance), fermée en bas à yb
function mountains(D, pts, yb, c, o = {}) {
  const d = `M${pts[0][0]} ${yb}` + pts.map(q => `L${q[0]} ${q[1]}`).join('') + `L${pts[pts.length - 1][0]} ${yb}Z`;
  let sh = '', dp = '', lt = '', snow = '', snowSh = '', cre = '';
  for (let i = 1; i < pts.length - 1; i++) {
    const P = pts[i], L = pts[i - 1], R = pts[i + 1];
    if (!(P[1] < L[1] && P[1] < R[1])) continue;
    // face droite à l'ombre (bord intérieur qui descend un peu vers la droite)
    const foot = [P[0] + (R[0] - P[0]) * 0.22, yb];
    sh += poly([P, R, [R[0], yb], foot]);
    dp += poly([lerp(P, R, 0.15), R, [R[0], yb], [R[0] - (R[0] - P[0]) * 0.25, yb], lerp(lerp(P, R, 0.15), [R[0], yb], 0.5)]);
    // liseré de lumière sur l'arête gauche
    const a = lerp(P, L, 0.55);
    lt += poly([P, a, [a[0] + 6, a[1] + 2], [P[0] + 1, P[1] + 10]]);
    // crevasses (traits qui descendent du sommet)
    const m1 = lerp(P, [foot[0] - 30, yb], 0.35), m2 = lerp(P, [L[0] + 10, yb], 0.3);
    cre += `M${n1(m1[0])} ${n1(m1[1])}l${n1(-8)} ${n1(22)}M${n1(m2[0])} ${n1(m2[1])}l${n1(6)} ${n1(18)}`;
    if (c.snow) {
      const f = o.snowLine ?? 0.34, A = lerp(P, L, f), B = lerp(P, R, f * 0.9), teeth = [];
      const k = 4;
      for (let j = 1; j < k; j++) { const q = lerp(B, A, j / k); teeth.push([q[0], q[1] + (j % 2 ? 9 : -2)]); }
      const cap = [P, B, ...teeth, A];
      snow += poly(cap);
      snowSh += poly([P, B, ...teeth.slice(0, 1), [P[0] + 2, (P[1] + B[1]) / 2 + 6]]);
    }
  }
  const shades = [p(sh, c.sh), dp && c.dp ? p(dp, c.dp) : '', c.l ? p(lt, c.l) : '', o.cracks !== false ? s(cre, c.sh, 2) : ''];
  if (c.snow) shades.push(p(snow, c.snow), p(snowSh, c.snowSh || mix(c.snow, 0.2, '#5a7ab0')));
  return D.part(d, c.b, shades, o.sw ?? 0, c.o);
}

// ---------------------------------------------------------------- rocher à facettes
// polygone posé au sol (yb) ; les facettes tournées vers la lumière sont claires, les autres à l'ombre
function rock(D, cx, yb, w, h, seed, c, o = {}) {
  const R = rng(seed), n = o.n ?? 6, pts = [[cx - w / 2, yb]];
  for (let i = 0; i <= n; i++) {
    const t = Math.PI * (1 - i / n), j = 1 + (R() - 0.5) * 0.35;
    pts.push([cx + Math.cos(t) * w / 2 * (i === 0 || i === n ? 1 : j), yb - Math.sin(t) * h * j * (o.peak ? 1 - Math.abs(Math.cos(t)) * 0.35 : 1)]);
  }
  pts.push([cx + w / 2, yb]);
  const C = [cx - w * 0.08, yb - h * 0.42];
  let lt = '', sh = '', dp = '';
  for (let i = 1; i < pts.length - 2; i++) {
    const A = pts[i], B = pts[i + 1], nx = B[1] - A[1], ny = -(B[0] - A[0]);   // normale extérieure (contour horaire à l'écran)
    const L = Math.hypot(nx, ny) || 1, dot = (nx * -0.62 + ny * -0.78) / L;
    const tri = poly([C, A, B]);
    if (dot > 0.55) lt += tri; else if (dot < -0.1) dp += tri; else if (dot < 0.25) sh += tri;
  }
  sh += poly([C, pts[pts.length - 2], [cx + w / 2, yb], [cx + w * 0.1, yb]]);
  const d = poly(pts);
  const out = D.part(d, c.b, [p(sh, c.sh), p(dp, c.dp || c.sh), p(lt, c.l), o.crack ? s(`M${n1(C[0])} ${n1(C[1])}l${n1(w * 0.12)} ${n1(h * 0.25)}l${n1(-w * 0.05)} ${n1(h * 0.2)}`, c.dp || c.sh, 1.6) : ''], o.sw ?? 2, c.o);
  return out;
}

// ---------------------------------------------------------------- pointes : stalactites, stalagmites, pics, cristaux
// pointe de (x, y) (base, largeur 2w) vers la pointe à len (dir = 1 vers le bas, -1 vers le haut), bend = décalage de la pointe
function spike(D, x, y, w, len, dir, c, o = {}) {
  const tip = [x + (o.bend || 0), y + dir * len];
  const d = `M${n1(x - w)} ${n1(y)}Q${n1(x - w * 0.55)} ${n1(y + dir * len * 0.55)} ${n1(tip[0])} ${n1(tip[1])}Q${n1(x + w * 0.6)} ${n1(y + dir * len * 0.5)} ${n1(x + w)} ${n1(y)}Z`;
  const shades = [
    p(`M${n1(x + w * 0.15)} ${n1(y)}Q${n1(x + w * 0.2)} ${n1(y + dir * len * 0.55)} ${n1(tip[0])} ${n1(tip[1])}L${n1(x + w * 2)} ${n1(y + dir * len)}L${n1(x + w * 2)} ${n1(y)}Z`, c.sh),
    p(`M${n1(x - w * 0.62)} ${n1(y)}Q${n1(x - w * 0.42)} ${n1(y + dir * len * 0.45)} ${n1(tip[0] - 0.5)} ${n1(tip[1] - dir * 4)}Q${n1(x - w * 0.5)} ${n1(y + dir * len * 0.4)} ${n1(x - w * 0.3)} ${n1(y)}Z`, c.l),
  ];
  if (o.rings) for (let k = 1; k <= o.rings; k++) { const t = k / (o.rings + 1) * 0.7, yy = y + dir * len * t, hw = w * (1 - t) * 0.95; shades.push(s(`M${n1(x - hw)} ${n1(yy)}q${n1(hw)} ${n1(dir * 3)} ${n1(hw * 2)} 0`, c.dp || c.sh, 1.4)); }
  return D.part(d, c.b, shades, o.sw ?? 1.8, c.o);
}
// cristal : prisme à 3 faces (gauche éclairée, droite à l'ombre), penché de ang degrés autour de sa base
function crystal(D, x, yb, w, h, ang, c, o = {}) {
  const pts = [[-w, 0], [-w, -h * 0.72], [0, -h], [w, -h * 0.72], [w, 0]];
  const d = poly(pts), mid = `M0 0L0 ${n1(-h * 0.84)}`;
  const g = D.part(d, c.b, [p(poly([[0, 0], [0, -h], [w, -h * 0.72], [w, 0]]), c.sh), p(poly([[-w, 0], [-w, -h * 0.72], [0, -h], [-w * 0.45, -h * 0.75], [-w * 0.45, 0]]), c.l), s(mid, c.l, 1.2),
    `<path d="M${n1(-w * 0.7)} ${n1(-h * 0.7)}l${n1(w * 0.25)} ${n1(-h * 0.12)}" stroke="#ffffff" stroke-width="${n1(Math.max(1.4, w * 0.25))}" fill="none"/>`], o.sw ?? 1.6, c.o);
  return `<g transform="translate(${n1(x)} ${n1(yb)}) rotate(${ang})">${g}</g>`;
}
function crystals(D, plan, x, yb, k, c, glowCol, seed = 1) {
  if (glowCol) D.glow(plan, x, yb - 18 * k, 46 * k, glowCol, 0.55);
  const R = rng(seed);
  const set = [[-10, 7, 30, -24], [10, 6, 26, 22], [0, 9, 44, -4], [-4, 5, 18, -48], [16, 4, 15, 46]];
  D.add(plan, set.map(([dx, w, h, a]) => crystal(D, x + dx * k, yb + 2, w * k, h * k * (0.9 + R() * 0.25), a, c)).join(''));
}

// ---------------------------------------------------------------- sapin (3 étages), avec neige en option
function pine(D, x, yb, h, w, c, o = {}) {
  const tier = (ty, th, tw) => [[x, ty], [x + tw * 0.55, ty + th * 0.62], [x + tw * 0.28, ty + th * 0.6], [x + tw, ty + th], [x - tw, ty + th], [x - tw * 0.28, ty + th * 0.6], [x - tw * 0.55, ty + th * 0.62]];
  const T = [tier(yb - h, h * 0.42, w * 0.55), tier(yb - h * 0.72, h * 0.42, w * 0.78), tier(yb - h * 0.44, h * 0.38, w)];
  let g = '';
  const trunk = poly([[x - w * 0.1, yb - h * 0.1], [x + w * 0.1, yb - h * 0.1], [x + w * 0.12, yb], [x - w * 0.12, yb]]);
  g += p(trunk, c.trunk || '#5a3a26', ` stroke="${c.o}" stroke-width="1.6"`);
  for (const t of T.reverse()) {
    const top = t[0], bot = t[3][1];
    const shades = [p(poly([top, t[1], t[2], t[3], [x + 2, bot]]), c.sh), p(poly([top, [x - 1, bot], t[4], t[5], t[6]]), c.l)];
    shades.push(p(poly([[x - w, bot - 6], [x + w, bot - 6], [x + w, bot + 2], [x - w, bot + 2]]), c.dp || c.sh));
    if (c.snow) shades.push(p(poly([top, lerp(top, t[1], 0.45), [x + 2, top[1] + (bot - top[1]) * 0.36], lerp(top, t[6], 0.5)]), c.snow), p(poly([t[6], [t[6][0] + 8, t[6][1] + 2], t[5]]), c.snow), p(poly([t[1], t[2], [t[1][0] - 10, t[1][1] + 3]]), c.snow));
    g += D.part(poly(t), c.b, shades, o.sw ?? 1.8, c.o);
  }
  return g;
}

// ---------------------------------------------------------------- arbre mort (branches en capsules, contour commun)
function capsule(x1, y1, x2, y2, w1, w2) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return poly([[x1 + nx * w1, y1 + ny * w1], [x2 + nx * w2, y2 + ny * w2], [x2 - nx * w2, y2 - ny * w2], [x1 - nx * w1, y1 - ny * w1]]);
}
// segs = [[x1, y1, x2, y2, w1, w2], …] ; dessin : contour commun (trait épais sous tout), aplat, ombre à droite
function branchy(segs, c, sw = 2) {
  const shapes = segs.map(q => capsule(...q));
  const shadeS = segs.map(([x1, y1, x2, y2, w1, w2]) => capsule(x1 + w1 * 0.45, y1, x2 + w2 * 0.45, y2, w1 * 0.55, w2 * 0.55));
  const litS = segs.map(([x1, y1, x2, y2, w1, w2]) => capsule(x1 - w1 * 0.55, y1, x2 - w2 * 0.55, y2, w1 * 0.2, w2 * 0.2));
  return `<g fill="${c.o}" stroke="${c.o}" stroke-width="${sw * 2}">${shapes.map(d => `<path d="${d}"/>`).join('')}</g>` +
    p(shapes.join(''), c.b) + p(shadeS.join(''), c.sh) + p(litS.join(''), c.l);
}
// arbre mort procédural : tronc + branches qui se divisent
function deadTree(x, yb, h, seed, c, o = {}) {
  const R = rng(seed), segs = [];
  const grow = (x1, y1, ang, len, w, depth) => {
    const x2 = x1 + Math.cos(ang) * len, y2 = y1 + Math.sin(ang) * len, w2 = Math.max(1.2, w * 0.62);
    segs.push([x1, y1, x2, y2, w, w2]);
    if (depth <= 0) return;
    const n = depth > 2 ? 2 : 1 + (R() < 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const da = (i === 0 ? -1 : 1) * (0.35 + R() * 0.45) + (o.lean || 0) * 0.2;
      grow(x2, y2, ang + da, len * (0.62 + R() * 0.15), w2, depth - 1);
    }
  };
  // racines
  segs.push([x, yb, x - h * 0.16, yb + 4, h * 0.05, 1.5], [x, yb, x + h * 0.18, yb + 3, h * 0.05, 1.5]);
  grow(x, yb + 2, -Math.PI / 2 + (o.lean || 0), h * 0.42, h * 0.07, o.depth ?? 4);
  return branchy(segs, c, o.sw ?? 1.8);
}

// ---------------------------------------------------------------- herbe, cailloux, fleurs
function tuft(x, y, k) {
  const r = v => n0(v * k);
  return `M${n0(x - 5 * k)} ${n0(y)}q0 ${r(-5)} ${r(-4)} ${r(-8)}q${r(5)} ${r(2)} ${r(7)} ${r(5)}q${r(1)} ${r(-5)} ${r(2)} ${r(-9)}q${r(2)} ${r(5)} ${r(2)} ${r(9)}q${r(2)} ${r(-3)} ${r(6)} ${r(-4)}q${r(-3)} ${r(3)} ${r(-3)} ${r(7)}Z`;
}
function tufts(list, cb, cl) {
  return p(list.map(t => tuft(...t)).join(''), cb) + p(list.map(([x, y, k]) => tuft(Math.round(x - 1.3 * k), Math.round(y - 0.6 * k), k * 0.72)).join(''), cl);
}
// frange de brins sur un bord (casse la ligne droite)
function fringe(x0, x1, y, seed, hmin = 4, hvar = 6, step = 6) {
  const R = rng(seed); let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += step) { const h = hmin + Math.round(R() * hvar), tip = Math.round(R() * 4 - 1); d += `l${step / 2 + tip} ${-h}l${step / 2 - tip} ${h}`; }
  return d + `L${x1} ${y + 5}L${x0} ${y + 5}Z`;
}
// cailloux plats posés au sol (ellipses + facette claire)
function pebbles(list, c) {
  let a = '', b = '';
  for (const [x, y, r] of list) {
    a += `M${n1(x - r)} ${n1(y)}a${n1(r)} ${n1(r * 0.6)} 0 1 0 ${n1(2 * r)} 0a${n1(r)} ${n1(r * 0.6)} 0 1 0 ${n1(-2 * r)} 0Z`;
    b += `M${n1(x - r * 0.7)} ${n1(y - r * 0.1)}a${n1(r * 0.55)} ${n1(r * 0.32)} 0 0 1 ${n1(r * 0.9)} ${n1(-r * 0.3)}a${n1(r * 0.7)} ${n1(r * 0.4)} 0 0 0 ${n1(-r * 0.9)} ${n1(r * 0.3)}Z`;
  }
  return p(a, c.b, ` stroke="${c.o}" stroke-width="1.5"`) + p(b, c.l);
}
function flowers(list, stem = '#4f8f5a') {
  const cross = l => l.map(([x, y]) => `M${x - 2} ${y}h4M${x} ${y - 2}v4`).join('');
  const cols = [...new Set(list.map(f => f[2]))];
  return s(cross(list), stem, 6.2) + cols.map(c => s(cross(list.filter(f => f[2] === c)), c, 4.4)).join('') + s(list.map(([x, y]) => `M${x} ${y}h0`).join(''), '#f7bc2a', 2.6);
}

// ---------------------------------------------------------------- sol
// g = { top: bord du fond (y), light, base, deep, edge (contour du bord), rim (liseré clair) }
// Le sol va du bord du fond jusqu'en bas (660) ; une lèvre avant (bosses) à y≈645 et la terre « deep » dessous.
function ground(D, g) {
  const top = g.top ?? 570, R = rng(g.seed || 3);
  let edge = `M-30 ${top + 4}`;
  for (let x = -30; x < 510; x += 40) edge += `Q${x + 20} ${top + (R() - 0.5) * (g.wave ?? 6)} ${x + 40} ${top + 2 + (R() - 0.5) * 3}`;
  const d = edge + 'L510 670L-30 670Z';
  const fill = D.vgrad(top, 660, [[0, g.light], [0.3, g.base], [0.8, g.base2 || g.base], [1, g.base2 || g.base]]);
  let out = p(d, fill);
  if (g.rim) out += s(edge, g.rim, 3);
  if (g.edge) out += s(edge, g.edge, 1.6);
  return out;
}
// lèvre avant du sol : bosses vues de face (cel-shading) puis la terre en coupe, jusqu'à 660 (couleur deep)
function lip(D, y, c, seed = 5) {
  if (c.stage) {   // bord de scène : arête droite, liseré doré, face avant sombre
    return p(`M-30 ${y - 4}L520 ${y - 4}L520 670L-30 670Z`, c.dirt) + p(`M-30 ${y + 8}H520V670H-30Z`, c.deep) +
      p(`M-30 ${y - 6}H520v5H-30Z`, '#f7bc2a', ` stroke="${c.o}" stroke-width="1.6"`) + p(`M-30 ${y - 6}H520v1.6H-30Z`, '#fff7c4');
  }
  const R = rng(seed), xs = [], ys = [];
  for (let x = -30; x <= 520; x += 34 + Math.round(R() * 18)) { xs.push(x); ys.push(y + Math.round(R() * 6 - 3)); }
  let dTop = `M-30 ${y - 4}L520 ${y - 4}L520 ${ys[ys.length - 1]}`;
  for (let i = xs.length - 1; i > 0; i--) { const L = xs[i] - xs[i - 1], r = Math.round(L * 0.62); dTop += `a${r} ${r} 0 0 1 ${xs[i - 1] - xs[i]} ${ys[i - 1] - ys[i]}`; }
  dTop += 'Z';
  // terre sous la lèvre
  let out = p(`M-30 ${y - 6}L520 ${y - 6}L520 670L-30 670Z`, c.dirt);
  out += p(`M-30 ${y + 9}C60 ${y + 5} 140 ${y + 12} 240 ${y + 8}C340 ${y + 4} 420 ${y + 11} 520 ${y + 7}L520 670L-30 670Z`, c.deep);
  out += D.part(dTop, c.top, [`<path transform="translate(-3 -4)" d="${dTop}" fill="${c.topL}"/>`], 1.8, c.o);
  return out;
}

// ---------------------------------------------------------------- architecture
// mur de pierres (x0 → x1, du haut yt jusqu'à yb), avec créneaux et joints
function wall(D, x0, x1, yt, yb, c, o = {}) {
  const cw = o.crenel ?? 0, ch = o.crenelH ?? 14;
  let top = `M${x0} ${yb}L${x0} ${yt}`;
  if (cw) { for (let x = x0; x + cw * 2 <= x1 + 1; x += cw * 2) top += `L${x + cw} ${yt}L${x + cw} ${yt + ch}L${x + cw * 2} ${yt + ch}L${x + cw * 2} ${yt}`; }
  const d = top + `L${x1} ${yt}L${x1} ${yb}Z`;
  const rows = o.row ?? 14, bw = o.brick ?? 28;
  let j = '';
  const y0 = yt + (cw ? ch : 0);
  for (let y = y0 + rows, r = 0; y < yb; y += rows, r++) {
    j += `M${x0} ${y}H${x1}`;
    for (let x = x0 + (r % 2 ? bw / 2 : 0); x < x1; x += bw) j += `M${x} ${y}v${-rows}`;
  }
  const shades = [s(j, c.sh, 1.6), p(`M${x0} ${y0}H${x1}v6H${x0}Z`, c.l)];
  if (cw) shades.push(p(`M${x0} ${y0}H${x1}v${ch * 0.6}H${x0}Z`, c.sh));
  if (o.shadeRight) shades.push(p(`M${x1 - o.shadeRight} ${yt - 20}H${x1 + 5}V${yb}H${x1 - o.shadeRight}Z`, c.sh));
  shades.push(p(`M${x0 - 5} ${yb - (o.foot ?? 10)}H${x1 + 5}V${yb + 5}H${x0 - 5}Z`, c.dp || c.sh));
  return D.part(d, c.b, shades, o.sw ?? 2, c.o);
}
// colonne (fût + chapiteau + base)
function pillar(D, x, yt, yb, w, c, o = {}) {
  const shaft = poly([[x - w, yt + 16], [x + w, yt + 16], [x + w, yb - 14], [x - w, yb - 14]]);
  const capT = poly([[x - w - 8, yt], [x + w + 8, yt], [x + w + 8, yt + 8], [x + w + 2, yt + 16], [x - w - 2, yt + 16], [x - w - 8, yt + 8]]);
  const base = poly([[x - w - 2, yb - 14], [x + w + 2, yb - 14], [x + w + 8, yb - 6], [x + w + 8, yb], [x - w - 8, yb], [x - w - 8, yb - 6]]);
  let fl = ''; for (let k = -0.5; k <= 0.5; k += 0.5) fl += `M${n1(x + k * w)} ${yt + 20}V${yb - 18}`;
  const sh = (lx) => p(`M${n1(lx)} ${yt - 10}H${x + w + 20}V${yb + 10}H${n1(lx)}Z`, c.sh);
  let g = D.part(shaft, c.b, [sh(x + w * 0.35), p(`M${x - w} ${yt}h${n1(w * 0.4)}V${yb}h${n1(-w * 0.4)}Z`, c.l), s(fl, c.dp || c.sh, 1.6), o.crack ? s(`M${x - w * 0.3} ${n1(yt + (yb - yt) * 0.4)}l8 14l-5 12l7 10`, c.dp || c.sh, 1.6) : ''], 2, c.o);
  g += D.part(capT, c.b, [sh(x + w * 0.5), p(`M${x - w - 8} ${yt}H${x + w + 8}v3H${x - w - 8}Z`, c.l)], 2, c.o);
  g += D.part(base, c.b, [sh(x + w * 0.5), p(`M${x - w - 8} ${yb - 6}H${x + w + 8}v3H${x - w - 8}Z`, c.l)], 2, c.o);
  return g;
}
// bannière suspendue (bas fendu en V), emblème doré
function banner(D, x, y, w, h, col, o = {}) {
  const c = tones(col);
  const d = poly([[x - w, y], [x + w, y], [x + w, y + h], [x, y + h - w * 0.7], [x - w, y + h]]);
  let g = D.part(d, c.b, [p(poly([[x + w * 0.35, y], [x + w + 2, y], [x + w + 2, y + h + 2], [x + w * 0.35, y + h - w * 0.3]]), c.sh), p(poly([[x - w, y], [x - w * 0.6, y], [x - w * 0.6, y + h - w * 0.25], [x - w, y + h]]), c.l),
    p(poly([[x - w, y + 6], [x + w, y + 6], [x + w, y + 10], [x - w, y + 10]]), '#f7bc2a'), p(poly([[x - w, y + h - 14], [x, y + h - w * 0.7 - 12], [x + w, y + h - 14], [x + w, y + h - 10], [x, y + h - w * 0.7 - 8], [x - w, y + h - 10]]), '#f7bc2a')], 1.8, c.o);
  const em = o.emblem ?? 'circle', ey = y + h * 0.42, r = w * 0.45;
  if (em === 'circle') g += `<circle cx="${x}" cy="${n1(ey)}" r="${n1(r)}" fill="#f7bc2a" stroke="${c.o}" stroke-width="1.6"/><circle cx="${n1(x - r * 0.3)}" cy="${n1(ey - r * 0.3)}" r="${n1(r * 0.3)}" fill="#fff7c4"/>`;
  else if (em === 'star') { let st = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r * 1.05; st += `${i ? 'L' : 'M'}${n1(x + Math.cos(a) * rr)} ${n1(ey + Math.sin(a) * rr)}`; } g += p(st + 'Z', '#ffe168', ` stroke="${c.o}" stroke-width="1.5"`); }
  else if (em === 'skull') g += `<circle cx="${x}" cy="${n1(ey)}" r="${n1(r)}" fill="#f3ecd8" stroke="${c.o}" stroke-width="1.5"/><circle cx="${n1(x - r * 0.38)}" cy="${n1(ey)}" r="${n1(r * 0.25)}" fill="${c.o}"/><circle cx="${n1(x + r * 0.38)}" cy="${n1(ey)}" r="${n1(r * 0.25)}" fill="${c.o}"/>`;
  // barre et pommeaux dorés
  g += p(poly([[x - w - 6, y - 4], [x + w + 6, y - 4], [x + w + 6, y + 2], [x - w - 6, y + 2]]), '#9a6234', ` stroke="${c.o}" stroke-width="1.5"`);
  g += `<circle cx="${x - w - 7}" cy="${y - 1}" r="3.6" fill="#f7bc2a" stroke="${c.o}" stroke-width="1.4"/><circle cx="${x + w + 7}" cy="${y - 1}" r="3.6" fill="#f7bc2a" stroke="${c.o}" stroke-width="1.4"/>`;
  return g;
}
// torche murale : support + flamme + halo
function torch(D, plan, x, y, o = {}) {
  D.glow(plan, x, y - 10, o.glow ?? 48, o.glowCol ?? '#ffb347', 0.6);
  const oc = o.oc ?? '#2b1810';
  let g = p(poly([[x - 5, y], [x + 5, y], [x + 3, y + 18], [x - 3, y + 18]]), '#6b3d1f', ` stroke="${oc}" stroke-width="1.6"`);
  g += p(poly([[x - 7, y - 3], [x + 7, y - 3], [x + 6, y + 2], [x - 6, y + 2]]), '#c3cce0', ` stroke="${oc}" stroke-width="1.5"`);
  const fl = (k, c) => p(`M${x} ${n1(y - 26 * k - 2)}C${n1(x + 3 * k)} ${n1(y - 16 * k)} ${n1(x + 9 * k)} ${n1(y - 12 * k)} ${n1(x + 7 * k)} ${n1(y - 5 * k)}C${n1(x + 5 * k)} ${y - 1} ${n1(x - 5 * k)} ${y - 1} ${n1(x - 7 * k)} ${n1(y - 5 * k)}C${n1(x - 9 * k)} ${n1(y - 12 * k)} ${n1(x - 2 * k)} ${n1(y - 14 * k)} ${x} ${n1(y - 26 * k - 2)}Z`, c);
  g += fl(1, o.f1 ?? '#ff5a1f') + fl(0.72, o.f2 ?? '#ffb02e') + fl(0.42, o.f3 ?? '#fff3a0');
  D.add(plan, g);
}
// pierre tombale arrondie (avec croix gravée) ou croix
function tomb(D, x, yb, w, h, c, o = {}) {
  if (o.cross) {
    const t = w * 0.32, ay = yb - h * 0.72;
    const d = poly([[x - t, yb], [x - t, ay + t], [x - w, ay + t], [x - w, ay - t], [x - t, ay - t], [x - t, yb - h], [x + t, yb - h], [x + t, ay - t], [x + w, ay - t], [x + w, ay + t], [x + t, ay + t], [x + t, yb]]);
    return `<g transform="rotate(${o.tilt || 0} ${x} ${yb})">` + D.part(d, c.b, [p(`M${x + t * 0.1} ${yb - h - 5}H${x + w + 5}V${yb + 5}H${x + t * 0.1}Z`, c.sh), p(`M${x - w} ${n1(ay - t)}H${x + w}v3H${x - w}Z`, c.l)], 1.8, c.o) + '</g>';
  }
  const d = `M${x - w} ${yb}L${x - w} ${yb - h + w}A${w} ${w} 0 0 1 ${x + w} ${yb - h + w}L${x + w} ${yb}Z`;
  const engr = `M${x} ${n1(yb - h + w * 0.55)}v${n1(h * 0.42)}M${n1(x - w * 0.35)} ${n1(yb - h + w * 0.95)}h${n1(w * 0.7)}`;
  const g = D.part(d, c.b, [p(`M${n1(x + w * 0.4)} ${yb - h - 5}H${x + w + 5}V${yb + 5}H${n1(x + w * 0.4)}Z`, c.sh), p(`M${x - w} ${yb - h}h${n1(w * 0.35)}V${yb}h${n1(-w * 0.35)}Z`, c.l), s(engr, c.dp || c.sh, 2.6),
    o.moss ? p(`M${x - w - 2} ${yb + 2}q2 -10 10 -8q4 -8 12 -2q4 -2 6 4l0 8Z`, o.moss) : ''], 1.8, c.o);
  return `<g transform="rotate(${o.tilt || 0} ${x} ${yb})">${g}</g>`;
}
// petit nuage (pour le plan lointain)
function cloud(D, x, y, w, seed, c) {
  return foliage(D, puff(x, y, w, w * 0.32, 7, seed, { k: 0.62, flat: true, jr: 0.06 }), { b: c.b, sh: c.sh }, { sh: [3, 4], sw: 0, lk: 0 });
}

module.exports = { n0, n1, mix, tones, hazed, rng, p, s, poly, lerp, Doc, puff, scallop, hillRow, foliage, mountains, rock, spike, crystal, crystals, pine, capsule, branchy, deadTree, tuft, tufts, fringe, pebbles, flowers, ground, lip, wall, pillar, banner, torch, tomb, cloud };
