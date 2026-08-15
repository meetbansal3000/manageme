import { SmartTextarea } from "./SmartTextarea";
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PriorityTrackerItem, TrackerStatus } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<PriorityTrackerItem, 'id' | 'rank'>) => void;
}

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  useScrollLock(isOpen);
  useModalDismiss(isOpen, onClose);

  const [firm, setFirm] = useState('');
  const [role, setRole] = useState('');
  const [roleType, setRoleType] = useState<'Grad Scheme' | 'Part-Time' | 'Part-Time (Agency)'>('Grad Scheme');
  const [sector, setSector] = useState('Asset Management');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TrackerStatus>('Not Applied');
  const [dateApplied, setDateApplied] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firm || !role) return;

    onAdd({
      firm,
      role,
      roleType,
      sector,
      deadline: deadline || 'Rolling',
      status,
      dateApplied,
      nextAction: nextAction || 'Prepare application materials & tailored CV',
      notes: notes || 'Target firm added to tracker'
    });

    // reset
    setFirm('');
    setRole('');
    setDeadline('');
    setNextAction('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/70 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[var(--bg)] border border-[var(--border)] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="sticky top-0 float-right -mt-2 -mr-2 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-full text-[var(--text-secondary)] hover:text-white shadow z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[var(--border)] pb-3 mt-0">
          <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest">
            TARGET ENTRY
          </div>
          <h3 className="apple-headline text-3xl font-semibold text-[var(--text-primary)] mt-1">
            Add Target Application
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
              Firm / Employer *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. M&G Investments"
              value={firm}
              onChange={(e) => setFirm(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
              Role Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2027 Investment Graduate Programme"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                Type
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
              >
                <option value="Grad Scheme">Grad Scheme</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Part-Time (Agency)">Part-Time (Agency)</option>
              </select>
            </div>

            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
              >
                <option value="Asset Management">Asset Management</option>
                <option value="M&A / Boutique Advisory">M&A / Boutique Advisory</option>
                <option value="Big 4 Advisory">Big 4 Advisory</option>
                <option value="Regional Mid-Tier">Regional Mid-Tier</option>
                <option value="Corporate / Industry">Corporate / Industry</option>
                <option value="Recruitment Agency">Recruitment Agency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                Deadline
              </label>
              <input
                type="text"
                placeholder="e.g. 31 Oct 2026 / Rolling"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TrackerStatus)}
                className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
              >
                <option value="Not Applied">Not Applied</option>
                <option value="Applied ✓">Applied ✓</option>
                <option value="Online Tests">Online Tests</option>
                <option value="Video Interview">Video Interview</option>
                <option value="Assessment Centre">Assessment Centre</option>
                <option value="Final Interview">Final Interview</option>
                <option value="Offer 🎉">Offer 🎉</option>
                <option value="Rejected ✕">Rejected ✕</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
              Date Applied (Optional)
            </label>
            <input
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
              Next Action
            </label>
            <input
              type="text"
              placeholder="e.g. Tailor CV with DipIFR & quantitative focus"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] font-space-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">
              Notes & Strategic Fit
            </label>
            <SmartTextarea
              rows={2}
              placeholder="Key strategic advantages, referral contacts, or requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--border)] font-space-mono text-xs uppercase tracking-wider text-[var(--text-primary)] hover:bg-[var(--surface-solid)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] hover:bg-[#004d40] text-white font-space-mono text-xs uppercase tracking-wider transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Tracker</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
