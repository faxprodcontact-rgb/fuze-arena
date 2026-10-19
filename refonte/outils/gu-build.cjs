// Générateur du guerrier : écrit art/guerrier.svg (SVG pur, sans style/class).
// Chaque pièce = clipPath (forme) + aplat + ombres/reflets découpés + contour.
// Le contour extérieur épais = « doublure » (même forme, trait 7) dessinée sous chaque groupe.
const fs = require('fs'), path = require('path');
const O = '#1b1530';
const C = {
  skin: '#fdd2ad', skinL: '#ffe9d6', skinS: '#eea07e', skinD: '#c8705c', blush: '#ff8b7e',
  st: '#c3cce0', stL: '#eef2fa', stM: '#9ba7c3', stS: '#6f7a9b', stD: '#4a5273',
  au: '#f7bc2a', auL: '#ffe168', auS: '#cd7e15', auH: '#fff7c4',
  le: '#94593a', leL: '#c58a58', leS: '#6a3a24', leD: '#45230f',
  re: '#e3343d', reL: '#ff6d60', reS: '#a81d35', reD: '#6e1129',
  ch: '#7f8aa8', chS: '#5a6381', chL: '#c3cbe0',
  hairS: '#3a2114',
};
const usedIds = new Set();
const defsClips = [];
function bbox(d) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number);
  let xs = [], ys = [];
  // approx : paires de nombres (suffisant pour M/L/C ; les arcs A sont évités dans les pièces)
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  const x = Math.min(...xs) - 2, y = Math.min(...ys) - 2;
  return [x, y, Math.max(...xs) - x + 2, Math.max(...ys) - y + 2].map(v => +v.toFixed(1));
}
// pièce : nom, tracé, remplissage, [ombres/reflets], épaisseur contour
function part(name, d, fill, shades = [], sw = 3) {
  let id = 'gu-' + name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  while (usedIds.has(id)) id += '-b';
  usedIds.add(id);
  defsClips.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
  const [x, y, w, h] = bbox(d);
  return `<!-- ${name} -->\n<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${shades.join('')}</g>\n<path d="${d}" fill="none" stroke="${O}" stroke-width="${sw}"/>`;
}
const back = ds => `<g fill="${O}" stroke="${O}" stroke-width="7">${ds.map(d => `<path d="${d}"/>`).join('')}</g>`;
const p = (d, f, extra = '') => `<path d="${d}" fill="${f}"${extra}/>`;
const s = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;

