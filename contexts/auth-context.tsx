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

      // 2. Initial Session Check
      const { data: { session: initialSession } } = await supabase.auth.getSession();

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
        // Now we check session and poll if needed.
        if (!initialSession) {
          const toastId = toast.loading("Verifying account creation...");
          let foundSession = null;
          let attempts = 0;
          const maxAttempts = 30;

          while (!foundSession && attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 500));
            const { data } = await supabase.auth.getSession();
            foundSession = data.session;
            attempts++;
          }
          toast.dismiss(toastId);

          if (foundSession) {
            // Success logic below handled by syncSessionToState call or reload
            // We can just proceed to clean up
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('auth_callback');
            newUrl.searchParams.delete('retried');
            newUrl.searchParams.set('login_success', 'true');
            window.location.href = newUrl.toString();
            return;
          } else {
            toast.error("Verification timed out. Please try logging in.");
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('auth_callback');
            newUrl.searchParams.delete('retried');
            window.history.replaceState({}, '', newUrl.toString());
          }
        }
      }

      // Normal sync
      if (initialSession) {
        await syncSessionToState(initialSession);
      }
      setLoading(false);
    };
    init();

    // 2. Real-time Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        await syncSessionToState(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
      // Ensure loading is false after any state change if we aren't in the middle of init
      // We rely on init to set loading false initially, but this is a backup
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ... (keeping signOut and refreshUser same) ...

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await fetch('/auth/signout', { method: 'POST' });
      localStorage.removeItem('userSession');
      localStorage.removeItem('userData');
      setUser(null);
      setSession(null);
      router.push('/');
      router.refresh();
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
