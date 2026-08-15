import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import { triggerHaptic, IOS_SPRING } from '../utils/haptics';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightLabel?: string;
  leftLabel?: string;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = 'Complete',
  leftLabel = 'Delete',
  threshold = 80,
  className = '',
  disabled = false,
}) => {
  const x = useMotionValue(0);

  // Background reveal opacities
  const rightBgOpacity = useTransform(x, [10, threshold], [0, 1]);
  const leftBgOpacity = useTransform(x, [-10, -threshold], [0, 1]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (disabled) return;
    if (info.offset.x > threshold || info.velocity.x > 300) {
      if (onSwipeRight) {
        triggerHaptic(15);
        onSwipeRight();
      }
    } else if (info.offset.x < -threshold || info.velocity.x < -300) {
      if (onSwipeLeft) {
        triggerHaptic(15);
        onSwipeLeft();
      }
    }
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl select-none ${className}`}>
      {/* Swipe Right Action Background (Green) */}
      <motion.div
        style={{ opacity: rightBgOpacity }}
        className="absolute inset-y-0 left-0 right-1/2 bg-emerald-600/90 text-white flex items-center justify-start pl-5 gap-2 font-semibold text-xs rounded-l-2xl z-0"
      >
        <Check className="w-4 h-4 shrink-0" />
        <span className="truncate">{rightLabel}</span>
      </motion.div>

      {/* Swipe Left Action Background (Red) */}
      <motion.div
        style={{ opacity: leftBgOpacity }}
        className="absolute inset-y-0 right-0 left-1/2 bg-rose-600/90 text-white flex items-center justify-end pr-5 gap-2 font-semibold text-xs rounded-r-2xl z-0"
      >
        <span className="truncate">{leftLabel}</span>
        <Trash2 className="w-4 h-4 shrink-0" />
      </motion.div>

      {/* Foreground Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -110, right: 110 }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={handleDragEnd}
        transition={IOS_SPRING}
        className="relative z-10 bg-inherit"
      >
        {children}
      </motion.div>
    </div>
  );
};
