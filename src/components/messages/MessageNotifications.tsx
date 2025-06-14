import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Check,
  Bell,
  BellOff
} from 'lucide-react';
import { MessageNotification, Message, User } from '@/types/message.types';
import { useMessageStore } from '@/stores/messageStore';
import { mockMessageService } from '@/services/mockMessage.service';

interface MessageNotificationsProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const MessageNotifications: React.FC<MessageNotificationsProps> = ({
  isEnabled,
  onToggle
}) => {
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { setActiveConversation } = useMessageStore();

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  const showBrowserNotification = (message: Message, sender: User) => {
    if (!isEnabled || permission !== 'granted') return;

    const notification = new Notification(`New message from ${sender.firstName} ${sender.lastName}`, {
      body: message.content.length > 100 ? `${message.content.substring(0, 100)}...` : message.content,
      icon: sender.avatar || '/default-avatar.png',
      badge: '/logo-small.png',
      tag: `message-${message.id}`,
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      setActiveConversation(message.conversationId);
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  };

  const showToastNotification = (message: Message, sender: User) => {
    toast.custom((t) => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={sender.avatar} />
            <AvatarFallback>
              {sender.firstName[0]}{sender.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900 truncate">
                {sender.firstName} {sender.lastName}
              </p>
              {sender.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3" />
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {message.content}
            </p>
            
            <div className="flex items-center space-x-2 mt-2">
              <Button
                size="sm"
                onClick={() => {
                  setActiveConversation(message.conversationId);
                  toast.dismiss(t);
                }}
                className="text-xs"
              >
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.dismiss(t)}
                className="text-xs"
              >
                Dismiss
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="w-6 h-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-right'
    });
  };

  const handleNewMessage = (message: Message) => {
    const sender = mockMessageService.getUserById(message.senderId);
    if (!sender) return;

    // Don't show notification for current user's messages
    const currentUser = mockMessageService.getCurrentUser();
    if (message.senderId === currentUser?.id) return;

    // Show browser notification if permission granted
    if (permission === 'granted') {
      showBrowserNotification(message, sender);
    } else {
      // Fallback to toast notification
      showToastNotification(message, sender);
    }

    // Add to internal notifications list
    const notification: MessageNotification = {
      id: `notif-${Date.now()}`,
      type: 'new_message',
      title: `New message from ${sender.firstName} ${sender.lastName}`,
      body: message.content,
      conversationId: message.conversationId,
      senderId: message.senderId,
      timestamp: new Date(),
      isRead: false,
      action: {
        type: 'open_conversation',
        data: { conversationId: message.conversationId }
      }
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Set up message event listener
  useEffect(() => {
    const handleMessageEvent = (event: any) => {
      if (event.type === 'message_received') {
        handleNewMessage(event.data as Message);
      }
    };

    mockMessageService.addEventListener(handleMessageEvent);
    return () => {
      mockMessageService.removeEventListener(handleMessageEvent);
    };
  }, [permission, isEnabled]);

  const NotificationToggle = () => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(!isEnabled)}
        className={`flex items-center space-x-2 ${
          isEnabled ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        {isEnabled ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        <span className="text-xs">
          {isEnabled ? 'Notifications On' : 'Notifications Off'}
        </span>
      </Button>
      
      {permission === 'default' && isEnabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={requestPermission}
          className="text-xs"
        >
          Enable Browser Notifications
        </Button>
      )}
    </div>
  );

  const NotificationsList = () => (
    <div className="space-y-2">
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
          }`}
          onClick={() => {
            if (notification.action?.type === 'open_conversation') {
              setActiveConversation(notification.action.data.conversationId);
            }
            // Mark as read
            setNotifications(prev =>
              prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            );
          }}
        >
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {notification.body}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </div>
        </div>
      ))}
      
      {notifications.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No recent notifications
        </div>
      )}
    </div>
  );

  return {
    NotificationToggle,
    NotificationsList,
    unreadCount: notifications.filter(n => !n.isRead).length,
    requestPermission,
    permission
  };
};

// Hook for using message notifications
export const useMessageNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('messageNotificationsEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('messageNotificationsEnabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  const notificationComponent = MessageNotifications({
    isEnabled,
    onToggle: setIsEnabled
  });

  return {
    isEnabled,
    setIsEnabled,
    ...notificationComponent
  };
};
