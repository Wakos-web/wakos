import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { readStaffSession } from "@/lib/staff-session";

/**
 * Email notifications for alumni submissions (registrations, business
 * directory, Pulse class notes).
 *
 * notifyAlumniApprover: tells the alumni patrons / super admins that a new
 * submission arrived so it can be reviewed (registrations and businesses land
 * `approved: false` and need approval; Pulse class notes go live immediately
 * and are moderated by unpublishing). The caller must prove they own the
 * submission (their Supabase access token is verified server-side), so this
 * cannot be abused to spam the approvers.
 */

const SITE_URL = "https://wacos-site-main.vercel.app";
const FROM = "WACOS Alumni <wacos@alerotek.co.ke>";

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

/** Approvers: active alumni patrons first, then any super admin (pending
 *  invites included, since the owner invite activates on first sign-in). */
async function approverRecipients(): Promise<string[]> {
  const supabase = getServiceClient();
  const { data: patrons } = await supabase
    .from("staff_invites")
    .select("email")
    .eq("role", "alumni_patron")
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
  return [...new Set(recipients)].filter((e): e is string => typeof e === "string" && !!e);
}

/**
 * kind: "registration" | "business" | "class_note"
 * The caller proves ownership of the submission:
 *   registration -> alumni_profiles.user_id == caller auth user
 *   business     -> alumni_businesses.owner_id -> profile.user_id == caller
 *   class_note   -> class_notes.author_name == caller's profile full_name
 */
