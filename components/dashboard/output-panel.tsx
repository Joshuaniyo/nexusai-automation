'use client';

/* eslint-disable @next/next/no-img-element -- Pollinations returns short-lived CDN hosts that cannot be statically allow-listed. */

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, Copy, FilePlus2, FileText, ImageIcon, Loader2, RefreshCw, Send, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { GenerationResult } from '@/types/database';
import { sanitizeHtml } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CompetitiveTools } from '@/components/dashboard/competitive-tools';
import { toPollinationsProxyUrl } from '@/lib/media/pollinations-url';
import { PublishContentModal } from '@/components/dashboard/publish-content-modal';

interface Props {
  result: GenerationResult | null;
  isGenerating: boolean;
  error: string | null;
  keyword: string;
  onGenerateNew: () => void;
}

type Platform = 'x' | 'linkedin' | 'instagram';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-slate-800 hover:text-white">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function AgentSkeleton() {
  const steps = ['Discovering search intent', 'Architecting the article', 'Optimizing SEO and schema', 'Writing three social channels', 'Auditing claims and quality'];
  return (
    <div className="flex h-full flex-col overflow-y-auto p-5 md:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
          <Sparkles className="h-5 w-5 animate-pulse text-cyan-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Cooperative agent ring in progress</p>
          <p className="text-xs text-slate-500">Ten specialists are building and validating your package.</p>
        </div>
      </div>
      <div className="grid flex-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-5 h-5 w-2/3 rounded bg-slate-800" />
          <div className="mb-6 aspect-[1.9/1] rounded-xl bg-slate-800/80" />
          {[100, 92, 97, 75, 88, 96, 66].map((width, index) => <div key={index} className="mb-3 h-3 rounded bg-slate-800" style={{ width: `${width}%` }} />)}
        </div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" style={{ animationDelay: `${index * 120}ms` }} />
              <span className="text-xs text-slate-300">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialCard({
  platform,
  label,
  copy,
  initialPrompt,
  initialUrl,
  packageId,
}: {
  platform: Platform;
  label: string;
  copy: string;
  initialPrompt: string;
  initialUrl: string;
  packageId: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [url, setUrl] = useState(initialUrl);
  const [regenerating, setRegenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16'>(platform === 'instagram' ? '1:1' : '16:9');

  useEffect(() => {
    setPrompt(initialPrompt);
    setUrl(initialUrl);
  }, [initialPrompt, initialUrl]);

  async function regenerate() {
    setRegenerating(true);
    const id = toast.loading(`Regenerating ${label} artwork...`);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, platform, packageId, aspectRatio }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Image regeneration failed.');
      setUrl(data.url);
      toast.success(`${label} artwork regenerated and saved.`, { id });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image regeneration failed.', { id });
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-cyan-400/10 px-2 text-[11px] font-bold uppercase text-cyan-300">{platform === 'linkedin' ? 'in' : platform}</span>
          <h3 className="text-xs font-semibold text-white">{label}</h3>
        </div>
        <CopyButton text={copy} />
      </div>
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <img src={toPollinationsProxyUrl(url)} alt={`${label} generated post artwork`} className="h-full w-full object-cover" />
        {regenerating && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm"><Loader2 className="h-6 w-6 animate-spin text-cyan-300" /></div>}
      </div>
      <div className="space-y-4 p-4">
        <p className="whitespace-pre-wrap text-xs leading-6 text-slate-200">{copy}</p>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <ImageIcon className="h-3 w-3" /> Manual image prompt
          </div>
          <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={1800} className="min-h-[84px] resize-none border-slate-800 bg-slate-950 text-xs text-slate-200" />
          <div className="mt-3 grid grid-cols-3 gap-2">{(['16:9', '1:1', '9:16'] as const).map((ratio) => <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`rounded-md border px-2 py-1.5 text-[10px] transition ${aspectRatio === ratio ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200' : 'border-slate-800 text-slate-500 hover:text-white'}`}>{ratio}</button>)}</div>
          <Button onClick={regenerate} disabled={regenerating || prompt.trim().length < 10} size="sm" className="mt-3 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
            {regenerating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
            Regenerate image
          </Button>
        </div>
      </div>
    </article>
  );
}

export function OutputPanel({ result, isGenerating, error, keyword, onGenerateNew }: Props) {
  const cleanBlog = useMemo(() => sanitizeHtml(result?.blog_content ?? ''), [result?.blog_content]);
  const [activeView, setActiveView] = useState<'blog' | 'social'>('blog');
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => { setActiveView('blog'); }, [result?.package_id]);

  if (isGenerating) return <div className="min-w-0 flex-1"><AgentSkeleton /></div>;
  if (error) return (
    <div className="flex min-w-0 flex-1 items-center justify-center p-8">
      <div className="max-w-md rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-7 w-7 text-red-400" />
        <h2 className="mb-2 text-sm font-semibold text-white">Generation failed</h2>
        <p className="text-xs leading-5 text-slate-400">{error}</p>
      </div>
    </div>
  );
  if (!result) return (
    <div className="flex min-w-0 flex-1 items-center justify-center p-8 text-center">
      <div>
        <Sparkles className="mx-auto mb-4 h-9 w-9 text-cyan-400/50" />
        <h2 className="text-sm font-semibold text-white">Your visual automation workspace is ready</h2>
        <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">Enter a topic to generate an audited blog, JSON-LD, three social campaigns, and platform-ready graphics.</p>
      </div>
    </div>
  );

  const score = typeof result.quality_audit.overall_score === 'number' ? result.quality_audit.overall_score : null;
  return (
    <div className="min-w-0 flex-1 overflow-y-auto bg-slate-950/20">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-3 backdrop-blur-xl">
        <div>
          <h2 className="text-sm font-semibold text-white">Coordinated post package</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">{keyword} · {result.agent_trace.length}/10 agents completed</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Audited{score !== null ? ` · ${score}/100` : ''}
        </div>
      </header>

      <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-950/60 px-5 py-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-grid w-full max-w-md grid-cols-2 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button type="button" onClick={() => setActiveView('blog')} aria-pressed={activeView === 'blog'} className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${activeView === 'blog' ? 'bg-cyan-500/15 text-cyan-200 shadow-sm' : 'text-slate-500 hover:text-slate-200'}`}><FileText className="h-3.5 w-3.5" />Blog Post</button>
          <button type="button" onClick={() => setActiveView('social')} aria-pressed={activeView === 'social'} className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${activeView === 'social' ? 'bg-cyan-500/15 text-cyan-200 shadow-sm' : 'text-slate-500 hover:text-slate-200'}`}><Share2 className="h-3.5 w-3.5" />Social Media Posts</button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row"><Button type="button" variant="outline" onClick={onGenerateNew} className="border-slate-700 text-slate-300"><FilePlus2 className="mr-2 h-4 w-4" />Generate New Content</Button><Button type="button" onClick={() => setPublishOpen(true)} className="bg-cyan-500 font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 hover:bg-cyan-400"><Send className="mr-2 h-4 w-4" />Publish / Sync Content</Button></div>
      </div>

      {activeView === 'blog' ? <div className="p-5"><article className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-300" /><span className="text-xs font-semibold text-white">Generated blog post</span></div>
            <CopyButton text={result.blog_content} />
          </div>
          <img src={toPollinationsProxyUrl(result.media_urls.blog)} alt="Generated blog hero artwork" className="aspect-[1.9/1] w-full object-cover" />
          <div className="p-5 md:p-7">
            <h1 className="text-2xl font-bold leading-tight text-white">{result.blog_title}</h1>
            <p className="mt-3 rounded-lg border border-cyan-400/10 bg-cyan-400/5 p-3 text-xs leading-5 text-cyan-100/70">{result.meta_description}</p>
            <div className="prose-dark mt-7 max-w-none text-sm leading-7" dangerouslySetInnerHTML={{ __html: cleanBlog }} />
            <details className="mt-7 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <summary className="cursor-pointer text-xs font-semibold text-slate-300">View validated JSON-LD</summary>
              <pre className="mt-3 overflow-x-auto text-[11px] leading-5 text-cyan-200/80">{JSON.stringify(result.schema_json, null, 2)}</pre>
            </details>
          </div>
        </article></div> : <section className="grid items-start gap-5 p-5 xl:grid-cols-2">
          <SocialCard platform="x" label="X / Twitter" copy={result.social_posts.x.text} initialPrompt={result.visual_prompts.x} initialUrl={result.media_urls.x} packageId={result.package_id} />
          <SocialCard platform="linkedin" label="LinkedIn" copy={result.social_posts.linkedin.text} initialPrompt={result.visual_prompts.linkedin} initialUrl={result.media_urls.linkedin} packageId={result.package_id} />
        </section>}
      <CompetitiveTools result={result} />
      <PublishContentModal result={result} open={publishOpen} onOpenChange={setPublishOpen} />
    </div>
  );
}
