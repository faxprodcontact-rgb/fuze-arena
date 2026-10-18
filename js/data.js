// =====================================================================
//  DONNÉES DU JEU — c'est ici qu'on change les noms, stats, sorts, objets
// =====================================================================

export const MAX_LEVEL = 100;
export const POINTS_PER_LEVEL = 3;
export const CHEST_INTERVAL_MS = 30 * 60 * 1000;     // un coffre toutes les 30 min
export const CHEST_MAX = 5;                          // cumulables jusqu'à 5
export const WINS_PER_COMBAT_CHEST = 3;              // 3 victoires = 1 coffre de combat
export const MAX_ACTIVE_SPELLS = 4;
export const DUNGEON_RUNS = 3;      // chaque donjon : 3 combats toutes les 12 h (remise à zéro à minuit et à midi), par personnage
export const DUNGEON_KEYS_MAX = 5;  // clefs gagnées au maximum en donjon toutes les 12 h, par personnage (ensuite : XP seulement)
export const DUNGEON_SKIP_KEEP = 2; // les 2 donjons débloqués les plus durs se font en vrai ; les autres peuvent être passés (XP divisée par 2)
export const KEY_PRICE = 50;       // une clef coûte 100 Flouze à la boutique (1 clef = 1 coffre)
export const SELL_PRICE = [1, 3, 7, 16, 40];   // revente d'un objet selon sa rareté (en Flouze)
export const STAT_RESET_COST = 20;  // replacer ses points coûte 20 Flouze
// Remise à zéro générale (tous les compteurs) : changer ce code la relance pour tout le monde
export const RESET_ID = '2026-10-18-maj';

export const STAT_KEYS = ['vit', 'atk', 'mag', 'def', 'spd', 'lck'];

export const STATS = {
  vit: { name: 'Vitalité', short: 'VIT', color: '#ff5d6c', desc: '+8 points de vie par point' },
  atk: { name: 'Attaque', short: 'ATQ', color: '#ff9f43', desc: 'Dégâts des coups physiques' },
  mag: { name: 'Magie', short: 'MAG', color: '#a77bff', desc: 'Dégâts des sorts magiques et soins' },
  def: { name: 'Défense', short: 'DÉF', color: '#54a0ff', desc: 'Réduit les dégâts reçus' },
  spd: { name: 'Vitesse', short: 'VIT+', color: '#1dd1a1', desc: 'Joue plus souvent' },
  lck: { name: 'Chance', short: 'CHA', color: '#feca57', desc: 'Coups critiques et esquives' },
};

export const RARITIES = [
  { id: 0, name: 'Commun', color: '#a4a9b3', mult: 1 },
  { id: 1, name: 'Peu commun', color: '#4cd964', mult: 1.8 },
  { id: 2, name: 'Rare', color: '#3d9bff', mult: 3.2 },
  { id: 3, name: 'Épique', color: '#b05cff', mult: 5.5 },
  { id: 4, name: 'Légendaire', color: '#ff9f1a', mult: 9 },
];

// Probabilités de rareté dans les coffres (en %)
export const CHEST_ODDS = {
  normal: [72, 22, 5, 1, 0],
  combat: [40, 38, 16, 5, 1],
  war: [0, 50, 32, 14, 4],     // coffre de guerre : jamais de Commun
};

// ---------------------------------------------------------------------
//  GUERRE DES SECTIONS — une guerre dure 7 jours complets (à partir du samedi 17/10/2026 à 00:00)
// ---------------------------------------------------------------------
export const WAR = {
  sections: {
    rouge: { name: 'Section Rouge', color: '#ff5d6c' },
    bleue: { name: 'Section Bleue', color: '#3d9bff' },
  },
  start: [2026, 9, 17],    // début de la 1re guerre (année, mois - 1, jour) : ensuite une toutes les 7 jours
  minAttacks: 5,           // attaques minimum dans la semaine pour toucher la récompense
  changeCooldownDays: 30,  // on ne peut changer de section qu'une fois par mois
  maxPerSection: 4,        // 8 joueurs max dans le jeu = 4 par section
  warChestItems: 3,        // objets dans un coffre de guerre
};

export const SLOTS = {
  hat: { name: 'Chapeau' },
  weapon: { name: 'Arme' },
  armor: { name: 'Armure' },
  boots: { name: 'Bottes' },
  amulet: { name: 'Amulette' },
  pet: { name: 'Familier' },
};
export const SLOT_ORDER = ['hat', 'weapon', 'armor', 'boots', 'amulet', 'pet'];

// ---------------------------------------------------------------------
//  CLASSES
//  base = stats au niveau 1, growth = stats gagnées automatiquement par niveau
// ---------------------------------------------------------------------
export const CLASSES = {
  guerrier: {
    name: 'Guerrier',
    desc: 'Solide et brutal. Encaisse les coups et frappe fort au corps à corps.',
    weapon: 'sword',
    base: { vit: 14, atk: 12, mag: 2, def: 10, spd: 8, lck: 4 },
    growth: { vit: 1.2, atk: 1.0, mag: 0.1, def: 0.8, spd: 0.4, lck: 0.3 },
    basic: { name: "Coup d'épée", scale: 'atk', mult: 1, melee: true, fx: 'slash' },
  },
  mage: {
    name: 'Mage',
    desc: 'Fragile mais dévastateur. Brûle, gèle et foudroie à distance.',
    weapon: 'staff',
    base: { vit: 9, atk: 3, mag: 15, def: 5, spd: 9, lck: 6 },
    growth: { vit: 0.9, atk: 0.1, mag: 1.2, def: 0.4, spd: 0.4, lck: 0.4 },
    basic: { name: 'Trait magique', scale: 'mag', mult: 0.95, fx: 'bolt' },
  },
  archer: {
    name: 'Archer',
    desc: 'Rapide et précis. Critiques, poison et pluies de flèches.',
    weapon: 'bow',
    base: { vit: 11, atk: 12, mag: 2, def: 7, spd: 13, lck: 10 },
    growth: { vit: 1.1, atk: 1.0, mag: 0.1, def: 0.4, spd: 0.8, lck: 0.6 },
    basic: { name: 'Tir', scale: 'atk', mult: 1, fx: 'arrow' },
  },
  paladin: {
    name: 'Paladin',
    desc: 'Chevalier sacré. Se soigne, se protège et use son adversaire.',
    weapon: 'hammer',
    base: { vit: 12, atk: 8, mag: 8, def: 10, spd: 7, lck: 4 },
    growth: { vit: 1.1, atk: 0.6, mag: 0.7, def: 0.8, spd: 0.4, lck: 0.2 },
    basic: { name: 'Coup de marteau', scale: 'mix', mult: 1, melee: true, fx: 'bash' },
  },
};

// ---------------------------------------------------------------------
//  SORTS — un nouveau sort tous les 10 niveaux (1, 10, 20 … 100)
//  scale : stat utilisée (atk, mag, def, ou mix = moyenne attaque/magie)
//  mult : puissance (1.5 = 150 %), hits : nombre de coups, cd : recharge en tours
// ---------------------------------------------------------------------
const S = (cls, list) => list.map(s => ({ ...s, cls }));

