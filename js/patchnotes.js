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
        'Le marchand vend des objets de toutes les raretés, du Commun à l’Épique, et change ses 3 objets toutes les 4 h.',
        'Nouveau dans la boutique : les enchères. Mets 1 objet en vente pendant 24 h, il part au plus offrant.',
        'Équipement revu : chapeau, armure et amulette donnent toujours de la Vie ; arme, bottes et familier de l’Attaque ou de la Magie. Chaque panoplie ajoute ses 2 spécialités (17 panoplies, toutes différentes).',
        'Bonus de panoplie sur ses 2 spécialités : +5 % à 2 pièces, +10 % à 3 pièces, +15 % à 5 pièces. Mélange 2 panoplies (3 + 2) pour booster 4 stats !',
        'Critique et esquive : sur toutes les pièces, à partir de Légendaire, et plus fort en Mythique et Chaotique.',
        '4 nouvelles panoplies : Brasier, Givre, Aube et Néant, dans tous les coffres comme les autres.',
        'Nouveaux skins élémentaires dans la boutique : Feu et Glace (200 Flouze), Lumière et Ténèbres (280 Flouze), pour chaque classe. Un tout nouveau look, une arme assortie et une aura en combat.',
        'Entraînement : ton héros ne fait que des attaques simples ; touche un de tes sorts pour qu’il le lance et voir ses dégâts.',
        'Combat auto : en grand en haut de l’onglet Combats, et il donne un peu d’XP.',
        'Nouveau : le Championnat, un tournoi à 8 chaque semaine, combats à 19 h 30, avec son tableau dessiné.',
        'Les modes de combat sont rangés en 3 parties : PVP, COOP et PVM.',
        'Nouveau : le mode Histoire (dans PVM). 5 zones de 10 combats avec petit boss et boss, puis l’Enfer et le Chaotique. Gagne des étoiles pour des coffres, et de l’XP à chaque première victoire.',
        'Le gros boss ne donne plus d’XP : c’est l’Histoire qui la remplace.',
        'Arène : tu peux retenter un pote tant que tu ne l’as pas battu (une défaite ne coûte rien).',
        'Revanches : 5 Flouze (au lieu de 1) pour la 1ʳᵉ revanche gagnée contre chaque pote, chaque jour.',
        'Récompenses : le PVP rapporte du Flouze, le PVM des clefs, la COOP les deux.',
        'Trône : une manche tous les 3 jours. 100 Flouze au roi, 50 au 2ᵉ, 25 à tous les autres.',
        'Championnat : 100 Flouze au champion, 50 au finaliste, 25 à tous les autres.',
        'Horde : une clef pour ton perso si tu bats 30 monstres.',
        'Tour infinie : 5 clefs tous les 10 étages, 10 clefs à partir de l’étage 50.',
        'Gros boss : 1 coffre de guerre et 25 Flouze pour chaque participant quand il tombe.',
        'Guerre : chaque semaine, tout le monde rechoisit son camp. La section perdante reçoit 1 coffre de combat.',
        'Donjons, Horde et gros boss : plus de remise à zéro à minuit et à midi. Chaque essai utilisé revient au bout de 4 h (3 en réserve), donc tu peux rejouer plusieurs fois dans la journée. Les clefs de donjon : 10 par jour.',
        'La Horde se compte par perso, et chaque nouveau perso arrive avec 5 coffres.',
        'Le blason de niveau change tous les 10 niveaux, jusqu’au blason Légende du niveau 100.',
        'Touche un sort pour voir ton héros le lancer en boucle. Et 5 musiques de combat !',
      ] },
      { title: 'Cadeau de bienvenue', items: ['10 coffres et 100 Flouze offerts à tout le monde. Bon jeu !'] },
    ],
  },
];
