import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { IMAGES } from "@/lib/content";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics — M.M College Wairaka" },
      {
        name: "description",
        content:
          "M.M College Wairaka's curriculum: sciences, humanities, practical skills, and character development.",
      },
      { property: "og:title", content: "Academics — M.M College Wairaka" },
      {
        property: "og:description",
        content:
          "Explore the curriculum and departments of M.M College Wairaka.",
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
    text: "Studio art, orchestra, choir, and a cultural production staged at the college auditorium.",
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
        imageAlt="Students studying at M.M College Wairaka"
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mx-auto max-w-3xl text-center leading-relaxed text-muted-foreground">
          M.M College Wairaka's course of study combines academic rigour with
          practical skills training. Students benefit from small class sizes,
          well-equipped laboratories, and a curriculum designed to prepare them
          for university and life beyond.
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
