'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  GraduationCap,
  Users
} from 'lucide-react';
import { teacherService, Teacher, UpdateTeacherData } from '@/lib/teacherService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState<UpdateTeacherData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    qualification: '',
    experience: 0,
    specialization: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelation: '',
    joiningDate: '',
    previousSchool: '',
    teachingLicense: '',
    licenseExpiry: ''
  });

  useEffect(() => {
    if (params.id) {
      loadTeacher(params.id as string);
    }
  }, [params.id]);

  const loadTeacher = async (id: string) => {
    try {
      setLoading(true);
      const data = await teacherService.getTeacher(id);
      setTeacher(data);
      
      // Populate form with existing data
      setFormData({
        id: data.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone || '',
        employeeNumber: data.employeeNumber || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        gender: data.gender,
        nationality: data.nationality || '',
        qualification: data.qualification || '',
        experience: data.experience || 0,
        specialization: data.specialization || '',
        address: data.address || '',
        city: data.city || '',
        region: data.region || '',
        postalCode: data.postalCode || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        emergencyRelation: data.emergencyRelation || '',
        joiningDate: data.joiningDate ? data.joiningDate.split('T')[0] : '',
        previousSchool: data.previousSchool || '',
        teachingLicense: data.teachingLicense || '',
        licenseExpiry: data.licenseExpiry ? data.licenseExpiry.split('T')[0] : ''
      });
    } catch (error: any) {
      console.error('Error loading teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load teacher',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await teacherService.updateTeacher(formData.id, formData);
      
      toast({
        title: 'Success',
        description: 'Teacher updated successfully'
      });
      
      router.push(`/teachers/${formData.id}`);
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update teacher',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teacher not found</h3>
          <Link href="/teachers">
            <Button variant="primary">Back to Teachers</Button>
          </Link>
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
              <Link href={`/teachers/${teacher.id}`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {teacher.user.firstName[0]}{teacher.user.lastName[0]}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
                <p className="text-sm text-gray-500">
                  {teacher.user.firstName} {teacher.user.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/teachers/${teacher.id}`}>
                <Button variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" form="edit-teacher-form" disabled={saving} size="sm">
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
                  onClick={() => setActiveSection('contact')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeSection === 'contact'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="h-4 w-4 mr-3" />
                  Contact Details
                </button>
                <button
                  onClick={() => setActiveSection('professional')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeSection === 'professional'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 mr-3" />
                  Professional
                </button>
                <button
                  onClick={() => setActiveSection('emergency')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeSection === 'emergency'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Phone className="h-4 w-4 mr-3" />
                  Emergency Contact
                </button>
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">

            <form id="edit-teacher-form" onSubmit={handleSubmit} className="space-y-8">
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
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-11"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-11"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nationality
                      </label>
                      <Input
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Employee Number
                      </label>
                      <Input
                        name="employeeNumber"
                        value={formData.employeeNumber}
                        onChange={handleInputChange}
                        className="h-11"
                      />
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
                    <Mail className="h-5 w-5 mr-2 text-green-500" />
                    Contact Information
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Communication details and address information</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-11"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Region
                      </label>
                      <Input
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
                </section>
              )}

              {/* Professional Information */}
              {activeSection === 'professional' && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-purple-500" />
                    Professional Information
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Educational background and teaching credentials</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Highest Qualification
                      </label>
                      <Input
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="e.g., Bachelor's in Education"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <Input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="h-11"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specialization
                      </label>
                      <Input
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="e.g., Mathematics, Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Joining Date
                      </label>
                      <Input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Previous School
                      </label>
                      <Input
                        name="previousSchool"
                        value={formData.previousSchool}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teaching License
                      </label>
                      <Input
                        name="teachingLicense"
                        value={formData.teachingLicense}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        License Expiry
                      </label>
                      <Input
                        type="date"
                        name="licenseExpiry"
                        value={formData.licenseExpiry}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
                </section>
              )}

              {/* Emergency Contact */}
              {activeSection === 'emergency' && (
                <section className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-red-500" />
                    Emergency Contact
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Person to contact in case of emergency</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <Input
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Relationship
                      </label>
                      <Input
                        name="emergencyRelation"
                        value={formData.emergencyRelation}
                        onChange={handleInputChange}
                        className="h-11"
                        placeholder="e.g., Spouse, Parent"
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