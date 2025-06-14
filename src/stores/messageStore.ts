import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Message,
  Conversation,
  ConversationPreview,
  User,
  TypingIndicator,
  MessageEvent,
  MessagingUIState,
  SendMessageRequest,
  CreateConversationRequest,
  MessageSearchFilters,
  ConversationFilters,
  MessageType
} from '@/types/message.types';
import { mockMessageService } from '@/services/mockMessage.service';
import { toast } from 'sonner';

interface MessageStore {
  // State
  conversations: ConversationPreview[];
  messages: { [conversationId: string]: Message[] };
  activeConversationId: string | null;
  typingIndicators: TypingIndicator[];
  isLoading: boolean;
  error: string | null;
  uiState: MessagingUIState;
  
  // Pagination
  conversationsPage: number;
  conversationsHasMore: boolean;
  messagesPage: { [conversationId: string]: number };
  messagesHasMore: { [conversationId: string]: boolean };

  // Actions
  loadConversations: (filters?: ConversationFilters, refresh?: boolean) => Promise<void>;
  loadMessages: (conversationId: string, refresh?: boolean) => Promise<void>;
  sendMessage: (request: SendMessageRequest) => Promise<void>;
  createConversation: (request: CreateConversationRequest) => Promise<string>;
  markAsRead: (conversationId: string, messageIds?: string[]) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  
  // Real-time
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  handleRealtimeEvent: (event: MessageEvent) => void;
  
  // UI Actions
  setSearchQuery: (query: string) => void;
  toggleSearchMode: () => void;
  setShowEmojiPicker: (show: boolean) => void;
  setShowAttachmentMenu: (show: boolean) => void;
  selectMessage: (messageId: string) => void;
  clearSelectedMessages: () => void;
  
  // Conversation management
  archiveConversation: (conversationId: string, archive?: boolean) => Promise<void>;
  muteConversation: (conversationId: string, mute?: boolean) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  
  // Search
  searchMessages: (filters: MessageSearchFilters) => Promise<void>;
  
  // Utility
  getConversationById: (conversationId: string) => ConversationPreview | undefined;
  getOtherParticipant: (conversation: Conversation) => User | undefined;
  getUnreadCount: () => number;
  clearError: () => void;
  reset: () => void;
}

const initialUIState: MessagingUIState = {
  activeConversationId: undefined,
  isTyping: false,
  typingUsers: [],
  selectedMessages: [],
  searchQuery: '',
  isSearchMode: false,
  showEmojiPicker: false,
  showAttachmentMenu: false
};

