import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NexusAI Automation', short_name: 'NexusAI',
    description: 'AI content generation, optimization, and multi-channel distribution workspace.',
    start_url: '/', display: 'standalone', background_color: '#0d1016', theme_color: '#06b6d4',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
