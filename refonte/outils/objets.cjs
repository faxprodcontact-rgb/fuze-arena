// Objets, familiers et sorts de la refonte, dans le style des icônes (voir icones-kit.cjs).
// node refonte/outils/objets.cjs
// Écrit 3 paquets lus par le jeu : art/objets.json, art/familiers.json, art/sorts.json ({ id: "<svg…>" }).
// Les couleurs de chaque objet viennent de js/data.js (ITEMS[id].colors = [principale, accent]).
const { fs, path, ROOT, O, r1, T, P, E, RR, poly, star, spark4, Icon, mixc, tn } = require('./icones-kit.cjs');

const SKIN = T.skin, WHITE = T.white, STEEL = T.steel, GOLD = T.gold, WOOD = T.wood;
const W = '#ffffff';
// tons d'une couleur, avec un blanc qui reste blanc et un noir qui reste lisible
const tc = (c) => {
  const h = c.toLowerCase();
  if (['#ffffff', '#f4f4f8', '#f4f8fc', '#e8eef5', '#e8e8ee', '#f4f6fb'].includes(h)) return ['#ffffff', h === '#ffffff' ? '#f4f6fb' : h, '#cdd3e2', '#9aa2bd'];
  const n = parseInt(h.slice(1), 16), lum = ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11);
  if (lum < 70) return [mixc(h, 0.45, '#ffffff'), mixc(h, 0.12, '#ffffff'), mixc(h, 0.3, '#000000'), mixc(h, 0.55, '#000000')];
  return tn(h);
};
const chainV = (I, col, w = 2.6) => I.rope('M13 3C14 20 23 28 32 30C41 28 50 20 51 3', col, w, mixc(col, 0.5, '#ffffff'));
// enveloppe dans un groupe transformé tout ce qui a été dessiné depuis i0
const wrap = (I, i0, tr) => { const part = I.body.splice(i0); I.body.push(`<g transform="${tr}">${part.join('')}</g>`); };

// ---------------------------------------------------------------- silhouettes communes
const TSHIRT = 'M20 8L26 6C28 11 36 11 38 6L44 8L58 18L52 30L46 27L46 56C46 58 44 60 42 60L22 60C20 60 18 58 18 56L18 27L12 30L6 18Z';
const SWEATER = 'M20 8L26 6C28 11 36 11 38 6L44 8L54 14L60 46L50 48L46 28L46 56C46 58 44 60 42 60L22 60C20 60 18 58 18 56L18 28L14 48L4 46L10 14Z';
const BOOT = 'M18 6L36 6L36 34L50 40C56 42 58 50 54 53L14 53C12 53 11 51 12 49L16 34Z';
const SNEAKER = 'M6 42C6 32 12 27 20 27L30 27C36 33 44 35 52 35C58 35 60 41 58 46L6 46Z';

