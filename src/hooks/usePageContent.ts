import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Fetches published CMS sections for a page (e.g. "about") from page_content.
 * Returns a map of section -> content object, and whether the fetch finished.
 * Pages use it as: `const { content } = usePageContent("about")` then fall back
 * to their static data when a section is missing.
 */
export function usePageContent(page: string) {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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