import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { clearStaffSession, readStaffSession } from "@/lib/staff-session";

/**
 * Staff → Pulse bridge.
 *
 * Staff sign in at /admin, which issues an httpOnly `wacos_admin_session`
 * cookie — NOT a Supabase client session. So when a staff member opens the
 * Pulse (`/alumni`) the gate sees no alumnus and would normally force them
 * through "sign up again". This bridge closes that gap: a valid staff cookie
 * proves who they are, so we resolve (or auto-create) their alumni profile
 * and let the Pulse unlock directly. Staff keep the profile fields like
 * everyone else and can edit them in the Pulse.
 *
 * Profile resolution order:
 *   1. alumni_profiles linked by user_id
 *   2. alumni_profiles matched by email (link it to this auth user)
 *   3. none found → create a minimal staff-linked profile, hidden from the
 *      public directory (`is_public = false`) until the member opts in, with
 *      `graduation_year = 0` standing for "not set yet" (completed via Edit
 *      profile). Only the service role can do this, so it cannot be abused.
 */

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

function prettyEmailName(email: string): string {
  const local = email.split("@")[0] || email;
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Resolve or auto-create the caller's alumni profile using the staff cookie. */
export const staffPulseAccess = createServerFn({ method: "POST" })
  .handler(async () => {
    const session = readStaffSession();
    if (!session) return { ok: false as const, reason: "Not signed in as staff." };

    const supabase = getServiceClient();

    // 1) Must still be an active staff member (role rows exist).
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.uid);
    if (!roles || roles.length === 0) {
      return { ok: false as const, reason: "No staff role on this account." };
    }

    // 2) The invite record carries the display name.
    const { data: invite } = await supabase
      .from("staff_invites")
      .select("name")
      .ilike("email", session.email)
      .maybeSingle();

    // 3) Resolve an existing alumni identity: linked by user_id first, then email.
    let profile: any = null;
    const { data: byUid } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("user_id", session.uid)
      .maybeSingle();
    profile = byUid ?? null;
    if (!profile) {
      const { data: byEmail } = await supabase
        .from("alumni_profiles")
        .select("*")
        .ilike("email", session.email)
        .maybeSingle();
      if (byEmail) {
        profile = byEmail;
        // Persist the link so future lookups resolve straight by user_id.
        await supabase
          .from("alumni_profiles")
          .update({ user_id: session.uid })
          .eq("id", byEmail.id);
      }
    }

    // 4) No profile at all — auto-create one from the staff invite.
    if (!profile) {
      const rawName =
        typeof invite?.name === "string" && invite.name.trim()
          ? invite.name.trim()
          : "";
      const fullName = rawName || prettyEmailName(session.email);
      const { data: created, error } = await supabase
        .from("alumni_profiles")
        .insert({
          user_id: session.uid,
          full_name: fullName,
          email: session.email,
          graduation_year: 0, // unset — the member completes it in Edit profile
          programme: "O-Level",
          is_public: false, // hidden from the public directory until they opt in
          approved: true, // access granted via the staff identity, not a review
        })
        .select("*")
        .single();
      if (error || !created) {
        return {
          ok: false as const,
          reason: error?.message || "Could not create your alumni profile.",
        };
      }
      profile = created;
    }

    return { ok: true as const, profile };
  });

/**
 * Sign-out for staff-bridged Pulse access. A bridged member has no Supabase
 * session to drop — their Pulse access rides on the staff portal cookie, so
 * leaving the Pulse clears that cookie too.
 */
export const staffPulseSignOut = createServerFn({ method: "POST" })
  .handler(async () => {
    clearStaffSession();
    return { ok: true as const };
  });
