'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Globe, Link2, Loader2, Send, Unplug, Webhook } from 'lucide-react';
import { toast } from 'sonner';
import type { GenerationResult } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type DeliveryMode = 'webhook' | 'direct_social';
type SocialPlatform = 'linkedin' | 'telegram';

export function PublishContentModal({ result, open, onOpenChange }: { result: GenerationResult; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('webhook');
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialPlatform[]>([]);
  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>([]);
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch('/api/social/connections', { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : { connections: [] })
      .then((data) => setConnectedPlatforms((data.connections ?? []).map((item: { platform: SocialPlatform }) => item.platform)))
      .catch(() => setConnectedPlatforms([]));
  }, [open]);

  function togglePlatform(platform: SocialPlatform) {
    if (!connectedPlatforms.includes(platform)) return;
    setTargetPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  }

  async function queue() {
    setLoading(true);
    try {
      const targets = deliveryMode === 'webhook' ? ['asset_webhook'] : targetPlatforms;
      const response = await fetch('/api/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: result.package_id, scheduledFor, deliveryType: deliveryMode, targets }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scheduling failed.');
      toast.success(`Content queued for ${new Date(data.scheduled_for).toLocaleString()}.`);
      onOpenChange(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Scheduling failed.'); }
    finally { setLoading(false); }
  }

  const minimumDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);
  const directReady = deliveryMode !== 'direct_social' || targetPlatforms.length > 0;

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto border-slate-800 bg-slate-950 p-0 text-slate-100">
    <DialogHeader className="border-b border-slate-800 p-6"><DialogTitle className="flex items-center gap-2 text-lg"><Send className="h-5 w-5 text-cyan-400" />Publish / Sync Content</DialogTitle><p className="text-xs leading-5 text-slate-500">Choose one verified delivery path and schedule this coordinated package for background processing.</p></DialogHeader>
    <div className="space-y-4 p-6">
      <section onClick={() => setDeliveryMode('webhook')} className={`cursor-pointer rounded-2xl border p-5 transition ${deliveryMode === 'webhook' ? 'border-cyan-400/40 bg-cyan-400/5' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}`}>
        <div className="flex items-start gap-3"><input type="radio" checked={deliveryMode === 'webhook'} onChange={() => setDeliveryMode('webhook')} className="mt-1 accent-cyan-500" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Webhook className="h-4 w-4 text-cyan-300" /><h3 className="text-sm font-semibold text-white">Automated Webhook Trigger</h3></div><p className="mt-2 text-xs leading-5 text-slate-400">Synchronize the complete package to the HTTPS endpoint attached to its target asset. Webhook URLs are validated and signed by the background publisher.</p><Button asChild variant="outline" size="sm" className="mt-3" onClick={(event) => event.stopPropagation()}><Link href="/dashboard/assets"><Globe className="mr-2 h-3.5 w-3.5" />Manage HTTPS endpoints</Link></Button>{deliveryMode === 'webhook' && <div className="mt-4"><label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Webhook deployment time</label><Input type="datetime-local" value={scheduledFor} min={minimumDate} onChange={(event) => setScheduledFor(event.target.value)} onClick={(event) => event.stopPropagation()} className="border-slate-800 bg-slate-950" /></div>}</div></div>
      </section>

      <section onClick={() => setDeliveryMode('direct_social')} className={`cursor-pointer rounded-2xl border p-5 transition ${deliveryMode === 'direct_social' ? 'border-violet-400/40 bg-violet-400/5' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}`}>
        <div className="flex items-start gap-3"><input type="radio" checked={deliveryMode === 'direct_social'} onChange={() => setDeliveryMode('direct_social')} className="mt-1 accent-violet-500" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-violet-300" /><h3 className="text-sm font-semibold text-white">Direct Social Media Publishing / Automation Scheduler</h3></div><p className="mt-2 text-xs leading-5 text-slate-400">Queue approved social copy for connected first-party publishing destinations.</p>
        {deliveryMode === 'direct_social' && <div className="mt-4 space-y-3">{([['linkedin', 'LinkedIn Profile'], ['telegram', 'Telegram Channel Broadcast']] as const).map(([platform, label]) => { const connected = connectedPlatforms.includes(platform); return <div key={platform} className={`rounded-xl border p-3 ${connected ? 'border-slate-700 bg-slate-950/70' : 'border-slate-800 bg-slate-950/30'}`} onClick={(event) => event.stopPropagation()}><label className={`flex items-center gap-3 text-xs ${connected ? 'cursor-pointer text-slate-200' : 'cursor-not-allowed text-slate-600'}`}><input type="checkbox" checked={targetPlatforms.includes(platform)} disabled={!connected} onChange={() => togglePlatform(platform)} className="accent-violet-500" />{label}{connected && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />}</label>{!connected && <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-amber-300"><Unplug className="h-3 w-3" />{platform === 'linkedin' ? 'LinkedIn profile not found.' : 'Telegram channel not found.'}<Link href="/dashboard/social-integrations" className="text-cyan-400 hover:underline">Connect it in Social Integrations</Link></p>}</div>; })}<div><label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Social publishing time</label><Input type="datetime-local" value={scheduledFor} min={minimumDate} onChange={(event) => setScheduledFor(event.target.value)} onClick={(event) => event.stopPropagation()} className="border-slate-800 bg-slate-950" /></div></div>}
        </div></div>
      </section>
    </div>
    <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-900/50 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-[10px] text-slate-500"><CalendarClock className="h-3.5 w-3.5" />The queue requires a future date and an active delivery destination.</p><Button onClick={queue} disabled={loading || !scheduledFor || !directReady} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Queue content package</Button></div>
  </DialogContent></Dialog>;
}
