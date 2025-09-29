"use client";

import { useState, useEffect } from "react";
import { FaBus, FaRoute, FaCalendarAlt, FaUser, FaMoneyBillWave } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function StudentTransportPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [studentTransport, setStudentTransport] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadStudentTransport();
    }
  }, [params.id]);

  const loadStudentTransport = async () => {
    try {
      setIsLoading(true);
      // Load student transport assignment
      const transportResponse = await transportService.getStudentTransports({
        studentId: params.id
      });
      
      if (transportResponse.success && transportResponse.data.length > 0) {
        setStudentTransport(transportResponse.data[0]);
        
        // Load attendance records
        const attendanceResponse = await transportService.getAttendance({
          studentId: params.id
        });
        if (attendanceResponse.success) {
          setAttendance(attendanceResponse.data);
        }
        
        // Load fee records
        const feesResponse = await transportService.getFees({
          studentId: params.id
        });
        if (feesResponse.success) {
          setFees(feesResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading student transport:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
          <p className="text-text-secondary mt-2">Loading transport information...</p>
        </div>
      </div>
    );
  }

  if (!studentTransport) {
    return (
      <div className="space-y-6 p-6">
        <Card className="p-8 text-center">
          <FaBus className="text-6xl text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Transport Assignment</h3>
          <p className="text-text-secondary">This student is not currently assigned to any transport route.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transport Information</h1>
          <p className="text-text-secondary mt-2">
            {studentTransport.student.user.firstName} {studentTransport.student.user.lastName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Student
        </Button>
      </div>

      {/* Transport Assignment Details */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaBus className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Transport Assignment</h2>
            <p className="text-text-secondary">Current transport route and details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-text-primary mb-3">Route Information</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <FaRoute className="mr-2 text-text-secondary" />
                <span className="text-text-secondary">Route:</span>
                <span className="ml-2 font-medium">{studentTransport.route.routeName}</span>
              </div>
              <div className="flex items-center">
                <FaUser className="mr-2 text-text-secondary" />
                <span className="text-text-secondary">Pickup Point:</span>
                <span className="ml-2 font-medium">{studentTransport.pickupPoint}</span>
              </div>
              <div className="flex items-center">
                <FaUser className="mr-2 text-text-secondary" />
                <span className="text-text-secondary">Dropoff Point:</span>
                <span className="ml-2 font-medium">{studentTransport.dropoffPoint}</span>
              </div>
              {studentTransport.seatNumber && (
                <div className="flex items-center">
                  <FaUser className="mr-2 text-text-secondary" />
                  <span className="text-text-secondary">Seat Number:</span>
                  <span className="ml-2 font-medium">{studentTransport.seatNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-text-primary mb-3">Schedule & Fees</h3>
            <div className="space-y-2">
              {studentTransport.pickupTime && (
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-text-secondary" />
                  <span className="text-text-secondary">Pickup Time:</span>
                  <span className="ml-2 font-medium">{studentTransport.pickupTime}</span>
                </div>
              )}
              {studentTransport.dropoffTime && (
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-text-secondary" />
                  <span className="text-text-secondary">Dropoff Time:</span>
                  <span className="ml-2 font-medium">{studentTransport.dropoffTime}</span>
                </div>
              )}
              {studentTransport.monthlyFee && (
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-2 text-text-secondary" />
                  <span className="text-text-secondary">Monthly Fee:</span>
                  <span className="ml-2 font-medium">
                    {transportService.formatCurrency(studentTransport.monthlyFee)}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-text-secondary">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                  studentTransport.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  studentTransport.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {studentTransport.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {studentTransport.specialNotes && (
          <div className="mt-6">
            <h3 className="font-medium text-text-primary mb-2">Special Notes</h3>
            <p className="text-text-secondary">{studentTransport.specialNotes}</p>
          </div>
        )}
      </Card>

      {/* Recent Attendance */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <FaCalendarAlt className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Recent Attendance</h2>
            <p className="text-text-secondary">Last 10 transport attendance records</p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <p className="text-text-secondary text-center py-4">No attendance records found</p>
        ) : (
          <div className="space-y-3">
            {attendance.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                  <span className="text-text-secondary ml-4">
                    {record.schedule?.route?.routeName}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    record.pickupStatus === 'PRESENT' ? 'bg-green-100 text-green-800' :
                    record.pickupStatus === 'ABSENT' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Pickup: {record.pickupStatus}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    record.dropoffStatus === 'PRESENT' ? 'bg-green-100 text-green-800' :
                    record.dropoffStatus === 'ABSENT' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Dropoff: {record.dropoffStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Fee History */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-yellow-100 rounded-full">
            <FaMoneyBillWave className="text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Fee History</h2>
            <p className="text-text-secondary">Transport fee payments and outstanding amounts</p>
          </div>
        </div>

        {fees.length === 0 ? (
          <p className="text-text-secondary text-center py-4">No fee records found</p>
        ) : (
          <div className="space-y-3">
            {fees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{fee.feeType}</span>
                  <span className="text-text-secondary ml-4">
                    Due: {new Date(fee.dueDate).toLocaleDateString()}
                  </span>
                  {fee.paidDate && (
                    <span className="text-text-secondary ml-4">
                      Paid: {new Date(fee.paidDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium">
                    {transportService.formatCurrency(fee.amount)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    fee.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {fee.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
