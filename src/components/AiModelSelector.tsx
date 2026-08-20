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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl border border-white/15 rounded-3xl p-6 sm:p-8 relative max-h-[90vh] flex flex-col overflow-hidden shadow-2xl bg-[#0D0425]/95 backdrop-blur-2xl text-white font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5E6CE7]/20 to-[#C645F9]/30 border border-[#C645F9]/30 flex items-center justify-center text-[#C645F9] shadow-[0_0_15px_rgba(198,69,249,0.25)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
                Universal AI Model Gateway & API Vault
              </h2>
              <p className="text-xs text-[#9A9DBE] font-sans mt-0.5">
                Switch intelligence backends across Gemini, OpenAI, Claude, DeepSeek & NotebookLM
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9A9DBE] hover:text-white transition-colors cursor-pointer border border-white/5 hover:border-white/10"
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
              className="mb-4 p-3 bg-[#00FF66]/15 border border-[#00FF66]/40 rounded-xl text-[#00FF66] text-xs font-semibold font-sans flex items-center justify-between shadow-[0_0_15px_rgba(0,255,102,0.15)]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                <span className="font-sans">{saveSuccessMsg}</span>
              </div>
              <button onClick={() => setSaveSuccessMsg(null)} className="cursor-pointer text-[#00FF66] hover:opacity-80"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 bg-[#150F36] p-1.5 rounded-full border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('models')}
              className={`px-4 py-2 rounded-full text-xs font-semibold font-sans flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'models' 
                  ? 'bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white shadow-[0_0_14px_rgba(198,69,249,0.35)]' 
                  : 'text-[#9A9DBE] hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Engine Switcher ({SUPPORTED_AI_MODELS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2 rounded-full text-xs font-semibold font-sans flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'vault' 
                  ? 'bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white shadow-[0_0_14px_rgba(198,69,249,0.35)]' 
                  : 'text-[#9A9DBE] hover:text-white'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>API Key Vault & Custom Endpoints</span>
            </button>
          </div>

          {/* Active Model Indicator Tag */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#150F36] border border-white/10 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span className="text-[#9A9DBE] font-sans">Active Engine:</span>
            <span className="font-bold text-white font-sans">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans tracking-wide transition-all cursor-pointer ${
                    selectedProviderFilter === f.id
                      ? 'bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white shadow-[0_0_10px_rgba(198,69,249,0.35)]'
                      : 'bg-white/5 text-[#9A9DBE] hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Models Grid: Individual distinct cards with clean gap spacing */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-1 pb-2">
              {filteredModels.map((model) => {
                const isActive = activeConfig.model === model.id;

                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group my-0 shadow-sm ${
                      isActive 
                        ? 'bg-[#C645F9]/15 border-[#C645F9]/60 shadow-[0_0_20px_rgba(198,69,249,0.25)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_0_15px_rgba(94,108,231,0.15)]'
                    }`}
                  >
                    {/* Top row */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-sans uppercase tracking-wide font-semibold text-[#9A9DBE]">
                              {model.providerName}
                            </span>
                            {model.badge && (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans tracking-wide shadow-xs ${
                                model.badge === 'Recommended' ? 'bg-[#C645F9]/30 text-white border border-[#C645F9]/60' :
                                model.badge.includes('Vision') || model.badge.includes('Reasoning') ? 'bg-[#5E6CE7]/30 text-white border border-[#5E6CE7]/60' :
                                model.badge.includes('RAG') ? 'bg-amber-500/30 text-amber-200 border border-amber-500/60' :
                                'bg-[#00FF66]/25 text-[#00FF66] border border-[#00FF66]/50'
                              }`}>
                                {model.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="font-sans font-bold text-base text-white tracking-wide mt-1 group-hover:text-[#C645F9] transition-colors">
                            {model.name}
                          </h3>
                        </div>

                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white flex items-center justify-center shadow-[0_0_10px_rgba(198,69,249,0.4)] shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <button 
                            type="button"
                            className="px-3 py-1 rounded-full bg-white/10 group-hover:bg-[#C645F9]/20 text-xs font-sans font-semibold text-[#9A9DBE] group-hover:text-white border border-transparent group-hover:border-[#C645F9]/40 transition-all shrink-0"
                          >
                            Select
                          </button>
                        )}
                      </div>

                      <p className="text-xs font-sans text-[#9A9DBE] leading-relaxed mb-4">
                        {model.description}
                      </p>
                    </div>

                    {/* Meta Specs & Strengths */}
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-[11px] font-sans font-medium text-[#9A9DBE]">
                        <span className="flex items-center gap-1 font-sans">
                          <Layers className="w-3.5 h-3.5 text-[#C645F9]" /> Context: {model.contextWindow}
                        </span>
                        <span className="flex items-center gap-1 font-sans font-semibold text-[#00FF66]">
                          <Zap className="w-3.5 h-3.5" /> {model.speed}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {model.strengths.map((st, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-sans font-medium text-white/90">
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
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 pt-1 pb-2">
            <div className="p-4 bg-[#150F36] border border-[#C645F9]/30 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#C645F9] shrink-0" />
              <div className="text-xs text-white font-sans">
                <p className="font-semibold text-white mb-0.5">Client-Side Secure Key Storage</p>
                <p className="text-[#9A9DBE]">
                  All custom API keys are saved locally in your browser's private storage (<code className="text-[#C645F9] font-mono">manageme_api_keys</code>). Keys are never transmitted to third parties and are only used for direct inference requests.
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
                <div key={p.id} className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                      <Key className="w-4 h-4 text-[#C645F9]" /> {p.name}
                    </label>
                    <div className="flex items-center gap-2">
                      {hasStored ? (
                        <span className="px-2.5 py-0.5 bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 rounded-full text-[10px] font-bold font-sans flex items-center gap-1">
                          <Check className="w-3 h-3" /> Configured
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-white/5 text-[#9A9DBE] border border-white/10 rounded-full text-[10px] font-semibold font-sans">
                          Not Set
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#9A9DBE] font-sans">{p.hint}</p>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type={isMasked ? 'password' : 'text'}
                        value={keyInputs[p.id]}
                        onChange={e => setKeyInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder={p.placeholder}
                        className="w-full bg-[#08021A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9A9DBE]/50 focus:outline-none focus:border-[#C645F9]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9DBE] hover:text-white cursor-pointer"
                      >
                        {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleSaveKey(p.id)}
                      className="px-4 py-2.5 bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] hover:opacity-95 text-white text-xs font-bold font-sans rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Save Key
                    </button>

                    {hasStored && (
                      <button
                        onClick={() => handleClearKey(p.id)}
                        className="px-3 py-2.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/20 text-xs font-semibold font-sans rounded-xl transition-all cursor-pointer"
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
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold font-sans border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Activity className={`w-3.5 h-3.5 ${testState?.testing ? 'animate-spin text-[#C645F9]' : 'text-[#00FF66]'}`} />
                      <span>{testState?.testing ? 'Testing Ping...' : 'Test Connection'}</span>
                    </button>

                    {testState?.message && (
                      <span className={`text-xs font-sans font-semibold ${testState.success ? 'text-[#00FF66]' : 'text-[#FF3B30]'}`}>
                        {testState.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Custom Endpoint */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-3 shadow-sm">
              <label className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <Globe className="w-4 h-4 text-[#C645F9]" /> Custom / Self-Hosted Endpoint (Ollama / OpenRouter)
              </label>
              <p className="text-xs text-[#9A9DBE] font-sans">
                Connect any local or self-hosted OpenAI-compatible endpoint (e.g. <code>http://localhost:11434/v1/chat/completions</code>).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text"
                  value={keyInputs.customEndpoint}
                  onChange={e => setKeyInputs(prev => ({ ...prev, customEndpoint: e.target.value }))}
                  placeholder="https://openrouter.ai/api/v1/chat/completions"
                  className="bg-[#08021A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9A9DBE]/50 focus:outline-none focus:border-[#C645F9]"
                />
                <input 
                  type="password"
                  value={keyInputs.customApiKey}
                  onChange={e => setKeyInputs(prev => ({ ...prev, customApiKey: e.target.value }))}
                  placeholder="Custom API Key (optional)"
                  className="bg-[#08021A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#9A9DBE]/50 focus:outline-none focus:border-[#C645F9]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    handleSaveKey('customEndpoint');
                    handleSaveKey('customApiKey');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] hover:opacity-95 text-white text-xs font-bold font-sans rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Save Custom Endpoint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#9A9DBE] font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66]"></span>
            <span className="font-sans">Multi-Model Router Ready</span>
          </div>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold font-sans rounded-xl transition-all cursor-pointer border border-white/10 hover:border-white/20"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
