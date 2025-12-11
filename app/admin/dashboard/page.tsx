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
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Header - Hidden on Mobile to save space */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {userRole}!
          </h1>
        </div>
      </motion.div>

      {/* Unified Metrics Grid (Stats + Today's Activity) */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4">
        {/* Check-ins */}
        <div className="bg-green-50 rounded-lg p-2 md:p-4 text-center border border-green-100">
          <p className="text-xl md:text-2xl font-bold text-green-700">{todaysActivity.checkIns}</p>
          <p className="text-[10px] md:text-xs text-green-600 font-medium leading-tight">Check-ins</p>
        </div>

        {/* Check-outs */}
        <div className="bg-blue-50 rounded-lg p-2 md:p-4 text-center border border-blue-100">
          <p className="text-xl md:text-2xl font-bold text-blue-700">{todaysActivity.checkOuts}</p>
          <p className="text-[10px] md:text-xs text-blue-600 font-medium leading-tight">Check-outs</p>
        </div>

        {/* Pending */}
        <div className="bg-yellow-50 rounded-lg p-2 md:p-4 text-center border border-yellow-100">
          <p className="text-xl md:text-2xl font-bold text-yellow-700">{todaysActivity.pending}</p>
          <p className="text-[10px] md:text-xs text-yellow-600 font-medium leading-tight">Pending</p>
        </div>

        {/* Render consolidated Stats */}
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg p-2 md:p-4 shadow-sm border border-gray-200 text-center flex flex-col justify-center"
          >
            <p className="text-sm md:text-lg font-bold text-gray-900 leading-tight block">
              {stat.value}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-tight mt-0.5">
              {stat.title.replace("Total ", "").replace("Monthly ", "")}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-3 md:p-6 border-b border-gray-200 hidden md:block">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No bookings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Room
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In/Out
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Amount
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap text-[10px] md:text-sm font-medium text-gray-900">
                      #{booking.booking_number.slice(-6)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[10px] md:text-sm text-gray-900 truncate max-w-[80px] md:max-w-none">
                      {booking.guest_name}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[10px] md:text-sm text-gray-600 hidden md:table-cell">
                      {booking.rooms?.room_number || '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[10px] md:text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span>{formatDateTime(new Date(booking.check_in)).split(',')[0]}</span>
                        <span className="text-gray-400 text-[9px] md:hidden">{formatDateTime(new Date(booking.check_out)).split(',')[0]}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-[10px] md:text-sm text-gray-900 font-medium hidden md:table-cell">
                      {formatCurrency(booking.total_amount)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 inline-flex text-[9px] md:text-xs leading-4 font-semibold rounded-full capitalize",
                          getStatusColor(booking.status)
                        )}
                      >
                        {booking.status || 'Unk'}
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
