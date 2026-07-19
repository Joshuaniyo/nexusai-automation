import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function resolveOrigin(requestUrl: URL): string {
  const requestIsLocal = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
  if (!requestIsLocal) return requestUrl.origin;

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      console.error('NEXT_PUBLIC_SITE_URL is not a valid absolute URL; using the request origin.');
    }
  }
  return requestUrl.origin;
}

export async function handleAuthCallback(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = resolveOrigin(requestUrl);
  const code = requestUrl.searchParams.get('code');
  const requestedDestination = requestUrl.searchParams.get('next');
  const destination = requestedDestination?.startsWith('/dashboard') ? requestedDestination : '/dashboard';

  if (code) {
    const response = NextResponse.redirect(new URL(destination, origin));
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
    console.error('OAuth code exchange failed:', error.message);
  }

  const errorUrl = new URL('/auth', origin);
  errorUrl.searchParams.set('error', 'oauth_callback_failed');
  return NextResponse.redirect(errorUrl);
}
