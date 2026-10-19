// Dessine les monstres des donjons et les boss du raid dans le style de la refonte.
// Sortie : art/monstres/<id>.svg (même id que le sprite du jeu). Lancer : node refonte/outils/bestiaire.cjs [id…]
const path = require('path');
const { tones, E, P, CAP, creature, mix } = require('./bestiaire-kit.cjs');
const OUT = path.join(__dirname, '..', '..', 'art', 'monstres');
require('fs').mkdirSync(OUT, { recursive: true });

const SKIN = tones('#fdd2ad'), DARK = tones('#2b2440');
const IRIS = {
  rouge: ['#3b0d12', '#d4462a', '#ffc07a'], jaune: ['#4a2a05', '#e8a516', '#fff2a0'], vert: ['#12360f', '#3fae2a', '#c8f58a'],
  bleu: ['#16225e', '#2d74dc', '#8fe3ff'], violet: ['#2a1660', '#7b52e0', '#d6c2ff'],
};

const M = {};

// ---------- GOBELIN : petite peau verte, grandes oreilles, gourdin
M.goblin = (c) => {
  const sk = tones('#6fbf3e'), cuir = tones('#94593a'), bois = tones('#9a6234');
  c.piece(CAP(104, 180, 98, 212, 11, 10), sk); c.piece(E(96, 218, 16, 9), cuir);             // jambe lointaine
  c.piece(CAP(130, 180, 136, 212, 12, 11), sk); c.piece(E(142, 218, 17, 9), cuir);           // jambe proche
  c.piece(P('M82 186C78 158 88 134 118 130C148 128 162 150 160 184C150 196 96 198 82 186Z'), cuir);   // tunique
  c.piece(P('M84 176C110 184 136 184 158 176L160 186C136 194 108 194 84 186Z'), tones('#5a3a22'));  // ceinture
  c.piece(CAP(92, 146, 80, 176, 10, 9), sk);                                                  // bras lointain
  c.piece(CAP(186, 70, 160, 176, 7, 10), bois, { shade: 0.7 });                               // gourdin
  c.piece(E(190, 76, 17, 22), bois);
  c.raw('<circle cx="184" cy="68" r="2.5" fill="#6b3d1f"/><circle cx="196" cy="84" r="2" fill="#6b3d1f"/>');
  c.piece(CAP(146, 146, 160, 168, 11, 10), sk); c.piece(E(162, 170, 10, 10), sk);            // bras proche + poing
  c.piece(P('M64 76L28 56C30 78 44 96 70 104Z'), sk); c.piece(P('M176 78L214 54C212 80 198 98 172 104Z'), sk);   // oreilles
  c.flat(P('M58 80L38 66C42 80 50 90 64 96Z'), '#e8a0a0'); c.flat(P('M180 82L204 66C202 82 194 92 178 98Z'), '#e8a0a0');
  c.piece(E(120, 92, 54, 46), sk, { gloss: true });                                           // tête
  c.eye(100, 92, 15, 16, IRIS.rouge); c.eye(140, 92, 12, 15, IRIS.rouge);
  c.brow(84, 74, 112, 82); c.brow(130, 80, 154, 72);
  c.piece(E(124, 110, 9, 7), tones('#4f9a2c'), { light: false });                             // nez
  c.mouth(102, 124, 40, 14, { teeth: 2 });
};

// ---------- SQUELETTE : os blancs, gros crâne, épée rouillée
M.skeleton = (c) => {
  const os = tones('#efe8d6'), rouille = tones('#a8754a'), acier = tones('#c3cce0');
  c.piece(CAP(106, 178, 100, 214, 6), os); c.piece(E(96, 218, 14, 7), os);
  c.piece(CAP(130, 178, 136, 214, 6), os); c.piece(E(142, 218, 15, 7), os);
  c.piece(E(118, 176, 24, 10), os);                                                            // bassin
  c.piece(CAP(118, 128, 118, 172, 5), os);                                                     // colonne
  c.piece(P('M92 130C94 118 142 118 146 130C148 150 140 160 120 162C100 160 90 150 92 130Z'), os);   // cage
  for (const y of [134, 143, 152]) c.line(`M98 ${y}Q120 ${y + 5} 142 ${y}`, '#8f866e', 2.2);
  c.piece(CAP(96, 132, 82, 166, 5), os);                                                      // bras lointain
  c.piece(CAP(164, 168, 200, 64, 5, 3), acier, { gloss: true }); c.piece(CAP(158, 172, 172, 162, 4), rouille);   // épée
  c.line('M166 160L198 70', '#8a95b2', 1.6);
  c.piece(CAP(142, 132, 160, 166, 5), os); c.piece(E(162, 168, 7, 7), os);                   // bras proche
  c.piece(P('M70 84C70 50 92 32 122 32C154 32 176 52 174 86C172 104 162 112 150 116L150 128C132 132 106 132 92 128L92 116C78 110 70 100 70 84Z'), os, { gloss: true });   // crâne
  c.piece(E(100, 86, 15, 16), DARK, { sw: 2.5, light: false }); c.piece(E(142, 88, 12, 14), DARK, { sw: 2.5, light: false });
  c.glowEye(103, 88, 5, 6, '#ff4a3a'); c.glowEye(143, 90, 4, 5, '#ff4a3a');
  c.flat(P('M120 100L114 112L126 112Z'), '#1b1530');
  for (let i = 0; i < 4; i++) c.line(`M${102 + i * 11} 118L${102 + i * 11} 128`, '#1b1530', 2);
};

