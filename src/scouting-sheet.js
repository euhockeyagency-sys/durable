// Scouting Sheet: a closed web card of one player for one club.
//
// The agent creates a link in the CRM (crm/migrations/*_scouting_links.sql,
// create_scouting_link). The club opens /s/<token>; the page is rendered from
// the CRM through get_scouting_sheet(token), which returns a fixed whitelist of
// fields (no contacts, notes, contract terms or development areas). The page
// is never indexed, never cached and is not linked from the site. Each human
// view is counted and the agent gets a Telegram note (throttled per link).

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// CRM project. The publishable key is public by design: every CRM table has
// RLS with no anon policies, and anon may only execute get_scouting_sheet.
const DEFAULT_CRM_URL = "https://kkxugkmpugwwndxsevdy.supabase.co";
const DEFAULT_CRM_KEY = "sb_publishable_PwmjT1VUf9E4564eU0a2Zw_bUnuZi0t";

// Link-preview fetchers and scanners: the page is served, the view is not counted.
const BOT_UA = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|skype|linkedin|twitter|embedly|vkshare|yandex|google|bing|outlook|safelinks|proofpoint|mimecast|barracuda|headless|curl|wget|python|node-fetch|axios/i;
const NOTIFY_EVERY_MS = 30 * 60 * 1000;
const TOKEN_RE = /^[A-Za-z0-9_-]{20,100}$/;

const LABELS = {
  en: {
    title: "Player profile", born: "Born", position: "Position", shoots: "Shoots", size: "Height / weight",
    passports: "Passport", team: "Current team", stats: "Statistics", strengths: "Strengths", summary: "Summary",
    video: "Video", highlights: "Highlights", game: "Full game", more: "Video", ep: "Elite Prospects profile",
    availability: "Availability", contact: "Contact the agent", note: "Shared privately with your club by European Hockey Agency. Please do not forward.",
    updated: "Updated", missing: "This link has expired or was switched off. Ask European Hockey Agency for a new one.",
    status: { "Available": "Available now", "Looking for next season": "Looking for next season", "Looking for tryout": "Open to a tryout", "Under contract": "Under contract" }
  },
  ru: {
    title: "Профиль игрока", born: "Год рождения", position: "Позиция", shoots: "Хват", size: "Рост / вес",
    passports: "Паспорт", team: "Команда сейчас", stats: "Статистика", strengths: "Сильные стороны", summary: "Кратко",
    video: "Видео", highlights: "Нарезка", game: "Полная игра", more: "Видео", ep: "Профиль Elite Prospects",
    availability: "Доступность", contact: "Связаться с агентом", note: "Отправлено вашему клубу агентством European Hockey Agency. Пожалуйста, не пересылайте.",
    updated: "Обновлено", missing: "Срок ссылки истёк или она отключена. Попросите у European Hockey Agency новую.",
    status: { "Available": "Свободен", "Looking for next season": "Ищет команду на следующий сезон", "Looking for tryout": "Готов к просмотру", "Under contract": "Под контрактом" }
  }
};

