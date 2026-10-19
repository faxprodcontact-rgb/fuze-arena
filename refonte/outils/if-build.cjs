// Planche « Interface » (kit d'interface de la refonte) : génère project/Interface.dc.html
// et sa copie de travail previews/interface-apercu.html.
// node tools/if-build.cjs
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');
const UI = R + '/art/ui/';

// ---------- outils ----------
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const rgba = (h, a) => `rgba(${hx(h).join(',')},${a})`;
const INK = '#1b1530';
const light = (c, t = 0.5) => mix(c, '#ffffff', t);
const dark = (c, t = 0.4) => mix(c, INK, t);

// contour de texte (16 directions) + petite chute en bas
function ol(c, w = 2, drop = 0) {
  const a = [];
  for (let i = 0; i < 16; i++) {
    const t = (Math.PI * 2 * i) / 16;
    a.push(`${(w * Math.cos(t)).toFixed(2)}px ${(w * Math.sin(t)).toFixed(2)}px 0 ${c}`);
  }
  if (drop) a.push(`0 ${drop}px 0 ${c}`, `${(w * 0.7).toFixed(2)}px ${drop}px 0 ${c}`, `-${(w * 0.7).toFixed(2)}px ${drop}px 0 ${c}`);
  return a.join(',');
}

// icône SVG collée en ligne ; à partir de la 2e copie, les id sont renommés (clef-xxx → clef2-xxx)
const used = {};
function icon(name, size, extra = '') {
  let s = fs.readFileSync(UI + name + '.svg', 'utf8').trim();
  const n = (used[name] = (used[name] || 0) + 1);
  if (n > 1) s = s.replace(new RegExp('(id="|url\\(#)' + name + '-', 'g'), `$1${name}${n}-`);
  return s.replace('<svg ', `<svg aria-hidden="true" focusable="false" style="display:block;width:${size}px;height:${size}px;flex:none;${extra}" `);
}

const LILITA = "font-family:'Lilita One',sans-serif;font-weight:400";
const NUNITO = "font-family:'Nunito',sans-serif";

