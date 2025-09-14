'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, 
  ArrowRight,
  Save, 
  User, 
  Phone, 
  MapPin, 
  GraduationCap,
  Heart,
  AlertCircle,
  Mail,
  Calendar,
  Shield,
  FileText,
  Users,
  Home,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Sparkles
} from 'lucide-react';
import { studentService } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId: string;
  admissionNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  nationality: string;
  religion: string;
  bloodGroup: string;
  
  // Address Information
  address: string;
  city: string;
  region: string;
  postalCode: string;
  
  // Emergency Contact
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation: string;
  
  // Academic Information
  admissionDate: string;
  previousSchool: string;
  previousGrade: string;
  
  // Additional Information
  medicalInfo: string;
  transportMode: string;
  transportRoute: string;
  specialNeeds: string;
  hobbies: string;
}

const steps = [
  {
    id: 1,
    title: 'Personal Details',
    description: 'Basic student information',
    icon: User,
    color: 'from-accent-purple to-accent-purple-light'
  },
  {
    id: 2,
    title: 'Contact & Address',
    description: 'Location and contact details',
    icon: Home,
    color: 'from-accent-blue to-accent-blue-light'
  },
  {
    id: 3,
    title: 'Emergency Contact',
    description: 'Emergency contact information',
    icon: Shield,
    color: 'from-accent-green to-accent-green-light'
  },
  {
    id: 4,
    title: 'Academic Background',
    description: 'Previous education details',
    icon: BookOpen,
    color: 'from-status-warning to-yellow-400'
  },
  {
    id: 5,
    title: 'Additional Info',
    description: 'Medical and other details',
    icon: Heart,
    color: 'from-status-danger to-red-400'
  }
];

export default function NewStudentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    admissionNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Tanzanian',
    religion: '',
    bloodGroup: '',
    
    // Address Information
    address: '',
    city: '',
    region: '',
    postalCode: '',
    
    // Emergency Contact
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelation: '',
    
    // Academic Information
    admissionDate: '',
    previousSchool: '',
    previousGrade: '',
    
    // Additional Information
    medicalInfo: '',
    transportMode: '',
    transportRoute: '',
    specialNeeds: '',
    hobbies: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // This would typically load users who don't have student profiles yet
      // For now, we'll use a placeholder
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && 
                 formData.studentId && formData.dateOfBirth && formData.gender);
      case 2:
        return !!(formData.address && formData.city && formData.region);
      case 3:
        return !!(formData.emergencyContact && formData.emergencyPhone && formData.emergencyRelation);
      case 4:
        return !!(formData.admissionDate);
      case 5:
        return true; // Optional information
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields before proceeding',
        variant: 'destructive'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create the user first (in a real app, this might be a separate step)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };

      // Then create the student with all the form data
      const studentData = {
        ...formData,
        gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER'
      };

      await studentService.createStudent(studentData);
      
      toast({
        title: 'Success! 🎉',
        description: 'Student registered successfully',
      });
      
      router.push('/students');
    } catch (error: any) {
      console.error('Error creating student:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create student',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
            <p className="text-muted-foreground">
              Create a new student profile with personal and academic information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Basic personal details of the student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="e.g., STU001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admissionNumber">Admission Number</Label>
                  <Input
                    id="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
                    placeholder="e.g., ADM2024001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admissionDate">Admission Date</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="e.g., Tanzanian"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    placeholder="e.g., Christian, Muslim"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
              <CardDescription>
                Address and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g., Dar es Salaam"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    placeholder="e.g., Dar es Salaam"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="e.g., 11101"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g., +255 123 456 789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Emergency Contact</span>
              </CardTitle>
              <CardDescription>
                Emergency contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone Number *</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="e.g., +255 123 456 789"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Academic Information</span>
              </CardTitle>
              <CardDescription>
                Previous academic background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="previousSchool">Previous School</Label>
                <Input
                  id="previousSchool"
                  value={formData.previousSchool}
                  onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                  placeholder="e.g., ABC Primary School"
                />
              </div>
              <div>
                <Label htmlFor="previousGrade">Previous Grade/Class</Label>
                <Input
                  id="previousGrade"
                  value={formData.previousGrade}
                  onChange={(e) => handleInputChange('previousGrade', e.target.value)}
                  placeholder="e.g., Grade 6"
                />
              </div>
            </CardContent>
          </Card>

          {/* Transport Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Transport Information</span>
              </CardTitle>
              <CardDescription>
                Transportation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transportMode">Transport Mode</Label>
                <Select
                  value={formData.transportMode}
                  onChange={(e) => handleInputChange('transportMode', e.target.value)}
                >
                  <option value="">Select transport mode</option>
                  <option value="BUS">School Bus</option>
                  <option value="WALKING">Walking</option>
                  <option value="PRIVATE">Private Vehicle</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="transportRoute">Transport Route</Label>
                <Input
                  id="transportRoute"
                  value={formData.transportRoute}
                  onChange={(e) => handleInputChange('transportRoute', e.target.value)}
                  placeholder="e.g., Route A, Kimara"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Medical Information</span>
              </CardTitle>
              <CardDescription>
                Health conditions and medical notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="medicalInfo">Medical Information</Label>
                <Textarea
                  id="medicalInfo"
                  value={formData.medicalInfo}
                  onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                  placeholder="Any medical conditions, allergies, or special requirements..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/students">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Student
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}




