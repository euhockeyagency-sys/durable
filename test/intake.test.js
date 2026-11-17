// Intake automation: Elite Prospects URL/API adapter, preliminary assessment,
// player feedback, notification queue, PDF card and access control.
// All data here is fictional; no real player and no real network call.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const zlib = require("node:zlib");
const request = require("supertest");
const { createApp } = require("../src/app");
const { parseEliteProspectsUrl, createEliteProspectsClient, API_BASE } = require("../src/intake/elite-prospects");
const { assessApplication } = require("../src/intake/assessment");
const { playerFeedback } = require("../src/intake/feedback");
const { agentCard } = require("../src/intake/agent-card");
const { deliverApplication, retryDue } = require("../src/intake/notification-queue");
const { buildPlayerCardPdf, fileName } = require("../src/intake/player-card-pdf");

const NOW = new Date("2026-11-18T10:00:00Z");
const ADMIN_PASSWORD = "test-admin-password-1234";

function config(overrides = {}) {
  const primaryUrl = "https://eha.test";
  return { port: 0, publicDir: path.join(__dirname, "..", "public"), siteUrl: primaryUrl, primaryUrl, primaryHost: "eha.test", enUrl: primaryUrl, ruUrl: `${primaryUrl}/ru`, ruPrefix: "/ru", legacyRuHost: "eha-legacy.test", contactEmail: "privacy@eha.test", privacyPolicyVersion: "test-v1", turnstileSiteKey: "", trustProxy: false, applicationConfigured: true, missingApplicationKeys: [], turnstileConfigured: false, telegramConfigured: true, emailConfigured: false, adminConfigured: true, adminPassword: ADMIN_PASSWORD, ...overrides };
}

// In-memory Supabase with the query methods the intake code uses.
function db(options = {}) {
  const rows = { applications: [], application_files: [], application_notifications: [], club_requests: [] };
  const files = new Map();
  const sent = [];
  const query = (table) => {
    const filters = [];
    let max = Infinity;
    const run = () => rows[table].filter((r) => filters.every((f) => f(r))).slice(0, max);
    const builder = {
      select() { return builder; },
      eq(c, v) { filters.push((r) => r[c] === v); return builder; },
      gte(c, v) { filters.push((r) => String(r[c]) >= v); return builder; },
      lte(c, v) { filters.push((r) => r[c] !== null && String(r[c]) <= v); return builder; },
      order() { return builder; },
      limit(n) { max = n; return builder; },
      async maybeSingle() { return { data: run()[0] || null, error: null }; },
      then(resolve) { resolve({ data: run(), error: null }); },
    };
    return builder;
  };
  const supabase = {
    from(table) {
      return {
        select: (...a) => query(table).select(...a),
        async insert(value) {
          if (table === "applications" && !value.created_at) value.created_at = value.data_consent_at;
          rows[table].push({ id: value.id || `${table}-${rows[table].length + 1}`, ...value });
          return { error: null };
        },
        update(patch) { return { async eq(c, v) { const r = rows[table].find((x) => x[c] === v); if (r) Object.assign(r, patch); return { error: r ? null : new Error("not found") }; } }; },
        delete() { return { async eq(_c, id) { rows[table] = rows[table].filter((r) => r.id !== id && r.application_id !== id); return { error: null }; } }; },
      };
    },
    storage: { from() { return {
      async upload(p, buf) { files.set(p, Buffer.from(buf)); return { error: null }; },
      async download(p) { const b = files.get(p); return b ? { data: { arrayBuffer: async () => b }, error: null } : { data: null, error: new Error("missing") }; },
      async remove(ps) { ps.forEach((p) => files.delete(p)); return { error: null }; },
    }; } },
  };
  return {
    rows, files, sent, supabase,
    async verifyTurnstile() { return { success: true }; },
    async sendTelegram(app, text) { if (options.telegramDown) throw new Error("telegram down"); sent.push(["telegram", text]); return "tg-1"; },
    async sendEmail(app, text) { sent.push(["email", text]); return "em-1"; },
    eliteProspects: options.ep,
  };
}

function submit(app, fields = {}) {
  const base = {
    playerName: "Test Forward", birthYear: "2003", citizenship: "Exampleland, Testonia", currentClub: "Test Club", position: "forward",
    heightCm: "182", weightKg: "82", stickHand: "left", phone: "+10000000000", email: "player@example.test", dataConsent: "true",
    currentLeague: "Hockeyettan", currentLevel: "t3", goals: "Senior hockey in Europe", availableFrom: "2027-05-01",
  };
  let call = request(app).post("/api/applications");
  for (const [k, v] of Object.entries({ ...base, ...fields })) for (const val of [].concat(v)) call = call.field(k, val);
  return call;
}

