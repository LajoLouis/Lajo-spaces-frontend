import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  RotateCcw, 
  Filter,
  DollarSign,
  MapPin,
  Users,
  Home,
  Verified,
  Camera
} from 'lucide-react';
import { useDiscoveryFilters } from '@/stores/discoveryStore';
import { DISTANCE_OPTIONS } from '@/types/matching.types';

interface DiscoveryFiltersProps {
  onClose: () => void;
}

export const DiscoveryFilters: React.FC<DiscoveryFiltersProps> = ({ onClose }) => {
  const { filters, setFilters, resetFilters } = useDiscoveryFilters();

  const handleAgeRangeChange = (values: number[]) => {
    setFilters({
      ageRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  const handleBudgetRangeChange = (values: number[]) => {
    setFilters({
      budgetRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  const handleGenderToggle = (gender: string) => {
    const currentGenders = filters.gender || [];
    const updatedGenders = currentGenders.includes(gender)
      ? currentGenders.filter(g => g !== gender)
      : [...currentGenders, gender];
    
    setFilters({ gender: updatedGenders });
  };

  const handleHousingTypeToggle = (type: string) => {
    const currentTypes = filters.housingTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFilters({ housingTypes: updatedTypes });
  };

  const handleLifestyleToggle = (category: keyof typeof filters.lifestyle, value: string) => {
    const currentValues = filters.lifestyle[category] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFilters({
      lifestyle: {
        ...filters.lifestyle,
        [category]: updatedValues,
      },
    });
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
  ];

  const housingTypeOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'studio', label: 'Studio' },
    { value: 'shared-room', label: 'Shared Room' },
  ];

  const lifestyleOptions = {
    cleanliness: [
      { value: 'very-clean', label: 'Very Clean' },
      { value: 'moderately-clean', label: 'Moderately Clean' },
      { value: 'relaxed', label: 'Relaxed' },
    ],
    socialLevel: [
      { value: 'very-social', label: 'Very Social' },
      { value: 'moderately-social', label: 'Moderately Social' },
      { value: 'prefer-quiet', label: 'Prefer Quiet' },
    ],
    sleepSchedule: [
      { value: 'early-bird', label: 'Early Bird' },
      { value: 'night-owl', label: 'Night Owl' },
      { value: 'flexible', label: 'Flexible' },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Age Range */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Age Range</Label>
          </div>
          <div className="space-y-4">
            <Slider
              value={[filters.ageRange.min, filters.ageRange.max]}
              onValueChange={handleAgeRangeChange}
              min={18}
              max={65}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filters.ageRange.min} years</span>
              <span>{filters.ageRange.max} years</span>
            </div>
          </div>
        </div>

        {/* Budget Range */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Budget Range</Label>
          </div>
          <div className="space-y-4">
            <Slider
              value={[filters.budgetRange.min, filters.budgetRange.max]}
              onValueChange={handleBudgetRangeChange}
              min={0}
              max={5000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${filters.budgetRange.min}</span>
              <span>${filters.budgetRange.max}</span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Maximum Distance</Label>
          </div>
          <Select
            value={filters.distance.max.toString()}
            onValueChange={(value) => setFilters({ distance: { max: parseInt(value) } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label className="font-medium">Gender</Label>
          <div className="space-y-2">
            {genderOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`gender-${option.value}`}
                  checked={filters.gender.includes(option.value)}
                  onCheckedChange={() => handleGenderToggle(option.value)}
                />
                <Label htmlFor={`gender-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Housing Type */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Housing Type</Label>
          </div>
          <div className="space-y-2">
            {housingTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`housing-${option.value}`}
                  checked={filters.housingTypes.includes(option.value)}
                  onCheckedChange={() => handleHousingTypeToggle(option.value)}
                />
                <Label htmlFor={`housing-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Preferences */}
        <div className="space-y-3">
          <Label className="font-medium">Lifestyle</Label>
          
          {Object.entries(lifestyleOptions).map(([category, options]) => (
            <div key={category} className="space-y-2">
              <Label className="text-sm text-gray-600 capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <div className="flex flex-wrap gap-1">
                {options.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      filters.lifestyle[category as keyof typeof filters.lifestyle]?.includes(option.value)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer text-xs"
                    onClick={() => handleLifestyleToggle(category as keyof typeof filters.lifestyle, option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <Label className="font-medium">Requirements</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-photos"
                checked={filters.hasPhotos}
                onCheckedChange={(checked) => setFilters({ hasPhotos: !!checked })}
              />
              <Label htmlFor="has-photos" className="text-sm flex items-center">
                <Camera className="w-3 h-3 mr-1" />
                Must have photos
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-verified"
                checked={filters.isVerified}
                onCheckedChange={(checked) => setFilters({ isVerified: !!checked })}
              />
              <Label htmlFor="is-verified" className="text-sm flex items-center">
                <Verified className="w-3 h-3 mr-1" />
                Verified profiles only
              </Label>
            </div>
          </div>
        </div>

        {/* Minimum Compatibility */}
        <div className="space-y-3">
          <Label className="font-medium">Minimum Compatibility</Label>
          <div className="space-y-4">
            <Slider
              value={[filters.minCompatibilityScore]}
              onValueChange={(values) => setFilters({ minCompatibilityScore: values[0] })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">
              {filters.minCompatibilityScore}% or higher
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-center mt-8">
        <Button onClick={onClose} className="px-8">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
