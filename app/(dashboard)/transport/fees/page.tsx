"use client";

import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaPlus, FaSearch, FaFilter, FaUser, FaRoute } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function TransportFeesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getFees();
      if (response.success) {
        setFees(response.data);
      }
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.student?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.student?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.route?.routeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transport Fees</h1>
          <p className="text-text-secondary mt-2">Manage transport fees and payments</p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          variant="primary"
          onClick={() => router.push("/transport/fees/create")}
        >
          <FaPlus className="mr-2" />
          Add Fee
        </RoleBasedButton>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search fees..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Fees List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
            <p className="text-text-secondary mt-2">Loading fees...</p>
          </div>
        ) : filteredFees.length === 0 ? (
          <Card className="p-8 text-center">
            <FaMoneyBillWave className="text-6xl text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No fees found</h3>
            <p className="text-text-secondary">No transport fees have been created yet.</p>
          </Card>
        ) : (
          filteredFees.map((fee) => (
            <Card key={fee.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaMoneyBillWave className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {fee.student?.user?.firstName} {fee.student?.user?.lastName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                      <div className="flex items-center">
                        <FaRoute className="mr-1" />
                        {fee.route?.routeName}
                      </div>
                      <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                      {fee.paidDate && (
                        <span>Paid: {new Date(fee.paidDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">
                      {transportService.formatCurrency(fee.amount)}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fee.status)}`}>
                      {fee.status}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transport/fees/${fee.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
