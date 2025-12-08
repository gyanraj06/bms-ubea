"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  EnvelopeSimple,
  Phone,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface UserData {
  full_name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [userData, setUserData] = useState<UserData>({
    full_name: "",
    email: "",
    phone: "",
  });

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(true);

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Check if user is authenticated
    if (!session || !user) {
      toast.error("Please login to access your profile");
      router.push("/login");
      return;
    }

    // Try to get user data from localStorage first, then fallback to session
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      const localUser = JSON.parse(userDataStr);
      setUserData({
        full_name: localUser.full_name || user.user_metadata?.full_name || "",
        email: localUser.email || user.email || "",
        phone: localUser.phone || user.user_metadata?.phone || "",
      });
    } else {
      // Use session data
      setUserData({
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || user.phone || "",
      });
    }

    setIsInitialized(true);
  }, [authLoading, session, user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // Update local storage
      const currentUser = JSON.parse(localStorage.getItem("userData") || "{}");
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Password changed successfully");
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  // Show loading while auth is checking
  if (authLoading || !isInitialized) {
    return (
      <main className="min-h-screen bg-gray-50">
        <ChaletHeader forceLight={true} />
        <div className="h-20" />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ChaletHeader forceLight={true} />
      <div className="h-20" />

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <nav className="flex flex-col">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-3 px-6 py-4 text-left transition-colors",
                          activeTab === tab.id
                            ? "bg-brown-dark text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <Icon size={20} weight={activeTab === tab.id ? "fill" : "regular"} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {/* Account Settings */}
                {activeTab === "account" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Account Information
                    </h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <User size={18} />
                            Full Name
                          </div>
                        </label>
                        <input
                          type="text"
                          value={userData.full_name}
                          onChange={(e) =>
                            setUserData({ ...userData, full_name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <EnvelopeSimple size={18} />
                            Email Address
                          </div>
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) =>
                            setUserData({ ...userData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                          placeholder="your@email.com"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center gap-2">
                            <Phone size={18} />
                            Phone Number
                          </div>
                        </label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) =>
                            setUserData({ ...userData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Password
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Update your password to keep your account secure
                            </p>
                          </div>
                          <Button
                            onClick={() => setShowPasswordChange(!showPasswordChange)}
                            variant="outline"
                            className="border-brown-dark text-brown-dark hover:bg-brown-dark hover:text-white"
                          >
                            {showPasswordChange ? "Cancel" : "Change Password"}
                          </Button>
                        </div>

                        {showPasswordChange && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleChangePassword}
                            className="space-y-4 mt-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                                placeholder="Enter current password"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                                placeholder="Enter new password"
                                required
                                minLength={6}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                              />
                            </div>

                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                disabled={loading}
                                className="bg-brown-dark hover:bg-brown-medium text-white px-6"
                              >
                                {loading ? "Updating..." : "Update Password"}
                              </Button>
                            </div>
                          </motion.form>
                        )}
                      </div>

                      <div className="flex justify-end pt-6">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-brown-dark hover:bg-brown-medium text-white px-8"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === "notifications" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Notification Preferences
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">
                            Receive booking confirmations and updates via email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brown-dark/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-dark"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
                          <p className="text-sm text-gray-600">
                            Get text messages for important updates
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smsNotifications}
                            onChange={(e) => setSmsNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brown-dark/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-dark"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-semibold text-gray-900">Booking Reminders</h3>
                          <p className="text-sm text-gray-600">
                            Remind me before check-in and check-out dates
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bookingReminders}
                            onChange={(e) => setBookingReminders(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brown-dark/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-dark"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                          <h3 className="font-semibold text-gray-900">Promotional Emails</h3>
                          <p className="text-sm text-gray-600">
                            Receive special offers and seasonal promotions
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={promotionalEmails}
                            onChange={(e) => setPromotionalEmails(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brown-dark/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-dark"></div>
                        </label>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSaveNotifications}
                          disabled={loading}
                          className="bg-brown-dark hover:bg-brown-medium text-white px-8"
                        >
                          {loading ? "Saving..." : "Save Preferences"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
