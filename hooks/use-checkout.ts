'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: { Open: (url: string) => void };
    };
  }
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!document.querySelector('script[data-lemonsqueezy]')) {
      const script = document.createElement('script');
      script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
      script.defer = true;
      script.dataset.lemonsqueezy = 'true';
      document.head.appendChild(script);
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startCheckout = useCallback(async (billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.assign('/auth?redirect=/pricing');
        return;
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCycle }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (window.LemonSqueezy?.Url) {
        window.LemonSqueezy.Url.Open(data.url);
      } else {
        window.location.assign(data.url);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Checkout failed';
      setError(message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [loading]);

  return { loading, error, startCheckout };
}
