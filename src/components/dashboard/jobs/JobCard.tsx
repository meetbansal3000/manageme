import React from 'react';
import { Briefcase, Building2, Calendar, DollarSign, ExternalLink, ChevronRight, MoreVertical, Edit2, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { GraduateScheme, TrackerStatus } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';

export interface JobCardProps {
  scheme: GraduateScheme;
  onUpdateStatus?: (id: string, status: TrackerStatus) => void;
  onEdit?: (scheme: GraduateScheme) => void;
  onDelete?: (id: string) => void;
  onQuickAi?: (scheme: GraduateScheme) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  scheme,
  onUpdateStatus,
  onEdit,
  onDelete,
  onQuickAi
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
    <Card
      variant="glass"
      hoverEffect
      padding="sm"
      className="border border-white/10 group transition-all cursor-pointer"
      onClick={() => onEdit && onEdit(scheme)}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">{scheme.firm}</h4>
            <p className="text-xs text-slate-400 truncate">{scheme.roleTitle}</p>
          </div>
        </div>

        <Badge variant={getStatusVariant(scheme.status)} dot>
          {scheme.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 my-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <DollarSign className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white">{scheme.salary || 'Competitive'}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{scheme.appCloses || 'Rolling'}</span>
        </div>
      </div>

      {scheme.notes && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-white/[0.02] p-2 rounded-lg border border-white/5 font-sans">
          {scheme.notes}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          {scheme.sector}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onQuickAi && (
            <button
              onClick={() => onQuickAi(scheme)}
              className="p-1 rounded text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors cursor-pointer"
              title="Quick AI Outreach & Prep"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(scheme)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Edit application"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(scheme.id)}
              className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete application"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {scheme.applyVia && (
            <a
              href={scheme.applyVia}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-slate-400 hover:text-[#0052FF] transition-colors"
              title="Open portal"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