export const SPELL_LIST = [
  ...S('guerrier', [
    { id: 'g1', lvl: 1, name: 'Coup puissant', cd: 2, scale: 'atk', mult: 1.6, melee: true, fx: 'slash', desc: 'Gros coup d’épée (160 % Attaque).' },
    { id: 'g10', lvl: 10, name: 'Cri de guerre', cd: 5, fx: 'roar', effects: [{ k: 'buff', stat: 'atk', pct: 0.45, turns: 3 }], desc: '+45 % Attaque pendant 3 tours.' },
    { id: 'g20', lvl: 20, name: 'Brise-armure', cd: 4, scale: 'atk', mult: 1.1, melee: true, fx: 'bash', effects: [{ k: 'debuff', stat: 'def', pct: 0.3, turns: 3 }], desc: '110 % Attaque et −30 % Défense ennemie (3 tours).' },
    { id: 'g30', lvl: 30, name: 'Bouclier levé', cd: 5, fx: 'shield', effects: [{ k: 'shield', scale: 'def', mult: 2.5 }], desc: 'Bouclier qui absorbe 250 % de ta Défense.' },
    { id: 'g40', lvl: 40, name: 'Tourbillon', cd: 4, scale: 'atk', mult: 0.65, hits: 3, melee: true, fx: 'whirl', desc: '3 coups de 65 % Attaque.' },
    { id: 'g50', lvl: 50, name: 'Coup de bouclier', cd: 5, scale: 'atk', mult: 0.9, melee: true, fx: 'bash', effects: [{ k: 'stun', chance: 0.45 }], desc: '90 % Attaque, 45 % de chance d’étourdir.' },
    { id: 'g60', lvl: 60, name: 'Second souffle', cd: 6, fx: 'heal', effects: [{ k: 'heal', pctMax: 0.2 }], desc: 'Rend 20 % des PV max.' },
    { id: 'g70', lvl: 70, name: 'Charge', cd: 4, scale: 'atk', mult: 2.1, melee: true, fx: 'slash', desc: 'Fonce sur l’ennemi (210 % Attaque).' },
    { id: 'g80', lvl: 80, name: 'Rage sanguinaire', cd: 5, scale: 'atk', mult: 1.5, lifesteal: 0.5, melee: true, fx: 'slash', desc: '150 % Attaque, vole 50 % des dégâts.' },
    { id: 'g90', lvl: 90, name: 'Exécution', cd: 5, scale: 'atk', mult: 1.7, execute: 1, melee: true, fx: 'slash', desc: '170 % Attaque, double si l’ennemi a moins de 35 % PV.' },
    { id: 'g100', lvl: 100, name: 'Colère du Titan', cd: 8, scale: 'atk', mult: 3.2, melee: true, fx: 'bash', effects: [{ k: 'stun', chance: 1 }], desc: '320 % Attaque et étourdit à coup sûr.' },
    { id: 'g15', lvl: 15, name: 'Provocation', cd: 4, scale: 'atk', mult: 0.8, melee: true, fx: 'bash', effects: [{ k: 'debuff', stat: 'atk', pct: 0.2, turns: 3 }], desc: '80 % Attaque et −20 % Attaque ennemie (3 tours).' },
    { id: 'g35', lvl: 35, name: 'Saignée', cd: 4, scale: 'atk', mult: 0.9, melee: true, fx: 'slash', effects: [{ k: 'dot', kind: 'poison', name: 'Saignement', mult: 0.3, turns: 3 }], desc: '90 % Attaque + saignement 3 tours.' },
    { id: 'g45', lvl: 45, name: 'Peau de fer', cd: 6, fx: 'buff', effects: [{ k: 'buff', stat: 'def', pct: 0.5, turns: 3 }], desc: '+50 % Défense pendant 3 tours.' },
    { id: 'g65', lvl: 65, name: 'Double tranchant', cd: 4, scale: 'atk', mult: 0.95, hits: 2, crit: 0.15, melee: true, fx: 'slash', desc: '2 coups de 95 % Attaque, +15 % de critique.' },
    { id: 'g85', lvl: 85, name: 'Cri de ralliement', cd: 6, fx: 'roar', effects: [{ k: 'heal', pctMax: 0.15 }, { k: 'buff', stat: 'atk', pct: 0.25, turns: 3 }], desc: 'Rend 15 % des PV et +25 % Attaque (3 tours).' },
  ]),
  ...S('mage', [
    { id: 'm1', lvl: 1, name: 'Boule de feu', cd: 2, scale: 'mag', mult: 1.15, fx: 'fireball', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.2, turns: 3 }], desc: '115 % Magie + brûlure 3 tours.' },
    { id: 'm10', lvl: 10, name: 'Éclair', cd: 3, scale: 'mag', mult: 1.6, fx: 'lightning', desc: 'La foudre tombe (160 % Magie).' },
    { id: 'm20', lvl: 20, name: 'Armure de givre', cd: 5, fx: 'shield', effects: [{ k: 'shield', scale: 'mag', mult: 1.2 }], desc: 'Bouclier de glace (120 % Magie).' },
    { id: 'm30', lvl: 30, name: 'Gel', cd: 4, scale: 'mag', mult: 0.9, fx: 'ice', effects: [{ k: 'debuff', stat: 'spd', pct: 0.25, turns: 3 }], desc: '90 % Magie et −25 % Vitesse ennemie.' },
    { id: 'm40', lvl: 40, name: 'Pluie de feu', cd: 5, scale: 'mag', mult: 0.5, hits: 4, fx: 'firerain', desc: '4 boules de 50 % Magie.' },
    { id: 'm50', lvl: 50, name: 'Siphon', cd: 4, scale: 'mag', mult: 1.2, lifesteal: 0.35, fx: 'drain', desc: '120 % Magie, vole 35 % des dégâts.' },
    { id: 'm60', lvl: 60, name: 'Concentration', cd: 5, fx: 'buff', effects: [{ k: 'buff', stat: 'mag', pct: 0.3, turns: 3 }], desc: '+30 % Magie pendant 3 tours.' },
    { id: 'm70', lvl: 70, name: 'Prison de glace', cd: 6, scale: 'mag', mult: 1, fx: 'ice', effects: [{ k: 'stun', chance: 0.6 }], desc: '100 % Magie, 60 % de chance d’étourdir.' },
    { id: 'm80', lvl: 80, name: 'Combustion', cd: 5, scale: 'mag', mult: 0.8, fx: 'fireball', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.45, turns: 4 }], desc: '80 % Magie + grosse brûlure 4 tours.' },
    { id: 'm90', lvl: 90, name: 'Météore', cd: 7, scale: 'mag', mult: 3, fx: 'meteor', desc: 'Un météore s’écrase (300 % Magie).' },
    { id: 'm100', lvl: 100, name: 'Apocalypse', cd: 8, scale: 'mag', mult: 1.6, hits: 3, fx: 'meteor', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.5, turns: 3 }], desc: '3 météores de 160 % Magie + brûlure.' },
    { id: 'm15', lvl: 15, name: 'Missiles arcaniques', cd: 2, scale: 'mag', mult: 0.6, hits: 2, fx: 'bolt', desc: '2 missiles de 60 % Magie.' },
    { id: 'm35', lvl: 35, name: 'Nova de givre', cd: 5, scale: 'mag', mult: 0.8, fx: 'ice', effects: [{ k: 'stun', chance: 0.35 }], desc: '80 % Magie, 35 % de chance de geler l’ennemi.' },
    { id: 'm45', lvl: 45, name: 'Bouclier de mana', cd: 5, fx: 'shield', effects: [{ k: 'shield', scale: 'mag', mult: 1.6 }], desc: 'Bouclier qui absorbe 160 % de ta Magie.' },
    { id: 'm65', lvl: 65, name: 'Chaîne d’éclairs', cd: 5, scale: 'mag', mult: 0.7, hits: 3, fx: 'lightning', desc: '3 éclairs de 70 % Magie.' },
    { id: 'm85', lvl: 85, name: 'Embrasement', cd: 6, scale: 'mag', mult: 1.9, fx: 'fireball', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.4, turns: 3 }], desc: 'Énorme boule de feu (190 % Magie) + brûlure.' },
  ]),
  ...S('archer', [
    { id: 'a1', lvl: 1, name: 'Tir précis', cd: 2, scale: 'atk', mult: 1.5, crit: 0.2, fx: 'arrow', desc: '150 % Attaque, +20 % de critique.' },
    { id: 'a10', lvl: 10, name: 'Flèche empoisonnée', cd: 3, scale: 'atk', mult: 0.8, fx: 'poisonArrow', effects: [{ k: 'dot', kind: 'poison', name: 'Poison', mult: 0.3, turns: 4 }], desc: '80 % Attaque + poison 4 tours.' },
    { id: 'a20', lvl: 20, name: 'Double tir', cd: 3, scale: 'atk', mult: 0.8, hits: 2, fx: 'arrow', desc: '2 flèches de 80 % Attaque.' },
    { id: 'a30', lvl: 30, name: 'Pas de côté', cd: 5, fx: 'buff', effects: [{ k: 'buff', stat: 'lck', pct: 0.8, turns: 3 }], desc: '+80 % Chance pendant 3 tours.' },
    { id: 'a40', lvl: 40, name: 'Flèche perçante', cd: 4, scale: 'atk', mult: 1.5, pierce: 0.6, fx: 'arrow', desc: '150 % Attaque, ignore 60 % de la Défense.' },
    { id: 'a50', lvl: 50, name: 'Piège à loup', cd: 5, scale: 'atk', mult: 0.7, fx: 'trap', effects: [{ k: 'stun', chance: 0.5 }], desc: '70 % Attaque, 50 % de chance d’étourdir.' },
    { id: 'a60', lvl: 60, name: 'Œil de faucon', cd: 5, fx: 'buff', effects: [{ k: 'buff', stat: 'atk', pct: 0.35, turns: 3 }], desc: '+35 % Attaque pendant 3 tours.' },
    { id: 'a70', lvl: 70, name: 'Volée', cd: 5, scale: 'atk', mult: 0.45, hits: 5, fx: 'rain', desc: '5 flèches de 45 % Attaque.' },
    { id: 'a80', lvl: 80, name: 'Flèche vampirique', cd: 4, scale: 'atk', mult: 1.3, lifesteal: 0.4, fx: 'drain', desc: '130 % Attaque, vole 40 % des dégâts.' },
    { id: 'a90', lvl: 90, name: 'Tir mortel', cd: 6, scale: 'atk', mult: 2.4, crit: 0.4, fx: 'arrow', desc: '240 % Attaque, +40 % de critique.' },
    { id: 'a100', lvl: 100, name: 'Tempête de flèches', cd: 8, scale: 'atk', mult: 0.5, hits: 8, fx: 'rain', desc: '8 flèches de 50 % Attaque.' },
    { id: 'a15', lvl: 15, name: 'Flèche enflammée', cd: 3, scale: 'atk', mult: 1, fx: 'arrow', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.25, turns: 3 }], desc: '100 % Attaque + brûlure 3 tours.' },
    { id: 'a35', lvl: 35, name: 'Tir entravant', cd: 4, scale: 'atk', mult: 1.2, fx: 'arrow', effects: [{ k: 'debuff', stat: 'spd', pct: 0.3, turns: 3 }], desc: '120 % Attaque et −30 % Vitesse ennemie.' },
    { id: 'a45', lvl: 45, name: 'Camouflage', cd: 6, fx: 'buff', effects: [{ k: 'buff', stat: 'lck', pct: 1, turns: 2 }], desc: '+100 % Chance pendant 2 tours (esquives et critiques).' },
    { id: 'a65', lvl: 65, name: 'Flèche lourde', cd: 5, scale: 'atk', mult: 1.8, pierce: 0.3, fx: 'arrow', desc: '180 % Attaque, ignore 30 % de la Défense.' },
    { id: 'a85', lvl: 85, name: 'Pluie empoisonnée', cd: 6, scale: 'atk', mult: 0.45, hits: 4, fx: 'rain', effects: [{ k: 'dot', kind: 'poison', name: 'Poison', mult: 0.3, turns: 3 }], desc: '4 flèches de 45 % Attaque + poison.' },
  ]),
  ...S('paladin', [
    { id: 'p1', lvl: 1, name: 'Frappe sacrée', cd: 2, scale: 'mix', mult: 1.4, melee: true, fx: 'bash', desc: '140 % Attaque/Magie au marteau.' },
    { id: 'p10', lvl: 10, name: 'Lumière apaisante', cd: 4, fx: 'heal', effects: [{ k: 'heal', scale: 'mag', mult: 2.2 }], desc: 'Soigne 220 % de ta Magie.' },
    { id: 'p20', lvl: 20, name: 'Bouclier divin', cd: 5, fx: 'shield', effects: [{ k: 'shield', scale: 'def', mult: 2.2 }], desc: 'Bouclier qui absorbe 220 % de ta Défense.' },
    { id: 'p30', lvl: 30, name: 'Jugement', cd: 4, scale: 'mix', mult: 1.1, fx: 'holy', effects: [{ k: 'debuff', stat: 'atk', pct: 0.25, turns: 3 }], desc: '110 % et −25 % Attaque ennemie.' },
    { id: 'p40', lvl: 40, name: 'Marteau de justice', cd: 5, scale: 'mix', mult: 1, melee: true, fx: 'bash', effects: [{ k: 'stun', chance: 0.5 }], desc: '100 %, 50 % de chance d’étourdir.' },
    { id: 'p50', lvl: 50, name: 'Aura de vaillance', cd: 5, fx: 'buff', effects: [{ k: 'buff', stat: 'def', pct: 0.4, turns: 3 }], desc: '+40 % Défense pendant 3 tours.' },
    { id: 'p60', lvl: 60, name: 'Consécration', cd: 5, scale: 'mix', mult: 0.5, hits: 3, fx: 'holy', effects: [{ k: 'heal', scale: 'mag', mult: 1 }], desc: '3 frappes de lumière et petit soin.' },
    { id: 'p70', lvl: 70, name: 'Châtiment', cd: 4, scale: 'mix', mult: 1.8, pierce: 0.3, fx: 'holy', desc: '180 %, ignore 30 % de la Défense.' },
    { id: 'p80', lvl: 80, name: 'Renouveau', cd: 6, fx: 'heal', effects: [{ k: 'heal', pctMax: 0.3 }], desc: 'Rend 30 % des PV max.' },
    { id: 'p90', lvl: 90, name: 'Colère céleste', cd: 6, scale: 'mix', mult: 2.2, fx: 'holy', desc: 'Pilier de lumière (220 %).' },
    { id: 'p100', lvl: 100, name: 'Intervention divine', cd: 9, fx: 'heal', effects: [{ k: 'heal', pctMax: 0.3 }, { k: 'shield', scale: 'mag', mult: 1.2 }], desc: 'Rend 30 % des PV et donne un bouclier.' },
    { id: 'p15', lvl: 15, name: 'Bénédiction', cd: 5, fx: 'heal', effects: [{ k: 'heal', scale: 'mag', mult: 1.2 }, { k: 'buff', stat: 'def', pct: 0.25, turns: 3 }], desc: 'Soigne 120 % de ta Magie et +25 % Défense.' },
    { id: 'p35', lvl: 35, name: 'Bouclier lancé', cd: 4, scale: 'mix', mult: 1.2, fx: 'holy', effects: [{ k: 'stun', chance: 0.25 }], desc: '120 %, 25 % de chance d’étourdir.' },
    { id: 'p45', lvl: 45, name: 'Lumière purificatrice', cd: 5, scale: 'mix', mult: 0.9, fx: 'holy', effects: [{ k: 'heal', scale: 'mag', mult: 1.2 }], desc: '90 % et te soigne de 120 % de ta Magie.' },
    { id: 'p65', lvl: 65, name: 'Égide', cd: 6, fx: 'shield', effects: [{ k: 'shield', scale: 'def', mult: 3 }], desc: 'Bouclier qui absorbe 300 % de ta Défense.' },
    { id: 'p85', lvl: 85, name: 'Marteau du jugement', cd: 6, scale: 'mix', mult: 2.4, melee: true, fx: 'bash', effects: [{ k: 'debuff', stat: 'def', pct: 0.3, turns: 3 }], desc: '240 % et −30 % Défense ennemie.' },
  ]),
];

