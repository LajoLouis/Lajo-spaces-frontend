import { UserProfile } from '@/types/profile.types';
import { 
  DiscoveryCard, 
  DiscoveryFilters, 
  Match, 
  MutualMatch, 
  SearchQuery, 
  SearchResults, 
  SwipeAction, 
  SwipeResult,
  DiscoveryResponse,
  MatchResponse,
  DEFAULT_DISCOVERY_FILTERS
} from '@/types/matching.types';
import { matchingService } from './matching.service';

// Mock user profiles for discovery
const mockProfiles: UserProfile[] = [
  {
    id: 'user_1',
    userId: 'user_1',
    bio: 'Software engineer who loves hiking and cooking. Looking for a clean, respectful roommate to share a nice apartment downtown.',
    dateOfBirth: '1995-03-15',
    gender: 'female',
    occupation: 'Software Engineer',
    education: 'bachelors',
    location: { city: 'San Francisco', state: 'California', country: 'United States' },
    photos: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', thumbnailUrl: '', isPrimary: true, order: 0, uploadedAt: '' }
    ],
    lifestyle: {
      sleepSchedule: 'early-bird',
      cleanliness: 'very-clean',
      socialLevel: 'moderately-social',
      guestsPolicy: 'occasional-guests',
      smoking: 'non-smoker',
      drinking: 'social',
      pets: 'love-pets',
      workSchedule: 'remote',
      workFromHome: true,
      musicPreference: ['Pop', 'Indie'],
      dietaryRestrictions: ['Vegetarian'],
      languages: ['English', 'Spanish']
    },
    roommate: {
      ageRange: { min: 24, max: 32 },
      genderPreference: 'no-preference',
      housingType: ['apartment', 'condo'],
      budgetRange: { min: 1200, max: 1800, currency: 'USD' },
      moveInDate: '2024-02-01',
      leaseDuration: 'long-term',
      preferredAreas: ['Downtown', 'Mission'],
      maxCommuteTime: 30,
      transportationMode: ['public-transport'],
      preferredLifestyle: {
        cleanliness: ['very-clean', 'moderately-clean'],
        socialLevel: ['moderately-social'],
        sleepSchedule: ['early-bird', 'flexible']
      },
      dealBreakers: { smoking: true, pets: false, parties: true, overnight_guests: false },
      mustHaves: ['Clean', 'Respectful'],
      niceToHaves: ['Cooking together', 'Similar interests']
    },
    interests: ['Hiking', 'Cooking', 'Technology', 'Reading', 'Yoga'],
    isProfileComplete: true,
    profileCompletionScore: 95,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user_2',
    userId: 'user_2',
    bio: 'Graduate student studying psychology. Love music, art, and good conversations. Looking for someone chill to share expenses with.',
    dateOfBirth: '1997-08-22',
    gender: 'male',
    occupation: 'Graduate Student',
    education: 'masters',
    location: { city: 'San Francisco', state: 'California', country: 'United States' },
    photos: [
      { id: 'p2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', thumbnailUrl: '', isPrimary: true, order: 0, uploadedAt: '' }
    ],
    lifestyle: {
      sleepSchedule: 'night-owl',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guestsPolicy: 'frequent-guests',
      smoking: 'non-smoker',
      drinking: 'social',
      pets: 'no-pets',
      workSchedule: 'student',
      workFromHome: false,
      musicPreference: ['Jazz', 'Classical', 'Indie'],
      dietaryRestrictions: [],
      languages: ['English', 'French']
    },
    roommate: {
      ageRange: { min: 22, max: 30 },
      genderPreference: 'no-preference',
      housingType: ['apartment', 'house'],
      budgetRange: { min: 800, max: 1400, currency: 'USD' },
      moveInDate: '2024-01-15',
      leaseDuration: 'long-term',
      preferredAreas: ['Mission', 'Castro'],
      maxCommuteTime: 45,
      transportationMode: ['public-transport', 'bike'],
      preferredLifestyle: {
        cleanliness: ['moderately-clean', 'relaxed'],
        socialLevel: ['very-social', 'moderately-social'],
        sleepSchedule: ['night-owl', 'flexible']
      },
      dealBreakers: { smoking: true, pets: false, parties: false, overnight_guests: false },
      mustHaves: ['Open-minded', 'Communicative'],
      niceToHaves: ['Music lover', 'Artistic']
    },
    interests: ['Music', 'Art', 'Psychology', 'Movies', 'Coffee'],
    isProfileComplete: true,
    profileCompletionScore: 88,
    isVerified: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z'
  },
  {
    id: 'user_3',
    userId: 'user_3',
    bio: 'Marketing professional who travels frequently. Need a responsible roommate who can handle things when I\'m away. Love fitness and healthy living.',
    dateOfBirth: '1992-11-10',
    gender: 'female',
    occupation: 'Marketing Manager',
    education: 'bachelors',
    location: { city: 'San Francisco', state: 'California', country: 'United States' },
    photos: [
      { id: 'p3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face', thumbnailUrl: '', isPrimary: true, order: 0, uploadedAt: '' }
    ],
    lifestyle: {
      sleepSchedule: 'early-bird',
      cleanliness: 'very-clean',
      socialLevel: 'moderately-social',
      guestsPolicy: 'rare-guests',
      smoking: 'non-smoker',
      drinking: 'rarely',
      pets: 'no-pets',
      workSchedule: 'traditional',
      workFromHome: false,
      musicPreference: ['Pop', 'Electronic'],
      dietaryRestrictions: ['Gluten-Free'],
      languages: ['English']
    },
    roommate: {
      ageRange: { min: 25, max: 35 },
      genderPreference: 'female',
      housingType: ['apartment', 'condo'],
      budgetRange: { min: 1500, max: 2200, currency: 'USD' },
      moveInDate: '2024-02-15',
      leaseDuration: 'long-term',
      preferredAreas: ['SOMA', 'Financial District'],
      maxCommuteTime: 20,
      transportationMode: ['car', 'public-transport'],
      preferredLifestyle: {
        cleanliness: ['very-clean'],
        socialLevel: ['moderately-social', 'prefer-quiet'],
        sleepSchedule: ['early-bird', 'flexible']
      },
      dealBreakers: { smoking: true, pets: true, parties: true, overnight_guests: true },
      mustHaves: ['Responsible', 'Clean', 'Professional'],
      niceToHaves: ['Fitness enthusiast', 'Healthy lifestyle']
    },
    interests: ['Fitness', 'Travel', 'Marketing', 'Healthy Cooking', 'Networking'],
    isProfileComplete: true,
    profileCompletionScore: 92,
    isVerified: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z'
  }
];

