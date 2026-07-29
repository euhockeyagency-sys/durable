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

async function gitSave(message) {
  try {
    await pexec("git", ["add", "-A", "public"], { cwd: REPO });
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
  const [listener, commit, branch, status] = await Promise.all([
    run("ss", ["-ltnp", "sport", "=", ":3000"]),
    run("git", ["rev-parse", "HEAD"]),
    run("git", ["branch", "--show-current"]),
    run("git", ["status", "--short"])
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
      changes: status.ok && status.stdout ? status.stdout.split("\n") : []
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
    title: "Read page",
    description: "Read the full content of a page. path is relative to public/, for example en/index.html.",
    inputSchema: { path: z.string() },
    annotations: READ_ONLY
  }, async ({ path: requestedPath }) => text(await fs.readFile(safe(requestedPath), "utf8")));

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
    title: "Replace text in a page",
    description: "Replace an exact text fragment. By default it must be unique. Saves, commits, and pushes automatically.",
    inputSchema: {
      path: z.string(),
      find: z.string(),
      replace: z.string(),
      replace_all: z.boolean().optional()
    }
  }, async ({ path: requestedPath, find, replace, replace_all }) => {
    const filePath = safe(requestedPath);
    const before = await fs.readFile(filePath, "utf8");
    const count = before.split(find).length - 1;
    if (count === 0) throw new Error("`find` text not found in the page");
    if (count > 1 && !replace_all) {
      throw new Error(`\`find\` occurs ${count} times; make it unique or set replace_all=true`);
    }
    const after = replace_all ? before.split(find).join(replace) : before.replace(find, replace);
    await fs.writeFile(filePath, after);
    const git = await gitSave(`MCP edit: ${rel(filePath)}`);
    return text(`Replaced ${replace_all ? count : 1} occurrence(s) in ${rel(filePath)}. ${git}`);
  });

  server.registerTool("write_page", {
    title: "Overwrite a page",
    description: "Replace the entire content of a page. Saves, commits, and pushes automatically.",
    inputSchema: { path: z.string(), content: z.string() }
  }, async ({ path: requestedPath, content }) => {
    const filePath = safe(requestedPath);
    await fs.writeFile(filePath, content);
    const git = await gitSave(`MCP write: ${rel(filePath)}`);
    return text(`Wrote ${content.length} bytes to ${rel(filePath)}. ${git}`);
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
