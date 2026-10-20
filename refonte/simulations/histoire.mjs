// Réglage du mode histoire, combat par combat (150). Pour chaque combat, on prend le héros attendu d'un joueur qui joue à fond
// à ce moment-là (niveau et équipement des courbes progression.mjs / equipement.mjs, zone finie aux jours ZDAY),
// et on cherche la force des monstres pour qu'il gagne : 9 fois sur 10 un combat normal, 8 sur 10 le petit boss,
// 3 sur 4 le boss (Guerrier et Archer, les classes les plus fragiles). Le tout dernier boss (Chaotique, zone 5) :
// un héros niveau 100 tout Chaotique avec sa panoplie y fait 3 étoiles 1 fois sur 2.
// Écrit les tableaux STORY.strength / need / levels dans refonte/simulations/histoire.json. node refonte/simulations/histoire.mjs
import fs from 'fs';
import { setup } from './teams.mjs';
const { E, D, hero } = await setup();
const LV = [15,23,29,35,40,44,47,50,53,56,59,61,63,65,67,69,71,72,74,76,77,78,80,81,82,83,84,86,87,88,89,89,90,91,92,93,94,95,96,96,97,98,99,99,100];
const RA = [1.94,2.54,2.85,3.08,3.54,3.81,3.94,4.04,4.17,4.37,4.52,4.75,4.9,4.94,5,5,5,5,5,5,5,5.04,5.06,5.06,5.1,5.13,5.19,5.31,5.38,5.52,5.67,5.75,5.85,5.92,5.96,5.98,5.98];
const lvAt = (d) => d < 1 ? 1 + 14 * d : d >= LV.length ? 100 : LV[Math.floor(d) - 1] + (LV[Math.floor(d)] - LV[Math.floor(d) - 1]) * (d % 1);
const raAt = (d) => d < 0.15 ? -1 : d < 1 ? Math.max(0, 2 * d - 0.3) : RA[Math.min(RA.length, Math.floor(d)) - 1] ?? 6;
const ZDAY = (process.env.ZDAY || '1,2,3.5,5,7,9,11,14,17,21,25,29,33,38,45').split(',').map(Number);
const CLS = ['guerrier', 'archer'], RUNS = +(process.env.RUNS || 30);
D.STORY.strength = new Array(150).fill(1);
const rate = (heroes, g, f, stars) => {
  D.STORY.strength[g] = f;
  let ok = 0, n = 0;
  for (const h of heroes) for (let r = 0; r < RUNS; r++) {
    const res = E.createWave(h, E.storyFoes(g), 7000 + r * 13 + g).result();
    if (res.winner === 0 && E.storyStarsFor(res.hpFrac) >= stars) ok++;
    n++;
  }
  return ok / n;
};
const solve = (heroes, g, target, stars) => {
  let lo = 0.01, hi = 10;
  for (let it = 0; it < 14; it++) { const m = Math.sqrt(lo * hi); if (rate(heroes, g, m, stars) >= target) lo = m; else hi = m; }
  return lo;
};
const strength = [], need = [], levels = [];
for (let g = 0; g < 150; g++) {
  const z = Math.floor(g / 10), k = g % 10, last = g === 149;
  const d0 = z ? ZDAY[z - 1] : 0, d = d0 + (ZDAY[z] - d0) * (k + 1) / 10;
  const L = last ? 100 : Math.max(1, Math.round(lvAt(d))), R = last ? 6 : Math.min(6, Math.round(raAt(d)));
  const hs = CLS.map(c => hero(c, L, R));
  const kind = E.storyKind(g);
  const f = last ? solve(hs, g, 0.5, 3) : solve(hs, g, kind === 'boss' ? 0.75 : kind === 'mini' ? 0.8 : 0.9, 1);
  strength.push(+f.toFixed(3));
  need.push(Math.round(hs.reduce((s, h) => s + E.powerScore(h), 0) / hs.length));
  levels.push(L);
  if (k === 9) console.log(`zone ${z + 1} fin (jour ${ZDAY[z]}) : héros niv ${L} rareté ${R}, puissance ${need[g]} → force ${f.toFixed(3)}`);
}
fs.writeFileSync(new URL('./histoire.json', import.meta.url), JSON.stringify({ strength, need, levels }));
console.log('écrit dans refonte/simulations/histoire.json');
