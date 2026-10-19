// Décors de combat de la refonte : écrit art/decors/<thème>.svg (12 thèmes).
// node refonte/outils/decors.cjs [thème …]
// Repères (voir decors-kit.cjs) : 480 × 660, horizon y≈570, pieds y=615, lèvre du sol y≈648, bas 660.
// Chaque fichier porte un commentaire THEME (JSON) lu par le jeu : ciel (haut → horizon), terre sous le décor (deep),
// étoiles, soleil/lune, nuages. Les plans : loin (bouge peu), milieu, sol (fixe, avec les grands éléments du devant).
const fs = require('fs'), path = require('path');
const K = require('./decors-kit.cjs');
const { n0, n1, mix, tones, hazed, rng, p, s, poly, Doc, puff, hillRow, foliage, mountains, rock, spike, crystal, crystals, pine, deadTree, tufts, fringe, pebbles, flowers, ground, lip, wall, pillar, banner, torch, tomb, cloud } = K;
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'art', 'decors');
fs.mkdirSync(OUT, { recursive: true });

const THEMES = {};
function save(id, title, D, meta, ranges) {
  const file = path.join(OUT, id + '.svg');
  const n = D.write(file, title, ranges);
  // le commentaire THEME est ajouté juste après l'en-tête
  const txt = fs.readFileSync(file, 'utf8').replace('<defs>', `<!-- THEME ${JSON.stringify(Object.assign({ hz: 60 }, meta))} -->\n<defs>`);
  fs.writeFileSync(file, txt);
  console.log(id.padEnd(9), (n / 1024).toFixed(1).padStart(5), 'Ko');
}
// bande de brume au pied du plan lointain
const haze = (D, y0, y1, col, a = 0.7) => p(`M-30 ${y0}H510V${y1}H-30Z`, D.vgrad(y0, y1, [[0, col, 0], [1, col, a]]));

// =====================================================================================
// FORÊT : la maquette (art/decor-foret.svg, 390 × 844) agrandie ×1,4 et recalée sur l'horizon
// =====================================================================================
THEMES.forest = () => {
  const src = fs.readFileSync(path.join(ROOT, 'refonte', 'art', 'decor-foret.svg'), 'utf8');
  const D = Doc('fo');
  const defs = src.match(/<defs>([\s\S]*?)<\/defs>/)[1];
  const sec = {};
  const parts = src.split(/<!-- ===== (.+?) ===== -->/);
  for (let i = 1; i < parts.length; i += 2) sec[parts[i]] = parts[i + 1].replace(/<\/g>\s*<\/svg>\s*$/, '');
  const T = (xml) => `<g transform="translate(-33 24) scale(1.4)">${xml}</g>`;
  D.defs(defs);
  D.add('loin', T(sec['ARBRES LOINTAINS']));
  D.add('milieu', T(sec['ARBRES DU FOND']));
  D.add('sol', T(sec['SOL'] + sec['RAYONS DE LUMIÈRE'] + sec['GRAND ARBRE GAUCHE'] + sec['GRAND ARBRE DROITE'] + sec['FEUILLAGES'] + sec['PREMIER PLAN']));
  const L = { dirt: '#6b4430', deep: '#56372a', top: '#6aaa4a', topL: '#8fca6c', o: '#24502c' };
  D.add('sol', lip(D, 648, L, 7));
  save('forest', 'forêt enchantée', D, { sky: ['#4bb8d0', '#8fdcd6', '#d2f3cc', '#e2f7c8'], deep: L.deep, stars: false, cloud: '#f6fffc' }, { loin: [180, 600], milieu: [300, 600], sol: [0, 660] });
};

// =====================================================================================
// GROTTE : paroi du fond sur toute la hauteur, puits de lumière, plafond à stalactites, cristaux verts
// =====================================================================================
THEMES.cave = () => {
  const D = Doc('gr');
  const R = tones('#6a5a94'), Rd = tones('#54467e'), G = tones('#3fe07a');
  // --- loin : paroi du fond (de plus en plus claire vers le bas), rangs de roches, lueurs, puits de lumière
  D.add('loin', p('M-30 -10H510V610H-30Z', D.vgrad(0, 600, [[0, '#1c1536'], [0.55, '#2e2552'], [1, '#463a6e']])));
  D.add('loin', mountains(D, [[-30, 300], [30, 230], [80, 276], [140, 196], [200, 262], [250, 216], [300, 270], [360, 188], [420, 250], [470, 210], [510, 240]], 610, hazed(tones('#3a3062'), '#2e2552', 0.3)));
  D.add('loin', mountains(D, [[-30, 470], [20, 420], [60, 450], [110, 392], [160, 440], [206, 410], [250, 446], [300, 386], [350, 432], [400, 404], [450, 444], [510, 410]], 610, hazed(tones('#4e4278'), '#463a6e', 0.3)));
  D.add('loin', mountains(D, [[-30, 520], [30, 488], [90, 512], [150, 476], [210, 506], [270, 480], [330, 510], [390, 470], [450, 500], [510, 486]], 610, hazed(tones('#55487e'), '#463a6e', 0.12)));
  for (const [x, y, r] of [[120, 470, 26], [330, 452, 26], [228, 500, 22], [70, 300, 30], [400, 280, 34], [250, 330, 20]]) { D.glow('loin', x, y, r, '#5dff9a', 0.45); D.add('loin', `<circle cx="${x}" cy="${y}" r="3" fill="#b8ffd0"/>`); }
  D.add('loin', p('M196 60L276 60L360 600L150 600Z', D.vgrad(60, 600, [[0, '#d8ffe8', 0.32], [0.7, '#b8ffd8', 0.1], [1, '#b8ffd8', 0]])));
  D.add('loin', haze(D, 470, 600, '#6a5a96', 0.6));
  // --- milieu : plafond, stalactites, piliers, stalagmites, cristaux
  const ceil = [[-30, 120], [10, 96], [50, 130], [90, 84], [140, 120], [190, 70], [240, 104], [290, 66], [340, 116], [390, 80], [440, 118], [510, 90]];
  D.add('milieu', D.part(`M-30 -10L510 -10L510 90` + ceil.slice().reverse().map(q => `L${q[0]} ${q[1]}`).join('') + 'Z', Rd.b,
    [p(ceil.map((q, i) => i % 2 ? poly([q, ceil[i + 1] || q, [q[0], -10]]) : '').join(''), Rd.sh), s('M20 30l30 26M150 20l26 34l-10 20M300 24l20 30M420 36l-18 30', Rd.dp, 2)], 2, Rd.o));
  const st = [[70, 96, 12, 120], [118, 112, 9, 70], [168, 92, 14, 150], [214, 96, 8, 60], [262, 84, 11, 110], [318, 96, 13, 140], [366, 98, 9, 78], [412, 104, 12, 96]];
  D.add('milieu', st.map(([x, y, w, l], i) => spike(D, x, y, w, l, 1, i % 2 ? R : Rd, { bend: (i % 3 - 1) * 4, rings: 2 })).join(''));
  const colL = 'M-30 -10L84 -10C72 60 88 120 74 190C62 260 84 330 76 400C70 460 88 520 106 580L-30 580Z';
  const colR = 'M510 -10L400 -10C412 60 394 130 408 200C420 270 396 340 406 410C414 470 390 530 376 580L510 580Z';
  D.add('milieu', D.part(colL, R.b, [p('M44 -10C34 80 50 150 38 220C28 300 48 380 44 450C40 510 54 560 70 580L130 580L130 -10Z', R.sh), p('M-30 40C0 70 8 120 -2 170L-30 170Z M-30 300C2 320 10 380 -6 420L-30 420Z', R.l), s('M20 80l14 30l-6 26M6 250l18 22M30 360l10 24l-8 20M50 480l10 20', R.dp, 2)], 2.2, R.o));
  D.add('milieu', D.part(colR, R.b, [p('M450 -10C444 80 458 150 450 220C440 300 458 380 450 450C444 510 454 560 462 580L520 580L520 -10Z', R.sh), p('M418 60C430 100 426 150 416 190C410 160 414 110 418 60Z M410 300C422 340 420 380 414 410C408 380 406 340 410 300Z', R.l), s('M458 90l-10 30l6 24M440 270l-14 24M454 380l-8 22', R.dp, 2)], 2.2, R.o));
  D.add('milieu', [[132, 580, 12, 40], [160, 584, 8, 24], [336, 582, 13, 46], [364, 586, 8, 26], [250, 582, 7, 18]].map(([x, y, w, l]) => spike(D, x, y, w, l, -1, Rd, { rings: 1 })).join(''));
  crystals(D, 'milieu', 90, 586, 1.1, G, '#3fff8a', 3);
  crystals(D, 'milieu', 398, 588, 0.9, G, '#3fff8a', 5);
  crystals(D, 'milieu', 70, 230, 0.55, G, '#3fff8a', 7);
  crystals(D, 'milieu', 414, 330, 0.5, G, '#3fff8a', 2);
  // --- sol : roche, cailloux, fissures, rochers devant
  D.add('sol', ground(D, { top: 572, light: '#8676aa', base: '#65578a', base2: '#544876', rim: '#a294c8', edge: '#3a2f58', seed: 4 }));
  D.add('sol', s('M150 600l18 6l10 -4l16 8M300 596l-14 8l-16 -2M210 632l20 4l8 -6l18 4M360 628l14 6', '#3e3360', 1.8) + s('M151 598l18 6l10 -4l16 8M301 594l-14 8', '#9a8cc0', 1));
  D.add('sol', pebbles([[96, 600, 6], [128, 630, 4], [392, 608, 5], [430, 634, 7], [282, 640, 3], [180, 614, 3]], { b: '#76689c', l: '#a698cc', o: '#2e2548' }));
  D.add('sol', rock(D, 18, 644, 86, 58, 3, R, { crack: true }) + rock(D, 470, 646, 80, 50, 8, R, { crack: true }));
  crystals(D, 'sol', 50, 640, 0.7, G, '#3fff8a', 9);
  D.add('sol', lip(D, 648, { dirt: '#3c3158', deep: '#2c2444', top: '#544876', topL: '#65578a', o: '#221a3a' }, 3));
  save('cave', 'grotte', D, { sky: ['#0f0a20', '#1c1538', '#2e2450', '#463a6e'], deep: '#2c2444', stars: false });
};

