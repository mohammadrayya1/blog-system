#!/usr/bin/env sh
set -e

cd /app

if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ]; then
  echo "▶ Installing frontend dependencies…"
  npm ci --legacy-peer-deps || npm install --legacy-peer-deps
else
  echo "✔ Frontend dependencies present."
fi

exec "$@"
