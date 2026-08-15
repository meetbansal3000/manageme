import React, { useState } from 'react';
import { 
  Plus,
  X, 
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PriorityTrackerItem, TrackerStatus } from '../types';
import { UserTrackerData } from '../hooks/useFirestoreData';

interface PriorityTrackerTabProps {
  priorityItems: PriorityTrackerItem[];
  onUpdateStatus: (id: string, status: TrackerStatus) => void;
  onUpdateNotes: (id: string, nextAction: string, notes: string) => void;
  onAddNewApplication: () => void;
  searchQuery: string;
  selectedSector: string;
  userData?: UserTrackerData;
}

import { useScrollFadeUp } from "../hooks/useScrollFadeUp";
import { AppleEmptyState } from './AppleEmptyState';
import { Target } from 'lucide-react';

export const PriorityTrackerTab: React.FC<PriorityTrackerTabProps> = ({
  priorityItems = [],
  onUpdateStatus,
  onUpdateNotes,
  onAddNewApplication,
  searchQuery,
  selectedSector,
  userData
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNextAction, setTempNextAction] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  const handleStatusChange = (id: string, newStatus: TrackerStatus) => {
    onUpdateStatus(id, newStatus);
    
    // Auto-reminder logic
    if (newStatus === 'Applied ✓') {
      const item = priorityItems.find(p => p.id === id);
      if (item && !item.nextAction.includes('Follow up in 7 days')) {
        onUpdateNotes(id, item.nextAction ? `${item.nextAction} | Follow up in 7 days` : 'Follow up in 7 days', item.notes);
      }
    }

    if (newStatus === 'Offer 🎉') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const startEdit = (item: PriorityTrackerItem) => {
    setEditingId(item.id);
    setTempNextAction(item.nextAction);
    setTempNotes(item.notes);
  };

  const saveEdit = (id: string) => {
    onUpdateNotes(id, tempNextAction, tempNotes);
    setEditingId(null);
  };

  useScrollFadeUp([priorityItems, searchQuery]);

  const filtered = priorityItems.filter(p => {
    if (selectedSector !== 'ALL' && p.sector !== selectedSector) return false;
    if (selectedStatusFilter !== 'ALL' && p.status !== selectedStatusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.firm.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q) ||
      p.nextAction.toLowerCase().includes(q) ||
      p.notes.toLowerCase().includes(q)
    );
  });

  const STATUS_OPTIONS: TrackerStatus[] = [
    'Not Applied',
    'Applied ✓',
    'Online Tests',
    'Video Interview',
    'Assessment Centre',
    'Final Interview',
    'Offer 🎉',
    'Rejected ✕'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors z-10 hidden sm:block"><X className="w-5 h-5" /></button>
      
      {/* Header Banner */}
      <div className="border-b border-[var(--border)] pb-6 flex flex-col lg:flex-row justify-between items-start gap-8 w-full">
        <div className="flex-1">
          <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest">
            04 / ACTIVE PIPELINE
          </div>
          <h2 className="apple-headline text-3xl sm:text-4xl text-[var(--text-primary)] font-semibold mt-1">
            Priority Tracker
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Real-time pipeline tracking application status stages, submission dates, next action items, and strategic positioning for {userData?.userName || 'Executive Workspace Owner'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-transparent border border-[var(--border)] font-space-mono text-xs text-[var(--text-primary)] focus:outline-none focus:bg-[var(--surface-solid)]"
          >
            <option value="ALL">ALL PIPELINE STAGES</option>
            {STATUS_OPTIONS.map(st => (
              <option key={st} value={st}>{st.toUpperCase()}</option>
            ))}
          </select>

          <button
            onClick={onAddNewApplication}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#004d40] text-white font-space-mono text-xs uppercase tracking-wider transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Target</span>
          </button>
        </div>
      </div>

      {/* Editorial Table */}
      {filtered.length === 0 ? (
        <AppleEmptyState
          icon={Target}
          title="No Priority Applications Found"
          description="Try clearing your search or sector filter to view target applications."
          actionLabel="Add Target Application"
          onAction={onAddNewApplication}
          className="my-4 py-12"
        />
      ) : (
        <div className="border border-[var(--border)] overflow-x-auto bg-[var(--surface-solid)] rounded-2xl">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[var(--bg)] text-[var(--text-primary)] border-b border-[var(--border)] font-space-mono text-[10px] uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">Rank</th>
              <th className="py-3 px-4 w-48">Firm & Role</th>
              <th className="py-3 px-3 w-28 text-center">Type</th>
              <th className="py-3 px-3 w-32">Sector</th>
              <th className="py-3 px-3 w-28 text-center">Deadline</th>
              <th className="py-3 px-4 w-40 text-center">Live Status</th>
              <th className="py-3 px-3 w-28 text-center">Date Applied</th>
              <th className="py-3 px-4">Next Action & Strategic Fit</th>
              <th className="py-3 px-3 w-14 text-center">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]/15">
            {filtered.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <tr key={item.id} className="gsap-fade-up hover:bg-[var(--bg)] transition-colors">
                  <td className="py-3.5 px-3 text-center align-top font-space-mono font-bold text-[var(--accent)]">
                    {item.rank}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <div className="apple-headline text-base font-semibold text-[var(--text-primary)]">{item.firm}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{item.role}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center align-top font-space-mono text-[10px] text-[var(--text-secondary)]">
                    {item.roleType}
                  </td>
                  <td className="py-3.5 px-3 text-xs text-[var(--text-secondary)] align-top">
                    {item.sector}
                  </td>
                  <td className="py-3.5 px-3 text-xs font-mono text-center text-[var(--text-primary)] align-top">
                    {item.deadline}
                  </td>
                  <td className="py-3.5 px-4 text-center align-top">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as TrackerStatus)}
                      className="text-xs font-space-mono px-2 py-1 bg-transparent border border-[var(--border)] focus:outline-none cursor-pointer w-full"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[var(--surface-solid)] text-[var(--text-primary)]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 px-3 font-space-mono text-[10px] text-center text-[var(--text-secondary)] align-top">
                    {item.dateApplied || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[var(--text-primary)] align-top space-y-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={tempNextAction}
                          onChange={(e) => setTempNextAction(e.target.value)}
                          placeholder="Next action..."
                          className="w-full px-2 py-1 bg-[var(--surface-solid)] border border-[var(--border)] text-xs font-space-mono"
                        />
                        <textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Notes..."
                          rows={2}
                          className="w-full px-2 py-1 bg-[var(--surface-solid)] border border-[var(--border)] text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="px-2 py-0.5 bg-[#004d40] text-white font-space-mono text-[10px] uppercase"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-0.5 bg-gray-200 text-[var(--text-primary)] font-space-mono text-[10px] uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-[var(--text-primary)]">{item.nextAction}</div>
                        <div className="text-[var(--text-secondary)] italic text-xs">{item.notes}</div>
                      </>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center align-top">
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 text-[var(--text-primary)]/40 hover:text-[var(--accent)] transition-colors"
                        title="Edit action/notes"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};
