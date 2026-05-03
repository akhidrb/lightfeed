import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  username: string;
  role: 'admin' | 'client';
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, pin: string) => Promise<string | null>;
  signUp: (username: string, pin: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const toEmail = (username: string) =>
  `${username.toLowerCase().replace(/[^a-z0-9_]/g, '_')}@lightfeed.app`;

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', userId)
    .single();
  return (data as Profile) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) setProfile(await fetchProfile(session.user.id));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setProfile(session?.user ? await fetchProfile(session.user.id) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (username: string, pin: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured.';
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password: pin,
    });
    return error ? 'Incorrect username or PIN.' : null;
  }, []);

  const signUp = useCallback(async (username: string, pin: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured.';
    if (pin.length !== 6) return 'PIN must be 6 digits.';

    const { error } = await supabase.auth.signUp({
      email: toEmail(username),
      password: pin,
    });
    if (error) return error.message.includes('already registered') ? 'Username already taken.' : error.message;
    // Profile is created automatically by the on_auth_user_created trigger
    return null;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, profile,
      isAdmin: profile?.role === 'admin',
      loading,
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
