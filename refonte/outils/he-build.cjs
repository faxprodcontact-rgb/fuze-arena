// Planche « Les héros » (galerie 1360 x 820) : génère project/Heros.dc.html + previews/heros-apercu.html
// node tools/he-build.cjs
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const INK = '#1b1530';
const W = 1360, H = 820;

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

// ---------- styles réutilisés (mêmes que la planche Accueil) ----------
const TITLE = "font-family:'Lilita One',sans-serif;font-weight:400";
const TXT = "font-family:'Nunito',sans-serif";
const outline = (w = 1.5, c = INK, drop = 1.5) => 'text-shadow:' + [[w, 0], [-w, 0], [0, w], [0, -w], [w, w], [-w, w], [w, -w], [-w, -w]].map(([x, y]) => `${x}px ${y}px 0 ${c}`).join(',') + `,0 ${w + drop}px 0 ${c}`;
const GOLD = 'linear-gradient(180deg,#fff6c9 0%,#ffd65a 24%,#f2a92a 52%,#b8680f 80%,#e9ac3c 100%)';
const GOLD_D = 'linear-gradient(160deg,#fff6c9 0%,#ffd65a 22%,#e9a024 50%,#9c560c 78%,#f2b544 100%)';
const STEEL = 'linear-gradient(160deg,#ffffff 0%,#c3cce0 35%,#8a95b2 70%,#dfe5f2 100%)';
const spark = (x, y, r, fill = '#ffffff', sw = 1.3) => { const k = r * 0.3; return `<path d="M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`; };
const sparkNo = (x, y, r, fill = '#ffffff') => { const k = r * 0.28; return `<path d="M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z" fill="${fill}"/>`; };
const gold = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.45" stop-color="#f7bc2a"/><stop offset="1" stop-color="#d98a16"/></linearGradient>`;
const steel = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#f7f9ff"/><stop offset="0.45" stop-color="#c3cce0"/><stop offset="1" stop-color="#8a95b2"/></linearGradient>`;

// ---------- classes ----------
const CLASSES = [
  { k: 'gu', file: 'guerrier', nom: 'Guerrier', role: 'Solide et brutal', c: ['#ff6d60', '#e3343d', '#a81d35', '#6e1129'], dark: '#2e0614', tint: '#ffd2cb' },
  { k: 'ma', file: 'mage', nom: 'Mage', role: 'Fragile mais dévastateur', c: ['#b57cf2', '#7d47cc', '#532b96', '#351868'], dark: '#170a33', tint: '#e6d4ff' },
  { k: 'ar', file: 'archer', nom: 'Archer', role: 'Rapide et précis', c: ['#8edc5e', '#4ea83c', '#2f7432', '#1c4a26'], dark: '#0a2112', tint: '#d9f7c4' },
  { k: 'pa', file: 'paladin', nom: 'Paladin', role: 'Chevalier sacré', c: ['#ffe168', '#f7bc2a', '#cd7e15', '#8f4c0a'], dark: '#2e1404', tint: '#fff1c2', bg: ['#eaa22a', '#b8680f', '#7a3a0a'] },
];

