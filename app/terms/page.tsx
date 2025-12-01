"use client";

import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: January 2025</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Happy Holidays Guest House. By accessing our website, making a booking, or using our services, you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations of India. If you do not agree with any of these terms, you are prohibited from using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>"Guest"</strong> refers to any person who makes a booking or stays at our property</li>
              <li><strong>"Property"</strong> refers to Happy Holidays Guest House located in Bhopal, Madhya Pradesh</li>
              <li><strong>"Services"</strong> refers to accommodation and related services provided by us</li>
              <li><strong>"Website"</strong> refers to our online booking platform</li>
              <li><strong>"Booking"</strong> refers to a confirmed reservation for accommodation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Reservations</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Booking Process</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>All bookings are subject to availability</li>
              <li>A booking is confirmed only after payment confirmation or advance deposit receipt</li>
              <li>You must be at least 18 years of age to make a booking</li>
              <li>All information provided during booking must be accurate and complete</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Guest Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              In compliance with the Hotel and Lodging House Act and local police regulations, all guests must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide valid government-issued photo identification at check-in</li>
              <li>Fill out the mandatory guest registration form (Form C for foreign nationals)</li>
              <li>Provide accurate contact information and address details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Payment Methods</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We accept the following payment methods:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Credit/Debit Cards (Visa, Mastercard, RuPay)</li>
              <li>UPI (Unified Payments Interface)</li>
              <li>Net Banking</li>

            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Pricing and Taxes</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>All prices are listed in Indian Rupees (INR)</li>
              <li>Prices are subject to applicable GST (Goods and Services Tax) as per Indian tax laws</li>
              <li>We reserve the right to modify prices without prior notice</li>
              <li>The price applicable at the time of booking confirmation will be honored</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Advance Payment</h3>
            <p className="text-gray-700 leading-relaxed">
              An advance payment or full payment may be required at the time of booking. The amount will be clearly communicated during the booking process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Check-in and Check-out</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Timings</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>Check-in/Check-out:</strong> 24 hours from the time of arrival</li>
              <li>Early check-in and late check-out are subject to availability and may incur additional charges</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Identification Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Valid identification documents accepted:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Aadhaar Card</li>
              <li>PAN Card</li>
              <li>Passport</li>
              <li>Driving License</li>
              <li>Voter ID Card</li>
            </ul>
          </section>



          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Guest Conduct and Responsibilities</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Code of Conduct</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Guests are expected to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Respect other guests and maintain peaceful environment</li>
              <li>Comply with all property rules and Indian laws</li>
              <li>Not engage in illegal activities on the premises</li>
              <li>Not cause damage to property or amenities</li>
              <li>Not exceed the maximum occupancy limit</li>
              <li>Not smoke in non-smoking areas</li>
              <li>Not bring pets without prior permission</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Prohibited Activities</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Possession or consumption of illegal substances</li>
              <li>Hosting unauthorized visitors</li>
              <li>Creating excessive noise or disturbance</li>
              <li>Commercial activities without permission</li>
              <li>Subletting or transferring the booking</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.3 Right to Eviction</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to terminate your stay without refund if you violate these terms, engage in illegal activities, or cause disturbance to other guests or property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Liability and Damages</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Guest Liability</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Guests are liable for any damage caused to the property, furniture, fixtures, or amenities</li>
              <li>Charges for damages will be assessed and billed to the guest</li>
              <li>We reserve the right to charge the payment method on file for any damages</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.2 Property Liability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We take reasonable precautions for guest safety, however:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>We are not liable for loss, theft, or damage to personal belongings</li>
              <li>Guests should use in-room safes for valuables</li>
              <li>Our liability is limited to the extent permitted by Indian law</li>
              <li>We maintain appropriate insurance coverage as required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Force Majeure</h2>
            <p className="text-gray-700 leading-relaxed">
              We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable control, including but not limited to: natural disasters, acts of God, war, terrorism, civil unrest, strikes, pandemics, government restrictions, or power failures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property of Happy Holidays Guest House or its licensors and is protected by Indian copyright laws and international intellectual property treaties. Unauthorized use is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of our services is also governed by our Privacy Policy, which complies with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">12.1 Governing Law</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">12.2 Jurisdiction</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Any disputes arising out of or relating to these Terms or the use of our services shall be subject to the exclusive jurisdiction of the courts in Bhopal, Madhya Pradesh, India.
            </p>


          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any such changes constitutes your acceptance of the new Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid under applicable law, such unenforceability or invalidity shall not render these Terms unenforceable or invalid as a whole. Such provisions shall be deleted without affecting the remaining provisions.
            </p>
          </section>



          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Acknowledgment</h2>
            <p className="text-gray-700 leading-relaxed">
              By making a booking or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
