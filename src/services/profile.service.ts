import { apiService } from './api.service';
import { mockProfileService } from './mockProfile.service';
import { 
  UserProfile,
  ProfileResponse,
  ProfileUpdateResponse,
  PhotoUploadResponse,
  BasicInfoFormData,
  LifestyleFormData,
  RoommatePreferencesFormData
} from '@/types/profile.types';

// Check if we should use mock service
const USE_MOCK_PROFILE = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

class ProfileService {
  // Get user profile
  async getProfile(userId: string): Promise<ProfileResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.getProfile(userId);
    }

    // Backend returns current user's profile at /profiles endpoint
    const response = await apiService.get<{profile: any}>('/profiles');

    if (response.success && response.data.profile) {
      // Transform backend profile to frontend format
      const backendProfile = response.data.profile;
      const transformedProfile: UserProfile = this.transformBackendProfile(backendProfile);

      return {
        success: response.success,
        data: transformedProfile,
        message: response.message || 'Profile retrieved successfully',
      };
    }

    throw new Error('Profile not found');
  }

  // Create new profile
  async createProfile(userId: string, data: Partial<UserProfile>): Promise<ProfileResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.createProfile(userId, data);
    }

    // Transform frontend data to backend format
    const backendData = this.transformToBackendFormat(data);

    const response = await apiService.post<{profile: any}>('/profiles', backendData);

    if (response.success && response.data.profile) {
      const transformedProfile = this.transformBackendProfile(response.data.profile);

      return {
        success: response.success,
        data: transformedProfile,
        message: response.message || 'Profile created successfully',
      };
    }

    throw new Error('Failed to create profile');
  }

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ProfileUpdateResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.updateProfile(userId, updates);
    }

    // Transform frontend updates to backend format
    const backendUpdates = this.transformToBackendFormat(updates);

    const response = await apiService.put<{profile: any}>('/profiles', backendUpdates);

    if (response.success) {
      return {
        success: response.success,
        data: updates, // Return the original updates for frontend compatibility
        message: response.message || 'Profile updated successfully',
      };
    }

    throw new Error('Failed to update profile');
  }

  // Update basic information
  async updateBasicInfo(userId: string, data: BasicInfoFormData): Promise<ProfileUpdateResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.updateBasicInfo(userId, data);
    }

    const response = await apiService.put<Partial<UserProfile>>(`/profiles/${userId}/basic-info`, data);

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Basic information updated successfully',
    };
  }

  // Update lifestyle preferences
  async updateLifestyle(userId: string, data: LifestyleFormData): Promise<ProfileUpdateResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.updateLifestyle(userId, data);
    }

    const response = await apiService.put<Partial<UserProfile>>(`/profiles/${userId}/lifestyle`, data);

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Lifestyle preferences updated successfully',
    };
  }

  // Update roommate preferences
  async updateRoommatePreferences(userId: string, data: RoommatePreferencesFormData): Promise<ProfileUpdateResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.updateRoommatePreferences(userId, data);
    }

    const response = await apiService.put<Partial<UserProfile>>(`/profiles/${userId}/roommate-preferences`, data);

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Roommate preferences updated successfully',
    };
  }

  // Upload photos (single photo upload to match backend)
  async uploadPhotos(userId: string, files: File[]): Promise<PhotoUploadResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.uploadPhotos(userId, files);
    }

    // Backend supports single photo upload, so we'll upload files one by one
    const uploadedPhotos = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiService.post<any>('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file upload
      });

      if (response.success && response.data) {
        uploadedPhotos.push({
          id: response.data.photo.id,
          url: response.data.photo.url,
          publicId: response.data.photo.publicId,
          isPrimary: response.data.photo.isPrimary,
          uploadedAt: response.data.photo.uploadedAt,
        });
      }
    }

    return {
      success: true,
      data: {
        photos: uploadedPhotos,
        profile: {
          totalPhotos: uploadedPhotos.length,
          completionScore: 0, // Will be calculated by backend
        },
      },
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
    };
  }

  // Upload single photo
  async uploadSinglePhoto(file: File): Promise<ProfilePhotoUploadResponse> {
    if (USE_MOCK_PROFILE) {
      // Mock implementation for single photo
      return {
        success: true,
        data: {
          photo: {
            id: Math.random().toString(36),
            url: URL.createObjectURL(file),
            publicId: 'mock_' + Date.now(),
            isPrimary: false,
            uploadedAt: new Date().toISOString(),
          },
          sizes: {
            thumbnail: URL.createObjectURL(file),
            small: URL.createObjectURL(file),
            medium: URL.createObjectURL(file),
            large: URL.createObjectURL(file),
          },
          profile: {
            totalPhotos: 1,
            completionScore: 75,
          },
        },
        message: 'Photo uploaded successfully',
      };
    }

    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiService.post<ProfilePhotoUploadResponse['data']>('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file upload
    });

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Photo uploaded successfully',
    };
  }

  // Delete photo
  async deletePhoto(userId: string, photoId: string): Promise<void> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.deletePhoto(userId, photoId);
    }

    await apiService.delete(`/photos/${photoId}`);
  }

  // Set primary photo
  async setPrimaryPhoto(userId: string, photoId: string): Promise<void> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.setPrimaryPhoto(userId, photoId);
    }

    await apiService.patch(`/photos/${photoId}/primary`, {});
  }

  // Get user photos
  async getUserPhotos(): Promise<{ success: boolean; data: any[]; message: string }> {
    if (USE_MOCK_PROFILE) {
      return {
        success: true,
        data: [],
        message: 'Photos retrieved successfully',
      };
    }

    const response = await apiService.get<{ photos: any[] }>('/photos');

    return {
      success: response.success,
      data: response.data?.photos || [],
      message: response.message || 'Photos retrieved successfully',
    };
  }

  // Check if profile exists
  async profileExists(userId: string): Promise<boolean> {
    try {
      await this.getProfile(userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get profile completion status
  async getProfileCompletion(userId: string): Promise<{
    score: number;
    isComplete: boolean;
    missingFields: string[];
  }> {
    try {
      const response = await this.getProfile(userId);
      const profile = response.data;

      const missingFields: string[] = [];
      let score = 0;

      // Check basic info
      if (!profile.bio || profile.bio.length < 50) {
        missingFields.push('bio');
      } else {
        score += 25;
      }

      // Check photos
      if (!profile.photos || profile.photos.length === 0) {
        missingFields.push('photos');
      } else {
        score += 20;
      }

      // Check lifestyle
      if (!profile.interests || profile.interests.length === 0) {
        missingFields.push('interests');
      } else {
        score += 25;
      }

      // Check roommate preferences
      if (!profile.roommate?.budgetRange?.min || !profile.roommate?.budgetRange?.max) {
        missingFields.push('budget');
      } else {
        score += 25;
      }

      // Verification bonus
      if (profile.isVerified) {
        score += 5;
      }

      return {
        score: Math.min(score, 100),
        isComplete: score >= 80,
        missingFields,
      };
    } catch (error) {
      return {
        score: 0,
        isComplete: false,
        missingFields: ['profile'],
      };
    }
  }

  // Initialize profile for new user
  async initializeProfile(userId: string): Promise<ProfileResponse> {
    const exists = await this.profileExists(userId);
    
    if (exists) {
      return this.getProfile(userId);
    }

    // Create minimal profile
    return this.createProfile(userId, {
      bio: '',
      dateOfBirth: '',
      gender: 'prefer-not-to-say',
      occupation: '',
      education: '',
      location: {
        city: '',
        state: '',
        country: '',
      },
      photos: [],
      interests: [],
    });
  }

  // Validate profile data
  validateBasicInfo(data: BasicInfoFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.bio || data.bio.length < 50) {
      errors.bio = 'Bio must be at least 50 characters long';
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      }
      
      if (age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (!data.gender) {
      errors.gender = 'Gender selection is required';
    }

    if (!data.location?.city) {
      errors.city = 'City is required';
    }

    if (!data.location?.state) {
      errors.state = 'State is required';
    }

    if (!data.location?.country) {
      errors.country = 'Country is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Validate roommate preferences
  validateRoommatePreferences(data: RoommatePreferencesFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.budgetRange?.min || data.budgetRange.min < 0) {
      errors.budgetMin = 'Minimum budget must be greater than 0';
    }

    if (!data.budgetRange?.max || data.budgetRange.max < 0) {
      errors.budgetMax = 'Maximum budget must be greater than 0';
    }

    if (data.budgetRange?.min && data.budgetRange?.max && data.budgetRange.min >= data.budgetRange.max) {
      errors.budgetRange = 'Maximum budget must be greater than minimum budget';
    }

    if (!data.ageRange?.min || data.ageRange.min < 18) {
      errors.ageMin = 'Minimum age must be at least 18';
    }

    if (!data.ageRange?.max || data.ageRange.max > 100) {
      errors.ageMax = 'Maximum age must be less than 100';
    }

    if (data.ageRange?.min && data.ageRange?.max && data.ageRange.min >= data.ageRange.max) {
      errors.ageRange = 'Maximum age must be greater than minimum age';
    }

    if (!data.moveInDate) {
      errors.moveInDate = 'Move-in date is required';
    } else {
      const moveInDate = new Date(data.moveInDate);
      const today = new Date();
      
      if (moveInDate < today) {
        errors.moveInDate = 'Move-in date cannot be in the past';
      }
    }

    if (!data.housingType || data.housingType.length === 0) {
      errors.housingType = 'At least one housing type must be selected';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Transform backend profile format to frontend format
  private transformBackendProfile(backendProfile: any): UserProfile {
    return {
      id: backendProfile.id || backendProfile._id,
      userId: backendProfile.userId?._id || backendProfile.userId,

      // Basic Information
      bio: backendProfile.bio || '',
      dateOfBirth: backendProfile.userId?.dateOfBirth || '',
      gender: backendProfile.userId?.gender || 'prefer-not-to-say',
      occupation: backendProfile.occupation || '',
      education: backendProfile.education || '',

      // Contact & Location
      phone: backendProfile.userId?.phoneNumber,
      location: backendProfile.userId?.location || {
        city: '',
        state: '',
        country: '',
      },

      // Photos
      photos: (backendProfile.photos || []).map((photo: any, index: number) => ({
        id: photo._id || `photo_${index}`,
        url: photo.url,
        thumbnailUrl: photo.url, // Backend doesn't have separate thumbnail
        isPrimary: photo.isPrimary || index === 0,
        order: index,
        uploadedAt: photo.uploadedAt || new Date().toISOString(),
      })),

      // Lifestyle & Preferences (with defaults)
      lifestyle: {
        sleepSchedule: backendProfile.lifestyle?.sleepSchedule || 'flexible',
        cleanliness: backendProfile.lifestyle?.cleanliness || 'moderately-clean',
        socialLevel: backendProfile.lifestyle?.socialLevel || 'moderately-social',
        guestsPolicy: backendProfile.lifestyle?.guestsPolicy || 'occasional-guests',
        smoking: backendProfile.lifestyle?.smoking || 'no-preference',
        drinking: backendProfile.lifestyle?.drinking || 'no-preference',
        pets: backendProfile.lifestyle?.pets || 'no-preference',
        workSchedule: backendProfile.lifestyle?.workSchedule || 'traditional',
        workFromHome: backendProfile.lifestyle?.workFromHome || false,
        musicPreference: backendProfile.lifestyle?.musicPreference || [],
        dietaryRestrictions: backendProfile.lifestyle?.dietaryRestrictions || [],
        languages: backendProfile.languages || ['English'],
      },

      // Roommate preferences (with defaults)
      roommate: {
        ageRange: backendProfile.roommatePreferences?.ageRange || { min: 18, max: 65 },
        genderPreference: this.mapBackendGenderPreference(backendProfile.roommatePreferences?.genderPreference),
        housingType: backendProfile.housingPreferences?.housingType || [],
        budgetRange: backendProfile.housingPreferences?.budgetRange || { min: 0, max: 5000 },
        moveInDate: backendProfile.housingPreferences?.moveInDate || '',
        leaseDuration: backendProfile.housingPreferences?.leaseDuration || 'flexible',
        preferredAreas: backendProfile.housingPreferences?.preferredAreas || [],
        maxCommuteTime: backendProfile.housingPreferences?.maxCommuteTime || 60,
        transportationMode: backendProfile.housingPreferences?.transportationMode || [],
        preferredLifestyle: {
          cleanliness: backendProfile.roommatePreferences?.lifestyle?.cleanliness || [],
          socialLevel: backendProfile.roommatePreferences?.lifestyle?.socialLevel || [],
          sleepSchedule: backendProfile.roommatePreferences?.lifestyle?.sleepSchedule || [],
        },
        dealBreakers: backendProfile.roommatePreferences?.dealBreakers || {
          smoking: false,
          pets: false,
          parties: false,
          overnight_guests: false,
        },
        mustHaves: backendProfile.roommatePreferences?.mustHaves || [],
        niceToHaves: backendProfile.roommatePreferences?.niceToHaves || [],
      },

      // Social & Interests
      interests: backendProfile.interests || [],
      socialMedia: backendProfile.socialMedia,

      // Profile Status
      isProfileComplete: backendProfile.isProfileComplete || false,
      profileCompletionScore: backendProfile.completeness || 0,
      isVerified: backendProfile.verifications?.isIdentityVerified || false,
      createdAt: backendProfile.createdAt || new Date().toISOString(),
      updatedAt: backendProfile.updatedAt || new Date().toISOString(),
    };
  }

  // Transform frontend profile format to backend format
  private transformToBackendFormat(frontendData: Partial<UserProfile>): any {
    return {
      bio: frontendData.bio,
      occupation: frontendData.occupation,
      education: frontendData.education,
      languages: frontendData.lifestyle?.languages || [],
      interests: frontendData.interests || [],
      hobbies: [], // Backend has hobbies field
      socialMedia: frontendData.socialMedia,

      // Lifestyle preferences
      lifestyle: frontendData.lifestyle ? {
        sleepSchedule: frontendData.lifestyle.sleepSchedule,
        cleanliness: frontendData.lifestyle.cleanliness,
        socialLevel: frontendData.lifestyle.socialLevel,
        guestsPolicy: frontendData.lifestyle.guestsPolicy,
        smoking: frontendData.lifestyle.smoking,
        drinking: frontendData.lifestyle.drinking,
        pets: frontendData.lifestyle.pets,
        workSchedule: frontendData.lifestyle.workSchedule,
        workFromHome: frontendData.lifestyle.workFromHome,
        musicPreference: frontendData.lifestyle.musicPreference,
        dietaryRestrictions: frontendData.lifestyle.dietaryRestrictions,
      } : undefined,

      // Housing preferences
      housingPreferences: frontendData.roommate ? {
        housingType: frontendData.roommate.housingType,
        budgetRange: frontendData.roommate.budgetRange,
        moveInDate: frontendData.roommate.moveInDate,
        leaseDuration: frontendData.roommate.leaseDuration,
        preferredAreas: frontendData.roommate.preferredAreas,
        maxCommuteTime: frontendData.roommate.maxCommuteTime,
        transportationMode: frontendData.roommate.transportationMode,
      } : undefined,

      // Roommate preferences
      roommatePreferences: frontendData.roommate ? {
        ageRange: frontendData.roommate.ageRange,
        genderPreference: this.mapFrontendGenderPreference(frontendData.roommate.genderPreference),
        lifestyle: frontendData.roommate.preferredLifestyle,
        dealBreakers: frontendData.roommate.dealBreakers,
        mustHaves: frontendData.roommate.mustHaves,
        niceToHaves: frontendData.roommate.niceToHaves,
      } : undefined,
    };
  }

  // Map backend gender preference to frontend format
  private mapBackendGenderPreference(backendValue: string): 'male' | 'female' | 'any' | 'same-gender' | 'different-gender' {
    // Handle backend format to frontend format mapping
    switch (backendValue) {
      case 'male':
      case 'female':
      case 'any':
      case 'same-gender':
      case 'different-gender':
        return backendValue;
      case 'no-preference':
        return 'any'; // Map legacy 'no-preference' to 'any'
      default:
        return 'any'; // Default fallback
    }
  }

  // Map frontend gender preference to backend format
  private mapFrontendGenderPreference(frontendValue: string): string {
    // Ensure we send valid backend values
    switch (frontendValue) {
      case 'male':
      case 'female':
      case 'any':
      case 'same-gender':
      case 'different-gender':
        return frontendValue;
      case 'no-preference':
        return 'any'; // Map legacy 'no-preference' to 'any'
      default:
        return 'any'; // Default fallback
    }
  }
}

// Create and export singleton instance
export const profileService = new ProfileService();
export default profileService;
