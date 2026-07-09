-- Create profiles table for user tier management
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  tier text NOT NULL DEFAULT 'free',
  premium_since timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "service_role_full_access" ON profiles;
CREATE POLICY "service_role_full_access" ON profiles FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update existing tables to support user ownership
ALTER TABLE assets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE content_history ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_content_history_user_id ON content_history(user_id);

-- Update RLS policies for assets
DROP POLICY IF EXISTS "anon_select_assets" ON assets;
DROP POLICY IF EXISTS "anon_insert_assets" ON assets;
DROP POLICY IF EXISTS "anon_update_assets" ON assets;
DROP POLICY IF EXISTS "anon_delete_assets" ON assets;

CREATE POLICY "select_own_assets" ON assets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_assets" ON assets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_assets" ON assets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_assets" ON assets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Update RLS policies for content_history
DROP POLICY IF EXISTS "anon_select_content_history" ON content_history;
DROP POLICY IF EXISTS "anon_insert_content_history" ON content_history;
DROP POLICY IF EXISTS "anon_update_content_history" ON content_history;
DROP POLICY IF EXISTS "anon_delete_content_history" ON content_history;

CREATE POLICY "select_own_history" ON content_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_history" ON content_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_history" ON content_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_history" ON content_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();