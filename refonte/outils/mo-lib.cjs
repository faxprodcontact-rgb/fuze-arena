// Outils communs aux monstres (Roi Gluant mg-, Loup ml-, Démon md-).
// Même recette que tools/gu-build.cjs : pièce = clipPath (forme) + aplat + ombres/reflets découpés + contour 3,
// et « doublure » (mêmes formes en trait 7) sous chaque groupe pour le contour extérieur épais.
const fs = require('fs');
module.exports = function lib(prefix) {
  const O = '#1b1530', W = '#ffffff';
  const usedIds = new Set();
  const defs = [];
  // boîte englobante approximative : paires de nombres (tracés en M/L/C/Q/S absolus seulement)
  function bbox(d) {
    const n = d.match(/-?\d*\.?\d+/g).map(Number);
    const xs = [], ys = [];
    for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
    const x = Math.min(...xs) - 2, y = Math.min(...ys) - 2;
    return [x, y, Math.max(...xs) - x + 2, Math.max(...ys) - y + 2].map(v => +v.toFixed(1));
  }
  const slug = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function uid(name) { let id = prefix + '-' + slug(name); while (usedIds.has(id)) id += '-b'; usedIds.add(id); return id; }
  // pièce : nom, tracé, remplissage, [ombres/reflets], épaisseur contour
  // outline : tracé du contour s'il ne doit couvrir qu'une partie de la forme (muscle qui se fond dans le corps)
  function part(name, d, fill, shades = [], sw = 3, oc = O, outline = d) {
    const id = uid(name);
    defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
    const [x, y, w, h] = bbox(d);
    return `<!-- ${name} -->\n<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${shades.join('')}</g>` + (sw ? `\n<path d="${outline}" fill="none" stroke="${oc}" stroke-width="${sw}"/>` : '');
  }
  // clip supplémentaire (zone d'ombre d'un galon, iris dans le blanc de l'oeil…)
  function clip(name, d) { const id = uid(name); defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return `url(#${id})`; }
  function grad(xml) { for (const m of xml.matchAll(/id="([^"]+)"/g)) usedIds.add(m[1]); defs.push(xml); }
  const back = (ds, w = 7) => `<g fill="${O}" stroke="${O}" stroke-width="${w}">${ds.map(d => `<path d="${d}"/>`).join('')}</g>`;
  const p = (d, f, extra = '') => `<path d="${d}" fill="${f}"${extra}/>`;
  const s = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
  const r1 = v => +v.toFixed(1);
  // étoile à 4 branches (forme de l'étincelle du guide)
  const starD = (x, y, r) => { const k = r * 0.3; return `M${r1(x)} ${r1(y - r)}L${r1(x + k)} ${r1(y - k)}L${r1(x + r)} ${r1(y)}L${r1(x + k)} ${r1(y + k)}L${r1(x)} ${r1(y + r)}L${r1(x - k)} ${r1(y + k)}L${r1(x - r)} ${r1(y)}L${r1(x - k)} ${r1(y - k)}Z`; };
  const spark = (x, y, r, f = W) => `<path d="${starD(x, y, r)}" fill="${f}"/>`;
  const gem = (x, y, r, f, sw = 1.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${O}" stroke-width="${sw}"/><circle cx="${r1(x - r * 0.32)}" cy="${r1(y - r * 0.36)}" r="${r1(Math.max(0.9, r * 0.32))}" fill="${W}"/>`;
  // écrit le fichier et vérifie les règles (taille, éléments interdits, préfixe des id)
  function write(out, svgHead, body) {
    const svg = svgHead.replace('@@DEFS@@', () => defs.join('\n')) + body;
    const bad = [];
    if (/<style|<script|<animate|<image|<text|<foreignObject|<filter|<use|class=|@keyframes|href=/.test(svg)) bad.push('élément interdit');
    const ids = [...svg.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
    for (const id of ids) if (!id.startsWith(prefix + '-')) bad.push('id sans préfixe : ' + id);
    if (new Set(ids).size !== ids.length) bad.push('id en double');
    for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) if (!svg.includes(`id="${m[1]}"`)) bad.push('référence manquante : ' + m[1]);
    fs.writeFileSync(out, svg);
    const ko = Buffer.byteLength(svg) / 1024;
    if (ko >= 45) bad.push('trop gros');
    console.log('écrit', out, ko.toFixed(1) + ' Ko', bad.length ? 'PROBLÈMES : ' + bad.join(', ') : 'OK');
  }
  return { O, W, part, clip, grad, back, p, s, r1, starD, spark, gem, write, bbox };
};
