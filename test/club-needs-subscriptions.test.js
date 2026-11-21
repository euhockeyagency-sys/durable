"use strict";

// Telegram subscription to club requests: all on an in-memory store and a fake
// Telegram sender — no Supabase, no real bot, no real players.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");
const subs = require("../src/club-needs-subscriptions");

const PUBLIC = path.join(__dirname, "..", "public");
const base = "https://eha.test";
const SECRET = "test_webhook_secret_0123456789abcdef";
const NOW = new Date("2026-11-21T10:00:00Z");
const baseConfig = { port: 0, publicDir: PUBLIC, siteUrl: base, primaryUrl: base, primaryHost: "eha.test", enUrl: base, ruUrl: `${base}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "p@eha.test", privacyPolicyVersion: "t", trustProxy: false, applicationConfigured: false, missingApplicationKeys: [] };

function setup({ enabled = true, clock } = {}) {
  const store = subs.createMemoryStore();
  const sent = [];
  let t = clock || NOW;
  const config = { ...baseConfig, clubNeedsSubscriptionsEnabled: enabled, clubNeedsBotUsername: "eha_needs_test_bot", clubNeedsWebhookSecret: SECRET, clubNeedsBotToken: "" };
  const app = createApp({ config, now: () => t, services: { clubNeedsStore: store, sendSubscriberTelegram: async (chatId, text) => { sent.push({ chatId, text }); } } });
  return { app, store, sent, setNow: (d) => { t = d; } };
}
const host = (r) => r.set("Host", "eha.test");
const subscribe = (app, body) => host(request(app).post("/api/club-needs/subscribe")).send({ locale: "ru", position: "D", birthYear: "2007", consent: true, ...body });
const webhook = (app, text, chatId = 111, secret = SECRET) => host(request(app).post("/api/telegram/club-needs-webhook")).set("X-Telegram-Bot-Api-Secret-Token", secret).send({ message: { chat: { id: chatId, type: "private" }, text } });
const tokenOf = (deepLink) => new URL(deepLink).searchParams.get("start");
const tick = () => new Promise((r) => setImmediate(r));
const need = (over) => ({ id: "2026-11-pl-1liga-d", status: "open", publish: true, countryCode: "PL", league: "1 Liga", season: "2026/27", position: "D", age: null, importStatus: null, conditions: null, lastChecked: "2026-11-20", validUntil: "2026-12-31", ...over });

test("form stays hidden and the API is off until the subscription is configured", async () => {
  const { app } = setup({ enabled: false });
  const page = await host(request(app).get("/ru/zaprosy-klubov")).expect(200);
  assert.doesNotMatch(page.text, /club-needs-subscribe/);
  const res = await subscribe(app, {}).expect(503);
  assert.match(res.body.message, /пока не работает/);
  await webhook(app, "/start x").expect(404);
});

test("form renders in Russian when enabled", async () => {
  const { app } = setup();
  const page = await host(request(app).get("/ru/zaprosy-klubov")).expect(200);
  assert.match(page.text, /Получать новые запросы по моей позиции в Telegram/);
  assert.match(page.text, /name="birthYear"/);
  assert.match(page.text, /href="\/ru\/privacy"/);
  assert.doesNotMatch(page.text, /eha_needs_test_bot|test_webhook_secret/, "no bot name or secret in HTML");
});

test("server validation returns Russian field errors", async () => {
  const { app } = setup();
  const res = await subscribe(app, { position: "X", birthYear: "07", eliteProspectsUrl: "https://example.com/p", consent: false }).expect(400);
  assert.deepEqual(Object.keys(res.body.errors).sort(), ["birthYear", "consent", "eliteProspectsUrl", "position"]);
  assert.match(res.body.errors.birthYear, /год рождения/);
});

test("subscribe → Start in Telegram activates; token is one-time and stored only as a hash", async () => {
  const { app, store, sent } = setup();
  const res = await subscribe(app, { eliteProspectsUrl: "https://www.eliteprospects.com/player/123456/test-player" }).expect(201);
  const token = tokenOf(res.body.deepLink);
  assert.ok(res.body.deepLink.startsWith("https://t.me/eha_needs_test_bot?start="));
  assert.ok(!JSON.stringify(store.subs).includes(token), "plain token is not stored");
  await webhook(app, `/start ${token}`).expect(200); await tick();
  assert.equal(store.subs[0].status, "active");
  assert.equal(store.subs[0].telegram_chat_id, "111");
  assert.match(sent.at(-1).text, /Подписка подтверждена: Защитник, 2007/);
  await webhook(app, `/start ${token}`, 222).expect(200); await tick();
  assert.match(sent.at(-1).text, /устарела или уже использована/);
  assert.equal(store.subs.filter((s) => s.status === "active").length, 1);
});

test("expired link and wrong webhook secret are rejected", async () => {
  const { app, store, sent, setNow } = setup();
  const res = await subscribe(app, {}).expect(201);
  await webhook(app, `/start ${tokenOf(res.body.deepLink)}`, 111, "wrong_secret_wrong_secret_wrong_12").expect(401);
  setNow(new Date(NOW.getTime() + 31 * 60 * 1000));
  await webhook(app, `/start ${tokenOf(res.body.deepLink)}`).expect(200); await tick();
  assert.equal(store.subs[0].status, "pending");
  assert.match(sent.at(-1).text, /устарела/);
});

test("re-registering the same chat and position keeps one active subscription", async () => {
  const { app, store } = setup();
  for (let i = 0; i < 2; i += 1) {
    const res = await subscribe(app, { birthYear: String(2006 + i) }).expect(201);
    await webhook(app, `/start ${tokenOf(res.body.deepLink)}`).expect(200); await tick();
  }
  const active = store.subs.filter((s) => s.status === "active");
  assert.equal(active.length, 1);
  assert.equal(active[0].birth_year, 2007);
});

test("delivery: matching position and birth year only, no duplicates on re-run, /stop ends delivery", async () => {
  const { app, store } = setup();
  const join = async (chat, body) => { const r = await subscribe(app, body).expect(201); await webhook(app, `/start ${tokenOf(r.body.deepLink)}`, chat).expect(200); await tick(); };
  await join(1, { position: "D", birthYear: "2006" });
  await join(2, { position: "D", birthYear: "2001" }); // outside birth years
  await join(3, { position: "F", birthYear: "2006" }); // wrong position
  await join(4, { position: "G", birthYear: "2006" });
  const sent = [];
  const send = async (chatId, text) => { sent.push({ chatId, text }); };
  const needs = [need({ birthYears: { from: 2004, to: 2007 } }), need({ id: "2026-11-old-closed", status: "closed" })];
  const opts = { store, send, needs, now: NOW, siteUrl: base, secret: SECRET };
  const first = await subs.notifyNewClubNeeds(opts);
  assert.equal(first.sent, 1);
  assert.deepEqual(sent.map((s) => s.chatId), ["1"]);
  assert.match(sent[0].text, /Новый запрос клуба: Защитник/);
  assert.match(sent[0].text, /https:\/\/eha\.test\/ru\/zaprosy-klubov#2026-11-pl-1liga-d/);
  const again = await subs.notifyNewClubNeeds(opts);
  assert.equal(again.sent, 0); assert.equal(again.skipped, 1); assert.equal(sent.length, 1);
  await webhook(app, "/stop", 1).expect(200); await tick();
  const after = await subs.notifyNewClubNeeds({ ...opts, needs: [need({ id: "2026-12-new-d" })] });
  // No birth-year filter on this request: only the remaining defenceman (chat 2) gets it; chat 1 unsubscribed.
  assert.equal(after.sent, 1);
  assert.equal(sent.at(-1).chatId, "2");
  assert.ok(!sent.slice(1).some((s) => s.chatId === "1"));
});

test("forwards are matched to the forward group (C/W/LW/RW)", () => {
  const sub = { position: "F", birth_year: 2005 };
  for (const p of ["F", "C", "W", "LW", "RW"]) assert.ok(subs.matchesNeed(sub, need({ position: p })), p);
  assert.ok(!subs.matchesNeed(sub, need({ position: "D" })));
});

test("unsubscribe link from a message works once and cannot be forged", async () => {
  const { app, store } = setup();
  const r = await subscribe(app, {}).expect(201);
  await webhook(app, `/start ${tokenOf(r.body.deepLink)}`).expect(200); await tick();
  const id = store.subs[0].id;
  const good = subs.unsubscribeToken(id, SECRET);
  const forged = subs.unsubscribeToken(id, "another_secret_another_secret_000000");
  await host(request(app).post("/api/club-needs/unsubscribe")).send({ token: forged }).expect(400);
  const ok = await host(request(app).post("/api/club-needs/unsubscribe")).send({ token: good, locale: "ru" }).expect(200);
  assert.match(ok.body.message, /Подписка отменена/);
  assert.equal(store.subs[0].status, "unsubscribed");
  await host(request(app).post("/api/club-needs/unsubscribe")).send({ token: good }).expect(404);
});
