// =====================================================================
//  NOTES DE MISE À JOUR — la plus récente en premier.
//  Pour une nouvelle mise à jour : ajouter une entrée tout en haut de la liste.
//  gift = cadeau à récupérer une seule fois par compte (amount = Flouze, chests = coffres normaux pour le perso actif, combatChests = coffres de combat).
//  for = liste de pseudos : la note (et son cadeau) n'est visible que par ces comptes.
//  Fuze Arena 2.0 : les anciennes notes ont été retirées, tout le monde repart de zéro.
// =====================================================================
// Classement final de l'ancien Fuze Arena (puissance de toute l'équipe, relevée le 20/10/2026) et cadeau de chaque place
const OLD_RANKING = [
  ['Fuuuuze', 2539], ['AlexDcr', 2517], ['Kush', 2182], ['Tchomb', 2160],
  ['Simon', 2117], ['Didztasoeur', 2010], ['Le Stein', 1496], ['guillaumkar', 100],
];
const RANK_GIFTS = [
  { chests: 30, warChests: 5, amount: 300 }, { chests: 25, warChests: 4, amount: 250 },
  { chests: 20, warChests: 3, amount: 200 }, { chests: 15, warChests: 2, amount: 150 },
  { chests: 12, warChests: 2, amount: 120 }, { chests: 10, warChests: 1, amount: 100 },
  { chests: 8, warChests: 1, amount: 80 }, { chests: 5, warChests: 1, amount: 50 },
];

export const PATCH_NOTES = [
  {
    id: '2026-10-20-1900-v2', date: '20/10/2026', time: '19h00', title: 'Bienvenue dans Fuze Arena 2.0 !',
    sections: [
      { title: 'Un tout nouveau Fuze Arena', items: [
        'Le jeu a été entièrement redessiné : héros, monstres, boss, décors, objets et tous les écrans.',
        'Plein de nouvelles fonctionnalités sont arrivées partout dans le jeu… on te laisse les découvrir !',
        'Tout le monde repart de zéro, avec les mêmes chances pour tous.',
        'Bonne chance à tous, et que le meilleur gagne !',
      ] },
    ],
  },
  // Récompense de l'ancien Fuze Arena : un message rien qu'à lui pour chaque joueur, selon sa place
  ...OLD_RANKING.map(([pseudo, power], i) => ({
    id: `2026-10-20-1900-classement-${i + 1}`, date: '20/10/2026', time: '19h00', for: [pseudo],
    title: `Ancien Fuze Arena : tu finis ${i + 1}${i ? 'ᵉ' : 'ᵉʳ'} !`,
    gift: { id: `fuze-2-0-classement-${i + 1}`, ...RANK_GIFTS[i], text: `Ta récompense de ${i + 1}${i ? 'ᵉ' : 'ᵉʳ'} de l’ancien Fuze Arena. Les coffres vont à ton perso actif quand tu les récupères.` },
    sections: [
      { title: 'Merci d’avoir joué !', items: [
        `Dans l’ancien Fuze Arena, ton équipe avait ${power.toLocaleString('fr-FR')} de puissance : tu termines ${i + 1}${i ? 'ᵉ' : 'ᵉʳ'} sur ${OLD_RANKING.length}.`,
        'Voici ta récompense pour bien démarrer la 2.0. Bonne chance !',
      ] },
      { title: 'Le classement final', items: OLD_RANKING.map(([p, w], j) => `${j + 1}. ${p} : ${w.toLocaleString('fr-FR')} de puissance`) },
    ],
  })),
];

