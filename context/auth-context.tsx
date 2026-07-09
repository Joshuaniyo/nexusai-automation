'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

type UserTier = 'free' | 'premium';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tier: UserTier;
  setTier: (tier: UserTier) => void;
  isPremium: boolean;
  loading: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tier, setTier] = useState<UserTier>('free');
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string, email: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, full_name')
        .eq('id', userId)
        .single();

      const userTier = (profile?.tier as UserTier) || 'free';
      setTier(userTier);

      setUser({
        id: userId,
        email: email,
        name: profile?.full_name || email.split('@')[0],
        tier: userTier,
        avatar: email.slice(0, 2).toUpperCase(),
      });
    } catch (err) {
      setUser({
        id: userId,
        email: email,
        name: email.split('@')[0],
        tier: 'free',
        avatar: email.slice(0, 2).toUpperCase(),
      });
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const { data: { session: initialSession } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (initialSession?.user) {
        setSession(initialSession);
        await fetchProfile(initialSession.user.id, initialSession.user.email || '');
      }
      setLoading(false);
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (newSession?.user) {
        setSession(newSession);
        await fetchProfile(newSession.user.id, newSession.user.email || '');
      } else {
        setSession(null);
        setUser(null);
        setTier('free');
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setTier('free');
  }

  return (
    <AuthContext.Provider value={{
      user,
      tier,
      setTier,
      isPremium: tier === 'premium',
      loading,
      session,
      signOut
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
