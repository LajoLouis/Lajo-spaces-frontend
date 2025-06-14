import {
  Message,
  Conversation,
  ConversationPreview,
  User,
  MessageType,
  ConversationType,
  DeliveryStatus,
  MessagesResponse,
  ConversationsResponse,
  SendMessageRequest,
  SendMessageResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  MessageSearchFilters,
  ConversationFilters,
  TypingIndicator,
  MessageEvent
} from '@/types/message.types';

// Mock users for messaging
const mockUsers: User[] = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
    isVerified: true
  },
  {
    id: 'user-2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isVerified: true
  },
  {
    id: 'user-3',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
    isVerified: false
  },
  {
    id: 'user-4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isVerified: true
  }
];

// Mock conversations
let mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [mockUsers[0], mockUsers[1]],
    unreadCount: 2,
    isArchived: false,
    isMuted: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    propertyId: 'prop-1',
    propertyTitle: 'Modern Downtown Apartment',
    conversationType: ConversationType.PROPERTY_INQUIRY
  },
  {
    id: 'conv-2',
    participants: [mockUsers[0], mockUsers[2]],
    unreadCount: 0,
    isArchived: false,
    isMuted: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    conversationType: ConversationType.DIRECT
  },
  {
    id: 'conv-3',
    participants: [mockUsers[0], mockUsers[3]],
    unreadCount: 1,
    isArchived: false,
    isMuted: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    propertyId: 'prop-2',
    propertyTitle: 'Cozy Mission District Studio',
    conversationType: ConversationType.PROPERTY_INQUIRY
  }
];

// Mock messages
let mockMessages: Message[] = [
  // Conversation 1 messages
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Hi! I saw your listing for the downtown apartment. Is it still available?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
    isDelivered: true,
    isEdited: false
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    content: 'Yes, it\'s still available! Would you like to schedule a viewing?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
    isRead: true,
    isDelivered: true,
    isEdited: false
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'That would be great! I\'m available this weekend. What times work for you?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
    isRead: true,
    isDelivered: true,
    isEdited: false
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    content: 'How about Saturday at 2 PM? I can show you around the neighborhood too.',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isRead: false,
    isDelivered: true,
    isEdited: false
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    content: 'Let me know if you have any other questions!',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 9 * 60 * 1000),
    isRead: false,
    isDelivered: true,
    isEdited: false
  },

  // Conversation 2 messages
  {
    id: 'msg-6',
    conversationId: 'conv-2',
    senderId: 'user-3',
    receiverId: 'user-1',
    content: 'Hey! Are you still looking for a roommate?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
    isDelivered: true,
    isEdited: false
  },
  {
    id: 'msg-7',
    conversationId: 'conv-2',
    senderId: 'user-1',
    receiverId: 'user-3',
    content: 'Yes! I have a place in the Mission. Want to chat about it?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    isDelivered: true,
    isEdited: false
  },

  // Conversation 3 messages
  {
    id: 'msg-8',
    conversationId: 'conv-3',
    senderId: 'user-4',
    receiverId: 'user-1',
    content: 'Hi! I\'m interested in your studio listing. Could you tell me more about the lease terms?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isRead: true,
    isDelivered: true,
    isEdited: false
  },
  {
    id: 'msg-9',
    conversationId: 'conv-3',
    senderId: 'user-1',
    receiverId: 'user-4',
    content: 'Sure! It\'s a 12-month lease, $2,200/month including utilities. Pet-friendly too!',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    isRead: true,
    isDelivered: true,
    isEdited: false
  },
  {
    id: 'msg-10',
    conversationId: 'conv-3',
    senderId: 'user-4',
    receiverId: 'user-1',
    content: 'Perfect! I have a cat. When can I see the place?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    isDelivered: true,
    isEdited: false
  }
];

// Current user (for demo purposes)
const currentUserId = 'user-1';

// Typing indicators
let typingIndicators: TypingIndicator[] = [];

// Event listeners for real-time simulation
let eventListeners: ((event: MessageEvent) => void)[] = [];

