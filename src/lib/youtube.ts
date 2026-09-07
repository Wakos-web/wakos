/**
 * YouTube URL helpers shared by the club editor studio (URL entry), the story
 * pages (in-play embeds) and the lightbox.
 */

/** Extract the video id from any common YouTube URL form. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,20})/,
  );
  return m && m[1] ? m[1] : null;
}

/** Canonical watch URL for a video id (stored as the normalized backend URL). */
export function youtubeWatchUrl(id: string): string {
  return "https://www.youtube.com/watch?v=" + id;
}

/** Inline embed URL — autoplay when `autoplay` is set (facade click-through). */
export function youtubeEmbedUrl(id: string, autoplay = false): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (autoplay) params.set("autoplay", "1");
  return "https://www.youtube.com/embed/" + id + "?" + params.toString();
}

/** Poster/thumbnail frame for a video id. */
export function youtubeThumbUrl(id: string): string {
  return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
}
