// Générateur du DÉMON DES ABYSSES (boss) : écrit art/monstre-demon.svg (préfixe md-), tourné vers la GAUCHE.
const path = require('path');
const L = require('./mo-lib.cjs')('md');
const { O, W, part, clip, grad, back, p, s, spark, gem, starD } = L;
const C = {
  // peau rouge
  rdL: '#ff7a5c', rd: '#e0413a', rdS: '#a82235', rdD: '#6b1230',
  // ailes violettes sombres
  wiL: '#7d47b8', wi: '#5a2a86', wiS: '#3c1a62', wiD: '#26103f',
  // cornes ivoire
  hoL: '#fffaf0', ho: '#ecd9b4', hoS: '#bf9f74', hoD: '#8c6a48',
  // or
  au: '#f7bc2a', auL: '#ffe168', auS: '#cd7e15', auH: '#fff7c4', auD: '#8f4c0a',
  // tissu sombre (pagne), cuir
  cl: '#3f2d55', clL: '#6a5288', clS: '#271a38',
  le: '#94593a', leL: '#c58a58', leS: '#6a3a24', leD: '#45230f',
  // feu
  fiR: '#ff5a24', fiO: '#ff9a1f', fiY: '#ffd23a', fiC: '#fff7c4',
  mouth: '#4e1222', claw: '#f6efdc',
};
grad(`<linearGradient id="md-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.auH}"/><stop offset="0.45" stop-color="${C.au}"/><stop offset="1" stop-color="#d98a16"/></linearGradient>`);
grad(`<linearGradient id="md-horn" x1="0" y1="1" x2="0.4" y2="0"><stop offset="0" stop-color="${C.hoS}"/><stop offset="0.5" stop-color="${C.ho}"/><stop offset="1" stop-color="${C.hoL}"/></linearGradient>`);
grad(`<radialGradient id="md-eye" cx="0.45" cy="0.55" r="0.6"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#fff3a0"/><stop offset="0.75" stop-color="#ffd23a"/><stop offset="1" stop-color="#f79a1a"/></radialGradient>`);
// lueur du feu : dégradé radial qui s'éteint vers le bord (au lieu de disques plats qui salissent le fond sombre)
grad(`<radialGradient id="md-lueur"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ffb43a" stop-opacity="0.45"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>`);
grad(`<radialGradient id="md-fire" cx="0.5" cy="0.7" r="0.6"><stop offset="0" stop-color="${C.fiC}"/><stop offset="0.35" stop-color="${C.fiY}"/><stop offset="0.75" stop-color="${C.fiO}"/><stop offset="1" stop-color="${C.fiR}"/></radialGradient>`);

