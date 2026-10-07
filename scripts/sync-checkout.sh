#!/usr/bin/env bash
# Brings the production checkout up to origin/main without losing commits made
# on the server. The MCP editor commits in this checkout and pushes only after
# its test gate passes, so main can carry commits GitHub doesn't have yet;
# a plain `git pull --ff-only` then fails every deploy ("Diverging branches").
#
# Server-only commits are replayed on top of origin/main: rebase drops those
# whose changes already landed upstream, the rest stay live and the next MCP
# save pushes them. A conflict aborts the rebase and fails the deploy, leaving
# a backup branch.
set -euo pipefail

main() {
  cd "${REPO_DIR:-/opt/eha}"
  echo "sync: fetching origin/main"
  export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -o BatchMode=yes -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=2}"
  if ! timeout 60 git fetch origin main; then
    echo "sync: git fetch origin/main timed out or failed" >&2
    exit 1
  fi

  if git merge --ff-only origin/main; then
    return 0
  fi

  local backup
  backup="backup/deploy-$(date -u +%Y%m%d-%H%M%S)"
  git branch "$backup"
  echo "sync: main diverged from origin/main; backup branch $backup"

  if ! git rebase --autostash origin/main; then
    git rebase --abort || true
    echo "sync: server commits conflict with origin/main, deploy stopped:" >&2
    git log --oneline origin/main.."$backup" >&2
    exit 1
  fi

  local pending
  pending="$(git rev-list --count origin/main..HEAD)"
  if [ "$pending" -gt 0 ]; then
    echo "sync: $pending server commit(s) not on GitHub yet:"
    git log --oneline origin/main..HEAD
  fi
}

main "$@"
