import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Home,
  DollarSign,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
  Verified
} from 'lucide-react';
import { DiscoveryCard as DiscoveryCardType } from '@/types/matching.types';
import { ProfileDetailModal } from './ProfileDetailModal';

interface DiscoveryCardProps {
  card: DiscoveryCardType;
  onSwipe: (action: 'like' | 'pass' | 'super_like') => void;
  showActions?: boolean;
  compact?: boolean;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  card,
  onSwipe,
  showActions = true,
  compact = false,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const { profile, compatibilityScore, distance } = card;
  const photos = profile.photos || [];
  const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
  
  // Calculate age
  const age = profile.dateOfBirth 
    ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()
    : null;

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

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  if (compact) {
    return (
      <>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div className="relative">
            {/* Photo */}
            <div className="aspect-[4/5] bg-gray-200 relative overflow-hidden">
              {primaryPhoto ? (
                <img
                  src={primaryPhoto.url}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-400">
                    <Home className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No photo</p>
                  </div>
                </div>
              )}
              
              {/* Compatibility Badge */}
              <div className="absolute top-3 left-3">
                <Badge className={`${getCompatibilityColor(compatibilityScore)} border-0`}>
                  {compatibilityScore}% match
                </Badge>
              </div>

              {/* Verification Badge */}
              {profile.isVerified && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-blue-500 text-white border-0">
                    <Verified className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                    {age && <span className="text-gray-500 font-normal">, {age}</span>}
                  </h3>
                  {distance && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {distance}mi
                    </div>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {profile.occupation}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  {profile.location.city}, {profile.location.state}
                </div>

                {profile.roommate?.budgetRange && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${profile.roommate.budgetRange.min} - ${profile.roommate.budgetRange.max}/month
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailModal(true)}
                  >
                    <Info className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSwipe('pass')}
                      className="w-8 h-8 p-0 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSwipe('like')}
                      className="w-8 h-8 p-0 border-green-200 hover:bg-green-50"
                    >
                      <Heart className="w-3 h-3 text-green-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Detail Modal */}
        {showDetailModal && (
          <ProfileDetailModal
            card={card}
            onClose={() => setShowDetailModal(false)}
            onSwipe={onSwipe}
          />
        )}
      </>
    );
  }

  // Full card view
  return (
    <>
      <Card className="w-full max-w-sm mx-auto overflow-hidden shadow-xl">
        <div className="relative">
          {/* Photo Carousel */}
          <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
            {photos.length > 0 ? (
              <>
                <img
                  src={photos[currentPhotoIndex]?.url || primaryPhoto?.url}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Photo Navigation */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
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
                <div className="text-center text-gray-400">
                  <Home className="w-16 h-16 mx-auto mb-4" />
                  <p>No photos available</p>
                </div>
              </div>
            )}

            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <Badge className={`${getCompatibilityColor(compatibilityScore)} border-0`}>
                {compatibilityScore}% {getCompatibilityLabel(compatibilityScore)}
              </Badge>
              
              {profile.isVerified && (
                <Badge className="bg-blue-500 text-white border-0">
                  <Verified className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {distance && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-black/50 text-white border-0">
                  <MapPin className="w-3 h-3 mr-1" />
                  {distance} miles away
                </Badge>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Name and Age */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                  {age && <span className="text-gray-500 font-normal">, {age}</span>}
                </h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {profile.occupation}
                </div>
              </div>

              {/* Compatibility Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Compatibility</span>
                  <span className="text-sm font-semibold text-gray-900">{compatibilityScore}%</span>
                </div>
                <Progress value={compatibilityScore} className="h-2" />
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {profile.location.city}, {profile.location.state}
                </div>
                
                {profile.roommate?.budgetRange && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${profile.roommate.budgetRange.min}-${profile.roommate.budgetRange.max}
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  {profile.education}
                </div>
                
                {profile.roommate?.moveInDate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(profile.roommate.moveInDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Bio Preview */}
              {profile.bio && (
                <div>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.slice(0, 4).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {profile.interests.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{profile.interests.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(true)}
                className="w-full"
              >
                <Info className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && (
        <ProfileDetailModal
          card={card}
          onClose={() => setShowDetailModal(false)}
          onSwipe={onSwipe}
        />
      )}
    </>
  );
};
