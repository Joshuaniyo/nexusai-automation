import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';

const WEBMASTERS_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/auth?redirect=/dashboard/assets', req.url));

  if (req.nextUrl.searchParams.get('action') === 'status') {
    const { data: { session } } = await supabase.auth.getSession();
    const providerToken = session?.provider_token;
    if (!providerToken) return NextResponse.json({ connected: false, sites: [] });
    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${providerToken}` },
      cache: 'no-store',
    });
    if (response.status === 401 || response.status === 403) return NextResponse.json({ connected: false, sites: [], reconnectRequired: true });
    if (!response.ok) return NextResponse.json({ error: `Search Console returned ${response.status}.` }, { status: 502 });
    const payload = await response.json() as { siteEntry?: Array<{ siteUrl: string; permissionLevel: string }> };
    return NextResponse.json({ connected: true, sites: payload.siteEntry ?? [] });
  }

  const callback = new URL('/api/auth/callback', req.nextUrl.origin);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callback.toString(),
      scopes: WEBMASTERS_SCOPE,
      queryParams: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' },
    },
  });
  if (error || !data.url) return NextResponse.redirect(new URL('/dashboard/assets?gsc=error', req.url));
  return NextResponse.redirect(data.url);
}
