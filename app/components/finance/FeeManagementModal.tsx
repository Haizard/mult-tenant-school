"use client";

import { useState, useEffect } from "react";
import { apiService } from "../../lib/api";
import { FaTimes, FaSave, FaPlus } from "react-icons/fa";

interface FeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeeAdded: () => void;
}

export default function FeeManagementModal({ isOpen, onClose, onFeeAdded }: FeeManagementModalProps) {
  const [formData, setFormData] = useState({
    feeName: "",
    feeType: "TUITION",
    amount: "",
    currency: "TZS",
    frequency: "ONE_TIME",
    applicableLevels: [] as string[],
    applicableClasses: [] as string[],
    description: "",
    effectiveDate: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  const fetchClasses = async () => {
    try {
      const response = await apiService.get("/classes");
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.post("/finance", formData);
      if (response.success) {
        onFeeAdded();
        onClose();
        setFormData({
          feeName: "",
          feeType: "TUITION",
          amount: "",
          currency: "TZS",
          frequency: "ONE_TIME",
          applicableLevels: [],
          applicableClasses: [],
          description: "",
          effectiveDate: "",
          expiryDate: "",
        });
      }
    } catch (error) {
      console.error("Error creating fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (level: string) => {
    setFormData(prev => ({
      ...prev,
      applicableLevels: prev.applicableLevels.includes(level)
        ? prev.applicableLevels.filter(l => l !== level)
        : [...prev.applicableLevels, level]
    }));
  };

  const handleClassChange = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableClasses: prev.applicableClasses.includes(classId)
        ? prev.applicableClasses.filter(c => c !== classId)
        : [...prev.applicableClasses, classId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        <div className="p-8 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Add New Fee
              </h2>
              <p className="text-gray-600">Create a new fee structure for your school</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-red-100 rounded-2xl transition-all duration-300 group"
            >
              <FaTimes className="text-gray-400 group-hover:text-red-500 text-lg" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <FaPlus className="text-white text-sm" />
              </div>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Fee Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.feeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, feeName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium transition-all duration-300"
                  placeholder="Enter fee name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Fee Type *
                </label>
                <select
                  required
                  value={formData.feeType}
                  onChange={(e) => setFormData(prev => ({ ...prev, feeType: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 font-medium transition-all duration-300"
                >
                  <option value="TUITION">Tuition</option>
                  <option value="ADMISSION">Admission</option>
                  <option value="EXAMINATION">Examination</option>
                  <option value="EXTRACURRICULAR">Extracurricular</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="HOSTEL">Hostel</option>
                  <option value="LIBRARY">Library</option>
                  <option value="LABORATORY">Laboratory</option>
                  <option value="SPORTS">Sports</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium transition-all duration-300"
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 font-medium transition-all duration-300"
                >
                  <option value="TZS">TZS (Tanzanian Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Frequency *
                </label>
                <select
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 font-medium transition-all duration-300"
                >
                  <option value="ONE_TIME">One Time</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="SEMESTERLY">Semesterly</option>
                  <option value="ANNUALLY">Annually</option>
                  <option value="TERM_WISE">Term Wise</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 font-medium transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Applicability Section */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">📚</span>
              </div>
              Fee Applicability
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Applicable Academic Levels
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["PRIMARY", "O_LEVEL", "A_LEVEL", "UNIVERSITY"].map((level) => (
                    <label key={level} className="flex items-center p-3 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applicableLevels.includes(level)}
                        onChange={() => handleLevelChange(level)}
                        className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{level.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Applicable Classes
                </label>
                <div className="max-h-40 overflow-y-auto bg-white/60 border border-white/40 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {classes.map((cls) => (
                      <label key={cls.id} className="flex items-center p-2 hover:bg-white/60 rounded-lg transition-all duration-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.applicableClasses.includes(cls.id)}
                          onChange={() => handleClassChange(cls.id)}
                          className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{cls.className}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">📝</span>
              </div>
              Additional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium transition-all duration-300 resize-none"
                  placeholder="Enter a detailed description of this fee..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-gray-900 font-medium transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-white/60 border border-white/40 text-gray-700 rounded-2xl hover:bg-white/80 transition-all duration-300 font-medium backdrop-blur-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center font-medium min-w-[160px]"
            >
              {loading ? (
                <>
                  <div className="inline-flex items-center justify-center w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaSave className="mr-3" />
                  Create Fee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
