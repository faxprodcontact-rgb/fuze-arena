// Planche « Les monstres » (préfixe mp-) : assemble project/Monstres.dc.html + previews/monstres-apercu.html
// node tools/mp-build.cjs
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');
const INK = '#1b1530';
const f2 = n => +(+n).toFixed(2);
const art = f => fs.readFileSync(path.join(R, 'art', f), 'utf8').trim();

// ---------- SVG d'art collés en ligne (une seule copie de chaque : ids inchangés) ----------
function svgArt(file, style) {
  return art(file).replace(/^<svg[^>]*>/, m => {
    const v = m.match(/viewBox="([^"]*)"/)[1];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v}" aria-hidden="true" focusable="false" style="${style}">`;
  });
}
const svg = (vb, content, style = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true" focusable="false" style="display:block;${style}">${content}</svg>`;

// ---------- texte contouré ----------
function ring(r, c, n = 16, dy = 0) {
  const a = [];
  for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI; a.push(`${f2(r * Math.cos(t))}px ${f2(r * Math.sin(t) + dy)}px 0 ${c}`); }
  return a.join(',');
}
const outlined = (r, drop) => `text-shadow:${ring(r, INK)},${ring(r, INK, 12, drop)}`;
const LIL = "font-family:'Lilita One',sans-serif;font-weight:400";
const NUN = "font-family:'Nunito',sans-serif";

// ---------- géométrie de la scène ----------
const W = 1100, H = 640;
const HZ = 378;            // pied du mur
const FY = 452;            // sol des monstres
const FYB = 428;           // dessus de l'estrade du boss
const COLS = [{ x: 40, w: 290 }, { x: 354, w: 310 }, { x: 688, w: 376 }];
const CX = COLS.map(c => c.x + c.w / 2);   // 185, 509, 876
const MON = {
  gluant: { file: 'monstre-gluant.svg', vb: [240, 240], g: [122, 229], s: 0.92, cx: CX[0], feet: FY },
  loup:   { file: 'monstre-loup.svg',   vb: [260, 220], g: [141.5, 211], s: 1.06, cx: CX[1], feet: FY },
  demon:  { file: 'monstre-demon.svg',  vb: [320, 340], g: [156, 331], s: 1.12, cx: CX[2], feet: FYB },
};
function monster(k) {
  const m = MON[k];
  const left = m.cx - m.g[0] * m.s, top = m.feet - m.g[1] * m.s;
  return svgArt(m.file, `position:absolute;left:${f2(left)}px;top:${f2(top)}px;width:${f2(m.vb[0] * m.s)}px;height:${f2(m.vb[1] * m.s)}px;overflow:visible;display:block`);
}

// petit générateur pseudo-aléatoire stable
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// =====================================================================
//  DÉCOR (arrière-plan) 1100 x 640
// =====================================================================
function decor() {
  const P = 'mp-';
  let defs = '', d = '';
  const lin = (id, stops, a = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${P}${id}" ${a}>${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`;
  const rad = (id, stops, a = '') => `<radialGradient id="${P}${id}" ${a}>${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
  defs += lin('mur', [[0, '#0a0720'], [0.5, '#151042'], [1, '#211a5a']]);
  defs += lin('sol', [[0, '#2a2166'], [0.3, '#1d1650'], [1, '#100b2c']]);
  defs += rad('portail', [[0, '#fff6cc'], [0.16, '#ffc65a'], [0.38, '#ff6a2c'], [0.62, '#b8162f'], [0.85, '#5a0a22'], [1, '#2a0514']], 'cx="0.5" cy="0.6" r="0.62"');
  defs += rad('l-feu', [[0, '#fff3b0', 0.85], [0.4, '#ffb43a', 0.45], [1, '#ff7a1a', 0]]);
  defs += rad('l-portail', [[0, '#ffb46a', 0.7], [0.45, '#ff5a2a', 0.32], [1, '#d8203a', 0]]);
  defs += rad('l-verte', [[0, '#e6ffb8', 0.75], [0.42, '#7ef04a', 0.38], [1, '#4cd964', 0]]);
  defs += rad('l-bleue', [[0, '#eefcff', 0.75], [0.42, '#86d6ff', 0.36], [1, '#5aa8ff', 0]]);
  defs += rad('l-rouge', [[0, '#ffd27a', 0.8], [0.4, '#ff5a2a', 0.42], [1, '#d8203a', 0]]);
  defs += rad('flamme', [[0, '#fffbe0'], [0.35, '#ffe168'], [0.75, '#ff9a2a'], [1, '#e3402a']], 'cx="0.45" cy="0.72" r="0.75"');
  defs += rad('nuit', [[0, '#3f78d8'], [0.6, '#22389a'], [1, '#121a52']], 'cx="0.38" cy="0.35" r="0.8"');
  defs += lin('rayon', [[0, '#dff6ff', 0.42], [0.55, '#9fd8ff', 0.16], [1, '#9fd8ff', 0]], 'gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="470"');
  defs += lin('brume', [[0, '#6c5ad0', 0], [0.5, '#6c5ad0', 0.26], [1, '#6c5ad0', 0]]);
  defs += lin('bas', [[0, '#0a0720', 0], [1, '#0a0720', 0.8]]);
  defs += rad('vignette', [[0.5, '#06041a', 0], [1, '#06041a', 0.82]], 'cx="0.5" cy="0.5" r="0.75"');
  defs += lin('gold', [[0, '#fff7c4'], [0.45, '#f7bc2a'], [1, '#d98a16']]);
  defs += lin('niche', [[0, '#071a1c'], [1, '#0d2f22']]);

  // ---------- mur de pierres ----------
  d += `<rect x="0" y="0" width="${W}" height="${HZ}" fill="url(#${P}mur)"/>`;
  const BW = 66, BH = 30;
  const byTone = { '#1b154c': '', '#1f1856': '', '#181244': '', '#221b5e': '' };
  let hl = '', sh = '';
  for (let r = 0; r * BH < HZ; r++) {
    const y = r * BH, off = r % 2 ? BW / 2 : 0;
    for (let x = -off; x < W; x += BW) {
      const t = ['#1b154c', '#1f1856', '#181244', '#221b5e'][Math.floor(rnd() * 4)];
      byTone[t] += `M${x + 2} ${y + 2}h${BW - 4}v${BH - 4}h-${BW - 4}Z`;
      hl += `M${x + 4} ${y + 4}H${x + BW - 10}`;
      sh += `M${x + 8} ${y + BH - 3.5}H${x + BW - 3}`;
    }
  }
  for (const [t, p] of Object.entries(byTone)) d += `<path d="${p}" fill="${t}"/>`;
  d += `<path d="${hl}" fill="none" stroke="#2f2678" stroke-width="2"/>`;
  d += `<path d="${sh}" fill="none" stroke="#0d0926" stroke-width="2"/>`;
  // fissures
  d += `<path d="M262 64l10 14-6 12 12 16M612 40l-8 16 10 10-4 18M1050 230l-12 10 4 16-10 12M210 300l12 8 2 14" fill="none" stroke="#0b0820" stroke-width="2.5"/>`;

  // ---------- zone 1 : niche du Roi Gluant (égout, lueur verte) ----------
  const nx = CX[0] + 4;
  const outer = `M${nx - 128} ${HZ}V292C${nx - 128} 222 ${nx - 70} 176 ${nx} 176C${nx + 70} 176 ${nx + 128} 222 ${nx + 128} 292V${HZ}Z`;
  const inner = `M${nx - 104} ${HZ}V296C${nx - 104} 238 ${nx - 58} 200 ${nx} 200C${nx + 58} 200 ${nx + 104} 238 ${nx + 104} 296V${HZ}Z`;
  defs += `<clipPath id="${P}niche-in"><path d="${inner}"/></clipPath><clipPath id="${P}niche-cadre"><path d="${outer}"/></clipPath>`;
  d += `<path d="${outer}" fill="${INK}" stroke="${INK}" stroke-width="7"/>`;
  d += `<g clip-path="url(#${P}niche-cadre)"><rect x="${nx - 130}" y="174" width="260" height="${HZ - 174}" fill="#2b2366"/>`;
  // claveaux : séparations radiales
  let vous = '';
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (1 - i / 10);
    const cx0 = nx, cy0 = 292;
    vous += `M${f2(cx0 + Math.cos(a) * 104)} ${f2(cy0 - Math.sin(a) * 104 * 0.93)}L${f2(cx0 + Math.cos(a) * 132)} ${f2(cy0 - Math.sin(a) * 132 * 0.9)}`;
  }
  d += `<path d="M${nx - 128} 292C${nx - 128} 222 ${nx - 70} 176 ${nx} 176L${nx} 190C${nx - 60} 192 ${nx - 112} 232 ${nx - 114} 296V${HZ}H${nx - 128}Z" fill="#3b3190"/>`;
  d += `<path d="M${nx + 128} 292C${nx + 128} 240 ${nx + 100} 200 ${nx + 60} 186L${nx + 54} 200C${nx + 84} 214 ${nx + 104} 250 ${nx + 104} 296V${HZ}H${nx + 128}Z" fill="#1d174c"/>`;
  d += `<path d="${vous}M${nx - 128} 336H${nx - 104}M${nx + 104} 336H${nx + 128}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
  d += `<path d="M${nx - 122} 290C${nx - 120} 228 ${nx - 66} 184 ${nx - 6} 182" fill="none" stroke="#5446b8" stroke-width="2.2"/>`;
  d += `</g><path d="${outer}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  // intérieur sombre + lueur verte qui monte de l'égout
  d += `<g clip-path="url(#${P}niche-in)"><rect x="${nx - 106}" y="198" width="212" height="${HZ - 198}" fill="url(#${P}niche)"/>`;
  d += `<ellipse cx="${nx}" cy="${HZ + 6}" rx="150" ry="120" fill="url(#${P}l-verte)"/>`;
  // grille (barreaux) dont un tordu
  let bars = '';
  for (const bx of [-78, -52, -26, 26, 52, 78]) bars += `M${nx + bx} 214V${HZ}`;
  bars += `M${nx} 200V250C${nx - 4} 270 ${nx + 14} 286 ${nx + 6} 310`;
  d += `<path d="${bars}M${nx - 104} 254H${nx + 104}" fill="none" stroke="${INK}" stroke-width="8"/>`;
  d += `<path d="${bars}M${nx - 104} 254H${nx + 104}" fill="none" stroke="#4c4a72" stroke-width="4"/>`;
  d += `<path d="${bars.replace(/M(\S+) (\S+)/g, (m, x, y) => `M${f2(+x - 1)} ${y}`)}" fill="none" stroke="#8a87b0" stroke-width="1.2"/>`;
  d += `</g><path d="${inner}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  // coulures de gelée sur l'arche
  const drip = (x, y, len, w) => `M${x - w} ${y}C${x - w} ${y + len * 0.5} ${x - w * 0.7} ${y + len * 0.8} ${x - w * 0.9} ${y + len}C${x - w * 0.9} ${y + len + w * 1.6} ${x + w * 0.9} ${y + len + w * 1.6} ${x + w * 0.9} ${y + len}C${x + w * 0.7} ${y + len * 0.8} ${x + w} ${y + len * 0.5} ${x + w} ${y}Z`;
  const drips = [drip(nx - 66, 196, 34, 5), drip(nx - 30, 182, 52, 6), drip(nx + 22, 180, 26, 4.5), drip(nx + 74, 196, 44, 5.5)];
  const ridge = `M${nx - 88} 214C${nx - 60} 188 ${nx - 20} 176 ${nx + 10} 177C${nx + 50} 178 ${nx + 84} 196 ${nx + 96} 214C${nx + 70} 204 ${nx + 40} 196 ${nx + 2} 194C${nx - 36} 194 ${nx - 66} 202 ${nx - 88} 214Z`;
  d += `<g fill="${INK}" stroke="${INK}" stroke-width="6">${drips.map(p => `<path d="${p}"/>`).join('')}<path d="${ridge}"/></g>`;
  d += `<g fill="#4cc84a">${drips.map(p => `<path d="${p}"/>`).join('')}<path d="${ridge}"/></g>`;
  d += `<path d="M${nx - 80} 207C${nx - 50} 186 ${nx - 10} 180 ${nx + 20} 182" fill="none" stroke="#b6f28a" stroke-width="2.4"/>`;
  d += `<path d="M${nx - 31} 196V222M${nx + 73} 206V226M${nx - 67} 204V218" fill="none" stroke="#a8ef74" stroke-width="2"/>`;

  // ---------- zone 2 : fenêtre à la lune (Loup des bois) ----------
  const wx = CX[1] + 28, wy = 150, wr = 46;
  d += `<circle cx="${wx}" cy="${wy}" r="${wr + 14}" fill="${INK}"/>`;
  d += `<circle cx="${wx}" cy="${wy}" r="${wr + 11}" fill="#2e2672"/>`;
  d += `<path d="M${wx - wr - 9} ${wy}A${wr + 9} ${wr + 9} 0 0 1 ${wx} ${wy - wr - 9}L${wx} ${wy - wr - 3}A${wr + 3} ${wr + 3} 0 0 0 ${wx - wr - 3} ${wy}Z" fill="#4337a0"/>`;
  let wv = '';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.26; wv += `M${f2(wx + Math.cos(a) * (wr + 2))} ${f2(wy + Math.sin(a) * (wr + 2))}L${f2(wx + Math.cos(a) * (wr + 12))} ${f2(wy + Math.sin(a) * (wr + 12))}`; }
  d += `<path d="${wv}" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
  d += `<circle cx="${wx}" cy="${wy}" r="${wr + 14}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  defs += `<clipPath id="${P}vitre"><circle cx="${wx}" cy="${wy}" r="${wr}"/></clipPath>`;
  d += `<g clip-path="url(#${P}vitre)"><rect x="${wx - wr}" y="${wy - wr}" width="${wr * 2}" height="${wr * 2}" fill="url(#${P}nuit)"/>`;
  d += `<circle cx="${wx - 10}" cy="${wy - 8}" r="24" fill="#f4fbff"/><path d="M${wx - 34} ${wy - 8}A24 24 0 0 0 ${wx + 14} ${wy - 8}C${wx + 4} ${wy + 6} ${wx - 22} ${wy + 8} ${wx - 34} ${wy - 8}Z" fill="#cfe3f7"/>`;
  d += `<circle cx="${wx - 2}" cy="${wy - 16}" r="4" fill="#d9e9f8"/><circle cx="${wx - 20}" cy="${wy - 2}" r="2.6" fill="#d9e9f8"/><circle cx="${wx + 4}" cy="${wy + 2}" r="2" fill="#d9e9f8"/>`;
  d += `<path d="M${wx + 30} ${wy - 26}l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z M${wx + 20} ${wy + 22}l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1Z" fill="#ffffff"/>`;
  // silhouette de sapins
  d += `<path d="M${wx - wr} ${wy + 46}L${wx - 40} ${wy + 18}L${wx - 34} ${wy + 26}L${wx - 26} ${wy + 6}L${wx - 18} ${wy + 24}L${wx - 6} ${wy + 30}L${wx + 8} ${wy + 12}L${wx + 18} ${wy + 26}L${wx + 30} ${wy + 4}L${wx + 42} ${wy + 24}L${wx + wr} ${wy + 46}Z" fill="#0d1440"/>`;
  d += `</g>`;
  d += `<path d="M${wx} ${wy - wr}V${wy + wr}M${wx - wr} ${wy}H${wx + wr}" fill="none" stroke="${INK}" stroke-width="7"/><path d="M${wx} ${wy - wr}V${wy + wr}M${wx - wr} ${wy}H${wx + wr}" fill="none" stroke="#56547c" stroke-width="3.2"/>`;
  d += `<circle cx="${wx}" cy="${wy}" r="${wr}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  // lierre autour de la fenêtre
  const leaf = (x, y, a, s = 1) => `<path transform="translate(${x} ${y}) rotate(${a}) scale(${s})" d="M0 0C4 -7 12 -8 16 -4C12 2 5 4 0 0Z" fill="#3f9a3a" stroke="${INK}" stroke-width="1.8"/>`;
  d += `<path d="M${wx - 58} ${wy - 26}C${wx - 70} ${wy + 10} ${wx - 60} ${wy + 50} ${wx - 74} ${wy + 92}M${wx - 30} ${wy - 56}C${wx - 46} ${wy - 64} ${wx - 60} ${wy - 50} ${wx - 58} ${wy - 26}M${wx + 52} ${wy + 32}C${wx + 66} ${wy + 56} ${wx + 62} ${wy + 80} ${wx + 74} ${wy + 104}" fill="none" stroke="${INK}" stroke-width="5"/>`;
  d += `<path d="M${wx - 58} ${wy - 26}C${wx - 70} ${wy + 10} ${wx - 60} ${wy + 50} ${wx - 74} ${wy + 92}M${wx - 30} ${wy - 56}C${wx - 46} ${wy - 64} ${wx - 60} ${wy - 50} ${wx - 58} ${wy - 26}M${wx + 52} ${wy + 32}C${wx + 66} ${wy + 56} ${wx + 62} ${wy + 80} ${wx + 74} ${wy + 104}" fill="none" stroke="#2f6e33" stroke-width="2.4"/>`;
  d += [[wx - 62, wy - 6, 200], [wx - 64, wy + 24, 150, 1.1], [wx - 66, wy + 58, 200, 0.9], [wx - 70, wy + 84, 140], [wx - 44, wy - 62, 250, 0.9], [wx - 56, wy - 40, 120], [wx + 60, wy + 48, -30], [wx + 64, wy + 74, 40, 1.1], [wx + 70, wy + 98, -20, 0.9]].map(a => leaf(...a)).join('');

  // ---------- zone 3 : portail des abysses (boss) ----------
  const px = CX[2], top = 22;
  const outerP = `M${px - 134} ${HZ}V158C${px - 134} 96 ${px - 74} 46 ${px} ${top}C${px + 74} 46 ${px + 134} 96 ${px + 134} 158V${HZ}Z`;
  const innerP = `M${px - 108} ${HZ}V162C${px - 108} 110 ${px - 60} 70 ${px} ${top + 30}C${px + 60} 70 ${px + 108} 110 ${px + 108} 162V${HZ}Z`;
  defs += `<clipPath id="${P}portail-in"><path d="${innerP}"/></clipPath><clipPath id="${P}portail-cadre"><path d="${outerP}"/></clipPath>`;
  d += `<ellipse cx="${px}" cy="200" rx="260" ry="230" fill="url(#${P}l-portail)"/>`;
  d += `<path d="${outerP}" fill="${INK}" stroke="${INK}" stroke-width="7"/>`;
  d += `<g clip-path="url(#${P}portail-cadre)"><rect x="${px - 136}" y="${top - 2}" width="272" height="${HZ - top + 2}" fill="#2a2058"/>`;
  d += `<path d="M${px - 134} 158C${px - 134} 96 ${px - 74} 46 ${px} ${top}L${px} ${top + 16}C${px - 64} 50 ${px - 118} 100 ${px - 120} 160V${HZ}H${px - 134}Z" fill="#3a2f80"/>`;
  d += `<path d="M${px + 134} 158C${px + 134} 110 ${px + 106} 70 ${px + 60} 44L${px + 52} 58C${px + 90} 82 ${px + 108} 118 ${px + 108} 162V${HZ}H${px + 134}Z" fill="#1b1446"/>`;
  // claveaux
  const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map(i => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };
  let pv = '';
  for (const side of [-1, 1]) {
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      const a = bez([px + side * 108, 162], [px + side * 108, 110], [px + side * 60, 70], [px, top + 30], t);
      const b = bez([px + side * 134, 158], [px + side * 134, 96], [px + side * 74, 46], [px, top], t);
      pv += `M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}`;
    }
    for (const y of [214, 268, 322]) pv += `M${px + side * 108} ${y}H${px + side * 134}`;
  }
  d += `<path d="${pv}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
  d += `</g><path d="${outerP}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  // intérieur : vortex
  d += `<g clip-path="url(#${P}portail-in)"><rect x="${px - 110}" y="${top + 28}" width="220" height="${HZ - top - 28}" fill="url(#${P}portail)"/>`;
  let sw = '';
  for (let i = 0; i < 5; i++) { const r = 30 + i * 26; sw += `M${px - r} ${232 + i * 4}A${r} ${r * 0.8} 0 0 1 ${px + r * 0.6} ${232 - r * 0.6}`; }
  d += `<path d="${sw}" fill="none" stroke="#ffd27a" stroke-width="2.4" opacity="0.45"/>`;
  d += `<path d="M${px - 110} ${HZ}L${px - 86} 330L${px - 70} 352L${px - 44} 318L${px - 24} 346L${px} 312L${px + 26} 344L${px + 48} 320L${px + 70} 350L${px + 90} 326L${px + 110} ${HZ}Z" fill="#3a0716"/>`;
  d += `</g><path d="${innerP}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  d += `<path d="M${px - 104} ${HZ}V162C${px - 104} 112 ${px - 58} 74 ${px - 4} 56" fill="none" stroke="#ff7a4a" stroke-width="2.4"/>`;
  d += `<path d="M${px + 104} ${HZ}V162C${px + 104} 118 ${px + 70} 84 ${px + 30} 64" fill="none" stroke="#ff9a5a" stroke-width="2.4"/>`;
  // clé de voûte : crâne cornu
  const kx = px, ky = top + 8;
  d += `<g transform="translate(${kx} ${ky})">`;
  const hornL = 'M-12 -2C-20 -6 -28 -16 -30 -28C-22 -22 -14 -18 -6 -14Z';
  d += `<g fill="${INK}" stroke="${INK}" stroke-width="6"><path d="${hornL}"/><path d="${hornL}" transform="scale(-1 1)"/><path d="M-15 -4C-15 -16 -8 -22 0 -22C8 -22 15 -16 15 -4C15 3 11 6 9 7V13H-9V7C-11 6 -15 3 -15 -4Z"/></g>`;
  d += `<path d="${hornL}" fill="#efe3c4"/><path d="${hornL}" transform="scale(-1 1)" fill="#c9b892"/>`;
  d += `<path d="M-15 -4C-15 -16 -8 -22 0 -22C8 -22 15 -16 15 -4C15 3 11 6 9 7V13H-9V7C-11 6 -15 3 -15 -4Z" fill="#f4ecd8"/>`;
  d += `<path d="M15 -4C15 3 11 6 9 7V13H2V8C8 6 11 1 12 -8C14 -6 15 -5 15 -4Z" fill="#c9b892"/>`;
  d += `<ellipse cx="-6" cy="-5" rx="4.4" ry="4.8" fill="${INK}"/><ellipse cx="6" cy="-5" rx="4.4" ry="4.8" fill="${INK}"/><circle cx="-6" cy="-5" r="1.8" fill="#ffb43a"/><circle cx="6" cy="-5" r="1.8" fill="#ffb43a"/>`;
  d += `<path d="M0 1L-2 4.5H2Z" fill="${INK}"/><path d="M-4 8V13M0 8V13M4 8V13" stroke="${INK}" stroke-width="1.5"/>`;
  d += `<path d="${hornL}" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="${hornL}" transform="scale(-1 1)" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
  d += `<path d="M-15 -4C-15 -16 -8 -22 0 -22C8 -22 15 -16 15 -4C15 3 11 6 9 7V13H-9V7C-11 6 -15 3 -15 -4Z" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
  d += `<path d="M-11 -9C-10 -15 -6 -18 -1 -19" fill="none" stroke="#ffffff" stroke-width="2"/>`;
  d += `</g>`;
  // chaînes pendues au cadre
  const chain = (x, y0, n) => { let s = ''; for (let i = 0; i < n; i++) { const y = y0 + i * 12; s += i % 2 ? `<rect x="${x - 2}" y="${y - 1}" width="4" height="14" rx="2" fill="#5d5a80" stroke="${INK}" stroke-width="2"/>` : `<ellipse cx="${x}" cy="${y + 6}" rx="5" ry="7.5" fill="none" stroke="${INK}" stroke-width="5"/><ellipse cx="${x}" cy="${y + 6}" rx="5" ry="7.5" fill="none" stroke="#7d7aa6" stroke-width="2"/>`; } return s; };
  d += chain(px - 150, 60, 11) + chain(px + 150, 80, 9);

  // ---------- piliers + torches ----------
  function pillar(cx) {
    let s = '';
    const x0 = cx - 24, x1 = cx + 24, yb = HZ - 24;
    const body = `M${x0} -6H${x1}V${yb}H${x0}Z`, base = `M${x0 - 8} ${yb}H${x1 + 8}V${HZ + 4}H${x0 - 8}Z`, ring1 = `M${x0 - 5} 92H${x1 + 5}V108H${x0 - 5}Z`;
    s += `<g fill="${INK}" stroke="${INK}" stroke-width="6"><path d="${body}"/><path d="${base}"/><path d="${ring1}"/></g>`;
    for (const p of [body, ring1, base]) {
      const bb = p === body ? [x0, -6, 48, yb + 6] : p === ring1 ? [x0 - 5, 92, 58, 16] : [x0 - 8, yb, 64, 28];
      s += `<rect x="${bb[0]}" y="${bb[1]}" width="${bb[2]}" height="${bb[3]}" fill="#2a2264"/>`;
      s += `<rect x="${bb[0]}" y="${bb[1]}" width="${f2(bb[2] * 0.26)}" height="${bb[3]}" fill="#3b318a"/>`;
      s += `<rect x="${f2(bb[0] + bb[2] * 0.7)}" y="${bb[1]}" width="${f2(bb[2] * 0.3)}" height="${bb[3]}" fill="#1b1548"/>`;
      s += `<path d="M${bb[0] + 3.5} ${bb[1] + 3}V${bb[1] + bb[3] - 3}" stroke="#5446b8" stroke-width="2"/>`;
      s += `<path d="${p}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    }
    s += `<path d="M${x0} 40H${x1}M${x0} 170H${x1}M${x0} 260H${x1}" stroke="${INK}" stroke-width="2.5"/>`;
    // torche
    const ty = 214;
    s += `<circle cx="${cx}" cy="${ty - 22}" r="62" fill="url(#${P}l-feu)"/>`;
    s += `<path d="M${cx - 6} ${ty + 22}L${cx + 6} ${ty + 22}L${cx + 4} ${ty + 40}L${cx - 4} ${ty + 40}Z" fill="#3d3a5e" stroke="${INK}" stroke-width="2.5"/>`;
    s += `<path d="M${cx - 13} ${ty - 2}H${cx + 13}L${cx + 8} ${ty + 22}H${cx - 8}Z" fill="${INK}" stroke="${INK}" stroke-width="5"/>`;
    s += `<path d="M${cx - 13} ${ty - 2}H${cx + 13}L${cx + 8} ${ty + 22}H${cx - 8}Z" fill="url(#${P}gold)"/><path d="M${cx + 4} ${ty - 2}H${cx + 13}L${cx + 8} ${ty + 22}H${cx + 2}Z" fill="#cd7e15"/><path d="M${cx - 9} ${ty + 2}L${cx - 6} ${ty + 18}" stroke="#fff7c4" stroke-width="2"/>`;
    s += `<path d="M${cx - 13} ${ty - 2}H${cx + 13}L${cx + 8} ${ty + 22}H${cx - 8}Z" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
    const fl = `M${cx} ${ty - 46}C${cx + 6} ${ty - 34} ${cx + 16} ${ty - 26} ${cx + 15} ${ty - 12}C${cx + 14} ${ty - 2} ${cx + 7} ${ty + 2} ${cx} ${ty + 2}C${cx - 8} ${ty + 2} ${cx - 15} ${ty - 3} ${cx - 15} ${ty - 12}C${cx - 15} ${ty - 22} ${cx - 8} ${ty - 26} ${cx - 6} ${ty - 34}C${cx - 3} ${ty - 30} ${cx - 2} ${ty - 28} ${cx - 1} ${ty - 26}Z`;
    s += `<path d="${fl}" fill="url(#${P}flamme)" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<path d="M${cx} ${ty - 22}C${cx + 4} ${ty - 16} ${cx + 7} ${ty - 12} ${cx + 6} ${ty - 7}C${cx + 5} ${ty - 2} ${cx - 5} ${ty - 2} ${cx - 6} ${ty - 7}C${cx - 6} ${ty - 12} ${cx - 3} ${ty - 16} ${cx} ${ty - 22}Z" fill="#fffbe0"/>`;
    return s;
  }
  d += pillar(342) + pillar(676);

  // ---------- plinthe ----------
  d += `<rect x="0" y="${HZ - 8}" width="${W}" height="10" fill="#120d34"/><path d="M0 ${HZ - 8}H${W}" stroke="#3a3090" stroke-width="2"/>`;

  // ---------- sol : dalles en perspective ----------
  defs += `<clipPath id="${P}sol-c"><rect x="0" y="${HZ + 2}" width="${W}" height="${H - HZ}"/></clipPath>`;
  d += `<g clip-path="url(#${P}sol-c)"><rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#${P}sol)"/>`;
  const VX = 560, VY = -340;
  const rows = [HZ + 2, 392, 410, 432, 458, 490, 528, 574, 630, 700];
  const xb = []; for (let x = -1400; x <= 2600; x += 150) xb.push(x);
  const atY = (xbot, y) => VX + (xbot - VX) * (y - VY) / (H - VY);
  let tiles = { a: '', b: '' };
  for (let r = 0; r < rows.length - 1; r++) {
    for (let c = 0; c < xb.length - 1; c++) {
      const off = r % 2 ? 75 : 0;
      const y0 = rows[r], y1 = rows[r + 1];
      const q = [[atY(xb[c] + off, y0), y0], [atY(xb[c + 1] + off, y0), y0], [atY(xb[c + 1] + off, y1), y1], [atY(xb[c] + off, y1), y1]];
      const k = rnd() < 0.35 ? 'a' : rnd() < 0.5 ? 'b' : null;
      if (k) tiles[k] += `M${q.map(p => f2(p[0]) + ' ' + f2(p[1])).join('L')}Z`;
    }
  }
  d += `<path d="${tiles.a}" fill="#2f2670" opacity="0.55"/><path d="${tiles.b}" fill="#0f0a2a" opacity="0.35"/>`;
  let joints = '', jl = '';
  for (let r = 1; r < rows.length - 1; r++) { joints += `M0 ${rows[r]}H${W}`; jl += `M0 ${rows[r] + 2}H${W}`; }
  for (let r = 0; r < rows.length - 1; r++) {
    const off = r % 2 ? 75 : 0;
    for (const x of xb) { const y0 = rows[r], y1 = rows[r + 1]; joints += `M${f2(atY(x + off, y0))} ${y0}L${f2(atY(x + off, y1))} ${y1}`; jl += `M${f2(atY(x + off, y0) + 2.5)} ${y0 + 2}L${f2(atY(x + off, y1) + 2.5)} ${y1}`; }
  }
  d += `<path d="${jl}" fill="none" stroke="#3a3088" stroke-width="1.6" opacity="0.7"/>`;
  d += `<path d="${joints}" fill="none" stroke="#0b0822" stroke-width="2.6"/>`;
  defs += `<radialGradient id="${P}joints-feu" gradientUnits="userSpaceOnUse" cx="${CX[2]}" cy="${FYB + 30}" r="250" gradientTransform="translate(${CX[2]} ${FYB + 30}) scale(1 0.42) translate(${-CX[2]} ${-(FYB + 30)})"><stop offset="0" stop-color="#ffd27a"/><stop offset="0.45" stop-color="#ff8a2a"/><stop offset="0.8" stop-color="#ff5a2a" stop-opacity="0.35"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></radialGradient>`;
  d += `<path d="${joints}" fill="none" stroke="url(#${P}joints-feu)" stroke-width="1.8"/>`;
  d += `<path d="M150 520l18 10 6 18 22 6M820 600l20-12 24 4M420 560l-14 16 6 14" fill="none" stroke="#0b0822" stroke-width="2.2"/>`;
  d += `</g>`;
  // brume au pied du mur
  d += `<rect x="0" y="${HZ - 70}" width="${W}" height="130" fill="url(#${P}brume)"/>`;

  // ---------- lumières au sol ----------
  d += `<ellipse cx="342" cy="${HZ + 8}" rx="80" ry="16" fill="url(#${P}l-feu)" opacity="0.6"/><ellipse cx="676" cy="${HZ + 8}" rx="80" ry="16" fill="url(#${P}l-feu)" opacity="0.6"/>`;
  d += `<ellipse cx="${CX[0]}" cy="${FY}" rx="180" ry="44" fill="url(#${P}l-verte)"/>`;
  // rayon de lune
  d += `<path d="M${wx - 44} ${wy + 14}L${wx + 30} ${wy + 30}L${CX[1] + 120} 470L${CX[1] - 120} 470Z" fill="url(#${P}rayon)"/>`;
  d += `<path d="M${wx - 30} ${wy + 20}L${wx - 14} ${wy + 24}L${CX[1] - 40} 466L${CX[1] - 86} 466Z M${wx + 4} ${wy + 26}L${wx + 14} ${wy + 28}L${CX[1] + 70} 466L${CX[1] + 40} 466Z" fill="url(#${P}rayon)"/>`;
  d += `<ellipse cx="${CX[1]}" cy="${FY + 2}" rx="185" ry="42" fill="url(#${P}l-bleue)"/><ellipse cx="${CX[1]}" cy="${FY + 2}" rx="110" ry="22" fill="url(#${P}l-bleue)"/>`;
  d += `<ellipse cx="${CX[2]}" cy="${FYB + 10}" rx="250" ry="60" fill="url(#${P}l-rouge)"/>`;

  // flaque de gelée sous le roi
  const pud = `M${CX[0] - 132} ${FY + 4}C${CX[0] - 140} ${FY - 8} ${CX[0] - 100} ${FY - 14} ${CX[0] - 60} ${FY - 12}L${CX[0] + 80} ${FY - 12}C${CX[0] + 120} ${FY - 14} ${CX[0] + 150} ${FY - 6} ${CX[0] + 140} ${FY + 6}C${CX[0] + 132} ${FY + 14} ${CX[0] + 100} ${FY + 12} ${CX[0] + 70} ${FY + 16}C${CX[0] + 30} ${FY + 20} ${CX[0] - 40} ${FY + 18} ${CX[0] - 80} ${FY + 15}C${CX[0] - 110} ${FY + 14} ${CX[0] - 128} ${FY + 12} ${CX[0] - 132} ${FY + 4}Z`;
  defs += `<clipPath id="${P}flaque"><path d="${pud}"/></clipPath>`;
  d += `<path d="${pud}" fill="${INK}" stroke="${INK}" stroke-width="5"/>`;
  d += `<g clip-path="url(#${P}flaque)"><rect x="${CX[0] - 145}" y="${FY - 16}" width="290" height="40" fill="#44b846"/><path d="M${CX[0] - 150} ${FY + 8}C${CX[0] - 60} ${FY + 14} ${CX[0] + 60} ${FY + 12} ${CX[0] + 150} ${FY}V${FY + 30}H${CX[0] - 150}Z" fill="#2c8a3a"/>`;
  d += `<path d="M${CX[0] - 118} ${FY + 2}C${CX[0] - 116} ${FY - 6} ${CX[0] - 96} ${FY - 9} ${CX[0] - 76} ${FY - 9}" fill="none" stroke="#b6f28a" stroke-width="2.6"/><ellipse cx="${CX[0] + 116}" cy="${FY - 3}" rx="7" ry="2.4" fill="#b6f28a"/></g>`;
  d += `<path d="${pud}" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
  for (const [x, y, rx] of [[CX[0] - 150, FY + 16, 9], [CX[0] + 156, FY + 14, 7], [CX[0] + 128, FY + 24, 5]]) {
    d += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.42}" fill="#44b846" stroke="${INK}" stroke-width="2.2"/><ellipse cx="${x - rx * 0.35}" cy="${y - rx * 0.12}" rx="${rx * 0.35}" ry="${rx * 0.14}" fill="#b6f28a"/>`;
  }

  // os rongés près du loup
  const bone = (x, y, a, s = 1) => {
    const p = 'M-14 -2.4H14C15 -6 20 -6 20 -2.6C23 -2 23 2 20 2.6C20 6 15 6 14 2.4H-14C-15 6 -20 6 -20 2.6C-23 2 -23 -2 -20 -2.6C-20 -6 -15 -6 -14 -2.4Z';
    return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${p}" fill="${INK}" stroke="${INK}" stroke-width="5"/><path d="${p}" fill="#efe6d0"/><path d="M-14 1H14L14 2.4H-14Z" fill="#c9b892"/><path d="${p}" fill="none" stroke="${INK}" stroke-width="2"/><path d="M-12 -0.8H8" stroke="#ffffff" stroke-width="1.4"/></g>`;
  };
  d += bone(CX[1] - 128, FY + 18, -12, 0.9) + bone(CX[1] + 132, FY + 14, 18, 0.75) + bone(CX[1] + 112, FY + 22, -30, 0.7);

  // ---------- estrade du boss + cercle de runes ----------
  const ex = CX[2], erx = 176, ery = 26, eh = 14;
  defs += `<clipPath id="${P}estrade-face"><path d="M${ex - erx} ${FYB}V${FYB + eh}A${erx} ${ery} 0 0 0 ${ex + erx} ${FYB + eh}V${FYB}Z"/></clipPath>`;
  defs += `<clipPath id="${P}estrade-dessus"><ellipse cx="${ex}" cy="${FYB}" rx="${erx}" ry="${ery}"/></clipPath>`;
  d += `<path d="M${ex - erx} ${FYB}V${FYB + eh}A${erx} ${ery} 0 0 0 ${ex + erx} ${FYB + eh}V${FYB}A${erx} ${ery} 0 0 0 ${ex - erx} ${FYB}Z" fill="${INK}" stroke="${INK}" stroke-width="7"/>`;
  d += `<g clip-path="url(#${P}estrade-face)"><rect x="${ex - erx}" y="${FYB}" width="${erx * 2}" height="${eh + ery + 2}" fill="#1f1848"/><rect x="${ex + 40}" y="${FYB}" width="${erx}" height="${eh + ery + 2}" fill="#160f38"/><rect x="${ex - erx}" y="${FYB}" width="60" height="${eh + ery + 2}" fill="#2c2362"/>`;
  let seams = '';
  for (let i = 1; i < 10; i++) { const a = Math.PI * i / 10; const x = ex - Math.cos(a) * erx; const y = FYB + Math.sin(a) * ery; seams += `M${f2(x)} ${f2(y)}V${f2(y + eh)}`; }
  d += `<path d="${seams}" stroke="${INK}" stroke-width="2.2"/>`;
  let runes = '';
  for (let i = 1; i < 10; i++) { const a = Math.PI * (i + 0.5) / 10; const x = ex - Math.cos(a) * erx; const y = FYB + Math.sin(a) * ery + eh * 0.55; runes += i % 3 === 0 ? `M${f2(x)} ${f2(y - 4)}L${f2(x + 3.4)} ${f2(y)}L${f2(x)} ${f2(y + 4)}L${f2(x - 3.4)} ${f2(y)}Z` : i % 3 === 1 ? `M${f2(x - 3.4)} ${f2(y + 3)}L${f2(x)} ${f2(y - 4)}L${f2(x + 3.4)} ${f2(y + 3)}M${f2(x)} ${f2(y + 0.5)}V${f2(y + 3)}` : `M${f2(x)} ${f2(y - 4.5)}V${f2(y + 4.5)}M${f2(x - 3.2)} ${f2(y - 1.5)}H${f2(x + 3.2)}`; }
  d += `<path d="${runes}" fill="none" stroke="#ff9a3a" stroke-width="2"/>`;
  d += `</g>`;
  d += `<g clip-path="url(#${P}estrade-dessus)"><rect x="${ex - erx}" y="${FYB - ery}" width="${erx * 2}" height="${ery * 2}" fill="#3a2f78"/><path d="M${ex - erx} ${FYB}A${erx} ${ery} 0 0 1 ${ex + erx} ${FYB}A${erx * 0.9} ${ery * 0.7} 0 0 0 ${ex - erx} ${FYB}Z" fill="#4a3e98"/>`;
  d += `<ellipse cx="${ex}" cy="${FYB}" rx="${erx - 8}" ry="${ery - 4}" fill="url(#${P}l-rouge)"/>`;
  d += `<ellipse cx="${ex}" cy="${FYB}" rx="${erx - 22}" ry="${ery - 7}" fill="none" stroke="${INK}" stroke-width="6"/><ellipse cx="${ex}" cy="${FYB}" rx="${erx - 22}" ry="${ery - 7}" fill="none" stroke="#ffb043" stroke-width="2.6"/>`;
  d += `<ellipse cx="${ex}" cy="${FYB}" rx="${erx - 48}" ry="${ery - 12}" fill="none" stroke="#ff7a2a" stroke-width="1.8"/>`;
  let ticks = '';
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; const r1 = 0.83, r2 = 0.92; ticks += `M${f2(ex + Math.cos(a) * (erx - 22) * r1)} ${f2(FYB + Math.sin(a) * (ery - 7) * r1)}L${f2(ex + Math.cos(a) * (erx - 22) * r2)} ${f2(FYB + Math.sin(a) * (ery - 7) * r2)}`; }
  d += `<path d="${ticks}" stroke="#ffd27a" stroke-width="2"/>`;
  d += `</g>`;
  d += `<path d="M${ex - erx} ${FYB}V${FYB + eh}A${erx} ${ery} 0 0 0 ${ex + erx} ${FYB + eh}V${FYB}" fill="none" stroke="${INK}" stroke-width="3"/><ellipse cx="${ex}" cy="${FYB}" rx="${erx}" ry="${ery}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  d += `<path d="M${ex - erx + 6} ${FYB - 6}A${erx} ${ery} 0 0 1 ${ex - 40} ${FYB - ery + 1}" fill="none" stroke="#7062d0" stroke-width="2"/>`;
  // assombrissement du bas (lisibilité des plaques) + vignette
  d += `<rect x="0" y="460" width="${W}" height="${H - 460}" fill="url(#${P}bas)"/>`;
  d += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${P}vignette)"/>`;
  return svg(`0 0 ${W} ${H}`, `<defs>${defs}</defs><g stroke-linejoin="round" stroke-linecap="round">${d}</g>`, `position:absolute;left:0;top:0;width:${W}px;height:${H}px`);
}

