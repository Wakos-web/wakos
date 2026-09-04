import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ARTICLES } from "@/lib/content";

export const Route = createFileRoute("/campus-news/$slug")({
  head: ({ params }) => {
    return {
      meta: [{ title: "Campus News — M.M College Wairaka" }],
      links: [{ rel: "canonical", href: "/campus-news/" + params.slug }],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFound] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      // Try Supabase first
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (data) {
        setArticle(data);
        setLoading(false);
        return;
      }

      // Fallback to static articles
      const staticArticle = ARTICLES.find((a) => a.slug === slug);
      if (staticArticle) {
        setArticle(staticArticle);
        setLoading(false);
        return;
      }

      setNotFound(true);
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="animate-pulse">
          <div className="h-[50vh] bg-stone-200" />
          <div className="max-w-3xl mx-auto px-6 py-16 space-y-4">
            <div className="h-4 bg-stone-200 rounded w-1/4" />
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-full" />
            <div className="h-4 bg-stone-200 rounded w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (notFoundState || !article) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-40 text-center">
        <h1 className="font-display text-4xl font-bold text-stone-900">Story not found</h1>
        <Link to="/campus-news" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:underline">Back to Campus News</Link>
      </main>
    );
  }

  return (
    <main>
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <img src={article.image} alt={article.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">{article.category}</span>
            <span className="text-xs text-white/40">|</span>
            <span className="text-xs text-white/60">{article.date}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">{article.title}</h1>
        </div>
      </section>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-display text-2xl leading-relaxed text-stone-700 mb-8">{article.excerpt}</p>
        <div className="space-y-5 text-stone-600 font-body leading-relaxed">
          {article.body?.map((para: string) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-stone-200">
          <Link to="/campus-news" className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:underline hover:underline-offset-4">Back to Campus News</Link>
        </div>
      </article>
    </main>
  );
}
