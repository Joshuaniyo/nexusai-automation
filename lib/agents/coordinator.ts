import { GoogleGenerativeAI } from '@google/generative-ai';
import { generatePollinationsImage } from '@/lib/media/pollinations';
import { getSpecialist, type SpecialistId } from '@/lib/agents/specialists';
import { availableGeminiKeys, rotateGeminiKey } from '@/lib/agents/key-router';

type JsonObject = Record<string, unknown>;

export interface AgentTraceItem {
  id: SpecialistId;
  name: string;
  keySlot: string;
  durationMs: number;
  status: 'completed';
}

export interface CoordinatedPackage {
  blog_title: string;
  blog_content: string;
  meta_description: string;
  keywords_list: string[];
  schema_json: JsonObject;
  social_linkedin: string;
  social_x: string;
  social_instagram: string;
  social_posts: {
    x: { text: string; thread: string[]; image_prompt: string; image_url: string };
    linkedin: { text: string; image_prompt: string; image_url: string };
    instagram: { caption: string; alt_text: string; image_prompt: string; image_url: string };
  };
  media_urls: { blog: string; x: string; linkedin: string; instagram: string };
  visual_prompts: { blog: string; x: string; linkedin: string; instagram: string };
  quality_audit: JsonObject;
  agent_trace: AgentTraceItem[];
}

function parseJson(text: string): JsonObject {
  try {
    return JSON.parse(text) as JsonObject;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Agent returned invalid JSON.');
    return JSON.parse(match[0]) as JsonObject;
  }
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`Agent output missing ${field}.`);
  return value.trim();
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : [];
}

async function runGroundedTrendScout(
  input: JsonObject,
  trace: AgentTraceItem[],
  temperature: number,
): Promise<JsonObject> {
  const specialist = getSpecialist('trend_scout');
  const maxAttempts = Math.min(3, availableGeminiKeys().length || 1);
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const routed = rotateGeminiKey(attempt);
    const startedAt = Date.now();
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': routed.apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: specialist.systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature, maxOutputTokens: 3072 },
        }),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Grounded Gemini request failed (${response.status}): ${(await response.text()).slice(0, 240)}`);
      const payload = await response.json() as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          groundingMetadata?: {
            webSearchQueries?: string[];
            groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
          };
        }>;
      };
      const candidate = payload.candidates?.[0];
      const text = candidate?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
      const output = parseJson(text);
      const sources = (candidate?.groundingMetadata?.groundingChunks ?? []).flatMap((chunk) => chunk.web?.uri ? [{ title: chunk.web.title ?? chunk.web.uri, url: chunk.web.uri }] : []);
      output.grounding = { search_queries: candidate?.groundingMetadata?.webSearchQueries ?? [], sources };
      trace.push({ id: 'trend_scout', name: specialist.name, keySlot: routed.slot, durationMs: Date.now() - startedAt, status: 'completed' });
      return output;
    } catch (error) { lastError = error; }
  }
  throw lastError instanceof Error ? lastError : new Error('Grounded Trend Scout failed.');
}

async function runAgent(
  id: SpecialistId,
  input: JsonObject,
  trace: AgentTraceItem[],
  temperature = 0.55,
): Promise<JsonObject> {
  const specialist = getSpecialist(id);
  if (id === 'trend_scout') return runGroundedTrendScout(input, trace, temperature);
  const maxAttempts = Math.min(3, availableGeminiKeys().length || 1);
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const routed = rotateGeminiKey(attempt);
    const startedAt = Date.now();
    try {
      const model = new GoogleGenerativeAI(routed.apiKey).getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: specialist.systemPrompt,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature,
          maxOutputTokens: id === 'seo_optimizer' ? 8192 : 3072,
        },
      });
      const response = await model.generateContent(JSON.stringify(input));
      const output = parseJson(response.response.text());
      trace.push({
        id,
        name: specialist.name,
        keySlot: routed.slot,
        durationMs: Date.now() - startedAt,
        status: 'completed',
      });
      return output;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${specialist.name} failed.`);
}

