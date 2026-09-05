import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_BXQkhnpm3ha7O7ZjGrZlqg_Es95WeON";

// Public client — anonymous role, RLS-protected. Used by every public page.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — proxies every request through the Nitro server route, which
// replays it with the service-role key. The admin passcode never ships in the
// client bundle; it is verified server-side and remembered via an httpOnly
// session cookie. Used only by the admin dashboard pages.
export {
  adminSupabase,
  adminLogin,
  adminLogout,
  adminPasscodeLogin,
  adminSession,
  adminListStaff,
  adminInviteStaff,
  adminAcceptInvite,
  adminResendInviteCode,
  adminRevokeStaff,
  adminSendLoginCode,
  adminVerifyLoginCode,
} from "@/lib/admin-client";
