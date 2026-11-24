#!/usr/bin/env node
"use strict";

// Adds an early "next step" strip (level calculator, WhatsApp with a prefilled
// question, form) to high-traffic guides whose first call to action sits near
// the end of the page. Inserted before the first <h2> that starts at least 15%
// into <main>, so readers who leave after the first table still see it.
// Idempotent: pages that already contain class "early-cta" are skipped.
//   node scripts/add-early-cta.js          rewrite files
//   node scripts/add-early-cta.js --check  list pages that would change, exit 1 if any

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "public");
const WA = "https://wa.me/375297957818?text=";
const MIN_POSITION = 0.15;

// [locale, file name pattern, category]
const TARGETS = [
  ["en", /^hockey-in-[a-z-]+\.html$/, "country"],
  ["ru", /^hokkej-v[oa]?-[a-z-]+\.html$/, "country"],
  ["en", /^hockey-agent-in-[a-z-]+\.html$/, "country"],
  ["ru", /^hokkejnyj-agent-v[oa]?-[a-z-]+\.html$/, "country"],
  ["en", /^hockey-player-salaries-in-europe\.html$/, "salary"],
  ["ru", /^zarplaty-hokkeistov-v-evrope\.html$/, "salary"],
  ["en", /^hockey-academies-in-(north-america|europe-cost-and-admission)\.html$/, "academy"],
  ["ru", /^hokkejnye-akademii-(severnoj-ameriki|evropy-stoimost-i-postuplenie)\.html$/, "academy"],
  ["en", /^(find-a-hockey-club-in-europe|best-european-hockey-leagues-for-imports|european-hockey-import-rules-2026-27)\.html$/, "route"],
  ["ru", /^(kak-najti-hokkejnyj-klub-v-evrope|luchshie-ligi-evropy-dlya-legionerov|limity-legionerov-v-ligah-evropy-2026-27)\.html$/, "route"]
];

const COPY = {
  en: {
    calc: "Check your level",
    wa: "Ask on WhatsApp",
    form: "Send your profile →",
    note: "Free first review, reply within 48 hours.",
    country: { title: "Is this market realistic for your profile?", text: "The level calculator gives a first estimate in two minutes. For a personal answer, ask the agent or send your profile.", intent: "country_assessment" },
    salary: { title: "What level and pay can you realistically aim for?", text: "Salaries depend on the league you can actually reach. Check your level, or ask the agent about your situation.", intent: "salary_context" },
    academy: { title: "Choosing an academy or junior route?", text: "Before paying tuition, check the player's realistic level and ask which route fits the family's goals.", intent: "academy_choice", parent: true },
    route: { title: "Not sure which league fits your profile?", text: "Check your level first, then ask the agent which countries and clubs are realistic for you.", intent: "europe_route" },
    msg: (title) => `Hello! I'm reading your guide "${title}". I'd like to know what level I can aim for.`,
    parentMsg: (title) => `Hello! I'm the parent of a player born ____. I'm reading your guide "${title}" and would like to discuss the options.`
  },
  ru: {
    calc: "Проверить уровень",
    wa: "Спросить в WhatsApp",
    form: "Отправить профиль →",
    note: "Первичная оценка бесплатна, ответ в течение 48 часов.",
    country: { title: "Подходит ли этот рынок вашему профилю?", text: "Калькулятор уровня даст первую оценку за две минуты. За личным ответом напишите агенту или отправьте профиль.", intent: "country_assessment" },
    salary: { title: "На какой уровень и зарплату вы можете рассчитывать?", text: "Зарплата зависит от лиги, в которую вы реально можете попасть. Проверьте уровень или спросите агента о своей ситуации.", intent: "salary_context" },
    academy: { title: "Выбираете академию или юниорский маршрут?", text: "До оплаты обучения проверьте реальный уровень игрока и спросите, какой маршрут подходит целям семьи.", intent: "academy_choice", parent: true },
    route: { title: "Не уверены, какая лига подходит вашему профилю?", text: "Сначала проверьте уровень, затем спросите агента, какие страны и клубы для вас реалистичны.", intent: "europe_route" },
    msg: (title) => `Здравствуйте! Читаю ваш гид «${title}». Хочу узнать, на какой уровень могу рассчитывать.`,
    parentMsg: (title) => `Здравствуйте! Я родитель игрока ____ года рождения. Читаю ваш гид «${title}» и хочу обсудить варианты.`
  }
};

