import React, { useState, useMemo, useRef, useEffect } from 'react';
import { List, RowComponentProps } from 'react-window';
import { 
  ArrowRightLeft, Share2, Users, DollarSign, Clock, X, AlertTriangle, 
  Wallet, CreditCard as CardIcon, Receipt, Upload, Trash2, Plus, Download, 
  Loader2, Bot, Zap, Edit2, Copy, Sliders, Tag, Search, Filter, CheckCircle2,
  Calendar, Building, ExternalLink, ChevronDown, ChevronUp, Mail, Sparkles, Target, Percent,
  CheckSquare, Square, Layers
} from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { WorkShift, Expense, CreditCard, Invoice } from '../types';
import { getAccessToken } from '../firebase';
import { useScrollLock } from '../hooks/useScrollLock';
import { useToast } from '../context/ToastContext';
import { SubscriptionManager } from './SubscriptionManager';
import { VehicleCostCalculator } from './VehicleCostCalculator';
import { AppleEmptyState } from './AppleEmptyState';

import { EditShiftModal } from './finance/EditShiftModal';
import { EditExpenseModal } from './finance/EditExpenseModal';
import { EditCreditCardModal } from './finance/EditCreditCardModal';
import { EditInvoiceModal } from './finance/EditInvoiceModal';
import { ManageCategoriesModal, CategoryConfig } from './finance/ManageCategoriesModal';
import { ManagePeersModal, PeerProfile } from './finance/ManagePeersModal';
import { HubCustomizerModal, HubPreferences, DEFAULT_HUB_PREFERENCES } from './finance/HubCustomizerModal';

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { name: 'Food', monthlyBudget: 250, color: '#f97316' },
  { name: 'Transport', monthlyBudget: 80, color: '#3b82f6' },
  { name: 'Rent', monthlyBudget: 650, color: '#10b981' },
  { name: 'Utilities', monthlyBudget: 60, color: '#8b5cf6' },
  { name: 'Entertainment', monthlyBudget: 100, color: '#ec4899' },
  { name: 'Prep Materials', monthlyBudget: 50, color: '#eab308' },
  { name: 'Other', monthlyBudget: 100, color: '#71717a' },
];

const DEFAULT_PEERS: PeerProfile[] = [
  { name: 'Alex', defaultSplitPct: 50, email: 'alex@example.com', paymentHandle: 'monzo.me/alex' },
  { name: 'Maya', defaultSplitPct: 50, email: 'maya@example.com', paymentHandle: 'revolut.me/maya' },
];

interface ShiftRowExtraProps {
  shifts: WorkShift[];
  hourlyRate: number;
  currencySymbol: string;
  onEditShift: (shift: WorkShift) => void;
  onDuplicateShift: (shift: WorkShift) => void;
  onDeleteShift: (id: string) => void;
  selectedShiftIds: string[];
  isBatchMode: boolean;
  onToggleSelectShift: (id: string) => void;
}

