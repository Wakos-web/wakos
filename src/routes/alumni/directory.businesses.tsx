import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Globe, Phone, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/alumni/directory/businesses")({
  head: () => ({
    meta: [
      { title: "Business Directory — M.M College Wairaka" },
      { name: "description", content: "Browse businesses owned by WACOS alumni. Find services, products, and professionals from the Wairaka community." },
    ],
  }),
  component: BusinessesPage,
});

export type AlumniBusiness = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: string;
  website: string | null;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  approved: boolean;
};

const CATEGORIES = [
  "All", "Education", "Technology", "Agriculture", "Health", "Finance",
  "Construction", "Transport", "Retail", "Media", "Legal", "Other"
];

function BusinessesPage() {
  const [businesses, setBusinesses] = useState<AlumniBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("alumni_businesses")
      .select("*")
      .eq("approved", true)
      .order("name");
    setBusinesses(data || []);
    setLoading(false);
  };

  const filtered = businesses.filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === "All" || b.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-green-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-10">
          <Link to="/alumni" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> Alumni
          </Link>
          <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-tight">
            Business Directory
          </h1>
          <p className="text-lg text-white/70 mt-2 font-body">
            {businesses.length} businesses listed by WACOS alumni
          </p>
        </div>
      </section>

      {/* Search and filters */}
      <section className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-stone-300 pl-10 pr-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                placeholder="Search businesses..."
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-400 text-lg font-body">No businesses found.</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }}
                className="mt-4 text-green-800 font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500 mb-6">{filtered.length} businesses</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(biz => (
                  <div key={biz.id} className="rounded-2xl bg-white border border-stone-200 p-6 hover:border-green-800 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                        {biz.logo_url ? (
                          <img src={biz.logo_url} alt={biz.name} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-green-800">{biz.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-stone-900 truncate">{biz.name}</h3>
                        <span className="inline-block text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full mt-1">
                          {biz.category}
                        </span>
                      </div>
                    </div>
                    {biz.description && (
                      <p className="text-sm text-stone-600 mt-4 line-clamp-3 font-body">{biz.description}</p>
                    )}
                    <div className="mt-4 space-y-2">
                      {biz.location && (
                        <p className="text-sm text-stone-500 flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" /> {biz.location}
                        </p>
                      )}
                      {biz.phone && (
                        <p className="text-sm text-stone-500 flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" /> {biz.phone}
                        </p>
                      )}
                      {biz.website && (
                        <a href={biz.website} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-green-800 flex items-center gap-2 hover:underline">
                          <Globe className="h-4 w-4 shrink-0" /> Website
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
