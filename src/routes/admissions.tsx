import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, PencilLine, UsersRound } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { IMAGES } from "@/lib/content";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — M.M College Wairaka" },
      {
        name: "description",
        content:
          "How to apply to M.M College Wairaka: entrance examination, interview, and key dates for applicants.",
      },
      { property: "og:title", content: "Admissions — M.M College Wairaka" },
      {
        property: "og:description",
        content:
          "Admission to M.M College Wairaka rests on merit alone. Learn the steps and key dates.",
      },
      { property: "og:url", content: "/admissions" },
    ],
    links: [{ rel: "canonical", href: "/admissions" }],
  }),
  component: AdmissionsPage,
});

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Register",
    text: "Eighth graders register online between September and November. There is no application fee and no advantage to applying early.",
  },
  {
    icon: PencilLine,
    title: "2. Sit the examination",
    text: "Applicants sit the entrance examination in January: mathematics, English, and general knowledge, designed to identify students with the aptitude and determination to thrive.",
  },
  {
    icon: UsersRound,
    title: "3. Interview",
    text: "Finalists spend a Saturday morning at the school — classes, lunch with current students, and a conversation with two faculty members.",
  },
];

const FAQS = [
  {
    q: "What does it cost to attend?",
    a: "Nothing. Every student attends on a full scholarship covering tuition, books, meals, and travel. That has been true every year since 1965.",
  },
  {
    q: "Who may apply?",
    a: "Any student in eighth grade who lives within commuting distance. Roughly 2,400 students sit the examination each year for about 96 seats.",
  },
  {
    q: "Do legacy connections help?",
    a: "No. The admissions committee never learns an applicant's surname until decisions are final.",
  },
  {
    q: "When are decisions released?",
    a: "Decision letters arrive in mid-March. Admitted students and families are welcomed at an open house in April.",
  },
];

function AdmissionsPage() {
  return (
    <main>
      <PageHero
        title="Admissions"
        subtitle="One examination. One interview. No tuition — ever."
        image={IMAGES.hero}
        imageAlt="Students at M.M College Wairaka"
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-display text-4xl font-semibold text-foreground">
          How to apply
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="rounded-[1.75rem] bg-card p-8 shadow-sm ring-1 ring-border"
            >
              <step.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-gold-foreground">
            Begin your application <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </section>
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display text-4xl font-semibold text-foreground">
            Common questions
          </h2>
          <div className="mt-10 space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl bg-card p-6 ring-1 ring-border open:ring-primary/40"
              >
                <summary className="cursor-pointer list-none font-display text-xl font-semibold text-foreground">
                  {faq.q}
                  <span className="float-right text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
