"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Lock, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phoneNumber: string) => void;
  initialPhone?: string;
}

type VerificationStep = "phone-entry" | "otp-entry" | "verified";

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
  initialPhone = "",
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>("phone-entry");
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhone);
  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Log component mount
  useEffect(() => {
    console.log("\n🎬 [INIT] PhoneVerificationModal component mounted");
    console.log("├─ Firebase Config:", {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20) + "...",
    });
    console.log("├─ reCAPTCHA Site Key:", process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.substring(0, 20) + "...");
    console.log("└─ Initial phone:", initialPhone || "None");
  }, []);

  // Initialize reCAPTCHA on mount
  useEffect(() => {
    if (!isOpen) return;

    const initializeRecaptcha = () => {
      console.log("📋 [STEP 1] Initializing reCAPTCHA verifier...");
      console.log("├─ Modal opened:", isOpen);
      console.log("├─ reCAPTCHA Site Key:", process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.substring(0, 20) + "...");

      try {
        // Clear any existing verifier
        if (recaptchaVerifierRef.current) {
          console.log("├─ Clearing existing reCAPTCHA verifier");
          recaptchaVerifierRef.current.clear();
        }

        // Create new reCAPTCHA verifier (invisible for v3)
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response: any) => {
              console.log("✅ [reCAPTCHA] Verification successful!");
              console.log("├─ reCAPTCHA response:", response);
            },
            "expired-callback": () => {
              console.log("⚠️ [reCAPTCHA] Verification expired");
              toast.error("reCAPTCHA expired. Please try again.");
            },
          }
        );

        console.log("✅ [STEP 1] reCAPTCHA verifier initialized successfully (invisible mode for v3)");
      } catch (error) {
        console.error("❌ [STEP 1] Error initializing reCAPTCHA:", error);
      }
    };

    initializeRecaptcha();

    // Cleanup on unmount
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (step === "otp-entry") {
      const otpInput = document.getElementById("otp-input");
      if (otpInput) {
        otpInput.focus();
      }
    }
  }, [step]);

  const handleSendOTP = async () => {
    console.log("\n🚀 [STEP 2] Starting OTP send process...");
    console.log("├─ Phone number input:", phoneNumber);

    // Validate phone number
    if (!phoneNumber) {
      console.log("❌ [STEP 2] Validation failed: No phone number entered");
      toast.error("Please enter a phone number");
      return;
    }

    // Ensure phone number starts with +91 for India
    const formattedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+91${phoneNumber}`;

    console.log("├─ Formatted phone number:", formattedPhone);

    if (!isValidPhoneNumber(formattedPhone, "IN")) {
      console.log("❌ [STEP 2] Validation failed: Invalid phone number format");
      toast.error("Please enter a valid Indian phone number");
      return;
    }

    console.log("✅ [STEP 2] Phone number validation passed");

    setIsLoading(true);
    console.log("├─ Loading state set to true");

    try {
      if (!recaptchaVerifierRef.current) {
        console.log("❌ [STEP 2] reCAPTCHA verifier not initialized");
        throw new Error("reCAPTCHA not initialized");
      }

      console.log("\n📞 [STEP 3] Sending OTP via Firebase...");
      console.log("├─ API Endpoint: identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode");
      console.log("├─ Request Method: POST");
      console.log("├─ Request Data:", {
        phoneNumber: formattedPhone,
        recaptchaToken: "Will be generated by reCAPTCHA verifier"
      });
      console.log("├─ Firebase Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

      // Send OTP via Firebase
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      console.log("✅ [STEP 3] Firebase OTP request successful!");
      console.log("├─ Response type: ConfirmationResult");
      console.log("├─ Verification ID received:", confirmation.verificationId ? "Yes" : "No");
      console.log("├─ Session info available:", !!confirmation);

      setConfirmationResult(confirmation);
      setStep("otp-entry");
      setResendTimer(60); // 60 seconds countdown

      console.log("✅ [STEP 3] OTP sent successfully!");
      console.log("├─ Moving to OTP entry step");
      console.log("├─ Resend timer set to 60 seconds");
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      console.error("\n❌ [STEP 3] Error sending OTP");
      console.error("├─ Error object:", error);
      console.error("├─ Error code:", error.code);
      console.error("├─ Error message:", error.message);
      console.error("├─ Full error details:", JSON.stringify(error, null, 2));

      // Handle specific Firebase errors
      if (error.code === "auth/invalid-phone-number") {
        toast.error("Invalid phone number format");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please try again later.");
      } else if (error.code === "auth/quota-exceeded") {
        toast.error("SMS quota exceeded. Please try again later.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }

      // Reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    console.log("\n🔐 [STEP 4] Starting OTP verification...");
    console.log("├─ OTP entered:", otp);
    console.log("├─ OTP length:", otp.length);

    if (!otp || otp.length !== 6) {
      console.log("❌ [STEP 4] Validation failed: Invalid OTP length");
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      console.log("❌ [STEP 4] No confirmation result available");
      toast.error("Please resend OTP");
      return;
    }

    console.log("✅ [STEP 4] OTP validation passed");
    console.log("├─ Confirmation result available:", !!confirmationResult);

    setIsLoading(true);
    console.log("├─ Loading state set to true");

    try {
      console.log("\n🔍 [STEP 5] Verifying OTP with Firebase...");
      console.log("├─ API Endpoint: identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber");
      console.log("├─ Request Method: POST");
      console.log("├─ Request Data:", {
        sessionInfo: "From previous confirmation result",
        code: otp
      });

      await confirmationResult.confirm(otp);

      console.log("✅ [STEP 5] OTP verification successful!");
      console.log("├─ User authenticated via Firebase");
      console.log("├─ Response: Authentication credential created");

      // Success
      setStep("verified");
      console.log("├─ Moving to verified step");
      toast.success("Phone number verified successfully!");

      // Format phone number for display
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      console.log("✅ [STEP 6] Finalizing verification...");
      console.log("├─ Formatted phone:", formattedPhone);
      console.log("├─ Calling onVerified callback in 1.5 seconds");

      // Wait a bit to show success state, then close
      setTimeout(() => {
        console.log("✅ [STEP 6] Verification complete!");
        console.log("├─ Passing verified phone to parent component");
        console.log("└─ Closing modal");
        onVerified(formattedPhone);
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("\n❌ [STEP 5] Error verifying OTP");
      console.error("├─ Error object:", error);
      console.error("├─ Error code:", error.code);
      console.error("├─ Error message:", error.message);
      console.error("├─ Full error details:", JSON.stringify(error, null, 2));

      if (error.code === "auth/invalid-verification-code") {
        console.log("├─ Reason: Invalid OTP code entered");
        toast.error("Invalid OTP. Please check and try again.");
      } else if (error.code === "auth/code-expired") {
        console.log("├─ Reason: OTP code expired");
        toast.error("OTP expired. Please request a new one.");
        setStep("phone-entry");
      } else {
        console.log("├─ Reason: Unknown error");
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
      console.log("└─ Loading state set to false");
    }
  };

  const handleResendOTP = () => {
    console.log("\n🔄 [RESEND] Resend OTP requested");
    console.log("├─ Resend timer:", resendTimer);

    if (resendTimer > 0) {
      console.log("❌ [RESEND] Cannot resend - timer still active");
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return;
    }

    console.log("✅ [RESEND] Timer expired, clearing OTP and resending");
    setOtp("");
    handleSendOTP();
  };

  const handleClose = () => {
    console.log("\n🚪 [CLOSE] Closing modal and resetting state");
    console.log("├─ Resetting to phone-entry step");
    console.log("├─ Clearing all form data");
    setStep("phone-entry");
    setPhoneNumber(initialPhone);
    setOtp("");
    setResendTimer(0);
    setConfirmationResult(null);
    onClose();
    console.log("└─ Modal closed");
  };

  const handleBackToPhone = () => {
    console.log("\n◀️ [BACK] Returning to phone entry");
    console.log("├─ Clearing OTP");
    console.log("└─ Clearing confirmation result");
    setStep("phone-entry");
    setOtp("");
    setConfirmationResult(null);
  };

  // Handle OTP input change (auto-submit when 6 digits)
  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    console.log("⌨️ [INPUT] OTP input changed:", {
      raw: value,
      numeric: numericValue,
      length: numericValue.length
    });
    setOtp(numericValue);

    // Auto-submit when 6 digits entered
    if (numericValue.length === 6) {
      console.log("✅ [INPUT] 6 digits entered - auto-submitting in 300ms");
      setTimeout(() => {
        handleVerifyOTP();
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X size={24} className="text-gray-600" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              {step === "verified" ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} weight="fill" className="text-green-600" />
                </div>
              ) : step === "otp-entry" ? (
                <div className="w-16 h-16 bg-brown-dark/10 rounded-full flex items-center justify-center">
                  <Lock size={32} className="text-brown-dark" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-brown-dark/10 rounded-full flex items-center justify-center">
                  <Phone size={32} className="text-brown-dark" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              {step === "verified"
                ? "Verified!"
                : step === "otp-entry"
                ? "Enter OTP"
                : "Verify Phone Number"}
            </h2>

            <p className="text-center text-gray-600">
              {step === "verified"
                ? "Your phone number has been verified successfully"
                : step === "otp-entry"
                ? `Enter the 6-digit code sent to ${phoneNumber}`
                : "We'll send you a one-time password to verify your number"}
            </p>
          </div>

          {/* Phone Entry Step */}
          {step === "phone-entry" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  defaultCountry="IN"
                  countries={["IN"]}
                  value={phoneNumber}
                  onChange={(value) => setPhoneNumber(value || "")}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={isLoading || !phoneNumber}
                className="w-full bg-brown-dark text-white py-3 rounded-lg font-semibold hover:bg-brown-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          )}

          {/* OTP Entry Step */}
          {step === "otp-entry" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="000000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brown-dark focus:ring-2 focus:ring-brown-dark/20 outline-none transition-all text-center text-2xl tracking-widest font-semibold"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-brown-dark text-white py-3 rounded-lg font-semibold hover:bg-brown-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={handleBackToPhone}
                  className="text-brown-dark hover:underline"
                  disabled={isLoading}
                >
                  Change Number
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={isLoading || resendTimer > 0}
                  className="text-brown-dark hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Verified Step */}
          {step === "verified" && (
            <div className="text-center">
              <div className="w-16 h-1 bg-green-500 mx-auto rounded-full animate-pulse" />
            </div>
          )}

          {/* Invisible reCAPTCHA container for v3 */}
          <div id="recaptcha-container" ref={recaptchaContainerRef} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