export const useMessageStore = create<MessageStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      conversations: [],
      messages: {},
      activeConversationId: null,
      typingIndicators: [],
      isLoading: false,
      error: null,
      uiState: initialUIState,
      conversationsPage: 1,
      conversationsHasMore: true,
      messagesPage: {},
      messagesHasMore: {},

      // Load conversations
      loadConversations: async (filters?: ConversationFilters, refresh = false) => {
        const state = get();
        
        if (refresh) {
          set({ conversations: [], conversationsPage: 1, conversationsHasMore: true });
        }

        set({ isLoading: true, error: null });

        try {
          const response = await mockMessageService.getConversations(
            filters,
            refresh ? 1 : state.conversationsPage,
            20
          );

          if (response.success) {
            const newConversations = refresh 
              ? response.data.conversations
              : [...state.conversations, ...response.data.conversations];

            set({
              conversations: newConversations,
              conversationsPage: response.data.page + 1,
              conversationsHasMore: response.data.hasMore,
              isLoading: false
            });
          } else {
            set({ error: response.message || 'Failed to load conversations', isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to load conversations', isLoading: false });
          toast.error('Failed to load conversations');
        }
      },

      // Load messages for a conversation
      loadMessages: async (conversationId: string, refresh = false) => {
        const state = get();
        
        if (refresh) {
          set({
            messages: { ...state.messages, [conversationId]: [] },
            messagesPage: { ...state.messagesPage, [conversationId]: 1 },
            messagesHasMore: { ...state.messagesHasMore, [conversationId]: true }
          });
        }

        set({ isLoading: true, error: null });

        try {
          const currentPage = state.messagesPage[conversationId] || 1;
          const response = await mockMessageService.getMessages(
            conversationId,
            refresh ? 1 : currentPage,
            50
          );

          if (response.success) {
            const existingMessages = state.messages[conversationId] || [];
            const newMessages = refresh 
              ? response.data.messages
              : [...existingMessages, ...response.data.messages];

            set({
              messages: { ...state.messages, [conversationId]: newMessages },
              messagesPage: { ...state.messagesPage, [conversationId]: response.data.page + 1 },
              messagesHasMore: { ...state.messagesHasMore, [conversationId]: response.data.hasMore },
              isLoading: false
            });

            // Mark messages as read when loading
            await mockMessageService.markAsRead(conversationId);
          } else {
            set({ error: response.message || 'Failed to load messages', isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to load messages', isLoading: false });
          toast.error('Failed to load messages');
        }
      },

      // Send a message
      sendMessage: async (request: SendMessageRequest) => {
        set({ error: null });

        try {
          const response = await mockMessageService.sendMessage(request);

          if (response.success) {
            const state = get();
            const conversationId = response.data.conversationId;

            // Add message to local state (optimistic update)
            const existingMessages = state.messages[conversationId] || [];
            const messageExists = existingMessages.some(msg => msg.id === response.data.id);

            if (!messageExists) {
              set({
                messages: {
                  ...state.messages,
                  [conversationId]: [...existingMessages, response.data]
                }
              });
            }

            // Update conversation in list
            const updatedConversations = state.conversations.map(conv => {
              if (conv.conversation.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: response.data,
                  conversation: {
                    ...conv.conversation,
                    updatedAt: response.data.timestamp
                  }
                };
              }
              return conv;
            });

            set({ conversations: updatedConversations });

            // Stop typing
            get().stopTyping(conversationId);

            // Simulate incoming response (for demo)
            if (Math.random() > 0.7) { // 30% chance of response
              const otherParticipant = get().getOtherParticipant(
                state.conversations.find(c => c.conversation.id === conversationId)?.conversation!
              );

              if (otherParticipant) {
                const responses = [
                  "Thanks for reaching out!",
                  "Let me get back to you on that.",
                  "Sounds good to me!",
                  "I'll check and let you know.",
                  "That works for me."
                ];

                setTimeout(() => {
                  mockMessageService.simulateIncomingMessage(
                    conversationId,
                    otherParticipant.id,
                    responses[Math.floor(Math.random() * responses.length)]
                  );
                }, 2000 + Math.random() * 3000);
              }
            }

          } else {
            set({ error: response.message || 'Failed to send message' });
            toast.error('Failed to send message');
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to send message' });
          toast.error('Failed to send message');
        }
      },

      // Create a new conversation
      createConversation: async (request: CreateConversationRequest): Promise<string> => {
        set({ error: null });

        try {
          const response = await mockMessageService.createConversation(request);

          if (response.success) {
            // Refresh conversations to include the new one
            await get().loadConversations(undefined, true);
            return response.data.id;
          } else {
            set({ error: response.message || 'Failed to create conversation' });
            toast.error('Failed to create conversation');
            throw new Error(response.message || 'Failed to create conversation');
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to create conversation' });
          toast.error('Failed to create conversation');
          throw error;
        }
      },

      // Mark messages as read
      markAsRead: async (conversationId: string, messageIds?: string[]) => {
        try {
          await mockMessageService.markAsRead(conversationId, messageIds);
          
          const state = get();
          
          // Update local message state
          const updatedMessages = state.messages[conversationId]?.map(msg => ({
            ...msg,
            isRead: messageIds ? messageIds.includes(msg.id) ? true : msg.isRead : true
          })) || [];

          // Update conversation unread count
          const updatedConversations = state.conversations.map(conv => {
            if (conv.conversation.id === conversationId) {
              return {
                ...conv,
                unreadCount: 0
              };
            }
            return conv;
          });

          set({
            messages: { ...state.messages, [conversationId]: updatedMessages },
            conversations: updatedConversations
          });
        } catch (error: any) {
          console.error('Failed to mark messages as read:', error);
        }
      },

      // Set active conversation
      setActiveConversation: (conversationId: string | null) => {
        set({ activeConversationId: conversationId });
        
        if (conversationId) {
          // Load messages if not already loaded
          const state = get();
          if (!state.messages[conversationId]) {
            get().loadMessages(conversationId);
          }
          
          // Mark as read
          get().markAsRead(conversationId);
        }
      },

      // Typing indicators
      startTyping: (conversationId: string) => {
        mockMessageService.startTyping(conversationId);
        set({
          uiState: { ...get().uiState, isTyping: true }
        });
      },

      stopTyping: (conversationId: string) => {
        mockMessageService.stopTyping(conversationId);
        set({
          uiState: { ...get().uiState, isTyping: false }
        });
      },

      // Handle real-time events
      handleRealtimeEvent: (event: MessageEvent) => {
        const state = get();

        switch (event.type) {
          case 'message_received':
            const message = event.data as Message;
            const currentUser = mockMessageService.getCurrentUser();

            // Don't handle real-time events for current user's own messages
            if (message.senderId === currentUser?.id) {
              break;
            }

            const existingMessages = state.messages[message.conversationId] || [];
            const messageExists = existingMessages.some(msg => msg.id === message.id);

            // Only add message if it doesn't already exist
            if (!messageExists) {
              set({
                messages: {
                  ...state.messages,
                  [message.conversationId]: [...existingMessages, message]
                }
              });

              // Update conversation list
              const updatedConversations = state.conversations.map(conv => {
                if (conv.conversation.id === message.conversationId) {
                  return {
                    ...conv,
                    lastMessage: message,
                    unreadCount: conv.unreadCount + 1,
                    conversation: {
                      ...conv.conversation,
                      updatedAt: message.timestamp
                    }
                  };
                }
                return conv;
              });

              set({ conversations: updatedConversations });

              // Show notification if not in active conversation
              if (state.activeConversationId !== message.conversationId) {
                const sender = mockMessageService.getUserById(message.senderId);
                if (sender) {
                  toast.info(`New message from ${sender.firstName} ${sender.lastName}`);
                }
              }
            }
            break;

          case 'typing_start':
          case 'typing_stop':
            const typingData = event.data as TypingIndicator;
            const currentTyping = state.typingIndicators.filter(t => 
              !(t.conversationId === typingData.conversationId && t.userId === typingData.userId)
            );
            
            if (event.type === 'typing_start') {
              set({ typingIndicators: [...currentTyping, typingData] });
            } else {
              set({ typingIndicators: currentTyping });
            }
            break;
        }
      },

      // UI Actions
      setSearchQuery: (query: string) => {
        set({
          uiState: { ...get().uiState, searchQuery: query }
        });
      },

      toggleSearchMode: () => {
        const currentState = get().uiState;
        set({
          uiState: {
            ...currentState,
            isSearchMode: !currentState.isSearchMode,
            searchQuery: currentState.isSearchMode ? '' : currentState.searchQuery
          }
        });
      },

      setShowEmojiPicker: (show: boolean) => {
        set({
          uiState: { ...get().uiState, showEmojiPicker: show }
        });
      },

      setShowAttachmentMenu: (show: boolean) => {
        set({
          uiState: { ...get().uiState, showAttachmentMenu: show }
        });
      },

      selectMessage: (messageId: string) => {
        const currentSelected = get().uiState.selectedMessages;
        const isSelected = currentSelected.includes(messageId);
        
        set({
          uiState: {
            ...get().uiState,
            selectedMessages: isSelected
              ? currentSelected.filter(id => id !== messageId)
              : [...currentSelected, messageId]
          }
        });
      },

      clearSelectedMessages: () => {
        set({
          uiState: { ...get().uiState, selectedMessages: [] }
        });
      },

      // Conversation management
      archiveConversation: async (conversationId: string, archive = true) => {
        try {
          await mockMessageService.archiveConversation(conversationId, archive);
          
          const state = get();
          const updatedConversations = state.conversations.map(conv => {
            if (conv.conversation.id === conversationId) {
              return {
                ...conv,
                conversation: { ...conv.conversation, isArchived: archive }
              };
            }
            return conv;
          });

          set({ conversations: updatedConversations });
          toast.success(archive ? 'Conversation archived' : 'Conversation unarchived');
        } catch (error: any) {
          toast.error('Failed to archive conversation');
        }
      },

      muteConversation: async (conversationId: string, mute = true) => {
        try {
          await mockMessageService.muteConversation(conversationId, mute);
          
          const state = get();
          const updatedConversations = state.conversations.map(conv => {
            if (conv.conversation.id === conversationId) {
              return {
                ...conv,
                conversation: { ...conv.conversation, isMuted: mute }
              };
            }
            return conv;
          });

          set({ conversations: updatedConversations });
          toast.success(mute ? 'Conversation muted' : 'Conversation unmuted');
        } catch (error: any) {
          toast.error('Failed to mute conversation');
        }
      },

      deleteConversation: async (conversationId: string) => {
        try {
          await mockMessageService.deleteConversation(conversationId);
          
          const state = get();
          const updatedConversations = state.conversations.filter(
            conv => conv.conversation.id !== conversationId
          );

          // Remove messages
          const updatedMessages = { ...state.messages };
          delete updatedMessages[conversationId];

          set({ 
            conversations: updatedConversations,
            messages: updatedMessages,
            activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
          });

          toast.success('Conversation deleted');
        } catch (error: any) {
          toast.error('Failed to delete conversation');
        }
      },

      // Search messages
      searchMessages: async (filters: MessageSearchFilters) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockMessageService.searchMessages(filters);
          
          if (response.success) {
            // Handle search results - could be displayed in a separate search view
            console.log('Search results:', response.data.messages);
            set({ isLoading: false });
          } else {
            set({ error: response.message || 'Search failed', isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message || 'Search failed', isLoading: false });
          toast.error('Search failed');
        }
      },

      // Utility functions
      getConversationById: (conversationId: string) => {
        return get().conversations.find(conv => conv.conversation.id === conversationId);
      },

      getOtherParticipant: (conversation: Conversation) => {
        const currentUser = mockMessageService.getCurrentUser();
        return conversation.participants.find(p => p.id !== currentUser?.id);
      },

      getUnreadCount: () => {
        return get().conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          typingIndicators: [],
          isLoading: false,
          error: null,
          uiState: initialUIState,
          conversationsPage: 1,
          conversationsHasMore: true,
          messagesPage: {},
          messagesHasMore: {}
        });
      }
    }),
    {
      name: 'message-store'
    }
  )
);

