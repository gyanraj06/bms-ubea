"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeSlash, EnvelopeSimple, LockKey, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminSession = () => {
      try {
        const adminUser = localStorage.getItem("adminUser");
        const adminToken = localStorage.getItem("adminToken");

        if (adminUser && adminToken) {
          const user = JSON.parse(adminUser);

          // Check if session is still valid (optional: check expiry if you have it)
          if (user.loginTime) {
            const loginDate = new Date(user.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

            // If logged in within last 24 hours, redirect to dashboard
            if (hoursSinceLogin < 24) {
              router.push("/admin/dashboard");
              return;
            }
          } else {
            // No loginTime, but has token - redirect anyway
            router.push("/admin/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking admin session:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Call admin login API
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Clear old permissions from localStorage to force fresh fetch
      localStorage.removeItem('adminPermissions');

      // Store token and user data (legacy format for compatibility)
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        loginTime: new Date().toISOString(),
      }));

      // Store adminSession in the format expected by the payments dashboard
      localStorage.setItem('adminSession', JSON.stringify({
        token: data.token,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          role: data.user.role,
        },
        loginTime: new Date().toISOString(),
      }));

      toast.success(`Welcome back, ${data.user.role}!`);
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-brown-dark via-brown-medium to-brown-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Checking authentication...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-brown-dark via-brown-medium to-brown-light">
      <ChaletHeader forceLight={false} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            {/* Header with Shield Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brown-dark rounded-full mb-4">
                <ShieldCheck size={32} weight="fill" className="text-white" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                Administrator Access
              </h1>
              <p className="text-gray-600">
                Property Management Portal
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-amber-600 mt-0.5 flex-shrink-0" weight="fill" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Secure Administrator Login</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This portal is for authorized personnel only. All login attempts are logged and monitored.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">
                  Administrator Email
                </Label>
                <div className="relative">
                  <EnvelopeSimple
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@happyholidays.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-11 border-gray-300 focus:border-brown-dark focus:ring-brown-dark"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <LockKey
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-brown-dark focus:ring-brown-dark"
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying credentials...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck size={20} weight="fill" />
                    <span>Access Admin Portal</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Back to Guest Login */}
            <Link href="/login">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
              >
                Back to Guest Login
              </Button>
            </Link>

            {/* Support Contact */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Having trouble accessing the admin portal?
              </p>
              <a
                href="mailto:admin@happyholidays.com"
                className="text-sm text-brown-dark hover:text-brown-medium font-semibold transition-colors"
              >
                Contact IT Support
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
