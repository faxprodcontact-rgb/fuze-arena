const E = await import('/home/user/fuze-arena/js/engine.js');
const classes = ['guerrier', 'mage', 'archer', 'guerrier'];
const bot = (c, lvl, seed) => { const b = E.buildBot({ id: 'b' + seed, name: 'P', classId: c }, lvl, 's' + seed); b.level = lvl; return E.snapshot(b); };
// niveau de bot qui donne ~600 de puissance, par classe (moyenne sur plusieurs tirages d'équipement)
const powAt = (lvl) => { let t = 0; for (let s = 0; s < 40; s++) t += E.powerScore(bot(classes[s % 3], lvl, s)); return t / 40; };
for (const l of [15, 20, 25, 30, 35, 40]) console.log('niveau', l, '→ puissance moyenne', Math.round(powAt(l)));
// équipes où chaque perso fait 550-650 de puissance
const pickTeam = (target, seed) => classes.map((c, i) => { for (let s = 0; s < 4000; s++) { for (let lvl = 10; lvl <= 60; lvl++) { const sn = bot(c, lvl, seed * 9973 + i * 131 + s); const p = E.powerScore(sn); if (Math.abs(p - target) < 25) return sn; } } return null; });
for (const [label, target] of [['4 persos à ~600', 600], ['4 persos à ~500', 500], ['4 persos à ~700', 700]]) {
  const res = [];
  for (let k = 0; k < 6; k++) {
    const team = pickTeam(target, k);
    const acc = { pseudo: 'p' + target + k };
    for (let n = 0; n < 1500; n++) E.autoResolve(acc, team);   // largement de quoi atteindre le plafond
    res.push(acc.auto.best);
  }
  res.sort((a, b) => a - b);
  const f = (g) => `D${E.autoDiff(g)}·P${E.autoPalier(g)}`;
  console.log(`${label} : bloque entre ${f(res[0])} et ${f(res[res.length - 1])} (médiane ${f(res[3])})`);
}
