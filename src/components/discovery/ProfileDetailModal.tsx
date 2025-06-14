import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Users,
  Clock,
  Sparkles,
  Wine,
  Cigarette,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  Verified,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { DiscoveryCard } from '@/types/matching.types';

interface ProfileDetailModalProps {
  card: DiscoveryCard;
  onClose: () => void;
  onSwipe: (action: 'like' | 'pass' | 'super_like') => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  card,
  onClose,
  onSwipe,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { profile, compatibilityScore, compatibilityBreakdown, distance } = card;
  const photos = profile.photos || [];
  
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 60) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const handleSwipeAndClose = (action: 'like' | 'pass' | 'super_like') => {
    onSwipe(action);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Photo Section */}
          <div className="relative bg-gray-100">
            {photos.length > 0 ? (
              <>
                <img
                  src={photos[currentPhotoIndex]?.url}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Photo Navigation */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Home className="w-16 h-16 mx-auto mb-4" />
                  <p>No photos available</p>
                </div>
              </div>
            )}

            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <Badge className="bg-black/70 text-white border-0">
                {compatibilityScore}% match
              </Badge>
              
              {profile.isVerified && (
                <Badge className="bg-blue-500 text-white border-0">
                  <Verified className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-2xl">
                {profile.firstName} {profile.lastName}
                {age && <span className="text-gray-500 font-normal">, {age}</span>}
              </DialogTitle>
              <div className="flex items-center text-gray-600">
                <Briefcase className="w-4 h-4 mr-2" />
                {profile.occupation}
                {distance && (
                  <>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1" />
                    {distance} miles away
                  </>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                {/* Compatibility Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Compatibility Breakdown</h3>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Overall', score: compatibilityBreakdown.overall, key: 'overall' },
                      { label: 'Lifestyle', score: compatibilityBreakdown.lifestyle, key: 'lifestyle' },
                      { label: 'Budget', score: compatibilityBreakdown.budget, key: 'budget' },
                      { label: 'Location', score: compatibilityBreakdown.location, key: 'location' },
                      { label: 'Preferences', score: compatibilityBreakdown.preferences, key: 'preferences' },
                    ].map(({ label, score, key }) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(score)}
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <span className={`text-sm font-semibold ${getCompatibilityColor(score)}`}>
                            {score}%
                          </span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}

                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{profile.location.city}, {profile.location.state}</span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="capitalize">{profile.education?.replace('-', ' ')}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="capitalize">{profile.gender}</span>
                    </div>
                    {profile.roommate?.moveInDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Move-in: {new Date(profile.roommate.moveInDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Roommate Preferences */}
                {profile.roommate && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Roommate Preferences</h3>
                    <div className="space-y-2 text-sm">
                      {profile.roommate.budgetRange && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            Budget: ${profile.roommate.budgetRange.min} - ${profile.roommate.budgetRange.max}/month
                          </span>
                        </div>
                      )}
                      
                      {profile.roommate.housingType && (
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Housing: {profile.roommate.housingType.join(', ')}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Lease: {profile.roommate.leaseDuration?.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lifestyle */}
                {profile.lifestyle && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lifestyle</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.sleepSchedule?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.cleanliness?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.socialLevel?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.guestsPolicy?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Cigarette className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.smoking?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Wine className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.drinking}</span>
                      </div>
                      <div className="flex items-center">
                        <PawPrint className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.pets?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.lifestyle.workSchedule?.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deal Breakers */}
                {profile.roommate?.dealBreakers && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Deal Breakers</h3>
                    <div className="space-y-1 text-sm">
                      {Object.entries(profile.roommate.dealBreakers).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <div key={key} className="flex items-center text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            <span className="capitalize">{key.replace('_', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipeAndClose('pass')}
                  className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <X className="w-6 h-6 text-red-500" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipeAndClose('super_like')}
                  className="w-16 h-16 rounded-full border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
                >
                  <Star className="w-6 h-6 text-yellow-500" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipeAndClose('like')}
                  className="w-16 h-16 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
                >
                  <Heart className="w-6 h-6 text-green-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
