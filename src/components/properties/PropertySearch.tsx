import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  MapPin,
  Home,
  DollarSign
} from 'lucide-react';
import { usePropertySearch } from '@/stores/propertyStore';
import { SORT_OPTIONS } from '@/types/property.types';

interface PropertySearchProps {
  onClose: () => void;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({ onClose }) => {
  const { searchQuery, setSearchQuery, clearSearch } = usePropertySearch();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<string>('date');
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
    'Downtown San Francisco',
    'Mission District',
    'SOMA',
    'Castro',
    'Pet friendly apartment',
    'Studio with parking',
    'Furnished room',
    'Private bathroom',
    'Gym access',
    'Rooftop deck',
  ];

  const locationSuggestions = [
    'San Francisco, CA',
    'Oakland, CA',
    'Berkeley, CA',
    'Palo Alto, CA',
    'San Jose, CA',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Advanced Property Search</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Main Search */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Search by location, property type, amenities..."
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

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="City, neighborhood..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Property Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="Max monthly rent"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sort by:</span>
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
          </div>

          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">High to Low</SelectItem>
              <SelectItem value="asc">Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Suggestions */}
        {!searchQuery && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Popular searches:</span>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
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

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Popular locations:</span>
              <div className="flex flex-wrap gap-2">
                {locationSuggestions.map((location) => (
                  <Badge
                    key={location}
                    variant="outline"
                    className="cursor-pointer hover:bg-green-50 hover:border-green-300"
                    onClick={() => {
                      setLocalQuery(location);
                      setSearchQuery(location);
                    }}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Current Search */}
        {searchQuery && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Search className="w-4 h-4 text-blue-600" />
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
            <li>Try searching by neighborhood: "Mission", "SOMA", "Castro"</li>
            <li>Search by property features: "Pet friendly", "Parking", "Gym"</li>
            <li>Look for specific amenities: "Rooftop", "Laundry", "Furnished"</li>
            <li>Search by property type: "Studio", "1 bedroom", "Shared room"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
