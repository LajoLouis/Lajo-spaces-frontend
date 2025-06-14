import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Camera, 
  Home, 
  Settings, 
  Check, 
  AlertCircle,
  Edit,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useDrafts, useOnboarding } from '@/stores/profileStore';
import { useAuth } from '@/hooks/useAuth';

interface ReviewStepProps {
  onValidationChange: (isValid: boolean) => void;
  isActive: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  onValidationChange,
  isActive,
}) => {
  const { user } = useAuth();
  const { basicInfo, lifestyle, roommatePreferences, photos } = useDrafts();
  const { setCurrentStep } = useOnboarding();

  // Calculate completion score
  const calculateCompletionScore = () => {
    let score = 0;
    let maxScore = 100;

    // Basic info (25 points)
    if (basicInfo.bio && basicInfo.bio.length >= 50) score += 10;
    if (basicInfo.dateOfBirth) score += 5;
    if (basicInfo.gender) score += 5;
    if (basicInfo.occupation) score += 3;
    if (basicInfo.location?.city) score += 2;

    // Photos (20 points)
    if (photos.photos && photos.photos.length >= 1) score += 10;
    if (photos.photos && photos.photos.length >= 3) score += 10;

    // Lifestyle (25 points)
    if (lifestyle.interests && lifestyle.interests.length >= 3) score += 15;
    if (lifestyle.sleepSchedule) score += 5;
    if (lifestyle.cleanliness) score += 5;

    // Roommate preferences (30 points)
    if (roommatePreferences.budgetRange?.min && roommatePreferences.budgetRange?.max) score += 15;
    if (roommatePreferences.moveInDate) score += 5;
    if (roommatePreferences.housingType && roommatePreferences.housingType.length > 0) score += 5;
    if (roommatePreferences.genderPreference) score += 5;

    return Math.min(score, maxScore);
  };

  const completionScore = calculateCompletionScore();
  const isProfileComplete = completionScore >= 80;

  useEffect(() => {
    onValidationChange(isProfileComplete);
  }, [isProfileComplete, onValidationChange]);

  const sections = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      icon: User,
      stepIndex: 0,
      isComplete: !!(basicInfo.bio && basicInfo.dateOfBirth && basicInfo.gender && basicInfo.occupation),
      data: {
        'Name': user ? `${user.firstName} ${user.lastName}` : 'Not set',
        'Age': basicInfo.dateOfBirth ? new Date().getFullYear() - new Date(basicInfo.dateOfBirth).getFullYear() : 'Not set',
        'Gender': basicInfo.gender || 'Not set',
        'Occupation': basicInfo.occupation || 'Not set',
        'Location': basicInfo.location?.city ? `${basicInfo.location.city}, ${basicInfo.location.state}` : 'Not set',
        'Bio Length': basicInfo.bio ? `${basicInfo.bio.length} characters` : 'Not set',
      }
    },
    {
      id: 'photos',
      title: 'Photos',
      icon: Camera,
      stepIndex: 1,
      isComplete: !!(photos.photos && photos.photos.length >= 1),
      data: {
        'Photos Uploaded': photos.photos ? `${photos.photos.length} photos` : '0 photos',
        'Primary Photo': photos.primaryPhotoIndex !== undefined ? 'Set' : 'Not set',
      }
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle',
      icon: Home,
      stepIndex: 2,
      isComplete: !!(lifestyle.interests && lifestyle.interests.length >= 3 && lifestyle.sleepSchedule),
      data: {
        'Sleep Schedule': lifestyle.sleepSchedule || 'Not set',
        'Cleanliness': lifestyle.cleanliness || 'Not set',
        'Social Level': lifestyle.socialLevel || 'Not set',
        'Interests': lifestyle.interests ? `${lifestyle.interests.length} selected` : 'None selected',
        'Work Schedule': lifestyle.workSchedule || 'Not set',
      }
    },
    {
      id: 'roommate-preferences',
      title: 'Roommate Preferences',
      icon: Settings,
      stepIndex: 3,
      isComplete: !!(roommatePreferences.budgetRange?.min && roommatePreferences.moveInDate),
      data: {
        'Budget Range': roommatePreferences.budgetRange?.min ? 
          `$${roommatePreferences.budgetRange.min} - $${roommatePreferences.budgetRange.max}` : 'Not set',
        'Age Range': roommatePreferences.ageRange?.min ? 
          `${roommatePreferences.ageRange.min} - ${roommatePreferences.ageRange.max} years` : 'Not set',
        'Gender Preference': roommatePreferences.genderPreference || 'Not set',
        'Move-in Date': roommatePreferences.moveInDate || 'Not set',
        'Housing Types': roommatePreferences.housingType ? 
          `${roommatePreferences.housingType.length} selected` : 'None selected',
      }
    }
  ];

  const missingItems = sections
    .filter(section => !section.isComplete)
    .map(section => section.title);

  return (
    <div className="space-y-6">
      {/* Completion Overview */}
      <Card className={`border-2 ${isProfileComplete ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isProfileComplete ? (
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className={`text-xl font-semibold ${isProfileComplete ? 'text-green-900' : 'text-orange-900'}`}>
                  {isProfileComplete ? 'Profile Complete!' : 'Profile Incomplete'}
                </h3>
                <p className={`text-sm ${isProfileComplete ? 'text-green-700' : 'text-orange-700'}`}>
                  {isProfileComplete 
                    ? 'Your profile is ready to find roommate matches!'
                    : `Complete ${missingItems.length} more section${missingItems.length > 1 ? 's' : ''} to finish your profile.`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${isProfileComplete ? 'text-green-600' : 'text-orange-600'}`}>
                {completionScore}%
              </div>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>

          <Progress value={completionScore} className="h-3" />

          {!isProfileComplete && missingItems.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-900 mb-2">Missing sections:</p>
              <div className="flex flex-wrap gap-2">
                {missingItems.map((item) => (
                  <Badge key={item} variant="secondary" className="bg-orange-100 text-orange-800">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Reviews */}
      <div className="grid gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className={`border ${section.isComplete ? 'border-green-200' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      section.isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {section.isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className="text-lg">{section.title}</span>
                    {section.isComplete && (
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(section.stepIndex)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(section.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">{key}:</span>
                      <span className={`text-sm font-medium ${
                        value === 'Not set' || value === '0 photos' || value === 'None selected' 
                          ? 'text-orange-600' 
                          : 'text-gray-900'
                      }`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Steps */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span>Your profile will be visible to potential roommates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span>You'll start receiving roommate matches based on your preferences</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span>You can browse and connect with other users looking for roommates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span>You can always edit your profile and preferences later</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