// =====================================================================================
// CHÂTEAU (nuit) : château lointain, rempart avec bannières et torches, grande arche, dallage
// =====================================================================================
THEMES.castle = () => {
  const D = Doc('ch');
  const sky = '#4d3778';
  const mt = hazed(tones('#3a2c64'), sky, 0.35), cs = hazed(tones('#3e3266'), sky, 0.2);
  const Wd = tones('#5c5580'), P = tones('#7a74a0');
  // --- loin : montagnes, château sur la colline
  D.add('loin', mountains(D, [[-30, 500], [40, 440], [90, 476], [150, 420], [200, 470], [260, 450], [330, 480], [400, 430], [450, 462], [510, 440]], 600, mt));
  const towers = [[262, 380, 22, 130], [300, 350, 26, 168], [346, 396, 20, 110], [226, 420, 16, 80], [384, 418, 16, 90]];
  let tw = '', roofs = '', win = '';
  for (const [x, y, w, h] of towers) {
    tw += poly([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x - w / 2, y + h]]);
    roofs += poly([[x - w / 2 - 5, y + 2], [x, y - w * 1.3], [x + w / 2 + 5, y + 2]]);
    win += `M${x - 3} ${y + 22}h6v9h-6Z`;
  }
  tw += poly([[220, 470], [400, 470], [400, 520], [220, 520]]);
  D.add('loin', p(tw, cs.b) + p(roofs, cs.sh) + p(towers.map(([x, y, w]) => poly([[x, y - w * 1.3], [x + w / 2 + 5, y + 2], [x + w / 4, y + 2]])).join(''), cs.dp) + p(win + 'M250 486h6v8h-6ZM290 482h6v8h-6ZM330 488h6v8h-6ZM370 484h6v8h-6Z', '#ffd36a'));
  D.glow('loin', 300, 400, 30, '#ffd36a', 0.35);
  D.add('loin', haze(D, 480, 600, '#5b4688', 0.75));
  // --- milieu : rempart, bannières, torches ; colonnes et grande arche (vues en entier sur téléphone)
  D.add('milieu', wall(D, -30, 510, 478, 584, Wd, { crenel: 18, crenelH: 16, row: 16, brick: 32 }));
  [[110, '#d33c46'], [240, '#3773d8'], [370, '#d33c46']].forEach(([x, c]) => D.add('milieu', banner(D, x, 502, 18, 62, c, { emblem: x === 240 ? 'star' : 'circle' })));
  torch(D, 'milieu', 175, 520, { oc: '#2b2238' }); torch(D, 'milieu', 305, 520, { oc: '#2b2238' });
  // arche : bandeau de pierres courbé entre les deux colonnes
  const arch = 'M10 150C40 40 150 10 240 10C330 10 440 40 470 150L470 110C440 4 330 -26 240 -26C150 -26 40 4 10 110Z';
  D.add('milieu', D.part(arch, P.b, [p('M240 -30C340 -30 450 0 480 110L480 160L240 160Z', P.sh), s('M60 54l14 26M120 18l8 30M180 4l3 30M240 -2v30M300 4l-3 30M360 18l-8 30M420 54l-14 26', P.dp, 1.8), p('M10 110C40 4 150 -26 240 -26L240 -20C150 -20 44 8 14 112Z', P.l)], 2.2, P.o));
  D.add('milieu', `<circle cx="240" cy="-8" r="14" fill="#f7bc2a" stroke="${P.o}" stroke-width="2"/><circle cx="236" cy="-12" r="4.5" fill="#fff7c4"/>`);
  D.add('milieu', pillar(D, 36, 120, 588, 30, P, { crack: true }) + pillar(D, 444, 120, 588, 30, P));
  D.add('milieu', banner(D, 36, 168, 22, 170, '#d33c46', { emblem: 'circle' }) + banner(D, 444, 168, 22, 170, '#3773d8', { emblem: 'star' }));
  torch(D, 'milieu', 36, 400, { oc: '#2b2238', glow: 40 }); torch(D, 'milieu', 444, 400, { oc: '#2b2238', glow: 40 });
  // --- sol : dallage en perspective
  D.add('sol', ground(D, { top: 574, light: '#8a82ac', base: '#6c6490', base2: '#5a5280', rim: '#a49cc6', edge: '#3a3258', wave: 0, seed: 2 }));
  let tl = '';
  for (const y of [584, 598, 616, 640]) tl += `M-30 ${y}H510`;
  for (let x = -360; x <= 840; x += 72) tl += `M${n1(240 + (x - 240) * 0.18)} 574L${x} 700`;
  D.add('sol', `<g clip-path="${D.clip('M-30 574H510V660H-30Z')}">${s(tl, '#4a4270', 1.8)}</g>`);
  D.add('sol', p('M150 590H330L360 650H120Z', '#a83240', ` opacity="0.9"`) + s('M150 590L120 650M330 590L360 650', '#f7bc2a', 2.4));
  D.add('sol', pebbles([[70, 626, 4], [412, 630, 5]], { b: '#7a729c', l: '#a49cc6', o: '#2e2848' }));
  D.add('sol', lip(D, 648, { dirt: '#3e3760', deep: '#2e2848', top: '#5a5280', topL: '#6c6490', o: '#262040' }, 6));
  save('castle', 'château de nuit', D, { sky: ['#0b0820', '#1b1440', '#33265e', sky], deep: '#2e2848', stars: true, sun: ['#efeaff', '#ffffff'], moon: true });
};

