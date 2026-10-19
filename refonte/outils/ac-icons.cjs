// Icônes dessinées pour la planche Accueil (préfixe ac-). Exporte des fonctions qui renvoient le CONTENU (sans <svg>) en repère 64x64.
// node ac-icons.cjs  -> écrit previews/ac-icons/*.svg pour vérification
const fs = require('fs'), path = require('path');
const INK = '#1b1530';
const steel = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#f7f9ff"/><stop offset="0.45" stop-color="#c3cce0"/><stop offset="1" stop-color="#8a95b2"/></linearGradient>`;
const gold = id => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.45" stop-color="#f7bc2a"/><stop offset="1" stop-color="#d98a16"/></linearGradient>`;
const spark = (x, y, r, fill = '#ffffff', sw = 1.3) => { const k = r * 0.3; return `<path d="M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`; };
const sparkNo = (x, y, r, fill = '#ffffff') => { const k = r * 0.28; return `<path d="M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z" fill="${fill}"/>`; };

// pièce en 3 couches : clip + intérieur + contour
function piece(P, id, d, inner, sw = 2.4) {
  return { def: `<clipPath id="${P}${id}"><path d="${d}"/></clipPath>`, body: `<g clip-path="url(#${P}${id})">${inner}</g><path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}"/>` };
}
function assemble(defsExtra, pieces, lining, extra = '') {
  return `<defs>${defsExtra}${pieces.map(p => p.def).join('')}</defs><g stroke-linejoin="round" stroke-linecap="round"><g fill="${INK}" stroke="${INK}" stroke-width="6">${lining.map(d => `<path d="${d}"/>`).join('')}</g>${pieces.map(p => p.body).join('')}${extra}</g>`;
}

