import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { readStaffSession } from "@/lib/staff-session";

/**
 * Email notifications for the club co-editor workflow.
 *
 * notifyClubPatron: tells patron(s) a co-editor submitted a post for approval.
 *   Caller proves they are the author (Supabase access token verified
 *   server-side), so it cannot be abused to spam patrons.
 *
 * notifyClubEditor: tells the co-editor their post was approved or rejected,
 *   including the patron's review note. Gated on the httpOnly staff session
 *   cookie, so only signed-in staff can trigger it.
 */

const SITE_URL = (process.env.SITE_URL || "https://wacos.alerotek.co.ke").replace(/\/$/, "");
const FROM = "WACOS Club News <wacos@alerotek.co.ke>";

function envVal(value: string | undefined): string {
  return (value || "").replace(/^\uFEFF/, "").trim();
}

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co",
    envVal(process.env.SUPABASE_SERVICE_ROLE_KEY) || "no-key",
    { auth: { persistSession: false } },
  );
}

async function sendResendEmail(to: string[], subject: string, html: string): Promise<void> {
  const apiKey = envVal(process.env.RESEND_API_KEY);
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend replied ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

export const notifyClubPatron = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { postId?: unknown; accessToken?: unknown })
  .handler(async ({ data }) => {
  const { postId, accessToken } = data;
  if (typeof postId !== "string" || typeof accessToken !== "string") {
    return { ok: false as const, reason: "Missing post id or session." };
  }

  const supabase = getServiceClient();
  const { data: authData } = await supabase.auth.getUser(accessToken);
  const user = authData?.user;
  if (!user?.id) return { ok: false as const, reason: "Session could not be verified." };

  const { data: post } = await supabase
    .from("club_posts")
    .select("id, club_id, title, excerpt, status, author_user_id, editor_name")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.status !== "pending" || post.author_user_id !== user.id) {
    return { ok: false as const, reason: "No pending post by this author found." };
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("name")
    .eq("id", post.club_id)
    .maybeSingle();

  // Recipients: active club patrons for this club; fall back to super admins
  // (including pending invites, since the owner invite activates only after
  // the first sign-in) so the school never misses a submission.
  const { data: patrons } = await supabase
    .from("staff_invites")
    .select("email")
    .eq("club_id", post.club_id)
    .eq("role", "club_patron")
    .eq("status", "active");
  let recipients = (patrons || []).map((p) => p.email);

  if (recipients.length === 0) {
    const { data: supers } = await supabase
      .from("staff_invites")
      .select("email")
      .eq("role", "super_admin")
      .in("status", ["active", "pending"]);
    recipients = (supers || []).map((s) => s.email);
  }
  recipients = [...new Set(recipients)].filter((e): e is string => typeof e === "string" && !!e);
  if (recipients.length === 0) {
    return { ok: false as const, reason: "No active patron or super admin to notify." };
  }

  const clubName = club?.name || "your club";
  const title = post.title || "Untitled post";
  const excerpt = post.excerpt || "";
  const author = post.editor_name || "A co-editor";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
      <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #166534; margin-bottom: 4px;">
        M.M College Wairaka · ${clubName}
      </p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">A new post is awaiting your approval</h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${author}</strong> submitted <strong>“${title}”</strong> to the ${clubName} page.
      </p>
      ${excerpt ? `<p style="font-size: 14px; line-height: 1.6; color: #57534e; margin: 0 0 16px;">${excerpt}</p>` : ""}
      <p style="margin: 0;">
        <a href="${SITE_URL}/admin"
           style="display: inline-block; background: #166534; color: #ffffff; text-decoration: none;
                  padding: 12px 22px; border-radius: 12px; font-size: 14px; font-weight: 600;">
          Review in the dashboard
        </a>
      </p>
      <p style="font-size: 12px; color: #a8a29e; margin-top: 24px;">
        You are receiving this because you are listed as the patron of the ${clubName}.
      </p>
    </div>
  `;

  try {
    await sendResendEmail(recipients, `New post awaiting approval: ${title}`, html);
  } catch (e: any) {
    console.error("notifyClubPatron:", e?.message || e);
    return { ok: false as const, reason: "Email could not be sent." };
  }

  return { ok: true as const, notified: recipients.length };
});

/**
 * Notifies the co-editor when their post is approved or rejected, including
 * the patron's review note. Only a signed-in staff member (httpOnly session
 * cookie) may call this — the decision was already recorded by the caller.
 */
export const notifyClubEditor = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { postId?: unknown; verdict?: unknown; reviewNote?: unknown })
  .handler(async ({ data }) => {
  const { postId, verdict, reviewNote } = data;

  const session = readStaffSession();
  if (!session) {
    return { ok: false as const, reason: "Staff session required." };
  }
  if (typeof postId !== "string" || !postId) {
    return { ok: false as const, reason: "Missing post id." };
  }
  if (verdict !== "approved" && verdict !== "rejected") {
    return { ok: false as const, reason: "Verdict must be approved or rejected." };
  }

  const supabase = getServiceClient();
  const { data: post } = await supabase
    .from("club_posts")
    .select("id, club_id, title, status, author_user_id, editor_name")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { ok: false as const, reason: "Post not found." };

  // Only notify after the decision is actually recorded in the DB.
  const expectedStatus = verdict === "approved" ? "published" : "rejected";
  if (post.status !== expectedStatus) {
    return { ok: false as const, reason: "Post has not been decided yet." };
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("name")
    .eq("id", post.club_id)
    .maybeSingle();

  // Resolve the editor's email: by linked auth user first, then by name.
  let email: string | null = null;
  if (post.author_user_id) {
    const { data: ed } = await supabase
      .from("club_editors")
      .select("email")
      .eq("club_id", post.club_id)
      .eq("user_id", post.author_user_id)
      .maybeSingle();
    if (ed?.email) email = ed.email;
  }
  if (!email && post.editor_name) {
    const { data: eds } = await supabase
      .from("club_editors")
      .select("email")
      .eq("club_id", post.club_id)
      .ilike("name", post.editor_name)
      .limit(1);
    if (eds?.[0]?.email) email = eds[0].email;
  }
  if (!email) {
    return { ok: false as const, reason: "No editor email on file for this post." };
  }

  const approved = verdict === "approved";
  const note = typeof reviewNote === "string" && reviewNote.trim() ? reviewNote.trim() : null;
  const clubName = club?.name || "your club";
  const title = post.title || "Untitled post";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
      <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #166534; margin-bottom: 4px;">
        M.M College Wairaka · ${clubName}
      </p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">
        ${approved ? "Your post is live! 🎉" : "Your post needs changes"}
      </h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
        ${approved
          ? `<strong>“${title}”</strong> was approved and is now live on the ${clubName} page. Thank you for sharing!`
          : `<strong>“${title}”</strong> was not approved for the ${clubName} page.`}
      </p>
      ${!approved && note
        ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 16px; margin: 0 0 16px;">
             <p style="font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #b91c1c; margin: 0 0 6px;">Patron's note</p>
             <p style="font-size: 14px; line-height: 1.6; color: #7f1d1d; margin: 0;">${note}</p>
           </div>`
        : ""}
      ${!approved && !note ? `<p style="font-size: 14px; color: #57534e; margin: 0 0 16px;">Reach out to your patron for what to adjust — you can edit and resubmit your post.</p>` : ""}
      <p style="margin: 0;">
        <a href="${SITE_URL}/clubs/editor"
           style="display: inline-block; background: ${approved ? "#166534" : "#b91c1c"}; color: #ffffff; text-decoration: none;
                  padding: 12px 22px; border-radius: 12px; font-size: 14px; font-weight: 600;">
          ${approved ? "View your club" : "Edit and resubmit"}
        </a>
      </p>
      <p style="font-size: 12px; color: #a8a29e; margin-top: 24px;">
        You are receiving this because you are a co-editor for the ${clubName}.
      </p>
    </div>
  `;

  try {
    await sendResendEmail(
      [email],
      approved ? `Your post is live: ${title}` : `Your post needs changes: ${title}`,
      html,
    );
  } catch (e: any) {
    console.error("notifyClubEditor:", e?.message || e);
    return { ok: false as const, reason: "Email could not be sent." };
  }

  return { ok: true as const, notified: 1 };
});