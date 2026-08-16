import React from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Activity, 
  GraduationCap, 
  Sparkles, 
  BrainCircuit, 
  ArrowRight, 
  ChevronRight, 
  DollarSign,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TiltCard } from './TiltCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LandingPageProps {
  onEnterApp: (tabId?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { signInAsGuest } = useAuth();
  const { showToast } = useToast();

  const handleLaunch = (targetTab: string = 'news') => {
    onEnterApp(targetTab);
  };

  const handleGuestDemo = () => {
    signInAsGuest();
    showToast('✨ Initialized Guest Demo Workspace! Full dashboard access enabled.', 'sparkle', 3500);
    onEnterApp('news');
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 relative z-10"
    >
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <div className="relative pt-6 sm:pt-12 pb-10 text-center flex flex-col items-center justify-center space-y-6">
        
        {/* Pill Badge */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-zinc-200 shadow-lg shadow-blue-500/5 cursor-default"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-700 dark:text-zinc-300">
            Gemini 2.5 Active &bull; manageme Executive Suite
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          variants={itemVariants}
          className="space-y-4 max-w-4xl"
        >
          <h1 className="text-slate-900 dark:text-white font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.08] drop-shadow-xs">
            Master Markets, Academics & Careers in One Spatial OS
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The next-generation intelligence platform engineered for finance operators, university scholars, and ambitious graduates.
          </p>
        </motion.div>

        {/* Hero Action CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 pt-2 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLaunch('news')}
            className="w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGuestDemo}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-sm border border-amber-500/30 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            title="Instant access with preloaded demo profile (No Google sign-in required)"
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Continue as Guest / Demo Mode</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLaunch('study')}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] rounded-2xl bg-white/60 dark:bg-slate-950/80 hover:bg-white/80 dark:hover:bg-slate-900/80 text-slate-800 dark:text-neutral-200 hover:text-slate-950 dark:hover:text-white font-semibold text-sm border border-slate-200/50 dark:border-white/10 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Study Intelligence Engine</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLaunch('trading')}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] rounded-2xl bg-white/60 dark:bg-slate-950/80 hover:bg-white/80 dark:hover:bg-slate-900/80 text-slate-800 dark:text-neutral-200 hover:text-slate-950 dark:hover:text-white font-semibold text-sm border border-slate-200/50 dark:border-white/10 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Paper Trading Sandbox</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.dispatchEvent(new CustomEvent('openShareAppModal'))}
            className="w-full sm:w-auto px-5 py-3.5 min-h-[44px] rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold text-sm border border-blue-500/30 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            title="Share manageme link & invite colleagues"
          >
            <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Share & Invite</span>
          </motion.button>
        </motion.div>

        {/* Live Interactive Hero Mockup Card with 3D Parallax & Frosted Glass */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-5xl mt-6"
        >
          <TiltCard maxTilt={3} scale={1.01}>
            <div className="bg-white/60 dark:bg-slate-950/80 border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6 text-left relative overflow-hidden">
              
              {/* Subtle decorative glow orb */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Mockup Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm"></div>
                  <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 ml-2">manageme.intelligence.terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold">
                    Live Stream: Connected
                  </span>
                </div>
              </div>

              {/* Mockup Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                
                {/* Micro Widget 1 */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-slate-200/60 dark:border-white/10 space-y-2 backdrop-blur-md shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">S&P 500 &bull; LIVE</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">+0.54%</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white block">$5,984.20</span>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-tight">
                    Dovish Fed signals drive broad index momentum across tech & energy.
                  </p>
                </motion.div>

                {/* Micro Widget 2 */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-slate-200/60 dark:border-white/10 space-y-2 backdrop-blur-md shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">AI STUDY ENGINE</span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-300 font-bold">80/20 Cram</span>
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">Corporate Valuation (DCF)</span>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-tight">
                    3 core formulas, 5 frequently tested exam concepts, and model answers.
                  </p>
                </motion.div>

                {/* Micro Widget 3 */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-slate-200/60 dark:border-white/10 space-y-2 backdrop-blur-md shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">MARKET IMPACT AGENT</span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-300 font-bold">Active</span>
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">NVIDIA Blackwell Compute</span>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-tight">
                    Multiples expansion & supply chain sensitivity breakdown ready.
                  </p>
                </motion.div>

              </div>

              {/* Bottom Quick Trigger Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
                <span className="text-slate-500 dark:text-neutral-400 font-mono">
                  Quick Query: <span className="text-slate-800 dark:text-neutral-200">"Analyze impact of central bank rate decisions on LBO leverage"</span>
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLaunch('news')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Simulate in Feed</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>

            </div>
          </TiltCard>
        </motion.div>

      </div>

      {/* ========================================================================= */}
      {/* 2. FEATURE BENTO GRID */}
      {/* ========================================================================= */}
      <div className="space-y-8 pt-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Engineered Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            A Complete High-Yield Ecosystem
          </h2>
          <p className="text-sm text-slate-600 dark:text-neutral-400 max-w-xl mx-auto">
            Explore dedicated modules designed for academic mastery, career progression, and live market intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Live Financial Intelligence */}
          <TiltCard maxTilt={3} scale={1.01}>
            <motion.div 
              whileHover={{ y: -2 }}
              onClick={() => handleLaunch('news')}
              className="h-full bg-white/60 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shadow-inner">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  Financial News & AI Market Impact
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Real-time market tickers, live macro news feeds, and Gemini-powered impact analysis evaluating sector exposure and DCF multiples.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Open Intelligence Feed</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </TiltCard>

          {/* Card 2: Academic Intelligence Engine */}
          <TiltCard maxTilt={3} scale={1.01}>
            <motion.div 
              whileHover={{ y: -2 }}
              onClick={() => handleLaunch('study')}
              className="h-full bg-white/60 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:border-purple-500/50 hover:shadow-purple-500/10 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  Study Intelligence & Snap & Solve
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Pareto 80/20 Cram Guides, AI Mock Exams, multimodal problem solving from photos, active recall flashcards, and Feynman critiques.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>Launch Study Engine</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </TiltCard>

          {/* Card 3: Executive AI MetaSuite */}
          <TiltCard maxTilt={3} scale={1.01}>
            <motion.div 
              whileHover={{ y: -2 }}
              onClick={() => handleLaunch('metasuite')}
              className="h-full bg-white/60 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  Executive AI MetaSuite
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Deep Research workflows, multi-model consensus across leading models, annual report variance breakdown, and pitch deck audits.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Explore MetaSuite</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </TiltCard>

          {/* Card 4: Paper Trading Sandbox */}
          <TiltCard maxTilt={3} scale={1.01}>
            <motion.div 
              whileHover={{ y: -2 }}
              onClick={() => handleLaunch('trading')}
              className="h-full bg-white/60 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shadow-inner">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  Paper Trading & Portfolio Sandbox
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Risk-free simulated execution on live equities, crypto, and commodities with interactive order routing and volatility profiles.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Open Trading Desk</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </TiltCard>

          {/* Card 5: Career Vault & Applications */}
          <TiltCard maxTilt={3} scale={1.01}>
            <motion.div 
              whileHover={{ y: -2 }}
              onClick={() => handleLaunch('jobs')}
              className="h-full bg-white/60 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:border-amber-500/50 hover:shadow-amber-500/10 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shadow-inner">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  Career Vault & Graduate Schemes
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Kanban pipeline for investment banking and consulting roles, automated cold-outreach composer, and live job alerts.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <span>View Career Pipeline</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </TiltCard>

          {/* Card 6: Finance Hub & Calculators */}
          <TiltCard maxTilt={3} scale={1.01}>
            <motion.div 
              whileHover={{ y: -2 }}
              onClick={() => handleLaunch('finance')}
              className="h-full bg-white/60 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  Personal Finance & Calculators
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Interactive recurring subscription manager, vehicle net cost calculator, live FX spot converter, and budget allocations.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                <span>Launch Finance Hub</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </TiltCard>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. METRICS TICKER & PERFORMANCE HIGHLIGHTS */}
      {/* ========================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/60 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xl"
      >
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">0.8s</span>
          <span className="text-xs text-slate-600 dark:text-neutral-400 block mt-1 font-medium">Average AI Response</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">100%</span>
          <span className="text-xs text-slate-600 dark:text-neutral-400 block mt-1 font-medium">Client-Side Persistence</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">60 FPS</span>
          <span className="text-xs text-slate-600 dark:text-neutral-400 block mt-1 font-medium">Smooth UI Performance</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">14+</span>
          <span className="text-xs text-slate-600 dark:text-neutral-400 block mt-1 font-medium">Integrated Career Tools</span>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-6 overflow-hidden shadow-2xl"
      >
        <div className="space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Ready to accelerate your workflow?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300">
            Open the live workspace now and experience intelligent academic and market tooling.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLaunch('news')}
            className="w-full sm:w-auto px-8 py-3.5 min-h-[44px] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Enter manageme Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default LandingPage;
