import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { IMAGES } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [{ title: "School Calendar ,  M.M College Wairaka" }],
    links: [{ rel: "canonical", href: "/calendar" }],
  }),
  component: CalendarPage,
});

const TERMS = [
  { term: "Term 1", dates: "Feb 3 - Apr 18, 2026", highlights: ["Opening Ceremony", "Inter-house Sports", "Mid-term Break (Mar 14-22)", "Parents Day (Apr 11)"] },
  { term: "Term 2", dates: "May 5 - Jul 25, 2026", highlights: ["Opening Ceremony", "Mid-term Break (Jun 13-21)", "Science Fair (Jul 4)", "End of Term Exams"] },
  { term: "Term 3", dates: "Aug 25 - Nov 20, 2026", highlights: ["Opening Ceremony", "Inter-school Competitions", "Mid-term Break (Oct 3-11)", "Mock Exams (Nov 3-7)", "Graduation Ceremony"] },
];

type DbEvent = {
  title: string;
  event_date: string;
  location: string | null;
  description: string | null;
  category: string | null;
};

function fmtDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function EventsSection() {
  const [upcoming, setUpcoming] = useState<DbEvent[]>([]);
  const [past, setPast] = useState<DbEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let dead = false;
    supabase
      .from("events")
      .select("title, event_date, location, description, category")
      .eq("approved", true)
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        if (dead || !data) return;
        const today = new Date().toISOString().slice(0, 10);
        setUpcoming(data.filter((e: DbEvent) => e.event_date >= today).reverse());
        setPast(data.filter((e: DbEvent) => e.event_date < today).reverse());
        setLoaded(true);
      });
    return () => {
      dead = true;
    };
  }, []);

  const Card = ({ e }: { e: DbEvent }) => (
    <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-green-900 px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        <h3 className="font-display text-xl font-bold text-white">{e.title}</h3>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider">{e.category || "Event"}</span>
      </div>
      <div className="px-8 py-6 space-y-3">
        <p className="flex items-center gap-3 text-sm font-semibold text-stone-800">
          <Calendar className="h-4 w-4 text-green-800 shrink-0" />
          {fmtDate(e.event_date)}
        </p>
        {e.location && (
          <p className="flex items-center gap-3 text-sm text-stone-600">
            <MapPin className="h-4 w-4 text-green-800 shrink-0" />
            {e.location}
          </p>
        )}
        {e.description && <p className="text-stone-600 font-body leading-relaxed">{e.description}</p>}
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-3">What's On</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 font-bold">Upcoming events</h2>
        </div>
        {!loaded && <p className="text-center text-stone-500 font-body">Loading events...</p>}
        {loaded && upcoming.length === 0 && (
          <p className="text-center text-stone-500 font-body">No upcoming events scheduled yet. Check back soon.</p>
        )}
        <div className="space-y-8">
          {upcoming.map((e) => <Card key={e.title + e.event_date} e={e} />)}
        </div>
        {past.length > 0 && (
          <>
            <div className="text-center mt-16 mb-8">
              <h3 className="font-display text-2xl md:text-3xl text-stone-900 font-bold">Past events</h3>
            </div>
            <div className="space-y-8 opacity-75">
              {past.slice(0, 6).map((e) => <Card key={e.title + e.event_date} e={e} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

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
          <p className="text-lg text-white/80 max-w-2xl font-body">Term dates, key school events, and alumni gatherings for the 2026 academic year.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {TERMS.map((event) => (
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

      <EventsSection />
    </div>
  );
}