// ---------------------------------------------------------------- objets (forme → dessin), m = principale, a = accent
const SHAPES = {
  // ----- chapeaux
  ponytail(I, m, a) {
    I.vol(E(28, 38, 15, 14), SKIN);
    I.flat(E(22, 40, 1.8, 2.4), O, 0);
    I.vol(P('M48 24C58 24 62 36 58 48C56 55 51 57 49 53C53 45 52 36 46 31Z'), tc(m));
    I.vol(P('M12 40C9 22 19 10 33 10C45 10 52 19 51 31C46 27 40 26 33 28C26 30 18 36 12 40Z'), tc(m));
    I.vol(E(50, 28, 5, 5.5), tc(a), { k: 1.6, gloss: false });
  },
  bald(I) {
    I.vol(E(11, 36, 4.5, 6.5), SKIN, { hl: false, k: 1.4 }); I.vol(E(53, 36, 4.5, 6.5), SKIN, { hl: false, k: 1.4 });
    I.vol(E(32, 33, 20, 22), SKIN);
    I.line('M21 36q4.5 3 9 0M34 36q4.5 3 9 0', O, 2.2); I.line('M26 46q6 4 12 0', '#c8705c', 2.4);
    I.raw(`<ellipse cx="20" cy="42" rx="4" ry="2.4" fill="#ff8b7e" opacity="0.55"/><ellipse cx="44" cy="42" rx="4" ry="2.4" fill="#ff8b7e" opacity="0.55"/>`);
    I.spark(24, 14, 4);
  },
  toque(I, m, a) {
    I.vol(P('M14 34C7 26 13 12 24 16C26 6 38 6 40 16C51 12 57 26 50 34L48 42L16 42Z'), tc(m));
    I.line('M24 22C25 28 25 34 24 40M40 22C39 28 39 34 40 40', '#cdd3e2', 2);
    I.vol(RR(15, 40, 34, 14, 3), tc(a), { hl: false });
  },
  glasses(I, m) {
    I.rope('M10 30L3 26M54 30L61 26', m, 2.6);
    I.rope('M28 31C30 27 34 27 36 31', m, 2.6);
    for (const x of [19, 45]) { I.vol(E(x, 33, 11, 9.5), tc(m)); I.flat(E(x, 33, 7.8, 6.5), '#bfe8ff', 1.4); I.raw(`<path d="M${x - 5} ${31}l4 -3" stroke="#ffffff" stroke-width="2.2"/>`); }
  },
  halo(I, m) {
    I.rope('M5 36A27 10 0 1 0 59 36A27 10 0 1 0 5 36Z', m, 6, '#fff7c4');
    I.spark(10, 16, 4.5); I.spark(52, 14, 5.5); I.spark(32, 54, 3.5);
  },
  cap(I, m, a) {
    I.vol(P('M42 34C52 34 61 38 61 44C55 47 45 45 38 42Z'), tc(mixc(m, 0.15, '#1b1530')), { hl: false, k: 1.6 });
    I.vol(P('M9 42C9 25 18 14 31 14C44 14 51 25 51 40Z'), tc(m));
    I.vol(E(30, 30, 5.5), tc(a), { k: 1.4, gloss: false });
    I.vol(E(31, 14, 3.2), tc(a), { hl: false, k: 1 });
  },
  gel(I, m) {
    I.vol(E(32, 40, 17, 16), SKIN);
    for (const x of [25, 39]) I.flat(E(x, 42, 2, 2.6), O, 0);
    I.line('M27 50q5 3 10 0', '#c8705c', 2.2);
    I.vol(P('M13 38L11 22L18 26L19 13L26 21L30 8L35 19L41 8L43 21L49 13L48 26L54 22L51 38C44 31 22 31 13 38Z'), tc(m));
  },
  santa(I, m, a) {
    I.vol(P('M12 42C15 27 25 14 40 12C51 11 57 20 55 31C51 25 45 23 40 25C35 30 35 38 37 42Z'), tc(m));
    I.vol(E(55, 33, 6.5), tc(a), { k: 1.6 });
    I.vol(RR(6, 39, 42, 13, 6.5), tc(a));
  },
  hardhat(I, m) {
    I.vol(P('M10 44C10 26 20 15 32 15C44 15 54 26 54 44Z'), tc(m));
    I.vol(RR(28, 12, 8, 32, 4), tc(mixc(m, 0.25, '#ffffff')), { hl: false, dbl: false, sw: 1.8, k: 1.4 });
    I.vol(RR(4, 42, 56, 9, 4.5), tc(m), { hl: false });
  },
  headband(I, m, a) {
    I.vol(P('M50 36L60 42L56 52L48 42Z'), tc(m), { hl: false, k: 1.2 });
    I.rope('M6 32A26 11 0 1 0 58 32A26 11 0 1 0 6 32Z', tc(m)[1], 9, '#ffffff');
    I.raw(`<path d="M6.5 35A26 11 0 0 0 57.5 35" fill="none" stroke="${a}" stroke-width="3"/>`);
  },
  // ----- armes
  stick(I, m, a) { I.rope('M12 54L48 16', mixc(m, 0.05, '#cdd3e2'), 6, '#ffffff'); I.vol(E(50, 14, 6), tc(a), { k: 1.6 }); },
  knife(I, m, a) {
    I.vol(P('M29 35L52 8C56 5 59 8 56 12L35 39Z'), tc(m));
    I.line('M33 34L53 10', '#ffffff', 1.4);
    I.vol(P('M11 55L29 34L36 39L18 60C15 62 9 59 11 55Z'), tc(a), { hl: false });
    I.flat(E(20, 50, 1.6), '#c3cce0', 0); I.flat(E(25, 45, 1.6), '#c3cce0', 0);
  },
  jknife(I, m, a) {
    I.vol(P('M28 36L55 5L59 7L35 40Z'), tc(m));
    I.line('M31 36L56 7', '#ffffff', 1.2);
    I.vol(RR(25, 33, 12, 5, 2), GOLD, { hl: false, k: 1 });
    I.vol(P('M10 56L27 36L33 41L16 61C13 63 8 60 10 56Z'), tc(a), { hl: false });
  },
  bottle(I, m, a) {
    I.vol(P('M22 28C22 21 26 19 28 15L28 7L36 7L36 15C38 19 42 21 42 28L42 56C42 59 40 61 37 61L27 61C24 61 22 59 22 56Z'), tc(m));
    I.vol(RR(26.5, 4, 11, 10, 2.5), tc(a), { hl: false, k: 1.4 });
    I.vol(RR(24, 34, 16, 15, 2.5), ['#ffffff', '#f3ecd8', '#cdbf9e', '#9c8a68'], { hl: false, dbl: false, sw: 1.6, k: 1.4 });
    I.flat(E(32, 41.5, 3.4), a, 1.2);
  },
  fist(I, m, a) {
    I.vol(RR(18, 53, 28, 8, 3), tc(a), { hl: false, k: 1.4 });
    I.vol(RR(12, 22, 40, 34, 10), tc(m));
    for (let i = 0; i < 4; i++) I.vol(RR(13 + i * 9.5, 12, 10, 20, 5), tc(m), { k: 2, gloss: false });
    I.vol(P('M10 38C10 31 16 29 23 31L38 34C43 35 43 42 38 43L21 44C14 44 10 43 10 38Z'), tc(m), { k: 2 });
  },
  karambit(I, m, a) {
    I.vol(P('M27 36C15 30 12 14 24 6C22 16 26 26 35 30Z'), tc(m));
    I.line('M25 31C18 25 17 16 22 10', '#ffffff', 1.4);
    I.vol(P('M27 33L36 28L46 43L38 49Z'), tc(a), { hl: false });
    I.line('M33 35L37 33M37 41L41 39', tc(a)[0], 1.8);
    I.rope('M46 52a4.5 4.5 0 1 0 0.1 0', '#c3cce0', 3);
  },
  bigarm(I, m) {
    I.vol(P('M6 56C8 44 16 40 25 41C24 31 27 20 35 14C42 9 51 11 53 18C55 26 49 31 44 31C42 35 41 41 41 47C41 55 35 59 26 59L6 59Z'), tc(m));
    I.line('M28 41C31 36 36 34 40 36M35 15C38 17 39 21 38 24', mixc(m, 0.4, '#1b1530'), 1.8);
    I.spark(55, 40, 4.5);
  },
  hookah(I, m, a) {
    I.rope('M41 32C54 31 58 42 52 52', '#3a3046', 3);
    I.vol(RR(28, 20, 8, 20, 2.5), tc(a), { hl: false, k: 1.4 });
    I.vol(P('M22 20L42 20L37 11L27 11Z'), tc(a), { k: 1.6 });
    I.vol(E(32, 47, 15, 13), tc(m));
    I.raw(`<path d="M30 8C26 4 34 2 30 -2" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.7"/>`);
  },
  camera(I, m, a) {
    I.vol(RR(18, 13, 14, 9, 2), tc(m), { hl: false, k: 1.4 });
    I.vol(RR(7, 19, 50, 34, 7), tc(m));
    I.vol(E(34, 36, 12), tc(a), { k: 2 });
    I.flat(E(34, 36, 7), '#241c3a', 1.6); I.flat(E(31.5, 33.5, 2.2), '#ffffff', 0);
    I.flat(RR(44, 23, 9, 5, 1.5), '#ffffff', 1.4);
  },
  spatula(I, m, a) {
    I.rope('M12 56L34 31', m, 5.5, mixc(m, 0.4, '#ffffff'));
    I.vol(P('M32 33L43 15C47 9 57 11 56 18L52 30C50 35 42 37 37 37Z'), tc(m));
    I.line('M42 22L48 30M46 18L52 26', tc(m)[3], 2.2);
    I.flat(E(13, 55, 3.5), tc(a)[1], 1.4);
  },
  trowel(I, m, a) {
    I.vol(P('M41 5L57 21L41 37L25 21Z'), tc(m));
    I.line('M41 9L41 33', '#ffffff', 1.2);
    I.rope('M35 31L25 42', '#9ba7c3', 3);
    I.vol(P('M24 40L13 52C10 56 15 61 19 57L30 46Z'), tc(a), { hl: false });
  },
  fries(I, m, a) {
    for (const [x, y, h] of [[17, 8, 26], [23, 4, 28], [29, 7, 26], [35, 3, 28], [41, 8, 26], [46, 11, 22]]) I.vol(RR(x, y, 5.5, h, 2), tc(a), { hl: false, k: 1.2, gloss: false });
    I.vol(P('M12 27L52 27L47 60L17 60Z'), tc(m));
    I.rope('M24 50V40C24 34 31 34 32 41C33 34 40 34 40 40V50', a, 3);
  },
  ball(I, m, a) {
    I.vol(E(32, 32, 25), tc(m));
    I.flat(star(32, 32, 5, 9, 7.5), tc(a)[2], 1.6);
    I.flat(P('M12 18L19 20L18 28L9 29C9 25 10 21 12 18Z'), tc(a)[2], 1.4); I.flat(P('M52 18L45 20L46 28L55 29C55 25 54 21 52 18Z'), tc(a)[2], 1.4);
    I.flat(P('M24 52L28 46L36 46L40 52C36 56 28 56 24 52Z'), tc(a)[2], 1.4);
  },
  // ----- armures
  sweater(I, m, a) {
    I.vol(P(SWEATER), tc(m));
    I.vol(RR(24, 24, 16, 4.5, 2), tc(a), { hl: false, dbl: false, sw: 1.4, k: 1 }); I.vol(RR(24, 31, 16, 4.5, 2), tc(a), { hl: false, dbl: false, sw: 1.4, k: 1 });
    I.line('M5 44L13 46M51 46L59 44M19 56H45', tc(m)[3], 2);
  },
  torso(I, m) {
    I.vol(P('M13 10C20 5 44 5 51 10L55 26C55 41 49 53 45 59L19 59C15 53 9 41 9 26Z'), tc(m));
    I.line('M19 26C24 31 29 31 31 27M45 26C40 31 35 31 33 27M32 30V52M25 38H39M26 45H38', mixc(m, 0.42, '#1b1530'), 2);
    I.flat(E(22, 30, 1.6), '#c8705c', 0); I.flat(E(42, 30, 1.6), '#c8705c', 0);
  },
  leather(I, m, a) {
    I.vol(P(SWEATER), tc(m));
    I.vol(P('M26 6L32 21L38 6L45 9L37 28L32 23L27 28L19 9Z'), tc(mixc(m, 0.2, '#ffffff')), { k: 1.6 });
    I.line('M32 24V58', a, 2.4); I.flat(RR(21, 36, 8, 6, 1.5), tc(m)[2], 1.4);
  },
  toga(I, m, a) {
    I.vol(P('M16 8C26 12 38 12 48 8L53 30C49 44 47 54 45 60L19 60C17 50 15 40 12 30Z'), tc(m));
    I.line('M24 30C24 40 26 50 26 58M38 34C37 44 38 52 40 58', '#cdd3e2', 2);
    I.rope('M18 10C26 26 36 44 44 58', a, 3.5, '#fff7c4');
  },
  jacket(I, m, a) {
    I.vol(P(SWEATER), tc(m));
    I.line('M32 10V58', tc(m)[3], 2.2);
    I.flat(RR(20, 34, 9, 7, 1.5), tc(m)[2], 1.4); I.flat(RR(35, 34, 9, 7, 1.5), tc(m)[2], 1.4);
    I.flat(E(25, 22, 2.6), a, 1.2);
  },
  tshirt(I, m) {
    I.vol(P(TSHIRT), tc(m));
    I.flat(RR(25, 30, 14, 10, 4), '#cdd3e2', 0);
  },
  sportbag(I, m, a) {
    I.rope('M21 24C21 11 43 11 43 24', a, 4);
    I.vol(RR(7, 22, 50, 32, 11), tc(m));
    I.flat(RR(7, 34, 50, 7, 0), a, 1.4); I.line('M14 28H50', mixc(m, 0.4, '#1b1530'), 1.6);
  },
  gimbal(I, m, a) {
    I.vol(RR(14, 6, 36, 11, 3.5), tc(a));
    I.rope('M32 17V24C32 30 40 30 40 24', m, 4);
    I.vol(RR(25, 30, 14, 30, 6), tc(m));
    I.flat(E(32, 42, 3), a, 1.2);
  },
  apron(I, m, a) {
    I.rope('M22 11C22 2 42 2 42 11', mixc(m, 0.2, '#1b1530'), 2.6);
    I.vol(P('M20 10L44 10L44 22L54 26L50 59L14 59L10 26L20 22Z'), tc(m));
    I.flat(RR(23, 39, 18, 11, 2), tc(m)[2], 1.4);
    I.vol(E(32, 28, 4.5), tc(a), { k: 1, gloss: false });
  },
  armor(I, m, a) {
    I.vol(P('M20 6L28 6C28 13 36 13 36 6L44 6L52 18L50 59L14 59L12 18Z'), tc(m));
    I.flat(RR(13, 38, 38, 5, 0), a, 1.4); I.flat(RR(13, 47, 38, 5, 0), a, 1.4);
    I.line('M32 13V59', tc(m)[3], 1.8);
  },
  mcshirt(I, m, a) { I.vol(P(TSHIRT), tc(m)); I.rope('M22 44V32C22 25 30 25 32 33C34 25 42 25 42 32V44', a, 3.5); },
  jersey(I, m, a) {
    I.vol(P(TSHIRT), tc(m));
    I.raw(`<path d="M26 7C28 12 36 12 38 7" stroke="${a}" stroke-width="2.6" fill="none"/>`);
    I.rope('M23 30L27 27V45', a, 2.6); I.rope('M37 30a4.8 7.6 0 1 0 0.1 0', a, 2.6);
  },
  // ----- bottes
  boots(I, m, a) { I.vol(P(BOOT), tc(m)); I.vol(RR(15, 4, 24, 8, 3), tc(a), { hl: false, k: 1.4 }); I.vol(RR(10, 50, 47, 7, 3), tc(mixc(a, 0.4, '#1b1530')), { hl: false, k: 1 }); },
  chunky(I, m, a) {
    I.vol(P('M8 36C8 29 12 25 18 25L30 25C36 31 44 33 52 33C58 33 60 39 58 44L8 44Z'), tc(m));
    I.vol(RR(6, 42, 54, 13, 5), WHITE, { hl: false });
    I.raw(`<path d="M8 49Q13 45 18 49T28 49T38 49T48 49T58 49" stroke="${a}" stroke-width="2.6" fill="none"/>`);
    I.line('M24 28L28 34M30 28L34 33', tc(m)[3], 1.8);
  },
  sneaker(I, m, a) {
    I.vol(P(SNEAKER), tc(m));
    I.vol(RR(4, 44, 56, 8, 4), WHITE, { hl: false, k: 1.2 });
    I.rope('M16 41C27 43 38 39 47 35', a, 3);
    I.line('M24 30L27 35M30 30L33 35', tc(m)[3], 1.8);
  },
  nb(I, m, a) { SHAPES.sneaker(I, m, mixc(m, 0.2, '#1b1530')); I.rope('M24 42V33L32 42V33', a, 3); },
  birk(I, m, a) {
    I.vol(P('M6 47C6 41 14 39 24 41L48 41C56 41 60 45 58 49C56 53 50 53 44 53L14 53C8 53 6 51 6 47Z'), tc(m));
    I.rope('M16 41C18 31 30 31 32 41', a, 6); I.rope('M34 41C36 31 48 31 50 41', a, 6);
    I.flat(E(24, 34, 2), '#c3cce0', 1); I.flat(E(42, 34, 2), '#c3cce0', 1);
  },
  italian(I, m) {
    I.vol(P('M6 43C6 35 12 31 22 31L32 31C40 33 48 35 54 37C60 39 60 47 56 49L6 49Z'), tc(m));
    I.vol(RR(4, 47, 54, 5, 2.5), tc(mixc(m, 0.4, '#1b1530')), { hl: false, k: 1 });
    I.rope('M30 34C34 38 40 38 44 36', mixc(m, 0.35, '#1b1530'), 2.4); I.flat(E(37, 38, 2), '#f7bc2a', 1);
  },
  rug(I, m, a) {
    I.line('M10 14V50M14 14V50M50 14V50M54 14V50'.replace(/M(\d+) 14V50/g, (s, x) => `M${x} 10V54`), '#e8d8b0', 2);
    I.vol(RR(8, 12, 48, 40, 3), tc(m));
    I.raw(`<rect x="14" y="18" width="36" height="28" rx="2" fill="none" stroke="${a}" stroke-width="2.6"/>`);
    I.vol(P('M32 22L42 32L32 42L22 32Z'), tc(a), { k: 1.4, hl: false });
    for (const x of [6, 58]) I.line(`M${x} 16v4M${x} 24v4M${x} 32v4M${x} 40v4M${x} 48v2`, '#e8d8b0', 2);
  },
  crocs(I, m, a) {
    I.rope('M12 36C5 40 7 47 13 47', a, 3);
    I.vol(P('M6 46C6 35 14 28 25 28L37 28C47 28 58 34 58 44L58 49L6 49Z'), tc(m));
    for (const [x, y] of [[26, 34], [33, 33], [40, 35], [30, 40], [37, 41], [46, 39]]) I.flat(E(x, y, 1.9, 1.5), tc(m)[3], 0);
    I.vol(RR(4, 47, 56, 6, 3), tc(a), { hl: false, k: 1 });
  },
  cleats(I, m, a) {
    I.vol(P(SNEAKER), tc(m));
    I.vol(RR(4, 44, 56, 6, 3), tc(mixc(m, 0.35, '#1b1530')), { hl: false, k: 1 });
    for (const x of [10, 22, 40, 52]) I.flat(RR(x - 2.5, 49, 5, 6, 1.5), a, 1.3);
    I.line('M24 30L27 36M30 30L33 35M36 31L39 35', a, 2);
  },
  // ----- amulettes
  key(I, m, a) {
    chainV(I, a);
    I.vol(E(32, 36, 8), tc(m)); I.flat(E(32, 36, 3.4), '#241c3a', 1.2);
    I.vol(RR(30, 42, 4.5, 17, 2), tc(m), { hl: false, k: 1 });
    I.vol(RR(34, 50, 6, 3.5, 1), tc(m), { hl: false, k: 0.8, dbl: false, sw: 1.4 }); I.vol(RR(34, 55, 5, 3.5, 1), tc(m), { hl: false, k: 0.8, dbl: false, sw: 1.4 });
  },
  chain(I, m) {
    const d = 'M9 5C13 27 23 38 32 40C41 38 51 27 55 5';
    I.raw(`<path d="${d}" fill="none" stroke="${O}" stroke-width="12"/><path d="${d}" fill="none" stroke="${m}" stroke-width="7.5"/><path d="${d}" fill="none" stroke="${tc(m)[2]}" stroke-width="7.5" stroke-dasharray="1.6 5.2"/><path d="${d}" fill="none" stroke="${tc(m)[0]}" stroke-width="2" transform="translate(-0.8 -1)"/>`);
    I.spark(32, 50, 4.5);
  },
  talisman(I, m, a) { chainV(I, a); I.rope('M32 34a10 10 0 1 0 0.1 0', m, 8, tc(m)[0]); I.spark(46, 40, 3.5); },
  gram(I, m, a) {
    chainV(I, a);
    I.vol(RR(23, 31, 18, 24, 3), tc(m));
    I.line('M23 37H41', '#cdd3e2', 1.6);
  },
  rosary(I, m, a) {
    const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10, x = 12 + 40 * t, y = 6 + 30 * Math.sin(Math.PI * t); pts.push([x, y]); }
    for (const [x, y] of pts) I.vol(E(x, y, 3.2), tc(m), { hl: false, k: 0.8, gloss: false });
    I.vol(P('M30 38H34V44H40V48H34V60H30V48H24V44H30Z'), tc(a), { k: 1.2 });
  },
  amulet(I, m, a) {
    chainV(I, a);
    I.vol(RR(28, 27, 8, 6, 2), STEEL, { hl: false, k: 1 });
    I.vol(P('M32 32C40 38 44 44 44 49C44 55 38 59 32 59C26 59 20 55 20 49C20 44 24 38 32 32Z'), tc(m));
  },
  judas(I, m, a) {
    chainV(I, a);
    I.vol(E(32, 44, 13), tc(m));
    I.flat(E(32, 44, 7.5), '#bfe8ff', 1.6); I.raw(`<path d="M28 41l3 -3" stroke="#ffffff" stroke-width="2.2"/>`);
  },
  spot(I, m, a) {
    chainV(I, a);
    I.raw(`<path d="M22 44L10 60L54 60L42 44Z" fill="#fff3a0" opacity="0.55"/>`);
    I.vol(P('M18 46C18 35 24 29 32 29C40 29 46 35 46 46Z'), tc(m));
    I.flat(RR(18, 44, 28, 4, 2), '#fff3a0', 1.4);
  },
  burger(I, m, a) {
    chainV(I, a);
    I.vol(P('M16 50C16 46 18 45 20 45L44 45C46 45 48 46 48 50C48 54 46 56 42 56L22 56C18 56 16 54 16 50Z'), ['#ffd8a0', '#e0a050', '#b8762e', '#7a4a1a'], { hl: false, k: 1 });
    I.vol(RR(15, 42, 34, 5, 2.5), ['#9a6040', '#6a3a24', '#4a2414', '#2e1408'], { hl: false, k: 0.8 });
    I.raw(`<path d="M14 42L20 39L26 42L32 39L38 42L44 39L50 42Z" fill="${m}" stroke="${O}" stroke-width="1.4"/><path d="M14 40Q20 36 26 40T38 40T50 40" stroke="#4ea83c" stroke-width="3" fill="none"/>`);
    I.vol(P('M16 38C16 30 23 26 32 26C41 26 48 30 48 38Z'), ['#ffd8a0', '#e0a050', '#b8762e', '#7a4a1a'], { k: 1.6 });
    for (const [x, y] of [[25, 31], [32, 29], [39, 31]]) I.flat(E(x, y, 1.2, 0.8), '#fff3d0', 0);
  },
  gaiter(I, m, a) {
    I.vol(RR(9, 20, 46, 26, 11), tc(m));
    for (const [x, y] of [[20, 29], [34, 29], [20, 37], [34, 37]]) I.flat(RR(x, y, 10, 4, 2), a, 1.2);
  },
  medal(I, m, a) {
    I.vol(P('M18 3L30 3L35 22L26 26Z'), tc(a), { hl: false, k: 1.4 });
    I.vol(P('M46 3L34 3L29 22L38 26Z'), tc(a), { hl: false, k: 1.4 });
    I.vol(E(32, 40, 17), tc(m));
    I.raw(`<path d="${star(32, 40, 5, 8, 3.5).d}" fill="${tc(m)[0]}" stroke="${tc(m)[3]}" stroke-width="1.4"/>`);
  },
};

