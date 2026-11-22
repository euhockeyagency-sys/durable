// Telegram subscription to new confirmed club requests (/zaprosy-klubov, /club-needs).
//
// Flow: the player submits position, birth year and (optionally) an Elite
// Prospects link on the page -> the server stores a PENDING subscription with a
// one-time link token (only its SHA-256 hash is stored) and returns a t.me deep
// link -> the player opens the bot and presses Start -> Telegram calls our
// webhook with "/start <token>" -> the subscription becomes ACTIVE and is bound
// to that chat. "/stop" in the bot or the unsubscribe link from any message ends
// delivery. New confirmed requests are sent by notifyNewClubNeeds(), which
// records every delivery first, so a re-run never sends the same request twice.
//
// The feature is off unless config.clubNeedsSubscriptionsEnabled is true
// (separate subscriber bot token, bot username, webhook secret, storage and the
// explicit CLUB_NEEDS_SUBSCRIPTIONS=on switch). The bot token never leaves the
// server; the browser only ever sees the public deep link.

const crypto = require("node:crypto");
const { POSITIONS, COUNTRIES: COUNTRY_NAMES, currentNeeds } = require("./club-needs");

const POSITION_GROUPS = { G: ["G"], D: ["D"], F: ["F", "C", "W", "LW", "RW"] };
const TOKEN_TTL_MS = 30 * 60 * 1000;
const EP_RE = /^https:\/\/(www\.)?eliteprospects\.com\/player\/\d+(\/[A-Za-z0-9._~%-]*)?\/?$/;

const plus30 = (iso) => new Date(new Date(iso).getTime() + 30 * 24 * 3600 * 1000).toISOString();
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const newToken = () => crypto.randomBytes(24).toString("base64url");
// Unsubscribe links are signed, not stored: <subscription id>.<HMAC>. The key is
// derived from the server-side webhook secret, so a link cannot be forged and
// nothing reusable sits in the database.
const unsubKey = (secret) => crypto.createHash("sha256").update(`club-needs-unsubscribe:${secret}`).digest();
function unsubscribeToken(id, secret) {
  const mac = crypto.createHmac("sha256", unsubKey(secret)).update(String(id)).digest("base64url").slice(0, 32);
  return `${Buffer.from(String(id)).toString("base64url")}.${mac}`;
}
function verifyUnsubscribeToken(token, secret) {
  const m = /^([A-Za-z0-9_-]{1,80})\.([A-Za-z0-9_-]{32})$/.exec(String(token || ""));
  if (!m || !secret) return null;
  const id = Buffer.from(m[1], "base64url").toString();
  const expected = unsubscribeToken(id, secret).split(".")[1];
  return crypto.timingSafeEqual(Buffer.from(m[2]), Buffer.from(expected)) ? id : null;
}

const MSG = {
  ru: {
    position: "Выберите позицию.",
    birthYear: "Укажите год рождения четырьмя цифрами, например 2007.",
    ep: "Ссылка должна вести на профиль игрока на eliteprospects.com.",
    consent: "Подтвердите согласие на сообщения в Telegram.",
    invalid: "Проверьте поля формы.",
    off: "Подписка пока не работает. Отправьте профиль через форму.",
    failed: "Не удалось создать подписку. Попробуйте позже.",
    created: "Почти готово: откройте бота в Telegram и нажмите «Start», чтобы подтвердить подписку. Ссылка действует 30 минут.",
    unsubscribed: "Подписка отменена. Сообщения больше не придут.",
    unsubscribeInvalid: "Ссылка для отписки недействительна или уже использована.",
    botConfirmed: (pos, year) => `Подписка подтверждена: ${pos}, ${year} г. р. Мы пришлём новые подтверждённые запросы клубов по этой позиции. Отписаться: /stop`,
    botExpired: "Ссылка устарела или уже использована. Оформите подписку заново на странице запросов клубов.",
    botStopped: "Подписка отменена. Новые запросы приходить не будут.",
    botNone: "Активной подписки нет.",
    botHelp: "Подписка оформляется на странице запросов клубов EHA. Отписаться: /stop",
    need: (n, pos, country, url, unsub) => `Новый запрос клуба: ${pos}\n${country} · ${n.league} · ${n.season}\n${url}\n\nОтписаться: ${unsub}`,
  },
  en: {
    position: "Choose a position.",
    birthYear: "Enter a four-digit birth year, e.g. 2007.",
    ep: "The link must point to a player profile on eliteprospects.com.",
    consent: "Please agree to receive Telegram messages.",
    invalid: "Please check the form fields.",
    off: "Subscriptions are not available yet. Send your profile through the form.",
    failed: "The subscription could not be created. Please try again later.",
    created: "Almost done: open the bot in Telegram and press Start to confirm. The link is valid for 30 minutes.",
    unsubscribed: "You are unsubscribed. No more messages will be sent.",
    unsubscribeInvalid: "This unsubscribe link is invalid or already used.",
    botConfirmed: (pos, year) => `Subscription confirmed: ${pos}, born ${year}. We will send new confirmed club requests for this position. Unsubscribe: /stop`,
    botExpired: "This link has expired or was already used. Subscribe again on the club requests page.",
    botStopped: "You are unsubscribed. No new requests will be sent.",
    botNone: "There is no active subscription.",
    botHelp: "Subscribe on the EHA club requests page. Unsubscribe: /stop",
    need: (n, pos, country, url, unsub) => `New club request: ${pos}\n${country} · ${n.league} · ${n.season}\n${url}\n\nUnsubscribe: ${unsub}`,
  },
};

