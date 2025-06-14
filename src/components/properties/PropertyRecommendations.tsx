import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Bed, 
  Bath, 
  Home,
  Heart,
  Star
} from 'lucide-react';
import { Property } from '@/types/property.types';
import { mockPropertyService } from '@/services/mockProperty.service';
import { usePropertyStore } from '@/stores/propertyStore';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyRecommendationsProps {
  currentProperty: Property;
  maxRecommendations?: number;
}

export const PropertyRecommendations: React.FC<PropertyRecommendationsProps> = ({
  currentProperty,
  maxRecommendations = 6
}) => {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { addToFavorites, removeFromFavorites, isFavorite } = usePropertyStore();

  useEffect(() => {
    loadRecommendations();
  }, [currentProperty.id]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Get all properties and filter out the current one
      const response = await mockPropertyService.getProperties({}, 20);
      
      if (response.success) {
        let allProperties = response.data.properties.filter(p => p.id !== currentProperty.id);
        
        // Simple recommendation algorithm based on:
        // 1. Same neighborhood
        // 2. Similar price range (+/- 30%)
        // 3. Same property type
        // 4. Same room type
        
        const priceRange = {
          min: currentProperty.pricing.monthlyRent * 0.7,
          max: currentProperty.pricing.monthlyRent * 1.3
        };
        
        // Score properties based on similarity
        const scoredProperties = allProperties.map(property => {
          let score = 0;
          
          // Same neighborhood (highest weight)
          if (property.location.neighborhood === currentProperty.location.neighborhood) {
            score += 40;
          }
          
          // Same city
          if (property.location.city === currentProperty.location.city) {
            score += 20;
          }
          
          // Similar price range
          if (property.pricing.monthlyRent >= priceRange.min && 
              property.pricing.monthlyRent <= priceRange.max) {
            score += 25;
          }
          
          // Same property type
          if (property.propertyType === currentProperty.propertyType) {
            score += 10;
          }
          
          // Same room type
          if (property.roomType === currentProperty.roomType) {
            score += 15;
          }
          
          // Similar bedrooms
          if (property.details.bedrooms === currentProperty.details.bedrooms) {
            score += 10;
          }
          
          // Verified owners get bonus
          if (property.ownerProfile.isVerified) {
            score += 5;
          }
          
          // Featured properties get bonus
          if (property.isFeatured) {
            score += 5;
          }
          
          return { property, score };
        });
        
        // Sort by score and take top recommendations
        const topRecommendations = scoredProperties
          .sort((a, b) => b.score - a.score)
          .slice(0, maxRecommendations)
          .map(item => item.property);
        
        setRecommendations(topRecommendations);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = (property: Property, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(property.id)) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property.id);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + 3 >= recommendations.length ? 0 : prev + 3
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - 3 < 0 ? Math.max(0, recommendations.length - 3) : prev - 3
    );
  };

  const visibleRecommendations = recommendations.slice(currentIndex, currentIndex + 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No similar properties found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Similar Properties</CardTitle>
          {recommendations.length > 3 && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentIndex + 3 >= recommendations.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleRecommendations.map((property) => (
            <Link
              key={property.id}
              to={`/properties/${property.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[0].url}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-black/70 text-white border-0">
                      ${property.pricing.monthlyRent.toLocaleString()}/mo
                    </Badge>
                  </div>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleFavoriteToggle(property, e)}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isFavorite(property.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
                  </button>
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {property.isFeatured && (
                      <Badge className="bg-yellow-500 text-white border-0 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {property.ownerProfile.isVerified && (
                      <Badge className="bg-green-500 text-white border-0 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h4>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {property.location.neighborhood}, {property.location.city}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bed className="w-3 h-3 mr-1" />
                      {property.details.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-3 h-3 mr-1" />
                      {property.details.bathrooms}
                    </div>
                    <div className="flex items-center">
                      <Home className="w-3 h-3 mr-1" />
                      {property.propertyType}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {recommendations.length > 3 && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {Array.from({ length: Math.ceil(recommendations.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * 3)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / 3) === index
                      ? 'bg-blue-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
