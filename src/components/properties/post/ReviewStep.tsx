import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Edit, 
  MapPin, 
  DollarSign, 
  Home, 
  Calendar,
  Wifi,
  PawPrint,
  Users,
  AlertTriangle
} from 'lucide-react';
import { usePropertyForm } from '@/stores/propertyStore';

interface ReviewStepProps {
  onSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ onSubmit }) => {
  const { formData, isSubmitting } = usePropertyForm();

  const getPropertyTypeLabel = (type: string) => {
    return type?.charAt(0).toUpperCase() + type?.slice(1).replace('-', ' ') || '';
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'private-room': return 'Private Room';
      case 'shared-room': return 'Shared Room';
      case 'entire-place': return 'Entire Place';
      default: return type || '';
    }
  };

  const getFurnishedLabel = (furnished: string) => {
    switch (furnished) {
      case 'fully': return 'Fully Furnished';
      case 'partially': return 'Partially Furnished';
      case 'unfurnished': return 'Unfurnished';
      default: return furnished || '';
    }
  };

  const completionItems = [
    { field: 'title', label: 'Property Title', required: true },
    { field: 'description', label: 'Description', required: true },
    { field: 'propertyType', label: 'Property Type', required: true },
    { field: 'roomType', label: 'Room Type', required: true },
    { field: 'address', label: 'Address', required: true },
    { field: 'city', label: 'City', required: true },
    { field: 'state', label: 'State', required: true },
    { field: 'zipCode', label: 'ZIP Code', required: true },
    { field: 'monthlyRent', label: 'Monthly Rent', required: true },
    { field: 'bedrooms', label: 'Bedrooms', required: true },
    { field: 'bathrooms', label: 'Bathrooms', required: true },
    { field: 'furnished', label: 'Furnished Status', required: true },
    { field: 'availableFrom', label: 'Available From', required: true },
  ];

  const completedItems = completionItems.filter(item => {
    const value = formData[item.field as keyof typeof formData];
    return value !== undefined && value !== null && value !== '';
  });

  const completionPercentage = Math.round((completedItems.length / completionItems.length) * 100);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Listing</h2>
        <p className="text-gray-600">Double-check everything before publishing</p>
      </div>

      {/* Completion Status */}
      <Card className={`${completionPercentage === 100 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Listing Completion</h3>
            <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
              {completionPercentage}% Complete
            </Badge>
          </div>
          
          {completionPercentage < 100 && (
            <div className="space-y-2">
              <p className="text-sm text-yellow-700 mb-3">Missing required information:</p>
              {completionItems.filter(item => {
                const value = formData[item.field as keyof typeof formData];
                return item.required && (value === undefined || value === null || value === '');
              }).map(item => (
                <div key={item.field} className="flex items-center space-x-2 text-sm text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
          
          {completionPercentage === 100 && (
            <div className="flex items-center space-x-2 text-green-700">
              <Check className="w-5 h-5" />
              <span>All required information completed!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Summary */}
      <Card className="border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Property Summary</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{formData.title || 'Property Title'}</h4>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <Badge className="bg-blue-100 text-blue-700">
                  {getRoomTypeLabel(formData.roomType || '')}
                </Badge>
                <Badge variant="outline">
                  {getPropertyTypeLabel(formData.propertyType || '')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {formData.address && `${formData.address}, `}
                {formData.city}, {formData.state} {formData.zipCode}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span className="text-lg font-semibold text-green-600">
                ${formData.monthlyRent}/month
              </span>
              {formData.utilitiesIncluded && (
                <Badge variant="outline" className="text-green-600">
                  Utilities Included
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-gray-400" />
                <span>{formData.bedrooms} bed, {formData.bathrooms} bath</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Available {formData.availableFrom}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-gray-400" />
                <span>{getFurnishedLabel(formData.furnished || '')}</span>
              </div>
              {formData.parkingSpaces && formData.parkingSpaces > 0 && (
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span>{formData.parkingSpaces} parking</span>
                </div>
              )}
            </div>

            {formData.description && (
              <div>
                <p className="text-gray-700 line-clamp-3">{formData.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amenities & Rules */}
      {(formData.amenities?.length || formData.petsAllowed || formData.smokingAllowed) && (
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Amenities & Rules</h3>
            
            {formData.amenities && formData.amenities.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Amenities:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.slice(0, 6).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity === 'wifi' && <Wifi className="w-3 h-3 mr-1" />}
                      {amenity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  ))}
                  {formData.amenities.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{formData.amenities.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">House Rules:</h4>
              <div className="flex flex-wrap gap-2">
                {formData.petsAllowed && (
                  <Badge className="bg-green-100 text-green-700">
                    <PawPrint className="w-3 h-3 mr-1" />
                    Pets Allowed
                  </Badge>
                )}
                {formData.smokingAllowed && (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    Smoking Allowed
                  </Badge>
                )}
                {formData.guestsAllowed !== false && (
                  <Badge className="bg-blue-100 text-blue-700">
                    <Users className="w-3 h-3 mr-1" />
                    Guests Welcome
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publish Button */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Ready to Publish?</h3>
          <p className="text-green-700 mb-6">
            Your listing will be visible to potential roommates immediately after publishing.
          </p>
          
          <Button
            onClick={onSubmit}
            disabled={completionPercentage < 100 || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Publish Property Listing
              </>
            )}
          </Button>
          
          <p className="text-sm text-green-600 mt-3">
            You can edit or deactivate your listing anytime after publishing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
