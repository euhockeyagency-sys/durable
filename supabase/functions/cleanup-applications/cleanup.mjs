// Retention sweep shared by the Edge Function (Deno) and the Node tests.
// Plain ESM with no imports, so both runtimes load the same file.
//
// Policy (privacy page: "inactive applications ... are deleted after 12 months"):
// - Only records a person has decided on are deleted: status "rejected" or
//   "archived", retention date passed, no planned contact today or later.
// - "new" means nobody has looked at it yet. It is never deleted silently:
//   once its retention date passes it is reported as held, so the owner can
//   process it (reject/archive → deleted on the next run, or keep it active).
// - "contacted" and "qualified" are active clients and are never touched.
// Files are removed through the Storage API before the row, so no orphaned
// objects are left behind; a failed file removal keeps the row for a retry.

export const DELETABLE_STATUSES = ["rejected", "archived"];
export const HELD_STATUSES = ["new"];

const day = (now) => now.toISOString().slice(0, 10);

export async function runCleanup({ supabase, now = new Date(), dryRun = false, limit = 100 }) {
  const nowIso = now.toISOString();
  const today = day(now);
  const result = { ok: true, dryRun, applications: null, clubRequests: null };

  const expiredApplications = (statuses, columns) => supabase
    .from("applications")
    .select(columns)
    .lt("retention_until", nowIso)
    .in("status", statuses)
    .or(`next_contact_at.is.null,next_contact_at.lt.${today}`)
    .limit(limit);

  const { data: applications, error } = await expiredApplications(DELETABLE_STATUSES, "id, application_files(storage_path)");
  if (error) return { ok: false, code: "query_failed", message: error.message };
  const { data: heldApplications, error: heldError } = await expiredApplications(HELD_STATUSES, "id");
  if (heldError) return { ok: false, code: "query_failed", message: heldError.message };

  let deleted = 0;
  let filesRemoved = 0;
  const failures = [];
  for (const application of applications || []) {
    const paths = (application.application_files || []).map((file) => file.storage_path);
    if (dryRun) { filesRemoved += paths.length; continue; }
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from("application-files").remove(paths);
      if (storageError) { failures.push({ id: application.id, error: storageError.message }); continue; }
      filesRemoved += paths.length;
    }
    const { error: deleteError } = await supabase.from("applications").delete().eq("id", application.id);
    if (deleteError) failures.push({ id: application.id, error: deleteError.message });
    else deleted += 1;
  }
  result.applications = {
    candidates: (applications || []).length,
    deleted: dryRun ? 0 : deleted,
    files: filesRemoved,
    heldUnprocessed: (heldApplications || []).length,
    failures
  };

  const expiredClubRequests = (statuses) => supabase
    .from("club_requests")
    .select("id")
    .lt("retention_until", nowIso)
    .in("status", statuses)
    .limit(limit);
  const { data: clubRequests, error: clubError } = await expiredClubRequests(DELETABLE_STATUSES);
  if (clubError) return { ok: false, code: "query_failed", message: clubError.message };
  const { data: heldClubRequests, error: heldClubError } = await expiredClubRequests(HELD_STATUSES);
  if (heldClubError) return { ok: false, code: "query_failed", message: heldClubError.message };

  let clubDeleted = 0;
  const clubFailures = [];
  if (!dryRun) {
    for (const clubRequest of clubRequests || []) {
      const { error: deleteError } = await supabase.from("club_requests").delete().eq("id", clubRequest.id);
      if (deleteError) clubFailures.push({ id: clubRequest.id, error: deleteError.message });
      else clubDeleted += 1;
    }
  }
  result.clubRequests = {
    candidates: (clubRequests || []).length,
    deleted: clubDeleted,
    heldUnprocessed: (heldClubRequests || []).length,
    failures: clubFailures
  };
  result.ok = failures.length === 0 && clubFailures.length === 0;
  return result;
}
