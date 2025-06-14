import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Archive, 
  VolumeX, 
  Trash2, 
  Home,
  MessageCircle,
  Clock,
  CheckCheck,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ConversationPreview, ConversationType, MessageType } from '@/types/message.types';
import { useMessageActions } from '@/stores/messageStore';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationListProps {
  conversations: ConversationPreview[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  isLoading: boolean;
  error: string | null;
  isMobile: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading,
  error,
  isMobile
}) => {
  const { archiveConversation, muteConversation, deleteConversation } = useMessageActions();

  const handleArchive = async (conversationId: string, isArchived: boolean) => {
    await archiveConversation(conversationId, !isArchived);
  };

  const handleMute = async (conversationId: string, isMuted: boolean) => {
    await muteConversation(conversationId, !isMuted);
  };

  const handleDelete = async (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId);
    }
  };

  const getMessagePreview = (conversation: ConversationPreview): string => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const { content, type, senderId } = conversation.lastMessage;
    const isCurrentUser = senderId === 'user-1'; // Current user ID
    
    switch (type) {
      case MessageType.IMAGE:
        return isCurrentUser ? 'You sent a photo' : 'Sent a photo';
      case MessageType.FILE:
        return isCurrentUser ? 'You sent a file' : 'Sent a file';
      case MessageType.PROPERTY_INQUIRY:
        return isCurrentUser ? 'You inquired about this property' : 'Inquired about property';
      default:
        return content.length > 50 ? `${content.substring(0, 50)}...` : content;
    }
  };

  const getMessageStatus = (conversation: ConversationPreview) => {
    if (!conversation.lastMessage) return null;
    
    const { isRead, isDelivered, senderId } = conversation.lastMessage;
    const isCurrentUser = senderId === 'user-1';
    
    if (!isCurrentUser) return null;
    
    if (isRead) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (isDelivered) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No conversations yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Start a conversation by messaging someone about a property
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversationPreview) => {
        const { conversation, otherParticipant, unreadCount } = conversationPreview;
        const isActive = conversation.id === activeConversationId;
        const isOnline = otherParticipant.isOnline;
        
        return (
          <div
            key={conversation.id}
            className={`relative flex items-center p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            } ${conversation.isMuted ? 'opacity-60' : ''}`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback>
                  {otherParticipant.firstName[0]}{otherParticipant.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              {/* Online Status */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
              
              {/* Verified Badge */}
              {otherParticipant.isVerified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <h3 className={`font-medium truncate ${
                    unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {otherParticipant.firstName} {otherParticipant.lastName}
                  </h3>
                  
                  {/* Property Indicator */}
                  {conversation.conversationType === ConversationType.PROPERTY_INQUIRY && (
                    <Home className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  )}
                  
                  {/* Muted Indicator */}
                  {conversation.isMuted && (
                    <VolumeX className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Message Status */}
                  {getMessageStatus(conversationPreview)}
                  
                  {/* Timestamp */}
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                    </span>
                  )}
                  
                  {/* More Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(conversation.id, conversation.isArchived);
                        }}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {conversation.isArchived ? 'Unarchive' : 'Archive'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMute(conversation.id, conversation.isMuted);
                        }}
                      >
                        <VolumeX className="w-4 h-4 mr-2" />
                        {conversation.isMuted ? 'Unmute' : 'Mute'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conversation.id);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Property Title */}
              {conversation.propertyTitle && (
                <p className="text-xs text-blue-600 mb-1 truncate">
                  📍 {conversation.propertyTitle}
                </p>
              )}

              {/* Last Message */}
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${
                  unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                }`}>
                  {getMessagePreview(conversationPreview)}
                </p>
                
                {/* Unread Count */}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>

              {/* Last Seen */}
              {!isOnline && (
                <div className="flex items-center mt-1">
                  <Clock className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    Last seen {formatDistanceToNow(otherParticipant.lastSeen, { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
