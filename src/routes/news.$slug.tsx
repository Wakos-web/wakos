import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ARTICLES } from "@/lib/content";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    const article = ARTICLES.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Story unavailable — M.M College Wairaka" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} — M.M College Wairaka` },
        { name: "description", content: article.excerpt },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/news/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/news/${params.slug}` }],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-6 py-40 text-center">
      <h1 className="font-display text-4xl font-semibold text-foreground">
        Story not found
      </h1>
      <Link
        to="/news"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to news
      </Link>
    </main>
  ),
});

function ArticlePage() {
  const { article } = Route.useLoaderData();

  return (
    <main>
      <section className="relative">
        <img
          src={article.image}
          alt={article.title}
          width={1024}
          height={683}
          className="h-[45vh] min-h-72 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-foreground/30" />
        <div className="absolute inset-x-0 bottom-10 px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {article.category} &middot; {article.date}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
              {article.title}
            </h1>
          </div>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-display text-2xl leading-relaxed text-foreground">
          {article.excerpt}
        </p>
        <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">
          {article.body.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
        <Link
          to="/news"
          className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline hover:underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" /> All news
        </Link>
      </article>
    </main>
  );
}
