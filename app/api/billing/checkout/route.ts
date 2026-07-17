import { NextRequest, NextResponse } from 'next/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { createSupabaseServerClient } from '@/lib/auth';

// Setup Lemon Squeezy
const apiKey = process.env.LEMONSQUEEZY_API_KEY;
if (apiKey) {
  lemonSqueezySetup({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const monthlyVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID;
    const yearlyVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_YEARLY_VARIANT_ID;

    if (!apiKey || !storeId || !monthlyVariantId || !yearlyVariantId) {
      console.error('Missing Lemon Squeezy credentials');
      return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const { supabase } = createSupabaseServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const billingCycle = body.billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const variantId = billingCycle === 'yearly' ? yearlyVariantId : monthlyVariantId;

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?upgrade=success`;

    const { data: checkoutData, error: checkoutError } = await createCheckout(
      storeId,
      variantId,
      {
        checkoutData: {
          email: user.email,
          name: typeof user.user_metadata.full_name === 'string'
            ? user.user_metadata.full_name
            : undefined,
          custom: {
            user_id: user.id,
            billing_cycle: billingCycle,
          },
        },
        productOptions: {
          redirectUrl,
        },
        checkoutOptions: { embed: true },
      }
    );

    if (checkoutError || !checkoutData) {
      console.error('Lemon Squeezy API error:', checkoutError);
      return NextResponse.json({ error: checkoutError?.message || 'Failed to create checkout session' }, { status: 500 });
    }

    const checkoutUrl = checkoutData.data.attributes.url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    const message = err instanceof Error ? err.message : 'Checkout creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
