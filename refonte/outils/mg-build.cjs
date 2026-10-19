// Générateur du ROI GLUANT : écrit art/monstre-gluant.svg (préfixe mg-), tourné vers la GAUCHE.
const path = require('path');
const L = require('./mo-lib.cjs')('mg');
const { O, W, part, clip, grad, back, p, s, spark, gem } = L;
const C = {
  au: '#f7bc2a', auL: '#ffe168', auS: '#cd7e15', auH: '#fff7c4', auD: '#8f4c0a',
  // gelée verte
  slL: '#b4f27a', sl: '#62d24a', slS: '#2f9e45', slD: '#1c6e3a', slG: '#8fe866', slH: '#dcffb8', brow: '#145a2e',
  blush: '#ff9fb8',
};
grad(`<radialGradient id="mg-gelee" cx="0.34" cy="0.3" r="0.8"><stop offset="0" stop-color="#a8ef74"/><stop offset="0.5" stop-color="${C.sl}"/><stop offset="1" stop-color="#44b846"/></radialGradient>`);
grad(`<linearGradient id="mg-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.auH}"/><stop offset="0.45" stop-color="${C.au}"/><stop offset="1" stop-color="#d98a16"/></linearGradient>`);
grad(`<linearGradient id="mg-iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b0d12"/><stop offset="0.55" stop-color="#d4462a"/><stop offset="1" stop-color="#ffc07a"/></linearGradient>`);

const F = {
  body: 'M36 228C22 229 12 225 13 218C14 211 22 207 26 198C29 172 40 142 56 116C74 90 98 72 128 68C164 64 194 86 208 124C216 146 220 168 219 186C226 188 232 196 231 206C230 212 226 214 226 218C228 224 222 229 210 229C186 232 168 231 150 231C120 234 66 231 36 228Z',
  drop: 'M7 229C4 224 7 216 12 212C17 216 20 223 17 228C14 231 9 231 7 229Z',
  drool: 'M91 187C88 191 86 196 87.5 199.5C89 202.5 94 202.5 95 199C96 195 94 190 91 187Z',
  eyeF: 'M77.4 132.4C84 133 92 135.6 98.4 139.6C99.2 145 98.6 151 96 156C93 161 83 161 80 156C77 150 76.2 140 77.4 132.4Z',
  lidF: 'M75.9 130.4C84 130.8 92.4 133.4 98.8 137.6C100.4 138.6 100 141 98.4 140.6C92 137 84 134.6 76.1 134.5Z',
  eyeN: 'M112.4 138.6C122 133.6 132 130.4 142.2 129.4C144.2 137.5 144 150 140 157C136 162 120 162 116 157C113 151 111.6 144 112.4 138.6Z',
  lidN: 'M112.4 136.9C122 131.8 132.2 128.3 143.4 127.2L143.8 131C132.4 131.8 122.6 135.3 113.6 140.3C112 141 110.6 138.2 112.4 136.9Z',
  mouth: 'M90 182C97 173 116 171 125 177C124 186 115 191 106 191C97 191 90 188 90 182Z',
  // couronne (repère local : milieu du bas en 0,0)
  crown: 'M-30 0L-33 -16L-38 -42L-18 -24L0 -50L18 -24L38 -42L33 -16L30 0C12 4 -12 4 -30 0Z',
  band: 'M-31 -1C-12 3 12 3 31 -1L33 -16C12 -12 -12 -12 -33 -16Z',
};

