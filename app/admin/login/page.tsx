"use client";

import { useState } from "react";
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Test credentials validation
    const testCredentials = [
      { email: "owner@happyholidays.com", password: "Owner@123", role: "Owner" },
      { email: "manager@happyholidays.com", password: "Manager@123", role: "Manager" },
      { email: "frontdesk@happyholidays.com", password: "FrontDesk@123", role: "Front Desk" },
      { email: "accountant@happyholidays.com", password: "Accountant@123", role: "Accountant" },
    ];

    const validUser = testCredentials.find(
      cred => cred.email === formData.email && cred.password === formData.password
    );

    if (validUser) {
      // Store user role in localStorage (temporary - will use JWT in production)
      localStorage.setItem("adminUser", JSON.stringify({
        email: validUser.email,
        role: validUser.role,
        loginTime: new Date().toISOString()
      }));

      toast.success(`Welcome back, ${validUser.role}!`);
      router.push("/admin/dashboard");
    } else {
      toast.error("Invalid email or password");
    }

    setIsLoading(false);
  };

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

          {/* Additional Security Info */}
          <div className="mt-6 text-center text-sm text-white/80">
            <p>This is a secure area. Unauthorized access is prohibited.</p>
            <p className="mt-1">IP addresses and login attempts are monitored for security.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