function validateSubscription(body, now) {
  const errors = {};
  const position = String(body.position || "").trim().toUpperCase();
  if (!POSITION_GROUPS[position]) errors.position = "position";
  const year = Number(String(body.birthYear || "").trim());
  const thisYear = now.getUTCFullYear();
  if (!Number.isInteger(year) || year < thisYear - 45 || year > thisYear - 12) errors.birthYear = "birthYear";
  const ep = String(body.eliteProspectsUrl || "").trim();
  if (ep && (ep.length > 300 || !EP_RE.test(ep))) errors.eliteProspectsUrl = "ep";
  const consent = body.consent === true || body.consent === "true" || body.consent === "on";
  if (!consent) errors.consent = "consent";
  return { errors, value: { position, birthYear: year, eliteProspectsUrl: ep || null } };
}

// Structured age filter on a club need: { from: 2004, to: 2007 } birth years.
function matchesNeed(sub, need) {
  if (!POSITION_GROUPS[sub.position] || !POSITION_GROUPS[sub.position].includes(need.position)) return false;
  const by = need.birthYears;
  if (by && typeof by === "object") {
    if (by.from && sub.birth_year < by.from) return false;
    if (by.to && sub.birth_year > by.to) return false;
  }
  return true;
}

// ---- storage ---------------------------------------------------------------
// Both stores expose the same small interface; the Supabase one is used in
// production, the memory one in tests (no network, no real data).

function createMemoryStore() {
  const subs = [];
  const deliveries = new Map();
  let seq = 0;
  return {
    subs, deliveries,
    async createPending(row) { const r = { id: `s${++seq}`, status: "pending", telegram_chat_id: null, ...row }; subs.push(r); return r; },
    async findPendingByTokenHash(hash) { return subs.find((s) => s.status === "pending" && s.link_token_hash === hash) || null; },
    async activate(id, chatId, nowIso) {
      // One active subscription per chat and position: re-registering replaces the old one.
      const target = subs.find((s) => s.id === id);
      for (const s of subs) if (s !== target && s.status === "active" && s.telegram_chat_id === chatId && s.position === target.position) { s.status = "replaced"; s.unsubscribed_at = nowIso; s.retention_until = plus30(nowIso); }
      Object.assign(target, { status: "active", telegram_chat_id: chatId, confirmed_at: nowIso, link_token_hash: null, retention_until: null });
      return target;
    },
    async unsubscribeByChat(chatId, nowIso) { let n = 0; for (const s of subs) if (s.status === "active" && s.telegram_chat_id === chatId) { s.status = "unsubscribed"; s.unsubscribed_at = nowIso; s.retention_until = plus30(nowIso); n += 1; } return n; },
    async unsubscribeById(id, nowIso) { const s = subs.find((x) => x.status === "active" && x.id === id); if (!s) return 0; s.status = "unsubscribed"; s.unsubscribed_at = nowIso; s.retention_until = plus30(nowIso); return 1; },
    async listActive() { return subs.filter((s) => s.status === "active"); },
    async claimDelivery(subscriptionId, needId) { const k = `${subscriptionId}|${needId}`; if (deliveries.has(k)) return false; deliveries.set(k, { status: "pending" }); return true; },
    async finishDelivery(subscriptionId, needId, status, error) { deliveries.set(`${subscriptionId}|${needId}`, { status, error: error || null }); },
  };
}

