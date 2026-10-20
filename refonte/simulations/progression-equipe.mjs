// Progression d'un joueur assidu avec ses 4 persos : le 2e arrive quand le plus haut atteint le niveau 15, le 3e au 30, le 4e au 50.
// Chaque perso fait tout ce qui lui est propre : ses coffres (37 par jour + ses clefs), ses donjons (6 vagues par jour et par donjon,
// les 2 plus durs en vrai, les autres passés à ½ XP), sa Horde (6 par jour), sa tour, son histoire (XP à la 1re victoire).
// Le compte : 2 coffres de combat par jour, ~1 coffre de guerre par semaine et le combat auto (10 % d'un niveau par jour)
// vont au perso principal. Les persos en retard ont l'aide aux retardataires (+5 % par niveau de retard sur le plus haut, max +50 %).
// Un nouveau perso arrive avec 5 coffres. node refonte/simulations/progression-equipe.mjs
import fs from 'fs';
import * as E from '../../js/engine.js';
const V = fs.readFileSync(new URL('../../js/engine.js', import.meta.url), 'utf8').match(/data\.js\?v=(\d+)/)[1];
const { DUNGEONS, MAX_LEVEL, AUTO, STORY } = await import(`../../js/data.js?v=${V}`);

const CLS = ['guerrier', 'mage', 'archer', 'paladin'];
const CHESTS_PER_DAY = 37, COMBAT_CHESTS = 2;
const team = [];
const src = { coffres: 0, donjons: 0, horde: 0, histoire: 0, tour: 0, auto: 0 };
const top = () => Math.max(...team.map(t => t.h.level));
function addHero(i, day) {
  const t = { i, cls: CLS[i], h: E.newHero('Sim' + i, CLS[i]), story: 0, tower: 0, keys: 0, day, src: { ...src } };
  for (const k in t.src) t.src[k] = 0;
  team.push(t);
  for (let c = 0; c < 5; c++) gain(t, 'coffres', 20);   // un nouveau perso arrive avec 5 coffres
}
function gain(t, k, xp) {
  if (t.h.level >= MAX_LEVEL) return;
  E.setXpBonus(E.catchupBonus(t.h.level, top()));
  E.gainXp(t.h, xp);
  src[k] += xp; t.src[k] += xp;
}
addHero(0, 1);
const days = [];
let warCredit = 0, throneCredit = 0;
for (let day = 1; day <= 120 && team.some(t => t.h.level < MAX_LEVEL) || team.length < 4; day++) {
  for (let half = 0; half < 2; half++) {
    for (const t of team) {
      const h = t.h, snap = () => E.snapshot(E.buildBot({ id: 'sim' + t.i, name: 'Sim', classId: t.cls }, h.level, 'j' + day));
      const open = DUNGEONS.filter(d => d.lvl <= h.level).sort((a, b) => b.lvl - a.lvl);
      let k = 0;
      open.forEach((d, j) => { for (let r = 0; r < 3; r++) { gain(t, 'donjons', j < 2 ? E.waveXp(d) : Math.round(E.waveXp(d) / 2)); if (k < 5) { t.keys++; k++; } } });
      for (let r = 0; r < 3; r++) {
        const kills = E.createHorde(snap(), day * 1000 + half * 10 + r + t.i * 77).result().kills;
        gain(t, 'horde', Math.round((25 + 5 * h.level) * (0.4 + 0.1 * kills)));
      }
    }
    // nouveaux persos : le plus haut atteint 15, 30 puis 50
    while (team.length < 4 && top() >= E.HERO_UNLOCK[team.length]) addHero(team.length, day);
  }
  for (const t of team) {
    const h = t.h, snap = () => E.snapshot(E.buildBot({ id: 'sim' + t.i, name: 'Sim', classId: t.cls }, h.level, 'j' + day));
    for (let guard = 0; guard < 40; guard++) {
      const floor = t.tower + 1, m = E.towerMonster(floor);
      let won = false;
      for (let a = 0; a < 5 && !won; a++) won = E.simulate(snap(), m.snap, day * 7919 + floor * 31 + a + t.i).winner === 0;
      if (!won) break;
      t.tower = floor;
      gain(t, 'tour', Math.round((25 + 5 * Math.min(m.snap.level, h.level + 10)) * 0.3));
    }
    while (t.story < 150 && STORY.levels[t.story] <= h.level) gain(t, 'histoire', E.storyXp(t.story++));
    const chests = CHESTS_PER_DAY + t.keys + (t.i === 0 ? 0 : 0);
    t.keys = 0;
    for (let c = 0; c < chests; c++) gain(t, 'coffres', 20);
  }
  // le compte : coffres de combat, de guerre, clefs du trône et combat auto → perso principal
  const main = team[0];
  warCredit += 1 / 7; throneCredit += 2 / 7;
  const tk = Math.floor(throneCredit); throneCredit -= tk;
  for (let c = 0; c < COMBAT_CHESTS; c++) gain(main, 'coffres', 60);
  for (let c = 0; c < tk; c++) gain(main, 'coffres', 20);
  if (warCredit >= 1) { warCredit -= 1; gain(main, 'coffres', 120); }
  gain(main, 'auto', Math.round(E.xpForLevel(main.h.level) * AUTO.xpDayCap));
  days.push(team.map(t => t.h.level));
}
const at = (i, d) => (days[d - 1] || [])[i] ?? null;
const reach = (i, l) => { const d = days.findIndex(x => (x[i] ?? 0) >= l); return d < 0 ? '—' : d + 1; };
console.log('Arrivée des persos : ' + team.map(t => `${t.cls} jour ${t.day}`).join(', '));
console.log('\nJour  ' + team.map(t => t.cls.padStart(9)).join(''));
for (const d of [1, 2, 3, 4, 5, 7, 10, 14, 21, 28, 35, 42, 46, 50, 56, 63, 70]) {
  if (d > days.length) break;
  console.log(String(d).padStart(4), team.map((t, i) => String(at(i, d) ?? '-').padStart(9)).join(''));
}
console.log('\nNiveau ' + team.map(t => t.cls.padStart(9)).join(''));
for (const l of [15, 30, 50, 70, 80, 90, 100]) console.log(String(l).padStart(6), team.map((t, i) => String(reach(i, l)).padStart(9)).join(''));
const tot = Object.values(src).reduce((a, b) => a + b, 0);
console.log('\nPart de chaque source (tous les persos) :', Object.entries(src).map(([k, v]) => `${k} ${Math.round(100 * v / tot)} %`).join(', '));
console.log('JSON', JSON.stringify({ arrive: team.map(t => t.day), days }));
