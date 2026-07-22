const { createApp } = require("./src/app");
const { loadConfig } = require("./src/config");

const config = loadConfig(process.env);
const app = createApp({ config });

app.listen(config.port, "0.0.0.0", () => {
  const state = config.applicationConfigured ? "enabled" : "disabled (missing environment variables)";
  console.log(`Euro Hockey Agency listening on port ${config.port}; applications ${state}`);
  const channels = [
    config.emailConfigured ? `email -> ${config.notificationEmail}` : null,
    config.telegramConfigured ? "telegram" : null
  ].filter(Boolean);
  if (channels.length) console.log(`Application notifications: ${channels.join(", ")}`);
  else if (config.applicationConfigured) {
    console.error("WARNING: no notification channel configured — applications will be stored but nobody will be notified. Set RESEND_API_KEY.");
  }
});
