// Component: Career Pipeline Kanban Board with Clean Column Headers & Count Pills

import React from 'react';
import { GraduateScheme, TrackerStatus } from '../../../types';
import { JobCard } from './JobCard';

export interface KanbanBoardProps {
  schemes: GraduateScheme[];
  onUpdateStatus?: (id: string, status: TrackerStatus) => void;
  onEdit?: (scheme: GraduateScheme) => void;
  onDelete?: (id: string) => void;
  onQuickAi?: (scheme: GraduateScheme) => void;
  onTailor?: (scheme: GraduateScheme) => void;
}

const COLUMNS: { id: TrackerStatus; label: string; dotColor: string; textColor: string }[] = [
  { id: 'To Apply', label: 'To Apply', dotColor: 'bg-amber-400', textColor: 'text-amber-400' },
  { id: 'Applied', label: 'Applied', dotColor: 'bg-blue-400', textColor: 'text-blue-400' },
  { id: 'Assessment', label: 'Assessment', dotColor: 'bg-purple-400', textColor: 'text-purple-400' },
  { id: 'Interview', label: 'Interviews', dotColor: 'bg-indigo-400', textColor: 'text-indigo-400' },
  { id: 'Offer', label: 'Offers 🎉', dotColor: 'bg-emerald-400', textColor: 'text-emerald-400' },
  { id: 'Rejected', label: 'Archived', dotColor: 'bg-rose-400', textColor: 'text-rose-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  schemes,
  onUpdateStatus,
  onEdit,
  onDelete,
  onQuickAi,
  onTailor
}) => {
  const getColumnSchemes = (columnId: TrackerStatus) => {
    return schemes.filter((s) => {
      if (columnId === 'Applied') return s.status === 'Applied' || s.status === 'Applied ✓';
      if (columnId === 'Offer') return s.status === 'Offer' || s.status === 'Offer 🎉';
      if (columnId === 'Rejected') return s.status === 'Rejected' || s.status === 'Rejected ✕';
      if (columnId === 'Assessment') return s.status === 'Assessment' || s.status === 'Online Tests' || s.status === 'Assessment Centre';
      if (columnId === 'Interview') return s.status === 'Interview' || s.status === 'Video Interview' || s.status === 'Final Interview';
      if (columnId === 'To Apply') return s.status === 'To Apply' || s.status === 'Not Applied';
      return s.status === columnId;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
      {COLUMNS.map((col) => {
        const colSchemes = getColumnSchemes(col.id);
        const count = colSchemes.length;

        return (
          <div
            key={col.id}
            className="flex flex-col bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-2xl p-3.5 min-w-[270px] shadow-xs"
          >
            {/* Column Header with Count Pill: e.g. "Applied (4)" */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <span className={`text-xs font-bold font-mono tracking-wider ${col.textColor}`}>
                  {col.label}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold">
                {count}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">
              {colSchemes.map((scheme) => (
                <JobCard
                  key={scheme.id}
                  scheme={scheme}
                  onUpdateStatus={onUpdateStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onQuickAi={onQuickAi}
                  onTailor={onTailor}
                />
              ))}

              {count === 0 && (
                <div className="py-12 px-4 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl text-[11px] text-[var(--text-secondary)] font-mono space-y-1">
                  <p>No active applications</p>
                  <p className="text-[10px] text-slate-500">Drag or update stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