const encodeText = (text) => encodeURIComponent(text).replace(/'/g, "%27");
const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const decodeEntities = (text) => text.replace(/&amp;/g, "&").replace(/&#39;|&#x27;|&rsquo;|’/g, "'").replace(/&quot;/g, "\"").replace(/&nbsp;/g, " ");

function buildStrip(locale, category, slug, html) {
  const t = COPY[locale];
  const c = t[category];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = h1 ? decodeEntities(h1[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 90) : "";
  const country = category === "country" ? (html.match(/contact\?[^"]*country=([A-Z]{2})/) || [])[1] : null;
  const sourcePage = locale === "en" ? `/guides/${slug}` : `/ru/guides/${slug}`;
  const params = [c.parent ? "type=parent" : "", `intent=${c.intent}`, country ? `country=${country}` : "", `source_page=${sourcePage}`].filter(Boolean).join("&amp;");
  const prefix = locale === "en" ? "{{EN}}" : "";
  const calc = locale === "en" ? "{{EN}}/level-calculator" : "/kalkulyator-urovnya";
  const message = c.parent ? t.parentMsg(title) : t.msg(title);
  return `<aside class="next-step-cta early-cta" aria-label="${escapeHtml(c.title)}"><p><strong>${c.title}</strong></p><p>${c.text}</p><div class="actions"><a class="btn primary" href="${calc}">${t.calc}</a><a class="btn ghost" href="${WA}${encodeText(message)}" target="_blank" rel="noopener">${t.wa}</a><a class="text-link" href="${prefix}/contact?${params}">${t.form}</a></div><p class="legal-note">${t.note}</p></aside>\n`;
}

function insertionPoint(html) {
  const mainStart = html.indexOf("<main");
  const mainEnd = html.indexOf("</main>");
  if (mainStart < 0 || mainEnd < 0) return -1;
  const length = mainEnd - mainStart;
  const re = /<h2[\s>]/g;
  re.lastIndex = mainStart;
  let match;
  while ((match = re.exec(html)) && match.index < mainEnd) {
    if ((match.index - mainStart) / length < MIN_POSITION) continue;
    // Insert before the enclosing <section …> when the heading opens it.
    const before = html.slice(Math.max(mainStart, match.index - 300), match.index);
    const open = before.match(/<section\b[^>]*>\s*$/);
    return open ? match.index - open[0].length : match.index;
  }
  return -1;
}

function run(check) {
  const changed = [];
  for (const locale of ["en", "ru"]) {
    const dir = path.join(ROOT, locale, "guides");
    for (const name of fs.readdirSync(dir).sort()) {
      const target = TARGETS.find(([loc, re]) => loc === locale && re.test(name));
      if (!target) continue;
      const file = path.join(dir, name);
      const html = fs.readFileSync(file, "utf8");
      if (html.includes("early-cta")) continue;
      const at = insertionPoint(html);
      if (at < 0) continue;
      const slug = name.replace(/\.html$/, "");
      const next = html.slice(0, at) + buildStrip(locale, target[2], slug, html) + html.slice(at);
      changed.push(path.relative(ROOT, file));
      if (!check) fs.writeFileSync(file, next);
    }
  }
  return changed;
}

if (require.main === module) {
  const check = process.argv.includes("--check");
  const changed = run(check);
  console.log(`${check ? "would change" : "changed"}: ${changed.length} pages`);
  if (check && changed.length) { changed.forEach((f) => console.log(`  ${f}`)); process.exit(1); }
}

module.exports = { run, buildStrip, insertionPoint, TARGETS };