const ShiftRowItem = ({ 
  index, 
  style, 
  shifts, 
  hourlyRate, 
  currencySymbol, 
  onEditShift, 
  onDuplicateShift, 
  onDeleteShift,
  selectedShiftIds,
  isBatchMode,
  onToggleSelectShift
}: RowComponentProps<ShiftRowExtraProps>) => {
  const shift = shifts[index];
  if (!shift) return null;

  const isSelected = selectedShiftIds.includes(shift.id);
  const effectiveRate = (shift.hourlyRate || hourlyRate) * (shift.rateMultiplier || 1.0);
  const earned = shift.totalEarned !== undefined ? shift.totalEarned : shift.hours * effectiveRate;

  return (
    <div style={style} className="pb-2 pr-2">
      <div className={`flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-solid)] border transition-all group h-[72px] ${
        isSelected ? 'border-blue-500 bg-blue-500/5 shadow-sm shadow-blue-500/10' : 'border-[var(--border)] hover:border-[var(--border)]/80'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
          {isBatchMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelectShift(shift.id);
              }}
              className="p-1 rounded-lg text-blue-400 shrink-0 hover:scale-110 transition-transform"
              title={isSelected ? "Deselect" : "Select"}
            >
              {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-[var(--text-secondary)]" />}
            </button>
          )}
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-xs text-[var(--text-primary)]">
                {new Date(shift.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              </h4>
              {shift.roleTitle && (
                <span className="text-[10px] bg-blue-500/15 text-blue-300 px-1.5 py-0.2 rounded-md font-medium truncate max-w-[120px]">
                  {shift.roleTitle}
                </span>
              )}
              {shift.rateMultiplier && shift.rateMultiplier > 1.0 && (
                <span className="text-[10px] bg-amber-500/15 text-amber-300 px-1.5 py-0.2 rounded-md font-mono font-bold">
                  {shift.rateMultiplier}x
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {shift.startTime} - {shift.endTime} • <span className="font-semibold text-[var(--text-primary)]">{shift.hours}h</span>
              {shift.location ? ` • ${shift.location}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="font-bold text-emerald-400 text-xs font-mono block">
              +{currencySymbol}{earned.toFixed(2)}
            </span>
            <span className="text-[9px] text-[var(--text-secondary)] font-mono">
              @{currencySymbol}{effectiveRate.toFixed(2)}/h
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {!isBatchMode && (
              <button
                onClick={() => onToggleSelectShift(shift.id)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                title="Select for batch"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={() => onEditShift(shift)} 
              className="p-1.5 text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
              title="Edit Shift"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onDuplicateShift(shift)} 
              className="p-1.5 text-[var(--text-secondary)] hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
              title="Duplicate Shift"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onDeleteShift(shift.id)} 
              className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Delete Shift"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExpenseRowExtraProps {
  expenses: Expense[];
  categories: CategoryConfig[];
  currencySymbol: string;
  onEditExpense: (exp: Expense) => void;
  onDeleteExpense: (id: string) => void;
  selectedExpenseIds: string[];
  isBatchMode: boolean;
  onToggleSelectExpense: (id: string) => void;
}

const ExpenseRowItem = ({ 
  index, 
  style, 
  expenses, 
  categories, 
  currencySymbol, 
  onEditExpense, 
  onDeleteExpense,
  selectedExpenseIds,
  isBatchMode,
  onToggleSelectExpense
}: RowComponentProps<ExpenseRowExtraProps>) => {
  const exp = expenses[index];
  if (!exp) return null;

  const isSelected = selectedExpenseIds.includes(exp.id);
  const catConfig = categories.find(c => c.name === exp.category);
  const catColor = catConfig?.color || '#71717a';

  return (
    <div style={style} className="pb-2 pr-2">
      <div className={`flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-solid)] border transition-all group h-[74px] ${
        isSelected ? 'border-emerald-500 bg-emerald-500/5 shadow-sm shadow-emerald-500/10' : 'border-[var(--border)] hover:border-[var(--border)]/80'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
          {isBatchMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelectExpense(exp.id);
              }}
              className="p-1 rounded-lg text-emerald-400 shrink-0 hover:scale-110 transition-transform"
              title={isSelected ? "Deselect" : "Select"}
            >
              {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-[var(--text-secondary)]" />}
            </button>
          )}
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${catColor}20`, color: catColor }}
          >
            <Receipt className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-xs leading-tight text-[var(--text-primary)] truncate">
                {exp.description || exp.category}
              </h4>
              <span 
                className="text-[9px] px-1.5 py-0.2 rounded-md font-semibold shrink-0"
                style={{ backgroundColor: `${catColor}25`, color: catColor }}
              >
                {exp.category}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {exp.paymentMethod ? ` • ${exp.paymentMethod}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="font-bold text-red-400 text-xs font-mono block">
              -{currencySymbol}{exp.amount.toFixed(2)}
            </span>
            {exp.owedToMe && exp.owedToMe > 0 ? (
              <span className="text-[9px] text-emerald-400 font-medium tracking-wide uppercase block">
                {exp.splitWith ? `${exp.splitWith} owes` : 'Owed'} {currencySymbol}{exp.owedToMe.toFixed(2)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {!isBatchMode && (
              <button
                onClick={() => onToggleSelectExpense(exp.id)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                title="Select for batch"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={() => onEditExpense(exp)} 
              className="p-1.5 text-[var(--text-secondary)] hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
              title="Edit Expense"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onDeleteExpense(exp.id)} 
              className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Delete Expense"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Props {
  userData: UserTrackerData;
  updateData: (partial: Partial<UserTrackerData>) => void;
}

export const FinanceHubTab: React.FC<Props> = ({ userData, updateData }) => {
  const { showToast } = useToast();

  // Settings & Customization State
  const [hubPrefs, setHubPrefs] = useState<HubPreferences>(() => {
    try {
      const saved = localStorage.getItem('manageme_hub_preferences');
      if (saved) return { ...DEFAULT_HUB_PREFERENCES, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_HUB_PREFERENCES;
  });

  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    try {
      const saved = localStorage.getItem('manageme_expense_categories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const [peers, setPeers] = useState<PeerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('manageme_peer_directory');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PEERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('manageme_hub_preferences', JSON.stringify(hubPrefs));
    } catch {}
  }, [hubPrefs]);

  useEffect(() => {
    try {
      localStorage.setItem('manageme_expense_categories', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('manageme_peer_directory', JSON.stringify(peers));
    } catch {}
  }, [peers]);

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isPeersModalOpen, setIsPeersModalOpen] = useState(false);

  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // New Shift / Expense Input state
  const [newShift, setNewShift] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '13:00',
    hours: 4,
    roleTitle: '',
    rateMultiplier: 1.0,
    location: '',
    notes: ''
  });

  const [newExpense, setNewExpense] = useState({
    category: 'Food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Debit Card',
    isSplit: false,
    peerName: '',
    splitRatio: '50',
    notes: ''
  });

  // Search & Filter State
  const [shiftSearchQuery, setShiftSearchQuery] = useState('');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [selectedExpenseCatFilter, setSelectedExpenseCatFilter] = useState('ALL');

  // Batch Operations State for Shifts
  const [isBatchShiftMode, setIsBatchShiftMode] = useState(false);
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);

  // Batch Operations State for Expenses
  const [isBatchExpenseMode, setIsBatchExpenseMode] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingReceipt, setIsParsingReceipt] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isTermTime, setIsTermTime] = useState(userData.termStatus !== 'Vacation');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useScrollLock(
    isCustomizerOpen || isCategoriesModalOpen || isPeersModalOpen || 
    !!editingShift || !!editingExpense || isCardModalOpen || isInvoiceModalOpen || !!conflictWarning
  );

  // Currency resolution
  const activeCurrency = hubPrefs.currency || userData.currency || 'GBP';
  const currencySymbol = activeCurrency === 'USD' ? '$' : activeCurrency === 'INR' ? '₹' : activeCurrency === 'EUR' ? '€' : activeCurrency === 'CAD' ? 'C$' : activeCurrency === 'AUD' ? 'A$' : activeCurrency === 'JPY' ? '¥' : '£';

  // Hours calculation
  const totalHours = useMemo(() => (userData.workShifts || []).reduce((sum, s) => sum + s.hours, 0), [userData.workShifts]);
  
  const totalEarnedGross = useMemo(() => {
    return (userData.workShifts || []).reduce((sum, s) => {
      const rate = (s.hourlyRate || userData.hourlyRate || 0) * (s.rateMultiplier || 1.0);
      const earned = s.totalEarned !== undefined ? s.totalEarned : s.hours * rate;
      return sum + earned;
    }, 0);
  }, [userData.workShifts, userData.hourlyRate]);

  const taxDeductionAmount = hubPrefs.showTaxDeduction && hubPrefs.taxRatePct > 0 
    ? totalEarnedGross * (hubPrefs.taxRatePct / 100) 
    : 0;
  
  const totalEarnedNet = totalEarnedGross - taxDeductionAmount;
  const totalExpenses = useMemo(() => (userData.expenses || []).reduce((sum, e) => sum + e.amount, 0), [userData.expenses]);
  const netSavings = totalEarnedNet - totalExpenses;

  // Monthly earnings goal progress
  const targetEarnings = hubPrefs.monthlyTargetEarnings || 800;
  const targetProgressPct = Math.min(100, Math.round((totalEarnedNet / targetEarnings) * 100));

  // Visa work limit calculation based on user window mode
  const visaHours = useMemo(() => {
    const shifts = userData.workShifts || [];
    const now = new Date();

    if (hubPrefs.visaWindowMode === 'calendarMon') {
      // Current calendar week starting Monday
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      return shifts.filter(s => new Date(s.date) >= monday).reduce((sum, s) => sum + s.hours, 0);
    } else if (hubPrefs.visaWindowMode === 'calendarSun') {
      // Current calendar week starting Sunday
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - now.getDay());
      sunday.setHours(0, 0, 0, 0);

      return shifts.filter(s => new Date(s.date) >= sunday).reduce((sum, s) => sum + s.hours, 0);
    } else {
      // Rolling 7-day window
      return shifts.filter(s => {
        const d = new Date(s.date);
        return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000 && d <= now;
      }).reduce((sum, s) => sum + s.hours, 0);
    }
  }, [userData.workShifts, hubPrefs.visaWindowMode]);

  const limit = hubPrefs.visaLimit || userData.visaLimit || 20;
  const warningMargin = hubPrefs.visaWarningMargin || 2;
  const isVisaWarning = isTermTime && visaHours >= (limit - warningMargin) && visaHours <= limit;
  const isVisaExceeded = isTermTime && visaHours > limit;
  const visaUsagePercent = Math.min(100, (visaHours / limit) * 100);

  // University timetable conflict check
  const checkConflicts = (date: string, startTime: string, endTime: string) => {
    if (!hubPrefs.conflictDetectionEnabled || !isTermTime || !userData.uniClasses) return null;
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-GB', { weekday: 'long' });
    const dayClasses = (userData.uniClasses || []).filter(c => c.dayOfWeek === dayOfWeek);
    
    for (const uniClass of dayClasses) {
      if ((startTime >= uniClass.startTime && startTime < uniClass.endTime) ||
          (endTime > uniClass.startTime && endTime <= uniClass.endTime) ||
          (startTime <= uniClass.startTime && endTime >= uniClass.endTime)) {
        return `Schedule conflict detected with ${uniClass.moduleName} (${uniClass.type}) scheduled at ${uniClass.startTime}-${uniClass.endTime}.`;
      }
    }
    return null;
  };

  // Shift Actions
  const handleAddShift = () => {
    if (!newShift.date || !newShift.startTime || !newShift.endTime || !newShift.hours) {
      showToast('Please fill in shift date, times, and total hours');
      return;
    }
    
    const conflict = checkConflicts(newShift.date, newShift.startTime, newShift.endTime);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const effectiveRate = (userData.hourlyRate || 0) * (newShift.rateMultiplier || 1.0);
    const totalEarned = Number(newShift.hours) * effectiveRate;

    const shift: WorkShift = {
      id: Date.now().toString(),
      date: newShift.date,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      hours: Number(newShift.hours),
      roleTitle: newShift.roleTitle || undefined,
      hourlyRate: userData.hourlyRate || 0,
      rateMultiplier: newShift.rateMultiplier || 1.0,
      totalEarned: Number(totalEarned.toFixed(2)),
      location: newShift.location || undefined,
      notes: newShift.notes || undefined
    };
    
    updateData({ workShifts: [shift, ...(userData.workShifts || [])] });
    showToast(`Logged ${shift.hours}h shift (+${currencySymbol}${totalEarned.toFixed(2)})`);

    setNewShift({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '13:00',
      hours: 4,
      roleTitle: '',
      rateMultiplier: 1.0,
      location: '',
      notes: ''
    });
  };

  const handleApplyPreset = (preset: { label: string; hours: number; start: string; end: string }) => {
    setNewShift(prev => ({
      ...prev,
      startTime: preset.start,
      endTime: preset.end,
      hours: preset.hours,
      roleTitle: preset.label
    }));
    showToast(`Applied preset: ${preset.label}`);
  };

  const handleSaveEditedShift = (updated: WorkShift) => {
    const list = (userData.workShifts || []).map(s => s.id === updated.id ? updated : s);
    updateData({ workShifts: list });
    showToast('Work shift updated successfully');
  };

  const handleDuplicateShift = (source: WorkShift) => {
    const duplicated: WorkShift = {
      ...source,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    updateData({ workShifts: [duplicated, ...(userData.workShifts || [])] });
    showToast(`Duplicated shift to today's date`);
  };

  const handleDeleteShift = (id: string) => {
    updateData({ workShifts: (userData.workShifts || []).filter(s => s.id !== id) });
    showToast('Shift deleted');
  };

  // Batch Shift Handlers
  const handleToggleSelectShift = (id: string) => {
    setSelectedShiftIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAllShifts = (visibleList: WorkShift[]) => {
    if (selectedShiftIds.length === visibleList.length && visibleList.length > 0) {
      setSelectedShiftIds([]);
    } else {
      setSelectedShiftIds(visibleList.map(s => s.id));
    }
  };

  const handleBulkUpdateShiftRateMultiplier = (multiplier: number) => {
    if (selectedShiftIds.length === 0) return;
    const updated = (userData.workShifts || []).map(s => {
      if (selectedShiftIds.includes(s.id)) {
        const rate = (s.hourlyRate || userData.hourlyRate || 0) * multiplier;
        const totalEarned = Number((s.hours * rate).toFixed(2));
        return { ...s, rateMultiplier: multiplier, totalEarned };
      }
      return s;
    });
    updateData({ workShifts: updated });
    showToast(`Updated rate multiplier to ${multiplier}x for ${selectedShiftIds.length} shifts`);
  };

  const handleBulkUpdateShiftRole = (roleTitle: string) => {
    if (selectedShiftIds.length === 0 || !roleTitle.trim()) return;
    const updated = (userData.workShifts || []).map(s => 
      selectedShiftIds.includes(s.id) ? { ...s, roleTitle: roleTitle.trim() } : s
    );
    updateData({ workShifts: updated });
    showToast(`Updated role title for ${selectedShiftIds.length} shifts`);
  };

  const handleBulkDeleteShifts = () => {
    if (selectedShiftIds.length === 0) return;
    const updated = (userData.workShifts || []).filter(s => !selectedShiftIds.includes(s.id));
    updateData({ workShifts: updated });
    showToast(`Deleted ${selectedShiftIds.length} shifts`);
    setSelectedShiftIds([]);
    setIsBatchShiftMode(false);
  };

  // Expense Actions
  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.date) {
      showToast('Please specify expense amount and date');
      return;
    }
    
    const baseAmount = Number(newExpense.amount);
    let owedToMe = 0;
    let actualExpense = baseAmount;
    
    if (newExpense.isSplit && newExpense.peerName) {
      const myPct = Number(newExpense.splitRatio || 50);
      actualExpense = baseAmount * (myPct / 100);
      owedToMe = baseAmount - actualExpense;
    }
    
    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      amount: Number(actualExpense.toFixed(2)),
      date: newExpense.date,
      description: newExpense.description || '',
      paymentMethod: newExpense.paymentMethod,
      splitWith: newExpense.isSplit ? newExpense.peerName : undefined,
      splitType: newExpense.isSplit ? 'custom' : undefined,
      splitRatio: newExpense.isSplit ? Number(newExpense.splitRatio) : undefined,
      owedToMe: Number(owedToMe.toFixed(2)),
      iOwe: 0,
      settled: false,
      notes: newExpense.notes || ''
    };

    updateData({ expenses: [expense, ...(userData.expenses || [])] });
    showToast(`Logged ${currencySymbol}${actualExpense.toFixed(2)} for ${expense.category}`);

    setNewExpense({
      category: categories[0]?.name || 'Food',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'Debit Card',
      isSplit: false,
      peerName: '',
      splitRatio: '50',
      notes: ''
    });
  };

  const handleSaveEditedExpense = (updated: Expense) => {
    const list = (userData.expenses || []).map(e => e.id === updated.id ? updated : e);
    updateData({ expenses: list });
    showToast('Expense updated successfully');
  };

  const handleDeleteExpense = (id: string) => {
    updateData({ expenses: (userData.expenses || []).filter(e => e.id !== id) });
    showToast('Expense removed');
  };

  // Batch Expense Handlers
  const handleToggleSelectExpense = (id: string) => {
    setSelectedExpenseIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAllExpenses = (visibleList: Expense[]) => {
    if (selectedExpenseIds.length === visibleList.length && visibleList.length > 0) {
      setSelectedExpenseIds([]);
    } else {
      setSelectedExpenseIds(visibleList.map(e => e.id));
    }
  };

  const handleBulkUpdateExpenseCategory = (category: string) => {
    if (selectedExpenseIds.length === 0) return;
    const updated = (userData.expenses || []).map(e => 
      selectedExpenseIds.includes(e.id) ? { ...e, category } : e
    );
    updateData({ expenses: updated });
    showToast(`Categorized ${selectedExpenseIds.length} expenses as ${category}`);
  };

  const handleBulkUpdateExpensePaymentMethod = (paymentMethod: string) => {
    if (selectedExpenseIds.length === 0) return;
    const updated = (userData.expenses || []).map(e => 
      selectedExpenseIds.includes(e.id) ? { ...e, paymentMethod } : e
    );
    updateData({ expenses: updated });
    showToast(`Updated payment method for ${selectedExpenseIds.length} expenses`);
  };

  const handleBulkDeleteExpenses = () => {
    if (selectedExpenseIds.length === 0) return;
    const updated = (userData.expenses || []).filter(e => !selectedExpenseIds.includes(e.id));
    updateData({ expenses: updated });
    showToast(`Deleted ${selectedExpenseIds.length} expenses`);
    setSelectedExpenseIds([]);
    setIsBatchExpenseMode(false);
  };

  // Credit Card Actions
  const handleSaveCreditCard = (card: CreditCard) => {
    const existing = userData.creditCards || [];
    const exists = existing.some(c => c.id === card.id);
    const updated = exists 
      ? existing.map(c => c.id === card.id ? card : c)
      : [...existing, card];
    
    updateData({ creditCards: updated });
    showToast(`Card "${card.cardName}" saved`);
  };

  const handleDeleteCreditCard = (id: string) => {
    updateData({ creditCards: (userData.creditCards || []).filter(c => c.id !== id) });
    showToast('Card deleted');
  };

  const handleLogCardPayment = (cardId: string, amount: number) => {
    const updatedCards = (userData.creditCards || []).map(c => 
      c.id === cardId ? { ...c, paymentsMade: c.paymentsMade + amount } : c
    );
    
    const targetCard = (userData.creditCards || []).find(c => c.id === cardId);
    const exp: Expense = {
      id: Date.now().toString() + 'pay',
      category: 'Other',
      amount,
      date: new Date().toISOString().split('T')[0],
      description: `Payment to ${targetCard?.cardName || 'Credit Card'}`,
      paymentMethod: 'Bank Transfer'
    };

    updateData({ creditCards: updatedCards, expenses: [exp, ...(userData.expenses || [])] });
    showToast(`Logged payment of ${currencySymbol}${amount.toFixed(2)}`);
  };

  // Invoice / Receipt Actions
  const handleSaveInvoice = (inv: Invoice) => {
    const existing = userData.invoices || [];
    const exists = existing.some(i => i.id === inv.id);
    const updated = exists
      ? existing.map(i => i.id === inv.id ? inv : i)
      : [inv, ...existing];
    
    updateData({ invoices: updated });
    showToast(`Invoice from ${inv.vendor} saved`);
  };

  const handleDeleteInvoice = (id: string) => {
    try {
      localStorage.removeItem(`invoice_file_${id}`);
    } catch {}
    updateData({ invoices: (userData.invoices || []).filter(i => i.id !== id) });
    showToast('Invoice removed');
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsParsingReceipt(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const invoiceId = Date.now().toString();
        try {
          localStorage.setItem(`invoice_file_${invoiceId}`, base64);
        } catch {}

        const formData = new FormData();
        formData.append('receipt', file);
        
        const response = await fetch('/api/parse-receipt', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to parse receipt');
        }
        
        const data = await response.json();
        
        const newInvoice: Invoice = {
          id: invoiceId,
          vendor: data.merchant || file.name.split('.')[0] || 'Unknown Merchant',
          date: data.date || new Date().toISOString().split('T')[0],
          amount: data.amount || 0,
          fileType: file.type,
          category: data.category || 'Food'
        };
        
        const newExp: Expense = {
          id: Date.now().toString() + 'exp',
          category: data.category || 'Food',
          amount: data.amount || 0,
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.merchant || 'Auto-parsed receipt'
        };
        
        updateData({ 
          invoices: [newInvoice, ...(userData.invoices || [])],
          expenses: [newExp, ...(userData.expenses || [])]
        });
        
        showToast(`Parsed receipt! Logged ${currencySymbol}${newExp.amount.toFixed(2)} at ${newExp.description}`);
        setIsParsingReceipt(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Error parsing receipt: ' + err.message);
      setIsParsingReceipt(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openInvoice = (id: string) => {
    try {
      const dataUrl = localStorage.getItem(`invoice_file_${id}`);
      if (dataUrl) {
        const win = window.open();
        if (win) {
          win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
      } else {
        showToast('Receipt file preview not stored in local cache');
      }
    } catch {
      showToast('Unable to open receipt preview');
    }
  };

  // Settlement Email / Share
  const handleSettleUpEmail = async (peerName: string, amountOwed: number) => {
    const peerContact = peers.find(p => p.name.toLowerCase() === peerName.toLowerCase());
    const emailTo = prompt(`Enter ${peerName}'s email address to send settlement request:`, peerContact?.email || `${peerName.toLowerCase()}@example.com`);
    if (!emailTo) return;
    
    setIsSendingEmail(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        showToast('Please sign in to Google to send emails via Gmail API.');
        setIsSendingEmail(false);
        return;
      }
      
      const subject = `Settle Up Request: ${currencySymbol}${amountOwed.toFixed(2)}`;
      const paymentLinkText = peerContact?.paymentHandle ? `\nPayment Handle / Link: ${peerContact.paymentHandle}` : '';
      const bodyText = `Hi ${peerName},\n\nHope you're well! Just a quick settlement reminder for shared expenses.\nThe outstanding balance is ${currencySymbol}${amountOwed.toFixed(2)}.${paymentLinkText}\n\nThanks!\nSent via manageme Financial Hub`;
      
      const email = [
        `To: ${emailTo}`,
        `Subject: ${subject}`,
        '',
        bodyText
      ].join('\r\n');
      
      const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
        
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });
      
      if (!res.ok) throw new Error('Gmail API send failed');
      showToast(`Settlement email sent to ${emailTo}!`);
    } catch (e) {
      console.error(e);
      showToast('Failed to send email. Please verify Google authentication.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Filtered lists
  const filteredShifts = useMemo(() => {
    const all = userData.workShifts || [];
    if (!shiftSearchQuery.trim()) return all;
    const q = shiftSearchQuery.toLowerCase();
    return all.filter(s => 
      s.date.includes(q) || 
      (s.roleTitle && s.roleTitle.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
  }, [userData.workShifts, shiftSearchQuery]);

  const filteredExpenses = useMemo(() => {
    const all = userData.expenses || [];
    return all.filter(e => {
      if (selectedExpenseCatFilter !== 'ALL' && e.category !== selectedExpenseCatFilter) {
        return false;
      }
      if (expenseSearchQuery.trim()) {
        const q = expenseSearchQuery.toLowerCase();
        return (
          (e.description && e.description.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q) ||
          (e.splitWith && e.splitWith.toLowerCase().includes(q)) ||
          e.date.includes(q)
        );
      }
      return true;
    });
  }, [userData.expenses, selectedExpenseCatFilter, expenseSearchQuery]);

  // Peer balance calculations
  const peerBalances = useMemo(() => {
    const map: Record<string, { owedToMe: number; items: Expense[] }> = {};
    (userData.expenses || []).forEach(exp => {
      if (exp.splitWith && exp.owedToMe && !exp.settled) {
        if (!map[exp.splitWith]) map[exp.splitWith] = { owedToMe: 0, items: [] };
        map[exp.splitWith].owedToMe += exp.owedToMe;
        map[exp.splitWith].items.push(exp);
      }
    });
    return map;
  }, [userData.expenses]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Top Header & Customization Hub Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="apple-headline text-2xl text-[var(--text-primary)]">Financial & Job Hub</h2>
            <span className="text-[10px] bg-[var(--accent)]/15 text-[var(--accent)] font-mono font-bold px-2 py-0.5 rounded-full border border-[var(--accent)]/30">
              CUSTOMIZABLE
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time shift wage calculator, visa regulations, category budgeting & debt manager
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hourly Rate Quick Edit */}
          <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] rounded-2xl px-3.5 py-1.5 border border-[var(--border)]">
            <DollarSign className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs text-[var(--text-secondary)]">Base Wage:</span>
            <div className="flex items-center text-[var(--text-primary)] font-bold text-xs font-mono">
              <span>{currencySymbol}</span>
              <input 
                type="number"
                value={userData.hourlyRate || 0}
                onChange={(e) => updateData({ hourlyRate: Number(e.target.value) })}
                className="bg-transparent border-none outline-none w-14 focus:ring-0 text-right p-0 font-mono"
                step="0.1"
              />
              <span className="text-[10px] text-[var(--text-secondary)] font-normal ml-0.5">/hr</span>
            </div>
          </div>

          {/* Hub Customizer Button */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 bg-[var(--surface-solid)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] px-3.5 py-2 rounded-2xl transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Customize Hub</span>
          </button>
        </div>
      </div>

      {/* Global Financial Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Earned */}
        <div className="p-4 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Gross Wages</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-emerald-400 font-mono tracking-tighter tabular-nums">
              {currencySymbol}{totalEarnedGross.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              {totalHours.toFixed(1)} hrs logged • {userData.workShifts?.length || 0} shifts
            </span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-4 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Total Expenses</span>
            <div className="p-1.5 rounded-xl bg-red-500/10 text-red-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-red-400 font-mono tracking-tighter tabular-nums">
              {currencySymbol}{totalExpenses.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              {userData.expenses?.length || 0} transactions
            </span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="p-4 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Net Position</span>
            <div className={`p-1.5 rounded-xl ${netSavings >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold font-mono tracking-tighter tabular-nums ${netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netSavings >= 0 ? '+' : ''}{currencySymbol}{netSavings.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              {hubPrefs.showTaxDeduction ? `After ${hubPrefs.taxRatePct}% tax` : 'Gross savings'}
            </span>
          </div>
        </div>

        {/* Monthly Target Goal */}
        <div className="p-4 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Monthly Goal</span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-bold text-blue-400 font-mono">
                {targetProgressPct}%
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                Goal: {currencySymbol}{targetEarnings}
              </span>
            </div>
            <div className="w-full bg-[var(--surface-solid)] rounded-full h-1.5 mt-1.5 overflow-hidden border border-[var(--border)]">
              <div 
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${targetProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MODULE 1: Job Schedule & Shift Logger */}
        {hubPrefs.visibleModules.jobSchedule && (
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border)] flex flex-col h-full space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Job Schedule</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Work shifts, overtime rates & wage ledger</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Batch Shifts Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isBatchShiftMode) {
                      setIsBatchShiftMode(false);
                      setSelectedShiftIds([]);
                    } else {
                      setIsBatchShiftMode(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isBatchShiftMode || selectedShiftIds.length > 0
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'bg-[var(--surface-solid)] hover:bg-[rgba(255,255,255,0.08)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Toggle Batch Shifts Selection"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isBatchShiftMode ? 'Exit Batch' : 'Batch Edit'}</span>
                  {selectedShiftIds.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                      {selectedShiftIds.length}
                    </span>
                  )}
                </button>

                {/* Visa Limit Toggle */}
                {hubPrefs.visibleModules.visaCap && (
                  <div className="flex items-center gap-2 bg-[var(--surface-solid)] px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs">
                    <span className="text-[var(--text-secondary)]">Term-Time:</span>
                    <button
                      onClick={() => {
                        const next = !isTermTime;
                        setIsTermTime(next);
                        updateData({ termStatus: next ? 'Term Time' : 'Vacation' });
                        showToast(`Work mode switched to ${next ? 'Term Time (Visa Cap Active)' : 'Vacation (No Hour Limit)'}`);
                      }}
                      className={`w-8 h-4.5 rounded-full transition-colors relative ${isTermTime ? 'bg-blue-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${isTermTime ? 'left-4' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Floating / Sticky Batch Actions Bar for Shifts */}
            {(isBatchShiftMode || selectedShiftIds.length > 0) && (
              <div className="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-blue-500/40 shadow-lg shadow-blue-500/5 transition-all flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectAllShifts(filteredShifts)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold text-xs hover:bg-blue-500/25 transition-colors"
                  >
                    {selectedShiftIds.length === filteredShifts.length && filteredShifts.length > 0 ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {selectedShiftIds.length === filteredShifts.length && filteredShifts.length > 0
                        ? 'Deselect All'
                        : `Select All (${filteredShifts.length})`}
                    </span>
                  </button>

                  <span className="text-xs text-[var(--text-secondary)] font-mono">
                    <span className="text-white font-bold">{selectedShiftIds.length}</span> selected
                  </span>

                  {/* Bulk Set Rate Multiplier */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Rate:</span>
                    <select
                      disabled={selectedShiftIds.length === 0}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkUpdateShiftRateMultiplier(Number(e.target.value));
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="px-2 py-1 bg-[var(--surface-solid)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer focus:outline-none"
                    >
                      <option value="" disabled>Set Mult...</option>
                      <option value="1.0">1.0x (Base)</option>
                      <option value="1.25">1.25x (+25%)</option>
                      <option value="1.5">1.5x (+50%)</option>
                      <option value="2.0">2.0x (Double)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={selectedShiftIds.length === 0}
                    onClick={handleBulkDeleteShifts}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-semibold text-xs hover:bg-red-500 hover:text-white disabled:opacity-40 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedShiftIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShiftIds([]);
                      setIsBatchShiftMode(false);
                    }}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    title="Exit Batch Mode"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Visa Cap Progress Widget */}
            {hubPrefs.visibleModules.visaCap && (
              <div className="bg-[var(--surface-solid)] border border-[var(--border)] rounded-2xl p-4 space-y-2 relative">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">
                    Visa Work-Cap ({hubPrefs.visaWindowMode === 'calendarMon' ? 'Mon-Sun Week' : hubPrefs.visaWindowMode === 'calendarSun' ? 'Sun-Sat Week' : 'Rolling 7 Days'})
                  </span>
                  <span className="font-bold font-mono text-[var(--text-primary)]">
                    {visaHours.toFixed(1)} / {isTermTime ? `${limit} hrs` : 'No Limit (Vacation)'}
                  </span>
                </div>

                <div className="w-full bg-[var(--surface-solid)] rounded-full h-2.5 overflow-hidden border border-[var(--border)]">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${isVisaExceeded ? 'bg-red-500' : isVisaWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${isTermTime ? visaUsagePercent : Math.min(100, (visaHours / 40) * 100)}%` }}
                  />
                </div>

                {isVisaExceeded && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Visa limit exceeded! You have logged more than {limit} hours this period.</span>
                  </div>
                )}

                {isVisaWarning && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Warning: Approaching {limit}-hour limit. Avoid booking additional shifts.</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Shift Presets Bar */}
            {hubPrefs.shiftPresets && hubPrefs.shiftPresets.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-[var(--text-secondary)] font-semibold">
                  <span>Quick 1-Click Presets:</span>
                  <button
                    onClick={() => setIsCustomizerOpen(true)}
                    className="text-[var(--accent)] hover:underline"
                  >
                    Edit Presets
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {hubPrefs.shiftPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1 rounded-xl bg-[var(--surface-solid)] hover:bg-blue-500/15 text-xs text-[var(--text-secondary)] hover:text-blue-300 border border-[var(--border)] transition-all flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span>{preset.label}</span>
                      <span className="font-mono text-[10px] opacity-70">({preset.hours}h)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shift Input Form */}
            <div className="space-y-3 bg-[var(--surface-solid)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">Shift Date</label>
                  <input 
                    type="date" 
                    value={newShift.date} 
                    onChange={e => setNewShift({ ...newShift, date: e.target.value })} 
                    className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-medium" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">Role / Employer</label>
                  <input 
                    type="text" 
                    placeholder="e.g. University Library" 
                    value={newShift.roleTitle} 
                    onChange={e => setNewShift({ ...newShift, roleTitle: e.target.value })} 
                    className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">Start</label>
                  <input 
                    type="time" 
                    value={newShift.startTime} 
                    onChange={e => setNewShift({ ...newShift, startTime: e.target.value })} 
                    className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full text-center" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">End</label>
                  <input 
                    type="time" 
                    value={newShift.endTime} 
                    onChange={e => setNewShift({ ...newShift, endTime: e.target.value })} 
                    className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full text-center" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">Hours</label>
                  <input 
                    type="number" 
                    step="0.25"
                    value={newShift.hours || ''} 
                    onChange={e => setNewShift({ ...newShift, hours: Number(e.target.value) })} 
                    className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full text-center font-bold text-blue-400 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">Rate Mult</label>
                  <select
                    value={newShift.rateMultiplier}
                    onChange={e => setNewShift({ ...newShift, rateMultiplier: Number(e.target.value) })}
                    className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full font-medium"
                  >
                    <option value={1.0}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2.0}>2.0x</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--text-secondary)]">
                  Est. Payout: <strong className="text-emerald-400 font-mono">{currencySymbol}{((newShift.hours || 0) * (userData.hourlyRate || 0) * (newShift.rateMultiplier || 1)).toFixed(2)}</strong>
                </span>
                <button 
                  onClick={handleAddShift} 
                  className="bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-xl text-xs px-5 py-2 hover:opacity-90 transition-opacity flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Shift
                </button>
              </div>
            </div>

            {/* Shifts Search & List */}
            <div className="flex-1 flex flex-col min-h-[220px] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search shifts by employer or date..."
                    value={shiftSearchQuery}
                    onChange={e => setShiftSearchQuery(e.target.value)}
                    className="apple-input bg-[var(--surface-solid)] pl-8 text-xs p-2 w-full"
                  />
                </div>
                <span className="text-[11px] font-mono text-[var(--text-secondary)] shrink-0">
                  {filteredShifts.length} shifts
                </span>
              </div>

              {filteredShifts.length === 0 ? (
                <div className="h-36 flex flex-col items-center justify-center text-[var(--text-secondary)] text-xs italic bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] p-4 text-center">
                  No work shifts match your filter. Log a shift above.
                </div>
              ) : (
                <div className="flex-1">
                  <List
                    style={{ height: Math.min(280, Math.max(120, filteredShifts.length * 72)), width: '100%' }}
                    rowCount={filteredShifts.length}
                    rowHeight={72}
                    rowComponent={ShiftRowItem}
                    rowProps={{
                      shifts: filteredShifts,
                      hourlyRate: userData.hourlyRate || 0,
                      currencySymbol,
                      onEditShift: (shift) => setEditingShift(shift),
                      onDuplicateShift: handleDuplicateShift,
                      onDeleteShift: handleDeleteShift,
                      selectedShiftIds,
                      isBatchMode: isBatchShiftMode,
                      onToggleSelectShift: handleToggleSelectShift
                    }}
                    className="custom-scrollbar"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE 2: Expense Tracker & Category Budgets */}
        {hubPrefs.visibleModules.expenses && (
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border)] flex flex-col h-full space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Expense Tracker</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Custom categories, bill splitting & live budgets</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Batch Expense Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isBatchExpenseMode) {
                      setIsBatchExpenseMode(false);
                      setSelectedExpenseIds([]);
                    } else {
                      setIsBatchExpenseMode(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isBatchExpenseMode || selectedExpenseIds.length > 0
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      : 'bg-[var(--surface-solid)] hover:bg-[rgba(255,255,255,0.08)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Toggle Batch Expense Selection"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isBatchExpenseMode ? 'Exit Batch' : 'Batch Edit'}</span>
                  {selectedExpenseIds.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      {selectedExpenseIds.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[var(--surface-solid)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-xl transition-all"
                >
                  <Tag className="w-3.5 h-3.5 text-orange-400" />
                  <span>Categories</span>
                </button>
              </div>
            </div>

            {/* Floating / Sticky Batch Actions Bar for Expenses */}
            {(isBatchExpenseMode || selectedExpenseIds.length > 0) && (
              <div className="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-emerald-500/40 shadow-lg shadow-emerald-500/5 transition-all flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectAllExpenses(filteredExpenses)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/25 transition-colors"
                  >
                    {selectedExpenseIds.length === filteredExpenses.length && filteredExpenses.length > 0 ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {selectedExpenseIds.length === filteredExpenses.length && filteredExpenses.length > 0
                        ? 'Deselect All'
                        : `Select All (${filteredExpenses.length})`}
                    </span>
                  </button>

                  <span className="text-xs text-[var(--text-secondary)] font-mono">
                    <span className="text-white font-bold">{selectedExpenseIds.length}</span> selected
                  </span>

                  {/* Bulk Set Category */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Category:</span>
                    <select
                      disabled={selectedExpenseIds.length === 0}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkUpdateExpenseCategory(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="px-2 py-1 bg-[var(--surface-solid)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer focus:outline-none"
                    >
                      <option value="" disabled>Move to...</option>
                      {categories.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bulk Set Payment Method */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Payment:</span>
                    <select
                      disabled={selectedExpenseIds.length === 0}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkUpdateExpensePaymentMethod(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="px-2 py-1 bg-[var(--surface-solid)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer focus:outline-none"
                    >
                      <option value="" disabled>Set Method...</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Apple Pay / Google Pay">Apple / Google Pay</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={selectedExpenseIds.length === 0}
                    onClick={handleBulkDeleteExpenses}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-semibold text-xs hover:bg-red-500 hover:text-white disabled:opacity-40 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedExpenseIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExpenseIds([]);
                      setIsBatchExpenseMode(false);
                    }}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    title="Exit Batch Mode"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Category Budgets Mini Progress Bar (if enabled) */}
            {hubPrefs.visibleModules.categoryBudgets && (
              <div className="bg-[var(--surface-solid)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                    Category Budgets Health
                  </span>
                  <button 
                    onClick={() => setIsCategoriesModalOpen(true)} 
                    className="text-[10px] text-[var(--accent)] hover:underline"
                  >
                    Adjust Limits
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.filter(c => c.monthlyBudget && c.monthlyBudget > 0).map(cat => {
                    const spent = (userData.expenses || [])
                      .filter(e => e.category === cat.name)
                      .reduce((sum, e) => sum + e.amount, 0);
                    const pct = Math.min(100, Math.round((spent / (cat.monthlyBudget || 1)) * 100));
                    const isOver = spent > (cat.monthlyBudget || 0);

                    return (
                      <div key={cat.name} className="p-2 rounded-xl bg-[var(--surface-solid)] border border-[var(--border)] space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-[var(--text-primary)] truncate">{cat.name}</span>
                          <span className={`font-mono font-bold ${isOver ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full bg-[var(--surface-solid)] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${pct}%`, 
                              backgroundColor: isOver ? '#ef4444' : cat.color || '#10b981' 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-[var(--text-secondary)] font-mono">
                          <span>{currencySymbol}{spent.toFixed(0)}</span>
                          <span>/ {currencySymbol}{cat.monthlyBudget}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expense Input Form */}
            <div className="space-y-3 bg-[var(--surface-solid)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select 
                  value={newExpense.category} 
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} 
                  className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-medium"
                >
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Amount" 
                    value={newExpense.amount} 
                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} 
                    className="apple-input bg-[var(--surface-solid)] pl-7 text-xs p-2.5 w-full font-bold text-red-400 font-mono" 
                  />
                </div>

                <input 
                  type="date" 
                  value={newExpense.date} 
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} 
                  className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-medium" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Vendor / Description (e.g. Tesco, Pret, Uber)"
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full"
                />
                <select
                  value={newExpense.paymentMethod}
                  onChange={e => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                  className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full"
                >
                  <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Apple Pay / Google Pay">Apple / Google Pay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Split with Peer Drawer */}
              {newExpense.isSplit && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[var(--surface-solid)] p-3 rounded-xl border border-dashed border-[var(--border)]">
                  <input 
                    type="text" 
                    list="peers-datalist"
                    placeholder="Peer Name (e.g. Alex)" 
                    value={newExpense.peerName} 
                    onChange={e => setNewExpense({ ...newExpense, peerName: e.target.value })} 
                    className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full" 
                  />
                  <datalist id="peers-datalist">
                    {peers.map(p => (
                      <option key={p.name} value={p.name} />
                    ))}
                  </datalist>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-secondary)] whitespace-nowrap">My Share %</span>
                    <input 
                      type="number" 
                      min="1"
                      max="99"
                      value={newExpense.splitRatio} 
                      onChange={e => setNewExpense({ ...newExpense, splitRatio: e.target.value })} 
                      className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full text-center font-mono" 
                    />
                  </div>

                  {newExpense.amount && (
                    <div className="col-span-1 sm:col-span-2 flex justify-between text-xs text-[var(--text-secondary)] font-mono px-1">
                      <span>My Cost: {currencySymbol}{(Number(newExpense.amount) * (Number(newExpense.splitRatio)/100)).toFixed(2)}</span>
                      <span className="text-emerald-400 font-semibold">Owed to me: {currencySymbol}{(Number(newExpense.amount) * ((100 - Number(newExpense.splitRatio))/100)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div 
                    className={`w-9 h-5 rounded-full transition-colors relative ${newExpense.isSplit ? 'bg-emerald-500' : 'bg-zinc-700'}`} 
                    onClick={() => setNewExpense({ ...newExpense, isSplit: !newExpense.isSplit })}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${newExpense.isSplit ? 'left-4' : 'left-0.5'}`}></div>
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Split with peer</span>
                </label>

                <button 
                  onClick={handleAddExpense} 
                  className="bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-xl text-xs px-6 py-2 hover:opacity-90 transition-opacity flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Expense
                </button>
              </div>
            </div>

            {/* Expenses List & Category Filter Tabs */}
            <div className="flex-1 flex flex-col min-h-[220px] space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Search expenses by vendor or note..."
                    value={expenseSearchQuery}
                    onChange={e => setExpenseSearchQuery(e.target.value)}
                    className="apple-input bg-[var(--surface-solid)] pl-8 text-xs p-2 w-full"
                  />
                </div>
                <select
                  value={selectedExpenseCatFilter}
                  onChange={e => setSelectedExpenseCatFilter(e.target.value)}
                  className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-32 shrink-0 font-medium"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {filteredExpenses.length === 0 ? (
                <AppleEmptyState
                  icon={Receipt}
                  title="No Expenses Logged"
                  description={userData.expenses?.length === 0 ? "Log your student budget, food, transport, and prep materials with multi-currency support." : "No expenses match your active search or category filter."}
                  actionLabel="+ Log Expense"
                  onAction={() => {
                    setEditingExpense({
                      id: '',
                      category: 'Food',
                      amount: 0,
                      date: new Date().toISOString().split('T')[0],
                      description: ''
                    } as Expense);
                  }}
                  className="py-8 bg-transparent border-dashed"
                />
              ) : (
                <div className="flex-1">
                  <List
                    style={{ height: Math.min(280, Math.max(120, filteredExpenses.length * 74)), width: '100%' }}
                    rowCount={filteredExpenses.length}
                    rowHeight={74}
                    rowComponent={ExpenseRowItem}
                    rowProps={{
                      expenses: filteredExpenses,
                      categories,
                      currencySymbol,
                      onEditExpense: (exp) => setEditingExpense(exp),
                      onDeleteExpense: handleDeleteExpense,
                      selectedExpenseIds,
                      isBatchMode: isBatchExpenseMode,
                      onToggleSelectExpense: handleToggleSelectExpense
                    }}
                    className="custom-scrollbar"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE 3: Credit Cards & Invoices / AI Receipts */}
        {hubPrefs.visibleModules.creditCards && (
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border)] flex flex-col h-full lg:col-span-1 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400">
                  <CardIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Credit Cards & Receipts</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Statement balances, due dates & invoice parser</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingCard(null);
                  setIsCardModalOpen(true);
                }}
                className="flex items-center gap-1 bg-[var(--surface-solid)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-xs font-semibold text-purple-300 px-3 py-1.5 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Credit Cards Column */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Active Cards ({(userData.creditCards || []).length})
                </h4>

                {(!userData.creditCards || userData.creditCards.length === 0) ? (
                  <AppleEmptyState
                    icon={CardIcon}
                    title="No Credit Cards Added"
                    description="Track student credit cards, statement dates, and interest-free periods."
                    actionLabel="+ Add Credit Card"
                    onAction={() => {
                      setEditingCard(null);
                      setIsCardModalOpen(true);
                    }}
                    className="py-6 bg-[var(--surface-solid)]/30 border-dashed"
                  />
                ) : (
                  <div className="space-y-3">
                    {userData.creditCards.map(card => {
                      const remaining = card.statementBalance - card.paymentsMade;
                      return (
                        <div key={card.id} className="p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)] flex flex-col gap-2.5 group hover:border-[var(--border)]/80 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                                  <CardIcon className="w-3.5 h-3.5 text-purple-400" />
                                  {card.cardName}
                                </h4>
                                <button
                                  onClick={() => {
                                    setEditingCard(card);
                                    setIsCardModalOpen(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-secondary)] hover:text-purple-400 transition-opacity"
                                  title="Edit Card Details"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                Due: {new Date(card.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                {card.creditLimit ? ` • ${currencySymbol}${card.creditLimit} limit` : ''}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="block text-xs font-bold text-red-400 font-mono">
                                {currencySymbol}{remaining.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-[var(--text-secondary)]">Remaining</span>
                            </div>
                          </div>

                          {/* Quick Payment Row */}
                          {remaining > 0 && (
                            <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]/50">
                              <div className="relative flex-1">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-[10px]">{currencySymbol}</span>
                                <input 
                                  type="number" 
                                  id={`pay-${card.id}`} 
                                  placeholder="Amount" 
                                  className="apple-input bg-[var(--surface-solid)] pl-6 text-xs py-1.5 w-full font-mono" 
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  const input = document.getElementById(`pay-${card.id}`) as HTMLInputElement;
                                  const amt = Number(input.value);
                                  if (amt > 0) {
                                    handleLogCardPayment(card.id, amt);
                                    input.value = '';
                                  }
                                }}
                                className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-emerald-500/30 transition-colors"
                              >
                                Pay
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Invoices & Receipt Scanner Column */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Invoices & Receipts
                  </h4>
                  <button
                    onClick={() => {
                      setEditingInvoice(null);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="text-[10px] text-blue-400 hover:underline font-semibold"
                  >
                    + Manual Entry
                  </button>
                </div>

                {/* AI Scanner Dropzone */}
                <div 
                  className="border-2 border-dashed border-[var(--border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer relative overflow-hidden" 
                  onClick={() => !isParsingReceipt && fileInputRef.current?.click()}
                >
                  {isParsingReceipt ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                      <p className="text-xs font-semibold text-[var(--text-primary)]">Gemini is parsing receipt...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                        <Bot className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">AI Receipt Scanner</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Upload image/PDF to auto-extract & log</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleReceiptUpload} disabled={isParsingReceipt} />
                </div>

                {/* Invoices List */}
                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {(userData.invoices || []).map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)] group">
                      <div className="flex items-center gap-2.5 cursor-pointer truncate flex-1 mr-2" onClick={() => openInvoice(invoice.id)}>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                          <Receipt className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate">{invoice.vendor}</h4>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            {new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {currencySymbol}{invoice.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setEditingInvoice(invoice);
                            setIsInvoiceModalOpen(true);
                          }} 
                          className="p-1 text-[var(--text-secondary)] hover:text-blue-400 rounded-lg transition-colors"
                          title="Edit Invoice Metadata"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => openInvoice(invoice.id)} 
                          className="p-1 text-[var(--text-secondary)] hover:text-emerald-400 rounded-lg transition-colors"
                          title="View / Download"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.id)} 
                          className="p-1 text-[var(--text-secondary)] hover:text-red-400 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: Peer Settlement Ledger */}
        {hubPrefs.visibleModules.settlements && (
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border)] flex flex-col h-full lg:col-span-1 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[var(--text-primary)]">Settlement Ledger</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Peer splits, payment links & settle emails</p>
                </div>
              </div>

              <button
                onClick={() => setIsPeersModalOpen(true)}
                className="flex items-center gap-1.5 bg-[var(--surface-solid)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-xs font-semibold text-emerald-300 px-3 py-1.5 rounded-xl transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Peer Directory</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 max-h-[320px]">
              {Object.keys(peerBalances).length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-secondary)] italic bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)]">
                  All peer balances are fully settled! Log an expense with peer split to track owed balances.
                </div>
              ) : (
                Object.keys(peerBalances).map(peer => {
                  const data = peerBalances[peer];
                  const peerContact = peers.find(p => p.name.toLowerCase() === peer.toLowerCase());

                  return (
                    <div key={peer} className="p-4 bg-[var(--surface-solid)] border border-[var(--border)] rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-bold text-xs text-[var(--text-primary)] block">{peer}</span>
                            {peerContact?.paymentHandle && (
                              <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                                {peerContact.paymentHandle}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold text-sm font-mono block">
                            +{currencySymbol}{data.owedToMe.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-[var(--text-secondary)]">Owes You</span>
                        </div>
                      </div>

                      {/* Items itemized breakdown */}
                      <div className="bg-[var(--surface-solid)] p-2.5 rounded-xl text-[11px] text-[var(--text-secondary)] space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {data.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="truncate mr-2">{item.description || item.category} ({new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})</span>
                            <span className="font-mono text-emerald-400 font-medium">+{currencySymbol}{item.owedToMe?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => {
                            const updatedExpenses = (userData.expenses || []).map(exp => {
                              if (exp.splitWith === peer && !exp.settled) return { ...exp, settled: true };
                              return exp;
                            });
                            updateData({ expenses: updatedExpenses });
                            showToast(`Balances with ${peer} marked as fully settled!`);
                          }}
                          className="bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settle
                        </button>

                        <button 
                          onClick={() => handleSettleUpEmail(peer, data.owedToMe)}
                          disabled={isSendingEmail}
                          className="border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold py-2 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all flex items-center justify-center gap-1"
                          title="Send Settle Email via Gmail API"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          Email
                        </button>

                        <button 
                          onClick={() => {
                            const handleText = peerContact?.paymentHandle ? `\nPayment link: ${peerContact.paymentHandle}` : '';
                            const text = `Hi ${peer}, here is our expense settlement summary:\nTotal Owed: ${currencySymbol}${data.owedToMe.toFixed(2)}${handleText}\n\nItemized:\n` + 
                              data.items.map(i => `- ${i.description || i.category}: ${currencySymbol}${i.amount.toFixed(2)} (Your share: ${currencySymbol}${i.owedToMe?.toFixed(2)})`).join('\n');
                            navigator.clipboard.writeText(text);
                            showToast('Settlement breakdown copied to clipboard!');
                          }}
                          className="border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold py-2 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all flex items-center justify-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5 text-purple-400" />
                          Share
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Schedule Conflict Modal */}
      {conflictWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--surface-solid)] border border-[var(--border)] rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">University Schedule Conflict</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{conflictWarning}</p>
            </div>
            <button 
              onClick={() => setConflictWarning(null)}
              className="w-full py-2.5 bg-[var(--text-primary)] text-[var(--bg)] font-semibold rounded-xl text-xs hover:opacity-90 transition-opacity"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Subscriptions & Vehicle Cost Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hubPrefs.visibleModules.subscriptions && <SubscriptionManager />}
        {hubPrefs.visibleModules.vehicleCost && <VehicleCostCalculator />}
      </div>

      {/* Specialized Modals */}
      <EditShiftModal
        isOpen={!!editingShift}
        shift={editingShift}
        onClose={() => setEditingShift(null)}
        onSave={handleSaveEditedShift}
        onDelete={handleDeleteShift}
        onDuplicate={handleDuplicateShift}
        baseHourlyRate={userData.hourlyRate || 0}
        currencySymbol={currencySymbol}
      />

      <EditExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={handleSaveEditedExpense}
        onDelete={handleDeleteExpense}
        categories={categories.map(c => c.name)}
        peers={peers.map(p => p.name)}
        currencySymbol={currencySymbol}
      />

      <EditCreditCardModal
        isOpen={isCardModalOpen}
        card={editingCard}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCreditCard}
        onDelete={handleDeleteCreditCard}
        currencySymbol={currencySymbol}
      />

      <EditInvoiceModal
        isOpen={isInvoiceModalOpen}
        invoice={editingInvoice}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={handleSaveInvoice}
        onDelete={handleDeleteInvoice}
        categories={categories.map(c => c.name)}
        currencySymbol={currencySymbol}
      />

      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        onSaveCategories={(updated) => {
          setCategories(updated);
          showToast('Expense categories and monthly budgets updated');
        }}
        currencySymbol={currencySymbol}
      />

      <ManagePeersModal
        isOpen={isPeersModalOpen}
        onClose={() => setIsPeersModalOpen(false)}
        peers={peers}
        onSavePeers={(updated) => {
          setPeers(updated);
          showToast('Peer contact directory updated');
        }}
      />

      <HubCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        preferences={hubPrefs}
        onSavePreferences={(updated) => {
          setHubPrefs(updated);
          if (updated.currency && updated.currency !== userData.currency) {
            updateData({ currency: updated.currency as any });
          }
          if (updated.visaLimit && updated.visaLimit !== userData.visaLimit) {
            updateData({ visaLimit: updated.visaLimit });
          }
          showToast('Financial & Job Hub preferences saved');
        }}
      />

    </div>
  );
};
