import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { IMAGES } from "@/lib/content";

export const Route = createFileRoute("/student-life")({
  head: () => ({
    meta: [
      { title: "Student Life — M.M College Wairaka" },
      {
        name: "description",
        content:
          "Clubs, service, outreach, and traditions: what life looks like between classes at M.M College Wairaka.",
      },
      { property: "og:title", content: "Student Life — M.M College Wairaka" },
      {
        property: "og:description",
        content:
          "Sixty clubs, a schoolwide service program, and a century of traditions.",
      },
      { property: "og:url", content: "/student-life" },
    ],
    links: [{ rel: "canonical", href: "/student-life" }],
  }),
  component: StudentLifePage,
});

const PILLARS = [
  {
    title: "Clubs & Societies",
    text: "More than sixty student-run organizations — from the Debate Union and the Astronomy Society to the longest continuously published student literary magazine in the city.",
  },
  {
    title: "Service",
    text: "Every senior completes forty hours with a single community partner. Last year students logged 29,400 hours across forty-one organizations.",
  },
  {
    title: "Retreats & Reflection",
    text: "Class retreats each year give students room to step back, unplug, and ask the bigger questions together.",
  },
  {
    title: "Traditions",
    text: "Founders' Day, the winter concert, senior-freshman mentorship, and the courtyard commencement that has closed every school year since 1920.",
  },
];

function StudentLifePage() {
  return (
    <main>
      <PageHero
        title="Student Life"
        subtitle="Sixty clubs, one community, a century of traditions"
        image={IMAGES.studentLife}
        imageAlt="Students at M.M College Wairaka"
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-[1.75rem] bg-secondary p-8"
            >
              <h3 className="font-display text-2xl font-semibold text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