// main lointaine : 0,9 × autour de sa base (0,16) puis descendue de 3 (la flamme respire), en repère local du feu ;
// les épaisseurs de trait ne changent pas
const HK = 0.9, HO = [0, 16], HT = [0, 3];
const S = d => { let i = 0; return d.replace(/-?\d*\.?\d+/g, n => { const k = i++ % 2; return +(HO[k] + (+n - HO[k]) * HK + HT[k]).toFixed(2); }); };
const SH = frag => frag.replace(/ d="([^"]+)"/g, (m, d) => ` d="${S(d)}"`);
const F = {
  // ----- ailes -----
  wingFar: 'M112 180C100 134 82 88 54 44C34 54 18 70 6 92C28 106 30 130 12 150C36 148 50 166 40 192C62 178 78 188 84 208C94 196 104 188 112 180Z',
  wingNear: 'M192 180C204 132 228 82 262 40C282 50 300 64 314 84C292 98 288 124 308 148C284 146 270 166 280 196C258 180 242 190 236 214C224 200 208 190 192 180Z',
  // ----- corps -----
  tail: 'M196 262C224 274 252 272 268 258C276 252 282 246 285 238L295 240C292 252 286 262 276 270C258 286 224 288 194 278Z',
  tailTip: 'M274 246C274 232 282 214 296 192C303 212 309 230 305 246C299 242 293 240 290 240C287 242 281 244 274 246Z',
  armFarUp: 'M90 188C98 176 118 178 120 194C118 210 108 220 96 226L76 216C78 204 82 196 90 188Z',
  armFarLow: 'M74 220C68 208 62 198 58 188L80 180C84 192 90 204 96 216C92 226 80 228 74 220Z',
  legFar: 'M118 262C116 280 116 298 120 314L146 314C148 298 150 280 152 262Z',
  footFar: 'M100 321C100 312 110 306 124 306C138 306 148 310 150 318C152 326 150 331 144 332L104 332C98 330 98 326 100 321Z',
  legNear: 'M162 262C160 280 160 298 164 314L194 314C198 298 200 280 200 262Z',
  footNear: 'M148 321C148 312 158 306 172 306C188 306 198 310 200 318C202 326 200 331 194 332L152 332C146 330 146 326 148 321Z',
  torso: 'M92 188C102 170 128 164 152 164C180 164 210 170 222 188C228 206 220 228 208 244C206 250 206 256 206 262L114 262C114 256 112 250 110 244C96 228 88 208 92 188Z',
  belt: 'M106 244C130 253 182 253 210 242L212 261C182 271 130 271 108 263Z',
  buckle: 'M140 245C147 245 152 250 152 257C152 264 147 269 140 269C133 269 128 264 128 257C128 250 133 245 140 245Z',
  loin: 'M116 262L166 262C167 272 168 280 170 290L161 285L153 294L145 285L137 294L129 285L118 290C117 280 116 272 116 262Z',
  collar: 'M110 170C130 181 172 181 198 168L200 179C174 194 128 194 108 181Z',
  armNearUp: 'M198 184C208 172 236 174 242 194C246 210 242 224 236 234L210 234C206 220 202 204 198 184Z',
  armNearUpLine: 'M214 175C228 174 239 182 242 194C246 210 242 224 236 234M210 234C207 222 204 210 202 198',
  pauldron: 'M194 190C194 172 210 162 230 162C246 162 256 174 254 188C252 196 246 202 238 204C222 200 206 200 194 190Z',
  spike1: 'M204 172L196 154L214 166Z',
  spike2: 'M220 165L226 138L236 164Z',
  spike3: 'M242 168L260 156L252 180Z',
  armNearLow: 'M208 230C218 224 236 226 242 234C248 246 250 258 250 268L220 270C218 258 214 244 208 230Z',
  bracerNear: 'M214 244C224 239 240 239 247 245L250 264C240 260 226 260 218 264Z',
  handNear: 'M214 270C220 262 246 262 254 270C260 278 258 290 252 296L222 298C214 290 210 280 214 270Z',
  // ----- tête -----
  hornFar: 'M120 74C112 58 100 46 86 38C78 34 72 28 70 16C60 28 62 46 74 58C84 68 96 76 104 86Z',
  hornNear: 'M176 74C186 56 200 44 214 36C222 32 228 24 230 12C242 26 240 44 228 56C218 66 208 76 198 86Z',
  ear: 'M198 112C212 106 228 98 246 90C240 108 226 126 204 134Z',
  head: 'M98 112C98 84 120 64 150 62C182 60 206 80 208 108C209 124 206 138 198 150C190 162 176 170 160 176C150 180 141 184 133 186C123 181 111 172 104 162C98 150 98 130 98 112Z',
  goatee: 'M124 178C128 188 133 196 139 204C141 196 143 188 144 180C138 183 131 182 124 178Z',
  eyeN: 'M148 126L184 110C186 122 180 132 168 134C158 135 150 132 148 126Z',
  eyeF: 'M108 111L134 126C132 133 125 135 120 133C114 130 109 123 108 111Z',
  mouth: 'M108 150C124 159 152 159 174 146C171 161 158 170 140 170C124 170 112 163 108 150Z',
  // ----- feu (boule de feu : repère local, centre de la main en 0,0) -----
  fireball: 'M0 -2C-14 -2 -22 -12 -20 -24C-18 -34 -10 -38 -8 -48C-2 -42 0 -36 -1 -30C4 -38 6 -48 2 -60C14 -52 22 -40 20 -26C24 -30 25 -36 24 -40C30 -30 28 -14 20 -8C14 -4 8 -2 0 -2Z',
  // main lointaine (dans le groupe du feu, repère local : 0,0 = 62,176) : paume derrière la flamme, doigts recourbés devant
  palmFar: S('M-18 10C-20 2 -12 -4 -2 -4C8 -4 18 0 20 8C22 16 16 22 6 22C-6 22 -16 18 -18 10Z'),
  fingersFar: S('M-16 16C-23 10 -26 0 -25 -8C-24 -15 -16 -17 -14.5 -11C-13.5 -7 -12 -4 -10 -3C-9 -9 1 -10 2.5 -4C4 -6 5.5 -9 7 -11C9 -16 18 -16 18.5 -9C19 0 18 10 13 16C4 19 -8 19 -16 16Z'),
  fireCore: 'M0 -8C-8 -8 -12 -14 -10 -21C-8 -27 -3 -29 -2 -34C2 -30 3 -26 2 -22C6 -26 7 -31 6 -36C12 -30 14 -22 12 -16C10 -11 6 -8 0 -8Z',
};
const flame = (x, y, k) => { // petite flamme posée en (x,y), taille k
  const t = (a, b) => `${+(x + a * k).toFixed(1)} ${+(y + b * k).toFixed(1)}`;
  return `M${t(0, 0)}C${t(-8, 0)} ${t(-11, -6)} ${t(-9, -12)}C${t(-7, -17)} ${t(-3, -18)} ${t(-2, -24)}C${t(2, -20)} ${t(3, -16)} ${t(2, -13)}C${t(5, -16)} ${t(6, -20)} ${t(5, -24)}C${t(11, -18)} ${t(12, -8)} ${t(7, -3)}C${t(5, -1)} ${t(3, 0)} ${t(0, 0)}Z`;
};
const flameCore = (x, y, k) => {
  const t = (a, b) => `${+(x + a * k).toFixed(1)} ${+(y + b * k).toFixed(1)}`;
  return `M${t(0, -2)}C${t(-4, -2)} ${t(-5, -6)} ${t(-4, -9)}C${t(-3, -12)} ${t(-1, -13)} ${t(-1, -16)}C${t(2, -13)} ${t(3, -10)} ${t(3, -8)}C${t(5, -9)} ${t(5, -12)} ${t(5, -13)}C${t(7, -9)} ${t(6, -5)} ${t(4, -3)}C${t(3, -2)} ${t(1, -2)} ${t(0, -2)}Z`;
};
const glow = (x, y, r) => `<circle cx="${+x.toFixed(1)}" cy="${+y.toFixed(1)}" r="${+r.toFixed(1)}" fill="url(#md-lueur)"/>`;
const groundGlow = (x, y, k) => { const cx = x + 1 * k, cy = y - 12 * k; return glow(cx, cy, Math.min(GLOW_K * 24 * k, 339 - cy, 319 - cx, cx - 1)); };
const groundFlame = (x, y, k) => `<!-- petite flamme -->\n${groundGlow(x, y, k)}<path d="${flame(x, y, k)}" fill="url(#md-fire)" stroke="${O}" stroke-width="2.4"/><path d="${flameCore(x, y, k)}" fill="${C.fiC}"/>`;
const clawsDown = (pts) => pts.map(([x, y]) => `<path d="M${x - 3.5} ${y}C${x - 3} ${y + 6} ${x - 5} ${y + 10} ${x - 8} ${y + 13}C${x} ${y + 11} ${x + 4} ${y + 6} ${x + 3.5} ${y}C${x + 3} ${y - 2.5} ${x - 3} ${y - 2.5} ${x - 3.5} ${y}Z" fill="${C.claw}" stroke="${O}" stroke-width="1.6"/>`).join('');
const clawsLeft = (pts) => pts.map(([x, y]) => `<path d="M${x + 2} ${y - 3.5}C${x - 3} ${y - 3.5} ${x - 7} ${y - 1} ${x - 10} ${y + 3}C${x - 4} ${y + 3.5} ${x} ${y + 2.5} ${x + 2} ${y + 1}C${x + 4} ${y} ${x + 4} ${y - 3} ${x + 2} ${y - 3.5}Z" fill="${C.claw}" stroke="${O}" stroke-width="1.6"/>`).join('');
const GLOW_K = 1.3; // rayon de la lueur = GLOW_K × hauteur de la flamme (24k)
const clawsUp = (pts, fill = '#f3e6c8') => pts.map(([x, y, dx]) => `<path d="M${x - 3} ${y}C${x - 3} ${y - 5} ${+(x - 2 + dx * 0.4).toFixed(1)} ${y - 9} ${x + dx} ${y - 12}C${+(x + 3 + dx * 0.2).toFixed(1)} ${y - 8} ${x + 3.5} ${y - 4} ${x + 3} ${y}C${x + 2} ${y + 2.5} ${x - 2} ${y + 2.5} ${x - 3} ${y}Z" fill="${fill}" stroke="${O}" stroke-width="1.6"/>`).join('');
const bone = (d, w = 1) => s(d, O, 8 * w) + s(d, C.rdD, 4.4 * w) + s(d, '#b8324a', 1.4 * w);

