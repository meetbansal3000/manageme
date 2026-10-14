// Component: UK Student Visa Compliance & Wage Ledger Hub

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Calendar, 
  Plus, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  Receipt, 
  FileText,
  Copy,
  Info,
  Download
} from 'lucide-react';
import { SpatialCard } from '../../ui/SpatialCard';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { toast } from '../../ui/Toast';
import { exportVisaShiftsToCSV } from '../../../lib/export';

export interface LedgerShift {
  id: string;
  date: string;
  employer: string;
  hourlyRate: number;
  startTime: string;
  endTime: string;
  hours: number;
  totalPay: number;
  notes?: string;
}

export interface LedgerExpense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

const STORAGE_SHIFTS_KEY = 'manageme_shifts_ledger';
const STORAGE_EXPENSES_KEY = 'manageme_expenses_ledger';

const DEFAULT_SHIFTS: LedgerShift[] = [];
const DEFAULT_EXPENSES: LedgerExpense[] = [];

export const VisaWageLedger: React.FC = () => {
  // Term mode state: 'term' (20h max) vs 'vacation' (40h max)
  const [isTermTime, setIsTermTime] = useState<boolean>(true);
  
  // Shifts persistence
  const [shifts, setShifts] = useState<LedgerShift[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SHIFTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_SHIFTS;
  });

  // Expenses persistence
  const [expenses, setExpenses] = useState<LedgerExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPENSES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_EXPENSES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(shifts));
    } catch {}
  }, [shifts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  // Form states
  const [newShift, setNewShift] = useState({
    date: new Date().toISOString().split('T')[0],
    employer: '',
    hourlyRate: '15.50',
    startTime: '09:00',
    endTime: '13:00',
    notes: ''
  });

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Groceries',
    amount: '',
    description: ''
  });

  // Calculate duration in hours from start/end times
  const computedHours = useMemo(() => {
    if (!newShift.startTime || !newShift.endTime) return 0;
    const [startH, startM] = newShift.startTime.split(':').map(Number);
    const [endH, endM] = newShift.endTime.split(':').map(Number);
    const diffMin = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(0, Number((diffMin / 60).toFixed(2)));
  }, [newShift.startTime, newShift.endTime]);

  const computedShiftPay = useMemo(() => {
    const rate = Number(newShift.hourlyRate) || 15.50;
    return Number((computedHours * rate).toFixed(2));
  }, [computedHours, newShift.hourlyRate]);

  // Compute current week's total logged hours (Mon to Sun)
  const currentWeekHours = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekShifts = (shifts || []).filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate >= monday && shiftDate <= sunday;
    });

    const total = weekShifts.reduce((acc, curr) => acc + (curr.hours || 0), 0);
    return Number(total.toFixed(2));
  }, [shifts]);

  const maxWeeklyHours = isTermTime ? 20 : 40;
  const remainingWeeklyHours = Math.max(0, maxWeeklyHours - currentWeekHours);
  const weeklyUsagePercent = Math.min(100, Math.round((currentWeekHours / maxWeeklyHours) * 100));

  // Compute monthly earnings & expenses
  const monthlyEarnings = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return (shifts || []).reduce((acc, curr) => {
      const d = new Date(curr.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return acc + (curr.totalPay || 0);
      }
      return acc;
    }, 0);
  }, [shifts]);

  const monthlyExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return (expenses || []).reduce((acc, curr) => {
      const d = new Date(curr.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return acc + (curr.amount || 0);
      }
      return acc;
    }, 0);
  }, [expenses]);

  const netSavingsBalance = monthlyEarnings - monthlyExpenses;

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.employer || computedHours <= 0) {
      toast.error('Please specify an employer and valid start/end times.');
      return;
    }

    // Check if adding this shift exceeds the limit
    if (isTermTime && (currentWeekHours + computedHours) > maxWeeklyHours) {
      toast.warning(`Warning: Logging ${computedHours}h will exceed your 20h UK visa limit!`);
    }

    const shift: LedgerShift = {
      id: `shift_${Date.now()}`,
      date: newShift.date,
      employer: newShift.employer,
      hourlyRate: Number(newShift.hourlyRate) || 15.50,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      hours: computedHours,
      totalPay: computedShiftPay,
      notes: newShift.notes
    };

    setShifts([shift, ...shifts]);
    toast.success(`Logged ${shift.hours}h (£${shift.totalPay.toFixed(2)}) for ${shift.employer}`);

    setNewShift({
      date: new Date().toISOString().split('T')[0],
      employer: '',
      hourlyRate: '15.50',
      startTime: '09:00',
      endTime: '13:00',
      notes: ''
    });
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
    toast.info('Shift record removed');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount) return;

    const expense: LedgerExpense = {
      id: `exp_${Date.now()}`,
      date: newExpense.date,
      category: newExpense.category,
      amount: Number(newExpense.amount),
      description: newExpense.description || newExpense.category
    };

    setExpenses([expense, ...expenses]);
    toast.success(`Logged expense: £${expense.amount.toFixed(2)} (${expense.category})`);

    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Groceries',
      amount: '',
      description: ''
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    toast.info('Expense record removed');
  };

  return (
    <div className="space-y-6">
      {/* Header & Term Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>UK Visa & Wage Ledger Hub</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Automate UKVI 20-hour weekly cap tracking, shift logs, and net monthly student savings.
          </p>
        </div>

        {/* Actions & Term Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportVisaShiftsToCSV(shifts)}
            className="text-xs"
            title="Download CSV history of logged shifts"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Export Timesheet (CSV)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('openExecutiveSummary'))}
            className="text-xs"
            title="Print Executive Summary"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Executive PDF
          </Button>

          {/* Term Time vs Vacation Toggle */}
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/5 p-1 rounded-xl border border-black/[0.06] dark:border-white/10 shrink-0">
            <button
              onClick={() => {
                setIsTermTime(true);
                toast.info('Switched to Term Time mode (20 hrs/wk limit)');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                isTermTime ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Term (20h)
            </button>
            <button
              onClick={() => {
                setIsTermTime(false);
                toast.info('Switched to Vacation mode (40 hrs/wk limit)');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                !isTermTime ? 'bg-amber-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Vacation (40h)
            </button>
          </div>
        </div>
      </div>

      {/* COMPLIANCE STATUS ALERT BANNER */}
      {currentWeekHours >= maxWeeklyHours ? (
        <SpatialCard className="p-4 border border-rose-500/40 bg-rose-500/10 text-rose-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs font-mono tabular-nums">
              <span className="font-bold block text-sm text-rose-200">UKVI WEEKLY CAP REACHED OR EXCEEDED ({currentWeekHours}h / {maxWeeklyHours}h)</span>
              <span>You have reached the legal maximum working hours for this calendar week. Do not log further shifts until next Monday.</span>
            </div>
          </div>
        </SpatialCard>
      ) : currentWeekHours > (maxWeeklyHours - 4) ? (
        <SpatialCard className="p-4 border border-amber-500/40 bg-amber-500/10 text-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs font-mono tabular-nums">
              <span className="font-bold block text-sm text-amber-200">APPROACHING WEEKLY CAP ({currentWeekHours}h / {maxWeeklyHours}h)</span>
              <span>You have {remainingWeeklyHours.toFixed(1)} hours remaining before reaching your legal visa cap for this week.</span>
            </div>
          </div>
        </SpatialCard>
      ) : (
        <SpatialCard className="p-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-300">
          <div className="flex items-center justify-between text-xs font-mono tabular-nums">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-[var(--text-primary)]">UKVI Compliance Safe:</span>
              <span>{currentWeekHours}h logged this week • {remainingWeeklyHours.toFixed(1)}h remaining buffer</span>
            </div>
            <Badge variant="emerald" size="sm">Active Status OK</Badge>
          </div>
        </SpatialCard>
      )}

      {/* TOP STATS & CIRCULAR CAP METER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Visa Meter Card */}
        <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase font-semibold">Weekly Visa Meter</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>

          <div className="my-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
                {currentWeekHours}<span className="text-sm text-[var(--text-muted)]">/{maxWeeklyHours}h</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Mon - Sun Window</span>
            </div>

            {/* Circular Meter SVG */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="currentColor"
                  className="text-black/[0.06] dark:text-white/10"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke={currentWeekHours >= maxWeeklyHours ? '#ef4444' : currentWeekHours > (maxWeeklyHours - 4) ? '#f59e0b' : '#10b981'}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="138"
                  strokeDashoffset={138 - (138 * weeklyUsagePercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[10px] font-mono tabular-nums font-bold text-[var(--text-primary)]">
                {weeklyUsagePercent}%
              </span>
            </div>
          </div>

          {/* Linear Meter Bar */}
          <div className="w-full bg-black/[0.06] dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentWeekHours >= maxWeeklyHours ? 'bg-rose-500' : currentWeekHours > (maxWeeklyHours - 4) ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${weeklyUsagePercent}%` }}
            />
          </div>
        </SpatialCard>

        {/* Monthly Earnings Card */}
        <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase font-semibold">Monthly Earned</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight font-semibold text-emerald-400">
              £{monthlyEarnings.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Current Calendar Month</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">From {(shifts || []).length} logged shifts</span>
        </SpatialCard>

        {/* Monthly Living Expenses Card */}
        <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase font-semibold">Living Expenses</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight font-semibold text-rose-400">
              £{monthlyExpenses.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Rent, Food & Transit</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{(expenses || []).length} recorded items</span>
        </SpatialCard>

        {/* Net Savings Balance */}
        <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase font-semibold">Net Savings</span>
            <TrendingUp className={`w-4 h-4 ${netSavingsBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className="my-2">
            <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight font-semibold ${netSavingsBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              £{netSavingsBalance.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">Surplus after living costs</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{netSavingsBalance >= 0 ? 'Positive Cash Flow' : 'Deficit'}</span>
        </SpatialCard>
      </div>

      {/* LOGGERS & TABLES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SHIFTS SECTION (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Shift Entry Form */}
          <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
            <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Log Part-Time Shift</span>
            </h3>

            <form onSubmit={handleAddShift} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1">Employer / Institution *</label>
                  <Input
                    required
                    placeholder="e.g. University Library"
                    value={newShift.employer}
                    onChange={(e) => setNewShift({ ...newShift, employer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] block mb-1">Date</label>
                  <Input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                    className="font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] block mb-1">End Time</label>
                  <Input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] block mb-1">Hourly Rate (£)</label>
                  <Input
                    type="number"
                    step="0.10"
                    value={newShift.hourlyRate}
                    onChange={(e) => setNewShift({ ...newShift, hourlyRate: e.target.value })}
                    className="font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[var(--text-muted)] font-mono tabular-nums">
                  Computed: <strong className="text-blue-400">{computedHours}h</strong> • Pay: <strong className="text-emerald-400">£{computedShiftPay.toFixed(2)}</strong>
                </span>
                <Button type="submit" variant="primary" size="sm">
                  + Log Shift
                </Button>
              </div>
            </form>
          </SpatialCard>

          {/* Shift Records Table */}
          <SpatialCard className="p-0 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl overflow-hidden">
            <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">Shift Ledger History</span>
              <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)]">{shifts.length} entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead className="bg-black/[0.02] dark:bg-white/5 border-b border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)] text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Employer</th>
                    <th className="py-2.5 px-3">Hours</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 text-[var(--text-primary)]">
                  {shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-[var(--text-muted)]">{s.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)] truncate max-w-[160px]">{s.employer}</td>
                      <td className="py-2.5 px-3 text-blue-400 font-bold">{s.hours}h</td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">£{s.hourlyRate.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">£{s.totalPay.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteShift(s.id)}
                          className="text-[var(--text-muted)] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          title="Delete Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {shifts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[var(--text-muted)]">
                        No shifts logged for this week (0/20 hrs used).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SpatialCard>
        </div>

        {/* EXPENSES SECTION (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Expense Form */}
          <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
            <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>Record Expense</span>
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1">Description / Item *</label>
                <Input
                  required
                  placeholder="e.g. Grocery, Rent, Transport"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Groceries" className="bg-white dark:bg-slate-900">Groceries</option>
                    <option value="Rent & Utilities" className="bg-white dark:bg-slate-900">Rent & Utilities</option>
                    <option value="Transport" className="bg-white dark:bg-slate-900">Transport</option>
                    <option value="Study Materials" className="bg-white dark:bg-slate-900">Study Materials</option>
                    <option value="Dining & Social" className="bg-white dark:bg-slate-900">Dining & Social</option>
                    <option value="Other" className="bg-white dark:bg-slate-900">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1">Amount (£) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="e.g. 24.50"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="secondary" size="sm">
                  + Add Expense
                </Button>
              </div>
            </form>
          </SpatialCard>

          {/* Expenses List */}
          <SpatialCard className="p-0 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl overflow-hidden">
            <div className="p-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase">Recent Expenses</span>
              <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)]">{expenses.length} records</span>
            </div>

            <div className="divide-y divide-black/[0.04] dark:divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
              {expenses.map((e) => (
                <div key={e.id} className="p-3 flex items-center justify-between text-xs font-mono hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <span className="font-bold text-[var(--text-primary)] block">{e.description}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">{e.date} • {e.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono tabular-nums text-rose-400">-£{e.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="text-[var(--text-muted)] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {expenses.length === 0 && (
                <div className="p-6 text-center text-xs text-[var(--text-muted)] font-mono">
                  No expenses logged yet. Add your first expense above.
                </div>
              )}
            </div>
          </SpatialCard>
        </div>
      </div>
    </div>
  );
};

export default VisaWageLedger;
