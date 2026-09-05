-- 016: let an authenticated alumnus SELECT their own row (approved or pending).
-- Without this, Postgres 15 RLS-on-RETURNING rejects `.insert({approved:false}).select()`
-- (the pending row is invisible to every SELECT policy), so new registrations fail
-- with "new row violates row-level security policy" — even though the INSERT policy
-- itself allows them. The own-row policy also lets a returning pending user find
-- "your registration is under review" instead of a dead-end.
create policy "own_select_profiles"
  on public.alumni_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));
