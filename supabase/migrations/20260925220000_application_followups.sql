-- Agent follow-up tracking for player applications, edited from the admin view
-- (POST /admin/followup). `next_contact_at` is a plain date: the agent plans in
-- days, not in timezone-aware instants. RLS and grants are per table and stay
-- as created in create_applications (service_role only), so the new columns
-- are not reachable by anon/authenticated roles.
alter table public.applications
  add column internal_note text check (internal_note is null or char_length(internal_note) <= 4000),
  add column next_contact_at date;

create index applications_next_contact_idx on public.applications (next_contact_at) where next_contact_at is not null;

comment on column public.applications.internal_note is 'Private agent note; never shown to the player.';
comment on column public.applications.next_contact_at is 'Planned next contact date. While it is today or later, the cleanup function keeps the application even past retention_until.';
