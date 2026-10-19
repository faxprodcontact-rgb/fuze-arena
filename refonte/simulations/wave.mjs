const E = await import('/home/user/fuze-arena/js/engine.js');
const { DUNGEONS } = await import('/home/user/fuze-arena/js/data.js');
const d = DUNGEONS.find(x => x.id === 'd10');
let wins = 0, kinds = {}, kills = [0,0,0,0];
for (let n = 0; n < 300; n++) {
  const bot = E.buildBot({ id: 'x'+n, name: 'X', classId: ['guerrier','mage','archer'][n%3] }, 13, 'd'+n); bot.level = 13;
  const w = E.createWave(E.snapshot(bot), E.dungeonWave(d), n * 31 + 1);
  let e; while ((e = w.next())) { if (['kill','nextFoe','end'].includes(e.type)) kinds[e.type] = (kinds[e.type]||0)+1; if (e.type==='nextFoe' && !(e.heal>=0)) console.log('bad heal', e); }
  const r = w.result(); if (r.winner === 0) wins++; kills[r.kills]++;
}
console.log('victoires d10 au niv 13 :', wins/3, '%', kinds, 'kills', kills);
