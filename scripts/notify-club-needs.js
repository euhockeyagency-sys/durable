#!/usr/bin/env node
// Sends new confirmed club requests (src/club-needs-data.js) to matching
// Telegram subscribers. Safe to re-run: every delivery is recorded first, so a
// request is never sent twice to the same subscriber.
//   node scripts/notify-club-needs.js --dry-run   # count matches, send nothing
//   node scripts/notify-club-needs.js             # send (needs the subscriber bot env)
// Run with the server environment, e.g. node --env-file=.env scripts/notify-club-needs.js
const { loadConfig } = require("../src/config");
const { createSupabaseStore, createTelegramSender, notifyNewClubNeeds } = require("../src/club-needs-subscriptions");
const { createClient } = require("@supabase/supabase-js");
const needs = require("../src/club-needs-data");

(async () => {
  const dryRun = process.argv.includes("--dry-run");
  const config = loadConfig(process.env);
  if (!config.clubNeedsSubscriptionsEnabled) {
    console.error("Subscriptions are off: set CLUB_NEEDS_SUBSCRIPTIONS=on, TELEGRAM_SUBSCRIBER_BOT_TOKEN, TELEGRAM_SUBSCRIBER_BOT_USERNAME, TELEGRAM_SUBSCRIBER_WEBHOOK_SECRET and Supabase keys.");
    process.exit(2);
  }
  const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey, { auth: { persistSession: false } });
  const stats = await notifyNewClubNeeds({
    store: createSupabaseStore(supabase),
    send: createTelegramSender(config.clubNeedsBotToken),
    needs, now: new Date(), siteUrl: config.primaryUrl, secret: config.clubNeedsWebhookSecret, ruPrefix: config.ruPrefix, dryRun,
    log: (line) => console.log(line),
  });
  console.log(JSON.stringify(stats));
})().catch((error) => { console.error(error.message); process.exit(1); });