const wings = [
  part('aile lointaine : membrane', F.wingFar, C.wiS, [
    p('M60 40C80 80 100 130 116 180L130 180L130 30Z', C.wi),
    p('M6 92C28 106 30 130 12 150L22 150C34 128 30 106 16 86Z', C.wiD),
    p('M12 150C36 148 50 166 40 192L46 186C52 166 42 150 26 144Z', C.wiD),
    p('M40 192C62 178 78 188 84 208L88 200C80 184 62 176 50 180Z', C.wiD),
    s('M54 44C40 64 30 96 26 128M54 44C52 84 56 130 62 160', C.wiD, 1.6),
  ]),
  bone('M108 176C94 130 78 88 54 44', 1.15) + bone('M54 44C38 58 20 74 6 92', 0.8) + bone('M54 44C26 80 14 116 12 150', 0.8) + bone('M54 44C38 96 34 146 40 192', 0.8) + bone('M54 44C68 102 78 158 84 208', 0.8),
  `<path d="M58 46C54 38 54 30 60 24C62 32 66 38 68 44Z" fill="${C.claw}" stroke="${O}" stroke-width="2"/>`,
  part('aile proche : membrane', F.wingNear, C.wi, [
    p('M262 40C244 70 220 120 200 176L188 176L188 30Z', C.wiL),
    // chaque panneau : plus sombre près du bord festonné
    p('M314 84C292 98 288 124 308 148L290 146C282 124 290 100 300 74Z', C.wiS),
    p('M308 148C284 146 270 166 280 196L272 186C266 166 276 148 290 140Z', C.wiS),
    p('M280 196C258 180 242 190 236 214L234 204C240 186 258 176 272 180Z', C.wiS),
    p('M308 148C292 150 282 162 280 178L320 178L320 140Z', C.wiD),
    s('M262 40C276 76 286 112 290 140M262 40C266 92 266 140 262 176', C.wiS, 1.6),
    s('M232 98C240 78 250 62 260 50', '#a070dc', 2),
  ]),
  bone('M196 176C214 130 236 84 262 40', 1.2) + bone('M262 40C282 52 300 66 314 84', 0.9) + bone('M262 40C290 74 304 110 308 148', 0.9) + bone('M262 40C278 98 284 148 280 196', 0.9) + bone('M262 40C246 104 238 162 236 214', 0.9),
  `<path d="M258 42C254 34 254 26 260 18C262 26 266 32 270 38Z" fill="${C.claw}" stroke="${O}" stroke-width="2"/>`,
];

