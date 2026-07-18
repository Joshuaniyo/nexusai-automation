/**
 * Get the base URL for the current environment.
 * Handles Vercel deployments, custom domains, and localhost.
 */
export function getBaseUrl(): string {
  // Browser actions must follow the origin the user is actually visiting.
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-rendered callers prefer the explicitly trusted production origin.
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Default for SSR/local development
  return 'http://localhost:3000';
}

/**
 * Get the OAuth redirect URL for authentication callbacks.
 * @param path - The callback path (default: '/api/auth/callback')
 */
export function getOAuthRedirectUrl(path: string = '/api/auth/callback'): string {
  return `${getBaseUrl()}${path}`;
}

/**
 * Get the email redirect URL for signup/password reset.
 * @param path - The callback path (default: '/auth')
 */
export function getEmailRedirectUrl(path: string = '/auth'): string {
  return `${getBaseUrl()}${path}`;
}