export const notifyAlumniApprover = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { kind?: unknown; submissionId?: unknown; accessToken?: unknown })
  .handler(async ({ data }) => {
  const { kind, submissionId, accessToken } = data;
  if (
    typeof kind !== "string" ||
    !["registration", "business", "class_note"].includes(kind) ||
    typeof submissionId !== "string" ||
    typeof accessToken !== "string"
  ) {
    return { ok: false as const, reason: "Missing submission id, kind or session." };
  }

  const supabase = getServiceClient();
  const { data: authData } = await supabase.auth.getUser(accessToken);
  const user = authData?.user;
  if (!user?.id) return { ok: false as const, reason: "Session could not be verified." };

  // Ownership + details per kind.
  let title = "";
  let subtitle = "";
  let excerpt = "";
  let ok = false;

  if (kind === "registration") {
    const { data: row } = await supabase
      .from("alumni_profiles")
      .select("id, user_id, full_name, graduation_year, profession, company, current_location")
      .eq("id", submissionId)
      .maybeSingle();
    if (row && row.user_id === user.id) {
      ok = true;
      title = "New alumni registration";
      subtitle = row.full_name || "New alumnus";
      excerpt = [
        `Class of ${row.graduation_year || "?"}`,
        row.profession || "",
        row.company ? `at ${row.company}` : "",
        row.current_location || "",
      ].filter(Boolean).join(" · ");
    }
  } else if (kind === "business") {
    const { data: row } = await supabase
      .from("alumni_businesses")
      .select("id, owner_id, name, description, category, location")
      .eq("id", submissionId)
      .maybeSingle();
    if (row) {
      const { data: owner } = await supabase
        .from("alumni_profiles")
        .select("user_id")
        .eq("id", row.owner_id)
        .maybeSingle();
      if (owner?.user_id === user.id) {
        ok = true;
        title = "New business directory submission";
        subtitle = row.name || "A business listing";
        excerpt = [row.category || "", row.location || "", row.description || ""].filter(Boolean).join(" · ");
      }
    }
  } else {
    // class_note: match the author name to the caller's own profile.
    const { data: me } = await supabase
      .from("alumni_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const { data: row } = await supabase
      .from("class_notes")
      .select("id, author_name, category, content")
      .eq("id", submissionId)
      .maybeSingle();
    if (row && me?.full_name && row.author_name === me.full_name) {
      ok = true;
      const categoryLabel = (row.category || "update")
        .replace("reunion", "Reunion").replace("memoriam", "In Memoriam")
        .replace("achievement", "Achievement").replace("business", "Business")
        .replace("update", "Update");
      title = "New Pulse post";
      subtitle = `${row.author_name} · ${categoryLabel}`;
      excerpt = (row.content || "").slice(0, 180);
    }
  }

  if (!ok) return { ok: false as const, reason: "Submission not found or not yours." };

  const recipients = await approverRecipients();
  if (recipients.length === 0) {
    return { ok: false as const, reason: "No alumni approver or super admin to notify." };
  }

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
      <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #166534; margin-bottom: 4px;">
        M.M College Wairaka · Alumni
      </p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">${title}</h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 8px;"><strong>${subtitle}</strong></p>
      ${excerpt ? `<p style="font-size: 14px; line-height: 1.6; color: #57534e; margin: 0 0 16px;">${excerpt}</p>` : ""}
      <p style="margin: 0;">
        <a href="${SITE_URL}/admin"
           style="display: inline-block; background: #166534; color: #ffffff; text-decoration: none;
                  padding: 12px 22px; border-radius: 12px; font-size: 14px; font-weight: 600;">
          Review in the dashboard
        </a>
      </p>
      <p style="font-size: 12px; color: #a8a29e; margin-top: 24px;">
        You are receiving this because you help moderate the WACOS alumni community.
      </p>
    </div>
  `;

  try {
    await sendResendEmail(recipients, `${title}: ${subtitle}`, html);
  } catch (e: any) {
    console.error("notifyAlumniApprover:", e?.message || e);
    return { ok: false as const, reason: "Email could not be sent." };
  }

  return { ok: true as const, notified: recipients.length };
});

/**
 * Notifies an applicant when the alumni admin approves or rejects their
 * registration, including the admin's note on a rejection. Gated on the
 * httpOnly staff session cookie — only signed-in staff can trigger it — and
 * the profile's DB state must already match the verdict before anything sends.
 */
export const notifyAlumniApplicant = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d ?? {}) as { profileId?: unknown; verdict?: unknown; note?: unknown })
  .handler(async ({ data }) => {
    const { profileId, verdict, note } = data;

    const session = readStaffSession();
    if (!session) {
      return { ok: false as const, reason: "Staff session required." };
    }
    if (typeof profileId !== "string" || !profileId) {
      return { ok: false as const, reason: "Missing profile id." };
    }
    if (verdict !== "approved" && verdict !== "rejected") {
      return { ok: false as const, reason: "Verdict must be approved or rejected." };
    }

    const supabase = getServiceClient();
    const { data: profile } = await supabase
      .from("alumni_profiles")
      .select("id, full_name, email, approved")
      .eq("id", profileId)
      .maybeSingle();
    if (!profile) return { ok: false as const, reason: "Profile not found." };

    // Only notify after the decision is actually recorded in the DB.
    const expected = verdict === "approved";
    if (profile.approved !== expected) {
      return { ok: false as const, reason: "Profile has not been decided yet." };
    }
    if (!profile.email) {
      return { ok: false as const, reason: "No email on file for this alumnus." };
    }

    const approved = verdict === "approved";
    const cleanNote = typeof note === "string" && note.trim() ? note.trim() : null;
    const firstName = (profile.full_name || "").split(" ")[0] || "there";
    const html = `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1917;">
        <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #166534; margin-bottom: 4px;">
          M.M College Wairaka · Alumni
        </p>
        <h1 style="font-size: 24px; margin: 0 0 12px;">
          ${approved ? "Welcome to the WACOS alumni community! 🎉" : "Your alumni registration was not approved"}
        </h1>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          ${approved
            ? `Hi ${firstName}, your alumni profile has been approved. You can now open the <strong>Pulse</strong>, browse the directory, and catch up with old classmates.`
            : `Hi ${firstName}, your registration could not be approved at this time.`}
        </p>
        ${!approved && cleanNote
          ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 16px; margin: 0 0 16px;">
               <p style="font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #b91c1c; margin: 0 0 6px;">Reason</p>
               <p style="font-size: 14px; line-height: 1.6; color: #7f1d1d; margin: 0;">${cleanNote}</p>
             </div>`
          : ""}
        ${!approved && !cleanNote
          ? `<p style="font-size: 14px; color: #57534e; margin: 0 0 16px;">Reach out to info@mmcollegewairaka.sc.ug if you think this was a mistake.</p>`
          : ""}
        <p style="margin: 0;">
          <a href="${SITE_URL}/alumni"
             style="display: inline-block; background: ${approved ? "#166534" : "#57534e"}; color: #ffffff; text-decoration: none;
                    padding: 12px 22px; border-radius: 12px; font-size: 14px; font-weight: 600;">
            ${approved ? "Open the Pulse" : "Back to the site"}
          </a>
        </p>
        <p style="font-size: 12px; color: #a8a29e; margin-top: 24px;">
          You are receiving this because you registered on the M.M College Wairaka alumni portal.
        </p>
      </div>
    `;

    try {
      await sendResendEmail(
        [profile.email],
        approved ? "Your WACOS alumni profile was approved" : "Your WACOS alumni registration was not approved",
        html,
      );
    } catch (e: any) {
      console.error("notifyAlumniApplicant:", e?.message || e);
      return { ok: false as const, reason: "Email could not be sent." };
    }

    return { ok: true as const, notified: 1 };
  });