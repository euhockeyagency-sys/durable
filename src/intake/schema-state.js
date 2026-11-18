// Whether the database already accepts an application without height, weight
// and stick hand. Migration 20261118120000 drops NOT NULL on those columns and
// adds birth_date in the same step, so the presence of birth_date is the
// probe. Until the probe says yes, the form and the validation keep the three
// fields required: a short application must never be refused by the database.

function isMissingColumn(error) {
  return Boolean(error) && (error.code === "PGRST204" || error.code === "42703" || /column .*(does not exist|could not find)|could not find the .* column/i.test(String(error.message || "")));
}

function createSchemaState({ supabase, recheckMs = 10 * 60 * 1000, now = () => Date.now(), initial = null } = {}) {
  let optional = initial; // true | false | null (unknown)
  let checkedAt = 0;
  let running = null;

  async function probe() {
    if (!supabase) return optional;
    if (running) return running;
    running = (async () => {
      try {
        const { error } = await supabase.from("applications").select("birth_date").limit(1);
        if (!error) optional = true;
        else if (isMissingColumn(error)) optional = false;
      } catch { /* keep the previous answer */ }
      checkedAt = now();
      running = null;
      return optional;
    })();
    return running;
  }

  return {
    probe,
    note(value) { optional = Boolean(value); checkedAt = now(); },
    measurementsRequired() {
      // Re-check in the background while the answer is not "optional", so the
      // form switches by itself once the migration is applied.
      if (optional !== true && supabase && now() - checkedAt > recheckMs) probe().catch(() => {});
      return optional !== true;
    }
  };
}

module.exports = { createSchemaState, isMissingColumn };
