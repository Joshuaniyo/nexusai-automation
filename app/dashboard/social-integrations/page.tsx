'use client';

import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Bot, CheckCircle2, ExternalLink, Loader2, LockKeyhole, Mail, MessageCircle, Radio, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Platform = 'linkedin' | 'telegram';
type Connection = { id: string; platform: Platform; platform_account_name: string | null; metadata: Record<string, unknown>; created_at: string };

const upcoming = [
  ['Facebook', 'Coming Soon'], ['Instagram', 'Coming Soon'], ['X (Twitter)', 'Premium Upgrade'],
  ['Pinterest', 'Coming Soon'], ['YouTube', 'Premium Upgrade'], ['TikTok', 'Coming Soon'],
  ['Reddit', 'Coming Soon'], ['WhatsApp', 'Premium Upgrade'], ['Newsletter Signups', 'Coming Soon'],
] as const;

export default function SocialIntegrationsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<Platform | null>(null);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');

  const loadConnections = useCallback(async () => {
    try {
      const response = await fetch('/api/social/connections', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load connections.');
      setConnections(data.connections ?? []);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to load connections.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadConnections(); }, [loadConnections]);
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('linkedin');
    if (status === 'connected') toast.success('LinkedIn connected.');
    if (status === 'error') toast.error('LinkedIn authorization did not complete.');
  }, []);

  const connectionFor = (platform: Platform) => connections.find((item) => item.platform === platform);

  async function connectTelegram(event: React.FormEvent) {
    event.preventDefault(); setWorking('telegram');
    try {
      const response = await fetch('/api/social/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botToken, chatId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Telegram connection failed.');
      setBotToken(''); setChatId(''); toast.success(`Connected to ${data.accountName}.`); await loadConnections();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Telegram connection failed.'); }
    finally { setWorking(null); }
  }

  async function disconnect(platform: Platform) {
    setWorking(platform);
    try {
      const response = await fetch(`/api/social/connections?platform=${platform}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Disconnect failed.');
      setConnections((items) => items.filter((item) => item.platform !== platform)); toast.success(`${platform === 'linkedin' ? 'LinkedIn' : 'Telegram'} disconnected.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Disconnect failed.'); }
    finally { setWorking(null); }
  }

  const linkedIn = connectionFor('linkedin');
  const telegram = connectionFor('telegram');

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[hsl(220,16%,6%)] p-4 sm:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-7">
        <header className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400"><Radio className="h-3.5 w-3.5" />Distribution command center</p>
          <h1 className="text-2xl font-bold text-white">Social Integrations</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">Connect owned publishing destinations. Access credentials are encrypted on the server and never returned to this page.</p>
        </header>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div> : (
          <section className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-950 p-5">
              <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-500 p-3 text-white"><Share2 className="h-5 w-5" /></div><div><h2 className="font-semibold text-white">LinkedIn Profile</h2><p className="text-xs text-slate-400">OAuth publishing connection</p></div></div>{linkedIn && <span className="flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" />Connected</span>}</div>
              <p className="my-5 text-xs leading-5 text-slate-400">Authorize NexusAI to publish approved professional posts to your LinkedIn member profile.</p>
              {linkedIn ? <div className="flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3"><div><p className="text-xs font-medium text-white">{linkedIn.platform_account_name || 'LinkedIn member'}</p><p className="text-[10px] text-slate-500">Credentials stored securely</p></div><Button size="sm" variant="outline" onClick={() => disconnect('linkedin')} disabled={working !== null}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Disconnect</Button></div> : <Button asChild className="bg-blue-500 text-white hover:bg-blue-400"><a href="/api/social/linkedin/connect"><ExternalLink className="mr-2 h-4 w-4" />Connect LinkedIn</a></Button>}
            </article>

            <article className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-950 p-5">
              <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-500 p-3 text-slate-950"><Bot className="h-5 w-5" /></div><div><h2 className="font-semibold text-white">Telegram Channel Broadcast</h2><p className="text-xs text-slate-400">Bot API destination</p></div></div>{telegram && <span className="flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" />Connected</span>}</div>
              {telegram ? <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3"><div><p className="text-xs font-medium text-white">{telegram.platform_account_name || 'Telegram destination'}</p><p className="text-[10px] text-slate-500">Bot token encrypted</p></div><Button size="sm" variant="outline" onClick={() => disconnect('telegram')} disabled={working !== null}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Disconnect</Button></div> : <form onSubmit={connectTelegram} className="mt-5 grid gap-3 sm:grid-cols-2"><div><Label className="text-xs text-slate-300">Bot token</Label><Input type="password" autoComplete="off" value={botToken} onChange={(event) => setBotToken(event.target.value)} placeholder="123456789:AA..." className="mt-2 border-slate-800 bg-slate-950" required /></div><div><Label className="text-xs text-slate-300">Channel username or chat ID</Label><Input value={chatId} onChange={(event) => setChatId(event.target.value)} placeholder="@nexus_updates" className="mt-2 border-slate-800 bg-slate-950" required /></div><Button type="submit" disabled={working !== null} className="sm:col-span-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400">{working === 'telegram' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}Verify and connect</Button></form>}
            </article>
          </section>
        )}

        <section><div className="mb-4 flex items-end justify-between"><div><h2 className="font-semibold text-white">More channels</h2><p className="mt-1 text-xs text-slate-500">Additional first-party connectors are on the delivery roadmap.</p></div><span className="hidden items-center gap-1 text-[10px] text-slate-500 sm:flex"><LockKeyhole className="h-3 w-3" />Scoped credentials</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{upcoming.map(([name, badge]) => <article key={name} className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.025] p-4 opacity-60"><div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" /><div className="relative flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-medium text-slate-300">{name === 'Newsletter Signups' ? <Mail className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}{name}</span><span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-violet-200 shadow-[0_0_16px_rgba(167,139,250,0.12)]">{badge}</span></div></article>)}</div></section>
      </div>
    </div>
  );
}
