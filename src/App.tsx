import { motion, AnimatePresence } from 'motion/react';
import { AIAvatar } from "./components/AIAvatar";
import React, { useState, useMemo, useEffect } from 'react';
import { initAuth, googleSignIn, logout, getAccessToken } from './firebase';
import { Header } from './components/Header';
import { CompactToolbar } from './components/CompactToolbar';
import { TimelineTab } from './components/TimelineTab';
import { GraduateSchemesTab } from './components/GraduateSchemesTab';
import { PartTimeRolesTab } from './components/PartTimeRolesTab';
import { PriorityTrackerTab } from './components/PriorityTrackerTab';
import { KeyNotesChecklistTab } from './components/KeyNotesChecklistTab';
import { SkillsTrackerTab } from './components/SkillsTrackerTab';
import { FinanceHubTab } from './components/FinanceHubTab';
import { UniTimetableTab } from './components/UniTimetableTab';
import { ChatHubTab } from './components/ChatHubTab';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { AddApplicationModal } from './components/AddApplicationModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { InterviewSimulatorDrawer } from './components/InterviewSimulatorDrawer';

import { DollarSign, Clock, CheckSquare, Sparkles, ChevronDown, ChevronUp, X, Terminal } from 'lucide-react';
import { GeminiDrawer } from './components/GeminiDrawer';
import { DebugConsole } from './components/DebugConsole';
import { CommandPalette } from './components/CommandPalette';

import { FinancialNewsTab } from './components/FinancialNewsTab';
import { JobSearchTab } from './components/JobSearchTab';
import { TravelTripsTab } from './components/TravelTripsTab';
import { PaperTradingTab } from './components/PaperTradingTab';
import ResumeVaultTab from './components/ResumeVaultTab';
import { ExecutiveAiMetaSuiteTab } from './components/ExecutiveAiMetaSuiteTab';
import { StudyIntelligenceEngineTab } from './components/StudyIntelligenceEngineTab';

import { ExtraItemsCard } from './components/ExtraItemsCard';
import { SmartImportModal } from './components/SmartImportModal';
import { OutreachHub } from './components/OutreachHub';
import { AiModelSelector } from './components/AiModelSelector';
import { JobSyncHub } from './components/JobSyncHub';
import { ActivityDrawer } from './components/ActivityDrawer';
import { Spatial3DCanvas } from './components/Spatial3DCanvas';
import { LiveStockTicker } from './components/LiveStockTicker';
import { LandingPage } from './components/LandingPage';
import { triggerHaptic, IOS_SPRING } from './utils/haptics';
import { AppTab } from './components/Header';

const PRIMARY_TABS: AppTab[] = ['landing', 'news', 'study', 'metasuite', 'jobs', 'outreach', 'tasks', 'uni', 'finance', 'trading', 'work', 'skills', 'travel', 'transit', 'chat', 'resume'];
import { MobileBottomNav } from './components/MobileBottomNav';

import { GoogleSyncState, GraduateScheme, PartTimeRole, PriorityTrackerItem } from './types';