const bodyShades = [
  p('M30 160C40 116 76 80 124 72C90 88 62 116 50 160C46 168 34 168 30 160Z', C.slL),                 // bande claire haut-gauche
  p('M172 72C206 96 220 150 206 192C198 214 176 226 150 232L240 240L240 60Z', C.slS), // ombre propre (croissant droite)
  p('M216 148C218 184 206 212 180 228L240 240L240 148Z', C.slD),                  // ombre profonde
  p('M30 216C64 202 160 198 206 210C178 222 76 226 30 216Z', C.slG),               // lueur interne (la lumière traverse la gelée)
  s('M200 96C214 116 220 150 216 184', '#55c64a', 4),                              // transparence : bord éclairé par l'arrière
  p('M40 230C52 227 60 228 72 229C100 234 140 229 170 232C200 233 220 226 238 216L240 240L40 240Z', C.slD), // contact au sol (ondulé)
  `<ellipse cx="158" cy="85" rx="32" ry="7" transform="rotate(20 158 85)" fill="${C.slS}"/>`, // ombre portée de la couronne
  // bulles
  `<circle cx="172" cy="124" r="5" fill="none" stroke="${C.slH}" stroke-width="2"/><circle cx="170.5" cy="122.5" r="1.3" fill="${W}"/>`,
  `<circle cx="188" cy="152" r="3.2" fill="none" stroke="${C.slH}" stroke-width="1.8"/>`,
  `<circle cx="58" cy="196" r="4" fill="none" stroke="${C.slH}" stroke-width="1.8"/><circle cx="57" cy="195" r="1" fill="${W}"/>`,
  `<circle cx="150" cy="104" r="2.6" fill="${C.slH}"/>`,
  // pièces d'or avalées (teintées par la gelée)
  `<g transform="rotate(-22 178 196)"><ellipse cx="178" cy="196" rx="11" ry="8" fill="#e2c736" stroke="${C.slD}" stroke-width="1.6"/><ellipse cx="177" cy="195" rx="6.5" ry="4.5" fill="none" stroke="#fff08a" stroke-width="1.5"/></g>`,
  `<g transform="rotate(14 198 176)"><ellipse cx="198" cy="176" rx="8" ry="6" fill="#cdb533" stroke="${C.slD}" stroke-width="1.5"/><ellipse cx="197" cy="175" rx="4.5" ry="3" fill="none" stroke="#f4e27a" stroke-width="1.3"/></g>`,
  // reflets
  s('M30 212C42 222 70 226 100 227', C.slH, 2.5),                                  // lumière réfléchie au bord bas-gauche
  p('M48 140C54 108 80 84 112 78C88 92 70 112 60 142C57 148 50 148 48 140Z', W),                       // virgule de reflet
  `<circle cx="50" cy="156" r="3.4" fill="${W}"/>`,
  p('M201 128C206 138 208 150 207 162C204 152 200 142 196 133Z', W),               // reflet secondaire (côté ombre)
  spark(98, 102, 7),
  s('M132 74C150 74 166 80 178 90', C.slH, 2.2),                                    // filet de lumière sur le sommet
];

const face = [
  `<!-- visage : oeil lointain (gauche) -->
<path d="${F.eyeF}" fill="${W}"/>
<g clip-path="${clip('oeil-lointain', F.eyeF)}">
<ellipse cx="86.5" cy="147" rx="8" ry="12" fill="url(#mg-iris)"/><ellipse cx="85.8" cy="146" rx="4" ry="6.6" fill="${O}"/>
<path d="M80 152C83 157 90 157 93 152C90 155 83 155 80 152Z" fill="#ffd9a8"/>
</g>
<circle cx="83" cy="141" r="3.2" fill="${W}"/><circle cx="90" cy="153" r="1.5" fill="${W}"/>
<path d="${F.eyeF}" fill="none" stroke="${O}" stroke-width="2.5"/>
<path d="${F.lidF}" fill="${O}"/>`,
  `<!-- visage : oeil proche (droite) -->
<path d="${F.eyeN}" fill="${W}"/>
<g clip-path="${clip('oeil-proche', F.eyeN)}">
<ellipse cx="125" cy="145" rx="11" ry="14" fill="url(#mg-iris)"/><ellipse cx="124" cy="144" rx="5.4" ry="8" fill="${O}"/>
<path d="M116 151C120 158 130 158 134 151C130 155 120 155 116 151Z" fill="#ffd9a8"/>
</g>
<ellipse cx="120.6" cy="141.6" rx="3.8" ry="4.3" fill="${W}"/><circle cx="130" cy="153" r="2" fill="${W}"/>
<path d="${F.eyeN}" fill="none" stroke="${O}" stroke-width="2.5"/>
<path d="${F.lidN}" fill="${O}"/>`,
  `<!-- visage : sourcils froncés -->
<path d="M106 126C116 116 132 110 148 108L147 114C134 116 121 121 110 131Z" fill="${C.brow}" stroke="${O}" stroke-width="1.6"/>
<path d="M101 128C93 120 83 116 72 116L73 121C82 121 90 125 97 132Z" fill="${C.brow}" stroke="${O}" stroke-width="1.6"/>`,
  `<!-- visage : joues -->
<ellipse cx="80" cy="166" rx="5" ry="3" fill="${C.blush}"/><ellipse cx="136" cy="168" rx="6.5" ry="3.7" fill="${C.blush}"/>`,
  `<!-- visage : bouche boudeuse -->
<path d="${F.mouth}" fill="#7a2433"/>
<g clip-path="${clip('bouche', F.mouth)}"><ellipse cx="108" cy="192" rx="12" ry="6" fill="#e8706e"/></g>
<path d="M97 176.5L100 182L103 175Z" fill="${W}" stroke="${O}" stroke-width="1.2"/><path d="M113 174.5L116 180.5L119 175.5Z" fill="${W}" stroke="${O}" stroke-width="1.2"/>
<path d="${F.mouth}" fill="none" stroke="${O}" stroke-width="2.2"/>`,
  `<!-- visage : goutte de bave gluante -->
<path d="${F.drool}" fill="${C.slH}" stroke="${O}" stroke-width="2"/><circle cx="89.6" cy="196.5" r="1.2" fill="${W}"/>`,
];

