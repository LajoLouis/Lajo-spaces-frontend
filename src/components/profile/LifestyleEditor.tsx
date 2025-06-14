import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Moon, 
  Sun, 
  Users, 
  Home, 
  Cigarette, 
  Wine, 
  Heart, 
  Briefcase,
  Music,
  Globe,
  Plus,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { useProfile } from '@/stores/profileStore';
import { LifestyleFormData, INTERESTS_OPTIONS, MUSIC_GENRES, LANGUAGES } from '@/types/profile.types';
import { toast } from '@/components/ui/use-toast';

// Validation schema
const lifestyleSchema = z.object({
  sleepSchedule: z.string().min(1, 'Sleep schedule is required'),
  cleanliness: z.string().min(1, 'Cleanliness preference is required'),
  socialLevel: z.string().min(1, 'Social level is required'),
  guestsPolicy: z.string().min(1, 'Guests policy is required'),
  smoking: z.string().min(1, 'Smoking preference is required'),
  drinking: z.string().min(1, 'Drinking preference is required'),
  pets: z.string().min(1, 'Pet preference is required'),
  workSchedule: z.string().min(1, 'Work schedule is required'),
  workFromHome: z.boolean(),
  interests: z.array(z.string()).min(3, 'Please select at least 3 interests'),
  musicPreference: z.array(z.string()),
  dietaryRestrictions: z.array(z.string()),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
});

interface LifestyleEditorProps {
  isEditing?: boolean;
}

