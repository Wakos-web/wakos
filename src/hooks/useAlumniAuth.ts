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
  is_public: boolean;
  approved: boolean;
};

export function useAlumniAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data);
    setLoading(false);
  };

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  return { user, profile, loading, signUp, signIn, signOut, refreshProfile: () => user && fetchProfile(user.id) };
}
