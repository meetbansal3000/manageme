// Component: Dashboard TopBar & System Header

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Settings, 
  Share2, 
  Cloud, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Moon, 
  Sun,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOwnerSecurity } from '../../../context/OwnerSecurityContext';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../ui/Button';

export interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  onOpenSettings?: () => void;
  onOpenShare?: () => void;
  onOpenGoogleSync?: () => void;
  onOpenMenu?: () => void;
  isSyncing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onGoBack,
  onGoHome,
  onOpenSettings,
  onOpenShare,
  onOpenGoogleSync,
  onOpenMenu,
  isSyncing = false
}) => {
  const { user, isGuest, isAuthenticated } = useAuth();
  const { isOwnerVerified, openAuthModal, lockOwnerSession } = useOwnerSecurity();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Brand & Navigation Back */}
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onGoHome || (() => setActiveTab('landing'))}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0052FF] to-[#00FF66] p-0.5 shadow-md shadow-[#0052FF]/20">
            <div className="w-full h-full bg-black rounded-[5px] flex items-center justify-center">
              <span className="font-mono font-bold text-[11px] text-white">M</span>
            </div>
          </div>
          <span className="font-bold text-white text-sm tracking-tight hidden sm:inline-block">
            manageme
          </span>
        </button>

        {activeTab !== 'landing' && onGoBack && (
          <button
            onClick={onGoBack}
            className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        {/* Current Tab Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {activeTab}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2">
        {/* Google Sync Button */}
        {onOpenGoogleSync && (
          <button
            onClick={onOpenGoogleSync}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative"
            title="Google Drive / Sheets Sync"
          >
            <Cloud className={`w-4 h-4 ${isSyncing ? 'text-blue-400 animate-pulse' : ''}`} />
          </button>
        )}

        {/* Share App */}
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
            title="Share Workspace"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="cursor-pointer hover:bg-neutral-800/50 p-2 rounded-lg transition-colors text-neutral-400 hover:text-white"
          title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
          aria-label={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Owner Security Lock */}
        <button
          onClick={isOwnerVerified ? lockOwnerSession : () => openAuthModal('Manage Workspace Permissions')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
            isOwnerVerified
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title={isOwnerVerified ? 'Owner Verified (Click to lock)' : 'Guest Mode (Click to authenticate)'}
        >
          {isOwnerVerified ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isOwnerVerified ? 'Verified' : 'Owner'}</span>
        </button>

        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
