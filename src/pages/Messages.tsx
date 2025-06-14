import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Search, 
  Plus, 
  Archive, 
  Settings,
  Filter,
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { useConversations, useMessageStore } from '@/stores/messageStore';
import { mockMessageService } from '@/services/mockMessage.service';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { NewConversationModal } from '@/components/messages/NewConversationModal';
import { ConversationType } from '@/types/message.types';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  const { 
    conversations, 
    isLoading, 
    error, 
    loadConversations, 
    getUnreadCount 
  } = useConversations();
  
  const { 
    activeConversationId, 
    setActiveConversation,
    handleRealtimeEvent 
  } = useMessageStore();

  // Check if mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Set up real-time event listener
  useEffect(() => {
    mockMessageService.addEventListener(handleRealtimeEvent);
    return () => {
      mockMessageService.removeEventListener(handleRealtimeEvent);
    };
  }, [handleRealtimeEvent]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const otherParticipant = conv.otherParticipant;
    const participantName = `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase();
    const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';
    const propertyTitle = conv.conversation.propertyTitle?.toLowerCase() || '';
    
    return participantName.includes(searchQuery.toLowerCase()) ||
           lastMessageContent.includes(searchQuery.toLowerCase()) ||
           propertyTitle.includes(searchQuery.toLowerCase());
  });

  const handleNewConversation = async (participantId: string, propertyId?: string, initialMessage?: string) => {
    try {
      const conversationId = await useMessageStore.getState().createConversation({
        participantId,
        propertyId,
        initialMessage,
        type: propertyId ? ConversationType.PROPERTY_INQUIRY : ConversationType.DIRECT
      });
      
      setActiveConversation(conversationId);
      setShowNewConversation(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const unreadCount = getUnreadCount();

  // Mobile: Show conversation list or chat window
  if (isMobileView) {
    return (
      <div className="h-screen bg-gray-50">
        {!activeConversationId ? (
          // Mobile Conversation List
          <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewConversation(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mobile Conversation List */}
            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={filteredConversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversation}
                isLoading={isLoading}
                error={error}
                isMobile={true}
              />
            </div>
          </div>
        ) : (
          // Mobile Chat Window
          <ChatWindow
            conversationId={activeConversationId}
            onBack={() => setActiveConversation(null)}
            isMobile={true}
          />
        )}

        {/* New Conversation Modal */}
        <NewConversationModal
          isOpen={showNewConversation}
          onClose={() => setShowNewConversation(false)}
          onCreateConversation={handleNewConversation}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowNewConversation(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Message</span>
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Conversation List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={filteredConversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversation}
              isLoading={isLoading}
              error={error}
              isMobile={false}
            />
          </div>
        </div>

        {/* Right Side - Chat Window */}
        <div className="flex-1 flex flex-col">
          {activeConversationId ? (
            <ChatWindow
              conversationId={activeConversationId}
              isMobile={false}
            />
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose a conversation from the list to start messaging
                </p>
                <Button
                  onClick={() => setShowNewConversation(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Conversation</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onCreateConversation={handleNewConversation}
      />
    </div>
  );
};

export default Messages;
