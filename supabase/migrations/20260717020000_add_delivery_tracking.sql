ALTER TABLE public.content_history
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_delivery_error text;

COMMENT ON COLUMN public.content_history.last_delivery_error IS
  'Most recent webhook dispatch failure, cleared when a queued package is claimed or published.';
