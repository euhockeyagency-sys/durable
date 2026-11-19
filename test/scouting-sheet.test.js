const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../src/app");
const { renderSheet, embedUrl, createScoutingClient, BOT_UA } = require("../src/scouting-sheet");

const TOKEN = "abcdefghijklmnopqrstuvwx_-12";
const NOW = new Date("2026-11-19T12:00:00Z");

function config(overrides = {}) {
  const primaryUrl = "https://eha.test";
  return { port: 0, publicDir: path.join(__dirname, "..", "public"), siteUrl: primaryUrl, primaryUrl, primaryHost: "eha.test", enUrl: primaryUrl, ruUrl: `${primaryUrl}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "agent@eha.test", privacyPolicyVersion: "test-v1", turnstileSiteKey: "", trustProxy: false, applicationConfigured: false, missingApplicationKeys: ["SUPABASE_URL"], turnstileConfigured: false, telegramConfigured: false, emailConfigured: false, ...overrides };
}

// Synthetic player only.
function sheet(overrides = {}) {
  return {
    first_name: "Test", last_name: "Player", birth_year: 2007, position: "D", shoots: "L", height: "188 cm", weight: "84 kg",
    passports: ["Poland"], current_team: "Test U20", current_league: "Test League", current_country: "Poland",
    eliteprospects_url: "https://www.eliteprospects.com/player/1/test-player",
    highlights_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30", video_url: null, full_game_video_url: "https://drive.example/game",
    stats_summary: "2025/26 · 30 GP · 4 G · 12 A", strengths: "Skating <b>and</b> first pass", short_description: null,
    availability_status: "Looking for next season", updated_at: "2026-11-18T10:00:00Z",
    link: { lang: "en", recipient_label: "Test Club", view_count: 1, first_view: true, expires_at: "2027-01-18T00:00:00Z" },
    ...overrides
  };
}

function fakeClient(data) {
  const calls = { get: [], notify: [] };
  return {
    calls,
    async getSheet(token, count) { calls.get.push({ token, count }); return typeof data === "function" ? data() : data; },
    async notify(text) { calls.notify.push(text); }
  };
}

test("card is served privately, not indexed, and escapes CRM text", async () => {
  const client = fakeClient(sheet());
  const app = createApp({ config: config(), now: () => NOW, scoutingClient: client });
  const res = await request(app).get(`/s/${TOKEN}`).set("User-Agent", "Mozilla/5.0 (Macintosh)");
  assert.equal(res.status, 200);
  assert.match(res.headers["x-robots-tag"], /noindex/);
  assert.match(res.headers["cache-control"], /no-store/);
  assert.equal(res.headers["referrer-policy"], "no-referrer");
  assert.match(res.headers["content-security-policy"], /frame-src https:\/\/www\.youtube-nocookie\.com/);
  assert.match(res.text, /<meta name="robots" content="noindex/);
  assert.match(res.text, /Test Player/);
  assert.match(res.text, /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?start=30/);
  assert.match(res.text, /Skating &lt;b&gt;and&lt;\/b&gt;/);
  assert.match(res.text, /Looking for next season/);
  assert.match(res.text, /mailto:agent@eha\.test/);
  assert.doesNotMatch(res.text, /Test Club/, "the recipient label is for the agent only");
  assert.deepEqual(client.calls.get, [{ token: TOKEN, count: true }]);
  assert.equal(client.calls.notify.length, 1);
  assert.match(client.calls.notify[0], /Test Club opened the card of Test Player \(first time\)/);
});

test("link-preview bots see the card without counting a view or notifying", async () => {
  const client = fakeClient(sheet());
  const app = createApp({ config: config(), now: () => NOW, scoutingClient: client });
  for (const ua of ["WhatsApp/2.23", "TelegramBot (like TwitterBot)", "facebookexternalhit/1.1", "Slackbot-LinkExpanding 1.0", "Googlebot/2.1"]) {
    const res = await request(app).get(`/s/${TOKEN}`).set("User-Agent", ua);
    assert.equal(res.status, 200, ua);
  }
  assert.ok(client.calls.get.every((c) => c.count === false));
  assert.equal(client.calls.notify.length, 0);
});

test("repeat views within 30 minutes send one notification", async () => {
  let t = NOW.getTime();
  const client = fakeClient(sheet({ link: { lang: "en", recipient_label: "Test Club", view_count: 2, first_view: false } }));
  const app = createApp({ config: config(), now: () => new Date(t), scoutingClient: client });
  await request(app).get(`/s/${TOKEN}`).set("User-Agent", "Mozilla/5.0");
  await request(app).get(`/s/${TOKEN}`).set("User-Agent", "Mozilla/5.0");
  assert.equal(client.calls.notify.length, 1);
  t += 31 * 60 * 1000;
  await request(app).get(`/s/${TOKEN}`).set("User-Agent", "Mozilla/5.0");
  assert.equal(client.calls.notify.length, 2);
});

test("unknown, expired or malformed tokens get a neutral 404 without a CRM call for bad shapes", async () => {
  const client = fakeClient(null);
  const app = createApp({ config: config(), now: () => NOW, scoutingClient: client });
  const bad = await request(app).get("/s/short");
  assert.equal(bad.status, 404);
  assert.equal(client.calls.get.length, 0);
  const gone = await request(app).get(`/s/${TOKEN}`).set("Accept-Language", "ru-RU");
  assert.equal(gone.status, 404);
  assert.match(gone.text, /Срок ссылки истёк/);
  assert.match(gone.headers["x-robots-tag"], /noindex/);
});

test("CRM outage returns 503, not a broken card", async () => {
  const client = fakeClient(() => { throw new Error("down"); });
  const app = createApp({ config: config(), now: () => NOW, scoutingClient: client });
  const res = await request(app).get(`/s/${TOKEN}`);
  assert.equal(res.status, 503);
});

test("Russian card uses Russian labels", () => {
  const html = renderSheet(sheet({ link: { lang: "ru" } }), { contactEmail: "agent@eha.test" });
  assert.match(html, /lang="ru"/);
  assert.match(html, /Сильные стороны/);
  assert.match(html, /Ищет команду на следующий сезон/);
});

test("only YouTube and Vimeo become embeds; unsafe URLs are dropped", () => {
  assert.equal(embedUrl("https://youtu.be/dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(embedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(embedUrl("https://vimeo.com/123456789/abcdef1234"), "https://player.vimeo.com/video/123456789?h=abcdef1234");
  assert.equal(embedUrl("https://drive.example/game"), "");
  const html = renderSheet(sheet({ highlights_url: "javascript:alert(1)", full_game_video_url: null, eliteprospects_url: "javascript:x" }));
  assert.doesNotMatch(html, /javascript:/);
});

test("client calls the CRM RPC with the publishable key and the count flag", async () => {
  const seen = [];
  const client = createScoutingClient({}, async (url, init) => { seen.push({ url, init }); return { ok: true, json: async () => null }; });
  assert.equal(await client.getSheet(TOKEN, false), null);
  assert.match(seen[0].url, /\/rest\/v1\/rpc\/get_scouting_sheet$/);
  assert.match(seen[0].init.headers.apikey, /^sb_publishable_/);
  assert.deepEqual(JSON.parse(seen[0].init.body), { p_token: TOKEN, p_count: false });
  assert.ok(BOT_UA.test("Mozilla/5.0 (compatible; Google-InspectionTool)"));
  assert.ok(!BOT_UA.test("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1"));
});

test("Telegram channel block appears under guides and club needs in both locales, not elsewhere", async () => {
  const app = createApp({ config: config(), now: () => NOW, scoutingClient: fakeClient(null) });
  const cases = [
    ["/guides/transfer-calendar-2026-27", true, /Club vacancies and transfer deadlines/],
    ["/ru/guides/kalendar-transfernyh-okon-2026-27", true, /Вакансии клубов и трансферные дедлайны/],
    ["/club-needs", true, /Join the Telegram channel/],
    ["/ru/zaprosy-klubov", true, /Подписаться на Telegram-канал/],
    ["/", false, null]
  ];
  for (const [url, expected, text] of cases) {
    const res = await request(app).get(url);
    assert.equal(res.status, 200, url);
    const count = (res.text.match(/data-channel-cta="telegram"/g) || []).length;
    assert.equal(count, expected ? 1 : 0, url);
    if (text) assert.match(res.text, text, url);
    if (expected) assert.match(res.text, /href="https:\/\/t\.me\/eu_hockeyagency"/, url);
  }
});
