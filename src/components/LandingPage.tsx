import React from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  Activity, 
  GraduationCap, 
  Sparkles, 
  BrainCircuit, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle, 
  Layers, 
  Target, 
  DollarSign, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TiltCard } from './TiltCard';

interface LandingPageProps {
  onEnterApp: (tabId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const handleLaunch = (targetTab: string = 'news') => {
    onEnterApp(targetTab);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 animate-in fade-in duration-700">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <div className="relative pt-6 sm:pt-12 pb-10 text-center flex flex-col items-center justify-center space-y-6">
        
        {/* Apple Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-sm transition-all cursor-default"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase">
            Gemini 2.5 Active &bull; manageme Executive Suite
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-4xl"
        >
          <h1 className="text-slate-900 dark:text-slate-100 font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.08]">
            Master Markets, Academics & Careers in One Spatial OS
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            The next-generation intelligence platform engineered for finance operators, university scholars, and ambitious graduates.
          </p>
        </motion.div>

        {/* Hero Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full sm:w-auto"
        >
          <button
            onClick={() => handleLaunch('news')}
            className="w-full sm:w-auto px-7 py-3.5 min-h-[44px] rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleLaunch('study')}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] rounded-2xl bg-white dark:bg-neutral-900/80 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-white/15 backdrop-blur-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Study Intelligence Engine</span>
          </button>

          <button
            onClick={() => handleLaunch('trading')}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[44px] rounded-2xl bg-white dark:bg-neutral-900/80 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-white/15 backdrop-blur-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Paper Trading Sandbox</span>
          </button>
        </motion.div>

        {/* Live Interactive Hero Mockup Card with 3D Parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl mt-6"
        >
          <TiltCard maxTilt={4} scale={1.01}>
            <div className="bg-white dark:bg-neutral-950/80 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6 text-left relative overflow-hidden">
              
              {/* Top Mockup Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 ml-2">manageme.intelligence.terminal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Live Stream: Connected
                  </span>
                </div>
              </div>

              {/* Mockup Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Micro Widget 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">S&P 500 &bull; LIVE</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">+0.54%</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white block">$5,984.20</span>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-tight">
                    Dovish Fed signals drive broad index momentum across tech & energy.
                  </p>
                </div>

                {/* Micro Widget 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">AI STUDY ENGINE</span>
                    <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 font-bold">80/20 Cram</span>
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">Corporate Valuation (DCF)</span>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-tight">
                    3 core formulas, 5 frequently tested exam concepts, and model answers.
                  </p>
                </div>

                {/* Micro Widget 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">MARKET IMPACT AGENT</span>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-bold">Active</span>
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">NVIDIA Blackwell Compute</span>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-tight">
                    Multiples expansion & supply chain sensitivity breakdown ready.
                  </p>
                </div>

              </div>

              {/* Bottom Quick Trigger Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 dark:text-neutral-400 font-mono">
                  Quick Query: <span className="text-slate-900 dark:text-neutral-200">"Analyze impact of central bank rate decisions on LBO leverage"</span>
                </span>
                <button
                  onClick={() => handleLaunch('news')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/30 hover:bg-blue-100 dark:hover:bg-blue-600/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Simulate in Feed</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
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
          <TiltCard maxTilt={5} scale={1.01}>
            <div 
              onClick={() => handleLaunch('news')}
              className="h-full bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
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
            </div>
          </TiltCard>

          {/* Card 2: Academic Intelligence Engine */}
          <TiltCard maxTilt={5} scale={1.01}>
            <div 
              onClick={() => handleLaunch('study')}
              className="h-full bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
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
            </div>
          </TiltCard>

          {/* Card 3: Executive AI MetaSuite */}
          <TiltCard maxTilt={5} scale={1.01}>
            <div 
              onClick={() => handleLaunch('metasuite')}
              className="h-full bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
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
            </div>
          </TiltCard>

          {/* Card 4: Paper Trading Sandbox */}
          <TiltCard maxTilt={5} scale={1.01}>
            <div 
              onClick={() => handleLaunch('trading')}
              className="h-full bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
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
            </div>
          </TiltCard>

          {/* Card 5: Career Vault & Applications */}
          <TiltCard maxTilt={5} scale={1.01}>
            <div 
              onClick={() => handleLaunch('jobs')}
              className="h-full bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
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
            </div>
          </TiltCard>

          {/* Card 6: Finance Hub & Calculators */}
          <TiltCard maxTilt={5} scale={1.01}>
            <div 
              onClick={() => handleLaunch('finance')}
              className="h-full bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-600/20 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
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
            </div>
          </TiltCard>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. METRICS TICKER & PERFORMANCE HIGHLIGHTS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-neutral-950/70 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-sm">
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">0.8s</span>
          <span className="text-xs text-slate-500 dark:text-neutral-400 block mt-1">Average AI Response</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">100%</span>
          <span className="text-xs text-slate-500 dark:text-neutral-400 block mt-1">Client-Side Persistence</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">60 FPS</span>
          <span className="text-xs text-slate-500 dark:text-neutral-400 block mt-1">Smooth UI Performance</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">14+</span>
          <span className="text-xs text-slate-500 dark:text-neutral-400 block mt-1">Integrated Career Tools</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200 dark:border-white/15 rounded-3xl p-8 sm:p-12 text-center space-y-6 overflow-hidden shadow-sm">
        <div className="space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Ready to accelerate your workflow?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300">
            Open the live workspace now and experience intelligent academic and market tooling.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleLaunch('news')}
            className="px-8 py-3.5 min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer flex items-center gap-2"
          >
            <span>Enter manageme Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
export default LandingPage;
