#!/usr/bin/env bash
# Publica o site no GitHub Pages (https://jm-mark.github.io/kalenza-digital/):
# gera o build para a subpasta e envia a pasta pronta para o branch gh-pages.
#   bash _ferramentas/publicar_pages.sh
# Depois, gera de novo o build na raiz, para a prévia local (serve_dist.js) continuar funcionando.
set -euo pipefail
# DESATIVADO em 28/09/2026: o site está em https://kalenzadigital.com (npm run deploy). O branch gh-pages agora só
# redireciona para o domínio oficial (noindex); publicar a prévia de novo criaria uma cópia duplicada no Google.
if [ "${FORCAR_PREVIA:-}" != "1" ]; then echo "Prévia do GitHub Pages desativada. Use: npm run deploy"; exit 1; fi
cd "$(dirname "$0")/.."
BUN="${BUN:-$HOME/.bun/bin/bun.exe}"; [ -x "$BUN" ] || BUN=bun
REMOTE=$(git remote get-url origin)
TMP=$(mktemp -d)

MSYS_NO_PATHCONV=1 SITE_URL=https://jm-mark.github.io BASE_PATH=/kalenza-digital PUBLIC_FORM=off "$BUN" run build
cp -r dist/. "$TMP/"
touch "$TMP/.nojekyll"   # o Pages não deve ignorar a pasta _astro
rm -f "$TMP/_redirects"  # regra da Netlify; no Pages a raiz usa o redirecionamento em JS

cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
  commit -q -m "Publicação $(date '+%Y-%m-%d %H:%M')"
git push -q -f "$REMOTE" gh-pages
cd - >/dev/null
rm -rf "$TMP"

"$BUN" run build >/dev/null   # volta o build da prévia local para a raiz
echo "Publicado: https://jm-mark.github.io/kalenza-digital/"
