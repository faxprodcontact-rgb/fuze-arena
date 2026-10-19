const E = await import('/home/user/fuze-arena/js/engine.js');
const { DUNGEONS } = await import('/home/user/fuze-arena/js/data.js');
const classes = ['guerrier','mage','archer'];
const N = 150;
function wave(d, lvl) {
  let wins = 0, bossOnly = 0;
  for (let n = 0; n < N; n++) {
    const c = classes[n % 3];
    const bot = E.buildBot({ id: 'x'+n, name: 'X', classId: c }, lvl, 'd'+n);
    bot.level = lvl;
    const me = E.snapshot(bot);
    const w = E.dungeonWave(d);
    let hp = me.maxHp, ok = true;
    for (let i = 0; i < w.length; i++) {
      const r = E.createFight({ ...me, hp }, w[i], (n*7919+i)|0).result();
      if (r.winner !== 0) { ok = false; break; }
      const left = r.hp ? r.hp[0] : null;
      hp = i < w.length-1 ? E.waveNextHp(me, left ?? me.maxHp) : hp;
    }
    if (ok) wins++;
  }
  return Math.round(100*wins/N);
}
const offs = process.argv.slice(2).map(Number);
for (const d of DUNGEONS) {
  const row = offs.map(o => { const l = d.lvl + o; return l < 1 ? '-' : wave(d, l) + '%'; });
  console.log(d.id.padEnd(5), row.join('\t'));
}
