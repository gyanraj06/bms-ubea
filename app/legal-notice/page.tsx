"use client";

import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";

export default function LegalNoticePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Legal Notice
        </h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: January 2025</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Website Owner and Publisher</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-2">
              <p className="text-gray-900 font-semibold text-lg">Happy Holidays Guest House</p>
              <p className="text-gray-700"><strong>Business Type:</strong> Guest House / Lodging Establishment</p>
              <p className="text-gray-700"><strong>Location:</strong> Bhopal, Madhya Pradesh, India</p>
              <p className="text-gray-700"><strong>Email:</strong> info@happyholidays.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 [Phone Number]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Business Registration</h2>
            <p className="text-gray-700 leading-relaxed">
              Happy Holidays Guest House operates in compliance with all applicable Indian laws and regulations, including the Hotel and Lodging House Act and local municipal regulations of Bhopal, Madhya Pradesh.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Website Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This website serves as the official online booking platform for Happy Holidays Guest House. The website provides information about our accommodation services, facilities, pricing, and enables online reservations.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Domain:</strong> [Your Domain Name]</li>
              <li><strong>Hosted in:</strong> India (or specify hosting location)</li>
              <li><strong>Technical Support:</strong> info@happyholidays.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content on this website, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Text, graphics, logos, and images</li>
              <li>Design elements and layout</li>
              <li>Software and source code</li>
              <li>Audio and video content</li>
              <li>Trademarks and service marks</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              are the exclusive property of Happy Holidays Guest House or its licensors and are protected by Indian and international copyright laws, trademark laws, and other intellectual property rights. Unauthorized use, reproduction, or distribution is strictly prohibited and may result in legal action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Copyright Notice</h2>
            <p className="text-gray-700 leading-relaxed">
              © 2025 Happy Holidays Guest House. All rights reserved. No part of this website may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of Happy Holidays Guest House.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Terms and Conditions</h2>
            <p className="text-gray-700 leading-relaxed">
              Use of this website is subject to our comprehensive Terms of Service. By accessing or using this website, you acknowledge that you have read, understood, and agree to be bound by our Terms of Service. Please review our{" "}
              <a href="/terms" className="text-brown-dark font-semibold hover:underline">
                Terms of Service
              </a>{" "}
              for complete details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              We are committed to protecting your privacy and personal data in accordance with the Information Technology Act, 2000, the IT Rules, 2011, and the Digital Personal Data Protection Act, 2023. For detailed information about how we collect, use, and protect your personal information, please review our{" "}
              <a href="/privacy" className="text-brown-dark font-semibold hover:underline">
                Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to provide accurate and up-to-date information on this website:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>The website and its content are provided "as is" without warranties of any kind</li>
              <li>We do not guarantee uninterrupted or error-free operation of the website</li>
              <li>Information on the website may contain technical inaccuracies or typographical errors</li>
              <li>Pricing, availability, and other details are subject to change without notice</li>
              <li>We reserve the right to modify, suspend, or discontinue any aspect of the website at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by Indian law, Happy Holidays Guest House shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use or inability to use this website, including but not limited to damages for loss of profits, data, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Links and Content</h2>
            <p className="text-gray-700 leading-relaxed">
              This website may contain links to third-party websites or services that are not owned or controlled by Happy Holidays Guest House. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites. You acknowledge and agree that we shall not be liable for any damage or loss caused by or in connection with the use of any such third-party content or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users of this website agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide accurate and truthful information when making bookings</li>
              <li>Not use the website for any unlawful purpose</li>
              <li>Not attempt to gain unauthorized access to any part of the website</li>
              <li>Not transmit any viruses, malware, or harmful code</li>
              <li>Not engage in any activity that disrupts or interferes with the website's operation</li>
              <li>Respect the intellectual property rights of Happy Holidays Guest House</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Compliance with Indian Laws</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This website and our services comply with the following Indian laws and regulations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Information Technology Act, 2000</li>
              <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
              <li>Digital Personal Data Protection Act, 2023</li>
              <li>Hotel and Lodging House Act (applicable state legislation)</li>
              <li>Consumer Protection Act, 2019</li>
              <li>Goods and Services Tax (GST) Act, 2017</li>
              <li>Contract Act, 1872</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 leading-relaxed">
              This Legal Notice and your use of this website shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from or relating to this website or its use shall be subject to the exclusive jurisdiction of the courts located in Bhopal, Madhya Pradesh, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Grievance Redressal</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, we have appointed a Grievance Officer to address any concerns or complaints:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-900 font-semibold">Grievance Officer</p>
              <p className="text-gray-700">Happy Holidays Guest House</p>
              <p className="text-gray-700">Bhopal, Madhya Pradesh, India</p>
              <p className="text-gray-700">Email: grievance@happyholidays.com</p>
              <p className="text-gray-700 mt-2">
                <strong>Response Time:</strong> We aim to acknowledge all complaints within 24 hours and resolve them within 30 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Modifications to This Legal Notice</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify this Legal Notice at any time without prior notice. Any changes will be effective immediately upon posting on this page. The "Last Updated" date at the top of this page indicates when this Legal Notice was last revised. Your continued use of the website after any such changes constitutes your acceptance of the modified Legal Notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of this Legal Notice is found to be unenforceable or invalid under applicable law, such unenforceability or invalidity shall not render this Legal Notice unenforceable or invalid as a whole. Such provisions shall be deleted or modified to the extent necessary, without affecting the remaining provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. GST Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All prices displayed on this website are subject to applicable Goods and Services Tax (GST) as per Indian tax laws. The current GST rate applicable to accommodation services is:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>GST Rate:</strong> 12% on room tariff</p>
              <p className="text-gray-700"><strong>GSTIN:</strong> [Your GST Number]</p>
              <p className="text-gray-700 mt-2 text-sm">
                GST will be charged separately and will be clearly indicated in your booking confirmation and invoice.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Language</h2>
            <p className="text-gray-700 leading-relaxed">
              This Legal Notice is written in English. In the event of any conflict between the English version and any translation, the English version shall prevail.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">19. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For any questions, concerns, or feedback regarding this Legal Notice or our website, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-900 font-semibold">Happy Holidays Guest House</p>
              <p className="text-gray-700">Bhopal, Madhya Pradesh, India</p>
              <p className="text-gray-700">Email: info@happyholidays.com</p>
              <p className="text-gray-700">Phone: +91 [Phone Number]</p>
              <p className="text-gray-700 mt-2">
                <strong>Business Hours:</strong> 9:00 AM - 9:00 PM (All days)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">20. Acknowledgment</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using this website, you acknowledge that you have read, understood, and agree to be bound by this Legal Notice, along with our Terms of Service and Privacy Policy. If you do not agree with any part of this Legal Notice, you must discontinue use of this website immediately.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Related Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/terms"
                className="p-4 bg-tan-light rounded-lg hover:bg-tan transition-colors border border-tan"
              >
                <p className="font-semibold text-brown-dark mb-1">Terms of Service</p>
                <p className="text-sm text-gray-600">Complete terms and conditions for using our services</p>
              </a>
              <a
                href="/privacy"
                className="p-4 bg-tan-light rounded-lg hover:bg-tan transition-colors border border-tan"
              >
                <p className="font-semibold text-brown-dark mb-1">Privacy Policy</p>
                <p className="text-sm text-gray-600">How we collect, use, and protect your personal data</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
