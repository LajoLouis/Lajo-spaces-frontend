import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
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
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePropertyPhotoUpload } from '@/hooks/usePhotoUpload';
import { toast } from 'sonner';

interface PropertyPhoto {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  uploadedAt: string;
}

interface PropertyPhotoUploadProps {
  propertyId: string;
  existingPhotos?: PropertyPhoto[];
  onPhotosUpdated?: (photos: PropertyPhoto[]) => void;
  maxPhotos?: number;
  className?: string;
}

interface PhotoPreview {
  file: File;
  preview: string;
  id: string;
}

export const PropertyPhotoUpload: React.FC<PropertyPhotoUploadProps> = ({
  propertyId,
  existingPhotos = [],
  onPhotosUpdated,
  maxPhotos = 10,
  className
}) => {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<PropertyPhoto[]>(existingPhotos);

  const {
    isUploading,
    progress,
    error,
    uploadPropertyPhotos,
  } = usePropertyPhotoUpload(propertyId, {
    maxFiles: maxPhotos,
    onSuccess: (newPhotos) => {
      // Add new photos to uploaded photos
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
      
      // Clear preview photos
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      setPhotos([]);
      
      // Notify parent component
      onPhotosUpdated?.([...uploadedPhotos, ...newPhotos]);
      
      toast.success(`${newPhotos.length} photo(s) uploaded successfully!`);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error}`);
    },
    showToasts: false, // We handle toasts manually
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ errors }) => errors[0]?.message).join(', ');
      toast.error(`Some files were rejected: ${errors}`);
      return;
    }

    // Check if adding files would exceed limit
    const totalPhotos = uploadedPhotos.length + photos.length + acceptedFiles.length;
    if (totalPhotos > maxPhotos) {
      toast.error(`You can only upload up to ${maxPhotos} photos total`);
      return;
    }

    // Process accepted files
    const newPhotos: PhotoPreview[] = acceptedFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}_${index}`,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  }, [uploadedPhotos.length, photos.length, maxPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: maxPhotos - uploadedPhotos.length - photos.length,
    disabled: isUploading || (uploadedPhotos.length + photos.length >= maxPhotos),
  });

  const removePreviewPhoto = (id: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter(photo => photo.id !== id);
    });
  };

  const handleUpload = async () => {
    if (photos.length === 0) return;
    
    const files = photos.map(p => p.file);
    await uploadPropertyPhotos(files);
  };

  const removeUploadedPhoto = (photoId: string) => {
    // TODO: Implement delete from backend
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
    onPhotosUpdated?.(uploadedPhotos.filter(photo => photo.id !== photoId));
    toast.success('Photo removed');
  };

  const setPrimaryPhoto = (photoId: string) => {
    // TODO: Implement set primary in backend
    setUploadedPhotos(prev => prev.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    })));
    onPhotosUpdated?.(uploadedPhotos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    })));
    toast.success('Primary photo updated');
  };

  const totalPhotos = uploadedPhotos.length + photos.length;
  const canUploadMore = totalPhotos < maxPhotos && !isUploading;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Property Photos</span>
            <Badge variant="secondary">{totalPhotos}/{maxPhotos}</Badge>
          </div>
          {photos.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {photos.length} Photo{photos.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading photos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Photos Grid */}
        {uploadedPhotos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Uploaded Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo.url}
                      alt="Property photo"
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
                            <DropdownMenuItem onClick={() => setPrimaryPhoto(photo.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Primary
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => removeUploadedPhoto(photo.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Photos Grid */}
        {photos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Ready to Upload</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Remove button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePreviewPhoto(photo.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Dropzone */}
        {canUploadMore && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          >
            <input {...getInputProps()} />
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the photos here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop photos here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload up to {maxPhotos - totalPhotos} more photos (max 10MB each)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Guidelines */}
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Photo Tips:</strong> Upload high-quality photos that showcase your property's best features. 
            Include photos of bedrooms, common areas, kitchen, and bathroom. Good lighting makes a big difference!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PropertyPhotoUpload;