export const LifestyleEditor: React.FC<LifestyleEditorProps> = ({ isEditing = false }) => {
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.lifestyle?.interests || []
  );
  const [selectedMusic, setSelectedMusic] = useState<string[]>(
    profile?.lifestyle?.musicPreference || []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    profile?.lifestyle?.languages || ['English']
  );
  const [customDietaryRestriction, setCustomDietaryRestriction] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<LifestyleFormData>({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      sleepSchedule: profile?.lifestyle?.sleepSchedule || '',
      cleanliness: profile?.lifestyle?.cleanliness || '',
      socialLevel: profile?.lifestyle?.socialLevel || '',
      guestsPolicy: profile?.lifestyle?.guestsPolicy || '',
      smoking: profile?.lifestyle?.smoking || '',
      drinking: profile?.lifestyle?.drinking || '',
      pets: profile?.lifestyle?.pets || '',
      workSchedule: profile?.lifestyle?.workSchedule || '',
      workFromHome: profile?.lifestyle?.workFromHome || false,
      interests: selectedInterests,
      musicPreference: selectedMusic,
      dietaryRestrictions: profile?.lifestyle?.dietaryRestrictions || [],
      languages: selectedLanguages,
    },
    mode: 'onChange',
  });

  const watchedData = watch();

  const toggleInterest = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(updated);
    setValue('interests', updated);
    trigger('interests');
  };

  const toggleMusic = (genre: string) => {
    const updated = selectedMusic.includes(genre)
      ? selectedMusic.filter(g => g !== genre)
      : [...selectedMusic, genre];
    
    setSelectedMusic(updated);
    setValue('musicPreference', updated);
  };

  const toggleLanguage = (language: string) => {
    const updated = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    
    setSelectedLanguages(updated);
    setValue('languages', updated);
    trigger('languages');
  };

  const addCustomDietaryRestriction = () => {
    if (customDietaryRestriction.trim()) {
      const current = watchedData.dietaryRestrictions || [];
      const updated = [...current, customDietaryRestriction.trim()];
      setValue('dietaryRestrictions', updated);
      setCustomDietaryRestriction('');
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    const current = watchedData.dietaryRestrictions || [];
    const updated = current.filter(r => r !== restriction);
    setValue('dietaryRestrictions', updated);
  };

  const onSubmit = async (data: LifestyleFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Lifestyle preferences updated",
        description: "Your lifestyle preferences have been saved successfully.",
      });
      
      // Reset form dirty state
      reset(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lifestyle preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const lifestyleOptions = {
    sleepSchedule: [
      { value: 'early-bird', label: 'Early Bird (6-8 AM)', icon: Sun },
      { value: 'night-owl', label: 'Night Owl (10 PM+)', icon: Moon },
      { value: 'flexible', label: 'Flexible Schedule', icon: Home },
    ],
    cleanliness: [
      { value: 'very-clean', label: 'Very Clean & Organized' },
      { value: 'moderately-clean', label: 'Moderately Clean' },
      { value: 'relaxed', label: 'Relaxed About Cleanliness' },
    ],
    socialLevel: [
      { value: 'very-social', label: 'Very Social & Outgoing', icon: Users },
      { value: 'moderately-social', label: 'Moderately Social' },
      { value: 'prefer-quiet', label: 'Prefer Quiet Environment' },
    ],
    guestsPolicy: [
      { value: 'frequent-guests', label: 'Frequent Guests Welcome' },
      { value: 'occasional-guests', label: 'Occasional Guests OK' },
      { value: 'rare-guests', label: 'Rare Guests Only' },
      { value: 'no-guests', label: 'No Guests Preferred' },
    ],
    smoking: [
      { value: 'smoker', label: 'Smoker', icon: Cigarette },
      { value: 'non-smoker', label: 'Non-Smoker' },
      { value: 'social-smoker', label: 'Social Smoker' },
      { value: 'no-preference', label: 'No Preference' },
    ],
    drinking: [
      { value: 'regular', label: 'Regular Drinker', icon: Wine },
      { value: 'social', label: 'Social Drinker' },
      { value: 'rarely', label: 'Rarely Drink' },
      { value: 'never', label: 'Never Drink' },
      { value: 'no-preference', label: 'No Preference' },
    ],
    pets: [
      { value: 'have-pets', label: 'I Have Pets', icon: Heart },
      { value: 'love-pets', label: 'Love Pets (Don\'t Have)' },
      { value: 'allergic', label: 'Allergic to Pets' },
      { value: 'no-pets', label: 'No Pets Preferred' },
      { value: 'no-preference', label: 'No Preference' },
    ],
    workSchedule: [
      { value: 'traditional', label: 'Traditional (9-5)', icon: Briefcase },
      { value: 'remote', label: 'Remote Work' },
      { value: 'shift-work', label: 'Shift Work' },
      { value: 'student', label: 'Student' },
      { value: 'unemployed', label: 'Currently Unemployed' },
    ],
  };

  const commonDietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut Allergies',
    'Kosher', 'Halal', 'Keto', 'Paleo', 'Low-Carb'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Living Habits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-purple-600" />
            <span>Living Habits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sleep Schedule *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.sleepSchedule}
                  onValueChange={(value) => {
                    setValue('sleepSchedule', value);
                    trigger('sleepSchedule');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sleep schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.sleepSchedule.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          {option.icon && <option.icon className="w-4 h-4" />}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.sleepSchedule ?
                    lifestyleOptions.sleepSchedule.find(opt => opt.value === watchedData.sleepSchedule)?.label || watchedData.sleepSchedule
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.sleepSchedule && (
                <p className="text-sm text-red-600">{errors.sleepSchedule.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cleanliness Level *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.cleanliness}
                  onValueChange={(value) => {
                    setValue('cleanliness', value);
                    trigger('cleanliness');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cleanliness level" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.cleanliness.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.cleanliness ?
                    lifestyleOptions.cleanliness.find(opt => opt.value === watchedData.cleanliness)?.label || watchedData.cleanliness
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.cleanliness && (
                <p className="text-sm text-red-600">{errors.cleanliness.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Social Level *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.socialLevel}
                  onValueChange={(value) => {
                    setValue('socialLevel', value);
                    trigger('socialLevel');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select social level" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.socialLevel.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.socialLevel ?
                    lifestyleOptions.socialLevel.find(opt => opt.value === watchedData.socialLevel)?.label || watchedData.socialLevel
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.socialLevel && (
                <p className="text-sm text-red-600">{errors.socialLevel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Guests Policy *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.guestsPolicy}
                  onValueChange={(value) => {
                    setValue('guestsPolicy', value);
                    trigger('guestsPolicy');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guests policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.guestsPolicy.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.guestsPolicy ?
                    lifestyleOptions.guestsPolicy.find(opt => opt.value === watchedData.guestsPolicy)?.label || watchedData.guestsPolicy
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.guestsPolicy && (
                <p className="text-sm text-red-600">{errors.guestsPolicy.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Choices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wine className="w-5 h-5 text-purple-600" />
            <span>Lifestyle Choices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Smoking *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.smoking}
                  onValueChange={(value) => {
                    setValue('smoking', value);
                    trigger('smoking');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Smoking preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.smoking.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.smoking ?
                    lifestyleOptions.smoking.find(opt => opt.value === watchedData.smoking)?.label || watchedData.smoking
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.smoking && (
                <p className="text-sm text-red-600">{errors.smoking.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Drinking *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.drinking}
                  onValueChange={(value) => {
                    setValue('drinking', value);
                    trigger('drinking');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Drinking preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.drinking.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.drinking ?
                    lifestyleOptions.drinking.find(opt => opt.value === watchedData.drinking)?.label || watchedData.drinking
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.drinking && (
                <p className="text-sm text-red-600">{errors.drinking.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pets *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.pets}
                  onValueChange={(value) => {
                    setValue('pets', value);
                    trigger('pets');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pet preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.pets.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.pets ?
                    lifestyleOptions.pets.find(opt => opt.value === watchedData.pets)?.label || watchedData.pets
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.pets && (
                <p className="text-sm text-red-600">{errors.pets.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work & Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <span>Work & Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Work Schedule *</Label>
              {isEditing ? (
                <Select
                  value={watchedData.workSchedule}
                  onValueChange={(value) => {
                    setValue('workSchedule', value);
                    trigger('workSchedule');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyleOptions.workSchedule.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.workSchedule ?
                    lifestyleOptions.workSchedule.find(opt => opt.value === watchedData.workSchedule)?.label || watchedData.workSchedule
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.workSchedule && (
                <p className="text-sm text-red-600">{errors.workSchedule.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Work From Home</Label>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workFromHome"
                    checked={watchedData.workFromHome}
                    onCheckedChange={(checked) => setValue('workFromHome', !!checked)}
                  />
                  <Label htmlFor="workFromHome">I work from home</Label>
                </div>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.workFromHome ? 'Yes, I work from home' : 'No, I work outside home'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-purple-600" />
            <span>Interests</span>
            <Badge variant="secondary">
              {selectedInterests.length}/∞ selected (min 3)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => (
                <Button
                  key={interest}
                  type="button"
                  variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleInterest(interest)}
                  className={selectedInterests.includes(interest) ? 'bg-purple-600' : ''}
                >
                  {interest}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-purple-100 text-purple-800">
                      {interest}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No interests selected</p>
              )}
            </div>
          )}
          {isEditing && errors.interests && (
            <p className="text-sm text-red-600 mt-2">{errors.interests.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Save Button - Only show when editing */}
      {isEditing && (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};
