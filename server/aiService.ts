import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

export interface AIProviderStatus {
  id: 'gemini' | 'openai' | 'claude' | 'custom';
  name: string;
  isConfigured: boolean;
  models: {
    id: string;
    name: string;
    description: string;
    badge?: string;
    recommended?: boolean;
    contextWindow?: string;
  }[];
}

export interface ChatRequestOptions {
  provider?: 'gemini' | 'openai' | 'claude' | 'custom';
  model?: string;
  message: string;
  history?: { role: 'user' | 'model' | 'assistant'; text: string }[];
  trackerContext?: any;
  activeTab?: string;
  persona?: string;
  systemPromptOverride?: string;
  temperature?: number;
  customApiKey?: string;
  customEndpoint?: string;
  enableSearchGrounding?: boolean;
  enableMapsGrounding?: boolean;
  enableHighThinking?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface ChatResponseResult {
  reply: string;
  mutations?: Record<string, any> | null;
  suggestedActions?: {
    id: string;
    label: string;
    actionType: 'mutate' | 'navigate' | 'export' | 'copy';
    payload?: any;
  }[];
  modelUsed: string;
  providerUsed: string;
  tokensEstimate?: number;
  groundingSources?: { title?: string; uri?: string; type?: 'web' | 'maps' }[];
  thinkingProcess?: string;
}

export function getProvidersStatus(): AIProviderStatus[] {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '');
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== '');

  return [
    {
      id: 'gemini',
      name: 'Google Gemini',
      isConfigured: hasGemini,
      models: [
        {
          id: 'gemini-3.5-flash',
          name: 'Gemini 3.5 Flash',
          description: 'General intelligence, real-time Search Grounding and Maps Grounding.',
          badge: 'Recommended',
          recommended: true,
          contextWindow: '1M tokens'
        },
        {
          id: 'gemini-3.1-pro-preview',
          name: 'Gemini 3.1 Pro (High Thinking & Image Analysis)',
          description: 'Complex financial valuation, STEM logic, deep code analysis, and high-precision multimodal image understanding.',
          badge: 'Deep Reasoning & Vision',
          contextWindow: '2M tokens'
        },
        {
          id: 'gemini-3.1-flash-lite',
          name: 'Gemini 3.1 Flash-Lite',
          description: 'Ultra-fast latency for instant queries, quick tagging, and swift workspace mutations.',
          badge: 'Instant / Fast',
          contextWindow: '1M tokens'
        }
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI (ChatGPT)',
      isConfigured: hasOpenAI,
      models: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o (Omni)',
          description: 'Flagship multimodal model with deep nuance in commercial awareness and career writing.',
          badge: 'Flagship',
          recommended: true,
          contextWindow: '128k tokens'
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Ultra-fast, cost-efficient model ideal for quick queries and task modifications.',
          badge: 'Lightweight',
          contextWindow: '128k tokens'
        },
        {
          id: 'o3-mini',
          name: 'o3-mini (Reasoning)',
          description: 'STEM and quantitative reasoning specialist for finance math and numerical assessments.',
          badge: 'Math & Logic',
          contextWindow: '128k tokens'
        }
      ]
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      isConfigured: hasClaude,
      models: [
        {
          id: 'claude-3-7-sonnet-20250219',
          name: 'Claude 3.7 Sonnet',
          description: 'Hybrid reasoning and leading coding/writing intelligence for tailored cover letters and applications.',
          badge: 'Hybrid Reasoning',
          recommended: true,
          contextWindow: '200k tokens'
        },
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          description: 'Gold standard for natural prose, ATS CV humanization, and behavioral interview coaching.',
          badge: 'ATS & Writing',
          contextWindow: '200k tokens'
        },
        {
          id: 'claude-3-5-haiku-20241022',
          name: 'Claude 3.5 Haiku',
          description: 'Sub-second latency for immediate quick-capture parsing and state mutations.',
          badge: 'Instant',
          contextWindow: '200k tokens'
        }
      ]
    },
    {
      id: 'custom',
      name: 'Custom / OpenAI-Compatible',
      isConfigured: true,
      models: [
        {
          id: 'custom-model',
          name: 'Custom Endpoint / Self-Hosted',
          description: 'Connect any OpenAI-compatible API (Ollama, LMStudio, OpenRouter, vLLM).',
          badge: 'BYO Endpoint',
          contextWindow: 'Variable'
        }
      ]
    }
  ];
}