function createSupabaseStore(supabase) {
  const T = "club_need_subscriptions";
  const D = "club_need_deliveries";
  const one = async (q) => { const { data, error } = await q; if (error) throw new Error(error.message); return data; };
  return {
    async createPending(row) { return one(supabase.from(T).insert({ ...row, status: "pending" }).select("id").single()); },
    async findPendingByTokenHash(hash) {
      const rows = await one(supabase.from(T).select("*").eq("status", "pending").eq("link_token_hash", hash).limit(1));
      return rows[0] || null;
    },
    async activate(id, chatId, nowIso) {
      const target = (await one(supabase.from(T).select("position").eq("id", id).limit(1)))[0];
      await one(supabase.from(T).update({ status: "replaced", unsubscribed_at: nowIso, retention_until: plus30(nowIso) }).eq("status", "active").eq("telegram_chat_id", chatId).eq("position", target.position).neq("id", id));
      return (await one(supabase.from(T).update({ status: "active", telegram_chat_id: chatId, confirmed_at: nowIso, link_token_hash: null, retention_until: null }).eq("id", id).eq("status", "pending").select("*")))[0] || null;
    },
    async unsubscribeByChat(chatId, nowIso) { return (await one(supabase.from(T).update({ status: "unsubscribed", unsubscribed_at: nowIso, retention_until: plus30(nowIso) }).eq("status", "active").eq("telegram_chat_id", chatId).select("id"))).length; },
    async unsubscribeById(id, nowIso) { return (await one(supabase.from(T).update({ status: "unsubscribed", unsubscribed_at: nowIso, retention_until: plus30(nowIso) }).eq("status", "active").eq("id", id).select("id"))).length; },
    async listActive() { return one(supabase.from(T).select("*").eq("status", "active")); },
    async claimDelivery(subscriptionId, needId) {
      const { error } = await supabase.from(D).insert({ subscription_id: subscriptionId, need_id: needId, status: "pending" });
      if (!error) return true;
      if (error.code === "23505") return false; // already delivered or in progress
      throw new Error(error.message);
    },
    async finishDelivery(subscriptionId, needId, status, error) {
      await one(supabase.from(D).update({ status, error_message: error ? String(error).slice(0, 300) : null, finished_at: new Date().toISOString() }).eq("subscription_id", subscriptionId).eq("need_id", needId));
    },
  };
}

function createTelegramSender(token) {
  return async (chatId, text) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.description || `Telegram returned ${response.status}`);
  };
}

// ---- HTTP handlers ---------------------------------------------------------

function localeOf(req) { return req.body && req.body.locale === "en" ? "en" : "ru"; }

function createSubscribeHandler({ config, store, now }) {
  return async (req, res) => {
    const locale = localeOf(req);
    const m = MSG[locale];
    if (!config.clubNeedsSubscriptionsEnabled || !store) return res.status(503).json({ ok: false, message: m.off });
    if (req.body && req.body.website) return res.status(200).json({ ok: true, message: m.created, deepLink: null });
    const at = now();
    const { errors, value } = validateSubscription(req.body || {}, at);
    if (Object.keys(errors).length) {
      const fields = Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, m[v]]));
      return res.status(400).json({ ok: false, message: m.invalid, errors: fields });
    }
    const linkToken = newToken();
    try {
      await store.createPending({
        position: value.position,
        birth_year: value.birthYear,
        elite_prospects_url: value.eliteProspectsUrl,
        locale,
        consent_at: at.toISOString(),
        privacy_policy_version: config.privacyPolicyVersion || null,
        link_token_hash: sha256(linkToken),
        link_token_expires_at: new Date(at.getTime() + TOKEN_TTL_MS).toISOString(),
      });
    } catch (error) {
      console.error("club-needs subscribe failed:", error.message);
      return res.status(500).json({ ok: false, message: m.failed });
    }
    return res.status(201).json({ ok: true, message: m.created, deepLink: `https://t.me/${config.clubNeedsBotUsername}?start=${linkToken}` });
  };
}

