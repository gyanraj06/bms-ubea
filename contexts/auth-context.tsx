"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_verified?: boolean;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage and verify session on mount
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        if (event === 'SIGNED_IN' && supabaseSession) {
          await updateUserFromSession(supabaseSession);
        } else if (event === 'SIGNED_OUT') {
          clearUser();
        } else if (event === 'TOKEN_REFRESHED' && supabaseSession) {
          await updateUserFromSession(supabaseSession);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = localStorage.getItem('userData');
      const storedSession = localStorage.getItem('userSession');

      if (storedUser && storedSession) {
        const userData = JSON.parse(storedUser);
        const sessionData = JSON.parse(storedSession);

        // Check if session is still valid
        if (sessionData.expires_at && sessionData.expires_at > Date.now() / 1000) {
          setUser(userData);
          setSession(sessionData);
        } else {
          // Try to refresh the session
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: sessionData.refresh_token,
          });

          if (error || !data.session) {
            clearUser();
          } else {
            await updateUserFromSession(data.session);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      clearUser();
    } finally {
      setLoading(false);
    }
  };

  const updateUserFromSession = async (supabaseSession: any) => {
    try {
      const userData: User = {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email || '',
        full_name: supabaseSession.user.user_metadata?.full_name || '',
        phone: supabaseSession.user.user_metadata?.phone || '',
        is_verified: true,
      };

      const sessionData: Session = {
        access_token: supabaseSession.access_token,
        refresh_token: supabaseSession.refresh_token,
        expires_at: supabaseSession.expires_at || 0,
      };

      setUser(userData);
      setSession(sessionData);

      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('userSession', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error updating user from session:', error);
    }
  };

  const clearUser = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('userSession');
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      clearUser();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    await loadUserFromStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
