import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Search,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Building2,
  User,
  Briefcase,
  ShieldCheck,
  Clock,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Sliders,
  CheckCircle2,
  HelpCircle,
  FileText,
  Cpu,
  Brain
} from 'lucide-react';
import {
  findCompanyHrIntelligence,
  generateColdEmailDraft,
  buildEmailClientLinks,
  COLD_EMAIL_TEMPLATES,
  ColdEmailDraftParams,
  GeneratedColdEmail,
  HrDiscoveryResult
} from '../lib/hrEmailFinder';
import { executeUnifiedAiCall, getActiveAiConfig, SUPPORTED_AI_MODELS } from '../lib/aiGateway';

export interface OutreachRecord {
  id: string;
  companyName: string;
  recipientName: string;
  recipientEmail: string;
  targetRole: string;
  tone: ColdEmailDraftParams['tone'];
  subject: string;
  body: string;
  status: 'Drafted' | 'Sent' | 'Replied' | 'Follow-up Due';
  dateCreated: string;
  notes?: string;
}

interface OutreachHubProps {
  initialCompany?: string;
  initialRole?: string;
  onClose?: () => void;
}

export const OutreachHub: React.FC<OutreachHubProps> = ({
  initialCompany = '',
  initialRole = '',
  onClose
}) => {
  // Form State
  const [companyName, setCompanyName] = useState(initialCompany);
  const [targetRole, setTargetRole] = useState(initialRole);
  const [recipientName, setRecipientName] = useState('');
  const [recipientRole, setRecipientRole] = useState('Hiring Manager / Recruiter');
  const [tone, setTone] = useState<ColdEmailDraftParams['tone']>('high_impact');
  const [customStrength, setCustomStrength] = useState('');
  const [customNote, setCustomNote] = useState('');

  // Discovery & Generation State
  const [hrDiscovery, setHrDiscovery] = useState<HrDiscoveryResult>(() => findCompanyHrIntelligence(initialCompany, ''));
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedColdEmail>(() => 
    generateColdEmailDraft({
      companyName: initialCompany || 'Target Firm',
      targetRole: initialRole || 'Graduate Analyst',
      recipientName: 'Hiring Manager',
      recipientRole: 'Recruiter',
      tone: 'high_impact'
    })
  );

  const [activeTab, setActiveTab] = useState<'generator' | 'finder' | 'history'>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<'subject' | 'body' | 'email' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Outreach History State
  const [outreachHistory, setOutreachHistory] = useState<OutreachRecord[]>(() => {
    try {
      const saved = localStorage.getItem('manageme_outreach_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load outreach history', e);
    }
    return [];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync HR Discovery when company name changes
  useEffect(() => {
    const res = findCompanyHrIntelligence(companyName, recipientName);
    setHrDiscovery(res);
  }, [companyName, recipientName]);

  // Handle Draft Generation
  const handleRegenerateDraft = async (overrideTone?: ColdEmailDraftParams['tone']) => {
    setIsGenerating(true);
    const chosenTone = overrideTone || tone;

    try {
      // Execute through universal Multi-AI Gateway router
      const aiResult = await executeUnifiedAiCall({
        message: `Company: ${companyName}, Target Role: ${targetRole}, Recipient: ${recipientName} (${recipientRole}), Tone: ${chosenTone}, Candidate Strengths: ${customStrength}, Custom Notes: ${customNote}. Generate the cold email.`,
        systemPromptOverride: `You are an elite Wall Street & London City executive networking coach. Write a hyper-personalized, ultra-high-converting cold outreach email. Output JSON in format: { "subject": string, "body": string, "valueHooks": string[], "callToAction": string }`,
        temperature: 0.6
      }).catch(() => null);

      if (aiResult) {
        const rawReply = aiResult.reply || '';
        try {
          const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.subject && parsed.body) {
              setGeneratedDraft({
                subject: parsed.subject,
                recipientEmail: hrDiscovery.patterns[0]?.example || hrDiscovery.primaryEmail,
                body: parsed.body,
                previewSummary: `AI tailored (${aiResult.modelUsed}) ${chosenTone.replace('_', ' ')} email for ${companyName}.`,
                valueHooks: parsed.valueHooks || ['Immediate quantitative modeling leverage'],
                callToAction: parsed.callToAction || 'Would you have 5 minutes for a quick introductory call next week?'
              });
              showToast(`Generated via ${aiResult.modelUsed}!`);
              setIsGenerating(false);
              return;
            }
          }
        } catch (e) {
          console.warn('AI JSON parsing fallback', e);
        }
      }

      // Rule-based high converting fallback
      const draft = generateColdEmailDraft({
        companyName,
        targetRole,
        recipientName,
        recipientRole,
        tone: chosenTone,
        keyStrengths: customStrength ? [customStrength] : undefined,
        customNote
      });
      setGeneratedDraft(draft);
      showToast('Generated High-Converting Cold Email!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (field: 'subject' | 'body' | 'email', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`Copied ${field} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveToHistory = () => {
    const newRecord: OutreachRecord = {
      id: `outreach-${Date.now()}`,
      companyName,
      recipientName,
      recipientEmail: generatedDraft.recipientEmail,
      targetRole,
      tone,
      subject: generatedDraft.subject,
      body: generatedDraft.body,
      status: 'Drafted',
      dateCreated: new Date().toISOString().split('T')[0]
    };

    const updated = [newRecord, ...outreachHistory];
    setOutreachHistory(updated);
    try {
      localStorage.setItem('manageme_outreach_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save outreach history', e);
    }
    showToast('Saved to Outreach Tracker!');
  };

  const handleDeleteHistoryRecord = (id: string) => {
    const updated = outreachHistory.filter(r => r.id !== id);
    setOutreachHistory(updated);
    try {
      localStorage.setItem('manageme_outreach_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save outreach history', e);
    }
    showToast('Removed from history');
  };

  const handleUpdateRecordStatus = (id: string, status: OutreachRecord['status']) => {
    const updated = outreachHistory.map(r => r.id === id ? { ...r, status } : r);
    setOutreachHistory(updated);
    try {
      localStorage.setItem('manageme_outreach_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save outreach history', e);
    }
    showToast(`Status updated to ${status}`);
  };

  const { gmailUrl, mailtoUrl, outlookUrl } = buildEmailClientLinks(
    generatedDraft.recipientEmail,
    generatedDraft.subject,
    generatedDraft.body
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-neutral-900/90 border border-indigo-500/40 backdrop-blur-xl shadow-2xl flex items-center gap-2.5 text-xs text-white"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-300 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cold Outreach & HR Email Suite</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono font-bold uppercase tracking-wider border border-blue-200 dark:border-transparent">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                Corporate HR email discovery, verified talent acquisition mailboxes, and high-converting cold email drafting.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & AI Engine Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAiModelSelector'))}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-100 dark:hover:bg-purple-500/25 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Switch AI engine for cold email generation"
          >
            <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="truncate max-w-[110px]">
              {SUPPORTED_AI_MODELS.find(m => m.id === getActiveAiConfig().model)?.name || getActiveAiConfig().model}
            </span>
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Email Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('finder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'finder'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>HR Email Finder</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Outreach Tracker ({outreachHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. COLD EMAIL GENERATOR & DRAFTER VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Form & Tone Selector */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Target Parameters</span>
              </h3>

              {/* Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                    <span>Company Name</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Goldman Sachs"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                    <span>Target Role</span>
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Summer Analyst"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                    <span>Recipient Name</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-neutral-400">Recipient Role / Level</label>
                  <input
                    type="text"
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    placeholder="e.g. VP / Managing Director"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Verified Contact Preview Chip */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 block uppercase">Discovered Primary Email</span>
                    <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 truncate block">
                      {generatedDraft.recipientEmail}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy('email', generatedDraft.recipientEmail)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
                  title="Copy email address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Template Tone Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 block">Outreach Tone & Strategy</label>
                <div className="grid grid-cols-1 gap-2">
                  {COLD_EMAIL_TEMPLATES.map((tmpl) => {
                    const isSelected = tone === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setTone(tmpl.id);
                          handleRegenerateDraft(tmpl.id);
                        }}
                        className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-300 dark:border-blue-500/50 shadow-sm'
                            : 'bg-slate-50 dark:bg-neutral-950/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                            {tmpl.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-neutral-400 mt-0.5">{tmpl.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Custom Notes */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 block">Key Strengths & Value Add</label>
                <input
                  type="text"
                  value={customStrength}
                  onChange={(e) => setCustomStrength(e.target.value)}
                  placeholder="e.g. 1st Class Finance, DCF modeling, CFA L1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Generate CTA */}
              <button
                onClick={() => handleRegenerateDraft()}
                disabled={isGenerating}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Tailoring Cold Outreach...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Regenerate Cold Pitch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Email Preview & One-Click Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-5 flex flex-col justify-between min-h-[560px]">
              <div className="space-y-4">
                {/* Email Meta Header */}
                <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-neutral-400">
                    <span className="uppercase text-[10px] font-bold text-blue-600 dark:text-blue-400">Live Email Composer Preview</span>
                    <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                      {tone.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* To Field */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-slate-600 dark:text-neutral-400 font-mono text-[11px] shrink-0">To:</span>
                    <div className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/10 font-mono text-slate-800 dark:text-neutral-200">
                      <span className="truncate">{recipientName} &lt;{generatedDraft.recipientEmail}&gt;</span>
                      <button
                        onClick={() => handleCopy('email', generatedDraft.recipientEmail)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors ml-2"
                        title="Copy Email"
                      >
                        {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-slate-600 dark:text-neutral-400 font-mono text-[11px] shrink-0">Subject:</span>
                    <div className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/10 font-semibold text-slate-900 dark:text-white">
                      <input
                        type="text"
                        value={generatedDraft.subject}
                        onChange={(e) => setGeneratedDraft({ ...generatedDraft, subject: e.target.value })}
                        className="w-full bg-transparent focus:outline-none text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleCopy('subject', generatedDraft.subject)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors ml-2 shrink-0"
                        title="Copy Subject"
                      >
                        {copiedField === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Body Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400 font-mono">
                    <span>Message Body</span>
                    <button
                      onClick={() => handleCopy('body', generatedDraft.body)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      {copiedField === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Full Body</span>
                    </button>
                  </div>
                  <textarea
                    value={generatedDraft.body}
                    onChange={(e) => setGeneratedDraft({ ...generatedDraft, body: e.target.value })}
                    rows={13}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950/90 border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-neutral-200 leading-relaxed font-sans focus:outline-none focus:border-blue-500/50 resize-y custom-scrollbar"
                  />
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToHistory}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Save to Tracker</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Draft in Gmail */}
                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 border border-rose-200 dark:border-rose-500/40 text-xs font-bold text-rose-700 dark:text-rose-300 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Draft in Gmail</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  {/* Mailto Native App */}
                  <a
                    href={mailtoUrl}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Mail App</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HR EMAIL & CORPORATE DOMAIN FINDER VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'finder' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter firm name or domain (e.g. Goldman Sachs, McKinsey, BlackRock, Citadel)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="relative w-full sm:w-64">
                <User className="w-4 h-4 text-slate-400 dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Target Contact Name..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Firm Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-500 mr-1">Quick Discovery:</span>
              {['Goldman Sachs', 'Morgan Stanley', 'BlackRock', 'Citadel', 'McKinsey', 'Deloitte', 'Bloomberg LP', 'Revolut'].map((firm) => (
                <button
                  key={firm}
                  onClick={() => setCompanyName(firm)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    companyName.toLowerCase() === firm.toLowerCase()
                      ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-neutral-950/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  {firm}
                </button>
              ))}
            </div>
          </div>

          {/* Discovery Results Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{hrDiscovery.company}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                    <span>{hrDiscovery.domain}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-neutral-300 font-mono text-[10px] border border-slate-200 dark:border-transparent">
                      {hrDiscovery.sector}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={hrDiscovery.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Careers Portal</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <button
                  onClick={() => {
                    setActiveTab('generator');
                    handleRegenerateDraft();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Write Cold Email</span>
                </button>
              </div>
            </div>

            {/* Standardized Email Formats Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                Corporate Standard Email Patterns & Confidence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {hrDiscovery.patterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10 space-y-2 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-600 dark:text-neutral-400">{pat.pattern}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        pat.confidence >= 90 
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-transparent' 
                          : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-transparent'
                      }`}>
                        {pat.confidence}% Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate mr-2">
                        {pat.example}
                      </span>
                      <button
                        onClick={() => handleCopy('email', pat.example)}
                        className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-600/30 text-slate-500 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 border border-slate-200 dark:border-transparent transition-colors shrink-0"
                        title="Copy pattern"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Recruiting Mailboxes */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950/80 border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Verified Talent Acquisition Inboxes
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">{hrDiscovery.verifiedSource}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[hrDiscovery.primaryEmail, ...hrDiscovery.alternativeEmails].map((email, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-neutral-200 shadow-xs"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleCopy('email', email)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      title="Copy email"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OUTREACH TRACKER & HISTORY VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400 font-mono">
            <span>Logged Outreach & Cold Inquiries ({outreachHistory.length})</span>
            <span>Stored in Local Persistence</span>
          </div>

          {outreachHistory.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Outreach Logs Yet</h3>
              <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-sm mx-auto">
                Generate and save cold outreach drafts to track status, follow-up dates, and recruiter responses.
              </p>
              <button
                onClick={() => setActiveTab('generator')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Draft First Cold Email
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {outreachHistory.map((rec) => {
                const links = buildEmailClientLinks(rec.recipientEmail, rec.subject, rec.body);
                return (
                  <div
                    key={rec.id}
                    className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 space-y-3 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {rec.companyName[0] || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rec.companyName}</h4>
                            <span className="text-xs text-slate-500 dark:text-neutral-400">• {rec.targetRole}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 block">
                            {rec.recipientName} ({rec.recipientEmail})
                          </span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={rec.status}
                          onChange={(e) => handleUpdateRecordStatus(rec.id, e.target.value as any)}
                          className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/15 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="Drafted">📝 Drafted</option>
                          <option value="Sent">🚀 Sent</option>
                          <option value="Replied">💬 Replied</option>
                          <option value="Follow-up Due">⏰ Follow-up Due</option>
                        </select>

                        <button
                          onClick={() => handleDeleteHistoryRecord(rec.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200 block">{rec.subject}</span>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-sans">{rec.body}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">Created: {rec.dateCreated}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={links.gmailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Open Gmail</span>
                        </a>
                        <button
                          onClick={() => {
                            setCompanyName(rec.companyName);
                            setTargetRole(rec.targetRole);
                            setRecipientName(rec.recipientName);
                            setGeneratedDraft({
                              subject: rec.subject,
                              recipientEmail: rec.recipientEmail,
                              body: rec.body,
                              previewSummary: 'Restored from history',
                              valueHooks: [],
                              callToAction: ''
                            });
                            setActiveTab('generator');
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold text-[11px] shadow-xs"
                        >
                          Re-open in Editor
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
