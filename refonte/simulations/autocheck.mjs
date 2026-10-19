import { setup } from './teams.mjs';
const { E, team, power } = await setup();
const f = (g) => `D${E.autoDiff(Math.min(g, 1000))}·P${E.autoPalier(Math.min(g, 1000))}`;
for (const [L, R, runs] of [[1, -1, 4], [10, 0, 4], [20, 1, 4], [25, 2, 4], [30, 2, 6], [40, 3, 4], [50, 3, 4], [60, 4, 4], [80, 5, 4], [90, 5, 4], [100, 5, 4], [100, 6, 6]]) {
  const res = [];
  for (let k = 0; k < runs; k++) {
    const t = team(L, R, k + 1), acc = { pseudo: `c${L}-${R}-${k}` };
    for (let n = 0; n < 5000 && acc.auto?.g !== 1001; n++) E.autoResolve(acc, t);   // 5000 combats ≈ 14 h
    res.push(acc.auto.best);
  }
  res.sort((a, b) => a - b);
  console.log(`niv ${String(L).padStart(3)} rareté ${String(R).padStart(2)} (puissance ${power(team(L, R, 1))}) → bloque ${f(res[0])} … ${f(res[res.length - 1])}`);
}
