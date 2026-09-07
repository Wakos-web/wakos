-- MWOSA story media: YouTube in-play videos (same as club_post_media).
-- Editors paste a YouTube URL in the MWOSA media manager; the story page
-- renders it as a poster facade that swaps to an inline embed on click.
alter table mwosa_update_media add column if not exists youtube_url text;