// petite étincelle blanche à 4 branches (sans id)
const sparkle = (s, st = '') => `<svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" style="position:absolute;width:${s}px;height:${s}px;${st}"><path d="M10 1L12.2 7.8L19 10L12.2 12.2L10 19L7.8 12.2L1 10L7.8 7.8Z" fill="#ffffff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

// gemme à facettes (sans id)
function gem(c, s, st = '') {
  const L = light(c, 0.55), M = c, D = dark(c, 0.35), DD = dark(c, 0.6);
  return `<svg aria-hidden="true" focusable="false" viewBox="0 0 22 24" style="position:absolute;width:${s}px;height:${s * 24 / 22}px;${st}"><g stroke-linejoin="round"><path d="M11 1.5L20.5 9L11 22.5L1.5 9Z" fill="${INK}" stroke="${INK}" stroke-width="3"/><path d="M1.5 9L11 1.5L11 9Z" fill="${L}"/><path d="M11 1.5L20.5 9L11 9Z" fill="${M}"/><path d="M1.5 9L11 9L11 22.5Z" fill="${M}"/><path d="M11 9L20.5 9L11 22.5Z" fill="${DD}"/><path d="M6 9L11 9L11 22.5Z" fill="${D}" opacity="0.55"/><path d="M4.5 8L9.5 4" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/><path d="M11 1.5L20.5 9L11 22.5L1.5 9Z" fill="none" stroke="${INK}" stroke-width="1.6"/></g></svg>`;
}

// ---------- boutons ----------
const BTN = {
  or:    { t: '#fff6b8', a: '#ffdf5e', b: '#f7bc2a', c: '#e9951a', deep: '#b8650f', txt: '#7a3d06', glow: '#ffd45a' },
  vert:  { t: '#c4f79a', a: '#8edc5e', b: '#4ea83c', c: '#3a8f34', deep: '#2f7432', txt: '#1b4d1e', glow: '#8edc5e' },
  rouge: { t: '#ffb3a6', a: '#ff6d60', b: '#e3343d', c: '#c92a3a', deep: '#a81d35', txt: '#6e1129' },
  bleu:  { t: '#b8dcff', a: '#6aaeff', b: '#3773d8', c: '#2a5cc0', deep: '#23499c', txt: '#162f6c' },
  violet:{ t: '#c9b8ff', a: '#8f78f0', b: '#5e47c4', c: '#4a36a8', deep: '#35267e', txt: '#1f1650' },
  off:   { t: '#9b97b0', a: '#7f7a98', b: '#6a6585', c: '#5d5878', deep: '#47425f', txt: '#36324a' },
};
function button({ label = '', w, h, r = 18, k = 'or', fs = 22, edge = 6, icon: ic = '', off = false, glow = false, aria = '', round = false, extra = '' }) {
  const p = BTN[k];
  const shadow = [`0 0 0 2.5px ${INK}`, `0 ${edge}px 0 2.5px ${INK}`, `0 ${edge + 8}px 14px rgba(6,3,20,.5)`,
    `inset 0 -${edge + 1}px 0 ${p.deep}`, `inset 0 2px 0 rgba(255,255,255,${off ? 0.25 : 0.8})`, `inset 2px 0 0 rgba(255,255,255,${off ? 0.08 : 0.22})`, `inset -2px 0 0 rgba(0,0,0,.12)`];
  if (glow) shadow.push(`0 0 22px 4px ${rgba(p.glow, 0.45)}`);
  const bg = `linear-gradient(180deg,${p.t} 0%,${p.a} 22%,${p.b} 62%,${p.c} 100%)`;
  const txtColor = off ? '#c8c4da' : '#ffffff';
  return `<button type="button"${off ? ' disabled' : ''}${aria ? ` aria-label="${aria}"` : ''} style="position:relative;display:flex;align-items:center;justify-content:center;gap:8px;width:${w}px;height:${h}px;padding:0 0 ${edge - 1}px;margin:0;border:0;border-radius:${round ? '50%' : r + 'px'};cursor:${off ? 'not-allowed' : 'pointer'};background:${bg};box-shadow:${shadow.join(',')};flex:none;${extra}">`
    + `<span style="position:absolute;left:${round ? 7 : 9}px;right:${round ? 7 : 9}px;top:4px;height:${Math.round((h - edge) * 0.42)}px;border-radius:${round ? '50% 50% 45% 45%' : `${r - 5}px ${r - 5}px ${r + 6}px ${r + 6}px`};background:linear-gradient(180deg,rgba(255,255,255,${off ? 0.22 : 0.62}) 0%,rgba(255,255,255,0) 100%)"></span>`
    + (round ? '' : `<span style="position:absolute;left:3px;right:3px;top:3px;bottom:${edge + 2}px;border-radius:${r - 3}px;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,${off ? 0.12 : 0.28})"></span>`)
    + ic
    + (label ? `<span style="position:relative;${LILITA};font-size:${fs}px;line-height:1;letter-spacing:.3px;color:${txtColor};text-shadow:${ol(p.txt, 2, 3)}">${label}</span>` : '')
    + `</button>`;
}

// ---------- section ----------
function section(num, title, body, { note = '', style = '' } = {}) {
  return `<section style="position:relative;box-sizing:border-box;padding:14px 18px 16px;border-radius:20px;background:linear-gradient(180deg,rgba(70,54,168,.38) 0%,rgba(38,28,98,.38) 100%);box-shadow:inset 0 0 0 1.5px rgba(170,150,255,.16),inset 0 1.5px 0 rgba(255,255,255,.08),0 14px 30px rgba(5,2,20,.35);display:flex;flex-direction:column;min-width:0;${style}">`
    + `<div style="display:flex;align-items:center;gap:10px;height:24px;margin-bottom:12px;flex:none">`
    + `<span style="${LILITA};font-size:13px;line-height:1;color:#3a1d04;padding:4px 7px 3px;border-radius:7px;background:linear-gradient(180deg,#fff3b0 0%,#ffd45a 45%,#f0a92a 100%);box-shadow:0 0 0 2px ${INK},inset 0 -2px 0 #cd7e15">${num}</span>`
    + `<h2 style="margin:0;${LILITA};font-size:19px;line-height:1;letter-spacing:.4px;color:#ffffff;text-shadow:${ol(INK, 1.5, 2)}">${title}</h2>`
    + `<span style="flex:1;height:2px;border-radius:1px;background:linear-gradient(90deg,rgba(255,212,90,.55) 0%,rgba(255,212,90,0) 100%)"></span>`
    + (note ? `<span style="${NUNITO};font-weight:800;font-size:12px;color:#b8afe6;white-space:nowrap">${note}</span>` : '')
    + `</div>${body}</section>`;
}
const caption = t => `<span style="${NUNITO};font-weight:800;font-size:12px;line-height:1;color:#a99fd8;white-space:nowrap">${t}</span>`;

// ---------- 1. boutons ----------
function sectionBoutons() {
  const swordIc = icon('epee', 34, 'margin:-4px -2px -2px -6px;position:relative');
  const big = [
    [button({ label: 'Combattre', w: 226, h: 66, r: 22, k: 'or', fs: 30, edge: 7, icon: swordIc, glow: true }), 'Principal'],
    [button({ label: 'AUTO', w: 118, h: 58, r: 18, k: 'vert', fs: 24, glow: true })
      .replace('</button>', `<span style="position:absolute;right:9px;top:8px;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffffff 0%,#d8ff9a 40%,#62d64a 100%);box-shadow:0 0 0 1.5px #1b4d1e,0 0 6px 2px rgba(220,255,160,.9)"></span></button>`), 'Bascule (activée)'],
    [button({ label: 'Défier', w: 118, h: 58, r: 18, k: 'rouge', fs: 24 }), 'Défi'],
    [button({ label: 'Ouvrir', w: 118, h: 58, r: 18, k: 'bleu', fs: 24 }), 'Secondaire'],
    [button({ label: 'Ouvrir', w: 118, h: 58, r: 18, k: 'off', fs: 24, off: true }), 'Désactivé'],
  ];
  const row1 = `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px">${big.map(([b, c]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:13px">${b}${caption(c)}</div>`).join('')}</div>`;

  const ff = `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 16" style="display:block;width:22px;height:15px;position:relative;flex:none"><g stroke="#162f6c" stroke-width="2.4" stroke-linejoin="round"><path d="M2 2L11 8L2 14Z" fill="#ffffff"/><path d="M12 2L21 8L12 14Z" fill="#ffffff"/></g></svg>`;
  const plus = `<svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" style="display:block;width:18px;height:18px;position:relative"><path d="M10 3V17M3 10H17" stroke="#1b4d1e" stroke-width="7" stroke-linecap="round"/><path d="M10 3V17M3 10H17" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/></svg>`;
  const cross = `<svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" style="display:block;width:16px;height:16px;position:relative"><path d="M4 4L16 16M16 4L4 16" stroke="#6e1129" stroke-width="7" stroke-linecap="round"/><path d="M4 4L16 16M16 4L4 16" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/></svg>`;
  const small = [
    [button({ label: 'x2', w: 92, h: 44, r: 15, k: 'bleu', fs: 21, edge: 5, icon: ff, aria: 'Vitesse x2' }), 'Vitesse'],
    [button({ label: 'Passer', w: 104, h: 44, r: 15, k: 'violet', fs: 19, edge: 5 }), 'Tertiaire'],
    [button({ w: 46, h: 46, k: 'vert', edge: 5, icon: plus, round: true, aria: 'Acheter une clef' }), 'Acheter'],
    [button({ w: 42, h: 42, k: 'rouge', edge: 4, icon: cross, round: true, aria: 'Fermer' }), 'Fermer'],
  ];
  const row2 = `<div style="display:flex;align-items:center;gap:22px;margin-top:14px;padding-top:12px;border-top:1.5px dashed rgba(170,150,255,.18)">`
    + `<span style="${NUNITO};font-weight:900;font-size:12px;letter-spacing:1.2px;color:#ffd45a;width:86px;line-height:1.25">PETITS FORMATS</span>`
    + small.map(([b, c]) => `<div style="display:flex;align-items:center;gap:10px">${b}${caption(c)}</div>`).join('') + `</div>`;
  return section('01', 'Boutons', row1 + row2, { note: 'bombés · biseau · reflet · ombre portée' });
}