// ---------- emblèmes de classe (64 x 64) ----------
function piece(P, id, d, inner, sw = 2.4) {
  return { def: `<clipPath id="${P}${id}"><path d="${d}"/></clipPath>`, body: `<g clip-path="url(#${P}${id})">${inner}</g><path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}"/>` };
}
// orbe magique (mage)
function emOrbe() {
  const P = 'he-em-ma-';
  const CUP = 'M15 37C19 44 25 47.5 32 47.5C39 47.5 45 44 49 37L46 49C42 53 22 53 18 49Z';
  const BASE = 'M22 50H42L45 57C45 59 43 60 41 60H23C21 60 19 59 19 57Z';
  const cup = piece(P, 'coupe', CUP, `<rect x="14" y="36" width="36" height="18" fill="url(#${P}or)"/><path d="M36 36H50V54H34C40 50 43 44 36 36Z" fill="#cd7e15"/><path d="M18.5 41C22 45 26 46.8 30 47.2" fill="none" stroke="#fff7c4" stroke-width="1.6"/>`);
  const base = piece(P, 'base', BASE, `<rect x="18" y="49" width="28" height="12" fill="url(#${P}or)"/><path d="M36 49H46V61H34Z" fill="#cd7e15"/><path d="M22 54H46V61H22Z" fill="#cd7e15" opacity="0.6"/>`);
  return `<defs><radialGradient id="${P}lueur"><stop offset="0" stop-color="#e8ffff" stop-opacity="0.9"/><stop offset="0.45" stop-color="#8ff5ff" stop-opacity="0.5"/><stop offset="1" stop-color="#8ff5ff" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${P}orbe" cx="0.38" cy="0.36" r="0.68"><stop offset="0" stop-color="#f0ffff"/><stop offset="0.3" stop-color="#8ff5ff"/><stop offset="0.7" stop-color="#27c4ea"/><stop offset="1" stop-color="#0b78b0"/></radialGradient>` +
    gold(P + 'or') + cup.def + base.def + `</defs>` +
    `<g stroke-linejoin="round" stroke-linecap="round">` +
    `<circle cx="32" cy="27" r="29" fill="url(#${P}lueur)"/>` +
    `<g fill="${INK}" stroke="${INK}" stroke-width="5.5"><circle cx="32" cy="27" r="16"/><path d="${CUP}"/><path d="${BASE}"/></g>` +
    base.body +
    `<circle cx="32" cy="27" r="16" fill="url(#${P}orbe)"/>` +
    `<path d="M21 26C21 19 26 13.5 33 13C27.5 16 24.5 20.5 24.4 26.5Z" fill="#ffffff"/><circle cx="37" cy="15.8" r="1.7" fill="#ffffff"/>` +
    `<path d="M24 35C27 38.5 33 39.5 38 37.5" fill="none" stroke="#c8fbff" stroke-width="2"/>` +
    `<circle cx="32" cy="27" r="16" fill="none" stroke="${INK}" stroke-width="2.4"/>` +
    cup.body +
    // griffes dorées qui tiennent l'orbe
    `<path d="M15 37L11 27L18.5 33Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="2"/><path d="M49 37L53 27L45.5 33Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="2"/>` +
    `<circle cx="32" cy="44" r="2.6" fill="#7d47cc" stroke="${INK}" stroke-width="1.5"/><circle cx="31.2" cy="43.2" r="0.9" fill="#ffffff"/>` +
    spark(51, 10, 4.6, '#ffffff', 1.2) + `</g>`;
}
// flèche (archer), dessinée à l'horizontale puis tournée de -45°
function emFleche() {
  const P = 'he-em-ar-';
  const SHAFT = 'M-21 -3H14V3H-21Z';
  const HEAD = 'M10 -11L31 0L10 11L15 0Z';
  const F1 = 'M-28 -3H-11L-6 -12.5H-22Z', F2 = 'M-28 3H-11L-6 12.5H-22Z';
  const shaft = piece(P, 'fut', SHAFT, `<rect x="-22" y="-4" width="37" height="8" fill="#9a6234"/><rect x="-22" y="0.6" width="37" height="4" fill="#6b3d1f"/><path d="M-20 -1.2H12" stroke="#c98f55" stroke-width="1.4"/>`, 2.2);
  const head = piece(P, 'pointe', HEAD, `<rect x="9" y="-12" width="23" height="24" fill="url(#${P}acier)"/><path d="M9 0H32V12H9Z" fill="#9ba7c3"/><path d="M14 -6.4L26 -1" stroke="#ffffff" stroke-width="1.8"/>`, 2.4);
  const f1 = piece(P, 'plume1', F1, `<rect x="-29" y="-13.5" width="24" height="11" fill="#e3343d"/><path d="M-20 -13.5H-15.5L-17.5 -3H-22Z" fill="#ffffff"/><path d="M-26 -4.6H-12" stroke="#ff8a7e" stroke-width="1.4"/>`, 2.2);
  const f2 = piece(P, 'plume2', F2, `<rect x="-29" y="2.5" width="24" height="11" fill="#a81d35"/><path d="M-20 13.5H-15.5L-17.5 3H-22Z" fill="#dfe5f2"/>`, 2.2);
  return `<defs>${steel(P + 'acier')}${shaft.def}${head.def}${f1.def}${f2.def}</defs>` +
    `<g stroke-linejoin="round" stroke-linecap="round"><g transform="translate(31.5 32.5) rotate(-45)">` +
    `<g fill="${INK}" stroke="${INK}" stroke-width="5.5"><path d="${SHAFT}"/><path d="${HEAD}"/><path d="${F1}"/><path d="${F2}"/></g>` +
    shaft.body + f1.body + f2.body + head.body +
    `<path d="M-28 -3V3" stroke="${INK}" stroke-width="2.2"/>` +
    `</g>` + spark(50, 9, 4.6, '#ffffff', 1.2) + `</g>`;
}
function emblem(k) {
  if (k === 'gu') return art('ui/epee', { style: 'width:100%;height:100%' });
  if (k === 'pa') return art('ui/bouclier', { style: 'width:100%;height:100%' });
  if (k === 'ma') return svg('0 0 64 64', emOrbe(), 'width:100%;height:100%');
  return svg('0 0 64 64', emFleche(), 'width:100%;height:100%');
}

