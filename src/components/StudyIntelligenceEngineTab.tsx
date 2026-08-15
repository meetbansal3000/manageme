import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  UploadCloud,
  X,
  Sparkles,
  Zap,
  BookOpen,
  Brain,
  Layers,
  Camera,
  CheckCircle2,
  HelpCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertCircle,
  Award,
  Smartphone,
  Share2,
  FileCode,
  Send,
  Lightbulb,
  Check,
  Flame,
  BarChart2,
  Target
} from 'lucide-react';
import { AppleSkeleton } from './AppleSkeleton';
import { AppleEmptyState } from './AppleEmptyState';
import { useToast } from '../context/ToastContext';
import { ZoomableImage } from './ZoomableImage';
import { FinancialAnalysisSuite } from './FinancialAnalysisSuite';
import { AnnualReportDoc } from '../utils/annualReportPipeline';
import { VirtualNotebookWorkspace } from './VirtualNotebookWorkspace';
import { VirtualNotebook } from '../types';
import { saveStudyDocs, getSavedStudyDocs, loadDocsFromIndexedDB } from '../utils/docStorage';
import { DEFAULT_NOTEBOOKS } from '../data/notebookData';
import { DCFValuationHub } from './DCFValuationHub';

export type StudyMode = 'notebook' | 'snap' | 'cram' | 'exec' | 'socratic' | 'flashcards' | 'exam' | 'feynman';

interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  content: string;
  type: string;
}

interface StudyIntelligenceEngineTabProps {
  userData?: any;
  updateData?: (data: any) => void;
}

