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
import { Card } from '../../ui/Card';
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
    const rate = Number(newShift.hourlyRate) || 0;
    return Number((computedHours * rate).toFixed(2));
  }, [computedHours, newShift.hourlyRate]);

  // Weekly Hours calculation (Rolling 7-day or Current Week)
  const maxWeeklyHours = isTermTime ? 20 : 40;
  
  const currentWeekHours = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return (shifts || []).reduce((sum, s) => {
      const shiftDate = new Date(s.date);
      if (shiftDate >= monday) {
        return sum + (Number(s.hours) || 0);
      }
      return sum;
    }, 0);
  }, [shifts]);

  const remainingWeeklyHours = Math.max(0, maxWeeklyHours - currentWeekHours);
  const weeklyUsagePercent = Math.min(100, Math.round((currentWeekHours / maxWeeklyHours) * 100));

  // Monthly Budget Summary
  const monthlyEarnings = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return (shifts || []).reduce((sum, s) => {
      const d = new Date(s.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + (Number(s.totalPay) || 0);
      }
      return sum;
    }, 0);
  }, [shifts]);

  const monthlyExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return (expenses || []).reduce((sum, e) => {
      const d = new Date(e.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + (Number(e.amount) || 0);
      }
      return sum;
    }, 0);
  }, [expenses]);

  const netSavingsBalance = monthlyEarnings - monthlyExpenses;

  // Handlers
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
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>UK Visa & Wage Ledger Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
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
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => {
                setIsTermTime(true);
                toast.info('Switched to Term Time mode (20 hrs/wk limit)');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                isTermTime ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Term (20h)
            </button>
            <button
              onClick={() => {
                setIsTermTime(false);
                toast.info('Switched to Vacation mode (40 hrs/wk limit)');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                !isTermTime ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vacation (40h)
            </button>
          </div>
        </div>
      </div>

      {/* COMPLIANCE STATUS ALERT BANNER */}
      {currentWeekHours >= maxWeeklyHours ? (
        <Card variant="glass" padding="md" className="border border-rose-500/40 bg-rose-500/10 text-rose-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs font-mono">
              <span className="font-bold block text-sm text-rose-200">UKVI WEEKLY CAP REACHED OR EXCEEDED ({currentWeekHours}h / {maxWeeklyHours}h)</span>
              <span>You have reached the legal maximum working hours for this calendar week. Do not log further shifts until next Monday.</span>
            </div>
          </div>
        </Card>
      ) : currentWeekHours > (maxWeeklyHours - 4) ? (
        <Card variant="glass" padding="md" className="border border-amber-500/40 bg-amber-500/10 text-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs font-mono">
              <span className="font-bold block text-sm text-amber-200">APPROACHING WEEKLY CAP ({currentWeekHours}h / {maxWeeklyHours}h)</span>
              <span>You have {remainingWeeklyHours.toFixed(1)} hours remaining before reaching your legal visa cap for this week.</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card variant="glass" padding="sm" className="border border-emerald-500/20 bg-emerald-500/5 text-emerald-300">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">UKVI Compliance Safe:</span>
              <span>{currentWeekHours}h logged this week • {remainingWeeklyHours.toFixed(1)}h remaining buffer</span>
            </div>
            <Badge variant="success" size="sm">Active Status OK</Badge>
          </div>
        </Card>
      )}

      {/* TOP STATS & CIRCULAR CAP METER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Visa Meter Card */}
        <Card variant="glass" padding="md" className="border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Weekly Visa Meter</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>

          <div className="my-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold font-mono text-white">
                {currentWeekHours}<span className="text-sm text-slate-400">/{maxWeeklyHours}h</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Mon - Sun Window</span>
            </div>

            {/* Circular Meter SVG */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="rgba(255,255,255,0.1)"
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
              <span className="absolute text-[10px] font-mono font-bold text-white">
                {weeklyUsagePercent}%
              </span>
            </div>
          </div>

          {/* Linear Meter Bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentWeekHours >= maxWeeklyHours ? 'bg-rose-500' : currentWeekHours > (maxWeeklyHours - 4) ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${weeklyUsagePercent}%` }}
            />
          </div>
        </Card>

        {/* Monthly Earnings Card */}
        <Card variant="glass" padding="md" className="border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Monthly Earned</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              £{monthlyEarnings.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-slate-400">Current Calendar Month</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">From {(shifts || []).length} logged shifts</span>
        </Card>

        {/* Monthly Living Expenses Card */}
        <Card variant="glass" padding="md" className="border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Living Expenses</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-rose-400">
              £{monthlyExpenses.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-slate-400">Rent, Food & Transit</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{(expenses || []).length} recorded items</span>
        </Card>

        {/* Net Savings Balance */}
        <Card variant="glass" padding="md" className="border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Net Savings</span>
            <TrendingUp className={`w-4 h-4 ${netSavingsBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className="my-2">
            <div className={`text-2xl font-bold font-mono ${netSavingsBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              £{netSavingsBalance.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono text-slate-400">Surplus after living costs</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{netSavingsBalance >= 0 ? 'Positive Cash Flow' : 'Deficit'}</span>
        </Card>
      </div>

      {/* LOGGERS & TABLES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SHIFTS SECTION (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Shift Entry Form */}
          <Card variant="glass" padding="md" className="border border-white/10">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Log Part-Time Shift</span>
            </h3>

            <form onSubmit={handleAddShift} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Employer / Institution *</label>
                  <Input
                    required
                    placeholder="e.g. University Library"
                    value={newShift.employer}
                    onChange={(e) => setNewShift({ ...newShift, employer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Date</label>
                  <Input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Time</label>
                  <Input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Hourly Rate (£)</label>
                  <Input
                    type="number"
                    step="0.10"
                    value={newShift.hourlyRate}
                    onChange={(e) => setNewShift({ ...newShift, hourlyRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-slate-300">
                  Computed: <strong className="text-blue-400">{computedHours}h</strong> • Pay: <strong className="text-emerald-400">£{computedShiftPay.toFixed(2)}</strong>
                </span>
                <Button type="submit" variant="primary" size="sm">
                  + Log Shift
                </Button>
              </div>
            </form>
          </Card>

          {/* Shift Records Table */}
          <Card variant="glass" padding="none" className="border border-white/10 overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">Shift Ledger History</span>
              <span className="text-[10px] font-mono text-slate-400">{shifts.length} entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Employer</th>
                    <th className="py-2.5 px-3">Hours</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">{s.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-white truncate max-w-[160px]">{s.employer}</td>
                      <td className="py-2.5 px-3 text-blue-400 font-bold">{s.hours}h</td>
                      <td className="py-2.5 px-3 text-slate-400">£{s.hourlyRate.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">£{s.totalPay.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteShift(s.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {shifts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No shifts logged for this week (0/20 hrs used).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* EXPENSES SECTION (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Expense Form */}
          <Card variant="glass" padding="md" className="border border-white/10">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>Record Expense</span>
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Description / Item *</label>
                <Input
                  required
                  placeholder="e.g. Tesco Grocery, Rent, Tube"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Groceries" className="bg-slate-900">Groceries</option>
                    <option value="Rent & Utilities" className="bg-slate-900">Rent & Utilities</option>
                    <option value="Transport" className="bg-slate-900">Transport</option>
                    <option value="Study Materials" className="bg-slate-900">Study Materials</option>
                    <option value="Dining & Social" className="bg-slate-900">Dining & Social</option>
                    <option value="Other" className="bg-slate-900">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Amount (£) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="e.g. 24.50"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="secondary" size="sm">
                  + Add Expense
                </Button>
              </div>
            </form>
          </Card>

          {/* Expenses List */}
          <Card variant="glass" padding="none" className="border border-white/10 overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">Recent Expenses</span>
              <span className="text-[10px] font-mono text-slate-400">{expenses.length} records</span>
            </div>

            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
              {expenses.map((e) => (
                <div key={e.id} className="p-3 flex items-center justify-between text-xs font-mono hover:bg-white/[0.02] transition-colors">
                  <div>
                    <span className="font-bold text-white block">{e.description}</span>
                    <span className="text-[10px] text-slate-400">{e.date} • {e.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-400">-£{e.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {expenses.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 font-mono">
                  No expenses logged yet. Add your first expense above.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisaWageLedger;
