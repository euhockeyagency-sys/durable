// Elite Prospects: profile-URL validation and the official API adapter.
//
// Access is ONLY through the official Elite Prospects API with an
// organisation key (EP_API_KEY, header X-Api-Key, https://api.eliteprospects.com).
// The API is a paid, licensed product; without a key the lookup reports
// "not_configured" and the form stays manual. The site is never scraped and
// user-supplied URLs are never fetched: only the numeric player id is taken
// from the URL and sent to the fixed API host.
const ALLOWED_HOSTS = new Set(["eliteprospects.com", "www.eliteprospects.com"]);
const API_BASE = "https://api.eliteprospects.com/v1";

// https://www.eliteprospects.com/player/<id>/<slug>
function parseEliteProspectsUrl(input) {
  const raw = String(input || "").trim();
  if (!raw || raw.length > 300) return { ok: false, reason: "invalid_url" };
  let url;
  try { url = new URL(raw); } catch { return { ok: false, reason: "invalid_url" }; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, reason: "invalid_url" };
  if (url.username || url.password || url.port) return { ok: false, reason: "invalid_url" };
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return { ok: false, reason: "wrong_domain" };
  const match = url.pathname.match(/^\/player\/(\d{1,9})(?:\/[a-z0-9\-._~%]*)?\/?$/i);
  if (!match) return { ok: false, reason: "not_a_player_profile" };
  const id = match[1];
  return { ok: true, id, canonicalUrl: `https://www.eliteprospects.com/player/${id}` };
}

// Simple in-memory limiter for outgoing API calls (protects the paid quota).
function createCallLimiter({ limit = 30, windowMs = 60_000, now = () => Date.now() } = {}) {
  let stamps = [];
  return () => {
    const t = now();
    stamps = stamps.filter((s) => t - s < windowMs);
    if (stamps.length >= limit) return false;
    stamps.push(t);
    return true;
  };
}

const num = (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v));
const str = (v, max = 120) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const pick = (obj, ...keys) => { for (const k of keys) { const v = k.split(".").reduce((o, p) => (o == null ? undefined : o[p]), obj); if (v !== undefined && v !== null && v !== "") return v; } return null; };

function ageOn(birthDate, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || "")) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = date.getUTCFullYear() - y;
  if (date.getUTCMonth() + 1 < m || (date.getUTCMonth() + 1 === m && date.getUTCDate() < d)) age -= 1;
  return age;
}

// Field names follow the public API reference; anything missing stays null.
// NOTE: not verified against a live key yet (EHA has no API subscription).
function mapPlayer(json) {
  const p = (json && (json.data || json)) || {};
  const positionRaw = String(pick(p, "position", "positionAbbreviation") || "").toUpperCase();
  const position = positionRaw.startsWith("G") ? "goalie" : /^(D|LD|RD)/.test(positionRaw) ? "defense" : positionRaw ? "forward" : null;
  const handRaw = String(pick(p, "shoots", "catches", "hand") || "").toUpperCase();
  const hand = handRaw.startsWith("L") ? "left" : handRaw.startsWith("R") ? "right" : null;
  const nationalities = [pick(p, "nationality.name", "nationality"), pick(p, "secondaryNationality.name", "secondaryNationality")].map((n) => str(n, 60)).filter(Boolean);
  const birthDate = str(pick(p, "dateOfBirth", "birthDate"), 10);
  return {
    name: str(pick(p, "name") || [pick(p, "firstName"), pick(p, "lastName")].filter(Boolean).join(" "), 120),
    birthDate: /^\d{4}-\d{2}-\d{2}$/.test(birthDate || "") ? birthDate : null,
    citizenships: nationalities,
    position,
    stickHand: hand,
    heightCm: num(pick(p, "height.metrics", "heightMetric", "height")),
    weightKg: num(pick(p, "weight.metrics", "weightMetric", "weight")),
    currentTeam: str(pick(p, "latestStats.team.name", "currentTeam.name"), 160),
    currentLeague: str(pick(p, "latestStats.league.name", "currentTeam.league.name"), 120),
  };
}

// "2025-26" / "2025-2026" -> "2025/26" (the form's season format).
function normSeason(v) {
  const m = String(v || "").match(/^(\d{4})[-/](\d{2}|\d{4})$/);
  return m ? `${m[1]}/${m[2].slice(-2)}` : v;
}

// Keep regular season and playoffs apart; never sum different competitions.
function mapStats(json, position, maxSeasons = 3) {
  const rows = ((json && (json.data || json)) || []).filter(Boolean).map((s) => {
    const type = String(pick(s, "gameType", "seasonType") || "").toLowerCase();
    const competition = type.includes("play") ? "playoffs" : type.includes("reg") || !type ? "regular" : "other";
    const reg = s.regularStats || s.stats || s;
    return {
      season: normSeason(str(pick(s, "season.slug", "season.name", "season"), 9)),
      team: str(pick(s, "team.name"), 160),
      league: str(pick(s, "league.name"), 120),
      competition,
      gp: num(pick(reg, "GP", "gamesPlayed")),
      g: position === "goalie" ? null : num(pick(reg, "G", "goals")),
      a: position === "goalie" ? null : num(pick(reg, "A", "assists")),
      pts: position === "goalie" ? null : num(pick(reg, "PTS", "points")),
      gaa: position === "goalie" ? num(pick(reg, "GAA")) : null,
      svp: position === "goalie" ? num(pick(reg, "SVP", "SV%")) : null,
    };
  }).filter((r) => r.season && r.competition !== "other");
  const seasons = [...new Set(rows.map((r) => r.season))].sort().reverse().slice(0, maxSeasons);
  const order = { regular: 0, playoffs: 1 };
  return rows.filter((r) => seasons.includes(r.season))
    .sort((a, b) => b.season.localeCompare(a.season) || order[a.competition] - order[b.competition]);
}

function createEliteProspectsClient({ apiKey, fetchImpl = fetch, now = () => new Date(), timeoutMs = 8000, limiter = createCallLimiter() } = {}) {
  const configured = Boolean(apiKey);
  async function get(path) {
    if (!limiter()) { const e = new Error("rate_limited"); e.code = "rate_limited"; throw e; }
    const response = await fetchImpl(`${API_BASE}${path}`, {
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status === 404) { const e = new Error("not_found"); e.code = "not_found"; throw e; }
    if (!response.ok) { const e = new Error(`upstream_${response.status}`); e.code = "unavailable"; throw e; }
    return response.json();
  }
  return {
    configured,
    async lookup(id) {
      if (!configured) return { ok: false, reason: "not_configured" };
      if (!/^\d{1,9}$/.test(String(id))) return { ok: false, reason: "invalid_url" };
      try {
        const player = mapPlayer(await get(`/players/${id}`));
        const stats = mapStats(await get(`/players/${id}/stats`), player.position);
        const fetchedAt = now();
        return {
          ok: true,
          source: "elite_prospects_api",
          fetchedAt: fetchedAt.toISOString(),
          epId: String(id),
          player: { ...player, age: ageOn(player.birthDate, fetchedAt) },
          stats,
          // EP photos are not used: no rights confirmed. The player uploads their own.
          photo: null,
        };
      } catch (error) {
        const reason = error.code || (error.name === "TimeoutError" ? "timeout" : "unavailable");
        return { ok: false, reason };
      }
    },
  };
}

module.exports = { parseEliteProspectsUrl, createEliteProspectsClient, createCallLimiter, mapPlayer, mapStats, ageOn, API_BASE };
