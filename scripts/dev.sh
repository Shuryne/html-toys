#!/bin/sh
# Local preview: mirror the Cloudflare Pages layout (prompts/ served under public/prompts).
cd "$(dirname "$0")/.." || exit 1
[ -e public/prompts ] || ln -s ../prompts public/prompts
exec python3 -m http.server "${PORT:-8787}" -d public
