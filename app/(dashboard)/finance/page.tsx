"use client";

import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../lib/api";
import {
  FaDollarSign,
  FaCreditCard,
  FaReceipt,
  FaChartLine,
  FaPlus,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaFileInvoice,
  FaPiggyBank,
  FaChartPie,
} from "react-icons/fa";
import { MdAccountBalance, MdTrendingUp, MdTrendingDown, MdWarning } from "react-icons/md";
import FeeManagementModal from "../../components/finance/FeeManagementModal";
import PaymentProcessingModal from "../../components/finance/PaymentProcessingModal";
import ExpenseManagementModal from "../../components/finance/ExpenseManagementModal";
import BudgetManagementModal from "../../components/finance/BudgetManagementModal";

// Interfaces
interface FinanceStats {
  totalFeesCollected: number;
  totalFeesCount: number;
  monthlyPayments: number;
  monthlyPaymentsCount: number;
  outstandingFees: number;
  outstandingFeesCount: number;
  totalExpenses: number;
  totalExpensesCount: number;
  totalBudgets: number;
  totalBudgetsCount: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    student: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
    feeAssignment: {
      fee: {
        feeName: string;
      };
    };
  }>;
  upcomingDueDates: Array<{
    id: string;
    finalAmount: number;
    dueDate: string;
    student: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
    fee: {
      feeName: string;
    };
  }>;
  expenseBreakdown: Array<{
    expenseCategory: string;
    _sum: { amount: number };
    _count: number;
  }>;
  paymentMethods: Array<{
    paymentMethod: string;
    _sum: { amount: number };
    _count: number;
  }>;
}

interface Fee {
  id: string;
  feeName: string;
  feeType: string;
  amount: number;
  currency: string;
  frequency: string;
  isActive: boolean;
  createdAt: string;
  assignments: any[];
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  feeAssignment: {
    fee: {
      feeName: string;
    };
  };
}

