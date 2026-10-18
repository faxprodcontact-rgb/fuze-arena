// =====================================================================
//  NOTES DE MISE À JOUR — la plus récente en premier.
//  Pour une nouvelle mise à jour : ajouter une entrée tout en haut de la liste.
// =====================================================================
export const PATCH_NOTES = [
  {
    id: '2026-10-18-1633', date: '18/10/2026', time: '16h33', title: 'Modes de combat refaits et donjons en vagues',
    sections: [
      { title: 'Donjons', items: [
        'Chaque entrée est une vague : 2 monstres différents d’affilée, puis le boss. Tes PV ne remontent qu’un peu entre deux combats : si tu tombes, la vague s’arrête.',
        'Chaque monstre battu rapporte un peu d’XP en plus. La difficulté a été réglée pour que la vague complète soit à peu près aussi dure qu’avant le boss seul.',
        'Tu gagnes au maximum 5 clefs toutes les 12 h par perso (remise à zéro avec les donjons). Ensuite, seulement de l’XP.',
        'Nouveau bouton « Passer » : tous tes donjons sauf les 2 plus durs peuvent être passés d’un coup, avec la moitié de l’XP.',
      ] },
      { title: 'Combats', items: [
        'Arène, Donjons, Tour, Raid, Guerre et Paris : nouveau bandeau avec 3 compteurs, et les règles cachées derrière le « + » jaune.',
        'Arène : « À combattre » et « Déjà affrontés » sont séparés. Chaque pote est noté Facile, Serré ou Costaud selon sa puissance.',
        'Les titres de fin de combat sont centrés.',
      ] },
      { title: 'Interface', items: ['Tous les emojis sont remplacés par des icônes en pixel art dans le style du jeu.'] },
    ],
  },
  {
    id: '2026-10-18-1604', date: '18/10/2026', time: '16h04', title: 'Nouvel onglet Combats',
    sections: [
      { title: 'Combats', items: [
        'Choix du combattant en grandes cases, avec ton perso actif mis en avant. Les points rouges ne sont plus coupés.',
        'Missions en 3 cartes, avec une icône, une barre de progression et le bonus des 3 missions.',
        'Les explications sont cachées derrière un petit « + » jaune en bas à droite : touche-le pour les lire.',
        'Nouvelles cartes pour l’Arène, les Donjons, la Tour, le Raid, la Guerre et les Paris, avec de nouveaux dessins pour chaque mode.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1552', date: '18/10/2026', time: '15h52', title: 'Nouvel onglet Héros',
    sections: [
      { title: 'Héros', items: [
        'Bandeau en haut avec le nom, le titre, le niveau et la puissance de ton héros.',
        'Entraînement en or : le combat contre l’épouvantail est dans un cadre doré, et 4 boutons en dessous pour changer de perso.',
        'Caractéristiques en bleu : une icône et une barre par stat, avec le détail base / points placés / équipement.',
        'Sorts présentés comme l’équipement : des emplacements à remplir, et ta collection de sorts en dessous.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1545', date: '18/10/2026', time: '15h45', title: 'Le Sac devient une armurerie',
    sections: [
      { title: 'Sac', items: [
        'Nouveau bandeau « Armurerie » : ta puissance, tes emplacements équipés, tes objets et tes panoplies actives.',
        'Ton héros est sous un projecteur, avec un sol lumineux à ses pieds.',
        'Les emplacements vides montrent une icône de ce qui va dedans ; les emplacements remplis brillent à la couleur de la rareté.',
        'Objets du sac plus stylés : reflet, halo selon la rareté, Épiques et Légendaires qui scintillent, titres de rareté avec une gemme.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1541', date: '18/10/2026', time: '15h41', title: 'Correctif : visage de l’archère',
    sections: [
      { title: 'Correctif', items: ['Le visage de l’archère est redessiné : la capuche ne mord plus sur le côté droit et l’œil n’est plus écrasé.'] },
    ],
  },
  {
    id: '2026-10-18-1540', date: '18/10/2026', time: '15h40', title: 'Héros redessinés à la main',
    sections: [
      { title: 'Héros', items: [
        'Les 4 classes sont redessinées à la main, pixel par pixel, en vue de trois-quarts, avec de vraies ombres et de nouveaux détails : casque à rivets et plumet, robe étoilée, capuche et carquois, cape et cotte de mailles…',
        'Nouvelle pose d’attaque : le héros se fend, jambe avant pliée et jambe arrière tendue.',
        'Le héros court vraiment quand il fonce sur l’ennemi ; la robe du mage flotte dans le mouvement.',
        'Les teintures de la boutique marchent toujours.',
      ] },
      { title: 'Armes, familiers et équipement', items: [
        'Les 4 armes sont redessinées plus finement (épée à gemme, bâton à cristal, arc à poignée dorée, marteau à rivets).',
        'Tous les familiers sont redessinés, plus grands et plus détaillés.',
        'Dans l’écran d’équipement, l’arme du héros passe derrière les cases au lieu d’être coupée.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1521', date: '18/10/2026', time: '15h21', title: 'Nouvelle salle des coffres',
    sections: [
      { title: 'Coffres', items: [
        'Les 3 coffres sont redessinés, plus détaillés et parfaitement symétriques : bois, cerclages, rivets, serrure.',
        'Un coffre ouvert montre maintenant son trésor : pièces d’or et gemmes.',
        'Nouvelle « Salle des coffres » : grandes cartes aux couleurs de chaque coffre, compteur, rayons de lumière quand il y a quelque chose à ouvrir.',
        'Les chances de rareté s’affichent en barre colorée, et ton stock de coffres en cases dorées.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1515', date: '18/10/2026', time: '15h15', title: 'Critique et esquive sur les objets',
    sections: [
      { title: 'Objets', items: [
        'Les armes donnent maintenant des coups critiques en plus : de +1 % (Commun) à +6 % (Légendaire).',
        'Les bottes donnent de l’esquive en plus : de +1 % (Commun) à +4 % (Légendaire).',
        'Ces bonus s’affichent dans la fiche de l’objet, comparés à celui que tu portes.',
      ] },
      { title: 'Équilibre', items: [
        'Plafonds pour tout le monde : jamais plus de 40 % de critique ni de 25 % d’esquive (Chance, objets et bonus compris).',
        'Tes vraies chances, plafonds compris, s’affichent dans les Caractéristiques et pendant l’entraînement.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1510', date: '18/10/2026', time: '15h10', title: 'Nouvel onglet Héros et 20 nouveaux sorts',
    sections: [
      { title: 'Onglet Héros', items: [
        'Nouveau bandeau en haut : pseudo, titre, classe, niveau dans un blason doré, puissance, vie et victoires. Sa couleur suit ta classe.',
        'Sous l’entraînement, un petit bouton par personnage : touche-le pour en changer et le voir s’entraîner.',
        'Caractéristiques plus claires : résumé Vie, Critique et Esquive, détail de chaque stat (base, points, équipement) et bonus actifs de panoplie et de familier.',
        'Sorts : 4 emplacements de combat en haut, ta collection en dessous. Touche un sort pour voir sa fiche, l’équiper, le remplacer ou le retirer.',
      ] },
      { title: '20 nouveaux sorts', items: [
        'Chaque classe apprend maintenant un sort de plus aux niveaux 15, 35, 45, 65 et 85 : 16 sorts par classe au total.',
        'Guerrier : Provocation, Saignée, Peau de fer, Double tranchant, Cri de ralliement.',
        'Mage : Missiles arcaniques, Nova de givre, Bouclier de mana, Chaîne d’éclairs, Embrasement.',
        'Archer : Flèche enflammée, Tir entravant, Camouflage, Flèche lourde, Pluie empoisonnée.',
        'Paladin : Bénédiction, Bouclier lancé, Lumière purificatrice, Égide, Marteau du jugement.',
        'Si ton perso a déjà le niveau, les nouveaux sorts sont déjà dans ta collection.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1454', date: '18/10/2026', time: '14h54', title: 'Choisis ton combattant',
    sections: [
      { title: 'Interface', items: [
        'Le choix du personnage a déménagé en haut de l’onglet Combats : « Choisis ton combattant », puis tu pars te battre.',
        'Sur chaque personnage, un petit point rouge discret (sans chiffre) indique qu’il a des coffres à ouvrir.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1450', date: '18/10/2026', time: '14h50', title: 'Détail des caractéristiques',
    sections: [
      { title: 'Héros', items: [
        'Chaque caractéristique montre maintenant d’où elle vient, avec 3 pastilles de couleur.',
        'Gris : la base de ta classe et de ton niveau.',
        'Vert : les points que tu as placés.',
        'Bleu : ce que t’apporte ton équipement (objets, bonus de panoplie et affinité du familier).',
      ] },
    ],
  },
  {
    id: '2026-10-18-1447', date: '18/10/2026', time: '14h47', title: 'Chaque objet a ses propres stats',
    sections: [
      { title: 'Objets', items: [
        'Chaque objet a maintenant son propre mélange de stats, toujours à puissance égale.',
        'La stat de sa panoplie reste la plus forte (27 pour un Légendaire).',
        'Puis une stat liée à l’emplacement : Attaque ou Magie pour une arme, Défense pour une armure, Vitesse pour des bottes, Chance pour une amulette, Vitalité pour un chapeau (11 en Légendaire).',
        'Puis une stat bonus propre à l’objet (7), et un peu de tout le reste (2 chacune).',
        'Deux objets de la même panoplie ne donnent donc plus les mêmes stats : compare-les dans ton sac !',
      ] },
    ],
  },
  {
    id: '2026-10-18-1443', date: '18/10/2026', time: '14h43', title: 'Chaque panoplie a son domaine',
    sections: [
      { title: 'Objets', items: [
        'Chaque pièce de panoplie donne maintenant un peu de toutes les stats, et beaucoup de la stat de sa panoplie (par exemple, la panoplie de Thomas est spécialisée en Vitesse).',
        'Un objet Légendaire donne ainsi 27 dans la stat de sa panoplie et 5 dans chacune des autres.',
        'Les bonus de panoplie ne boostent plus que la stat de leur domaine : +12 % avec 3 pièces, +25 % avec 5 pièces.',
        'Les objets que tu as déjà sont mis à jour automatiquement.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1441', date: '18/10/2026', time: '14h41', title: 'Nouvel écran d’équipement',
    sections: [
      { title: 'Sac', items: [
        'L’équipement s’affiche maintenant autour de ton héros : il est au centre, avec 3 emplacements à gauche (chapeau, armure, bottes) et 3 à droite (arme, amulette, familier).',
        'Ton héros bouge, prend sa pose d’attaque de temps en temps, et son familier flotte à ses pieds.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1429', date: '18/10/2026', time: '14h29', title: 'Notes de mise à jour et joueurs en ligne',
    sections: [
      { title: 'Nouveau', items: [
        'Bouton parchemin en haut de l’écran : les notes de chaque mise à jour, datées, la plus récente en premier. Un point rouge apparaît quand il y a du nouveau.',
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