test("Elite Prospects URL: only player profiles on eliteprospects.com, id extracted", () => {
  assert.deepEqual(parseEliteProspectsUrl("https://www.eliteprospects.com/player/123456/test-player"), { ok: true, id: "123456", canonicalUrl: "https://www.eliteprospects.com/player/123456" });
  assert.equal(parseEliteProspectsUrl("https://eliteprospects.com/player/7").ok, true);
  for (const [url, reason] of [
    ["https://eliteprospects.com.evil.test/player/1", "wrong_domain"],
    ["https://evil.test/?u=https://www.eliteprospects.com/player/1", "wrong_domain"],
    ["https://user:pass@www.eliteprospects.com/player/1", "invalid_url"],
    ["https://www.eliteprospects.com:8443/player/1", "invalid_url"],
    ["javascript:alert(1)", "invalid_url"],
    ["https://www.eliteprospects.com/team/76/test", "not_a_player_profile"],
    ["https://www.eliteprospects.com/player/abc/test", "not_a_player_profile"],
    ["http://169.254.169.254/player/1", "wrong_domain"],
  ]) assert.equal(parseEliteProspectsUrl(url).reason, reason, url);
});

test("EP client: off without a key; with a key calls only the official API, keeps playoffs apart", async () => {
  const off = createEliteProspectsClient({ apiKey: "" });
  assert.equal((await off.lookup("1")).reason, "not_configured");
  const calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push([url, opts]);
    if (url.endsWith("/stats")) return { ok: true, status: 200, json: async () => ({ data: [
      { season: { slug: "2025-26" }, team: { name: "Team A" }, league: { name: "League X" }, gameType: "REGULAR_SEASON", regularStats: { GP: 30, G: 10, A: 12, PTS: 22 } },
      { season: { slug: "2025-26" }, team: { name: "Team A" }, league: { name: "League X" }, gameType: "PLAYOFFS", regularStats: { GP: 5, G: 1, A: 1, PTS: 2 } },
      { season: { slug: "2021-22" }, team: { name: "Old" }, league: { name: "Old L" }, gameType: "REGULAR_SEASON", regularStats: { GP: 10, G: 0, A: 1, PTS: 1 } },
      { season: { slug: "2022-23" }, team: { name: "T" }, league: { name: "L" }, gameType: "REGULAR_SEASON", regularStats: { GP: 10, G: 1, A: 1, PTS: 2 } },
      { season: { slug: "2023-24" }, team: { name: "T" }, league: { name: "L" }, gameType: "REGULAR_SEASON", regularStats: { GP: 10, G: 1, A: 1, PTS: 2 } },
    ] }) };
    return { ok: true, status: 200, json: async () => ({ data: { name: "Fictional Player", dateOfBirth: "2005-12-01", nationality: { name: "Testonia" }, position: "D", shoots: "R", height: { metrics: 190 }, weight: { metrics: 88 } } }) };
  };
  const on = createEliteProspectsClient({ apiKey: "k", fetchImpl, now: () => NOW });
  const r = await on.lookup("42");
  assert.equal(r.ok, true);
  assert.ok(calls.every(([u, o]) => u.startsWith(API_BASE) && o.redirect === "error" && o.headers["X-Api-Key"] === "k"));
  assert.equal(r.player.position, "defense");
  assert.equal(r.player.age, 20);
  assert.equal(r.photo, null);
  assert.deepEqual([...new Set(r.stats.map((s) => s.season))], ["2025/26", "2023/24", "2022/23"]);
  assert.equal(r.stats.filter((s) => s.season === "2025/26").map((s) => s.competition).join(","), "regular,playoffs");
  const missing = createEliteProspectsClient({ apiKey: "k", fetchImpl: async () => ({ ok: false, status: 404 }) });
  assert.equal((await missing.lookup("9")).reason, "not_found");
  const down = createEliteProspectsClient({ apiKey: "k", fetchImpl: async () => { const e = new Error("t"); e.name = "TimeoutError"; throw e; } });
  assert.equal((await down.lookup("9")).reason, "timeout");
});

test("/api/ep-lookup rejects bad URLs and reports not_configured without calling anything", async () => {
  const app = createApp({ config: config(), services: db(), now: () => NOW });
  assert.equal((await request(app).post("/api/ep-lookup").send({ url: "https://evil.test/player/1" })).status, 400);
  const r = await request(app).post("/api/ep-lookup").send({ url: "https://www.eliteprospects.com/player/55/x" });
  assert.equal(r.status, 200);
  assert.equal(r.body.reason, "not_configured");
});

