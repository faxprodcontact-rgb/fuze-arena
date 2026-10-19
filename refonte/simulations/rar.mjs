const E = await import('/home/user/fuze-arena/js/engine.js');
const D = await import('/home/user/fuze-arena/js/data.js?v=20261019124259');
console.log('objets différents :', D.ITEM_LIST.length, '| par emplacement :', JSON.stringify(Object.fromEntries(D.SLOT_ORDER.map(s => [s, D.ITEM_LIST.filter(i => i.slot === s).length]))));
const mk = (lvl, rarity, seed) => {
  const h = E.buildBot({ id: 'z' + seed, name: 'X', classId: ['guerrier', 'mage', 'archer'][seed % 3] }, lvl, 'q' + seed); h.level = lvl;
  h.inventory = []; h.equipped = {};
  for (const slot of D.SLOT_ORDER) { if (rarity < 0) continue; const pool = D.ITEM_LIST.filter(i => i.slot === slot); const it = E.addItem(h, pool[seed % pool.length].id, rarity); h.equipped[slot] = it.uid; }
  return E.snapshot(h);
};
for (const lvl of [20, 50]) {
  const base = mk(lvl, -1, 1);
  console.log(`\n== Niveau ${lvl} : puissance sans objet ${Math.round(E.powerScore(base))}`);
  for (const r of [2, 3, 4, 5, 6]) console.log(`  tout en ${D.RARITIES[r].name.padEnd(10)} puissance ${Math.round(E.powerScore(mk(lvl, r, 1)))}`);
  const duel = (ra, rb, la = lvl, lb = lvl) => { let w = 0, N = 300; for (let n = 0; n < N; n++) if (E.simulate(mk(la, ra, n), mk(lb, rb, n + 1), n * 7 + 3).winner === 0) w++; return Math.round(100 * w / N); };
  console.log(`  Mythique contre Légendaire (même niveau) : ${duel(5, 4)} % de victoires`);
  console.log(`  Chaotique contre Légendaire (même niveau) : ${duel(6, 4)} % de victoires`);
  console.log(`  Légendaire contre Épique (même niveau) : ${duel(4, 3)} % de victoires`);
  console.log(`  Chaotique niv ${lvl} contre Légendaire niv ${lvl + 15} : ${duel(6, 4, lvl, lvl + 15)} % de victoires`);
}
// coût : combien de coffres de combat pour 2 légendaires identiques d'un même objet
process.exit(0);
console.log(`\nCoût moyen (coffres de combat seuls, sans fusion d'objets plus bas) : 1 Légendaire d'un objet précis ≈ ${Math.round(n / p)} coffres → Mythique ≈ ${Math.round(2 * n / p)}, Chaotique ≈ ${Math.round(4 * n / p)}`);