const body = [
  part('queue', F.tail, C.rd, [p('M196 272C226 282 258 276 276 258L300 260L300 300L190 300Z', C.rdS), s('M204 266C226 272 248 270 262 260', C.rdL, 2)]),
  part('queue : pointe en flèche', F.tailTip, C.rd, [p('M298 196C302 212 302 226 294 240L310 240L310 196Z', C.rdS), s('M280 230C280 220 286 210 294 202', C.rdL, 2)]),
  part('bras lointain : haut', F.armFarUp, C.rdS, [p('M104 208C100 218 92 224 84 226L120 230L120 200Z', C.rdD), s('M90 194C96 186 104 184 110 186', C.rd, 2.2)]),
  part('bras lointain : avant-bras', F.armFarLow, C.rd, [p('M78 180C82 194 88 206 96 216L100 230L84 230C80 214 76 198 70 186Z', C.rdS), s('M62 192C66 202 70 210 74 216', C.rdL, 2)]),
  `<!-- bras lointain : bracelet d'or -->
<path d="M62 202L82 194L86 204L66 212Z" fill="url(#md-gold)" stroke="${O}" stroke-width="2.4"/><path d="M76 204L84 201L86 204L78 208Z" fill="${C.auS}"/>`,
  part('jambe lointaine', F.legFar, C.rd, [p('M140 262C144 280 144 298 142 316L152 316L152 262Z', C.rdS), s('M122 274C121 286 121 298 123 308', C.rdL, 2)]),
  part('jambe lointaine : pied griffu', F.footFar, C.rd, [p('M130 306C140 312 148 318 150 332L156 332L156 306Z', C.rdS), p('M96 328L156 328L156 336L96 336Z', C.rdD), s('M112 320L114 330M122 319L124 330', O, 1.8), s('M104 316C106 311 112 309 118 309', C.rdL, 2)]),
  `<!-- jambe lointaine : anneau d'or -->
<path d="M116 300C126 304 140 304 150 300L150 312C140 316 126 316 116 312Z" fill="url(#md-gold)" stroke="${O}" stroke-width="2.4"/><path d="M138 302L150 300L150 312L138 314Z" fill="${C.auS}"/>`,
  clawsLeft([[104, 326], [112, 329]]),
  part('jambe proche', F.legNear, C.rd, [p('M184 262C190 280 190 298 188 316L202 316L202 262Z', C.rdS), s('M166 274C165 286 165 298 167 308', C.rdL, 2)]),
  part('jambe proche : pied griffu', F.footNear, C.rd, [p('M180 306C190 312 198 318 200 332L206 332L206 306Z', C.rdS), p('M144 328L206 328L206 336L144 336Z', C.rdD), s('M160 320L162 330M170 319L172 330', O, 1.8), s('M152 316C154 311 160 309 166 309', C.rdL, 2)]),
  `<!-- jambe proche : anneau d'or -->
<path d="M160 300C172 304 186 304 198 300L198 312C186 316 172 316 160 312Z" fill="url(#md-gold)" stroke="${O}" stroke-width="2.4"/><path d="M184 302L198 300L198 312L184 314Z" fill="${C.auS}"/>`,
  clawsLeft([[152, 326], [160, 329]]),
  part('torse', F.torso, C.rd, [
    p('M188 166C210 184 216 214 202 244C200 250 200 256 200 264L230 264L230 166Z', C.rdS),  // ombre propre côté droit
    p('M214 190C218 210 212 228 204 240L230 240L230 190Z', C.rdD),
    p('M112 168L196 168L196 178C172 194 130 194 112 182Z', C.rdS),                         // ombre portée sous le collier
    p('M100 198C100 186 110 178 122 178C112 184 106 194 106 206Z', C.rdL),                 // reflet du pectoral
    s('M114 206C124 214 138 214 146 206M148 206C158 214 174 214 184 204', C.rdD, 2.4),     // pectoraux
    s('M146 214L145 244', C.rdD, 2), s('M128 224C134 226 140 226 144 224M150 224C156 226 162 226 168 223M130 236C135 238 140 238 144 236M150 236C156 238 162 238 166 235', C.rdD, 2), // abdos
    s('M100 206C100 220 104 232 112 244', C.rdL, 2.4),
  ]),
  part('pagne', F.loin, C.cl, [p('M150 262L180 262L180 300L158 300C157 284 153 272 150 262Z', C.clS), p('M118 268C118 276 118 282 119 288L123 288C122 282 122 276 122 268Z', C.clL), s('M118 286L129 283L137 292L145 283L153 292L161 283L169 288', C.au, 2.2)]),
  part('ceinture', F.belt, C.le, [p('M106 255C130 263 182 263 212 252L212 272L106 272Z', C.leS), s('M110 249C132 256 180 256 206 246', C.leL, 1.8)]),
  part('boucle', F.buckle, 'url(#md-gold)', [p('M126 258C132 266 146 268 154 260L154 272L126 272Z', C.auS), s('M132 251C135 248 138 247 141 247', C.auH, 1.6)], 2.5),
  gem(140, 257, 4.6, '#e3343d', 2),
  part('collier d\'or', F.collar, 'url(#md-gold)', [p('M170 170L204 166L204 196L166 196Z', C.auS), s('M116 176C132 184 160 185 180 180', C.auH, 1.6)]),
  gem(154, 185, 4, '#8a4fe0', 1.8),
  part('bras proche : haut', F.armNearUp, C.rd, [p('M232 182C242 198 240 220 232 236L250 236L250 180Z', C.rdS), p('M206 192C208 184 216 178 226 178C216 184 210 192 210 200Z', C.rdL), s('M206 210C214 218 222 222 232 220', C.rdD, 2)], 3, O, F.armNearUpLine),
  part('épaulière : pointe arrière', F.spike3, 'url(#md-horn)', [p('M260 156L252 180L248 172Z', C.hoS)], 2.5),
  part('épaulière : grande pointe', F.spike2, 'url(#md-horn)', [p('M226 138L236 164L229 165Z', C.hoS), s('M222 160L224.5 147', C.hoL, 1.6)], 2.5),
  part('épaulière : pointe avant', F.spike1, 'url(#md-horn)', [p('M196 154L214 166L207 169Z', C.hoS)], 2.5),
  part('épaulière de fer sombre', F.pauldron, '#4a4560', [
    p('M246 166C256 176 256 190 246 200L262 204L262 160Z', '#2e2a40'),
    p('M196 186C210 196 232 198 252 186L256 210L190 210Z', '#2e2a40'),
    p('M200 184C200 172 210 166 222 165C212 170 206 176 205 186Z', '#9a94b4'),
    `<circle cx="226" cy="168" r="1.8" fill="${W}"/>`,
    s('M197 190C210 199 232 201 251 191', C.au, 5),
    s('M197 190C210 199 232 201 251 191', C.auS, 1.6),
  ]),
  part('bras proche : avant-bras', F.armNearLow, C.rd, [p('M236 228C244 240 248 254 248 270L256 270L256 228Z', C.rdS)]),
  part('bras proche : bracelet d\'or', F.bracerNear, 'url(#md-gold)', [p('M238 240L252 240L252 266L236 262Z', C.auS), s('M218 246C226 243 234 242 240 243', C.auH, 1.6)], 2.5),
  `<!-- bras proche : pointes du bracelet -->
<path d="M248 248L258 246L250 256Z" fill="url(#md-gold)" stroke="${O}" stroke-width="2"/><path d="M246 236L254 232L250 242Z" fill="url(#md-gold)" stroke="${O}" stroke-width="2"/>`,
  part('main proche (griffue)', F.handNear, C.rd, [p('M242 264C254 272 256 288 250 298L262 298L262 264Z', C.rdS), s('M218 274C220 270 226 267 232 267', C.rdL, 2)]),
  s('M226 286L227 296M236 286L237 297M245 284L246 295', O, 1.8),
  clawsDown([[224, 296], [234, 297], [244, 296]]),
];

