import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, DollarSign, Building, MapPin, FileText, Check, Trash2, Copy } from 'lucide-react';
import { WorkShift } from '../../types';

interface Props {
  shift: WorkShift | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShift: WorkShift) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (shift: WorkShift) => void;
  baseHourlyRate: number;
  currencySymbol: string;
}

export const EditShiftModal: React.FC<Props> = ({
  shift,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  baseHourlyRate,
  currencySymbol
}) => {
  const [formData, setFormData] = useState<Partial<WorkShift>>({});

  useEffect(() => {
    if (shift) {
      setFormData({
        ...shift,
        rateMultiplier: shift.rateMultiplier || 1.0,
        hourlyRate: shift.hourlyRate || baseHourlyRate
      });
    }
  }, [shift, baseHourlyRate]);

  if (!isOpen || !shift) return null;

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return formData.hours || 0;
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Overnight shift
      return Number((diffMinutes / 60).toFixed(2));
    } catch {
      return formData.hours || 0;
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const updated = { ...formData, [field]: value };
    if (updated.startTime && updated.endTime) {
      const hrs = calculateHours(updated.startTime, updated.endTime);
      updated.hours = hrs;
    }
    setFormData(updated);
  };

  const effectiveRate = (formData.hourlyRate || baseHourlyRate) * (formData.rateMultiplier || 1.0);
  const totalEarned = (formData.hours || 0) * effectiveRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.hours) {
      alert('Please fill in required fields (Date, Start/End Time, Hours)');
      return;
    }

    onSave({
      ...(shift as WorkShift),
      ...formData,
      hours: Number(formData.hours),
      hourlyRate: Number(formData.hourlyRate || baseHourlyRate),
      rateMultiplier: Number(formData.rateMultiplier || 1.0),
      totalEarned: Number(totalEarned.toFixed(2))
    });
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
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Edit Work Shift</h3>
              <p className="text-xs text-[var(--text-secondary)]">Customize hours, rate multiplier, role & location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {/* Date & Employer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Shift Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="apple-input bg-[#141416] text-sm p-2.5 w-full font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Employer / Role Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. University Library / Barista"
                  value={formData.roleTitle || ''}
                  onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="apple-input bg-[#141416] text-sm p-2.5 w-full"
                />
              </div>
            </div>
          </div>

          {/* Time Range & Hours */}
          <div className="grid grid-cols-3 gap-3 bg-[#141416] p-3.5 rounded-2xl border border-[var(--border)]">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={e => handleTimeChange('startTime', e.target.value)}
                className="apple-input bg-[#1c1c1e] text-xs p-2 w-full text-center"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={e => handleTimeChange('endTime', e.target.value)}
                className="apple-input bg-[#1c1c1e] text-xs p-2 w-full text-center"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Total Hours *
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={formData.hours || ''}
                onChange={e => setFormData({ ...formData, hours: Number(e.target.value) })}
                className="apple-input bg-[#1c1c1e] text-xs p-2 w-full text-center font-bold text-blue-400"
                required
              />
            </div>
          </div>

          {/* Pay Rate & Multiplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#141416] p-3.5 rounded-2xl border border-[var(--border)]">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Base Hourly Rate ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.05"
                  value={formData.hourlyRate || baseHourlyRate}
                  onChange={e => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  className="apple-input bg-[#1c1c1e] pl-7 text-xs p-2.5 w-full font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Pay Multiplier (Overtime/Night)
              </label>
              <select
                value={formData.rateMultiplier || 1.0}
                onChange={e => setFormData({ ...formData, rateMultiplier: Number(e.target.value) })}
                className="apple-input bg-[#1c1c1e] text-xs p-2.5 w-full font-medium"
              >
                <option value={1.0}>1.0x (Standard Rate)</option>
                <option value={1.25}>1.25x (Evening / Weekend)</option>
                <option value={1.5}>1.5x (Time & a Half)</option>
                <option value={1.75}>1.75x (Night Shift)</option>
                <option value={2.0}>2.0x (Double Time / Bank Holiday)</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2 pt-2 border-t border-[var(--border)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Calculated Shift Payout:</span>
              <span className="text-emerald-400 font-bold text-sm font-mono">
                {currencySymbol}{totalEarned.toFixed(2)}
                <span className="text-[10px] text-[var(--text-secondary)] font-normal ml-1">
                  (@ {currencySymbol}{effectiveRate.toFixed(2)}/h)
                </span>
              </span>
            </div>
          </div>

          {/* Location & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Location / Campus Site
              </label>
              <input
                type="text"
                placeholder="e.g. Bill Bryson Library, Level 2"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Notes & Tasks Completed
              </label>
              <textarea
                placeholder="Add shift details, supervisor notes, or tasks performed..."
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="apple-input bg-[#141416] text-xs p-2.5 w-full resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this work shift?')) {
                      onDelete(shift.id);
                      onClose();
                    }
                  }}
                  className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                  title="Delete Shift"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {onDuplicate && (
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(shift);
                    onClose();
                  }}
                  className="p-2.5 text-blue-400 hover:bg-blue-400/10 rounded-xl transition-colors"
                  title="Duplicate Shift"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
