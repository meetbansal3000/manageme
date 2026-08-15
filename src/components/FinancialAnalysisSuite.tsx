import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  TrendingDown,
  Loader2,
  CheckCircle2,
  Table as TableIcon,
  ShieldAlert,
  Copy,
  Download,
  Building2,
  ChevronRight
} from 'lucide-react';
import { AnnualReportDoc, analyzeAnnualReportSuite, AnalysisSuiteResult } from '../utils/annualReportPipeline';

interface Props {
  doc: AnnualReportDoc;
  onAnalysisGenerated?: (result: AnalysisSuiteResult) => void;
}

export const FinancialAnalysisSuite: React.FC<Props> = ({ doc, onAnalysisGenerated }) => {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisSuiteResult | null>(null);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const chips = [
    {
      type: 'balance_sheet' as const,
      label: 'Extract Balance Sheet & Cash Flow Highlights',
      shortLabel: 'Balance Sheet & Cash Flow',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      bgClass: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-300'
    },
    {
      type: 'ceo_letter' as const,
      label: 'Summarize CEO Letter & Strategic Outlook',
      shortLabel: 'CEO Letter & Strategy',
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      bgClass: 'hover:bg-amber-500/10 hover:border-amber-500/30 text-amber-300'
    },
    {
      type: 'risk_factors' as const,
      label: 'Identify Key Risk Factors (Item 1A)',
      shortLabel: 'Key Risk Factors (Item 1A)',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      bgClass: 'hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-300'
    },
    {
      type: 'variance_analysis' as const,
      label: 'Perform Financial Variance Analysis',
      shortLabel: 'Financial Variance Analysis',
      icon: <TrendingDown className="w-4 h-4 text-indigo-400" />,
      bgClass: 'hover:bg-indigo-500/10 hover:border-indigo-500/30 text-indigo-300'
    }
  ];

  const handleRunAnalysis = async (type: 'balance_sheet' | 'ceo_letter' | 'risk_factors' | 'variance_analysis') => {
    setLoadingType(type);
    try {
      const result = await analyzeAnnualReportSuite(doc.content, type);
      setActiveAnalysis(result);
      if (onAnalysisGenerated) onAnalysisGenerated(result);
    } catch (err: any) {
      console.error(err);
      alert('Error analyzing report: ' + err.message);
    } finally {
      setLoadingType(null);
    }
  };

  const handleCopyAnalysis = () => {
    if (!activeAnalysis) return;
    const text = `${activeAnalysis.title}\n\nSummary:\n${activeAnalysis.summary}\n\nKey Highlights:\n` +
      activeAnalysis.bulletPoints.map(b => `- ${b}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-neutral-950/80 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Document Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Active Grounding Context
              </span>
              <span className="text-xs text-neutral-400 font-mono">SEC 10-K Filing</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">{doc.name}</h3>
          </div>
        </div>

        {doc.keyMetrics && (
          <div className="flex items-center gap-3 text-xs font-mono bg-black/40 px-3 py-2 rounded-xl border border-white/10">
            <div>
              <span className="text-neutral-500 block">Rev:</span>
              <span className="text-emerald-400 font-bold">{doc.keyMetrics.revenue || 'N/A'}</span>
            </div>
            <div className="border-r border-white/10 h-6" />
            <div>
              <span className="text-neutral-500 block">Net Inc:</span>
              <span className="text-indigo-400 font-bold">{doc.keyMetrics.netIncome || 'N/A'}</span>
            </div>
            <div className="border-r border-white/10 h-6" />
            <div>
              <span className="text-neutral-500 block">FCF:</span>
              <span className="text-teal-400 font-bold">{doc.keyMetrics.freeCashFlow || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>

      {/* One-Click Quick-Action Prompt Chips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
            One-Click Financial Analysis Suite
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {chips.map((chip) => {
            const isLoading = loadingType === chip.type;
            return (
              <button
                key={chip.type}
                onClick={() => handleRunAnalysis(chip.type)}
                disabled={!!loadingType}
                className={`p-3.5 rounded-2xl bg-neutral-900 border border-white/10 text-left transition-all duration-200 flex items-center justify-between group cursor-pointer ${chip.bgClass} ${
                  isLoading ? 'opacity-80 animate-pulse' : ''
                }`}
              >
                <div className="flex items-center gap-3 pr-2">
                  <div className="p-2 rounded-xl bg-black/50 border border-white/10 group-hover:scale-110 transition-transform">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : chip.icon}
                  </div>
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-white leading-snug">
                    {chip.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Output Section */}
      <AnimatePresence mode="wait">
        {activeAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-5 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{activeAnalysis.title}</span>
              </h4>
              <button
                onClick={handleCopyAnalysis}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            {/* Executive Summary */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-neutral-200 leading-relaxed font-medium">
              {activeAnalysis.summary}
            </div>

            {/* Bullet Highlights */}
            {activeAnalysis.bulletPoints && activeAnalysis.bulletPoints.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">Key Highlights & Drivers</h5>
                <ul className="space-y-1.5">
                  {activeAnalysis.bulletPoints.map((point, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Tables */}
            {activeAnalysis.tables && activeAnalysis.tables.map((tbl, tIdx) => (
              <div key={tIdx} className="overflow-x-auto custom-scrollbar border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 text-neutral-400 uppercase text-[10px] border-b border-white/10">
                    <tr>
                      {tbl.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tbl.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/5">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`px-3 py-2 ${cIdx === 0 ? 'text-white font-semibold' : 'text-neutral-300'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Risk Matrix */}
            {activeAnalysis.riskMatrix && activeAnalysis.riskMatrix.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-mono uppercase text-neutral-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Key Risk Matrix (Item 1A)</span>
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {activeAnalysis.riskMatrix.map((item, rIdx) => {
                    const badgeColor = item.severity === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : item.severity === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    return (
                      <div key={rIdx} className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-white block">{item.factor}</span>
                          <p className="text-neutral-400 mt-0.5 leading-snug">{item.impact}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border shrink-0 ${badgeColor}`}>
                          {item.severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
