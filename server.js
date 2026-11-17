const { createApp } = require("./src/app");
const { loadConfig } = require("./src/config");
const { createServices } = require("./src/services");
const { retryDue } = require("./src/intake/notification-queue");

const config = loadConfig(process.env);
const services = config.applicationConfigured || config.clubRequestConfigured ? createServices(config) : null;
const app = createApp({ config, services });

// Retry failed agent notifications every 2 minutes (backoff is per row).
if (services && config.applicationConfigured) {
  setInterval(() => {
    retryDue(services, config).catch((error) => console.error("Notification retry run failed", error.message));
  }, 2 * 60 * 1000).unref();
}

app.listen(config.port, "0.0.0.0", () => {
  const state = config.applicationConfigured ? "enabled" : "disabled (missing environment variables)";
  console.log(`Euro Hockey Agency listening on port ${config.port}; applications ${state}`);
  const channels = [
    config.emailConfigured ? `email -> ${config.notificationEmail}` : null,
    config.telegramConfigured ? "telegram" : null,
    config.whatsappConfigured ? "whatsapp" : null
  ].filter(Boolean);
  if (config.notifyMode === "sandbox") console.log("NOTIFY_MODE=sandbox: notifications are recorded, not sent.");
  console.log(`Elite Prospects API: ${config.eliteProspectsConfigured ? "configured" : "not configured (manual entry)"}`);
  if (channels.length) console.log(`Application notifications: ${channels.join(", ")}`);
  else if (config.applicationConfigured) {
    console.error("WARNING: no notification channel configured — applications will be stored but nobody will be notified. Set RESEND_API_KEY.");
  }
});