// ---------- CHAMPIGNON TOXIQUE : chapeau rouge à pois, pied crème, air méchant
M.mushroom = (c) => {
  const pied = tones('#f3e6c8'), cap = tones('#e3343d'), pois = tones('#ffffff', 0.4);
  c.piece(E(100, 220, 14, 8), tones('#94593a')); c.piece(E(142, 220, 15, 8), tones('#94593a'));
  c.piece(P('M84 214C80 176 86 136 120 132C154 136 162 176 158 214C140 222 100 222 84 214Z'), pied);   // pied
  c.piece(CAP(86, 160, 70, 186, 8), pied); c.piece(CAP(156, 160, 172, 184, 8), pied);
  c.piece(P('M30 126C30 70 72 34 122 34C172 34 214 70 214 126C200 140 44 140 30 126Z'), cap, { gloss: true });   // chapeau
  for (const [x, y, r] of [[78, 70, 13], [122, 54, 10], [164, 76, 15], [56, 108, 9], [104, 98, 11], [188, 112, 8], [150, 110, 7]]) c.piece(E(x, y, r, r * 0.85), pois, { sw: 2.2, shade: 0.6 });
  c.piece(P('M44 128C70 138 172 138 200 128C190 142 56 142 44 128Z'), tones('#d9c9a6'), { light: false });   // dessous du chapeau
  c.eye(104, 166, 12, 13, IRIS.violet); c.eye(138, 166, 10, 12, IRIS.violet);
  c.brow(90, 150, 114, 158); c.brow(128, 156, 150, 148);
  c.mouth(108, 186, 30, 12, { teeth: 2 });
  c.raw('<circle cx="94" cy="182" r="4" fill="#ff8b7e" opacity="0.5"/><circle cx="150" cy="182" r="4" fill="#ff8b7e" opacity="0.5"/>');
};

// ---------- FANTÔME : drap lumineux, bas ondulé, bouche ronde
M.ghost = (c) => {
  const drap = tones('#d8d2ff', 0.8);
  c.glow(120, 120, 110, '#b9a6ff', 0.45);
  c.piece(P('M58 214C52 160 50 110 66 78C82 48 104 36 124 36C152 36 176 54 186 84C196 116 192 170 186 214C176 204 168 204 160 216C150 204 140 204 132 216C122 204 112 204 104 216C94 204 82 204 74 216C68 208 62 208 58 214Z'), drap, { gloss: true });
  c.piece(CAP(64, 130, 40, 150, 10, 8), drap); c.piece(CAP(180, 128, 204, 140, 10, 8), drap);
  c.piece(E(102, 106, 13, 19), DARK, { sw: 2.5, light: false }); c.piece(E(142, 108, 11, 17), DARK, { sw: 2.5, light: false });
  c.raw('<ellipse cx="98" cy="98" rx="4.5" ry="6" fill="#ffffff"/><ellipse cx="139" cy="101" rx="3.5" ry="5" fill="#ffffff"/>');
  c.piece(E(124, 148, 11, 14), tones('#7a2433'), { sw: 2.5, light: false });
  c.raw('<circle cx="88" cy="128" r="6" fill="#ff8bb8" opacity="0.45"/><circle cx="158" cy="130" r="5" fill="#ff8bb8" opacity="0.45"/>');
  c.spark(196, 64, 7); c.spark(46, 92, 5);
};

// ---------- GOLEM DE PIERRE : rochers, runes cyan qui brillent
M.golem = (c) => {
  const roc = tones('#8b8ea6'), mousse = tones('#6aa84f');
  c.piece(E(92, 214, 22, 12), roc); c.piece(E(150, 214, 24, 12), roc);                        // pieds
  c.piece(CAP(96, 176, 92, 204, 16), roc); c.piece(CAP(146, 176, 150, 204, 17), roc);
  c.piece(E(54, 150, 22, 26), roc); c.piece(E(46, 192, 20, 18), roc);                         // bras lointain
  c.piece(P('M62 120C60 82 84 62 120 62C160 62 186 84 182 124C180 160 164 186 122 188C82 188 64 160 62 120Z'), roc, { gloss: true });   // torse
  c.piece(P('M70 92C84 78 100 74 112 76C102 82 90 92 82 100Z'), mousse, { sw: 2 });
  c.line('M96 112L110 130L100 150M140 104L132 126L146 146', '#5cf0ff', 3.5);
  c.glow(122, 130, 34, '#5cf0ff', 0.35);
  c.piece(E(120, 54, 30, 24), roc);                                                            // tête
  c.glowEye(108, 54, 6, 4, '#5cf0ff'); c.glowEye(134, 54, 5, 4, '#5cf0ff');
  c.line('M100 44L116 48M128 48L142 44', '#1b1530', 4);
  c.piece(E(190, 140, 24, 28), roc); c.piece(E(200, 188, 24, 22), roc, { gloss: true });     // bras proche + poing
  c.line('M190 180L202 194M206 178L214 192', '#5a5c74', 2.5);
};

