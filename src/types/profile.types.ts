// User Profile Types
export interface UserProfile {
  id: string;
  userId: string;
  
  // Basic Information
  bio: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  occupation: string;
  education: string;
  
  // Contact & Location
  phone?: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Photos
  photos: ProfilePhoto[];
  
  // Lifestyle & Preferences
  lifestyle: LifestylePreferences;
  roommate: RoommatePreferences;
  
  // Social & Interests
  interests: string[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  
  // Verification & Status
  isProfileComplete: boolean;
  profileCompletionScore: number;
  isVerified: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  order: number;
  uploadedAt: string;
}

export interface LifestylePreferences {
  // Living Habits
  sleepSchedule: 'early-bird' | 'night-owl' | 'flexible';
  cleanliness: 'very-clean' | 'moderately-clean' | 'relaxed';
  socialLevel: 'very-social' | 'moderately-social' | 'prefer-quiet';
  guestsPolicy: 'frequent-guests' | 'occasional-guests' | 'rare-guests' | 'no-guests';
  
  // Lifestyle Choices
  smoking: 'smoker' | 'non-smoker' | 'social-smoker' | 'no-preference';
  drinking: 'regular' | 'social' | 'rarely' | 'never' | 'no-preference';
  pets: 'have-pets' | 'love-pets' | 'allergic' | 'no-pets' | 'no-preference';
  
  // Work & Schedule
  workSchedule: 'traditional' | 'remote' | 'shift-work' | 'student' | 'unemployed';
  workFromHome: boolean;
  
  // Additional Preferences
  musicPreference: string[];
  dietaryRestrictions: string[];
  languages: string[];
}

export interface RoommatePreferences {
  // Basic Preferences
  ageRange: {
    min: number;
    max: number;
  };
  genderPreference: 'male' | 'female' | 'non-binary' | 'no-preference';
  
  // Housing Preferences
  housingType: ('apartment' | 'house' | 'condo' | 'studio' | 'shared-room')[];
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  moveInDate: string;
  leaseDuration: 'short-term' | 'long-term' | 'flexible';
  
  // Location Preferences
  preferredAreas: string[];
  maxCommuteTime: number; // in minutes
  transportationMode: ('car' | 'public-transport' | 'bike' | 'walk')[];
  
  // Roommate Characteristics
  preferredLifestyle: {
    cleanliness: ('very-clean' | 'moderately-clean' | 'relaxed')[];
    socialLevel: ('very-social' | 'moderately-social' | 'prefer-quiet')[];
    sleepSchedule: ('early-bird' | 'night-owl' | 'flexible')[];
  };
  
  // Deal Breakers
  dealBreakers: {
    smoking: boolean;
    pets: boolean;
    parties: boolean;
    overnight_guests: boolean;
  };
  
  // Additional Requirements
  mustHaves: string[];
  niceToHaves: string[];
}

// Onboarding Flow Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  isCompleted: boolean;
  order: number;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  skippedSteps: string[];
  overallProgress: number; // 0-100
}

// Form Data Types
export interface BasicInfoFormData {
  bio: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  education: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
}

export interface LifestyleFormData {
  sleepSchedule: string;
  cleanliness: string;
  socialLevel: string;
  guestsPolicy: string;
  smoking: string;
  drinking: string;
  pets: string;
  workSchedule: string;
  workFromHome: boolean;
  interests: string[];
  musicPreference: string[];
  dietaryRestrictions: string[];
  languages: string[];
}

export interface RoommatePreferencesFormData {
  ageRange: {
    min: number;
    max: number;
  };
  genderPreference: string;
  housingType: string[];
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  moveInDate: string;
  leaseDuration: string;
  preferredAreas: string[];
  maxCommuteTime: number;
  transportationMode: string[];
  preferredLifestyle: {
    cleanliness: string[];
    socialLevel: string[];
    sleepSchedule: string[];
  };
  dealBreakers: {
    smoking: boolean;
    pets: boolean;
    parties: boolean;
    overnight_guests: boolean;
  };
  mustHaves: string[];
  niceToHaves: string[];
}

export interface PhotoUploadFormData {
  photos: File[];
  primaryPhotoIndex: number;
}

// API Response Types
export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data: Partial<UserProfile>;
  message: string;
}

export interface PhotoUploadResponse {
  success: boolean;
  data: {
    photos: ProfilePhoto[];
  };
  message: string;
}

// Validation Types
export interface ProfileValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  completionScore: number;
  missingFields: string[];
}

// Constants
export const ONBOARDING_STEPS = [
  'basic-info',
  'photos',
  'lifestyle',
  'roommate-preferences',
  'review'
] as const;

export const PROFILE_COMPLETION_WEIGHTS = {
  basicInfo: 25,
  photos: 20,
  lifestyle: 25,
  roommatePreferences: 25,
  verification: 5,
} as const;

export const INTERESTS_OPTIONS = [
  'Reading', 'Movies', 'Music', 'Sports', 'Gaming', 'Cooking', 'Travel',
  'Photography', 'Art', 'Dancing', 'Hiking', 'Yoga', 'Fitness', 'Technology',
  'Fashion', 'Food', 'Wine', 'Coffee', 'Pets', 'Gardening', 'DIY', 'Crafts',
  'Writing', 'Learning', 'Volunteering', 'Networking', 'Meditation'
] as const;

export const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Jazz',
  'Classical', 'Reggae', 'Blues', 'Folk', 'Indie', 'Alternative', 'Punk',
  'Metal', 'Latin', 'World', 'Ambient', 'Instrumental'
] as const;

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi',
  'Dutch', 'Swedish', 'Norwegian', 'Other'
] as const;
