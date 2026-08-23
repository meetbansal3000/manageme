// Component: Status & Priority Pill Badge Primitive

import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'blue',
  size = 'sm',
  dot = false,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5 font-medium',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium'
  };

  const variantStyles = {
    blue: 'bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    slate: 'bg-white/5 text-slate-300 border border-white/10',
    outline: 'bg-transparent text-slate-300 border border-white/20'
  };

  const dotColors = {
    blue: 'bg-[#0052FF]',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-400',
    outline: 'bg-slate-300'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-mono select-none uppercase tracking-wider',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

export default Badge;
