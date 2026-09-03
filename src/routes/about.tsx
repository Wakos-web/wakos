import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/page-hero";
import { IMAGES } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — M.M College Wairaka" },
      {
        name: "description",
        content:
          "Founded in 1965, M.M College Wairaka is built on one conviction: discipline, hard work, and self-reliance.",
      },
      { property: "og:title", content: "About — M.M College Wairaka" },
      {
        property: "og:description",
        content:
          "The story and mission of M.M College Wairaka, serving the Busoga region since 1965.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const MILESTONES = [
  {
    year: "1965",
    text: "M.M College Wairaka opens its doors to the first cohort of students in the Busoga region.",
  },
  {
    year: "1975",
    text: "The school expands its campus and introduces the practical skills programme.",
  },
  {
    year: "1985",
    text: "The college moves to its current campus at Wairaka, with facilities built through community effort.",
  },
  {
    year: "1995",
    text: "Community outreach becomes a core part of the curriculum: students partner with local organisations.",
  },
  {
    year: "2010",
    text: "New science laboratories and workshops open, funded by old students and friends of the college.",
  },
  {
    year: "2026",
    text: "The college welcomes over 1,800 students from 58 districts across Uganda.",
  },
];

function AboutPage() {
  return (
    <main>
      <PageHero
        title="About WACOS"
        subtitle="One hundred ten years of tuition-free, merit-based education"
        image={IMAGES.campus}
        imageAlt="M.M College Wairaka campus"
      />
      <section className="py-20">
        <Prose>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Our story
          </h2>
          <p>
            M.M College Wairaka was founded in 1965 with a clear mission: to provide
            quality education rooted in discipline, hard work, and self-reliance.
            From humble beginnings, the college has grown into one of the leading
            secondary schools in the Busoga region, serving students from across Uganda.
          </p>
          <p>
            Today M.M College Wairaka enrolls over 1,800 students drawn from
            58 districts across Uganda. Admission is based on merit, and the
            college has built a reputation for academic excellence, practical
            skills development, and character formation.
          </p>
          <h2 className="pt-6 font-display text-3xl font-semibold text-foreground">
            What we believe
          </h2>
          <p>
            We hold that intellectual seriousness and personal decency are
            taught together or not at all. Students read difficult books, write
            every day, compete hard, and serve their neighbors — and they do it
            alongside classmates from 184 different zip codes.
          </p>
        </Prose>
      </section>
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center font-display text-4xl font-semibold text-foreground">
            Milestones
          </h2>
          <div className="mt-12 space-y-8">
            {MILESTONES.map((m) => (
              <div key={m.year} className="flex gap-6">
                <p className="w-20 shrink-0 font-display text-2xl font-semibold text-primary">
                  {m.year}
                </p>
                <p className="border-l border-border pl-6 text-muted-foreground">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