// ---------------------------------------------------------------- panoplies élémentaires (feu, glace, lumière, ténèbres)
// déplace et agrandit un tracé absolu (commandes M C L Q Z) : (x, y) = nouvelle origine, s = échelle
const tp = (d, x, y, s = 1) => d.replace(/(-?\d*\.?\d+)\s+(-?\d*\.?\d+)/g, (m, a, b) => `${r1(x + a * s)} ${r1(y + b * s)}`);
const FIRE = ['#fff3a0', '#ff9a1a', '#e8460e', '#a01a06'], ICE = ['#ffffff', '#bfeaff', '#5ab4ff', '#2a6ad0'];
const SUN = ['#fffbe0', '#ffd23a', '#e8a412', '#a86a06'], VOID = ['#d6b8ff', '#7a30b0', '#4a1a78', '#22093e'];
const ROCK = ['#7a5e58', '#4a3a3e', '#2c2228', '#1a1014'], SHADE = ['#6a5a86', '#3c2a5a', '#2a1e3a', '#160e22'];
const FL = 'M-8 0C-12 -6 -10 -14 -6 -18C-5 -13 -3 -11 -2 -13C-4 -20 0 -28 6 -32C4 -24 9 -20 10 -14C11 -18 13 -19 14 -22C17 -14 15 -4 8 0Z';
const FL_IN = 'M-4 0C-6 -5 -4 -10 -1 -13C0 -9 3 -8 4 -10C5 -6 6 -2 3 0Z';
const flame = (I, x, y, s = 1) => { I.vol(P(tp(FL, x, y, s)), FIRE, { k: 2 * s, gloss: false, dw: 2 + 3 * s }); I.flat(P(tp(FL_IN, x, y, s)), '#fff3a0', 0); };
const crystal = (I, x, y, h, w, t = ICE) => { I.vol(P(`M${x} ${y}L${x - w} ${y - h * 0.35}L${x} ${y - h}L${x + w} ${y - h * 0.35}Z`), t, { k: 1.6, gloss: false }); I.line(`M${x} ${y - h}L${x} ${y}`, '#ffffff', 1.2); };
const sunDisc = (I, x, y, r) => {
  I.glow(x, y, r * 2.2, '#ffd23a', 0.7);
  I.raw(`<path d="${star(x, y, 8, r * 1.65, r * 1.05).d}" fill="#ffd23a" stroke="${O}" stroke-width="1.8"/>`);
  I.vol(E(x, y, r), SUN, { k: 1.4 });
};
Object.assign(SHAPES, {
  // ----- feu
  firehelm(I, m, a) {
    flame(I, 30, 20, 0.85); flame(I, 22, 22, 0.55); flame(I, 40, 22, 0.6);
    I.vol(P('M14 56L14 36C14 24 22 16 32 16C42 16 50 24 50 36L50 56Z'), ROCK);
    I.flat(RR(18, 34, 28, 7, 3), '#2a0a06', 1.6); I.glow(32, 37, 14, '#ff7a1a', 0.8); I.flat(RR(21, 36, 22, 3, 1.5), '#ffb02e', 0);
    I.line('M32 18V32M18 46H46', '#ff7a1a', 1.6);
  },
  flameblade(I, m, a) {
    const i0 = I.body.length;
    I.glow(32, 26, 16, '#ff7a1a', 0.6);
    I.vol(P('M28 46L36 46L36 16L32 4L28 16Z'), FIRE, { k: 1.4 });
    I.line('M32 8V44', '#fff3a0', 1.4);
    flame(I, 37, 38, 0.32); flame(I, 27, 28, 0.28); flame(I, 37, 20, 0.26);
    I.vol(RR(20, 45, 24, 5, 2.5), ROCK, { hl: false, k: 1 });
    I.vol(RR(29, 50, 6, 10, 2), ROCK, { hl: false, k: 1 }); I.vol(E(32, 61, 3.2), FIRE, { hl: false, k: 0.8 });
    wrap(I, i0, 'rotate(40 32 34) translate(0 -1)');
  },
  lavaplate(I, m, a) {
    I.vol(P('M20 6L28 6C28 13 36 13 36 6L44 6L52 18L50 59L14 59L12 18Z'), ROCK);
    I.glow(32, 38, 20, '#ff5a1a', 0.55);
    I.rope('M20 22L26 30L22 40L30 48L26 58M44 22L38 30L42 38L36 46L40 58M32 14L34 26L30 34', '#ff9a1a', 1.8, '#fff3a0');
    flame(I, 12, 22, 0.4); flame(I, 52, 22, 0.4);
  },
  emberboots(I, m, a) {
    I.vol(P(BOOT), ROCK);
    I.vol(RR(15, 4, 24, 8, 3), FIRE, { hl: false, k: 1.4 });
    I.vol(RR(10, 50, 47, 7, 3), FIRE, { hl: false, k: 1 });
    I.rope('M22 20L28 26L24 34', '#ff7a1a', 1.4);
    flame(I, 16, 50, 0.42); flame(I, 26, 50, 0.32); flame(I, 46, 50, 0.3);
  },
  flameheart(I, m, a) {
    chainV(I, '#c9a227');
    I.glow(32, 44, 20, '#ff5a1a', 0.7);
    I.vol(P('M32 59C24 52 16 46 16 38C16 32 21 28 26 28C29 28 31 30 32 32C33 30 35 28 38 28C43 28 48 32 48 38C48 46 40 52 32 59Z'), ['#ff8a7a', '#e3343d', '#a81d35', '#6e1129']);
    flame(I, 32, 50, 0.45);
  },
  // ----- glace
  icecrown(I, m, a) {
    crystal(I, 16, 40, 22, 6); crystal(I, 48, 40, 22, 6); crystal(I, 24, 38, 30, 7); crystal(I, 40, 38, 30, 7); crystal(I, 32, 38, 40, 8);
    I.vol(RR(10, 38, 44, 14, 5), ['#ffffff', '#c3cce0', '#8fa6c8', '#5a6e96']);
    for (const x of [18, 32, 46]) I.vol(E(x, 45, 3.4), ICE, { hl: false, k: 0.8, gloss: false });
    I.spark(52, 18, 3.5);
  },
  icespear(I, m, a) {
    const i0 = I.body.length;
    I.rope('M32 62V22', '#5a6e96', 3.6, '#c3cce0');
    I.rope('M32 40V44M32 50V54', '#bfeaff', 3.6);
    crystal(I, 32, 26, 24, 7); crystal(I, 24, 26, 10, 3.5); crystal(I, 40, 26, 10, 3.5);
    wrap(I, i0, 'rotate(40 32 34)');
    I.spark(50, 14, 3.5);
  },
  crystalplate(I, m, a) {
    I.vol(P('M20 6L28 6C28 13 36 13 36 6L44 6L52 18L50 59L14 59L12 18Z'), ICE);
    I.line('M14 22L32 32L50 22M32 32V58M18 44L32 50L46 44', '#ffffff', 1.4);
    crystal(I, 12, 22, 16, 4); crystal(I, 52, 22, 16, 4);
  },
  frostboots(I, m, a) {
    I.vol(P(BOOT), ['#9fd0ff', '#3773d8', '#23499c', '#162f6c']);
    I.vol(RR(14, 4, 26, 9, 4), ['#ffffff', '#f4f6fb', '#cdd3e2', '#9aa2bd'], { hl: false, k: 1.4 });
    crystal(I, 20, 6, 12, 3.5); crystal(I, 28, 5, 15, 4); crystal(I, 36, 6, 11, 3.5);
    I.vol(RR(10, 50, 47, 7, 3), ICE, { hl: false, k: 1 });
  },
  snowflake(I, m, a) {
    chainV(I, '#c9d1da');
    I.glow(32, 44, 18, '#7ad8ff', 0.7);
    const arms = [90, 150, 210].map(r => `M${r1(32 - 17 * Math.cos(r * Math.PI / 180))} ${r1(44 - 17 * Math.sin(r * Math.PI / 180))}L${r1(32 + 17 * Math.cos(r * Math.PI / 180))} ${r1(44 + 17 * Math.sin(r * Math.PI / 180))}`).join('');
    I.rope(arms, '#e8f8ff', 3, '#ffffff');
    const tips = [30, 90, 150, 210, 270, 330].map(r => { const c = Math.cos(r * Math.PI / 180), s = Math.sin(r * Math.PI / 180), x = 32 + 11 * c, y = 44 + 11 * s;
      return `M${r1(x - 5 * s + 4 * c)} ${r1(y + 5 * c + 4 * s)}L${r1(x)} ${r1(y)}L${r1(x + 5 * s + 4 * c)} ${r1(y - 5 * c + 4 * s)}`; }).join('');
    I.rope(tips, '#e8f8ff', 2);
    I.vol(E(32, 44, 3), ICE, { hl: false, k: 0.8, gloss: false });
  },
  // ----- lumière
  sundiadem(I, m, a) {
    sunDisc(I, 32, 26, 9);
    I.vol(P('M8 50C14 40 24 36 32 36C40 36 50 40 56 50L52 54C46 46 40 44 32 44C24 44 18 46 12 54Z'), SUN);
    for (const x of [18, 46]) I.vol(E(x, 46, 2.6), ['#ffffff', '#bfeaff', '#5ab4ff', '#2a6ad0'], { hl: false, k: 0.6, gloss: false });
    I.spark(52, 14, 3.5); I.spark(12, 20, 2.8);
  },
  sunscepter(I, m, a) {
    const i0 = I.body.length;
    I.rope('M32 62V28', '#e8a412', 4, '#fff3a0');
    I.vol(RR(26, 42, 12, 5, 2.5), SUN, { hl: false, k: 1 });
    wrap(I, i0, 'rotate(30 32 40)');
    sunDisc(I, 42, 20, 10);
  },
  celestrobe(I, m, a) {
    I.vol(P('M22 6L28 6C28 12 36 12 36 6L42 6L54 16L52 30L46 26L50 60L14 60L18 26L12 30L10 16Z'), ['#ffffff', '#fffaf0', '#e8dcc0', '#b8a680']);
    I.rope('M28 8L32 18L36 8M32 18V60', '#ffd23a', 2.2);
    I.rope('M16 56H48', '#ffd23a', 2.4);
    I.raw(`<path d="${star(24, 40, 4, 4, 1.4).d}" fill="#ffd23a" stroke="${O}" stroke-width="1.2"/><path d="${star(41, 48, 4, 3.4, 1.2).d}" fill="#ffd23a" stroke="${O}" stroke-width="1.2"/>`);
  },
  wingsandals(I, m, a) {
    I.vol(P('M4 30C10 22 18 18 22 20C18 24 18 28 20 30C14 30 10 32 6 34Z'), ['#ffffff', '#fffaf0', '#e8dcc0', '#b8a680'], { k: 1.4 });
    I.vol(P('M6 46C6 38 12 34 20 34L30 34C36 38 44 40 52 40C58 40 60 44 58 48L6 48Z'), ['#ffffff', '#fffaf0', '#e8dcc0', '#b8a680']);
    I.vol(RR(4, 47, 56, 6, 3), SUN, { hl: false, k: 1 });
    I.rope('M22 34L28 42M30 34L36 41M38 37L42 40', '#ffd23a', 2);
    I.spark(52, 26, 3.4);
  },
  sunamulet(I, m, a) { chainV(I, '#e5b33a'); sunDisc(I, 32, 44, 9); I.spark(50, 32, 3.2); },
  // ----- ténèbres
  shadowhood(I, m, a) {
    I.vol(P('M10 58C10 38 14 18 32 8C50 18 54 38 54 58L44 58C44 46 40 38 32 38C24 38 20 46 20 58Z'), SHADE);
    I.flat(P('M20 58C20 44 24 30 32 30C40 30 44 44 44 58Z'), '#0a0610', 1.6);
    for (const x of [27, 37]) { I.glow(x, 42, 6, '#c070ff', 0.9); I.flat(E(x, 42, 2.4, 1.6), '#e8b8ff', 0); }
    I.rope('M32 10C36 18 38 26 38 32', '#8a40c8', 1.4);
  },
  scythe(I, m, a) {
    I.rope('M16 60L44 8', '#3a2c4e', 3.6, '#6a5a86');
    I.vol(P('M42 10C30 4 14 8 6 22C16 16 28 16 38 20Z'), ['#e8e0ff', '#a898c8', '#6a5a86', '#3a2c4e'], { k: 1.6 });
    I.line('M38 16C28 12 18 14 10 19', '#c070ff', 1.4);
    I.vol(E(44, 9, 3.4), VOID, { hl: false, k: 0.8, gloss: false }); I.glow(44, 9, 7, '#c070ff', 0.8);
  },
  shadowcloak(I, m, a) {
    I.vol(P('M22 6L28 8C28 13 36 13 36 8L42 6L56 22L50 60L44 54L38 60L32 54L26 60L20 54L14 60L8 22Z'), SHADE);
    I.flat(P('M28 10C30 14 34 14 36 10L38 52L32 48L26 52Z'), '#5a2a8a', 1.4);
    I.vol(E(32, 16, 4), VOID, { hl: false, k: 0.8, gloss: false });
  },
  phantomboots(I, m, a) {
    I.raw(`<path d="M8 50C14 44 20 56 28 50C34 46 40 56 48 50C52 47 56 50 58 53" fill="none" stroke="#c070ff" stroke-width="5" opacity="0.45"/>`);
    I.vol(P(BOOT), SHADE);
    I.vol(RR(15, 4, 24, 8, 3), VOID, { hl: false, k: 1.4 });
    I.vol(RR(10, 50, 47, 7, 3), ['#6a5a86', '#2a1e3a', '#160e22', '#0a0610'], { hl: false, k: 1 });
    I.rope('M22 18L26 24L22 30', '#c070ff', 1.4);
  },
  voideye(I, m, a) {
    chainV(I, '#c9d1da');
    I.glow(32, 44, 18, '#8a20ff', 0.75);
    I.vol(P('M14 44C20 34 26 31 32 31C38 31 44 34 50 44C44 54 38 57 32 57C26 57 20 54 14 44Z'), ['#ffffff', '#e8e0f4', '#b8a6dc', '#7a62a0']);
    I.vol(E(32, 44, 8), VOID, { k: 1.4 }); I.flat(E(32, 44, 3, 5), '#0a0610', 0); I.flat(E(30, 41, 1.6), '#ffffff', 0);
  },
});