// Selectors for common use cases
export const useConversations = () => {
  const store = useMessageStore();
  return {
    conversations: store.conversations,
    isLoading: store.isLoading,
    error: store.error,
    hasMore: store.conversationsHasMore,
    loadConversations: store.loadConversations,
    getUnreadCount: store.getUnreadCount
  };
};

export const useActiveConversation = () => {
  const store = useMessageStore();
  return {
    activeConversationId: store.activeConversationId,
    messages: store.activeConversationId ? store.messages[store.activeConversationId] || [] : [],
    conversation: store.activeConversationId ? store.getConversationById(store.activeConversationId) : undefined,
    isLoading: store.isLoading,
    error: store.error,
    typingIndicators: store.typingIndicators,
    setActiveConversation: store.setActiveConversation,
    loadMessages: store.loadMessages,
    sendMessage: store.sendMessage,
    markAsRead: store.markAsRead
  };
};

export const useMessagingUI = () => {
  const store = useMessageStore();
  return {
    uiState: store.uiState,
    setSearchQuery: store.setSearchQuery,
    toggleSearchMode: store.toggleSearchMode,
    setShowEmojiPicker: store.setShowEmojiPicker,
    setShowAttachmentMenu: store.setShowAttachmentMenu,
    selectMessage: store.selectMessage,
    clearSelectedMessages: store.clearSelectedMessages
  };
};

export const useMessageActions = () => {
  const store = useMessageStore();
  return {
    sendMessage: store.sendMessage,
    createConversation: store.createConversation,
    archiveConversation: store.archiveConversation,
    muteConversation: store.muteConversation,
    deleteConversation: store.deleteConversation,
    startTyping: store.startTyping,
    stopTyping: store.stopTyping,
    searchMessages: store.searchMessages
  };
};
