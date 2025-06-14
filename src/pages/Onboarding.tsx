import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/stores/profileStore';
import { toast } from 'sonner';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { resetOnboarding } = useProfileStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Initialize onboarding
    resetOnboarding();
  }, [isAuthenticated, navigate, resetOnboarding]);

  const handleOnboardingComplete = () => {
    toast.success('Welcome to LajoSpaces! Your profile is now complete.');
    navigate('/dashboard', { replace: true });
  };

  const handleSkipOnboarding = () => {
    toast.info('You can complete your profile anytime from your dashboard.');
    navigate('/dashboard', { replace: true });
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <OnboardingWizard
      onComplete={handleOnboardingComplete}
      onSkip={handleSkipOnboarding}
    />
  );
};

export default Onboarding;
