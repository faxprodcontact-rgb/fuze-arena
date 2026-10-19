# Fuze Arena : guide de style de la refonte graphique

Référence : `art/guerrier.svg` (préfixe `gu-`). **Ouvre-le et copie ses recettes** : tout ce qui suit en est tiré.
Aperçus : `previews/gu-v7.png` (taille normale), `previews/gu-planche.png` (de 300 à 56 px de haut, sur 3 fonds), `previews/gu-avant-apres.png`.

Intention : **cartoon chibi « illustration de jeu mobile »** (esprit Hero Wars / AFK Arena en vectoriel).
- Grosse tête, grands yeux brillants.
- Contour sombre épais à l'extérieur et fin à l'intérieur.
- Cel-shading net : des aplats et des formes d'ombre à bords francs, pas de flou.
- Couleurs saturées, métal qui brille.

Ce n'est **pas** du dessin d'enfant : chaque volume a sa lumière, son ombre et son reflet.

---

## 1. Format, cadrage, proportions

| Règle | Valeur |
|---|---|
| Fichier | `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">` … `</svg>`, sans width/height |
| Sol | semelles à **y = 292** |
| Centre du corps | x ≈ 110–125 (le guerrier : torse 82–160, centre ≈ 120) |
| Orientation | **3/4 tourné vers la DROITE** : nez, regard et arme côté droit de l'image |
| Lumière | **en haut à gauche** : reflets en haut à gauche, ombres en bas à droite |
| Tête | **~40–43 % de la hauteur** (accessoires de tête compris) |
| Taille max | < 45 Ko (le guerrier fait 35 Ko) |

Repères verticaux du guerrier (à reprendre pour que les 4 héros aient la même échelle) :

| Élément | y |
|---|---|
| haut du plumet / chapeau | 4 |
| sommet du crâne/casque | ~30 |
| sourcils | 100–110 |
| yeux | 110–134 |
| bouche | 138–146 |
| menton | **155** |
| épaules | 142–200 |
| ceinture | 208–228 |
| bas de la jupe/tunique | ~245 |
| genoux | 235–259 |
| revers des bottes | 266–278 |
| sol | 292 |

Règles de 3/4 vers la droite :
- **Visage** : les traits sont décalés vers la droite. L'œil proche (côté gauche de l'image) est large (20 px). L'œil lointain est plus étroit (13 px) et proche du bord droit de la joue. La joue lointaine forme le profil arrondi à droite. Le menton est en bas à droite.
- **Torse** : le centre du vêtement (tabard, croix, boutons) est décalé à droite. On voit le flanc côté gauche.
- **Membres** : le bras et l'épaulière **proches** sont à gauche, plus gros et devant. Les éléments **lointains** sont à droite, plus petits et derrière (dessinés avant le torse).
- **Pose de combat légère** : jambes écartées, la proche en arrière à gauche et la lointaine en avant à droite. L'arme est tenue côté droit, prête. La tête est penchée de 3° vers l'avant (`rotate(3 128 150)`).

---

## 2. Palette (hex)

### Commun à tous
| Rôle | Clair / reflet | Base | Ombre | Ombre profonde |
|---|---|---|---|---|
| **Contour** | | `#1b1530` | | |
| Peau claire | `#ffe9d6` | `#fdd2ad` | `#eea07e` | `#c8705c` (nez) |
| Peau mate | `#e8b48c` | `#c98b5e` | `#9f6040` | `#74402c` (nez) |
| Joues (blush) | | `#ff8b7e` à opacity 0.5–0.55 | | |
| **Acier argent** | `#ffffff` / `#eef2fa` | `#c3cce0` | `#9ba7c3` | `#6f7a9b` (`#4a5273` très rare) |
| Cotte de mailles | `#c3cbe0` | `#7f8aa8` | `#5a6381` | |
| **Or** | `#fff7c4` / `#ffe168` | `#f7bc2a` | `#cd7e15` | `#8f4c0a` |
| **Cuir** | `#c58a58` (`#e0a875` liseré) | `#94593a` | `#6a3a24` | `#45230f` (semelles, trous) |
| Bois (bâton, arc) | `#c98f55` | `#9a6234` | `#6b3d1f` | `#45230f` |
| Blanc des yeux | | `#ffffff` | | |
| Intérieur bouche | | `#7a2433` | | langue `#e8706e` |
| Gemme rouge | reflet `#ffffff` | `#e3343d` | | |

