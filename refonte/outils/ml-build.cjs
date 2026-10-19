// Générateur du LOUP DES BOIS : écrit art/monstre-loup.svg (préfixe ml-), tourné vers la GAUCHE.
const path = require('path');
const L = require('./mo-lib.cjs')('ml');
const { O, W, part, clip, grad, back, p, s, spark, gem } = L;
const C = {
  // fourrure gris-bleu
  fuL: '#bccbf2', fu: '#8196cc', fuS: '#56679f', fuD: '#3a4479',
  // crème (museau, poitrail, ventre)
  crL: '#ffffff', cr: '#e6ecfa', crS: '#b0bcdc', crD: '#8592bb',
  ear: '#d48ea3', earS: '#a5607d',
  nose: '#2a2340', mouth: '#7a2433', mouthD: '#4e1222', gum: '#e06a78', tongue: '#e8706e',
  claw: '#f6f1e4',
};
grad(`<linearGradient id="ml-iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a3c00"/><stop offset="0.5" stop-color="#f7bc2a"/><stop offset="1" stop-color="#fff6a8"/></linearGradient>`);

const F = {
  // ----- corps -----
  tail: 'M214 100C209 82 213 62 223 46C229 36 231 26 229 14C241 16 250.5 28 253 42C254.8 54 251.5 64 248 70C252 76 252 86 246 93C238 101 226 104 214 100Z',
  // patte arrière lointaine en Z : jarret pointu vers (251,173), métatarse qui redescend vers l'avant
  hindFarLeg: 'M222 120C228 116 233 120 235 128C238 140 243 154 249 164C251.5 167.5 253.4 170 253.4 172.6C253.2 174.8 251.6 176 250 177C246.5 181 244.5 186 243.5 192L216 196C220 190 224 184 228 176C226 164 222 150 222 136Z',
  hindFarPaw: 'M214 199C214 191 222 187 230 187C240 187 248 191 250 199C250 206 248 211 242 212L216 212C212 210 212 205 214 199Z',
  // pattes avant inclinées vers l'avant, poignet marqué ~10 px au-dessus du pied
  frontFarLeg: 'M64 132C76 126 90 130 92 142C91 154 86 164 78 170C74.5 172.6 72.4 174.4 71.2 176.4C72.8 179.6 70.6 185 65 190L63 196L40 196C41 191 43 186 46 182C46 179 46 176.5 47 173.5C49 160 53 148 57 140C59 136 61 134 64 132Z',
  frontFarPaw: 'M28 200C28 192 36 187 45 187C55 187 62 191 64 199C64 206 60 211 54 212L30 212C26 210 26 205 28 200Z',
  torso: 'M108 104C110 84 120 66 132 58Q138 48 141 35Q148 45 153 52Q158 41 164 33Q168 45 172 52Q180 44 189 39Q188 52 190 62C204 64 218 72 228 86C236 100 236 120 230 134C224 150 210 158 196 162C176 168 152 168 134 164C120 160 110 150 106 136C104 124 104 114 108 104Z',
  ruff: 'M72 126C90 124 110 130 124 140C127 152 123 162 117 168L111 181L104 170L97 183L90 171L83 181L78 166C70 156 66 140 72 126Z',
  // cuisse en goutte : pointe (grasset) en bas-avant, bord bas qui remonte vers l'arrière
  haunch: 'M168 120C170 100 190 88 212 92C230 96 238 116 234 136C230 148 216 156 200 161C190 164 180 166 175 161C168 153 166 136 168 120Z',
  haunchLine: 'M186 97C172 106 166 124 168 140C169 152 172 160 178 163C186 166 194 163 202 160C214 156 222 151 228 146',
  // patte arrière proche en Z : tibia qui part vers l'arrière jusqu'au jarret pointu (231,175), métatarse vers l'avant
  hindNearLeg: 'M184 152C198 146 214 140 228 138C229 145 226 151 224.5 157C223.5 163 228 169 231.5 174C232.5 175.6 232 177.4 230.3 178.6C224.5 184 219.5 190 215.5 196L195 196C198 190 202 185 207 181C200 177 191 171 183 165C180 161 181 155 184 152Z',
  hindNearLegLine: 'M227 148.5C226 151.5 225 154.5 224.5 157C223.5 163 228 169 231.5 174C232.5 175.6 232 177.4 230.3 178.6C224.5 184 219.5 190 215.5 196M195 196C198 190 202 185 207 181C200 177 191 171 183 165',
  hindNearPaw: 'M176 200C176 192 184 187 195 187C206 187 214 191 216 199C216 206 214 211 208 212L178 212C174 210 174 205 176 200Z',
  frontNearLeg: 'M104 132C114 120 138 120 147 136C151 150 147 160 140 166C134 171 130.5 172.6 128.2 175C129.8 178.2 127.6 182 122.5 184.5L120 196L92 196C92 191 93 186 95 182C95.5 179 95.5 177 96.5 174C97.5 162 100 148 102.5 140C103 137 103.5 134.5 104 132Z',
  frontNearLegLine: 'M102.8 139C100 148 97.5 162 96.5 174C95.5 177 95.5 179 95 182C93 186 92 191 92 196M120 196L122.5 184.5C127.6 182 129.8 178.2 128.2 175C130.5 172.6 134 171 140 166C147 160 151 150 147 136',
  frontNearPaw: 'M82 200C82 191 91 186 103 186C115 186 124 191 126 199C126 206 123 211 117 212L84 212C80 210 80 205 82 200Z',
  // ----- tête -----
  earFar: 'M58 60C54 42 56 25 66 11C78 23 84 39 84 54Z',
  mouthIn: 'M15 106C36 108 58 113 80 119L82 128C62 130 44 134 27 137C18 129 14 117 15 106Z',
  jaw: 'M25 133C42 131 62 126 80 120C85 127 82 135 73 140C60 145 44 145 33 142C25 140 22 136 25 133Z',
  head: 'M14 98C20 92 32 88 44 86C42 70 50 54 68 46C88 36 116 40 130 56Q142 54 153 59Q143 64 139 72Q151 74 158 83Q148 86 141 92Q151 98 155 107Q145 108 135 110Q141 117 141 126Q128 126 116 128C104 128 92 124 80 120C66 114 50 110 36 110C24 110 12 106 14 98Z',
  earNear: 'M96 52C96 34 104 18 121 6C125 14 128 22 129 29L123 32L130 38C131 45 129 52 125 58Z',
  nose: 'M5 98C5 91 13 87 22 90C26 95 24 102 17 104C10 105 5 103 5 98Z',
  eyeN: 'M72 95L105 79C107 90 102 100 92 102C83 104 74 101 72 95Z',
  eyeF: 'M45 81L64 91C62 98 57 101 52 99C48 96 46 89 45 81Z',
};