// =====================================================================
//  PREMIER PLAN : braises, bulles, poussières de lune
// =====================================================================
function foreground() {
  let d = '';
  const spark = (x, y, r, c) => `<path d="M${x} ${y - r}L${f2(x + r * 0.28)} ${f2(y - r * 0.28)}L${x + r} ${y}L${f2(x + r * 0.28)} ${f2(y + r * 0.28)}L${x} ${y + r}L${f2(x - r * 0.28)} ${f2(y + r * 0.28)}L${x - r} ${y}L${f2(x - r * 0.28)} ${f2(y - r * 0.28)}Z" fill="${c}"/>`;
  // braises du boss
  for (const [x, y, r] of [[724, 120, 3], [1040, 96, 2.6], [1072, 200, 3.4], [708, 300, 2.4], [1050, 340, 2.8], [760, 70, 2.2], [990, 50, 2.4], [1084, 420, 2.2], [700, 410, 2.6]]) {
    d += `<ellipse cx="${x}" cy="${y}" rx="${r * 2.6}" ry="${r * 2.6}" fill="url(#mp-l-feu)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ffd27a" stroke="#8f2a10" stroke-width="1"/>`;
  }
  d += spark(1062, 140, 7, '#fff3b0') + spark(712, 200, 6, '#ffe168') + spark(960, 34, 5, '#ffe168');
  // bulles de gelée
  for (const [x, y, r] of [[60, 380, 5], [72, 352, 3], [300, 330, 4.5], [314, 300, 2.8], [96, 300, 3.6]]) {
    d += `<circle cx="${x}" cy="${y}" r="${r}" fill="#7ee05a" stroke="${INK}" stroke-width="1.6"/><circle cx="${f2(x - r * 0.35)}" cy="${f2(y - r * 0.35)}" r="${f2(r * 0.32)}" fill="#e6ffc8"/>`;
  }
  // poussières de lune
  for (const [x, y, r] of [[470, 240, 1.8], [560, 222, 1.4], [600, 300, 1.8], [440, 330, 1.4], [520, 268, 1.2]]) d += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8fbff"/>`;
  d += spark(588, 252, 5, '#ffffff') + spark(452, 290, 4, '#dff6ff');
  return svg(`0 0 ${W} ${H}`, `<g stroke-linejoin="round" stroke-linecap="round">${d}</g>`, `position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none`);
}

