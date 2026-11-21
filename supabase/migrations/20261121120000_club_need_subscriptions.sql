-- Telegram subscription to new confirmed club requests (src/club-needs-subscriptions.js).
-- Stores only what the subscription needs: position, birth year, optional
-- Elite Prospects link, consent, locale and the Telegram chat id. No name,
-- phone or email. Link tokens are stored as SHA-256 hashes; unsubscribe links
-- are HMAC-signed and not stored.

create table public.club_need_subscriptions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'active', 'replaced', 'unsubscribed')),
  position text not null check (position in ('G', 'D', 'F')),
  birth_year integer not null check (birth_year between 1970 and 2025),
  elite_prospects_url text check (elite_prospects_url is null or elite_prospects_url ~ '^https://(www\.)?eliteprospects\.com/player/[0-9]+'),
  locale text not null default 'ru' check (locale in ('ru', 'en')),
  consent_at timestamptz not null,
  privacy_policy_version text,
  link_token_hash text,
  link_token_expires_at timestamptz,
  telegram_chat_id text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  -- Pending: kept 1 day (the link itself expires after 30 minutes). Active: no
  -- expiry (null). Unsubscribed or replaced: 30 days, then eligible for deletion.
  -- The deletion job is a follow-up (cleanup-applications does not touch this table yet).
  retention_until timestamptz default (now() + interval '1 day')
);

-- One active subscription per chat and position; re-registering replaces it.
create unique index club_need_subscriptions_active_chat_position
  on public.club_need_subscriptions (telegram_chat_id, position) where status = 'active';
create unique index club_need_subscriptions_link_token on public.club_need_subscriptions (link_token_hash) where link_token_hash is not null;
create index club_need_subscriptions_status_idx on public.club_need_subscriptions (status, position);
create index club_need_subscriptions_retention_idx on public.club_need_subscriptions (retention_until, status);

create table public.club_need_deliveries (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.club_need_subscriptions(id) on delete cascade,
  need_id text not null,
  status text not null check (status in ('pending', 'sent', 'failed')),
  error_message text,
  claimed_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (subscription_id, need_id)
);

alter table public.club_need_subscriptions enable row level security;
alter table public.club_need_deliveries enable row level security;
revoke all on table public.club_need_subscriptions from anon, authenticated;
revoke all on table public.club_need_deliveries from anon, authenticated;
grant select, insert, update, delete on table public.club_need_subscriptions to service_role;
grant select, insert, update, delete on table public.club_need_deliveries to service_role;
