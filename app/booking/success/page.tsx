"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, CalendarCheck } from "@phosphor-icons/react";

import { Suspense } from "react";

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const bookingNumber = searchParams.get("bookingNumber");
  const bookingIds = searchParams.get("bookingIds");

  useEffect(() => {
    // Don't redirect immediately - show success message even without params
    if (!bookingId && !bookingNumber && !bookingIds) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000); // Redirect after 5 seconds if no booking info

      return () => clearTimeout(timer);
    }
  }, [bookingId, bookingNumber, bookingIds, router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle size={64} weight="fill" className="text-green-600" />
            </motion.div>

            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-3">
              {bookingIds ? "Booking Created!" : "Booking Confirmed!"}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              You will be intimated within 24-48 hours. Feel free to contact us in case of any queries
            </p>
            {bookingNumber && (
              <div className="inline-block bg-primary-50 px-6 py-3 rounded-lg mt-4">
                <p className="text-sm text-gray-600 mb-1">Booking Number</p>
                <p className="text-2xl font-bold text-primary-700">{bookingNumber}</p>
              </div>
            )}
            {bookingIds && !bookingNumber && (
              <div className="inline-block bg-primary-50 px-6 py-3 rounded-lg mt-4">
                <p className="text-sm text-gray-600 mb-1">Bookings Created</p>
                <p className="text-xl font-bold text-primary-700">{bookingIds.split(',').length} Rooms</p>
              </div>
            )}
          </div>

          {/* Confirmation Message */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <CalendarCheck size={48} weight="fill" className="text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Your booking has been Created
              </h2>
              <p className="text-gray-600">
                A confirmation email will be sent to your registered email address once your payment is verified
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <ArrowRight size={20} className="text-primary-600 mr-2 mt-0.5 flex-shrink-0" weight="bold" />
                  <span>Check your email for booking confirmation and details</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight size={20} className="text-primary-600 mr-2 mt-0.5 flex-shrink-0" weight="bold" />
                  <span>You can view your booking anytime from "My Bookings"</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight size={20} className="text-primary-600 mr-2 mt-0.5 flex-shrink-0" weight="bold" />
                  <span>Please arrive after the check-in time mentioned in your booking</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight size={20} className="text-primary-600 mr-2 mt-0.5 flex-shrink-0" weight="bold" />
                  <span>Contact us if you need any assistance or have special requests</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/my-bookings")}
              className="w-full h-12 bg-brown-dark hover:bg-brown-medium text-white"
            >
              View My Bookings
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-12 border-brown-dark text-brown-dark hover:bg-brown-dark hover:text-white"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark mb-4"></div>
          <p className="text-gray-600 font-medium">Finalizing booking...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
