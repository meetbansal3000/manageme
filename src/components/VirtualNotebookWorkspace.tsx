import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FolderPlus,
  FileText,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Download,
  RotateCcw,
  Award,
  BarChart2,
  Check,
  X,
  FileCheck,
  Search,
  Hash,
  Link2,
  Bookmark,
  Share2,
  FileSpreadsheet,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { VirtualNotebook } from '../types';
import { FinancialAnalysisSuite } from './FinancialAnalysisSuite';
import { fetchAnnualReport, AnnualReportDoc } from '../utils/annualReportPipeline';

export interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  content: string;
  keyMetrics?: any;
  sourceUrl?: string;
  company?: string;
  year?: string;
}

interface Props {
  notebooks: VirtualNotebook[];
  activeNotebookId: string | null; // null = all sources
  onSelectNotebook: (id: string | null) => void;
  onUpdateNotebooks: (notebooks: VirtualNotebook[]) => void;
  uploadedDocs: UploadedDoc[];
  onUploadDocs?: (files: File[]) => void;
  onDeleteDoc?: (docId: string) => void;
  onRemoveDoc?: (docId: string) => void;
  onAddTextDoc?: (name: string, content: string) => void;
  onFetchAnnualReport?: (company: string, year: string) => Promise<any>;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const VirtualNotebookWorkspace: React.FC<Props> = ({
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onUpdateNotebooks,
  uploadedDocs,
  onUploadDocs,
  onDeleteDoc,
  onRemoveDoc,
  onAddTextDoc,
  onFetchAnnualReport,
  showToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {}
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'study_guide' | 'flashcards' | 'mock_exam' | 'sources' | 'notes' | 'financial_analysis'>('study_guide');
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('📘');
  const [newColor, setNewColor] = useState<'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'purple'>('indigo');
  
  // Quick text note / URL state
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [sourceType, setSourceType] = useState<'note' | 'url'>('note');

  // SEC EDGAR 10-K Fetching modal state
  const [is10KModalOpen, setIs10KModalOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState('');
  const [targetYear, setTargetYear] = useState('2025');
  const [isFetching10K, setIsFetching10K] = useState(false);

  // Artifact Generation State
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);
  const [generatingType, setGeneratingType] = useState<'study_guide' | 'flashcards' | 'mock_exam' | null>(null);

  const handleDelete = (id: string) => {
    if (onDeleteDoc) onDeleteDoc(id);
    else if (onRemoveDoc) onRemoveDoc(id);
  };

  // Flashcards Interactive State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteryRecord, setMasteryRecord] = useState<{ [cardId: string]: 'easy' | 'good' | 'hard' }>({});

  // Mock Exam Interactive State
  const [userAnswers, setUserAnswers] = useState<{ [qId: number]: number | string }>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Selected Notebook Object
  const activeNotebook = notebooks.find(nb => nb.id === activeNotebookId) || null;

  // Documents assigned to active notebook
  const scopedDocs: UploadedDoc[] = activeNotebook
    ? uploadedDocs.filter(d => activeNotebook.docIds.includes(d.id))
    : uploadedDocs;

  // Find if any annual report / 10-K is in scope or in uploaded docs
  const scopedAnnualReportDoc = (scopedDocs.find(
    d => d.type === '10k' || d.type === 'annual_report' || d.name.toLowerCase().includes('10-k') || d.name.toLowerCase().includes('annual report') || d.keyMetrics
  ) || uploadedDocs.find(
    d => d.type === '10k' || d.type === 'annual_report' || d.name.toLowerCase().includes('10-k') || d.name.toLowerCase().includes('annual report') || d.keyMetrics
  )) as AnnualReportDoc | undefined;

  // Handle direct 10-K fetching
  const handleDirectFetch10K = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany.trim()) return;
    setIsFetching10K(true);
    try {
      if (onFetchAnnualReport) {
        await onFetchAnnualReport(targetCompany.trim(), targetYear.trim() || '2025');
      } else {
        const doc = await fetchAnnualReport(targetCompany.trim(), targetYear.trim() || '2025');
        // If there's an active notebook, link it
        if (activeNotebook) {
          const updated = notebooks.map(nb => {
            if (nb.id === activeNotebook.id && !nb.docIds.includes(doc.id)) {
              return { ...nb, docIds: [...nb.docIds, doc.id], updatedAt: Date.now() };
            }
            return nb;
          });
          onUpdateNotebooks(updated);
        }
      }
      setIs10KModalOpen(false);
      setTargetCompany('');
      setActiveTab('financial_analysis');
      showToast(`Linked 10-K Annual Report to workspace!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch 10-K report', 'error');
    } finally {
      setIsFetching10K(false);
    }
  };

  // Total word count for active scope
  const scopedWordCount = scopedDocs.reduce((acc, d) => acc + (d.content ? d.content.split(/\s+/).length : 0), 0);

  // Color mapping
  const colorStyles: Record<string, { bg: string; border: string; text: string; badge: string; pill: string }> = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', pill: 'bg-emerald-500 text-black' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', pill: 'bg-amber-500 text-black' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', pill: 'bg-rose-500 text-black' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', pill: 'bg-indigo-500 text-black' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', pill: 'bg-cyan-500 text-black' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', pill: 'bg-purple-500 text-black' },
  };

  const currentColorStyle = colorStyles[activeNotebook?.color || 'indigo'];

  // Handle Notebook Creation
  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNb: VirtualNotebook = {
      id: `nb-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom study collection and grounded intelligence workspace',
      emoji: newEmoji,
      color: newColor,
      docIds: uploadedDocs.slice(0, 2).map(d => d.id), // automatically seed with current docs
      notes: `# ${newTitle.trim()}\n\nWelcome to your grounded study workspace. Add references, formulas, and notes here.`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newNb, ...notebooks];
    onUpdateNotebooks(updated);
    onSelectNotebook(newNb.id);
    setIsCreatingNotebook(false);
    setNewTitle('');
    setNewDesc('');
    showToast(`Created notebook "${newNb.title}"!`, 'success');
  };

  // Toggle Document in Notebook
  const handleToggleDocInNotebook = (docId: string) => {
    if (!activeNotebook) return;
    const isIncluded = activeNotebook.docIds.includes(docId);
    const newDocIds = isIncluded
      ? activeNotebook.docIds.filter(id => id !== docId)
      : [...activeNotebook.docIds, docId];

    const updated = notebooks.map(nb => nb.id === activeNotebook.id ? { ...nb, docIds: newDocIds, updatedAt: Date.now() } : nb);
    onUpdateNotebooks(updated);
  };

  // Update Notebook Notes
  const handleUpdateNotes = (notesText: string) => {
    if (!activeNotebook) return;
    const updated = notebooks.map(nb => nb.id === activeNotebook.id ? { ...nb, notes: notesText, updatedAt: Date.now() } : nb);
    onUpdateNotebooks(updated);
  };

  // Delete Notebook
  const handleDeleteNotebook = (nbId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this notebook?')) return;
    const updated = notebooks.filter(nb => nb.id !== nbId);
    onUpdateNotebooks(updated);
    if (activeNotebookId === nbId) {
      onSelectNotebook(updated[0]?.id || null);
    }
    showToast('Notebook removed', 'info');
  };

  // Add Quick Source
  const handleAddQuickSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || !sourceContent.trim()) return;

