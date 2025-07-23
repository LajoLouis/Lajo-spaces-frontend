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
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
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

  const maxPhotos = 6;
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Use the new photo upload hook
  const {
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    uploadedPhotos,
    uploadPhotos,
    cancelUpload,
    reset: resetUpload,
  } = usePhotoUpload({
    maxFiles: maxPhotos,
    maxFileSize,
    allowedTypes,
    onSuccess: (uploadedPhotos) => {
      // Update profile store with new photos
      setProfile(prev => ({
        ...prev,
        photos: [...(prev?.photos || []), ...uploadedPhotos],
      }));

      // Clean up and close
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      setPhotos([]);
      onPhotosUploaded?.();
      onClose();
    },
    onError: (error) => {
      console.error('Photo upload failed:', error);
    },
    showToasts: true,
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ errors }) => errors[0]?.message).join(', ');
      toast.error(`Some files were rejected: ${errors}`);
      return;
    }

    // Check if adding files would exceed limit
    if (photos.length + acceptedFiles.length > maxPhotos) {
      toast.error(`You can only upload up to ${maxPhotos} photos`);
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
  }, [photos.length, maxPhotos]);

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

    const files = photos.map(p => p.file);
    await uploadPhotos(files);
  };

  const handleClose = () => {
    if (isUploading) {
      // Cancel upload if in progress
      cancelUpload();
    }

    // Clean up object URLs
    photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    resetUpload();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span>Upload Profile Photos</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{uploadError}</AlertDescription>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
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
                        <Badge className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-yellow-500 hover:bg-yellow-600 text-xs">
                          <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          <span className="hidden xs:inline">Primary</span>
                          <span className="xs:hidden">1st</span>
                        </Badge>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex space-x-1">
                        {!photo.isPrimary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPrimaryPhoto(photo.id)}
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 touch-manipulation"
                            disabled={isUploading}
                          >
                            <Star className="w-3 h-3" />
                            <span className="sr-only">Set as primary</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removePhoto(photo.id)}
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0 touch-manipulation"
                          disabled={isUploading}
                        >
                          <X className="w-3 h-3" />
                          <span className="sr-only">Remove photo</span>
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
              className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors touch-manipulation ${
                isDragActive
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop photos here' : 'Upload photos'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    <span className="hidden sm:inline">Drag and drop or </span>Click to select files
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    <span className="hidden sm:inline">JPG, PNG, WebP up to 5MB each • </span>
                    {photos.length}/{maxPhotos} photos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-blue-900 mb-1">Photo Tips:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Upload at least 1 photo (up to {maxPhotos} total)</li>
                  <li>• First photo will be your primary profile photo</li>
                  <li className="hidden sm:list-item">• Click the star to set a different primary photo</li>
                  <li>• Use clear, well-lit photos that show your face</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={photos.length === 0 || isUploading}
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto order-1 sm:order-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Uploading...</span>
                <span className="sm:hidden">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}</span>
                <span className="sm:hidden">Upload ({photos.length})</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
