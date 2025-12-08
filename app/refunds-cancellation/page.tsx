"use client";

import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";

export default function RefundsCancellationPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Refunds & Cancellation Policy
        </h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: January 2025</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Union Awaas Happy Holiday Guest House, we understand that plans can change. This Refunds & Cancellation Policy outlines the terms and conditions regarding booking cancellations, no-shows, and refund processing. By making a reservation with us, you agree to the terms described below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cancellation Policy</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Standard Bookings</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              For standard room reservations, the following cancellation charges apply:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Free Cancellation:</strong> If cancelled at least 48 hours prior to the check-in time (14:00 PM).</li>
              <li><strong>50% Charge:</strong> If cancelled between 48 hours and 24 hours prior to check-in time.</li>
              <li><strong>100% Charge:</strong> If cancelled less than 24 hours before check-in time or in case of a no-show.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Group Bookings & Events</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              For group bookings (3 or more rooms) or event hall reservations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Free Cancellation:</strong> If cancelled at least 7 days prior to the scheduled arrival/event date.</li>
              <li><strong>50% Charge:</strong> If cancelled between 7 days and 72 hours prior to the scheduled arrival/event date.</li>
              <li><strong>100% Charge:</strong> If cancelled less than 72 hours before the scheduled arrival/event date.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds for eligible cancellations will be processed as follows:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Refunds will be initiated within 48 hours of cancellation confirmation.</li>
              <li>The amount will be credited back to the original payment method used during booking.</li>
              <li>Depending on your bank or credit card issuer, it may take <strong>5-7 business days</strong> for the amount to reflect in your account.</li>
              <li>Any transaction fees or bank charges incurred during the initial booking may be deducted from the refund amount, if applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. No-Show Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              If you fail to arrive on the scheduled check-in date without prior cancellation ("No-Show"), the entire booking amount for the full stay will be charged as a cancellation fee, and no refund will be issued. The room will be held until 10:00 AM the following day, after which it will be released.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Early Departure</h2>
            <p className="text-gray-700 leading-relaxed">
              Guests who check out of the hotel prior to their scheduled departure date are subject to an early departure fee equivalent to one night's room charge plus tax.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact for Cancellations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To cancel or modify your booking, please contact us immediately:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-900 font-semibold">Reservations Desk</p>
              <p className="text-gray-700">Phone: +91 9926770259</p>
              <p className="text-gray-700">Email: info@happyholidays.com</p>
              <p className="text-gray-700 mt-2">
                Please have your booking reference number ready when contacting us.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
