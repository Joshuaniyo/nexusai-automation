-- Extend content history into a unified agent-generated post package.
ALTER TABLE public.content_history
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_posts jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS media_urls jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS visual_prompts jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS agent_trace jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quality_audit jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_content_history_user_created
  ON public.content_history(user_id, created_at DESC);

COMMENT ON COLUMN public.content_history.social_posts IS
  'Unified X, LinkedIn, and Instagram copy package with image prompts and URLs.';
COMMENT ON COLUMN public.content_history.quality_audit IS
  'Fact-check and meta-learning feedback reused to guide the next generation run.';
