import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
// Add Workspace scopes to the GoogleAuthProvider
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
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || await result.user.getIdToken() || 'local-demo-token';
    cachedAccessToken = accessToken;
    return { user: result.user, accessToken };
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || 'Authentication error';
    
    if (errorCode === 'auth/unauthorized-domain') {
      console.warn('[Auth Warning]: Current domain is not in Firebase Authorized Domains list. Initializing local session.');
    } else if (errorCode === 'auth/popup-blocked') {
      console.warn('[Auth Warning]: Popup was blocked by browser. Please allow popups for authentication.');
    } else if (errorCode === 'auth/popup-closed-by-user') {
      console.info('[Auth Info]: Sign-in popup closed by user.');
    } else if (errorCode === 'auth/network-request-failed') {
      console.warn('[Auth Warning]: Network request failed. Offline mode active.');
    } else {
      console.error('[Auth Error - Google Sign In]:', errorCode, errorMessage, error);
    }
    
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await auth.signOut();
  } catch (err) {
    console.error('[Auth Error - Logout]:', err);
  }
  cachedAccessToken = null;
};
