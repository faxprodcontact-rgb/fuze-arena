const E = await import('/home/user/fuze-arena/js/engine.js');
const { RAID } = await import('/home/user/fuze-arena/js/data.js');
let t = RAID.tag, base = null;
for (let b = 0; b < 10; b++) {
  const d = E.raidDef(t);
  let dmg = 0, N = 150;
  for (let n = 0; n < N; n++) {
    const bot = E.buildBot({ id: 'r' + n, name: 'X', classId: ['guerrier', 'mage', 'archer'][n % 3] }, 30, 'd' + n); bot.level = 30;
    const boss = E.raidBoss(30, 1e7, 1e7, t);
    const r = E.simulate(E.snapshot(bot), boss, n * 13 + 7, { maxActions: RAID.maxActions, timeoutWinner: false });
    dmg += E.damageDealt(r, 1e7);
  }
  dmg /= N; base ??= dmg;
  console.log(t.padEnd(13), d.name.padEnd(18), 'dégâts/assaut', Math.round(dmg).toString().padStart(5), ' effort ×', (d.hpMult * base / dmg).toFixed(2));
  t = E.nextRaidTag(t);
}
