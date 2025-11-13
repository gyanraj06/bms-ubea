"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Users,
  CurrencyCircleDollar,
  Bed,
  TrendUp,
  TrendDown,
  CheckCircle,
  Clock,
  XCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
}

export default function AdminDashboardPage() {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      const user = JSON.parse(adminUser);
      setUserRole(user.role);
    }
  }, []);

  // Mock statistics data
  const stats: StatCard[] = [
    {
      title: "Total Bookings",
      value: 156,
      change: 12.5,
      icon: CalendarCheck,
      color: "blue",
    },
    {
      title: "Active Guests",
      value: 42,
      change: 8.2,
      icon: Users,
      color: "green",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(456000),
      change: 15.3,
      icon: CurrencyCircleDollar,
      color: "purple",
    },
    {
      title: "Available Rooms",
      value: "18/32",
      change: -5.1,
      icon: Bed,
      color: "orange",
    },
  ];

  // Mock recent bookings
  const recentBookings = [
    {
      id: "BK001",
      guestName: "Rajesh Kumar",
      roomType: "Deluxe Room",
      checkIn: "2025-11-15",
      status: "confirmed",
    },
    {
      id: "BK002",
      guestName: "Priya Sharma",
      roomType: "Suite",
      checkIn: "2025-11-16",
      status: "pending",
    },
    {
      id: "BK003",
      guestName: "Amit Patel",
      roomType: "Standard Room",
      checkIn: "2025-11-14",
      status: "checked-in",
    },
    {
      id: "BK004",
      guestName: "Sneha Reddy",
      roomType: "Deluxe Room",
      checkIn: "2025-11-18",
      status: "confirmed",
    },
  ];

  // Mock today's check-ins/check-outs
  const todaysActivity = {
    checkIns: 5,
    checkOuts: 3,
    pending: 2,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "checked-in":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "orange":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userRole}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your property today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    getStatColorClass(stat.color)
                  )}
                >
                  <Icon size={24} weight="fill" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                {stat.change > 0 ? (
                  <TrendUp size={16} className="text-green-600" weight="bold" />
                ) : (
                  <TrendDown size={16} className="text-red-600" weight="bold" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    stat.change > 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Today's Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" weight="fill" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {todaysActivity.checkIns}
              </p>
              <p className="text-sm text-green-700 font-medium">Check-ins</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-lg">
              <XCircle size={24} className="text-blue-600" weight="fill" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {todaysActivity.checkOuts}
              </p>
              <p className="text-sm text-blue-700 font-medium">Check-outs</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock size={24} className="text-yellow-600" weight="fill" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">
                {todaysActivity.pending}
              </p>
              <p className="text-sm text-yellow-700 font-medium">Pending</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.guestName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {booking.roomType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {booking.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize",
                        getStatusColor(booking.status)
                      )}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-brown-dark hover:bg-brown-dark/5 transition-colors">
            <CalendarCheck size={32} className="text-brown-dark" weight="fill" />
            <span className="text-sm font-medium text-gray-700">New Booking</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-brown-dark hover:bg-brown-dark/5 transition-colors">
            <Users size={32} className="text-brown-dark" weight="fill" />
            <span className="text-sm font-medium text-gray-700">Add Guest</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-brown-dark hover:bg-brown-dark/5 transition-colors">
            <CheckCircle size={32} className="text-brown-dark" weight="fill" />
            <span className="text-sm font-medium text-gray-700">Check-in</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-brown-dark hover:bg-brown-dark/5 transition-colors">
            <XCircle size={32} className="text-brown-dark" weight="fill" />
            <span className="text-sm font-medium text-gray-700">Check-out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
