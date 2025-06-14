import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Reply, 
  Copy, 
  Edit, 
  Trash2, 
  Flag,
  Forward,
  Star
} from 'lucide-react';
import { Message } from '@/types/message.types';

interface MessageActionsProps {
  message: Message;
  isCurrentUser: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onFlag?: (message: Message) => void;
  onStar?: (message: Message) => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  isCurrentUser,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onForward,
  onFlag,
  onStar
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.(message);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onReply && (
          <DropdownMenuItem onClick={() => onReply(message)}>
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </DropdownMenuItem>
        )}
        
        {onForward && (
          <DropdownMenuItem onClick={() => onForward(message)}>
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Text
        </DropdownMenuItem>
        
        {onStar && (
          <DropdownMenuItem onClick={() => onStar(message)}>
            <Star className="w-4 h-4 mr-2" />
            Star Message
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {isCurrentUser && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(message)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        
        {isCurrentUser && onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(message)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
        
        {!isCurrentUser && onFlag && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onFlag(message)}
              className="text-red-600"
            >
              <Flag className="w-4 h-4 mr-2" />
              Report
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
