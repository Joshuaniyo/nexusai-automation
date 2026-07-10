'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import type { Asset } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, Plus, MoreHorizontal, Pencil, Trash2, Webhook, AlertCircle, CheckCircle2, Pause, Play, Loader2, AlertTriangle, Crown, ArrowRight } from 'lucide-react';
import { useCheckout } from '@/hooks/use-checkout';

const CMS_TYPES = ['WordPress', 'Webflow', 'Shopify', 'Ghost', 'Contentful', 'Strapi', 'Sanity', 'HubSpot CMS', 'Squarespace', 'Wix', 'Custom'];
const CMS_COLORS: Record<string, string> = {
  WordPress: 'hsla(217,91%,60%,0.1)',
  Webflow: 'hsla(199,89%,48%,0.1)',
  Shopify: 'hsla(160,84%,39%,0.1)',
  Ghost: 'hsla(215,16%,47%,0.1)',
  Contentful: 'hsla(199,89%,48%,0.1)',
  Strapi: 'hsla(245,58%,51%,0.1)',
  Sanity: 'hsla(0,72%,51%,0.1)',
};

const MAX_FREE_ASSETS = 3;

export default function AssetsPage() {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const { loading: checkoutLoading, startCheckout } = useCheckout();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState({ domain_name: '', cms_type: '', webhook_url: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from('assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setAssets(data as Asset[]);
    setLoading(false);
  }

  useEffect(() => { if (user) load(); }, [user]);

  function openAdd() {
    if (!isPremium && assets.length >= MAX_FREE_ASSETS) {
      setErr(`Free tier limited to ${MAX_FREE_ASSETS} assets. Upgrade to Premium for unlimited assets.`);
      return;
    }
    setEditing(null);
    setForm({ domain_name: '', cms_type: '', webhook_url: '' });
    setErr(null);
    setOpen(true);
  }

  function openEdit(a: Asset) {
    setEditing(a);
    setForm({ domain_name: a.domain_name, cms_type: a.cms_type, webhook_url: a.webhook_url ?? '' });
    setErr(null);
    setOpen(true);
  }

  async function save() {
    if (!user) return;
    if (!form.domain_name.trim() || !form.cms_type) {
      setErr('Domain name and CMS type are required.');
      return;
    }
    setSaving(true);
    setErr(null);
    const payload = {
      domain_name: form.domain_name.trim(),
      cms_type: form.cms_type,
      webhook_url: form.webhook_url.trim() || null,
      user_id: user.id
    };
    if (editing) {
      const { error } = await supabase.from('assets').update(payload).eq('id', editing.id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('assets').insert({ ...payload, status: 'active' });
      if (error) { setErr(error.message); setSaving(false); return; }
    }
    setSaving(false);
    setOpen(false);
    load();
  }

  async function toggleStatus(a: Asset) {
    await supabase.from('assets').update({ status: a.status === 'active' ? 'paused' : 'active' }).eq('id', a.id);
    load();
  }

  async function del(id: string) {
    await supabase.from('assets').delete().eq('id', id);
    load();
  }

  const assetsRemaining = isPremium ? Infinity : Math.max(0, MAX_FREE_ASSETS - assets.length);

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'hsl(220,16%,6%)' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '14px 24px', borderBottom: '1px solid hsl(220,14%,16%)', backgroundColor: 'hsla(220,16%,6%,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 14, fontWeight: 700, color: 'hsl(210,20%,95%)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Globe style={{ width: 16, height: 16, color: 'hsl(199,89%,65%)' }} /> Asset Manager
          </h1>
          <p style={{ fontSize: 11, color: 'hsl(215,16%,47%)', margin: '2px 0 0 0' }}>
            {assets.length} client site{assets.length !== 1 ? 's' : ''} configured
            {!isPremium && ` (${assetsRemaining} remaining on Free tier)`}
          </p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(90deg, hsl(199,89%,48%), hsl(217,91%,60%))', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Plus style={{ width: 13, height: 13 }} /> Add Asset
        </button>
      </div>

      {/* Upgrade banner for free users at limit */}
      {!isPremium && assets.length >= MAX_FREE_ASSETS && (
        <div style={{ margin: 16, padding: '12px 16px', borderRadius: 10, backgroundColor: 'hsla(38,92%,50%,0.1)', border: '1px solid hsla(38,92%,50%,0.25)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: 'hsla(38,92%,50%,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle style={{ width: 18, height: 18, color: 'hsl(38,92%,60%)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(38,92%,65%)', margin: '0 0 2px 0' }}>Asset Limit Reached</p>
            <p style={{ fontSize: 11, color: 'hsl(215,16%,60%)', margin: 0 }}>You&apos;ve reached the {MAX_FREE_ASSETS} asset limit. Upgrade to Premium for unlimited assets.</p>
          </div>
          <Button size="sm" onClick={() => startCheckout()} disabled={checkoutLoading} className="bg-orange-500 hover:bg-orange-600 text-white h-7">
            {checkoutLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Crown className="w-3 h-3 mr-1.5" /> Upgrade
              </>
            )}
          </Button>
        </div>
      )}

      <div style={{ padding: 24 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 style={{ width: 24, height: 24, color: 'hsl(199,89%,65%)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : assets.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe style={{ width: 24, height: 24, color: 'hsl(215,16%,30%)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: '0 0 4px 0' }}>No assets yet</p>
              <p style={{ fontSize: 12, color: 'hsl(215,16%,47%)', margin: 0 }}>Add client websites to target AI-generated content</p>
            </div>
            <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, backgroundColor: 'transparent', border: '1px solid hsla(199,89%,48%,0.35)', color: 'hsl(199,89%,65%)', fontSize: 12, cursor: 'pointer' }}>
              <Plus style={{ width: 12, height: 12 }} /> Add your first asset
            </button>
          </div>
        ) : (
          <div style={{ borderRadius: 12, border: '1px solid hsl(220,14%,16%)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'hsla(220,14%,14%,0.7)', borderBottom: '1px solid hsl(220,14%,16%)' }}>
                  {['Domain', 'CMS', 'Webhook URL', 'Status', 'Added', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, i) => (
                  <tr key={asset.id} style={{ borderBottom: i < assets.length - 1 ? '1px solid hsla(220,14%,16%,0.6)' : 'none', transition: 'background 0.1s' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Globe style={{ width: 13, height: 13, color: 'hsl(215,16%,50%)' }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'hsl(210,20%,95%)' }}>{asset.domain_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5, backgroundColor: CMS_COLORS[asset.cms_type] ?? 'hsla(215,16%,47%,0.1)', color: 'hsl(210,20%,80%)', border: '1px solid hsla(215,16%,47%,0.2)' }}>
                        {asset.cms_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 240 }}>
                      {asset.webhook_url ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Webhook style={{ width: 12, height: 12, color: 'hsl(199,89%,65%)', flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: 'hsl(215,16%,60%)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.webhook_url}</span>
                        </div>
                      ) : <span style={{ fontSize: 11, color: 'hsl(215,16%,35%)', fontStyle: 'italic' }}>Not set</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, backgroundColor: asset.status === 'active' ? 'hsla(160,84%,39%,0.1)' : 'hsla(38,92%,50%,0.1)', color: asset.status === 'active' ? 'hsl(160,84%,55%)' : 'hsl(38,92%,60%)', border: `1px solid ${asset.status === 'active' ? 'hsla(160,84%,39%,0.25)' : 'hsla(38,92%,50%,0.25)'}` }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: asset.status === 'active' ? 'hsl(160,84%,55%)' : 'hsl(38,92%,60%)' }} />
                        {asset.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, color: 'hsl(215,16%,47%)' }}>
                        {new Date(asset.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" style={{ color: 'hsl(215,16%,47%)' }}>
                            <MoreHorizontal style={{ width: 15, height: 15 }} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" style={{ backgroundColor: 'hsl(220,16%,9%)', border: '1px solid hsl(220,14%,20%)', minWidth: 160 }}>
                          <DropdownMenuItem onClick={() => openEdit(asset)} style={{ fontSize: 13, cursor: 'pointer', gap: 8 }}><Pencil style={{ width: 13, height: 13 }} /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(asset)} style={{ fontSize: 13, cursor: 'pointer', gap: 8 }}>
                            {asset.status === 'active' ? <><Pause style={{ width: 13, height: 13 }} />Pause</> : <><Play style={{ width: 13, height: 13 }} />Activate</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => del(asset.id)} style={{ fontSize: 13, cursor: 'pointer', gap: 8, color: 'hsl(0,72%,65%)' }}>
                            <Trash2 style={{ width: 13, height: 13 }} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ backgroundColor: 'hsl(220,16%,9%)', border: '1px solid hsl(220,14%,20%)', maxWidth: 460 }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: 14, fontWeight: 700, color: 'hsl(210,20%,95%)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe style={{ width: 16, height: 16, color: 'hsl(199,89%,65%)' }} />
              {editing ? 'Edit Asset' : 'Add Client Asset'}
            </DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
            {err && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'hsl(0,72%,65%)', backgroundColor: 'hsla(0,72%,51%,0.1)', border: '1px solid hsla(0,72%,51%,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                <AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} />{err}
              </div>
            )}
            <div>
              <Label style={{ fontSize: 12, fontWeight: 600, color: 'hsl(210,20%,95%)', marginBottom: 6, display: 'block' }}>Domain Name *</Label>
              <Input value={form.domain_name} onChange={(e) => setForm((f) => ({ ...f, domain_name: e.target.value }))} placeholder="example.com" style={{ backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', color: 'hsl(210,20%,95%)', fontSize: 13, height: 36 }} />
            </div>
            <div>
              <Label style={{ fontSize: 12, fontWeight: 600, color: 'hsl(210,20%,95%)', marginBottom: 6, display: 'block' }}>CMS Type *</Label>
              <Select value={form.cms_type} onValueChange={(v) => setForm((f) => ({ ...f, cms_type: v }))}>
                <SelectTrigger style={{ backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', color: 'hsl(210,20%,95%)', fontSize: 13, height: 36 }}>
                  <SelectValue placeholder="Select CMS..." />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'hsl(220,16%,9%)', border: '1px solid hsl(220,14%,20%)' }}>
                  {CMS_TYPES.map((c) => <SelectItem key={c} value={c} style={{ fontSize: 13 }}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ fontSize: 12, fontWeight: 600, color: 'hsl(210,20%,95%)', marginBottom: 6, display: 'block' }}>Webhook URL <span style={{ fontWeight: 400, color: 'hsl(215,16%,47%)' }}>(optional)</span></Label>
              <Input value={form.webhook_url} onChange={(e) => setForm((f) => ({ ...f, webhook_url: e.target.value }))} placeholder="https://api.example.com/webhook" style={{ backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', color: 'hsl(210,20%,95%)', fontSize: 12, height: 36, fontFamily: 'monospace' }} />
            </div>
          </div>
          <DialogFooter style={{ gap: 8, marginTop: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} style={{ fontSize: 12, borderColor: 'hsl(220,14%,20%)', color: 'hsl(215,16%,60%)' }}>Cancel</Button>
            <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(90deg, hsl(199,89%,48%), hsl(217,91%,60%))', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 style={{ width: 13, height: 13 }} />}
              {editing ? 'Save Changes' : 'Add Asset'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
