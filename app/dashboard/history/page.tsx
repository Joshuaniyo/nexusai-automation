'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import type { ContentHistory, Asset } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Search, FileText, Globe, Calendar, Crown, Eye, Trash2, Code2, Hash, Share2, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { sanitizeHtml } from '@/lib/security';

function Ago({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  return <span>{m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : h < 24 ? `${h}h ago` : `${d}d ago`}</span>;
}

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  async function go() { await navigator.clipboard.writeText(text); setC(true); setTimeout(() => setC(false), 2000); }
  return (
    <button onClick={go} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 11, color: 'hsl(215,16%,60%)' }}>
      {c ? <Check style={{ width: 10, height: 10, color: 'hsl(160,84%,55%)' }} /> : <Copy style={{ width: 10, height: 10 }} />}
      {c ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentHistory[]>([]);
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContentHistory | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [h, a] = await Promise.all([
      supabase.from('content_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('assets').select('*').eq('user_id', user.id),
    ]);
    if (h.data) setItems(h.data as ContentHistory[]);
    if (a.data) { const m: Record<string, Asset> = {}; (a.data as Asset[]).forEach((x) => { m[x.id] = x; }); setAssetMap(m); }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) load(); }, [load, user]);

  async function del(id: string) {
    await supabase.from('content_history').delete().eq('id', id);
    setItems((p) => p.filter((i) => i.id !== id));
    if (selected?.id === id) setOpen(false);
  }

  const filtered = items.filter((i) => !search || i.keyword.toLowerCase().includes(search.toLowerCase()) || (i.blog_title ?? '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'hsl(220,16%,6%)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '14px 24px', borderBottom: '1px solid hsl(220,14%,16%)', backgroundColor: 'hsla(220,16%,6%,0.9)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 14, fontWeight: 700, color: 'hsl(210,20%,95%)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <History style={{ width: 16, height: 16, color: 'hsl(199,89%,65%)' }} /> Content History
            </h1>
            <p style={{ fontSize: 11, color: 'hsl(215,16%,47%)', margin: '2px 0 0 0' }}>{items.length} generation{items.length !== 1 ? 's' : ''} logged</p>
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7, backgroundColor: 'transparent', border: '1px solid hsl(220,14%,20%)', color: 'hsl(215,16%,60%)', fontSize: 12, cursor: 'pointer' }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'hsl(215,16%,47%)' }} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by keyword or title..." style={{ paddingLeft: 32, backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', color: 'hsl(210,20%,95%)', fontSize: 13, height: 36 }} />
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 style={{ width: 24, height: 24, color: 'hsl(199,89%,65%)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History style={{ width: 24, height: 24, color: 'hsl(215,16%,30%)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: 0 }}>{search ? 'No results found' : 'No content generated yet'}</p>
            <p style={{ fontSize: 12, color: 'hsl(215,16%,47%)', margin: 0 }}>{search ? `No entries match "${search}"` : 'Generate your first piece of content from the Dashboard'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((item) => {
              const asset = item.asset_id ? assetMap[item.asset_id] : null;
              return (
                <div key={item.id} className="group" style={{ borderRadius: 10, border: '1px solid hsl(220,14%,16%)', backgroundColor: 'hsl(220,16%,9%)', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText style={{ width: 14, height: 14, color: 'hsl(199,89%,65%)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.blog_title ?? item.keyword}</p>
                        <p style={{ fontSize: 11, color: 'hsl(215,16%,47%)', margin: 0 }}>Keyword: <span style={{ color: 'hsl(199,89%,65%)', fontWeight: 500 }}>{item.keyword}</span></p>
                      </div>
                      <Badge variant="outline" style={{ fontSize: 10, height: 16, padding: '0 5px', flexShrink: 0, borderColor: item.tier === 'premium' ? 'hsla(38,92%,50%,0.35)' : 'hsl(220,14%,20%)', color: item.tier === 'premium' ? 'hsl(38,92%,60%)' : 'hsl(215,16%,47%)', backgroundColor: item.tier === 'premium' ? 'hsla(38,92%,50%,0.1)' : 'transparent' }}>
                        {item.tier === 'premium' ? <><Crown style={{ width: 8, height: 8, marginRight: 2, display: 'inline' }} />Premium</> : 'Free'}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'hsl(215,16%,47%)' }}><Calendar style={{ width: 11, height: 11 }} /><Ago date={item.created_at} /></span>
                      {asset && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'hsl(215,16%,47%)' }}><Globe style={{ width: 11, height: 11 }} />{asset.domain_name}</span>}
                      {item.keywords_list && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'hsl(215,16%,47%)' }}><Hash style={{ width: 11, height: 11 }} />{item.keywords_list.length} keywords</span>}
                    </div>
                    {item.meta_description && <p style={{ fontSize: 11, color: 'hsl(215,16%,40%)', margin: '6px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.meta_description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button onClick={() => { setSelected(item); setOpen(true); }} style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(215,16%,50%)' }}>
                      <Eye style={{ width: 14, height: 14 }} />
                    </button>
                    <button onClick={() => del(item.id)} style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(215,16%,50%)' }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden" style={{ backgroundColor: 'hsl(220,16%,9%)', border: '1px solid hsl(220,14%,20%)', maxWidth: 640, display: 'flex', flexDirection: 'column', padding: 0 }}>
          <DialogHeader style={{ padding: '16px 20px', borderBottom: '1px solid hsl(220,14%,16%)', flexShrink: 0 }}>
            <DialogTitle style={{ fontSize: 13, fontWeight: 700, color: 'hsl(210,20%,95%)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText style={{ width: 14, height: 14, color: 'hsl(199,89%,65%)' }} />
              {selected?.blog_title ?? selected?.keyword}
            </DialogTitle>
            {selected && <p style={{ fontSize: 11, color: 'hsl(215,16%,47%)', margin: '4px 0 0 0' }}>{new Date(selected.created_at).toLocaleString()}</p>}
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="seo" className="min-h-0" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '10px 20px 0', borderBottom: '1px solid hsl(220,14%,16%)', flexShrink: 0 }}>
                <TabsList style={{ backgroundColor: 'hsl(220,14%,12%)', border: '1px solid hsl(220,14%,20%)', height: 32 }}>
                  <TabsTrigger value="seo" style={{ fontSize: 12, height: 26 }} className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"><Search style={{ width: 11, height: 11, marginRight: 4 }} />SEO</TabsTrigger>
                  <TabsTrigger value="schema" style={{ fontSize: 12, height: 26 }} className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"><Code2 style={{ width: 11, height: 11, marginRight: 4 }} />Schema</TabsTrigger>
                  <TabsTrigger value="social" style={{ fontSize: 12, height: 26 }} className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400"><Share2 style={{ width: 11, height: 11, marginRight: 4 }} />Social</TabsTrigger>
                </TabsList>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <TabsContent value="seo" style={{ padding: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Meta Description</p>
                      {selected.meta_description && <CopyBtn text={selected.meta_description} />}
                    </div>
                    <div style={{ fontSize: 13, color: 'hsl(215,16%,60%)', backgroundColor: 'hsl(220,14%,12%)', borderRadius: 8, padding: '10px 14px', border: '1px solid hsl(220,14%,20%)' }}>{selected.meta_description ?? 'N/A'}</div>
                  </div>
                  <Separator style={{ backgroundColor: 'hsl(220,14%,16%)' }} />
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Keywords</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(selected.keywords_list ?? []).map((kw) => <Badge key={kw} variant="outline" style={{ fontSize: 11, borderColor: 'hsla(199,89%,48%,0.25)', color: 'hsl(199,89%,70%)', backgroundColor: 'hsla(199,89%,48%,0.05)' }}>{kw}</Badge>)}
                    </div>
                  </div>
                  <Separator style={{ backgroundColor: 'hsl(220,14%,16%)' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Blog Content</p>
                      {selected.blog_content && <CopyBtn text={selected.blog_content} />}
                    </div>
                    <div className="prose-dark" style={{ backgroundColor: 'hsl(220,14%,12%)', borderRadius: 8, padding: '12px 14px', border: '1px solid hsl(220,14%,20%)', maxHeight: 240, overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(selected.blog_content ?? '') }} />
                  </div>
                </TabsContent>
                <TabsContent value="schema" style={{ padding: 20, margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code2 style={{ width: 11, height: 11, color: 'hsl(199,89%,65%)' }} />JSON-LD Schema
                    </p>
                    {selected.schema_json && <CopyBtn text={JSON.stringify(selected.schema_json, null, 2)} />}
                  </div>
                  <pre style={{ fontSize: 11, color: 'hsl(199,89%,70%)', backgroundColor: 'hsl(220,14%,12%)', padding: 12, borderRadius: 8, border: '1px solid hsl(220,14%,20%)', overflowX: 'auto', fontFamily: 'monospace', lineHeight: 1.5, margin: 0 }}>
                    {JSON.stringify(selected.schema_json, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="social" style={{ padding: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[['LinkedIn', selected.social_linkedin], ['X (Twitter)', selected.social_x]].map(([label, text]) => (
                    <div key={label}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
                        {text && <CopyBtn text={text} />}
                      </div>
                      <div style={{ backgroundColor: 'hsl(220,14%,12%)', borderRadius: 10, border: '1px solid hsl(220,14%,20%)', padding: 14 }}>
                        <p style={{ fontSize: 13, color: 'hsl(210,20%,85%)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{text}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
