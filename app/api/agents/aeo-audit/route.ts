import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createSupabaseServerClient } from '@/lib/auth';
import { rotateGeminiKey } from '@/lib/agents/key-router';

export const runtime = 'nodejs';

function parseJson(text: string): Record<string, unknown> {
  try { return JSON.parse(text) as Record<string, unknown>; } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AEO auditor returned invalid JSON.');
    return JSON.parse(match[0]) as Record<string, unknown>;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase } = createSupabaseServerClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const packageId = typeof body.packageId === 'string' ? body.packageId : '';
    const { data: content } = await supabase.from('content_history').select('blog_title, blog_content, schema_json').eq('id', packageId).eq('user_id', user.id).maybeSingle();
    if (!content) return NextResponse.json({ error: 'Post package not found.' }, { status: 404 });

    const routed = rotateGeminiKey();
    const model = new GoogleGenerativeAI(routed.apiKey).getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are an Answer Engine Optimization auditor. Evaluate only the supplied content. Return JSON with sentiment_score (0-100), direct_answerability_ratio (0-100), citation_potential (0-100), semantic_entities (array of {name,type,relevance}), strengths (string array), recommendations (string array). Do not claim actual ranking or inclusion in any answer engine.',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 2048 },
    });
    const response = await model.generateContent(JSON.stringify(content));
    const audit = parseJson(response.response.text());
    await supabase.from('content_history').update({ aeo_audit: audit }).eq('id', packageId).eq('user_id', user.id);
    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AEO audit failed.' }, { status: 500 });
  }
}
