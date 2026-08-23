// Component: Global Command Palette (Cmd+K / Ctrl+K)

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  GraduationCap, 
  Building2, 
  FileSpreadsheet, 
  Sparkles, 
  Plus, 
  Cloud, 
  Filter, 
  Sun, 
  Moon, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Calendar, 
  Send, 
  CheckSquare, 
  Award, 
  FileText, 
  Compass, 
  Clock, 
  Zap,
  Globe,
  Sliders
} from 'lucide-react';
import { UserTrackerData } from '../../hooks/useFirestoreData';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { exportMultiSheetWorkbook } from '../../utils/excelExporter';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: UserTrackerData;
  setActiveTab: (tab: string) => void;
  updateData?: (data: any) => void;
  onOpenAddModal?: () => void;
  onOpenGoogleSync?: () => void;
  onOpenSmartImport?: () => void;
  onOpenSettings?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Quick Actions' | 'Job Applications' | 'Preferences';
  icon: React.ReactNode;
  badge?: string;
  shortcut?: string;
  onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  userData,
  setActiveTab,
  updateData,
  onOpenAddModal,
  onOpenGoogleSync,
  onOpenSmartImport,
  onOpenSettings
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { updateSettings } = useSettings();

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Built-in Navigation Commands
  const navigationCommands: CommandItem[] = useMemo(() => [
    {
      id: 'nav-jobs',
      title: 'Go to Career Vault',
      subtitle: 'Graduate schemes, applications & pipeline Kanban',
      category: 'Navigation',
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      shortcut: '#jobs',
      onSelect: () => { setActiveTab('jobs'); onClose(); }
    },
    {
      id: 'nav-trading',
      title: 'Go to Trading Terminal',
      subtitle: 'Multi-asset order execution, DCF valuation & quotes',
      category: 'Navigation',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      shortcut: '#trading',
      onSelect: () => { setActiveTab('trading'); onClose(); }
    },
    {
      id: 'nav-landing',
      title: 'Go to Landing Page',
      subtitle: 'Return to welcome overview & spatial landing',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      shortcut: '#landing',
      onSelect: () => { setActiveTab('landing'); onClose(); }
    },
    {
      id: 'nav-news',
      title: 'Go to Financial News',
      subtitle: 'Real-time global market feeds & editorial analysis',
      category: 'Navigation',
      icon: <Globe className="w-4 h-4 text-sky-400" />,
      shortcut: '#news',
      onSelect: () => { setActiveTab('news'); onClose(); }
    },
    {
      id: 'nav-study',
      title: 'Go to Study Engine',
      subtitle: 'Virtual notebooks, flashcards & mock exams',
      category: 'Navigation',
      icon: <GraduationCap className="w-4 h-4 text-indigo-400" />,
      shortcut: '#study',
      onSelect: () => { setActiveTab('study'); onClose(); }
    },
    {
      id: 'nav-finance',
      title: 'Go to Finance Hub',
      subtitle: 'Budgeting, card statements, vehicle & splitwise ledger',
      category: 'Navigation',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      shortcut: '#finance',
      onSelect: () => { setActiveTab('finance'); onClose(); }
    },
    {
      id: 'nav-uni',
      title: 'Go to Uni Timetable',
      subtitle: 'Lectures, seminars, exam countdowns & modules',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4 text-amber-400" />,
      shortcut: '#uni',
      onSelect: () => { setActiveTab('uni'); onClose(); }
    },
    {
      id: 'nav-outreach',
      title: 'Go to Cold Email Outreach',
      subtitle: 'Recruiter contacts, email drafts & sequences',
      category: 'Navigation',
      icon: <Send className="w-4 h-4 text-rose-400" />,
      shortcut: '#outreach',
      onSelect: () => { setActiveTab('outreach'); onClose(); }
    },
    {
      id: 'nav-tasks',
      title: 'Go to Priority Matrix',
      subtitle: 'Universal tasks, action items & checklists',
      category: 'Navigation',
      icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
      shortcut: '#tasks',
      onSelect: () => { setActiveTab('tasks'); onClose(); }
    },
    {
      id: 'nav-skills',
      title: 'Go to Skills & Certifications',
      subtitle: 'CFA, Coursera, CFI benchmarks & skill ratings',
      category: 'Navigation',
      icon: <Award className="w-4 h-4 text-cyan-400" />,
      shortcut: '#skills',
      onSelect: () => { setActiveTab('skills'); onClose(); }
    },
    {
      id: 'nav-resume',
      title: 'Go to Resume Vault',
      subtitle: 'ATS-optimized resumes & cover letter drafts',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      shortcut: '#resume',
      onSelect: () => { setActiveTab('resume'); onClose(); }
    },
    {
      id: 'nav-travel',
      title: 'Go to Travel & Transit Hub',
      subtitle: 'Trip planner, companion split & live London Tube status',
      category: 'Navigation',
      icon: <Compass className="w-4 h-4 text-rose-400" />,
      shortcut: '#travel',
      onSelect: () => { setActiveTab('travel'); onClose(); }
    },
    {
      id: 'nav-work',
      title: 'Go to Work Shifts & Timesheets',
      subtitle: 'Hourly shift logs & income tracker',
      category: 'Navigation',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      shortcut: '#work',
      onSelect: () => { setActiveTab('work'); onClose(); }
    },
    {
      id: 'nav-metasuite',
      title: 'Go to Executive AI Meta-Suite',
      subtitle: 'Autonomous strategic co-pilot & LLM orchestration',
      category: 'Navigation',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      shortcut: '#metasuite',
      onSelect: () => { setActiveTab('metasuite'); onClose(); }
    }
  ], [setActiveTab, onClose]);

  // Quick Action Commands
  const quickActions: CommandItem[] = useMemo(() => [
    {
      id: 'act-add-app',
      title: 'Add New Application',
      subtitle: 'Log a new graduate scheme or role',
      category: 'Quick Actions',
      icon: <Plus className="w-4 h-4 text-emerald-400" />,
      badge: 'Action',
      onSelect: () => {
        onClose();
        if (onOpenAddModal) onOpenAddModal();
        else window.dispatchEvent(new CustomEvent('openAddApplicationModal'));
      }
    },
    {
      id: 'act-sync-google',
      title: 'Sync with Google Sheets',
      subtitle: 'Synchronize applications, tasks and timetable to Drive',
      category: 'Quick Actions',
      icon: <Cloud className="w-4 h-4 text-blue-400" />,
      badge: 'Cloud Sync',
      onSelect: () => {
        onClose();
        if (onOpenGoogleSync) onOpenGoogleSync();
        else window.dispatchEvent(new CustomEvent('openGoogleSyncModal'));
      }
    },
    {
      id: 'act-smart-import',
      title: 'Smart AI Import & Ingestion',
      subtitle: 'Auto-import resumes, PDFs, or spreadsheet data',
      category: 'Quick Actions',
      icon: <Upload className="w-4 h-4 text-purple-400" />,
      badge: 'AI Parse',
      onSelect: () => {
        onClose();
        if (onOpenSmartImport) onOpenSmartImport();
        else window.dispatchEvent(new CustomEvent('openSmartImport', { detail: { scope: 'all' } }));
      }
    },
    {
      id: 'act-filter-applied',
      title: 'Filter Career Vault: Applied Stages',
      subtitle: 'View active applications in Applied or Online Tests stage',
      category: 'Quick Actions',
      icon: <Filter className="w-4 h-4 text-cyan-400" />,
      onSelect: () => {
        setActiveTab('jobs');
        onClose();
      }
    },
    {
      id: 'act-filter-offers',
      title: 'Filter Career Vault: Offers 🎉',
      subtitle: 'View received offers and offer details',
      category: 'Quick Actions',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      onSelect: () => {
        setActiveTab('jobs');
        onClose();
      }
    },
    {
      id: 'act-toggle-theme',
      title: `Toggle Theme (${isDark ? 'Switch to Light' : 'Switch to Dark'})`,
      subtitle: 'Switch between Obsidian Night and Alpine Frost themes',
      category: 'Preferences',
      icon: isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      onSelect: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: 'act-export-excel',
      title: 'Export Multi-Sheet Excel Workbook',
      subtitle: 'Download complete offline backup with formulas',
      category: 'Quick Actions',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
      onSelect: () => {
        onClose();
        if (userData) {
          exportMultiSheetWorkbook(
            userData.timeline || [],
            userData.gradSchemes || [],
            userData.partTimeRoles || [],
            userData.priorityItems || [],
            userData.notesSections || []
          );
        }
      }
    },
    {
      id: 'act-open-settings',
      title: 'Open Workspace Preferences',
      subtitle: 'Customize typography, theme, and shortcut dock',
      category: 'Preferences',
      icon: <Sliders className="w-4 h-4 text-slate-400" />,
      onSelect: () => {
        onClose();
        if (onOpenSettings) onOpenSettings();
        else window.dispatchEvent(new CustomEvent('openSettingsDrawer'));
      }
    }
  ], [onClose, onOpenAddModal, onOpenGoogleSync, onOpenSmartImport, onOpenSettings, setActiveTab, isDark, toggleTheme, userData]);

  // Dynamic Job Application Search Commands
  const jobApplicationCommands: CommandItem[] = useMemo(() => {
    if (!userData) return [];

    const schemes = userData.gradSchemes || [];
    const priorityItems = userData.priorityItems || [];

    const schemeItems: CommandItem[] = schemes.map((s) => ({
      id: `job-${s.id}`,
      title: `${s.firm} — ${s.roleTitle}`,
      subtitle: `${s.sector} • ${s.salary || 'Competitive'} • ${s.appCloses || 'Rolling'}`,
      category: 'Job Applications',
      icon: <Building2 className="w-4 h-4 text-blue-400" />,
      badge: s.status,
      onSelect: () => {
        setActiveTab('jobs');
        onClose();
        // Dispatch event to highlight or open job detail
        window.dispatchEvent(new CustomEvent('openJobDetail', { detail: { job: s } }));
      }
    }));

    const priorityRoleItems: CommandItem[] = priorityItems.map((p) => ({
      id: `prio-${p.id}`,
      title: `${p.firm} — ${p.role}`,
      subtitle: `${p.sector} • ${p.nextAction || 'Follow up'}`,
      category: 'Job Applications',
      icon: <Building2 className="w-4 h-4 text-amber-400" />,
      badge: p.status,
      onSelect: () => {
        setActiveTab('tasks');
        onClose();
      }
    }));

    return [...schemeItems, ...priorityRoleItems];
  }, [userData, setActiveTab, onClose]);

  // Combined and Filtered Commands
  const allCommands = useMemo(() => {
    return [...navigationCommands, ...quickActions, ...jobApplicationCommands];
  }, [navigationCommands, quickActions, jobApplicationCommands]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return allCommands.slice(0, 14); // show top navigation & quick actions by default
    }
    const cleanQuery = query.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(cleanQuery);
      const matchSub = cmd.subtitle?.toLowerCase().includes(cleanQuery);
      const matchCat = cmd.category.toLowerCase().includes(cleanQuery);
      const matchBadge = cmd.badge?.toLowerCase().includes(cleanQuery);
      return matchTitle || matchSub || matchCat || matchBadge;
    });
  }, [allCommands, query]);

  // Keyboard navigation inside list
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll selected item into view smoothly
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Command Palette Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-[#0D0B18] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 text-white flex flex-col max-h-[80vh]"
          onKeyDown={handleKeyDown}
        >
          {/* Top Search Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, jump to view, or search jobs..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/10 rounded border border-white/10">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/5 no-scrollbar max-h-[60vh]"
          >
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => cmd.onSelect()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0052FF] text-white shadow-lg shadow-[#0052FF]/20 font-medium'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-300'}`}>
                        {cmd.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{cmd.title}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                          }`}>
                            {cmd.category}
                          </span>
                        </div>
                        {cmd.subtitle && (
                          <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {cmd.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {cmd.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {cmd.badge}
                        </span>
                      )}
                      {cmd.shortcut && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                        }`}>
                          {cmd.shortcut}
                        </span>
                      )}
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-mono">No matching commands or jobs found for "{query}"</p>
              </div>
            )}
          </div>

          {/* Bottom Keyboard Legend */}
          <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd> Select
              </span>
            </div>
            <span className="hidden sm:inline-block text-slate-400">
              manageme Command Palette
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
