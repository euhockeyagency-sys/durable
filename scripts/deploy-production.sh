#!/usr/bin/env bash
set -euo pipefail

cd /opt/eha
git pull --ff-only origin main
node scripts/generate-lastmod.js
npm ci --omit=dev
systemctl restart eha
bash scripts/install-mcp.sh

echo "deployed: $(git rev-parse --short HEAD)"
