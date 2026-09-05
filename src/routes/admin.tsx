import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, Users, BookOpen, Calendar, MessageSquare,
  Building2, GraduationCap, Heart, ChevronRight, Check, X,
  RefreshCw, Eye, Trash2, Settings, BarChart3, Megaphone, FileText,
  CalendarCheck, ChevronDown, Mail
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — M.M College Wairaka" }],
  }),
  component: AdminPage,
});

type Tab = "overview" | "clubs" | "alumni" | "events" | "rsvps" | "notes" | "inquiries" | "businesses" | "articles" | "pages" | "applications" | "mentorship" | "donations" | "scholarships" | "comments" | "settings";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${type === "success" ? "bg-green-800" : "bg-red-600"}`}>
      {message}
    </div>
  );
}

type ReviewItem = {
  id: string;
  title?: string;
  author?: string;
  content?: string;
  details?: Record<string, any>;
  approved?: boolean;
  rejected_notes?: string;
  table: string;
};

function ReviewModal({ item, onClose, onRefresh, setToast }: {
  item: ReviewItem | null;
  onClose: () => void;
  onRefresh: () => void;
  setToast: (t: { message: string; type: "success" | "error" } | null) => void;
}) {
  const [rejectNotes, setRejectNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [saving, setSaving] = useState(false);

  if (!item) return null;

  const handleApprove = async () => {
    setSaving(true);
    const { error } = await supabase.from(item.table).update({ approved: true, rejected_notes: null }).eq("id", item.id);
    setSaving(false);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Submission approved", type: "success" });
    onRefresh();
    onClose();
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) { setToast({ message: "Please add rejection notes", type: "error" }); return; }
    setSaving(true);
    const { error } = await supabase.from(item.table).update({ approved: false, rejected_notes: rejectNotes.trim() }).eq("id", item.id);
    setSaving(false);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Submission rejected", type: "success" });
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-stone-900">Review Submission</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-stone-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {item.author && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">From</p>
              <p className="font-display text-lg font-bold text-stone-900">{item.author}</p>
            </div>
          )}
          {item.title && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Title</p>
              <p className="text-stone-700">{item.title}</p>
            </div>
          )}
          {item.content && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Content</p>
              <p className="text-stone-700 whitespace-pre-wrap">{item.content}</p>
            </div>
          )}
          {item.details && Object.entries(item.details).map(([key, val]) => (
            <div key={key}>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
              <p className="text-stone-700">{String(val)}</p>
            </div>
          ))}
          {item.approved === false && item.rejected_notes && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Rejection Notes</p>
              <p className="text-sm text-red-700">{item.rejected_notes}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-stone-200">
          {action === null ? (
            <div className="flex gap-3">
              <button onClick={() => setAction("approve")} className="flex-1 py-3 px-4 bg-green-800 hover:bg-green-900 text-white rounded-xl font-semibold transition-colors">
                Approve
              </button>
              <button onClick={() => setAction("reject")} className="flex-1 py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-colors">
                Reject
              </button>
            </div>
          ) : action === "approve" ? (
            <div className="flex gap-3">
              <button onClick={handleApprove} disabled={saving} className="flex-1 py-3 px-4 bg-green-800 hover:bg-green-900 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">
                {saving ? "Approving..." : "Confirm Approve"}
              </button>
              <button onClick={() => setAction(null)} className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Add rejection notes (required)..."
                className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
              />
              <div className="flex gap-3">
                <button onClick={handleReject} disabled={saving} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">
                  {saving ? "Rejecting..." : "Confirm Reject"}
                </button>
                <button onClick={() => setAction(null)} className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setTab("clubs")} className="group rounded-2xl bg-green-50 border border-green-200 p-5 hover:border-green-800 hover:shadow-md transition-all text-left">
          <Users className="h-6 w-6 text-green-800 mb-2" />
          <p className="font-display text-sm font-bold text-stone-900">Clubs</p>
          <p className="text-xs text-stone-500">Manage clubs & members</p>
        </button>
        <button onClick={() => setTab("events")} className="group rounded-2xl bg-rose-50 border border-rose-200 p-5 hover:border-rose-800 hover:shadow-md transition-all text-left">
          <Calendar className="h-6 w-6 text-rose-800 mb-2" />
          <p className="font-display text-sm font-bold text-stone-900">Events</p>
          <p className="text-xs text-stone-500">Create & manage events</p>
        </button>
        <button onClick={() => setTab("notes")} className="group rounded-2xl bg-cyan-50 border border-cyan-200 p-5 hover:border-cyan-800 hover:shadow-md transition-all text-left">
          <BookOpen className="h-6 w-6 text-cyan-800 mb-2" />
          <p className="font-display text-sm font-bold text-stone-900">Class Notes</p>
          <p className="text-xs text-stone-500">Approve submissions</p>
        </button>
        <button onClick={() => setTab("settings")} className="group rounded-2xl bg-stone-100 border border-stone-200 p-5 hover:border-stone-400 hover:shadow-md transition-all text-left">
          <Settings className="h-6 w-6 text-stone-600 mb-2" />
          <p className="font-display text-sm font-bold text-stone-900">Settings</p>
          <p className="text-xs text-stone-500">Site info & hero media</p>
        </button>
      </div>
    </div>
  );
}

function ClubsTab({ clubs, members, onRefresh }: { clubs: any[]; members: any[]; onRefresh: () => void }) {
  const [showAddClub, setShowAddClub] = useState(false);
  const [editClub, setEditClub] = useState<any>(null);
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [overview, setOverview] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("Member");
  const [memberYear, setMemberYear] = useState("");
  const [memberJoined, setMemberJoined] = useState("");
  const [saving, setSaving] = useState(false);

  const resetClub = () => { setName(""); setSlug(""); setTagline(""); setOverview(""); setEditClub(null); setShowAddClub(false); };
  const resetMember = () => { setMemberName(""); setMemberRole("Member"); setMemberYear(""); setMemberJoined(""); setShowAddMember(null); };

  const saveClub = async () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    if (!trimmedName || !trimmedSlug) { setToast({ message: "Name and slug are required", type: "error" }); return; }
    setSaving(true);
    if (editClub) {
      await supabase.from("clubs").update({ name: trimmedName, slug: trimmedSlug, tagline: tagline.trim(), overview: overview.trim() }).eq("id", editClub.id);
    } else {
      await supabase.from("clubs").insert({ name: trimmedName, slug: trimmedSlug, tagline: tagline.trim(), overview: overview.trim(), members_count: 0, events_count: 0, years_active: 0, alumni_count: 0 });
    }
    setToast({ message: editClub ? "Club updated" : "Club created", type: "success" });
    resetClub(); setSaving(false); onRefresh();
  };

  const deleteClub = async (id: string) => {
    if (!confirm("Delete this club and all its members/posts?")) return;
    await supabase.from("club_members").delete().eq("club_id", id);
    await supabase.from("club_posts").delete().eq("club_id", id);
    await supabase.from("clubs").delete().eq("id", id);
    onRefresh();
  };

  const saveMember = async (clubId: string) => {
    const trimmedName = memberName.trim();
    if (!trimmedName) { setToast({ message: "Member name is required", type: "error" }); return; }
    setSaving(true);
    await supabase.from("club_members").insert({ club_id: clubId, name: trimmedName, role: memberRole, year: memberYear?.trim() || null, joined: memberJoined?.trim() || null, sort_order: memberRole === "Patron" ? 0 : memberRole === "Member" ? 2 : 1 });
    setToast({ message: "Member added", type: "success" });
    resetMember(); setSaving(false); onRefresh();
  };

  const deleteMember = async (id: string) => {
    await supabase.from("club_members").delete().eq("id", id);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Clubs ({clubs.length})</h3>         <button onClick={() => { resetClub(); setShowAddClub(true); }} className="px-5 py-2.5 rounded-xl bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors shadow-md">+ Add Club</button>
      </div>

      {/* Add/Edit Club Form */}
      {showAddClub && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-6 mb-6">
          <p className="text-sm font-semibold text-green-800 mb-4">{editClub ? "Edit Club" : "Add New Club"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="e.g. Wildlife Club" /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Slug</label><input value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="e.g. wildlife" /></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-stone-700 mb-1">Tagline</label><input value={tagline} onChange={e => setTagline(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="e.g. Protect. Observe. Conserve." /></div>
          <div className="mt-4"><label className="block text-sm font-medium text-stone-700 mb-1">Overview</label><textarea value={overview} onChange={e => setOverview(e.target.value)} rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="What this club stands for..." /></div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveClub} disabled={saving || !name || !slug} className="px-4 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <button onClick={resetClub} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200">Cancel</button>
          </div>
        </div>
      )}

      {/* Club List */}
      <div className="space-y-4">
        {clubs.map((club) => {
          const clubM = members.filter((m: any) => m.club_id === club.id);
          const patron = clubM.find((m: any) => m.role === "Patron");
          const executives = clubM.filter((m: any) => m.role !== "Patron" && m.role !== "Member");
          const regularMembers = clubM.filter((m: any) => m.role === "Member");
          return (
            <div key={club.id} className="rounded-xl bg-white border border-stone-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-800">{club.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-stone-900">{club.name}</p>
                    <p className="text-xs text-stone-500">{club.tagline || "No tagline"} · {clubM.length} members</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditClub(club); setName(club.name); setSlug(club.slug); setTagline(club.tagline || ""); setOverview(club.overview || ""); setShowAddClub(true); }} className="p-2.5 rounded-lg hover:bg-stone-100 border border-stone-200" title="Edit"><Settings className="h-4 w-4 text-stone-400" /></button>
                  <button onClick={() => deleteClub(club.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200" title="Delete"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              </div>

              {/* Members */}
              <div className="ml-13">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-stone-500 uppercase">Members ({clubM.length})</p>
                  <button onClick={() => setShowAddMember(showAddMember === club.id ? null : club.id)} className="text-xs font-semibold text-green-800 hover:underline px-2 py-1 rounded-lg bg-green-50 border border-green-200">+ Add</button>
                </div>

                {/* Add Member Form */}
                {showAddMember === club.id && (
                  <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 mb-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <input value={memberName} onChange={e => setMemberName(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs" placeholder="Name" />
                      <select value={memberRole} onChange={e => setMemberRole(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs">
                        <option>Patron</option><option>Chairperson</option><option>Vice Chair</option><option>Secretary</option><option>Treasurer</option><option>Member</option>
                      </select>
                      <input value={memberYear} onChange={e => setMemberYear(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs" placeholder="Year (e.g. S4)" />
                      <input value={memberJoined} onChange={e => setMemberJoined(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs" placeholder="Joined (e.g. 2023)" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => saveMember(club.id)} disabled={saving || !memberName} className="px-3 py-1 rounded-lg bg-green-800 text-white text-xs font-semibold disabled:opacity-50">Save</button>
                      <button onClick={resetMember} className="px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Patron */}
                {patron && (
                  <div className="flex items-center justify-between py-1.5 text-xs">
                    <span><span className="font-semibold text-green-800">{patron.name}</span> <span className="text-stone-400">· {patron.role} · Since {patron.joined}</span></span>
                    <button onClick={() => deleteMember(patron.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="h-3 w-3 text-red-400" /></button>
                  </div>
                )}
                {/* Executives */}
                {executives.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between py-1.5 text-xs">
                    <span><span className="font-semibold text-stone-700">{ex.name}</span> <span className="text-stone-400">· {ex.role} · {ex.year}</span></span>
                    <button onClick={() => deleteMember(ex.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="h-3 w-3 text-red-400" /></button>
                  </div>
                ))}
                {/* Members (show first 4) */}
                {regularMembers.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-1.5 text-xs">
                    <span><span className="text-stone-600">{m.name}</span> <span className="text-stone-400">· {m.year}</span></span>
                    <button onClick={() => deleteMember(m.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="h-3 w-3 text-red-400" /></button>
                  </div>
                ))}
                {regularMembers.length > 4 && <p className="text-xs text-stone-400 py-1">...and {regularMembers.length - 4} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventsTab({ events, onRefresh }: { events: any[]; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("reunion");
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(""); setDescription(""); setEventDate(""); setLocation(""); setCategory("reunion"); setEditItem(null); setShowAdd(false); };

  const startEdit = (evt: any) => {
    setEditItem(evt);
    setTitle(evt.title);
    setDescription(evt.description || "");
    setEventDate(evt.event_date || "");
    setLocation(evt.location || "");
    setCategory(evt.category || "reunion");
    setShowAdd(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("events").update({ approved: !current }).eq("id", id);
    setToast({ message: current ? "Event unpublished" : "Event published", type: "success" });
    onRefresh();
  };

  const save = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setToast({ message: "Event title is required", type: "error" }); return; }
    setSaving(true);
    if (editItem) {
      const { error } = await supabase.from("events").update({ title: trimmedTitle, description: description?.trim() || null, event_date: eventDate || null, location: location?.trim() || null, category }).eq("id", editItem.id);
      setSaving(false);
      if (error) { setToast({ message: error.message, type: "error" }); return; }
      setToast({ message: "Event updated", type: "success" });
    } else {
      const { error } = await supabase.from("events").insert({ title: trimmedTitle, description: description?.trim() || null, event_date: eventDate || null, location: location?.trim() || null, category, approved: true });
      setSaving(false);
      if (error) { setToast({ message: error.message, type: "error" }); return; }
      setToast({ message: "Event created", type: "success" });
    }
    reset();
    onRefresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    setToast({ message: "Event deleted", type: "success" });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Events ({events.length})</h3>
        <div className="flex gap-2">
          <button onClick={() => { reset(); setShowAdd(!showAdd); }} className="px-4 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 transition-colors">+ Add Event</button>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>

      {/* Add/Edit Event Form */}
      {(showAdd || editItem) && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-green-800">{editItem ? "Edit Event" : "New Event"}</p>
            <button onClick={reset} className="text-stone-400 hover:text-stone-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Title</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="Event title" /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Date</label><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Location</label><input value={location} onChange={e => setLocation(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="e.g. School Hall" /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm"><option value="reunion">Reunion</option><option value="achievement">Achievement</option><option value="update">Update</option><option value="memoriam">In Memoriam</option><option value="business">Business</option><option value="sports">Sports</option><option value="academic">Academic</option><option value="community">Community</option></select></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-stone-700 mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="Event details..." /></div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving || !title} className="px-6 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 disabled:opacity-50 transition-colors">{saving ? "Saving..." : editItem ? "Update Event" : "Create Event"}</button>
            <button onClick={reset} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm hover:bg-stone-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}
      {events.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Calendar className="h-10 w-10 mx-auto mb-3" />
          <p>No events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div key={evt.id} className="rounded-xl bg-white border border-stone-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${evt.approved ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-600"}`}>{evt.approved ? "Published" : "Draft"}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{evt.category}</span>
                    <span className="text-xs text-stone-400">{evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date"}</span>
                  </div>
                  <p className="font-display text-lg font-bold text-stone-900">{evt.title}</p>
                  {evt.location && <p className="text-sm text-stone-500">📍 {evt.location}</p>}
                  {evt.description && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{evt.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublish(evt.id, evt.approved)} className={`p-2.5 rounded-lg border transition-colors ${evt.approved ? "hover:bg-amber-100 border-amber-200" : "hover:bg-green-100 border-green-200"}`} title={evt.approved ? "Unpublish" : "Publish"}>
                    {evt.approved ? <Eye className="h-4 w-4 text-amber-600" /> : <Megaphone className="h-4 w-4 text-green-600" />}
                  </button>
                  <button onClick={() => startEdit(evt)} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="Edit">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </button>
                  <button onClick={() => remove(evt.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RsvpsTab({ rsvps, events, onRefresh, setToast }: { rsvps: any[]; events: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");
  const [openEvts, setOpenEvts] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  // Group RSVPs by event
  const byEvent = new Map<string, any[]>();
  rsvps.forEach(r => {
    const list = byEvent.get(r.event_id) || [];
    list.push(r);
    byEvent.set(r.event_id, list);
  });

  const attendeesOf = (e: any) => (byEvent.get(e.id) || []).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
  const upcoming = (e: any) => e.event_date && new Date(e.event_date) >= new Date();

  const now = new Date();
  const visible = events
    .filter(e => e.approved !== false)
    .filter(e => (filter === "all" ? true : filter === "upcoming" ? upcoming(e) : !upcoming(e)))
    .filter(e => {
      if (!search) return true;
      const q = search.toLowerCase();
      const atts = attendeesOf(e);
      return e.title.toLowerCase().includes(q) || atts.some(r => (r.alumni_profiles?.full_name || "").toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const da = a.event_date || "0000";
      const db = b.event_date || "0000";
      return da < db ? -1 : da > db ? 1 : 0;
    });

  const totalAttending = rsvps.length;
  const eventsWithRsvps = byEvent.size;

  const removeRsvp = async (rsvpId: string, attendeeName: string) => {
    if (!confirm(`Remove ${attendeeName}'s RSVP?`)) return;
    setBusy(rsvpId);
    await supabase.from("event_rsvps").delete().eq("id", rsvpId);
    setBusy(null);
    setToast({ message: `${attendeeName}'s RSVP removed`, type: "success" });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="font-display text-xl font-bold text-stone-900">RSVPs <span className="text-stone-400 text-base font-normal">({totalAttending} attending · {eventsWithRsvps} events)</span></h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-stone-100 p-1">
            {([["all", "All"], ["upcoming", "Upcoming"], ["past", "Past"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === k ? "bg-white shadow text-stone-900" : "text-stone-500 hover:text-stone-700"}`}>{l}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search event or attendee..." className="px-3 py-2 border border-stone-300 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <CalendarCheck className="h-10 w-10 mx-auto mb-3" />
          <p>{totalAttending === 0 ? "No RSVPs yet. When alumni RSVP on the Pulse Events channel, they will appear here." : "Nothing matches your filters."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((evt) => {
            const atts = attendeesOf(evt);
            const open = !!openEvts[evt.id];
            const isUpcoming = upcoming(evt);
            return (
              <div key={evt.id} className="rounded-xl bg-white border border-stone-200 overflow-hidden">
                <button onClick={() => setOpenEvts(p => ({ ...p, [evt.id]: !open }))} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-stone-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isUpcoming ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-500"}`}>{isUpcoming ? "Upcoming" : "Past"}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">{evt.category || "event"}</span>
                      <span className="text-xs text-stone-400">{evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date"}</span>
                    </div>
                    <p className="font-display text-lg font-bold text-stone-900 truncate">{evt.title}</p>
                    <p className="text-sm text-stone-500">{evt.location ? `📍 ${evt.location} · ` : ""}{atts.length} going</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold ${atts.length ? "text-green-700" : "text-stone-300"}`}>{atts.length}</span>
                    <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open && (
                  <div className="border-t border-stone-100 px-5 py-4 bg-stone-50/50">
                    {atts.length === 0 ? (
                      <p className="text-sm text-stone-400">No one has RSVP'd yet. Share this event so alumni can say they're coming.</p>
                    ) : (
                      <ul className="divide-y divide-stone-100">
                        {atts.map((r) => {
                          const a = r.alumni_profiles || {};
                          const initials = (a.full_name || "?").split(" ").map((s: string) => s[0]).slice(0, 2).join("");
                          return (
                            <li key={r.id} className="py-2.5 flex items-center gap-3">
                              {a.avatar_url ? (
                                <img src={a.avatar_url} alt={a.full_name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-green-800">{initials}</span></div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-stone-900 truncate">{a.full_name || "Unknown alumnus"}
                                  <span className="font-normal text-stone-400"> · Class of {a.graduation_year || "?"}</span>
                                </p>
                                <p className="text-xs text-stone-500 truncate">{[a.profession, a.current_location].filter(Boolean).join(" · ") || "RSVP'd " + (r.created_at ? new Date(r.created_at).toLocaleDateString() : "")}</p>
                              </div>
                              <span className="hidden sm:block text-xs text-stone-400 shrink-0">RSVP {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</span>
                              {a.email && (
                                <a href={`mailto:${a.email}`} title="Email this alumnus" className="p-2 rounded-lg text-stone-400 hover:text-green-700 hover:bg-green-50 transition-colors shrink-0">
                                  <Mail className="h-4 w-4" />
                                </a>
                              )}
                              <button onClick={() => removeRsvp(r.id, a.full_name || "this alumnus")} disabled={busy === r.id} className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0" title="Remove RSVP">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotesTab({ notes, onRefresh, setToast }: { notes: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const remove = async (id: string) => {
    if (!confirm("Delete this class note?")) return;
    await supabase.from("class_notes").delete().eq("id", id);
    setToast({ message: "Class note deleted", type: "success" });
    onRefresh();
  };
  // Posts go live automatically; admins moderate by unpublishing anything that breaks the community rules.
  const toggleApproved = async (id: string, approved: boolean) => {
    const patch: any = { approved };
    if (approved) patch.rejected_notes = null;
    await supabase.from("class_notes").update(patch).eq("id", id);
    setToast({ message: approved ? "Note published back to the Pulse" : "Note unpublished from the Pulse", type: "success" });
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
            <div key={note.id} className="rounded-xl bg-white border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-green-800">{note.author_name?.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${note.approved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {note.approved ? "Live on Pulse" : "Unpublished"}
                      </span>
                      <span className="text-xs text-stone-400">Class of {note.graduation_year}</span>
                    </div>
                    <p className="font-display text-lg font-bold text-stone-900">{note.author_name}</p>
                    <p className="text-sm text-stone-600 line-clamp-2">{note.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setReviewItem({ id: note.id, author: note.author_name, content: note.content, details: { graduation_year: note.graduation_year }, approved: note.approved, rejected_notes: note.rejected_notes, table: "class_notes" })} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="View & Review">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                  {note.approved ? (
                    <button onClick={() => toggleApproved(note.id, false)} className="px-3 py-2 rounded-lg text-xs font-bold border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors" title="Hide this note from the public Pulse">Unpublish</button>
                  ) : (
                    <button onClick={() => toggleApproved(note.id, true)} className="px-3 py-2 rounded-lg text-xs font-bold border border-green-300 text-green-700 hover:bg-green-50 transition-colors" title="Publish this note to the Pulse">Publish</button>
                  )}
                  <button onClick={() => remove(note.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              {note.rejected_notes && !note.approved && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Rejection Notes</p>
                  <p className="text-sm text-red-700">{note.rejected_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ReviewModal item={reviewItem} onClose={() => setReviewItem(null)} onRefresh={onRefresh} setToast={setToast} />
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
              <button onClick={() => remove(inq.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors shrink-0" title="Delete">
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
  const [uploading, setUploading] = useState<string | null>(null);

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

  const uploadFile = async (key: string, file: File) => {
    setUploading(key);
    const ext = file.name.split(".").pop();
    const path = key + "/" + Date.now() + "." + ext;
    const { error } = await supabase.storage.from("uploads").upload(path, file, { contentType: file.type });
    if (!error) {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      update(key, data.publicUrl);
    }
    setUploading(null);
  };

  const categories: Record<string, { key: string; label: string; type?: string }[]> = {
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
      { key: "hero_video", label: "Hero Video", type: "video" },
      { key: "hero_poster", label: "Hero Poster Image", type: "image" },
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
                  {f.type === "video" ? (
                    <div>
                      {settings[f.key] && settings[f.key].startsWith("http") && (
                        <video src={settings[f.key]} className="w-full max-h-48 rounded-xl mb-2 object-cover" controls />)
                      }
                      <div className="flex items-center gap-3">
                        <label className="flex-1">
                          <span className="block w-full rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-500 text-center cursor-pointer hover:border-green-800 hover:text-green-800 transition-colors">
                            {uploading === f.key ? "Uploading..." : "Click to upload video (MP4/WebM)"}
                          </span>
                          <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(f.key, e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  ) : f.type === "image" ? (
                    <div>
                      {settings[f.key] && settings[f.key].startsWith("http") && (
                        <img src={settings[f.key]} className="w-full max-h-48 rounded-xl mb-2 object-cover" alt={f.label} />)
                      }
                      <div className="flex items-center gap-3">
                        <label className="flex-1">
                          <span className="block w-full rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-500 text-center cursor-pointer hover:border-green-800 hover:text-green-800 transition-colors">
                            {uploading === f.key ? "Uploading..." : "Click to upload image (JPG/PNG/WebP)"}
                          </span>
                          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(f.key, e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <input type="text" value={settings[f.key] || ""} onChange={e => update(f.key, e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                      placeholder={f.key} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessesTab({ businesses, onRefresh, setToast }: { businesses: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = businesses.filter(b => {
    if (filter === "pending" && (b.approved || b.rejected_notes)) return false;
    if (filter === "approved" && !b.approved) return false;
    if (filter === "rejected" && !b.rejected_notes) return false;
    if (search) {
      const q = search.toLowerCase();
      return (b.business_name?.toLowerCase().includes(q) || b.owner_name?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q));
    }
    return true;
  });
  const remove = async (id: string) => {
    if (!confirm("Delete this business?")) return;
    await supabase.from("alumni_businesses").delete().eq("id", id);
    setToast({ message: "Business deleted", type: "success" });
    onRefresh();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Business Directory ({businesses.length})</h3>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search business, owner..." className="px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Building2 className="h-10 w-10 mx-auto mb-3" />
          <p>No businesses found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((biz) => (
            <div key={biz.id} className="rounded-xl bg-white border border-stone-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${biz.approved ? "bg-green-100 text-green-800" : biz.rejected_notes ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {biz.approved ? "Approved" : biz.rejected_notes ? "Rejected" : "Pending"}
                    </span>
                  </div>
                  <p className="font-display text-lg font-bold text-stone-900">{biz.business_name}</p>
                  <p className="text-sm text-stone-500">{biz.owner_name} · {biz.category}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setReviewItem({ id: biz.id, title: biz.business_name, author: biz.owner_name, details: { category: biz.category, description: biz.description, website: biz.website, phone: biz.phone, email: biz.email }, approved: biz.approved, rejected_notes: biz.rejected_notes, table: "alumni_businesses" })} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="View & Review">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                  <button onClick={() => remove(biz.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              {biz.rejected_notes && !biz.approved && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Rejection Notes</p>
                  <p className="text-sm text-red-700">{biz.rejected_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ReviewModal item={reviewItem} onClose={() => setReviewItem(null)} onRefresh={onRefresh} setToast={setToast} />
    </div>
  );
}

function AlumniTab({ alumni, onRefresh, setToast }: { alumni: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = alumni.filter(a => {
    if (filter === "pending" && (a.approved || a.rejected_notes)) return false;
    if (filter === "approved" && !a.approved) return false;
    if (filter === "rejected" && !a.rejected_notes) return false;
    if (search) {
      const q = search.toLowerCase();
      return (a.full_name?.toLowerCase().includes(q) || a.profession?.toLowerCase().includes(q) || a.company?.toLowerCase().includes(q) || String(a.graduation_year).includes(q));
    }
    return true;
  });
  const remove = async (id: string) => {
    if (!confirm("Delete this alumni profile?")) return;
    await supabase.from("alumni_profiles").delete().eq("id", id);
    setToast({ message: "Profile deleted", type: "success" });
    onRefresh();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Alumni Profiles ({alumni.length})</h3>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, profession..." className="px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <GraduationCap className="h-10 w-10 mx-auto mb-3" />
          <p>No alumni profiles found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="rounded-xl bg-white border border-stone-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-800">{a.full_name?.charAt(0) || "?"}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.approved ? "bg-green-100 text-green-800" : a.rejected_notes ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                        {a.approved ? "Approved" : a.rejected_notes ? "Rejected" : "Pending"}
                      </span>
                      <span className="text-xs text-stone-400">Class of {a.graduation_year}</span>
                    </div>
                    <p className="font-display text-lg font-bold text-stone-900">{a.full_name}</p>
                    <p className="text-sm text-stone-500">{a.profession || "No profession"}{a.company ? " at " + a.company : ""}{a.current_location ? " · " + a.current_location : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setReviewItem({ id: a.id, title: a.profession || "Alumni Profile", author: a.full_name, content: a.bio || a.about_me, details: { graduation_year: a.graduation_year, company: a.company, location: a.current_location, email: a.email, phone: a.phone, linkedin: a.linkedin_url, website: a.website_url }, approved: a.approved, rejected_notes: a.rejected_notes, table: "alumni_profiles" })} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="View & Review">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                  <button onClick={() => remove(a.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              {a.rejected_notes && !a.approved && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Rejection Notes</p>
                  <p className="text-sm text-red-700">{a.rejected_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ReviewModal item={reviewItem} onClose={() => setReviewItem(null)} onRefresh={onRefresh} setToast={setToast} />
    </div>
  );
}

function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`;
    const { error } = await supabase.storage.from("uploads").upload(fileName, file, { contentType: file.type });
    if (error) { console.error(error); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(fileName);
    onChange(urlData.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      {label && <p className="text-sm font-medium text-stone-600 mb-2">{label}</p>}
      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-stone-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
            <Megaphone className="h-5 w-5 text-stone-400" />
            <span className="text-sm text-stone-600">{uploading ? "Uploading..." : "Click to upload image"}</span>
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        {value && (
          <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-stone-200">
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button onClick={() => onChange("")} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticlesTab({ articles, onRefresh, setToast }: { articles: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(""); setSlug(""); setCategory(""); setExcerpt(""); setBody(""); setImageUrl(""); setAuthorName(""); setAuthorRole(""); setAuthorAvatar(""); setEditItem(null); setShowAdd(false); };

  const save = async () => {
    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    if (!trimmedTitle || !trimmedSlug) { setToast({ message: "Title and slug are required", type: "error" }); return; }
    setSaving(true);
    const bodyArray = body.split("\n").filter((p: string) => p.trim());
    const authorData = {
        author_name: authorName.trim() || "M.M College Wairaka",
        author_role: authorRole.trim() || "School Communications",
        author_avatar: authorAvatar.trim() || null
      };
      if (editItem) {
      const { error } = await supabase.from("articles").update({ title: trimmedTitle, slug: trimmedSlug, category: category.trim(), excerpt: excerpt.trim(), body: bodyArray, image: imageUrl.trim() || editItem.image, ...authorData }).eq("id", editItem.id);
      setSaving(false);
      if (error) { setToast({ message: error.message, type: "error" }); return; }
    } else {
      const { error } = await supabase.from("articles").insert({ title: trimmedTitle, slug: trimmedSlug, category: category.trim(), excerpt: excerpt.trim(), body: bodyArray, image: imageUrl.trim() || "/assets/news-service.jpg", date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }), views: 0, ...authorData });
      setSaving(false);
      if (error) { setToast({ message: error.message, type: "error" }); return; }
    }
    setToast({ message: editItem ? "Article updated" : "Article created", type: "success" });
    reset();
    onRefresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await supabase.from("articles").delete().eq("id", id);
    setToast({ message: "Article deleted", type: "success" });
    onRefresh();
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    await supabase.from("articles").update({ published: !currentStatus }).eq("id", id);
    setToast({ message: currentStatus ? "Article unpublished" : "Article published", type: "success" });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Campus News ({articles.length})</h3>
        <div className="flex gap-2">
          <button onClick={() => { reset(); setShowAdd(true); }} className="px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold transition-colors">+ Add Article</button>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>
      {(showAdd || editItem) && (
        <div className="rounded-xl bg-white border border-stone-200 p-5 mb-6 space-y-4">
          <h4 className="font-display text-lg font-bold text-stone-900">{editItem ? "Edit Article" : "New Article"}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (auto-generated)" className="p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (STEM, Athletics, etc.)" className="p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <ImageUpload value={imageUrl} onChange={setImageUrl} label="Article Image" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author Name (default: M.M College Wairaka)" className="p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} placeholder="Author Role (default: School Communications)" className="p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <ImageUpload value={authorAvatar} onChange={setAuthorAvatar} label="Author Avatar (optional)" />
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt (short summary)" className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[60px]" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body (one paragraph per line)" className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[150px]" />
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="px-6 py-2 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">{saving ? "Saving..." : "Save"}</button>
            <button onClick={reset} className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
          </div>
        </div>
      )}
      {articles.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Megaphone className="h-10 w-10 mx-auto mb-3" />
          <p>No articles yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="rounded-xl bg-white border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-16 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                    {article.image && <img src={article.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">{article.category}</span>
                      <span className="text-xs text-stone-400">{article.date}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${article.published ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-600"}`}>
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="font-display text-lg font-bold text-stone-900">{article.title}</p>
                    <p className="text-sm text-stone-600 line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublish(article.id, article.published)} className={`p-2.5 rounded-lg border transition-colors ${article.published ? "hover:bg-amber-100 border-amber-200" : "hover:bg-green-100 border-green-200"}`} title={article.published ? "Unpublish" : "Publish"}>
                    {article.published ? <Eye className="h-4 w-4 text-amber-600" /> : <Megaphone className="h-4 w-4 text-green-600" />}
                  </button>
                  <button onClick={() => { setEditItem(article); setTitle(article.title); setSlug(article.slug); setCategory(article.category); setExcerpt(article.excerpt); setBody(article.body?.join("\n") || ""); setImageUrl(article.image || ""); }} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="Edit">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </button>
                  <button onClick={() => remove(article.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PagesTab({ pages, onRefresh, setToast }: { pages: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [editItem, setEditItem] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [contentFields, setContentFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const pageNames: Record<string, string> = {
    'about': 'About',
    'student-life': 'Student Life',
    'athletics': 'Athletics',
    'giving': 'Giving',
    'academics': 'Academics'
  };

  const filteredPages = selectedPage ? pages.filter(p => p.page === selectedPage) : pages;
  const uniquePages = [...new Set(pages.map(p => p.page))];

  // Flatten content object to string fields for editing
  const flattenContent = (obj: any, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj || {})) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        result[fullKey] = String(value);
      } else if (Array.isArray(value)) {
        result[fullKey] = value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join('\n');
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenContent(value, fullKey));
      }
    }
    return result;
  };

  const reset = () => { setTitle(""); setContentFields({}); setEditItem(null); };

  const save = async () => {
    if (!editItem) return;
    setSaving(true);
    // Reconstruct content from flat fields
    const content: any = {};
    for (const [key, value] of Object.entries(contentFields)) {
      const parts = key.split('.');
      let current = content;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      const lastKey = parts[parts.length - 1];
      // Try to parse arrays/objects
      if (value.includes('\n')) {
        const lines = value.split('\n').filter(l => l.trim());
        const parsed = lines.map(l => { try { return JSON.parse(l); } catch { return l; } });
        current[lastKey] = parsed;
      } else {
        current[lastKey] = value;
      }
    }
    const { error } = await supabase.from("page_content").update({ title: title.trim(), content }).eq("id", editItem.id);
    setSaving(false);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Content updated", type: "success" });
    reset();
    onRefresh();
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    await supabase.from("page_content").update({ published: !currentStatus }).eq("id", id);
    setToast({ message: currentStatus ? "Section hidden" : "Section published", type: "success" });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Page Content ({pages.length} sections)</h3>
        <div className="flex gap-2">
          <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)} className="px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">All Pages</option>
            {uniquePages.map(p => <option key={p} value={p}>{pageNames[p] || p}</option>)}
          </select>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>
      {editItem && (
        <div className="rounded-xl bg-white border border-stone-200 p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg font-bold text-stone-900">Edit: {editItem.title}</h4>
            <button onClick={reset} className="text-stone-400 hover:text-stone-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Section Title" className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div className="space-y-3">
            {Object.entries(contentFields).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-stone-500 mb-1 capitalize">{key.replace(/[._]/g, ' ')}</label>
                {value.includes('\n') || value.length > 100 ? (
                  <textarea
                    value={value}
                    onChange={(e) => setContentFields(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(e) => setContentFields(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="px-6 py-2 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">{saving ? "Saving..." : "Save"}</button>
            <button onClick={reset} className="px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
          </div>
        </div>
      )}
      {filteredPages.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <FileText className="h-10 w-10 mx-auto mb-3" />
          <p>No page content found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPages.map((item) => (
            <div key={item.id} className="rounded-xl bg-white border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">{pageNames[item.page] || item.page}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{item.section}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.published ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-600"}`}>
                      {item.published ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="font-display text-lg font-bold text-stone-900">{item.title}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublish(item.id, item.published)} className={`p-2.5 rounded-lg border transition-colors ${item.published ? "hover:bg-amber-100 border-amber-200" : "hover:bg-green-100 border-green-200"}`} title={item.published ? "Hide" : "Publish"}>
                    {item.published ? <Eye className="h-4 w-4 text-amber-600" /> : <Megaphone className="h-4 w-4 text-green-600" />}
                  </button>
                  <button onClick={() => { setEditItem(item); setTitle(item.title || ""); setContentFields(flattenContent(item.content)); }} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="Edit">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionsList({ title, icon: Icon, data, columns, table, onRefresh, setToast }: { title: string; icon: any; data: any[]; columns: { key: string; label: string }[]; table: string; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [filter, setFilter] = useState("all");
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const filtered = filter === "all" ? data : data.filter((d: any) => d.status === filter);

  const remove = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await supabase.from(table).delete().eq("id", id);
    setToast({ message: "Deleted", type: "success" });
    onRefresh();
  };

  const openReview = (item: any) => {
    const details: Record<string, any> = {};
    columns.forEach(col => { details[col.key] = item[col.key]; });
    setReviewItem({
      id: item.id,
      title: item[columns[0]?.key] || title,
      author: item[columns[1]?.key] || item.student_name || item.mentor_name || item.donor_name || "",
      content: item.reason || item.message || item.purpose || item.experience || item.achievement || "",
      details,
      approved: item.status === "approved",
      rejected_notes: item.rejected_notes,
      table
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">{title} ({data.length})</h3>
        <div className="flex gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Icon className="h-10 w-10 mx-auto mb-3" />
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item: any) => (
            <div key={item.id} className="rounded-xl bg-white border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.status === "approved" ? "bg-green-100 text-green-800" : item.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{item.status}</span>
                    <span className="text-xs text-stone-400">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  {columns.slice(0, 3).map(col => (
                    <p key={col.key} className="text-sm text-stone-600"><span className="font-medium text-stone-900">{col.label}:</span> {item[col.key] || "-"}</p>
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openReview(item)} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="View & Review">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </button>
                  <button onClick={() => remove(item.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ReviewModal item={reviewItem} onClose={() => setReviewItem(null)} onRefresh={onRefresh} setToast={setToast} />
    </div>
  );
}

function CommentsTab({ comments, onRefresh, setToast }: { comments: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [filter, setFilter] = useState("");

  const filtered = comments.filter(c => {
    if (filter && !c.author_name.toLowerCase().includes(filter.toLowerCase()) && !c.content.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await supabase.from("note_comments").delete().eq("id", id);
    setToast({ message: "Comment deleted", type: "success" });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-stone-900">Comments ({comments.length})</h2>
        <input type="text" placeholder="Search comments..." value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none w-64" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">No comments found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl bg-white border border-stone-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">{c.author_name}</span>
                    {c.graduation_year && <span className="text-xs text-stone-400">Class of {c.graduation_year}</span>}
                    <span className="text-xs text-stone-400">on note</span>
                  </div>
                  <p className="text-stone-600 text-sm mt-1">{c.content}</p>
                  <p className="text-xs text-stone-400 mt-2">{new Date(c.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-sm ml-4">Delete</button>
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
  const [alumni, setAlumni] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [mentorship, setMentorship] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [pageContent, setPageContent] = useState<any[]>([]);
  const [noteComments, setNoteComments] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [clubsRes, membersRes, eventsRes, notesRes, inqRes, bizRes, alumniRes, articlesRes, pagesRes, appsRes, mentRes, donRes, schRes, commentsRes, rsvpsRes] = await Promise.all([
      supabase.from("clubs").select("*"),
      supabase.from("club_members").select("*"),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("class_notes").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("alumni_businesses").select("*").order("created_at", { ascending: false }),
      supabase.from("alumni_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase.from("page_content").select("*").order("page", { ascending: true }),
      supabase.from("club_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("mentorship_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("donations").select("*").order("created_at", { ascending: false }),
      supabase.from("sports_scholarships").select("*").order("created_at", { ascending: false }),
      supabase.from("note_comments").select("*").order("created_at", { ascending: false }),
      supabase.from("event_rsvps").select("*, alumni_profiles(id, full_name, graduation_year, profession, current_location, avatar_url, email), events(id, title, event_date, location, category, approved)"),
    ]);

    const c = clubsRes.data || [];
    const m = membersRes.data || [];
    const e = eventsRes.data || [];
    const n = notesRes.data || [];
    const i = inqRes.data || [];
    const b = bizRes.data || [];
    const a = alumniRes.data || [];
    const art = articlesRes.data || [];
    const pc = pagesRes.data || [];
    setClubs(c);
    setMembers(m);
    setEvents(e);
    setNotes(n);
    setInquiries(i);
    setBusinesses(b);
    setAlumni(a);
    setArticles(art);
    setPageContent(pc);
    setApplications(appsRes.data || []);
    setMentorship(mentRes.data || []);
    setDonations(donRes.data || []);
    setScholarships(schRes.data || []);
    setNoteComments(commentsRes.data || []);
    setRsvps(rsvpsRes.data || []);
    const { count: postCount } = await supabase.from("club_posts").select("*", { count: "exact", head: true });
    setStats({
      clubs: c.length,
      clubMembers: m.length,
      events: e.length,
      notes: n.length,
      inquiries: i.length,
      businesses: b.length,
      alumni: a.length,
      clubPosts: postCount || 0,
      articles: art.length,
    });
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "clubs", label: "Clubs", icon: Users, count: stats.clubs },
    { key: "alumni", label: "Alumni", icon: GraduationCap, count: stats.alumni },
    { key: "events", label: "Events", icon: Calendar, count: stats.events },
    { key: "rsvps", label: "RSVPs", icon: CalendarCheck, count: rsvps.length },
    { key: "notes", label: "Class Notes", icon: BookOpen, count: stats.notes },
    { key: "articles", label: "Campus News", icon: Megaphone, count: stats.articles },
    { key: "pages", label: "Page Content", icon: FileText, count: pageContent.length },
    { key: "inquiries", label: "Inquiries", icon: MessageSquare, count: stats.inquiries },
    { key: "businesses", label: "Businesses", icon: Building2, count: stats.businesses },
    { key: "applications", label: "Club Apps", icon: Users, count: applications.length },
    { key: "mentorship", label: "Mentorship", icon: Heart, count: mentorship.length },
    { key: "donations", label: "Donations", icon: Heart, count: donations.length },
    { key: "scholarships", label: "Scholarships", icon: GraduationCap, count: scholarships.length },
    { key: "comments", label: "Comments", icon: MessageSquare, count: noteComments.length },
    { key: "settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
            {tab === "clubs" && <ClubsTab clubs={clubs} members={members} onRefresh={fetchData} />}
            {tab === "alumni" && (
              <AlumniTab alumni={alumni} onRefresh={fetchData} setToast={setToast} />
            )}            { tab === "events" && <EventsTab events={events} onRefresh={fetchData} /> }
            { tab === "rsvps" && <RsvpsTab rsvps={rsvps} events={events} onRefresh={fetchData} setToast={setToast} /> }
            {tab === "notes" && <NotesTab notes={notes} onRefresh={fetchData} setToast={setToast} />}
            {tab === "inquiries" && <InquiriesTab inquiries={inquiries} onRefresh={fetchData} />}
            {tab === "articles" && <ArticlesTab articles={articles} onRefresh={fetchData} setToast={setToast} />}
            {tab === "businesses" && <BusinessesTab businesses={businesses} onRefresh={fetchData} setToast={setToast} />}
            {tab === "pages" && <PagesTab pages={pageContent} onRefresh={fetchData} setToast={setToast} />}
            {tab === "applications" && <SubmissionsList title="Club Applications" icon={Users} data={applications} columns={[{ key: "club_name", label: "Club" }, { key: "student_name", label: "Student" }, { key: "class_level", label: "Class" }, { key: "reason", label: "Reason" }]} table="club_applications" onRefresh={fetchData} setToast={setToast} />}
            {tab === "mentorship" && <SubmissionsList title="Mentorship Requests" icon={Heart} data={mentorship} columns={[{ key: "mentor_name", label: "Name" }, { key: "mentor_email", label: "Email" }, { key: "club_interest", label: "Club" }, { key: "graduation_year", label: "Class Of" }, { key: "expertise", label: "Expertise" }]} table="mentorship_requests" onRefresh={fetchData} setToast={setToast} />}
            {tab === "donations" && <SubmissionsList title="Donations" icon={Heart} data={donations} columns={[{ key: "donor_name", label: "Donor" }, { key: "amount", label: "Amount" }, { key: "donation_type", label: "Type" }, { key: "purpose", label: "Purpose" }]} table="donations" onRefresh={fetchData} setToast={setToast} />}
            {tab === "scholarships" && <SubmissionsList title="Sports Scholarships" icon={GraduationCap} data={scholarships} columns={[{ key: "student_name", label: "Student" }, { key: "parent_name", label: "Parent" }, { key: "phone", label: "Phone" }, { key: "sport", label: "Sport" }, { key: "achievement", label: "Achievement" }]} table="sports_scholarships" onRefresh={fetchData} setToast={setToast} />}
            {tab === "comments" && <CommentsTab comments={noteComments} onRefresh={fetchData} setToast={setToast} />}
            {tab === "settings" && <SettingsTab />}
          </>
        )}
      </div>
    </div>
  );
}
