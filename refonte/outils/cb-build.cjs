// Planche « écran de combat » (préfixe cb-) : assemble project/Main.dc.html + previews/main-apercu.html
// node tools/cb-build.cjs
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');
const art = f => fs.readFileSync(path.join(R, 'art', f), 'utf8').trim();
const f2 = n => +n.toFixed(2);

// ---------- SVG en ligne ----------
// rename : [ancienPrefixe, nouveauPrefixe] pour une 2e copie du même dessin
function svg(file, { vb, style = '', rename } = {}) {
  let s = art(file);
  if (rename) s = s.replace(new RegExp('(id="|url\\(#)' + rename[0], 'g'), '$1' + rename[1]);
  s = s.replace(/^<svg[^>]*>/, m => {
    const v = vb || m.match(/viewBox="([^"]*)"/)[1];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v}" aria-hidden="true" focusable="false" style="${style}">`;
  });
  return s;
}

// ---------- texte contouré (contour = anneau d'ombres portées) ----------
function ring(r, c, n = 16) {
  const a = [];
  for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI; a.push(`${f2(r * Math.cos(t))}px ${f2(r * Math.sin(t))}px 0 ${c}`); }
  return a.join(',');
}
function ringOff(r, c, dy, n = 12) {
  const a = [];
  for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI; a.push(`${f2(r * Math.cos(t))}px ${f2(r * Math.sin(t) + dy)}px 0 ${c}`); }
  return a.join(',');
}
const LIL = "font-family:'Lilita One',sans-serif;font-weight:400";
const NUN = "font-family:'Nunito',sans-serif";

// ---------- placement des combattants ----------
// cx,feet : point au sol (page) ; s : échelle ; g : point au sol dans le viewBox du dessin
const P = {
  guerrier: { file: 'guerrier.svg', vb: [240, 300], g: [128, 291], head: 24, hx: 128 },
  mage:     { file: 'mage.svg',     vb: [240, 300], g: [138, 291], head: 18, hx: 120 },
  archer:   { file: 'archer.svg',   vb: [240, 300], g: [130, 291], head: 26, hx: 128 },
  paladin:  { file: 'paladin.svg',  vb: [240, 300], g: [128, 291], head: 26, hx: 128 },
  demon:    { file: 'monstre-demon.svg',  vb: [320, 340], g: [156, 331], head: 40, hx: 156 },
  gluant:   { file: 'monstre-gluant.svg', vb: [240, 240], g: [122, 229], head: 40, hx: 122 },
  loup:     { file: 'monstre-loup.svg',   vb: [260, 220], g: [141.5, 211], head: 40, hx: 200 },
};
const POS = {
  demon:    { cx: 322, feet: 438, s: 0.47 },
  mage:     { cx: 48,  feet: 447, s: 0.33 },
  gluant:   { cx: 240, feet: 456, s: 0.37 },
  paladin:  { cx: 128, feet: 464, s: 0.34 },
  archer:   { cx: 62,  feet: 562, s: 0.355 },
  loup:     { cx: 314, feet: 574, s: 0.47 },
  guerrier: { cx: 172, feet: 574, s: 0.365, rot: 7 },
};
function box(k) {
  const p = P[k], q = POS[k];
  const w = p.vb[0] * q.s, h = p.vb[1] * q.s;
  return { left: q.cx - p.g[0] * q.s, top: q.feet - p.g[1] * q.s, w, h };
}
// point du dessin -> page (rotation éventuelle autour du point au sol)
function pt(k, x, y) {
  const p = P[k], q = POS[k], b = box(k);
  let X = b.left + x * q.s, Y = b.top + y * q.s;
  if (q.rot) {
    const a = q.rot * Math.PI / 180, dx = X - q.cx, dy = Y - q.feet;
    X = q.cx + dx * Math.cos(a) - dy * Math.sin(a); Y = q.feet + dx * Math.sin(a) + dy * Math.cos(a);
  }
  return [X, Y];
}
function perso(k) {
  const p = P[k], q = POS[k], b = box(k);
  const tr = q.rot ? `transform:rotate(${q.rot}deg);transform-origin:${f2(q.cx - b.left)}px ${f2(q.feet - b.top)}px;` : '';
  return `<!-- ${k} -->\n` + svg(p.file, { style: `position:absolute;left:${f2(b.left)}px;top:${f2(b.top)}px;width:${f2(b.w)}px;height:${f2(b.h)}px;overflow:visible;${tr}` });
}

// ---------- barre de vie au-dessus d'un combattant ----------
function vie(k, pct, { w = 46, ennemi = false, dy = 0, boss = false } = {}) {
  const p = P[k];
  const [x, y] = pt(k, p.hx, p.head);
  const fill = ennemi
    ? 'linear-gradient(180deg,#ffb0a4 0%,#ff5a4e 35%,#e3343d 60%,#a81d35 100%)'
    : 'linear-gradient(180deg,#d6ffb0 0%,#7fe85a 35%,#45bf3c 62%,#2f8f35 100%)';
  const h = boss ? 9 : 8;
  const icone = boss ? svg('ui/crane-boss.svg', { rename: ['crane-boss-', 'crane-boss2-'], style: 'position:absolute;left:-17px;top:-8px;width:24px;height:24px' }) : '';
  return `<div style="position:absolute;left:${f2(x - w / 2)}px;top:${f2(y - 14 + dy)}px;width:${w}px;height:${h}px;box-sizing:border-box;padding:1.5px;border-radius:5px;background:#1b1530;box-shadow:0 2px 0 rgba(27,21,48,.35)">`
    + `<div style="position:relative;width:100%;height:100%;border-radius:3.5px;background:#3b2a4e;overflow:hidden">`
    + `<div style="width:${pct}%;height:100%;border-radius:3.5px;background:${fill};box-shadow:inset 0 1px 0 rgba(255,255,255,.55)"></div>`
    + `<div style="position:absolute;left:${pct}%;top:0;width:${Math.min(100 - pct, 14)}%;height:100%;background:${ennemi ? '#fff2c4' : '#f6f6ff'};opacity:${ennemi && pct < 60 ? .85 : 0}"></div>`
    + `</div>${icone}</div>`;
}

// ---------- effets (SVG plein écran de la scène, repère page) ----------
function arc(c, R, a0, a1, wmax, n = 48, shape = t => Math.pow(t, 1.3) * Math.pow(1 - t, 0.28)) {
  // croissant : bord extérieur rayon R, bord intérieur R - w(t) ; t=0 queue, t=1 tête
  let norm = 0; for (let i = 0; i <= 100; i++) norm = Math.max(norm, shape(i / 100));
  const out = [], inn = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = (a0 + (a1 - a0) * t) * Math.PI / 180, w = wmax * shape(t) / norm;
    out.push([c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]);
    inn.push([c[0] + (R - w) * Math.cos(a), c[1] + (R - w) * Math.sin(a)]);
  }
  const pts = out.concat(inn.reverse());
  return 'M' + pts.map(p => f2(p[0]) + ' ' + f2(p[1])).join('L') + 'Z';
}
function etoile(cx, cy, n, ro, ri, rot = 0) {
  const a = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro, t = (i / (n * 2)) * 2 * Math.PI + rot * Math.PI / 180 - Math.PI / 2;
    a.push(f2(cx + r * Math.cos(t)) + ' ' + f2(cy + r * Math.sin(t)));
  }
  return 'M' + a.join('L') + 'Z';
}
const sparkle = (x, y, r, fill = '#ffffff') => `<path d="M${x} ${y - r}L${f2(x + r * .28)} ${f2(y - r * .28)}L${x + r} ${y}L${f2(x + r * .28)} ${f2(y + r * .28)}L${x} ${y + r}L${f2(x - r * .28)} ${f2(y + r * .28)}L${x - r} ${y}L${f2(x - r * .28)} ${f2(y - r * .28)}Z" fill="${fill}"/>`;

function effets() {
  // --- coup d'épée du guerrier ---
  const main = pt('guerrier', 170, 206);
  const C = [main[0] - 2, main[1] - 4];
  const Rr = 74, a0 = -150, a1 = -6;
  const tete = [C[0] + Rr * Math.cos(a1 * Math.PI / 180), C[1] + Rr * Math.sin(a1 * Math.PI / 180)];
  const queue = [C[0] + Rr * Math.cos(a0 * Math.PI / 180), C[1] + Rr * Math.sin(a0 * Math.PI / 180)];
  const impact = [tete[0] - 2, tete[1] + 2];
  // --- boule de feu du mage ---
  const orbe = pt('mage', 190 + 140 * Math.sin(6 * Math.PI / 180), 198 - 140 * Math.cos(6 * Math.PI / 180));
  const cible = pt('demon', 150, 170);
  const fb = [orbe[0] + (cible[0] - orbe[0]) * 0.6, orbe[1] + (cible[1] - orbe[1]) * 0.6 - 14];
  const ang = Math.atan2(cible[1] - fb[1], cible[0] - fb[0]) * 180 / Math.PI;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 600" aria-hidden="true" focusable="false" style="position:absolute;left:0;top:0;width:390px;height:600px;overflow:visible">
<defs>
<linearGradient id="cb-slash-or" gradientUnits="userSpaceOnUse" x1="${f2(queue[0])}" y1="${f2(queue[1])}" x2="${f2(tete[0])}" y2="${f2(tete[1])}"><stop offset="0" stop-color="#ffb52a" stop-opacity="0"/><stop offset="0.35" stop-color="#ffc93a" stop-opacity="0.55"/><stop offset="0.8" stop-color="#ffd84a" stop-opacity="0.95"/><stop offset="1" stop-color="#fff2a0" stop-opacity="1"/></linearGradient>
<linearGradient id="cb-slash-blanc" gradientUnits="userSpaceOnUse" x1="${f2(queue[0])}" y1="${f2(queue[1])}" x2="${f2(tete[0])}" y2="${f2(tete[1])}"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.75"/><stop offset="1" stop-color="#ffffff" stop-opacity="1"/></linearGradient>
<linearGradient id="cb-slash-or2" gradientUnits="userSpaceOnUse" x1="${f2(queue[0])}" y1="${f2(queue[1])}" x2="${f2(tete[0])}" y2="${f2(tete[1])}"><stop offset="0" stop-color="#fff7c4" stop-opacity="0"/><stop offset="0.5" stop-color="#fff3a0" stop-opacity="0.7"/><stop offset="1" stop-color="#fffbe0" stop-opacity="1"/></linearGradient>
<radialGradient id="cb-impact-halo"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.9"/><stop offset="0.42" stop-color="#ffd84a" stop-opacity="0.5"/><stop offset="1" stop-color="#ffb43a" stop-opacity="0"/></radialGradient>
<radialGradient id="cb-feu-halo"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ffb43a" stop-opacity="0.45"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
<linearGradient id="cb-feu-ext" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3343d"/><stop offset="0.5" stop-color="#ff6a1f"/><stop offset="1" stop-color="#ff9a1f"/></linearGradient>
<linearGradient id="cb-feu-int" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff9a1f"/><stop offset="0.6" stop-color="#ffd23a"/><stop offset="1" stop-color="#fff3a0"/></linearGradient>
<radialGradient id="cb-feu-coeur" cx="0.42" cy="0.4" r="0.6"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#fff7c4"/><stop offset="1" stop-color="#ffe168"/></radialGradient>
<clipPath id="cb-feu-clip"><path d="M15 0C15 -9 8 -16 -2 -16C-15 -16 -29 -23 -46 -21C-39 -16 -37 -13 -40 -9C-53 -10 -66 -7 -80 -2C-66 2 -55 5 -45 8C-51 12 -56 17 -63 22C-45 23 -26 18 -4 16C8 15 15 9 15 0Z"/></clipPath>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<!-- ===== COUP D'ÉPÉE : traînée blanche et dorée ===== -->
<path d="${arc(C, Rr + 10, a0 + 80, a1 - 6, 2.6)}" fill="url(#cb-slash-blanc)" opacity="0.75"/>
<path d="${arc(C, Rr - 4, a0 + 10, a1, 30)}" fill="url(#cb-slash-or)"/>
<path d="${arc(C, Rr - 4, a0 + 30, a1, 16)}" fill="url(#cb-slash-or2)"/>
<path d="${arc(C, Rr, a0 + 40, a1 + 1, 7)}" fill="url(#cb-slash-blanc)"/>
<path d="${arc(C, Rr - 30, a0 + 100, a1 - 12, 2.4)}" fill="url(#cb-slash-blanc)" opacity="0.55"/>
<!-- traits de vitesse : élan du guerrier -->
${(() => { const [x, y] = pt('guerrier', 60, 190); return `<path d="M${f2(x - 6)} ${f2(y - 22)}H${f2(x - 30)}M${f2(x - 2)} ${f2(y - 6)}H${f2(x - 38)}M${f2(x - 8)} ${f2(y + 10)}H${f2(x - 28)}" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.85"/>`; })()}
<!-- ===== IMPACT ===== -->
<circle cx="${f2(impact[0])}" cy="${f2(impact[1])}" r="34" fill="url(#cb-impact-halo)"/>
<path d="${etoile(impact[0], impact[1], 8, 23, 8.5, 12)}" fill="#fff7c4" stroke="#1b1530" stroke-width="2.5"/>
<path d="${etoile(impact[0], impact[1], 8, 14, 6, 34)}" fill="#ffffff"/>
<path d="M${f2(impact[0] + 26)} ${f2(impact[1] - 18)}L${f2(impact[0] + 38)} ${f2(impact[1] - 27)}M${f2(impact[0] + 29)} ${f2(impact[1] + 6)}L${f2(impact[0] + 44)} ${f2(impact[1] + 8)}M${f2(impact[0] + 12)} ${f2(impact[1] + 26)}L${f2(impact[0] + 18)} ${f2(impact[1] + 38)}" fill="none" stroke="#fff3a0" stroke-width="3"/>
${sparkle(f2(impact[0] - 22), f2(impact[1] - 26), 6)}${sparkle(f2(impact[0] + 34), f2(impact[1] - 4), 4.5, '#fff3a0')}${sparkle(f2(tete[0] - 40), f2(tete[1] - 64), 5)}
<!-- ===== BOULE DE FEU DU MAGE (en vol) ===== -->
<g transform="translate(${f2(fb[0])} ${f2(fb[1])}) rotate(${f2(ang)}) scale(0.82)">
<circle cx="0" cy="0" r="36" fill="url(#cb-feu-halo)"/>
<path d="M-92 -12L-56 -10M-100 4L-70 3M-88 16L-60 13" fill="none" stroke="#ffffff" stroke-width="2.4" opacity="0.75"/>
<path d="M15 0C15 -9 8 -16 -2 -16C-15 -16 -29 -23 -46 -21C-39 -16 -37 -13 -40 -9C-53 -10 -66 -7 -80 -2C-66 2 -55 5 -45 8C-51 12 -56 17 -63 22C-45 23 -26 18 -4 16C8 15 15 9 15 0Z" fill="#1b1530" stroke="#1b1530" stroke-width="6"/>
<g clip-path="url(#cb-feu-clip)">
<rect x="-82" y="-24" width="98" height="48" fill="url(#cb-feu-ext)"/>
<path d="M-82 8C-50 10 -20 12 16 4L16 24L-82 24Z" fill="#c8283a" opacity="0.55"/>
<path d="M12 0C12 -6 6 -11 -2 -11C-12 -11 -22 -15 -34 -14C-28 -10 -27 -8 -30 -5C-40 -6 -50 -4 -60 -1C-50 2 -40 4 -32 6C-36 9 -40 12 -44 15C-30 15 -16 12 -3 11C6 10 12 6 12 0Z" fill="url(#cb-feu-int)"/>
<path d="M-4 -13C-14 -13 -24 -17 -36 -17" fill="none" stroke="#fff3a0" stroke-width="2.2"/>
</g>
<path d="M15 0C15 -9 8 -16 -2 -16C-15 -16 -29 -23 -46 -21C-39 -16 -37 -13 -40 -9C-53 -10 -66 -7 -80 -2C-66 2 -55 5 -45 8C-51 12 -56 17 -63 22C-45 23 -26 18 -4 16C8 15 15 9 15 0Z" fill="none" stroke="#1b1530" stroke-width="3"/>
<circle cx="2" cy="-1" r="8.5" fill="url(#cb-feu-coeur)"/>
<circle cx="-1" cy="-4" r="2.6" fill="#ffffff"/>
<circle cx="-70" cy="-18" r="3" fill="#ffd84a" stroke="#1b1530" stroke-width="1.6"/><circle cx="-92" cy="-2" r="2.2" fill="#ffb43a" stroke="#1b1530" stroke-width="1.4"/><circle cx="-60" cy="24" r="2.4" fill="#ffd84a" stroke="#1b1530" stroke-width="1.4"/>
${sparkle(24, -16, 5, '#fff3a0')}
</g>
</g>
</svg>`;
}

// ---------- chiffres et mots qui jaillissent ----------
function chiffre(txt, { x, y, size, rot = 0, grad, out = '#1b1530', ow = 3.4, drop = 5, label = '' }) {
  const base = `${LIL};font-size:${size}px;line-height:1;letter-spacing:.5px;word-spacing:.12em;white-space:nowrap`;
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg);transform-origin:0 50%">`
    + label
    + `<div style="position:relative">`
    + `<div style="${base};color:${out};text-shadow:${ring(ow, out, 24)},${ringOff(ow, out, drop, 12)},0 ${drop + 4}px 6px rgba(10,6,25,.35)">${txt}</div>`
    + `<div aria-hidden="true" style="position:absolute;left:0;top:0;${base};color:transparent;background:${grad};-webkit-background-clip:text;background-clip:text">${txt}</div>`
    + `</div></div>`;
}

// ---------- interface haute ----------
const plaque = 'background:linear-gradient(180deg,#3b3174 0%,#2a2156 55%,#1f1844 100%);box-shadow:0 0 0 2px #1b1530,inset 0 0 0 1.5px #c9952e,inset 0 3px 0 rgba(255,255,255,.18),0 3px 0 2px rgba(11,7,32,.55)';
function hudHaut() {
  const titre = `<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;height:42px;padding:0 12px 0 11px;border-radius:12px;${plaque}">`
    + `<span style="${LIL};font-size:16px;line-height:1;color:#ffffff;text-shadow:${ring(1.6, '#1b1530', 12)},0 2px 0 #1b1530">C3 Blanche</span>`
    + `<span style="${LIL};font-size:12.5px;line-height:1;color:#ffd84a;text-shadow:${ring(1.4, '#1b1530', 12)},0 2px 0 #1b1530">Vague 2/3</span>`
    + `</div>`;
  const lien = done => `<div style="width:9px;height:6px;margin:0 -1px;border-radius:2px;background:${done ? 'linear-gradient(180deg,#fff3a0,#f7bc2a 50%,#cd7e15)' : 'linear-gradient(180deg,#4a4170,#2c2450)'};box-shadow:0 0 0 1.6px #1b1530"></div>`;
  const vagues = `<div style="display:flex;align-items:center">`
    + `<div style="width:30px;height:30px">${svg('ui/crane-fait.svg', { style: 'display:block;width:30px;height:30px' })}</div>`
    + lien(true)
    + `<div style="position:relative;width:42px;height:42px">`
    + `<div style="position:absolute;left:-14px;top:-14px;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,rgba(255,246,190,.9) 0%,rgba(255,206,74,.5) 40%,rgba(255,180,58,0) 70%)"></div>`
    + svg('ui/crane-vague.svg', { style: 'position:relative;display:block;width:42px;height:42px' })
    + `<div style="position:absolute;left:15px;top:43px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #ffd84a;filter:drop-shadow(0 1.5px 0 #1b1530)"></div>`
    + `</div>`
    + lien(false)
    + `<div style="width:34px;height:34px">${svg('ui/crane-boss.svg', { style: 'display:block;width:34px;height:34px' })}</div>`
    + `</div>`;
  const chrono = `<div style="position:relative;display:flex;align-items:center;height:30px;padding:0 10px 0 25px;margin-left:12px;border-radius:15px;${plaque}">`
    + svg('ui/sablier.svg', { style: 'position:absolute;left:-15px;top:-5px;width:40px;height:40px' })
    + `<span style="${LIL};font-size:19px;line-height:1;color:#ffffff;text-shadow:${ring(1.6, '#1b1530', 12)},0 2px 0 #1b1530">1:42</span>`
    + `</div>`;
  const pause = `<button type="button" aria-label="Pause" style="display:block;width:42px;height:42px;padding:0;margin:0;border:0;background:transparent;cursor:pointer">${svg('ui/pause.svg', { style: 'display:block;width:42px;height:42px' })}</button>`;
  return `<!-- ===== INTERFACE HAUTE ===== -->
<div style="position:absolute;left:0;top:0;width:390px;height:150px;background:linear-gradient(180deg,rgba(16,10,38,.86) 0%,rgba(16,10,38,.6) 42%,rgba(16,10,38,0) 100%)"></div>
<div style="position:absolute;left:10px;right:10px;top:14px;display:flex;align-items:center;justify-content:space-between">
${titre}
${vagues}
<div style="display:flex;align-items:center;gap:7px">${chrono}${pause}</div>
</div>`;
}

// ---------- bande d'interface basse ----------
const HEROS = [
  { k: 'guerrier', nom: 'Guerrier', vb: '66 30 124 178', fond: ['#ff8a72', '#d8323e', '#7a1430'], vie: 82, nrj: 60 },
  { k: 'mage',     nom: 'Mage',     vb: '60 26 124 178', fond: ['#c99bff', '#7d47cc', '#351868'], vie: 64, nrj: 18 },
  { k: 'archer',   nom: 'Archer',   vb: '64 34 124 178', fond: ['#a8ef78', '#3f9a36', '#1c4a26'], vie: 91, nrj: 100, pret: true },
  { k: 'paladin',  nom: 'Paladin',  vb: '64 32 124 178', fond: ['#8cc4ff', '#3773d8', '#162f6c'], vie: 47, nrj: 72 },
];
function barre(pct, h, grad, pleine = false, z = 0) {
  return `<div style="position:relative;z-index:${z};width:64px;height:${h}px;box-sizing:border-box;padding:2px;border-radius:${h / 2 + 1}px;background:#0d0820;box-shadow:0 0 0 1px rgba(255,255,255,.07)${pleine ? ',0 0 0 1.5px #fff3a0,0 0 10px 3px rgba(255,214,74,.85)' : ''}">`
    + `<div style="width:100%;height:100%;border-radius:${h / 2 - 1}px;background:#2e2550;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.6)">`
    + `<div style="width:${pct}%;height:100%;border-radius:${h / 2 - 1}px;background:${grad};box-shadow:inset 0 1px 0 rgba(255,255,255,.6)${pleine ? ',inset 0 -2px 0 rgba(255,255,255,.35)' : ''}"></div>`
    + `</div></div>`;
}
function carte(hh) {
  const pr = svg(P[hh.k].file, { vb: hh.vb, rename: [hh.k.slice(0, 2) + '-', hh.k.slice(0, 2) + 'p-'], style: 'position:absolute;left:0;top:0;width:58px;height:84px' });
  const [c1, c2, c3] = hh.fond;
  const rayons = hh.pret ? `<div style="position:absolute;left:-30px;top:-34px;width:118px;height:118px;background:repeating-conic-gradient(from 0deg,rgba(255,250,200,.55) 0deg 8deg,rgba(255,250,200,0) 8deg 22deg);border-radius:50%"></div>` : '';
  const glow = hh.pret ? ',0 0 0 4.5px #fff3a0,0 0 0 6px #1b1530,0 0 22px 10px rgba(255,214,74,.9),0 0 40px 14px rgba(255,190,60,.45)' : '';
  const anim = hh.pret ? 'animation:cbPret 1.1s ease-in-out infinite alternate;' : '';
  const tag = hh.pret ? `<div style="position:absolute;left:50%;top:-11px;transform:translateX(-50%);z-index:2;padding:2px 7px 3px;border-radius:9px;white-space:nowrap;${LIL};font-size:10.5px;line-height:1;color:#5a2a00;background:linear-gradient(180deg,#fffbd0 0%,#ffe168 45%,#f7bc2a 100%);box-shadow:0 0 0 1.8px #1b1530,0 2px 0 1.8px #1b1530">Sort prêt</div>` : '';
  const vieG = 'linear-gradient(180deg,#d6ffb0 0%,#7fe85a 35%,#45bf3c 62%,#2f8f35 100%)';
  const nrjG = 'linear-gradient(180deg,#fffbd0 0%,#ffe168 40%,#f7bc2a 75%,#d98a16 100%)';
  const halo = hh.pret ? `<div style="position:absolute;z-index:-1;left:-28px;top:-30px;width:120px;height:150px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,248,190,1) 0%,rgba(255,220,90,.75) 42%,rgba(255,190,60,0) 100%)"></div>`
    + [[3, 8, 7], [61, 18, 5.5], [59, 74, 6.5], [5, 64, 4.5]].map(([x, y, r]) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20" aria-hidden="true" focusable="false" style="position:absolute;left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px;z-index:3"><path d="M0 -10L2.8 -2.8L10 0L2.8 2.8L0 10L-2.8 2.8L-10 0L-2.8 -2.8Z" fill="#ffffff"/></svg>`).join('') : '';
  return `<div style="position:relative;z-index:${hh.pret ? 0 : 1};display:flex;flex-direction:column;align-items:center;gap:5px;width:64px">
${halo}<button type="button" aria-label="${hh.nom}${hh.pret ? ' : sort prêt' : ''}" style="position:relative;z-index:1;display:block;width:64px;height:90px;padding:3px;margin:0;border:0;border-radius:14px;cursor:pointer;${hh.pret ? 'transform:translateY(-3px);background:linear-gradient(155deg,#ffffff 0%,#fff7c4 22%,#ffe168 48%,#f7bc2a 80%,#cd7e15 100%);' : 'background:linear-gradient(155deg,#fff7c4 0%,#ffe168 18%,#f7bc2a 42%,#cd7e15 78%,#8f4c0a 100%);'}box-shadow:0 0 0 2px #1b1530,0 4px 0 2px #0b0720,inset 0 1.5px 0 rgba(255,255,255,.85),inset 0 -2px 0 rgba(110,50,0,.55)${glow};${anim}">
${tag}<div style="position:relative;width:58px;height:84px;border-radius:11px;overflow:hidden;background:radial-gradient(circle at 42% 34%,${c1} 0%,${c2} 48%,${c3} 100%)">
${rayons}${pr}
<div style="position:absolute;left:0;right:0;bottom:0;height:24px;background:linear-gradient(180deg,rgba(20,14,40,0) 0%,rgba(20,14,40,.88) 55%)"></div>
<div style="position:absolute;left:0;right:0;bottom:4px;text-align:center;${NUN};font-weight:900;font-size:10.5px;line-height:1;color:#ffffff;text-shadow:${ring(1.2, '#1b1530', 8)}">${hh.nom}</div>
<div style="position:absolute;left:0;top:0;width:58px;height:84px;border-radius:11px;box-shadow:inset 0 0 0 2px #1b1530,inset 0 4px 0 rgba(255,255,255,.18)"></div>
</div>
</button>
${barre(hh.vie, 11, vieG, false, 1)}
${barre(hh.nrj, 8, nrjG, hh.nrj >= 100)}
</div>`;
}
function iconeAuto() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="position:relative;display:block;width:20px;height:20px">
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M19 9.5A7.5 7.5 0 0 0 5.6 7.4M5 14.5A7.5 7.5 0 0 0 18.4 16.6" stroke="#1b4d1e" stroke-width="6"/>
<path d="M2.6 4.6L5.4 8L9.4 6.6M21.4 19.4L18.6 16L14.6 17.4" stroke="#1b4d1e" stroke-width="6"/>
<path d="M19 9.5A7.5 7.5 0 0 0 5.6 7.4M5 14.5A7.5 7.5 0 0 0 18.4 16.6" stroke="#ffffff" stroke-width="2.6"/>
<path d="M2.6 4.6L5.4 8L9.4 6.6M21.4 19.4L18.6 16L14.6 17.4" stroke="#ffffff" stroke-width="2.6"/>
</g></svg>`;
}
function iconeX2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16" aria-hidden="true" focusable="false" style="position:relative;display:block;width:20px;height:14px">
<g stroke-linejoin="round" stroke-linecap="round">
<path d="M2 2L10 8L2 14ZM12 2L20 8L12 14Z" fill="#1b1530" stroke="#1b1530" stroke-width="4"/>
<path d="M2 2L10 8L2 14ZM12 2L20 8L12 14Z" fill="#ffffff"/>
</g></svg>`;
}
function boutons() {
  const auto = `<button type="button" aria-pressed="true" style="position:relative;display:flex;align-items:center;justify-content:center;gap:4px;width:94px;height:72px;padding:0 0 4px;margin:0;border:0;border-radius:20px;cursor:pointer;background:linear-gradient(180deg,#b9f58a 0%,#8edc5e 22%,#4ea83c 58%,#3a8f34 100%);box-shadow:0 0 0 2.5px #1b1530,0 6px 0 2.5px #1b1530,0 6px 0 2.5px #1b1530,inset 0 -7px 0 #2f7432,inset 0 2px 0 rgba(255,255,255,.75),0 0 16px 3px rgba(142,220,94,.45)">
<span style="position:absolute;left:9px;right:9px;top:5px;height:24px;border-radius:14px 14px 22px 22px;background:linear-gradient(180deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,0) 100%)"></span>
${iconeAuto()}
<span style="position:relative;${LIL};font-size:25px;line-height:1;color:#ffffff;text-shadow:${ring(2, '#1b4d1e', 16)},0 3px 0 #1b4d1e">AUTO</span>
<span style="position:absolute;right:8px;top:7px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffffff 0%,#d8ff9a 40%,#62d64a 100%);box-shadow:0 0 0 1.5px #1b4d1e,0 0 6px 2px rgba(220,255,160,.9)"></span>
</button>`;
  const x2 = `<button type="button" aria-label="Vitesse x2" style="position:relative;display:flex;align-items:center;justify-content:center;gap:5px;width:94px;height:44px;padding:0 0 3px;margin:0;border:0;border-radius:16px;cursor:pointer;background:linear-gradient(180deg,#a9d4ff 0%,#6aaeff 25%,#3773d8 62%,#2a5cc0 100%);box-shadow:0 0 0 2.5px #1b1530,0 5px 0 2.5px #1b1530,inset 0 -5px 0 #23499c,inset 0 2px 0 rgba(255,255,255,.7)">
<span style="position:absolute;left:8px;right:8px;top:4px;height:14px;border-radius:10px 10px 16px 16px;background:linear-gradient(180deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 100%)"></span>
<span style="position:relative;${LIL};font-size:22px;line-height:1;color:#ffffff;text-shadow:${ring(2, '#162f6c', 16)},0 3px 0 #162f6c">x2</span>
${iconeX2()}
</button>`;
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:2px">${auto}${x2}</div>`;
}
function liseré() {
  // bordure dorée biseautée entre la scène et l'interface, avec ornement central
  const rivets = [24, 72, 120, 270, 318, 366].map(x => `<circle cx="${x}" cy="11" r="2.3" fill="url(#cb-or)" stroke="#1b1530" stroke-width="1.3"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 24" aria-hidden="true" focusable="false" style="position:absolute;left:0;top:-12px;width:390px;height:24px;overflow:visible">
<defs>
<linearGradient id="cb-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.45" stop-color="#f7bc2a"/><stop offset="1" stop-color="#b8680f"/></linearGradient>
<linearGradient id="cb-or-h" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.5" stop-color="#ffd451"/><stop offset="1" stop-color="#cd7e15"/></linearGradient>
<radialGradient id="cb-gemme" cx="0.38" cy="0.32" r="0.7"><stop offset="0" stop-color="#ff9a8e"/><stop offset="0.45" stop-color="#e3343d"/><stop offset="1" stop-color="#6e1129"/></radialGradient>
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<rect x="-2" y="4.5" width="394" height="13" fill="#1b1530"/>
<rect x="-2" y="7" width="394" height="8" fill="url(#cb-or)"/>
<path d="M-2 8.3H392" stroke="#fff7c4" stroke-width="1.1"/>
<path d="M-2 14H392" stroke="#8f4c0a" stroke-width="1"/>
${rivets}
<!-- ornement central -->
<path d="M150 11L166 3H224L240 11L224 19H166Z" fill="#1b1530" stroke="#1b1530" stroke-width="5"/>
<path d="M150 11L166 3H224L240 11L224 19H166Z" fill="url(#cb-or-h)"/>
<path d="M153 11L167 4.6H223L237 11" fill="none" stroke="#fff7c4" stroke-width="1.2"/>
<path d="M153 11L167 17.4H223L237 11" fill="none" stroke="#a8620f" stroke-width="1.2"/>
<path d="M150 11L166 3H224L240 11L224 19H166Z" fill="none" stroke="#1b1530" stroke-width="2.2"/>
<path d="M195 -3L209 11L195 25L181 11Z" fill="#1b1530" stroke="#1b1530" stroke-width="5"/>
<path d="M195 -3L209 11L195 25L181 11Z" fill="url(#cb-or-h)"/>
<path d="M195 3L203 11L195 19L187 11Z" fill="url(#cb-gemme)" stroke="#1b1530" stroke-width="1.8"/>
<path d="M192.5 7.8L195 5.6" stroke="#ffffff" stroke-width="1.6"/>
<path d="M195 -3L209 11L195 25L181 11Z" fill="none" stroke="#1b1530" stroke-width="2.2"/>
<circle cx="172" cy="11" r="2.2" fill="#e3343d" stroke="#1b1530" stroke-width="1.3"/><circle cx="218" cy="11" r="2.2" fill="#e3343d" stroke="#1b1530" stroke-width="1.3"/>
</g></svg>`;
}
function bandeBas() {
  const butin = `<div style="display:flex;align-items:center;justify-content:space-between;height:32px;padding:0 10px 0 12px;border-radius:16px;background:linear-gradient(180deg,rgba(6,3,18,.55),rgba(6,3,18,.35));box-shadow:inset 0 2px 5px rgba(0,0,0,.55),0 1px 0 rgba(255,255,255,.08)">
<div style="display:flex;align-items:center;gap:7px">
<span style="${NUN};font-weight:900;font-size:13px;color:#ffffff">Simon</span>
<span style="padding:2px 6px 3px;border-radius:7px;${LIL};font-size:11px;line-height:1;color:#ffffff;background:linear-gradient(180deg,#6a5ad8,#3e2f9e);box-shadow:0 0 0 1.5px #1b1530,inset 0 1px 0 rgba(255,255,255,.35)">Nv.30</span>
</div>
<div style="display:flex;align-items:center;gap:8px">
<span style="${NUN};font-weight:800;font-size:11px;color:#a99fd6;letter-spacing:.3px">Butin</span>
<div style="display:flex;align-items:center;gap:3px">${svg('ui/flouze.svg', { style: 'display:block;width:26px;height:26px' })}<span style="${LIL};font-size:15px;line-height:1;word-spacing:.15em;color:#ffffff;text-shadow:0 2px 0 #1b1530">1 250</span></div>
<div style="display:flex;align-items:center;gap:2px">${svg('ui/clef.svg', { style: 'display:block;width:24px;height:24px' })}<span style="${LIL};font-size:15px;line-height:1;color:#ffffff;text-shadow:0 2px 0 #1b1530">2</span></div>
</div>
</div>`;
  return `<!-- ===== INTERFACE BASSE ===== -->
<div style="position:absolute;left:0;top:556px;width:390px;height:44px;background:linear-gradient(180deg,rgba(16,10,38,0) 0%,rgba(16,10,38,.38) 100%)"></div>
<div style="position:absolute;left:0;top:598px;width:390px;height:246px;background:radial-gradient(130% 70% at 50% 0%,rgba(110,88,210,.38) 0%,rgba(110,88,210,0) 62%),repeating-linear-gradient(45deg,rgba(255,255,255,.028) 0px,rgba(255,255,255,.028) 2px,rgba(255,255,255,0) 2px,rgba(255,255,255,0) 11px),linear-gradient(180deg,#2c2360 0%,#1d1644 48%,#120c2b 100%);box-shadow:inset 0 10px 14px -6px rgba(0,0,0,.6)">
${liseré()}
<div style="position:absolute;left:10px;right:10px;top:30px;display:flex;align-items:flex-start;justify-content:space-between">
<div style="display:grid;grid-template-columns:repeat(4,64px);gap:6px">
${HEROS.map(carte).join('\n')}
</div>
${boutons()}
</div>
<div style="position:absolute;left:10px;right:10px;top:177px">${butin}</div>
<div style="position:absolute;left:128px;bottom:8px;width:134px;height:5px;border-radius:3px;background:rgba(255,255,255,.55)"></div>
</div>`;
}

// ---------- anneau de cible au sol (sous le loup) ----------
function cibleSol() {
  const q = POS.loup, cx = q.cx - 6, cy = q.feet - 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 600" aria-hidden="true" focusable="false" style="position:absolute;left:0;top:0;width:390px;height:600px">
<defs><radialGradient id="cb-cible" cx="0.5" cy="0.5" r="0.5"><stop offset="0.55" stop-color="#ff5a4e" stop-opacity="0"/><stop offset="0.9" stop-color="#ff5a4e" stop-opacity="0.45"/><stop offset="1" stop-color="#ff5a4e" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="${cx}" cy="${cy}" rx="66" ry="15" fill="url(#cb-cible)"/>
<ellipse cx="${cx}" cy="${cy}" rx="58" ry="12" fill="none" stroke="#1b1530" stroke-width="5" opacity="0.55"/>
<ellipse cx="${cx}" cy="${cy}" rx="58" ry="12" fill="none" stroke="#ff6a4e" stroke-width="2.6"/>
<path d="M${cx - 66} ${cy}l-9 -4v8Z M${cx + 66} ${cy}l9 -4v8Z" fill="#ff6a4e" stroke="#1b1530" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;
}

// ---------- scène ----------
function scene() {
  const ordre = Object.keys(POS).sort((a, b) => POS[a].feet - POS[b].feet);
  const persos = ordre.map(perso).join('\n');
  const barres = [
    vie('demon', 100, { ennemi: true, w: 66, boss: true, dy: -2 }),
    vie('mage', 64), vie('gluant', 72, { ennemi: true, w: 48, dy: -2 }), vie('paladin', 47, { dy: -6 }),
    vie('archer', 91), vie('loup', 34, { ennemi: true, w: 54, dy: 2 }), vie('guerrier', 82, { dy: -6 }),
  ].join('\n');
  const tete = (() => { const m = pt('guerrier', 170, 206); return m; })();
  const [lx, ly] = pt('loup', 90, 40);
  const [px, py] = pt('mage', 120, 18);
  const crit = chiffre('1 248', {
    x: 250, y: 420, size: 46, rot: -6, drop: 5,
    grad: 'linear-gradient(180deg,#fffbe0 0%,#ffe95a 34%,#ffc21f 64%,#ff8a1a 100%)',
    label: `<div style="${LIL};font-size:14px;line-height:1;margin:0 0 1px 6px;color:#ffffff;letter-spacing:.6px;text-shadow:${ring(2.2, '#b3121f', 16)},0 3px 0 #1b1530">CRITIQUE !</div>`,
  });
  const esq = chiffre('Esquive', {
    x: f2(px - 18), y: f2(py - 44), size: 17, rot: -4, ow: 2.4, drop: 3,
    grad: 'linear-gradient(180deg,#ffffff 0%,#d8f6ff 45%,#8fd8ff 100%)',
  });
  return `<!-- ===== SCÈNE : décor + combattants + effets ===== -->
<div style="position:absolute;left:0;top:0;width:390px;height:600px;overflow:hidden">
${svg('decor-foret.svg', { vb: '0 0 390 600', style: 'position:absolute;left:0;top:0;width:390px;height:600px' })}
${cibleSol()}
${persos}
<div style="position:absolute;left:0;top:0;width:390px;height:600px;background:radial-gradient(120% 80% at 50% 58%,rgba(16,10,38,0) 58%,rgba(16,10,38,.38) 100%)"></div>
<!-- effets -->
${effets()}
<!-- barres de vie -->
${barres}
${crit}
${esq}
</div>`;
}

// ---------- page ----------
const contenu = `<div style="width:390px;height:844px;position:relative;overflow:hidden;background:#120c2b;${NUN}">
${scene()}
${hudHaut()}
${bandeBas()}
</div>`;

const helmetStyle = `body{margin:0}
@keyframes cbPret{ from{ filter:brightness(1) } to{ filter:brightness(1.16) } }`;

const dc = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Combat C3 Blanche</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@600;800;900&display=swap" rel="stylesheet">
<style>
${helmetStyle}
</style>
</helmet>
${contenu}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
renderVals() { return {}; }
}
</script>
</body>
</html>
`;
if (/\{\{|\}\}/.test(contenu + helmetStyle)) throw new Error('{{ ou }} dans le contenu');
fs.writeFileSync(path.join(R, 'project/Main.dc.html'), dc);
const apercu = dc.replace('<x-dc>', '<div>').replace('</x-dc>', '</div>').replace('<helmet>', '').replace('</helmet>', '')
  .replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/, '').replace('<script src="./support.js"></script>', '');
fs.writeFileSync(path.join(R, 'previews/main-apercu.html'), apercu);
console.log('Main.dc.html', (dc.length / 1024).toFixed(1), 'Ko');
