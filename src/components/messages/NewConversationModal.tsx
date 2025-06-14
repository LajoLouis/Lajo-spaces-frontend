import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  MessageCircle, 
  Home, 
  User,
  Check
} from 'lucide-react';
import { mockMessageService } from '@/services/mockMessage.service';
import { mockPropertyService } from '@/services/mockProperty.service';
import { User as UserType, ConversationType } from '@/types/message.types';
import { Property } from '@/types/property.types';
import { Skeleton } from '@/components/ui/skeleton';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (participantId: string, propertyId?: string, initialMessage?: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation
}) => {
  const [step, setStep] = useState<'select-type' | 'select-user' | 'select-property' | 'compose'>('select-type');
  const [conversationType, setConversationType] = useState<ConversationType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load users and properties when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadProperties();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('select-type');
      setConversationType(null);
      setSelectedUser(null);
      setSelectedProperty(null);
      setInitialMessage('');
      setSearchQuery('');
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const mockUsers = mockMessageService.getMockUsers();
      const currentUser = mockMessageService.getCurrentUser();
      // Filter out current user
      setUsers(mockUsers.filter(user => user.id !== currentUser?.id));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await mockPropertyService.getProperties({}, 20);
      if (response.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = () => {
    if (!selectedUser) return;
    
    onCreateConversation(
      selectedUser.id,
      selectedProperty?.id,
      initialMessage.trim() || undefined
    );
    
    onClose();
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredProperties = properties.filter(property => {
    if (!searchQuery) return true;
    return property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           property.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
           property.location.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderSelectType = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Start a New Conversation</h3>
        <p className="text-gray-600">Choose how you'd like to connect</p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-16 flex items-center justify-start space-x-4 p-4"
          onClick={() => {
            setConversationType(ConversationType.DIRECT);
            setStep('select-user');
          }}
        >
          <User className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <div className="font-medium">Direct Message</div>
            <div className="text-sm text-gray-600">Send a message to another user</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-16 flex items-center justify-start space-x-4 p-4"
          onClick={() => {
            setConversationType(ConversationType.PROPERTY_INQUIRY);
            setStep('select-property');
          }}
        >
          <Home className="w-6 h-6 text-green-600" />
          <div className="text-left">
            <div className="font-medium">Property Inquiry</div>
            <div className="text-sm text-gray-600">Ask about a specific property</div>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderSelectUser = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select User</h3>
        <Button variant="ghost" size="sm" onClick={() => setStep('select-type')}>
          Back
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* User List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedUser?.id === user.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => {
              setSelectedUser(user);
              setStep('compose');
            }}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{user.firstName} {user.lastName}</span>
                {user.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-500">
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No users found
        </div>
      )}
    </div>
  );

  const renderSelectProperty = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Property</h3>
        <Button variant="ghost" size="sm" onClick={() => setStep('select-type')}>
          Back
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Property List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          filteredProperties.map(property => (
            <div
              key={property.id}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedProperty?.id === property.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setSelectedProperty(property);
                setSelectedUser(property.owner);
                setStep('compose');
              }}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Home className="w-6 h-6 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium">{property.title}</h4>
                <p className="text-sm text-gray-600">
                  {property.location.neighborhood}, {property.location.city}
                </p>
                <p className="text-sm font-medium text-green-600">
                  ${property.pricing.monthlyRent}/month
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && filteredProperties.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No properties found
        </div>
      )}
    </div>
  );

  const renderCompose = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Compose Message</h3>
        <Button variant="ghost" size="sm" onClick={() => setStep(conversationType === ConversationType.PROPERTY_INQUIRY ? 'select-property' : 'select-user')}>
          Back
        </Button>
      </div>

      {/* Selected User/Property Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={selectedUser?.avatar} />
            <AvatarFallback>
              {selectedUser?.firstName[0]}{selectedUser?.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </div>
            {selectedProperty && (
              <div className="text-sm text-blue-600">
                📍 {selectedProperty.title}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          placeholder={selectedProperty 
            ? "Hi! I'm interested in your property listing. Could you tell me more about it?"
            : "Hi! I'd like to connect with you."
          }
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          rows={4}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleCreateConversation} className="flex-1">
          Start Conversation
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {step === 'select-type' && renderSelectType()}
          {step === 'select-user' && renderSelectUser()}
          {step === 'select-property' && renderSelectProperty()}
          {step === 'compose' && renderCompose()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