// =====================================================================
//  CRÂNES DE DIFFICULTÉ
// =====================================================================
let skN = 0;
function skull(kind, size = 24) {
  const id = `mp-sk${++skN}`;
  const P = 'M16 3.5C8.6 3.5 4 8.6 4 15C4 19 5.8 21.6 8.6 22.8V26C8.6 27.6 9.8 28.6 11.2 28.6H20.8C22.2 28.6 23.4 27.6 23.4 26V22.8C26.2 21.6 28 19 28 15C28 8.6 23.4 3.5 16 3.5Z';
  const C = {
    on:   { base: '#f6efdc', sh: '#cbb994', hl: '#ffffff', sock: INK, line: INK },
    off:  { base: '#363063', sh: '#2a2452', hl: '#463f80', sock: '#141030', line: '#0c0920' },
    boss: { base: '#ee3b44', sh: '#a81d35', hl: '#ff9a8a', sock: INK, line: INK },
  }[kind];
  let s = `<defs><clipPath id="${id}"><path d="${P}"/></clipPath></defs>`;
  if (kind === 'boss') {
    const horn = 'M7.5 9C4.5 7 2.6 3.6 2.4 0.4C5 2.4 8 3.6 11 4.4Z';
    s += `<path d="${horn}" fill="#f6efdc" stroke="${INK}" stroke-width="2"/><path d="${horn}" transform="translate(32 0) scale(-1 1)" fill="#cbb994" stroke="${INK}" stroke-width="2"/>`;
  }
  s += `<path d="${P}" fill="${C.line}" stroke="${C.line}" stroke-width="3.4"/>`;
  s += `<g clip-path="url(#${id})"><rect x="3" y="3" width="26" height="26" fill="${C.base}"/><path d="M28.5 10C27 20 22 25 12 29L30 30V10Z" fill="${C.sh}"/><path d="M7.4 13.4C7.6 9 10.6 6.2 14.8 5.6C11.6 7.6 9.8 9.8 9.4 13.4Z" fill="${C.hl}"/></g>`;
  s += `<ellipse cx="11.3" cy="15.4" rx="3.8" ry="4.2" fill="${C.sock}"/><ellipse cx="20.7" cy="15.4" rx="3.8" ry="4.2" fill="${C.sock}"/>`;
  if (kind === 'boss') s += `<circle cx="11.6" cy="15.6" r="1.9" fill="#ffe168"/><circle cx="20.4" cy="15.6" r="1.9" fill="#ffe168"/>`;
  if (kind === 'on') s += `<circle cx="12.4" cy="14.2" r="1" fill="#5a4f7a"/>`;
  s += `<path d="M16 19.4L14.5 22H17.5Z" fill="${C.sock}"/>`;
  s += `<path d="M12.8 24.4V28.4M16 24.4V28.6M19.2 24.4V28.4" stroke="${C.line}" stroke-width="1.5"/>`;
  s += `<path d="${P}" fill="none" stroke="${C.line}" stroke-width="2.2"/>`;
  return svg('0 -1 32 32', `<g stroke-linejoin="round" stroke-linecap="round">${s}</g>`, `width:${size}px;height:${size}px;overflow:visible;flex:none`);
}
function difficulty(n, boss, label, color) {
  let sk = '';
  for (let i = 0; i < 5; i++) sk += skull(i < n ? (boss ? 'boss' : 'on') : 'off', boss ? 25 : 23);
  return `<div style="display:flex;align-items:center;gap:10px;padding:5px 14px 5px 12px;border-radius:999px;background:linear-gradient(180deg,#0b0820 0%,#1a1446 100%);box-shadow:0 0 0 2px ${INK},0 0 0 3.5px ${boss ? 'rgba(255,120,80,0.35)' : 'rgba(150,130,255,0.28)'},inset 0 3px 4px rgba(0,0,0,0.55),0 6px 10px rgba(5,3,20,0.55)">` +
    `<div style="display:flex;align-items:center;gap:3px">${sk}</div>` +
    `<div style="width:2px;height:18px;border-radius:1px;background:rgba(255,255,255,0.14)"></div>` +
    `<span style="${LIL};font-size:17px;line-height:1;letter-spacing:0.3px;color:${color};${outlined(1.6, 1.6)}">${label}</span></div>`;
}

