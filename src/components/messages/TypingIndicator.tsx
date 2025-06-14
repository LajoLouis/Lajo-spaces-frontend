import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/message.types';

interface TypingIndicatorProps {
  users: User[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].firstName} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].firstName} and ${users[1].firstName} are typing...`;
    } else {
      return `${users[0].firstName} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-end space-x-2 max-w-xs">
      {/* Avatar */}
      <div className="w-8 h-8 flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={users[0].avatar} />
          <AvatarFallback className="text-xs">
            {users[0].firstName[0]}{users[0].lastName[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Typing Bubble */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{getTypingText()}</span>
          
          {/* Animated Dots */}
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
