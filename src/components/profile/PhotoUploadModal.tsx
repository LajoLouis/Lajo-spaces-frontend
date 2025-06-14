import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Camera, 
  Upload, 
  X, 
  Star, 
  Image as ImageIcon,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { profileService } from '@/services/profile.service';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/stores/profileStore';
import { toast } from 'sonner';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosUploaded?: () => void;
}

interface PhotoPreview {
  file: File;
  preview: string;
  id: string;
  isPrimary: boolean;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onPhotosUploaded,
}) => {
  const { user } = useAuth();
  const { setProfile } = useProfileStore();
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const maxPhotos = 5;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ errors }) => errors[0]?.message).join(', ');
      setUploadError(errors);
      return;
    }

    // Check if adding files would exceed limit
    if (photos.length + acceptedFiles.length > maxPhotos) {
      setUploadError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    // Process accepted files
    const newPhotos: PhotoPreview[] = acceptedFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}_${index}`,
      isPrimary: photos.length === 0 && index === 0, // First photo is primary if no photos exist
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  }, [photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes.map(type => type.split('/')[1]),
    },
    maxSize: maxFileSize,
    maxFiles: maxPhotos - photos.length,
    disabled: photos.length >= maxPhotos || isUploading,
  });

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(photo => photo.id !== id);
      
      // If we removed the primary photo, make the first remaining photo primary
      if (filtered.length > 0 && !filtered.some(p => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      
      return filtered;
    });
  };

  const setPrimaryPhoto = (id: string) => {
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      isPrimary: photo.id === id,
    })));
  };

  const handleUpload = async () => {
    if (!user?.id || photos.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const files = photos.map(p => p.file);
      const response = await profileService.uploadPhotos(user.id, files);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success('Photos uploaded successfully!');
        
        // Update profile store with new photos
        if (response.data) {
          setProfile(prev => ({
            ...prev,
            photos: response.data.photos,
          }));
        }

        // Clean up
        photos.forEach(photo => URL.revokeObjectURL(photo.preview));
        setPhotos([]);
        
        onPhotosUploaded?.();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast.error('Failed to upload photos. Please try again.');
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    
    // Clean up object URLs
    photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setUploadError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-purple-600" />
            <span>Upload Profile Photos</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading photos...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="relative overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Primary Badge */}
                      {photo.isPrimary && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {!photo.isPrimary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPrimaryPhoto(photo.id)}
                            className="h-6 w-6 p-0"
                            disabled={isUploading}
                          >
                            <Star className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removePhoto(photo.id)}
                          className="h-6 w-6 p-0"
                          disabled={isUploading}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {photos.length < maxPhotos && !isUploading && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop photos here' : 'Upload photos'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag and drop or click to select files
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG, WebP up to 5MB each • {photos.length}/{maxPhotos} photos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Photo Tips:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Upload at least 1 photo (up to {maxPhotos} total)</li>
                  <li>• First photo will be your primary profile photo</li>
                  <li>• Click the star to set a different primary photo</li>
                  <li>• Use clear, well-lit photos that show your face</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={photos.length === 0 || isUploading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