export async function coordinateAgents(
  keyword: string,
  priorGuidelines: string[] = [],
): Promise<CoordinatedPackage> {
  const trace: AgentTraceItem[] = [];
  const topic = keyword.trim().slice(0, 300);

  const trends = await runAgent('trend_scout', {
    topic,
    required_shape: {
      search_intent: 'string',
      audience_questions: ['string'],
      keyword_opportunities: ['string'],
      strategic_inferences: ['string'],
    },
  }, trace, 0.35);

  const architecture = await runAgent('content_architect', {
    topic,
    trends,
    prior_quality_guidelines: priorGuidelines,
    required_shape: { title: 'string', outline: ['section objects'], evidence_requirements: ['string'] },
  }, trace, 0.45);

  const seo = await runAgent('seo_optimizer', {
    topic,
    trends,
    architecture,
    required_shape: {
      blog_title: 'string',
      blog_content: 'semantic HTML string of at least 900 words',
      meta_description: '150-160 character string',
      keywords_list: ['8-12 strings'],
    },
  }, trace, 0.65);

  const parallelContext = { topic, trends, architecture, seo };
  const [schema, visuals, xPost, linkedinPost, instagramPost] = await Promise.all([
    runAgent('schema_auditor', { ...parallelContext, required_shape: { schema_json: 'JSON-LD object' } }, trace, 0.2),
    runAgent('visual_prompt_engineer', { ...parallelContext, required_shape: { blog: 'string', x: 'string', linkedin: 'string', instagram: 'string' } }, trace, 0.7),
    runAgent('x_copywriter', { ...parallelContext, required_shape: { text: 'string <= 280 chars', thread: ['string'] } }, trace, 0.65),
    runAgent('linkedin_editor', { ...parallelContext, required_shape: { text: 'string' } }, trace, 0.6),
    runAgent('instagram_facebook_writer', { ...parallelContext, required_shape: { caption: 'string', alt_text: 'string' } }, trace, 0.7),
  ]);

  const blogTitle = stringValue(seo.blog_title, 'blog_title');
  const blogContent = stringValue(seo.blog_content, 'blog_content');
  const metaDescription = stringValue(seo.meta_description, 'meta_description');
  const keywords = stringArray(seo.keywords_list);
  const socialX = stringValue(xPost.text, 'X text').slice(0, 280);
  const socialLinkedin = stringValue(linkedinPost.text, 'LinkedIn text');
  const socialInstagram = stringValue(instagramPost.caption, 'Instagram caption');
  const prompts = {
    blog: stringValue(visuals.blog, 'blog visual prompt'),
    x: stringValue(visuals.x, 'X visual prompt'),
    linkedin: stringValue(visuals.linkedin, 'LinkedIn visual prompt'),
    instagram: stringValue(visuals.instagram, 'Instagram visual prompt'),
  };

  const factCheck = await runAgent('fact_checker', {
    topic,
    package: { seo, schema, xPost, linkedinPost, instagramPost },
    required_shape: { verdict: 'pass|revise', claims: ['audit objects'], safer_replacements: ['string'] },
  }, trace, 0.15);

  const audit = await runAgent('meta_learning_auditor', {
    topic,
    package: { seo, schema, visuals, xPost, linkedinPost, instagramPost },
    fact_check: factCheck,
    required_shape: { overall_score: 'number 0-100', scores: 'object', next_run_guidelines: ['string'] },
  }, trace, 0.25);

  const [blogImage, xImage, linkedinImage, instagramImage] = await Promise.all([
    generatePollinationsImage(prompts.blog, 'blog'),
    generatePollinationsImage(prompts.x, 'x'),
    generatePollinationsImage(prompts.linkedin, 'linkedin'),
    generatePollinationsImage(prompts.instagram, 'instagram'),
  ]);
  const mediaUrls = { blog: blogImage, x: xImage, linkedin: linkedinImage, instagram: instagramImage };

  const schemaJson = (schema.schema_json && typeof schema.schema_json === 'object')
    ? schema.schema_json as JsonObject
    : schema;

  return {
    blog_title: blogTitle,
    blog_content: blogContent,
    meta_description: metaDescription,
    keywords_list: keywords,
    schema_json: schemaJson,
    social_linkedin: socialLinkedin,
    social_x: socialX,
    social_instagram: socialInstagram,
    social_posts: {
      x: { text: socialX, thread: stringArray(xPost.thread), image_prompt: prompts.x, image_url: mediaUrls.x },
      linkedin: { text: socialLinkedin, image_prompt: prompts.linkedin, image_url: mediaUrls.linkedin },
      instagram: {
        caption: socialInstagram,
        alt_text: stringValue(instagramPost.alt_text, 'Instagram alt text'),
        image_prompt: prompts.instagram,
        image_url: mediaUrls.instagram,
      },
    },
    media_urls: mediaUrls,
    visual_prompts: prompts,
    quality_audit: { ...audit, fact_check: factCheck },
    agent_trace: trace,
  };
}
