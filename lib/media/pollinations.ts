const POLLINATIONS_API_URL = 'https://gen.pollinations.ai/v1/images/generations';

export type SocialPlatform = 'blog' | 'x' | 'linkedin' | 'instagram';
export type ImageAspectRatio = '16:9' | '1:1' | '9:16';

const DIMENSIONS: Record<SocialPlatform, string> = {
  blog: '1200x630',
  x: '1200x675',
  linkedin: '1200x627',
  instagram: '1080x1080',
};

const ASPECT_DIMENSIONS: Record<ImageAspectRatio, string> = {
  '16:9': '1280x720',
  '1:1': '1080x1080',
  '9:16': '720x1280',
};

export async function generatePollinationsImage(prompt: string, platform: SocialPlatform, aspectRatio?: ImageAspectRatio): Promise<string> {
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  if (!apiKey) throw new Error('POLLINATIONS_API_KEY is not configured.');
  const cleanPrompt = prompt.trim().slice(0, 1800);
  if (cleanPrompt.length < 10) throw new Error('Image prompt must be at least 10 characters.');

  const response = await fetch(POLLINATIONS_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: cleanPrompt,
      model: 'flux',
      n: 1,
      size: aspectRatio ? ASPECT_DIMENSIONS[aspectRatio] : DIMENSIONS[platform],
      quality: 'standard',
      response_format: 'url',
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Pollinations image request failed (${response.status})${detail ? `: ${detail.slice(0, 160)}` : ''}`);
  }

  const payload = await response.json() as { data?: Array<{ url?: string }> };
  const url = payload.data?.[0]?.url;
  if (!url) throw new Error('Pollinations returned no image URL.');
  return url;
}
