const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

function createServices(config) {
  const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

  return {
    supabase,
    async verifyTurnstile({ token, ip, idempotencyKey }) {
      const body = new URLSearchParams({
        secret: config.turnstileSecretKey,
        response: token,
        idempotency_key: idempotencyKey
      });
      if (ip) body.set("remoteip", ip);
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body,
        signal: AbortSignal.timeout(10_000)
      });
      if (!response.ok) throw new Error(`Turnstile returned ${response.status}`);
      const result = await response.json();
      if (result.success && config.turnstileExpectedHostname && result.hostname !== config.turnstileExpectedHostname) {
        return { success: false, errorCodes: ["hostname-mismatch"] };
      }
      if (result.success && result.action !== "profile_application") {
        return { success: false, errorCodes: ["action-mismatch"] };
      }
      return { success: Boolean(result.success), errorCodes: result["error-codes"] || [] };
    },
    async sendEmail(application) {
      if (!resend) throw new Error("Resend is not configured");
      const result = await resend.emails.send({
        from: config.resendFrom,
        to: [config.notificationEmail],
        replyTo: application.email || undefined,
        subject: `Новая заявка ${application.reference_code}: ${application.player_name}`,
        text: notificationText(application)
      }, { idempotencyKey: `application-${application.id}-email` });
      if (result.error) throw new Error(result.error.message || "Resend delivery failed");
      return result.data?.id || null;
    },
    async sendTelegram(application) {
      const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: notificationText(application),
          disable_web_page_preview: true
        }),
        signal: AbortSignal.timeout(10_000)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.description || `Telegram returned ${response.status}`);
      return String(result.result?.message_id || "") || null;
    }
  };
}

function notificationText(a) {
  const position = { forward: "Нападающий", defense: "Защитник", goalie: "Вратарь" }[a.position] || a.position;
  return [
    `Новая заявка ${a.reference_code}`,
    `Игрок: ${a.player_name}, ${a.birth_year}`,
    `Позиция: ${position}; ${a.height_cm} см / ${a.weight_kg} кг`,
    `Гражданство: ${a.citizenship}`,
    `Клуб: ${a.current_club}`,
    `Контакт: ${a.phone}${a.email ? `; ${a.email}` : ""}`,
    `Elite Prospects: ${a.elite_prospects_url}`,
    ...(a.video_urls || []).map((url, index) => `Видео ${index + 1}: ${url}`),
    a.is_minor ? `Родитель: ${a.parent_name}; ${a.parent_contact}` : null,
    a.message ? `Комментарий: ${a.message}` : null
  ].filter(Boolean).join("\n");
}

module.exports = { createServices, notificationText };
