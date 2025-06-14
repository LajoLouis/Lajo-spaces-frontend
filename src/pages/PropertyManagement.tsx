import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Plus, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Edit,
  MoreVertical,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { usePropertyStore } from '@/stores/propertyStore';
import { Property } from '@/types/property.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertyAnalytics } from '@/components/properties/PropertyAnalytics';
import { InquiryManagement } from '@/components/properties/InquiryManagement';

export default function PropertyManagement() {
  const navigate = useNavigate();
  const { userProperties, isLoading, getUserProperties } = usePropertyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    getUserProperties();
  }, [getUserProperties]);

  const filteredProperties = userProperties.filter(property =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate aggregate metrics
  const totalViews = userProperties.reduce((sum, property) => sum + property.views, 0);
  const totalFavorites = userProperties.reduce((sum, property) => sum + property.favorites, 0);
  const totalInquiries = userProperties.reduce((sum, property) => sum + property.inquiries, 0);
  const averageRent = userProperties.length > 0 
    ? userProperties.reduce((sum, property) => sum + property.pricing.monthlyRent, 0) / userProperties.length 
    : 0;

  const activeProperties = userProperties.filter(p => p.status === 'active').length;
  const rentedProperties = userProperties.filter(p => p.status === 'rented').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Property Management</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Manage your listings and track performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="outline" className="flex items-center space-x-2 flex-1 sm:flex-none">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button asChild className="flex items-center space-x-2 flex-1 sm:flex-none">
                <Link to="/properties/post">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Property</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{userProperties.length}</p>
                  <p className="text-xs sm:text-sm text-green-600">
                    {activeProperties} active • {rentedProperties} rented
                  </p>
                </div>
                <Home className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+12% this month</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900">{totalInquiries}</p>
                  <p className="text-sm text-blue-600">
                    {userProperties.length > 0 ? (totalInquiries / userProperties.length).toFixed(1) : 0} avg per property
                  </p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rent</p>
                  <p className="text-3xl font-bold text-gray-900">${averageRent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New views on "Downtown Apartment"</p>
                        <p className="text-xs text-gray-600">15 views in the last 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New inquiry received</p>
                        <p className="text-xs text-gray-600">From Sarah J. for Mission District room</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Heart className="w-4 h-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Property favorited</p>
                        <p className="text-xs text-gray-600">Castro house added to 3 wishlists</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Top Performing Properties</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userProperties
                      .sort((a, b) => (b.views + b.favorites + b.inquiries) - (a.views + a.favorites + a.inquiries))
                      .slice(0, 3)
                      .map((property) => (
                        <div key={property.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Home className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{property.title}</p>
                            <p className="text-xs text-gray-600">{property.location.neighborhood}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-gray-500">{property.views} views</span>
                              <span className="text-xs text-gray-500">{property.favorites} favorites</span>
                              <span className="text-xs text-gray-500">{property.inquiries} inquiries</span>
                            </div>
                          </div>
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search properties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Properties List */}
            <div className="space-y-4">
              {filteredProperties.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first property'}
                    </p>
                    <Button asChild>
                      <Link to="/properties/post">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Property
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredProperties.map((property) => (
                  <PropertyManagementCard key={property.id} property={property} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {userProperties.length > 0 ? (
              <div className="space-y-8">
                {userProperties.map((property) => (
                  <div key={property.id}>
                    <PropertyAnalytics property={property} />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Available</h3>
                  <p className="text-gray-600">Add properties to see analytics and performance data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiryManagement userProperties={userProperties} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface PropertyManagementCardProps {
  property: Property;
}

function PropertyManagementCard({ property }: PropertyManagementCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Property Image */}
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            {property.photos && property.photos.length > 0 ? (
              <img
                src={property.photos[0].url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {property.location.neighborhood}, {property.location.city}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{property.views} views</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{property.favorites} favorites</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{property.inquiries} inquiries</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                  {property.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/properties/${property.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Property
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/properties/${property.id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Property
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-green-600">
                  ${property.pricing.monthlyRent.toLocaleString()}/mo
                </span>
                <span className="text-sm text-gray-500">
                  Listed {new Date(property.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/properties/${property.id}/edit`)}
                >
                  Edit
                </Button>
                <Button size="sm" onClick={() => navigate(`/properties/${property.id}`)}>
                  View
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
