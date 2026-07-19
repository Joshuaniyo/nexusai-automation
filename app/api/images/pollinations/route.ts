import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';
import { isAllowedPollinationsUrl } from '@/lib/media/pollinations-url';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const source = req.nextUrl.searchParams.get('url')?.trim() ?? '';
  if (!source || source.length > 5000 || !isAllowedPollinationsUrl(source)) {
    return NextResponse.json({ error: 'Invalid Pollinations image URL.' }, { status: 400 });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: 'Image service is not configured.' }, { status: 500 });

  try {
    const upstreamUrl = new URL(source);
    upstreamUrl.searchParams.set('key', apiKey);
    const upstream = await fetch(upstreamUrl, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*' },
      cache: 'no-store',
      signal: AbortSignal.timeout(55_000),
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: `Image provider returned ${upstream.status}.` }, { status: 502 });
    }
    const contentType = upstream.headers.get('content-type')?.split(';')[0] ?? '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Image provider returned an invalid content type.' }, { status: 502 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=86400, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Pollinations image proxy failed:', error);
    return NextResponse.json({ error: 'Unable to load generated image.' }, { status: 502 });
  }
}