// ---------- HÉROS : heaume à plumet ----------
function casque(P = 'ac-hc-') {
  const PLUME = 'M38 16C37.5 8.5 31 2.8 21.5 2.4C15.5 2.1 9.5 4 5 7.8C9.6 7.4 13.2 8.2 15.8 9.8C10.2 10.6 5.6 13.8 3.4 18.6C8 16.4 12.6 16 16.6 17C13.2 19.4 11.2 22.8 11 27C16 21.6 23 18.2 31 17.4Z';
  const HELM = 'M12 37C12 22 21.5 13 33.5 13C45.5 13 54 22 54 36L54 50.5C54 54.5 51 57.5 47 57.5L19 57.5C15 57.5 12 54.5 12 50.5Z';
  const RIM = 'M12 48.5L54 48.5L54 50.5C54 54.5 51 57.5 47 57.5L19 57.5C15 57.5 12 54.5 12 50.5Z';
  const plume = piece(P, 'plume', PLUME,
    `<rect x="2" y="1" width="38" height="28" fill="#e3343d"/>` +
    `<path d="M2 14C10 12 22 12.5 32 15.5L40 13L40 30L2 30Z" fill="#a81d35"/>` +
    `<path d="M2 21C8 18.5 14 18.6 19 19.8L18 30L2 30Z" fill="#6e1129"/>` +
    `<path d="M15.8 9.8C21 9.8 27 11.2 32 14" fill="none" stroke="#6e1129" stroke-width="1.8"/>` +
    `<path d="M16.6 17C21 15.6 26 15.6 30 16.4" fill="none" stroke="#6e1129" stroke-width="1.6"/>` +
    `<path d="M8 7C14 4.6 22 4.8 29 8.4" fill="none" stroke="#ff6d60" stroke-width="2.8"/>` +
    `<path d="M11 6.2C15.5 5 20 5.1 24 6.2" fill="none" stroke="#ffd0c8" stroke-width="1.5"/>` +
    `<path d="M7 14.6C10 13 14 12.4 18 12.6" fill="none" stroke="#ff6d60" stroke-width="1.8"/>`, 2.4);
  const helm = piece(P, 'coque', HELM,
    `<rect x="11" y="12" width="44" height="47" fill="url(#${P}acier)"/>` +
    `<path d="M40 13C48 18 52 27 52 38L52 60L58 60L58 12Z" fill="#9ba7c3"/>` +
    `<path d="M47 22C51 28 52 34 52 42L52 60L58 60L58 20Z" fill="#6f7a9b"/>` +
    `<path d="M16 34C16 24 22 17 30 15.5C24 19.5 20 26 19.5 34Z" fill="#ffffff"/>` +
    `<circle cx="27" cy="17.5" r="1.5" fill="#ffffff"/>` +
    `<path d="M15.5 40L15.5 47" fill="none" stroke="#eef2fa" stroke-width="2"/>` +
    // arête centrale
    `<path d="M35 13.2C37.5 20 37.8 27 37 32" fill="none" stroke="${INK}" stroke-width="2"/>` +
    `<path d="M33.6 14.5C35.6 20.5 35.9 26.5 35.2 31" fill="none" stroke="#ffffff" stroke-width="1.2"/>` +
    // fente de visière + nasal
    `<path d="M15 32.8C26 30.2 42 30.2 55 32.8L55 38.6C42 36.4 26 36.4 15 38.6Z" fill="${INK}"/>` +
    `<path d="M17 34.2C27 32.6 40 32.6 52 34.2" fill="none" stroke="#3c3466" stroke-width="1.2"/>` +
    `<path d="M34.2 38L39.4 38L39.4 48.6L34.2 48.6Z" fill="#c3cce0"/><path d="M37.4 38L39.4 38L39.4 48.6L37.4 48.6Z" fill="#9ba7c3"/>` +
    `<path d="M34.2 38L34.2 48.6M39.4 38L39.4 48.6" fill="none" stroke="${INK}" stroke-width="1.6"/>` +
    // trous de respiration
    `<circle cx="44.5" cy="41.5" r="1.25" fill="${INK}"/><circle cx="48.5" cy="41.5" r="1.25" fill="${INK}"/><circle cx="44.5" cy="45" r="1.25" fill="${INK}"/><circle cx="48.5" cy="45" r="1.25" fill="${INK}"/>` +
    // bord doré
    `<path d="${RIM}" fill="url(#${P}or)"/><path d="M12 53.5L56 53.5L56 59L12 59Z" fill="#cd7e15"/><path d="M45 48L56 48L56 59L45 59Z" fill="#cd7e15"/>` +
    `<path d="M15 50.4L30 50.4" fill="none" stroke="#fff7c4" stroke-width="1.4"/>` +
    `<path d="M12 48.5L54 48.5" fill="none" stroke="${INK}" stroke-width="2"/>` +
    `<circle cx="19" cy="53" r="1.5" fill="#fff7c4" stroke="${INK}" stroke-width="1.1"/><circle cx="28" cy="53" r="1.5" fill="#fff7c4" stroke="${INK}" stroke-width="1.1"/><circle cx="46" cy="53" r="1.5" fill="#f7bc2a" stroke="${INK}" stroke-width="1.1"/>`, 2.4);
  const support = `<path d="M30.5 14.5L37 12.5L38 16.5L31.5 18Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="1.6"/>`;
  return assemble(steel(P + 'acier') + gold(P + 'or'), [plume, helm], [PLUME, HELM], support + spark(55.5, 12.5, 4.2, '#ffffff', 1.2));
}

