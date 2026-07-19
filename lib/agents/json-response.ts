type JsonObject = Record<string, unknown>;

/** Removes common model wrappers while leaving the JSON payload unchanged. */
export function sanitizeJsonResponse(text: string): string {
  return text
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function asJsonObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonObject
    : null;
}

function tryParseObject(value: string): JsonObject | null {
  try {
    const parsed: unknown = JSON.parse(value);
    const direct = asJsonObject(parsed);
    if (direct) return direct;
    if (typeof parsed === 'string') return asJsonObject(JSON.parse(parsed));
  } catch {
    return null;
  }
  return null;
}

/** Extracts a complete object while ignoring braces inside JSON strings. */
function extractJsonObject(text: string): JsonObject | null {
  for (let start = text.indexOf('{'); start >= 0; start = text.indexOf('{', start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === '{') depth += 1;
      else if (character === '}') {
        depth -= 1;
        if (depth === 0) {
          const parsed = tryParseObject(text.slice(start, index + 1));
          if (parsed) return parsed;
          break;
        }
      }
    }
  }
  return null;
}

export function parseAgentJson(text: string): JsonObject {
  const sanitized = sanitizeJsonResponse(text);
  const parsed = tryParseObject(sanitized) ?? extractJsonObject(sanitized);
  if (!parsed) throw new Error('Agent returned invalid JSON.');
  return parsed;
}
