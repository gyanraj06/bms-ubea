"use client";

import { useState, useEffect } from "react";
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
  SignOut,
  CaretDown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { usePermissions } from "@/contexts/permission-context";
import PermissionCodeSettings from "./PermissionCodeSettings";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "Owner" | "Manager" | "Front Desk" | "Accountant";
  phone?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
  admin_users?: {
    full_name: string;
    email: string;
    role: string;
  };
}

const AVAILABLE_ROLES = ["Owner", "Manager", "Front Desk", "Accountant"];

export default function SettingsPage() {
  const { permissions, updatePermission, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "property" | "permissionCode">("users");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null); // Mobile accordion state
  const [mobileSelectedRole, setMobileSelectedRole] = useState<string>("Manager"); // Mobile permissions role selector
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "Front Desk",
    password: "",
    phone: "",
  });
  const [propertySettings, setPropertySettings] = useState({
    property_name: "",
    address: "",
    phone: "",
    phone2: "",
    phone3: "",
    phone4: "",
    email: "",
    gst_number: "",
    check_in_time: "14:00",
    check_out_time: "11:00",
    google_maps_embed_url: "",
    description: "",
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load users, audit logs, and property settings on mount
  useEffect(() => {
    loadUsers();
    loadAuditLogs();
    loadPropertySettings();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const response = await fetch('/api/admin/audit-logs?limit=10', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAuditLogs(data.logs || []);
        }
      } else {
        console.error('Failed to load audit logs');
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadPropertySettings = async () => {
    try {
      setIsLoadingSettings(true);
      const response = await fetch(`/api/admin/property-settings?t=${new Date().getTime()}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setPropertySettings({
            property_name: data.settings.property_name || "",
            address: data.settings.address || "",
            phone: data.settings.phone || "",
            phone2: data.settings.phone2 || "",
            phone3: data.settings.phone3 || "",
            phone4: data.settings.phone4 || "",
            email: data.settings.email || "",
            gst_number: data.settings.gst_number || "",
            check_in_time: data.settings.check_in_time || "14:00",
            check_out_time: data.settings.check_out_time || "11:00",
            google_maps_embed_url: data.settings.google_maps_embed_url || "",
            description: data.settings.description || "",
          });
        }
      } else {
        console.error('Failed to load property settings');
      }
    } catch (error) {
      console.error('Error loading property settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSavePropertySettings = async () => {
    if (!propertySettings.property_name || !propertySettings.address || !propertySettings.phone || !propertySettings.email) {
      toast.error("Property name, address, phone, and email are required");
      return;
    }

    try {
      setIsSavingSettings(true);
      const response = await fetch('/api/admin/property-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(propertySettings),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Property settings saved successfully');
        loadAuditLogs(); // Refresh audit logs
      } else {
        toast.error(data.error || 'Failed to save property settings');
      }
    } catch (error) {
      console.error('Error saving property settings:', error);
      toast.error('Error saving property settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.full_name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          full_name: newUser.full_name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          phone: newUser.phone || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`User ${newUser.full_name} added successfully!`);
        setNewUser({ full_name: "", email: "", role: "Front Desk", password: "", phone: "" });
        setIsAddingUser(false);
        loadUsers(); // Refresh users list
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error creating user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`User ${userName} deleted successfully`);
        loadUsers(); // Refresh users list
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setIsLoading(false);
    }
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

  const getActivityIcon = (action: string, tableName: string) => {
    if (action === 'LOGIN') return { icon: Key, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
    if (action === 'LOGOUT') return { icon: SignOut, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
    if (action === 'CREATE' && tableName === 'admin_users') return { icon: UserPlus, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
    if (action === 'DELETE' && tableName === 'admin_users') return { icon: Trash, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
    if (action === 'UPDATE' && tableName === 'permissions') return { icon: ShieldCheck, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
    if (action === 'CREATE' && tableName === 'rooms') return { icon: PencilSimple, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' };
    if (action === 'DELETE' && tableName === 'rooms') return { icon: Trash, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
    return { icon: Clock, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
  };

  const getActivityDescription = (log: AuditLog) => {
    const userName = log.admin_users?.full_name || 'Unknown User';
    const tableName = log.table_name;
    const action = log.action;

    if (action === 'LOGIN') return `${userName} logged in`;
    if (action === 'LOGOUT') return `${userName} logged out`;
    if (action === 'CREATE' && tableName === 'admin_users') {
      const newUserName = log.new_data?.full_name || 'a new user';
      return `${userName} added ${newUserName}`;
    }
    if (action === 'DELETE' && tableName === 'admin_users') {
      const deletedUserName = log.old_data?.full_name || 'a user';
      return `${userName} deleted ${deletedUserName}`;
    }
    if (action === 'UPDATE' && tableName === 'permissions') {
      return `${userName} updated permission settings`;
    }
    if (action === 'CREATE' && tableName === 'rooms') {
      const roomNumber = log.new_data?.room_number || 'a room';
      return `${userName} created room ${roomNumber}`;
    }
    if (action === 'DELETE' && tableName === 'rooms') {
      const roomNumber = log.old_data?.room_number || 'a room';
      return `${userName} deleted room ${roomNumber}`;
    }
    if (action === 'UPDATE' && tableName === 'rooms') {
      const roomNumber = log.new_data?.room_number || log.old_data?.room_number || 'a room';
      return `${userName} updated room ${roomNumber}`;
    }
    return `${userName} performed ${action.toLowerCase()} on ${tableName}`;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(date);
  };

  return (
    <div className="space-y-3 md:space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">Manage users, permissions, and property settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-col md:flex-row md:gap-4 p-2 md:px-6 w-full">
            <button
              onClick={() => setActiveTab("users")}
              className={cn(
                "py-3 px-3 md:py-4 md:px-2 rounded-lg md:rounded-none md:border-b-2 font-medium text-sm transition-all text-left md:text-center w-full md:w-auto",
                activeTab === "users"
                  ? "bg-brown-light/20 md:bg-transparent text-brown-dark md:border-brown-dark font-bold"
                  : "bg-transparent text-gray-600 hover:bg-gray-50 md:hover:bg-transparent md:border-transparent hover:text-gray-900"
              )}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={cn(
                "py-3 px-3 md:py-4 md:px-2 rounded-lg md:rounded-none md:border-b-2 font-medium text-sm transition-all text-left md:text-center w-full md:w-auto",
                activeTab === "permissions"
                  ? "bg-brown-light/20 md:bg-transparent text-brown-dark md:border-brown-dark font-bold"
                  : "bg-transparent text-gray-600 hover:bg-gray-50 md:hover:bg-transparent md:border-transparent hover:text-gray-900"
              )}
            >
              Permissions
            </button>
            <button
              onClick={() => setActiveTab("property")}
              className={cn(
                "py-3 px-3 md:py-4 md:px-2 rounded-lg md:rounded-none md:border-b-2 font-medium text-sm transition-all text-left md:text-center w-full md:w-auto",
                activeTab === "property"
                  ? "bg-brown-light/20 md:bg-transparent text-brown-dark md:border-brown-dark font-bold"
                  : "bg-transparent text-gray-600 hover:bg-gray-50 md:hover:bg-transparent md:border-transparent hover:text-gray-900"
              )}
            >
              Property Settings
            </button>
            <button
              onClick={() => setActiveTab("permissionCode")}
              className={cn(
                "py-3 px-3 md:py-4 md:px-2 rounded-lg md:rounded-none md:border-b-2 font-medium text-sm transition-all text-left md:text-center w-full md:w-auto",
                activeTab === "permissionCode"
                  ? "bg-brown-light/20 md:bg-transparent text-brown-dark md:border-brown-dark font-bold"
                  : "bg-transparent text-gray-600 hover:bg-gray-50 md:hover:bg-transparent md:border-transparent hover:text-gray-900"
              )}
            >
              Permission Code
            </button>
          </nav>
        </div>

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">System Users</h2>
              <Button
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="bg-brown-dark text-white hover:bg-brown-medium text-xs md:text-sm h-9 md:h-10 w-full sm:w-auto"
              >
                <UserPlus size={16} className="mr-1.5" weight="bold" />
                Add User
              </Button>
            </div>

            {/* Add User Form */}
            {isAddingUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91..."
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
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
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-dark focus:border-transparent bg-white"
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
                  <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                    <Button type="submit" className="flex-1 sm:flex-none bg-brown-dark text-white hover:bg-brown-medium justify-center">
                      <UserPlus size={20} className="mr-2" />
                      Create User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingUser(false)}
                      className="flex-1 sm:flex-none justify-center"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Users - Mobile Cards */}
            {/* Users - Mobile Accordion */}
            <div className="md:hidden space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              ) : (
                users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                      className="w-full flex items-center justify-between p-4 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-start">
                          <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                          <span
                            className={cn(
                              "mt-1 px-2 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full",
                              getRoleBadgeColor(user.role)
                            )}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <CaretDown
                        size={16}
                        className={cn("text-gray-400 transition-transform duration-200", expandedUserId === user.id ? "rotate-180" : "")}
                        weight="bold"
                      />
                    </button>

                    {/* Accordion Body */}
                    {expandedUserId === user.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                        <div className="space-y-3 pt-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Email</span>
                            <span className="text-gray-900 font-medium">{user.email}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Status</span>
                            <span className={cn(
                              "px-2 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full",
                              user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Last Login</span>
                            <span className="text-gray-900">{user.last_login ? formatDate(new Date(user.last_login)) : 'Never'}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Created At</span>
                            <span className="text-gray-900">{formatDate(new Date(user.created_at))}</span>
                          </div>

                          {/* Actions */}
                          {user.role !== "Owner" && (
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user.id, user.full_name);
                                }}
                                className="flex items-center gap-1.5 text-red-600 hover:text-red-800 text-xs font-medium px-3 py-1.5 bg-red-50 rounded-lg"
                                disabled={isLoading}
                              >
                                <Trash size={14} weight="bold" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Users Table - Desktop */}
            <div className="hidden md:block overflow-x-auto">
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
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
                          <span className={cn(
                            "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                            user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.last_login ? formatDate(new Date(user.last_login)) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(new Date(user.created_at))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user.role !== "Owner" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                className="text-red-600 hover:text-red-900"
                                disabled={isLoading}
                              >
                                <Trash size={18} weight="bold" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permissions Tab - INTERACTIVE MATRIX */}
        {activeTab === "permissions" && (
          <div className="p-3 md:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Permission Management</h2>
              <p className="text-sm text-gray-600">
                Toggle permissions for each role. Changes are saved automatically.
              </p>
            </div>

            {/* Permission Matrix - Mobile Role Centric View */}
            <div className="md:hidden">
              {/* Role Selector - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {AVAILABLE_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setMobileSelectedRole(role)}
                    className={cn(
                      "px-2 py-3 rounded-lg text-sm font-medium transition-all shadow-sm border text-center break-words",
                      mobileSelectedRole === role
                        ? getRoleBadgeColor(role) + " ring-1 ring-black/5"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Mobile Permission List */}
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission) => {
                  const isOwner = mobileSelectedRole === "Owner";
                  const hasAccess = hasPermission(permission.key, mobileSelectedRole);
                  const isDisabled = isOwner;

                  return (
                    <div
                      key={permission.id}
                      className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col justify-between h-full min-h-[90px]"
                    >
                      <div className="flex-1 min-w-0 mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="font-semibold text-gray-900 text-xs truncate leading-tight" title={permission.name}>
                            {permission.name}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">
                          {permission.description}
                        </p>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-gray-50 mt-auto">
                        <button
                          onClick={() => !isDisabled && handlePermissionToggle(permission.key, mobileSelectedRole)}
                          disabled={isDisabled}
                          className={cn(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0",
                            hasAccess ? "bg-green-500" : "bg-gray-300",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm",
                              hasAccess ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permission Matrix - Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden min-w-[800px]">
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

        {activeTab === "property" && (
          <div className="p-3 md:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Property Information</h2>
            {isLoadingSettings ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark mx-auto mb-4"></div>
                <p className="text-gray-500">Loading property settings...</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSavePropertySettings(); }} className="space-y-6 pb-24 md:pb-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>

                  <div>
                    <Label htmlFor="propertyName">Property Name *</Label>
                    <Input
                      id="propertyName"
                      value={propertySettings.property_name}
                      onChange={(e) => setPropertySettings({ ...propertySettings, property_name: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <textarea
                      id="address"
                      value={propertySettings.address}
                      onChange={(e) => setPropertySettings({ ...propertySettings, address: e.target.value })}
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={propertySettings.description}
                      onChange={(e) => setPropertySettings({ ...propertySettings, description: e.target.value })}
                      className="mt-1 flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                      <Label htmlFor="propertyEmail">Primary Email *</Label>
                      <Input
                        id="propertyEmail"
                        type="email"
                        value={propertySettings.email}
                        onChange={(e) => setPropertySettings({ ...propertySettings, email: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="gst">GST Number</Label>
                      <Input
                        id="gst"
                        value={propertySettings.gst_number}
                        onChange={(e) => setPropertySettings({ ...propertySettings, gst_number: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Phone Numbers</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Phone 1 (Primary) *"
                        type="tel"
                        value={propertySettings.phone}
                        onChange={(e) => setPropertySettings({ ...propertySettings, phone: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Phone 2"
                        type="tel"
                        value={propertySettings.phone2}
                        onChange={(e) => setPropertySettings({ ...propertySettings, phone2: e.target.value })}
                      />
                      <Input
                        placeholder="Phone 3"
                        type="tel"
                        value={propertySettings.phone3}
                        onChange={(e) => setPropertySettings({ ...propertySettings, phone3: e.target.value })}
                      />
                      <Input
                        placeholder="Phone 4"
                        type="tel"
                        value={propertySettings.phone4}
                        onChange={(e) => setPropertySettings({ ...propertySettings, phone4: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Operational Settings */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Operational Settings</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkIn">Check-in Time</Label>
                      <Input
                        id="checkIn"
                        type="time"
                        value={propertySettings.check_in_time}
                        onChange={(e) => setPropertySettings({ ...propertySettings, check_in_time: e.target.value })}
                        className="mt-1 block w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOut">Check-out Time</Label>
                      <Input
                        id="checkOut"
                        type="time"
                        value={propertySettings.check_out_time}
                        onChange={(e) => setPropertySettings({ ...propertySettings, check_out_time: e.target.value })}
                        className="mt-1 block w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mapsUrl">Google Maps Embed URL</Label>
                    <Input
                      id="mapsUrl"
                      value={propertySettings.google_maps_embed_url}
                      onChange={(e) => setPropertySettings({ ...propertySettings, google_maps_embed_url: e.target.value })}
                      className="mt-1"
                      placeholder='<iframe src="...">'
                    />
                    <p className="text-xs text-gray-500 mt-1">Paste the full iframe code from Google Maps</p>
                  </div>
                </div>

                {/* Sticky Save Bar */}
                <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-white border-t border-gray-200 p-4 md:p-0 md:bg-transparent md:border-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
                  <div className="max-w-7xl mx-auto flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingSettings}
                      className="w-full md:w-auto bg-brown-dark hover:bg-brown-medium text-white shadow-lg md:shadow-none h-12 md:h-10 text-base md:text-sm font-medium"
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}



        {/* Permission Code Tab */}
        {activeTab === "permissionCode" && (
          <PermissionCodeSettings />
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-3 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-3 md:p-6">
          {isLoadingLogs ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-dark mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading activities...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={48} className="text-gray-400 mx-auto mb-3" weight="light" />
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => {
                const { icon: Icon, bgColor, iconColor } = getActivityIcon(log.action, log.table_name);
                const description = getActivityDescription(log);
                const relativeTime = getRelativeTime(log.created_at);

                return (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", bgColor)}>
                      <Icon size={20} className={iconColor} weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 break-words">{description}</p>
                      <p className="text-xs text-gray-500 mt-1">{relativeTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
