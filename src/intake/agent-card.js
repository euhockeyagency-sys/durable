// Notification card for the AGENT (Telegram / email / WhatsApp). Contains the
// internal category; it is never sent to the player.
const { CATEGORY_LABELS, effectiveCategory, latestRegular } = require("./assessment");

const POS = { forward: "Нападающий", defense: "Защитник", goalie: "Вратарь" };
const MISSING = {
  current_level: "уровень лиги", position: "позиция", ageKnown: "возраст", currentTeam: "текущая команда", stats: "статистика",
  video: "видео", fullGameVideo: "полный матч", measurements: "рост/вес", availability: "дата готовности", goals: "цели", eliteProspects: "ссылка EP",
};

function yearsRu(n) {
  const m10 = n % 10; const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "год";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "года";
  return "лет";
}

function statLine(s) {
  if (!s) return null;
  const tail = s.gaa !== null && s.gaa !== undefined ? `КН ${s.gaa}${s.svp ? `, %ОБ ${s.svp}` : ""}` : `${s.g ?? "?"}+${s.a ?? "?"}=${s.pts ?? "?"}`;
  return `${s.season} ${s.team || ""} (${s.league || "лига не указана"}, ${s.competition === "playoffs" ? "плей-офф" : "рег. сезон"}): ${s.gp ?? "?"} игр, ${tail}`;
}

const CALC_BANDS = { top: "высшие дивизионы", mid: "2–3 дивизионы", low: "низшие дивизионы" };
function calculatorLine(c) {
  const leagues = c.leagues && c.leagues.length ? `; лиги: ${c.leagues.join(", ")}` : "";
  return `${CALC_BANDS[c.band] || c.band}, балл ${c.score}${leagues}`;
}

function agentCard(app, { adminUrl, pdfStatus = "не создан" } = {}) {
  const p = app.profile || {};
  const a = app.assessment || {};
  const cat = effectiveCategory(a, app.assessment_override);
  const age = a.age !== null && a.age !== undefined ? `${a.age} ${yearsRu(a.age)}` : `${app.birth_year} г.р.`;
  const last = latestRegular(p.stats) || (p.stats || [])[0];
  return [
    `Новая заявка ${app.reference_code}${app.previous_application_id ? " (повторная подача)" : ""}`,
    `Игрок: ${app.player_name}, ${age}, ${POS[app.position] || app.position}`,
    `Гражданство (со слов игрока): ${(p.citizenships && p.citizenships.length ? p.citizenships : [app.citizenship]).join(", ")}`,
    `Команда: ${app.current_club}${p.currentLeague ? ` · ${p.currentLeague}` : ""}`,
    last ? `Статистика: ${statLine(last)}` : "Статистика: не указана",
    app.elite_prospects_url ? `EP: ${app.elite_prospects_url}` : "EP: не указан",
    ...(app.video_urls || []).map((u, i) => `Видео ${i + 1}: ${u}`),
    `Внутренняя категория (предварительно, правила ${a.rulesVersion || "—"}): ${CATEGORY_LABELS[cat] || cat}${app.assessment_override ? " — изменено агентом" : ""}`,
    a.reasons && a.reasons.length ? `Причины: ${a.reasons.join("; ")}` : null,
    a.missing && a.missing.length ? `Не хватает: ${a.missing.map((k) => MISSING[k] || k).join(", ")}` : "Не хватает: —",
    app.source?.source_page ? `Источник: ${app.source.source_page}` : null,
    app.source?.calculator ? `Калькулятор (со слов игрока): ${calculatorLine(app.source.calculator)}` : null,
    adminUrl ? `Заявка в панели: ${adminUrl}` : null,
    `PDF: ${pdfStatus}`,
  ].filter(Boolean).join("\n");
}

module.exports = { agentCard, statLine };
