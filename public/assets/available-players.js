/* "Available players" showcase on /for-clubs (EN/RU).
   Add a player ONLY after the player (and, for a minor, the legal guardian)
   has agreed to public display of these fields. No names, photos, dates of
   birth, contacts or links: clubs request the full profile from EHA.

   Fields per player:
     code         EHA reference shown on the card and sent in the WhatsApp request, e.g. "EHA-F-0123"
     position     "C" | "LW" | "RW" | "D" | "G"
     hand         "L" | "R"  (shoots / catches)
     age          age category, e.g. "U20", "Senior"
     passport     "EU" | "non-EU" | "other" (+ passportNote for a short status, e.g. "Swiss licence")
     lastLeague   last league played, e.g. "Mestis"
     available    confirmed availability, e.g. { en: "from 1 Dec 2026", ru: "с 1 декабря 2026" }
     confirmed    ISO date EHA last confirmed availability with the player
*/
(function (root) {
  "use strict";
  var DATA = { updated: "2026-11-18", players: [] };
  if (typeof module !== "undefined" && module.exports) module.exports = DATA;
  else root.EHA_AVAILABLE_PLAYERS = DATA;
})(typeof window !== "undefined" ? window : this);
