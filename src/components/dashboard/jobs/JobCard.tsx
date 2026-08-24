import React from 'react';
import { Briefcase, Building2, Calendar, DollarSign, ExternalLink, ChevronRight, MoreVertical, Edit2, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { GraduateScheme, TrackerStatus } from '../../../types';
import { Badge } from '../../ui/Badge';
import { SpatialCard } from '../../ui/SpatialCard';
import { CalendarExportButton } from './CalendarExportButton';

export interface JobCardProps {
  scheme: GraduateScheme;
  onUpdateStatus?: (id: string, status: TrackerStatus) => void;
  onEdit?: (scheme: GraduateScheme) => void;
  onDelete?: (id: string) => void;
  onQuickAi?: (scheme: GraduateScheme) => void;
  onTailor?: (scheme: GraduateScheme) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  scheme,
  onUpdateStatus,
  onEdit,
  onDelete,
  onQuickAi,
  onTailor
}) => {
  const getStatusVariant = (status: TrackerStatus): 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' => {
    if (status.includes('Offer')) return 'emerald';
    if (status.includes('Interview') || status.includes('Assessment')) return 'purple';
    if (status.includes('Applied')) return 'blue';
    if (status.includes('Rejected')) return 'rose';
    if (status.includes('To Apply')) return 'amber';
    return 'slate';
  };

  return (
    <SpatialCard
      onClick={() => onEdit && onEdit(scheme)}
      className="p-4 cursor-pointer text-left flex flex-col justify-between h-full border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl hover:border-[var(--accent)]/50 transition-all duration-300"
    >
      <div>
        {/* Header: Company & Stage Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-[var(--accent)] font-mono tabular-nums font-bold text-sm shrink-0">
              {scheme.firm.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-base text-[var(--text-primary)] tracking-tight truncate leading-snug">
                {scheme.firm}
              </h4>
              <p className="text-sm font-medium text-[var(--text-muted)] truncate">
                {scheme.roleTitle}
              </p>
            </div>
          </div>

          <Badge variant={getStatusVariant(scheme.status)} dot size="sm">
            {scheme.status}
          </Badge>
        </div>

        {/* Info Pills: Compensation & Deadline */}
        <div className="flex flex-wrap items-center gap-2 my-3 text-xs font-mono tabular-nums">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] font-semibold">
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{scheme.salary || 'Competitive'}</span>
            {scheme.bonus && <span className="text-[10px] text-emerald-400">+{scheme.bonus}</span>}
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)] font-mono tabular-nums">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{scheme.appCloses || 'Rolling'}</span>
          </div>
        </div>

        {/* Notes preview if present */}
        {scheme.notes && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3 bg-black/[0.02] dark:bg-black/20 p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06] font-sans leading-relaxed">
            {scheme.notes}
          </p>
        )}
      </div>

      {/* Footer: Sector & Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-xs mt-1">
        <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider font-semibold">
          {scheme.sector}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onTailor && (
            <button
              onClick={() => onTailor(scheme)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 hover:text-purple-300 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Tailor Cover Letter & CV Bullets"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {onQuickAi && (
            <button
              onClick={() => onQuickAi(scheme)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Quick AI Outreach & Prep"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <CalendarExportButton
            title={`[Deadline] ${scheme.firm} - ${scheme.roleTitle}`}
            date={scheme.appCloses}
            company={scheme.firm}
            role={scheme.roleTitle}
            portalUrl={scheme.applyVia}
            notes={scheme.notes}
            variant="icon"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-amber-500/10 border border-black/[0.06] dark:border-white/[0.08] hover:border-amber-500/30 text-[var(--text-muted)] hover:text-amber-400 transition-all"
          />

          {onEdit && (
            <button
              onClick={() => onEdit(scheme)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/[0.08] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer active:scale-95"
              title="Edit application"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(scheme.id)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-rose-500/10 border border-black/[0.06] dark:border-white/[0.08] hover:border-rose-500/30 text-[var(--text-muted)] hover:text-rose-400 transition-all cursor-pointer active:scale-95"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {scheme.applyVia && (
            <a
              href={scheme.applyVia}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0052FF]/10 hover:bg-[#0052FF]/20 border border-[#0052FF]/20 text-blue-400 hover:text-blue-300 transition-all active:scale-95"
              title="Open portal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </SpatialCard>
  );
};

export default JobCard;
