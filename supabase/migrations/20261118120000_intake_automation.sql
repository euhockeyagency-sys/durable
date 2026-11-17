-- Intake automation: player-confirmed profile data, internal preliminary
-- assessment, private PDF player card, owner/share access tokens and a
-- notification delivery queue. Additive only: no existing data is changed.
-- RLS and grants stay as created (service_role only); new columns are not
-- reachable by anon/authenticated roles.

-- Parent/guardian requests may omit measurements and shot (validation allows
-- it), but the original columns were NOT NULL, so such inserts failed.
alter table public.applications alter column height_cm drop not null;
alter table public.applications alter column weight_kg drop not null;
alter table public.applications alter column stick_hand drop not null;

alter table public.applications
  -- Player-confirmed data (shown back to the player before submission):
  -- birth_date, stats rows (season, team, league, competition type), goals,
  -- preferred countries, budget, video type/timecodes, jersey, self-described
  -- strengths, Elite Prospects import metadata (source, fetched_at, fields).
  add column birth_date date,
  add column profile jsonb not null default '{}'::jsonb,
  -- Internal only. Never returned by public endpoints or put in the PDF.
  add column assessment jsonb,
  add column assessment_override jsonb,
  add column agent_strengths text check (agent_strengths is null or char_length(agent_strengths) <= 2000),
  -- Separate, optional consent for public use of the photo and of the case.
  add column public_photo_consent_at timestamptz,
  add column public_case_consent_at timestamptz,
  -- PDF player card (private file in the application-files bucket, also
  -- registered in application_files so the cleanup function removes it).
  add column pdf_path text,
  add column pdf_generated_at timestamptz,
  -- Access: hashes only, never the tokens themselves.
  add column owner_token_hash text,
  add column share_token_hash text,
  add column share_expires_at timestamptz,
  -- Duplicate / resubmission handling.
  add column payload_hash text,
  add column previous_application_id uuid references public.applications(id) on delete set null,
  add column review_requested_at timestamptz;

create index applications_payload_hash_idx on public.applications (payload_hash, created_at);
create index applications_email_idx on public.applications (email, created_at);
create unique index applications_owner_token_idx on public.applications (owner_token_hash) where owner_token_hash is not null;
create unique index applications_share_token_idx on public.applications (share_token_hash) where share_token_hash is not null;

comment on column public.applications.assessment is 'Internal preliminary priority (Tier A/B/C, not_fit, manual_review) with factors, missing data, rules version and computed_at. Not a talent rating; never shown to the player.';
comment on column public.applications.assessment_override is 'Manual agent correction: category, reason, at.';
comment on column public.applications.agent_strengths is 'Agent conclusion for the PDF, labelled as the agent''s assessment.';

-- Notification queue: the existing per-channel audit table becomes the queue.
-- unique (application_id, channel) already prevents duplicate deliveries.
alter table public.application_notifications drop constraint if exists application_notifications_channel_check;
alter table public.application_notifications add constraint application_notifications_channel_check
  check (channel in ('telegram', 'email', 'whatsapp'));
alter table public.application_notifications drop constraint if exists application_notifications_status_check;
alter table public.application_notifications add constraint application_notifications_status_check
  check (status in ('pending', 'sent', 'failed', 'sandboxed', 'abandoned'));
alter table public.application_notifications
  add column attempts integer not null default 1 check (attempts >= 0),
  add column next_attempt_at timestamptz;

create index application_notifications_retry_idx on public.application_notifications (status, next_attempt_at)
  where status in ('pending', 'failed');
