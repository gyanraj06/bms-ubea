import Link from "next/link";
import {
  FacebookLogo,
  InstagramLogo,
  TwitterLogo,
  EnvelopeSimple,
  Phone,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div>
            <h2 className="font-serif text-2xl font-bold mb-4">
              Happy Holidays
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Experience unparalleled luxury and comfort. Your perfect stay
              awaits.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <InstagramLogo size={20} weight="fill" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <TwitterLogo size={20} weight="fill" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Rooms & Suites", href: "/rooms" },
                { name: "Gallery", href: "/gallery" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
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
                <span className="text-gray-400">
                  94, Hanuman Nagar, Narmadapuram Road,
                  <br />
                  near Shani Mandir and SMH Hospital,
                  <br />
                  behind UcoBank, Bhopal
                </span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone
                  size={20}
                  className="text-primary-400 flex-shrink-0"
                  weight="fill"
                />
                <a
                  href="tel:+919926770259"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +91 9926770259
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <EnvelopeSimple
                  size={20}
                  className="text-primary-400 flex-shrink-0"
                  weight="fill"
                />
                <a
                  href="mailto:info@happyholidays.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  info@happyholidays.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Info</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your perfect stay awaits at Happy Holidays Guest House. Experience
              comfort and hospitality in the heart of Bhopal.
            </p>
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
