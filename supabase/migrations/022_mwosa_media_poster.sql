-- 022: Video media can carry a poster/thumbnail frame so cards and players
-- show a still image before playback. Uploads go through the same admin
-- media manager (Supabase Storage — never a raw URL).

ALTER TABLE mwosa_update_media
  ADD COLUMN IF NOT EXISTS poster_url TEXT;