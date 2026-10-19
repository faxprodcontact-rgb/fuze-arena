// Générateur de l'archer : écrit art/archer.svg (SVG pur, sans style/class).
// Même recette que gu-build.cjs : chaque pièce = clipPath (forme) + aplat + ombres/reflets découpés + contour.
// Le contour extérieur épais = « doublure » (même forme, trait 7) dessinée sous chaque groupe.
const fs = require('fs'), path = require('path');
const O = '#1b1530';
const W = '#ffffff';
const C = {
  skin: '#fdd2ad', skinL: '#ffe9d6', skinS: '#eea07e', skinD: '#c8705c', blush: '#ff8b7e',
  st: '#c3cce0', stL: '#eef2fa', stM: '#9ba7c3', stS: '#6f7a9b',
  au: '#f7bc2a', auL: '#ffe168', auS: '#cd7e15', auH: '#fff7c4',
  le: '#94593a', leL: '#c58a58', leS: '#6a3a24', leD: '#45230f', leH: '#e0a875',
  wo: '#9a6234', woL: '#c98f55', woS: '#6b3d1f', woD: '#45230f',
  gr: '#4ea83c', grL: '#8edc5e', grS: '#2f7432', grD: '#1c4a26',
  hair: '#6e4329', hairL: '#a8714a', hairS: '#48291a', brow: '#3a2114',
  re: '#e3343d', reS: '#a81d35',
};
const PFX = 'ar-';
const usedIds = new Set();
const defsClips = [];
function bbox(d) {
  const n = d.match(/-?\d*\.?\d+/g).map(Number);
  let xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  const x = Math.min(...xs) - 2, y = Math.min(...ys) - 2;
  return [x, y, Math.max(...xs) - x + 2, Math.max(...ys) - y + 2].map(v => +v.toFixed(1));
}
function idOf(name) {
  let id = PFX + name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  while (usedIds.has(id)) id += '-b';
  usedIds.add(id);
  return id;
}
// pièce : nom, tracé, remplissage, [ombres/reflets], épaisseur contour
function part(name, d, fill, shades = [], sw = 3) {
  const id = idOf(name);
  defsClips.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
  const [x, y, w, h] = bbox(d);
  return `<!-- ${name} -->\n<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${shades.join('')}</g>\n<path d="${d}" fill="none" stroke="${O}" stroke-width="${sw}"/>`;
}
// clip nommé pour un usage libre
function clip(name, d) { const id = idOf(name); defsClips.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return id; }
const back = ds => `<g fill="${O}" stroke="${O}" stroke-width="7">${ds.map(d => `<path d="${d}"/>`).join('')}</g>`;
const p = (d, f, extra = '') => `<path d="${d}" fill="${f}"${extra}/>`;
const s = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
// pli en fuseau le long d'une courbe P0 → P3 (pointu aux 2 bouts) ; d1, d2 = écart des points de contrôle (largeur max ≈ 0.75·(d1+d2))
const spindle = (P0, P1, P2, P3, d1, d2, c) => {
  const L = Math.hypot(P3[0] - P0[0], P3[1] - P0[1]), nx = -(P3[1] - P0[1]) / L, ny = (P3[0] - P0[0]) / L;
  const q = (P, d) => `${+(P[0] + nx * d).toFixed(1)} ${+(P[1] + ny * d).toFixed(1)}`;
  return p(`M${q(P0, 0)}C${q(P1, d1)} ${q(P2, d2)} ${q(P3, 0)}C${q(P2, -d2)} ${q(P1, -d1)} ${q(P0, 0)}Z`, c);
};
const spark = (x, y, r = 7, c = W) => `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="${c}"/>`;