function buildSystemPrompt(persona?: string, activeTab?: string, trackerContext?: any, override?: string): string {
  if (override && override.trim()) {
    return `${override}\n\nWorkspace Context (${activeTab || 'overview'}):\n${JSON.stringify(trackerContext || {}, null, 2)}`;
  }

  const personaDescriptions: Record<string, string> = {
    'career-strategist': 'You are an elite UK & Global Finance Career Strategist and Graduate Recruiter mentor. You specialize in guiding Durham MSc Finance students to secure competitive graduate schemes (Investment Banking, Asset Management, Private Equity, Big 4 Advisory, and Quantitative Trading). Give sharp, actionable, firm-tailored application advice.',
    'finance-analyst': 'You are a Senior Investment Banking & Valuation Analyst. You help with DCF models, WACC calculations, LBO adjustments, 3-statement financial accounting, market intelligence, M&A deal rationale, and investment pitches.',
    'interview-coach': 'You are a rigorous Assessment Centre and Interview Coach. You drill students using the STAR method (Situation, Task, Action, Result) for competency interviews, and probe deeply on technical finance, commercial awareness, and market brainteasers.',
    'ats-optimizer': 'You are an ATS (Applicant Tracking System) and CV Optimization Specialist. You convert passive resumes into high-impact, metrics-driven bullet points with strong power verbs, eliminating AI-sounding clichés.',
    'general-copilot': 'You are the intelligent Durham MSc Career Tracker Copilot. You can answer queries, audit deadlines, optimize work shift hours against the Tier 4 20-hour visa cap, analyze skill gaps, and manage the student workspace.'
  };

  const personaText = personaDescriptions[persona || 'career-strategist'] || personaDescriptions['general-copilot'];

  return `${personaText}

WORKSPACE CONTEXT:
The user is currently focused on the "${activeTab || 'general'}" section of the tracker.
Here is their real-time tracker data:
${JSON.stringify(trackerContext || {}, null, 2)}

OPERATIONAL CAPABILITIES & STATE MUTATIONS:
You have direct read and write permission on the user's workspace.
When the user asks you to modify, add, or organize anything (e.g. logging a work shift, adding a target firm/scheme, tracking an expense, adding a missing skill, updating visa hours, checking a task):
You MUST formulate a "mutations" object containing the partial UserTrackerData to merge into the user's state.

Schema guidelines for "mutations":
- Add / Update Graduate Schemes: { "gradSchemes": [ ...existing ones, { id, firm, roleTitle, sector, appOpens, appCloses, salary, status, notes } ] }
- Add / Update Skills: { "skillsTracker": [ ...existing ones, { id, name, category, proficiency, priority, status, keyBenefit, timeToComplete } ] }
- Add / Update Universal Tasks: { "universalTasks": [ ...existing ones, { id, title, priority, dueDate, completed, category } ] }
- Add Work Shift: { "workShifts": [ ...existing ones, { id, date, startTime, endTime, hours, hourlyRate } ] }
- Add Expense: { "expenses": [ ...existing ones, { id, amount, category, date, description } ] }
- Update Visa / Term Time: { "visaLimit": 20, "termStatus": "Term Time" | "Vacation" }

OUTPUT FORMAT:
You must respond with valid JSON matching this schema:
{
  "reply": "Your clear, markdown-formatted conversational response with bold headings, bullet points, and strategic advice.",
  "mutations": { ...partial state object or null if no state changes needed },
  "suggestedActions": [
    { "id": "action-1", "label": "Short Action Title", "actionType": "mutate" | "navigate" | "export", "payload": { ... } }
  ]
}

Always return STRICT JSON only.`;
}

