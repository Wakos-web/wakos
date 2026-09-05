-- Staff invites: code-based acceptance
-- Migration 013: invite acceptance used a recovery-link redirect that browsers
-- cannot complete cross-origin (the verify endpoint 303s and the fragment is
-- unreadable from the accept page). Replace it with a 6-digit one-time code
-- emailed to the invitee and verified server-side here.

ALTER TABLE staff_invites ADD COLUMN IF NOT EXISTS otp_code_hash TEXT;
ALTER TABLE staff_invites ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
ALTER TABLE staff_invites ADD COLUMN IF NOT EXISTS otp_attempts INTEGER NOT NULL DEFAULT 0;