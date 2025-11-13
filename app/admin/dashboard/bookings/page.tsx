"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  MagnifyingGlass,
  FunnelSimple,
  Plus,
  Eye,
  PencilSimple,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Booking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: "confirmed" | "pending" | "checked-in" | "checked-out" | "cancelled";
  paymentStatus: "paid" | "pending" | "partial";
  bookingDate: string;
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Mock bookings data
  const bookings: Booking[] = [
    {
      id: "BK001",
      guestName: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 9876543210",
      roomType: "Deluxe Room",
      checkIn: "2025-11-15",
      checkOut: "2025-11-18",
      guests: 2,
      amount: 12000,
      status: "confirmed",
      paymentStatus: "paid",
      bookingDate: "2025-11-10",
    },
    {
      id: "BK002",
      guestName: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 9876543211",
      roomType: "Suite",
      checkIn: "2025-11-16",
      checkOut: "2025-11-20",
      guests: 3,
      amount: 25000,
      status: "pending",
      paymentStatus: "pending",
      bookingDate: "2025-11-12",
    },
    {
      id: "BK003",
      guestName: "Amit Patel",
      email: "amit@example.com",
      phone: "+91 9876543212",
      roomType: "Standard Room",
      checkIn: "2025-11-14",
      checkOut: "2025-11-16",
      guests: 2,
      amount: 8000,
      status: "checked-in",
      paymentStatus: "paid",
      bookingDate: "2025-11-08",
    },
    {
      id: "BK004",
      guestName: "Sneha Reddy",
      email: "sneha@example.com",
      phone: "+91 9876543213",
      roomType: "Deluxe Room",
      checkIn: "2025-11-18",
      checkOut: "2025-11-21",
      guests: 2,
      amount: 12000,
      status: "confirmed",
      paymentStatus: "partial",
      bookingDate: "2025-11-11",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "checked-in":
        return "bg-green-100 text-green-700";
      case "checked-out":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-red-100 text-red-700";
      case "partial":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || booking.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Manage all property bookings and reservations</p>
        </div>
        <Button className="bg-brown-dark text-white hover:bg-brown-medium">
          <Plus size={20} weight="bold" className="mr-2" />
          New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{bookings.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarCheck size={24} className="text-blue-600" weight="fill" />
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
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {bookings.filter((b) => b.status === "confirmed").length}
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
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {bookings.filter((b) => b.status === "pending").length}
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
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {bookings.filter((b) => b.status === "checked-in").length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle size={24} className="text-purple-600" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search by guest name, booking ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-300"
            >
              <FunnelSimple size={20} className="mr-2" />
              Filters
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Download size={20} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === "all"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("confirmed")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === "confirmed"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === "pending"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus("checked-in")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === "checked-in"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Checked In
              </button>
              <button
                onClick={() => setFilterStatus("checked-out")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === "checked-out"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Checked Out
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In/Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                      <p className="text-sm text-gray-500">{booking.email}</p>
                      <p className="text-sm text-gray-500">{booking.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.roomType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <p className="text-gray-900">{formatDate(new Date(booking.checkIn))}</p>
                      <p className="text-gray-500">{formatDate(new Date(booking.checkOut))}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(booking.amount)}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize",
                        getPaymentStatusColor(booking.paymentStatus)
                      )}
                    >
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={18} weight="bold" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <PencilSimple size={18} weight="bold" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <CalendarCheck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No bookings found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
