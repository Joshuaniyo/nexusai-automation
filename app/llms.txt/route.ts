import { getSiteUrl } from '@/lib/site-url';

export function GET() {
  const baseUrl = getSiteUrl();
  const body = `# NexusAI Automation

> NexusAI is an AI-assisted content automation workspace for producing structured blog content, search metadata, JSON-LD, visual prompts, and channel-specific social copy.

## Public pages
- [Home](${baseUrl}/): Product overview and workflow
- [Pricing](${baseUrl}/pricing): Current plans and billing options
- [Blog](${baseUrl}/blog): Articles about AI content automation, SEO, AEO, GEO, and distribution
- [About](${baseUrl}/about): Company and product context
- [Contact](${baseUrl}/contact): Support and product inquiries

## Core capabilities
- Cooperative specialist-agent content generation
- SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) audits
- JSON-LD and semantic entity planning
- Multi-channel social copy and media packages
- Webhook and connected-platform publishing queues

## Access notes
Public marketing and blog pages may be indexed. Authentication, dashboard, API, and user-generated private content paths must not be crawled.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
