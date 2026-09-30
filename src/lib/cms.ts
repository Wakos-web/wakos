/**
 * Server-safe CMS fetch used by ROUTE LOADERS (see src/routes/*.tsx).
 *
 * Loading page content in the loader means TanStack Start fetches it during
 * SSR: the CMS hero images and sections are present in the very first HTML
 * paint. The old approach (client-side useEffect in usePageContent) painted
 * the static fallback image first and swapped in the CMS image after
 * hydration — the "old image flashes before the new one" bug.
 *
 * Returns an empty map on any failure so pages always render with their
 * static fallbacks (never an error screen).
 */
export type PageContentMap = Record<string, any>;

export async function fetchPageContent(page: string): Promise<PageContentMap> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase
      .from("page_content")
      .select("section, content")
      .eq("page", page)
      .eq("published", true);
    const map: PageContentMap = {};
    (data || []).forEach((r: any) => {
      map[r.section] = r.content;
    });
    return map;
  } catch (e) {
    console.error(`fetchPageContent(${page}) failed, using fallbacks:`, e);
    return {};
  }
}

/**
 * Server-safe hero playlist read for the homepage route's head(): when the
 * school has curated playlist clips, the multi-MB default hero video must
 * NOT be preloaded in <head> — visitors would download a video the player
 * never shows. Returns [] on any failure so head() falls back to defaults.
 */
export async function fetchHeroPlaylistHead(): Promise<{ src: string; poster?: string }[]> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_playlist")
      .maybeSingle();
    const parsed = JSON.parse(data?.value || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v: any) => v && typeof v.src === "string" && v.src.startsWith("http"))
      .map((v: any) => {
        const clip: { src: string; poster?: string } = { src: v.src as string };
        if (typeof v.poster === "string" && v.poster.startsWith("http")) clip.poster = v.poster;
        return clip;
      });
  } catch {
    return [];
  }
}
