import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit, 
  Upload, 
  X,
  Home,
  DollarSign,
  MapPin,
  Settings,
  Image as ImageIcon,
  AlertCircle,
  Check
} from 'lucide-react';
import { usePropertyStore } from '@/stores/propertyStore';
import { Property } from '@/types/property.types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById, updateProperty, isLoading } = usePropertyStore();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Partial<Property>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    if (!id) return;
    
    try {
      const propertyData = await getPropertyById(id);
      if (propertyData) {
        setProperty(propertyData);
        setFormData(propertyData);
      } else {
        toast.error('Property not found');
        navigate('/properties/manage');
      }
    } catch (error) {
      toast.error('Failed to load property');
      navigate('/properties/manage');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof Property],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!property || !id) return;

    try {
      setIsSaving(true);
      await updateProperty(id, formData);
      setHasChanges(false);
      toast.success('Property updated successfully');
    } catch (error) {
      toast.error('Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/properties/manage');
      }
    } else {
      navigate('/properties/manage');
    }
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Management</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
                <p className="text-gray-600">{property.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/properties/${id}`)}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Unsaved Changes Alert */}
        {hasChanges && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You have unsaved changes. Don't forget to save your updates.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Edit className="w-5 h-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Property Title</Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter property title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your property"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propertyType">Property Type</Label>
                        <select
                          id="propertyType"
                          value={formData.propertyType || ''}
                          onChange={(e) => handleInputChange('propertyType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="condo">Condo</option>
                          <option value="studio">Studio</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="loft">Loft</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="roomType">Room Type</Label>
                        <select
                          id="roomType"
                          value={formData.roomType || ''}
                          onChange={(e) => handleInputChange('roomType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="private-room">Private Room</option>
                          <option value="shared-room">Shared Room</option>
                          <option value="entire-place">Entire Place</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Location</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.location?.address || ''}
                        onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                        placeholder="Enter full address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.location?.city || ''}
                          onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.location?.state || ''}
                          onChange={(e) => handleNestedInputChange('location', 'state', e.target.value)}
                          placeholder="State"
                        />
                      </div>

                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.location?.zipCode || ''}
                          onChange={(e) => handleNestedInputChange('location', 'zipCode', e.target.value)}
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="neighborhood">Neighborhood</Label>
                      <Input
                        id="neighborhood"
                        value={formData.location?.neighborhood || ''}
                        onChange={(e) => handleNestedInputChange('location', 'neighborhood', e.target.value)}
                        placeholder="Neighborhood"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Home className="w-5 h-5" />
                      <span>Property Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={formData.details?.bedrooms || 0}
                          onChange={(e) => handleNestedInputChange('details', 'bedrooms', parseInt(e.target.value))}
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          step="0.5"
                          value={formData.details?.bathrooms || 0}
                          onChange={(e) => handleNestedInputChange('details', 'bathrooms', parseFloat(e.target.value))}
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="squareFootage">Square Footage</Label>
                        <Input
                          id="squareFootage"
                          type="number"
                          value={formData.details?.squareFootage || ''}
                          onChange={(e) => handleNestedInputChange('details', 'squareFootage', parseInt(e.target.value))}
                          placeholder="sq ft"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="furnished">Furnished Status</Label>
                      <select
                        id="furnished"
                        value={formData.details?.furnished || ''}
                        onChange={(e) => handleNestedInputChange('details', 'furnished', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="fully">Fully Furnished</option>
                        <option value="partially">Partially Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Pricing Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
                        <Input
                          id="monthlyRent"
                          type="number"
                          value={formData.pricing?.monthlyRent || ''}
                          onChange={(e) => handleNestedInputChange('pricing', 'monthlyRent', parseInt(e.target.value))}
                          placeholder="2000"
                        />
                      </div>

                      <div>
                        <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                        <Input
                          id="securityDeposit"
                          type="number"
                          value={formData.pricing?.securityDeposit || ''}
                          onChange={(e) => handleNestedInputChange('pricing', 'securityDeposit', parseInt(e.target.value))}
                          placeholder="2000"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="utilitiesIncluded"
                        checked={formData.pricing?.utilitiesIncluded || false}
                        onCheckedChange={(checked) => handleNestedInputChange('pricing', 'utilitiesIncluded', checked)}
                      />
                      <Label htmlFor="utilitiesIncluded">Utilities Included</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="negotiable"
                        checked={formData.pricing?.negotiable || false}
                        onCheckedChange={(checked) => handleNestedInputChange('pricing', 'negotiable', checked)}
                      />
                      <Label htmlFor="negotiable">Price Negotiable</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5" />
                      <span>Property Photos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Management</h3>
                      <p className="text-gray-600 mb-6">Photo upload and management coming soon...</p>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Property Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rented">Rented</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured || false}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                  <Label htmlFor="isFeatured">Featured Property</Label>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-semibold">{property.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorites:</span>
                  <span className="font-semibold">{property.favorites}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Inquiries:</span>
                  <span className="font-semibold">{property.inquiries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed:</span>
                  <span className="font-semibold">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
