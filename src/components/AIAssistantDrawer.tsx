import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { triggerHaptic, IOS_SPRING } from '../utils/haptics';
import { 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Globe, 
  Settings, 
  ChevronDown, 
  Check, 
  RefreshCw, 
  Bot, 
  Zap, 
  Layers, 
  Sliders, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Mic, 
  MicOff, 
  Download, 
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import { useSettings } from '../context/SettingsContext';
import { appLogger, withSafeExecution } from '../utils/logger';
import { useScrollLock } from '../hooks/useScrollLock';
import { AIProviderId, AIPersona, AIAssistantMessage, AIModelOption } from '../types';
import { isAnnualReportFetchCommand, fetchAnnualReport, saveAndGroundAnnualReport, analyzeAnnualReportSuite } from '../utils/annualReportPipeline';

interface AIAssistantDrawerProps {
  trackerContext: any;
  activeTab: string;
  onMutateState?: (mutations: any) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

const AVAILABLE_MODELS: AIModelOption[] = [
  // Google Gemini Models
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'gemini',
    description: 'Fast hybrid reasoning, default for real-time finance & tracking.',
    badge: 'Recommended',
    recommended: true,
    contextWindow: '1M tokens'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'gemini',
    description: 'Advanced STEM & complex financial valuation reasoning.',
    badge: 'Deep Reasoning',
    contextWindow: '2M tokens'
  },
  // OpenAI ChatGPT Models
  {
    id: 'gpt-4o',
    name: 'ChatGPT GPT-4o',
    provider: 'openai',
    description: 'Flagship OpenAI multimodal intelligence for career strategies.',
    badge: 'OpenAI Flagship',
    recommended: true,
    contextWindow: '128k tokens'
  },
  {
    id: 'gpt-4o-mini',
    name: 'ChatGPT GPT-4o Mini',
    provider: 'openai',
    description: 'Ultra-fast, concise assistant for quick task logging.',
    badge: 'Fast & Light',
    contextWindow: '128k tokens'
  },
  {
    id: 'o3-mini',
    name: 'ChatGPT o3-mini',
    provider: 'openai',
    description: 'Quantitative reasoning specialist for numerical finance drills.',
    badge: 'Math Specialist',
    contextWindow: '128k tokens'
  },
  // Anthropic Claude Models
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    provider: 'claude',
    description: 'Hybrid reasoning and premier cover letter & resume crafting.',
    badge: 'Claude Hybrid',
    recommended: true,
    contextWindow: '200k tokens'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    description: 'Natural prose writer, ATS CV humanizer and behavioral coach.',
    badge: 'CV & Prose',
    contextWindow: '200k tokens'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    description: 'Instant response latency for quick workspace updates.',
    badge: 'Instant',
    contextWindow: '200k tokens'
  },
  // Custom Provider
  {
    id: 'custom-model',
    name: 'Custom Endpoint / Local LLM',
    provider: 'custom',
    description: 'Connect any OpenAI-compatible API (Ollama, LM Studio, OpenRouter, vLLM).',
    badge: 'BYO Endpoint',
    contextWindow: 'Variable'
  }
];

