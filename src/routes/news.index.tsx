import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { ARTICLES, IMAGES } from "@/lib/content";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News — M.M College Wairaka" },
      {
        name: "description",
        content:
          "The latest news and stories from M.M College Wairaka: academics, athletics, outreach, and college life.",
      },
      { property: "og:title", content: "News — M.M College Wairaka" },
      {
        property: "og:description",
        content: "Latest stories from around the college.",
      },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsIndexPage,
});

function NewsIndexPage() {
  return (
    <main>
      <PageHero
        title="News"
        subtitle="Stories from around the college"
        image={IMAGES.studentLife}
        imageAlt="Students at a college activities day"
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              to="/news/$slug"
              params={{ slug: article.slug }}
              className="group"
            >
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={article.image}
                  alt={article.title}
                  width={1024}
                  height={683}
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-primary">
                  {article.category}
                </span>
                <span className="text-muted-foreground">{article.date}</span>
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-snug text-foreground group-hover:text-primary">
                {article.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
