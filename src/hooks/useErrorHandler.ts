import { useCallback } from 'react';
import { toast } from 'sonner';
import { apiService } from '@/services/api.service';
import { ApiErrorResponse } from '@/types/api.types';
import { useAuthStore } from '@/stores/authStore';

// Import the class for static methods
class ApiService {
  static isNetworkError(error: any): boolean {
    return !error.response && error.request;
  }

  static isAuthError(error: any): boolean {
    return error.response?.status === 401 || error.response?.status === 403;
  }

  static getUserFriendlyErrorMessage(error: any): string {
    const errorCode = error.response?.data?.error?.code || error.response?.data?.code;

    switch (errorCode) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'UNAUTHORIZED':
        return 'You are not authorized to perform this action.';
      case 'FORBIDDEN':
        return 'Access denied.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'CONFLICT':
        return 'This action conflicts with existing data.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please try again later.';
      case 'SERVER_ERROR':
        return 'Server error. Please try again later.';
      default:
        if (ApiService.isNetworkError(error)) {
          return 'Unable to connect. Please check your internet connection.';
        }
        return error.response?.data?.message || error.message || 'An unexpected error occurred';
    }
  }

  static getValidationErrors(error: any): Record<string, string> {
    const errors: Record<string, string> = {};
    const details = error.response?.data?.error?.details;

    if (Array.isArray(details)) {
      details.forEach((detail: any) => {
        if (detail.field && detail.message) {
          errors[detail.field] = detail.message;
        }
      });
    }

    return errors;
  }

  static hasValidationErrors(error: any): boolean {
    return error.response?.data?.error?.code === 'VALIDATION_ERROR' ||
           error.response?.data?.code === 'VALIDATION_ERROR';
  }
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  showValidationErrors?: boolean;
  redirectOnAuth?: boolean;
  customMessage?: string;
  onError?: (error: any) => void;
}

interface ValidationErrors {
  [field: string]: string;
}

export const useErrorHandler = () => {
  const { logout } = useAuthStore();

  const handleError = useCallback((
    error: any,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      showValidationErrors = true,
      redirectOnAuth = true,
      customMessage,
      onError
    } = options;

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }

    // Handle authentication errors
    if (ApiService.isAuthError(error)) {
      if (redirectOnAuth) {
        logout();
        toast.error('Your session has expired. Please log in again.');
        return;
      }
    }

    // Handle validation errors
    if (ApiService.hasValidationErrors(error) && showValidationErrors) {
      const validationErrors = ApiService.getValidationErrors(error);
      const errorMessages = Object.values(validationErrors);

      if (errorMessages.length > 0) {
        if (showToast) {
          errorMessages.forEach(message => {
            toast.error(message);
          });
        }
        return validationErrors;
      }
    }

    // Show general error message
    if (showToast) {
      const message = customMessage || ApiService.getUserFriendlyErrorMessage(error);
      toast.error(message);
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('Error handled:', error);
    }

    return null;
  }, [logout]);

  const handleApiError = useCallback((
    error: ApiErrorResponse,
    options: ErrorHandlerOptions = {}
  ) => {
    return handleError(error, options);
  }, [handleError]);

  const getErrorMessage = useCallback((error: any): string => {
    return ApiService.getUserFriendlyErrorMessage(error);
  }, []);

  const getValidationErrors = useCallback((error: any): ValidationErrors => {
    return ApiService.getValidationErrors(error);
  }, []);

  const isValidationError = useCallback((error: any): boolean => {
    return ApiService.hasValidationErrors(error);
  }, []);

  const isNetworkError = useCallback((error: any): boolean => {
    return ApiService.isNetworkError(error);
  }, []);

  const isAuthError = useCallback((error: any): boolean => {
    return ApiService.isAuthError(error);
  }, []);

  return {
    handleError,
    handleApiError,
    getErrorMessage,
    getValidationErrors,
    isValidationError,
    isNetworkError,
    isAuthError
  };
};

// Hook for handling async operations with error handling
export const useAsyncError = () => {
  const { handleError } = useErrorHandler();

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  return { executeAsync };
};

// Hook for form error handling
export const useFormErrorHandler = () => {
  const { handleError, getValidationErrors, isValidationError } = useErrorHandler();

  const handleFormError = useCallback((
    error: any,
    setFieldError?: (field: string, message: string) => void
  ) => {
    if (isValidationError(error) && setFieldError) {
      const validationErrors = getValidationErrors(error);
      Object.entries(validationErrors).forEach(([field, message]) => {
        setFieldError(field, message);
      });
      return true; // Validation errors handled
    }

    // Handle non-validation errors
    handleError(error, { showValidationErrors: false });
    return false; // General error handled
  }, [handleError, getValidationErrors, isValidationError]);

  return { handleFormError };
};

// Error boundary hook
export const useErrorBoundary = () => {
  const { handleError } = useErrorHandler();

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    // Log error for debugging
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Handle the error
    handleError(error, {
      customMessage: 'Something went wrong. Please refresh the page and try again.',
      showToast: true
    });

    // Report to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      // TODO: Integrate with error tracking service
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }, [handleError]);

  return { captureError };
};

export default useErrorHandler;
