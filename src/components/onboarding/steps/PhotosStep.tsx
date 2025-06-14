import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  X, 
  Star, 
  Image as ImageIcon,
  AlertCircle,
  Check
} from 'lucide-react';
import { useDrafts } from '@/stores/profileStore';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotosStepProps {
  onValidationChange: (isValid: boolean) => void;
  isActive: boolean;
}

interface PhotoPreview {
  file: File;
  preview: string;
  id: string;
  isPrimary: boolean;
}

export const PhotosStep: React.FC<PhotosStepProps> = ({
  onValidationChange,
  isActive,
}) => {
  const { photos: draftPhotos, updatePhotos } = useDrafts();
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const maxPhotos = 5;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  useEffect(() => {
    // Validate photos
    const isValid = photos.length >= 1;
    onValidationChange(isValid);
  }, [photos, onValidationChange]);

  useEffect(() => {
    if (isActive) {
      // Update draft data
      updatePhotos({
        photos: photos.map(p => p.file),
        primaryPhotoIndex: photos.findIndex(p => p.isPrimary),
      });
    }
  }, [photos, isActive, updatePhotos]);

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
    disabled: photos.length >= maxPhotos,
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

  const photoTips = [
    'Use clear, well-lit photos',
    'Include at least one face photo',
    'Show your personality and interests',
    'Avoid group photos as your main photo',
    'Keep photos recent (within 2 years)',
  ];

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Upload Your Photos</h3>
            <Badge variant="secondary">
              {photos.length}/{maxPhotos} photos
            </Badge>
          </div>

          {photos.length < maxPhotos && (
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
                    JPEG, PNG, WebP up to 5MB each
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Your Photos</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Photo Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      {!photo.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPrimaryPhoto(photo.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removePhoto(photo.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Primary Badge */}
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    </div>
                  )}

                  {/* Photo Number */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {photos.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Great! You've uploaded {photos.length} photo{photos.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {photos.find(p => p.isPrimary) ? 'Your primary photo is set.' : 'Click the star to set a primary photo.'}
                      {photos.length < maxPhotos && ` You can add ${maxPhotos - photos.length} more.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo Tips */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Photo Tips</h3>
          </div>

          <ul className="space-y-2">
            {photoTips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Validation Message */}
      {photos.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please upload at least one photo to continue. This helps other users get to know you better!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
