import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, googleSignIn, logout, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { DeviceSession, getCurrentDeviceSession, getOrCreateDeviceId } from '../utils/deviceFingerprint';

const MAX_ALLOWED_DEVICES = 2;
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentDevice: DeviceSession;
  activeSessions: DeviceSession[];
  isDeviceBlocked: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  revokeSession: (deviceId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;
  dismissDeviceLimitModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      } catch (err) {
        // Firestore sync is optional/best-effort
        console.warn('Firestore session sync warning:', err);
      }
    } catch (e) {
      console.error('Error persisting active device sessions:', e);
    }
  }, [currentDevice.deviceId]);

  // Load sessions for user from LocalStorage / Firestore
  const loadSessions = useCallback(async (uid: string): Promise<DeviceSession[]> => {
    let list: DeviceSession[] = [];
    try {
      const local = localStorage.getItem(getStorageKey(uid)) || localStorage.getItem('user_active_sessions');
      if (local) {
        list = JSON.parse(local);
      }
    } catch (e) {
      console.error(e);
    }

    // Try fetching from Firestore
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists() && Array.isArray(snap.data()?.activeSessions)) {
        list = snap.data()?.activeSessions;
      }
    } catch {}

    return cleanExpiredSessions(list);
  }, []);

  // Register or Verify Current Device
  const evaluateDeviceSession = useCallback(async (firebaseUser: User) => {
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await evaluateDeviceSession(currentUser);
      } else {
        setActiveSessions([]);
        setIsDeviceBlocked(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
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
          } catch {}
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, currentDevice.deviceId]);

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await googleSignIn();
      if (result?.user) {
        await evaluateDeviceSession(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    if (user) {
      // Remove current device from registered sessions
      const updated = activeSessions.filter(s => s.deviceId !== currentDevice.deviceId);
      await persistSessions(user.uid, updated);
    }
    await logout();
    setUser(null);
    setActiveSessions([]);
    setIsDeviceBlocked(false);
  };

  const revokeSession = async (targetDeviceId: string): Promise<void> => {
    if (!user) return;

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
  };

  const revokeOtherSessions = async (): Promise<void> => {
    if (!user) return;
    const fresh = getCurrentDeviceSession();
    const updated = [fresh];
    setActiveSessions(updated);
    setIsDeviceBlocked(false);
    await persistSessions(user.uid, updated);
  };

  const dismissDeviceLimitModal = () => {
    setIsDeviceBlocked(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        currentDevice,
        activeSessions,
        isDeviceBlocked,
        signInWithGoogle,
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
