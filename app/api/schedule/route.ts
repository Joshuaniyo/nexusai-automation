import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const packageId = typeof body.packageId === 'string' ? body.packageId : '';
  const scheduled = new Date(body.scheduledFor);
  if (!packageId || Number.isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) return NextResponse.json({ error: 'Choose a valid future deployment time.' }, { status: 400 });
  const deliveryType = body.deliveryType === 'direct_social' ? 'direct_social' : 'webhook';
  const requestedTargets: string[] = Array.isArray(body.targets) ? body.targets.filter((item: unknown): item is string => typeof item === 'string') : [];
  let socialTargets: Array<'linkedin' | 'telegram'> = [];
  let deploymentTargets = ['asset_webhook'];
  if (deliveryType === 'direct_social') {
    const allowed = requestedTargets.filter((item: string): item is 'linkedin' | 'telegram' => item === 'linkedin' || item === 'telegram');
    const uniqueTargets: Array<'linkedin' | 'telegram'> = Array.from(new Set<'linkedin' | 'telegram'>(allowed));
    if (uniqueTargets.length === 0) return NextResponse.json({ error: 'Select at least one connected social platform.' }, { status: 400 });
    const { data: connections, error: connectionError } = await supabase.from('social_connections').select('platform').eq('user_id', user.id).in('platform', uniqueTargets);
    if (connectionError) return NextResponse.json({ error: 'Unable to verify social connections.' }, { status: 500 });
    const connected = new Set((connections ?? []).map((item) => item.platform));
    socialTargets = uniqueTargets.filter((platform) => connected.has(platform));
    if (socialTargets.length !== uniqueTargets.length) return NextResponse.json({ error: 'One or more selected social platforms are not connected.' }, { status: 400 });
    deploymentTargets = socialTargets;
  }
  const { data, error } = await supabase.from('content_history').update({ scheduled_for: scheduled.toISOString(), deployment_targets: deploymentTargets, delivery_type: deliveryType, target_social_platforms: socialTargets, deployment_status: 'queued' }).eq('id', packageId).eq('user_id', user.id).select('id, scheduled_for, deployment_status, delivery_type, target_social_platforms').maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Unable to queue this package.' }, { status: 500 });
  return NextResponse.json(data);
}
