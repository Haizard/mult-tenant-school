'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        },
        error: {
          style: {
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            color: 'white',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
          },
        },
        loading: {
          style: {
            background: 'linear-gradient(135deg, #6B46C1, #8B5CF6)',
            color: 'white',
            boxShadow: '0 10px 25px rgba(107, 70, 193, 0.3)',
          },
        },
      }}
    />
  );
};

export default Toaster;
