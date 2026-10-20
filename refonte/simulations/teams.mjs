// Équipes de test : persos niveau L, tous les emplacements en rareté R, meilleure panoplie à 5 pièces + meilleur familier
export async function setup() {
  const E = await import('../../js/engine.js');
  const D = await import('../../js/' + (await import('fs')).readFileSync(new URL('../../js/engine.js', import.meta.url), 'utf8').match(/data\.js\?v=\d+/)[0]);
  const CL = ['guerrier', 'mage', 'archer', 'paladin'];
  const sets = Object.keys(D.SETS).filter(s => D.ITEM_LIST.filter(i => i.set === s).length >= 5);
  const pets = D.ITEM_LIST.filter(i => i.slot === 'pet');
  const cache = new Map();
  function hero(cls, L, R, seed = 1) {
    const key = [cls, L, R, seed].join(':');
    if (cache.has(key)) return cache.get(key);
    let best = null, bp = -1;
    for (const set of sets) {
      const h = E.buildBot({ id: 'm' + cls + seed, name: 'X', classId: cls }, L, 'max' + seed);
      h.level = L; h.inventory = []; h.equipped = {};
      if (R >= 0) {
        for (const it of D.ITEM_LIST.filter(i => i.set === set)) { const x = E.addItem(h, it.id, R); h.equipped[it.slot] = x.uid; }
        const pet = pets.find(p => D.PETS[p.id] && D.PETS[p.id].aff[0] === cls) || pets[0];
        const x = E.addItem(h, pet.id, R); h.equipped.pet = x.uid;
      }
      const sn = E.snapshot(h), p = E.powerScore(sn);
      if (p > bp) { bp = p; best = sn; }
      if (R < 0) break;
    }
    cache.set(key, best);
    return best;
  }
  const team = (L, R, seed = 1) => CL.map(c => hero(c, L, R, seed));
  const power = (t) => Math.round(t.reduce((s, m) => s + E.powerScore(m), 0));
  return { E, D, hero, team, power, CL };
}
