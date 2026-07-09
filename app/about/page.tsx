import Link from 'next/link';
import { ArrowLeft, Sparkles, Target, Users, Lightbulb, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[hsl(220,16%,6%)]">
      <header className="border-b border-[hsl(220,14%,16%)] sticky top-0 bg-[hsl(220,16%,8%)]/95 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About NexusAI Automation</h1>
          <p className="text-xl text-[hsl(215,16%,60%)] max-w-3xl mx-auto">
            Empowering teams to scale AI content production with enterprise-grade automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
            <CardContent className="pt-8 pb-6 px-6">
              <Target className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Our Mission</h3>
              <p className="text-[hsl(215,16%,60%)]">
                To democratize AI-powered content creation, making it accessible for teams of all sizes
                to produce high-quality, SEO-optimized content at scale.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
            <CardContent className="pt-8 pb-6 px-6">
              <Users className="w-10 h-10 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Who We Serve</h3>
              <p className="text-[hsl(215,16%,60%)]">
                AI content creators, web developers, marketing agencies, SaaS companies, and growing teams
                who need reliable content automation at scale.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
            <CardContent className="pt-8 pb-6 px-6">
              <Lightbulb className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Our Vision</h3>
              <p className="text-[hsl(215,16%,60%)]">
                A future where generative AI engines seamlessly integrate with content workflows,
                and structured data powers discovery across all platforms.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-orange-500/10 rounded-2xl p-8 md:p-12 border border-[hsl(220,14%,16%)] mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">The Story Behind NexusAI</h2>
          <div className="space-y-4 text-[hsl(215,16%,60%)]">
            <p>
              NexusAI Automation was born from a simple observation: content teams were spending too much
              time on repetitive tasks instead of strategy and creativity. As AI engines like ChatGPT and
              Google&apos;s Gemini evolved, so did the opportunity to automate content production at scale.
            </p>
            <p>
              We built NexusAI to bridge the gap between powerful AI capabilities and practical business needs.
              Our platform combines the best of Gemini AI with SEO best practices, structured data automation,
              and multi-platform distribution to help teams 10x their content output without sacrificing quality.
            </p>
            <p>
              Today, we serve hundreds of teams across the globe, from indie developers building their first
              SaaS to agencies managing dozens of client portfolios. And we&apos;re just getting started.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Quality First', desc: 'Enterprise-grade content that meets the highest standards' },
              { title: 'User Empowerment', desc: 'Tools that augment human creativity, not replace it' },
              { title: 'Transparent Pricing', desc: 'Simple pricing with no hidden fees or surprises' },
              { title: 'Continuous Innovation', desc: 'Always improving, always pushing boundaries' },
            ].map((value, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-[hsl(220,16%,9%)] border border-[hsl(220,14%,16%)]">
                <Heart className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">{value.title}</h4>
                <p className="text-sm text-[hsl(215,16%,60%)]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[hsl(220,14%,16%)] py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-[hsl(215,16%,50%)] text-sm">
          © {new Date().getFullYear()} NexusAI Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
