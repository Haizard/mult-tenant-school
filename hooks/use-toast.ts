import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    // Simple console logging for now - can be enhanced with actual toast UI later
    console.log(`Toast: ${options.title}`, options.description);
    
    // Add to toasts array (for future UI implementation)
    setToasts(prev => [...prev, options]);
    
    // Remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);
  };

  return { toast, toasts };
};