### Tissus et cheveux par classe
| Classe | Clair | Base | Ombre | Profonde |
|---|---|---|---|---|
| **Guerrier** (rouge) | `#ff6d60` | `#e3343d` | `#a81d35` | `#6e1129` |
| **Mage** (violet) | `#b57cf2` | `#7d47cc` | `#532b96` | `#351868` |
| **Archer** (vert) | `#8edc5e` | `#4ea83c` | `#2f7432` | `#1c4a26` |
| **Paladin** tunique crème | `#fffaf0` | `#f3e6c8` | `#cdb68e` | `#9c8460` |
| **Paladin** cape bleue | `#6aaeff` | `#3773d8` | `#23499c` | `#162f6c` |
| Orbe cyan (mage) | cœur `#f0ffff` | `#8ff5ff` → `#27c4ea` | `#0b78b0` | halo : dégradé `ma-lueur`, `#e8ffff` 0.9 → `#8ff5ff` 0.5 → 0 (§ 7) |
| Cheveux bruns (guerrier, archer) | `#a8714a` | `#6e4329` | `#48291a` | sourcils `#3a2114` |
| Cheveux/barbe blancs (mage) | `#ffffff` | `#e2e7f2` | `#aeb7cf` | `#7f88a6` |
| Cheveux blonds (paladin) | `#fff2a8` | `#ffd45a` | `#e0a42c` | `#a8701a` |

Iris (dégradé vertical, sombre en haut, très clair en bas) :
- Guerrier : `#16225e → #2d74dc → #8fe3ff` (bleu).
- Suggestions : Mage `#2a1660 → #7b52e0 → #d6c2ff` (violet malicieux), Archer `#1e3d14 → #4f9a2c → #c6f08a` (vert vif), Paladin `#0f2f5c → #2f8fd8 → #b8ecff` (bleu calme).

Le contour est **toujours** `#1b1530`, sur tout : peau, métal, tissu. Seules exceptions : le nez (trait en peau profonde) et les sourcils (couleur sombre des cheveux).

---

## 3. Traits

| Quoi | Épaisseur | Comment |
|---|---|---|
| **Silhouette extérieure** | **≈ 5 px visibles** | « doublure » : les mêmes formes en `stroke-width="7"`, remplies de `#1b1530`, dessinées **sous** les pièces du groupe |
| Contour d'une pièce | **3** (2.5 pour les petites : boucle, poignée, pouce) | `fill="none" stroke="#1b1530"` dessiné **après** l'intérieur de la pièce |
| Détails internes | 1.4 – 2.5 | coutures de plaques 2–2.5, doigts 1.8, cils inférieurs 1.4–1.6, écailles de mailles 1.3 |
| Tous les traits | | `stroke-linejoin="round" stroke-linecap="round"` (mis une fois sur le `<g>` racine) |

La doublure donne automatiquement un contour gros dehors et fin dedans. Là où deux pièces se chevauchent, seul le trait 3 de la pièce de devant se voit.

```xml
<!-- doublure d'un groupe : mêmes tracés que les pièces, sans détail -->
<g fill="#1b1530" stroke="#1b1530" stroke-width="7">
  <path d="M54 174C52 154 68 142 90 142C110 142 120 152 118 166C114 178 98 186 78 188C64 189 55 184 54 174Z"/>
  …
</g>
```

---

## 4. Construire une pièce : la recette en 3 couches

