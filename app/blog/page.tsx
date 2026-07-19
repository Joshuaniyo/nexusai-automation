'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Search, Clock, User, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { blogPosts } from '@/lib/blog-data';

const categories = ['All', 'Industry Insights', 'Technical Deep-Dive', 'Growth Strategies', 'Social Media'];

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[hsl(220,16%,6%)]">
      <header className="border-b border-[hsl(220,14%,16%)] sticky top-0 bg-[hsl(220,16%,8%)]/95 backdrop-blur-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[hsl(220,16%,6%)]" />
            </div>
            <span className="text-lg font-semibold text-white">NexusAI</span>
          </Link>
          <Button variant="ghost" asChild className="text-[hsl(215,16%,65%)]">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,16%)] mb-4">
            Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Insights on AI Content Automation
          </h1>
          <p className="text-xl text-[hsl(215,16%,60%)] max-w-2xl mx-auto">
            Expert perspectives, technical deep-dives, and practical strategies for scaling your content operations.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(215,16%,40%)]" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)] text-white placeholder:text-[hsl(215,16%,40%)]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat
                  ? 'bg-cyan-400 hover:bg-cyan-500 text-[hsl(220,16%,6%)]'
                  : 'border-[hsl(220,14%,20%)] text-[hsl(215,16%,60%)] hover:text-white hover:bg-[hsl(220,14%,12%)]'
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)] h-full overflow-hidden hover:border-cyan-400/50 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-[hsl(220,16%,9%)]/90 text-white">
                    {post.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-[hsl(215,16%,60%)] text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[hsl(215,16%,50%)]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-[hsl(215,16%,40%)] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="text-cyan-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[hsl(215,16%,60%)]">No articles found matching your criteria.</p>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-cyan-500/10 to-orange-500/10 rounded-2xl p-8 md:p-12 text-center border border-[hsl(220,14%,16%)]">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to automate your content?
          </h2>
          <p className="text-[hsl(215,16%,60%)] mb-6 max-w-2xl mx-auto">
            Join teams using NexusAI Automation to scale their content production with AI.
          </p>
          <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/auth?signup=true">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-[hsl(220,14%,16%)] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-[hsl(215,16%,50%)] text-sm">
          © {new Date().getFullYear()} NexusAI Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
