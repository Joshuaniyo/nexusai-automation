import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `You are an expert SEO content strategist. When given a keyword or topic, respond with ONLY a single valid JSON object (no markdown, no code blocks, no extra text).

Required JSON keys:
- "blog_title": SEO-optimized title string (60-70 chars)
- "blog_content": Full semantic HTML using h2, h3, p, ul, li, strong tags (min 600 words)
- "meta_description": SEO meta description (150-160 characters)
- "keywords_list": Array of 8-12 related keyword strings
- "schema_json": Valid TechArticle JSON-LD object with @context, @type, headline, description, keywords, author fields
- "social_linkedin": Professional LinkedIn post (200-300 chars) with hashtags
- "social_x": Punchy X/Twitter post (max 280 chars) with hashtags

CRITICAL: Return ONLY the raw JSON object. No preamble, no trailing text, no markdown fences.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keyword: string = body.keyword ?? '';
    const tier: string = body.tier ?? 'free';

    if (!keyword || keyword.trim().length < 2) {
      return NextResponse.json({ error: 'A valid keyword or topic is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured. Add GEMINI_API_KEY to your environment variables.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: tier === 'premium' ? 0.8 : 0.6,
        maxOutputTokens: tier === 'premium' ? 8192 : 4096,
      },
    });

    const prompt = `Generate comprehensive SEO content for: "${keyword.trim()}"`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Failed to parse AI response as JSON');
      parsed = JSON.parse(match[0]);
    }

    const required = ['blog_title', 'blog_content', 'meta_description', 'keywords_list', 'schema_json', 'social_linkedin', 'social_x'];
    for (const key of required) {
      if (!(key in parsed)) throw new Error(`Missing required field: ${key}`);
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
