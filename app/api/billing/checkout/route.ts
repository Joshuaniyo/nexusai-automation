import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;

    if (!apiKey || !productId) {
      console.error('Missing Dodo Payments configuration');
      return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'guest';
    const email = body.email || 'customer@example.com';

    const checkoutResponse = await fetch('https://api.dodopayments.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        customer: {
          email: email,
          name: body.name || 'Customer',
        },
        metadata: {
          userId: userId,
          source: 'nexusai-automation',
        },
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexusai-automation-eosin.vercel.app'}/dashboard?upgrade=success`,
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json().catch(() => ({}));
      console.error('Dodo API error:', errorData);
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    const checkout = await checkoutResponse.json();
    const checkoutUrl = checkout.payment_url || checkout.url || checkout.checkout_url;

    if (!checkoutUrl) {
      console.error('No checkout URL in response:', checkout);
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    const message = err instanceof Error ? err.message : 'Checkout creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;

    if (!apiKey || !productId) {
      return NextResponse.redirect(new URL('/?error=configuration', 'https://nexusai-automation-eosin.vercel.app'));
    }

    const checkoutResponse = await fetch('https://api.dodopayments.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        customer: {
          email: 'upgrade@nexusai-automation.com',
          name: 'Upgrading User',
        },
        metadata: {
          userId: 'pending',
          source: 'nexusai-automation-pricing',
        },
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexusai-automation-eosin.vercel.app'}/dashboard?upgrade=success`,
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json().catch(() => ({}));
      console.error('Dodo API error:', errorData);
      return NextResponse.redirect(new URL('/pricing?error=checkout', 'https://nexusai-automation-eosin.vercel.app'));
    }

    const checkout = await checkoutResponse.json();
    const checkoutUrl = checkout.payment_url || checkout.url || checkout.checkout_url;

    if (!checkoutUrl) {
      console.error('No checkout URL in response:', checkout);
      return NextResponse.redirect(new URL('/pricing?error=checkout', 'https://nexusai-automation-eosin.vercel.app'));
    }

    return NextResponse.redirect(checkoutUrl);
  } catch (err: unknown) {
    console.error('Checkout redirect error:', err);
    return NextResponse.redirect(new URL('/pricing?error=checkout', 'https://nexusai-automation-eosin.vercel.app'));
  }
}
