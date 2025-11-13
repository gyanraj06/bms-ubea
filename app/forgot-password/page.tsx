"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnvelopeSimple, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call - replace with actual backend call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful email sent
    setEmailSent(true);
    toast.success("Password reset email sent!");

    setIsLoading(false);
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
            {!emailSent ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-gray-600">
                    No worries, we'll send you reset instructions
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the email address associated with your account
                    </p>
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
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-brown-dark font-medium transition-colors"
                  >
                    <ArrowLeft size={16} weight="bold" />
                    <span>Back to Login</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle size={40} weight="fill" className="text-green-600" />
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h1>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to
                  </p>
                  <p className="text-brown-dark font-semibold mb-8">
                    {email}
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>

                  {/* Resend and Back Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail("");
                      }}
                      className="w-full h-11 bg-brown-dark text-white rounded-lg font-semibold hover:bg-brown-medium transition-colors"
                    >
                      Try Another Email
                    </Button>

                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full h-11 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                      >
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Help Text */}
          {!emailSent && (
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Need help?{" "}
                <a
                  href="mailto:support@happyholidays.com"
                  className="text-brown-dark hover:text-brown-medium font-semibold transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
