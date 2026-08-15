import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, Calendar, Tag, CreditCard, Users, Check, Trash2, Split } from 'lucide-react';
import { Expense } from '../../types';

interface Props {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExpense: Expense) => void;
  onDelete?: (id: string) => void;
  categories: string[];
  peers: string[];
  currencySymbol: string;
}

export const EditExpenseModal: React.FC<Props> = ({
  expense,
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
  peers,
  currencySymbol
}) => {
  const [formData, setFormData] = useState<Partial<Expense>>({});
  const [isSplit, setIsSplit] = useState(false);
  const [splitRatio, setSplitRatio] = useState('50');

  useEffect(() => {
    if (expense) {
      const hasSplit = !!(expense.splitWith || (expense.owedToMe && expense.owedToMe > 0));
      setIsSplit(hasSplit);
      
      const totalAmt = expense.amount + (expense.owedToMe || 0);
      const myPct = totalAmt > 0 ? Math.round((expense.amount / totalAmt) * 100) : 50;
      setSplitRatio(expense.splitRatio ? String(expense.splitRatio) : String(myPct));

      setFormData({
        ...expense,
        amount: totalAmt > 0 ? totalAmt : expense.amount
      });
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const totalAmount = Number(formData.amount || 0);
  const myPercentage = Number(splitRatio || 50);
  const myShare = isSplit ? totalAmount * (myPercentage / 100) : totalAmount;
  const peerShare = isSplit ? totalAmount - myShare : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.date || !formData.category) {
      alert('Please fill in required fields (Category, Amount, Date)');
      return;
    }

    onSave({
      ...(expense as Expense),
      ...formData,
      category: formData.category || 'Food',
      amount: Number(myShare.toFixed(2)),
      date: formData.date,
      description: formData.description || '',
      paymentMethod: formData.paymentMethod || 'Debit Card',
      splitWith: isSplit && formData.splitWith ? formData.splitWith : undefined,
      splitType: isSplit ? 'custom' : undefined,
      splitRatio: isSplit ? myPercentage : undefined,
      owedToMe: isSplit ? Number(peerShare.toFixed(2)) : 0,
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
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Edit Expense</h3>
              <p className="text-xs text-[var(--text-secondary)]">Modify amount, category, split share & payment method</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {/* Category & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Category *
              </label>
              <select
                value={formData.category || 'Food'}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Total Transaction Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="apple-input bg-[var(--surface-solid)] pl-7 text-sm p-2.5 w-full font-bold text-red-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Vendor / Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Vendor / Description
              </label>
              <input
                type="text"
                placeholder="e.g. Tesco Metro, Uber, Pret"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Payment Method / Account
            </label>
            <select
              value={formData.paymentMethod || 'Debit Card'}
              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full"
            >
              <option value="Debit Card">Debit Card (Monzo / Barclays / HSBC)</option>
              <option value="Credit Card">Credit Card (Amex / Chase)</option>
              <option value="Cash">Cash</option>
              <option value="Apple Pay / Google Pay">Apple Pay / Google Pay</option>
              <option value="Bank Transfer">Direct Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Split with Peer Toggle */}
          <div className="bg-[var(--surface-solid)] p-3.5 rounded-2xl border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">Split with Peer / Roommate</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSplit(!isSplit)}
                className={`w-10 h-6 rounded-full transition-colors relative ${isSplit ? 'bg-emerald-500' : 'bg-[rgba(128,128,128,0.2)]'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isSplit ? 'left-5' : 'left-1'}`}></div>
              </button>
            </div>

            {isSplit && (
              <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Peer Name / Contact
                    </label>
                    <input
                      type="text"
                      list="peers-list"
                      placeholder="e.g. Alex, Maya"
                      value={formData.splitWith || ''}
                      onChange={e => setFormData({ ...formData, splitWith: e.target.value })}
                      className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full"
                    />
                    <datalist id="peers-list">
                      {peers.map(p => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      My Share Percentage ({splitRatio}%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={splitRatio}
                      onChange={e => setSplitRatio(e.target.value)}
                      className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full text-center font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[var(--surface-solid)] p-2.5 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[10px]">Your Net Cost</span>
                    <span className="text-red-400 font-bold">{currencySymbol}{myShare.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--text-secondary)] block text-[10px]">Owed to You</span>
                    <span className="text-emerald-400 font-bold">{currencySymbol}{peerShare.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Notes & Tags
            </label>
            <textarea
              placeholder="Add optional notes or itemized breakdown..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this expense entry?')) {
                    onDelete(expense.id);
                    onClose();
                  }
                }}
                className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                title="Delete Expense"
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
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
