import React, { useState } from 'react';
import { X, Sliders, Eye, EyeOff, DollarSign, Clock, ShieldCheck, Target, Percent, Check, RotateCcw, Sparkles } from 'lucide-react';
import { Currency } from '../../types';

export interface HubPreferences {
  currency: string;
  monthlyTargetEarnings: number;
  taxRatePct: number;
  showTaxDeduction: boolean;
  visaLimit: number;
  visaWindowMode: 'rolling7' | 'calendarMon' | 'calendarSun';
  visaWarningMargin: number;
  conflictDetectionEnabled: boolean;
  shiftPresets: { label: string; hours: number; start: string; end: string }[];
  visibleModules: {
    jobSchedule: boolean;
    visaCap: boolean;
    expenses: boolean;
    categoryBudgets: boolean;
    creditCards: boolean;
    invoices: boolean;
    settlements: boolean;
    subscriptions: boolean;
    vehicleCost: boolean;
  };
}

export const DEFAULT_HUB_PREFERENCES: HubPreferences = {
  currency: 'GBP',
  monthlyTargetEarnings: 800,
  taxRatePct: 0,
  showTaxDeduction: false,
  visaLimit: 20,
  visaWindowMode: 'rolling7',
  visaWarningMargin: 2,
  conflictDetectionEnabled: true,
  shiftPresets: [
    { label: 'Morning 4h', hours: 4, start: '09:00', end: '13:00' },
    { label: 'Evening 5h', hours: 5, start: '17:00', end: '22:00' },
    { label: 'Full Day 8h', hours: 8, start: '09:00', end: '17:00' }
  ],
  visibleModules: {
    jobSchedule: true,
    visaCap: true,
    expenses: true,
    categoryBudgets: true,
    creditCards: true,
    invoices: true,
    settlements: true,
    subscriptions: true,
    vehicleCost: true
  }
};

const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preferences: HubPreferences;
  onSavePreferences: (prefs: HubPreferences) => void;
}

