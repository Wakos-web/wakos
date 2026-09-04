import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ARTICLES } from "@/lib/content";
import { ArrowLeft, Calendar, Tag, Clock, Share2, Bookmark, Eye, User } from "lucide-react";

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
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

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
        // Increment views
        await supabase
          .from("articles")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", data.id);
        // Fetch related articles
        const { data: related } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .eq("category", data.category)
          .neq("slug", slug)
          .limit(3);
        setRelatedArticles(related || []);
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
      <main className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-[60vh] bg-stone-200" />
          <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
            <div className="h-4 bg-stone-200 rounded w-1/4" />
            <div className="h-12 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-full" />
            <div className="space-y-4">
              <div className="h-4 bg-stone-200 rounded w-full" />
              <div className="h-4 bg-stone-200 rounded w-5/6" />
              <div className="h-4 bg-stone-200 rounded w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (notFoundState || !article) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-stone-900">Story not found</h1>
          <p className="mt-4 text-stone-500">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/campus-news" className="mt-6 inline-flex items-center gap-2 bg-green-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Campus News
          </Link>
        </div>
      </main>
    );
  }

  // Calculate reading time
  const wordCount = article.body?.join(" ").split(/\s+/).length || 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title} 
          className="absolute inset-0 h-full w-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            to="/campus-news" 
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Article Meta */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-800 text-white text-xs font-semibold rounded-full">
              <Tag className="h-3 w-3" />
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-white/70 text-sm">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="inline-flex items-center gap-1.5 text-white/70 text-sm">
              <Clock className="h-4 w-4" />
              {readingTime} min read
            </span>
            <span className="inline-flex items-center gap-1.5 text-white/70 text-sm">
              <Eye className="h-4 w-4" />
              {article.views || 0} views
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl font-body leading-relaxed">
            {article.excerpt}
          </p>
          
          {/* Share buttons */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-3">
              {article.author_avatar ? (
                <img src={article.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{article.author_name || "M.M College Wairaka"}</p>
                <p className="text-xs text-white/60">{article.author_role || "School Communications"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                <Bookmark className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Content */}
          <div className="prose prose-lg prose-stone max-w-none">
            {/* Lead paragraph */}
            <p className="text-xl md:text-2xl font-display leading-relaxed text-stone-700 mb-8 first-letter:text-6xl first-letter:font-bold first-letter:text-green-800 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
              {article.excerpt}
            </p>

            {/* Body paragraphs */}
            <div className="space-y-6 text-stone-600 font-body leading-relaxed text-lg">
              {article.body?.map((para: string, index: number) => (
                <p key={index}>{para}</p>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-8">
              {/* Author Card */}
              <div className="bg-stone-50 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-800 mb-3">About M.M College Wairaka</p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  M.M College Wairaka is a government-aided boarding school in Jinja, Uganda, shaping self-reliant leaders since 1953.
                </p>
                <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:underline">
                  Learn more about us →
                </Link>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-stone-50 rounded-2xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-800 mb-4">Related Stories</p>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link 
                        key={related.slug} 
                        to="/campus-news/$slug" 
                        params={{ slug: related.slug }}
                        className="group block"
                      >
                        <div className="flex gap-3">
                          <img 
                            src={related.image} 
                            alt={related.title} 
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <p className="text-xs text-stone-400">{related.date}</p>
                            <p className="text-sm font-semibold text-stone-900 group-hover:text-green-800 transition-colors line-clamp-2">
                              {related.title}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-green-800 rounded-2xl p-6 text-white">
                <p className="font-display text-lg font-bold mb-2">Join Our Community</p>
                <p className="text-sm text-white/80 mb-4">
                  Become part of the WACOS family and help shape the next generation of leaders.
                </p>
                <Link 
                  to="/admissions" 
                  className="inline-flex items-center gap-2 bg-white text-green-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-stone-100 transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Back to Campus News */}
        <div className="mt-16 pt-8 border-t border-stone-200">
          <Link 
            to="/campus-news" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:underline hover:underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campus News
          </Link>
        </div>
      </article>

      {/* Mobile Related Articles */}
      <section className="lg:hidden bg-stone-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-800 mb-4">Related Stories</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.slice(0, 2).map((related) => (
              <Link 
                key={related.slug} 
                to="/campus-news/$slug" 
                params={{ slug: related.slug }}
                className="group"
              >
                <img 
                  src={related.image} 
                  alt={related.title} 
                  className="w-full h-32 rounded-xl object-cover mb-2"
                />
                <p className="text-xs text-stone-400">{related.date}</p>
                <p className="text-sm font-semibold text-stone-900 group-hover:text-green-800 transition-colors">
                  {related.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
