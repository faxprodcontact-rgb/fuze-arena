// Générateur du paladin : écrit art/paladin.svg (SVG pur, sans style/class).
// Même méthode que gu-build.cjs : chaque pièce = clipPath (forme) + aplat + ombres/reflets découpés + contour 3,
// et une « doublure » (mêmes formes en trait 7) sous chaque groupe pour le contour extérieur épais.
const fs = require('fs'), path = require('path');
const O = '#1b1530';
const W = '#ffffff';
const C = {
  skin: '#fdd2ad', skinL: '#ffe9d6', skinS: '#eea07e', skinD: '#c8705c', blush: '#ff8b7e',
  st: '#c3cce0', stL: '#eef2fa', stM: '#9ba7c3', stS: '#6f7a9b', stD: '#4a5273',
  au: '#f7bc2a', auL: '#ffe168', auS: '#cd7e15', auD: '#8f4c0a', auH: '#fff7c4',
  le: '#94593a', leL: '#c58a58', leS: '#6a3a24', leD: '#45230f', leH: '#e0a875',
  wd: '#9a6234', wdL: '#c98f55', wdS: '#6b3d1f', wdD: '#45230f',
  ch: '#7f8aa8', chS: '#5a6381', chL: '#c3cbe0',
  cr: '#f3e6c8', crL: '#fffaf0', crS: '#cdb68e', crD: '#9c8460',
  bl: '#3773d8', blL: '#6aaeff', blS: '#23499c', blD: '#162f6c',
  hr: '#ffd45a', hrL: '#fff2a8', hrS: '#e0a42c', hrD: '#a8701a',
};
const usedIds = new Set();
const defsClips = [];
function bbox(d) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number);
  let xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  const x = Math.min(...xs) - 2, y = Math.min(...ys) - 2;
  return [x, y, Math.max(...xs) - x + 2, Math.max(...ys) - y + 2].map(v => +v.toFixed(1));
}
const slug = name => 'pa-' + name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function part(name, d, fill, shades = [], sw = 3) {
  let id = slug(name);
  while (usedIds.has(id)) id += '-b';
  usedIds.add(id);
  defsClips.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
  const [x, y, w, h] = bbox(d);
  return `<!-- ${name} -->\n<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${shades.join('')}</g>\n<path d="${d}" fill="none" stroke="${O}" stroke-width="${sw}"/>`;
}
const clip = (id, d) => { defsClips.push(`<clipPath id="pa-${id}"><path d="${d}"/></clipPath>`); return `url(#pa-${id})`; };
const back = ds => `<g fill="${O}" stroke="${O}" stroke-width="7">${ds.map(d => `<path d="${d}"/>`).join('')}</g>`;
const p = (d, f, extra = '') => `<path d="${d}" fill="${f}"${extra}/>`;
const s = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
const mail = (x, y, n, rows, c = C.chS) => {
  let d = '';
  for (let r = 0; r < rows; r++) { d += `M${x + (r % 2) * 2.5} ${y + r * 5}`; for (let i = 0; i < n; i++) d += 'q2.5 2.6 5 0'; }
  return s(d, c, 1.3);
};
const rivet = (x, y, r = 2.4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#pa-gold)" stroke="${O}" stroke-width="1.6"/>`;
const gem = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.bl}" stroke="${O}" stroke-width="1.8"/><path d="M${x - r + 1.6} ${y + 0.6}A${r - 1.6} ${r - 1.6} 0 0 0 ${x + r - 1.6} ${y + 0.6}Z" fill="${C.blS}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${(r * 0.32).toFixed(2)}" fill="${W}"/>`;
const spark = (x, y, k = 1, c = W) => `<path d="M${x} ${y - 7 * k}L${x + 2 * k} ${y - 2 * k}L${x + 7 * k} ${y}L${x + 2 * k} ${y + 2 * k}L${x} ${y + 7 * k}L${x - 2 * k} ${y + 2 * k}L${x - 7 * k} ${y}L${x - 2 * k} ${y - 2 * k}Z" fill="${c}"/>`;