// ---------- SOCIAL : deux compagnons ----------
function social(P = 'ac-so-') {
  const B_HEAD = 'M33 20.5C33 15 37.5 10.5 43 10.5C48.5 10.5 53 15 53 20.5C53 26 48.5 30.5 43 30.5C37.5 30.5 33 26 33 20.5Z';
  const B_BODY = 'M29 49C29 39 35 33.5 43 33.5C51 33.5 57.5 39 57.5 49L57.5 50C57.5 52 56 53.5 54 53.5L32.5 53.5C30.5 53.5 29 52 29 50Z';
  const F_HEAD = 'M11.5 28C11.5 21.5 16.6 16.5 23 16.5C29.4 16.5 34.5 21.5 34.5 28C34.5 34.5 29.4 39.5 23 39.5C16.6 39.5 11.5 34.5 11.5 28Z';
  const F_BODY = 'M6 56.5C6 48 12.5 42.5 23 42.5C33.5 42.5 40 48 40 56.5L40 57C40 59 38.5 60.5 36.5 60.5L9.5 60.5C7.5 60.5 6 59 6 57Z';
  const vio = ['#b57cf2', '#7d47cc', '#532b96', '#351868'], blu = ['#9fd0ff', '#3f8cf0', '#23499c', '#162f6c'];
  const shade = (c, x0, y0, w, h, cx) => `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${c[1]}"/>` +
    `<path d="M${cx + 2} ${y0}C${cx + w * 0.36} ${y0 + h * 0.3} ${cx + w * 0.4} ${y0 + h * 0.7} ${cx + w * 0.2} ${y0 + h}L${x0 + w} ${y0 + h}L${x0 + w} ${y0}Z" fill="${c[2]}"/>` +
    `<path d="M${x0} ${y0 + h * 0.85}C${x0 + w * 0.4} ${y0 + h * 0.98} ${x0 + w * 0.7} ${y0 + h * 0.9} ${x0 + w} ${y0 + h * 0.6}L${x0 + w} ${y0 + h}L${x0} ${y0 + h}Z" fill="${c[3]}" />`;
  const bh = piece(P, 'tete2', B_HEAD, shade(vio, 32, 9.5, 22, 22, 43) + `<path d="M36.5 20C36.5 16 39.5 13.5 43 13.2C40.5 15 39 17.5 39 20.5Z" fill="${vio[0]}"/><circle cx="45.5" cy="13.8" r="1.1" fill="#ffffff"/>`);
  const bb = piece(P, 'corps2', B_BODY, shade(vio, 28, 32.5, 30.5, 22, 43) + `<path d="M33 47C33 41 36.5 37.5 41 36.5C38 39.5 36.5 43 36.5 47Z" fill="${vio[0]}"/>`);
  const fh = piece(P, 'tete1', F_HEAD, shade(blu, 10.5, 15.5, 25, 25, 23) + `<path d="M15.5 27C15.5 22.5 18.8 19.6 23 19.2C20 21.4 18.4 24.2 18.4 27.6Z" fill="#ffffff"/><circle cx="26" cy="20" r="1.3" fill="#ffffff"/>`);
  const fb = piece(P, 'corps1', F_BODY, shade(blu, 5, 41.5, 36, 20, 23) + `<path d="M10.5 54C10.5 48.5 14.5 45.5 20 45C16.5 47.6 14.2 50.6 13.6 54.5Z" fill="#ffffff"/>`);
  // écusson doré sur la poitrine du compagnon de devant (lien d'équipe)
  const badge = `<path d="M23 47.5L28 49.2L27.6 53.2C27.2 55.6 25.4 57 23 58C20.6 57 18.8 55.6 18.4 53.2L18 49.2Z" fill="url(#${P}or)" stroke="${INK}" stroke-width="1.6"/><path d="M23 49.6L23 56" stroke="#cd7e15" stroke-width="1.4"/>`;
  return assemble(gold(P + 'or'), [bb, bh, fb, fh], [B_HEAD, B_BODY, F_HEAD, F_BODY], badge);
}

