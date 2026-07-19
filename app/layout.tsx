import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { getSiteUrl } from '@/lib/site-url';
import { CookieConsent } from '@/components/cookie-consent';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const siteUrl = getSiteUrl();
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NexusAI Automation — Scale AI Content for Teams & SaaS',
    template: '%s | NexusAI Automation',
  },
  description: 'Production-grade AI content automation platform. Generate SEO-optimized blog posts, JSON-LD schemas, and multi-platform social content at scale using Gemini AI.',
  keywords: ['AI content automation', 'SEO content generation', 'JSON-LD schema', 'multi-tenant content', 'SaaS marketing', 'Gemini AI'],
  authors: [{ name: 'NexusAI Automation' }],
  creator: 'NexusAI Automation',
  publisher: 'NexusAI Automation',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'NexusAI Automation',
    title: 'NexusAI Automation — Scale AI Content for Teams & SaaS',
    description: 'Generate SEO-optimized blog content, JSON-LD schemas, and social posts at scale with Gemini AI.',
    images: [{ url: '/favicon.svg', width: 100, height: 100 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexusAI Automation — Scale AI Content for Teams & SaaS',
    description: 'Generate SEO-optimized blog content, JSON-LD schemas, and social posts at scale with Gemini AI.',
    images: ['/favicon.svg'],
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NexusAI Automation',
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  description: 'Multi-tenant AI content automation SaaS platform powered by Gemini AI.',
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className={inter.className} style={{ backgroundColor: 'hsl(220,16%,6%)', color: 'hsl(210,20%,95%)', margin: 0 }}>
        {children}
        <CookieConsent />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
