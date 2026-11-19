import { createClient } from "npm:@supabase/supabase-js@2.100.0";
import { runCleanup } from "./cleanup.mjs";

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
  // {"dryRun": true} reports what would be deleted or held without changing anything.
  let dryRun = false;
  try {
    const body = await request.json();
    dryRun = body && body.dryRun === true;
  } catch {
    // The daily cron sends "{}"; an empty or invalid body means a normal run.
  }
  const result = await runCleanup({ supabase, now: new Date(), dryRun });
  if (result.code) return responseError(result.code, result.message);
  return new Response(JSON.stringify(result), { status: result.ok ? 200 : 207, headers });
});

function responseError(code: string, message: string) {
  return new Response(JSON.stringify({ ok: false, code, message }), { status: 500, headers });
}