// ---------- FORMES ----------
const F = {
  // cape (derrière tout)
  cape: 'M80 158C72 190 56 224 30 256C38 264 48 264 56 260C62 270 74 272 84 266C92 274 104 274 112 268L118 230L130 158Z',
  // cheveux longs dans le dos (groupe à part, sous le corps)
  hairBack: 'M66 62C50 84 42 112 44 136C45 152 40 164 30 172C26 175 20 176 13 174C20 182 30 186 39 184C36 191 30 196 21 199C30 205 42 204 52 198C50 204 46 209 38 213C50 215 62 210 70 202L86 184L104 150L102 80Z',
  // corps
  armB: 'M148 176C156 172 166 174 172 180L174 194C166 198 156 198 150 194Z',
  vamB: 'M152 190C160 186 170 186 176 190L180 202C174 208 166 210 160 208Z',
  greB: 'M134 238C143 235 152 236 158 240L167 277C159 280 150 280 144 278Z',
  kneB: 'M135 244C141 239 155 239 161 244L159 253C157 258 152 262 148 264C144 262 139 258 137 253Z',
  bootB: 'M141 274C151 272 163 272 170 275L171 279C181 279 190 283 190 288L190 292L140 292C138 286 138 280 141 274Z',
  cufB: 'M140 269C151 265.5 163 265.5 171 269L171 278C163 275 151 275 140 278Z',
  greA: 'M88 238C97 235 106 236 112 240L102 277C94 280 85 280 79 278Z',
  kneA: 'M86 244C92 239 106 239 112 244L110 253C108 258 103 262 99 264C95 262 90 258 88 253Z',
  bootA: 'M77 274C87 272 98 272 105 275L106 279C115 279 123 283 123 288L123 292L75 292C73 286 73 280 77 274Z',
  cufA: 'M76 269C87 265.5 98 265.5 106 269L106 278C98 275 87 275 76 278Z',
  tunic: 'M84 158C98 150 142 148 158 156C162 176 160 196 156 214C160 226 164 236 168 246C160 252 152 250 144 254C132 258 118 256 106 254C96 252 86 252 78 246C82 234 86 224 88 214C82 196 80 176 84 158Z',
  cross: 'M125 184C124 178 122 174 120 170L138 170C136 174 134 178 133 184C138 183 142 181 146 179L146 197C142 195 138 193 133 192C134 198 136 203 138 208L120 208C122 203 124 198 125 192C120 193 116 195 112 197L112 179C116 181 120 183 125 184Z',
  belt: 'M86 208C106 215 134 215 155 207L156 220C134 228 106 228 88 222Z',
  buckle: 'M130 210C135.5 210 140 214 140 219.5C140 225 135.5 229 130 229C124.5 229 120 225 120 219.5C120 214 124.5 210 130 210Z',
  paB: 'M140 158C150 151 166 154 172 165C174 175 166 182 158 184C148 184 142 177 140 168Z',
  gorget: 'M98 148C114 156 144 156 160 148L160 162C144 170 114 170 98 162Z',
  armA: 'M62 192C60 200 60 206 62 212L80 212C80 206 81 200 82 194Z',
  lameA: 'M62 180C76 188 96 186 108 174C112 180 111 188 105 192C93 198 75 199 64 193Z',
  paA: 'M58 172C56 156 68 146 87 146C104 146 113 154 111 166C108 176 96 182 81 184C68 185 59 180 58 172Z',
  vamA: 'M63 217C70 225 78 231 87 234L95 220C88 216 81 211 74 205Z',
  elbowA: 'M59 211C59 205 63 202 68 202C73 202 77 206 77 211C77 216 73 220 68 220C63 220 59 216 59 211Z',
  fistA: 'M86 223C86 217 90 214 96 214C102 214 107 217 107.5 223C108 230 104 236 97 237C90 238 86 233 86 227Z',
  thumbA: 'M90 217C94 214 100 214 104 216C104 219 100 221 95 221C92 221 90 219 90 217Z',
  // tête
  skull: 'M60 152C44 126 42 84 62 58C82 32 128 22 158 40C174 50 182 70 182 96C182 116 180 134 176 150C172 152 168 150 166 146L150 130L104 130Z',
  face: 'M98 86C122 74 152 74 170 82C175 98 176 118 170 130C166 142 157 152 144 155C130 158 112 155 100 148Z',
  bangF: 'M146 71.5C160 71.5 174 75 186 81C185 94 183 104 180 114C176 106 170 100 162 96C154 92 149 84 146 71.5Z',
  bangN: 'M86 85C100 79 120 73 141 71.5C140 80 135 87 129 92C121 98 113 102 105 108C101 100 94 92 86 85Z',
  lockN: 'M80 88C88 84 98 80 106 78C109 94 108 112 104 128C102 140 102 150 104 160C96 156 90 146 87 134C83 120 81 104 80 88Z',
  band: 'M46 106C64 88 104 69.5 143 68.5C160 68.5 174 72 187 78L185 84C174 78 160 74.5 143 74.5C108 75.5 70 93 47 114C46 111.5 45.8 108.5 46 106Z',
  gemSet: 'M143 57C147 63 151 67 152 71.5C151 76 147 81 143 87C139 81 135 76 134 71.5C135 67 139 63 143 57Z',
  // arme (repère local : main en 0,0, manche vers le haut)
  shaft: 'M-5 -136L5 -136L5 24L-5 24Z',
  grip: 'M-5.5 -18L5.5 -18L5.5 21L-5.5 21Z',
  pommel: 'M-7.5 29C-7.5 25 -4 22 0 22C4 22 7.5 25 7.5 29C7.5 33 4 36 0 36C-4 36 -7.5 33 -7.5 29Z',
  ring: 'M-6.5 -76L6.5 -76L6.5 -68L-6.5 -68Z',
  collar: 'M-7.5 -141L7.5 -141L5.5 -128L-5.5 -128Z',
  core: 'M-11 -176L11 -176C12.5 -176 13 -175 13 -173.5L13 -140.5C13 -139 12.5 -138 11 -138L-11 -138C-12.5 -138 -13 -139 -13 -140.5L-13 -173.5C-13 -175 -12.5 -176 -11 -176Z',
  faceL: 'M-13 -171L-23 -177C-25.5 -177 -27 -175.5 -27 -173L-27 -141C-27 -138.5 -25.5 -137 -23 -137L-13 -143Z',
  faceR: 'M13 -171L23 -177C25.5 -177 27 -175.5 27 -173L27 -141C27 -138.5 25.5 -137 23 -137L13 -143Z',
  spike: 'M-6 -175L0 -193L6 -175Z',
  fistB: 'M-9 -11C-3 -13 5 -13 9 -10C12 -6 12 6 9 9C5 12 -3 12 -9 10C-12 6 -12 -6 -9 -11Z',
  thumbB: 'M-9 -9C-5 -13 1 -13 5 -10C4 -6 -2 -5 -8 -6Z',
};