class MockMessageService {
  // Get conversations for current user
  async getConversations(filters?: ConversationFilters, page = 1, limit = 20): Promise<ConversationsResponse> {
    await this.simulateDelay();

    let filteredConversations = mockConversations.filter(conv => 
      conv.participants.some(p => p.id === currentUserId)
    );

    // Apply filters
    if (filters) {
      if (filters.isArchived !== undefined) {
        filteredConversations = filteredConversations.filter(conv => conv.isArchived === filters.isArchived);
      }
      if (filters.isMuted !== undefined) {
        filteredConversations = filteredConversations.filter(conv => conv.isMuted === filters.isMuted);
      }
      if (filters.hasUnread !== undefined) {
        filteredConversations = filteredConversations.filter(conv => 
          filters.hasUnread ? conv.unreadCount > 0 : conv.unreadCount === 0
        );
      }
      if (filters.conversationType) {
        filteredConversations = filteredConversations.filter(conv => conv.conversationType === filters.conversationType);
      }
      if (filters.propertyId) {
        filteredConversations = filteredConversations.filter(conv => conv.propertyId === filters.propertyId);
      }
    }

    // Sort by last updated
    filteredConversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConversations = filteredConversations.slice(startIndex, endIndex);

    // Create conversation previews
    const conversationPreviews: ConversationPreview[] = paginatedConversations.map(conv => {
      const lastMessage = mockMessages
        .filter(msg => msg.conversationId === conv.id)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      const otherParticipant = conv.participants.find(p => p.id !== currentUserId) || conv.participants[0];

      return {
        conversation: conv,
        lastMessage,
        unreadCount: conv.unreadCount,
        otherParticipant
      };
    });

    return {
      success: true,
      data: {
        conversations: conversationPreviews,
        hasMore: endIndex < filteredConversations.length,
        totalCount: filteredConversations.length,
        page
      }
    };
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    await this.simulateDelay();

    const conversationMessages = mockMessages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Pagination (reverse for chat - newest first in UI)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = conversationMessages.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        messages: paginatedMessages,
        hasMore: endIndex < conversationMessages.length,
        totalCount: conversationMessages.length,
        page
      }
    };
  }

  // Send a message
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    await this.simulateDelay(500);

    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date();

    // Create conversation if it doesn't exist
    let conversationId = request.conversationId;
    if (!conversationId && request.receiverId) {
      const newConv = await this.createConversation({
        participantId: request.receiverId,
        propertyId: request.propertyId,
        type: request.propertyId ? ConversationType.PROPERTY_INQUIRY : ConversationType.DIRECT
      });
      conversationId = newConv.data.id;
    }

    if (!conversationId) {
      throw new Error('No conversation ID provided');
    }

    const newMessage: Message = {
      id: messageId,
      conversationId,
      senderId: currentUserId,
      receiverId: request.receiverId || '',
      content: request.content,
      type: request.type,
      timestamp,
      isRead: false,
      isDelivered: true,
      attachments: request.attachments?.map(attachment => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: attachment.type,
        url: attachment.url,
        name: attachment.name,
        size: attachment.size,
        mimeType: attachment.mimeType
      })),
      isEdited: false
    };

    // Add to mock messages
    mockMessages.push(newMessage);

    // Update conversation
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.updatedAt = timestamp;
      conversation.lastMessage = newMessage;
    }

    // Don't emit real-time event for current user's own messages
    // The UI will handle the optimistic update

    return {
      success: true,
      data: newMessage
    };
  }

  // Create a new conversation
  async createConversation(request: CreateConversationRequest): Promise<CreateConversationResponse> {
    await this.simulateDelay();

    const conversationId = `conv-${Date.now()}`;
    const timestamp = new Date();

    const otherUser = mockUsers.find(u => u.id === request.participantId);
    if (!otherUser) {
      throw new Error('User not found');
    }

    const currentUser = mockUsers.find(u => u.id === currentUserId);
    if (!currentUser) {
      throw new Error('Current user not found');
    }

    const newConversation: Conversation = {
      id: conversationId,
      participants: [currentUser, otherUser],
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      propertyId: request.propertyId,
      conversationType: request.type
    };

    mockConversations.push(newConversation);

    // Send initial message if provided
    if (request.initialMessage) {
      await this.sendMessage({
        conversationId,
        content: request.initialMessage,
        type: MessageType.TEXT
      });
    }

    return {
      success: true,
      data: newConversation
    };
  }

  // Mark messages as read
  async markAsRead(conversationId: string, messageIds?: string[]): Promise<{ success: boolean }> {
    await this.simulateDelay(200);

    const messagesToUpdate = messageIds 
      ? mockMessages.filter(msg => messageIds.includes(msg.id))
      : mockMessages.filter(msg => msg.conversationId === conversationId && msg.receiverId === currentUserId);

    messagesToUpdate.forEach(msg => {
      msg.isRead = true;
    });

    // Update conversation unread count
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }

    return { success: true };
  }

  // Search messages
  async searchMessages(filters: MessageSearchFilters, page = 1, limit = 20): Promise<MessagesResponse> {
    await this.simulateDelay();

    let filteredMessages = mockMessages;

    if (filters.query) {
      filteredMessages = filteredMessages.filter(msg => 
        msg.content.toLowerCase().includes(filters.query!.toLowerCase())
      );
    }

    if (filters.conversationId) {
      filteredMessages = filteredMessages.filter(msg => msg.conversationId === filters.conversationId);
    }

    if (filters.senderId) {
      filteredMessages = filteredMessages.filter(msg => msg.senderId === filters.senderId);
    }

    if (filters.messageType) {
      filteredMessages = filteredMessages.filter(msg => msg.type === filters.messageType);
    }

    if (filters.isUnread !== undefined) {
      filteredMessages = filteredMessages.filter(msg => 
        filters.isUnread ? !msg.isRead : msg.isRead
      );
    }

    // Sort by timestamp
    filteredMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        messages: paginatedMessages,
        hasMore: endIndex < filteredMessages.length,
        totalCount: filteredMessages.length,
        page
      }
    };
  }

  // Simulate typing
  async startTyping(conversationId: string): Promise<void> {
    const typingIndicator: TypingIndicator = {
      conversationId,
      userId: currentUserId,
      isTyping: true,
      timestamp: new Date()
    };

    typingIndicators = typingIndicators.filter(t => 
      !(t.conversationId === conversationId && t.userId === currentUserId)
    );
    typingIndicators.push(typingIndicator);

    this.emitEvent({
      type: 'typing_start',
      data: typingIndicator,
      timestamp: new Date()
    });
  }

  async stopTyping(conversationId: string): Promise<void> {
    typingIndicators = typingIndicators.filter(t => 
      !(t.conversationId === conversationId && t.userId === currentUserId)
    );

    this.emitEvent({
      type: 'typing_stop',
      data: {
        conversationId,
        userId: currentUserId,
        isTyping: false,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  }

  // Get typing indicators for a conversation
  getTypingIndicators(conversationId: string): TypingIndicator[] {
    return typingIndicators.filter(t => 
      t.conversationId === conversationId && t.userId !== currentUserId
    );
  }

  // Real-time event simulation
  addEventListener(callback: (event: MessageEvent) => void): void {
    eventListeners.push(callback);
  }

  removeEventListener(callback: (event: MessageEvent) => void): void {
    eventListeners = eventListeners.filter(listener => listener !== callback);
  }

  private emitEvent(event: MessageEvent): void {
    eventListeners.forEach(listener => listener(event));
  }

  // Get user by ID
  getUserById(userId: string): User | undefined {
    return mockUsers.find(u => u.id === userId);
  }

  // Get current user
  getCurrentUser(): User | undefined {
    return mockUsers.find(u => u.id === currentUserId);
  }

  // Utility methods
  private async simulateDelay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Archive/unarchive conversation
  async archiveConversation(conversationId: string, archive = true): Promise<{ success: boolean }> {
    await this.simulateDelay(200);

    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.isArchived = archive;
    }

    return { success: true };
  }

  // Mute/unmute conversation
  async muteConversation(conversationId: string, mute = true): Promise<{ success: boolean }> {
    await this.simulateDelay(200);

    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.isMuted = mute;
    }

    return { success: true };
  }

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    await this.simulateDelay(300);

    mockConversations = mockConversations.filter(c => c.id !== conversationId);
    mockMessages = mockMessages.filter(m => m.conversationId !== conversationId);

    return { success: true };
  }

  // Simulate real-time message delivery (for demo)
  simulateIncomingMessage(conversationId: string, senderId: string, content: string): void {
    setTimeout(() => {
      const messageId = `msg-${Date.now()}-incoming`;
      const timestamp = new Date();

      const incomingMessage: Message = {
        id: messageId,
        conversationId,
        senderId,
        receiverId: currentUserId,
        content,
        type: MessageType.TEXT,
        timestamp,
        isRead: false,
        isDelivered: true,
        isEdited: false
      };

      mockMessages.push(incomingMessage);

      // Update conversation
      const conversation = mockConversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.updatedAt = timestamp;
        conversation.lastMessage = incomingMessage;
        conversation.unreadCount += 1;
      }

      // Emit real-time event
      this.emitEvent({
        type: 'message_received',
        data: incomingMessage,
        timestamp
      });
    }, Math.random() * 3000 + 1000); // Random delay 1-4 seconds
  }

  // Get mock data for development
  getMockConversations(): Conversation[] {
    return mockConversations;
  }

  getMockMessages(): Message[] {
    return mockMessages;
  }

  getMockUsers(): User[] {
    return mockUsers;
  }
}

export const mockMessageService = new MockMessageService();