// 1. Google Gemini Provider
async function callGemini(options: ChatRequestOptions, systemInstruction: string): Promise<ChatResponseResult> {
  const apiKey = options.customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('Gemini API Key is not configured. Please add your GEMINI_API_KEY in the platform secrets or provider settings.');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  // Determine model based on task requirements:
  // - gemini-3.1-pro-preview for complex tasks, high thinking, and image analysis
  // - gemini-3.5-flash for general tasks, Search Grounding, and Maps Grounding
  // - gemini-3.1-flash-lite for fast quick tasks
  let modelName = options.model || 'gemini-3.5-flash';
  if (options.enableHighThinking || options.imageBase64) {
    modelName = 'gemini-3.1-pro-preview';
  }

  const contents: any[] = [];
  if (options.history && Array.isArray(options.history)) {
    for (const msg of options.history) {
      const role = msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: msg.text }] });
    }
  }

  // Handle multimodal image input if provided
  const userParts: any[] = [];
  if (options.imageBase64) {
    userParts.push({
      inlineData: {
        data: options.imageBase64,
        mimeType: options.imageMimeType || 'image/jpeg'
      }
    });
  }
  userParts.push({ text: options.message });
  contents.push({ role: 'user', parts: userParts });

  // Configure tools for Search Grounding and Maps Grounding
  const tools: any[] = [];
  if (options.enableSearchGrounding) {
    tools.push({ googleSearch: {} });
  } else if (options.enableMapsGrounding) {
    tools.push({ googleMaps: {} });
  }

  // Model config
  const config: any = {
    systemInstruction: systemInstruction,
    temperature: options.temperature ?? 0.7,
  };

  // High thinking mode for gemini-3.1-pro-preview
  if (options.enableHighThinking || modelName === 'gemini-3.1-pro-preview') {
    config.thinkingConfig = {
      thinkingLevel: ThinkingLevel.HIGH
    };
    // Note: Do not set maxOutputTokens when using High Thinking
  }

  if (tools.length > 0) {
    config.tools = tools;
  } else {
    // Structured JSON response schema when tools like search/maps aren't interfering
    config.responseMimeType = 'application/json';
    config.responseSchema = {
      type: Type.OBJECT,
      properties: {
        reply: { type: Type.STRING, description: 'Your conversational reply with formatted markdown.' },
        mutations: { type: Type.OBJECT, description: 'State changes to merge into tracker data.' },
        suggestedActions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              actionType: { type: Type.STRING },
              payload: { type: Type.OBJECT }
            },
            required: ['id', 'label', 'actionType']
          }
        }
      },
      required: ['reply']
    };
  }

  let response: any = null;
  const modelCandidates = [modelName, 'gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;

  for (let attempt = 0; attempt < modelCandidates.length; attempt++) {
    const currentModel = modelCandidates[attempt];
    try {
      response = await ai.models.generateContent({
        model: currentModel,
        contents: contents,
        config: config
      });
      modelName = currentModel;
      break;
    } catch (err: any) {
      lastErr = err;
      console.warn(`[Gemini Chat Retry] Attempt ${attempt + 1}/${modelCandidates.length} failed with model ${currentModel}: ${err.message}`);
      if (attempt < modelCandidates.length - 1) {
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  if (!response) {
    throw lastErr;
  }

  // Extract grounding metadata chunks for Search and Maps Grounding
  const groundingSources: { title?: string; uri?: string; type?: 'web' | 'maps' }[] = [];
  const candidate = response.candidates?.[0];
  if (candidate?.groundingMetadata?.groundingChunks) {
    for (const chunk of candidate.groundingMetadata.groundingChunks) {
      if (chunk.web?.uri) {
        groundingSources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
          type: 'web'
        });
      }
      if (chunk.maps?.uri || chunk.maps?.placeId) {
        groundingSources.push({
          title: chunk.maps.title || 'Google Maps Location',
          uri: chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title || '')}`,
          type: 'maps'
        });
      }
    }
  }

  const rawText = response.text?.trim() || '{}';
  let parsed: any = {};
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = { reply: rawText, mutations: null };
  }

  return {
    reply: parsed.reply || rawText,
    mutations: parsed.mutations || null,
    suggestedActions: parsed.suggestedActions || [],
    modelUsed: modelName,
    providerUsed: 'gemini',
    groundingSources: groundingSources.length > 0 ? groundingSources : undefined
  };
}

// 2. OpenAI (ChatGPT) Provider
async function callOpenAI(options: ChatRequestOptions, systemInstruction: string): Promise<ChatResponseResult> {
  const apiKey = options.customApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OpenAI API Key is not configured. Please add your OPENAI_API_KEY to connect ChatGPT models.');
  }

  const endpoint = options.customEndpoint || 'https://api.openai.com/v1/chat/completions';
  const modelName = options.model || 'gpt-4o';

  const messages: any[] = [{ role: 'system', content: systemInstruction }];
  if (options.history && Array.isArray(options.history)) {
    for (const msg of options.history) {
      const role = msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user';
      messages.push({ role, content: msg.text });
    }
  }
  messages.push({ role: 'user', content: options.message });

  const payload: any = {
    model: modelName,
    messages: messages,
    response_format: { type: 'json_object' }
  };

  if (!modelName.startsWith('o3') && !modelName.startsWith('o1')) {
    payload.temperature = options.temperature ?? 0.7;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '{}';
  let parsed: any = {};
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    parsed = { reply: rawContent, mutations: null };
  }

  return {
    reply: parsed.reply || rawContent,
    mutations: parsed.mutations || null,
    suggestedActions: parsed.suggestedActions || [],
    modelUsed: modelName,
    providerUsed: 'openai',
    tokensEstimate: data.usage?.total_tokens
  };
}

// 3. Anthropic (Claude) Provider
async function callClaude(options: ChatRequestOptions, systemInstruction: string): Promise<ChatResponseResult> {
  const apiKey = options.customApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Anthropic API Key is not configured. Please add your ANTHROPIC_API_KEY to connect Claude models.');
  }

  const modelName = options.model || 'claude-3-7-sonnet-20250219';

  const messages: any[] = [];
  if (options.history && Array.isArray(options.history)) {
    for (const msg of options.history) {
      const role = msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user';
      messages.push({ role, content: msg.text });
    }
  }
  messages.push({ role: 'user', content: `${options.message}\n\nIMPORTANT: Return strictly a valid JSON object with keys "reply" and optionally "mutations" and "suggestedActions".` });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 4096,
      temperature: options.temperature ?? 0.7,
      system: systemInstruction,
      messages: messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic Claude API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.content?.[0]?.text || '';
  
  let parsed: any = {};
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = { reply: rawContent };
    }
  } catch {
    parsed = { reply: rawContent };
  }

  return {
    reply: parsed.reply || rawContent,
    mutations: parsed.mutations || null,
    suggestedActions: parsed.suggestedActions || [],
    modelUsed: modelName,
    providerUsed: 'claude',
    tokensEstimate: data.usage?.input_tokens + data.usage?.output_tokens
  };
}

// 4. Custom / OpenAI-Compatible Provider
async function callCustom(options: ChatRequestOptions, systemInstruction: string): Promise<ChatResponseResult> {
  const endpoint = options.customEndpoint || 'http://localhost:11434/v1/chat/completions';
  const apiKey = options.customApiKey || 'sk-local';
  const modelName = options.model || 'llama3';

  const messages: any[] = [{ role: 'system', content: systemInstruction }];
  if (options.history && Array.isArray(options.history)) {
    for (const msg of options.history) {
      const role = msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user';
      messages.push({ role, content: msg.text });
    }
  }
  messages.push({ role: 'user', content: `${options.message}\n\nRespond in JSON with "reply" and "mutations".` });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      temperature: options.temperature ?? 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Custom Provider Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '{}';
  let parsed: any = {};
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = { reply: rawContent };
    }
  } catch {
    parsed = { reply: rawContent };
  }

  return {
    reply: parsed.reply || rawContent,
    mutations: parsed.mutations || null,
    suggestedActions: parsed.suggestedActions || [],
    modelUsed: modelName,
    providerUsed: 'custom'
  };
}

// Main Unified Dispatcher
export async function executeMultiModelChat(options: ChatRequestOptions): Promise<ChatResponseResult> {
  const systemInstruction = buildSystemPrompt(
    options.persona,
    options.activeTab,
    options.trackerContext,
    options.systemPromptOverride
  );

  let targetProvider = options.provider || 'gemini';

  // Fallback to configured provider if requested provider is missing API key
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '');
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== '');

  if (targetProvider === 'openai' && !hasOpenAI && !options.customApiKey) {
    if (hasGemini) targetProvider = 'gemini';
    else if (hasClaude) targetProvider = 'claude';
  } else if (targetProvider === 'claude' && !hasClaude && !options.customApiKey) {
    if (hasGemini) targetProvider = 'gemini';
    else if (hasOpenAI) targetProvider = 'openai';
  }

  switch (targetProvider) {
    case 'openai':
      return await callOpenAI(options, systemInstruction);
    case 'claude':
      return await callClaude(options, systemInstruction);
    case 'custom':
      return await callCustom(options, systemInstruction);
    case 'gemini':
    default:
      return await callGemini(options, systemInstruction);
  }
}