// ---------- RAT GÉANT : gris, oreilles roses, dents de devant, queue
M.rat = (c) => {
  const poil = tones('#8a8296'), rose = tones('#f2a5b4'), ventre = tones('#d9d2e2');
  c.piece(P('M40 170C20 160 14 130 30 112C36 126 36 146 54 160Z'), rose, { shade: 0.6 });   // queue
  c.piece(E(84, 210, 14, 10), rose); c.piece(E(152, 212, 14, 10), rose);
  c.piece(P('M44 176C42 136 76 110 118 112C160 114 182 140 176 180C170 210 60 212 44 176Z'), poil, { gloss: true });   // corps
  c.piece(P('M90 196C104 168 140 164 160 178C158 200 104 206 90 196Z'), ventre, { light: false });
  c.piece(E(110, 214, 13, 9), rose); c.piece(E(170, 212, 13, 9), rose);
  c.piece(E(132, 82, 18, 22), poil); c.piece(E(132, 84, 11, 14), rose, { light: false, sw: 2 });   // oreille lointaine
  c.piece(P('M128 126C118 94 140 72 168 74C196 76 216 96 222 114C214 124 196 132 168 134C148 136 134 134 128 126Z'), poil, { gloss: true });   // tête
  c.piece(E(102, 92, 22, 26), poil); c.piece(E(102, 94, 14, 17), rose, { light: false, sw: 2 });   // oreille proche
  c.piece(E(222, 114, 7, 6), rose, { light: false });                                         // nez
  c.eye(166, 98, 11, 12, IRIS.rouge); c.eye(190, 100, 8, 10, IRIS.rouge);
  c.brow(152, 84, 174, 90); c.brow(184, 90, 200, 86);
  c.piece(P('M200 124L214 124L214 140L200 138Z'), tones('#fff7d6'), { sw: 2.2 }); c.line('M207 124L207 139', '#1b1530', 1.6);
  c.line('M214 112L236 104M214 116L236 116', '#1b1530', 1.6);
};

// ---------- ÉLÉMENTAIRE DE FEU : corps de flammes, cœur blanc
M.fireElem = (c) => {
  const feu = { L: '#ffd34a', B: '#ff8a1e', S: '#e5421c', D: '#a8231c' }, jaune = { L: '#fffbe0', B: '#ffe168', S: '#ffb52e', D: '#ff8a1e' };
  c.glow(120, 130, 105, '#ff8a1e', 0.5);
  c.piece(P('M64 214C40 180 44 140 66 118C64 100 72 84 84 74C84 94 94 102 100 104C96 78 108 48 132 30C128 58 142 76 156 86C160 74 170 66 180 62C176 84 192 104 194 132C200 170 186 200 170 214C140 226 96 226 64 214Z'), feu, { gloss: true });
  c.piece(P('M88 210C74 186 80 160 96 146C98 162 108 166 112 164C110 146 122 124 138 114C136 134 150 148 160 156C170 176 164 200 154 210C134 218 108 218 88 210Z'), jaune, { sw: 0, light: false });
  c.piece(CAP(66, 150, 40, 128, 10, 6), feu); c.piece(CAP(180, 148, 208, 126, 10, 6), feu);
  c.eye(106, 132, 12, 14, ['#5a0a0a', '#ff3a1a', '#ffd34a'], { sclera: '#fff6d6' }); c.eye(142, 132, 10, 13, ['#5a0a0a', '#ff3a1a', '#ffd34a'], { sclera: '#fff6d6' });
  c.brow(92, 114, 116, 122, '#7a1c10'); c.brow(132, 120, 154, 112, '#7a1c10');
  c.mouth(110, 160, 30, 12, { teeth: 2, tongue: false });
  for (const [x, y, r] of [[46, 90, 4], [198, 92, 5], [214, 168, 3.5], [30, 160, 3]]) c.raw(`<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd34a"/>`);
};

// ---------- YÉTI : grosse fourrure blanche, visage bleu, cornes
M.yeti = (c) => {
  const four = tones('#eef4ff', 0.9), peau = tones('#7fa8e0'), corne = tones('#e8dcc0');
  c.piece(E(92, 216, 22, 11), peau); c.piece(E(152, 216, 23, 11), peau);
  c.piece(P('M50 176C42 128 64 82 120 78C176 80 200 126 190 178C186 208 160 214 120 214C80 214 54 206 50 176Z M50 176L42 168L52 162M190 178L200 170L190 162'), four, { gloss: true });
  c.piece(CAP(58, 116, 40, 186, 18, 16), four); c.piece(E(40, 194, 16, 13), peau);          // bras lointain
  c.piece(P('M82 96C66 74 64 52 72 40C82 58 92 68 104 74Z'), corne); c.piece(P('M156 74C170 62 180 50 182 36C194 52 190 76 172 92Z'), corne);
  c.piece(E(124, 98, 46, 40), four);                                                          // tête
  c.piece(P('M92 96C94 78 108 72 126 72C146 72 160 80 160 100C160 122 146 134 126 134C106 134 92 120 92 96Z'), peau, { light: false });   // visage
  c.eye(112, 98, 11, 12, IRIS.bleu); c.eye(142, 98, 9, 11, IRIS.bleu);
  c.brow(98, 84, 120, 90); c.brow(134, 88, 154, 82);
  c.mouth(112, 114, 32, 14, { teeth: 2 });
  c.piece(CAP(178, 116, 204, 180, 19, 16), four); c.piece(E(206, 188, 17, 14), peau);       // bras proche
  c.line('M100 150L108 162L116 150M150 156L158 168L166 156', '#c7d0e8', 2.5);
};

