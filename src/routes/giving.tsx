import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HandCoins, HeartHandshake, Landmark } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { IMAGES, SCHOOL_NAME } from "@/lib/content";

export const Route = createFileRoute("/giving")({
  head: () => ({
    meta: [
      { title: "Giving — M.M College Wairaka" },
      {
        name: "description",
        content:
          "Support M.M College Wairaka. Gifts from old students and friends fund bursaries, laboratories, and the practical skills workshops.",
      },
      { property: "og:title", content: "Giving — M.M College Wairaka" },
      {
        property: "og:description",
        content:
          "How gifts from old students and friends sustain the college.",
      },
      { property: "og:url", content: "/giving" },
    ],
    links: [{ rel: "canonical", href: "/giving" }],
  }),
  component: GivingPage,
});

const FUNDS = [
  {
    icon: HandCoins,
    title: "Bursary Fund",
    text: "Covers fees, uniforms, and boarding for students who would otherwise leave school. Two hundred and eleven students were supported last year.",
  },
  {
    icon: Landmark,
    title: "Laboratories & Workshops",
    text: "Equips the science laboratories and the carpentry, metalwork, and agriculture workshops where every student spends part of each week.",
  },
  {
    icon: HeartHandshake,
    title: "Community Outreach",
    text: "Funds the tree nursery, the health outreach days, and the adult literacy evening classes run by our senior students.",
  },
];

function GivingPage() {
  return (
    <main>
      <PageHero
        title="Giving"
        subtitle="The college was built by people who did it themselves"
        image={IMAGES.giving}
        imageAlt="Old students gathered at a college function"
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mx-auto max-w-3xl text-center leading-relaxed text-muted-foreground">
          {SCHOOL_NAME} has always depended on the effort of the people who
          belong to it. Old students, parents, and friends of the college fund
          the bursaries, the workshops, and the outreach programmes that keep
          the motto honest.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FUNDS.map((fund) => (
            <div
              key={fund.title}
              className="rounded-[1.75rem] bg-card p-8 shadow-sm ring-1 ring-border"
            >
              <fund.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">
                {fund.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {fund.text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-semibold text-primary-foreground md:text-5xl">
            Make a gift
          </h2>
          <p className="mt-5 leading-relaxed text-primary-foreground/80">
            Every contribution goes directly to students. To arrange a gift or a
            pledge, contact the Development Office at the college.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-105"
          >
            Contact the Development Office <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
