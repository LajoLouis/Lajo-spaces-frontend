import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageCircle, 
  Phone, 
  Mail,
  MapPin, 
  Calendar, 
  DollarSign,
  Home,
  Bed,
  Bath,
  Square,
  Wifi,
  Car,
  PawPrint,
  Utensils,
  Dumbbell,
  Shield,
  Clock,
  Check,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Property } from '@/types/property.types';
import { usePropertyStore } from '@/stores/propertyStore';
import { useMessageStore } from '@/stores/messageStore';
import { ConversationType, MessageType } from '@/types/message.types';
import { PropertyImageModal } from '@/components/properties/PropertyImageModal';
import { PropertyRecommendations } from '@/components/properties/PropertyRecommendations';
import { PropertyReviews } from '@/components/properties/PropertyReviews';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { getPropertyById, toggleFavorite, isFavorite } = usePropertyStore();
  const { createConversation } = useMessageStore();

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        setError('Property ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const propertyData = await getPropertyById(id);
        
        if (propertyData) {
          setProperty(propertyData);
          setIsFavorited(isFavorite(id));
        } else {
          setError('Property not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load property');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, getPropertyById, isFavorite]);

  const handleFavorite = async () => {
    if (!property) return;
    
    try {
      await toggleFavorite(property.id);
      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleContactOwner = async () => {
    if (!property) return;

    try {
      const conversationId = await createConversation({
        participantId: property.ownerId,
        propertyId: property.id,
        initialMessage: `Hi! I'm interested in your property listing "${property.title}". Could you tell me more about it?`,
        type: ConversationType.PROPERTY_INQUIRY
      });

      navigate('/messages');
      toast.success('Conversation started with property owner');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleShare = async () => {
    if (!property) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Property link copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to share property');
    }
  };

  const nextImage = () => {
    if (!property?.photos) return;
    setCurrentImageIndex((prev) =>
      prev === property.photos.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    if (!property?.photos) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.photos.length - 1 : prev - 1
    );
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'WiFi': <Wifi className="w-4 h-4" />,
      'Parking': <Car className="w-4 h-4" />,
      'Pet Friendly': <PawPrint className="w-4 h-4" />,
      'Kitchen': <Utensils className="w-4 h-4" />,
      'Gym': <Dumbbell className="w-4 h-4" />,
      'Security': <Shield className="w-4 h-4" />,
    };
    return iconMap[amenity] || <Check className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-32 w-full" />
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

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => navigate('/properties')} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Button>
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
            <Button
              variant="ghost"
              onClick={() => navigate('/properties')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Properties</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                className={`flex items-center space-x-2 ${
                  isFavorited ? 'bg-red-50 border-red-200 text-red-600' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                {property.photos && property.photos.length > 0 ? (
                  <>
                    <img
                      src={property.photos[currentImageIndex].url}
                      alt={`${property.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-96 object-cover cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    
                    {/* Image Navigation */}
                    {property.photos.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                          onClick={previousImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {property.photos.length}
                    </div>

                    {/* Expand Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm"
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      View All Photos
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {property.photos && property.photos.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex space-x-2 overflow-x-auto">
                    {property.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 ${
                          index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </CardTitle>
                    <div className="flex items-start text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">
                        {property.location.address}, {property.location.neighborhood}, {property.location.city}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      ${property.pricing.monthlyRent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                </div>

                {/* Property Type and Room Type Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{property.propertyType}</Badge>
                  <Badge variant="outline">{property.roomType}</Badge>
                  {property.details.furnished && (
                    <Badge variant="outline">Furnished</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Key Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">{property.details.bedrooms}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Bedrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">{property.details.bathrooms}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Bathrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">{property.details.squareFootage}</div>
                      <div className="text-xs sm:text-sm text-gray-600">sq ft</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">
                        {new Date(property.availability.availableFrom).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Available</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                <Separator />

                {/* Pricing Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Pricing Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-semibold">${property.pricing.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-semibold">${property.pricing.securityDeposit.toLocaleString()}</span>
                    </div>
                    {property.pricing.utilitiesIncluded && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilities:</span>
                        <span className="font-semibold text-green-600">Included</span>
                      </div>
                    )}
                    {property.pricing.negotiable && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold text-blue-600">Negotiable</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.amenities.wifi && (
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">WiFi</span>
                      </div>
                    )}
                    {property.amenities.airConditioning && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Air Conditioning</span>
                      </div>
                    )}
                    {property.amenities.heating && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Heating</span>
                      </div>
                    )}
                    {property.amenities.laundry && property.amenities.laundry !== 'none' && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Laundry ({property.amenities.laundry})</span>
                      </div>
                    )}
                    {property.amenities.kitchen && (
                      <div className="flex items-center space-x-2">
                        <Utensils className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Kitchen ({property.amenities.kitchen})</span>
                      </div>
                    )}
                    {property.amenities.parking && (
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Parking</span>
                      </div>
                    )}
                    {property.amenities.gym && (
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Gym</span>
                      </div>
                    )}
                    {property.amenities.pool && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Pool</span>
                      </div>
                    )}
                    {property.amenities.petFriendly && (
                      <div className="flex items-center space-x-2">
                        <PawPrint className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Pet Friendly</span>
                      </div>
                    )}
                    {property.amenities.balcony && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Balcony</span>
                      </div>
                    )}
                    {property.amenities.dishwasher && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Dishwasher</span>
                      </div>
                    )}
                    {property.amenities.furnished && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Furnished</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* House Rules */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">House Rules</h3>
                  <div className="space-y-2">
                    {property.rules ? (
                      <>
                        <div className="flex items-start space-x-2">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${property.rules.petsAllowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700">
                            Pets {property.rules.petsAllowed ? 'allowed' : 'not allowed'}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${property.rules.smokingAllowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700">
                            Smoking {property.rules.smokingAllowed ? 'allowed' : 'not allowed'}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${property.rules.partiesAllowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700">
                            Parties {property.rules.partiesAllowed ? 'allowed' : 'not allowed'}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${property.rules.guestsAllowed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700">
                            Guests {property.rules.guestsAllowed ? 'allowed' : 'not allowed'}
                          </span>
                        </div>
                        {property.rules.quietHours && (
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">
                              Quiet hours: {property.rules.quietHours.start} - {property.rules.quietHours.end}
                            </span>
                          </div>
                        )}
                        {property.rules.additionalRules && property.rules.additionalRules.length > 0 && (
                          property.rules.additionalRules.map((rule, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{rule}</span>
                            </div>
                          ))
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">No specific house rules listed.</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">
                        {property.location.address}, {property.location.neighborhood}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{property.location.city}, {property.location.state} {property.location.zipCode}</span>
                    </div>
                    {property.transportation?.nearbyTransit && property.transportation.nearbyTransit.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Nearby Transportation</h4>
                        <div className="space-y-1">
                          {property.transportation.nearbyTransit.map((transport, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {transport}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Owner Info & Actions */}
          <div className="space-y-6">
            {/* Contact Owner Card */}
            <Card>
              <CardHeader>
                <CardTitle>Property Owner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={property.ownerProfile.photo} />
                    <AvatarFallback>
                      {property.ownerProfile.firstName[0]}{property.ownerProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">
                        {property.ownerProfile.firstName} {property.ownerProfile.lastName}
                      </h4>
                      {property.ownerProfile.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Response rate: {property.ownerProfile.responseRate}% • {property.ownerProfile.responseTime}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleContactOwner}
                    className="w-full flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Owner</span>
                  </Button>
                  
                  {property.ownerProfile.phone && (
                    <Button
                      variant="outline"
                      className="w-full flex items-center space-x-2"
                      onClick={() => window.open(`tel:${property.ownerProfile.phone}`)}
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Owner</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Property Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed:</span>
                  <span className="font-medium">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Property ID:</span>
                  <span className="font-medium text-xs">{property.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Inquiries:</span>
                  <span className="font-medium">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <PropertyReviews property={property} />
        </div>

        {/* Similar Properties Section */}
        <div className="mt-12">
          <PropertyRecommendations currentProperty={property} />
        </div>
      </div>

      {/* Image Modal */}
      {property.photos && property.photos.length > 0 && (
        <PropertyImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          images={property.photos.map(photo => photo.url)}
          initialIndex={currentImageIndex}
          propertyTitle={property.title}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
