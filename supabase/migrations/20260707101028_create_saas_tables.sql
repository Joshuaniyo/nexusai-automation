/*
# Create Multi-Tenant AI SaaS Tables

## Summary
This migration creates the foundational tables for the AI Automation SaaS Dashboard.
It is designed as a single-tenant, no-auth app (using anon-key client), so all
policies use TO anon, authenticated with USING (true).

## New Tables

### 1. `assets`
Stores client website configurations managed through the Asset Manager.
- `id` (uuid, primary key)
- `domain_name` (text, not null) — the client's domain, e.g. "example.com"
- `cms_type` (text, not null) — e.g. "WordPress", "Webflow", "Shopify"
- `webhook_url` (text) — target webhook endpoint for content delivery
- `status` (text, default 'active') — active | paused
- `created_at` (timestamptz)

### 2. `content_history`
Stores every AI generation run with full output.
- `id` (uuid, primary key)
- `keyword` (text, not null) — the input keyword/topic
- `blog_title` (text)
- `blog_content` (text)
- `meta_description` (text)
- `keywords_list` (text[]) — extracted keywords array
- `schema_json` (jsonb) — the JSON-LD schema object
- `social_linkedin` (text)
- `social_x` (text)
- `asset_id` (uuid, nullable FK to assets) — which client site this was generated for
- `tier` (text, default 'free') — free | premium
- `created_at` (timestamptz)

## Security
- RLS enabled on both tables.
- Anon + authenticated users can perform full CRUD (single-tenant, no login).
*/

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_name text NOT NULL,
  cms_type text NOT NULL,
  webhook_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assets" ON assets;
CREATE POLICY "anon_select_assets" ON assets FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assets" ON assets;
CREATE POLICY "anon_insert_assets" ON assets FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assets" ON assets;
CREATE POLICY "anon_update_assets" ON assets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assets" ON assets;
CREATE POLICY "anon_delete_assets" ON assets FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS content_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  blog_title text,
  blog_content text,
  meta_description text,
  keywords_list text[],
  schema_json jsonb,
  social_linkedin text,
  social_x text,
  asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  tier text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_content_history" ON content_history;
CREATE POLICY "anon_select_content_history" ON content_history FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_content_history" ON content_history;
CREATE POLICY "anon_insert_content_history" ON content_history FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_content_history" ON content_history;
CREATE POLICY "anon_update_content_history" ON content_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_content_history" ON content_history;
CREATE POLICY "anon_delete_content_history" ON content_history FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_content_history_created_at ON content_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_history_asset_id ON content_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