// ---------- 2. barres ----------
function bar({ pct, lag = 0, grad, deep, value, h = 26, ticks = 0, glowEnd = '#ffffff', fs }) {
  const r = h / 2 - 3;
  let tick = '';
  for (let k = 1; k < ticks; k++) tick += `<span style="position:absolute;left:calc(${(100 * k) / ticks}% - 1px);top:0;bottom:0;width:2.5px;background:rgba(27,21,48,.6)"></span>`;
  return `<div style="position:relative;height:${h}px;box-sizing:border-box;padding:3px;border-radius:${h / 2}px;background:linear-gradient(180deg,#0b061c 0%,#1a1238 100%);box-shadow:0 0 0 2.5px ${INK},0 3px 0 2.5px ${INK},inset 0 1px 0 rgba(255,255,255,.08)">`
    + `<div style="position:relative;width:100%;height:100%;border-radius:${r}px;background:#2e2550;overflow:hidden;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)">`
    + (lag ? `<span style="position:absolute;left:0;top:0;bottom:0;width:${lag}%;border-radius:${r}px;background:linear-gradient(180deg,#fff1ec 0%,#ff9b8a 55%,#e3343d 100%)"></span>` : '')
    + `<span style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;border-radius:${r}px;background:${grad};box-shadow:inset 0 2px 0 rgba(255,255,255,.65),inset 0 -${h > 16 ? 3 : 2}px 0 ${deep},inset -2px 0 0 ${rgba(glowEnd, 0.9)}"></span>`
    + (h > 16 ? `<span style="position:absolute;left:6px;top:3px;width:calc(${pct}% - 12px);height:30%;border-radius:6px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.1))"></span>` : '')
    + tick
    + `</div>`
    + (value ? `<span style="position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;${LILITA};font-size:${fs || h - 9}px;line-height:1;color:#ffffff;letter-spacing:.4px;text-shadow:${ol(INK, 1.8, 1)}">${value}</span>` : '')
    + `</div>`;
}
function barRow(ic, name, hint, b) {
  return `<div style="display:flex;align-items:center;gap:10px;height:36px">`
    + `<div style="display:flex;align-items:center;gap:8px;width:104px;flex:none">${ic}<div style="display:flex;flex-direction:column;gap:3px"><span style="${NUNITO};font-weight:900;font-size:15px;line-height:1;color:#ffffff;text-shadow:0 2px 0 ${INK}">${name}</span>${hint}</div></div>`
    + `<div style="flex:1;min-width:0;position:relative">${b}</div></div>`;
}
const hintTxt = (t, c = '#b8afe6') => `<span style="${NUNITO};font-weight:800;font-size:11px;line-height:1;color:${c};white-space:nowrap">${t}</span>`;
const G_VIE = 'linear-gradient(180deg,#d6ffb0 0%,#7fe85a 35%,#45bf3c 65%,#2f8f35 100%)';
const G_NRJ = 'linear-gradient(180deg,#fffbd0 0%,#ffe168 35%,#f7bc2a 70%,#d98a16 100%)';
function sectionBarres() {
  const vie = barRow(icon('coeur', 28), 'Vie', hintTxt('−24 subis', '#ff9b8a'),
    bar({ pct: 91, lag: 95, grad: G_VIE, deep: '#24702c', value: '520 / 572', glowEnd: '#eaffd0' }));
  const nrj = barRow(icon('eclair', 28), 'Énergie', hintTxt('sort à 100'),
    bar({ pct: 75, grad: G_NRJ, deep: '#b8650f', value: '75 / 100', ticks: 4, glowEnd: '#fffbe0' }));
  const xpBadge = `<div style="position:absolute;left:-8px;top:50%;transform:translateY(-50%);width:40px;height:40px;box-sizing:border-box;border-radius:50%;padding:3px;background:linear-gradient(160deg,#fff6c9 0%,#ffd65a 30%,#e9a024 60%,#9c560c 100%);box-shadow:0 0 0 2.5px ${INK},0 3px 0 2.5px ${INK};z-index:2"><div style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 40% 30%,#c79bff 0%,#8a4fe0 45%,#4a2296 100%);box-shadow:0 0 0 1.5px ${INK},inset 0 2px 0 rgba(255,255,255,.35);${LILITA};font-size:16px;color:#ffffff;text-shadow:${ol('#2a0f5e', 1.6, 1)}">30</div></div>`;
  const xp = barRow(icon('etoile', 28), 'XP', hintTxt('Nv. 30 → 31', '#d6b8ff'),
    `<div style="position:relative;padding-left:26px">${xpBadge}${bar({ pct: 64, grad: 'linear-gradient(180deg,#f0dcff 0%,#c592ff 35%,#9a55f0 68%,#6c2fc4 100%)', deep: '#4f1f9c', value: '1 664 / 2 600', glowEnd: '#f6ebff' })}</div>`);
  const mini = `<div style="display:flex;align-items:center;gap:16px;margin-top:2px;padding-top:12px;border-top:1.5px dashed rgba(170,150,255,.18)">`
    + `<span style="${NUNITO};font-weight:900;font-size:12px;letter-spacing:1.2px;color:#ffd45a;width:104px;line-height:1.25;flex:none">MINI</span>`
    + `<div style="display:flex;flex-direction:column;gap:7px;width:120px;flex:none">${bar({ pct: 47, grad: G_VIE, deep: '#24702c', h: 13, glowEnd: '#eaffd0' })}${bar({ pct: 72, grad: G_NRJ, deep: '#b8650f', h: 10, glowEnd: '#fffbe0' })}</div>`
    + caption('sous les portraits')
    + `</div>`;
  return section('02', 'Barres', `<div style="display:flex;flex-direction:column;gap:10px">${vie}${nrj}${xp}${mini}</div>`);
}

