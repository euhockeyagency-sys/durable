const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Google (FAQPage doc, May 2026): FAQ rich results no longer appear, the markup
// stays valid; HowTo rich results were retired in 2023. Markup is kept only
// where it repeats visible content, so this test checks exactly that.
const root = path.join(__dirname, "..", "public");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []);
const norm = (s) => String(s).replace(/<\/?(?:a|strong|em|b|i|span)\b[^>]*>/g, "").replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&nbsp;| /g, " ").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/\{\{[A-Z_]+\}\}/g, "").replace(/\s+/g, " ").trim().toLowerCase();

test("FAQPage and HowTo markup repeats visible content", () => {
  const problems = [];
  let questions = 0;
  for (const file of [...walk(path.join(root, "en")), ...walk(path.join(root, "ru"))]) {
    const html = fs.readFileSync(file, "utf8");
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const body = norm(html.replace(/<head>[\s\S]*?<\/head>/, "").replace(/<script[\s\S]*?<\/script>/g, " "));
    const rel = path.relative(root, file);
    for (const b of blocks.flatMap((x) => [x, ...(x["@graph"] || [])])) {
      if (b["@type"] === "FAQPage") for (const q of b.mainEntity || []) {
        questions++;
        if (!body.includes(norm(q.name))) problems.push(`${rel}: question not visible: ${q.name}`);
        else if (!body.includes(norm(q.acceptedAnswer.text))) problems.push(`${rel}: answer differs: ${q.name}`);
      }
      if (b["@type"] === "HowTo") for (const s of b.step || []) {
        if (!body.includes(norm(s.name)) || !body.includes(norm(s.text))) problems.push(`${rel}: HowTo step not visible: ${s.name}`);
      }
    }
  }
  assert.ok(questions > 1000);
  assert.deepEqual(problems, []);
});
