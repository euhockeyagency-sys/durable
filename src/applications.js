const crypto = require("node:crypto");
const path = require("node:path");
const { validateApplication } = require("./validation");
const { messages, normalizeLocale } = require("./messages");
const { parseProfileExtras } = require("./intake/profile");
const { assessApplication } = require("./intake/assessment");
const { playerFeedback } = require("./intake/feedback");
const { deliverApplication } = require("./intake/notification-queue");

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function payloadHashOf(value, extras) {
  return sha256(JSON.stringify([
    value.email, value.playerName.toLowerCase(), value.birthYear, value.position, value.currentClub,
    value.eliteProspectsUrl, value.videoUrls, value.message, extras.birthDate, extras.profile.stats, extras.profile.goals
  ]));
}

// Same content from the same player within 24 h is a repeat click, not a new
// application: return the stored reference instead of creating a duplicate.
async function findDuplicate(supabase, hash, now) {
  try {
    const since = new Date(now.getTime() - DUPLICATE_WINDOW_MS).toISOString();
    const { data, error } = await supabase.from("applications").select("id, reference_code").eq("payload_hash", hash).gte("created_at", since).limit(1);
    if (error) return null;
    return (data || [])[0] || null;
  } catch { return null; }
}

// A changed resubmission is a new application linked to the previous one.
async function findPrevious(supabase, email, playerName) {
  try {
    const { data, error } = await supabase.from("applications").select("id, player_name").eq("email", email).order("created_at", { ascending: false }).limit(5);
    if (error) return null;
    return (data || []).find((r) => String(r.player_name || "").toLowerCase() === playerName.toLowerCase()) || null;
  } catch { return null; }
}

function createReference(now, randomUUID = crypto.randomUUID) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const suffix = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `EHA-${year}${month}-${suffix}`;
}

function createApplicationHandler({ config, services, now = () => new Date(), randomUUID = crypto.randomUUID }) {
  return async function submitApplication(req, res) {
    const locale = normalizeLocale((req.body || {}).locale);
    const m = messages(locale);
    if (!config.applicationConfigured) {
      return res.status(503).json({
        ok: false,
        code: "service_unavailable",
        message: m.serviceUnavailable,
        contactEmail: config.contactEmail
      });
    }

    const files = Array.isArray(req.files) ? req.files : ((req.files || {}).files || []);
    const photo = Array.isArray(req.files) ? null : (((req.files || {}).photo || [])[0] || null);
    // The photo counts towards the same limits (3 files, 10 MiB in total).
    const validation = validateApplication(req.body || {}, photo ? [...files, photo] : files, now(), Boolean(config.turnstileConfigured), locale);
    const extras = parseProfileExtras(req.body || {}, { birthYear: validation.value.birthYear, position: validation.value.position, locale });
    const errors = { ...validation.errors, ...extras.errors };
    if (photo && !["image/jpeg", "image/png"].includes(photo.mimetype)) errors.photo = locale === "en" ? "The photo must be a JPG or PNG image." : "Фото должно быть в формате JPG или PNG.";
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, code: "validation_error", errors });
    }

    // Captcha is optional: verified only when Turnstile keys are configured.
    if (config.turnstileConfigured) {
      const verificationId = randomUUID();
      let turnstile;
      try {
        turnstile = await services.verifyTurnstile({
          token: validation.value.turnstileToken,
          ip: req.ip,
          idempotencyKey: verificationId
        });
      } catch (error) {
        console.error("Turnstile verification unavailable", error.message);
        return res.status(503).json({
          ok: false,
          code: "verification_unavailable",
          message: m.verificationUnavailable,
          contactEmail: config.contactEmail
        });
      }
      if (!turnstile.success) {
        return res.status(422).json({
          ok: false,
          code: "verification_failed",
          errors: { turnstile: m.verificationFailed }
        });
      }
    }

    const createdAt = now();
    const payloadHash = payloadHashOf(validation.value, extras);
    const duplicate = await findDuplicate(services.supabase, payloadHash, createdAt);
    if (duplicate) {
      return res.status(200).json({ ok: true, duplicate: true, applicationId: duplicate.id, reference: duplicate.reference_code });
    }
    const previous = validation.value.email ? await findPrevious(services.supabase, validation.value.email, validation.value.playerName) : null;
    const applicationId = randomUUID();
    const reference = createReference(createdAt, randomUUID);
    const retentionUntil = new Date(createdAt);
    retentionUntil.setUTCFullYear(retentionUntil.getUTCFullYear() + 1);
    const application = toDatabaseRow({
      id: applicationId,
      reference,
      value: validation.value,
      createdAt,
      retentionUntil,
      privacyPolicyVersion: config.privacyPolicyVersion
    });
    const assessment = assessApplication({
      ...validation.value,
      ...extras.profile,
      birthDate: extras.birthDate,
      currentLeague: extras.profile.currentLeague,
      citizenships: extras.profile.citizenships
    }, { now: createdAt });
    const ownerToken = crypto.randomBytes(24).toString("base64url");
    Object.assign(application, {
      birth_date: extras.birthDate,
      profile: extras.profile,
      assessment,
      public_photo_consent_at: extras.publicPhotoConsent ? createdAt.toISOString() : null,
      public_case_consent_at: extras.publicCaseConsent ? createdAt.toISOString() : null,
      owner_token_hash: sha256(ownerToken),
      payload_hash: payloadHash,
      previous_application_id: previous ? previous.id : null
    });

    const uploadedPaths = [];
    let legacyOnly = false;
    try {
      let { error: insertError } = await services.supabase.from("applications").insert(application);
      // Until migration 20261118120000 is applied, the intake columns do not
      // exist. Never lose the application: store the legacy columns only.
      if (insertError && isMissingColumn(insertError)) {
        console.error("Intake columns missing (apply migration 20261118120000); storing the application without them");
        legacyOnly = true;
        ({ error: insertError } = await services.supabase.from("applications").insert(legacyRow(application)));
      }
      if (insertError) throw insertError;

      for (const file of files) {
        const extension = path.extname(file.originalname).toLowerCase();
        const storagePath = `${applicationId}/${randomUUID()}${extension}`;
        const { error: uploadError } = await services.supabase.storage
          .from("application-files")
          .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(storagePath);
        const { error: metadataError } = await services.supabase.from("application_files").insert({
          application_id: applicationId,
          storage_path: storagePath,
          original_name: safeOriginalName(file.originalname),
          mime_type: file.mimetype,
          size_bytes: file.size
        });
        if (metadataError) throw metadataError;
      }
      if (photo) {
        const storagePath = `${applicationId}/photo-${randomUUID()}${photo.mimetype === "image/png" ? ".png" : ".jpg"}`;
        const { error: uploadError } = await services.supabase.storage
          .from("application-files")
          .upload(storagePath, photo.buffer, { contentType: photo.mimetype, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(storagePath);
        const { error: metadataError } = await services.supabase.from("application_files").insert({
          application_id: applicationId,
          storage_path: storagePath,
          original_name: "player-photo" + (photo.mimetype === "image/png" ? ".png" : ".jpg"),
          mime_type: photo.mimetype,
          size_bytes: photo.size
        });
        if (metadataError) throw metadataError;
        application.profile.photoPath = storagePath;
        if (!legacyOnly) {
          const { error: photoPatchError } = await services.supabase.from("applications").update({ profile: application.profile }).eq("id", applicationId);
          if (photoPatchError) throw photoPatchError;
        }
      }
    } catch (error) {
      console.error("Application persistence failed", error.message);
      await rollbackApplication(services.supabase, applicationId, uploadedPaths);
      return res.status(503).json({
        ok: false,
        code: "persistence_failed",
        message: m.persistenceFailed,
        contactEmail: config.contactEmail
      });
    }

    // Persistence has already succeeded. Notification/audit failures must not
    // turn this response into a 500, otherwise the player retries and creates
    // a duplicate application.
    try {
      await deliverApplication(services, application, config, { now });
    } catch (error) {
      console.error("Notification delivery failed after application was stored", error.message);
    }
    // The player sees practical next steps, never the internal category.
    return res.status(201).json({
      ok: true,
      applicationId,
      reference,
      ownerToken: legacyOnly ? null : ownerToken,
      feedback: playerFeedback({ position: validation.value.position }, assessment, locale)
    });
  };
}

