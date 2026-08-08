// Categorised index of every published guide, rendered into both language
// hubs (/guides and /ru/guides) so all 40 guides carry an inbound link from the
// hub — not just the dozen that were hand-picked before. Slugs come from the
// PAGES table (the same source that gives them hreflang and a sitemap entry),
// and titles are each guide's own H1 shortened to its lead clause.
//
// Injected after prefixInternalLinks runs, so links are emitted already
// locale-prefixed rather than relying on the rewrite pass.

const GUIDES = [
  { en: "hockey-in-austria", ru: "hokkej-v-avstrii", cat: "countries", title: { en: "Hockey in Austria", ru: "Хоккей в Австрии" } },
  { en: "hockey-in-canada", ru: "hokkej-v-kanade", cat: "countries", title: { en: "Hockey in Canada", ru: "Хоккей в Канаде" } },
  { en: "hockey-in-czechia", ru: "hokkej-v-chexii", cat: "countries", title: { en: "Hockey in Czechia", ru: "Хоккей в Чехии" } },
  { en: "hockey-in-denmark", ru: "hokkej-v-danii", cat: "countries", title: { en: "Hockey in Denmark", ru: "Хоккей в Дании" } },
  { en: "hockey-in-estonia", ru: "hokkej-v-estonii", cat: "countries", title: { en: "Hockey in Estonia", ru: "Хоккей в Эстонии" } },
  { en: "hockey-in-finland", ru: "hokkej-v-finlyandii", cat: "countries", title: { en: "Hockey in Finland", ru: "Хоккей в Финляндии" } },
  { en: "hockey-in-france", ru: "hokkej-vo-francii", cat: "countries", title: { en: "Hockey in France", ru: "Хоккей во Франции" } },
  { en: "hockey-in-germany", ru: "hokkej-v-germanii", cat: "countries", title: { en: "Hockey in Germany", ru: "Хоккей в Германии" } },
  { en: "hockey-in-hungary", ru: "hokkej-v-vengrii", cat: "countries", title: { en: "Hockey in Hungary", ru: "Хоккей в Венгрии" } },
  { en: "hockey-in-italy", ru: "hokkej-v-italii", cat: "countries", title: { en: "Hockey in Italy", ru: "Хоккей в Италии" } },
  { en: "hockey-in-japan", ru: "hokkej-v-yaponii", cat: "countries", title: { en: "Hockey in Japan", ru: "Хоккей в Японии" } },
  { en: "hockey-in-kazakhstan", ru: "hokkej-v-kazahstane", cat: "countries", title: { en: "Hockey in Kazakhstan", ru: "Хоккей в Казахстане" } },
  { en: "hockey-in-latvia", ru: "hokkej-v-latvii", cat: "countries", title: { en: "Hockey in Latvia", ru: "Хоккей в Латвии" } },
  { en: "hockey-in-lithuania", ru: "hokkej-v-litve", cat: "countries", title: { en: "Hockey in Lithuania", ru: "Хоккей в Литве" } },
  { en: "hockey-in-netherlands", ru: "hokkej-v-niderlandah", cat: "countries", title: { en: "Hockey in Netherlands", ru: "Хоккей в Нидерландах" } },
  { en: "hockey-in-norway", ru: "hokkej-v-norvegii", cat: "countries", title: { en: "Hockey in Norway", ru: "Хоккей в Норвегии" } },
  { en: "hockey-in-poland", ru: "hokkej-v-polshe", cat: "countries", title: { en: "Hockey in Poland", ru: "Хоккей в Польше" } },
  { en: "hockey-in-romania", ru: "hokkej-v-rumynii", cat: "countries", title: { en: "Hockey in Romania", ru: "Хоккей в Румынии" } },
  { en: "hockey-in-slovakia", ru: "hokkej-v-slovakii", cat: "countries", title: { en: "Hockey in Slovakia", ru: "Хоккей в Словакии" } },
  { en: "hockey-in-slovenia", ru: "hokkej-v-slovenii", cat: "countries", title: { en: "Hockey in Slovenia", ru: "Хоккей в Словении" } },
  { en: "hockey-in-spain", ru: "hokkej-v-ispanii", cat: "countries", title: { en: "Hockey in Spain", ru: "Хоккей в Испании" } },
  { en: "hockey-in-sweden", ru: "hokkej-v-shvecii", cat: "countries", title: { en: "Hockey in Sweden", ru: "Хоккей в Швеции" } },
  { en: "hockey-in-switzerland", ru: "hokkej-v-shvejcarii", cat: "countries", title: { en: "Hockey in Switzerland", ru: "Хоккей в Швейцарии" } },
  { en: "hockey-in-united-kingdom", ru: "hokkej-v-velikobritanii", cat: "countries", title: { en: "Hockey in United Kingdom", ru: "Хоккей в Великобритании" } },
  { en: "hockey-in-usa", ru: "hokkej-v-ssha", cat: "countries", title: { en: "Hockey in United States", ru: "Хоккей в США" } },
  { en: "find-a-hockey-club-in-europe", ru: "kak-najti-hokkejnyj-klub-v-evrope", cat: "process", title: { en: "Find a hockey club in Europe", ru: "Как найти хоккейный клуб в Европе" } },
  { en: "how-to-choose-a-hockey-league", ru: "kak-vybrat-ligu", cat: "process", title: { en: "How to assess a realistic league level", ru: "Как оценить реалистичный уровень лиги" } },
  { en: "hockey-resume-for-european-clubs", ru: "hokkejnoe-rezyume", cat: "process", title: { en: "Hockey resume for a European club", ru: "Хоккейное резюме для европейского клуба" } },
  { en: "hockey-video-for-clubs", ru: "video-dlya-kluba", cat: "process", title: { en: "Highlights or a full game?", ru: "Хайлайты или полная игра?" } },
  { en: "how-a-hockey-agent-works", ru: "kak-rabotaet-hokkejnyj-agent", cat: "process", title: { en: "How a hockey agent works", ru: "Как работает хоккейный агент" } },
  { en: "hockey-agent-in-germany", ru: "hokkejnyj-agent-v-germanii", cat: "process", title: { en: "Hockey agent in Germany", ru: "Хоккейный агент в Германии" } },
  { en: "hockey-agent-in-sweden", ru: "hokkejnyj-agent-v-shvecii", cat: "process", title: { en: "Hockey agent in Sweden", ru: "Хоккейный агент в Швеции" } },
  { en: "how-to-verify-a-hockey-club-offer", ru: "kak-proverit-predlozhenie-hokkejnogo-kluba", cat: "process", title: { en: "How to verify a hockey club offer", ru: "Как проверить предложение хоккейного клуба" } },
  { en: "hockey-market-map-2026", ru: "karta-hokkejnyh-rynkov-2026", cat: "process", title: { en: "Hockey Market Map 2026", ru: "Карта хоккейных рынков 2026" } },
  { en: "iihf-international-transfer", ru: "mezhdunarodnyj-transfer-iihf", cat: "documents", title: { en: "IIHF international transfer", ru: "Международный трансфер IIHF" } },
  { en: "hockey-transfer-windows", ru: "transfernye-okna-v-hokkee", cat: "documents", title: { en: "Hockey transfer windows", ru: "Трансферные окна в хоккее" } },
  { en: "hockey-visas-and-transfers", ru: "dokumenty-i-transfery-v-hokkee", cat: "documents", title: { en: "Hockey visas, passports and international transfers", ru: "Документы, визы и трансферы для хоккеистов" } },
  { en: "work-visa-for-hockey-player", ru: "rabochaya-viza-dlya-hokkeista", cat: "documents", title: { en: "Work visa for a hockey player", ru: "Рабочая виза для хоккеиста" } },
  { en: "documents-for-junior-and-senior-hockey-players", ru: "dokumenty-dlya-yuniora-i-vzroslogo-hokkeista", cat: "documents", title: { en: "Documents for junior and senior hockey players in Europe", ru: "Документы для юниора и взрослого хоккеиста в Европе" } },
  { en: "eu-vs-non-eu-passport-in-hockey", ru: "pasport-es-i-non-eu-v-hokkee", cat: "documents", title: { en: "EU vs non-EU passport in European hockey", ru: "Паспорт ЕС и non-EU в европейском хоккее" } },
  { en: "travelling-for-a-hockey-tryout", ru: "poezdka-na-prosmotr-v-hokkejnyj-klub", cat: "documents", title: { en: "Travelling for a hockey tryout", ru: "Поездка на просмотр в хоккейный клуб" } }
];

