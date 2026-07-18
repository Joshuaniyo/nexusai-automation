import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

export const runtime = 'nodejs';
export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const value = req.headers.get('authorization');
  if (!secret || !value?.startsWith('Bearer ')) return false;
  const received = Buffer.from(value.slice(7));
  const expected = Buffer.from(secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function safeWebhook(value: string): URL | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || host === 'localhost' || host.endsWith('.local')) return null;
    if (isIP(host)) {
      if (/^(10\.|127\.|169\.254\.|192\.168\.|0\.)/.test(host)) return null;
      const match = host.match(/^172\.(\d+)\./);
      if (match && Number(match[1]) >= 16 && Number(match[1]) <= 31) return null;
      if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')) return null;
    }
    return url;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Server database configuration missing.' }, { status: 500 });
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const now = new Date().toISOString();
  const { data: due, error } = await supabase
    .from('content_history')
    .select('id, user_id, asset_id, keyword, blog_title, blog_content, meta_description, schema_json, social_posts, media_urls, deployment_targets, scheduled_for')
    .eq('deployment_status', 'queued')
    .eq('delivery_type', 'webhook')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
    .limit(25);
  if (error) return NextResponse.json({ error: 'Unable to read deployment queue.' }, { status: 500 });

  const results: Array<{ id: string; status: string; detail?: string }> = [];
  for (const item of due ?? []) {
    const { data: claimed } = await supabase.from('content_history').update({ deployment_status: 'processing', last_delivery_error: null }).eq('id', item.id).eq('deployment_status', 'queued').select('id').maybeSingle();
    if (!claimed) continue;
    try {
      const { data: asset } = item.asset_id ? await supabase.from('assets').select('webhook_url, domain_name').eq('id', item.asset_id).eq('user_id', item.user_id).maybeSingle() : { data: null };
      const mockMode = process.env.PUBLISH_MOCK_MODE === 'true';
      const endpoint = asset?.webhook_url ? safeWebhook(asset.webhook_url) : null;
      if (!mockMode && !endpoint) throw new Error('No safe HTTPS webhook is configured for this asset.');
      const delivery = { event: 'content.published', package_id: item.id, scheduled_for: item.scheduled_for, target_domain: asset?.domain_name ?? null, content: { keyword: item.keyword, title: item.blog_title, html: item.blog_content, meta_description: item.meta_description, schema_json: item.schema_json, social_posts: item.social_posts, media_urls: item.media_urls } };
      if (!mockMode && endpoint) {
        const body = JSON.stringify(delivery);
        const headers: Record<string, string> = { 'Content-Type': 'application/json', 'User-Agent': 'NexusAI-Publisher/1.0' };
        const signingSecret = process.env.WEBHOOK_SIGNING_SECRET;
        if (signingSecret) headers['X-NexusAI-Signature'] = createHmac('sha256', signingSecret).update(body).digest('hex');
        const response = await fetch(endpoint, { method: 'POST', headers, body, signal: AbortSignal.timeout(20_000), redirect: 'error' });
        if (!response.ok) throw new Error(`Target webhook returned ${response.status}.`);
      }
      await supabase.from('content_history').update({ deployment_status: 'published', published_at: new Date().toISOString(), last_delivery_error: null }).eq('id', item.id).eq('deployment_status', 'processing');
      results.push({ id: item.id, status: mockMode ? 'published_mock' : 'published' });
    } catch (deliveryError) {
      const detail = deliveryError instanceof Error ? deliveryError.message.slice(0, 500) : 'Unknown delivery failure';
      await supabase.from('content_history').update({ deployment_status: 'failed', last_delivery_error: detail }).eq('id', item.id).eq('deployment_status', 'processing');
      results.push({ id: item.id, status: 'failed', detail });
    }
  }
  return NextResponse.json({ processed: results.length, results, checked_at: now });
}

export const POST = GET;
