// Central, editable rules for the INTERNAL preliminary assessment of player
// applications. This is a processing priority for the agent, not a rating of
// talent and not a contract prognosis. Nothing here rejects an application
// automatically: in "preliminary" mode every application is stored, the agent
// sees the result and can override it.
//
// Change rules here and bump `version`; every stored assessment records the
// version it was computed with. Sporting signals reuse the EHA level
// calculator's published heuristics (public/assets/level-calculator.js: level
// base scores, points-per-game benchmarks per position, age adjustments) and
// the league tiers in public/assets/leagues.src.js. EHA has NOT approved Tier
// thresholds yet (`approved: false`), so the tier cut-offs below are a
// placeholder that only orders the agent's queue.
const calculator = require("../../public/assets/level-calculator.js");

module.exports = {
  version: "2026-11-18.preliminary-1",
  mode: "preliminary", // preliminary | active (active is not implemented: no auto-decisions)
  approved: false,
  // Score from the calculator heuristics -> internal tier (queue order only).
  tierCutoffs: { A: 82, B: 48 }, // same cut-offs as the calculator's public bands
  // Level of the current competition: from the player's choice or from the
  // league tier in leagues.src.js. Unknown level never counts as zero.
  levelBase: calculator.BASE, // { top, t2, t3, junior, amateur }
  ppg: calculator.PPG, // per position; goalie: null (no production formula)
  minGamesForStats: 10,
  ages: { juniorCeiling: 19 },
  // EHA directions (from services and BRAND.md). Age ranges decide fit only;
  // citizenship never excludes a profile.
  directions: [
    { id: "europe_senior", label: { en: "Europe, senior hockey", ru: "Европа, взрослый хоккей" }, minAge: 18, maxAge: 40 },
    { id: "europe_junior", label: { en: "Europe, junior hockey", ru: "Европа, юниорский хоккей" }, minAge: 14, maxAge: 20 },
    { id: "north_america_junior", label: { en: "USA/Canada: junior and college routes", ru: "США/Канада: юниорский и студенческий путь" }, minAge: 15, maxAge: 21 },
  ],
  // Completeness: what the agent needs to start working on a profile.
  completeness: {
    weights: { position: 2, ageKnown: 2, currentTeam: 2, currentLevel: 2, stats: 2, video: 3, fullGameVideo: 1, measurements: 1, availability: 1, goals: 1, eliteProspects: 1 },
    manualReviewBelow: 0.5, // share of weight
  },
};
