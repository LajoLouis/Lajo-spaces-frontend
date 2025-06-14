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
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    conversation,
    isLoading,
    error,
    typingIndicators,
    sendMessage,
    loadMessages,
    markAsRead
  } = useActiveConversation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      markAsRead(conversationId);
    }
  }, [conversationId, messages, markAsRead]);

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      // Start typing indicator would go here
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Stop typing indicator would go here
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    try {
      await sendMessage({
        conversationId,
        content: messageText.trim(),
        type: MessageType.TEXT
      });
      
      setMessageText('');
      setIsTyping(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Focus input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFilesUploaded = async (files: FileUploadResult[]) => {
    try {
      // Send each file as a separate message
      for (const file of files) {
        await sendMessage({
          conversationId,
          content: file.name,
          type: MessageType.FILE,
          attachments: [{
            id: file.id,
            type: file.type,
            url: file.url,
            name: file.name,
            size: file.size,
            mimeType: file.mimeType
          }]
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
  const currentTypingUsers = typingIndicators.filter(t => 
    t.conversationId === conversationId && t.isTyping
  );

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
            
            <p className="text-sm text-gray-600">
              {otherParticipant.isOnline ? (
                'Online'
              ) : (
                `Last seen ${formatDistanceToNow(otherParticipant.lastSeen, { addSuffix: true })}`
              )}
            </p>
            
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
            users={currentTypingUsers.map(t => otherParticipant)}
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
