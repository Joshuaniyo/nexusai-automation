'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import type { Asset } from '@/types/database';
import { GenerationPanel } from '@/components/dashboard/generation-panel';
import { OutputPanel } from '@/components/dashboard/output-panel';
import { useGeneration } from '@/context/generation-context';

const MAX_FREE_ASSETS = 3;

export default function DashboardPage() {
  const { tier, isPremium, user } = useAuth();
  const { result, isGenerating, error, lastKeyword, generate, clearGeneration } = useGeneration();
  const [assets, setAssets] = useState<Asset[]>([]);

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
    await generate(keyword, assetId);
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
      <OutputPanel result={result} isGenerating={isGenerating} error={error} keyword={lastKeyword} onGenerateNew={clearGeneration} />
    </div>
  );
}
