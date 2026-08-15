import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Sliders,
  FileText,
  Upload,
  RefreshCw,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Table as TableIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface DCFModelData {
  companyName: string;
  ticker: string;
  currency: string;
  currentSharePrice: number;
  sharesOutstanding: number; // in Millions
  netDebt: number; // in Millions
  baseRevenue: number; // in Millions
  growthRates: number[]; // 5-year %
  ebitMargin: number; // %
  taxRate: number; // %
  capexPct: number; // % of Rev
  nwcPct: number; // % of Rev
  wacc: number; // %
  terminalGrowthRate: number; // %
  exitMultiple: number; // EV/EBITDA
}

const DEFAULT_DCF: DCFModelData = {
  companyName: 'Apex Technology Corp',
  ticker: 'APEX',
  currency: '$',
  currentSharePrice: 185.50,
  sharesOutstanding: 320, // 320M shares
  netDebt: 2400, // $2.4B
  baseRevenue: 12500, // $12.5B
  growthRates: [18.0, 15.0, 12.5, 10.0, 8.0],
  ebitMargin: 24.5,
  taxRate: 21.0,
  capexPct: 4.5,
  nwcPct: 2.0,
  wacc: 9.2,
  terminalGrowthRate: 2.5,
  exitMultiple: 16.0
};

