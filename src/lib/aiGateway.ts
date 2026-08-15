/**
 * Universal Multi-AI Model Gateway & Local API Key Vault
 * Provides model selection, client-side API key encryption/storage,
 * and unified prompt dispatch across Gemini, OpenAI, Claude, DeepSeek, and NotebookLM RAG.
 */

export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'notebooklm' | 'custom';

export interface AIModelDefinition {
  id: string;
  name: string;
  provider: AIProviderId;
  providerName: string;
  description: string;
  badge?: string;
  recommended?: boolean;
  contextWindow: string;
  speed: 'Ultra Fast' | 'Fast' | 'Deep Reasoning';
  strengths: string[];
}

export interface StoredApiKeys {
  gemini?: string;
  openai?: string;
  claude?: string;
  deepseek?: string;
  customApiKey?: string;
  customEndpoint?: string;
}

export interface ActiveAiConfig {
  provider: AIProviderId;
  model: string;
}

export interface UnifiedAiCallOptions {
  message: string;
  persona?: string;
  activeTab?: string;
  trackerContext?: any;
  systemPromptOverride?: string;
  temperature?: number;
  enableSearchGrounding?: boolean;
  enableMapsGrounding?: boolean;
  enableHighThinking?: boolean;
  history?: { role: 'user' | 'model' | 'assistant'; text: string }[];
  overrideModel?: string;
  overrideProvider?: AIProviderId;
}

export interface UnifiedAiCallResult {
  reply: string;
  mutations?: Record<string, any> | null;
  suggestedActions?: { id: string; label: string; actionType: string; payload?: any }[];
  modelUsed: string;
  providerUsed: string;
  tokensEstimate?: number;
  groundingSources?: { title?: string; uri?: string; type?: 'web' | 'maps' }[];
}

export const SUPPORTED_AI_MODELS: AIModelDefinition[] = [
  // Google Gemini Family
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    providerName: 'Google Gemini',
    description: 'High-speed multimodal reasoning with live Google Search & Maps Grounding.',
    badge: 'Recommended',
    recommended: true,
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    strengths: ['Real-time Search Grounding', 'High Concurrency', 'Instant UI Mutations']
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    providerName: 'Google Gemini',
    description: 'Complex financial valuation, STEM logic, deep code analysis, and high-precision multimodal vision.',
    badge: 'Deep Reasoning & Vision',
    contextWindow: '2M tokens',
    speed: 'Deep Reasoning',
    strengths: ['Financial Statement Analysis', 'Complex Valuation Math', 'Multimodal PDF OCR']
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    providerName: 'Google Gemini',
    description: 'Ultra-low latency lightweight engine for instant auto-categorization and quick drafts.',
    badge: 'Instant / Fast',
    contextWindow: '1M tokens',
    speed: 'Ultra Fast',
    strengths: ['Sub-second latency', 'Auto-tagging', 'Checklist parsing']
  },

  // OpenAI (ChatGPT) Family
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'openai',
    providerName: 'OpenAI (ChatGPT)',
    description: 'Flagship multimodal model with exceptional commercial awareness and executive writing.',
    badge: 'Flagship',
    recommended: true,
    contextWindow: '128k tokens',
    speed: 'Fast',
    strengths: ['Cold Outreach Conversion', 'Behavioral Interview Prep', 'Natural Prose']
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    providerName: 'OpenAI (ChatGPT)',
    description: 'Cost-efficient lightweight engine for high-frequency task updates and schedule audits.',
    badge: 'Lightweight',
    contextWindow: '128k tokens',
    speed: 'Ultra Fast',
    strengths: ['Cost-effective', 'Quick queries', 'Fast state sync']
  },
  {
    id: 'o3-mini',
    name: 'o3-mini (Reasoning)',
    provider: 'openai',
    providerName: 'OpenAI (ChatGPT)',
    description: 'STEM and quantitative reasoning specialist for finance math and numerical assessments.',
    badge: 'Math & Logic',
    contextWindow: '128k tokens',
    speed: 'Deep Reasoning',
    strengths: ['Quantitative Trading Math', 'Hurdle Rate Calculations', 'DCF Sensitivities']
  },

  // Anthropic Claude Family
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    description: 'Gold standard for natural prose, ATS CV humanization, and behavioral interview coaching.',
    badge: 'ATS & Writing',
    recommended: true,
    contextWindow: '200k tokens',
    speed: 'Fast',
    strengths: ['Resume Bullet Polish', 'Cover Letter Humanization', 'Socratic Interview Drilling']
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    providerName: 'Anthropic Claude',
    description: 'Sub-second latency for immediate quick-capture parsing and state mutations.',
    badge: 'Instant',
    contextWindow: '200k tokens',
    speed: 'Ultra Fast',
    strengths: ['Instant Quick Actions', 'Fast text extraction', 'Real-time parsing']
  },

  // DeepSeek AI Family
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    providerName: 'DeepSeek AI',
    description: 'State-of-the-art open architecture model with exceptional coding and mathematical reasoning.',
    badge: 'Open Architecture',
    recommended: true,
    contextWindow: '64k tokens',
    speed: 'Fast',
    strengths: ['Code Analysis', 'Quantitative Finance', 'Open Model Performance']
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1 (Reasoning)',
    provider: 'deepseek',
    providerName: 'DeepSeek AI',
    description: 'Chain-of-thought mathematical proof and finance quantitative modeling solver.',
    badge: 'Chain-of-Thought',
    contextWindow: '64k tokens',
    speed: 'Deep Reasoning',
    strengths: ['Complex Mathematical Proofs', 'Quantitative Alpha', 'Multi-step Problem Solving']
  },

  // NotebookLM Knowledge RAG
  {
    id: 'notebooklm-rag',
    name: 'NotebookLM Document Grounding',
    provider: 'notebooklm',
    providerName: 'NotebookLM RAG',
    description: 'Strict 100% citation-grounded RAG over your uploaded textbook PDFs, SEC 10-K filings, and notes.',
    badge: '100% Grounded RAG',
    recommended: true,
    contextWindow: '2M tokens',
    speed: 'Deep Reasoning',
    strengths: ['Syllabus RAG', 'SEC 10-K Analysis', '100% Grounded Citations']
  }
];

