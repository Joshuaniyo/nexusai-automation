'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Check, Zap, Building, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCheckout } from '@/hooks/use-checkout';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out the platform',
    features: [
      'Up to 3 saved assets',
      '10 AI generations per month',
      'Basic JSON-LD output',
      'LinkedIn & X post generation',
      'Community support',
    ],
    cta: 'Start Free',
    popular: false,
    href: '/auth?signup=true',
  },
  {
    name: 'Premium',
    price: '$29',
    period: 'per month',
    description: 'For teams ready to scale',
    features: [
      'Unlimited saved assets',
      'Unlimited AI generations',
      'Advanced JSON-LD schemas',
      'All platforms + custom webhooks',
      'Priority email support',
      'API access',
      'Team collaboration features',
      'Custom branding options',
    ],
    cta: 'Upgrade to Premium',
    popular: true,
    href: '/api/billing/checkout',
  },
];

const faqs = [
  {
    q: 'Can I switch between plans?',
    a: 'Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately, while downgrades apply at the end of your billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards through Lemon Squeezy, our Merchant of Record. Payment processing is secure and PCI-compliant.',
  },
  {
    q: 'Can I use NexusAI without a Premium subscription?',
    a: 'Yes. The Free Tier is available without a time limit or credit card. Premium purchases are governed by our published Refund Policy.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your data remains accessible. However, if you have more than 3 assets, you\'ll need to reduce them to the Free tier limit.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel anytime from your account settings. You\'ll retain access to Premium features until the end of your billing period.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { loading: checkoutLoading, startCheckout } = useCheckout();

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-16">
          <Badge variant="outline" className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,16%)] text-[hsl(215,16%,65%)] mb-4">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[hsl(215,16%,60%)] max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mb-12 flex flex-col items-center gap-3">
          <div className="relative grid w-full max-w-xs grid-cols-2 rounded-full border border-white/10 bg-[hsl(220,14%,12%)] p-1 shadow-xl">
            <span className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-full' : 'translate-x-0'}`} />
            {(['monthly', 'yearly'] as const).map((cycle) => (
              <button key={cycle} onClick={() => setBillingCycle(cycle)} className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${billingCycle === cycle ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                {cycle}
              </button>
            ))}
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${billingCycle === 'yearly' ? 'scale-100 border-emerald-400/30 bg-emerald-400/10 text-emerald-300 opacity-100' : 'scale-95 border-transparent text-slate-500 opacity-60'}`}>
            Save 40% - Best Value
          </span>
        </div>

        <div className="mx-auto mb-20 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`bg-[hsl(220,16%,9%)] relative overflow-hidden transition-all hover:scale-[1.02] ${
                plan.popular ? 'border-orange-500/50' : 'border-[hsl(220,14%,16%)]'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-orange-500/20' : 'bg-[hsl(220,14%,12%)]'
                  }`}>
                    {idx === 0 && <Zap className={`w-5 h-5 ${plan.popular ? 'text-orange-400' : 'text-cyan-400'}`} />}
                    {idx === 1 && <Building className={`w-5 h-5 ${plan.popular ? 'text-orange-400' : 'text-cyan-400'}`} />}
                    {idx === 2 && <Building className={`w-5 h-5 ${plan.popular ? 'text-orange-400' : 'text-green-400'}`} />}
                  </div>
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-[hsl(215,16%,60%)]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold text-white">{plan.popular ? (billingCycle === 'yearly' ? '$200' : '$29') : plan.price}</span>
                  <span className="text-[hsl(215,16%,50%)]">/{plan.popular ? (billingCycle === 'yearly' ? 'year' : 'month') : plan.period}</span>
                  {plan.popular && billingCycle === 'yearly' && <p className="mt-2 text-xs font-medium text-emerald-400">Equivalent to $16.67/month</p>}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-orange-500' : 'text-green-500'}`} />
                      <span className="text-[hsl(215,16%,70%)] text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-[hsl(220,14%,12%)] hover:bg-[hsl(220,14%,16%)] text-white border border-[hsl(220,14%,20%)]'
                  }`
                  }
                  disabled={plan.popular && checkoutLoading}
                  onClick={() => {
                    if (plan.popular) {
                      startCheckout(billingCycle);
                    } else {
                      router.push(plan.href);
                    }
                  }}
                >
                  {plan.popular && checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-[hsl(215,16%,60%)]">Everything you need to know about pricing</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[hsl(220,16%,9%)] border border-[hsl(220,14%,16%)] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[hsl(215,16%,50%)] transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-[hsl(215,16%,60%)] text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
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
