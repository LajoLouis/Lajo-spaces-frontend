import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  UserProfile, 
  OnboardingProgress, 
  BasicInfoFormData,
  LifestyleFormData,
  RoommatePreferencesFormData,
  PhotoUploadFormData,
  ProfileValidation,
  ONBOARDING_STEPS,
  PROFILE_COMPLETION_WEIGHTS
} from '@/types/profile.types';

interface ProfileStore {
  // State
  profile: UserProfile | null;
  onboardingProgress: OnboardingProgress;
  isLoading: boolean;
  error: string | null;
  
  // Draft data (for form persistence)
  draftBasicInfo: Partial<BasicInfoFormData>;
  draftLifestyle: Partial<LifestyleFormData>;
  draftRoommatePreferences: Partial<RoommatePreferencesFormData>;
  draftPhotos: Partial<PhotoUploadFormData>;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  
  // Onboarding actions
  setCurrentStep: (step: number) => void;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  resetOnboarding: () => void;
  
  // Draft actions
  updateDraftBasicInfo: (data: Partial<BasicInfoFormData>) => void;
  updateDraftLifestyle: (data: Partial<LifestyleFormData>) => void;
  updateDraftRoommatePreferences: (data: Partial<RoommatePreferencesFormData>) => void;
  updateDraftPhotos: (data: Partial<PhotoUploadFormData>) => void;
  clearDrafts: () => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  calculateCompletionScore: () => number;
  validateProfile: () => ProfileValidation;
  getNextIncompleteStep: () => string | null;
}

const initialOnboardingProgress: OnboardingProgress = {
  currentStep: 0,
  totalSteps: ONBOARDING_STEPS.length,
  completedSteps: [],
  skippedSteps: [],
  overallProgress: 0,
};

