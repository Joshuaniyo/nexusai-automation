ALTER TABLE public.content_history
  ADD COLUMN IF NOT EXISTS aeo_audit jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS internal_link_suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS deployment_targets jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deployment_status text NOT NULL DEFAULT 'draft';

ALTER TABLE public.content_history DROP CONSTRAINT IF EXISTS content_history_deployment_status_check;
ALTER TABLE public.content_history ADD CONSTRAINT content_history_deployment_status_check
  CHECK (deployment_status IN ('draft', 'queued', 'processing', 'published', 'failed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_content_history_deployment_queue
  ON public.content_history(scheduled_for)
  WHERE deployment_status = 'queued';
