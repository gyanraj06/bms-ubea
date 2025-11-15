"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  MagnifyingGlass,
  Download,
  PencilSimple,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Booking {
  id: string;
  booking_number: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  num_guests: number;
  room_charges: number;
  gst_amount: number;
  total_amount: number;
  advance_paid: number;
  balance_amount: number;
  status: string;
  payment_status: string;
  special_requests: string;
  created_at: string;
  rooms?: {
    room_number: string;
    room_type: string;
    images: string[];
  };
  users?: {
    email: string;
    full_name: string;
    phone: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: "",
    payment_status: "",
    notes: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, selectedStatus]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const response = await fetch("/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.error || "Failed to load bookings");
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (b) => b.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.guest_phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status,
      payment_status: booking.payment_status,
      notes: "",
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedBooking.id,
          booking_status: editForm.status,
          payment_status: editForm.payment_status,
          notes: editForm.notes,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Booking updated successfully");
        setShowEditModal(false);
        fetchBookings();
      } else {
        toast.error(data.error || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <CheckCircle size={18} weight="fill" className="text-green-600" />;
      case "pending":
        return <Clock size={18} weight="fill" className="text-yellow-600" />;
      case "cancelled":
        return <XCircle size={18} weight="fill" className="text-red-600" />;
      default:
        return <Clock size={18} weight="fill" className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      case "checked-out":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    checkedIn: bookings.filter((b) => b.status === "checked-in").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-dark mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600 mt-1">View and manage all property bookings</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200"
        >
          <p className="text-sm text-green-700 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200"
        >
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200"
        >
          <p className="text-sm text-blue-700 mb-1">Checked In</p>
          <p className="text-2xl font-bold text-blue-900">{stats.checkedIn}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200"
        >
          <p className="text-sm text-red-700 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search by booking ID, name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {["all", "confirmed", "pending", "checked-in", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedStatus === status
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "All" : status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
          <CalendarCheck size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Booking Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">
                        {booking.booking_number}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          booking.payment_status
                        )}`}
                      >
                        {booking.payment_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Booked on {formatDate(new Date(booking.created_at))}
                    </p>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-brown-dark">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Guest Name</p>
                    <p className="font-medium text-gray-900">{booking.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{booking.guest_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{booking.guest_phone}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Calendar size={18} className="text-brown-dark mt-1" weight="bold" />
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium text-sm">{formatDate(new Date(booking.check_in))}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar size={18} className="text-brown-dark mt-1" weight="bold" />
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium text-sm">{formatDate(new Date(booking.check_out))}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users size={18} className="text-brown-dark mt-1" weight="bold" />
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium text-sm">{booking.num_guests}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-brown-dark mt-1" weight="bold" />
                    <div>
                      <p className="text-sm text-gray-500">Nights</p>
                      <p className="font-medium text-sm">{booking.total_nights}</p>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                {booking.rooms && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Room</h4>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{booking.rooms.room_type}</span>
                        <span className="text-gray-500 ml-2">
                          (Room {booking.rooms.room_number})
                        </span>
                      </div>
                      <p className="font-medium">{formatCurrency(booking.room_charges)}</p>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                {booking.special_requests && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                    <p className="text-sm text-gray-900">{booking.special_requests}</p>
                  </div>
                )}

                {/* Payment Details */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Room Charges</p>
                      <p className="font-medium">{formatCurrency(booking.room_charges)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">GST (12%)</p>
                      <p className="font-medium">{formatCurrency(booking.gst_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Advance Paid</p>
                      <p className="font-medium text-green-600">{formatCurrency(booking.advance_paid)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Balance</p>
                      <p className="font-medium text-red-600">{formatCurrency(booking.balance_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleEditBooking(booking)}
                    className="bg-brown-dark hover:bg-brown-dark/90 text-white"
                    size="sm"
                  >
                    <PencilSimple size={16} className="mr-1" weight="bold" />
                    Edit
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Edit Booking {selectedBooking.booking_number}
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Booking Status</Label>
                <select
                  id="status"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked In</option>
                  <option value="checked-out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <select
                  id="payment_status"
                  value={editForm.payment_status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, payment_status: e.target.value })
                  }
                  className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                  placeholder="Add any notes about this update..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpdateBooking}
                className="flex-1 bg-brown-dark hover:bg-brown-dark/90 text-white"
              >
                Update Booking
              </Button>
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
