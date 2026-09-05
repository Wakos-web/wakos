-- Social links for the school (footer), MWOSA page, and each club.
-- Admin edits rows via the service-role proxy; the public site only
-- ever sees active=true rows, so nothing renders until admin adds it.

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('school', 'mwosa', 'club')),
  entity_id text,
  platform text not null check (platform in ('tiktok', 'facebook', 'x', 'instagram', 'youtube', 'linkedin', 'whatsapp')),
  url text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists social_links_entity_idx on public.social_links (entity_type, entity_id);
create index if not exists social_links_active_idx on public.social_links (active);

alter table public.social_links enable row level security;

-- Public reads: only active links. Writes go through the admin proxy (service role).
drop policy if exists "social_links public read active" on public.social_links;
create policy "social_links public read active"
  on public.social_links
  for select
  using (active = true);