const E = await import('/home/user/fuze-arena/js/engine.js');
const { DUNGEONS } = await import('/home/user/fuze-arena/js/data.js');
const team = (lvl, s) => ['guerrier', 'mage', 'archer', 'guerrier'].map((c, i) => { const b = E.buildBot({ id: 't' + s + i, name: 'P', classId: c }, lvl, 'd' + s); b.level = lvl; return E.snapshot(b); });
const pool = DUNGEONS.flatMap(E.dungeonFoes);
const mons = (lvl, s, k = 1, h = 1) => [0, 1, 2, 3].map(j => { const m = E.buildMonster({ ...pool[(s * 7 + j * 3) % pool.length], lvl }); for (const q in m.stats) m.stats[q] = Math.round(m.stats[q] * k); m.maxHp = Math.round(m.maxHp * h); return m; });
let t0 = performance.now(), N = 300;
for (let n = 0; n < N; n++) E.createMelee(team(30, n), mons(30, n), n).result();
console.log('ms par combat', ((performance.now() - t0) / N).toFixed(2));
for (const [k, h] of [[1, 1], [0.7, 0.6], [0.6, 0.5], [0.55, 0.45]]) {
  const row = [-10, -5, 0, 5, 10].map(d => { let w = 0; for (let n = 0; n < 150; n++) if (E.createMelee(team(30, n), mons(30 + d, n, k, h), n).result().winner === 0) w++; return `${d >= 0 ? '+' : ''}${d}:${Math.round(w / 1.5)}%`; });
  console.log(`stats×${k} PV×${h}  écart niveau monstres →`, row.join('  '));
}