// =====================================================================================
// ARÈNE (coucher de soleil) : gradins à arcades, public, bannières, sable
// =====================================================================================
THEMES.arena = () => {
  const D = Doc('ar');
  const sky = '#f3a07a';
  const mt = hazed(tones('#8a4f8e'), sky, 0.45);
  const S = tones('#d39a6c'), S2 = tones('#bb845c'), P = tones('#e0ae7c');
  D.add('loin', mountains(D, [[-30, 500], [50, 452], [110, 486], [170, 440], [240, 480], [300, 446], [370, 482], [430, 456], [510, 486]], 600, mt));
  D.add('loin', haze(D, 470, 600, '#f6b48a', 0.7));
  // gradins du haut (plus loin, plus sombres) puis arcades du bas
  const arches = (xs, ya, yb, w, c) => {
    let open = '', frame = '', crowd = '';
    for (const x of xs) {
      open += `M${x - w} ${yb}L${x - w} ${ya}A${w} ${w} 0 0 1 ${x + w} ${ya}L${x + w} ${yb}Z`;
      frame += `M${x - w - 4} ${ya}A${w + 4} ${w + 4} 0 0 1 ${x + w + 4} ${ya}`;
      for (let k = -1; k <= 1; k++) crowd += `M${x + k * w * 0.62 - 5} ${yb}v-10a5 5 0 0 1 10 0v10Z M${x + k * w * 0.62} ${yb - 18}a5 5 0 1 0 0.1 0Z`;
    }
    return p(open, '#4a2a3e') + p(crowd, '#2e1a2a') + s(frame, c.l, 3) + s(frame.replace(/A/g, 'A'), c.o, 1.4, ' opacity="0.6"');
  };
  D.add('milieu', wall(D, -30, 510, 430, 500, S2, { row: 14, brick: 30, crenel: 0 }));
  D.add('milieu', arches([0, 60, 120, 180, 240, 300, 360, 420, 480], 470, 500, 18, S2));
  D.add('milieu', wall(D, -30, 510, 496, 586, S, { row: 18, brick: 36 }));
  D.add('milieu', arches([-30, 50, 130, 350, 430, 510], 538, 584, 24, S));
  // porte de l'arène au centre (grille)
  D.add('milieu', p('M206 584L206 536A34 34 0 0 1 274 536L274 584Z', '#3a2030', ` stroke="${S.o}" stroke-width="2"`) + s('M216 584V530M230 584V512M244 584V506M258 584V514M206 548H274M206 566H274', '#8a7a8a', 3) + s('M202 536A38 38 0 0 1 278 536', '#f7bc2a', 4));
  [[90, '#d33c46'], [170, '#3773d8'], [310, '#d33c46'], [390, '#3773d8']].forEach(([x, c]) => D.add('milieu', banner(D, x, 504, 14, 46, c, { emblem: x % 160 === 10 ? 'star' : 'circle' })));
  torch(D, 'milieu', 196, 520, { oc: '#3a2030', glow: 36 }); torch(D, 'milieu', 284, 520, { oc: '#3a2030', glow: 36 });
  // grands obélisques avec oriflammes (sur téléphone)
  D.add('milieu', pillar(D, 30, 150, 590, 26, P) + pillar(D, 450, 150, 590, 26, P));
  D.add('milieu', banner(D, 30, 196, 20, 150, '#d33c46', { emblem: 'star' }) + banner(D, 450, 196, 20, 150, '#3773d8', { emblem: 'star' }));
  D.add('milieu', `<g fill="#f7bc2a" stroke="${P.o}" stroke-width="2">${[30, 450].map(x => `<path d="M${x - 14} 150L${x} 116L${x + 14} 150Z"/>`).join('')}</g>` + p('M26 134L30 124L34 134ZM446 134L450 124L454 134Z', '#fff7c4'));
  // sable
  D.add('sol', ground(D, { top: 580, light: '#f6d29c', base: '#e2b47c', base2: '#d4a26a', rim: '#fff0c8', edge: '#9a6a44', seed: 9 }));
  D.add('sol', p('M-30 580H510V588H-30Z', '#a8744c') + p('M-30 586H510V592H-30Z', '#c8946a'));
  const R = rng(4); let dots = '', rip = '';
  for (let i = 0; i < 40; i++) dots += `M${n0(R() * 480)} ${n0(596 + R() * 50)}h0`;
  for (let i = 0; i < 6; i++) { const x = 20 + R() * 420, y = 604 + R() * 36; rip += `M${n0(x)} ${n0(y)}q8 -2 16 0q8 2 16 0`; }
  D.add('sol', s(dots, '#c99560', 2.6) + s(rip, '#d0a070', 1.4));
  D.add('sol', pebbles([[60, 620, 5], [420, 612, 4], [380, 640, 6]], { b: '#b0886a', l: '#e4c4a0', o: '#5a3a28' }));
  D.add('sol', lip(D, 648, { dirt: '#8a5a3a', deep: '#6b4430', top: '#d4a26a', topL: '#e2b47c', o: '#5a3a28' }, 8));
  save('arena', 'arène au coucher du soleil', D, { sky: ['#2a2363', '#5a3f8a', '#b5568c', '#ee8a78', sky], deep: '#6b4430', stars: true, sun: ['#ffd27a', '#fff3c4'], cloud: '#ffd2b4' });
};

// =====================================================================================
// ENTRAÎNEMENT (plein jour) : collines, barrière, cible, bottes de foin, pré
// =====================================================================================
THEMES.training = () => {
  const D = Doc('en');
  const sky = '#d8f0fa';
  const h1 = hazed({ b: '#7cc28a', l: '#9ed6a0', sh: '#62aa7c', o: '#4a8a6a' }, sky, 0.45), h2 = hazed({ b: '#6cb85a', l: '#96d474', sh: '#4f9a4c', o: '#3a7a3a' }, sky, 0.18);
  const T = { b: '#5cb85c', l: '#8bd466', sh: '#3a9257', dp: '#2b7350', o: '#1f5240' };
  D.add('loin', foliage(D, hillRow([-30, 60, 150, 250, 350, 440, 510], [470, 440, 466, 430, 460, 436, 456], 610, [0.7]), h1, { sh: [8, 8], sw: 0 }));
  D.add('loin', [[70, 456], [104, 462], [312, 452], [344, 458]].map(([x, y], i) => p(`M${x - 2} ${y + 14}h4v-14h-4Z`, mix('#8a6a4a', 0.45, sky)) + foliage(D, puff(x, y - 8, 13, 12, 6, 30 + i), h1, { sh: [3, 4], sw: 0 })).join(''));
  D.add('loin', foliage(D, hillRow([-30, 40, 140, 230, 330, 420, 510], [530, 500, 520, 494, 516, 498, 520], 610, [0.7]), h2, { sh: [8, 8], sw: 0 }));
  // moulin au loin
  D.add('loin', p('M392 500L398 444L414 444L420 500Z', '#e8e2d0') + p('M406 446l-30 -28l4 -4l28 30ZM406 446l28 -30l4 4l-30 28ZM406 446l-28 28l-4 -4l30 -26ZM406 446l30 28l-4 4l-28 -30Z', '#c8b8a0') + p('M396 446L406 432L416 446Z', '#d0645a') + `<circle cx="406" cy="446" r="3" fill="#8a6a4a"/>`);
  D.add('loin', haze(D, 500, 600, '#e6f6e0', 0.5));
  // milieu : arbres ronds sur les côtés, barrière, cible, foin
  const tree = (x, yb, h, r, seed) => p(`M${x - 9} ${yb}C${x - 6} ${yb - h * 0.5} ${x - 8} ${yb - h * 0.8} ${x - 5} ${yb - h}L${x + 5} ${yb - h}C${x + 7} ${yb - h * 0.8} ${x + 6} ${yb - h * 0.5} ${x + 10} ${yb}Z`, '#8f6243', ' stroke="#3e2519" stroke-width="2"') +
    foliage(D, puff(x, yb - h - r * 0.4, r, r * 0.85, 9, seed), T, { sh: [8, 10], sw: 2 }) + foliage(D, puff(x - r * 0.55, yb - h + r * 0.25, r * 0.55, r * 0.45, 7, seed + 1, { flat: true }), T, { sh: [5, 6], sw: 2 });
  D.add('milieu', tree(20, 590, 300, 90, 11) + tree(462, 590, 260, 84, 21));
  let fence = '', rail = '';
  for (let x = 70; x <= 420; x += 50) fence += `M${x - 5} 586V548l5 -6l5 6V586Z`;
  rail = 'M60 556H430v7H60ZM60 572H430v7H60Z';
  const F = tones('#b8875a');
  D.add('milieu', D.part(rail, F.b, [p('M60 561H430v3H60ZM60 577H430v3H60Z', F.sh)], 1.8, F.o) + D.part(fence, F.b, [p(fence.replace(/M(\d+) 586V548l5 -6l5 6V586Z/g, (m, x) => `M${+x + 6} 586V548h5V586Z`), F.sh)], 1.8, F.o));
  // cible sur trépied
  D.add('milieu', s('M370 586L384 540M398 586L384 540M384 586V540', '#8f6243', 4) + `<circle cx="384" cy="530" r="24" fill="#f3ecd8" stroke="#3e2519" stroke-width="2"/><circle cx="384" cy="530" r="17" fill="#e3343d"/><circle cx="384" cy="530" r="11" fill="#f3ecd8"/><circle cx="384" cy="530" r="5" fill="#e3343d"/>` + s('M402 514l-16 15', '#6b3d1f', 2.4) + p('M402 514l6 -2l-2 6Z', '#e8eef5'));
  // bottes de foin
  const hay = (x, y, w, h) => D.part(`M${x - w} ${y}V${y - h + 8}Q${x - w} ${y - h} ${x - w + 8} ${y - h}H${x + w - 8}Q${x + w} ${y - h} ${x + w} ${y - h + 8}V${y}Z`, '#e8c25a', [p(`M${x + w * 0.3} ${y - h - 4}H${x + w + 4}V${y + 4}H${x + w * 0.3}Z`, '#c89a3a'), s(`M${x - w + 6} ${y - h * 0.35}H${x + w - 4}M${x - w + 6} ${y - h * 0.7}H${x + w - 4}`, '#b08030', 1.6), p(`M${x - w} ${y - h + 4}h${w}v4h${-w}Z`, '#fff0a0')], 1.8, '#6a4a1a');
  D.add('milieu', hay(110, 590, 24, 26) + hay(150, 592, 18, 20));
  // pré
  D.add('sol', ground(D, { top: 578, light: '#b2e47c', base: '#90cc5c', base2: '#7dbc4e', rim: '#d4f5a4', edge: '#4f8a3a', seed: 6 }));
  D.add('sol', p(fringe(-30, 510, 580, 12, 3, 6, 8), '#b2e47c'));
  D.add('sol', `<ellipse cx="240" cy="626" rx="200" ry="22" fill="#d8b47a"/><ellipse cx="240" cy="624" rx="190" ry="18" fill="#e6c48a"/>` + s('M100 626q20 -4 40 0M300 630q20 -4 40 0M190 618q16 -3 30 0', '#c8a068', 1.6));
  D.add('sol', tufts([[30, 600, 1.2], [70, 612, 1], [14, 640, 1.4], [412, 604, 1.1], [452, 624, 1.3], [440, 646, 1], [100, 646, 0.9], [372, 648, 1]], '#6aaa48', '#b4e48a'));
  D.add('sol', flowers([[22, 616, '#ffffff'], [48, 630, '#ffd1e6'], [88, 600, '#fff3a0'], [430, 612, '#ffffff'], [458, 640, '#ffd1e6'], [402, 630, '#fff3a0'], [396, 600, '#ffffff']]));
  D.add('sol', lip(D, 650, { dirt: '#8a5a3d', deep: '#6b4430', top: '#7dbc4e', topL: '#90cc5c', o: '#3a6a2a' }, 2));
  save('training', 'terrain d’entraînement', D, { sky: ['#3d8fe0', '#6fb4ee', '#a8d8f5', sky], deep: '#6b4430', stars: false, sun: ['#fff3b0', '#ffffff'], cloud: '#ffffff' });
};

