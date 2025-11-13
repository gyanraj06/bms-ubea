"use client";

import { useState } from "react";
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
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ReportData {
  period: string;
  revenue: number;
  bookings: number;
  occupancy: number;
  avgRate: number;
}

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [reportType, setReportType] = useState<"revenue" | "occupancy" | "bookings" | "guests">("revenue");

  // Mock data for different timeframes
  const monthlyData: ReportData[] = [
    { period: "January", revenue: 450000, bookings: 145, occupancy: 78, avgRate: 3100 },
    { period: "February", revenue: 420000, bookings: 138, occupancy: 75, avgRate: 3045 },
    { period: "March", revenue: 480000, bookings: 152, occupancy: 82, avgRate: 3158 },
    { period: "April", revenue: 510000, bookings: 165, occupancy: 85, avgRate: 3090 },
    { period: "May", revenue: 495000, bookings: 158, occupancy: 81, avgRate: 3133 },
    { period: "June", revenue: 525000, bookings: 170, occupancy: 87, avgRate: 3088 },
  ];

  // Mock analytics stats
  const analytics = {
    totalRevenue: 2880000,
    revenueChange: 18.5,
    totalBookings: 928,
    bookingsChange: 12.3,
    avgOccupancy: 81.3,
    occupancyChange: 5.7,
    avgDailyRate: 3102,
    rateChange: -2.1,
  };

  // Mock top performing rooms
  const topRooms = [
    { name: "Deluxe Suite", bookings: 245, revenue: 980000, occupancy: 92 },
    { name: "Premium Room", bookings: 198, revenue: 742500, occupancy: 87 },
    { name: "Standard Room", bookings: 312, revenue: 624000, occupancy: 78 },
    { name: "Executive Suite", bookings: 173, revenue: 865000, occupancy: 85 },
  ];

  // Mock guest demographics
  const guestDemographics = [
    { source: "Direct Booking", count: 342, percentage: 36.9 },
    { source: "Online Travel Agency", count: 287, percentage: 30.9 },
    { source: "Corporate", count: 156, percentage: 16.8 },
    { source: "Walk-in", count: 143, percentage: 15.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300">
            <Calendar size={20} className="mr-2" />
            Date Range
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Download size={20} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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
                {formatCurrency(analytics.totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendUp size={16} className="text-green-600" weight="bold" />
                <span className="text-sm font-medium text-green-600">
                  {analytics.revenueChange}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
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
              <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {analytics.totalBookings}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendUp size={16} className="text-green-600" weight="bold" />
                <span className="text-sm font-medium text-green-600">
                  {analytics.bookingsChange}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle size={24} className="text-blue-600" weight="fill" />
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
              <p className="text-sm text-gray-600 font-medium">Avg Occupancy</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {analytics.avgOccupancy}%
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendUp size={16} className="text-green-600" weight="bold" />
                <span className="text-sm font-medium text-green-600">
                  {analytics.occupancyChange}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Bed size={24} className="text-green-600" weight="fill" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Avg Daily Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(analytics.avgDailyRate)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendDown size={16} className="text-red-600" weight="bold" />
                <span className="text-sm font-medium text-red-600">
                  {Math.abs(analytics.rateChange)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ChartBar size={24} className="text-orange-600" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setReportType("revenue")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                reportType === "revenue"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Revenue Analysis
            </button>
            <button
              onClick={() => setReportType("occupancy")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                reportType === "occupancy"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Occupancy Rate
            </button>
            <button
              onClick={() => setReportType("bookings")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                reportType === "bookings"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Booking Trends
            </button>
            <button
              onClick={() => setReportType("guests")}
              className={cn(
                "py-4 px-2 border-b-2 font-medium text-sm transition-colors",
                reportType === "guests"
                  ? "border-brown-dark text-brown-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Guest Demographics
            </button>
          </nav>
        </div>

        {/* Chart Area with Timeframe Selector */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {reportType === "revenue" && "Revenue Overview"}
              {reportType === "occupancy" && "Occupancy Trends"}
              {reportType === "bookings" && "Booking Patterns"}
              {reportType === "guests" && "Guest Sources"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeframe("week")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  timeframe === "week"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  timeframe === "month"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setTimeframe("year")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  timeframe === "year"
                    ? "bg-brown-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Year
              </button>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBar size={64} className="mx-auto text-gray-400 mb-4" weight="duotone" />
              <p className="text-gray-500">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} chart will be integrated here</p>
              <p className="text-sm text-gray-400 mt-2">Data visualization for {timeframe}ly view</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Additional Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Rooms */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top Performing Rooms</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topRooms.map((room, index) => (
                <div key={room.name} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-brown-dark text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{room.name}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(room.revenue)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{room.bookings} bookings</span>
                      <span>{room.occupancy}% occupancy</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guest Demographics */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Guest Source Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {guestDemographics.map((demo) => (
                <div key={demo.source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{demo.source}</span>
                    <span className="text-sm font-bold text-gray-900">{demo.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brown-dark h-2 rounded-full transition-all"
                      style={{ width: `${demo.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{demo.count} guests</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Monthly Performance</h2>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={data.period} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.period}
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
                          style={{ width: `${data.occupancy}%` }}
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
