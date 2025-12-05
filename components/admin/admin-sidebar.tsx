"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SquaresFour,
  CalendarCheck,
  CurrencyCircleDollar,
  ChatCircleText,
  Images,
  ChartBar,
  GearSix,
  SignOut,
  List,
  X,
  WarningCircle,
  WhatsappLogo,
  NewspaperClipping,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePermissions } from "@/contexts/permission-context";

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  permissionKey: string;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: SquaresFour,
    permissionKey: "dashboard",
  },
  {
    name: "Bookings",
    href: "/admin/dashboard/bookings",
    icon: CalendarCheck,
    permissionKey: "bookings",
  },
  {
    name: "Payments & Finance",
    href: "/admin/dashboard/payments",
    icon: CurrencyCircleDollar,
    permissionKey: "payments",
  },

  {
    name: "Property & Media",
    href: "/admin/dashboard/media",
    icon: Images,
    permissionKey: "media",
  },
  {
    name: "Reports & Analytics",
    href: "/admin/dashboard/reports",
    icon: ChartBar,
    permissionKey: "reports",
  },
  {
    name: "Newsletter",
    href: "/admin/dashboard/newsletter",
    icon: NewspaperClipping,
    permissionKey: "newsletter",
  },
  {
    name: "Settings",
    href: "/admin/dashboard/settings",
    icon: GearSix,
    permissionKey: "settings",
  },
];

interface AdminSidebarProps {
  userRole: string;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueText, setIssueText] = useState("");

  const handleRaiseIssue = () => {
    const phoneNumber = "919424559252";
    const encodedMessage = encodeURIComponent(issueText);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setIsIssueModalOpen(false);
    setIssueText("");
  };

  // Filter menu items based on dynamic permissions
  const filteredMenuItems = menuItems.filter((item) => {
    return hasPermission(item.permissionKey, userRole);
  });

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X size={24} className="text-brown-dark" weight="bold" />
        ) : (
          <List size={24} className="text-brown-dark" weight="bold" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="font-serif text-2xl font-semibold text-brown-dark">
              Happy Holidays
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brown-dark rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userRole.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{userRole}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                      isActive
                        ? "bg-brown-dark text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon size={20} weight={isActive ? "fill" : "regular"} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Raise Issue & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <WarningCircle size={20} weight="regular" />
            <span>Raise an Issue</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <SignOut size={20} weight="bold" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 lg:hidden overflow-y-auto"
        >
          {/* Logo */}
          <div className="h-20 flex items-center justify-center border-b border-gray-200">
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="font-serif text-xl font-semibold text-brown-dark">
                Happy Holidays
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brown-dark rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userRole.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{userRole}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-3">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                        isActive
                          ? "bg-brown-dark text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon size={20} weight={isActive ? "fill" : "regular"} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Raise Issue & Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsIssueModalOpen(true);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <WarningCircle size={20} weight="regular" />
              <span>Raise an Issue</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <SignOut size={20} weight="bold" />
              <span>Logout</span>
            </button>
          </div>
        </motion.aside>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Raise Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Raise an Issue</h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe the issue
                </label>
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Please describe the issue you are facing..."
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-dark focus:border-transparent outline-none resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRaiseIssue}
                  disabled={!issueText.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#25D366] rounded-lg hover:bg-[#128C7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <WhatsappLogo size={20} weight="fill" />
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