// ---------- FORMES ----------
const F = {
  // corps
  armB: 'M148 176C156 172 166 174 172 180L174 194C166 198 156 198 150 194Z',
  vamB: 'M152 190C160 186 170 186 176 190L178 204C172 210 164 212 158 210Z',
  greB: 'M134 238C143 235 152 236 158 240L167 277C159 280 150 280 144 278Z',
  wingB: 'M157 244C164 242 169 247 168 254C167 259 162 260 157 256Z',
  kneB: 'M135 245C135 239 141 235 148 235C155 235 161 239 161 245C161 251 155 257 148 259C141 257 135 251 135 245Z',
  bootB: 'M141 274C151 272 163 272 170 275L171 279C181 279 190 283 190 288L190 292L140 292C138 286 138 280 141 274Z',
  cufB: 'M140 269C151 265.5 163 265.5 171 269L171 278C163 275 151 275 140 278Z',
  greA: 'M88 238C97 235 106 236 112 240L102 277C94 280 85 280 79 278Z',
  wingA: 'M89 244C82 242 77 247 78 254C79 259 84 260 89 256Z',
  kneA: 'M86 245C86 239 92 235 99 235C106 235 112 239 112 245C112 251 106 257 99 259C92 257 86 251 86 245Z',
  bootA: 'M77 274C87 272 98 272 105 275L106 279C115 279 123 283 123 288L123 292L75 292C73 286 73 280 77 274Z',
  cufA: 'M76 269C87 265.5 98 265.5 106 269L106 278C98 275 87 275 76 278Z',
  tasA: 'M86 216C92 220 100 222 103 222L101 237C95 240 87 238 80 233Z',
  tasB: 'M153 214C158 221 160 228 162 235C159 239 156 241 153 241L152 224Z',
  torso: 'M82 160C96 150 142 148 158 156C162 178 160 198 155 216L88 218C82 200 78 180 82 160Z',
  tabard: 'M104 156L148 156C150 176 152 196 153 214C155 226 157 234 159 242C152 246 145 243 138 246C127 250 112 247 97 243C98 234 99 224 100 214C100 194 101 176 104 156Z',
  belt: 'M86 208C106 215 134 215 155 207L156 220C134 228 106 228 88 222Z',
  buckle: 'M121 211L139 211C141 211 142 212 142 214L142 226C142 228 141 229 139 229L121 229C119 229 118 228 118 226L118 214C118 212 119 211 121 211Z',
  paB: 'M136 156C148 148 168 152 174 164C176 176 168 184 158 186C146 186 138 178 136 168Z',
  gorget: 'M98 148C114 156 144 156 160 148L160 162C144 170 114 170 98 162Z',
  lameA: 'M58 182C74 192 100 188 116 172C121 179 119 188 113 193C99 202 74 204 61 197Z',
  paA: 'M54 174C52 154 68 142 90 142C110 142 120 152 118 166C114 178 98 186 78 188C64 189 55 184 54 174Z',
  armA: 'M62 192C60 200 60 206 62 212L80 212C80 206 81 200 82 194Z',
  vamA: 'M63 217C70 225 78 231 87 234L95 220C88 216 81 211 74 205Z',
  elbowA: 'M59 211C59 205 63 202 68 202C73 202 77 206 77 211C77 216 73 220 68 220C63 220 59 216 59 211Z',
  fistA: 'M86 223C86 217 90 214 96 214C102 214 107 217 107.5 223C108 230 104 236 97 237C90 238 86 233 86 227Z',
  thumbA: 'M90 217C94 214 100 214 104 216C104 219 100 221 95 221C92 221 90 219 90 217Z',
  // tête
  plume: 'M106 36C108 20 98 6 80 4C62 2 44 8 30 18C22 24 14 26 6 24C12 30 18 34 26 36C18 42 12 46 6 46C14 52 22 56 32 54C26 60 22 66 18 72C30 72 40 66 48 58C60 48 80 42 100 42Z',
  holder: 'M94 42C94 36 100 32 106 33C110 34 111 38 110 42C108 46 96 47 94 42Z',
  shell: 'M58 134C44 110 46 70 70 50C92 32 132 28 156 46C170 58 177 74 176 90C160 94 120 98 104 104C100 118 96 134 92 146C80 148 66 144 58 134Z',
  cheekB: 'M166 86C176 90 183 102 181 116C180 124 176 130 171 132L166 126Z',
  face: 'M100 92C124 84 152 84 168 90C173 102 174 118 169 130C165 142 156 152 144 155C130 158 112 155 100 148Z',
  cheek: 'M88 100C98 102 106 108 108 120C110 132 106 142 100 150C94 152 88 150 84 146C82 130 84 112 88 100Z',
  rim: 'M84 98C104 84 142 76 177 82L177 90C150 88 118 94 100 106C94 104 88 102 84 98Z',
  // arme (repère local : main en 0,0, lame vers le haut)
  blade: 'M-9 -14L-7.5 -100L0 -122L7.5 -100L9 -14Z',
  grip: 'M-4.5 -10L4.5 -10L4.5 22L-4.5 22Z',
  pommel: 'M-7 28C-7 24 -4 21 0 21C4 21 7 24 7 28C7 32 4 35 0 35C-4 35 -7 32 -7 28Z',
  guard: 'M-27 -16C-27 -22 -21 -24 -17 -20C-11 -15 11 -15 17 -20C21 -24 27 -22 27 -16C25 -9 12 -7 0 -7C-12 -7 -25 -9 -27 -16Z',
  fistB: 'M-9 -11C-3 -13 5 -13 9 -10C12 -6 12 6 9 9C5 12 -3 12 -9 10C-12 6 -12 -6 -9 -11Z',
  thumbB: 'M-9 -9C-5 -13 1 -13 5 -10C4 -6 -2 -5 -8 -6Z',
};

