-- CRM project (kkxugkmpugwwndxsevdy), NOT the website project.
-- Closed Scouting Sheet links for clubs: one link per player per recipient club.
-- The website reads a card only through get_scouting_sheet(token) with the
-- public (publishable) key; the function returns a fixed whitelist of fields
-- and never contacts, notes, contract terms or development areas.

create table if not exists public.scouting_links (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  recipient_label text not null check (length(recipient_label) between 1 and 200),
  token_hash text not null unique,
  lang text not null default 'en' check (lang in ('en', 'ru')),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  view_count integer not null default 0,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists scouting_links_player_idx on public.scouting_links (player_id);

alter table public.scouting_links enable row level security;
revoke all on public.scouting_links from anon, authenticated;

-- Create a link. Returns the raw token once; only its SHA-256 is stored.
create or replace function public.create_scouting_link(
  p_player_id uuid, p_recipient_label text, p_team_id uuid default null,
  p_lang text default 'en', p_days integer default 60
) returns text
language plpgsql security definer set search_path = public, extensions
as $$
declare v_token text;
begin
  if p_days is null or p_days < 1 or p_days > 365 then raise exception 'p_days must be 1..365'; end if;
  v_token := translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_');
  insert into public.scouting_links (player_id, team_id, recipient_label, token_hash, lang, expires_at)
  values (p_player_id, p_team_id, p_recipient_label,
          encode(extensions.digest(v_token, 'sha256'), 'hex'), coalesce(p_lang, 'en'),
          now() + make_interval(days => p_days));
  return v_token;
end $$;
revoke all on function public.create_scouting_link(uuid, text, uuid, text, integer) from public, anon, authenticated;

-- Read a card by token. p_count = false for link-preview bots (no view counted).
create or replace function public.get_scouting_sheet(p_token text, p_count boolean default true)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare
  l public.scouting_links;
  p public.players;
  v_passports text[];
  v_first boolean := false;
begin
  if p_token is null or length(p_token) < 20 or length(p_token) > 100 then return null; end if;
  select * into l from public.scouting_links
   where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
     and revoked_at is null and expires_at > now();
  if not found then return null; end if;
  select * into p from public.players where id = l.player_id and coalesce(active, true);
  if not found then return null; end if;
  select passport_nationalities into v_passports from public.player_search_profiles
   where player_id = p.id and coalesce(active, true)
   order by updated_at desc nulls last limit 1;
  if p_count then
    v_first := l.view_count = 0;
    update public.scouting_links
       set view_count = view_count + 1,
           first_viewed_at = coalesce(first_viewed_at, now()),
           last_viewed_at = now()
     where id = l.id
     returning view_count into l.view_count;
  end if;
  return jsonb_build_object(
    'first_name', p.first_name, 'last_name', p.last_name, 'birth_year', p.birth_year,
    'position', p.position, 'shoots', p.shoots, 'height', p.height, 'weight', p.weight,
    'passports', coalesce(to_jsonb(v_passports), case when p.nationality is null then '[]'::jsonb else jsonb_build_array(p.nationality) end),
    'current_team', p.current_team, 'current_league', p.current_league, 'current_country', p.current_country,
    'eliteprospects_url', p.eliteprospects_url, 'highlights_url', p.highlights_url,
    'video_url', p.video_url, 'full_game_video_url', p.full_game_video_url,
    'stats_summary', p.stats_summary, 'short_description', p.short_description,
    'strengths', p.strengths, 'availability_status', p.availability_status,
    'updated_at', p.updated_at,
    'link', jsonb_build_object('lang', l.lang, 'recipient_label', l.recipient_label,
      'view_count', l.view_count, 'first_view', v_first, 'expires_at', l.expires_at)
  );
end $$;
revoke all on function public.get_scouting_sheet(text, boolean) from public;
grant execute on function public.get_scouting_sheet(text, boolean) to anon;
