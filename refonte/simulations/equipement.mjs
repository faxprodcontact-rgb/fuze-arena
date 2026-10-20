// Équipement d'un joueur qui joue à fond (règles de la refonte) : rareté de son meilleur objet par emplacement, jour par jour.
// node refonte/simulations/equipement.mjs
// Hypothèses (même joueur que progression.mjs) :
// - 37 coffres normaux par jour + toutes ses clefs (5 clefs de donjon par 12 h, clefs de montée de niveau, ~2 clefs de trône par semaine).
// - 2 coffres de combat par jour (arène) ; ~1,5 coffre de guerre par semaine (raid, guerre, championnat).
// - Bonus de chance des coffres (compteurs d'ouvertures) ; il fusionne tout chaque soir (« Tout fusionner »).
// - Niveau jour par jour : la courbe de progression.mjs (niveau 100 vers le 45ᵉ jour). La boutique n'est pas comptée.
// Essais : ODDS=« 72,22,5,1,0 » (chances du coffre normal), LUCK=« 3 » (bonus de chance), FUSE=« 2,2,2,2,2,3 ».
import fs from 'fs';
import * as E from '../../js/engine.js';
const V = fs.readFileSync(new URL('../../js/engine.js', import.meta.url), 'utf8').match(/data\.js\?v=(\d+)/)[1];
const { RARITIES, SLOT_ORDER, ITEMS, MAX_LEVEL, FUSE_NEED, CHEST_ODDS } = await import(`../../js/data.js?v=${V}`);
// essais : ODDS=« 70,23,5.5,1.5,0 » = chances (%) du coffre normal
if (process.env.ODDS) CHEST_ODDS.normal = process.env.ODDS.split(',').map(Number);
// LUCK=« 3 » = points de chance gagnés à chaque palier d'ouvertures
const { CHEST_LUCK } = await import(`../../js/data.js?v=${V}`);
if (process.env.LUCK) CHEST_LUCK.gain = +process.env.LUCK;
import { makeRng } from '../../js/rng.js';

const LEVELS = [15, 23, 29, 35, 40, 44, 47, 50, 53, 56, 59, 61, 63, 65, 67, 69, 71, 72, 74, 76, 77, 78, 80, 81, 82, 83, 84, 86, 87, 88, 89, 89, 90, 91, 92, 93, 94, 95, 96, 96, 97, 98, 99, 99, 100];
const DAYS = 150, RUNS = 8;
// essais : FUSE=« 2,2,2,2,3,3 » = objets identiques qu'il faut pour monter de Commun→Peu commun, … Mythique→Chaotique
const NEED = process.env.FUSE ? process.env.FUSE.split(',').map(Number) : FUSE_NEED;   // par défaut : la règle du jeu
function fuseAllN(hero) {
  for (let r = 0; r < RARITIES.length - 1; r++) {
    if (r + 1 === RARITIES.length - 1 && hero.level < (+process.env.CHAOS || 0)) continue;   // Chaotique bloqué avant ce niveau
    const by = {};
    for (const it of hero.inventory) if (it.rarity === r) (by[it.itemId] ||= []).push(it);
    for (const [itemId, list] of Object.entries(by)) {
      while (list.length >= NEED[r]) { const used = list.splice(0, NEED[r]); hero.inventory = hero.inventory.filter(i => !used.includes(i)); E.addItem(hero, itemId, r + 1); }
    }
  }
}
const lvlAt = (d) => LEVELS[Math.min(d, LEVELS.length) - 1];

function run(seed) {
  const rng = makeRng(seed);
  const acc = { chestCount: { normal: 0, combat: 0, war: 0 } };
  const hero = E.newHero('Sim', 'guerrier');
  const out = [];
  let prevLvl = 1, warCredit = 0, throneCredit = 0;
  const open = (kind, n) => {
    for (let c = 0; c < n; c++) {
      const odds = E.chestOdds(acc, kind);
      acc.chestCount[kind]++;
      const items = kind === 'war' ? 3 : kind === 'combat' ? 2 : 1;
      for (let i = 0; i < items; i++) { const r = E.rollItem(rng, odds); E.addItem(hero, r.itemId, r.rarity); }
    }
  };
  for (let day = 1; day <= DAYS; day++) {
    const lvl = lvlAt(day);
    hero.level = lvl;
    let keys = 10;                                                   // clefs de donjon
    for (let l = prevLvl + 1; l <= lvl; l++) keys += E.levelKeys(l);  // clefs de montée de niveau
    prevLvl = lvl;
    throneCredit += 2 / 7; const tk = Math.floor(throneCredit); throneCredit -= tk;
    warCredit += 1.5 / 7; const wc = Math.floor(warCredit); warCredit -= wc;
    open('normal', 37 + keys + tk);
    open('combat', 2);
    open('war', wc);
    fuseAllN(hero);
    // meilleur objet de chaque emplacement
    const best = Object.fromEntries(SLOT_ORDER.map(s => [s, -1]));
    for (const it of hero.inventory) { const s = ITEMS[it.itemId].slot; if (it.rarity > best[s]) best[s] = it.rarity; }
    out.push(SLOT_ORDER.map(s => best[s]));
  }
  return out;
}

const runs = Array.from({ length: RUNS }, (_, i) => run(1000 + i * 77));
const avg = (d, f) => runs.reduce((a, r) => a + f(r[d]), 0) / RUNS;
const multAvg = (slots) => slots.reduce((a, r) => a + (r >= 0 ? RARITIES[r].mult : 0), 0) / slots.length;
const minR = (slots) => Math.min(...slots);
console.log('Jour  niveau  rareté moyenne (0 = Commun … 6 = Chaotique)  force de l’équipement (×)  pire emplacement');
for (const d of [1, 2, 3, 5, 7, 10, 14, 21, 28, 35, 45, 60, 75, 90, 120, 150]) {
  const i = d - 1;
  console.log(String(d).padStart(4), String(lvlAt(d)).padStart(6), avg(i, s => s.reduce((a, b) => a + b, 0) / s.length).toFixed(2).padStart(10), avg(i, multAvg).toFixed(1).padStart(18), avg(i, minR).toFixed(1).padStart(20));
}
console.log('\nPremier jour où les 6 emplacements sont au moins :');
for (let r = 1; r < RARITIES.length; r++) {
  const days = runs.map(rr => { const k = rr.findIndex(s => minR(s) >= r); return k < 0 ? null : k + 1; });
  const ok = days.filter(x => x !== null);
  console.log(`  ${RARITIES[r].name.padEnd(11)} ${ok.length ? `jour ${Math.round(ok.reduce((a, b) => a + b, 0) / ok.length)}` : `pas avant le jour ${DAYS}`}${ok.length && ok.length < RUNS ? ` (${ok.length}/${RUNS} essais)` : ''}`);
}
console.log('\nPremier objet de chaque rareté (au moins un emplacement) :');
for (let r = 4; r < RARITIES.length; r++) { const d = runs.map(rr => rr.findIndex(s => Math.max(...s) >= r) + 1).filter(x => x > 0); console.log(`  ${RARITIES[r].name.padEnd(11)} jour ${d.length ? Math.round(d.reduce((a, b) => a + b, 0) / d.length) : '—'}`); }
console.log('JSON', JSON.stringify({ avg: runs[0].map((_, i) => +avg(i, s => s.reduce((a, b) => a + b, 0) / s.length).toFixed(2)), min: runs[0].map((_, i) => +avg(i, minR).toFixed(2)) }));
