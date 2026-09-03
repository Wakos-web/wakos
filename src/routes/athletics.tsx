import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { IMAGES, TEAMS } from "@/lib/content";

export const Route = createFileRoute("/athletics")({
  head: () => ({
    meta: [
      { title: "Athletics — M.M College Wairaka" },
      {
        name: "description",
        content:
          "WACOS athletics: eight sports, three seasons, and a tradition of scholar-athletes.",
      },
      { property: "og:title", content: "Athletics — M.M College Wairaka" },
      {
        property: "og:description",
        content:
          "Meet WACOS athletics: eight sports across three seasons.",
      },
      { property: "og:url", content: "/athletics" },
    ],
    links: [{ rel: "canonical", href: "/athletics" }],
  }),
  component: AthleticsPage,
});

function AthleticsPage() {
  return (
    <main>
      <PageHero
        title="Athletics"
        subtitle="Eight varsity sports. One standard: scholar first."
        image={IMAGES.athletics}
        imageAlt="WACOS athletes training"
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mx-auto max-w-3xl text-center leading-relaxed text-muted-foreground">
          Nearly three in four WACOS students participate in at least one sport.
          Practices are scheduled around academics, and no athlete has
          ever been excused from the academic standard that admits them.
        </p>
        <div className="mt-14 overflow-hidden rounded-[1.75rem] ring-1 ring-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Sport</th>
                <th className="px-6 py-4 font-semibold">Season</th>
                <th className="px-6 py-4 font-semibold">Levels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {TEAMS.map((team) => (
                <tr key={team.sport} className="transition-colors hover:bg-secondary">
                  <td className="px-6 py-4 font-display text-lg font-semibold text-foreground">
                    {team.sport}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{team.season}</td>
                  <td className="px-6 py-4 text-muted-foreground">{team.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
