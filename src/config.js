const path = require("node:path");

// Only storage is required to accept an application. Captcha and notification
// channels are optional: each switches itself on as soon as its keys are set.
const REQUIRED_APPLICATION_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY"
];

// Resend's shared test sender. It may only deliver to the address the Resend
// account was registered with, which is exactly our notification recipient, so
// it works with zero DNS setup. Replace it with RESEND_FROM on a verified
// domain once eurohockeyagency.ru has the DKIM/SPF records.
const DEFAULT_RESEND_FROM = "EHA Website <onboarding@resend.dev>";

function loadConfig(env = process.env) {
  const missingApplicationKeys = REQUIRED_APPLICATION_KEYS.filter((key) => !env[key]);
  const siteUrl = (env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  // Two-domain mode activates only when both language hosts are set. Until then
  // the site runs on one domain with English under /en/. Keeping both hosts
  // optional lets the same build ship before and after the domain split.
  const ruHost = (env.RU_HOST || "").trim().toLowerCase();
  const enHost = (env.EN_HOST || "").trim().toLowerCase();
  const hostsConfigured = Boolean(ruHost && enHost);
  // The agent's own address is the single source of truth for where mail goes:
  // NOTIFICATION_EMAIL only has to be set when notifications should land
  // somewhere other than the public contact address.
  const contactEmail = env.CONTACT_EMAIL || env.NOTIFICATION_EMAIL || "privacy@eurohockeyagency.com";
  const notificationEmail = env.NOTIFICATION_EMAIL || env.CONTACT_EMAIL || "";
  const resendFrom = env.RESEND_FROM || DEFAULT_RESEND_FROM;
  const telegramConfigured = Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);
  const emailConfigured = Boolean(env.RESEND_API_KEY && resendFrom && notificationEmail);
  return {
    port: Number(env.PORT || 3000),
    publicDir: path.join(__dirname, "..", "public"),
    siteUrl,
    ruHost,
    enHost,
    hostsConfigured,
    ruUrl: ruHost ? `https://${ruHost}` : siteUrl,
    enUrl: enHost ? `https://${enHost}` : siteUrl,
    contactEmail,
    privacyPolicyVersion: env.PRIVACY_POLICY_VERSION || "2026-07-18",
    supabaseUrl: env.SUPABASE_URL || "",
    supabaseSecretKey: env.SUPABASE_SECRET_KEY || "",
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || "",
    turnstileSecretKey: env.TURNSTILE_SECRET_KEY || "",
    turnstileExpectedHostname: env.TURNSTILE_EXPECTED_HOSTNAME || "",
    telegramBotToken: env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: env.TELEGRAM_CHAT_ID || "",
    resendApiKey: env.RESEND_API_KEY || "",
    resendFrom,
    notificationEmail,
    trustProxy: env.TRUST_PROXY === "true" || /^\d+$/.test(env.TRUST_PROXY || "")
      ? (env.TRUST_PROXY === "true" ? 1 : Number(env.TRUST_PROXY))
      : false,
    applicationConfigured: missingApplicationKeys.length === 0,
    missingApplicationKeys,
    turnstileConfigured: Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY),
    telegramConfigured,
    emailConfigured,
    // Club requests are notification-only (no database fallback), so both
    // channels must be available before the public form is enabled.
    clubRequestConfigured: telegramConfigured && emailConfigured
  };
}

module.exports = { loadConfig, REQUIRED_APPLICATION_KEYS, DEFAULT_RESEND_FROM };