// =====================================================================================
// CRYPTE (cimetière la nuit) : chapelle au loin, grilles, tombes, arbre mort, brume
// =====================================================================================
THEMES.crypt = () => {
  const D = Doc('cr');
  const sky = '#454c8a';
  const h1 = hazed(tones('#2c3266'), sky, 0.35), h2 = hazed(tones('#2a3060'), sky, 0.15);
  const St = tones('#8a8ca8'), St2 = tones('#74769a'), Tr = tones('#4a3e52');
  D.add('loin', foliage(D, hillRow([-30, 70, 170, 270, 370, 470, 510], [500, 470, 490, 460, 486, 466, 480], 610, [0.7]), h1, { sh: [6, 6], sw: 0, lk: 0 }));
  // chapelle et arbres morts en silhouette
  D.add('loin', p('M300 470V420L320 400L340 420V470ZM312 400V370l8 -10l8 10V400Z', h2.b) + p('M316 362h8M320 356v12', h2.b, '') + s('M320 352v16M314 358h12', h2.b, 3) + p('M316 434h8v12h-8Z', '#ffd36a'));
  D.add('loin', deadTree(120, 486, 90, 4, { b: h2.b, sh: h2.b, l: h2.b, o: h2.b }, { depth: 3, sw: 0.5 }) + deadTree(410, 480, 70, 9, { b: h2.b, sh: h2.b, l: h2.b, o: h2.b }, { depth: 3, sw: 0.5 }));
  D.add('loin', foliage(D, hillRow([-30, 50, 150, 250, 350, 450, 510], [540, 516, 530, 510, 528, 512, 530], 610, [0.7]), h2, { sh: [6, 6], sw: 0, lk: 0 }));
  D.add('loin', haze(D, 490, 600, '#8a86c8', 0.5));
  // milieu : grand arbre mort à gauche, arche gothique à droite, grille, tombes
  D.add('milieu', deadTree(46, 592, 560, 7, Tr, { depth: 5, lean: 0.12, sw: 2 }));
  const gate = 'M392 590V250C392 180 420 140 452 120C484 140 512 180 512 250V590H486V260C486 214 472 186 452 170C432 186 418 214 418 260V590Z';
  D.add('milieu', D.part(gate, St.b, [p('M452 110L520 110L520 600L486 600V260C486 214 472 186 452 170Z', St.sh), s('M392 300H418M392 380H418M392 460H418M392 540H418M486 320H512M486 420H512M486 520H512', St.dp, 1.6), p('M392 250C392 180 420 140 452 120L452 128C424 146 398 186 398 252V590H392Z', St.l)], 2, St.o));
  let bars = '';
  for (let x = 92; x <= 384; x += 18) bars += `M${x} 588V${x % 36 === 20 ? 532 : 540}`;
  D.add('milieu', s(bars + 'M86 552H390M86 576H390', '#2a2440', 4) + p(Array.from({ length: 17 }, (_, i) => 92 + i * 18).map(x => `M${x - 4} ${x % 36 === 20 ? 534 : 542}L${x} ${x % 36 === 20 ? 522 : 530}L${x + 4} ${x % 36 === 20 ? 534 : 542}Z`).join(''), '#2a2440'));
  D.add('milieu', tomb(D, 132, 590, 16, 46, St2, { moss: '#5a8a5a' }) + tomb(D, 186, 588, 11, 30, St2, { cross: true, tilt: -6 }) + tomb(D, 300, 590, 14, 40, St2, { tilt: 5 }) + tomb(D, 350, 590, 12, 34, St2, { cross: true, tilt: 4 }) + tomb(D, 244, 586, 10, 26, St2, { tilt: -3 }));
  D.glow('milieu', 240, 580, 120, '#a8a4ff', 0.18);
  // sol : herbe sombre, brume violette, petites tombes devant
  D.add('sol', ground(D, { top: 576, light: '#66748a', base: '#4a576a', base2: '#3e4a5c', rim: '#8a9ab4', edge: '#262e40', seed: 5 }));
  D.add('sol', p(fringe(-30, 510, 578, 15, 3, 5, 7), '#66748a'));
  D.add('sol', tufts([[30, 604, 1.2], [80, 620, 1], [420, 606, 1.1], [456, 630, 1.3], [200, 642, 0.9], [330, 640, 0.9]], '#3a4658', '#7a8aa2'));
  D.add('sol', tomb(D, 22, 646, 20, 60, St, { moss: '#5a8a5a', tilt: -4 }) + tomb(D, 462, 646, 16, 52, St, { cross: true, tilt: 6 }));
  D.add('sol', p('M-30 600C40 590 110 604 180 596C260 588 330 602 400 594C440 590 480 596 510 592V620C440 628 360 614 280 622C200 630 120 616 40 626L-30 628Z', '#b4b0ff', ' opacity="0.16"'));
  D.add('sol', lip(D, 648, { dirt: '#2e3446', deep: '#222838', top: '#3e4a5c', topL: '#4a576a', o: '#1a2030' }, 4));
  save('crypt', 'cimetière de la crypte', D, { sky: ['#0b0d28', '#1a1f4c', '#2f3570', sky], deep: '#222838', stars: true, sun: ['#e6f0ff', '#ffffff'], moon: true });
};

