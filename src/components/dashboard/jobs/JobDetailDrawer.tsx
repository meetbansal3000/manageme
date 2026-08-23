// Component: Slide-Over Job Application Detail Drawer with AI Interview Prep Copilot & Tailor Suite

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Building2, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Award, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Share2, 
  Edit2, 
  Trash2, 
  Save, 
  User, 
  Link as LinkIcon,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  MessageSquare,
  RefreshCw,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { GraduateScheme, TrackerStatus } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { CalendarExportButton } from './CalendarExportButton';
import { TailorModal } from './TailorModal';
import { toast } from '../../ui/Toast';

export interface JobDetailDrawerProps {
  job: GraduateScheme | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateJob?: (id: string, updated: Partial<GraduateScheme>) => void;
  onDeleteJob?: (id: string) => void;
}

interface TechnicalQuestion {
  id?: string;
  topic: string;
  question: string;
  keyTalkingPoints: string[];
}

interface BehavioralQuestion {
  id?: string;
  competency: string;
  question: string;
  starGuidance: string;
}

interface AnswerReviewFeedback {
  score: number;
  clarityVerdict: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

interface StoredPrepData {
  technicalQuestions: TechnicalQuestion[];
  behavioralQuestions: BehavioralQuestion[];
  userAnswers: Record<string, string>;
  reviews: Record<string, AnswerReviewFeedback>;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onUpdateJob,
  onDeleteJob
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'prep' | 'notes'>('overview');
  const [notesText, setNotesText] = useState(job?.notes || '');
  const [recruiterContact, setRecruiterContact] = useState(job?.applyVia || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isTailorOpen, setIsTailorOpen] = useState(false);

