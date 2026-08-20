import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { signInWithSupabaseOAuth, isSupabaseConfigured } from '../../lib/supabase';

interface GoogleAuthButtonProps {
  label?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export const GoogleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  className = '',
  variant = 'glass',
  onSuccess,
  onError
}) => {
  const { signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        showToast('Redirecting to Google Secure Authentication...', 'info', 2500);
        await signInWithSupabaseOAuth('google');
      } else {
        showToast('Connecting to Google Identity Services...', 'info', 2000);
        const success = await signInWithGoogle();
        if (success) {
          showToast('Signed in successfully with Google!', 'success');
          onSuccess?.();
        } else {
          showToast('Google authentication could not be completed.', 'warning');
        }
      }
    } catch (err: any) {
      console.error('[Google OAuth Error]:', err);
      showToast(err?.message || 'Google sign-in encountered an error.', 'error');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    light: 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-700 shadow-md',
    glass: 'bg-white/80 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/20 backdrop-blur-xl shadow-card-base hover:shadow-card-hover'
  }[variant];

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      onClick={handleSignIn}
      disabled={loading}
      className={`relative w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl font-sans font-semibold text-sm transition-all duration-200 ease-out cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles} ${className}`}
      id="googleOAuthSignInBtn"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      ) : (
        <GoogleLogoIcon className="w-5 h-5 shrink-0" />
      )}
      <span className="truncate">{loading ? 'Connecting to Google...' : label}</span>
    </motion.button>
  );
};
