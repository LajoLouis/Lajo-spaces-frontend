import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Home, 
  Navigation,
  Shield
} from 'lucide-react';
import { usePropertyForm } from '@/stores/propertyStore';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const SF_NEIGHBORHOODS = [
  'SOMA', 'Mission', 'Castro', 'Nob Hill', 'Russian Hill', 'Pacific Heights', 'Marina',
  'Presidio', 'Richmond', 'Sunset', 'Haight-Ashbury', 'Lower Haight', 'Hayes Valley',
  'Tenderloin', 'Financial District', 'Chinatown', 'North Beach', 'Potrero Hill',
  'Dogpatch', 'Bernal Heights', 'Glen Park', 'Noe Valley', 'Twin Peaks', 'Excelsior',
  'Visitacion Valley', 'Bayview', 'Hunters Point'
];

export const LocationStep: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  return (
    <div className="space-y-8">
      {/* Address */}
      <Card className="border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Property Address</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Market Street, Apt 4B"
                value={formData.address || ''}
                onChange={(e) => updateFormData({ address: e.target.value })}
              />
              <p className="text-sm text-gray-600 mt-1">
                Include apartment/unit number if applicable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="San Francisco"
                  value={formData.city || ''}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state || undefined}
                  onValueChange={(value) => updateFormData({ state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="94102"
                  value={formData.zipCode || ''}
                  onChange={(e) => updateFormData({ zipCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Neighborhood */}
      <Card className="border-green-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Neighborhood</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="neighborhood">Neighborhood (Optional)</Label>
              <Select
                value={formData.neighborhood || undefined}
                onValueChange={(value) => updateFormData({ neighborhood: value === "not-specified" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select neighborhood or leave blank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-specified">Not specified</SelectItem>
                  {SF_NEIGHBORHOODS.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-1">
                Help potential roommates understand the area better
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transportation & Accessibility */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Navigation className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Transportation & Accessibility</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nearby Public Transit</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="bart" className="rounded" />
                    <Label htmlFor="bart" className="text-sm">BART Station</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="muni" className="rounded" />
                    <Label htmlFor="muni" className="text-sm">Muni Lines</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="bus" className="rounded" />
                    <Label htmlFor="bus" className="text-sm">Bus Lines</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="caltrain" className="rounded" />
                    <Label htmlFor="caltrain" className="text-sm">Caltrain</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Walking Distance To</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="grocery" className="rounded" />
                    <Label htmlFor="grocery" className="text-sm">Grocery Stores</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="restaurants" className="rounded" />
                    <Label htmlFor="restaurants" className="text-sm">Restaurants</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="parks" className="rounded" />
                    <Label htmlFor="parks" className="text-sm">Parks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="gym" className="rounded" />
                    <Label htmlFor="gym" className="text-sm">Gyms</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Privacy & Safety</h3>
              <div className="space-y-2 text-yellow-800">
                <p>
                  <strong>Your exact address is protected:</strong> We only show the general area and neighborhood to potential roommates until you choose to share more details.
                </p>
                <p>
                  <strong>Meet safely:</strong> Always meet potential roommates in public places first, and trust your instincts.
                </p>
                <p>
                  <strong>Verify identity:</strong> We recommend video calls before in-person meetings.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📍 Location Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Be accurate:</strong> Correct address helps with commute calculations</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Highlight transit:</strong> Good public transportation is a major selling point</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Mention walkability:</strong> Nearby amenities make the location more attractive</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Neighborhood character:</strong> Describe what makes your area special</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
