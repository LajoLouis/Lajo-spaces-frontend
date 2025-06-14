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
const USE_MOCK_PROFILE = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.DEV;

class ProfileService {
  // Get user profile
  async getProfile(userId: string): Promise<ProfileResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.getProfile(userId);
    }

    const response = await apiService.get<UserProfile>(`/profiles/${userId}`);
    
    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Profile retrieved successfully',
    };
  }

  // Create new profile
  async createProfile(userId: string, data: Partial<UserProfile>): Promise<ProfileResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.createProfile(userId, data);
    }

    const response = await apiService.post<UserProfile>('/profiles', {
      userId,
      ...data,
    });

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Profile created successfully',
    };
  }

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ProfileUpdateResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.updateProfile(userId, updates);
    }

    const response = await apiService.put<Partial<UserProfile>>(`/profiles/${userId}`, updates);

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Profile updated successfully',
    };
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

  // Upload photos
  async uploadPhotos(userId: string, files: File[]): Promise<PhotoUploadResponse> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.uploadPhotos(userId, files);
    }

    // Create FormData for file upload
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`photos`, file);
    });
    formData.append('userId', userId);

    const response = await apiService.post<PhotoUploadResponse['data']>('/profiles/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Photos uploaded successfully',
    };
  }

  // Delete photo
  async deletePhoto(userId: string, photoId: string): Promise<void> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.deletePhoto(userId, photoId);
    }

    await apiService.delete(`/profiles/${userId}/photos/${photoId}`);
  }

  // Set primary photo
  async setPrimaryPhoto(userId: string, photoId: string): Promise<void> {
    if (USE_MOCK_PROFILE) {
      return mockProfileService.setPrimaryPhoto(userId, photoId);
    }

    await apiService.put(`/profiles/${userId}/photos/${photoId}/primary`, {});
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
}

// Create and export singleton instance
export const profileService = new ProfileService();
export default profileService;
