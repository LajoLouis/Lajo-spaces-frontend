import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => string;
  showError: (title: string, message?: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider
interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the latest notifications
      return updated.slice(0, maxNotifications);
    });

    // Auto-remove non-persistent notifications
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent: true, // Errors are persistent by default
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Notification Container
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => {
            notification.onDismiss?.();
            removeNotification(notification.id);
          }}
        />
      ))}
    </div>
  );
};

// Individual Notification Item
interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-destructive';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
    }
  };

  return (
    <div className={cn(
      'bg-background border border-l-4 rounded-lg shadow-lg p-4 animate-in slide-in-from-right-full',
      getBorderColor()
    )}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={notification.action.onClick}
              className="mt-2 h-8 px-3 text-xs"
            >
              {notification.action.label}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Toast notification helpers (using sonner)
export const showToast = {
  success: (message: string, options?: any) => {
    toast.success(message, {
      icon: <CheckCircle className="h-4 w-4" />,
      ...options
    });
  },
  
  error: (message: string, options?: any) => {
    toast.error(message, {
      icon: <AlertCircle className="h-4 w-4" />,
      duration: Infinity, // Errors persist until dismissed
      ...options
    });
  },
  
  warning: (message: string, options?: any) => {
    toast.warning(message, {
      icon: <AlertTriangle className="h-4 w-4" />,
      ...options
    });
  },
  
  info: (message: string, options?: any) => {
    toast.info(message, {
      icon: <Info className="h-4 w-4" />,
      ...options
    });
  },
  
  loading: (message: string, options?: any) => {
    return toast.loading(message, options);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error
    });
  }
};

// Custom Toaster component with LajoSpaces styling
export const LajoSpacesToaster: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  );
};

// Hook for operation feedback
export const useOperationFeedback = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();

  const handleOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    {
      loadingMessage = 'Processing...',
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed',
      showLoadingToast = true,
      showSuccessToast = true,
      showErrorToast = true
    }: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showLoadingToast?: boolean;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
    } = {}
  ): Promise<T | null> => {
    let loadingToastId: string | number | undefined;

    try {
      if (showLoadingToast) {
        loadingToastId = showToast.loading(loadingMessage);
      }

      const result = await operation();

      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      if (showSuccessToast) {
        showSuccess('Success', successMessage);
      }

      return result;
    } catch (error: any) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      if (showErrorToast) {
        showError('Error', errorMessage || error.message);
      }

      throw error;
    }
  }, [showSuccess, showError]);

  return { handleOperation };
};

export default NotificationProvider;