// ---------- FORMES ----------
const F = {
  // carquois (repère local : ouverture en 0,0, fond vers +y)
  quiver: 'M-14 2C-14 30 -13 70 -12 98C-8 104 8 104 12 98C13 70 14 30 14 2Z',
  quivRim: 'M-16 -4C-6 -7 6 -7 16 -4L16 9C6 6 -6 6 -16 9Z',
  fletch: 'M0 -24C4 -27 7 -31 7.5 -35L7.5 -52C5 -49.5 2.5 -47.5 0 -47C-2.5 -47.5 -5 -49.5 -7.5 -52L-7.5 -35C-7 -31 -4 -27 0 -24Z',
  shaft: 'M-1.8 8L1.8 8L1.8 -28L-1.8 -28Z',
  // corps
  armB: 'M148 172C158 167 170 168 177 173L182 186C173 191 161 192 153 189Z',
  braB: 'M168 179C177 175 188 176 194 180L198 194C191 199 181 200 174 198Z',
  legB: 'M134 234C142 231 152 232 158 236L166 268C158 270 150 270 143 268Z',
  bootB: 'M142 263C150 261 160 261 167 263L168 278C178 279 188 283 189 288L189 292L140 292C138 284 139 274 142 263Z',
  cufB: 'M139 256C148 253 160 253 169 256L170 269L163.5 265L156 271L148.5 265L140 269Z',
  legA: 'M88 234C96 231 105 232 112 236L105 268C97 270 89 270 82 268Z',
  bootA: 'M80 263C88 261 98 261 105 263L106 278C115 279 123 283 123 288L123 292L76 292C74 284 76 274 80 263Z',
  cufA: 'M77 256C86 253 98 253 107 256L108 269L101.5 265L94 271L86.5 265L78 269Z',
  tunic: 'M86 158C100 149 140 147 156 154C160 174 158 194 156 210C159 222 164 234 169 246C161 250 152 248 144 250L135.5 240L127 252C113 253 98 251 82 246C85 234 87 222 88 210C84 192 82 174 86 158Z',
  strap: 'M97 176L109 172L162 205L157 216Z',
  belt: 'M87 206C108 213 134 213 157 205L158 218C134 226 108 226 89 220Z',
  buckle: 'M122 209L136 209C138 209 139 210 139 212L139 222C139 224 138 225 136 225L122 225C120 225 119 224 119 222L119 212C119 210 120 209 122 209Z',
  armA: 'M60 182C56 194 56 207 61 218L77 212C79 204 81 196 83 188Z',
  mantle: 'M84 144C70 148 56 158 50 171C47 179 47 186 50 192L66 182L78 196L92 182L105 194L118 180L131 192L143 178L155 188L164 174L174 180C178 170 175 158 165 150C150 144 118 143 84 144Z',
  braA: 'M60 214C66 207 72 204 76 205L96 221C92 226 89 231 87 234C76 230 66 224 60 214Z',
  fistA: 'M86 223C86 217 90 214 96 214C102 214 107 217 107.5 223C108 230 104 236 97 237C90 238 86 233 86 227Z',
  thumbA: 'M90 217C94 214 100 214 104 216C104 219 100 221 95 221C92 221 90 219 90 217Z',
  // tête
  hood: 'M62 148C48 134 42 114 44 94C45 82 48 72 53 64C36 64 18 54 8 30C30 40 56 38 76 30C90 25 104 23 120 24C146 25 166 38 175 58C179 68 181 78 181 88C160 88 122 92 102 100C96 116 94 134 95 150C84 152 72 151 62 148Z',
  hoodFar: 'M166 80C180 84 189 98 189 118C189 134 183 146 174 154L164 142Z',
  face: 'M98 92C122 84 152 84 168 90C173 102 174 118 169 130C165 142 156 152 144 155C130 158 112 155 100 148C95 132 94 110 98 92Z',
  bangs: 'M98 92.5L178 79C180.5 87 179 95 174 100C172 96 169 93 165 92C165 98 163 102 159 105C158 99 154 95 150 93C150 100 147 105 142 108C141 101 137 96 132 94C132 99 129 103 124 105C123 100 120 97 116 95C115 102 110 108 103 113C100 106 98 99 98 92.5Z',
  rim: 'M86 152C83 128 83 108 90 96C106 82 140 75 182 76L182.5 82.5C152 83.5 121 87.5 104 99.5C99 114 98 134 99 152Z',
  // arme : arc (repère local : main en 0,0, arc vertical)
  bow: 'M5 0C5 -13 3 -27 -1 -38C-4 -47 -9 -56 -16 -67C-18 -71 -16 -77 -9 -80L-12 -84C-21 -81 -25 -72 -22 -64C-17 -56 -12 -47 -9 -38C-6 -27 -5 -13 -5 0C-5 13 -6 27 -9 38C-12 47 -17 56 -22 64C-25 72 -21 81 -12 84L-9 80C-16 77 -18 71 -16 67C-9 56 -4 47 -1 38C3 27 5 13 5 0Z',
  grip: 'M-6.5 -19C-2 -20 3 -20 6.5 -19L6.5 19C3 20 -2 20 -6.5 19Z',
  fistB: 'M-9 -11C-3 -13 5 -13 9 -10C12 -6 12 6 9 9C5 12 -3 12 -9 10C-12 6 -12 -6 -9 -11Z',
  thumbB: 'M-9 -9C-5 -13 1 -13 5 -10C4 -6 -2 -5 -8 -6Z',
};