function createUnsubscribeHandler({ config, store, now }) {
  return async (req, res) => {
    const locale = localeOf(req);
    const m = MSG[locale];
    if (!config.clubNeedsSubscriptionsEnabled || !store) return res.status(503).json({ ok: false, message: m.off });
    const id = verifyUnsubscribeToken((req.body && req.body.token) || "", config.clubNeedsWebhookSecret);
    if (!id) return res.status(400).json({ ok: false, message: m.unsubscribeInvalid });
    const n = await store.unsubscribeById(id, now().toISOString()).catch(() => -1);
    if (n < 0) return res.status(500).json({ ok: false, message: m.failed });
    if (n === 0) return res.status(404).json({ ok: false, message: m.unsubscribeInvalid });
    return res.json({ ok: true, message: m.unsubscribed });
  };
}

function createWebhookHandler({ config, store, send, now }) {
  return async (req, res) => {
    // Telegram echoes the secret set with setWebhook in this header.
    if (!config.clubNeedsSubscriptionsEnabled || !store) return res.sendStatus(404);
    const secret = req.get("X-Telegram-Bot-Api-Secret-Token") || "";
    const expected = config.clubNeedsWebhookSecret || "";
    if (!expected || secret.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) return res.sendStatus(401);
    res.sendStatus(200); // acknowledge first: Telegram retries slow webhooks
    const msg = req.body && req.body.message;
    if (!msg || !msg.chat || typeof msg.text !== "string" || msg.chat.type !== "private") return;
    const chatId = String(msg.chat.id);
    const text = msg.text.trim();
    const at = now();
    try {
      const start = text.match(/^\/start(?:@\w+)?(?:\s+([A-Za-z0-9_-]{20,64}))?$/);
      if (start && start[1]) {
        const pending = await store.findPendingByTokenHash(sha256(start[1]));
        const valid = pending && new Date(pending.link_token_expires_at).getTime() > at.getTime();
        if (!valid) return send(chatId, MSG.ru.botExpired);
        const sub = await store.activate(pending.id, chatId, at.toISOString());
        if (!sub) return send(chatId, MSG.ru.botExpired);
        const loc = sub.locale === "en" ? "en" : "ru";
        return send(chatId, MSG[loc].botConfirmed(POSITIONS[sub.position][loc], sub.birth_year));
      }
      if (/^\/stop(?:@\w+)?$/.test(text)) {
        const n = await store.unsubscribeByChat(chatId, at.toISOString());
        return send(chatId, n ? MSG.ru.botStopped : MSG.ru.botNone);
      }
      return send(chatId, MSG.ru.botHelp);
    } catch (error) {
      console.error("club-needs webhook failed:", error.message);
    }
  };
}

// ---- delivery --------------------------------------------------------------


async function notifyNewClubNeeds({ store, send, needs, now, siteUrl, secret, ruPrefix = "/ru", dryRun = false, log = () => {} }) {
  const list = currentNeeds(needs, now || new Date());
  const subs = await store.listActive();
  const stats = { needs: list.length, subscribers: subs.length, sent: 0, skipped: 0, failed: 0, matches: 0 };
  for (const need of list) {
    for (const sub of subs) {
      if (!matchesNeed(sub, need)) continue;
      stats.matches += 1;
      if (dryRun) { log(`would send ${need.id} -> ${sub.id}`); continue; }
      const claimed = await store.claimDelivery(sub.id, need.id);
      if (!claimed) { stats.skipped += 1; continue; }
      const loc = sub.locale === "en" ? "en" : "ru";
      const base = siteUrl.replace(/\/$/, "");
      const page = loc === "en" ? `${base}/club-needs#${need.id}` : `${base}${ruPrefix}/zaprosy-klubov#${need.id}`;
      const unsub = loc === "en" ? `${base}/club-needs?unsubscribe=${unsubscribeToken(sub.id, secret)}#subscribe` : `${base}${ruPrefix}/zaprosy-klubov?unsubscribe=${unsubscribeToken(sub.id, secret)}#subscribe`;
      const text = MSG[loc].need(need, POSITIONS[need.position][loc], COUNTRY_NAMES[need.countryCode][loc === "ru" ? 1 : 0], page, unsub);
      try {
        await send(sub.telegram_chat_id, text);
        await store.finishDelivery(sub.id, need.id, "sent");
        stats.sent += 1;
      } catch (error) {
        await store.finishDelivery(sub.id, need.id, "failed", error.message);
        stats.failed += 1;
      }
    }
  }
  return stats;
}

