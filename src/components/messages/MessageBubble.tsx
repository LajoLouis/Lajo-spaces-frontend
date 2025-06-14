import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  File,
  Home
} from 'lucide-react';
import { Message, User, MessageType } from '@/types/message.types';
import { FileAttachment, AudioAttachment } from '@/components/messages/FileAttachment';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
  otherParticipant: User;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showAvatar,
  otherParticipant
}) => {
  const getMessageStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    if (message.isRead) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (message.isDelivered) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case MessageType.TEXT:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
        
      case MessageType.IMAGE:
        return (
          <div className="space-y-2">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Image</span>
            </div>
            {message.content && (
              <div className="text-sm">{message.content}</div>
            )}
          </div>
        );
        
      case MessageType.FILE:
        return (
          <div className="space-y-2">
            {message.attachments && message.attachments.length > 0 ? (
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <FileAttachment
                    key={attachment.id}
                    attachment={attachment}
                    isOwnMessage={isCurrentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
                <File className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">File attachment</span>
              </div>
            )}
            {message.content && message.content !== message.attachments?.[0]?.name && (
              <div className="text-sm">{message.content}</div>
            )}
          </div>
        );
        
      case MessageType.PROPERTY_INQUIRY:
        return (
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Property Inquiry</span>
              </div>
              <div className="text-sm text-blue-800">
                {message.content}
              </div>
            </div>
          </div>
        );
        
      case MessageType.SYSTEM:
        return (
          <div className="text-center">
            <div className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {message.content}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
    }
  };

  // System messages are centered
  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="flex justify-center my-2">
        {renderMessageContent()}
      </div>
    );
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-end space-x-2 max-w-xs sm:max-w-md ${
        isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {/* Avatar */}
        {!isCurrentUser && (
          <div className="w-8 h-8 flex-shrink-0">
            {showAvatar ? (
              <Avatar className="w-8 h-8">
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback className="text-xs">
                  {otherParticipant.firstName[0]}{otherParticipant.lastName[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8" /> // Spacer
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div className="flex flex-col">
          {/* Sender Name (for other users, when showing avatar) */}
          {!isCurrentUser && showAvatar && (
            <div className="flex items-center space-x-2 mb-1 ml-2">
              <span className="text-xs font-medium text-gray-700">
                {otherParticipant.firstName}
              </span>
              {otherParticipant.isVerified && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  ✓
                </Badge>
              )}
            </div>
          )}

          {/* Message Content */}
          <div
            className={`relative px-4 py-2 rounded-2xl ${
              isCurrentUser
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            } ${message.type === MessageType.PROPERTY_INQUIRY ? 'p-2' : ''}`}
          >
            {renderMessageContent()}
            
            {/* Edited Indicator */}
            {message.isEdited && (
              <div className={`text-xs mt-1 ${
                isCurrentUser ? 'text-blue-200' : 'text-gray-500'
              }`}>
                (edited)
              </div>
            )}
          </div>

          {/* Message Info */}
          <div className={`flex items-center space-x-1 mt-1 px-2 ${
            isCurrentUser ? 'justify-end' : 'justify-start'
          }`}>
            {/* Timestamp */}
            <span className="text-xs text-gray-500">
              {format(message.timestamp, 'HH:mm')}
            </span>
            
            {/* Message Status */}
            {getMessageStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
