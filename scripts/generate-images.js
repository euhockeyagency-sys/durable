#!/usr/bin/env node
// Generates branded article covers and league-pyramid diagrams.
// Run manually after adding an article:  node scripts/generate-images.js
const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

const OUT = path.join(__dirname, "..", "public", "assets", "covers");
const INK = "#030b14";
const BLUE = "#1687ff";
const BLUE_SOFT = "#7fc0ff";
const MUTED = "#9db0c3";

const ARTICLES = [
  { slug: "kak-najti-hokkejnyj-klub-v-evrope", category: "Карьера", title: "Как найти хоккейный клуб в Европе" },
  { slug: "hokkejnoe-rezyume", category: "Подготовка", title: "Хоккейное резюме для европейского клуба" },
  { slug: "video-dlya-kluba", category: "Видео", title: "Какое видео нужно европейскому клубу" },
  { slug: "kak-vybrat-ligu", category: "Выбор лиги", title: "Как оценить реалистичный уровень лиги" },
  { slug: "kak-rabotaet-hokkejnyj-agent", category: "Карьера", title: "Как работает хоккейный агент" },
  { slug: "hokkej-v-finlyandii", category: "Страны · Финляндия", title: "Хоккей в Финляндии: лиги и как попасть" },
  { slug: "hokkej-v-shvecii", category: "Страны · Швеция", title: "Хоккей в Швеции: лиги и как попасть" },
  { slug: "hokkej-v-chexii", category: "Страны · Чехия", title: "Хоккей в Чехии: лиги и как попасть" },
  { slug: "hokkej-v-germanii", category: "Страны · Германия", title: "Хоккей в Германии: лиги и как попасть" },
  { slug: "hokkej-v-polshe", category: "Страны · Польша", title: "Хоккей в Польше: лиги и как попасть" },
  { slug: "ligi-evropy", category: "Справочник", title: "Хоккейные лиги Европы: уровни и легионеры" },
  { slug: "kalkulyator-urovnya", category: "Инструмент", title: "Калькулятор уровня: какая лига реальна" }
];

// Division pyramids: listed top (strongest) to bottom (entry level).
const PYRAMIDS = [
  { slug: "hokkej-v-finlyandii", country: "Финляндия", levels: [
    { name: "Liiga", note: "Высший дивизион, элитный уровень" },
    { name: "Mestis", note: "Второй дивизион, профессиональный", entry: true },
    { name: "Suomi-sarja", note: "Третий уровень, адаптация к рынку" }
  ] },
  { slug: "hokkej-v-shvecii", country: "Швеция", levels: [
    { name: "SHL", note: "Высший дивизион, один из сильнейших в мире" },
    { name: "HockeyAllsvenskan", note: "Второй дивизион, полностью профессиональный" },
    { name: "HockeyEttan", note: "Третий уровень, полупрофессиональный", entry: true }
  ] },
  { slug: "hokkej-v-chexii", country: "Чехия", levels: [
    { name: "Extraliga", note: "Высший дивизион, высокий уровень" },
    { name: "Chance liga", note: "Второй дивизион, профессиональный", entry: true },
    { name: "2. liga", note: "Третий уровень, полупрофессиональный" }
  ] },
  { slug: "hokkej-v-germanii", country: "Германия", levels: [
    { name: "DEL", note: "Высший дивизион, сильный бюджетный чемпионат" },
    { name: "DEL2", note: "Второй дивизион, профессиональный", entry: true },
    { name: "Oberliga", note: "Третий уровень, широкий рынок" }
  ] },
  { slug: "hokkej-v-polshe", country: "Польша", levels: [
    { name: "PHL", note: "Высший дивизион, открыт для легионеров", entry: true },
    { name: "1 liga", note: "Второй дивизион, вход и адаптация" }
  ] }
];

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Naive wrap by estimated glyph width — good enough for headline-sized text.
function wrap(text, maxChars) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > maxChars && line) { lines.push(line.trim()); line = word; }
    else line += " " + word;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function logo(x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="0" y="0" width="74" height="74" fill="${BLUE}" transform="skewX(-8)"/>
    <text x="37" y="52" font-family="Arial Black, Arial, sans-serif" font-size="34" font-weight="900" fill="#fff" text-anchor="middle">EHA</text>
    <text x="96" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="3" fill="#cfe4ff">EUROPEAN</text>
    <text x="96" y="54" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="3" fill="#cfe4ff">HOCKEY AGENCY</text>
  </g>`;
}

function coverSvg({ category, title }) {
  const lines = wrap(title, 26).slice(0, 3);
  const size = lines.length >= 3 ? 58 : 68;
  const startY = 310; // fixed first baseline keeps clear of the category label
  const rows = lines.map((l, i) =>
    `<text x="80" y="${startY + i * (size + 12)}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="900" fill="#ffffff">${esc(l)}</text>`
  ).join("");
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INK}"/><stop offset="0.6" stop-color="#071a2c"/><stop offset="1" stop-color="#0b2740"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0" stop-color="${BLUE}" stop-opacity="0.35"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="10" height="630" fill="${BLUE}"/>
  ${logo(80, 70)}
  <text x="80" y="222" font-family="Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="4" fill="${BLUE_SOFT}">${esc(category.toUpperCase())}</text>
  ${rows}
  <text x="80" y="560" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${BLUE}">eurohockeyagency.ru</text>
