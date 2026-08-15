import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Cloud, HardDrive, ArrowRight } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';

interface ConflictModalProps {
  isOpen: boolean;
  localData: UserTrackerData;
  remoteData: UserTrackerData;
  onResolve: (choice: 'local' | 'remote') => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  localData,
  remoteData,
  onResolve
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl rounded-3xl border border-amber-500/30 bg-neutral-950 p-6 shadow-2xl text-[var(--text-primary)]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Sync Conflict Detected</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Modifications were made locally while remote updates exist in cloud storage. Choose which version to keep.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {/* Local Version Card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-2">
                  <HardDrive className="w-4 h-4" />
                  <span>Your Local Version</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  Contains your recent offline or unsaved changes on this device.
                </p>
                <div className="text-[11px] space-y-1 text-neutral-400">
                  <div>Applications: {localData.jobApplications?.length || 0}</div>
                  <div>Work Shifts: {localData.workShifts?.length || 0}</div>
                  <div>Active Trades: {localData.paperTrading?.positions?.length || 0}</div>
                </div>
              </div>
              <button
                onClick={() => onResolve('local')}
                className="mt-6 w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Keep Local Version</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Remote Cloud Version Card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-2">
                  <Cloud className="w-4 h-4" />
                  <span>Cloud Remote Version</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  The latest version stored in your Firebase Firestore database.
                </p>
                <div className="text-[11px] space-y-1 text-neutral-400">
                  <div>Applications: {remoteData.jobApplications?.length || 0}</div>
                  <div>Work Shifts: {remoteData.workShifts?.length || 0}</div>
                  <div>Active Trades: {remoteData.paperTrading?.positions?.length || 0}</div>
                </div>
              </div>
              <button
                onClick={() => onResolve('remote')}
                className="mt-6 w-full py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Keep Cloud Version</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[var(--text-secondary)] text-center">
            Choosing a version will synchronize all connected devices and clear the sync conflict.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
