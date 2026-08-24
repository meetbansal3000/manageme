// Component: Master Landing Page View with Spatial 3D Cards, Scroll Parallax, Letter-Stagger Hero & FAQ

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
} from 'lucide-react';
import { FeatureGrid } from './FeatureGrid';
import { Button } from '../ui/Button';
import { SpatialCard } from '../ui/SpatialCard';
import { useAuth } from '../../context/AuthContext';
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
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
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
  const { signInAsGuest } = useAuth();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Scroll-linked parallax for hero dashboard
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start end', 'end start'] });
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [0.7, 1]);

  const faqs = [
    {
      q: 'How does the 1-click LinkedIn bookmarklet work?',
      a: 'Drag the "⚡ Save to ManageMe" button to your browser bookmarks toolbar. Whenever you browse a graduate scheme or role on LinkedIn, Indeed, or career portals, clicking the bookmarklet automatically opens ManageMe, captures the role title, link, and page text, and runs the AI parser to pre-fill your Career Vault.'
    },
    {
      q: 'How does the Visa Ledger calculate weekly hours and over-cap warnings?',
      a: 'The Visa Ledger aggregates all logged shift hours within the current Monday-to-Sunday term-time week against the UK Student Visa (Tier-4) 20.0-hour legal cap. It displays remaining buffer hours in real time and issues prominent amber and red warning alerts if you approach or exceed 20 hours.'
    },
    {
      q: 'Can I practice role-specific technical finance interview questions?',
      a: 'Yes! The AI Interview Copilot generates technical drills for Investment Banking, Private Equity, Asset Management, and Valuation. It covers 3-statement modeling flows, DCF bridge questions, LBO mechanics, and financial accounting standards with ideal model answers.'
    },
    {
      q: 'How does Owner Mode protect my personal application notes and shift logs?',
      a: 'ManageMe includes an encrypted Zero-Trust Owner Security layer. Sensitive actions—such as exporting full multi-sheet workbooks, editing shift wage records, or syncing to private cloud drives—require your master PIN, protecting your confidential notes even on shared devices.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#FBFBFD] dark:bg-[#09090B] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-white transition-colors duration-200">
      {/* Interactive Cursor Glow Layer */}
      <InteractiveCursorGlow />

      {/* Ambient Radial Background Glows — muted for quiet luxury */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/[0.06] via-indigo-400/[0.02] to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[65%] -right-40 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(120,120,120,0.04)_1px,transparent_1px)] [background-size:32px_32px] opacity-30 dark:opacity-20" />
      </div>

      {/* =================================================================== */}
      {/* 1. HERO SECTION — EDITORIAL HEADING + SCROLL-LINKED 3D DASHBOARD   */}
      {/* =================================================================== */}
      <section className="relative pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Top Release Pill — hairline micro-blur */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Unified Spatial Operating System for High Performers</span>
        </motion.div>

        {/* Main Title — letter-stagger animation */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-[#1D1D1F] dark:text-[#F5F5F7] max-w-5xl leading-[1.06]">
          <StaggerText text="Master your markets." />
          <br />
          <span className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            <StaggerText text="Engineer your trajectory." />
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl font-sans leading-relaxed"
        >
          A high-frequency desktop ecosystem unifying multi-asset trading, career pipeline CRM, study intelligence, and UK visa expense ledgers.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              window.location.hash = '#trading';
              onEnterApp('trading');
            }}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-bold shadow-lg shadow-indigo-500/15"
          >
            Launch Terminal -&gt;
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              window.location.hash = '#jobs';
              onEnterApp('jobs');
            }}
            leftIcon={<Briefcase className="w-4 h-4 text-zinc-500" />}
          >
            Explore Career Vault
          </Button>
        </motion.div>

        {/* 3D Floating Dashboard Preview — wrapped in SpatialCard with scroll-linked scaling */}
        <motion.div
          ref={heroRef}
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="mt-16 w-full max-w-5xl relative"
        >
          {/* Floating Pill Badges — hairline micro-blur */}
          <div className="absolute -top-4 -left-2 sm:-left-6 z-20">
            <button
              onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:scale-105 hover:border-indigo-500/30 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>⚡ AI JD Parser Active</span>
            </button>
          </div>

          <div className="absolute -top-4 -right-2 sm:-right-6 z-20">
            <button
              onClick={() => { window.location.hash = '#ledger'; onEnterApp('work'); }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:scale-105 hover:border-indigo-500/30 transition-all cursor-pointer"
            >
              <span>🇬🇧 UK 20-Hr Visa Cap: 0/20 hrs</span>
            </button>
          </div>

          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => { window.location.hash = '#trading'; onEnterApp('trading'); }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:scale-105 hover:border-indigo-500/30 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>📈 FTSE 100 &amp; S&amp;P 500 Live Ticks</span>
            </button>
          </div>

          {/* Main 3D Preview Container — SpatialCard with preserve-3d depth */}
          <SpatialCard className="p-3 sm:p-5">
            {/* Mock Header Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-black/[0.06] dark:border-white/[0.06] mb-4 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-sans text-xs">manageme OS</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px]">
                <span className="text-emerald-500 font-medium">● Markets Open</span>
                <span>Tier-4 Visa: 100% Compliant</span>
                <span>University Academic Portal</span>
              </div>
            </div>

            {/* Inner Dashboard Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              
              {/* Ticker & Order Book Preview */}
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">FTSE 100 Index</span>
                  <span className="text-emerald-500 font-bold tabular-numbers">+0.64%</span>
                </div>
                <p className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-numbers">8,245.30</p>
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
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Active Schemes</span>
                  <span className="text-indigo-500 font-bold">12 Tracked</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] pt-1">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300">
                    <span className="truncate">Goldman Sachs • AM</span>
                    <span className="text-amber-500 font-bold">AC Prep</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300">
                    <span className="truncate">Morgan Stanley • IB</span>
                    <span className="text-indigo-500 font-bold">Video Int.</span>
                  </div>
                </div>
              </div>

              {/* Visa Cap & Study Preview */}
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Weekly Visa Buffer</span>
                  <span className="text-emerald-500 font-bold">20.0h Free</span>
                </div>
                <p className="text-xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] tabular-numbers">0 / 20.0 hrs</p>
                <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[15%]" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 block">
                  Next exam: Advanced Corporate Finance in 14 days
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
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#1D1D1F] dark:text-[#F5F5F7] mt-4">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mt-2 font-sans">
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
            { step: '01', title: '1-Click Capture', desc: 'Ingest roles directly from LinkedIn, Indeed, or raw text via the AI parser and browser bookmarklet.', cta: 'Try Job Ingestion', tab: 'jobs', color: 'indigo' },
            { step: '02', title: 'Tailor & Prepare', desc: 'Generate 3-paragraph UK cover letters, ATS CV bullets, and technical interview drills instantly.', cta: 'View Career Copilot', tab: 'jobs', color: 'indigo' },
            { step: '03', title: 'Track & Comply', desc: 'Monitor application stages, CFA revision milestones, and the 20-hr visa limit in real time.', cta: 'Open Visa Ledger', tab: 'work', color: 'emerald' },
          ].map((s) => (
            <motion.div
              key={s.step}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } }}
            >
              <SpatialCard className="p-6 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 font-extrabold font-mono flex items-center justify-center text-sm">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <button
                  onClick={() => { window.location.hash = `#${s.tab}`; onEnterApp(s.tab); }}
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
      {/* 3. 7 INTERACTIVE 3D FEATURE CARDS                                  */}
      {/* =================================================================== */}
      <FeatureGrid onEnterApp={onEnterApp} />

      {/* =================================================================== */}
      {/* 4. INTERACTIVE FAQ ACCORDION SECTION                                */}
      {/* =================================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.035em] text-[#1D1D1F] dark:text-[#F5F5F7]">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3 font-sans">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-white/[0.08] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-[#1D1D1F] dark:text-[#F5F5F7] cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
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
                      <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/60 dark:border-white/[0.06] pt-3 font-sans">
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
        <SpatialCard className="p-8 sm:p-12">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.035em]">
            Ready to elevate your career and trading?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-2 mb-6">
            Join the executive workstation designed for serious career applicants, university students, and traders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                window.location.hash = '#trading';
                onEnterApp('trading');
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Master Workspace
            </Button>
          </div>
        </SpatialCard>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-zinc-200/60 dark:border-white/[0.06] py-8 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 font-mono relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-sans text-sm">manageme</span>
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
              className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
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
              className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
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
