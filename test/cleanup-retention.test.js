const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const CLEANUP = path.join(__dirname, "..", "supabase", "functions", "cleanup-applications", "cleanup.mjs");

// Minimal in-memory stand-in for the Supabase client: just the query shapes
// cleanup.mjs uses (select/lt/in/or/limit, delete().eq, storage.remove).
function fakeSupabase(db) {
  const removed = [];
  const builder = (table) => {
    const filters = [];
    let max = Infinity;
    let columns = "";
    const rows = () => db[table].filter((row) => filters.every((f) => f(row))).slice(0, max);
    const api = {
      select(cols) { columns = cols; return api; },
      lt(col, value) { filters.push((row) => row[col] !== null && row[col] < value); return api; },
      in(col, values) { filters.push((row) => values.includes(row[col])); return api; },
      or(expr) {
        const parts = expr.split(",").map((part) => part.split("."));
        filters.push((row) => parts.some(([col, op, value]) => (op === "is" && value === "null" ? row[col] == null : op === "lt" ? row[col] != null && row[col] < value : false)));
        return api;
      },
      limit(n) { max = n; return api; },
      then(resolve) {
        const data = rows().map((row) => {
          const out = { id: row.id };
          if (columns.includes("application_files")) out.application_files = db.application_files.filter((f) => f.application_id === row.id);
          return out;
        });
        resolve({ data, error: null });
      },
      delete() {
        return { eq(col, value) { db[table] = db[table].filter((row) => row[col] !== value); return Promise.resolve({ error: null }); } };
      }
    };
    return api;
  };
  return {
    from: builder,
    storage: { from: () => ({ remove(paths) { removed.push(...paths); db.application_files = db.application_files.filter((f) => !paths.includes(f.storage_path)); return Promise.resolve({ error: null }); } }) },
    removed
  };
}

const NOW = new Date("2027-07-24T03:17:00Z");
const iso = (s) => new Date(s).toISOString();

function seed() {
  const app = (id, status, retention, next = null) => ({ id, status, retention_until: iso(retention), next_contact_at: next });
  return {
    applications: [
      app("new-expired", "new", "2027-07-23T10:00:00Z"),
      app("new-fresh", "new", "2027-07-25T10:00:00Z"),
      app("rejected-expired", "rejected", "2027-07-23T10:00:00Z"),
      app("archived-expired", "archived", "2027-07-24T03:16:59Z"),
      app("archived-boundary", "archived", "2027-07-24T03:17:00Z"),
      app("archived-planned", "archived", "2027-07-01T00:00:00Z", "2027-07-24"),
      app("contacted-expired", "contacted", "2027-01-01T00:00:00Z"),
      app("qualified-expired", "qualified", "2027-01-01T00:00:00Z")
    ],
    application_files: [
      { application_id: "new-expired", storage_path: "new-expired/a.pdf" },
      { application_id: "rejected-expired", storage_path: "rejected-expired/b.pdf" },
      { application_id: "rejected-expired", storage_path: "rejected-expired/photo-c.jpg" }
    ],
    club_requests: [
      { id: "club-new-expired", status: "new", retention_until: iso("2027-01-01") },
      { id: "club-rejected-expired", status: "rejected", retention_until: iso("2027-01-01") },
      { id: "club-archived-fresh", status: "archived", retention_until: iso("2027-12-01") }
    ]
  };
}

test("unprocessed applications and their files are held, decided ones past 12 months are deleted", async () => {
  const { runCleanup } = await import(CLEANUP);
  const db = seed();
  const supabase = fakeSupabase(db);
  const result = await runCleanup({ supabase, now: NOW });

  assert.equal(result.ok, true);
  assert.deepEqual(db.applications.map((a) => a.id).sort(), [
    "archived-boundary", "archived-planned", "contacted-expired", "new-expired", "new-fresh", "qualified-expired"
  ]);
  assert.deepEqual(supabase.removed.sort(), ["rejected-expired/b.pdf", "rejected-expired/photo-c.jpg"]);
  assert.deepEqual(db.application_files.map((f) => f.storage_path), ["new-expired/a.pdf"]);
  assert.equal(result.applications.deleted, 2);
  assert.equal(result.applications.heldUnprocessed, 1);
  assert.deepEqual(db.club_requests.map((c) => c.id).sort(), ["club-archived-fresh", "club-new-expired"]);
  assert.equal(result.clubRequests.heldUnprocessed, 1);
});

test("dry run reports the same decision and changes nothing", async () => {
  const { runCleanup } = await import(CLEANUP);
  const db = seed();
  const before = JSON.stringify(db);
  const supabase = fakeSupabase(db);
  const result = await runCleanup({ supabase, now: NOW, dryRun: true });
  assert.equal(JSON.stringify(db), before);
  assert.equal(supabase.removed.length, 0);
  assert.equal(result.dryRun, true);
  assert.equal(result.applications.candidates, 2);
  assert.equal(result.applications.files, 2);
  assert.equal(result.applications.heldUnprocessed, 1);
  assert.equal(result.clubRequests.candidates, 1);
});

test("a second run deletes nothing more", async () => {
  const { runCleanup } = await import(CLEANUP);
  const db = seed();
  await runCleanup({ supabase: fakeSupabase(db), now: NOW });
  const after = JSON.stringify(db);
  const second = await runCleanup({ supabase: fakeSupabase(db), now: NOW });
  assert.equal(JSON.stringify(db), after);
  assert.equal(second.applications.deleted, 0);
  assert.equal(second.applications.heldUnprocessed, 1);
});

test("once the owner rejects a held application it is deleted with its files on the next run", async () => {
  const { runCleanup } = await import(CLEANUP);
  const db = seed();
  db.applications.find((a) => a.id === "new-expired").status = "rejected";
  const supabase = fakeSupabase(db);
  await runCleanup({ supabase, now: NOW });
  assert.ok(!db.applications.some((a) => a.id === "new-expired"));
  assert.ok(supabase.removed.includes("new-expired/a.pdf"));
});

test("the edge function delegates to the shared policy and never lists \"new\" as deletable", () => {
  const fs = require("node:fs");
  const index = fs.readFileSync(path.join(path.dirname(CLEANUP), "index.ts"), "utf8");
  assert.match(index, /import \{ runCleanup \} from "\.\/cleanup\.mjs"/);
  assert.doesNotMatch(index, /\.in\("status"/);
});