// ---------- 3. cartes d'objets ----------
const RAR = [
  ['Commun', '#a4a9b3'], ['Peu commun', '#4cd964'], ['Rare', '#3d9bff'], ['Épique', '#b05cff'],
  ['Légendaire', '#ff9f1a'], ['Mythique', '#ff3d6e'], ['Chaotique', '#ff2bd6'],
];
const GOLD_FRAME = 'linear-gradient(160deg,#fff6c9 0%,#ffd65a 22%,#e9a024 48%,#9c560c 72%,#f2b544 100%)';
function stud(x, y, gold) {
  const g = gold ? 'radial-gradient(circle at 35% 30%,#ffffff 0%,#fff3b0 25%,#f7bc2a 55%,#b8650f 100%)' : 'radial-gradient(circle at 35% 30%,#ffffff 0%,#eef2fa 25%,#c3cce0 55%,#6f7a9b 100%)';
  return `<span style="position:absolute;${x};${y};width:9px;height:9px;border-radius:50%;background:${g};box-shadow:0 0 0 1.8px ${INK}"></span>`;
}
function card(i) {
  const [name, c] = RAR[i];
  const L = light(c, 0.55), LL = light(c, 0.8), D = dark(c, 0.45), DD = dark(c, 0.72), DDD = dark(c, 0.86);
  const chaos = i === 6, high = i >= 4;
  const itemName = i % 2 === 0 ? 'epee' : 'bouclier';
  const W = 150, H = 180;
  // cadre : simple (couleur) ou double (or + couleur)
  const colorFrame = chaos
    ? 'linear-gradient(135deg,#ffb8f2 0%,#ff2bd6 22%,#7b3cff 45%,#2be0ff 62%,#ff2bd6 80%,#ffd0f6 100%)'
    : `linear-gradient(160deg,${LL} 0%,${L} 18%,${c} 40%,${D} 70%,${c} 88%,${L} 100%)`;
  const glow = i >= 3 ? `,0 0 ${[0, 0, 0, 14, 22, 26, 32][i]}px ${[0, 0, 0, 2, 5, 6, 9][i]}px ${rgba(c, [0, 0, 0, 0.35, 0.55, 0.6, 0.7][i])}` : '';
  const shadow = `0 0 0 2.5px ${INK},0 6px 0 2.5px ${INK},0 12px 18px rgba(6,3,20,.55)${glow}`;
  // fond de la carte
  let bg = `radial-gradient(circle at 50% 40%,${LL} 0%,${L} 14%,${c} 38%,${D} 74%,${DD} 100%)`;
  if (i === 0) bg = `radial-gradient(circle at 50% 40%,#eef0f4 0%,#c6cad3 30%,#8e93a0 70%,#5f6472 100%)`;
  if (high && !chaos) bg = `radial-gradient(circle at 50% 42%,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 30%,${rgba(DD, 0.85)} 100%),repeating-conic-gradient(from 0deg at 50% 42%,rgba(255,255,255,.26) 0deg 9deg,rgba(255,255,255,0) 9deg 22.5deg),radial-gradient(circle at 50% 42%,#ffffff 0%,${LL} 12%,${L} 26%,${c} 50%,${D} 82%,${DD} 100%)`;
  if (chaos) bg = `radial-gradient(circle at 50% 42%,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 26%,rgba(20,4,40,.88) 100%),repeating-conic-gradient(from 8deg at 50% 42%,rgba(255,120,240,.38) 0deg 8deg,rgba(43,224,255,.0) 8deg 15deg,rgba(43,224,255,.32) 15deg 19deg,rgba(255,255,255,0) 19deg 30deg),radial-gradient(circle at 50% 42%,#ffffff 0%,#ffc4f4 10%,#ff2bd6 30%,#8a1fd0 60%,#2a0a52 100%)`;
  const inner = `<div style="position:relative;width:100%;height:100%;border-radius:${high ? 11 : 13}px;overflow:hidden;background:${bg};box-shadow:inset 0 0 0 2px ${INK},inset 0 4px 0 rgba(255,255,255,.28)">`
    + `<span style="position:absolute;left:-30%;top:-40%;width:90%;height:90%;transform:rotate(-30deg);background:linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,0) 100%);border-radius:50%"></span>`
    + `<span style="position:absolute;left:28px;right:28px;top:${high ? 96 : 96}px;height:14px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(20,10,40,.55) 0%,rgba(20,10,40,0) 70%)"></span>`
    + icon(itemName, high ? 92 : 86, `position:absolute;left:50%;top:${high ? 14 : 18}px;transform:translateX(-50%)`)
    + `<div style="position:absolute;left:0;right:0;bottom:0;height:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:linear-gradient(180deg,${rgba(DDD, 0)} 0%,${rgba(DDD, 0.82)} 30%,${rgba(DDD, 0.95)} 100%)">`
    + `<span style="${LILITA};font-size:${name.length > 9 ? 16 : 17}px;line-height:1;letter-spacing:.3px;color:${i === 0 ? '#ffffff' : LL};text-shadow:${ol(INK, 2, 2)};white-space:nowrap">${name}</span>`
    + `<span style="display:flex;gap:3px">${Array.from({ length: 7 }, (_, k) => `<span style="width:7px;height:7px;transform:rotate(45deg);border-radius:1.5px;${k <= i ? `background:linear-gradient(135deg,#ffffff 0%,${L} 35%,${c} 100%);box-shadow:0 0 0 1.4px ${INK}` : `background:${rgba('#000000', 0.35)};box-shadow:0 0 0 1.2px ${rgba(INK, 0.7)}`}"></span>`).join('')}</span>`
    + `</div></div>`;
  let frame;
  if (high) {
    frame = `<div style="position:absolute;inset:0;box-sizing:border-box;border-radius:18px;padding:3.5px;background:${GOLD_FRAME};box-shadow:${shadow}">`
      + `<div style="width:100%;height:100%;box-sizing:border-box;border-radius:15px;padding:3.5px;background:${colorFrame};box-shadow:0 0 0 1.6px ${INK}">${inner}</div></div>`;
  } else {
    frame = `<div style="position:absolute;inset:0;box-sizing:border-box;border-radius:17px;padding:5px;background:${colorFrame};box-shadow:${shadow}">${inner}</div>`;
  }
  // ornements
  let orn = '';
  if (i >= 2) orn += stud('left:7px', 'top:7px', i >= 3) + stud('right:7px', 'top:7px', i >= 3) + stud('left:7px', 'bottom:7px', i >= 3) + stud('right:7px', 'bottom:7px', i >= 3);
  if (i >= 3) {
    // cimier : gemme sertie en haut
    const gs = i >= 4 ? 22 : 17;
    orn += `<span style="position:absolute;left:50%;top:${-gs / 2 - 3}px;transform:translateX(-50%);width:${gs + 12}px;height:${gs + 10}px;border-radius:${i >= 4 ? '50% 50% 45% 45%' : '50%'};background:${GOLD_FRAME};box-shadow:0 0 0 2.2px ${INK},0 3px 0 2px ${INK}"></span>`
      + gem(chaos ? '#ff2bd6' : c, gs, `left:50%;top:${-gs / 2 + 1}px;transform:translateX(-50%)`);
  }
  if (i >= 5) {
    orn += gem(chaos ? '#2be0ff' : c, 13, `left:-7px;top:${H / 2 - 22}px`) + gem(chaos ? '#2be0ff' : c, 13, `right:-7px;top:${H / 2 - 22}px`);
  }
  if (i >= 4) orn += sparkle(16, 'right:16px;top:26px') + sparkle(11, 'left:18px;top:56px');
  if (i >= 5) orn += sparkle(10, 'right:24px;top:84px');
  if (chaos) orn += sparkle(13, 'left:26px;top:22px');
  return `<div style="position:relative;width:${W}px;height:${H}px;flex:none">${frame}${orn}</div>`;
}
function sectionCartes() {
  const cards = RAR.map((_, i) => card(i)).join('');
  return section('03', 'Cartes d’objets par rareté', `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px 4px 0;flex:none">${cards}</div>`,
    { note: 'plus la rareté monte, plus le cadre est orné · Mythique et Chaotique : par fusion' });
}

