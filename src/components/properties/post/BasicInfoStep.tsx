import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  FileText, 
  Tag,
  Bed
} from 'lucide-react';
import { usePropertyForm } from '@/stores/propertyStore';
import { PROPERTY_TYPES, ROOM_TYPES } from '@/types/property.types';

export const BasicInfoStep: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  return (
    <div className="space-y-8">
      {/* Property Title */}
      <Card className="border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Property Title</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Create an eye-catching title for your property</Label>
            <Input
              id="title"
              placeholder="e.g., Spacious Private Room in Modern Downtown Apartment"
              value={formData.title || ''}
              onChange={(e) => updateFormData({ title: e.target.value })}
              className="text-lg"
            />
            <p className="text-sm text-gray-600">
              A good title includes the room type, key features, and location. Keep it under 80 characters.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Property Description */}
      <Card className="border-green-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Property Description</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Describe your property in detail</Label>
            <Textarea
              id="description"
              placeholder="Describe the property, neighborhood, amenities, and what makes it special. Include details about the room, shared spaces, building amenities, and nearby attractions."
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Be detailed and honest to attract the right roommates</span>
              <span>{formData.description?.length || 0}/1000 characters</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Type & Room Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Property Type</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">What type of property is this?</Label>
              <Select
                value={formData.propertyType || undefined}
                onValueChange={(value) => updateFormData({ propertyType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                Choose the type that best describes your property
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bed className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Room Type</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomType">What are you offering?</Label>
              <Select
                value={formData.roomType || undefined}
                onValueChange={(value) => updateFormData({ roomType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                Specify whether it's a private room, shared room, or entire place
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for a Great Listing</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Be specific:</strong> Include details about the room size, natural light, and unique features</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Mention the neighborhood:</strong> Highlight nearby restaurants, shops, and transportation</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Include lifestyle info:</strong> Describe the household vibe and what you're looking for in a roommate</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Be honest:</strong> Accurate descriptions lead to better matches and fewer disappointments</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Example Titles */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Example Titles</h3>
          <div className="space-y-2 text-gray-700">
            <div className="p-3 bg-white rounded-lg border">
              <strong>Good:</strong> "Sunny Private Room in Mission District - Pet Friendly, Rooftop Access"
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <strong>Good:</strong> "Furnished Studio in SOMA - Walking Distance to Tech Companies"
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <strong>Good:</strong> "Shared Room in Castro Victorian - LGBTQ+ Friendly, Garden Access"
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
