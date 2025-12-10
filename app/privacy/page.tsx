"use client";

import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: January 2025</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Union Awas Happy Holiday Guest House ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect the following personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Residential address (city, state, PIN code)</li>
              <li>Identity proof details (Aadhaar, PAN, Passport, Driving License, or Voter ID number)</li>
              <li>Payment information</li>
              <li>Booking and reservation details</li>
              <li>Special requests and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Purpose of Collection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect and process your personal data for the following lawful purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Processing room bookings and reservations</li>
              <li>Compliance with legal obligations under the Hotel and Lodging House Act and local regulations</li>
              <li>Verification of identity as required by law enforcement authorities</li>
              <li>Payment processing and transaction completion</li>
              <li>Sending booking confirmations and updates</li>
              <li>Customer service and support</li>
              <li>Improving our services and website functionality</li>
              <li>Marketing communications (with your consent)</li>
              <li>Fraud prevention and security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 leading-relaxed">
              We process your personal data on the following legal grounds:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li><strong>Contractual Necessity:</strong> To fulfill our obligations under the booking contract</li>
              <li><strong>Legal Obligation:</strong> Compliance with Indian laws including maintaining guest records as per police regulations</li>
              <li><strong>Consent:</strong> For marketing communications and optional services</li>
              <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Guest records are maintained for a minimum period as required by local police regulations and the Hotel and Lodging House Act.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Law Enforcement:</strong> When required by law or in response to valid legal requests</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our website and services (payment gateways, email services)</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition of all or part of our business</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement reasonable security practices and procedures as mandated by the IT Act, 2000 and Rules, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>Encryption of sensitive data during transmission (SSL/TLS)</li>
              <li>Secure storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Firewall and intrusion detection systems</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under the Digital Personal Data Protection Act, 2023 and other applicable laws, you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
              <li><strong>Right to Grievance Redressal:</strong> File a complaint with our Grievance Officer</li>
              <li><strong>Right to Nominate:</strong> Nominate another individual to exercise your rights in case of death or incapacity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience. You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Grievance Officer</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, we have appointed a Grievance Officer to address your concerns:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-900 font-semibold">Grievance Officer</p>
              <p className="text-gray-700">Union Awas Happy Holiday Guest House</p>
              <p className="text-gray-700">Bhopal, Madhya Pradesh</p>
              <p className="text-gray-700">Email: privacy@happyholidays.com</p>
              <p className="text-gray-700 mt-2">
                Response Time: We aim to respond to all grievances within 72 hours and resolve them within 30 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your personal data is primarily stored and processed within India. If we transfer data outside India, we ensure appropriate safeguards are in place as required by Indian data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-900 font-semibold">Union Awas Happy Holiday Guest House</p>
              <p className="text-gray-700">Bhopal, Madhya Pradesh, India</p>
              <p className="text-gray-700">Email: info@happyholidays.com</p>
              <p className="text-gray-700">Phone: +91 [Phone Number]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Consent</h2>
            <p className="text-gray-700 leading-relaxed">
              By using our website and services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your personal information as described herein.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
