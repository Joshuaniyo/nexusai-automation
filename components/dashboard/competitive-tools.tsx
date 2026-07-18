'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart3, CalendarClock, Link2, Loader2, SearchCheck, Send, Webhook } from 'lucide-react';
import { toast } from 'sonner';
import type { GenerationResult } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Audit = { sentiment_score?: number; direct_answerability_ratio?: number; citation_potential?: number; semantic_entities?: Array<{ name: string; type: string; relevance: number }>; recommendations?: string[] };
type LinkSuggestion = { target_package_id: string; target_title: string; anchor_text: string; relevance_score: number };
type DeliveryMode = 'webhook' | 'direct_social';
type SocialPlatform = 'linkedin' | 'telegram';

export function CompetitiveTools({ result }: { result: GenerationResult }) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [links, setLinks] = useState<LinkSuggestion[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [scheduledFor, setScheduledFor] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('webhook');
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialPlatform[]>([]);
  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>([]);

  useEffect(() => {
    fetch('/api/social/connections', { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : { connections: [] })
      .then((data) => setConnectedPlatforms((data.connections ?? []).map((item: { platform: SocialPlatform }) => item.platform)))
      .catch(() => setConnectedPlatforms([]));
  }, []);

  function togglePlatform(platform: SocialPlatform) {
    if (!connectedPlatforms.includes(platform)) return;
    setTargetPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  }

  async function callTool(kind: 'aeo' | 'links') {
    setLoading(kind);
    const endpoint = kind === 'aeo' ? '/api/agents/aeo-audit' : '/api/internal-links';
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: result.package_id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Tool failed.');
      if (kind === 'aeo') setAudit(data); else setLinks(data.suggestions ?? []);
      toast.success(kind === 'aeo' ? 'AEO/GEO audit completed.' : 'Internal-link architecture completed.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Tool failed.'); }
    finally { setLoading(null); }
  }

  async function schedule() {
    setLoading('schedule');
    try {
      const targets = deliveryMode === 'webhook' ? ['asset_webhook'] : targetPlatforms;
      const response = await fetch('/api/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: result.package_id, scheduledFor, deliveryType: deliveryMode, targets }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scheduling failed.');
      toast.success(`Queued for ${new Date(data.scheduled_for).toLocaleString()}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Scheduling failed.'); }
    finally { setLoading(null); }
  }

  return (
    <section className="mx-5 mb-6 grid gap-4 xl:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-xs font-semibold text-white"><SearchCheck className="h-4 w-4 text-cyan-400" />AEO & GEO Audit</h3><Button size="sm" variant="outline" onClick={() => callTool('aeo')} disabled={loading !== null}>{loading === 'aeo' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Run audit</Button></div>
        {audit ? <><div className="grid grid-cols-3 gap-2">{[['Sentiment', audit.sentiment_score], ['Answerability', audit.direct_answerability_ratio], ['Citation', audit.citation_potential]].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-slate-950 p-2 text-center"><p className="text-lg font-bold text-cyan-300">{String(value ?? '–')}</p><p className="text-[9px] text-slate-500">{label}</p></div>)}</div><div className="mt-3 flex flex-wrap gap-1">{(audit.semantic_entities ?? []).slice(0, 8).map((entity) => <span key={`${entity.name}-${entity.type}`} className="rounded-full border border-cyan-400/20 px-2 py-1 text-[10px] text-cyan-200">{entity.name}</span>)}</div></> : <p className="text-xs leading-5 text-slate-500">Measures answerability, citation potential, sentiment and semantic entity coverage. Scores are content assessments, not guaranteed rankings.</p>}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-xs font-semibold text-white"><Link2 className="h-4 w-4 text-violet-400" />Internal Link Architect</h3><Button size="sm" variant="outline" onClick={() => callTool('links')} disabled={loading !== null}>{loading === 'links' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}Find links</Button></div>
        {links.length ? <div className="space-y-2">{links.slice(0, 5).map((link) => <div key={link.target_package_id} className="rounded-lg bg-slate-950 p-2"><p className="truncate text-[11px] font-medium text-white">{link.target_title}</p><p className="text-[10px] text-violet-300">Anchor: “{link.anchor_text}” · {link.relevance_score}%</p></div>)}</div> : <p className="text-xs leading-5 text-slate-500">Finds contextual anchors among previous articles belonging to the same connected asset.</p>}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-white"><CalendarClock className="h-4 w-4 text-emerald-400" />Deployment Queue</h3>
        <div className="mb-3 grid grid-cols-2 rounded-lg border border-slate-800 bg-slate-950 p-1">
          <button type="button" onClick={() => setDeliveryMode('webhook')} className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[10px] font-medium transition ${deliveryMode === 'webhook' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Webhook className="h-3.5 w-3.5" />Standard Webhook</button>
          <button type="button" onClick={() => setDeliveryMode('direct_social')} className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[10px] font-medium transition ${deliveryMode === 'direct_social' ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-500 hover:text-slate-300'}`}><Send className="h-3.5 w-3.5" />Direct Social Post</button>
        </div>
        {deliveryMode === 'direct_social' && <div className="mb-3 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3">{([['linkedin', 'Post to LinkedIn Profile'], ['telegram', 'Broadcast to Telegram Channel']] as const).map(([platform, label]) => { const connected = connectedPlatforms.includes(platform); return <label key={platform} className={`flex items-center gap-2 text-[11px] ${connected ? 'cursor-pointer text-slate-300' : 'cursor-not-allowed text-slate-600'}`}><input type="checkbox" checked={targetPlatforms.includes(platform)} disabled={!connected} onChange={() => togglePlatform(platform)} className="h-3.5 w-3.5 accent-cyan-500" />{label}<span className="ml-auto text-[9px]">{connected ? 'Connected' : 'Not connected'}</span></label>; })}<Link href="/dashboard/social-integrations" className="block pt-1 text-[10px] text-cyan-400 hover:text-cyan-300">Manage social connections →</Link></div>}
        <Input type="datetime-local" value={scheduledFor} min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} onChange={(event) => setScheduledFor(event.target.value)} className="border-slate-800 bg-slate-950 text-xs" />
        <Button onClick={schedule} disabled={!scheduledFor || loading !== null || (deliveryMode === 'direct_social' && targetPlatforms.length === 0)} className="mt-3 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400">{loading === 'schedule' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}Queue package</Button>
        <p className="mt-2 text-[10px] leading-4 text-slate-500">Stores the selected delivery mode and verified targets for secure background processing.</p>
      </div>
    </section>
  );
}
