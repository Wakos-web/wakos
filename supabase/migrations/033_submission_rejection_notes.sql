-- 033: rejection feedback for the SubmissionsList tables.
-- club_applications, mentorship_requests and sports_scholarships carry a text
-- `status` verdict but nowhere to explain it, so the admin review modal could
-- not ask for (or show) rejection notes there. Mirror the alumni tables'
-- `rejected_notes` so ReviewModal can treat every reviewed table alike.
ALTER TABLE public.club_applications
  ADD COLUMN IF NOT EXISTS rejected_notes TEXT;
ALTER TABLE public.mentorship_requests
  ADD COLUMN IF NOT EXISTS rejected_notes TEXT;
ALTER TABLE public.sports_scholarships
  ADD COLUMN IF NOT EXISTS rejected_notes TEXT;
