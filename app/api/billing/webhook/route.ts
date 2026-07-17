import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Missing LEMONSQUEEZY_WEBHOOK_SECRET configuration');
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
    }

    // Recommended secure verification of Lemon Squeezy webhooks
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(rawBody).digest('hex');

    const digestBuffer = Buffer.from(digest, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (
      digestBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(digestBuffer, signatureBuffer)
    ) {
      console.error('Invalid Lemon Squeezy webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventName = payload.meta?.event_name;
    console.log(`Received Lemon Squeezy webhook event: ${eventName}`);

    // Parse user custom data passed during checkout
    const userId = payload.meta?.custom_data?.user_id;
    if (!userId) {
      console.warn('Webhook received but no userId found in custom_data metadata:', payload.meta);
      return NextResponse.json({ received: true, error: 'Missing userId in metadata' });
    }

    const data = payload.data;
    if (!data || data.type !== 'subscriptions') {
      // We only care about subscription events in this SaaS integration
      console.log(`Skipping event type: ${data?.type}`);
      return NextResponse.json({ received: true });
    }

    const subscriptionId = data.id;
    const attrs = data.attributes;
    const status = attrs.status; // active, trialing, past_due, paused, cancelled, expired, etc.
    const variantId = attrs.variant_id?.toString();
    const allowedVariantIds = new Set([
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID,
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_YEARLY_VARIANT_ID,
    ].filter((value): value is string => Boolean(value)));
    const customerId = attrs.customer_id?.toString();
    const cardBrand = attrs.card_brand;
    const cardLastFour = attrs.card_last_four;
    const trialEndsAt = attrs.trial_ends_at;
    const renewsAt = attrs.renews_at;
    const endsAt = attrs.ends_at;

    if (!subscriptionId || !status || !variantId) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 });
    }

    if (!allowedVariantIds.has(variantId)) {
      console.error(`Rejected subscription with unconfigured variant: ${variantId}`);
      return NextResponse.json({ error: 'Unknown subscription variant' }, { status: 400 });
    }

    const isSubscriptionActive = ['active', 'trialing'].includes(status);
    const userTier = isSubscriptionActive ? 'premium' : 'free';

    // 1. Upsert subscription tracking record in database
    const subscriptionRecord = {
      id: subscriptionId,
      user_id: userId,
      status,
      variant_id: variantId,
      customer_id: customerId || null,
      card_brand: cardBrand || null,
      card_last_four: cardLastFour || null,
      trial_ends_at: trialEndsAt || null,
      renews_at: renewsAt || null,
      ends_at: endsAt || null,
    };

    console.log(`Upserting subscription ${subscriptionId} for user ${userId} with status ${status}`);
    const { error: subError } = await supabaseService
      .from('subscriptions')
      .upsert(subscriptionRecord, { onConflict: 'id' });

    if (subError) {
      console.error('Failed to upsert subscription details:', subError);
      return NextResponse.json({ error: 'Database write error' }, { status: 500 });
    }

    // 2. Update profiles table to adjust user tier & status
    console.log(`Updating profile for user ${userId} to tier: ${userTier}`);
    const { error: profileError } = await supabaseService
      .from('profiles')
      .update({
        tier: userTier,
        premium_since: isSubscriptionActive ? new Date().toISOString() : null,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Failed to update profiles table tier:', profileError);
    }

    // 3. Update auth metadata backup to keep synchronized
    try {
      await supabaseService.auth.admin.updateUserById(userId, {
        app_metadata: { tier: userTier },
      });
      console.log(`Synchronized auth metadata tier for user ${userId} to ${userTier}`);
    } catch (e) {
      console.warn('Auth metadata backup update not available or failed:', e);
    }

    return NextResponse.json({ received: true, updated: true });
  } catch (err: unknown) {
    console.error('Webhook processing error:', err);
    const message = err instanceof Error ? err.message : 'Webhook handler exception';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
