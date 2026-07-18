CREATE TABLE IF NOT EXISTS public.social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('linkedin', 'telegram')),
  token_encrypted text NOT NULL,
  platform_account_name text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own social connections" ON public.social_connections;
CREATE POLICY "Users can manage their own social connections"
  ON public.social_connections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.content_history
  ADD COLUMN IF NOT EXISTS delivery_type text NOT NULL DEFAULT 'webhook',
  ADD COLUMN IF NOT EXISTS target_social_platforms text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.content_history DROP CONSTRAINT IF EXISTS content_history_delivery_type_check;
ALTER TABLE public.content_history ADD CONSTRAINT content_history_delivery_type_check
  CHECK (delivery_type IN ('webhook', 'direct_social'));

CREATE INDEX IF NOT EXISTS idx_social_connections_user_platform
  ON public.social_connections(user_id, platform);
