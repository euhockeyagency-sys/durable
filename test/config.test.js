const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig, DEFAULT_RESEND_FROM } = require("../src/config");

const storage = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test"
};

test("an API key alone is enough to enable email notifications", () => {
  const config = loadConfig({
    ...storage,
    CONTACT_EMAIL: "agent@example.com",
    RESEND_API_KEY: "re_test"
  });
  assert.equal(config.emailConfigured, true);
  assert.equal(config.notificationEmail, "agent@example.com");
  assert.equal(config.resendFrom, DEFAULT_RESEND_FROM);
  assert.equal(config.clubRequestConfigured, false);
});

test("club request notifications require both email and Telegram", () => {
  const config = loadConfig({
    ...storage,
    CONTACT_EMAIL: "agent@example.com",
    RESEND_API_KEY: "re_test",
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_CHAT_ID: "123"
  });
  assert.equal(config.clubRequestConfigured, true);
});

test("NOTIFICATION_EMAIL overrides the public contact address", () => {
  const config = loadConfig({
    ...storage,
    CONTACT_EMAIL: "privacy@example.com",
    NOTIFICATION_EMAIL: "applications@example.com",
    RESEND_FROM: "EHA <mail@example.com>",
    RESEND_API_KEY: "re_test"
  });
  assert.equal(config.notificationEmail, "applications@example.com");
  assert.equal(config.contactEmail, "privacy@example.com");
  assert.equal(config.resendFrom, "EHA <mail@example.com>");
});

test("email stays off without an API key", () => {
  const config = loadConfig({ ...storage, CONTACT_EMAIL: "agent@example.com" });
  assert.equal(config.emailConfigured, false);
});

test("email stays off when there is no address to send to", () => {
  const config = loadConfig({ ...storage, RESEND_API_KEY: "re_test" });
  assert.equal(config.emailConfigured, false);
  assert.equal(config.notificationEmail, "");
});

test("consolidated model: English at the primary root, Russian under /ru/", () => {
  const config = loadConfig({ ...storage });
  // Safe default is the live domain, so a deploy is correct before .env changes.
  assert.equal(config.primaryUrl, "https://eurohockeyagency.com");
  assert.equal(config.primaryHost, "eurohockeyagency.com");
  assert.equal(config.enUrl, "https://eurohockeyagency.com");
  assert.equal(config.ruUrl, "https://eurohockeyagency.com/ru");
  assert.equal(config.ruPrefix, "/ru");
  assert.equal(config.legacyRuHost, "eurohockeyagency.ru");
});

test("PRIMARY_URL overrides the primary domain and derives the /ru base", () => {
  const config = loadConfig({ ...storage, PRIMARY_URL: "https://example.test/" });
  assert.equal(config.enUrl, "https://example.test");
  assert.equal(config.ruUrl, "https://example.test/ru");
  assert.equal(config.primaryHost, "example.test");
});
