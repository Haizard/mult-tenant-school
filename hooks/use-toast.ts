import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  id?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    // Simple console logging for now - can be enhanced with actual toast UI later
    console.log(`Toast: ${options.title}`, options.description);
    
    // Add toast with unique ID
    const id = Date.now();
    const newToast = { ...options, id };
    setToasts(prev => [...prev, newToast]);
    
    // Remove specific toast after 5 seconds
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    
    // Return cleanup function for the timer
    return () => clearTimeout(timer);
  };

  return { toast, toasts };
};
