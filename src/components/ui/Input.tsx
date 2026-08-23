// Component: Modern Form Input & Search Field Primitive

import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  leftIcon,
  rightIcon,
  error,
  label,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-mono text-slate-300 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full bg-[#110D26]/80 text-white placeholder-slate-400 border border-white/10 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-400 font-mono mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