// =====================================================================================
// MARAIS : arbres tordus et mousse qui pend, roseaux, eau verte et nénuphars
// =====================================================================================
THEMES.swamp = () => {
  const D = Doc('ma');
  const sky = '#a8c090';
  const h1 = hazed({ b: '#5f8a64', l: '#7aa478', sh: '#4c7454', o: '#3a5a40' }, sky, 0.5), h2 = hazed({ b: '#4f7a52', l: '#6a9666', sh: '#3e6444', o: '#2e4a32' }, sky, 0.25);
  const Tr = tones('#5a4a3a'), M = { b: '#6a9a50', l: '#9ac46a', sh: '#4a7a3e', o: '#2e4a2a' };
  D.add('loin', [[30, 500, 44], [110, 486, 50], [200, 504, 40], [290, 480, 54], [380, 498, 46], [460, 490, 44]].map(([x, y, r], i) => foliage(D, puff(x, y, r, r * 0.9, 8, 40 + i, { flat: true }), h1, { sh: [6, 6], sw: 0, lk: 0 })).join(''));
  D.add('loin', p('M-30 520H510V610H-30Z', h1.b));
  D.add('loin', [[60, 540, 40], [170, 530, 46], [270, 546, 36], [360, 532, 44], [450, 544, 40]].map(([x, y, r], i) => foliage(D, puff(x, y, r, r * 0.7, 8, 50 + i, { flat: true }), h2, { sh: [6, 6], sw: 0, lk: 0 })).join(''));
  D.add('loin', haze(D, 480, 600, '#d4e4b4', 0.6));
  // arbres tordus des côtés + mousse
  D.add('milieu', deadTree(30, 592, 520, 12, Tr, { depth: 5, lean: 0.18, sw: 2 }) + deadTree(452, 592, 480, 15, Tr, { depth: 5, lean: -0.15, sw: 2 }));
  const moss = (x, y, l, seed) => { const R = rng(seed); let d = `M${x - 6} ${y}`; for (let k = 0; k <= 6; k++) d += `L${n0(x - 4 + k * 1.4 + (R() - 0.5) * 4)} ${n0(y + l * k / 6)}`; for (let k = 6; k >= 0; k--) d += `L${n0(x + 4 + k * 0.6 + (R() - 0.5) * 4)} ${n0(y + l * k / 6 * 0.92)}`; return d + 'Z'; };
  const ms = [[70, 150, 70, 1], [110, 210, 50, 2], [40, 260, 80, 3], [150, 120, 40, 4], [400, 170, 70, 5], [370, 230, 50, 6], [440, 280, 76, 7], [330, 140, 44, 8]];
  D.add('milieu', p(ms.map(q => moss(...q)).join(''), M.b, ` stroke="${M.o}" stroke-width="1.4"`) + p(ms.map(([x, y, l, sd]) => moss(x - 2, y, l * 0.7, sd + 20)).join(''), M.l));
  // roseaux et quenouilles
  const reeds = (x, y, n, seed) => { const R = rng(seed); let st = '', heads = ''; for (let k = 0; k < n; k++) { const xx = x + (k - n / 2) * 7 + R() * 4, h = 40 + R() * 40, b = (R() - 0.5) * 16; st += `M${n0(xx)} ${y}q${n0(b * 0.3)} ${n0(-h * 0.5)} ${n0(b)} ${n0(-h)}`; if (k % 2 === 0) heads += `M${n1(xx + b - 3)} ${n0(y - h + 4)}h6v18h-6Z`; } return s(st, '#3e6a34', 3) + s(st, '#7aa85a', 1.2) + p(heads, '#7a4a2a', ' stroke="#3a2416" stroke-width="1.4"'); };
  D.add('milieu', reeds(120, 592, 7, 3) + reeds(360, 592, 8, 4) + reeds(250, 590, 4, 5));
  // sol : boue, flaques, nénuphars
  D.add('sol', ground(D, { top: 576, light: '#8a9a5e', base: '#6a7a46', base2: '#5a6a3a', rim: '#b0c47c', edge: '#3a4a26', seed: 8 }));
  D.add('sol', p(fringe(-30, 510, 578, 21, 3, 5, 7), '#8a9a5e'));
  const pond = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#3a5a4a" stroke="#2a3a26" stroke-width="2"/><ellipse cx="${cx - 2}" cy="${cy - 1}" rx="${rx - 6}" ry="${ry - 4}" fill="#4a7a62"/><path d="M${cx - rx * 0.6} ${cy - ry * 0.3}q${rx * 0.3} -3 ${rx * 0.6} 0" stroke="#b4e0c4" stroke-width="2" fill="none"/>`;
  D.add('sol', pond(110, 628, 70, 12) + pond(370, 604, 60, 9) + pond(250, 650, 50, 8));
  const pad = (x, y, r) => `<path d="M${x} ${y}L${x + r} ${y - r * 0.15}A${r} ${r * 0.5} 0 1 1 ${x + r * 0.7} ${y + r * 0.35}Z" fill="#5aa04a" stroke="#2e5a2a" stroke-width="1.4"/><path d="M${x - r * 0.6} ${y - r * 0.15}a${r * 0.6} ${r * 0.25} 0 0 1 ${r * 0.8} -${r * 0.2}" stroke="#9ad06a" stroke-width="1.6" fill="none"/>`;
  D.add('sol', pad(90, 628, 10) + pad(140, 624, 8) + pad(380, 604, 9) + `<circle cx="136" cy="620" r="3.4" fill="#ffd1e6" stroke="#2e5a2a" stroke-width="1"/>`);
  D.add('sol', tufts([[30, 600, 1.2], [450, 626, 1.3], [200, 612, 0.8], [300, 630, 0.9]], '#4a6a34', '#a4c47a'));
  D.add('sol', reeds(14, 646, 6, 9) + reeds(470, 646, 6, 10));
  D.add('sol', lip(D, 648, { dirt: '#4a4a2e', deep: '#3a3a24', top: '#5a6a3a', topL: '#6a7a46', o: '#2a3018' }, 9));
  save('swamp', 'marais', D, { sky: ['#1c3a2c', '#35604a', '#6a9070', sky], deep: '#3a3a24', stars: false, sun: ['#e8f0b0', '#fbffe0'] });
};