// ---------------------------------------------------------------- familiers (vus de face assis pour les chats, de profil vers la droite pour les chiens)
function catFront(I, m, l, eye, o = {}) {
  const bw = o.bw ?? 16, hr = o.hr ?? 14, hy = o.hy ?? 22, by = o.by ?? 46;
  I.rope(`M${32 + bw - 2} ${by + 10}C${46 + bw} ${by + 8} ${50 + bw * 0.6} ${by - 10} ${44 + bw * 0.5} ${by - 16}`, m, 5);
  I.vol(P(`M${32 - bw} ${by + 14}C${32 - bw} ${by - 4} ${32 - bw * 0.6} ${by - 14} 32 ${by - 14}C${32 + bw * 0.6} ${by - 14} ${32 + bw} ${by - 4} ${32 + bw} ${by + 14}Z`), tc(m));
  I.vol(E(32, by + 4, bw * 0.45, 9), tc(l), { hl: false, dbl: false, sw: 0, k: 1 });
  I.vol(P(`M${32 - hr * 0.95} ${hy - hr * 0.2}L${32 - hr * 0.85} ${hy - hr * 1.35}L${32 - hr * 0.2} ${hy - hr * 0.8}Z`), tc(m), { hl: false, k: 1.2 });
  I.vol(P(`M${32 + hr * 0.95} ${hy - hr * 0.2}L${32 + hr * 0.85} ${hy - hr * 1.35}L${32 + hr * 0.2} ${hy - hr * 0.8}Z`), tc(m), { hl: false, k: 1.2 });
  I.vol(E(32, hy, hr * (o.hw ?? 1.08), hr), tc(m));
  if (o.stripes) I.line(`M${32 - hr * 0.3} ${hy - hr * 0.95}l2 5M32 ${hy - hr}v5M${32 + hr * 0.3} ${hy - hr * 0.95}l-2 5M${32 - hr} ${hy + 2}h5M${32 + hr} ${hy + 2}h-5M${32 - bw + 2} ${by}h6M${32 + bw - 2} ${by}h-6M${32 - bw + 1} ${by + 7}h6M${32 + bw - 1} ${by + 7}h-6`, o.stripes, 2.4);
  I.vol(E(32, hy + hr * 0.45, hr * 0.48, hr * 0.32), tc(l), { hl: false, dbl: false, sw: 0, k: 1 });
  for (const dx of [-0.42, 0.42]) { I.flat(E(32 + dx * hr, hy - hr * 0.08, hr * 0.2, hr * 0.24), eye, 1.2); I.flat(E(32 + dx * hr, hy - hr * 0.06, hr * 0.07, hr * 0.17), O, 0); I.flat(E(32 + dx * hr - 1, hy - hr * 0.2, 1, 1), '#ffffff', 0); }
  I.flat(P(`M${32 - 2.4} ${hy + hr * 0.28}L${32 + 2.4} ${hy + hr * 0.28}L32 ${hy + hr * 0.45}Z`), '#ff8fa3', 1);
}
function dogSide(I, m, l, eye, o = {}) {
  const x0 = o.x0 ?? 9, x1 = o.x1 ?? 42, bt = o.bt ?? 27, bb = o.bb ?? 41, gy = 57, lw = o.lw ?? 6.5;
  const dark = tc(mixc(m, 0.22, '#1b1530'));
  I.rope(o.bushy ? `M${x0 + 2} ${bt + 4}C${x0 - 6} ${bt + 4} ${x0 - 7} ${bt + 16} ${x0 - 3} ${bt + 20}` : `M${x0 + 2} ${bt + 3}C${x0 - 5} ${bt} ${x0 - 6} ${bt - 8} ${x0 - 3} ${bt - 12}`, o.bushy ? tc(m)[1] : m, o.bushy ? 6 : 3.6);
  // pattes du côté caché (plus sombres)
  I.vol(RR(x1 - lw - 7, bb - 4, lw, gy - bb + 4, 2.5), dark, { hl: false, k: 0.8 });
  I.vol(RR(x0 + lw + 9, bb - 4, lw, gy - bb + 4, 2.5), dark, { hl: false, k: 0.8 });
  const hl = x0 + 5;
  const body = `M${x0} ${bt + 4}C${x0 + 2} ${bt} ${x0 + 10} ${bt - 1} ${x0 + 20} ${bt}C${x1 - 8} ${bt} ${x1 - 4} ${bt - 2} ${x1 - 2} ${bt - 4}L${x1 + 5} ${bt + 4}C${x1 + 6} ${bb - 4} ${x1 + 4} ${bb} ${x1 + 1} ${bb}L${x1 + 1} ${gy - 2}L${x1 + 4} ${gy}L${x1 - lw} ${gy}L${x1 - lw} ${bb + 1}L${hl + lw} ${bb + 1}L${hl + lw} ${gy - 2}L${hl + lw + 2} ${gy}L${hl - 1} ${gy}L${hl} ${bb}C${x0 + 1} ${bb - 2} ${x0} ${bt + 10} ${x0} ${bt + 4}Z`;
  I.vol(P(body), tc(m), { k: 2.6 });
  I.vol(P(`M${x1 - 10} ${bb - 1}C${x1 - 4} ${bb - 6} ${x1 + 4} ${bb - 8} ${x1 + 4} ${bt + 6}L${x1 + 5} ${bt + 4}C${x1 + 6} ${bb - 4} ${x1 + 4} ${bb} ${x1 + 1} ${bb}Z`), tc(l), { hl: false, dbl: false, sw: 0, k: 1 });
  const hr = o.hr ?? 8.5, hx = x1 + 3, hy = bt - 6;
  I.vol(E(hx, hy, hr, hr * 0.9), tc(m), { k: 2 });
  I.vol(P(`M${hx + hr * 0.3} ${hy - hr * 0.35}L${hx + hr * 1.75} ${hy}C${hx + hr * 2.05} ${hy + hr * 0.5} ${hx + hr * 1.7} ${hy + hr * 0.95} ${hx + hr * 1.05} ${hy + hr * 0.85}L${hx + hr * 0.2} ${hy + hr * 0.7}Z`), tc(l), { hl: false, k: 1, dbl: false });
  I.flat(E(hx + hr * 1.8, hy + hr * 0.08, 2.2, 1.8), O, 0);
  I.line(`M${hx + hr * 1.1} ${hy + hr * 0.62}q${hr * 0.35} ${hr * 0.18} ${hr * 0.62} -${hr * 0.06}`, O, 1.4);
  if (o.pointy) I.vol(P(`M${hx - hr * 0.75} ${hy - hr * 0.4}L${hx - hr * 0.4} ${hy - hr * 1.9}L${hx + hr * 0.25} ${hy - hr * 0.65}Z`), tc(m), { hl: false, k: 1, dbl: false });
  else I.vol(P(`M${hx - hr * 0.5} ${hy - hr * 0.78}C${hx - hr * 1.45} ${hy - hr * 0.2} ${hx - hr * 1.3} ${hy + hr * 0.9} ${hx - hr * 0.75} ${hy + hr * 1.0}L${hx - hr * 0.3} ${hy - hr * 0.3}Z`), dark, { hl: false, k: 1, dbl: false });
  I.flat(E(hx + hr * 0.4, hy - hr * 0.15, 2, 2.3), eye === '#1b1530' ? O : eye, eye === '#1b1530' ? 0 : 1); I.flat(E(hx + hr * 0.34, hy - hr * 0.28, 0.8, 0.8), '#ffffff', 0);
}
const PETS = {
  cat: (I, m, l, e) => catFront(I, m, l, e),
  catBig: (I, m, l, e) => catFront(I, m, l, e, { bw: 19, hr: 16, hy: 21, by: 45 }),
  catFat: (I, m, l, e) => catFront(I, m, l, e, { bw: 22, hr: 14, hy: 24, by: 46, hw: 1.15 }),
  catThin: (I, m, l, e) => catFront(I, m, l, e, { bw: 12, hr: 12, hy: 20, by: 47 }),
  catTiger: (I, m, l, e) => catFront(I, m, l, e, { stripes: mixc(m, 0.55, '#1b1530') }),
  dog: (I, m, l, e) => dogSide(I, m, l, e),
  greyhound: (I, m, l, e) => dogSide(I, m, l, e, { bt: 26, bb: 37, lw: 4.5, hr: 7.5, x1: 43 }),
  canecorso: (I, m, l, e) => dogSide(I, m, l, e, { bt: 27, bb: 45, lw: 8, hr: 10.5, x0: 7, x1: 40 }),
  shepherd: (I, m, l, e) => dogSide(I, m, l, e, { pointy: true, bushy: true }),
  snake(I, m, l, e) {
    I.rope('M10 54C10 44 54 44 54 54C54 62 14 62 14 52C14 42 46 38 46 30C46 22 34 20 32 14', m, 9, tc(m)[0]);
    I.vol(E(34, 13, 9, 7.5), tc(m));
    I.flat(E(37, 11, 2.2, 2.6), e, 1.2); I.flat(E(37, 11, 0.8, 1.9), O, 0);
    I.rope('M42 16L49 18M49 18L52 16M49 18L52 21', '#e3343d', 1.2);
  },
};

