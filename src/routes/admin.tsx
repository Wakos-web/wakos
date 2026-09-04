import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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

type Tab = "overview" | "clubs" | "alumni" | "events" | "notes" | "inquiries" | "businesses" | "articles" | "settings";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("reunion");
  const [saving, setSaving] = useState(false);

  const approve = async (id: string) => {
    await supabase.from("events").update({ approved: true }).eq("id", id);
    onRefresh();
  };
  const remove = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    onRefresh();
  };
  const create = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setToast({ message: "Event title is required", type: "error" }); return; }
    setSaving(true);
    await supabase.from("events").insert({ title: trimmedTitle, description: description?.trim() || null, event_date: eventDate || null, location: location?.trim() || null, category, approved: true });
    setToast({ message: "Event created", type: "success" });
    setTitle(""); setDescription(""); setEventDate(""); setLocation(""); setShowAdd(false); setSaving(false); onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Events ({events.length})</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 transition-colors">+ Add Event</button>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>

      {/* Add Event Form */}
      {showAdd && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-6 mb-6">
          <p className="text-sm font-semibold text-green-800 mb-4">New Event</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Title</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="Event title" /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Date</label><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Location</label><input value={location} onChange={e => setLocation(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="e.g. School Hall" /></div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm"><option value="reunion">Reunion</option><option value="achievement">Achievement</option><option value="update">Update</option><option value="memoriam">In Memoriam</option><option value="business">Business</option></select></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-stone-700 mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="Event details..." /></div>
          <div className="flex gap-3 mt-4">
            <button onClick={create} disabled={saving || !title} className="px-4 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 disabled:opacity-50">{saving ? "Saving..." : "Create Event"}</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm">Cancel</button>
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
                  <button onClick={() => approve(evt.id)} className="p-2.5 rounded-lg hover:bg-green-100 border border-green-200 transition-colors" title="Approve">
                    <Check className="h-4 w-4 text-green-600" />
                  </button>
                )}
                <button onClick={() => remove(evt.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
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

function NotesTab({ notes, onRefresh, setToast }: { notes: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const remove = async (id: string) => {
    if (!confirm("Delete this class note?")) return;
    await supabase.from("class_notes").delete().eq("id", id);
    setToast({ message: "Class note deleted", type: "success" });
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
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${note.approved ? "bg-green-100 text-green-800" : note.rejected_notes ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                        {note.approved ? "Approved" : note.rejected_notes ? "Rejected" : "Pending"}
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
    const { error } = await supabase.storage.from("hero-media").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("hero-media").getPublicUrl(path);
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
                      <input type="text" value={settings[f.key] || ""} onChange={e => update(f.key, e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 mt-2 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                        placeholder="Or paste a URL" />
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
                      <input type="text" value={settings[f.key] || ""} onChange={e => update(f.key, e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 mt-2 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                        placeholder="Or paste a URL" />
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
        <Link to="/alumni/directory/admin" className="text-sm font-semibold text-green-800 hover:underline">Full Admin →</Link>
      </div>
      {alumni.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <GraduationCap className="h-10 w-10 mx-auto mb-3" />
          <p>No alumni profiles yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alumni.map((a) => (
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

function ArticlesTab({ articles, onRefresh, setToast }: { articles: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(""); setSlug(""); setCategory(""); setExcerpt(""); setBody(""); setImageUrl(""); setEditItem(null); setShowAdd(false); };

  const save = async () => {
    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    if (!trimmedTitle || !trimmedSlug) { setToast({ message: "Title and slug are required", type: "error" }); return; }
    setSaving(true);
    const bodyArray = body.split("\n").filter((p: string) => p.trim());
    if (editItem) {
      const { error } = await supabase.from("articles").update({ title: trimmedTitle, slug: trimmedSlug, category: category.trim(), excerpt: excerpt.trim(), body: bodyArray, image: imageUrl.trim() || editItem.image }).eq("id", editItem.id);
      setSaving(false);
      if (error) { setToast({ message: error.message, type: "error" }); return; }
    } else {
      const { error } = await supabase.from("articles").insert({ title: trimmedTitle, slug: trimmedSlug, category: category.trim(), excerpt: excerpt.trim(), body: bodyArray, image: imageUrl.trim() || "/assets/news-service.jpg", date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) });
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
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
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
                    </div>
                    <p className="font-display text-lg font-bold text-stone-900">{article.title}</p>
                    <p className="text-sm text-stone-600 line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [clubsRes, membersRes, eventsRes, notesRes, inqRes, bizRes, alumniRes, articlesRes] = await Promise.all([
      supabase.from("clubs").select("*"),
      supabase.from("club_members").select("*"),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("class_notes").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("alumni_businesses").select("*").order("created_at", { ascending: false }),
      supabase.from("alumni_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
    ]);

    const c = clubsRes.data || [];
    const m = membersRes.data || [];
    const e = eventsRes.data || [];
    const n = notesRes.data || [];
    const i = inqRes.data || [];
    const b = bizRes.data || [];
    const a = alumniRes.data || [];
    const art = articlesRes.data || [];
    setClubs(c);
    setMembers(m);
    setEvents(e);
    setNotes(n);
    setInquiries(i);
    setBusinesses(b);
    setAlumni(a);
    setArticles(art);
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
    { key: "notes", label: "Class Notes", icon: BookOpen, count: stats.notes },
    { key: "articles", label: "Campus News", icon: Megaphone, count: stats.articles },
    { key: "inquiries", label: "Inquiries", icon: MessageSquare, count: stats.inquiries },
    { key: "businesses", label: "Businesses", icon: Building2, count: stats.businesses },
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
            )}
            {tab === "events" && <EventsTab events={events} onRefresh={fetchData} />}
            {tab === "notes" && <NotesTab notes={notes} onRefresh={fetchData} setToast={setToast} />}
            {tab === "inquiries" && <InquiriesTab inquiries={inquiries} onRefresh={fetchData} />}
            {tab === "articles" && <ArticlesTab articles={articles} onRefresh={fetchData} setToast={setToast} />}
            {tab === "businesses" && <BusinessesTab businesses={businesses} onRefresh={fetchData} setToast={setToast} />}
            {tab === "settings" && <SettingsTab />}
          </>
        )}
      </div>
    </div>
  );
}
