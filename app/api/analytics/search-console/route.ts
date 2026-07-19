import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';

type SearchRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const { supabase } = createSupabaseServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data: { session } } = await supabase.auth.getSession();
  const providerToken = session?.provider_token;
  if (!providerToken) return NextResponse.json({ connected: false, sites: [], rows: [] });

  const authorization = { Authorization: `Bearer ${providerToken}` };
  const sitesResponse = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers: authorization, cache: 'no-store' });
  if (sitesResponse.status === 401 || sitesResponse.status === 403) return NextResponse.json({ connected: false, reconnectRequired: true, sites: [], rows: [] });
  if (!sitesResponse.ok) return NextResponse.json({ error: `Search Console returned ${sitesResponse.status}.` }, { status: 502 });
  const sitesPayload = await sitesResponse.json() as { siteEntry?: Array<{ siteUrl: string; permissionLevel: string }> };
  const sites = sitesPayload.siteEntry ?? [];
  const requestedSite = req.nextUrl.searchParams.get('site');
  const selectedSite = sites.some((site) => site.siteUrl === requestedSite) ? requestedSite! : sites[0]?.siteUrl;
  if (!selectedSite) return NextResponse.json({ connected: true, sites, selectedSite: null, rows: [], metrics: { clicks: 0, impressions: 0, ctr: 0, position: 0 } });

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(selectedSite)}/searchAnalytics/query`;
  const requestAnalytics = (dimensions?: string[]) => fetch(endpoint, {
    method: 'POST', headers: { ...authorization, 'Content-Type': 'application/json' }, cache: 'no-store',
    body: JSON.stringify({ startDate: dateString(start), endDate: dateString(end), ...(dimensions ? { dimensions } : {}), rowLimit: dimensions ? 1000 : 1 }),
  });
  const [timelineResponse, aggregateResponse] = await Promise.all([requestAnalytics(['date']), requestAnalytics()]);
  if (timelineResponse.status === 401 || timelineResponse.status === 403 || aggregateResponse.status === 401 || aggregateResponse.status === 403) return NextResponse.json({ connected: false, reconnectRequired: true, sites: [], rows: [] });
  if (!timelineResponse.ok || !aggregateResponse.ok) return NextResponse.json({ error: 'Unable to load Search Console performance data.' }, { status: 502 });
  const timeline = await timelineResponse.json() as { rows?: SearchRow[] };
  const aggregate = await aggregateResponse.json() as { rows?: SearchRow[] };
  const summary = aggregate.rows?.[0] ?? {};
  return NextResponse.json({
    connected: true, sites, selectedSite,
    range: { startDate: dateString(start), endDate: dateString(end) },
    metrics: { clicks: summary.clicks ?? 0, impressions: summary.impressions ?? 0, ctr: summary.ctr ?? 0, position: summary.position ?? 0 },
    rows: (timeline.rows ?? []).map((row) => ({ date: row.keys?.[0] ?? '', clicks: row.clicks ?? 0, impressions: row.impressions ?? 0, ctr: row.ctr ?? 0, position: row.position ?? 0 })),
  });
}