const fur = (d, c = C.fuS, w = 2.2) => s(d, c, w);
// griffe courbe pointée vers la gauche, base en (x,y)
const claws = (pts) => pts.map(([x, y]) => `<path d="M${x + 2} ${y - 3}C${x - 2} ${y - 3} ${x - 5} ${y - 1} ${x - 7} ${y + 3}C${x - 3} ${y + 3} ${x} ${y + 2} ${x + 2} ${y}C${x + 3.6} ${y - 0.6} ${x + 3.6} ${y - 2.4} ${x + 2} ${y - 3}Z" fill="${C.claw}" stroke="${O}" stroke-width="1.6"/>`).join('');
// orteils : traits de séparation
const toes = (xs, y) => s(xs.map(x => `M${x} ${y}L${x + 1} ${y + 7}`).join(''), O, 1.8);

// bord en mèches : suit la courbe quadratique a→c (contrôle b) et ajoute des pointes de fourrure
// côté « nx,ny » (normale), penchées vers l'arrière (droite) ; renvoie une suite de L pour fermer une forme
const r1 = v => +v.toFixed(1);
function tufts(a, b, c, n, depth, lean = 2.5, side = 1) {
  const q = t => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]];
  const out = [];
  for (let i = 0; i <= 2 * n; i++) {
    const t = i / (2 * n), [x, y] = q(t);
    if (i % 2 === 0) { out.push([x, y]); continue; }
    const dx = 2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), dy = 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1]);
    const l = Math.hypot(dx, dy), nx = side * dy / l, ny = -side * dx / l, d = depth * (0.75 + 0.5 * ((i * 7) % 5) / 4);
    out.push([x + nx * d + dx / l * lean, y + ny * d + dy / l * lean]);
  }
  return out.map(([x, y]) => `L${r1(x)} ${r1(y)}`).join('');
}

