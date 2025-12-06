"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeSlash, EnvelopeSimple, LockKey, GoogleLogo } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Use the import from @/lib/supabase or create a new client component client
  // Since this is a client component, we should import from aut-helpers or similar
  // Looking at imports, we don't have createClientComponentClient imported yet.
  // But wait, existing code imports from @/contexts/auth-context which uses @/lib/supabase
  // Let's check imports.
  // Better to use createClientComponentClient for proper cookie handling in client components
  const supabase = createClientComponentClient();

  // Get next param
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(next);
    }
  }, [user, loading, router, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      // Check if user exists in public table, if not try to sync
      // We do this silently as a background task
      const { error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // If profile missing, create it
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.email?.split('@')[0] || 'User',
          is_verified: true,
          is_active: true
        });
      }

      // Force update of AuthContext
      await refreshUser();

      toast.success("Login successful");
      router.push(next);
      router.refresh();

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // We pass next as a query param to callback
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        throw error;
      }

      // Supabase handles the redirect
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Sign in to continue to Happy Holidays
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <EnvelopeSimple
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <LockKey
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-brown-dark hover:text-brown-medium font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            {/* Google SSO Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full h-11 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <GoogleLogo size={20} weight="bold" />
                  <span>Sign in with Google</span>
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Admin Login Button */}
            <Link href="/admin/login">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-2 border-brown-dark text-brown-dark hover:bg-brown-dark hover:text-white rounded-lg font-semibold transition-colors"
              >
                Login as Property Administrator
              </Button>
            </Link>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href={`/signup?next=${encodeURIComponent(next)}`}
                  className="text-brown-dark hover:text-brown-medium font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
