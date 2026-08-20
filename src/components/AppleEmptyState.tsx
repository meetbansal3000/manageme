import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface AppleEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const AppleEmptyState: React.FC<AppleEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  children,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-3xl bg-[var(--surface-solid)]/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 backdrop-blur-md transition-all shadow-xs ${className}`}>
      <div className="relative p-4 rounded-2xl bg-blue-500/10 dark:bg-white/5 border border-blue-500/20 dark:border-white/10 mb-4 text-blue-600 dark:text-blue-400 group">
        <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <Icon className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5] relative z-10" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-200 tracking-tight mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mb-5 leading-relaxed font-medium">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer hover:shadow-blue-500/40"
        >
          {actionLabel}
        </button>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};

export default AppleEmptyState;
