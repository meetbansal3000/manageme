'use client';

import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { googleSignIn, getAccessToken } from './firebase';
import { AIAvatar } from './components/AIAvatar';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { LiveStockTicker } from './components/LiveStockTicker';
import { CompactToolbar } from './components/CompactToolbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ShortcutDock } from './components/ShortcutDock';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { DeviceLimitModal } from './components/DeviceLimitModal';
import { DollarSign, Clock, CheckSquare, Sparkles, ChevronDown, ChevronUp, X, Terminal } from 'lucide-react';
import { triggerHaptic, IOS_SPRING } from './utils/haptics';
import { AppTab } from './components/Header';
import { GoogleSyncState, GraduateScheme, PartTimeRole, PriorityTrackerItem } from './types';
import { exportMultiSheetWorkbook } from './utils/excelExporter';
import { uploadMasterTrackerToGoogleDrive } from './utils/googleDriveUpload';
import { useSettings } from './context/SettingsContext';
import { useOwnerSecurity } from './context/OwnerSecurityContext';
import { useAuth } from './context/AuthContext';
import { InteractiveCursorGlow } from './components/canvas/InteractiveCursorGlow';
import { useFirestoreData } from './hooks/useFirestoreData';
import { useScrollLock } from './hooks/useScrollLock';
import { useModalDismiss } from './hooks/useModalDismiss';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { toast } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { SmoothScroll } from './components/ui/SmoothScroll';

const PRIMARY_TABS: AppTab[] = ['landing', 'news', 'study', 'metasuite', 'jobs', 'outreach', 'tasks', 'uni', 'finance', 'trading', 'work', 'skills', 'travel', 'transit', 'chat', 'resume', 'privacy', 'terms'];

// Code-split tabs with React.lazy
const TimelineTab = lazy(() => import('./components/TimelineTab').then(m => ({ default: m.TimelineTab })));
const GraduateSchemesTab = lazy(() => import('./components/GraduateSchemesTab').then(m => ({ default: m.GraduateSchemesTab })));
const PartTimeRolesTab = lazy(() => import('./components/PartTimeRolesTab').then(m => ({ default: m.PartTimeRolesTab })));
const PriorityTrackerTab = lazy(() => import('./components/PriorityTrackerTab').then(m => ({ default: m.PriorityTrackerTab })));
const KeyNotesChecklistTab = lazy(() => import('./components/KeyNotesChecklistTab').then(m => ({ default: m.KeyNotesChecklistTab })));
const SkillsTrackerTab = lazy(() => import('./components/SkillsTrackerTab').then(m => ({ default: m.SkillsTrackerTab })));
const FinanceHubTab = lazy(() => import('./components/FinanceHubTab').then(m => ({ default: m.FinanceHubTab })));
const UniTimetableTab = lazy(() => import('./components/UniTimetableTab').then(m => ({ default: m.UniTimetableTab })));
const ChatHubTab = lazy(() => import('./components/ChatHubTab').then(m => ({ default: m.ChatHubTab })));
const FinancialNewsTab = lazy(() => import('./components/FinancialNewsTab').then(m => ({ default: m.FinancialNewsTab })));
const JobSearchTab = lazy(() => import('./components/JobSearchTab').then(m => ({ default: m.JobSearchTab })));
const TravelTripsTab = lazy(() => import('./components/TravelTripsTab').then(m => ({ default: m.TravelTripsTab })));
const PaperTradingTab = lazy(() => import('./components/PaperTradingTab').then(m => ({ default: m.PaperTradingTab })));
const ResumeVaultTab = lazy(() => import('./components/ResumeVaultTab'));
const ExecutiveAiMetaSuiteTab = lazy(() => import('./components/ExecutiveAiMetaSuiteTab').then(m => ({ default: m.ExecutiveAiMetaSuiteTab })));
const ColdEmailSuite = lazy(() => import('./components/dashboard/outreach/ColdEmailSuite').then(m => ({ default: m.ColdEmailSuite })));
const VisaWageLedger = lazy(() => import('./components/dashboard/ledger/VisaWageLedger').then(m => ({ default: m.VisaWageLedger })));
const FinancialLedger = lazy(() => import('./components/dashboard/ledger/FinancialLedger').then(m => ({ default: m.FinancialLedger })));
const StudyEngine = lazy(() => import('./components/dashboard/study/StudyEngine').then(m => ({ default: m.StudyEngine })));
const UniversityCalendar = lazy(() => import('./components/dashboard/calendar/UniversityCalendar').then(m => ({ default: m.UniversityCalendar })));
const ResumeBuilder = lazy(() => import('./components/dashboard/resume/ResumeBuilder').then(m => ({ default: m.ResumeBuilder })));
const PrivacyPolicyTab = lazy(() => import('./components/legal/PrivacyPolicyTab'));
const TermsOfServiceTab = lazy(() => import('./components/legal/TermsOfServiceTab'));

