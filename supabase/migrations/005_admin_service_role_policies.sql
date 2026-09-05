-- Admin mutations moved behind the Nitro server route (admin-server.ts), which
-- replays them with the service-role key. The service role bypasses RLS, so the
-- x-admin-secret / public.is_admin() policies below are no longer used by the
-- app — and keeping them would leave the old secret trusted at the DB layer.
-- Drop them so anonymous access is limited to public reads + submission inserts.

drop policy if exists "admin_write_businesses" on public.alumni_businesses;
drop policy if exists "admin_all_profiles" on public.alumni_profiles;
drop policy if exists "admin_write_articles" on public.articles;
drop policy if exists "admin_all_notes" on public.class_notes;
drop policy if exists "admin_read_applications" on public.club_applications;
drop policy if exists "admin_read_donations" on public.donations;
drop policy if exists "admin_write_events" on public.events;
drop policy if exists "admin_delete_inquiries" on public.inquiries;
drop policy if exists "admin_read_inquiries" on public.inquiries;
drop policy if exists "admin_read_mentorship" on public.mentorship_requests;
drop policy if exists "admin_delete_comments" on public.note_comments;
drop policy if exists "admin_delete_likes" on public.note_likes;
drop policy if exists "admin_write_page_content" on public.page_content;
drop policy if exists "admin_write_settings" on public.site_settings;
drop policy if exists "admin_read_scholarships" on public.sports_scholarships;

-- No longer referenced anywhere once the policies above are gone.
drop function if exists public.is_admin();