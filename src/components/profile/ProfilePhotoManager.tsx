import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  X, 
  Star, 
  MoreVertical,
  Eye,
  Trash2,
  Download,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { profileService } from '@/services/profile.service';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/stores/profileStore';
import { toast } from 'sonner';
import { PhotoUploadModal } from './PhotoUploadModal';

interface ProfilePhoto {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  uploadedAt: string;
  sizes?: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  };
}

interface ProfilePhotoManagerProps {
  className?: string;
}

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ className }) => {
  const { user } = useAuth();
  const { profile, setProfile } = useProfileStore();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const maxPhotos = 6;

  // Load user photos on component mount
  useEffect(() => {
    loadUserPhotos();
  }, []);

  const loadUserPhotos = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await profileService.getUserPhotos();
      
      if (response.success) {
        setPhotos(response.data);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUploaded = () => {
    // Refresh photos after upload
    loadUserPhotos();
    setIsUploadModalOpen(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!user?.id) return;

    try {
      setDeletingPhotoId(photoId);
      await profileService.deletePhoto(user.id, photoId);
      
      // Remove photo from local state
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      
      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    if (!user?.id) return;

    try {
      await profileService.setPrimaryPhoto(user.id, photoId);
      
      // Update local state
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        isPrimary: photo.id === photoId
      })));
      
      toast.success('Primary photo updated');
    } catch (error) {
      console.error('Failed to set primary photo:', error);
      toast.error('Failed to set primary photo');
    }
  };

  const getPhotoUrl = (photo: ProfilePhoto, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium') => {
    return photo.sizes?.[size] || photo.url;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Profile Photos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Profile Photos</span>
              <Badge variant="secondary">{photos.length}/{maxPhotos}</Badge>
            </div>
            {photos.length < maxPhotos && (
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Add Photos</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No photos yet</h3>
              <p className="text-muted-foreground mb-4">
                Add photos to make your profile more attractive to potential roommates.
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={getPhotoUrl(photo, 'medium')}
                      alt="Profile photo"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    
                    {/* Primary badge */}
                    {photo.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-50">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    
                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => window.open(photo.url, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </DropdownMenuItem>
                          {!photo.isPrimary && (
                            <DropdownMenuItem onClick={() => handleSetPrimary(photo.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Primary
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="text-destructive"
                            disabled={deletingPhotoId === photo.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingPhotoId === photo.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Photo info */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Uploaded {new Date(photo.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {/* Add more photos placeholder */}
              {photos.length < maxPhotos && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">Add Photo</span>
                </button>
              )}
            </div>
          )}
          
          {/* Upload guidelines */}
          <Alert className="mt-4">
            <AlertDescription className="text-sm">
              <strong>Photo Guidelines:</strong> Upload high-quality photos that clearly show your face. 
              Avoid group photos, sunglasses, or heavily filtered images. Maximum 6 photos, 10MB each.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPhotosUploaded={handlePhotoUploaded}
      />
    </>
  );
};

export default ProfilePhotoManager;
