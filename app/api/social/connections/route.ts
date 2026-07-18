import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data, error } = await supabase
    .from('social_connections')
    .select('id, platform, platform_account_name, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: 'Unable to load social connections.' }, { status: 500 });
  return NextResponse.json({ connections: data ?? [] });
}

export async function DELETE(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const platform = req.nextUrl.searchParams.get('platform');
  if (platform !== 'linkedin' && platform !== 'telegram') return NextResponse.json({ error: 'Invalid platform.' }, { status: 400 });
  const { error } = await supabase.from('social_connections').delete().eq('user_id', user.id).eq('platform', platform);
  if (error) return NextResponse.json({ error: 'Unable to disconnect platform.' }, { status: 500 });
  return NextResponse.json({ disconnected: platform });
}
