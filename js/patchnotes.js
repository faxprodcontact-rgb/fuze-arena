// =====================================================================
//  NOTES DE MISE À JOUR — la plus récente en premier.
//  Pour une nouvelle mise à jour : ajouter une entrée tout en haut de la liste.
// =====================================================================
export const PATCH_NOTES = [
  {
    id: '2026-10-18-1429', date: '18/10/2026', time: '14h29', title: 'Notes de mise à jour et joueurs en ligne',
    sections: [
      { title: 'Nouveau', items: [
        'Bouton 📜 en haut de l’écran : les notes de chaque mise à jour, datées, la plus récente en premier. Un point rouge apparaît quand il y a du nouveau.',
        'Voyant en ligne / hors ligne : écran « Joueurs » dans Social, avec qui est connecté et depuis quand les autres ne sont pas venus.',
        'Petit voyant vert à côté des joueurs connectés dans l’Arène et le Classement.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1424', date: '18/10/2026', time: '14h24', title: 'Refonte graphique et nouveaux monstres',
    sections: [
      { title: 'Graphismes', items: [
        'Tous les dessins sont lissés, ombrés, avec des reflets et des contours colorés.',
        'Les 4 héros sont redessinés, plus détaillés, avec une vraie pose d’attaque. Ils sont 15 % plus grands en combat et leur arme ne cache plus leur visage.',
        'Effets de sorts lumineux : halos, éclairs ramifiés, traînées d’épée, flash aux impacts.',
        'Décors en profondeur : ciel en dégradé, brume, nuages qui bougent et ambiance animée (lucioles, braises, neige, confettis…).',
        'Les 13 boss d’origine sont redessinés plus finement, Mélenchon compris.',
        'Icônes d’objets, de familiers, de sorts, de coffres et de monnaie en très haute définition, et plus grandes.',
        'Interface peaufinée : cartes en relief, boutons brillants, onglet actif doré, objets Épiques et Légendaires qui scintillent.',
      ] },
      { title: 'Monstres', items: [
        '11 nouveaux monstres : chaque donjon a maintenant 2 boss possibles, tirés au hasard (Rat géant, Loup des bois, Zombie, Crapaud géant, Araignée, Momie, Salamandre, Ours polaire, Chevalier noir, Œil des abysses, Hydre).',
        'La Tour infinie fait tourner les 22 boss.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1343', date: '18/10/2026', time: '13h43', title: 'Grosse mise à jour',
    sections: [
      { title: 'Donjons, clés et coffres', items: [
        'Chaque donjon se fait 3 fois toutes les 12 h (minuit et midi), pour chaque personnage.',
        'Une victoire en donjon rapporte de l’XP et 1 clé. 1 clé = 1 coffre en plus, propre à chaque personnage.',
        'Bouton « Tout ouvrir » pour ouvrir tous ses coffres et clés d’un coup.',
        'La boutique vend des clés : 100 Flouze la clé.',
      ] },
      { title: 'Modes de jeu', items: [
        'Mélenchon repart à zéro : 3 assauts par compte toutes les 12 h, PV calculés selon le niveau du groupe.',
        'Tour infinie : tentatives illimitées, on reste bloqué à l’étage tant qu’on ne l’a pas gagné.',
        'Arène remise à zéro chaque jour à minuit.',
        'Guerre : une attaque par jour contre chaque adversaire, et la guerre dure 7 jours complets.',
        'Missions : 3 nouvelles missions toutes les 12 h, tirées parmi 32.',
      ] },
      { title: 'Combats', items: [
        'Les 4 sorts s’affichent sous le héros, avec leur temps de recharge.',
        'Mode manuel en donjon, à la tour et contre Mélenchon (contre un vrai joueur, le mode auto reste obligatoire).',
        'Chaque familier a sa propre attaque et une affinité de classe (+5 % dans une stat).',
      ] },
      { title: 'Objets', items: [
        'Sac triable par rareté ou par panoplie.',
        'Vente des objets contre du Flouze (de 1 pour un Commun à 40 pour un Légendaire).',
        '2 nouvelles panoplies de magie : McDo et Footballeur.',
        'Replacer ses points coûte maintenant 20 Flouze.',
      ] },
      { title: 'Divers', items: [
        'Les Pierres Clat s’appellent maintenant le Flouze.',
        'Record d’entraînement de tous les joueurs affiché sur l’écran Héros.',
        'Podium dans le Classement.',
        'Animation des 4 bleus contre les 4 rouges sur l’écran de la Guerre.',
        'Nouveau logo de l’appli.',
        'Tous les compteurs ont été remis à zéro pour tout le monde.',
      ] },
    ],
  },
  {
    id: '2026-10-18-0105', date: '18/10/2026', time: '01h05', title: 'Raid Mélenchon et entraînement',
    sections: [
      { title: 'Nouveautés', items: [
        'Zone d’entraînement en haut de l’onglet Héros : ton perso tape un épouvantail en boucle, avec tes stats en direct.',
        'Le raid dure 7 jours à partir de son ouverture. Mélenchon a toujours au moins 20 000 PV.',
      ] },
      { title: 'Correctif', items: ['L’écran du raid pouvait figer l’appli pendant le chargement.'] },
    ],
  },
  {
    id: '2026-10-18-0037', date: '18/10/2026', time: '00h37', title: 'Journal, raid, tour, boutique et paris',
    sections: [
      { title: 'Nouveautés', items: [
        'Journal des combats : revoir un combat, se venger, le partager dans le tchat.',
        'Raid Mélenchon : un boss commun à tout le groupe.',
        'Tour infinie avec son classement.',
        'Boutique d’apparences : titres, couleurs de pseudo, teintures, effets de victoire.',
        'Paris sur les duels entre potes.',
        'Missions du jour.',
        'Bonus d’XP pour les joueurs en retard sur le groupe.',
        'Quand on t’attaque, c’est ton personnage le plus fort qui défend.',
      ] },
    ],
  },
  {
    id: '2026-10-17-1756', date: '17/10/2026', time: '17h56', title: 'Lancement de Fuze Arena',
    sections: [
      { title: 'Le jeu', items: [
        '4 classes (Guerrier, Mage, Archer, Paladin) jusqu’au niveau 100, un nouveau sort tous les 10 niveaux.',
        'Coffres, fusion d’objets, panoplies des potes et familiers.',
        'Arène, donjons et guerre entre 2 sections de 4 joueurs.',
        'Jusqu’à 4 personnages par compte, chacun avec ses coffres et ses donjons.',
        'Tchat, combats plein écran avec bruitages et musique, revanches amicales.',
        'Mise à jour automatique du jeu sur les téléphones.',
      ] },
    ],
  },
];
