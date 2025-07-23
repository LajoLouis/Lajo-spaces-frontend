import React from 'react';
import { AlertCircle, Wifi, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiService } from '@/services/api.service';

interface ErrorNotificationProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  className?: string;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss,
  showRetry = true,
  className = ''
}) => {
  const isNetworkError = ApiService.isNetworkError(error);
  const isTimeoutError = ApiService.isTimeoutError(error);
  const isServerError = ApiService.isServerError(error);
  const errorMessage = ApiService.getUserFriendlyErrorMessage(error);

  const getErrorIcon = () => {
    if (isNetworkError) return <Wifi className="h-4 w-4" />;
    if (isTimeoutError) return <RefreshCw className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getErrorVariant = () => {
    if (isNetworkError || isTimeoutError) return 'default';
    if (isServerError) return 'destructive';
    return 'default';
  };

  const shouldShowRetry = () => {
    return showRetry && (isNetworkError || isTimeoutError || isServerError);
  };

  return (
    <Alert variant={getErrorVariant()} className={`${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          {getErrorIcon()}
          <div className="flex-1">
            <AlertDescription className="text-sm">
              {errorMessage}
            </AlertDescription>
            
            {/* Show validation errors if present */}
            {ApiService.hasValidationErrors(error) && (
              <div className="mt-2 space-y-1">
                {Object.entries(ApiService.getValidationErrors(error)).map(([field, message]) => (
                  <div key={field} className="text-xs text-muted-foreground">
                    <span className="font-medium capitalize">{field}:</span> {message}
                  </div>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            {(shouldShowRetry() || onDismiss) && (
              <div className="flex items-center space-x-2 mt-3">
                {shouldShowRetry() && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-8 px-3 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="h-8 px-3 text-xs"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

// Inline error component for forms
interface InlineErrorProps {
  error?: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ 
  error, 
  className = '' 
}) => {
  if (!error) return null;

  return (
    <div className={`flex items-center space-x-1 text-sm text-destructive ${className}`}>
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  );
};

// Network status indicator
interface NetworkStatusProps {
  isOnline: boolean;
  className?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  isOnline, 
  className = '' 
}) => {
  if (isOnline) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <Alert variant="destructive" className="shadow-lg">
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          No internet connection. Please check your network.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Error fallback component
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}>
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
      </p>
      
      {import.meta.env.DEV && (
        <details className="mb-6 max-w-2xl">
          <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
            Error Details (Development)
          </summary>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-40">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
      
      <div className="flex space-x-3">
        <Button onClick={resetError} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
};

export default ErrorNotification;
