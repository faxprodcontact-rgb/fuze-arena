const E = await import('/home/user/fuze-arena/js/engine.js');
const acc = { heroes: [{level:16},{level:18},{level:14}] };
for (const h of acc.heroes) {
  const c = E.catchupBonus(h.level, 26);
  E.setXpBonus(c, E.altXpBonus(acc, h));
  console.log('niv', h.level, 'rattrapage', Math.round((E.getXpBonus()-1)*100)+'%', 'secondaire ×'+E.getAltXpBonus());
}
console.log('cap 100%:', E.catchupBonus(2, 40));
