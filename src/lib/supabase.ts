import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_BXQkhnpm3ha7O7ZjGrZlqg_Es95WeON";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin-only client: sends the shared admin secret as x-admin-secret, which RLS
// checks via public.is_admin(). Used ONLY by the admin dashboard pages. The secret
// ships in the client bundle (no-auth phase) so it stops casual visitors, not a
// determined attacker — replace with real auth + service-role routes when login lands.
export const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "BWfR-iJBud9nKFS1SPxaKyMCFSaedU_z";

export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { "x-admin-secret": ADMIN_SECRET } },
});