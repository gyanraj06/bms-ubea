"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Permission {
  id: string;
  name: string;
  description: string;
  key: string; // Unique key for the permission
  href: string; // Route path
  roles: string[];
}

interface PermissionContextType {
  permissions: Permission[];
  updatePermission: (permissionKey: string, role: string, hasAccess: boolean) => void;
  hasPermission: (permissionKey: string, role: string) => boolean;
  getAccessibleRoutes: (role: string) => string[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Default permissions structure
const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: "P001",
    name: "Dashboard",
    description: "View dashboard overview and statistics",
    key: "dashboard",
    href: "/admin/dashboard",
    roles: ["Owner", "Manager", "Front Desk", "Accountant"],
  },
  {
    id: "P002",
    name: "Bookings",
    description: "Create, edit, and manage bookings",
    key: "bookings",
    href: "/admin/dashboard/bookings",
    roles: ["Owner", "Manager", "Front Desk"],
  },
  {
    id: "P003",
    name: "Payments & Finance",
    description: "Access revenue and financial data",
    key: "payments",
    href: "/admin/dashboard/payments",
    roles: ["Owner", "Manager", "Accountant"],
  },
  {
    id: "P004",
    name: "Communication",
    description: "Send messages and notifications to guests",
    key: "communication",
    href: "/admin/dashboard/communication",
    roles: ["Owner", "Manager", "Front Desk", "Accountant"],
  },
  {
    id: "P005",
    name: "Property Media",
    description: "Upload and manage property photos",
    key: "media",
    href: "/admin/dashboard/media",
    roles: ["Owner", "Manager"],
  },
  {
    id: "P006",
    name: "Reports & Analytics",
    description: "View reports and analytics",
    key: "reports",
    href: "/admin/dashboard/reports",
    roles: ["Owner", "Manager", "Accountant"],
  },
  {
    id: "P007",
    name: "Settings",
    description: "Configure property settings and manage users",
    key: "settings",
    href: "/admin/dashboard/settings",
    roles: ["Owner"],
  },
];

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);

  // Load permissions from localStorage on mount
  useEffect(() => {
    const savedPermissions = localStorage.getItem("adminPermissions");
    if (savedPermissions) {
      try {
        const parsed = JSON.parse(savedPermissions);
        setPermissions(parsed);
      } catch (error) {
        console.error("Failed to parse saved permissions:", error);
        setPermissions(DEFAULT_PERMISSIONS);
      }
    }
  }, []);

  // Update permission for a specific role
  const updatePermission = (permissionKey: string, role: string, hasAccess: boolean) => {
    setPermissions((prev) => {
      const updated = prev.map((perm) => {
        if (perm.key === permissionKey) {
          const newRoles = hasAccess
            ? Array.from(new Set([...perm.roles, role])) // Add role if giving access
            : perm.roles.filter((r) => r !== role); // Remove role if revoking access
          return { ...perm, roles: newRoles };
        }
        return perm;
      });

      // Save to localStorage
      localStorage.setItem("adminPermissions", JSON.stringify(updated));
      return updated;
    });
  };

  // Check if a role has access to a specific permission
  const hasPermission = (permissionKey: string, role: string): boolean => {
    const permission = permissions.find((p) => p.key === permissionKey);
    return permission ? permission.roles.includes(role) : false;
  };

  // Get all accessible routes for a role
  const getAccessibleRoutes = (role: string): string[] => {
    return permissions
      .filter((perm) => perm.roles.includes(role))
      .map((perm) => perm.href);
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        updatePermission,
        hasPermission,
        getAccessibleRoutes,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
