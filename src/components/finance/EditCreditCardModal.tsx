import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, DollarSign, Calendar, Percent, ShieldCheck, Check, Trash2, Palette } from 'lucide-react';
import { CreditCard } from '../../types';

interface Props {
  card: CreditCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: CreditCard) => void;
  onDelete?: (id: string) => void;
  currencySymbol: string;
}

const CARD_THEMES = [
  { id: 'purple', name: 'Royal Purple', bg: 'from-purple-900/60 to-indigo-950/80', border: 'border-purple-500/40', text: 'text-purple-300' },
  { id: 'onyx', name: 'Midnight Onyx', bg: 'from-zinc-900 to-black', border: 'border-zinc-700/50', text: 'text-zinc-300' },
  { id: 'emerald', name: 'Emerald Platinum', bg: 'from-emerald-950/80 to-teal-950/90', border: 'border-emerald-500/40', text: 'text-emerald-300' },
  { id: 'blue', name: 'Sapphire Blue', bg: 'from-blue-950/80 to-cyan-950/90', border: 'border-blue-500/40', text: 'text-blue-300' },
  { id: 'gold', name: 'Rose Gold', bg: 'from-amber-950/80 to-rose-950/80', border: 'border-amber-500/40', text: 'text-amber-300' },
];

export const EditCreditCardModal: React.FC<Props> = ({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete,
  currencySymbol
}) => {
  const [formData, setFormData] = useState<Partial<CreditCard>>({});

  useEffect(() => {
    if (card) {
      setFormData({ ...card, colorTheme: card.colorTheme || 'purple' });
    } else {
      setFormData({
        id: Date.now().toString(),
        cardName: '',
        statementBalance: 0,
        paymentsMade: 0,
        dueDate: new Date().toISOString().split('T')[0],
        creditLimit: 1200,
        apr: 24.9,
        colorTheme: 'purple'
      });
    }
  }, [card]);

  if (!isOpen) return null;

  const isEditing = !!card?.cardName;
  const currentTheme = CARD_THEMES.find(t => t.id === formData.colorTheme) || CARD_THEMES[0];
  const remainingBalance = (formData.statementBalance || 0) - (formData.paymentsMade || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardName || formData.statementBalance === undefined || !formData.dueDate) {
      alert('Please fill in Card Name, Statement Balance, and Due Date');
      return;
    }

    onSave({
      id: formData.id || Date.now().toString(),
      cardName: formData.cardName,
      statementBalance: Number(formData.statementBalance),
      paymentsMade: Number(formData.paymentsMade || 0),
      dueDate: formData.dueDate,
      creditLimit: formData.creditLimit ? Number(formData.creditLimit) : undefined,
      apr: formData.apr ? Number(formData.apr) : undefined,
      minPayment: formData.minPayment ? Number(formData.minPayment) : undefined,
      statementCloseDate: formData.statementCloseDate || undefined,
      colorTheme: formData.colorTheme || 'purple',
      notes: formData.notes || ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[var(--surface-solid)] border border-[var(--border)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? 'Edit Credit Card' : 'Add New Credit Card'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Manage balance, credit limit, APR & payment due date</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentTheme.bg} border ${currentTheme.border} relative shadow-lg text-white space-y-3`}>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest font-mono text-white/70">CREDIT LEDGER</span>
            <CardIcon className="w-5 h-5 text-white/80" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h4 className="font-bold text-lg tracking-tight">{formData.cardName || 'Card Name'}</h4>
              <p className="text-[11px] text-white/60">Due {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Select Date'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/60 block">Remaining Balance</span>
              <span className="text-xl font-mono font-extrabold text-white">
                {currencySymbol}{remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {/* Card Name & Color Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Card Name / Issuer *
              </label>
              <input
                type="text"
                placeholder="e.g. Amex Gold, Barclaycard, Chase"
                value={formData.cardName || ''}
                onChange={e => setFormData({ ...formData, cardName: e.target.value })}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Card Visual Theme
              </label>
              <select
                value={formData.colorTheme || 'purple'}
                onChange={e => setFormData({ ...formData, colorTheme: e.target.value })}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full"
              >
                {CARD_THEMES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Statement Balance & Payments Made */}
          <div className="grid grid-cols-2 gap-3 bg-[#141416] p-3.5 rounded-2xl border border-[var(--border)]">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Statement Balance *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.statementBalance ?? ''}
                  onChange={e => setFormData({ ...formData, statementBalance: Number(e.target.value) })}
                  className="apple-input bg-[var(--surface-solid)] pl-7 text-xs p-2 w-full font-mono text-red-400 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Payments Logged
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.paymentsMade ?? ''}
                  onChange={e => setFormData({ ...formData, paymentsMade: Number(e.target.value) })}
                  className="apple-input bg-[var(--surface-solid)] pl-7 text-xs p-2 w-full font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Due Date & Statement Closing Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Payment Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Statement Close Date
              </label>
              <input
                type="date"
                value={formData.statementCloseDate || ''}
                onChange={e => setFormData({ ...formData, statementCloseDate: e.target.value })}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full"
              />
            </div>
          </div>

          {/* Credit Limit & APR */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Credit Limit ({currencySymbol})
              </label>
              <input
                type="number"
                step="50"
                placeholder="e.g. 1500"
                value={formData.creditLimit || ''}
                onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                APR % (Interest Rate)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 24.9"
                value={formData.apr || ''}
                onChange={e => setFormData({ ...formData, apr: Number(e.target.value) })}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full font-mono"
              />
            </div>
          </div>

          {/* Notes & Reward Benefits */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Reward Notes & Cash-back Perks
            </label>
            <textarea
              placeholder="e.g. 1% cashback on dining, £100 welcome bonus after 3 months..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="apple-input bg-[#141416] text-xs p-2.5 w-full resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${formData.cardName}?`)) {
                    onDelete(card.id);
                    onClose();
                  }
                }}
                className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                title="Delete Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 transition-all flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
              >
                <Check className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Create Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
