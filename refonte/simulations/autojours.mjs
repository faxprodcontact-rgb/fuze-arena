// Où bloque le combat auto d'un joueur qui joue à fond, jour après jour (équipe de courbe-auto.mjs, 3 000 combats ≈ 8 h).
import { teamAt, powerAt } from './courbe-auto.mjs';
import * as E from '../../js/engine.js';
import fs from 'fs';
// essais : NEED='[[1,75],…]' remplace les repères AUTO.need
const V = fs.readFileSync(new URL('../../js/engine.js', import.meta.url), 'utf8').match(/data\.js\?v=(\d+)/)[1];
const { AUTO } = await import(`../../js/data.js?v=${V}`);
if (process.env.NEED) AUTO.need = JSON.parse(process.env.NEED);
const f = (g) => `D${E.autoDiff(Math.min(g, 1000))}·P${E.autoPalier(Math.min(g, 1000))}`;
for (const d of (process.argv[2] ? process.argv[2].split(',').map(Number) : [0, 0.2, 0.5, 1, 2, 3, 4, 5, 7, 10, 14, 21, 28, 35, 45])) {
  const res = [];
  for (let k = 0; k < 3; k++) {
    const t = teamAt(d), acc = { pseudo: `j${d}-${k}` };
    for (let n = 0; n < 3000 && acc.auto?.g !== 1001; n++) E.autoResolve(acc, t);
    res.push(acc.auto.best);
  }
  res.sort((a, b) => a - b);
  console.log(`jour ${String(d).padStart(4)} (puissance ${String(powerAt(d)).padStart(5)}) → bloque ${f(res[0])} … ${f(res[2])}`);
}
