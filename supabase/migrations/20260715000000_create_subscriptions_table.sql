-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT null,
  status text NOT null, -- active, trialing, past_due, paused, unactive
  variant_id text NOT null, -- Lemon Squeezy Variant ID
  customer_id text,
  card_brand text,
  card_last_four text,
  trial_ends_at timestamp with time zone,
  renews_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT null
);

-- Enable Row-Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
DROP POLICY IF EXISTS "select_own_subscriptions" ON public.subscriptions;
CREATE POLICY "select_own_subscriptions" ON public.subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "service_role_full_access" ON public.subscriptions;
CREATE POLICY "service_role_full_access" ON public.subscriptions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
