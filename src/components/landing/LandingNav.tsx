// Component: Landing Page Top Navigation Bar

import React from 'react';
import { ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthButton } from '../auth/GoogleAuthButton';
import { Button } from '../ui/Button';

export interface LandingNavProps {
  onEnterApp: (tabId?: string) => void;
  onOpenAuthModal?: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  onEnterApp,
  onOpenAuthModal
}) => {
  const { user, isGuest, isAuthenticated, signInAsGuest } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/[0.08] bg-black/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-3 items-center">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0052FF] to-[#00FF66] p-0.5 shadow-lg shadow-[#0052FF]/20">
            <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center">
              <span className="font-mono font-bold text-xs text-white">M</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white font-sans flex items-center gap-1.5">
              manageme
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">v2.5</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">Study & Career OS</span>
          </div>
        </div>

        {/* Center: Interactive Pills */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-3" />
            SYS: ONLINE
          </span>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-slate-300">
            <Sparkles className="w-3 h-3 text-[#0052FF]" />
            <span>Dual Gemini 2.5</span>
          </div>
        </div>

        {/* Right: Auth & Launch Actions */}
        <div className="flex items-center justify-end gap-2.5">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEnterApp('news')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Enter Workspace
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  signInAsGuest();
                  onEnterApp('trading');
                }}
                className="hidden sm:inline-flex text-xs"
              >
                Guest Demo
              </Button>
              <GoogleAuthButton onSuccess={() => onEnterApp('news')} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingNav;