test("assessment: position-specific, no stats is not zero, citizenship never excludes", () => {
  const base = { position: "forward", birthYear: 2003, currentClub: "Club", currentLevel: "t3", heightCm: 180, weightKg: 80, videoUrls: ["https://v.test/1"], videoType: "full_game", availableFrom: "2027-05-01", goals: "Europe", eliteProspectsUrl: "https://www.eliteprospects.com/player/1" };
  const row = (pts) => [{ season: "2025/26", competition: "regular", gp: 40, pts, league: "L" }];
  const fwd = assessApplication({ ...base, stats: row(14) }, { now: NOW });
  const def = assessApplication({ ...base, position: "defense", stats: row(14) }, { now: NOW });
  assert.ok(def.parts.sport.score > fwd.parts.sport.score, "0.35 ppg rates higher for a defender than for a forward");
  const goalie = assessApplication({ ...base, position: "goalie", stats: [{ season: "2025/26", competition: "regular", gp: 25, gaa: 2.5, svp: 0.91 }] }, { now: NOW });
  assert.match(goalie.factors.join(" "), /goalie/);
  const noStats = assessApplication({ ...base, stats: [] }, { now: NOW });
  assert.equal(noStats.parts.sport.score, 58 + 3, "level base + age only, not zero");
  assert.ok(noStats.missing.includes("stats"));
  const nonEu = assessApplication({ ...base, stats: row(14), citizenships: ["Testonia", "Exampleland"] }, { now: NOW });
  assert.equal(nonEu.category, fwd.category);
  assert.match(nonEu.parts.documents.checks.join(" "), /several citizenships/);
  const minor = assessApplication({ ...base, birthYear: 2010, stats: row(14) }, { now: NOW });
  assert.match(minor.parts.documents.checks.join(" "), /minor/);
  const unknownLevel = assessApplication({ ...base, currentLevel: null, stats: row(14) }, { now: NOW });
  assert.equal(unknownLevel.category, "manual_review");
  const old = assessApplication({ ...base, birthYear: 1980 }, { now: NOW });
  assert.equal(old.category, "not_fit");
  for (const r of [fwd, def, goalie, noStats, minor, old]) { assert.equal(r.mode, "preliminary"); assert.ok(r.rulesVersion); assert.equal(r.computedAt, NOW.toISOString()); }
});

test("player feedback: concrete next steps, no verdicts, no internal category", () => {
  const a = { category: "not_fit", missing: ["video", "stats"] };
  for (const locale of ["en", "ru"]) {
    const fb = playerFeedback({ position: "goalie" }, a, locale);
    const text = JSON.stringify(fb);
    assert.match(text, locale === "en" ? /goal|game sequences/i : /игровые эпизоды/);
    assert.doesNotMatch(text, /tier|not_fit|no chance|нет шансов|паспорт не подходит|слишком слаб|too weak|guarantee|гарант/i);
  }
});

test("submission: profile and assessment stored, player gets feedback and an owner token, no internal data", async () => {
  const services = db();
  const app = createApp({ config: config(), services, now: () => NOW });
  const r = await submit(app, { statsSeason: ["2025/26", "2025/26"], statsTeam: ["Test Club", "Test Club"], statsLeague: ["Hockeyettan", "Hockeyettan"], statsCompetition: ["regular", "playoffs"], statsGp: ["40", "4"], statsG: ["10", "1"], statsA: ["12", "0"] });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.ok(r.body.ownerToken && r.body.feedback);
  assert.doesNotMatch(JSON.stringify(r.body), /tier|assessment|category|rulesVersion/i);
  const row = services.rows.applications[0];
  assert.equal(row.profile.stats.length, 2);
  assert.deepEqual(row.profile.stats.map((s) => s.competition), ["regular", "playoffs"]);
  assert.deepEqual(row.profile.citizenships, ["Exampleland", "Testonia"]);
  assert.ok(row.assessment.category && row.assessment.rulesVersion);
  assert.notEqual(row.owner_token_hash, r.body.ownerToken);
  assert.match(services.sent[0][1], /Внутренняя категория/);
  assert.match(services.sent[0][1], /Гражданство \(со слов игрока\): Exampleland, Testonia/);
  assert.match(services.sent[0][1], /https:\/\/eha\.test\/admin\/applications\//);
});

test("duplicate submission within 24 h returns the same reference; a changed one links to the previous", async () => {
  const services = db();
  const app = createApp({ config: config(), services, now: () => NOW });
  const first = await submit(app);
  const again = await submit(app);
  assert.equal(again.status, 200);
  assert.equal(again.body.duplicate, true);
  assert.equal(again.body.reference, first.body.reference);
  assert.equal(services.rows.applications.length, 1);
  const changed = await submit(app, { goals: "Junior hockey in Sweden" });
  assert.equal(changed.status, 201);
  assert.equal(services.rows.applications[1].previous_application_id, services.rows.applications[0].id);
});

test("minor without guardian is refused; with guardian accepted; invalid stats rejected", async () => {
  const app = createApp({ config: config(), services: db(), now: () => NOW });
  assert.equal((await submit(app, { birthYear: "2011", currentLevel: "junior" })).status, 400);
  assert.equal((await submit(app, { birthYear: "2011", currentLevel: "junior", parentName: "Guardian Test", parentContact: "guardian@example.test", parentConsent: "true" })).status, 201);
  const bad = await submit(app, { email: "x2@example.test", statsSeason: "2025-2026", statsGp: "10" });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.errors.stats);
});

