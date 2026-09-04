import { createFileRoute } from "@tanstack/react-router";
import { IMAGES } from "@/lib/content";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [{ title: "School Calendar ,  M.M College Wairaka" }],
    links: [{ rel: "canonical", href: "/calendar" }],
  }),
  component: CalendarPage,
});

const EVENTS = [
  { term: "Term 1", dates: "Feb 3 - Apr 18, 2026", highlights: ["Opening Ceremony", "Inter-house Sports", "Mid-term Break (Mar 14-22)", "Parents Day (Apr 11)"] },
  { term: "Term 2", dates: "May 5 - Jul 25, 2026", highlights: ["Opening Ceremony", "Mid-term Break (Jun 13-21)", "Science Fair (Jul 4)", "End of Term Exams"] },
  { term: "Term 3", dates: "Aug 25 - Nov 20, 2026", highlights: ["Opening Ceremony", "Inter-school Competitions", "Mid-term Break (Oct 3-11)", "Mock Exams (Nov 3-7)", "Graduation Ceremony"] },
];

function CalendarPage() {
  return (
    <div>
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.academics} alt="School calendar" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12">
          <h1 className="font-display text-5xl md:text-6xl text-white font-bold tracking-tight mb-4">School Calendar</h1>
          <p className="text-lg text-white/80 max-w-2xl font-body">Term dates and key events for the 2026 academic year.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {EVENTS.map((event) => (
            <div key={event.term} className="rounded-2xl bg-white border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-green-900 px-8 py-4">
                <h2 className="font-display text-2xl font-bold text-white">{event.term}</h2>
                <p className="text-white/70 text-sm mt-1">{event.dates}</p>
              </div>
              <div className="px-8 py-6">
                <ul className="space-y-3">
                  {event.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-green-800 shrink-0" />
                      <span className="text-stone-700 font-body">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
