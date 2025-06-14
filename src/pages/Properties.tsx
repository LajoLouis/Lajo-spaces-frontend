import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MapPin, 
  Home, 
  DollarSign, 
  Calendar, 
  Heart,
  Star,
  Verified,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useProperties, usePropertySearch, usePropertyStore } from '@/stores/propertyStore';
import { mockPropertyService } from '@/services/mockProperty.service';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertySearch } from '@/components/properties/PropertySearch';
import { SORT_OPTIONS } from '@/types/property.types';
import { toast } from 'sonner';

const Properties: React.FC = () => {
  const { properties, isLoading, error } = useProperties();
  const { searchQuery, filters, setSearchResults, setSearchQuery } = usePropertySearch();
  const { setProperties, setLoading, setError } = usePropertyStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Load initial properties
  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mockPropertyService.getProperties(filters, 20);

      if (response.success) {
        // Update store with properties
        setProperties(response.data.properties);
        setSearchResults({
          properties: response.data.properties,
          totalCount: response.data.totalCount,
          hasMore: response.data.hasMore,
          page: 1,
          filters: filters as any,
        });
      } else {
        setError('Failed to load properties');
        toast.error('Failed to load properties');
      }
    } catch (err) {
      setError('An error occurred while loading properties');
      toast.error('An error occurred while loading properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!localSearchQuery.trim()) return;

    try {
      setLoading(true);

      const searchResults = await mockPropertyService.searchProperties({
        query: localSearchQuery,
        filters,
        sortBy: sortBy as any,
        sortOrder,
        page: 1,
        limit: 20,
      });

      setSearchQuery(localSearchQuery);
      setProperties(searchResults.properties);
      setSearchResults(searchResults);
      toast.success(`Found ${searchResults.totalCount} properties`);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
    loadProperties();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading available properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadProperties} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Properties</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs sm:text-sm">
                {properties.length} available
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadProperties}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 flex-1 sm:flex-none">
                <Link to="/properties/post">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Post Property</span>
                  <span className="sm:hidden">Post</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by location, property type..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-10"
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSearch} disabled={!localSearchQuery.trim()} className="flex-1 sm:flex-none">
                Search
              </Button>

              {searchQuery && (
                <Button variant="outline" onClick={handleClearSearch} className="flex-1 sm:flex-none">
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`${showFilters ? 'bg-blue-100' : ''} flex-1 sm:flex-none`}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className={`${showSearch ? 'bg-blue-100' : ''} flex-1 sm:flex-none`}
              >
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Advanced Search</span>
                <span className="sm:hidden">Search</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 sm:px-3 py-1 flex-1 sm:flex-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button variant="outline" size="sm" onClick={toggleSort}>
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>

              <div className="hidden sm:flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="bg-white border-b border-gray-200 p-4">
          <PropertySearch onClose={() => setShowSearch(false)} />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4">
          <PropertyFilters onClose={() => setShowFilters(false)} />
        </div>
      )}

      {/* Current Search/Filter Info */}
      {(searchQuery || Object.keys(filters).length > 0) && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {searchQuery && (
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      Searching for: <strong>"{searchQuery}"</strong>
                    </span>
                  </div>
                )}
                
                {Object.keys(filters).length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {Object.keys(filters).length} filter(s) applied
                    </span>
                  </div>
                )}
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to see more results.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setShowFilters(true)} variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Adjust Filters
              </Button>
              <Button asChild>
                <Link to="/properties/post">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your Property
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    compact={false}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            <div className="flex justify-center mt-8">
              <Button
                onClick={loadProperties}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Properties'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
