# Refonte graphique — proposition

Maquette d'un nouveau style pour Fuze Arena : dessin vectoriel façon « Hero Wars » à la place
du pixel art. Rien de tout ça n'est encore dans le jeu : le propriétaire doit d'abord valider.

Canevas en ligne (privé) : https://claude.ai/artifact/5PLawLqU5eQLT7X77ZeWos

## Contenu

| Dossier | Contenu |
|---|---|
| `apercus/` | Les 5 planches en image (`combat`, `fiche-heros`, `heros`, `monstres`, `interface`) + captures du jeu actuel (`avant-*`) |
| `art/` | Dessins SVG réutilisables dans le jeu : `guerrier`, `mage`, `archer`, `paladin` (viewBox 240×300), `monstre-gluant`, `monstre-loup`, `monstre-demon`, `decor-foret` (390×844, format écran), et 15 icônes dans `art/ui/` |
| `art/STYLE.md` | Guide de style des personnages : proportions, palette, contour `#1b1530`, cel-shading avec lumière en haut à gauche, visages, matières, structure des fichiers pour l'animation. Polices de l'interface (planche Interface) : Lilita One pour titres et chiffres, Nunito pour les textes |
| `planches/` | Les planches du canevas Claude Design (`*.dc.html` + `canvas.json`) |
| `outils/` | Scripts Node qui génèrent les SVG et les planches (`*-build.cjs`), et `render.cjs` pour faire un PNG avec Playwright |
| `outils/decors.cjs` | Les 12 décors de combat du jeu (`art/decors/<thème>.svg`, 3 plans loin / milieu / sol), avec ses briques dans `decors-kit.cjs`. `node refonte/outils/decors.cjs [thème]` |
| `apercu-decors.html` | Aperçu des décors en portrait et en paysage avec un héros et un monstre (servir le dossier avec `python3 -m http.server 8091`) |
| `simulations/` | Scripts d'équilibrage utilisés pour régler donjons, raid, mêlée et combat auto |

## À savoir

- Les identifiants dans chaque SVG ont un préfixe propre (`gu-`, `ma-`, `ar-`, `pa-`…) : on peut
  en mettre plusieurs dans la même page sans conflit.
- `planches/Heros.dc.html` affiche les anciens sprites via une image stockée dans le canevas
  (`/_blob/…`) : elle ne s'affiche que dans le canevas.
- Les scripts de `outils/` et `simulations/` ont été écrits dans une session cloud : ils
  contiennent des chemins absolus (`/tmp/claude-0/…/scratchpad/refonte`, `/home/user/fuze-arena`)
  à adapter avant de les relancer.