const CATEGORIES = [
  { id: "countries", label: { en: "By country", ru: "По странам" } },
  { id: "process", label: { en: "Getting signed", ru: "Как попасть в клуб" } },
  { id: "documents", label: { en: "Documents, visas & transfers", ru: "Документы, визы и трансферы" } }
];

const COPY = {
  en: { kicker: "All guides", heading: "Every guide, by topic" },
  ru: { kicker: "Все материалы", heading: "Все материалы по темам" }
};

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

function guideIndex(locale) {
  const loc = locale === "ru" ? "ru" : "en";
  const prefix = loc === "ru" ? "/ru" : "";
  const t = COPY[loc];
  const groups = CATEGORIES.map((cat) => {
    const items = GUIDES.filter((g) => g.cat === cat.id);
    if (!items.length) return "";
    const links = items
      .map((g) => `<li><a href="${prefix}/guides/${g[loc]}">${escape(g.title[loc])}</a></li>`)
      .join("");
    return `<div class="guide-cat"><h3>${escape(cat.label[loc])}</h3><ul>${links}</ul></div>`;
  }).join("");
  return (
    `<section class="guide-index wrap">` +
    `<span class="section-number">${escape(t.kicker)}</span>` +
    `<h2>${escape(t.heading)}</h2>` +
    `<div class="guide-cats">${groups}</div>` +
    `</section>`
  );
}

