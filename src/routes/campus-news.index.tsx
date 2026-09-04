import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IMAGES, ARTICLES } from "@/lib/content";

export const Route = createFileRoute("/campus-news/")({
  head: () => ({
    meta: [{ title: "Campus News ,  M.M College Wairaka" },{ name: "description", content: "The latest news, stories, and updates from M.M College Wairaka." }],
    links: [{ rel: "canonical", href: "/campus-news" }],
  }),
  component: CampusNewsPage,
});

function HeroSection() {
  return (
    <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMAGES.studentLife} alt="Campus news" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-4">Campus News</h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl font-body">The latest news, stories, and updates from M.M College Wairaka.</p>
      </div>
    </section>
  );
}

function BlogGrid() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error || !data || data.length === 0) {
        // Fallback to static articles
        setArticles(ARTICLES);
      } else {
        setArticles(data);
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/2] bg-stone-200 rounded-2xl" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-stone-200 rounded w-1/4" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.slug} to="/campus-news/" params={{ slug: article.slug }} className="group">
              <div className="overflow-hidden rounded-2xl">
                <img src={article.image} alt={article.title} className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-800">{article.category}</span>
                  <span className="text-xs text-stone-400">|</span>
                  <span className="text-xs text-stone-500">{article.date}</span>
                </div>
                <h2 className="font-display text-xl font-bold text-stone-900 group-hover:text-green-800 transition-colors leading-snug">{article.title}</h2>
                <p className="mt-2 text-sm text-stone-500 font-body leading-relaxed line-clamp-2">{article.excerpt}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-green-800 group-hover:gap-2 transition-all">Read more</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CampusNewsPage() {
  return (
    <div>
      <HeroSection />
      <BlogGrid />
    </div>
  );
}
