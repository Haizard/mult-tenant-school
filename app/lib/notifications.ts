// Notification System for Success, Error, and Info Messages
import { toast } from 'react-hot-toast';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
  icon?: string;
  style?: React.CSSProperties;
}

class NotificationService {
  // Success Notifications
  public success(message: string, options: NotificationOptions = {}): void {
    toast.success(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        ...options.style,
      },
      icon: options.icon || '✅',
    });
  }

  // Error Notifications
  public error(message: string, options: NotificationOptions = {}): void {
    toast.error(message, {
      duration: options.duration || 5000,
      position: options.position || 'top-right',
      style: {
        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
        ...options.style,
      },
      icon: options.icon || '❌',
    });
  }

  // Warning Notifications
  public warning(message: string, options: NotificationOptions = {}): void {
    toast(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
        ...options.style,
      },
      icon: options.icon || '⚠️',
    });
  }

  // Info Notifications
  public info(message: string, options: NotificationOptions = {}): void {
    toast(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
        ...options.style,
      },
      icon: options.icon || 'ℹ️',
    });
  }

  // Loading Notifications
  public loading(message: string, options: NotificationOptions = {}): string {
    return toast.loading(message, {
      duration: Infinity,
      position: options.position || 'top-right',
      style: {
        background: 'linear-gradient(135deg, #6B46C1, #8B5CF6)',
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(107, 70, 193, 0.3)',
        ...options.style,
      },
    });
  }

  // Dismiss Loading Notification
  public dismissLoading(toastId: string): void {
    toast.dismiss(toastId);
  }

  // Update Loading Notification to Success
  public updateToSuccess(toastId: string, message: string): void {
    toast.success(message, {
      id: toastId,
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
      },
      icon: '✅',
    });
  }

  // Update Loading Notification to Error
  public updateToError(toastId: string, message: string): void {
    toast.error(message, {
      id: toastId,
      duration: 5000,
      style: {
        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
        color: 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
      },
      icon: '❌',
    });
  }

  // Custom Notifications
  public custom(message: string, options: NotificationOptions & { 
    background?: string; 
    color?: string; 
    icon?: string;
  } = {}): void {
    toast(message, {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      style: {
        background: options.background || 'linear-gradient(135deg, #6B7280, #4B5563)',
        color: options.color || 'white',
        fontWeight: '500',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(107, 114, 128, 0.3)',
        ...options.style,
      },
      icon: options.icon || '📢',
    });
  }

  // Dismiss All Notifications
  public dismissAll(): void {
    toast.dismiss();
  }

  // Promise-based Notifications
  public async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> {
    const toastId = this.loading(messages.loading);

    try {
      const result = await promise;
      const successMessage = typeof messages.success === 'function' 
        ? messages.success(result) 
        : messages.success;
      this.updateToSuccess(toastId, successMessage);
      return result;
    } catch (error) {
      const errorMessage = typeof messages.error === 'function' 
        ? messages.error(error) 
        : messages.error;
      this.updateToError(toastId, errorMessage);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();

// Convenience functions for common operations
export const notify = {
  success: (message: string, options?: NotificationOptions) => notificationService.success(message, options),
  error: (message: string, options?: NotificationOptions) => notificationService.error(message, options),
  warning: (message: string, options?: NotificationOptions) => notificationService.warning(message, options),
  info: (message: string, options?: NotificationOptions) => notificationService.info(message, options),
  loading: (message: string, options?: NotificationOptions) => notificationService.loading(message, options),
  dismiss: (toastId: string) => notificationService.dismissLoading(toastId),
  dismissAll: () => notificationService.dismissAll(),
  promise: <T>(promise: Promise<T>, messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }) => notificationService.promise(promise, messages),
};

export default notificationService;