// ---- page block --------------------------------------------------------------

const FORM = {
  ru: { title: "Получать новые запросы по моей позиции в Telegram", intro: "Укажите позицию и год рождения — бот пришлёт только новые подтверждённые запросы клубов, которые им подходят. Имя и телефон не нужны.", position: "Позиция", choose: "Выберите", G: "Вратарь", D: "Защитник", F: "Нападающий", year: "Год рождения", ep: "Профиль Elite Prospects (если есть)", consent: "Согласен получать сообщения EHA в Telegram о новых запросах клубов и на хранение указанных данных по", privacy: "политике конфиденциальности", submit: "Получить ссылку на бота", unsubTitle: "Отписаться", unsubText: "Отправьте боту команду /stop или нажмите кнопку ниже, если вы перешли по ссылке для отписки из сообщения.", unsubBtn: "Отписаться от рассылки" },
  en: { title: "Get new requests for my position on Telegram", intro: "Enter your position and birth year — the bot sends only new club-confirmed requests that match. No name or phone needed.", position: "Position", choose: "Choose", G: "Goaltender", D: "Defence", F: "Forward", year: "Birth year", ep: "Elite Prospects profile (if you have one)", consent: "I agree to receive EHA Telegram messages about new club requests and to the storage of these details under the", privacy: "privacy policy", submit: "Get the bot link", unsubTitle: "Unsubscribe", unsubText: "Send /stop to the bot, or use the button below if you opened the unsubscribe link from a message.", unsubBtn: "Unsubscribe" },
};

function renderSubscriptionBlock(locale) {
  const f = FORM[locale === "en" ? "en" : "ru"];
  const loc = locale === "en" ? "en" : "ru";
  return `<section class="club-needs-subscribe" id="subscribe" aria-labelledby="club-needs-subscribe-title"><h2 id="club-needs-subscribe-title">${f.title}</h2><p>${f.intro}</p>` +
    `<form class="club-needs-subscribe-form" data-locale="${loc}" novalidate><div class="two"><label>${f.position}<select name="position" required><option value="">${f.choose}</option><option value="G">${f.G}</option><option value="D">${f.D}</option><option value="F">${f.F}</option></select></label>` +
    `<label>${f.year}<input name="birthYear" type="number" inputmode="numeric" min="1980" max="2020" required></label></div>` +
    `<label>${f.ep}<input name="eliteProspectsUrl" type="url" placeholder="https://www.eliteprospects.com/player/…"></label>` +
    `<input class="honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">` +
    `<label class="consent"><input name="consent" type="checkbox" required> <span>${f.consent} <a href="/privacy">${f.privacy}</a>.</span></label>` +
    `<button class="btn primary" type="submit">${f.submit}</button><p class="form-status" role="status" aria-live="polite"></p></form>` +
    `<div class="club-needs-unsubscribe"><h3>${f.unsubTitle}</h3><p>${f.unsubText}</p><button class="btn" type="button" data-unsubscribe hidden>${f.unsubBtn}</button><p class="form-status" role="status" aria-live="polite"></p></div>` +
    `<script src="/assets/club-needs-subscribe.js?v=1" defer></script></section>`;
}

module.exports = {
  POSITION_GROUPS, TOKEN_TTL_MS, sha256, unsubscribeToken, verifyUnsubscribeToken, validateSubscription, matchesNeed,
  createMemoryStore, createSupabaseStore, createTelegramSender,
  createSubscribeHandler, createUnsubscribeHandler, createWebhookHandler,
  notifyNewClubNeeds, renderSubscriptionBlock,
};
