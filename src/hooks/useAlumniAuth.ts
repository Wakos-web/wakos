import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type AlumniProfile = {
  id: string;
  user_id: string;
  full_name: string;
  graduation_year: number;
  programme: string;
  current_location: string | null;
  profession: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  email: string | null;
  is_public: boolean;
  approved: boolean;
};

/**
 * OTP-based alumni auth. Signing in requires a one-time code emailed via
 * Resend (Supabase Auth custom SMTP). The session persists automatically
 * (Supabase stores the JWT + refresh token), so alumni stay logged in across
 * visits on the same email.
 *
 * Profile resolution:
 *  1. Try an alumni_profiles row linked by user_id.
 *  2. If none, match by email and link that row to this auth user — this is
 *     what "kept logged in if the email is the same" means: the same email
 *     always lands on the same alumni identity.
 *  3. If no profile exists at all, requestOtp/verifyOtp succeed and the
 *     caller shows the registration form; the profile is created with user_id.
 */
export function useAlumniAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (u: User): Promise<AlumniProfile | null> => {
    // 1) Linked by user_id
    let { data } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("user_id", u.id)
      .maybeSingle();

    // 2) Not linked yet — find by email and link this auth user to it.
    if (!data && u.email) {
      const { data: byEmail } = await supabase
        .from("alumni_profiles")
        .select("*")
        .ilike("email", u.email)
        .maybeSingle();
      if (byEmail) {
        data = { ...byEmail, user_id: u.id };
        // Persist the link so next load resolves by user_id directly.
        await supabase.from("alumni_profiles").update({ user_id: u.id }).eq("id", byEmail.id);
      }
    }

    setProfile(data);
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /** Send a one-time code to the email (creates the auth user on first use). */
  const requestOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/alumni`,
      },
    });
    if (error) throw error;
  }, []);

  /** Verify the emailed code and establish the session. */
  const verifyOtp = useCallback(
    async (email: string, token: string) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) throw error;
      if (data.user) await fetchProfile(data.user);
      return data;
    },
    [fetchProfile],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
  }, []);

  /** Re-fetch the current user's profile (returns it, or null if none). */
  const refreshProfile = useCallback(async (): Promise<AlumniProfile | null> => {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return fetchProfile(data.session.user);
  }, [fetchProfile]);

  return { user, profile, loading, requestOtp, verifyOtp, signOut, refreshProfile };
}