// ---------- CAPE ----------
const capeHem = 'M30 256C38 264 48 264 56 260C62 270 74 272 84 266C92 274 104 274 112 268';
const cape = [
  part('cape', F.cape, C.bl, [
    // ombre propre (intérieur, près du corps) et ombre profonde entre les jambes
    p('M96 158C100 190 104 230 104 280L160 280L160 158Z', C.blS),
    p('M106 214C108 236 108 256 106 280L130 280L130 214Z', C.blD),
    // bord éclairé (gauche)
    p('M76 166C68 196 54 226 32 254L42 258C60 230 74 200 82 170Z', C.blL),
    // plis : creux sombre + arête claire, en fuseaux qui s'élargissent vers l'ourlet
    p('M80 194C78 220 72 244 62 266L74 268C80 246 82 222 82 196Z', C.blS),
    p('M76 198C72 222 64 244 52 262L56 263C66 244 74 222 78 200Z', C.blL),
    p('M92 206C94 230 94 252 94 270L104 272C102 252 98 230 94 206Z', C.blD),
    p('M88 210C88 232 86 252 84 268L88 269C90 252 90 232 90 210Z', C.blL),
    // galon doré de l'ourlet
    s(capeHem, C.au, 8),
    `<g clip-path="${clip('capesh', 'M96 150C100 190 104 230 104 290L170 290L170 150Z')}">${s(capeHem, C.auS, 8)}</g>`,
  ]),
];

// ---------- CHEVEUX DANS LE DOS ----------
const hairBack = [
  part('cheveux : longueurs dans le dos', F.hairBack, C.hr, [
    // mèche du haut éclairée, les deux du dessous à l'ombre, le creux contre le dos en ombre profonde
    p('M10 176C22 184 32 186 40 184C48 180 54 170 56 156L104 150L104 222L0 222L0 176Z', C.hrS),
    p('M64 150C60 170 60 190 66 206L110 206L110 150Z', C.hrD),
    p('M52 84C45 104 43 124 46 146C49 128 52 106 60 88Z', C.hrL),
    s('M42 142C41 153 36 162 24 170', C.hrL, 2.4),
    s('M46 156C42 166 34 172 22 175', C.hrD, 1.8),
    s('M52 178C48 188 40 194 28 197', C.hrL, 2),
    // séparations des mèches
    s('M39 184C48 180 54 170 56 156', C.hrD, 2.2),
    s('M52 198C58 192 62 182 64 170', C.hrD, 2.2),
  ]),
];

