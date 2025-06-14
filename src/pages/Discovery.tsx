import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  X, 
  Star, 
  Filter, 
  Search, 
  MapPin, 
  Users, 
  Settings,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDiscoveryCards, useDiscoveryActions, useDiscoveryFilters } from '@/stores/discoveryStore';
import { mockDiscoveryService } from '@/services/mockDiscovery.service';
import { DiscoveryCard } from '@/components/discovery/DiscoveryCard';
import { DiscoveryFilters } from '@/components/discovery/DiscoveryFilters';
import { DiscoverySearch } from '@/components/discovery/DiscoverySearch';
import { SwipeResult } from '@/types/matching.types';
import { toast } from 'sonner';

const Discovery: React.FC = () => {
  const { user } = useAuth();
  const { cards, currentCard, currentIndex, hasMore, isLoading, error } = useDiscoveryCards();
  const { setCards, addCards, nextCard, setLoading, setError, updateCardAfterSwipe } = useDiscoveryActions();
  const { filters } = useDiscoveryFilters();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Load initial discovery cards
  useEffect(() => {
    if (user?.id) {
      loadDiscoveryCards();
    }
  }, [user?.id, filters]);

  const loadDiscoveryCards = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await mockDiscoveryService.getDiscoveryCards(
        user.id,
        filters,
        20 // Load 20 cards at a time
      );

      if (response.success) {
        setCards(response.data.profiles);
      } else {
        setError('Failed to load discovery cards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCards = async () => {
    if (!user?.id || !hasMore || isLoading) return;

    try {
      setLoading(true);
      
      const response = await mockDiscoveryService.getDiscoveryCards(
        user.id,
        filters,
        10 // Load 10 more cards
      );

      if (response.success) {
        addCards(response.data.profiles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more cards');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass' | 'super_like') => {
    if (!currentCard || !user?.id) return;

    try {
      // Update card state immediately for better UX
      updateCardAfterSwipe(currentCard.id, action);
      
      // Send swipe action to backend
      const result: SwipeResult = await mockDiscoveryService.swipeProfile(
        user.id,
        currentCard.profile.userId,
        action
      );

      if (result.success) {
        // Show appropriate message
        if (result.isMutualMatch) {
          toast.success("🎉 It's a match! You can now message each other.");
        } else if (action === 'like') {
          toast.success('Like sent!');
        } else if (action === 'super_like') {
          toast.success('Super like sent! ⭐');
        }

        // Move to next card
        nextCard();

        // Load more cards if running low
        if (currentIndex >= cards.length - 3 && hasMore) {
          loadMoreCards();
        }
      } else {
        setError('Failed to process swipe action');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swipe action failed');
    }
  };

  const handleRefresh = () => {
    loadDiscoveryCards();
  };

  if (isLoading && cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Finding your perfect roommate matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to see more potential roommates.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setShowFilters(true)} variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Adjust Filters
              </Button>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {cards.length - currentIndex} profiles
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className={showSearch ? 'bg-purple-100' : ''}
              >
                <Search className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-purple-100' : ''}
              >
                <Filter className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              >
                {viewMode === 'cards' ? <Users className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="bg-white border-b border-gray-200 p-4">
          <DiscoverySearch onClose={() => setShowSearch(false)} />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4">
          <DiscoveryFilters onClose={() => setShowFilters(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {viewMode === 'cards' ? (
          // Card View
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              {currentCard && (
                <DiscoveryCard
                  card={currentCard}
                  onSwipe={handleSwipe}
                  showActions={true}
                />
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-center items-center space-x-4 mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipe('pass')}
                  className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
                  disabled={!currentCard}
                >
                  <X className="w-6 h-6 text-red-500" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipe('super_like')}
                  className="w-16 h-16 rounded-full border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
                  disabled={!currentCard}
                >
                  <Star className="w-6 h-6 text-yellow-500" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipe('like')}
                  className="w-16 h-16 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
                  disabled={!currentCard}
                >
                  <Heart className="w-6 h-6 text-green-500" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // List View
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.slice(currentIndex).map((card) => (
              <DiscoveryCard
                key={card.id}
                card={card}
                onSwipe={handleSwipe}
                showActions={false}
                compact={true}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && viewMode === 'list' && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={loadMoreCards}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