const head = [
  part('corne lointaine', F.hornFar, 'url(#md-horn)', [
    p('M104 86C90 76 78 64 70 52L58 52L58 92Z', C.hoS),
    s('M110 64C104 66 98 70 94 76M96 50C90 54 84 58 80 64M82 38C78 42 74 46 72 52', C.hoD, 2),
    s('M78 30C80 38 86 44 94 48', C.hoL, 2),
  ]),
  part('corne proche', F.hornNear, 'url(#md-horn)', [
    p('M228 56C220 66 208 78 198 86L240 86L240 40Z', C.hoS),
    s('M186 64C192 66 198 70 202 76M200 50C206 54 212 58 216 64M216 38C220 42 224 46 226 52', C.hoD, 2),
    s('M196 50C204 42 214 36 222 30', C.hoL, 2.2),
    spark(214, 40, 6),
  ]),
  part('oreille pointue', F.ear, C.rd, [p('M206 118C218 112 232 104 240 98C234 110 222 122 208 128Z', C.rdS), p('M200 124C214 128 226 122 240 102L250 102L250 140L200 140Z', C.rdD), s('M204 112C216 106 228 100 240 94', C.rdL, 2)]),
  `<!-- boucle d'oreille -->
<circle cx="214" cy="133" r="5.5" fill="none" stroke="${O}" stroke-width="5"/><circle cx="214" cy="133" r="5.5" fill="none" stroke="${C.au}" stroke-width="2.4"/>`,
  part('tête', F.head, C.rd, [
    p('M190 66C204 88 202 128 156 180L214 190L214 60Z', C.rdS),                            // ombre de la joue lointaine / mâchoire
    p('M206 104C206 136 190 162 160 180L214 190L214 104Z', C.rdD),
    p('M96 166C108 176 120 182 134 188L134 192L96 192Z', C.rdS),
    // petite pointe sombre au milieu du front (marque de démon) : casse la boule sans mettre le crâne à l'ombre
    p('M131 86C139 85 146 90 151 100C155 91 162 86 171 86C164 81 157 79 151 79C145 79 137 81 131 86Z', C.rdS),
    p('M104 96C106 80 118 68 136 64C122 72 112 84 110 98Z', C.rdL), `<circle cx="129" cy="73" r="2.2" fill="${C.rdL}"/>`,   // reflet en virgule du dôme + point
    s('M110 140C114 146 120 150 126 152', C.rdS, 2),                                       // pommette
  ]),

  `<!-- yeux : lueur (sans contour) -->
<ellipse cx="166" cy="122" rx="26" ry="16" transform="rotate(-22 166 122)" fill="#ffd84a" opacity="0.16"/><ellipse cx="166" cy="122" rx="20" ry="11" transform="rotate(-22 166 122)" fill="#ffd84a" opacity="0.24"/>
<ellipse cx="121" cy="122" rx="18" ry="12" transform="rotate(30 121 122)" fill="#ffd84a" opacity="0.16"/><ellipse cx="121" cy="122" rx="14" ry="8.5" transform="rotate(30 121 122)" fill="#ffd84a" opacity="0.24"/>
<!-- oeil proche -->
<path d="${F.eyeN}" fill="url(#md-eye)" stroke="${O}" stroke-width="2.2"/>
<path d="M145 129C157 123 171 116 187 109" fill="none" stroke="${O}" stroke-width="3.8"/>
<!-- oeil lointain -->
<path d="${F.eyeF}" fill="url(#md-eye)" stroke="${O}" stroke-width="2"/>
<path d="M106 109C115 114 124 119 137 128" fill="none" stroke="${O}" stroke-width="3.4"/>
<!-- arcades sourcilières froncées -->
<path d="M144 120C154 104 174 96 194 96L195 104C178 105 164 111 151 125Z" fill="${C.rdD}" stroke="${O}" stroke-width="1.8"/>
<path d="M139 119C131 109 120 104 106 103L106 110C117 110 126 114 133 123Z" fill="${C.rdD}" stroke="${O}" stroke-width="1.8"/>
<!-- nez -->
<path d="M133 137C129.5 140 129.5 143.5 134 144.5" fill="none" stroke="${C.rdD}" stroke-width="2.2"/>
<!-- bouche : rictus plein de crocs -->
<path d="${F.mouth}" fill="${C.mouth}"/>
<g clip-path="${clip('bouche', F.mouth)}">
<ellipse cx="142" cy="170" rx="18" ry="6" fill="#c8455a"/>
<path d="M104 146C124 156 152 156 176 143L170 152L165 157L160 152L154 160L148 154L142 161L136 155L129 160L124 154L117 157L113 152Z" fill="${W}"/>
<path d="M120 172L125 160L130 172Z M150 171L155 159L160 171Z" fill="${W}" stroke="${O}" stroke-width="1.4"/>
</g>
<path d="${F.mouth}" fill="none" stroke="${O}" stroke-width="2.4"/>
<path d="M108 149L103 143M172 146L177 140" fill="none" stroke="${O}" stroke-width="2.4"/>`,
];

