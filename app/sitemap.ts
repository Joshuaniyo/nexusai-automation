import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-data';
import { getSiteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const publicPages = [
    ['/', 1, 'weekly'], ['/pricing', 0.9, 'monthly'], ['/blog', 0.9, 'weekly'],
    ['/about', 0.7, 'monthly'], ['/contact', 0.6, 'monthly'], ['/docs', 0.8, 'monthly'], ['/privacy', 0.3, 'yearly'],
    ['/terms', 0.3, 'yearly'], ['/refund', 0.3, 'yearly'],
  ] as const;
  return [
    ...publicPages.map(([path, priority, changeFrequency]) => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency, priority })),
    ...blogPosts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date(post.date), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
