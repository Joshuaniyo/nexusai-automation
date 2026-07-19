import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Clock, Calendar, Share2, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogPosts, getBlogPost, getRelatedPosts } from '@/lib/blog-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.image, width: 800, height: 400 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 2);

  const paragraphs = post.content.split('\n\n').map(p => {
    if (p.startsWith('## ')) {
      return { type: 'h2', content: p.replace('## ', '') } as const;
    }
    if (p.startsWith('### ')) {
      return { type: 'h3', content: p.replace('### ', '') } as const;
    }
    if (p.startsWith('- ') || p.startsWith('1. ')) {
      return { type: 'list', items: p.split('\n').map(item => item.replace(/^[-\d.]\s*/, '')) } as const;
    }
    return { type: 'p', content: p } as const;
  });

  return (
    <div className="min-h-screen bg-[hsl(220,16%,6%)]">
      <header className="border-b border-[hsl(220,14%,16%)] sticky top-0 bg-[hsl(220,16%,8%)]/95 backdrop-blur-lg z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[hsl(220,16%,6%)]" />
            </div>
            <span className="text-lg font-semibold text-white">NexusAI</span>
          </Link>
          <Button variant="ghost" asChild className="text-[hsl(215,16%,65%)]">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Articles
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <article>
          <header className="mb-8">
            <Badge variant="outline" className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,16%)] mb-4">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-[hsl(215,16%,60%)] mb-6">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-[hsl(215,16%,50%)] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-white font-medium">{post.author}</div>
                  <div className="text-xs">{post.authorRole}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>
            </div>

            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </header>

          <div className="prose-content">
            {paragraphs.map((block, idx) => {
              if (block.type === 'h2') {
                return (
                  <h2 key={idx} className="text-xl md:text-2xl font-semibold text-white mt-10 mb-4">
                    {block.content}
                  </h2>
                );
              }
              if (block.type === 'h3') {
                return (
                  <h3 key={idx} className="text-lg md:text-xl font-semibold text-white mt-8 mb-3">
                    {block.content}
                  </h3>
                );
              }
              if (block.type === 'list' && 'items' in block) {
                return (
                  <ul key={idx} className="list-disc list-inside text-[hsl(215,16%,65%)] mb-4 space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="text-base leading-relaxed">{item}</li>
                    ))}
                  </ul>
                );
              }
              if (block.type === 'p' && 'content' in block) {
                return (
                  <p key={idx} className="text-base text-[hsl(215,16%,65%)] leading-relaxed mb-4">
                    {block.content.split(';').map((line, i) => {
                      if (i === 0) return line;
                      return <span key={i}>({i}){line}</span>;
                    })}
                  </p>
                );
              }
              return null;
            })}
          </div>

          <div className="border-t border-[hsl(220,14%,16%)] pt-8 mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[hsl(215,16%,60%)]">
                <Share2 className="w-5 h-5" />
                <span>Share this article:</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild
                  className="border-[hsl(220,14%,20%)] text-[hsl(215,16%,60%)] hover:text-white hover:bg-[hsl(220,14%,12%)]">
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=https://nexusai-automation-eosin.vercel.app/blog/${slug}`} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild
                  className="border-[hsl(220,14%,20%)] text-[hsl(215,16%,60%)] hover:text-white hover:bg-[hsl(220,14%,12%)]">
                  <a href={`https://twitter.com/intent/tweet?url=https://nexusai-automation-eosin.vercel.app/blog/${slug}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-16 bg-gradient-to-r from-cyan-500/10 to-orange-500/10 rounded-2xl p-8 text-center border border-[hsl(220,14%,16%)]">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to scale your content with AI?
          </h2>
          <p className="text-[hsl(215,16%,60%)] mb-6 max-w-2xl mx-auto">
            Join teams using NexusAI Automation to generate SEO-optimized blog content and JSON-LD schemas at scale.
          </p>
          <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/auth?signup=true">
              Get Started Free
            </Link>
          </Button>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group">
                  <div className="bg-[hsl(220,16%,9%)] border border-[hsl(220,14%,16%)] rounded-lg overflow-hidden hover:border-cyan-400/50 transition-all">
                    <div className="relative h-40 overflow-hidden">
                      <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-cyan-400 mb-2">{related.category}</p>
                      <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[hsl(220,14%,16%)] py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-[hsl(215,16%,50%)] text-sm">
          © {new Date().getFullYear()} NexusAI Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
