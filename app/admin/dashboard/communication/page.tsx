"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChatCircleText,
  PaperPlaneTilt,
  EnvelopeSimple,
  Phone,
  WhatsappLogo,
  Bell,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type: "inquiry" | "complaint" | "feedback" | "booking";
  status: "unread" | "read" | "replied";
  date: string;
}

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "compose" | "notifications">("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Mock messages
  const messages: Message[] = [
    {
      id: "MSG001",
      guestName: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 9876543210",
      subject: "Query about room availability",
      message: "Hello, I would like to know if you have any deluxe rooms available for the weekend of December 15-17?",
      type: "inquiry",
      status: "unread",
      date: "2025-11-13T10:30:00",
    },
    {
      id: "MSG002",
      guestName: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 9876543211",
      subject: "Feedback on recent stay",
      message: "We had a wonderful experience at your property! The staff was very helpful and the rooms were clean. Thank you!",
      type: "feedback",
      status: "read",
      date: "2025-11-12T15:45:00",
    },
    {
      id: "MSG003",
      guestName: "Amit Patel",
      email: "amit@example.com",
      phone: "+91 9876543212",
      subject: "Issue with AC in room 205",
      message: "The air conditioning in our room is not working properly. Could you please send someone to fix it?",
      type: "complaint",
      status: "replied",
      date: "2025-11-14T09:15:00",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-700";
      case "read":
        return "bg-gray-100 text-gray-700";
      case "replied":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "inquiry":
        return "bg-blue-100 text-blue-700";
      case "complaint":
        return "bg-red-100 text-red-700";
      case "feedback":
        return "bg-green-100 text-green-700";
      case "booking":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-1">Manage guest communications and notifications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{messages.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChatCircleText size={24} className="text-blue-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {messages.filter((m) => m.status === "unread").length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock size={24} className="text-yellow-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {messages.filter((m) => m.status === "replied").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Complaints</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {messages.filter((m) => m.type === "complaint").length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Bell size={24} className="text-red-600" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab("inbox")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                activeTab === "inbox"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Inbox ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab("compose")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                activeTab === "compose"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Compose Message
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                activeTab === "notifications"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Notifications
            </button>
          </nav>
        </div>

        {/* Inbox Tab */}
        {activeTab === "inbox" && (
          <div className="p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-brown-dark",
                    message.status === "unread" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200",
                    selectedMessage?.id === message.id && "border-brown-dark"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{message.guestName}</h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-semibold rounded-full capitalize",
                            getTypeColor(message.type)
                          )}
                        >
                          {message.type}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-semibold rounded-full capitalize",
                            getStatusColor(message.status)
                          )}
                        >
                          {message.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{message.email}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(new Date(message.date))}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-brown-dark text-white hover:bg-brown-medium">
                      <PaperPlaneTilt size={16} className="mr-2" weight="fill" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone size={16} className="mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <WhatsappLogo size={16} className="mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compose Tab */}
        {activeTab === "compose" && (
          <div className="p-6">
            <div className="max-w-2xl space-y-4">
              <div>
                <Label htmlFor="to">To (Email or Phone)</Label>
                <Input id="to" placeholder="guest@example.com or +91 9876543210" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter subject" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Type your message here..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button className="bg-brown-dark text-white hover:bg-brown-medium">
                  <EnvelopeSimple size={20} className="mr-2" weight="fill" />
                  Send Email
                </Button>
                <Button variant="outline">
                  <Phone size={20} className="mr-2" />
                  Send SMS
                </Button>
                <Button variant="outline">
                  <WhatsappLogo size={20} className="mr-2" />
                  Send WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="p-6">
            <div className="max-w-2xl space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Bulk Notification</h3>
              <div>
                <Label>Select Recipients</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">All Guests</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Current Guests (Checked-in)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Upcoming Bookings</span>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="notif-subject">Notification Title</Label>
                <Input id="notif-subject" placeholder="Enter notification title" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="notif-message">Notification Message</Label>
                <textarea
                  id="notif-message"
                  rows={4}
                  placeholder="Type notification message..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-dark focus:border-transparent"
                />
              </div>
              <Button className="bg-brown-dark text-white hover:bg-brown-medium">
                <Bell size={20} className="mr-2" weight="fill" />
                Send Notification
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
