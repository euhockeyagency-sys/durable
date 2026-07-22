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
