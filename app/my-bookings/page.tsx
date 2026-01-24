"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChaletHeader } from "@/components/shared/chalet-header";
import { Footer } from "@/components/shared/footer";
import { useAuth } from "@/contexts/auth-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

const supabase = createClientComponentClient();
import {
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Bed,
  MapPin,
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface BookingItem {
  id: string;
  room_id: string;
  status: string;
  payment_status: string;
  room: {
    id: string;
    room_number: string;
    room_type: string;
    images: string[];
  };
}

interface BookingOrder {
  booking_number: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  num_guests: number;

  // Aggregated amounts
  room_charges: number;
  gst_amount: number;
  total_amount: number;
  advance_paid: number;
  balance_amount: number;

  status: string;
  payment_status: string;

  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests: string;
  created_at: string;

  items: BookingItem[];
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, session } = useAuth();
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast.error("Please login to view your bookings");
          router.push(`/login?next=${encodeURIComponent("/my-bookings")}`);
        }
      };
      checkSession();
      return;
    }

    fetchBookings();
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    try {
      if (!session?.access_token) return;

      const response = await fetch("/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again");
        router.push("/login");
      } else {
        toast.error("Failed to load bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <CheckCircle size={20} weight="fill" className="text-green-600" />;
      case "pending":
        return <Clock size={20} weight="fill" className="text-yellow-600" />;
      case "cancelled":
      case "failed":
        return <XCircle size={20} weight="fill" className="text-red-600" />;
      case "completed":
        return <CheckCircle size={20} weight="fill" className="text-blue-600" />;
      default:
        return <Clock size={20} weight="fill" className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-red-100 text-red-800";
      case "verification_pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = selectedStatus === "all"
    ? bookings
    : bookings.filter((b) => b.status.toLowerCase() === selectedStatus);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <ChaletHeader forceLight={true} />
        <div className="h-20" />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brown-dark mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-900">Loading your bookings...</p>
          </div>
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
              My Bookings
            </h1>
            <p className="text-gray-600">
              View and manage your booking history
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["all", "confirmed", "pending", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${selectedStatus === status
                  ? "bg-brown-dark text-white border-brown-dark"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "all" && ` (${bookings.length})`}
                {status !== "all" && ` (${bookings.filter(b => b.status.toLowerCase() === status).length})`}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Bed size={48} weight="fill" className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6 text-lg">
                {selectedStatus === "all"
                  ? "No bookings found. Start planning your perfect stay!"
                  : `No ${selectedStatus} bookings found`}
              </p>
              <Button
                onClick={() => router.push("/rooms")}
                className="bg-brown-dark hover:bg-brown-medium text-white"
              >
                Browse Rooms
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.booking_number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    {/* Booking Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-gray-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif text-xl font-bold text-gray-900">
                            {booking.booking_number}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              booking.payment_status === 'failed' ? 'failed' : booking.status
                            )}`}
                          >
                            {getStatusIcon(booking.payment_status === 'failed' ? 'failed' : booking.status)}
                            {(booking.payment_status === 'failed' ? 'failed' : booking.status).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Booked on {new Date(booking.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 text-left md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Order Amount</p>
                        <p className="text-2xl font-bold text-brown-dark">
                          ₹{booking.total_amount.toLocaleString()}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                            booking.payment_status
                          )}`}
                        >
                          {booking.payment_status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Rooms List */}
                    <div className="space-y-4 mb-6">
                      <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Reserved Rooms ({booking.items.length})</h4>

                      {booking.items.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-brown-light/30 transition-colors">
                          <div className="flex items-start gap-4">
                            {item.room.images?.[0] && (
                              <img
                                src={item.room.images[0]}
                                alt={item.room.room_type}
                                className="w-20 h-20 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-lg">
                                    {item.room.room_type}
                                  </h4>
                                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                    <MapPin size={14} weight="fill" className="text-brown-dark" />
                                    Room {item.room.room_number}
                                  </p>
                                </div>
                                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-md border border-gray-200">
                                  Status: <span className="font-medium text-gray-900">{item.status}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Booking Details Grid (Shared) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Calendar size={20} className="text-brown-dark" weight="bold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Check-in</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(booking.check_in).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Calendar size={20} className="text-brown-dark" weight="bold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Check-out</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(booking.check_out).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Bed size={20} className="text-brown-dark" weight="bold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {booking.total_nights} {booking.total_nights === 1 ? 'Night' : 'Nights'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Users size={20} className="text-brown-dark" weight="bold" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Guests</p>
                          <p className="font-semibold text-gray-900">
                            {booking.num_guests} {booking.num_guests === 1 ? 'Guest' : 'Guests'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="space-y-2 text-sm bg-gray-50/50 p-4 rounded-xl">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Room Charges</span>
                          <span className="font-medium">₹{booking.room_charges.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total GST (12%)</span>
                          <span className="font-medium">₹{booking.gst_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200 mt-2">
                          <span>Grand Total</span>
                          <span>₹{booking.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-700">
                          <span>Advance Paid</span>
                          <span className="font-medium">₹{booking.advance_paid.toLocaleString()}</span>
                        </div>
                        {booking.balance_amount > 0 && (
                          <div className="flex justify-between text-orange-700">
                            <span>Balance Due</span>
                            <span className="font-semibold">₹{booking.balance_amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Pay Now Button */}
                      {booking.payment_status === 'pending' && (
                        <div className="mt-4">
                          <Button
                            onClick={() => router.push(`/booking/payment/${booking.booking_number}`)}
                            className="w-full bg-brown-dark hover:bg-brown-medium text-white py-6 text-lg shadow-md hover:shadow-lg transition-all"
                          >
                            Complete Payment for Order
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Special Requests */}
                    {booking.special_requests && (
                      <div className="border-t border-gray-200 pt-4 mt-4 px-2">
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Special Requests</p>
                        <p className="text-sm text-gray-700 italic">"{booking.special_requests}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
