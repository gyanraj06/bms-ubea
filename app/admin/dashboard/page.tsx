"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
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
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
}

interface Booking {
  id: string;
  booking_number: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  total_amount: number;
  rooms?: {
    room_number: string;
    room_type: string;
  };
}

export default function AdminDashboardPage() {
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: "Total Bookings",
      value: 0,
      change: 0,
      icon: CalendarCheck,
      color: "blue",
    },
    {
      title: "Active Guests",
      value: 0,
      change: 0,
      icon: Users,
      color: "green",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(0),
      change: 0,
      icon: CurrencyCircleDollar,
      color: "purple",
    },
    {
      title: "Available Rooms",
      value: "0/0",
      change: 0,
      icon: Bed,
      color: "orange",
    },
  ]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [todaysActivity, setTodaysActivity] = useState({
    checkIns: 0,
    checkOuts: 0,
    pending: 0,
  });


  useEffect(() => {
    // Check for admin token
    const token = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      const user = JSON.parse(adminUser);
      setUserRole(user.role);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        console.error("No admin token found");
        setIsLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all bookings
      const bookingsResponse = await fetch('/api/admin/bookings', { headers });
      const bookingsData = await bookingsResponse.json();

      // Fetch all rooms
      const roomsResponse = await fetch('/api/admin/rooms', { headers });
      const roomsData = await roomsResponse.json();

      if (bookingsData.success && roomsData.success) {
        const allBookings = bookingsData.bookings || [];
        const allRooms = roomsData.rooms || [];

        // Calculate stats
        const totalBookings = allBookings.length;

        // Active guests = bookings with status 'checked-in'
        const activeGuests = allBookings.filter(
          (b: Booking) => b.status === 'checked-in'
        ).length;

        // Calculate monthly revenue (current month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyRevenue = allBookings
          .filter((b: Booking) => {
            const checkIn = new Date(b.check_in);
            return checkIn.getMonth() === currentMonth &&
              checkIn.getFullYear() === currentYear;
          })
          .reduce((sum: number, b: Booking) => sum + (b.total_amount || 0), 0);

        // Available rooms calculation - rooms occupied by checked-in guests
        const today = new Date().toISOString().split('T')[0];
        const bookedRoomIds = allBookings
          .filter((b: Booking) => {
            if (b.status !== 'checked-in') return false;
            const checkInDate = new Date(b.check_in).toISOString().split('T')[0];
            const checkOutDate = new Date(b.check_out).toISOString().split('T')[0];
            return checkInDate <= today && checkOutDate > today;
          })
          .map((b: Booking) => b.rooms?.room_number);

        const totalRooms = allRooms.filter((r: any) => r.is_active).length;
        const availableRooms = totalRooms - bookedRoomIds.length;

        // Today's activity
        // Check-ins: Bookings scheduled to check in today OR currently checked-in status
        const todayCheckIns = allBookings.filter(
          (b: Booking) => {
            // Count as check-in if: scheduled for today OR has checked-in status
            const checkInDate = new Date(b.check_in).toISOString().split('T')[0];
            const scheduledForToday = checkInDate === today && b.status !== 'cancelled' && b.status !== 'checked-out';
            const currentlyCheckedIn = b.status === 'checked-in';
            return scheduledForToday || currentlyCheckedIn;
          }
        ).length;

        // Check-outs: Bookings scheduled to check out today OR already checked-out today
        const todayCheckOuts = allBookings.filter(
          (b: Booking) => {
            const checkOutDate = new Date(b.check_out).toISOString().split('T')[0];
            // Count if: scheduled to check out today (checked-in or checked-out status)
            return checkOutDate === today &&
              (b.status === 'checked-in' || b.status === 'checked-out');
          }
        ).length;

        const pendingBookings = allBookings.filter(
          (b: Booking) => b.status.toLowerCase() === 'pending'
        ).length;

        // Update stats
        setStats([
          {
            title: "Total Bookings",
            value: totalBookings,
            change: 0,
            icon: CalendarCheck,
            color: "blue",
          },
          {
            title: "Active Guests",
            value: activeGuests,
            change: 0,
            icon: Users,
            color: "green",
          },
          {
            title: "Monthly Revenue",
            value: formatCurrency(monthlyRevenue),
            change: 0,
            icon: CurrencyCircleDollar,
            color: "purple",
          },
          {
            title: "Available Rooms",
            value: `${availableRooms}/${totalRooms}`,
            change: 0,
            icon: Bed,
            color: "orange",
          },
        ]);

        setTodaysActivity({
          checkIns: todayCheckIns,
          checkOuts: todayCheckOuts,
          pending: pendingBookings,
        });

        // Set recent bookings (last 5 for desktop, 3 for mobile initially but we fetch all, slice in render)
        setRecentBookings(allBookings.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-700";

    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "checked-in":
        return "bg-blue-100 text-blue-700";
      case "checked-out":
        return "bg-gray-100 text-gray-700";
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








  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {userRole}!
          </h1>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg p-3 md:p-6 shadow-sm border border-gray-200 flex flex-col justify-between"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-1 md:gap-0">
                <div className="order-2 md:order-1">
                  <p className="text-[10px] md:text-sm text-gray-600 font-medium whitespace-nowrap">
                    {stat.title}
                  </p>
                  <p className="text-base md:text-2xl font-bold text-gray-900 mt-0 md:mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-1.5 md:p-3 rounded-lg w-fit order-1 md:order-2 mb-1 md:mb-0",
                    getStatColorClass(stat.color)
                  )}
                >
                  <Icon size={16} className="md:w-6 md:h-6" weight="fill" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1 md:mt-4">
                {stat.change > 0 ? (
                  <TrendUp size={12} className="text-green-600 md:w-4 md:h-4" weight="bold" />
                ) : (
                  <TrendDown size={12} className="text-red-600 md:w-4 md:h-4" weight="bold" />
                )}
                <span
                  className={cn(
                    "text-[10px] md:text-sm font-medium",
                    stat.change > 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-[10px] md:text-sm text-gray-500 ml-1">vs last month</span>
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
        className="bg-white rounded-lg p-3 md:p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Today's Activity</h2>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 p-2 md:p-4 bg-green-50 rounded-lg text-center md:text-left">
            <div className="p-1.5 md:p-3 bg-green-100 rounded-lg">
              <CheckCircle size={16} className="text-green-600 md:w-6 md:h-6" weight="fill" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-green-900 leading-tight">
                {todaysActivity.checkIns}
              </p>
              <p className="text-[10px] md:text-sm text-green-700 font-medium leading-tight">Check-ins</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 p-2 md:p-4 bg-blue-50 rounded-lg text-center md:text-left">
            <div className="p-1.5 md:p-3 bg-blue-100 rounded-lg">
              <XCircle size={16} className="text-blue-600 md:w-6 md:h-6" weight="fill" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-blue-900 leading-tight">
                {todaysActivity.checkOuts}
              </p>
              <p className="text-[10px] md:text-sm text-blue-700 font-medium leading-tight">Check-outs</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 p-2 md:p-4 bg-yellow-50 rounded-lg text-center md:text-left">
            <div className="p-1.5 md:p-3 bg-yellow-100 rounded-lg">
              <Clock size={16} className="text-yellow-600 md:w-6 md:h-6" weight="fill" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold text-yellow-900 leading-tight">
                {todaysActivity.pending}
              </p>
              <p className="text-[10px] md:text-sm text-yellow-700 font-medium leading-tight">Pending</p>
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
        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No bookings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest Name
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.slice(0, 3).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                      {booking.booking_number}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                      {booking.guest_name}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-600">
                      {booking.rooms?.room_type || 'N/A'} - {booking.rooms?.room_number || 'N/A'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-600">
                      {formatDateTime(new Date(booking.check_in))}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-600">
                      {formatDateTime(new Date(booking.check_out))}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 font-medium">
                      {formatCurrency(booking.total_amount)}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 md:px-3 py-0.5 md:py-1 inline-flex text-[10px] md:text-xs leading-5 font-semibold rounded-full capitalize",
                          getStatusColor(booking.status)
                        )}
                      >
                        {booking.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>




    </div>
  );
}