// ---------- CORPS ----------
const tunicHem = 'M168 246C160 252 152 250 144 254C132 258 118 256 106 254C96 252 86 252 78 246';
const body = [
  part('bras arrière : manche de mailles', F.armB, C.ch, [mail(146, 180, 6, 4), p('M140 190C152 196 166 194 180 188L180 204L140 204Z', C.chS)]),
  part('bras arrière : canon d\'avant-bras', F.vamB, 'url(#pa-steel)', [p('M166 184C172 192 174 202 170 214L186 214L186 184Z', C.stM), s('M156 196L160 206', W, 2), s('M160 208C168 209 174 205 180 201', C.au, 5)]),
  part('jambe arrière : chausse de mailles', F.greB, C.ch, [mail(134, 248, 7, 6), p('M150 236C156 252 160 266 163 282L175 282L175 236Z', C.chS), s('M139 246L144 274', C.chL, 2)]),
  part('jambe arrière : botte', F.bootB, C.le, [p('M163 274C167 282 179 284 193 286L193 292L153 292Z', C.leS), p('M133 287L193 287L193 296L133 296Z', C.leD), s('M174 281C180 281 184 283 186 285', C.leL, 2.5)]),
  part('jambe arrière : revers de botte', F.cufB, C.leL, [p('M161 262L175 262L175 280L159 280Z', C.le), s('M142 270C151 267 161 267 169 270', C.leH, 1.5)]),
  part('jambe arrière : genouillère', F.kneB, 'url(#pa-steel)', [p('M133 250C142 256 152 254 163 246L165 266L131 266Z', C.stM), p('M139 244C143 241 148 240.5 152 241C147 242 143 244 141 247Z', W), s('M136 249C144 252 152 252 160 249', O, 2)]),
  part('jambe avant : chausse de mailles', F.greA, C.ch, [mail(78, 248, 7, 6), p('M102 236C104 254 101 268 99 282L116 282L116 236Z', C.chS), s('M92 246L87 274', C.chL, 2)]),
  part('jambe avant : botte', F.bootA, C.le, [p('M97 274C101 282 112 284 126 286L126 292L88 292Z', C.leS), p('M68 287L126 287L126 296L68 296Z', C.leD), s('M108 281C114 281 118 283 120 285', C.leL, 2.5)]),
  part('jambe avant : revers de botte', F.cufA, C.leL, [p('M96 262L110 262L110 280L94 280Z', C.le), s('M78 270C87 267 96 267 104 270', C.leH, 1.5)]),
  part('jambe avant : genouillère', F.kneA, 'url(#pa-steel)', [p('M84 250C93 256 103 254 114 246L116 266L82 266Z', C.stM), p('M90 244C94 241 99 240.5 103 241C98 242 94 244 92 247Z', W), s('M87 249C95 252 103 252 111 249', O, 2)]),
  part('tunique', F.tunic, C.cr, [
    p('M142 150C147 180 149 210 150 226C152 238 155 246 158 256L172 256L172 150Z', C.crS),
    p('M90 168C88 182 88 196 90 208L96 208C95 196 95 182 96 168Z', C.crL),
    // plis de la jupe
    p('M114 228C114 236 112 244 110 256L117 256C118 246 117 236 116 228Z', C.crS),
    p('M108 230C107 238 105 246 103 254L106 254C108 246 109 238 110 230Z', C.crL),
    p('M136 228C137 236 139 246 141 256L134 257C133 246 133 236 133 228Z', C.crS),
    p('M127 230C127 238 127 246 126 256L130 256C130 246 130 238 129 230Z', C.crL),
    // ombres portées : sous le gorgerin, sous l'épaulière, sous la ceinture
    p('M80 150L160 150L160 160C142 168 114 168 80 160Z', C.crS),
    p('M78 197C90 203 102 202 111 195L113 196C112 202 106 207 97 208C88 209 82 207 78 204Z', C.crS),
    p('M140 182C146 186 154 188 160 186L160 194C152 196 146 194 140 190Z', C.crS),
    p('M78 220C104 230 136 230 166 218L166 230C136 238 104 238 78 232Z', C.crS),
    p('M150 222L172 222L172 258L157 258Z', C.crD),
    // galon doré de l'ourlet, et sa partie à l'ombre
    s(tunicHem, C.bl, 17),
    s(tunicHem, C.au, 9),
    `<g clip-path="${clip('tunsh', 'M142 150C147 180 149 210 150 226C152 238 155 246 158 256L172 256L172 150Z')}">${s(tunicHem, C.blS, 17)}${s(tunicHem, C.auS, 9)}</g>`,
  ]),
  part('tunique : croix dorée', F.cross, 'url(#pa-gold)', [
    p('M129 188L150 176L150 212L129 212Z', C.auS),
    p('M110 196L129 188L129 212L110 212Z', C.auS),
    s('M114 182C117 183 120 184 123 184.6M122.5 172.5L124.5 181', C.auH, 1.6),
  ], 2.5),
  gem(129, 188, 4.2),
  part('ceinture', F.belt, C.le, [p('M86 217C106 224 134 224 156 215L156 232L86 232Z', C.leS), s('M90 211C108 217 130 217 150 211', C.leL, 1.6)]),
  part('boucle', F.buckle, 'url(#pa-gold)', [p('M118 222C124 228 136 228 142 220L142 232L118 232Z', C.auS), s('M123 214C125 212 128 211.5 130 211.5', C.auH, 1.6)], 2.5),
  gem(130, 219.5, 4),
  part('épaulière arrière', F.paB, 'url(#pa-steel)', [p('M138 172C146 180 162 182 174 168L178 168L178 190L134 190Z', C.stM), p('M152 186C162 184 170 177 174 168L178 188Z', C.stS), s('M146 161C151 157 157 156 162 157', W, 2.5), s(F.paB, C.au, 7)]),
  part('gorgerin', F.gorget, 'url(#pa-steel)', [p('M136 140L170 140L170 175L136 175Z', C.stM), p('M96 146C114 154 144 154 162 146L162 155C144 163 114 163 96 155Z', C.stS), s('M101 159C108 163 116 165 124 166', W, 1.8)]),
  part('bras avant : manche de mailles', F.armA, C.ch, [mail(58, 196, 6, 4), p('M74 186L90 186L90 214L76 214Z', C.chS)]),
  part('épaulière avant : lame inférieure', F.lameA, 'url(#pa-steel)', [p('M60 188C76 196 98 194 114 180L118 202L60 202Z', C.stM), s('M64 193C76 199 94 198 105 192', C.au, 7)]),
  part('épaulière avant : coque', F.paA, 'url(#pa-steel)', [
    p('M58 176C70 183 94 181 106 170C111 165 112 160 112 155L118 155L118 190L54 190Z', C.stM),
    p('M74 186C92 183 104 176 111 166L116 166L116 190L70 190Z', C.stS),
    p('M63 169C63 157 72 150 85 150C76 154 70 161 68 170Z', W),
    `<circle cx="91" cy="153" r="2.2" fill="${W}"/>`,
    s(F.paA, C.au, 8),
    `<g clip-path="${clip('pash', 'M58 176C70 183 94 181 106 170C111 165 112 160 112 155L118 155L118 190L54 190Z')}">${s(F.paA, C.auS, 8)}</g>`,
  ], 3),
  rivet(101, 171, 2.6),
  part('bras avant : canon d\'avant-bras', F.vamA, 'url(#pa-steel)', [p('M60 226C72 230 84 232 96 228L96 240L60 240Z', C.stM), s('M70 219C75 223 80 226 85 228', W, 2), s('M87 234L95 220', C.au, 7)]),
  part('bras avant : cubitière', F.elbowA, 'url(#pa-steel)', [p('M57 213C61 218 72 219 79 209L80 224L57 224Z', C.stM), p('M62 207C64 204 67 203 70 203C67 205 65 207 64 209Z', W)]),
  rivet(68, 211, 2),
  part('bras avant : poing (gantelet)', F.fistA, 'url(#pa-steel)', [p('M84 230C92 236 102 236 110 226L110 240L84 240Z', C.stM), p('M90 222C90 219 92 217 95 216.5C93 218 92 220 92 223Z', W)]),
  s('M107.5 224.5L102 225M106.5 230L101 230M103 234.5L99 233.5', O, 1.8),
  part('bras avant : pouce', F.thumbA, 'url(#pa-steel)', [p('M90 219C94 222 100 222 105 218L105 224L90 224Z', C.stM), s('M93 216.5C96 215.5 99 215.5 101 216', W, 1.5)], 2),
];

