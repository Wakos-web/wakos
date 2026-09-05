import { createFileRoute, Link, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { adminSupabase as supabase, adminLogin, adminLogout, adminPasscodeLogin, adminSession, adminListStaff, adminInviteStaff, adminResendInviteCode, adminRevokeStaff, adminSendLoginCode, adminVerifyLoginCode } from "@/lib/supabase";
import { notifyClubEditor } from "@/lib/club-notify";
import { notifyAlumniApplicant } from "@/lib/alumni-notify";
import { LOGO_URL } from "@/lib/content";
import { useOtpResend } from "@/hooks/useOtpResend";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard, Users, BookOpen, Calendar, MessageSquare,
  Building2, GraduationCap, Heart, ChevronRight, Check, X,
  RefreshCw, Eye, Trash2, Settings, BarChart3, Megaphone, FileText,
  CalendarCheck, ChevronDown, Mail, LogOut, ShieldCheck, UserPlus, Send, KeyRound,
  Copy, Search, Clock, CheckCircle2, HandHeart, Link2, ListChecks, MoreHorizontal, ArrowLeft,
  Image as ImageIcon, Video as VideoIcon, Upload, GripVertical
} from "lucide-react";
import { SOCIAL_PLATFORMS, platformLabel } from "@/components/social-links";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — M.M College Wairaka" }],
  }),
  component: AdminPage,
});

