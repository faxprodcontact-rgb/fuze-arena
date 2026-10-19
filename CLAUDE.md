# Fuze Arena — notes pour Claude

Jeu RPG mobile (PWA) en JavaScript pur, sans étape de build. Le propriétaire parle français et
n'est pas développeur : répondre en français, simplement, sans jargon.

- En ligne : https://faxprodcontact-rgb.github.io/fuze-arena/ (GitHub Pages, branche `main`)
- Base de données : Supabase (`js/net.js`, `js/config.js`, scripts SQL dans `serveur/`)

## Les fichiers

| Fichier | Rôle |
|---|---|
| `js/data.js` | Tous les réglages : classes, objets, raretés, donjons, raid, trône, combat auto… |
| `js/engine.js` | Logique du jeu (combats déterministes avec graine, XP, coffres, fusion, raid, trône, auto) |
| `js/main.js` | Interface (écrans, onglets, modales) |
| `js/battle.js` | Rendu des combats sur canvas (duel, vagues, horde, mêlée 4v4) |
| `js/sprites.js` | Sprites en pixel art dessinés par code (héros, monstres, boss politiques, icônes) |
| `js/patchnotes.js` | Notes de mise à jour + cadeaux (la plus récente en haut) |
| `js/net.js` | Supabase : comptes, classement, tchat, raid, `fight_log` (sert aussi au trône) |
| `js/sfx.js` | Sons et musique |
| `css/style.css` | Styles |

## Publier une mise à jour

Tout ce qui est poussé sur `main` part en ligne (GitHub Pages, 1 à 2 min ; en cas de retard,
regarder https://www.githubstatus.com).

Les téléphones se mettent à jour en comparant `version.json` à `js/version.js`. Pour un
changement du jeu, il faut donc changer le numéro de version partout (`?v=` dans `index.html`
et dans tous les imports de `js/*.js`, plus `js/version.js` et `version.json`) :

- sur Mac : `./publier.sh "message de commit"` fait tout (bump + commit + push) ;
- sur Linux, `sed -i ''` ne marche pas : refaire les mêmes étapes avec `sed -i`.

Pour chaque changement visible par les joueurs, ajouter une note en haut de `js/patchnotes.js`.
Un changement qui ne touche pas au jeu (comme ce fichier) n'a pas besoin de nouvelle version.

## Cadeaux (dans `js/patchnotes.js`)

`gift: { id, amount, chests, combatChests, text }`
- `amount` = Flouze ; `chests` = coffres normaux pour le perso actif ; `combatChests` = coffres de combat.
- `id` doit être unique et jamais réutilisé : chaque compte ne peut récupérer un cadeau qu'une fois.
- `for: ['Pseudo']` sur la note = visible seulement par ces comptes (comparaison sans tenir
  compte des majuscules). Un cadeau « rien qu'à lui » doit TOUJOURS avoir `for`.

## Règles de travail

- Ne pas lire ni modifier la base Supabase de production sans l'accord explicite du propriétaire.
  Ne jamais lui demander de coller une clé dans la conversation.
- Tester hors ligne : copier le site dans un dossier temporaire, vider `SUPABASE_URL` /
  `SUPABASE_KEY` dans la copie de `js/config.js`, servir avec `python3 -m http.server`, puis
  vérifier avec Playwright (captures d'écran).
- Équilibrage : les combats sont déterministes (graine), on règle par simulations Node en
  important `js/engine.js`. Attention : importer `data.js` avec le même `?v=` que l'engine,
  sinon les modifications en mémoire ne s'appliquent pas.

## Réglages importants actuels

- XP : `xpForLevel = round((50 + 15·niv) × 1,02^niv)` ; rattrapage `XP_CATCHUP` +5 % par
  niveau de retard sur le perso le plus haut du jeu (max +100 %) ; `ALT_XP_MULT = 1` (plus de ×2).
- Coffres par niveau : `LEVEL_KEYS` (1, puis 2 dès 30, 3 dès 50, 4 dès 70, 5 dès 90).
- Raretés : 0 à 6 ; Mythique (×12) et Chaotique (×16) seulement par fusion. Fusion « tout d'un coup » : `fuseAll`.
- Donjons : `dungeonDifficulty`, `DUNGEON_HP_MULT`, `DUNGEON_HARD` dans `engine.js`.
- Tour infinie : `TOWER.xpMult = 0.3`.
- Raid : boss politiques en rotation (Mélenchon → Hollande → Sarkozy → Le Pen → Macron), de plus
  en plus forts (`RAID_BOSSES`, `RAID.cycleBoost`) ; le boss suivant arrive dès que l'actuel est battu.
- Trône (`THRONE`) : classement par puissance des 4 persos, défis 4v4 en mêlée, clefs
  hebdomadaires 5/3/2 puis 1.
- Combat auto (`AUTO`) : 10 difficultés × 100 paliers, sans XP ; 1 coffre normal par dizaine
  (jamais redonné), défaite → retour à la dizaine + 1. Calibré : 2 000 de puissance d'équipe
  ≈ difficulté 3 palier 50 ; équipe parfaite (4 × niv 100 tout Chaotique + panoplie) = D10 P100.
- Corrections de niveau ponctuelles : `LEVEL_FIXES` (appliquées une seule fois par compte).

## En cours : proposition de refonte graphique (en attente de la réponse du propriétaire)

Il veut passer du pixel art à un style dessin vectoriel « Hero Wars » (gros contour, cel-shading,
couleurs vives, fond bleu nuit et or). La maquette est faite mais n'est PAS appliquée au jeu.

- Maquette (canevas Claude Design, privé) : https://claude.ai/artifact/5PLawLqU5eQLT7X77ZeWos
  — 5 planches : écran de combat, fiche héros, kit d'interface, les héros, les monstres.
- Tous les fichiers sont sur la branche `refonte-graphique`, dossier `refonte/` (voir son
  `README.md`) : dessins SVG réutilisables (4 héros, 3 monstres, décor forêt, 15 icônes),
  guide de style `refonte/art/STYLE.md`, planches, aperçus PNG et scripts qui les génèrent.
- S'il accepte : redessiner toutes les classes, les monstres des donjons, les 5 boss de raid,
  le trône et les décors, puis les écrans ; réécrire le rendu des combats (`battle.js` /
  `sprites.js`) pour des dessins vectoriels animés par parties du corps. Travailler sur la
  branche `refonte-graphique` et ne publier sur `main` qu'une fois validé par lui.
