import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow: string | null = null;
let originalTouchAction: string | null = null;

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      if (lockCount === 0) {
        originalOverflow = document.body.style.overflow || window.getComputedStyle(document.body).overflow;
        originalTouchAction = document.body.style.touchAction || window.getComputedStyle(document.body).touchAction;
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      }
      lockCount++;

      return () => {
        lockCount--;
        if (lockCount <= 0) {
          lockCount = 0;
          document.body.style.overflow = originalOverflow && originalOverflow !== 'hidden' ? originalOverflow : 'unset';
          document.body.style.touchAction = originalTouchAction && originalTouchAction !== 'none' ? originalTouchAction : 'unset';
          originalOverflow = null;
          originalTouchAction = null;
        }
      };
    }
  }, [isLocked]);
};
