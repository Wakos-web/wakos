-- 002_admin_crud_policies.sql
-- The whole app (including /admin) runs as anon with the publishable key; there is
-- no auth yet. Previously these tables only had SELECT policies (or policies gated
-- on auth.role() = 'authenticated'), so every admin create/edit/delete was a silent
-- no-op or a 401. These policies allow the anon role to write so admin CRUD persists.
-- Revisit when real auth lands: restrict writes to authenticated/service roles.

-- Events: admin add / edit / publish-unpublish / delete
DROP POLICY IF EXISTS "anon_write_events" ON events;
CREATE POLICY "anon_write_events" ON events FOR ALL USING (true) WITH CHECK (true);

-- Articles (Campus News): admin add / edit / publish-unpublish / delete
DROP POLICY IF EXISTS "Authenticated write access" ON articles;
DROP POLICY IF EXISTS "anon_write_articles" ON articles;
CREATE POLICY "anon_write_articles" ON articles FOR ALL USING (true) WITH CHECK (true);

-- Page content (admin page editor)
DROP POLICY IF EXISTS "Authenticated write access" ON page_content;
DROP POLICY IF EXISTS "anon_write_page_content" ON page_content;
CREATE POLICY "anon_write_page_content" ON page_content FOR ALL USING (true) WITH CHECK (true);

-- Class notes (Pulse posts): admin publish / unpublish / delete.
-- NOTE: separate UPDATE/DELETE policies were tried and PostgREST still rejected
-- them; a single FOR ALL policy is what actually works (verified live).
DROP POLICY IF EXISTS "anon_update_notes" ON class_notes;
DROP POLICY IF EXISTS "anon_delete_notes" ON class_notes;
DROP POLICY IF EXISTS "anon_all_notes" ON class_notes;
CREATE POLICY "anon_all_notes" ON class_notes FOR ALL USING (true) WITH CHECK (true);

-- Inquiries: admin delete
DROP POLICY IF EXISTS "anon_delete_inquiries" ON inquiries;
CREATE POLICY "anon_delete_inquiries" ON inquiries FOR DELETE USING (true);

-- Alumni businesses: claim-page submit + admin approve / reject / delete
DROP POLICY IF EXISTS "Users insert own businesses" ON alumni_businesses;
DROP POLICY IF EXISTS "Users update own businesses" ON alumni_businesses;
DROP POLICY IF EXISTS "Users delete own businesses" ON alumni_businesses;
DROP POLICY IF EXISTS "anon_write_businesses" ON alumni_businesses;
CREATE POLICY "anon_write_businesses" ON alumni_businesses FOR ALL USING (true) WITH CHECK (true);