-- 018: giving public reads should only expose active rows, matching the site's
-- publish/unpublish toggle and the pattern applied to MWOSA (migration 017).
-- Draft (inactive) ways, stats, bank accounts, and mobile-money numbers must not
-- be readable through the public API — the admin UI is unaffected (it reads and
-- writes via the service-role proxy, which bypasses RLS).
-- giving_contact is a single always-public row (no active column); donations is
-- insert-only for the public with no SELECT policy, so both are left untouched.
DROP POLICY IF EXISTS "public read giving_ways" ON giving_ways;
DROP POLICY IF EXISTS "public read giving_stats" ON giving_stats;
DROP POLICY IF EXISTS "public read donation_accounts" ON donation_accounts;
DROP POLICY IF EXISTS "public read mobile_donations" ON mobile_donations;

CREATE POLICY "public read giving_ways" ON giving_ways FOR SELECT USING (active = true);
CREATE POLICY "public read giving_stats" ON giving_stats FOR SELECT USING (active = true);
CREATE POLICY "public read donation_accounts" ON donation_accounts FOR SELECT USING (active = true);
CREATE POLICY "public read mobile_donations" ON mobile_donations FOR SELECT USING (active = true);