// ---------- CARQUOIS (dans le corps, tout derrière) ----------
const arrow = (a, dx) => `<g transform="translate(${dx} 0) rotate(${a})">
${part('flèche ' + dx + ' : fût', F.shaft, C.wo, [p('M0.4 -30L3 -30L3 10L0.4 10Z', C.woS)], 1.8)}
${part('flèche ' + dx + ' : empennage', F.fletch, W, [p('M0 -54L9 -54L9 -22L0 -22Z', '#d9dbe8'), p('M-9 -43L9 -43L9 -37.5L-9 -37.5Z', C.re), p('M0 -43L9 -43L9 -37.5L0 -37.5Z', C.reS)], 2.2)}
${s('M0 -26L0 -47', O, 1.6)}
</g>`;
const quiver = [
  arrow(-16, -6), arrow(0, 1), arrow(15, 7),
  part('carquois : étui', F.quiver, C.le, [
    p('M4 0C6 30 6 70 4 104L18 104L18 0Z', C.leS),
    p('M-9 12C-10 40 -10 70 -9 96L-5 96C-6 70 -6 40 -5 12Z', C.leL),
    s('M-14 40C-4 44 6 44 14 40', O, 2), s('M-14 46C-4 50 6 50 14 46', C.leD, 1.6),
  ], 3),
  part('carquois : bord', F.quivRim, C.leL, [p('M5 -8L18 -8L18 12L6 12Z', C.le), s('M-13 2C-4 0 4 0 13 2', C.leH, 1.5)], 2.5),
];

