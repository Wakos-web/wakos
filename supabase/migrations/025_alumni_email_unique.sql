-- Alumni identity: one profile per email.
--
-- The Pulse signup and business-registration flows guard against duplicates
-- with a read-then-insert check, but a transient failure of that existence
-- read silently fell through to INSERT (the flows dropped the read error).
-- With no unique constraint on alumni_profiles.email, the duplicate row was
-- created while the UI reported success — the same silent-success class as
-- the accept-invite role-attach bug. Worse, useAlumniAuth's email-link
-- (.maybeSingle()) then errors on the duplicate, sending the user back to
-- "register again" and compounding the mess.
--
-- This index is the DB backstop: a second insert for the same email now fails
-- loudly (23505) and the flows' existing insert-error handling surfaces it.
-- NULL emails are ignored (they were never signable anyway).

CREATE UNIQUE INDEX IF NOT EXISTS alumni_profiles_email_key
  ON alumni_profiles (lower(email));