const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "public");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []);
const MONTH = "(?:January|February|March|April|May|June|July|August|September|October|November|December|январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)";

// Work-log rule: no visible "added / edited on" dates. Fact-check dates
// ("checked 2 November 2026", "verified …"), season labels, source-document
// dates and schema.org dateModified stay.
const FORBIDDEN = [
  new RegExp(`· (?:updated|reviewed|editorial update|обновлено|редакционное обновление) (?:в )?(?:\\d{1,2} )?${MONTH}`, "i"),
  new RegExp(`(?:^|[>.] )(?:Updated|Last updated|Обновлено):? (?:\\d{1,2} )?${MONTH}[^<]{0,12}20\\d\\d`),
  /Дата обновления|Editorial update|Editorial review:|Редакционное обновление|Редакционная проверка:/,
  new RegExp(`(?:,” updated|», обновлено) \\d{1,2} ${MONTH}`, "i"),
  /European Hockey Agency(?: editorial team)?(?:<\/a>)?\. (?:Updated|Обновлено) \d/
];

test("pages show no editorial update dates; fact-check dates remain", () => {
  const bad = [];
  for (const file of [...walk(path.join(root, "en")), ...walk(path.join(root, "ru"))]) {
    const visible = fs.readFileSync(file, "utf8").replace(/<head>[\s\S]*?<\/head>/, "").replace(/<script\b[\s\S]*?<\/script>/g, "");
    for (const re of FORBIDDEN) {
      const m = re.exec(visible);
      if (m) bad.push(`${path.relative(root, file)}: ${m[0]}`);
    }
  }
  assert.deepEqual(bad, []);
  // fact-check dates are kept
  assert.match(fs.readFileSync(path.join(root, "en/leagues/germany-junior-hockey.html"), "utf8"), /LOA instructions checked 2 November 2026\./);
  assert.match(fs.readFileSync(path.join(root, "en/guides/hockey-in-germany.html"), "utf8"), /· season 2026\/27<\/p>/);
});
