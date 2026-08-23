import { SmartTextarea } from "./SmartTextarea";
import React, { useState } from 'react';
import { X, Plus, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { PriorityTrackerItem, TrackerStatus } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { toast } from './ui/Toast';

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

  // AI JD Extraction State
  const [rawJd, setRawJd] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAiExtract = async () => {
    if (!rawJd.trim() || rawJd.trim().length < 15) return;
    setIsParsing(true);
    setParseSuccess(false);

    try {
      const res = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawJd })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.company) setFirm(data.company);
        if (data.role) setRole(data.role);
        if (data.deadline) setDeadline(data.deadline);
        if (data.location) setNextAction(`Apply in ${data.location}`);
        if (data.suggestedTalkingPoints) {
          setNotes(`Talking Points: ${data.suggestedTalkingPoints.join('; ')}`);
        }
        setParseSuccess(true);
        setShowAiInput(false);
      }
    } catch (e) {
      console.warn('AI JD Parse failed:', e);
    } finally {
      setIsParsing(false);
    }
  };

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

    toast.success(`Saved ${role} at ${firm} to Potential Pipeline`);

    // reset
    setFirm('');
    setRole('');
    setDeadline('');
    setNextAction('');
    setNotes('');
    setRawJd('');
    setShowAiInput(false);
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
          <div className="flex items-center justify-between">
            <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest">
              TARGET ENTRY
            </div>
            <button
              type="button"
              onClick={() => setShowAiInput(!showAiInput)}
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAiInput ? 'Hide AI Ingestion' : 'Ingest JD with AI'}
            </button>
          </div>
          <h3 className="apple-headline text-3xl font-semibold text-[var(--text-primary)] mt-1">
            Add Target Application
          </h3>
        </div>

        {showAiInput && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2.5">
            <label className="block text-xs font-mono text-blue-300 font-semibold">
              Paste Raw Job Description / Posting
            </label>
            <textarea
              rows={4}
              value={rawJd}
              onChange={(e) => setRawJd(e.target.value)}
              placeholder="Paste job posting from LinkedIn, eFinancialCareers..."
              className="w-full p-2.5 bg-black/40 border border-white/10 text-xs font-mono text-white rounded-lg focus:outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={handleAiExtract}
              disabled={isParsing || rawJd.trim().length < 15}
              className="px-4 py-2 bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-mono rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isParsing ? 'Parsing with Gemini...' : 'Auto-Fill Form with AI'}</span>
            </button>
          </div>
        )}

        {parseSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Form auto-populated from job description! Review details below.</span>
          </div>
        )}

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
