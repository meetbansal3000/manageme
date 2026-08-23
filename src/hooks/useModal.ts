// Hook: Reusable Modal Dialogue State & Payload Controller

import { useState, useCallback } from 'react';

export interface UseModalReturn<T = any> {
  isOpen: boolean;
  payload: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

export function useModal<T = any>(initialState = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialState);
  const [payload, setPayload] = useState<T | null>(null);

  const open = useCallback((data?: T) => {
    if (data !== undefined) {
      setPayload(data);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPayload(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return { isOpen, payload, open, close, toggle };
}
