// Component: Landing Page Feature Grid with 7 Interactive 3D Cards & Direct Tool Launchers

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Mail, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  Send, 
  Printer, 
  Download, 
  ExternalLink,
  ChevronRight,
  Globe,
  Sliders,
  Play,
  Check,
  Building2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface FeatureGridProps {
  onEnterApp: (tabId?: string) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onEnterApp }) => {
  // Card 2 interactive flashcard state
  const [showAnswer, setShowAnswer] = useState(false);

  // Card 3 interactive wage calculator state
  const [calcHours, setCalcHours] = useState(16);
  const [calcRate, setCalcRate] = useState(15.5);

  // Card 6 market terminal region state
  const [selectedRegion, setSelectedRegion] = useState<'UK' | 'US' | 'IN' | 'EU' | 'SG'>('UK');

  const regionTicks = {
    UK: { name: 'FTSE 100', val: '8,245.30', chg: '+0.64%', color: 'text-emerald-400' },
    US: { name: 'S&P 500', val: '5,638.10', chg: '+0.85%', color: 'text-emerald-400' },
    IN: { name: 'NIFTY 50', val: '24,852.15', chg: '+0.42%', color: 'text-emerald-400' },
    EU: { name: 'DAX 40', val: '18,520.40', chg: '-0.18%', color: 'text-rose-400' },
    SG: { name: 'STI Index', val: '3,540.80', chg: '+0.31%', color: 'text-emerald-400' }
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-500 dark:text-blue-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Complete High-Frequency Suite</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          7 Purpose-Built Intelligence Modules
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto mt-3 font-sans">
          Engineered without fluff for finance students, multi-asset traders, and UK Tier-4 visa holders.
        </p>
      </div>

      {/* 7 Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: Career Vault & Multi-View Board */}
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400">
                Kanban + Table
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Career Vault & Pipeline
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-4 leading-relaxed">
              Track 2026 graduate schemes and internships across IB, PE, AM, and Big 4 audit.
            </p>

            {/* Live Interactive Preview: Mini Kanban Column */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] space-y-2 mb-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)] font-semibold">
                <span>Active Pipeline Stages</span>
                <span className="text-emerald-500 dark:text-emerald-400">3 Offers</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-300">
                  <span className="block font-bold">Goldman</span>
                  <span className="text-[9px] opacity-75">Applied</span>
                </div>
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-300">
                  <span className="block font-bold">Morgan S.</span>
                  <span className="text-[9px] opacity-75">Video Int.</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-300">
                  <span className="block font-bold">BlackRock</span>
                  <span className="text-[9px] opacity-75">Offer 🎉</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = '#jobs';
              onEnterApp('jobs');
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full justify-between font-mono text-xs hover:border-amber-500 hover:text-amber-500"
          >
            Open Career Vault
          </Button>
        </div>

        {/* CARD 2: AI Interview Copilot & CV Tailor */}
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 dark:text-purple-400">
                Gemini 2.5 Copilot
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              AI Interview Copilot & CV Tailor
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-4 leading-relaxed">
              Drill valuation questions, bridge EV to Equity Value, and tailor ATS bullet points in seconds.
            </p>

            {/* Live Interactive Preview: Technical Question Flashcard */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] space-y-2 mb-4">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-purple-500 dark:text-purple-400">Technical Drill</span>
                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-[10px] text-blue-500 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {showAnswer ? 'Hide Answer' : 'Show Ideal Points'}
                </button>
              </div>
              <p className="text-[11px] font-sans text-[var(--text-primary)] font-medium">
                "Walk me through how a £10 depreciation increase flows through the 3 statements at a 25% tax rate."
              </p>
              {showAnswer && (
                <div className="text-[10px] font-mono p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  IS: Net Income -£7.50 | CFS: Cash +£2.50 | BS: PP&E -£10, Cash +£2.50, Retained Earnings -£7.50 (Balanced).
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = '#jobs';
              onEnterApp('jobs');
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full justify-between font-mono text-xs hover:border-purple-500 hover:text-purple-500"
          >
            Practice Interviews
          </Button>
        </div>

        {/* CARD 3: UK Visa & Wage Compliance Ledger */}
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400">
                UK Home Office 20h Cap
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              UK Visa & Wage Ledger
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-4 leading-relaxed">
              Track legal work hour thresholds, calculate gross weekly earnings, and prevent visa violations.
            </p>

            {/* Live Interactive Preview: Progress Meter & Wage Slider */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] space-y-2 mb-4">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--text-secondary)]">Weekly Shift Progress</span>
                <span className="font-bold text-[var(--text-primary)]">{calcHours}/20.0h</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    calcHours > 20 ? 'bg-rose-500' : calcHours >= 18 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (calcHours / 20) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[var(--text-secondary)]">
                <span>Est. Gross: <strong className="text-emerald-500 dark:text-emerald-400">£{(calcHours * calcRate).toFixed(2)}</strong></span>
                <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> 100% Compliant
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = '#ledger';
              onEnterApp('work');
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full justify-between font-mono text-xs hover:border-blue-500 hover:text-blue-500"
          >
            Open Visa Ledger
          </Button>
        </div>

        {/* CARD 4: Study Engine & CFA Level 1 Matrix */}
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                Durham MSc + CFA
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Study Engine & CFA Matrix
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-4 leading-relaxed">
              Curated modules for Durham University MSc Finance & 10 CFA topic revision trackers.
            </p>

            {/* Live Interactive Preview: Progress Module Badges */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] space-y-1.5 mb-4 font-mono text-[10px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <span>Advanced Corporate Finance</span>
                <span className="font-bold">92%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300">
                <span>Derivatives & Financial Engineering</span>
                <span className="font-bold">85%</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300">
                <span>CFA Level 1: FSA & Quant</span>
                <span className="font-bold">100% Complete</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = '#study';
              onEnterApp('study');
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full justify-between font-mono text-xs hover:border-emerald-500 hover:text-emerald-500"
          >
            Open Study Engine
          </Button>
        </div>

        {/* CARD 5: Cold Email & Recruiter CRM */}
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400">
                AI Templates
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Cold Email & Recruiter CRM
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-4 leading-relaxed">
              Auto-generate tailored recruiter pitches citing your ACCA affiliation and valuation experience.
            </p>

            {/* Live Interactive Preview: Mini Email Composer */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] space-y-1.5 mb-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)] pb-1 border-b border-[var(--border)]">
                <Send className="w-3 h-3 text-rose-500" />
                <span className="truncate">To: recruiter@lazard.com</span>
              </div>
              <p className="text-[var(--text-primary)] line-clamp-2 italic font-sans text-[11px] pt-1">
                "Subject: Durham MSc Finance / ACCA Affiliate — Analyst Inquiry..."
              </p>
              <div className="flex items-center justify-between text-[9px] text-emerald-500 dark:text-emerald-400 pt-1">
                <span>1-Click Copy & Gmail Draft</span>
                <span>Ready</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = '#outreach';
              onEnterApp('outreach');
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full justify-between font-mono text-xs hover:border-rose-500 hover:text-rose-500"
          >
            Launch Email Suite
          </Button>
        </div>

        {/* CARD 6: Multi-Region Valuation Terminal */}
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                5 Global Exchanges
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Multi-Region Terminal
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-4 leading-relaxed">
              Real-time quotes, multi-currency valuation benchmarks, and simulated paper portfolio orders.
            </p>

            {/* Live Interactive Preview: Region Ticks */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] space-y-2 mb-4">
              <div className="flex items-center justify-between gap-1">
                {(['UK', 'US', 'IN', 'EU', 'SG'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRegion(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedRegion === r 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between font-mono text-xs pt-1">
                <span className="font-bold text-[var(--text-primary)]">{regionTicks[selectedRegion].name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-primary)]">{regionTicks[selectedRegion].val}</span>
                  <span className={`font-bold ${regionTicks[selectedRegion].color}`}>{regionTicks[selectedRegion].chg}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = '#trading';
              onEnterApp('trading');
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full justify-between font-mono text-xs hover:border-cyan-500 hover:text-cyan-500"
          >
            Open Trading Terminal
          </Button>
        </div>

        {/* CARD 7: Executive Reporting & Exporters */}
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between md:col-span-2 lg:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                  Printable A4 PDF + RFC 4180 CSV
                </span>
              </div>

              <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Executive Reporting & Data Exporters
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Generate high-resolution printable PDF summaries of your recruitment pipeline, visa compliance audits, and export raw CSV records for Excel.
              </p>
            </div>

            {/* Live Interactive Preview: Printable Badge & Quick Download */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border)] flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-300">
                <Download className="w-4 h-4" />
                <span>applications.csv</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-300">
                <Download className="w-4 h-4" />
                <span>visa_shifts.csv</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-600 dark:text-purple-300">
                <Printer className="w-4 h-4" />
                <span>Executive_Summary.pdf</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Instant 1-click downloads with UTF-8 BOM Excel compatibility
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.hash = '#jobs';
                onEnterApp('jobs');
              }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="font-mono text-xs hover:border-indigo-500 hover:text-indigo-500"
            >
              View Executive Reports
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeatureGrid;
