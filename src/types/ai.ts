// Type Definitions: AI Assistant, Multi-Model Routing, Personas & Grounding

export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'custom';

export type AIPersona = 
  | 'career-strategist' 
  | 'finance-analyst' 
  | 'interview-coach' 
  | 'ats-optimizer' 
  | 'general-copilot';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProviderId;
  description: string;
  badge?: string;
  recommended?: boolean;
  contextWindow?: string;
}

export interface AIAssistantConfig {
  activeProvider: AIProviderId;
  activeModel: string;
  persona: AIPersona;
  temperature: number;
  systemPromptOverride?: string;
  autoExecuteMutations: boolean;
  searchGrounding: boolean;
  customEndpoint?: string;
  customApiKey?: string;
  connectedProviders: {
    gemini: boolean;
    openai: boolean;
    claude: boolean;
    custom: boolean;
  };
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'model' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  provider?: AIProviderId;
  model?: string;
  mutations?: Record<string, any>;
  suggestedActions?: {
    id: string;
    label: string;
    actionType: 'mutate' | 'navigate' | 'export' | 'copy';
    payload?: any;
  }[];
  citations?: { title: string; url: string }[];
  groundingSources?: { title?: string; uri?: string }[];
  mapsSources?: { title?: string; uri?: string }[];
  audioBase64?: string;
  thinkingLevel?: string;
  imageUrl?: string;
  isError?: boolean;
}
