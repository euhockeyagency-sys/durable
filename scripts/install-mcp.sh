#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/eha}"
MCP_DIR="${MCP_DIR:-/opt/eha-mcp}"

test -f "$MCP_DIR/.env"
install -d -m 0755 "$MCP_DIR"
install -m 0644 "$REPO_DIR/mcp/server.mjs" "$MCP_DIR/server.mjs"
install -m 0644 "$REPO_DIR/mcp/package.json" "$MCP_DIR/package.json"
install -m 0644 "$REPO_DIR/mcp/package-lock.json" "$MCP_DIR/package-lock.json"

npm --prefix "$MCP_DIR" ci --omit=dev
node --check "$MCP_DIR/server.mjs"
systemctl restart eha-mcp
systemctl is-active --quiet eha-mcp
curl -fsS http://127.0.0.1:3100/mcp-health
