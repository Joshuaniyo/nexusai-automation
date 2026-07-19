'use client';

import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import type { GenerationResult } from '@/types/database';

interface GenerationContextValue {
  result: GenerationResult | null;
  isGenerating: boolean;
  error: string | null;
  lastKeyword: string;
  generate: (keyword: string, assetId: string | null) => Promise<void>;
  clearGeneration: () => void;
}

const GenerationContext = createContext<GenerationContextValue | null>(null);

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKeyword, setLastKeyword] = useState('');

  async function generate(keyword: string, assetId: string | null) {
    setIsGenerating(true);
    setError(null);
    setLastKeyword(keyword);
    const progressToast = toast.loading('The 10-agent ring is analyzing your topic...');
    try {
      const response = await fetch('/api/agents/coordinator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, assetId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      if (!data.blog_title || !data.blog_content) throw new Error('Incomplete response from AI engine.');
      setResult(data as GenerationResult);
      toast.success('Post package generated and saved.', { id: progressToast });
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Generation failed.';
      setError(message);
      toast.error(message, { id: progressToast });
    } finally {
      setIsGenerating(false);
    }
  }

  function clearGeneration() {
    if (isGenerating) return;
    setResult(null);
    setError(null);
    setLastKeyword('');
  }

  return <GenerationContext.Provider value={{ result, isGenerating, error, lastKeyword, generate, clearGeneration }}>{children}</GenerationContext.Provider>;
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) throw new Error('useGeneration must be used within GenerationProvider.');
  return context;
}
