import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ALLOWED_REDIRECTS = ['/dashboard', '/dashboard/history', '/dashboard/assets'];

function getSafeRedirect(next: string | null): string {
  if (!next) return '/dashboard';
  // Only allow relative paths that start with /dashboard to prevent open redirects
  const decoded = decodeURIComponent(next);
  if (decoded.startsWith('/dashboard')) return decoded;
  return '/dashboard';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeRedirect(searchParams.get('next'));

  // Use the configured site URL so redirects always go to the right domain
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  if (code) {
    const response = NextResponse.redirect(`${siteUrl}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth?error=oauth_callback_failed`);
}
