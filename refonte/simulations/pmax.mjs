import { setup } from './teams.mjs';
const { E, team, power } = await setup();
const tmax = team(100, 6);
console.log('ÉQUIPE MAX (niv 100, Chaotique, panoplie) :', power(tmax), tmax.map(m => `${m.classId}:${Math.round(E.powerScore(m))}`).join(' '));
for (const [L, R] of [[1, -1], [10, 0], [20, 1], [25, 2], [30, 2], [40, 3], [50, 3], [60, 4], [70, 4], [80, 5], [90, 5], [100, 4], [100, 5], [100, 6]]) console.log(`niv ${L} rareté ${R} → ${power(team(L, R))}`);
