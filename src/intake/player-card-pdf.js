// PDF player card in EHA style (navy with gold accents) from the player's
// CONFIRMED application data. Never includes the internal tier, reasons,
// private notes, documents, phone/email of the player or other unnecessary
// personal data. Citizenship is labelled as stated by the player, never as a
// confirmed passport. Player self-description and the agent's conclusion are
// labelled separately. A4, one page when it fits, a second page otherwise.
const path = require("node:path");
const PDFDocument = require("pdfkit");

const FONT_DIR = path.join(__dirname, "..", "..", "assets", "pdf-fonts");
const C = { navy: "#071a33", navy2: "#0d2547", gold: "#c9a227", text: "#14243a", muted: "#5b6b7f", line: "#d8dee6", blue: "#1687ff", white: "#ffffff" };
const L = {
  en: {
    title: "PLAYER CARD", born: "Date of birth", age: "Age", years: "years", position: "Position", hand: "Shoots", catches: "Catches", height: "Height", weight: "Weight",
    citizenship: "Citizenship (as stated by the player)", team: "Current team", stats: "Statistics (last available seasons)", season: "Season", teamCol: "Team", league: "League", comp: "Type",
    regular: "Reg.", playoffs: "PO", noStats: "No statistics provided.", video: "Video and profiles", timecodes: "Timecodes (from the player)", self: "Player's own description",
    agent: "Agent's assessment", contacts: "European Hockey Agency", generated: "Generated", ageOn: "on", pos: { forward: "Forward", defense: "Defence", goalie: "Goaltender" },
    left: "Left", right: "Right", source: "Data confirmed by the player in the EHA application", ep: "Elite Prospects", highlights: "Video", fullGame: "Full game", na: "—",
  },
  ru: {
    title: "КАРТОЧКА ИГРОКА", born: "Дата рождения", age: "Возраст", years: "лет", position: "Позиция", hand: "Хват", catches: "Ловушка", height: "Рост", weight: "Вес",
    citizenship: "Гражданство (со слов игрока)", team: "Текущая команда", stats: "Статистика (последние доступные сезоны)", season: "Сезон", teamCol: "Команда", league: "Лига", comp: "Тип",
    regular: "Рег.", playoffs: "ПО", noStats: "Статистика не указана.", video: "Видео и профили", timecodes: "Таймкоды (от игрока)", self: "Самоописание игрока",
    agent: "Заключение агента", contacts: "European Hockey Agency", generated: "Сформировано", ageOn: "на", pos: { forward: "Нападающий", defense: "Защитник", goalie: "Вратарь" },
    left: "Левый", right: "Правый", source: "Данные подтверждены игроком в заявке EHA", ep: "Elite Prospects", highlights: "Видео", fullGame: "Полный матч", na: "—",
  },
};

function fmtDate(iso, locale) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

function ageAt(birthDate, birthYear, date) {
  if (birthDate) {
    const [y, m, d] = birthDate.split("-").map(Number);
    let a = date.getUTCFullYear() - y;
    if (date.getUTCMonth() + 1 < m || (date.getUTCMonth() + 1 === m && date.getUTCDate() < d)) a -= 1;
    return a;
  }
  return birthYear ? date.getUTCFullYear() - birthYear : null;
}

