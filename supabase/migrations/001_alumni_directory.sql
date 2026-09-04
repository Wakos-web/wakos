-- Alumni Directory Tables
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS alumni_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  graduation_year INT NOT NULL,
  programme TEXT NOT NULL DEFAULT 'O-Level',
  current_location TEXT,
  profession TEXT,
  company TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alumni_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  website TEXT,
  phone TEXT,
  location TEXT,
  logo_url TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alumni_profiles_user_id ON alumni_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_year ON alumni_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_profiles_approved ON alumni_profiles(approved);
CREATE INDEX IF NOT EXISTS idx_alumni_businesses_owner ON alumni_businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_alumni_businesses_approved ON alumni_businesses(approved);
CREATE INDEX IF NOT EXISTS idx_alumni_businesses_category ON alumni_businesses(category);

ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved public profiles" ON alumni_profiles FOR SELECT USING (approved = true AND is_public = true);
CREATE POLICY "Public read approved businesses" ON alumni_businesses FOR SELECT USING (approved = true);
CREATE POLICY "Auth read approved profiles" ON alumni_profiles FOR SELECT TO authenticated USING (approved = true);
CREATE POLICY "Users insert own profile" ON alumni_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON alumni_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own businesses" ON alumni_businesses FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM alumni_profiles WHERE id = owner_id AND user_id = auth.uid()));
CREATE POLICY "Users update own businesses" ON alumni_businesses FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM alumni_profiles WHERE id = owner_id AND user_id = auth.uid()));
CREATE POLICY "Users delete own businesses" ON alumni_businesses FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM alumni_profiles WHERE id = owner_id AND user_id = auth.uid()));
