-- Club co-editor workflow
-- Migration 008: patrons (admin) invite a student chairperson/secretary to write
-- club posts. Posts land as `pending` and only go live once the patron approves.

-- 1. club_editors — who may write for a club
CREATE TABLE IF NOT EXISTS club_editors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL DEFAULT 'Chairperson',
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, email)
);

CREATE INDEX IF NOT EXISTS idx_club_editors_club ON club_editors(club_id);
CREATE INDEX IF NOT EXISTS idx_club_editors_email ON club_editors(lower(email));
CREATE INDEX IF NOT EXISTS idx_club_editors_user ON club_editors(user_id);

-- 2. club_posts — workflow columns (existing rows are already live = published)
ALTER TABLE club_posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
  CHECK (status IN ('pending', 'published', 'rejected'));
ALTER TABLE club_posts ADD COLUMN IF NOT EXISTS author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE club_posts ADD COLUMN IF NOT EXISTS editor_name TEXT;
ALTER TABLE club_posts ADD COLUMN IF NOT EXISTS editor_role TEXT;
ALTER TABLE club_posts ADD COLUMN IF NOT EXISTS review_note TEXT;
ALTER TABLE club_posts ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE club_posts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

UPDATE club_posts SET status = 'published' WHERE published = true;
UPDATE club_posts SET status = 'pending' WHERE published = false AND status = 'published';

-- 3. RLS on club_posts (was wide open). Public: published only. Editors: own club.
ALTER TABLE club_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS club_posts_public_read ON club_posts;
CREATE POLICY club_posts_public_read ON club_posts
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS club_posts_editor_read ON club_posts;
CREATE POLICY club_posts_editor_read ON club_posts
  FOR SELECT TO authenticated
  USING (club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active'));

DROP POLICY IF EXISTS club_posts_editor_insert ON club_posts;
CREATE POLICY club_posts_editor_insert ON club_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending' AND published = false AND author_user_id = auth.uid()
    AND club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active')
  );

DROP POLICY IF EXISTS club_posts_editor_update ON club_posts;
CREATE POLICY club_posts_editor_update ON club_posts
  FOR UPDATE TO authenticated
  USING (
    author_user_id = auth.uid()
    AND status IN ('pending', 'rejected') AND published = false
    AND club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active')
  )
  WITH CHECK (
    author_user_id = auth.uid() AND status IN ('pending', 'rejected') AND published = false
  );

DROP POLICY IF EXISTS club_posts_editor_delete ON club_posts;
CREATE POLICY club_posts_editor_delete ON club_posts
  FOR DELETE TO authenticated
  USING (
    author_user_id = auth.uid()
    AND status IN ('pending', 'rejected') AND published = false
    AND club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active')
  );

-- 4. RLS on club_editors — editors see their own active rows and may activate
--    their own pending invite after signing in with that email (OTP verifies it).
ALTER TABLE club_editors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS editors_read_own ON club_editors;
CREATE POLICY editors_read_own ON club_editors
  FOR SELECT TO authenticated
  USING (
    (user_id = auth.uid() AND status = 'active')
    OR (status = 'pending' AND lower(email) = lower(auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS editors_self_activate ON club_editors;
CREATE POLICY editors_self_activate ON club_editors
  FOR UPDATE TO authenticated
  USING (status = 'pending' AND lower(email) = lower(auth.jwt() ->> 'email'))
  WITH CHECK (status = 'active' AND user_id = auth.uid() AND lower(email) = lower(auth.jwt() ->> 'email'));
