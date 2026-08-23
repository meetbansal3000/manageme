// Component: Master Landing Page View with 3D Mockup, 3-Step Flow, 7 Features & FAQ

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  ChevronDown, 
  CheckCircle2, 
  Zap, 
  Globe, 
  Lock, 
  Terminal, 
  MousePointer, 
  Layers, 
  FileText, 
  Bookmark, 
  HelpCircle,
  ExternalLink,
  DollarSign,
  Activity,
  Play
} from 'lucide-react';
import { FeatureGrid } from './FeatureGrid';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthButton } from '../auth/GoogleAuthButton';
import { InteractiveCursorGlow } from '../canvas/InteractiveCursorGlow';

export interface LandingViewProps {
  onEnterApp: (tabId?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  const { signInAsGuest } = useAuth();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      a: 'Yes! The AI Interview Copilot generates technical drills for Investment Banking, Private Equity, Asset Management, and Valuation. It covers 3-statement modeling flows, DCF bridge questions, LBO mechanics, and IFRS/ACCA accounting treatments with ideal model answers.'
    },
    {
      q: 'How does Owner Mode protect my personal application notes and shift logs?',
      a: 'ManageMe includes an encrypted Zero-Trust Owner Security layer. Sensitive actions—such as exporting full multi-sheet workbooks, editing shift wage records, or syncing to private cloud drives—require your master PIN, protecting your confidential notes even on shared devices.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Interactive Cursor Glow Layer */}
      <InteractiveCursorGlow />

      {/* Ambient Radial Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-40 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[65%] -right-40 w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(120,120,120,0.05)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* =================================================================== */}
      {/* 1. HERO SECTION & 3D FLOATING DASHBOARD MOCKUP                     */}
      {/* =================================================================== */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Top Release Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 mb-6 backdrop-blur-md hover:border-blue-500/50 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unified Spatial Operating System for High Performers</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-5xl leading-[1.08]"
        >
          Master your markets. <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            Engineer your trajectory.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl font-sans leading-relaxed"
        >
          A high-frequency desktop ecosystem unifying multi-asset trading, career pipeline CRM, study intelligence, and UK visa expense ledgers.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
            className="font-bold shadow-xl shadow-blue-500/20"
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
            leftIcon={<Briefcase className="w-4 h-4 text-amber-500" />}
          >
            Explore Career Vault
          </Button>
        </motion.div>

        {/* 3D Isometric Perspective Dashboard Preview Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 w-full max-w-5xl relative group [perspective:1000px]"
        >
          {/* Floating Pill Badges around Mockup */}
          <div className="absolute -top-4 -left-2 sm:-left-6 z-20">
            <button
              onClick={() => {
                window.location.hash = '#jobs';
                onEnterApp('jobs');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white border border-amber-500/40 shadow-xl shadow-amber-500/10 text-xs font-mono font-bold hover:scale-105 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-md"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ AI JD Parser Active</span>
            </button>
          </div>

          <div className="absolute -top-4 -right-2 sm:-right-6 z-20">
            <button
              onClick={() => {
                window.location.hash = '#ledger';
                onEnterApp('work');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white border border-blue-500/40 shadow-xl shadow-blue-500/10 text-xs font-mono font-bold hover:scale-105 hover:border-blue-400 transition-all cursor-pointer backdrop-blur-md"
            >
              <span>🇬🇧 UK 20-Hr Visa Cap: 0/20 hrs</span>
            </button>
          </div>

          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => {
                window.location.hash = '#trading';
                onEnterApp('trading');
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 text-white border border-emerald-500/40 shadow-xl shadow-emerald-500/10 text-xs font-mono font-bold hover:scale-105 hover:border-emerald-400 transition-all cursor-pointer backdrop-blur-md"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>📈 FTSE 100 &amp; S&amp;P 500 Live Ticks</span>
            </button>
          </div>

          {/* 3D Isometric View Box */}
          <div className="p-3 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl transition-transform duration-500 [transform:rotateX(4deg)] group-hover:[transform:rotateX(0deg)]">
            
            {/* Mock Header Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-bold text-white font-sans text-xs">manageme OS</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px]">
                <span className="text-emerald-400 font-bold">● Markets Open</span>
                <span>Tier-4 Visa: 100% Compliant</span>
                <span>Durham MSc Finance</span>
              </div>
            </div>

            {/* Inner Dashboard Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              
              {/* Ticker & Order Book Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">FTSE 100 Index</span>
                  <span className="text-emerald-400 font-bold">+0.64%</span>
                </div>
                <p className="text-xl font-bold font-mono text-white">8,245.30</p>
                <div className="h-12 flex items-end gap-1 pt-2">
                  {[35, 45, 40, 60, 55, 75, 70, 90, 85, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-emerald-500/30 hover:bg-emerald-400 rounded-t transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Career Pipeline Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Active Schemes</span>
                  <span className="text-blue-400 font-bold">12 Tracked</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] pt-1">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                    <span className="truncate">Goldman Sachs • AM</span>
                    <span className="text-amber-400 font-bold">AC Prep</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                    <span className="truncate">Morgan Stanley • IB</span>
                    <span className="text-blue-400 font-bold">Video Int.</span>
                  </div>
                </div>
              </div>

              {/* Visa Cap & Study Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Weekly Visa Buffer</span>
                  <span className="text-emerald-400 font-bold">20.0h Free</span>
                </div>
                <p className="text-xl font-bold font-mono text-white">0 / 20.0 hrs</p>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[15%]" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 block">
                  Next exam: Advanced Corporate Finance in 14 days
                </span>
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE "HOW IT WORKS" 3-STEP FLOW                           */}
      {/* =================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">
            Rapid Execution
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mt-3">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mt-2 font-sans">
            From discovering a posting on LinkedIn to securing the offer and logging compliant hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="group p-6 rounded-3xl bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-md hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 font-extrabold font-mono flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                1-Click Capture
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Ingest roles directly from LinkedIn, Indeed, or raw text via the AI parser and browser bookmarklet.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#jobs';
                onEnterApp('jobs');
              }}
              className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-blue-500 hover:text-blue-400 group-hover:translate-x-1 transition-all cursor-pointer"
            >
              <span>Try Job Ingestion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 2 */}
          <div className="group p-6 rounded-3xl bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-md hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-purple-500/10 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 font-extrabold font-mono flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Tailor &amp; Prepare
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Generate 3-paragraph UK cover letters, ATS CV bullets, and technical interview drills instantly.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#jobs';
                onEnterApp('jobs');
              }}
              className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-purple-500 hover:text-purple-400 group-hover:translate-x-1 transition-all cursor-pointer"
            >
              <span>View Career Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 3 */}
          <div className="group p-6 rounded-3xl bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-md hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 font-extrabold font-mono flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Track &amp; Comply
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Monitor application stages, CFA revision milestones, and the 20-hr visa limit in real time.
              </p>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#ledger';
                onEnterApp('work');
              }}
              className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-emerald-500 hover:text-emerald-400 group-hover:translate-x-1 transition-all cursor-pointer"
            >
              <span>Open Visa Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. 7 INTERACTIVE 3D FEATURE CARDS                                  */}
      {/* =================================================================== */}
      <FeatureGrid onEnterApp={onEnterApp} />

      {/* =================================================================== */}
      {/* 4. INTERACTIVE FAQ ACCORDION SECTION                                */}
      {/* =================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-500 dark:text-blue-400 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3 font-sans">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-[var(--text-primary)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-3 font-sans">
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
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/20 backdrop-blur-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Ready to elevate your career and trading?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-2 mb-6">
            Join the executive workstation designed for serious finance applicants, MSc students, and traders.
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
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-4 text-center text-xs text-[var(--text-secondary)] font-mono relative z-10">
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
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingView;