const fire = [
  `<!-- boule de feu : lueur (sans contour) -->
${glow(0, -28, 36)}`,
  back([F.palmFar, F.fingersFar]),
  part('main lointaine : paume', F.palmFar, C.rd, [p('M2 22C12 20 20 14 22 6L24 24L0 24Z', C.rdS), p('M-20 12C-12 20 4 22 14 20L14 24L-20 24Z', C.rdS)].map(SH)),
  `<!-- boule de feu -->\n<path d="${F.fireball}" fill="url(#md-fire)" stroke="${O}" stroke-width="3"/>`,
  `<path d="${F.fireCore}" fill="${C.fiC}"/>`,
  part('main lointaine : doigts recourbés (devant le feu)', F.fingersFar, C.rd, [
    p('M6 -18C10 -8 10 6 6 18L22 18L22 -18Z', C.rdS),                      // doigt de droite (le plus loin) à l'ombre
    p('M-26 9C-12 14 4 14 20 7L20 20L-26 20Z', C.rdS),                     // pli des phalanges, en bas
    s('M-22.5 -3C-22.5 -9 -20.5 -12.5 -17.5 -13M-7 -4.5C-6 -7 -4.5 -8 -2.5 -8M9.5 -10.5C10.5 -13 12.5 -14 14.5 -13.5', C.rdL, 2), // bouts éclairés par le feu
  ].map(SH), 2.5),
  SH(s('M-10 -3C-10 1 -9.8 4.5 -9.3 8M5.5 -7.5C5.2 -2.5 5 1.5 4.8 5.5', O, 1.8)),                       // doigts séparés en haut, fondus dans la paume en bas
  SH(s('M-21 6C-17 8.5 -13 9 -10 8.5M-6.5 9C-3 10 1 9.5 4 8M8 7.5C10.5 7 13 5.5 15 3.5', C.rdD, 1.6)),   // plis des phalanges repliées
  SH(clawsUp([[-19.5, -13.5, 5], [-3, -7.5, 1.5], [13, -13, -5]])),
  spark(-16, -46, 4, C.auL) + spark(22, -50, 3, C.fiC) + `<circle cx="-27" cy="-31" r="2" fill="${C.fiY}"/><circle cx="26" cy="-20" r="1.6" fill="${C.fiY}"/>`,
];

