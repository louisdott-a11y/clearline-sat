#!/bin/sh
# Copies only the public site into dist/ for Cloudflare Pages (keeps docs/, tests/ and notes off the web).
set -e
rm -rf dist && mkdir -p dist
cp index.html _headers dist/
cp -R assets dist/assets
# Tag every assets/*.js script with this commit (assets/app.js?v=1a2b3c4), so a deploy reaches visitors right away
# instead of after the browser's cached copy expires. Cloudflare Pages provides the commit; locally, git does.
v=$(printf %s "${CF_PAGES_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || date +%s)}" | cut -c1-7)
sed "s#src=\"assets/\([A-Za-z0-9_-]*\)\.js\"#src=\"assets/\1.js?v=$v\"#g" index.html > dist/index.html
echo "dist/ ready: $(find dist -type f | wc -l | tr -d ' ') files, scripts tagged v=$v"
