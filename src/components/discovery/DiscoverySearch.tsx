import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useDiscoverySearch } from '@/stores/discoveryStore';
import { SORT_OPTIONS } from '@/types/matching.types';

interface DiscoverySearchProps {
  onClose: () => void;
}

export const DiscoverySearch: React.FC<DiscoverySearchProps> = ({ onClose }) => {
  const { searchQuery, setSearchQuery, clearSearch } = useDiscoverySearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<string>('compatibility');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSearch = () => {
    setSearchQuery(localQuery);
    // In a real app, this would trigger a search API call
  };

  const handleClear = () => {
    setLocalQuery('');
    clearSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const searchSuggestions = [
    'Software Engineer',
    'Student',
    'Downtown',
    'Pet friendly',
    'Clean',
    'Social',
    'Quiet',
    'Vegetarian',
    'Fitness',
    'Music lover',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Search Roommates</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search Input */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Search by occupation, interests, location..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            {localQuery && (
              <button
                onClick={() => setLocalQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          {searchQuery && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Sort by:</span>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Search Suggestions */}
        {!searchQuery && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">Popular searches:</span>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => {
                    setLocalQuery(suggestion);
                    setSearchQuery(suggestion);
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Search */}
        {searchQuery && (
          <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
            <Search className="w-4 h-4 text-purple-600" />
            <span className="text-sm">
              Searching for: <strong>"{searchQuery}"</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Search Tips */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Search tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Try searching by occupation: "Software Engineer", "Student", "Teacher"</li>
            <li>Search by interests: "Hiking", "Cooking", "Music", "Fitness"</li>
            <li>Look for lifestyle preferences: "Clean", "Social", "Quiet", "Pet friendly"</li>
            <li>Search by location: "Downtown", "Mission", "SOMA"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
