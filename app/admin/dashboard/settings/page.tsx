"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GearSix,
  UserPlus,
  Trash,
  PencilSimple,
  Eye,
  EyeSlash,
  ShieldCheck,
  Key,
  Clock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { usePermissions } from "@/contexts/permission-context";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Manager" | "Front Desk" | "Accountant";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

const AVAILABLE_ROLES = ["Owner", "Manager", "Front Desk", "Accountant"];

export default function SettingsPage() {
  const { permissions, updatePermission, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "property" | "integrations">("users");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Front Desk",
    password: "",
  });

  // Mock users data
  const users: User[] = [
    {
      id: "U001",
      name: "Admin Owner",
      email: "owner@happyholidays.com",
      role: "Owner",
      status: "active",
      lastLogin: "2025-11-14T10:30:00",
      createdAt: "2025-01-01",
    },
    {
      id: "U002",
      name: "Sarah Manager",
      email: "manager@happyholidays.com",
      role: "Manager",
      status: "active",
      lastLogin: "2025-11-14T09:15:00",
      createdAt: "2025-02-15",
    },
    {
      id: "U003",
      name: "John Receptionist",
      email: "frontdesk@happyholidays.com",
      role: "Front Desk",
      status: "active",
      lastLogin: "2025-11-14T08:00:00",
      createdAt: "2025-03-10",
    },
    {
      id: "U004",
      name: "Priya Finance",
      email: "accountant@happyholidays.com",
      role: "Accountant",
      status: "active",
      lastLogin: "2025-11-13T16:45:00",
      createdAt: "2025-04-05",
    },
  ];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Simulate user creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`User ${newUser.name} added successfully!`);

    // Reset form
    setNewUser({ name: "", email: "", role: "Front Desk", password: "" });
    setIsAddingUser(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    toast.success(`User ${userName} deleted successfully`);
  };

  const handlePermissionToggle = (permissionKey: string, role: string) => {
    const currentAccess = hasPermission(permissionKey, role);
    updatePermission(permissionKey, role, !currentAccess);

    const action = !currentAccess ? "granted" : "revoked";
    toast.success(`Permission ${action} for ${role}!`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "bg-purple-100 text-purple-700";
      case "Manager":
        return "bg-blue-100 text-blue-700";
      case "Front Desk":
        return "bg-green-100 text-green-700";
      case "Accountant":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage users, permissions, and property settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab("users")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                activeTab === "users"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                activeTab === "permissions"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Permissions
            </button>
            <button
              onClick={() => setActiveTab("property")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                activeTab === "property"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Property Settings
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                activeTab === "integrations"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Integrations
            </button>
          </nav>
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">System Users</h2>
              <Button
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="bg-brown-dark text-white hover:bg-brown-medium"
              >
                <UserPlus size={20} className="mr-2" weight="bold" />
                Add User
              </Button>
            </div>

            {/* Add User Form */}
            {isAddingUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@happyholidays.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Front Desk">Front Desk</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="password">Temporary Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter temporary password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" className="bg-brown-dark text-white hover:bg-brown-medium">
                      <UserPlus size={20} className="mr-2" />
                      Create User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingUser(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                            getRoleBadgeColor(user.role)
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(new Date(user.lastLogin))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(new Date(user.createdAt))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <PencilSimple size={18} weight="bold" />
                          </button>
                          {user.role !== "Owner" && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash size={18} weight="bold" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permissions Tab - INTERACTIVE MATRIX */}
        {activeTab === "permissions" && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Permission Management</h2>
              <p className="text-sm text-gray-600">
                Toggle permissions for each role. Changes are saved automatically.
              </p>
            </div>

            {/* Permission Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-brown-dark text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Feature / Permission
                    </th>
                    {AVAILABLE_ROLES.map((role) => (
                      <th key={role} className="px-6 py-4 text-center text-sm font-semibold">
                        {role}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {permissions.map((permission, index) => (
                    <tr
                      key={permission.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-brown-dark/10 rounded-lg">
                            <ShieldCheck size={20} className="text-brown-dark" weight="fill" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{permission.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                          </div>
                        </div>
                      </td>
                      {AVAILABLE_ROLES.map((role) => {
                        const isOwner = role === "Owner";
                        const hasAccess = hasPermission(permission.key, role);
                        const isDisabled = isOwner; // Owner always has all permissions

                        return (
                          <td key={role} className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => !isDisabled && handlePermissionToggle(permission.key, role)}
                                disabled={isDisabled}
                                className={cn(
                                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brown-dark focus:ring-offset-2",
                                  hasAccess ? "bg-green-500" : "bg-gray-300",
                                  isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                                title={isDisabled ? "Owner always has all permissions" : "Toggle permission"}
                              >
                                <span
                                  className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    hasAccess ? "translate-x-6" : "translate-x-1"
                                  )}
                                />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <ShieldCheck size={20} className="text-blue-600 mt-0.5" weight="fill" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Note:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Owner role has all permissions by default and cannot be modified</li>
                    <li>Toggle switches to grant or revoke permissions for other roles</li>
                    <li>Changes are saved automatically to localStorage</li>
                    <li>Green = Access granted, Gray = Access revoked</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Settings Tab */}
        {activeTab === "property" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Property Information</h2>
            <div className="max-w-2xl space-y-4">
              <div>
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  id="propertyName"
                  type="text"
                  defaultValue="Happy Holidays Guest House"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  defaultValue="123 Main Street, Bhopal, Madhya Pradesh"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+91 9876543210"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="propertyEmail">Email</Label>
                  <Input
                    id="propertyEmail"
                    type="email"
                    defaultValue="info@happyholidays.com"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gst">GST Number</Label>
                <Input
                  id="gst"
                  type="text"
                  defaultValue="22AAAAA0000A1Z5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="checkIn">Check-in Time</Label>
                <Input
                  id="checkIn"
                  type="time"
                  defaultValue="14:00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out Time</Label>
                <Input
                  id="checkOut"
                  type="time"
                  defaultValue="11:00"
                  className="mt-1"
                />
              </div>
              <Button className="bg-brown-dark text-white hover:bg-brown-medium">
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Third-party Integrations</h2>
            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Payment Gateway</h3>
                    <p className="text-sm text-gray-600">Razorpay integration for secure payments</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Service</h3>
                    <p className="text-sm text-gray-600">SMTP configuration for email notifications</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">SMS Gateway</h3>
                    <p className="text-sm text-gray-600">Twilio/MSG91 for SMS notifications</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp Business API</h3>
                    <p className="text-sm text-gray-600">Send booking confirmations via WhatsApp</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Admin Owner</span> updated permission settings
                </p>
                <p className="text-xs text-gray-500 mt-1">Just now</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus size={20} className="text-green-600" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Admin Owner</span> added new user John Receptionist
                </p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Key size={20} className="text-purple-600" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Admin Owner</span> modified role permissions
                </p>
                <p className="text-xs text-gray-500 mt-1">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
