import { UserProfile } from './profile.types';

// Match Types
export interface Match {
  id: string;
  userId: string;
  targetUserId: string;
  matchType: 'like' | 'pass' | 'super_like';
  isMutual: boolean;
  compatibilityScore: number;
  matchedAt: string;
  createdAt: string;
}

export interface MutualMatch {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Profile: UserProfile;
  user2Profile: UserProfile;
  compatibilityScore: number;
  matchedAt: string;
  lastMessageAt?: string;
  isActive: boolean;
}

// Discovery Types
export interface DiscoveryCard {
  id: string;
  profile: UserProfile;
  compatibilityScore: number;
  compatibilityBreakdown: CompatibilityBreakdown;
  distance?: number;
  isLiked: boolean;
  isPassed: boolean;
  isSuperLiked: boolean;
}

export interface CompatibilityBreakdown {
  overall: number;
  lifestyle: number;
  budget: number;
  location: number;
  preferences: number;
  dealBreakers: number;
  details: {
    lifestyle: CompatibilityDetail[];
    budget: CompatibilityDetail[];
    location: CompatibilityDetail[];
    preferences: CompatibilityDetail[];
    dealBreakers: CompatibilityDetail[];
  };
}

export interface CompatibilityDetail {
  category: string;
  score: number;
  reason: string;
  isPositive: boolean;
}

// Filter Types
export interface DiscoveryFilters {
  ageRange: {
    min: number;
    max: number;
  };
  budgetRange: {
    min: number;
    max: number;
  };
  distance: {
    max: number; // in miles/km
  };
  gender: string[];
  housingTypes: string[];
  lifestyle: {
    cleanliness: string[];
    socialLevel: string[];
    sleepSchedule: string[];
    smoking: string[];
    drinking: string[];
    pets: string[];
  };
  dealBreakers: {
    smoking: boolean;
    pets: boolean;
    parties: boolean;
    overnight_guests: boolean;
  };
  interests: string[];
  hasPhotos: boolean;
  isVerified: boolean;
  minCompatibilityScore: number;
}

// Search Types
export interface SearchQuery {
  query: string;
  filters: Partial<DiscoveryFilters>;
  sortBy: 'compatibility' | 'distance' | 'recent' | 'age';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface SearchResults {
  profiles: DiscoveryCard[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  filters: DiscoveryFilters;
}

// Swipe Types
export interface SwipeAction {
  profileId: string;
  action: 'like' | 'pass' | 'super_like';
  timestamp: string;
}

export interface SwipeResult {
  success: boolean;
  isMutualMatch: boolean;
  mutualMatch?: MutualMatch;
  message: string;
}

// Discovery State Types
export interface DiscoveryState {
  cards: DiscoveryCard[];
  currentCardIndex: number;
  filters: DiscoveryFilters;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  matches: Match[];
  mutualMatches: MutualMatch[];
  searchQuery: string;
  searchResults: SearchResults | null;
}

// API Response Types
export interface DiscoveryResponse {
  success: boolean;
  data: {
    profiles: DiscoveryCard[];
    hasMore: boolean;
    totalCount: number;
  };
  message: string;
}

export interface MatchResponse {
  success: boolean;
  data: {
    match: Match;
    isMutual: boolean;
    mutualMatch?: MutualMatch;
  };
  message: string;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResults;
  message: string;
}

// Matching Algorithm Types
export interface MatchingWeights {
  lifestyle: number;
  budget: number;
  location: number;
  preferences: number;
  dealBreakers: number;
  interests: number;
  age: number;
}

export interface MatchingCriteria {
  weights: MatchingWeights;
  dealBreakerPenalty: number;
  maxDistance: number;
  minAge: number;
  maxAge: number;
  requirePhotos: boolean;
  requireVerification: boolean;
}

// Constants
export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  ageRange: { min: 18, max: 65 },
  budgetRange: { min: 0, max: 10000 },
  distance: { max: 50 },
  gender: [],
  housingTypes: [],
  lifestyle: {
    cleanliness: [],
    socialLevel: [],
    sleepSchedule: [],
    smoking: [],
    drinking: [],
    pets: [],
  },
  dealBreakers: {
    smoking: false,
    pets: false,
    parties: false,
    overnight_guests: false,
  },
  interests: [],
  hasPhotos: false,
  isVerified: false,
  minCompatibilityScore: 0,
};

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  lifestyle: 0.25,
  budget: 0.20,
  location: 0.15,
  preferences: 0.20,
  dealBreakers: 0.10,
  interests: 0.05,
  age: 0.05,
};

export const SWIPE_ACTIONS = {
  LIKE: 'like',
  PASS: 'pass',
  SUPER_LIKE: 'super_like',
} as const;

export const SORT_OPTIONS = [
  { value: 'compatibility', label: 'Best Match' },
  { value: 'distance', label: 'Nearest' },
  { value: 'recent', label: 'Recently Active' },
  { value: 'age', label: 'Age' },
] as const;

export const DISTANCE_OPTIONS = [
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
  { value: 100, label: '100 miles' },
  { value: 999, label: 'Any distance' },
] as const;

// Utility Types
export type SwipeDirection = 'left' | 'right' | 'up';
export type MatchStatus = 'pending' | 'matched' | 'passed' | 'blocked';
export type DiscoveryMode = 'cards' | 'list' | 'map';

// Validation Types
export interface DiscoveryValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

// Analytics Types
export interface DiscoveryAnalytics {
  totalViews: number;
  totalLikes: number;
  totalPasses: number;
  totalSuperLikes: number;
  mutualMatches: number;
  averageCompatibilityScore: number;
  topInterests: string[];
  preferredAgeRange: { min: number; max: number };
  preferredBudgetRange: { min: number; max: number };
}
