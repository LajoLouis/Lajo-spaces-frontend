import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { DollarSign, Calendar, MapPin, Users, Home, AlertTriangle } from 'lucide-react';
import { useDrafts } from '@/stores/profileStore';
import { RoommatePreferencesFormData } from '@/types/profile.types';

// Validation schema
const roommatePreferencesSchema = z.object({
  ageRange: z.object({
    min: z.number().min(18, 'Minimum age must be at least 18'),
    max: z.number().max(100, 'Maximum age must be less than 100'),
  }).refine(data => data.min < data.max, {
    message: 'Maximum age must be greater than minimum age',
  }),
  genderPreference: z.string().min(1, 'Gender preference is required'),
  housingType: z.array(z.string()).min(1, 'Please select at least one housing type'),
  budgetRange: z.object({
    min: z.number().min(1, 'Minimum budget must be greater than 0'),
    max: z.number().min(1, 'Maximum budget must be greater than 0'),
    currency: z.string().default('USD'),
  }).refine(data => data.min < data.max, {
    message: 'Maximum budget must be greater than minimum budget',
  }),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  leaseDuration: z.string().min(1, 'Lease duration is required'),
  maxCommuteTime: z.number().min(5).max(120),
  dealBreakers: z.object({
    smoking: z.boolean(),
    pets: z.boolean(),
    parties: z.boolean(),
    overnight_guests: z.boolean(),
  }),
});

interface RoommatePreferencesStepProps {
  onValidationChange: (isValid: boolean) => void;
  isActive: boolean;
}

export const RoommatePreferencesStep: React.FC<RoommatePreferencesStepProps> = ({
  onValidationChange,
  isActive,
}) => {
  const { roommatePreferences, updateRoommatePreferences } = useDrafts();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<RoommatePreferencesFormData>({
    resolver: zodResolver(roommatePreferencesSchema),
    defaultValues: {
      ageRange: {
        min: roommatePreferences.ageRange?.min || 22,
        max: roommatePreferences.ageRange?.max || 35,
      },
      genderPreference: roommatePreferences.genderPreference || '',
      housingType: roommatePreferences.housingType || [],
      budgetRange: {
        min: roommatePreferences.budgetRange?.min || 800,
        max: roommatePreferences.budgetRange?.max || 1500,
        currency: 'USD',
      },
      moveInDate: roommatePreferences.moveInDate || '',
      leaseDuration: roommatePreferences.leaseDuration || '',
      maxCommuteTime: roommatePreferences.maxCommuteTime || 30,
      dealBreakers: {
        smoking: roommatePreferences.dealBreakers?.smoking || false,
        pets: roommatePreferences.dealBreakers?.pets || false,
        parties: roommatePreferences.dealBreakers?.parties || false,
        overnight_guests: roommatePreferences.dealBreakers?.overnight_guests || false,
      },
    },
    mode: 'onChange',
  });

  const watchedData = watch();

  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    if (isActive) {
      const subscription = watch((data) => {
        updateRoommatePreferences(data as RoommatePreferencesFormData);
      });
      return () => subscription.unsubscribe();
    }
  }, [isActive, watch, updateRoommatePreferences]);

  const housingTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'studio', label: 'Studio' },
    { value: 'shared-room', label: 'Shared Room' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'no-preference', label: 'No Preference' },
  ];

  const leaseDurationOptions = [
    { value: 'short-term', label: 'Short-term (1-6 months)' },
    { value: 'long-term', label: 'Long-term (6+ months)' },
    { value: 'flexible', label: 'Flexible' },
  ];

  const toggleHousingType = (type: string) => {
    const current = watchedData.housingType || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    
    setValue('housingType', updated);
    trigger('housingType');
  };

  return (
    <div className="space-y-6">
      {/* Basic Preferences */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Roommate Preferences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Age Range *</Label>
              <div className="space-y-4">
                <div className="px-3">
                  <Slider
                    value={[watchedData.ageRange?.min || 22, watchedData.ageRange?.max || 35]}
                    onValueChange={([min, max]) => {
                      setValue('ageRange', { min, max });
                      trigger('ageRange');
                    }}
                    min={18}
                    max={65}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{watchedData.ageRange?.min || 22} years</span>
                  <span>{watchedData.ageRange?.max || 35} years</span>
                </div>
              </div>
              {errors.ageRange && (
                <p className="text-sm text-red-600">{errors.ageRange.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender Preference *</Label>
              <Select
                value={watchedData.genderPreference}
                onValueChange={(value) => {
                  setValue('genderPreference', value);
                  trigger('genderPreference');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender preference" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.genderPreference && (
                <p className="text-sm text-red-600">{errors.genderPreference.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Housing & Budget */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Housing & Budget</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Housing Types * (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {housingTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedData.housingType?.includes(type.value)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => toggleHousingType(type.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={watchedData.housingType?.includes(type.value)}
                        readOnly
                      />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.housingType && (
                <p className="text-sm text-red-600">{errors.housingType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Budget Range (Monthly Rent) *</Label>
              <div className="space-y-4">
                <div className="px-3">
                  <Slider
                    value={[watchedData.budgetRange?.min || 800, watchedData.budgetRange?.max || 1500]}
                    onValueChange={([min, max]) => {
                      setValue('budgetRange', { min, max, currency: 'USD' });
                      trigger('budgetRange');
                    }}
                    min={300}
                    max={5000}
                    step={50}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${watchedData.budgetRange?.min || 800}/month</span>
                  <span>${watchedData.budgetRange?.max || 1500}/month</span>
                </div>
              </div>
              {errors.budgetRange && (
                <p className="text-sm text-red-600">{errors.budgetRange.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Location */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Timeline & Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="moveInDate">Move-in Date *</Label>
              <Input
                id="moveInDate"
                type="date"
                {...register('moveInDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.moveInDate && (
                <p className="text-sm text-red-600">{errors.moveInDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lease Duration *</Label>
              <Select
                value={watchedData.leaseDuration}
                onValueChange={(value) => {
                  setValue('leaseDuration', value);
                  trigger('leaseDuration');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lease duration" />
                </SelectTrigger>
                <SelectContent>
                  {leaseDurationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaseDuration && (
                <p className="text-sm text-red-600">{errors.leaseDuration.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label>Maximum Commute Time</Label>
            <div className="space-y-4">
              <div className="px-3">
                <Slider
                  value={[watchedData.maxCommuteTime || 30]}
                  onValueChange={([value]) => setValue('maxCommuteTime', value)}
                  min={5}
                  max={120}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="text-center text-sm text-gray-600">
                {watchedData.maxCommuteTime || 30} minutes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Breakers */}
      <Card className="border-red-100 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Deal Breakers</h3>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Select any behaviors that would be absolute deal breakers for you:
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'smoking', label: 'Smoking indoors' },
              { key: 'pets', label: 'Having pets' },
              { key: 'parties', label: 'Frequent parties' },
              { key: 'overnight_guests', label: 'Overnight guests' },
            ].map((item) => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={watchedData.dealBreakers?.[item.key as keyof typeof watchedData.dealBreakers]}
                  onCheckedChange={(checked) => {
                    setValue(`dealBreakers.${item.key}` as any, !!checked);
                  }}
                />
                <Label htmlFor={item.key} className="text-sm">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
