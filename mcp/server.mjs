// MCP server for editing and verifying the EHA website.
// Remote Streamable HTTP transport, protected by a secret path segment.
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const pexec = promisify(execFile);
const REPO = process.env.REPO_DIR || "/opt/eha";
const PUBLIC = path.join(REPO, "public");
const SECRET = process.env.MCP_SECRET;
const PORT = Number(process.env.MCP_PORT || 3100);
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://eurohockeyagency.com";
const SITE_SERVICE = process.env.SITE_SERVICE || "eha";

if (!SECRET || SECRET.length < 16) {
  console.error("MCP_SECRET missing/too short");
  process.exit(1);
}

const MCP_PATH = `/mcp/${SECRET}`;
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

function safe(relPath) {
  const clean = String(relPath || "").replace(/^\/+/, "");
  const resolved = path.resolve(PUBLIC, clean);
  if (resolved !== PUBLIC && !resolved.startsWith(PUBLIC + path.sep)) {
    throw new Error("path is outside the site content folder");
  }
  if (!/\.(html|css)$/i.test(resolved)) {
    throw new Error("only .html and .css files are editable");
  }
  return resolved;
}

function rel(filePath) {
  return path.relative(PUBLIC, filePath);
}

// ---------------------------------------------------------------------------
// Repo-wide editing. `safe()` above stays as the content-only gate for the
// original page tools; `safeRepo()` widens access to the source files the
// content workflow genuinely needs (src/locales.js must be edited to register
// a new bilingual page, or the parity test fails and blocks every deploy).
// Secrets and infrastructure stay unreachable: the deny list wins over the
// allow list, and everything is still confined to the repository.
const EDITABLE = [
  { dir: "public", extensions: /\.(html|css|js|txt|xml|json|webmanifest)$/i },
  { dir: "src", extensions: /\.js$/i },
  { dir: "scripts", extensions: /\.js$/i },
  { dir: "test", extensions: /\.js$/i }
];
// Never readable or writable through the connector, whatever the path looks
// like: credentials, git internals, dependencies and the deploy machinery.
const DENIED = /(^|\/)(\.env|\.env\.|\.secret|\.git\/|node_modules\/|deploy\.sh|backup\.sh|monitor\.sh)/i;

function relRepo(filePath) {
  return path.relative(REPO, filePath);
}

function safeRepo(relPath) {
  const clean = String(relPath || "").replace(/^\/+/, "");
  const resolved = path.resolve(REPO, clean);
  if (!resolved.startsWith(REPO + path.sep)) {
    throw new Error("path is outside the project folder");
  }
  const relative = relRepo(resolved).split(path.sep).join("/");
  if (DENIED.test("/" + relative)) {
    throw new Error(`"${relative}" holds credentials or deploy machinery and cannot be opened through the connector`);
  }
  const rule = EDITABLE.find((entry) => relative === entry.dir || relative.startsWith(entry.dir + "/"));
  if (!rule) {
    throw new Error(`only these folders are editable: ${EDITABLE.map((entry) => entry.dir + "/").join(", ")} (got "${relative}")`);
  }
  if (!rule.extensions.test(resolved)) {
    throw new Error(`"${relative}" has an extension that is not editable in ${rule.dir}/`);
  }
  return resolved;
}

// The page tools historically took paths relative to public/ and only accepted
// .html/.css. Models keep calling them for project files ("src/locales.js"),
// so resolve either meaning instead of rejecting: try the legacy public/ path
// and the repo-relative one, and prefer whichever actually exists. This keeps
// old calls working while making the page tools accept project files too.
async function resolveEditable(relPath) {
  const clean = String(relPath || "").replace(/^\/+/, "");
  const candidates = [];
  const inPublic = path.resolve(PUBLIC, clean);
  if ((inPublic === PUBLIC || inPublic.startsWith(PUBLIC + path.sep)) && /\.(html|css)$/i.test(inPublic)) {
    candidates.push(inPublic);
  }
  let repoPath = null;
  try { repoPath = safeRepo(clean); } catch { /* not an allowed project path */ }
  if (repoPath) candidates.push(repoPath);
  // Nothing matched either rule: re-run safeRepo so the caller gets its
  // descriptive error instead of the old "only .html and .css" message.
  if (!candidates.length) return safeRepo(clean);
  for (const candidate of candidates) {
    try { await fs.access(candidate); return candidate; } catch { /* try the next reading */ }
  }
  // The file does not exist yet (a new page): a path that names a project
  // folder is repo-relative, anything else keeps the legacy public/ meaning.
  return repoPath && /^(public|src|scripts|test)\//.test(clean) ? repoPath : candidates[0];
}

