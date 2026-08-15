export const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if not supported or constrained by permission
    }
  }
};

export const IOS_SPRING = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
} as const;