// ---------- COMTE VAMPIRE : cape rouge et noire, teint pâle, crocs
M.vampire = (c) => {
  const cape = tones('#b81e34'), noir = tones('#2b2440'), peau = tones('#e8e2ef'), chemise = tones('#f4f1ff', 0.6);
  c.piece(P('M58 214C56 160 66 116 96 104L150 104C178 116 190 160 188 214C160 206 150 214 122 206C96 214 84 206 58 214Z'), cape);   // cape
  c.piece(CAP(108, 176, 104, 212, 10), noir); c.piece(CAP(136, 176, 140, 212, 10), noir);
  c.piece(E(100, 218, 14, 7), noir); c.piece(E(146, 218, 15, 7), noir);
  c.piece(P('M92 186C88 150 96 120 122 116C148 120 156 150 152 186C140 194 104 194 92 186Z'), noir, { gloss: true });   // costume
  c.piece(P('M110 120L122 160L134 120Z'), chemise, { sw: 2 }); c.piece(P('M116 124L122 132L128 124L122 120Z'), tones('#d4202c'), { sw: 1.8 });
  c.piece(P('M84 108C76 94 78 80 84 70L104 104ZM160 108C168 94 166 80 160 70L140 104Z'), cape, { light: false });   // col
  c.piece(CAP(150, 128, 172, 158, 8), noir); c.piece(E(174, 162, 8, 8), peau);
  c.piece(E(122, 80, 40, 38), peau, { gloss: true });                                          // tête
  c.piece(P('M82 72C84 46 102 36 122 36C144 36 162 48 162 74C152 64 140 58 128 66L122 78L116 66C104 58 92 64 82 72Z'), noir, { gloss: true });   // cheveux
  c.eye(106, 86, 11, 11, IRIS.rouge); c.eye(138, 86, 9, 10, IRIS.rouge);
  c.brow(92, 72, 116, 78); c.brow(130, 76, 152, 70);
  c.mouth(110, 104, 26, 9, { teeth: 0, fangs: true, tongue: false });
};

// ---------- DRAGON : rouge, ailes de chauve-souris, cornes
M.dragon = (c) => {
  const ec = tones('#d8343a'), ventre = tones('#f6c46a'), aile = tones('#8e2340'), corne = tones('#f3e6c8');
  c.piece(P('M40 168C18 160 8 134 18 112C26 130 40 140 60 146Z'), ec);                       // queue
  c.piece(P('M88 120C70 70 40 40 20 34C30 60 32 84 44 104C30 100 20 104 14 112C40 118 60 130 78 150Z'), aile);   // aile
  c.line('M86 124L28 44M80 134L22 106', '#5a1428', 2.5);
  c.piece(CAP(72, 186, 66, 214, 11), ec); c.piece(CAP(150, 186, 158, 214, 12), ec);
  c.piece(E(66, 218, 15, 8), ec); c.piece(E(162, 218, 16, 8), ec);
  c.piece(P('M44 170C42 132 80 112 122 114C162 116 182 140 176 176C170 206 66 210 44 170Z'), ec, { gloss: true });   // corps
  c.piece(P('M86 186C96 160 140 156 160 172C158 196 104 202 86 186Z'), ventre, { light: false });
  for (const y of [172, 182, 192]) c.line(`M${98} ${y}Q124 ${y + 4} 154 ${y - 2}`, '#d99a3a', 2);
  c.piece(CAP(140, 140, 170, 96, 16, 13), ec);                                                // cou
  c.piece(P('M150 70C150 50 168 40 188 42C208 44 226 58 230 76C232 92 220 102 200 102C176 104 152 94 150 70Z'), ec, { gloss: true });   // tête
  c.piece(P('M160 52L148 22L174 46Z'), corne); c.piece(P('M182 44L184 16L196 44Z'), corne);
  c.eye(184, 66, 9, 10, IRIS.jaune, { pupil: 0.25 });
  c.brow(174, 54, 196, 58);
  c.mouth(200, 86, 28, 10, { teeth: 2, tongue: false });
  c.raw('<circle cx="222" cy="72" r="2.2" fill="#1b1530"/>');
};

// ---------- CRAPAUD GÉANT : vert, gros yeux sur le dessus, langue
M.frog = (c) => {
  const vert = tones('#5cb83a'), ventre = tones('#e9f2a8'), tache = tones('#3f8a2c');
  c.piece(P('M30 214C26 190 40 178 60 182C66 196 58 210 30 214Z'), vert);                     // patte arrière
  c.piece(P('M40 186C34 130 76 96 126 96C178 96 214 128 208 184C204 214 54 220 40 186Z'), vert, { gloss: true });   // corps
  c.piece(P('M76 196C84 158 168 156 180 194C160 210 92 212 76 196Z'), ventre, { light: false });
  for (const [x, y, r] of [[74, 132, 9], [98, 116, 6], [164, 124, 8], [186, 150, 6]]) c.piece(E(x, y, r, r * 0.8), tache, { sw: 0, light: false, shade: 0.5 });
  c.piece(E(92, 96, 24, 24), vert); c.piece(E(154, 96, 22, 22), vert);                       // bosses des yeux
  c.eye(94, 94, 15, 15, IRIS.jaune, { pupil: 0.3 }); c.eye(154, 94, 13, 13, IRIS.jaune, { pupil: 0.3 });
  c.brow(76, 74, 104, 80); c.brow(144, 78, 168, 72);
  c.line('M80 150Q124 172 176 148', '#1b1530', 3.5);
  c.piece(P('M150 154C166 168 196 170 214 160C204 176 176 180 156 166Z'), tones('#ef6f8a'), { sw: 2.2 });   // langue
  c.piece(E(84, 214, 18, 9), vert); c.piece(E(170, 214, 18, 9), vert);
};