</svg>`;
}

function pyramidSvg({ country, levels }) {
  const W = 1000, H = 240 + levels.length * 130;
  const maxW = 760, minW = 420;
  const step = levels.length > 1 ? (maxW - minW) / (levels.length - 1) : 0;
  const blocks = levels.map((lvl, i) => {
    const w = minW + step * i;
    const x = (W - w) / 2;
    const y = 170 + i * 130;
    const stroke = lvl.entry ? BLUE : "rgba(255,255,255,.18)";
    const fill = lvl.entry ? "rgba(22,135,255,.16)" : "rgba(255,255,255,.05)";
    const badge = lvl.entry
      ? `<text x="${W / 2}" y="${y + 96}" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="${BLUE}" text-anchor="middle">РЕАЛЬНАЯ ТОЧКА ВХОДА</text>`
      : "";
    return `<rect x="${x}" y="${y}" width="${w}" height="${lvl.entry ? 108 : 92}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${lvl.entry ? 3 : 1.5}"/>
      <text x="${W / 2}" y="${y + 40}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${esc(lvl.name)}</text>
      <text x="${W / 2}" y="${y + 70}" font-family="Arial, sans-serif" font-size="19" fill="${MUTED}" text-anchor="middle">${esc(lvl.note)}</text>${badge}`;
  }).join("");
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${BLUE}"/>
  <text x="${W / 2}" y="72" font-family="Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="4" fill="${BLUE_SOFT}" text-anchor="middle">ПИРАМИДА ЛИГ</text>
  <text x="${W / 2}" y="126" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="900" fill="#ffffff" text-anchor="middle">${esc(country)}</text>
  ${blocks}
  <text x="${W / 2}" y="${H - 28}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="${BLUE}" text-anchor="middle">eurohockeyagency.ru</text>
</svg>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let count = 0;
  for (const article of ARTICLES) {
    const svg = Buffer.from(coverSvg(article));
    await sharp(svg).webp({ quality: 86 }).toFile(path.join(OUT, `${article.slug}.webp`));
    await sharp(svg).jpeg({ quality: 84 }).toFile(path.join(OUT, `${article.slug}.jpg`));
    count += 2;
    console.log(`обложка: ${article.slug}`);
  }
  for (const pyramid of PYRAMIDS) {
    const svg = Buffer.from(pyramidSvg(pyramid));
    await sharp(svg).webp({ quality: 88 }).toFile(path.join(OUT, `${pyramid.slug}-pyramid.webp`));
    count += 1;
    console.log(`схема:    ${pyramid.slug}`);
  }
  console.log(`\nготово: ${count} файлов в public/assets/covers/`);
})();
