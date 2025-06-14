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
  Home,
  Bed,
  Bath,
  Wifi,
  Car,
  PawPrint
} from 'lucide-react';
import { usePropertySearch } from '@/stores/propertyStore';
import { PROPERTY_TYPES, ROOM_TYPES, FURNISHED_OPTIONS, AMENITIES_LIST } from '@/types/property.types';

interface PropertyFiltersProps {
  onClose: () => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onClose }) => {
  const { filters, setFilters, resetFilters } = usePropertySearch();

  const handlePriceRangeChange = (values: number[]) => {
    setFilters({
      priceRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  const handlePropertyTypeToggle = (type: string) => {
    const currentTypes = filters.propertyTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFilters({ propertyTypes: updatedTypes });
  };

  const handleRoomTypeToggle = (type: string) => {
    const currentTypes = filters.roomTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFilters({ roomTypes: updatedTypes });
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.requiredAmenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    setFilters({ requiredAmenities: updatedAmenities });
  };

  const popularAmenities = [
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'petFriendly', label: 'Pet Friendly', icon: PawPrint },
    { value: 'gym', label: 'Gym', icon: Home },
    { value: 'laundry', label: 'Laundry', icon: Home },
    { value: 'parking', label: 'Parking', icon: Car },
    { value: 'airConditioning', label: 'AC', icon: Home },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Property Filters</h2>
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
        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Price Range</Label>
          </div>
          <div className="space-y-4">
            <Slider
              value={[filters.priceRange?.min || 0, filters.priceRange?.max || 10000]}
              onValueChange={handlePriceRangeChange}
              min={0}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${filters.priceRange?.min || 0}</span>
              <span>${filters.priceRange?.max || 10000}</span>
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Property Type</Label>
          </div>
          <div className="space-y-2">
            {PROPERTY_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`property-${type.value}`}
                  checked={filters.propertyTypes?.includes(type.value) || false}
                  onCheckedChange={() => handlePropertyTypeToggle(type.value)}
                />
                <Label htmlFor={`property-${type.value}`} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Room Type */}
        <div className="space-y-3">
          <Label className="font-medium">Room Type</Label>
          <div className="space-y-2">
            {ROOM_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`room-${type.value}`}
                  checked={filters.roomTypes?.includes(type.value) || false}
                  onCheckedChange={() => handleRoomTypeToggle(type.value)}
                />
                <Label htmlFor={`room-${type.value}`} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Bed className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Minimum Bedrooms</Label>
          </div>
          <Select
            value={filters.minBedrooms?.toString() || undefined}
            onValueChange={(value) => setFilters({ minBedrooms: value && value !== "any" ? parseInt(value) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="0">Studio</SelectItem>
              <SelectItem value="1">1+ bedroom</SelectItem>
              <SelectItem value="2">2+ bedrooms</SelectItem>
              <SelectItem value="3">3+ bedrooms</SelectItem>
              <SelectItem value="4">4+ bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bathrooms */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Bath className="w-4 h-4 text-gray-500" />
            <Label className="font-medium">Minimum Bathrooms</Label>
          </div>
          <Select
            value={filters.minBathrooms?.toString() || undefined}
            onValueChange={(value) => setFilters({ minBathrooms: value && value !== "any" ? parseInt(value) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+ bathroom</SelectItem>
              <SelectItem value="2">2+ bathrooms</SelectItem>
              <SelectItem value="3">3+ bathrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Furnished */}
        <div className="space-y-3">
          <Label className="font-medium">Furnished</Label>
          <div className="flex flex-wrap gap-2">
            {FURNISHED_OPTIONS.map((option) => (
              <Badge
                key={option.value}
                variant={
                  filters.furnished?.includes(option.value)
                    ? 'default'
                    : 'outline'
                }
                className="cursor-pointer"
                onClick={() => {
                  const current = filters.furnished || [];
                  const updated = current.includes(option.value)
                    ? current.filter(f => f !== option.value)
                    : [...current, option.value];
                  setFilters({ furnished: updated });
                }}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Popular Amenities */}
        <div className="space-y-3 md:col-span-2 lg:col-span-3">
          <Label className="font-medium">Popular Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularAmenities.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = filters.requiredAmenities?.includes(amenity.value) || false;
              
              return (
                <button
                  key={amenity.value}
                  onClick={() => handleAmenityToggle(amenity.value)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{amenity.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3 md:col-span-2 lg:col-span-3">
          <Label className="font-medium">Additional Options</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pet-friendly"
                checked={filters.petFriendly || false}
                onCheckedChange={(checked) => setFilters({ petFriendly: !!checked })}
              />
              <Label htmlFor="pet-friendly" className="text-sm">
                Pet Friendly
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="utilities-included"
                checked={filters.utilitiesIncluded || false}
                onCheckedChange={(checked) => setFilters({ utilitiesIncluded: !!checked })}
              />
              <Label htmlFor="utilities-included" className="text-sm">
                Utilities Included
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-photos"
                checked={filters.hasPhotos || false}
                onCheckedChange={(checked) => setFilters({ hasPhotos: !!checked })}
              />
              <Label htmlFor="has-photos" className="text-sm">
                Has Photos
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified-owners"
                checked={filters.verifiedOwners || false}
                onCheckedChange={(checked) => setFilters({ verifiedOwners: !!checked })}
              />
              <Label htmlFor="verified-owners" className="text-sm">
                Verified Owners
              </Label>
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
