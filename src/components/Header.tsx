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
  MessageSquare
} from 'lucide-react';
import { GoogleSyncState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from '../firebase';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import { triggerHaptic } from '../utils/haptics';

export type AppTab = 'news' | 'study' | 'jobs' | 'work' | 'trading' | 'travel' | 'transit' | 'finance' | 'tasks' | 'skills' | 'uni' | 'places' | 'chat' | 'resume' | 'metasuite';

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
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const { isOwnerVerified, requireOwnerPermission, lockOwnerMode } = useOwnerSecurity();

  const handleCloudSync = () => {
    setIsSyncing(true);
    // Simulate network delay
    setTimeout(() => {
      setIsSyncing(false);
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 3000);
    }, 1500);
  };

  const [userName, setUserName] = useState<string>('Guest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.displayName || user.email?.split('@')[0] || 'Meet');
      } else {
        setIsAuthenticated(false);
        setUserName('Guest');
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogin = async () => {
    if (!isAuthenticated) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      await signOut(auth);
    }
  };

  const handleNavigateHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      setActiveTab('news');
    }
  };

  const handleNavigateBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab('news');
    }
  };

  const menuItems: { id: AppTab | 'settings'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'news', label: 'Financial News & Intelligence', icon: Newspaper },
    { id: 'study', label: 'Study & Intelligence Engine', icon: GraduationCap },
    { id: 'jobs', label: 'Career Pipeline', icon: Briefcase },
    { id: 'uni', label: 'Timetable', icon: Calendar },
    { id: 'finance', label: 'Financial Ledger', icon: DollarSign },
    { id: 'metasuite', label: 'Executive Meta-Suite', icon: Zap },
    { id: 'skills', label: 'Skills Matrix, Certs & Roadmap', icon: Target },
    { id: 'tasks', label: 'Priority Tasks & Master Checklist', icon: CheckSquare },
    { id: 'resume', label: 'ATS Resume Builder & Vault', icon: FileText },
    { id: 'work', label: 'Part-Time Work & Timesheets', icon: Clock },
    { id: 'trading', label: 'Paper Trading & Market Academy', icon: LineChart },
    { id: 'travel', label: 'Travel & Transit Logistics', icon: Plane },
    { id: 'places', label: 'Places to Visit & Wishlist', icon: MapPin },
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
                  {isAuthenticated && auth.currentUser?.photoURL ? (
                    <img 
                      src={auth.currentUser.photoURL} 
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
            <div className="flex items-center shrink-0 space-x-1.5 sm:space-x-2.5">

              {/* Header Quick Action Shortcuts */}
              <div className="hidden xl:flex items-center gap-1 bg-neutral-900/60 p-1 rounded-full border border-white/10 mr-1">
                <button
                  onClick={() => setActiveTab('finance')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                  title="Student Finance & Expenses ($ Finance)"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Finance</span>
                </button>
                <button
                  onClick={() => setActiveTab('uni')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition-all flex items-center gap-1"
                  title="Timetable & Calendar (⏰ Timetable)"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timetable</span>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1"
                  title="Priority Checklist (☑️ Checklist)"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Checklist</span>
                </button>
                <button
                  onClick={() => document.getElementById('geminiAssistantBtn')?.click()}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-1"
                  title="AI Prompts Copilot (>_ Prompts)"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Prompts</span>
                </button>
              </div>

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
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
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

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 text-[var(--text-secondary)] hover:bg-[rgba(128,128,128,0.1)] hover:text-[var(--text-primary)] rounded-full transition-colors"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 text-[var(--text-primary)] hover:bg-[rgba(128,128,128,0.1)] rounded-full transition-colors flex items-center justify-center"
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
              className="fixed bottom-0 left-0 right-0 sm:top-0 sm:left-auto sm:right-0 sm:bottom-0 w-full sm:max-w-sm glass-panel border-t sm:border-t-0 sm:border-l border-[var(--border)] z-50 flex flex-col shadow-2xl bg-[var(--surface-solid)] rounded-t-3xl sm:rounded-none max-h-[88vh] sm:max-h-full touch-none"
            >
              {/* Drag handle for mobile bottom sheet */}
              <div className="w-12 h-1 bg-white/20 rounded-full my-2 mx-auto cursor-grab active:cursor-grabbing sm:hidden" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                  <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono text-xs">
                    Navigation Directory
                  </h2>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 bg-[rgba(255,255,255,0.05)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Bar in Drawer */}
              <div className="p-2.5 mx-3 my-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isAuthenticated && auth.currentUser?.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/20 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{userName}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-tight">{isAuthenticated ? 'Signed in with Google' : 'Local Workspace Mode'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  className="px-2 py-1 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-1 shrink-0"
                >
                  {isAuthenticated ? (
                    <>
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3 h-3" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scrollable Navigation Directory */}
              <div className="flex-1 overflow-y-auto min-h-0 py-2 px-3 custom-scrollbar flex flex-col justify-between space-y-4">
                {/* 1. Primary Navigation Tabs First (Full-Width Clickable Buttons) */}
                <div className="space-y-1">
                  <div className="px-2 pb-1.5 pt-1 text-[10px] font-mono uppercase text-neutral-400 font-bold tracking-wider">
                    Primary Modules
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
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm text-left cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20'
                            : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <ItemIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Streamlined Footer (Subtle Settings Button Only) */}
              <div className="p-3 border-t border-[var(--border)] bg-black/40 shrink-0 flex items-center justify-between px-4">
                <span className="text-[11px] text-neutral-400 font-mono">manageme v2.5</span>
                <button 
                  onClick={() => { onOpenSettings(); setDrawerOpen(false); }} 
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-blue-400" />
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

