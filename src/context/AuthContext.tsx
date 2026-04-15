import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin_auth');
    if (stored === 'true') {
      setUser({ id: 'admin-1', email: 'admin@uttaravilas.com' } as User);
      setSession({} as Session);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (email === 'admin@uttaravilas.com' && password === 'uttaravilas2026@@!!') {
      const fakeUser = { id: 'admin-1', email } as User;
      setUser(fakeUser);
      setSession({} as Session);
      localStorage.setItem('admin_auth', 'true');
      return { error: null };
    }
    return { error: new Error('Invalid credentials') };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('admin_auth');
  };

  // Any authenticated user is considered admin
  const isAdmin = !!user;

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