// ---------------------------------------------------------------- sorts : tuile de la classe + dessin + pastille d'effet
const CLASS_TILE = { guerrier: '#b83a3a', mage: '#6a4cc8', archer: '#3f8a3c', paladin: '#c8a03a', monster: '#5a5070' };
const GP = { w: '#ffffff', l: '#aab4c0', y: '#ffd84a', n: '#8a5a2b', m: '#f1c08f', k: '#2a2238', r: '#ff5d6c', s: '#c9d1da', d: '#5c6670', o: '#ff9f43', c: '#7fe7ff', p: '#a64dff', g: '#4cd964', b: '#3d9bff' };
const STEELMAP = (l, w) => ({ '#ffffff': w, '#f7f9ff': w, '#eef2fa': mixc(l, 0.5, '#ffffff'), '#c3cce0': l, '#9ba7c3': mixc(l, 0.2, '#1b1530'), '#8a95b2': mixc(l, 0.28, '#1b1530'), '#6f7a9b': mixc(l, 0.42, '#1b1530') });
const toneMap = (from, to) => Object.fromEntries(from.map((c, i) => [c, to[i]]));
const GLYPH = {
  sword(I, p) { I.embed('epee', 'translate(2 2) scale(0.94)', { ...STEELMAP(p.l === GP.l ? '#c3cce0' : p.l, p.w), ...(p.y !== GP.y ? toneMap(['#fff7c4', '#f7bc2a', '#cd7e15', '#d98a16', '#8f4c0a'], [mixc(p.y, 0.5, '#ffffff'), p.y, mixc(p.y, 0.25, '#1b1530'), mixc(p.y, 0.3, '#1b1530'), mixc(p.y, 0.5, '#1b1530')]) : {}) }); },
  shield(I, p) {
    const m = p.m === GP.m ? '#3773d8' : p.m, y = p.y === GP.y ? '#f7bc2a' : p.y;
    I.embed('bouclier', '', { ...toneMap(['#6aaeff', '#3773d8', '#23499c', '#162f6c'], [p.l !== GP.l ? p.l : tn(m)[0], m, tn(m)[2], tn(m)[3]]), ...toneMap(['#fff7c4', '#f7bc2a', '#cd7e15', '#d98a16', '#8f4c0a'], [tn(y)[0], y, tn(y)[2], tn(y)[2], tn(y)[3]]) });
  },
  heart(I, p) { const r = p.r === GP.r ? '#e3343d' : p.r; I.embed('coeur', '', toneMap(['#ff6d60', '#e3343d', '#a81d35', '#6e1129'], tn(r))); },
  star(I, p) { I.embed('etoile', '', toneMap(['#fff7c4', '#ffe168', '#f7bc2a', '#e59a1c', '#cd7e15'], [tn(p.y)[0], mixc(p.y, 0.3, '#ffffff'), p.y, tn(p.y)[2], tn(p.y)[3]])); },
  bolt(I, p) { I.embed('eclair', '', p.y === GP.y ? null : toneMap(['#fffbe0', '#fff59a', '#ffd93b', '#ffc12e', '#f5a623'], [mixc(p.y, 0.8, '#ffffff'), mixc(p.y, 0.45, '#ffffff'), p.y, mixc(p.y, 0.15, '#1b1530'), mixc(p.y, 0.3, '#1b1530')])); },
  target(I, p) { I.embed('target', '', p.r !== GP.r ? toneMap(['#ff8a7a', '#e3343d', '#a81d35', '#6e1129'], tn(p.r)) : null); },
  wind(I, p) { I.embed('wind', '', p.w !== GP.w ? { '#bfe8ff': p.w } : null); },
  skull(I) { skull(I, 32, 34, 1.15, '#ff4a3a'); },
  hammer(I, p) {
    const i0 = I.body.length;
    I.vol(RR(28.5, 22, 7, 38, 3), WOOD, { hl: false });
    I.vol(RR(12, 8, 40, 18, 5), tc(p.s === GP.s ? '#c3cce0' : p.s));
    I.line('M16 12H48', p.w, 2);
    wrap(I, i0, 'rotate(-30 32 34) translate(0 -2)');
  },
  roar(I, p) {
    I.rope('M48 22C54 28 54 38 48 44M54 16C63 26 63 40 54 50', '#ffffff', 3);
    I.vol(E(27, 33, 19), tc(p.m));
    I.flat(P('M20 40C20 34 34 34 34 40C34 48 30 52 27 52C24 52 20 48 20 40Z'), '#7a2433', 1.6);
    I.flat(P('M22 40L32 40L30 43L24 43Z'), '#ffffff', 0);
    I.line('M14 24L22 28M40 24L32 28', O, 3); I.flat(E(19, 30, 2), O, 0); I.flat(E(35, 30, 2), O, 0);
    if (p.r !== GP.r) I.flat(E(27, 48, 4, 2.5), p.r, 0);
  },
  whirl(I, p) { I.rope('M32 32a3 3 0 0 1 6 0a7 7 0 0 1 -14 0a11 11 0 0 1 22 0a15 15 0 0 1 -30 0a19 19 0 0 1 38 0', p.w, 3.6); },
  bash(I) {
    I.vol(star(32, 32, 10, 28, 15), T.orange, { gloss: false });
    I.vol(star(32, 32, 8, 16, 9), ['#ffffff', '#ffe168', '#f7bc2a', '#cd7e15'], { dbl: false, sw: 1.6, k: 2 });
    I.flat(E(30, 30, 4.5), '#ffffff', 0);
  },
  charge(I, p) {
    I.line('M4 26H18M2 34H16M6 42H18', '#ffffff', 3);
    const i0 = I.body.length;
    I.vol(P(BOOT), tc(p.m === GP.m ? '#9a6234' : p.m)); I.vol(RR(15, 4, 24, 8, 3), GOLD, { hl: false, k: 1.4 }); I.vol(RR(10, 50, 47, 7, 3), tc('#45230f'), { hl: false, k: 1 });
    wrap(I, i0, 'translate(10 4) scale(0.85) rotate(-10 32 32)');
  },
  flame(I, p) {
    I.vol(P('M32 4C36 14 48 20 50 34C52 48 43 59 32 59C21 59 12 50 14 37C15 29 20 25 22 18C26 24 26 28 28 30C30 22 28 12 32 4Z'), tn(p.o === GP.o ? '#ff5a1f' : p.o));
    I.flat(P('M32 22C36 30 43 34 43 44C43 52 38 57 32 57C26 57 21 52 22 45C23 40 26 38 27 34C29 38 30 40 31 40C31 34 30 28 32 22Z'), p.y === GP.y ? '#ffb02e' : p.y, 0);
    I.flat(P('M32 38C34 43 38 46 38 50C38 54 35 56 32 56C29 56 26 54 26 50C26 47 29 45 32 38Z'), '#fff3a0', 0);
  },
  snow(I, p) {
    const c = p.c;
    let d = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, x = 32 + Math.cos(a) * 25, y = 32 + Math.sin(a) * 25, bx = 32 + Math.cos(a) * 15, by = 32 + Math.sin(a) * 15; d += `M32 32L${r1(x)} ${r1(y)}M${r1(bx)} ${r1(by)}L${r1(bx + Math.cos(a + 0.9) * 8)} ${r1(by + Math.sin(a + 0.9) * 8)}M${r1(bx)} ${r1(by)}L${r1(bx + Math.cos(a - 0.9) * 8)} ${r1(by + Math.sin(a - 0.9) * 8)}`; }
    I.rope(d, c, 4, '#ffffff'); I.vol(star(32, 32, 6, 8, 5), tn(c), { k: 1, hl: false });
  },
  cube(I) {
    I.raw(`<path d="M32 6L56 17L56 46L32 58L8 46L8 17Z" fill="${O}" stroke="${O}" stroke-width="6"/>`);
    I.flat(P('M32 6L56 17L32 28L8 17Z'), '#e8ffff', 2); I.flat(P('M8 17L32 28L32 58L8 46Z'), '#9ee8f8', 2); I.flat(P('M32 28L56 17L56 46L32 58Z'), '#5cbce0', 2);
    I.raw(`<path d="M14 24L14 36M20 28L20 34" stroke="#ffffff" stroke-width="2.6"/>`); I.spark(46, 10, 5);
  },
  firerain(I, p) {
    for (const [x, y, k] of [[22, 22, 0.8], [44, 38, 0.95]]) {
      I.rope(`M${x} ${y}L${x - 16 * k} ${y - 16 * k}`, '#ffd84a', 3 * k);
      I.vol(E(x, y, 9 * k), tn(p.o === GP.o ? '#ff5a1f' : p.o), { k: 1.6 });
      I.flat(E(x + 1, y + 1, 4 * k), '#fff3a0', 0);
    }
  },
  drop(I, p) { I.vol(P('M32 5C40 18 50 28 50 40C50 51 42 59 32 59C22 59 14 51 14 40C14 28 24 18 32 5Z'), tn(p.p)); },
  meteor(I, p) {
    I.rope('M34 30L58 6', p.y === GP.y ? '#ffd84a' : p.y, 7, '#fff3a0'); I.rope('M28 24L46 4', p.o === GP.o ? '#ff9f43' : p.o, 4);
    I.vol(E(25, 39, 16), tn(p.o === GP.o ? '#d0561a' : p.o));
    I.flat(E(20, 36, 3.5), tn(p.o === GP.o ? '#d0561a' : p.o)[3], 0); I.flat(E(30, 45, 2.6), tn(p.o === GP.o ? '#d0561a' : p.o)[3], 0);
  },
  arrow(I, p) {
    I.rope('M12 52L48 16', p.n === GP.n ? '#9a6234' : p.n, 4);
    I.vol(P('M42 10L57 7L54 22Z'), tc(p.s === GP.s ? '#c3cce0' : p.s), { k: 1.4 });
    I.vol(P('M8 44L20 56L12 60L4 52Z'), WHITE, { hl: false, k: 1 });
  },
  arrow2(I, p) { const i0 = I.body.length; GLYPH.arrow(I, p); wrap(I, i0, 'translate(-8 6) scale(0.8)'); const i1 = I.body.length; GLYPH.arrow(I, p); wrap(I, i1, 'translate(14 -4) scale(0.8)'); },
  trap(I) {
    I.vol(RR(6, 44, 52, 9, 4), STEEL);
    I.rope('M10 44C10 22 54 22 54 44', '#9ba7c3', 4);
    I.raw(`<path d="M12 40L16 30L20 40L24 28L28 40L32 27L36 40L40 28L44 40L48 30L52 40Z" fill="#ffffff" stroke="${O}" stroke-width="1.6"/>`);
    I.flat(E(32, 48, 4), '#e3343d', 1.4);
  },
  eye(I, p) {
    I.vol(P('M5 32C15 17 49 17 59 32C49 47 15 47 5 32Z'), WHITE, { hl: false });
    I.vol(E(32, 32, 11), tn(p.b === GP.b ? '#3d9bff' : p.b), { dbl: false, sw: 1.6, k: 1.6 });
    I.flat(E(32, 32, 5), O, 0); I.flat(E(28.5, 28.5, 2.4), '#ffffff', 0);
  },
  rain(I, p) {
    for (const x of [16, 32, 48]) { I.rope(`M${x} 6V40`, p.n === GP.n ? '#9a6234' : p.n, 3); I.vol(P(`M${x - 6} 38L${x + 6} 38L${x} 52Z`), tc(p.s === GP.s ? '#c3cce0' : p.s), { k: 1, hl: false }); }
    I.line('M10 58H22M26 58H38M42 58H54', '#ffffff', 2);
  },
  cross(I, p) { I.vol(P('M25 7H39V25H57V39H39V57H25V39H7V25H25Z'), tn(p.g)); },
  sun(I, p) { I.vol(star(32, 32, 12, 29, 18), tn(p.y)); I.vol(E(32, 32, 12), [W, p.w === GP.w ? '#fffbe0' : p.w, mixc(p.y, 0.3, '#ffffff'), p.y], { dbl: false, sw: 1.6, k: 1.6 }); },
  pillar(I, p) {
    I.raw(`<ellipse cx="32" cy="54" rx="24" ry="7" fill="${p.y}" opacity="0.6"/>`);
    I.vol(RR(21, 2, 22, 54, 8), ['#ffffff', '#fffbe0', '#ffe9a0', '#f7bc2a']);
    I.spark(14, 18, 4.5); I.spark(50, 30, 3.5);
  },
  wings(I, p) {
    I.vol(P('M30 36C22 20 10 13 3 15C7 21 7 27 11 31C7 33 5 37 7 42C13 42 22 40 30 38Z'), WHITE);
    I.vol(P('M34 36C42 20 54 13 61 15C57 21 57 27 53 31C57 33 59 37 57 42C51 42 42 40 34 38Z'), WHITE);
    I.vol(E(32, 37, 6), GOLD, { k: 1.4 });
  },
  cubeIce(I, p) { GLYPH.cube(I, p); },
};
function skull(I, x, y, k, eye) {
  I.vol(P(`M${r1(x - 18 * k)} ${r1(y)}C${r1(x - 18 * k)} ${r1(y - 14 * k)} ${r1(x - 9 * k)} ${r1(y - 20 * k)} ${x} ${r1(y - 20 * k)}C${r1(x + 9 * k)} ${r1(y - 20 * k)} ${r1(x + 18 * k)} ${r1(y - 14 * k)} ${r1(x + 18 * k)} ${r1(y)}C${r1(x + 18 * k)} ${r1(y + 7 * k)} ${r1(x + 14 * k)} ${r1(y + 10 * k)} ${r1(x + 11 * k)} ${r1(y + 11 * k)}L${r1(x + 11 * k)} ${r1(y + 18 * k)}L${r1(x - 11 * k)} ${r1(y + 18 * k)}L${r1(x - 11 * k)} ${r1(y + 11 * k)}C${r1(x - 14 * k)} ${r1(y + 10 * k)} ${r1(x - 18 * k)} ${r1(y + 7 * k)} ${r1(x - 18 * k)} ${r1(y)}Z`), T.bone);
  for (const dx of [-7.5, 7.5]) { I.flat(E(x + dx * k, y + 1 * k, 5.6 * k, 5 * k), O, 0); I.glow(r1(x + dx * k), r1(y + 1.5 * k), r1(6 * k), eye, 0.9); I.flat(E(x + dx * k, y + 1.5 * k, 2.4 * k, 2.2 * k), eye, 0); }
  I.flat(P(`M${x} ${r1(y + 6 * k)}L${r1(x + 2.6 * k)} ${r1(y + 10 * k)}L${r1(x - 2.6 * k)} ${r1(y + 10 * k)}Z`), O, 0);
  I.line(`M${r1(x - 5 * k)} ${r1(y + 13 * k)}V${r1(y + 18 * k)}M${x} ${r1(y + 13 * k)}V${r1(y + 18 * k)}M${r1(x + 5 * k)} ${r1(y + 13 * k)}V${r1(y + 18 * k)}`, O, r1(1.8 * k));
}
// pastilles d'effet (étourdit, brûle, poison, vol de vie, malus, bonus, soin)
const BADGE = {
  stun: ['#ffd84a', 'M-1 -5L3 -5L0 0L3 0L-2 6L-1 1L-4 1Z'], burn: ['#ff8a2a', 'M0 -6C3 -2 4 0 4 2C4 5 2 6 0 6C-2 6 -4 5 -4 2C-4 0 -2 -1 0 -6Z'],
  poison: ['#4cd964', 'M0 -6C3 -2 4 0 4 2C4 5 2 6 0 6C-2 6 -4 5 -4 2C-4 0 -3 -2 0 -6Z'], steal: ['#ff5d6c', 'M0 5C-2 3 -6 0 -6 -2C-6 -5 -2 -6 0 -3C2 -6 6 -5 6 -2C6 0 2 3 0 5Z'],
  debuff: ['#a64dff', 'M-2 -6H2V0H5L0 6L-5 0H-2Z'], buff: ['#ffd84a', 'M-2 6H2V0H5L0 -6L-5 0H-2Z'], heal: ['#4cd964', 'M-1.6 -5H1.6V-1.6H5V1.6H1.6V5H-1.6V1.6H-5V-1.6H-1.6Z'],
};

