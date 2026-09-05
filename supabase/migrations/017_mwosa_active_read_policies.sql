-- 017: mwosa public reads should only expose active rows, matching the site's
-- publish/unpublish toggle. Draft (inactive) stats, links, and updates must not
-- be readable through the public API — the admin UI is unaffected (it reads
-- via the service-role proxy, which bypasses RLS).
DROP POLICY IF EXISTS "public read mwosa_stats" ON mwosa_stats;
DROP POLICY IF EXISTS "public read mwosa_links" ON mwosa_links;
DROP POLICY IF EXISTS "public read mwosa_updates" ON mwosa_updates;

CREATE POLICY "public read mwosa_stats" ON mwosa_stats FOR SELECT USING (active = true);
CREATE POLICY "public read mwosa_links" ON mwosa_links FOR SELECT USING (active = true);
CREATE POLICY "public read mwosa_updates" ON mwosa_updates FOR SELECT USING (active = true);