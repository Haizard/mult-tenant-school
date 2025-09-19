'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User, MapPin, GraduationCap, Heart, AlertCircle } from 'lucide-react';
import { studentService } from '@/lib/studentService';
import { format } from 'date-fns';
import Link from 'next/link';

interface Student {
  id: string;
  tenantId: string;
  userId: string;
  studentId: string;
  admissionNumber?: string;
  admissionDate?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationality: string;
  religion?: string;
  bloodGroup?: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  phone?: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation?: string;
  medicalInfo?: string;
  previousSchool?: string;
  previousGrade?: string;
  transportMode?: string;
  transportRoute?: string;
  specialNeeds?: string;
  hobbies?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'TRANSFERRED' | 'DROPPED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
  };
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    admissionNumber: '',
    admissionDate: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    religion: '',
    bloodGroup: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelation: '',
    medicalInfo: '',
    previousSchool: '',
    previousGrade: '',
    transportMode: '',
    transportRoute: '',
    specialNeeds: '',
    hobbies: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const data = await studentService.getStudent(studentId);
      setStudent(data);
      
      // Populate form data
      setFormData({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        studentId: data.studentId || '',
        admissionNumber: data.admissionNumber || '',
        admissionDate: data.admissionDate ? format(new Date(data.admissionDate), 'yyyy-MM-dd') : '',
        dateOfBirth: data.dateOfBirth ? format(new Date(data.dateOfBirth), 'yyyy-MM-dd') : '',
        gender: data.gender || '',
        nationality: data.nationality || '',
        religion: data.religion || '',
        bloodGroup: data.bloodGroup || '',
        address: data.address || '',
        city: data.city || '',
        region: data.region || '',
        postalCode: data.postalCode || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        emergencyRelation: data.emergencyRelation || '',
        medicalInfo: data.medicalInfo || '',
        previousSchool: data.previousSchool || '',
        previousGrade: data.previousGrade || '',
        transportMode: data.transportMode || '',
        transportRoute: data.transportRoute || '',
        specialNeeds: data.specialNeeds || '',
        hobbies: data.hobbies || '',
        status: data.status || 'ACTIVE'
      });
    } catch (error) {
      console.error('Error loading student:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.studentId || !formData.dateOfBirth || !formData.gender) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      await studentService.updateStudent(studentId, formData);
      toast({
        title: 'Success',
        description: 'Student updated successfully'
      });
      router.push(`/students/${studentId}`);
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update student',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Student not found</p>
          <Button 
            onClick={() => router.push('/students')}
            className="mt-4"
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/students/${studentId}`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {student.user.firstName[0]}{student.user.lastName[0]}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
                <p className="text-sm text-gray-500">
                  {student.user.firstName} {student.user.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/students/${studentId}`}>
                <Button variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" form="edit-student-form" disabled={saving} size="sm">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Settings</h3>
              <nav className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('personal')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeSection === 'personal'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4 mr-3" />
                  Personal Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('contact')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeSection === 'contact'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-3" />
                  Contact & Address
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('academic')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeSection === 'academic'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 mr-3" />
                  Academic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('additional')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeSection === 'additional'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="h-4 w-4 mr-3" />
                  Additional Info
                </button>
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-indigo-500" />
                      Personal Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Basic personal details and identification</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Birth *
                        </label>
                        <Input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nationality
                        </label>
                        <Input
                          value={formData.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Religion
                        </label>
                        <Input
                          value={formData.religion}
                          onChange={(e) => handleInputChange('religion', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Blood Group
                        </label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="GRADUATED">Graduated</option>
                          <option value="TRANSFERRED">Transferred</option>
                          <option value="DROPPED">Dropped</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Contact Information */}
              {activeSection === 'contact' && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-green-500" />
                      Contact & Address Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Address and emergency contact details</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address
                        </label>
                        <Input
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Region
                        </label>
                        <Input
                          value={formData.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <Input
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="p-2 rounded-lg bg-red-100">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <h4 className="text-md font-semibold text-gray-900">Emergency Contact</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Name
                          </label>
                          <Input
                            value={formData.emergencyContact}
                            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <Input
                            value={formData.emergencyPhone}
                            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                            className="h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Relationship
                          </label>
                          <Input
                            value={formData.emergencyRelation}
                            onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                            className="h-11"
                            placeholder="e.g., Parent, Guardian"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Academic Information */}
              {activeSection === 'academic' && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-purple-500" />
                      Academic Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Educational background and school details</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Student ID *
                        </label>
                        <Input
                          value={formData.studentId}
                          onChange={(e) => handleInputChange('studentId', e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Admission Number
                        </label>
                        <Input
                          value={formData.admissionNumber}
                          onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Admission Date
                        </label>
                        <Input
                          type="date"
                          value={formData.admissionDate}
                          onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Previous School
                        </label>
                        <Input
                          value={formData.previousSchool}
                          onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Previous Grade
                        </label>
                        <Input
                          value={formData.previousGrade}
                          onChange={(e) => handleInputChange('previousGrade', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Transport Mode
                        </label>
                        <select
                          value={formData.transportMode}
                          onChange={(e) => handleInputChange('transportMode', e.target.value)}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select Transport Mode</option>
                          <option value="BUS">School Bus</option>
                          <option value="WALKING">Walking</option>
                          <option value="PRIVATE">Private Vehicle</option>
                          <option value="PUBLIC">Public Transport</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Transport Route
                        </label>
                        <Input
                          value={formData.transportRoute}
                          onChange={(e) => handleInputChange('transportRoute', e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Additional Information */}
              {activeSection === 'additional' && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-pink-500" />
                      Additional Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Medical information and personal interests</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Medical Information
                        </label>
                        <Textarea
                          value={formData.medicalInfo}
                          onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                          placeholder="Any medical conditions, allergies, or special requirements..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Special Needs
                        </label>
                        <Textarea
                          value={formData.specialNeeds}
                          onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                          placeholder="Any special educational or physical needs..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hobbies & Interests
                        </label>
                        <Textarea
                          value={formData.hobbies}
                          onChange={(e) => handleInputChange('hobbies', e.target.value)}
                          placeholder="Student's hobbies, interests, and extracurricular activities..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}