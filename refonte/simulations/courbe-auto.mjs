// Puissance d'équipe d'un joueur qui joue à fond, jour après jour (sert à régler la difficulté du combat auto).
// Perso principal : courbe de progression.mjs ; équipement : courbe d'equipement.mjs.
// Les persos 2, 3 et 4 arrivent aux niveaux 15, 30 et 50 du principal et montent ~1,3× plus vite (aide aux retardataires).
// node refonte/simulations/courbe-auto.mjs
import { setup } from './teams.mjs';
const { E, hero, CL } = await setup();
const LV = [15,23,29,35,40,44,47,50,53,56,59,61,63,65,67,69,71,72,74,76,77,78,80,81,82,83,84,86,87,88,89,89,90,91,92,93,94,95,96,96,97,98,99,99,100];
// rareté moyenne par jour (equipement.mjs, règles du 20/10 : 3 Légendaires → 1 Mythique, clefs de la Horde et de la Tour)
const RA = [1.91,2.63,2.94,3.26,3.58,3.81,3.92,3.99,4.01,4.02,4.06,4.15,4.31,4.48,4.62,4.84,4.92,4.98,4.99,4.99,5,5,5,5,5,5,5,5,5,5,5,5.01,5.01,5.05,5.13,5.17,5.22,5.3,5.39,5.46,5.59,5.66,5.74,5.78,5.83,5.9,5.94,5.98,5.98];
const lvAt = (d) => d <= 0 ? 1 : d >= 1 ? LV[Math.min(LV.length, Math.floor(d)) - 1] + (d % 1 && d < LV.length ? (LV[Math.floor(d)] - LV[Math.floor(d) - 1]) * (d % 1) : 0) : 1 + 14 * d;
const raAt = (d) => d <= 0 ? -1 : d < 1 ? 2 * d - 0.5 : RA[Math.min(RA.length, Math.floor(d)) - 1] ?? 6;
const unlockDay = (L) => { for (let d = 0; d <= 60; d += 0.05) if (lvAt(d) >= L) return d; return 99; };
const UNL = [0, unlockDay(15), unlockDay(30), unlockDay(50)];
export function teamAt(d) {
  const out = [];
  CL.forEach((c, k) => {
    if (d < UNL[k]) return;
    const dd = k ? (d - UNL[k]) * 1.3 : d;
    const L = Math.max(1, Math.round(Math.min(lvAt(d), lvAt(dd)))), R = Math.round(Math.min(raAt(d), raAt(dd)));
    out.push(hero(c, L, Math.min(6, R)));
  });
  return out;
}
export const powerAt = (d) => Math.round(teamAt(d).reduce((s, m) => s + E.powerScore(m), 0));
if (process.argv[1].endsWith('courbe-auto.mjs')) {
  console.log('déblocages (jours) :', UNL.map(x => x.toFixed(2)).join(' '));
  for (const d of [0, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 7, 10, 14, 18, 21, 25, 28, 32, 35, 40, 45, 50, 55, 60]) console.log(String(d).padStart(5), 'jour', String(powerAt(d)).padStart(6), teamAt(d).map(m => `${m.classId}:${m.level}`).join(' '));
}