type Tab = "overview" | "clubs" | "alumni" | "events" | "rsvps" | "notes" | "inquiries" | "businesses" | "articles" | "pages" | "applications" | "mentorship" | "donations" | "scholarships" | "comments" | "giving" | "mwosa" | "settings" | "staff";

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

  // Alumni registration decisions get an email to the applicant (server fn is
  // gated on the staff session cookie; DB state must already match the verdict).
  const notifyApplicant = async (verdict: "approved" | "rejected") => {
    if (item.table !== "alumni_profiles") return;
    try {
      await notifyAlumniApplicant({ data: { profileId: item.id, verdict, note: rejectNotes.trim() } });
    } catch (e: any) {
      console.warn("notifyAlumniApplicant:", e?.message || e);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    const { error } = await supabase.from(item.table).update({ approved: true, rejected_notes: null }).eq("id", item.id);
    setSaving(false);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Submission approved", type: "success" });
    await notifyApplicant("approved");
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
    await notifyApplicant("rejected");
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

/* ------------------------------------------------------------------ */
/* Club co-editor workflow: patrons invite a chairperson/secretary to   */
/* write club posts; their posts arrive as "pending" and are approved   */
/* (published) or rejected here. Editors sign in at /clubs/editor.      */
/* ------------------------------------------------------------------ */
function ClubEditorTools({ club, reviewerName }: { club: any; reviewerName: string }) {
  const [editors, setEditors] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [invName, setInvName] = useState("");
  const [invRole, setInvRole] = useState("Chairperson");
  const [invEmail, setInvEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [rejectNoteFor, setRejectNoteFor] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [eRes, pRes] = await Promise.all([
        supabase.from("club_editors").select("*").eq("club_id", club.id).order("created_at", { ascending: true }),
        supabase.from("club_posts").select("*").eq("club_id", club.id).in("status", ["pending", "rejected"]).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (eRes.data) setEditors(eRes.data);
      if (pRes.data) setPosts(pRes.data);
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [club.id]);

  const flash = (text: string, kind: "ok" | "err") => {
    setMsg({ text, kind });
    window.setTimeout(() => setMsg(null), 4000);
  };

  const reload = async () => {
    const [eRes, pRes] = await Promise.all([
      supabase.from("club_editors").select("*").eq("club_id", club.id).order("created_at", { ascending: true }),
      supabase.from("club_posts").select("*").eq("club_id", club.id).in("status", ["pending", "rejected"]).order("created_at", { ascending: false }),
    ]);
    if (eRes.data) setEditors(eRes.data);
    if (pRes.data) setPosts(pRes.data);
  };

  const invite = async () => {
    const name = invName.trim();
    const email = invEmail.trim().toLowerCase();
    if (!name || !email) { flash("Name and email are required", "err"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { flash("Enter a valid email address", "err"); return; }
    setSaving(true);
    const { error } = await supabase.from("club_editors").insert({
      club_id: club.id, name, role_title: invRole, email, status: "pending", notes: "Invited by admin",
    });
    setSaving(false);
    if (error) {
      flash(error.code === "23505" ? "That email is already an editor for this club" : (error.message || "Could not send invite"), "err");
      return;
    }
    flash("Invite sent. They can sign in at /clubs/editor with this email.", "ok");
    setInvName(""); setInvEmail(""); setInvRole("Chairperson"); setShowInvite(false);
    reload();
  };

  const revoke = async (ed: any) => {
    if (!window.confirm("Remove " + ed.name + " as co-editor? They will no longer be able to post for this club.")) return;
    const { error } = await supabase.from("club_editors").update({ status: "removed", updated_at: new Date().toISOString() }).eq("id", ed.id);
    if (error) { flash(error.message || "Could not remove editor", "err"); return; }
    flash("Co-editor removed", "ok");
    reload();
  };

  const decide = async (post: any, verdict: "approve" | "reject") => {
    const patch: any = { reviewed_by: reviewerName || "Admin", reviewed_at: new Date().toISOString() };
    if (verdict === "approve") {
      patch.published = true; patch.status = "published";
    } else {
      patch.published = false; patch.status = "rejected";
      patch.review_note = rejectNote.trim() || null;
      setRejectNoteFor(null); setRejectNote("");
    }
    const { error } = await supabase.from("club_posts").update(patch).eq("id", post.id);
    if (error) { flash(error.message || "Update failed", "err"); return; }
    flash(verdict === "approve" ? "Post published to the club page" : "Post rejected", "ok");
    reload();
    // Tell the co-editor their post was decided (fire-and-forget; a failed
    // email must never block the decision itself).
    notifyClubEditor({
      data: {
        postId: post.id,
        verdict: verdict === "approve" ? "approved" : "rejected",
        reviewNote: (patch as any).review_note || "",
      },
    }).then(() => {}).catch(() => {});
  };

  const pending = posts.filter((p: any) => p.status === "pending");
  const rejected = posts.filter((p: any) => p.status === "rejected");
  const activeEditors = editors.filter((e: any) => e.status !== "removed");
  const removedEditors = editors.filter((e: any) => e.status === "removed");

  const chip = (ed: any) =>
    ed.status === "active" ? <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">Active</span>
      : ed.status === "removed" ? <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 text-[10px] font-semibold">Removed</span>
        : <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">Invited</span>;

  if (!loaded) {
    return <div className="py-2 text-xs text-stone-400">Loading editors&hellip;</div>;
  }

  return (
    <div className="mt-4 border-t border-stone-200 pt-4 space-y-5">
      {msg && (
        <div className={`text-xs px-3 py-2 rounded-lg ${msg.kind === "ok" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Pending approval */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-stone-500 uppercase">Posts awaiting approval ({pending.length})</p>
        </div>
        {pending.length === 0 && <p className="text-xs text-stone-400">No posts waiting. New posts from co-editors appear here for your approval.</p>}
        {pending.map((post: any) => (
          <div key={post.id} className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800">{post.title}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {post.editor_name || "Co-editor"}{post.editor_role ? " · " + post.editor_role : ""} · {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                </p>
                {post.excerpt && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{post.excerpt}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => decide(post, "approve")} className="px-2.5 py-1 rounded-lg bg-green-800 text-white text-xs font-semibold hover:bg-green-900 inline-flex items-center gap-1"><Check className="h-3 w-3" /> Approve</button>
                <button onClick={() => { setRejectNoteFor(rejectNoteFor === post.id ? null : post.id); setRejectNote(""); }} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 inline-flex items-center gap-1"><X className="h-3 w-3" /> Reject</button>
              </div>
            </div>
            {rejectNoteFor === post.id && (
              <div className="mt-2 flex gap-2">
                <input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Reason for rejection (optional)" className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs" />
                <button onClick={() => decide(post, "reject")} className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700">Reject post</button>
              </div>
            )}
          </div>
        ))}
        {rejected.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-semibold text-stone-400 uppercase mb-1">Recently rejected</p>
            {rejected.slice(0, 3).map((post: any) => (
              <div key={post.id} className="flex items-center justify-between py-1 text-xs">
                <span className="text-stone-500 line-through truncate">{post.title}</span>
                <span className="text-stone-300 shrink-0 ml-2">{post.review_note ? "· " + post.review_note : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Co-editors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-stone-500 uppercase">Co-editors ({activeEditors.length})</p>
          <button onClick={() => setShowInvite(!showInvite)} className="text-xs font-semibold text-green-800 hover:underline px-2 py-1 rounded-lg bg-green-50 border border-green-200">+ Invite chairperson / secretary</button>
        </div>

        {showInvite && (
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={invName} onChange={(e) => setInvName(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs" placeholder="Full name" />
              <select value={invRole} onChange={(e) => setInvRole(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs">
                <option>Chairperson</option><option>Secretary</option><option>Vice Chair</option><option>Treasurer</option><option>Other</option>
              </select>
              <input value={invEmail} onChange={(e) => setInvEmail(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs" placeholder="student@email.com" />
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={invite} disabled={saving || !invName || !invEmail} className="px-3 py-1 rounded-lg bg-green-800 text-white text-xs font-semibold disabled:opacity-50">{saving ? "Sending..." : "Send invite"}</button>
              <button onClick={() => setShowInvite(false)} className="px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs">Cancel</button>
            </div>
          </div>
        )}

        {activeEditors.length === 0 && !showInvite && <p className="text-xs text-stone-400">No co-editors yet. Invite your chairperson or secretary to write club news.</p>}
        {activeEditors.map((ed: any) => (
          <div key={ed.id} className="flex items-center justify-between py-1.5 text-xs">
            <span className="min-w-0">
              <span className="font-semibold text-stone-700">{ed.name}</span> <span className="text-stone-400">· {ed.role_title} · {ed.email}</span> {chip(ed)}
            </span>
            <button onClick={() => revoke(ed)} className="p-1 rounded hover:bg-red-50" title="Remove editor"><Trash2 className="h-3 w-3 text-red-400" /></button>
          </div>
        ))}
        {removedEditors.length > 0 && (
          <p className="text-[10px] text-stone-300 mt-1">
            Removed: {removedEditors.map((ed: any) => ed.name).join(", ")}
          </p>
        )}
        <p className="text-[10px] text-stone-400 mt-1">Co-editors sign in at /clubs/editor with their email; invited chairs and secretaries write posts that you approve here before they go live.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Role-aware overview: quick actions are limited to what the signed-in  */
/* role can actually use (the proxy enforces the same limits server-side). */
/* ------------------------------------------------------------------ */
function OverviewView({
  stats, roles, onNavigate,
}: { stats: Record<string, number>; roles: string[]; onNavigate: (t: Tab) => void }) {
  const isSuper = roles.includes("super_admin");
  const isFull = isSuper || roles.includes("admin");
  const isClubPatron = roles.includes("club_patron") && !isFull;
  const isAlumniPatron = roles.includes("alumni_patron") && !isFull;

  const quickCard = (key: Tab, label: string, desc: string, icon: any, bg: string, fg: string) => (
    <button onClick={() => onNavigate(key)} className={`group rounded-2xl border p-5 hover:shadow-md transition-all text-left ${bg}`.trim()}>
      <span className={`${fg} mb-2 block`}>{icon}</span>
      <p className="font-display text-sm font-bold text-stone-900">{label}</p>
      <p className="text-xs text-stone-500">{desc}</p>
    </button>
  );

  const intro = !isFull
    ? isClubPatron
      ? "Signed in as a club patron — everything below is scoped to your club(s)."
      : isAlumniPatron
        ? "Signed in as an alumni patron — below covers alumni, businesses, class notes and events."
        : null
    : null;

  return (
    <div>
      {intro && (
        <div className="mb-5 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-900">
          {intro}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={LayoutDashboard} label="Total Clubs" value={stats.clubs ?? 0} color="bg-green-800" />
        <StatCard icon={Users} label="Club Members" value={stats.clubMembers ?? 0} color="bg-blue-600" />
        <StatCard icon={GraduationCap} label="Alumni Profiles" value={stats.alumni ?? 0} color="bg-purple-600" />
        <StatCard icon={Building2} label="Businesses" value={stats.businesses ?? 0} color="bg-amber-600" />
        <StatCard icon={Calendar} label="Events" value={stats.events ?? 0} color="bg-rose-600" />
        <StatCard icon={BookOpen} label="Class Notes" value={stats.notes ?? 0} color="bg-cyan-600" />
        <StatCard icon={Megaphone} label="Club Posts" value={stats.clubPosts ?? 0} color="bg-indigo-600" />
        <StatCard icon={MessageSquare} label="Inquiries" value={stats.inquiries ?? 0} color="bg-orange-600" />
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {isFull ? (
          <>
            {quickCard("clubs", "Clubs", "Manage clubs & members", <Users className="h-6 w-6" />, "bg-green-50 border-green-200", "text-green-800")}
            {quickCard("events", "Events", "Create & manage events", <Calendar className="h-6 w-6" />, "bg-rose-50 border-rose-200", "text-rose-700")}
            {quickCard("notes", "Class Notes", "Approve submissions", <BookOpen className="h-6 w-6" />, "bg-cyan-50 border-cyan-200", "text-cyan-700")}
            {isSuper && quickCard("settings", "Settings", "Site info & hero media", <Settings className="h-6 w-6" />, "bg-stone-100 border-stone-200", "text-stone-600")}
          </>
        ) : isClubPatron ? (
          <>
            {quickCard("clubs", "My Clubs", "Club info, members & news", <Users className="h-6 w-6" />, "bg-green-50 border-green-200", "text-green-800")}
            {quickCard("applications", "Club Applications", "Review join requests", <Users className="h-6 w-6" />, "bg-indigo-50 border-indigo-200", "text-indigo-700")}
            {quickCard("events", "Events", "School & club events", <Calendar className="h-6 w-6" />, "bg-rose-50 border-rose-200", "text-rose-700")}
          </>
        ) : isAlumniPatron ? (
          <>
            {quickCard("alumni", "Alumni", "Profiles & approvals", <GraduationCap className="h-6 w-6" />, "bg-purple-50 border-purple-200", "text-purple-700")}
            {quickCard("businesses", "Businesses", "Alumni business directory", <Building2 className="h-6 w-6" />, "bg-amber-50 border-amber-200", "text-amber-700")}
            {quickCard("notes", "Class Notes", "Approve class notes", <BookOpen className="h-6 w-6" />, "bg-cyan-50 border-cyan-200", "text-cyan-700")}
            {quickCard("events", "Events", "Reunions & RSVPs", <Calendar className="h-6 w-6" />, "bg-rose-50 border-rose-200", "text-rose-700")}
          </>
        ) : null}
      </div>
    </div>
  );
}

function SocialLinksEditor({ entityType, entityId, compact = false }: { entityType: "school" | "mwosa" | "club"; entityId?: string; compact?: boolean }) {
  const [links, setLinks] = useState<any[]>([]);
  const [platform, setPlatform] = useState("facebook");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  const load = async () => {
    let q: any = supabase.from("social_links").select("*").eq("entity_type", entityType).order("sort_order", { ascending: true });
    if (entityId) q = q.eq("entity_id", entityId);
    const { data } = await q;
    if (data) setLinks(data);
  };
  useEffect(() => { load(); }, [entityType, entityId]);

  const add = async () => {
    const trimmed = url.trim();
    if (!trimmed) { setMsg({ text: "Paste a URL first", kind: "err" }); return; }
    setSaving(true);
    await supabase.from("social_links").insert({ entity_type: entityType, entity_id: entityId || null, platform, url: trimmed, sort_order: links.length + 1 });
    setSaving(false);
    setUrl("");
    setMsg({ text: "Added. Only active links show on the public page.", kind: "ok" });
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("social_links").update({ active: !active }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this social link?")) return;
    await supabase.from("social_links").delete().eq("id", id);
    load();
  };

  return (
    <div className={compact ? "" : "rounded-xl bg-white border border-stone-200 p-5"}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Social links {links.length > 0 && `(${links.length})`}</p>
        <p className="text-[10px] text-stone-400">Only active ones appear on the public page</p>
      </div>
      <div className="space-y-2 mb-3">
        {links.length === 0 && (
          <p className="text-xs text-stone-400">None yet. Add the platforms below and they will show on the site.</p>
        )}
        {links.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${l.active === false ? "bg-stone-200 text-stone-500" : "bg-green-100 text-green-800"}`}>
                {platformLabel(l.platform)}
              </span>
              <p className="text-xs text-stone-500 truncate mt-1">{l.url}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleActive(l.id, l.active)} title={l.active === false ? "Show on site" : "Hide from site"} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500">
                {l.active === false ? <Eye className="h-3.5 w-3.5" /> : <ListChecks className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => remove(l.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white">
          {SOCIAL_PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://tiktok.com/@handle" className="flex-1 min-w-[200px] rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <button onClick={add} disabled={saving} className="px-4 py-2 rounded-lg bg-green-800 text-white text-sm font-semibold hover:bg-green-900 disabled:opacity-50">
          {saving ? "..." : "Add"}
        </button>
      </div>
      {msg && <p className={`text-xs mt-2 ${msg.kind === "ok" ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}

function ClubsTab({ clubs, members, onRefresh, reviewerName, setToast }: { clubs: any[]; members: any[]; onRefresh: () => void; reviewerName: string; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
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

              <ClubEditorTools club={club} reviewerName={reviewerName} />

              {/* Social links for this club */}
              <div className="mt-4">
                <SocialLinksEditor entityType="club" entityId={club.slug} compact />
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

function EventsTab({ events, onRefresh, setToast }: { events: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
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

function GivingTab({ setToast }: { setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [section, setSection] = useState<"ways" | "stats" | "accounts" | "mobile" | "contact">("ways");
  const [ways, setWays] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [mobile, setMobile] = useState<any[]>([]);
  const [contact, setContact] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [w, s, a, m, c] = await Promise.all([
      supabase.from("giving_ways").select("*").order("sort_order", { ascending: true }),
      supabase.from("giving_stats").select("*").order("sort_order", { ascending: true }),
      supabase.from("donation_accounts").select("*").order("sort_order", { ascending: true }),
      supabase.from("mobile_donations").select("*").order("sort_order", { ascending: true }),
      supabase.from("giving_contact").select("*"),
    ]);
    if (w.data) setWays(w.data);
    if (s.data) setStats(s.data);
    if (a.data) setAccounts(a.data);
    if (m.data) setMobile(m.data);
    if (c.data) setContact(c.data);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setEdit(null); setForm({}); };
  const startEdit = (item: any) => {
    const f: Record<string, string> = {};
    Object.entries(item || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && k !== "id" && k !== "created_at" && k !== "updated_at") f[k] = String(v);
    });
    setEdit(item);
    setForm(f);
  };

  type GivingSection = "ways" | "stats" | "accounts" | "mobile" | "contact";
  const fieldDefs: Record<GivingSection, { label: string; type?: string; section: GivingSection }[]> = {
    ways: [
      { label: "title", section: "ways" }, { label: "description", section: "ways" }, { label: "tag", section: "ways" }, { label: "slug", section: "ways" }, { label: "sort_order", type: "number", section: "ways" },
    ],
    stats: [
      { label: "value", section: "stats" }, { label: "label", section: "stats" }, { label: "sort_order", type: "number", section: "stats" },
    ],
    accounts: [
      { label: "bank_name", section: "accounts" }, { label: "account_name", section: "accounts" }, { label: "account_number", section: "accounts" }, { label: "currency", section: "accounts" }, { label: "branch", section: "accounts" }, { label: "note", section: "accounts" }, { label: "way_slug", section: "accounts" }, { label: "sort_order", type: "number", section: "accounts" },
    ],
    mobile: [
      { label: "provider", section: "mobile" }, { label: "number", section: "mobile" }, { label: "account_name", section: "mobile" }, { label: "note", section: "mobile" }, { label: "way_slug", section: "mobile" }, { label: "sort_order", type: "number", section: "mobile" },
    ],
    contact: [
      { label: "person_name", section: "contact" }, { label: "title", section: "contact" }, { label: "phone", section: "contact" }, { label: "email", section: "contact" }, { label: "note", section: "contact" },
    ],
  };

  const tableFor = (sec: string) =>
    sec === "ways" ? "giving_ways" : sec === "stats" ? "giving_stats" : sec === "accounts" ? "donation_accounts" : sec === "mobile" ? "mobile_donations" : "giving_contact";

  const save = async () => {
    setSaving(true);
    const table = tableFor(section);
    const payload: any = {};
    Object.entries(form).forEach(([k, v]) => {
      if (k === "way_slug") {
        payload[k] = v.trim() ? v.trim() : null; // empty = general / shown on every card
        return;
      }
      if (v.trim() === "") return;
      payload[k] = fieldDefs[section].find(f => f.label === k)?.type === "number" ? parseInt(v) || 0 : v;
    });
    let error: any = null;
    if (edit?.id) {
      ({ error } = await supabase.from(table).update(payload).eq("id", edit.id));
    } else {
      ({ error } = await supabase.from(table).insert(payload));
    }
    setSaving(false);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: edit?.id ? "Updated" : "Added", type: "success" });
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(tableFor(section)).delete().eq("id", id);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Deleted", type: "success" });
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from(tableFor(section)).update({ active: !current }).eq("id", id);
    load();
  };

  const sectionTabs = [
    { key: "ways", label: "Ways of Giving" },
    { key: "stats", label: "Impact Stats" },
    { key: "accounts", label: "Bank Accounts" },
    { key: "mobile", label: "Mobile Money" },
    { key: "contact", label: "Contact Person" },
  ] as const;
  const list: any[] = section === "ways" ? ways : section === "stats" ? stats : section === "accounts" ? accounts : section === "mobile" ? mobile : contact;
  const titleOf = (item: any) => item.title || item.label || item.bank_name || item.provider || item.person_name || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-900">Giving Engine</h2>
          <p className="text-sm text-stone-500 mt-1">Cards, stats, donation accounts, mobile money and the contact person shown on /giving. Donations are manual — update these anytime.</p>
        </div>
        <button onClick={() => startEdit(null)}
          className="rounded-xl bg-green-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-green-800 transition-colors inline-flex items-center gap-2">
          + Add
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-stone-200">
        {sectionTabs.map(t => (
          <button key={t.key} onClick={() => { setSection(t.key); resetForm(); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${section === t.key ? "border-green-800 text-green-800" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Edit form (when adding/editing) */}
      {form && Object.keys(form).length > 0 && (
        <div className="rounded-2xl bg-white border border-stone-200 p-6">
          <h3 className="font-display font-bold text-stone-900 mb-4">{edit?.id ? "Edit" : "Add"} {sectionTabs.find(t => t.key === section)?.label}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldDefs[section].filter(f => f.section === section).map(f => (
              <div key={f.label} className={f.label === "description" || f.label === "note" ? "md:col-span-2" : ""}>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5 capitalize">{f.label.replace(/_/g, " ")}</label>
                {f.label === "way_slug" ? (
                  <>
                    <select value={form.way_slug || ""} onChange={e => setForm(prev => ({ ...prev, way_slug: e.target.value }))}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent bg-white">
                      <option value="">All ways (shown on every card)</option>
                      {ways.filter(w => w.slug).map(w => (
                        <option key={w.slug} value={w.slug}>{w.title} ({w.slug})</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-stone-400 mt-1">Leave empty to show this account on every card, or pick one way to show it only on that card.</p>
                  </>
                ) : f.label === "description" || f.label === "note" ? (
                  <textarea rows={3} value={form[f.label] || ""} onChange={e => setForm(prev => ({ ...prev, [f.label]: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" />
                ) : f.label === "slug" ? (
                  <>
                    <input type="text" value={form.slug || ""} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. trust_fund"
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" />
                    <p className="text-[11px] text-stone-400 mt-1">Stable key used to link bank / mobile accounts to this card (e.g. trust_fund, bursary, laboratory, infrastructure, scholarship, in_kind).</p>
                  </>
                ) : (
                  <input type={f.type || "text"} value={form[f.label] || ""} onChange={e => setForm(prev => ({ ...prev, [f.label]: e.target.value }))}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving} className="rounded-xl bg-green-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-green-800 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={resetForm} className="rounded-xl bg-stone-100 text-stone-600 px-5 py-2.5 text-sm font-semibold hover:bg-stone-200">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl bg-white border border-stone-200 divide-y divide-stone-100">
        {list.length === 0 && <p className="p-6 text-sm text-stone-500">Nothing here yet. Add one to get started.</p>}
        {list.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">{titleOf(item)}</p>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {item.description || item.note || item.number || item.account_number || item.value || ""}
                {(section === "accounts" || section === "mobile") && item.way_slug && (
                  <span className="text-green-700 font-medium"> · card: {ways.find((w: any) => w.slug === item.way_slug)?.title || item.way_slug}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {section !== "contact" && item.active !== undefined && (
                <button onClick={() => toggleActive(item.id, item.active)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${item.active ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-500"}`}>
                  {item.active ? "Live" : "Hidden"}
                </button>
              )}
              <button onClick={() => startEdit(item)} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-green-800"><Eye className="h-4 w-4" /></button>
              <button onClick={() => remove(item.id)} className="p-2 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
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
                      {!!settings[f.key] && settings[f.key]!.startsWith("http") && (
                        <video src={settings[f.key]!} className="w-full max-h-48 rounded-xl mb-2 object-cover" controls />)
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
                      {!!settings[f.key] && settings[f.key]!.startsWith("http") && (
                        <img src={settings[f.key]!} className="w-full max-h-48 rounded-xl mb-2 object-cover" alt={f.label} />)
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
    'academics': 'Academics',
    'mwosa': 'MWOSA Alumni'
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
        const part = parts[i]!;
        if (!current[part]) current[part] = {};
        current = current[part];
      }
      const lastKey = parts[parts.length - 1]!;
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
      title: item[columns[0]?.key ?? ""] || title,
      author: item[columns[1]?.key ?? ""] || item.student_name || item.mentor_name || item.donor_name || "",
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

/* ------------------------------------------------------------------ */
/* Donations review: every thank-you form submission, with payment      */
/* method and transaction reference, so the giving team can reconcile   */
/* each gift against bank slips and mobile money messages.              */
/* ------------------------------------------------------------------ */
const DONATION_TYPE_LABELS: Record<string, string> = {
  trust_fund: "Trust Fund",
  bursary: "Bursary support",
  laboratory: "Laboratory renovation",
  infrastructure: "Infrastructure project",
  scholarship: "Scholarship",
  in_kind: "In-kind gift",
  other: "Other",
};
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank transfer",
  mtn_momo: "MTN Mobile Money",
  airtel_money: "Airtel Money",
  cash: "Cash",
  in_kind: "In-kind / goods",
  other: "Other",
};

function DonationsTab({ data, onRefresh, setToast }: { data: any[]; onRefresh: () => void; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const matchedCount = data.filter((d: any) => d.status === "matched").length;
  const receivedCount = data.filter((d: any) => d.status === "received").length;

  const filtered = data.filter((d: any) => {
    if (filter === "matched" && d.status !== "matched") return false;
    if (filter === "received" && d.status !== "received") return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = [d.donor_name, d.donor_email, d.transaction_ref, d.donation_type, d.payment_method].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("donations").update({ status }).eq("id", id);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: status === "matched" ? "Gift marked as matched" : "Gift moved back to received", type: "success" });
    onRefresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this donation record?")) return;
    await supabase.from("donations").delete().eq("id", id);
    setToast({ message: "Deleted", type: "success" });
    onRefresh();
  };

  const copyRef = async (d: any) => {
    const text = d.transaction_ref || "";
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
    setCopiedId(d.id);
    window.setTimeout(() => setCopiedId((c) => (c === d.id ? null : c)), 1500);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Donations review ({data.length})</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search donor, ref, email..."
              className="pl-9 pr-3 py-2 w-60 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="all">All</option>
            <option value="received">Received / to match ({receivedCount})</option>
            <option value="matched">Matched ({matchedCount})</option>
          </select>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-stone-100 transition-colors" title="Refresh"><RefreshCw className="h-4 w-4 text-stone-400" /></button>
        </div>
      </div>

      {/* Reconciliation summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-white border border-stone-200 p-4">
          <p className="text-2xl font-bold text-stone-900">{data.length}</p>
          <p className="text-xs text-stone-500 mt-0.5">Total gifts recorded</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-2xl font-bold text-amber-700">{receivedCount}</p>
          <p className="text-xs text-stone-500 mt-0.5">Received — still to match</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-800">{matchedCount}</p>
          <p className="text-xs text-stone-500 mt-0.5">Matched to bank / mobile money</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Heart className="h-10 w-10 mx-auto mb-3" />
          <p>No donation submissions{query.trim() || filter !== "all" ? " matching this view" : " yet"}.</p>
          <p className="text-sm mt-1">Thank-you form submissions from the Giving page appear here for reconciliation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item: any) => {
            const matched = item.status === "matched";
            return (
              <div key={item.id} className="rounded-xl bg-white border border-stone-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${matched ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {matched ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {matched ? "Matched" : "Received"}
                      </span>
                      <span className="text-xs text-stone-400">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p className="font-semibold text-stone-900">{item.donor_name || "Anonymous"}</p>
                    {item.donor_email && <p className="text-xs text-stone-400">{item.donor_email}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-800">{DONATION_TYPE_LABELS[item.donation_type] || item.donation_type || "Other"}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{PAYMENT_METHOD_LABELS[item.payment_method] || item.payment_method || "—"}</span>
                    </div>
                    {item.transaction_ref && (
                      <div className="mt-2.5 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                        <p className="text-sm font-mono text-stone-700 break-all">{item.transaction_ref}</p>
                        <button onClick={() => copyRef(item)} className="ml-auto shrink-0 p-1.5 rounded-md hover:bg-stone-200 text-stone-500 transition-colors" title="Copy transaction reference">
                          {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setDetail(item)} className="p-2.5 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors" title="View details">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </button>
                    {!matched ? (
                      <button onClick={() => setStatus(item.id, "matched")} className="px-3 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-semibold transition-colors" title="Reconciled against the bank/MoMo statement">
                        Mark matched
                      </button>
                    ) : (
                      <button onClick={() => setStatus(item.id, "received")} className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-colors" title="Move back to received">
                        Reopen
                      </button>
                    )}
                    <button onClick={() => remove(item.id)} className="p-2.5 rounded-lg hover:bg-red-100 border border-red-200 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-stone-900">Gift details</h3>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-stone-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${detail.status === "matched" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                  {detail.status === "matched" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {detail.status === "matched" ? "Matched" : "Received — awaiting match"}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Donor</p>
                <p className="font-display text-lg font-bold text-stone-900">{detail.donor_name || "Anonymous"}</p>
                {detail.donor_email && <p className="text-sm text-stone-600">{detail.donor_email}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">What they donated</p>
                  <p className="text-sm text-stone-700">{DONATION_TYPE_LABELS[detail.donation_type] || detail.donation_type || "Other"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">How they paid</p>
                  <p className="text-sm text-stone-700">{PAYMENT_METHOD_LABELS[detail.payment_method] || detail.payment_method || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Transaction reference / message</p>
                <p className="text-sm font-mono text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 break-all">{detail.transaction_ref || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Submitted</p>
                <p className="text-sm text-stone-700">{new Date(detail.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Record id</p>
                <p className="text-xs font-mono text-stone-400 break-all">{detail.id}</p>
              </div>
            </div>
            <div className="p-6 border-t border-stone-200 flex gap-3">
              {detail.status === "matched" ? (
                <button onClick={() => { setStatus(detail.id, "received"); setDetail(null); }} className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors">
                  Reopen as received
                </button>
              ) : (
                <button onClick={() => { setStatus(detail.id, "matched"); setDetail(null); }} className="flex-1 py-3 px-4 bg-green-800 hover:bg-green-900 text-white rounded-xl font-semibold transition-colors">
                  Mark as matched
                </button>
              )}
              <button onClick={() => setDetail(null)} className="flex-1 py-3 px-4 bg-white border border-stone-300 text-stone-700 rounded-xl font-semibold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MWOSA: alumni association page (stats, links, updates)               */
/* ------------------------------------------------------------------ */
function MwosaTab({ setToast }: { setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [section, setSection] = useState<"stats" | "links" | "updates" | "socials">("links");
  const [stats, setStats] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [s, l, u] = await Promise.all([
      supabase.from("mwosa_stats").select("*").order("sort_order", { ascending: true }),
      supabase.from("mwosa_links").select("*").order("sort_order", { ascending: true }),
      supabase.from("mwosa_updates").select("*").order("sort_order", { ascending: true }),
    ]);
    if (s.data) setStats(s.data);
    if (l.data) setLinks(l.data);
    if (u.data) setUpdates(u.data);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setEdit(null); setForm({}); setImageUrl(""); };
  const startEdit = (item: any) => {
    const f: Record<string, string> = {};
    Object.entries(item || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && k !== "id" && k !== "created_at" && k !== "updated_at" && k !== "image_url") f[k] = String(v);
    });
    setEdit(item);
    setForm(f);
    setImageUrl(item?.image_url || "");
  };

  const tableFor = (sec: string) =>
    sec === "stats" ? "mwosa_stats" : sec === "links" ? "mwosa_links" : "mwosa_updates";

  type MwosaSection = "stats" | "links" | "updates" | "socials";
  const fieldDefs: Record<MwosaSection, { label: string; type?: string }[]> = {
    stats: [
      { label: "value" }, { label: "label" }, { label: "sort_order", type: "number" },
    ],
    links: [
      { label: "label" }, { label: "url" }, { label: "description" },
      { label: "icon" }, { label: "category" }, { label: "sort_order", type: "number" },
    ],
    updates: [
      { label: "title" }, { label: "body" }, { label: "update_date" }, { label: "sort_order", type: "number" },
    ],
    socials: [],
  };

  const save = async () => {
    setSaving(true);
    const table = tableFor(section);
    const payload: any = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v.trim() === "") return;
      payload[k] = fieldDefs[section].find(f => f.label === k)?.type === "number" ? parseInt(v) || 0 : v;
    });
    if (section === "links" && !payload.category) payload.category = "quick";
    if (section === "updates") payload.image_url = imageUrl.trim() ? imageUrl.trim() : null;
    let error: any = null;
    if (edit?.id) {
      ({ error } = await supabase.from(table).update(payload).eq("id", edit.id));
    } else {
      ({ error } = await supabase.from(table).insert(payload));
    }
    setSaving(false);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: edit?.id ? "Updated" : "Added", type: "success" });
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(tableFor(section)).delete().eq("id", id);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Deleted", type: "success" });
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from(tableFor(section)).update({ active: !current }).eq("id", id);
    load();
  };

  const sectionTabs = [
    { key: "links", label: "Links (Pulse, Directory, Channels)" },
    { key: "socials", label: "Social Links" },
    { key: "stats", label: "Milestone Stats" },
    { key: "updates", label: "Project Updates" },
  ] as const;

  const rows = section === "stats" ? stats : section === "links" ? links : section === "updates" ? updates : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="font-display text-xl font-bold text-stone-900">MWOSA Alumni Page</h3>
        <div className="flex gap-2 flex-wrap">
          {sectionTabs.map(t => (
            <button key={t.key} onClick={() => { setSection(t.key); resetForm(); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${section === t.key ? "bg-green-800 text-white" : "bg-white border border-stone-300 text-stone-600 hover:border-green-800"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-stone-500 mb-5">
        These items render on the public /mwosa page. The narrative text (Who we are, project updates)
        is edited under <strong>Page Content</strong> for the <strong>mwosa</strong> page.
      </p>

      {section === "socials" ? (
        <SocialLinksEditor entityType="mwosa" />
      ) : (
      <>
      {edit && (
        <div className="rounded-xl bg-white border border-stone-200 p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg font-bold text-stone-900">
              {edit.id ? `Edit: ${edit.label || edit.title || edit.value || "item"}` : "Add new"}
            </h4>
            <button onClick={resetForm} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldDefs[section].map(f => (
              <div key={f.label} className="md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">{f.label}</label>
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={form[f.label] ?? ""}
                  onChange={e => setForm({ ...form, [f.label]: e.target.value })}
                  className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          {section === "links" && (
            <p className="text-xs text-stone-500">
              <strong>category:</strong> "quick" shows the big Get Involved cards (Pulse, Directory, Business);
              "channel" shows the WhatsApp class channels by decade.
            </p>
          )}
          {section === "updates" && (
            <div>
              <ImageUpload value={imageUrl} onChange={setImageUrl} label="Card cover photo (optional)" />
              <p className="text-xs text-stone-400 mt-1">This photo leads the card on the public page. Leave empty to remove.</p>
            </div>
          )}
          {section === "updates" && edit?.id && (
            <div className="border-t border-stone-100 pt-5">
              <UpdateMediaManager updateId={edit.id} setToast={setToast} />
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={resetForm} className="px-5 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">{rows.length} items</p>
        <button onClick={() => { setEdit({}); setForm({}); setImageUrl(""); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-800 hover:bg-green-900 text-white rounded-xl text-sm font-semibold transition-colors">
          <UserPlus className="h-4 w-4" /> Add {section === "stats" ? "Stat" : section === "updates" ? "Update" : "Link"}
        </button>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-xl bg-white border border-dashed border-stone-300 p-10 text-center text-sm text-stone-400">
            No {section} yet. Click "Add" to create one.
          </div>
        )}
        {rows.map((item: any) => {
          const title = item.label || item.title || item.value || "(untitled)";
          const sub = item.url || item.body || item.label || "";
          return (
            <div key={item.id} className="rounded-xl bg-white border border-stone-200 p-4 flex items-center justify-between gap-4 hover:border-green-800 transition-colors">
              {section === "updates" && item.image_url && (
                <img src={item.image_url} alt="" className="w-24 h-16 rounded-lg object-cover border border-stone-200 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-stone-900 truncate">{title}</p>
                  {section === "links" && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.category === "channel" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}>
                      {item.category === "channel" ? "Channel" : "Quick link"}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.active === false ? "bg-stone-100 text-stone-500" : "bg-emerald-100 text-emerald-700"}`}>
                    {item.active === false ? "Hidden" : "Live"}
                  </span>
                </div>
                <p className="text-sm text-stone-500 truncate mt-0.5">{sub}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(item.id, item.active)} title={item.active === false ? "Publish" : "Hide"}
                  className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                  {item.active === false ? <Eye className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}
                </button>
                <button onClick={() => startEdit(item)} title="Edit" className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button onClick={() => remove(item.id)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}

/* Media manager for a single MWOSA project update: photos and videos with
 * captions, reordered, uploaded straight to Supabase Storage (never a URL).
 * This is the backend for the update's detail/story page. */
function UpdateMediaManager({ updateId, setToast }: { updateId: string; setToast: (t: { message: string; type: "success" | "error" } | null) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { caption: string; sort: string; poster: string }>>({});
  const [addCaption, setAddCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posterUploading, setPosterUploading] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("mwosa_update_media").select("*").eq("update_id", updateId).order("sort_order", { ascending: true });
    setItems(data || []);
    const e: Record<string, { caption: string; sort: string; poster: string }> = {};
    (data || []).forEach((m: any) => { e[m.id] = { caption: m.caption || "", sort: String(m.sort_order ?? 0), poster: m.poster_url || "" }; });
    setEdits(e);
    setLoading(false);
  };

  useEffect(() => { load(); }, [updateId]);

  const uploadFile = async (file: File): Promise<string> => {
    const path = `mwosa-updates/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const addMedia = async (file: File | undefined, type: "image" | "video") => {
    if (!file) return;
    const videoCount = items.filter((m: any) => m.media_type === "video").length;
    const imageCount = items.filter((m: any) => m.media_type === "image").length;
    if (type === "video" && videoCount >= 2) {
      setToast({ message: "Stories allow a maximum of 2 videos. Remove one before adding another.", type: "error" });
      if (videoRef.current) videoRef.current.value = "";
      return;
    }
    if (type === "image" && imageCount >= 5) {
      setToast({ message: "Stories allow a maximum of 5 photos. Remove one before adding another.", type: "error" });
      if (photoRef.current) photoRef.current.value = "";
      return;
    }
    if (items.length >= 6) {
      setToast({ message: "Stories hold a maximum of 6 media items (5 photos + 2 videos).", type: "error" });
      if (photoRef.current) photoRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
      return;
    }
    if (type === "video" && file.size > 5 * 1024 * 1024) {
      setToast({ message: "Videos must be 5MB or smaller. Compress or trim this clip first.", type: "error" });
      if (videoRef.current) videoRef.current.value = "";
      return;
    }
    const captionWords = addCaption.trim().split(/\s+/).filter(Boolean).length;
    if (captionWords > 55) {
      setToast({ message: "Captions are limited to 55 words. Shorten this caption before uploading.", type: "error" });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      const { error } = await supabase.from("mwosa_update_media").insert({
        update_id: updateId,
        media_type: type,
        media_url: url,
        caption: addCaption.trim() || null,
        sort_order: items.length + 1,
      });
      if (error) throw error;
      setAddCaption("");
      setToast({ message: "Media added", type: "success" });
      load();
    } catch (e: any) {
      setToast({ message: e?.message || "Upload failed", type: "error" });
    } finally {
      setUploading(false);
      if (photoRef.current) photoRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
    }
  };

  const saveRow = async (id: string) => {
    const e = edits[id];
    if (!e) return;
    const captionWords = (e.caption || "").trim().split(/\s+/).filter(Boolean).length;
    if (captionWords > 55) {
      setToast({ message: "Captions are limited to 55 words. Shorten this caption before saving.", type: "error" });
      return;
    }
    const { error } = await supabase.from("mwosa_update_media").update({
      caption: e.caption.trim() || null,
      sort_order: parseInt(e.sort) || 0,
      poster_url: e.poster.trim() || null,
    }).eq("id", id);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Saved", type: "success" });
    load();
  };

  const setPoster = async (id: string, file: File | undefined) => {
    if (!file) return;
    setPosterUploading(id);
    try {
      const url = await uploadFile(file);
      setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] || { caption: "", sort: "0", poster: "" }), poster: url } }));
      setToast({ message: "Poster uploaded — press Save on the row to keep it", type: "success" });
    } catch (e: any) {
      setToast({ message: e?.message || "Poster upload failed", type: "error" });
    } finally {
      setPosterUploading(null);
    }
  };

  const removeRow = async (id: string) => {
    const { error } = await supabase.from("mwosa_update_media").delete().eq("id", id);
    if (error) { setToast({ message: error.message, type: "error" }); return; }
    setToast({ message: "Deleted", type: "success" });
    load();
  };

  /* Drag-to-reorder: HTML5 drag & drop. On drop the whole list's sort_order
   * is rewritten in one batch, then reloaded so the UI matches the DB. */
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDragId(id);
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId) setDragOverId(id);
  };

  const onDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null); setDragOverId(null);
      return;
    }
    const next = [...items];
    const from = next.findIndex((m) => m.id === dragId);
    const to = next.findIndex((m) => m.id === targetId);
    if (from === -1 || to === -1) {
      setDragId(null); setDragOverId(null);
      return;
    }
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null); setDragOverId(null);
    // Persist the new order (1-based) in one batch.
    const updates = next.map((m, i) =>
      supabase.from("mwosa_update_media").update({ sort_order: i + 1 }).eq("id", m.id),
    );
    await Promise.all(updates);
    setToast({ message: "Order saved", type: "success" });
    load();
  };

  return (
    <div>
      <p className="text-sm font-semibold text-stone-700 mb-1">Story media (photos & videos with captions)</p>
      <p className="text-xs text-stone-400 mb-4">
        These appear on the update's detailed page. Upload a photo or video, give it a caption, and reorder.
      </p>

      <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 mb-4 space-y-3">
        <div className="relative">
          <input
            value={addCaption}
            onChange={(e) => setAddCaption(e.target.value)}
            placeholder="Caption for the new photo / video (max 55 words)"
            className="w-full p-3 pr-20 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
          />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold ${addCaption.trim().split(/\s+/).filter(Boolean).length > 55 ? "text-red-600" : "text-stone-400"}`}>
            {addCaption.trim().split(/\s+/).filter(Boolean).length}/55
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => photoRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-800 hover:bg-green-900 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            <ImageIcon className="h-4 w-4" /> {uploading ? "Uploading…" : "Add photo"}
          </button>
          <button
            onClick={() => videoRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:border-green-800 text-stone-700 text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            <VideoIcon className="h-4 w-4" /> {uploading ? "Uploading…" : "Add video"}
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => addMedia(e.target.files?.[0], "image")} />
          <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => addMedia(e.target.files?.[0], "video")} />
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-stone-400">Loading media…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-400">
          No media yet. Add a photo or video above — it will appear on the detailed page.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((m) => (
            <div
              key={m.id}
              draggable
              onDragStart={(e) => onDragStart(e, m.id)}
              onDragOver={(e) => onDragOver(e, m.id)}
              onDrop={(e) => onDrop(e, m.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              className={`rounded-xl border p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all ${dragId === m.id ? "opacity-40 ring-2 ring-green-800 ring-offset-1" : "bg-white border-stone-200"} ${dragOverId === m.id && dragId !== m.id ? "ring-2 ring-green-600 ring-offset-1 bg-green-50/60" : ""}`}
            >
              <GripVertical className="h-5 w-5 text-stone-400 shrink-0" />
              <div className="w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                {m.media_type === "video" ? (
                  <video src={m.media_url} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                ) : (
                  <img src={m.media_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={edits[m.id]?.caption ?? ""}
                    onChange={(e) => setEdits({ ...edits, [m.id]: { caption: e.target.value, sort: edits[m.id]?.sort ?? "0", poster: edits[m.id]?.poster ?? "" } })}
                    placeholder="Caption"
                    className="flex-1 min-w-0 p-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  />
                  <input
                    value={edits[m.id]?.sort ?? "0"}
                    onChange={(e) => setEdits({ ...edits, [m.id]: { caption: edits[m.id]?.caption ?? "", sort: e.target.value, poster: edits[m.id]?.poster ?? "" } })}
                    title="Order (1, 2, 3…)"
                    className="w-16 p-2 border border-stone-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                  />
                  <span className="text-[10px] uppercase tracking-wide text-stone-400">{m.media_type}</span>
                </div>
                {m.media_type === "video" && (
                  <div className="flex items-center gap-2">
                    {edits[m.id]?.poster ? (
                      <img src={edits[m.id]?.poster} alt="poster" className="h-10 w-16 rounded-md object-cover border border-stone-200 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-stone-400 italic">No poster frame yet</span>
                    )}
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-green-100 text-stone-600 hover:text-green-800 text-[11px] font-semibold cursor-pointer transition-colors">
                      {posterUploading === m.id ? "Uploading…" : edits[m.id]?.poster ? "Change poster" : "Add poster frame"}
                      <input type="file" accept="image/*" className="hidden" disabled={posterUploading === m.id} onChange={(e) => setPoster(m.id, e.target.files?.[0])} />
                    </label>
                    {edits[m.id]?.poster && (
                      <button
                        onClick={() => setEdits({ ...edits, [m.id]: { caption: edits[m.id]?.caption ?? "", sort: edits[m.id]?.sort ?? "0", poster: "" } })}
                        className="text-[11px] text-stone-400 hover:text-red-500 underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <button onClick={() => saveRow(m.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-green-100 text-stone-600 hover:text-green-800 text-xs font-semibold transition-colors">
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => removeRow(m.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 text-xs font-semibold transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
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

/* ------------------------------------------------------------------ */
/* Staff & Roles: super admins invite staff by email. The invite becomes  */
/* active the first time that person signs in with their email OTP at     */
/* /admin; the session cookie then carries their auth user_id.            */
/* ------------------------------------------------------------------ */
const STAFF_ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "club_patron", label: "Club Patron" },
  { value: "alumni_patron", label: "Alumni Patron" },
];

function StaffTab() {
  const [invites, setInvites] = useState<any[] | null>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [clubId, setClubId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  const load = async () => {
    const res = await adminListStaff();
    if (res.error) {
      setError(String(res.error));
      setInvites([]);
    } else {
      setInvites(res.invites || []);
    }
    const { data } = await supabase.from("clubs").select("id, name").order("name");
    if (data) setClubs(data);
  };

  useEffect(() => { load(); }, []);

  const flash = (text: string, kind: "ok" | "err") => {
    setMsg({ text, kind });
    window.setTimeout(() => setMsg(null), 4500);
  };

  const invite = async () => {
    setError("");
    if (!name.trim() || !email.trim()) { flash("Name and email are required", "err"); return; }
    if (role === "club_patron" && !clubId) { flash("Pick the club this patron oversees", "err"); return; }
    setBusy(true);
    const res = await adminInviteStaff({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        club_id: role === "club_patron" ? clubId : undefined,
      },
    });
    setBusy(false);
    if (res.error) { flash(String(res.error), "err"); return; }
    flash("Invite sent — they can sign in at /admin with this email", "ok");
    setName(""); setEmail(""); setRole("admin"); setClubId(""); setShowInvite(false);
    load();
  };

  const revoke = async (inv: any) => {
    if (!window.confirm(`Remove ${inv.name} (${inv.email})? They lose dashboard access immediately.`)) return;
    const res = await adminRevokeStaff({ data: { id: inv.id } });
    if (res.error) { flash(String(res.error), "err"); return; }
    flash("Staff member removed", "ok");
    load();
  };

  const resend = async (inv: any) => {
    setBusy(true);
    const res = await adminResendInviteCode({ data: { id: inv.id } });
    setBusy(false);
    if (res.error) { flash(String(res.error), "err"); return; }
    flash(`A fresh invite code was emailed to ${inv.email}`, "ok");
  };

  const chip = (inv: any) =>
    inv.status === "active" ? <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">Active</span>
      : inv.status === "removed" ? <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 text-[10px] font-semibold">Removed</span>
        : <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">Invited</span>;

  const roleName = (r: string) => STAFF_ROLE_OPTIONS.find((o) => o.value === r)?.label || r;
  const clubName = (clubId: string | null) => clubs.find((c) => c.id === clubId)?.name || "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-bold text-stone-900">Staff & Roles</h3>
        <button onClick={() => setShowInvite(!showInvite)} className="px-5 py-2.5 rounded-xl bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors shadow-md inline-flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Invite staff member
        </button>
      </div>

      {msg && (
        <div className={`text-xs px-3 py-2 rounded-lg mb-4 ${msg.kind === "ok" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {showInvite && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-6 mb-6">
          <p className="text-sm font-semibold text-green-800 mb-4">Invite a staff member</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="e.g. Mr. Moses Okello" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email (their sign-in)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" placeholder="staff@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
              <select value={role} onChange={(e) => { setRole(e.target.value); setClubId(""); }} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm">
                {STAFF_ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {role === "club_patron" && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Club they patron</label>
                <select value={clubId} onChange={(e) => setClubId(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm">
                  <option value="">Select club…</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-3">
            They'll receive a 6-digit invite code by email to accept at /admin/accept-invite and set their password.
            {role === "club_patron" && " Their dashboard is limited to their club; row-level scoping applies once they sign in."}
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={invite} disabled={busy || !name || !email} className="px-4 py-2 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 disabled:opacity-50">
              {busy ? "Sending…" : "Send invite"}
            </button>
            <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200">Cancel</button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {invites === null ? (
        <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-green-800 border-t-transparent" /></div>
      ) : invites.length === 0 ? (
        <p className="text-sm text-stone-500">No staff yet. Invite your first member above — the site owner invite is pending sign-in.</p>
      ) : (
        <div className="space-y-3">
          {invites.map((inv) => (
            <div key={inv.id} className="rounded-2xl bg-white border border-stone-200 p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-900">
                  {inv.name}
                  {inv.role === "club_patron" && clubName(inv.club_id) ? <span className="text-stone-400 font-medium"> · {clubName(inv.club_id)}</span> : null}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {inv.email} · <span className="font-semibold text-stone-700">{roleName(inv.role)}</span> · invited {new Date(inv.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {chip(inv)}
                {inv.status === "pending" && (
                  <button onClick={() => resend(inv)} disabled={busy} className="px-2.5 py-1.5 rounded-lg hover:bg-green-50 border border-green-100 text-xs font-semibold text-green-800" title="Email a fresh invite code">
                    <RefreshCw className="h-3.5 w-3.5 inline mr-1" />Resend code
                  </button>
                )}
                {inv.status !== "removed" && (
                  <button onClick={() => revoke(inv)} className="p-2 rounded-lg hover:bg-red-50 border border-red-100" title="Remove access">
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Staff sign in: email one-time code (Supabase Auth OTP). There is no   */
/* shared passcode anymore. The verified session is exchanged for the    */
/* httpOnly staff cookie (which carries the user_id) by adminLogin.      */
/* ------------------------------------------------------------------ */
function StaffLoginScreen({ onAuthed }: { onAuthed: () => void }) {
  const resend = useOtpResend();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [usePasscode, setUsePasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [newUser, setNewUser] = useState(false);

  const passwordLogin = async () => {
    setError("");
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setError("Enter your email address."); return; }
    if (!password) { setError("Enter your password."); return; }
    setBusy(true);
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email: em, password });
      if (signInErr) {
        setError("Email or password is incorrect.");
        return;
      }
      const token = data.session?.access_token;
      if (!token) throw new Error("Sign-in did not complete.");
      const res = await adminLogin({ data: { accessToken: token } });
      if (!res.ok) {
        await supabase.auth.signOut();
        setError(res.reason || "This email is not an invited staff member.");
        return;
      }
      setEmail(""); setCode(""); setPassword(""); setSent(false); setUsePasscode(false); setUsePassword(false);
      onAuthed();
    } catch (e: any) {
      setError(e?.message || "Could not sign in with that password.");
    } finally {
      setBusy(false);
    }
  };

  const passcodeLogin = async () => {
    setError("");
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setError("Enter your email address."); return; }
    if (!passcode.trim()) { setError("Enter the passcode."); return; }
    setBusy(true);
    try {
      const res = await adminPasscodeLogin({ data: { email: em, passcode: passcode.trim() } });
      if (!res.ok) {
        setError(res.reason || "That passcode did not work.");
        return;
      }
      setEmail(""); setCode(""); setPasscode(""); setSent(false); setUsePasscode(false);
      onAuthed();
    } catch (e: any) {
      setError(e?.message || "Could not sign in with the passcode.");
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async () => {
    setError("");
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setError("Enter a valid email address."); return; }
    if (!resend.allowSend()) { setError(resend.hint()); return; }
    setBusy(true);
    try {
      const res = await adminSendLoginCode({ data: { email: em } });
      if (!res.ok) {
        setError(res.reason || "Could not send the code.");
        return;
      }
      resend.onSent();
      setSent(true);
      setNewUser(!!res.isNew);
    } catch (e: any) {
      setError(e?.message || "Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyAndLink = async () => {
    setError("");
    const em = email.trim().toLowerCase();
    if (!code.trim()) { setError("Enter the code you received by email."); return; }
    setBusy(true);
    try {
      const res = await adminVerifyLoginCode({ data: { email: em, code: code.trim() } });
      if (!res.ok) {
        setError(res.reason || "That code did not work. Check it and try again.");
        return;
      }
      if (res.needsPassword) {
        // First-time staff: the code is verified — now create your password.
        window.location.href = `/admin/accept-invite?email=${encodeURIComponent(em)}&code=${encodeURIComponent(code.trim())}`;
        return;
      }
      setEmail(""); setCode(""); setSent(false);
      onAuthed();
    } catch (e: any) {
      setError(e?.message || "That code did not work. Check it and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-y-auto bg-[#0A0D14] text-white flex items-center justify-center px-4 py-10">
      {/* Pillar faded behind the dark navy */}
      <img
        src="/hero-poster.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-[0.14]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0D14]/70 via-[#0A0D14]/60 to-[#0A0D14]/85" />
      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-2xl">
          <div className="p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-400/30 flex items-center justify-center mb-5">
              <ShieldCheck className="h-8 w-8 text-emerald-300" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300/90 mb-2">Staff Portal</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-2">M.M College Wairaka</h1>
            <p className="text-sm text-white/55 mb-6">
              {usePasscode
                ? "Super admin only: enter your email and the fallback passcode."
                : usePassword
                  ? "Enter the email and password you set from your invite."
                  : sent
                    ? "Enter the one-time code emailed to you."
                    : "Sign in with your staff email."}
            </p>
          </div>

          {usePassword ? (
            <div className="space-y-4">
              <input
                type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="staff@email.com"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40"
              />
              <input
                type="password" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && passwordLogin()}
                placeholder="Password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40"
              />
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button onClick={passwordLogin} disabled={busy} className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                <KeyRound className="h-4 w-4" /> {busy ? "Signing in…" : "Sign in with password"}
              </button>
              <button onClick={() => { setUsePassword(false); setPassword(""); setError(""); }} className="w-full text-center text-sm text-white/40 hover:text-white">
                Back to email sign-in
              </button>
            </div>
          ) : usePasscode ? (
            <div className="space-y-4">
              <input
                type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="superadmin@email.com"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40"
              />
              <input
                type="password" value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && passcodeLogin()}
                placeholder="Passcode"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40"
              />
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button onClick={passcodeLogin} disabled={busy} className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                <KeyRound className="h-4 w-4" /> {busy ? "Signing in…" : "Sign in with passcode"}
              </button>
              <button onClick={() => { setUsePasscode(false); setPasscode(""); setError(""); }} className="w-full text-center text-sm text-white/40 hover:text-white">
                Back to email sign-in
              </button>
            </div>
          ) : !sent ? (
            <div className="space-y-4">
              <input
                type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
                placeholder="staff@email.com"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40"
              />
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button onClick={sendCode} disabled={busy || resend.sendsLeft <= 0} className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                <Send className="h-4 w-4" /> {busy ? "Sending…" : "Email me a code"}
              </button>
              {resend.sendsLeft < resend.maxSends && (
                <p className="text-center text-[11px] text-white/35">{resend.sendsLeft} of {resend.maxSends} sends left this session</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-white/40">Code sent to <span className="font-medium text-white/80">{email.trim().toLowerCase()}</span></p>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && verifyAndLink()}
                placeholder="One-time code"
                inputMode="numeric"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-40"
              />
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button onClick={verifyAndLink} disabled={busy} className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[#06110d] px-8 py-3.5 text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button onClick={sendCode} disabled={busy || !resend.allowSend()} className="w-full text-center text-sm text-white/40 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                {resend.label()}
              </button>
              <p className="text-center text-[11px] text-white/35">{resend.sendsLeft} of {resend.maxSends} sends left this session</p>
              <button
                onClick={async () => {
                  // Start over: go back to the email entry and send a fresh code
                  // straight away, so the user is never stuck waiting.
                  setCode("");
                  setSent(false);
                  setError("");
                  const em = email.trim().toLowerCase();
                  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return;
                  if (!resend.allowSend()) return;
                  try {
                    const res = await adminSendLoginCode({ data: { email: em } });
                    if (res.ok) {
                      resend.onSent();
                      setNewUser(!!res.isNew);
                    }
                  } catch {
                    // silent — the user can press "Email me a code" again
                  }
                }}
                className="w-full text-center text-sm text-white/40 hover:text-white"
              >
                Wrong email? Start over — a new code will be sent
              </button>
            </div>
          )}

          {!usePasscode && !usePassword && (
            <div className="mt-5 space-y-2">
              <button onClick={() => { setUsePassword(true); setPassword(""); setError(""); }} className="block mx-auto text-xs font-medium text-white/40 hover:text-white underline underline-offset-2">
                Have a password? Sign in with email & password
              </button>
              <button onClick={() => { setUsePasscode(true); setPasscode(""); setError(""); }} className="block mx-auto text-xs font-medium text-white/40 hover:text-white underline underline-offset-2">
                Email unavailable? Use the super admin passcode
              </button>
            </div>
          )}
            <Link to="/" className="block text-center mt-4 text-sm font-medium text-white/40 hover:text-white">← Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type StaffSessionState = {
  authed: boolean;
  user: { id: string; email: string; name?: string } | null;
  roles: string[];
};

function AdminPage() {
  const [session, setSession] = useState<StaffSessionState | null>(null);
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
  const [mwosaLinks, setMwosaLinks] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  // Live viewport detection (matchMedia listener): the layout re-renders the
  // moment the user crosses the mobile/desktop breakpoint, so no refresh is
  // ever needed when moving between devices or resizing.
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!isMobile) setMoreOpen(false); // close the sheet when switching to desktop
  }, [isMobile]);

  const fetchData = async () => {
    setLoading(true);
    const [clubsRes, membersRes, eventsRes, notesRes, inqRes, bizRes, alumniRes, articlesRes, pagesRes, appsRes, mentRes, donRes, schRes, commentsRes, rsvpsRes, mwosaRes] = await Promise.all([
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
      supabase.from("mwosa_links").select("*").order("sort_order", { ascending: true }),
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
    setMwosaLinks(mwosaRes.data || []);
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

  const boot = async () => {
    const s = await adminSession();
    setSession({ authed: s.authed, user: s.user, roles: s.roles });
    if (s.authed) fetchData();
  };

  useEffect(() => { boot(); }, []);

  // /admin/accept-invite is a child route of /admin. When it is active,
  // render ONLY the accept page — the dashboard is for /admin itself.
  // This check stays after every hook so SPA navigation keeps hook order.
  const isAcceptInvite = useMatch({ from: "/admin/accept-invite", shouldThrow: false });
  if (isAcceptInvite) return <Outlet />;

  const roleVisible: Record<string, Tab[]> = {
    super_admin: ["overview", "clubs", "alumni", "events", "rsvps", "notes", "inquiries", "businesses", "articles", "pages", "applications", "mentorship", "donations", "giving", "mwosa", "scholarships", "comments", "settings", "staff"],
    admin: ["overview", "clubs", "alumni", "events", "rsvps", "notes", "inquiries", "businesses", "articles", "pages", "applications", "mentorship", "giving", "mwosa", "scholarships", "comments"],
    club_patron: ["overview", "clubs", "applications", "events"],
    alumni_patron: ["overview", "alumni", "businesses", "notes", "comments", "events", "rsvps", "inquiries"],
  };
  const sessionRoles = session?.roles || [];
  const visibleTabs = new Set<string>();
  sessionRoles.forEach((r) => (roleVisible[r] || []).forEach((k) => visibleTabs.add(k)));
  const roleLabel = sessionRoles
    .map((r) => (r === "super_admin" ? "Super Admin" : r === "club_patron" ? "Club Patron" : r === "alumni_patron" ? "Alumni Patron" : "Admin"))
    .join(", ") || "Staff";

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "clubs", label: "Clubs", icon: Users, count: stats.clubs ?? 0 },
    { key: "alumni", label: "Alumni", icon: GraduationCap, count: stats.alumni ?? 0 },
    { key: "events", label: "Events", icon: Calendar, count: stats.events ?? 0 },
    { key: "rsvps", label: "RSVPs", icon: CalendarCheck, count: rsvps.length },
    { key: "notes", label: "Class Notes", icon: BookOpen, count: stats.notes ?? 0 },
    { key: "articles", label: "Campus News", icon: Megaphone, count: stats.articles ?? 0 },
    { key: "pages", label: "Page Content", icon: FileText, count: pageContent.length },
    { key: "inquiries", label: "Inquiries", icon: MessageSquare, count: stats.inquiries ?? 0 },
    { key: "businesses", label: "Businesses", icon: Building2, count: stats.businesses ?? 0 },
    { key: "applications", label: "Club Apps", icon: Users, count: applications.length },
    { key: "mentorship", label: "Mentorship", icon: Heart, count: mentorship.length },
    { key: "donations", label: "Donations", icon: Heart, count: donations.length },
    { key: "giving", label: "Giving", icon: Heart },
    { key: "mwosa", label: "MWOSA", icon: HandHeart, count: mwosaLinks.length },
    { key: "scholarships", label: "Scholarships", icon: GraduationCap, count: scholarships.length },
    { key: "comments", label: "Comments", icon: MessageSquare, count: noteComments.length },
    { key: "settings", label: "Site Settings", icon: Settings },
    { key: "staff", label: "Staff & Roles", icon: ShieldCheck },
  ];

  // Mobile layout: 4 primary tabs pinned in the bottom bar; everything else
  // lives behind the "More" sheet.
  const primaryKeys = ["overview", "clubs", "articles", "alumni"];
  const primaryTabs = tabs.filter((t) => primaryKeys.includes(t.key) && visibleTabs.has(t.key));
  const moreTabs = tabs.filter((t) => visibleTabs.has(t.key) && !primaryKeys.includes(t.key));

  if (session === null) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
      </div>
    );
  }
  if (!session.authed) {
    return <StaffLoginScreen onAuthed={boot} />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header (desktop) */}
      {!isMobile && (
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800 uppercase tracking-widest mb-1">Admin Dashboard</p>
              <h1 className="font-display text-3xl font-bold text-stone-900">M.M College Wairaka</h1>
              <p className="text-sm text-stone-500 mt-1">Manage all content, members, and inquiries from one place.</p>
              <p className="text-xs text-stone-400 mt-0.5">Signed in as <span className="font-medium text-stone-600">{session.user?.email || ""}</span> · {roleLabel}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => { await supabase.auth.signOut(); await adminLogout({ data: {} }); setSession({ authed: false, user: null, roles: [] }); }}
                className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors inline-flex items-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
              <Link to="/" className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors">
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Header (mobile) */}
      {isMobile && (
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={LOGO_URL} alt="WACOS logo" className="h-9 w-auto shrink-0 drop-shadow" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-green-800 uppercase tracking-widest">Admin Dashboard</p>
              <h1 className="font-display text-base font-bold text-stone-900 truncate">M.M College Wairaka</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              aria-label="Back to site"
              className="p-2 rounded-lg bg-stone-100 text-stone-600 active:bg-stone-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); await adminLogout({ data: {} }); setSession({ authed: false, user: null, roles: [] }); }}
              aria-label="Sign out"
              className="p-2 rounded-lg bg-stone-100 text-stone-600 active:bg-stone-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="px-4 pb-2 text-[11px] text-stone-500 truncate">
          Signed in as <span className="font-medium text-stone-600">{session.user?.email || ""}</span> · {roleLabel}
        </p>
      </div>
      )}

      {/* Tabs (desktop) */}
      {!isMobile && (
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.filter((t) => visibleTabs.has(t.key)).map((t) => {
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
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-32 md:py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
          </div>
        ) : (
          <>
            {tab === "overview" && <OverviewView stats={stats} roles={sessionRoles} onNavigate={(k) => setTab(k)} />}
            {tab === "clubs" && <ClubsTab clubs={clubs} members={members} onRefresh={fetchData} reviewerName={session.user?.name || session.user?.email || "Admin"} setToast={setToast} />}
            {tab === "alumni" && (
              <AlumniTab alumni={alumni} onRefresh={fetchData} setToast={setToast} />
            )}            { tab === "events" && <EventsTab events={events} onRefresh={fetchData} setToast={setToast} /> }
            { tab === "rsvps" && <RsvpsTab rsvps={rsvps} events={events} onRefresh={fetchData} setToast={setToast} /> }
            {tab === "notes" && <NotesTab notes={notes} onRefresh={fetchData} setToast={setToast} />}
            {tab === "inquiries" && <InquiriesTab inquiries={inquiries} onRefresh={fetchData} />}
            {tab === "articles" && <ArticlesTab articles={articles} onRefresh={fetchData} setToast={setToast} />}
            {tab === "businesses" && <BusinessesTab businesses={businesses} onRefresh={fetchData} setToast={setToast} />}
            {tab === "pages" && <PagesTab pages={pageContent} onRefresh={fetchData} setToast={setToast} />}
            {tab === "applications" && <SubmissionsList title="Club Applications" icon={Users} data={applications} columns={[{ key: "club_name", label: "Club" }, { key: "student_name", label: "Student" }, { key: "class_level", label: "Class" }, { key: "reason", label: "Reason" }]} table="club_applications" onRefresh={fetchData} setToast={setToast} />}
            {tab === "mentorship" && <SubmissionsList title="Mentorship Requests" icon={Heart} data={mentorship} columns={[{ key: "mentor_name", label: "Name" }, { key: "mentor_email", label: "Email" }, { key: "club_interest", label: "Club" }, { key: "graduation_year", label: "Class Of" }, { key: "expertise", label: "Expertise" }]} table="mentorship_requests" onRefresh={fetchData} setToast={setToast} />}
            {tab === "donations" && <DonationsTab data={donations} onRefresh={fetchData} setToast={setToast} />}
            {tab === "scholarships" && <SubmissionsList title="Sports Scholarships" icon={GraduationCap} data={scholarships} columns={[{ key: "student_name", label: "Student" }, { key: "parent_name", label: "Parent" }, { key: "phone", label: "Phone" }, { key: "sport", label: "Sport" }, { key: "achievement", label: "Achievement" }]} table="sports_scholarships" onRefresh={fetchData} setToast={setToast} />}
            {tab === "comments" && <CommentsTab comments={noteComments} onRefresh={fetchData} setToast={setToast} />}
            {tab === "giving" && <GivingTab setToast={setToast} />}
            {tab === "mwosa" && <MwosaTab setToast={setToast} />}
            {tab === "settings" && <SettingsTab />}
            {tab === "staff" && <StaffTab />}
          </>
        )}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {primaryTabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${active ? "text-green-800" : "text-stone-400 active:text-stone-600"}`}
              >
                <span className="relative">
                  <Icon className={`h-5 w-5 ${active ? "text-green-800" : "text-stone-400"}`} />
                  {t.count !== undefined && t.count > 0 && (
                    <span className={`absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold leading-4 text-center ${active ? "bg-green-800 text-white" : "bg-stone-300 text-white"}`}>
                      {t.count > 99 ? "99+" : t.count}
                    </span>
                  )}
                </span>
                {t.label}
              </button>
            );
          })}
          {moreTabs.length > 0 && (
            <button
              onClick={() => setMoreOpen(true)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${moreTabs.some((t) => t.key === tab) ? "text-green-800" : "text-stone-400 active:text-stone-600"}`}
            >
              <MoreHorizontal className={`h-5 w-5 ${moreTabs.some((t) => t.key === tab) ? "text-green-800" : "text-stone-400"}`} />
              More
            </button>
          )}
        </div>
      </nav>
      )}

      {/* Mobile More sheet */}
      {isMobile && moreOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl max-h-[78vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-stone-100">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-semibold text-stone-800">All sections</p>
                <button
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close menu"
                  className="p-2 -m-2 rounded-lg text-stone-500 active:bg-stone-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {moreTabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setMoreOpen(false); }}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-[13px] font-medium transition-colors ${active ? "border-green-800/30 bg-green-50 text-green-900" : "border-stone-200 bg-white text-stone-700 active:bg-stone-50"}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-green-800" : "text-stone-400"}`} />
                    <span className="min-w-0 flex-1 truncate">{t.label}</span>
                    {t.count !== undefined && t.count > 0 && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-stone-100 text-[10px] font-semibold text-stone-500">{t.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