// ---------- socle à la couleur de la classe (300 x 96) ----------
function socle(cl) {
  const P = `he-so-${cl.k}-`, [cL, cB, cS, cD] = cl.c;
  let defs = '', d = '';
  defs += `<radialGradient id="${P}lueur"><stop offset="0" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="0.4" stop-color="${cL}" stop-opacity="0.45"/><stop offset="1" stop-color="${cB}" stop-opacity="0"/></radialGradient>`;
  defs += `<linearGradient id="${P}flanc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${cL}"/><stop offset="0.3" stop-color="${cB}"/><stop offset="0.7" stop-color="${cS}"/><stop offset="1" stop-color="${cD}"/></linearGradient>`;
  defs += `<radialGradient id="${P}dessus" cx="0.42" cy="0.4" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="0.3" stop-color="${cL}"/><stop offset="0.85" stop-color="${cB}"/><stop offset="1" stop-color="${cS}"/></radialGradient>`;
  defs += `<linearGradient id="${P}or" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.3" stop-color="#ffd65a"/><stop offset="0.65" stop-color="#e9a024"/><stop offset="1" stop-color="#8f4c0a"/></linearGradient>`;
  // halo sous le socle
  d += `<ellipse cx="150" cy="50" rx="150" ry="46" fill="url(#${P}lueur)"/>`;
  // marche basse en pierre sombre, liseré doré
  const LT = 'M26 58A124 23 0 0 1 274 58V70A124 23 0 0 1 26 70Z';
  defs += `<clipPath id="${P}marche"><path d="${LT}"/></clipPath>`;
  d += `<path d="${LT}" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
  d += `<g clip-path="url(#${P}marche)"><rect x="24" y="34" width="252" height="62" fill="#3d3484"/>` +
    `<path d="M210 60H276V96H222C230 84 226 70 210 60Z" fill="#2a2362"/>` +
    `<ellipse cx="150" cy="58" rx="124" ry="23" fill="#5b52a6"/><path d="M216 37A124 23 0 0 1 274 58C250 70 220 76 196 79C220 66 226 50 216 37Z" fill="#463d8e"/>` +
    `<path d="M26 70A124 23 0 0 0 274 70" fill="none" stroke="#f7bc2a" stroke-width="2.2"/>` +
    `<path d="M42 51A112 19 0 0 1 104 38" fill="none" stroke="#8f87cf" stroke-width="2"/>` +
    `</g><path d="${LT}" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="M26 58A124 23 0 0 0 274 58" fill="none" stroke="${INK}" stroke-width="2"/>`;
  // plateau à la couleur de la classe
  const UT = 'M46 40A104 19 0 0 1 254 40V54A104 19 0 0 1 46 54Z';
  defs += `<clipPath id="${P}plateau"><path d="${UT}"/></clipPath>`;
  d += `<path d="${UT}" fill="${INK}" stroke="${INK}" stroke-width="6"/>`;
  let rivets = '';
  for (const x of [66, 92, 120, 150, 180, 208, 234]) {
    const y = 54 + Math.sqrt(Math.max(0, 1 - ((x - 150) / 104) ** 2)) * 19 - 7;
    rivets += `<circle cx="${x}" cy="${y.toFixed(1)}" r="2.1" fill="${x < 170 ? '#fff7c4' : '#f7bc2a'}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  d += `<g clip-path="url(#${P}plateau)"><rect x="44" y="18" width="212" height="58" fill="url(#${P}flanc)"/>` +
    `<path d="M46 43A104 19 0 0 0 254 43" fill="none" stroke="url(#${P}or)" stroke-width="3.2"/>` +
    `<path d="M46 52A104 19 0 0 0 254 52" fill="none" stroke="url(#${P}or)" stroke-width="2.6"/>` +
    `<path d="M50 49A104 19 0 0 0 130 66" fill="none" stroke="${cL}" stroke-width="1.4"/>` +
    rivets +
    `<ellipse cx="150" cy="40" rx="104" ry="19" fill="url(#${P}dessus)"/>` +
    `</g><path d="${UT}" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
  // dessus : bord doré + cercle de runes
  d += `<ellipse cx="150" cy="40" rx="104" ry="19" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
  d += `<ellipse cx="150" cy="40" rx="99" ry="16.6" fill="none" stroke="#f7bc2a" stroke-width="2.2"/><ellipse cx="150" cy="40" rx="99" ry="16.6" fill="none" stroke="${INK}" stroke-width="0.8" opacity="0.5"/>`;
  d += `<ellipse cx="150" cy="40" rx="84" ry="13.4" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.85"/>`;
  let runes = '';
  for (let i = 0; i < 14; i++) {
    const t = (i + 0.5) / 14 * Math.PI * 2, x = 150 + Math.cos(t) * 91.5, y = 40 + Math.sin(t) * 15;
    runes += `<path d="M${x.toFixed(1)} ${(y - 2.4).toFixed(1)}L${(x + 2.4).toFixed(1)} ${y.toFixed(1)}L${x.toFixed(1)} ${(y + 2.4).toFixed(1)}L${(x - 2.4).toFixed(1)} ${y.toFixed(1)}Z" fill="#fffbe6" stroke="${cS}" stroke-width="0.9"/>`;
  }
  d += runes;
  return svg('0 0 300 96', `<defs>${defs}</defs><g stroke-linejoin="round" stroke-linecap="round">${d}</g>`, 'position:absolute;left:0;top:0;width:300px;height:96px');
}

// ---------- fond de carte (rayons + étincelles), 290 x 372 ----------
function fondCarte(cl) {
  const P = `he-fd-${cl.k}-`, [cL, cB] = cl.c;
  let defs = `<linearGradient id="${P}rayon" gradientUnits="userSpaceOnUse" x1="0" y1="320" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.26"/><stop offset="0.55" stop-color="${cL}" stop-opacity="0.1"/><stop offset="1" stop-color="${cL}" stop-opacity="0"/></linearGradient>`;
  defs += `<radialGradient id="${P}aura"><stop offset="0" stop-color="${cL}" stop-opacity="0.75"/><stop offset="0.5" stop-color="${cB}" stop-opacity="0.35"/><stop offset="1" stop-color="${cB}" stop-opacity="0"/></radialGradient>`;
  let d = `<ellipse cx="145" cy="190" rx="150" ry="170" fill="url(#${P}aura)"/>`;
  // rayons partant du socle
  const ox = 145, oy = 312;
  const angles = [-62, -44, -27, -10, 8, 25, 42, 60];
  d += angles.map((a, i) => {
    const w = i % 2 ? 4.5 : 7, r = 520;
    const t1 = (a - w) * Math.PI / 180, t2 = (a + w) * Math.PI / 180;
    return `<path d="M${ox} ${oy}L${(ox + Math.sin(t1) * r).toFixed(1)} ${(oy - Math.cos(t1) * r).toFixed(1)}L${(ox + Math.sin(t2) * r).toFixed(1)} ${(oy - Math.cos(t2) * r).toFixed(1)}Z" fill="url(#${P}rayon)"/>`;
  }).join('');
  // poussière lumineuse
  const dots = [[38, 70, 1.6], [252, 52, 1.4], [30, 196, 1.3], [262, 170, 1.7], [60, 262, 1.2], [236, 248, 1.3], [120, 30, 1.2], [200, 104, 1.1]];
  d += dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="0.7"/>`).join('');
  return svg('0 0 290 372', `<defs>${defs}</defs>${d}`, 'position:absolute;left:0;top:0;width:100%;height:100%');
}
function sparksCarte(k) {
  const S = {
    gu: [[258, 92, 6], [34, 236, 4.4], [246, 268, 3.6]],
    ma: [[254, 236, 5], [30, 124, 4.2], [268, 96, 3.4]],
    ar: [[30, 64, 5.4], [262, 212, 4.4], [34, 262, 3.4]],
    pa: [[34, 98, 5.4], [262, 250, 4], [40, 250, 3.4]],
  }[k];
  return svg('0 0 290 372', S.map(([x, y, r], i) => sparkNo(x, y, r, i === 1 ? '#fff7c4' : '#ffffff')).join(''), 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none');
}

// ---------- queue de ruban derrière la plaque ----------
function rubans(cl) {
  const P = `he-rb-${cl.k}-`, [, cB, cS, cD] = cl.c;
  const TL = 'M4 16H48V54H4L16 35Z', TR = 'M296 16H252V54H296L284 35Z';
  return svg('0 0 300 70', `<defs><clipPath id="${P}g"><path d="${TL}"/></clipPath><clipPath id="${P}d"><path d="${TR}"/></clipPath></defs>` +
    `<g stroke-linejoin="round" stroke-linecap="round"><g fill="${INK}" stroke="${INK}" stroke-width="6"><path d="${TL}"/><path d="${TR}"/></g>` +
    `<g clip-path="url(#${P}g)"><rect x="3" y="15" width="46" height="40" fill="${cS}"/><path d="M3 42H49V55H3Z" fill="${cD}"/><path d="M9 20.5H44" stroke="${cB}" stroke-width="2.2"/></g><path d="${TL}" fill="none" stroke="${INK}" stroke-width="2.6"/>` +
    `<g clip-path="url(#${P}d)"><rect x="251" y="15" width="46" height="40" fill="${cS}"/><path d="M251 42H297V55H251Z" fill="${cD}"/><path d="M256 20.5H291" stroke="${cB}" stroke-width="2.2"/></g><path d="${TR}" fill="none" stroke="${INK}" stroke-width="2.6"/>` +
    `<path d="M48 54L36 62V50Z" fill="${INK}"/><path d="M252 54L264 62V50Z" fill="${INK}"/>` +
    `</g>`, 'position:absolute;left:0;top:0;width:300px;height:70px');
}

// ---------- une carte de héros ----------
function carte(cl) {
  const [cL, cB, cS, cD] = cl.c;
  const [b0, b1, b2] = cl.bg || [cB, cS, cD];
  const bg = `radial-gradient(ellipse 80% 70% at 50% 58%,${b0} 0%,${b1} 38%,${b2} 70%,${cl.dark} 100%)`;
  const hero = art(cl.file, { style: 'position:absolute;left:25px;top:16px;width:240px;height:300px' });
  return `<article aria-label="${cl.nom} : ${cl.role}" style="position:relative;width:300px;height:410px;flex:none">` +
    // cadre doré biseauté
    `<div style="position:absolute;left:0;top:0;width:300px;height:376px;box-sizing:border-box;border-radius:24px;padding:5px;background:${GOLD_D};box-shadow:0 0 0 2.5px ${INK},0 6px 0 2.5px ${INK},0 18px 26px rgba(6,3,22,0.6)">` +
    `<div style="position:absolute;left:24px;right:24px;top:1.5px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.85) 20%,rgba(255,255,255,0.85) 80%,rgba(255,255,255,0))"></div>` +
    `<div style="position:relative;width:100%;height:100%;border-radius:19px;overflow:hidden;background:${bg};box-shadow:inset 0 0 0 2px ${INK},inset 0 0 0 4px rgba(255,255,255,0.10),inset 0 -40px 50px rgba(0,0,0,0.35)">` +
    fondCarte(cl) +
    // reflet vitré en haut
    `<div style="position:absolute;left:0;right:0;top:0;height:120px;background:linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0))"></div>` +
    `<div style="position:absolute;left:-5px;top:268px;width:300px;height:96px">${socle(cl)}</div>` +
    `<div style="position:absolute;left:-5px;top:0;width:300px;height:340px">${hero}</div>` +
    sparksCarte(cl.k) +
    `</div></div>` +
    // gemme au sommet du cadre
    `<div style="position:absolute;left:136px;top:-11px;width:28px;height:28px">${svg('0 0 28 28', `<defs><linearGradient id="he-gm-${cl.k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cL}"/><stop offset="0.5" stop-color="${cB}"/><stop offset="1" stop-color="${cD}"/></linearGradient></defs><g stroke-linejoin="round"><path d="M14 1.5L26.5 14L14 26.5L1.5 14Z" fill="#f7bc2a" stroke="${INK}" stroke-width="2.4"/><path d="M14 5.5L22.5 14L14 22.5L5.5 14Z" fill="url(#he-gm-${cl.k})" stroke="${INK}" stroke-width="1.6"/><path d="M14 5.5L5.5 14H14Z" fill="#ffffff" opacity="0.45"/><path d="M14 1.5L1.5 14" stroke="#fff7c4" stroke-width="1.2"/></g>`, 'width:28px;height:28px')}</div>` +
    // médaillon de classe
    `<div style="position:absolute;left:-14px;top:-14px;width:62px;height:62px;box-sizing:border-box;border-radius:50%;padding:4px;background:${GOLD_D};box-shadow:0 0 0 2.5px ${INK},0 4px 0 2px ${INK},0 8px 14px rgba(6,3,22,0.55)">` +
    `<div style="position:relative;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 40% 34%,${cL} 0%,${cB} 45%,${cD} 100%);box-shadow:inset 0 0 0 2px ${INK},inset 0 -5px 0 rgba(0,0,0,0.25),inset 0 3px 0 rgba(255,255,255,0.3)">` +
    `<div style="position:absolute;left:4px;top:3px;width:42px;height:42px">${emblem(cl.k)}</div></div></div>` +
    // plaque : nom + rôle
    `<div style="position:absolute;left:0;top:343px;width:300px;height:70px">${rubans(cl)}` +
    `<div style="position:absolute;left:36px;top:2px;width:228px;height:64px;box-sizing:border-box;border-radius:16px;padding:4px;background:${GOLD};box-shadow:0 0 0 2.5px ${INK},0 5px 0 2.5px ${INK},0 12px 18px rgba(6,3,22,0.55)">` +
    `<div style="position:relative;width:100%;height:100%;box-sizing:border-box;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,${cL} 0%,${cB} 30%,${cS} 78%,${cD} 100%);box-shadow:inset 0 0 0 2px ${INK},inset 0 3px 0 rgba(255,255,255,0.35),inset 0 -4px 0 rgba(0,0,0,0.25);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px">` +
    `<div style="position:absolute;left:6px;right:6px;top:3px;height:42%;border-radius:9px 9px 20px 20px;background:linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0))"></div>` +
    `<span style="position:relative;${TITLE};font-size:26px;line-height:1;color:#ffffff;letter-spacing:0.5px;${outline(1.8, INK, 1.8)}">${cl.nom}</span>` +
    `<span style="position:relative;${TXT};font-weight:900;font-size:14px;line-height:1.1;color:${cl.tint};${outline(1.1, INK, 0.6)}">${cl.role}</span>` +
    `</div></div></div>` +
    `</article>`;
}

// ---------- en-tête ----------
function titre() {
  const orn = dir => `<div style="display:flex;align-items:center;gap:8px;${dir < 0 ? 'flex-direction:row-reverse' : ''}">` +
    `<div style="width:9px;height:9px;transform:rotate(45deg);background:#ffd65a;box-shadow:0 0 0 2px ${INK}"></div>` +
    `<div style="width:150px;height:3px;border-radius:2px;background:linear-gradient(${dir < 0 ? 270 : 90}deg,#fff3b0,#f7bc2a 40%,rgba(247,188,42,0));box-shadow:0 1.5px 0 rgba(27,21,48,0.8)"></div></div>`;
  const big = `${TITLE};font-size:60px;line-height:1;letter-spacing:1px;white-space:nowrap`;
  return `<header style="position:absolute;left:0;top:13px;width:${W}px;display:flex;flex-direction:column;align-items:center;gap:5px">` +
    `<div style="display:flex;align-items:center;gap:10px;${TXT};font-weight:900;font-size:13px;line-height:1;letter-spacing:3.5px;text-transform:uppercase;color:#ffd65a;${outline(1, INK, 0.5)}">` +
    `<span>Fuze Arena</span><span style="display:block;width:5px;height:5px;transform:rotate(45deg);background:#ffd65a"></span><span style="color:#cfc6ff">Proposition de refonte</span></div>` +
    `<div style="display:flex;align-items:center;gap:22px">${orn(-1)}` +
    `<h1 style="position:relative;margin:0;${big}">` +
    `<span style="display:block;color:${INK};${outline(3.2, INK, 4)}">Les héros</span>` +
    `<span style="position:absolute;left:0;top:0;display:block;background:linear-gradient(180deg,#fffbe6 0%,#ffe27a 34%,#f7bc2a 58%,#d98a16 82%,#ffcf5a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent">Les héros</span>` +
    `</h1>${orn(1)}</div>` +
    `<p style="margin:2px 0 0;${TXT};font-weight:800;font-size:18px;line-height:1.2;color:#ddd6ff;${outline(1, INK, 0.6)}">Quatre classes, quatre façons de gagner l'arène : choisis ton champion.</p>` +
    `</header>`;
}

// ---------- bande « Avant → Après » ----------
function avantApres() {
  const fleche = svg('0 0 72 52', `<defs><linearGradient id="he-aa-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.45" stop-color="#f7bc2a"/><stop offset="1" stop-color="#d98a16"/></linearGradient><clipPath id="he-aa-c"><path d="M6 18H38V6L66 26L38 46V34H6Z"/></clipPath></defs>` +
    `<g stroke-linejoin="round" stroke-linecap="round"><path d="M6 18H38V6L66 26L38 46V34H6Z" fill="${INK}" stroke="${INK}" stroke-width="7"/>` +
    `<g clip-path="url(#he-aa-c)"><rect x="4" y="4" width="64" height="44" fill="url(#he-aa-or)"/><path d="M4 28H68V48H4Z" fill="#cd7e15"/><path d="M10 21.5H40M41 11.5L58 24" stroke="#fff7c4" stroke-width="2.2"/></g>` +
    `<path d="M6 18H38V6L66 26L38 46V34H6Z" fill="none" stroke="${INK}" stroke-width="2.8"/></g>` +
    sparkNo(64, 9, 4.5, '#ffffff'), 'width:72px;height:52px');
  const etiquette = (txt, sous, orBg) => `<div style="display:flex;align-items:center;gap:9px">` +
    `<span style="${TITLE};font-size:15px;line-height:1;letter-spacing:0.6px;text-transform:uppercase;color:${orBg ? INK : '#ffffff'};padding:5px 11px 4px;border-radius:9px;background:${orBg ? GOLD : STEEL};box-shadow:0 0 0 2px ${INK},0 2.5px 0 2px ${INK}${orBg ? '' : `;${outline(1, INK, 0.5)}`}">${txt}</span>` +
    `<span style="${TXT};font-weight:800;font-size:14px;line-height:1;color:#c9c2f0">${sous}</span></div>`;
  const ecrin = (inner, w, accent) => `<div style="width:${w}px;height:118px;box-sizing:border-box;border-radius:14px;padding:3px;background:${accent};box-shadow:0 0 0 2px ${INK},0 3px 0 2px ${INK}">` +
    `<div style="position:relative;width:100%;height:100%;border-radius:11px;overflow:hidden;background:#241f4f;box-shadow:inset 0 0 0 1.5px ${INK},inset 0 4px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center">${inner}</div></div>`;
  const vieux = `<div style="width:348px;height:110px;overflow:hidden;display:flex;justify-content:center">` +
    `<img src="/_blob/734e901d7b8f3a6f57b982843e67f7bf" alt="Les 4 héros actuels en pixel art" style="height: 110px; image-rendering: pixelated">` +
    `</div>`;
  const nouveaux = `<div role="img" aria-label="Les 4 héros redessinés" style="display:flex;gap:4px;align-items:center;height:112px">` +
    CLASSES.map(cl => art(cl.file, { vb: '10 0 220 300', style: 'width:82px;height:111.8px' })).join('') + `</div>`;
  const points = [
    ['Dessin vectoriel', 'net à toutes les tailles'],
    ['Grosses têtes', 'et visages expressifs'],
    ['Cel-shading', 'et reflets sur le métal'],
    ['Contour épais', 'lisible en plein combat'],
  ];
  const coche = svg('0 0 20 20', `<g stroke-linejoin="round" stroke-linecap="round"><circle cx="10" cy="10" r="8.6" fill="#3fae3a" stroke="${INK}" stroke-width="2"/><path d="M5.6 7.2A6 6 0 0 1 12 4.6" stroke="#9cf27a" stroke-width="1.6" fill="none"/><path d="M5.8 10.4L8.7 13.1L14.2 7" fill="none" stroke="${INK}" stroke-width="4"/><path d="M5.8 10.4L8.7 13.1L14.2 7" fill="none" stroke="#ffffff" stroke-width="2"/></g>`, 'width:20px;height:20px;flex:none');
  const liste = `<div style="display:flex;flex-direction:column;gap:12px;padding-top:4px">` +
    `<span style="${TITLE};font-size:19px;line-height:1;color:#ffd65a;letter-spacing:0.4px;${outline(1.2, INK, 1)}">Ce qui change</span>` +
    `<div style="display:grid;grid-template-columns:1fr;gap:9px">` +
    points.map(([a, b]) => `<div style="display:flex;align-items:center;gap:9px">${coche}<span style="${TXT};font-weight:600;font-size:14.5px;line-height:1.15;color:#c9c2f0"><b style="font-weight:900;color:#ffffff">${a}</b> ${b}</span></div>`).join('') +
    `</div></div>`;
  return `<section aria-label="Avant et après la refonte" style="position:absolute;left:44px;top:600px;width:1272px;height:196px;box-sizing:border-box;border-radius:22px;padding:4px;background:${GOLD_D};box-shadow:0 0 0 2.5px ${INK},0 5px 0 2.5px ${INK},0 16px 24px rgba(6,3,22,0.6)">` +
    `<div style="position:absolute;left:24px;right:24px;top:1.2px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.85) 10%,rgba(255,255,255,0.85) 90%,rgba(255,255,255,0))"></div>` +
    `<div style="position:relative;width:100%;height:100%;box-sizing:border-box;border-radius:18px;overflow:hidden;padding:23px 28px 0 28px;display:flex;align-items:flex-start;gap:20px;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.025) 0 1.5px,rgba(255,255,255,0) 1.5px 16px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.025) 0 1.5px,rgba(255,255,255,0) 1.5px 16px),linear-gradient(180deg,#30266f 0%,#221a58 50%,#18113f 100%);box-shadow:inset 0 0 0 2px ${INK},inset 0 3px 0 rgba(255,255,255,0.14)">` +
    `<div style="display:flex;flex-direction:column;gap:8px">${etiquette('Avant', 'Pixel art', false)}${ecrin(vieux, 364, STEEL)}</div>` +
    `<div style="align-self:center;margin-top:26px">${fleche}</div>` +
    `<div style="display:flex;flex-direction:column;gap:8px">${etiquette('Après', 'Illustration vectorielle', true)}${ecrin(nouveaux, 364, GOLD_D)}</div>` +
    `<div style="align-self:stretch;width:2px;margin:4px 2px 18px;background:linear-gradient(180deg,rgba(247,188,42,0),rgba(247,188,42,0.6),rgba(247,188,42,0))"></div>` +
    liste +
    `</div>` +
    // onglet de titre
    `<div style="position:absolute;left:50%;top:-19px;transform:translateX(-50%);padding:3px;border-radius:14px;background:${GOLD};box-shadow:0 0 0 2.5px ${INK},0 4px 0 2.5px ${INK},0 8px 14px rgba(6,3,22,0.5)">` +
    `<div style="display:flex;align-items:center;gap:10px;padding:6px 22px 6px;border-radius:11px;background:linear-gradient(180deg,#ff6d60 0%,#e3343d 45%,#a81d35 100%);box-shadow:inset 0 0 0 2px ${INK},inset 0 3px 0 rgba(255,255,255,0.35);${TITLE};font-size:21px;line-height:1;color:#ffffff;letter-spacing:0.5px;${outline(1.5, '#4a0b1c', 1.4)}">` +
    `<span>Avant</span>${svg('0 0 30 20', `<g stroke-linejoin="round" stroke-linecap="round"><path d="M3 7.5H16V2.5L27 10L16 17.5V12.5H3Z" fill="#ffe168" stroke="#4a0b1c" stroke-width="2.6"/><path d="M5 9H17" stroke="#fffbe0" stroke-width="1.4"/></g>`, 'width:30px;height:20px;margin-top:1px')}<span>Après</span></div></div>` +
    `</section>`;
}

// ---------- assemblage ----------
function build() {
  for (const k in copies) delete copies[k];
  const cartes = `<div style="position:absolute;left:44px;top:146px;width:1272px;display:flex;gap:24px">` + CLASSES.map(carte).join('') + `</div>`;
  const fond =
    // halo derrière le titre + rayons doux
    `<div style="position:absolute;left:280px;top:-260px;width:800px;height:560px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,206,110,0.30),rgba(255,160,80,0.10) 55%,rgba(255,160,80,0) 100%)"></div>` +
    `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 50% 45%,rgba(12,8,36,0) 55%,rgba(12,8,36,0.7) 100%)"></div>`;
  const root = `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden;${TXT};color:#ffffff;-webkit-font-smoothing:antialiased;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.022) 0 1.5px,rgba(255,255,255,0) 1.5px 18px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.022) 0 1.5px,rgba(255,255,255,0) 1.5px 18px),radial-gradient(ellipse 90% 80% at 50% 30%,#352a80 0%,#241b5e 45%,#150f36 100%)">` +
    fond + titre() + cartes + avantApres() + `</div>`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Les héros</title>
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
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${W},"height":${H}}}'>
class Component extends DCLogic {
renderVals() { return {}; }
}
</script>
</body>
</html>
`;
}

const page = build();
const body = page.split('<x-dc>')[1].split('</x-dc>')[0];
if (/\{\{|\}\}/.test(body)) throw new Error('{{ ou }} présent');
for (const bad of ['<text', '<image', '<filter', '<foreignObject', '<use', 'class=', '<iframe', '<script']) if (body.includes(bad)) throw new Error('interdit : ' + bad);
const ids = [...body.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) throw new Error('ids en double : ' + [...new Set(dup)].join(', '));
const refs = [...body.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]).filter(r => !ids.includes(r));
if (refs.length) throw new Error('url(#…) sans cible : ' + [...new Set(refs)].join(', '));
fs.mkdirSync(path.join(R, 'project'), { recursive: true });
fs.writeFileSync(path.join(R, 'project/Heros.dc.html'), page);
// copie de travail pour l'aperçu (l'image des anciens sprites pointe vers le fichier local)
const ap = page.replace('<x-dc>', '<div>').replace('</x-dc>', '</div>').replace('<helmet>', '').replace('</helmet>', '').replace(/<script type="text\/x-dc"[\s\S]*?<\/script>\n?/, '')
  .replace('/_blob/734e901d7b8f3a6f57b982843e67f7bf', 'avant-4heros.png');
fs.writeFileSync(path.join(R, 'previews/heros-apercu.html'), ap);
console.log('écrit', (page.length / 1024).toFixed(1) + ' Ko', ids.length, 'ids');
