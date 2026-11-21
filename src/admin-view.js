"use strict";

// Presentation helpers for /admin (owner's work queue). Pure functions: no I/O,
// so they are unit-testable and the route code in app.js stays small.
// Nothing here is shown to visitors; the admin page is noindex/no-store.

const esc = (value) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const ADMIN_LANGS = new Set(["en", "ru"]);
const ADMIN_VIEWS = ["all", "new", "today", "active", "closed", "clubs"];
const ADMIN_PERIODS = ["7", "30", "90", "all"];

// Interface strings. English stays the default (and keeps the wording the
// existing tests and the retention runbook refer to).
const STRINGS = {
  en: {
    title: "Applications", clubs: "Club requests", logout: "Log out", lang: "Русский",
    views: { all: "All", new: "New (oldest first)", today: "Contact today", active: "In progress", closed: "Closed", clubs: "Clubs" },
    unprocessed: "unprocessed (new)", oldest: "oldest unprocessed", stale: (d) => `new &gt; ${d} days`,
    held: "past retention, held until processed", clubNew: "club requests new", clubOldest: "oldest club request",
    retention: (n) => `<strong>Retention:</strong> ${n} unprocessed record(s) are past the 12-month retention date. They are not deleted automatically while "new": open each one, then set contacted/qualified to keep it, or rejected/archived to let the next cleanup delete it with its files.`,
    loaded: "loaded leads", parentLeads: "parent leads", qualified: "qualified", qualifiedRate: "qualified rate", parentRate: "parent qualified rate", rejected: "rejected",
    search: "Search", searchPh: "name, club, ref, contact, note, source", status: "Status", position: "Position", age: "Age", followup: "Follow-up", applicant: "Applicant", any: "any", filter: "Filter", reset: "Reset", of: "of",
    cols: { ref: "Ref", player: "Player", club: "Club", contact: "Contact", source: "Source", calc: "Calculator (self-reported)", followup: "Follow-up", created: "Created / age", status: "Status", missing: "Missing" },
    clubCols: { ref: "Ref", club: "Club", contactName: "Contact", contact: "Contact info", need: "Request", created: "Created / age", status: "Status" },
    save: "Save", nextContact: "Next contact", due: "due", waiting: "waiting", minor: "minor",
    wa: "WhatsApp", mail: "Email", copy: "Copy", copied: "Copied", ask: "Ask for missing details", askWa: "via WhatsApp", askMail: "via email",
    parentContact: "Parent contact", noMissing: "complete",
    missing: { citizenship: "citizenship", club: "club", video: "video", ep: "Elite Prospects" },
    analytics: "Where applications come from", period: "Period", days: (d) => d === "all" ? "all loaded" : `${d} days`,
    aCols: { key: "Value", leads: "Leads", qualified: "Qualified", rate: "Rate" },
    groups: { source_page: "Page with the CTA", intent: "Intent", target: "Country / league", calculator: "From the level calculator", utm: "Campaign (utm_source)" },
    yes: "yes", no: "no", none: "(none)",
    analyticsNote: "Counts over the loaded records (latest 200). Qualified = status qualified.",
    empty: "Nothing here."
  },
  ru: {
    title: "Заявки игроков", clubs: "Запросы клубов", logout: "Выйти", lang: "English",
    views: { all: "Все", new: "Новые (старые первыми)", today: "Связаться сегодня", active: "В работе", closed: "Закрытые", clubs: "Клубы" },
    unprocessed: "не обработано (new)", oldest: "самая старая необработанная", stale: (d) => `new старше ${d} дн.`,
    held: "срок хранения прошёл, удерживаются до обработки", clubNew: "новых запросов клубов", clubOldest: "самый старый запрос клуба",
    retention: (n) => `<strong>Срок хранения:</strong> у ${n} необработанных записей прошло 12 месяцев. Пока статус «new», они не удаляются автоматически: откройте каждую и поставьте contacted/qualified, чтобы оставить, или rejected/archived — тогда ближайшая очистка удалит её вместе с файлами.`,
    loaded: "загружено заявок", parentLeads: "от родителей", qualified: "qualified", qualifiedRate: "доля qualified", parentRate: "доля qualified у родителей", rejected: "rejected",
    search: "Поиск", searchPh: "имя, клуб, номер, контакт, заметка, источник", status: "Статус", position: "Позиция", age: "Возраст", followup: "Связь", applicant: "Заявитель", any: "любой", filter: "Показать", reset: "Сбросить", of: "из",
    cols: { ref: "Номер", player: "Игрок", club: "Клуб", contact: "Контакт", source: "Источник", calc: "Калькулятор (со слов игрока)", followup: "Заметка и связь", created: "Создана / возраст", status: "Статус", missing: "Не хватает" },
    clubCols: { ref: "Номер", club: "Клуб", contactName: "Контактное лицо", contact: "Контакты", need: "Запрос", created: "Создан / возраст", status: "Статус" },
    save: "Сохранить", nextContact: "Следующая связь", due: "пора", waiting: "ждёт", minor: "несоверш.",
    wa: "WhatsApp", mail: "Email", copy: "Копировать", copied: "Скопировано", ask: "Запросить недостающее", askWa: "в WhatsApp", askMail: "письмом",
    parentContact: "Контакт родителя", noMissing: "всё есть",
    missing: { citizenship: "гражданство", club: "клуб", video: "видео", ep: "Elite Prospects" },
    analytics: "Откуда приходят заявки", period: "Период", days: (d) => d === "all" ? "все загруженные" : `${d} дн.`,
    aCols: { key: "Значение", leads: "Заявок", qualified: "Qualified", rate: "Доля" },
    groups: { source_page: "Страница с кнопкой", intent: "Intent", target: "Страна / лига", calculator: "Из калькулятора уровня", utm: "Кампания (utm_source)" },
    yes: "да", no: "нет", none: "(нет)",
    analyticsNote: "Считается по загруженным записям (последние 200). Qualified — статус qualified.",
    empty: "Пусто."
  }
};

