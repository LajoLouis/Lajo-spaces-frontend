import { apiService } from './api.service';
import { mockMessageService } from './mockMessage.service';
import {
  Message,
  Conversation,
  ConversationPreview,
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
import { API_ENDPOINTS } from '@/types/api.types';

// Check if we should use mock service
const USE_MOCK_MESSAGES = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

class MessageService {
  // Get conversations for current user
  async getConversations(filters?: ConversationFilters, page = 1, limit = 20): Promise<ConversationsResponse> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.getConversations(filters, page, limit);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (filters?.type) {
      queryParams.append('type', filters.type);
    }
    if (filters?.isArchived !== undefined) {
      queryParams.append('archived', filters.isArchived.toString());
    }
    if (filters?.hasUnread !== undefined) {
      queryParams.append('hasUnread', filters.hasUnread.toString());
    }

    const response = await apiService.get<{
      conversations: any[],
      totalCount: number,
      hasMore: boolean
    }>(`${API_ENDPOINTS.MESSAGES.CONVERSATIONS}?${queryParams.toString()}`);

    if (response.success && response.data) {
      const transformedConversations = response.data.conversations.map(this.transformBackendConversation);
      
      return {
        success: response.success,
        data: {
          conversations: transformedConversations,
          totalCount: response.data.totalCount,
          hasMore: response.data.hasMore,
          page
        }
      };
    }

    throw new Error('Failed to fetch conversations');
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.getMessages(conversationId, page, limit);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await apiService.get<{
      messages: any[],
      totalCount: number,
      hasMore: boolean
    }>(`/conversations/${conversationId}/messages?${queryParams.toString()}`);

    if (response.success && response.data) {
      const transformedMessages = response.data.messages.map(this.transformBackendMessage);
      
      return {
        success: response.success,
        data: {
          messages: transformedMessages,
          hasMore: response.data.hasMore,
          totalCount: response.data.totalCount,
          page
        }
      };
    }

    throw new Error('Failed to fetch messages');
  }

  // Send a message
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.sendMessage(request);
    }

    const response = await apiService.post<{message: any}>(API_ENDPOINTS.MESSAGES.SEND, {
      conversationId: request.conversationId,
      receiverId: request.receiverId,
      content: request.content,
      messageType: request.type,
      metadata: request.attachments ? {
        attachments: request.attachments
      } : undefined,
      replyTo: request.replyTo
    });

    if (response.success && response.data.message) {
      const transformedMessage = this.transformBackendMessage(response.data.message);
      
      return {
        success: response.success,
        data: transformedMessage,
        message: response.message || 'Message sent successfully'
      };
    }

    throw new Error('Failed to send message');
  }

  // Create a new conversation
  async createConversation(request: CreateConversationRequest): Promise<CreateConversationResponse> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.createConversation(request);
    }

    // Transform to backend format
    const backendRequest = {
      participantIds: [request.participantId], // Backend expects array
      conversationType: request.type === 'direct' ? 'direct' : request.type, // Backend expects 'conversationType'
      propertyId: request.propertyId,
      title: request.initialMessage ? 'New Conversation' : undefined,
      description: request.initialMessage
    };

    const response = await apiService.post<{conversation: any}>('/conversations', backendRequest);

    if (response.success && response.data.conversation) {
      const transformedConversation = this.transformBackendConversation(response.data.conversation);
      
      return {
        success: response.success,
        data: transformedConversation,
        message: response.message || 'Conversation created successfully'
      };
    }

    throw new Error('Failed to create conversation');
  }

  // Mark messages as read
  async markAsRead(conversationId: string, messageIds?: string[]): Promise<{success: boolean, message: string}> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.markAsRead(conversationId, messageIds);
    }

    const response = await apiService.put(`${API_ENDPOINTS.MESSAGES.MARK_READ}/${conversationId}/read`, {
      messageIds
    });

    return {
      success: response.success,
      message: response.message || 'Messages marked as read'
    };
  }

  // Search messages
  async searchMessages(filters: MessageSearchFilters, page = 1, limit = 20): Promise<MessagesResponse> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.searchMessages(filters, page, limit);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (filters.query) queryParams.append('q', filters.query);
    if (filters.conversationId) queryParams.append('conversationId', filters.conversationId);
    if (filters.senderId) queryParams.append('senderId', filters.senderId);
    if (filters.messageType) queryParams.append('messageType', filters.messageType);

    const response = await apiService.get<{
      messages: any[],
      totalCount: number,
      hasMore: boolean
    }>(`/messages/search?${queryParams.toString()}`);

    if (response.success && response.data) {
      const transformedMessages = response.data.messages.map(this.transformBackendMessage);
      
      return {
        success: response.success,
        data: {
          messages: transformedMessages,
          hasMore: response.data.hasMore,
          totalCount: response.data.totalCount,
          page
        }
      };
    }

    throw new Error('Search failed');
  }

  // Archive/unarchive conversation
  async archiveConversation(conversationId: string, archive = true): Promise<{success: boolean, message: string}> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.archiveConversation(conversationId, archive);
    }

    const response = await apiService.put(`/conversations/${conversationId}/archive`, {
      archived: archive
    });

    return {
      success: response.success,
      message: response.message || `Conversation ${archive ? 'archived' : 'unarchived'} successfully`
    };
  }

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<{success: boolean, message: string}> {
    if (USE_MOCK_MESSAGES) {
      return mockMessageService.deleteConversation(conversationId);
    }

    const response = await apiService.delete(`/conversations/${conversationId}`);

    return {
      success: response.success,
      message: response.message || 'Conversation deleted successfully'
    };
  }

  // Transform backend message to frontend format
  private transformBackendMessage = (backendMessage: any): Message => {
    return {
      id: backendMessage._id || backendMessage.id,
      conversationId: backendMessage.conversationId,
      senderId: backendMessage.senderId?._id || backendMessage.senderId,
      receiverId: backendMessage.receiverId?._id || backendMessage.receiverId,
      content: backendMessage.content,
      type: backendMessage.messageType || backendMessage.type,
      timestamp: new Date(backendMessage.createdAt || backendMessage.timestamp),
      isRead: backendMessage.status === 'read' || backendMessage.isRead,
      isDelivered: ['delivered', 'read'].includes(backendMessage.status) || backendMessage.isDelivered,
      isEdited: backendMessage.isEdited || false,
      attachments: backendMessage.metadata?.attachments || backendMessage.attachments,
      replyTo: backendMessage.replyTo,
      reactions: backendMessage.reactions || []
    };
  };

  // Transform backend conversation to frontend format
  private transformBackendConversation = (backendConversation: any): Conversation => {
    return {
      id: backendConversation._id || backendConversation.id,
      participants: (backendConversation.participants || []).map((participant: any) => ({
        id: participant._id || participant.id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        avatar: participant.avatar || participant.profilePhoto,
        isOnline: participant.isOnline || false,
        lastSeen: participant.lastSeen ? new Date(participant.lastSeen) : undefined
      })),
      lastMessage: backendConversation.lastMessage ? this.transformBackendMessage(backendConversation.lastMessage) : undefined,
      unreadCount: backendConversation.unreadCount || 0,
      isArchived: backendConversation.isArchived || false,
      isMuted: backendConversation.isMuted || false,
      createdAt: new Date(backendConversation.createdAt),
      updatedAt: new Date(backendConversation.updatedAt),
      propertyId: backendConversation.propertyId,
      conversationType: backendConversation.type || 'direct'
    };
  };

  // Event listeners for real-time functionality (to be implemented with Socket.IO)
  addEventListener(callback: (event: MessageEvent) => void): void {
    if (USE_MOCK_MESSAGES) {
      mockMessageService.addEventListener(callback);
    }
    // TODO: Implement real Socket.IO event listeners
  }

  removeEventListener(callback: (event: MessageEvent) => void): void {
    if (USE_MOCK_MESSAGES) {
      mockMessageService.removeEventListener(callback);
    }
    // TODO: Implement real Socket.IO event listener removal
  }
}

// Create and export singleton instance
export const messageService = new MessageService();
export default messageService;
