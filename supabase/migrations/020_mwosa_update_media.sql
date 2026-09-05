-- 020: MWOSA project updates become media stories. Each update card leads to a
-- detail page full of captioned images and videos, all managed from the admin
-- dashboard (uploads go to Supabase Storage via the service-role proxy — the
-- URL is never entered by hand).

CREATE TABLE IF NOT EXISTS mwosa_update_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES mwosa_updates(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image',   -- 'image' | 'video'
  media_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mwosa_update_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read mwosa_update_media"
  ON mwosa_update_media FOR SELECT USING (active = true);

-- Cover previews for the update cards (placeholders — replace from admin)
UPDATE mwosa_updates SET image_url = '/mwosa.jpeg' WHERE image_url IS NULL;

-- Placeholder media so every seeded update has a story page to show; the admin
-- replaces these from the dashboard (MWOSA tab > Project Updates > Media).
INSERT INTO mwosa_update_media (update_id, media_type, media_url, caption, sort_order)
SELECT id, 'image', '/mwosa.jpeg', 'Project photo placeholder — replace from the admin dashboard.', 1
FROM mwosa_updates
WHERE NOT EXISTS (SELECT 1 FROM mwosa_update_media m WHERE m.update_id = mwosa_updates.id AND m.sort_order = 1);

INSERT INTO mwosa_update_media (update_id, media_type, media_url, caption, sort_order)
SELECT id, 'video', '/hero-video.mp4', 'Update video placeholder — replace from the admin dashboard.', 2
FROM mwosa_updates
WHERE title = 'Wairaka Trust Fund established'
  AND NOT EXISTS (SELECT 1 FROM mwosa_update_media m WHERE m.update_id = mwosa_updates.id AND m.sort_order = 2);

INSERT INTO mwosa_update_media (update_id, media_type, media_url, caption, sort_order)
SELECT id, 'image', '/hero-poster.png', 'Project photo placeholder — replace from the admin dashboard.', 2
FROM mwosa_updates
WHERE title = 'Physics Laboratory renovated'
  AND NOT EXISTS (SELECT 1 FROM mwosa_update_media m WHERE m.update_id = mwosa_updates.id AND m.sort_order = 2);