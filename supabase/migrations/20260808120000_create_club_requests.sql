create table public.club_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'rejected', 'archived')),
  club_name text not null,
  contact_name text not null,
  email text,
  phone text,
  country text not null,
  position_needed text not null,
  level text not null,
  message text not null,
  data_consent_at timestamptz not null,
  locale text not null default 'ru',
  created_at timestamptz not null default now(),
  retention_until timestamptz not null default (now() + interval '1 year')
);

create table public.club_request_notifications (
  id uuid primary key default gen_random_uuid(),
  club_request_id uuid not null references public.club_requests(id) on delete cascade,
  channel text not null check (channel in ('telegram', 'email')),
  status text not null check (status in ('sent', 'failed')),
  provider_id text,
  error_message text,
  attempted_at timestamptz not null default now(),
  unique (club_request_id, channel)
);

create index club_requests_retention_idx on public.club_requests (retention_until, status);
create index club_request_notifications_club_request_idx on public.club_request_notifications (club_request_id);

alter table public.club_requests enable row level security;
alter table public.club_request_notifications enable row level security;

revoke all on table public.club_requests from anon, authenticated;
revoke all on table public.club_request_notifications from anon, authenticated;
grant select, insert, update, delete on table public.club_requests to service_role;
grant select, insert, update, delete on table public.club_request_notifications to service_role;

comment on table public.club_requests is 'Private club leads managed only by trusted server code and Supabase Dashboard.';
comment on column public.club_requests.retention_until is 'Automatic deletion date unless the request remains active. Cleaned up by the same cleanup-applications Edge Function as applications.';
