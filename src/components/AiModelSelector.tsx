// Component: Universal AI Model Gateway & API Vault Modal

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
import { useScrollLock } from '../hooks/useScrollLock';

interface AiModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiModelSelector: React.FC<AiModelSelectorProps> = ({ isOpen, onClose }) => {
  useScrollLock(isOpen);

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
    <div 
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md font-sans overflow-hidden overscroll-contain"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl border border-black/[0.08] dark:border-white/15 rounded-3xl p-6 sm:p-7 relative max-h-[92vh] flex flex-col overflow-hidden shadow-2xl bg-white/95 dark:bg-[#0D0425]/95 backdrop-blur-2xl text-[var(--text-primary)] font-sans"
      >
        {/* 1. FIXED HEADER */}
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E6CE7]/20 to-[#C645F9]/30 border border-[#C645F9]/30 flex items-center justify-center text-[#C645F9] shadow-[0_0_15px_rgba(198,69,249,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                Universal AI Model Gateway &amp; API Vault
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
                Switch intelligence backends across Gemini, OpenAI, Claude, DeepSeek &amp; NotebookLM
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-black/[0.06] dark:border-white/10"
            aria-label="Close modal"
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
              className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-sans flex items-center justify-between shadow-xs shrink-0"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-sans">{saveSuccessMsg}</span>
              </div>
              <button onClick={() => setSaveSuccessMsg(null)} className="cursor-pointer text-emerald-500 hover:opacity-80"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. FIXED SUB-HEADER (Tabs & Category Filters) */}
        <div className="space-y-3.5 mb-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-black/[0.04] dark:bg-[#150F36] p-1.5 rounded-full border border-black/[0.06] dark:border-white/10 shadow-inner">
              <button
                onClick={() => setActiveTab('models')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-sans flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'models' 
                    ? 'bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white shadow-[0_0_14px_rgba(198,69,249,0.35)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>AI Engine Switcher ({SUPPORTED_AI_MODELS.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('vault')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-sans flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'vault' 
                    ? 'bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white shadow-[0_0_14px_rgba(198,69,249,0.35)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>API Key Vault</span>
              </button>
            </div>

            {/* Active Model Indicator Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.03] dark:bg-[#150F36] border border-black/[0.06] dark:border-white/10 text-xs font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[var(--text-muted)] font-sans">Active Engine:</span>
              <span className="font-bold text-[var(--text-primary)] font-sans">
                {SUPPORTED_AI_MODELS.find(m => m.id === activeConfig.model)?.name || activeConfig.model}
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          {activeTab === 'models' && (
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide transition-all cursor-pointer ${
                    selectedProviderFilter === f.id
                      ? 'bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white shadow-[0_0_10px_rgba(198,69,249,0.35)]'
                      : 'bg-black/[0.03] dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-black/[0.06] dark:border-white/10 hover:border-black/[0.12]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. SCROLLABLE MODEL GRID (Fixed Max-Height with data-lenis-prevent) */}
        {activeTab === 'models' && (
          <div 
            data-lenis-prevent="true"
            className="max-h-[52vh] overflow-y-auto overscroll-contain pr-2 pb-8 grid grid-cols-1 md:grid-cols-2 gap-3 custom-scrollbar"
          >
            {filteredModels.map((model) => {
              const isActive = activeConfig.model === model.id;

              return (
                <div
                  key={model.id}
                  onClick={() => handleSelectModel(model)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group shadow-xs ${
                    isActive 
                      ? 'bg-[#C645F9]/15 border-[#C645F9]/60 shadow-[0_0_20px_rgba(198,69,249,0.25)]' 
                      : 'border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:border-indigo-500/40 transition-colors'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-[var(--text-muted)]">
                          {model.providerName}
                        </span>
                        <h3 className="font-sans font-bold text-sm sm:text-base text-[var(--text-primary)] tracking-wide mt-0.5 group-hover:text-[#C645F9] transition-colors truncate">
                          {model.name}
                        </h3>
                      </div>

                      {/* Right-aligned Badge Pills & Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {model.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans tracking-wide ${
                            model.badge === 'Recommended' ? 'bg-[#C645F9]/30 text-[#C645F9] dark:text-purple-200 border border-[#C645F9]/60' :
                            model.badge.includes('Vision') || model.badge.includes('Reasoning') ? 'bg-[#5E6CE7]/30 text-indigo-600 dark:text-indigo-200 border border-[#5E6CE7]/60' :
                            model.badge.includes('RAG') ? 'bg-amber-500/30 text-amber-700 dark:text-amber-200 border border-amber-500/60' :
                            'bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/50'
                          }`}>
                            {model.badge}
                          </span>
                        )}

                        {isActive ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white flex items-center justify-center shadow-xs shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <button 
                            type="button"
                            className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/10 group-hover:bg-[#C645F9]/20 text-[11px] font-sans font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] border border-transparent group-hover:border-[#C645F9]/40 transition-all shrink-0"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-sans text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-2">
                      {model.description}
                    </p>
                  </div>

                  {/* Meta Specs & Strengths */}
                  <div className="space-y-2 pt-2.5 border-t border-black/[0.04] dark:border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-sans font-medium text-[var(--text-muted)]">
                      <span className="flex items-center gap-1 font-sans">
                        <Layers className="w-3 h-3 text-[#C645F9]" /> Context: {model.contextWindow}
                      </span>
                      <span className="flex items-center gap-1 font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                        <Zap className="w-3 h-3" /> {model.speed}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {model.strengths.map((st, i) => (
                        <span key={i} className="px-2 py-0.5 bg-black/[0.03] dark:bg-white/5 border border-black/[0.04] dark:border-white/10 rounded-md text-[9px] font-sans font-medium text-[var(--text-primary)]">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: API Key Vault (Scrollable) */}
        {activeTab === 'vault' && (
          <div 
            data-lenis-prevent="true"
            className="max-h-[52vh] overflow-y-auto overscroll-contain pr-2 pb-8 space-y-3 custom-scrollbar"
          >
            <div className="p-3.5 bg-black/[0.02] dark:bg-[#150F36] border border-[#C645F9]/30 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C645F9] shrink-0" />
              <div className="text-xs text-[var(--text-primary)] font-sans">
                <p className="font-semibold mb-0.5">Client-Side Secure Key Storage</p>
                <p className="text-[var(--text-muted)] text-[11px]">
                  All custom API keys are saved locally in your browser&apos;s private storage (<code className="text-[#C645F9] font-mono">manageme_api_keys</code>).
                </p>
              </div>
            </div>

            {/* Provider Key Forms */}
            {[
              { id: 'gemini', name: 'Google Gemini API Key', placeholder: 'AIzaSy...', hint: 'Default shared key active. Override with your own key for higher quotas.', testModel: 'gemini-2.5-flash' },
              { id: 'openai', name: 'OpenAI (ChatGPT) API Key', placeholder: 'sk-proj-...', hint: 'Required for GPT-4o and o3-mini access.', testModel: 'gpt-4o' },
              { id: 'claude', name: 'Anthropic Claude API Key', placeholder: 'sk-ant-...', hint: 'Required for Claude 3.5 Sonnet and Haiku models.', testModel: 'claude-3-5-sonnet-20241022' },
              { id: 'deepseek', name: 'DeepSeek API Key', placeholder: 'sk-...', hint: 'Required for DeepSeek V3 and DeepSeek R1 reasoning.', testModel: 'deepseek-chat' }
            ].map(p => {
              const hasStored = Boolean(apiKeys[p.id as keyof typeof apiKeys]);
              const isMasked = !showKeys[p.id];
              const testState = testResults[p.id];

              return (
                <div key={p.id} className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] rounded-xl space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 font-sans">
                      <Key className="w-3.5 h-3.5 text-[#C645F9]" /> {p.name}
                    </label>
                    <div className="flex items-center gap-2">
                      {hasStored ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-bold font-sans flex items-center gap-1">
                          <Check className="w-3 h-3" /> Configured
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-black/[0.03] dark:bg-white/5 text-[var(--text-muted)] border border-black/[0.06] dark:border-white/10 rounded-full text-[10px] font-semibold font-sans">
                          Not Set
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] font-sans">{p.hint}</p>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type={isMasked ? 'password' : 'text'}
                        value={keyInputs[p.id]}
                        onChange={e => setKeyInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder={p.placeholder}
                        className="w-full bg-black/[0.03] dark:bg-[#08021A] border border-black/[0.08] dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[#C645F9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleSaveKey(p.id)}
                      className="px-3.5 py-2 bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] hover:opacity-95 text-white text-xs font-bold font-sans rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Save
                    </button>

                    {hasStored && (
                      <button
                        onClick={() => handleClearKey(p.id)}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold font-sans rounded-xl transition-all cursor-pointer"
                        title="Delete key"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Test Connection Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleTestConnection(p.id as any, p.testModel)}
                      disabled={testState?.testing}
                      className="px-2.5 py-1 rounded-lg bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 text-[var(--text-primary)] text-[11px] font-semibold font-sans border border-black/[0.06] dark:border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Activity className={`w-3 h-3 ${testState?.testing ? 'animate-spin text-[#C645F9]' : 'text-emerald-500'}`} />
                      <span>{testState?.testing ? 'Testing Ping...' : 'Test Connection'}</span>
                    </button>

                    {testState?.message && (
                      <span className={`text-[11px] font-sans font-semibold ${testState.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {testState.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Custom Endpoint */}
            <div className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] rounded-xl space-y-2.5 shadow-xs">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 font-sans">
                <Globe className="w-3.5 h-3.5 text-[#C645F9]" /> Custom Endpoint (Ollama / OpenRouter)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input 
                  type="text"
                  value={keyInputs.customEndpoint}
                  onChange={e => setKeyInputs(prev => ({ ...prev, customEndpoint: e.target.value }))}
                  placeholder="https://openrouter.ai/api/v1/chat/completions"
                  className="bg-black/[0.03] dark:bg-[#08021A] border border-black/[0.08] dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[#C645F9]"
                />
                <input 
                  type="password"
                  value={keyInputs.customApiKey}
                  onChange={e => setKeyInputs(prev => ({ ...prev, customApiKey: e.target.value }))}
                  placeholder="Custom API Key (optional)"
                  className="bg-black/[0.03] dark:bg-[#08021A] border border-black/[0.08] dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[#C645F9]"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    handleSaveKey('customEndpoint');
                    handleSaveKey('customApiKey');
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] hover:opacity-95 text-white text-xs font-bold font-sans rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Save Custom Endpoint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. FIXED FOOTER */}
        <div className="pt-3.5 mt-auto border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)] font-sans shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-sans font-medium text-emerald-600 dark:text-emerald-400">🟢 Multi-Model Router Ready</span>
          </div>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/20 text-[var(--text-primary)] font-semibold font-sans rounded-xl transition-all cursor-pointer border border-black/[0.08] dark:border-white/10"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AiModelSelector;