// ---------- BOUTIQUE : étal à auvent rayé ----------
function boutique(P = 'ac-bo-') {
  const AWN = 'M7 15C7 11.5 9.5 9 13 9L51 9C54.5 9 57 11.5 57 15L57 25C57 28.6 54 30.6 51 30.6C48.2 30.6 45.4 28.6 45.4 25C45.4 28.6 42.4 30.6 39.6 30.6C36.8 30.6 33.8 28.6 33.8 25C33.8 28.6 30.8 30.6 28 30.6C25.2 30.6 22.2 28.6 22.2 25C22.2 28.6 19.2 30.6 16.4 30.6C13.6 30.6 7 28.6 7 25Z';
  const AWN2 = 'M7 15C7 11.5 9.5 9 13 9L51 9C54.5 9 57 11.5 57 15L57 25C57 28.4 54.4 30.6 51.2 30.6C48 30.6 45.4 28.4 45.4 25C45.4 28.4 42.8 30.6 39.6 30.6C36.4 30.6 33.8 28.4 33.8 25C33.8 28.4 31.2 30.6 28 30.6C24.8 30.6 22.2 28.4 22.2 25C22.2 28.4 19.6 30.6 16.4 30.6C13.2 30.6 10.6 28.4 10.6 25C10.6 28.4 7 28 7 25Z';
  const COUNTER = 'M9 40L55 40L55 55C55 57.2 53.2 59 51 59L13 59C10.8 59 9 57.2 9 55Z';
  const POSTS = 'M12 28L16 28L16 41L12 41Z M48 28L52 28L52 41L48 41Z';
  const stripes = (cream, red) => `<rect x="6" y="8" width="52" height="24" fill="${cream}"/>` + [0, 1, 2, 3, 4].map(i => { const x = 7 + i * 11.6 + 5.8; return `<path d="M${x} 6L${x + 5.8} 6L${x + 5.8} 33L${x} 33Z" fill="${red}"/>`; }).join('');
  const SH = 'M6 21C20 23.5 40 23.5 58 20L58 33L6 33Z M45 8L58 8L58 33L49 33C48 24 47 15 45 8Z';
  const awn = piece(P, 'auvent', AWN2,
    stripes('#fff4e0', '#e3343d') +
    `<g clip-path="url(#${P}auvent-ombre)">${stripes('#e6c99e', '#a81d35')}</g>` +
    `<path d="M10 15.6L30 15.6" fill="none" stroke="#ffffff" stroke-width="1.8"/>` +
    `<path d="M6 8L58 8L58 13L6 13Z" fill="url(#${P}or)"/><path d="M46 8L58 8L58 13L46 13Z" fill="#cd7e15"/><path d="M6 13L58 13" fill="none" stroke="${INK}" stroke-width="1.8"/>`, 2.4);
  awn.def += `<clipPath id="${P}auvent-ombre"><path d="${SH}"/></clipPath>`;
  const posts = piece(P, 'poteaux', POSTS, `<rect x="11" y="27" width="42" height="15" fill="#9a6234"/><path d="M14.4 27L17 27L17 42L14.4 42ZM50.4 27L53 27L53 42L50.4 42Z" fill="#6b3d1f"/>`, 2);
  const counter = piece(P, 'comptoir', COUNTER,
    `<rect x="8" y="39" width="48" height="21" fill="#9a6234"/>` +
    `<path d="M40 39L56 39L56 60L36 60Z" fill="#6b3d1f"/><path d="M8 52L56 52L56 60L8 60Z" fill="#6b3d1f"/><path d="M44 52L56 52L56 60L44 60Z" fill="#45230f"/>` +
    `<path d="M8 39L56 39L56 44L8 44Z" fill="#c98f55"/><path d="M8 44L56 44" stroke="${INK}" stroke-width="1.8"/>` +
    `<path d="M20 47.5L20 56M32 47.5L32 56M44 47.5L44 56" stroke="#45230f" stroke-width="1.6"/>` +
    `<path d="M12 41.3L28 41.3" stroke="#e8b47c" stroke-width="1.4"/>`, 2.4);
  // pile de pièces d'or posée sur le comptoir
  const coin = (cx, cy) => `<path d="M${cx - 7} ${cy}L${cx - 7} ${cy + 3}C${cx - 7} ${cy + 5} ${cx + 7} ${cy + 5} ${cx + 7} ${cy + 3}L${cx + 7} ${cy}Z" fill="#cd7e15" stroke="${INK}" stroke-width="1.5"/><ellipse cx="${cx}" cy="${cy}" rx="7" ry="2.6" fill="url(#${P}or)" stroke="${INK}" stroke-width="1.5"/>`;
  const coins = coin(32, 37) + coin(32, 33.4) + coin(32, 29.8) + `<path d="M27.6 29.2C29 28.4 31 28.2 32.6 28.4" stroke="#fff7c4" stroke-width="1.1" fill="none"/>`;
  return assemble(gold(P + 'or'), [posts, counter, awn], [AWN2, COUNTER, POSTS], coins + spark(50.5, 37, 3.6, '#ffffff', 1.1));
}

