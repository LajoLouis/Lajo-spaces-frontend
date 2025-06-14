import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, User, Briefcase, GraduationCap, Calendar } from 'lucide-react';
import { useDrafts } from '@/stores/profileStore';
import { BasicInfoFormData } from '@/types/profile.types';

// Validation schema
const basicInfoSchema = z.object({
  bio: z.string()
    .min(50, 'Bio must be at least 50 characters long')
    .max(500, 'Bio must be less than 500 characters'),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 100;
    }, 'You must be between 18 and 100 years old'),
  gender: z.string().min(1, 'Gender selection is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  education: z.string().min(1, 'Education level is required'),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

interface BasicInfoStepProps {
  onValidationChange: (isValid: boolean) => void;
  isActive: boolean;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  onValidationChange,
  isActive,
}) => {
  const { basicInfo, updateBasicInfo } = useDrafts();
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      bio: basicInfo.bio || '',
      dateOfBirth: basicInfo.dateOfBirth || '',
      gender: basicInfo.gender || '',
      occupation: basicInfo.occupation || '',
      education: basicInfo.education || '',
      location: {
        city: basicInfo.location?.city || '',
        state: basicInfo.location?.state || '',
        country: basicInfo.location?.country || 'United States',
      },
    },
    mode: 'onChange',
  });

  const watchedBio = watch('bio');
  const watchedData = watch();

  useEffect(() => {
    setCharCount(watchedBio?.length || 0);
  }, [watchedBio]);

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    if (isActive) {
      // Auto-save draft data
      const subscription = watch((data) => {
        updateBasicInfo(data as BasicInfoFormData);
      });
      return () => subscription.unsubscribe();
    }
  }, [isActive, watch, updateBasicInfo]);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const educationOptions = [
    { value: 'high-school', label: 'High School' },
    { value: 'some-college', label: 'Some College' },
    { value: 'associates', label: "Associate's Degree" },
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'doctorate', label: 'Doctorate' },
    { value: 'trade-school', label: 'Trade School' },
    { value: 'other', label: 'Other' },
  ];

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Tell us about yourself</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Write a brief description about yourself, your interests, and what you're looking for in a roommate..."
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-sm">
              <span className={errors.bio ? 'text-red-600' : 'text-gray-500'}>
                {errors.bio?.message}
              </span>
              <span className={`${charCount < 50 ? 'text-orange-500' : 'text-green-600'}`}>
                {charCount}/500 characters {charCount < 50 && '(minimum 50)'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={watchedData.gender}
                onValueChange={(value) => {
                  setValue('gender', value);
                  trigger('gender');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Professional Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation *</Label>
              <Input
                id="occupation"
                {...register('occupation')}
                placeholder="e.g., Software Engineer, Student, Teacher"
              />
              {errors.occupation && (
                <p className="text-sm text-red-600">{errors.occupation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education Level *</Label>
              <Select
                value={watchedData.education}
                onValueChange={(value) => {
                  setValue('education', value);
                  trigger('education');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.education && (
                <p className="text-sm text-red-600">{errors.education.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('location.city')}
                placeholder="e.g., New York"
              />
              {errors.location?.city && (
                <p className="text-sm text-red-600">{errors.location.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={watchedData.location?.state}
                onValueChange={(value) => {
                  setValue('location.state', value);
                  trigger('location.state');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {usStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location?.state && (
                <p className="text-sm text-red-600">{errors.location.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                value={watchedData.location?.country}
                onValueChange={(value) => {
                  setValue('location.country', value);
                  trigger('location.country');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.location?.country && (
                <p className="text-sm text-red-600">{errors.location.country.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
