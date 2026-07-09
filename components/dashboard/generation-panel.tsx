'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Asset, UserTier } from '@/types/database';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Globe, Crown, Loader2, Target, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  assets: Asset[];
  isGenerating: boolean;
  onGenerate: (keyword: string, assetId: string | null) => void;
  tier: UserTier;
  assetCount?: number;
  isPremium?: boolean;
}

const EXAMPLES = [
  'AI automation for e-commerce',
  'SaaS onboarding best practices',
  'Zero-trust security architecture',
  'Machine learning in healthcare',
];

const MAX_FREE_ASSETS = 3;

export function GenerationPanel({ assets, isGenerating, onGenerate, tier, assetCount = 0, isPremium = false }: Props) {
  const [keyword, setKeyword] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('none');
  const router = useRouter();

  const assetsRemaining = isPremium ? Infinity : Math.max(0, MAX_FREE_ASSETS - assetCount);
  const canAddMoreAssets = isPremium || assetCount < MAX_FREE_ASSETS;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim() || isGenerating) return;
    onGenerate(keyword.trim(), selectedAsset === 'none' ? null : selectedAsset);
  }

  return (
    <div style={{ width: '300px', flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid hsl(220,14%,16%)', backgroundColor: 'hsl(220,16%,9%)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid hsl(220,14%,16%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: 'hsla(199,89%,48%,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 12, height: 12, color: 'hsl(199,89%,65%)' }} />
          </div>
          <h1 style={{ fontSize: 13, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: 0 }}>Generation Engine</h1>
        </div>
        <p style={{ fontSize: 11, color: 'hsl(215,16%,47%)', marginLeft: 28, margin: '0 0 0 28px' }}>Powered by Gemini 2.5 Flash</p>
      </div>

      {/* Tier badge */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid hsl(220,14%,16%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, backgroundColor: tier === 'premium' ? 'hsla(38,92%,50%,0.1)' : 'hsl(220,14%,14%)', border: `1px solid ${tier === 'premium' ? 'hsla(38,92%,50%,0.25)' : 'hsl(220,14%,20%)'}` }}>
          <Crown style={{ width: 12, height: 12, color: tier === 'premium' ? 'hsl(38,92%,65%)' : 'hsl(215,16%,47%)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: tier === 'premium' ? 'hsl(38,92%,65%)' : 'hsl(215,16%,47%)' }}>
            {tier === 'premium' ? 'Premium — 8K tokens' : 'Free Tier — 4K tokens'}
          </span>
        </div>
      </div>

      {/* Asset limit warning for free users */}
      {!isPremium && assetCount >= MAX_FREE_ASSETS && (
        <div style={{ padding: '10px 20px', borderBottom: '1px solid hsl(220,14%,16%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, backgroundColor: 'hsla(38,92%,50%,0.1)', border: '1px solid hsla(38,92%,50%,0.25)' }}>
            <AlertTriangle style={{ width: 14, height: 14, color: 'hsl(38,92%,65%)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'hsl(38,92%,65%)', margin: '0 0 4px 0' }}>Asset Limit Reached</p>
              <p style={{ fontSize: 10, color: 'hsl(215,16%,60%)', margin: '0 0 8px 0' }}>
                You&apos;ve reached the {MAX_FREE_ASSETS} asset limit. Upgrade to Premium for unlimited assets.
              </p>
              <Button size="sm" onClick={() => router.push('/api/billing/checkout')} className="h-6 text-[10px] bg-orange-500 hover:bg-orange-600 text-white">
                Upgrade Now <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: 16 }}>
        <div>
          <Label style={{ fontSize: 11, fontWeight: 600, color: 'hsl(210,20%,95%)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Target style={{ width: 12, height: 12, color: 'hsl(199,89%,65%)' }} />
            Target Keyword / Topic
          </Label>
          <Textarea
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. AI automation for small businesses..."
            maxLength={300}
            style={{ resize: 'none', height: 96, fontSize: 13, backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', color: 'hsl(210,20%,95%)', borderRadius: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'hsl(215,16%,47%)' }}>{keyword.length}/300</span>
            {keyword && <button type="button" onClick={() => setKeyword('')} style={{ fontSize: 10, color: 'hsl(215,16%,47%)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>}
          </div>
        </div>

        {/* Examples */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'hsl(215,16%,47%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Quick examples</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" onClick={() => setKeyword(ex)}
                style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', color: 'hsl(215,16%,60%)', cursor: 'pointer' }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid hsl(220,14%,16%)', margin: 0 }} />

        {/* Asset select */}
        <div>
          <Label style={{ fontSize: 11, fontWeight: 600, color: 'hsl(210,20%,95%)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Globe style={{ width: 12, height: 12, color: 'hsl(199,89%,65%)' }} />
            Target Asset
            <Badge variant="outline" style={{ fontSize: 9, height: 14, padding: '0 4px', borderColor: 'hsl(220,14%,20%)', color: 'hsl(215,16%,47%)' }}>Optional</Badge>
          </Label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger style={{ backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', color: 'hsl(210,20%,95%)', fontSize: 13, height: 36 }}>
              <SelectValue placeholder="Select client site..." />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: 'hsl(220,16%,9%)', border: '1px solid hsl(220,14%,20%)' }}>
              <SelectItem value="none" style={{ fontSize: 13, color: 'hsl(215,16%,60%)' }}>No target (standalone)</SelectItem>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id} style={{ fontSize: 13 }}>
                  {a.domain_name} · {a.cms_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: 'hsl(215,16%,47%)' }}>
              {isPremium ? 'Unlimited assets' : `${assetsRemaining}/${MAX_FREE_ASSETS} assets remaining`}
            </span>
            {assets.length === 0 && (
              <a href="/dashboard/assets" style={{ fontSize: 10, color: 'hsl(199,89%,65%)' }}>Add one</a>
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid hsl(220,14%,16%)', margin: 0 }} />

        {/* Submit */}
        <div style={{ marginTop: 'auto' }}>
          <button
            type="submit"
            disabled={!keyword.trim() || isGenerating}
            style={{
              width: '100%', height: 40, borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: keyword.trim() && !isGenerating ? 'pointer' : 'not-allowed', opacity: keyword.trim() && !isGenerating ? 1 : 0.5,
              background: 'linear-gradient(90deg, hsl(199,89%,48%), hsl(217,91%,60%))', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {isGenerating ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Zap style={{ width: 14, height: 14 }} /> Generate Content <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto' }} /></>}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            {[['SEO Blog', 'Full article'], ['JSON-LD', 'Schema'], ['Social', 'Li + X']].map(([label, desc]) => (
              <div key={label} style={{ padding: '8px 6px', borderRadius: 8, backgroundColor: 'hsl(220,14%,14%)', border: '1px solid hsl(220,14%,20%)', textAlign: 'center' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'hsl(210,20%,95%)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 9, color: 'hsl(215,16%,47%)', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
