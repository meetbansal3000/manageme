import { GoogleGenAI } from '@google/genai';

/**
 * Valid, active Google Gemini Model ID.
 * Standard aliases: gemini-2.5-flash, gemini-1.5-flash
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export function getGeminiApiKey(): string {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY : '') ||
    ''
  );
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({ apiKey });
}

export async function generateGeminiContent(prompt: string, modelName: string = DEFAULT_GEMINI_MODEL): Promise<string> {
  const ai = getGeminiClient();
  const candidates = [modelName, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'];
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