const body = [
  part('queue', F.tail, C.fu, [
    p('M244 30C252 44 252 58 246 70C250 80 248 90 242 96L262 100L262 30Z', C.fuS),                       // ombre côté droit
    p('M240 76L246 70L262 72L262 100L238 100L244 92L238 86Z', C.fuD),
    p('M222 8L262 8L262 50L254 46L248 38L242 42L238 32L231 36L228 28Z', C.cr),                             // bout de queue clair, bord en mèches
    p('M244 40L254 46L262 50L262 60L252 52Z', C.crS),
    p('M220 92C216 76 220 60 228 48C226 62 224 76 226 90Z', C.fuL),
    fur('M232 70Q236 62 240 58M236 86Q240 80 244 76', C.fuS, 2),
  ]),
  // patte arrière lointaine (dans l'ombre du corps) : tibia vers l'arrière, jarret, métatarse
  part('patte arrière lointaine', F.hindFarLeg, C.fuS, [
    p('M231 122C235 138 239 151 244 161C247 167 248 172 245 178C242 183 240 188 239 198L258 198L258 122Z', C.fuD),   // ombre côté arrière
    p('M216 112L250 112L250 136C242 140 230 142 216 146Z', C.fuD),                                       // ombre portée du corps et de la cuisse
    s('M233.5 151C235.5 156 238 160.5 241 164.5', C.fu, 1.8),                                             // arête éclairée du tibia
  ], 3),
  part('patte arrière lointaine : pied', F.hindFarPaw, C.fuS, [p('M236 187L254 187L254 214L230 214C236 206 236 194 236 187Z', C.fuD), toes([222, 230], 204)]),
  claws([[218, 207], [226, 209]]),
  // patte avant lointaine
  part('patte avant lointaine', F.frontFarLeg, C.fuS, [
    p('M58 132C64 148 66 164 62 176C60 184 58 190 56 198L96 198L96 132Z', C.fuD),                          // ombre côté arrière + ombre portée de la collerette
    s('M55.5 146C52.5 156 50 166 48.5 173', C.fu, 2.2),                                                  // arête éclairée de l'avant-bras
    s('M46.5 182C45 185.5 44 188 43.5 190', C.fu, 1.8),
    s('M47.4 178.6C49.2 179.6 51.2 180 53.4 179.6', O, 1.6),                                                      // pli du poignet
  ]),
  part('patte avant lointaine : pied', F.frontFarPaw, C.fuS, [p('M50 187L68 187L68 214L44 214C50 206 50 194 50 187Z', C.fuD), toes([36, 44], 204)]),
  claws([[32, 207], [40, 209]]),
  part('torse', F.torso, C.fu, [
    // bande claire sur le dos (lumière du haut-gauche), sous la crinière
    p('M128 92C146 80 172 70 196 66C214 64 228 74 236 90L236 100C228 86 214 77 198 77C176 78 152 88 130 102Z', C.fuL),
    // crinière hérissée plus sombre (bord inférieur en mèches)
    p('M128 50L192 34L194 62C186 62 178 64 170 68L164 61L156 70L148 63L140 74L132 67L122 82Z', C.fuS),
    p('M139 40L141 33L147 48Z M161 39L164 31L168 48Z M184 42L189 37L189 54Z', C.fuD),
    s('M144 54Q146 48 146 42M166 52Q167 46 166 40', C.fuL, 1.8),
    // grand croissant d'ombre : ventre + bas-droit du torse (bord supérieur en mèches)
    p(`M100 150${tufts([104, 148], [172, 134], [240, 80], 8, 6, 3)}L246 80L246 180L100 180Z`, C.fuS),
    // ombre profonde au fond du ventre (contacts avec les pattes)
    p(`M120 172${tufts([124, 164], [168, 160], [214, 140], 5, 4, 2)}L240 132L240 180L120 180Z`, C.fuD),
    // ombre portée de la tête sur le cou
    p(`M120 92L156 92L158.5 96${tufts([158.5, 96], [156, 117], [137, 132], 4, 3.5, 2)}L120 132Z`, C.fuS),
    // ventre clair (crème à l'ombre)
    p('M130 162L138 157L142 163L152 159L156 165L168 161L172 166L184 162L184 176L126 176Z', C.crS),
    // mèches du dos et du flanc
    s('M178 74Q186 70 192 70M204 74Q212 74 218 80', C.fu, 2),
    s('M152 112Q160 106 168 104M158 130Q166 124 174 122', C.fuS, 2),
  ]),
  part('poitrail (collerette)', F.ruff, C.cr, [
    p('M110 128C124 138 128 152 116 170L104 166L110 156L102 150L110 142Z', C.crS),
    p('M74 130C72 146 74 158 80 168L84 166C79 154 78 142 80 132Z', C.crL),
    s('M92 150Q95 156 96 162M102 146Q104 152 104 158M86 162Q88 166 89 171', C.crS, 2),
  ]),
  // patte arrière proche (sous la cuisse) : tibia vers l'arrière, jarret pointu, métatarse vers l'avant
  part('patte arrière proche', F.hindNearLeg, C.fu, [
    p(`M176 170${tufts([180, 168], [210, 162], [238, 146], 4, 3.5, 2, -1)}L238 120L176 120Z`, C.fuS),     // ombre portée de la cuisse (mèches vers le bas)
    p('M219 146C218 156 220 164 225 171C226 175 223 179 219 183C215 188 212 193 210 198L240 198L240 146Z', C.fuS),   // ombre côté arrière (cylindre)
    p('M229 172C230 177 227 181 223 185C220 189 218 193 217 198L240 198L240 172Z', C.fuD),
    p('M199 177C203 179 206 180.5 208.5 181L203.5 186C203 183 201 180 199 177Z', C.fuS),                   // pli du jarret
    s('M199 190C201 186.5 203.5 184 206.5 182', C.fuL, 2),                                               // arête éclairée du métatarse
  ], 3, O, F.hindNearLegLine),
  part('cuisse arrière (proche)', F.haunch, C.fu, [
    p(`M232 100${tufts([230, 104], [222, 146], [182, 164], 5, 5, 2.5, -1)}L176 170L244 170L244 100Z`, C.fuS),  // croissant d'ombre bas-droit
    p('M234 128C230 146 216 156 198 162L190 170L244 170L244 128Z', C.fuD),
    p('M174 120C176 104 188 96 202 94C190 102 182 112 179 124Z', C.fuL),
    s('M200 110Q208 118 210 130', C.fuD, 2),
  ], 3, O, F.haunchLine),
  part('patte arrière proche : pied', F.hindNearPaw, C.fu, [p('M202 187L220 187L220 214L198 214C204 206 204 194 202 187Z', C.fuS), toes([186, 195], 203), s('M180 195C182 191 186 189 190 189', C.fuL, 2)]),
  claws([[178, 207], [186, 209], [195, 210]]),
  part('patte avant proche', F.frontNearLeg, C.fu, [
    p('M137 122C149 136 150 152 141 162C133 170 126 176 121 184L117 198L156 198L156 122Z', C.fuS),          // ombre côté arrière
    p('M145 152C144 160 138 166 131 172C127 176 125 180 123.5 184L120 198L156 198L156 152Z', C.fuD),
    p('M106 136C110 128 120 124 132 124C120 130 112 138 110 148Z', C.fuL),
    s('M101.6 149C100.2 157 99 165 98.4 172', C.fuL, 2.5),                                                // arête éclairée de l'avant-bras
    s('M97 182C96 185 95 188 94.5 190', C.fuL, 2),
    s('M108 130C118 123 132 123 142 130', C.fuD, 2),                                                     // muscle de l'épaule
    p('M118 150C124 152 129 158 130 166C125 160 120 156 116 154Z', C.fuS),                                // pli du coude
    s('M97 177.8C98.8 178.8 101 179.2 103.4 179', O, 1.8),                                          // pli du poignet
  ], 3, O, F.frontNearLegLine),
  part('patte avant proche : pied', F.frontNearPaw, C.fu, [p('M108 186L128 186L128 214L104 214C110 206 110 194 108 186Z', C.fuS), toes([92, 101], 203), s('M86 195C88 190 93 188 98 188', C.fuL, 2)]),
  claws([[84, 207], [92, 209], [101, 210]]),
];

