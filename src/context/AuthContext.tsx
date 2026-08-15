import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleSignIn, logout, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DeviceSession, getCurrentDeviceSession } from '../utils/deviceFingerprint';
import { signOutSupabase } from '../lib/supabase';

const MAX_ALLOWED_DEVICES = 2;
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

export interface AuthContextUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  isGuest?: boolean;
  emailVerified?: boolean;
}

// Fallback Demo / Guest User for Offline / Local Testing
export const DEMO_GUEST_USER: AuthContextUser = {
  uid: 'guest-demo-executive',
  displayName: 'Guest Executive',
  email: 'guest@manageme.internal',
  photoURL: null,
  isAnonymous: true,
  isGuest: true,
  emailVerified: true
};

interface AuthContextType {
  user: User | AuthContextUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  authError: string | null;
  currentDevice: DeviceSession;
  activeSessions: DeviceSession[];
  isDeviceBlocked: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  revokeSession: (deviceId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;
  dismissDeviceLimitModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AuthContextUser | null>(() => {
    // Check if guest mode was previously active
    try {
      const isGuestSaved = localStorage.getItem('manageme_guest_session');
      if (isGuestSaved === 'true') {
        return DEMO_GUEST_USER;
      }
    } catch {}
    return null;
  });
  
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('manageme_guest_session') === 'true';
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceSession>(() => getCurrentDeviceSession());
  const [activeSessions, setActiveSessions] = useState<DeviceSession[]>([]);
  const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);

  const getStorageKey = (uid: string) => `manageme_user_active_sessions_${uid}`;

  // Clean expired sessions (> 30 days)
  const cleanExpiredSessions = (sessions: DeviceSession[]): DeviceSession[] => {
    const now = Date.now();
    return sessions.filter(s => (now - s.lastActive) < SESSION_EXPIRY_MS);
  };