// Sideways links between guides. Injected before </main> on each individual
// guide page, so every guide both offers and receives contextual links. The
// picks are the next few guides in the same category, chosen cyclically, so
// inbound links spread evenly and no guide is left with too few (the thin
// country guides in particular). Titled distinctly so it coexists with any
// hand-written "Related guides" block a page may already carry.
const RELATED_COUNT = 5;
const RELATED_COPY = {
  en: { heading: "More guides on this topic", transfer: "Hockey transfer windows" },
  ru: { heading: "Ещё материалы по теме", transfer: "Трансферные окна в хоккее" }
};

function relatedGuides(logicalPath, locale) {
  const loc = locale === "ru" ? "ru" : "en";
  const prefix = loc === "ru" ? "/ru" : "";
  const match = logicalPath.match(/^\/guides\/(.+)$/);
  if (!match) return "";
  const self = GUIDES.find((g) => g.en === match[1] || g.ru === match[1]);
  if (!self) return "";
  const siblings = GUIDES.filter((g) => g.cat === self.cat);
  const index = siblings.indexOf(self);
  const picks = [];
  for (let step = 1; step <= RELATED_COUNT && picks.length < siblings.length - 1; step += 1) {
    picks.push(siblings[(index + step) % siblings.length]);
  }
  if (!picks.length) return "";
  const links = picks
    .map((g) => `<li><a href="${prefix}/guides/${g[loc]}">${escape(g.title[loc])}</a></li>`)
    .join("");
  const transferLink = self.cat === "countries"
    ? `<li><a href="${prefix}/guides/${loc === "ru" ? "transfernye-okna-v-hokkee" : "hockey-transfer-windows"}">${escape(RELATED_COPY[loc].transfer)}</a></li>`
    : "";
  return (
    `<section class="related-guides wrap">` +
    `<h2>${escape(RELATED_COPY[loc].heading)}</h2>` +
    `<ul class="related-list">${links}${transferLink}</ul>` +
    `</section>`
  );
}

module.exports = { guideIndex, relatedGuides, GUIDES };
