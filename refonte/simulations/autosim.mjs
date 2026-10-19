const E = await import('/home/user/fuze-arena/js/engine.js');
const team = (lvl) => ['guerrier', 'mage', 'archer', 'guerrier'].map((c, i) => { const b = E.buildBot({ id: 'a' + i, name: 'P', classId: c }, lvl, 'x'); b.level = lvl; return E.snapshot(b); });
for (const lvl of [5, 15, 30, 50, 70, 90, 100]) {
  const acc = { pseudo: 'test' + lvl };
  const t = team(lvl);
  let hours = [];
  for (let h = 1; h <= 24; h++) {
    for (let k = 0; k < 120; k++) E.autoResolve(acc, t);   // 120 combats = 1 h
    if ([1, 4, 8, 24].includes(h)) hours.push(`${h}h: D${E.autoDiff(Math.min(acc.auto.best, 1000))} P${E.autoPalier(Math.min(acc.auto.best, 1000))} (${acc.auto.bank.keys} clefs)`);
  }
  console.log(`Équipe niv ${String(lvl).padStart(3)} →`, hours.join(' | '));
}
