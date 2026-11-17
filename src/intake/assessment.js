// Internal preliminary assessment of a player application (see
// assessment-rules.js). Four separate parts, never merged into one number:
//   1. sport        preliminary sporting signal (position-specific)
//   2. completeness how much of what the agent needs is present
//   3. fit          which EHA directions the profile matches
//   4. documents    whether registration / documents need checking
// Result categories: tier_a | tier_b | tier_c | not_fit | manual_review.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const RULES = require("./assessment-rules");

let leagueTiers = null;
function tierForLeague(name) {
  if (!name) return null;
  if (!leagueTiers) {
    leagueTiers = new Map();
    try {
      const src = fs.readFileSync(path.join(__dirname, "..", "..", "public", "assets", "leagues.src.js"), "utf8");
      const sandbox = { window: {} };
      vm.runInNewContext(src, sandbox, { timeout: 500 });
      for (const l of sandbox.window.EHA_LEAGUES_SRC.leagues || []) {
        leagueTiers.set(String(l.name).toLowerCase(), { tier: l.tier, junior: l.age === "junior" });
      }
    } catch { /* no tiers: level stays unknown */ }
  }
  return leagueTiers.get(String(name).trim().toLowerCase()) || null;
}

function playerAge(app, now) {
  if (app.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(app.birthDate)) {
    const [y, m, d] = app.birthDate.split("-").map(Number);
    let age = now.getUTCFullYear() - y;
    if (now.getUTCMonth() + 1 < m || (now.getUTCMonth() + 1 === m && now.getUTCDate() < d)) age -= 1;
    return { age, exact: true };
  }
  if (Number.isInteger(app.birthYear)) return { age: now.getUTCFullYear() - app.birthYear, exact: false };
  return { age: null, exact: false };
}

function currentLevel(app) {
  if (app.currentLevel && RULES.levelBase[app.currentLevel] !== undefined) return { level: app.currentLevel, from: "player" };
  const t = tierForLeague(app.currentLeague);
  if (t) return { level: t.junior ? "junior" : t.tier === 1 ? "top" : t.tier === 2 ? "t2" : "t3", from: "league_reference" };
  return { level: null, from: null };
}

// Most recent regular-season row with enough games; playoffs never mixed in.
function latestRegular(stats) {
  return (stats || []).filter((s) => s.competition === "regular" && Number(s.gp) >= RULES.minGamesForStats)
    .sort((a, b) => String(b.season).localeCompare(String(a.season)))[0] || null;
}

function sportPart(app, age, level, factors, missing) {
  if (!level.level) {
    missing.push("current_level");
    return { score: null, note: "level unknown" };
  }
  let score = RULES.levelBase[level.level];
  factors.push(`level:${level.level} (${level.from})`);
  const ppgRule = RULES.ppg[app.position];
  const row = latestRegular(app.stats);
  if (ppgRule) {
    if (row && Number.isFinite(Number(row.pts))) {
      const ppg = Number(row.pts) / Number(row.gp);
      if (ppg >= ppgRule[0]) score += 12; else if (ppg >= ppgRule[1]) score += 6; else if (ppg >= ppgRule[2]) score += 0; else score -= 8;
      factors.push(`ppg ${ppg.toFixed(2)} in ${row.season} ${row.league || ""} (${app.position} benchmark)`.trim());
    } else {
      // No stats is "unknown", not zero: the score keeps the level base only.
      factors.push("no regular-season stats: production not assessed");
    }
  } else if (app.position === "goalie") {
    factors.push(row ? `goalie: ${row.gp} GP in ${row.season}; no production formula for goalies` : "goalie: assessed on level and experience only");
  }
  if (age !== null) {
    if (age <= RULES.ages.juniorCeiling) score += 6; else if (age <= 23) score += 3; else if (age <= 27) score += 0; else if (age <= 31) score -= 5; else score -= 10;
  }
  return { score, note: "calculator heuristics, preliminary" };
}

