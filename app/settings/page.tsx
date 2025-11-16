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
  Lock,
  Globe,
  Palette,
  Shield,
  EnvelopeSimple,
  Phone,
  MapPin,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserData {
  full_name: string;
  email: string;
  phone: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      toast.error("Please login to access settings");
      router.push("/login");
      return;
    }

    const user = JSON.parse(userDataStr);
    setUserData({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [router]);

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

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

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
              Settings
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

                      <div className="flex justify-end pt-4">
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

                {/* Security Settings */}
                {activeTab === "security" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Security & Privacy
                    </h2>
                    <div className="space-y-6">
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-brown-dark/10 rounded-lg">
                            <Lock size={24} className="text-brown-dark" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Change Password
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Update your password to keep your account secure
                            </p>
                            <Button
                              onClick={() => router.push("/forgot-password")}
                              variant="outline"
                              className="border-brown-dark text-brown-dark hover:bg-brown-dark hover:text-white"
                            >
                              Change Password
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-brown-dark/10 rounded-lg">
                            <Shield size={24} className="text-brown-dark" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Add an extra layer of security to your account
                            </p>
                            <Button
                              variant="outline"
                              disabled
                              className="border-gray-300 text-gray-500"
                            >
                              Coming Soon
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-red-100 rounded-lg">
                            <User size={24} className="text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-900 mb-2">
                              Delete Account
                            </h3>
                            <p className="text-sm text-red-700 mb-4">
                              Permanently delete your account and all associated data
                            </p>
                            <Button
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete your account? This action cannot be undone."
                                  )
                                ) {
                                  toast.error("Account deletion is not yet implemented");
                                }
                              }}
                            >
                              Delete Account
                            </Button>
                          </div>
                        </div>
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
