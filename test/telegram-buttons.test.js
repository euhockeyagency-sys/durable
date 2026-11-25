const test = require("node:test");
const assert = require("node:assert/strict");
const { telegramButtons, contactLines } = require("../src/intake/telegram-buttons");
const { deliverApplication, cardFor } = require("../src/intake/notification-queue");

// Fictional applicants only.
const minor = {
  id: "11111111-2222-3333-4444-555555555555", reference_code: "EHA-202611-ABC123", player_name: "Ivan Testov", birth_year: 2011,
  is_minor: true, position: "forward", phone: "+48 600 000 001", email: "player@example.test",
  parent_name: "Petr Testov", parent_contact: "+48 600 000 002", citizenship: "", current_club: "", video_urls: [], elite_prospects_url: ""
};
const adult = { ...minor, id: "66666666-7777-8888-9999-000000000000", is_minor: false, birth_year: 2001, parent_name: null, parent_contact: null, citizenship: "Poland", current_club: "Club", video_urls: ["https://youtu.be/x"], elite_prospects_url: "https://www.eliteprospects.com/player/1/x" };
const config = { primaryUrl: "https://eurohockeyagency.com" };

test("minor: buttons go to the parent, with a prefilled request for missing details", () => {
  const rows = telegramButtons(minor, config).inline_keyboard.flat();
  assert.equal(rows[0].text, "WhatsApp родителю");
  assert.equal(rows[0].url, "https://wa.me/48600000002");
  assert.ok(rows[1].url.startsWith("https://wa.me/48600000002?text="));
  const text = decodeURIComponent(rows[1].url.split("text=")[1]);
  assert.ok(text.includes("EHA-202611-ABC123") && text.includes("гражданство"));
  assert.equal(rows[2].url, `https://eurohockeyagency.com/admin/applications/${minor.id}`);
});

test("adult with complete profile: player WhatsApp and panel, no request button", () => {
  const rows = telegramButtons(adult, config).inline_keyboard.flat();
  assert.deepEqual(rows.map((b) => b.text), ["WhatsApp игроку", "Открыть в панели"]);
  assert.equal(rows[0].url, "https://wa.me/48600000001");
});

test("no phone and no https base: no buttons", () => {
  assert.equal(telegramButtons({ ...adult, phone: "" }, { primaryUrl: "http://localhost" }), null);
});

test("card text shows contacts; Telegram gets the buttons", async () => {
  const card = cardFor(minor, config);
  assert.ok(card.includes("Родитель: Petr Testov, +48 600 000 002"));
  assert.ok(contactLines(adult)[0].startsWith("Контакт: +48 600 000 001"));
  const calls = [];
  const services = {
    supabase: { from: () => ({ insert: async () => ({}), update: () => ({ eq: async () => ({}) }) }) },
    async sendTelegram(app, text, markup) { calls.push(markup); return "tg"; },
    async sendEmail() { return "em"; }
  };
  await deliverApplication(services, minor, { ...config, telegramConfigured: true, emailConfigured: false });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].inline_keyboard[0][0].url, "https://wa.me/48600000002");
});
