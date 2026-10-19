// Progression d'un nouveau joueur qui joue à fond (règles de la refonte) : niveau du perso principal, jour par jour.
// node refonte/simulations/progression.mjs [classe]
// Hypothèses (joueur assidu qui rate presque rien et gagne ses combats) :
// - Coffres : 1 toutes les 30 min, stock de 5 ; réveillé 16 h, il les ouvre régulièrement → 37 coffres/jour (+ toutes ses clefs).
// - Donjons : tous les donjons débloqués, 3 vagues toutes les 12 h (6 par jour) ; les 2 plus durs joués (XP pleine),
//   les autres passés avec le bouton (moitié de l'XP). Il gagne toutes ses vagues. Clefs de donjon : 5 par 12 h.
// - Horde : 6 essais par jour (vrais combats simulés). Raid : 6 assauts par jour. Tour : il monte tant qu'il gagne (vrais combats).
// - Arène : ~7 victoires par jour → 2 coffres de combat. Combat auto : le plafond de 25 % d'un niveau par jour.
// - Championnat / guerre / trône : ~1 coffre de guerre et 2 clefs par semaine.
// - Force du héros : celle d'un bot du même niveau (points placés, équipement selon le niveau).
// - Scénario A : au lancement, tout le monde repart de zéro (pas d'aide aux retardataires).
//   Scénario B : il arrive alors que les autres sont niveau 100 (aide aux retardataires, jusqu'à ×2).
import * as E from '../../js/engine.js';
import { DUNGEONS, MAX_LEVEL, AUTO, RAID } from '../../js/data.js';

const cls = process.argv[2] || 'guerrier';
const CHESTS_PER_DAY = 37, COMBAT_CHESTS = 2;

function run(catchup) {
  const hero = E.newHero('Sim', cls);
  const days = [];
  let towerBest = 0, warChestCredit = 0, throneKeys = 0;
  const src = { coffres: 0, donjons: 0, horde: 0, raid: 0, tour: 0, auto: 0 };
  const gain = (k, xp) => {
    if (hero.level >= MAX_LEVEL) return;
    E.setXpBonus(catchup ? E.catchupBonus(hero.level, MAX_LEVEL) : 1);
    const lv0 = hero.level, xp0 = hero.xp;
    E.gainXp(hero, xp);
    src[k] += xp;
    return lv0 !== hero.level || xp0 !== hero.xp;
  };
  for (let day = 1; day <= 400 && hero.level < MAX_LEVEL; day++) {
    const snap = () => E.snapshot(E.buildBot({ id: 'sim', name: 'Sim', classId: cls }, hero.level, 'j' + day));
    // deux demi-journées (remises à zéro à minuit et à midi)
    for (let half = 0; half < 2; half++) {
      // donjons : les 2 plus durs en vrai, les autres passés (moitié de l'XP)
      const open = DUNGEONS.filter(d => d.lvl <= hero.level).sort((a, b) => b.lvl - a.lvl);
      let keys = 0;
      open.forEach((d, i) => {
        for (let r = 0; r < 3; r++) {
          gain('donjons', i < 2 ? E.waveXp(d) : Math.round(E.waveXp(d) / 2));
          if (keys < 5) { hero.keys = (hero.keys || 0) + 1; keys++; }
        }
      });
      // horde : 3 essais (vrais combats)
      for (let t = 0; t < 3; t++) {
        const kills = E.createHorde(snap(), day * 1000 + half * 10 + t).result().kills;
        gain('horde', Math.round((25 + 5 * hero.level) * (0.4 + 0.1 * kills)));
      }
      // raid : 3 assauts
      for (let t = 0; t < RAID.attemptsPerHalf; t++) gain('raid', 25 + 5 * hero.level);
    }
    // tour : il monte tant qu'il gagne (jusqu'à 5 essais par étage)
    for (let guard = 0; guard < 40; guard++) {
      const floor = towerBest + 1, m = E.towerMonster(floor);
      let won = false;
      for (let a = 0; a < 5 && !won; a++) won = E.simulate(snap(), m.snap, day * 7919 + floor * 31 + a).winner === 0;
      if (!won) break;
      towerBest = floor;
      gain('tour', Math.round((25 + 5 * Math.min(m.snap.level, hero.level + 10)) * 0.3));
    }
    // coffres : stock + clefs (niveaux, donjons, trône), coffres de combat, coffre de guerre de la semaine
    warChestCredit += 1 / 7; throneKeys += 2 / 7;
    const extraKeys = Math.floor(throneKeys); throneKeys -= extraKeys;
    const normal = CHESTS_PER_DAY + (hero.keys || 0) + extraKeys;
    hero.keys = 0;
    for (let c = 0; c < normal; c++) gain('coffres', 20);
    for (let c = 0; c < COMBAT_CHESTS; c++) gain('coffres', 60);
    if (warChestCredit >= 1) { warChestCredit -= 1; gain('coffres', 120); }
    // combat auto : le plafond du jour (25 % d'un niveau)
    gain('auto', Math.round(E.xpForLevel(hero.level) * AUTO.xpDayCap));
    days.push({ day, level: hero.level, xp: hero.xp, tower: towerBest });
    hero.keys = 0;   // les clefs gagnées en route ont été comptées ci-dessus ; celles des montées de niveau du soir partent le lendemain
  }
  return { days, src };
}

const A = run(false), B = run(true);
const at = (res, d) => res.days[Math.min(d, res.days.length) - 1];
const reach = (res, lvl) => (res.days.find(x => x.level >= lvl) || {}).day || '—';
console.log(`Classe : ${cls}`);
console.log('\nJour   A (lancement)   B (arrive après les autres)');
for (const d of [1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 28, 35, 42, 49, 56, 63, 70, 84, 98, 112, 126, 140, 154, 168]) {
  if (d > Math.max(A.days.length, B.days.length) + 7) break;
  console.log(String(d).padStart(4), String(at(A, d).level).padStart(10), String(at(B, d).level).padStart(14));
}
console.log('\nNiveau   jour A   jour B');
for (const l of [10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100]) console.log(String(l).padStart(6), String(reach(A, l)).padStart(8), String(reach(B, l)).padStart(8));
const tot = (s) => Object.values(s).reduce((a, b) => a + b, 0);
console.log('\nPart de chaque source (A) :', Object.entries(A.src).map(([k, v]) => `${k} ${Math.round(100 * v / tot(A.src))} %`).join(', '));
console.log('JSON', JSON.stringify({ A: A.days.map(d => d.level), B: B.days.map(d => d.level) }));
