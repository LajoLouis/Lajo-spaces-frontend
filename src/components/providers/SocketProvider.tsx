import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { socketService, ConnectionStatus, SocketUser } from '@/services/socket.service';
import { toast } from 'sonner';

interface SocketContextType {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  onlineUsers: SocketUser[];
  connect: () => void;
  disconnect: () => void;
  socketId?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  autoConnect = true 
}) => {
  const { user, token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
  });
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
  const [socketId, setSocketId] = useState<string | undefined>();

  // Connection management
  const connect = React.useCallback(() => {
    if (token && isAuthenticated) {
      console.log('🔌 SocketProvider: Initiating connection...');
      socketService.connect(token);
    }
  }, [token, isAuthenticated]);

  const disconnect = React.useCallback(() => {
    console.log('🔌 SocketProvider: Disconnecting...');
    socketService.disconnect();
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (autoConnect && isAuthenticated && token && !isConnected) {
      console.log('🔌 SocketProvider: Auto-connecting...');
      connect();
    }

    // Disconnect when user logs out
    if (!isAuthenticated && isConnected) {
      console.log('🔌 SocketProvider: User logged out, disconnecting...');
      disconnect();
    }
  }, [autoConnect, isAuthenticated, token, isConnected, connect, disconnect]);

  // Setup socket event listeners
  useEffect(() => {
    const handleConnectionStatusChanged = (status: ConnectionStatus) => {
      console.log('🔌 SocketProvider: Connection status changed:', status);
      setConnectionStatus(status);
      setIsConnected(status.isConnected);
      setSocketId(socketService.socketId);

      // Show connection status toasts
      if (status.isConnected && status.reconnectAttempts > 0) {
        toast.success('Reconnected to real-time messaging');
      } else if (!status.isConnected && status.error && status.reconnectAttempts > 0) {
        toast.error('Connection lost. Attempting to reconnect...');
      }
    };

    const handleOnlineUsers = (users: SocketUser[]) => {
      console.log('👥 SocketProvider: Online users updated:', users.length);
      setOnlineUsers(users);
    };

    const handleUserStatusChanged = (data: { userId: string; status: string }) => {
      console.log('🟢 SocketProvider: User status changed:', data);
      setOnlineUsers(prev => prev.map(user => 
        user.userId === data.userId 
          ? { ...user, status: data.status as any }
          : user
      ));
    };

    const handleSocketError = (error: any) => {
      console.error('❌ SocketProvider: Socket error:', error);
      toast.error(error.message || 'Real-time connection error');
    };

    // Register event listeners
    socketService.on('connection_status_changed', handleConnectionStatusChanged);
    socketService.on('online_users', handleOnlineUsers);
    socketService.on('user_status_changed', handleUserStatusChanged);
    socketService.on('socket_error', handleSocketError);

    // Cleanup event listeners
    return () => {
      socketService.off('connection_status_changed', handleConnectionStatusChanged);
      socketService.off('online_users', handleOnlineUsers);
      socketService.off('user_status_changed', handleUserStatusChanged);
      socketService.off('socket_error', handleSocketError);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  const contextValue: SocketContextType = {
    isConnected,
    connectionStatus,
    onlineUsers,
    connect,
    disconnect,
    socketId,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket context
export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

// Connection status indicator component
export const ConnectionStatusIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { isConnected, connectionStatus } = useSocketContext();

  if (connectionStatus.isConnecting) {
    return (
      <div className={`flex items-center space-x-2 text-yellow-600 ${className}`}>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-xs">Connecting...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-xs">Offline</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      <span className="text-xs">Online</span>
    </div>
  );
};

// Online users indicator
export const OnlineUsersIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { onlineUsers } = useSocketContext();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-xs text-muted-foreground">
          {onlineUsers.length} online
        </span>
      </div>
    </div>
  );
};

export default SocketProvider;
