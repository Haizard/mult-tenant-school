"use client";

import { useState, useEffect } from "react";
import { apiService } from "../../lib/api";
import { FaTimes, FaSave, FaSearch } from "react-icons/fa";

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentProcessed: () => void;
}

export default function PaymentProcessingModal({ isOpen, onClose, onPaymentProcessed }: PaymentProcessingModalProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    feeAssignmentId: "",
    amount: "",
    currency: "TZS",
    paymentMethod: "CASH",
    paymentType: "FULL_PAYMENT",
    transactionId: "",
    referenceNumber: "",
    paymentDate: "",
    notes: "",
    receiptNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [feeAssignments, setFeeAssignments] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.studentId) {
      fetchFeeAssignments(formData.studentId);
    }
  }, [formData.studentId]);

  const fetchStudents = async () => {
    try {
      const response = await apiService.get("/students");
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchFeeAssignments = async (studentId: string) => {
    try {
      const response = await apiService.get(`/finance/assignments?studentId=${studentId}`);
      if (response.success) {
        setFeeAssignments(response.data);
      }
    } catch (error) {
      console.error("Error fetching fee assignments:", error);
    }
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setFormData(prev => ({ ...prev, studentId: student.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.post("/finance/payments", formData);
      if (response.success) {
        onPaymentProcessed();
        onClose();
        setFormData({
          studentId: "",
          feeAssignmentId: "",
          amount: "",
          currency: "TZS",
          paymentMethod: "CASH",
          paymentType: "FULL_PAYMENT",
          transactionId: "",
          referenceNumber: "",
          paymentDate: "",
          notes: "",
          receiptNumber: "",
        });
        setSelectedStudent(null);
        setFeeAssignments([]);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Process Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student *
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e) => {
                  // Simple search implementation
                  const searchTerm = e.target.value.toLowerCase();
                  // You could implement actual search logic here
                }}
              />
            </div>
            <div className="mt-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    selectedStudent?.id === student.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {student.user.firstName} {student.user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Student ID: {student.studentId} | Class: {student.class?.className || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedStudent && (
            <>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="font-medium text-emerald-900 mb-2">Selected Student</h3>
                <p className="text-emerald-700">
                  {selectedStudent.user.firstName} {selectedStudent.user.lastName} 
                  ({selectedStudent.studentId})
                </p>
              </div>

              {/* Fee Assignment Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Assignment (Optional)
                </label>
                <select
                  value={formData.feeAssignmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, feeAssignmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select fee assignment</option>
                  {feeAssignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.fee.feeName} - TZS {assignment.finalAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TZS">TZS (Tanzanian Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="CHECK">Check</option>
                    <option value="ONLINE_PAYMENT">Online Payment</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type *
                  </label>
                  <select
                    required
                    value={formData.paymentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FULL_PAYMENT">Full Payment</option>
                    <option value="PARTIAL_PAYMENT">Partial Payment</option>
                    <option value="INSTALLMENT">Installment</option>
                    <option value="ADVANCE_PAYMENT">Advance Payment</option>
                    <option value="REFUND">Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter transaction ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter receipt number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter payment notes"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStudent}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FaSave className="mr-2" />
              )}
              {loading ? "Processing..." : "Process Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