async function listRepoFiles() {
  const output = [];
  for (const entry of EDITABLE) {
    const base = path.join(REPO, entry.dir);
    async function walk(dir) {
      let entries = [];
      try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
      for (const item of entries) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          if (!["node_modules", ".git"].includes(item.name)) await walk(full);
        } else if (entry.extensions.test(item.name)) {
          const relative = relRepo(full).split(path.sep).join("/");
          if (!DENIED.test("/" + relative)) output.push(relative);
        }
      }
    }
    await walk(base);
  }
  return output.sort();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function listFiles() {
  const output = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!["assets", "node_modules"].includes(entry.name)) await walk(full);
      } else if (/\.(html|css)$/i.test(entry.name)) {
        output.push(rel(full));
      }
    }
  }
  await walk(PUBLIC);
  return output.sort();
}

async function run(command, args, options = {}) {
  try {
    const { stdout, stderr } = await pexec(command, args, {
      cwd: REPO,
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
      ...options
    });
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout || "").trim(),
      stderr: String(error.stderr || error.message || error).trim()
    };
  }
}

// `paths` are staged explicitly (never `git add -A`) so untracked server-side
// infrastructure scripts sitting in the repo folder are never committed.
async function gitSave(message, paths = ["public"]) {
  try {
    await pexec("git", ["add", "--", ...paths], { cwd: REPO });
    const { stdout: status } = await pexec("git", ["status", "--porcelain"], { cwd: REPO });
    if (!status.trim()) return "no changes";
    await pexec("git", ["commit", "-m", message], { cwd: REPO });
    try {
      await pexec("git", ["fetch", "origin", "main"], { cwd: REPO });
      await pexec("git", ["rebase", "--autostash", "origin/main"], { cwd: REPO });
    } catch (error) {
      try {
        await pexec("git", ["rebase", "--abort"], { cwd: REPO });
      } catch {
        // No active rebase.
      }
      return "saved on server; auto-sync with GitHub failed: "
        + String(error.stderr || error.message).slice(0, 160);
    }
    try {
      await pexec("git", ["push", "origin", "HEAD:main"], { cwd: REPO });
      return "saved and pushed to GitHub";
    } catch (error) {
      return "saved on server; GitHub push failed: "
        + String(error.stderr || error.message).slice(0, 160);
    }
  } catch (error) {
    return "git error: " + String(error.stderr || error.message).slice(0, 160);
  }
}

function validateRequestPath(value) {
  const requestPath = String(value || "/");
  if (!requestPath.startsWith("/") || requestPath.startsWith("//")) {
    throw new Error("path must start with one slash");
  }
  return requestPath;
}

async function fetchSnapshot(url, headers = {}) {
  const response = await fetch(url, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(10_000)
  });
  const body = Buffer.from(await response.arrayBuffer());
  return {
    url,
    status: response.status,
    location: response.headers.get("location"),
    source: response.headers.get("x-eha-source"),
    sourceSha256: response.headers.get("x-eha-source-sha256"),
    bodySha256: sha256(body),
    bytes: body.length,
    oldMarkers: {
      fortyPlayersPlaced: body.includes(Buffer.from("40+ Players Placed")),
      everyHockeyCareer: body.includes(Buffer.from("Every hockey career")),
      getRecruited: body.includes(Buffer.from("Get Recruited by European Hockey Clubs"))
    }
  };
}

async function runtimeStatus() {
  const service = await run("systemctl", [
    "show",
    SITE_SERVICE,
    "--property=ActiveState,SubState,MainPID,ExecMainStartTimestamp,FragmentPath"
  ]);
  const pidResult = await run("systemctl", ["show", SITE_SERVICE, "--property=MainPID", "--value"]);
  const pid = /^\d+$/.test(pidResult.stdout) ? pidResult.stdout : null;
  let cwd = null;
  let command = null;
  if (pid && pid !== "0") {
    const [cwdResult, commandResult] = await Promise.all([
      run("readlink", ["-f", `/proc/${pid}/cwd`]),
      fs.readFile(`/proc/${pid}/cmdline`).then((value) => ({
        ok: true,
        stdout: value.toString().replace(/\0/g, " ").trim(),
        stderr: ""
      })).catch((error) => ({ ok: false, stdout: "", stderr: error.message }))
    ]);
    cwd = cwdResult.ok ? cwdResult.stdout : null;
    command = commandResult.ok ? commandResult.stdout : null;
  }
  const [listener, commit, branch, status, untracked] = await Promise.all([
    run("ss", ["-ltnp", "sport", "=", ":3000"]),
    run("git", ["rev-parse", "HEAD"]),
    run("git", ["branch", "--show-current"]),
    run("git", ["status", "--short", "--untracked-files=no"]),
    run("git", ["ls-files", "--others", "--exclude-standard"])
  ]);
  return {
    service: service.ok ? service.stdout.split("\n") : { error: service.stderr },
    pid,
    cwd,
    command,
    listener: listener.ok ? listener.stdout.split("\n").filter(Boolean) : { error: listener.stderr },
    git: {
      commit: commit.ok ? commit.stdout : null,
      branch: branch.ok ? branch.stdout : null,
      clean: status.ok ? status.stdout === "" : null,
      changes: status.ok && status.stdout ? status.stdout.split("\n") : [],
      untracked: untracked.ok && untracked.stdout ? untracked.stdout.split("\n") : []
    },
    repository: REPO,
    publicDirectory: PUBLIC
  };
}

