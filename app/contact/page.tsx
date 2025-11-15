"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, EnvelopeSimple, Clock, IdentificationCard } from "@phosphor-icons/react";
import { toast } from "sonner";

interface PropertySettings {
  property_name: string;
  address: string;
  phone: string;
  email: string;
  check_in_time: string;
  check_out_time: string;
  gst_number: string;
  google_maps_embed_url: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<PropertySettings>({
    property_name: "Happy Holidays Guest House",
    address: "94, Hanuman Nagar, Narmadapuram Road, near Shani Mandir and SMH Hospital, behind UcoBank, Bhopal",
    phone: "+91 9926770259",
    email: "info@happyholidays.com",
    check_in_time: "14:00",
    check_out_time: "11:00",
    gst_number: "",
    google_maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3665.4598739812!2d77.42277477535677!3d23.23629397906128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c431e5f426f07%3A0x9c6ea93cdbb8c26c!2sHappy%20Holidays%20Guest%20House!5e0!3m2!1sen!2sin!4v1735718000000!5m2!1sen!2sin"
  });

  useEffect(() => {
    const loadPropertySettings = async () => {
      try {
        const response = await fetch('/api/admin/property-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Error loading property settings:', error);
      }
    };

    loadPropertySettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent successfully! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <main className="min-h-screen relative">
      <ChaletHeader />

      {/* Full Screen Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/contact-bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
              <h2 className="font-serif text-3xl font-bold text-white mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 1234567890"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiry-type" className="text-white">
                    Inquiry Type
                  </Label>
                  <select
                    id="inquiry-type"
                    className="flex h-11 w-full rounded-lg border border-white/20 bg-white/10 text-white px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/40"
                  >
                    <option value="general" className="bg-gray-900">
                      General Inquiry
                    </option>
                    <option value="booking" className="bg-gray-900">
                      Booking Question
                    </option>
                    <option value="event" className="bg-gray-900">
                      Event Inquiry
                    </option>
                    <option value="feedback" className="bg-gray-900">
                      Feedback
                    </option>
                    <option value="other" className="bg-gray-900">
                      Other
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">
                    Message *
                  </Label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="flex w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/50 px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-serif text-3xl font-bold text-white mb-6">
                Get in Touch
              </h2>
              <p className="text-white/80 leading-relaxed">
                Have questions? We're here to help. Reach out to us through any
                of the channels below or fill out the contact form.
              </p>
            </div>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} weight="fill" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Address</h3>
                  <p className="text-white/70 whitespace-pre-line">
                    {settings.address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={24} weight="fill" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Phone</h3>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="text-white/80 hover:text-white"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <EnvelopeSimple
                    size={24}
                    weight="fill"
                    className="text-white"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Email</h3>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-white/80 hover:text-white"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              {/* Check-in/Check-out Time */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={24} weight="fill" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Check-in / Check-out
                  </h3>
                  <p className="text-white/70">
                    {new Date(`2000-01-01T${settings.check_in_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    {' / '}
                    {new Date(`2000-01-01T${settings.check_out_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>

              {/* GST Number */}
              {settings.gst_number && (
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IdentificationCard size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">GST Number</h3>
                    <p className="text-white/70">{settings.gst_number}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-gray-200 rounded-2xl overflow-hidden h-64">
              <iframe
                src={settings.google_maps_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
