import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, googleSignIn, logout, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DeviceSession, getCurrentDeviceSession } from '../utils/deviceFingerprint';
import { supabase, signOutSupabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

const MAX_ALLOWED_DEVICES = 2;

export interface AuthContextUser {
  uid: string;
  id?: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  isGuest?: boolean;
  emailVerified?: boolean;
  user_metadata?: Record<string, any>;
}

// Fallback Demo / Guest User for Offline / Local Testing
export const DEMO_GUEST_USER: AuthContextUser = {
  uid: 'guest-demo-executive',
  id: 'guest-demo-executive',
  displayName: 'Guest Executive',
  email: 'guest@manageme.internal',
  photoURL: null,
  isAnonymous: true,
  isGuest: true,
  emailVerified: true,
  user_metadata: { full_name: 'Guest Executive' }
};

interface AuthContextType {
  user: User | AuthContextUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  authError: string | null;
  currentDevice: DeviceSession;
  activeSessions: DeviceSession[];
  isDeviceBlocked: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signInWithSupabase: (provider?: 'google' | 'github') => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  revokeSession: (deviceId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;
  dismissDeviceLimitModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | AuthContextUser | null>(() => {
    // Initial synchronous read from localStorage for instant cache rehydration
    try {
      const isGuestSaved = localStorage.getItem('manageme_guest_session');
      if (isGuestSaved === 'true') {
        return DEMO_GUEST_USER;
      }
      const savedProfile = localStorage.getItem('manageme_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.id || parsed.uid) {
          return {
            uid: parsed.id || parsed.uid,
            id: parsed.id || parsed.uid,
            displayName: parsed.name || parsed.displayName || 'User',
            email: parsed.email || null,
            photoURL: parsed.avatar || parsed.photoURL || null,
            isGuest: false,
            emailVerified: true
          };
        }
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

  // Start with isLoading = true while we verify persistent session with Supabase/Firebase
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceSession>(() => getCurrentDeviceSession());
  const [activeSessions, setActiveSessions] = useState<DeviceSession[]>([]);
  const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);

  const getStorageKey = (uid: string) => `manageme_user_active_sessions_${uid}`;

  // Keep all sessions intact indefinitely unless manually revoked (manual logout only, no auto-expiry)
  const persistSessions = useCallback(async (uid: string, sessions: DeviceSession[]) => {
    if (uid === DEMO_GUEST_USER.uid) return;
    try {
      localStorage.setItem(getStorageKey(uid), JSON.stringify(sessions));
      localStorage.setItem('user_active_sessions', JSON.stringify(sessions));
      
      // Sync to Firestore if available
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          activeSessions: sessions,
          lastActiveDeviceId: currentDevice.deviceId,
          lastActiveTimestamp: Date.now()
        }, { merge: true });
      } catch (err: any) {
        console.warn('[Auth Notice - Firestore Session Sync]:', err?.message || err);
      }
    } catch (e: any) {
      console.warn('[Auth Notice - Persisting Active Sessions]:', e?.message || e);
    }
  }, [currentDevice.deviceId]);

  const loadSessions = useCallback(async (uid: string): Promise<DeviceSession[]> => {
    if (uid === DEMO_GUEST_USER.uid) return [];
    let list: DeviceSession[] = [];
    try {
      const local = localStorage.getItem(getStorageKey(uid)) || localStorage.getItem('user_active_sessions');
      if (local) {
        list = JSON.parse(local);
      }
    } catch (e: any) {
      console.warn('[Auth Notice - Loading Local Sessions]:', e?.message || e);
    }

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists() && Array.isArray(snap.data()?.activeSessions)) {
        list = snap.data()?.activeSessions;
      }
    } catch (err: any) {
      console.warn('[Auth Notice - Firestore Load Sessions]:', err?.message || err);
    }

    return list;
  }, []);

  const evaluateDeviceSession = useCallback(async (authUser: User | AuthContextUser) => {
    const uid = authUser.uid || (authUser as any).id;
    if (!uid || uid === DEMO_GUEST_USER.uid) {
      setIsDeviceBlocked(false);
      return;
    }

    const freshDevice = getCurrentDeviceSession();
    setCurrentDevice(freshDevice);

    const existingSessions = await loadSessions(uid);
    const isAlreadyRegistered = existingSessions.some(s => s.deviceId === freshDevice.deviceId);

    if (isAlreadyRegistered) {
      const updated = existingSessions.map(s => 
        s.deviceId === freshDevice.deviceId ? { ...s, lastActive: Date.now(), deviceName: freshDevice.deviceName } : s
      );
      setActiveSessions(updated);
      setIsDeviceBlocked(false);
      await persistSessions(uid, updated);
    } else {
      if (existingSessions.length >= MAX_ALLOWED_DEVICES) {
        setActiveSessions(existingSessions);
        setIsDeviceBlocked(true);
      } else {
        const updated = [freshDevice, ...existingSessions];
        setActiveSessions(updated);
        setIsDeviceBlocked(false);
        await persistSessions(uid, updated);
      }
    }
  }, [loadSessions, persistSessions]);

  // Map Supabase User to AuthContextUser
  const mapSupabaseUser = (sbUser: SupabaseUser): AuthContextUser => {
    return {
      uid: sbUser.id,
      id: sbUser.id,
      email: sbUser.email ?? null,
      displayName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
      photoURL: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null,
      isGuest: false,
      user_metadata: sbUser.user_metadata,
      emailVerified: Boolean(sbUser.email_confirmed_at)
    };
  };

  // Primary Session Rehydration & Listener Setup
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Check Supabase Persistent Session
        const { data: { session: initialSession }, error: sbError } = await supabase.auth.getSession();
        
        if (sbError) {
          console.warn('[Supabase Auth Rehydrate]: getSession error:', sbError.message);
        }

        if (initialSession?.user && isMounted) {
          console.info('[Supabase Auth Rehydrate]: Found persistent session for user:', initialSession.user.id);
          const mapped = mapSupabaseUser(initialSession.user);
          setSession(initialSession);
          setUser(mapped);
          setIsGuest(false);
          
          try {
            localStorage.removeItem('manageme_guest_session');
          } catch {}

          evaluateDeviceSession(mapped).catch(() => {});
          if (isMounted) setIsLoading(false);
          return;
        }

        // 2. Check Firebase Session fallback
        if (auth.currentUser && isMounted) {
          setUser(auth.currentUser);
          setIsGuest(false);
          evaluateDeviceSession(auth.currentUser).catch(() => {});
          if (isMounted) setIsLoading(false);
          return;
        }

        // 3. Check Guest mode session
        try {
          const isGuestSaved = localStorage.getItem('manageme_guest_session') === 'true';
          if (isGuestSaved && isMounted) {
            setUser(DEMO_GUEST_USER);
            setIsGuest(true);
            setIsDeviceBlocked(false);
          }
        } catch {}

      } catch (err: any) {
        console.warn('[Auth Initialization Notice]:', err?.message || err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // 4. Supabase real-time auth state changes and automatic background token refreshes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      console.info(`[Supabase Auth State Change]: ${event}`);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession?.user) {
          const mapped = mapSupabaseUser(currentSession.user);
          setSession(currentSession);
          setUser(mapped);
          setIsGuest(false);
          setAuthError(null);
          try {
            localStorage.removeItem('manageme_guest_session');
          } catch {}
          evaluateDeviceSession(mapped).catch(() => {});
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        // Only clear user if not in guest mode
        const isGuestSaved = localStorage.getItem('manageme_guest_session') === 'true';
        if (isGuestSaved) {
          setUser(DEMO_GUEST_USER);
          setIsGuest(true);
        } else {
          setUser(null);
          setIsGuest(false);
          setActiveSessions([]);
          setIsDeviceBlocked(false);
        }
      }
      setIsLoading(false);
    });

    // 5. Firebase fallback listener
    const unsubscribeFirebase = auth.onAuthStateChanged((firebaseUser) => {
      if (!isMounted) return;
      if (firebaseUser) {
        // If we don't have a Supabase session, use Firebase user
        setSession((prevSession) => {
          if (!prevSession) {
            setUser(firebaseUser);
            setIsGuest(false);
            try {
              localStorage.removeItem('manageme_guest_session');
            } catch {}
            evaluateDeviceSession(firebaseUser).catch(() => {});
          }
          return prevSession;
        });
      }
      setIsLoading(false);
    });

    // Safety timer: ensure loading state never hangs past 2 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      authListener?.subscription.unsubscribe();
      unsubscribeFirebase();
    };
  }, [evaluateDeviceSession]);

  // Cross-Tab Session Synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (user && (e.key === getStorageKey(user.uid || (user as any).id) || e.key === 'user_active_sessions')) {
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
            console.warn('[Auth Notice - Storage Sync Parse]:', err?.message || err);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, currentDevice.deviceId]);

  const signInWithSupabase = async (provider: 'google' | 'github' = 'google'): Promise<void> => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('[Supabase OAuth Error]:', err?.message || err);
      setAuthError(err?.message || 'OAuth sign-in failed');
      throw err;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setAuthError(null);
      
      // If Supabase is fully configured, we can use Supabase OAuth or Firebase Google Sign-In
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

      console.warn('[Auth Notice - Google Sign In]:', errorCode, error?.message || error);
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

  // Manual Logout: ONLY called when user explicitly clicks "Sign Out" or "Log Out"
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const uid = user?.uid || (user as any)?.id;
      if (uid && !isGuest) {
        const updated = activeSessions.filter(s => s.deviceId !== currentDevice.deviceId);
        await persistSessions(uid, updated);
      }
      
      try {
        localStorage.removeItem('manageme_guest_session');
        localStorage.removeItem('manageme_user_profile');
        localStorage.removeItem('user_active_sessions');
      } catch {}

      await signOutSupabase();
      try {
        await logout();
      } catch {}
      
      setUser(null);
      setSession(null);
      setIsGuest(false);
      setActiveSessions([]);
      setIsDeviceBlocked(false);

      // Redirect to landing page on manual logout
      if (typeof window !== 'undefined') {
        try {
          window.location.hash = 'landing';
        } catch {}
      }
    } catch (err: any) {
      console.error('[Auth Error - Sign Out]:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (targetDeviceId: string): Promise<void> => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid || isGuest) return;

    try {
      const remaining = activeSessions.filter(s => s.deviceId !== targetDeviceId);
      let updated = remaining;
      if (isDeviceBlocked && !remaining.some(s => s.deviceId === currentDevice.deviceId)) {
        const fresh = getCurrentDeviceSession();
        updated = [fresh, ...remaining];
        setIsDeviceBlocked(false);
      }

      setActiveSessions(updated);
      await persistSessions(uid, updated);
    } catch (err: any) {
      console.error('[Auth Error - Revoke Session]:', err?.message || err);
    }
  };

  const revokeOtherSessions = async (): Promise<void> => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid || isGuest) return;
    try {
      const fresh = getCurrentDeviceSession();
      const updated = [fresh];
      setActiveSessions(updated);
      setIsDeviceBlocked(false);
      await persistSessions(uid, updated);
    } catch (err: any) {
      console.error('[Auth Error - Revoke Other Sessions]:', err?.message || err);
    }
  };

  const dismissDeviceLimitModal = () => {
    setIsDeviceBlocked(false);
  };

  // Seamless Full-Screen Loading Screen while checking initial persistent session
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D0425] text-white select-none">
        {/* Ambient Radial FinTech Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#C645F9]/20 via-[#5E6CE7]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center space-y-5">
          {/* Logo Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5E6CE7] to-[#C645F9] p-[1.5px] shadow-2xl shadow-purple-500/20">
            <div className="w-full h-full bg-[#0D0425] rounded-[14.5px] flex items-center justify-center">
              <span className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-sans">
                m
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#C645F9] border-t-transparent rounded-full animate-spin" />
              <span className="font-sans font-bold text-sm tracking-tight text-white/90">
                manageme
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-400 tracking-wider uppercase">
              Rehydrating Secure Session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        authError,
        currentDevice,
        activeSessions,
        isDeviceBlocked,
        signInWithGoogle,
        signInWithSupabase,
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