// Mock matches storage
const mockMatches: Match[] = [];
const mockMutualMatches: MutualMatch[] = [];

// Simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

class MockDiscoveryService {
  // Get discovery cards with filtering
  async getDiscoveryCards(
    currentUserId: string, 
    filters: Partial<DiscoveryFilters> = {},
    limit: number = 10
  ): Promise<DiscoveryResponse> {
    await delay(800);

    const mergedFilters = { ...DEFAULT_DISCOVERY_FILTERS, ...filters };
    
    // Get current user profile for compatibility calculation
    const currentUserProfile = mockProfiles.find(p => p.userId === currentUserId);
    if (!currentUserProfile) {
      throw new Error('Current user profile not found');
    }

    // Filter profiles based on criteria
    let filteredProfiles = mockProfiles.filter(profile => {
      if (profile.userId === currentUserId) return false;
      
      // Age filter
      if (profile.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
        if (age < mergedFilters.ageRange.min || age > mergedFilters.ageRange.max) return false;
      }

      // Budget filter
      if (profile.roommate?.budgetRange) {
        const hasOverlap = !(
          profile.roommate.budgetRange.max < mergedFilters.budgetRange.min ||
          profile.roommate.budgetRange.min > mergedFilters.budgetRange.max
        );
        if (!hasOverlap) return false;
      }

      // Gender filter
      if (mergedFilters.gender.length > 0 && profile.gender) {
        if (!mergedFilters.gender.includes(profile.gender)) return false;
      }

      // Housing type filter
      if (mergedFilters.housingTypes.length > 0 && profile.roommate?.housingType) {
        const hasCommonType = profile.roommate.housingType.some(type => 
          mergedFilters.housingTypes.includes(type)
        );
        if (!hasCommonType) return false;
      }

      // Photos requirement
      if (mergedFilters.hasPhotos && (!profile.photos || profile.photos.length === 0)) {
        return false;
      }

      // Verification requirement
      if (mergedFilters.isVerified && !profile.isVerified) {
        return false;
      }

      return true;
    });

    // Calculate compatibility and create discovery cards
    const discoveryCards: DiscoveryCard[] = filteredProfiles.map(profile => {
      const compatibility = matchingService.calculateCompatibility(currentUserProfile, profile);
      
      return {
        id: `card_${profile.id}`,
        profile,
        compatibilityScore: compatibility.overall,
        compatibilityBreakdown: compatibility,
        distance: Math.floor(Math.random() * 50) + 1, // Mock distance
        isLiked: false,
        isPassed: false,
        isSuperLiked: false,
      };
    });

    // Filter by minimum compatibility score
    const finalCards = discoveryCards.filter(card => 
      card.compatibilityScore >= mergedFilters.minCompatibilityScore
    );

    // Sort by compatibility score (highest first)
    finalCards.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Limit results
    const limitedCards = finalCards.slice(0, limit);

    return {
      success: true,
      data: {
        profiles: limitedCards,
        hasMore: finalCards.length > limit,
        totalCount: finalCards.length,
      },
      message: `Found ${limitedCards.length} potential roommates`,
    };
  }

