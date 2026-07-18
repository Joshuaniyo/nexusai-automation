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
  delivery_type: 'webhook' | 'direct_social';
  target_social_platforms: Array<'linkedin' | 'telegram'>;
  created_at: string;
}

export interface SocialConnection {
  id: string;
  platform: 'linkedin' | 'telegram';
  platform_account_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GenerationResult {
  package_id: string;
  blog_title: string;
  blog_content: string;
  meta_description: string;
  keywords_list: string[];
  schema_json: Record<string, unknown>;
  social_linkedin: string;
  social_x: string;
  social_instagram: string;
  social_posts: {
    x: { text: string; thread: string[]; image_prompt: string; image_url: string };
    linkedin: { text: string; image_prompt: string; image_url: string };
    instagram: { caption: string; alt_text: string; image_prompt: string; image_url: string };
  };
  media_urls: { blog: string; x: string; linkedin: string; instagram: string };
  visual_prompts: { blog: string; x: string; linkedin: string; instagram: string };
  quality_audit: Record<string, unknown>;
  agent_trace: Array<{ id: string; name: string; keySlot: string; durationMs: number; status: string }>;
}

export type UserTier = 'free' | 'premium';
