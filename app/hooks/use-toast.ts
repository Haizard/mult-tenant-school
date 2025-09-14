'use client';

import toast from 'react-hot-toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 4000 } = options;
    
    const message = title && description ? `${title}\n${description}` : title || description || '';
    
    switch (variant) {
      case 'success':
        toast.success(message, { duration });
        break;
      case 'destructive':
        toast.error(message, { duration });
        break;
      case 'warning':
        toast(message, {
          duration,
          icon: '⚠️',
          style: {
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: 'white',
          },
        });
        break;
      default:
        toast(message, { duration });
        break;
    }
  };

  return {
    toast: showToast,
    success: (title: string, description?: string) => 
      showToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) => 
      showToast({ title, description, variant: 'destructive' }),
    warning: (title: string, description?: string) => 
      showToast({ title, description, variant: 'warning' }),
    info: (title: string, description?: string) => 
      showToast({ title, description, variant: 'default' }),
  };
};