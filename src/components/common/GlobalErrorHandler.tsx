import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { NetworkStatus } from './ErrorNotification';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

// Global error event types
interface GlobalErrorEvent {
  type: 'unhandledrejection' | 'error';
  error: Error;
  timestamp: Date;
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorHistory, setErrorHistory] = useState<GlobalErrorEvent[]>([]);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));

      const errorEvent: GlobalErrorEvent = {
        type: 'unhandledrejection',
        error,
        timestamp: new Date()
      };

      setErrorHistory(prev => [...prev.slice(-9), errorEvent]); // Keep last 10 errors

      // Handle the error
      handleError(error, {
        customMessage: 'An unexpected error occurred. Please try again.',
        showToast: true
      });

      if (import.meta.env.DEV) {
        console.error('Unhandled promise rejection:', event.reason);
      }
    };

    // Handle uncaught JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      
      const errorEvent: GlobalErrorEvent = {
        type: 'error',
        error,
        timestamp: new Date()
      };

      setErrorHistory(prev => [...prev.slice(-9), errorEvent]);

      // Don't show toast for every JS error to avoid spam
      if (import.meta.env.DEV) {
        console.error('Uncaught error:', error);
      }
    };

    // Handle network status changes
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost');
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleError]);

  // Monitor for repeated errors (potential infinite loops)
  useEffect(() => {
    const recentErrors = errorHistory.filter(
      event => Date.now() - event.timestamp.getTime() < 10000 // Last 10 seconds
    );

    if (recentErrors.length >= 5) {
      console.error('Multiple errors detected in short time:', recentErrors);
      toast.error('Multiple errors detected. Please refresh the page.');
    }
  }, [errorHistory]);

  return (
    <>
      <NetworkStatus isOnline={isOnline} />
      {children}
      
      {/* Development error history */}
      {import.meta.env.DEV && errorHistory.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <details className="bg-background border rounded-lg shadow-lg">
            <summary className="p-2 cursor-pointer text-xs text-muted-foreground">
              Error History ({errorHistory.length})
            </summary>
            <div className="p-2 max-h-40 overflow-y-auto">
              {errorHistory.slice(-5).map((event, index) => (
                <div key={index} className="text-xs mb-2 p-2 bg-muted rounded">
                  <div className="font-medium text-destructive">
                    {event.type}
                  </div>
                  <div className="text-muted-foreground">
                    {event.error.message}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </>
  );
};

// Error reporting service integration
export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorQueue: GlobalErrorEvent[] = [];
  private isReporting = false;

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  reportError(error: Error, context?: any): void {
    const errorEvent: GlobalErrorEvent = {
      type: 'error',
      error,
      timestamp: new Date()
    };

    this.errorQueue.push(errorEvent);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      const errors = this.errorQueue.splice(0, 10); // Process up to 10 errors at once
      
      // In production, send to error tracking service
      if (import.meta.env.PROD) {
        // TODO: Integrate with error tracking service
        // await this.sendToErrorService(errors);
      }

      // Log in development
      if (import.meta.env.DEV) {
        console.group('Error Report');
        errors.forEach(error => {
          console.error(error.type, error.error, error.timestamp);
        });
        console.groupEnd();
      }
    } catch (reportingError) {
      console.error('Failed to report errors:', reportingError);
    } finally {
      this.isReporting = false;
      
      // Process remaining errors
      if (this.errorQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  private async sendToErrorService(errors: GlobalErrorEvent[]): Promise<void> {
    // Implementation for sending errors to external service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    
    const payload = {
      errors: errors.map(event => ({
        type: event.type,
        message: event.error.message,
        stack: event.error.stack,
        timestamp: event.timestamp.toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('lajospaces_user') ? 
          JSON.parse(localStorage.getItem('lajospaces_user')!).id : null
      })),
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    };

    // Send to error reporting service
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
  }
}

// Hook for manual error reporting
export const useErrorReporting = () => {
  const reportError = (error: Error, context?: any) => {
    ErrorReportingService.getInstance().reportError(error, context);
  };

  return { reportError };
};

export default GlobalErrorHandler;
