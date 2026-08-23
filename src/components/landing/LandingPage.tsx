// Component: Landing Page Orchestrator View

import React, { useState, useEffect } from 'react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { FeatureGrid } from './FeatureGrid';
import { InteractiveCursorGlow } from '../canvas/InteractiveCursorGlow';
import { Sparkles, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

export interface LandingPageProps {
  onEnterApp: (tabId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">Initializing manageme...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-[#0052FF] selection:text-white">
      {/* Interactive Cursor Glow Layer */}
      <InteractiveCursorGlow />

      {/* Ambient Background Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#0052FF]/10 via-[#0052FF]/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[45%] -left-40 w-[600px] h-[600px] bg-[#0052FF]/5 blur-[160px] rounded-full" />
        <div className="absolute top-[75%] -right-40 w-[600px] h-[600px] bg-[#00FF66]/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* Top Navbar */}
      <LandingNav onEnterApp={onEnterApp} />

      {/* Hero Section */}
      <HeroSection onEnterApp={onEnterApp} />

      {/* Feature Grid & Architectural Showcase */}
      <FeatureGrid onEnterApp={onEnterApp} />

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 max-w-5xl mx-auto text-center relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/10 backdrop-blur-xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Ready to elevate your career and markets?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 mb-6">
            Join the executive workstation designed for serious finance applicants and traders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onEnterApp('news')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Master Workspace
            </Button>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-slate-500 font-mono relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-sans text-sm">manageme</span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#privacy" onClick={() => onEnterApp('privacy')} className="hover:text-white transition-colors">Privacy</a>
            <span>•</span>
            <a href="#terms" onClick={() => onEnterApp('terms')} className="hover:text-white transition-colors">Terms</a>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
