import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBadgeProps {
  type?: 'message' | 'match' | 'property' | 'system' | 'reminder';
  className?: string;
  showZero?: boolean;
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  type,
  className = '',
  showZero = false,
  maxCount = 99,
}) => {
  const { unreadCount, getNotificationsByType } = useNotifications();

  const count = type 
    ? getNotificationsByType(type).filter(n => !n.read).length
    : unreadCount;

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge 
      variant="destructive" 
      className={`h-5 w-5 flex items-center justify-center p-0 text-xs ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

// Specific notification badges for different types
export const MessageNotificationBadge: React.FC<Omit<NotificationBadgeProps, 'type'>> = (props) => (
  <NotificationBadge type="message" {...props} />
);

export const MatchNotificationBadge: React.FC<Omit<NotificationBadgeProps, 'type'>> = (props) => (
  <NotificationBadge type="match" {...props} />
);

export const PropertyNotificationBadge: React.FC<Omit<NotificationBadgeProps, 'type'>> = (props) => (
  <NotificationBadge type="property" {...props} />
);

export const SystemNotificationBadge: React.FC<Omit<NotificationBadgeProps, 'type'>> = (props) => (
  <NotificationBadge type="system" {...props} />
);

export default NotificationBadge;
