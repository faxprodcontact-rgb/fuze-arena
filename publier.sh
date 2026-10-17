#!/bin/sh
# Publie le jeu : met un nouveau numéro de version sur tous les fichiers
# (pour que les téléphones rechargent tout d'un coup), puis envoie sur GitHub.
set -e
cd "$(dirname "$0")"
V=$(date +%Y%m%d%H%M%S)
for f in index.html js/*.js; do
  sed -i '' -E "s/\.(js|css)\?v=[0-9]+/.\1?v=$V/g" "$f"
done
git add -A
git commit -q -m "${1:-Mise à jour du jeu}

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -q
echo "Publié (version $V)"
