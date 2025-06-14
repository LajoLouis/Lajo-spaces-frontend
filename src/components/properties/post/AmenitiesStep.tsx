import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  Car, 
  PawPrint, 
  Home,
  Zap,
  Waves,
  Users,
  Shield
} from 'lucide-react';
import { usePropertyForm } from '@/stores/propertyStore';

const amenityCategories = [
  {
    title: 'Basic Amenities',
    icon: Home,
    color: 'blue',
    amenities: [
      { value: 'wifi', label: 'WiFi', icon: Wifi },
      { value: 'airConditioning', label: 'Air Conditioning', icon: Zap },
      { value: 'heating', label: 'Heating', icon: Zap },
      { value: 'laundry', label: 'Laundry (In-Unit/Building)', icon: Home },
    ]
  },
  {
    title: 'Kitchen & Appliances',
    icon: Home,
    color: 'green',
    amenities: [
      { value: 'dishwasher', label: 'Dishwasher', icon: Home },
      { value: 'microwave', label: 'Microwave', icon: Home },
      { value: 'refrigerator', label: 'Refrigerator', icon: Home },
      { value: 'oven', label: 'Oven/Stove', icon: Home },
    ]
  },
  {
    title: 'Building Amenities',
    icon: Users,
    color: 'purple',
    amenities: [
      { value: 'elevator', label: 'Elevator', icon: Home },
      { value: 'gym', label: 'Gym/Fitness Center', icon: Users },
      { value: 'pool', label: 'Pool', icon: Waves },
      { value: 'rooftop', label: 'Rooftop Access', icon: Home },
      { value: 'doorman', label: 'Doorman/Concierge', icon: Shield },
    ]
  },
  {
    title: 'Outdoor & Storage',
    icon: Home,
    color: 'orange',
    amenities: [
      { value: 'balcony', label: 'Balcony', icon: Home },
      { value: 'patio', label: 'Patio', icon: Home },
      { value: 'garden', label: 'Garden Access', icon: Home },
      { value: 'storage', label: 'Storage Space', icon: Home },
      { value: 'bike_storage', label: 'Bike Storage', icon: Car },
    ]
  }
];

export const AmenitiesStep: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    updateFormData({ amenities: updatedAmenities });
  };

  const handleRuleToggle = (rule: string, value: boolean) => {
    updateFormData({ [rule]: value });
  };

  return (
    <div className="space-y-8">
      {/* Amenities */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Amenities</h2>
          <p className="text-gray-600">Select all amenities available to your roommate</p>
        </div>

        {amenityCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <Card key={category.title} className={`border-${category.color}-100`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CategoryIcon className={`w-5 h-5 text-${category.color}-600`} />
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.amenities.map((amenity) => {
                    const AmenityIcon = amenity.icon;
                    const isSelected = formData.amenities?.includes(amenity.value) || false;
                    
                    return (
                      <div
                        key={amenity.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          isSelected
                            ? `border-${category.color}-500 bg-${category.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAmenityToggle(amenity.value)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleAmenityToggle(amenity.value)}
                        />
                        <AmenityIcon className={`w-4 h-4 ${isSelected ? `text-${category.color}-600` : 'text-gray-400'}`} />
                        <Label className="cursor-pointer">{amenity.label}</Label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* House Rules */}
      <Card className="border-red-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold">House Rules</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Set clear expectations for your living space
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="petsAllowed"
                    checked={formData.petsAllowed || false}
                    onCheckedChange={(checked) => handleRuleToggle('petsAllowed', !!checked)}
                  />
                  <div className="flex items-center space-x-2">
                    <PawPrint className="w-4 h-4 text-orange-500" />
                    <Label htmlFor="petsAllowed">Pets Allowed</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="smokingAllowed"
                    checked={formData.smokingAllowed || false}
                    onCheckedChange={(checked) => handleRuleToggle('smokingAllowed', !!checked)}
                  />
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="smokingAllowed">Smoking Allowed</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="partiesAllowed"
                    checked={formData.partiesAllowed || false}
                    onCheckedChange={(checked) => handleRuleToggle('partiesAllowed', !!checked)}
                  />
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <Label htmlFor="partiesAllowed">Parties/Events Allowed</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="guestsAllowed"
                    checked={formData.guestsAllowed !== false}
                    onCheckedChange={(checked) => handleRuleToggle('guestsAllowed', !!checked)}
                  />
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="guestsAllowed">Guests Allowed</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">✨ Amenities Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Be comprehensive:</strong> List all available amenities to attract more interest</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Highlight unique features:</strong> Rooftop access, gym, or in-unit laundry are big draws</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Set clear rules:</strong> Upfront expectations prevent conflicts later</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Consider lifestyle:</strong> Pet-friendly and smoking policies are important filters</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