const svgHead = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340">
<!-- Fuze Arena : BOSS DÉMON DES ABYSSES (préfixe md-), tourné vers la gauche. Même style que art/guerrier.svg :
     contour #1b1530, doublure trait 7, pièces = aplat + ombres découpées + contour 3, lumière en haut à gauche.
     Seules les lueurs (yeux, feu) sont sans contour, comme l'orbe du mage. -->
<defs>
@@DEFS@@
</defs>
`;
const out = `<g stroke-linejoin="round" stroke-linecap="round">
<!-- ===== OMBRE AU SOL ===== -->
<ellipse cx="156" cy="331" rx="96" ry="9" fill="${O}" opacity="0.25"/>
<ellipse cx="156" cy="331" rx="74" ry="6.5" fill="${O}" opacity="0.35"/>
<!-- ===== AILES ===== (pivot : 196,176 et 112,180) -->
<g>
${back([F.wingFar, F.wingNear])}
${wings.join('\n')}
</g>
<!-- ===== CORPS ===== -->
<g>
${back([F.tail, F.tailTip, F.armFarUp, F.armFarLow, F.legFar, F.footFar, F.legNear, F.footNear, F.torso, F.loin, F.belt, F.collar, F.armNearUp, F.spike1, F.spike2, F.spike3, F.pauldron, F.armNearLow, F.bracerNear, F.handNear])}
${body.join('\n')}
</g>
<!-- ===== TÊTE ===== (pivot du cou : 152,176) -->
<g>
${back([F.hornFar, F.hornNear, F.ear, F.head])}
${head.join('\n')}
</g>
<!-- ===== BOULE DE FEU + MAIN LOINTAINE ===== (la main qui tient le feu fait partie du groupe, comme le poing d'une arme) -->
<!-- pivot arme : 62,176 -->
<g transform="translate(62 176)">
${fire.join('\n')}
</g>
<!-- ===== PETITES FLAMMES AU SOL ===== -->
${groundFlame(78, 332, 1.1)}
${groundFlame(280, 332, 1.25)}
${groundFlame(304, 332, 0.75)}
${groundFlame(52, 332, 0.7)}
</g>
</svg>
`;
L.write(path.join(__dirname, '..', 'art', 'monstre-demon.svg'), svgHead, out);
