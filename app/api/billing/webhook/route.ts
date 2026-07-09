import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return true;
  const parts = signature.split(',');
  let t = '';
  let v1 = '';
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') t = value;
    if (key === 'v1') v1 = value;
  }
  if (!t || !v1) return true;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('webhook-signature') || req.headers.get('x-webhook-signature') || '';

    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
    if (webhookSecret && !verifySignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = event.event || event.type || event.eventType;

    if (eventType === 'subscription.created' ||
        eventType === 'subscription.active' ||
        eventType === 'payment.success' ||
        eventType === 'payment.succeeded' ||
        eventType === 'order.completed' ||
        eventType === 'order.paid') {

      const customerId = event.data?.customerId || event.data?.customer_id || event.customerId || event.customer_id;
      const userId = event.data?.metadata?.userId || event.metadata?.userId || event.userId || customerId;
      const email = event.data?.customer?.email || event.customer?.email || event.data?.email || event.email;

      if (!userId && !email) {
        console.log('Webhook received but no user identifier found');
        return NextResponse.json({ received: true, upgraded: false, reason: 'No user identifier' });
      }

      if (userId && userId !== 'pending' && userId !== 'guest') {
        try {
          const { data: profile } = await supabaseService
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

          if (profile) {
            await supabaseService
              .from('profiles')
              .update({ tier: 'premium', premium_since: new Date().toISOString() })
              .eq('id', userId);
            console.log(`Upgraded user ${userId} to premium via profiles table`);
          }
        } catch {
          console.log('No profiles table, trying auth metadata update');
        }

        try {
          await supabaseService.auth.admin.updateUserById(userId, {
            app_metadata: { tier: 'premium' },
          });
          console.log(`Updated auth metadata for user ${userId}`);
        } catch (e) {
          console.log('Auth metadata update not available:', e);
        }
      }

      console.log(`Webhook processed: ${eventType} for user ${userId || email}`);
      return NextResponse.json({ received: true, upgraded: true });
    }

    if (eventType === 'subscription.cancelled' ||
        eventType === 'subscription.expired' ||
        eventType === 'payment.failed') {
      console.log(`Webhook received: ${eventType}`);
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, eventType });
  } catch (err: unknown) {
    console.error('Webhook processing error:', err);
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
