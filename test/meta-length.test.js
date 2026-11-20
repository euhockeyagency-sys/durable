"use strict";

// Search snippet limits agreed for the site: EN title <= 60 characters, RU
// title <= 65, meta description 140-160. Utility pages (404, success) and
// descriptions that contain server tokens (rendered length differs) are skipped.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "public");
const decode = (s) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const f = path.join(dir, e.name);
    return e.isDirectory() ? files(f) : e.name.endsWith(".html") ? [f] : [];
  });
}

test("titles and meta descriptions fit search snippet limits", () => {
  const problems = [];
  for (const lang of ["en", "ru"]) {
    for (const file of files(path.join(ROOT, lang))) {
      if (/(404|application-success)\.html$/.test(file)) continue;
      const html = fs.readFileSync(file, "utf8");
      const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
      const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
      const rel = path.relative(ROOT, file);
      if (title.length > (lang === "ru" ? 65 : 60)) problems.push(`${rel}: title ${title.length}`);
      if (!desc.includes("{{") && (desc.length < 140 || desc.length > 160)) problems.push(`${rel}: description ${desc.length}`);
    }
  }
  assert.deepEqual(problems, []);
});
