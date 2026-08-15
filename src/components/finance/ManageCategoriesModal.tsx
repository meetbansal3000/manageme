import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, Check, Palette, Sparkles, DollarSign } from 'lucide-react';

export interface CategoryConfig {
  name: string;
  monthlyBudget?: number;
  color?: string;
  iconName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
  onSaveCategories: (cats: CategoryConfig[]) => void;
  currencySymbol: string;
}

const PRESET_COLORS = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#71717a'  // Zinc
];

export const ManageCategoriesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  currencySymbol
}) => {
  const [list, setList] = useState<CategoryConfig[]>(categories);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (list.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('A category with this name already exists.');
      return;
    }

    const updated = [
      ...list,
      {
        name: trimmed,
        monthlyBudget: newCatBudget ? Number(newCatBudget) : undefined,
        color: newCatColor
      }
    ];
    setList(updated);
    setNewCatName('');
    setNewCatBudget('');
  };

  const handleRemove = (catName: string) => {
    if (list.length <= 1) {
      alert('You must have at least one category.');
      return;
    }
    setList(list.filter(c => c.name !== catName));
  };

  const handleUpdateBudget = (catName: string, budgetVal: string) => {
    const budget = budgetVal ? Number(budgetVal) : undefined;
    setList(list.map(c => c.name === catName ? { ...c, monthlyBudget: budget } : c));
  };

  const handleSaveAll = () => {
    onSaveCategories(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#1c1c1e] border border-[var(--border)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Custom Expense Categories & Budgets</h3>
              <p className="text-xs text-[var(--text-secondary)]">Create custom categories and monthly spending limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Category Row */}
        <div className="bg-[#141416] p-3.5 rounded-2xl border border-[var(--border)] space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            Add New Custom Category
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Category Name (e.g. Groceries, Tech, Gym)"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="apple-input bg-[#1c1c1e] text-xs p-2.5 sm:col-span-6 w-full"
            />
            <div className="relative sm:col-span-4">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{currencySymbol}</span>
              <input
                type="number"
                placeholder="Monthly Budget"
                value={newCatBudget}
                onChange={e => setNewCatBudget(e.target.value)}
                className="apple-input bg-[#1c1c1e] pl-6 text-xs p-2.5 w-full font-mono"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newCatName.trim()}
              className="sm:col-span-2 bg-orange-500 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center p-2.5"
            >
              Add
            </button>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-[var(--text-secondary)]">Badge Color:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCatColor(c)}
                  className={`w-5 h-5 rounded-full border transition-transform ${newCatColor === c ? 'scale-125 border-white' : 'border-transparent opacity-80'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[320px]">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Active Categories ({list.length})
          </h4>
          {list.map(cat => (
            <div
              key={cat.name}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#141416] border border-[var(--border)] hover:border-[var(--border)]/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#3b82f6' }}
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">{cat.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[var(--text-secondary)]">Budget:</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]">{currencySymbol}</span>
                    <input
                      type="number"
                      placeholder="None"
                      value={cat.monthlyBudget ?? ''}
                      onChange={e => handleUpdateBudget(cat.name, e.target.value)}
                      className="apple-input bg-[#1c1c1e] pl-5 text-xs py-1 px-2 w-24 text-right font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(cat.name)}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
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
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
          >
            <Check className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
