// Component: Career Pipeline Kanban Board

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

const COLUMNS: { id: TrackerStatus; label: string; color: string }[] = [
  { id: 'To Apply', label: 'To Apply', color: 'border-amber-500/40 text-amber-400' },
  { id: 'Applied', label: 'Applied', color: 'border-blue-500/40 text-blue-400' },
  { id: 'Assessment', label: 'Tests / Assessment', color: 'border-purple-500/40 text-purple-400' },
  { id: 'Interview', label: 'Interviews', color: 'border-indigo-500/40 text-indigo-400' },
  { id: 'Offer', label: 'Offers 🎉', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'Rejected', label: 'Archived / Rejected', color: 'border-rose-500/40 text-rose-400' },
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colSchemes = getColumnSchemes(col.id);
        return (
          <div
            key={col.id}
            className="flex flex-col bg-white/[0.02] border border-white/10 rounded-2xl p-3 min-w-[260px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className={`text-xs font-bold font-mono tracking-wider ${col.color}`}>
                {col.label}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                {colSchemes.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 no-scrollbar">
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

              {colSchemes.length === 0 && (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-xl text-[11px] text-slate-500 font-mono">
                  No applications
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
