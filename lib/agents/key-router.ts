const KEY_SLOTS = Array.from({ length: 10 }, (_, index) => `GEMINI_KEY_${index + 1}`);
let cursor = Math.floor(Math.random() * KEY_SLOTS.length);

export interface RoutedKey {
  apiKey: string;
  slot: string;
}

export function availableGeminiKeys(): RoutedKey[] {
  const configured = KEY_SLOTS.flatMap((slot) => {
    const apiKey = process.env[slot]?.trim();
    return apiKey ? [{ apiKey, slot }] : [];
  });

  const fallback = process.env.GEMINI_API_KEY?.trim();
  if (configured.length === 0 && fallback) {
    configured.push({ apiKey: fallback, slot: 'GEMINI_API_KEY' });
  }

  return configured;
}

export function rotateGeminiKey(attempt = 0): RoutedKey {
  const keys = availableGeminiKeys();
  if (keys.length === 0) {
    throw new Error('No Gemini key configured. Add GEMINI_KEY_1 through GEMINI_KEY_10.');
  }

  const index = (cursor + attempt) % keys.length;
  if (attempt === 0) cursor = (cursor + 1) % keys.length;
  return keys[index];
}
