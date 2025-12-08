"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CurrencyCircleDollar,
  TrendUp,
  TrendDown,
  Download,
  Receipt,
  CreditCard,
  Bank,
  Money,
  CheckCircle,
  Clock,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Transaction {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  type: "payment" | "refund";
  method: "card" | "upi" | "cash" | "bank_transfer";
  status: "completed" | "pending" | "failed";
  date: string;
  gst: number;
}

export default function PaymentsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    refunds: 0,
  });

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenshotSignedUrl, setScreenshotSignedUrl] = useState<string>("");
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);

  // Confirmation State
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'danger' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => { },
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch signed URL when modal opens
  useEffect(() => {
    const fetchScreenshotUrl = async () => {
      if (!isModalOpen || !selectedBooking?.payment_screenshot_url) {
        setScreenshotSignedUrl("");
        return;
      }

      setLoadingScreenshot(true);
      try {
        const screenshotPath = selectedBooking.payment_screenshot_url;
        const response = await fetch(`/api/bookings/upload-document?filePath=${encodeURIComponent(screenshotPath)}`);
        const data = await response.json();

        if (data.success) {
          setScreenshotSignedUrl(data.signedUrl);
        } else {
          // Fallback to original URL
          setScreenshotSignedUrl(selectedBooking.payment_screenshot_url);
        }
      } catch (error) {
        console.error("Error fetching screenshot URL:", error);
        setScreenshotSignedUrl(selectedBooking.payment_screenshot_url);
      } finally {
        setLoadingScreenshot(false);
      }
    };

    fetchScreenshotUrl();
  }, [isModalOpen, selectedBooking]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      // Use adminSession for admin API calls
      const sessionStr = localStorage.getItem("adminSession");
      if (!sessionStr) {
        toast.error("Admin session not found. Please login again.");
        return;
      }
      const session = JSON.parse(sessionStr);
      const token = session.token;

      const response = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched bookings:", data.bookings);
        const fetchedBookings = data.bookings || [];
        setBookings(fetchedBookings);
        calculateStats(fetchedBookings);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch bookings:", errorData);
        toast.error(errorData.error || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    // Strict revenue calculation: only confirmed/paid bookings
    const totalRevenue = data
      .filter(b => b.payment_status === 'paid' || b.status === 'confirmed' || b.status === 'Confirmed')
      .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

    const pendingPayments = data
      .filter(b => b.payment_status === 'verification_pending')
      .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

    const completedTransactions = data.filter(b => b.payment_status === 'paid').length;
    const refunds = 0; // Not implemented yet

    setStats({
      totalRevenue,
      pendingPayments,
      completedTransactions,
      refunds,
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === "all") return true;
    if (filterStatus === "verification_pending") return booking.payment_status === "verification_pending";
    if (filterStatus === "paid") return booking.payment_status === "paid";
    if (filterStatus === "pending") return booking.payment_status === "pending";
    return true;
  });

  const handleResendEmail = async (bookingId: string) => {
    try {
      const sessionStr = localStorage.getItem("adminSession");
      if (!sessionStr) {
        toast.error("Admin session not found. Please login again.");
        return;
      }
      const session = JSON.parse(sessionStr);
      const token = session.token;

      toast.promise(
        fetch(`/api/admin/bookings/${bookingId}/resend-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || "Failed to send email");
          return data;
        }),
        {
          loading: 'Sending confirmation email...',
          success: 'Email sent successfully',
          error: (err) => `Failed to send email: ${err.message}`,
        }
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleValidate = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      const sessionStr = localStorage.getItem("adminSession");
      if (!sessionStr) {
        toast.error("Admin session not found. Please login again.");
        return;
      }
      const session = JSON.parse(sessionStr);
      const token = session.token;

      const response = await fetch(`/api/admin/bookings/${bookingId}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Payment ${action}d successfully`);
        fetchBookings(); // Refresh data
        setConfirmation(prev => ({ ...prev, isOpen: false })); // Close modal
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  };

  const requestValidation = (bookingId: string, action: 'approve' | 'reject', currentStatus?: string) => {
    const isRevoke = action === 'approve' && currentStatus === 'failed';
    const title = action === 'approve' ? (isRevoke ? "Revoke Rejection & Approve?" : "Approve Payment?") : "Reject Payment?";
    const message = action === 'approve'
      ? (isRevoke
        ? "Are you sure you want to revoke this rejection? The status will be updated to 'Paid' and a confirmation email will be sent."
        : "Are you sure you want to approve this payment? This will update the status to 'Paid' and send a confirmation email.")
      : "Are you sure you want to reject this payment? This will mark it as failed and notify the user.";

    setConfirmation({
      isOpen: true,
      title,
      message,
      type: action === 'approve' ? 'success' : 'danger',
      onConfirm: () => handleValidate(bookingId, action)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-red-100 text-red-700";
      case "verification_pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments & Finance</h1>
          <p className="text-gray-600 mt-1">Track revenue, payments, and financial reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300" onClick={fetchBookings}>
            <Receipt size={20} className="mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CurrencyCircleDollar size={24} className="text-purple-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.pendingPayments)}
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
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.completedTransactions}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                filterStatus === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("verification_pending")}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                filterStatus === "verification_pending"
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Pending Verification
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                filterStatus === "paid"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Paid
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No transactions found matching filter
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.booking_number}</div>
                      <div className="text-xs text-gray-500">{booking.rooms?.room_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.guest_name}</div>
                      <div className="text-xs text-gray-500">{booking.guest_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize",
                            getStatusColor(booking.payment_status)
                          )}
                        >
                          {booking.payment_status?.replace('_', ' ') || 'Pending'}
                        </span>
                        {booking.payment_screenshot_url && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs" title="Screenshot uploaded">
                            📷
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(new Date(booking.created_at))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Details
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.payment_status === 'verification_pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => requestValidation(booking.id, 'approve', booking.payment_status)}
                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                            title="Approve Payment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => requestValidation(booking.id, 'reject', booking.payment_status)}
                            className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                            title="Reject Payment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {booking.payment_status === 'paid' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Completed</span>
                          <button
                            onClick={() => handleResendEmail(booking.id)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Resend Confirmation Email"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {booking.payment_status === 'pending' && (
                        <span className="text-xs text-gray-500 italic">Awaiting payment</span>
                      )}
                      {booking.payment_status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500 italic bg-red-50 px-2 py-1 rounded">Rejected</span>
                          <button
                            onClick={() => handleResendEmail(booking.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Resend Rejection Email"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => requestValidation(booking.id, 'approve', booking.payment_status)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors ml-1"
                            title="Revoke Rejection (Approve)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
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

      {/* Confirmation Modal */}
      {confirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden"
          >
            <div className={`p-6 text-center ${confirmation.type === 'danger' ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmation.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {confirmation.type === 'danger' ? (
                  <XCircle size={32} weight="fill" />
                ) : (
                  <CheckCircle size={32} weight="fill" />
                )}
              </div>
              <h3 className={`text-lg font-bold ${confirmation.type === 'danger' ? 'text-red-900' : 'text-green-900'}`}>{confirmation.title}</h3>
              <p className={`text-sm mt-2 ${confirmation.type === 'danger' ? 'text-red-700' : 'text-green-700'}`}>{confirmation.message}</p>
            </div>
            <div className="p-4 bg-white flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmation.onConfirm}
                className={`flex-1 ${confirmation.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Confirm
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-brown-dark text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  <p className="text-sm opacity-90 mt-1">#{selectedBooking.booking_number}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Guest Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Guest Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.guest_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.guest_phone}</span>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Booking Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.rooms?.room_number} - {selectedBooking.rooms?.room_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium text-gray-900">{new Date(selectedBooking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium text-gray-900">{new Date(selectedBooking.check_out).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.total_nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.num_adults} Adults, {selectedBooking.num_children} Children</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Charges:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.room_charges)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Total Amount:</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(selectedBooking.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={cn(
                      "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize",
                      getStatusColor(selectedBooking.payment_status)
                    )}>
                      {selectedBooking.payment_status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Status:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedBooking.status}</span>
                  </div>
                </div>
              </div>

              {/* Booking For Info */}
              {selectedBooking.booking_for && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Booking Type
                  </h3>
                  <div className={`rounded-lg p-4 ${selectedBooking.booking_for === 'self' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <span className={`font-medium ${selectedBooking.booking_for === 'self' ? 'text-green-800' : 'text-blue-800'}`}>
                      {selectedBooking.booking_for === 'self' ? '✓ Booking for Self' : '👥 Booking for Someone Else'}
                    </span>
                  </div>
                </div>
              )}

              {/* Guest Details List */}
              {selectedBooking.guest_details && selectedBooking.guest_details.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Guest Details ({selectedBooking.guest_details.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Age</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedBooking.guest_details.map((guest: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-600">{idx + 1}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{guest.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{guest.age} yrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Guest ID (for booking for someone else) */}
              {selectedBooking.booking_for === 'relative' && selectedBooking.guest_id_number && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brown-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Guest ID Details
                  </h3>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Guest Aadhaar Number:</span>
                      <span className="font-mono font-medium text-gray-900">{selectedBooking.guest_id_number}</span>
                    </div>
                    {selectedBooking.guest_relation && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Relation:</span>
                        <span className="font-medium text-gray-900">{selectedBooking.guest_relation}</span>
                      </div>
                    )}
                    {selectedBooking.guest_id_image_url && (
                      <div className="mt-2 pt-2 border-t border-orange-200">
                        <span className="text-sm text-orange-700">✓ Guest ID Document uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Screenshot */}
              {selectedBooking.payment_screenshot_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Payment Screenshot
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    {loadingScreenshot ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      <>
                        <div className="relative aspect-video bg-white rounded-lg overflow-hidden border border-gray-200 mb-3">
                          <img
                            src={screenshotSignedUrl || selectedBooking.payment_screenshot_url}
                            alt="Payment Screenshot"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={screenshotSignedUrl || selectedBooking.payment_screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Full
                          </a>
                          <a
                            href={screenshotSignedUrl || selectedBooking.payment_screenshot_url}
                            download={`payment_${selectedBooking.booking_number}.jpg`}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedBooking.special_requests}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
