"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Sparkle, Heart, Users, Trophy, MapPin, Phone, EnvelopeSimple, Clock, IdentificationCard } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function AboutPage() {
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

  const values = [
    {
      icon: Users,
      title: "Community First",
      description:
        "A dedicated facility created exclusively for UBEA and AIBEA members, fostering a strong sense of union community and trust.",
    },
    {
      icon: Heart,
      title: "Member-Centric Service",
      description:
        "Every aspect is managed with our members in mind, providing unparalleled value and convenience at subsidized rates.",
    },
    {
      icon: Sparkle,
      title: "Comfort & Security",
      description:
        "A comfortable, secure haven where members and their families can feel truly at home, away from commercial complexities.",
    },
    {
      icon: Trophy,
      title: "Continuous Enhancement",
      description:
        "Dedicated to enhancing the Union Awaas experience, serving our growing family of members with excellence.",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader />

      {/* Hero Banner */}
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
            Our Story: A Home for Our Members
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
            A dedicated initiative by UBEA and AIBEA to provide a comfortable,
            secure, and affordable haven for our members
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              Introduction
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              The Union Awaas in Bhopal is more than just a guest house; it's a dedicated
              initiative by the United Bank Employees' Association (UBEA) and the All India
              Bank Employees' Association (AIBEA) to provide a comfortable, secure, and
              affordable haven for our esteemed members and their families.
            </p>

            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              The Vision
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Our journey began with a clear vision: to create a dedicated facility that caters
              specifically to the needs of our union members – serving officers, employees, and
              retirees alike. Recognizing the challenges of finding suitable accommodation during
              travel or official visits, UBEA and AIBEA collaborated to establish a space where
              members could feel truly at home, away from the complexities of commercial hotels.
            </p>

            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              Our Commitment to Members
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Every aspect of Union Awaas is managed with our members in mind. From the carefully
              maintained facilities to the exclusive, subsidized tariffs, our aim is to provide
              unparalleled value and convenience. We understand the importance of trust and community
              within our union, and Union Awaas stands as a testament to that commitment.
            </p>

            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown-dark mb-6">
              Looking Ahead
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              As we continue to serve our growing family of members, we remain dedicated to enhancing
              the Union Awaas experience. We invite all eligible UBEA and AIBEA members to experience
              the comfort, convenience, and community spirit of their very own holiday home in Bhopal.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon
                      size={40}
                      weight="fill"
                      className="text-primary-600"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-20">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/contact-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
                    className="w-full px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
      </div>

      <Footer />
    </main>
  );
}
