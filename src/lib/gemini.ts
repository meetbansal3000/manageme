import { GoogleGenAI } from '@google/genai';

/**
 * Valid, active Google Gemini Model ID.
 * Standard active models: gemini-2.5-flash, gemini-1.5-flash
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export function getGeminiApiKey(): string {
  // 1. Vite / browser client environment
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore in non-Vite contexts
  }

  // 2. Node / SSR / worker process environment
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    }
  } catch (e) {
    // Ignore
  }

  return '';
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({ apiKey });
}

export async function generateGeminiContent(prompt: string, modelName: string = DEFAULT_GEMINI_MODEL): Promise<string> {
  const ai = getGeminiClient();
  const candidates = [modelName, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastError: any = null;

  for (let attempt = 0; attempt < candidates.length; attempt++) {
    const currentModel = candidates[attempt];
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
      });
      return response.text || '';
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini SDK Retry] Attempt ${attempt + 1}/${candidates.length} failed with model ${currentModel}: ${err.message}`);
      if (attempt < candidates.length - 1) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

