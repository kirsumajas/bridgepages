#!/usr/bin/env bash
# Build the front-end and sync it to the droplet that serves MEPO behind the
# Cloudflare Tunnel. Configure via env vars (or a local .env — see .env.example):
#
#   DROPLET_HOST   ssh target, e.g. root@203.0.113.4  (required)
#   DROPLET_PATH   web root on the droplet, e.g. /var/www/mepo  (required)
#   VITE_TON_MANIFEST_URL   absolute URL of tonconnect-manifest.json (optional)
#   VITE_BRIDGE_STATUS_URL  bridge status endpoint (optional; defaults to /api/status)
#
# Usage:  DROPLET_HOST=root@1.2.3.4 DROPLET_PATH=/var/www/mepo ./scripts/deploy-droplet.sh
set -euo pipefail

: "${DROPLET_HOST:?set DROPLET_HOST (e.g. root@1.2.3.4)}"
: "${DROPLET_PATH:?set DROPLET_PATH (e.g. /var/www/mepo)}"

echo "→ installing deps"
npm ci

echo "→ building (root base path for droplet serving)"
# VITE_BASE defaults to '/', which is what the droplet needs. VITE_* manifest/
# status URLs are read from the environment if set.
npm run build

echo "→ syncing dist/ to ${DROPLET_HOST}:${DROPLET_PATH}"
rsync -avz --delete dist/ "${DROPLET_HOST}:${DROPLET_PATH}/"

echo "✓ deployed. Reminder: nginx should serve index.html with 'Cache-Control: no-cache'"
echo "  and /assets/* as immutable (Vite content-hashes them)."
