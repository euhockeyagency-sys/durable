# EHA1990 MCP

This server powers the EHA1990 connector. It edits files under `public/` and
can verify that the running website serves the same files.

## Tools

- `list_pages`, `read_page`, `search_pages`: read-only content inspection.
- `runtime_status`: reports the real `eha` systemd process, PID, cwd, port 3000
  listener, Git commit, and working-tree state.
- `verify_site`: compares localhost, production, and the physical source file
  using SHA-256 and checks known stale-page markers.
- `replace_in_page`, `write_page`: update content, commit it, and push to
  `origin/main`.

The MCP secret remains only in `/opt/eha-mcp/.env` on the server.

## Deployment

`scripts/install-mcp.sh` copies this version into `/opt/eha-mcp`, installs
production dependencies, validates the JavaScript, and restarts only
`eha-mcp.service`.
