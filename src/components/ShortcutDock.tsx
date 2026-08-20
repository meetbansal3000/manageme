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
              bg-black/80
              backdrop-blur-2xl
              border-t border-white/10
              text-white
              px-4 py-2
              flex items-center justify-between gap-4
              shadow-[0_-2px_12px_rgba(0,0,0,0.6)]
            "
          >
            {/* Shortcut list */}
            <div className="flex items-center gap-5 overflow-x-auto scrollbar-none flex-nowrap min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <Keyboard className="w-3.5 h-3.5 text-[#8B95A5]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8B95A5] font-semibold">
                  Shortcuts
                </span>
              </div>

              <div className="w-px h-4 bg-white/10 shrink-0" />

              {SHORTCUTS.map((shortcut, idx) => (
                <div key={idx} className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-0.5">
                    {shortcut.keys.map((key, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="
                          px-1.5 py-0.5
                          text-[10px] font-mono font-semibold
                          bg-white/10
                          border border-white/10
                          rounded-md
                          text-white
                          shadow-xs
                        "
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-[11px] font-sans text-[#8B95A5]">
                    {shortcut.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="
                p-1 rounded-lg
                text-[#8B95A5] hover:text-white
                hover:bg-white/10
                transition-colors cursor-pointer shrink-0
              "
              title="Collapse shortcut bar"
              aria-label="Collapse shortcut bar"
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
            bg-black/80
            backdrop-blur-md
            border border-white/10
            text-white
            text-[10px] font-mono uppercase tracking-wider font-semibold
            hover:bg-white/10
            shadow-lg
            transition-all cursor-pointer
            active:scale-95
          "
          title="Show keyboard shortcuts"
        >
          <Keyboard className="w-3 h-3 text-[#0052FF]" />
          <ChevronUp className="w-3 h-3 text-[#8B95A5]" />
        </motion.button>
      )}
    </div>
  );
};
