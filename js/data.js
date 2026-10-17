// =====================================================================
//  DONNÉES DU JEU — c'est ici qu'on change les noms, stats, sorts, objets
// =====================================================================

export const MAX_LEVEL = 100;
export const POINTS_PER_LEVEL = 3;
export const CHEST_INTERVAL_MS = 2 * 60 * 60 * 1000; // un coffre toutes les 2 h
export const CHEST_MAX = 5;                          // cumulables jusqu'à 5
export const WINS_PER_COMBAT_CHEST = 3;              // 3 victoires = 1 coffre de combat
export const MAX_ACTIVE_SPELLS = 4;
export const DUNGEON_INTERVAL_MS = 2 * 60 * 60 * 1000; // une entrée de donjon toutes les 2 h
export const DUNGEON_MAX = 3;                          // cumulables jusqu'à 3

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
//  GUERRE DES SECTIONS — semaine du lundi 00:00 au dimanche 23:59
// ---------------------------------------------------------------------
export const WAR = {
  sections: {
    rouge: { name: 'Section Rouge', color: '#ff5d6c' },
    bleue: { name: 'Section Bleue', color: '#3d9bff' },
  },
  attacksPerDay: 3,        // attaques de guerre par jour (1 fois max par adversaire)
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
    basic: { name: 'Rebond', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_slam'] },
  { id: 'd10', lvl: 10, name: 'C3 Blanche', boss: 'Chef Gobelin', sprite: 'goblin', theme: 'forest',
    profile: { vit: 1.1, atk: 0.85, mag: 0.3, def: 0.8, spd: 0.8, lck: 0.6 },
    basic: { name: 'Coup de gourdin', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_club', 'x_roar'] },
  { id: 'd20', lvl: 20, name: 'Université de Lorraine', boss: 'Seigneur Squelette', sprite: 'skeleton', theme: 'crypt',
    profile: { vit: 1, atk: 0.9, mag: 0.3, def: 0.85, spd: 0.8, lck: 0.6 },
    basic: { name: 'Coup d’os', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_harden', 'x_bones'] },
  { id: 'd30', lvl: 30, name: 'Bayonne', boss: 'Champignon Toxique', sprite: 'mushroom', theme: 'swamp',
    profile: { vit: 1.3, atk: 0.5, mag: 0.9, def: 0.9, spd: 0.6, lck: 0.5 },
    basic: { name: 'Coup de chapeau', scale: 'mag', mult: 0.9, melee: true, fx: 'bash' }, spells: ['x_regen', 'x_spores'] },
  { id: 'd40', lvl: 40, name: 'Maison Mervans', boss: 'Golem de pierre', sprite: 'golem', theme: 'mine',
    profile: { vit: 1.25, atk: 1, mag: 0.2, def: 1.05, spd: 0.4, lck: 0.3 },
    basic: { name: 'Poing de pierre', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_harden', 'x_stomp', 'x_rock'] },
  { id: 'd50', lvl: 50, name: 'Double B', boss: 'Spectre maudit', sprite: 'ghost', theme: 'crypt',
    profile: { vit: 1, atk: 0.3, mag: 1.05, def: 0.6, spd: 0.9, lck: 0.8 },
    basic: { name: 'Toucher spectral', scale: 'mag', mult: 0.95, fx: 'bolt' }, spells: ['x_curse', 'x_drain', 'x_wail'] },
  { id: 'd60', lvl: 60, name: 'Luxembourg Place', boss: 'Élémentaire de feu', sprite: 'fireElem', theme: 'volcano',
    profile: { vit: 1.1, atk: 0.3, mag: 1.05, def: 0.7, spd: 0.85, lck: 0.6 },
    basic: { name: 'Flammèche', scale: 'mag', mult: 0.95, fx: 'fireball' }, spells: ['x_burn', 'x_firewave'] },
  { id: 'd70', lvl: 70, name: 'Chalet des Vosges', boss: 'Yéti', sprite: 'yeti', theme: 'glacier',
    profile: { vit: 1.4, atk: 1.1, mag: 0.7, def: 0.9, spd: 0.8, lck: 0.5 },
    basic: { name: 'Griffes', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_frost', 'x_roar', 'x_slam'] },
  { id: 'd80', lvl: 80, name: 'Commissariat', boss: 'Comte Vampire', sprite: 'vampire', theme: 'castle',
    profile: { vit: 1.05, atk: 0.9, mag: 0.8, def: 0.75, spd: 1, lck: 0.7 },
    basic: { name: 'Griffes', scale: 'atk', mult: 1, melee: true, fx: 'slash' }, spells: ['x_bite', 'x_bats', 'x_curse'] },
  { id: 'd90', lvl: 90, name: 'Mélusine', boss: 'Démon des abysses', sprite: 'demon', theme: 'abyss',
    profile: { vit: 1.2, atk: 0.6, mag: 1, def: 0.8, spd: 0.8, lck: 0.6 },
    basic: { name: 'Griffe infernale', scale: 'mag', mult: 0.95, fx: 'bolt' }, spells: ['x_regen', 'x_hellfire', 'x_drain', 'x_curse'] },
  { id: 'd100', lvl: 100, name: 'Maison de Salva', boss: 'Dragon ancien', sprite: 'dragon', theme: 'volcano',
    profile: { vit: 1.5, atk: 0.8, mag: 1, def: 1, spd: 0.6, lck: 0.5 },
    basic: { name: 'Coup de queue', scale: 'atk', mult: 1, melee: true, fx: 'bash' }, spells: ['x_harden', 'x_meteors', 'x_breath', 'x_roar'] },
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
};

// ---------------------------------------------------------------------
//  OBJETS — stats au rang Commun (multipliées selon la rareté)
//  Chaque pièce : 3 points dans la stat de la panoplie + 2 points selon l'emplacement
//  icon : forme dessinée, colors : [couleur principale, couleur secondaire]
// ---------------------------------------------------------------------
const SECOND = { hat: 'vit', armor: 'def', boots: 'spd', amulet: 'lck' };
function setItems(set, weaponStat, list) {
  const focus = SETS[set].stat;
  return list.map(([slot, name, icon, colors, extra = {}]) => {
    const stats = { [focus]: 3 };
    const sec = slot === 'weapon' ? weaponStat : SECOND[slot];
    stats[sec] = (stats[sec] || 0) + 2;
    return { id: `${set}_${slot}`, name, slot, set, icon, colors, stats, ...extra };
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
