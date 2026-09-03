import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Prose } from "@/components/page-hero";
import { IMAGES } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Aldermont Hall School" },
      {
        name: "description",
        content:
          "Founded in 1916, Aldermont Hall is a tuition-free, merit-based college preparatory school built on one conviction: brilliance is evenly distributed, opportunity is not.",
      },
      { property: "og:title", content: "About — Aldermont Hall School" },
      {
        property: "og:description",
        content:
          "The story and mission of Aldermont Hall, tuition-free since 1916.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const MILESTONES = [
  {
    year: "1916",
    text: "Eleven students gather for the first classes in a borrowed brownstone on the Upper East Side.",
  },
  {
    year: "1924",
    text: "The founding endowment is established, guaranteeing that no family will ever pay tuition.",
  },
  {
    year: "1958",
    text: "Aldermont moves to its current home, a red-brick landmark built for the school by alumni.",
  },
  {
    year: "1989",
    text: "The service requirement is introduced: every senior completes forty hours with one community partner.",
  },
  {
    year: "2011",
    text: "The STEM wing and observatory open, funded entirely by the sesquicentennial campaign.",
  },
  {
    year: "2026",
    text: "The school welcomes its 110th class — ninety-six students from 184 zip codes.",
  },
];

function AboutPage() {
  return (
    <main>
      <PageHero
        title="About Aldermont"
        subtitle="One hundred ten years of tuition-free, merit-based education"
        image={IMAGES.campus}
        imageAlt="The historic red-brick Aldermont Hall building"
      />
      <section className="py-20">
        <Prose>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Our story
          </h2>
          <p>
            Aldermont Hall was founded in 1916 by a small circle of educators
            who believed that a rigorous secondary education should be free to
            any student who earned it. They rented rooms in a brownstone,
            admitted eleven boys by examination, and made a promise that still
            governs the school: no family would ever receive a bill.
          </p>
          <p>
            Today Aldermont enrolls just under four hundred students drawn from
            every corner of the city. Admission rests on a single merit
            examination and an interview — never on a family's means, alumni
            connections, or ability to pay. The result is a student body that
            looks like the city itself.
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