// ---------- CORPS ----------
const fold = (x0, y0, x1, y1, w0, w1, c) => p(`M${x0 - w0} ${y0}C${x0 - w0} ${(y0 + y1) / 2} ${x1 - w1} ${y1 - 6} ${x1 - w1} ${y1}L${x1 + w1} ${y1}C${x1 + w1} ${y1 - 6} ${x0 + w0} ${(y0 + y1) / 2} ${x0 + w0} ${y0}Z`, c);
const body = [
  part('bras arrière : manche', F.armB, C.gr, [p('M140 186C152 192 166 192 184 184L184 200L140 200Z', C.grS), p('M150 172C158 170 166 171 172 176L172 166L150 166Z', C.grD)]),
  part('bras arrière : brassard cuir', F.braB, C.le, [p('M176 180C182 188 184 196 182 206L196 206L196 180Z', C.leS), s('M168 186C172 184 176 183 180 184', C.leL, 2), s('M173 186L176 199M180 185L183 198', C.leD, 1.6)]),
  part('jambe arrière : chausse', F.legB, C.leS, [p('M151 232C156 246 160 258 162 272L172 272L172 232Z', C.leD), s('M140 242L142 254', C.le, 2.5)]),
  part('jambe arrière : botte', F.bootB, C.le, [p('M160 256C163 264 164 274 165 280C171 282 180 284 192 286L192 296L156 296Z', C.leS), p('M133 287L193 287L193 296L133 296Z', C.leD), s('M146 274L146 281', C.leL, 2.5), s('M172 281C178 281 183 283 186 285', C.leL, 2.5)]),
  part('jambe arrière : revers de botte', F.cufB, C.leL, [p('M160 250L174 250L174 272L158 272Z', C.le), s('M141 258C150 255 160 255 167 258', C.leH, 1.5)], 2.5),
  part('jambe avant : chausse', F.legA, C.leS, [p('M103 232C104 246 102 258 100 272L114 272L114 232Z', C.leD), s('M92 242L90 254', C.le, 2.5)]),
  part('jambe avant : botte', F.bootA, C.le, [p('M97 256C99 264 100 274 101 280C106 282 114 284 126 286L126 296L92 296Z', C.leS), p('M68 287L126 287L126 296L68 296Z', C.leD), s('M84 274L83.5 281', C.leL, 2.5), s('M108 281C114 281 118 283 120 285', C.leL, 2.5)]),
  part('jambe avant : revers de botte', F.cufA, C.leL, [p('M98 250L112 250L112 272L96 272Z', C.le), s('M79 258C88 255 98 255 105 258', C.leH, 1.5)], 2.5),
  part('tunique', F.tunic, C.gr, [
    p('M140 150C146 176 148 200 148 220C151 232 154 242 156 254L174 254L174 150Z', C.grS),
    p('M90 168C88 184 88 198 90 210L96 210C94 196 94 182 96 168Z', C.grL),
    // plis de la jupe : creux sombre + arête claire (fuseaux qui s'élargissent)
    fold(108, 222, 103, 250, 1, 3.5, C.grS), fold(102, 224, 96, 248, 0.6, 2, C.grL),
    fold(122, 224, 121, 252, 1, 3.5, C.grS), fold(116, 224, 113, 250, 0.6, 2, C.grL),
    fold(144, 222, 152, 248, 1, 3, C.grD),
    // ombres portées : sous la pèlerine et sous la ceinture
    p('M80 176L92 182L105 194L118 180L131 192L143 178L155 188L164 174L174 180L174 200C150 206 110 206 80 196Z', C.grS),
    p('M84 218C108 226 134 226 160 216L160 228C134 236 108 236 84 230Z', C.grS),
    // ourlet : galon vert clair + son ombre
    s('M82 246C98 251 113 253 127 252L135.5 240L144 250C152 248 161 250 169 246', C.grL, 5),
    `<g clip-path="url(#${PFX}tunsh)">${s('M82 246C98 251 113 253 127 252L135.5 240L144 250C152 248 161 250 169 246', C.gr, 5)}</g>`,
  ]),
  part('bandoulière', F.strap, C.le, [p('M103 170L170 210L160 222Z', C.leS), s('M101 176L156 209', C.leL, 1.6)], 2.5),
  `<!-- bandoulière : boucle -->
<path d="M139.8 190.8L146.6 195.1L140.2 205.2L133.4 200.9Z" fill="url(#${PFX}gold)" stroke="${O}" stroke-width="2.2"/>
<path d="M140 194.6L142.6 196.2L140.4 199.6L137.8 198Z" fill="${C.leD}"/>
<path d="M137 192.5L141 191.5" fill="none" stroke="${C.auH}" stroke-width="1.2"/>`,
  part('ceinture', F.belt, C.le, [p('M86 215C106 222 134 222 158 213L158 230L86 230Z', C.leS), s('M90 210C108 216 130 216 150 210', C.leL, 1.6)]),
  part('boucle', F.buckle, `url(#${PFX}gold)`, [p('M118 219L140 219L140 227L118 227Z', C.auS), p('M124 214L134 214L134 220L124 220Z', C.leD), s('M121.5 212L129 212', C.auH, 1.6)], 2.5),
  part('bras avant : manche', F.armA, C.gr, [p('M72 182L88 182L86 216L74 216Z', C.grS), s('M62 194C61 202 62 208 64 213', C.grL, 2.5)]),
  part('pèlerine', F.mantle, C.gr, [
    p('M150 146C164 152 172 162 174 176L186 176L186 140Z', C.grS),
    p('M44 178L66 170L78 186L92 172L105 184L118 170L131 182L143 168L155 178L164 164L180 168L180 200L44 200Z', C.grS),
    p('M56 168C62 158 72 151 84 148C76 154 68 162 64 172Z', C.grL),
    fold(86, 158, 78, 196, 0.4, 3, C.grS), fold(80, 160, 70, 190, 0.3, 1.6, C.grL),
    fold(108, 164, 105, 194, 0.4, 3, C.grS),
    fold(150, 160, 155, 188, 0.4, 3, C.grD),
  ]),
  `<!-- pèlerine : fibule (feuille dorée) -->
<path d="M121 169C127 161 139 160 145 164C141 172 129 175 121 169Z" fill="url(#${PFX}gold)" stroke="${O}" stroke-width="2.2"/>
<path d="M124 168.5C131 167 137 166 142.5 164.5" fill="none" stroke="${C.auS}" stroke-width="1.4"/>
<path d="M126 164.5C129 162.5 133 161.8 136 162" fill="none" stroke="${C.auH}" stroke-width="1.4"/>`,
  part('bras avant : brassard cuir', F.braA, C.le, [p('M62 222C72 230 82 234 92 230L92 240L60 240Z', C.leS), s('M66 211C72 207 76 207 78 208', C.leL, 2), s('M70 216L80 213M76 222L86 218M82 228L90 223', C.leD, 1.6)]),
  part('bras avant : poing', F.fistA, C.skin, [p('M84 230C92 236 102 236 110 226L110 240L84 240Z', C.skinS), s('M89 222C89 219 91 217 94 216.5', C.skinL, 2)]),
  s('M107.5 224.5L102 225M106.5 230L101 230M103 234.5L99 233.5', O, 1.8),
  part('bras avant : pouce', F.thumbA, C.skin, [p('M90 219C94 222 100 222 105 218L105 224L90 224Z', C.skinS)], 2),
];