async function verifySite(requestPath) {
  const cleanPath = validateRequestPath(requestPath);
  const localUrl = new URL(cleanPath, "http://127.0.0.1:3000");
  const publicUrl = new URL(cleanPath, SITE_ORIGIN);
  const [local, production] = await Promise.all([
    fetchSnapshot(localUrl, { host: publicUrl.host }),
    fetchSnapshot(publicUrl)
  ]);

  let sourceFile = null;
  if (production.source) {
    try {
      const physicalPath = safe(production.source);
      const body = await fs.readFile(physicalPath);
      sourceFile = {
        relativePath: production.source,
        absolutePath: physicalPath,
        realPath: await fs.realpath(physicalPath),
        sha256: sha256(body),
        bytes: body.length
      };
    } catch (error) {
      sourceFile = { error: error.message };
    }
  }

  const expectedSha = sourceFile?.sha256 || null;
  return {
    ok: local.status === production.status
      && local.bodySha256 === production.bodySha256
      && (!expectedSha || production.sourceSha256 === expectedSha),
    path: cleanPath,
    local,
    production,
    sourceFile,
    comparisons: {
      localMatchesProduction: local.bodySha256 === production.bodySha256,
      productionHeaderMatchesFile: Boolean(
        expectedSha && production.sourceSha256 === expectedSha
      )
    },
    checkedAt: new Date().toISOString()
  };
}

function text(value) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