// ---------- 4. icônes ----------
const ICONS = [
  ['crane-vague', 'Crâne vague'], ['crane-boss', 'Crâne boss'], ['crane-fait', 'Crâne fait'], ['sablier', 'Sablier'],
  ['pause', 'Pause'], ['coffre', 'Coffre'], ['clef', 'Clef'], ['flouze', 'Flouze'],
  ['couronne', 'Couronne'], ['epee', 'Épée'], ['bouclier', 'Bouclier'], ['coeur', 'Cœur'],
  ['eclair', 'Éclair'], ['etoile', 'Étoile'], ['sac', 'Sac'],
];
const SLOT = (inner, s = 62, extra = '') => `<div style="position:relative;width:${s}px;height:${s}px;box-sizing:border-box;border-radius:15px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 38%,#3a2f86 0%,#251c5e 60%,#1a1347 100%);box-shadow:0 0 0 2px ${INK},inset 0 0 0 1.5px rgba(170,150,255,.18),inset 0 -4px 0 rgba(10,5,30,.45),inset 0 3px 6px rgba(0,0,0,.35),0 2px 0 2px rgba(255,255,255,.05);flex:none;${extra}">${inner}</div>`;
function sectionIcones() {
  const cells = ICONS.map(([f, n]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:7px">${SLOT(icon(f, 48))}<span style="${NUNITO};font-weight:800;font-size:11.5px;line-height:1;color:#d9d3f7;white-space:nowrap">${n}</span></div>`).join('')
    + `<div style="display:flex;flex-direction:column;align-items:center;gap:7px"><div style="width:62px;height:62px;box-sizing:border-box;border-radius:15px;border:2px dashed rgba(170,150,255,.28)"></div><span style="${NUNITO};font-weight:800;font-size:11.5px;line-height:1;color:#7d74ad">Case vide</span></div>`;
  return section('04', 'Icônes', `<div style="display:grid;grid-template-columns:repeat(8,1fr);row-gap:20px;column-gap:4px">${cells}</div>`, { note: '15 icônes · art/ui' });
}

// ---------- 5. panneau coffre ----------
function sectionCoffre() {
  const pips = [1, 1, 1].map(on => `<span style="width:13px;height:13px;transform:rotate(45deg);border-radius:3px;background:${on ? 'linear-gradient(135deg,#fff7c4 0%,#ffd45a 40%,#e0a42c 100%)' : '#2a1f55'};box-shadow:0 0 0 2px ${INK},inset 0 -2px 0 rgba(160,90,10,.6)"></span>`).join('');
  const chest = `<div style="position:relative;width:112px;height:112px;flex:none;display:flex;align-items:center;justify-content:center">`
    + `<span style="position:absolute;left:50%;top:50%;width:150px;height:150px;transform:translate(-50%,-50%);border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,214,110,.34) 0deg 10deg,rgba(255,214,110,0) 10deg 24deg);-webkit-mask-image:radial-gradient(circle,#000 28%,transparent 68%);mask-image:radial-gradient(circle,#000 28%,transparent 68%)"></span>`
    + `<span style="position:absolute;left:50%;top:50%;width:118px;height:118px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,236,160,.8) 0%,rgba(255,170,60,.38) 38%,rgba(255,120,40,0) 70%)"></span>`
    + `<span style="position:absolute;left:50%;bottom:8px;width:84px;height:13px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse at center,rgba(15,5,30,.6) 0%,rgba(15,5,30,0) 70%)"></span>`
    + icon('coffre', 100, 'position:relative')
    + sparkle(15, 'right:0;top:8px') + sparkle(10, 'right:-4px;top:34px')
    + `<span style="position:absolute;left:-2px;top:8px;min-width:32px;height:24px;box-sizing:border-box;padding:0 6px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#ff8a7a 0%,#e3343d 60%,#b8243a 100%);box-shadow:0 0 0 2.2px ${INK},0 3px 0 2px ${INK},inset 0 1.5px 0 rgba(255,255,255,.5);${LILITA};font-size:15px;line-height:1;color:#ffffff;text-shadow:${ol('#6e1129', 1.5, 1)}">x1</span>`
    + `</div>`;
  const body = `<div style="position:relative;flex:1;min-height:0;box-sizing:border-box;border-radius:18px;padding:4px;background:${GOLD_FRAME};box-shadow:0 0 0 2.5px ${INK},0 6px 0 2.5px ${INK},0 14px 22px rgba(6,3,20,.55)">`
    + `<div style="position:relative;height:100%;box-sizing:border-box;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;background:radial-gradient(circle at 24% 62%,#8a2e6e 0%,#5a1d5e 38%,#341454 70%,#221040 100%);box-shadow:inset 0 0 0 2px ${INK}">`
    // bandeau de titre
    + `<div style="position:relative;flex:none;height:36px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#4a1c63 0%,#2c0f45 100%);box-shadow:inset 0 -2px 0 ${INK},0 2px 0 rgba(255,212,90,.55),inset 0 2px 0 rgba(255,255,255,.14)">`
    + `<h3 style="margin:0;${LILITA};font-size:20px;line-height:1;letter-spacing:.3px;color:#ffe9a8;text-shadow:${ol(INK, 2, 2)}">Coffre de combat</h3></div>`
    // contenu
    + `<div style="position:relative;flex:1;display:flex;align-items:center;gap:12px;padding:0 14px 0 10px">`
    + `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:none">${chest}<div style="display:flex;align-items:center;gap:8px">${pips}<span style="${LILITA};font-size:14px;line-height:1;color:#ffffff;text-shadow:${ol(INK, 1.5, 1)}">3 / 3</span></div></div>`
    + `<div style="display:flex;flex-direction:column;gap:12px;min-width:0;flex:1">`
    + `<p style="margin:0;${NUNITO};font-weight:700;font-size:12.5px;line-height:1.35;color:#f1e8fa">Gagne 3 combats d’arène pour en obtenir un. Il contient <b style="font-weight:900;color:#ffd45a">2 objets</b> !</p>`
    + button({ label: 'Ouvrir', w: 138, h: 46, r: 15, k: 'bleu', fs: 21, edge: 5 })
    + `</div></div></div>`
    + `<span style="position:absolute;right:-10px;top:-12px;transform:rotate(8deg);padding:5px 10px 4px;border-radius:9px;background:linear-gradient(180deg,#ff8a7a 0%,#e3343d 55%,#b8243a 100%);box-shadow:0 0 0 2.2px ${INK},0 3px 0 2px ${INK},inset 0 1.5px 0 rgba(255,255,255,.5);${LILITA};font-size:14px;line-height:1;color:#ffffff;text-shadow:${ol('#6e1129', 1.5, 1)}">Nouveau</span>`
    + `</div>`;
  return section('05', 'Panneau type', body);
}

// ---------- 6. pastilles et notifications ----------
function badge(txt, k = 'rouge', st = '') {
  const g = k === 'rouge' ? ['#ff8a7a', '#e3343d', '#b8243a', '#6e1129'] : k === 'or' ? ['#fff6b8', '#ffd45a', '#e9951a', '#7a3d06'] : ['#c4f79a', '#62d64a', '#2f8f35', '#1b4d1e'];
  return `<span style="position:absolute;${st};min-width:24px;height:24px;box-sizing:border-box;padding:0 6px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%);box-shadow:0 0 0 2.2px ${INK},0 2.5px 0 2px ${INK},inset 0 1.5px 0 rgba(255,255,255,.55);${LILITA};font-size:15px;line-height:1;color:#ffffff;text-shadow:${ol(g[3], 1.4, 1)}">${txt}</span>`;
}
function sectionNotifs() {
  const slots = `<div style="display:flex;justify-content:space-between;padding:6px 6px 0 0">`
    + SLOT(icon('coffre', 40) + badge('3', 'rouge', 'right:-9px;top:-9px'), 52)
    + SLOT(icon('sac', 40) + `<span style="position:absolute;right:-5px;top:-5px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffc2b8 0%,#ff4d4d 45%,#c01f33 100%);box-shadow:0 0 0 2.2px ${INK}"></span>`, 52)
    + SLOT(icon('clef', 40) + badge('+1', 'vert', 'right:-12px;top:-9px'), 52)
    + `</div>`;
  const ribbon = `<div style="position:relative;align-self:center;width:150px;height:34px;display:flex;align-items:center;justify-content:center">`
    + `<svg aria-hidden="true" focusable="false" viewBox="0 0 150 34" style="position:absolute;inset:0;width:150px;height:34px"><g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"><path d="M4 9L24 9L24 31L4 31L11 20Z" fill="#a81d35"/><path d="M146 9L126 9L126 31L146 31L139 20Z" fill="#a81d35"/><path d="M24 31L30 27L30 31Z" fill="#6e1129"/><path d="M126 31L120 27L120 31Z" fill="#6e1129"/><path d="M18 4L132 4L132 27L18 27Z" fill="#e3343d"/><path d="M18 18L132 18L132 27L18 27Z" fill="#c22a3a" stroke="none"/><path d="M20 7.5L130 7.5" stroke="#ff8a7a" stroke-width="2"/><path d="M18 4L132 4L132 27L18 27Z" fill="none"/></g></svg>`
    + `<span style="position:relative;margin-top:-6px;${LILITA};font-size:17px;line-height:1;letter-spacing:.6px;color:#ffffff;text-shadow:${ol('#6e1129', 1.6, 1)}">Nouveau</span>`
    + sparkle(13, 'right:22px;top:-6px')
    + `</div>`;
  const bubble = `<div style="position:relative;align-self:center;margin-top:2px">`
    + `<div style="position:relative;display:flex;align-items:center;gap:8px;height:46px;box-sizing:border-box;padding:0 16px 0 10px;border-radius:23px;background:linear-gradient(180deg,#4a3aa8 0%,#2f2478 55%,#241b5c 100%);box-shadow:0 0 0 2.5px #f7bc2a,0 0 0 5px ${INK},0 4px 0 5px ${INK},0 12px 18px rgba(6,3,20,.55),inset 0 2px 0 rgba(255,255,255,.22)">`
    + icon('clef', 36, 'margin-left:-2px')
    + `<span style="${LILITA};font-size:22px;line-height:1;color:#ffe9a8;text-shadow:${ol(INK, 2, 2)};white-space:nowrap">+1 clef</span>`
    + `</div>`
    + `<span style="position:absolute;left:30px;bottom:-11px;width:16px;height:16px;transform:rotate(45deg);background:#241b5c;box-shadow:2.5px 2.5px 0 #f7bc2a,5px 5px 0 ${INK}"></span>`
    + `</div>`;
  const body = `<div style="display:flex;flex-direction:column;justify-content:space-between;flex:1;padding-bottom:10px">${slots}${ribbon}${bubble}</div>`;
  return section('06', 'Notifications', body);
}

// ---------- en-tête ----------
function header() {
  const sw = (c, n) => `<div style="display:flex;align-items:center;gap:6px"><span style="width:18px;height:18px;border-radius:6px;background:${c};box-shadow:0 0 0 2px ${INK},inset 0 2px 0 rgba(255,255,255,.3)"></span><span style="${NUNITO};font-weight:800;font-size:11.5px;color:#b8afe6">${n}</span></div>`;
  return `<header style="display:flex;align-items:flex-end;gap:24px;height:58px;flex:none">`
    + `<div style="display:flex;flex-direction:column;gap:6px">`
    + `<span style="${NUNITO};font-weight:900;font-size:12px;letter-spacing:2.4px;color:#ffd45a">FUZE ARENA · REFONTE GRAPHIQUE</span>`
    + `<h1 style="margin:0;${LILITA};font-size:42px;line-height:.95;letter-spacing:.5px;color:#ffffff;text-shadow:${ol(INK, 3, 4)},0 8px 18px rgba(0,0,0,.45)">Interface</h1>`
    + `</div>`
    + `<p style="margin:0 0 6px;${NUNITO};font-weight:700;font-size:13.5px;line-height:1.4;color:#b8afe6;max-width:380px">Le kit de composants de toutes les pages du jeu : contour <b style="color:#ffffff">#1b1530</b>, lumière en haut à gauche, or biseauté et couleurs saturées.</p>`
    + `<span style="flex:1"></span>`
    + `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:4px">`
    + `<div style="display:flex;gap:14px;align-items:baseline;justify-content:flex-end"><span style="${LILITA};font-size:22px;line-height:1;color:#ffffff">Lilita One</span><span style="${NUNITO};font-weight:800;font-size:12px;color:#b8afe6">titres et chiffres</span><span style="${NUNITO};font-weight:900;font-size:18px;line-height:1;color:#ffffff">Nunito</span><span style="${NUNITO};font-weight:800;font-size:12px;color:#b8afe6">textes</span></div>`
    + `<div style="display:flex;gap:14px;justify-content:flex-end">${sw(INK, 'Contour')}${sw('linear-gradient(180deg,#fff7c4,#f7bc2a 55%,#cd7e15)', 'Or')}${sw('linear-gradient(180deg,#3a2c8c,#1d1650)', 'Nuit')}${sw('#4ea83c', 'Action')}${sw('#3773d8', 'Info')}${sw('#e3343d', 'Alerte')}</div>`
    + `</div></header>`;
}

// ---------- page ----------
const content = `<div style="position:relative;width:1240px;height:900px;overflow:hidden;box-sizing:border-box;padding:20px 24px 22px;display:flex;flex-direction:column;gap:14px;background:radial-gradient(ellipse 760px 420px at 12% -6%,rgba(132,92,255,.32) 0%,rgba(132,92,255,0) 70%),radial-gradient(ellipse 700px 520px at 104% 104%,rgba(255,43,214,.13) 0%,rgba(255,43,214,0) 70%),radial-gradient(circle,rgba(255,255,255,.055) 1.2px,rgba(255,255,255,0) 1.8px) 0 0/30px 30px,linear-gradient(180deg,#221a5e 0%,#181046 50%,#100a30 100%);${NUNITO};color:#ffffff;-webkit-font-smoothing:antialiased">`
  + header()
  + `<div style="display:grid;grid-template-columns:770px 1fr;gap:20px;height:236px;flex:none">${sectionBoutons()}${sectionBarres()}</div>`
  + `<div style="height:256px;flex:none;display:flex;flex-direction:column">${sectionCartes()}</div>`
  + `<div style="display:grid;grid-template-columns:620px 318px 1fr;gap:20px;flex:1;min-height:0;align-items:stretch">${sectionIcones()}${sectionCoffre()}${sectionNotifs()}</div>`
  + `</div>`;

const head = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Interface</title>
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
const tail = `<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1240,"height":900}}'>
class Component extends DCLogic {
renderVals() { return {}; }
}
</script>
</body>
</html>
`;
const dc = head + `<x-dc>\n<helmet>\n${helmet}</helmet>\n${content}\n</x-dc>\n` + tail;
const apercu = head.replace('<script src="./support.js"></script>\n', '') + `<div>\n${helmet}${content}\n</div>\n</body>\n</html>\n`;

// contrôles
const ids = [...dc.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
const refs = [...dc.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]).filter(r => !ids.includes(r));
const errs = [];
if (dup.length) errs.push('id en double : ' + [...new Set(dup)].slice(0, 8).join(', '));
if (refs.length) errs.push('url(#) sans cible : ' + [...new Set(refs)].slice(0, 8).join(', '));
if (/\{\{|\}\}/.test(content)) errs.push('{{ ou }} dans le contenu');
if (/<script(?![^>]*(support\.js|text\/x-dc))/.test(dc)) errs.push('script en trop');
fs.writeFileSync(R + '/project/Interface.dc.html', dc);
fs.writeFileSync(R + '/previews/interface-apercu.html', apercu);
console.log(errs.length ? 'PROBLÈMES : ' + errs.join(' | ') : 'OK', `${(dc.length / 1024).toFixed(0)} Ko, ${ids.length} id`, JSON.stringify(used));