function adminStrings(lang) { return STRINGS[ADMIN_LANGS.has(lang) ? lang : "en"]; }

// ?lang= wins and is remembered in a cookie; otherwise the cookie; else English.
function adminLangFrom(req) {
  const q = typeof req.query?.lang === "string" ? req.query.lang : "";
  if (ADMIN_LANGS.has(q)) return { lang: q, set: true };
  const m = /(?:^|;\s*)eha_admin_lang=(en|ru)(?:;|$)/.exec(String(req.headers?.cookie || ""));
  return { lang: m ? m[1] : "en", set: false };
}

function adminLangCookie(lang, adminPath) {
  return `eha_admin_lang=${lang}; Path=${adminPath}; Max-Age=31536000; SameSite=Lax; HttpOnly; Secure`;
}

// The query string to come back to after a POST from the list (filters, tab,
// period). Only a plain "?k=v&…" of known keys is accepted, so the redirect
// can never leave /admin.
const RETURN_KEYS = new Set(["q", "status", "position", "age", "followup", "applicant", "view", "period"]);
function safeReturn(value) {
  const raw = typeof value === "string" ? value : "";
  if (!raw.startsWith("?") || raw.length > 400) return "";
  const params = new URLSearchParams(raw.slice(1));
  const kept = new URLSearchParams();
  for (const [k, v] of params) if (RETURN_KEYS.has(k) && v.length <= 80) kept.append(k, v);
  const s = kept.toString();
  return s ? `?${s}` : "";
}
const safeAnchor = (id) => (/^[A-Za-z0-9-]{1,64}$/.test(String(id || "")) ? `#a-${id}` : "");

// wa.me needs the international number as digits only.
function waNumber(phone) {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15 ? digits : "";
}
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ""));

// What the short first step (20.11.2026) may leave empty and EHA needs for an assessment.
function missingFields(row) {
  const out = [];
  if (!String(row.citizenship || "").trim()) out.push("citizenship");
  if (!String(row.current_club || "").trim()) out.push("club");
  if (!Array.isArray(row.video_urls) || !row.video_urls.filter(Boolean).length) out.push("video");
  if (!String(row.elite_prospects_url || "").trim()) out.push("ep");
  return out;
}

const REQUEST_LIST = {
  en: { citizenship: "your citizenship (all passports)", club: "your current club or \"no club\"", video: "a game video link (full game or full shifts)", ep: "your Elite Prospects link, if you have one" },
  ru: { citizenship: "гражданство (все паспорта)", club: "текущий клуб или «без клуба»", video: "ссылку на игровое видео (полный матч или полные смены)", ep: "ссылку на Elite Prospects, если есть" }
};

// Ready-to-send text in the applicant's language. For a minor it is addressed
// to the parent/guardian. The owner sends it himself; nothing is sent from here.
function requestMessage(row, missing) {
  const locale = row.source?.locale === "en" ? "en" : "ru";
  const first = String(row.player_name || "").trim().split(/\s+/)[0] || "";
  const items = missing.map((k) => `— ${REQUEST_LIST[locale][k]}`).join("\n");
  if (locale === "en") {
    const hello = row.is_minor ? `Hello! This is European Hockey Agency about ${first}'s application ${row.reference_code}.` : `Hello ${first}! This is European Hockey Agency about your application ${row.reference_code}.`;
    return { locale, subject: `EHA application ${row.reference_code}: a few details`, text: `${hello}\nTo assess the profile, please send:\n${items}\nThank you!` };
  }
  const hello = row.is_minor ? `Здравствуйте! Это European Hockey Agency, по заявке ${row.reference_code} (${first}).` : `Здравствуйте, ${first}! Это European Hockey Agency, по вашей заявке ${row.reference_code}.`;
  return { locale, subject: `Заявка EHA ${row.reference_code}: нужны детали`, text: `${hello}\nЧтобы оценить профиль, пришлите, пожалуйста:\n${items}\nСпасибо!` };
}

