// Inline buttons under the agent's Telegram card (owner request 25.11.2026):
// one tap opens a WhatsApp chat with the player — or, for a minor, with the
// parent — and a second button opens the chat with the "please send the
// missing details" text already typed. Same rules as the admin panel
// (src/admin-view.js), so both places link to the same person and text.
const { waNumber, missingFields, requestMessage, contactTargets } = require("../admin-view");

function telegramButtons(application, config = {}) {
  const rows = [];
  const target = contactTargets(application);
  const wa = waNumber(target.phone);
  if (wa) {
    rows.push([{ text: target.parent ? "WhatsApp родителю" : "WhatsApp игроку", url: `https://wa.me/${wa}` }]);
    const missing = missingFields(application);
    if (missing.length) {
      const message = requestMessage(application, missing);
      rows.push([{ text: "Запросить недостающее в WhatsApp", url: `https://wa.me/${wa}?text=${encodeURIComponent(message.text)}` }]);
    }
  }
  const base = String(config.primaryUrl || "").replace(/\/$/, "");
  if (/^https:\/\//.test(base) && application.id) rows.push([{ text: "Открыть в панели", url: `${base}/admin/applications/${application.id}` }]);
  return rows.length ? { inline_keyboard: rows } : null;
}

// Contact lines for the card text (the card did not show them before).
function contactLines(application) {
  const target = contactTargets(application);
  const lines = [];
  if (target.parent) {
    lines.push(`Родитель: ${application.parent_name || "имя не указано"}, ${application.parent_contact}`);
    const own = [application.phone, application.email].filter(Boolean).join(" · ");
    if (own) lines.push(`Контакт игрока: ${own}`);
  } else {
    const own = [application.phone, application.email].filter(Boolean).join(" · ");
    lines.push(`Контакт: ${own || "не указан"}`);
  }
  return lines;
}

module.exports = { telegramButtons, contactLines };
