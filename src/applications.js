const crypto = require("node:crypto");
const path = require("node:path");
const { validateApplication } = require("./validation");

function createReference(now, randomUUID = crypto.randomUUID) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const suffix = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `EHA-${year}${month}-${suffix}`;
}

function createApplicationHandler({ config, services, now = () => new Date(), randomUUID = crypto.randomUUID }) {
  return async function submitApplication(req, res) {
    if (!config.applicationConfigured) {
      return res.status(503).json({
        ok: false,
        code: "service_unavailable",
        message: "Форма временно недоступна. Свяжитесь с нами напрямую.",
        contactEmail: config.contactEmail
      });
    }

    const files = req.files || [];
    const validation = validateApplication(req.body || {}, files, now());
    if (!validation.ok) {
      return res.status(400).json({ ok: false, code: "validation_error", errors: validation.errors });
    }

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
        message: "Проверка безопасности временно недоступна. Попробуйте позже или свяжитесь с нами напрямую.",
        contactEmail: config.contactEmail
      });
    }
    if (!turnstile.success) {
      return res.status(422).json({
        ok: false,
        code: "verification_failed",
        errors: { turnstile: "Проверка безопасности истекла или уже была использована. Повторите её." }
      });
    }

    const createdAt = now();
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

    const uploadedPaths = [];
    try {
      const { error: insertError } = await services.supabase.from("applications").insert(application);
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
    } catch (error) {
      console.error("Application persistence failed", error.message);
      await rollbackApplication(services.supabase, applicationId, uploadedPaths);
      return res.status(503).json({
        ok: false,
        code: "persistence_failed",
        message: "Не удалось сохранить заявку. Данные не были приняты — попробуйте ещё раз.",
        contactEmail: config.contactEmail
      });
    }

    await deliverNotifications(services, application);
    return res.status(201).json({ ok: true, applicationId, reference });
  };
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
    contract_status: value.contractStatus,
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

async function deliverNotifications(services, application) {
  const channels = [
    ["telegram", () => services.sendTelegram(application)],
    ["email", () => services.sendEmail(application)]
  ];
  await Promise.all(channels.map(async ([channel, send]) => {
    let providerId = null;
    let status = "sent";
    let errorMessage = null;
    try {
      providerId = await send();
    } catch (error) {
      status = "failed";
      errorMessage = String(error.message || error).slice(0, 1000);
      console.error(`${channel} notification failed`, errorMessage);
    }
    const { error } = await services.supabase.from("application_notifications").insert({
      application_id: application.id,
      channel,
      status,
      provider_id: providerId,
      error_message: errorMessage,
      attempted_at: new Date().toISOString()
    });
    if (error) console.error(`${channel} notification audit failed`, error.message);
  }));
}

function safeOriginalName(name) {
  return path.basename(String(name || "file")).replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255) || "file";
}

module.exports = { createApplicationHandler, createReference, toDatabaseRow, safeOriginalName };