// ---------- ENGRENAGE (réglages), repère 32x32 ----------
function gearPath(cx, cy, ro, ri, n) {
  const st = 2 * Math.PI / n; let d = '';
  for (let i = 0; i < n; i++) {
    const a = i * st - Math.PI / 2;
    const pts = [[ri, a - st * 0.36], [ro, a - st * 0.2], [ro, a + st * 0.2], [ri, a + st * 0.36]];
    pts.forEach(([r, t], k) => { const x = (cx + r * Math.cos(t)).toFixed(2), y = (cy + r * Math.sin(t)).toFixed(2); d += (i === 0 && k === 0 ? 'M' : 'L') + x + ' ' + y; });
  }
  return d + 'Z';
}
function engrenage(P = 'ac-en-') {
  const G = gearPath(16, 16, 13, 9.6, 8);
  const g = piece(P, 'roue', G,
    `<rect x="2" y="2" width="28" height="28" fill="url(#${P}acier)"/>` +
    `<path d="M22 3C28 8 30 16 27 24C24 29 18 31 12 30L30 30L30 2Z" fill="#9ba7c3"/>` +
    `<path d="M26 10C29 16 28 23 23 28L30 30L30 8Z" fill="#6f7a9b"/>` +
    `<path d="M6 13C7 9 10 6.5 14 5.5C11 8 9 10.5 8.5 14Z" fill="#ffffff"/>`, 1.8);
  const hub = `<circle cx="16" cy="16" r="4.6" fill="#2a2160" stroke="${INK}" stroke-width="1.8"/><path d="M13.2 14.8C13.8 13.4 15 12.6 16.4 12.6" fill="none" stroke="#7d75c2" stroke-width="1.1"/>`;
  return `<defs>${steel(P + 'acier')}${g.def}</defs><g stroke-linejoin="round" stroke-linecap="round"><path d="${G}" fill="${INK}" stroke="${INK}" stroke-width="4.4"/>${g.body}${hub}</g>`;
}

// ---------- BULLE DE TCHAT, repère 32x32 ----------
function tchat(P = 'ac-tc-') {
  const B = 'M4.5 10C4.5 6.4 7.2 4 10.8 4L21.6 4C25.2 4 27.8 6.4 27.8 10L27.8 16.4C27.8 20 25.2 22.4 21.6 22.4L14.6 22.4L8.2 27.6L9.4 22.2C6.4 21.6 4.5 19.4 4.5 16.4Z';
  const b = piece(P, 'bulle', B,
    `<rect x="3" y="3" width="26" height="26" fill="#ffffff"/>` +
    `<path d="M5 18C10 21 20 21.5 28 17L28 28L4 28Z" fill="#cfc8f2"/>` +
    `<path d="M22 4C26 6 27.6 9 27.6 13L27.6 20L30 20L30 3Z" fill="#cfc8f2"/>` +
    `<path d="M7.6 11C7.6 8.6 9.2 7 11.4 6.8" fill="none" stroke="#eef0ff" stroke-width="1.4"/>`, 1.8);
  const dots = [11, 16.2, 21.4].map(x => `<circle cx="${x}" cy="13.2" r="2" fill="#3a2d92"/>`).join('');
  return `<defs>${b.def}</defs><g stroke-linejoin="round" stroke-linecap="round"><path d="${B}" fill="${INK}" stroke="${INK}" stroke-width="4.4"/>${b.body}${dots}</g>`;
}

module.exports = { casque, social, boutique, engrenage, tchat, gearPath, INK, steel, gold, spark, sparkNo, piece };

if (require.main === module) {
  const out = path.join(__dirname, '../previews/ac-icons'); fs.mkdirSync(out, { recursive: true });
  const w = (n, vb, c) => fs.writeFileSync(path.join(out, n + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${c}</svg>`);
  w('casque', '0 0 64 64', casque()); w('social', '0 0 64 64', social()); w('boutique', '0 0 64 64', boutique());
  w('engrenage', '0 0 32 32', engrenage()); w('tchat', '0 0 32 32', tchat());
  // épées croisées = 2 copies de art/ui/epee.svg (la 2e retournée)
  const ep = fs.readFileSync(path.join(__dirname, '../art/ui/epee.svg'), 'utf8');
  const inner = s => s.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const ren = (s, n) => { const ids = [...s.matchAll(/id="([^"]+)"/g)].map(m => m[1]); for (const id of ids) { const ni = id.replace(/^([a-z]+)-/, `$1${n}-`); s = s.split(`id="${id}"`).join(`id="${ni}"`).split(`url(#${id})`).join(`url(#${ni})`); } return s; };
  w('combats', '0 0 64 64', `<g transform="translate(32 32) scale(0.9) translate(-32 -32)"><g transform="translate(-4 4)">${inner(ren(ep, 2))}</g><g transform="translate(64 0) scale(-1 1)"><g transform="translate(-4 4)">${inner(ren(ep, 3))}</g></g></g>`);
}
