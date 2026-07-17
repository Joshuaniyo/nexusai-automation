import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';

function terms(value: string): Set<string> {
  return new Set(value.toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);
}

export async function POST(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const packageId = typeof body.packageId === 'string' ? body.packageId : '';
  const { data: current } = await supabase.from('content_history').select('id, keyword, blog_title, asset_id').eq('id', packageId).eq('user_id', user.id).maybeSingle();
  if (!current) return NextResponse.json({ error: 'Post package not found.' }, { status: 404 });

  let query = supabase.from('content_history').select('id, keyword, blog_title, asset_id, created_at').eq('user_id', user.id).neq('id', packageId).limit(50);
  if (current.asset_id) query = query.eq('asset_id', current.asset_id);
  const { data: previous } = await query;
  const currentTerms = terms(`${current.keyword} ${current.blog_title ?? ''}`);
  const suggestions = (previous ?? []).map((item) => {
    const title = item.blog_title || item.keyword;
    const overlap = Array.from(terms(`${item.keyword} ${title}`)).filter((term) => currentTerms.has(term));
    return { target_package_id: item.id, target_title: title, anchor_text: overlap.slice(0, 4).join(' ') || item.keyword, relevance_score: Math.min(100, 35 + overlap.length * 15) };
  }).sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 8);
  await supabase.from('content_history').update({ internal_link_suggestions: suggestions }).eq('id', packageId).eq('user_id', user.id);
  return NextResponse.json({ suggestions });
}
