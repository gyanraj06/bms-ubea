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
  Eye,
  EnvelopeSimple,
  ArrowCounterClockwise,
  ArrowClockwise,
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
  const [govtIdSignedUrl, setGovtIdSignedUrl] = useState<string>("");
  const [bankIdSignedUrl, setBankIdSignedUrl] = useState<string>("");
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [checkingStatusId, setCheckingStatusId] = useState<string | null>(null);

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

  // Fetch signed URLs when modal opens
  useEffect(() => {
    const fetchDocumentUrls = async () => {
      if (!isModalOpen || !selectedBooking) {
        setScreenshotSignedUrl("");
        setGovtIdSignedUrl("");
        setBankIdSignedUrl("");
        return;
      }

      // Fetch payment screenshot URL
      if (selectedBooking.payment_screenshot_url) {
        setLoadingScreenshot(true);
        try {
          const response = await fetch(`/api/bookings/upload-document?filePath=${encodeURIComponent(selectedBooking.payment_screenshot_url)}`);
          const data = await response.json();
          setScreenshotSignedUrl(data.success ? data.signedUrl : selectedBooking.payment_screenshot_url);
        } catch (error) {
          console.error("Error fetching screenshot URL:", error);
          setScreenshotSignedUrl(selectedBooking.payment_screenshot_url);
        } finally {
          setLoadingScreenshot(false);
        }
      }

      // Fetch document URLs
      setLoadingDocs(true);
      try {
        // Govt ID
        if (selectedBooking.govt_id_image_url) {
          const response = await fetch(`/api/bookings/upload-document?filePath=${encodeURIComponent(selectedBooking.govt_id_image_url)}`);
          const data = await response.json();
          setGovtIdSignedUrl(data.success ? data.signedUrl : selectedBooking.govt_id_image_url);
        }

        // Bank ID
        if (selectedBooking.bank_id_image_url) {
          const response = await fetch(`/api/bookings/upload-document?filePath=${encodeURIComponent(selectedBooking.bank_id_image_url)}`);
          const data = await response.json();
          setBankIdSignedUrl(data.success ? data.signedUrl : selectedBooking.bank_id_image_url);
        }
      } catch (error) {
        console.error("Error fetching document URLs:", error);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocumentUrls();
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

  const handleCheckStatus = async (booking: any) => {
    const latestTxnId = booking.payment_logs && booking.payment_logs.length > 0
      ? [...booking.payment_logs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].transaction_id
      : null;

    if (!latestTxnId) {
      toast.error("No transaction ID found to check.");
      return;
    }

    try {
      setCheckingStatusId(booking.id);
      const sessionStr = localStorage.getItem("adminSession");
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      const token = session.token;

      const response = await fetch("/api/admin/payment/check-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transaction_id: latestTxnId,
          booking_id: booking.id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Status updated: ${data.status}`);
        fetchBookings(); // Refresh UI
        if (isModalOpen) setIsModalOpen(false); // Close modal to avoid stale data
      } else {
        toast.error(data.error || "Check failed");
      }

    } catch (e: any) {
      toast.error(e.message || "Failed to check status");
    } finally {
      setCheckingStatusId(null);
    }
  };

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

  // Mobile card component for each booking
  const MobileBookingCard = ({ booking }: { booking: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* Status Banner at Top */}
      <div className={cn(
        "px-3 py-2 flex items-center justify-between",
        booking.payment_status === 'paid' && "bg-green-50 border-b border-green-100",
        booking.payment_status === 'verification_pending' && "bg-yellow-50 border-b border-yellow-100",
        booking.payment_status === 'pending' && "bg-red-50 border-b border-red-100",
        booking.payment_status === 'failed' && "bg-gray-100 border-b border-gray-200",
        !['paid', 'verification_pending', 'pending', 'failed'].includes(booking.payment_status) && "bg-gray-50 border-b border-gray-100"
      )}>
        <span
          className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-full capitalize",
            getStatusColor(booking.payment_status)
          )}
        >
          {booking.payment_status?.replace('_', ' ') || 'Pending'}
        </span>
        <div className="flex items-center gap-2">
          {booking.payment_screenshot_url && (
            <span className="text-green-600 text-xs flex items-center gap-1" title="Screenshot uploaded">
              📷 <span className="text-[10px] text-green-700">Uploaded</span>
            </span>
          )}
          <span className="text-[10px] text-gray-500">{formatDate(new Date(booking.created_at))}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 space-y-3">
        {/* Booking Info Row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">{booking.booking_number}</p>
            <p className="text-xs text-gray-500">{booking.rooms?.room_type}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(booking.total_amount)}</p>
          </div>
        </div>

        {/* Guest Info */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
          <div>
            <p className="text-sm font-medium text-gray-900">{booking.guest_name}</p>
            <p className="text-xs text-gray-500">{booking.guest_phone}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              setSelectedBooking(booking);
              setIsModalOpen(true);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Eye size={14} weight="bold" />
            View Details
          </button>

          {booking.payment_status === 'verification_pending' && (
            <>
              <button
                onClick={() => requestValidation(booking.id, 'approve', booking.payment_status)}
                className="p-2.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                title="Approve"
              >
                <CheckCircle size={18} weight="bold" />
              </button>
              <button
                onClick={() => requestValidation(booking.id, 'reject', booking.payment_status)}
                className="p-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                title="Reject"
              >
                <XCircle size={18} weight="bold" />
              </button>
            </>
          )}

          {booking.payment_status === 'paid' && (
            <button
              onClick={() => handleResendEmail(booking.id)}
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
              title="Resend Email"
            >
              <EnvelopeSimple size={18} weight="bold" />
            </button>
          )}

          {booking.payment_status === 'failed' && (
            <>
              <button
                onClick={() => handleResendEmail(booking.id)}
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                title="Resend Rejection Email"
              >
                <EnvelopeSimple size={18} weight="bold" />
              </button>
              <button
                onClick={() => requestValidation(booking.id, 'approve', booking.payment_status)}
                className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-200"
                title="Revoke Rejection"
              >
                <ArrowCounterClockwise size={18} weight="bold" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4 md:space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Payments & Finance</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">Track revenue, payments, and financial reports</p>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-xs md:text-sm h-9 md:h-10 w-full sm:w-auto"
          onClick={fetchBookings}
        >
          <Receipt size={16} className="mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Revenue Stats - Improved mobile layout */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-3 md:p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm text-gray-600 font-medium truncate">Total Revenue</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-2 truncate">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-1.5 md:p-3 bg-purple-100 rounded-lg w-fit">
              <CurrencyCircleDollar size={16} className="text-purple-600 md:w-6 md:h-6" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-3 md:p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm text-gray-600 font-medium truncate">Pending</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-2 truncate">
                {formatCurrency(stats.pendingPayments)}
              </p>
            </div>
            <div className="p-1.5 md:p-3 bg-yellow-100 rounded-lg w-fit">
              <Clock size={16} className="text-yellow-600 md:w-6 md:h-6" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-3 md:p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm text-gray-600 font-medium truncate">Completed</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-2">
                {stats.completedTransactions}
              </p>
            </div>
            <div className="p-1.5 md:p-3 bg-green-100 rounded-lg w-fit">
              <CheckCircle size={16} className="text-green-600 md:w-6 md:h-6" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header with filters */}
        <div className="p-3 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-base md:text-xl font-bold text-gray-900">Recent Transactions</h2>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setFilterStatus("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
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
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  filterStatus === "verification_pending"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus("paid")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  filterStatus === "paid"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Paid
              </button>
              <button
                onClick={() => setFilterStatus("failed")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  filterStatus === "failed"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="md:hidden p-3 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No transactions found matching filter
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <MobileBookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Info
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No transactions found matching filter
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.booking_number}</div>
                      <div className="text-xs text-gray-500">{booking.rooms?.room_type}</div>
                      {/* Show Latest Transaction ID */}
                      {booking.payment_logs && booking.payment_logs.length > 0 && (
                        <div className="text-[10px] text-gray-400 mt-1 font-mono">
                          Txn: {[...booking.payment_logs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].transaction_id.substring(0, 10)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.guest_name}</div>
                      <div className="text-xs text-gray-500">{booking.guest_phone}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-full capitalize",
                            getStatusColor(booking.payment_status)
                          )}
                        >
                          {booking.payment_status?.replace('_', ' ') || 'Pending'}
                        </span>
                        {booking.payment_screenshot_url && (
                          <span className="text-green-600 text-xs" title="Screenshot uploaded">📷</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(new Date(booking.created_at))}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCheckStatus(booking)}
                          disabled={checkingStatusId === booking.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          title="Check Gateway Status"
                        >
                          <ArrowClockwise size={14} className={checkingStatusId === booking.id ? "animate-spin" : ""} />
                          Check
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Eye size={14} />
                          Details
                        </button>

                        {booking.payment_status === 'verification_pending' && (
                          <>
                            <button
                              onClick={() => requestValidation(booking.id, 'approve', booking.payment_status)}
                              className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                              title="Approve Payment"
                            >
                              <CheckCircle size={16} weight="bold" />
                            </button>
                            <button
                              onClick={() => requestValidation(booking.id, 'reject', booking.payment_status)}
                              className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                              title="Reject Payment"
                            >
                              <XCircle size={16} weight="bold" />
                            </button>
                          </>
                        )}

                        {booking.payment_status === 'paid' && (
                          <button
                            onClick={() => handleResendEmail(booking.id)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Resend Confirmation Email"
                          >
                            <EnvelopeSimple size={16} weight="bold" />
                          </button>
                        )}

                        {booking.payment_status === 'failed' && (
                          <>
                            <button
                              onClick={() => handleResendEmail(booking.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Resend Rejection Email"
                            >
                              <EnvelopeSimple size={16} weight="bold" />
                            </button>
                            <button
                              onClick={() => requestValidation(booking.id, 'approve', booking.payment_status)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Revoke Rejection (Approve)"
                            >
                              <ArrowCounterClockwise size={16} weight="bold" />
                            </button>
                          </>
                        )}
                      </div>
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
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
          >
            <div className={`p-6 text-center ${confirmation.type === 'danger' ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${confirmation.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {confirmation.type === 'danger' ? (
                  <XCircle size={32} weight="fill" />
                ) : (
                  <CheckCircle size={32} weight="fill" />
                )}
              </div>
              <h3 className={`text-lg font-bold ${confirmation.type === 'danger' ? 'text-red-900' : 'text-green-900'}`}>
                {confirmation.title}
              </h3>
              <p className={`text-sm mt-2 ${confirmation.type === 'danger' ? 'text-red-700' : 'text-green-700'}`}>
                {confirmation.message}
              </p>
            </div>
            <div className="p-4 bg-white flex gap-3">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4 md:p-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">Booking Details</h2>
                  <p className="text-xs md:text-sm opacity-90 mt-0.5">#{selectedBooking.booking_number}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <XCircle size={24} weight="bold" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
              {/* Guest Information */}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Guest Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.guest_name}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900 truncate ml-2 max-w-[180px]">{selectedBooking.guest_email}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{selectedBooking.guest_phone}</span>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Booking Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 space-y-3">
                  {/* Rooms - Vertical List */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Room(s):</p>
                    <div className="space-y-1">
                      {Array.isArray(selectedBooking.rooms) && selectedBooking.rooms.length > 0
                        ? selectedBooking.rooms.map((r: any, i: number) => (
                          <div key={i} className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">
                            Room {r.room_number} — <span className="text-amber-700">{r.room_type}</span>
                          </div>
                        ))
                        : selectedBooking.rooms?.room_number
                          ? <div className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">
                            Room {selectedBooking.rooms.room_number} — <span className="text-amber-700">{selectedBooking.rooms.room_type}</span>
                          </div>
                          : <span className="text-sm text-gray-400">-</span>}
                    </div>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Check-in</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(selectedBooking.check_in).toLocaleDateString()}</p>
                      <p className="text-xs text-amber-700 font-medium">{new Date(selectedBooking.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">Check-out</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(selectedBooking.check_out).toLocaleDateString()}</p>
                      <p className="text-xs text-amber-700 font-medium">{new Date(selectedBooking.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <p className="text-xs text-gray-500">Nights</p>
                      <p className="text-lg font-bold text-gray-900">{selectedBooking.total_nights}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                      <p className="text-xs text-gray-500">Total Guests</p>
                      <p className="text-lg font-bold text-gray-900">{selectedBooking.num_guests || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Room Charges:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.room_charges)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">GST:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-sm md:text-base">
                    <span className="text-gray-900 font-semibold">Total Amount:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(selectedBooking.total_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm pt-1">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full capitalize",
                      getStatusColor(selectedBooking.payment_status)
                    )}>
                      {selectedBooking.payment_status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction History (New) */}
              {selectedBooking.payment_logs && selectedBooking.payment_logs.length > 0 && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CurrencyCircleDollar className="w-4 h-4 text-amber-700" weight="fill" />
                    Transaction History
                  </h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    <table className="w-full text-xs md:text-sm text-left">
                      <thead className="bg-gray-100 border-b border-gray-200 font-semibold text-gray-700">
                        <tr>
                          <th className="p-2 md:p-3">Date</th>
                          <th className="p-2 md:p-3">Txn ID</th>
                          <th className="p-2 md:p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedBooking.payment_logs
                          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((log: any, i: number) => (
                            <tr key={i}>
                              <td className="p-2 md:p-3 text-gray-600 whitespace-nowrap">{new Date(log.created_at).toLocaleDateString()}</td>
                              <td className="p-2 md:p-3 font-mono text-gray-900 break-all w-24 md:w-auto">{log.transaction_id}</td>
                              <td className="p-2 md:p-3">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold capitalize",
                                  getStatusColor(log.status === 'PAID' || log.status === 'success' ? 'paid' : 'failed')
                                )}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Booking For Info */}
              {selectedBooking.booking_for && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Booking Type</h3>
                  <div className={`rounded-xl p-3 md:p-4 text-xs md:text-sm ${selectedBooking.booking_for === 'self' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <span className={`font-medium ${selectedBooking.booking_for === 'self' ? 'text-green-800' : 'text-blue-800'}`}>
                      {selectedBooking.booking_for === 'self' ? '✓ Booking for Self' : '👥 Booking for Someone Else'}
                    </span>
                  </div>
                </div>
              )}

              {/* Guest Details List */}
              {selectedBooking.guest_details && selectedBooking.guest_details.length > 0 && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                    Guest Details ({selectedBooking.guest_details.length})
                  </h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-600">#</th>
                          <th className="px-3 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-600">Name</th>
                          <th className="px-3 py-2 text-left text-[10px] md:text-xs font-semibold text-gray-600">Age</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedBooking.guest_details.map((guest: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-xs md:text-sm text-gray-600">{idx + 1}</td>
                            <td className="px-3 py-2 text-xs md:text-sm font-medium text-gray-900">{guest.name}</td>
                            <td className="px-3 py-2 text-xs md:text-sm text-gray-600">{guest.age} yrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Government ID Information */}
              {(selectedBooking.govt_id_image_url || selectedBooking.id_type || selectedBooking.id_number) && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Government ID Proof
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-3 md:p-4 border border-blue-200 space-y-3">
                    {selectedBooking.id_type && (
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600">ID Type:</span>
                        <span className="font-medium text-gray-900">{selectedBooking.id_type}</span>
                      </div>
                    )}
                    {selectedBooking.id_number && (
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600">ID Number:</span>
                        <span className="font-mono font-medium text-gray-900">{selectedBooking.id_number}</span>
                      </div>
                    )}
                    {selectedBooking.govt_id_image_url && (
                      <div className="pt-2 border-t border-blue-200">
                        {loadingDocs ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <>
                            <div className="relative aspect-video bg-white rounded-lg overflow-hidden border border-gray-200 mb-3">
                              <img
                                src={govtIdSignedUrl || selectedBooking.govt_id_image_url}
                                alt="Government ID"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={govtIdSignedUrl || selectedBooking.govt_id_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                <Eye size={14} />
                                View Full
                              </a>
                              <a
                                href={govtIdSignedUrl || selectedBooking.govt_id_image_url}
                                download={`govt_id_${selectedBooking.booking_number}.jpg`}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-600 text-white text-xs md:text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
                              >
                                <Download size={14} />
                                Download
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bank / Employee ID Information */}
              {(selectedBooking.bank_id_image_url || selectedBooking.bank_id_number) && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Bank className="w-4 h-4 text-purple-600" weight="fill" />
                    Bank / Employee ID
                  </h3>
                  <div className="bg-purple-50 rounded-xl p-3 md:p-4 border border-purple-200 space-y-3">
                    {selectedBooking.bank_id_number && (
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600">Employee ID Number:</span>
                        <span className="font-mono font-medium text-gray-900">{selectedBooking.bank_id_number}</span>
                      </div>
                    )}
                    {selectedBooking.bank_id_image_url && (
                      <div className="pt-2 border-t border-purple-200">
                        {loadingDocs ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          </div>
                        ) : (
                          <>
                            <div className="relative aspect-video bg-white rounded-lg overflow-hidden border border-gray-200 mb-3">
                              <img
                                src={bankIdSignedUrl || selectedBooking.bank_id_image_url}
                                alt="Employee ID"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={bankIdSignedUrl || selectedBooking.bank_id_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-xs md:text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium"
                              >
                                <Eye size={14} />
                                View Full
                              </a>
                              <a
                                href={bankIdSignedUrl || selectedBooking.bank_id_image_url}
                                download={`employee_id_${selectedBooking.booking_number}.jpg`}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-600 text-white text-xs md:text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
                              >
                                <Download size={14} />
                                Download
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Guest ID (for booking for someone else) */}
              {selectedBooking.booking_for === 'relative' && selectedBooking.guest_id_number && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Guest ID Details</h3>
                  <div className="bg-orange-50 rounded-xl p-3 md:p-4 border border-orange-200">
                    <div className="flex justify-between mb-2 text-xs md:text-sm">
                      <span className="text-gray-600">Aadhaar Number:</span>
                      <span className="font-mono font-medium text-gray-900">{selectedBooking.guest_id_number}</span>
                    </div>
                    {selectedBooking.guest_relation && (
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600">Relation:</span>
                        <span className="font-medium text-gray-900">{selectedBooking.guest_relation}</span>
                      </div>
                    )}
                    {selectedBooking.guest_id_image_url && (
                      <div className="mt-2 pt-2 border-t border-orange-200">
                        <span className="text-xs text-orange-700">✓ Guest ID Document uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Screenshot */}
              {selectedBooking.payment_screenshot_url && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Payment Screenshot
                  </h3>
                  <div className="bg-green-50 rounded-xl p-3 md:p-4 border border-green-200">
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
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Eye size={14} />
                            View Full
                          </a>
                          <a
                            href={screenshotSignedUrl || selectedBooking.payment_screenshot_url}
                            download={`payment_${selectedBooking.booking_number}.jpg`}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-600 text-white text-xs md:text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
                          >
                            <Download size={14} />
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
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Special Requests</h3>
                  <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                    <p className="text-xs md:text-sm text-gray-700">{selectedBooking.special_requests}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex-shrink-0 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