const crown = [
  `<!-- couronne : intérieur (fond) -->
<ellipse cx="0" cy="-16" rx="33" ry="7" fill="${C.auD}" stroke="${O}" stroke-width="2.5"/>`,
  part('couronne : fleurons', F.crown, 'url(#mg-gold)', [
    p('M10 -40L40 -40L40 4L6 4Z', C.auS),
    p('M-33 -18L-36 -38L-31 -30Z', C.auH),
    s('M-3 -44L-14 -26', C.auH, 1.6),
  ]),
  gem(0, -32, 3.6, '#3fa2ff', 1.6),
  part('couronne : bandeau', F.band, 'url(#mg-gold)', [p('M8 -14L36 -18L36 4L6 4Z', C.auS), s('M-29 -11C-14 -8 -4 -8 4 -8', C.auH, 1.6)]),
  gem(0, -7, 5, '#e3343d', 2) + gem(-20, -8, 3.4, '#3fa2ff', 1.6) + gem(20, -8, 3.4, '#3fa2ff', 1.6),
  `<!-- couronne : perles des pointes -->
<circle cx="-38" cy="-44" r="4.5" fill="url(#mg-gold)" stroke="${O}" stroke-width="2.2"/><circle cx="0" cy="-53" r="5" fill="url(#mg-gold)" stroke="${O}" stroke-width="2.2"/><circle cx="38" cy="-44" r="4.5" fill="url(#mg-gold)" stroke="${O}" stroke-width="2.2"/>
<circle cx="-39.5" cy="-45.5" r="1.4" fill="${W}"/><circle cx="-1.6" cy="-54.8" r="1.6" fill="${W}"/>`,
  spark(-24, -30, 6),
];

const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
<!-- Fuze Arena : monstre ROI GLUANT (préfixe mg-), tourné vers la gauche. Même style que art/guerrier.svg :
     contour #1b1530, doublure trait 7, pièces = aplat + ombres découpées + contour 3, lumière en haut à gauche. -->
<defs>
@@DEFS@@
</defs>
`;
const body = `<g stroke-linejoin="round" stroke-linecap="round">
<!-- ===== OMBRE AU SOL ===== -->
<ellipse cx="122" cy="229" rx="104" ry="9" fill="${O}" opacity="0.25"/>
<ellipse cx="122" cy="229" rx="84" ry="6.5" fill="${O}" opacity="0.35"/>
<!-- ===== CORPS (gelée) ===== -->
<g>
${back([F.body])}
${part('gelée', F.body, 'url(#mg-gelee)', bodyShades)}
</g>
<!-- ===== VISAGE ===== -->
<g>
${face.join('\n')}
</g>
<!-- ===== COURONNE ===== (pivot : 158,77) -->
<g transform="translate(158 77) rotate(20)">
${back([F.crown, 'M-33 -16C-33 -24 33 -24 33 -16C33 -8 -33 -8 -33 -16Z'])}
${crown.join('\n')}
</g>
</g>
</svg>
`;
L.write(path.join(__dirname, '..', 'art', 'monstre-gluant.svg'), head, body);