// For a minor the parent is the contact; parent_contact may be a phone or an email.
function contactTargets(row) {
  if (row.is_minor && row.parent_contact) {
    const pc = String(row.parent_contact);
    return { phone: isEmail(pc) ? "" : pc, email: isEmail(pc) ? pc : "", parent: true };
  }
  return { phone: row.phone || "", email: row.email || "", parent: false };
}

function contactCell(row, s) {
  const t = contactTargets(row);
  const wa = waNumber(t.phone);
  const lines = [];
  if (t.parent) lines.push(`<small>${s.parentContact}${row.parent_name ? `: ${esc(row.parent_name)}` : ""}</small>`);
  if (t.phone) lines.push(`${esc(t.phone)} <button type="button" class="copy" data-copy="${esc(t.phone)}">${s.copy}</button>`);
  if (t.email) lines.push(`${esc(t.email)} <button type="button" class="copy" data-copy="${esc(t.email)}">${s.copy}</button>`);
  if (t.parent && (row.phone || row.email)) lines.push(`<small>${[row.phone, row.email].filter(Boolean).map(esc).join(" · ")}</small>`);
  const actions = [];
  if (wa) actions.push(`<a class="act wa" href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer">${s.wa}</a>`);
  if (isEmail(t.email)) actions.push(`<a class="act" href="mailto:${esc(t.email)}">${s.mail}</a>`);
  return lines.join("<br>") + (actions.length ? `<div class="acts">${actions.join("")}</div>` : "");
}

function missingCell(row, s) {
  const missing = missingFields(row);
  if (!missing.length) return `<small class="ok">${s.noMissing}</small>`;
  const t = contactTargets(row);
  const msg = requestMessage(row, missing);
  const wa = waNumber(t.phone);
  const asks = [];
  if (wa) asks.push(`<a class="act wa" href="https://wa.me/${wa}?text=${encodeURIComponent(msg.text)}" target="_blank" rel="noopener noreferrer">${s.askWa}</a>`);
  if (isEmail(t.email)) asks.push(`<a class="act" href="mailto:${esc(t.email)}?subject=${encodeURIComponent(msg.subject)}&amp;body=${encodeURIComponent(msg.text)}">${s.askMail}</a>`);
  asks.push(`<button type="button" class="copy" data-copy="${esc(msg.text)}">${s.copy}</button>`);
  return `<span class="miss">${missing.map((k) => s.missing[k]).join(", ")}</span><div class="acts"><small>${s.ask}:</small> ${asks.join("")}</div>`;
}

// Leads and qualified share per source over a period (UTC calendar days).
function sourceAnalytics(rows, period, today, labelLeague = (x) => x) {
  const cutoff = period === "all" ? null : new Date(Date.parse(`${today}T00:00:00Z`) - (Number(period) - 1) * 86400000).toISOString().slice(0, 10);
  const inPeriod = rows.filter((r) => !cutoff || String(r.created_at || "").slice(0, 10) >= cutoff);
  const keyers = {
    source_page: (s) => s.source_page || null,
    intent: (s) => s.intent || null,
    target: (s) => [s.country, s.league ? labelLeague(s.league) : null].filter(Boolean).join(" · ") || null,
    calculator: (s) => (s.from_calculator ? "yes" : "no"),
    utm: (s) => s.utm_source || null
  };
  const groups = {};
  for (const [name, keyer] of Object.entries(keyers)) {
    const map = new Map();
    for (const r of inPeriod) {
      const key = keyer(r.source || {}) ?? "";
      const cur = map.get(key) || { key, leads: 0, qualified: 0 };
      cur.leads += 1;
      if (r.status === "qualified") cur.qualified += 1;
      map.set(key, cur);
    }
    groups[name] = [...map.values()].sort((a, b) => b.leads - a.leads || String(a.key).localeCompare(String(b.key))).slice(0, 10);
  }
  return { total: inPeriod.length, groups };
}