export const DCFValuationHub: React.FC = () => {
  // 1. Persistent DCF State via LocalStorage
  const [model, setModel] = useState<DCFModelData>(() => {
    try {
      const saved = localStorage.getItem('manageme_dcf_calc');
      if (saved) {
        return { ...DEFAULT_DCF, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load DCF model from LocalStorage', e);
    }
    return DEFAULT_DCF;
  });

  // 2. Persistent Uploaded Financial Docs via LocalStorage
  const [financialDocs, setFinancialDocs] = useState<Array<{ id: string; name: string; size: string; content: string; uploadedAt: string }>>(() => {
    try {
      const saved = localStorage.getItem('manageme_dcf_docs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load DCF docs from LocalStorage', e);
    }
    return [
      {
        id: 'doc-apex-10k',
        name: 'APEX_2024_10K_Annual_Report.pdf',
        size: '2.4 MB',
        content: 'Historical Revenue: $12.5B, EBIT: $3.06B, Net Cash Flow from Operations: $3.2B, Net Debt: $2.4B, Shares: 320M.',
        uploadedAt: new Date().toLocaleDateString()
      }
    ];
  });

  const [activeScenario, setActiveScenario] = useState<'base' | 'bull' | 'bear'>('base');
  const [copied, setCopied] = useState(false);

  // Sync to LocalStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('manageme_dcf_calc', JSON.stringify(model));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [model]);

  useEffect(() => {
    try {
      localStorage.setItem('manageme_dcf_docs', JSON.stringify(financialDocs));
    } catch (e) {
      console.warn('LocalStorage docs save failed:', e);
    }
  }, [financialDocs]);

  // Handle Scenario Switch
  const applyScenario = (scenario: 'base' | 'bull' | 'bear') => {
    setActiveScenario(scenario);
    if (scenario === 'bull') {
      setModel(prev => ({
        ...prev,
        growthRates: [22.0, 18.5, 16.0, 13.0, 10.0],
        ebitMargin: 27.0,
        wacc: 8.5,
        terminalGrowthRate: 3.0
      }));
    } else if (scenario === 'bear') {
      setModel(prev => ({
        ...prev,
        growthRates: [12.0, 9.0, 7.5, 6.0, 4.0],
        ebitMargin: 20.0,
        wacc: 10.5,
        terminalGrowthRate: 1.8
      }));
    } else {
      setModel(DEFAULT_DCF);
    }
  };

  // Perform 5-Year Cash Flow Projections
  const projection = useMemo(() => {
    let currentRev = model.baseRevenue;
    const years = [];
    let cumulativeDiscountedFcf = 0;
    const discountRate = model.wacc / 100;

    for (let i = 0; i < 5; i++) {
      const yearNum = i + 1;
      const gRate = (model.growthRates[i] || 5.0) / 100;
      currentRev = currentRev * (1 + gRate);
      
      const ebit = currentRev * (model.ebitMargin / 100);
      const taxes = ebit * (model.taxRate / 100);
      const nopat = ebit - taxes;
      const capex = currentRev * (model.capexPct / 100);
      const nwcChange = currentRev * (model.nwcPct / 100);
      
      // Free Cash Flow to Firm (FCFF)
      const fcf = nopat - capex - nwcChange;
      const discountFactor = Math.pow(1 + discountRate, yearNum);
      const pvFcf = fcf / discountFactor;
      cumulativeDiscountedFcf += pvFcf;

      years.push({
        year: `Year ${yearNum}`,
        revenue: currentRev,
        growthRate: model.growthRates[i],
        ebit,
        nopat,
        fcf,
        pvFcf
      });
    }

    // Terminal Value Calculation (Gordon Growth Model)
    const finalYearFcf = years[years.length - 1].fcf;
    const terminalGrowth = model.terminalGrowthRate / 100;
    const terminalValue = (finalYearFcf * (1 + terminalGrowth)) / (discountRate - terminalGrowth);
    const pvTerminalValue = terminalValue / Math.pow(1 + discountRate, 5);

    // Enterprise & Equity Value
    const enterpriseValue = cumulativeDiscountedFcf + pvTerminalValue;
    const equityValue = enterpriseValue - model.netDebt;
    const impliedSharePrice = equityValue / model.sharesOutstanding;
    const upsideDownsidePct = ((impliedSharePrice - model.currentSharePrice) / model.currentSharePrice) * 100;

    return {
      years,
      cumulativeDiscountedFcf,
      terminalValue,
      pvTerminalValue,
      enterpriseValue,
      equityValue,
      impliedSharePrice,
      upsideDownsidePct
    };
  }, [model]);

  // Sensitivity Matrix (WACC vs Terminal Growth Rate)
  const sensitivityMatrix = useMemo(() => {
    const waccSteps = [model.wacc - 1.0, model.wacc - 0.5, model.wacc, model.wacc + 0.5, model.wacc + 1.0];
    const gSteps = [model.terminalGrowthRate - 0.5, model.terminalGrowthRate, model.terminalGrowthRate + 0.5];

    return waccSteps.map(w => {
      const row = gSteps.map(g => {
        const dRate = w / 100;
        const tRate = g / 100;
        if (dRate <= tRate) return 0;

        let cumPv = 0;
        let cRev = model.baseRevenue;
        let lastFcf = 0;
        for (let i = 0; i < 5; i++) {
          cRev = cRev * (1 + (model.growthRates[i] || 5.0) / 100);
          const ebit = cRev * (model.ebitMargin / 100);
          const nopat = ebit * (1 - model.taxRate / 100);
          const fcf = nopat - (cRev * (model.capexPct / 100)) - (cRev * (model.nwcPct / 100));
          lastFcf = fcf;
          cumPv += fcf / Math.pow(1 + dRate, i + 1);
        }
        const tv = (lastFcf * (1 + tRate)) / (dRate - tRate);
        const pvTv = tv / Math.pow(1 + dRate, 5);
        const ev = cumPv + pvTv;
        const eqVal = ev - model.netDebt;
        return eqVal / model.sharesOutstanding;
      });
      return { wacc: w, values: row };
    });
  }, [model]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        const newDoc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          content: text.slice(0, 1000) || `Uploaded financial data for ${file.name}`,
          uploadedAt: new Date().toLocaleDateString()
        };
        setFinancialDocs(prev => [newDoc, ...prev]);
      };
      reader.readAsText(file);
    });
  };

  const removeDoc = (id: string) => {
    setFinancialDocs(prev => prev.filter(d => d.id !== id));
  };

  const copySummary = () => {
    const text = `DCF VALUATION SUMMARY - ${model.companyName} (${model.ticker})
--------------------------------------------------
Current Price: ${model.currency}${model.currentSharePrice.toFixed(2)}
Implied Fair Value: ${model.currency}${projection.impliedSharePrice.toFixed(2)}
Implied Upside/Downside: ${projection.upsideDownsidePct >= 0 ? '+' : ''}${projection.upsideDownsidePct.toFixed(2)}%
Enterprise Value: ${model.currency}${(projection.enterpriseValue).toFixed(0)}M
Equity Value: ${model.currency}${(projection.equityValue).toFixed(0)}M
WACC: ${model.wacc}% | Terminal Growth: ${model.terminalGrowthRate}%
Generated via manageme Executive Valuation Hub`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportDCFToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. Valuation Summary Sheet
      const summaryData = [
        ['manageme Quantitative DCF Valuation Model'],
        ['Generated Date', new Date().toISOString().split('T')[0]],
        ['Company Name', model.companyName],
        ['Ticker Symbol', model.ticker],
        ['Active Scenario', activeScenario.toUpperCase()],
        [],
        ['Valuation Output', 'Metric Value', 'Units'],
        ['Current Market Spot Price', model.currentSharePrice, model.currency],
        ['DCF Implied Fair Value', Number(projection.impliedSharePrice.toFixed(2)), model.currency],
        ['Upside / (Downside)', `${projection.upsideDownsidePct.toFixed(1)}%`, '%'],
        ['Enterprise Value (EV)', Number(projection.enterpriseValue.toFixed(1)), `${model.currency} Millions`],
        ['Less: Net Debt', model.netDebt, `${model.currency} Millions`],
        ['Implied Equity Value', Number(projection.equityValue.toFixed(1)), `${model.currency} Millions`],
        ['Shares Outstanding', model.sharesOutstanding, 'Millions'],
        [],
        ['Key Valuation Assumptions', 'Value', 'Units'],
        ['Weighted Avg Cost of Capital (WACC)', `${model.wacc}%`, '%'],
        ['Terminal Growth Rate (g)', `${model.terminalGrowthRate}%`, '%'],
        ['Effective Corporate Tax Rate', `${model.taxRate}%`, '%'],
        ['EBIT Operating Margin', `${model.ebitMargin}%`, '%'],
        ['Reinvestment (CapEx % of Rev)', `${model.capexPct}%`, '%'],
        ['Working Capital (% of Rev)', `${model.nwcPct}%`, '%'],
        ['Base Revenue', model.baseRevenue, `${model.currency} Millions`]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Valuation_Summary');

      // 2. 5-Year Projections Sheet
      const projHeaders = ['Metric', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
      const projData = [
        ['manageme 5-Year Free Cash Flow Projections (FCFF)'],
        projHeaders,
        ['Revenue ($M)', ...projection.years.map(y => Number(y.revenue.toFixed(1)))],
        ['Revenue Growth (%)', ...projection.years.map(y => `${y.growthRate}%`)],
        ['Operating Income (EBIT)', ...projection.years.map(y => Number(y.ebit.toFixed(1)))],
        ['NOPAT (EBIT * (1 - Tax))', ...projection.years.map(y => Number(y.nopat.toFixed(1)))],
        ['Free Cash Flow to Firm (FCFF)', ...projection.years.map(y => Number(y.fcf.toFixed(1)))],
        ['Discount Factor (PV)', ...projection.years.map((_, i) => Number(Math.pow(1 + model.wacc / 100, i + 1).toFixed(3)))],
        ['Present Value of FCF', ...projection.years.map(y => Number(y.pvFcf.toFixed(1)))],
        [],
        ['Cumulative PV of 5-Yr FCF', Number(projection.cumulativeDiscountedFcf.toFixed(1))],
        ['Terminal Value (TV)', Number(projection.terminalValue.toFixed(1))],
        ['Present Value of TV', Number(projection.pvTerminalValue.toFixed(1))],
        ['Total Enterprise Value', Number(projection.enterpriseValue.toFixed(1))]
      ];
      const wsProj = XLSX.utils.aoa_to_sheet(projData);
      XLSX.utils.book_append_sheet(wb, wsProj, '5Yr_FCFF_Projections');

      // 3. WACC Sensitivity Matrix Sheet
      const sensHeaders = ['WACC \\ Term Growth', `${(model.terminalGrowthRate - 0.5).toFixed(1)}%`, `${model.terminalGrowthRate.toFixed(1)}%`, `${(model.terminalGrowthRate + 0.5).toFixed(1)}%`];
      const sensRows = sensitivityMatrix.map(row => [
        `${row.wacc.toFixed(1)}%`,
        ...row.values.map(val => Number(val.toFixed(2)))
      ]);
      const sensData = [
        ['WACC vs. Perpetual Terminal Growth Sensitivity Matrix (Implied Share Price)'],
        sensHeaders,
        ...sensRows
      ];
      const wsSens = XLSX.utils.aoa_to_sheet(sensData);
      XLSX.utils.book_append_sheet(wb, wsSens, 'WACC_Sensitivity');

      XLSX.writeFile(wb, `${model.ticker}_DCF_Valuation_Model.xlsx`);
    } catch (err: any) {
      console.error('Excel Export Error:', err);
      alert('Failed to generate Excel export: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-tighter uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
              Quantitative Valuation Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono tracking-tighter">Dual LocalStorage & IndexedDB Grounded</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>{model.companyName}</span>
            <span className="font-mono tracking-tighter text-blue-600 dark:text-blue-400">({model.ticker})</span>
          </h2>
        </div>

        {/* Scenario Selectors & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-black/60 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
            {(['bear', 'base', 'bull'] as const).map(sc => (
              <button
                key={sc}
                onClick={() => applyScenario(sc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono tracking-tighter uppercase transition-all cursor-pointer ${
                  activeScenario === sc 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          <button
            onClick={copySummary}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono tracking-tighter text-slate-800 dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy Text Summary to Clipboard"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={exportDCFToExcel}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono tracking-tighter font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
            title="Export Valuation Model & WACC Sensitivity to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Model (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (manageme High-Precision Monospaced Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono tracking-tighter text-slate-500 dark:text-neutral-400 uppercase block">Current Market Spot</span>
          <div className="text-3xl font-extrabold font-mono tracking-tighter tabular-nums text-slate-900 dark:text-white">
            {model.currency}{model.currentSharePrice.toFixed(2)}
          </div>
          <span className="text-[10px] font-mono tracking-tighter text-slate-500 dark:text-neutral-500 block">Shares: {model.sharesOutstanding}M</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono tracking-tighter text-slate-500 dark:text-neutral-400 uppercase block">DCF Implied Fair Value</span>
          <div className="text-3xl font-extrabold font-mono tracking-tighter tabular-nums text-emerald-600 dark:text-emerald-400">
            {model.currency}{projection.impliedSharePrice.toFixed(2)}
          </div>
          <span className="text-[10px] font-mono tracking-tighter text-emerald-700 dark:text-emerald-300/80 block font-semibold">Intrinsic DCF Target</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono tracking-tighter text-slate-500 dark:text-neutral-400 uppercase block">Implied Delta / Margin</span>
          <div className={`text-3xl font-extrabold font-mono tracking-tighter tabular-nums ${
            projection.upsideDownsidePct >= 0 ? 'text-emerald-600 dark:text-[#10b981]' : 'text-rose-600 dark:text-[#f43f5e]'
          }`}>
            {projection.upsideDownsidePct >= 0 ? '+' : ''}{projection.upsideDownsidePct.toFixed(2)}%
          </div>
          <span className="text-[10px] font-mono tracking-tighter text-slate-500 dark:text-neutral-500 block font-semibold">
            {projection.upsideDownsidePct >= 0 ? 'Undervalued' : 'Overvalued'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
          <span className="text-[11px] font-mono tracking-tighter text-slate-500 dark:text-neutral-400 uppercase block">Enterprise Value (EV)</span>
          <div className="text-3xl font-extrabold font-mono tracking-tighter tabular-nums text-indigo-600 dark:text-indigo-400">
            {model.currency}{(projection.enterpriseValue / 1000).toFixed(2)}B
          </div>
          <span className="text-[10px] font-mono tracking-tighter text-slate-500 dark:text-neutral-500 block">Eq Val: {model.currency}{(projection.equityValue / 1000).toFixed(2)}B</span>
        </div>
      </div>

      {/* Model Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Drivers & Cash Flow Projections */}
        <div className="lg:col-span-2 space-y-6">
          {/* 5-Year Cash Flow Projection Table */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono tracking-tighter uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>5-Year Free Cash Flow (FCFF) Forecast</span>
              </h3>
              <span className="text-xs font-mono tracking-tighter text-slate-500 dark:text-neutral-400">Amounts in {model.currency} Millions</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-mono tracking-tighter">
                <thead className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-400 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-2.5">Metric</th>
                    {projection.years.map(y => (
                      <th key={y.year} className="p-2.5 text-right font-bold text-slate-900 dark:text-neutral-200">{y.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-2.5 text-slate-800 dark:text-neutral-300 font-semibold">Revenue</td>
                    {projection.years.map((y, idx) => (
                      <td key={idx} className="p-2.5 text-right tabular-nums text-slate-900 dark:text-white">
                        {model.currency}{y.revenue.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-2.5 text-slate-700 dark:text-neutral-300">Growth Rate (%)</td>
                    {projection.years.map((y, idx) => (
                      <td key={idx} className="p-2.5 text-right tabular-nums text-blue-600 dark:text-blue-400">
                        {y.growthRate.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-2.5 text-slate-700 dark:text-neutral-300">Operating EBIT</td>
                    {projection.years.map((y, idx) => (
                      <td key={idx} className="p-2.5 text-right tabular-nums text-slate-800 dark:text-neutral-200">
                        {model.currency}{y.ebit.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-2.5 text-slate-700 dark:text-neutral-300">NOPAT (Post-Tax)</td>
                    {projection.years.map((y, idx) => (
                      <td key={idx} className="p-2.5 text-right tabular-nums text-slate-700 dark:text-neutral-300">
                        {model.currency}{y.nopat.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5 bg-emerald-500/5 font-bold">
                    <td className="p-2.5 text-emerald-700 dark:text-emerald-400">Unlevered FCF</td>
                    {projection.years.map((y, idx) => (
                      <td key={idx} className="p-2.5 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                        {model.currency}{y.fcf.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-slate-500 dark:text-neutral-400">
                    <td className="p-2.5">PV of FCF (WACC: {model.wacc}%)</td>
                    {projection.years.map((y, idx) => (
                      <td key={idx} className="p-2.5 text-right tabular-nums text-slate-700 dark:text-neutral-300">
                        {model.currency}{y.pvFcf.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sensitivity Table */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold font-mono tracking-tighter uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Sensitivity Analysis: Implied Share Price ({model.currency})</span>
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-center text-xs font-mono tracking-tighter">
                <thead className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-400 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-2.5 text-left">WACC \ Term Growth</th>
                    {[model.terminalGrowthRate - 0.5, model.terminalGrowthRate, model.terminalGrowthRate + 0.5].map(g => (
                      <th key={g} className="p-2.5">{g.toFixed(1)}%</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {sensitivityMatrix.map(row => (
                    <tr key={row.wacc} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="p-2.5 text-left font-bold text-slate-800 dark:text-neutral-300">{row.wacc.toFixed(1)}%</td>
                      {row.values.map((val, vIdx) => {
                        const isCurrent = Math.abs(row.wacc - model.wacc) < 0.01 && vIdx === 1;
                        const isHigher = val > model.currentSharePrice;
                        return (
                          <td 
                            key={vIdx} 
                            className={`p-2.5 tabular-nums font-bold ${
                              isCurrent ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/30 dark:text-blue-300 ring-1 ring-blue-500 rounded' :
                              isHigher ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {model.currency}{val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Parameter Sliders & Uploaded Financial Docs */}
        <div className="space-y-6">
          {/* Inputs Panel */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold font-mono tracking-tighter uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Model Valuation Assumptions</span>
            </h3>

            <div className="space-y-3 text-xs font-mono tracking-tighter">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400 mb-1">
                  <span>WACC Discount Rate</span>
                  <span className="text-slate-900 dark:text-white font-bold">{model.wacc.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="16.0"
                  step="0.1"
                  value={model.wacc}
                  onChange={(e) => setModel({ ...model, wacc: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400 mb-1">
                  <span>Terminal Growth Rate</span>
                  <span className="text-slate-900 dark:text-white font-bold">{model.terminalGrowthRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={model.terminalGrowthRate}
                  onChange={(e) => setModel({ ...model, terminalGrowthRate: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400 mb-1">
                  <span>Operating Margin (EBIT %)</span>
                  <span className="text-slate-900 dark:text-white font-bold">{model.ebitMargin.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="10.0"
                  max="45.0"
                  step="0.5"
                  value={model.ebitMargin}
                  onChange={(e) => setModel({ ...model, ebitMargin: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-neutral-400 mb-1">
                  <span>Effective Tax Rate</span>
                  <span className="text-slate-900 dark:text-white font-bold">{model.taxRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="10.0"
                  max="35.0"
                  step="0.5"
                  value={model.taxRate}
                  onChange={(e) => setModel({ ...model, taxRate: parseFloat(e.target.value) })}
                  className="w-full accent-slate-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-neutral-400 block mb-0.5">Base Rev ($M)</label>
                  <input
                    type="number"
                    value={model.baseRevenue}
                    onChange={(e) => setModel({ ...model, baseRevenue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono tracking-tighter"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-neutral-400 block mb-0.5">Net Debt ($M)</label>
                  <input
                    type="number"
                    value={model.netDebt}
                    onChange={(e) => setModel({ ...model, netDebt: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono tracking-tighter"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Persistent Uploaded Financial Docs */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono tracking-tighter uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Financial Docs (IndexedDB)</span>
              </h3>
              <label className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[11px] font-mono tracking-tighter text-white font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-sm">
                <Upload className="w-3 h-3" />
                <span>Upload</span>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-2">
              {financialDocs.map(doc => (
                <div key={doc.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono tracking-tighter">
                  <div className="truncate pr-2">
                    <span className="text-slate-900 dark:text-white font-bold block truncate">{doc.name}</span>
                    <span className="text-slate-500 dark:text-neutral-500 text-[10px]">{doc.size} • {doc.uploadedAt}</span>
                  </div>
                  <button
                    onClick={() => removeDoc(doc.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCFValuationHub;
