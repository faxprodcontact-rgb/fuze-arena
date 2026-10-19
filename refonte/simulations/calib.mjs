import { setup } from './teams.mjs';
const { E, D, team, power } = await setup();
const pool = D.DUNGEONS.flatMap(E.dungeonFoes);
// monstres de référence : niveau 50, stats et PV × f
const mons = (f, s) => [0, 1, 2, 3].map(j => { const m = E.buildMonster({ ...pool[(s * 7 + j * 11) % pool.length], lvl: 50 }); for (const q in m.stats) m.stats[q] = Math.max(1, Math.round(m.stats[q] * f)); m.maxHp = Math.round(m.maxHp * f); return m; });
const win = (t, f, N = 60) => { let w = 0; for (let n = 0; n < N; n++) if (E.createMelee(t, mons(f, n), n * 31 + 7).result().winner === 0) w++; return w / N; };
const out = [];
for (const [L, R] of [[1, -1], [10, 0], [20, 1], [30, 2], [40, 3], [50, 3], [60, 4], [70, 4], [80, 5], [90, 5], [100, 6]]) {
  const t = team(L, R), P = power(t);
  let lo = 0.02, hi = 20;
  for (let it = 0; it < 18; it++) { const m = Math.sqrt(lo * hi); if (win(t, m) >= 0.8) lo = m; else hi = m; }
  out.push([P, lo]);
  console.log(`puissance ${P} → f80 = ${lo.toFixed(3)}`);
}
// ajustement log-log : f = a * P^b
const xs = out.map(o => Math.log(o[0])), ys = out.map(o => Math.log(o[1]));
const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
const b = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0), a = Math.exp(my - b * mx);
console.log(`ajustement : f = ${a.toExponential(4)} × P^${b.toFixed(4)}`);
for (const [P, f] of out) console.log(`  P ${P} : mesuré ${f.toFixed(3)} / ajusté ${(a * P ** b).toFixed(3)}`);
