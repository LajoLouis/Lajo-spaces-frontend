export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  isRead: boolean;
  isDelivered: boolean;
  attachments?: MessageAttachment[];
  replyTo?: string; // Message ID being replied to
  isEdited: boolean;
  editedAt?: Date;
}

export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
  propertyId?: string; // If conversation is about a specific property
  propertyTitle?: string;
  conversationType: ConversationType;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: DeliveryStatus;
  timestamp: Date;
}

export interface ConversationPreview {
  conversation: Conversation;
  lastMessage?: Message;
  unreadCount: number;
  otherParticipant: User;
}

// Enums
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  PROPERTY_INQUIRY = 'property_inquiry',
  SYSTEM = 'system',
  EMOJI = 'emoji'
}

export enum AttachmentType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export enum ConversationType {
  DIRECT = 'direct',
  PROPERTY_INQUIRY = 'property_inquiry',
  GROUP = 'group'
}

export enum DeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// API Response Types
export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    hasMore: boolean;
    totalCount: number;
    page: number;
  };
  message?: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: ConversationPreview[];
    hasMore: boolean;
    totalCount: number;
    page: number;
  };
  message?: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  receiverId?: string;
  content: string;
  type: MessageType;
  attachments?: MessageAttachment[];
  propertyId?: string;
  replyTo?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: Message;
  message?: string;
}

export interface CreateConversationRequest {
  participantId: string;
  propertyId?: string;
  initialMessage?: string;
  type: ConversationType;
}

export interface CreateConversationResponse {
  success: boolean;
  data: Conversation;
  message?: string;
}

// Search and Filter Types
export interface MessageSearchFilters {
  query?: string;
  conversationId?: string;
  senderId?: string;
  messageType?: MessageType;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
  isUnread?: boolean;
}

export interface ConversationFilters {
  isArchived?: boolean;
  isMuted?: boolean;
  hasUnread?: boolean;
  conversationType?: ConversationType;
  propertyId?: string;
}

// Real-time Event Types
export interface MessageEvent {
  type: 'message_received' | 'message_read' | 'message_delivered' | 'typing_start' | 'typing_stop' | 'user_online' | 'user_offline';
  data: Message | TypingIndicator | User;
  timestamp: Date;
}

// Form Types
export interface MessageFormData {
  content: string;
  attachments: File[];
  replyTo?: string;
}

export interface ConversationFormData {
  participantId: string;
  propertyId?: string;
  initialMessage: string;
  type: ConversationType;
}

// UI State Types
export interface MessagingUIState {
  activeConversationId?: string;
  isTyping: boolean;
  typingUsers: TypingIndicator[];
  selectedMessages: string[];
  searchQuery: string;
  isSearchMode: boolean;
  showEmojiPicker: boolean;
  showAttachmentMenu: boolean;
}

// Notification Types
export interface MessageNotification {
  id: string;
  type: 'new_message' | 'message_read' | 'conversation_created';
  title: string;
  body: string;
  conversationId: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
  action?: {
    type: 'open_conversation' | 'mark_read';
    data: any;
  };
}
