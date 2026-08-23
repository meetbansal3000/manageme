// Component: Financial Ledger & Visa Wage Accounting Engine

import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  Wallet, 
  Receipt, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Trash2
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { UserTrackerData } from '../../../hooks/useFirestoreData';

export interface FinancialLedgerProps {
  userData?: UserTrackerData;
  updateData?: (partial: Partial<UserTrackerData>) => void;
  currencySymbol?: string;
}

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({
  userData,
  updateData,
  currencySymbol = '£'
}) => {
  // Defensive initial state fallbacks
  const [expenses, setExpenses] = useState<any[]>(() => Array.isArray(userData?.expenses) ? userData.expenses : []);
  const [shifts, setShifts] = useState<any[]>(() => Array.isArray(userData?.workShifts) ? userData.workShifts : []);
  const [income, setIncome] = useState<any[]>(() => Array.isArray(userData?.invoices) ? userData.invoices : []);

  useEffect(() => {
    setExpenses(Array.isArray(userData?.expenses) ? userData.expenses : []);
  }, [userData?.expenses]);

  useEffect(() => {
    setShifts(Array.isArray(userData?.workShifts) ? userData.workShifts : []);
  }, [userData?.workShifts]);

  useEffect(() => {
    setIncome(Array.isArray(userData?.invoices) ? userData.invoices : []);
  }, [userData?.invoices]);

  // Form states
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0]
  });

  const [newShift, setNewShift] = useState({
    roleTitle: '',
    hours: '',
    hourlyRate: '15.50',
    date: new Date().toISOString().split('T')[0]
  });

  // Safe calculation reducers
  const totalExpenses = (expenses || []).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const totalHours = (shifts || []).reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);
  const totalShiftEarnings = (shifts || []).reduce((sum, item) => {
    const hrs = Number(item?.hours) || 0;
    const rate = Number(item?.hourlyRate) || 15.50;
    return sum + (hrs * rate);
  }, 0);
  const netBalance = totalShiftEarnings - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount) return;
    const item = {
      id: `exp_${Date.now()}`,
      description: newExpense.description || newExpense.category,
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date
    };
    const updated = [item, ...expenses];
    setExpenses(updated);
    if (updateData) updateData({ expenses: updated });
    setNewExpense({ description: '', amount: '', category: 'General', date: new Date().toISOString().split('T')[0] });
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.hours) return;
    const item = {
      id: `shift_${Date.now()}`,
      roleTitle: newShift.roleTitle || 'Part-Time Shift',
      hours: Number(newShift.hours),
      hourlyRate: Number(newShift.hourlyRate) || 15.50,
      date: newShift.date
    };
    const updated = [item, ...shifts];
    setShifts(updated);
    if (updateData) updateData({ workShifts: updated });
    setNewShift({ roleTitle: '', hours: '', hourlyRate: '15.50', date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    if (updateData) updateData({ expenses: updated });
  };

  const handleDeleteShift = (id: string) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    if (updateData) updateData({ workShifts: updated });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" padding="md" className="border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Shift Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {currencySymbol}{totalShiftEarnings.toFixed(2)}
          </div>
        </Card>

        <Card variant="glass" padding="md" className="border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Expenses</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {currencySymbol}{totalExpenses.toFixed(2)}
          </div>
        </Card>

        <Card variant="glass" padding="md" className="border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Visa Weekly Hours</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {totalHours.toFixed(1)} / 20 hrs
          </div>
        </Card>

        <Card variant="glass" padding="md" className="border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Net Surplus</span>
            <TrendingUp className={`w-4 h-4 ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono mt-2 ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currencySymbol}{netBalance.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Overview Empty State */}
      {expenses.length === 0 && shifts.length === 0 && (
        <Card variant="glass" padding="md" className="border border-white/10 text-center py-6">
          <Wallet className="w-8 h-8 mx-auto text-blue-400 opacity-60 mb-2" />
          <p className="font-semibold text-white text-sm">
            No expenses or shifts logged yet. Add your first entry above.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Track daily living costs, part-time wages, and monitor Tier-4 / Student Visa 20-hour limits.
          </p>
        </Card>
      )}

      {/* Main Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Column */}
        <div className="space-y-4">
          <Card variant="glass" padding="md" className="border border-white/10">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>Log Expense</span>
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Vendor / Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
                <Button type="submit" variant="primary" className="w-full justify-center">
                  + Add Expense
                </Button>
              </div>
            </form>
          </Card>

          {/* Expenses List */}
          <Card variant="glass" padding="none" className="border border-white/10 overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">Expense Entries</span>
              <span className="text-[10px] font-mono text-slate-400">{expenses.length} records</span>
            </div>

            {expenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono space-y-2">
                <Receipt className="w-6 h-6 mx-auto opacity-40 text-rose-400" />
                <p className="font-semibold text-slate-400">No expenses logged yet. Add your first expense above.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {expenses.map((exp) => (
                  <div key={exp.id} className="p-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-white block">{exp.description || exp.category}</span>
                      <span className="text-[10px] text-slate-400">{exp.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-rose-400">-{currencySymbol}{Number(exp.amount).toFixed(2)}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Work Shifts / Visa Column */}
        <div className="space-y-4">
          <Card variant="glass" padding="md" className="border border-white/10">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Log Work Shift</span>
            </h3>
            <form onSubmit={handleAddShift} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Role / Location"
                  value={newShift.roleTitle}
                  onChange={(e) => setNewShift({ ...newShift, roleTitle: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.25"
                  placeholder="Hours (e.g. 4.5)"
                  value={newShift.hours}
                  onChange={(e) => setNewShift({ ...newShift, hours: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={newShift.date}
                  onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                />
                <Button type="submit" variant="primary" className="w-full justify-center">
                  + Log Shift
                </Button>
              </div>
            </form>
          </Card>

          {/* Shifts List */}
          <Card variant="glass" padding="none" className="border border-white/10 overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">Logged Shifts</span>
              <span className="text-[10px] font-mono text-slate-400">{shifts.length} shifts</span>
            </div>

            {shifts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono space-y-2">
                <Clock className="w-6 h-6 mx-auto opacity-40 text-blue-400" />
                <p className="font-semibold text-slate-400">No shifts logged for this week (0/20 hrs used).</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {shifts.map((shift) => (
                  <div key={shift.id} className="p-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-white block">{shift.roleTitle || 'Work Shift'}</span>
                      <span className="text-[10px] text-slate-400">{shift.date} • {shift.hours} hrs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">+{currencySymbol}{(Number(shift.hours) * (Number(shift.hourlyRate) || 15.50)).toFixed(2)}</span>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialLedger;