// ---------- TÊTE ----------
const head = [
  part('cheveux : calotte', F.skull, C.hr, [
    // ombre côté lointain et sous la nuque
    p('M150 34C170 48 178 70 176 100L192 100L192 30Z', C.hrS),
    p('M164 100C170 116 172 134 168 152L190 152L190 100Z', C.hrS),
    p('M44 112C50 130 58 142 70 150L76 160L40 160Z', C.hrS),
    // reflet en arc (anneau de brillance) en haut à gauche
    p('M56 96C56 70 74 48 102 40C86 52 72 70 66 96Z', C.hrL),
    p('M72 62C84 48 102 40 120 38L118 44C112 44 106 46 100 49L102 53C92 56 84 60 78 66Z', C.hrL),
    s('M78 54C88 46 100 42 112 41', W, 2.4),
    // raie et mèches
    s('M128 30C136 40 141 52 143 66', C.hrD, 2.2),
    s('M134 46C114 46 92 56 78 76', C.hrD, 2.2),
    s('M128 36C106 36 82 48 66 70', C.hrD, 2.2),
    s('M148 48C160 56 170 70 174 86', C.hrD, 2.2),
    s('M172 104C176 118 176 132 172 146', C.hrD, 2.2),
  ]),
  part('visage', F.face, C.skin, [
    p('M172 96C166 122 158 142 128 156L180 160L180 96Z', C.skinS),
    // ombre portée de la frange et du diadème, en V qui suit la raie
    p('M94 66L186 66L186 120C178 110 170 102 162 99.5C154 95 149 88 145.5 80C141 90 132 97 122 103C114 107 108 111 104 116L94 118Z', C.skinS),
    `<ellipse cx="117" cy="139" rx="7" ry="4" fill="${C.blush}" opacity="0.55"/><ellipse cx="163" cy="137" rx="4" ry="3" fill="${C.blush}" opacity="0.5"/>`,
    `<ellipse cx="113" cy="136" rx="2.2" ry="1.4" fill="${W}" opacity="0.8"/>`,
  ]),
  `<!-- visage : oeil proche (paupière mi-baissée, bord en arc régulier = calme) -->
<path d="M114.8 122.6C119 119.2 130 118.6 136.2 121.2C137.2 124 136.8 127.5 134 131C131 135 120 135 117 131C114.6 128.2 114 125.4 114.8 122.6Z" fill="${W}"/>
<g clip-path="url(#pa-eye1)"><ellipse cx="126.5" cy="124" rx="7.5" ry="10" fill="url(#pa-iris)"/><ellipse cx="127" cy="124" rx="3.6" ry="5.2" fill="${O}"/><path d="M120 128C123 133 130 133 133 128C130 131 123 131 120 128Z" fill="#d2f4ff"/></g>
<ellipse cx="123" cy="124.6" rx="2.5" ry="2.8" fill="${W}"/><circle cx="130" cy="128.6" r="1.3" fill="${W}"/>
<path d="M112 123.5C115 117 130 115.5 138 119.8L137 122.6C131 120 120 120 114.5 124.2Z" fill="${O}"/>
<path d="M118 133C122 135 127 135 131 133" fill="none" stroke="${O}" stroke-width="1.6"/>
<!-- visage : oeil lointain -->
<path d="M150.4 122.6C153 120 159.6 119.6 163.2 120.6C164.2 124.5 164 127 162 131C160 134 153 134 151 131C149.2 127 149.4 124.6 150.4 122.6Z" fill="${W}"/>
<g clip-path="url(#pa-eye2)"><ellipse cx="157" cy="124" rx="5.5" ry="10" fill="url(#pa-iris)"/><ellipse cx="157.6" cy="124" rx="2.6" ry="5" fill="${O}"/><path d="M152 128C154 132 159 132 162 128C159 130 155 130 152 128Z" fill="#d2f4ff"/></g>
<circle cx="154.8" cy="123.8" r="2" fill="${W}"/><circle cx="159.5" cy="128.6" r="1" fill="${W}"/>
<path d="M148.6 123.2C151.5 117.3 159.5 116.2 165 118.2L165.8 120.8L163.8 121.6C160.5 120.3 154 120.3 150.2 123.8Z" fill="${O}"/>
<path d="M153.5 132.8C156 134 159 134 161 132.6" fill="none" stroke="${O}" stroke-width="1.4"/>
<!-- visage : sourcils (fins et horizontaux = calme) -->
<path d="M113 105.5C119 103.5 129 103 137 104.5L136.5 107.2C129 106.2 120 106.6 113.5 108Z" fill="${C.hrD}" stroke="${C.hrD}" stroke-width="1"/>
<path d="M149 105.5C154 103.8 160 103.4 166 104.2L165.5 106.8C160 106.4 155 106.8 150 108Z" fill="${C.hrD}" stroke="${C.hrD}" stroke-width="1"/>
<!-- visage : nez -->
<path d="M146.5 128C148.5 130 148.2 132.3 145.2 132.9" fill="none" stroke="${C.skinD}" stroke-width="2"/>
<!-- visage : bouche fermée, léger sourire serein -->
<path d="M141 143.2C145 144.8 149 144.4 152 141.8" fill="none" stroke="${O}" stroke-width="2"/>
<path d="M141 143.2L138.8 141.9" fill="none" stroke="${O}" stroke-width="2"/>
<path d="M144.5 148C147 148.6 149.2 148.2 150.6 147.2" fill="none" stroke="${C.skinS}" stroke-width="1.6"/>`,
  part('cheveux : mèche le long du visage', F.lockN, C.hr, [
    p('M99 80C104 100 102 126 98 146L106 166L112 166L112 80Z', C.hrS),
    p('M83 96C83 112 85 126 89 138L92 137C89 125 87 112 87 96Z', C.hrL),
    s('M94 86C97 104 96 124 96 146', C.hrD, 1.8),
  ]),
  part('cheveux : frange proche', F.bangN, C.hr, [
    p('M102 104C112 97 122 92 128 87C134 82 138 77 140 72L146 72L146 112L100 112Z', C.hrS),
    p('M92 86C104 81 118 77 132 75C118 79 106 84 96 90Z', C.hrL),
    s('M136 74C128 84 118 92 108 100', C.hrD, 1.8),
    s('M120 76C110 82 100 88 94 92', C.hrD, 1.6),
  ]),
  part('cheveux : frange lointaine', F.bangF, C.hr, [
    p('M150 82C158 92 168 98 176 108L190 108L190 70Z', C.hrS),
    s('M150 74C157 82 166 89 172 100', C.hrD, 1.8),
  ]),
  part('diadème : bandeau', F.band, 'url(#pa-gold)', [
    p('M187 81.5C174 75.5 160 72 143 72C106 73 68 93.5 45 111L45 124L190 124L190 81.5Z', C.auS),
    p('M168 60L192 60L192 92L168 92Z', C.auS),
    s('M56 97C76 84 108 72 138 70.6', C.auH, 1.4),
  ], 2.5),
  part('diadème : gemme', F.gemSet, 'url(#pa-gold)', [
    p('M143 72L156 72L156 90L143 90Z', C.auS),
  ], 2.5),
  `<!-- diadème : pierre bleue -->
<path d="M143 62.5C145.5 66.5 147.5 69.5 148 72C147.5 75 145.5 78.5 143 82C140.5 78.5 138.5 75 138 72C138.5 69.5 140.5 66.5 143 62.5Z" fill="${C.bl}" stroke="${O}" stroke-width="1.6"/>
<path d="M143 62.5C145.5 66.5 147.5 69.5 148 72L143 72Z" fill="${C.blL}"/><path d="M143 72L148 72C147.5 75 145.5 78.5 143 82Z" fill="${C.blS}"/>
<path d="M141 66.5L140 70" fill="none" stroke="${W}" stroke-width="1.6"/>
${spark(152, 56, 0.75)}`,
];