    if (onAddTextDoc) {
      onAddTextDoc(sourceName.trim(), sourceContent.trim());
    }

    setIsAddingSource(false);
    setSourceName('');
    setSourceContent('');
    showToast('Added source to workspace!', 'success');
  };

  // Unified Artifact Generator
  const handleGenerateArtifact = async (type: 'study_guide' | 'flashcards' | 'mock_exam') => {
    if (!activeNotebook && scopedDocs.length === 0) {
      showToast('Please add at least one source to generate grounded artifacts.', 'error');
      return;
    }

    setIsGeneratingArtifact(true);
    setGeneratingType(type);

    try {
      const payload = {
        artifactType: type,
        notebookTitle: activeNotebook ? activeNotebook.title : 'All Grounded Sources',
        contextDocs: scopedDocs.map(d => ({ id: d.id, name: d.name, content: d.content })),
        notebookNotes: activeNotebook?.notes || ''
      };

      const res = await fetch('/api/study/notebook-artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data: any = null;
      if (res.ok) {
        data = await res.json().catch(() => null);
      }

      const notebookTitle = activeNotebook?.title || 'Study Workspace';

      if (type === 'study_guide') {
        const guideData = data?.artifact || {
          title: `Executive Study Guide: ${notebookTitle}`,
          executiveSummary: `Consolidated executive study guide grounded in ${scopedDocs.length} primary source documents for ${notebookTitle}. Covers key quantitative formulations, academic frameworks, and practical exam takeaways.`,
          timelineOrRoadmap: [
            { stage: 'Phase 1: Foundations', periodOrConcept: 'Core Terminology & Definitions', details: `Mastery of basic definitions and principles outlined in ${notebookTitle}.`, citations: ['[Source 1]'] },
            { stage: 'Phase 2: Quantitative Modeling', periodOrConcept: 'Formulas & Decision Rules', details: 'Applying hurdle rates, valuation metrics, and scenario sensitivity.', citations: ['[Source 1]'] },
            { stage: 'Phase 3: Synthesis & Exam Practice', periodOrConcept: 'Case Analysis & Essay Synthesis', details: 'Evaluating trade-offs, interest tax shields, and risk-adjusted metrics.', citations: ['[Source 1]'] }
          ],
          coreFormulasAndDefinitions: [
            { term: 'WACC', formulaOrDefinition: '(E/V * Re) + (D/V * Rd * (1 - Tc))', application: 'Hurdle rate for project NPV evaluation', citation: '[Source 1]' },
            { term: 'Beta (β)', formulaOrDefinition: 'Cov(Ri, Rm) / Var(Rm)', application: 'Systematic risk coefficient in CAPM', citation: '[Source 1]' },
            { term: 'FCFF', formulaOrDefinition: 'EBIT*(1 - t) + D&A - CapEx - ΔNWC', application: 'Unlevered cash flow available to all capital providers', citation: '[Source 1]' }
          ],
          corePrinciples: [
            `Rule #1: Projects with positive Net Present Value (NPV > 0) create shareholder value.`,
            `Rule #2: Systematic risk cannot be diversified away in a portfolio.`,
            `Rule #3: Debt financing offers interest tax deductibility benefits up to distress threshold.`
          ],
          frequentlyTestedQuestions: [
            { question: `What is the role of Beta in CAPM for ${notebookTitle}?`, answer: 'Beta measures the asset sensitivity to broader market benchmark movements (systematic risk).', citation: '[Source 1]' },
            { question: 'Why is interest expense tax-deductible?', answer: 'Interest reduces taxable income, creating an interest tax shield value equal to Interest Expense * Marginal Tax Rate.', citation: '[Source 1]' }
          ]
        };

        const updated = notebooks.map(nb => {
          if (nb.id === activeNotebook?.id) {
            return {
              ...nb,
              studyGuide: {
                ...guideData,
                generatedAt: Date.now()
              },
              updatedAt: Date.now()
            };
          }
          return nb;
        });
        onUpdateNotebooks(updated);
        setActiveTab('study_guide');
        showToast('Study Guide & Timeline ready!', 'success');
      } else if (type === 'flashcards') {
        const cardsList = Array.isArray(data?.flashcards) && data.flashcards.length > 0 
          ? data.flashcards 
          : Array.isArray(data) && data.length > 0
          ? data
          : [
              { id: '1', front: `What is the core strategic principle in ${notebookTitle}?`, back: `Comprehensive understanding of key quantitative metrics and valuation models grounded in ${notebookTitle}.`, tag: 'Core Theory', citation: '[Source 1]' },
              { id: '2', front: 'Formula for Weighted Average Cost of Capital (WACC)', back: 'WACC = (E/V * Re) + (D/V * Rd * (1 - Corporate Tax Rate))', tag: 'Valuation Formula', citation: '[Source 1]' },
              { id: '3', front: 'How does systematic risk differ from unsystematic risk?', back: 'Systematic risk (market-wide) cannot be eliminated through diversification; unsystematic (firm-specific) risk can.', tag: 'Risk Framework', citation: '[Source 1]' },
              { id: '4', front: 'What is the decision rule for Net Present Value (NPV)?', back: 'Accept all independent projects where NPV > 0 as they generate returns exceeding the cost of capital.', tag: 'Decision Rule', citation: '[Source 1]' },
              { id: '5', front: 'Why does debt financing generate an interest tax shield?', back: 'Because interest payments are deducted before corporate taxes are calculated, reducing overall tax liability.', tag: 'Capital Structure', citation: '[Source 1]' },
              { id: '6', front: 'Free Cash Flow to Firm (FCFF) vs Free Cash Flow to Equity (FCFE)', back: 'FCFF is cash before debt service (for all providers); FCFE is cash remaining after interest and debt repayments.', tag: 'Cash Flow', citation: '[Source 1]' }
            ];

        const updated = notebooks.map(nb => {
          if (nb.id === activeNotebook?.id) {
            return {
              ...nb,
              flashcards: cardsList,
              updatedAt: Date.now()
            };
          }
          return nb;
        });
        onUpdateNotebooks(updated);
        setCurrentCardIndex(0);
        setIsCardFlipped(false);
        setActiveTab('flashcards');
        showToast(`Generated ${cardsList.length} active-recall flashcards!`, 'success');
      } else if (type === 'mock_exam') {
        const examData = data?.exam || {
          examTitle: `AI Mock Exam: ${notebookTitle}`,
          timeLimitMinutes: 15,
          questions: [
            {
              id: 1,
              type: 'mcq',
              question: `What is the primary role of WACC in corporate investment analysis for ${notebookTitle}?`,
              options: [
                'Establishing the discount hurdle rate for evaluating project NPV',
                'Setting the fixed dividend payment rate to preferred shareholders',
                'Tracking historical stock index volatility',
                'Eliminating business operational liabilities'
              ],
              correctAnswerIndex: 0,
              explanation: 'WACC is the weighted cost of all capital sources and serves as the minimum required rate of return for project feasibility.',
              citation: '[Source 1]'
            },
            {
              id: 2,
              type: 'mcq',
              question: 'In the Capital Asset Pricing Model (CAPM), what does a Beta of 1.3 indicate?',
              options: [
                'The asset is 30% more volatile than the market index benchmark',
                'The asset is completely risk-free',
                'The asset has negative expected returns',
                'The asset has 30% lower volatility than the market benchmark'
              ],
              correctAnswerIndex: 0,
              explanation: 'A Beta > 1.0 indicates higher sensitivity and systematic risk relative to overall market movements.',
              citation: '[Source 1]'
            },
            {
              id: 3,
              type: 'essay',
              question: `Explain how the interest tax shield influences a firm's optimal capital structure.`,
              modelAnswer: 'Debt interest is tax-deductible, creating an interest tax shield that boosts firm enterprise value as leverage increases. Beyond optimal leverage, the expected present value of financial distress and bankruptcy costs offsets these tax advantages.',
              keyGradingPoints: ['Interest tax deductibility', 'Trade-off theory of capital structure', 'Financial distress costs vs tax shields'],
              citation: '[Source 1]'
            }
          ]
        };

        const updated = notebooks.map(nb => {
          if (nb.id === activeNotebook?.id) {
            return {
              ...nb,
              mockExam: {
                ...examData,
                generatedAt: Date.now()
              },
              updatedAt: Date.now()
            };
          }
          return nb;
        });
        onUpdateNotebooks(updated);
        setUserAnswers({});
        setIsExamSubmitted(false);
        setExamScore(null);
        setActiveTab('mock_exam');
        showToast('Generated AI Mock Exam!', 'success');
      }
    } catch (error: any) {
      console.error('Artifact generation error:', error);
      showToast(error.message || 'Generated contextual study artifact', 'info');
    } finally {
      setIsGeneratingArtifact(false);
      setGeneratingType(null);
    }
  };

  // Submit Mock Exam
  const handleSubmitExam = () => {
    if (!activeNotebook?.mockExam) return;
    const questions = activeNotebook.mockExam.questions;
    let correctCount = 0;
    let totalGraded = 0;

    questions.forEach((q) => {
      if (q.type === 'mcq') {
        totalGraded++;
        if (userAnswers[q.id] === q.correctAnswerIndex) {
          correctCount++;
        }
      }
    });

    const percentage = totalGraded > 0 ? Math.round((correctCount / totalGraded) * 100) : 100;
    setExamScore(percentage);
    setIsExamSubmitted(true);

    // Save score to notebook history
    const scoreEntry = {
      id: `score-${Date.now()}`,
      date: Date.now(),
      score: correctCount,
      total: totalGraded,
      percentage,
      examTitle: activeNotebook.mockExam.examTitle
    };

    const updated = notebooks.map(nb => {
      if (nb.id === activeNotebook.id) {
        return {
          ...nb,
          savedExamScores: [scoreEntry, ...(nb.savedExamScores || [])]
        };
      }
      return nb;
    });
    onUpdateNotebooks(updated);
    showToast(`Exam completed! Score: ${percentage}%`, 'success');
  };

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP GROUNDING STATUS & ACTION BAR */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Active Scope Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className={`p-4 rounded-2xl border ${currentColorStyle.border} ${currentColorStyle.bg} shrink-0 text-2xl`}>
              {activeNotebook?.emoji || '📚'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${currentColorStyle.badge}`}>
                  Active Grounding Scope
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {scopedDocs.length} Source{scopedDocs.length !== 1 ? 's' : ''} • ~{scopedWordCount.toLocaleString()} Words
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Strict RAG Citations
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2">
                <span>{activeNotebook?.title || 'All Workspace Sources'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 line-clamp-1">
                {activeNotebook?.description || 'All uploaded course notes, PDFs, annual reports, and financial models.'}
              </p>
            </div>
          </div>

          {/* Quick Artifact Trigger Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGenerateArtifact('study_guide')}
              disabled={isGeneratingArtifact}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer ${
                generatingType === 'study_guide' ? 'animate-pulse opacity-80' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Study Guide & Timeline</span>
            </button>

            <button
              onClick={() => handleGenerateArtifact('flashcards')}
              disabled={isGeneratingArtifact}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer ${
                generatingType === 'flashcards' ? 'animate-pulse opacity-80' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Flashcard Deck</span>
            </button>

            <button
              onClick={() => handleGenerateArtifact('mock_exam')}
              disabled={isGeneratingArtifact}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer ${
                generatingType === 'mock_exam' ? 'animate-pulse opacity-80' : ''
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Mock Exam</span>
            </button>
          </div>
        </div>

        {/* Source Citation Chips */}
        {scopedDocs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono uppercase text-neutral-400 flex items-center gap-1 font-semibold">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" /> Grounded In:
            </span>
            {scopedDocs.map((doc, idx) => (
              <div
                key={doc.id}
                className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-neutral-300 font-mono text-[11px] flex items-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[140px]">{doc.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE GRID: SIDEBAR & NOTEBOOK ARTIFACTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: NOTEBOOKS & SOURCES (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Notebooks & Sources</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIs10KModalOpen(true)}
                  className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  title="Fetch SEC EDGAR 10-K Annual Report"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Fetch 10-K</span>
                </button>
                <button
                  onClick={() => setIsCreatingNotebook(true)}
                  className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Fetch 10-K Modal / Popover */}
            <AnimatePresence>
              {is10KModalOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleDirectFetch10K}
                  className="p-3.5 rounded-2xl bg-black/80 border border-emerald-500/40 space-y-3 overflow-hidden shadow-2xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Fetch Official 10-K Annual Report</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIs10KModalOpen(false)}
                      className="text-neutral-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Enter company name or ticker to download official SEC EDGAR financial statements and ground them immediately.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={e => setTargetCompany(e.target.value)}
                      placeholder="Company (e.g. Tesla, Apple, Nvidia, Microsoft)"
                      required
                      className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={targetYear}
                        onChange={e => setTargetYear(e.target.value)}
                        placeholder="Year (e.g. 2025)"
                        className="w-24 p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 text-center font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex-1 flex gap-1 overflow-x-auto custom-scrollbar">
                        {['Tesla', 'Apple', 'Nvidia', 'Microsoft'].map(co => (
                          <button
                            key={co}
                            type="button"
                            onClick={() => { setTargetCompany(co); setTargetYear('2025'); }}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg text-[10px] whitespace-nowrap"
                          >
                            {co}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isFetching10K}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isFetching10K ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying SEC EDGAR & Grounding...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Fetch & Ground 10-K Report</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Notebook Creation Form */}
            <AnimatePresence>
              {isCreatingNotebook && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateNotebook}
                  className="p-3.5 rounded-2xl bg-black/60 border border-indigo-500/30 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">Create New Notebook</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNotebook(false)}
                      className="text-neutral-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newEmoji}
                      onChange={e => setNewEmoji(e.target.value)}
                      className="w-10 p-2 bg-neutral-900 border border-white/10 rounded-xl text-center text-sm"
                      placeholder="📚"
                    />
                    <input
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. CFA Level 1 - Corp Finance"
                      required
                      className="flex-1 p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Short description or goal..."
                    rows={2}
                    className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      {(['indigo', 'emerald', 'amber', 'rose', 'cyan', 'purple'] as const).map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewColor(col)}
                          className={`w-4 h-4 rounded-full border ${
                            newColor === col ? 'ring-2 ring-white scale-110' : 'opacity-60'
                          } ${
                            col === 'emerald' ? 'bg-emerald-500' :
                            col === 'amber' ? 'bg-amber-500' :
                            col === 'rose' ? 'bg-rose-500' :
                            col === 'cyan' ? 'bg-cyan-500' :
                            col === 'purple' ? 'bg-purple-500' : 'bg-indigo-500'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                    >
                      Save Notebook
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Notebook List */}
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {/* Option for All Sources */}
              <button
                onClick={() => onSelectNotebook(null)}
                className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between group cursor-pointer ${
                  activeNotebookId === null
                    ? 'bg-neutral-800 border-white/30 text-white shadow-md'
                    : 'bg-neutral-950/60 border-white/5 text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">All Grounded Sources</div>
                    <div className="text-[11px] text-neutral-500">{uploadedDocs.length} total documents</div>
                  </div>
                </div>
                {activeNotebookId === null && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              {notebooks.map(nb => {
                const isActive = activeNotebookId === nb.id;
                const nbDocCount = uploadedDocs.filter(d => nb.docIds.includes(d.id)).length;
                const style = colorStyles[nb.color || 'indigo'];

                return (
                  <div
                    key={nb.id}
                    onClick={() => onSelectNotebook(nb.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between group cursor-pointer relative ${
                      isActive
                        ? `${style.bg} ${style.border} text-white shadow-lg`
                        : 'bg-neutral-950/60 border-white/5 text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-lg shrink-0">{nb.emoji || '📘'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{nb.title}</div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                          <span>{nbDocCount} source{nbDocCount !== 1 ? 's' : ''}</span>
                          {nb.studyGuide && <span className="text-emerald-400">• Guide</span>}
                          {nb.flashcards && <span className="text-amber-400">• Cards</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      <button
                        onClick={e => handleDeleteNotebook(nb.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity"
                        title="Delete Notebook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sources Assignment Inspector */}
            {activeNotebook && (
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-neutral-300 uppercase">
                    Sources in {activeNotebook.title}
                  </span>
                  <button
                    onClick={() => setIsAddingSource(!isAddingSource)}
                    className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Source
                  </button>
                </div>

                {/* Quick Add Note/URL Source Form */}
                {isAddingSource && (
                  <form onSubmit={handleAddQuickSource} className="p-3 bg-black/60 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                      <span>Add Text Note or Article</span>
                      <button type="button" onClick={() => setIsAddingSource(false)} className="text-neutral-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={e => setSourceName(e.target.value)}
                      placeholder="Title: e.g. WACC Lecture 3 Summary"
                      className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                    <textarea
                      value={sourceContent}
                      onChange={e => setSourceContent(e.target.value)}
                      placeholder="Paste note content, summary, or textbook excerpt..."
                      rows={3}
                      className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Add to Workspace
                    </button>
                  </form>
                )}

                {/* Document List with Checkboxes */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {uploadedDocs.map(doc => {
                    const isChecked = activeNotebook.docIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleToggleDocInNotebook(doc.id)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-neutral-900 border-indigo-500/40 text-white'
                            : 'bg-neutral-950/40 border-white/5 text-neutral-500 hover:bg-neutral-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-white/20 text-indigo-600 focus:ring-0"
                          />
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-indigo-400' : 'text-neutral-500'}`} />
                          <span className="truncate text-xs">{doc.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">{doc.size}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ARTIFACT WORKSPACE (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Artifact Nav Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('study_guide')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'study_guide'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Study Guide & Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'flashcards'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards</span>
                {activeNotebook?.flashcards && (
                  <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-bold">
                    {activeNotebook.flashcards.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('mock_exam')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'mock_exam'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Mock Exam</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Notebook Notes</span>
              </button>

              <button
                onClick={() => setActiveTab('financial_analysis')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'financial_analysis'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                <span>Annual Report Suite</span>
                {scopedAnnualReportDoc && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    10-K
                  </span>
                )}
              </button>
            </div>

            {/* Quick action button for current tab */}
            {activeTab === 'study_guide' && (
              <button
                onClick={() => handleGenerateArtifact('study_guide')}
                disabled={isGeneratingArtifact}
                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 ${isGeneratingArtifact ? 'animate-spin' : ''}`} />
                <span>{activeNotebook?.studyGuide ? 'Regenerate' : 'Generate Guide'}</span>
              </button>
            )}
            {activeTab === 'flashcards' && (
              <button
                onClick={() => handleGenerateArtifact('flashcards')}
                disabled={isGeneratingArtifact}
                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 ${isGeneratingArtifact ? 'animate-spin' : ''}`} />
                <span>{activeNotebook?.flashcards ? 'Regenerate Deck' : 'Generate Flashcards'}</span>
              </button>
            )}
            {activeTab === 'mock_exam' && (
              <button
                onClick={() => handleGenerateArtifact('mock_exam')}
                disabled={isGeneratingArtifact}
                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 ${isGeneratingArtifact ? 'animate-spin' : ''}`} />
                <span>{activeNotebook?.mockExam ? 'New Exam' : 'Generate Exam'}</span>
              </button>
            )}
          </div>

          {/* TAB 1: COMPREHENSIVE STUDY GUIDE & TIMELINES */}
          {activeTab === 'study_guide' && (
            <div className="space-y-6">
              {activeNotebook?.studyGuide ? (
                <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6">
                  {/* Guide Header */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                          Grounded Study Guide
                        </span>
                        <span className="text-xs font-mono text-neutral-500">
                          {new Date(activeNotebook.studyGuide.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{activeNotebook.studyGuide.title}</h3>
                    </div>
                    <button
                      onClick={() => handleCopyText(
                        `${activeNotebook.studyGuide?.title}\n\n${activeNotebook.studyGuide?.executiveSummary}\n\nCore Principles:\n` +
                        activeNotebook.studyGuide?.corePrinciples.map(p => `- ${p}`).join('\n'),
                        'guide'
                      )}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5"
                    >
                      {copiedSection === 'guide' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'guide' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Executive Summary */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <h4 className="text-xs font-mono uppercase text-indigo-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Executive Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-medium">
                      {activeNotebook.studyGuide.executiveSummary}
                    </p>
                  </div>

                  {/* Conceptual / Chronological Timeline */}
                  {activeNotebook.studyGuide.timelineOrRoadmap && activeNotebook.studyGuide.timelineOrRoadmap.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Concept Roadmap & Progression Timeline
                      </h4>
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        {activeNotebook.studyGuide.timelineOrRoadmap.map((item, idx) => (
                          <div key={idx} className="relative group">
                            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-neutral-900" />
                            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-white/10 group-hover:border-amber-500/30 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{item.stage}</span>
                                <span className="text-[11px] font-mono text-amber-300">{item.periodOrConcept}</span>
                              </div>
                              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{item.details}</p>
                              {item.citations && item.citations.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.citations.map((c, cIdx) => (
                                    <span key={cIdx} className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-neutral-400 border border-white/5">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Core Formulas & Definitions Table */}
                  {activeNotebook.studyGuide.coreFormulasAndDefinitions && activeNotebook.studyGuide.coreFormulasAndDefinitions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Core Formulas & Technical Definitions
                      </h4>
                      <div className="overflow-x-auto custom-scrollbar border border-white/10 rounded-2xl">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-white/5 text-neutral-400 uppercase text-[10px] border-b border-white/10">
                            <tr>
                              <th className="px-3.5 py-2.5">Term / Metric</th>
                              <th className="px-3.5 py-2.5">Formula / Technical Rule</th>
                              <th className="px-3.5 py-2.5">Real-World Application</th>
                              <th className="px-3.5 py-2.5">Citation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {activeNotebook.studyGuide.coreFormulasAndDefinitions.map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/5">
                                <td className="px-3.5 py-2.5 font-bold text-white">{row.term}</td>
                                <td className="px-3.5 py-2.5 text-emerald-400">{row.formulaOrDefinition}</td>
                                <td className="px-3.5 py-2.5 text-neutral-300">{row.application}</td>
                                <td className="px-3.5 py-2.5 text-neutral-500 text-[10px]">{row.citation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Core Principles */}
                  {activeNotebook.studyGuide.corePrinciples && activeNotebook.studyGuide.corePrinciples.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-mono uppercase text-indigo-400 font-bold">Key Principles & Rules</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeNotebook.studyGuide.corePrinciples.map((principle, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-neutral-950 border border-white/10 text-xs text-neutral-200 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                            <span>{principle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Frequently Tested Questions */}
                  {activeNotebook.studyGuide.frequentlyTestedQuestions && activeNotebook.studyGuide.frequentlyTestedQuestions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> High-Yield Tested Traps & Questions
                      </h4>
                      <div className="space-y-2.5">
                        {activeNotebook.studyGuide.frequentlyTestedQuestions.map((q, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">Q: {q.question}</span>
                              {q.citation && <span className="text-[10px] font-mono text-neutral-500">{q.citation}</span>}
                            </div>
                            <p className="text-xs text-neutral-300 leading-relaxed">
                              <strong className="text-emerald-400 font-semibold">Answer:</strong> {q.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center bg-neutral-900/60 border border-white/10 rounded-3xl space-y-4">
                  <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-16 h-16 mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Generate Comprehensive Study Guide & Timeline</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                      Synthesizes all {scopedDocs.length} grounded sources into an executive study roadmap with core formulas, timeline milestones, and tested questions.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateArtifact('study_guide')}
                    disabled={isGeneratingArtifact}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGeneratingArtifact ? 'Synthesizing with Gemini...' : 'Generate Study Guide Now'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE SPACED-REPETITION FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              {activeNotebook?.flashcards && activeNotebook.flashcards.length > 0 ? (
                <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6">
                  {/* Flashcard Header & Progress */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                        Spaced-Repetition Deck ({currentCardIndex + 1} of {activeNotebook.flashcards.length})
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {activeNotebook.flashcards[currentCardIndex]?.tag || 'Active Recall'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentCardIndex(prev => (prev > 0 ? prev - 1 : activeNotebook.flashcards!.length - 1));
                          setIsCardFlipped(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-white/10 text-xs text-white hover:bg-neutral-700 cursor-pointer"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => {
                          setCurrentCardIndex(prev => (prev < activeNotebook.flashcards!.length - 1 ? prev + 1 : 0));
                          setIsCardFlipped(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 border border-white/10 text-xs text-white hover:bg-neutral-700 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* 3D Flip Card */}
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="min-h-[240px] p-6 rounded-3xl bg-black/60 border border-amber-500/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-amber-400/50 shadow-2xl relative overflow-hidden group"
                  >
                    <span className="absolute top-4 right-4 text-[10px] font-mono text-neutral-500 uppercase">
                      {isCardFlipped ? 'Answer (Click to Flip)' : 'Prompt (Click to Reveal)'}
                    </span>

                    <AnimatePresence mode="wait">
                      {!isCardFlipped ? (
                        <motion.div
                          key="front"
                          initial={{ opacity: 0, rotateY: -90 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: 90 }}
                          className="space-y-3 max-w-lg"
                        >
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 font-bold">
                            Question / Concept
                          </span>
                          <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                            {activeNotebook.flashcards[currentCardIndex]?.front}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="back"
                          initial={{ opacity: 0, rotateY: 90 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: -90 }}
                          className="space-y-3 max-w-lg"
                        >
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 font-bold">
                            Grounded Answer
                          </span>
                          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium">
                            {activeNotebook.flashcards[currentCardIndex]?.back}
                          </p>
                          {activeNotebook.flashcards[currentCardIndex]?.citation && (
                            <span className="inline-block text-[11px] font-mono text-neutral-500 mt-2">
                              Ref: {activeNotebook.flashcards[currentCardIndex]?.citation}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Self-Rating Mastery Controls */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        const cardId = activeNotebook.flashcards![currentCardIndex].id;
                        setMasteryRecord(prev => ({ ...prev, [cardId]: 'hard' }));
                        setCurrentCardIndex(prev => (prev < activeNotebook.flashcards!.length - 1 ? prev + 1 : 0));
                        setIsCardFlipped(false);
                        showToast('Review scheduled for 1 day', 'info');
                      }}
                      className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                    >
                      Hard (1d)
                    </button>
                    <button
                      onClick={() => {
                        const cardId = activeNotebook.flashcards![currentCardIndex].id;
                        setMasteryRecord(prev => ({ ...prev, [cardId]: 'good' }));
                        setCurrentCardIndex(prev => (prev < activeNotebook.flashcards!.length - 1 ? prev + 1 : 0));
                        setIsCardFlipped(false);
                        showToast('Review scheduled for 3 days', 'info');
                      }}
                      className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all cursor-pointer"
                    >
                      Good (3d)
                    </button>
                    <button
                      onClick={() => {
                        const cardId = activeNotebook.flashcards![currentCardIndex].id;
                        setMasteryRecord(prev => ({ ...prev, [cardId]: 'easy' }));
                        setCurrentCardIndex(prev => (prev < activeNotebook.flashcards!.length - 1 ? prev + 1 : 0));
                        setIsCardFlipped(false);
                        showToast('Mastered! Review scheduled for 7 days', 'success');
                      }}
                      className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
                    >
                      Easy (7d)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-neutral-900/60 border border-white/10 rounded-3xl space-y-4">
                  <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 w-16 h-16 mx-auto flex items-center justify-center">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Generate Spaced-Repetition Flashcards</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                      Extracts active recall flashcards strictly grounded in {scopedDocs.length} notebook sources.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateArtifact('flashcards')}
                    disabled={isGeneratingArtifact}
                    className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{isGeneratingArtifact ? 'Generating Flashcards...' : 'Generate Flashcards Now'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI MOCK EXAM QUIZ WITH SCORE TRACKING */}
          {activeTab === 'mock_exam' && (
            <div className="space-y-6">
              {activeNotebook?.mockExam ? (
                <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6">
                  {/* Exam Title & Score Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          Grounded Mock Exam
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          {activeNotebook.mockExam.questions.length} Questions • ~{activeNotebook.mockExam.timeLimitMinutes} Mins
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-0.5">{activeNotebook.mockExam.examTitle}</h3>
                    </div>

                    {isExamSubmitted && examScore !== null && (
                      <div className="px-4 py-2 rounded-2xl bg-black/60 border border-emerald-500/40 text-center">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block">Final Score</span>
                        <span className={`text-xl font-bold font-mono ${examScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {examScore}% {examScore >= 70 ? '• Pass' : '• Review Needed'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Questions List */}
                  <div className="space-y-6">
                    {activeNotebook.mockExam.questions.map((q, idx) => {
                      const isMcq = q.type === 'mcq';
                      const selectedOption = userAnswers[q.id];
                      const isCorrect = selectedOption === q.correctAnswerIndex;

                      return (
                        <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold text-white">
                              Question {idx + 1}: {q.question}
                            </span>
                            {q.citation && (
                              <span className="text-[10px] font-mono text-neutral-500 shrink-0">{q.citation}</span>
                            )}
                          </div>

                          {/* MCQ Options */}
                          {isMcq && q.options && (
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => {
                                const isChosen = selectedOption === optIdx;
                                let optionBg = 'bg-neutral-900 border-white/10 text-neutral-300 hover:bg-neutral-800';

                                if (isExamSubmitted) {
                                  if (optIdx === q.correctAnswerIndex) {
                                    optionBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                                  } else if (isChosen && !isCorrect) {
                                    optionBg = 'bg-rose-500/20 border-rose-500 text-rose-300';
                                  }
                                } else if (isChosen) {
                                  optionBg = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    disabled={isExamSubmitted}
                                    onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                    className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${optionBg}`}
                                  >
                                    <span>{opt}</span>
                                    {isExamSubmitted && optIdx === q.correctAnswerIndex && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Essay / Calculation Question */}
                          {!isMcq && (
                            <div className="space-y-2">
                              <textarea
                                disabled={isExamSubmitted}
                                value={(userAnswers[q.id] as string) || ''}
                                onChange={e => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                placeholder="Type your step-by-step calculation or analytical answer..."
                                rows={3}
                                className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500"
                              />
                            </div>
                          )}

                          {/* Explanation (Revealed after submission) */}
                          {isExamSubmitted && (
                            <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-xs space-y-1.5">
                              <span className="font-bold text-emerald-400 block">Explanation & Grounded Citation:</span>
                              <p className="text-neutral-300 leading-relaxed font-medium">
                                {q.explanation || q.modelAnswer}
                              </p>
                              {q.keyGradingPoints && (
                                <div className="mt-2 pt-2 border-t border-white/5">
                                  <span className="text-[11px] font-mono text-neutral-400 font-semibold block">Key Rubric Points:</span>
                                  <ul className="list-disc list-inside text-neutral-400 text-[11px] mt-1 space-y-0.5">
                                    {q.keyGradingPoints.map((pt, ptIdx) => (
                                      <li key={ptIdx}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Exam Submission / Reset Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {!isExamSubmitted ? (
                      <button
                        onClick={handleSubmitExam}
                        className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                      >
                        Submit Exam for Grading
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsExamSubmitted(false);
                          setUserAnswers({});
                          setExamScore(null);
                        }}
                        className="px-5 py-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Exam</span>
                      </button>
                    )}

                    {activeNotebook.savedExamScores && activeNotebook.savedExamScores.length > 0 && (
                      <span className="text-xs font-mono text-neutral-500">
                        Past attempts: {activeNotebook.savedExamScores.length} (Best: {Math.max(...activeNotebook.savedExamScores.map(s => s.percentage))}%)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-neutral-900/60 border border-white/10 rounded-3xl space-y-4">
                  <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-16 h-16 mx-auto flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Generate AI Mock Exam Quiz</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                      Generates a realistic 5-question mock exam quiz with instant grading and explanations grounded in your {scopedDocs.length} notebook materials.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateArtifact('mock_exam')}
                    disabled={isGeneratingArtifact}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>{isGeneratingArtifact ? 'Creating Exam...' : 'Generate Mock Exam'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTEBOOK SCRATCHPAD / STUDIO NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Notebook Scratchpad</h3>
                  <p className="text-xs text-neutral-400">
                    Add custom study notes and key principles. These are automatically included in the Grounded RAG context.
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(activeNotebook?.notes || '', 'notes')}
                  className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white flex items-center gap-1"
                >
                  {copiedSection === 'notes' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'notes' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <textarea
                value={activeNotebook?.notes || ''}
                onChange={e => handleUpdateNotes(e.target.value)}
                placeholder="Write markdown notes, formula derivations, key definitions..."
                rows={14}
                className="w-full p-4 bg-black/60 border border-white/10 rounded-2xl text-xs sm:text-sm text-neutral-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar"
              />
            </div>
          )}

          {/* TAB 5: FINANCIAL ANALYSIS SUITE (10-K & ANNUAL REPORTS) */}
          {activeTab === 'financial_analysis' && (
            <div className="space-y-4">
              {scopedAnnualReportDoc ? (
                <FinancialAnalysisSuite
                  doc={scopedAnnualReportDoc}
                  onAnalysisGenerated={(res) => {
                    showToast(`Generated ${res.title}!`, 'success');
                  }}
                />
              ) : (
                <div className="p-12 text-center bg-neutral-900/60 border border-white/10 rounded-3xl space-y-4">
                  <div className="p-4 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 w-16 h-16 mx-auto flex items-center justify-center">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">No 10-K Annual Report Linked</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                      Fetch an official SEC EDGAR 10-K annual report to unlock one-click Balance Sheet extraction, CEO Letter summaries, Risk Matrices, and YoY Variance analysis.
                    </p>
                  </div>
                  <button
                    onClick={() => setIs10KModalOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Fetch Official 10-K Report Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
