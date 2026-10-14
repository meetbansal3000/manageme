import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateLegal?: (page: 'privacy' | 'terms') => void;
  onSuccess?: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onNavigateLegal
}) => {
  const { signInAsGuest } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleGuestDemo = () => {
    signInAsGuest();
    showToast('✨ Initialized Guest Demo Workspace! Full dashboard access enabled.', 'sparkle', 3500);
    onClose();
  };

  const handleLegalClick = (e: React.MouseEvent, page: 'privacy' | 'terms') => {
    e.preventDefault();
    onClose();
    if (onNavigateLegal) {
      onNavigateLegal(page);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#${page}`;
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
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-white font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Rainbow Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-2 mb-6 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Authentication</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Sign in to manageme
            </h2>
            <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-xs mx-auto">
              Access your personal career pipeline, simulated trading terminal, and academic planner.
            </p>
          </div>

          {/* Primary Google OAuth Sign-in Button */}
          <div className="space-y-4">
            <GoogleAuthButton
              label="Continue with Google"
              variant="dark"
              onSuccess={onClose}
              className="py-3.5 text-sm font-bold shadow-lg"
            />

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-slate-950 px-3 text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-mono">
                or explore first
              </span>
            </div>

            {/* Guest Demo Option */}
            <button
              type="button"
              onClick={handleGuestDemo}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Launch Guest Demo Mode</span>
            </button>
          </div>

          {/* Footer Legal Terms & Privacy Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed">
              By continuing, you agree to manageme's{' '}
              <a
                href="#terms"
                onClick={(e) => handleLegalClick(e, 'terms')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Terms of Service
              </a>{' '}
              and acknowledge our{' '}
              <a
                href="#privacy"
                onClick={(e) => handleLegalClick(e, 'privacy')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              <Lock className="w-3 h-3" />
              <span>Google API Services User Data Policy Compliant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserAuthModal;
