// Delivery queue for agent notifications. The per-channel audit table
// application_notifications is the queue: unique (application_id, channel)
// prevents duplicate deliveries, failed rows carry attempts/next_attempt_at
// and are retried with backoff, and the application is already stored before
// anything is sent (a messenger outage never loses an application).
//
// NOTIFY_MODE=sandbox records what would be sent (status "sandboxed") without
// contacting any messenger: used before real delivery is switched on.
const { agentCard } = require("./agent-card");
const { telegramButtons, contactLines } = require("./telegram-buttons");

const BACKOFF_MIN = [1, 5, 30, 120];
const MAX_ATTEMPTS = BACKOFF_MIN.length + 1;

function channelsFor(config) {
  const list = [];
  if (config.telegramConfigured !== false) list.push("telegram");
  if (config.emailConfigured !== false) list.push("email");
  if (config.whatsappConfigured) list.push("whatsapp");
  return list;
}

function cardFor(application, config) {
  const base = String(config.primaryUrl || "").replace(/\/$/, "");
  const pdfStatus = application.pdf_generated_at ? `готов (${application.pdf_generated_at.slice(0, 16).replace("T", " ")})` : "не создан";
  const card = agentCard(application, { adminUrl: base ? `${base}/admin/applications/${application.id}` : null, pdfStatus });
  // Contact lines go right after the player line so the agent sees who to call.
  const lines = card.split("\n");
  lines.splice(2, 0, ...contactLines(application));
  return lines.join("\n");
}

async function sendOne(services, channel, application, text, config = {}) {
  if (channel === "telegram") return services.sendTelegram(application, text, telegramButtons(application, config));
  if (channel === "email") return services.sendEmail(application, text);
  if (channel === "whatsapp") return services.sendWhatsApp(application, text);
  throw new Error(`unknown channel ${channel}`);
}

function nextAttempt(now, attempts) {
  if (attempts >= MAX_ATTEMPTS) return null;
  return new Date(now.getTime() + BACKOFF_MIN[Math.min(attempts - 1, BACKOFF_MIN.length - 1)] * 60_000).toISOString();
}

async function record(services, row, existing) {
  try {
    const result = existing
      ? await services.supabase.from("application_notifications").update(row).eq("id", existing.id)
      : await services.supabase.from("application_notifications").insert(row);
    if (result && result.error) console.error(`${row.channel} notification audit failed`, result.error.message);
  } catch (error) {
    console.error(`${row.channel} notification audit failed`, error.message);
  }
}

// First delivery right after an application is stored.
async function deliverApplication(services, application, config = {}, { now = () => new Date() } = {}) {
  const channels = channelsFor(config);
  if (!channels.length) {
    console.error(`No notification channel is configured — application ${application.reference_code} was stored but not delivered. Set RESEND_API_KEY (email) or TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (Telegram).`);
    return [];
  }
  const text = cardFor(application, config);
  return Promise.all(channels.map((channel) => attempt(services, application, channel, text, config, now, null)));
}

async function attempt(services, application, channel, text, config, now, existing) {
  const attempts = (existing ? existing.attempts || 1 : 0) + 1;
  let status = "sent"; let providerId = null; let errorMessage = null; let next = null;
  if (config.notifyMode === "sandbox") {
    status = "sandboxed"; providerId = "sandbox";
  } else {
    try {
      providerId = await sendOne(services, channel, application, text, config);
    } catch (error) {
      errorMessage = String(error.message || error).slice(0, 1000);
      next = nextAttempt(now(), attempts);
      status = next ? "failed" : "abandoned";
      console.error(`${channel} notification failed for ${application.reference_code} (attempt ${attempts}; application is stored)`, errorMessage);
    }
  }
  const row = { application_id: application.id, channel, status, provider_id: providerId, error_message: errorMessage, attempted_at: now().toISOString(), attempts, next_attempt_at: next };
  await record(services, row, existing);
  return { channel, status, attempts, text: config.notifyMode === "sandbox" ? text : undefined };
}

// Retries due failed deliveries. Called periodically by server.js and from the
// admin panel. Rows already sent/sandboxed are never resent.
async function retryDue(services, config = {}, { now = () => new Date(), limit = 20 } = {}) {
  const { data, error } = await services.supabase.from("application_notifications")
    .select("id, application_id, channel, status, attempts, next_attempt_at")
    .eq("status", "failed")
    .lte("next_attempt_at", now().toISOString())
    .limit(limit);
  if (error) { console.error("Notification retry query failed", error.message); return []; }
  const results = [];
  for (const row of data || []) {
    const { data: application, error: appError } = await services.supabase.from("applications").select("*").eq("id", row.application_id).maybeSingle();
    if (appError || !application) continue;
    results.push(await attempt(services, application, row.channel, cardFor(application, config), config, now, row));
  }
  return results;
}

module.exports = { deliverApplication, retryDue, cardFor, channelsFor, MAX_ATTEMPTS };