const API_KEYS_STORAGE_KEY = 'manageme_api_keys';
const ACTIVE_MODEL_STORAGE_KEY = 'manageme_active_ai_model';

/**
 * Retrieves the user's active AI model configuration
 */
export function getActiveAiConfig(): ActiveAiConfig {
  try {
    const raw = localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.provider && parsed.model) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse active AI model config', e);
  }
  return { provider: 'gemini', model: 'gemini-2.5-flash' };
}

/**
 * Updates the user's active AI model configuration
 */
export function setActiveAiConfig(provider: AIProviderId, model: string): void {
  try {
    localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, JSON.stringify({ provider, model }));
    window.dispatchEvent(new CustomEvent('aiModelChanged', { detail: { provider, model } }));
  } catch (e) {
    console.warn('Failed to set active AI model config', e);
  }
}

/**
 * Retrieves stored API keys from the secure vault
 */
export function getStoredApiKeys(): StoredApiKeys {
  try {
    const raw = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored API keys', e);
  }
  return {};
}

/**
 * Saves or updates a provider API key
 */
export function saveApiKey(provider: keyof StoredApiKeys, key: string): void {
  try {
    const current = getStoredApiKeys();
    current[provider] = key.trim();
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('aiKeysUpdated'));
  } catch (e) {
    console.warn('Failed to save API key', e);
  }
}

/**
 * Clears an API key from the vault
 */
export function clearApiKey(provider: keyof StoredApiKeys): void {
  try {
    const current = getStoredApiKeys();
    delete current[provider];
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('aiKeysUpdated'));
  } catch (e) {
    console.warn('Failed to clear API key', e);
  }
}

/**
 * Central router function: executes an AI call through the user's active backend
 */
export async function executeUnifiedAiCall(options: UnifiedAiCallOptions): Promise<UnifiedAiCallResult> {
  const active = getActiveAiConfig();
  const keys = getStoredApiKeys();

  const provider = options.overrideProvider || active.provider;
  const model = options.overrideModel || active.model;

  // Retrieve custom API key if configured by user
  let customApiKey: string | undefined;
  if (provider === 'gemini' && keys.gemini) customApiKey = keys.gemini;
  if (provider === 'openai' && keys.openai) customApiKey = keys.openai;
  if (provider === 'claude' && keys.claude) customApiKey = keys.claude;
  if (provider === 'deepseek' && keys.deepseek) customApiKey = keys.deepseek;
  if (provider === 'custom') {
    customApiKey = keys.customApiKey;
  }

  const payload = {
    provider,
    model,
    message: options.message,
    persona: options.persona,
    activeTab: options.activeTab,
    trackerContext: options.trackerContext,
    systemPromptOverride: options.systemPromptOverride,
    temperature: options.temperature,
    enableSearchGrounding: options.enableSearchGrounding,
    enableMapsGrounding: options.enableMapsGrounding,
    enableHighThinking: options.enableHighThinking,
    history: options.history,
    customApiKey,
    customEndpoint: keys.customEndpoint
  };

  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI Gateway Error (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Tests an AI model connection and returns latency
 */
export async function testAiModelConnection(
  provider: AIProviderId,
  model: string,
  keyOverride?: string
): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const startTime = Date.now();
  const keys = getStoredApiKeys();
  const keyToUse = keyOverride || (keys as any)[provider];

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        model,
        message: 'Respond in JSON with {"reply": "Connection verified successfully"}',
        customApiKey: keyToUse
      })
    });

    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      return { success: true, latencyMs, message: `Connected in ${latencyMs}ms` };
    } else {
      const err = await res.text();
      return { success: false, latencyMs, message: `Failed: ${err.slice(0, 80)}` };
    }
  } catch (e: any) {
    return { success: false, latencyMs: Date.now() - startTime, message: e.message || 'Connection failed' };
  }
}
