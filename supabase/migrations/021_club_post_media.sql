-- 021: Club posts become media stories, mirroring MWOSA project updates.
-- Each "What we have been up to" card leads to a detail page full of
-- captioned images and videos, all managed from the co-editor studio (uploads
-- go to Supabase Storage — the URL is never entered by hand).

CREATE TABLE IF NOT EXISTS club_post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES club_posts(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image',   -- 'image' | 'video'
  media_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE club_post_media ENABLE ROW LEVEL SECURITY;

-- Public: published stories only (media rows inherit their post's visibility).
DROP POLICY IF EXISTS club_post_media_public_read ON club_post_media;
CREATE POLICY club_post_media_public_read ON club_post_media
  FOR SELECT
  USING (
    active = true
    AND post_id IN (SELECT id FROM club_posts WHERE published = true)
  );

-- Co-editors of the owning club may add / edit / remove media on their club's
-- posts (mirrors the club_posts editor policies in migration 008).
DROP POLICY IF EXISTS club_post_media_editor_insert ON club_post_media;
CREATE POLICY club_post_media_editor_insert ON club_post_media
  FOR INSERT TO authenticated
  WITH CHECK (
    post_id IN (
      SELECT p.id FROM club_posts p
      WHERE p.club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active')
    )
  );

DROP POLICY IF EXISTS club_post_media_editor_update ON club_post_media;
CREATE POLICY club_post_media_editor_update ON club_post_media
  FOR UPDATE TO authenticated
  USING (
    post_id IN (
      SELECT p.id FROM club_posts p
      WHERE p.club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active')
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT p.id FROM club_posts p
      WHERE p.club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active')
    )
  );

DROP POLICY IF EXISTS club_post_media_editor_delete ON club_post_media;
CREATE POLICY club_post_media_editor_delete ON club_post_media
  FOR DELETE TO authenticated
  USING (
    post_id IN (
      SELECT p.id FROM club_posts p
      WHERE p.club_id IN (SELECT club_id FROM club_editors WHERE user_id = auth.uid() AND status = 'active')
    )
  );

-- Placeholder media so every seeded post has a story page to show; co-editors
-- replace these from the club studio (edit post > Story media).
INSERT INTO club_post_media (post_id, media_type, media_url, caption, sort_order)
SELECT id, 'image', '/mwosa.jpeg', 'Photo placeholder — replace from the club studio.', 1
FROM club_posts
WHERE published = true
  AND NOT EXISTS (SELECT 1 FROM club_post_media m WHERE m.post_id = club_posts.id AND m.sort_order = 1);

INSERT INTO club_post_media (post_id, media_type, media_url, caption, sort_order)
SELECT id, 'video', '/hero-video.mp4', 'Video placeholder — replace from the club studio.', 2
FROM club_posts
WHERE published = true
  AND NOT EXISTS (SELECT 1 FROM club_post_media m WHERE m.post_id = club_posts.id AND m.sort_order = 2);

INSERT INTO club_post_media (post_id, media_type, media_url, caption, sort_order)
SELECT id, 'image', '/hero-poster.png', 'Photo placeholder — replace from the club studio.', 3
FROM club_posts
WHERE published = true
  AND NOT EXISTS (SELECT 1 FROM club_post_media m WHERE m.post_id = club_posts.id AND m.sort_order = 3);