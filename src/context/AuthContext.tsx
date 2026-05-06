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

async function fetchProfile(user: User): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single();

  if (data) return data as Profile;

  if (error) console.error('[fetchProfile] select error:', error.code, error.message);

  // No profile row — create one (handles users created before the DB trigger was set up)
  const username = (user.email ?? '').split('@')[0] || 'user';
  const { data: created, error: upsertError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, username, role: 'client' }, { onConflict: 'id', ignoreDuplicates: true })
    .select('id, username, role')
    .single();

  if (upsertError) console.error('[fetchProfile] upsert error:', upsertError.code, upsertError.message);
  return (created as Profile) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    // autoRefreshToken is disabled so getSession() reads localStorage
    // synchronously — no network call, no hang on page refresh while logged in.
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) fetchProfile(session.user).then(setProfile);
      })
      .catch(() => setLoading(false));

    // onAuthStateChange handles sign-in, sign-out, and token refresh events.
    // IMPORTANT: do NOT return the fetchProfile promise from this callback.
    // Supabase awaits every onAuthStateChange callback while holding the Web
    // Lock. A returned promise keeps the lock open until the profile DB fetch
    // finishes, blocking every other Supabase call (including the feed query).
    // void discards the promise so the lock is released immediately.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void fetchProfile(session.user).then(setProfile);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (username: string, pin: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured.';
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: toEmail(username),
        password: pin,
      });
      return error ? 'Incorrect username or PIN.' : null;
    } catch {
      return 'Connection timed out — check your network and try again.';
    }
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
