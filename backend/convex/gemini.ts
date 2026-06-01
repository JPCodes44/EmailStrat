import { GoogleGenAI } from '@google/genai';

// Shared Gemini helper: a single source of truth for the free-key → paid-key
// fallback (and transient retry), reused by company research and subject
// generation. Plain module — importable from both Node and default-runtime
// Convex functions.

const MAX_GEMINI_ATTEMPTS = 3;

/** Params accepted by GoogleGenAI's `generateContent` (model + contents + config). */
export type GeminiParams = Parameters<
  InstanceType<typeof GoogleGenAI>['models']['generateContent']
>[0];

/** Text + token usage from a Gemini call, plus which key tier served it. */
export interface GeminiResult {
  text: string | undefined;
  promptTokens: number;
  completionTokens: number;
  usedFreeKey: boolean;
}

/** Transient server errors (503/UNAVAILABLE) — worth retrying the SAME key. */
export function isTransientGeminiError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('"code":503') ||
      error.message.includes('"status":"UNAVAILABLE"')
    );
  }
  return false;
}

/** Quota/rate-limit exhaustion (429/RESOURCE_EXHAUSTED) — fall back to the paid key. */
export function isQuotaError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('"code":429') ||
      error.message.includes('"status":"RESOURCE_EXHAUSTED"')
    );
  }
  return false;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * One `generateContent` call with a given key, retrying only on transient (503)
 * errors. Quota (429) errors bubble up so the caller can fall back to another key.
 */
async function callGemini(
  apiKey: string,
  params: GeminiParams,
): Promise<Omit<GeminiResult, 'usedFreeKey'>> {
  const gemini = new GoogleGenAI({ apiKey });
  for (let attempt = 1; attempt <= MAX_GEMINI_ATTEMPTS; attempt += 1) {
    try {
      const response = await gemini.models.generateContent(params);
      const usage = response.usageMetadata;
      return {
        text: response.text,
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
      };
    } catch (error) {
      if (attempt === MAX_GEMINI_ATTEMPTS || !isTransientGeminiError(error)) {
        throw error;
      }
      await wait(500 * attempt);
    }
  }
  return { text: undefined, promptTokens: 0, completionTokens: 0 };
}

/**
 * Run a Gemini call on the free key first; if the free tier's quota is exhausted
 * (429) and a paid key is available, retry on the paid key. Reports which key
 * served the call so callers can attribute usage/cost.
 */
export async function runGeminiWithFallback(opts: {
  freeKey: string;
  paidKey?: string;
  params: GeminiParams;
}): Promise<GeminiResult> {
  try {
    const result = await callGemini(opts.freeKey, opts.params);
    return { ...result, usedFreeKey: true };
  } catch (error) {
    if (
      isQuotaError(error) &&
      opts.paidKey !== undefined &&
      opts.paidKey.length > 0
    ) {
      const result = await callGemini(opts.paidKey, opts.params);
      return { ...result, usedFreeKey: false };
    }
    throw error;
  }
}
