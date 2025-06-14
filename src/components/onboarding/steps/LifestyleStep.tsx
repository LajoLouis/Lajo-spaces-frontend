import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Utensils,
  Globe,
  Plus,
  X
} from 'lucide-react';
import { useDrafts } from '@/stores/profileStore';
import { LifestyleFormData, INTERESTS_OPTIONS, MUSIC_GENRES, LANGUAGES } from '@/types/profile.types';

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

interface LifestyleStepProps {
  onValidationChange: (isValid: boolean) => void;
  isActive: boolean;
}

export const LifestyleStep: React.FC<LifestyleStepProps> = ({
  onValidationChange,
  isActive,
}) => {
  const { lifestyle, updateLifestyle } = useDrafts();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(lifestyle.interests || []);
  const [selectedMusic, setSelectedMusic] = useState<string[]>(lifestyle.musicPreference || []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(lifestyle.languages || ['English']);
  const [customDietaryRestriction, setCustomDietaryRestriction] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<LifestyleFormData>({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      sleepSchedule: lifestyle.sleepSchedule || '',
      cleanliness: lifestyle.cleanliness || '',
      socialLevel: lifestyle.socialLevel || '',
      guestsPolicy: lifestyle.guestsPolicy || '',
      smoking: lifestyle.smoking || '',
      drinking: lifestyle.drinking || '',
      pets: lifestyle.pets || '',
      workSchedule: lifestyle.workSchedule || '',
      workFromHome: lifestyle.workFromHome || false,
      interests: selectedInterests,
      musicPreference: selectedMusic,
      dietaryRestrictions: lifestyle.dietaryRestrictions || [],
      languages: selectedLanguages,
    },
    mode: 'onChange',
  });

  const watchedData = watch();

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    if (isActive) {
      // Auto-save draft data
      const subscription = watch((data) => {
        updateLifestyle({
          ...data,
          interests: selectedInterests,
          musicPreference: selectedMusic,
          languages: selectedLanguages,
        } as LifestyleFormData);
      });
      return () => subscription.unsubscribe();
    }
  }, [isActive, watch, updateLifestyle, selectedInterests, selectedMusic, selectedLanguages]);

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
    <div className="space-y-6">
      {/* Living Habits */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Living Habits</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Sleep Schedule *</Label>
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
              {errors.sleepSchedule && (
                <p className="text-sm text-red-600">{errors.sleepSchedule.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cleanliness Level *</Label>
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
              {errors.cleanliness && (
                <p className="text-sm text-red-600">{errors.cleanliness.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Social Level *</Label>
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
              {errors.socialLevel && (
                <p className="text-sm text-red-600">{errors.socialLevel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Guests Policy *</Label>
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
              {errors.guestsPolicy && (
                <p className="text-sm text-red-600">{errors.guestsPolicy.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Choices */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wine className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Lifestyle Choices</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Smoking *</Label>
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
              {errors.smoking && (
                <p className="text-sm text-red-600">{errors.smoking.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Drinking *</Label>
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
              {errors.drinking && (
                <p className="text-sm text-red-600">{errors.drinking.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pets *</Label>
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
              {errors.pets && (
                <p className="text-sm text-red-600">{errors.pets.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work & Schedule */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Work & Schedule</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Work Schedule *</Label>
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
              {errors.workSchedule && (
                <p className="text-sm text-red-600">{errors.workSchedule.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="workFromHome"
                  checked={watchedData.workFromHome}
                  onCheckedChange={(checked) => setValue('workFromHome', !!checked)}
                />
                <Label htmlFor="workFromHome">I work from home</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Interests</h3>
            <Badge variant="secondary">
              {selectedInterests.length}/∞ selected (min 3)
            </Badge>
          </div>

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
          {errors.interests && (
            <p className="text-sm text-red-600 mt-2">{errors.interests.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
