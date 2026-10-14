#!/bin/sh
# Copies only the public site into dist/ for Cloudflare Pages (keeps research/, tests/ and screenshots off the web).
set -e
rm -rf dist && mkdir -p dist
cp index.html _headers dist/
cp -R assets dist/assets
echo "dist/ ready: $(find dist -type f | wc -l | tr -d ' ') files"