// =====================================================================================
// MINE : étais en bois, lanternes, cristaux bleus, rails, wagonnet
// =====================================================================================
THEMES.mine = () => {
  const D = Doc('mi');
  const R = tones('#7a5a42'), Rd = tones('#5e4432'), B = tones('#a86e3c'), C = tones('#5ad8f0');
  D.add('loin', p('M-30 -10H510V610H-30Z', D.vgrad(0, 600, [[0, '#1c120c'], [0.5, '#2e1f16'], [1, '#4a3424']])));
  D.add('loin', mountains(D, [[-30, 260], [40, 200], [100, 250], [170, 180], [240, 236], [310, 190], [380, 246], [440, 200], [510, 240]], 610, hazed(tones('#3e2c20'), '#2e1f16', 0.25)));
  D.add('loin', mountains(D, [[-30, 470], [40, 430], [100, 460], [170, 416], [230, 452], [300, 420], [370, 458], [430, 428], [510, 462]], 610, hazed(tones('#5a4230'), '#4a3424', 0.25)));
  D.add('loin', haze(D, 470, 600, '#6a4a32', 0.6));
  // milieu : plafond rocheux, étais, lanternes, cristaux, wagonnet
  const ceil = [[-30, 80], [40, 110], [100, 70], [170, 100], [240, 64], [310, 96], [380, 70], [440, 104], [510, 76]];
  D.add('milieu', D.part(`M-30 -10L510 -10` + ceil.slice().reverse().map(q => `L${q[0]} ${q[1]}`).join('') + 'Z', Rd.b, [p(ceil.map((q, i) => i % 2 ? poly([q, ceil[i + 1] || q, [q[0], -10]]) : '').join(''), Rd.sh)], 2, Rd.o));
  const beam = (x0, y0, x1, y1, w) => D.part(K.capsule(x0, y0, x1, y1, w, w), B.b, [p(K.capsule(x0 + w * 0.5, y0 + (y1 === y0 ? w * 0.4 : 0), x1 + w * 0.5, y1 + (y1 === y0 ? w * 0.4 : 0), w * 0.5, w * 0.5), B.sh), s(`M${x0} ${y0}L${x1} ${y1}`, B.dp, 1.4)], 2, B.o);
  // grand portique (vu en entier sur téléphone) et petits étais au fond
  D.add('milieu', beam(54, 160, 54, 592, 14) + beam(426, 160, 426, 592, 14) + beam(20, 168, 460, 168, 15) + beam(54, 230, 120, 172, 7) + beam(426, 230, 360, 172, 7));
  D.add('milieu', beam(150, 470, 150, 588, 8) + beam(330, 470, 330, 588, 8) + beam(136, 474, 344, 474, 8));
  D.add('milieu', s('M60 168h0M420 168h0M150 474h0M330 474h0', '#c3cce0', 6) + s('M60 168h0M420 168h0M150 474h0M330 474h0', '#ffffff', 2.4));
  const lantern = (x, y) => { D.glow('milieu', x, y + 22, 54, '#ffc04a', 0.55); D.add('milieu', s(`M${x} ${y}v12`, '#3a2a20', 2) + p(`M${x - 8} ${y + 12}h16l-2 22h-12Z`, '#ffe08a', ' stroke="#3a2a20" stroke-width="2"') + p(`M${x - 10} ${y + 10}h20v4h-20ZM${x - 9} ${y + 32}h18v4h-18Z`, '#5a4a40', ' stroke="#3a2a20" stroke-width="1.4"') + p(`M${x - 3} ${y + 18}h4v10h-4Z`, '#fff8d0')); };
  lantern(170, 176); lantern(310, 176); lantern(240, 480);
  crystals(D, 'milieu', 96, 590, 1, C, '#5ae8ff', 4);
  crystals(D, 'milieu', 30, 300, 0.6, C, '#5ae8ff', 6);
  crystals(D, 'milieu', 452, 380, 0.55, C, '#5ae8ff', 8);
  // wagonnet
  const W = tones('#7a7f94');
  D.add('milieu', D.part('M352 548H436L428 584H360Z', W.b, [p('M400 540H440V590H400Z', W.sh), s('M356 556H432', W.l, 2), s('M372 552v28M392 552v28M412 552v28', W.dp, 1.4)], 2, W.o) + rock(D, 380, 550, 30, 16, 5, tones('#8a6a4a'), { sw: 1.5 }) + rock(D, 408, 550, 26, 14, 7, C, { sw: 1.5 }) + `<circle cx="370" cy="586" r="7" fill="#3a3a48" stroke="${W.o}" stroke-width="2"/><circle cx="418" cy="586" r="7" fill="#3a3a48" stroke="${W.o}" stroke-width="2"/>`);
  // sol : rails au fond, pierres
  D.add('sol', ground(D, { top: 576, light: '#9a7a5a', base: '#7a5c42', base2: '#664c36', rim: '#bc9a74', edge: '#3a2a1c', seed: 11 }));
  let ties = ''; for (let x = -20; x < 500; x += 26) ties += `M${x} 590h16v8h-16Z`;
  D.add('sol', p(ties, '#6b4423', ' stroke="#2e1e12" stroke-width="1.4"') + s('M-30 590H510M-30 598H510', '#3a3a48', 4) + s('M-30 589H510M-30 597H510', '#c3cce0', 1.4));
  D.add('sol', pebbles([[80, 620, 6], [130, 640, 4], [400, 626, 5], [440, 642, 7], [260, 636, 3]], { b: '#8a6a4c', l: '#b8987a', o: '#3a2a1c' }));
  D.add('sol', rock(D, 16, 646, 80, 50, 13, R, { crack: true }) + rock(D, 466, 646, 74, 44, 17, R, { crack: true }));
  crystals(D, 'sol', 462, 640, 0.6, C, '#5ae8ff', 10);
  D.add('sol', lip(D, 648, { dirt: '#4a3424', deep: '#38281c', top: '#664c36', topL: '#7a5c42', o: '#2a1c12' }, 12));
  save('mine', 'mine', D, { sky: ['#140d08', '#24170e', '#3a2618', '#4e3422'], deep: '#38281c', stars: false });
};

// =====================================================================================
// VOLCAN : cône qui fume au loin, pics de basalte veinés de lave, rivières de lave
// =====================================================================================
THEMES.volcano = () => {
  const D = Doc('vo');
  const sky = '#e8702a';
  const mt = hazed(tones('#5a2a2a'), sky, 0.3), vc = hazed(tones('#4a2222'), sky, 0.12), B = tones('#4a3036'), Bd = tones('#3a2428');
  D.add('loin', mountains(D, [[-30, 520], [40, 470], [90, 500], [140, 460], [190, 510], [510, 520]], 610, mt));
  // fumée
  D.add('loin', [[300, 250, 50], [270, 190, 40], [310, 140, 46], [280, 80, 36]].map(([x, y, r], i) => foliage(D, puff(x, y, r, r * 0.8, 7, 60 + i), { b: '#6a4a4a', l: '#8a6a66', sh: '#523838' }, { sh: [5, 6], sw: 0 })).join(''));
  D.add('loin', mountains(D, [[150, 610], [250, 330], [270, 336], [290, 324], [310, 332], [440, 610]], 610, vc, { cracks: false }));
  D.glow('loin', 280, 330, 70, '#ffb347', 0.55);
  D.add('loin', p('M252 330Q262 322 280 324Q300 322 308 332Z', '#ffd06a') + s('M266 336C262 380 270 420 250 470M292 336C300 390 290 430 312 480M280 340C282 370 276 400 282 430', '#ff7a1a', 5) + s('M266 336C262 380 270 420 250 470M292 336C300 390 290 430 312 480', '#ffd06a', 2));
  D.add('loin', mountains(D, [[300, 520], [380, 466], [430, 494], [470, 470], [510, 500]], 610, mt));
  D.add('loin', haze(D, 470, 600, '#f08a4a', 0.55));
  // milieu : pics de basalte (côtés), rochers veinés de lave au fond
  const vein = (d) => s(d, '#ff7a1a', 4) + s(d, '#ffd06a', 1.6);
  const spireL = 'M-30 600V40L10 70L30 20L54 140L70 120L90 300L106 290L120 600Z';
  const spireR = 'M510 600V60L470 100L452 30L430 170L410 150L392 320L376 310L362 600Z';
  D.add('milieu', D.part(spireL, B.b, [p('M30 20L54 140L70 120L90 300L106 290L120 600L60 600L40 300Z', B.sh), p('M-30 40L10 70L-4 300L-30 320Z', B.l), vein('M20 200l14 40l-6 30l12 40M60 380l10 30l-8 26l10 40')], 2.2, B.o));
  D.add('milieu', D.part(spireR, B.b, [p('M452 30L430 170L410 150L392 320L376 310L362 600L420 600L440 300Z', B.l), p('M470 100L510 60L510 600L460 600L480 300Z', B.sh), vein('M462 220l-12 36l6 30l-10 40M420 400l-10 30l8 26')], 2.2, B.o));
  D.add('milieu', rock(D, 150, 590, 70, 54, 21, Bd, { peak: true }) + rock(D, 340, 590, 80, 64, 23, Bd, { peak: true }) + vein('M140 560l8 14l-4 12M336 548l-6 18l8 14'));
  D.glow('milieu', 240, 590, 160, '#ff7a1a', 0.22);
  // sol : basalte, fissures de lave, petite mare de lave
  D.add('sol', ground(D, { top: 576, light: '#6a4644', base: '#4a3032', base2: '#3e282a', rim: '#9a6a5a', edge: '#241416', seed: 13 }));
  D.glow('sol', 60, 630, 70, '#ff7a1a', 0.5);
  D.add('sol', `<ellipse cx="60" cy="630" rx="56" ry="12" fill="#ff7a1a" stroke="#241416" stroke-width="2"/><ellipse cx="56" cy="628" rx="44" ry="8" fill="#ffb02e"/><ellipse cx="50" cy="626" rx="22" ry="4" fill="#fff3a0"/>`);
  D.add('sol', vein('M120 630l30 -6l16 8l30 -4l14 10M260 600l24 6l10 -6l28 8M330 640l26 -4l20 6l24 -2M400 610l20 8l30 -4'));
  D.add('sol', pebbles([[180, 616, 5], [420, 636, 6], [300, 622, 3]], { b: '#5a3c3c', l: '#8a6060', o: '#241416' }));
  D.add('sol', rock(D, 470, 646, 78, 52, 25, B, { peak: true }));
  D.add('sol', lip(D, 648, { dirt: '#2e1c1c', deep: '#241414', top: '#3e282a', topL: '#4a3032', o: '#1a0e0e' }, 13));
  save('volcano', 'volcan', D, { sky: ['#2a0a0e', '#5a1414', '#a03018', sky], deep: '#241414', stars: false, sun: ['#ffb347', '#ffe08a'] });
};

