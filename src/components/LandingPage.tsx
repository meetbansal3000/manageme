import React from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Activity, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  DollarSign,
  ShieldCheck,
  Lock,
  Clock,
  Layers,
  Globe,
  Linkedin,
  Zap,
  CheckCircle2,
  BarChart3,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GoogleAuthButton } from './auth/GoogleAuthButton';

interface LandingPageProps {
  onEnterApp: (tabId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { signInAsGuest } = useAuth();
  const { showToast } = useToast();

  const handleLaunch = (targetTab: string = 'news') => {
    onEnterApp(targetTab);
  };

  const handleGuestDemo = () => {
    signInAsGuest();
    showToast('✨ Initialized Guest Demo Workspace! Full dashboard access enabled.', 'sparkle', 3500);
    onEnterApp('trading');
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('architecture-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden selection:bg-[#5E6CE7] selection:text-white">
      
      {/* ========================================================================= */}
      {/* AMBIENT BACKGROUND GLOWS */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#5E6CE7]/15 via-[#C645F9]/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -left-40 w-[600px] h-[600px] bg-[#5E6CE7]/10 blur-[160px] rounded-full" />
        <div className="absolute top-[70%] -right-40 w-[600px] h-[600px] bg-[#00FF66]/5 blur-[160px] rounded-full" />
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ========================================================================= */}
        {/* 1. CINEMATIC HERO SECTION (100vh / Centered) */}
        {/* ========================================================================= */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center py-12 relative">
          
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 liquid-pill text-xs font-mono tracking-wider uppercase text-[#8B95A5]"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5E6CE7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5E6CE7]"></span>
            </span>
            <span className="text-white font-semibold">Operational Career Intelligence</span>
            <span className="text-white/30">&bull;</span>
            <span className="text-[#00FF66] font-bold">v2.5 OS</span>
          </motion.div>

          {/* Staggered Headline (0.2s) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tightest leading-[1.04] max-w-5xl text-white"
          >
            Master your markets.<br />
            Engineer your{' '}
            <span className="font-editorial italic font-normal bg-gradient-to-r from-[#5E6CE7] via-[#8E9BFF] to-[#C645F9] bg-clip-text text-transparent px-1">
              trajectory
            </span>.
          </motion.h1>

          {/* Staggered Subhead (0.4s) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-base sm:text-lg md:text-xl text-[var(--text-muted)] max-w-2xl font-normal leading-relaxed"
          >
            The unified executive OS merging simulated multi-asset terminal execution, automated career platform bridges, and precision visa & academic ledgers.
          </motion.p>

          {/* Staggered CTA Buttons (0.6s) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none"
          >
            <button
              onClick={() => handleLaunch('trading')}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm flex items-center justify-center gap-2.5 shadow-btn-glow"
              id="heroOpenTerminalBtn"
            >
              <span>Open Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToFeatures}
              className="btn-ghost w-full sm:w-auto px-7 py-3.5 text-sm flex items-center justify-center gap-2"
              id="heroViewArchitectureBtn"
            >
              <span>View Architecture</span>
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            </button>

            <button
              onClick={handleGuestDemo}
              className="liquid-pill w-full sm:w-auto px-6 py-3.5 text-xs font-semibold text-[#8B95A5] hover:text-white flex items-center justify-center gap-2"
              id="heroGuestDemoBtn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Demo Workspace</span>
            </button>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-xs text-[#8B95A5] hover:text-white transition-colors"
            onClick={scrollToFeatures}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">Scroll to Explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#5E6CE7]" />
          </motion.div>

        </section>


        {/* ========================================================================= */}
        {/* 2. SCROLL-SYNC FEATURE SHOWCASE (Alternating Blocks) */}
        {/* ========================================================================= */}
        <div id="architecture-showcase" className="py-24 space-y-32">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 liquid-pill text-xs font-mono font-bold text-[#5E6CE7]">
              CORE ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tightest text-white">
              Engineered for precision execution
            </h2>
            <p className="text-sm sm:text-base text-[#8B95A5]">
              Three integrated engines working simultaneously to accelerate your executive career and academic performance.
            </p>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* BLOCK 1: Global Multi-Asset Terminal */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Text Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] text-xs font-mono font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>FINANCIAL ENGINE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                Global Multi-Asset Terminal
              </h3>

              <p className="text-sm text-[#8B95A5] leading-relaxed">
                Experience simulated institutional execution with zero risk. Monitor live streaming ticks across NYSE, NASDAQ, LSE, and NSE with sub-second price updates, customizable watchlists, and portfolio allocation analytics.
              </p>

              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                  <span>Market, Limit, and Stop algorithmic order tickets</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                  <span>Dynamic Sharpe ratio, Alpha & risk metrics calculation</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                  <span>Multi-currency ledger (USD, GBP, EUR, INR, SGD)</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleLaunch('trading')}
                  className="btn-ghost px-5 py-2.5 text-xs inline-flex items-center gap-2 text-white hover:border-[#00FF66]/40"
                >
                  <span>Launch Trading Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00FF66]" />
                </button>
              </div>
            </div>

            {/* Visual Column (7 Cols): Mock Terminal Glass Card */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-7 border-[var(--border-soft)] relative overflow-hidden shadow-glass-hover">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                    <span className="text-xs font-bold text-white tracking-wider">OPTIO MARKET FEED</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8B95A5]">
                    <span>LATENCY: <strong className="text-[#00FF66]">12ms</strong></span>
                    <span>&bull;</span>
                    <span>SIMULATED CAPITAL: <strong className="text-white">$100,000.00</strong></span>
                  </div>
                </div>

                {/* Live Mock Stock Ticks (Tabular Nums & Neon Green) */}
                <div className="space-y-3 font-mono tabular-nums">
                  
                  {/* Stock 1: NVDA */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00FF66]/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-[#00FF66] flex items-center justify-center font-bold text-xs">
                        NVDA
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">NVIDIA Corp</div>
                        <div className="text-[10px] text-[#8B95A5]">NASDAQ &bull; AI Semiconductor</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">$138.45</div>
                      <div className="text-[11px] font-bold text-[#00FF66] flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+3.09%</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock 2: AAPL */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00FF66]/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                        AAPL
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Apple Inc.</div>
                        <div className="text-[10px] text-[#8B95A5]">NASDAQ &bull; Consumer Tech</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">$232.80</div>
                      <div className="text-[11px] font-bold text-[#00FF66] flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+0.84%</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock 3: SPY */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#00FF66]/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                        SPY
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">SPDR S&P 500 ETF</div>
                        <div className="text-[10px] text-[#8B95A5]">NYSE Arca &bull; Index Benchmark</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">$598.40</div>
                      <div className="text-[11px] font-bold text-[#00FF66] flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+0.72%</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Order Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8B95A5] font-mono">
                  <span>UNREALIZED P&L: <strong className="text-[#00FF66]">+$1,420.50 (+1.42%)</strong></span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">READY TO EXECUTE</span>
                </div>

              </div>
            </div>
          </motion.div>


          {/* ----------------------------------------------------------------------- */}
          {/* BLOCK 2: Job Platform Auto-Sync Hub */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Visual Column (7 Cols): Overlapping Circular Brand Avatars & Bridge */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="glass-card p-8 border-[var(--border-soft)] relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[340px]">
                
                {/* Concentric Pulse Rings */}
                <div className="relative flex items-center justify-center w-64 h-64">
                  <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20 pointer-events-none" />
                  <div className="absolute inset-4 rounded-full border border-[#5E6CE7]/20 pointer-events-none" />
                  <div className="absolute inset-12 rounded-full border border-[#C645F9]/20 pointer-events-none" />

                  {/* Center Hub Core */}
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#5E6CE7] to-[#C645F9] p-0.5 shadow-lg shadow-[#5E6CE7]/30">
                    <div className="w-full h-full bg-[#0A051A] rounded-2xl flex flex-col items-center justify-center">
                      <Zap className="w-7 h-7 text-[#5E6CE7]" />
                      <span className="text-[9px] font-mono font-bold text-white mt-1">OPTIO SYNC</span>
                    </div>
                  </div>

                  {/* Orbiting Brand 1: LinkedIn (Top-Left) */}
                  <div className="absolute -top-1 left-4 liquid-pill p-2.5 flex items-center gap-2 bg-[#0A051A]/80 shadow-md">
                    <div className="w-7 h-7 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">LinkedIn</div>
                      <div className="text-[#00FF66] text-[9px]">Bridge Live</div>
                    </div>
                  </div>

                  {/* Orbiting Brand 2: Indeed (Top-Right) */}
                  <div className="absolute -top-1 right-4 liquid-pill p-2.5 flex items-center gap-2 bg-[#0A051A]/80 shadow-md">
                    <div className="w-7 h-7 rounded-lg bg-[#2164f3] text-white flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">Indeed Global</div>
                      <div className="text-[#00FF66] text-[9px]">1-Click Clip</div>
                    </div>
                  </div>

                  {/* Orbiting Brand 3: Handshake (Bottom-Left) */}
                  <div className="absolute -bottom-1 left-4 liquid-pill p-2.5 flex items-center gap-2 bg-[#0A051A]/80 shadow-md">
                    <div className="w-7 h-7 rounded-lg bg-[#d64000] text-white flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">Handshake</div>
                      <div className="text-blue-400 text-[9px]">Campus Sync</div>
                    </div>
                  </div>

                  {/* Orbiting Brand 4: Otta / Tech (Bottom-Right) */}
                  <div className="absolute -bottom-1 right-4 liquid-pill p-2.5 flex items-center gap-2 bg-[#0A051A]/80 shadow-md">
                    <div className="w-7 h-7 rounded-lg bg-[#10b981] text-white flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">Otta & Glassdoor</div>
                      <div className="text-purple-400 text-[9px]">Webhook Active</div>
                    </div>
                  </div>

                </div>

                {/* Status Bar */}
                <div className="mt-6 font-mono text-xs text-[#8B95A5]">
                  <span>1-Click Browser Bookmarklet &bull; Auto-Parses Salary, Firm & Deadline</span>
                </div>

              </div>
            </div>

            {/* Text Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#5E6CE7]/10 border border-[#5E6CE7]/20 text-[#5E6CE7] text-xs font-mono font-bold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>CAREER INTELLIGENCE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                Job Platform Auto-Sync Hub
              </h3>

              <p className="text-sm text-[#8B95A5] leading-relaxed">
                Never manually enter an application again. Clip job openings from LinkedIn, Indeed, and Handshake with one click. Optio extracts compensation data, sponsorship eligibility, and organizes your interview rounds automatically.
              </p>

              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#5E6CE7]" />
                  <span>AI extraction of company, title, salary & deadline</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#5E6CE7]" />
                  <span>Automated cold outreach generator tailored to HR recruiters</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#5E6CE7]" />
                  <span>ATS resume scanner with keyword density optimization</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleLaunch('jobs')}
                  className="btn-ghost px-5 py-2.5 text-xs inline-flex items-center gap-2 text-white hover:border-[#5E6CE7]/40"
                >
                  <span>Explore Career Hub</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5E6CE7]" />
                </button>
              </div>
            </div>
          </motion.div>


          {/* ----------------------------------------------------------------------- */}
          {/* BLOCK 3: Academic & Visa Ledger */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Text Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#C645F9]/10 border border-[#C645F9]/20 text-[#C645F9] text-xs font-mono font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>ACADEMIC & LEGAL ENGINE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                Academic & Visa Ledger
              </h3>

              <p className="text-sm text-[#8B95A5] leading-relaxed">
                Stay 100% compliant with student visa employment limits. Optio tracks your weekly work hours against Tier-4 caps, computes shift earnings in real time, and synchronizes lecture calendars with examination countdowns.
              </p>

              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#C645F9]" />
                  <span>Live 20h/week visa limit progress gauge</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#C645F9]" />
                  <span>Precision hourly rate calculator (£/hr pro-rata)</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#C645F9]" />
                  <span>Calendar export to Apple, Google & Outlook</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleLaunch('work')}
                  className="btn-ghost px-5 py-2.5 text-xs inline-flex items-center gap-2 text-white hover:border-[#C645F9]/40"
                >
                  <span>View Shift & Visa Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C645F9]" />
                </button>
              </div>
            </div>

            {/* Visual Column (7 Cols): Tabular-num Ledger Component */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-7 border-[var(--border-soft)] space-y-5 shadow-glass-hover">
                
                {/* Visa Progress Bar */}
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      WEEKLY STUDENT VISA CAP (TERM-TIME)
                    </span>
                    <span className="text-amber-400 font-bold tabular-nums">14.5 / 20.0 hrs</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] transition-all" style={{ width: '72.5%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8B95A5]">
                    <span>Remaining Allowance: <strong className="text-white">5.5 hrs</strong></span>
                    <span className="text-[#00FF66]">Compliant &bull; 0 Overages</span>
                  </div>
                </div>

                {/* Tabular Shift Rows */}
                <div className="space-y-2.5 font-mono tabular-nums text-xs">
                  
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Economics Teaching Assistant</div>
                      <div className="text-[10px] text-[#8B95A5]">Today &bull; 09:00 - 13:30 (4.5 hrs)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#00FF66]">+£56.25</div>
                      <div className="text-[10px] text-[#8B95A5]">£12.50 / hr</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Campus IT Operations Analyst</div>
                      <div className="text-[10px] text-[#8B95A5]">Yesterday &bull; 14:00 - 19:00 (5.0 hrs)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#00FF66]">+£62.50</div>
                      <div className="text-[10px] text-[#8B95A5]">£12.50 / hr</div>
                    </div>
                  </div>

                </div>

                {/* Weekly Earnings Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#5E6CE7]/10 to-[#C645F9]/10 border border-[#5E6CE7]/20 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-[#8B95A5] block">TOTAL WEEKLY ACCRUED EARNINGS</span>
                    <span className="text-xl font-extrabold text-white tabular-nums">£181.25</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66] font-bold">
                    PAID BI-WEEKLY
                  </span>
                </div>

              </div>
            </div>
          </motion.div>

        </div>


        {/* ========================================================================= */}
        {/* 3. PERFORMANCE HIGHLIGHTS & STATS */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="my-16 glass-card p-8 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono"
        >
          <div>
            <span className="text-3xl sm:text-5xl font-extrabold text-[#5E6CE7] tabular-nums block">0.8s</span>
            <span className="text-xs text-[#8B95A5] block mt-1 font-sans font-medium">Gemini 2.5 Inference</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-extrabold text-[#00FF66] tabular-nums block">100%</span>
            <span className="text-xs text-[#8B95A5] block mt-1 font-sans font-medium">Client Persistence</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-extrabold text-[#C645F9] tabular-nums block">60 FPS</span>
            <span className="text-xs text-[#8B95A5] block mt-1 font-sans font-medium">Spatial Motion</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-extrabold text-amber-400 tabular-nums block">16+</span>
            <span className="text-xs text-[#8B95A5] block mt-1 font-sans font-medium">Integrated OS Hubs</span>
          </div>
        </motion.div>


        {/* ========================================================================= */}
        {/* 4. BOTTOM CALL TO ACTION BANNER */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="my-20 relative bg-gradient-to-b from-[#5E6CE7]/15 via-[#C645F9]/10 to-transparent backdrop-blur-2xl border border-[var(--border-soft)] rounded-3xl p-8 sm:p-14 text-center space-y-7 overflow-hidden shadow-2xl"
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tightest">
              Ready to engineer your career?
            </h2>
            <p className="text-sm sm:text-base text-[#8B95A5]">
              Launch Optio OS now to activate your personal multi-asset terminal and career CRM.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-2 w-full max-w-md mx-auto">
            <GoogleAuthButton
              label="Continue with Google"
              variant="glass"
              onSuccess={() => handleLaunch('news')}
              className="py-3.5 px-6 text-sm font-bold"
            />
            <button
              onClick={handleGuestDemo}
              className="btn-primary w-full sm:w-auto px-7 py-3.5 text-sm flex items-center justify-center gap-2"
            >
              <span>Enter Guest Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>


        {/* ========================================================================= */}
        {/* 5. LEGAL & BRAND FOOTER */}
        {/* ========================================================================= */}
        <footer className="pt-10 pb-8 border-t border-[var(--border-soft)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B95A5] font-sans">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
            <span>&copy; {new Date().getFullYear()} Optio &bull; Career Intelligence OS</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#privacy';
                window.dispatchEvent(new HashChangeEvent('hashchange'));
              }}
              className="hover:text-white hover:underline transition-colors cursor-pointer"
              id="landingFooterPrivacyLink"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#terms';
                window.dispatchEvent(new HashChangeEvent('hashchange'));
              }}
              className="hover:text-white hover:underline transition-colors cursor-pointer"
              id="landingFooterTermsLink"
            >
              Terms of Service
            </a>
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3 text-[#5E6CE7]" />
              <span>Google API Limited Use</span>
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
