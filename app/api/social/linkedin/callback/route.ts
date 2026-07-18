import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';
import { encryptSocialToken } from '@/lib/social/encryption';

export async function GET(req: NextRequest) {
  const destination = new URL('/dashboard/social-integrations', req.url);
  try {
    const { supabase } = createSupabaseServerClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const expectedState = req.cookies.get('nexus_linkedin_state')?.value;
    const redirectUri = req.cookies.get('nexus_linkedin_redirect')?.value;
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!user || !code || !state || state !== expectedState || !redirectUri || !clientId || !clientSecret) throw new Error('LinkedIn OAuth validation failed.');
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri }),
      cache: 'no-store',
    });
    const token = await tokenResponse.json() as { access_token?: string; expires_in?: number; error_description?: string };
    if (!tokenResponse.ok || !token.access_token) throw new Error(token.error_description || 'LinkedIn token exchange failed.');
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${token.access_token}` }, cache: 'no-store' });
    const profile = await profileResponse.json() as { sub?: string; name?: string; email?: string };
    if (!profileResponse.ok || !profile.sub) throw new Error('LinkedIn profile lookup failed.');
    const { error } = await supabase.from('social_connections').upsert({
      user_id: user.id,
      platform: 'linkedin',
      token_encrypted: encryptSocialToken(token.access_token),
      platform_account_name: profile.name || profile.email || 'LinkedIn profile',
      metadata: { member_sub: profile.sub, expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform' });
    if (error) throw error;
    destination.searchParams.set('linkedin', 'connected');
  } catch (error) {
    console.error('LinkedIn connection failed:', error);
    destination.searchParams.set('linkedin', 'error');
  }
  const response = NextResponse.redirect(destination);
  response.cookies.delete('nexus_linkedin_state');
  response.cookies.delete('nexus_linkedin_redirect');
  return response;
}
