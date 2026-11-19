const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (p) => fs.readFileSync(path.join(__dirname, "..", "public", p), "utf8");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []);

test("salary hub compares leagues; ICEHL and AlpsHL pay has its own guide", () => {
  for (const [hub, deep, link] of [
    ["en/guides/hockey-player-salaries-in-europe.html", "en/guides/icehl-and-alps-hockey-league-salaries.html", "/guides/icehl-and-alps-hockey-league-salaries"],
    ["ru/guides/zarplaty-hokkeistov-v-evrope.html", "ru/guides/zarplaty-icehl-i-alps-hockey-league.html", "/guides/zarplaty-icehl-i-alps-hockey-league"]
  ]) {
    const h = read(hub), d = read(deep);
    const title = /<title>([^<]*)<\/title>/.exec(h)[1];
    assert.ok(!/ICEHL/.test(title), `${hub}: title should not target ICEHL: ${title}`);
    assert.ok(/ICEHL/.test(/<title>([^<]*)<\/title>/.exec(d)[1]), `${deep}: title targets ICEHL`);
    // the hub's ICEHL answer agrees with the deep guide and links to it
    assert.ok(!/ICEHL salary scale is not verified|сетка ICEHL в этом гайде не подтверждена/.test(h), `${hub}: old contradicting answer`);
    assert.ok(h.includes(link), `${hub}: link to ${link}`);
    assert.ok(/35,000 to €150,000|35 000 до €150 000/.test(h) && /35,000 to €150,000|35 000 до €150 000/.test(d));
  }
});

test("every €35k–150k (ICEHL) and €15k–45k (AlpsHL) figure is labelled as an EHA estimate", () => {
  const root = path.join(__dirname, "..", "public");
  const re = /(?:€\s?)?(35[,\s]000\s?(?:–|-|to|до)\s?€?\s?150[,\s]000|15[,\s]000\s?(?:–|-|to|до)\s?€?\s?45[,\s]000)/g;
  for (const file of [...walk(path.join(root, "en")), ...walk(path.join(root, "ru"))]) {
    const text = fs.readFileSync(file, "utf8").replace(/<[^>]+>/g, " ");
    for (const m of text.matchAll(re)) {
      const ctx = text.slice(Math.max(0, m.index - 400), m.index + 200);
      assert.ok(/EHA|оценк|estimate|Approximate range|Приблизительн/i.test(ctx), `${path.relative(root, file)}: unlabelled range ${m[0]}`);
    }
  }
});