test("notification failure keeps the application, records a retry; sandbox sends nothing", async () => {
  const services = db({ telegramDown: true });
  const app = createApp({ config: config(), services, now: () => NOW });
  const r = await submit(app);
  assert.equal(r.status, 201);
  const n = services.rows.application_notifications[0];
  assert.equal(n.status, "failed");
  assert.ok(n.next_attempt_at > NOW.toISOString());
  // retry later succeeds and does not create a second row
  const later = new Date(NOW.getTime() + 10 * 60000);
  services.sendTelegram = async (_a, text) => { services.sent.push(["telegram", text]); return "tg-2"; };
  await retryDue(services, config(), { now: () => later });
  assert.equal(services.rows.application_notifications.length, 1);
  assert.equal(services.rows.application_notifications[0].status, "sent");
  assert.equal(services.rows.application_notifications[0].attempts, 2);

  const sandbox = db();
  const res = await deliverApplication(sandbox, { id: "a1", reference_code: "EHA-202611-AAAAAA", player_name: "Test", birth_year: 2003, position: "forward", citizenship: "X", current_club: "C", profile: {}, assessment: { category: "tier_b", missing: [], reasons: [] } }, config({ notifyMode: "sandbox" }), { now: () => NOW });
  assert.equal(res[0].status, "sandboxed");
  assert.match(res[0].text, /Tier B/);
  assert.equal(sandbox.sent.length, 0);
});

test("PDF card: Cyrillic, long name, several teams, one page, no internal or contact data of the player", async () => {
  const app = {
    id: "x", reference_code: "EHA-202611-ABCDEF", player_name: "Александр-Максимилиан Тестовый-Вымышленный Очень-Длинная-Фамилия", position: "goalie", current_club: "ХК Тест", birth_date: "2006-03-14", birth_year: 2006,
    stick_hand: "left", height_cm: 188, weight_kg: 84, citizenship: "Тестландия", phone: "+10000000000", email: "secret@example.test", internal_note: "PRIVATE-NOTE",
    assessment: { category: "tier_a" }, source: { locale: "ru" }, video_urls: ["https://video.test/full"], elite_prospects_url: "https://www.eliteprospects.com/player/1/x",
    profile: { citizenships: ["Тестландия", "Примерия"], stats: [
      { season: "2025/26", team: "ХК Тест", league: "Лига 1", competition: "regular", gp: 30, gaa: 2.1, svp: 0.92 },
      { season: "2025/26", team: "ХК Тест", league: "Лига 1", competition: "playoffs", gp: 5, gaa: 2.5, svp: 0.9 },
      { season: "2024/25", team: "Другая команда", league: "U20", competition: "regular", gp: 20, gaa: 2.8, svp: 0.9 } ], strengthsSelf: "Самоописание" },
  };
  const pdf = await buildPlayerCardPdf(app, { generatedAt: NOW, compress: false });
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  const raw = pdf.toString("latin1");
  assert.equal((raw.match(/\/Type \/Page\b/g) || []).length, 1);
  assert.doesNotMatch(raw, /PRIVATE-NOTE|secret@example|tier_a|Tier A|\+10000000000/);
  assert.match(raw, /\/URI \(https:\/\/video\.test\/full\)/);
  assert.match(fileName(app, NOW), /^EHA-player-card-Александр-Максимилиан-.+-2026-11-18\.pdf$/);
});

