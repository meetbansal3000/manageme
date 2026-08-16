import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Plane, 
  Building, 
  FileText, 
  ArrowRight, 
  X, 
  Bike, 
  Sparkles, 
  Loader2, 
  FileSpreadsheet,
  GraduationCap,
  LineChart,
  Target,
  CheckSquare,
  Zap,
  Calendar,
  Layers,
  TrendingUp,
  BookOpen,
  Timer,
  Share2
} from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { AppTab } from './Header';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { useScrollLock } from '../hooks/useScrollLock';
import { tflApi } from '../services/tflApi';
import { isAnnualReportFetchCommand, fetchAnnualReport, saveAndGroundAnnualReport } from '../utils/annualReportPipeline';
import { ImportProgressBar } from './ImportProgressBar';
import { getExamDeadlines, calculateDaysRemaining } from '../utils/deadlines';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userData: UserTrackerData;
  setActiveTab: (tab: AppTab) => void;
  updateData?: (data: any) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'Navigation' | 'Document' | 'Model' | 'Deadline' | 'Job' | 'Finance' | 'Travel' | 'Skill' | 'Task' | 'Transit' | 'Action';
  icon: React.ReactNode;
  tab: AppTab;
  score: number;
  isAction?: boolean;
  actionHandler?: () => void;
}

