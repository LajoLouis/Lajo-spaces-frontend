import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationData, NotificationPermission } from '@/services/notification.service';
import { useSocketEvent } from './useSocket';
import { useAuth } from './useAuth';

export interface UseNotificationsOptions {
  autoRequestPermission?: boolean;
  enableRealTimeUpdates?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { autoRequestPermission = false, enableRealTimeUpdates = true } = options;
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );

  // Request permission on mount if enabled
  useEffect(() => {
    if (autoRequestPermission && user && !permission.granted && !permission.denied) {
      requestPermission();
    }
  }, [autoRequestPermission, user, permission]);

  // Setup notification event listeners
  useEffect(() => {
    const handleNotificationReceived = (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev]);
      updateUnreadCount();
    };

    const handleNotificationUpdated = (notification: NotificationData) => {
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? notification : n
      ));
      updateUnreadCount();
    };

    const handleNotificationsUpdated = (updatedNotifications: NotificationData[]) => {
      setNotifications(updatedNotifications);
      updateUnreadCount();
    };

    notificationService.on('notification_received', handleNotificationReceived);
    notificationService.on('notification_updated', handleNotificationUpdated);
    notificationService.on('notifications_updated', handleNotificationsUpdated);

    // Load initial notifications
    setNotifications(notificationService.getNotifications());
    updateUnreadCount();

    return () => {
      notificationService.off('notification_received', handleNotificationReceived);
      notificationService.off('notification_updated', handleNotificationUpdated);
      notificationService.off('notifications_updated', handleNotificationsUpdated);
    };
  }, []);

  // Setup real-time notification listeners
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    // Listen for real-time events and convert to notifications
    const handleNewMessage = (data: any) => {
      if (data.message.senderId !== user?.id) {
        showNotification({
          type: 'message',
          title: 'New Message',
          message: `${data.message.senderId}: ${data.message.content}`,
          priority: 'medium',
          data: {
            conversationId: data.conversationId,
            messageId: data.message._id,
          },
          actions: [{
            id: 'view_message',
            label: 'View',
            action: 'navigate',
            data: { url: `/messages/${data.conversationId}` }
          }]
        });
      }
    };

    const handleNewMatch = (data: any) => {
      showNotification({
        type: 'match',
        title: 'New Match! 🎉',
        message: `You matched with ${data.user.firstName}!`,
        priority: 'high',
        data: {
          userId: data.user.id,
          matchId: data.matchId,
        },
        actions: [{
          id: 'view_match',
          label: 'View Profile',
          action: 'navigate',
          data: { url: `/discovery/${data.user.id}` }
        }]
      });
    };

    const handlePropertyUpdate = (data: any) => {
      showNotification({
        type: 'property',
        title: 'Property Update',
        message: data.message || 'A property you\'re interested in has been updated',
        priority: 'medium',
        data: {
          propertyId: data.propertyId,
        },
        actions: [{
          id: 'view_property',
          label: 'View Property',
          action: 'navigate',
          data: { url: `/properties/${data.propertyId}` }
        }]
      });
    };

    const handleSystemNotification = (data: any) => {
      showNotification({
        type: 'system',
        title: data.title || 'System Notification',
        message: data.message,
        priority: data.priority || 'medium',
        data: data.data,
        actions: data.actions
      });
    };

    // These would be registered via socket events in a real implementation
    // For now, we'll handle them through the socket hooks directly
  }, [enableRealTimeUpdates, user?.id]);

  const updateUnreadCount = useCallback(() => {
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermissionStatus());
    return granted;
  }, []);

  const showNotification = useCallback((data: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    notificationService.showNotification(data);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    notificationService.removeNotification(notificationId);
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  const getNotificationsByType = useCallback((type: NotificationData['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    showNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    isSupported: notificationService.isSupported(),
  };
};

// Hook for listening to specific socket events and converting to notifications
export const useSocketNotifications = () => {
  const { showNotification } = useNotifications({ enableRealTimeUpdates: false });
  const { user } = useAuth();

  // Listen for new messages
  useSocketEvent('new_message', (data: any) => {
    // Only show notification if message is from someone else and page is not focused on that conversation
    if (data.message.senderId !== user?.id && document.hidden) {
      showNotification({
        type: 'message',
        title: 'New Message',
        message: data.message.content.length > 50
          ? `${data.message.content.substring(0, 50)}...`
          : data.message.content,
        priority: 'medium',
        data: {
          conversationId: data.conversationId,
          messageId: data.message._id,
        },
        actions: [{
          id: 'view_message',
          label: 'View',
          action: 'navigate',
          data: { url: `/messages/${data.conversationId}` }
        }]
      });
    }
  });

  // Listen for conversation created
  useSocketEvent('conversation_created', (data: any) => {
    showNotification({
      type: 'message',
      title: 'New Conversation',
      message: 'Someone started a conversation with you',
      priority: 'medium',
      data: {
        conversationId: data.conversation._id,
      },
      actions: [{
        id: 'view_conversation',
        label: 'View',
        action: 'navigate',
        data: { url: `/messages/${data.conversation._id}` }
      }]
    });
  });

  // Listen for user status changes (only for important status changes)
  useSocketEvent('user_status_changed', (data: any) => {
    // Only show notifications for users coming online if they're in active conversations
    // This would need to be filtered based on user relationships
  });

  return {
    showNotification,
  };
};

export default useNotifications;
