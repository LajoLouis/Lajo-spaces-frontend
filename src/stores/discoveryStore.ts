import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  DiscoveryCard, 
  DiscoveryFilters, 
  Match, 
  MutualMatch, 
  SearchResults, 
  SwipeResult,
  DEFAULT_DISCOVERY_FILTERS,
  DiscoveryState
} from '@/types/matching.types';

interface DiscoveryStore extends DiscoveryState {
  // Actions
  setCards: (cards: DiscoveryCard[]) => void;
  addCards: (cards: DiscoveryCard[]) => void;
  setCurrentCardIndex: (index: number) => void;
  nextCard: () => void;
  setFilters: (filters: Partial<DiscoveryFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  
  // Match actions
  addMatch: (match: Match) => void;
  addMutualMatch: (mutualMatch: MutualMatch) => void;
  updateCardAfterSwipe: (cardId: string, action: 'like' | 'pass' | 'super_like') => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResults | null) => void;
  clearSearch: () => void;
  
  // Utility actions
  getCurrentCard: () => DiscoveryCard | null;
  getFilteredCards: () => DiscoveryCard[];
  getMatchById: (matchId: string) => Match | null;
  getMutualMatchById: (matchId: string) => MutualMatch | null;
  clearAllData: () => void;
}

const initialState: DiscoveryState = {
  cards: [],
  currentCardIndex: 0,
  filters: DEFAULT_DISCOVERY_FILTERS,
  isLoading: false,
  error: null,
  hasMore: true,
  matches: [],
  mutualMatches: [],
  searchQuery: '',
  searchResults: null,
};

export const useDiscoveryStore = create<DiscoveryStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,
        
        // Card actions
        setCards: (cards) => {
          set({ cards, currentCardIndex: 0, error: null });
        },
        
        addCards: (newCards) => {
          set((state) => ({
            cards: [...state.cards, ...newCards],
            error: null,
          }));
        },
        
        setCurrentCardIndex: (index) => {
          set({ currentCardIndex: index });
        },
        
        nextCard: () => {
          set((state) => ({
            currentCardIndex: Math.min(state.currentCardIndex + 1, state.cards.length - 1),
          }));
        },
        
        // Filter actions
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            currentCardIndex: 0, // Reset to first card when filters change
          }));
        },
        
        resetFilters: () => {
          set({
            filters: DEFAULT_DISCOVERY_FILTERS,
            currentCardIndex: 0,
          });
        },
        
        // Loading and error actions
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        
        setError: (error) => {
          set({ error, isLoading: false });
        },
        
        setHasMore: (hasMore) => {
          set({ hasMore });
        },
        
        // Match actions
        addMatch: (match) => {
          set((state) => ({
            matches: [...state.matches, match],
          }));
        },
        
        addMutualMatch: (mutualMatch) => {
          set((state) => ({
            mutualMatches: [...state.mutualMatches, mutualMatch],
          }));
        },
        
        updateCardAfterSwipe: (cardId, action) => {
          set((state) => ({
            cards: state.cards.map(card => {
              if (card.id === cardId) {
                return {
                  ...card,
                  isLiked: action === 'like' || action === 'super_like',
                  isPassed: action === 'pass',
                  isSuperLiked: action === 'super_like',
                };
              }
              return card;
            }),
          }));
        },
        
        // Search actions
        setSearchQuery: (query) => {
          set({ searchQuery: query });
        },
        
        setSearchResults: (results) => {
          set({ searchResults: results });
        },
        
        clearSearch: () => {
          set({ searchQuery: '', searchResults: null });
        },
        
        // Utility actions
        getCurrentCard: () => {
          const state = get();
          return state.cards[state.currentCardIndex] || null;
        },
        
        getFilteredCards: () => {
          const state = get();
          // Return cards that haven't been swiped yet
          return state.cards.filter(card => !card.isLiked && !card.isPassed);
        },
        
        getMatchById: (matchId) => {
          const state = get();
          return state.matches.find(match => match.id === matchId) || null;
        },
        
        getMutualMatchById: (matchId) => {
          const state = get();
          return state.mutualMatches.find(match => match.id === matchId) || null;
        },
        
        clearAllData: () => {
          set(initialState);
        },
      }),
      {
        name: 'discovery-store',
        // Only persist filters and search query, not the cards or matches
        partialize: (state) => ({
          filters: state.filters,
          searchQuery: state.searchQuery,
        }),
      }
    ),
    {
      name: 'discovery-store',
    }
  )
);

// Selectors for common use cases
export const useDiscoveryCards = () => {
  const store = useDiscoveryStore();
  return {
    cards: store.cards,
    currentCard: store.getCurrentCard(),
    currentIndex: store.currentCardIndex,
    hasMore: store.hasMore,
    isLoading: store.isLoading,
    error: store.error,
  };
};

export const useDiscoveryFilters = () => {
  const store = useDiscoveryStore();
  return {
    filters: store.filters,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
  };
};

export const useDiscoveryMatches = () => {
  const store = useDiscoveryStore();
  return {
    matches: store.matches,
    mutualMatches: store.mutualMatches,
    addMatch: store.addMatch,
    addMutualMatch: store.addMutualMatch,
  };
};

export const useDiscoverySearch = () => {
  const store = useDiscoveryStore();
  return {
    searchQuery: store.searchQuery,
    searchResults: store.searchResults,
    setSearchQuery: store.setSearchQuery,
    setSearchResults: store.setSearchResults,
    clearSearch: store.clearSearch,
  };
};

export const useDiscoveryActions = () => {
  const store = useDiscoveryStore();
  return {
    setCards: store.setCards,
    addCards: store.addCards,
    nextCard: store.nextCard,
    setLoading: store.setLoading,
    setError: store.setError,
    updateCardAfterSwipe: store.updateCardAfterSwipe,
  };
};
