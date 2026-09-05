-- 019: MWOSA project updates can carry a photo.
-- Admins upload the image through the dashboard (Supabase Storage via the
-- service-role proxy, never a raw URL field); the public /mwosa timeline
-- renders it when present.
ALTER TABLE mwosa_updates ADD COLUMN IF NOT EXISTS image_url TEXT;