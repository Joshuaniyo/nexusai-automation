import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';
import { generatePollinationsImage, type ImageAspectRatio, type SocialPlatform } from '@/lib/media/pollinations';

const PLATFORMS = new Set<SocialPlatform>(['blog', 'x', 'linkedin', 'instagram']);
const ASPECT_RATIOS = new Set<ImageAspectRatio>(['16:9', '1:1', '9:16']);

export async function POST(req: NextRequest) {
  try {
    const { supabase } = createSupabaseServerClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const platform = PLATFORMS.has(body.platform) ? body.platform as SocialPlatform : 'instagram';
    const packageId = typeof body.packageId === 'string' ? body.packageId : null;
    const aspectRatio = ASPECT_RATIOS.has(body.aspectRatio) ? body.aspectRatio as ImageAspectRatio : undefined;

    if (prompt.length < 10 || prompt.length > 1800) {
      return NextResponse.json({ error: 'Image prompt must contain 10-1800 characters.' }, { status: 400 });
    }

    const url = await generatePollinationsImage(prompt, platform, aspectRatio);

    if (packageId) {
      const { data: existing } = await supabase
        .from('content_history')
        .select('media_urls, visual_prompts')
        .eq('id', packageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) return NextResponse.json({ error: 'Post package not found.' }, { status: 404 });
      const mediaUrls = { ...(existing.media_urls ?? {}), [platform]: url };
      const visualPrompts = { ...(existing.visual_prompts ?? {}), [platform]: prompt };
      const { error } = await supabase
        .from('content_history')
        .update({ media_urls: mediaUrls, visual_prompts: visualPrompts })
        .eq('id', packageId)
        .eq('user_id', user.id);
      if (error) return NextResponse.json({ error: 'Failed to save regenerated image.' }, { status: 500 });
    }

    return NextResponse.json({ url, prompt, platform, aspectRatio });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
