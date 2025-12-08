"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FacebookLogo,
  InstagramLogo,
  TwitterLogo,
  EnvelopeSimple,
  Phone,
  MapPin,
  Clock,
  IdentificationCard,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PropertySettings {
  property_name: string;
  address: string;
  phone: string;
  email: string;
  gst_number: string;
  check_in_time: string;
  check_out_time: string;
  google_maps_embed_url: string;
  description: string;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<PropertySettings>({
    property_name: "Happy Holidays Guest House",
    address: "94, Hanuman Nagar, Narmadapuram Road, near Shani Mandir and SMH Hospital, behind UcoBank, Bhopal",
    phone: "+91 9926770259",
    email: "ubeampcg@gmail.com",
    gst_number: "",
    check_in_time: "14:00",
    check_out_time: "11:00",
    google_maps_embed_url: "",
    description: "",
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

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-4">
              <img
                src="/logo.png"
                alt="Happy Holidays"
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Experience unparalleled Service and comfort. Your perfect stay
              awaits.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about" },
                { name: "Event Hall", href: "/event-hall" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <MapPin
                  size={20}
                  className="text-primary-400 mt-0.5 flex-shrink-0"
                  weight="fill"
                />
                <span className="text-gray-400 whitespace-pre-line">
                  {settings.address}
                </span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone
                  size={20}
                  className="text-primary-400 flex-shrink-0"
                  weight="fill"
                />
                <a
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <EnvelopeSimple
                  size={20}
                  className="text-primary-400 flex-shrink-0"
                  weight="fill"
                />
                <a
                  href={`mailto:${settings.email}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <Clock
                  size={20}
                  className="text-primary-400 mt-0.5 flex-shrink-0"
                  weight="fill"
                />
                <div>
                  <div className="text-gray-400">
                    <span className="font-semibold text-white">Check-in/out:</span> 24 hours from arrival
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © {currentYear} Happy Holidays. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Crafted by{" "}
                <a
                  href="https://megabytecode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  MegabyteCode
                </a>{" "}
                under{" "}
                <span className="text-primary-400">MounterraInnovations</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/legal-notice"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Legal Notice
              </Link>
              <Link
                href="/refunds-cancellation"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Refunds & Cancellation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
