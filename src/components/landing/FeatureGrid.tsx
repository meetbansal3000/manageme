// Component: Landing Page Feature Grid with 7 SpatialCard Subsystems & Exact Anchor Jumps

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Printer, 
  Download, 
} from 'lucide-react';
import { SpatialCard } from '../ui/SpatialCard';

export interface FeatureGridProps {
  onEnterApp: (tabId?: string) => void;
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerChild = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onEnterApp }) => {
  // Interactive flashcard state for Copilot
  const [showAnswer, setShowAnswer] = useState(false);

  // Interactive wage slider state
  const [calcHours, setCalcHours] = useState(16);
  const [calcRate, setCalcRate] = useState(15.5);

  // Market terminal region state
  const [selectedRegion, setSelectedRegion] = useState<'UK' | 'US' | 'IN' | 'EU' | 'SG'>('UK');

  const regionTicks = {
    UK: { name: 'FTSE 100', val: '8,245.30', chg: '+0.64%', color: 'text-emerald-500' },
    US: { name: 'S&P 500', val: '5,638.10', chg: '+0.85%', color: 'text-emerald-500' },
    IN: { name: 'NIFTY 50', val: '24,852.15', chg: '+0.42%', color: 'text-emerald-500' },
    EU: { name: 'DAX 40', val: '18,520.40', chg: '-0.18%', color: 'text-rose-400' },
    SG: { name: 'STI Index', val: '3,540.80', chg: '+0.31%', color: 'text-emerald-500' }
  };

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono font-medium text-[var(--text-muted)] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Complete High-Frequency Suite</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[var(--text-primary)]">
          7 Purpose-Built Intelligence Modules
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto mt-3 font-sans">
          Engineered without fluff for finance students, multi-asset traders, and UK Tier-4 visa holders.
        </p>
      </div>

      {/* 7 Feature Grid — SpatialCard instances with whileInView stagger */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        
        {/* CARD 1: Career Vault & Multi-View Board -> #jobs */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/[0.08] text-amber-500 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)]">
                  Kanban + Table
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Career Vault & Multi-View Board
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 mb-4 leading-relaxed">
                Track 2026 graduate schemes and internships across IB, PE, AM, and quantitative advisory.
              </p>

              {/* Live Interactive Preview */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] font-medium">
                  <span>Active Pipeline Stages</span>
                  <span className="text-emerald-500 font-mono tabular-nums">3 Offers</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/[0.12] text-amber-600 dark:text-amber-400">
                    <span className="block font-bold">Goldman</span>
                    <span className="text-[9px] opacity-75">Applied</span>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/[0.12] text-indigo-600 dark:text-indigo-400">
                    <span className="block font-bold">Morgan S.</span>
                    <span className="text-[9px] opacity-75">Video Int.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.12] text-emerald-600 dark:text-emerald-400">
                    <span className="block font-bold">BlackRock</span>
                    <span className="text-[9px] opacity-75">Offer 🎉</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
              className="w-full py-2.5 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>Open Career Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SpatialCard>
        </motion.div>

        {/* CARD 2: AI Interview Copilot & CV Tailor -> #jobs */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)]">
                  Gemini Copilot
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                AI Interview Copilot & CV Tailor
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 mb-4 leading-relaxed">
                Drill technical valuation questions, bridge EV to Equity Value, and tailor ATS bullet points in seconds.
              </p>

              {/* Live Interactive Preview: Flashcard */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-indigo-500">Technical Drill</span>
                  <button
                    type="button"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="text-[10px] text-indigo-500 hover:underline cursor-pointer"
                  >
                    {showAnswer ? 'Hide Answer' : 'Show Ideal Points'}
                  </button>
                </div>
                <p className="text-[11px] font-sans text-[var(--text-primary)] font-medium">
                  &quot;Walk me through how a £10 depreciation increase flows through the 3 statements at a 25% tax rate.&quot;
                </p>
                {showAnswer && (
                  <div className="text-[10px] font-mono p-2 rounded-lg bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-300 border border-indigo-500/[0.12]">
                    IS: Net Income -£7.50 | CFS: Cash +£2.50 | BS: PP&amp;E -£10, Cash +£2.50, Retained Earnings -£7.50.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
              className="w-full py-2.5 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>Career Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SpatialCard>
        </motion.div>

        {/* CARD 3: UK Visa & Wage Compliance Ledger -> #ledger */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)]">
                  UKVI 20h Cap
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                UK Visa & Wage Compliance Ledger
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 mb-4 leading-relaxed">
                Track legal work hour thresholds, calculate gross weekly earnings, and prevent visa violations.
              </p>

              {/* Live Interactive Preview: Progress Meter */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[var(--text-muted)]">Weekly Shift Progress</span>
                  <span className="font-bold text-[var(--text-primary)] font-mono tabular-nums">{calcHours} / 20.0h</span>
                </div>
                <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      calcHours > 20 ? 'bg-rose-500' : calcHours >= 18 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, (calcHours / 20) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[var(--text-muted)]">
                  <span>Est. Gross: <strong className="text-emerald-500 font-mono tabular-nums">£{(calcHours * calcRate).toFixed(2)}</strong></span>
                  <span className="text-emerald-500 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> 100% Compliant
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { window.location.hash = '#ledger'; onEnterApp('work'); }}
              className="w-full py-2.5 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>Open Visa Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SpatialCard>
        </motion.div>

        {/* CARD 4: Academic Study Engine & CFA Matrix -> #study */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/[0.08] text-emerald-500 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)]">
                  Degree + CFA Matrix
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Academic Study Engine & CFA Matrix
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 mb-4 leading-relaxed">
                Curated modules for university academic courses & 10 CFA topic revision trackers.
              </p>

              {/* Live Interactive Preview */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-1.5 mb-4 font-mono text-[10px]">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400">
                  <span>Advanced Corporate Finance</span>
                  <span className="font-bold font-mono tabular-nums">92%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400">
                  <span>Derivatives & Financial Engineering</span>
                  <span className="font-bold font-mono tabular-nums">85%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] text-[var(--text-primary)]">
                  <span>CFA Level 1: FSA & Quant</span>
                  <span className="font-bold">100% Complete</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { window.location.hash = '#study'; onEnterApp('study'); }}
              className="w-full py-2.5 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>Open Study Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SpatialCard>
        </motion.div>

        {/* CARD 5: Cold Email & Recruiter CRM Suite -> #outreach */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/[0.08] text-rose-500 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)]">
                  AI Pitch Engine
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Cold Email & Recruiter CRM Suite
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 mb-4 leading-relaxed">
                Auto-generate tailored recruiter pitches citing your academic background and valuation experience.
              </p>

              {/* Live Interactive Preview */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-1.5 mb-4 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)] pb-1 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <Send className="w-3 h-3 text-rose-500" />
                  <span className="truncate">To: recruiter@company.com</span>
                </div>
                <p className="text-[var(--text-primary)] line-clamp-2 italic font-sans text-[11px] pt-1">
                  &quot;Subject: Career Inquiry - Investment Analyst - Target Firm...&quot;
                </p>
                <div className="flex items-center justify-between text-[9px] text-emerald-500 pt-1">
                  <span>1-Click Copy &amp; Gmail Draft</span>
                  <span>Ready</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { window.location.hash = '#outreach'; onEnterApp('outreach'); }}
              className="w-full py-2.5 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-rose-500 hover:text-rose-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>Launch Email Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SpatialCard>
        </motion.div>

        {/* CARD 6: Multi-Region Valuation Terminal -> #trading */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)]">
                  5 Global Exchanges
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Multi-Region Valuation Terminal
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 mb-4 leading-relaxed">
                Real-time quotes, multi-currency valuation benchmarks, and simulated paper portfolio orders.
              </p>

              {/* Live Interactive Preview: Region Ticks */}
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
                <div className="flex items-center justify-between gap-1">
                  {(['UK', 'US', 'IN', 'EU', 'SG'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRegion(r)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedRegion === r 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-black/[0.04] dark:bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between font-mono text-xs pt-1">
                  <span className="font-bold text-[var(--text-primary)]">{regionTicks[selectedRegion].name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-primary)] font-mono tabular-nums">{regionTicks[selectedRegion].val}</span>
                    <span className={`font-bold font-mono tabular-nums ${regionTicks[selectedRegion].color}`}>{regionTicks[selectedRegion].chg}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => { window.location.hash = '#trading'; onEnterApp('trading'); }}
              className="w-full py-2.5 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>Open Trading Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </SpatialCard>
        </motion.div>

        {/* CARD 7: Executive Compliance & PDF Reports -> #jobs */}
        <motion.div variants={staggerChild} className="md:col-span-2 lg:col-span-3">
          <SpatialCard className="p-6 border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)]">
                    Printable PDF + RFC 4180 CSV
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  Executive Compliance & PDF Reports
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Generate high-resolution printable PDF summaries of your recruitment pipeline, visa compliance audits, and export raw CSV records for spreadsheet analysis.
                </p>
              </div>

              {/* Live Interactive Preview: Printable Badge & Download Chips */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/[0.1] text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  <Download className="w-4 h-4" />
                  <span>applications.csv</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.1] text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <Download className="w-4 h-4" />
                  <span>visa_shifts.csv</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-[var(--text-primary)]">
                  <Printer className="w-4 h-4" />
                  <span>Executive_Summary.pdf</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Instant 1-click downloads with UTF-8 BOM Excel compatibility
              </span>
              <button
                onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
                className="py-2 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Executive Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpatialCard>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default FeatureGrid;