function completenessPart(app, age, level, missing) {
  const w = RULES.completeness.weights;
  const has = {
    position: Boolean(app.position),
    ageKnown: age !== null,
    currentTeam: Boolean(app.currentClub && !/^(no club|нет клуба|-)$/i.test(app.currentClub.trim())),
    currentLevel: Boolean(level.level),
    stats: (app.stats || []).some((s) => Number(s.gp) > 0),
    video: (app.videoUrls || []).length > 0,
    fullGameVideo: app.videoType === "full_game",
    measurements: Boolean(app.heightCm && app.weightKg),
    availability: Boolean(app.availableFrom),
    goals: Boolean(app.goals),
    eliteProspects: Boolean(app.eliteProspectsUrl),
  };
  let got = 0; let total = 0;
  for (const [k, weight] of Object.entries(w)) {
    total += weight;
    if (has[k]) got += weight; else if (k !== "currentLevel" && !missing.includes(k)) missing.push(k);
  }
  return { share: Math.round((got / total) * 100) / 100, has };
}

function fitPart(app, age) {
  if (age === null) return { directions: [], note: "age unknown" };
  const dirs = RULES.directions.filter((d) => age >= d.minAge && age <= d.maxAge).map((d) => d.id);
  const preferred = (app.preferredCountries || []).map((c) => c.toLowerCase());
  const naPreferred = preferred.some((c) => /usa|сша|canada|канада|united states/.test(c));
  return { directions: dirs, preferredNorthAmerica: naPreferred };
}

function documentsPart(app, age) {
  const checks = [];
  if (age !== null && age < 18) checks.push("minor: guardian involvement and minor-transfer rules");
  if ((app.citizenships || []).length > 1) checks.push("several citizenships: confirm which passport is valid and which counts for each league");
  checks.push("registration, international transfer and right to work depend on the target league and passport; check per market");
  return { needsCheck: true, checks };
}

function assessApplication(app, { now = new Date(), rules = RULES } = {}) {
  const factors = [];
  const missing = [];
  const { age, exact } = playerAge(app, now);
  const level = currentLevel(app);
  const sport = sportPart(app, age, level, factors, missing);
  const completeness = completenessPart(app, age, level, missing);
  const fit = fitPart(app, age);
  const documents = documentsPart(app, age);

  let category;
  const reasons = [];
  if (fit.directions.length === 0 && age !== null) {
    category = "not_fit";
    reasons.push(`age ${age} outside current EHA directions (preliminary; no automatic refusal)`);
  } else if (completeness.share < rules.completeness.manualReviewBelow || sport.score === null) {
    category = "manual_review";
    reasons.push(sport.score === null ? "current level unknown" : `profile ${Math.round(completeness.share * 100)}% complete`);
  } else {
    category = sport.score >= rules.tierCutoffs.A ? "tier_a" : sport.score >= rules.tierCutoffs.B ? "tier_b" : "tier_c";
    reasons.push(`preliminary sporting signal ${sport.score}`);
  }
  if (!exact && age !== null) factors.push("age from birth year (approximate)");
  return {
    category,
    reasons,
    factors,
    missing,
    parts: {
      sport,
      completeness: { share: completeness.share },
      fit,
      documents,
    },
    age,
    rulesVersion: rules.version,
    mode: rules.mode,
    approved: rules.approved,
    computedAt: now.toISOString(),
  };
}

// Category the agent works with: the override wins when present.
function effectiveCategory(assessment, override) {
  return (override && override.category) || (assessment && assessment.category) || "manual_review";
}

const CATEGORY_LABELS = {
  tier_a: "Tier A", tier_b: "Tier B", tier_c: "Tier C", not_fit: "Не наш профиль", manual_review: "Нужна ручная проверка",
};
const CATEGORIES = Object.keys(CATEGORY_LABELS);

module.exports = { assessApplication, effectiveCategory, tierForLeague, latestRegular, CATEGORY_LABELS, CATEGORIES, playerAge };
