// Intake automation routes: Elite Prospects lookup, owner access (PDF, manual
// review request), time-limited share link, and the agent's application view.
const crypto = require("node:crypto");
const express = require("express");
const { parseEliteProspectsUrl, createEliteProspectsClient } = require("./elite-prospects");
const { buildPlayerCardPdf, fileName } = require("./player-card-pdf");
const { CATEGORY_LABELS, CATEGORIES, effectiveCategory } = require("./assessment");
const { retryDue, cardFor } = require("./notification-queue");
const { statLine } = require("./agent-card");

const sha256 = (v) => crypto.createHash("sha256").update(String(v)).digest("hex");
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SHARE_DAYS = 14;
const REF_RE = /^EHA-\d{6}-[A-F0-9]{6}$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

function contentDisposition(name, inline) {
  const ascii = name.normalize("NFKD").replace(/[^\x20-\x7e]/g, "").replace(/["\\]/g, "") || "EHA-player-card.pdf";
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

async function loadBy(supabase, column, value) {
  const { data, error } = await supabase.from("applications").select("*").eq(column, value).maybeSingle();
  if (error) throw error;
  return data || null;
}

async function photoFor(supabase, app) {
  const p = app.profile && app.profile.photoPath;
  if (!p) return null;
  try {
    const { data, error } = await supabase.storage.from("application-files").download(p);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  } catch { return null; }
}

async function generateAndStorePdf(supabase, app, now) {
  const generatedAt = now();
  const pdf = await buildPlayerCardPdf(app, { generatedAt, photo: await photoFor(supabase, app) });
  const storagePath = `${app.id}/player-card.pdf`;
  const { error: uploadError } = await supabase.storage.from("application-files").upload(storagePath, pdf, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw uploadError;
  if (!app.pdf_path) {
    // Registered as an application file so the cleanup function deletes it.
    const { error } = await supabase.from("application_files").insert({ application_id: app.id, storage_path: storagePath, original_name: "player-card.pdf", mime_type: "application/pdf", size_bytes: pdf.length });
    if (error) throw error;
  }
  const { error: patchError } = await supabase.from("applications").update({ pdf_path: storagePath, pdf_generated_at: generatedAt.toISOString() }).eq("id", app.id);
  if (patchError) throw patchError;
  return { pdf, generatedAt };
}

async function storedOrFreshPdf(supabase, app, now) {
  if (app.pdf_path) {
    try {
      const { data, error } = await supabase.storage.from("application-files").download(app.pdf_path);
      if (!error && data) return { pdf: Buffer.from(await data.arrayBuffer()), generatedAt: new Date(app.pdf_generated_at || now()) };
    } catch { /* fall through */ }
  }
  const generatedAt = now();
  return { pdf: await buildPlayerCardPdf(app, { generatedAt, photo: await photoFor(supabase, app) }), generatedAt };
}

function sendPdf(res, app, { pdf, generatedAt }, inline) {
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": contentDisposition(fileName(app, generatedAt), inline), "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" });
  res.send(pdf);
}

function registerPublicIntakeRoutes(app, { config, services, now = () => new Date(), createRateLimiter }) {
  const lookupLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000, now: () => now().getTime() });
  const ownerLimiter = createRateLimiter({ limit: 20, windowMs: 15 * 60 * 1000, now: () => now().getTime() });
  const ep = (services && services.eliteProspects) || createEliteProspectsClient({ apiKey: config.eliteProspectsApiKey, now });

  app.post("/api/ep-lookup", lookupLimiter, express.json({ limit: "2kb" }), async (req, res) => {
    res.set("Cache-Control", "no-store");
    const parsed = parseEliteProspectsUrl((req.body || {}).url);
    if (!parsed.ok) return res.status(400).json({ ok: false, reason: parsed.reason });
    if (!ep.configured) return res.json({ ok: false, available: false, reason: "not_configured", epId: parsed.id, canonicalUrl: parsed.canonicalUrl });
    const result = await ep.lookup(parsed.id);
    if (!result.ok) return res.json({ ok: false, available: true, reason: result.reason, epId: parsed.id });
    return res.json({ ...result, available: true, canonicalUrl: parsed.canonicalUrl });
  });

  // Owner access: the token was returned once, after submission, to the
  // player's browser. Only its hash is stored.
  const owner = async (req, res) => {
    const ref = String(req.params.ref || "");
    // The token is accepted from the request body only: a secret in the URL
    // ends up in proxy access logs, browser history and Referer headers.
    const token = String(((req.body || {}).token) || "").slice(0, 100);
    if (!REF_RE.test(ref) || token.length < 20 || !services || !services.supabase) return null;
    const row = await loadBy(services.supabase, "reference_code", ref).catch(() => null);
    if (!row || !row.owner_token_hash) return null;
    const a = Buffer.from(row.owner_token_hash); const b = Buffer.from(sha256(token));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return row;
  };
  // Old clients asked with GET ?token=…; the query is never read or echoed.
  app.get("/api/applications/:ref/pdf", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.status(410).json({ ok: false, code: "use_post", message: "Open the application success page again and use the PDF button, or ask EHA for the player card." });
  });
  app.post("/api/applications/:ref/pdf", ownerLimiter, express.json({ limit: "2kb" }), async (req, res) => {
    res.set({ "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" });
    const row = await owner(req, res);
    if (!row) return res.status(404).json({ ok: false, code: "not_found" });
    sendPdf(res, row, await storedOrFreshPdf(services.supabase, row, now), false);
  });
  app.post("/api/applications/:ref/review", ownerLimiter, express.json({ limit: "2kb" }), async (req, res) => {
    const row = await owner(req, res);
    if (!row) return res.status(404).json({ ok: false, code: "not_found" });
    const { error } = await services.supabase.from("applications").update({ review_requested_at: now().toISOString() }).eq("id", row.id);
    if (error) return res.status(503).json({ ok: false, code: "unavailable" });
    res.json({ ok: true });
  });

  // Time-limited link the agent created for one external recipient.
  app.get("/shared/player-card/:token", ownerLimiter, async (req, res) => {
    res.set({ "X-Robots-Tag": "noindex", "Cache-Control": "private, no-store" });
    const token = String(req.params.token || "");
    if (token.length < 20 || !services || !services.supabase) return res.status(404).type("text").send("Not found.");
    const row = await loadBy(services.supabase, "share_token_hash", sha256(token)).catch(() => null);
    if (!row || !row.share_expires_at || new Date(row.share_expires_at) <= now()) return res.status(404).type("text").send("Link expired or not found.");
    sendPdf(res, row, await storedOrFreshPdf(services.supabase, row, now), true);
  });
}

function renderDetail(adminPath, a, { csrf, notifications = [], card = "", shareUrl = null }) {
  const p = a.profile || {};
  const s = a.assessment || {};
  const cat = effectiveCategory(s, a.assessment_override);
  const row = (k, v) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`;
  const form = (action, inner, label) => `<form method="post" action="${adminPath}/applications/${esc(a.id)}/${action}"><input type="hidden" name="csrf" value="${esc(csrf)}">${inner}<button type="submit">${esc(label)}</button></form>`;
  const stats = (p.stats || []).map((r) => `<li>${esc(statLine(r))}</li>`).join("") || "<li>—</li>";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${esc(a.reference_code)} · EHA admin</title>` +
    `<style>body{font:14px/1.45 system-ui,sans-serif;margin:24px;max-width:1100px;color:#0b1520}table{border-collapse:collapse;width:100%;margin:8px 0 20px}th,td{border:1px solid #ccd3d9;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f2f4f6;width:240px}.box{border:1px solid #ccd3d9;padding:12px;margin:12px 0;background:#fbfcfd}.warn{color:#8a5a00}pre{white-space:pre-wrap;background:#f6f7f9;padding:10px}form{margin:8px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}textarea{width:100%}</style></head><body>` +
    `<p><a href="${adminPath}">← All applications</a></p><h1>${esc(a.player_name)} <small>${esc(a.reference_code)}</small></h1>` +
    (a.previous_application_id ? `<p class="warn">Resubmission: previous application <a href="${adminPath}/applications/${esc(a.previous_application_id)}">${esc(a.previous_application_id)}</a></p>` : "") +
    (a.review_requested_at ? `<p class="warn">The player asked for a manual review on ${esc(a.review_requested_at)}.</p>` : "") +
    `<h2>Player-confirmed data</h2><table>` +
    row("Birth", esc(a.birth_date || a.birth_year)) + row("Position / hand", `${esc(a.position)} / ${esc(a.stick_hand || "—")}`) +
    row("Height / weight", `${esc(a.height_cm ?? "—")} cm / ${esc(a.weight_kg ?? "—")} kg`) +
    row("Citizenship (stated, not a verified passport)", esc((p.citizenships || [a.citizenship]).join(", "))) +
    row("Team / league / level", `${esc(a.current_club)} · ${esc(p.currentLeague || "—")} · ${esc(p.currentLevel || "—")}`) +
    row("Stats (regular season and playoffs separate)", `<ul>${stats}</ul>`) +
    row("Video", (a.video_urls || []).map((u) => `<a href="${esc(u)}" rel="noopener noreferrer" target="_blank">${esc(u)}</a>`).join("<br>") + ` <small>type: ${esc(p.videoType || "—")}</small>`) +
    row("Timecodes / jersey", `${esc(p.timecodes || "—")}<br>#${esc(p.jerseyNumber || "—")} ${esc(p.jerseyColor || "")}`) +
    row("Goals / countries / budget", `${esc(p.goals || "—")}<br>${esc((p.preferredCountries || []).join(", ") || "—")}<br>${esc(p.budget || "—")}`) +
    row("Self-described strengths", esc(p.strengthsSelf || "—")) +
    row("Elite Prospects", a.elite_prospects_url ? `<a href="${esc(a.elite_prospects_url)}" rel="noopener noreferrer" target="_blank">${esc(a.elite_prospects_url)}</a>` : "—") +
    row("EP import", p.epImport ? `API, fetched ${esc(p.epImport.fetchedAt)}; fields: ${esc(p.epImport.fields.join(", "))}; confirmed by player: ${p.dataConfirmed ? "yes" : "no"}` : "manual entry") +
    row("Public use consent", `photo: ${a.public_photo_consent_at ? "yes" : "no"} · case: ${a.public_case_consent_at ? "yes" : "no"}`) +
    `</table>` +
    `<div class="box"><h2>Internal assessment (preliminary, not shown to the player)</h2>` +
    `<p><b>${esc(CATEGORY_LABELS[cat] || cat)}</b>${a.assessment_override ? ` — agent override (computed: ${esc(CATEGORY_LABELS[s.category] || s.category)}). Reason: ${esc(a.assessment_override.reason)}` : ""}</p>` +
    `<p>Rules ${esc(s.rulesVersion || "—")} · mode ${esc(s.mode || "—")} · thresholds approved: ${s.approved ? "yes" : "no"} · computed ${esc(s.computedAt || "—")}</p>` +
    `<p>Reasons: ${esc((s.reasons || []).join("; ") || "—")}</p><p>Factors: ${esc((s.factors || []).join("; ") || "—")}</p><p>Missing: ${esc((s.missing || []).join(", ") || "—")}</p>` +
    `<p>Directions: ${esc(((s.parts || {}).fit || {}).directions?.join(", ") || "—")} · Documents to check: ${esc((((s.parts || {}).documents || {}).checks || []).join("; "))}</p>` +
    form("assessment", `<select name="category">${CATEGORIES.map((c) => `<option value="${c}"${c === cat ? " selected" : ""}>${esc(CATEGORY_LABELS[c])}</option>`).join("")}</select><input name="reason" maxlength="500" required placeholder="Reason for the change (required)" style="flex:1">`, "Save category") +
    `</div>` +
    `<div class="box"><h2>PDF player card</h2><p>${a.pdf_generated_at ? `Generated ${esc(a.pdf_generated_at)} · <a href="${adminPath}/applications/${esc(a.id)}/pdf" target="_blank">Preview</a> · <a href="${adminPath}/applications/${esc(a.id)}/pdf?download=1">Download</a>` : "Not generated yet."}</p>` +
    form("strengths", `<textarea name="agent_strengths" rows="3" maxlength="2000" placeholder="Agent's assessment for the PDF (labelled as the agent's conclusion)">${esc(a.agent_strengths || "")}</textarea>`, "Save agent's assessment") +
    form("pdf", "", a.pdf_generated_at ? "Regenerate PDF" : "Generate PDF") +
    (a.pdf_generated_at ? form("share", "", `Create a ${SHARE_DAYS}-day share link`) : "") +
    (shareUrl ? `<p>Share link (copy now, shown once): <code>${esc(shareUrl)}</code></p>` : a.share_expires_at ? `<p>An active share link expires ${esc(a.share_expires_at)}.</p>` : "") +
    `</div>` +
    `<div class="box"><h2>Agent notification</h2><p>${notifications.map((n) => `${esc(n.channel)}: ${esc(n.status)} (attempts ${esc(n.attempts ?? 1)}${n.error_message ? `, ${esc(n.error_message)}` : ""})`).join("<br>") || "No delivery records."}</p>` +
    `<pre>${esc(card)}</pre>` + `<form method="post" action="${adminPath}/notifications/retry"><input type="hidden" name="csrf" value="${esc(csrf)}"><button type="submit">Retry failed deliveries now</button></form></div>` +
    `</body></html>`;
}

function registerAdminIntakeRoutes(app, { adminPath, requireAdmin, auth, config, services, now = () => new Date() }) {
  const sb = () => services.supabase;
  const form = express.urlencoded({ extended: false, limit: "8kb" });
  const guard = (req, res) => {
    if (!auth.validCsrf(req.adminSession, (req.body || {}).csrf)) { res.status(403).type("text").send("Invalid request."); return false; }
    if (!UUID_RE.test(req.params.id || "")) { res.status(400).type("text").send("Invalid request."); return false; }
    return true;
  };
  const detail = async (req, res, extra = {}) => {
    if (!UUID_RE.test(req.params.id || "")) return res.status(400).type("text").send("Invalid request.");
    const a = await loadBy(sb(), "id", req.params.id).catch(() => null);
    if (!a) return res.status(404).type("text").send("Not found.");
    let notifications = [];
    try { const r = await sb().from("application_notifications").select("channel, status, attempts, error_message").eq("application_id", a.id); notifications = r.data || []; } catch { /* optional */ }
    res.type("html").send(renderDetail(adminPath, a, { csrf: auth.csrfToken(req.adminSession), notifications, card: cardFor(a, config), ...extra }));
  };
  app.get(`${adminPath}/applications/:id`, requireAdmin, (req, res) => detail(req, res));
  app.post(`${adminPath}/applications/:id/assessment`, requireAdmin, form, async (req, res) => {
    if (!guard(req, res)) return;
    const category = String(req.body.category || ""); const reason = String(req.body.reason || "").trim().slice(0, 500);
    if (!CATEGORIES.includes(category) || !reason) return res.status(400).type("text").send("Choose a category and give a reason.");
    const a = await loadBy(sb(), "id", req.params.id).catch(() => null);
    if (!a) return res.status(404).type("text").send("Not found.");
    const history = [...((a.assessment_override && a.assessment_override.history) || []), ...(a.assessment_override ? [{ category: a.assessment_override.category, reason: a.assessment_override.reason, at: a.assessment_override.at }] : [])].slice(-10);
    const { error } = await sb().from("applications").update({ assessment_override: { category, reason, at: now().toISOString(), history } }).eq("id", a.id);
    if (error) return res.status(503).type("text").send("Could not save.");
    res.redirect(303, `${adminPath}/applications/${a.id}`);
  });
  app.post(`${adminPath}/applications/:id/strengths`, requireAdmin, form, async (req, res) => {
    if (!guard(req, res)) return;
    const text = String(req.body.agent_strengths || "").trim().slice(0, 2000) || null;
    const { error } = await sb().from("applications").update({ agent_strengths: text }).eq("id", req.params.id);
    if (error) return res.status(503).type("text").send("Could not save.");
    res.redirect(303, `${adminPath}/applications/${req.params.id}`);
  });
  app.post(`${adminPath}/applications/:id/pdf`, requireAdmin, form, async (req, res) => {
    if (!guard(req, res)) return;
    const a = await loadBy(sb(), "id", req.params.id).catch(() => null);
    if (!a) return res.status(404).type("text").send("Not found.");
    try { await generateAndStorePdf(sb(), a, now); } catch (error) { console.error("PDF generation failed", error.message); return res.status(503).type("text").send("Could not generate the PDF."); }
    res.redirect(303, `${adminPath}/applications/${a.id}`);
  });
  app.get(`${adminPath}/applications/:id/pdf`, requireAdmin, async (req, res) => {
    if (!UUID_RE.test(req.params.id || "")) return res.status(400).type("text").send("Invalid request.");
    const a = await loadBy(sb(), "id", req.params.id).catch(() => null);
    if (!a) return res.status(404).type("text").send("Not found.");
    sendPdf(res, a, await storedOrFreshPdf(sb(), a, now), req.query.download !== "1");
  });
  app.post(`${adminPath}/applications/:id/share`, requireAdmin, form, async (req, res) => {
    if (!guard(req, res)) return;
    const token = crypto.randomBytes(24).toString("base64url");
    const expires = new Date(now().getTime() + SHARE_DAYS * 86400000).toISOString();
    const { error } = await sb().from("applications").update({ share_token_hash: sha256(token), share_expires_at: expires }).eq("id", req.params.id);
    if (error) return res.status(503).type("text").send("Could not create the link.");
    const base = String(config.primaryUrl || "").replace(/\/$/, "");
    return detail(req, res, { shareUrl: `${base}/shared/player-card/${token}` });
  });
  app.post(`${adminPath}/notifications/retry`, requireAdmin, form, async (req, res) => {
    if (!auth.validCsrf(req.adminSession, (req.body || {}).csrf)) return res.status(403).type("text").send("Invalid request.");
    await retryDue(services, config, { now });
    res.redirect(303, adminPath);
  });
}

module.exports = { registerPublicIntakeRoutes, registerAdminIntakeRoutes, generateAndStorePdf, contentDisposition, renderDetail };