test("agent card labels citizenship as citizenship and never as a passport", () => {
  const text = agentCard({ reference_code: "EHA-202611-ABCDEF", player_name: "T", birth_year: 2003, position: "defense", citizenship: "X", current_club: "C", profile: { citizenships: ["X", "Y"] }, assessment: { category: "manual_review", missing: ["video"], reasons: ["profile 40% complete"], rulesVersion: "v" } }, { adminUrl: "https://eha.test/admin/applications/1", pdfStatus: "не создан" });
  assert.match(text, /Гражданство \(со слов игрока\): X, Y/);
  assert.doesNotMatch(text, /паспорт/i);
  assert.match(text, /Не хватает: видео/);
});

test("access: owner token opens only its own PDF; wrong token, other reference and expired share link are refused", async () => {
  const services = db();
  const app = createApp({ config: config(), services, now: () => NOW });
  const a = await submit(app);
  const b = await submit(app, { email: "other@example.test", playerName: "Other Player" });
  const ok = await request(app).get(`/api/applications/${a.body.reference}/pdf?token=${a.body.ownerToken}`);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers["content-type"], "application/pdf");
  assert.match(ok.headers["cache-control"], /no-store/);
  assert.equal((await request(app).get(`/api/applications/${a.body.reference}/pdf?token=${"x".repeat(32)}`)).status, 404);
  assert.equal((await request(app).get(`/api/applications/${b.body.reference}/pdf?token=${a.body.ownerToken}`)).status, 404);
  assert.equal((await request(app).get(`/api/applications/${a.body.reference}/pdf`)).status, 404);
  const review = await request(app).post(`/api/applications/${a.body.reference}/review`).send({ token: a.body.ownerToken });
  assert.equal(review.status, 200);
  assert.ok(services.rows.applications[0].review_requested_at);
  services.rows.applications[0].share_token_hash = require("node:crypto").createHash("sha256").update("t".repeat(32)).digest("hex");
  services.rows.applications[0].share_expires_at = new Date(NOW.getTime() - 1000).toISOString();
  assert.equal((await request(app).get(`/shared/player-card/${"t".repeat(32)}`)).status, 404);
});

test("admin: detail view, override needs a reason and is stored with history, PDF generate + share link", async () => {
  const services = db();
  const app = createApp({ config: config(), services, now: () => NOW });
  await submit(app);
  const id = services.rows.applications[0].id;
  assert.equal((await request(app).get(`/admin/applications/${id}`)).status, 303, "anonymous users are sent to login");
  const login = await request(app).post("/admin/login").type("form").send({ password: ADMIN_PASSWORD });
  const cookie = login.headers["set-cookie"].map((c) => c.split(";")[0]).find((c) => c.startsWith("eha_admin="));
  const page = await request(app).get(`/admin/applications/${id}`).set("Cookie", cookie);
  assert.equal(page.status, 200);
  assert.match(page.text, /Internal assessment \(preliminary/);
  const csrf = page.text.match(/name="csrf" value="([a-f0-9]+)"/)[1];
  assert.equal((await request(app).post(`/admin/applications/${id}/assessment`).set("Cookie", cookie).type("form").send({ csrf, category: "tier_a", reason: "" })).status, 400);
  await request(app).post(`/admin/applications/${id}/assessment`).set("Cookie", cookie).type("form").send({ csrf, category: "tier_a", reason: "Strong full-game video" }).expect(303);
  await request(app).post(`/admin/applications/${id}/assessment`).set("Cookie", cookie).type("form").send({ csrf, category: "tier_b", reason: "Second look" }).expect(303);
  const o = services.rows.applications[0].assessment_override;
  assert.equal(o.category, "tier_b");
  assert.equal(o.history[0].category, "tier_a");
  await request(app).post(`/admin/applications/${id}/strengths`).set("Cookie", cookie).type("form").send({ csrf, agent_strengths: "Reads the play well" }).expect(303);
  await request(app).post(`/admin/applications/${id}/pdf`).set("Cookie", cookie).type("form").send({ csrf }).expect(303);
  assert.ok(services.files.has(`${id}/player-card.pdf`));
  assert.ok(services.rows.application_files.some((f) => f.storage_path === `${id}/player-card.pdf`), "registered for cleanup");
  const share = await request(app).post(`/admin/applications/${id}/share`).set("Cookie", cookie).type("form").send({ csrf });
  const link = share.text.match(/https:\/\/eha\.test(\/shared\/player-card\/[A-Za-z0-9_-]+)/)[1];
  const shared = await request(app).get(link);
  assert.equal(shared.status, 200);
  assert.equal(shared.headers["content-type"], "application/pdf");
  assert.ok(!services.rows.applications[0].share_token_hash.includes(link.split("/").pop()), "only the hash is stored");
  // admin list shows the internal category, public pages never do
  const list = await request(app).get("/admin").set("Cookie", cookie);
  assert.match(list.text, /Tier B/);
});
