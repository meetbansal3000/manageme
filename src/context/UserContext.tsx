import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getSupabaseUserId } from '../lib/supabase';

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  university: string;
  degree: string;
  role: string;
  targetSectors?: string[];
  avatar?: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => Promise<void> | void;
  isSupabaseConnected: boolean;
}

const defaultUser: UserProfile = {
  name: "User",
  email: "user@example.com",
  university: "University",
  degree: "Degree Program",
  role: "Owner Mode",
  targetSectors: ["Investment Banking", "Asset Management", "FinTech"],
  avatar: "",
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  updateUser: () => {},
  isSupabaseConnected: true,
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('manageme_user_profile');
      if (saved) return { ...defaultUser, ...JSON.parse(saved) };
    } catch {}
    return defaultUser;
  });

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);

  // Sync with Supabase Auth Session and Profiles Table
  useEffect(() => {
    let isMounted = true;

    const fetchSupabaseUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const authUser = session.user;
          // Try fetching profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          const updatedUser: UserProfile = {
            id: authUser.id,
            email: authUser.email,
            name: profile?.name || profile?.full_name || authUser.user_metadata?.full_name || user.name || "User",
            university: profile?.university || user.university || "University",
            degree: profile?.degree || user.degree || "Degree Program",
            role: profile?.role || user.role || "Owner Mode",
            targetSectors: profile?.target_sectors || user.targetSectors || ["Investment Banking", "Asset Management", "FinTech"],
            avatar: profile?.avatar || user.avatar || "",
          };

          setUser(updatedUser);
          localStorage.setItem('manageme_user_profile', JSON.stringify(updatedUser));
        }
      } catch (err: any) {
        console.error('[Supabase Auth Error - UserContext fetch]:', err?.message || err);
        setIsSupabaseConnected(false);
      }
    };

    fetchSupabaseUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user && isMounted) {
          const authUser = session.user;
          const updatedUser: UserProfile = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || user.name || "User",
            university: user.university || "University",
            degree: user.degree || "Degree Program",
            role: user.role || "Owner Mode",
            targetSectors: user.targetSectors || ["Investment Banking", "Asset Management", "FinTech"],
            avatar: user.avatar || "",
          };
          setUser(updatedUser);
          localStorage.setItem('manageme_user_profile', JSON.stringify(updatedUser));
        }
      } catch (authChangeErr: any) {
        console.error('[Supabase Auth Error - onAuthStateChange]:', authChangeErr?.message || authChangeErr);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const updateUser = async (fields: Partial<UserProfile>) => {
    // Prevent client caller from overriding ID to another user's ID
    const { id: _ignoredId, ...safeFields } = fields;
    const updated = { ...user, ...safeFields };
    setUser(updated);

    try {
      localStorage.setItem('manageme_user_profile', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to update user profile in localStorage:', err);
    }

    // Direct Supabase sync if user is authenticated with verified session ID
    try {
      const activeUserId = await getSupabaseUserId();
      if (activeUserId) {
        await supabase.from('profiles').upsert({
          id: activeUserId,
          name: updated.name,
          university: updated.university,
          degree: updated.degree,
          role: updated.role,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('[Supabase Error - Profile Sync]:', err?.message || err);
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, isSupabaseConnected }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

