// Planche « Accueil » (fiche héros) : génère project/Accueil.dc.html + previews/accueil-apercu.html
// node tools/ac-build.cjs
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const I = require('./ac-icons.cjs');
const INK = '#1b1530';

// ---------- SVG d'art collés en ligne (ids renommés à chaque copie) ----------
const copies = {};
function art(file, { vb, style = '', inner = false } = {}) {
  let s = fs.readFileSync(path.join(R, 'art', file + '.svg'), 'utf8').trim();
  const n = (copies[file] = (copies[file] || 0) + 1);
  if (n > 1) {
    const ids = [...s.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
    for (const id of ids) { const ni = id.replace(/^([a-z]+)-/, `$1${n}-`); s = s.split(`id="${id}"`).join(`id="${ni}"`).split(`url(#${id})`).join(`url(#${ni})`); }
  }
  if (inner) return s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return s.replace(/^<svg([^>]*)>/, (m, a) => {
    const v = vb || a.match(/viewBox="([^"]+)"/)[1];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v}" aria-hidden="true" focusable="false" style="display:block;${style}">`;
  });
}
const svg = (vb, content, style = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true" focusable="false" style="display:block;${style}">${content}</svg>`;

// ---------- styles réutilisés ----------
const TITLE = "font-family:'Lilita One',sans-serif;font-weight:400";
const TXT = "font-family:'Nunito',sans-serif";
const outline = (w = 1.5, c = INK, drop = 1.5) => 'text-shadow:' + [[w, 0], [-w, 0], [0, w], [0, -w], [w, w], [-w, w], [w, -w], [-w, -w]].map(([x, y]) => `${x}px ${y}px 0 ${c}`).join(',') + `,0 ${w + drop}px 0 ${c}`;
const GOLD = 'linear-gradient(180deg,#fff6c9 0%,#ffd65a 24%,#f2a92a 52%,#b8680f 80%,#e9ac3c 100%)';
const GOLD_D = 'linear-gradient(160deg,#fff6c9 0%,#ffd65a 22%,#e9a024 50%,#9c560c 78%,#f2b544 100%)';
const STEEL = 'linear-gradient(160deg,#ffffff 0%,#c3cce0 35%,#8a95b2 70%,#dfe5f2 100%)';
const bevel = `box-shadow:0 0 0 2px ${INK},0 4px 0 2px ${INK},0 9px 16px rgba(8,4,28,0.55)`;
const btnReset = 'border:none;margin:0;cursor:pointer;-webkit-appearance:none;appearance:none';

// ---------- 1. DÉCOR DE LA SALLE (390 x 448) ----------
const SW = 390, SH = 448;
function decor() {
  const P = 'ac-sa-';
  let d = '', defs = '';
  defs += `<linearGradient id="${P}mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#160f3a"/><stop offset="0.55" stop-color="#2a1f60"/><stop offset="1" stop-color="#3b2c7a"/></linearGradient>`;
  defs += `<radialGradient id="${P}vitre" cx="0.5" cy="0.72" r="0.75"><stop offset="0" stop-color="#fffdf0"/><stop offset="0.3" stop-color="#fff0b8"/><stop offset="0.7" stop-color="#ffc45e"/><stop offset="1" stop-color="#f08a3c"/></radialGradient>`;
  defs += `<radialGradient id="${P}halo"><stop offset="0" stop-color="#ffe9a8" stop-opacity="0.85"/><stop offset="0.28" stop-color="#ffb050" stop-opacity="0.5"/><stop offset="0.62" stop-color="#ff7a3a" stop-opacity="0.2"/><stop offset="1" stop-color="#ff6a3a" stop-opacity="0"/></radialGradient>`;
  defs += `<linearGradient id="${P}rayon" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="400"><stop offset="0" stop-color="#fff0c0" stop-opacity="0.4"/><stop offset="0.5" stop-color="#ffb860" stop-opacity="0.15"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></linearGradient>`;
  defs += `<linearGradient id="${P}sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a92"/><stop offset="0.45" stop-color="#2e2468"/><stop offset="1" stop-color="#171138"/></linearGradient>`;
  defs += `<linearGradient id="${P}tapis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1530"/><stop offset="1" stop-color="#b52238"/></linearGradient>`;
  defs += `<radialGradient id="${P}flaque"><stop offset="0" stop-color="#ffe9a8" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffc66a" stop-opacity="0.25"/><stop offset="1" stop-color="#ffc66a" stop-opacity="0"/></radialGradient>`;
  defs += `<radialGradient id="${P}socle-lueur"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.85"/><stop offset="0.45" stop-color="#ffc840" stop-opacity="0.45"/><stop offset="1" stop-color="#ff9a2a" stop-opacity="0"/></radialGradient>`;
  defs += `<radialGradient id="${P}socle-dessus" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#fffef4"/><stop offset="0.35" stop-color="#ffeeb0"/><stop offset="0.8" stop-color="#f7bc2a"/><stop offset="1" stop-color="#d98a16"/></radialGradient>`;
  defs += `<linearGradient id="${P}colonne" gradientUnits="userSpaceOnUse" x1="0" y1="330" x2="0" y2="40"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffe9a0" stop-opacity="0.2"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></linearGradient>`;
  defs += `<linearGradient id="${P}or-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.3" stop-color="#ffd65a"/><stop offset="0.65" stop-color="#e9a024"/><stop offset="1" stop-color="#8f4c0a"/></linearGradient>`;
  defs += `<linearGradient id="${P}or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.45" stop-color="#f7bc2a"/><stop offset="1" stop-color="#d98a16"/></linearGradient>`;
  defs += `<radialGradient id="${P}feu"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ffb43a" stop-opacity="0.45"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>`;
  defs += `<radialGradient id="${P}flamme" cx="0.45" cy="0.7" r="0.7"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.35" stop-color="#ffe168"/><stop offset="0.75" stop-color="#ff9a2a"/><stop offset="1" stop-color="#e3402a"/></radialGradient>`;
  defs += `<linearGradient id="${P}fondu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150f36" stop-opacity="0"/><stop offset="1" stop-color="#150f36" stop-opacity="0.96"/></linearGradient>`;
  defs += `<radialGradient id="${P}vignette" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#0c0824" stop-opacity="0"/><stop offset="1" stop-color="#0c0824" stop-opacity="0.75"/></radialGradient>`;

  // mur + pierres
  d += `<rect x="0" y="0" width="${SW}" height="256" fill="url(#${P}mur)"/>`;
  let bricks = '', lit = '';
  for (let r = 0; r < 12; r++) {
    const y = r * 22, off = r % 2 ? 22 : 0;
    bricks += `M0 ${y}H${SW}`;
    for (let x = -off; x < SW; x += 44) {
      bricks += `M${x} ${y}V${y + 22}`;
      const h = (r * 7 + Math.round(x / 44) * 13) % 5;
      if (h === 0) lit += `<rect x="${x + 2}" y="${y + 2}" width="40" height="18" rx="2" fill="#3a2e7e" opacity="0.55"/>`;
      if (h === 3) lit += `<path d="M${x + 3} ${y + 3.5}H${x + 30}" stroke="#4a3d94" stroke-width="1.6" opacity="0.6"/>`;
    }
  }
  d += lit + `<path d="${bricks}" fill="none" stroke="#130d33" stroke-width="1.6" opacity="0.7"/>`;
  // halo derrière la fenêtre
  d += `<ellipse cx="195" cy="130" rx="190" ry="175" fill="url(#${P}halo)"/>`;
  // rayons de lumière (derrière les colonnes, devant le mur)
  const rays = [[-150, -40, 0.9], [-70, 10, 1], [10, 60, 0.85], [80, 150, 1], [170, 260, 0.8], [-260, -180, 0.7]];
  const fen = `<path d="M118 252V104C118 54 156 20 195 5C234 20 272 54 272 104V252Z" fill="#4c4296"/>` +
    `<path d="M118 252V104C118 54 156 20 195 5L195 30C164 44 132 70 132 108V252Z" fill="#6a60b0"/>` +
    `<path d="M272 104C272 54 234 20 195 5L195 30C226 44 258 70 258 108V252H272Z" fill="#342b72"/>`;
  // fenêtre gothique
  const INNER = 'M132 252V108C132 66 164 38 195 23C226 38 258 66 258 108V252Z';
  defs += `<clipPath id="${P}vitrail"><path d="${INNER}"/></clipPath>`;
  let lattice = '';
  for (let k = -12; k < 14; k++) lattice += `M${130 + k * 16} 20L${130 + k * 16 + 240} 260M${130 + k * 16} 260L${130 + k * 16 + 240} 20`;
  d += fen;
  d += `<g clip-path="url(#${P}vitrail)"><rect x="130" y="20" width="130" height="234" fill="url(#${P}vitre)"/>` +
    `<path d="${lattice}" fill="none" stroke="#f3c36a" stroke-width="1"/>` +
    // meneaux
    `<path d="M171 70H179V252H171ZM211 70H219V252H211ZM132 150H258V156H132Z" fill="#2c2468" stroke="${INK}" stroke-width="1.6"/>` +
    `<path d="M172.6 72V252M212.6 72V252" stroke="#5a50a6" stroke-width="1.4"/>` +
    // rosace
    `<circle cx="195" cy="66" r="16" fill="none" stroke="#2c2468" stroke-width="6"/><circle cx="195" cy="66" r="16" fill="none" stroke="${INK}" stroke-width="1.4"/>` +
    `<path d="M195 50V82M179 66H211" stroke="#2c2468" stroke-width="4"/><circle cx="195" cy="66" r="4" fill="#2c2468" stroke="${INK}" stroke-width="1.4"/>` +
    `<path d="M171 70C171 60 182 52 195 50C208 52 219 60 219 70" fill="none" stroke="#2c2468" stroke-width="4"/>` +
    `</g>`;
  d += `<path d="M118 252V104C118 54 156 20 195 5C234 20 272 54 272 104V252" fill="none" stroke="${INK}" stroke-width="3"/>`;
  d += `<path d="${INNER}" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
  d += `<path d="M124 108C124 64 156 34 195 18" fill="none" stroke="#8a80cc" stroke-width="2"/>`;
  // rayons
  d += rays.map(([a, b]) => `<path d="M${195 + a * 0.12} -10L${195 + b * 0.12} -10L${195 + b * 1.25} 420L${195 + a * 1.25} 420Z" fill="url(#${P}rayon)"/>`).join('');

  // bannières rouges
  function banniere(cx) {
    const L = cx - 21, Rr = cx + 21;
    const C = `M${L} 26H${Rr}V198L${cx} 182L${L} 198Z`;
    const id = `${P}ban${cx}`;
    defs += `<clipPath id="${id}"><path d="${C}"/></clipPath>`;
    defs += `<clipPath id="${id}o"><path d="M${cx + 7} 20H${Rr + 6}V204H${cx + 7}Z"/></clipPath>`;
    let g = `<path d="${C}" fill="${INK}" stroke="${INK}" stroke-width="7"/>`;
    g += `<g clip-path="url(#${id})"><rect x="${L - 2}" y="24" width="46" height="178" fill="#c42a3a"/>` +
      `<path d="M${cx + 7} 24H${Rr + 2}V202H${cx + 9}Z" fill="#8a1830"/><path d="M${cx + 14} 24H${Rr + 2}V202H${cx + 15}Z" fill="#5e0f24"/>` +
      `<path d="M${L - 2} 24H${L + 6}V202H${L - 2}Z" fill="#e8494f"/>` +
      `<path d="M${cx - 6} 30C${cx - 7} 100 ${cx - 9} 150 ${cx - 11} 196L${cx - 5} 190C${cx - 4.5} 140 ${cx - 5} 96 ${cx - 6} 30Z" fill="#8a1830"/>` +
      `<path d="M${cx - 5} 30C${cx - 4} 96 ${cx - 3} 140 ${cx - 3} 188L${cx + 1} 186C${cx} 140 ${cx - 2} 96 ${cx - 5} 30Z" fill="#e8494f"/>` +
      `<path d="M${cx + 6} 30C${cx + 7} 96 ${cx + 8} 140 ${cx + 9} 190L${cx + 13} 192C${cx + 12} 140 ${cx + 9} 96 ${cx + 6} 30Z" fill="#5e0f24"/>` +
      `<path d="${C}" fill="none" stroke="#f7bc2a" stroke-width="7"/>` +
      `<g clip-path="url(#${id}o)"><path d="${C}" fill="none" stroke="#cd7e15" stroke-width="7"/></g>` +
      `<path d="M${L} 40H${Rr}" stroke="#f7bc2a" stroke-width="2.4"/><path d="M${L} 42.4H${Rr}" stroke="${INK}" stroke-width="1.2"/>` +
      `</g><path d="${C}" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
      // emblème : écu doré à épées croisées
    const ey = 92;
    const ECU = `M${cx - 13} ${ey - 14}H${cx + 13}V${ey + 1}C${cx + 13} ${ey + 10} ${cx + 6} ${ey + 15} ${cx} ${ey + 18}C${cx - 6} ${ey + 15} ${cx - 13} ${ey + 10} ${cx - 13} ${ey + 1}Z`;
    defs += `<clipPath id="${id}e"><path d="${ECU}"/></clipPath>`;
    g += `<path d="${ECU}" fill="${INK}" stroke="${INK}" stroke-width="5"/>` +
      `<g clip-path="url(#${id}e)"><rect x="${cx - 14}" y="${ey - 15}" width="28" height="34" fill="url(#${P}or)"/><path d="M${cx + 2} ${ey - 15}H${cx + 14}V${ey + 20}H${cx}Z" fill="#cd7e15"/>` +
      `<path d="M${cx - 9} ${ey - 10}L${cx - 9} ${ey}" stroke="#fff7c4" stroke-width="2"/></g>` +
      `<path d="${ECU}" fill="none" stroke="${INK}" stroke-width="2"/>` +
      `<path d="M${cx - 7} ${ey - 8}L${cx + 7} ${ey + 8}M${cx + 7} ${ey - 8}L${cx - 7} ${ey + 8}" stroke="${INK}" stroke-width="4.2"/>` +
      `<path d="M${cx - 7} ${ey - 8}L${cx + 7} ${ey + 8}M${cx + 7} ${ey - 8}L${cx - 7} ${ey + 8}" stroke="#eef2fa" stroke-width="2"/>` +
      `<path d="M${cx - 6} ${ey + 3}L${cx - 2} ${ey + 7}M${cx + 6} ${ey + 3}L${cx + 2} ${ey + 7}" stroke="${INK}" stroke-width="2.4"/>`;
    // tringle
    g += `<path d="M${cx - 28} 18H${cx + 28}V25H${cx - 28}Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="2"/><path d="M${cx - 26} 20H${cx + 10}" stroke="#fff7c4" stroke-width="1.4"/>` +
      `<circle cx="${cx - 30}" cy="21.5" r="4.4" fill="url(#${P}or)" stroke="${INK}" stroke-width="2"/><circle cx="${cx + 30}" cy="21.5" r="4.4" fill="url(#${P}or)" stroke="${INK}" stroke-width="2"/>`;
    // gland
    g += `<path d="M${cx} 182V198" stroke="${INK}" stroke-width="2"/><path d="M${cx - 3} 196H${cx + 3}L${cx + 4} 206H${cx - 4}Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="1.6"/>`;
    return g;
  }
  d += banniere(80) + banniere(310);

  // sol
  d += `<rect x="0" y="252" width="${SW}" height="${SH - 252}" fill="url(#${P}sol)"/>`;
  let tiles = '';
  [262, 275, 292, 315, 346, 388, 444].forEach(y => tiles += `M0 ${y}H${SW}`);
  for (let k = -6; k <= 6; k++) { const xb = 195 + k * 120, xt = 195 + (xb - 195) * (252 - 120) / (SH - 120); tiles += `M${xt.toFixed(1)} 252L${xb} ${SH}`; }
  d += `<path d="${tiles}" fill="none" stroke="#1a1342" stroke-width="1.6"/>`;
  d += `<ellipse cx="195" cy="300" rx="190" ry="64" fill="url(#${P}flaque)"/>`;
  // tapis rouge
  d += `<path d="M176 252H214L300 448H90Z" fill="url(#${P}tapis)"/>` +
    `<path d="M181 252L101 448M209 252L289 448" stroke="#f7bc2a" stroke-width="2.6"/><path d="M184 252L107 448M206 252L283 448" stroke="#5e0f24" stroke-width="1.2"/>` +
    `<path d="M176 252L90 448M214 252L300 448" stroke="${INK}" stroke-width="2"/>`;
  // plinthe
  d += `<path d="M0 246H${SW}V256H0Z" fill="#251c5a"/><path d="M0 246H${SW}M0 256H${SW}" stroke="${INK}" stroke-width="2"/><path d="M0 248.6H${SW}" stroke="#4a3f92" stroke-width="1.4"/>`;

  // colonnes avant (bords)
  function colonne(x0, x1) {
    const w = x1 - x0, id = `${P}col${x0}`;
    const FUT = `M${x0} 60H${x1}V386H${x0}Z`;
    defs += `<clipPath id="${id}"><path d="${FUT}"/></clipPath>`;
    let g = `<path d="${FUT}" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
    g += `<g clip-path="url(#${id})"><rect x="${x0}" y="58" width="${w}" height="330" fill="#4f4690"/>` +
      `<rect x="${x0 + w * 0.08}" y="58" width="${w * 0.22}" height="330" fill="#6e65b2"/><rect x="${x0 + w * 0.13}" y="58" width="${w * 0.07}" height="330" fill="#8f87cf"/>` +
      `<rect x="${x0 + w * 0.66}" y="58" width="${w * 0.34}" height="330" fill="#3a3277"/><rect x="${x0 + w * 0.86}" y="58" width="${w * 0.14}" height="330" fill="#2a235f"/>` +
      [0.38, 0.55, 0.74].map(f => `<path d="M${x0 + w * f} 70V378" stroke="#2f2866" stroke-width="2"/><path d="M${x0 + w * f - 2} 70V378" stroke="#6a62ad" stroke-width="1"/>`).join('') +
      `<path d="M${x0} 60H${x1}V70H${x0}Z" fill="#2a235f"/></g><path d="${FUT}" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    // chapiteau
    const CH = `M${x0 - 8} 36H${x1 + 8}V46H${x1 + 4}C${x1 + 2} 54 ${x1} 58 ${x1} 62H${x0}C${x0} 58 ${x0 - 2} 54 ${x0 - 4} 46H${x0 - 8}Z`;
    defs += `<clipPath id="${id}c"><path d="${CH}"/></clipPath>`;
    g += `<path d="${CH}" fill="${INK}" stroke="${INK}" stroke-width="6"/><g clip-path="url(#${id}c)"><rect x="${x0 - 9}" y="35" width="${w + 18}" height="28" fill="#5e55a2"/>` +
      `<rect x="${x0 - 9}" y="46" width="${w + 18}" height="18" fill="#433a86"/><rect x="${x0 + w * 0.7}" y="35" width="${w}" height="30" fill="#2f2866"/><path d="M${x0 - 6} 38.4H${x0 + w * 0.6}" stroke="#9a92d8" stroke-width="1.6"/></g>` +
      `<path d="${CH}" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="M${x0 - 4} 46H${x1 + 4}" stroke="${INK}" stroke-width="2"/>`;
    // anneau doré
    g += `<path d="M${x0} 62H${x1}V69H${x0}Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="2"/><path d="M${x0 + w * 0.65} 62H${x1}V69H${x0 + w * 0.65}Z" fill="#cd7e15"/><path d="M${x0} 62H${x1}V69H${x0}Z" fill="none" stroke="${INK}" stroke-width="2"/>`;
    // base
    const BA = `M${x0 - 4} 380H${x1 + 4}V392H${x1 + 10}V408H${x0 - 10}V392H${x0 - 4}Z`;
    defs += `<clipPath id="${id}b"><path d="${BA}"/></clipPath>`;
    g += `<path d="${BA}" fill="${INK}" stroke="${INK}" stroke-width="6"/><g clip-path="url(#${id}b)"><rect x="${x0 - 11}" y="379" width="${w + 22}" height="30" fill="#544b98"/>` +
      `<rect x="${x0 + w * 0.7}" y="379" width="${w}" height="30" fill="#352d72"/><rect x="${x0 - 11}" y="392" width="${w + 22}" height="17" fill="#3e3580"/><path d="M${x0 - 2} 383H${x0 + w * 0.6}" stroke="#8f87cf" stroke-width="1.6"/></g>` +
      `<path d="${BA}" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="M${x0 - 4} 392H${x1 + 4}" stroke="${INK}" stroke-width="2"/>`;
    return g;
  }
  // torche murale
  function torche(x, y, dir) {
    let g = `<circle cx="${x}" cy="${y - 20}" r="34" fill="url(#${P}feu)"/>`;
    g += `<path d="M${x - dir * 14} ${y + 12}L${x} ${y + 2}" stroke="${INK}" stroke-width="6"/><path d="M${x - dir * 14} ${y + 12}L${x} ${y + 2}" stroke="#cd7e15" stroke-width="2.6"/>`;
    g += `<path d="M${x - 8} ${y - 4}H${x + 8}L${x + 5} ${y + 6}H${x - 5}Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="2.2"/><path d="M${x + 2} ${y - 4}H${x + 8}L${x + 5} ${y + 6}H${x + 1}Z" fill="#cd7e15"/><path d="M${x - 8} ${y - 4}H${x + 8}L${x + 5} ${y + 6}H${x - 5}Z" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
    const FL = `M${x} ${y - 34}C${x + 3} ${y - 26} ${x + 10} ${y - 20} ${x + 9} ${y - 11}C${x + 8} ${y - 5} ${x + 4} ${y - 3} ${x} ${y - 3}C${x - 5} ${y - 3} ${x - 9} ${y - 6} ${x - 9} ${y - 12}C${x - 9} ${y - 18} ${x - 4} ${y - 20} ${x - 3} ${y - 26}C${x - 1} ${y - 24} ${x} ${y - 28} ${x} ${y - 34}Z`;
    g += `<path d="${FL}" fill="url(#${P}flamme)" stroke="${INK}" stroke-width="2.4"/>`;
    g += `<path d="M${x} ${y - 20}C${x + 3} ${y - 15} ${x + 4} ${y - 10} ${x + 1} ${y - 7}C${x - 3} ${y - 7} ${x - 4} ${y - 11} ${x - 2} ${y - 14}Z" fill="#fffbe0"/>`;
    return g;
  }
  d += colonne(-14, 40) + colonne(350, 404);
  d += torche(56, 168, 1) + torche(334, 168, -1);

  // socle lumineux
  d += `<ellipse cx="195" cy="352" rx="190" ry="58" fill="url(#${P}socle-lueur)"/>`;
  d += `<path d="M89 334L140 40H250L301 334Z" fill="url(#${P}colonne)"/>`;
  // marche basse
  const LT = 'M63 350A132 27 0 0 1 327 350V364A132 27 0 0 1 63 364Z';
  defs += `<clipPath id="${P}marche"><path d="${LT}"/></clipPath>`;
  d += `<path d="${LT}" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
  d += `<g clip-path="url(#${P}marche)"><rect x="60" y="320" width="270" height="76" fill="#3d3484"/>` +
    `<path d="M240 340H330V396H262C266 380 262 360 240 340Z" fill="#2a2362"/>` +
    `<ellipse cx="195" cy="350" rx="132" ry="27" fill="#5b52a6"/><path d="M262 330A132 27 0 0 1 327 350C300 362 270 368 240 371C262 360 270 345 262 330Z" fill="#463d8e"/>` +
    `<path d="M63 364A132 27 0 0 0 327 364" fill="none" stroke="#6a60b0" stroke-width="2"/>` +
    `<path d="M80 343A118 22 0 0 1 150 326" fill="none" stroke="#8f87cf" stroke-width="2"/>` +
    `</g><path d="${LT}" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="M63 350A132 27 0 0 0 327 350" fill="none" stroke="${INK}" stroke-width="2"/>`;
  d += `<ellipse cx="195" cy="350" rx="122" ry="23.5" fill="none" stroke="#f7bc2a" stroke-width="2"/>`;
  // plateau supérieur
  const UT = 'M89 334A106 21 0 0 1 301 334V347A106 21 0 0 1 89 347Z';
  defs += `<clipPath id="${P}plateau"><path d="${UT}"/></clipPath>`;
  d += `<path d="${UT}" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
  d += `<g clip-path="url(#${P}plateau)"><rect x="86" y="310" width="218" height="62" fill="url(#${P}or-h)"/>` +
    `<path d="M89 345A106 21 0 0 0 301 345V372H89Z" fill="#cd7e15"/><path d="M230 350C260 352 285 348 301 342V372H220Z" fill="#8f4c0a"/>` +
    `<path d="M94 350A106 21 0 0 0 200 368.5" fill="none" stroke="#ffd65a" stroke-width="1.6"/>` +
    [110, 140, 170, 200, 230, 260, 288].map(x => `<circle cx="${x}" cy="${347 + Math.sqrt(Math.max(0, 1 - ((x - 195) / 106) ** 2)) * 21 - 6.5}" r="2" fill="#fff7c4" stroke="${INK}" stroke-width="1.2"/>`).join('') +
    `<ellipse cx="195" cy="334" rx="106" ry="21" fill="url(#${P}socle-dessus)"/>` +
    `</g><path d="${UT}" fill="none" stroke="${INK}" stroke-width="2.6"/><ellipse cx="195" cy="334" rx="106" ry="21" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
  // cercle de runes
  d += `<ellipse cx="195" cy="334" rx="88" ry="16.5" fill="none" stroke="#ffffff" stroke-width="1.6"/><ellipse cx="195" cy="334" rx="74" ry="13" fill="none" stroke="#e9a024" stroke-width="1.4"/>`;
  let runes = '';
  for (let i = 0; i < 12; i++) { const t = (i + 0.5) / 12 * Math.PI * 2, x = 195 + Math.cos(t) * 81, y = 334 + Math.sin(t) * 14.8; runes += `<path d="M${x.toFixed(1)} ${(y - 2.6).toFixed(1)}L${(x + 2.6).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y + 2.6).toFixed(1)}L${(x - 2.6).toFixed(1)} ${y.toFixed(1)}Z" fill="#fffbe6" stroke="#cd7e15" stroke-width="1"/>`; }
  d += runes;
  return { defs, d };
}

// ---------- premier plan de la scène (au-dessus du héros) ----------
function avantPlan() {
  const P = 'ac-ap-';
  let d = '';
  const sp = [[48, 238, 4.5, '#fff7c4'], [96, 124, 3.4, '#ffffff'], [292, 96, 4.2, '#fff7c4'], [330, 232, 3.2, '#ffffff'], [262, 300, 3, '#ffe168'], [118, 296, 3.6, '#ffffff'], [150, 60, 2.6, '#ffffff'], [244, 168, 2.4, '#ffffff'], [70, 318, 2.6, '#ffe168'], [318, 300, 2.2, '#ffffff']];
  d += sp.map(([x, y, r, c]) => I.sparkNo(x, y, r, c)).join('');
  const dots = [[60, 190, 1.6], [128, 230, 1.2], [276, 214, 1.5], [300, 150, 1.2], [104, 86, 1.3], [226, 270, 1.2], [168, 286, 1.4], [342, 268, 1.3]];
  d += dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff3c4"/>`).join('');
  d += `<rect x="0" y="0" width="${SW}" height="${SH}" fill="url(#ac-sa-vignette)"/>`;
  d += `<rect x="0" y="372" width="${SW}" height="${SH - 372}" fill="url(#ac-sa-fondu)"/>`;
  return d;
}

// ---------- éléments d'interface ----------
const ribbonSvg = () => svg('0 0 280 52', (() => {
  const P = 'ac-ru-';
  const BAND = 'M34 8Q140 1 246 8L246 38Q140 31 34 38Z';
  const TL = 'M4 15H46V45H4L15 30Z', TR = 'M276 15H234V45H276L265 30Z';
  return `<defs><linearGradient id="${P}rouge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6d60"/><stop offset="0.4" stop-color="#e3343d"/><stop offset="1" stop-color="#a81d35"/></linearGradient><clipPath id="${P}bande"><path d="${BAND}"/></clipPath><clipPath id="${P}qg"><path d="${TL}"/></clipPath><clipPath id="${P}qd"><path d="${TR}"/></clipPath></defs>` +
    `<g stroke-linejoin="round" stroke-linecap="round"><g fill="${INK}" stroke="${INK}" stroke-width="6"><path d="${TL}"/><path d="${TR}"/><path d="${BAND}"/></g>` +
    `<g clip-path="url(#${P}qg)"><rect x="3" y="14" width="44" height="32" fill="#a81d35"/><path d="M3 34H47V46H3Z" fill="#6e1129"/><path d="M8 19H40" stroke="#e3343d" stroke-width="2"/></g><path d="${TL}" fill="none" stroke="${INK}" stroke-width="2.6"/>` +
    `<g clip-path="url(#${P}qd)"><rect x="233" y="14" width="44" height="32" fill="#a81d35"/><path d="M233 34H277V46H233Z" fill="#6e1129"/><path d="M240 19H272" stroke="#e3343d" stroke-width="2"/></g><path d="${TR}" fill="none" stroke="${INK}" stroke-width="2.6"/>` +
    `<path d="M34 38L46 45V36Z" fill="#4a0b1c" stroke="${INK}" stroke-width="2.2"/><path d="M246 38L234 45V36Z" fill="#4a0b1c" stroke="${INK}" stroke-width="2.2"/>` +
    `<g clip-path="url(#${P}bande)"><rect x="32" y="0" width="216" height="40" fill="url(#${P}rouge)"/>` +
    `<path d="M34 12.5Q140 5.5 246 12.5" fill="none" stroke="#f7bc2a" stroke-width="2.4"/><path d="M34 34Q140 27 246 34" fill="none" stroke="#f7bc2a" stroke-width="2.4"/>` +
    `<path d="M34 14.2Q140 7.2 246 14.2M34 35.8Q140 28.8 246 35.8" fill="none" stroke="#6e1129" stroke-width="1"/>` +
    `<path d="M44 9.6Q120 4.6 170 5.6" fill="none" stroke="#ffb3a8" stroke-width="1.6"/></g>` +
    `<path d="${BAND}" fill="none" stroke="${INK}" stroke-width="2.8"/>` +
    I.spark(28, 10, 5, '#ffffff', 1.2) + `</g>`;
})(), 'position:absolute;inset:0;width:100%;height:100%');

function levelBadge(size = 30) {
  const P = 'ac-nv-';
  const HEX = 'M16 1.8L28.5 8.8V23.2L16 30.2L3.5 23.2V8.8Z', IN = 'M16 6L24.8 11V21L16 26L7.2 21V11Z';
  return svg('0 0 32 32', `<defs><linearGradient id="${P}or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.45" stop-color="#f7bc2a"/><stop offset="1" stop-color="#b8680f"/></linearGradient><linearGradient id="${P}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6d60"/><stop offset="0.5" stop-color="#e3343d"/><stop offset="1" stop-color="#8a1830"/></linearGradient></defs>` +
    `<g stroke-linejoin="round"><path d="${HEX}" fill="url(#${P}or)" stroke="${INK}" stroke-width="2.4"/><path d="M16 1.8L28.5 8.8V23.2L16 30.2Z" fill="#cd7e15" opacity="0.45"/><path d="${IN}" fill="url(#${P}r)" stroke="#6e1129" stroke-width="1.4"/><path d="M6 10.5L16 4.6" stroke="#fffbe0" stroke-width="1.2"/></g>`, `width:${size}px;height:${size}px`);
}

function chip(icon, value, label) {
  return `<div role="img" aria-label="${label} : ${value}" style="position:relative;display:flex;align-items:center;height:24px;padding:0 11px 0 27px;border-radius:12px;background:linear-gradient(180deg,#0f0a28 0%,#221a56 100%);box-shadow:inset 0 2px 3px rgba(0,0,0,0.6),0 0 0 2px ${INK},0 1px 0 3px rgba(255,214,90,0.28)">` +
    `<div style="position:absolute;left:-7px;top:-5px;width:33px;height:33px">${icon}</div>` +
    `<span style="${TITLE};font-size:16px;line-height:1;color:#ffffff;letter-spacing:0.3px;${outline(1.2, INK, 0.8)}">${value}</span></div>`;
}

function iconButton(label, iconSvg) {
  return `<button aria-label="${label}" style="${btnReset};width:44px;height:44px;padding:3px;border-radius:13px;background:${GOLD};box-shadow:0 0 0 2px ${INK},0 4px 0 2px ${INK},0 8px 12px rgba(8,4,28,0.5);flex:none">` +
    `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:10px;background:linear-gradient(180deg,#6a5ad6 0%,#4433a8 50%,#2c2078 100%);box-shadow:inset 0 0 0 1.5px ${INK},inset 0 3px 0 rgba(255,255,255,0.28),inset 0 -4px 0 rgba(10,4,40,0.35)">${iconSvg}</span></button>`;
}

function statCard(icon, label, value, tint, medal) {
  return `<div style="flex:1;height:68px;border-radius:15px;padding:2.5px;background:${GOLD_D};${bevel}">` +
    `<div style="position:relative;height:100%;box-sizing:border-box;border-radius:12.5px;overflow:hidden;background:linear-gradient(180deg,#3a2e8c 0%,#271e6a 55%,#1c1550 100%);box-shadow:inset 0 0 0 1.5px ${INK},inset 0 3px 0 rgba(255,255,255,0.16);display:flex;align-items:center;gap:6px;padding:0 6px 0 5px">` +
    `<div style="position:absolute;left:0;right:0;top:0;height:46%;background:linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0))"></div>` +
    `<div style="position:relative;flex:none;width:40px;height:40px;border-radius:50%;background:${medal};box-shadow:inset 0 0 0 2px ${INK},inset 0 -4px 0 rgba(0,0,0,0.25),0 2px 0 rgba(0,0,0,0.3)"><div style="position:absolute;left:1px;top:0px;width:38px;height:38px">${icon}</div></div>` +
    `<div style="position:relative;display:flex;flex-direction:column;gap:1px;min-width:0">` +
    `<span style="${TXT};font-weight:900;font-size:11px;line-height:1.1;white-space:nowrap;color:${tint};letter-spacing:0.2px">${label}</span>` +
    `<span style="${TITLE};font-size:22px;line-height:1.05;white-space:nowrap;color:#ffffff;${outline(1.4, INK, 1)}">${value}</span></div></div></div>`;
}

function rosterItem(heroSvg, name, bg, selected) {
  const ring = selected ? GOLD : STEEL;
  const size = selected ? 64 : 58;
  return `<button aria-label="${name}, niveau 30${selected ? ', sélectionné' : ''}" aria-pressed="${selected}" style="${btnReset};background:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:7px;width:74px">` +
    `<span style="position:relative;display:block;width:${size}px;height:${size}px;border-radius:50%;padding:${selected ? 4 : 3}px;box-sizing:border-box;background:${ring};box-shadow:0 0 0 2px ${INK},0 3px 0 2px ${INK}${selected ? ',0 0 18px 4px rgba(255,200,70,0.55)' : ',0 6px 10px rgba(8,4,28,0.45)'}">` +
    `<span style="display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;background:${bg};box-shadow:0 0 0 2px ${INK}">${heroSvg}</span>` +
    (selected ? `<span style="position:absolute;right:-5px;top:-4px;width:22px;height:22px;border-radius:50%;background:linear-gradient(180deg,#8ff06a,#3fae3a 55%,#257a2a);box-shadow:0 0 0 2px ${INK},inset 0 2px 0 rgba(255,255,255,0.45);display:flex;align-items:center;justify-content:center">${svg('0 0 16 16', `<path d="M3.5 8.4L6.7 11.4L12.6 4.6" fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 8.4L6.7 11.4L12.6 4.6" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`, 'width:15px;height:15px')}</span>` : '') +
    `<span style="position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);white-space:nowrap;padding:2px 7px 2px;border-radius:9px;background:linear-gradient(180deg,#2c2270,#17113f);box-shadow:0 0 0 1.5px ${INK},0 0 0 3px ${selected ? '#f7bc2a' : '#8a95b2'};${TITLE};font-size:11px;line-height:1;color:#ffffff;${outline(1, INK, 0.5)}">Niv. 30</span></span>` +
    `<span style="margin-top:6px;${TXT};font-weight:900;font-size:12px;line-height:1;color:${selected ? '#ffd65a' : '#cfc9f2'};${outline(1, INK, 0.6)}">${name}</span></button>`;
}

function navItem(label, iconSvg, active, badge) {
  if (active) {
    return `<button aria-label="${label}" aria-current="page" style="${btnReset};position:relative;flex:1.25;align-self:flex-end;height:86px;margin-bottom:5px;padding:3px;border-radius:16px;background:${GOLD};box-shadow:0 0 0 2px ${INK},0 4px 0 2px ${INK},0 0 22px 4px rgba(255,190,60,0.45)">` +
      `<span style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;width:100%;height:100%;box-sizing:border-box;padding-bottom:7px;border-radius:13px;overflow:hidden;background:radial-gradient(circle at 50% 38%,#ff7a5a 0%,#d8343e 40%,#8a1830 78%,#5e0f24 100%);box-shadow:inset 0 0 0 1.5px ${INK},inset 0 3px 0 rgba(255,255,255,0.3)">` +
      `<span style="position:absolute;left:50%;top:6px;width:64px;height:64px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,240,180,0.75) 0%,rgba(255,200,90,0.3) 45%,rgba(255,200,90,0) 70%)"></span>` +
      `<span style="position:relative;display:block;width:48px;height:48px">${iconSvg}</span>` +
      `<span style="position:relative;${TITLE};font-size:14px;line-height:1;color:#fff3b0;${outline(1.3, INK, 1)}">${label}</span></span></button>`;
  }
  return `<button aria-label="${label}${badge ? `, ${badge} nouveaux` : ''}" style="${btnReset};position:relative;flex:1;height:80px;padding:0 0 9px;background:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px">` +
    `<span style="position:relative;display:block;width:41px;height:41px">${iconSvg}` +
    (badge ? `<span style="position:absolute;right:-9px;top:-7px;min-width:20px;height:20px;padding:0 3px;box-sizing:border-box;border-radius:10px;background:linear-gradient(180deg,#ff7a6a,#e3343d 55%,#a81d35);box-shadow:0 0 0 2px ${INK},inset 0 2px 0 rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;${TITLE};font-size:13px;line-height:1;color:#ffffff;${outline(1, INK, 0.5)}">${badge}</span>` : '') +
    `</span><span style="${TXT};font-weight:900;font-size:11.5px;line-height:1;color:#c9c2f0;${outline(1, INK, 0.6)}">${label}</span></button>`;
}

// ---------- assemblage ----------
function build() {
  for (const k in copies) delete copies[k];
  const dec = decor();
  const stageBg = svg(`0 0 ${SW} ${SH}`, `<defs>${dec.defs}</defs><g stroke-linejoin="round" stroke-linecap="round">${dec.d}</g>`, 'position:absolute;left:0;top:0;width:390px;height:448px');
  const stageFg = svg(`0 0 ${SW} ${SH}`, avantPlan(), 'position:absolute;left:0;top:0;width:390px;height:448px;pointer-events:none');
  // héros en grand : 240x300 à l'échelle 1.04 -> 250x312.5 ; corps (x=120) centré sur 195, pieds (y=292) sur le socle (y=331)
  const heroBig = art('guerrier', { style: 'position:absolute;left:70px;top:27px;width:250px;height:312.5px' });
  const portrait = art('guerrier', { vb: '48 28 160 160', style: 'width:100%;height:100%' });

  const header =
    `<header style="position:relative;z-index:5;flex:none;height:86px;box-sizing:border-box;padding:0 12px;display:flex;align-items:center;gap:12px;background:linear-gradient(180deg,#352a7c 0%,#241b5c 55%,#1a1346 100%);box-shadow:0 2px 0 ${INK},0 10px 18px rgba(8,4,28,0.6)">` +
    `<div style="position:absolute;left:0;right:0;top:0;height:1.5px;background:rgba(255,255,255,0.18)"></div>` +
    `<div style="position:absolute;left:0;right:0;bottom:-1px;height:3px;background:linear-gradient(90deg,#8f4c0a 0%,#f7bc2a 18%,#fff3b0 50%,#f7bc2a 82%,#8f4c0a 100%)"></div>` +
    // portrait
    `<div style="position:relative;flex:none;width:66px;height:66px">` +
    `<div style="width:66px;height:66px;box-sizing:border-box;border-radius:50%;padding:4px;background:${GOLD_D};box-shadow:0 0 0 2.5px ${INK},0 4px 0 2px ${INK},0 8px 12px rgba(8,4,28,0.5)">` +
    `<div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 42% 34%,#ff7a6a 0%,#d22f3c 45%,#6e1129 100%);box-shadow:0 0 0 2px ${INK}">${portrait}</div></div>` +
    `<div style="position:absolute;right:-9px;bottom:-8px;width:32px;height:32px">${levelBadge(32)}<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;${TITLE};font-size:14px;line-height:1;padding-top:1px;color:#ffffff;${outline(1.2, INK, 0.6)}">30</span></div></div>` +
    // nom + monnaies
    `<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:9px;padding-top:2px">` +
    `<div style="display:flex;align-items:center;gap:7px">` +
    `<span style="${TITLE};font-size:24px;line-height:1;color:#ffffff;letter-spacing:0.3px;${outline(1.6, INK, 1.6)}">Simon</span>` +
    `<span style="${TXT};font-weight:900;font-size:10.5px;line-height:1;letter-spacing:0.6px;text-transform:uppercase;color:#ffffff;padding:3px 7px 3px;border-radius:7px;background:linear-gradient(180deg,#ff6d60,#e3343d 50%,#a81d35);box-shadow:0 0 0 1.5px ${INK},inset 0 1.5px 0 rgba(255,255,255,0.35);${outline(0.8, '#6e1129', 0.4)}">Guerrier</span></div>` +
    `<div style="display:flex;gap:16px;padding-left:6px">` + chip(art('ui/flouze', { style: 'width:100%;height:100%' }), '1&#160;240', 'Flouze') + chip(art('ui/clef', { style: 'width:100%;height:100%' }), '12', 'Clefs') + `</div></div>` +
    // boutons
    `<div style="display:flex;gap:9px;flex:none;align-self:center">` +
    iconButton('Tchat', svg('0 0 32 32', I.tchat(), 'width:27px;height:27px')) +
    iconButton('Réglages', svg('0 0 32 32', I.engrenage(), 'width:28px;height:28px')) + `</div>` +
    `</header>`;

  const stage =
    `<section aria-label="Héros sélectionné : Guerrier" style="position:relative;flex:none;height:448px;overflow:hidden">` +
    stageBg + heroBig + stageFg +
    // ruban
    `<div style="position:absolute;left:55px;top:362px;width:280px;height:52px">${ribbonSvg()}` +
    `<div style="position:absolute;left:0;right:0;top:9px;display:flex;justify-content:center;align-items:baseline;gap:7px;${TITLE};font-size:19px;line-height:1;color:#ffffff;${outline(1.5, '#4a0b1c', 1.4)}"><span>Guerrier</span><span style="display:block;width:7px;height:7px;align-self:center;transform:rotate(45deg);background:#ffd65a;box-shadow:0 0 0 1.5px #4a0b1c"></span><span>Niv. 30</span></div></div>` +
    // barre d'XP
    `<div style="position:absolute;left:28px;right:28px;top:418px;height:24px;border-radius:12px;padding:2.5px;box-sizing:border-box;background:${GOLD};box-shadow:0 0 0 2px ${INK},0 3px 0 2px ${INK},0 6px 10px rgba(0,0,0,0.5)">` +
    `<div style="position:relative;width:100%;height:100%;border-radius:10px;overflow:hidden;background:linear-gradient(180deg,#0b0722,#1d1650);box-shadow:inset 0 0 0 1.5px ${INK},inset 0 3px 4px rgba(0,0,0,0.6)">` +
    `<div style="position:absolute;left:1.5px;top:1.5px;bottom:1.5px;width:71.8%;border-radius:8.5px;background:linear-gradient(180deg,#e2fdff 0%,#7cecff 22%,#28c3f0 55%,#1784d6 85%,#1a5fb0 100%);box-shadow:inset 0 0 0 1.5px #0c4c8c">` +
    `<div style="position:absolute;inset:0;border-radius:8.5px;background:repeating-linear-gradient(115deg,rgba(255,255,255,0.18) 0 6px,rgba(255,255,255,0) 6px 13px)"></div>` +
    `<div style="position:absolute;left:5px;right:6px;top:2px;height:4px;border-radius:3px;background:rgba(255,255,255,0.65)"></div></div>` +
    `<div style="position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;${TITLE};font-size:13.5px;line-height:1;color:#ffffff;letter-spacing:0.4px;${outline(1.2, INK, 0.6)}">XP 826 / 1&#160;150</div></div>` +
    `<div style="position:absolute;left:calc(71.8% - 12px);top:-9px;width:30px;height:30px">${svg('0 0 30 30', `<defs><radialGradient id="ac-xp-lueur"><stop offset="0" stop-color="#f0ffff" stop-opacity="0.9"/><stop offset="0.45" stop-color="#8ff5ff" stop-opacity="0.5"/><stop offset="1" stop-color="#8ff5ff" stop-opacity="0"/></radialGradient></defs><circle cx="15" cy="15" r="15" fill="url(#ac-xp-lueur)"/>${I.sparkNo(15, 15, 8, '#ffffff')}`, 'width:30px;height:30px')}</div>` +
    `</div>` +
    `</section>`;

  const medal = c => `radial-gradient(circle at 40% 32%,${c[0]} 0%,${c[1]} 55%,${c[2]} 100%)`;
  const stats =
    `<div style="display:flex;gap:9px">` +
    statCard(art('ui/eclair', { style: 'width:100%;height:100%' }), 'Puissance', '2&#160;020', '#ffd65a', medal(['#6a4fd0', '#3f2c9c', '#211565'])) +
    statCard(art('ui/coeur', { style: 'width:100%;height:100%' }), 'Vie', '572', '#ff9a8e', medal(['#6a4fd0', '#3f2c9c', '#211565'])) +
    statCard(art('ui/epee', { style: 'width:100%;height:100%' }), 'Victoires', '48', '#9fd8ff', medal(['#6a4fd0', '#3f2c9c', '#211565'])) +
    `</div>`;

  const heroBg = c => `radial-gradient(circle at 46% 38%,${c[0]} 0%,${c[1]} 48%,${c[2]} 100%)`;
  const roster =
    `<div style="display:flex;flex-direction:column;gap:10px">` +
    `<div style="display:flex;align-items:center;gap:10px;padding:0 4px">` +
    `<div style="flex:1;height:2px;background:linear-gradient(90deg,rgba(247,188,42,0),#f7bc2a)"></div>` +
    `<div style="width:7px;height:7px;transform:rotate(45deg);background:#ffd65a;box-shadow:0 0 0 1.5px ${INK}"></div>` +
    `<span style="${TITLE};font-size:16px;line-height:1;color:#ffd65a;letter-spacing:0.4px;${outline(1.2, INK, 1)}">Mes héros</span>` +
    `<div style="width:7px;height:7px;transform:rotate(45deg);background:#ffd65a;box-shadow:0 0 0 1.5px ${INK}"></div>` +
    `<div style="flex:1;height:2px;background:linear-gradient(90deg,#f7bc2a,rgba(247,188,42,0))"></div></div>` +
    `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:0 8px">` +
    rosterItem(art('guerrier', { vb: '48 28 160 160', style: 'width:100%;height:100%' }), 'Guerrier', heroBg(['#ff7a6a', '#d22f3c', '#6e1129']), true) +
    rosterItem(art('mage', { vb: '52 40 160 160', style: 'width:100%;height:100%' }), 'Mage', heroBg(['#c08cff', '#7d47cc', '#351868']), false) +
    rosterItem(art('archer', { vb: '50 32 160 160', style: 'width:100%;height:100%' }), 'Archer', heroBg(['#a6ec7a', '#4ea83c', '#1c4a26']), false) +
    rosterItem(art('paladin', { vb: '50 38 160 160', style: 'width:100%;height:100%' }), 'Paladin', heroBg(['#8cc4ff', '#3773d8', '#162f6c']), false) +
    `</div></div>`;

  const panel =
    `<main style="position:relative;flex:1;min-height:0;box-sizing:border-box;padding:6px 12px 0;display:flex;flex-direction:column;gap:14px;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.022) 0 1.5px,rgba(255,255,255,0) 1.5px 16px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.022) 0 1.5px,rgba(255,255,255,0) 1.5px 16px),radial-gradient(ellipse at 50% 60%,#231a58 0%,#1a1344 60%,#140e36 100%)">` +
    stats + roster + `</main>`;

  const nav =
    `<nav aria-label="Navigation principale" style="position:relative;z-index:6;flex:none;height:84px;box-sizing:border-box;padding:0 6px;display:flex;align-items:flex-end;gap:2px;background:linear-gradient(180deg,#30266f 0%,#1f1856 40%,#120d33 100%);box-shadow:0 -2px 0 ${INK},0 -10px 18px rgba(8,4,28,0.55)">` +
    `<div style="position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#8f4c0a 0%,#f7bc2a 18%,#fff3b0 50%,#f7bc2a 82%,#8f4c0a 100%)"></div>` +
    navItem('Héros', svg('0 0 64 64', `<g transform="translate(3 2) scale(0.92)">${I.casque()}</g>`, 'width:100%;height:100%'), true) +
    navItem('Coffres', art('ui/coffre', { style: 'width:100%;height:100%' }), false, '3') +
    navItem('Sac', art('ui/sac', { style: 'width:100%;height:100%' }), false) +
    navItem('Combats', svg('0 0 64 64', `<g transform="translate(32 32) scale(0.9) translate(-32 -32)"><g transform="translate(-4 4)">${art('ui/epee', { inner: true })}</g><g transform="translate(64 0) scale(-1 1)"><g transform="translate(-4 4)">${art('ui/epee', { inner: true })}</g></g></g>`, 'width:100%;height:100%'), false) +
    navItem('Social', svg('0 0 64 64', I.social(), 'width:100%;height:100%'), false) +
    navItem('Boutique', svg('0 0 64 64', I.boutique(), 'width:100%;height:100%'), false) +
    `</nav>`;

  const root = `<div style="position:relative;width:390px;height:844px;overflow:hidden;display:flex;flex-direction:column;background:#150f36;${TXT};color:#ffffff;-webkit-font-smoothing:antialiased">` +
    header + stage + panel + nav + `</div>`;

  const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fiche héros</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;800;900&display=swap" rel="stylesheet">
<style>
body{margin:0}
</style>
</helmet>
${root}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
renderVals() { return {}; }
}
</script>
</body>
</html>
`;
  return page;
}

const page = build();
if (/\{\{|\}\}/.test(page.split('<x-dc>')[1].split('</x-dc>')[0])) throw new Error('{{ ou }} présent');
for (const bad of ['<text', '<image', '<filter', '<foreignObject', '<use', 'class=', '<iframe']) if (page.includes(bad)) throw new Error('interdit : ' + bad);
fs.mkdirSync(path.join(R, 'project'), { recursive: true });
fs.writeFileSync(path.join(R, 'project/Accueil.dc.html'), page);
// copie de travail pour l'aperçu
const ap = page.replace('<x-dc>', '<div>').replace('</x-dc>', '</div>').replace('<helmet>', '').replace('</helmet>', '').replace(/<script type="text\/x-dc"[\s\S]*?<\/script>\n?/, '');
fs.writeFileSync(path.join(R, 'previews/accueil-apercu.html'), ap);
console.log('écrit', (page.length / 1024).toFixed(1) + ' Ko');
