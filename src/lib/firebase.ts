// Helper: Firebase Client Configuration & Authentication Service

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  User 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const env = (import.meta as any).env || {};

/**
 * Dynamically resolves the Firebase authDomain:
 * - Uses VITE_FIREBASE_AUTH_DOMAIN if provided
 * - Falls back to production project authDomain (manageme-9fccc.firebaseapp.com)
 */
const getDynamicAuthDomain = (): string => {
  if (env.VITE_FIREBASE_AUTH_DOMAIN) {
    return env.VITE_FIREBASE_AUTH_DOMAIN;
  }
  return firebaseConfig.authDomain || 'manageme-9fccc.firebaseapp.com';
};

const effectiveFirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: getDynamicAuthDomain(),
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || ""
};

const app = initializeApp(effectiveFirebaseConfig);
export const auth = getAuth(app);

// Use default database for custom projects, or specific databaseId if defined
const customDbId = env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (env.VITE_FIREBASE_PROJECT_ID ? undefined : (firebaseConfig as any).firestoreDatabaseId);
export const db = (customDbId && customDbId !== '(default)') ? getFirestore(app, customDbId) : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
// Add Workspace scopes to GoogleAuthProvider
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check for any redirect result on initial load
  if (typeof window !== 'undefined') {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const accessToken = credential?.accessToken || (await result.user.getIdToken()) || 'authenticated-token';
          cachedAccessToken = accessToken;
          if (onAuthSuccess) onAuthSuccess(result.user, accessToken);
        }
      })
      .catch((err) => {
        if (err?.code !== 'auth/popup-closed-by-user') {
          console.warn('[Auth Redirect Notice]:', err?.message || err);
        }
      });
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const accessToken = cachedAccessToken || (await user.getIdToken().catch(() => 'authenticated-token'));
      cachedAccessToken = accessToken;
      if (onAuthSuccess) onAuthSuccess(user, accessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    let result;
    try {
      result = await signInWithPopup(auth, googleProvider);
    } catch (popupError: any) {
      if (popupError?.code === 'auth/popup-blocked' || popupError?.code === 'auth/cancelled-popup-request') {
        // Fallback to signInWithRedirect when popup is blocked
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw popupError;
    }
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || (await result.user.getIdToken()) || 'authenticated-token';
    cachedAccessToken = accessToken;
    return { user: result.user, accessToken };
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || 'Authentication error';
    
    if (errorCode === 'auth/unauthorized-domain') {
      const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'current-domain';
      console.warn(`[Auth Warning]: Domain "${currentDomain}" authorization in progress.`);
    } else if (errorCode !== 'auth/popup-closed-by-user') {
      console.error('[Auth Error - Google Sign In]:', errorCode, errorMessage);
    }
    
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      cachedAccessToken = token;
      return token;
    } catch {
      return null;
    }
  }
  return null;
};

export const logout = async () => {
  try {
    await auth.signOut();
  } catch (err) {
    console.error('[Auth Error - Logout]:', err);
  }
  cachedAccessToken = null;
};
