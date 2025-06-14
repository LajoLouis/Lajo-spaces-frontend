import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bed, 
  Bath, 
  Home, 
  Ruler,
  Car,
  Calendar
} from 'lucide-react';
import { usePropertyForm } from '@/stores/propertyStore';
import { FURNISHED_OPTIONS } from '@/types/property.types';

export const DetailsStep: React.FC = () => {
  const { formData, updateFormData, formErrors, setFormErrors } = usePropertyForm();

  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    updateFormData({ [field]: numValue });

    // Validate year built
    if (field === 'yearBuilt') {
      const errors = { ...formErrors };
      delete errors.yearBuilt;

      if (numValue !== undefined) {
        const currentYear = new Date().getFullYear();

        if (numValue < 1800) {
          errors.yearBuilt = ['Year built cannot be before 1800'];
        } else if (numValue > currentYear) {
          errors.yearBuilt = ['Year built cannot be in the future'];
        } else if (numValue < 0) {
          errors.yearBuilt = ['Year built cannot be negative'];
        }
      }

      setFormErrors(errors);
    }

    // Validate other numeric fields
    if (field === 'bedrooms' && numValue !== undefined && numValue < 0) {
      const errors = { ...formErrors };
      errors.bedrooms = ['Number of bedrooms cannot be negative'];
      setFormErrors(errors);
    }

    if (field === 'bathrooms' && numValue !== undefined && numValue < 0) {
      const errors = { ...formErrors };
      errors.bathrooms = ['Number of bathrooms cannot be negative'];
      setFormErrors(errors);
    }

    if (field === 'squareFootage' && numValue !== undefined && numValue < 0) {
      const errors = { ...formErrors };
      errors.squareFootage = ['Square footage cannot be negative'];
      setFormErrors(errors);
    }

    if (field === 'floor' && numValue !== undefined && numValue < 1) {
      const errors = { ...formErrors };
      errors.floor = ['Floor number must be at least 1'];
      setFormErrors(errors);
    }

    if (field === 'totalFloors' && numValue !== undefined && numValue < 1) {
      const errors = { ...formErrors };
      errors.totalFloors = ['Total floors must be at least 1'];
      setFormErrors(errors);
    }

    if (field === 'parkingSpaces' && numValue !== undefined && numValue < 0) {
      const errors = { ...formErrors };
      errors.parkingSpaces = ['Parking spaces cannot be negative'];
      setFormErrors(errors);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Details */}
      <Card className="border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Basic Property Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bedrooms">Number of Bedrooms *</Label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="2"
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleNumberChange('bedrooms', e.target.value)}
                  className={`pl-10 ${formErrors.bedrooms ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.bedrooms ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.bedrooms[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Use 0 for studio apartments
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bathrooms">Number of Bathrooms *</Label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="bathrooms"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  placeholder="1.5"
                  value={formData.bathrooms || ''}
                  onChange={(e) => updateFormData({ bathrooms: parseFloat(e.target.value) || undefined })}
                  className={`pl-10 ${formErrors.bathrooms ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.bathrooms ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.bathrooms[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Use 0.5 for half baths (no shower/tub)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size & Layout */}
      <Card className="border-green-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Ruler className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Size & Layout</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="squareFootage">Square Footage (Optional)</Label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="squareFootage"
                  type="number"
                  min="0"
                  placeholder="800"
                  value={formData.squareFootage || ''}
                  onChange={(e) => handleNumberChange('squareFootage', e.target.value)}
                  className={`pl-10 ${formErrors.squareFootage ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.squareFootage ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.squareFootage[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Total square footage of the property
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="floor">Floor Number (Optional)</Label>
              <Input
                id="floor"
                type="number"
                min="1"
                placeholder="4"
                value={formData.floor || ''}
                onChange={(e) => handleNumberChange('floor', e.target.value)}
                className={formErrors.floor ? 'border-red-500' : ''}
              />
              {formErrors.floor ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.floor[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Which floor is the property on?
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Furnished Status */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Furnished Status</h3>
          </div>
          <div>
            <Label htmlFor="furnished">Furnishing Level *</Label>
            <Select
              value={formData.furnished || undefined}
              onValueChange={(value) => updateFormData({ furnished: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select furnishing level" />
              </SelectTrigger>
              <SelectContent>
                {FURNISHED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div><strong>Fully Furnished:</strong> Includes all furniture, appliances, and household items</div>
              <div><strong>Partially Furnished:</strong> Some furniture provided, roommate may need to bring some items</div>
              <div><strong>Unfurnished:</strong> Empty space, roommate brings all furniture and belongings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parking */}
      <Card className="border-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Car className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Parking</h3>
          </div>
          <div>
            <Label htmlFor="parkingSpaces">Number of Parking Spaces</Label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="parkingSpaces"
                type="number"
                min="0"
                max="10"
                placeholder="1"
                value={formData.parkingSpaces || ''}
                onChange={(e) => handleNumberChange('parkingSpaces', e.target.value)}
                className={`pl-10 ${formErrors.parkingSpaces ? 'border-red-500' : ''}`}
              />
            </div>
            {formErrors.parkingSpaces ? (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.parkingSpaces[0]}
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-1">
                Use 0 if no parking is available. Include garage, driveway, or street parking.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Age */}
      <Card className="border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Property Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="yearBuilt">Year Built (Optional)</Label>
              <Input
                id="yearBuilt"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                placeholder="2020"
                value={formData.yearBuilt || ''}
                onChange={(e) => handleNumberChange('yearBuilt', e.target.value)}
                className={formErrors.yearBuilt ? 'border-red-500' : ''}
              />
              {formErrors.yearBuilt ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.yearBuilt[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  When was the building constructed? (1800 - {new Date().getFullYear()})
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="totalFloors">Total Floors in Building (Optional)</Label>
              <Input
                id="totalFloors"
                type="number"
                min="1"
                placeholder="15"
                value={formData.totalFloors || ''}
                onChange={(e) => handleNumberChange('totalFloors', e.target.value)}
                className={formErrors.totalFloors ? 'border-red-500' : ''}
              />
              {formErrors.totalFloors ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.totalFloors[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  How many floors does the building have?
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {Object.keys(formErrors).length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-1">
                <span className="text-white text-xs">!</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-3">Please fix the following issues:</h3>
                <ul className="space-y-1 text-red-800">
                  {Object.entries(formErrors).map(([field, errors]) => (
                    <li key={field} className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {errors[0]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📏 Property Details Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Be accurate:</strong> Correct details help roommates make informed decisions</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Highlight unique features:</strong> High ceilings, large windows, or modern appliances</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Parking matters:</strong> Available parking is a major advantage in most cities</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Furnished vs unfurnished:</strong> Be clear about what's included</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Validation:</strong> All numeric fields must be positive values, year built must be between 1800 and current year</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
