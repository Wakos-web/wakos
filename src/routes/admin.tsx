import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, Users, BookOpen, Calendar, MessageSquare,
  Building2, GraduationCap, Heart, ChevronRight, Check, X,
  RefreshCw, Eye, Trash2, Settings, BarChart3, Megaphone
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — M.M College Wairaka" }],
  }),
  component: AdminPage,
});

type Tab = "overview" | "clubs" | "alumni" | "events" | "notes" | "inquiries" | "businesses" | "settings";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="font-display text-3xl font-bold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
    </div>
  );
}

function OverviewTab({ stats }: { stats: Record<string, number> }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={LayoutDashboard} label="Total Clubs" value={stats.clubs} color="bg-green-800" />
        <StatCard icon={Users} label="Club Members" value={stats.clubMembers} color="bg-blue-600" />
        <StatCard icon={GraduationCap} label="Alumni Profiles" value={stats.alumni} color="bg-purple-600" />
        <StatCard icon={Building2} label="Businesses" value={stats.businesses} color="bg-amber-600" />
        <StatCard icon={Calendar} label="Events" value={stats.events} color="bg-rose-600" />
        <StatCard icon={BookOpen} label="Class Notes" value={stats.notes} color="bg-cyan-600" />
        <StatCard icon={Megaphone} label="Club Posts" value={stats.clubPosts} color="bg-indigo-600" />
        <StatCard icon={MessageSquare} label="Inquiries" value={stats.inquiries} color="bg-orange-600" />
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/clubs" className="group rounded-2xl bg-green-50 border border-green-200 p-6 hover:border-green-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800 uppercase tracking-wider">Clubs CMS</p>
              <p className="font-display text-lg font-bold text-stone-900 mt-1">Manage Clubs & Members</p>
              <p className="text-sm text-stone-500 mt-1">Create, edit, and manage all 10 clubs, their members, and blog posts.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-green-800 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link to="/alumni/directory/admin" className="group rounded-2xl bg-purple-50 border border-purple-200 p-6 hover:border-purple-800 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Alumni Admin</p>
              <p className="font-display text-lg font-bold text-stone-900 mt-1">Moderate Alumni & Businesses</p>
              <p className="text-sm text-stone-500 mt-1">Approve or reject alumni profiles and business directory listings.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-purple-800 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function ClubsTab({ clubs, members }: { clubs: any[]; members: any[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Clubs ({clubs.length})</h3>
        <Link to="/clubs" className="text-sm font-semibold text-green-800 hover:underline">Manage →</Link>
      </div>
      <div className="space-y-3">
        {clubs.map((club) => {
          const clubM = members.filter((m: any) => m.club_id === club.id);
          const patron = clubM.find((m: any) => m.role === "Patron");
          return (
            <div key={club.id} className="rounded-xl bg-white border border-stone-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-800">{club.name.charAt(0)}</span>
                </div>
                <div>
                  <Link to={`/clubs/$slug`} params={{ slug: club.slug }} className="font-display text-lg font-bold text-stone-900 hover:text-green-800 transition-colors">{club.name}</Link>
                  <p className="text-sm text-stone-500">{clubM.length} members · {patron ? patron.name : "No patron"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/clubs/$slug`} params={{ slug: club.slug }} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
                  <Eye className="h-4 w-4 text-stone-400" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventsTab({ events, onRefresh }: { events: any[]; onRefresh: () => void }) {
  const approve = async (id: string) => {
    await supabase.from("events").update({ approved: true }).eq("id", id);
    onRefresh();
  };
  const remove = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    onRefresh();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Events ({events.length})</h3>
        <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Calendar className="h-10 w-10 mx-auto mb-3" />
          <p>No events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div key={evt.id} className="rounded-xl bg-white border border-stone-200 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${evt.approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {evt.approved ? "Approved" : "Pending"}
                  </span>
                  <span className="text-xs text-stone-400">{evt.category}</span>
                </div>
                <p className="font-display text-lg font-bold text-stone-900">{evt.title}</p>
                <p className="text-sm text-stone-500">{evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "No date"}{evt.location ? " · " + evt.location : ""}</p>
              </div>
              <div className="flex items-center gap-1">
                {!evt.approved && (
                  <button onClick={() => approve(evt.id)} className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="Approve">
                    <Check className="h-4 w-4 text-green-600" />
                  </button>
                )}
                <button onClick={() => remove(evt.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesTab({ notes, onRefresh }: { notes: any[]; onRefresh: () => void }) {
  const approve = async (id: string) => {
    await supabase.from("class_notes").update({ approved: true }).eq("id", id);
    onRefresh();
  };
  const remove = async (id: string) => {
    await supabase.from("class_notes").delete().eq("id", id);
    onRefresh();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Class Notes ({notes.length})</h3>
        <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
      </div>
      {notes.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <BookOpen className="h-10 w-10 mx-auto mb-3" />
          <p>No class notes yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl bg-white border border-stone-200 p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-green-800">{note.author_name?.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${note.approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {note.approved ? "Approved" : "Pending"}
                    </span>
                    <span className="text-xs text-stone-400">Class of {note.graduation_year}</span>
                  </div>
                  <p className="font-display text-lg font-bold text-stone-900">{note.author_name}</p>
                  <p className="text-sm text-stone-600 line-clamp-2">{note.content}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!note.approved && (
                  <button onClick={() => approve(note.id)} className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="Approve">
                    <Check className="h-4 w-4 text-green-600" />
                  </button>
                )}
                <button onClick={() => remove(note.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InquiriesTab({ inquiries, onRefresh }: { inquiries: any[]; onRefresh: () => void }) {
  const remove = async (id: string) => {
    await supabase.from("inquiries").delete().eq("id", id);
    onRefresh();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Inquiries ({inquiries.length})</h3>
        <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
      </div>
      {inquiries.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <MessageSquare className="h-10 w-10 mx-auto mb-3" />
          <p>No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-xl bg-white border border-stone-200 p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">{inq.level}</span>
                  <span className="text-xs text-stone-400">{new Date(inq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <p className="font-display text-lg font-bold text-stone-900">{inq.student_name}</p>
                <p className="text-sm text-stone-500">Parent: {inq.parent_name} · {inq.phone}</p>
                {inq.message && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{inq.message}</p>}
              </div>
              <button onClick={() => remove(inq.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors shrink-0" title="Delete">
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("key, value, category").order("category").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        setSettings(map);
      }
      setLoading(false);
    });
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAll = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const categories: Record<string, { key: string; label: string }[]> = {
    school: [
      { key: "school_name", label: "School Name" },
      { key: "school_short", label: "Short Name" },
      { key: "school_motto", label: "Motto" },
      { key: "school_tagline", label: "Tagline" },
      { key: "school_established", label: "Established Year" },
      { key: "school_location", label: "Location" },
      { key: "school_phone", label: "Phone" },
      { key: "school_email", label: "Email" },
    ],
    hero: [
      { key: "hero_video", label: "Hero Video Path" },
      { key: "hero_poster", label: "Hero Poster Path" },
      { key: "hero_title", label: "Hero Title" },
      { key: "hero_subtitle", label: "Hero Subtitle" },
    ],
    stats: [
      { key: "stat_1_value", label: "Stat 1 Value" },
      { key: "stat_1_label", label: "Stat 1 Label" },
      { key: "stat_2_value", label: "Stat 2 Value" },
      { key: "stat_2_label", label: "Stat 2 Label" },
      { key: "stat_3_value", label: "Stat 3 Value" },
      { key: "stat_3_label", label: "Stat 3 Label" },
      { key: "stat_4_value", label: "Stat 4 Value" },
      { key: "stat_4_label", label: "Stat 4 Label" },
      { key: "stat_5_value", label: "Stat 5 Value" },
      { key: "stat_5_label", label: "Stat 5 Label" },
      { key: "stat_6_value", label: "Stat 6 Value" },
      { key: "stat_6_label", label: "Stat 6 Label" },
    ],
    home: [
      { key: "home_why_title", label: "Why WACOS Title" },
      { key: "home_why_text", label: "Why WACOS Text" },
      { key: "home_news_title", label: "News Section Title" },
      { key: "home_mission_title", label: "Mission Title" },
      { key: "home_mission_text", label: "Mission Text" },
      { key: "home_scholarship_title", label: "Scholarship Title" },
      { key: "home_scholarship_text", label: "Scholarship Text" },
    ],
    contact: [
      { key: "contact_address", label: "Address" },
      { key: "contact_phone", label: "Phone" },
      { key: "contact_email", label: "Email" },
      { key: "contact_map_lat", label: "Map Latitude" },
      { key: "contact_map_lng", label: "Map Longitude" },
    ],
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Site Settings</h3>
        <button onClick={saveAll} disabled={saving} className="px-4 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 transition-colors disabled:opacity-50">
          {saving ? "Saving..." : success ? "Saved!" : "Save All"}
        </button>
      </div>
      <div className="space-y-8">
        {Object.entries(categories).map(([cat, fields]) => (
          <div key={cat} className="rounded-2xl bg-white border border-stone-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-800 mb-4">{cat}</p>
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{f.label}</label>
                  <input type="text" value={settings[f.key] || ""} onChange={e => update(f.key, e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                    placeholder={f.key} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessesTab({ businesses, onRefresh }: { businesses: any[]; onRefresh: () => void }) {
  const approve = async (id: string) => {
    await supabase.from("alumni_businesses").update({ approved: true }).eq("id", id);
    onRefresh();
  };
  const remove = async (id: string) => {
    await supabase.from("alumni_businesses").delete().eq("id", id);
    onRefresh();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Business Directory ({businesses.length})</h3>
        <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
      </div>
      {businesses.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Building2 className="h-10 w-10 mx-auto mb-3" />
          <p>No businesses listed yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <div key={biz.id} className="rounded-xl bg-white border border-stone-200 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${biz.approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {biz.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="font-display text-lg font-bold text-stone-900">{biz.business_name}</p>
                <p className="text-sm text-stone-500">{biz.owner_name} · {biz.category}</p>
              </div>
              <div className="flex items-center gap-1">
                {!biz.approved && (
                  <button onClick={() => approve(biz.id)} className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="Approve">
                    <Check className="h-4 w-4 text-green-600" />
                  </button>
                )}
                <button onClick={() => remove(biz.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [clubs, setClubs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [clubsRes, membersRes, eventsRes, notesRes, inqRes, bizRes] = await Promise.all([
      supabase.from("clubs").select("*"),
      supabase.from("club_members").select("*"),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("class_notes").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("alumni_businesses").select("*").order("created_at", { ascending: false }),
    ]);

    const c = clubsRes.data || [];
    const m = membersRes.data || [];
    const e = eventsRes.data || [];
    const n = notesRes.data || [];
    const i = inqRes.data || [];
    const b = bizRes.data || [];

    setClubs(c);
    setMembers(m);
    setEvents(e);
    setNotes(n);
    setInquiries(i);
    setBusinesses(b);
    setStats({
      clubs: c.length,
      clubMembers: m.length,
      events: e.length,
      notes: n.length,
      inquiries: i.length,
      businesses: b.length,
      alumni: 0,
      clubPosts: 0,
    });

    // Get alumni count
    const { count: alumniCount } = await supabase.from("alumni_profiles").select("*", { count: "exact", head: true });
    const { count: postCount } = await supabase.from("club_posts").select("*", { count: "exact", head: true });
    setStats(prev => ({ ...prev, alumni: alumniCount || 0, clubPosts: postCount || 0 }));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "clubs", label: "Clubs", icon: Users, count: stats.clubs },
    { key: "alumni", label: "Alumni", icon: GraduationCap, count: stats.alumni },
    { key: "events", label: "Events", icon: Calendar, count: stats.events },
    { key: "notes", label: "Class Notes", icon: BookOpen, count: stats.notes },
    { key: "inquiries", label: "Inquiries", icon: MessageSquare, count: stats.inquiries },
    { key: "businesses", label: "Businesses", icon: Building2, count: stats.businesses },
    { key: "settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-1">Admin Dashboard</p>
              <h1 className="font-display text-3xl font-bold text-stone-900">M.M College Wairaka</h1>
              <p className="text-sm text-stone-500 mt-1">Manage all content, members, and inquiries from one place.</p>
            </div>
            <Link to="/" className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.key
                      ? "border-green-800 text-green-800"
                      : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {t.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-stone-100 text-xs text-stone-500">{t.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
          </div>
        ) : (
          <>
            {tab === "overview" && <OverviewTab stats={stats} />}
            {tab === "clubs" && <ClubsTab clubs={clubs} members={members} />}
            {tab === "alumni" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-stone-900">Alumni Profiles ({stats.alumni})</h3>
                  <Link to="/alumni/directory/admin" className="text-sm font-semibold text-green-800 hover:underline">Full Admin →</Link>
                </div>
                <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center">
                  <GraduationCap className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">Use the dedicated alumni admin panel to moderate profiles and businesses.</p>
                  <Link to="/alumni/directory/admin" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-green-800 hover:underline">
                    Open Alumni Admin <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
            {tab === "events" && <EventsTab events={events} onRefresh={fetchData} />}
            {tab === "notes" && <NotesTab notes={notes} onRefresh={fetchData} />}
            {tab === "inquiries" && <InquiriesTab inquiries={inquiries} onRefresh={fetchData} />}
            {tab === "businesses" && <BusinessesTab businesses={businesses} onRefresh={fetchData} />}
            {tab === "settings" && <SettingsTab />}
          </>
        )}
      </div>
    </div>
  );
}
