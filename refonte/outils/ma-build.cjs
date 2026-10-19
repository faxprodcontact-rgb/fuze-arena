// Générateur du mage : écrit art/mage.svg (SVG pur, sans style/class).
// Même méthode que tools/gu-build.cjs : chaque pièce = clipPath (forme) + aplat + ombres/reflets découpés + contour.
// Le contour extérieur épais = « doublure » (même forme, trait 7) dessinée sous chaque groupe.
const fs = require('fs'), path = require('path');
const O = '#1b1530';
const W = '#ffffff';
const C = {
  skin: '#fdd2ad', skinL: '#ffe9d6', skinS: '#eea07e', skinD: '#c8705c', blush: '#ff8b7e',
  st: '#c3cce0', stL: '#eef2fa', stM: '#9ba7c3', stS: '#6f7a9b',
  au: '#f7bc2a', auL: '#ffe168', auS: '#cd7e15', auH: '#fff7c4', auD: '#8f4c0a',
  le: '#94593a', leL: '#c58a58', leS: '#6a3a24', leD: '#45230f',
  wo: '#9a6234', woL: '#c98f55', woS: '#6b3d1f', woD: '#45230f',
  vi: '#7d47cc', viL: '#b57cf2', viS: '#532b96', viD: '#351868',
  hw: '#e2e7f2', hwL: '#ffffff', hwS: '#aeb7cf', hwD: '#7f88a6',
  cy: '#8ff5ff', cyS: '#27c4ea', cyD: '#0b78b0',
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
const slug = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// pièce : nom, tracé, remplissage, [ombres/reflets], épaisseur contour
function part(name, d, fill, shades = [], sw = 3) {
  let id = 'ma-' + slug(name);
  while (usedIds.has(id)) id += '-b';
  usedIds.add(id);
  defsClips.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
  const [x, y, w, h] = bbox(d);
  return `<!-- ${name} -->\n<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${shades.join('')}</g>\n<path d="${d}" fill="none" stroke="${O}" stroke-width="${sw}"/>`;
}
// clip supplémentaire (zone d'ombre d'un galon, etc.)
function clip(name, d) { const id = 'ma-' + name; defsClips.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return id; }
const back = ds => `<g fill="${O}" stroke="${O}" stroke-width="7">${ds.map(d => `<path d="${d}"/>`).join('')}</g>`;
const p = (d, f, extra = '') => `<path d="${d}" fill="${f}"${extra}/>`;
const s = (d, c, w = 2, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${extra}/>`;
const r1 = v => +v.toFixed(1);
// étoile à 4 branches (forme de l'étincelle)
const starD = (x, y, r) => { const k = r * 0.3; return `M${r1(x)} ${r1(y - r)}L${r1(x + k)} ${r1(y - k)}L${r1(x + r)} ${r1(y)}L${r1(x + k)} ${r1(y + k)}L${r1(x)} ${r1(y + r)}L${r1(x - k)} ${r1(y + k)}L${r1(x - r)} ${r1(y)}L${r1(x - k)} ${r1(y - k)}Z`; };
const star = (x, y, r = 4.5, f = C.auL) => `<path d="${starD(x, y, r)}" fill="${f}" stroke="${O}" stroke-width="1.4"/>`;
const spark = (x, y, r, f = W) => `<path d="${starD(x, y, r)}" fill="${f}"/>`;

// ---------- FORMES ----------
const HEM = 'C182 273 174 275 166 276C160 276 155 270 151 262C147 270 142 276 135 277C120 279 98 275 79 276C72 277 67 275 63 272';
const F = {
  // corps
  sleeveB: 'M144 158C156 150 170 156 176 166C180 174 180 184 176 194L152 196C148 186 146 172 144 158Z',
  forearmB: 'M153 180C161 175 171 177 176 183C180 188 182 194 181 200C180 208 176 216 168 222C161 216 156 210 153 203C151 195 150 186 153 180Z',
  lining: 'M130 252L172 252L174 284L128 284Z',
  shoeB: 'M148 277C158 271 174 271 184 275C191 278 197 275 202 266C204 262 208 262 208.5 266C209 277 203 289 190 292L150 292C145 290 144 282 148 277Z',
  shoeA: 'M72 278C82 272 100 272 114 275C128 278 141 277 147 270C149 266 153 266 153.5 270C154 279 148 290 134 292L74 292C69 290 68 283 72 278Z',
  robe: 'M80 158C98 148 142 146 162 154C168 176 168 196 166 212C172 232 180 250 188 268' + HEM + 'C69 252 76 232 82 212C78 194 76 176 80 158Z',
  belt: 'M83 204C106 212 140 212 167 202L168 216C140 226 106 226 85 218Z',
  buckle: 'M141 207L153 207C155 207 156 208 156 210L156 222C156 224 155 225 153 225L141 225C139 225 138 224 138 222L138 210C138 208 139 207 141 207Z',
  sleeveA: 'M58 168C64 154 90 150 99 166C104 184 108 204 113 224C102 236 82 240 66 240C55 240 49 234 51 222C52 202 54 184 58 168Z',
  cuffInA: 'M56 230C68 222 96 218 111 223C108 233 88 240 66 239C59 238 55 235 56 230Z',
  handA: 'M80 236C80 229 86 225 93 225C100 225 105 229 105.5 236C106 243 101 249 94 250C87 251 81 246 80 240Z',
  thumbA: 'M96 228C100 225 106 226 108 230C108 234 104 236 100 235C97 234 95 231 96 228Z',
  // tête
  hair: 'M102 98C86 92 70 96 63 108C57 120 55 134 52 146C50 152 46 156 38 158C44 164 52 165 57 163C54 170 49 175 42 178C51 183 61 181 67 176C70 182 70 188 67 192C78 191 88 184 93 174C98 162 100 146 100 132Z',
  burn: 'M86 97L101 98C101 106 99 114 99 124C97 127 93 127 91 124C89 116 87 106 86 97Z',
  ear: 'M91 113C83 108 73 112 74 121C75 130 81 136 91 134Z',
  face: 'M90 94C112 86 150 84 174 90C180 102 182 118 178 132C174 146 162 156 146 158C126 160 106 154 96 142C90 132 88 112 90 94Z',
  beard: 'M87 99L101 100C100 110 99 120 101 130C104 140 110 146 120 147C134 149 152 149 166 145C174 142 179 136 181 125C185 143 182 160 174 174C166 188 154 200 140 208C134 212 126 216 114 220C118 214 120 208 120 202C112 202 104 198 97 192C98 180 96 166 92 152C89 140 86 120 87 99Z',
  must: 'M146 139C138 136 126 139 120 145C116 149 110 150 104 147C107 155 118 160 130 158C139 156 145 152 148 148C152 153 160 156 168 155C176 154 181 148 183 141C178 144 172 144 167 141C160 137 152 136 146 139Z',
  brim: 'M50 93C49 83 86 75 130 75C174 75 211 83 210 93C209 101 180 104 130 104C80 104 51 101 50 93Z',
  cone: 'M84 88C88 70 96 54 108 42C94 36 74 28 56 22C46 19 38 15 32 9C42 6 58 5 74 8C102 13 128 20 144 32C160 46 172 66 176 88C150 96 110 96 84 88Z',
  band: 'M87 72C112 80 150 80 173 72L177 87C150 96 110 96 84 88Z',
  // arme (repère local : main en 0,0, bâton vers le haut)
  shaft: 'M-5 -114C-4 -96 -6 -82 -6.5 -72C-7 -66 -5 -62 -5 -56C-5 -30 -5 0 -4.5 20C-4.5 40 -4 54 -4 62L4 62C4 54 4.5 40 4.5 20C5 0 5 -30 5 -56C5 -80 4 -96 5 -114Z',
  ferrule: 'M-5.5 56L5.5 56L5 68C3 71 -3 71 -5 68Z',
  ring: 'M-7.5 -114C-3 -116 3 -116 7.5 -114L7.5 -104C3 -102 -3 -102 -7.5 -104Z',
  clawL: 'M-6 -114C-15 -120 -21 -131 -19 -143C-18 -149 -15 -153 -10 -156C-12 -149 -13 -141 -10 -133C-8 -127 -4 -122 0 -120Z',
  clawR: 'M6 -114C15 -120 21 -131 19 -143C18 -149 15 -153 10 -156C12 -149 13 -141 10 -133C8 -127 4 -122 0 -120Z',
  orb: 'M-14 -140C-14 -148 -8 -154 0 -154C8 -154 14 -148 14 -140C14 -132 8 -126 0 -126C-8 -126 -14 -132 -14 -140Z',
  fistB: 'M-9 -11C-3 -13 5 -13 9 -10C12 -6 12 6 9 9C5 12 -3 12 -9 10C-12 6 -12 -6 -9 -11Z',
  thumbB: 'M-9 -9C-5 -13 1 -13 5 -10C4 -6 -2 -5 -8 -6Z',
};

// zones d'ombre pour les galons
const robeSh = clip('robe-ombre', 'M146 150C154 180 156 200 156 214C160 236 166 258 170 290L200 290L200 150Z');

// ---------- CHEVEUX ARRIÈRE (derrière le corps, suivent la tête) ----------
const hairBack = [
  part('cheveux arrière (longues mèches)', F.hair, C.hw, [
    p('M84 110C90 140 92 170 88 206L112 206L112 104Z', C.hwS),
    p('M40 96L112 96L112 108C92 106 72 108 56 118Z', C.hwS),
    p('M58 166C54 172 48 176 40 180L70 194L76 176Z', C.hwS), s('M54 152C51 156 47 158 42 158.5', W, 2),
    p('M64 116C59 128 57 140 55 150C59 140 62 128 68 118Z', W),
    s('M76 114C74 130 70 146 62 162', C.hwD, 2.2), s('M88 128C88 146 84 162 74 178', C.hwD, 2.2),
  ], 3),
];

// ---------- CORPS ----------
const body = [
  part('bras arrière : haut de manche', F.sleeveB, C.viS, [p('M166 156C174 166 178 180 176 196L186 196L186 156Z', C.viD)]),
  part('robe : doublure intérieure', F.lining, C.viD, [p('M152 250L178 250L178 286L158 286Z', '#22104a')]),
  part('pied arrière : babouche', F.shoeB, C.le, [p('M170 274C177 283 190 285 212 276L212 294L162 294Z', C.leS), p('M140 288L212 288L212 296L140 296Z', C.leD), s('M156 277C163 274.5 172 274.5 179 275.5', C.leL, 2.2), s('M196 276C200 274 203 270 204.5 266.5', C.leL, 1.8)]),
  part('pied avant : babouche', F.shoeA, C.le, [p('M100 275C108 284 126 286 156 279L156 294L90 294Z', C.leS), p('M66 288L156 288L156 296L66 296Z', C.leD), s('M79 279C86 276.5 95 276.5 102 277.5', C.leL, 2.2), s('M141 277C144.5 275.5 147.5 273 149 270', C.leL, 1.8)]),
  part('robe', F.robe, C.vi, [
    // ombre propre côté droit
    p('M146 150C154 180 156 200 156 214C160 236 166 258 170 290L200 290L200 150Z', C.viS),
    p('M161 150C167 180 167 200 165 214C169 236 176 256 182 290L200 290L200 150Z', C.viD),
    // lumière côté gauche
    p('M86 160C84 180 85 198 88 212C82 236 77 258 73 282L80 282C84 258 89 236 94 212C91 196 91 178 92 160Z', C.viL),
    // plis de la jupe : creux sombre + arête claire (fuseaux)
    p('M104 224C103 240 100 258 96 284L103 284C106 258 107 240 106 224Z', C.viS),
    p('M99 226C97 242 94 260 89 282L93 282C97 260 100 242 101 226Z', C.viL),
    p('M126 226C127 244 128 262 128 286L135 286C134 262 131 244 128 226Z', C.viS),
    p('M121 228C121 246 120 264 118 284L122 284C123 264 123 246 123 228Z', C.viL),
    // ombres portées : sous la barbe et sous la ceinture
    p('M76 150L170 150L170 162C140 168 104 168 76 162Z', C.viS),
    p('M80 214C106 224 140 224 170 212L170 224C140 236 106 236 80 226Z', C.viS),
    // galon de l'ourlet
    s('M188 268' + HEM, O, 17), s('M188 268' + HEM, C.au, 12),
    `<g clip-path="url(#${robeSh})">${s('M188 268' + HEM, C.auS, 12)}</g>`,
    s('M70 268C80 271 92 271 104 269', C.auH, 1.6),
  ]),
  // ouverture de la robe : galon doré vertical (décalé à droite = 3/4)
  `<!-- robe : galon central -->
${s('M147 214C148 232 150 248 151 262', O, 10)}${s('M147 214C148 232 150 248 151 262', C.au, 5.5)}${s('M145.6 222C146.4 236 147.4 248 148.4 256', C.auH, 1.4)}`,
  `<!-- robe : étoiles dorées -->
${star(80, 250, 4.6)}${star(113, 260, 4)}${star(100, 236, 3.2)}${star(136, 246, 4.2)}${star(167, 258, 4)}${star(161, 233, 3)}`,
  part('ceinture', F.belt, C.le, [p('M83 213C106 221 140 221 168 211L168 230L83 230Z', C.leS), s('M88 207C108 213 132 213 152 207', C.leL, 1.8)]),
  part('boucle', F.buckle, 'url(#ma-gold)', [p('M136 218L158 218L158 228L136 228Z', C.auS), p('M143 211L151 211L151 221L143 221Z', C.leD), s('M141 209.5L148 209.5', C.auH, 1.6)], 2.5),
  part('bras arrière : manche (avant-bras)', F.forearmB, C.vi, [
    p('M151 196C158 206 166 212 178 208L186 200L186 226L150 226Z', C.viS),
    s('M159 184C164 180 170 179 175 181', C.viL, 2.2),
    // ouverture de la manche (intérieur sombre) + galon doré
    p('M181 187C185 200 180 214 168 222C168 208 172 195 181 187Z', C.viD),
    s('M181.5 188C183 202 178 214 167 222.5', C.au, 7),
  ]),
  star(166, 198, 3),
  part('bras avant : manche', F.sleeveA, C.vi, [
    p('M92 158C99 180 103 204 107 224L118 224L118 158Z', C.viS),
    p('M101 200C105 214 108 224 112 230L120 230L120 200Z', C.viD),
    p('M62 168C58 186 56 204 56 222L61 222C61 204 63 186 67 170Z', C.viL),
    s('M70 158C76 155 84 155 90 158', C.viL, 2.5),
    p('M80 180C84 194 87 206 88 219L92.5 218C90.5 204 86 190 81.5 180Z', C.viS), p('M74.5 186C77.5 198 79.5 208 80.5 220L83.5 219.5C82.5 207 80.5 196 77 186Z', C.viL),
  ]),
  // ouverture de la manche : intérieur sombre + galon
  part('bras avant : ouverture de manche', F.cuffInA, C.viD, [], 2.5),
  part('bras avant : main', F.handA, C.skin, [p('M78 243C86 250 98 250 108 240L108 254L78 254Z', C.skinS), s('M83 235C83 231 85 229 88 228', C.skinL, 2)]),
  s('M105.5 237.5L100 238M104.5 243L99 243M101 247.5L97 246.5', O, 1.8),
  part('bras avant : pouce', F.thumbA, C.skin, [p('M96 232C100 235 104 236 109 232L109 238L96 238Z', C.skinS)], 2),
  `<!-- bras avant : galon de la manche -->
${s('M54 226C68 219 96 215 112 220', O, 9)}${s('M54 226C68 219 96 215 112 220', C.au, 5)}${s('M58 222C68 218 80 216 90 216', C.auH, 1.4)}`,
  star(70, 196, 4.2) + star(86, 176, 3),
];

// ---------- TÊTE ----------
const head = [
  part('oreille', F.ear, C.skin, [p('M80 130C84 134 88 135 92 134L92 138L76 138Z', C.skinS), s('M86 117C81 117 78.5 121 80 126', C.skinS, 2.2), `<ellipse cx="81" cy="125" rx="3" ry="2.2" fill="${C.blush}" opacity="0.45"/>`], 2.5),
  part('visage', F.face, C.skin, [
    p('M174 96C168 122 160 144 130 158L182 162L182 96Z', C.skinS),
    p('M86 80L184 80L184 102C152 99 120 104 100 116L86 116Z', C.skinS),
    `<ellipse cx="117" cy="141" rx="7" ry="4" fill="${C.blush}" opacity="0.55"/><ellipse cx="166" cy="139" rx="4" ry="3" fill="${C.blush}" opacity="0.5"/>`,
    `<ellipse cx="112" cy="138" rx="2.2" ry="1.4" fill="${W}" opacity="0.8"/>`,
  ], 3),
  `<!-- visage : oeil proche (paupière mi-close = malicieux) -->
<path d="M114 121C119 118 130 118 136 121C137 126 136 130 133 133C129 136 120 136 117 133C114 130 113 125 114 121Z" fill="${W}"/>
<g clip-path="url(#ma-eye1)"><ellipse cx="126" cy="129" rx="7.5" ry="10" fill="url(#ma-iris)"/><ellipse cx="126.6" cy="129" rx="3.6" ry="5.4" fill="${O}"/><path d="M119.5 132C122.5 136 129.5 136 132.5 132C129.5 134.5 122.5 134.5 119.5 132Z" fill="#e6dcff"/></g>
<ellipse cx="122.6" cy="124.6" rx="2.6" ry="2.8" fill="${W}"/><circle cx="130" cy="132" r="1.4" fill="${W}"/>
<path d="M109 121C116 115 130 114 139 119L138 122.5C130 119.5 120 119.5 114 124L109 123Z" fill="${O}"/>
<path d="M118 135C122 137 127 137 131 135" fill="none" stroke="${O}" stroke-width="1.6"/>
<!-- visage : oeil lointain -->
<path d="M150 121C153 118 160 118 164 120C165 125 164 130 162 133C160 136 153 136 151 133C149 129 149 124 150 121Z" fill="${W}"/>
<g clip-path="url(#ma-eye2)"><ellipse cx="156.6" cy="129" rx="5.5" ry="10" fill="url(#ma-iris)"/><ellipse cx="157.2" cy="129" rx="2.6" ry="5.2" fill="${O}"/><path d="M152 132C154 135.5 159 135.5 162 132C159 134 155 134 152 132Z" fill="#e6dcff"/></g>
<circle cx="154.4" cy="124.8" r="2.1" fill="${W}"/><circle cx="159.4" cy="132" r="1.1" fill="${W}"/>
<path d="M147 122C151 116 160 115 166 118L168 121L165 121C161 119 154 119 150 124Z" fill="${O}"/>
<path d="M153.5 135C156 136.2 159 136.2 161 134.8" fill="none" stroke="${O}" stroke-width="1.4"/>
<!-- visage : rides (poches sous les yeux) -->
<path d="M119 139.5C123 141 128 141 132 139.5" fill="none" stroke="${C.skinS}" stroke-width="1.4"/>
<!-- visage : nez (crochet un peu plus fort : vieux sage) -->
<ellipse cx="146" cy="135" rx="4" ry="2.6" fill="${C.blush}" opacity="0.45"/>
<path d="M146 128.5C150 131.5 150.4 136 145.4 137.2" fill="none" stroke="${C.skinD}" stroke-width="2.2"/>`,
  part('barbe', F.beard, C.hw, [
    p('M172 148C170 172 158 192 138 206C130 211 122 216 112 222L190 222L190 148Z', C.hwS),
    p('M122 198C112 198 104 196 97 192C99 186 99 180 99 172C104 184 112 194 124 196Z', C.hwS),
    p('M92 104C91 124 94 146 100 168C97 150 95 128 96 106Z', W), p('M101 132C102 150 104 168 110 186C106 170 104 154 104 140Z', W),
    p('M118 156C136 162 156 162 172 154L172 166C156 172 136 172 116 164Z', C.hwS),
    s('M112 168C114 178 116 188 118 196', C.hwD, 2.2), s('M132 168C134 180 132 192 126 206', C.hwD, 2.2),
    s('M152 168C153 176 150 186 142 196', C.hwD, 2.2),
    p('M96 100L102 100L102 132L96 128Z', C.hwS),
  ], 3),
  part('moustache', F.must, C.hw, [
    p('M146 150C152 156 162 160 172 158C178 156 182 150 184 142L188 168L140 168Z', C.hwS),
    p('M120 156C126 160 136 160 146 154L148 166L118 166Z', C.hwS),
    s('M108 151C114 152 120 149 125 145', W, 2.2), s('M150 144C156 141 164 142 170 145', W, 2),
  ], 3),
  `<!-- visage : sourire malicieux sous la moustache -->
<path d="M153 160.5C157 162.5 162 162 166 158.5" fill="none" stroke="${O}" stroke-width="2"/>`,
  part('chapeau : bord', F.brim, C.vi, [
    p('M150 74C176 76 210 82 212 94L212 106L150 106Z', C.viS),
    p('M48 94C70 100 110 102 130 102C160 102 196 100 212 94L212 108L48 108Z', C.viD),
    p('M54 90C58 82 80 78 104 77C84 80 66 84 60 92Z', C.viL),
    s('M58 97C76 101 100 102 124 102', C.viS, 2),
  ], 3),
  part('chapeau : cône', F.cone, C.vi, [
    p('M136 28C156 46 166 66 170 92L190 92L190 20Z', C.viS),
    p('M108 42C94 36 74 28 56 22C46 19 38 15 32 9L28 30L110 54Z', C.viS),
    p('M108 42C118 38 130 34 140 30C126 26 112 22 98 18L60 14C76 22 94 32 108 42Z', C.viL),
    p('M110 44C102 54 94 68 90 86L96 86C99 70 104 56 112 46Z', C.viL),
    p('M108 42C114 40 124 38 136 30L142 34C130 42 118 46 110 50Z', C.viD),
    s('M44 11C60 9 80 12 98 16', '#d9b8ff', 2.2),
  ], 3),
  part('chapeau : bande dorée', F.band, 'url(#ma-gold)', [
    p('M150 80C160 80 168 77 173 72L180 72L180 98L150 98Z', C.auS),
    p('M84 84C110 92 150 92 177 83L178 98L84 98Z', C.auS),
    s('M90 76C110 82 130 83 146 82', C.auH, 1.6),
  ], 3),
  `<!-- chapeau : gemme cyan -->
<path d="M142 77L148 83L142 89L136 83Z" fill="url(#ma-gold)" stroke="${O}" stroke-width="2"/>
<circle cx="142" cy="83" r="3.2" fill="${C.cy}" stroke="${O}" stroke-width="1.6"/><circle cx="141" cy="82" r="1.1" fill="${W}"/>
<!-- chapeau : étoiles -->
${star(112, 62, 4.6)}${star(146, 50, 3.6)}${star(70, 20, 3.4)}${star(158, 74, 2.6)}`,
  `<!-- sourcils broussailleux (blancs ; le lointain est relevé = malicieux) -->
<path d="M105 114C105 110 107 107 110 105C112 102 116 100.5 121 100.6C124 99 128 99 131 100.5C136 101.5 140 104.5 142 109C138 108 132 107.5 127 108C120 109 114 112 110 117C107.5 118.5 105 117 105 114Z" fill="${C.hw}" stroke="${O}" stroke-width="2"/>
<path d="M109 109C113 105 118 103 124 102.6" fill="none" stroke="${W}" stroke-width="2"/>
<path d="M149 111C152 104 159 99 167 98C172 97.5 176 99 178 102C173 102 167 103 161 106C157 108 153 111 151 114C150 114 149 113 149 111Z" fill="${C.hw}" stroke="${O}" stroke-width="2"/>
<path d="M152 108C155 103 160 100.5 166 100" fill="none" stroke="${W}" stroke-width="2"/>`,
];

// ---------- ARME : bâton ----------
const weapon = [
  `<!-- bâton : halo de l'orbe (sans contour ; dégradé radial qui s'éteint vers le bord, comme la lueur du démon) -->
<circle cx="0" cy="-140" r="28" fill="url(#ma-lueur)"/>`,
  back([F.shaft, F.ferrule, F.ring, F.clawL, F.clawR, F.orb, F.fistB, F.thumbB]),
  part('bâton : orbe', F.orb, 'url(#ma-orb)', [
    p('M14 -144C12 -132 4 -126 -6 -127C2 -130 8 -136 10 -146Z', C.cyD, ' opacity="0.5"'),
    p('M-9 -144C-8 -149 -4 -151 1 -151C-3 -149 -6 -146 -7 -141Z', W),
    `<circle cx="5" cy="-148" r="1.6" fill="${W}"/>`,
  ], 2.5),
  part('bâton : hampe', F.shaft, C.wo, [
    p('M1 -120C2 -80 2 -40 1.5 0C1.5 30 1.5 50 1 70L8 70L8 -120Z', C.woS),
    s('M-3 -108C-3.5 -96 -4.5 -84 -4.5 -74M-3 -50C-3 -30 -3 -10 -2.6 10', C.woL, 1.8),
    s('M-6.5 -72C-4 -70 -2 -68 -1 -64M2 -30C3 -26 3 -22 2 -18M2 30C3 34 3 38 2 42', C.woD, 1.4),
  ], 3),
  part('bâton : embout', F.ferrule, 'url(#ma-gold)', [p('M-6 63L6 63L6 72L-6 72Z', C.auS)], 2.5),
  part('bâton : griffe gauche', F.clawL, C.wo, [p('M-12 -128C-12 -140 -14 -148 -10 -156L-22 -156L-22 -128Z', C.woL), p('M-6 -116C-3 -118 -1 -120 0 -120L-10 -132C-10 -126 -8 -120 -6 -116Z', C.woS)], 2.5),
  part('bâton : griffe droite', F.clawR, C.wo, [p('M8 -116C14 -122 18 -132 18 -142L24 -142L24 -114Z', C.woS), s('M10 -134C9 -142 10 -148 12 -152', C.woL, 1.6)], 2.5),
  part('bâton : bague dorée', F.ring, 'url(#ma-gold)', [p('M1 -118L10 -118L10 -100L1 -100Z', C.auS), s('M-5 -112C-2 -113 1 -113 3 -113', C.auH, 1.4)], 2.5),
  `<!-- bâton : étincelles magiques -->
${spark(-24, -158, 4.5)}${spark(22, -114, 3.4)}${spark(24, -162, 2.6, C.cy)}<circle cx="-22" cy="-124" r="1.6" fill="${W}"/><circle cx="14" cy="-172" r="1.4" fill="${C.cy}"/>`,
  part('main d\'arme : poing', F.fistB, C.skin, [p('M4 -14C8 -6 8 4 4 14L14 14L14 -14Z', C.skinS), s('M-7 2C-5 6 -1 8 3 8', C.skinL, 2)], 3),
  s('M4.5 -2.5C7 -2.5 9 -2 11 -1M4.5 4C7 4 9 4.5 10.5 5.5', O, 1.8),
  part('main d\'arme : pouce', F.thumbB, C.skin, [p('M-10 -7C-4 -5 2 -6 6 -9L6 -4L-10 -4Z', C.skinS), s('M-6 -10.5C-3 -11.5 0 -11.5 2 -10.5', C.skinL, 1.5)], 2),
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">
<!-- Fuze Arena : MAGE (préfixe ma-). Même style que art/guerrier.svg.
     Chibi cartoon, lumière en haut à gauche, contour #1b1530.
     Ordre : ombre au sol > corps > tête > arme. Chaque groupe commence par sa « doublure »
     (mêmes formes en trait 7 = contour extérieur épais), puis les pièces (aplat + ombres découpées + contour 3). -->
<defs>
<linearGradient id="ma-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.auH}"/><stop offset="0.45" stop-color="${C.au}"/><stop offset="1" stop-color="#d98a16"/></linearGradient>
<linearGradient id="ma-iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1660"/><stop offset="0.55" stop-color="#7b52e0"/><stop offset="1" stop-color="#d6c2ff"/></linearGradient>
<radialGradient id="ma-orb" cx="0.38" cy="0.36" r="0.68"><stop offset="0" stop-color="#f0ffff"/><stop offset="0.3" stop-color="${C.cy}"/><stop offset="0.75" stop-color="${C.cyS}"/><stop offset="1" stop-color="${C.cyD}"/></radialGradient>
<radialGradient id="ma-lueur"><stop offset="0" stop-color="#e8ffff" stop-opacity="0.9"/><stop offset="0.45" stop-color="${C.cy}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.cy}" stop-opacity="0"/></radialGradient>
<clipPath id="ma-eye1"><path d="M114 121C119 118 130 118 136 121C137 126 136 130 133 133C129 136 120 136 117 133C114 130 113 125 114 121Z"/></clipPath>
<clipPath id="ma-eye2"><path d="M150 121C153 118 160 118 164 120C165 125 164 130 162 133C160 136 153 136 151 133C149 129 149 124 150 121Z"/></clipPath>
@@CLIPS@@
</defs>
<g stroke-linejoin="round" stroke-linecap="round">
<!-- ===== OMBRE AU SOL ===== -->
<ellipse cx="138" cy="291" rx="72" ry="9" fill="${O}" opacity="0.25"/>
<ellipse cx="138" cy="291" rx="56" ry="6.5" fill="${O}" opacity="0.35"/>
<!-- ===== CHEVEUX ARRIÈRE ===== (même rotation que la tête : à animer avec elle) -->
<g transform="rotate(3 128 152)">
${back([F.hair])}
${hairBack.join('\n')}
</g>
<!-- ===== CORPS ===== -->
<g>
${back([F.sleeveB, F.forearmB, F.lining, F.shoeB, F.shoeA, F.robe, F.belt, F.sleeveA, F.handA, F.thumbA])}
${body.join('\n')}
</g>
<!-- ===== TÊTE ===== (pivot du cou : 128,152) -->
<g transform="rotate(3 128 152)">
${back([F.ear, F.face, F.beard, F.must, F.brim, F.cone])}
${head.join('\n')}
</g>
<!-- ===== ARME : bâton à orbe (le poing fait partie du groupe) ===== -->
<!-- pivot arme : 190,198 -->
<g transform="translate(190 198) rotate(6)">
${weapon.join('\n')}
</g>
</g>
</svg>
`.replace('@@CLIPS@@', () => defsClips.join('\n'));
const out = path.join(__dirname, '..', 'art', 'mage.svg');
fs.writeFileSync(out, svg);
console.log('écrit', out, (Buffer.byteLength(svg) / 1024).toFixed(1) + ' Ko');
