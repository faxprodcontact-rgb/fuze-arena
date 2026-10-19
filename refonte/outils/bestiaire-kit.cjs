// Atelier des monstres (refonte) : petites briques pour dessiner dans le style du guide (art/STYLE.md).
// Contour #1b1530, « doublure » épaisse sous tout le monstre, pièces = aplat + ombres franches découpées
// (lumière en haut à gauche) + contour 3. Les monstres regardent vers la DROITE, sol à y = 226, viewBox 240 × 240.
const fs = require('fs');
const O = '#1b1530', W = '#ffffff';
const r1 = (v) => +(+v).toFixed(1);

// --- couleurs : 4 tons (clair, base, ombre, profonde) à partir d'une base
function mix(hex, t, to) {
  const n = parseInt(hex.slice(1), 16), m = parseInt(to.slice(1), 16);
  const c = [16, 8, 0].map(s => (n >> s) & 255), d = [16, 8, 0].map(s => (m >> s) & 255);
  return '#' + c.map((v, i) => Math.round(v + (d[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const tones = (base, k = 1) => ({ L: mix(base, 0.32 * k, '#ffffff'), B: base, S: mix(base, 0.28 * k, '#1b1530'), D: mix(base, 0.5 * k, '#1b1530') });

// --- formes { d, box }
function bboxOf(d) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number), xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  const x = Math.min(...xs), y = Math.min(...ys);
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
}
const E = (cx, cy, rx, ry = rx) => ({
  d: `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx + rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx - rx)} ${r1(cy)}Z`,
  box: [cx - rx, cy - ry, 2 * rx, 2 * ry],
});
const P = (d) => ({ d, box: bboxOf(d) });   // tracé en M / L / C / Q absolus
// capsule effilée de (x1,y1) à (x2,y2), demi-largeurs w1 → w2 (bouts arrondis)
function CAP(x1, y1, x2, y2, w1, w2 = w1) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const a = [x1 + nx * w1, y1 + ny * w1], b = [x2 + nx * w2, y2 + ny * w2], c = [x2 - nx * w2, y2 - ny * w2], e = [x1 - nx * w1, y1 - ny * w1];
  const d = `M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}A${r1(w2)} ${r1(w2)} 0 0 0 ${r1(c[0])} ${r1(c[1])}L${r1(e[0])} ${r1(e[1])}A${r1(w1)} ${r1(w1)} 0 0 0 ${r1(a[0])} ${r1(a[1])}Z`;
  const m = Math.max(w1, w2);
  return { d, box: [Math.min(x1, x2) - m, Math.min(y1, y2) - m, Math.abs(dx) + 2 * m, Math.abs(dy) + 2 * m] };
}

function creature(prefix) {
  const defs = [], back = [], front = [];
  let n = 0;
  const uid = (s) => `${prefix}-${s}${++n}`;
  // pièce ombrée : aplat + reflet haut-gauche + ombre bas-droite + ombre profonde, découpés dans la forme, puis contour
  function piece(sh, t, { sw = 3, light = true, shade = 1, gloss = false, back: inBack = true, extra = '' } = {}) {
    const id = uid('p');
    defs.push(`<clipPath id="${id}"><path d="${sh.d}"/></clipPath>`);
    const [x, y, w, h] = sh.box;
    let g = `<g clip-path="url(#${id})"><rect x="${r1(x - 2)}" y="${r1(y - 2)}" width="${r1(w + 4)}" height="${r1(h + 4)}" fill="${t.B}"/>`;
    if (light) g += `<ellipse cx="${r1(x + w * 0.3)}" cy="${r1(y + h * 0.2)}" rx="${r1(w * 0.34)}" ry="${r1(h * 0.24)}" fill="${t.L}"/>`;
    if (shade) {
      g += `<ellipse cx="${r1(x + w * 1.02)}" cy="${r1(y + h * 1.04)}" rx="${r1(w * 0.8 * shade)}" ry="${r1(h * 0.72 * shade)}" fill="${t.S}"/>`;
      g += `<ellipse cx="${r1(x + w * 1.1)}" cy="${r1(y + h * 1.16)}" rx="${r1(w * 0.5 * shade)}" ry="${r1(h * 0.46 * shade)}" fill="${t.D}"/>`;
    }
    if (gloss) g += `<ellipse cx="${r1(x + w * 0.27)}" cy="${r1(y + h * 0.18)}" rx="${r1(Math.max(2, w * 0.09))}" ry="${r1(Math.max(1.4, h * 0.05))}" fill="${W}" opacity="0.85"/>`;
    g += extra + `</g>`;
    if (sw) g += `<path d="${sh.d}" fill="none" stroke="${O}" stroke-width="${sw}"/>`;
    if (inBack) back.push(sh.d);
    front.push(g);
  }
  const flat = (sh, fill, sw = 0, op = 1) => front.push(`<path d="${sh.d}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}${sw ? ` stroke="${O}" stroke-width="${sw}"` : ''}/>`);
  const line = (d, c = O, w = 2.5, op = 1) => front.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${op < 1 ? ` opacity="${op}"` : ''}/>`);
  const raw = (xml) => front.push(xml);
  function grad(stops, vertical = true) {
    const id = uid('g');
    defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`);
    return `url(#${id})`;
  }
  function glow(cx, cy, r, color, op = 0.55) {
    const id = uid('h');
    defs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
    front.push(`<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="url(#${id})"/>`);
  }
  // œil de dessin animé : blanc, iris en dégradé (sombre en haut, clair en bas), pupille, 2 reflets
  function eye(cx, cy, rx, ry, iris = ['#3b0d12', '#d4462a', '#ffc07a'], { look = 0.25, pupil = 0.45, sclera = W } = {}) {
    piece(E(cx, cy, rx, ry), { L: sclera, B: sclera, S: '#e4e2f0', D: '#d0cde2' }, { sw: 2.5, light: false, shade: 0.5, back: false });
    const ir = Math.min(rx, ry) * 0.72, ix = cx + rx * look, iy = cy + ry * 0.12;
    const g = grad([[0, iris[0]], [0.55, iris[1]], [1, iris[2]]]);
    raw(`<circle cx="${r1(ix)}" cy="${r1(iy)}" r="${r1(ir)}" fill="${g}" stroke="${O}" stroke-width="1.6"/>`);
    raw(`<circle cx="${r1(ix)}" cy="${r1(iy)}" r="${r1(ir * pupil)}" fill="${O}"/>`);
    raw(`<circle cx="${r1(ix - ir * 0.38)}" cy="${r1(iy - ir * 0.4)}" r="${r1(ir * 0.34)}" fill="${W}"/>`);
    raw(`<circle cx="${r1(ix + ir * 0.4)}" cy="${r1(iy + ir * 0.38)}" r="${r1(ir * 0.15)}" fill="${W}"/>`);
  }
  // œil qui brille (squelette, golem, momie…) : fente lumineuse avec halo
  function glowEye(cx, cy, rx, ry, color, core = '#ffffff') {
    glow(cx, cy, Math.max(rx, ry) * 2.4, color, 0.6);
    raw(`<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${color}"/>`);
    raw(`<ellipse cx="${r1(cx - rx * 0.2)}" cy="${r1(cy - ry * 0.15)}" rx="${r1(rx * 0.45)}" ry="${r1(ry * 0.45)}" fill="${core}"/>`);
  }
  const brow = (x1, y1, x2, y2, c = O, w = 5) => line(`M${r1(x1)} ${r1(y1)}Q${r1((x1 + x2) / 2)} ${r1(Math.min(y1, y2) - 3)} ${r1(x2)} ${r1(y2)}`, c, w);
  // bouche ouverte avec crocs
  function mouth(x, y, w, h, { teeth = 3, fangs = true, tongue = true } = {}) {
    const d = `M${r1(x)} ${r1(y)}Q${r1(x + w / 2)} ${r1(y - h * 0.18)} ${r1(x + w)} ${r1(y)}Q${r1(x + w * 0.62)} ${r1(y + h)} ${r1(x + w * 0.3)} ${r1(y + h * 0.8)}Q${r1(x - w * 0.05)} ${r1(y + h * 0.5)} ${r1(x)} ${r1(y)}Z`;
    const id = uid('m');
    defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
    let g = `<g clip-path="url(#${id})"><rect x="${r1(x - 2)}" y="${r1(y - h)}" width="${r1(w + 4)}" height="${r1(h * 2.2)}" fill="#7a2433"/>`;
    if (tongue) g += `<ellipse cx="${r1(x + w * 0.5)}" cy="${r1(y + h * 0.95)}" rx="${r1(w * 0.3)}" ry="${r1(h * 0.35)}" fill="#e8706e"/>`;
    for (let i = 0; i < teeth; i++) {
      const tx = x + w * (0.12 + (i + 0.5) * (0.76 / teeth)), tw = w * 0.1;
      g += `<path d="M${r1(tx - tw)} ${r1(y - 2)}L${r1(tx + tw)} ${r1(y - 2)}L${r1(tx)} ${r1(y + h * 0.28)}Z" fill="${W}"/>`;
    }
    if (fangs) for (const fx of [x + w * 0.16, x + w * 0.8]) g += `<path d="M${r1(fx - w * 0.08)} ${r1(y - 2)}L${r1(fx + w * 0.08)} ${r1(y - 2)}L${r1(fx)} ${r1(y + h * 0.5)}Z" fill="${W}"/>`;
    g += `</g><path d="${d}" fill="none" stroke="${O}" stroke-width="2.6"/>`;
    raw(g);
  }
  const spark = (x, y, r, f = W) => { const k = r * 0.3; raw(`<path d="M${r1(x)} ${r1(y - r)}L${r1(x + k)} ${r1(y - k)}L${r1(x + r)} ${r1(y)}L${r1(x + k)} ${r1(y + k)}L${r1(x)} ${r1(y + r)}L${r1(x - k)} ${r1(y + k)}L${r1(x - r)} ${r1(y)}L${r1(x - k)} ${r1(y - k)}Z" fill="${f}"/>`); };
  // écrit le SVG : doublure (silhouette épaisse) sous toutes les pièces
  function write(file, title) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">\n<!-- Fuze Arena : ${title} (préfixe ${prefix}-), regarde vers la droite -->\n<defs>${defs.join('')}</defs>\n<g stroke-linejoin="round" stroke-linecap="round">\n<g fill="${O}" stroke="${O}" stroke-width="7">${back.map(d => `<path d="${d}"/>`).join('')}</g>\n${front.join('\n')}\n</g>\n</svg>\n`;
    fs.writeFileSync(file, svg);
    return Buffer.byteLength(svg);
  }
  return { piece, flat, line, raw, grad, glow, eye, glowEye, brow, mouth, spark, write };
}

module.exports = { O, W, r1, mix, tones, E, P, CAP, creature };