const W = '#ffffff';
const mail = (x, y, n, rows, c = C.chS) => { // rangées d'écailles de cotte de mailles
  let d = '';
  for (let r = 0; r < rows; r++) { d += `M${x + (r % 2) * 2.5} ${y + r * 5}`; for (let i = 0; i < n; i++) d += 'q2.5 2.6 5 0'; }
  return s(d, c, 1.3);
};
const rivet = (x, y, r = 2.4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#gu-gold)" stroke="${O}" stroke-width="1.6"/>`;
const rivetS = (x, y) => `<circle cx="${x}" cy="${y}" r="2" fill="${C.stL}" stroke="${O}" stroke-width="1.4"/>`;
// ---------- CORPS ----------
const body = [
  part('bras arrière : manche de mailles', F.armB, C.ch, [mail(146, 180, 6, 4), p('M140 190C152 196 166 194 180 188L180 204L140 204Z', C.chS)]),
  part('bras arrière : canon d\'avant-bras', F.vamB, 'url(#gu-steel)', [p('M166 184C172 192 172 202 168 214L184 214L184 184Z', C.stM), s('M156 196L160 206', W, 2), s('M158 210C166 211 172 207 178 203', C.au, 5)]),
  part('jambe arrière : jambière', F.greB, 'url(#gu-steel)', [p('M151 236C157 252 160 266 163 282L175 282L175 236Z', C.stM), s('M140 252L145 272', W, 2.5)]),
  part('jambe arrière : botte', F.bootB, C.le, [p('M163 274C167 282 179 284 193 286L193 292L153 292Z', C.leS), p('M133 287L193 287L193 296L133 296Z', C.leD), s('M174 281C180 281 184 283 186 285', C.leL, 2.5)]),
  part('jambe arrière : revers de botte', F.cufB, C.leL, [p('M161 262L175 262L175 280L159 280Z', C.le), s('M142 270C151 267 161 267 169 270', '#e0a875', 1.5)]),
  part('jambe arrière : genouillère', F.kneB, 'url(#gu-steel)', [p('M133 249C140 255 152 255 163 243L165 262L131 262Z', C.stM), p('M140 239C143 237 147 237 150 238C146 239 143 241 141 244Z', W), s('M135 245C143 249 153 249 161 245', O, 2)]),
  part('jambe avant : jambière', F.greA, 'url(#gu-steel)', [p('M103 236C104 254 101 268 99 282L116 282L116 236Z', C.stM), s('M92 252L87 272', W, 2.5)]),
  part('jambe avant : botte', F.bootA, C.le, [p('M97 274C101 282 112 284 126 286L126 292L88 292Z', C.leS), p('M68 287L126 287L126 296L68 296Z', C.leD), s('M108 281C114 281 118 283 120 285', C.leL, 2.5)]),
  part('jambe avant : revers de botte', F.cufA, C.leL, [p('M96 262L110 262L110 280L94 280Z', C.le), s('M78 270C87 267 96 267 104 270', '#e0a875', 1.5)]),
  part('jambe avant : genouillère', F.kneA, 'url(#gu-steel)', [p('M84 249C92 255 104 255 114 243L116 262L82 262Z', C.stM), p('M91 239C94 237 98 237 101 238C97 239 94 241 92 244Z', W), s('M86 245C94 249 104 249 112 245', O, 2)]),
  part('tassette gauche', F.tasA, 'url(#gu-steel)', [p('M78 229C88 235 98 235 104 231L104 243L78 243Z', C.stM), s('M83 226.5C90 229.5 97 230.5 102 229.5', O, 2), s('M89 222L86 227', W, 2)]),
  part('tassette droite', F.tasB, 'url(#gu-steel)', [p('M157 214L170 214L170 248L159 248Z', C.stM)]),
  part('torse : plastron', F.torso, 'url(#gu-steel)', [p('M150 150L170 150L170 220L150 220Z', C.stS), p('M80 180C90 188 100 190 104 188L104 198C94 200 86 198 80 194Z', C.stS), s('M88 170C86 180 86 190 88 198', W, 2.5)]),
  part('tabard', F.tabard, C.re, [
    p('M140 150C144 180 146 210 146 226C148 236 150 244 152 252L170 252L170 150Z', C.reS),
    p('M106 160C108 180 108 196 106 210L112 210C113 196 113 178 111 160Z', C.reL),
    // plis de la jupe : creux sombre + arête claire
    p('M114 224C114 231 112 238 110 248L117 248C118 239 117 231 116 224Z', C.reS),
    p('M110 226C109 233 107 239 105 246L108 246C110 239 111 233 112 226Z', C.reL),
    p('M134 224C135 231 137 238 139 246L133 247C132 239 132 231 132 224Z', C.reS),
    p('M127 226C127 233 127 240 126 248L130 248C130 240 130 233 129 226Z', C.reL),
    // ombres portées : sous le gorgerin et sous la ceinture
    p('M100 150L156 150L156 158C140 166 116 166 100 158Z', C.reS),
    p('M96 220C116 228 136 228 158 218L158 228C136 236 116 236 96 230Z', C.reS),
    s(F.tabard, C.au, 9),
    `<g clip-path="url(#gu-tabsh)">${s(F.tabard, C.auS, 9)}</g>`,
  ]),
  `<!-- tabard : emblème (rose dorée) -->
<path d="M127 175L138 186L127 197L116 186Z" fill="url(#gu-gold)" stroke="${O}" stroke-width="2.5"/>
<path d="M120.7 179.7A6.5 6.5 0 1 1 133.3 179.7A6.5 6.5 0 1 1 133.3 192.3A6.5 6.5 0 1 1 120.7 192.3A6.5 6.5 0 1 1 120.7 179.7Z" fill="url(#gu-gold)" stroke="${O}" stroke-width="2.5"/>
<path d="M121 178C122 175 125 173 127 173" fill="none" stroke="${C.auH}" stroke-width="1.6"/>
<circle cx="127" cy="186" r="3.4" fill="${C.re}" stroke="${O}" stroke-width="1.8"/>
<circle cx="126" cy="185" r="1.1" fill="${W}"/>`,
  part('ceinture', F.belt, C.le, [p('M86 217C106 224 134 224 156 215L156 232L86 232Z', C.leS), s('M90 211C108 217 130 217 150 211', C.leL, 1.6)]),
  part('boucle', F.buckle, 'url(#gu-gold)', [p('M118 222L142 222L142 230L118 230Z', C.auS), p('M124 216L136 216L136 224L124 224Z', C.leD), s('M121 214L130 214', C.auH, 1.6)], 2.5),
  part('épaulière arrière', F.paB, 'url(#gu-steel)', [p('M134 172C144 182 162 184 176 168L180 168L180 192L130 192Z', C.stM), p('M150 188C162 186 172 178 176 168L180 190Z', C.stS), s('M143 160C149 155 157 154 163 156', W, 2.5), s('M138 174C146 184 162 186 172 176', C.au, 5)]),
  part('gorgerin', F.gorget, 'url(#gu-steel)', [p('M136 140L170 140L170 175L136 175Z', C.stM), p('M96 146C114 154 144 154 162 146L162 155C144 163 114 163 96 155Z', C.stS), s('M101 159C108 163 116 165 124 166', W, 1.8)]),
  part('bras avant : manche de mailles', F.armA, C.ch, [mail(58, 196, 6, 4), p('M74 186L90 186L90 214L76 214Z', C.chS)]),
  part('épaulière avant : lame inférieure', F.lameA, 'url(#gu-steel)', [p('M56 192C74 200 100 198 120 182L124 206L56 206Z', C.stM), s('M61 197C74 204 99 202 113 193', C.au, 7)]),
  part('épaulière avant : coque', F.paA, 'url(#gu-steel)', [
    p('M54 178C66 186 94 184 110 172C116 166 118 160 118 154L124 154L124 194L50 194Z', C.stM),
    p('M72 190C92 186 108 178 118 166L122 166L122 194L66 194Z', C.stS),
    p('M60 170C60 157 70 148 84 147C74 152 67 160 65 171Z', W),
    `<circle cx="91" cy="150" r="2.2" fill="${W}"/>`,
    s('M59 179C64 184 72 186 80 186', C.stL, 2),
  ], 3),
  rivet(70, 173, 2.6) + rivet(105, 162, 2.6),
  part('bras avant : canon d\'avant-bras', F.vamA, 'url(#gu-steel)', [p('M60 226C72 230 84 232 96 228L96 240L60 240Z', C.stM), s('M70 219C75 223 80 226 85 228', W, 2), s('M87 234L95 220', C.au, 7)]),
  part('bras avant : cubitière', F.elbowA, 'url(#gu-steel)', [p('M57 213C61 218 72 219 79 209L80 224L57 224Z', C.stM), p('M62 207C64 204 67 203 70 203C67 205 65 207 64 209Z', W)]),
  rivet(68, 211, 2),
  part('bras avant : poing (gant cuir)', F.fistA, C.le, [p('M84 230C92 236 102 236 110 226L110 240L84 240Z', C.leS), s('M89 222C89 219 91 217 94 216.5', C.leL, 2)]),
  s('M107.5 224.5L102 225M106.5 230L101 230M103 234.5L99 233.5', O, 1.8),
  part('bras avant : pouce', F.thumbA, C.le, [p('M90 219C94 222 100 222 105 218L105 224L90 224Z', C.leS), s('M93 216.5C96 215.5 99 215.5 101 216', C.leL, 1.5)], 2),
];

// ---------- TÊTE ----------
const head = [
  part('plumet', F.plume, C.re, [
    p('M98 42C76 40 50 46 32 54L10 80L60 80Z', C.reS),
    p('M100 38C80 28 50 30 26 36L4 40L4 48C20 44 40 40 60 42C76 42 90 42 100 42Z', C.reS, ' opacity="0.55"'),
    p('M102 22C92 8 66 6 44 14L40 0L110 0Z', C.reL),
    p('M62 54C72 46 86 42 100 42L104 52L56 62Z', C.reD),
    s('M100 38C80 28 50 30 26 36', C.reD, 2.2), s('M98 42C76 40 50 46 32 54', C.reD, 2.2),
    s('M96 14C86 8 70 8 56 13', '#ffc4b2', 2.6), s('M66 27C56 27 46 30 37 34', C.reL, 2), s('M70 46C58 47 48 51 40 56', C.re, 2),
  ], 3),
  part('support du plumet', F.holder, 'url(#gu-gold)', [p('M92 40C98 44 106 44 112 38L112 48L92 48Z', C.auS)], 2.5),
  part('casque : coque', F.shell, 'url(#gu-steel)', [
    p('M110 30C140 34 162 54 164 90L180 90L180 28Z', C.stM),
    p('M44 112C56 128 74 136 94 134L96 150L40 150Z', C.stM),
    p('M62 84C62 64 78 46 100 40C86 50 74 64 70 84Z', W),
    `<path d="M84 52L86 57L91 59L86 61L84 66L82 61L77 59L82 57Z" fill="${W}"/>`,
    s('M50 104C50 116 54 126 60 134', C.stL, 2.5),
    s('M52 118C64 127 80 129 96 125', O, 2.5),
    rivetS(64, 128) + rivetS(80, 132),
  ], 3),
  part('casque : protège-joue lointain', F.cheekB, C.stM, [p('M164 112C172 118 178 120 184 116L184 136L164 136Z', C.stS)], 3),
  part('visage', F.face, C.skin, [
    p('M172 96C166 122 158 142 128 156L180 160L180 96Z', C.skinS),
    p('M96 80L182 80L182 97C150 94 120 100 102 114L96 114Z', C.skinS),
    `<ellipse cx="117" cy="138" rx="7" ry="4" fill="${C.blush}" opacity="0.55"/><ellipse cx="163" cy="136" rx="4" ry="3" fill="${C.blush}" opacity="0.5"/>`,
    `<ellipse cx="113" cy="135" rx="2.2" ry="1.4" fill="${W}" opacity="0.8"/>`,
  ], 3),
  `<!-- visage : oeil proche -->
<path d="M115 114C119 110 130 109 135 112C137 118 137 126 134 131C131 135 120 135 117 131C114 126 113 119 115 114Z" fill="${W}"/>
<g clip-path="url(#gu-eye1)"><ellipse cx="126.5" cy="123" rx="7.5" ry="10" fill="url(#gu-iris)"/><ellipse cx="127" cy="122" rx="3.6" ry="5.4" fill="${O}"/><path d="M120 127C123 132 130 132 133 127C130 130 123 130 120 127Z" fill="#c6f4ff"/></g>
<ellipse cx="123" cy="117.5" rx="3" ry="3.6" fill="${W}"/><circle cx="130" cy="128" r="1.6" fill="${W}"/>
<path d="M110 116C117 108 129 107 138 112L137 115.5C129 112 120 112 115 118L110 118Z" fill="${O}"/>
<path d="M118 133C122 135 127 135 131 133" fill="none" stroke="${O}" stroke-width="1.6"/>
<!-- visage : oeil lointain -->
<path d="M150 113C153 110 160 110 163 112C164 118 164 126 162 131C160 134 153 134 151 131C149 126 149 118 150 113Z" fill="${W}"/>
<g clip-path="url(#gu-eye2)"><ellipse cx="157" cy="122.5" rx="5.5" ry="10" fill="url(#gu-iris)"/><ellipse cx="157.6" cy="121.5" rx="2.6" ry="5.2" fill="${O}"/><path d="M152 127C154 131 159 131 162 127C159 129 155 129 152 127Z" fill="#c6f4ff"/></g>
<circle cx="154.8" cy="117.5" r="2.4" fill="${W}"/><circle cx="159.5" cy="128" r="1.2" fill="${W}"/>
<path d="M148 115C152 109 160 108 166 111L168 114L165 114C161 112 154 112 150 117Z" fill="${O}"/>
<path d="M153.5 132.8C156 134 159 134 161 132.6" fill="none" stroke="${O}" stroke-width="1.4"/>
<!-- visage : sourcils (froncés vers le nez = déterminé) -->
<path d="M111 101C119 97 130 99 138 106L136.5 110C129 104 120 102 112 104.5Z" fill="${C.hairS}" stroke="${C.hairS}" stroke-width="1.2"/>
<path d="M148 108C153 102 160 100 167 100L167 103.5C160 104 154 106 150 111Z" fill="${C.hairS}" stroke="${C.hairS}" stroke-width="1.2"/>
<!-- visage : nez -->
<path d="M146.5 127.5C148.5 129.5 148.2 131.8 145.2 132.4" fill="none" stroke="${C.skinD}" stroke-width="2"/>
<!-- visage : bouche (sourire en coin) -->
<path d="M138 141C144 143 150 142 155 138C155 142.5 152 145.5 147 146C142 146.5 139 144.5 138 141Z" fill="#7a2433"/>
<path d="M139 141.6C144 143.4 150 142.4 154.6 138.8L154.3 140.6C150 143.8 144 144.6 140 143.4Z" fill="${W}"/>
<path d="M138 141C144 143 150 142 155 138C155 142.5 152 145.5 147 146C142 146.5 139 144.5 138 141Z" fill="none" stroke="${O}" stroke-width="2"/>
<path d="M138 141L134.5 139.8" fill="none" stroke="${O}" stroke-width="2"/>`,
  part('casque : protège-joue', F.cheek, 'url(#gu-steel)', [p('M100 100C106 116 106 136 98 152L112 152L112 100Z', C.stM), s('M88 110C87 122 88 134 90 142', W, 2.5)], 3),
  rivet(94, 112, 2.6),
  part('casque : bandeau frontal', F.rim, 'url(#gu-steel)', [p('M80 102C100 92 140 84 182 86L182 96L80 110Z', C.stM), s('M92 94C110 85 140 80 170 82', W, 2)], 3),
  rivetS(110, 93) + rivetS(128, 88) + rivetS(148, 85) + rivetS(166, 84),
  `<!-- casque : crête -->
${s('M142 80C140 58 126 40 100 34', O, 9)}${s('M142 80C140 58 126 40 100 34', C.st, 4.5)}${s('M138 76C136 58 124 44 104 37', W, 1.6)}`,
];

// ---------- ARME ----------
const weapon = [
  part('épée : lame', F.blade, C.stL, [
    p('M0 -14L0 -122L7.5 -100L9 -14Z', C.stM),
    s('M0 -24L0 -92', C.stS, 3), s('M-2 -24L-2 -92', W, 1),
    s('M-5.2 -22L-4 -96', W, 2.2),
    s('M6.2 -18L5.4 -98', C.stS, 1.4),
  ], 3),
  `<path d="M-9 -14L0 -30L9 -14Z" fill="url(#gu-gold)" stroke="${O}" stroke-width="2.2"/>`,
  `<path d="M-3 -112L-1.6 -106L4 -104.5L-1.6 -103L-3 -97L-4.4 -103L-10 -104.5L-4.4 -106Z" fill="${W}"/>`,
  part('épée : poignée cuir', F.grip, C.le, [p('M1 -12L8 -12L8 24L1 24Z', C.leS), s('M-4.5 11L4.5 14M-4.5 15.5L4.5 18.5M-4.5 20L4.5 23', C.leD, 1.6)], 2.5),
  part('épée : pommeau', F.pommel, 'url(#gu-gold)', [p('M-8 29C-4 34 4 34 8 29L8 36L-8 36Z', C.auS), `<circle cx="0" cy="28" r="3" fill="${C.re}" stroke="${O}" stroke-width="1.5"/>`, `<circle cx="-2.5" cy="24" r="1.4" fill="${W}"/>`], 3),
  part('épée : garde', F.guard, 'url(#gu-gold)', [p('M-30 -12C-15 -9 15 -9 30 -12L30 0L-30 0Z', C.auS), s('M-20 -19C-14 -15 -6 -14 0 -14', C.auH, 1.6)], 3),
  `<circle cx="0" cy="-12" r="4.5" fill="${C.re}" stroke="${O}" stroke-width="2"/><circle cx="-1.4" cy="-13.6" r="1.4" fill="${W}"/>`,
  part('main d\'arme : poing (gant cuir)', F.fistB, C.le, [p('M4 -14C8 -6 8 4 4 14L14 14L14 -14Z', C.leS), s('M-7 2C-5 6 -1 8 3 8', C.leL, 2)], 3),
  s('M4.5 -2.5C7 -2.5 9 -2 11 -1M4.5 4C7 4 9 4.5 10.5 5.5', O, 1.8),
  part('main d\'arme : pouce', F.thumbB, C.le, [p('M-10 -7C-4 -5 2 -6 6 -9L6 -4L-10 -4Z', C.leS), s('M-6 -10.5C-3 -11.5 0 -11.5 2 -10.5', C.leL, 1.5)], 2),
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">
<!-- Fuze Arena : GUERRIER (préfixe gu-) : référence de style de la refonte.
     Chibi cartoon, lumière en haut à gauche, contour #1b1530.
     Ordre : ombre au sol > corps > tête > arme. Chaque groupe commence par sa « doublure »
     (mêmes formes en trait 7 = contour extérieur épais), puis les pièces (aplat + ombres découpées + contour 3). -->
<defs>
<linearGradient id="gu-steel" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#f7f9ff"/><stop offset="0.45" stop-color="${C.st}"/><stop offset="1" stop-color="#8a95b2"/></linearGradient>
<linearGradient id="gu-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.auH}"/><stop offset="0.45" stop-color="${C.au}"/><stop offset="1" stop-color="#d98a16"/></linearGradient>
<linearGradient id="gu-iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16225e"/><stop offset="0.55" stop-color="#2d74dc"/><stop offset="1" stop-color="#8fe3ff"/></linearGradient>
<clipPath id="gu-tabsh"><path d="M140 150C144 180 146 210 146 226C148 236 150 244 152 252L170 252L170 150Z"/></clipPath>
<clipPath id="gu-eye1"><path d="M115 113C118 108 130 107 135 111C137 117 137 126 134 131C131 135 120 135 117 131C114 126 113 118 115 113Z"/></clipPath>
<clipPath id="gu-eye2"><path d="M150 112C153 108 160 108 163 111C164 117 164 126 162 131C160 134 153 134 151 131C149 126 149 117 150 112Z"/></clipPath>
@@CLIPS@@
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<!-- ===== OMBRE AU SOL ===== -->
<ellipse cx="128" cy="291" rx="70" ry="9" fill="${O}" opacity="0.25"/>
<ellipse cx="128" cy="291" rx="54" ry="6.5" fill="${O}" opacity="0.35"/>
<!-- ===== CORPS ===== -->
<g>
${back([F.armB, F.vamB, F.greB, F.kneB, F.bootB, F.cufB, F.greA, F.kneA, F.bootA, F.cufA, F.tasA, F.tasB, F.torso, F.tabard, F.belt, F.paB, F.gorget, F.lameA, F.paA, F.armA, F.vamA, F.fistA, F.thumbA, F.elbowA])}
${body.join('\n')}
</g>
<!-- ===== TÊTE ===== (pivot du cou : 128,150) -->
<g transform="rotate(3 128 150)">
${back([F.plume, F.shell, F.cheekB, F.face, F.rim])}
${head.join('\n')}
</g>
<!-- ===== ARME : épée (le poing fait partie du groupe) ===== -->
<!-- pivot arme : 170,206 -->
<g transform="translate(170 206) rotate(28)">
${back([F.blade, F.guard, F.grip, F.pommel, F.fistB, F.thumbB])}
${weapon.join('\n')}
</g>
</g>
</svg>
`.replace('@@CLIPS@@', () => defsClips.join('\n'));
const out = path.join(__dirname, '..', 'art', 'guerrier.svg');
fs.writeFileSync(out, svg);
console.log('écrit', out, (svg.length / 1024).toFixed(1) + ' Ko');
