// Error Handling Utilities
import { notificationService } from './notifications';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Array<{ field: string; message: string }>;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class AppError extends Error {
  public code: string;
  public status: number;
  public errors?: ValidationError[];
  public details?: any;

  constructor(message: string, code: string = 'APP_ERROR', status: number = 500, errors?: ValidationError[], details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.errors = errors;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(errors: ValidationError[], message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400, errors);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHZ_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

class ErrorHandler {
  // Parse API error response
  public parseApiError(error: any): ApiError {
    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        status: error.status,
        errors: error.errors,
        details: error.details,
      };
    }

    if (error.response?.data) {
      const data = error.response.data;
      return {
        message: data.message || 'An error occurred',
        code: data.code || 'API_ERROR',
        status: error.response.status,
        errors: data.errors,
        details: data.details,
      };
    }

    if (error.message) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        status: 0,
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 0,
    };
  }

  // Handle API errors with appropriate notifications
  public handleApiError(error: any, context?: string): void {
    const apiError = this.parseApiError(error);
    
    let message = apiError.message;
    if (context) {
      message = `${context}: ${message}`;
    }

    // Handle different error types
    switch (apiError.status) {
      case 400:
        if (apiError.errors && apiError.errors.length > 0) {
          // Show validation errors
          const validationMessages = apiError.errors.map(err => err.message).join(', ');
          notificationService.error(`Validation Error: ${validationMessages}`);
        } else {
          notificationService.error(message);
        }
        break;
      
      case 401:
        notificationService.error('Authentication failed. Please login again.');
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        break;
      
      case 403:
        notificationService.error('Access denied. You do not have permission to perform this action.');
        break;
      
      case 404:
        notificationService.error('Resource not found.');
        break;
      
      case 409:
        notificationService.error('Conflict: Resource already exists or is in use.');
        break;
      
      case 422:
        notificationService.error('Invalid data provided.');
        break;
      
      case 429:
        notificationService.error('Too many requests. Please try again later.');
        break;
      
      case 500:
        notificationService.error('Server error. Please try again later.');
        break;
      
      case 503:
        notificationService.error('Service unavailable. Please try again later.');
        break;
      
      default:
        if (apiError.status === 0) {
          notificationService.error('Network error. Please check your connection.');
        } else {
          notificationService.error(message);
        }
    }
  }

  // Handle form validation errors
  public handleValidationErrors(errors: ValidationError[]): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    
    errors.forEach(error => {
      fieldErrors[error.field] = error.message;
    });

    return fieldErrors;
  }

  // Create user-friendly error messages
  public getUserFriendlyMessage(error: any): string {
    const apiError = this.parseApiError(error);
    
    switch (apiError.code) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      
      case 'AUTH_ERROR':
        return 'Please login to continue.';
      
      case 'AUTHZ_ERROR':
        return 'You do not have permission to perform this action.';
      
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      
      case 'CONFLICT':
        return 'This resource already exists or is currently in use.';
      
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      
      default:
        return apiError.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Log error for debugging
  public logError(error: any, context?: string): void {
    const apiError = this.parseApiError(error);
    
    console.error('Error occurred:', {
      context,
      message: apiError.message,
      code: apiError.code,
      status: apiError.status,
      errors: apiError.errors,
      details: apiError.details,
      stack: error.stack,
    });
  }

  // Handle promise rejection
  public handlePromiseRejection(error: any, context?: string): void {
    this.logError(error, context);
    this.handleApiError(error, context);
  }

  // Create error boundary handler
  public createErrorBoundaryHandler(context: string) {
    return (error: Error, errorInfo: any) => {
      this.logError(error, `${context} - Error Boundary`);
      notificationService.error(`An error occurred in ${context}. Please refresh the page.`);
    };
  }
}

export const errorHandler = new ErrorHandler();

// Convenience functions
export const handleError = (error: any, context?: string) => errorHandler.handleApiError(error, context);
export const handleValidationErrors = (errors: ValidationError[]) => errorHandler.handleValidationErrors(errors);
export const getUserFriendlyMessage = (error: any) => errorHandler.getUserFriendlyMessage(error);
export const logError = (error: any, context?: string) => errorHandler.logError(error, context);

export default errorHandler;