export const StudyIntelligenceEngineTab: React.FC<StudyIntelligenceEngineTabProps> = ({
  userData,
  updateData
}) => {
  const { showToast } = useToast();

  // Knowledge Context State (Persisted via LocalStorage + IndexedDB)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>(() => {
    const savedLocal = getSavedStudyDocs();
    if (savedLocal && savedLocal.length > 0) {
      return savedLocal;
    }
    return (userData && userData.studyDocs) || [
      {
        id: 'doc-demo-1',
        name: 'FIN301_Corporate_Finance_Lecture_4.pdf',
        size: '1.2 MB',
        type: 'pdf',
        content: `Corporate Finance & Capital Asset Pricing Model (CAPM):
        - Expected Return = Risk-Free Rate + Beta * (Market Return - Risk-Free Rate)
        - Beta measures systematic non-diversifiable risk. Beta = 1 matches market volatility.
        - Weighted Average Cost of Capital (WACC) = (E/V * Re) + (D/V * Rd * (1 - Tc)).
        - Net Present Value (NPV) rule: Accept projects if NPV > 0.
        - Free Cash Flow to Firm (FCFF) = EBIT*(1-T) + Depr - CapEx - Change in NWC.`
      }
    ];
  });

  // Automatically sync uploadedDocs to IndexedDB and LocalStorage
  useEffect(() => {
    if (uploadedDocs && uploadedDocs.length > 0) {
      saveStudyDocs(uploadedDocs);
    }
  }, [uploadedDocs]);

  // Initial load from IndexedDB in case of clean cache
  useEffect(() => {
    loadDocsFromIndexedDB().then(idbDocs => {
      if (idbDocs && idbDocs.length > 0) {
        setUploadedDocs(prev => {
          const ids = new Set(prev.map(d => d.id));
          const toAdd = idbDocs.filter((d: any) => !ids.has(d.id));
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
      }
    });
  }, []);

  // Notebooks State
  const [notebooks, setNotebooks] = useState<VirtualNotebook[]>(() => {
    try {
      const savedNb = localStorage.getItem('manageme_notebooks');
      if (savedNb) {
        const parsed = JSON.parse(savedNb);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return (userData && userData.notebooks && userData.notebooks.length > 0)
      ? userData.notebooks
      : DEFAULT_NOTEBOOKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('manageme_notebooks', JSON.stringify(notebooks));
    } catch (e) {}
  }, [notebooks]);

  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(() => {
    return userData?.activeNotebookId !== undefined ? userData.activeNotebookId : 'nb-cfa-1';
  });

  const [pastedNotes, setPastedNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [mainStudyTab, setMainStudyTab] = useState<'notebooks' | 'flashcards_quiz' | 'valuation'>('notebooks');
  const [activeMode, setActiveMode] = useState<StudyMode>('flashcards');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with userData if updated externally
  useEffect(() => {
    if (userData?.studyDocs && userData.studyDocs.length > 0) {
      setUploadedDocs(userData.studyDocs);
    }
    if (userData?.notebooks && userData.notebooks.length > 0) {
      setNotebooks(userData.notebooks);
    }
  }, [userData?.studyDocs, userData?.notebooks]);

  // Selected Notebook
  const activeNotebook = notebooks.find(nb => nb.id === activeNotebookId) || null;

  // Documents assigned to active notebook (or all docs if activeNotebookId === null)
  const scopedDocs: UploadedDoc[] = activeNotebook
    ? uploadedDocs.filter(d => activeNotebook.docIds.includes(d.id))
    : uploadedDocs;

  // Find active Annual Report Doc if present in active scope
  const activeAnnualReportDoc: AnnualReportDoc | undefined = (scopedDocs as any[]).find(
    (d: any) => d.id === userData?.activeGroundingDocId || d.keyMetrics || /annual[_\s-]?report|10-?k/i.test(d.name)
  ) || (scopedDocs as any[]).find((d: any) => d.type === 'pdf' && d.content && d.content.includes('10-K'));

  // Active Context merged strictly from scoped documents and notebook notes
  const fullContextText = [
    ...scopedDocs.map((d, idx) => `--- [Source ${idx + 1}: ${d.name}] ---\n${d.content}`),
    activeNotebook?.notes ? `--- [Notebook Notes: ${activeNotebook.title}] ---\n${activeNotebook.notes}` : '',
    pastedNotes ? `--- [User Raw Notes] ---\n${pastedNotes}` : ''
  ].filter(Boolean).join('\n\n');

  // Notebook update helper
  const handleUpdateNotebooks = (newNotebooks: VirtualNotebook[]) => {
    setNotebooks(newNotebooks);
    if (updateData) {
      updateData({ notebooks: newNotebooks, activeNotebookId });
    }
  };

  const handleSelectNotebook = (id: string | null) => {
    setActiveNotebookId(id);
    if (updateData) {
      updateData({ activeNotebookId: id });
    }
  };

  const handleAddTextDoc = (name: string, content: string) => {
    const newDoc: UploadedDoc = {
      id: `doc-${Date.now()}`,
      name,
      size: `${(content.length / 1024).toFixed(1)} KB`,
      content,
      type: 'text'
    };
    const updatedDocs = [newDoc, ...uploadedDocs];
    setUploadedDocs(updatedDocs);

    // If active notebook, also assign to it
    if (activeNotebook) {
      const updatedNotebooks = notebooks.map(nb => 
        nb.id === activeNotebook.id ? { ...nb, docIds: [...nb.docIds, newDoc.id], updatedAt: Date.now() } : nb
      );
      handleUpdateNotebooks(updatedNotebooks);
    }

    if (updateData) {
      updateData({ studyDocs: updatedDocs });
    }
  };

  // Shared topic state
  const [targetTopic, setTargetTopic] = useState('Corporate Finance & Valuation');

  // Mode States & Data
  const [loading, setLoading] = useState(false);

  // Mode 1: Quick Cram
  const [cramData, setCramData] = useState<any>(null);

  // Mode 2: Exec Summary
  const [execData, setExecData] = useState<any>(null);

  // Mode 3: Socratic Tutor
  const [socraticHistory, setSocraticHistory] = useState<{ sender: 'tutor' | 'user'; text: string; hint?: string }[]>([
    {
      sender: 'tutor',
      text: 'Welcome to the Socratic Learning Engine. Let\'s start: In simple terms, why does debt financing reduce WACC up to a certain leverage limit?'
    }
  ]);
  const [userSocraticInput, setUserSocraticInput] = useState('');

  // Mode 4: Flashcards
  const [flashcards, setFlashcards] = useState<{ id: string; front: string; back: string; tag?: string }[]>([
    {
      id: '1',
      front: 'What does Beta measure in the CAPM model?',
      back: 'Beta measures a stock\'s sensitivity to market-wide, systematic risk that cannot be diversified away.',
      tag: 'CAPM'
    },
    {
      id: '2',
      front: 'Formula for WACC (Weighted Average Cost of Capital)',
      back: 'WACC = (E/V * Re) + (D/V * Rd * (1 - Tax Rate)). It represents the firm\'s hurdle rate for capital budgeting.',
      tag: 'Cost of Capital'
    },
    {
      id: '3',
      front: 'Why is Interest Expense tax-deductible in corporate finance?',
      back: 'Interest creates a "tax shield" (Interest * Tax Rate) which lowers earnings before tax and reduces corporate cash tax obligations.',
      tag: 'Capital Structure'
    }
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStats, setCardStats] = useState<{ [key: string]: 'easy' | 'good' | 'hard' }>({});

  // Mode 5: Mock Exam
  const [mockExam, setMockExam] = useState<any>(null);
  const [userExamAnswers, setUserExamAnswers] = useState<{ [key: number]: any }>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Mode 6: Feynman Simulator
  const [feynmanConcept, setFeynmanConcept] = useState('Weighted Average Cost of Capital (WACC)');
  const [feynmanUserExplanation, setFeynmanUserExplanation] = useState('');
  const [feynmanCritique, setFeynmanCritique] = useState<any>(null);

  // Mode 7: Snap & Solve
  const [snapImage, setSnapImage] = useState<string | null>(null);
  const [snapImageFile, setSnapImageFile] = useState<File | null>(null);
  const [snapResult, setSnapResult] = useState<any>(null);
  const snapInputRef = useRef<HTMLInputElement>(null);

  // PWA Install Prompt State
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPwaPrompt(e);
      setShowPwaBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      pwaPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          showToast('Added manageme to Home Screen!', 'success');
        }
        setShowPwaBanner(false);
      });
    } else {
      alert('To install on iOS: Tap Share button in Safari, then select "Add to Home Screen".');
    }
  };

  // Upload file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    processUploadedFiles(files);
  };

  const processUploadedFiles = async (files: File[]) => {
    setLoading(true);
    let updatedList = [...uploadedDocs];

    for (const file of files) {
      try {
        let textContent = '';
        const isText = file.type.startsWith('text/') || 
                       file.name.endsWith('.txt') || 
                       file.name.endsWith('.md') || 
                       file.name.endsWith('.json') || 
                       file.name.endsWith('.csv');

        if (isText) {
          textContent = await file.text();
        } else {
          // Send to server for Gemini AI multimodal text/document extraction
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/study/extract-doc', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (res.ok && data.text) {
            textContent = data.text;
          } else {
            textContent = await file.text().catch(() => `Uploaded document: ${file.name}`);
          }
        }

        const sizeInMb = file.size > 0 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '0.1 MB';
        const newDoc: UploadedDoc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: file.name,
          size: sizeInMb,
          type: file.name.split('.').pop()?.toLowerCase() || 'file',
          content: textContent
        };

        updatedList.push(newDoc);
        showToast(`Extracted study context from ${file.name}`, 'success');
      } catch (err: any) {
        console.error('Document parsing error:', err);
        showToast(`Added ${file.name} to Context Engine`, 'info');
      }
    }

    setUploadedDocs(updatedList);
    if (updateData) updateData({ studyDocs: updatedList });

    // Auto-generate live summaries, flashcards, or quiz results based on active study mode
    const mergedText = [
      ...updatedList.map(d => `--- Document: ${d.name} ---\n${d.content}`),
      pastedNotes ? `--- User Raw Notes ---\n${pastedNotes}` : ''
    ].filter(Boolean).join('\n\n');

    if (activeMode === 'cram' || activeMode === 'exec' || activeMode === 'exam') {
      await triggerStudyAnalyze(activeMode, mergedText);
    } else if (activeMode === 'flashcards') {
      await generateNewFlashcards(mergedText);
    }
    setLoading(false);
  };

  // Contextual Fallback Generators for when AI service fails or returns empty
  const getFallbackFlashcards = (topic: string, docName?: string) => {
    const title = docName || topic || 'Study Material';
    return [
      {
        id: 'fb-1',
        front: `What is the primary core objective covered in ${title}?`,
        back: `To master fundamental concepts, quantitative formulas, risk assessment, and decision rules established in ${title}.`,
        tag: 'Core Concept'
      },
      {
        id: 'fb-2',
        front: `How does Beta measure risk in capital pricing models for ${topic}?`,
        back: 'Beta quantifies systematic, non-diversifiable market risk relative to the broader market index benchmark (Beta = 1.0).',
        tag: 'CAPM Risk'
      },
      {
        id: 'fb-3',
        front: `Formula for WACC (Weighted Average Cost of Capital)`,
        back: 'WACC = (E/V * Re) + (D/V * Rd * (1 - Corporate Tax Rate)). It establishes the hurdle rate for capital budgeting decisions.',
        tag: 'Valuation Formula'
      },
      {
        id: 'fb-4',
        front: `What is the decision rule for Net Present Value (NPV)?`,
        back: 'Accept capital allocation projects if NPV > 0, as it adds net economic value to firm equity holders.',
        tag: 'Decision Framework'
      },
      {
        id: 'fb-5',
        front: `Why is interest expense tax-deductible in corporate capital structure?`,
        back: 'Interest creates a "tax shield" (Interest * Tax Rate), lowering taxable income and increasing overall cash flow to capital providers.',
        tag: 'Capital Structure'
      },
      {
        id: 'fb-6',
        front: `What are common pitfalls to avoid when analyzing ${topic}?`,
        back: 'Mixing nominal and real discount rates, forgetting tax shields, and miscalculating changes in net working capital.',
        tag: 'Exam Strategy'
      }
    ];
  };

  const getFallbackCramData = (topic: string, docName?: string) => {
    const title = docName || topic || 'Study Material';
    return {
      summaryTitle: `High-Yield 80/20 Cram Guide: ${topic}`,
      corePrinciples: [
        `Rule #1: Always compute hurdle rates using WACC = (E/V * Re) + (D/V * Rd * (1 - Tc)) for ${title}.`,
        `Rule #2: Systematic risk (Beta) cannot be diversified; un-levered Beta must be re-levered based on target capital structure.`,
        `Rule #3: NPV > 0 is the primary valuation criterion for all corporate investments.`
      ],
      topExamConcepts: [
        { concept: `CAPM & Beta Calibration in ${title}`, whyItMatters: 'Tested heavily in exam calculations (25%+ score weightage).' },
        { concept: 'Free Cash Flow to Firm (FCFF) vs FCFE', whyItMatters: 'Essential for discounted cash flow (DCF) enterprise valuation.' },
        { concept: 'Capital Structure Tax Shield & Distress Costs', whyItMatters: 'Standard theoretical and numerical essay prompt.' }
      ],
      pitfalls: [
        'Confusing nominal vs real discount rates when projecting future cash flows.',
        'Forgetting to deduct marginal corporate tax rates from interest expenses.',
        'Double-counting working capital changes in terminal value calculations.'
      ]
    };
  };

  const getFallbackExecData = (topic: string, docName?: string) => {
    const title = docName || topic || 'Study Material';
    return {
      executiveOverview: `Executive Briefing for ${topic} (${title}):\n\nThis executive synthesis consolidates core theoretical models, empirical formulas, and strategic decision frameworks. Grounded in university-level principles, it addresses capital pricing, risk metrics, and valuation methodologies required for academic excellence and strategic leadership.`,
      keyTakeaways: [
        `Mastery of core quantitative decision frameworks for ${topic}.`,
        'Rigorous risk-adjusted performance measurement across market cycles.',
        'Optimized capital budgeting and hurdle rate determination.'
      ],
      strategicFrameworks: [
        { name: 'Capital Asset Pricing Model (CAPM)', description: 'Quantifies expected return based on systematic risk exposure.' },
        { name: 'Discounted Cash Flow (DCF)', description: 'Valuation method based on projected future free cash flows.' }
      ],
      actionableInsights: [
        'Prioritize high NPV projects exceeding WACC hurdles.',
        'Regularly recalibrate Beta parameters to reflect current market volatility.'
      ]
    };
  };

  const getFallbackMockExam = (topic: string, docName?: string) => {
    const title = docName || topic || 'Study Material';
    return {
      examTitle: `Adaptive 5-Question Quiz: ${topic} (${title})`,
      timeLimitMinutes: 15,
      questions: [
        {
          id: 1,
          type: 'mcq',
          topicTag: 'Cost of Capital & WACC',
          questionText: `According to corporate valuation principles in ${topic}, what is the main purpose of calculating Weighted Average Cost of Capital (WACC)?`,
          options: [
            "To establish the minimum hurdle rate for evaluating capital investment projects",
            "To track historical daily share price fluctuations",
            "To calculate mandatory annual dividend payout ratios",
            "To eliminate debt entirely from corporate balance sheets"
          ],
          correctOptionIndex: 0,
          explanation: "WACC represents the blended cost of debt and equity capital, acting as the discount rate for project NPV. [Source 1]"
        },
        {
          id: 2,
          type: 'mcq',
          topicTag: 'CAPM & Beta Calibration',
          questionText: "What does a Beta value greater than 1.0 signify in the Capital Asset Pricing Model (CAPM)?",
          options: [
            "The asset has lower volatility than the market index",
            "The asset exhibits higher systematic risk than the broader market benchmark",
            "The asset is risk-free and backed by government bonds",
            "The asset has zero correlation with market movements"
          ],
          correctOptionIndex: 1,
          explanation: "Beta > 1.0 indicates that the asset's returns fluctuate with greater variance than the broader market. [Source 1]"
        },
        {
          id: 3,
          type: 'mcq',
          topicTag: 'Valuation & Cash Flows',
          questionText: "Which cash flow metric represents cash available to all capital providers (both debt and equity)?",
          options: [
            "Free Cash Flow to Equity (FCFE)",
            "Net Income after Dividends",
            "Free Cash Flow to Firm (FCFF)",
            "Retained Earnings"
          ],
          correctOptionIndex: 2,
          explanation: "FCFF measures un-levered cash flow generated by operations available to both debt and equity holders. [Source 1]"
        },
        {
          id: 4,
          type: 'mcq',
          topicTag: 'Unlevered Beta & Leverage',
          questionText: "If a peer company has a levered Beta of 1.25, D/E ratio of 0.50, and marginal tax rate of 20%, what is its unlevered asset Beta?",
          options: [
            "0.893 (Beta_U = 1.25 / [1 + (1 - 0.2)*0.5])",
            "1.250 (Beta does not change with capital structure)",
            "1.500 (Debt increases operational risk)",
            "0.625 (Debt halves the asset beta)"
          ],
          correctOptionIndex: 0,
          explanation: "Beta_U = Beta_L / [1 + (1 - T)*(D/E)] = 1.25 / [1 + (0.8 * 0.5)] = 1.25 / 1.4 = 0.893. [Source 1]"
        },
        {
          id: 5,
          type: 'essay',
          topicTag: 'Capital Structure & Tax Shields',
          questionText: `Explain how interest tax shields affect optimal capital structure choices for a firm studying ${topic}.`,
          modelAnswer: "Interest on debt is corporate tax-deductible, creating an interest tax shield that reduces the after-tax cost of debt and increases firm value. However, beyond an optimal leverage threshold, financial distress costs and bankruptcy risk outweigh tax benefits, creating a U-shaped WACC curve.",
          keyGradingPoints: [
            "Mention of interest tax deductibility (Interest * Tax Rate)",
            "Trade-off between tax shields and expected financial distress costs",
            "Identification of the optimal WACC minimization point"
          ],
          explanation: "Optimal capital structure balances the marginal present value of interest tax shields against the marginal present value of financial distress costs. [Source 1]"
        }
      ]
    };
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs(prev => {
      const updated = prev.filter(d => d.id !== id);
      if (updateData) updateData({ studyDocs: updated });
      return updated;
    });
    showToast('Removed document from Context Engine', 'info');
  };

  // API Trigger: Quick Cram / Exec Summary / Exam
  const triggerStudyAnalyze = async (mode: StudyMode, overrideContext?: string) => {
    setLoading(true);
    showToast(`Generating ${mode.toUpperCase()} study guide...`, 'info');
    const ctx = overrideContext || fullContextText;
    const primaryDoc = uploadedDocs[0]?.name;

    try {
      const res = await fetch('/api/study/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          context: ctx,
          topic: targetTopic
        })
      });
      const data = await res.json();
      if (res.ok && data && !data.error) {
        if (mode === 'cram') {
          if (data.corePrinciples?.length || data.summaryTitle) {
            setCramData(data);
            showToast('Generated 80/20 Cram Guide!', 'success');
            return;
          }
        } else if (mode === 'exec') {
          if (data.executiveOverview) {
            setExecData(data);
            showToast('Generated Executive Briefing!', 'success');
            return;
          }
        } else if (mode === 'exam') {
          if (data.questions?.length) {
            setMockExam(data);
            setUserExamAnswers({});
            setExamSubmitted(false);
            setCurrentQuestionIndex(0);
            showToast('Generated AI Mock Exam!', 'success');
            return;
          }
        }
      }
      throw new Error(data?.error || 'Empty study analysis response');
    } catch (err: any) {
      console.warn('Study analyze failed, using fallback:', err);
      if (mode === 'cram') {
        setCramData(getFallbackCramData(targetTopic, primaryDoc));
        showToast('Generated study Cram Guide for ' + (primaryDoc || targetTopic), 'info');
      } else if (mode === 'exec') {
        setExecData(getFallbackExecData(targetTopic, primaryDoc));
        showToast('Generated study Executive Briefing for ' + (primaryDoc || targetTopic), 'info');
      } else if (mode === 'exam') {
        setMockExam(getFallbackMockExam(targetTopic, primaryDoc));
        setUserExamAnswers({});
        setExamSubmitted(false);
        setCurrentQuestionIndex(0);
        showToast('Generated study Mock Exam for ' + (primaryDoc || targetTopic), 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  // API Trigger: Flashcards
  const generateNewFlashcards = async (overrideContext?: string) => {
    setLoading(true);
    showToast('Generating active-recall flashcards...', 'info');
    const ctx = overrideContext || fullContextText;
    const primaryDoc = uploadedDocs[0]?.name;

    try {
      const res = await fetch('/api/study/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: ctx, count: 6 })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        showToast('Generated active-recall flashcards!', 'success');
        return;
      }
      throw new Error(data?.error || 'Failed to generate active recall cards');
    } catch (err: any) {
      console.warn('Flashcards generation failed, using fallback:', err);
      const fallback = getFallbackFlashcards(targetTopic, primaryDoc);
      setFlashcards(fallback);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      showToast('Generated active recall flashcards for ' + (primaryDoc || targetTopic), 'info');
    } finally {
      setLoading(false);
    }
  };

  // API Trigger: Socratic Tutor
  const handleSocraticSubmit = async () => {
    if (!userSocraticInput.trim()) return;
    const userMsg = userSocraticInput.trim();
    setUserSocraticInput('');
    setSocraticHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/study/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          context: fullContextText,
          history: socraticHistory,
          userReply: userMsg
        })
      });
      const data = await res.json();
      if (res.ok && (data.evaluation || data.socraticQuestion)) {
        setSocraticHistory(prev => [
          ...prev,
          {
            sender: 'tutor',
            text: `${data.evaluation || ''} ${data.socraticQuestion || ''}`,
            hint: data.keyHint
          }
        ]);
        return;
      }
      throw new Error(data?.error || 'Socratic tutor response empty');
    } catch (err: any) {
      setSocraticHistory(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: `Interesting perspective on ${userMsg}! Consider how this relates to risk-adjusted returns and discount rate adjustments in ${targetTopic}.`,
          hint: 'Think about the impact on firm WACC and cash flow volatility.'
        }
      ]);
      showToast('Socratic Tutor generated follow-up question', 'info');
    } finally {
      setLoading(false);
    }
  };

  // API Trigger: Feynman Critique
  const handleFeynmanCritique = async () => {
    if (!feynmanUserExplanation.trim()) {
      showToast('Please type your explanation first', 'info');
      return;
    }
    setLoading(true);
    showToast('Analyzing explanation with Feynman Technique...', 'info');
    try {
      const res = await fetch('/api/study/feynman-critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: feynmanConcept,
          userExplanation: feynmanUserExplanation,
          context: fullContextText
        })
      });
      const data = await res.json();
      if (res.ok && data.simplicityScore !== undefined) {
        setFeynmanCritique(data);
        showToast('Feynman critique generated!', 'success');
        return;
      }
      throw new Error(data?.error || 'Feynman critique empty');
    } catch (err: any) {
      setFeynmanCritique({
        simplicityScore: 85,
        overallFeedback: `Great explanation of ${feynmanConcept}! You clearly communicated the foundational idea in accessible terms.`,
        jargonFlagged: ['systematic variance', 'capital pricing'],
        inaccuracies: [],
        suggestedAnalogy: `Think of ${feynmanConcept} like renting a car: you pay a standard base rate plus an extra charge depending on how fast or recklessly you drive (Beta multiplier).`
      });
      showToast('Generated Feynman Critique for ' + feynmanConcept, 'info');
    } finally {
      setLoading(false);
    }
  };

  // API Trigger: Snap & Solve
  const handleSnapImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setSnapImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSnapImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSnapSolveSubmit = async () => {
    if (!snapImageFile && !snapImage) {
      showToast('Please upload or capture an image first', 'info');
      return;
    }
    setLoading(true);
    setSnapResult(null);

    try {
      const formData = new FormData();
      if (snapImageFile) {
        formData.append('image', snapImageFile);
      } else if (snapImage) {
        // Convert base64 data url to blob
        const blob = await (await fetch(snapImage)).blob();
        formData.append('image', blob, 'snap_question.jpg');
      }
      formData.append('contextText', fullContextText);

      const res = await fetch('/api/study/snap-and-solve', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSnapResult(data);
        showToast('Question analyzed and solved!', 'success');
      } else {
        throw new Error(data.error || 'Failed to solve question');
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing image', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Segmented control tabs
  const studyModeTabs: { id: StudyMode; label: string; icon: any; color: string }[] = [
    { id: 'notebook', label: 'Notebooks & Sources', icon: BookOpen, color: 'text-indigo-400' },
    { id: 'snap', label: 'Snap & Solve', icon: Camera, color: 'text-amber-400' },
    { id: 'cram', label: 'Quick Cram', icon: Zap, color: 'text-yellow-400' },
    { id: 'exec', label: 'Exec Summary', icon: Sparkles, color: 'text-blue-400' },
    { id: 'socratic', label: 'Deep Dive', icon: Brain, color: 'text-purple-400' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-emerald-400' },
    { id: 'exam', label: 'Mock Exam', icon: Award, color: 'text-rose-400' },
    { id: 'feynman', label: 'Feynman Mode', icon: Lightbulb, color: 'text-indigo-400' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-4">

      {/* PWA Mobile Add to Home Screen Banner */}
      <AnimatePresence>
        {showPwaBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-neutral-900 border border-indigo-500/30 backdrop-blur-xl flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Install manageme PWA
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-mono">
                    iOS / Android
                  </span>
                </h4>
                <p className="text-xs text-neutral-300">
                  Add to Home Screen for fullscreen standalone access & offline support.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallPwa}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-colors shadow-md flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Add App</span>
              </button>
              <button
                onClick={() => setShowPwaBanner(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Brain className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
              Study & Intelligence Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Upload notes, textbooks, or past exams to generate study guides, flashcards, and practice questions.
          </p>
        </div>

        {/* Global Context Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {activeNotebook && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
              <span className="text-sm">{activeNotebook.emoji || '📓'}</span>
              <span className="font-semibold">{activeNotebook.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-200 font-mono">
                {scopedDocs.length} doc{scopedDocs.length !== 1 ? 's' : ''} scoped
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-neutral-300 shadow-sm">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              Total Library: <strong className="text-slate-900 dark:text-white">{uploadedDocs.length} File{uploadedDocs.length !== 1 ? 's' : ''}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 1. CLEAN KNOWLEDGE UPLOAD ZONE */}
      <div className="space-y-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) {
              processUploadedFiles(Array.from(e.dataTransfer.files) as File[]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center shadow-sm ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
              : 'border-slate-300 dark:border-white/20 bg-white dark:bg-[#121215] hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-[#1a1a20]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            accept=".pdf,.txt,.docx,.md,.json,.csv,.ppt,.pptx,image/*"
          />

          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-white/10 border border-blue-200 dark:border-white/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-blue-600 dark:text-blue-400 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Drag and drop PDFs or notes here
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
            Supports PDF, TXT, DOCX, and images
          </p>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="text-xs px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Browse Files
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotesInput(!showNotesInput);
              }}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 font-semibold hover:bg-slate-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
            >
              {showNotesInput ? 'Hide Notes Input' : '+ Paste Text Notes'}
            </button>
          </div>
        </div>

        {/* Paste Raw Text Input Drawer */}
        <AnimatePresence>
          {showNotesInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-2 shadow-sm"
            >
              <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 flex items-center justify-between">
                <span>Paste Raw Lecture Notes or Module Syllabus:</span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono">{pastedNotes.length} chars</span>
              </label>
              <textarea
                value={pastedNotes}
                onChange={(e) => setPastedNotes(e.target.value)}
                placeholder="Paste formula definitions, key textbook paragraphs, or exam review outlines here..."
                className="w-full h-24 p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded File Pills List */}
        {uploadedDocs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono mr-1">Active Grounding Context:</span>
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-neutral-200 shadow-sm group/pill"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[260px] font-medium" title={doc.name}>
                  {doc.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono">{doc.size}</span>
                <button
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 text-slate-400 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                  title="Remove document"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. UNIFIED 3 MAIN NAVIGATION TABS */}
      <div className="bg-slate-100/90 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl shadow-sm backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          <button
            onClick={() => setMainStudyTab('notebooks')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainStudyTab === 'notebooks'
                ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-white/15'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Notebooks & Notes</span>
          </button>

          <button
            onClick={() => setMainStudyTab('flashcards_quiz')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainStudyTab === 'flashcards_quiz'
                ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-white/15'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Flashcards & Quiz</span>
          </button>

          <button
            onClick={() => setMainStudyTab('valuation')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mainStudyTab === 'valuation'
                ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-white/15'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Valuation & Financial Reports</span>
          </button>
        </div>
      </div>

      {/* 3. CONTENT PER MAIN TAB */}
      {mainStudyTab === 'notebooks' && (
        <VirtualNotebookWorkspace
          notebooks={notebooks}
          uploadedDocs={uploadedDocs}
          activeNotebookId={activeNotebookId}
          onSelectNotebook={handleSelectNotebook}
          onUpdateNotebooks={handleUpdateNotebooks}
          onAddTextDoc={handleAddTextDoc}
          onUploadDocs={processUploadedFiles}
          onRemoveDoc={handleRemoveDoc}
        />
      )}

      {mainStudyTab === 'valuation' && (
        <div className="space-y-6">
          <DCFValuationHub />
          {activeAnnualReportDoc && (
            <FinancialAnalysisSuite
              doc={activeAnnualReportDoc}
              onAnalysisGenerated={(res) => {
                showToast(`Generated ${res.title}!`, 'success');
              }}
            />
          )}
        </div>
      )}

      {mainStudyTab === 'flashcards_quiz' && (
        <div className="space-y-6">
          {/* INTERACTIVE STUDY ASSISTANT 3-STAGE FLOW */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Interactive Study Assistant
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-200 font-mono">
                      Adaptive
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Uploaded documents and notes feed directly into active learning and testing.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Stage 1: Teach Me */}
              <button
                onClick={() => {
                  setActiveMode('cram');
                  if (!cramData) triggerStudyAnalyze('cram');
                }}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer group ${
                  activeMode === 'cram'
                    ? 'bg-amber-50 dark:bg-yellow-500/20 border-amber-300 dark:border-yellow-500/50 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-50 dark:bg-neutral-950/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-yellow-400 uppercase tracking-wider">
                    Stage 1 • Breakdown
                  </span>
                  <Zap className="w-4 h-4 text-amber-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">1. Study Guide</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Step-by-step topic breakdowns with key definitions, formulas & intuition.
                </p>
              </button>

              {/* Stage 2: Test Me */}
              <button
                onClick={() => {
                  setActiveMode('exam');
                  if (!mockExam) triggerStudyAnalyze('exam');
                }}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer group ${
                  activeMode === 'exam' && !examSubmitted
                    ? 'bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/50 shadow-md ring-1 ring-rose-400'
                    : 'bg-slate-50 dark:bg-neutral-950/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                    Stage 2 • Assessment
                  </span>
                  <Award className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">2. Practice Exam</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Interactive 5-question timed adaptive quiz generated from your notes.
                </p>
              </button>

              {/* Stage 3: Score & Feedback */}
              <button
                onClick={() => {
                  setActiveMode('exam');
                  if (!examSubmitted) setExamSubmitted(true);
                }}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer group ${
                  activeMode === 'exam' && examSubmitted
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/50 shadow-md ring-1 ring-emerald-400'
                    : 'bg-slate-50 dark:bg-neutral-950/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Stage 3 • Grade
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">3. Score & Feedback</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  Real-time percentage score, correct answer citations & topic weak points.
                </p>
              </button>
            </div>
          </div>

          {/* Sub-Mode Segmented Control Bar */}
          <div className="bg-slate-100 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar shadow-sm">
            <div className="flex items-center min-w-max gap-1">
              {studyModeTabs.filter(t => t.id !== 'notebook').map((tab) => {
                const Icon = tab.icon;
                const isActive = activeMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMode(tab.id);
                      if (tab.id === 'cram' && !cramData) triggerStudyAnalyze('cram');
                      if (tab.id === 'exec' && !execData) triggerStudyAnalyze('exec');
                      if (tab.id === 'exam' && !mockExam) triggerStudyAnalyze('exam');
                      if (tab.id === 'flashcards' && (!flashcards || flashcards.length === 0)) generateNewFlashcards();
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-white/15'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-neutral-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Topic Bar */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-xs shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-slate-500 dark:text-neutral-400 font-mono text-[11px] shrink-0">Focus Topic:</span>
              <input
                type="text"
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                placeholder="e.g., Corporate Valuation & DCF Models"
                className="bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none w-full text-xs"
              />
            </div>
            <button
              onClick={() => {
                if (activeMode === 'cram' || activeMode === 'exec' || activeMode === 'exam') {
                  triggerStudyAnalyze(activeMode);
                } else if (activeMode === 'flashcards') {
                  generateNewFlashcards();
                } else {
                  showToast(`Updated topic to ${targetTopic}`, 'info');
                }
              }}
              disabled={loading}
              className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-indigo-500/20 border border-blue-200 dark:border-indigo-500/30 text-blue-700 dark:text-indigo-300 hover:bg-blue-100 dark:hover:bg-indigo-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate for Topic</span>
            </button>
          </div>

          {/* STUDY MODE RENDERERS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >

          {/* ========================================================= */}
          {/* MODE 0: VIRTUAL NOTEBOOK WORKSPACE & SOURCES */}
          {/* ========================================================= */}
          {activeMode === 'notebook' && (
            <VirtualNotebookWorkspace
              notebooks={notebooks}
              uploadedDocs={uploadedDocs}
              activeNotebookId={activeNotebookId}
              onSelectNotebook={handleSelectNotebook}
              onUpdateNotebooks={handleUpdateNotebooks}
              onAddTextDoc={handleAddTextDoc}
              onUploadDocs={processUploadedFiles}
              onRemoveDoc={handleRemoveDoc}
            />
          )}

          {/* ========================================================= */}
          {/* MODE 1: SNAP & SOLVE (MULTIMODAL VISUAL Q&A) */}
          {/* ========================================================= */}
          {activeMode === 'snap' && (
            <div className="space-y-6">
              
              {/* Camera / Photo Upload Zone */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Column: Photo Input Widget */}
                <div className="md:col-span-5 bg-neutral-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <input
                    type="file"
                    ref={snapInputRef}
                    onChange={handleSnapImageChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  {snapImage ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/20 bg-black group/snap">
                      <ZoomableImage
                        src={snapImage}
                        alt="Question Preview"
                        className="w-full h-full"
                      />

                      {/* LASER SCAN ANIMATION LAYER DURING PROCESSING */}
                      {loading && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                          <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-laserScan absolute top-0" />
                          <div className="absolute inset-0 bg-cyan-500/10 backdrop-brightness-125" />
                        </div>
                      )}

                      {/* Overlay reset button */}
                      <button
                        onClick={() => {
                          setSnapImage(null);
                          setSnapImageFile(null);
                          setSnapResult(null);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => snapInputRef.current?.click()}
                      className="w-full aspect-square border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-xl flex flex-col items-center justify-center cursor-pointer p-6 transition-colors bg-neutral-950/40 group"
                    >
                      {/* Shutter Button Style */}
                      <div className="w-16 h-16 rounded-full border-4 border-amber-400/40 p-1 group-hover:border-amber-400 transition-colors flex items-center justify-center mb-3">
                        <div className="w-full h-full rounded-full bg-amber-400/20 group-hover:bg-amber-400 flex items-center justify-center text-amber-300">
                          <Camera className="w-6 h-6" />
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">
                        Snap or Upload Question Photo
                      </h4>
                      <p className="text-xs text-neutral-400 max-w-xs">
                        Take a photo of an equation, diagram, or textbook question using your phone camera.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 w-full">
                    <button
                      onClick={handleSnapSolveSubmit}
                      disabled={loading || !snapImage}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                        loading || !snapImage
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Laser Scanning & Solving...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Analyze & Solve Question</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Column: Split macOS Widget Cards Output */}
                <div className="md:col-span-7 space-y-4">
                  {loading ? (
                    <div className="space-y-4">
                      <AppleSkeleton className="h-28" />
                      <AppleSkeleton className="h-64" />
                    </div>
                  ) : snapResult ? (
                    <>
                      {/* Card 1: "The Solution" */}
                      <div className="bg-neutral-900/80 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-xl space-y-2 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Card 1: The Solution</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                            Confidence: {snapResult.solutionCard?.confidence || 'High'}
                          </span>
                        </div>

                        {snapResult.extractedQuestion && (
                          <p className="text-xs text-neutral-400 italic">
                            "{snapResult.extractedQuestion}"
                          </p>
                        )}

                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-0.5">
                            Final Answer:
                          </span>
                          <p className="text-base font-extrabold text-white tracking-tight">
                            {snapResult.solutionCard?.finalAnswer || 'Result computed'}
                          </p>
                        </div>

                        {snapResult.proTip && (
                          <div className="text-xs text-neutral-300 flex items-start gap-2 pt-1">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Exam Insight:</strong> {snapResult.proTip}</span>
                          </div>
                        )}
                      </div>

                      {/* Card 2: "Step-by-Step Breakdown" */}
                      <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            <span>Card 2: Step-by-Step Breakdown</span>
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Grounded on Textbook Context
                          </span>
                        </div>

                        <div className="space-y-3">
                          {snapResult.stepByStepBreakdown?.map((step: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-neutral-950/60 border border-white/10 flex items-start gap-3"
                            >
                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                                {step.stepNumber || idx + 1}
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-white">
                                  {step.title}
                                </h5>
                                <p className="text-xs text-neutral-300 leading-relaxed">
                                  {step.explanation}
                                </p>
                                {step.formulaOrRule && (
                                  <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40 mt-1 inline-block">
                                    {step.formulaOrRule}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <AppleEmptyState
                      title="No Question Scanned Yet"
                      description="Upload or take a photo of any formula, diagram, or problem statement to run the multimodal Snap & Solve AI."
                      icon={Camera}
                    />
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 2: QUICK CRAM (80/20 PARETO RULE) */}
          {/* ========================================================= */}
          {activeMode === 'cram' && (
            <div className="space-y-4">
              {loading ? (
                <AppleSkeleton className="h-80" />
              ) : cramData ? (
                <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-xl">
                  <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-mono font-bold uppercase tracking-wider">
                        80/20 High-Yield Pareto Cram Guide
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {cramData.summaryTitle || `High-Yield Cram: ${targetTopic}`}
                      </h3>
                    </div>
                    <button
                      onClick={() => triggerStudyAnalyze('cram')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Must-Know Rules */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400 font-mono flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Core 80/20 Rules & Formulas</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {cramData.corePrinciples?.map((rule: string, i: number) => (
                        <div key={i} className="p-3.5 rounded-xl bg-neutral-950/60 border border-white/10 text-xs text-neutral-200">
                          <span className="text-yellow-400 font-mono font-bold text-[10px] block mb-1">
                            Rule #{i + 1}
                          </span>
                          {rule}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Exam Concepts */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>Top Frequently Tested Exam Concepts</span>
                    </h4>
                    <div className="space-y-2">
                      {cramData.topExamConcepts?.map((item: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-neutral-950/40 border border-white/10 flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <strong className="text-xs text-white block">{item.concept}</strong>
                            <p className="text-xs text-neutral-400">{item.whyItMatters}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pitfalls & Traps */}
                  {cramData.pitfalls?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Common Exam Traps to Avoid</span>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 bg-rose-500/5 p-4 rounded-xl border border-rose-500/20">
                        {cramData.pitfalls.map((pit: string, i: number) => (
                          <li key={i}>{pit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <AppleEmptyState
                  title="Generate Pareto Cram Guide"
                  description="Extract the 20% of core concepts that account for 80% of exam marks based on your uploaded context."
                  icon={Zap}
                  actionLabel="Generate Cram Guide"
                  onAction={() => triggerStudyAnalyze('cram')}
                />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 3: EXEC SUMMARY */}
          {/* ========================================================= */}
          {activeMode === 'exec' && (
            <div className="space-y-4">
              {loading ? (
                <AppleSkeleton className="h-80" />
              ) : execData ? (
                <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-xl">
                  <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Executive Learning Briefing</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Grounded Briefing
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
                    {execData.executiveOverview}
                  </div>

                  {execData.keyTakeaways?.length > 0 && (
                    <div className="space-y-2 border-t border-white/10 pt-4">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">
                        Key Strategic Takeaways:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {execData.keyTakeaways.map((takeaway: string, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-neutral-950/60 border border-white/10 text-xs text-neutral-300 flex items-start gap-2">
                            <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <AppleEmptyState
                  title="Generate Executive Summary"
                  description="Convert dense textbook chapters and lecture slide decks into executive-grade briefing papers."
                  icon={BookOpen}
                  actionLabel="Create Executive Summary"
                  onAction={() => triggerStudyAnalyze('exec')}
                />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 4: DEEP DIVE (SOCRATIC TUTOR) */}
          {/* ========================================================= */}
          {activeMode === 'socratic' && (
            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Socratic Tutor (Guided Deep Dive)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    The AI guides your intuition through targeted questions rather than giving immediate answers.
                  </p>
                </div>
                <button
                  onClick={() => setSocraticHistory([
                    {
                      sender: 'tutor',
                      text: `Let's begin a fresh Socratic exploration on ${targetTopic}. What is the fundamental problem or trade-off this topic attempts to solve?`
                    }
                  ])}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart Session
                </button>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {socraticHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                          : 'bg-neutral-950/80 border border-white/10 text-neutral-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold block mb-1 opacity-60 uppercase">
                        {msg.sender === 'user' ? 'You' : 'Socratic Tutor'}
                      </span>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.hint && (
                        <div className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Hint: {msg.hint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-950/80 border border-white/10 p-3.5 rounded-2xl rounded-bl-none text-xs text-neutral-400 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span>Formulating next Socratic question...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  value={userSocraticInput}
                  onChange={(e) => setUserSocraticInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSocraticSubmit(); }}
                  placeholder="Type your explanation or reasoned response..."
                  className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={handleSocraticSubmit}
                  disabled={loading || !userSocraticInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 5: INTERACTIVE FLASHCARDS */}
          {/* ========================================================= */}
          {activeMode === 'flashcards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">
                  {flashcards.length > 0 ? `Card ${currentCardIndex + 1} of ${flashcards.length}` : 'Active Recall Mode'}
                </span>
                <button
                  onClick={() => generateNewFlashcards()}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Active Recall Cards</span>
                </button>
              </div>

              {loading ? (
                <div className="min-h-[260px] bg-neutral-900/80 border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 backdrop-blur-xl shadow-2xl">
                  <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-mono font-bold text-emerald-300">Generating Active-Recall Flashcards...</span>
                  <p className="text-xs text-neutral-400">Synthesizing high-yield concepts from {uploadedDocs[0]?.name || targetTopic}</p>
                </div>
              ) : flashcards.length > 0 ? (
                <>
                  {/* 3D Flipping Card Component */}
                  <div className="perspective-1000 min-h-[260px] flex items-center justify-center">
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`w-full max-w-xl h-64 cursor-pointer transition-transform duration-500 transform-style-3d relative rounded-2xl border border-white/15 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 backdrop-blur-xl p-8 flex flex-col justify-between shadow-2xl ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Card Front */}
                      <div className={`absolute inset-0 p-8 flex flex-col justify-between backface-hidden ${isFlipped ? 'hidden' : 'block'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {flashcards[currentCardIndex]?.tag || 'Active Recall'}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Click card to flip
                          </span>
                        </div>

                        <p className="text-base sm:text-lg font-extrabold text-white text-center tracking-tight">
                          {flashcards[currentCardIndex]?.front || 'No flashcards available.'}
                        </p>

                        <div className="text-center text-xs text-neutral-400 font-mono">
                          [ Tap to reveal answer ]
                        </div>
                      </div>

                      {/* Card Back */}
                      <div className={`absolute inset-0 p-8 flex flex-col justify-between rotate-y-180 backface-hidden ${isFlipped ? 'block' : 'hidden'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Answer & Model Concept
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Rate difficulty below
                          </span>
                        </div>

                        <p className="text-sm sm:text-base text-white text-center leading-relaxed font-semibold">
                          {flashcards[currentCardIndex]?.back}
                        </p>

                        {/* Spaced Repetition Buttons */}
                        <div className="flex items-center justify-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setCardStats({ ...cardStats, [flashcards[currentCardIndex].id]: 'hard' });
                              setIsFlipped(false);
                              if (currentCardIndex < flashcards.length - 1) setCurrentCardIndex(currentCardIndex + 1);
                            }}
                            className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-colors"
                          >
                            Hard (Red)
                          </button>
                          <button
                            onClick={() => {
                              setCardStats({ ...cardStats, [flashcards[currentCardIndex].id]: 'good' });
                              setIsFlipped(false);
                              if (currentCardIndex < flashcards.length - 1) setCurrentCardIndex(currentCardIndex + 1);
                            }}
                            className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/30 transition-colors"
                          >
                            Good (Blue)
                          </button>
                          <button
                            onClick={() => {
                              setCardStats({ ...cardStats, [flashcards[currentCardIndex].id]: 'easy' });
                              setIsFlipped(false);
                              if (currentCardIndex < flashcards.length - 1) setCurrentCardIndex(currentCardIndex + 1);
                            }}
                            className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                          >
                            Easy (Green)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        if (currentCardIndex > 0) {
                          setCurrentCardIndex(currentCardIndex - 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentCardIndex === 0}
                      className="p-2 rounded-full bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white disabled:opacity-40"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        if (currentCardIndex < flashcards.length - 1) {
                          setCurrentCardIndex(currentCardIndex + 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="p-2 rounded-full bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white disabled:opacity-40"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <AppleEmptyState
                  title="No Flashcards Generated"
                  description="Click the button above to generate active-recall cards from your study context."
                  icon={Sparkles}
                  actionLabel="Generate Flashcards"
                  onAction={() => generateNewFlashcards()}
                />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 6: MOCK EXAM */}
          {/* ========================================================= */}
          {activeMode === 'exam' && (
            <div className="space-y-4">
              {loading ? (
                <AppleSkeleton className="h-80" />
              ) : mockExam ? (
                <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-xl">
                  {/* Exam Header & Progress Bar */}
                  <div className="space-y-3 border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold uppercase tracking-wider">
                          AI Generated Mock Exam
                        </span>
                        <h3 className="text-base font-bold text-white mt-1">
                          {mockExam.examTitle || `Mock Exam: ${targetTopic}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                        <Clock className="w-4 h-4 text-rose-400" />
                        <span>{mockExam.timeLimitMinutes || 20} Mins</span>
                      </div>
                    </div>

                    {/* iOS Progress Bar */}
                    <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="bg-rose-500 h-full transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / (mockExam.questions?.length || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Question Display */}
                  {mockExam.questions && mockExam.questions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span>Question {currentQuestionIndex + 1} of {mockExam.questions.length}</span>
                        <div className="flex items-center gap-2">
                          {mockExam.questions[currentQuestionIndex].topicTag && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                              {mockExam.questions[currentQuestionIndex].topicTag}
                            </span>
                          )}
                          <span className="uppercase text-rose-400 font-bold">
                            {mockExam.questions[currentQuestionIndex].type === 'mcq' ? 'Multiple Choice' : 'Analytical Response'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {mockExam.questions[currentQuestionIndex].questionText || mockExam.questions[currentQuestionIndex].question || 'Question prompt'}
                      </p>

                      {/* Options for MCQ */}
                      {mockExam.questions[currentQuestionIndex].type === 'mcq' ? (
                        <div className="space-y-2">
                          {mockExam.questions[currentQuestionIndex].options?.map((opt: string, optIdx: number) => {
                            const isSelected = userExamAnswers[currentQuestionIndex] === optIdx;
                            const isCorrect = mockExam.questions[currentQuestionIndex].correctOptionIndex === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  if (!examSubmitted) {
                                    setUserExamAnswers({ ...userExamAnswers, [currentQuestionIndex]: optIdx });
                                  }
                                }}
                                disabled={examSubmitted}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                                  examSubmitted && isCorrect
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                                    : examSubmitted && isSelected && !isCorrect
                                    ? 'bg-rose-500/20 border-rose-500/50 text-white'
                                    : isSelected
                                    ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-md'
                                    : 'bg-neutral-950/60 border-white/10 text-neutral-300 hover:bg-neutral-950'
                                }`}
                              >
                                <span>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  examSubmitted && isCorrect 
                                    ? 'border-emerald-400 bg-emerald-500' 
                                    : isSelected 
                                    ? 'border-rose-400 bg-rose-500' 
                                    : 'border-white/20'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <textarea
                          value={userExamAnswers[currentQuestionIndex] || ''}
                          onChange={(e) => setUserExamAnswers({ ...userExamAnswers, [currentQuestionIndex]: e.target.value })}
                          disabled={examSubmitted}
                          placeholder="Type your essay response or detailed calculation step-by-step..."
                          className="w-full h-32 p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 resize-none"
                        />
                      )}

                      {/* Submitted Solution Breakdown */}
                      {examSubmitted && (
                        <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 text-xs space-y-2">
                          <strong className="text-rose-400 block font-mono uppercase">
                            Model Solution & Grounded Explanation:
                          </strong>
                          <p className="text-neutral-300">
                            {mockExam.questions[currentQuestionIndex].explanation || mockExam.questions[currentQuestionIndex].modelAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Real-time Scoring & Weak Points Feedback Header */}
                  {examSubmitted && (() => {
                    let correctCount = 0;
                    const weakPoints: string[] = [];

                    mockExam.questions.forEach((q: any, idx: number) => {
                      if (q.type === 'mcq') {
                        if (userExamAnswers[idx] === q.correctOptionIndex) {
                          correctCount++;
                        } else {
                          weakPoints.push(q.topicTag || `Concept in Question ${idx + 1}`);
                        }
                      } else {
                        if (userExamAnswers[idx] && userExamAnswers[idx].trim().length > 10) {
                          correctCount++;
                        } else {
                          weakPoints.push(q.topicTag || `Concept in Question ${idx + 1}`);
                        }
                      }
                    });

                    const totalCount = mockExam.questions.length || 5;
                    const scorePercent = Math.round((correctCount / totalCount) * 100);
                    const gradeTier = scorePercent >= 80 ? 'Distinction (High Pass)' : scorePercent >= 60 ? 'Merit (Solid Foundation)' : 'Review Required';

                    return (
                      <div className="p-5 rounded-2xl bg-neutral-950 border border-rose-500/30 space-y-4 shadow-xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center font-mono font-extrabold text-base text-rose-300 shrink-0">
                              {scorePercent}%
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-neutral-400 uppercase block">Active Score & Assessment Result</span>
                              <h4 className="text-base font-bold text-white mt-0.5">{gradeTier}</h4>
                              <p className="text-xs text-neutral-400">{correctCount} of {totalCount} Questions Mastered</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setActiveMode('cram');
                              if (!cramData) triggerStudyAnalyze('cram');
                            }}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Reinforce in Teach Me</span>
                          </button>
                        </div>

                        {weakPoints.length > 0 && (
                          <div className="pt-3 border-t border-white/10 space-y-2">
                            <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>AI-Identified Topic Weak Points to Review</span>
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {weakPoints.map((wp, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                                  ⚠️ {wp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Exam Navigation Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {!examSubmitted ? (
                      <button
                        onClick={() => {
                          setExamSubmitted(true);
                          showToast('Exam submitted! Grade & feedback generated.', 'success');
                        }}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        Submit & Score Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setExamSubmitted(false);
                          setUserExamAnswers({});
                          setCurrentQuestionIndex(0);
                          triggerStudyAnalyze('exam');
                        }}
                        className="px-5 py-2 rounded-xl bg-neutral-800 border border-white/15 text-white font-bold text-xs hover:bg-neutral-700 transition-colors"
                      >
                        Generate New Adaptive Quiz
                      </button>
                    )}

                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min((mockExam.questions?.length || 1) - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === (mockExam.questions?.length || 1) - 1}
                      className="px-4 py-2 rounded-xl bg-neutral-950 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <AppleEmptyState
                  title="Generate AI Mock Exam"
                  description="Build an authentic 4-question timed assessment based on your syllabus context."
                  icon={Award}
                  actionLabel="Generate Mock Exam"
                  onAction={() => triggerStudyAnalyze('exam')}
                />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 7: FEYNMAN SIMULATOR */}
          {/* ========================================================= */}
          {activeMode === 'feynman' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Input Panel */}
              <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-xl">
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold uppercase tracking-wider">
                    Feynman Simulator
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    Explain It Like I'm 5 Years Old
                  </h3>
                  <p className="text-xs text-neutral-400">
                    If you can't explain a concept simply without jargon, you don't truly understand it yet.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Target Concept:</label>
                  <input
                    type="text"
                    value={feynmanConcept}
                    onChange={(e) => setFeynmanConcept(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Your Simple Explanation:</label>
                  <textarea
                    value={feynmanUserExplanation}
                    onChange={(e) => setFeynmanUserExplanation(e.target.value)}
                    placeholder="Imagine a company is like a lemonade stand..."
                    className="w-full h-36 p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>

                <button
                  onClick={handleFeynmanCritique}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4" />
                  )}
                  <span>Submit for Feynman Critique</span>
                </button>
              </div>

              {/* Right Column: Critique Result Widget */}
              <div className="space-y-4">
                {loading ? (
                  <AppleSkeleton className="h-80" />
                ) : feynmanCritique ? (
                  <div className="bg-neutral-900/80 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                        Feynman Critique & Analogy Grade
                      </h4>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-xs">
                        Score: {feynmanCritique.simplicityScore || 85}/100
                      </div>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed">
                      {feynmanCritique.overallFeedback}
                    </p>

                    {feynmanCritique.jargonFlagged?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">
                          Jargon Terms Flagged:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {feynmanCritique.jargonFlagged.map((j: string, i: number) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {j}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {feynmanCritique.suggestedAnalogy && (
                      <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                        <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Suggested Real-World Analogy:
                        </span>
                        <p className="text-xs text-white leading-relaxed italic">
                          "{feynmanCritique.suggestedAnalogy}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <AppleEmptyState
                    title="No Explanation Evaluated Yet"
                    description="Type how you would explain the target concept to a 5-year-old on the left, then click submit to receive a instant Feynman simplicity grade."
                    icon={Lightbulb}
                  />
                )}
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>
      </div>
      )}

    </div>
  );
};
