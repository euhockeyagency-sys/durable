"use strict";

// Brings the site header navigation and the footer of every EN/RU page to one
// template. The header keeps its brand link, mobile language switch and menu
// button as they are; only <nav> inside <header class="header"> is rebuilt,
// keeping the page's own "active" item and its CTA target (e.g. ?type=parent,
// #club-request-form). The footer is replaced as a whole.
//
// Usage: node scripts/normalize-chrome.js [--check]
// --check exits 1 when any page differs from the template (used by tests).

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "public");

const SITE = {
  en: {
    prefix: "{{EN}}",
    nav: [
      ["/services", "Services"],
      ["/for-players", "For players"],
      ["/for-clubs", "For clubs"],
      ["/junior-hockey-for-parents", "For parents"],
      ["/cases", "Cases"],
      ["/agent", "Agent"],
      ["/guides", "Resources"]
    ],
    langSwitch: '<a class="lang-switch" href="{{ALT_URL}}" hreflang="ru" lang="ru" aria-label="RU — Русская версия">RU</a>',
    cta: ["/contact", "Submit profile"],
    tagline: "Personal representation of hockey players across European markets.",
    location: "Gdańsk, Poland",
    footerNavHeading: "Navigation",
    footerNav: [
      ["/services", "Services"],
      ["/for-players", "For players"],
      ["/for-clubs", "For clubs"],
      ["/junior-hockey-for-parents", "For parents"],
      ["/cases", "Cases"],
      ["/agent", "About the agent"],
      ["/guides", "Resources"],
      ["/news", "News"],
      ["/editorial-methodology", "Editorial methodology"]
    ],
    contactHeading: "Contact",
    submit: "Submit profile",
    privacy: "Privacy Policy"
  },
  ru: {
    prefix: "",
    nav: [
      ["/services", "Услуги"],
      ["/players", "Игрокам"],
      ["/for-clubs", "Клубам"],
      ["/yuniorskij-hokkej-roditelyam", "Родителям"],
      ["/cases", "Кейсы"],
      ["/agent", "Агент"],
      ["/guides", "Материалы"]
    ],
    langSwitch: '<a class="lang-switch" href="{{ALT_URL}}" hreflang="en" lang="en" aria-label="EN — English version">EN</a>',
    cta: ["/contact", "Отправить профиль"],
    tagline: "Персональное представительство хоккеистов на европейских рынках.",
    location: "Гданьск, Польша",
    footerNavHeading: "Навигация",
    footerNav: [
      ["/services", "Услуги"],
      ["/players", "Игрокам"],
      ["/for-clubs", "Клубам"],
      ["/yuniorskij-hokkej-roditelyam", "Родителям"],
      ["/cases", "Кейсы"],
      ["/agent", "Об агенте"],
      ["/guides", "Материалы"],
      ["/novosti", "Новости"],
      ["/metodologiya", "Методология"]
    ],
    contactHeading: "Связаться",
    submit: "Отправить профиль",
    privacy: "Политика конфиденциальности"
  }
};

// Brand data mirrors BRAND.md (NAP must match everywhere).
const EMAIL = "euhockeyagency@gmail.com";
const SOCIAL = [
  ["https://www.instagram.com/ehahockeyagency/", "Instagram ↗"],
  ["https://www.tiktok.com/@euhockeyagency", "TikTok ↗"],
  ["https://t.me/eu_hockeyagency", "Telegram ↗"]
];
// The club page deliberately shows no public email: clubs use the brief form
// (test/clubs-brief.test.js). Its footer keeps the location only.
const NO_EMAIL = new Set(["en/for-clubs.html", "ru/for-clubs.html"]);

function buildNav(lang, active, ctaHref) {
  const s = SITE[lang];
  const items = s.nav.map(([href, label]) => {
    const full = s.prefix + href;
    return full === active ? `<a class="active" href="${full}">${label}</a>` : `<a href="${full}">${label}</a>`;
  });
  return `<nav>${items.join("")}${s.langSwitch}<a class="nav-cta" href="${ctaHref}">${s.cta[1]}</a></nav>`;
}

function buildFooter(lang, { email = true } = {}) {
  const s = SITE[lang];
  const p = s.prefix;
  const nav = s.footerNav.map(([href, label]) => `<a href="${p}${href}">${label}</a>`).join("");
  const social = SOCIAL.map(([href, label]) => `<a href="${href}" rel="noopener">${label}</a>`).join("");
  return `<footer id="footer"><div class="footer-brand"><a class="brand" href="${p}/"><span>EHA</span><b>EUROPEAN<br>HOCKEY AGENCY</b></a>` +
    `<p>${s.tagline}</p>` +
    `<address class="footer-address">${email ? `<a href="mailto:${EMAIL}">${EMAIL}</a>` : ""}<span>${s.location}</span>` +
    "<!-- LEGAL_DETAILS: company name and registration number go here once confirmed in BRAND.md --></address></div>" +
    `<div><h2 class="footer-heading">${s.footerNavHeading}</h2><nav class="footer-links">${nav}</nav></div>` +
    `<div><h2 class="footer-heading">${s.contactHeading}</h2><div class="footer-links">${social}<a href="${p}/contact">${s.submit}</a></div></div>` +
    `<small><span>© 2026 European Hockey Agency.</span><span><a href="${p}/privacy">${s.privacy}</a></span></small></footer>`;
}

function normalize(html, lang, file = "") {
  const s = SITE[lang];
  let out = html.replace(/(<header class="header">[\s\S]*?)<nav>([\s\S]*?)<\/nav>([\s\S]*?<\/header>)/, (all, before, nav, after) => {
    const active = (nav.match(/<a class="active" href="([^"]+)"/) || [])[1] || null;
    let cta = (nav.match(/<a class="nav-cta" href="([^"]+)"/) || [])[1] || s.prefix + s.cta[0];
    if (lang === "ru") cta = cta.replace(/^\/ru\//, "/"); // the server adds the /ru prefix itself
    return before + buildNav(lang, active, cta) + after;
  });
  out = out.replace(/<footer id="footer">[\s\S]*?<\/footer>/, buildFooter(lang, { email: !NO_EMAIL.has(file) }));
  return out;
}

function pages(lang) {
  const dir = path.join(ROOT, lang);
  const list = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (e.name.endsWith(".html")) list.push(f);
    }
  })(dir);
  return list.sort();
}

function run({ check = false } = {}) {
  const changed = [];
  for (const lang of Object.keys(SITE)) {
    for (const file of pages(lang)) {
      const html = fs.readFileSync(file, "utf8");
      const next = normalize(html, lang, path.relative(ROOT, file).split(path.sep).join("/"));
      if (next !== html) {
        changed.push(path.relative(ROOT, file));
        if (!check) fs.writeFileSync(file, next);
      }
    }
  }
  return changed;
}

if (require.main === module) {
  const check = process.argv.includes("--check");
  const changed = run({ check });
  if (check && changed.length) {
    console.error(`Header/footer differ from template on ${changed.length} pages:\n${changed.join("\n")}`);
    process.exit(1);
  }
  console.log(`${check ? "checked" : "updated"}: ${changed.length} pages`);
}

module.exports = { normalize, buildNav, buildFooter, run, SITE };
