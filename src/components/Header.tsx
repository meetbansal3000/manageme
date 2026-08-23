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
  Timer,
  Share2
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

import { useTheme } from '../context/ThemeContext';

export type AppTab = 'landing' | 'news' | 'study' | 'jobs' | 'outreach' | 'work' | 'trading' | 'travel' | 'transit' | 'finance' | 'tasks' | 'skills' | 'uni' | 'places' | 'chat' | 'resume' | 'metasuite' | 'privacy' | 'terms';

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
  onOpenShare?: () => void;
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
  onOpenShare,
  googleSyncState,
  userData
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();
  
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
    authError,
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
        window.dispatchEvent(new CustomEvent('openUserAuthModal'));
      } else {
        await authSignOut();
        showToast('Signed out of session.', 'info');
      }
    } catch (err: any) {
      console.error('[Auth Error - Header Login]:', err);
      showToast('Authentication encountered a notice.', 'warning');
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
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 w-full max-w-full overflow-x-hidden ${
        isScrolled ? 'bg-black/70 backdrop-blur-xl border-b border-white/[0.08] shadow-sm py-2' : 'bg-transparent py-3 sm:py-4'
      }`}>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            
            {/* Left: Universal Back Button + Clickable Home Avatar & Dashboard Title */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink min-w-0">
              
              {/* Dedicated Universal Back Button */}
              <button
                id="universalBackBtn"
                onClick={handleNavigateBack}
                className="p-1.5 sm:p-2.5 rounded-full text-white bg-white/[0.04] border border-white/10 hover:bg-white/10 backdrop-blur-md active:scale-90 transition-all flex items-center justify-center group/back cursor-pointer shrink-0"
                title="Go back to previous page or tab"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/back:-translate-x-0.5" />
              </button>

              {/* Clickable Avatar & Dashboard Title (Redirects to Home Landing Page) */}
              <button
                id="dashboardHomeRedirectBtn"
                onClick={handleNavigateHome}
                className="flex items-center space-x-2 sm:space-x-3 text-left group/home focus:outline-none rounded-2xl py-1 px-1 sm:px-2 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-white/10 min-w-0"
                title="Return to Home Dashboard"
                aria-label="Return to Home Dashboard"
              >
                {/* Avatar Icon */}
                <div className="relative shrink-0">
                  {isAuthenticated && user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-white/20 group-hover/home:ring-2 group-hover/home:ring-[#0052FF] group-hover/home:scale-105 group-hover/home:shadow-md transition-all object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs sm:text-sm border border-white/10 group-hover/home:ring-2 group-hover/home:ring-[#0052FF] group-hover/home:scale-105 group-hover/home:shadow-md transition-all">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0052FF]" />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#00FF66] ring-2 ring-black shadow-sm"></span>
                </div>

                {/* Dashboard Title & Sub-Label */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="font-extrabold text-base sm:text-lg md:text-xl text-white tracking-tightest group-hover/home:text-[#0052FF] transition-colors lowercase">
                      manageme
                    </span>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-[#0052FF]/15 text-[#0052FF] font-mono font-bold tracking-wider hidden sm:inline-block border border-[#0052FF]/30">
                      OS
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8B95A5] -mt-0.5 group-hover/home:text-white transition-colors hidden xs:block truncate">
                    Career Intelligence Hub
                  </span>
                </div>
              </button>

            </div>

            {/* Right: Essential Mobile Controls (Share, Menu) + Collapsible Desktop Controls */}
            <div className="flex items-center shrink-0 space-x-1 sm:space-x-2">

              {/* Priority Deadline Countdown Widget (Desktop only) */}
              {nextDeadline && (
                <button
                  onClick={() => setActiveTab('uni')}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs active:scale-95 group"
                  title={`Priority Deadline: ${nextDeadline.deadline.title} (${nextDeadline.deadline.date}) • Click to manage in Timetable`}
                >
                  <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[140px]">{nextDeadline.deadline.title}:</span>
                  <span className="font-mono font-bold bg-amber-400/20 px-1.5 py-0.5 rounded text-[10px] text-amber-200">
                    {nextDeadline.daysRemaining === 0 ? 'Today!' : `${nextDeadline.daysRemaining}d`}
                  </span>
                </button>
              )}

              {/* Global Command Palette (⌘K) Trigger (Desktop/Tablet) */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openCommandPalette'))}
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[40px] rounded-full bg-white/[0.04] text-white border border-white/10 hover:border-[#0052FF]/50 hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer group"
                title="Global Command Palette (Ctrl+K / Cmd+K)"
                aria-label="Open Command Palette"
              >
                <Search className="w-3.5 h-3.5 text-[#8B95A5] group-hover:text-[#0052FF] transition-colors" />
                <span className="hidden sm:inline text-xs font-medium text-white">Search</span>
                <kbd className="hidden sm:inline text-[9px] font-mono bg-white/10 text-[#8B95A5] px-1 py-0.5 rounded border border-white/10">
                  ⌘K
                </kbd>
              </button>

              {/* Share App & Invite Friends Trigger (Always visible on mobile & desktop) */}
              <button
                onClick={() => {
                  if (onOpenShare) {
                    onOpenShare();
                  } else {
                    window.dispatchEvent(new CustomEvent('openShareAppModal'));
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-full bg-[#0052FF]/15 hover:bg-[#0052FF]/25 border border-[#0052FF]/30 text-white backdrop-blur-md transition-all cursor-pointer active:scale-95 group"
                title="Share App & Invite Friends (Live Link & Native Share)"
                aria-label="Share App & Invite Friends"
              >
                <Share2 className="w-3.5 h-3.5 text-[#0052FF] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Share</span>
              </button>

              {/* Header Quick Action Shortcuts (Wide desktop only) */}
              <div className="hidden 2xl:flex items-center gap-1.5 bg-white/[0.03] backdrop-blur-md p-1 rounded-full border border-white/10 mr-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('finance')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.04] text-white border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                  title="Student Finance & Expenses ($ Finance)"
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span>Finance</span>
                </button>
                <button
                  onClick={() => setActiveTab('uni')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.04] text-white border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                  title="Timetable & Calendar (⏰ Timetable)"
                >
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Timetable</span>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.04] text-white border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                  title="Priority Checklist (☑️ Checklist)"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Checklist</span>
                </button>
                <button
                  onClick={() => document.getElementById('geminiAssistantBtn')?.click()}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.04] text-white border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer"
                  title="AI Prompts Copilot (>_ Prompts)"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Prompts</span>
                </button>
              </div>

              {/* AI Model & Engine Switcher Button (Desktop only) */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openAiModelSelector'))}
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[40px] rounded-full text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 backdrop-blur-md transition-all cursor-pointer active:scale-95"
                title="Select AI Model & Open API Vault"
                aria-label="AI Model Selector"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate max-w-[70px] sm:max-w-[120px]">
                  {SUPPORTED_AI_MODELS.find(m => m.id === activeAiModel.model)?.name.split(' ')[0] || 'Gemini'}
                </span>
              </button>

              {/* Owner Security Status Button (Desktop only) */}
              <button
                onClick={() => {
                  if (isOwnerVerified) {
                    lockOwnerMode();
                  } else {
                    requireOwnerPermission('Authorize Master Owner Controls', () => {});
                  }
                }}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all cursor-pointer ${
                  isOwnerVerified 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                }`}
                title={isOwnerVerified ? 'Owner Mode Active (Click to Lock)' : 'Protected View-Only Mode (Click to Authorize)'}
              >
                {isOwnerVerified ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Owner Mode</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Protected</span>
                  </>
                )}
              </button>

              {/* Animated Day/Night Mode Switcher (Strict Dark Mode) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                className="hidden sm:flex p-2 min-h-[38px] min-w-[38px] rounded-full bg-white/[0.04] border border-white/10 text-white hover:bg-white/10 backdrop-blur-md transition-colors items-center justify-center cursor-pointer active:scale-95"
                title="Cinematic Dark Mode Active"
                aria-label="Toggle Theme"
              >
                <Sun className="w-4 h-4 text-amber-400" />
              </motion.button>
              
              {/* Quick Sign Out / Sign In Button (Desktop & Tablet) */}
              <button
                onClick={handleLogin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full bg-white/[0.04] border border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md transition-all cursor-pointer active:scale-95 text-xs font-semibold"
                title={isAuthenticated && !isGuest ? "Sign Out of session" : isGuest ? "Exit Guest Demo & Sign In" : "Sign In to Workspace"}
                aria-label={isAuthenticated && !isGuest ? "Sign Out" : "Sign In"}
                id="headerQuickAuthBtn"
              >
                {isAuthenticated && !isGuest ? (
                  <>
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span className="hidden lg:inline">{isGuest ? 'Sign In' : 'Sign In'}</span>
                  </>
                )}
              </button>

              {/* Navigation Drawer Menu Button (Always visible) */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 min-h-[34px] min-w-[34px] sm:min-h-[38px] sm:min-w-[38px] rounded-full bg-white/[0.04] border border-white/10 text-white hover:bg-white/10 backdrop-blur-md transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
                id="mainNavMenuBtn"
              >
                <Menu className="w-5 h-5 text-white" />
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
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] sm:w-96 max-w-sm border-l border-white/10 z-50 flex flex-col shadow-2xl bg-[#0A0A0A]/95 backdrop-blur-2xl h-full text-white overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-transparent">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0052FF]"></span>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono text-xs">
                    Navigation Directory
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 bg-white/[0.04] hover:bg-white/10 rounded-full text-[#8B95A5] hover:text-white transition-colors cursor-pointer border border-white/10"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Quick Action Tools Strip */}
              <div className="px-3 pt-2 pb-1 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    window.dispatchEvent(new CustomEvent('openCommandPalette'));
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>Search (⌘K)</span>
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    window.dispatchEvent(new CustomEvent('openAiModelSelector'));
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-colors cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span className="truncate">AI: {SUPPORTED_AI_MODELS.find(m => m.id === activeAiModel.model)?.name.split(' ')[0] || 'Gemini'}</span>
                </button>
              </div>

              {/* User Account Bar in Drawer */}
              <div className="p-2.5 mx-3 my-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  {isAuthenticated && !isGuest && user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/20 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 font-bold">
                      <User className="w-4 h-4 text-[#0052FF]" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white leading-tight">{userName}</p>
                      {isGuest && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8B95A5] leading-tight">
                      {isAuthenticated && !isGuest ? 'Signed in with Google' : isGuest ? 'Guest Demo Workspace' : 'Local Workspace Mode'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isAuthenticated && !isGuest && (
                    <button
                      onClick={handleGuestDemoAccess}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/[0.04] text-white hover:bg-white/10 transition-colors cursor-pointer shadow-xs"
                      title="Explore in Guest Demo Mode"
                    >
                      Demo
                    </button>
                  )}
                  <button
                    onClick={handleLogin}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10 bg-white/[0.04] text-white hover:bg-[#0052FF] hover:border-[#0052FF] transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  >
                    {isAuthenticated && !isGuest ? (
                      <>
                        <LogOut className="w-3 h-3 text-rose-400" />
                        <span>Sign Out</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3 h-3 text-[#0052FF]" />
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
                  <div className="px-2 pb-1.5 pt-1 text-[10px] font-mono uppercase text-[#8B95A5] font-bold tracking-wider">
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
                            ? 'bg-[#0052FF] text-white font-semibold shadow-md shadow-[#0052FF]/20 border border-[#0052FF]/40'
                            : 'text-[#8B95A5] hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
                        }`}
                      >
                        <ItemIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#0052FF]'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 2. Quick Action Shortcuts (Placed directly below primary navigation tabs) */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="px-2 pb-1 text-[10px] font-mono uppercase text-[#8B95A5] font-bold tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Quick Action Shortcuts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('finance');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold text-white transition-all text-left cursor-pointer active:scale-95"
                    >
                      <DollarSign className="w-4 h-4 text-[#00FF66] shrink-0" />
                      <span className="truncate">Finance Hub</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('uni');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold text-white transition-all text-left cursor-pointer active:scale-95"
                    >
                      <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="truncate">Timetable</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold text-white transition-all text-left cursor-pointer active:scale-95"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Checklist</span>
                    </button>
                    <button
                      onClick={() => {
                        document.getElementById('geminiAssistantBtn')?.click();
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold text-white transition-all text-left cursor-pointer active:scale-95"
                    >
                      <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">AI Prompts</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('resume');
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold text-white transition-all text-left cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-purple-400 shrink-0" />
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
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold text-white transition-all text-left cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                      <span className="truncate">Smart Import</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Streamlined Footer (Share App & Settings Buttons) */}
              <div className="p-3 border-t border-white/10 bg-transparent shrink-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={() => {
                      if (onOpenShare) {
                        onOpenShare();
                      } else {
                        window.dispatchEvent(new CustomEvent('openShareAppModal'));
                      }
                      setDrawerOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-white hover:bg-[#0052FF]/25 px-3 py-2 rounded-xl border border-[#0052FF]/30 bg-[#0052FF]/15 backdrop-blur-md transition-colors cursor-pointer active:scale-95"
                    title="Share App & Invite Friends"
                  >
                    <Share2 className="w-4 h-4 text-[#0052FF]" />
                    <span>Share & Invite</span>
                  </button>
                  <button 
                    onClick={() => { onOpenSettings(); setDrawerOpen(false); }} 
                    className="flex items-center gap-2 text-xs font-semibold text-white hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-colors cursor-pointer active:scale-95"
                  >
                    <Settings className="w-4 h-4 text-[#8B95A5]" />
                    <span>Settings</span>
                  </button>
                </div>
                
                {/* Legal & Compliance Footer Links */}
                <div className="flex items-center justify-center gap-3 text-[10px] text-[#8B95A5] pt-1 font-sans">
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      setDrawerOpen(false);
                      setActiveTab('privacy');
                      window.location.hash = '#privacy';
                    }}
                    className="hover:text-[#0052FF] hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                  <span>&bull;</span>
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      setDrawerOpen(false);
                      setActiveTab('terms');
                      window.location.hash = '#terms';
                    }}
                    className="hover:text-blue-500 hover:underline cursor-pointer"
                  >
                    Terms of Service
                  </a>
                </div>
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

