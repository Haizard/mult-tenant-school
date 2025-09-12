'use client';

import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function UnauthorizedPage() {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="default" className="max-w-md w-full text-center">
        <div className="p-8">
          <div className="mb-6">
            <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
            <p className="text-text-secondary">
              You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGoBack}
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Go Back
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="secondary"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
