import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MapPin, 
  Home, 
  DollarSign, 
  Calendar, 
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  PawPrint,
  Verified,
  Star,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Share
} from 'lucide-react';
import { Property } from '@/types/property.types';
import { useFavoriteProperties } from '@/stores/propertyStore';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  compact = false,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavoriteProperties();
  
  const photos = property.photos || [];
  const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
  const isPropertyFavorite = isFavorite(property.id);

  const nextPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPropertyFavorite) {
      removeFromFavorites(property.id);
      toast.success('Removed from favorites');
    } else {
      addToFavorites(property.id);
      toast.success('Added to favorites');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.origin + `/properties/${property.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/properties/${property.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const getRoomTypeLabel = (roomType: string) => {
    switch (roomType) {
      case 'private-room': return 'Private Room';
      case 'shared-room': return 'Shared Room';
      case 'entire-place': return 'Entire Place';
      default: return roomType;
    }
  };

  const getPropertyTypeLabel = (propertyType: string) => {
    return propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
  };

  if (compact) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <Link to={`/properties/${property.id}`}>
          <div className="relative">
            {/* Photo */}
            <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[currentPhotoIndex]?.url || primaryPhoto?.url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Photo Navigation */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.preventDefault(); prevPhoto(); }}
                        className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/60 rounded-full flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="sr-only">Previous photo</span>
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); nextPhoto(); }}
                        className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/60 rounded-full flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span className="sr-only">Next photo</span>
                      </button>
                      
                      {/* Photo Indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {photos.map((_, index) => (
                          <div
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full ${
                              index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Home className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <Badge className="bg-blue-600 text-white border-0">
                  {getRoomTypeLabel(property.roomType)}
                </Badge>
                
                {property.ownerProfile.isVerified && (
                  <Badge className="bg-green-500 text-white border-0">
                    <Verified className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleFavoriteToggle}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center touch-manipulation ${
                    isPropertyFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-white'
                  } transition-colors shadow-sm`}
                >
                  <Heart className={`w-4 h-4 ${isPropertyFavorite ? 'fill-current' : ''}`} />
                  <span className="sr-only">{isPropertyFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 text-gray-600 hover:bg-white flex items-center justify-center transition-colors shadow-sm touch-manipulation"
                >
                  <Share className="w-4 h-4" />
                  <span className="sr-only">Share property</span>
                </button>
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-black/70 text-white border-0 text-lg font-semibold">
                  ${property.pricing.monthlyRent}/mo
                </Badge>
              </div>
            </div>

            {/* Content */}
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">
                    {property.location.neighborhood && `${property.location.neighborhood}, `}
                    {property.location.city}, {property.location.state}
                  </span>
                </div>

                {/* Property Details */}
                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center">
                    <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden xs:inline">{property.details.bedrooms} bed</span>
                    <span className="xs:hidden">{property.details.bedrooms}bd</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden xs:inline">{property.details.bathrooms} bath</span>
                    <span className="xs:hidden">{property.details.bathrooms}ba</span>
                  </div>
                  <div className="flex items-center truncate">
                    <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{getPropertyTypeLabel(property.propertyType)}</span>
                  </div>
                </div>

                {/* Amenities Preview */}
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  {property.amenities.wifi && <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />}
                  {property.details.parkingSpaces && property.details.parkingSpaces > 0 && (
                    <Car className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  )}
                  {property.amenities.petFriendly && <PawPrint className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />}
                  {property.amenities.gym && <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-0.5 sm:mr-1" />
                      <span className="hidden xs:inline">{property.views}</span>
                      <span className="xs:hidden">{property.views > 999 ? `${Math.floor(property.views/1000)}k` : property.views}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 mr-0.5 sm:mr-1" />
                      <span className="hidden xs:inline">{property.favorites}</span>
                      <span className="xs:hidden">{property.favorites > 999 ? `${Math.floor(property.favorites/1000)}k` : property.favorites}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-3 h-3 mr-0.5 sm:mr-1" />
                      <span className="hidden xs:inline">{property.inquiries}</span>
                      <span className="xs:hidden">{property.inquiries > 999 ? `${Math.floor(property.inquiries/1000)}k` : property.inquiries}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-0.5 sm:mr-1" />
                    <span className="hidden sm:inline">Available {new Date(property.availability.availableFrom).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(property.availability.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    );
  }

  // Full card view (list mode)
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/properties/${property.id}`}>
        <div className="flex flex-col md:flex-row">
          {/* Photo Section */}
          <div className="md:w-1/3 relative">
            <div className="aspect-[4/3] md:aspect-[3/2] bg-gray-200 relative overflow-hidden">
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[currentPhotoIndex]?.url || primaryPhoto?.url}
                    alt={property.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Photo Navigation */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.preventDefault(); prevPhoto(); }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); nextPhoto(); }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      {/* Photo Indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {photos.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Home className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Price Badge */}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-black/70 text-white border-0 text-lg font-semibold">
                  ${property.pricing.monthlyRent}/mo
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:w-2/3">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-600 text-white">
                        {getRoomTypeLabel(property.roomType)}
                      </Badge>
                      {property.ownerProfile.isVerified && (
                        <Badge className="bg-green-500 text-white">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {property.isFeatured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {property.title}
                    </h3>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleFavoriteToggle}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isPropertyFavorite 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      <Heart className={`w-5 h-5 ${isPropertyFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>
                    {property.location.neighborhood && `${property.location.neighborhood}, `}
                    {property.location.city}, {property.location.state}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 line-clamp-2">
                  {property.description}
                </p>

                {/* Property Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{property.details.bedrooms} bedroom{property.details.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{property.details.bathrooms} bathroom{property.details.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{getPropertyTypeLabel(property.propertyType)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Available {new Date(property.availability.availableFrom).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex items-center space-x-4">
                  {property.amenities.wifi && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Wifi className="w-4 h-4 mr-1" />
                      WiFi
                    </div>
                  )}
                  {property.details.parkingSpaces && property.details.parkingSpaces > 0 && (
                    <div className="flex items-center text-sm text-green-600">
                      <Car className="w-4 h-4 mr-1" />
                      Parking
                    </div>
                  )}
                  {property.amenities.petFriendly && (
                    <div className="flex items-center text-sm text-orange-600">
                      <PawPrint className="w-4 h-4 mr-1" />
                      Pet Friendly
                    </div>
                  )}
                  {property.amenities.gym && (
                    <div className="flex items-center text-sm text-purple-600">
                      <Users className="w-4 h-4 mr-1" />
                      Gym
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {property.views} views
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {property.favorites} favorites
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {property.inquiries} inquiries
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Posted {new Date(property.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Link>
    </Card>
  );
};
