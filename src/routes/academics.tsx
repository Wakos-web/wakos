import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { IMAGES } from "@/lib/content";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics — Aldermont Hall School" },
      {
        name: "description",
        content:
          "Aldermont Hall's curriculum: classical languages, laboratory sciences, daily writing, and a seminar program taught at college depth.",
      },
      { property: "og:title", content: "Academics — Aldermont Hall School" },
      {
        property: "og:description",
        content:
          "Explore the curriculum and departments of Aldermont Hall School.",
      },
      { property: "og:url", content: "/academics" },
    ],
    links: [{ rel: "canonical", href: "/academics" }],
  }),
  component: AcademicsPage,
});

const DEPARTMENTS = [
  {
    name: "Humanities",
    text: "Four years of literature, history, and philosophy taught in seminar. Every student writes a thesis-length essay senior year.",
  },
  {
    name: "Mathematics & Computer Science",
    text: "From accelerated algebra through multivariable calculus and machine learning electives in the Lovelace Lab.",
  },
  {
    name: "Natural Sciences",
    text: "Laboratory-first physics, chemistry, and biology, with research placements for juniors and seniors.",
  },
  {
    name: "Classical & Modern Languages",
    text: "Latin for all; Greek, Spanish, French, and Mandarin through the advanced seminar level.",
  },
  {
    name: "Fine & Performing Arts",
    text: "Studio art, orchestra, choir, and a winter drama production staged in the 1916 Playhouse.",
  },
  {
    name: "Theology & Ethics",
    text: "A capstone sequence examining moral questions across traditions, anchored in the school's founding values.",
  },
];

function AcademicsPage() {
  return (
    <main>
      <PageHero
        title="Academics"
        subtitle="A classical curriculum taught at college depth"
        image={IMAGES.academics}
        imageAlt="Students studying in the Aldermont library"
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mx-auto max-w-3xl text-center leading-relaxed text-muted-foreground">
          Aldermont's course of study is deliberately old-fashioned in its rigor
          and deliberately modern in its reach. Classes are small, seminars are
          the norm by junior year, and every graduate has completed coursework
          most students do not see until college.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.name}
              className="rounded-[1.75rem] bg-card p-8 shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
            >
              <h3 className="font-display text-2xl font-semibold text-primary">
                {dept.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {dept.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