// Code-split 3D background & modals
const Spatial3DCanvas = lazy(() => import('./components/Spatial3DCanvas'));
const GoogleSheetsSyncModal = lazy(() => import('./components/GoogleSheetsSyncModal').then(m => ({ default: m.GoogleSheetsSyncModal })));
const AddApplicationModal = lazy(() => import('./components/AddApplicationModal').then(m => ({ default: m.AddApplicationModal })));
const SettingsDrawer = lazy(() => import('./components/SettingsDrawer').then(m => ({ default: m.SettingsDrawer })));
const InterviewSimulatorDrawer = lazy(() => import('./components/InterviewSimulatorDrawer').then(m => ({ default: m.InterviewSimulatorDrawer })));
const ShareAppModal = lazy(() => import('./components/ShareAppModal').then(m => ({ default: m.ShareAppModal })));
const GeminiDrawer = lazy(() => import('./components/GeminiDrawer').then(m => ({ default: m.GeminiDrawer })));
const DebugConsole = lazy(() => import('./components/DebugConsole').then(m => ({ default: m.DebugConsole })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const ExtraItemsCard = lazy(() => import('./components/ExtraItemsCard').then(m => ({ default: m.ExtraItemsCard })));
const SmartImportModal = lazy(() => import('./components/SmartImportModal').then(m => ({ default: m.SmartImportModal })));
const AiModelSelector = lazy(() => import('./components/AiModelSelector').then(m => ({ default: m.AiModelSelector })));
const JobSyncHub = lazy(() => import('./components/JobSyncHub').then(m => ({ default: m.JobSyncHub })));
const ActivityDrawer = lazy(() => import('./components/ActivityDrawer').then(m => ({ default: m.ActivityDrawer })));
const ConflictModal = lazy(() => import('./components/ConflictModal').then(m => ({ default: m.ConflictModal })));
const UserAuthModal = lazy(() => import('./components/auth/UserAuthModal'));
const ExecutiveSummaryModal = lazy(() => import('./components/dashboard/reports/ExecutiveSummaryModal').then(m => ({ default: m.ExecutiveSummaryModal })));
const BookmarkletModal = lazy(() => import('./components/dashboard/jobs/BookmarkletModal').then(m => ({ default: m.BookmarkletModal })));
const CookieBanner = lazy(() => import('./components/ui/CookieBanner').then(m => ({ default: m.CookieBanner })));

export default function App() {
  const { user, isGuest, isAuthenticated, isLoading } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { requireOwnerPermission, isOwnerVerified } = useOwnerSecurity();
  
  const resolveCurrentTab = (): string => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.replace(/^\/+/, '').toLowerCase();
      if (pathname === 'privacy') return 'privacy';
      if (pathname === 'terms') return 'terms';
      if (pathname === 'workspace' || pathname === 'app') return 'news';

      const hash = window.location.hash.replace(/^#+/, '').toLowerCase();
      if (hash === 'privacy') return 'privacy';
      if (hash === 'terms') return 'terms';
      if (hash === 'landing') return 'landing';
      if (hash === 'workspace' || hash === 'app') return 'news';
      if (hash === 'outreach') return 'outreach';
      if (hash === 'ledger' || hash === 'timesheet') return 'ledger';
      if (hash === 'calendar') return 'calendar';
      if (hash === 'study') return 'study';
      if (hash === 'work') return 'work';
      if (hash === 'resume' || hash === 'skills') return 'resume';
      if (hash && PRIMARY_TABS.includes(hash as any) && hash !== 'landing') return hash;

      const isAuthedCached = localStorage.getItem('manageme_user_profile') || localStorage.getItem('manageme_guest_session') === 'true';
      const lastSaved = localStorage.getItem('manageme_last_active_tab');

      // If user has cached auth session, default to their dashboard tab rather than the landing page
      if (isAuthedCached) {
        if (lastSaved && lastSaved !== 'landing' && PRIMARY_TABS.includes(lastSaved as any)) {
          return lastSaved;
        }
        return 'news';
      }
    }
    return 'landing';
  };

  const initialTab = useMemo(() => resolveCurrentTab(), []);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [tabHistory, setTabHistory] = useState<string[]>([initialTab]);
  const [pendingShare, setPendingShare] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [smartImportScope, setSmartImportScope] = useState<any>('all');
  const [outreachParams, setOutreachParams] = useState<{ company?: string; role?: string } | null>(null);
  const [isAiModelSelectorOpen, setIsAiModelSelectorOpen] = useState(false);
  const [isJobSyncOpen, setIsJobSyncOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState(false);
  const [isBookmarkletModalOpen, setIsBookmarkletModalOpen] = useState(false);
  const [initialImportData, setInitialImportData] = useState<{ text?: string; title?: string; url?: string; autoParse?: boolean } | null>(null);

  // One-time cache migration check to reset stale mock data
  useEffect(() => {
    try {
      const MIGRATION_KEY = 'manageme_cache_migration_v2';
      if (!localStorage.getItem(MIGRATION_KEY)) {
        const mockKeysToReset = [
          'manageme_recruiter_crm',
          'manageme_resume_builder',
          'manageme_skills_vault',
          'manageme_shifts_ledger',
          'manageme_expenses_ledger',
          'manageme_study_engine_data',
          'manageme_chat_messages',
          'manageme_job_applications',
          'manageme_timeline_items',
          'manageme_part_time_roles',
          'manageme_priority_tracker',
          'manageme_key_notes'
        ];
        mockKeysToReset.forEach(k => {
          localStorage.removeItem(k);
        });
        localStorage.setItem(MIGRATION_KEY, 'true');
      }
    } catch {}
  }, []);

  // Auto-redirect authenticated users directly into their dashboard
  useEffect(() => {
    if (!isLoading && (user || isGuest || isAuthenticated)) {
      if (activeTab === 'landing' && window.location.hash !== '#landing') {
        const lastSaved = localStorage.getItem('manageme_last_active_tab');
        const target = (lastSaved && lastSaved !== 'landing' && PRIMARY_TABS.includes(lastSaved as any)) ? lastSaved : 'news';
        handleTabChange(target);
      }
    }
  }, [user, isGuest, isAuthenticated, isLoading, activeTab]);

  useEffect(() => {
    const handleUrlChange = () => {
      const target = resolveCurrentTab();
      if (target && target !== activeTab) {
        setActiveTab(target);
      }
    };
    const handleOpenAuth = () => setIsUserAuthModalOpen(true);

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('openUserAuthModal', handleOpenAuth);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('openUserAuthModal', handleOpenAuth);
    };
  }, [activeTab]);

  const handleTabChange = (newTab: string) => {
    if (!newTab || newTab === activeTab) return;
    setTabHistory(prev => [...prev, newTab]);
    setActiveTab(newTab);
    try {
      localStorage.setItem('manageme_last_active_tab', newTab);
      window.history.pushState({ tab: newTab }, '', `#${newTab}`);
    } catch {
      // safe fallback if sandbox restricts history
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop(); // remove current tab
      const previousTab = nextHistory[nextHistory.length - 1] || 'landing';
      setTabHistory(nextHistory);
      setActiveTab(previousTab);
      try {
        window.history.replaceState({ tab: previousTab }, '', `#${previousTab}`);
      } catch {}
    } else if (window.history.length > 1 && window.location.hash) {
      window.history.back();
    } else {
      setActiveTab('landing');
      setTabHistory(['landing']);
    }
  };

  const handleGoHome = () => {
    if (activeTab !== 'landing') {
      handleTabChange('landing');
    } else {
      // scroll to top smoothly if already on home
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleOpenImport = (e: any) => {
      setSmartImportScope(e.detail?.scope || 'all');
      setIsSmartImportOpen(true);
    };
    window.addEventListener('openSmartImport', handleOpenImport);
    return () => window.removeEventListener('openSmartImport', handleOpenImport);
  }, []);

  useEffect(() => {
    const handleOpenOutreach = (e: any) => {
      if (e.detail?.company) {
        setOutreachParams({ company: e.detail.company, role: e.detail.role });
      }
      handleTabChange('outreach');
    };
    window.addEventListener('openOutreachHub', handleOpenOutreach);
    return () => window.removeEventListener('openOutreachHub', handleOpenOutreach);
  }, []);

  useEffect(() => {
    const handleOpenAiSelector = () => setIsAiModelSelectorOpen(true);
    const handleOpenJobSync = () => setIsJobSyncOpen(true);
    const handleOpenCmdPalette = () => setIsCommandPaletteOpen(true);
    const handleOpenShare = () => setIsShareModalOpen(true);
    const handleOpenExecSummary = () => setIsExecutiveSummaryOpen(true);
    const handleOpenBookmarklet = () => setIsBookmarkletModalOpen(true);

    const checkUrlImportParams = () => {
      if (typeof window === 'undefined') return;

      let params = new URLSearchParams(window.location.search);
      if (window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        hashParams.forEach((val, key) => {
          if (!params.has(key)) params.set(key, val);
        });
      }

      const importText = params.get('importText');
      const importTitle = params.get('importTitle');
      const importUrl = params.get('importUrl');

      if (importText || importTitle || importUrl) {
        setInitialImportData({
          text: importText ? decodeURIComponent(importText) : undefined,
          title: importTitle ? decodeURIComponent(importTitle) : undefined,
          url: importUrl ? decodeURIComponent(importUrl) : undefined,
          autoParse: true
        });
        setActiveTab('jobs');
        setIsAddModalOpen(true);
        const cleanHash = window.location.hash.split('?')[0] || '#jobs';
        window.history.replaceState({}, '', window.location.pathname + cleanHash);
        toast.info('Bookmarklet Ingestion: Parsing job details with AI...');
      }
    };

    checkUrlImportParams();

    window.addEventListener('openAiModelSelector', handleOpenAiSelector);
    window.addEventListener('openJobSyncHub', handleOpenJobSync);
    window.addEventListener('openCommandPalette', handleOpenCmdPalette);
    window.addEventListener('openShareAppModal', handleOpenShare);
    window.addEventListener('openExecutiveSummary', handleOpenExecSummary);
    window.addEventListener('openBookmarkletModal', handleOpenBookmarklet);
    window.addEventListener('hashchange', checkUrlImportParams);

    return () => {
      window.removeEventListener('openAiModelSelector', handleOpenAiSelector);
      window.removeEventListener('openJobSyncHub', handleOpenJobSync);
      window.removeEventListener('openCommandPalette', handleOpenCmdPalette);
      window.removeEventListener('openShareAppModal', handleOpenShare);
      window.removeEventListener('openExecutiveSummary', handleOpenExecSummary);
      window.removeEventListener('openBookmarkletModal', handleOpenBookmarklet);
      window.removeEventListener('hashchange', checkUrlImportParams);
    };
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
        setTabHistory(prev => (prev[prev.length - 1] === e.state.tab ? prev : [...prev, e.state.tab]));
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          setActiveTab(hash);
        } else {
          setActiveTab('landing');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        setIsInputFocused(true);
      }
    };
    const handleFocusOut = () => {
      setIsInputFocused(false);
    };
    
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);
  
  useEffect(() => {
    const handleShare = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPendingShare(customEvent.detail);
      handleTabChange('chat');
    };
    
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      handleTabChange(customEvent.detail);
    };

    window.addEventListener('shareToChat', handleShare);
    window.addEventListener('navigateTab', handleNavigate);
    return () => {
      window.removeEventListener('shareToChat', handleShare);
      window.removeEventListener('navigateTab', handleNavigate);
    };
  }, [activeTab]);

  const { data: userData, updateData, resetToDemoData, loading, conflict, resolveConflict } = useFirestoreData();


  const [googleSyncState, setGoogleSyncState] = useState<GoogleSyncState>({
    isConnected: false,
    userEmail: null,
    spreadsheetId: null,
    spreadsheetUrl: null,
    lastSynced: null,
    isSyncing: false,
    error: null,
    accessToken: null
  });


  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [geminiToast, setGeminiToast] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [quickLog, setQuickLog] = useState<'expense' | 'shift' | 'task' | 'ai' | 'quick' | null>(null);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useScrollLock(!!quickLog);
  useModalDismiss(!!quickLog, () => setQuickLog(null));

  // ── Global Keyboard Shortcuts ──
  useGlobalShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onToggleTheme: () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        updateSettings({ theme: 'light' });
      } else {
        document.documentElement.classList.add('dark');
        updateSettings({ theme: 'obsidian' });
      }
    },
    onSwitchTab: (tab: string) => handleTabChange(tab),
    onCloseModals: () => {
      setIsCommandPaletteOpen(false);
      setIsSettingsOpen(false);
      setIsSmartImportOpen(false);
      setIsAiModelSelectorOpen(false);
      setIsJobSyncOpen(false);
      setIsShareModalOpen(false);
      setQuickLog(null);
    },
    onSave: () => {
      // Dispatch a custom save event so individual tabs can react
      window.dispatchEvent(new CustomEvent('manageme:save'));
    },
  });

  const handleGeminiMutate = (mutations: any) => {
    updateData(mutations);
    const details = Object.keys(mutations).join(', ');
    toast.success(`✨ Gemini updated your settings: ${details}`);
  };

  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  
  useEffect(() => {
    if (loading) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setQuickLog('expense');
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setQuickLog('shift');
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const btn = document.getElementById('geminiAssistantBtn');
        if (btn) btn.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, activeTab, userData]); // Re-run when tab changes


  const sectorsList = useMemo(() => {
    const allSectors = new Set([
      ...((userData && userData.gradSchemes) || []).map(s => s.sector),
      ...((userData && userData.partTimeRoles) || []).map(r => r.sector)
    ]);
    return Array.from(allSectors).sort();
  }, [userData.gradSchemes, userData.partTimeRoles]);

  // Safe Fallback while authenticating or loading workspace dataset during initial hydration
  if ((isLoading || loading || !userData) && activeTab !== 'landing') {
    return (
      <div className="min-h-screen bg-[#0A051A] text-white flex flex-col items-center justify-center space-y-4 font-sans tracking-tight">
        <div className="w-8 h-8 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#8B95A5] tracking-widest uppercase">Loading manageme...</span>
      </div>
    );
  }

  return (
    <SmoothScroll>
      <AnimatePresence mode="wait">
      {activeTab === 'landing' ? (
        <motion.div
          key="landing-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-screen bg-[#000000] text-white flex flex-col font-sans tracking-tight relative overflow-x-hidden"
        >
          <InteractiveCursorGlow />
          <LandingPage onEnterApp={(target) => handleTabChange(target || 'news')} />
          <Suspense fallback={null}>
            <UserAuthModal
              isOpen={isUserAuthModalOpen}
              onClose={() => setIsUserAuthModalOpen(false)}
              onSuccess={() => {
                setIsUserAuthModalOpen(false);
                handleTabChange('news');
              }}
            />
          </Suspense>
          <SpeedInsights />
          <Analytics />
        </motion.div>
      ) : (
        <motion.div
          key="workspace-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0F19] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans tracking-tight selection:bg-[#0052FF] selection:text-white transition-colors duration-200 relative overflow-x-hidden"
        >
          {/* Interactive Cursor Glow (Tracks mouse coordinates in soft electric blue/purple) */}
          <InteractiveCursorGlow />

          {/* Clean Spatial Background Mesh (Lazy-loaded) */}
          <Suspense fallback={null}>
            <Spatial3DCanvas />
          </Suspense>

          <Header 
            activeTab={activeTab} 
            setActiveTab={handleTabChange}
            onGoBack={handleGoBack}
            onGoHome={handleGoHome}
            onExportMultiSheet={() => {
              requireOwnerPermission('Export Master Multi-Sheet Workbook', () => {
                exportMultiSheetWorkbook(
                  userData.timeline,
                  userData.gradSchemes,
                  userData.partTimeRoles,
                  userData.priorityItems,
                  userData.notesSections
                );
              });
            }}
            onOpenGoogleSync={() => {
              requireOwnerPermission('Google Drive / Sheets Synchronization', () => {
                setIsGoogleModalOpen(true);
              });
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenShare={() => setIsShareModalOpen(true)}
            onOpenSmartImport={() => {
              requireOwnerPermission('Smart AI Import & Data Ingestion', () => {
                setIsSmartImportOpen(true);
              });
            }}
            onOpenActivityDrawer={() => setIsActivityDrawerOpen(true)}
            googleSyncState={googleSyncState}
            userData={userData}
            updateData={updateData}
          />

          <main className="flex-1 pb-24 pt-20 sm:pt-24 min-h-0 relative z-10">
            {/* Dynamic Top-Bar Live Stock Ticker */}
            <div className="mb-4">
              <LiveStockTicker />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <Suspense fallback={
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-mono">Loading module...</span>
                </div>
              }>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.2 }}
                  >
              {activeTab === 'landing' && (
                <LandingPage onEnterApp={(target) => handleTabChange(target || 'news')} />
              )}

              {activeTab === 'chat' && (
                <ErrorBoundary fallbackTitle="Chat Workspace Notice" fallbackMessage="The AI Chat Hub encountered an issue. Click retry to recover.">
                  <ChatHubTab userData={userData} updateData={updateData} pendingShare={pendingShare} clearPendingShare={() => setPendingShare(null)} />
                </ErrorBoundary>
              )}
              
              {activeTab === 'news' && (
                <ErrorBoundary fallbackTitle="Financial News Notice" fallbackMessage="The Financial News Feed encountered an issue. Click retry to recover.">
                  <FinancialNewsTab userData={userData} updateData={updateData} />
                </ErrorBoundary>
              )}
              
              {activeTab === 'jobs' && (
                <ErrorBoundary
                  fallbackTitle="Career Pipeline Notice"
                  fallbackMessage="The Career Vault & Applications Pipeline encountered an unexpected state. Click retry to recover."
                >
                  <div className="space-y-8">
                    <JobSearchTab userData={userData} updateData={updateData} />
                    <GraduateSchemesTab 
                      gradSchemes={userData.gradSchemes || []}
                      onUpdateStatus={(id, status) => {
                        updateData({ gradSchemes: (userData.gradSchemes || []).map(s => s.id === id ? { ...s, status } : s) });
                      }}
                      onAddScheme={(newScheme) => {
                        updateData({ gradSchemes: [newScheme as any, ...(userData.gradSchemes || [])] });
                      }}
                      onEditScheme={(id, updated) => {
                        updateData({ gradSchemes: (userData.gradSchemes || []).map(s => s.id === id ? { ...s, ...updated } : s) });
                      }}
                      onDeleteScheme={(id) => {
                        updateData({ gradSchemes: (userData.gradSchemes || []).filter(s => s.id !== id) });
                      }}
                      onUpdateSchemes={(schemes) => {
                        updateData({ gradSchemes: schemes });
                      }}
                      searchQuery={searchQuery}
                      selectedSector={selectedSector}
                    />
                  </div>
                </ErrorBoundary>
              )}

              {activeTab === 'outreach' && (
                <ErrorBoundary
                  fallbackTitle="Outreach CRM Notice"
                  fallbackMessage="The Cold Email & Recruiter CRM Suite encountered an issue. Click retry to recover."
                >
                  <ColdEmailSuite />
                </ErrorBoundary>
              )}
              
              {(activeTab === 'ledger' || activeTab === 'work' || activeTab === 'timesheet') && (
                <ErrorBoundary
                  fallbackTitle="Visa & Wage Ledger Notice"
                  fallbackMessage="Unable to load Visa & Wage Ledger. Click retry to recover."
                >
                  <VisaWageLedger />
                </ErrorBoundary>
              )}
              
              {activeTab === 'trading' && (
                <ErrorBoundary
                  fallbackTitle="Trading Station Notice"
                  fallbackMessage="The Trading Terminal encountered an unexpected state. Click retry to recover."
                >
                  <PaperTradingTab userData={userData} updateData={updateData} />
                </ErrorBoundary>
              )}
              
              {(activeTab === 'travel' || activeTab === 'transit' || activeTab === 'places') && (
                <ErrorBoundary fallbackTitle="Travel & Transit Notice" fallbackMessage="The Travel & Transit planner encountered an issue. Click retry to recover.">
                  <TravelTripsTab 
                    userData={userData} 
                    updateData={updateData} 
                    defaultView={activeTab === 'transit' ? 'transit' : activeTab === 'places' ? 'places' : 'trips'} 
                  />
                </ErrorBoundary>
              )}
              
              {activeTab === 'resume' && (
                <ErrorBoundary
                  fallbackTitle="Resume Builder Notice"
                  fallbackMessage="The ATS Resume Builder & Skills Vault encountered an issue. Click retry to recover."
                >
                  <ResumeBuilder />
                </ErrorBoundary>
              )}
              
              {activeTab === 'metasuite' && (
                <ErrorBoundary fallbackTitle="AI Meta-Suite Notice" fallbackMessage="The Executive AI Meta-Suite encountered an issue. Click retry to recover.">
                  <ExecutiveAiMetaSuiteTab />
                </ErrorBoundary>
              )}
              
              {activeTab === 'finance' && (
                <ErrorBoundary
                  fallbackTitle="Financial Ledger Notice"
                  fallbackMessage="The Financial Ledger encountered a view reset. Click below to reload."
                >
                  <FinanceHubTab userData={userData} updateData={updateData} />
                </ErrorBoundary>
              )}
              
              {activeTab === 'tasks' && (
                <ErrorBoundary fallbackTitle="Tasks & Checklist Notice" fallbackMessage="The Priority Tasks & Master Checklist encountered an issue. Click retry to recover.">
                  <div className="space-y-8">
                    <KeyNotesChecklistTab 
                      notesSections={userData.notesSections || []}
                      onToggleItem={(secId, itemId) => {
                        const newSections = (userData.notesSections || []).map(sec => {
                          if (sec.id === secId) {
                            return {
                              ...sec,
                              items: (sec.items || []).map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
                            };
                          }
                          return sec;
                        });
                        updateData({ notesSections: newSections });
                      }}
                      onUpdateNotesSections={(newSections) => {
                        updateData({ notesSections: newSections });
                      }}
                      searchQuery={searchQuery}
                      universalTasks={userData.universalTasks || []}
                      onUpdateTasks={(tasks) => {
                        updateData({ universalTasks: tasks });
                      }}
                    />
                    <PriorityTrackerTab 
                      priorityItems={userData.priorityItems || []}
                      onUpdateStatus={(id, status) => {
                        updateData({ priorityItems: (userData.priorityItems || []).map(p => p.id === id ? { ...p, status } : p) });
                      }}
                      onUpdateNotes={(id, nextAction, notes) => {
                        updateData({ priorityItems: (userData.priorityItems || []).map(p => p.id === id ? { ...p, nextAction, notes } : p) });
                      }}
                      onAddNewApplication={() => setIsAddModalOpen(true)}
                      searchQuery={searchQuery}
                      selectedSector={selectedSector}
                      userData={userData}
                    />
                    <ExtraItemsCard items={userData.extraItems || []} userData={userData} updateData={updateData} />
                  </div>
                </ErrorBoundary>
              )}
              
              {activeTab === 'skills' && (
                <ErrorBoundary
                  fallbackTitle="Skills Matrix Notice"
                  fallbackMessage="The Skills Matrix & Competency Vault encountered an issue. Click retry to recover."
                >
                  <ResumeBuilder />
                </ErrorBoundary>
              )}

              {activeTab === 'study' && (
                <ErrorBoundary
                  fallbackTitle="Study Engine Notice"
                  fallbackMessage="The Study Engine, CFA Roadmap & Timetable encountered an issue. Click retry to recover."
                >
                  <StudyEngine />
                </ErrorBoundary>
              )}
              
              {(activeTab === 'calendar' || activeTab === 'uni') && (
                <ErrorBoundary
                  fallbackTitle="University Calendar Notice"
                  fallbackMessage="Unable to load University Calendar. Click retry to recover."
                >
                  <UniversityCalendar 
                    userData={userData}
                    updateData={updateData}
                  />
                </ErrorBoundary>
              )}

              {activeTab === 'privacy' && (
                <PrivacyPolicyTab onBack={handleGoBack} />
              )}

              {activeTab === 'terms' && (
                <TermsOfServiceTab onBack={handleGoBack} />
              )}
              
            </motion.div>
          </AnimatePresence>
          </Suspense>
        </div>
        </main>

      <footer className="border-t border-[var(--border)] py-6 px-4 sm:px-6 lg:px-8 bg-[var(--bg)] text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[var(--text-secondary)] flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight font-sans">manageme</span>
            <span className="opacity-40">•</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => handleTabChange('privacy')} 
              className="text-[var(--text-secondary)] hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-[var(--border)]">•</span>
            <button 
              onClick={() => handleTabChange('terms')} 
              className="text-[var(--text-secondary)] hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-[var(--border)]">•</span>
            <button 
              onClick={() => {
                requireOwnerPermission('Reset and Restore Demo Data', () => {
                  if (confirm('Restore default datasets for Graduate Schemes, Skills, Courses, and Tasks?')) {
                    resetToDemoData();
                    alert('Demo datasets restored!');
                  }
                });
              }} 
              className="text-[var(--text-secondary)] hover:text-amber-400 font-medium transition-colors cursor-pointer"
            >
              Reset Demo Data
            </button>
            <button 
              onClick={() => {
                requireOwnerPermission('Add New Scheme or Application', () => {
                  setIsAddModalOpen(true);
                });
              }} 
              className="text-[var(--text-primary)] hover:text-[var(--accent)] font-semibold uppercase tracking-widest transition-colors cursor-pointer"
            >
              + Add App
            </button>
          </div>
        </div>
      </footer>

      


      {/* iOS Style Mobile Bottom Navigation Bar */}
      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={(t) => handleTabChange(t)} 
        onOpenAiAssistant={() => document.getElementById('geminiAssistantBtn')?.click()}
      />
      
      {/* Quick Capture Modals */}

      {quickLog === 'quick' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setQuickLog(null); }}>
          <div className="glass-panel p-6 rounded-2xl w-full max-w-lg relative">
            <button onClick={() => setQuickLog(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-10"><X className="w-5 h-5"/></button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AIAvatar className="w-5 h-5 text-indigo-400"/> AI Quick Capture</h3>
            <p className="text-xs text-[var(--text-primary)] mb-4">Type naturally. Gemini will figure out if it's an expense or a work shift.</p>
            <input type="text" id="quick-ai-input" placeholder="e.g., Paid £12 for lunch at Nando's..." className="apple-input bg-[var(--surface-solid)] border-[var(--border)] w-full mb-4 p-4 text-sm border-transparent" onKeyDown={e => { if (e.key === 'Enter') document.getElementById('quick-ai-btn')?.click(); }} />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-3 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button id="quick-ai-btn" onClick={async () => {
                const btn = document.getElementById('quick-ai-btn') as HTMLButtonElement;
                const input = document.getElementById('quick-ai-input') as HTMLInputElement;
                const text = input.value;
                if (!text) return;
                btn.disabled = true;
                btn.innerText = 'Thinking...';
                try {
                  const res = await fetch('/api/quick-capture', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text}) });
                  const data = await res.json();
                  if (data.type === 'expense') {
                    updateData({ expenses: [{ id: Date.now().toString(), amount: data.data.amount || 0, description: data.data.description || 'Quick AI', category: data.data.category || 'Other', date: data.data.date || new Date().toISOString().split('T')[0] }, ...userData.expenses] });
                    alert('Expense logged successfully!');
                  } else if (data.type === 'shift') {
                    updateData({ workShifts: [{ id: Date.now().toString(), hours: data.data.hours || 0, date: data.data.date || new Date().toISOString().split('T')[0], startTime: data.data.startTime || '09:00', endTime: data.data.endTime || '17:00' }, ...userData.workShifts] });
                    alert('Work shift logged successfully!');
                  } else {
                    alert('Could not determine action from text.');
                  }
                  setQuickLog(null);
                } catch(e:any) {
                  alert(e.message);
                  btn.disabled = false;
                  btn.innerText = 'Parse & Log';
                }
              }} className="flex-1 py-3 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Parse & Log</button>
            </div>
          </div>
        </div>
      )}

      {quickLog === 'expense' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setQuickLog(null); }}>
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm relative">
            <button onClick={() => setQuickLog(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-10"><X className="w-5 h-5"/></button>
            <h3 className="font-bold text-lg mb-4">Quick Log Expense</h3>
            <input type="number" id="quick-expense-amount" placeholder="Amount" className="apple-input bg-[var(--surface-solid)] border-[var(--border)] w-full mb-3 p-3 text-sm border-transparent" />
            <input type="text" id="quick-expense-desc" placeholder="Description" className="apple-input bg-[var(--surface-solid)] border-[var(--border)] w-full mb-4 p-3 text-sm border-transparent" />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-2 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button onClick={() => {
                const amt = Number((document.getElementById('quick-expense-amount') as HTMLInputElement).value);
                const desc = (document.getElementById('quick-expense-desc') as HTMLInputElement).value;
                if (amt && desc) {
                  updateData({ expenses: [{ id: Date.now().toString(), amount: amt, description: desc, category: 'Other', date: new Date().toISOString().split('T')[0] }, ...userData.expenses] });
                  setQuickLog(null);
                }
              }} className="flex-1 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Log Expense</button>
            </div>
          </div>
        </div>
      )}

      {quickLog === 'shift' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setQuickLog(null); }}>
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm relative">
            <button onClick={() => setQuickLog(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-10"><X className="w-5 h-5"/></button>
            <h3 className="font-bold text-lg mb-4">Quick Log Work Shift</h3>
            <input type="date" id="quick-shift-date" defaultValue={new Date().toISOString().split('T')[0]} className="apple-input bg-[var(--surface-solid)] border-[var(--border)] w-full mb-3 p-3 text-sm border-transparent" />
            <input type="number" id="quick-shift-hrs" placeholder="Hours" className="apple-input bg-[var(--surface-solid)] border-[var(--border)] w-full mb-4 p-3 text-sm border-transparent" />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-2 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button onClick={() => {
                const date = (document.getElementById('quick-shift-date') as HTMLInputElement).value;
                const hrs = Number((document.getElementById('quick-shift-hrs') as HTMLInputElement).value);
                if (date && hrs) {
                  updateData({ workShifts: [{ id: Date.now().toString(), date, hours: hrs, startTime: '09:00', endTime: '17:00' }, ...userData.workShifts] });
                  setQuickLog(null);
                }
              }} className="flex-1 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Log Shift</button>
            </div>
          </div>
        </div>
      )}

      {quickLog === 'task' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setQuickLog(null); }}>
          <div className="glass-panel p-6 rounded-2xl w-full max-w-sm relative">
            <button onClick={() => setQuickLog(null)} className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-10"><X className="w-5 h-5"/></button>
            <h3 className="font-bold text-lg mb-4">Quick Add Task</h3>
            <input type="text" id="quick-task-desc" placeholder="Task Description" className="apple-input bg-[var(--surface-solid)] border-[var(--border)] w-full mb-4 p-3 text-sm border-transparent" />
            <div className="flex gap-2">
              <button onClick={() => setQuickLog(null)} className="flex-1 py-2 text-sm bg-transparent border border-[var(--border)] rounded-xl">Cancel</button>
              <button onClick={() => {
                const desc = (document.getElementById('quick-task-desc') as HTMLInputElement).value;
                if (desc) {
                  const newTask: PriorityTrackerItem = {
                    id: Date.now().toString(),
                    rank: (userData.priorityItems?.length || 0) + 1,
                    firm: desc,
                    sector: 'General Task',
                    role: 'Action Item',
                    roleType: 'Grad Scheme',
                    status: 'Not Applied',
                    deadline: 'Immediate',
                    dateApplied: new Date().toISOString().split('T')[0],
                    nextAction: 'Execute task',
                    notes: 'Quick-logged task'
                  };
                  updateData({ priorityItems: [newTask, ...(userData.priorityItems || [])] });
                  setQuickLog(null);
                }
              }} className="flex-1 py-2 text-sm bg-[var(--text-primary)] text-[var(--bg)] font-bold rounded-xl">Add Task</button>
            </div>
          </div>
        </div>
      )}


      {/* Modals & Drawers (Lazy-Loaded) */}
      <Suspense fallback={null}>
        <GoogleSheetsSyncModal 
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          timeline={userData.timeline}
          gradSchemes={userData.gradSchemes}
          partTime={userData.partTimeRoles}
          priorityTracker={userData.priorityItems}
          notesSections={userData.notesSections}
          googleSyncState={googleSyncState}
          onConnectGoogle={async () => {
            await googleSignIn();
          }}
          onCreateGoogleSheet={async () => {
            try {
              let token = await getAccessToken();
              if (!token) {
                const res = await googleSignIn();
                if (res?.accessToken) {
                  token = res.accessToken;
                }
              }
              if (!token) {
                alert("Google authentication required to sync with Google Drive.");
                return;
              }
              const url = await uploadMasterTrackerToGoogleDrive(
                token,
                userData.timeline,
                userData.gradSchemes,
                userData.partTimeRoles,
                userData.priorityItems,
                userData.notesSections
              );
              setGoogleSyncState(prev => ({
                ...prev,
                isConnected: true,
                lastSynced: new Date().toISOString(),
                spreadsheetId: url.spreadsheetId,
                spreadsheetUrl: url.spreadsheetUrl
              }));
            } catch (e) {
              console.error(e);
              alert("Sync failed. Check console.");
            }
          }}
        />
        <AddApplicationModal 
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setInitialImportData(null);
          }}
          initialImportData={initialImportData}
          onAdd={(newApp) => {
            const newItem: PriorityTrackerItem = {
              ...newApp,
              id: Date.now().toString(),
              rank: (userData.priorityItems?.length || 0) + 1
            };
            updateData({ priorityItems: [newItem, ...(userData.priorityItems || [])] });
            setIsAddModalOpen(false);
            setInitialImportData(null);
          }}
        />

        <InterviewSimulatorDrawer isOpen={isInterviewOpen} onClose={() => setIsInterviewOpen(false)} />

        <SettingsDrawer 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          userData={userData} 
          updateData={updateData} 
          onResetDemoData={resetToDemoData}
        />
        
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setIsCommandPaletteOpen(false)} 
          userData={userData} 
          setActiveTab={(tab) => setActiveTab(tab as any)}
          updateData={updateData}
        />

        <GeminiDrawer trackerContext={userData} activeTab={activeTab} onMutateState={handleGeminiMutate} />
        <DebugConsole />

        <ActivityDrawer
          isOpen={isActivityDrawerOpen}
          onClose={() => setIsActivityDrawerOpen(false)}
          userData={userData}
        />

        <SmartImportModal
          isOpen={isSmartImportOpen}
          onClose={() => setIsSmartImportOpen(false)}
          userData={userData}
          updateData={updateData}
          targetScope={smartImportScope}
        />

        <AiModelSelector
          isOpen={isAiModelSelectorOpen}
          onClose={() => setIsAiModelSelectorOpen(false)}
        />

        <JobSyncHub
          isOpen={isJobSyncOpen}
          onClose={() => setIsJobSyncOpen(false)}
          userData={userData}
          updateData={updateData}
        />

        <ShareAppModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />

        <ConflictModal
          isOpen={Boolean(conflict)}
          localData={conflict?.local || userData}
          remoteData={conflict?.remote || userData}
          onResolve={resolveConflict}
        />

        <UserAuthModal
          isOpen={isUserAuthModalOpen}
          onClose={() => setIsUserAuthModalOpen(false)}
          onNavigateLegal={(page) => handleTabChange(page)}
        />

        <ExecutiveSummaryModal
          isOpen={isExecutiveSummaryOpen}
          onClose={() => setIsExecutiveSummaryOpen(false)}
          userData={userData}
        />

        <BookmarkletModal
          isOpen={isBookmarkletModalOpen}
          onClose={() => setIsBookmarkletModalOpen(false)}
        />

        <CookieBanner />
      </Suspense>

      <OwnerAuthModal />
      <DeviceLimitModal />
      <ShortcutDock />

      <SpeedInsights />
      <Analytics />

        </motion.div>
      )}
    </AnimatePresence>
    </SmoothScroll>
  );
}
