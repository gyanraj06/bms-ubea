"use client";

import { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Spinner } from "@phosphor-icons/react";

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
  initialPhone?: string;
}

export function PhoneVerification({ onVerified, initialPhone = "" }: PhoneVerificationProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!auth) {
      return;
    }

    // Skip if verifier already exists (prevents re-initialization in Strict Mode)
    if (recaptchaVerifierRef.current) return;

    const initRecaptcha = async () => {
      try {
        // Check if button exists
        const button = document.getElementById("send-otp-button");
        if (!button) {
          return;
        }

        const verifier = new RecaptchaVerifier(auth, "send-otp-button", {
          size: "invisible",
          callback: (response: any) => {
            console.log("DEBUG: reCAPTCHA solved", response);
          },
          "expired-callback": () => {
            console.error("DEBUG: reCAPTCHA expired");
            toast.error("Recaptcha expired. Please try again.");
          },
          "error-callback": (error: any) => {
            console.error("DEBUG: reCAPTCHA error", error);
          }
        });

        await verifier.render();
        recaptchaVerifierRef.current = verifier;
      } catch (error: any) {
        // Set error state for display
        let errorMessage = "Failed to initialize phone verification.";

        // Provide helpful error messages
        if (error.code === 'auth/invalid-app-credential') {
          const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
          errorMessage = `Domain "${currentDomain}" not authorized. Add it to Firebase Console Authorized Domains.`;
        } else if (error.message?.includes('network')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = "Phone authentication not enabled. Please enable it in Firebase Console.";
        } else if (error.message) {
          errorMessage = `Initialization failed: ${error.message}`;
        }

        setInitError(errorMessage);
      }
    };

    // Delay initialization slightly to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initRecaptcha();
    }, 100);

    // Cleanup only on true unmount
    return () => {
      clearTimeout(timeoutId);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // Error clearing recaptcha
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!recaptchaVerifierRef.current) {
      toast.error("Recaptcha not initialized. Please refresh the page.");
      return;
    }

    setIsSending(true);

    try {
      // Format phone number - ensure it has country code
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

      console.log("DEBUG: Starting signInWithPhoneNumber", { 
        phone: formattedPhone, 
        verifier: !!recaptchaVerifierRef.current 
      });

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      
      console.log("DEBUG: OTP Sent Result", {
        verificationId: confirmationResult.verificationId,
        fullResult: confirmationResult
      });

      setVerificationId(confirmationResult);
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      console.error("DEBUG: OTP Error", error);
      
      if (error.code === 'auth/invalid-phone-number') {
        toast.error("Invalid phone number format.");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many requests. Please try again later.");
      } else if (error.code === 'auth/invalid-app-credential') {
        toast.error("Configuration Error: Domain not authorized.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }

      // Reset recaptcha on error so user can try again
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
          window.location.reload();
        } catch (e) {
          // Error clearing recaptcha
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!verificationId) {
      toast.error("Session expired. Please send OTP again.");
      return;
    }

    setIsVerifying(true);

    try {
      await verificationId.confirm(otp);
      setIsVerified(true);
      toast.success("Phone number verified successfully!");
      onVerified(phone);
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangePhone = () => {
    setIsVerified(false);
    setVerificationId(null);
    setOtp("");
    // Recaptcha needs to be re-initialized or reset
    window.location.reload(); // Simplest way to reset recaptcha for now
  };

  return (
    <div className="space-y-4">
      {initError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="space-y-2">
            <h4 className="font-semibold text-red-900">⚠️ Configuration Error</h4>
            <p className="text-sm text-red-700">{initError}</p>
            <details className="text-xs text-red-600">
              <summary className="cursor-pointer font-medium hover:text-red-800">
                View Setup Instructions
              </summary>
              <ol className="list-decimal list-inside mt-2 space-y-1 pl-2">
                <li>Open Firebase Console</li>
                <li>Go to Authentication → Settings → Authorized Domains</li>
                <li>Add "localhost" to the list</li>
                <li>Enable Phone sign-in method</li>
                <li>Refresh this page</li>
              </ol>
              <a
                href="https://console.firebase.google.com/project/union-awas-bank/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-red-700 underline hover:text-red-900"
              >
                Open Firebase Console →
              </a>
            </details>
          </div>
        </div>
      )}

      {!isVerified ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone-verify">Phone Number *</Label>
            <div className="flex gap-2">
              <Input
                id="phone-verify"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!verificationId && phone) handleSendOtp();
                  }
                }}
                placeholder="9876543210"
                disabled={!!verificationId || isSending}
                className="flex-1"
              />
              {!verificationId && (
                <Button
                  id="send-otp-button"
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSending || !phone}
                  className="bg-brown-dark hover:bg-brown-medium text-white"
                >
                  {isSending ? <Spinner className="animate-spin" /> : "Send OTP"}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              We'll send a one-time password (OTP) to verify your number.
            </p>
          </div>

          {verificationId && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="otp-verify">Enter OTP</Label>
              <div className="flex gap-2">
                <Input
                  id="otp-verify"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (otp.length >= 6) handleVerifyOtp();
                    }
                  }}
                  placeholder="123456"
                  maxLength={6}
                  disabled={isVerifying}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleVerifyOtp} 
                  disabled={isVerifying || otp.length < 6}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isVerifying ? <Spinner className="animate-spin" /> : "Verify"}
                </Button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <button 
                  type="button"
                  onClick={handleChangePhone}
                  className="text-brown-dark hover:underline"
                >
                  Change Number
                </button>
                <button 
                  type="button"
                  onClick={handleSendOtp}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isSending}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <Check size={20} weight="bold" />
            <span className="font-medium">{phone}</span>
            <span className="ml-auto text-sm font-bold uppercase tracking-wider text-green-600">Verified</span>
          </div>
          <p className="text-xs text-gray-500">
            Your phone number has been verified successfully.
          </p>
        </div>
      )}
    </div>
  );
}
