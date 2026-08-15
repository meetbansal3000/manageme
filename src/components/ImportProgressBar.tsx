import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, FileText, CheckCircle2, Cpu } from 'lucide-react';

interface ImportProgressBarProps {
  isProcessing: boolean;
  progress: number;
  stepMessage: string;
  fileName?: string;
  title?: string;
  onCancel?: () => void;
}

export const ImportProgressBar: React.FC<ImportProgressBarProps> = ({
  isProcessing,
  progress,
  stepMessage,
  fileName,
  title = "AI Document & Vision Processing Engine",
  onCancel
}) => {
  if (!isProcessing) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="w-full max-w-md bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-black border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{title}</span>
              </h3>
              {fileName && (
                <p className="text-xs text-neutral-400 truncate max-w-[260px] flex items-center gap-1.5 mt-0.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{fileName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Multimodal Pipeline</span>
              </span>
              <span className="text-emerald-400 font-bold text-sm">{progress}%</span>
            </div>

            {/* Track */}
            <div className="w-full h-3 bg-neutral-800/80 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Step Message */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            <p className="text-xs text-neutral-200 font-medium leading-tight">
              {stepMessage || 'Processing document details...'}
            </p>
          </div>

          {/* Footer note / cancel */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500 font-mono">
            <span>Powered by Gemini Vision / Doc API</span>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-neutral-400 hover:text-white underline transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
