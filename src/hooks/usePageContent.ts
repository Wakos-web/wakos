import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Fetches published CMS sections for a page (e.g. "about") from page_content.
 * Returns a map of section -> content object, and whether the fetch finished.
 * Pages use it as: `const { content } = usePageContent("about")` then fall back
 * to their static data when a section is missing.
 *
 * Pass the route loader's data as the second argument (see src/lib/cms.ts):
 *   loader: async () => ({ cms: await fetchPageContent("about") })
 *   const { content } = usePageContent("about", Route.useLoaderData().cms)
 * The CMS content then arrives with the SSR HTML — no fallback flash after
 * hydration. Without it, the fetch happens client-side after first paint.
 */
export function usePageContent(page: string, initial?: Record<string, any>) {
  const [content, setContent] = useState<Record<string, any>>(initial || {});
  const [loaded, setLoaded] = useState(!!initial);

  useEffect(() => {
    if (initial) return; // loader data is authoritative; skip the refetch
    let dead = false;
    supabase
      .from("page_content")
      .select("section, content")
      .eq("page", page)
      .eq("published", true)
      .then(({ data }) => {
        if (dead) return;
        const map: Record<string, any> = {};
        (data || []).forEach((r: any) => {
          map[r.section] = r.content;
        });
        setContent(map);
        setLoaded(true);
      });
    return () => {
      dead = true;
    };
  }, [page]);

  return { content, loaded };
}