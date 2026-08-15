import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, Calendar, Building, FileText, Check, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Invoice } from '../../types';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedInvoice: Invoice) => void;
  onDelete?: (id: string) => void;
  categories: string[];
  currencySymbol: string;
}

export const EditInvoiceModal: React.FC<Props> = ({
  invoice,
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories,
  currencySymbol
}) => {
  const [formData, setFormData] = useState<Partial<Invoice>>({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        status: invoice.status || 'Paid',
        category: invoice.category || 'Other'
      });
    } else {
      setFormData({
        id: Date.now().toString(),
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        category: 'Other',
        status: 'Paid',
        fileType: 'application/pdf'
      });
    }
  }, [invoice]);

  if (!isOpen) return null;

  const isEditing = !!invoice?.vendor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor || formData.amount === undefined || !formData.date) {
      alert('Please fill in Vendor Name, Amount, and Date');
      return;
    }

    onSave({
      id: formData.id || Date.now().toString(),
      vendor: formData.vendor,
      date: formData.date,
      amount: Number(formData.amount),
      fileType: formData.fileType || 'manual',
      invoiceNumber: formData.invoiceNumber || undefined,
      category: formData.category || 'Other',
      taxAmount: formData.taxAmount ? Number(formData.taxAmount) : undefined,
      status: formData.status || 'Paid',
      description: formData.description || '',
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
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? 'Edit Invoice / Receipt' : 'Add Manual Invoice'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Manage receipt vendor, tax, expense categorization & status</p>
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
          {/* Vendor & Invoice # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Vendor / Merchant *
              </label>
              <input
                type="text"
                placeholder="e.g. Apple, Amazon, British Gas"
                value={formData.vendor || ''}
                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Invoice / Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-089"
                value={formData.invoiceNumber || ''}
                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-mono"
              />
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3 bg-[var(--surface-solid)] p-3.5 rounded-2xl border border-[var(--border)]">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Total Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount ?? ''}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="apple-input bg-[var(--surface-solid)] pl-7 text-xs p-2 w-full font-bold text-red-400 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2 w-full font-medium"
                required
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Category
              </label>
              <select
                value={formData.category || 'Other'}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Reimbursement Status
              </label>
              <select
                value={formData.status || 'Paid'}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full"
              >
                <option value="Paid">Paid Out of Pocket</option>
                <option value="Pending">Pending Employer Reimbursement</option>
                <option value="Reimbursed">Reimbursed ✓</option>
              </select>
            </div>
          </div>

          {/* Tax / VAT & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                VAT / Tax Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 5.50"
                value={formData.taxAmount || ''}
                onChange={e => setFormData({ ...formData, taxAmount: Number(e.target.value) })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Brief Description
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Cloud Hosting"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Internal Notes & Business Purpose
            </label>
            <textarea
              placeholder="e.g. Claimable for university research or job prep..."
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="apple-input bg-[var(--surface-solid)] text-xs p-2.5 w-full resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete invoice for ${formData.vendor}?`)) {
                    onDelete(invoice.id);
                    onClose();
                  }
                }}
                className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                title="Delete Invoice"
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
                className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
              >
                <Check className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Save Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
