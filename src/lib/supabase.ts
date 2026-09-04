import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cykaheepeqcgmveckuru.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_BXQkhnpm3ha7O7ZjGrZlqg_Es95WeON";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