// Main Component
export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Data Fetching Callbacks
  const fetchFinanceStats = useCallback(async () => {
    try {
      const response = await apiService.get("/finance/stats");
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching finance stats:", error);
    }
  }, []);

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { type: filterStatus }),
      });

      const response = await apiService.get(`/finance?${params.toString()}`);
      if (response.success) {
        setFees(response.data);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching fees:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await apiService.get(`/finance/payments?${params.toString()}`);
      if (response.success) {
        setPayments(response.data);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchFinanceStats();
    if (activeTab === "fees") {
      fetchFees();
    } else if (activeTab === "payments") {
      fetchPayments();
    }
  }, [fetchFinanceStats, fetchFees, fetchPayments, activeTab]);

  // Event Handlers
  const handleDataUpdated = () => {
    fetchFinanceStats();
    if (activeTab === "fees") {
      fetchFees();
    } else if (activeTab === "payments") {
      fetchPayments();
    }
  };

  // Mooney-Style Stat Card Component
  const StatCard = ({ icon, title, value, subtitle, color, trend, trendValue }: any) => (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color === 'text-emerald-600' ? 'bg-emerald-100' : color === 'text-blue-600' ? 'bg-blue-100' : color === 'text-red-600' ? 'bg-red-100' : 'bg-orange-100'}`}>
          <div className={`text-xl ${color}`}>{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <MdTrendingUp className="mr-1" /> : <MdTrendingDown className="mr-1" />}
            {trendValue}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  // Mooney-Style Payment Card Component
  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {payment.student.user.firstName.charAt(0)}{payment.student.user.lastName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {payment.student.user.firstName} {payment.student.user.lastName}
          </h3>
          <p className="text-sm text-gray-600 truncate">{payment.feeAssignment.fee.feeName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          payment.status === "COMPLETED" ? "bg-green-100 text-green-800" : 
          payment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : 
          "bg-red-100 text-red-800"
        }`}>
          {payment.status}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-gray-900">TZS {payment.amount.toLocaleString()}</div>
        <div className="text-sm text-gray-500">
          {new Date(payment.paymentDate).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <FaCreditCard className="mr-2" />
          {payment.paymentMethod}
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );

  // Mooney-Style Fee Card Component
  const FeeCard = ({ fee }: { fee: Fee }) => (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2 text-lg">{fee.feeName}</h3>
          <div className="flex items-center space-x-3 mb-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{fee.feeType}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{fee.frequency}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${fee.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {fee.isActive ? "ACTIVE" : "INACTIVE"}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-1">TZS {fee.amount.toLocaleString()}</div>
        <div className="text-sm text-gray-500">Fee Amount</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div className="text-2xl font-bold text-blue-800 mb-1">{fee.assignments?.length || 0}</div>
          <div className="text-xs text-blue-600 font-medium">Assignments</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
          <div className="text-2xl font-bold text-green-800 mb-1">{fee.isActive ? "Active" : "Inactive"}</div>
          <div className="text-xs text-green-600 font-medium">Status</div>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium">
          Edit Fee
        </button>
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium">
          Assign
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="p-6 lg:p-8">
        {/* Header with Mooney-inspired design */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Comprehensive financial overview and management</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Avatar like in Mooney */}
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">John Doe</div>
                  <div className="text-xs text-gray-500">Finance Manager</div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-2">
                <button onClick={() => setIsFeeModalOpen(true)} className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <FaPlus className="text-sm" />
                </button>
                <button onClick={() => setIsPaymentModalOpen(true)} className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <FaCreditCard className="text-sm" />
                </button>
                <button className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <FaDownload className="text-sm" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Simplified Navigation like Mooney sidebar */}
          <div className="flex space-x-2 bg-white/60 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-lg">
            {[
              { id: "overview", name: "Dashboard", icon: FaChartPie },
              { id: "fees", name: "Fees", icon: FaMoneyBillWave },
              { id: "payments", name: "Payments", icon: FaCreditCard },
              { id: "reports", name: "Reports", icon: FaChartLine },
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg" 
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {stats && (
              <>
                {/* Main Dashboard Layout - Mooney Style */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column - Main Balance Card */}
                  <div className="lg:col-span-1">
                    {/* Primary Balance Card - Mooney Style */}
                    <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] mb-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-purple-100 text-sm font-medium mb-2">School Balance</p>
                          <h2 className="text-4xl font-bold mb-1">
                            TZS {stats.totalFeesCollected.toLocaleString()}
                          </h2>
                          <p className="text-purple-200 text-sm">•••• •••• •••• 6562</p>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-200 text-xs mb-1">02/25</div>
                          <div className="text-white font-semibold text-sm">School Account</div>
                        </div>
                      </div>
                      
                      {/* Card chip simulation */}
                      <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-md mb-4 opacity-80"></div>
                    </div>

                    {/* Exchange Rates Card - Mooney Style */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Exchange Rates</h3>
                        <div className="text-sm text-gray-500">USD → TZS</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Current Rate</span>
                          <span className="font-semibold">2,350 TZS</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">24h Change</span>
                          <span className="text-green-600 text-sm">+1.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Charts and Stats */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Top Statistics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-green-100 rounded-xl">
                            <FaChartLine className="text-green-600 text-xl" />
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-green-600">
                              <MdTrendingUp className="mr-1" />
                              +12%
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Monthly Income</p>
                          <h3 className="text-2xl font-bold text-gray-900">TZS {stats.monthlyPayments.toLocaleString()}</h3>
                          <p className="text-gray-500 text-sm">{stats.monthlyPaymentsCount} transactions</p>
                        </div>
                      </div>

                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-red-100 rounded-xl">
                            <FaExclamationTriangle className="text-red-600 text-xl" />
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-red-600">
                              <MdTrendingDown className="mr-1" />
                              -5%
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Outstanding</p>
                          <h3 className="text-2xl font-bold text-gray-900">TZS {stats.outstandingFees.toLocaleString()}</h3>
                          <p className="text-gray-500 text-sm">{stats.outstandingFeesCount} pending</p>
                        </div>
                      </div>

                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-orange-100 rounded-xl">
                            <FaReceipt className="text-orange-600 text-xl" />
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-orange-600">
                              <MdTrendingUp className="mr-1" />
                              +3%
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Expenses</p>
                          <h3 className="text-2xl font-bold text-gray-900">TZS {stats.totalExpenses.toLocaleString()}</h3>
                          <p className="text-gray-500 text-sm">{stats.totalExpensesCount} transactions</p>
                        </div>
                      </div>
                    </div>

                    {/* Charts Section - Mooney Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* History Chart */}
                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-gray-900">History</h3>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="h-32 flex items-end justify-between space-x-2">
                          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg flex-1"
                              style={{ height: `${height}%` }}
                            ></div>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-between text-xs text-gray-500">
                          <span>Jan</span>
                          <span>Dec</span>
                        </div>
                      </div>

                      {/* Efficiency Chart */}
                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-gray-900">Efficiency</h3>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-center h-32">
                          <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#E5E7EB"
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray="251.2"
                                strokeDashoffset="75.36"
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#8B5CF6" />
                                  <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-gray-900">70%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-4">
                          <div className="text-sm text-gray-600">Collection Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Recent Transactions - Mooney Style */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Recent Transactions List */}
                    <div className="lg:col-span-2">
                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Recent Transaction</h3>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-4">
                          {stats.recentPayments.slice(0, 4).map((payment, index) => (
                            <div key={payment.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {payment.student.user.firstName.charAt(0)}{payment.student.user.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {payment.student.user.firstName} {payment.student.user.lastName}
                                </div>
                                <div className="text-sm text-gray-500 truncate">{payment.feeAssignment.fee.feeName}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-gray-900">TZS {payment.amount.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar - Quick Actions & Reports */}
                    <div className="space-y-6">
                      {/* User Profile Card - Mooney Style */}
                      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">JK</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">Jonas Kenwald</h3>
                          <p className="text-sm text-gray-500 mb-4">Finance Manager</p>
                          
                          {/* Quick Action Buttons */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <button className="p-3 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors">
                              <FaCreditCard className="text-blue-600 mx-auto" />
                            </button>
                            <button className="p-3 bg-purple-100 rounded-xl hover:bg-purple-200 transition-colors">
                              <FaChartLine className="text-purple-600 mx-auto" />
                            </button>
                            <button className="p-3 bg-green-100 rounded-xl hover:bg-green-200 transition-colors">
                              <FaDownload className="text-green-600 mx-auto" />
                            </button>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">This Pay</span>
                              <span className="font-semibold">TZS 2.5M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">This Exp</span>
                              <span className="font-semibold">TZS 1.2M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Send</span>
                              <span className="font-semibold">TZS 500K</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Request</span>
                              <span className="font-semibold">TZS 800K</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Annual Report - Mooney Style */}
                      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                            <FaChartLine className="text-white text-xl" />
                          </div>
                          <h3 className="font-semibold mb-2">Annual Report</h3>
                          <p className="text-purple-100 text-sm mb-4">
                            Download your comprehensive financial report
                          </p>
                        </div>
                        <button className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === "fees" && (
          <div className="space-y-8">
            {/* Search and Filter Section - Mooney Style */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input 
                    type="text" 
                    placeholder="Search fees by name or description..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 bg-white/50 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium" 
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    className="px-6 py-4 bg-white/50 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm text-gray-900 font-medium min-w-[150px]"
                  >
                    <option value="">All Types</option>
                    <option value="TUITION">Tuition</option>
                    <option value="ADMISSION">Admission</option>
                    <option value="EXAMINATION">Examination</option>
                    <option value="EXTRACURRICULAR">Extracurricular</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="HOSTEL">Hostel</option>
                  </select>
                  <button className="flex items-center px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-medium">
                    <FaFilter className="mr-2" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 animate-spin">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading fees...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {fees.map((fee) => (
                    <FeeCard key={fee.id} fee={fee} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-12">
                    <button 
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                      disabled={currentPage === 1} 
                      className="px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 disabled:opacity-50 hover:bg-white transition-all duration-300 font-medium shadow-lg"
                    >
                      Previous
                    </button>
                    <span className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
                      disabled={currentPage === totalPages} 
                      className="px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 disabled:opacity-50 hover:bg-white transition-all duration-300 font-medium shadow-lg"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-8">
            {/* Search and Filter Section - Mooney Style */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input 
                    type="text" 
                    placeholder="Search payments by student name or reference..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-6 py-4 bg-white/50 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium" 
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    className="px-6 py-4 bg-white/50 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm text-gray-900 font-medium min-w-[150px]"
                  >
                    <option value="">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button className="flex items-center px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-medium">
                    <FaFilter className="mr-2" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 animate-spin">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading payments...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {payments.map((payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-12">
                    <button 
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                      disabled={currentPage === 1} 
                      className="px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 disabled:opacity-50 hover:bg-white transition-all duration-300 font-medium shadow-lg"
                    >
                      Previous
                    </button>
                    <span className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
                      disabled={currentPage === totalPages} 
                      className="px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 disabled:opacity-50 hover:bg-white transition-all duration-300 font-medium shadow-lg"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Reports Tab - Mooney Style */}
        {activeTab === "reports" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaChartLine className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Financial Reports</h3>
              <p className="text-gray-600 mb-8">Generate comprehensive financial reports with advanced analytics and insights.</p>
              <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-medium">
                Generate Report
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 border border-white/20 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaDownload className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Export Data</h3>
              <p className="text-gray-600 mb-8">Export financial data in various formats including PDF, Excel, and CSV for external analysis.</p>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-medium">
                Export Data
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <FeeManagementModal 
          isOpen={isFeeModalOpen} 
          onClose={() => setIsFeeModalOpen(false)} 
          onFeeAdded={handleDataUpdated} 
        />
        <PaymentProcessingModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          onPaymentProcessed={handleDataUpdated} 
        />
        <ExpenseManagementModal 
          isOpen={isExpenseModalOpen} 
          onClose={() => setIsExpenseModalOpen(false)} 
          onExpenseAdded={handleDataUpdated} 
        />
        <BudgetManagementModal 
          isOpen={isBudgetModalOpen} 
          onClose={() => setIsBudgetModalOpen(false)} 
          onBudgetAdded={handleDataUpdated} 
        />
      </div>
    </div>
  );
}
