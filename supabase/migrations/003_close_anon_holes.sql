-- 003_close_anon_holes.sql
-- Closes the anon security holes found in the audit.
-- Admin actions authenticate with a shared secret sent as the x-admin-secret
-- header; RLS calls public.is_admin() to grant admin-only access.
-- NOTE: no-auth phase - the secret lives in the client bundle, so this stops
-- casual visitors and students, not a determined attacker. Swap for real auth
-- + server-side service-role routes when login lands.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-admin-secret' = 'BWfR-iJBud9nKFS1SPxaKyMCFSaedU_z'
$$;

-- ============ alumni_profiles: enable RLS ============
ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON alumni_profiles;
DROP POLICY IF EXISTS "Auth read profiles" ON alumni_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON alumni_profiles;
DROP POLICY IF EXISTS "Auth insert own profile" ON alumni_profiles;
DROP POLICY IF EXISTS "Anon insert profiles" ON alumni_profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON alumni_profiles;

CREATE POLICY "public_select_profiles" ON alumni_profiles FOR SELECT USING (approved = true AND is_public = true);
CREATE POLICY "public_insert_profiles" ON alumni_profiles FOR INSERT WITH CHECK (true);
-- Public UPDATE stays open: the no-auth Pulse "edit my profile" flow keys rows by
-- a device session, so row ownership cannot be verified server-side yet. This is
-- no worse than before (RLS was entirely off). Revisit with real auth.
CREATE POLICY "public_update_profiles" ON alumni_profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_profiles" ON alumni_profiles FOR ALL USING (public.is_admin());

-- ============ site_settings: public read, admin write ============
DROP POLICY IF EXISTS "Service all" ON site_settings;
DROP POLICY IF EXISTS "admin_write_settings" ON site_settings;
CREATE POLICY "admin_write_settings" ON site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ events: public read, admin write ============
DROP POLICY IF EXISTS "anon_write_events" ON events;
DROP POLICY IF EXISTS "admin_write_events" ON events;
CREATE POLICY "admin_write_events" ON events FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ articles: public read, admin write ============
DROP POLICY IF EXISTS "Authenticated write access" ON articles;
DROP POLICY IF EXISTS "anon_write_articles" ON articles;
DROP POLICY IF EXISTS "admin_write_articles" ON articles;
CREATE POLICY "admin_write_articles" ON articles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ page_content: public read, admin write ============
DROP POLICY IF EXISTS "Authenticated write access" ON page_content;
DROP POLICY IF EXISTS "anon_write_page_content" ON page_content;
DROP POLICY IF EXISTS "admin_write_page_content" ON page_content;
CREATE POLICY "admin_write_page_content" ON page_content FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ class_notes: public insert/read, admin update/delete ============
DROP POLICY IF EXISTS "anon_all_notes" ON class_notes;
DROP POLICY IF EXISTS "admin_all_notes" ON class_notes;
CREATE POLICY "admin_all_notes" ON class_notes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ note_likes: public insert/read, admin delete ============
DROP POLICY IF EXISTS "Public delete likes" ON note_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON note_likes;
DROP POLICY IF EXISTS "admin_delete_likes" ON note_likes;
CREATE POLICY "admin_delete_likes" ON note_likes FOR DELETE USING (public.is_admin());

-- ============ note_comments: public insert/read, admin delete ============
DROP POLICY IF EXISTS "Public delete comments" ON note_comments;
DROP POLICY IF EXISTS "admin_delete_comments" ON note_comments;
CREATE POLICY "admin_delete_comments" ON note_comments FOR DELETE USING (public.is_admin());

-- ============ inquiries: public insert, admin read/delete ============
DROP POLICY IF EXISTS "Admins can read inquiries" ON inquiries;
DROP POLICY IF EXISTS "anon_delete_inquiries" ON inquiries;
DROP POLICY IF EXISTS "admin_read_inquiries" ON inquiries;
DROP POLICY IF EXISTS "admin_delete_inquiries" ON inquiries;
CREATE POLICY "admin_read_inquiries" ON inquiries FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_delete_inquiries" ON inquiries FOR DELETE USING (public.is_admin());

-- ============ donations: public insert, admin read ============
DROP POLICY IF EXISTS "Public read" ON donations;
DROP POLICY IF EXISTS "admin_read_donations" ON donations;
CREATE POLICY "admin_read_donations" ON donations FOR SELECT USING (public.is_admin());

-- ============ club_applications: public insert, admin read ============
DROP POLICY IF EXISTS "Public read" ON club_applications;
DROP POLICY IF EXISTS "admin_read_applications" ON club_applications;
CREATE POLICY "admin_read_applications" ON club_applications FOR SELECT USING (public.is_admin());

-- ============ mentorship_requests: public insert, admin read ============
DROP POLICY IF EXISTS "Public read" ON mentorship_requests;
DROP POLICY IF EXISTS "admin_read_mentorship" ON mentorship_requests;
CREATE POLICY "admin_read_mentorship" ON mentorship_requests FOR SELECT USING (public.is_admin());

-- ============ sports_scholarships: public insert, admin read ============
DROP POLICY IF EXISTS "Public read" ON sports_scholarships;
DROP POLICY IF EXISTS "admin_read_scholarships" ON sports_scholarships;
CREATE POLICY "admin_read_scholarships" ON sports_scholarships FOR SELECT USING (public.is_admin());

-- ============ alumni_businesses: public insert/read approved, admin write ============
DROP POLICY IF EXISTS "anon_write_businesses" ON alumni_businesses;
DROP POLICY IF EXISTS "anon_insert_businesses" ON alumni_businesses;
DROP POLICY IF EXISTS "admin_write_businesses" ON alumni_businesses;
CREATE POLICY "anon_insert_businesses" ON alumni_businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_write_businesses" ON alumni_businesses FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());