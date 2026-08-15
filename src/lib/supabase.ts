import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zdviizcyeyuoiakduyph.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JkkaDBQFKLbKPmeRBzvbaA_P_pdZza8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper to retrieve the active Supabase user ID if authenticated,
 * or fallback to any saved local user ID.
 */
export const getSupabaseUserId = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
    const localUser = localStorage.getItem('manageme_user_profile');
    if (localUser) {
      const parsed = JSON.parse(localUser);
      if (parsed.id) return parsed.id;
    }
  } catch (err) {
    console.warn('Failed to get Supabase session/user ID:', err);
  }
  return null;
};
