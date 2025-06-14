import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  SkipForward,
  Heart,
  User,
  Camera,
  Home,
  Settings,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding, useProfileStore } from '@/stores/profileStore';
import { ONBOARDING_STEPS } from '@/types/profile.types';
import { toast } from 'sonner';

// Import step components (we'll create these next)
import { BasicInfoStep } from './steps/BasicInfoStep';
import { PhotosStep } from './steps/PhotosStep';
import { LifestyleStep } from './steps/LifestyleStep';
import { RoommatePreferencesStep } from './steps/RoommatePreferencesStep';
import { ReviewStep } from './steps/ReviewStep';

interface OnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const stepConfig = {
  'basic-info': {
    title: 'Basic Information',
    description: 'Tell us about yourself',
    icon: User,
    component: BasicInfoStep,
    isRequired: true,
  },
  'photos': {
    title: 'Add Photos',
    description: 'Upload your best photos',
    icon: Camera,
    component: PhotosStep,
    isRequired: true,
  },
  'lifestyle': {
    title: 'Lifestyle',
    description: 'Share your preferences',
    icon: Home,
    component: LifestyleStep,
    isRequired: false,
  },
  'roommate-preferences': {
    title: 'Roommate Preferences',
    description: 'What are you looking for?',
    icon: Settings,
    component: RoommatePreferencesStep,
    isRequired: true,
  },
  'review': {
    title: 'Review & Complete',
    description: 'Review your profile',
    icon: Eye,
    component: ReviewStep,
    isRequired: true,
  },
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { progress, currentStep, setCurrentStep, completeStep, skipStep } = useOnboarding();
  const { isLoading, setLoading } = useProfileStore();
  const [isStepValid, setIsStepValid] = useState(false);

  const currentStepId = ONBOARDING_STEPS[currentStep];
  const currentStepConfig = stepConfig[currentStepId];
  const StepComponent = currentStepConfig.component;

  useEffect(() => {
    // Initialize profile if needed
    if (user && !isLoading) {
      // Profile initialization logic will go here
    }
  }, [user, isLoading]);

  const handleNext = async () => {
    if (!isStepValid && currentStepConfig.isRequired) {
      toast.error('Please complete all required fields before continuing');
      return;
    }

    // Mark current step as completed
    completeStep(currentStepId);

    // Move to next step
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStepConfig.isRequired) {
      toast.error('This step is required and cannot be skipped');
      return;
    }

    skipStep(currentStepId);

    // Move to next step
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    toast.success('Profile setup complete! Welcome to LajoSpaces!');
    
    if (onComplete) {
      onComplete();
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkipOnboarding = () => {
    if (onSkip) {
      onSkip();
    } else {
      navigate('/dashboard');
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LajoSpaces
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us find your perfect roommate match</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress.overallProgress)}% Complete
            </span>
          </div>
          <Progress value={progress.overallProgress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center mb-8 space-x-2 overflow-x-auto pb-2">
          {ONBOARDING_STEPS.map((stepId, index) => {
            const config = stepConfig[stepId];
            const Icon = config.icon;
            const isCompleted = progress.completedSteps.includes(stepId);
            const isSkipped = progress.skippedSteps.includes(stepId);
            const isCurrent = index === currentStep;
            const isAccessible = index <= currentStep || isCompleted || isSkipped;

            return (
              <button
                key={stepId}
                onClick={() => isAccessible && goToStep(index)}
                disabled={!isAccessible}
                className={`flex flex-col items-center p-3 rounded-lg transition-all min-w-[100px] ${
                  isCurrent
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : isSkipped
                    ? 'bg-gray-100 text-gray-500'
                    : isAccessible
                    ? 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  isCompleted ? 'bg-green-500 text-white' : ''
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-medium text-center">{config.title}</span>
                {config.isRequired && !isCompleted && !isSkipped && (
                  <Badge variant="secondary" className="text-xs mt-1">Required</Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <currentStepConfig.icon className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold">{currentStepConfig.title}</h2>
                <p className="text-sm text-gray-600 font-normal">{currentStepConfig.description}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step Component */}
            <StepComponent
              onValidationChange={setIsStepValid}
              isActive={true}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {!currentStepConfig.isRequired && (
                  <Button
                    variant="ghost"
                    onClick={handleSkipStep}
                    disabled={isLoading}
                    className="text-gray-500"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={handleSkipOnboarding}
                  disabled={isLoading}
                  className="text-gray-500"
                >
                  Skip Setup
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isLoading || (!isStepValid && currentStepConfig.isRequired)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
