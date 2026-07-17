'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import type { Asset, GenerationResult } from '@/types/database';
import { GenerationPanel } from '@/components/dashboard/generation-panel';
import { OutputPanel } from '@/components/dashboard/output-panel';
import { toast } from 'sonner';

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
    const progressToast = toast.loading('The 10-agent ring is analyzing your topic...');
    try {
      const res = await fetch('/api/agents/coordinator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, assetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      if (!data.blog_title || !data.blog_content) throw new Error('Incomplete response from AI engine');
      setResult(data as GenerationResult);
      toast.success('Post package generated and saved.', { id: progressToast });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      toast.error(message, { id: progressToast });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
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
