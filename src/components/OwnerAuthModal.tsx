import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertTriangle, 
  X, 
  LogIn, 
  CheckCircle2, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOwnerSecurity, MASTER_OWNER_EMAIL, MASTER_OWNER_NAME } from '../context/OwnerSecurityContext';

export const OwnerAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    pendingActionTitle, 
    unlockWithPin, 
    loginAsOwner 
  } = useOwnerSecurity();

  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isAuthModalOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('Please enter your 4-digit Master Owner PIN.');
      return;
    }
    const success = unlockWithPin(pinInput);
    if (!success) {
      setErrorMsg('Incorrect Master PIN. Access restricted to Workspace Owner.');
      setPinInput('');
    } else {
      setErrorMsg(null);
      setPinInput('');
    }
  };

  const handleGoogleOwnerLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const ok = await loginAsOwner();
      if (!ok) {
        setErrorMsg(`Signed in account is not the master owner (${MASTER_OWNER_EMAIL}). Edit/delete permissions remain locked.`);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Google authentication failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-950/20 overflow-hidden z-10 text-slate-900 dark:text-white"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Top Glow Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500" />
          
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Header Icon & Title */}
          <div className="flex items-start gap-3.5 mb-5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Owner Authorization Required</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold border border-amber-500/30">
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                This workspace is secured by <strong className="text-amber-700 dark:text-amber-300">manageme Executive Protection</strong>. Administrative permissions to edit, create, or delete records require authentication.
              </p>
            </div>
          </div>

          {/* Protected Action Notice */}
          {pendingActionTitle && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-3.5 py-2.5 rounded-xl bg-slate-100/80 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 flex items-center gap-2.5 text-xs text-slate-700 dark:text-neutral-300 backdrop-blur-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Requested Action: <strong className="text-slate-900 dark:text-white font-semibold">{pendingActionTitle}</strong>
              </span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 backdrop-blur-sm"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Primary Method 1: Enter Master PIN */}
          <form onSubmit={handlePinSubmit} className="space-y-3 mb-5 relative z-10">
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
              Enter Master Owner PIN
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setErrorMsg(null); }}
                  placeholder="Enter Master PIN"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/80 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-700/60 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 font-mono tracking-widest backdrop-blur-sm transition-colors"
                  autoFocus
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Authorize
              </motion.button>
            </div>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-neutral-800 w-full" />
            <span className="bg-white/90 dark:bg-neutral-950/80 px-3 text-[10px] uppercase tracking-wider text-slate-500 dark:text-neutral-500 font-mono">
              Or Authenticate via Google
            </span>
          </div>

          {/* Method 2: Google Sign-in */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleOwnerLogin}
            disabled={isLoggingIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white/80 dark:bg-neutral-900/80 hover:bg-slate-50 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700/60 text-slate-800 dark:text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 shadow-md backdrop-blur-sm"
          >
            <LogIn className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{isLoggingIn ? 'Verifying Credentials...' : `Sign in with Google (${MASTER_OWNER_EMAIL})`}</span>
          </motion.button>

          {/* Footer Security Badge */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-500">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Access Enforced
            </span>
            <span className="font-semibold text-slate-600 dark:text-neutral-400">manageme • Secure Workspace</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OwnerAuthModal;
