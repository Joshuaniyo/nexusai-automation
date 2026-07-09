'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
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
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-[hsl(215,16%,50%)] text-sm">Last updated: {lastUpdated}</p>
        </div>
        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </main>
      <footer className="border-t border-[hsl(220,14%,16%)] py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-[hsl(215,16%,50%)] text-sm">
          © {new Date().getFullYear()} NexusAI Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const proseStyles = `
  .prose-invert h2 { font-size: 1.25rem; font-weight: 600; color: hsl(210,20%,95%); margin-top: 2rem; margin-bottom: 0.75rem; }
  .prose-invert h3 { font-size: 1.1rem; font-weight: 600; color: hsl(210,20%,95%); margin-top: 1.5rem; margin-bottom: 0.5rem; }
  .prose-invert p { font-size: 0.95rem; color: hsl(215,16%,65%); line-height: 1.7; margin-bottom: 1rem; }
  .prose-invert ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
  .prose-invert ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
  .prose-invert li { font-size: 0.95rem; color: hsl(215,16%,65%); margin-bottom: 0.5rem; }
  .prose-invert strong { color: hsl(210,20%,95%); font-weight: 500; }
  .prose-invert a { color: hsl(199,89%,48%); text-decoration: underline; }
  .prose-invert a:hover { color: hsl(199,89%,60%); }
`;
