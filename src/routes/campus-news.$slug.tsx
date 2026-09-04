import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ARTICLES } from "@/lib/content";

export const Route = createFileRoute("/campus-news/$slug")({
  loader: async ({ params }) => {
    // Try Supabase first - only show published articles
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", params.slug)
      .eq("published", true)
      .single();
    
    if (data) return { article: data };
    
    // Fallback to static articles
    const staticArticle = ARTICLES.find((a) => a.slug === params.slug);
    if (staticArticle) return { article: staticArticle };
    
    throw notFound();
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Story unavailable" }] };
    const { article } = loaderData;
    return {
      meta: [{ title: article.title + " ,  Campus News" },{ name: "description", content: article.excerpt }],
      links: [{ rel: "canonical", href: "/campus-news/" + params.slug }],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-6 py-40 text-center">
      <h1 className="font-display text-4xl font-bold text-stone-900">Story not found</h1>
      <Link to="/campus-news" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:underline">Back to Campus News</Link>
    </main>
  ),
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
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