const head = [
  part('oreille lointaine', F.earFar, C.fuS, [p('M63 56C61 42 62 30 67 20C74 30 78 42 78 54Z', C.earS)]),
  part('oreille proche', F.earNear, C.fu, [
    p('M103 46C104 34 109 24 119 15C123 28 123 40 119 52Z', C.ear),
    p('M114 22C117 32 117 42 115 52L120 52C123 40 123 28 119 15Z', C.earS),
    p('M119 4L134 4L134 62L122 62C127 44 125 22 119 4Z', C.fuS),
    s('M99 44C100 32 106 22 115 13', C.fuL, 2),
  ]),
  part('intérieur de la gueule', F.mouthIn, C.mouth, [`<ellipse cx="52" cy="134" rx="22" ry="6.5" fill="${C.tongue}"/><path d="M40 132C46 130 54 130 60 131" fill="none" stroke="#b84a55" stroke-width="1.6"/>`, p('M12 105L82 117L82 123L12 111Z', C.mouthD)], 2.5),
  part('mâchoire inférieure', F.jaw, C.crS, [p('M20 128L60 124C50 130 40 134 22 138Z', C.cr), p('M60 128L86 118L86 148L46 148C58 140 62 134 60 128Z', C.crD), s('M30 135C40 133 50 131 58 128', C.crL, 1.8)]),
  `<!-- crocs du bas -->
<path d="M49 130L54.5 113L60 128Z" fill="${W}" stroke="${O}" stroke-width="1.8"/>
<path d="M28 133L30.5 123L34.5 132.5Z" fill="${W}" stroke="${O}" stroke-width="1.6"/>
<path d="M65 125.5L67 120L69.5 124.5Z" fill="${W}" stroke="${O}" stroke-width="1.4"/>`,
  part('tête', F.head, C.fu, [
    // masque clair : museau, joues (bord en mèches)
    p('M4 102C20 100 38 96 54 98C66 100 76 106 86 110C100 114 118 114 136 106L162 106L162 140L4 140Z', C.cr),
    p('M100 118L108 114L114 120L124 114L130 120L142 112L162 112L162 140L96 140Z', C.crS),
    // ombre de la nuque (bord en mèches), reflet du crâne
    p('M112 42C128 50 134 62 132 76L138 80L132 88L140 94L162 94L162 36Z', C.fuS),
    p('M50 76C54 60 66 50 84 46C70 54 60 64 56 78Z', C.fuL),
    s('M92 44C102 42 112 44 120 48', C.fuL, 2),
    // rides du grognement sur le museau
    fur('M28 91C31 94 32 97 31 100', C.fuD, 2), fur('M35 89C38 92 39 95 38 98', C.fuD, 2),
    // mèches des joues
    s('M126 80Q134 80 140 84M124 94Q132 96 138 100M118 106Q126 110 130 116', C.fuS, 2.2),
  ]),
  `<!-- gencive + crocs du haut -->
<path d="M16 105C36 108 58 113 79 118L78 121.5C58 117 36 112 17 109Z" fill="${C.gum}"/>
<path d="M34 110L39.5 129L45 111.5Z" fill="${W}" stroke="${O}" stroke-width="1.8"/><path d="M37 113L39.5 123" fill="none" stroke="#d9dff0" stroke-width="1.2"/>
<path d="M18 107L21 118.5L25 108Z" fill="${W}" stroke="${O}" stroke-width="1.6"/>
<path d="M62 115.5L64.5 122L67 116.5Z" fill="${W}" stroke="${O}" stroke-width="1.4"/>`,
  `<!-- truffe -->
<path d="${F.nose}" fill="${C.nose}" stroke="${O}" stroke-width="2.5"/><path d="M9 95C11 93 14 92 17 93" fill="none" stroke="#7a7298" stroke-width="2"/><circle cx="11" cy="96" r="1.4" fill="${W}"/>`,
  `<!-- oeil proche (iris jaune) -->
<path d="${F.eyeN}" fill="url(#ml-iris)"/>
<g clip-path="${clip('oeil-proche', F.eyeN)}"><ellipse cx="89" cy="94" rx="5" ry="6.2" fill="${O}"/><path d="M60 70L112 70L112 81C98 87 84 93 70 101Z" fill="${C.fuS}"/></g>
<circle cx="85" cy="91.5" r="2.6" fill="${W}"/><circle cx="94" cy="98.5" r="1.3" fill="${W}"/>
<path d="${F.eyeN}" fill="none" stroke="${O}" stroke-width="2.2"/>
<path d="M71.5 96.5C82 91 95 84.5 109 78" fill="none" stroke="${O}" stroke-width="3.8"/>`,
  `<!-- oeil lointain -->
<path d="${F.eyeF}" fill="url(#ml-iris)"/>
<g clip-path="${clip('oeil-lointain', F.eyeF)}"><ellipse cx="55" cy="92.5" rx="3.6" ry="4.6" fill="${O}"/><path d="M38 70L72 70L72 93C62 89 52 85 38 84Z" fill="${C.fuS}"/></g>
<circle cx="53.5" cy="91" r="1.7" fill="${W}"/>
<path d="${F.eyeF}" fill="none" stroke="${O}" stroke-width="2"/>
<path d="M43 80C50 83 56.5 86.5 63.5 91.5" fill="none" stroke="${O}" stroke-width="3.4"/>`,
  `<!-- arcades sourcilières froncées -->
<path d="M66 89C76 76 92 69 111 68L112 74C97 75 83 81 72 93Z" fill="${C.fuD}" stroke="${O}" stroke-width="1.6"/>
<path d="M62 87C57 80 50 76 41 76L41 81C48 81 54 84 58 90Z" fill="${C.fuD}" stroke="${O}" stroke-width="1.6"/>`,
];

