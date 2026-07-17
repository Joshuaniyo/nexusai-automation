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
  const targets = Array.isArray(body.targets) ? body.targets.filter((item: unknown): item is string => typeof item === 'string').slice(0, 8) : [];
  const { data, error } = await supabase.from('content_history').update({ scheduled_for: scheduled.toISOString(), deployment_targets: targets, deployment_status: 'queued' }).eq('id', packageId).eq('user_id', user.id).select('id, scheduled_for, deployment_status').maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Unable to queue this package.' }, { status: 500 });
  return NextResponse.json(data);
}
