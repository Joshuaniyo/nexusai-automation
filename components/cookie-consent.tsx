'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { Cookie, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'nexusai_cookies_accepted';

function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-KEXN8EHWJ1';
  return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" /><Script id="nexus-google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}</Script></>;
}

export function CookieConsent() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setChoice(window.localStorage.getItem(STORAGE_KEY)); } finally { setReady(true); }
  }, []);

  function choose(value: 'true' | 'essential') {
    window.localStorage.setItem(STORAGE_KEY, value);
    setChoice(value);
  }

  const privateArea = pathname.startsWith('/dashboard') || pathname.startsWith('/auth');
  if (!ready || privateArea) return null;
  if (choice === 'true') return <GoogleAnalytics />;
  if (choice) return null;

  return <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-cyan-400/20 bg-slate-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:bottom-5 sm:p-5" role="dialog" aria-label="Cookie preferences"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10"><Cookie className="h-5 w-5 text-cyan-300" /></div><div className="min-w-0 flex-1"><h2 className="flex items-center gap-2 text-sm font-semibold text-white">Your privacy choices <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /></h2><p className="mt-1 text-xs leading-5 text-slate-400">NexusAI uses essential browser storage for security and preferences. With your permission, we also use Google Analytics to understand public-site usage. Analytics stays disabled until you accept.</p><p className="mt-1 text-[10px] text-slate-500">See our <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button size="sm" onClick={() => choose('true')} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">Accept analytics</Button><Button size="sm" variant="outline" onClick={() => choose('essential')} className="border-slate-700">Essential only</Button></div></div></div></div>;
}
