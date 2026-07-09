'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import type { Asset, GenerationResult } from '@/types/database';
import { GenerationPanel } from '@/components/dashboard/generation-panel';
import { OutputPanel } from '@/components/dashboard/output-panel';

const MAX_FREE_ASSETS = 3;

export default function DashboardPage() {
  const { tier, isPremium, user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastKeyword, setLastKeyword] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAssets(data as Asset[]);
      });
  }, [user]);

  const canGenerate = true;
  const assetCount = assets.length;
  const assetsRemaining = isPremium ? Infinity : Math.max(0, MAX_FREE_ASSETS - assetCount);

  async function handleGenerate(keyword: string, assetId: string | null) {
    if (!user) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setLastKeyword(keyword);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      if (!data.blog_title || !data.blog_content) throw new Error('Incomplete response from AI engine');
      setResult(data as GenerationResult);
      await supabase.from('content_history').insert({
        keyword,
        blog_title: data.blog_title,
        blog_content: data.blog_content,
        meta_description: data.meta_description,
        keywords_list: data.keywords_list,
        schema_json: data.schema_json,
        social_linkedin: data.social_linkedin,
        social_x: data.social_x,
        asset_id: assetId,
        tier,
        user_id: user.id,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <GenerationPanel
        assets={assets}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        tier={tier}
        assetCount={assetCount}
        isPremium={isPremium}
      />
      <OutputPanel result={result} isGenerating={isGenerating} error={error} keyword={lastKeyword} />
    </div>
  );
}
