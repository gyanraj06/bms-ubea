"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKey, Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const supabase = createClientComponentClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                throw error;
            }

            setIsSuccess(true);
            toast.success("Password updated successfully!");

            // Redirect after a short delay
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (error: any) {
            console.error("Error updating password:", error);
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsLoading(false);
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
                        {!isSuccess ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                                        Set New Password
                                    </h1>
                                    <p className="text-gray-600">
                                        Please enter your new password below
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                            New Password
                                        </Label>
                                        <div className="relative">
                                            <LockKey
                                                size={20}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 pr-10 h-11"
                                                required
                                                minLength={6}
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

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </Label>
                                        <div className="relative">
                                            <LockKey
                                                size={20}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <Input
                                                id="confirm-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-10 h-11"
                                                required
                                                minLength={6}
                                            />
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
                                                <span>Updating...</span>
                                            </div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            // Success State
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle size={40} weight="fill" className="text-green-600" />
                                </div>
                                <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                                    Password Updated!
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    Your password has been successfully reset. Redirecting you to login...
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