// =====================================================================================
// GLACIER : montagnes enneigées, sapins sous la neige, pics de glace, neige
// =====================================================================================
THEMES.glacier = () => {
  const D = Doc('gl');
  const sky = '#e6f5fd';
  const m1 = { ...hazed(tones('#7a9cc8'), sky, 0.45), snow: '#ffffff', snowSh: '#d8e8f6' }, m2 = { ...hazed(tones('#6a8ec0'), sky, 0.2), snow: '#ffffff', snowSh: '#cfe2f4' };
  const I = { b: '#9ee4f8', l: '#e4fbff', sh: '#5cbce0', dp: '#3a98c8', o: '#2a6a98' };
  const Pn = { b: '#3a8a6a', l: '#5aaa80', sh: '#2a6a54', dp: '#1e5040', o: '#163a30', trunk: '#6b4a34', snow: '#ffffff' };
  D.add('loin', mountains(D, [[-30, 440], [40, 380], [110, 430], [190, 330], [260, 410], [330, 360], [400, 420], [460, 370], [510, 400]], 610, m1));
  D.add('loin', mountains(D, [[-30, 520], [60, 456], [130, 500], [220, 440], [300, 500], [380, 450], [450, 490], [510, 470]], 610, m2, { snowLine: 0.4 }));
  D.add('loin', haze(D, 470, 600, '#ffffff', 0.55));
  // milieu : sapins enneigés (côtés), pics de glace, rochers de glace
  D.add('milieu', pine(D, 470, 592, 420, 90, Pn) + pine(D, 14, 592, 380, 84, Pn) + pine(D, 90, 594, 130, 40, Pn) + pine(D, 400, 594, 150, 44, Pn));
  D.add('milieu', [[150, 590, 12, 60, -8], [170, 590, 8, 36, 10], [320, 590, 14, 70, 6], [300, 590, 8, 40, -12], [240, 588, 6, 24, 0]].map(([x, y, w, h, a]) => crystal(D, x, y, w, h, a, I)).join(''));
  // sol : neige
  D.add('sol', ground(D, { top: 576, light: '#ffffff', base: '#eaf4fc', base2: '#d6e8f6', rim: '#ffffff', edge: '#9ab8d8', seed: 15 }));
  D.add('sol', p('M100 604C140 600 180 606 220 602C200 612 140 614 100 604ZM300 630C340 626 390 632 430 628C400 640 340 640 300 630ZM20 636C50 632 80 638 100 636C80 646 40 646 20 636Z', '#c4daf0'));
  D.add('sol', `<ellipse cx="250" cy="638" rx="80" ry="8" fill="#bfe8f8" stroke="#8ac8e8" stroke-width="1.4"/><path d="M200 636q30 -4 60 -2" stroke="#ffffff" stroke-width="2" fill="none"/>`);
  D.add('sol', foliage(D, puff(20, 640, 50, 22, 8, 71, { flat: true }), { b: '#ffffff', l: '#ffffff', sh: '#d4e6f6', o: '#9ab8d8' }, { sh: [5, 6], sw: 1.6 }) + foliage(D, puff(468, 642, 46, 20, 8, 72, { flat: true }), { b: '#ffffff', l: '#ffffff', sh: '#d4e6f6', o: '#9ab8d8' }, { sh: [5, 6], sw: 1.6 }));
  D.add('sol', crystal(D, 452, 632, 9, 40, 12, I) + crystal(D, 438, 634, 6, 24, -14, I));
  D.add('sol', lip(D, 648, { dirt: '#8fb3d6', deep: '#7096be', top: '#d6e8f6', topL: '#eaf4fc', o: '#5a7ea6' }, 15));
  save('glacier', 'glacier', D, { sky: ['#3f8fd0', '#7ab8e6', '#b8dcf3', sky], deep: '#7096be', stars: false, sun: ['#ffffff', '#ffffff'], cloud: '#ffffff' });
};

// =====================================================================================
// MEETING POLITIQUE : projecteurs, foule avec drapeaux, rideaux rouges, scène en bois
// =====================================================================================
THEMES.meeting = () => {
  const D = Doc('me');
  const C = tones('#c42a3a'), Sp = tones('#3a3448');
  // fond : mur de scène sombre, grand écran avec étoiles, rampe de projecteurs
  D.add('loin', p('M-30 -10H510V610H-30Z', D.vgrad(0, 600, [[0, '#1a0510'], [0.6, '#3a0c1e'], [1, '#6a1830']])));
  D.add('loin', p('M90 300H390V470H90Z', '#2a1a4a', ' stroke="#140a24" stroke-width="3"') + p('M96 306H384V464H96Z', D.vgrad(306, 464, [[0, '#2e4ab8'], [1, '#1a2a78']])));
  let st = ''; for (const [x, y, r] of [[140, 340, 10], [200, 330, 7], [280, 336, 9], [340, 326, 7], [170, 410, 6], [310, 404, 8], [240, 380, 14]]) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; st += `${i ? 'L' : 'M'}${n1(x + Math.cos(a) * rr)} ${n1(y + Math.sin(a) * rr)}`; } st += 'Z'; }
  D.add('loin', p(st, '#ffe168'));
  for (const x of [60, 160, 320, 420]) D.add('loin', p(`M${x - 14} 60L${x + 14} 60L${x + 150 * Math.sign(240 - x) * 0.6 + 60} 600L${x + 150 * Math.sign(240 - x) * 0.6 - 60} 600Z`, D.vgrad(60, 600, [[0, '#fff3c4', 0.4], [1, '#fff3c4', 0]])));
  D.add('loin', p('M-30 40H510V56H-30Z', '#3a3448', ' stroke="#140a14" stroke-width="2"') + s('M-30 48H510', '#5a5468', 2));
  D.add('loin', [60, 160, 320, 420].map(x => `<circle cx="${x}" cy="62" r="11" fill="#2a2434" stroke="#140a14" stroke-width="2"/><circle cx="${x}" cy="64" r="6" fill="#fff3c4"/>`).join(''));
  D.add('loin', haze(D, 500, 600, '#a02840', 0.6));
  // foule (3 rangs) avec bras levés, drapeaux et pancartes
  const crowd = (y, col, seed, n = 26) => { const R = rng(seed); let d = '', flags = ''; for (let k = 0; k < n; k++) { const x = -20 + k * 20 + R() * 8, h = 18 + R() * 8; d += `M${n0(x - 9)} ${y + 20}v${n0(-h + 8)}q0 -8 9 -8q9 0 9 8v${n0(h - 8)}Z`; d += `M${n0(x)} ${n0(y + 20 - h - 9)}a7 7 0 1 0 0.1 0Z`; if (R() < 0.3) d += `M${n0(x + 6)} ${n0(y + 20 - h + 2)}l${n0(6 + R() * 4)} -20l4 2l-6 20Z`; if (R() < 0.18) flags += `M${n0(x - 1)} ${n0(y - h - 30)}v40`; } return { d, flags }; };
  const rows = [[506, '#4a1222', 3], [524, '#3a0e1c', 4], [546, '#2a0a14', 5]];
  for (const [y, col, sd] of rows) {
    const c = crowd(y, col, sd);
    D.add('milieu', s(c.flags, '#8a6a4a', 2));
    const fx = [...c.flags.matchAll(/M(-?\d+) (-?\d+)/g)].map(m => [+m[1], +m[2]]);
    D.add('milieu', fx.map(([x, y2], i) => i % 2 ? `<path d="M${x} ${y2}h8v14h-8Z" fill="#3773d8"/><path d="M${x + 8} ${y2}h8v14h-8Z" fill="#ffffff"/><path d="M${x + 16} ${y2}h8v14h-8Z" fill="#e3343d"/>` : `<path d="M${x - 14} ${y2 - 4}h30v18h-30Z" fill="#f3ecd8" stroke="#2a0a14" stroke-width="1.4"/><path d="M${x - 9} ${y2 + 2}h20M${x - 9} ${y2 + 8}h14" stroke="#c42a3a" stroke-width="2.4"/>`).join(''));
    D.add('milieu', p(c.d, col));
  }
  // rideaux rouges (sur téléphone) et enceintes
  const curtain = (x0, x1, flip) => { const w = x1 - x0; let folds = ''; for (let k = 1; k < 5; k++) folds += `M${n0(x0 + w * k / 5)} 0C${n0(x0 + w * k / 5 + 6)} 200 ${n0(x0 + w * k / 5 - 6)} 400 ${n0(x0 + w * k / 5 + (flip ? -12 : 12))} 600`; const d = flip ? `M${x0} -10H${x1}V600C${x1 - 20} 560 ${x0 + 30} 470 ${x0 + 10} 240C${x0} 120 ${x0} 40 ${x0} -10Z` : `M${x0} -10H${x1}C${x1} 40 ${x1} 120 ${x1 - 10} 240C${x1 - 30} 470 ${x0 + 20} 560 ${x0} 600Z`; return D.part(d, C.b, [s(folds, C.sh, 8), s(folds.replace(/M(\d+)/g, (m, a) => `M${+a - 5}`), C.l, 2.4), p(`M${x0 - 10} -10H${x1 + 10}V30H${x0 - 10}Z`, C.dp)], 2.2, C.o); };
  D.add('milieu', curtain(-30, 70, false) + curtain(410, 510, true));
  D.add('milieu', p('M-30 -10H510V24C460 34 420 20 380 30C340 40 300 24 240 32C180 40 140 26 100 34C60 42 20 28 -30 34Z', C.b, ` stroke="${C.o}" stroke-width="2"`) + s('M-30 20H510', '#f7bc2a', 4));
  const speaker = (x) => D.part(`M${x - 22} 590V520H${x + 22}V590Z`, Sp.b, [p(`M${x + 8} 510H${x + 30}V600H${x + 8}Z`, Sp.sh)], 2, '#140a14') + `<circle cx="${x}" cy="566" r="13" fill="#1e1a28" stroke="#5a5468" stroke-width="2.5"/><circle cx="${x}" cy="536" r="7" fill="#1e1a28" stroke="#5a5468" stroke-width="2"/>`;
  D.add('milieu', speaker(84) + speaker(396));
  // sol : scène en bois
  D.add('sol', ground(D, { top: 584, light: '#b06a4a', base: '#8e4e36', base2: '#7a422e', rim: '#d48a62', edge: '#3a1a10', wave: 0, seed: 1 }));
  let pl = ''; for (let x = -400; x <= 880; x += 48) pl += `M${n1(240 + (x - 240) * 0.3)} 584L${x} 700`;
  D.add('sol', `<g clip-path="${D.clip('M-30 584H510V660H-30Z')}">${s(pl, '#5a2a1a', 1.6)}${s('M-30 606H510M-30 634H510', '#6a3220', 1.2)}</g>`);
  D.add('sol', p('M150 592H330L370 650H110Z', '#b8243a') + s('M150 592L110 650M330 592L370 650', '#f7bc2a', 2.6));
  D.add('sol', lip(D, 650, { stage: true, dirt: '#3a1018', deep: '#2a0a12', o: '#140608' }));
  save('meeting', 'meeting politique', D, { sky: ['#12030a', '#2a0814', '#4a1020', '#6a1830'], deep: '#2a0a12', stars: false });
};

