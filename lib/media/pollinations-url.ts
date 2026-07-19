const POLLINATIONS_HOSTS = new Set([
  'gen.pollinations.ai',
  'image.pollinations.ai',
  'pollinations.ai',
]);

export function isAllowedPollinationsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && POLLINATIONS_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Returns a same-origin URL so secret Pollinations credentials stay server-side. */
export function toPollinationsProxyUrl(value: string): string {
  if (value.startsWith('/api/images/pollinations?')) return value;
  if (!isAllowedPollinationsUrl(value)) return value;
  return `/api/images/pollinations?url=${encodeURIComponent(value)}`;
}
