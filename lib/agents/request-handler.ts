import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';
import { coordinateAgents } from '@/lib/agents/coordinator';

export async function handleCoordinatorRequest(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const keyword = typeof body.keyword === 'string' ? body.keyword.trim() : '';
    const assetId = typeof body.assetId === 'string' && body.assetId ? body.assetId : null;

    if (keyword.length < 2 || keyword.length > 300) {
      return NextResponse.json({ error: 'Keyword must contain 2-300 characters.' }, { status: 400 });
    }

    const { supabase } = createSupabaseServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const [{ data: profile }, { data: previous }] = await Promise.all([
      supabase.from('profiles').select('tier').eq('id', user.id).maybeSingle(),
      supabase
        .from('content_history')
        .select('quality_audit')
        .eq('user_id', user.id)
        .not('quality_audit', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (assetId) {
      const { data: asset } = await supabase
        .from('assets')
        .select('id')
        .eq('id', assetId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!asset) return NextResponse.json({ error: 'Selected asset was not found.' }, { status: 404 });
    }

    const audit = previous?.quality_audit as { next_run_guidelines?: unknown } | null;
    const rawGuidelines = audit?.next_run_guidelines;
    const priorGuidelines = Array.isArray(rawGuidelines)
      ? rawGuidelines.filter((item): item is string => typeof item === 'string').slice(0, 8)
      : [];
    const tier = profile?.tier === 'premium' ? 'premium' : 'free';
    const generated = await coordinateAgents(keyword, priorGuidelines);

    const { data: saved, error: saveError } = await supabase
      .from('content_history')
      .insert({
        keyword,
        blog_title: generated.blog_title,
        blog_content: generated.blog_content,
        meta_description: generated.meta_description,
        keywords_list: generated.keywords_list,
        schema_json: generated.schema_json,
        social_linkedin: generated.social_linkedin,
        social_x: generated.social_x,
        social_instagram: generated.social_instagram,
        social_posts: generated.social_posts,
        media_urls: generated.media_urls,
        visual_prompts: generated.visual_prompts,
        agent_trace: generated.agent_trace,
        quality_audit: generated.quality_audit,
        asset_id: assetId,
        tier,
        user_id: user.id,
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Failed to persist coordinated package:', saveError);
      return NextResponse.json({ error: 'Content was generated but could not be saved.' }, { status: 500 });
    }

    return NextResponse.json({ ...generated, package_id: saved.id, tier });
  } catch (error) {
    console.error('Agent coordinator failed:', error);
    const message = error instanceof Error ? error.message : 'Agent coordination failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