function makeServer() {
  const server = new McpServer({ name: "eha-content", version: "1.1.0" });

  server.registerTool("list_pages", {
    title: "List pages",
    description: "List all editable website files (HTML pages and styles.css).",
    inputSchema: {},
    annotations: READ_ONLY
  }, async () => text((await listFiles()).join("\n")));

  server.registerTool("read_page", {
    title: "Read a page or project file",
    description: "Read the full content of a file. Website pages are relative to public/ ('en/index.html'); project files use their repo path ('src/locales.js', 'public/assets/leagues.src.js', 'scripts/generate-images.js').",
    inputSchema: { path: z.string() },
    annotations: READ_ONLY
  }, async ({ path: requestedPath }) => text(await fs.readFile(await resolveEditable(requestedPath), "utf8")));

  server.registerTool("search_pages", {
    title: "Search pages",
    description: "Search all pages for a text substring. Returns matching files with line numbers and snippets.",
    inputSchema: { query: z.string() },
    annotations: READ_ONLY
  }, async ({ query }) => {
    const files = await listFiles();
    const hits = [];
    for (const file of files) {
      const lines = (await fs.readFile(path.join(PUBLIC, file), "utf8")).split("\n");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          hits.push(`${file}:${index + 1}: ${line.trim().slice(0, 200)}`);
        }
      });
    }
    return text(hits.length ? hits.slice(0, 200).join("\n") : "no matches");
  });

  server.registerTool("runtime_status", {
    title: "Inspect website runtime",
    description: "Show the actual systemd service, Node PID, process cwd and command, port 3000 listener, repository SHA, and working-tree status.",
    inputSchema: {},
    annotations: READ_ONLY
  }, async () => text(await runtimeStatus()));

  server.registerTool("verify_site", {
    title: "Verify website source",
    description: "Compare localhost:3000, production, and the physical HTML file by status and SHA-256. Also reports known old-page text markers.",
    inputSchema: {
      path: z.string().optional().describe("URL path to verify, for example /, /agent, or /ru/")
    },
    annotations: READ_ONLY
  }, async ({ path: requestPath }) => text(await verifySite(requestPath || "/")));

  server.registerTool("replace_in_page", {
    title: "Replace text in a page or project file",
    description: "Replace an exact text fragment in a website page or a project file ('src/locales.js', 'public/assets/leagues.src.js', 'scripts/generate-images.js'). By default it must be unique. Saves, commits, and pushes automatically.",
    inputSchema: {
      path: z.string(),
      find: z.string(),
      replace: z.string(),
      replace_all: z.boolean().optional()
    }
  }, async ({ path: requestedPath, find, replace, replace_all }) => {
    const filePath = await resolveEditable(requestedPath);
    const before = await fs.readFile(filePath, "utf8");
    const count = before.split(find).length - 1;
    if (count === 0) throw new Error("`find` text not found in the page");
    if (count > 1 && !replace_all) {
      throw new Error(`\`find\` occurs ${count} times; make it unique or set replace_all=true`);
    }
    const after = replace_all ? before.split(find).join(replace) : before.replace(find, replace);
    await fs.writeFile(filePath, after);
    const target = relRepo(filePath);
    const git = await gitSave(`MCP edit: ${target}`, [target]);
    return text(`Replaced ${replace_all ? count : 1} occurrence(s) in ${target}. ${git}`);
  });

  server.registerTool("write_page", {
    title: "Overwrite a page or project file",
    description: "Replace the entire content of a file. Accepts website pages ('en/index.html') and project files ('src/locales.js', 'public/assets/leagues.src.js', 'scripts/generate-images.js'). Saves, commits, and pushes automatically.",
    inputSchema: { path: z.string(), content: z.string() }
  }, async ({ path: requestedPath, content }) => {
    const filePath = await resolveEditable(requestedPath);
    // Create missing parent folders so a page in a brand-new section (e.g.
    // public/en/leagues/) can be written instead of failing with ENOENT.
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    const target = relRepo(filePath);
    const git = await gitSave(`MCP write: ${target}`, [target]);
    return text(`Wrote ${content.length} bytes to ${target}. ${git}`);
  });

  // --- Project files (beyond public/): src, scripts, test -------------------

  server.registerTool("list_project_files", {
    title: "List project files",
    description: "List every editable project file, including src/, scripts/ and test/ — not just website pages.",
    inputSchema: {},
    annotations: READ_ONLY
  }, async () => text((await listRepoFiles()).join("\n")));

  server.registerTool("read_project_file", {
    title: "Read a project file",
    description: "Read any editable project file by repo-relative path, e.g. 'src/locales.js' or 'public/en/index.html'.",
    inputSchema: { path: z.string() },
    annotations: READ_ONLY
  }, async ({ path: requestedPath }) => {
    const filePath = safeRepo(requestedPath);
    return text(await fs.readFile(filePath, "utf8"));
  });

  server.registerTool("write_project_file", {
    title: "Overwrite a project file",
    description: "Replace the entire content of an editable project file (src/, scripts/, test/, public/). Saves, commits and pushes. Run run_tests afterwards — a failing test blocks deployment.",
    inputSchema: { path: z.string(), content: z.string() }
  }, async ({ path: requestedPath, content }) => {
    const filePath = safeRepo(requestedPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    const target = relRepo(filePath);
    const git = await gitSave(`MCP write: ${target}`, [target]);
    return text(`Wrote ${content.length} bytes to ${target}. ${git}`);
  });

  server.registerTool("replace_in_project_file", {
    title: "Replace text in a project file",
    description: "Replace an exact text fragment in any editable project file. 'find' must be unique unless replace_all is set. Saves, commits and pushes.",
    inputSchema: {
      path: z.string(),
      find: z.string(),
      replace: z.string(),
      replace_all: z.boolean().optional()
    }
  }, async ({ path: requestedPath, find, replace, replace_all }) => {
    const filePath = safeRepo(requestedPath);
    const before = await fs.readFile(filePath, "utf8");
    const count = before.split(find).length - 1;
    if (count === 0) throw new Error("`find` text not found in the file");
    if (count > 1 && !replace_all) {
      throw new Error(`\`find\` occurs ${count} times; make it unique or set replace_all=true`);
    }
    const after = replace_all ? before.split(find).join(replace) : before.replace(find, replace);
    await fs.writeFile(filePath, after);
    const target = relRepo(filePath);
    const git = await gitSave(`MCP edit: ${target}`, [target]);
    return text(`Replaced ${replace_all ? count : 1} occurrence(s) in ${target}. ${git}`);
  });

  // Registering a bilingual pair by hand is the single easiest way to break the
  // build, so it gets a purpose-built tool instead of free-text JS editing.
  server.registerTool("register_page", {
    title: "Register a bilingual page pair",
    description: "Add a { ru, en } pair to the PAGES table in src/locales.js so a new page gets hreflang, the language switcher and the sitemap. Both HTML files must already exist. Paths are public URLs without the /ru prefix, e.g. ru='/leagues/finland-mestis', en='/leagues/finland-mestis'.",
    inputSchema: { ru: z.string(), en: z.string() }
  }, async ({ ru, en }) => {
    for (const [label, value] of [["ru", ru], ["en", en]]) {
      if (!value.startsWith("/")) throw new Error(`${label} path must start with "/" (got "${value}")`);
      if (value.startsWith("/ru/") || value.startsWith("/en/")) {
        throw new Error(`${label} path must not include a language prefix (got "${value}")`);
      }
    }
    // The parity test asserts both files exist, so refuse early with a clear
    // message rather than letting the deploy go red.
    const missing = [];
    for (const [locale, value] of [["ru", ru], ["en", en]]) {
      const file = path.join(PUBLIC, locale, (value === "/" ? "/index" : value) + ".html");
      try { await fs.access(file); } catch { missing.push(relRepo(file)); }
    }
    if (missing.length) {
      throw new Error(`create the page file(s) first, then register the pair: missing ${missing.join(", ")}`);
    }

    const localesPath = path.join(REPO, "src", "locales.js");
    const source = await fs.readFile(localesPath, "utf8");
    const start = source.indexOf("const PAGES = [");
    const end = source.indexOf("\n];", start);
    if (start === -1 || end === -1) throw new Error("could not locate the PAGES table in src/locales.js");
    const block = source.slice(start, end);
    if (block.includes(`"${ru}"`) || block.includes(`"${en}"`)) {
      return text(`Already registered: ru="${ru}", en="${en}". Nothing to do.`);
    }
    const entry = `,\n  { ru: ${JSON.stringify(ru)}, en: ${JSON.stringify(en)} }`;
    const updated = source.slice(0, end) + entry + source.slice(end);
    await fs.writeFile(localesPath, updated);
    const git = await gitSave(`MCP register page: ${en}`, ["src/locales.js"]);
    return text(`Registered ru="${ru}", en="${en}" in src/locales.js. ${git}\nRun run_tests to confirm the build stays green.`);
  });

  server.registerTool("run_tests", {
    title: "Run the test suite",
    description: "Run `npm test`. Always run this after editing src/, scripts/ or test/, or after register_page: a failing test blocks the automatic deployment.",
    inputSchema: {},
    annotations: READ_ONLY
  }, async () => {
    const result = await run("npm", ["test"], { timeout: 180_000 });
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    const summary = output.split("\n")
      .filter((line) => /^(# (tests|pass|fail|suites)|not ok )/.test(line.trim()))
      .join("\n");
    // The server installs production dependencies only (deploy.sh runs
    // `npm ci --omit=dev`), so the HTTP-level suite cannot load here. Say so
    // plainly instead of reporting a scary false failure: the routing checks
    // that need it are run by CI on every push.
    const missingDevDeps = /Cannot find module 'supertest'/.test(output);
    if (missingDevDeps) {
      const otherFailures = output.split("\n").filter((line) => /^not ok /.test(line.trim()) && !/app\.test\.js/.test(line));
      const verdict = otherFailures.length ? "FAILURES FOUND (besides the skipped suite)" : "OK — no failures in the suites that can run here";
      return text(
        `${verdict}\n${summary}\n\n`
        + "Note: test/app.test.js could not run on the server because dev dependencies are not installed there "
        + "(production install). The locales/config suites above DID run — they cover the PAGES table, routing rules "
        + "and hreflang. The full HTTP suite runs automatically in GitHub Actions on push, and a red run blocks deployment."
      );
    }
    return text(`${result.ok ? "TESTS PASSED" : "TESTS FAILED"}\n${summary || output.slice(-2000)}`);
  });

  return server;
}

const app = express();
app.use(express.json({ limit: "8mb" }));

app.post(MCP_PATH, async (req, res) => {
  try {
    const server = makeServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: String(error?.message || error) },
        id: null
      });
    }
  }
});

app.get(MCP_PATH, (_req, res) => res.status(405).json({
  jsonrpc: "2.0",
  error: { code: -32000, message: "Method not allowed" },
  id: null
}));
app.delete(MCP_PATH, (_req, res) => res.status(405).end());
app.get("/mcp-health", (_req, res) => res.json({ ok: true, version: "1.1.0" }));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`EHA MCP listening on 127.0.0.1:${PORT} at ${MCP_PATH}`);
});