const PERSONAS: { id: AIPersona; label: string; icon: string; desc: string }[] = [
  { id: 'career-strategist', label: 'UK Career Strategist', icon: '💼', desc: 'Graduate schemes, Spring weeks & recruiter outreach' },
  { id: 'finance-analyst', label: 'Valuation & Deal Analyst', icon: '📊', desc: 'DCF modeling, accounting adjustments & market news' },
  { id: 'interview-coach', label: 'Assessment Centre Coach', icon: '🎙️', desc: 'STAR behavioral drills & competency interviews' },
  { id: 'ats-optimizer', label: 'ATS CV Optimizer', icon: '📝', desc: 'Bullet point metrics & keyword enhancement' },
  { id: 'general-copilot', label: 'Workspace Copilot', icon: '⚡', desc: 'Timetable, Tier 4 visa hours & state mutations' }
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ 
  trackerContext, 
  activeTab, 
  onMutateState,
  isOpenExternal,
  onCloseExternal
}) => {
  const { settings } = useSettings();
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : isOpenInternal;
  const setIsOpen = (val: boolean) => {
    if (onCloseExternal && !val) onCloseExternal();
    else setIsOpenInternal(val);
  };

  useScrollLock(isOpen);

  // Model & Provider State
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(() => {
    return (localStorage.getItem('ai_preferred_provider') as AIProviderId) || 'gemini';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('ai_preferred_model') || 'gemini-3.7-flash';
  });
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(() => {
    return (localStorage.getItem('ai_preferred_persona') as AIPersona) || 'career-strategist';
  });

  const [temperature, setTemperature] = useState<number>(0.7);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelDropdown]);

  // BYO API Keys stored safely in user localStorage
  const [customOpenAIKey, setCustomOpenAIKey] = useState(() => localStorage.getItem('byo_openai_key') || '');
  const [customClaudeKey, setCustomClaudeKey] = useState(() => localStorage.getItem('byo_claude_key') || '');
  const [customEndpoint, setCustomEndpoint] = useState(() => localStorage.getItem('byo_custom_endpoint') || '');

  // Provider Connection Status from backend
  const [providerStatuses, setProviderStatuses] = useState<Record<string, boolean>>({
    gemini: true,
    openai: false,
    claude: false,
    custom: false
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProviders = async () => {
      try {
        const res = await fetch('/api/ai/providers');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (isMounted && data?.providers && Array.isArray(data.providers)) {
            const map: Record<string, boolean> = {};
            data.providers.forEach((p: any) => {
              if (p?.id) {
                map[p.id] = !!p.isConfigured;
              }
            });
            setProviderStatuses(prev => ({ ...prev, ...map }));
          }
        }
      } catch (err) {
        console.warn('Provider check error:', err);
      }
    };

    fetchProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    { 
      id: 'welcome-1',
      role: 'model', 
      text: `Ready. Loaded context across ${trackerContext?.gradSchemes?.length || 6} graduate applications, certifications, timetable, and financial ledger.\n\nWhere are we focusing first?\n• Application prep & cover letter drafting\n• Valuation model or deal review\n• Assessment center prep & practice`,
      timestamp: Date.now(),
      provider: selectedProvider,
      model: selectedModel
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showSettingsPanel]);

  // Voice dictation using Web Speech API
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init error:', e);
      setIsListening(false);
    }
  };

  const handleProviderSelect = (provider: AIProviderId, modelId?: string) => {
    setSelectedProvider(provider);
    localStorage.setItem('ai_preferred_provider', provider);
    
    // Choose sensible default model for provider
    let defaultModel = modelId;
    if (!defaultModel) {
      const first = AVAILABLE_MODELS.find(m => m.provider === provider);
      defaultModel = first ? first.id : 'gemini-3.7-flash';
    }
    setSelectedModel(defaultModel);
    localStorage.setItem('ai_preferred_model', defaultModel);
    setShowModelDropdown(false);
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || input).trim();
    if (!textToSend || isLoading) return;

    if (!overridePrompt) setInput('');
    const userMsgId = `user-${Date.now()}`;
    const newMsg: AIAssistantMessage = {
      id: userMsgId,
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
      provider: selectedProvider,
      model: selectedModel
    };

    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    await withSafeExecution('AI_Assistant_Chat', async () => {
      // 1. Check if user input is an Annual Report Fetch Command
      const reportCmd = isAnnualReportFetchCommand(textToSend);
      if (reportCmd.isMatch) {
        try {
          const doc = await fetchAnnualReport(reportCmd.company, reportCmd.year);
          saveAndGroundAnnualReport(doc, trackerContext, onMutateState);

          const metricsStr = doc.keyMetrics
            ? `• **Revenue:** ${doc.keyMetrics.revenue || 'N/A'}\n• **Net Income:** ${doc.keyMetrics.netIncome || 'N/A'}\n• **Free Cash Flow:** ${doc.keyMetrics.freeCashFlow || 'N/A'}\n• **Gross Margin:** ${doc.keyMetrics.grossMargin || 'N/A'}`
            : '';

          const replyText = `✅ **Successfully Downloaded & Grounded 10-K Annual Report**\n\n📄 **Document:** ${doc.name}\n🏢 **Company:** ${doc.company} (FY ${doc.year})\n\n**Financial Key Metrics Overview:**\n${metricsStr}\n\nThis filing is now set as your **Active Grounding Context** in the Study & Intelligence Engine.\n\n**Select a One-Click Analysis Suite Action:**\n• 📊 Extract Balance Sheet & Cash Flow Highlights\n• 💡 Summarize CEO Letter & Strategic Outlook\n• ⚠️ Identify Key Risk Factors (Item 1A)\n• 📉 Perform Financial Variance Analysis`;

          const botMsg: AIAssistantMessage = {
            id: `model-${Date.now()}`,
            role: 'model',
            text: replyText,
            timestamp: Date.now(),
            provider: 'gemini',
            model: selectedModel,
            mutations: {
              activeGroundingDocId: doc.id,
              studyDocs: [doc, ...(trackerContext?.studyDocs || [])]
            },
            suggestedActions: [
              { id: 'act-bs', label: '📊 Extract Balance Sheet & Cash Flow Highlights', actionType: 'copy', payload: 'Extract Balance Sheet & Cash Flow Highlights' },
              { id: 'act-ceo', label: '💡 Summarize CEO Letter & Strategic Outlook', actionType: 'copy', payload: 'Summarize CEO Letter & Strategic Outlook' },
              { id: 'act-rf', label: '⚠️ Identify Key Risk Factors (Item 1A)', actionType: 'copy', payload: 'Identify Key Risk Factors (Item 1A)' },
              { id: 'act-var', label: '📉 Perform Financial Variance Analysis', actionType: 'copy', payload: 'Perform Financial Variance Analysis' }
            ]
          };

          setMessages(prev => [...prev, botMsg]);
          if (onMutateState) {
            onMutateState({
              activeGroundingDocId: doc.id,
              studyDocs: [doc, ...(trackerContext?.studyDocs || [])]
            });
          }
          setIsLoading(false);
          return;
        } catch (err: any) {
          console.error('Annual report fetch error:', err);
          // Fall through to standard chat if error
        }
      }

      // 2. Check if user clicked or asked for one of the 4 One-Click Analysis Suite actions
      const isBalanceSheetAction = /extract balance sheet|balance sheet.*cash flow/i.test(textToSend);
      const isCeoLetterAction = /summarize ceo letter|ceo letter|strategic outlook/i.test(textToSend);
      const isRiskFactorsAction = /identify key risk factors|risk factors|item 1a/i.test(textToSend);
      const isVarianceAction = /financial variance analysis|variance analysis/i.test(textToSend);

      if (isBalanceSheetAction || isCeoLetterAction || isRiskFactorsAction || isVarianceAction) {
        // Retrieve active document
        const activeDocId = trackerContext?.activeGroundingDocId;
        const targetDoc = trackerContext?.studyDocs?.find((d: any) => d.id === activeDocId) || trackerContext?.studyDocs?.[0];

        if (targetDoc && targetDoc.content) {
          const actionType = isBalanceSheetAction
            ? 'balance_sheet'
            : isCeoLetterAction
            ? 'ceo_letter'
            : isRiskFactorsAction
            ? 'risk_factors'
            : 'variance_analysis';

          const analysis = await analyzeAnnualReportSuite(targetDoc.content, actionType);

          const bullets = (analysis.bulletPoints || []).map(b => `• ${b}`).join('\n');
          let tableMd = '';
          if (analysis.tables && analysis.tables.length > 0) {
            const tbl = analysis.tables[0];
            tableMd = `\n\n| ${tbl.headers.join(' | ')} |\n| ${tbl.headers.map(() => '---').join(' | ')} |\n` +
              tbl.rows.map(r => `| ${r.join(' | ')} |`).join('\n');
          }

          let riskMd = '';
          if (analysis.riskMatrix && analysis.riskMatrix.length > 0) {
            riskMd = `\n\n**Risk Factors Identified:**\n` +
              analysis.riskMatrix.map(r => `• **${r.factor}** [${r.severity}]: ${r.impact}`).join('\n');
          }

          const replyText = `### ${analysis.title}\n\n**Executive Summary:**\n${analysis.summary}\n\n**Key Highlights:**\n${bullets}${tableMd}${riskMd}\n\n*Grounded directly on ${targetDoc.name}*`;

          const botMsg: AIAssistantMessage = {
            id: `model-${Date.now()}`,
            role: 'model',
            text: replyText,
            timestamp: Date.now(),
            provider: 'gemini',
            model: selectedModel,
            suggestedActions: [
              { id: 'act-bs-2', label: '📊 Extract Balance Sheet & Cash Flow Highlights', actionType: 'copy', payload: 'Extract Balance Sheet & Cash Flow Highlights' },
              { id: 'act-ceo-2', label: '💡 Summarize CEO Letter & Strategic Outlook', actionType: 'copy', payload: 'Summarize CEO Letter & Strategic Outlook' },
              { id: 'act-rf-2', label: '⚠️ Identify Key Risk Factors (Item 1A)', actionType: 'copy', payload: 'Identify Key Risk Factors (Item 1A)' },
              { id: 'act-var-2', label: '📉 Perform Financial Variance Analysis', actionType: 'copy', payload: 'Perform Financial Variance Analysis' }
            ]
          };

          setMessages(prev => [...prev, botMsg]);
          setIsLoading(false);
          return;
        }
      }

      const historyPayload = messages
        .filter(m => !m.isError)
        .map(m => ({ role: m.role as any, text: m.text }));

      // Custom BYO key fallback if user configured one
      let activeCustomKey: string | undefined = undefined;
      if (selectedProvider === 'openai' && customOpenAIKey) activeCustomKey = customOpenAIKey;
      if (selectedProvider === 'claude' && customClaudeKey) activeCustomKey = customClaudeKey;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          persona: selectedPersona,
          temperature: temperature,
          message: textToSend,
          history: historyPayload,
          trackerContext: trackerContext,
          activeTab: activeTab,
          customApiKey: activeCustomKey,
          customEndpoint: customEndpoint || undefined
        })
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (!response.ok || !data || data.error) {
        throw new Error(data?.error || `AI service returned error status ${response.status}`);
      }

      const botMsg: AIAssistantMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response content received.',
        timestamp: Date.now(),
        provider: data.providerUsed || selectedProvider,
        model: data.modelUsed || selectedModel,
        mutations: data.mutations || null,
        suggestedActions: data.suggestedActions || []
      };

      setMessages(prev => [...prev, botMsg]);

      // Auto-apply mutations if available and callback exists
      if (data.mutations && onMutateState) {
        onMutateState(data.mutations);
      }
    });

    setIsLoading(false);
  };

  const handleApplyMutationDirect = (mutations: any) => {
    if (mutations && onMutateState) {
      onMutateState(mutations);
      alert('Changes applied to your live tracker workspace!');
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleExportHistory = () => {
    const markdown = messages.map(m => `### ${m.role === 'user' ? '👤 You' : '🤖 ' + (m.model || 'AI Assistant')} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.text}\n\n---`).join('\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_assistant_chat_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all conversation history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          text: 'Ready. History cleared.',
          timestamp: Date.now(),
          provider: selectedProvider,
          model: selectedModel
        }
      ]);
    }
  };

  // Dynamic quick prompts based on the currently active tab
  const getTabQuickPrompts = () => {
    switch (activeTab) {
      case 'jobs':
        return [
          'Audit application deadlines',
          'Draft alumni outreach',
          'Compare scheme advantages'
        ];
      case 'skills':
        return [
          'Identify missing M&A skills',
          'Recommend modeling course',
          'Build study roadmap'
        ];
      case 'uni':
        return [
          'Optimize shift schedule',
          'Find study time blocks',
          'Check Tier 4 working hours'
        ];
      case 'finance':
        return [
          'Analyze cash flow forecast',
          'Log CFA expense',
          'Split utility expenses'
        ];
      case 'resume':
        return [
          'Humanize resume bullet points',
          'Calculate job match score',
          'Add quantitative metrics'
        ];
      case 'news':
      default:
        return [
          'Summarize market trends',
          'Practice interview question',
          'Review workspace priorities'
        ];
    }
  };

  const activeModelObj = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const getProviderColor = (p: AIProviderId) => {
    switch (p) {
      case 'gemini': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'openai': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'claude': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <>
      {/* Hidden button trigger for global shortcuts & headers */}
      {!isOpen && (
        <button 
          id="geminiAssistantBtn" 
          onClick={() => setIsOpen(true)} 
          className="hidden" 
          aria-label="Open AI Assistant"
        />
      )}

      {isOpen && (
        <motion.div 
          id="aiAssistantMainDrawer"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.8 }}
          onDragEnd={(_: any, info: PanInfo) => {
            if (info.offset.y > 100 || info.velocity.y > 200) {
              triggerHaptic(15);
              setIsOpen(false);
            }
          }}
          transition={IOS_SPRING}
          className="fixed bottom-4 sm:bottom-6 right-2 sm:right-6 z-50 w-[95vw] sm:w-[460px] h-[640px] max-h-[88vh] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[var(--border)] bg-neutral-950/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Drag Handle Pill */}
          <div className="w-12 h-1 bg-white/20 rounded-full my-1.5 mx-auto cursor-grab active:cursor-grabbing shrink-0" />

          {/* Header */}
          <div className="flex flex-col px-4 py-3 bg-[#09090b]/90 border-b border-white/10 gap-2">
            <div className="flex items-center justify-between">
              {/* Global AI Model Selector Pill */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="aiModelDropdownTrigger"
                  onClick={() => {
                    setShowModelDropdown(!showModelDropdown);
                    setShowSettingsPanel(false);
                    setModelSearchQuery('');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-neutral-900 text-xs font-medium text-neutral-200 transition-all cursor-pointer select-none hover:bg-neutral-800"
                  title="Switch AI Model & Provider"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate max-w-[160px] font-medium">{activeModelObj.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform shrink-0 ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Model Selection Dropdown Menu */}
                {showModelDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-80 max-h-[380px] overflow-y-auto p-2 rounded-2xl bg-neutral-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 flex flex-col gap-1 hide-scrollbar animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-neutral-400 flex items-center justify-between">
                      <span>Select Intelligence Model</span>
                      <span className="font-mono text-[10px] text-neutral-500">{AVAILABLE_MODELS.length} available</span>
                    </div>

                    <div className="px-1 py-1">
                      <input
                        type="text"
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        placeholder="Search models..."
                        className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-white/20"
                        autoFocus
                      />
                    </div>

                    {/* Model groups */}
                    {['gemini', 'openai', 'claude', 'custom'].map((providerGroup, groupIdx) => {
                      const modelsInGroup = AVAILABLE_MODELS.filter(m => m.provider === providerGroup && (!modelSearchQuery || m.name.toLowerCase().includes(modelSearchQuery.toLowerCase())));
                      if (modelsInGroup.length === 0) return null;
                      return (
                        <div key={providerGroup} className="space-y-0.5">
                          {groupIdx > 0 && <div className="border-b border-white/5 my-1" />}
                          <div className="text-[10px] tracking-widest font-medium text-neutral-400 px-3 pt-3 pb-1 uppercase">
                            {providerGroup === 'gemini' ? 'Google Gemini' : providerGroup === 'openai' ? 'OpenAI ChatGPT' : providerGroup === 'claude' ? 'Anthropic Claude' : 'Custom'}
                          </div>
                          {modelsInGroup.map(m => (
                            <button
                              key={m.id}
                              onClick={() => handleProviderSelect(m.provider as any, m.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                                selectedModel === m.id ? 'bg-white/10 text-white rounded-xl' : 'text-neutral-300 hover:bg-white/5'
                              }`}
                            >
                              <div>
                                <div className="text-sm font-semibold tracking-tight text-white">{m.name}</div>
                                <div className="text-xs text-neutral-400 font-normal leading-snug mt-0.5">{m.description}</div>
                              </div>
                              {selectedModel === m.id && <Check className="w-4 h-4 text-white shrink-0" />}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Minimal Action Icons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowSettingsPanel(!showSettingsPanel);
                    setShowModelDropdown(false);
                  }}
                  className={`p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ${showSettingsPanel ? 'bg-white/10 text-white' : ''}`}
                  title="AI Settings"
                >
                  <Sliders className="w-4 h-4 stroke-[1.5]" />
                </button>
                <button
                  onClick={handleExportHistory}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Export Chat"
                >
                  <Download className="w-4 h-4 stroke-[1.5]" />
                </button>
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
                  title="Close"
                >
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Segmented Picker: Quick Models */}
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-900 border border-white/5 overflow-x-auto hide-scrollbar">
              {[
                { id: 'gemini-3.7-flash', label: 'Gemini 3.7', provider: 'gemini' as AIProviderId },
                { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', provider: 'gemini' as AIProviderId },
                { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai' as AIProviderId },
                { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5', provider: 'claude' as AIProviderId }
              ].map(shortcut => (
                <button
                  key={shortcut.id}
                  onClick={() => handleProviderSelect(shortcut.provider, shortcut.id)}
                  className={`flex-1 min-w-[72px] py-1 px-2 rounded-full text-[11px] font-medium transition-all cursor-pointer text-center truncate ${
                    selectedModel === shortcut.id
                      ? 'bg-white text-black shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  {shortcut.label}
                </button>
              ))}
            </div>

            {/* Segmented Picker: Persona Pills */}
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-900 border border-white/5 overflow-x-auto hide-scrollbar">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPersona(p.id);
                    localStorage.setItem('ai_preferred_persona', p.id);
                  }}
                  className={`flex-1 min-w-[90px] py-1 px-2.5 rounded-full text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                    selectedPersona === p.id 
                      ? 'bg-white text-black shadow-sm font-semibold' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                  title={p.desc}
                >
                  <span className="text-xs">{p.icon}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings & Configuration Sub-Panel */}
          {showSettingsPanel && (
            <div className="p-4 bg-neutral-900 border-b border-white/10 space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between font-semibold text-white">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                  Model Configuration & API Keys
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Secure local storage</span>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-neutral-300">
                  <span>Temperature: {temperature.toFixed(2)}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">0.0 Precise • 1.0 Creative</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-white bg-neutral-800 h-1 rounded-lg"
                />
              </div>

              {/* BYO OpenAI Key */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">OpenAI API Key:</label>
                <input
                  type="password"
                  value={customOpenAIKey}
                  onChange={(e) => {
                    setCustomOpenAIKey(e.target.value);
                    localStorage.setItem('byo_openai_key', e.target.value);
                  }}
                  placeholder="sk-..."
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 font-mono text-[11px]"
                />
              </div>

              {/* BYO Claude Key */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-300">Anthropic Claude API Key:</label>
                <input
                  type="password"
                  value={customClaudeKey}
                  onChange={(e) => {
                    setCustomClaudeKey(e.target.value);
                    localStorage.setItem('byo_claude_key', e.target.value);
                  }}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="px-3 py-1 bg-white text-black rounded-lg font-semibold text-xs hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-white text-black rounded-br-xs font-normal' 
                      : 'bg-neutral-900 border border-white/10 text-neutral-200 rounded-bl-xs'
                  }`}
                >
                  {/* Model & Copy Tag */}
                  {msg.role !== 'user' && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 text-[10px] text-neutral-400 font-mono">
                      <span className="flex items-center gap-1 text-neutral-300">
                        <Cpu className="w-3 h-3 stroke-[1.5]" />
                        {msg.model || selectedModel}
                      </span>
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="hover:text-white transition-colors p-0.5"
                        title="Copy text"
                      >
                        {isCopied === msg.id ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 stroke-[1.5]" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap space-y-1.5">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line === 'Overview' || line === 'Suggested Actions:') {
                        return <div key={idx} className="font-semibold text-xs uppercase tracking-wider text-neutral-400 pt-1">{line}</div>;
                      }
                      if (line.includes('·') && !line.startsWith('http')) {
                        return <div key={idx} className="text-sm font-medium text-white">{line}</div>;
                      }
                      if (line.includes('Review Application') || line.includes('Financial Ledger') || line.includes('Interview Prep')) {
                        return (
                          <div key={idx} className="flex flex-wrap gap-2 pt-1">
                            {line.split(' · ').map((action, ai) => (
                              <button
                                key={ai}
                                onClick={() => handleSend(action)}
                                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs border border-white/10 transition-colors cursor-pointer"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>

                  {/* Interactive Action Chips (Mutations & Tasks) */}
                  {msg.mutations && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleApplyMutationDirect(msg.mutations)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-500/30 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Apply State Update to Workspace
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-neutral-500 px-1 mt-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-white/10 rounded-2xl rounded-bl-xs px-4 py-3 text-xs flex items-center gap-2.5 text-neutral-300">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Reasoning with your workspace data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Context-Aware Prompts Bar */}
          <div className="px-4 py-2 bg-[#09090b]/80 border-t border-white/10 flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {getTabQuickPrompts().map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSend(promptText)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs border border-white/10 transition-colors truncate max-w-[240px] cursor-pointer"
                title={promptText}
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#09090b] border-t border-white/10">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 pl-4 pr-20 py-3 rounded-full bg-neutral-900/90 border border-white/15 text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/30 shadow-2xl"
              />

              {/* Dictation Button */}
              <button
                onClick={toggleSpeechRecognition}
                className={`absolute right-12 p-1.5 rounded-full transition-colors ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-neutral-400 hover:text-white'
                }`}
                title={isListening ? 'Stop listening' : 'Voice Dictate'}
              >
                {isListening ? <MicOff className="w-4 h-4 stroke-[1.5]" /> : <Mic className="w-4 h-4 stroke-[1.5]" />}
              </button>

              {/* Send Button */}
              <button
                id="aiAssistantSendBtn"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-full bg-white text-black hover:scale-105 disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-md"
                aria-label="Send query"
              >
                <Send className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};
