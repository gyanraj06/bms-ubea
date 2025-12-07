
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Phone, CheckCircle, CircleNotch, PaperPlaneRight } from "@phosphor-icons/react";
import ReactPhoneInput from "react-phone-number-input/input";
import { isValidPhoneNumber } from "libphonenumber-js";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase"; // Using existing firebase config
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

interface InlinePhoneVerificationProps {
    value: string;
    onChange: (value: string) => void;
    onVerifiedChange: (isVerified: boolean) => void;
    className?: string;
}

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | undefined;
    }
}

// Version: 2.0 (Force Rebuild)
export default function InlinePhoneVerification({
    value,
    onChange,
    onVerifiedChange,
    className
}: InlinePhoneVerificationProps) {
    const [isVerified, setIsVerified] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [recaptchaContainerId, setRecaptchaContainerId] = useState(`recaptcha-container-${Date.now()}`);
    const [resendCountdown, setResendCountdown] = useState(0);

    // Countdown timer effect for resend OTP
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    const handlePhoneChange = (newValue: string | undefined) => {
        const phone = newValue || "";
        onChange(phone);
        // Reset verification state if number changes
        if (isVerified) {
            setIsVerified(false);
            onVerifiedChange(false);
            setShowOtpInput(false);
            setOtp("");
            setConfirmationResult(null);
        }
        console.log("DEBUG: InlinePhoneVerification V2.0 Loaded");
    };

    const setupRecaptcha = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            // ALWAYS clear existing recaptcha to prevent stale state and v2 fallback
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.warn("Error clearing existing recaptcha:", e);
                }
                window.recaptchaVerifier = undefined;
            }

            // Also try to reset grecaptcha if available (global Google reCAPTCHA object)
            if (typeof window !== 'undefined' && (window as any).grecaptcha) {
                try {
                    (window as any).grecaptcha.reset();
                } catch (e) {
                    console.warn("Error resetting grecaptcha:", e);
                }
            }

            // PURE DOM APPROACH: Remove all old containers and create a fresh one
            const existingContainers = document.querySelectorAll('[id^="recaptcha-container-"]');
            existingContainers.forEach(el => el.remove());

            // NOTE: Do NOT remove grecaptcha iframes - it breaks Google's internal state

            // Create a brand new container with unique ID
            const newContainerId = `recaptcha-container-${Date.now()}`;
            const newContainer = document.createElement('div');
            newContainer.id = newContainerId;
            newContainer.style.display = 'none';
            document.body.appendChild(newContainer);

            try {
                // Create a fresh RecaptchaVerifier for this attempt
                window.recaptchaVerifier = new RecaptchaVerifier(auth, newContainerId, {
                    'size': 'invisible',
                    'callback': () => {
                        console.log("DEBUG: reCAPTCHA solved successfully");
                    },
                    'expired-callback': () => {
                        toast.error("Session expired, please try verifying again.");
                        setIsLoading(false);
                        if (window.recaptchaVerifier) {
                            try {
                                window.recaptchaVerifier.clear();
                                window.recaptchaVerifier = undefined;
                            } catch (e) {
                                console.error("Error clearing expired recaptcha", e);
                            }
                        }
                    }
                });
                resolve();
            } catch (e) {
                console.error("Error creating RecaptchaVerifier:", e);
                reject(e);
            }
        });
    };

    const handleSendOtp = async () => {
        if (!value || value.length < 13 || !isValidPhoneNumber(value)) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);
        try {
            await setupRecaptcha();

            // Small delay to ensure verifier is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!window.recaptchaVerifier) {
                throw new Error("reCAPTCHA verifier not initialized");
            }
            const appVerifier = window.recaptchaVerifier;

            // Format: Value likely comes in as +91..., which is correct for Firebase
            const result = await signInWithPhoneNumber(auth, value, appVerifier);

            setConfirmationResult(result);
            setShowOtpInput(true);
            setResendCountdown(60); // Start 60-second cooldown for resend
            toast.success("OTP sent! Please check your messages.");
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            const message = error.message || "Failed to send OTP";
            toast.error(message);

            // Reset recaptcha on error so we can try again
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = undefined;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a 6-digit OTP");
            return;
        }

        if (!confirmationResult) {
            toast.error("Internal error: No verification session found.");
            return;
        }

        setIsLoading(true);
        try {
            await confirmationResult.confirm(otp);
            setIsVerified(true);
            onVerifiedChange(true);
            setShowOtpInput(false);
            toast.success("Phone verified successfully!");
        } catch (error: any) {
            console.error("Error verifying OTP:", error);
            const message = error.message || "Invalid OTP";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeNumber = () => {
        setShowOtpInput(false);
        setOtp("");
        setConfirmationResult(null);
        // Reset recaptcha to be safe
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = undefined;
                } catch (e) {
                    console.error("Error clearing recaptcha", e);
                }
            }
        };
    }, []);

    return (
        <div className={cn("space-y-3", className)}>
            {/* Hidden div for invisible reCAPTCHA - uses dynamic ID */}
            <div id={recaptchaContainerId}></div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Phone size={16} /> Phone Number *
                    </span>
                    {isVerified && (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <CheckCircle size={14} weight="fill" /> Verified
                        </span>
                    )}
                </label>

                <div className="flex gap-4">
                    <div className={cn(
                        "flex items-center h-12 w-full rounded-lg border border-gray-300 bg-white px-3 transition-colors focus-within:ring-2 focus-within:ring-brown-dark/20 focus-within:border-brown-dark",
                        isVerified ? "border-green-500 bg-green-50/10" : ""
                    )}>
                        <span className="text-gray-500 font-medium border-r border-gray-300 pr-3 mr-3 select-none">
                            +91
                        </span>
                        <div className="flex-1 relative h-full">
                            <ReactPhoneInput
                                country="IN"
                                value={value}
                                onChange={handlePhoneChange}
                                disabled={isVerified || showOtpInput}
                                placeholder="98765 43210"
                                className="w-full h-full bg-transparent border-none outline-none placeholder:text-gray-400 font-medium"
                            />
                        </div>
                        {isVerified && (
                            <button
                                onClick={() => handlePhoneChange(value)}
                                className="text-xs text-gray-500 hover:text-gray-800 underline ml-2"
                            >
                                Change
                            </button>
                        )}
                    </div>

                    {!isVerified && !showOtpInput && (
                        <Button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={!value || isLoading}
                            className="h-12 bg-brown-dark hover:bg-brown-medium text-white px-6 rounded-lg font-semibold shrink-0"
                        >
                            {isLoading ? <CircleNotch className="animate-spin" size={20} /> : "Verify"}
                        </Button>
                    )}
                </div>
            </div>

            {showOtpInput && !isVerified && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-gray-500">Enter OTP sent to your number</label>
                            <div className="flex items-center gap-3">
                                {resendCountdown > 0 ? (
                                    <span className="text-xs text-gray-400">Resend in {resendCountdown}s</span>
                                ) : (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                        className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                                    >
                                        {isLoading ? "Sending..." : "Resend OTP"}
                                    </button>
                                )}
                                <button
                                    onClick={handleChangeNumber}
                                    className="text-xs text-brown-dark hover:underline"
                                >
                                    Change Number
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="h-12 tracking-widest font-mono text-center text-lg bg-white border-gray-300 focus:border-brown-dark focus:ring-brown-dark/20"
                            />
                            <Button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otp.length !== 6 || isLoading}
                                className="h-12 bg-green-600 hover:bg-green-700 text-white px-6"
                            >
                                {isLoading ? <CircleNotch className="animate-spin" size={20} /> : <span>Confirm <PaperPlaneRight className="inline ml-1" /></span>}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

