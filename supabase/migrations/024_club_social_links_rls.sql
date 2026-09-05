-- Club patrons (and active co-editors) manage their own club's social links
-- from the club editor studio. Two parts:
--   1. Backfill clubs.patron_user_id from the RBAC club_patron scope so the
--      studio can find a patron's clubs without exposing user_roles to anon.
--   2. RLS on social_links: authenticated club patrons / active co-editors get
--      full CRUD scoped to their club (matched by slug), on top of the
--      existing public "active only" read policy.

-- 1. Backfill patron_user_id (idempotent; only fills rows that are still null)
update clubs c
set patron_user_id = ur.user_id
from role_scopes rs
join user_roles ur on ur.id = rs.user_role_id
where rs.scope_type = 'club'
  and rs.scope_id = c.id
  and ur.role = 'club_patron'
  and c.patron_user_id is null;

-- 2. RLS: editors of a club can read ALL rows for their club (including hidden)
drop policy if exists social_links_editor_select on social_links;
create policy social_links_editor_select on social_links
  for select to authenticated
  using (
    entity_type = 'club'
    and entity_id in (
      select slug from clubs
      where patron_user_id = auth.uid()
         or id in (select club_id from club_editors where user_id = auth.uid() and status = 'active')
    )
  );

-- 3. RLS: same scoping for insert / update / delete
drop policy if exists social_links_editor_write on social_links;
create policy social_links_editor_write on social_links
  for insert to authenticated
  with check (
    entity_type = 'club'
    and entity_id in (
      select slug from clubs
      where patron_user_id = auth.uid()
         or id in (select club_id from club_editors where user_id = auth.uid() and status = 'active')
    )
  );

drop policy if exists social_links_editor_update on social_links;
create policy social_links_editor_update on social_links
  for update to authenticated
  using (
    entity_type = 'club'
    and entity_id in (
      select slug from clubs
      where patron_user_id = auth.uid()
         or id in (select club_id from club_editors where user_id = auth.uid() and status = 'active')
    )
  )
  with check (
    entity_type = 'club'
    and entity_id in (
      select slug from clubs
      where patron_user_id = auth.uid()
         or id in (select club_id from club_editors where user_id = auth.uid() and status = 'active')
    )
  );

drop policy if exists social_links_editor_delete on social_links;
create policy social_links_editor_delete on social_links
  for delete to authenticated
  using (
    entity_type = 'club'
    and entity_id in (
      select slug from clubs
      where patron_user_id = auth.uid()
         or id in (select club_id from club_editors where user_id = auth.uid() and status = 'active')
    )
  );