Chaque volume (épaulière, botte, visage, manche…) se fait ainsi :
1. Un **clipPath** avec la forme de la pièce (dans `<defs>`, id préfixé).
2. Un **groupe découpé** : un `rect` qui couvre la boîte de la pièce, rempli de la couleur de base (ou d'un dégradé). Par-dessus, les **formes d'ombre et de reflet**, dessinées sans se soucier des bords : le clip les coupe proprement.
3. Le **contour** : le même tracé en `fill="none" stroke="#1b1530" stroke-width="3"`.

Exemple réel, l'épaulière proche du guerrier :

```xml
<clipPath id="gu-epauliere-avant-coque"><path d="M54 174C52 154 68 142 90 142C110 142 120 152 118 166C114 178 98 186 78 188C64 189 55 184 54 174Z"/></clipPath>
…
<!-- épaulière avant : coque -->
<g clip-path="url(#gu-epauliere-avant-coque)">
  <rect x="50" y="140" width="72" height="51" fill="url(#gu-steel)"/>                                    <!-- base -->
  <path d="M54 178C66 186 94 184 110 172C116 166 118 160 118 154L124 154L124 194L50 194Z" fill="#9ba7c3"/> <!-- ombre (croissant bas-droite) -->
  <path d="M72 190C92 186 108 178 118 166L122 166L122 194L66 194Z" fill="#6f7a9b"/>                      <!-- ombre profonde -->
  <path d="M60 170C60 157 70 148 84 147C74 152 67 160 65 171Z" fill="#ffffff"/>                           <!-- reflet en virgule, haut-gauche -->
  <circle cx="91" cy="150" r="2.2" fill="#ffffff"/>                                                     <!-- point spéculaire -->
  <path d="M59 179C64 184 72 186 80 186" fill="none" stroke="#eef2fa" stroke-width="2"/>                 <!-- lumière réfléchie au bord bas -->
</g>
<path d="M54 174C52 154 68 142 90 142C110 142 120 152 118 166C114 178 98 186 78 188C64 189 55 184 54 174Z" fill="none" stroke="#1b1530" stroke-width="3"/>
```

Petits éléments sans volume (rivets, gemmes, sparkles) : directement `fill` et `stroke` sur l'élément, avec un trait de 1.4 à 2.2.

```xml
<circle cx="70" cy="173" r="2.6" fill="url(#gu-gold)" stroke="#1b1530" stroke-width="1.6"/>   <!-- rivet doré -->
<circle cx="0" cy="-12" r="4.5" fill="#e3343d" stroke="#1b1530" stroke-width="2"/><circle cx="-1.4" cy="-13.6" r="1.4" fill="#ffffff"/>  <!-- gemme -->
```

---

## 5. Ombre et lumière (cel-shading)

1. **Base** : un aplat. Dégradé **seulement** pour le métal, l'or, l'iris, l'orbe et les halos de lumière (§ 7).
2. **Ombre propre** : un croissant de couleur *Ombre* côté **bas-droite**, sur 30–40 % du volume. Sa limite intérieure suit la forme : courbe pour une sphère, verticale pour un cylindre (jambière : bande verticale à droite).
3. **Ombre profonde** (métal, plis serrés, contacts) : un 2ᵉ croissant plus petit dans le premier.
4. **Ombres portées**, toujours en couleur *Ombre* et toujours présentes :
   - sous le rebord du casque ou du chapeau, une bande sur le front : `M96 80L182 80L182 97C150 94 120 100 102 114L96 114Z` ;
   - sous le col sur le haut du vêtement ;
   - sous la ceinture sur la jupe ;
   - sous l'épaulière sur le flanc.
5. **Reflet** : une forme claire (*Clair*), ou blanche sur le métal, en **haut-gauche**. Sur le métal, c'est une virgule allongée qui suit le bord, plus un point spéculaire. Pour les gros volumes brillants (casque, lame), ajoute une **étincelle à 4 branches** blanche :
   ```xml
   <path d="M84 52L86 57L91 59L86 61L84 66L82 61L77 59L82 57Z" fill="#ffffff"/>
   ```
6. **Lumière réfléchie** (métal seulement) : un trait fin `#eef2fa` (largeur 2–2.5) le long du bord bas-gauche, à l'intérieur. C'est ce qui fait « chromé ».
7. Transparence, deux cas seulement. Sinon, couleurs pleines.
   - **Attribut `opacity`** : le blush des joues, les mini-reflets de peau et l'ombre au sol.
   - **`stop-opacity` d'un `radialGradient`** : les halos de lumière (orbe, feu, yeux luisants). Un seul cercle, cœur à 0.85–0.9 et bord à 0 (§ 7, « Lumière magique »). On ne fait **jamais** un halo avec des cercles empilés en `opacity`.

Dégradés du guerrier (à recopier en changeant le préfixe) :

```xml
<linearGradient id="gu-steel" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#f7f9ff"/><stop offset="0.45" stop-color="#c3cce0"/><stop offset="1" stop-color="#8a95b2"/></linearGradient>
<linearGradient id="gu-gold"  x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c4"/><stop offset="0.45" stop-color="#f7bc2a"/><stop offset="1" stop-color="#d98a16"/></linearGradient>
<linearGradient id="gu-iris"  x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16225e"/><stop offset="0.55" stop-color="#2d74dc"/><stop offset="1" stop-color="#8fe3ff"/></linearGradient>
```

Les dégradés sont en `objectBoundingBox` (par défaut). Ils s'appliquent au `rect` qui couvre la pièce, donc le `rect` doit coller à la boîte de la forme (± 2 px).

---

## 6. Visage

Construction, dans l'ordre :
1. **Peau** : recette en 3 couches. Ombre sur la joue lointaine et la mâchoire (croissant à droite et en bas), plus l'ombre portée du front. Blush sous chaque œil et petit reflet blanc sur la pommette proche :
   ```xml
   <path d="M172 96C166 122 158 142 128 156L180 160L180 96Z" fill="#eea07e"/>
   <ellipse cx="117" cy="138" rx="7" ry="4" fill="#ff8b7e" opacity="0.55"/><ellipse cx="163" cy="136" rx="4" ry="3" fill="#ff8b7e" opacity="0.5"/>
   <ellipse cx="113" cy="135" rx="2.2" ry="1.4" fill="#ffffff" opacity="0.8"/>
   ```
2. **Yeux** : blanc, puis iris et pupille découpés dans le blanc, puis reflets, puis cils. Œil proche environ 20 × 25, œil lointain environ 13 × 23, écartés de 15 px.
   ```xml
   <!-- oeil proche -->
   <path d="M115 114C119 110 130 109 135 112C137 118 137 126 134 131C131 135 120 135 117 131C114 126 113 119 115 114Z" fill="#ffffff"/>
   <g clip-path="url(#gu-eye1)">  <!-- clipPath = même tracé que le blanc -->
     <ellipse cx="126.5" cy="123" rx="7.5" ry="10" fill="url(#gu-iris)"/>
     <ellipse cx="127" cy="122" rx="3.6" ry="5.4" fill="#1b1530"/>
     <path d="M120 127C123 132 130 132 133 127C130 130 123 130 120 127Z" fill="#c6f4ff"/>   <!-- croissant lumineux bas d'iris -->
   </g>
   <ellipse cx="123" cy="117.5" rx="3" ry="3.6" fill="#ffffff"/><circle cx="130" cy="128" r="1.6" fill="#ffffff"/>  <!-- 2 reflets : gros haut-gauche, petit bas-droite -->
   <path d="M110 116C117 108 129 107 138 112L137 115.5C129 112 120 112 115 118L110 118Z" fill="#1b1530"/>  <!-- cils supérieurs : forme pleine, épaisse, coin extérieur carré -->
   <path d="M118 133C122 135 127 135 131 133" fill="none" stroke="#1b1530" stroke-width="1.6"/>          <!-- cil inférieur fin et court -->
   ```
   - La paupière supérieure **couvre le haut de l'iris** : c'est ce qui donne un regard concentré.
   - Expression par la paupière :
     - **plate et inclinée vers le nez** = déterminé (guerrier) ;
     - **mi-close, en arc vers le bas** = malicieux (mage) ;
     - **bien ronde et ouverte, reflets gros** = vif (archer) ;
     - **douce, légèrement baissée, arc régulier** = calme (paladin).
   - Pas de « virgules » de cils relevées pour les hommes : ça féminise, on l'a vu en v2.
3. **Sourcils** : formes pleines épaisses, couleur des cheveux foncée, qui s'affinent vers l'extérieur.
   - Guerrier : bout intérieur plus bas = froncé.
   - Mage : sourcils blancs broussailleux et arqués.
   - Paladin : sourcils fins et horizontaux.
   ```xml
   <path d="M111 101C119 97 130 99 138 106L136.5 110C129 104 120 102 112 104.5Z" fill="#3a2114" stroke="#3a2114" stroke-width="1.2"/>
   ```
4. **Nez** : un tout petit crochet en peau profonde (pas en contour), **sous l'espace entre les yeux, côté œil lointain**, à environ 4 px sous les yeux. Il ne doit jamais toucher un œil, ni être horizontal (sinon il ressemble à une cicatrice).
   ```xml
   <path d="M146.5 127.5C148.5 129.5 148.2 131.8 145.2 132.4" fill="none" stroke="#c8705c" stroke-width="2"/>
   ```
5. **Bouche** : sous l'œil lointain, décalée à droite (3/4), et petite. Intérieur `#7a2433`, dents blanches en bande haute, contour de 2.
   ```xml
   <path d="M138 141C144 143 150 142 155 138C155 142.5 152 145.5 147 146C142 146.5 139 144.5 138 141Z" fill="#7a2433"/>
   <path d="M139 141.6C144 143.4 150 142.4 154.6 138.8L154.3 140.6C150 143.8 144 144.6 140 143.4Z" fill="#ffffff"/>
   <path d="M138 141C144 143 150 142 155 138C155 142.5 152 145.5 147 146C142 146.5 139 144.5 138 141Z" fill="none" stroke="#1b1530" stroke-width="2"/>
   <path d="M138 141L134.5 139.8" fill="none" stroke="#1b1530" stroke-width="2"/>   <!-- coin fermé = sourire en coin -->
   ```
   - Guerrier : sourire en coin assuré.
   - Mage : sourire malicieux sous la moustache (seul un trait courbe visible).
   - Archer : petit sourire ouvert.
   - Paladin : bouche fermée, léger sourire serein (un trait de 2 et un petit coin relevé).

---

## 7. Matières

- **Métal** : dégradé `-steel`, croissant `#9ba7c3`, ombre profonde `#6f7a9b`, virgule et point blancs, lumière réfléchie `#eef2fa`, rivets. Les coutures entre les plaques sont un trait de contour de 2 à 2.5 **à l'intérieur** du clip (la plaque du couvre-nuque, la ligne du genou).
- **Or** : dégradé `-gold`, ombre `#cd7e15` sur la moitié basse, liseré `#fff7c4` de 1.6 en haut à gauche.
- **Tissu** :
  - aplat, grande ombre côté droit, bande claire côté gauche ;
  - **plis** = paire « creux sombre + arête claire » : deux fuseaux fins qui partent de la ceinture et s'élargissent vers l'ourlet. L'ourlet ondule légèrement ;
  - **galon doré** = le tracé de la pièce en trait or de 9, **à l'intérieur du clip** (donc 4,5 px visibles), puis sa partie à l'ombre en `#cd7e15` via un second clip imbriqué :
   ```xml
   <path d="(tracé du tabard)" fill="none" stroke="#f7bc2a" stroke-width="9"/>
   <g clip-path="url(#gu-tabsh)"><path d="(tracé du tabard)" fill="none" stroke="#cd7e15" stroke-width="9"/></g>  <!-- gu-tabsh = zone d'ombre -->
   ```
  - Mage : étoiles dorées à 4 branches (forme de l'étincelle, en `#ffe168`, contour 1.4) semées sur la robe ; liserés dorés comme ci-dessus.
- **Cuir** : base `#94593a`, ombre `#6a3a24` en bas à droite, liseré clair `#c58a58` (2 à 2.5) sur l'arête éclairée. Les semelles sont une bande `#45230f` découpée dans la botte. Revers de botte plus clair (`#c58a58`) avec une couture `#e0a875`.
- **Cotte de mailles** : base `#7f8aa8`, rangées d'écailles décalées en `#5a6381` (trait 1.3), ombre `#5a6381` en bas. La rangée suivante est décalée de 2,5 px :
  ```xml
  <path d="M146 180q2.5 2.6 5 0q2.5 2.6 5 0q2.5 2.6 5 0 M148.5 185q2.5 2.6 5 0q2.5 2.6 5 0q2.5 2.6 5 0" fill="none" stroke="#5a6381" stroke-width="1.3"/>
  ```
  Paladin : même recette sur les jambes.
- **Mèches** (plumet, cheveux, barbe) :
  - une **silhouette unique** à pointes, recette en 3 couches, plus des traits internes en couleur *profonde* (2.2) qui séparent les mèches ;
  - la mèche du bas est à l'ombre, celle du haut porte une bande claire et un trait reflet rosé ou blanc (2.5) ;
  - les pointes partent **vers l'arrière et remontent un peu**. Pointes qui tombent vers le bas = « coulures » : à éviter (v2).
  - Voir `<!-- plumet -->` dans le guerrier ; même méthode pour la barbe du mage et les cheveux du paladin.
- **Lame et bois** : deux tons coupés au milieu de la lame (gauche clair, droite `#9ba7c3`), gorge centrale `#6f7a9b` de 3 avec un filet blanc, reflet blanc de 2.2 le long du biseau gauche, étincelle près de la pointe. Pour le bois (bâton, arc) : même idée, une arête claire à gauche, l'ombre à droite, 2 ou 3 traits de veinage en ombre profonde, trait de 1.4.
- **Lumière magique** (orbe du mage, feu et yeux du démon, tout ce qui émet de la lumière) : deux éléments.
  1. **La source** (orbe, flamme) est une pièce normale, avec son contour (2.5 pour l'orbe, 3 pour la boule de feu) et un `radialGradient` **opaque** décentré vers la lumière. Orbe : `cx="0.38" cy="0.36" r="0.68"`, `#f0ffff → #8ff5ff → #27c4ea → #0b78b0`.
  2. **Le halo** est **un seul cercle** (ou une seule ellipse), **sans contour**, rempli d'un `radialGradient` dont la transparence est portée par les **`stop-opacity`** (pas par l'attribut `opacity`) :
     - stop 0 : couleur presque blanche de la lumière, `stop-opacity` **0.85 à 0.9** (cœur clair et dense) ;
     - stop 0.4–0.45 : couleur de la lumière, **0.45 à 0.5**. C'est surtout cette zone qu'on voit autour de la source : ne descends pas plus bas ;
     - stop 1 : même couleur, **0**. Le bord s'éteint, on ne voit aucune limite.
   ```xml
   <radialGradient id="ma-lueur"><stop offset="0" stop-color="#e8ffff" stop-opacity="0.9"/><stop offset="0.45" stop-color="#8ff5ff" stop-opacity="0.5"/><stop offset="1" stop-color="#8ff5ff" stop-opacity="0"/></radialGradient>   <!-- cyan (mage) -->
   <radialGradient id="md-lueur"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ffb43a" stop-opacity="0.45"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>  <!-- feu (démon) -->
   …
   <!-- bâton : halo de l'orbe (sans contour) -->
   <circle cx="0" cy="-140" r="28" fill="url(#ma-lueur)"/>   <!-- même centre que l'orbe (r 14), rayon doublé -->
   ```
   - **Taille** : le diamètre du halo fait 1,5 à 2 fois la largeur de la source. Orbe de 28 px (r 14) → halo r 28 ; boule de feu de 50 px de large → r 36 ; petite flamme de 25 px → r 20.
   - **Place** : juste **avant** la source. Dans un groupe (arme, main), en **tout premier**, avant la doublure : il passe ainsi sous le contour et sous le bâton ou la main.
   - Les dégradés sont en `objectBoundingBox` : sur une `ellipse`, le halo s'étire tout seul. Pour une lueur allongée (yeux), une ellipse tournée avec `transform="rotate(…)"` et le même dégradé.
   - C'est la recette de la flaque de lumière du décor (`df-flaque`), en plus dense au centre, parce qu'ici c'est une source et pas un reflet au sol (la flaque est à 0.75).
   - **À ne plus faire** : 2 ou 3 cercles de plus en plus grands empilés en `opacity` 0.15–0.35. Le cœur n'est jamais clair, la teinte se mélange au fond et les anneaux se voient (effet « cible »). Sur fond sombre, le halo devient un disque gris terne au lieu de briller (avant/après : `previews/style-halo-avant-apres.png`).
   - Le halo est **le seul endroit sans contour**.

---

## 8. Ombre au sol

Deux ellipses superposées sous les pieds, centrées sous le corps (pas sous l'arme) :

```xml
<ellipse cx="128" cy="291" rx="70" ry="9" fill="#1b1530" opacity="0.25"/>
<ellipse cx="128" cy="291" rx="54" ry="6.5" fill="#1b1530" opacity="0.35"/>
```

Ajuste `cx` et `rx` à l'écartement des pieds de ta classe (robe du mage : rx ≈ 60 et 46).

---

## 9. Structure du fichier (pour l'animation)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">
<!-- en-tête : classe, préfixe -->
<defs> dégradés (xx-steel, xx-gold, xx-iris…) + tous les clipPath (xx-nom-de-piece) </defs>
<g stroke-linejoin="round" stroke-linecap="round">
  <!-- ===== OMBRE AU SOL ===== -->
  <!-- ===== CORPS ===== -->        <g> doublure du corps, puis pièces de l'arrière vers l'avant </g>
  <!-- ===== TÊTE ===== (pivot du cou : x,y) -->   <g transform="rotate(3 x y)"> doublure, pièces, traits du visage </g>
  <!-- ===== ARME ===== -->
  <!-- pivot arme : x,y -->
  <g transform="translate(x y) rotate(a)"> doublure de l'arme, arme dessinée en repère LOCAL (main en 0,0, arme vers le haut -y), poing par-dessus la poignée </g>
</g>
</svg>
```

- **Chaque groupe a sa propre doublure**, ce qui permet de bouger la tête ou l'arme sans laisser de contour derrière.
- **Ordre des pièces dans le corps** : bras lointain, jambe lointaine, jambe proche, pièces sous le vêtement, torse, vêtement, ceinture, épaulière lointaine, col, haut du bras proche, épaulière proche, avant-bras proche, coude, poing.
  - Le haut d'une manche passe **sous** l'épaulière : sinon on voit une « boîte » (bug de la v4).
- **Arme** :
  - dessinée verticale autour de (0,0) = centre du poing. Le commentaire `<!-- pivot arme : x,y -->` donne la translation ;
  - la rotation du guerrier est de 28° ; n'importe quel angle reste propre ;
  - le poing qui la tient **fait partie du groupe arme** ;
  - laisse dépasser la poignée sous le poing et mets le pommeau (ou le talon du bâton) au bout ;
  - vérifie qu'à la rotation choisie l'arme reste dans 0–240 (pointe de l'épée à x ≈ 227).
- Mets un commentaire `<!-- nom de la pièce -->` avant chaque pièce.

### Ids et interdits
- Tous les `id` sont préfixés : `gu-`, `ma-`, `ar-`, `pa-`. Exemple : `ma-robe`, `ma-iris`, `pa-cape`.
- Autorisé : `g, path, circle, ellipse, rect, polygon, polyline, line, defs, linearGradient, radialGradient, stop, clipPath`, plus les attributs fill, stroke, opacity, transform, clip-path (et `stop-color`, `stop-opacity` sur les `stop`). Les commandes de tracé sont libres (C, Q, A, q…).
- **Interdit** : `<style>`, `class`, CSS, `<text>`, `<image>`, `<filter>`, `<use>`, `<foreignObject>`, `<script>`, animations, liens externes. Pas de flou : un halo est **un seul cercle** rempli d'un `radialGradient` à `stop-opacity` (§ 7).

---

## 10. Méthode de travail

1. Esquisse en grosses formes, avec les repères de la § 1, la doublure et les aplats. Rendu `--h=600`.
2. Ajoute les ombres, reflets et ombres portées. Rendu.
3. Zoome sur le visage et le corps pour juger les détails : `python3 tools/zoom.py art/xxx.svg previews/xx-z x0 y0 x1 y1` (coordonnées du viewBox).
4. Vérifie la lecture **en petit** (`--h=90`) et sur un fond clair : silhouette, couleur d'équipe, arme et visage doivent se lire d'un coup d'œil.
5. Mets le tien à côté du guerrier : `node tools/render.cjs previews/cmp.png art/guerrier.svg art/xxx.svg --h=300`. Même échelle de tête, même épaisseur de trait, même lumière ?

Le guerrier est généré par `tools/gu-build.cjs`. Ce petit script écrit pour chaque pièce le clipPath, le groupe d'ombres et le contour. Tu peux le copier pour ta classe (change le préfixe et les formes), ou écrire le SVG directement en suivant la recette de la § 4.

### Pièges déjà rencontrés (ne pas refaire)
- Cils relevés et bouche grande ouverte → personnage mignon ou féminin au lieu de déterminé.
- Nez sur le bord de la joue ou en trait horizontal → ressemble à une oreille ou à une cicatrice.
- Rebord de casque ou de chapeau qui dépasse beaucoup devant → effet casquette.
- Pointes de mèches vers le bas → coulures. Les pointes vont vers l'arrière et remontent.
- Jambes réduites à « genou + botte » → laisse 8 à 10 px de tibia visible.
- Plis faits de bandes de largeur constante → rayures. Il faut des fuseaux qui s'élargissent, en paires sombre + clair.
- Rotules ou ailerons en boules → bosses bizarres. Préfère une genouillère en écusson pointu vers le bas, avec une couture.
- Halo fait de 2 ou 3 cercles empilés en `opacity` → anneaux ternes et grisâtres (orbe du mage et feu du démon, 1re version). Utilise un seul cercle en `radialGradient` à `stop-opacity` (§ 7).
