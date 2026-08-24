'use client';
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface SpatialCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SpatialCard({ children, className = '', onClick }: SpatialCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 25 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  if (!mounted) {
    return (
      <div 
        onClick={onClick}
        className={`rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-950/70 p-6 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`group relative overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Subtle Cursor Spotlight Follower */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(350px circle at calc(50% + ${mouseX.get() * 150}px) calc(50% + ${mouseY.get() * 150}px), rgba(94, 106, 210, 0.12), transparent 70%)`
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default SpatialCard;