// ---------- TÊTE ----------
const head = [
  part('capuche : chaperon', F.hood, C.gr, [
    p('M118 20C150 24 172 46 176 84L192 84L192 18Z', C.grS),
    p('M44 112C52 128 66 140 90 142L96 154L40 154Z', C.grS),
    p('M8 30C22 46 38 54 58 55C61 61 58 70 51 78L2 78Z', C.grS),
    p('M36 62C44 64 52 63 57 60C57 64 55 67 52 70C46 68 40 66 36 62Z', C.grD),
    p('M60 80C60 60 76 42 100 34C86 46 74 60 68 80Z', C.grL),
    p('M12 33C32 43 56 41 74 34L76 39C58 46 32 48 14 37Z', C.grL),
    s('M150 82C150 56 132 32 100 28', C.grS, 2.2),
    s('M58 52C70 46 82 42 94 40', C.grS, 2),
    // plis en fuseau : partent de la nuque (bas) et filent vers la pointe ; creux #2f7432 + arête #8edc5e côté lumière
    spindle([88, 146], [70, 128], [60, 103], [58, 78], 2, 5, C.grS), spindle([78, 138], [63, 124], [55, 103], [53, 83], 1, 2.6, C.grL),
    spindle([74, 147], [61, 134], [54, 118], [52, 98], 1.6, 4, C.grS), spindle([63, 134], [55, 126], [50, 115], [48.5, 103], 0.8, 2, C.grL),
  ], 3),
  part('capuche : côté lointain', F.hoodFar, C.grD, [p('M178 82C190 96 192 132 178 156L196 156L196 82Z', C.grS)], 3),
  part('visage', F.face, C.skin, [
    p('M172 96C166 122 158 142 128 156L180 160L180 96Z', C.skinS),
    p('M96 80L182 80L182 97C150 94 120 100 102 114L96 114Z', C.skinS),
    `<ellipse cx="117" cy="138" rx="7" ry="4" fill="${C.blush}" opacity="0.55"/><ellipse cx="163" cy="136" rx="4" ry="3" fill="${C.blush}" opacity="0.5"/>`,
    `<ellipse cx="113" cy="135" rx="2.2" ry="1.4" fill="${W}" opacity="0.8"/>`,
  ], 3),
  part('cheveux : frange', F.bangs, C.hair, [
    // ombre portée du bord de la capuche + ombre côté droit de chaque mèche
    p('M92 74L184 74L184 85.5C158 85.5 126 90 100 99Z', C.hairS),
    p('M170 88C172 92 172 96 174 100L182 100L182 88Z M156 92C158 96 159 101 159 105L164 106L164 92Z M137 93C140 98 142 103 142 108L150 108L150 93Z M118 95C121 99 123 102 124 105L131 105L131 95Z', C.hairS),
    // reflets : arête claire sur chaque mèche
    s('M101 96C101 101 102 106 103 109M118 98C120 100 121 102 122 104M134 97C136 100 138 103 139 106M152 95C154 98 156 101 157 103', C.hairL, 2),
    s('M112 98L122 95.5M131 93.5C136 92.5 141 91.9 146 91.6', '#c99068', 2.2),
  ], 2.5),
  `<!-- visage : oeil proche (rond et ouvert = regard vif) -->
<path d="M115 111C118 106 130 105 135 108C137 115 137 126 134 131C131 135 120 135 117 131C114 126 113 118 115 111Z" fill="${W}"/>
<g clip-path="url(#${PFX}eye1)"><ellipse cx="126" cy="122" rx="8" ry="10.5" fill="url(#${PFX}iris)"/><ellipse cx="126.5" cy="121.5" rx="3.8" ry="5.4" fill="${O}"/><path d="M119.5 127C122.5 132.5 130 132.5 133 127C130 130.5 122.5 130.5 119.5 127Z" fill="#e4ffb8"/></g>
<circle cx="122" cy="116" r="4.2" fill="${W}"/><circle cx="130" cy="128" r="1.8" fill="${W}"/>
<path d="M110 112C116 103 129 101 138 107L137 110.5C129 106 120 106 115 114L110 114Z" fill="${O}"/>
<path d="M118 133C122 135 127 135 131 133" fill="none" stroke="${O}" stroke-width="1.6"/>
<!-- visage : oeil lointain -->
<path d="M150 110C153 106 160 106 163 109C164 116 164 126 162 131C160 134 153 134 151 131C149 126 149 117 150 110Z" fill="${W}"/>
<g clip-path="url(#${PFX}eye2)"><ellipse cx="157" cy="122" rx="5.6" ry="10" fill="url(#${PFX}iris)"/><ellipse cx="157.6" cy="121.5" rx="2.7" ry="5.2" fill="${O}"/><path d="M152 127C154 131 159 131 162 127C159 129 155 129 152 127Z" fill="#e4ffb8"/></g>
<circle cx="154.4" cy="116" r="3.6" fill="${W}"/><circle cx="159.6" cy="128" r="1.3" fill="${W}"/>
<path d="M148 111C151 105 160 103 166 107L168 110L165 110.5C161 108 154 108 150 113Z" fill="${O}"/>
<path d="M153.5 132.8C156 134 159 134 161 132.6" fill="none" stroke="${O}" stroke-width="1.4"/>
<!-- visage : sourcils (arqués et relevés = vif) -->
<path d="M110 98.5C117 92.5 129 91.5 137 96.5L136 100.3C129 96.3 119 96.5 111.5 102Z" fill="${C.brow}" stroke="${C.brow}" stroke-width="1.2"/>
<path d="M148.5 98.5C153 94 160 92.5 166.5 94L166.5 97.5C160.5 97 154.5 98 150.5 101.5Z" fill="${C.brow}" stroke="${C.brow}" stroke-width="1.2"/>
<!-- visage : nez -->
<path d="M146.5 127.5C148.5 129.5 148.2 131.8 145.2 132.4" fill="none" stroke="${C.skinD}" stroke-width="2"/>
<!-- visage : bouche (petit sourire ouvert) -->
<path d="M139 140C144 142.5 150 142 155 138.5C155 144 152 148.5 147 149C142 149.5 139.5 145.5 139 140Z" fill="#7a2433"/>
<g clip-path="url(#${PFX}mouth)"><ellipse cx="148.5" cy="149" rx="5.5" ry="3.6" fill="#e8706e"/></g>
<path d="M139.6 140.6C144 142.6 150 142.2 154.6 139.2L154.4 141.4C150 144 144 144.4 140.4 142.6Z" fill="${W}"/>
<path d="M139 140C144 142.5 150 142 155 138.5C155 144 152 148.5 147 149C142 149.5 139.5 145.5 139 140Z" fill="none" stroke="${O}" stroke-width="2"/>
<path d="M139 140L136 138.4" fill="none" stroke="${O}" stroke-width="2"/>`,
  part('capuche : bord replié', F.rim, C.gr, [
    p('M186 79.5C150 79.5 116 84 98.5 95C93 110 92 132 93 154L106 154C103 134 103 114 108 102C122 92 150 88 186 90Z', C.grS),
    s('M86 128C85 114 87 104 93 98C106 88 136 80.5 168 78.6', C.grL, 2.5),
  ], 3),
];

