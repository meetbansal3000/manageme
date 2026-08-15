import { createClient } from '@supabase/supabase-js';

// Fallback configuration for production and local environments
const DEFAULT_SUPABASE_URL = 'https://zdviizcyeyuoiakduyph.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_JkkaDBQFKLbKPmeRBzvbaA_P_pdZza8';

const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
const envAnonKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;

export const SUPABASE_URL = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = (envAnonKey && envAnonKey.trim() !== '') ? envAnonKey.trim() : DEFAULT_SUPABASE_ANON_KEY;

// Create Supabase client with auto-refresh and persistent local storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});

// Explicitly monitor and log all Supabase Auth state changes and errors
if (typeof window !== 'undefined') {
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.info('[Supabase Auth]: User signed out or session ended');
      } else if (event === 'SIGNED_IN') {
        console.info('[Supabase Auth]: User signed in successfully:', session?.user?.id);
      } else if (event === 'TOKEN_REFRESHED') {
        console.info('[Supabase Auth]: Session token refreshed');
      } else if (event === 'USER_UPDATED') {
        console.info('[Supabase Auth]: User metadata updated');
      }
    });
  } catch (authListenerErr) {
    console.error('[Supabase Auth Error]: Failed to register auth state listener:', authListenerErr);
  }
}

/**
 * Helper to retrieve the active Supabase user ID if authenticated,
 * or fallback to any saved local user ID.
 */
export const getSupabaseUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Supabase Auth Error]: getSession error:', error.message, error);
    }
    if (data?.session?.user?.id) {
      return data.session.user.id;
    }
    const localUser = localStorage.getItem('manageme_user_profile');
    if (localUser) {
      const parsed = JSON.parse(localUser);
      if (parsed.id) return parsed.id;
    }
  } catch (err) {
    console.error('[Supabase Auth Error]: Failed to get Supabase session/user ID:', err);
  }
  return null;
};

/**
 * Helper to sign in with OAuth provider via Supabase
 */
export const signInWithSupabaseOAuth = async (provider: 'google' | 'github'): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.error(`[Supabase Auth Error]: OAuth sign in failed with ${provider}:`, error.message, error);
      throw error;
    }
  } catch (err) {
    console.error(`[Supabase Auth Error]: Exception during ${provider} sign in:`, err);
    throw err;
  }
};

/**
 * Helper to sign out from Supabase
 */
export const signOutSupabase = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Supabase Auth Error]: Sign out error:', error.message, error);
    }
  } catch (err) {
    console.error('[Supabase Auth Error]: Exception during sign out:', err);
  }
};

