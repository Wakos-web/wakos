-- Club story media: YouTube in-play videos.
-- Editors paste a YouTube URL in the club editor studio; the story page and
-- lightbox render it as an inline embed. media_url keeps the original URL as
-- fallback; youtube_url is the normalized watch URL used for embed/thumbnail.
alter table club_post_media add column if not exists youtube_url text;