// ---------- ARME : marteau de guerre ----------
const weapon = [
  part('marteau : manche', F.shaft, C.wd, [p('M0.5 -140L7 -140L7 28L0.5 28Z', C.wdS), s('M-2.4 -128L-2.4 -80M-2.4 -62L-2.4 -22', C.wdL, 1.8), s('M2.5 -110L2 -96M1.8 -50L2.2 -36', C.wdD, 1.4)], 2.5),
  part('marteau : bague du manche', F.ring, 'url(#pa-gold)', [p('M0.5 -78L9 -78L9 -66L0.5 -66Z', C.auS)], 2.2),
  part('marteau : poignée cuir', F.grip, C.le, [p('M1 -20L8 -20L8 24L1 24Z', C.leS), s('M-5.5 12L5.5 15M-5.5 16.5L5.5 19.5M-5.5 -17L5.5 -14M-5.5 -13.5L5.5 -10.5', C.leD, 1.6)], 2.5),
  part('marteau : pommeau', F.pommel, 'url(#pa-gold)', [p('M-8 30C-4 35 4 35 8 30L8 37L-8 37Z', C.auS), `<circle cx="-2.5" cy="26" r="1.5" fill="${W}"/>`]),
  part('marteau : collet', F.collar, 'url(#pa-gold)', [p('M0.5 -142L9 -142L9 -126L0.5 -126Z', C.auS)], 2.5),
  part('marteau : face gauche', F.faceL, 'url(#pa-steel)', [p('M-29 -153L-11 -153L-11 -135L-29 -135Z', C.stM), p('M-29 -142L-11 -146L-11 -135L-29 -135Z', C.stS), s('M-20.5 -171L-20.5 -150', W, 2.4), s('M-27 -178L-27 -136', C.au, 7)]),
  part('marteau : face droite', F.faceR, 'url(#pa-steel)', [p('M11 -164L29 -164L29 -135L11 -135Z', C.stM), p('M19 -153L29 -153L29 -135L19 -135Z', C.stS), s('M27 -178L27 -136', C.auS, 7)]),
  part('marteau : tête', F.core, 'url(#pa-steel)', [
    p('M3 -178L16 -178L16 -136L3 -136Z', C.stM),
    p('M-16 -150C-6 -146 6 -146 16 -150L16 -136L-16 -136Z', C.stS),
    s('M-8.5 -171L-8.5 -149', W, 2.4),
    `<circle cx="-6" cy="-172" r="1.6" fill="${W}"/>`,
    s('M-13 -176L-13 -138M13 -176L13 -138', C.au, 3.5),
  ]),
  `<!-- marteau : médaillon -->
<circle cx="0" cy="-157" r="8" fill="url(#pa-gold)" stroke="${O}" stroke-width="2.2"/>
${gem(0, -157, 4.3)}`,
  part('marteau : pointe', F.spike, 'url(#pa-gold)', [p('M0 -195L0 -174L8 -174Z', C.auS)], 2.5),
  spark(-10, -184, 0.85),
  part('main d\'arme : poing (gantelet)', F.fistB, 'url(#pa-steel)', [p('M4 -14C8 -6 8 4 4 14L14 14L14 -14Z', C.stM), p('M-8 0C-8 -4 -7 -7 -5 -8C-6 -5 -6 -2 -5.5 1Z', W)]),
  s('M4.5 -2.5C7 -2.5 9 -2 11 -1M4.5 4C7 4 9 4.5 10.5 5.5', O, 1.8),
  part('main d\'arme : pouce', F.thumbB, 'url(#pa-steel)', [p('M-10 -7C-4 -5 2 -6 6 -9L6 -4L-10 -4Z', C.stM), s('M-6 -10.5C-3 -11.5 0 -11.5 2 -10.5', W, 1.5)], 2),
];