// Sorts des monstres de donjon (pas jouables par les héros)
SPELL_LIST.push(...S('monster', [
  { id: 'x_slam', lvl: 0, name: 'Écrasement', cd: 3, scale: 'atk', mult: 1.5, melee: true, fx: 'bash' },
  { id: 'x_club', lvl: 0, name: 'Coup de massue', cd: 4, scale: 'atk', mult: 1.1, melee: true, fx: 'bash', effects: [{ k: 'stun', chance: 0.35 }] },
  { id: 'x_roar', lvl: 0, name: 'Cri sauvage', cd: 5, fx: 'roar', effects: [{ k: 'buff', stat: 'atk', pct: 0.3, turns: 3 }] },
  { id: 'x_bones', lvl: 0, name: 'Lancer d’os', cd: 2, scale: 'atk', mult: 1.2, fx: 'rock' },
  { id: 'x_harden', lvl: 0, name: 'Carapace', cd: 5, fx: 'shield', effects: [{ k: 'shield', scale: 'def', mult: 2 }] },
  { id: 'x_spores', lvl: 0, name: 'Spores toxiques', cd: 3, scale: 'mag', mult: 0.7, fx: 'spore', effects: [{ k: 'dot', kind: 'poison', name: 'Poison', mult: 0.3, turns: 4 }] },
  { id: 'x_regen', lvl: 0, name: 'Régénération', cd: 5, fx: 'heal', effects: [{ k: 'heal', pctMax: 0.15 }] },
  { id: 'x_rock', lvl: 0, name: 'Jet de rocher', cd: 3, scale: 'atk', mult: 1.6, fx: 'rock' },
  { id: 'x_stomp', lvl: 0, name: 'Séisme', cd: 5, scale: 'atk', mult: 0.9, melee: true, fx: 'bash', effects: [{ k: 'stun', chance: 0.4 }] },
  { id: 'x_curse', lvl: 0, name: 'Malédiction', cd: 4, scale: 'mag', mult: 1, fx: 'drain', effects: [{ k: 'debuff', stat: 'atk', pct: 0.25, turns: 3 }] },
  { id: 'x_drain', lvl: 0, name: 'Drain d’âme', cd: 4, scale: 'mag', mult: 1.2, lifesteal: 0.4, fx: 'drain' },
  { id: 'x_wail', lvl: 0, name: 'Hurlement glaçant', cd: 4, scale: 'mag', mult: 0.8, fx: 'ice', effects: [{ k: 'debuff', stat: 'def', pct: 0.3, turns: 3 }] },
  { id: 'x_firewave', lvl: 0, name: 'Vague de flammes', cd: 4, scale: 'mag', mult: 0.5, hits: 3, fx: 'firerain' },
  { id: 'x_burn', lvl: 0, name: 'Embrasement', cd: 5, scale: 'mag', mult: 0.8, fx: 'fireball', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.4, turns: 4 }] },
  { id: 'x_frost', lvl: 0, name: 'Souffle gelé', cd: 4, scale: 'mag', mult: 1.1, fx: 'ice', effects: [{ k: 'debuff', stat: 'spd', pct: 0.3, turns: 3 }] },
  { id: 'x_bite', lvl: 0, name: 'Morsure', cd: 3, scale: 'atk', mult: 1.4, lifesteal: 0.5, melee: true, fx: 'slash' },
  { id: 'x_bats', lvl: 0, name: 'Nuée de chauves-souris', cd: 5, scale: 'mag', mult: 0.4, hits: 4, fx: 'drain' },
  { id: 'x_hellfire', lvl: 0, name: 'Feu infernal', cd: 5, scale: 'mag', mult: 2, fx: 'meteor' },
  { id: 'x_breath', lvl: 0, name: 'Souffle de feu', cd: 3, scale: 'mag', mult: 1.5, fx: 'fireball', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.4, turns: 3 }] },
  { id: 'x_meteors', lvl: 0, name: 'Pluie de météores', cd: 6, scale: 'mag', mult: 0.7, hits: 3, fx: 'meteor' },
  { id: 'x_gnaw', lvl: 0, name: 'Grignotage', cd: 3, scale: 'atk', mult: 0.5, hits: 3, melee: true, fx: 'slash' },
  { id: 'x_howl', lvl: 0, name: 'Hurlement de meute', cd: 5, fx: 'roar', effects: [{ k: 'buff', stat: 'spd', pct: 0.35, turns: 3 }] },
  { id: 'x_rot', lvl: 0, name: 'Morsure putride', cd: 4, scale: 'atk', mult: 0.9, melee: true, fx: 'slash', effects: [{ k: 'dot', kind: 'poison', name: 'Poison', mult: 0.3, turns: 4 }] },
  { id: 'x_tongue', lvl: 0, name: 'Coup de langue', cd: 3, scale: 'atk', mult: 1.2, lifesteal: 0.4, fx: 'spore' },
  { id: 'x_web', lvl: 0, name: 'Toile collante', cd: 4, scale: 'mag', mult: 0.6, fx: 'spore', effects: [{ k: 'debuff', stat: 'spd', pct: 0.35, turns: 3 }] },
  { id: 'x_wrap', lvl: 0, name: 'Bandelettes', cd: 5, scale: 'mag', mult: 0.8, fx: 'drain', effects: [{ k: 'stun', chance: 0.4 }] },
  { id: 'x_lava', lvl: 0, name: 'Crachat de lave', cd: 3, scale: 'mag', mult: 1.2, fx: 'fireball', effects: [{ k: 'dot', kind: 'burn', name: 'Brûlure', mult: 0.35, turns: 3 }] },
  { id: 'x_maul', lvl: 0, name: 'Coup de patte', cd: 3, scale: 'atk', mult: 1.6, melee: true, fx: 'bash' },
  { id: 'x_shadow', lvl: 0, name: 'Lame des ténèbres', cd: 4, scale: 'atk', mult: 1.6, pierce: 0.4, melee: true, fx: 'slash' },
  { id: 'x_gaze', lvl: 0, name: 'Regard pétrifiant', cd: 5, scale: 'mag', mult: 1, fx: 'bolt', effects: [{ k: 'stun', chance: 0.45 }] },
  { id: 'x_heads', lvl: 0, name: 'Triple morsure', cd: 4, scale: 'atk', mult: 0.6, hits: 3, melee: true, fx: 'slash' },
]));

