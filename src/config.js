const path = require("node:path");

// Only storage is required to accept an application. Captcha and notification
// channels are optional: each switches itself on as soon as its keys are set.
const REQUIRED_APPLICATION_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY"
];

function loadConfig(env = process.env) {
  const missingApplicationKeys = REQUIRED_APPLICATION_KEYS.filter((key) => !env[key]);
  return {
    port: Number(env.PORT || 3000),
    publicDir: path.join(__dirname, "..", "public"),
    siteUrl: (env.SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
    contactEmail: env.CONTACT_EMAIL || env.NOTIFICATION_EMAIL || "privacy@eurohockeyagency.com",
    privacyPolicyVersion: env.PRIVACY_POLICY_VERSION || "2026-07-18",
    supabaseUrl: env.SUPABASE_URL || "",
    supabaseSecretKey: env.SUPABASE_SECRET_KEY || "",
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || "",
    turnstileSecretKey: env.TURNSTILE_SECRET_KEY || "",
    turnstileExpectedHostname: env.TURNSTILE_EXPECTED_HOSTNAME || "",
    telegramBotToken: env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: env.TELEGRAM_CHAT_ID || "",
    resendApiKey: env.RESEND_API_KEY || "",
    resendFrom: env.RESEND_FROM || "",
    notificationEmail: env.NOTIFICATION_EMAIL || "",
    trustProxy: env.TRUST_PROXY === "true" || /^\d+$/.test(env.TRUST_PROXY || "")
      ? (env.TRUST_PROXY === "true" ? 1 : Number(env.TRUST_PROXY))
      : false,
    applicationConfigured: missingApplicationKeys.length === 0,
    missingApplicationKeys,
    turnstileConfigured: Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY),
    telegramConfigured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    emailConfigured: Boolean(env.RESEND_API_KEY && env.RESEND_FROM && env.NOTIFICATION_EMAIL)
  };
}

module.exports = { loadConfig, REQUIRED_APPLICATION_KEYS };
