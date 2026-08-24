// Component: Landing Page Feature Grid with 7 SpatialCard Instances & whileInView Stagger

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
import { Button } from '../ui/Button';
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
  // Card 2 interactive flashcard state
  const [showAnswer, setShowAnswer] = useState(false);

  // Card 3 interactive wage calculator state
  const [calcHours, setCalcHours] = useState(16);
  const [calcRate, setCalcRate] = useState(15.5);

  // Card 6 market terminal region state
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Complete High-Frequency Suite</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#1D1D1F] dark:text-[#F5F5F7]">
          7 Purpose-Built Intelligence Modules
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mt-3 font-sans">
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
        
        {/* CARD 1: Career Vault & Multi-View Board */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/[0.08] text-amber-500 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                  Kanban + Table
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Career Vault & Pipeline
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4 leading-relaxed">
                Track 2026 graduate schemes and internships across IB, PE, AM, and Big 4 audit.
              </p>

              {/* Live Interactive Preview: Mini Kanban Column */}
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 font-medium">
                  <span>Active Pipeline Stages</span>
                  <span className="text-emerald-500">3 Offers</span>
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-full justify-between font-mono text-xs hover:border-indigo-500 hover:text-indigo-500"
            >
              Open Career Vault
            </Button>
          </SpatialCard>
        </motion.div>

        {/* CARD 2: AI Interview Copilot & CV Tailor */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                  Gemini 2.5 Copilot
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                AI Interview Copilot & CV Tailor
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4 leading-relaxed">
                Drill valuation questions, bridge EV to Equity Value, and tailor ATS bullet points in seconds.
              </p>

              {/* Live Interactive Preview: Technical Question Flashcard */}
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
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
                <p className="text-[11px] font-sans text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
                  "Walk me through how a £10 depreciation increase flows through the 3 statements at a 25% tax rate."
                </p>
                {showAnswer && (
                  <div className="text-[10px] font-mono p-2 rounded-lg bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-300 border border-indigo-500/[0.12]">
                    IS: Net Income -£7.50 | CFS: Cash +£2.50 | BS: PP&E -£10, Cash +£2.50, Retained Earnings -£7.50 (Balanced).
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-full justify-between font-mono text-xs hover:border-indigo-500 hover:text-indigo-500"
            >
              Practice Interviews
            </Button>
          </SpatialCard>
        </motion.div>

        {/* CARD 3: UK Visa & Wage Compliance Ledger */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                  UK Home Office 20h Cap
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                UK Visa & Wage Ledger
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4 leading-relaxed">
                Track legal work hour thresholds, calculate gross weekly earnings, and prevent visa violations.
              </p>

              {/* Live Interactive Preview: Progress Meter & Wage Slider */}
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Weekly Shift Progress</span>
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-numbers">{calcHours}/20.0h</span>
                </div>
                <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      calcHours > 20 ? 'bg-rose-500' : calcHours >= 18 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, (calcHours / 20) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-zinc-500">
                  <span>Est. Gross: <strong className="text-emerald-500 tabular-numbers">£{(calcHours * calcRate).toFixed(2)}</strong></span>
                  <span className="text-emerald-500 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> 100% Compliant
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { window.location.hash = '#ledger'; onEnterApp('work'); }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-full justify-between font-mono text-xs hover:border-indigo-500 hover:text-indigo-500"
            >
              Open Visa Ledger
            </Button>
          </SpatialCard>
        </motion.div>

        {/* CARD 4: Study Engine & CFA Level 1 Matrix */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/[0.08] text-emerald-500 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                  Academic Degree + CFA
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Study Engine & CFA Matrix
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4 leading-relaxed">
                Curated modules for university academic courses & 10 CFA topic revision trackers.
              </p>

              {/* Live Interactive Preview: Progress Module Badges */}
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-1.5 mb-4 font-mono text-[10px]">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400">
                  <span>Advanced Corporate Finance</span>
                  <span className="font-bold tabular-numbers">92%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400">
                  <span>Derivatives & Financial Engineering</span>
                  <span className="font-bold tabular-numbers">85%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-500/[0.08] text-zinc-600 dark:text-zinc-300">
                  <span>CFA Level 1: FSA & Quant</span>
                  <span className="font-bold">100% Complete</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { window.location.hash = '#study'; onEnterApp('study'); }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-full justify-between font-mono text-xs hover:border-emerald-500 hover:text-emerald-500"
            >
              Open Study Engine
            </Button>
          </SpatialCard>
        </motion.div>

        {/* CARD 5: Cold Email & Recruiter CRM */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/[0.08] text-rose-500 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                  AI Templates
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Cold Email & Recruiter CRM
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4 leading-relaxed">
                Auto-generate tailored recruiter pitches citing your academic background and valuation experience.
              </p>

              {/* Live Interactive Preview: Mini Email Composer */}
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-1.5 mb-4 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-zinc-500 pb-1 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <Send className="w-3 h-3 text-rose-500" />
                  <span className="truncate">To: recruiter@example.com</span>
                </div>
                <p className="text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-2 italic font-sans text-[11px] pt-1">
                  "Subject: Analyst Application & Coffee Chat Inquiry..."
                </p>
                <div className="flex items-center justify-between text-[9px] text-emerald-500 pt-1">
                  <span>1-Click Copy & Gmail Draft</span>
                  <span>Ready</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { window.location.hash = '#outreach'; onEnterApp('outreach'); }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-full justify-between font-mono text-xs hover:border-rose-500 hover:text-rose-500"
            >
              Launch Email Suite
            </Button>
          </SpatialCard>
        </motion.div>

        {/* CARD 6: Multi-Region Valuation Terminal */}
        <motion.div variants={staggerChild}>
          <SpatialCard className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                  5 Global Exchanges
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Multi-Region Terminal
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 mb-4 leading-relaxed">
                Real-time quotes, multi-currency valuation benchmarks, and simulated paper portfolio orders.
              </p>

              {/* Live Interactive Preview: Region Ticks */}
              <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-2 mb-4">
                <div className="flex items-center justify-between gap-1">
                  {(['UK', 'US', 'IN', 'EU', 'SG'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRegion(r)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedRegion === r 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-black/[0.04] dark:bg-white/[0.04] text-zinc-500 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between font-mono text-xs pt-1">
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{regionTicks[selectedRegion].name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1D1D1F] dark:text-[#F5F5F7] tabular-numbers">{regionTicks[selectedRegion].val}</span>
                    <span className={`font-bold tabular-numbers ${regionTicks[selectedRegion].color}`}>{regionTicks[selectedRegion].chg}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { window.location.hash = '#trading'; onEnterApp('trading'); }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-full justify-between font-mono text-xs hover:border-indigo-500 hover:text-indigo-500"
            >
              Open Trading Terminal
            </Button>
          </SpatialCard>
        </motion.div>

        {/* CARD 7: Executive Reporting & Exporters — full width */}
        <motion.div variants={staggerChild} className="md:col-span-2 lg:col-span-3">
          <SpatialCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/[0.08] text-indigo-500 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-zinc-900/[0.06] dark:bg-white/[0.05] border border-zinc-900/[0.08] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400">
                    Printable A4 PDF + RFC 4180 CSV
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Executive Reporting & Data Exporters
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Generate high-resolution printable PDF summaries of your recruitment pipeline, visa compliance audits, and export raw CSV records for Excel.
                </p>
              </div>

              {/* Live Interactive Preview: Printable Badge & Quick Download */}
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/[0.1] text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  <Download className="w-4 h-4" />
                  <span>applications.csv</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.1] text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <Download className="w-4 h-4" />
                  <span>visa_shifts.csv</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-500/[0.06] border border-zinc-500/[0.1] text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  <Printer className="w-4 h-4" />
                  <span>Executive_Summary.pdf</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500">
                Instant 1-click downloads with UTF-8 BOM Excel compatibility
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { window.location.hash = '#jobs'; onEnterApp('jobs'); }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="font-mono text-xs hover:border-indigo-500 hover:text-indigo-500"
              >
                View Executive Reports
              </Button>
            </div>
          </SpatialCard>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default FeatureGrid;