// ---------- ARME : arc ----------
const weapon = [
  `<!-- arc : corde -->
${s('M-20 -70L-20 70', O, 3.8)}${s('M-20 -70L-20 70', '#fff3d6', 1.6)}`,
  part('arc : bois', F.bow, C.wo, [
    // ombre côté avant (droite), limite qui suit la courbe de la branche
    p('M1.5 0C1.5 -13 -0.5 -26 -4 -37C-7 -46 -12 -55 -18.5 -65L-8 -88L20 -88L20 88L-8 88L-18.5 65C-12 55 -7 46 -4 37C-0.5 26 1.5 13 1.5 0Z', C.woS),
    // arête éclairée côté gauche
    s('M-2.5 -14C-2.5 -25 -4 -33 -6.5 -40C-9.5 -48 -14 -56 -19.5 -63', C.woL, 2),
    s('M-2.5 14C-2.5 25 -4 33 -6.5 40C-9.5 48 -14 56 -19.5 63', C.woL, 2),
    // veinage
    s('M0 -24C-0.5 -28 -1.5 -32 -3 -35M-12 -58C-13.5 -60 -15 -62 -16.5 -64M-2.5 26C-3 29 -4 32 -5 34', C.woD, 1.4),
  ], 3),
  `<!-- arc : bagues dorées et embouts -->
<path d="M-12.5 -47L-2 -50L0.5 -43.5L-9.5 -40.5Z" fill="url(#${PFX}gold)" stroke="${O}" stroke-width="1.8"/>
<path d="M-12.5 47L-2 50L0.5 43.5L-9.5 40.5Z" fill="url(#${PFX}gold)" stroke="${O}" stroke-width="1.8"/>
<path d="M-11 -47.5L-4 -49.5" fill="none" stroke="${C.auH}" stroke-width="1.2"/>
<circle cx="-10.5" cy="-82" r="3.4" fill="url(#${PFX}gold)" stroke="${O}" stroke-width="1.8"/><circle cx="-11.6" cy="-83.2" r="1" fill="${W}"/>
<circle cx="-10.5" cy="82" r="3.4" fill="url(#${PFX}gold)" stroke="${O}" stroke-width="1.8"/>`,
  part('arc : poignée cuir', F.grip, C.le, [p('M1.5 -21L9 -21L9 21L1.5 21Z', C.leS), s('M-6.5 -17L6.5 -14M-6.5 14L6.5 17', C.leD, 1.6)], 2.5),
  part('main d\'arme : poing', F.fistB, C.skin, [p('M4 -14C8 -6 8 4 4 14L14 14L14 -14Z', C.skinS), s('M-7 2C-5 6 -1 8 3 8', C.skinL, 2)], 3),
  s('M4.5 -2.5C7 -2.5 9 -2 11 -1M4.5 4C7 4 9 4.5 10.5 5.5', O, 1.8),
  part('main d\'arme : pouce', F.thumbB, C.skin, [p('M-10 -7C-4 -5 2 -6 6 -9L6 -4L-10 -4Z', C.skinS)], 2),
];