import { exportMultiSheetWorkbook } from './utils/excelExporter';
import { uploadMasterTrackerToGoogleDrive } from './utils/googleDriveUpload';
import { useFirestoreData } from './hooks/useFirestoreData';
import { ConflictModal } from './components/ConflictModal';
import { useSettings } from './context/SettingsContext';
import { useOwnerSecurity } from './context/OwnerSecurityContext';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { DeviceLimitModal } from './components/DeviceLimitModal';
import { ShortcutDock } from './components/ShortcutDock';
import { useScrollLock } from './hooks/useScrollLock';
import { useModalDismiss } from './hooks/useModalDismiss';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const { settings, updateSettings } = useSettings();
  const { requireOwnerPermission, isOwnerVerified } = useOwnerSecurity();
  const initialTab = (typeof window !== 'undefined' && window.location.hash.replace('#', '')) || 'landing';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [tabHistory, setTabHistory] = useState<string[]>([initialTab]);
  const [pendingShare, setPendingShare] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [smartImportScope, setSmartImportScope] = useState<any>('all');
  const [outreachParams, setOutreachParams] = useState<{ company?: string; role?: string } | null>(null);
  const [isAiModelSelectorOpen, setIsAiModelSelectorOpen] = useState(false);
  const [isJobSyncOpen, setIsJobSyncOpen] = useState(false);

  const handleTabChange = (newTab: string) => {
    if (!newTab || newTab === activeTab) return;
    setTabHistory(prev => [...prev, newTab]);
    setActiveTab(newTab);
    try {
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
    window.addEventListener('openAiModelSelector', handleOpenAiSelector);
    window.addEventListener('openJobSyncHub', handleOpenJobSync);
    window.addEventListener('openCommandPalette', handleOpenCmdPalette);
    return () => {
      window.removeEventListener('openAiModelSelector', handleOpenAiSelector);
      window.removeEventListener('openJobSyncHub', handleOpenJobSync);
      window.removeEventListener('openCommandPalette', handleOpenCmdPalette);
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

  const [needsAuth, setNeedsAuth] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => { setNeedsAuth(false); setAuthToken(token); },
      () => { setNeedsAuth(true); setAuthToken(null); }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setNeedsAuth(false);
        setAuthToken(res.accessToken);
      }
    } catch (e) { console.error("Login failed", e); }
  };


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
    setGeminiToast(`✨ Gemini updated your settings: ${details}`);
    setTimeout(() => setGeminiToast(null), 5000);
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

    // Slight delay to ensure DOM is ready

    return () => window.removeEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      const cards = gsap.utils.toArray('.glass-panel');
      cards.forEach((card: HTMLElement) => {
        gsap.fromTo(card,
          { y: 20, opacity: 0 },
          {
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=50",
              toggleActions: "play none none reverse"
            },
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
          }
        );
      });
      ScrollTrigger.refresh();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loading, activeTab, userData]); // Re-run when tab changes


  const sectorsList = useMemo(() => {
    const allSectors = new Set([
      ...((userData && userData.gradSchemes) || []).map(s => s.sector),
      ...((userData && userData.partTimeRoles) || []).map(r => r.sector)
    ]);
    return Array.from(allSectors).sort();
  }, [userData.gradSchemes, userData.partTimeRoles]);

  if (loading) {
    return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-white">Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-white transition-colors duration-300 relative overflow-x-hidden">

      {/* Clean Spatial Background Mesh */}
      <Spatial3DCanvas />


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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_: any, info: any) => {
                const offsetX = info.offset.x;
                const offsetY = info.offset.y;
                const velocityX = info.velocity.x;
                // Only switch tabs if horizontal intent dominates vertical scrolling
                if (Math.abs(offsetX) > Math.abs(offsetY) * 1.5 && Math.abs(offsetX) > 75) {
                  const currentIndex = PRIMARY_TABS.indexOf(activeTab as AppTab);
                  if (currentIndex !== -1) {

                    if (offsetX < -75 || velocityX < -250) {
                      const nextIndex = (currentIndex + 1) % PRIMARY_TABS.length;
                      triggerHaptic(15);
                      setActiveTab(PRIMARY_TABS[nextIndex]);
                    } else if (offsetX > 75 || velocityX > 250) {
                      const prevIndex = (currentIndex - 1 + PRIMARY_TABS.length) % PRIMARY_TABS.length;
                      triggerHaptic(15);
                      setActiveTab(PRIMARY_TABS[prevIndex]);
                    }
                  }
                }
              }}
              transition={IOS_SPRING}
            >
              {activeTab === 'landing' && (
                <LandingPage onEnterApp={(target) => handleTabChange(target || 'news')} />
              )}

              {activeTab === 'chat' && <ChatHubTab userData={userData} updateData={updateData} pendingShare={pendingShare} clearPendingShare={() => setPendingShare(null)} />}
              
              {activeTab === 'study' && <StudyIntelligenceEngineTab userData={userData} updateData={updateData} />}

              {activeTab === 'news' && <FinancialNewsTab userData={userData} updateData={updateData} />}
              
              {activeTab === 'jobs' && (
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
              )}

              {activeTab === 'outreach' && (
                <OutreachHub
                  initialCompany={outreachParams?.company || 'Goldman Sachs'}
                  initialRole={outreachParams?.role || 'Summer Analyst - M&A Advisory'}
                />
              )}
              
              {activeTab === 'work' && (
                <PartTimeRolesTab 
                  roles={userData.partTimeRoles}
                  shifts={userData.workShifts}
                  updateData={updateData}
                />
              )}
              
              {activeTab === 'trading' && <PaperTradingTab userData={userData} updateData={updateData} />}
              
              {(activeTab === 'travel' || activeTab === 'transit' || activeTab === 'places') && (
                <TravelTripsTab 
                  userData={userData} 
                  updateData={updateData} 
                  defaultView={activeTab === 'transit' ? 'transit' : activeTab === 'places' ? 'places' : 'trips'} 
                />
              )}
              
              {activeTab === 'resume' && <ResumeVaultTab />}
              {activeTab === 'metasuite' && <ExecutiveAiMetaSuiteTab />}
              
              {activeTab === 'finance' && <FinanceHubTab userData={userData} updateData={updateData} />}
              
              {activeTab === 'tasks' && (
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
              )}
              
              {activeTab === 'skills' && (
                <SkillsTrackerTab 
                  skills={userData.skillsTracker || []}
                  setSkills={(newSkillsOrFn) => {
                     const nextSkills = typeof newSkillsOrFn === 'function' ? newSkillsOrFn(userData.skillsTracker || []) : newSkillsOrFn;
                     updateData({ skillsTracker: nextSkills });
                  }}
                  courses={userData.courses || []}
                  setCourses={(newCoursesOrFn) => {
                     const nextCourses = typeof newCoursesOrFn === 'function' ? newCoursesOrFn(userData.courses || []) : newCoursesOrFn;
                     updateData({ courses: nextCourses });
                  }}
                  userData={userData}
                  updateData={updateData}
                />
              )}
              
              {activeTab === 'uni' && (
                <UniTimetableTab 
                  userData={userData}
                  updateData={updateData}
                />
              )}
              
            </motion.div>
          </AnimatePresence>
        </div>
        </main>

      <footer className="border-t border-[var(--border)] py-6 px-4 sm:px-6 lg:px-8 bg-[var(--bg)] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-space-mono text-[var(--text-secondary)] flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] text-sm tracking-tight font-sans">manageme</span>
            <span className="opacity-40">•</span>
            <span>manageme • All Rights Reserved</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                requireOwnerPermission('Reset and Restore Demo Data', () => {
                  if (confirm('Restore default datasets for Graduate Schemes, Skills, Courses, and Tasks?')) {
                    resetToDemoData();
                    alert('Demo datasets restored!');
                  }
                });
              }} 
              className="text-[var(--text-secondary)] hover:text-amber-400 font-medium transition-colors"
            >
              Reset Demo Data
            </button>
            <button 
              onClick={() => {
                requireOwnerPermission('Add New Scheme or Application', () => {
                  setIsAddModalOpen(true);
                });
              }} 
              className="text-[var(--text-primary)] hover:text-[var(--accent)] font-semibold uppercase tracking-widest transition-colors"
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


      {/* Modals & Drawers */}
      <GoogleSheetsSyncModal 
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        timeline={userData.timeline}
        gradSchemes={userData.gradSchemes}
        partTime={userData.partTimeRoles}
        priorityTracker={userData.priorityItems}
        notesSections={userData.notesSections}
        googleSyncState={googleSyncState}
        onConnectGoogle={() => console.log('Connect to Google')}
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
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(newApp) => {
          const newItem: PriorityTrackerItem = {
            ...newApp,
            id: Date.now().toString(),
            rank: (userData.priorityItems?.length || 0) + 1
          };
          updateData({ priorityItems: [newItem, ...(userData.priorityItems || [])] });
          setIsAddModalOpen(false);
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

      <OwnerAuthModal />
      <DeviceLimitModal />
      <ShortcutDock />

      <ConflictModal
        isOpen={Boolean(conflict)}
        localData={conflict?.local || userData}
        remoteData={conflict?.remote || userData}
        onResolve={resolveConflict}
      />
      <SpeedInsights />
      <Analytics />

    </div>
  );
}