const head0 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 220">
<!-- Fuze Arena : monstre LOUP DES BOIS (préfixe ml-), tourné vers la gauche. Même style que art/guerrier.svg :
     contour #1b1530, doublure trait 7, pièces = aplat + ombres découpées + contour 3, lumière en haut à gauche. -->
<defs>
@@DEFS@@
</defs>
`;
const out = `<!-- tout le dessin est décalé de 1,5 px à droite pour que la truffe abaissée reste dans le cadre ;
     les pivots ci-dessous sont donnés dans le repère de ce groupe -->
<g transform="translate(1.5 0)" stroke-linejoin="round" stroke-linecap="round">
<!-- ===== OMBRE AU SOL ===== -->
<ellipse cx="140" cy="211" rx="116" ry="8" fill="${O}" opacity="0.25"/>
<ellipse cx="140" cy="211" rx="94" ry="6" fill="${O}" opacity="0.35"/>
<!-- ===== CORPS ===== -->
<g>
${back([F.tail, F.hindFarLeg, F.hindFarPaw, F.frontFarLeg, F.frontFarPaw, F.torso, F.ruff, F.haunch, F.hindNearLeg, F.hindNearPaw, F.frontNearLeg, F.frontNearPaw])}
${body.join('\n')}
</g>
<!-- ===== TÊTE ===== (pivot du cou : 112,124) — tête abaissée, pose de traque -->
<g transform="rotate(-4 112 124)">
${back([F.earFar, F.earNear, F.mouthIn, F.jaw, F.head, F.nose])}
${head.join('\n')}
</g>
</g>
</svg>
`;
L.write(path.join(__dirname, '..', 'art', 'monstre-loup.svg'), head0, out);