// ---------- ARAIGNÉE DES MINES : abdomen violet sombre, 8 pattes, yeux rouges
M.spider = (c) => {
  const corps = tones('#4a3466'), patte = tones('#3a2a52'), sablier = tones('#e3343d');
  for (const [x1, y1, x2, y2, x3, y3] of [[108, 150, 70, 110, 40, 210], [118, 152, 96, 104, 76, 212], [140, 152, 160, 104, 178, 212], [150, 150, 190, 110, 214, 208]]) {
    c.piece(CAP(x1, y1, x2, y2, 6, 5), patte); c.piece(CAP(x2, y2, x3, y3, 5, 3), patte);
  }
  c.piece(E(84, 140, 52, 44), corps, { gloss: true });                                        // abdomen
  c.piece(P('M70 128L84 140L70 152L98 152L84 140L98 128Z'), sablier, { sw: 2 });
  c.piece(E(150, 156, 34, 30), corps, { gloss: true });                                       // tête
  for (const [x1, y1, x2, y2, x3, y3] of [[130, 170, 104, 150, 92, 214], [168, 170, 196, 150, 210, 214]]) { c.piece(CAP(x1, y1, x2, y2, 5), patte); c.piece(CAP(x2, y2, x3, y3, 4.5, 3), patte); }
  c.eye(146, 150, 9, 10, IRIS.rouge); c.eye(170, 150, 8, 9, IRIS.rouge);
  c.raw('<circle cx="152" cy="134" r="4" fill="#ff4a3a" stroke="#1b1530" stroke-width="1.5"/><circle cx="166" cy="134" r="3.5" fill="#ff4a3a" stroke="#1b1530" stroke-width="1.5"/>');
  c.brow(136, 138, 156, 144); c.brow(162, 144, 180, 136);
  c.piece(P('M150 176L156 196L162 178Z'), tones('#f3e6c8'), { sw: 2 }); c.piece(P('M166 176L170 194L176 176Z'), tones('#f3e6c8'), { sw: 2 });
};

// ---------- ZOMBIE AFFAMÉ : peau verdâtre, chemise déchirée, bras tendus
M.zombie = (c) => {
  const peau = tones('#8fb07a'), chemise = tones('#5a7ab8'), pant = tones('#6b5a44');
  c.piece(CAP(104, 178, 98, 212, 11), pant); c.piece(E(96, 218, 15, 8), tones('#45230f'));
  c.piece(CAP(132, 178, 138, 212, 11), pant); c.piece(E(144, 218, 15, 8), tones('#45230f'));
  c.piece(CAP(106, 130, 176, 138, 9), peau);                                                  // bras lointain tendu
  c.piece(P('M88 186C84 150 92 124 120 120C148 124 156 150 152 186L140 180L132 190L122 180L112 190L102 180Z'), chemise, { gloss: true });
  c.line('M104 140L112 152M132 136L138 148', '#3a5a90', 2.5);
  c.piece(CAP(132, 136, 196, 144, 10), peau); c.piece(E(200, 146, 9, 9), peau);              // bras proche
  c.piece(E(118, 86, 40, 38), peau, { gloss: true });                                          // tête
  c.piece(P('M80 70C84 50 102 44 118 46C136 44 154 52 156 70C146 60 132 62 124 60C110 64 94 60 80 70Z'), tones('#4a3a2a'));   // cheveux
  c.eye(102, 88, 13, 13, IRIS.jaune, { pupil: 0.3 }); c.eye(134, 90, 8, 8, IRIS.jaune, { pupil: 0.3 });
  c.line('M90 104L100 100M94 98L96 106', '#5a2a2a', 2);
  c.mouth(106, 110, 28, 12, { teeth: 3, fangs: false });
};

// ---------- MOMIE : bandelettes, yeux jaunes qui brillent
M.mummy = (c) => {
  const band = tones('#e6d9b4'), ombre = '#bba97a';
  c.piece(CAP(104, 176, 100, 212, 11), band); c.piece(CAP(134, 176, 138, 212, 11), band);
  c.piece(E(98, 218, 14, 7), band); c.piece(E(142, 218, 15, 7), band);
  c.piece(CAP(96, 132, 78, 170, 9), band);
  c.piece(P('M88 184C84 148 94 120 120 118C146 120 156 148 152 184C140 192 100 192 88 184Z'), band, { gloss: true });
  for (const y of [132, 146, 160, 174]) c.line(`M90 ${y}Q120 ${y + 6} 152 ${y - 2}`, ombre, 2.4);
  c.piece(CAP(144, 134, 182, 140, 9), band); c.piece(E(186, 142, 8, 8), band);
  c.piece(P('M152 140C170 150 176 170 168 190C162 176 156 166 146 160Z'), band);               // bandelette qui pend
  c.piece(E(120, 82, 38, 36), band, { gloss: true });
  for (const y of [60, 74, 104]) c.line(`M84 ${y}Q120 ${y - 8} 158 ${y + 2}`, ombre, 2.4);
  c.piece(P('M88 82C96 76 148 76 156 84C150 96 94 96 88 82Z'), DARK, { sw: 2.2, light: false });
  c.glowEye(106, 86, 6, 4.5, '#ffd84a'); c.glowEye(138, 87, 5, 4, '#ffd84a');
};

// ---------- CHEVALIER NOIR : armure sombre, visière rouge, grande épée
M.blackKnight = (c) => {
  const ar = tones('#4a5070'), or = tones('#d9a43a'), acier = tones('#c3cce0'), plume = tones('#d4202c');
  c.piece(CAP(104, 176, 100, 212, 12), ar); c.piece(CAP(136, 176, 140, 212, 12), ar);
  c.piece(E(98, 218, 16, 8), ar); c.piece(E(146, 218, 17, 8), ar);
  c.piece(P('M58 120C56 160 70 184 92 196L96 120Z'), tones('#3a2a52'));                        // cape
  c.piece(P('M86 186C82 148 92 120 122 116C152 120 162 148 158 186C142 196 102 196 86 186Z'), ar, { gloss: true });   // plastron
  c.line('M122 122L122 186', or.B, 3);
  c.piece(E(84, 138, 22, 30), tones('#5a3a6e'), { gloss: true }); c.piece(E(84, 138, 8, 10), or, { sw: 2 });   // bouclier
  c.piece(CAP(178, 176, 206, 44, 7, 4), acier, { gloss: true }); c.piece(CAP(164, 178, 190, 170, 6), or);   // épée
  c.piece(CAP(150, 132, 172, 166, 10), ar); c.piece(E(176, 172, 10, 9), ar);
  c.piece(E(154, 124, 18, 14), ar);                                                            // épaulière
  c.piece(P('M88 84C88 52 104 40 122 40C142 40 158 52 158 84C158 104 144 112 122 112C100 112 88 104 88 84Z'), ar, { gloss: true });   // heaume
  c.piece(P('M98 80L150 80L148 92L100 92Z'), DARK, { sw: 2.2, light: false });
  c.glowEye(112, 86, 6, 3, '#ff3a3a'); c.glowEye(136, 86, 5, 3, '#ff3a3a');
  c.piece(P('M118 40C112 22 124 8 144 10C134 16 130 26 132 42Z'), plume);
};

