'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap, Layout, Code2, Share2, Check, ArrowRight, Menu, X, Sparkles, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCheckout } from '@/hooks/use-checkout';

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[hsl(220,16%,8%)]/95 backdrop-blur-lg border-b border-[hsl(220,14%,16%)]' : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[hsl(220,16%,6%)]" />
            </div>
            <span className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
              NexusAI <span className="text-cyan-400">Automation</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="text-[hsl(215,16%,65%)] hover:text-white transition-colors text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild className="text-[hsl(215,16%,65%)] hover:text-white hover:bg-[hsl(220,14%,12%)]">
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
              <Link href="/auth?signup=true">Get Started</Link>
            </Button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[hsl(215,16%,65%)]">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[hsl(220,14%,16%)]">
            <div className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2 text-[hsl(215,16%,65%)] hover:text-white hover:bg-[hsl(220,14%,12%)] rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[hsl(220,14%,16%)] mt-2 pt-2 px-4 flex flex-col gap-2">
                <Link href="/auth" onClick={() => setMobileOpen(false)}
                  className="py-2 text-center text-[hsl(215,16%,65%)]">Sign In</Link>
                <Link href="/auth?signup=true" onClick={() => setMobileOpen(false)}
                  className="py-2 text-center bg-orange-500 text-white rounded-lg font-medium">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="bg-[hsl(220,14%,12%)] border-[hsl(199,89%,48%)]/30 text-cyan-400 px-4 py-1.5 animate-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Gemini 2.5 Flash AI
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Scale AI Content Automation for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
              Teams & SaaS
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[hsl(215,16%,60%)] max-w-2xl mx-auto mb-8">
            Generate SEO-optimized blog content, JSON-LD schemas, and multi-platform social posts at scale. Perfect for agencies, developers, and growing SaaS teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" onClick={() => router.push('/auth?signup=true')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-orange-500/25 transition-all hover:scale-105">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" asChild
              className="border-[hsl(220,14%,20%)] text-white hover:bg-[hsl(220,14%,12%)] px-8 py-6 text-lg">
              <Link href="/dashboard">
                View Live Demo
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-[hsl(215,16%,50%)]">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="bg-gradient-to-r from-cyan-500/20 via-transparent to-orange-500/20 rounded-2xl p-1 max-w-5xl mx-auto">
            <div className="bg-[hsl(220,16%,9%)] rounded-xl p-4 md:p-8 border border-[hsl(220,14%,16%)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-6 rounded-lg bg-[hsl(220,14%,12%)]">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">10,000+</div>
                  <div className="text-[hsl(215,16%,60%)]">Articles Generated</div>
                </div>
                <div className="p-6 rounded-lg bg-[hsl(220,14%,12%)]">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
                  <div className="text-[hsl(215,16%,60%)]">Active Teams</div>
                </div>
                <div className="p-6 rounded-lg bg-[hsl(220,14%,12%)]">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-[hsl(215,16%,60%)]">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const features = [
    {
      icon: Zap,
      title: 'AI Post Generation',
      description: 'Generate SEO-optimized blog posts with meta descriptions, keywords, and structured content in seconds using Gemini AI.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Layout,
      title: 'Asset Manager',
      description: 'Manage multiple client websites with custom CMS integrations, webhook endpoints, and multi-tenant configurations.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Code2,
      title: 'JSON-LD Schema Automation',
      description: 'Auto-generate valid JSON-LD structured data for enhanced search visibility and rich results in generative AI engines.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Share2,
      title: 'Multi-Platform Distribution',
      description: 'Distribute content across LinkedIn, X/Twitter, and custom webhooks with platform-optimized formatting.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,16%)] text-[hsl(215,16%,65%)] mb-4">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need for AI Content at Scale
          </h2>
          <p className="text-[hsl(215,16%,60%)] max-w-2xl mx-auto">
            A complete suite of tools designed for SaaS teams, agencies, and content creators who need production-grade automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)] hover:border-[hsl(199,89%,48%)]/50 transition-all group overflow-hidden">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[hsl(215,16%,60%)]">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  const router = useRouter();
  const { loading: checkoutLoading, startCheckout } = useCheckout();

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-[hsl(220,16%,8%)] to-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,16%)] text-[hsl(215,16%,65%)] mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[hsl(215,16%,60%)]">
            Start free and upgrade when you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)] relative">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-2xl">Free Tier</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-[hsl(215,16%,60%)]">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {['Up to 3 saved assets', '10 AI generations/month', 'Basic JSON-LD output', 'LinkedIn & X post generation', 'Community support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[hsl(215,16%,70%)]">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-6 border-[hsl(220,14%,20%)] text-white hover:bg-[hsl(220,14%,12%)]"
                onClick={() => router.push('/auth?signup=true')}>
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,16%,9%)] border-orange-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-2xl">Premium</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-[hsl(215,16%,60%)]">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {['Unlimited saved assets', 'Unlimited AI generations', 'Advanced JSON-LD schemas', 'All platforms + webhooks', 'Priority email support', 'API access', 'Team collaboration'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[hsl(215,16%,70%)]">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                disabled={checkoutLoading}
                onClick={() => startCheckout()}>
                {checkoutLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Upgrade Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[hsl(220,14%,16%)] bg-[hsl(220,16%,8%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[hsl(220,16%,6%)]" />
              </div>
              <span className="font-semibold text-white">NexusAI</span>
            </Link>
            <p className="text-[hsl(215,16%,60%)] text-sm">
              AI-powered content automation for modern teams.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/dashboard" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Terms</Link></li>
              <li><Link href="/refund" className="text-[hsl(215,16%,60%)] hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[hsl(220,14%,16%)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[hsl(215,16%,50%)] text-sm">
            © {new Date().getFullYear()} NexusAI Automation. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-[hsl(215,16%,50%)]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-white transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
