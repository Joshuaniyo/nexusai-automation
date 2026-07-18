'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Globe, Loader2, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import type { Asset } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AssetsPage() {
  const { user, isPremium } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [domain, setDomain] = useState('');
  const [cmsType, setCmsType] = useState('WordPress');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [consoleSites, setConsoleSites] = useState<Array<{ siteUrl: string; permissionLevel: string }>>([]);
  const [consoleConnected, setConsoleConnected] = useState(false);
  const [checkingConsole, setCheckingConsole] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) toast.error(error.message); else setAssets((data ?? []) as Asset[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch('/api/auth/google-console?action=status').then(async (response) => response.ok ? response.json() : { connected: false, sites: [] }).then((data) => { setConsoleConnected(Boolean(data.connected)); setConsoleSites(data.sites ?? []); }).finally(() => setCheckingConsole(false));
  }, []);

  async function addAsset(event: React.FormEvent) {
    event.preventDefault();
    if (!user || (!isPremium && assets.length >= 3)) return toast.error('Free plans can connect up to three assets.');
    setSaving(true);
    try {
      const normalizedDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalizedDomain)) throw new Error('Enter a valid domain name.');
      if (webhookUrl && !/^https:\/\//i.test(webhookUrl)) throw new Error('Webhook URLs must use HTTPS.');
      const { error } = await supabase.from('assets').insert({ domain_name: normalizedDomain, cms_type: cmsType, webhook_url: webhookUrl.trim() || null, status: 'active', user_id: user.id });
      if (error) throw error;
      setDomain(''); setWebhookUrl('');
      toast.success('Asset connected.');
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to add asset.'); }
    finally { setSaving(false); }
  }

  async function removeAsset(id: string) {
    const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user?.id);
    if (error) toast.error(error.message); else { setAssets((items) => items.filter((item) => item.id !== id)); toast.success('Asset removed.'); }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[hsl(220,16%,6%)] p-4 sm:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="flex items-center gap-2 text-xl font-bold text-white"><Globe className="h-5 w-5 text-cyan-400" />Asset & Search Performance</h1><p className="mt-1 text-xs text-slate-500">Connect sites, delivery webhooks, and future Search Console reporting.</p></div>
          <Button asChild className="w-fit bg-blue-500 text-white hover:bg-blue-400"><a href="/api/auth/google-console"><ExternalLink className="mr-2 h-4 w-4" />{consoleConnected ? 'Reconnect Google Search Console' : 'Connect Google Search Console'}</a></Button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 p-4">
          {checkingConsole ? <p className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Checking Search Console authorization...</p> : consoleConnected ? <div><p className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" />Search Console connected</p><p className="mt-1 text-xs text-slate-400">{consoleSites.length} verified or delegated site properties available.</p></div> : <div><p className="text-sm font-semibold text-white">Unlock live search performance</p><p className="mt-1 text-xs leading-5 text-slate-400">Authorize read-only Search Console access to replace empty metrics with verified clicks, impressions, positions, and property permissions.</p></div>}
        </div>

        <form onSubmit={addAsset} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-4 md:items-end">
          <div><Label className="text-xs text-slate-300">Domain</Label><Input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.com" className="mt-2 border-slate-800 bg-slate-950" required /></div>
          <div><Label className="text-xs text-slate-300">CMS</Label><select value={cmsType} onChange={(event) => setCmsType(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white"><option>WordPress</option><option>Webflow</option><option>Shopify</option><option>Ghost</option><option>Custom</option></select></div>
          <div><Label className="text-xs text-slate-300">HTTPS webhook</Label><Input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://example.com/api/publish" className="mt-2 border-slate-800 bg-slate-950" /></div>
          <Button type="submit" disabled={saving || !domain} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Connect asset</Button>
        </form>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div> : assets.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center"><Search className="mx-auto mb-3 h-7 w-7 text-slate-600" /><p className="text-sm font-semibold text-white">No assets connected</p><p className="mt-1 text-xs text-slate-500">Add a site above to target content and delivery.</p></div> : <div className="grid gap-4 xl:grid-cols-2">{assets.map((asset) => { const property = consoleSites.find((site) => site.siteUrl.includes(asset.domain_name)); return <article key={asset.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold text-white">{asset.domain_name}</h2><p className="text-[11px] text-slate-500">{asset.cms_type} · {asset.status}</p></div><button onClick={() => removeAsset(asset.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-400/10 hover:text-red-400" aria-label={`Remove ${asset.domain_name}`}><Trash2 className="h-4 w-4" /></button></div><div className="my-4 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3">{property ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-slate-600" />}<div><p className="text-[11px] font-medium text-slate-200">Google property: {property ? 'verified' : 'not found'}</p><p className="text-[10px] text-slate-500">{property ? property.permissionLevel : 'Connect or grant access to this property.'}</p></div></div><div className="grid grid-cols-3 gap-2">{['Clicks', 'Impressions', 'Avg. position'].map((label) => <div key={label} className="rounded-lg bg-slate-950 p-2"><p className="text-base font-bold text-slate-600">—</p><p className="text-[9px] text-slate-500">{label}</p></div>)}</div></article>; })}</div>}
      </div>
    </div>
  );
}