// ---------- SALAMANDRE DE LAVE : lézard orange, crête de flammes
M.salamander = (c) => {
  const peau = tones('#e8642a'), ventre = tones('#ffd06a'), feu = { L: '#fff2a0', B: '#ffb52e', S: '#ff6a1e', D: '#d4302a' };
  c.piece(P('M50 180C28 186 12 176 8 160C22 170 36 168 52 160Z'), peau); c.piece(P('M8 160C2 146 10 134 20 132C16 146 20 154 28 160Z'), feu, { sw: 2 });
  c.piece(E(70, 214, 14, 8), peau); c.piece(E(150, 214, 15, 8), peau);
  c.piece(P('M70 120C82 92 110 86 132 96C120 84 128 70 140 66C138 82 150 90 158 96C164 84 176 80 184 82C176 96 182 108 180 120Z'), feu, { sw: 2 });   // crête
  c.piece(P('M44 178C40 140 78 112 124 114C166 116 186 140 180 172C176 200 60 206 44 178Z'), peau, { gloss: true });
  c.piece(P('M86 190C96 168 146 164 164 178C160 198 100 204 86 190Z'), ventre, { light: false });
  c.piece(CAP(82, 186, 74, 208, 9), peau); c.piece(CAP(144, 186, 150, 208, 9), peau);
  c.piece(P('M150 128C148 100 168 84 192 86C214 88 228 104 228 120C228 136 212 144 192 144C170 144 152 142 150 128Z'), peau, { gloss: true });   // tête
  c.eye(180, 110, 10, 11, IRIS.jaune, { pupil: 0.25 }); c.eye(204, 110, 8, 9, IRIS.jaune, { pupil: 0.25 });
  c.brow(168, 98, 190, 104); c.brow(198, 102, 214, 96);
  c.line('M184 132Q206 140 226 128', '#1b1530', 3);
  for (const [x, y] of [[110, 140], [132, 132], [96, 156]]) c.raw(`<circle cx="${x}" cy="${y}" r="3.5" fill="#ffb52e"/>`);
};

// ---------- OURS POLAIRE : gros, blanc, griffes
M.polarBear = (c) => {
  const four = tones('#f2f6ff', 0.9), nez = tones('#2b2440'), griffe = tones('#f3e6c8');
  c.piece(CAP(70, 176, 66, 212, 16), four); c.piece(CAP(160, 176, 166, 212, 17), four);
  c.piece(P('M36 168C30 124 70 96 122 96C170 96 196 126 190 166C186 200 46 204 36 168Z'), four, { gloss: true });   // corps
  c.piece(CAP(96, 176, 92, 212, 16), four); c.piece(CAP(186, 160, 196, 210, 16), four);
  for (const x of [80, 104, 180, 202]) c.raw(`<path d="M${x} 218l3 6l3 -6M${x + 7} 218l3 6l3 -6" fill="none" stroke="#1b1530" stroke-width="2"/>`);
  c.piece(E(160, 80, 12, 12), four); c.piece(E(208, 84, 11, 11), four);                       // oreilles
  c.piece(E(186, 112, 40, 34), four, { gloss: true });                                         // tête
  c.piece(E(214, 124, 18, 14), tones('#e2e7f2'), { light: false });                           // museau
  c.piece(E(226, 118, 8, 6), nez, { sw: 2 });
  c.eye(178, 104, 9, 10, IRIS.bleu); c.eye(202, 102, 7, 9, IRIS.bleu);
  c.brow(166, 92, 186, 98); c.brow(196, 96, 210, 90);
  c.mouth(204, 132, 22, 9, { teeth: 2 });
};

// ---------- HYDRE : corps turquoise, trois têtes de serpent
M.hydra = (c) => {
  const ec = tones('#2fa89a'), ventre = tones('#d8f0a8');
  const head = (x, y, s) => {
    c.piece(P(`M${x - 22 * s} ${y + 4 * s}C${x - 22 * s} ${y - 16 * s} ${x - 4 * s} ${y - 24 * s} ${x + 12 * s} ${y - 20 * s}C${x + 30 * s} ${y - 16 * s} ${x + 34 * s} ${y + 2 * s} ${x + 26 * s} ${y + 12 * s}C${x + 14 * s} ${y + 20 * s} ${x - 14 * s} ${y + 22 * s} ${x - 22 * s} ${y + 4 * s}Z`), ec, { gloss: true });
    c.eye(x + 2 * s, y - 6 * s, 7 * s, 8 * s, IRIS.jaune, { pupil: 0.25 });
    c.brow(x - 8 * s, y - 15 * s, x + 12 * s, y - 12 * s, '#1b1530', 4 * s);
    c.mouth(x + 8 * s, y + 8 * s, 18 * s, 8 * s, { teeth: 2, tongue: false });
  };
  c.piece(CAP(96, 150, 64, 76, 14, 11), ec); head(64, 70, 1);
  c.piece(CAP(146, 150, 186, 82, 14, 11), ec); head(188, 76, 1);
  c.piece(P('M50 210C40 164 76 132 122 132C168 132 200 162 192 208C176 222 66 222 50 210Z'), ec, { gloss: true });   // corps
  c.piece(P('M88 212C94 182 150 178 160 210C140 220 104 220 88 212Z'), ventre, { light: false });
  c.piece(CAP(120, 150, 124, 64, 16, 13), ec); head(126, 56, 1.15);
};