const PRIMARY_WORKSPACE_TABS: { id: AppTab; title: string; subtitle: string; icon: React.ReactNode }[] = [
  { id: 'landing', title: 'Home Overview & Landing', subtitle: 'Workspace Dashboard • Spatial OS', icon: <Sparkles className="w-4 h-4 text-blue-500" /> },
  { id: 'news', title: 'Financial News & Intelligence', subtitle: 'Global Financial Markets • Live Feed', icon: <FileText className="w-4 h-4 text-emerald-500" /> },
  { id: 'study', title: 'Study & Intelligence Engine', subtitle: 'Virtual Notebooks, PDF RAG & Flashcards', icon: <GraduationCap className="w-4 h-4 text-indigo-500" /> },
  { id: 'trading', title: 'manageme Markets & Terminal', subtitle: 'Paper Trading Sandbox & Portfolio Analytics', icon: <LineChart className="w-4 h-4 text-emerald-500" /> },
  { id: 'finance', title: 'Student Financial Ledger', subtitle: 'Budgeting, Multi-Currency & Expenses', icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
  { id: 'uni', title: 'University Timetable & Deadlines', subtitle: 'Class Calendar & Exam Countdowns', icon: <Calendar className="w-4 h-4 text-sky-500" /> },
  { id: 'outreach', title: 'Cold Email & HR Outreach Suite', subtitle: 'AI Outreach Sequences & Templates', icon: <Briefcase className="w-4 h-4 text-purple-500" /> },
  { id: 'jobs', title: 'Career Pipeline & Job Tracker', subtitle: 'Graduate Schemes & Internship Vault', icon: <Building className="w-4 h-4 text-blue-500" /> },
  { id: 'tasks', title: 'Priority Tasks & Master Checklist', subtitle: 'Universal Tasks & Study Checklists', icon: <CheckSquare className="w-4 h-4 text-amber-500" /> },
  { id: 'skills', title: 'Skills Matrix & Roadmap', subtitle: 'Competencies & Certification Tracker', icon: <Target className="w-4 h-4 text-cyan-500" /> },
  { id: 'resume', title: 'ATS Resume Builder & Vault', subtitle: 'High-Impact Career Resumes', icon: <FileText className="w-4 h-4 text-purple-500" /> },
  { id: 'travel', title: 'Travel & Transit Workspace', subtitle: 'Trip Planner & Itineraries', icon: <Plane className="w-4 h-4 text-sky-500" /> },
  { id: 'work', title: 'Part-Time Work & Timesheets', subtitle: 'Hourly Shifts & Pay Tracker', icon: <Clock className="w-4 h-4 text-amber-500" /> },
  { id: 'metasuite', title: 'Executive Meta-Suite', subtitle: 'Integrated AI Workspace', icon: <Zap className="w-4 h-4 text-amber-500" /> }
];

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, userData, setActiveTab, updateData }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [transitResults, setTransitResults] = useState<SearchResult[]>([]);
  const [isFetchingReport, setIsFetchingReport] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchMsg, setFetchMsg] = useState('');
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useModalDismiss(isOpen, onClose);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
      setTransitResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      const searchTransit = async () => {
        try {
          const res = await tflApi.searchBikePoints(query);
          const formatted: SearchResult[] = res.map(bike => ({
            id: bike.id,
            title: bike.commonName,
            subtitle: `Transit • Cycle Hire (${bike.additionalProperties.find((p: any) => p.key === 'NbBikes')?.value || '0'} bikes)`,
            type: 'Transit',
            icon: <Bike className="w-4 h-4 text-emerald-500" />,
            tab: 'travel' as AppTab,
            score: 1
          }));
          setTransitResults(formatted);
        } catch {
          // Ignore
        }
      };
      
      const timeout = setTimeout(searchTransit, 500);
      return () => clearTimeout(timeout);
    } else {
      setTransitResults([]);
    }
  }, [query]);

  const handleExecuteAnnualReportFetch = async (company: string, year: string) => {
    setTargetCompanyName(`${company} (${year})`);
    setIsFetchingReport(true);
    setFetchProgress(15);
    setFetchMsg(`Searching SEC EDGAR database for ${company} ${year} annual report...`);

    try {
      setTimeout(() => {
        setFetchProgress(45);
        setFetchMsg(`Retrieving official 10-K filing text & statements for ${company}...`);
      }, 1000);

      setTimeout(() => {
        setFetchProgress(75);
        setFetchMsg(`Linking Active Grounding Context in Study Engine...`);
      }, 2200);

      const doc = await fetchAnnualReport(company, year);
      saveAndGroundAnnualReport(doc, userData, updateData);

      setFetchProgress(100);
      setFetchMsg(`Annual Report successfully linked! Launching Analysis Suite...`);

      setTimeout(() => {
        setIsFetchingReport(false);
        setActiveTab('study');
        onClose();
      }, 600);
    } catch (err: any) {
      console.error(err);
      alert('Error fetching annual report: ' + err.message);
      setIsFetchingReport(false);
    }
  };

  const actionResults: SearchResult[] = [];
  const reportCmd = isAnnualReportFetchCommand(query);
  if (reportCmd.isMatch) {
    actionResults.push({
      id: 'action-fetch-annual-report',
      title: `Fetch & Ground ${reportCmd.company} ${reportCmd.year} Annual Report`,
      subtitle: `Natural Language Pipeline • SEC EDGAR 10-K Grounding`,
      type: 'Action',
      icon: <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />,
      tab: 'study',
      score: 10,
      isAction: true,
      actionHandler: () => handleExecuteAnnualReportFetch(reportCmd.company, reportCmd.year)
    });
  }

  // Build Comprehensive Indexed Search Results
  const allResults = useMemo(() => {
    const items: SearchResult[] = [];

    // 1. Workspace Tabs
    PRIMARY_WORKSPACE_TABS.forEach(tab => {
      items.push({
        id: `tab-${tab.id}`,
        title: tab.title,
        subtitle: tab.subtitle,
        type: 'Navigation',
        icon: tab.icon,
        tab: tab.id,
        score: 3
      });
    });

    // Share & Invite App Action
    items.push({
      id: 'action-share-app',
      title: 'Share App & Invite Friends',
      subtitle: 'One-click link copy (manageme-three.vercel.app), native share & email invites',
      type: 'Action',
      icon: <Share2 className="w-4 h-4 text-blue-500" />,
      tab: 'landing',
      score: 4,
      isAction: true,
      actionHandler: () => {
        window.dispatchEvent(new CustomEvent('openShareAppModal'));
        onClose();
      }
    });

    // 2. Study Documents & Notes
    try {
      const studyDocsRaw = localStorage.getItem('manageme_study_docs');
      if (studyDocsRaw) {
        const docs = JSON.parse(studyDocsRaw);
        if (Array.isArray(docs)) {
          docs.forEach((d: any) => {
            items.push({
              id: `doc-${d.id}`,
              title: d.name || 'Untitled Document',
              subtitle: `Study Document • ${d.size || 'PDF'} • ${d.type || 'Study Notes'}`,
              type: 'Document',
              icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
              tab: 'study',
              score: 2
            });
          });
        }
      }
    } catch {}

    // 3. Saved DCF Valuation Models
    try {
      const dcfRaw = localStorage.getItem('manageme_dcf_calc');
      if (dcfRaw) {
        const dcf = JSON.parse(dcfRaw);
        if (dcf?.companyName) {
          items.push({
            id: 'dcf-active-model',
            title: `${dcf.companyName} (${dcf.ticker || 'VAL'}) DCF Model`,
            subtitle: `Financial Valuation • Current Price: ${dcf.currency || '$'}${dcf.currentSharePrice} • WACC: ${dcf.wacc}%`,
            type: 'Model',
            icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
            tab: 'study',
            score: 2
          });
        }
      }
    } catch {}

    // 4. Exam & Task Deadlines
    try {
      const deadlines = getExamDeadlines();
      deadlines.forEach(dl => {
        const days = calculateDaysRemaining(dl.date);
        items.push({
          id: `dl-${dl.id}`,
          title: dl.title,
          subtitle: `Deadline • ${dl.date} (${days === 0 ? 'Today!' : `${days} days left`}) • ${dl.module || dl.type}`,
          type: 'Deadline',
          icon: <Timer className="w-4 h-4 text-amber-500" />,
          tab: 'uni',
          score: 2
        });
      });
    } catch {}

    // 5. Grad Schemes & Job Applications
    userData.gradSchemes?.forEach(scheme => {
      items.push({
        id: `grad-${scheme.id}`,
        title: `${scheme.firm} - ${scheme.roleTitle}`,
        subtitle: `Career Scheme • Status: ${scheme.status || 'Applied'}`,
        type: 'Job',
        icon: <Briefcase className="w-4 h-4 text-blue-500" />,
        tab: 'jobs',
        score: 1
      });
    });

    // 6. Expenses & Finance
    userData.expenses?.forEach(exp => {
      items.push({
        id: `exp-${exp.id}`,
        title: `${exp.category} - £${exp.amount}`,
        subtitle: exp.description || 'Student Expense',
        type: 'Finance',
        icon: <DollarSign className="w-4 h-4 text-rose-500" />,
        tab: 'finance',
        score: 1
      });
    });

    // 7. Universal Tasks
    userData.universalTasks?.forEach(task => {
      items.push({
        id: `task-${task.id}`,
        title: `[${task.priority || 'NORMAL'}] ${task.title}`,
        subtitle: `Task • ${task.completed ? 'Completed' : 'Pending'}`,
        type: 'Task',
        icon: <CheckSquare className="w-4 h-4 text-amber-500" />,
        tab: 'tasks',
        score: 1
      });
    });

    // Filter by query
    let filtered = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = items.filter(it => 
        it.title.toLowerCase().includes(q) || 
        it.subtitle.toLowerCase().includes(q) ||
        it.type.toLowerCase().includes(q)
      );
    }

    return [...actionResults, ...filtered, ...transitResults].slice(0, 10);
  }, [query, actionResults, transitResults, userData]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      const selected = allResults[selectedIndex];
      if (selected.isAction && selected.actionHandler) {
        selected.actionHandler();
      } else {
        setActiveTab(selected.tab);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in" 
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          onKeyDown={handleKeyDown}
        >
          {/* Top Search Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 gap-3 bg-slate-50/50 dark:bg-zinc-950/50">
            <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Jump to tab, search notes, DCF models, deadlines, or 'fetch Tesla 2024 10-K'..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent border-none text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-zinc-500 text-sm sm:text-base font-medium"
            />
            {query && (
              <button 
                onClick={() => setQuery('')} 
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-slate-300 dark:border-zinc-700">
              ESC to close
            </kbd>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-2.5 custom-scrollbar space-y-1">
            {allResults.length > 0 ? (
              allResults.map((result, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <button
                    key={`${result.id}-${i}`}
                    onClick={() => {
                      if (result.isAction && result.actionHandler) {
                        result.actionHandler();
                      } else {
                        setActiveTab(result.tab);
                        onClose();
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : result.isAction
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2 rounded-xl border shrink-0 ${
                        isSelected 
                          ? 'bg-white/20 border-white/30 text-white' 
                          : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                      }`}>
                        {result.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate flex items-center gap-2">
                          <span className={isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}>
                            {result.title}
                          </span>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {result.type}
                          </span>
                        </div>
                        <div className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-zinc-400'}`}>
                          {result.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                        {result.isAction ? 'Execute' : `Jump`}
                      </span>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 dark:text-zinc-400 text-sm">
                {query ? `No items found for "${query}"` : 'Type to search workspace modules, documents, or financial models...'}
              </div>
            )}
          </div>

          {/* Footer Shortcuts Help */}
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 px-4">
            <div className="flex items-center gap-3">
              <span><kbd className="font-mono bg-slate-200 dark:bg-zinc-800 px-1 rounded">↑</kbd> <kbd className="font-mono bg-slate-200 dark:bg-zinc-800 px-1 rounded">↓</kbd> Navigate</span>
              <span><kbd className="font-mono bg-slate-200 dark:bg-zinc-800 px-1 rounded">↵</kbd> Select</span>
            </div>
            <span>manageme Command Palette</span>
          </div>
        </motion.div>
      </div>

      {/* Annual Report Fetch Progress Bar */}
      <ImportProgressBar
        isProcessing={isFetchingReport}
        progress={fetchProgress}
        stepMessage={fetchMsg}
        fileName={targetCompanyName}
        title="SEC EDGAR Annual Report Fetch Pipeline"
        onCancel={() => setIsFetchingReport(false)}
      />
    </>
  );
};
