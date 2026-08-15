import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Cpu, 
  Key, 
  Check, 
  X, 
  ShieldCheck, 
  Zap, 
  Brain, 
  Globe, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Activity,
  Layers
} from 'lucide-react';
import { 
  SUPPORTED_AI_MODELS, 
  AIModelDefinition, 
  AIProviderId, 
  getActiveAiConfig, 
  setActiveAiConfig, 
  getStoredApiKeys, 
  saveApiKey, 
  clearApiKey, 
  testAiModelConnection 
} from '../lib/aiGateway';

interface AiModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiModelSelector: React.FC<AiModelSelectorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'models' | 'vault'>('models');
  const [activeConfig, setActiveConfig] = useState(getActiveAiConfig());
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState(getStoredApiKeys());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({
    gemini: '',
    openai: '',
    claude: '',
    deepseek: '',
    customApiKey: '',
    customEndpoint: ''
  });
  const [testResults, setTestResults] = useState<Record<string, { testing: boolean; success?: boolean; message?: string }>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentKeys = getStoredApiKeys();
    setApiKeys(currentKeys);
    setKeyInputs({
      gemini: currentKeys.gemini || '',
      openai: currentKeys.openai || '',
      claude: currentKeys.claude || '',
      deepseek: currentKeys.deepseek || '',
      customApiKey: currentKeys.customApiKey || '',
      customEndpoint: currentKeys.customEndpoint || ''
    });
    setActiveConfig(getActiveAiConfig());
  }, [isOpen]);

  const handleSelectModel = (model: AIModelDefinition) => {
    setActiveAiConfig(model.provider, model.id);
    setActiveConfig({ provider: model.provider, model: model.id });
    setSaveSuccessMsg(`Active AI engine switched to ${model.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveKey = (provider: any) => {
    const val = keyInputs[provider];
    if (val && val.trim()) {
      saveApiKey(provider, val.trim());
      setApiKeys(getStoredApiKeys());
      setSaveSuccessMsg(`Saved API key for ${provider.toUpperCase()}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleClearKey = (provider: any) => {
    clearApiKey(provider);
    setKeyInputs(prev => ({ ...prev, [provider]: '' }));
    setApiKeys(getStoredApiKeys());
  };

  const handleTestConnection = async (provider: AIProviderId, modelId: string) => {
    setTestResults(prev => ({ ...prev, [provider]: { testing: true } }));
    const result = await testAiModelConnection(provider, modelId, keyInputs[provider]);
    setTestResults(prev => ({
      ...prev,
      [provider]: { testing: false, success: result.success, message: result.message }
    }));
  };

  const filteredModels = selectedProviderFilter === 'all' 
    ? SUPPORTED_AI_MODELS 
    : SUPPORTED_AI_MODELS.filter(m => m.provider === selectedProviderFilter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl glass-panel border border-[var(--border)] rounded-2xl p-6 sm:p-8 relative max-h-[90vh] flex flex-col overflow-hidden shadow-2xl bg-[#0c0c0e]/95 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Universal AI Model Gateway & API Vault
              </h2>
              <p className="text-xs text-gray-400">
                Switch intelligence backends across Gemini, OpenAI, Claude, DeepSeek & NotebookLM
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        <AnimatePresence>
          {saveSuccessMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveSuccessMsg}</span>
              </div>
              <button onClick={() => setSaveSuccessMsg(null)}><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setActiveTab('models')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'models' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Engine Switcher ({SUPPORTED_AI_MODELS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'vault' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>API Key Vault & Custom Endpoints</span>
            </button>
          </div>

          {/* Active Model Indicator Tag */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-400">Active Engine:</span>
            <span className="font-bold text-purple-300">
              {SUPPORTED_AI_MODELS.find(m => m.id === activeConfig.model)?.name || activeConfig.model}
            </span>
          </div>
        </div>

        {/* Tab 1: AI Model Switcher */}
        {activeTab === 'models' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Models' },
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'openai', label: 'OpenAI (ChatGPT)' },
                { id: 'claude', label: 'Anthropic Claude' },
                { id: 'deepseek', label: 'DeepSeek AI' },
                { id: 'notebooklm', label: 'NotebookLM RAG' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedProviderFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedProviderFilter === f.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-black/20 text-gray-400 hover:text-gray-200 border border-[var(--border)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Models Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModels.map((model) => {
                const isActive = activeConfig.model === model.id;
                const hasKey = Boolean(apiKeys[model.provider as keyof typeof apiKeys] || model.provider === 'gemini' || model.provider === 'notebooklm');

                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                      isActive 
                        ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10' 
                        : 'bg-black/30 border-[var(--border)] hover:border-purple-500/40 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Top row */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                              {model.providerName}
                            </span>
                            {model.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                model.badge === 'Recommended' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                model.badge.includes('Vision') || model.badge.includes('Reasoning') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                model.badge.includes('RAG') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {model.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-white mt-1 group-hover:text-purple-300 transition-colors">
                            {model.name}
                          </h3>
                        </div>

                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <button 
                            className="px-2.5 py-1 rounded-lg bg-white/5 group-hover:bg-purple-600/20 text-xs text-gray-400 group-hover:text-purple-300 border border-transparent group-hover:border-purple-500/30 transition-all"
                          >
                            Select
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        {model.description}
                      </p>
                    </div>

                    {/* Meta Specs & Strengths */}
                    <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-purple-400" /> Context: {model.contextWindow}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Zap className="w-3 h-3" /> {model.speed}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {model.strengths.map((st, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-300">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: API Key Vault */}
        {activeTab === 'vault' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0" />
              <div className="text-xs text-gray-300">
                <p className="font-semibold text-purple-300 mb-0.5">Client-Side Secure Key Storage</p>
                <p className="text-gray-400">
                  All custom API keys are saved locally in your browser's private storage (<code className="text-purple-300">manageme_api_keys</code>). Keys are never transmitted to third parties and are only used for your direct inference requests.
                </p>
              </div>
            </div>

            {/* Provider Key Forms */}
            {[
              { id: 'gemini', name: 'Google Gemini API Key', placeholder: 'AIzaSy...', hint: 'Default shared key active. Override with your own key for higher rate limits.', testModel: 'gemini-2.5-flash' },
              { id: 'openai', name: 'OpenAI (ChatGPT) API Key', placeholder: 'sk-proj-...', hint: 'Required for GPT-4o and o3-mini access.', testModel: 'gpt-4o' },
              { id: 'claude', name: 'Anthropic Claude API Key', placeholder: 'sk-ant-...', hint: 'Required for Claude 3.5 Sonnet and Haiku models.', testModel: 'claude-3-5-sonnet-20241022' },
              { id: 'deepseek', name: 'DeepSeek API Key', placeholder: 'sk-...', hint: 'Required for DeepSeek V3 and DeepSeek R1 reasoning.', testModel: 'deepseek-chat' }
            ].map(p => {
              const hasStored = Boolean(apiKeys[p.id as keyof typeof apiKeys]);
              const isMasked = !showKeys[p.id];
              const testState = testResults[p.id];

              return (
                <div key={p.id} className="p-5 bg-black/30 border border-[var(--border)] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-400" /> {p.name}
                    </label>
                    <div className="flex items-center gap-2">
                      {hasStored ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Configured
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-[10px] font-semibold">
                          Not Set
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">{p.hint}</p>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type={isMasked ? 'password' : 'text'}
                        value={keyInputs[p.id]}
                        onChange={e => setKeyInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder={p.placeholder}
                        className="w-full bg-black/40 border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleSaveKey(p.id)}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                    >
                      Save Key
                    </button>

                    {hasStored && (
                      <button
                        onClick={() => handleClearKey(p.id)}
                        className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        title="Delete key"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Test Connection Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleTestConnection(p.id as any, p.testModel)}
                      disabled={testState?.testing}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-[var(--border)] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Activity className={`w-3.5 h-3.5 ${testState?.testing ? 'animate-spin text-purple-400' : 'text-emerald-400'}`} />
                      <span>{testState?.testing ? 'Testing Ping...' : 'Test Connection'}</span>
                    </button>

                    {testState?.message && (
                      <span className={`text-xs font-mono ${testState.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {testState.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Custom Endpoint */}
            <div className="p-5 bg-black/30 border border-[var(--border)] rounded-2xl space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" /> Custom / Self-Hosted Endpoint (Ollama / OpenRouter)
              </label>
              <p className="text-xs text-gray-400">
                Connect any local or self-hosted OpenAI-compatible endpoint (e.g. <code>http://localhost:11434/v1/chat/completions</code>).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text"
                  value={keyInputs.customEndpoint}
                  onChange={e => setKeyInputs(prev => ({ ...prev, customEndpoint: e.target.value }))}
                  placeholder="https://openrouter.ai/api/v1/chat/completions"
                  className="bg-black/40 border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500/60"
                />
                <input 
                  type="password"
                  value={keyInputs.customApiKey}
                  onChange={e => setKeyInputs(prev => ({ ...prev, customApiKey: e.target.value }))}
                  placeholder="Custom API Key (optional)"
                  className="bg-black/40 border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    handleSaveKey('customEndpoint');
                    handleSaveKey('customApiKey');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Save Custom Endpoint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Multi-Model Router Ready</span>
          </div>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
