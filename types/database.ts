export interface Asset {
  id: string;
  domain_name: string;
  cms_type: string;
  webhook_url: string | null;
  status: 'active' | 'paused';
  user_id: string | null;
  created_at: string;
}

export interface ContentHistory {
  id: string;
  keyword: string;
  blog_title: string | null;
  blog_content: string | null;
  meta_description: string | null;
  keywords_list: string[] | null;
  schema_json: Record<string, unknown> | null;
  social_linkedin: string | null;
  social_x: string | null;
  asset_id: string | null;
  user_id: string | null;
  tier: 'free' | 'premium';
  created_at: string;
}

export interface GenerationResult {
  blog_title: string;
  blog_content: string;
  meta_description: string;
  keywords_list: string[];
  schema_json: Record<string, unknown>;
  social_linkedin: string;
  social_x: string;
}

export type UserTier = 'free' | 'premium';
