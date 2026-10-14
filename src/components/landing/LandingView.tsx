// Component: Master Landing Page View with Apple/Linear Aesthetics, 3D Spatial Cards, Scroll Parallax & FAQ

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  ChevronDown, 
  Zap, 
  HelpCircle,
  Clock,
  Layers,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { FeatureGrid } from './FeatureGrid';
import { SpatialCard } from '../ui/SpatialCard';
import { InteractiveCursorGlow } from '../canvas/InteractiveCursorGlow';

export interface LandingViewProps {
  onEnterApp: (tabId?: string) => void;
}

// Letter-stagger animation variants
const letterContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.025, delayChildren: 0.15 } },
};
const letterChild = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function StaggerText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.span variants={letterContainer} initial="hidden" animate="visible" className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span key={i} variants={letterChild} className="inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Scroll-linked parallax for hero dashboard
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start end', 'end start'] });
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [0.94, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [0.75, 1]);

  const faqs = [
    {
      q: 'How does the 1-click LinkedIn bookmarklet work?',
      a: 'Drag the "⚡ Save to ManageMe" button to your browser bookmarks bar. When viewing any role or graduate scheme on LinkedIn or Indeed, clicking the bookmarklet captures the job posting text, runs the AI parser to extract requirements, deadlines, and compensation, and automatically pre-fills your Career Vault.'
    },
    {
      q: 'How does the Visa Ledger calculate weekly hours and over-cap warnings?',
      a: 'The Visa Ledger aggregates all logged shift durations within the active Monday-to-Sunday term-time window against the UK Student Visa 20.0-hour legal cap. It displays remaining buffer hours in real time with tabular numerals and triggers immediate visual warnings when approaching or exceeding the limit.'
    },
    {
      q: 'How does Owner Mode protect personal records?',
      a: 'Owner Mode locks confidential notes, sensitive shift wage earnings, and full multi-sheet data exports behind client-side encryption and a secure master PIN, ensuring zero-trust privacy when working in shared or public university environments.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-white transition-colors duration-200">
      {/* Interactive Cursor Glow Layer */}
      <InteractiveCursorGlow />

      {/* Ambient Background Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/[0.08] via-blue-500/[0.03] to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[60%] -right-40 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(120,120,120,0.05)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 dark:opacity-20" />
      </div>

      {/* =================================================================== */}
      {/* 1. HERO SECTION WITH 3D FLOATING SPATIAL PREVIEW                   */}
      {/* =================================================================== */}
      <section className="relative pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] backdrop-blur-md text-xs font-mono tracking-widest uppercase text-neutral-600 dark:text-neutral-400 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>Unified Spatial Operating System</span>
        </motion.div>

        {/* Hero Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.035em] text-neutral-900 dark:text-[#EDEDEF] max-w-5xl leading-[1.08]">
          <StaggerText text="Master your markets." />
          <br />
          <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            <StaggerText text="Engineer your trajectory." />
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-base sm:text-lg text-[var(--text-muted)] max-w-2xl font-sans leading-relaxed"
        >
          A high-frequency desktop ecosystem unifying multi-asset trading, career pipeline CRM, study intelligence, and UK visa expense ledgers.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => {
              window.location.hash = '#trading';
              onEnterApp('trading');
            }}
            className="h-12 px-7 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-medium text-sm shadow-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              window.location.hash = '#jobs';
              onEnterApp('jobs');
            }}
            className="h-12 px-7 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-neutral-800 dark:text-neutral-200 font-medium text-sm hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Explore Career Vault</span>
          </button>
        </motion.div>

        {/* 3D Dashboard Mockup with scroll-linked elevation */}
        <motion.div
          ref={heroRef}
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="mt-16 w-full max-w-5xl relative"
        >
          {/* Floating Pill Badges */}
          <div className="absolute -top-4 -left-2 sm:-left-6 z-20">
            <button
              onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-[var(--text-primary)] hover:scale-105 transition-all shadow-sm cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>⚡ AI JD Parser Active</span>
            </button>
          </div>

          <div className="absolute -top-4 -right-2 sm:-right-6 z-20">
            <button
              onClick={() => { window.location.hash = '#ledger'; onEnterApp('work'); }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-[var(--text-primary)] hover:scale-105 transition-all shadow-sm cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono tabular-nums">UK Visa Cap: 0 / 20 hrs</span>
            </button>
          </div>

          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => { window.location.hash = '#trading'; onEnterApp('trading'); }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-[var(--text-primary)] hover:scale-105 transition-all shadow-sm cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>FTSE 100 &amp; S&amp;P 500 Live Ticks</span>
            </button>
          </div>

          {/* Main 3D Preview Container */}
          <SpatialCard className="p-3 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-white/[0.03] backdrop-blur-2xl">
            {/* Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-black/[0.06] dark:border-white/[0.06] mb-4 text-xs font-mono text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-bold text-[var(--text-primary)] font-sans text-xs">manageme OS</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px]">
                <span className="text-emerald-500 font-medium">● Markets Open</span>
                <span className="font-mono tabular-nums">UKVI Tier-4: Compliant</span>
                <span>Academic Portal</span>
              </div>
            </div>

            {/* Inner Dashboard Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              
              {/* Ticker & Order Book Preview */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">FTSE 100 Index</span>
                  <span className="text-emerald-500 font-bold font-mono tabular-nums">+0.64%</span>
                </div>
                <p className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)]">8,245.30</p>
                <div className="h-12 flex items-end gap-1 pt-2">
                  {[35, 45, 40, 60, 55, 75, 70, 90, 85, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-emerald-500/20 dark:bg-emerald-500/30 hover:bg-emerald-500/40 rounded-t transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Career Pipeline Preview */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Active Schemes</span>
                  <span className="text-indigo-500 font-bold">12 Tracked</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] pt-1">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] text-[var(--text-primary)]">
                    <span className="truncate">Top Tier • AM</span>
                    <span className="text-amber-500 font-bold">AC Prep</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] text-[var(--text-primary)]">
                    <span className="truncate">Global Bank • IB</span>
                    <span className="text-indigo-500 font-bold">Video Int.</span>
                  </div>
                </div>
              </div>

              {/* Visa Cap & Study Preview */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Weekly Visa Buffer</span>
                  <span className="text-emerald-500 font-bold font-mono tabular-nums">20.0h Free</span>
                </div>
                <p className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)]">0 / 20.0 hrs</p>
                <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[15%]" />
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                  Next exam: Corporate Finance revision in 14 days
                </span>
              </div>

            </div>
          </SpatialCard>
        </motion.div>
      </section>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE "HOW IT WORKS" 3-STEP FLOW                           */}
      {/* =================================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-14">
          <span className="text-xs font-mono font-medium uppercase tracking-widest text-indigo-500 bg-indigo-500/[0.06] px-3.5 py-1 rounded-full border border-indigo-500/[0.1]">
            Rapid Execution
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[var(--text-primary)] mt-4">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto mt-2 font-sans">
            From discovering a posting on LinkedIn to securing the offer and logging compliant hours.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {[
            { 
              step: '01', 
              title: '1-Click Capture', 
              desc: 'Import roles from LinkedIn or Indeed via the AI parser and bookmarklet.', 
              cta: 'Try Ingestion →', 
              tab: 'jobs' 
            },
            { 
              step: '02', 
              title: 'Tailor & Practice', 
              desc: 'Generate UK-standard cover letters, ATS bullets, and technical interview drills.', 
              cta: 'Career Copilot →', 
              tab: 'jobs' 
            },
            { 
              step: '03', 
              title: 'Track & Comply', 
              desc: 'Manage application stages, CFA revision, and your 20-hr visa cap.', 
              cta: 'Open Visa Ledger →', 
              tab: 'work' 
            },
          ].map((s) => (
            <motion.div
              key={s.step}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } }}
            >
              <SpatialCard className="p-6 flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 font-extrabold font-mono flex items-center justify-center text-sm">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <button
                  onClick={() => { 
                    window.location.hash = s.tab === 'work' ? '#ledger' : `#${s.tab}`; 
                    onEnterApp(s.tab); 
                  }}
                  className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-indigo-500 hover:text-indigo-400 transition-all cursor-pointer"
                >
                  <span>{s.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SpatialCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* =================================================================== */}
      {/* 3. 7 INTERACTIVE SUBSYSTEM CARDS                                   */}
      {/* =================================================================== */}
      <FeatureGrid onEnterApp={onEnterApp} />

      {/* =================================================================== */}
      {/* 4. EXPANDABLE FAQ ACCORDION                                         */}
      {/* =================================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono font-medium text-[var(--text-muted)] mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.035em] text-[var(--text-primary)]">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3 font-sans">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/80 dark:bg-zinc-950/80 border border-black/[0.06] dark:border-white/[0.08] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-[var(--text-primary)] cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-zinc-400'}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-black/[0.06] dark:border-white/[0.06] pt-3 font-sans">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. BOTTOM CTA BANNER & FOOTER                                      */}
      {/* =================================================================== */}
      <section className="py-16 px-4 max-w-5xl mx-auto text-center relative z-10">
        <SpatialCard className="p-8 sm:p-12 border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-[-0.035em]">
            Ready to elevate your career and trading?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto mt-2 mb-6">
            Join the executive workstation designed for serious career applicants, university students, and traders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                window.location.hash = '#trading';
                onEnterApp('trading');
              }}
              className="h-12 px-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-medium text-sm shadow-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Master Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </SpatialCard>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.06] py-8 px-4 text-center text-xs text-[var(--text-muted)] font-mono relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] font-sans text-sm">manageme</span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} All Rights Reserved</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="#privacy" 
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#privacy';
                onEnterApp('privacy');
              }} 
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Privacy
            </a>
            <span>•</span>
            <a 
              href="#terms" 
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#terms';
                onEnterApp('terms');
              }} 
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              Terms
            </a>
            <span>•</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingView;