// ---------- ŒIL DES ABYSSES : grand œil violet flottant, tentacules
M.abyssEye = (c) => {
  const chair = tones('#7a3fb0'), tent = tones('#5a2a8a');
  c.glow(120, 110, 112, '#b05cff', 0.5);
  for (const [x1, x2, x3] of [[86, 64, 46], [106, 100, 86], [134, 140, 156], [154, 176, 196]]) {
    c.piece(P(`M${x1 - 9} 150C${x2 - 12} 180 ${x3 - 12} 196 ${x3} 222C${x3 + 8} 202 ${x2 + 10} 184 ${x1 + 9} 150Z`), tent);
  }
  c.piece(E(120, 110, 70, 64), chair, { gloss: true });                                        // globe
  c.piece(E(124, 112, 46, 40), { L: '#ffffff', B: '#f6eefe', S: '#d9c8ef', D: '#b9a2dc' }, { sw: 2.5, light: false });   // blanc
  const g = c.grad([[0, '#2a0a3a'], [0.5, '#d4302a'], [1, '#ffd34a']]);
  c.raw(`<circle cx="130" cy="114" r="26" fill="${g}" stroke="#1b1530" stroke-width="2"/><ellipse cx="130" cy="114" rx="7" ry="20" fill="#1b1530"/><circle cx="120" cy="104" r="7" fill="#ffffff"/><circle cx="140" cy="126" r="3" fill="#ffffff"/>`);
  c.piece(P('M58 92C76 54 168 50 188 92C176 76 152 66 122 66C94 66 72 76 58 92Z'), tones('#5a2a8a'), { light: false });   // paupière
  for (const [x, y] of [[70, 68], [92, 52], [148, 50], [176, 66]]) c.raw(`<path d="M${x} ${y}l-4 -12l9 6z" fill="#e8dcc0" stroke="#1b1530" stroke-width="2"/>`);
  c.spark(210, 52, 7); c.spark(30, 140, 5);
};

// ---------- ÉPOUVANTAIL (entraînement)
M.scarecrow = (c) => {
  const paille = tones('#e8c25a'), toile = tones('#c9a46a'), bois = tones('#9a6234'), chapeau = tones('#7a5a3a'), chemise = tones('#c0392b');
  c.piece(CAP(120, 120, 120, 224, 7), bois);
  c.piece(CAP(52, 124, 188, 124, 7), bois);
  c.piece(P('M88 176C84 146 94 118 120 116C146 118 156 146 152 176C138 184 102 184 88 176Z'), chemise, { gloss: true });
  c.line('M100 130L140 170M140 130L100 170', '#8e2228', 2.4, 0.5);
  for (const [x, y, a] of [[50, 124, -1], [190, 124, 1]]) c.piece(P(`M${x} ${y - 8}L${x + a * 14} ${y - 12}L${x + a * 16} ${y}L${x + a * 14} ${y + 12}L${x} ${y + 8}Z`), paille, { sw: 2.2 });
  c.piece(P('M104 176L98 196L108 190L114 200L120 188L128 200L132 188L142 194L138 176Z'), paille, { sw: 2.2 });
  c.piece(E(120, 84, 34, 32), toile, { gloss: true });
  c.line('M100 100Q120 112 140 100', '#5a3a22', 2.5); c.line('M106 98L104 106M114 102L113 110M124 102L125 110M134 98L136 106', '#5a3a22', 1.8);
  c.raw('<path d="M100 76l10 8M110 76l-10 8M130 76l10 8M140 76l-10 8" stroke="#1b1530" stroke-width="3"/>');
  c.piece(P('M74 64C84 60 156 60 168 64C160 72 82 72 74 64Z'), chapeau); c.piece(P('M94 64C94 40 104 30 120 30C138 30 148 42 146 64Z'), chapeau, { gloss: true });
  c.piece(P('M94 58C110 62 132 62 146 58L146 64C130 68 110 68 94 64Z'), tones('#c0392b'), { sw: 2 });
};