export const HubCustomizerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences
}) => {
  const [prefs, setPrefs] = useState<HubPreferences>(preferences || DEFAULT_HUB_PREFERENCES);
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'modules' | 'visa' | 'presets'>('general');

  if (!isOpen) return null;

  const handleToggleModule = (key: keyof HubPreferences['visibleModules']) => {
    setPrefs({
      ...prefs,
      visibleModules: {
        ...prefs.visibleModules,
        [key]: !prefs.visibleModules[key]
      }
    });
  };

  const handleResetDefaults = () => {
    if (confirm('Reset Financial Hub settings to default?')) {
      setPrefs(DEFAULT_HUB_PREFERENCES);
    }
  };

  const handleSave = () => {
    onSavePreferences(prefs);
    onClose();
  };

  const currencySymbol = CURRENCIES.find(c => c.code === prefs.currency)?.symbol || '£';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#1c1c1e] border border-[var(--border)] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Financial & Job Hub Settings</h3>
              <p className="text-xs text-[var(--text-secondary)]">Fully customize currency, modules, visa caps, tax rates & shift presets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              title="Reset Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex border-b border-[var(--border)] pb-2 gap-1 overflow-x-auto custom-scrollbar">
          {[
            { id: 'general', label: 'Currency & Goals' },
            { id: 'modules', label: 'Dashboard Modules' },
            { id: 'visa', label: 'Visa & Regulations' },
            { id: 'presets', label: 'Shift Presets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeSubTab === tab.id ? 'bg-[var(--surface-solid)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[380px]">
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Display Currency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, currency: c.code })}
                      className={`p-2.5 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all ${prefs.currency === c.code ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-bold shadow-md' : 'bg-[#141416] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                      <span>{c.code}</span>
                      <span className="font-mono text-sm">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Income Target */}
              <div className="bg-[#141416] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Monthly Income Target</span>
                  </div>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{currencySymbol}</span>
                    <input
                      type="number"
                      step="50"
                      value={prefs.monthlyTargetEarnings}
                      onChange={e => setPrefs({ ...prefs, monthlyTargetEarnings: Number(e.target.value) })}
                      className="apple-input bg-[#1c1c1e] pl-6 text-xs p-2 w-full text-right font-bold text-emerald-400 font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Displays live progress towards your monthly job earnings goal on the dashboard.
                </p>
              </div>

              {/* Estimated Tax Deductions */}
              <div className="bg-[#141416] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Tax & NI Deductions Estimator</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs({ ...prefs, showTaxDeduction: !prefs.showTaxDeduction })}
                    className={`w-10 h-6 rounded-full transition-colors relative ${prefs.showTaxDeduction ? 'bg-blue-500' : 'bg-[rgba(128,128,128,0.2)]'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${prefs.showTaxDeduction ? 'left-5' : 'left-1'}`}></div>
                  </button>
                </div>

                {prefs.showTaxDeduction && (
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--text-secondary)]">Effective Tax Deduction Rate:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={prefs.taxRatePct}
                        onChange={e => setPrefs({ ...prefs, taxRatePct: Number(e.target.value) })}
                        className="apple-input bg-[#1c1c1e] text-xs p-1.5 w-16 text-center font-mono font-bold"
                      />
                      <span className="text-xs text-[var(--text-secondary)]">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'modules' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Toggle which modules are displayed on your Financial & Job Hub dashboard:
              </p>

              {[
                { key: 'jobSchedule', label: 'Job Schedule & Shift Logger', desc: 'Log work shifts, calculate earnings & pay multipliers' },
                { key: 'visaCap', label: 'Visa Work-Cap & Rolling Limit Alert', desc: 'Track hourly limits, term-time regulations & warnings' },
                { key: 'expenses', label: 'Expense Tracker & Transactions', desc: 'Track spending, split transactions with peers' },
                { key: 'categoryBudgets', label: 'Category Monthly Budgeting', desc: 'Set monthly limits per category with progress bars' },
                { key: 'creditCards', label: 'Credit Cards & Invoices Manager', desc: 'Credit card balances, due dates & AI receipt scanner' },
                { key: 'settlements', label: 'Peer Settlement Ledger', desc: 'Peer balances, split links, and Settle-Up emails' },
                { key: 'subscriptions', label: 'Subscription Manager', desc: 'Active recurring subscriptions and renewals' },
                { key: 'vehicleCost', label: 'Vehicle Ownership Calculator', desc: 'Monthly car ownership and maintenance costs' },
              ].map(item => {
                const isVis = prefs.visibleModules[item.key as keyof HubPreferences['visibleModules']];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleModule(item.key as any)}
                    className="p-3 rounded-2xl bg-[#141416] border border-[var(--border)] flex items-center justify-between cursor-pointer hover:border-[var(--border)]/80 transition-all"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.label}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isVis ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {isVis ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSubTab === 'visa' && (
            <div className="space-y-4">
              <div className="bg-[#141416] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Weekly Visa Maximum Work Hours</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={prefs.visaLimit}
                      onChange={e => setPrefs({ ...prefs, visaLimit: Number(e.target.value) })}
                      className="apple-input bg-[#1c1c1e] text-xs p-2 w-20 text-center font-bold text-amber-400 font-mono"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">hrs</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Standard UK Student Visa (Tier 4 / Student Route) is 20 hours per week during term time.
                </p>
              </div>

              <div className="bg-[#141416] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <span className="text-xs font-bold text-[var(--text-primary)] block">Calculation Window Mode</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'rolling7', label: 'Rolling 7 Days', desc: 'Any continuous 7-day period' },
                    { id: 'calendarMon', label: 'Mon - Sun Week', desc: 'Standard UK working week' },
                    { id: 'calendarSun', label: 'Sun - Sat Week', desc: 'US payroll calendar week' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, visaWindowMode: mode.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${prefs.visaWindowMode === mode.id ? 'bg-[var(--surface-solid)] border-[var(--accent)] text-[var(--text-primary)] font-bold' : 'border-[var(--border)] text-[var(--text-secondary)] opacity-80'}`}
                    >
                      <span className="text-xs block">{mode.label}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-normal">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#141416] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Warning Alert Margin</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={prefs.visaWarningMargin}
                      onChange={e => setPrefs({ ...prefs, visaWarningMargin: Number(e.target.value) })}
                      className="apple-input bg-[#1c1c1e] text-xs p-1.5 w-16 text-center font-mono"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">hrs</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Trigger an amber warning when you are within this many hours of reaching the cap.
                </p>
              </div>

              <div className="bg-[#141416] p-4 rounded-2xl border border-[var(--border)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">University Timetable Conflict Check</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Alert if a logged shift overlaps with lectures or seminars</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefs({ ...prefs, conflictDetectionEnabled: !prefs.conflictDetectionEnabled })}
                  className={`w-10 h-6 rounded-full transition-colors relative ${prefs.conflictDetectionEnabled ? 'bg-emerald-500' : 'bg-[rgba(128,128,128,0.2)]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${prefs.conflictDetectionEnabled ? 'left-5' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Customize quick 1-click shift templates for faster shift logging:
              </p>

              {prefs.shiftPresets.map((preset, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#141416] border border-[var(--border)] grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Preset Label"
                    value={preset.label}
                    onChange={e => {
                      const updated = [...prefs.shiftPresets];
                      updated[idx].label = e.target.value;
                      setPrefs({ ...prefs, shiftPresets: updated });
                    }}
                    className="apple-input bg-[#1c1c1e] text-xs p-2 w-full font-semibold"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={preset.start}
                      onChange={e => {
                        const updated = [...prefs.shiftPresets];
                        updated[idx].start = e.target.value;
                        setPrefs({ ...prefs, shiftPresets: updated });
                      }}
                      className="apple-input bg-[#1c1c1e] text-xs p-1.5 text-center w-full"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">-</span>
                    <input
                      type="time"
                      value={preset.end}
                      onChange={e => {
                        const updated = [...prefs.shiftPresets];
                        updated[idx].end = e.target.value;
                        setPrefs({ ...prefs, shiftPresets: updated });
                      }}
                      className="apple-input bg-[#1c1c1e] text-xs p-1.5 text-center w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={preset.hours}
                      onChange={e => {
                        const updated = [...prefs.shiftPresets];
                        updated[idx].hours = Number(e.target.value);
                        setPrefs({ ...prefs, shiftPresets: updated });
                      }}
                      className="apple-input bg-[#1c1c1e] text-xs p-2 text-center w-20 font-bold text-blue-400"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">hrs</span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (prefs.shiftPresets.length <= 1) return;
                        setPrefs({
                          ...prefs,
                          shiftPresets: prefs.shiftPresets.filter((_, i) => i !== idx)
                        });
                      }}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setPrefs({
                    ...prefs,
                    shiftPresets: [
                      ...prefs.shiftPresets,
                      { label: 'New Shift Preset', hours: 4, start: '10:00', end: '14:00' }
                    ]
                  });
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.02)] transition-all font-semibold"
              >
                + Add Another Preset
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-[var(--accent)]/20"
          >
            <Check className="w-4 h-4" />
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
