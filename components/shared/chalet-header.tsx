"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, UserCircle, SignOut, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

const navigation = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Book Now", href: "/booking", highlight: true },
];

export function ChaletHeader({ forceLight = false }: { forceLight?: boolean }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      // Close menu immediately before signing out
      setShowUserMenu(false);
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Close dropdown when user logs out
  useEffect(() => {
    if (!user) {
      setShowUserMenu(false);
    }
  }, [user]);

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

            {/* User Menu */}
            {!loading && user && (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-full transition-all",
                    shouldShowLight
                      ? "text-brown-dark hover:bg-gray-100"
                      : "text-white hover:bg-white/10"
                  )}
                  aria-label="User menu"
                >
                  <UserCircle size={28} weight="fill" />
                  <span className="text-sm font-medium hidden lg:block">
                    {user.full_name.split(" ")[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence mode="wait">
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={18} />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/bookings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserCircle size={18} />
                          <span>My Bookings</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <SignOut size={18} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Login Button (when logged out) */}
            {!loading && !user && (
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
            )}
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

              {/* Mobile User Menu */}
              {!loading && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigation.length * 0.1 }}
                  className="border-t border-gray-200 pt-4 mt-2"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 text-base font-medium py-2 text-gray-600 hover:text-brown-dark transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User size={24} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/bookings"
                        className="flex items-center gap-3 text-base font-medium py-2 text-gray-600 hover:text-brown-dark transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircle size={24} />
                        <span>My Bookings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-base font-medium py-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <SignOut size={24} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
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
                  )}
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