function safeUrl(u) {
  try {
    const url = new URL(String(u || "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch { return ""; }
}

// YouTube / Vimeo links become an embedded player; anything else is a button.
function embedUrl(u) {
  const href = safeUrl(u);
  if (!href) return "";
  const url = new URL(href);
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id = "";
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = url.searchParams.get("v") || (url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/) || [])[1] || "";
  }
  if (/^[A-Za-z0-9_-]{6,20}$/.test(id)) {
    const t = Number.parseInt(url.searchParams.get("t") || url.searchParams.get("start") || "", 10);
    return `https://www.youtube-nocookie.com/embed/${id}${Number.isFinite(t) && t > 0 ? `?start=${t}` : ""}`;
  }
  if (host === "vimeo.com") {
    const m = url.pathname.match(/^\/(\d{5,12})(?:\/([a-f0-9]{6,20}))?/);
    if (m) return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ""}`;
  }
  return "";
}

const CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

function pageShell(lang, title, body) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>${esc(title)}</title>` +
    `<style>:root{color-scheme:light}body{margin:0;font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f3f5f8;color:#0b1520}` +
    `main{max-width:860px;margin:0 auto;padding:20px 16px 48px}header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;font-weight:700;letter-spacing:.02em}` +
    `header small{font-weight:400;color:#56636f}.card{background:#fff;border:1px solid #dde3e9;border-radius:12px;padding:20px;margin:0 0 16px}` +
    `h1{font-size:28px;line-height:1.2;margin:0 0 4px}h2{font-size:18px;margin:0 0 10px}.sub{color:#56636f;margin:0}` +
    `dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0 0}dt{font-size:13px;color:#56636f}dd{margin:0;font-weight:600}` +
    `.pill{display:inline-block;background:#e6f4ea;color:#14532d;border-radius:999px;padding:3px 12px;font-size:14px;font-weight:600;margin-top:10px}` +
    `pre{white-space:pre-wrap;font:inherit;margin:0}.video{position:relative;padding-top:56.25%;margin:0 0 12px;border-radius:8px;overflow:hidden;background:#000}` +
    `.video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.btns{display:flex;flex-wrap:wrap;gap:10px}` +
    `.btn{display:inline-block;padding:10px 16px;border-radius:8px;background:#0b2545;color:#fff;text-decoration:none;font-weight:600}.btn.alt{background:#fff;color:#0b2545;border:1px solid #0b2545}` +
    `footer{color:#56636f;font-size:13px}</style></head><body><main>${body}</main></body></html>`;
}

function renderSheet(d, { contactEmail = "", whatsapp = "" } = {}) {
  const lang = d.link && d.link.lang === "ru" ? "ru" : "en";
  const L = LABELS[lang];
  const name = [d.first_name, d.last_name].filter(Boolean).join(" ");
  const item = (k, v) => (v || v === 0) && String(v).trim() ? `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>` : "";
  const size = [d.height, d.weight].filter((x) => x && String(x).trim()).join(" / ");
  const team = [d.current_team, d.current_league, d.current_country].filter((x) => x && String(x).trim()).join(" · ");
  const passports = Array.isArray(d.passports) ? d.passports.filter(Boolean).join(", ") : "";
  const status = d.availability_status && d.availability_status !== "Unknown" ? (L.status[d.availability_status] || d.availability_status) : "";
  const videos = [[L.highlights, d.highlights_url], [L.more, d.video_url], [L.game, d.full_game_video_url]]
    .map(([label, u]) => ({ label, href: safeUrl(u), embed: embedUrl(u) }))
    .filter((v, i, all) => v.href && all.findIndex((o) => o.href === v.href) === i);
  const ep = safeUrl(d.eliteprospects_url);
  const section = (title, inner) => inner ? `<section class="card"><h2>${esc(title)}</h2>${inner}</section>` : "";
  const text = (v) => v && String(v).trim() ? `<pre>${esc(String(v).trim())}</pre>` : "";
  const subject = encodeURIComponent(`${name} — ${d.link && d.link.recipient_label ? d.link.recipient_label : "club"}`);
  const contactBtns = [
    contactEmail ? `<a class="btn" href="mailto:${esc(contactEmail)}?subject=${subject}">${esc(L.contact)}</a>` : "",
    whatsapp ? `<a class="btn alt" href="https://wa.me/${esc(whatsapp)}" rel="noopener noreferrer" target="_blank">WhatsApp</a>` : ""
  ].join("");
  const body =
    `<header><span>EUROPEAN HOCKEY AGENCY</span><small>${esc(L.title)}</small></header>` +
    `<section class="card"><h1>${esc(name)}</h1><p class="sub">${esc([d.position, d.birth_year].filter(Boolean).join(" · "))}</p>` +
    (status ? `<span class="pill">${esc(status)}</span>` : "") +
    `<dl>${item(L.born, d.birth_year)}${item(L.position, d.position)}${item(L.shoots, d.shoots)}${item(L.size, size)}${item(L.passports, passports)}${item(L.team, team)}</dl></section>` +
    section(L.video, videos.length ? videos.map((v) => v.embed
      ? `<div class="video"><iframe src="${esc(v.embed)}" title="${esc(`${name} — ${v.label}`)}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
      : "").join("") + `<div class="btns">${videos.map((v) => `<a class="btn alt" href="${esc(v.href)}" rel="noopener noreferrer" target="_blank">${esc(v.label)}</a>`).join("")}</div>` : "") +
    section(L.stats, text(d.stats_summary) + (ep ? `<p class="btns" style="margin-top:12px"><a class="btn alt" href="${esc(ep)}" rel="noopener noreferrer" target="_blank">${esc(L.ep)}</a></p>` : "")) +
    section(L.strengths, text(d.strengths)) +
    section(L.summary, text(d.short_description)) +
    (contactBtns ? `<section class="card"><div class="btns">${contactBtns}</div></section>` : "") +
    `<footer><p>${esc(L.note)}</p>${d.updated_at ? `<p>${esc(L.updated)}: ${esc(String(d.updated_at).slice(0, 10))}</p>` : ""}</footer>`;
  return pageShell(lang, `${name} · EHA`, body);
}

function createScoutingClient(config, fetchImpl = fetch) {
  const url = (config.crmSupabaseUrl || DEFAULT_CRM_URL).replace(/\/$/, "");
  const key = config.crmSupabaseKey || DEFAULT_CRM_KEY;
  return {
    async getSheet(token, count) {
      const res = await fetchImpl(`${url}/rest/v1/rpc/get_scouting_sheet`, {
        method: "POST",
        headers: { apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({ p_token: token, p_count: Boolean(count) }),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`CRM returned ${res.status}`);
      const data = await res.json();
      return data && typeof data === "object" ? data : null;
    },
    async notify(text) {
      if (!config.telegramBotToken || !config.telegramChatId) return;
      await fetchImpl(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: config.telegramChatId, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(8000)
      });
    }
  };
}

function viewNote(d) {
  const name = [d.first_name, d.last_name].filter(Boolean).join(" ");
  const l = d.link || {};
  return `👀 ${l.recipient_label || "Club"} opened the card of ${name}` +
    (l.first_view ? " (first time)" : ` (view ${l.view_count})`);
}

function registerScoutingRoutes(app, { config, client, now = () => Date.now() }) {
  const scouting = client || createScoutingClient(config);
  const lastNotified = new Map();
  app.get("/s/:token", async (req, res) => {
    res.set({
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": CSP
    });
    const token = String(req.params.token || "");
    const lang = /^ru\b/i.test(req.get("accept-language") || "") ? "ru" : "en";
    const missing = () => res.status(404).type("html").send(pageShell(lang, "European Hockey Agency", `<section class="card"><p>${esc(LABELS[lang].missing)}</p></section>`));
    if (!TOKEN_RE.test(token)) return missing();
    const human = !BOT_UA.test(req.get("user-agent") || "") && req.method === "GET";
    let data;
    try {
      data = await scouting.getSheet(token, human);
    } catch {
      return res.status(503).type("text").send("Temporarily unavailable. Please try again in a minute.");
    }
    if (!data || !data.first_name) return missing();
    if (human) {
      const t = now();
      if ((lastNotified.get(token) || 0) + NOTIFY_EVERY_MS <= t) {
        lastNotified.set(token, t);
        scouting.notify(viewNote(data)).catch(() => {});
      }
    }
    res.type("html").send(renderSheet(data, { contactEmail: config.contactEmail, whatsapp: (config.agentWhatsapp || "375297957818").replace(/\D/g, "") }));
  });
}

module.exports = { registerScoutingRoutes, renderSheet, embedUrl, createScoutingClient, viewNote, BOT_UA };
