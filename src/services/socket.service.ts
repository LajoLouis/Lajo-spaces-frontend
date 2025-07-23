import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface SocketUser {
  userId: string;
  socketId: string;
  lastSeen: Date;
  status: 'online' | 'away' | 'busy' | 'offline';
}

export interface SocketMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  messageType: 'text' | 'image' | 'file' | 'location';
  content: string;
  metadata?: any;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
  tempId?: string;
}

export interface TypingEvent {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface MessageReaction {
  messageId: string;
  userId: string;
  reaction: string;
  reactions: Record<string, string[]>;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
  };
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    this.setupEventListeners();
  }

  // Connection Management
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.connectionStatus.isConnecting = true;
    this.connectionStatus.error = undefined;

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
    });

    this.setupSocketEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus.isConnected = false;
    this.connectionStatus.isConnecting = false;
    this.clearReconnectTimer();
  }

  private setupSocketEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.connectionStatus.isConnected = true;
      this.connectionStatus.isConnecting = false;
      this.connectionStatus.lastConnected = new Date();
      this.connectionStatus.reconnectAttempts = 0;
      this.clearReconnectTimer();
      
      this.emit('connection_status_changed', this.connectionStatus);
      toast.success('Connected to real-time messaging');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connectionStatus.isConnected = false;
      this.connectionStatus.isConnecting = false;
      
      this.emit('connection_status_changed', this.connectionStatus);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        toast.error('Disconnected from server');
      } else {
        // Client-side disconnect, attempt to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.connectionStatus.isConnecting = false;
      this.connectionStatus.error = error.message;
      
      this.emit('connection_status_changed', this.connectionStatus);
      this.attemptReconnect();
    });

    // Message events
    this.socket.on('new_message', (data) => {
      console.log('📨 New message received:', data);
      this.emit('new_message', data);

      // Emit notification event
      this.emit('notification_event', {
        type: 'message',
        data: data
      });
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ Message sent confirmation:', data);
      this.emit('message_sent', data);
    });

    this.socket.on('message_delivered', (data) => {
      console.log('📬 Message delivered:', data);
      this.emit('message_delivered', data);
    });

    this.socket.on('message_read', (data) => {
      console.log('👁️ Message read:', data);
      this.emit('message_read', data);
    });

    this.socket.on('message_reaction', (data) => {
      console.log('😊 Message reaction:', data);
      this.emit('message_reaction', data);
    });

    // Conversation events
    this.socket.on('conversation_created', (data) => {
      console.log('💬 Conversation created:', data);
      this.emit('conversation_created', data);
    });

    this.socket.on('conversation_joined', (data) => {
      console.log('🚪 Conversation joined:', data);
      this.emit('conversation_joined', data);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      this.emit('user_typing', data);
    });

    // Status events
    this.socket.on('user_status_changed', (data) => {
      console.log('🟢 User status changed:', data);
      this.emit('user_status_changed', data);
    });

    this.socket.on('online_users', (data) => {
      console.log('👥 Online users:', data);
      this.emit('online_users', data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.emit('socket_error', error);
      toast.error(error.message || 'Socket error occurred');
    });
  }

  private attemptReconnect(): void {
    if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');
      toast.error('Unable to reconnect. Please refresh the page.');
      return;
    }

    this.connectionStatus.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts - 1);

    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.connectionStatus.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.connectionStatus.isConnected) {
        const token = localStorage.getItem('lajospaces_token');
        if (token) {
          this.connect(token);
        }
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Message Methods
  sendMessage(data: {
    conversationId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'location';
    metadata?: any;
    tempId?: string;
  }): void {
    if (!this.socket?.connected) {
      toast.error('Not connected to messaging service');
      return;
    }

    this.socket.emit('send_message', {
      conversationId: data.conversationId,
      content: data.content,
      messageType: data.messageType || 'text',
      metadata: data.metadata,
      tempId: data.tempId,
    });
  }

  markMessageAsDelivered(messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('message_delivered', { messageId });
  }

  markMessageAsRead(messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('message_read', { messageId });
  }

  reactToMessage(messageId: string, reaction: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('react_to_message', { messageId, reaction });
  }

  // Conversation Methods
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_conversation', { conversationId });
  }

  createConversation(data: {
    participantIds: string[];
    conversationType: 'direct' | 'group' | 'support';
    title?: string;
    description?: string;
  }): void {
    if (!this.socket?.connected) return;
    this.socket.emit('create_conversation', data);
  }

  // Typing Methods
  startTyping(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  // Status Methods
  changeStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    if (!this.socket?.connected) return;
    this.socket.emit('status_change', { status });
  }

  // Event Management
  private setupEventListeners(): void {
    // Initialize event listeners map
    this.eventListeners.clear();
  }

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
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.connectionStatus.isConnected;
  }

  get status(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// Create and export singleton instance
export const socketService = new SocketService();
export default socketService;