export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        profile: null,
        onboardingProgress: initialOnboardingProgress,
        isLoading: false,
        error: null,
        
        // Draft data
        draftBasicInfo: {},
        draftLifestyle: {},
        draftRoommatePreferences: {},
        draftPhotos: {},
        
        // Profile actions
        setProfile: (profile) => {
          set({ profile, error: null });
        },
        
        updateProfile: (updates) => {
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...updates } : null,
            error: null,
          }));
        },
        
        clearProfile: () => {
          set({
            profile: null,
            onboardingProgress: initialOnboardingProgress,
            draftBasicInfo: {},
            draftLifestyle: {},
            draftRoommatePreferences: {},
            draftPhotos: {},
            error: null,
          });
        },
        
        // Onboarding actions
        setCurrentStep: (step) => {
          set((state) => ({
            onboardingProgress: {
              ...state.onboardingProgress,
              currentStep: step,
            },
          }));
        },
        
        completeStep: (stepId) => {
          set((state) => {
            const completedSteps = [...state.onboardingProgress.completedSteps];
            if (!completedSteps.includes(stepId)) {
              completedSteps.push(stepId);
            }
            
            const skippedSteps = state.onboardingProgress.skippedSteps.filter(
              (id) => id !== stepId
            );
            
            const overallProgress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;
            
            return {
              onboardingProgress: {
                ...state.onboardingProgress,
                completedSteps,
                skippedSteps,
                overallProgress,
              },
            };
          });
        },
        
        skipStep: (stepId) => {
          set((state) => {
            const skippedSteps = [...state.onboardingProgress.skippedSteps];
            if (!skippedSteps.includes(stepId)) {
              skippedSteps.push(stepId);
            }
            
            const completedSteps = state.onboardingProgress.completedSteps.filter(
              (id) => id !== stepId
            );
            
            return {
              onboardingProgress: {
                ...state.onboardingProgress,
                completedSteps,
                skippedSteps,
              },
            };
          });
        },
        
        resetOnboarding: () => {
          set({ onboardingProgress: initialOnboardingProgress });
        },
        
        // Draft actions
        updateDraftBasicInfo: (data) => {
          set((state) => ({
            draftBasicInfo: { ...state.draftBasicInfo, ...data },
          }));
        },
        
        updateDraftLifestyle: (data) => {
          set((state) => ({
            draftLifestyle: { ...state.draftLifestyle, ...data },
          }));
        },
        
        updateDraftRoommatePreferences: (data) => {
          set((state) => ({
            draftRoommatePreferences: { ...state.draftRoommatePreferences, ...data },
          }));
        },
        
        updateDraftPhotos: (data) => {
          set((state) => ({
            draftPhotos: { ...state.draftPhotos, ...data },
          }));
        },
        
        clearDrafts: () => {
          set({
            draftBasicInfo: {},
            draftLifestyle: {},
            draftRoommatePreferences: {},
            draftPhotos: {},
          });
        },
        
        // Utility actions
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        
        setError: (error) => {
          set({ error });
        },
        
        calculateCompletionScore: () => {
          const state = get();
          const profile = state.profile;
          
          if (!profile) return 0;
          
          let score = 0;
          
          // Basic info score
          if (profile.bio && profile.dateOfBirth && profile.gender && profile.occupation) {
            score += PROFILE_COMPLETION_WEIGHTS.basicInfo;
          }
          
          // Photos score
          if (profile.photos && profile.photos.length > 0) {
            score += PROFILE_COMPLETION_WEIGHTS.photos;
          }
          
          // Lifestyle score
          if (profile.lifestyle && profile.interests && profile.interests.length > 0) {
            score += PROFILE_COMPLETION_WEIGHTS.lifestyle;
          }
          
          // Roommate preferences score
          if (profile.roommate && profile.roommate.budgetRange) {
            score += PROFILE_COMPLETION_WEIGHTS.roommatePreferences;
          }
          
          // Verification score
          if (profile.isVerified) {
            score += PROFILE_COMPLETION_WEIGHTS.verification;
          }
          
          return Math.min(score, 100);
        },
        
        validateProfile: () => {
          const state = get();
          const profile = state.profile;
          
          const errors: Record<string, string[]> = {};
          const warnings: Record<string, string[]> = {};
          const missingFields: string[] = [];
          
          if (!profile) {
            return {
              isValid: false,
              errors: { profile: ['Profile not found'] },
              warnings: {},
              completionScore: 0,
              missingFields: ['profile'],
            };
          }
          
          // Validate basic info
          if (!profile.bio || profile.bio.length < 50) {
            errors.bio = ['Bio must be at least 50 characters long'];
            missingFields.push('bio');
          }
          
          if (!profile.dateOfBirth) {
            errors.dateOfBirth = ['Date of birth is required'];
            missingFields.push('dateOfBirth');
          }
          
          if (!profile.occupation) {
            warnings.occupation = ['Adding your occupation helps with matching'];
            missingFields.push('occupation');
          }
          
          // Validate photos
          if (!profile.photos || profile.photos.length === 0) {
            errors.photos = ['At least one photo is required'];
            missingFields.push('photos');
          }
          
          // Validate roommate preferences
          if (!profile.roommate?.budgetRange?.min || !profile.roommate?.budgetRange?.max) {
            errors.budget = ['Budget range is required'];
            missingFields.push('budget');
          }
          
          const completionScore = state.calculateCompletionScore();
          const isValid = Object.keys(errors).length === 0 && completionScore >= 80;
          
          return {
            isValid,
            errors,
            warnings,
            completionScore,
            missingFields,
          };
        },
        
        getNextIncompleteStep: () => {
          const state = get();
          const { completedSteps, skippedSteps } = state.onboardingProgress;
          
          for (const step of ONBOARDING_STEPS) {
            if (!completedSteps.includes(step) && !skippedSteps.includes(step)) {
              return step;
            }
          }
          
          return null;
        },
      }),
      {
        name: 'profile-store',
        // Only persist non-sensitive data
        partialize: (state) => ({
          onboardingProgress: state.onboardingProgress,
          draftBasicInfo: state.draftBasicInfo,
          draftLifestyle: state.draftLifestyle,
          draftRoommatePreferences: state.draftRoommatePreferences,
          // Don't persist draft photos (files can't be serialized)
        }),
      }
    ),
    {
      name: 'profile-store',
    }
  )
);

// Selectors for common use cases
export const useProfile = () => {
  const store = useProfileStore();
  return {
    profile: store.profile,
    isLoading: store.isLoading,
    error: store.error,
    completionScore: store.calculateCompletionScore(),
    validation: store.validateProfile(),
  };
};

export const useOnboarding = () => {
  const store = useProfileStore();
  return {
    progress: store.onboardingProgress,
    currentStep: store.onboardingProgress.currentStep,
    setCurrentStep: store.setCurrentStep,
    completeStep: store.completeStep,
    skipStep: store.skipStep,
    resetOnboarding: store.resetOnboarding,
    nextIncompleteStep: store.getNextIncompleteStep(),
  };
};

export const useDrafts = () => {
  const store = useProfileStore();
  return {
    basicInfo: store.draftBasicInfo,
    lifestyle: store.draftLifestyle,
    roommatePreferences: store.draftRoommatePreferences,
    photos: store.draftPhotos,
    updateBasicInfo: store.updateDraftBasicInfo,
    updateLifestyle: store.updateDraftLifestyle,
    updateRoommatePreferences: store.updateDraftRoommatePreferences,
    updatePhotos: store.updateDraftPhotos,
    clearDrafts: store.clearDrafts,
  };
};
