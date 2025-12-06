"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

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

  // Create a Supabase client optimized for Next.js Client Components
  const supabase = createClientComponentClient();

  // Helper to sync Supabase session to our app state
  const syncSessionToState = async (session: any) => {
    try {
      if (!session?.user) {
        setUser(null);
        setSession(null);
        return;
      }

      // 1. Set Session
      setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at || 0,
      });

      // 2. Fetch User Profile
      // We check the DB for the latest profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          is_verified: profile.is_verified,
        });
      } else {
        // Fallback to metadata
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          phone: session.user.user_metadata?.phone || '',
          is_verified: true,
        });
      }
    } catch (error) {
      console.error("Error syncing session:", error);
      // If error, we might leave user as null or stale, better to be safe
    }
  };

  useEffect(() => {
    // 1. Initial Load
    const init = async () => {
      setLoading(true);

      const params = new URLSearchParams(window.location.search);
      const isAuthCallback = params.get('auth_callback') === 'true';
      const isLoginSuccess = params.get('login_success') === 'true';

      // 1. Handle Post-Login Success State
      if (isLoginSuccess) {
        toast.success("Successfully logged in with Google");
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('login_success');
        window.history.replaceState({}, '', newUrl.toString());
      }

      // 2. Initial Session Check (with Safety Timeout)
      // We rely on onAuthStateChange for the robust update, but we need this for initial state.
      // We timeout after 2s to prevent UI from freezing if the SDK hangs (e.g. lock contention).
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 2000)
        );

        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        if (data?.session) {
          await syncSessionToState(data.session);
        }
      } catch (error) {
        console.warn("[Auth] Initial session check timed out or failed. Relying on listener.");
      }

      // 3. Post-Redirect Handling
      // If we have an auth callback, we force at least ONE reload to ensure cookies are fresh.
      // This solves the "stuck" issue or "profile icon missing" issue.
      if (isAuthCallback) {
        const isRetried = params.get('retried') === 'true';

        if (!isRetried) {
          console.log("[Auth] Callback detected. Forcing immediate cleanup reload.");
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('retried', 'true');
          window.location.href = newUrl.toString();
          return;
        }

        // If we see 'retried=true', we know we just reloaded.
        // Logic handled largely by onAuthStateChange above, but we ensure cleanup here.
        // We do minimal work here to avoid race conditions.

        // Check session state directly from hook if available, or just check supabase again quickly
        // But since we had a timeout above, we might be here without session.
        // Let's assume onAuthStateChange will catch it if it exists.

        // Clean up URL if we think we are done (but risk: cleaner runs before session found?)
        // Safer: Only clean up if we actually HAVE a session in state.
        // For now, let's leave the params until next reload or successful sync.
        // Actually, previous logic polled. Let's rely on Listener.
      }

      // Simplify: Just finish loading. The Listener will handle the actual user set.
      setLoading(false);
    };
    init();

    // 2. Real-time Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // If we get a session update, sync it.
      if (currentSession) {
        await syncSessionToState(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
      // Ensure loading is false after any state change
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Remove backend call - we trust Supabase client to handle session clearing
      // await fetch('/auth/signout', { method: 'POST' });

      // Remove legacy Manual Storage
      // localStorage.removeItem('userSession');
      // localStorage.removeItem('userData');

      setUser(null);
      setSession(null);
      router.push('/');
      router.refresh(); // Refresh server components
      toast.success("Signed out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const refreshUser = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    await syncSessionToState(currentSession);
  };

  const value = {
    session,
    user,
    signOut,
    loading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
