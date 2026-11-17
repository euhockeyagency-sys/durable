#!/usr/bin/env node
// Sandbox preview of the intake pipeline on FICTIONAL data: assessment, player
// feedback, the agent notification card and the PDF player card. Contacts no
// messenger and no Elite Prospects. Usage:
//   node scripts/preview-intake.js [out.pdf]
const fs = require("node:fs");
const { assessApplication } = require("../src/intake/assessment");
const { playerFeedback } = require("../src/intake/feedback");
const { cardFor } = require("../src/intake/notification-queue");
const { buildPlayerCardPdf } = require("../src/intake/player-card-pdf");

const now = new Date();
const application = {
  id: "00000000-0000-4000-8000-000000000000", reference_code: "EHA-000000-SAMPLE", player_name: "Sample Player (fictional)",
  birth_year: 2004, birth_date: "2004-05-20", position: "defense", stick_hand: "left", height_cm: 186, weight_kg: 84,
  citizenship: "Exampleland, Testonia", current_club: "Sample HC", elite_prospects_url: "https://www.eliteprospects.com/player/0/sample",
  video_urls: ["https://video.example/full-game"], source: { locale: "en" },
  profile: { citizenships: ["Exampleland", "Testonia"], currentLeague: "Hockeyettan", currentLevel: "t3", videoType: "full_game", goals: "Senior hockey in Europe",
    stats: [{ season: "2025/26", team: "Sample HC", league: "Hockeyettan", competition: "regular", gp: 36, g: 4, a: 13, pts: 17 }, { season: "2025/26", team: "Sample HC", league: "Hockeyettan", competition: "playoffs", gp: 5, g: 0, a: 2, pts: 2 }] },
};
application.assessment = assessApplication({
  position: application.position, birthYear: application.birth_year, birthDate: application.birth_date, currentClub: application.current_club,
  heightCm: application.height_cm, weightKg: application.weight_kg, videoUrls: application.video_urls, eliteProspectsUrl: application.elite_prospects_url, ...application.profile,
}, { now });
console.log("Internal assessment:", JSON.stringify(application.assessment, null, 2));
console.log("\nPlayer feedback:", JSON.stringify(playerFeedback(application, application.assessment, "en"), null, 2));
console.log("\nAgent card (sandbox, not sent):\n" + cardFor(application, { primaryUrl: "https://eurohockeyagency.com" }));
const out = process.argv[2];
if (out) buildPlayerCardPdf(application, { generatedAt: now }).then((pdf) => { fs.writeFileSync(out, pdf); console.log(`\nPDF written to ${out}`); });