  // Interview Prep State
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'tech-0': true,
    'behav-0': true
  });
  const [prepData, setPrepData] = useState<StoredPrepData>({
    technicalQuestions: [],
    behavioralQuestions: [],
    userAnswers: {},
    reviews: {}
  });
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useScrollLock(isOpen);

  // Sync state on job change
  useEffect(() => {
    if (job) {
      setNotesText(job.notes || '');
      setRecruiterContact(job.applyVia || '');
      setIsSaved(false);

      // Load persisted interview prep data
      const cacheKey = `manageme_interview_prep_${job.id}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          setPrepData(JSON.parse(saved));
        } catch {
          // ignore error
        }
      } else {
        setPrepData({
          technicalQuestions: [],
          behavioralQuestions: [],
          userAnswers: {},
          reviews: {}
        });
      }
    }
  }, [job]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isTailorOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTailorOpen, onClose]);

  if (!isOpen || !job) return null;

  const handleStatusChange = (newStatus: TrackerStatus) => {
    if (onUpdateJob) {
      onUpdateJob(job.id, { status: newStatus });
    }
  };

  const handleSaveNotes = () => {
    if (onUpdateJob) {
      onUpdateJob(job.id, { notes: notesText });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  // Generate Interview Questions
  const handleGenerateQuestions = async () => {
    if (!job) return;
    setIsGeneratingPrep(true);

    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          jobTitle: job.roleTitle,
          company: job.firm,
          sector: job.sector,
          jobDescription: job.description || job.notes || `${job.firm} ${job.roleTitle}`
        })
      });

      if (!res.ok) throw new Error('Failed to generate interview questions.');

      const data = await res.json();
      const updated: StoredPrepData = {
        ...prepData,
        technicalQuestions: data.technicalQuestions || [],
        behavioralQuestions: data.behavioralQuestions || []
      };

      setPrepData(updated);
      localStorage.setItem(`manageme_interview_prep_${job.id}`, JSON.stringify(updated));
      toast.success(`Generated interview prep questions for ${job.firm}!`);
    } catch (err: any) {
      console.error('[Interview Prep Drawer Error]:', err);
      toast.error('Could not generate questions: check API connection');
    } finally {
      setIsGeneratingPrep(false);
    }
  };

  // Review user answer
  const handleReviewAnswer = async (qKey: string, questionText: string) => {
    const userAnswer = prepData.userAnswers[qKey];
    if (!userAnswer || !userAnswer.trim()) {
      toast.info('Please draft an answer before requesting an AI review.');
      return;
    }

    setReviewingId(qKey);

    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'review',
          jobTitle: job.roleTitle,
          company: job.firm,
          sector: job.sector,
          question: questionText,
          answer: userAnswer
        })
      });

      if (!res.ok) throw new Error('Failed to review answer.');

      const feedback: AnswerReviewFeedback = await res.json();
      const updated: StoredPrepData = {
        ...prepData,
        reviews: {
          ...prepData.reviews,
          [qKey]: feedback
        }
      };

      setPrepData(updated);
      localStorage.setItem(`manageme_interview_prep_${job.id}`, JSON.stringify(updated));
      toast.success(`Answer graded! Score: ${feedback.score}/100`);
    } catch (err: any) {
      console.error('[Review Answer Error]:', err);
      toast.error('Review failed: check connection');
    } finally {
      setReviewingId(null);
    }
  };

  const handleAnswerChange = (qKey: string, text: string) => {
    const updated: StoredPrepData = {
      ...prepData,
      userAnswers: {
        ...prepData.userAnswers,
        [qKey]: text
      }
    };
    setPrepData(updated);
    localStorage.setItem(`manageme_interview_prep_${job.id}`, JSON.stringify(updated));
  };

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const statusOptions: TrackerStatus[] = [
    'Not Applied',
    'To Apply',
    'Applied',
    'Online Tests',
    'Assessment',
    'Assessment Centre',
    'Video Interview',
    'Interview',
    'Final Interview',
    'Offer 🎉',
    'Rejected ✕'
  ];

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[90] flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#0D0B18] border-l border-white/10 shadow-2xl h-full flex flex-col z-10 text-white overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052FF]/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-[#0052FF] shrink-0 font-mono font-bold text-lg">
                    {job.firm.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                      {job.firm}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 truncate">{job.roleTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status & Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">STAGE:</span>
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(e.target.value as TrackerStatus)}
                    className="bg-white/10 text-white border border-white/15 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#0052FF] cursor-pointer"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0D0B18] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {/* Tailor Application Modal Trigger */}
                  <button
                    onClick={() => setIsTailorOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    title="Tailor Cover Letter & CV Bullets"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tailor App</span>
                  </button>

                  {/* Add to Calendar Component */}
                  <CalendarExportButton
                    title={`[Deadline] ${job.firm} - ${job.roleTitle}`}
                    date={job.appCloses}
                    company={job.firm}
                    role={job.roleTitle}
                    portalUrl={job.applyVia}
                    notes={job.notes}
                    variant="compact"
                  />

                  {job.applyVia && (
                    <a
                      href={job.applyVia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0052FF] hover:bg-[#0045D8] text-white rounded-lg text-xs font-medium transition-colors"
                      title="Open Application Portal"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* 3 Tabs Navigation Bar */}
              <div className="flex gap-2 mt-5 border-t border-white/10 pt-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overview & Specs
                </button>

                <button
                  onClick={() => setActiveTab('prep')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'prep'
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interview Prep</span>
                  {prepData.technicalQuestions.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'notes'
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Notes & Recruiter
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" /> Base Salary
                      </span>
                      <p className="text-base font-bold text-white mt-1">{job.salary || 'Competitive'}</p>
                      {job.bonus && (
                        <p className="text-[11px] font-mono text-emerald-400 mt-0.5">+ {job.bonus} Bonus</p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" /> Application Closes
                      </span>
                      <p className="text-base font-bold text-white mt-1">{job.appCloses || 'Rolling'}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">Opens: {job.appOpens || 'Open'}</p>
                    </div>
                  </div>

                  {/* Classification Details */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Scheme Specifications
                    </h4>

                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <span className="text-slate-400">Industry Sector:</span>
                      <span className="text-white font-medium text-right">{job.sector}</span>

                      <span className="text-slate-400">Difficulty Rating:</span>
                      <span className="text-white font-medium text-right">{job.difficulty || 'Medium'}</span>

                      <span className="text-slate-400">ACCA Advantage:</span>
                      <span className="text-emerald-400 font-mono text-right">{job.accaAdvantage || 'High'}</span>

                      <span className="text-slate-400">Filter Risk:</span>
                      <span className="text-amber-400 font-mono text-right">{job.filterRisk || 'Medium'}</span>
                    </div>
                  </div>

                  {/* Visa & Sponsorship Notes */}
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Award className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-purple-300 uppercase font-mono">
                        Visa & Sponsorship Eligibility
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Tier-2 / Skilled Worker Visa sponsorship eligible for UK graduate intake. Meets the new Home Office minimum salary threshold.
                    </p>
                  </div>

                  {/* Skills Tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Target Competencies
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AI INTERVIEW PREP COPILOT */}
              {activeTab === 'prep' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Action Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-purple-200 uppercase font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" /> AI Interview Prep Copilot
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Tailored technical questions, STAR guidance & instant answer grading.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateQuestions}
                      disabled={isGeneratingPrep}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPrep ? 'animate-spin' : ''}`} />
                      <span>{prepData.technicalQuestions.length > 0 ? 'Regenerate' : 'Generate Qs'}</span>
                    </button>
                  </div>

                  {isGeneratingPrep ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-medium text-slate-300">Extracting interview questions for {job.firm}...</p>
                    </div>
                  ) : prepData.technicalQuestions.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] space-y-3">
                      <Brain className="w-8 h-8 text-purple-400 mx-auto" />
                      <p className="text-xs text-slate-300">No interview questions generated yet for this application.</p>
                      <button
                        onClick={handleGenerateQuestions}
                        className="px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-xs font-semibold text-white transition-colors"
                      >
                        Generate Interview Question Set
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Technical Questions Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>Role Technical Questions (3)</span>
                        </div>

                        {prepData.technicalQuestions.map((q, idx) => {
                          const qKey = `tech-${idx}`;
                          const isExpanded = expandedCards[qKey] ?? true;
                          const userAnswer = prepData.userAnswers[qKey] || '';
                          const review = prepData.reviews[qKey];
                          const isReviewing = reviewingId === qKey;

                          return (
                            <div 
                              key={idx}
                              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                            >
                              <button
                                onClick={() => toggleCard(qKey)}
                                className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                                      {q.topic || `Q${idx + 1}`}
                                    </span>
                                    {review && (
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                                        Score: {review.score}/100
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm font-semibold text-white">
                                    {q.question}
                                  </p>
                                </div>
                                <div className="text-slate-400 shrink-0 mt-1">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="p-3.5 pt-0 space-y-3 border-t border-white/5 bg-black/20">
                                  {/* Key Talking Points */}
                                  <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 space-y-1.5">
                                    <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold">
                                      Key Talking Points to Hit:
                                    </span>
                                    <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside font-sans">
                                      {q.keyTalkingPoints.map((pt, pIdx) => (
                                        <li key={pIdx} className="leading-relaxed">{pt}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Practice Answer Area */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[11px] font-mono text-slate-400">
                                        Draft Your Answer:
                                      </label>
                                      <span className="text-[10px] font-mono text-slate-500">
                                        {userAnswer.split(/\s+/).filter(Boolean).length} words
                                      </span>
                                    </div>
                                    <textarea
                                      rows={3}
                                      value={userAnswer}
                                      onChange={(e) => handleAnswerChange(qKey, e.target.value)}
                                      placeholder="Practice your structured technical response here..."
                                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] font-sans resize-none"
                                    />
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => handleReviewAnswer(qKey, q.question)}
                                        disabled={isReviewing || !userAnswer.trim()}
                                        className="px-3 py-1.5 rounded-lg bg-[#0052FF] hover:bg-blue-600 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                                      >
                                        <Sparkles className={`w-3 h-3 ${isReviewing ? 'animate-spin' : ''}`} />
                                        <span>{isReviewing ? 'Grading...' : 'Review My Answer'}</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Feedback Display */}
                                  {review && (
                                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-emerald-400 font-mono">
                                          AI Grade: {review.score}/100
                                        </span>
                                        <span className="text-[11px] text-slate-400 italic">
                                          {review.clarityVerdict}
                                        </span>
                                      </div>

                                      {/* Strengths */}
                                      <div className="space-y-1">
                                        <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">Strengths:</span>
                                        {review.strengths.map((s, si) => (
                                          <div key={si} className="flex items-start gap-1.5 text-slate-300">
                                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{s}</span>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Missing Keywords */}
                                      {review.missingKeywords?.length > 0 && (
                                        <div className="pt-1">
                                          <span className="text-[10px] font-mono text-amber-300 uppercase font-bold block mb-1">
                                            Missing Technical Keywords:
                                          </span>
                                          <div className="flex flex-wrap gap-1">
                                            {review.missingKeywords.map((kw, ki) => (
                                              <span key={ki} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono">
                                                {kw}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Behavioral Questions Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                          <span>Behavioral & Competency Questions (2)</span>
                        </div>

                        {prepData.behavioralQuestions.map((q, idx) => {
                          const qKey = `behav-${idx}`;
                          const isExpanded = expandedCards[qKey] ?? true;
                          const userAnswer = prepData.userAnswers[qKey] || '';
                          const review = prepData.reviews[qKey];
                          const isReviewing = reviewingId === qKey;

                          return (
                            <div 
                              key={idx}
                              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                            >
                              <button
                                onClick={() => toggleCard(qKey)}
                                className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                                      {q.competency || `Competency ${idx + 1}`}
                                    </span>
                                    {review && (
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                                        Score: {review.score}/100
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm font-semibold text-white">
                                    {q.question}
                                  </p>
                                </div>
                                <div className="text-slate-400 shrink-0 mt-1">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="p-3.5 pt-0 space-y-3 border-t border-white/5 bg-black/20">
                                  {/* STAR Guidance */}
                                  <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 space-y-1">
                                    <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold">
                                      STAR Method Guidance:
                                    </span>
                                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                      {q.starGuidance}
                                    </p>
                                  </div>

                                  {/* Practice Answer Area */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[11px] font-mono text-slate-400">
                                        Draft Your STAR Response:
                                      </label>
                                      <span className="text-[10px] font-mono text-slate-500">
                                        {userAnswer.split(/\s+/).filter(Boolean).length} words
                                      </span>
                                    </div>
                                    <textarea
                                      rows={3}
                                      value={userAnswer}
                                      onChange={(e) => handleAnswerChange(qKey, e.target.value)}
                                      placeholder="Situation, Task, Action, and measurable Result..."
                                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans resize-none"
                                    />
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => handleReviewAnswer(qKey, q.question)}
                                        disabled={isReviewing || !userAnswer.trim()}
                                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                                      >
                                        <Sparkles className={`w-3 h-3 ${isReviewing ? 'animate-spin' : ''}`} />
                                        <span>{isReviewing ? 'Grading...' : 'Review My Answer'}</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Feedback Display */}
                                  {review && (
                                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-emerald-400 font-mono">
                                          AI Grade: {review.score}/100
                                        </span>
                                        <span className="text-[11px] text-slate-400 italic">
                                          {review.clarityVerdict}
                                        </span>
                                      </div>

                                      <div className="space-y-1">
                                        <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">Strengths:</span>
                                        {review.strengths.map((s, si) => (
                                          <div key={si} className="flex items-start gap-1.5 text-slate-300">
                                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{s}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NOTES & RECRUITER */}
              {activeTab === 'notes' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Notes Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                        Application Notes & Interview Observations
                      </label>
                      {isSaved && (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={8}
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Log technical questions, interview feedback, partner names, commercial awareness bullet points..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] font-sans leading-relaxed resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveNotes}
                        leftIcon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Notes
                      </Button>
                    </div>
                  </div>

                  {/* Recruiter Contact Information */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Recruiter & Point of Contact
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Application Portal:</span>
                        <span className="text-blue-400 truncate max-w-[240px]">
                          {job.applyVia || 'Direct Company Portal'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Date Applied:</span>
                        <span className="text-slate-300 font-mono">
                          {job.dateApplied || 'Not yet submitted'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
              {onDeleteJob && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Remove ${job.firm} application from your pipeline?`)) {
                      onDeleteJob(job.id);
                      onClose();
                    }
                  }}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="ml-auto"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Tailor Application Modal */}
      {isTailorOpen && (
        <TailorModal
          isOpen={isTailorOpen}
          onClose={() => setIsTailorOpen(false)}
          job={job}
        />
      )}
    </>
  );
};

export default JobDetailDrawer;
