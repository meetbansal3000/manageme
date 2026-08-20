'use client';

import React, { useRef } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Activity, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  ShieldCheck,
  Layers,
  Globe,
  Linkedin,
  Zap,
  Scale,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { InteractiveCursorGlow } from '../components/canvas/InteractiveCursorGlow';

// 3D Physics Card Wrapper
interface ScrollCard3DProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollCard3D: React.FC<ScrollCard3DProps> = ({ children, className = '' }) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'center center']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.8,
    restDelta: 0.001
  });

  const scale = useTransform(smoothProgress, [0, 1], [0.85, 1.0]);
  const opacity = useTransform(smoothProgress, [0, 0.85], [0, 1]);
  const rotateX = useTransform(smoothProgress, [0, 1], [15, 0]);
  const y = useTransform(smoothProgress, [0, 1], [100, 0]);

  return (
    <div 
      ref={targetRef} 
      className={`[perspective:1000px] transform-gpu will-change-transform ${className}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          scale,
          opacity,
          rotateX,
          y,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function Page() {
  const scrollToFeatures = () => {
    const el = document.getElementById('architecture-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] font-sans antialiased overflow-x-hidden selection:bg-[#0052FF] selection:text-white">
      
      {/* Interactive Cursor Glow */}
      <InteractiveCursorGlow />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#0052FF]/10 via-[#0052FF]/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[45%] -left-40 w-[600px] h-[600px] bg-[#0052FF]/5 blur-[160px] rounded-full" />
        <div className="absolute top-[75%] -right-40 w-[600px] h-[600px] bg-[#00FF66]/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* 3-Column Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/[0.08] bg-black/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-3 items-center">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0052FF] to-[#00FF66] p-0.5">
              <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-bold tracking-tight text-base text-white">manageme</span>
          </div>

          {/* Center: Liquid Pill */}
          <div className="flex justify-center">
            <nav className="liquid-pill hidden md:inline-flex items-center gap-6 text-xs font-mono">
              <a href="/app?tab=trading" className="hover:text-white transition-colors">Terminal</a>
              <a href="/app?tab=jobs" className="hover:text-white transition-colors">Pipeline</a>
              <a href="/app?tab=work" className="hover:text-white transition-colors">Ledger</a>
              <button onClick={scrollToFeatures} className="text-[#8B95A5] hover:text-white transition-colors cursor-pointer">Architecture</button>
            </nav>
          </div>

          {/* Right: Solid Button */}
          <div className="flex items-center justify-end">
            <a
              href="/app"
              className="btn-solid px-4 py-2 text-xs font-semibold"
              id="headerOpenWorkspaceBtn"
            >
              Open Workspace
            </a>
          </div>

        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section (100vh Centered) */}
        <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center text-center py-12 relative">
          
          {/* Badge */}
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

          {/* H1 Headline */}
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

          {/* Subhead */}
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
            <a
              href="/app?tab=trading"
              className="btn-solid px-8 py-3.5 text-sm flex items-center justify-center gap-2"
              id="heroOpenTerminalBtn"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="/app?demo=true"
              className="liquid-pill px-6 py-3.5 text-xs font-semibold text-[#8B95A5] hover:text-white flex items-center justify-center gap-2"
              id="heroGuestDemoBtn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Demo Workspace</span>
            </a>
          </motion.div>

          {/* Scroll Down */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-xs text-[#8B95A5] hover:text-white transition-colors"
            onClick={scrollToFeatures}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">Scroll to Explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#0052FF]" />
          </div>

        </section>


        {/* Scroll-Sync Feature Section with 3D Physics */}
        <div id="architecture-showcase" className="py-24 space-y-36">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 liquid-pill text-xs font-mono font-bold text-[#0052FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>COMPREHENSIVE PLATFORM ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tightest text-white">
              Every engine. Engineered for executive velocity.
            </h2>
            <p className="text-sm sm:text-base text-[#8B95A5] leading-relaxed">
              Explore the four core operational engines powering manageme. Each subsystem is built with 3D spatial synchronization, automated data bridges, and high-performance computation.
            </p>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* FEATURE 1: Universal AI Model Gateway (Text Left, Mockup Right) */}
          {/* ----------------------------------------------------------------------- */}
          <ScrollCard3D>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text Column (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#0052FF] text-xs font-mono font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>UNIVERSAL AI ENGINE</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                  Universal AI Model Gateway
                </h3>

                {/* Purpose Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#0052FF] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]" />
                    <span>Purpose & Why It Exists</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F3F3F3] leading-relaxed">
                    Route your intelligence. Instantly switch between AI backends (Gemini, Claude, DeepSeek) optimized for specific academic or career tasks.
                  </p>
                </div>

                {/* How to Use Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#00FF66] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                    <span>How to Use</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8B95A5] leading-relaxed">
                    Open the API Vault, select your preferred model based on the required skill (e.g., Deep Reasoning, ATS Writing, Math & Logic), and route your queries instantly.
                  </p>
                </div>

                {/* Feature Bullets */}
                <div className="space-y-2 pt-1 text-xs font-mono text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                    <span>Zero-latency switching: Gemini 2.5 Flash, Claude 3.7 Sonnet & DeepSeek R1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                    <span>Adaptive personas: Senior M&A Quant, ATS Resume Architect & STEM Mentor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                    <span>Secure client-side encrypted BYOK key storage & token telemetry</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/app?tab=chat"
                    className="liquid-pill text-xs inline-flex items-center gap-2 text-white hover:border-[#0052FF]/50"
                  >
                    <span>Launch AI Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#0052FF]" />
                  </a>
                </div>
              </div>

              {/* Visual Column (7 Cols): AI Gateway Switcher Mockup */}
              <div className="lg:col-span-7">
                <div className="glass-card p-6 sm:p-7 border-[rgba(255,255,255,0.12)] relative overflow-hidden bg-[#0A0A0A] shadow-2xl space-y-4">
                  {/* HUD Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0052FF] animate-ping" />
                      <span className="text-xs font-bold text-white tracking-wider">MANAGEME AI GATEWAY HUD</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#0052FF]/15 text-[#0052FF] font-bold border border-[#0052FF]/30">
                      ACTIVE ROUTER
                    </span>
                  </div>

                  {/* Active Engine Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#0052FF]/15 via-black to-black border border-[#0052FF]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0052FF] text-white flex items-center justify-center font-bold text-sm">
                          ✦
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Gemini 2.5 Flash</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00FF66]/20 text-[#00FF66] font-mono">PRIMARY</span>
                          </div>
                          <div className="text-[11px] text-[#8B95A5]">Google DeepMind &bull; Multi-Modal High-Speed Reasoning</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-[#00FF66] font-bold">14ms</span>
                        <span className="text-[#8B95A5] block">Latency</span>
                      </div>
                    </div>
                  </div>

                  {/* Model Selector Alternatives */}
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-black border border-white/[0.08] hover:border-[#0052FF]/40 transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                          C
                        </div>
                        <div>
                          <div className="text-white font-semibold">Claude 3.7 Sonnet</div>
                          <div className="text-[10px] text-[#8B95A5]">Anthropic &bull; ATS Polish & Nuanced Academic Prose</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10">HYBRID THINKING</span>
                    </div>

                    <div className="p-3 rounded-lg bg-black border border-white/[0.08] hover:border-[#0052FF]/40 transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                          R1
                        </div>
                        <div>
                          <div className="text-white font-semibold">DeepSeek R1</div>
                          <div className="text-[10px] text-[#8B95A5]">DeepSeek AI &bull; Open Logic, Math & Quantitative Algorithms</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-400/10">PURE REASONING</span>
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8B95A5] font-mono tabular-nums">
                    <span>CONTEXT WINDOW: <strong className="text-white">1,000,000 Tokens</strong></span>
                    <span>THINKING BUDGET: <strong className="text-[#00FF66]">Active</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollCard3D>


          {/* ----------------------------------------------------------------------- */}
          {/* FEATURE 2: Financial & Job Hub (Visa & Wage Ledger) (Mockup Left, Text Right) */}
          {/* ----------------------------------------------------------------------- */}
          <ScrollCard3D>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Visual Column (7 Cols): Shift Wage & Visa Ledger */}
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="glass-card p-6 sm:p-7 border-[rgba(255,255,255,0.12)] space-y-5 bg-[#0A0A0A] shadow-2xl">
                  {/* Visa Cap Gauge */}
                  <div className="space-y-2.5 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-400" />
                        ROLLING 7-DAY VISA WORK-CAP GAUGE
                      </span>
                      <span className="text-amber-400 font-bold tabular-nums">14.5 / 20.0 hrs</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden p-0.5">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0052FF] via-[#5E6CE7] to-[#00FF66] transition-all" style={{ width: '72.5%' }} />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#8B95A5]">
                      <span>Remaining Allowance: <strong className="text-white tabular-nums">5.5 hrs</strong></span>
                      <span className="text-[#00FF66] font-bold">Compliant &bull; 0 Overages</span>
                    </div>
                  </div>

                  {/* 1-Click Shift Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-[#8B95A5] uppercase tracking-wider block">1-Click Shift Log Presets</span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      <button className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white flex flex-col items-center transition-colors cursor-pointer">
                        <span className="font-bold text-[#00FF66]">+ Morning</span>
                        <span className="text-[10px] text-[#8B95A5]">4.0 hrs</span>
                      </button>
                      <button className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white flex flex-col items-center transition-colors cursor-pointer">
                        <span className="font-bold text-[#0052FF]">+ Evening</span>
                        <span className="text-[10px] text-[#8B95A5]">5.0 hrs</span>
                      </button>
                      <button className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white flex flex-col items-center transition-colors cursor-pointer">
                        <span className="font-bold text-purple-400">+ Custom</span>
                        <span className="text-[10px] text-[#8B95A5]">Modal</span>
                      </button>
                    </div>
                  </div>

                  {/* Shift Wage Logs */}
                  <div className="space-y-2 font-mono tabular-nums text-xs">
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

                  {/* Summary Bar */}
                  <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.08] flex items-center justify-between font-mono">
                    <div>
                      <span className="text-[10px] text-[#8B95A5] block">TOTAL WEEKLY ACCRUED EARNINGS</span>
                      <span className="text-lg font-extrabold text-white tabular-nums">£181.25</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#00FF66]/15 border border-[#00FF66]/30 text-[#00FF66] font-bold">
                      AUTOMATIC MULTIPLIER APPLIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Column (5 Cols) */}
              <div className="lg:col-span-5 space-y-5 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-mono font-bold">
                  <Scale className="w-3.5 h-3.5" />
                  <span>FINANCIAL & VISA COMPLIANCE</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                  Financial & Job Hub (Visa & Wage Ledger)
                </h3>

                {/* Purpose Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Purpose & Why It Exists</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F3F3F3] leading-relaxed">
                    Protect your visa status and optimize your cash flow. Strictly monitor international student work-caps while tracking live shift wages and category budgets.
                  </p>
                </div>

                {/* How to Use Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#00FF66] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                    <span>How to Use</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8B95A5] leading-relaxed">
                    Use 1-Click Presets (Morning 4h, Evening 5h) to log shifts. The engine automatically applies rate multipliers and deducts hours from your rolling Visa Work-Cap.
                  </p>
                </div>

                {/* Feature Bullets */}
                <div className="space-y-2 pt-1 text-xs font-mono text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Real-time 20h/week visa work-cap compliance safeguard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Multi-currency hourly wage converter (£/hr, $/hr, €/hr)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Calendar sync integration for examination and lecture clashes</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/app?tab=work"
                    className="liquid-pill text-xs inline-flex items-center gap-2 text-white hover:border-amber-400/50"
                  >
                    <span>View Shift & Visa Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollCard3D>


          {/* ----------------------------------------------------------------------- */}
          {/* FEATURE 3: Global Multi-Asset Terminal (Text Left, Mockup Right) */}
          {/* ----------------------------------------------------------------------- */}
          <ScrollCard3D>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text Column (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] text-xs font-mono font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>INSTITUTIONAL MARKET ENGINE</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                  Global Multi-Asset Terminal
                </h3>

                {/* Purpose Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#00FF66] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                    <span>Purpose & Why It Exists</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F3F3F3] leading-relaxed">
                    Institutional-grade market discovery. Monitor multi-currency execution and portfolio risk analytics in real-time.
                  </p>
                </div>

                {/* How to Use Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#5E6CE7] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5E6CE7]" />
                    <span>How to Use</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8B95A5] leading-relaxed">
                    Toggle between global market regions (US, IN, GB, EU, SG). Search specific asset tickers to view live tick charts, volatility estimates, and market depth before executing simulated trades.
                  </p>
                </div>

                {/* Feature Bullets */}
                <div className="space-y-2 pt-1 text-xs font-mono text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Global tickers: NYSE, NASDAQ, London Stock Exchange, NSE & SGX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Market, Limit, and Stop orders with simulated slippage physics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Portfolio Sharpe ratio, Alpha benchmarking & volatility modeling</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/app?tab=trading"
                    className="liquid-pill text-xs inline-flex items-center gap-2 text-white hover:border-[#00FF66]/50"
                  >
                    <span>Launch Trading Terminal</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#00FF66]" />
                  </a>
                </div>
              </div>

              {/* Visual Column (7 Cols): Multi-Asset Terminal Grid */}
              <div className="lg:col-span-7">
                <div className="glass-card p-6 sm:p-7 border-[rgba(255,255,255,0.12)] relative overflow-hidden bg-[#0A0A0A] shadow-2xl space-y-4">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                      <span className="text-xs font-bold text-white tracking-wider">MANAGEME MARKET FEED</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8B95A5]">
                      <span>LATENCY: <strong className="text-[#00FF66]">12ms</strong></span>
                      <span>&bull;</span>
                      <span>CAPITAL: <strong className="text-white tabular-nums">$100,000.00</strong></span>
                    </div>
                  </div>

                  {/* Market Region Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-[11px]">
                    <span className="px-2.5 py-1 rounded bg-[#00FF66]/15 text-[#00FF66] font-bold border border-[#00FF66]/30 cursor-pointer">
                      US / NASDAQ
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/5 text-[#8B95A5] hover:text-white border border-white/10 cursor-pointer">
                      GB / LSE
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/5 text-[#8B95A5] hover:text-white border border-white/10 cursor-pointer">
                      IN / NSE
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/5 text-[#8B95A5] hover:text-white border border-white/10 cursor-pointer">
                      EU / Euronext
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/5 text-[#8B95A5] hover:text-white border border-white/10 cursor-pointer">
                      SG / SGX
                    </span>
                  </div>

                  {/* Tabular Nums Ticks */}
                  <div className="space-y-2.5 font-mono tabular-nums">
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

                  {/* Level 2 & Performance Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8B95A5] font-mono">
                    <span>UNREALIZED P&L: <strong className="text-[#00FF66] tabular-nums">+$1,420.50 (+1.42%)</strong></span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-semibold">
                      LEVEL 2 ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollCard3D>


          {/* ----------------------------------------------------------------------- */}
          {/* FEATURE 4: Job Platform Auto-Sync Hub (Mockup Left, Text Right) */}
          {/* ----------------------------------------------------------------------- */}
          <ScrollCard3D>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Visual Column (7 Cols): Smart Sync Bridge Visual */}
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="glass-card p-7 border-[rgba(255,255,255,0.12)] relative overflow-hidden flex flex-col items-center justify-center text-center bg-[#0A0A0A] shadow-2xl space-y-6">
                  
                  {/* Concentric Node Network */}
                  <div className="relative flex items-center justify-center w-64 h-64">
                    <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20 pointer-events-none" />
                    <div className="absolute inset-4 rounded-full border border-[#0052FF]/20 pointer-events-none" />
                    <div className="absolute inset-12 rounded-full border border-white/10 pointer-events-none" />

                    {/* Center Core */}
                    <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-white p-0.5 shadow-lg shadow-[#0052FF]/30">
                      <div className="w-full h-full bg-black rounded-2xl flex flex-col items-center justify-center">
                        <Zap className="w-7 h-7 text-[#0052FF]" />
                        <span className="text-[9px] font-mono font-bold text-white mt-1">MANAGEME CRM</span>
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

                  {/* Parsed Metadata Card */}
                  <div className="w-full p-3.5 rounded-xl bg-black border border-white/[0.08] text-left font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Goldman Sachs &bull; Summer Analyst (M&A)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#00FF66]/20 text-[#00FF66] font-bold">SYNCED</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-[#8B95A5]">
                      <div>SALARY: <strong className="text-white">£55,000</strong></div>
                      <div>VISA SPONSOR: <strong className="text-[#00FF66]">YES</strong></div>
                      <div>ATS MATCH: <strong className="text-[#0052FF]">94%</strong></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Text Column (5 Cols) */}
              <div className="lg:col-span-5 space-y-5 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#0052FF] text-xs font-mono font-bold">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>AUTOMATED CAREER CRM</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tightest text-white leading-tight">
                  Job Platform Auto-Sync Hub
                </h3>

                {/* Purpose Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#0052FF] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]" />
                    <span>Purpose & Why It Exists</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F3F3F3] leading-relaxed">
                    Never manually enter a job application again. Seamlessly extract job metadata with one-click auto-capture.
                  </p>
                </div>

                {/* How to Use Block */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#00FF66] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                    <span>How to Use</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8B95A5] leading-relaxed">
                    Drag the Smart Sync bookmarklet to your browser. While viewing any opening on LinkedIn or Indeed, click the bookmark to automatically clip and sync the listing directly into your manageme pipeline.
                  </p>
                </div>

                {/* Feature Bullets */}
                <div className="space-y-2 pt-1 text-xs font-mono text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                    <span>1-Click Smart Bookmarklet for LinkedIn, Indeed, Handshake & Otta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                    <span>AI auto-parsing of base compensation, deadline & visa sponsorship</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                    <span>ATS keyword density optimizer & cold recruiter message generator</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/app?tab=jobs"
                    className="liquid-pill text-xs inline-flex items-center gap-2 text-white hover:border-[#0052FF]/50"
                  >
                    <span>Explore Pipeline CRM</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#0052FF]" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollCard3D>

        </div>

        {/* Footer */}
        <footer className="pt-10 pb-8 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B95A5] font-sans">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
            <span>&copy; {new Date().getFullYear()} manageme &bull; Career Intelligence OS</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white hover:underline transition-colors cursor-pointer">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white hover:underline transition-colors cursor-pointer">
              Terms of Service
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
