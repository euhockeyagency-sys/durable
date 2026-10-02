#!/usr/bin/env bash
set -euo pipefail

# Everything runs inside main() so bash has parsed the whole file before the
# checkout update below rewrites it.
main() {
  cd /opt/eha
  bash scripts/sync-checkout.sh
  node scripts/generate-lastmod.js
  npm ci --omit=dev
  systemctl restart eha
  bash scripts/install-mcp.sh

  echo "deployed: $(git rev-parse --short HEAD)"
}

main "$@"
