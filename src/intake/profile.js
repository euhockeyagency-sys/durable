// Extended, player-confirmed profile fields of the application form.
// Everything is optional (the core form stays as before); values are
// validated server-side and stored in applications.profile (jsonb).
const text = (value, max = 500) => String(value || "").trim().slice(0, max);
const asArray = (v) => (Array.isArray(v) ? v : v === undefined || v === "" ? [] : [v]);
const checked = (value) => ["true", "on", "1", "yes"].includes(String(value || "").toLowerCase());
const LEVELS = new Set(["top", "t2", "t3", "junior", "amateur"]);
const VIDEO_TYPES = new Set(["full_game", "shifts", "highlights", "mixed"]);
const COMPETITIONS = new Set(["regular", "playoffs"]);
const numOrNull = (v, min, max, int = true) => {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(String(v).replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max || (int && !Number.isInteger(n))) return NaN;
  return n;
};

const MSG = {
  en: { birthDate: "Enter a valid date of birth that matches the year of birth.", stats: "Check the statistics: season like 2025/26, numbers only.", dataConfirmed: "Please confirm that you checked the prefilled data.", currentLevel: "Choose the level from the list." },
  ru: { birthDate: "Укажите корректную дату рождения, совпадающую с годом рождения.", stats: "Проверьте статистику: сезон в формате 2025/26, только числа.", dataConfirmed: "Подтвердите, что проверили заполненные данные.", currentLevel: "Выберите уровень из списка." },
};

function parseProfileExtras(body, { birthYear, position, locale = "ru" }) {
  const m = MSG[locale === "en" ? "en" : "ru"];
  const errors = {};
  const birthDate = text(body.birthDate, 10) || null;
  if (birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(Date.parse(`${birthDate}T00:00:00Z`)) || Number(birthDate.slice(0, 4)) !== birthYear)) errors.birthDate = m.birthDate;

  // Several citizenships allowed ("Belarus, Poland"). Citizenship is NOT proof
  // of a valid passport, visa or right to work.
  const citizenships = text(body.citizenship, 100).split(/[,;/]+/).map((c) => c.trim()).filter(Boolean).slice(0, 4);

  const currentLevel = text(body.currentLevel, 10) || null;
  if (currentLevel && !LEVELS.has(currentLevel)) errors.currentLevel = m.currentLevel;

  const cols = ["statsSeason", "statsTeam", "statsLeague", "statsCompetition", "statsGp", "statsG", "statsA", "statsGaa", "statsSvp"].map((k) => asArray(body[k]));
  const rows = [];
  const n = Math.min(6, Math.max(...cols.map((c) => c.length), 0));
  for (let i = 0; i < n; i += 1) {
    const [season, team, league, competition, gp, g, a, gaa, svp] = cols.map((c) => c[i]);
    if (![season, team, league, gp, g, a, gaa, svp].some((v) => String(v || "").trim())) continue;
    const row = {
      season: text(season, 9),
      team: text(team, 160) || null,
      league: text(league, 120) || null,
      competition: COMPETITIONS.has(text(competition, 10)) ? text(competition, 10) : "regular",
      gp: numOrNull(gp, 0, 120),
      g: position === "goalie" ? null : numOrNull(g, 0, 200),
      a: position === "goalie" ? null : numOrNull(a, 0, 200),
      gaa: position === "goalie" ? numOrNull(gaa, 0, 20, false) : null,
      svp: position === "goalie" ? numOrNull(svp, 0, 1, false) : null,
    };
    row.pts = Number.isFinite(row.g) && Number.isFinite(row.a) ? row.g + row.a : null;
    const bad = !/^\d{4}\/\d{2}$/.test(row.season) || [row.gp, row.g, row.a, row.gaa, row.svp].some((v) => Number.isNaN(v));
    if (bad) { errors.stats = m.stats; break; }
    rows.push(row);
  }

  // Elite Prospects import metadata from the client. The data itself was shown
  // to the player and confirmed/edited; we keep where it came from and when.
  let epImport = null;
  try {
    const raw = JSON.parse(text(body.epImport, 2000) || "null");
    if (raw && /^\d{1,9}$/.test(String(raw.epId)) && !Number.isNaN(Date.parse(raw.fetchedAt))) {
      epImport = { source: "elite_prospects_api", epId: String(raw.epId), fetchedAt: new Date(raw.fetchedAt).toISOString(), fields: asArray(raw.fields).map((f) => text(f, 30)).slice(0, 20) };
    }
  } catch { /* ignored: treated as manual entry */ }
  if (epImport && !checked(body.dataConfirmed)) errors.dataConfirmed = m.dataConfirmed;

  const profile = {
    citizenships,
    currentLeague: text(body.currentLeague, 120) || null,
    currentLevel: currentLevel && LEVELS.has(currentLevel) ? currentLevel : null,
    stats: rows,
    videoType: VIDEO_TYPES.has(text(body.videoType, 20)) ? text(body.videoType, 20) : null,
    timecodes: text(body.timecodes, 600) || null,
    jerseyNumber: text(body.jerseyNumber, 4) || null,
    jerseyColor: text(body.jerseyColor, 40) || null,
    goals: text(body.goals, 600) || null,
    preferredCountries: text(body.preferredCountries, 200).split(/[,;]+/).map((c) => c.trim()).filter(Boolean).slice(0, 8),
    budget: text(body.budget, 120) || null,
    strengthsSelf: text(body.strengthsSelf, 1000) || null,
    epImport,
    dataConfirmed: checked(body.dataConfirmed),
  };
  return {
    errors,
    birthDate: errors.birthDate ? null : birthDate,
    profile,
    publicPhotoConsent: checked(body.publicPhotoConsent),
    publicCaseConsent: checked(body.publicCaseConsent),
  };
}

module.exports = { parseProfileExtras, LEVELS, VIDEO_TYPES };
