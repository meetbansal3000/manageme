import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Trash2, Plus, Sparkles, Building2, Briefcase, Calendar, DollarSign, MapPin } from 'lucide-react';
import { ExtractedJobApplication } from '../utils/autoImportPipeline';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  extractedJobs: ExtractedJobApplication[];
  onConfirm: (finalJobs: ExtractedJobApplication[]) => void;
  sourceFileName?: string;
}

export const ReviewJobImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  extractedJobs: initialJobs,
  onConfirm,
  sourceFileName
}) => {
  useScrollLock(isOpen);
  useModalDismiss(isOpen, onClose);

  const [jobs, setJobs] = useState<ExtractedJobApplication[]>(initialJobs || []);
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    (initialJobs || []).forEach((_, idx) => {
      initial[idx] = true;
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleFieldChange = (index: number, field: keyof ExtractedJobApplication, value: any) => {
    setJobs(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleToggleSelect = (index: number) => {
    setSelectedIds(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleRemoveRow = (index: number) => {
    setJobs(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddBlankRow = () => {
    setJobs(prev => [
      ...prev,
      {
        company: '',
        role: '',
        dateApplied: new Date().toISOString().split('T')[0],
        status: 'Applied',
        salary: '£50,000',
        location: 'London'
      }
    ]);
    setSelectedIds(prev => ({ ...prev, [jobs.length]: true }));
  };

  const handleSave = () => {
    const confirmed = jobs.filter((_, idx) => selectedIds[idx] !== false && jobs[idx].company && jobs[idx].role);
    if (confirmed.length === 0) {
      alert('Please select or fill at least one application to confirm.');
      return;
    }
    onConfirm(confirmed);
    onClose();
  };

  const confirmedCount = jobs.filter((_, idx) => selectedIds[idx] !== false && jobs[idx].company && jobs[idx].role).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-neutral-900 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] flex flex-col justify-between overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  AI Auto-Extraction Verified
                </span>
                {sourceFileName && (
                  <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[200px]">
                    from {sourceFileName}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Review & Confirm Job Applications
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 border border-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table / Card List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 my-2">
          {jobs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl p-6 space-y-3">
              <p className="text-sm text-neutral-400">No applications extracted. You can add one manually below.</p>
              <button
                onClick={handleAddBlankRow}
                className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl hover:bg-emerald-500/30 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Application
              </button>
            </div>
          ) : (
            jobs.map((job, idx) => {
              const isChecked = selectedIds[idx] !== false;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isChecked
                      ? 'bg-neutral-800/80 border-emerald-500/40 shadow-lg'
                      : 'bg-neutral-900/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-400">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(idx)}
                        className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                      <span>Include Application #{idx + 1}</span>
                    </label>

                    <button
                      onClick={() => handleRemoveRow(idx)}
                      className="text-neutral-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Firm */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-emerald-400" /> Company / Firm
                      </label>
                      <input
                        type="text"
                        value={job.company}
                        onChange={(e) => handleFieldChange(idx, 'company', e.target.value)}
                        placeholder="e.g. Goldman Sachs"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-indigo-400" /> Job Role / Title
                      </label>
                      <input
                        type="text"
                        value={job.role}
                        onChange={(e) => handleFieldChange(idx, 'role', e.target.value)}
                        placeholder="e.g. Investment Banking Analyst"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Date Applied */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" /> Date Applied
                      </label>
                      <input
                        type="date"
                        value={job.dateApplied || new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleFieldChange(idx, 'dateApplied', e.target.value)}
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                        Application Status
                      </label>
                      <select
                        value={job.status || 'Applied'}
                        onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Potential">Potential</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                      </select>
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-teal-400" /> Salary Range
                      </label>
                      <input
                        type="text"
                        value={job.salary || ''}
                        onChange={(e) => handleFieldChange(idx, 'salary', e.target.value)}
                        placeholder="e.g. £65,000 / $85k"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" /> Location
                      </label>
                      <input
                        type="text"
                        value={job.location || ''}
                        onChange={(e) => handleFieldChange(idx, 'location', e.target.value)}
                        placeholder="e.g. London (Hybrid)"
                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleAddBlankRow}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Row</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Save ({confirmedCount}) Applications</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
