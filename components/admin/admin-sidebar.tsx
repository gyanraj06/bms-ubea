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
    name: "Communication",
    href: "/admin/dashboard/communication",
    icon: ChatCircleText,
    permissionKey: "communication",
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

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
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

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
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
    </>
  );
}
