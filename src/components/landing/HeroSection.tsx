// Component: Landing Page Hero Section & Interactive OS Showcase

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Briefcase, GraduationCap, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthButton } from '../auth/GoogleAuthButton';
import { Button } from '../ui/Button';

export interface HeroSectionProps {
  onEnterApp: (tabId?: string) => void;
  onScrollToFeatures?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEnterApp,
  onScrollToFeatures
}) => {
  const { signInAsGuest } = useAuth();

  return (
    <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
      {/* Top Release Pill */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 mb-6 backdrop-blur-md hover:border-[#0052FF]/50 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
        <span>Unified Spatial Operating System for High Performers</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl leading-[1.08]"
      >
        Master your markets. <br />
        <span className="bg-gradient-to-r from-[#0052FF] via-[#00D2FF] to-[#00FF66] bg-clip-text text-transparent">
          Engineer your trajectory.
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl font-sans leading-relaxed"
      >
        A high-frequency desktop ecosystem unifying multi-asset trading, career pipeline CRM, study intelligence, and visa expense ledgers.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <GoogleAuthButton onSuccess={() => onEnterApp('news')} />
        
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            signInAsGuest();
            onEnterApp('trading');
          }}
          leftIcon={<Activity className="w-4 h-4 text-emerald-400" />}
        >
          Explore Guest Sandbox
        </Button>
      </motion.div>

      {/* Interactive Quick-Metrics Bar */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl"
      >
        {[
          { icon: TrendingUp, label: 'Paper Trading', val: 'Multi-Asset Terminal', tab: 'trading', color: 'text-[#0052FF]' },
          { icon: Briefcase, label: 'Career Vault', val: 'Graduate Schemes CRM', tab: 'jobs', color: 'text-amber-400' },
          { icon: GraduationCap, label: 'Study Engine', val: 'AI Notebooks & Flashcards', tab: 'study', color: 'text-emerald-400' },
          { icon: ShieldCheck, label: 'Ledger & Visa', val: 'Zero-Trust Vault', tab: 'finance', color: 'text-purple-400' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onEnterApp(item.tab)}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] font-mono text-slate-400 uppercase">{item.label}</p>
              <p className="text-xs font-semibold text-white mt-0.5 truncate">{item.val}</p>
            </button>
          );
        })}
      </motion.div>
    </section>
  );
};

export default HeroSection;
