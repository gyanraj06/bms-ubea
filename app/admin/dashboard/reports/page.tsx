"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChartBar,
  TrendUp,
  TrendDown,
  Download,
  Calendar,
  Users,
  CurrencyCircleDollar,
  Bed,
  CheckCircle,
  XCircle,
  CaretRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Booking {
  id: string;
  booking_number: string;
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
  created_at: string;
  rooms?: {
    room_number: string;
    room_type: string;
  };
}

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  base_price: number;
  is_active: boolean;
  is_available: boolean;
}

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
  occupancy: number;
  avgRate: number;
}

interface RoomTypePerformance {
  room_type: string;
  bookings: number;
  revenue: number;
  occupancy: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

const CHART_COLORS = ['#32373c', '#DDC9B5', '#5a4a3a', '#8b7355', '#F2EDE8'];

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [reportType, setReportType] = useState<"revenue" | "occupancy" | "bookings" | "guests">("revenue");
  const [loading, setLoading] = useState(true);

  // Real data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [roomTypePerformance, setRoomTypePerformance] = useState<RoomTypePerformance[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalBookings: 0,
    bookingsChange: 0,
    avgOccupancy: 0,
    occupancyChange: 0,
    avgDailyRate: 0,
    rateChange: 0,
  });

  useEffect(() => {
    fetchReportsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Please login again");
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch bookings and rooms
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/rooms', { headers })
      ]);

      const bookingsData = await bookingsRes.json();
      const roomsData = await roomsRes.json();

      console.log('Reports Data:', { bookingsData, roomsData });

      if (bookingsData.success && roomsData.success) {
        const allBookings: Booking[] = bookingsData.bookings || [];
        const allRooms: Room[] = roomsData.rooms || [];

        console.log('Processing bookings:', allBookings.length, 'rooms:', allRooms.length);

        setBookings(allBookings);
        setRooms(allRooms);

        // Calculate analytics
        calculateAnalytics(allBookings, allRooms, timeframe);
        calculateMonthlyData(allBookings, allRooms, timeframe);
        calculateRoomTypePerformance(allBookings);
        calculateStatusBreakdown(allBookings);
      } else {
        console.error('API Error:', bookingsData, roomsData);
        toast.error(bookingsData.error || roomsData.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error("Error fetching reports data:", error);
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (allBookings: Booking[], allRooms: Room[], period: string) => {
    const now = new Date();
    const totalRooms = allRooms.filter(r => r.is_active).length;

    // Calculate current period data
    const currentPeriodBookings = filterBookingsByPeriod(allBookings, period, 0);
    const previousPeriodBookings = filterBookingsByPeriod(allBookings, period, 1);

    console.log('Analytics Calculation:', {
      period,
      totalRooms,
      currentPeriodBookings: currentPeriodBookings.length,
      previousPeriodBookings: previousPeriodBookings.length,
    });

    // Total Revenue
    const totalRevenue = currentPeriodBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const previousRevenue = previousPeriodBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Total Bookings
    const totalBookings = currentPeriodBookings.length;
    const previousBookings = previousPeriodBookings.length;
    const bookingsChange = previousBookings > 0 ? ((totalBookings - previousBookings) / previousBookings) * 100 : 0;

    // Occupancy Rate
    const totalNights = currentPeriodBookings.reduce((sum, b) => sum + (b.total_nights || 0), 0);
    const daysInPeriod = getDaysInPeriod(period);
    const maxPossibleNights = totalRooms * daysInPeriod;
    const avgOccupancy = maxPossibleNights > 0 ? (totalNights / maxPossibleNights) * 100 : 0;

    const prevTotalNights = previousPeriodBookings.reduce((sum, b) => sum + (b.total_nights || 0), 0);
    const prevOccupancy = maxPossibleNights > 0 ? (prevTotalNights / maxPossibleNights) * 100 : 0;
    const occupancyChange = prevOccupancy > 0 ? ((avgOccupancy - prevOccupancy) / prevOccupancy) * 100 : 0;

    // Average Daily Rate
    const avgDailyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
    const prevAvgRate = prevTotalNights > 0 ? previousRevenue / prevTotalNights : 0;
    const rateChange = prevAvgRate > 0 ? ((avgDailyRate - prevAvgRate) / prevAvgRate) * 100 : 0;

    const calculatedAnalytics = {
      totalRevenue,
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      totalBookings,
      bookingsChange: parseFloat(bookingsChange.toFixed(1)),
      avgOccupancy: parseFloat(avgOccupancy.toFixed(1)),
      occupancyChange: parseFloat(occupancyChange.toFixed(1)),
      avgDailyRate,
      rateChange: parseFloat(rateChange.toFixed(1)),
    };

    console.log('Setting analytics:', calculatedAnalytics);
    setAnalytics(calculatedAnalytics);
  };

  const filterBookingsByPeriod = (bookings: Booking[], period: string, offset: number) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      const weekOffset = offset * 7;
      endDate = new Date(now.getTime() - weekOffset * 24 * 60 * 60 * 1000);
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      endDate = new Date(now.getFullYear(), now.getMonth() - offset, now.getDate());
      startDate = new Date(now.getFullYear(), now.getMonth() - offset - 1, now.getDate());
    } else { // year
      endDate = new Date(now.getFullYear() - offset, now.getMonth(), now.getDate());
      startDate = new Date(now.getFullYear() - offset - 1, now.getMonth(), now.getDate());
    }

    return bookings.filter(b => {
      const checkIn = new Date(b.check_in);
      return checkIn >= startDate && checkIn < endDate;
    });
  };

  const getDaysInPeriod = (period: string) => {
    if (period === 'week') return 7;
    if (period === 'month') return 30;
    return 365; // year
  };

  const calculateMonthlyData = (allBookings: Booking[], allRooms: Room[], period: string) => {
    const now = new Date();
    const data: MonthlyData[] = [];
    const totalRooms = allRooms.filter(r => r.is_active).length;

    let periodsToShow = 6;
    if (period === 'week') periodsToShow = 7;
    if (period === 'year') periodsToShow = 12;

    for (let i = periodsToShow - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;

      if (period === 'week') {
        periodEnd = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        periodStart = new Date(periodEnd);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
        label = periodEnd.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      } else if (period === 'month') {
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        label = periodStart.toLocaleDateString('en-IN', { month: 'short' });
      } else {
        periodStart = new Date(now.getFullYear() - i, 0, 1);
        periodEnd = new Date(now.getFullYear() - i, 11, 31);
        label = periodStart.getFullYear().toString();
      }

      const periodBookings = allBookings.filter(b => {
        const checkIn = new Date(b.check_in);
        return checkIn >= periodStart && checkIn <= periodEnd;
      });

      const revenue = periodBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const bookingCount = periodBookings.length;
      const totalNights = periodBookings.reduce((sum, b) => sum + (b.total_nights || 0), 0);

      const daysInThisPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      const maxNights = totalRooms * daysInThisPeriod;
      const occupancy = maxNights > 0 ? (totalNights / maxNights) * 100 : 0;
      const avgRate = totalNights > 0 ? revenue / totalNights : 0;

      data.push({
        month: label,
        revenue,
        bookings: bookingCount,
        occupancy: parseFloat(occupancy.toFixed(1)),
        avgRate,
      });
    }

    setMonthlyData(data);
  };

  const calculateRoomTypePerformance = (allBookings: Booking[]) => {
    const roomTypeMap = new Map<string, { bookings: number; revenue: number; nights: number }>();

    allBookings.forEach(booking => {
      if (!booking.rooms?.room_type) return;

      const roomType = booking.rooms.room_type;
      const current = roomTypeMap.get(roomType) || { bookings: 0, revenue: 0, nights: 0 };

      roomTypeMap.set(roomType, {
        bookings: current.bookings + 1,
        revenue: current.revenue + (booking.total_amount || 0),
        nights: current.nights + (booking.total_nights || 0),
      });
    });

    // Calculate occupancy based on available rooms of each type
    const totalBookingsByType = Array.from(roomTypeMap.values()).reduce((sum, val) => sum + val.bookings, 0);

    const performance: RoomTypePerformance[] = Array.from(roomTypeMap.entries()).map(([type, data]) => ({
      room_type: type,
      bookings: data.bookings,
      revenue: data.revenue,
      occupancy: totalBookingsByType > 0 ? parseFloat(((data.bookings / totalBookingsByType) * 100).toFixed(1)) : 0,
    }));

    // Sort by revenue descending
    performance.sort((a, b) => b.revenue - a.revenue);
    setRoomTypePerformance(performance);
  };

  const calculateStatusBreakdown = (allBookings: Booking[]) => {
    const statusMap = new Map<string, number>();

    allBookings.forEach(booking => {
      const status = booking.status || 'Unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const total = allBookings.length;
    const breakdown: StatusBreakdown[] = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    }));

    // Sort by count descending
    breakdown.sort((a, b) => b.count - a.count);
    setStatusBreakdown(breakdown);
  };

  const exportReport = () => {
    const reportData = {
      analytics,
      monthlyData,
      roomTypePerformance,
      statusBreakdown,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-report-${timeframe}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Mobile Performance Card Component
  const MobilePerformanceCard = ({ data }: { data: MonthlyData }) => (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">{data.month}</span>
        <span className="text-sm font-bold text-green-600">{formatCurrency(data.revenue)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Bookings</p>
          <p className="text-sm font-bold text-gray-900">{data.bookings}</p>
        </div>
        <div className="bg-white rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Occupancy</p>
          <p className="text-sm font-bold text-gray-900">{data.occupancy}%</p>
        </div>
        <div className="bg-white rounded-lg p-2">
          <p className="text-[10px] text-gray-500">Avg Rate</p>
          <p className="text-sm font-bold text-gray-900">₹{Math.round(data.avgRate)}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brown-dark mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">Business insights and performance metrics</p>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-xs md:text-sm h-9 md:h-10 w-full sm:w-auto"
          onClick={exportReport}
        >
          <Download size={16} className="mr-1.5" />
          Export Report
        </Button>
      </div>

      {/* Timeframe Selector - Horizontal scroll on mobile */}
      <div className="flex gap-1.5 md:gap-2 bg-white p-1.5 md:p-2 rounded-xl border border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setTimeframe("week")}
          className={cn(
            "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
            timeframe === "week"
              ? "bg-brown-dark text-white"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
          )}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeframe("month")}
          className={cn(
            "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
            timeframe === "month"
              ? "bg-brown-dark text-white"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
          )}
        >
          Last 6 Months
        </button>
        <button
          onClick={() => setTimeframe("year")}
          className={cn(
            "px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
            timeframe === "year"
              ? "bg-brown-dark text-white"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
          )}
        >
          Last Year
        </button>
      </div>

      {/* Key Metrics - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-2 md:p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-2 truncate">
                {formatCurrency(analytics.totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-1 md:mt-2">
                {analytics.revenueChange >= 0 ? (
                  <TrendUp size={12} className="text-green-600 md:w-4 md:h-4" weight="bold" />
                ) : (
                  <TrendDown size={12} className="text-red-600 md:w-4 md:h-4" weight="bold" />
                )}
                <span className={cn(
                  "text-[10px] md:text-sm font-medium",
                  analytics.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(analytics.revenueChange)}%
                </span>
              </div>
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
          className="bg-white rounded-xl p-2 md:p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm text-gray-600 font-medium">Total Bookings</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-2">
                {analytics.totalBookings}
              </p>
              <div className="flex items-center gap-1 mt-1 md:mt-2">
                {analytics.bookingsChange >= 0 ? (
                  <TrendUp size={12} className="text-green-600 md:w-4 md:h-4" weight="bold" />
                ) : (
                  <TrendDown size={12} className="text-red-600 md:w-4 md:h-4" weight="bold" />
                )}
                <span className={cn(
                  "text-[10px] md:text-sm font-medium",
                  analytics.bookingsChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(analytics.bookingsChange)}%
                </span>
              </div>
            </div>
            <div className="p-1.5 md:p-3 bg-blue-100 rounded-lg w-fit">
              <CheckCircle size={16} className="text-blue-600 md:w-6 md:h-6" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-2 md:p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm text-gray-600 font-medium">Avg Occupancy</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-2">
                {analytics.avgOccupancy}%
              </p>
              <div className="flex items-center gap-1 mt-1 md:mt-2">
                {analytics.occupancyChange >= 0 ? (
                  <TrendUp size={12} className="text-green-600 md:w-4 md:h-4" weight="bold" />
                ) : (
                  <TrendDown size={12} className="text-red-600 md:w-4 md:h-4" weight="bold" />
                )}
                <span className={cn(
                  "text-[10px] md:text-sm font-medium",
                  analytics.occupancyChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(analytics.occupancyChange)}%
                </span>
              </div>
            </div>
            <div className="p-1.5 md:p-3 bg-green-100 rounded-lg w-fit">
              <Bed size={16} className="text-green-600 md:w-6 md:h-6" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-2 md:p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-sm text-gray-600 font-medium">Avg Daily Rate</p>
              <p className="text-sm md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-2 truncate">
                {formatCurrency(analytics.avgDailyRate)}
              </p>
              <div className="flex items-center gap-1 mt-1 md:mt-2">
                {analytics.rateChange >= 0 ? (
                  <TrendUp size={12} className="text-green-600 md:w-4 md:h-4" weight="bold" />
                ) : (
                  <TrendDown size={12} className="text-red-600 md:w-4 md:h-4" weight="bold" />
                )}
                <span className={cn(
                  "text-[10px] md:text-sm font-medium",
                  analytics.rateChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(analytics.rateChange)}%
                </span>
              </div>
            </div>
            <div className="p-1.5 md:p-3 bg-orange-100 rounded-lg w-fit">
              <ChartBar size={16} className="text-orange-600 md:w-6 md:h-6" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 md:p-6 shadow-sm overflow-hidden">
          <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Revenue Trend</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#32373c"
                  strokeWidth={2}
                  dot={{ fill: '#32373c', r: 3 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 md:p-6 shadow-sm overflow-hidden">
          <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Booking Trends</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="bookings" fill="#DDC9B5" name="Bookings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Rate Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 md:p-6 shadow-sm overflow-hidden">
          <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Occupancy Rate (%)</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                  name="Occupancy %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 md:p-6 shadow-sm overflow-hidden">
          <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Status Distribution</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ payload }: any) => `${payload.status}: ${payload.percentage}%`}
                  labelLine={false}
                  className="text-[10px] md:text-xs"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} bookings`, name]}
                  contentStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Additional Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Top Performing Room Types */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-xl font-bold text-gray-900">Top Performing Room Types</h2>
          </div>
          <div className="p-3 md:p-6">
            {roomTypePerformance.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No booking data available</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {roomTypePerformance.map((room, index) => (
                  <div key={room.room_type} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-brown-dark text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 md:mb-1">
                        <p className="font-semibold text-gray-900 text-xs md:text-base truncate pr-2">{room.room_type}</p>
                        <p className="text-xs md:text-sm font-bold text-gray-900 flex-shrink-0">
                          {formatCurrency(room.revenue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-sm text-gray-600">
                        <span>{room.bookings} bookings</span>
                        <span>{room.occupancy}% of total</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-xl font-bold text-gray-900">Booking Status Breakdown</h2>
          </div>
          <div className="p-3 md:p-6">
            {statusBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No booking data available</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {statusBreakdown.map((status) => (
                  <div key={status.status}>
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <span className="text-xs md:text-sm font-medium text-gray-900 capitalize">{status.status}</span>
                      <span className="text-xs md:text-sm font-bold text-gray-900">{status.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                      <div
                        className="bg-brown-dark h-1.5 md:h-2 rounded-full transition-all"
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{status.count} bookings</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Performance - Cards on mobile, Table on desktop */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-3 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-xl font-bold text-gray-900">Performance Data</h2>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden p-3 space-y-2">
          {monthlyData.map((data) => (
            <MobilePerformanceCard key={data.month} data={data} />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((data) => (
                <tr key={data.month} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(data.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(data.occupancy, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{data.occupancy}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(data.avgRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
