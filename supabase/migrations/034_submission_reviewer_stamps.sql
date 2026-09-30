-- 034: reviewer stamps for the SubmissionsList tables.
-- club_applications already has reviewed_by/reviewed_at; mentorship_requests
-- and sports_scholarships did not, so verdicts recorded from the admin
-- dashboard couldn't say who decided or when. Re-state rejected_notes here too
-- (033) so the whole set converges in one migration for environments that
-- haven't applied 033 yet.
ALTER TABLE public.mentorship_requests
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE public.mentorship_requests
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.mentorship_requests
  ADD COLUMN IF NOT EXISTS rejected_notes TEXT;
ALTER TABLE public.sports_scholarships
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE public.sports_scholarships
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.sports_scholarships
  ADD COLUMN IF NOT EXISTS rejected_notes TEXT;