// =====================================================================================
// ABYSSES : îles de roche qui flottent, pics d'obsidienne, cristaux violets, failles qui brillent
// =====================================================================================
THEMES.abyss = () => {
  const D = Doc('ab');
  const sky = '#3a1d5e';
  const O = tones('#4a3470'), Od = tones('#382858'), V = tones('#b06aff');
  const isle = (x, y, w, h, c, seed) => {
    const d = poly([[x - w, y], [x - w * 0.6, y - 6], [x + w * 0.1, y - 4], [x + w * 0.7, y - 8], [x + w, y], [x + w * 0.62, y + h * 0.42], [x + w * 0.3, y + h * 0.5], [x + w * 0.05, y + h], [x - w * 0.25, y + h * 0.55], [x - w * 0.6, y + h * 0.4]]);
    return D.part(d, c.b, [p(poly([[x + w * 0.1, y + 6], [x + w * 1.2, y], [x + w * 1.2, y + h * 1.2], [x + w * 0.05, y + h]]), c.sh), p(poly([[x - w, y - 10], [x + w, y - 12], [x + w, y + 5], [x - w, y + 5]]), c.l)], 1.4, c.o);
  };
  D.glow('loin', 240, 380, 240, '#8a3aff', 0.35);
  const Oi = tones('#5a3f86');
  D.add('loin', isle(96, 300, 52, 80, hazed(Oi, sky, 0.3), 1) + isle(370, 236, 40, 64, hazed(Oi, sky, 0.38), 2) + isle(240, 420, 30, 46, hazed(Oi, sky, 0.45), 3) + isle(446, 420, 24, 36, hazed(Oi, sky, 0.45), 4));
  D.add('loin', crystal(D, 90, 296, 8, 30, -8, hazed(V, sky, 0.2)) + crystal(D, 106, 297, 5, 18, 14, hazed(V, sky, 0.2)) + crystal(D, 376, 230, 6, 22, 6, hazed(V, sky, 0.3)));
  D.glow('loin', 96, 290, 50, '#c07aff', 0.4); D.glow('loin', 376, 226, 40, '#c07aff', 0.35);
  D.add('loin', mountains(D, [[-30, 520], [30, 470], [70, 500], [130, 440], [180, 496], [240, 460], [300, 500], [360, 450], [420, 494], [470, 466], [510, 490]], 610, hazed(O, sky, 0.25)));
  D.add('loin', haze(D, 470, 600, '#6a3a9a', 0.6));
  // milieu : pics d'obsidienne, cristaux, chaînes
  const sp = [[10, 592, 30, 420], [50, 592, 18, 230], [90, 592, 12, 120], [470, 592, 30, 400], [432, 592, 18, 250], [396, 592, 12, 110], [180, 590, 10, 50], [300, 590, 12, 64]];
  const Ol = { ...O, l: '#9a6ad0' }, Odl = { ...Od, l: '#8a5ac0' };
  D.add('milieu', sp.map(([x, y, w, l], i) => spike(D, x, y, w, l, -1, i % 2 ? Ol : Odl, { bend: (i % 3 - 1) * 6 })).join(''));
  D.add('milieu', s('M10 300l10 40l-8 30M470 320l-8 36l10 30', '#d090ff', 3) + s('M10 300l10 40l-8 30M470 320l-8 36l10 30', '#ffffff', 1));
  D.add('milieu', s('M140 -10V160M340 -10V120', '#4a3a5e', 5) + p(Array.from({ length: 8 }, (_, k) => `M${136} ${k * 20}h8v14h-8Z`).join('') + Array.from({ length: 6 }, (_, k) => `M${336} ${k * 20}h8v14h-8Z`).join(''), 'none', ' stroke="#6a5a80" stroke-width="2.4"'));
  crystals(D, 'milieu', 128, 590, 1, V, '#b06aff', 3);
  crystals(D, 'milieu', 360, 590, 0.9, V, '#b06aff', 5);
  // sol : obsidienne, failles violettes
  D.add('sol', ground(D, { top: 576, light: '#4a3a6a', base: '#2e2048', base2: '#24183a', rim: '#7a5aa8', edge: '#120a20', seed: 17 }));
  const crack = (d) => s(d, '#9a4aff', 5) + s(d, '#e4c4ff', 1.8);
  D.glow('sol', 240, 626, 150, '#9a4aff', 0.25);
  D.add('sol', crack('M60 620l40 -6l20 10l40 -4M200 640l30 -8l24 6l40 -2M300 604l30 4l20 -6l30 6M380 636l30 -4l26 8'));
  D.add('sol', rock(D, 20, 646, 84, 56, 27, O, { peak: true }) + rock(D, 466, 646, 76, 50, 29, O, { peak: true }));
  crystals(D, 'sol', 470, 640, 0.6, V, '#b06aff', 7);
  D.add('sol', lip(D, 648, { dirt: '#1e1432', deep: '#140c22', top: '#24183a', topL: '#2e2048', o: '#0a0614' }, 17));
  save('abyss', 'abysses', D, { sky: ['#05030c', '#120a26', '#24123f', sky], deep: '#140c22', stars: true, sun: ['#c38bff', '#f4e8ff'] });
};

const want = process.argv.slice(2);
for (const [id, fn] of Object.entries(THEMES)) if (!want.length || want.includes(id)) fn();