// =====================================================================
//  PLAQUES DE NOM
// =====================================================================
let plN = 0;
function plate({ name, meta, w, h, panel, gem, boss }) {
  const id = `mp-pl${++plN}`;
  const ch = Math.round(h * 0.25);             // chanfrein des pointes
  const o = `M${ch + 2} 3H${w - ch - 2}L${w - 3} ${h / 2}L${w - ch - 2} ${h - 3}H${ch + 2}L3 ${h / 2}Z`;
  const i = `M${ch + 7} 9.5H${w - ch - 7}L${w - 12} ${h / 2}L${w - ch - 7} ${h - 9.5}H${ch + 7}L12 ${h / 2}Z`;
  const gloss = `M${ch + 7} 9.5H${w - ch - 7}L${f2(w - 12 - (h / 2 - 9.5) * 0.45)} ${f2(h / 2 - 3)}H${f2(12 + (h / 2 - 9.5) * 0.45)}Z`;
  let s = `<defs><linearGradient id="${id}-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.28" stop-color="#ffd65a"/><stop offset="0.55" stop-color="#f2a92a"/><stop offset="0.82" stop-color="#b8680f"/><stop offset="1" stop-color="#e9ac3c"/></linearGradient>` +
    `<linearGradient id="${id}-fond" x1="0" y1="0" x2="0" y2="1">${panel.map(([o2, c]) => `<stop offset="${o2}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
  s += `<path d="${o}" transform="translate(0 5)" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
  s += `<path d="${o}" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
  s += `<path d="${o}" fill="url(#${id}-or)"/>`;
  s += `<path d="M${ch + 3} 5.4H${w - ch - 3}" stroke="#fffbe6" stroke-width="2"/><path d="M${ch + 4} ${h - 5.6}H${w - ch - 4}" stroke="#8f4c0a" stroke-width="2"/>`;
  s += `<path d="${i}" fill="url(#${id}-fond)" stroke="${INK}" stroke-width="2.4"/>`;
  s += `<path d="${gloss}" fill="#ffffff" opacity="0.08"/>`;
  s += `<path d="M${ch + 9} ${h - 12}H${w - ch - 9}" stroke="#ffffff" stroke-width="1.4" opacity="0.14"/>`;
  // gemmes aux pointes
  for (const gx of [9, w - 9]) {
    s += `<path d="M${gx} ${h / 2 - 9}L${gx + 6} ${h / 2}L${gx} ${h / 2 + 9}L${gx - 6} ${h / 2}Z" fill="${gem[0]}" stroke="${INK}" stroke-width="2.2"/>`;
    s += `<path d="M${gx} ${h / 2 - 9}L${gx + 6} ${h / 2}L${gx} ${h / 2 + 9}Z" fill="${gem[1]}"/><path d="M${gx} ${h / 2 - 9}L${gx + 6} ${h / 2}L${gx} ${h / 2 + 9}L${gx - 6} ${h / 2}Z" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
    s += `<path d="M${gx - 2.6} ${h / 2 - 1}L${gx} ${h / 2 - 5.4}" stroke="#ffffff" stroke-width="1.8"/>`;
  }
  // rivets
  for (const [rx, ry] of [[ch + 14, 6.2], [w - ch - 14, 6.2], [ch + 14, h - 6.2], [w - ch - 14, h - 6.2]]) s += `<circle cx="${rx}" cy="${ry}" r="2" fill="#fff3b0" stroke="#8f4c0a" stroke-width="1.2"/>`;
  const nameSize = boss ? 31 : 27;
  return `<div style="position:relative;width:${w}px;height:${h + 5}px;flex:none">` +
    svg(`0 0 ${w} ${h + 5}`, `<g stroke-linejoin="round" stroke-linecap="round">${s}</g>`, `position:absolute;left:0;top:0;width:${w}px;height:${h + 5}px;overflow:visible`) +
    `<div style="position:absolute;left:0;right:0;top:0;height:${h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${boss ? 3 : 2}px;padding-top:${boss ? 6 : 1}px;box-sizing:border-box">` +
    `<div style="${LIL};font-size:${nameSize}px;line-height:1;color:#ffffff;letter-spacing:0.4px;white-space:nowrap;${outlined(2.2, 2.4)}">${name}</div>` +
    `<div style="${NUN};font-weight:800;font-size:12.5px;line-height:1.1;color:${boss ? '#ffd2c4' : '#cfc6ff'};white-space:nowrap">${meta}</div>` +
    `</div></div>`;
}

// badge BOSS
function bossBadge() {
  const w = 132, h = 40;
  const o = `M14 3H${w - 14}L${w - 3} ${h / 2}L${w - 14} ${h - 3}H14L3 ${h / 2}Z`;
  const i = `M18 8H${w - 18}L${w - 10} ${h / 2}L${w - 18} ${h - 8}H18L10 ${h / 2}Z`;
  const horn = `M16 10C8 4 2 -6 1 -20C8 -12 22 -8 40 -6L38 10Z`;
  let s = `<defs><linearGradient id="mp-boss-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.3" stop-color="#ffd65a"/><stop offset="0.6" stop-color="#f2a92a"/><stop offset="1" stop-color="#a85c0c"/></linearGradient>` +
    `<linearGradient id="mp-boss-rouge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a5a"/><stop offset="0.45" stop-color="#e3343d"/><stop offset="1" stop-color="#8e1430"/></linearGradient></defs>`;
  s += `<g fill="${INK}" stroke="${INK}" stroke-width="6"><path d="${horn}"/><path d="${horn}" transform="translate(${w} 0) scale(-1 1)"/></g>`;
  s += `<path d="${horn}" fill="#f6efdc"/><path d="M16 10C10 6 5 -1 3 -9C10 -3 24 -1 39 0L38 10Z" fill="#cbb994"/><path d="M5 -12C6 -8 9 -5 12 -3" fill="none" stroke="#ffffff" stroke-width="1.8"/><path d="${horn}" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
  s += `<g transform="translate(${w} 0) scale(-1 1)"><path d="${horn}" fill="#cbb994"/><path d="${horn}" fill="none" stroke="${INK}" stroke-width="2.4"/></g>`;
  s += `<path d="${o}" transform="translate(0 4)" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
  s += `<path d="${o}" fill="${INK}" stroke="${INK}" stroke-width="6"/><path d="${o}" fill="url(#mp-boss-or)"/>`;
  s += `<path d="${i}" fill="url(#mp-boss-rouge)" stroke="${INK}" stroke-width="2.2"/>`;
  s += `<path d="M19 10H${w - 19}L${w - 15} 17H15Z" fill="#ffffff" opacity="0.18"/>`;
  return `<div style="position:absolute;left:50%;top:-30px;transform:translateX(-50%);width:${w}px;height:${h + 4}px;z-index:2">` +
    svg(`0 0 ${w} ${h + 4}`, `<g stroke-linejoin="round" stroke-linecap="round">${s}</g>`, `position:absolute;left:0;top:0;width:${w}px;height:${h + 4}px;overflow:visible`) +
    `<div style="position:absolute;left:0;right:0;top:0;height:${h}px;display:flex;align-items:center;justify-content:center;${LIL};font-size:21px;line-height:1;letter-spacing:2.5px;padding-left:2px;color:#fff3b0;${outlined(1.8, 2)}">BOSS</div></div>`;
}

// coins dorés du cadre
function corners() {
  const c = `<path d="M3 30V12C3 7 7 3 12 3H30" fill="none" stroke="${INK}" stroke-width="7"/><path d="M3 30V12C3 7 7 3 12 3H30" fill="none" stroke="url(#mp-coin-or)" stroke-width="3.4"/>` +
    `<path d="M14 8L20 14L14 20L8 14Z" fill="#ffd65a" stroke="${INK}" stroke-width="2"/><path d="M14 8L20 14L14 14Z" fill="#fff7c4"/>` +
    `<circle cx="30" cy="3" r="2.6" fill="#ffd65a" stroke="${INK}" stroke-width="1.6"/><circle cx="3" cy="30" r="2.6" fill="#ffd65a" stroke="${INK}" stroke-width="1.6"/>`;
  const defs = `<defs><linearGradient id="mp-coin-or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.5" stop-color="#f7bc2a"/><stop offset="1" stop-color="#cd7e15"/></linearGradient></defs>`;
  const at = (x, y, sx, sy) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})">${c}</g>`;
  return svg(`0 0 ${W} ${H}`, defs + `<g stroke-linejoin="round" stroke-linecap="round">${at(6, 6, 1, 1)}${at(W - 6, 6, -1, 1)}${at(6, H - 6, 1, -1)}${at(W - 6, H - 6, -1, -1)}</g>`, `position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;z-index:4`);
}

// =====================================================================
//  ASSEMBLAGE
// =====================================================================
const GOLDTXT = 'linear-gradient(180deg,#fffbe6 0%,#ffe680 34%,#f7bc2a 62%,#e08a18 100%)';
const title =
  `<div style="position:absolute;left:46px;top:30px;width:380px;display:flex;flex-direction:column;gap:6px;z-index:3">` +
  `<div style="display:flex;align-items:center;gap:8px">` +
  svg('0 0 12 12', `<path d="M6 0.8L11.2 6L6 11.2L0.8 6Z" fill="#ffd65a" stroke="${INK}" stroke-width="1.4"/>`, 'width:12px;height:12px;flex:none') +
  `<span style="${NUN};font-weight:900;font-size:12.5px;letter-spacing:2.6px;text-transform:uppercase;color:#ffd65a;white-space:nowrap">Fuze Arena · Bestiaire</span>` +
  `<div style="flex:1;height:2px;border-radius:1px;background:linear-gradient(90deg,#ffd65a,rgba(255,214,90,0))"></div></div>` +
  `<h1 style="position:relative;margin:0;${LIL};font-size:66px;line-height:1;letter-spacing:0.5px;white-space:nowrap">` +
  `<span style="display:block;color:${INK};-webkit-text-stroke:9px ${INK};text-shadow:0 6px 0 ${INK},0 10px 18px rgba(0,0,0,0.6)">Les monstres</span>` +
  `<span style="position:absolute;left:0;top:0;display:block;background:${GOLDTXT};-webkit-background-clip:text;background-clip:text;color:transparent">Les monstres</span>` +
  `</h1>` +
  `<p style="margin:4px 0 0;${NUN};font-weight:800;font-size:15px;line-height:1.4;color:#d6cfff;max-width:340px">Trois adversaires redessinés, du premier donjon jusqu’au boss des abysses.</p>` +
  `</div>`;

const cells = [
  { k: 'gluant', name: 'Roi Gluant', meta: 'Donjon Appartement 33 · Niv. 1', n: 1, label: 'Facile', color: '#8ef06a', gem: ['#4cc84a', '#2c8a3a'],
    panel: [[0, '#3d2f86'], [0.5, '#271d62'], [1, '#160f3e']] },
  { k: 'loup', name: 'Loup des bois', meta: 'Donjon C3 Blanche · Niv. 10', n: 2, label: 'Moyen', color: '#ffd24a', gem: ['#5aa8ff', '#2f6fd0'],
    panel: [[0, '#3d2f86'], [0.5, '#271d62'], [1, '#160f3e']] },
  { k: 'demon', name: 'Démon des abysses', meta: 'Donjon Mélusine · Niv. 90', n: 5, label: 'Infernal', color: '#ff6a52', gem: ['#ff4a4a', '#a81d35'], boss: true,
    panel: [[0, '#8e1b38'], [0.5, '#5c0f28'], [1, '#2e0716']] },
];
const plates =
  `<div style="position:absolute;left:${COLS[0].x}px;bottom:24px;display:grid;grid-template-columns:${COLS.map(c => c.w + 'px').join(' ')};column-gap:24px;align-items:end;z-index:3">` +
  cells.map(c => `<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:10px">` +
    `<div style="position:relative">${c.boss ? `<div style="position:absolute;left:-40px;right:-40px;top:-30px;bottom:-24px;background:radial-gradient(closest-side,rgba(255,90,60,0.45),rgba(255,60,60,0.16) 60%,rgba(255,60,60,0) 100%)"></div>` + bossBadge() : ''}${plate({ name: c.name, meta: c.meta, w: c.boss ? 344 : 268, h: c.boss ? 82 : 72, panel: c.panel, gem: c.gem, boss: c.boss })}</div>` +
    difficulty(c.n, c.boss, c.label, c.color) + `</div>`).join('') +
  `</div>`;

const body =
  `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#120d2e;${NUN};color:#ffffff;-webkit-font-smoothing:antialiased">` +
  decor() +
  `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px">${monster('gluant')}${monster('loup')}${monster('demon')}</div>` +
  foreground() +
  title + plates +
  `<div style="position:absolute;left:8px;top:8px;right:8px;bottom:8px;border-radius:14px;box-shadow:inset 0 0 0 1.5px rgba(255,214,90,0.4),0 0 0 2px rgba(10,6,30,0.6);pointer-events:none;z-index:4"></div>` +
  corners() +
  `</div>`;

if (/\{\{|\}\}/.test(body)) throw new Error('accolades doubles dans le contenu');
const head = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Les monstres</title>
<script src="./support.js"></script>
</head>
<body>
`;
const helmet = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;800;900&display=swap" rel="stylesheet">
<style>
body{margin:0}
</style>
`;
const dc = head + `<x-dc>
<helmet>
${helmet}</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1100,"height":640}}'>
class Component extends DCLogic {
renderVals() { return {}; }
}
</script>
</body>
</html>
`;
const ap = head + `<div>
${helmet}
${body}
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(R, 'project/Monstres.dc.html'), dc);
fs.writeFileSync(path.join(R, 'previews/monstres-apercu.html'), ap);
console.log('Monstres.dc.html', (dc.length / 1024).toFixed(0) + ' Ko');
