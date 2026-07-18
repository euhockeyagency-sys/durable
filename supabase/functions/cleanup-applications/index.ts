import { createClient } from "npm:@supabase/supabase-js@2.100.0";

const headers = { "Content-Type": "application/json" };

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, code: "method_not_allowed" }), { status: 405, headers });
  }
  const expectedSecret = Deno.env.get("CLEANUP_SECRET");
  if (!expectedSecret || request.headers.get("x-cleanup-secret") !== expectedSecret) {
    return new Response(JSON.stringify({ ok: false, code: "unauthorized" }), { status: 401, headers });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const secretKeysJson = Deno.env.get("SUPABASE_SECRET_KEYS");
  let secretKey: string | undefined;
  try {
    secretKey = secretKeysJson ? JSON.parse(secretKeysJson).default : undefined;
  } catch {
    return responseError("invalid_configuration", "SUPABASE_SECRET_KEYS is not valid JSON");
  }
  // Local CLI installations may still expose only the legacy built-in key.
  secretKey ||= Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !secretKey) {
    return new Response(JSON.stringify({ ok: false, code: "missing_configuration" }), { status: 500, headers });
  }

  const supabase = createClient(url, secretKey, { auth: { persistSession: false } });
  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, application_files(storage_path)")
    .lt("retention_until", new Date().toISOString())
    .in("status", ["new", "rejected", "archived"])
    .limit(100);

  if (error) return responseError("query_failed", error.message);
  let deleted = 0;
  const failures: Array<{ id: string; error: string }> = [];

  for (const application of applications || []) {
    const paths = (application.application_files || []).map((file: { storage_path: string }) => file.storage_path);
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from("application-files").remove(paths);
      if (storageError) {
        failures.push({ id: application.id, error: storageError.message });
        continue;
      }
    }
    const { error: deleteError } = await supabase.from("applications").delete().eq("id", application.id);
    if (deleteError) failures.push({ id: application.id, error: deleteError.message });
    else deleted += 1;
  }

  return new Response(JSON.stringify({ ok: failures.length === 0, scanned: applications?.length || 0, deleted, failures }), {
    status: failures.length ? 207 : 200,
    headers
  });
});

function responseError(code: string, message: string) {
  return new Response(JSON.stringify({ ok: false, code, message }), { status: 500, headers });
}