const INTAKE_COLUMNS = ["birth_date", "profile", "assessment", "assessment_override", "agent_strengths", "public_photo_consent_at", "public_case_consent_at", "pdf_path", "pdf_generated_at", "owner_token_hash", "share_token_hash", "share_expires_at", "payload_hash", "previous_application_id", "review_requested_at"];

function isMissingColumn(error) {
  return error && (error.code === "PGRST204" || error.code === "42703" || /column .*(does not exist|could not find)|could not find the .* column/i.test(String(error.message || "")));
}

function legacyRow(application) {
  const row = { ...application };
  for (const key of INTAKE_COLUMNS) delete row[key];
  return row;
}

function toDatabaseRow({ id, reference, value, createdAt, retentionUntil, privacyPolicyVersion }) {
  return {
    id,
    reference_code: reference,
    status: "new",
    player_name: value.playerName,
    birth_year: value.birthYear,
    is_minor: value.isMinor,
    citizenship: value.citizenship,
    current_club: value.currentClub,
    position: value.position,
    height_cm: value.heightCm,
    weight_kg: value.weightKg,
    stick_hand: value.stickHand,
    available_from: value.availableFrom,
    phone: value.phone,
    email: value.email,
    elite_prospects_url: value.eliteProspectsUrl,
    video_urls: value.videoUrls,
    message: value.message,
    parent_name: value.parentName,
    parent_contact: value.parentContact,
    data_consent_at: createdAt.toISOString(),
    parent_consent_at: value.parentConsent ? createdAt.toISOString() : null,
    privacy_policy_version: privacyPolicyVersion,
    source: value.source,
    retention_until: retentionUntil.toISOString()
  };
}

async function rollbackApplication(supabase, applicationId, paths) {
  try {
    if (paths.length) await supabase.storage.from("application-files").remove(paths);
    await supabase.from("applications").delete().eq("id", applicationId);
  } catch (rollbackError) {
    console.error("Application rollback failed", rollbackError.message);
  }
}

function safeOriginalName(name) {
  return path.basename(String(name || "file")).replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255) || "file";
}

module.exports = { createApplicationHandler, createReference, toDatabaseRow, safeOriginalName };
