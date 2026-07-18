create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Before applying this migration remotely, create these Vault secrets:
--   project_url: https://<project-ref>.supabase.co
--   cleanup_secret: a long random value also configured as CLEANUP_SECRET for the Edge Function
-- The job deliberately uses the Storage API through the Edge Function so objects are not orphaned.
select cron.schedule(
  'cleanup-expired-applications-daily',
  '17 3 * * *',
  $schedule$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/cleanup-applications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cleanup-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cleanup_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 10000
    );
  $schedule$
);
