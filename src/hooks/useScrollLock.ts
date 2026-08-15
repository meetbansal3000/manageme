import { useEffect } from 'react';

let lockCount = 0;
let originalStyle: string | null = null;

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      if (lockCount === 0) {
        originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
      }
      lockCount++;

      return () => {
        lockCount--;
        if (lockCount === 0 && originalStyle !== null) {
          document.body.style.overflow = originalStyle;
          originalStyle = null;
        }
      };
    }
  }, [isLocked]);
};
