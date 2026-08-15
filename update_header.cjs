const fs = require('fs');

const headerCode = `import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Cloud, Upload, FileSpreadsheet, Settings, User, Sun, Moon } from 'lucide-react';
import { GoogleSyncState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from '../firebase';
import { UserTrackerData } from '../hooks/useFirestoreData';

export type AppTab = 'news' | 'jobs' | 'work' | 'trading' | 'travel' | 'transit' | 'finance' | 'tasks' | 'skills' | 'uni' | 'places';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onExportMultiSheet: () => void;
  onOpenGoogleSync: () => void;
  onOpenSettings: () => void;
  googleSyncState: GoogleSyncState;
  userData: UserTrackerData;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportMultiSheet,
  onOpenGoogleSync,
  onOpenSettings,
  googleSyncState,
  userData
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
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

  const [userName, setUserName] = useState<string>('Guest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
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

  const menuItems: { id: AppTab; label: string; icon?: string }[] = [
    { id: 'news', label: '📰 Financial News & Intelligence' },
    { id: 'jobs', label: '💼 Linked Job Search & Grad Schemes' },
    { id: 'work', label: '🕒 Part-Time Work & Timesheet' },
    { id: 'trading', label: '📈 Paper Trading & Academy' },
    { id: 'travel', label: '✈️ Trip Planning & Travel Suite' },
    { id: 'transit', label: '🚌 Bus & Train Transit Hub' },
    { id: 'finance', label: '💰 Finance & Expense Engine' },
    { id: 'tasks', label: '⏳ Priority, Tasks & Checklist' },
    { id: 'skills', label: '🎯 Skills Roadmap & Career Prep' },
    { id: 'uni', label: '📅 Timetable & Event Calendar' },
    { id: 'places', label: '📍 Places to Visit & Wishlist' }
  ];

  return (
    <>
      <header className={\`fixed top-0 left-0 right-0 z-40 transition-all duration-300 \${
        isScrolled ? 'glass-panel border-b border-[var(--border)] shadow-sm py-2' : 'bg-transparent py-4'
      }\`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Brand / User */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && auth.currentUser?.photoURL ? (
                <img 
                  src={auth.currentUser.photoURL} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full cursor-pointer border border-[rgba(255,255,255,0.2)] hover:opacity-80 transition-opacity"
                  onClick={handleLogin}
                  title="Click to logout"
                />
              ) : (
                <div onClick={handleLogin} title="Click to login" className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.1)] text-[var(--text-primary)] flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.2)] transition-colors">
                  <User className="w-4 h-4" />
                </div>
              )}
              <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight">
                {userName}'s Dashboard
              </span>
            </div>

            {/* Right: Hamburger Menu & Theme Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 text-[var(--text-secondary)] hover:bg-[rgba(128,128,128,0.1)] hover:text-[var(--text-primary)] rounded-full transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 text-[var(--text-primary)] hover:bg-[rgba(128,128,128,0.1)] rounded-full transition-colors"
                title="Open Navigation"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm glass-panel border-l border-[var(--border)] z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Navigation</h2>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 bg-[rgba(255,255,255,0.05)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 px-3 hide-scrollbar">
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setDrawerOpen(false);
                      }}
                      className={\`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 \${
                        activeTab === item.id 
                          ? 'bg-[var(--accent)] text-white font-bold shadow-md'
                          : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] font-medium'
                      }\`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions Footer */}
              <div className="p-6 border-t border-[var(--border)] bg-[rgba(0,0,0,0.2)]">
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => { onOpenGoogleSync(); setDrawerOpen(false); }} className="flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] p-3 rounded-xl transition-colors">
                    <Cloud className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Sync</span>
                  </button>
                  <button onClick={() => { onExportMultiSheet(); setDrawerOpen(false); }} className="flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] p-3 rounded-xl transition-colors">
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Export</span>
                  </button>
                  <button onClick={() => { onOpenSettings(); setDrawerOpen(false); }} className="flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] p-3 rounded-xl transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Settings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
`;
fs.writeFileSync('src/components/Header.tsx', headerCode);
