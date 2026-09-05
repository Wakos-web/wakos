-- Staff identity & invites
-- Migration 009: replaces the shared admin passcode with per-person accounts.
--
-- The super admin invites a staff member by email + role into `staff_invites`.
-- The invite stays `pending` until that person signs in at /admin with the
-- email one-time code (Supabase Auth). A server function then activates the
-- invite: it inserts the matching `user_roles` row (so existing RBAC checks
-- keep working), copies the club scope for club patrons, and returns the
-- session that issues the httpOnly staff cookie carrying the auth user_id.
--
-- RLS: enabled with NO policies, so anon/authenticated can never read or
-- modify invitations; every access goes through the service-role server fns.

CREATE TABLE IF NOT EXISTS staff_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'club_patron', 'alumni_patron')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_invites_email_key ON staff_invites (lower(email));
CREATE INDEX IF NOT EXISTS idx_staff_invites_status ON staff_invites (status);
CREATE INDEX IF NOT EXISTS idx_staff_invites_user ON staff_invites (user_id);

ALTER TABLE staff_invites ENABLE ROW LEVEL SECURITY;

-- Bootstrap: the site owner is the first super admin. They sign in with their
-- email OTP and the invite auto-activates (no password, no shared passcode).
INSERT INTO staff_invites (email, name, role, status, notes)
VALUES ('kevinalerotek@gmail.com', 'Site Owner', 'super_admin', 'pending', 'Bootstrap super admin')
ON CONFLICT DO NOTHING;
