import { apiService } from './api.service';
import { mockDiscoveryService } from './mockDiscovery.service';
import {
  DiscoveryProfile,
  DiscoveryFilters,
  DiscoveryResponse,
  MatchResponse,
  MatchAction,
  MatchesResponse,
  DiscoveryStats
} from '@/types/discovery.types';

// Check if we should use mock service
const USE_MOCK_DISCOVERY = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

class DiscoveryService {
  // Get discovery profiles with filters
  async getDiscoveryProfiles(filters?: Partial<DiscoveryFilters>, page = 1, limit = 10): Promise<DiscoveryResponse> {
    if (USE_MOCK_DISCOVERY) {
      return mockDiscoveryService.getDiscoveryProfiles(filters, page, limit);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    // Add filters to query params
    if (filters?.ageRange) {
      queryParams.append('minAge', filters.ageRange.min.toString());
      queryParams.append('maxAge', filters.ageRange.max.toString());
    }
    
    if (filters?.budgetRange) {
      queryParams.append('minBudget', filters.budgetRange.min.toString());
      queryParams.append('maxBudget', filters.budgetRange.max.toString());
    }
    
    if (filters?.location?.city) {
      queryParams.append('city', filters.location.city);
    }
    
    if (filters?.location?.state) {
      queryParams.append('state', filters.location.state);
    }
    
    if (filters?.genderPreference && filters.genderPreference !== 'no-preference') {
      queryParams.append('gender', filters.genderPreference);
    }
    
    if (filters?.housingType && filters.housingType.length > 0) {
      filters.housingType.forEach(type => queryParams.append('housingType', type));
    }
    
    if (filters?.lifestyle) {
      if (filters.lifestyle.cleanliness) queryParams.append('cleanliness', filters.lifestyle.cleanliness);
      if (filters.lifestyle.socialLevel) queryParams.append('socialLevel', filters.lifestyle.socialLevel);
      if (filters.lifestyle.sleepSchedule) queryParams.append('sleepSchedule', filters.lifestyle.sleepSchedule);
    }

    const response = await apiService.get<{
      profiles: any[],
      totalCount: number,
      hasMore: boolean
    }>(`/discovery/profiles?${queryParams.toString()}`);

    if (response.success && response.data) {
      const transformedProfiles = response.data.profiles.map(this.transformBackendProfile);
      
      return {
        success: response.success,
        data: {
          profiles: transformedProfiles,
          totalCount: response.data.totalCount,
          hasMore: response.data.hasMore,
          page
        },
        message: response.message || 'Profiles retrieved successfully'
      };
    }

    throw new Error('Failed to fetch discovery profiles');
  }

  // Perform match action (like, pass, super like)
  async performMatchAction(profileId: string, action: MatchAction): Promise<MatchResponse> {
    if (USE_MOCK_DISCOVERY) {
      return mockDiscoveryService.performMatchAction(profileId, action);
    }

    const response = await apiService.post<{
      match?: any,
      isMatch: boolean,
      profile: any
    }>('/discovery/action', {
      profileId,
      action
    });

    if (response.success) {
      return {
        success: response.success,
        data: {
          isMatch: response.data.isMatch,
          match: response.data.match ? this.transformBackendMatch(response.data.match) : undefined,
          profile: this.transformBackendProfile(response.data.profile)
        },
        message: response.message || 'Action performed successfully'
      };
    }

    throw new Error('Failed to perform match action');
  }

  // Get user's matches
  async getMatches(page = 1, limit = 20): Promise<MatchesResponse> {
    if (USE_MOCK_DISCOVERY) {
      return mockDiscoveryService.getMatches(page, limit);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await apiService.get<{
      matches: any[],
      totalCount: number,
      hasMore: boolean
    }>(`/matches?${queryParams.toString()}`);

    if (response.success && response.data) {
      const transformedMatches = response.data.matches.map(this.transformBackendMatch);
      
      return {
        success: response.success,
        data: {
          matches: transformedMatches,
          totalCount: response.data.totalCount,
          hasMore: response.data.hasMore,
          page
        },
        message: response.message || 'Matches retrieved successfully'
      };
    }

    throw new Error('Failed to fetch matches');
  }

  // Get discovery statistics
  async getDiscoveryStats(): Promise<{success: boolean, data: DiscoveryStats, message: string}> {
    if (USE_MOCK_DISCOVERY) {
      return mockDiscoveryService.getDiscoveryStats();
    }

    const response = await apiService.get<DiscoveryStats>('/discovery/stats');

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Stats retrieved successfully'
    };
  }

  // Unmatch with a user
  async unmatch(matchId: string): Promise<{success: boolean, message: string}> {
    if (USE_MOCK_DISCOVERY) {
      return mockDiscoveryService.unmatch(matchId);
    }

    const response = await apiService.delete(`/matches/${matchId}`);

    return {
      success: response.success,
      message: response.message || 'Unmatched successfully'
    };
  }

  // Report a profile
  async reportProfile(profileId: string, reason: string, details?: string): Promise<{success: boolean, message: string}> {
    if (USE_MOCK_DISCOVERY) {
      return mockDiscoveryService.reportProfile(profileId, reason, details);
    }

    const response = await apiService.post('/discovery/report', {
      profileId,
      reason,
      details
    });

    return {
      success: response.success,
      message: response.message || 'Profile reported successfully'
    };
  }

  // Block a profile
  async blockProfile(profileId: string): Promise<{success: boolean, message: string}> {
    if (USE_MOCK_DISCOVERY) {
      return mockDiscoveryService.blockProfile(profileId);
    }

    const response = await apiService.post('/discovery/block', {
      profileId
    });

    return {
      success: response.success,
      message: response.message || 'Profile blocked successfully'
    };
  }

  // Transform backend profile to frontend format
  private transformBackendProfile = (backendProfile: any): DiscoveryProfile => {
    const user = backendProfile.userId || backendProfile.user || backendProfile;
    
    return {
      id: backendProfile._id || backendProfile.id,
      userId: user._id || user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      age: this.calculateAge(user.dateOfBirth),
      bio: backendProfile.bio || '',
      occupation: backendProfile.occupation || '',
      education: backendProfile.education || '',
      location: {
        city: user.location?.city || '',
        state: user.location?.state || '',
        distance: backendProfile.distance || 0
      },
      photos: (backendProfile.photos || []).map((photo: any, index: number) => ({
        id: photo._id || `photo_${index}`,
        url: photo.url,
        isPrimary: photo.isPrimary || index === 0
      })),
      lifestyle: {
        cleanliness: backendProfile.lifestyle?.cleanliness || 'moderately-clean',
        socialLevel: backendProfile.lifestyle?.socialLevel || 'moderately-social',
        sleepSchedule: backendProfile.lifestyle?.sleepSchedule || 'flexible',
        smoking: backendProfile.lifestyle?.smoking || 'no-preference',
        drinking: backendProfile.lifestyle?.drinking || 'no-preference',
        pets: backendProfile.lifestyle?.pets || 'no-preference'
      },
      roommate: {
        budgetRange: backendProfile.housingPreferences?.budgetRange || { min: 0, max: 5000 },
        housingType: backendProfile.housingPreferences?.housingType || [],
        moveInDate: backendProfile.housingPreferences?.moveInDate || '',
        leaseDuration: backendProfile.housingPreferences?.leaseDuration || 'flexible'
      },
      interests: backendProfile.interests || [],
      compatibility: {
        score: backendProfile.compatibilityScore || 0,
        factors: backendProfile.compatibilityFactors || []
      },
      isVerified: backendProfile.verifications?.isIdentityVerified || false,
      lastActive: user.lastActiveAt ? new Date(user.lastActiveAt) : new Date(),
      profileCompletionScore: backendProfile.completeness || 0
    };
  };

  // Transform backend match to frontend format
  private transformBackendMatch = (backendMatch: any): any => {
    return {
      id: backendMatch._id || backendMatch.id,
      profile: this.transformBackendProfile(backendMatch.profile || backendMatch.matchedUser),
      matchedAt: new Date(backendMatch.createdAt || backendMatch.matchedAt),
      conversationId: backendMatch.conversationId,
      hasConversation: !!backendMatch.conversationId,
      compatibility: {
        score: backendMatch.compatibilityScore || 0,
        factors: backendMatch.compatibilityFactors || []
      }
    };
  };

  // Helper method to calculate age from date of birth
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

// Create and export singleton instance
export const discoveryService = new DiscoveryService();
export default discoveryService;
