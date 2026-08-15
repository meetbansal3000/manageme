import { useEffect } from 'react';

/**
 * Global keyboard shortcut hook for manageme.
 * Binds Ctrl+K (command palette), Shift+T (theme toggle),
 * Alt+1-6 (workspace switching), Esc (close modals),
 * and Ctrl+S (save).
 * 
 * Shortcuts are suppressed when the user is typing inside
 * an <input>, <textarea>, or contentEditable element.
 */

interface UseGlobalShortcutsOptions {
  onOpenCommandPalette: () => void;
  onToggleTheme: () => void;
  onSwitchTab: (tab: string) => void;
  onCloseModals: () => void;
  onSave: () => void;
}

const TAB_MAP: Record<string, string> = {
  '1': 'landing',
  '2': 'study',
  '3': 'finance',
  '4': 'outreach',
  '5': 'uni',
  '6': 'trading',
};

function isEditableTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  if (!target) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useGlobalShortcuts(options: UseGlobalShortcutsOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K — Command Palette (always active, even in inputs)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        options.onOpenCommandPalette();
        return;
      }

      // Escape — Close modals (always active)
      if (e.key === 'Escape') {
        options.onCloseModals();
        return;
      }

      // Skip remaining shortcuts when inside editable fields
      if (isEditableTarget(e)) return;

      // Shift + T — Toggle theme
      if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && e.key === 'T') {
        e.preventDefault();
        options.onToggleTheme();
        return;
      }

      // Alt + 1-6 — Switch workspace tabs
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const tab = TAB_MAP[e.key];
        if (tab) {
          e.preventDefault();
          options.onSwitchTab(tab);
          return;
        }
      }

      // Ctrl + S — Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        options.onSave();
        return;
      }
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [options]);
}
