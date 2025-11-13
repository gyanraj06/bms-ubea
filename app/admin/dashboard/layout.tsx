"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PermissionProvider } from "@/contexts/permission-context";
import { toast } from "sonner";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const adminUser = localStorage.getItem("adminUser");

    if (!adminUser) {
      toast.error("Please login to access admin dashboard");
      router.push("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      setUserRole(user.role);
      setIsLoading(false);
    } catch (error) {
      toast.error("Invalid session. Please login again.");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar userRole={userRole} />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Top Bar */}
          <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
                Happy Holidays Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Role: <span className="font-semibold text-brown-dark">{userRole}</span>
              </span>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </PermissionProvider>
  );
}
