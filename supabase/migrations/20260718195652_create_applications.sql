create extension if not exists pgcrypto with schema extensions;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'rejected', 'archived')),
  player_name text not null,
  birth_year integer not null check (birth_year between 1900 and 2200),
  is_minor boolean not null,
  citizenship text not null,
  current_club text not null,
  position text not null check (position in ('forward', 'defense', 'goalie')),
  height_cm numeric(5, 1) not null check (height_cm between 120 and 230),
  weight_kg numeric(5, 1) not null check (weight_kg between 35 and 180),
  stick_hand text not null check (stick_hand in ('left', 'right')),
  contract_status text not null check (contract_status in ('free', 'contracted', 'trial', 'other')),
  available_from date,
  phone text not null,
  email text,
  elite_prospects_url text not null,
  video_urls text[] not null default '{}',
  message text,
  parent_name text,
  parent_contact text,
  data_consent_at timestamptz not null,
  parent_consent_at timestamptz,
  privacy_policy_version text not null,
  source jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  retention_until timestamptz not null default (now() + interval '1 year'),
  constraint minor_parent_details check (
    not is_minor or (parent_name is not null and parent_contact is not null and parent_consent_at is not null)
  )
);

create table public.application_files (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  created_at timestamptz not null default now()
);

create table public.application_notifications (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  channel text not null check (channel in ('telegram', 'email')),
  status text not null check (status in ('sent', 'failed')),
  provider_id text,
  error_message text,
  attempted_at timestamptz not null default now(),
  unique (application_id, channel)
);

create index applications_retention_idx on public.applications (retention_until, status);
create index application_files_application_idx on public.application_files (application_id);
create index application_notifications_application_idx on public.application_notifications (application_id);

alter table public.applications enable row level security;
alter table public.application_files enable row level security;
alter table public.application_notifications enable row level security;

revoke all on table public.applications from anon, authenticated;
revoke all on table public.application_files from anon, authenticated;
revoke all on table public.application_notifications from anon, authenticated;
grant select, insert, update, delete on table public.applications to service_role;
grant select, insert, update, delete on table public.application_files to service_role;
grant select, insert, update, delete on table public.application_notifications to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-files',
  'application-files',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.applications is 'Private player applications managed only by trusted server code and Supabase Dashboard.';
comment on column public.applications.retention_until is 'Automatic deletion date unless the application remains active.';
