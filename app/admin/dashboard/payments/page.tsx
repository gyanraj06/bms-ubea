"use client";

import { useState } from "react";
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
  const [timeframe, setTimeframe] = useState("month");

  // Mock data
  const stats = {
    totalRevenue: 456000,
    revenueChange: 15.3,
    pendingPayments: 45000,
    pendingChange: -8.2,
    completedTransactions: 142,
    transactionsChange: 12.5,
    refunds: 8500,
    refundsChange: 3.1,
  };

  const transactions: Transaction[] = [
    {
      id: "TXN001",
      bookingId: "BK001",
      guestName: "Rajesh Kumar",
      amount: 12000,
      type: "payment",
      method: "card",
      status: "completed",
      date: "2025-11-13",
      gst: 1440,
    },
    {
      id: "TXN002",
      bookingId: "BK002",
      guestName: "Priya Sharma",
      amount: 25000,
      type: "payment",
      method: "upi",
      status: "pending",
      date: "2025-11-12",
      gst: 3000,
    },
    {
      id: "TXN003",
      bookingId: "BK003",
      guestName: "Amit Patel",
      amount: 8000,
      type: "payment",
      method: "cash",
      status: "completed",
      date: "2025-11-14",
      gst: 960,
    },
    {
      id: "TXN004",
      bookingId: "BK005",
      guestName: "Sneha Reddy",
      amount: 5000,
      type: "refund",
      method: "bank_transfer",
      status: "completed",
      date: "2025-11-11",
      gst: 600,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard size={20} weight="fill" />;
      case "upi":
        return <Money size={20} weight="fill" />;
      case "cash":
        return <Money size={20} weight="fill" />;
      case "bank_transfer":
        return <Bank size={20} weight="fill" />;
      default:
        return <CurrencyCircleDollar size={20} weight="fill" />;
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
          <Button variant="outline" className="border-gray-300">
            <Receipt size={20} className="mr-2" />
            Generate Invoice
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Download size={20} className="mr-2" />
            Export Report
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
              <div className="flex items-center gap-1 mt-2">
                <TrendUp size={16} className="text-green-600" weight="bold" />
                <span className="text-sm font-medium text-green-600">
                  {stats.revenueChange}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
              <p className="text-sm text-gray-600 font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.pendingPayments)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendDown size={16} className="text-red-600" weight="bold" />
                <span className="text-sm font-medium text-red-600">
                  {Math.abs(stats.pendingChange)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
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
              <div className="flex items-center gap-1 mt-2">
                <TrendUp size={16} className="text-green-600" weight="bold" />
                <span className="text-sm font-medium text-green-600">
                  {stats.transactionsChange}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" weight="fill" />
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
              <p className="text-sm text-gray-600 font-medium">Refunds</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.refunds)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendUp size={16} className="text-red-600" weight="bold" />
                <span className="text-sm font-medium text-red-600">
                  {stats.refundsChange}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle size={24} className="text-red-600" weight="fill" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
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
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Revenue chart will be integrated here</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST (12%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {txn.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {txn.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {txn.guestName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize",
                        txn.type === "payment"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(txn.method)}
                      <span className="text-sm text-gray-900 capitalize">
                        {txn.method.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(txn.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(txn.gst)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize",
                        getStatusColor(txn.status)
                      )}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(new Date(txn.date))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GST Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total GST Collected</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(54720)}</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Amount (Incl. GST)</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(510720)}</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Net Amount</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(456000)}</p>
          <p className="text-sm text-gray-500 mt-1">Excluding GST</p>
        </div>
      </div>
    </div>
  );
}
