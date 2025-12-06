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

  const supabase = createClientComponentClient();

  const syncSessionToState = async (session: any) => {
    try {
      if (!session?.user) {
        setUser(null);
        setSession(null);
        return;
      }

      setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at || 0,
      });

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
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const params = new URLSearchParams(window.location.search);
      const isAuthCallback = params.get('auth_callback') === 'true';
      const isLoginSuccess = params.get('login_success') === 'true';

      if (isLoginSuccess) {
        toast.success("Successfully logged in with Google");
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('login_success');
        window.history.replaceState({}, '', newUrl.toString());
      }

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
        console.warn("[Auth] Initial session check timed out. Attempting manual cookie read.");
        try {
          const cookieName = 'sb-hgqyhqoieppwidrpkkvn-auth-token';

          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split('; ').reduce((acc, current) => {
              const [name, value] = current.split('=');
              acc[name] = value;
              return acc;
            }, {} as any);

            if (cookies[cookieName]) {
              const decoded = decodeURIComponent(cookies[cookieName]);
              const parsed = JSON.parse(decoded);
              const accessToken = Array.isArray(parsed) ? parsed[0] : parsed.access_token;
              const refreshToken = Array.isArray(parsed) ? parsed[1] : parsed.refresh_token;

              if (accessToken) {
                console.log("[Auth] Manual cookie found. Hydrating state.");

                const payload = JSON.parse(atob(accessToken.split('.')[1]));

                setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  expires_at: payload.exp || 0,
                });

                setUser({
                  id: payload.sub,
                  email: payload.email || payload.user_metadata?.email || '',
                  full_name: payload.user_metadata?.full_name || payload.user_metadata?.name || '',
                  phone: payload.user_metadata?.phone || '',
                  is_verified: payload.user_metadata?.email_verified || true,
                });

                const manualSession = {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  expires_at: payload.exp || 0,
                  user: {
                    id: payload.sub,
                    email: payload.email,
                    user_metadata: payload.user_metadata || {},
                    app_metadata: payload.app_metadata || {}
                  }
                };

                syncSessionToState(manualSession).catch(err => {
                  console.error("[Auth] Background profile fetch failed:", err);
                });
              }
            }
          }
        } catch (manualError) {
          console.error("[Auth] Manual fallback failed:", manualError);
        }
      }

      if (isAuthCallback) {
        const isRetried = params.get('retried') === 'true';

        if (!isRetried) {
          console.log("[Auth] Callback detected. Forcing immediate cleanup reload.");
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('retried', 'true');
          window.location.href = newUrl.toString();
          return;
        }
      }

      setLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        await syncSessionToState(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      // Race signOut against timeout (same issue as getSession)
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );

      try {
        await Promise.race([signOutPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.warn("[Auth] signOut timed out, manually clearing state");
        // If SDK hangs, manually clear the cookie
        document.cookie = 'sb-hgqyhqoieppwidrpkkvn-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }

      // Always clear local state regardless
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
