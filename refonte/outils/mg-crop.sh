#!/bin/sh
# usage: mg-crop.sh fichier.svg sortie.png "x y w h" [hauteur]  → rend une portion du SVG (viewBox recadré)
cd /tmp/claude-0/-home-user-fuze-arena/149ba273-b1bc-5166-a31b-1db0f5a282ef/scratchpad/refonte
t=previews/.crop-$$.svg
sed "s/viewBox=\"0 0 240 240\"/viewBox=\"$3\"/" "$1" > $t
node tools/render.cjs "$2" $t --h=${4:-500} >/dev/null && rm -f $t && echo "$2"
