// Component: Lightweight Bottom-Right Toast Notification System

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Sparkles, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'sparkle';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {}
});

// Global Event Dispatcher Helper for Non-React contexts
export const toast = {
  show: (message: string, type: ToastType = 'info', duration = 3500) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type, duration } }));
    }
  },
  success: (message: string, duration = 3500) => toast.show(message, 'success', duration),
  error: (message: string, duration = 4000) => toast.show(message, 'error', duration),
  info: (message: string, duration = 3500) => toast.show(message, 'info', duration),
  warning: (message: string, duration = 3500) => toast.show(message, 'warning', duration)
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-3), { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const success = (message: string, duration?: number) => showToast(message, 'success', duration);
  const error = (message: string, duration?: number) => showToast(message, 'error', duration);
  const info = (message: string, duration?: number) => showToast(message, 'info', duration);
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Listen for global custom event toasts
  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const custom = e as CustomEvent<{ message: string; type?: ToastType; duration?: number }>;
      if (custom.detail?.message) {
        showToast(custom.detail.message, custom.detail.type || 'info', custom.detail.duration || 3500);
      }
    };

    window.addEventListener('app:toast', handleGlobalToast);
    return () => window.removeEventListener('app:toast', handleGlobalToast);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Floating Bottom-Right Toast Stack */}
      <div 
        className="fixed bottom-6 right-6 z-[120] flex flex-col-reverse gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`pointer-events-auto backdrop-blur-xl border p-3.5 rounded-2xl shadow-2xl flex items-start justify-between gap-3 text-xs font-sans transition-all ${
                t.type === 'error'
                  ? 'bg-[#1a070a]/95 border-rose-500/40 text-rose-200 shadow-rose-950/40'
                  : t.type === 'success'
                  ? 'bg-[#051a10]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
                  : t.type === 'warning'
                  ? 'bg-[#1f1604]/95 border-amber-500/40 text-amber-200 shadow-amber-950/40'
                  : 'bg-[#0b0c16]/95 border-white/15 text-slate-100 shadow-black/60'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                  {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {t.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                  {t.type === 'sparkle' && <Sparkles className="w-4 h-4 text-indigo-400" />}
                </div>

                <div className="min-w-0">
                  <p className="font-medium leading-relaxed break-words">{t.message}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export default ToastProvider;
