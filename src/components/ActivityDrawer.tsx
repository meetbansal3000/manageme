import React, { useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Clock, Briefcase, Receipt, BookOpen, Target } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { useScrollLock } from '../hooks/useScrollLock';
import { triggerHaptic, IOS_SPRING } from '../utils/haptics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userData: UserTrackerData;
}

export const ActivityDrawer: React.FC<Props> = ({ isOpen, onClose, userData }) => {
  useScrollLock(isOpen);

  const recentItems = useMemo(() => {
    const now = Date.now();
    const threshold = now - 24 * 60 * 60 * 1000; // 24 hours ago

    const items: Array<{ id: string; type: string; title: string; subtitle: string; timestamp: number; icon: any }> = [];

    (userData.workShifts || []).forEach(s => {
      const ts = s.timestamp || new Date(s.date).getTime();
      if (ts >= threshold) {
        items.push({ id: s.id, type: 'Work Shift', title: `${s.hours} hrs`, subtitle: s.date, timestamp: ts, icon: Briefcase });
      }
    });

    (userData.expenses || []).forEach(e => {
      const ts = e.timestamp || new Date(e.date).getTime();
      if (ts >= threshold) {
        items.push({ id: e.id, type: 'Expense', title: `${userData.currency === 'USD' ? '$' : userData.currency === 'INR' ? '₹' : '£'}${e.amount}`, subtitle: e.category, timestamp: ts, icon: Receipt });
      }
    });

    (userData.uniClasses || []).forEach(c => {
      // UniClasses don't have a date by default, just dayOfWeek, so if they lack timestamp, we skip or guess
      const ts = c.timestamp || 0;
      if (ts >= threshold) {
        items.push({ id: c.id, type: 'Class', title: c.moduleName, subtitle: c.type, timestamp: ts, icon: BookOpen });
      }
    });

    (userData.skillsTracker || []).forEach(s => {
      const ts = s.timestamp || 0;
      if (ts >= threshold) {
        items.push({ id: s.id, type: 'Task', title: s.name, subtitle: s.category, timestamp: ts, icon: Target });
      }
    });

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [userData]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" onClick={onClose} />
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.8, right: 0 }}
        onDragEnd={(_: any, info: PanInfo) => {
          if (info.offset.x > 100 || info.velocity.x > 200) {
            triggerHaptic(15);
            onClose();
          }
        }}
        transition={IOS_SPRING}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-[var(--bg)] border-l border-[var(--border)] shadow-2xl z-[100] flex flex-col"
      >
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-solid)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--accent)]" />
            Recently Added
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[rgba(128,128,128,0.1)] rounded-full transition-colors text-[var(--text-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div data-lenis-prevent="true" className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 custom-scrollbar">
          {recentItems.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm text-center mt-10">No items added in the last 24 hours.</p>
          ) : (
            recentItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="glass-panel p-3 rounded-xl border border-[var(--border)] flex items-center gap-3">
                  <div className="p-2 bg-[rgba(128,128,128,0.1)] rounded-lg text-[var(--accent)]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{item.type}</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{item.subtitle}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </>
  );
};
