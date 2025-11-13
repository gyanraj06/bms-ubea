"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, UserCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Book Now", href: "/booking", highlight: true },
];

export function ChaletHeader({ forceLight = false }: { forceLight?: boolean }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldShowLight = forceLight || isScrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        shouldShowLight ? "bg-white shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span
              className={cn(
                "font-serif text-2xl font-semibold transition-colors",
                shouldShowLight ? "text-brown-dark" : "text-white"
              )}
            >
              Happy Holidays
            </span>
          </Link>

          {/* Desktop Navigation - Minimal Text Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  item.highlight
                    ? "px-6 py-2.5 bg-brown-dark text-white rounded-full hover:bg-brown-medium"
                    : pathname === item.href
                    ? shouldShowLight
                      ? "text-brown-dark"
                      : "text-white font-semibold"
                    : shouldShowLight
                    ? "text-gray-600 hover:text-brown-dark"
                    : "text-white/80 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Login Icon */}
            <Link
              href="/login"
              className={cn(
                "p-2 rounded-full transition-all",
                pathname === "/login"
                  ? shouldShowLight
                    ? "bg-brown-dark text-white"
                    : "bg-white text-brown-dark"
                  : shouldShowLight
                  ? "text-gray-600 hover:text-brown-dark hover:bg-gray-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              aria-label="Login"
            >
              <UserCircle size={28} weight="fill" />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X
                size={28}
                className={shouldShowLight ? "text-brown-dark" : "text-white"}
                weight="bold"
              />
            ) : (
              <List
                size={28}
                className={shouldShowLight ? "text-brown-dark" : "text-white"}
                weight="bold"
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block text-base font-medium py-2 transition-colors",
                      item.highlight
                        ? "px-6 py-3 bg-brown-dark text-white rounded-full text-center"
                        : pathname === item.href
                        ? "text-brown-dark font-semibold"
                        : "text-gray-600 hover:text-brown-dark"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Login Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navigation.length * 0.1 }}
              >
                <Link
                  href="/login"
                  className={cn(
                    "flex items-center gap-2 text-base font-medium py-2 transition-colors",
                    pathname === "/login"
                      ? "text-brown-dark font-semibold"
                      : "text-gray-600 hover:text-brown-dark"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle size={24} weight="fill" />
                  <span>Login</span>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
