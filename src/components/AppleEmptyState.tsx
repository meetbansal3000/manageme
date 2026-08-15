import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface AppleEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const AppleEmptyState: React.FC<AppleEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-neutral-900/40 border border-white/5 ${className}`}>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 text-neutral-400">
        <Icon className="w-12 h-12 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-200 tracking-tight mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-neutral-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium border border-white/10 transition-all active:scale-[0.98] cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
