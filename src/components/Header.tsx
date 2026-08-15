import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Cloud, 
  Upload, 
  FileSpreadsheet, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  LogIn,
  LogOut,
  Sparkles,
  ChevronDown,
  Bot,
  FileDown,
  Check,
  ShieldCheck,
  Lock,
  Unlock,
  DollarSign,
  Clock,
  CheckSquare,
  Newspaper,
  GraduationCap,
  Briefcase,
  Zap,
  Calendar,
  Target,
  FileText,
  LineChart,
  Plane,
  MapPin,
  MessageSquare,
  Mail,
  Brain,
  Search,
  Timer
} from 'lucide-react';
import { GoogleSyncState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import { triggerHaptic } from '../utils/haptics';
import { getActiveAiConfig, SUPPORTED_AI_MODELS } from '../lib/aiGateway';
import { getExamDeadlines, getNextPriorityDeadline } from '../utils/deadlines';

export type AppTab = 'landing' | 'news' | 'study' | 'jobs' | 'outreach' | 'work' | 'trading' | 'travel' | 'transit' | 'finance' | 'tasks' | 'skills' | 'uni' | 'places' | 'chat' | 'resume' | 'metasuite';

interface HeaderProps {
  activeTab: AppTab | string;
  setActiveTab: (tab: any) => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  onExportMultiSheet: () => void;
  onOpenGoogleSync: () => void;
  onOpenSettings: () => void;
  onOpenSmartImport?: () => void;
  onOpenActivityDrawer?: () => void;
  googleSyncState: GoogleSyncState;
  userData: UserTrackerData;
  updateData?: (data: Partial<UserTrackerData>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onGoBack,
  onGoHome,
  onExportMultiSheet,
  onOpenGoogleSync,
  onOpenSettings,
  onOpenSmartImport,
  onOpenActivityDrawer,
  googleSyncState,
  userData
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const aiDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target as Node)) {
        setAiDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useScrollLock(drawerOpen);
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('manageme_theme') || localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('manageme_theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('manageme_theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const { isOwnerVerified, requireOwnerPermission, lockOwnerMode } = useOwnerSecurity();
  const [activeAiModel, setActiveAiModel] = useState(() => getActiveAiConfig());

  useEffect(() => {
    const handleModelChange = () => setActiveAiModel(getActiveAiConfig());
    window.addEventListener('aiModelChanged', handleModelChange);
    return () => window.removeEventListener('aiModelChanged', handleModelChange);
  }, []);

  const handleCloudSync = () => {
    setIsSyncing(true);
    // Simulate network delay
    setTimeout(() => {
      setIsSyncing(false);
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 3000);
    }, 1500);
  };

  const { 
    user, 
    isAuthenticated,
    isGuest,
    signInWithGoogle,
    signInAsGuest,
    signOut: authSignOut 
  } = useAuth();
  
  const userName = user?.displayName || user?.email?.split('@')[0] || (isGuest ? 'Guest Executive' : 'Meet');

  // Next Priority Deadline / Exam Countdown
  const [nextDeadline, setNextDeadline] = useState<{ deadline: any; daysRemaining: number } | null>(() => {
    return getNextPriorityDeadline(getExamDeadlines());
  });

  useEffect(() => {
    const updateCountdown = () => {
      setNextDeadline(getNextPriorityDeadline(getExamDeadlines()));
    };
    window.addEventListener('deadlinesUpdated', updateCountdown);
    window.addEventListener('storage', updateCountdown);
    return () => {
      window.removeEventListener('deadlinesUpdated', updateCountdown);
      window.removeEventListener('storage', updateCountdown);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { showToast } = useToast();

  const handleLogin = async () => {
    try {
      if (!isAuthenticated || isGuest) {
        showToast('Connecting to authentication service...', 'info', 2000);
        const success = await signInWithGoogle();
        if (success) {
          showToast('Signed in successfully with Google!', 'success');
        } else {
          showToast('Sign-in unavailable. Activated local Guest Demo session.', 'warning', 4000);
        }
      } else {
        await authSignOut();
        showToast('Signed out of session.', 'info');
      }
    } catch (err: any) {
      console.error('[Auth Error - Header Login]:', err);
      showToast(`Login failed: ${err?.message || 'Network/Auth Error'}. Using local workspace mode.`, 'error', 5000);
    }
  };

  const handleGuestDemoAccess = () => {
    signInAsGuest();
    showToast('✨ Activated full Guest Demo Executive Workspace!', 'sparkle', 3500);
  };

  const handleNavigateHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      setActiveTab('landing');
    }
  };

  const handleNavigateBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab('landing');
    }
  };

  const menuItems: { id: AppTab | 'settings'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'landing', label: 'Home Overview & Landing', icon: Sparkles },
    { id: 'news', label: 'Financial News & Intelligence', icon: Newspaper },
    { id: 'study', label: 'Study & Intelligence Engine', icon: GraduationCap },
    { id: 'jobs', label: 'Career Vault & Pipeline', icon: Briefcase },
    { id: 'trading', label: 'Trading & Valuation Terminal', icon: LineChart },
    { id: 'outreach', label: 'Cold Email & HR Outreach Suite', icon: Mail },
    { id: 'uni', label: 'University Timetable & Calendar', icon: Calendar },
    { id: 'finance', label: 'Financial Ledger & Expenses', icon: DollarSign },
    { id: 'metasuite', label: 'Executive Meta-Suite', icon: Zap },
    { id: 'skills', label: 'Skills Matrix, Certs & Roadmap', icon: Target },
    { id: 'tasks', label: 'Priority Tasks & Master Checklist', icon: CheckSquare },
    { id: 'resume', label: 'ATS Resume Builder & Vault', icon: FileText },
    { id: 'work', label: 'Part-Time Work & Timesheets', icon: Clock },
    { id: 'travel', label: 'Travel & Transit Workspace', icon: Plane },
    { id: 'chat', label: 'Peer Community & Study Chat', icon: MessageSquare }
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'glass-panel border-b border-[var(--border)] shadow-sm py-2' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Left: Universal Back Button + Clickable Home Avatar & Dashboard Title */}
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              
              {/* Dedicated Universal Back Button */}
              <button
                id="universalBackBtn"
                onClick={handleNavigateBack}
                className="p-2 sm:p-2.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(128,128,128,0.15)] active:scale-90 transition-all flex items-center justify-center border border-transparent hover:border-[var(--border)] group/back cursor-pointer shadow-sm"
                title="Go back to previous page or tab"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/back:-translate-x-0.5" />
              </button>

              {/* Clickable Avatar & Dashboard Title (Redirects to Home Landing Page) */}
              <button
                id="dashboardHomeRedirectBtn"
                onClick={handleNavigateHome}
                className="flex items-center space-x-2.5 sm:space-x-3 text-left group/home focus:outline-none rounded-2xl py-1 px-1.5 sm:px-2 hover:bg-[rgba(128,128,128,0.1)] active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-[var(--border)]"
                title="Return to Home Dashboard"
                aria-label="Return to Home Dashboard"
              >
                {/* Avatar Icon */}
                <div className="relative shrink-0">
                  {isAuthenticated && user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 group-hover/home:ring-2 group-hover/home:ring-[var(--accent)] group-hover/home:scale-105 group-hover/home:shadow-md transition-all object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 text-[var(--text-primary)] flex items-center justify-center font-bold text-sm border border-[var(--border)] group-hover/home:ring-2 group-hover/home:ring-[var(--accent)] group-hover/home:bg-white/20 group-hover/home:scale-105 group-hover/home:shadow-md transition-all">
                      <User className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg)] shadow-sm"></span>
                </div>

                {/* Dashboard Title & Sub-Label */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base sm:text-lg md:text-xl text-[var(--text-primary)] tracking-tight group-hover/home:text-[var(--accent)] transition-colors lowercase">
                      manageme
                    </span>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-mono font-bold tracking-wider hidden sm:inline-block">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] -mt-0.5 group-hover/home:text-[var(--text-primary)]/80 transition-colors hidden xs:block truncate">
                    Executive Career Workspace
                  </span>
                </div>
              </button>

            </div>

            {/* Right: Segmented Pill Actions, Theme Toggle & Hamburger Menu */}
            <div className="flex items-center shrink-0 space-x-1.5 sm:space-x-2">

              {/* Priority Deadline Countdown Widget */}
              {nextDeadline && (
                <button
                  onClick={() => setActiveTab('uni')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 group"
                  title={`Priority Deadline: ${nextDeadline.deadline.title} (${nextDeadline.deadline.date}) • Click to manage in Timetable`}
                >
                  <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[140px]">{nextDeadline.deadline.title}:</span>
                  <span className="font-mono font-bold bg-amber-500/20 dark:bg-amber-400/20 px-1.5 py-0.5 rounded text-[10px] text-amber-800 dark:text-amber-200">
                    {nextDeadline.daysRemaining === 0 ? 'Today!' : `${nextDeadline.daysRemaining}d`}
                  </span>
                </button>
              )}

              {/* Global Command Palette (⌘K) Trigger */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openCommandPalette'))}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[40px] rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:border-blue-500/50 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs group"
                title="Global Command Palette (Ctrl+K / Cmd+K)"
                aria-label="Open Command Palette"
              >
                <Search className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <span className="hidden sm:inline text-xs font-medium">Search</span>
                <kbd className="hidden sm:inline text-[9px] font-mono bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 px-1 py-0.5 rounded border border-slate-300 dark:border-zinc-600">
                  ⌘K
                </kbd>
              </button>

              {/* Header Quick Action Shortcuts */}
              <div className="hidden 2xl:flex items-center gap-1.5 bg-slate-200/80 dark:bg-zinc-900/80 p-1 rounded-full border border-slate-300 dark:border-zinc-700 mr-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('finance')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Student Finance & Expenses ($ Finance)"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Finance</span>
                </button>
                <button
                  onClick={() => setActiveTab('uni')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Timetable & Calendar (⏰ Timetable)"
                >
                  <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Timetable</span>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Priority Checklist (☑️ Checklist)"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Checklist</span>
                </button>
                <button
                  onClick={() => document.getElementById('geminiAssistantBtn')?.click()}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="AI Prompts Copilot (>_ Prompts)"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Prompts</span>
                </button>
              </div>

              {/* AI Model & Engine Switcher Button */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openAiModelSelector'))}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[40px] rounded-full text-xs font-semibold bg-purple-500/10 dark:bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-700 dark:text-purple-300 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Select AI Model & Open API Vault"
                aria-label="AI Model Selector"
              >
                <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="truncate max-w-[70px] sm:max-w-[120px]">
                  {SUPPORTED_AI_MODELS.find(m => m.id === activeAiModel.model)?.name.split(' ')[0] || 'Gemini'}
                </span>
              </button>

              {/* Owner Security Status Button */}
              <button
                onClick={() => {
                  if (isOwnerVerified) {
                    lockOwnerMode();
                  } else {
                    requireOwnerPermission('Authorize Master Owner Controls', () => {});
                  }
                }}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isOwnerVerified 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
                }`}
                title={isOwnerVerified ? 'Owner Mode Active (Click to Lock)' : 'Protected View-Only Mode (Click to Authorize)'}
              >
                {isOwnerVerified ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Owner Mode</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Protected</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 min-h-[44px] min-w-[44px] text-[var(--text-secondary)] hover:bg-[rgba(128,128,128,0.1)] hover:text-[var(--text-primary)] rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 min-h-[44px] min-w-[44px] text-[var(--text-primary)] hover:bg-[rgba(128,128,128,0.1)] rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
                id="mainNavMenuBtn"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ y: '100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '100%', x: 0 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.8 }}
              onDragEnd={(_: any, info: any) => {
                if (info.offset.y > 100 || info.velocity.y > 200) {
                  triggerHaptic(15);
                  setDrawerOpen(false);
                }
              }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 sm:top-0 sm:left-auto sm:right-0 sm:bottom-0 w-full sm:max-w-sm border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-zinc-800 z-50 flex flex-col shadow-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-none max-h-[88vh] sm:max-h-full touch-none"
            >
              {/* Drag handle for mobile bottom sheet */}
              <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full my-2 mx-auto cursor-grab active:cursor-grabbing sm:hidden" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono text-xs">
                    Navigation Directory
                  </h2>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 bg-slate-200/60 dark:bg-white/5 rounded-full text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Bar in Drawer */}
              <div className="p-2.5 mx-3 my-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isAuthenticated && !isGuest && user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{userName}</p>
                      {isGuest && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-tight">
                      {isAuthenticated && !isGuest ? 'Signed in with Google' : isGuest ? 'Guest Demo Workspace' : 'Local Workspace Mode'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isAuthenticated && !isGuest && (
                    <button
                      onClick={handleGuestDemoAccess}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-xs"
                      title="Explore in Guest Demo Mode"
                    >
                      Demo
                    </button>
                  )}
                  <button
                    onClick={handleLogin}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  >
                    {isAuthenticated && !isGuest ? (
                      <>
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3 h-3" />
                        <span>{isGuest ? 'Sign In' : 'Sign In'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scrollable Navigation Directory */}
              <div className="flex-1 overflow-y-auto min-h-0 py-2 px-3 custom-scrollbar flex flex-col justify-between space-y-4">
                {/* 1. Primary Navigation Tabs First (Full-Width Clickable Buttons) */}
                <div className="space-y-1">
                  <div className="px-2 pb-1.5 pt-1 text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-bold tracking-wider">
                    Navigation Directory
                  </div>
                  {menuItems.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'settings') {
                            onOpenSettings();
                          } else {
                            setActiveTab(item.id);
                          }
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl transition-all duration-200 text-xs sm:text-sm text-left cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <ItemIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. Quick Action Shortcuts (Placed directly below primary navigation tabs) */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <div className="px-2 pb-1 text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-bold tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <span>Quick Action Shortcuts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('finance');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-all text-left cursor-pointer active:scale-95"
                    >
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">Finance Hub</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('uni');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-sky-50 dark:hover:bg-sky-500/20 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-sky-700 dark:text-sky-300 transition-all text-left cursor-pointer active:scale-95"
                    >
                      <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="truncate">Timetable</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-amber-50 dark:hover:bg-amber-500/20 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-all text-left cursor-pointer active:scale-95"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate">Checklist</span>
                    </button>
                    <button
                      onClick={() => {
                        document.getElementById('geminiAssistantBtn')?.click();
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-all text-left cursor-pointer active:scale-95"
                    >
                      <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="truncate">AI Prompts</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('resume');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-purple-50 dark:hover:bg-purple-500/20 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-purple-700 dark:text-purple-300 transition-all text-left cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="truncate">ATS Resume</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenSmartImport) {
                          onOpenSmartImport();
                        } else {
                          setActiveTab('jobs');
                        }
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-pink-50 dark:hover:bg-pink-500/20 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-pink-700 dark:text-pink-300 transition-all text-left cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                      <span className="truncate">Smart Import</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Streamlined Footer (Subtle Settings Button Only) */}
              <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 shrink-0 flex items-center justify-between px-4">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">manageme v2.5</span>
                <button 
                  onClick={() => { onOpenSettings(); setDrawerOpen(false); }} 
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Settings</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sync Toast */}
      <AnimatePresence>
        {showSyncToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            Cloud Sync Complete • Data Up to Date
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

