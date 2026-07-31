#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const result = {};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) {
      const relative = path.relative(ROOT, full).split(path.sep).join("/");
      const date = execFileSync("git", ["log", "-1", "--format=%cI", "--", relative], { cwd: ROOT, encoding: "utf8" }).trim();
      if (date) result[relative] = date.slice(0, 10);
    }
  }
}

for (const locale of ["en", "ru"]) walk(path.join(PUBLIC, locale));
const output = path.join(PUBLIC, "assets", "lastmod.json");
fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(`generated ${Object.keys(result).length} lastmod entries`);
