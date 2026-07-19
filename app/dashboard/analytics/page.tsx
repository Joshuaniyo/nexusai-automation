'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, ExternalLink, Eye, Loader2, MousePointerClick, Percent, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Site = { siteUrl: string; permissionLevel: string };
type Row = { date: string; clicks: number; impressions: number; ctr: number; position: number };
type AnalyticsData = { connected: boolean; reconnectRequired?: boolean; sites: Site[]; selectedSite?: string | null; range?: { startDate: string; endDate: string }; metrics?: { clicks: number; impressions: number; ctr: number; position: number }; rows: Row[] };

function Sparkline({ rows }: { rows: Row[] }) {
  const points = useMemo(() => {
    if (!rows.length) return '';
    const maximum = Math.max(...rows.map((row) => row.clicks), 1);
    return rows.map((row, index) => `${(index / Math.max(rows.length - 1, 1)) * 100},${46 - (row.clicks / maximum) * 40}`).join(' ');
  }, [rows]);
  return <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="h-64 w-full" role="img" aria-label="Daily Google Search clicks"><defs><linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0" /></linearGradient></defs><path d={`M 0 50 L ${points.replaceAll(' ', ' L ')} L 100 50 Z`} fill="url(#analytics-fill)" /><polyline points={points} fill="none" stroke="#22d3ee" strokeWidth="1.2" vectorEffect="non-scaling-stroke" /></svg>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (site?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/search-console${site ? `?site=${encodeURIComponent(site)}` : ''}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load analytics.');
      setData(payload);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to load analytics.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const metrics = data?.metrics ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const cards = [
    { label: 'Total Clicks', value: Math.round(metrics.clicks).toLocaleString(), icon: MousePointerClick, color: 'text-cyan-300' },
    { label: 'Total Impressions', value: Math.round(metrics.impressions).toLocaleString(), icon: Eye, color: 'text-blue-300' },
    { label: 'Average CTR', value: `${(metrics.ctr * 100).toFixed(2)}%`, icon: Percent, color: 'text-violet-300' },
    { label: 'Average Position', value: metrics.position ? metrics.position.toFixed(1) : '—', icon: TrendingUp, color: 'text-emerald-300' },
  ];

  return <div className="min-h-0 flex-1 overflow-y-auto bg-[hsl(220,16%,6%)] p-4 sm:p-6"><div className="mx-auto w-full max-w-7xl space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400"><Activity className="h-3.5 w-3.5" />Live search intelligence</p><h1 className="mt-2 text-2xl font-bold text-white">Site Analytics</h1><p className="mt-1 text-sm text-slate-500">Verified Google Search Console performance for the most recent 28 complete days.</p></div>{data?.connected && <Button asChild variant="outline"><a href="/api/auth/google-console"><ExternalLink className="mr-2 h-4 w-4" />Reconnect</a></Button>}</header>

    {loading ? <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60"><Loader2 className="h-7 w-7 animate-spin text-cyan-400" /></div> : !data?.connected ? <section className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/15 via-slate-900 to-slate-950 p-8 text-center sm:p-14"><div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" /><div className="relative"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10"><Search className="h-6 w-6 text-blue-300" /></div><h2 className="mt-5 text-xl font-bold text-white">Connect Google Search Console</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">Authorize read-only access to display your verified clicks, impressions, CTR, average position, and daily performance history. NexusAI cannot modify your Search Console properties.</p><Button asChild className="mt-6 bg-blue-500 text-white hover:bg-blue-400"><a href="/api/auth/google-console"><ExternalLink className="mr-2 h-4 w-4" />Connect Google Search Console</a></Button>{data?.reconnectRequired && <p className="mt-3 text-xs text-amber-300">Your previous Google authorization expired or no longer includes Search Console access.</p>}</div></section> : <>
      <section className="flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><div><p className="text-sm font-semibold text-white">Search Console connected</p><p className="text-[11px] text-slate-500">Read-only property access · {data.range?.startDate} to {data.range?.endDate}</p></div></div><select value={data.selectedSite ?? ''} onChange={(event) => void load(event.target.value)} className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-200">{data.sites.map((site) => <option key={site.siteUrl} value={site.siteUrl}>{site.siteUrl}</option>)}</select></section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, color }) => <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><div className="flex items-center justify-between"><p className="text-xs text-slate-500">{label}</p><Icon className={`h-4 w-4 ${color}`} /></div><p className="mt-4 text-3xl font-bold text-white">{value}</p></article>)}</section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-sm font-semibold text-white"><BarChart3 className="h-4 w-4 text-cyan-400" />Organic click history</h2><p className="mt-1 text-[11px] text-slate-500">Daily clicks reported by Google Search Console.</p></div></div>{data.rows.length ? <><Sparkline rows={data.rows} /><div className="mt-3 flex justify-between text-[10px] text-slate-600"><span>{data.rows[0]?.date}</span><span>{data.rows[data.rows.length - 1]?.date}</span></div></> : <div className="flex h-64 items-center justify-center text-center text-sm text-slate-500">No Search Analytics rows were returned for this property and date range.</div>}</section>
    </>}
  </div></div>;
}