function renderAnalytics(data, s, period, adminPath, base) {
  const pct = (q, l) => (l ? `${Math.round(q / l * 100)}%` : "—");
  const periodLinks = ADMIN_PERIODS.map((p) => p === period
    ? `<b>${s.days(p)}</b>`
    : `<a href="${adminPath}?${new URLSearchParams({ ...base, period: p }).toString()}#analytics">${s.days(p)}</a>`).join(" · ");
  const label = (name, key) => (name === "calculator" ? (key === "yes" ? s.yes : s.no) : key ? esc(key) : s.none);
  const tables = Object.entries(data.groups).map(([name, rows]) =>
    `<div class="agroup"><h3>${s.groups[name]}</h3><table><tr><th>${s.aCols.key}</th><th>${s.aCols.leads}</th><th>${s.aCols.qualified}</th><th>${s.aCols.rate}</th></tr>` +
    (rows.length ? rows.map((r) => `<tr><td>${label(name, r.key)}</td><td>${r.leads}</td><td>${r.qualified}</td><td>${pct(r.qualified, r.leads)}</td></tr>`).join("") : `<tr><td colspan="4">${s.empty}</td></tr>`) +
    `</table></div>`).join("");
  return `<section id="analytics"><h2>${s.analytics} <small>(${data.total})</small></h2><p>${s.period}: ${periodLinks}</p><div class="agrid">${tables}</div><p><small>${s.analyticsNote}</small></p></section>`;
}

// Copy buttons; inline because the admin page has no external script.
const ADMIN_SCRIPT = `<script type="text/javascript">document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("button.copy");if(!b)return;var t=b.getAttribute("data-copy")||"";var done=function(){var o=b.textContent;b.textContent=b.dataset.done||"✓";setTimeout(function(){b.textContent=o},1200)};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,function(){});});</script>`;

const ADMIN_CSS = `body{font:14px/1.4 system-ui,sans-serif;margin:24px;color:#0b1520}table{border-collapse:collapse;width:100%;margin-bottom:40px}` +
  `th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f2f4f6}` +
  `select,button,input{font:inherit}.filters{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:16px}.summary{display:grid;grid-template-columns:repeat(6,minmax(110px,1fr));gap:8px;margin:0 0 18px}.summary>div{border:1px solid #ccd3d9;padding:10px;background:#f8fafb}.summary b{display:block;font-size:22px}.summary span{color:#5a6673;font-size:12px}small{color:#5a6673}.top{display:flex;gap:12px;justify-content:flex-end;align-items:center}.followup{display:grid;gap:6px;min-width:220px}.followup textarea{width:100%;box-sizing:border-box}.due{color:#b00020}` +
  `.tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}.tabs a{padding:8px 12px;border:1px solid #ccd3d9;border-radius:999px;color:#0b1520;text-decoration:none}.tabs a.on{background:#0b1520;color:#fff;border-color:#0b1520}` +
  `.acts{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}.act{display:inline-block;padding:6px 10px;border:1px solid #9aa6b2;border-radius:6px;color:#0b1520;text-decoration:none;min-height:24px}.act.wa{border-color:#0f7a40;color:#0f7a40}button.copy{padding:4px 8px;min-height:28px}.miss{color:#8a4b00;font-weight:600}.ok{color:#0f7a40}` +
  `tr:target td{background:#fff8d6}.agrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.agroup table{margin-bottom:8px}h3{font-size:15px;margin:6px 0}` +
  `@media(max-width:900px){.summary{grid-template-columns:repeat(2,1fr)}}` +
  // Phone: each row becomes a card; labels come from data-label.
  `@media(max-width:760px){body{margin:12px}table.list,table.list tbody,table.list tr,table.list td{display:block;width:100%;box-sizing:border-box}table.list tr:first-child{display:none}table.list tr{border:1px solid #ccd3d9;border-radius:10px;margin:0 0 12px;padding:6px 0;background:#fff}table.list td{border:0;border-bottom:1px solid #eef1f4;padding:8px 12px}table.list td:last-child{border-bottom:0}table.list td[data-label]:before{content:attr(data-label);display:block;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#5a6673;margin-bottom:2px}.followup{min-width:0}.act,button{min-height:40px}table.list td:empty{display:none}.summary{grid-template-columns:repeat(3,1fr);gap:6px}.summary>div{padding:8px}.summary b{font-size:18px}.summary span{font-size:11px}.summary.quality{display:none}.filters{display:grid;grid-template-columns:1fr 1fr;gap:8px}.filters label{display:grid;gap:2px;font-size:12px}.filters label:first-child{grid-column:1/-1}.filters input,.filters select{width:100%}}`;

module.exports = {
  ADMIN_VIEWS, ADMIN_PERIODS, adminStrings, adminLangFrom, adminLangCookie, safeReturn, safeAnchor,
  waNumber, missingFields, requestMessage, contactTargets, contactCell, missingCell,
  sourceAnalytics, renderAnalytics, ADMIN_SCRIPT, ADMIN_CSS, esc
};
