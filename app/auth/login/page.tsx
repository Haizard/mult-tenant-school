'use client';

import { useState } from 'react';
import { FaSignInAlt, FaEye, FaEyeSlash, FaGraduationCap, FaLock, FaUser } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../lib/notifications';
import { errorHandler } from '../../lib/errorHandler';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof LoginErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      
      notificationService.success('Login successful! Welcome back.');
      
      // Redirect to dashboard
      window.location.href = '/';
      
    } catch (error) {
      console.error('Login error:', error);
      errorHandler.handleApiError(error, 'Login failed');
      setErrors({ general: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'teacher' | 'student') => {
    const demoCredentials = {
      admin: { email: 'admin@schoolsystem.com', password: 'admin123' },
      teacher: { email: 'teacher1@schoolsystem.com', password: 'teacher123' },
      student: { email: 'student1@schoolsystem.com', password: 'student123' }
    };

    setFormData(prev => ({
      ...prev,
      ...demoCredentials[role]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-3xl shadow-purple-glow mb-6">
            <FaGraduationCap className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Schoooli</h1>
          <p className="text-text-secondary">School Management System</p>
        </div>

        {/* Login Form */}
        <Card variant="strong" glow="purple">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
            <p className="text-text-secondary">Sign in to your account</p>
          </div>

          {/* Demo Login Buttons */}
          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-3">Quick Demo Access:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="glass-button p-2 text-xs hover:bg-accent-purple/10 hover:text-accent-purple transition-colors"
              >
                <FaUser className="mx-auto mb-1" />
                Admin
              </button>
              <button
                onClick={() => handleDemoLogin('teacher')}
                className="glass-button p-2 text-xs hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
              >
                <FaUser className="mx-auto mb-1" />
                Teacher
              </button>
              <button
                onClick={() => handleDemoLogin('student')}
                className="glass-button p-2 text-xs hover:bg-accent-green/10 hover:text-accent-green transition-colors"
              >
                <FaUser className="mx-auto mb-1" />
                Student
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="glass-card p-4 bg-red-500/10 border-red-500/30">
                <p className="text-red-500 text-sm text-center">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`glass-input w-full pl-10 pr-4 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`glass-input w-full pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 text-accent-purple rounded"
                />
                <span className="text-sm text-text-primary">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-accent-purple hover:text-accent-purple-light transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <button className="text-accent-purple hover:text-accent-purple-light transition-colors">
                Contact Administrator
              </button>
            </p>
          </div>
        </Card>

        {/* System Status */}
        <Card variant="default">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-accent-green rounded-full"></div>
            <span className="text-sm text-text-secondary">System Online</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