function fileName(app, generatedAt) {
  const slug = String(app.player_name || "player").normalize("NFC")
    .replace(/[^A-Za-z0-9Ѐ-ӿ]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "player";
  return `EHA-player-card-${slug}-${generatedAt.toISOString().slice(0, 10)}.pdf`;
}

function drawLogo(doc, x, y) {
  doc.save();
  doc.polygon([x + 6, y], [x + 44, y], [x + 38, y + 26], [x, y + 26]).fill(C.blue);
  doc.fillColor(C.white).font("Oswald").fontSize(15).text("EHA", x + 6, y + 3, { width: 34, align: "center", lineBreak: false });
  doc.restore();
}

function buildPlayerCardPdf(app, { generatedAt = new Date(), photo = null, agentName = "Viachaslau Marshchonak", compress = true } = {}) {
  const locale = app.source && app.source.locale === "en" ? "en" : "ru";
  const t = L[locale];
  const p = app.profile || {};
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ compress, size: "A4", margins: { top: 40, left: 40, right: 40, bottom: 16 }, info: { Title: `${t.title} — ${app.player_name}`, Author: "European Hockey Agency", CreationDate: generatedAt }, autoFirstPage: true });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.registerFont("Body", path.join(FONT_DIR, "Manrope-400.ttf"));
    doc.registerFont("Bold", path.join(FONT_DIR, "Manrope-700.ttf"));
    doc.registerFont("Oswald", path.join(FONT_DIR, "Oswald-600.ttf"));
    const W = doc.page.width; const M = 40; const CW = W - 2 * M;
    const bottom = () => doc.page.height - 70;
    const ensure = (h) => { if (doc.y + h > bottom()) { footer(); doc.addPage(); header(true); } };

    function header(compact = false) {
      const nameWidth = photo ? CW - 110 : CW;
      const nameSize = app.player_name.length > 28 ? 20 : 26;
      const line2 = [t.pos[app.position] || app.position, app.current_club].filter(Boolean).join(" · ");
      let h = 54;
      if (!compact) {
        const nameH = doc.font("Oswald").fontSize(nameSize).heightOfString(app.player_name.toUpperCase(), { width: nameWidth, lineGap: -2 });
        const subH = doc.font("Body").fontSize(10).heightOfString(line2, { width: nameWidth });
        h = Math.max(128, 60 + nameH + 4 + subH + 16);
      }
      doc.rect(0, 0, W, h).fill(C.navy);
      doc.rect(0, h, W, 3).fill(C.gold);
      drawLogo(doc, M, 16);
      doc.fillColor(C.gold).font("Oswald").fontSize(10).text(t.title, M + 56, 22, { characterSpacing: 2, lineBreak: false });
      doc.fillColor("#9fb3cc").font("Body").fontSize(8).text("eurohockeyagency.com", M + 56, 36, { lineBreak: false });
      doc.link(M + 56, 36, doc.widthOfString("eurohockeyagency.com"), 10, "https://eurohockeyagency.com");
      if (!compact) {
        doc.fillColor(C.white).font("Oswald").fontSize(nameSize).text(app.player_name.toUpperCase(), M, 60, { width: nameWidth, lineGap: -2 });
        doc.fillColor("#c3d0dc").font("Body").fontSize(10).text(line2, M, doc.y + 4, { width: nameWidth });
      }
      doc.y = h + 18;
    }
    function footer() {
      const y = doc.page.height - 52;
      doc.moveTo(M, y - 6).lineTo(W - M, y - 6).lineWidth(0.5).strokeColor(C.line).stroke();
      doc.font("Body").fontSize(7.5);
      const parts = [
        [`${t.contacts} · `, null], ["eurohockeyagency.com", "https://eurohockeyagency.com"], [" · euhockeyagency@gmail.com · ", null],
        ["WhatsApp", "https://wa.me/375297957818"], [` · ${t.generated}: ${fmtDate(generatedAt.toISOString(), locale)}`, null],
      ];
      let x = M;
      for (const [str, link] of parts) {
        const w = doc.widthOfString(str);
        doc.fillColor(link ? C.blue : C.muted).text(str, x, y, { lineBreak: false });
        if (link) doc.link(x, y, w, 9, link);
        x += w;
      }
      doc.fillColor(C.muted).fontSize(6.5).text(t.source, M, y + 12, { width: CW });
    }
    function sectionTitle(label) {
      ensure(40);
      doc.moveDown(0.6);
      doc.fillColor(C.navy).font("Oswald").fontSize(11).text(label.toUpperCase(), M, doc.y, { characterSpacing: 1 });
      doc.rect(M, doc.y + 2, 28, 2).fill(C.gold);
      doc.y += 9;
    }

    header();
    if (photo) {
      try { doc.save(); doc.rect(W - M - 96, 20, 96, 96).clip(); doc.image(photo, W - M - 96, 20, { cover: [96, 96], align: "center", valign: "center" }); doc.restore(); doc.rect(W - M - 96, 20, 96, 96).lineWidth(2).strokeColor(C.gold).stroke(); } catch { doc.restore(); }
    }

    // Facts grid (two columns)
    const age = ageAt(app.birth_date, app.birth_year, generatedAt);
    const facts = [
      [t.born, app.birth_date ? fmtDate(app.birth_date, locale) : String(app.birth_year || t.na)],
      [t.age, age !== null ? `${age} ${t.years} (${t.ageOn} ${fmtDate(generatedAt.toISOString(), locale)})` : t.na],
      [t.position, t.pos[app.position] || t.na],
      [app.position === "goalie" ? t.catches : t.hand, app.stick_hand ? t[app.stick_hand] : t.na],
      [t.height, app.height_cm ? `${Number(app.height_cm)} cm` : t.na],
      [t.weight, app.weight_kg ? `${Number(app.weight_kg)} kg` : t.na],
      [t.citizenship, (p.citizenships && p.citizenships.length ? p.citizenships : [app.citizenship]).filter(Boolean).join(", ") || t.na],
      [t.team, [app.current_club, p.currentLeague].filter(Boolean).join(" · ") || t.na],
    ];
    const colW = CW / 2 - 8;
    for (let i = 0; i < facts.length; i += 2) {
      ensure(34);
      const y = doc.y;
      let maxY = y;
      [facts[i], facts[i + 1]].forEach((f, j) => {
        if (!f) return;
        const x = M + j * (colW + 16);
        doc.fillColor(C.muted).font("Body").fontSize(7.5).text(f[0].toUpperCase(), x, y, { width: colW, characterSpacing: 0.5 });
        doc.fillColor(C.text).font("Bold").fontSize(10.5).text(f[1], x, doc.y + 1, { width: colW });
        maxY = Math.max(maxY, doc.y);
      });
      doc.y = maxY + 7;
    }

    // Stats
    sectionTitle(t.stats);
    const stats = (p.stats || []).slice(0, 6);
    if (!stats.length) {
      doc.fillColor(C.muted).font("Body").fontSize(9.5).text(t.noStats, M, doc.y);
    } else {
      const goalie = app.position === "goalie";
      const cols = goalie
        ? [[t.season, 52], [t.teamCol, 150], [t.league, 120], [t.comp, 40], ["GP", 40], ["GAA", 50], ["SV%", 63]]
        : [[t.season, 52], [t.teamCol, 150], [t.league, 120], [t.comp, 40], ["GP", 33], ["G", 33], ["A", 33], ["PTS", 54]];
      const rowH = (cells) => Math.max(...cells.map((c, i) => doc.font("Body").fontSize(8.5).heightOfString(String(c), { width: cols[i][1] - 6 }))) + 8;
      const drawRow = (cells, head) => {
        const h = head ? 18 : rowH(cells);
        ensure(h);
        const y = doc.y;
        if (head) doc.rect(M, y, CW, h).fill(C.navy2);
        let x = M;
        cells.forEach((c, i) => {
          doc.fillColor(head ? C.white : C.text).font(head ? "Bold" : "Body").fontSize(8.5).text(String(c), x + 3, y + 4, { width: cols[i][1] - 6 });
          x += cols[i][1];
        });
        doc.y = y + h;
        if (!head) doc.moveTo(M, doc.y).lineTo(M + CW, doc.y).lineWidth(0.4).strokeColor(C.line).stroke();
      };
      drawRow(cols.map((c) => c[0]), true);
      for (const s of stats) {
        const base = [s.season, s.team || t.na, s.league || t.na, s.competition === "playoffs" ? t.playoffs : t.regular, s.gp ?? t.na];
        drawRow(goalie ? [...base, s.gaa ?? t.na, s.svp !== null && s.svp !== undefined ? s.svp.toFixed(3).replace(/^0/, "") : t.na] : [...base, s.g ?? t.na, s.a ?? t.na, s.pts ?? t.na], false);
      }
    }

    // Links
    const links = [];
    if (app.elite_prospects_url) links.push([t.ep, app.elite_prospects_url]);
    (app.video_urls || []).forEach((u, i) => links.push([p.videoType === "full_game" && i === 0 ? t.fullGame : `${t.highlights} ${i + 1}`, u]));
    if (links.length || p.timecodes) {
      sectionTitle(t.video);
      for (const [label, url] of links) {
        ensure(16);
        const y = doc.y;
        doc.fillColor(C.muted).font("Bold").fontSize(9).text(`${label}:`, M, y, { width: 90, lineBreak: false });
        doc.fillColor(C.blue).font("Body").fontSize(9).text(url, M + 92, y, { width: CW - 92, link: url, underline: true });
        doc.y += 3;
      }
      if (p.timecodes) {
        ensure(30);
        doc.moveDown(0.3).fillColor(C.muted).font("Bold").fontSize(8).text(t.timecodes.toUpperCase(), M, doc.y);
        doc.fillColor(C.text).font("Body").fontSize(9).text(p.timecodes, M, doc.y + 1, { width: CW });
      }
    }

    // Strengths: separated by origin; nothing invented.
    if (p.strengthsSelf) {
      sectionTitle(t.self);
      doc.fillColor(C.text).font("Body").fontSize(9.5).text(p.strengthsSelf, M, doc.y, { width: CW });
    }
    if (app.agent_strengths) {
      sectionTitle(`${t.agent} — ${agentName}`);
      doc.fillColor(C.text).font("Body").fontSize(9.5).text(app.agent_strengths, M, doc.y, { width: CW });
    }
    footer();
    doc.end();
  });
}

module.exports = { buildPlayerCardPdf, fileName };
