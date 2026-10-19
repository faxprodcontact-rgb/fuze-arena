// =====================================================================
//  NOTES DE MISE À JOUR — la plus récente en premier.
//  Pour une nouvelle mise à jour : ajouter une entrée tout en haut de la liste.
//  gift = cadeau à récupérer une seule fois par compte (amount = Flouze, combatChests = coffres de combat).
//  for = liste de pseudos : la note (et son cadeau) n'est visible que par ces comptes.
// =====================================================================
export const PATCH_NOTES = [
  {
    id: '2026-10-19-1756', date: '19/10/2026', time: '17h56', title: 'Combat auto : nouvelle difficulté',
    sections: [
      { title: 'Combat auto', items: [
        'Les monstres sont maintenant réglés sur la puissance de ton équipe (tes 4 persos additionnés) : plus tu es puissant, plus tu montes.',
        'Repères : une équipe de 2 000 de puissance s’arrête vers la difficulté 3, palier 50. Le palier 100 de la difficulté 10 demande l’équipe parfaite : 4 persos niveau 100, tout en Chaotique avec la panoplie.',
        'Tout le monde repart du palier 1. Les coffres déjà gagnés ne sont pas redonnés : tu n’en regagnes qu’en dépassant ton ancien record.',
      ] },
    ],
  },
  {
    id: '2026-10-19-1649', date: '19/10/2026', time: '16h49', title: 'Nouveau : le combat auto',
    sections: [
      { title: 'Combat auto', items: [
        'Tout en haut de l’onglet Combats : tes 4 persos se battent tout seuls contre des vagues de monstres, en continu.',
        '10 difficultés de 100 paliers, à la suite. Les combats s’enchaînent sans pause, et ça continue même quand le jeu est fermé (un palier toutes les 10 secondes, jusqu’à 8 h rattrapées à ton retour).',
        'Tous les 10 paliers : 1 coffre mis en réserve (pas de clef). Récupère la réserve quand tu veux : les coffres vont à ton perso actif.',
        'Une défaite te renvoie au début de la dizaine : perdu au palier 37 → retour au 31.',
        'Tous les 10 paliers, un boss t’attend. Pas d’XP dans ce mode.',
      ] },
    ],
  },
  {
    id: '2026-10-19-1320', date: '19/10/2026', time: '13h20', title: 'Tout fusionner d’un coup',
    sections: [
      { title: 'Sac', items: [
        'Nouveau bouton « Tout fusionner » dans le Sac : toutes les fusions possibles d’un coup, en chaîne (les objets obtenus sont refusionnés tant que c’est possible).',
        'Avant de valider, tu vois la liste des objets que tu vas obtenir.',
      ] },
    ],
  },
  {
    id: '2026-10-19-1308', date: '19/10/2026', time: '13h08', title: 'Nouveau mode : Le trône',
    sections: [
      { title: 'Le trône', items: [
        'Dans Combats › Le trône : le classement de tous les joueurs. Celui du sommet est le roi, couronne sur la tête !',
        'Au début de chaque semaine (lundi 0 h), tout le monde est classé selon la puissance de ses 4 persos.',
        'Défie qui tu veux au-dessus de toi, autant de fois que tu veux : si tu gagnes, vous échangez vos places. Si tu perds, rien ne bouge.',
        'Combat à 4 contre 4 : tous tes persos contre tous les siens, en même temps, chacun selon sa vitesse.',
        'Fin de semaine : chacun de tes persos reçoit 5 clefs si tu es roi, 3 si tu es 2ᵉ, 2 si tu es 3ᵉ, et 1 clef pour tous les autres.',
        'Les défis du trône apparaissent dans le journal : tu peux les revoir et les partager.',
      ] },
    ],
  },
  {
    id: '2026-10-19-1251', date: '19/10/2026', time: '12h51', title: 'Correctif : pseudos colorés',
    sections: [
      { title: 'Correctif', items: ['Les pseudos arc-en-ciel, de feu et galaxie s’affichent partout correctement, y compris en haut à gauche et sur la fiche du héros (ils apparaissaient assombris).'] },
    ],
  },
  {
    id: '2026-10-19-1242', date: '19/10/2026', time: '12h42', title: 'Nouvelles raretés : Mythique et Chaotique',
    sections: [
      { title: 'Objets', items: [
        'Deux nouvelles raretés au-dessus de Légendaire : Mythique et Chaotique.',
        'Elles ne sortent jamais des coffres : uniquement par fusion. 2 Légendaires identiques donnent 1 Mythique, 2 Mythiques identiques donnent 1 Chaotique.',
        'Stats d’un objet : Légendaire ×9, Mythique ×12, Chaotique ×16 (par rapport à un Commun). Un peu plus de critique et d’esquive aussi.',
        'Revente : 100 Flouze pour un Mythique, 250 pour un Chaotique.',
      ] },
    ],
  },
  {
    id: '2026-10-19-1211', date: '19/10/2026', time: '12h11', title: 'Bonne semaine !',
    gift: { id: 'bonne-semaine-2026-10-19-1211', amount: 0, combatChests: 1, text: 'Bonne semaine les zgueg' },
    sections: [
      { title: 'Cadeau', items: ['1 coffre de combat offert à tout le monde. Bonne semaine les zgueg !'] },
    ],
  },
  {
    id: '2026-10-19-0825', date: '19/10/2026', time: '08h25', title: 'Fin du bonus des persos secondaires',
    sections: [
      { title: 'XP', items: [
        'Les persos secondaires n’ont plus l’XP ×2.',
        'L’aide aux retardataires reste : +5 % d’XP par niveau de retard sur le perso le plus haut du jeu, jusqu’à +100 %.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2158', date: '18/10/2026', time: '21h58', title: 'Raid : de nouveaux boss arrivent',
    sections: [
      { title: 'Raid', items: [
        'Après Mélenchon, un nouveau boss politique arrive à chaque raid de 7 jours, de plus en plus fort : François Hollande, Nicolas Sarkozy, Marine Le Pen, puis Emmanuel Macron.',
        'Chacun a ses attaques : Fuite en scooter, Coup de Kärcher, Flamme tricolore, En même temps, 49.3…',
        'Après Macron, la rotation recommence, et chaque boss revient plus fort qu’au tour d’avant.',
        'Dès qu’un boss tombe, le suivant arrive tout de suite (plus besoin d’attendre la fin des 7 jours). Ta récompense du boss battu t’attend en haut de l’écran du raid.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2128', date: '18/10/2026', time: '21h28', title: 'Compensation : correction de niveau',
    for: ['AlexDcr', 'Didztasoeur'],
    gift: { id: 'compensation-niveau-2026-10-18', amount: 200, text: 'Pendant les changements d’XP, ton perso est monté plus vite que prévu à cause d’un bug, et il a été ramené au niveau 33. Désolé pour la gêne ! Voici 200 Flouze en compensation. Merci de ta compréhension et bon jeu !' },
    sections: [
      { title: 'Correction', items: [
        'Ton perso monté trop vite a été remis au niveau 33. Tes points de stats en trop ont été retirés et ta barre de sorts ajustée.',
        'Tes objets, ton Flouze et tes clefs n’ont pas bougé.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2103', date: '18/10/2026', time: '21h03', title: 'Podium de la Puissance',
    sections: [
      { title: 'Social', items: [
        'Le podium des champions classe maintenant les joueurs à la Puissance de leur perso le plus fort, et non plus au niveau : l’équipement et les stats comptent !',
        'Les 3 du podium peuvent toujours écrire leur message de champion.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2057', date: '18/10/2026', time: '20h57', title: 'Persos rangés par niveau',
    sections: [
      { title: 'Persos', items: [
        'Tes persos sont maintenant toujours rangés par niveau : le plus haut à gauche, le plus bas à droite (fiche Héros, Combats et cartes des joueurs).',
      ] },
    ],
  },
  {
    id: '2026-10-18-2054', date: '18/10/2026', time: '20h54', title: 'Tour infinie : moins d’XP',
    sections: [
      { title: 'Tour infinie', items: [
        'Chaque étage réussi rapporte maintenant 3 fois moins d’XP qu’avant : on montait de niveau beaucoup trop vite dans la Tour.',
        'Le Flouze gagné par étage ne change pas.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2036', date: '18/10/2026', time: '20h36', title: 'Donjons : enchaînement automatique',
    sections: [
      { title: 'Donjons', items: [
        'Une vague se joue maintenant d’une traite, comme la Horde : le monstre tombe et le suivant arrive aussitôt par la droite, jusqu’au boss. Plus d’écran entre deux monstres.',
        'Tu reprends toujours un peu ton souffle entre deux monstres (les PV regagnés s’affichent au-dessus de ton perso), et tes recharges de sorts sont gardées.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2024', date: '18/10/2026', time: '20h24', title: 'Plus de clefs en montant de niveau',
    sections: [
      { title: 'Clefs de niveau', items: [
        'Chaque niveau gagné donne maintenant plus de clefs à haut niveau : 1 clef jusqu’au niveau 29, 2 clefs dès le niveau 30, 3 dès le 50, 4 dès le 70 et 5 dès le 90.',
        'Toujours 5 clefs aux niveaux 10, 20, 30, 40…',
      ] },
    ],
  },
  {
    id: '2026-10-18-2023', date: '18/10/2026', time: '20h23', title: 'Nouvelle courbe d’XP',
    sections: [
      { title: 'XP', items: [
        'Chaque niveau demande maintenant 2 % d’XP de plus que la formule d’avant, et ça s’additionne niveau après niveau : la montée ralentit petit à petit jusqu’au niveau 100.',
        'Les premiers niveaux changent peu (244 XP au niveau 10 au lieu de 200). Ensuite ça se corse : 906 XP au niveau 30, 2 153 au niveau 50, plus de 10 000 au niveau 99.',
        'Tu gardes ton niveau et ton XP actuels.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2010', date: '18/10/2026', time: '20h10', title: 'Donjons plus difficiles',
    sections: [
      { title: 'Donjons', items: [
        'Les monstres et les boss des donjons (à partir de C3 Blanche, niveau 10) sont beaucoup plus forts : plus de stats et plus de PV.',
        'Au niveau exact du donjon, le boss est très dur à battre : il faut quelques niveaux d’avance, un bon équipement et bien choisir ses sorts.',
        'Le premier donjon (Appartement 33) ne change pas, pour les nouveaux joueurs. La Horde, la Tour infinie et le raid non plus.',
      ] },
    ],
  },
  {
    id: '2026-10-18-2000', date: '18/10/2026', time: '20h00', title: 'Correctif : bonus d’XP',
    sections: [
      { title: 'XP', items: [
        'Persos secondaires : XP ×2 (au lieu de ×1,5) tant qu’ils sont sous le niveau de ton perso le plus haut. Dès qu’ils l’atteignent, le bonus s’arrête.',
        'Aide aux retardataires corrigée : +5 % d’XP par niveau de retard sur le perso le plus haut du jeu (tous joueurs confondus), jusqu’à +100 %. Avant, le calcul se faisait sur une moyenne, d’où des bonus bizarres comme +1 %.',
        'Les deux bonus s’ajoutent, et ils s’affichent maintenant tous les deux sur la fiche du perso.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1945', date: '18/10/2026', time: '19h45', title: 'PvP : aucun soin entre les duels',
    sections: [
      { title: 'PvP et Horde', items: [
        'Le perso qui gagne un duel garde ses PV, mais aussi ses recharges de sorts et son bouclier : il ne retrouve plus son sort de soin prêt à chaque nouveau duel. C’est vraiment l’épreuve de toute l’équipe.',
        'Même règle dans la Horde.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1939', date: '18/10/2026', time: '19h39', title: 'Nouveau mode : PvP en direct',
    sections: [
      { title: 'PvP en direct', items: [
        'Dans Combats › PvP : défie un pote connecté. Il reçoit une notification et a 3 minutes pour accepter.',
        'Écran VS avec les persos des deux équipes côte à côte. Tous vos persos entrent l’un après l’autre, du plus faible au plus fort ; le gagnant d’un duel garde ses PV. L’équipe qui n’a plus personne perd.',
        'Avec moins de 4 persos, tu peux jouer quand même (mais tu es désavantagé).',
        'Le gagnant touche 10 Flouze (5 fois par jour maximum). Tout le monde peut regarder les matchs.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1922', date: '18/10/2026', time: '19h22', title: 'Réglage de l’XP',
    sections: [
      { title: 'XP', items: [
        'Aide aux retardataires réduite : +5 % d’XP par niveau de retard (jusqu’à +100 %).',
        'Persos secondaires : XP ×1,5 (au lieu de ×2), seulement tant qu’ils sont sous le niveau de ton perso le plus haut. Dès qu’ils l’atteignent, le bonus s’arrête net.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1900', date: '18/10/2026', time: '19h00', title: 'Nouvelle XP, clefs de niveau et coffres toutes les 30 min',
    sections: [
      { title: 'XP', items: [
        'L’XP se gagne maintenant dans les donjons, la Tour infinie (à chaque étage réussi), le raid (à chaque assaut) et la Horde (à chaque essai, plus tu vas loin plus tu en gagnes).',
        'L’Arène et la Guerre ne donnent plus d’XP.',
        'Aide aux retardataires renforcée : +10 % d’XP par niveau de retard (jusqu’à +200 %).',
        'Tes persos secondaires (tous sauf ton plus haut niveau) gagnent l’XP ×2, en plus de l’aide aux retardataires.',
      ] },
      { title: 'Clefs et coffres', items: [
        'Chaque niveau gagné donne 1 clef, et 5 clefs aux niveaux 10, 20, 30…',
        'Un coffre gratuit toutes les 30 minutes (au lieu de 2 h).',
      ] },
      { title: 'Exceptionnel', items: ['Ce soir à 20 h, tous les compteurs sont rechargés une fois (donjons, Arène, Guerre, raid, Horde, missions, coffres). Ensuite, tout reprend comme d’habitude.'] },
    ],
  },
  {
    id: '2026-10-18-1749', date: '18/10/2026', time: '17h49', title: 'Correctif : le tchat',
    sections: [
      { title: 'Correctif', items: ['Le tchat défile normalement jusqu’en bas : le dernier message s’affiche juste au-dessus de la barre d’écriture, et le tchat s’ouvre directement sur les derniers messages.'] },
    ],
  },
  {
    id: '2026-10-18-1744', date: '18/10/2026', time: '17h44', title: 'Cadeau de bienvenue : 150 Flouze',
    gift: { id: 'bienvenue-2026-10-18', amount: 150, text: 'Bienvenue dans le nouveau Fuze Arena\u00a0! Pour fêter toutes les nouveautés (Horde, Social, Boutique, skins…), voici 150 Flouze offerts à chaque joueur. Bon jeu, et que le meilleur gagne\u00a0!' },
    sections: [
      { title: 'Cadeau', items: ['150 Flouze offerts à chaque joueur : touche « Récupérer » juste au-dessus. Une seule fois par compte.'] },
    ],
  },
  {
    id: '2026-10-18-1742', date: '18/10/2026', time: '17h42', title: 'Nouveau bandeau et encadré Sac',
    sections: [
      { title: 'Interface', items: [
        'Bandeau du haut refait : portrait encadré aux couleurs de ta classe, niveau en pastille dorée, ton Flouze, et la barre d’XP chiffrée. Touche ton portrait pour aller à l’onglet Héros.',
        'Encadré Sac refait : le nombre d’objets de chaque rareté, les fusions possibles, et les explications derrière le « + » jaune.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1740', date: '18/10/2026', time: '17h40', title: 'Nouvelle Boutique et skins',
    sections: [
      { title: 'Le marchand', items: [
        'La clef coûte maintenant 50 Flouze (au lieu de 100).',
        'Chaque jour, 3 objets gris à 10 Flouze pièce, un exemplaire de chaque, renouvelés à minuit.',
      ] },
      { title: 'Apparences', items: [
        'Les teintures sont remplacées par des skins : 4 par classe (Chevalier noir, Samouraï, Nécromancien, Mage de glace, Assassin, Elfe des neiges, Croisé, Paladin des ténèbres…). Ceux qui avaient une teinture la gardent.',
        '14 nouveaux titres, 9 nouvelles couleurs de pseudo (dont « feu » et « galaxie », animées) et 6 nouveaux effets de victoire.',
      ] },
    ],
  },
  {
    id: '2026-10-18-1731', date: '18/10/2026', time: '17h31', title: 'Nouveau Social et podium des champions',
    sections: [
      { title: 'Social', items: [
        'Nouvelles cartes avec un dessin pour chaque partie : Journal, Tchat, Classement, Joueurs.',
        'Podium des champions sous les cartes : les 3 plus hauts niveaux du groupe. Ceux du podium peuvent écrire un message qui s’affiche dans une bulle au-dessus de leur héros.',
        'Joueurs : touche un joueur pour voir sa carte d’identité (héros, équipement, puissance, vie, stats, victoires, records).',
        'Journal, Tchat, Classement et Joueurs simplifiés, avec un bandeau et 3 compteurs. Le Classement a un nouvel onglet Horde.',
      ] },
      { title: 'La Horde', items: ['Chaque palier rapporte 2 Flouze de plus.'] },
    ],
  },
  {
    id: '2026-10-18-1718', date: '18/10/2026', time: '17h18', title: 'Nouveau mode : La Horde',
    sections: [
      { title: 'La Horde', items: [
        'Des monstres arrivent à la chaîne, l’un après l’autre, sans pause et de plus en plus forts (le 1er est niveau 1).',
        'Aucun soin entre deux monstres : tu gardes tes PV jusqu’à tomber. Le but : aller le plus loin possible.',
        'Tu gagnes du Flouze selon le nombre de monstres battus (environ 2 par essai au début, 7 à 8 en fin de jeu).',
        '3 essais toutes les 12 h (minuit et midi) pour tout le compte, avec ton perso actif.',
        'Classement de la Horde : le record de chaque joueur.',
      ] },
    ],
  },
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
