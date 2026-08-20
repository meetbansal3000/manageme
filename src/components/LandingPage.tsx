import React from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Activity, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  ShieldCheck,
  Lock,
  Layers,
  Globe,
  Linkedin,
  Zap,
  CheckCircle2,
  Scale,
  Terminal,
  ChevronRight
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
    showToast('✨ Initialized Guest Workspace! Full dashboard access enabled.', 'sparkle', 3500);
    onEnterApp('trading');
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('architecture-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] font-sans antialiased overflow-x-hidden selection:bg-[#0052FF] selection:text-white">
      
      {/* ========================================================================= */}
      {/* AMBIENT BACKGROUND SYSTEM */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#0052FF]/10 via-[#0052FF]/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[45%] -left-40 w-[600px] h-[600px] bg-[#0052FF]/5 blur-[160px] rounded-full" />
        <div className="absolute top-[75%] -right-40 w-[600px] h-[600px] bg-[#00FF66]/5 blur-[160px] rounded-full" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* ========================================================================= */}
      {/* 3-COLUMN HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/[0.08] bg-black/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-3 items-center">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0052FF] to-[#00FF66] p-0.5">
              <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-bold tracking-tight text-base text-white">Optio<span className="text-[#0052FF]">.os</span></span>
          </div>

          {/* Center: Liquid Pill Navigation */}
          <div className="flex justify-center">
            <nav className="liquid-pill hidden md:inline-flex items-center gap-6 text-xs font-mono">
              <button onClick={() => handleLaunch('trading')} className="hover:text-white transition-colors cursor-pointer">
                Terminal
              </button>
              <button onClick={() => handleLaunch('jobs')} className="hover:text-white transition-colors cursor-pointer">
                Pipeline
              </button>
              <button onClick={() => handleLaunch('work')} className="hover:text-white transition-colors cursor-pointer">
                Ledger
              </button>
              <button onClick={scrollToFeatures} className="text-[#8B95A5] hover:text-white transition-colors cursor-pointer">
                Architecture
              </button>
            </nav>
          </div>

          {/* Right: Solid CTA Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => handleLaunch('news')}
              className="btn-solid px-4 py-2 text-xs font-semibold"
              id="headerOpenWorkspaceBtn"
            >
              Open Workspace
            </button>
          </div>

        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ========================================================================= */}
        {/* HERO SECTION (Single Viewport 100vh Centered) */}
        {/* ========================================================================= */}
        <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center text-center py-12 relative">
          
          {/* Top Pill Badge */}
          <div className="mb-6 overflow-hidden">
            <div className="type-rise inline-flex items-center gap-2.5 px-4 py-1.5 liquid-pill text-xs font-mono tracking-wider uppercase text-[#8B95A5]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0052FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0052FF]"></span>
              </span>
              <span className="text-white font-semibold">Operational Career Infrastructure</span>
              <span className="text-white/30">&bull;</span>
              <span className="text-[#00FF66] font-bold">v2.5 OS</span>
            </div>
          </div>

          {/* Staggered H1 Headline with Masked Rise Animations */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tightest leading-[1.04] max-w-5xl text-white">
            <div className="overflow-hidden">
              <div className="type-rise rise-delay-1">
                Every career decision
              </div>
            </div>
            <div className="overflow-hidden mt-1">
              <div className="type-rise rise-delay-2">
                starts with{' '}
                <em className="font-serif italic font-normal text-[#8B95A5] not-italic px-1">
                  better intelligence.
                </em>
              </div>
            </div>
          </h1>

          {/* Staggered Subhead */}
          <div className="overflow-hidden mt-6 max-w-2xl">
            <p className="type-rise rise-delay-3 text-base sm:text-lg md:text-xl text-[#8B95A5] font-normal leading-relaxed">
              A unified spatial OS to simulate global markets, auto-sync job pipelines, and execute academic schedules.
            </p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none"
          >
            <button
              onClick={() => handleLaunch('trading')}
              className="btn-solid px-8 py-3.5 text-sm flex items-center justify-center gap-2"
              id="heroOpenTerminalBtn"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleGuestDemo}
              className="liquid-pill px-6 py-3.5 text-xs font-semibold text-[#8B95A5] hover:text-white flex items-center justify-center gap-2"
              id="heroGuestDemoBtn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Demo Workspace</span>
            </button>
          </motion.div>

          {/* Scroll Down Indicator */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-xs text-[#8B95A5] hover:text-white transition-colors"
            onClick={scrollToFeatures}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">Scroll to Explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#0052FF]" />
          </div>

        </section>


        {/* ========================================================================= */}
        {/* SCROLL-SYNC FEATURE SECTION (3 Distinct Blocks) */}
        {/* ========================================================================= */}
        <div id="architecture-showcase" className="py-24 space-y-32">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 liquid-pill text-xs font-mono font-bold text-[#0052FF]">
              CORE ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tightest text-white">
              Engineered for precision execution
            </h2>
            <p className="text-sm sm:text-base text-[#8B95A5]">
              Three high-performance modules engineered to accelerate executive career progression and multi-asset mastery.
            </p>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* FEATURE 1: Multi-Asset Terminal */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Text Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] text-xs font-mono font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>FINANCIAL ENGINE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                Multi-Asset Terminal
              </h3>

              <p className="text-sm text-[#8B95A5] leading-relaxed">
                Real-time execution and tabular-num data grids. Monitor live streaming ticks across NYSE, NASDAQ, LSE, and NSE with sub-second price updates, customizable watchlists, and portfolio allocation analytics.
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
                  className="liquid-pill text-xs inline-flex items-center gap-2 text-white hover:border-[#00FF66]/50"
                >
                  <span>Launch Trading Terminal</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00FF66]" />
                </button>
              </div>
            </div>

            {/* Visual Column (7 Cols): Pure Black Terminal Grid */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-7 border-[rgba(255,255,255,0.12)] relative overflow-hidden bg-[#0A0A0A]">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                    <span className="text-xs font-bold text-white tracking-wider">OPTIO MARKET FEED</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8B95A5]">
                    <span>LATENCY: <strong className="text-[#00FF66]">12ms</strong></span>
                    <span>&bull;</span>
                    <span>CAPITAL: <strong className="text-white tabular-nums">$100,000.00</strong></span>
                  </div>
                </div>

                {/* Tabular Nums Ticks */}
                <div className="space-y-3 font-mono tabular-nums">
                  <div className="p-3.5 rounded-lg bg-black border border-white/[0.08] hover:border-[#00FF66]/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-[#00FF66]/10 text-[#00FF66] flex items-center justify-center font-bold text-xs">
                        NVDA
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">NVIDIA Corp</div>
                        <div className="text-[10px] text-[#8B95A5]">NASDAQ &bull; AI Semiconductor</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white tabular-nums">$138.45</div>
                      <div className="text-[11px] font-bold text-[#00FF66] flex items-center justify-end gap-0.5 tabular-nums">
                        <TrendingUp className="w-3 h-3" />
                        <span>+3.09%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-black border border-white/[0.08] hover:border-[#00FF66]/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                        AAPL
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Apple Inc.</div>
                        <div className="text-[10px] text-[#8B95A5]">NASDAQ &bull; Consumer Tech</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white tabular-nums">$232.80</div>
                      <div className="text-[11px] font-bold text-[#00FF66] flex items-center justify-end gap-0.5 tabular-nums">
                        <TrendingUp className="w-3 h-3" />
                        <span>+0.84%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-black border border-white/[0.08] hover:border-[#00FF66]/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                        SPY
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">SPDR S&P 500 ETF</div>
                        <div className="text-[10px] text-[#8B95A5]">NYSE Arca &bull; Index Benchmark</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white tabular-nums">$598.40</div>
                      <div className="text-[11px] font-bold text-[#00FF66] flex items-center justify-end gap-0.5 tabular-nums">
                        <TrendingUp className="w-3 h-3" />
                        <span>+0.72%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8B95A5] font-mono">
                  <span>UNREALIZED P&L: <strong className="text-[#00FF66] tabular-nums">+$1,420.50 (+1.42%)</strong></span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-semibold">TERMINAL ACTIVE</span>
                </div>

              </div>
            </div>
          </motion.div>


          {/* ----------------------------------------------------------------------- */}
          {/* FEATURE 2: Auto-Sync CRM */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Visual Column (7 Cols) */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="glass-card p-8 border-[rgba(255,255,255,0.12)] relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[340px] bg-[#0A0A0A]">
                
                <div className="relative flex items-center justify-center w-64 h-64">
                  <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20 pointer-events-none" />
                  <div className="absolute inset-4 rounded-full border border-[#0052FF]/20 pointer-events-none" />
                  <div className="absolute inset-12 rounded-full border border-white/10 pointer-events-none" />

                  {/* Center Core */}
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-white p-0.5 shadow-lg shadow-[#0052FF]/30">
                    <div className="w-full h-full bg-black rounded-2xl flex flex-col items-center justify-center">
                      <Zap className="w-7 h-7 text-[#0052FF]" />
                      <span className="text-[9px] font-mono font-bold text-white mt-1">OPTIO CRM</span>
                    </div>
                  </div>

                  {/* Brand 1: LinkedIn */}
                  <div className="absolute -top-1 left-4 liquid-pill p-2.5 flex items-center gap-2 bg-black shadow-md">
                    <div className="w-7 h-7 rounded bg-[#0a66c2] text-white flex items-center justify-center">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">LinkedIn</div>
                      <div className="text-[#00FF66] text-[9px]">Bridge Live</div>
                    </div>
                  </div>

                  {/* Brand 2: Indeed */}
                  <div className="absolute -top-1 right-4 liquid-pill p-2.5 flex items-center gap-2 bg-black shadow-md">
                    <div className="w-7 h-7 rounded bg-[#2164f3] text-white flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">Indeed Global</div>
                      <div className="text-[#00FF66] text-[9px]">1-Click Clip</div>
                    </div>
                  </div>

                  {/* Brand 3: Handshake */}
                  <div className="absolute -bottom-1 left-4 liquid-pill p-2.5 flex items-center gap-2 bg-black shadow-md">
                    <div className="w-7 h-7 rounded bg-[#d64000] text-white flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">Handshake</div>
                      <div className="text-blue-400 text-[9px]">Campus Sync</div>
                    </div>
                  </div>

                  {/* Brand 4: Otta / Tech */}
                  <div className="absolute -bottom-1 right-4 liquid-pill p-2.5 flex items-center gap-2 bg-black shadow-md">
                    <div className="w-7 h-7 rounded bg-[#10b981] text-white flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-left font-mono text-[10px]">
                      <div className="text-white font-bold">Otta & Direct</div>
                      <div className="text-purple-400 text-[9px]">Webhook Active</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 font-mono text-xs text-[#8B95A5]">
                  <span>1-Click Pipeline Bridge &bull; Auto-Parses Salary, Firm & Deadline</span>
                </div>

              </div>
            </div>

            {/* Text Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#0052FF] text-xs font-mono font-bold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>CAREER CRM</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                Auto-Sync CRM
              </h3>

              <p className="text-sm text-[#8B95A5] leading-relaxed">
                1-click pipeline bridge for job platforms. Never manually enter an application again. Clip job openings from LinkedIn, Indeed, and Handshake with one click. Optio extracts compensation data, sponsorship eligibility, and organizes your interview rounds automatically.
              </p>

              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />
                  <span>AI extraction of company, title, salary & deadline</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />
                  <span>Automated cold outreach generator tailored to HR recruiters</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />
                  <span>ATS resume scanner with keyword density optimization</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleLaunch('jobs')}
                  className="liquid-pill text-xs inline-flex items-center gap-2 text-white hover:border-[#0052FF]/50"
                >
                  <span>Explore Pipeline CRM</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#0052FF]" />
                </button>
              </div>
            </div>
          </motion.div>


          {/* ----------------------------------------------------------------------- */}
          {/* FEATURE 3: Global Ledger */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Text Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>ACADEMIC & LEGAL ENGINE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                Global Ledger
              </h3>

              <p className="text-sm text-[#8B95A5] leading-relaxed">
                Visa work-cap and shift wage tracking. Stay 100% compliant with student visa employment limits. Optio tracks your weekly work hours against Tier-4 caps, computes shift earnings in real time, and synchronizes lecture calendars with examination countdowns.
              </p>

              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Live 20h/week visa limit progress gauge</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Precision hourly rate calculator (£/hr pro-rata)</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Calendar export to Apple, Google & Outlook</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleLaunch('work')}
                  className="liquid-pill text-xs inline-flex items-center gap-2 text-white hover:border-purple-400/50"
                >
                  <span>View Shift & Visa Ledger</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>
            </div>

            {/* Visual Column (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-7 border-[rgba(255,255,255,0.12)] space-y-5 bg-[#0A0A0A]">
                
                {/* Visa Progress Gauge */}
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      WEEKLY STUDENT VISA CAP (TERM-TIME)
                    </span>
                    <span className="text-amber-400 font-bold tabular-nums">14.5 / 20.0 hrs</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0052FF] to-[#00FF66] transition-all" style={{ width: '72.5%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#8B95A5]">
                    <span>Remaining Allowance: <strong className="text-white tabular-nums">5.5 hrs</strong></span>
                    <span className="text-[#00FF66]">Compliant &bull; 0 Overages</span>
                  </div>
                </div>

                {/* Tabular Shift Rows */}
                <div className="space-y-2.5 font-mono tabular-nums text-xs">
                  <div className="p-3 rounded-lg bg-black border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Economics Teaching Assistant</div>
                      <div className="text-[10px] text-[#8B95A5]">Today &bull; 09:00 - 13:30 (4.5 hrs)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#00FF66] tabular-nums">+£56.25</div>
                      <div className="text-[10px] text-[#8B95A5] tabular-nums">£12.50 / hr</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Campus IT Operations Analyst</div>
                      <div className="text-[10px] text-[#8B95A5]">Yesterday &bull; 14:00 - 19:00 (5.0 hrs)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#00FF66] tabular-nums">+£62.50</div>
                      <div className="text-[10px] text-[#8B95A5] tabular-nums">£12.50 / hr</div>
                    </div>
                  </div>
                </div>

                {/* Weekly Earnings Summary */}
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08] flex items-center justify-between font-mono">
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
        {/* BOTTOM CALL TO ACTION BANNER */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="my-20 relative bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 sm:p-14 text-center space-y-7 overflow-hidden shadow-2xl"
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tightest">
              Ready to engineer your career?
            </h2>
            <p className="text-sm sm:text-base text-[#8B95A5]">
              Launch Optio OS now to activate your personal multi-asset terminal, automated pipeline CRM, and academic ledger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-2 w-full max-w-md mx-auto">
            <GoogleAuthButton
              label="Continue with Google"
              variant="glass"
              onSuccess={() => handleLaunch('news')}
              className="py-3 px-6 text-sm font-bold"
            />
            <button
              onClick={handleGuestDemo}
              className="btn-solid px-7 py-3 text-sm flex items-center justify-center gap-2"
            >
              <span>Enter Guest Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>


        {/* ========================================================================= */}
        {/* FOOTER */}
        {/* ========================================================================= */}
        <footer className="pt-10 pb-8 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B95A5] font-sans">
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
            >
              Terms of Service
            </a>
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3 text-[#0052FF]" />
              <span>Google API Limited Use</span>
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
