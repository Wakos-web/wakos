-- Public forms: club mentorship (club detail pages) and sports scholarship (athletics page).
-- The public must be able to INSERT submissions; reads stay admin-only (see 003_close_anon_holes.sql).
-- Note: the admin dashboard reads these tables with the x-admin-secret header (is_admin()).

create policy "anon_insert_mentorship" on public.mentorship_requests
  for insert to anon with check (true);

create policy "anon_insert_scholarship" on public.sports_scholarships
  for insert to anon with check (true);