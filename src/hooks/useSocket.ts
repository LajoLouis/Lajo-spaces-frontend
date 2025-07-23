import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { socketService, ConnectionStatus, SocketMessage, TypingEvent } from '@/services/socket.service';

export interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;
  const { user, token } = useAuth();
  const isInitialized = useRef(false);

  // Connection management
  const connect = useCallback(() => {
    if (token && user) {
      console.log('🔌 Connecting to Socket.IO server...');
      socketService.connect(token);
    }
  }, [token, user]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from Socket.IO server...');
    socketService.disconnect();
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (autoConnect && token && user && !isInitialized.current) {
      connect();
      isInitialized.current = true;
    }

    return () => {
      if (isInitialized.current) {
        disconnect();
        isInitialized.current = false;
      }
    };
  }, [autoConnect, token, user, connect, disconnect]);

  // Setup event listeners
  useEffect(() => {
    const handleConnectionStatusChanged = (status: ConnectionStatus) => {
      if (status.isConnected && onConnect) {
        onConnect();
      } else if (!status.isConnected && !status.isConnecting && onDisconnect) {
        onDisconnect();
      }
    };

    const handleSocketError = (error: any) => {
      if (onError) {
        onError(error);
      }
    };

    socketService.on('connection_status_changed', handleConnectionStatusChanged);
    socketService.on('socket_error', handleSocketError);

    return () => {
      socketService.off('connection_status_changed', handleConnectionStatusChanged);
      socketService.off('socket_error', handleSocketError);
    };
  }, [onConnect, onDisconnect, onError]);

  return {
    connect,
    disconnect,
    isConnected: socketService.isConnected,
    status: socketService.status,
    socketId: socketService.socketId,
  };
};

// Hook for messaging functionality
export const useSocketMessaging = () => {
  const sendMessage = useCallback((data: {
    conversationId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'location';
    metadata?: any;
    tempId?: string;
  }) => {
    socketService.sendMessage(data);
  }, []);

  const markAsDelivered = useCallback((messageId: string) => {
    socketService.markMessageAsDelivered(messageId);
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    socketService.markMessageAsRead(messageId);
  }, []);

  const reactToMessage = useCallback((messageId: string, reaction: string) => {
    socketService.reactToMessage(messageId, reaction);
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketService.leaveConversation(conversationId);
  }, []);

  const createConversation = useCallback((data: {
    participantIds: string[];
    conversationType: 'direct' | 'group' | 'support';
    title?: string;
    description?: string;
  }) => {
    socketService.createConversation(data);
  }, []);

  return {
    sendMessage,
    markAsDelivered,
    markAsRead,
    reactToMessage,
    joinConversation,
    leaveConversation,
    createConversation,
  };
};

// Hook for typing indicators
export const useSocketTyping = () => {
  const startTyping = useCallback((conversationId: string) => {
    socketService.startTyping(conversationId);
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketService.stopTyping(conversationId);
  }, []);

  return {
    startTyping,
    stopTyping,
  };
};

// Hook for user status
export const useSocketStatus = () => {
  const changeStatus = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    socketService.changeStatus(status);
  }, []);

  return {
    changeStatus,
  };
};

// Hook for listening to specific socket events
export const useSocketEvent = <T = any>(
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    socketService.on(event, handler);

    return () => {
      socketService.off(event, handler);
    };
  }, deps);
};

// Hook for real-time message updates
export const useSocketMessages = (conversationId?: string) => {
  const [messages, setMessages] = React.useState<SocketMessage[]>([]);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

  // Handle new messages
  useSocketEvent<{ message: SocketMessage; conversationId: string }>('new_message', (data) => {
    if (!conversationId || data.conversationId === conversationId) {
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(msg => msg._id === data.message._id);
        if (exists) return prev;
        
        return [...prev, data.message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
  });

  // Handle message status updates
  useSocketEvent<{ messageId: string; deliveredAt: string }>('message_delivered', (data) => {
    setMessages(prev => prev.map(msg => 
      msg._id === data.messageId 
        ? { ...msg, status: 'delivered' as const }
        : msg
    ));
  });

  useSocketEvent<{ messageId: string; readAt: string }>('message_read', (data) => {
    setMessages(prev => prev.map(msg => 
      msg._id === data.messageId 
        ? { ...msg, status: 'read' as const }
        : msg
    ));
  });

  // Handle message sent confirmation
  useSocketEvent<{ tempId: string; message: SocketMessage }>('message_sent', (data) => {
    if (data.tempId) {
      setMessages(prev => prev.map(msg => 
        msg.tempId === data.tempId 
          ? { ...data.message }
          : msg
      ));
    }
  });

  // Handle typing indicators
  useSocketEvent<TypingEvent>('user_typing', (data) => {
    if (!conversationId || data.conversationId === conversationId) {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.userId) ? prev : [...prev, data.userId];
        } else {
          return prev.filter(userId => userId !== data.userId);
        }
      });
    }
  });

  // Auto-join conversation when conversationId changes
  useEffect(() => {
    if (conversationId && socketService.isConnected) {
      socketService.joinConversation(conversationId);
      
      return () => {
        socketService.leaveConversation(conversationId);
      };
    }
  }, [conversationId]);

  const addOptimisticMessage = useCallback((message: Partial<SocketMessage> & { tempId: string }) => {
    const optimisticMessage: SocketMessage = {
      _id: message.tempId,
      conversationId: conversationId || '',
      senderId: message.senderId || '',
      messageType: message.messageType || 'text',
      content: message.content || '',
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tempId: message.tempId,
      ...message,
    };

    setMessages(prev => [...prev, optimisticMessage]);
  }, [conversationId]);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
  }, []);

  return {
    messages,
    typingUsers,
    addOptimisticMessage,
    removeOptimisticMessage,
    setMessages,
  };
};

export default useSocket;
