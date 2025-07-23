import { toast } from 'sonner';

export interface NotificationData {
  id: string;
  type: 'message' | 'match' | 'property' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'navigate' | 'api_call' | 'dismiss';
  data?: any;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class NotificationService {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: true,
  };
  
  private eventListeners: Map<string, Function[]> = new Map();
  private notifications: NotificationData[] = [];

  constructor() {
    this.checkPermission();
    this.setupVisibilityListener();
  }

  // Permission Management
  private checkPermission(): void {
    if ('Notification' in window) {
      const permission = Notification.permission;
      this.permission = {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      };
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission.granted) {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.checkPermission();
      
      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll receive real-time updates.');
        return true;
      } else {
        toast.error('Notifications disabled. You can enable them in browser settings.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Notification Display
  showNotification(data: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): void {
    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...data,
    };

    // Add to internal storage
    this.notifications.unshift(notification);
    this.emit('notification_received', notification);

    // Show browser notification if permission granted and page not visible
    if (this.permission.granted && document.hidden) {
      this.showBrowserNotification(notification);
    }

    // Show toast notification
    this.showToastNotification(notification);
  }

  private showBrowserNotification(data: NotificationData): void {
    if (!this.permission.granted) return;

    try {
      const notification = new Notification(data.title, {
        body: data.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.type,
        requireInteraction: data.priority === 'urgent',
        silent: data.priority === 'low',
      });

      notification.onclick = () => {
        window.focus();
        this.handleNotificationClick(data);
        notification.close();
      };

      // Auto-close after 5 seconds for non-urgent notifications
      if (data.priority !== 'urgent') {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  private showToastNotification(data: NotificationData): void {
    const toastOptions = {
      description: data.message,
      duration: this.getToastDuration(data.priority),
      action: data.actions?.[0] ? {
        label: data.actions[0].label,
        onClick: () => this.handleNotificationAction(data.actions![0], data),
      } : undefined,
    };

    switch (data.priority) {
      case 'urgent':
        toast.error(data.title, toastOptions);
        break;
      case 'high':
        toast.warning(data.title, toastOptions);
        break;
      case 'medium':
        toast.success(data.title, toastOptions);
        break;
      case 'low':
      default:
        toast.info(data.title, toastOptions);
        break;
    }
  }

  private getToastDuration(priority: NotificationData['priority']): number {
    switch (priority) {
      case 'urgent': return 10000; // 10 seconds
      case 'high': return 7000;    // 7 seconds
      case 'medium': return 5000;  // 5 seconds
      case 'low': return 3000;     // 3 seconds
      default: return 5000;
    }
  }

  // Notification Handlers
  private handleNotificationClick(data: NotificationData): void {
    this.markAsRead(data.id);
    
    if (data.actions && data.actions.length > 0) {
      this.handleNotificationAction(data.actions[0], data);
    }
    
    this.emit('notification_clicked', data);
  }

  private handleNotificationAction(action: NotificationAction, notification: NotificationData): void {
    switch (action.action) {
      case 'navigate':
        if (action.data?.url) {
          window.location.href = action.data.url;
        }
        break;
      case 'api_call':
        this.emit('notification_action', { action, notification });
        break;
      case 'dismiss':
        this.markAsRead(notification.id);
        break;
    }
  }

  // Notification Management
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notification_updated', notification);
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.emit('notifications_updated', this.notifications);
  }

  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.emit('notifications_updated', this.notifications);
  }

  clearAll(): void {
    this.notifications = [];
    this.emit('notifications_updated', this.notifications);
  }

  // Getters
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotificationsByType(type: NotificationData['type']): NotificationData[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Event Management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in notification event listener for ${event}:`, error);
        }
      });
    }
  }

  // Visibility Management
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible, mark recent notifications as seen
        this.emit('page_visible');
      }
    });
  }

  // Utility Methods
  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return { ...this.permission };
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