// ---------------------------------------------------------------- génération
(async () => {
  const D = await import(path.join(ROOT, 'js', 'data.js'));
  const { ITEMS, SPELLS } = D;
  const src = fs.readFileSync(path.join(ROOT, 'js', 'sprites.js'), 'utf8');
  const SPELL_ART = eval('(' + src.match(/const SPELL_ART = (\{[\s\S]*?\n\});/)[1] + ')');
  const out = { objets: {}, familiers: {}, sorts: {} };
  const missing = [];
  for (const [id, it] of Object.entries(ITEMS)) {
    const I = Icon(id.replace(/[^a-z0-9]/gi, '').slice(0, 12));
    const [m, a] = it.colors;
    if (it.slot === 'pet') {
      const f = PETS[it.icon]; if (!f) { missing.push(it.icon); continue; }
      f(I, m, a, it.eye || '#1b1530');
      // marge autour du dessin : oreilles, queues et pattes dépassent parfois du carré 64×64 (le jeu recadre ensuite sur le dessin)
      out.familiers[id] = I.svg(it.name || id, 'objets.cjs').replace('viewBox="0 0 64 64"', 'viewBox="-10 -10 84 84"');
    } else {
      const f = SHAPES[it.icon]; if (!f) { missing.push(it.icon); continue; }
      f(I, m, a, it);
      out.objets[id] = I.svg(it.name || id, 'objets.cjs');
    }
  }
  const spellBadge = (sp) => {
    if (sp.lifesteal) return 'steal';
    for (const e of sp.effects || []) { if (e.k === 'stun') return 'stun'; if (e.k === 'dot') return e.kind === 'poison' ? 'poison' : 'burn'; if (e.k === 'debuff') return 'debuff'; if (e.k === 'heal' && sp.mult) return 'heal'; }
    return null;
  };
  for (const [id, sp] of Object.entries(SPELLS)) {
    if (/^[xr]_/.test(id)) continue;
    const [gname, over] = SPELL_ART[id] || ['star'];
    const f = GLYPH[gname]; if (!f) { missing.push('glyph:' + gname); continue; }
    const I = Icon('s' + id);
    const bg = CLASS_TILE[sp.cls] || CLASS_TILE.monster;
    I.vol(RR(3, 3, 58, 58, 13), tn(bg), { hl: false, gloss: false, k: 4 });
    I.raw(`<rect x="7" y="7" width="50" height="50" rx="10" fill="none" stroke="${mixc(bg, 0.5, '#ffffff')}" stroke-width="1.6" opacity="0.6"/>`);
    const i0 = I.body.length;
    f(I, { ...GP, ...(over || {}) });
    wrap(I, i0, 'translate(9 8) scale(0.72)');
    const b = spellBadge(sp);
    if (b) { const [c, d] = BADGE[b]; I.raw(`<circle cx="50" cy="50" r="9" fill="${c}" stroke="${O}" stroke-width="2.4"/><path transform="translate(50 50)" d="${d}" fill="#ffffff" stroke="${O}" stroke-width="1.2"/>`); }
    out.sorts[id] = I.svg('sort ' + (sp.name || id), 'objets.cjs');
  }
  for (const k of Object.keys(out)) {
    const txt = JSON.stringify(out[k]);
    fs.writeFileSync(path.join(ROOT, 'art', k + '.json'), txt);
    console.log(k.padEnd(10), Object.keys(out[k]).length, 'dessins,', (txt.length / 1024).toFixed(0), 'Ko');
  }
  if (missing.length) console.log('MANQUE :', [...new Set(missing)].join(' '));
})();
