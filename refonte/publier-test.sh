#!/bin/sh
# Publie le JEU DE TEST de la refonte : https://faxprodcontact-rgb.github.io/fuze-arena-test/
# C'est une copie de ce dossier (branche refonte-graphique), HORS LIGNE : pas de base de données,
# les amis sont des bots. Le vrai jeu (fuze-arena) et sa base ne sont jamais touchés.
#   ./refonte/publier-test.sh        → publie en ligne (adresse de test)
#   ./refonte/publier-test.sh local  → prépare seulement le dossier .jeu-test (à servir sur le Mac)
set -e
cd "$(dirname "$0")/.."
SRC="$(pwd)"
if [ "$1" = "local" ]; then OUT="$SRC/.jeu-test"; rm -rf "$OUT"; mkdir -p "$OUT"; else OUT="$(mktemp -d)"; fi
V=$(date +%Y%m%d%H%M%S)
rsync -a --exclude .git --exclude refonte --exclude serveur --exclude test --exclude CLAUDE.md --exclude publier.sh --exclude .jeu-test "$SRC/" "$OUT/"
cd "$OUT"
# Hors ligne : pas de base de données (les amis sont des bots)
printf "// Jeu de test : hors ligne, avec des bots\nexport const SUPABASE_URL = '';\nexport const SUPABASE_KEY = '';\n" > js/config.js
# Même site (github.io) que le vrai jeu : on renomme les sauvegardes pour ne jamais toucher à celles du vrai jeu
# (« fuzev2- » depuis Fuze Arena 2.0 : tout le monde repart d'un compte neuf sur le jeu de test)
sed -i '' "s/'fuze-/'fuzev2-/g" js/*.js
# Nom « TEST » (onglet du navigateur et icône sur l'écran d'accueil)
sed -i '' 's#<title>[^<]*</title>#<title>Fuze Arena TEST</title>#' index.html
sed -i '' -E 's/"name": *"[^"]*"/"name": "Fuze Arena TEST"/; s/"short_name": *"[^"]*"/"short_name": "Fuze TEST"/' manifest.webmanifest
# Nouveau numéro de version : les téléphones rechargent le jeu de test tout seuls
for f in index.html js/*.js; do
  sed -i '' -E "s/\.(js|css)\?v=[0-9]+/.\1?v=$V/g" "$f"
done
printf "// Numéro de version du jeu de test\nexport const APP_VERSION = '%s';\n" "$V" > js/version.js
printf '{"v":"%s"}\n' "$V" > version.json
if [ "$1" = "local" ]; then echo "Jeu de test prêt dans $OUT (version $V)"; exit 0; fi
git init -q -b main
git add -A
git commit -q -m "Jeu de test de la refonte ($V)"
git push -q -f https://github.com/faxprodcontact-rgb/fuze-arena-test.git main
rm -rf "$OUT"
echo "Jeu de test publié (version $V) : https://faxprodcontact-rgb.github.io/fuze-arena-test/"