const QUIVER_T = 'translate(46 114) rotate(-30)';
const PIV = [198, 190], ROT = 10;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">
<!-- Fuze Arena : ARCHER (préfixe ar-) : même style que le guerrier (référence art/guerrier.svg).
     Chibi cartoon, lumière en haut à gauche, contour #1b1530.
     Ordre : ombre au sol > corps (carquois derrière) > tête > arme. Chaque groupe commence par sa « doublure »
     (mêmes formes en trait 7 = contour extérieur épais), puis les pièces (aplat + ombres découpées + contour 3). -->
<defs>
<linearGradient id="${PFX}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.auH}"/><stop offset="0.45" stop-color="${C.au}"/><stop offset="1" stop-color="#d98a16"/></linearGradient>
<linearGradient id="${PFX}iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3d14"/><stop offset="0.55" stop-color="#4f9a2c"/><stop offset="1" stop-color="#c6f08a"/></linearGradient>
<clipPath id="${PFX}tunsh"><path d="M140 150C146 176 148 200 148 220C151 232 154 242 156 254L174 254L174 150Z"/></clipPath>
<clipPath id="${PFX}eye1"><path d="M115 111C118 106 130 105 135 108C137 115 137 126 134 131C131 135 120 135 117 131C114 126 113 118 115 111Z"/></clipPath>
<clipPath id="${PFX}eye2"><path d="M150 110C153 106 160 106 163 109C164 116 164 126 162 131C160 134 153 134 151 131C149 126 149 117 150 110Z"/></clipPath>
<clipPath id="${PFX}mouth"><path d="M139 140C144 142.5 150 142 155 138.5C155 144 152 148.5 147 149C142 149.5 139.5 145.5 139 140Z"/></clipPath>
@@CLIPS@@
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<!-- ===== OMBRE AU SOL ===== -->
<ellipse cx="130" cy="291" rx="68" ry="9" fill="${O}" opacity="0.25"/>
<ellipse cx="130" cy="291" rx="52" ry="6.5" fill="${O}" opacity="0.35"/>
<!-- ===== CORPS ===== -->
<g>
<!-- carquois (dans le dos, ouverture au-dessus de l'épaule proche) -->
<g transform="${QUIVER_T}">
${back([F.quiver, F.quivRim])}
${quiver.join('\n')}
</g>
${back([F.armB, F.braB, F.legB, F.bootB, F.cufB, F.legA, F.bootA, F.cufA, F.tunic, F.belt, F.armA, F.mantle, F.braA, F.fistA, F.thumbA])}
${body.join('\n')}
</g>
<!-- ===== TÊTE ===== (pivot du cou : 128,150) -->
<g transform="rotate(3 128 150)">
${back([F.hood, F.hoodFar, F.face, F.rim])}
${head.join('\n')}
</g>
<!-- ===== ARME : arc (le poing fait partie du groupe) ===== -->
<!-- pivot arme : ${PIV[0]},${PIV[1]} -->
<g transform="translate(${PIV[0]} ${PIV[1]}) rotate(${ROT})">
${back([F.bow, F.grip, F.fistB, F.thumbB])}
${weapon.join('\n')}
</g>
</g>
</svg>
`.replace('@@CLIPS@@', () => defsClips.join('\n'));
const out = path.join(__dirname, '..', 'art', 'archer.svg');
fs.writeFileSync(out, svg);
console.log('écrit', out, (svg.length / 1024).toFixed(1) + ' Ko');
