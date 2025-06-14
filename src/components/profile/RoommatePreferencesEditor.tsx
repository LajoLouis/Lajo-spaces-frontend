import React, { useState } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { 
  Heart, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Home, 
  Users,
  Save,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { useProfile } from '@/stores/profileStore';
import { RoommatePreferencesFormData } from '@/types/profile.types';
import { toast } from '@/components/ui/use-toast';

// Validation schema
const preferencesSchema = z.object({
  ageRange: z.object({
    min: z.number().min(18, 'Minimum age must be at least 18'),
    max: z.number().max(65, 'Maximum age cannot exceed 65'),
  }),
  genderPreference: z.string().min(1, 'Gender preference is required'),
  housingType: z.array(z.string()).min(1, 'Please select at least one housing type'),
  budgetRange: z.object({
    min: z.number().min(0, 'Minimum budget must be positive'),
    max: z.number().min(0, 'Maximum budget must be positive'),
    currency: z.string().min(1, 'Currency is required'),
  }),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  leaseDuration: z.string().min(1, 'Lease duration is required'),
  preferredAreas: z.array(z.string()),
  maxCommuteTime: z.number().min(5, 'Minimum commute time is 5 minutes').max(120, 'Maximum commute time is 120 minutes'),
  transportationMode: z.array(z.string()).min(1, 'Please select at least one transportation mode'),
  preferredLifestyle: z.object({
    cleanliness: z.array(z.string()),
    socialLevel: z.array(z.string()),
    sleepSchedule: z.array(z.string()),
  }),
  dealBreakers: z.object({
    smoking: z.boolean(),
    pets: z.boolean(),
    parties: z.boolean(),
    overnight_guests: z.boolean(),
  }),
  mustHaves: z.array(z.string()),
  niceToHaves: z.array(z.string()),
});

interface RoommatePreferencesEditorProps {
  isEditing?: boolean;
}

export const RoommatePreferencesEditor: React.FC<RoommatePreferencesEditorProps> = ({ isEditing = false }) => {
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHousingTypes, setSelectedHousingTypes] = useState<string[]>(
    profile?.roommate?.housingType || []
  );
  const [selectedTransportation, setSelectedTransportation] = useState<string[]>(
    profile?.roommate?.transportationMode || []
  );
  const [customArea, setCustomArea] = useState('');
  const [customMustHave, setCustomMustHave] = useState('');
  const [customNiceToHave, setCustomNiceToHave] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<RoommatePreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      ageRange: {
        min: profile?.roommate?.ageRange?.min || 22,
        max: profile?.roommate?.ageRange?.max || 35,
      },
      genderPreference: profile?.roommate?.genderPreference || '',
      housingType: selectedHousingTypes,
      budgetRange: {
        min: profile?.roommate?.budgetRange?.min || 800,
        max: profile?.roommate?.budgetRange?.max || 2000,
        currency: profile?.roommate?.budgetRange?.currency || 'USD',
      },
      moveInDate: profile?.roommate?.moveInDate || '',
      leaseDuration: profile?.roommate?.leaseDuration || '',
      preferredAreas: profile?.roommate?.preferredAreas || [],
      maxCommuteTime: profile?.roommate?.maxCommuteTime || 30,
      transportationMode: selectedTransportation,
      preferredLifestyle: {
        cleanliness: profile?.roommate?.preferredLifestyle?.cleanliness || [],
        socialLevel: profile?.roommate?.preferredLifestyle?.socialLevel || [],
        sleepSchedule: profile?.roommate?.preferredLifestyle?.sleepSchedule || [],
      },
      dealBreakers: {
        smoking: profile?.roommate?.dealBreakers?.smoking || false,
        pets: profile?.roommate?.dealBreakers?.pets || false,
        parties: profile?.roommate?.dealBreakers?.parties || false,
        overnight_guests: profile?.roommate?.dealBreakers?.overnight_guests || false,
      },
      mustHaves: profile?.roommate?.mustHaves || [],
      niceToHaves: profile?.roommate?.niceToHaves || [],
    },
    mode: 'onChange',
  });

  const watchedData = watch();

  const toggleHousingType = (type: string) => {
    const updated = selectedHousingTypes.includes(type)
      ? selectedHousingTypes.filter(t => t !== type)
      : [...selectedHousingTypes, type];
    
    setSelectedHousingTypes(updated);
    setValue('housingType', updated);
    trigger('housingType');
  };

  const toggleTransportation = (mode: string) => {
    const updated = selectedTransportation.includes(mode)
      ? selectedTransportation.filter(m => m !== mode)
      : [...selectedTransportation, mode];
    
    setSelectedTransportation(updated);
    setValue('transportationMode', updated);
    trigger('transportationMode');
  };

  const addCustomArea = () => {
    if (customArea.trim()) {
      const current = watchedData.preferredAreas || [];
      const updated = [...current, customArea.trim()];
      setValue('preferredAreas', updated);
      setCustomArea('');
    }
  };

  const removeArea = (area: string) => {
    const current = watchedData.preferredAreas || [];
    const updated = current.filter(a => a !== area);
    setValue('preferredAreas', updated);
  };

  const onSubmit = async (data: RoommatePreferencesFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Roommate preferences updated",
        description: "Your roommate preferences have been saved successfully.",
      });
      
      // Reset form dirty state
      reset(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update roommate preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const housingTypes = [
    'Apartment', 'House', 'Condo', 'Townhouse', 'Studio', 'Shared Room'
  ];

  const transportationModes = [
    'Car', 'Public Transport', 'Bike', 'Walk', 'Rideshare'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Basic Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age Range</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {watchedData.ageRange?.min} - {watchedData.ageRange?.max} years
                    </span>
                  </div>
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
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.ageRange?.min && watchedData.ageRange?.max
                    ? `${watchedData.ageRange.min} - ${watchedData.ageRange.max} years`
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.ageRange && (
                <p className="text-sm text-red-600">{errors.ageRange.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender Preference</Label>
              {isEditing ? (
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
                    <SelectItem value="any">Any Gender</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-Binary</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                  {watchedData.genderPreference ?
                    watchedData.genderPreference === 'any' ? 'Any Gender' :
                    watchedData.genderPreference === 'male' ? 'Male' :
                    watchedData.genderPreference === 'female' ? 'Female' :
                    watchedData.genderPreference === 'non-binary' ? 'Non-Binary' :
                    watchedData.genderPreference
                    : 'Not specified'
                  }
                </p>
              )}
              {isEditing && errors.genderPreference && (
                <p className="text-sm text-red-600">{errors.genderPreference.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Housing & Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-purple-600" />
            <span>Housing & Budget</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Housing Types</Label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {housingTypes.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={selectedHousingTypes.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleHousingType(type)}
                    className={selectedHousingTypes.includes(type) ? 'bg-purple-600' : ''}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedHousingTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedHousingTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="bg-purple-100 text-purple-800">
                        {type}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No housing types selected</p>
                )}
              </div>
            )}
            {isEditing && errors.housingType && (
              <p className="text-sm text-red-600">{errors.housingType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Budget Range (Monthly)</Label>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Minimum</Label>
                  <Input
                    type="number"
                    value={watchedData.budgetRange?.min || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setValue('budgetRange', { ...watchedData.budgetRange!, min: value });
                      trigger('budgetRange');
                    }}
                    placeholder="800"
                  />
                </div>
                <div>
                  <Label className="text-sm">Maximum</Label>
                  <Input
                    type="number"
                    value={watchedData.budgetRange?.max || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setValue('budgetRange', { ...watchedData.budgetRange!, max: value });
                      trigger('budgetRange');
                    }}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <Label className="text-sm">Currency</Label>
                  <Select
                    value={watchedData.budgetRange?.currency}
                    onValueChange={(value) => {
                      setValue('budgetRange', { ...watchedData.budgetRange!, currency: value });
                      trigger('budgetRange');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md">
                {watchedData.budgetRange?.min && watchedData.budgetRange?.max && watchedData.budgetRange?.currency ?
                  `${watchedData.budgetRange.currency === 'USD' ? '$' :
                     watchedData.budgetRange.currency === 'EUR' ? '€' :
                     watchedData.budgetRange.currency === 'GBP' ? '£' :
                     watchedData.budgetRange.currency === 'CAD' ? 'C$' : ''}${watchedData.budgetRange.min} - ${watchedData.budgetRange.currency === 'USD' ? '$' :
                     watchedData.budgetRange.currency === 'EUR' ? '€' :
                     watchedData.budgetRange.currency === 'GBP' ? '£' :
                     watchedData.budgetRange.currency === 'CAD' ? 'C$' : ''}${watchedData.budgetRange.max} per month`
                  : 'Not specified'
                }
              </p>
            )}
            {isEditing && errors.budgetRange && (
              <p className="text-sm text-red-600">{errors.budgetRange.message}</p>
            )}
          </div>
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
