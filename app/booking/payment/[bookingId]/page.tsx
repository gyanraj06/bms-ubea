"use client";

// Force dynamic rendering on Vercel
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Copy,
  WhatsappLogo,
  ArrowRight,
  Upload,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/auth-context";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const { session } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Constants
  const UPI_ID = "qr919827058059-5132@unionbankofindia";
  const WHATSAPP_NUMBER = "917649048059";

  useEffect(() => {
    if (session?.access_token) {
      fetchBookingDetails();
    } else if (session === null) {
      // Session is confirmed null (not just loading)
      toast.error("Please login to view this page");
      router.push("/login");
    }
  }, [bookingId, session]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const token = session?.access_token;

      if (!token) {
        toast.error("Session expired");
        router.push("/login");
        return;
      }

      console.log("[Payment] Fetching booking details...");
      const response = await fetch("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const found = data.bookings.find((b: any) => b.id === bookingId);
        if (found) {
          setBooking(found);
          console.log("[Payment] Booking loaded:", found.booking_number);
        } else {
          toast.error("Booking not found");
          router.push("/my-bookings");
        }
      } else {
        toast.error("Failed to load booking details");
      }
    } catch (error) {
      console.error("[Payment] Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied to clipboard");
  };

  const handleWhatsAppClick = () => {
    const message = `Hi, I have paid for Booking ID: ${booking?.booking_number}. Here is the screenshot.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload an image file (JPG, PNG, or WEBP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setScreenshotFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    toast.success("Screenshot selected!");
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null;

    try {
      setIsUploading(true);
      const token = session?.access_token;

      if (!token) {
        toast.error("Session expired");
        return null;
      }

      const formData = new FormData();
      formData.append('file', screenshotFile);
      formData.append('documentType', 'payment_screenshot');

      const response = await fetch('/api/bookings/upload-document', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return data.data.filePath;
      } else {
        toast.error(data.error || "Failed to upload screenshot");
        return null;
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentComplete = async () => {
    try {
      setIsSubmitting(true);
      const token = session?.access_token;

      if (!token) {
        toast.error("Session expired. Please login.");
        router.push("/login");
        return;
      }

      // Upload screenshot first if exists
      let screenshotPath: string | null = null;
      if (screenshotFile) {
        toast.info("Uploading payment screenshot...");
        screenshotPath = await uploadScreenshot();
        if (!screenshotPath) {
          // Upload failed, error already shown
          setIsSubmitting(false);
          return;
        }
      }

      toast.info("Confirming payment...");

      const response = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "mark_paid",
          payment_screenshot_url: screenshotPath,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment marked! Waiting for verification.");
        router.push(`/booking/success?bookingIds=${bookingId}`);
      } else {
        toast.error(data.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("[Payment] Exception:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
      </main>
    );
  }

  if (!booking) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brown-dark p-6 text-white text-center">
              <h1 className="text-2xl font-serif font-bold mb-2">Complete Your Payment</h1>
              <p className="opacity-90 text-lg">Booking ID: <span className="font-mono font-bold">{booking.booking_number}</span></p>
            </div>

            <div className="p-8 space-y-8">
              {/* Amount Display */}
              <div className="text-center">
                <p className="text-gray-600 mb-1">Total Amount to Pay</p>
                <p className="text-4xl font-bold text-gray-900">
                  ₹{booking.total_amount.toLocaleString()}
                </p>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 shadow-sm">
                  {/* QR Code */}
                  <div className="relative group cursor-pointer" onClick={() => setIsEnlarged(true)}>
                    <div className="w-64 h-64 bg-white flex items-center justify-center relative overflow-hidden rounded-lg">
                      <QRCodeSVG
                        value={`upi://pay?pa=${UPI_ID}&pn=Union%20Bank%20Emp%20Asso&am=${booking.total_amount}&cu=INR&tn=Payment`}
                        size={256}
                        level={"H"}
                        marginSize={4}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center">
                      <p className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-opacity">
                        Click to enlarge
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">Click QR code to enlarge</p>
                </div>

                {/* Enlarged QR Modal */}
                {isEnlarged && (
                  <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsEnlarged(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white p-4 rounded-2xl max-w-sm w-full relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setIsEnlarged(false)}
                        className="absolute -top-12 right-0 text-white hover:text-gray-200"
                      >
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                      </button>
                      <div className="aspect-square relative w-full bg-white rounded-xl overflow-hidden flex items-center justify-center">
                        <QRCodeSVG
                          value={`upi://pay?pa=${UPI_ID}&pn=Union%20Bank%20Emp%20Asso&am=${booking.total_amount}&cu=INR&tn=Payment`}
                          size={300}
                          level={"H"}
                          marginSize={4}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-center mt-4 text-gray-600 font-medium">Scan to Pay</p>
                    </motion.div>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  <span className="font-mono font-medium text-gray-700">{UPI_ID}</span>
                  <button
                    onClick={handleCopyUPI}
                    className="text-brown-dark hover:text-brown-medium transition-colors"
                    title="Copy UPI ID"
                  >
                    <Copy size={20} />
                  </button>
                </div>

                <a
                  href={`upi://pay?pa=${UPI_ID}&pn=Union%20Bank%20Emp%20Asso&am=${booking.total_amount}&cu=INR&tn=Payment`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Click to open UPI App
                </a>
              </div>

              {/* Instructions */}
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-900">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                  <li>Scan the QR code or copy the UPI ID above.</li>
                  <li>Make the payment of <strong>₹{booking.total_amount.toLocaleString()}</strong> using any UPI app.</li>
                  <li>Take a screenshot of the payment success screen.</li>
                  <li><strong>Upload the screenshot below</strong> or send it on WhatsApp.</li>
                  <li>Click "I Have Made the Payment" to confirm.</li>
                </ol>
              </div>

              {/* Screenshot Upload Section */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Upload size={20} className="text-brown-dark" />
                  Upload Payment Screenshot
                </h3>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleScreenshotChange}
                    className="hidden"
                    id="screenshot-upload"
                  />

                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <div className="relative border-2 border-green-200 rounded-xl overflow-hidden bg-gray-50">
                        <img
                          src={screenshotPreview}
                          alt="Payment Screenshot"
                          className="w-full max-h-48 object-contain"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={14} weight="fill" />
                            Selected
                          </span>
                        </div>
                      </div>
                      <label
                        htmlFor="screenshot-upload"
                        className="text-sm text-blue-600 hover:underline cursor-pointer inline-block"
                      >
                        Change screenshot
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="screenshot-upload"
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brown-dark hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon size={40} className="text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Click to upload screenshot</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or WEBP (max 5MB)</p>
                    </label>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Or share via WhatsApp (optional)
                </p>
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full py-2.5 bg-[#25D366]/10 text-[#128C7E] border border-[#25D366] rounded-xl font-medium hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <WhatsappLogo size={20} weight="fill" />
                  Send on WhatsApp
                </button>
              </div>

              {/* Main Submit Button */}
              <div className="pt-4">
                <button
                  onClick={handlePaymentComplete}
                  disabled={isSubmitting || isUploading}
                  className="w-full py-4 bg-brown-dark text-white rounded-xl font-semibold hover:bg-brown-medium transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 text-lg"
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      {isUploading ? "Uploading..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} weight="fill" />
                      I Have Made the Payment
                    </>
                  )}
                </button>
                {!screenshotFile && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Tip: Uploading a screenshot helps speed up verification
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
