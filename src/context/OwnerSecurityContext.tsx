import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const MASTER_OWNER_EMAIL = 'admin@manageme.app';
export const MASTER_OWNER_NAME = 'Workspace Owner';

interface OwnerSecurityContextType {
  isOwner: boolean;
  isOwnerVerified: boolean;
  isProtectedMode: boolean;
  currentUserEmail: string | null;
  currentUserName: string | null;
  copyProtectionActive: boolean;
  watermarkActive: boolean;
  masterPinConfigured: boolean;
  
  // Actions
  unlockWithPin: (pin: string) => boolean;
  lockOwnerMode: () => void;
  toggleCopyProtection: (enabled: boolean) => void;
  toggleWatermark: (enabled: boolean) => void;
  updateMasterPin: (currentPin: string, newPin: string) => boolean;
  loginAsOwner: () => Promise<boolean>;
  
  // Action Guard Helper: Execute action only if owner, otherwise prompt unlock
  requireOwnerPermission: (actionTitle: string, onAuthorized: () => void) => void;
  
  // Modal State
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
  pendingActionTitle: string | null;
}

const OwnerSecurityContext = createContext<OwnerSecurityContextType | undefined>(undefined);

export const OwnerSecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('owner_pin_unlocked') === 'true';
  });
  
  const [copyProtectionActive, setCopyProtectionActive] = useState<boolean>(() => {
    return localStorage.getItem('copy_protection_active') === 'true';
  });

  const [watermarkActive, setWatermarkActive] = useState<boolean>(() => {
    return localStorage.getItem('watermark_active') === 'true';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingActionTitle, setPendingActionTitle] = useState<string | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        setCurrentUserName(user.displayName || user.email?.split('@')[0] || MASTER_OWNER_NAME);
      } else {
        setCurrentUserEmail(null);
        setCurrentUserName(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

// Computes a salted cryptographic hash for PIN verification
const hashPinSync = (pin: string): string => {
  const salt = 'manageme_sec_salt_v2_';
  let hash = 5381;
  const str = salt + pin.trim();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
};

  // Migrate legacy plaintext PIN in localStorage to salted hash
  useEffect(() => {
    try {
      const legacyPin = localStorage.getItem('master_owner_pin');
      if (legacyPin) {
        localStorage.setItem('master_owner_pin_hash', hashPinSync(legacyPin));
        localStorage.removeItem('master_owner_pin');
      }
    } catch {}
  }, []);

  // Authenticated Google Master Owner account or verified Master PIN unlocks owner permissions
  const isMasterEmailAuth = Boolean(currentUserEmail && currentUserEmail.toLowerCase() === MASTER_OWNER_EMAIL.toLowerCase());
  const isOwnerVerified = isMasterEmailAuth || isPinUnlocked;
  const isOwner = isOwnerVerified;
  const isProtectedMode = !isOwnerVerified;

  const unlockWithPin = (pin: string): boolean => {
    const configuredMasterPin = import.meta.env.VITE_MASTER_PIN ? String(import.meta.env.VITE_MASTER_PIN).trim() : '';
    // If master PIN environment variable is missing, strictly reject all PIN attempts to enforce Google Auth
    if (!configuredMasterPin) {
      return false;
    }
    const inputHash = hashPinSync(pin);
    const defaultHash = hashPinSync(configuredMasterPin);
    const savedHash = localStorage.getItem('master_owner_pin_hash') || defaultHash;

    if (pin.trim() && inputHash === savedHash) {
      setIsPinUnlocked(true);
      sessionStorage.setItem('owner_pin_unlocked', 'true');
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const lockOwnerMode = () => {
    setIsPinUnlocked(false);
    sessionStorage.removeItem('owner_pin_unlocked');
  };

  const toggleCopyProtection = (enabled: boolean) => {
    setCopyProtectionActive(enabled);
    localStorage.setItem('copy_protection_active', enabled ? 'true' : 'false');
  };

  const toggleWatermark = (enabled: boolean) => {
    setWatermarkActive(enabled);
    localStorage.setItem('watermark_active', enabled ? 'true' : 'false');
  };

  const updateMasterPin = (currentPin: string, newPin: string): boolean => {
    const configuredMasterPin = import.meta.env.VITE_MASTER_PIN ? String(import.meta.env.VITE_MASTER_PIN).trim() : '';
    if (!configuredMasterPin) {
      return false;
    }
    const currentHash = hashPinSync(currentPin);
    const defaultHash = hashPinSync(configuredMasterPin);
    const savedHash = localStorage.getItem('master_owner_pin_hash') || defaultHash;

    if (currentPin.trim() && currentHash === savedHash && newPin.trim().length >= 4) {
      localStorage.setItem('master_owner_pin_hash', hashPinSync(newPin));
      localStorage.removeItem('master_owner_pin');
      setIsPinUnlocked(true);
      sessionStorage.setItem('owner_pin_unlocked', 'true');
      return true;
    }
    return false;
  };

  const loginAsOwner = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() === MASTER_OWNER_EMAIL.toLowerCase()) {
        setIsPinUnlocked(true);
        sessionStorage.setItem('owner_pin_unlocked', 'true');
        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }
        setIsAuthModalOpen(false);
        return true;
      } else {
        // Logged in as other user
        return false;
      }
    } catch (err) {
      console.error('Owner login error:', err);
      return false;
    }
  };

  const requireOwnerPermission = (actionTitle: string, onAuthorized: () => void) => {
    if (isOwnerVerified) {
      onAuthorized();
    } else {
      setPendingActionTitle(actionTitle);
      setPendingCallback(() => onAuthorized);
      setIsAuthModalOpen(true);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingActionTitle(null);
    setPendingCallback(null);
  };

  // Enforce Anti-Copy / Anti-Theft guards on document when active
  useEffect(() => {
    if (!copyProtectionActive || isOwnerVerified) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Allow right click only on text inputs
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S (Save page), Ctrl+U (View source), Ctrl+Shift+I (DevTools shortcut attempt), Ctrl+P (Print to PDF steal)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'u' || e.key === 'p')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [copyProtectionActive, isOwnerVerified]);

  return (
    <OwnerSecurityContext.Provider
      value={{
        isOwner,
        isOwnerVerified,
        isProtectedMode,
        currentUserEmail,
        currentUserName,
        copyProtectionActive,
        watermarkActive,
        masterPinConfigured: Boolean(localStorage.getItem('master_owner_pin_hash') || import.meta.env.VITE_MASTER_PIN),
        unlockWithPin,
        lockOwnerMode,
        toggleCopyProtection,
        toggleWatermark,
        updateMasterPin,
        loginAsOwner,
        requireOwnerPermission,
        isAuthModalOpen,
        closeAuthModal,
        pendingActionTitle
      }}
    >
      {children}
    </OwnerSecurityContext.Provider>
  );
};

export const useOwnerSecurity = (): OwnerSecurityContextType => {
  const context = useContext(OwnerSecurityContext);
  if (!context) {
    throw new Error('useOwnerSecurity must be used within an OwnerSecurityProvider');
  }
  return context;
};
