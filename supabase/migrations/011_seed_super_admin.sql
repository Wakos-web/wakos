-- Seed the first super admin account so role-based login works end to end.
-- Migration 011: the owner's auth user may already exist (email OTP creates
-- it on first sign-in), so we resolve-or-create it, activate the bootstrap
-- invite, and insert the super_admin role row NOW — instead of waiting for
-- the invite-activation path to run on the first login.
--
-- After this migration:
--   * /admin email-OTP sign-in for the owner resolves roles immediately
--   * the passcode fallback accepts the owner (super_admin check passes)
--   * the Staff & Roles tab lists the owner as Active

DO $$
DECLARE
  v_email TEXT := 'kevinalerotek@gmail.com';
  v_name  TEXT := 'Site Owner';
  v_uid   UUID;
BEGIN
  -- 1. Resolve an existing auth user for this email, or create one.
  --    (OTP sign-in later finds the same user by email, so no duplicates.)
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(v_email) LIMIT 1;

  IF v_uid IS NULL THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
      'authenticated', 'authenticated', v_email, '',
      now(), now(), now(), '', '', '', ''
    )
    RETURNING id INTO v_uid;
  END IF;

  -- 2. Activate the bootstrap invite and link it to this auth user
  --    (unless it was explicitly removed by a super admin).
  INSERT INTO staff_invites (email, name, role, status, user_id, notes)
  VALUES (v_email, v_name, 'super_admin', 'active', v_uid, 'Bootstrap super admin')
  ON CONFLICT ((lower(email)))
  DO UPDATE SET
    status = CASE WHEN staff_invites.status = 'removed' THEN staff_invites.status ELSE 'active' END,
    user_id = CASE WHEN staff_invites.status = 'removed' THEN staff_invites.user_id ELSE v_uid END,
    updated_at = now();

  -- 3. Ensure the super_admin role row exists — RBAC checks and the admin
  --    session read user_roles live, so this is what unlocks the dashboard.
  INSERT INTO user_roles (user_id, role, created_by)
  VALUES (v_uid, 'super_admin', v_uid)
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Super admin ready: % (%)', v_email, v_uid;
END $$;