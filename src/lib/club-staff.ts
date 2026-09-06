import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { clearStaffSession, readStaffSession } from "@/lib/staff-session";

/**
 * Staff cookie → club editor bridge.
 *
 * Staff sign in at /admin, which issues an httpOnly `wacos_admin_session`
 * cookie — NOT a Supabase client session. The club editor, however, reads and
 * writes through the Supabase client, and the club tables are RLS-gated on
 * `auth.uid()`, so a cookie-only staff member opens /clubs/editor and sees the
 * OTP panel. This bridge closes that gap the same way staffPulseAccess does
 * for the Pulse, but instead of doing service-role reads it **mints a real
 * Supabase session** (magic-link token generated with the service role and
 * exchanged server-side) and hands it to the browser, which sets it with
 * `supabase.auth.setSession()`. The editor then runs with the staff member's
 * own auth.uid() and RLS applies normally — no email is sent, no OTP entered.
 *
 * The bridge only fires for active staff who actually hold a club editorship
 * (an active `club_editors` row for their user id, or a club they patron via
 * `clubs.patron_user_id`). Students invited as co-editors still sign in with
 * their emailed OTP exactly as before.
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

export const staffClubAccess = createServerFn({ method: "POST" })
  .handler(async () => {
    const session = readStaffSession();
    if (!session) {
      return { ok: false as const, reason: "Sign in to the staff portal first." };
    }

    const supabase = getServiceClient();

    // 1) Must still be an active staff member (role rows exist).
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.uid);
    if (!roles || roles.length === 0) {
      return { ok: false as const, reason: "No staff role on this account." };
    }

    // 2) Must actually hold a club editorship: an active club_editors row for
    //    this user, or a club they patron (clubs.patron_user_id).
    const { data: editorships } = await supabase
      .from("club_editors")
      .select("id")
      .eq("user_id", session.uid)
      .eq("status", "active")
      .limit(1);
    const { data: patroned } = await supabase
      .from("clubs")
      .select("id")
      .eq("patron_user_id", session.uid)
      .limit(1);
    if (
      (!editorships || editorships.length === 0) &&
      (!patroned || patroned.length === 0)
    ) {
      return {
        ok: false as const,
        reason: "No club editorship on this account yet.",
      };
    }

    // 3) Mint a fresh Supabase session server-side (no email is sent).
    const { data: link, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: session.email,
    });
    const hashedToken = link?.properties?.hashed_token;
    if (linkErr || !hashedToken) {
      return {
        ok: false as const,
        reason: linkErr?.message || "Could not prepare your editor session.",
      };
    }
    const { data: verified, error: verifyErr } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: hashedToken,
    });
    if (verifyErr || !verified?.session || !verified.user) {
      return {
        ok: false as const,
        reason: verifyErr?.message || "Could not start your editor session.",
      };
    }

    return {
      ok: true as const,
      session: verified.session,
      user: { id: verified.user.id, email: verified.user.email },
    };
  });

/**
 * Real sign-out for staff who entered the editor through the bridge. They have
 * no Supabase session of their own to drop (the bridge mints one), so leaving
 * the studio also clears the staff portal cookie — signing out actually signs
 * out, and the next visit starts from the staff portal again.
 */
export const staffClubSignOut = createServerFn({ method: "POST" })
  .handler(async () => {
    clearStaffSession();
    return { ok: true as const };
  });
