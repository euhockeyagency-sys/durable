const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "public");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []);
const pages = [...walk(path.join(root, "en")), ...walk(path.join(root, "ru"))];

function contrast(a, b) {
  const lum = (hex) => {
    const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

test("footer headings do not skip levels (h2, not h4)", () => {
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    const i = html.indexOf("<footer");
    if (i < 0) continue;
    assert.ok(!html.slice(i).includes("<h4"), path.relative(root, file));
  }
});

test("language switch: the accessible name contains the visible text", () => {
  for (const file of pages) {
    for (const m of fs.readFileSync(file, "utf8").matchAll(/<a class="mobile-lang-switch"[^>]*aria-label="([^"]*)"[^>]*>([^<]*)<\/a>/g)) {
      assert.ok(m[1].startsWith(m[2]), `${path.relative(root, file)}: "${m[1]}" vs "${m[2]}"`);
    }
  }
  const site = fs.readFileSync(path.join(root, "site.js"), "utf8");
  assert.ok(site.includes("wa.setAttribute('aria-label',`WA — ${T.waAria}`);wa.textContent='WA';"));
});

test("white text on filled buttons and the WhatsApp button reaches 4.5:1", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const m = /\.primary,\.cookie-actions \[data-cookie="accept"\]\{--accent:(#[0-9a-f]{6});--accent-hover:(#[0-9a-f]{6})\}/i.exec(css);
  assert.ok(m, "button colour override present");
  assert.ok(contrast("#ffffff", m[1]) >= 4.5 && contrast("#ffffff", m[2]) >= 4.5);
  const wa = [...css.matchAll(/\.whatsapp-float\{background:(#[0-9a-f]{6})\}/gi)].pop();
  assert.ok(wa && contrast("#ffffff", wa[1]) >= 4.5);
});