  // Sync sessions to persistent local storage & Firestore
  const persistSessions = useCallback(async (uid: string, sessions: DeviceSession[]) => {
    if (uid === DEMO_GUEST_USER.uid) return; // Do not persist guest device limits to Firestore
    const cleaned = cleanExpiredSessions(sessions);
    try {
      localStorage.setItem(getStorageKey(uid), JSON.stringify(cleaned));
      localStorage.setItem('user_active_sessions', JSON.stringify(cleaned));
      
      // Sync to Firestore if available
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          activeSessions: cleaned,
          lastActiveDeviceId: currentDevice.deviceId,
          lastActiveTimestamp: Date.now()
        }, { merge: true });
      } catch (err: any) {
        console.error('[Auth Error - Firestore Session Sync]:', err?.message || err);
      }
    } catch (e: any) {
      console.error('[Auth Error - Persisting Active Sessions]:', e?.message || e);
    }
  }, [currentDevice.deviceId]);

  // Load sessions for user from LocalStorage / Firestore
  const loadSessions = useCallback(async (uid: string): Promise<DeviceSession[]> => {
    if (uid === DEMO_GUEST_USER.uid) return [];
    let list: DeviceSession[] = [];
    try {
      const local = localStorage.getItem(getStorageKey(uid)) || localStorage.getItem('user_active_sessions');
      if (local) {
        list = JSON.parse(local);
      }
    } catch (e: any) {
      console.error('[Auth Error - Loading Local Sessions]:', e?.message || e);
    }

    // Try fetching from Firestore
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists() && Array.isArray(snap.data()?.activeSessions)) {
        list = snap.data()?.activeSessions;
      }
    } catch (err: any) {
      console.warn('[Auth Warning - Firestore Load Sessions]:', err?.message || err);
    }

    return cleanExpiredSessions(list);
  }, []);

  // Register or Verify Current Device
  const evaluateDeviceSession = useCallback(async (firebaseUser: User | AuthContextUser) => {
    if (firebaseUser.uid === DEMO_GUEST_USER.uid) {
      setIsDeviceBlocked(false);
      return;
    }

    const freshDevice = getCurrentDeviceSession();
    setCurrentDevice(freshDevice);

    const existingSessions = await loadSessions(firebaseUser.uid);
    const isAlreadyRegistered = existingSessions.some(s => s.deviceId === freshDevice.deviceId);

    if (isAlreadyRegistered) {
      // Update lastActive timestamp
      const updated = existingSessions.map(s => 
        s.deviceId === freshDevice.deviceId ? { ...s, lastActive: Date.now(), deviceName: freshDevice.deviceName } : s
      );
      setActiveSessions(updated);
      setIsDeviceBlocked(false);
      await persistSessions(firebaseUser.uid, updated);
    } else {
      // Check device count limit
      if (existingSessions.length >= MAX_ALLOWED_DEVICES) {
        // Block this new device
        setActiveSessions(existingSessions);
        setIsDeviceBlocked(true);
      } else {
        // Register this new device
        const updated = [freshDevice, ...existingSessions];
        setActiveSessions(updated);
        setIsDeviceBlocked(false);
        await persistSessions(firebaseUser.uid, updated);
      }
    }
  }, [loadSessions, persistSessions]);

  useEffect(() => {
    let isSubscribed = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isSubscribed) return;

      if (currentUser) {
        setUser(currentUser);
        setIsGuest(false);
        try {
          localStorage.removeItem('manageme_guest_session');
        } catch {}
        await evaluateDeviceSession(currentUser);
      } else {
        // Check if guest mode is active
        try {
          const isGuestSaved = localStorage.getItem('manageme_guest_session') === 'true';
          if (isGuestSaved) {
            setUser(DEMO_GUEST_USER);
            setIsGuest(true);
            setIsDeviceBlocked(false);
          } else {
            setUser(null);
            setIsGuest(false);
            setActiveSessions([]);
            setIsDeviceBlocked(false);
          }
        } catch {
          setUser(null);
          setIsGuest(false);
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error('[Auth Error - Firebase Auth State]:', error.message, error);
      setAuthError(error.message);
      setIsLoading(false);
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [evaluateDeviceSession]);

  // Cross-Tab Session Synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (user && (e.key === getStorageKey(user.uid) || e.key === 'user_active_sessions')) {
        if (e.newValue) {
          try {
            const updatedSessions: DeviceSession[] = JSON.parse(e.newValue);
            setActiveSessions(updatedSessions);
            const isPresent = updatedSessions.some(s => s.deviceId === currentDevice.deviceId);
            if (!isPresent && updatedSessions.length >= MAX_ALLOWED_DEVICES) {
              setIsDeviceBlocked(true);
            } else {
              setIsDeviceBlocked(false);
            }
          } catch (err: any) {
            console.error('[Auth Error - Storage Sync Parse]:', err?.message || err);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, currentDevice.deviceId]);

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setAuthError(null);
      const result = await googleSignIn();
      if (result?.user) {
        setUser(result.user);
        setIsGuest(false);
        try {
          localStorage.removeItem('manageme_guest_session');
        } catch {}
        await evaluateDeviceSession(result.user);
        return true;
      }
      return false;
    } catch (error: any) {
      const errorCode = error?.code || '';
      const rawMessage = error?.message || '';
      let userFriendlyMsg = 'Google Sign-In failed. Please try again.';
      
      if (errorCode === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        userFriendlyMsg = `Domain '${domain}' authorization in progress. Please retry or continue in Demo Mode.`;
      } else if (errorCode === 'auth/popup-blocked') {
        userFriendlyMsg = 'Sign-in popup was blocked by browser. Please allow popups and try again.';
      } else if (errorCode === 'auth/popup-closed-by-user') {
        userFriendlyMsg = 'Sign-in was cancelled before completing.';
      } else if (errorCode === 'auth/network-request-failed' || rawMessage.toLowerCase().includes('network') || rawMessage.toLowerCase().includes('cors')) {
        userFriendlyMsg = 'Network connection issue. Please check your internet connection.';
      } else if (errorCode === 'auth/cancelled-popup-request') {
        userFriendlyMsg = 'Only one sign-in window allowed at a time.';
      }

      console.error('[Auth Error - Google Sign In]:', errorCode, error?.message || error);
      setAuthError(userFriendlyMsg);
      return false;
    }
  };

  const signInAsGuest = () => {
    try {
      localStorage.setItem('manageme_guest_session', 'true');
    } catch {}
    setUser(DEMO_GUEST_USER);
    setIsGuest(true);
    setIsDeviceBlocked(false);
    setActiveSessions([]);
    console.info('[Auth]: Activated Guest / Demo Workspace Mode');
  };

  const signOut = async (): Promise<void> => {
    try {
      if (user && !isGuest) {
        // Remove current device from registered sessions
        const updated = activeSessions.filter(s => s.deviceId !== currentDevice.deviceId);
        await persistSessions(user.uid, updated);
      }
      
      try {
        localStorage.removeItem('manageme_guest_session');
      } catch {}

      await logout();
      await signOutSupabase();
      
      setUser(null);
      setIsGuest(false);
      setActiveSessions([]);
      setIsDeviceBlocked(false);
    } catch (err: any) {
      console.error('[Auth Error - Sign Out]:', err?.message || err);
    }
  };

  const revokeSession = async (targetDeviceId: string): Promise<void> => {
    if (!user || isGuest) return;

    try {
      // Filter out revoked device
      const remaining = activeSessions.filter(s => s.deviceId !== targetDeviceId);

      // If current device was blocked, we now have a free slot -> register current device
      let updated = remaining;
      if (isDeviceBlocked && !remaining.some(s => s.deviceId === currentDevice.deviceId)) {
        const fresh = getCurrentDeviceSession();
        updated = [fresh, ...remaining];
        setIsDeviceBlocked(false);
      }

      setActiveSessions(updated);
      await persistSessions(user.uid, updated);
    } catch (err: any) {
      console.error('[Auth Error - Revoke Session]:', err?.message || err);
    }
  };

  const revokeOtherSessions = async (): Promise<void> => {
    if (!user || isGuest) return;
    try {
      const fresh = getCurrentDeviceSession();
      const updated = [fresh];
      setActiveSessions(updated);
      setIsDeviceBlocked(false);
      await persistSessions(user.uid, updated);
    } catch (err: any) {
      console.error('[Auth Error - Revoke Other Sessions]:', err?.message || err);
    }
  };

  const dismissDeviceLimitModal = () => {
    setIsDeviceBlocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        authError,
        currentDevice,
        activeSessions,
        isDeviceBlocked,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        revokeSession,
        revokeOtherSessions,
        dismissDeviceLimitModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