const PIV = [176, 204], ROT = 10;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">
<!-- Fuze Arena : PALADIN (préfixe pa-). Même recette que le guerrier (art/guerrier.svg, STYLE.md).
     Chibi cartoon, lumière en haut à gauche, contour #1b1530.
     Ordre : ombre au sol > cape > cheveux du dos > corps > tête > arme. Chaque groupe commence par sa « doublure »
     (mêmes formes en trait 7 = contour extérieur épais), puis les pièces (aplat + ombres découpées + contour 3). -->
<defs>
<linearGradient id="pa-steel" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#f7f9ff"/><stop offset="0.45" stop-color="${C.st}"/><stop offset="1" stop-color="#8a95b2"/></linearGradient>
<linearGradient id="pa-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.auH}"/><stop offset="0.45" stop-color="${C.au}"/><stop offset="1" stop-color="#d98a16"/></linearGradient>
<linearGradient id="pa-iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0.34" stop-color="#0f2f5c"/><stop offset="0.68" stop-color="#2f8fd8"/><stop offset="1" stop-color="#b8ecff"/></linearGradient>
<clipPath id="pa-eye1"><path d="M114.8 122.6C119 119.2 130 118.6 136.2 121.2C137.2 124 136.8 127.5 134 131C131 135 120 135 117 131C114.6 128.2 114 125.4 114.8 122.6Z"/></clipPath>
<clipPath id="pa-eye2"><path d="M150.4 122.6C153 120 159.6 119.6 163.2 120.6C164.2 124.5 164 127 162 131C160 134 153 134 151 131C149.2 127 149.4 124.6 150.4 122.6Z"/></clipPath>
@@CLIPS@@
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<!-- ===== OMBRE AU SOL ===== -->
<ellipse cx="128" cy="291" rx="72" ry="9" fill="${O}" opacity="0.25"/>
<ellipse cx="128" cy="291" rx="54" ry="6.5" fill="${O}" opacity="0.35"/>
<!-- ===== CAPE ===== (attachée sous les épaulières) -->
<g>
${back([F.cape])}
${cape.join('\n')}
</g>
<!-- ===== CHEVEUX DANS LE DOS ===== (suivent la tête : même pivot 128,150) -->
<g transform="rotate(3 128 150)">
${back([F.hairBack])}
${hairBack.join('\n')}
</g>
<!-- ===== CORPS ===== -->
<g>
${back([F.armB, F.vamB, F.greB, F.kneB, F.bootB, F.cufB, F.greA, F.kneA, F.bootA, F.cufA, F.tunic, F.belt, F.paB, F.gorget, F.lameA, F.paA, F.armA, F.vamA, F.fistA, F.thumbA, F.elbowA])}
${body.join('\n')}
</g>
<!-- ===== TÊTE ===== (pivot du cou : 128,150) -->
<g transform="rotate(3 128 150)">
${back([F.skull, F.face, F.lockN, F.bangN, F.bangF, F.band, F.gemSet])}
${head.join('\n')}
</g>
<!-- ===== ARME : marteau de guerre (le poing fait partie du groupe) ===== -->
<!-- pivot arme : ${PIV[0]},${PIV[1]} -->
<g transform="translate(${PIV[0]} ${PIV[1]}) rotate(${ROT})">
${back([F.shaft, F.ring, F.grip, F.pommel, F.collar, F.faceL, F.faceR, F.core, F.spike, F.fistB, F.thumbB])}
${weapon.join('\n')}
</g>
</g>
</svg>
`.replace('@@CLIPS@@', () => defsClips.join('\n'));
const out = path.join(__dirname, '..', 'art', 'paladin.svg');
fs.writeFileSync(out, svg);
console.log('écrit', out, (svg.length / 1024).toFixed(1) + ' Ko');
