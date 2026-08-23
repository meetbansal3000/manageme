// Component: Owner Authorization & PIN Verification Modal

import React, { useState } from 'react';
import { Lock, KeyRound, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useOwnerSecurity, MASTER_OWNER_EMAIL } from '../../context/OwnerSecurityContext';
import { GoogleLogoIcon } from '../auth/GoogleAuthButton';
import { ModalWrapper } from './ModalWrapper';
import { Button } from '../ui/Button';

export interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = () => {
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
    <ModalWrapper
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="md"
      title="Owner Authorization Required"
      subtitle="Administrative permissions require master owner verification."
      icon={<Lock className="w-5 h-5" />}
    >
      {pendingActionTitle && (
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Requested Action: <strong>{pendingActionTitle}</strong></span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePinSubmit} className="space-y-3 mb-5">
        <label className="block text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
          Master PIN
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              maxLength={8}
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setErrorMsg(null); }}
              placeholder="Enter PIN"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] font-mono tracking-widest"
              autoFocus
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Authorize
          </Button>
        </div>
      </form>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-white/10 w-full" />
        <span className="bg-[#0D0B18] px-3 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
          Or Authenticate via Google
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleOwnerLogin}
        isLoading={isLoggingIn}
        leftIcon={<GoogleLogoIcon className="w-4 h-4 shrink-0" />}
        className="w-full justify-center"
      >
        Sign in with Google ({MASTER_OWNER_EMAIL})
      </Button>

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Protected
        </span>
        <span>manageme Executive</span>
      </div>
    </ModalWrapper>
  );
};

export default AuthModal;
