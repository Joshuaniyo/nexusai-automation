'use client';

import { useState, useMemo } from 'react';
import type { GenerationResult } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Share2, Copy, Check, Code2, FileText, Tag, Loader2, AlertCircle, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { sanitizeHtml } from '@/lib/security';

interface Props { result: GenerationResult | null; isGenerating: boolean; error: string | null; keyword: string; }

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function go() { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  return (
    <button onClick={go} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: 'hsl(215,16%,60%)' }}>
      {copied ? <Check style={{ width: 11, height: 11, color: 'hsl(160,84%,55%)' }} /> : <Copy style={{ width: 11, height: 11 }} />}
      {label ?? (copied ? 'Copied' : 'Copy')}
    </button>
  );
}

function SecHead({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', backgroundColor: 'hsla(220,14%,14%,0.7)', borderBottom: '1px solid hsl(220,14%,16%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon style={{ width: 13, height: 13, color: 'hsl(199,89%,65%)' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'hsl(210,20%,95%)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyOrLoading({ isGenerating, error }: { isGenerating: boolean; error: string | null }) {
  if (isGenerating) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid hsla(199,89%,48%,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 style={{ width: 28, height: 28, color: 'hsl(199,89%,65%)', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: '0 0 4px 0' }}>Processing request...</p>
        <p style={{ fontSize: 12, color: 'hsl(215,16%,47%)', margin: 0 }}>Gemini 2.5 Flash is generating optimized content</p>
      </div>
      <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['Analyzing keyword intent', 'Drafting semantic HTML', 'Generating JSON-LD schema', 'Crafting social posts'].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Loader2 style={{ width: 12, height: 12, color: 'hsl(199,89%,65%)', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 12, color: 'hsl(215,16%,60%)' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'hsla(0,72%,51%,0.1)', border: '1px solid hsla(0,72%,51%,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle style={{ width: 20, height: 20, color: 'hsl(0,72%,65%)' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: '0 0 4px 0' }}>Generation Failed</p>
        <p style={{ fontSize: 12, color: 'hsl(215,16%,60%)', margin: 0, maxWidth: 360 }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Search style={{ width: 28, height: 28, color: 'hsl(215,16%,30%)' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: '0 0 4px 0' }}>Ready to Generate</p>
        <p style={{ fontSize: 12, color: 'hsl(215,16%,47%)', margin: 0, maxWidth: 360 }}>Enter a keyword in the left panel and click Generate to produce SEO-optimized content with Gemini AI.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8, width: '100%', maxWidth: 320 }}>
        {[{ icon: FileText, l: 'SEO Blog', d: 'Semantic HTML' }, { icon: Code2, l: 'JSON-LD', d: 'Schema markup' }, { icon: Share2, l: 'Social', d: 'LinkedIn + X' }].map(({ icon: Icon, l, d }) => (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, borderRadius: 8, backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)' }}>
            <Icon style={{ width: 16, height: 16, color: 'hsl(199,89%,65%)' }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: 0 }}>{l}</p>
            <p style={{ fontSize: 10, color: 'hsl(215,16%,47%)', margin: 0, textAlign: 'center' }}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoTab({ result }: { result: GenerationResult }) {
  const [expanded, setExpanded] = useState(false);
  const sanitizedContent = useMemo(() => sanitizeHtml(result.blog_content), [result.blog_content]);
  return (
    <ScrollArea className="h-full">
      <div>
        <SecHead title="Blog Title" icon={FileText}><CopyBtn text={result.blog_title} /></SecHead>
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(210,20%,95%)', margin: '0 0 4px 0', lineHeight: 1.4 }}>{result.blog_title}</p>
          <p style={{ fontSize: 10, color: 'hsl(215,16%,47%)', margin: 0 }}>{result.blog_title.length} characters</p>
        </div>

        <div style={{ height: 1, backgroundColor: 'hsl(220,14%,16%)' }} />
        <SecHead title="Meta Description" icon={Tag}><CopyBtn text={result.meta_description} /></SecHead>
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontSize: 13, color: 'hsl(215,16%,60%)', margin: '0 0 8px 0', lineHeight: 1.6 }}>{result.meta_description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 3, backgroundColor: 'hsl(220,14%,20%)', borderRadius: 2 }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${Math.min((result.meta_description.length / 160) * 100, 100)}%`, background: result.meta_description.length > 160 ? 'hsl(38,92%,50%)' : 'hsl(160,84%,39%)' }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, color: result.meta_description.length > 160 ? 'hsl(38,92%,60%)' : 'hsl(160,84%,55%)' }}>{result.meta_description.length}/160</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: 'hsl(220,14%,16%)' }} />
        <SecHead title="Keywords List" icon={Hash}><CopyBtn text={result.keywords_list.join(', ')} label="Copy all" /></SecHead>
        <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {result.keywords_list.map((kw) => (
            <Badge key={kw} variant="outline" style={{ fontSize: 11, borderColor: 'hsla(199,89%,48%,0.25)', color: 'hsl(199,89%,70%)', backgroundColor: 'hsla(199,89%,48%,0.05)' }}>{kw}</Badge>
          ))}
        </div>

        <div style={{ height: 1, backgroundColor: 'hsl(220,14%,16%)' }} />
        <SecHead title="Blog Content" icon={FileText}>
          <div style={{ display: 'flex', gap: 4 }}>
            <CopyBtn text={result.blog_content} />
            <button onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: 'hsl(215,16%,60%)' }}>
              {expanded ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </SecHead>
        <div style={{ padding: '12px 16px', maxHeight: expanded ? 'none' : 220, overflow: 'hidden', position: 'relative' }} className="prose-dark" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        {!expanded && <div style={{ padding: '0 16px 12px' }}><button onClick={() => setExpanded(true)} style={{ fontSize: 12, color: 'hsl(199,89%,65%)', background: 'none', border: 'none', cursor: 'pointer' }}>Read full article...</button></div>}

        <div style={{ height: 1, backgroundColor: 'hsl(220,14%,16%)' }} />
        <SecHead title="JSON-LD Schema" icon={Code2}><CopyBtn text={JSON.stringify(result.schema_json, null, 2)} label="Copy JSON" /></SecHead>
        <div style={{ padding: '12px 16px' }}>
          <pre style={{ fontSize: 11, color: 'hsl(199,89%,70%)', backgroundColor: 'hsl(220,14%,12%)', padding: 12, borderRadius: 8, border: '1px solid hsl(220,14%,20%)', overflowX: 'auto', fontFamily: 'monospace', lineHeight: 1.5, margin: 0 }}>
            {JSON.stringify(result.schema_json, null, 2)}
          </pre>
        </div>
      </div>
    </ScrollArea>
  );
}

function SocialTab({ result }: { result: GenerationResult }) {
  const liTags: string[] = result.social_linkedin.match(/#\w+/g) ?? [];
  const xTags: string[] = result.social_x.match(/#\w+/g) ?? [];
  const seen: Record<string, boolean> = {};
  const hashtags: string[] = [];
  liTags.concat(xTags).forEach((t) => { if (!seen[t]) { seen[t] = true; hashtags.push(t); } });

  return (
    <ScrollArea className="h-full">
      <div>
        {/* LinkedIn */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>LinkedIn Post</p>
            <CopyBtn text={result.social_linkedin} />
          </div>
          <div style={{ borderRadius: 12, border: '1px solid hsl(220,14%,20%)', backgroundColor: 'hsl(220,14%,12%)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'hsla(217,91%,60%,0.15)', border: '1px solid hsla(217,91%,60%,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'hsl(217,91%,70%)' }}>in</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: 0 }}>Your Profile</p>
                <p style={{ fontSize: 10, color: 'hsl(215,16%,47%)', margin: 0 }}>Now · LinkedIn</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'hsl(210,20%,85%)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{result.social_linkedin}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid hsl(220,14%,20%)' }}>
              <span style={{ fontSize: 10, color: 'hsl(215,16%,47%)' }}>{result.social_linkedin.length} chars</span>
              <span style={{ fontSize: 10, color: 'hsl(160,84%,55%)', display: 'flex', alignItems: 'center', gap: 3 }}><Check style={{ width: 10, height: 10 }} /> Optimized</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: 'hsl(220,14%,16%)' }} />

        {/* X */}
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>X (Twitter) Post</p>
            <CopyBtn text={result.social_x} />
          </div>
          <div style={{ borderRadius: 12, border: '1px solid hsl(220,14%,20%)', backgroundColor: 'hsl(220,14%,12%)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'hsl(220,14%,18%)', border: '1px solid hsl(220,14%,24%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'hsl(210,20%,90%)' }}>𝕏</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: 0 }}>@YourHandle</p>
                <p style={{ fontSize: 10, color: 'hsl(215,16%,47%)', margin: 0 }}>Just now · X</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'hsl(210,20%,85%)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{result.social_x}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid hsl(220,14%,20%)' }}>
              <span style={{ fontSize: 10, color: result.social_x.length > 280 ? 'hsl(38,92%,60%)' : 'hsl(160,84%,55%)', fontWeight: 500 }}>{result.social_x.length}/280</span>
              <span style={{ fontSize: 10, color: result.social_x.length > 280 ? 'hsl(38,92%,60%)' : 'hsl(160,84%,55%)' }}>{result.social_x.length > 280 ? 'Over limit' : 'Within limit'}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: 'hsl(220,14%,16%)' }} />

        {/* Hashtags */}
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Detected Hashtags</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hashtags.length > 0 ? hashtags.map((t) => (
              <Badge key={t} variant="outline" style={{ fontSize: 11, borderColor: 'hsla(217,91%,60%,0.25)', color: 'hsl(217,91%,70%)', backgroundColor: 'hsla(217,91%,60%,0.05)' }}>{t}</Badge>
            )) : <p style={{ fontSize: 12, color: 'hsl(215,16%,47%)', fontStyle: 'italic', margin: 0 }}>No hashtags detected</p>}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export function OutputPanel({ result, isGenerating, error, keyword }: Props) {
  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid hsl(220,14%,16%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: 0 }}>Output Preview</h2>
          {keyword && <p style={{ fontSize: 11, color: 'hsl(215,16%,47%)', margin: '2px 0 0 0' }}>Topic: <span style={{ color: 'hsl(199,89%,65%)', fontWeight: 500 }}>{keyword}</span></p>}
        </div>
        {result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'hsl(160,84%,55%)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'hsl(160,84%,55%)', fontWeight: 500 }}>Generated</span>
          </div>
        )}
      </div>

      {isGenerating || error || !result ? (
        <EmptyOrLoading isGenerating={isGenerating} error={error} />
      ) : (
        <Tabs defaultValue="seo" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 24px 0', borderBottom: '1px solid hsl(220,14%,16%)', flexShrink: 0 }}>
            <TabsList style={{ backgroundColor: 'hsl(220,14%,12%)', border: '1px solid hsl(220,14%,20%)', height: 32 }}>
              <TabsTrigger value="seo" style={{ fontSize: 12, height: 26, gap: 6 }} className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                <Search style={{ width: 12, height: 12 }} />SEO Engine
              </TabsTrigger>
              <TabsTrigger value="social" style={{ fontSize: 12, height: 26, gap: 6 }} className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                <Share2 style={{ width: 12, height: 12 }} />Social Distribution
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="seo" style={{ flex: 1, overflow: 'hidden', margin: 0 }} className="animate-fade-in">
            <SeoTab result={result} />
          </TabsContent>
          <TabsContent value="social" style={{ flex: 1, overflow: 'hidden', margin: 0 }} className="animate-fade-in">
            <SocialTab result={result} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