export const SPELLS = Object.fromEntries(SPELL_LIST.map(s => [s.id, s]));

// ---------------------------------------------------------------------
//  DONJONS — un tous les 10 niveaux. Le boss est calibré pour être
//  battable même par les joueurs les moins forts.
//  profile : répartition des stats du boss (1 = moyenne d'un joueur)
// ---------------------------------------------------------------------
export const DUNGEONS = [
  { id: 'd1', lvl: 1, name: 'Appartement 33', boss: 'Roi Gluant', sprite: 'slimeKing', theme: 'cave',
    profile: { vit: 1.4, atk: 0.9, mag: 0.4, def: 0.9, spd: 0.6, lck: 0.4 },
    basic: { name: 'Rebond', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_slam'],
    alt: { boss: 'Rat géant', sprite: 'rat', profile: { vit: 1.1, atk: 1, mag: 0.3, def: 0.7, spd: 0.9, lck: 0.6 }, basic: { name: 'Morsure', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_gnaw'] } },
  { id: 'd10', lvl: 10, name: 'C3 Blanche', boss: 'Chef Gobelin', sprite: 'goblin', theme: 'forest',
    profile: { vit: 1.1, atk: 0.85, mag: 0.3, def: 0.8, spd: 0.8, lck: 0.6 },
    basic: { name: 'Coup de gourdin', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_club', 'x_roar'],
    alt: { boss: 'Loup des bois', sprite: 'wolf', profile: { vit: 1, atk: 0.86, mag: 0.3, def: 0.72, spd: 0.88, lck: 0.6 }, basic: { name: 'Crocs', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_howl', 'x_bite'] } },
  { id: 'd20', lvl: 20, name: 'Université de Lorraine', boss: 'Seigneur Squelette', sprite: 'skeleton', theme: 'crypt',
    profile: { vit: 1, atk: 0.9, mag: 0.3, def: 0.85, spd: 0.8, lck: 0.6 },
    basic: { name: 'Coup d’os', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_harden', 'x_bones'],
    alt: { boss: 'Zombie affamé', sprite: 'zombie', profile: { vit: 1.25, atk: 0.86, mag: 0.3, def: 0.75, spd: 0.6, lck: 0.4 }, basic: { name: 'Griffure', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_rot'] } },
  { id: 'd30', lvl: 30, name: 'Bayonne', boss: 'Champignon Toxique', sprite: 'mushroom', theme: 'swamp',
    profile: { vit: 1.3, atk: 0.5, mag: 0.9, def: 0.9, spd: 0.6, lck: 0.5 },
    basic: { name: 'Coup de chapeau', scale: 'mag', mult: 0.9, melee: true, fx: 'bash' }, spells: ['x_regen', 'x_spores'],
    alt: { boss: 'Crapaud géant', sprite: 'frog', profile: { vit: 1.3, atk: 0.92, mag: 0.8, def: 0.8, spd: 0.7, lck: 0.5 }, basic: { name: 'Coup de langue', scale: 'atk', mult: 1, fx: 'spore' }, spells: ['x_tongue', 'x_spores'] } },
  { id: 'd40', lvl: 40, name: 'Maison Mervans', boss: 'Golem de pierre', sprite: 'golem', theme: 'mine',
    profile: { vit: 1.25, atk: 1, mag: 0.2, def: 1.05, spd: 0.4, lck: 0.3 },
    basic: { name: 'Poing de pierre', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_harden', 'x_stomp', 'x_rock'],
    alt: { boss: 'Araignée des mines', sprite: 'spider', profile: { vit: 1.05, atk: 0.95, mag: 0.7, def: 0.8, spd: 0.9, lck: 0.7 }, basic: { name: 'Crochets', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_web', 'x_rot'] } },
  { id: 'd50', lvl: 50, name: 'Double B', boss: 'Spectre maudit', sprite: 'ghost', theme: 'crypt',
    profile: { vit: 1, atk: 0.3, mag: 1.05, def: 0.6, spd: 0.9, lck: 0.8 },
    basic: { name: 'Toucher spectral', scale: 'mag', mult: 0.95, fx: 'bolt' }, spells: ['x_curse', 'x_drain', 'x_wail'],
    alt: { boss: 'Momie', sprite: 'mummy', profile: { vit: 1.25, atk: 0.6, mag: 1.05, def: 0.8, spd: 0.6, lck: 0.5 }, basic: { name: 'Malédiction', scale: 'mag', mult: 0.95, fx: 'drain' }, spells: ['x_wrap', 'x_curse', 'x_regen'] } },
  { id: 'd60', lvl: 60, name: 'Luxembourg Place', boss: 'Élémentaire de feu', sprite: 'fireElem', theme: 'volcano',
    profile: { vit: 1.1, atk: 0.3, mag: 1.05, def: 0.7, spd: 0.85, lck: 0.6 },
    basic: { name: 'Flammèche', scale: 'mag', mult: 0.95, fx: 'fireball' }, spells: ['x_burn', 'x_firewave'],
    alt: { boss: 'Salamandre de lave', sprite: 'salamander', profile: { vit: 1, atk: 0.6, mag: 0.92, def: 0.7, spd: 1, lck: 0.6 }, basic: { name: 'Morsure brûlante', scale: 'mag', mult: 0.95, melee: true, fx: 'slash' }, spells: ['x_lava', 'x_firewave'] } },
  { id: 'd70', lvl: 70, name: 'Chalet des Vosges', boss: 'Yéti', sprite: 'yeti', theme: 'glacier',
    profile: { vit: 1.4, atk: 1.1, mag: 0.7, def: 0.9, spd: 0.8, lck: 0.5 },
    basic: { name: 'Griffes', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_frost', 'x_roar', 'x_slam'],
    alt: { boss: 'Ours polaire', sprite: 'polarBear', profile: { vit: 1.5, atk: 1.15, mag: 0.3, def: 1, spd: 0.6, lck: 0.4 }, basic: { name: 'Coup de griffe', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_maul', 'x_frost', 'x_roar'] } },
  { id: 'd80', lvl: 80, name: 'Commissariat', boss: 'Comte Vampire', sprite: 'vampire', theme: 'castle',
    profile: { vit: 1.05, atk: 0.9, mag: 0.8, def: 0.75, spd: 1, lck: 0.7 },
    basic: { name: 'Griffes', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_bite', 'x_bats', 'x_curse'],
    alt: { boss: 'Chevalier noir', sprite: 'blackKnight', profile: { vit: 1.1, atk: 1.05, mag: 0.4, def: 1.05, spd: 0.8, lck: 0.6 }, basic: { name: 'Coup d’épée', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_shadow', 'x_harden', 'x_curse'] } },
  { id: 'd90', lvl: 90, name: 'Mélusine', boss: 'Démon des abysses', sprite: 'demon', theme: 'abyss',
    profile: { vit: 1.2, atk: 0.6, mag: 1, def: 0.8, spd: 0.8, lck: 0.6 },
    basic: { name: 'Griffe infernale', scale: 'mag', mult: 0.95, fx: 'bolt' }, spells: ['x_regen', 'x_hellfire', 'x_drain', 'x_curse'],
    alt: { boss: 'Œil des abysses', sprite: 'abyssEye', profile: { vit: 1.1, atk: 0.4, mag: 1.1, def: 0.7, spd: 0.9, lck: 0.8 }, basic: { name: 'Rayon', scale: 'mag', mult: 0.95, fx: 'bolt' }, spells: ['x_gaze', 'x_drain', 'x_curse'] } },
  { id: 'd100', lvl: 100, name: 'Maison de Salva', boss: 'Dragon ancien', sprite: 'dragon', theme: 'volcano',
    profile: { vit: 1.5, atk: 0.8, mag: 1, def: 1, spd: 0.6, lck: 0.5 },
    basic: { name: 'Coup de queue', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_harden', 'x_meteors', 'x_breath', 'x_roar'],
    alt: { boss: 'Hydre', sprite: 'hydra', profile: { vit: 1.5, atk: 0.95, mag: 0.8, def: 0.95, spd: 0.7, lck: 0.5 }, basic: { name: 'Morsure', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_heads', 'x_regen', 'x_rot', 'x_roar'] } },
];

// ---------------------------------------------------------------------
//  PANOPLIES — bonus en % quand on porte 3 ou 5 pièces de la même panoplie
// ---------------------------------------------------------------------
export const SETS = {
  thomas: { name: 'Panoplie de Thomas', stat: 'spd', bonus3: { spd: 0.10 }, bonus5: { spd: 0.20, lck: 0.10 } },
  loic: { name: 'Panoplie de Loïc', stat: 'atk', bonus3: { atk: 0.10 }, bonus5: { atk: 0.20, vit: 0.10 } },
  tchomb: { name: 'Panoplie de Tchomb', stat: 'mag', bonus3: { mag: 0.10 }, bonus5: { mag: 0.20, spd: 0.10 } },
  tom: { name: 'Panoplie de Tom', stat: 'lck', bonus3: { lck: 0.12 }, bonus5: { lck: 0.25, atk: 0.08 } },
  guillaume: { name: 'Panoplie de Guillaume', stat: 'def', bonus3: { def: 0.10 }, bonus5: { def: 0.20, vit: 0.10 } },
  simon: { name: 'Panoplie de Simon', stat: 'vit', bonus3: { vit: 0.10 }, bonus5: { vit: 0.20, def: 0.10 } },
  alexis: { name: 'Panoplie d’Alexis', stat: 'atk', bonus3: { atk: 0.10 }, bonus5: { atk: 0.20, lck: 0.10 } },
  appart33: { name: 'Panoplie Appartement 33', stat: 'vit', bonus3: { vit: 0.10 }, bonus5: { vit: 0.20, atk: 0.10 } },
  fax: { name: 'Panoplie Fax', stat: 'mag', bonus3: { mag: 0.10 }, bonus5: { mag: 0.20, lck: 0.10 } },
  deuxb: { name: 'Panoplie 2B', stat: 'def', bonus3: { def: 0.10 }, bonus5: { def: 0.20, mag: 0.10 } },
  romain: { name: 'Panoplie de Romain', stat: 'def', bonus3: { def: 0.10 }, bonus5: { def: 0.20, atk: 0.10 } },
  // Panoplies de magie (pour que les mages aient autant de choix que les autres)
  mcdo: { name: 'Panoplie McDo', stat: 'mag', bonus3: { mag: 0.10 }, bonus5: { mag: 0.20, vit: 0.10 } },
  foot: { name: 'Panoplie du Footballeur', stat: 'mag', bonus3: { mag: 0.10 }, bonus5: { mag: 0.20, spd: 0.10 } },
};

// ---------------------------------------------------------------------
//  OBJETS — stats au rang Commun (multipliées selon la rareté)
//  Chaque panoplie a son domaine : chaque pièce donne beaucoup de la stat de sa panoplie
//  et un petit peu de toutes les autres.
//  icon : forme dessinée, colors : [couleur principale, couleur secondaire]
// ---------------------------------------------------------------------
// Chaque objet a son propre profil (toujours le même pour un objet donné), à puissance égale :
//  - la stat de la panoplie : 3
//  - la stat liée à l'emplacement (arme = attaque ou magie, armure = défense…) : 1,2
//  - une stat « bonus » propre à l'objet : 0,8
//  - les 3 autres : 0,25 chacune (elles apparaissent surtout aux raretés élevées)
const FOCUS = 3, SLOT_PART = 1.2, BONUS_PART = 0.8, REST_PART = 0.25;
// Les armes donnent aussi du critique et les bottes de l'esquive (en %, selon la rareté).
// Plafonds : jamais plus de 40 % de critique ni de 25 % d'esquive au total.
export const ITEM_CRIT = [0.01, 0.02, 0.03, 0.04, 0.06];
export const ITEM_DODGE = [0.01, 0.015, 0.02, 0.03, 0.04];
export const CRIT_CAP = 0.40, DODGE_CAP = 0.25;
const SLOT_STAT = { hat: 'vit', armor: 'def', boots: 'spd', amulet: 'lck' };
const pickFrom = (id, list) => list[[...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % list.length];
function setItems(set, weaponStat, list) {
  const focus = SETS[set].stat;
  return list.map(([slot, name, icon, colors, extra = {}]) => {
    const id = `${set}_${slot}`;
    let slotStat = slot === 'weapon' ? weaponStat : SLOT_STAT[slot];
    if (slotStat === focus) slotStat = pickFrom(id + 'slot', STAT_KEYS.filter(k => k !== focus));
    const bonus = pickFrom(id, STAT_KEYS.filter(k => k !== focus && k !== slotStat));
    const stats = {};
    for (const k of STAT_KEYS) stats[k] = k === focus ? FOCUS : k === slotStat ? SLOT_PART : k === bonus ? BONUS_PART : REST_PART;
    return { id, name, slot, set, icon, colors, stats, crit: slot === 'weapon', dodge: slot === 'boots', ...extra };
  });
}
const pet = (id, name, icon, colors, stats, extra = {}) => ({ id, name, slot: 'pet', icon, colors, stats, ...extra });

export const ITEM_LIST = [
  ...setItems('thomas', 'atk', [
    ['hat', 'Queue de cheval', 'ponytail', ['#6b4423', '#d63031']],
    ['weapon', 'Stick', 'stick', ['#f4f4f8', '#e02020']],
    ['armor', 'Pull', 'sweater', ['#2d5fbf', '#f4f4f8']],
    ['boots', 'Balenciaga', 'chunky', ['#e8e8ee', '#2a2238']],
    ['amulet', 'Clef du sac', 'key', ['#d4a437', '#5c6670']],
  ]),
  ...setItems('loic', 'atk', [
    ['hat', 'Crâne', 'bald', ['#f1c08f', '#f1c08f']],
    ['weapon', 'Couteau', 'knife', ['#c9d1da', '#2a2238']],
    ['armor', 'Torse', 'torso', ['#f1c08f', '#f1c08f']],
    ['boots', 'Bottes', 'boots', ['#3b2a20', '#8a5a2b']],
    ['amulet', 'Collier en or', 'chain', ['#e5b33a', '#e5b33a']],
  ]),
  ...setItems('tchomb', 'mag', [
    ['hat', 'Toque', 'toque', ['#f4f4f8', '#d63031']],
    ['weapon', 'Couteau japonais', 'jknife', ['#dfe6ee', '#6b4423']],
    ['armor', 'Blason en cuir', 'leather', ['#8a5a2b', '#e5b33a']],
    ['boots', 'New Balance', 'nb', ['#9aa3ad', '#1e3a8a']],
    ['amulet', 'Talisman', 'talisman', ['#a64dff', '#e5b33a']],
  ]),
  ...setItems('tom', 'atk', [
    ['hat', 'Lunettes rondes', 'glasses', ['#c9a227', '#c9a227']],
    ['weapon', 'Bouteille de rouge', 'bottle', ['#5a1020', '#c0392b']],
    ['armor', 'Pull', 'sweater', ['#2e7d4f', '#f4f4f8']],
    ['boots', 'Birk', 'birk', ['#c49a6c', '#5a3a22']],
    ['amulet', 'Le gramme', 'gram', ['#e8eef5', '#9aa3ad']],
  ]),
  ...setItems('guillaume', 'atk', [
    ['hat', 'Auréole', 'halo', ['#ffd84a', '#ffd84a']],
    ['weapon', 'Poing', 'fist', ['#f1c08f', '#d63031']],
    ['armor', 'Toge', 'toga', ['#f4f4f8', '#e5b33a']],
    ['boots', 'Baskets', 'sneaker', ['#f4f4f8', '#d63031']],
    ['amulet', 'Croix', 'rosary', ['#6b4423', '#e5b33a']],
  ]),
  ...setItems('simon', 'atk', [
    ['hat', 'Casquette', 'cap', ['#3a3a46', '#f4f4f8']],
    ['weapon', 'Ongle', 'karambit', ['#c9d1da', '#2a2238']],
    ['armor', 'Veste', 'jacket', ['#55663f', '#f4f4f8']],
    ['boots', 'Bottes', 'boots', ['#6b4a2b', '#3b2a20']],
    ['amulet', 'Pendentif', 'amulet', ['#3d9bff', '#c9d1da']],
  ]),
  ...setItems('alexis', 'atk', [
    ['hat', 'Gel', 'gel', ['#2a1a10', '#2a1a10']],
    ['weapon', 'Gros bras', 'bigarm', ['#e8b58a', '#e8b58a'], { skin: '#e8b58a' }],
    ['armor', 'T-shirt au corps', 'tshirt', ['#f4f4f8', '#f4f4f8']],
    ['boots', 'Chaussures italiennes', 'italian', ['#6b2e14', '#6b2e14']],
    ['amulet', 'Collier en chaîne', 'chain', ['#c9d1da', '#c9d1da']],
  ]),
  ...setItems('appart33', 'mag', [
    ['hat', 'Chapeau de Noël', 'santa', ['#d63031', '#f4f4f8']],
    ['weapon', 'Aqua', 'hookah', ['#2d98da', '#c9a227']],
    ['armor', 'Sac de sport', 'sportbag', ['#d63031', '#2a2238']],
    ['boots', 'Tapis', 'rug', ['#8e2b2b', '#e5b33a']],
    ['amulet', 'Judas', 'judas', ['#c9a227', '#5c6670']],
  ]),
  ...setItems('fax', 'mag', [
    ['hat', 'Casquette', 'cap', ['#1e1e24', '#ff9f1a']],
    ['weapon', 'GH5', 'camera', ['#3a3a46', '#9aa3ad']],
    ['armor', 'Stabilisateur', 'gimbal', ['#2a2a32', '#3d9bff']],
    ['boots', 'Bottes', 'boots', ['#26262e', '#5c6670']],
    ['amulet', 'Collier spot lumineux', 'spot', ['#3a3a46', '#9aa3ad']],
  ]),
  ...setItems('deuxb', 'atk', [
    ['hat', 'Toque du chef', 'toque', ['#f4f4f8', '#2a2238']],
    ['weapon', 'Spatule en bois', 'spatula', ['#c49a6c', '#8a5a2b']],
    ['armor', 'Tablier de cuisine', 'apron', ['#e8e1cf', '#8e2b2b']],
    ['boots', 'Crocs', 'crocs', ['#4cd964', '#2a9a45']],
    ['amulet', 'Collier burger', 'burger', ['#d4a437', '#5c6670']],
  ]),
  ...setItems('romain', 'atk', [
    ['hat', 'Casque de chantier', 'hardhat', ['#ffc61a', '#e8e8e8']],
    ['weapon', 'Truelle', 'trowel', ['#c9d1da', '#c0392b']],
    ['armor', 'Plastron', 'armor', ['#ff8c1a', '#e8f0f8']],
    ['boots', 'Bottes de chantier', 'boots', ['#c98a2b', '#2a2238']],
    ['amulet', 'Cache-cou', 'gaiter', ['#3a3a46', '#ff8c1a']],
  ]),
  ...setItems('mcdo', 'mag', [
    ['hat', 'Casquette d’équipier', 'cap', ['#d62a1e', '#ffc72c']],
    ['weapon', 'Cornet de frites', 'fries', ['#d62a1e', '#ffc72c']],
    ['armor', 'Tenue d’équipier', 'mcshirt', ['#d62a1e', '#ffc72c']],
    ['boots', 'Baskets antidérapantes', 'sneaker', ['#2a2238', '#ffc72c']],
    ['amulet', 'Médaillon Big Mac', 'burger', ['#ffc72c', '#d62a1e']],
  ]),
  ...setItems('foot', 'mag', [
    ['hat', 'Bandeau de capitaine', 'headband', ['#f4f4f8', '#2d5fbf']],
    ['weapon', 'Ballon d’or', 'ball', ['#ffd84a', '#c9a227']],
    ['armor', 'Maillot n°10', 'jersey', ['#2d5fbf', '#f4f4f8']],
    ['boots', 'Crampons', 'cleats', ['#ff5d6c', '#f4f4f8']],
    ['amulet', 'Médaille de champion', 'medal', ['#ffd84a', '#2d5fbf']],
  ]),

  // Familiers — chats
  pet('woody', 'Woody', 'catFat', ['#9b8f80', '#c9bfb2'], { vit: 3, def: 2 }),
  pet('kuzco', 'Kuzco', 'catTiger', ['#e58e2b', '#ffd59a'], { atk: 3, spd: 2 }),
  pet('shiva', 'Shiva', 'catThin', ['#c9b79c', '#efe2c4'], { spd: 3, lck: 2 }),
  pet('malo', 'Malo', 'catBig', ['#6b6b78', '#9aa3ad'], { def: 3, atk: 2 }),
  pet('fidji', 'Fidji', 'cat', ['#f4f4f8', '#ffffff'], { mag: 3, lck: 2 }, { eye: '#3d9bff' }),
  pet('nala', 'Nala', 'cat', ['#2d2a33', '#4a4652'], { lck: 3, mag: 2 }, { eye: '#ffd84a' }),
  pet('gaia', 'Gaia', 'cat', ['#8d8f99', '#b8bac4'], { def: 2, spd: 2, lck: 1 }, { eye: '#7bed6f' }),
  pet('wiz', 'Wiz', 'catFat', ['#6e707a', '#9a9ca6'], { vit: 4, def: 1 }, { eye: '#ffd84a' }),
  // Familiers — chiens
  pet('isco', 'Isco', 'greyhound', ['#c9b79c', '#efe2c4'], { spd: 4, atk: 1 }),
  pet('buck', 'Buck', 'dog', ['#e3c58f', '#f5e2b8'], { vit: 3, lck: 2 }),
  pet('ivory', 'Ivory', 'canecorso', ['#4a4652', '#6b6b78'], { atk: 3, def: 2 }, { eye: '#c49a6c' }),
  pet('salto', 'Salto', 'dog', ['#2d2a33', '#4a4652'], { vit: 2, def: 2, atk: 1 }, { eye: '#c49a6c' }),
  pet('uby', 'Uby', 'shepherd', ['#2d2a33', '#4a4652'], { def: 2, atk: 2, spd: 1 }, { eye: '#c49a6c' }),
  // Familiers — serpents
  pet('idan', 'Idan', 'snake', ['#d63031', '#ff7675'], { atk: 3, lck: 2 }),
  pet('mitsuki', 'Mitsuki', 'snake', ['#ff8fc7', '#ffc2e2'], { mag: 3, spd: 2 }),
];

export const ITEMS = Object.fromEntries(ITEM_LIST.map(i => [i.id, i]));

// Bonus de panoplie : ils ne boostent que la stat du domaine de la panoplie
for (const set of Object.values(SETS)) {
  set.bonus3 = { [set.stat]: 0.12 };
  set.bonus5 = { [set.stat]: 0.25 };
}

// ---------------------------------------------------------------------
//  FAMILIERS — affinité (+5 % dans une stat si ton héros est de la bonne classe)
//  et attaque : le familier frappe toutes les 3 actions de son maître, avec les stats du héros.
//  kind : 'pounce' = il bondit sur l'ennemi, sinon c'est un projectile (fx).
// ---------------------------------------------------------------------
export const PET_EVERY = 3;
export const PET_AFFINITY = 0.05;
export const PETS = {
  woody: { aff: ['guerrier', 'vit'], atk: { name: 'Plat ventre', kind: 'pounce', scale: 'atk', mult: 0.55, effects: [{ k: 'stun', chance: 0.15 }], desc: 'Il s’écrase sur l’ennemi (55 % Attaque), peut l’étourdir.' } },
  kuzco: { aff: ['archer', 'atk'], atk: { name: 'Griffes de tigre', kind: 'pounce', scale: 'atk', mult: 0.32, hits: 2, desc: '2 coups de griffes (32 % Attaque).' } },
  shiva: { aff: ['archer', 'spd'], atk: { name: 'Patte éclair', kind: 'pounce', scale: 'atk', mult: 0.5, crit: 0.25, desc: 'Coup de patte vif (50 % Attaque), +25 % de critique.' } },
  malo: { aff: ['guerrier', 'def'], atk: { name: 'Morsure lourde', kind: 'pounce', scale: 'atk', mult: 0.6, desc: 'Grosse morsure (60 % Attaque).' } },
  fidji: { aff: ['mage', 'mag'], atk: { name: 'Regard glacé', fx: 'ice', scale: 'mag', mult: 0.5, effects: [{ k: 'debuff', stat: 'spd', pct: 0.15, turns: 2 }], desc: 'Rayon de glace (50 % Magie), ralentit l’ennemi.' } },
  nala: { aff: ['mage', 'atk'], atk: { name: 'Chat noir', fx: 'bolt', scale: 'mag', mult: 0.5, effects: [{ k: 'debuff', stat: 'lck', pct: 0.3, turns: 2 }], desc: 'Porte malheur (50 % Magie), −30 % Chance ennemie.' } },
  gaia: { aff: ['paladin', 'def'], atk: { name: 'Ronron', kind: 'self', fx: 'heal', effects: [{ k: 'heal', pctMax: 0.04 }], desc: 'Ronronne et soigne son maître (4 % des PV max).' } },
  wiz: { aff: ['paladin', 'vit'], atk: { name: 'Coup de boule', kind: 'pounce', scale: 'mix', mult: 0.5, desc: 'Coup de tête (50 % Attaque/Magie).' } },
  isco: { aff: ['archer', 'spd'], atk: { name: 'Sprint', kind: 'pounce', scale: 'atk', mult: 0.3, hits: 2, desc: 'Fonce 2 fois sur l’ennemi (30 % Attaque).' } },
  buck: { aff: ['paladin', 'spd'], atk: { name: 'Aboiement', fx: 'bark', scale: 'mix', mult: 0.45, effects: [{ k: 'debuff', stat: 'atk', pct: 0.1, turns: 2 }], desc: 'Aboie fort (45 %), −10 % Attaque ennemie.' } },
  ivory: { aff: ['guerrier', 'atk'], atk: { name: 'Mâchoire de fer', kind: 'pounce', scale: 'atk', mult: 0.65, desc: 'Mord très fort (65 % Attaque).' } },
  salto: { aff: ['guerrier', 'vit'], atk: { name: 'Salto', kind: 'pounce', scale: 'atk', mult: 0.5, effects: [{ k: 'stun', chance: 0.1 }], desc: 'Saute sur l’ennemi (50 % Attaque), peut l’étourdir.' } },
  uby: { aff: ['paladin', 'atk'], atk: { name: 'Gardien', kind: 'pounce', scale: 'mix', mult: 0.5, lifesteal: 0.3, desc: 'Mord (50 %) et soigne son maître de 30 % des dégâts.' } },
  idan: { aff: ['archer', 'lck'], atk: { name: 'Venin', fx: 'spit', scale: 'atk', mult: 0.3, effects: [{ k: 'dot', kind: 'poison', name: 'Poison', mult: 0.2, turns: 3 }], desc: 'Crache du venin (30 % Attaque) + poison.' } },
  mitsuki: { aff: ['mage', 'spd'], atk: { name: 'Hypnose', fx: 'spore', scale: 'mag', mult: 0.45, effects: [{ k: 'stun', chance: 0.15 }], desc: 'Hypnotise (45 % Magie), peut étourdir.' } },
};

// ---------------------------------------------------------------------
//  AMIS (bots du mode hors ligne : 7 + toi = 8 joueurs)
// ---------------------------------------------------------------------
export const FRIENDS = [
  { id: 'b1', name: 'Gégé', classId: 'guerrier' },
  { id: 'b2', name: 'Momo', classId: 'mage' },
  { id: 'b3', name: 'Lulu', classId: 'archer' },
  { id: 'b4', name: 'Nono', classId: 'paladin' },
  { id: 'b5', name: 'Titi', classId: 'guerrier' },
  { id: 'b6', name: 'Zaza', classId: 'mage' },
  { id: 'b7', name: 'Kiki', classId: 'archer' },
];

// =====================================================================
//  AIDE AUX RETARDATAIRES — bonus d'XP selon le retard sur le perso le plus haut du jeu
// =====================================================================
export const XP_CATCHUP = { perLevel: 0.05, max: 1 };   // +5 % par niveau de retard sur le perso le plus haut du jeu, max +100 %
export const ALT_XP_MULT = 2;      // persos secondaires : XP ×2 tant qu'ils sont sous le niveau de ton perso le plus haut
// clefs gagnées à chaque niveau : 1, puis 2 dès le niveau 30, 3 dès le 50, 4 dès le 70, 5 dès le 90 (et toujours 5 aux niveaux 10, 20, 30…)
export const LEVEL_KEYS = { each: 1, tiers: [[90, 5], [70, 4], [50, 3], [30, 2]], every10: 5 };
// Remise à zéro exceptionnelle de tous les compteurs (une seule fois, à cette heure-là)
export const SPECIAL_RESET = { id: '2026-10-18-20h', at: [2026, 9, 18, 20, 0] };

// =====================================================================
//  TOUR INFINIE
// =====================================================================
// =====================================================================
//  LA HORDE — des monstres à la chaîne, de plus en plus forts, sans soin. Plus tu vas loin, plus tu gagnes de Flouze.
//  3 essais par compte toutes les 12 h (minuit et midi).
// =====================================================================
export const HORDE = {
  runsPerHalf: 3,
  step: 4,        // niveau du monstre n = 1 + step × (n − 1)
  power: 1,       // stats des monstres par rapport à un boss de donjon du même niveau
  hp: 0.6,        // et leurs PV
  flouzeBase: 3,   // Flouze = 3 + 0.22 par monstre battu (arrondi), dès le 1er monstre battu
  flouzePer: 0.22,
};
export const TOWER = { clatPerFloor: 1, clatEvery10: 10, xpMult: 0.3 };   // tentatives illimitées : on reste bloqué à l'étage tant qu'on ne l'a pas gagné ; XP par étage = 30 % de l'XP d'un boss du même niveau

// =====================================================================
//  RAID DE LA SEMAINE — un boss commun à tout le groupe
// =====================================================================
SPELL_LIST.push(...S('monster', [
  { id: 'r_discours', lvl: 0, name: 'Discours de 3 heures', cd: 5, scale: 'mag', mult: 0.6, fx: 'bolt', effects: [{ k: 'stun', chance: 0.5 }] },
  { id: 'r_republique', lvl: 0, name: 'La République, c’est moi !', cd: 5, scale: 'atk', mult: 2, melee: true, fx: 'bash' },
  { id: 'r_insoumis', lvl: 0, name: 'Insoumission', cd: 6, fx: 'shield', effects: [{ k: 'shield', scale: 'def', mult: 2 }] },
  { id: 'r_gueule', lvl: 0, name: 'Coup de gueule', cd: 5, fx: 'roar', effects: [{ k: 'buff', stat: 'atk', pct: 0.3, turns: 3 }] },
]));
SPELL_LIST.forEach(s => { SPELLS[s.id] = s; });

export const RAID = {
  tag: 'melenchon:v3',            // version du raid (changer ce nom relance un Mélenchon tout neuf)
  attemptsPerHalf: 3,             // 3 assauts par compte toutes les 12 h (remise à zéro à minuit et à midi)
  maxActions: 40,                 // un assaut dure au plus 40 actions (on ne peut pas le tuer d'un coup)
  minHp: 20000,                   // Mélenchon a toujours au moins 20 000 PV
  participation: 0.5,             // PV calculés pour qu'il tombe si chacun fait ~3 assauts par jour
  rewards: { killChests: 1, killClat: 10, mvpChests: 1, failClat: 3 },
  boss: {
    id: 'melenchon', name: 'Mélenchon', sprite: 'melenchon', theme: 'meeting',
    profile: { vit: 1, atk: 1.1, mag: 1, def: 0.9, spd: 0.8, lck: 0.6 },
    basic: { name: 'Coup de micro', scale: 'atk', mult: 1, melee: true, fx: 'bash' },
    spells: ['r_insoumis', 'r_republique', 'r_discours', 'r_gueule'],
  },
};

// =====================================================================
//  MISSIONS — 3 missions toutes les 12 h (minuit et midi), tirées au hasard, les mêmes pour tout le monde
//  ev = l'action qui fait avancer la mission
// =====================================================================
const M = (id, ev, text, n, reward) => ({ id, ev, text, n, reward });
export const MISSION_POOL = [
  M('arena_win', 'arena_win', 'Gagne {n} combats d’Arène', [2, 3], 3),
  M('arena_fight', 'arena_fight', 'Fais {n} combats d’Arène', [3, 5], 2),
  M('rematch', 'rematch', 'Fais {n} revanches', [2, 4], 2),
  M('rematch_win', 'rematch_win', 'Gagne {n} revanche(s)', [1, 2], 2),
  M('chest', 'chest', 'Ouvre {n} coffres', [2, 5], 2),
  M('key_use', 'key_use', 'Ouvre {n} coffre(s) avec une clef', [1, 3], 2),
  M('dungeon_win', 'dungeon_win', 'Bats {n} boss de donjon', [2, 4], 3),
  M('dungeon', 'dungeon', 'Lance {n} combats de donjon', [3, 6], 2),
  M('dungeon_diff', 'dungeon_kinds', 'Bats {n} donjons différents', [2, 3], 3),
  M('tower', 'tower', 'Monte {n} étage(s) de la Tour', [1, 3], 3),
  M('tower_try', 'tower_try', 'Tente {n} fois la Tour infinie', [2, 4], 2),
  M('raid', 'raid', 'Attaque Mélenchon {n} fois', [1, 3], 3),
  M('raid_dmg', 'raid_dmg', 'Inflige {n} dégâts à Mélenchon', [300, 900], 3),
  M('war', 'war', 'Fais {n} attaques de guerre', [1, 3], 3),
  M('war_win', 'war_win', 'Gagne {n} attaque(s) de guerre', [1, 2], 3),
  M('fuse', 'fuse', 'Fusionne {n} objet(s)', [1, 2], 3),
  M('sell', 'sell', 'Vends {n} objets', [2, 6], 2),
  M('equip', 'equip', 'Équipe {n} objet(s)', [1, 3], 1),
  M('stat', 'stat', 'Place {n} points de caractéristique', [3, 6], 1),
  M('level', 'level', 'Gagne {n} niveau(x)', [1, 2], 3),
  M('fight', 'fight', 'Fais {n} combats (tous modes)', [5, 10], 2),
  M('win', 'win', 'Gagne {n} combats (tous modes)', [4, 8], 3),
  M('spell', 'spell', 'Lance {n} sorts en combat', [8, 16], 2),
  M('crit', 'crit', 'Place {n} coups critiques', [5, 12], 2),
  M('dodge', 'dodge', 'Esquive {n} attaques', [3, 8], 2),
  M('pet', 'pet', 'Ton familier attaque {n} fois', [5, 12], 2),
  M('manual_win', 'manual_win', 'Gagne {n} combat(s) en mode manuel', [1, 2], 3),
  M('chat', 'chat', 'Envoie {n} message(s) dans le tchat', [1, 3], 1),
  M('share', 'share', 'Partage {n} combat dans le tchat', [1, 1], 2),
  M('bet', 'bet', 'Mise sur {n} duel(s)', [1, 1], 2),
  M('revenge', 'revenge', 'Venge-toi {n} fois', [1, 1], 2),
  M('train', 'train_rec', 'Bats ton record d’entraînement', [1, 1], 2),
];
export const MISSIONS_PER_DAY = 3;
export const MISSIONS_BONUS = 5;   // Flouze en plus si les 3 sont faites

// =====================================================================
//  BOUTIQUE D'APPARENCE — payée en Flouze, aucun effet sur les stats
// =====================================================================
const T = (id, name, price) => ({ id: 't_' + id, kind: 'title', name, price });
const C = (id, name, price, color) => ({ id: 'c_' + id, kind: 'color', name, price, color });
const D = (id, name, price, dye) => ({ id: 'd_' + id, kind: 'dye', name, price, dye });
const V = (id, name, price, colors) => ({ id: 'v_' + id, kind: 'victory', name, price, colors });
// Skin : une tenue propre à une classe (remplace les anciennes teintures, qui restent portables par ceux qui les ont)
const K = (cls, id, name, price, look) => ({ id: 'k_' + cls + '_' + id, kind: 'skin', cls, name, price, look });
// PvP en direct : défi entre joueurs en ligne, tous les persos de chacun à la suite (relais)
export const PVP = { reward: 10, rewardsPerDay: 5, expireMs: 3 * 60 * 1000 };
export const SHOP_DAILY = { count: 3, price: 10, rarity: 0 };   // 3 objets gris (Communs) à 10 Flouze, changés chaque jour

export const COSMETICS = [
  // Titres (affichés sous ton pseudo)
  T('rookie', 'Le Rookie', 5), T('touriste', 'Touriste', 5), T('mauvais', 'Mauvais perdant', 8),
  T('fetard', 'Fêtard', 10), T('cuistot', 'Chef cuistot', 12), T('gros_bras', 'Gros bras', 12),
  T('pilier', 'Pilier de bar', 15), T('sage', 'Le Sage', 18), T('revanche', 'Roi de la revanche', 20),
  T('sniper', 'Sniper', 22), T('pyro', 'Pyromane', 22), T('increvable', 'Increvable', 25),
  T('chanceux', 'Chanceux', 25), T('insoumis', 'Insoumis', 30), T('banquier', 'Le Banquier', 40),
  T('parieur', 'Parieur fou', 40), T('loot', 'Seigneur du loot', 50), T('collection', 'Collectionneur', 55),
  T('dragon', 'Tueur de dragons', 60), T('appart', 'Légende de l’Appart 33', 80), T('empereur', 'Empereur', 100),
  T('intouchable', 'Intouchable', 120), T('boss', 'Le Boss', 150), T('dieu', 'Dieu de l’Arène', 200),
  T('president', 'Président', 250),
  T('naine', 'Destructeur de naine', 500),
  T('dormeur', 'Gros dormeur', 8), T('tchatteur', 'Roi du tchat', 12), T('philo', 'Philosophe', 15), T('flambeur', 'Flambeur', 20),
  T('tacticien', 'Tacticien', 25), T('clefs', 'Maître des clefs', 30), T('donjon', 'Roi du donjon', 35), T('fantome', 'Le Fantôme', 35),
  T('horde', 'Survivant de la Horde', 45), T('mecene', 'Mécène', 60), T('melenchon', 'Chasseur de Mélenchon', 70),
  T('seigneur', 'Seigneur de guerre', 90), T('legende', 'Légende vivante', 180), T('immortel', 'Immortel', 300),
  // Couleurs de pseudo
  C('vert', 'Pseudo vert', 15, '#4cd964'), C('bleu', 'Pseudo bleu', 15, '#3d9bff'), C('rouge', 'Pseudo rouge', 15, '#ff5d6c'),
  C('cyan', 'Pseudo cyan', 20, '#48dbfb'), C('rose', 'Pseudo rose', 25, '#ff8fc7'), C('violet', 'Pseudo violet', 30, '#b05cff'),
  C('orange', 'Pseudo orange', 30, '#ff9f1a'), C('or', 'Pseudo doré', 60, '#ffd84a'), C('arcenciel', 'Pseudo arc-en-ciel', 150, 'rainbow'),
  C('menthe', 'Pseudo menthe', 20, '#7bf09a'), C('glace', 'Pseudo glace', 25, '#9fd0ff'), C('corail', 'Pseudo corail', 25, '#ff7f6b'),
  C('lavande', 'Pseudo lavande', 30, '#c9a7ff'), C('argent', 'Pseudo argent', 45, '#d8dee6'), C('rubis', 'Pseudo rubis', 50, '#ff2e63'),
  C('emeraude', 'Pseudo émeraude', 50, '#2ee59d'), C('feu', 'Pseudo de feu', 120, 'fire'), C('galaxie', 'Pseudo galaxie', 180, 'galaxy'),
  // Teintures de tenue (pour le personnage actif)
  D('noir', 'Noir corbeau', 20, { body: '#34303d', sleeve: '#2b2733', accent: '#8e2b2b', headC: '#3d3947', legs: '#26232c' }),
  D('blanc', 'Blanc neige', 20, { body: '#eef2f6', sleeve: '#d9e0e8', accent: '#3d9bff', headC: '#f4f8fc', legs: '#c9d1da' }),
  D('rouge', 'Rouge sang', 25, { body: '#a82424', sleeve: '#8e1f1f', accent: '#ffd84a', headC: '#c0392b', legs: '#5a1414' }),
  D('bleu', 'Bleu royal', 25, { body: '#2e5aa8', sleeve: '#244a8c', accent: '#ffd84a', headC: '#3d6fd1', legs: '#1c3566' }),
  D('vert', 'Vert forêt', 25, { body: '#2f7d3a', sleeve: '#276a31', accent: '#e5b33a', headC: '#3f9a4a', legs: '#1f4d26' }),
  D('rose', 'Rose bonbon', 30, { body: '#ff8fc7', sleeve: '#f27bb6', accent: '#ffffff', headC: '#ffa6d4', legs: '#c25d92' }),
  D('violet', 'Violet mystique', 35, { body: '#6c3fb5', sleeve: '#5a339a', accent: '#48dbfb', headC: '#7d4fd1', legs: '#3d2670' }),
  D('orange', 'Orange fluo', 35, { body: '#ff8c1a', sleeve: '#e67a10', accent: '#2a2238', headC: '#ffa040', legs: '#7a3d08' }),
  D('turquoise', 'Turquoise', 40, { body: '#1abc9c', sleeve: '#16a085', accent: '#ffffff', headC: '#26d0ad', legs: '#0e6655' }),
  D('camo', 'Camouflage', 50, { body: '#55663f', sleeve: '#4a5a36', accent: '#3b2a20', headC: '#6b7a4f', legs: '#3d4a2c' }),
  D('argent', 'Argent', 70, { body: '#c3cad3', sleeve: '#aab4c0', accent: '#3d9bff', headC: '#e0e6ee', legs: '#8f96a0' }),
  D('bronze', 'Bronze', 70, { body: '#b07a3a', sleeve: '#9a6830', accent: '#5a3a22', headC: '#c98a4a', legs: '#6b4423' }),
  D('or', 'Or massif', 120, { body: '#ffd84a', sleeve: '#e5b33a', accent: '#c0392b', headC: '#ffe680', legs: '#b8860b' }),
  D('ombre', 'Ombre', 150, { body: '#16121f', sleeve: '#1f1a2e', accent: '#b05cff', headC: '#262038', legs: '#0e0b16' }),
  // Effets de victoire
  V('confettis', 'Confettis', 30, ['#ff5d6c', '#ffd84a', '#4cd964', '#3d9bff', '#b05cff']),
  V('coeurs', 'Pluie de cœurs', 40, ['#ff5d6c', '#ff8fc7', '#ffffff']),
  V('eclairs', 'Éclairs', 50, ['#e8f4ff', '#8fd3ff', '#ffd84a']),
  V('feu', 'Feu d’artifice', 60, ['#ff9f1a', '#ffd84a', '#ff3a1a', '#ffffff']),
  V('or', 'Pluie d’or', 80, ['#ffd84a', '#e5b33a', '#fff3b0']),
  V('clat', 'Pluie de Flouze', 100, ['#2ecc71', '#a8f0c0', '#1e8449']),
  V('neige', 'Neige', 35, ['#ffffff', '#e0f7ff', '#9fd0ff']), V('petales', 'Pétales', 40, ['#ff8fc7', '#ffd1e8', '#ffffff']),
  V('etoiles', 'Étoiles filantes', 45, ['#fff3b0', '#ffd84a', '#ffffff']), V('poison', 'Nuage toxique', 50, ['#7bed6f', '#3fbf3f', '#b05cff']),
  V('dragon', 'Sang du dragon', 70, ['#e8364a', '#a8182c', '#ff9f1a']), V('galaxie', 'Galaxie', 120, ['#b05cff', '#3d9bff', '#ff8fc7', '#ffffff']),
  // Skins : 4 par classe
  K('guerrier', 'noir', 'Chevalier noir', 60, { body: '#34303d', sleeve: '#2b2733', accent: '#e8364a', headC: '#3d3947', headA: '#e8364a', legs: '#26232c', boots: '#1b1530', glove: '#2b2733' }),
  K('guerrier', 'samourai', 'Samouraï', 80, { body: '#d63031', sleeve: '#b02525', accent: '#ffd84a', headC: '#1b1530', headA: '#ffd84a', legs: '#2b2733', boots: '#1b1530', glove: '#1b1530', hair: '#1b1530' }),
  K('guerrier', 'viking', 'Viking', 90, { hair: '#e07b24', body: '#8a5a2b', sleeve: '#6b4423', accent: '#3d9bff', headC: '#c9d1dc', headA: '#f3dfb0', legs: '#3b2a20', boots: '#2a1d10', glove: '#6b4423', skin: '#f6caa0' }),
  K('guerrier', 'templier', 'Templier doré', 150, { body: '#ffd84a', sleeve: '#e5b33a', accent: '#f4f8fc', headC: '#ffe680', headA: '#e8364a', legs: '#b8860b', boots: '#7a4e2a', glove: '#e5b33a' }),
  K('mage', 'necro', 'Nécromancien', 70, { body: '#1f1a2e', sleeve: '#16121f', accent: '#4cd964', headC: '#16121f', headA: '#4cd964', legs: '#1f1a2e', boots: '#0e0b16', beard: '#9aa3ad', skin: '#d6cdb8' }),
  K('mage', 'glace', 'Mage de glace', 80, { body: '#3d9bff', sleeve: '#2e7fd6', accent: '#e0f7ff', headC: '#2e7fd6', headA: '#e0f7ff', legs: '#3d9bff', boots: '#1c3566', beard: '#f4f8fc', hair: '#f4f8fc' }),
  K('mage', 'feu', 'Mage de feu', 90, { body: '#c0392b', sleeve: '#a82424', accent: '#ff9f1a', headC: '#a82424', headA: '#ffd84a', legs: '#c0392b', boots: '#3b1a10', beard: '#d9822b', hair: '#d9822b' }),
  K('mage', 'archimage', 'Archimage', 150, { body: '#eef2f6', sleeve: '#d9e0e8', accent: '#ffd84a', headC: '#f4f8fc', headA: '#ffd84a', legs: '#eef2f6', boots: '#8a6a3a' }),
  K('archer', 'assassin', 'Assassin', 70, { body: '#2b2733', sleeve: '#1f1a2e', headC: '#1f1a2e', accent: '#e8364a', legs: '#1b1530', boots: '#16121f', glove: '#2b2733' }),
  K('archer', 'automne', 'Chasseur d’automne', 60, { body: '#c0662b', sleeve: '#a8541f', headC: '#8a3d1a', accent: '#ffd84a', legs: '#5a3a22', glove: '#7a4e2a' }),
  K('archer', 'elfe', 'Elfe des neiges', 90, { body: '#eef2f6', sleeve: '#d9e0e8', headC: '#c9d1da', accent: '#3d9bff', legs: '#9aa3ad', boots: '#6b7684', hair: '#f4f8fc', skin: '#f6d6b8' }),
  K('archer', 'royal', 'Ranger royal', 150, { body: '#5b3fa8', sleeve: '#4e3594', headC: '#4a2f91', accent: '#ffd84a', legs: '#2b2140', boots: '#ffd84a', glove: '#ffd84a' }),
  K('paladin', 'croise', 'Croisé', 70, { body: '#f4f8fc', sleeve: '#d9e0e8', accent: '#e8364a', cape: '#e8364a', headC: '#ffd84a', legs: '#9aa3ad' }),
  K('paladin', 'jade', 'Chevalier de jade', 80, { body: '#1abc9c', sleeve: '#16a085', accent: '#ffd84a', cape: '#0e6655', headC: '#ffd84a', legs: '#0e6655', glove: '#16a085' }),
  K('paladin', 'tenebres', 'Paladin des ténèbres', 90, { body: '#34303d', sleeve: '#2b2733', accent: '#b05cff', cape: '#4a2f91', headC: '#8a93a3', legs: '#26232c', boots: '#16121f', glove: '#2b2733', hair: '#1b1530' }),
  K('paladin', 'solaire', 'Gardien solaire', 150, { body: '#ffd84a', sleeve: '#e5b33a', accent: '#ff9f1a', cape: '#c0392b', headC: '#fff3b0', legs: '#b8860b', glove: '#e5b33a' }),
];
export const COSMETIC = Object.fromEntries(COSMETICS.map(c => [c.id, c]));