  // Handle swipe action
  async swipeProfile(
    userId: string, 
    targetProfileId: string, 
    action: 'like' | 'pass' | 'super_like'
  ): Promise<SwipeResult> {
    await delay(500);

    const match: Match = {
      id: `match_${Date.now()}`,
      userId,
      targetUserId: targetProfileId,
      matchType: action,
      isMutual: false,
      compatibilityScore: 0,
      matchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Check if target user has already liked this user
    const existingMatch = mockMatches.find(m => 
      m.userId === targetProfileId && 
      m.targetUserId === userId && 
      (m.matchType === 'like' || m.matchType === 'super_like')
    );

    let isMutualMatch = false;
    let mutualMatch: MutualMatch | undefined;

    if (action !== 'pass' && existingMatch) {
      // Create mutual match
      isMutualMatch = true;
      match.isMutual = true;
      existingMatch.isMutual = true;

      const userProfile = mockProfiles.find(p => p.userId === userId);
      const targetProfile = mockProfiles.find(p => p.userId === targetProfileId);

      if (userProfile && targetProfile) {
        const compatibility = matchingService.calculateCompatibility(userProfile, targetProfile);
        
        mutualMatch = {
          id: `mutual_${Date.now()}`,
          user1Id: userId,
          user2Id: targetProfileId,
          user1Profile: userProfile,
          user2Profile: targetProfile,
          compatibilityScore: compatibility.overall,
          matchedAt: new Date().toISOString(),
          isActive: true,
        };

        mockMutualMatches.push(mutualMatch);
      }
    }

    mockMatches.push(match);

    return {
      success: true,
      isMutualMatch,
      mutualMatch,
      message: isMutualMatch 
        ? "It's a match! You can now message each other." 
        : action === 'pass' 
          ? 'Profile passed' 
          : 'Like sent!',
    };
  }

  // Search profiles
  async searchProfiles(query: SearchQuery): Promise<SearchResults> {
    await delay(600);

    const { query: searchText, filters = {}, sortBy = 'compatibility', sortOrder = 'desc' } = query;
    
    // Start with all profiles except current user
    let results = mockProfiles.filter(profile => {
      // Basic text search
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesText = 
          profile.bio.toLowerCase().includes(searchLower) ||
          profile.occupation.toLowerCase().includes(searchLower) ||
          profile.interests?.some(interest => interest.toLowerCase().includes(searchLower)) ||
          profile.location.city.toLowerCase().includes(searchLower);
        
        if (!matchesText) return false;
      }

      // Apply filters (simplified version)
      if (filters.ageRange && profile.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
        if (age < filters.ageRange.min || age > filters.ageRange.max) return false;
      }

      return true;
    });

    // Convert to discovery cards (simplified - would need current user for real compatibility)
    const discoveryCards: DiscoveryCard[] = results.map(profile => ({
      id: `search_${profile.id}`,
      profile,
      compatibilityScore: Math.floor(Math.random() * 40) + 60, // Mock score
      compatibilityBreakdown: {
        overall: Math.floor(Math.random() * 40) + 60,
        lifestyle: Math.floor(Math.random() * 100),
        budget: Math.floor(Math.random() * 100),
        location: Math.floor(Math.random() * 100),
        preferences: Math.floor(Math.random() * 100),
        dealBreakers: Math.floor(Math.random() * 100),
        details: {
          lifestyle: [],
          budget: [],
          location: [],
          preferences: [],
          dealBreakers: [],
        },
      },
      distance: Math.floor(Math.random() * 50) + 1,
      isLiked: false,
      isPassed: false,
      isSuperLiked: false,
    }));

    // Sort results
    discoveryCards.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'compatibility':
          comparison = a.compatibilityScore - b.compatibilityScore;
          break;
        case 'distance':
          comparison = (a.distance || 0) - (b.distance || 0);
          break;
        case 'age':
          const ageA = new Date().getFullYear() - new Date(a.profile.dateOfBirth).getFullYear();
          const ageB = new Date().getFullYear() - new Date(b.profile.dateOfBirth).getFullYear();
          comparison = ageA - ageB;
          break;
        case 'recent':
          comparison = new Date(a.profile.updatedAt).getTime() - new Date(b.profile.updatedAt).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedResults = discoveryCards.slice(startIndex, endIndex);

    return {
      profiles: paginatedResults,
      totalCount: discoveryCards.length,
      hasMore: endIndex < discoveryCards.length,
      page: query.page,
      filters: { ...DEFAULT_DISCOVERY_FILTERS, ...filters },
    };
  }

  // Get user's matches
  async getMatches(userId: string): Promise<Match[]> {
    await delay(400);
    return mockMatches.filter(match => match.userId === userId);
  }

  // Get mutual matches
  async getMutualMatches(userId: string): Promise<MutualMatch[]> {
    await delay(400);
    return mockMutualMatches.filter(match => 
      match.user1Id === userId || match.user2Id === userId
    );
  }

  // Get mock profiles (for development)
  getMockProfiles(): UserProfile[] {
    return mockProfiles;
  }

  // Reset mock data (for development)
  resetMockData(): void {
    mockMatches.length = 0;
    mockMutualMatches.length = 0;
  }
}

// Create and export singleton instance
export const mockDiscoveryService = new MockDiscoveryService();
export default mockDiscoveryService;
