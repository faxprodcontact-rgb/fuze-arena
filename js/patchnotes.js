// =====================================================================
//  NOTES DE MISE À JOUR — la plus récente en premier.
//  Pour une nouvelle mise à jour : ajouter une entrée tout en haut de la liste.
//  gift = cadeau à récupérer une seule fois par compte (amount = Flouze, chests = coffres normaux pour le perso actif, combatChests = coffres de combat).
//  for = liste de pseudos : la note (et son cadeau) n'est visible que par ces comptes.
//  Fuze Arena 2.0 : les anciennes notes ont été retirées, tout le monde repart de zéro.
// =====================================================================
export const PATCH_NOTES = [
  {
    id: '2026-10-20-0121-v2', date: '20/10/2026', time: '01h21', title: 'Bienvenue dans Fuze Arena 2.0 !',
    gift: { id: 'fuze-2-0-bienvenue', amount: 100, chests: 10, text: 'Pour bien démarrer cette nouvelle aventure : 10 coffres et 100 Flouze ! Les coffres vont à ton perso actif quand tu les récupères.' },
    sections: [
      { title: 'Un tout nouveau Fuze Arena', items: [
        'Tout le jeu est redessiné : héros, monstres, boss, décors, objets, familiers, sorts et écrans.',
        'Tout le monde repart de zéro : nouvelle aventure, mêmes chances pour tous.',
      ] },
      { title: 'Ce qui change', items: [
        'Un seul perso au départ : le 2ᵉ se débloque au niveau 15, le 3ᵉ au niveau 30 et le 4ᵉ au niveau 50.',
        'Niveaux : rapides au début, de plus en plus longs vers le niveau 100.',
        'Coffres : 10 au maximum par ouverture. Plus tu en ouvres, plus ta chance monte (compteur sur chaque coffre).',
        'Fusion : il faut 3 Mythiques identiques pour 1 Chaotique.',
        'Le marchand vend des objets de toutes les raretés, du Commun à l’Épique.',
        'Entraînement : touche un de tes sorts pour que ton héros le lance et voir ses dégâts.',
        'Combat auto : en grand en haut de l’onglet Combats, et il donne un peu d’XP.',
        'Nouveau : le Championnat, un tournoi à 8 chaque semaine, combats à 19 h 30.',
      ] },
      { title: 'Cadeau de bienvenue', items: ['10 coffres et 100 Flouze offerts à tout le monde. Bon jeu !'] },
    ],
  },
];