// ---------- BOSS DU RAID : hommes et femmes politiques, en caricature chibi (costume, grosse tête)
function politician(c, o) {
  const suit = tones(o.suit), pant = tones(o.pants || o.suit), skin = tones(o.skin || '#fdd2ad'), shirt = tones('#f4f6ff', 0.5), tie = tones(o.tie || '#d4202c');
  if (o.aura) c.glow(120, 110, 115, o.aura, 0.5);
  c.piece(CAP(106, 178, 102, 212, 11), pant); c.piece(CAP(134, 178, 138, 212, 11), pant);
  c.piece(E(98, 218, 16, 8), tones('#2b2440')); c.piece(E(144, 218, 17, 8), tones('#2b2440'));
  c.piece(CAP(94, 136, 80, 172, 10), suit); c.piece(E(80, 178, 9, 9), skin);               // bras lointain
  c.piece(P('M84 190C80 150 92 124 122 120C152 124 162 150 158 190C142 198 100 198 84 190Z'), suit, { gloss: true });   // veste
  c.piece(P('M108 124L122 158L136 124Z'), shirt, { sw: 2 });
  if (o.tie !== null) c.piece(P('M118 126L126 126L129 152L122 160L115 152Z'), tie, { sw: 2 });
  c.line('M108 124L118 150M136 124L126 150', '#1b1530', 2);
  if (o.arm === 'fist') { c.piece(CAP(150, 130, 176, 80, 10, 9), suit); c.piece(E(178, 72, 12, 12), skin); c.line('M172 70L184 70M172 76L184 76', '#c8705c', 1.6); }
  else if (o.arm === 'point') { c.piece(CAP(150, 132, 192, 116, 10, 9), suit); c.piece(E(196, 114, 9, 8), skin); c.piece(CAP(200, 112, 214, 108, 3), skin); }
  else if (o.arm === 'bolt') { c.piece(CAP(150, 132, 176, 96, 10, 9), suit); c.piece(P('M186 40L166 88L180 88L170 124L204 70L188 70L200 40Z'), { L: '#fff7c4', B: '#ffe168', S: '#f7bc2a', D: '#cd7e15' }, { sw: 2.5 }); c.piece(E(176, 92, 10, 10), skin); }
  else { c.piece(CAP(150, 134, 164, 170, 10), suit); c.piece(E(166, 176, 9, 9), skin); }
  c.piece(E(122, 82, 46, 44), skin, { gloss: true, shade: 0.5 });                             // tête (ombre légère : visage lisible)
  if (o.hairBack) c.piece(P(o.hairBack), tones(o.hair));
  c.piece(E(78, 88, 8, 11), skin, { light: false });                                          // oreille
  if (o.hairTop) c.piece(P(o.hairTop), tones(o.hair), { gloss: true });
  c.eye(108, 86, 10, 11, o.iris || IRIS.bleu); c.eye(140, 86, 8, 10, o.iris || IRIS.bleu);
  if (o.glasses) c.raw(`<g fill="none" stroke="${o.glasses}" stroke-width="3"><rect x="95" y="74" width="26" height="22" rx="${o.round ? 11 : 4}"/><rect x="129" y="75" width="22" height="20" rx="${o.round ? 10 : 4}"/><path d="M121 84L129 84M95 82L84 80"/></g>`);
  c.brow(96, 70, 118, 74 + (o.browTilt || 0), o.browCol || '#3a2114'); c.brow(130, 74 + (o.browTilt || 0), 150, 70, o.browCol || '#3a2114');
  c.piece(E(128, 100, 6, 5), tones('#eea07e'), { light: false, sw: 2 });                      // nez
  if (o.mouth === 'shout') c.mouth(108, 110, 30, 14, { teeth: 3, fangs: false });
  else c.line(`M110 ${114}Q124 ${o.mouth === 'smug' ? 120 : 124} 140 ${o.mouth === 'smug' ? 110 : 114}`, '#7a2433', 3.5);
  c.raw('<circle cx="98" cy="104" r="5" fill="#ff8b7e" opacity="0.4"/><circle cx="150" cy="104" r="4" fill="#ff8b7e" opacity="0.4"/>');
  if (o.crown) { c.piece(P('M92 40L88 14L106 28L122 6L138 28L156 14L152 40C132 46 112 46 92 40Z'), { L: '#fff7c4', B: '#f7bc2a', S: '#cd7e15', D: '#8f4c0a' }, { gloss: true }); c.raw('<circle cx="122" cy="30" r="4" fill="#e3343d" stroke="#1b1530" stroke-width="1.6"/>'); }
}

M.melenchon = (c) => politician(c, {
  suit: '#3a3f55', tie: '#d4202c', hair: '#dfe3ea', arm: 'fist', mouth: 'shout', glasses: '#1b1530', browCol: '#9aa3b2', browTilt: 4,
  hairBack: 'M76 92C72 70 80 56 92 52C86 66 86 80 90 96Z', hairTop: 'M152 50C164 58 170 72 168 92C162 80 156 66 146 58Z',
});
M.hollande = (c) => politician(c, {
  suit: '#2b3150', tie: '#3d6bd4', hair: '#5a4632', arm: 'down', mouth: 'smile', glasses: '#8a95b2', round: true,
  hairBack: 'M76 94C72 72 80 58 90 52C84 66 84 82 88 98Z', hairTop: 'M150 52C162 58 168 74 166 92C160 80 154 68 144 60Z',
});
M.sarkozy = (c) => politician(c, {
  suit: '#2e3346', tie: '#2f5fd0', hair: '#3a2c22', arm: 'point', mouth: 'shout', browTilt: 5,
  hairTop: 'M76 74C76 46 98 34 124 34C150 34 170 48 168 72C156 58 140 52 124 54C106 54 88 60 76 74Z',
});
M.lepen = (c) => politician(c, {
  suit: '#203a7a', tie: null, hair: '#f2d27a', arm: 'down', mouth: 'smile', iris: IRIS.bleu, browCol: '#a8701a',
  hairBack: 'M70 120C62 80 74 44 110 38C150 34 176 58 172 120C164 108 160 92 160 80C140 74 110 72 86 80C84 96 80 110 70 120Z',
  hairTop: 'M78 78C80 50 100 38 124 38C148 38 166 52 166 76C150 66 132 60 120 62C104 62 90 68 78 78Z',
});
M.macron = (c) => politician(c, {
  suit: '#1f2b5a', tie: '#2f5fd0', hair: '#5a3a24', arm: 'bolt', mouth: 'smug', aura: '#ffd84a', crown: true,
  hairTop: 'M78 76C78 50 98 36 124 36C152 36 170 52 166 76C154 60 134 54 116 58C104 56 90 64 78 76Z',
});

module.exports = M;
if (require.main === module) {
  const only = process.argv.slice(2);
  for (const [id, draw] of Object.entries(M)) {
    if (only.length && !only.includes(id)) continue;
    const c = creature('mo' + id.slice(0, 3));
    draw(c);
    const b = c.write(path.join(OUT, id + '.svg'), id);
    console.log(id.padEnd(12), (b / 1024).toFixed(1) + ' Ko');
  }
}
