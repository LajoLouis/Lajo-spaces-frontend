import { 
  UserProfile, 
  ProfileResponse,
  ProfileUpdateResponse,
  PhotoUploadResponse,
  BasicInfoFormData,
  LifestyleFormData,
  RoommatePreferencesFormData,
  ProfilePhoto
} from '@/types/profile.types';

// Mock profile database
const mockProfiles: UserProfile[] = [];

// Mock photo storage
const mockPhotos: ProfilePhoto[] = [];

// Simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock photo URLs
const generateMockPhotoUrl = (index: number): string => {
  const photoIds = [
    'photo-1507003211169-0a1dd7228f2d', // Professional headshot
    'photo-1494790108755-2616b612b786', // Casual photo
    'photo-1517841905240-472988babdf9', // Lifestyle photo
    'photo-1524504388940-b1c1722653e1', // Social photo
    'photo-1488161628813-04466f872be2', // Activity photo
  ];
  const photoId = photoIds[index % photoIds.length];
  return `https://images.unsplash.com/${photoId}?w=400&h=400&fit=crop&crop=face`;
};

class MockProfileService {
  // Get user profile
  async getProfile(userId: string): Promise<ProfileResponse> {
    await delay(800);

    const profile = mockProfiles.find(p => p.userId === userId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    };
  }

  // Create new profile
  async createProfile(userId: string, data: Partial<UserProfile>): Promise<ProfileResponse> {
    await delay(1500);

    // Check if profile already exists
    const existingProfile = mockProfiles.find(p => p.userId === userId);
    if (existingProfile) {
      throw new Error('Profile already exists for this user');
    }

    const newProfile: UserProfile = {
      id: `profile_${Date.now()}`,
      userId,
      bio: data.bio || '',
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || 'prefer-not-to-say',
      occupation: data.occupation || '',
      education: data.education || '',
      phone: data.phone,
      location: data.location || {
        city: '',
        state: '',
        country: '',
      },
      photos: data.photos || [],
      lifestyle: data.lifestyle || {
        sleepSchedule: 'flexible',
        cleanliness: 'moderately-clean',
        socialLevel: 'moderately-social',
        guestsPolicy: 'occasional-guests',
        smoking: 'no-preference',
        drinking: 'no-preference',
        pets: 'no-preference',
        workSchedule: 'traditional',
        workFromHome: false,
        musicPreference: [],
        dietaryRestrictions: [],
        languages: ['English'],
      },
      roommate: data.roommate || {
        ageRange: { min: 18, max: 35 },
        genderPreference: 'no-preference',
        housingType: ['apartment'],
        budgetRange: { min: 500, max: 1500, currency: 'USD' },
        moveInDate: new Date().toISOString().split('T')[0],
        leaseDuration: 'long-term',
        preferredAreas: [],
        maxCommuteTime: 30,
        transportationMode: ['car'],
        preferredLifestyle: {
          cleanliness: ['moderately-clean'],
          socialLevel: ['moderately-social'],
          sleepSchedule: ['flexible'],
        },
        dealBreakers: {
          smoking: false,
          pets: false,
          parties: false,
          overnight_guests: false,
        },
        mustHaves: [],
        niceToHaves: [],
      },
      interests: data.interests || [],
      socialMedia: data.socialMedia,
      isProfileComplete: false,
      profileCompletionScore: 0,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calculate completion score
    newProfile.profileCompletionScore = this.calculateCompletionScore(newProfile);
    newProfile.isProfileComplete = newProfile.profileCompletionScore >= 80;

    mockProfiles.push(newProfile);

    return {
      success: true,
      data: newProfile,
      message: 'Profile created successfully',
    };
  }

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ProfileUpdateResponse> {
    await delay(1000);

    const profileIndex = mockProfiles.findIndex(p => p.userId === userId);
    
    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }

    const updatedProfile = {
      ...mockProfiles[profileIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate completion score
    updatedProfile.profileCompletionScore = this.calculateCompletionScore(updatedProfile);
    updatedProfile.isProfileComplete = updatedProfile.profileCompletionScore >= 80;

    mockProfiles[profileIndex] = updatedProfile;

    return {
      success: true,
      data: updates,
      message: 'Profile updated successfully',
    };
  }

  // Update basic info
  async updateBasicInfo(userId: string, data: BasicInfoFormData): Promise<ProfileUpdateResponse> {
    await delay(800);

    const updates: Partial<UserProfile> = {
      bio: data.bio,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as any,
      occupation: data.occupation,
      education: data.education,
      location: data.location,
    };

    return this.updateProfile(userId, updates);
  }

  // Update lifestyle preferences
  async updateLifestyle(userId: string, data: LifestyleFormData): Promise<ProfileUpdateResponse> {
    await delay(800);

    const updates: Partial<UserProfile> = {
      lifestyle: {
        sleepSchedule: data.sleepSchedule as any,
        cleanliness: data.cleanliness as any,
        socialLevel: data.socialLevel as any,
        guestsPolicy: data.guestsPolicy as any,
        smoking: data.smoking as any,
        drinking: data.drinking as any,
        pets: data.pets as any,
        workSchedule: data.workSchedule as any,
        workFromHome: data.workFromHome,
        musicPreference: data.musicPreference,
        dietaryRestrictions: data.dietaryRestrictions,
        languages: data.languages,
      },
      interests: data.interests,
    };

    return this.updateProfile(userId, updates);
  }

  // Update roommate preferences
  async updateRoommatePreferences(userId: string, data: RoommatePreferencesFormData): Promise<ProfileUpdateResponse> {
    await delay(800);

    const updates: Partial<UserProfile> = {
      roommate: {
        ageRange: data.ageRange,
        genderPreference: data.genderPreference as any,
        housingType: data.housingType as any,
        budgetRange: data.budgetRange,
        moveInDate: data.moveInDate,
        leaseDuration: data.leaseDuration as any,
        preferredAreas: data.preferredAreas,
        maxCommuteTime: data.maxCommuteTime,
        transportationMode: data.transportationMode as any,
        preferredLifestyle: {
          cleanliness: data.preferredLifestyle.cleanliness as any,
          socialLevel: data.preferredLifestyle.socialLevel as any,
          sleepSchedule: data.preferredLifestyle.sleepSchedule as any,
        },
        dealBreakers: data.dealBreakers,
        mustHaves: data.mustHaves,
        niceToHaves: data.niceToHaves,
      },
    };

    return this.updateProfile(userId, updates);
  }

  // Upload photos
  async uploadPhotos(userId: string, files: File[]): Promise<PhotoUploadResponse> {
    await delay(2000); // Longer delay for file upload simulation

    const profile = mockProfiles.find(p => p.userId === userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Generate mock photos
    const newPhotos: ProfilePhoto[] = files.map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      url: generateMockPhotoUrl(profile.photos.length + index),
      thumbnailUrl: generateMockPhotoUrl(profile.photos.length + index) + '&w=150&h=150',
      isPrimary: profile.photos.length === 0 && index === 0, // First photo is primary if no photos exist
      order: profile.photos.length + index,
      uploadedAt: new Date().toISOString(),
    }));

    // Add to mock storage
    mockPhotos.push(...newPhotos);

    // Update profile
    profile.photos = [...profile.photos, ...newPhotos];
    profile.updatedAt = new Date().toISOString();

    // Recalculate completion score
    profile.profileCompletionScore = this.calculateCompletionScore(profile);
    profile.isProfileComplete = profile.profileCompletionScore >= 80;

    return {
      success: true,
      data: {
        photos: newPhotos,
      },
      message: `${newPhotos.length} photo(s) uploaded successfully`,
    };
  }

