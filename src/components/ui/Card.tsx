// Component: Reusable Glassmorphism Card Container Primitive

import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient' | 'bordered';
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hoverEffect = false,
  padding = 'md',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const variantStyles = {
    glass: 'bg-black/40 backdrop-blur-xl border border-white/10 text-white shadow-2xl',
    solid: 'bg-[#110D26] border border-white/10 text-white',
    gradient: 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 text-white',
    bordered: 'bg-transparent border border-white/15 text-white'
  };

  const hoverStyle = hoverEffect ? 'transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,82,255,0.15)] hover:-translate-y-0.5' : '';

  return (
    <div
      className={cn(
        'rounded-2xl relative overflow-hidden',
        paddingStyles[padding],
        variantStyles[variant],
        hoverStyle,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
