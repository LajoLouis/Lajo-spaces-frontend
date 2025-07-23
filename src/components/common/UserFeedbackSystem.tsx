import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Upload,
  Download,
  Save,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Operation status types
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error' | 'warning';

// Feedback message types
export interface FeedbackMessage {
  id: string;
  type: OperationStatus;
  title: string;
  description?: string;
  timestamp: Date;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Network status indicator
export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      toast.success('Connection restored', {
        icon: <Wifi className="h-4 w-4" />
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      toast.error('Connection lost', {
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-2 text-center text-sm">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span>No internet connection. Some features may not work properly.</span>
      </div>
    </div>
  );
};

// Operation feedback component
interface OperationFeedbackProps {
  status: OperationStatus;
  message?: string;
  progress?: number;
  onRetry?: () => void;
  className?: string;
}

export const OperationFeedback: React.FC<OperationFeedbackProps> = ({
  status,
  message,
  progress,
  onRetry,
  className
}) => {
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {getIcon()}
      <span className={cn('text-sm', getStatusColor())}>
        {message || status}
      </span>
      {typeof progress === 'number' && (
        <div className="flex-1 max-w-32">
          <Progress value={progress} className="h-2" />
        </div>
      )}
      {status === 'error' && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
};

// Form submission feedback
interface FormFeedbackProps {
  isSubmitting: boolean;
  submitError?: string | null;
  submitSuccess?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const FormFeedback: React.FC<FormFeedbackProps> = ({
  isSubmitting,
  submitError,
  submitSuccess,
  onRetry,
  className
}) => {
  if (!isSubmitting && !submitError && !submitSuccess) return null;

  return (
    <div className={cn('mt-4', className)}>
      {isSubmitting && (
        <OperationFeedback
          status="loading"
          message="Submitting form..."
        />
      )}
      
      {submitError && (
        <OperationFeedback
          status="error"
          message={submitError}
          onRetry={onRetry}
        />
      )}
      
      {submitSuccess && (
        <OperationFeedback
          status="success"
          message="Form submitted successfully"
        />
      )}
    </div>
  );
};

// File upload feedback
interface FileUploadFeedbackProps {
  isUploading: boolean;
  uploadProgress?: number;
  uploadError?: string | null;
  uploadSuccess?: boolean;
  fileName?: string;
  onRetry?: () => void;
  className?: string;
}

export const FileUploadFeedback: React.FC<FileUploadFeedbackProps> = ({
  isUploading,
  uploadProgress,
  uploadError,
  uploadSuccess,
  fileName,
  onRetry,
  className
}) => {
  if (!isUploading && !uploadError && !uploadSuccess) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-600">
              Uploading {fileName || 'file'}...
            </span>
          </div>
          {typeof uploadProgress === 'number' && (
            <Progress value={uploadProgress} className="h-2" />
          )}
        </div>
      )}
      
      {uploadError && (
        <OperationFeedback
          status="error"
          message={`Upload failed: ${uploadError}`}
          onRetry={onRetry}
        />
      )}
      
      {uploadSuccess && (
        <OperationFeedback
          status="success"
          message={`${fileName || 'File'} uploaded successfully`}
        />
      )}
    </div>
  );
};

// Action feedback badges
interface ActionBadgeProps {
  action: 'save' | 'delete' | 'upload' | 'download' | 'sync';
  status: OperationStatus;
  className?: string;
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({
  action,
  status,
  className
}) => {
  const getActionIcon = () => {
    switch (action) {
      case 'save':
        return <Save className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      case 'upload':
        return <Upload className="h-3 w-3" />;
      case 'download':
        return <Download className="h-3 w-3" />;
      case 'sync':
        return <RefreshCw className="h-3 w-3" />;
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'loading':
        return 'secondary';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Processing...';
      case 'success':
        return 'Completed';
      case 'error':
        return 'Failed';
      case 'warning':
        return 'Warning';
      default:
        return 'Idle';
    }
  };

  return (
    <Badge variant={getStatusVariant()} className={cn('space-x-1', className)}>
      {getActionIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );
};

// Auto-save indicator
interface AutoSaveIndicatorProps {
  lastSaved?: Date;
  isSaving?: boolean;
  saveError?: string | null;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  lastSaved,
  isSaving,
  saveError,
  className
}) => {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('flex items-center space-x-2 text-xs text-muted-foreground', className)}>
      {isSaving && (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      
      {!isSaving && saveError && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Save failed</span>
        </>
      )}
      
      {!isSaving && !saveError && lastSaved && (
        <>
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Saved {getTimeAgo(lastSaved)}</span>
        </>
      )}
    </div>
  );
};

export default OperationFeedback;
