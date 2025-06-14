import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  ChevronUp, 
  ChevronDown,
  Calendar,
  User,
  Filter
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSearchFilters, MessageType } from '@/types/message.types';

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: MessageSearchFilters) => void;
  conversationId?: string;
  placeholder?: string;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  conversationId,
  placeholder = "Search messages..."
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<MessageSearchFilters>({
    conversationId
  });
  const [currentResult, setCurrentResult] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFilters({ conversationId });
      setCurrentResult(0);
      setTotalResults(0);
    }
  }, [isOpen, conversationId]);

  const handleSearch = () => {
    const searchFilters: MessageSearchFilters = {
      ...filters,
      query: query.trim() || undefined
    };
    
    onSearch(searchFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClear = () => {
    setQuery('');
    setFilters({ conversationId });
    setCurrentResult(0);
    setTotalResults(0);
  };

  const navigateResults = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentResult > 1) {
      setCurrentResult(currentResult - 1);
    } else if (direction === 'down' && currentResult < totalResults) {
      setCurrentResult(currentResult + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="border-b border-gray-200 bg-yellow-50 p-4">
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
              onClick={handleClear}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={showAdvanced ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Search</h4>
              
              {/* Message Type Filter */}
              <div className="space-y-2">
                <Label>Message Type</Label>
                <Select
                  value={filters.messageType || ''}
                  onValueChange={(value) => 
                    setFilters({ 
                      ...filters, 
                      messageType: value ? value as MessageType : undefined 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value={MessageType.TEXT}>Text</SelectItem>
                    <SelectItem value={MessageType.IMAGE}>Images</SelectItem>
                    <SelectItem value={MessageType.FILE}>Files</SelectItem>
                    <SelectItem value={MessageType.PROPERTY_INQUIRY}>Property Inquiries</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                    onChange={(e) => 
                      setFilters({ 
                        ...filters, 
                        dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                      })
                    }
                    placeholder="From"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                    onChange={(e) => 
                      setFilters({ 
                        ...filters, 
                        dateTo: e.target.value ? new Date(e.target.value) : undefined 
                      })
                    }
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-2">
                <Label>Additional Filters</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.hasAttachments || false}
                      onChange={(e) => 
                        setFilters({ 
                          ...filters, 
                          hasAttachments: e.target.checked || undefined 
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Has attachments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.isUnread || false}
                      onChange={(e) => 
                        setFilters({ 
                          ...filters, 
                          isUnread: e.target.checked || undefined 
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Unread only</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSearch} className="flex-1">
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ conversationId })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Result Navigation */}
        {totalResults > 0 && (
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {currentResult} of {totalResults}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={() => navigateResults('up')}
              disabled={currentResult <= 1}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={() => navigateResults('down')}
              disabled={currentResult >= totalResults}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-6 h-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Active Filters Display */}
      {(filters.messageType || filters.dateFrom || filters.dateTo || filters.hasAttachments || filters.isUnread) && (
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-xs text-gray-600">Filters:</span>
          {filters.messageType && (
            <Badge variant="outline" className="text-xs">
              Type: {filters.messageType}
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="outline" className="text-xs">
              From: {filters.dateFrom.toLocaleDateString()}
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="outline" className="text-xs">
              To: {filters.dateTo.toLocaleDateString()}
            </Badge>
          )}
          {filters.hasAttachments && (
            <Badge variant="outline" className="text-xs">
              Has attachments
            </Badge>
          )}
          {filters.isUnread && (
            <Badge variant="outline" className="text-xs">
              Unread only
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
