const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const SCRIPT = path.join(__dirname, "..", "scripts", "sync-checkout.sh");
const IDENTITY = {
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.com"
};

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, env: { ...process.env, ...IDENTITY }, encoding: "utf8" }).trim();
}

function commit(cwd, file, content, message) {
  fs.writeFileSync(path.join(cwd, file), content);
  git(cwd, "add", file);
  git(cwd, "commit", "-q", "-m", message);
}

// origin (bare) <- developer clone pushes; server clone deploys from origin.
function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "eha-sync-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const origin = path.join(root, "origin.git");
  const developer = path.join(root, "developer");
  const server = path.join(root, "server");
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, developer);
  git(developer, "checkout", "-q", "-b", "main");
  commit(developer, "index.html", "home\n", "initial");
  git(developer, "push", "-q", "origin", "main");
  git(root, "clone", "-q", origin, server);
  return { developer, server };
}

function sync(server) {
  return spawnSync("bash", [SCRIPT], {
    env: { ...process.env, ...IDENTITY, REPO_DIR: server },
    encoding: "utf8"
  });
}

test("fast-forwards a clean server checkout", (t) => {
  const { developer, server } = setup(t);
  commit(developer, "page.html", "new\n", "add page");
  git(developer, "push", "-q", "origin", "main");

  const result = sync(server);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(server, "rev-parse", "HEAD"), git(developer, "rev-parse", "HEAD"));
});

test("drops server commits whose changes already reached GitHub", (t) => {
  const { developer, server } = setup(t);
  // The MCP gate kept this commit on the server; the same edit then landed from a laptop.
  commit(server, "page.html", "same edit\n", "MCP write: page.html");
  commit(developer, "page.html", "same edit\n", "Add page");
  commit(developer, "other.html", "more\n", "Another change");
  git(developer, "push", "-q", "origin", "main");

  const result = sync(server);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(server, "rev-parse", "HEAD"), git(developer, "rev-parse", "HEAD"));
});

test("keeps unpushed server edits on top of origin/main", (t) => {
  const { developer, server } = setup(t);
  commit(server, "server.html", "mcp\n", "MCP write: server.html");
  commit(developer, "page.html", "new\n", "add page");
  git(developer, "push", "-q", "origin", "main");

  const result = sync(server);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(server, "rev-parse", "HEAD~1"), git(developer, "rev-parse", "HEAD"));
  assert.equal(fs.readFileSync(path.join(server, "server.html"), "utf8"), "mcp\n");
  assert.match(result.stdout, /1 server commit\(s\) not on GitHub yet/);
});

test("stops on conflicting edits and keeps a backup branch", (t) => {
  const { developer, server } = setup(t);
  commit(server, "index.html", "server version\n", "MCP edit: index.html");
  const serverHead = git(server, "rev-parse", "HEAD");
  commit(developer, "index.html", "github version\n", "edit index");
  git(developer, "push", "-q", "origin", "main");

  const result = sync(server);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /deploy stopped/);
  assert.equal(git(server, "rev-parse", "HEAD"), serverHead);
  assert.match(git(server, "branch", "--list", "backup/deploy-*"), /backup\/deploy-/);
});