  // Delete photo
  async deletePhoto(userId: string, photoId: string): Promise<void> {
    await delay(500);

    const profile = mockProfiles.find(p => p.userId === userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.photos = profile.photos.filter(photo => photo.id !== photoId);
    profile.updatedAt = new Date().toISOString();

    // Remove from mock storage
    const photoIndex = mockPhotos.findIndex(photo => photo.id === photoId);
    if (photoIndex !== -1) {
      mockPhotos.splice(photoIndex, 1);
    }
  }

  // Set primary photo
  async setPrimaryPhoto(userId: string, photoId: string): Promise<void> {
    await delay(500);

    const profile = mockProfiles.find(p => p.userId === userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Update primary photo
    profile.photos = profile.photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId,
    }));

    profile.updatedAt = new Date().toISOString();
  }

  // Calculate profile completion score
  private calculateCompletionScore(profile: UserProfile): number {
    let score = 0;

    // Basic info (25 points)
    if (profile.bio && profile.bio.length >= 50) score += 10;
    if (profile.dateOfBirth) score += 5;
    if (profile.gender && profile.gender !== 'prefer-not-to-say') score += 3;
    if (profile.occupation) score += 4;
    if (profile.education) score += 3;

    // Photos (20 points)
    if (profile.photos.length >= 1) score += 10;
    if (profile.photos.length >= 3) score += 5;
    if (profile.photos.length >= 5) score += 5;

    // Lifestyle (25 points)
    if (profile.interests && profile.interests.length >= 3) score += 10;
    if (profile.lifestyle.musicPreference.length > 0) score += 5;
    if (profile.lifestyle.languages.length > 1) score += 5;
    if (profile.lifestyle.workSchedule !== 'traditional') score += 5;

    // Roommate preferences (25 points)
    if (profile.roommate.budgetRange.min && profile.roommate.budgetRange.max) score += 10;
    if (profile.roommate.preferredAreas.length > 0) score += 5;
    if (profile.roommate.mustHaves.length > 0) score += 5;
    if (profile.roommate.moveInDate) score += 5;

    // Verification (5 points)
    if (profile.isVerified) score += 5;

    return Math.min(score, 100);
  }

  // Get mock profiles (for development)
  getMockProfiles(): UserProfile[] {
    return mockProfiles;
  }

  // Reset mock data (for development)
  resetMockData(): void {
    mockProfiles.length = 0;
    mockPhotos.length = 0;
  }
}

// Create and export singleton instance
export const mockProfileService = new MockProfileService();
export default mockProfileService;
