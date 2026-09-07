-- 026: let an alumnus SELECT their own pending business listing.
-- Same RLS-on-RETURNING fix as 016 (own_select_profiles), applied to
-- alumni_businesses: the register page inserts an unapproved listing with
-- `.select("id")` for the approval notification. Postgres 15 enforces the
-- SELECT policy on RETURNING rows, and the only public SELECT policy allows
-- approved = true — so the INSERT was rejected with "new row violates
-- row-level security policy" even though the INSERT policy allows it. Real
-- users listing a business hit this exact dead-end.
-- The public can still only read approved listings; this only lets the OWNER
-- (via their profile) read their own pending row back.
create policy "own_select_businesses"
  on public.alumni_businesses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.alumni_profiles p
      where p.id = owner_id
        and p.user_id = (select auth.uid())
    )
  );
