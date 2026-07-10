'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DodoPayments } from 'dodopayments-checkout';
import type { CheckoutEvent } from 'dodopayments-checkout';
import { supabase } from '@/lib/supabase';

let dodoInitialized = false;

function ensureDodoInitialized() {
  if (dodoInitialized || typeof window === 'undefined') return;
  const mode = (process.env.NEXT_PUBLIC_DODO_MODE as 'test' | 'live') || 'live';
  DodoPayments.Initialize({
    mode,
    displayType: 'overlay',
    onEvent: (event: CheckoutEvent) => {
      if (event.event_type === 'checkout.closed') {
        // Overlay closed — callers manage their own UI state
      }
    },
  });
  dodoInitialized = true;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    ensureDodoInitialized();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startCheckout = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          email: user?.email || '',
          name: (user?.user_metadata?.full_name as string) || '',
        }),
      });

      if (!mountedRef.current) return;

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      DodoPayments.Checkout.open({ checkoutUrl: data.url });
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
