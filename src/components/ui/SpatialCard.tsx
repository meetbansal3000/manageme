'use client';
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface SpatialCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpatialCard({ children, className = '' }: SpatialCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 25 });

  if (!mounted) {
    return <div className={`rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-950/70 p-6 ${className}`}>{children}</div>;
  }

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

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`relative rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default SpatialCard;
