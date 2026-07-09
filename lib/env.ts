/**
 * Get the base URL for the current environment.
 * Handles Vercel deployments, custom domains, and localhost.
 */
export function getBaseUrl(): string {
  // Check for Vercel URL first (production/preview deployments)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Check for manually configured site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Fallback for browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Default for SSR/local development
  return 'http://localhost:3000';
}

/**
 * Get the OAuth redirect URL for authentication callbacks.
 * @param path - The callback path (default: '/auth/callback')
 */
export function getOAuthRedirectUrl(path: string = '/auth/callback'): string {
  return `${getBaseUrl()}${path}`;
}

/**
 * Get the email redirect URL for signup/password reset.
 * @param path - The callback path (default: '/auth')
 */
export function getEmailRedirectUrl(path: string = '/auth'): string {
  return `${getBaseUrl()}${path}`;
}
