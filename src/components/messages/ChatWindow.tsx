import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';
import { useActiveConversation } from '@/stores/messageStore';
import { MessageType } from '@/types/message.types';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { TypingIndicator } from '@/components/messages/TypingIndicator';
import { FileUploadModal } from '@/components/messages/FileUploadModal';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUploadResult } from '@/utils/fileUpload';
import { useSocketMessages, useSocketMessaging, useSocketTyping } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { ConnectionStatusIndicator } from '@/components/providers/SocketProvider';

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
  isMobile: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBack,
  isMobile
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Real-time messaging hooks
  const {
    messages: realtimeMessages,
    typingUsers,
    addOptimisticMessage,
    removeOptimisticMessage,
  } = useSocketMessages(conversationId);

  const {
    sendMessage: sendSocketMessage,
    markAsRead: markSocketAsRead,
    joinConversation,
    leaveConversation,
  } = useSocketMessaging();

  const { startTyping, stopTyping } = useSocketTyping();

  // Fallback to store-based messaging for loading initial messages
  const {
    messages: storeMessages,
    conversation,
    isLoading,
    error,
    loadMessages,
  } = useActiveConversation();

  // Combine real-time and store messages, prioritizing real-time
  const messages = realtimeMessages.length > 0 ? realtimeMessages : storeMessages;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial messages and join conversation when conversation changes
  useEffect(() => {
    if (conversationId) {
      // Load initial messages from API
      loadMessages(conversationId);

      // Join real-time conversation
      joinConversation(conversationId);

      return () => {
        // Leave conversation when component unmounts or conversation changes
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, loadMessages, joinConversation, leaveConversation]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // Mark latest unread messages as read
      const unreadMessages = messages.filter(msg =>
        msg.senderId !== user?.id && msg.status !== 'read'
      );

      unreadMessages.forEach(msg => {
        markSocketAsRead(msg._id);
      });
    }
  }, [conversationId, messages, markSocketAsRead, user?.id]);

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (!isTyping && conversationId) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (conversationId) {
        stopTyping(conversationId);
      }
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !conversationId || !user?.id) return;

    const content = messageText.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    // Clear input immediately for better UX
    setMessageText('');
    setIsTyping(false);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      stopTyping(conversationId);
    }

    try {
      // Add optimistic message for immediate UI feedback
      addOptimisticMessage({
        tempId,
        conversationId,
        senderId: user.id,
        content,
        messageType: 'text',
        status: 'sent',
      });

      // Send message via Socket.IO
      sendSocketMessage({
        conversationId,
        content,
        messageType: 'text',
        tempId,
      });

      // Focus input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      removeOptimisticMessage(tempId);
      // Restore message text
      setMessageText(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFilesUploaded = async (files: FileUploadResult[]) => {
    if (!conversationId || !user?.id) return;

    try {
      // Send each file as a separate message via Socket.IO
      for (const file of files) {
        const tempId = `temp_${Date.now()}_${Math.random()}`;

        // Add optimistic message
        addOptimisticMessage({
          tempId,
          conversationId,
          senderId: user.id,
          content: file.name,
          messageType: file.type.startsWith('image/') ? 'image' : 'file',
          metadata: {
            attachment: {
              id: file.id,
              type: file.type,
              url: file.url,
              name: file.name,
              size: file.size,
              mimeType: file.mimeType
            }
          },
          status: 'sent',
        });

        // Send via Socket.IO
        sendSocketMessage({
          conversationId,
          content: file.name,
          messageType: file.type.startsWith('image/') ? 'image' : 'file',
          metadata: {
            attachment: {
              id: file.id,
              type: file.type,
              url: file.url,
              name: file.name,
              size: file.size,
              mimeType: file.mimeType
            }
          },
          tempId,
        });
      }
    } catch (error) {
      console.error('Failed to send file messages:', error);
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: typeof messages } = {};
    
    messages.forEach(message => {
      const date = format(message.timestamp, 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.otherParticipant;
  const messageGroups = groupMessagesByDate();

  // Filter typing users to exclude current user
  const currentTypingUsers = typingUsers.filter(userId => userId !== user?.id);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* Back Button (Mobile) */}
          {isMobile && onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherParticipant.avatar} />
              <AvatarFallback>
                {otherParticipant.firstName[0]}{otherParticipant.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            {/* Online Status */}
            {otherParticipant.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          {/* User Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                {otherParticipant.firstName} {otherParticipant.lastName}
              </h3>
              {otherParticipant.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">
                {otherParticipant.isOnline ? (
                'Online'
              ) : (
                `Last seen ${formatDistanceToNow(otherParticipant.lastSeen, { addSuffix: true })}`
              )}
              </p>
              <ConnectionStatusIndicator className="text-xs" />
            </div>
            
            {/* Property Info */}
            {conversation.conversation.propertyTitle && (
              <p className="text-xs text-blue-600">
                📍 {conversation.conversation.propertyTitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {!isMobile && (
            <>
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm">
            <Info className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="flex items-end space-x-2 max-w-xs">
                  {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full" />}
                  <Skeleton className="h-12 w-48 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Messages
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDateHeader(date)}
                </div>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-2">
                {dateMessages.map((message, index) => {
                  const isCurrentUser = message.senderId === 'user-1'; // Current user ID
                  const showAvatar = !isCurrentUser && (
                    index === 0 || 
                    dateMessages[index - 1].senderId !== message.senderId
                  );
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isCurrentUser={isCurrentUser}
                      showAvatar={showAvatar}
                      otherParticipant={otherParticipant}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {currentTypingUsers.length > 0 && (
          <TypingIndicator
            users={[otherParticipant]}
          />
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          {/* Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-1"
            onClick={() => setShowFileUpload(true)}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          {/* Message Input */}
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="resize-none"
              autoFocus
            />
          </div>
          
          {/* Emoji Button */}
          <Button type="button" variant="ghost" size="sm" className="mb-1">
            <Smile className="w-4 h-4" />
          </Button>
          
          {/* Send Button */}
          <Button 
            type="submit" 
            disabled={!messageText.trim()}
            className="mb-1"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFilesUploaded={handleFilesUploaded}
      />
    </div>
  );
};
