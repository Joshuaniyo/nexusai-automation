import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { createSupabaseServerClient } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/auth?redirect=/dashboard/social-integrations', req.url));
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) return NextResponse.redirect(new URL('/dashboard/social-integrations?linkedin=config_error', req.url));
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : req.nextUrl.origin;
  const redirectUri = `${origin}/api/social/linkedin/callback`;
  const state = randomBytes(24).toString('base64url');
  const authorize = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('scope', 'openid profile w_member_social');
  const response = NextResponse.redirect(authorize);
  response.cookies.set('nexus_linkedin_state', state, { httpOnly: true, secure: origin.startsWith('https://'), sameSite: 'lax', path: '/', maxAge: 600 });
  response.cookies.set('nexus_linkedin_redirect', redirectUri, { httpOnly: true, secure: origin.startsWith('https://'), sameSite: 'lax', path: '/', maxAge: 600 });
  return response;
}
