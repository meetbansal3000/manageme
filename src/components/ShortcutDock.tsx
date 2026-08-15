import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, ChevronUp, ChevronDown } from 'lucide-react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

interface ShortcutItem {
  keys: string[];
  label: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: [isMac ? '⌘' : 'Ctrl', 'K'], label: 'Command Palette' },
  { keys: ['Shift', 'T'], label: 'Toggle Theme' },
  { keys: ['Alt', '1-6'], label: 'Switch Workspace' },
  { keys: ['Esc'], label: 'Close Modals' },
  { keys: [isMac ? '⌘' : 'Ctrl', 'S'], label: 'Save' },
];

export const ShortcutDock: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('manageme_shortcut_dock_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('manageme_shortcut_dock_collapsed', String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 hidden md:block"
      id="keyboard-shortcut-dock"
    >
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="
              bg-white/90 dark:bg-zinc-900/90
              backdrop-blur-md
              border-t border-slate-200 dark:border-zinc-800
              text-slate-700 dark:text-zinc-300
              px-4 py-2
              flex items-center justify-between gap-4
              shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]
            "
          >
            {/* Shortcut list */}
            <div className="flex items-center gap-5 overflow-x-auto scrollbar-none flex-nowrap min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <Keyboard className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-semibold">
                  Shortcuts
                </span>
              </div>

              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 shrink-0" />

              {SHORTCUTS.map((shortcut, idx) => (
                <div key={idx} className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-0.5">
                    {shortcut.keys.map((key, kIdx) => (
                      <span key={kIdx} className="flex items-center">
                        <kbd
                          className="
                            inline-flex items-center justify-center
                            min-w-[22px] h-[22px] px-1.5
                            rounded-md
                            text-[11px] font-mono font-semibold leading-none
                            bg-slate-100 dark:bg-zinc-800
                            text-slate-600 dark:text-zinc-300
                            border border-slate-300 dark:border-zinc-600
                            shadow-[0_1px_0_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_rgba(0,0,0,0.3)]
                          "
                        >
                          {key}
                        </kbd>
                        {kIdx < shortcut.keys.length - 1 && (
                          <span className="text-[10px] text-slate-400 dark:text-zinc-600 mx-0.5 font-mono">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                    {shortcut.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="
                shrink-0 p-1 rounded-md
                hover:bg-slate-100 dark:hover:bg-zinc-800
                text-slate-400 dark:text-zinc-500
                transition-colors cursor-pointer
              "
              title="Collapse shortcut bar"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state — tiny expand button */}
      {isCollapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsCollapsed(false)}
          className="
            fixed bottom-3 right-3 z-40
            hidden md:flex items-center gap-1.5
            px-2.5 py-1.5 rounded-xl
            bg-white/80 dark:bg-zinc-900/80
            backdrop-blur-md
            border border-slate-200 dark:border-zinc-700
            text-slate-500 dark:text-zinc-400
            text-[10px] font-mono uppercase tracking-wider font-semibold
            hover:bg-slate-50 dark:hover:bg-zinc-800
            shadow-lg
            transition-all cursor-pointer
            active:scale-95
          "
          title="Show keyboard shortcuts"
        >
          <Keyboard className="w-3 h-3" />
          <ChevronUp className="w-3 h-3" />
        </motion.button>
      )}
    </div>
  );
};
