import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Upload,
  Image,
  Star,
  X,
  Eye,
  RotateCcw
} from 'lucide-react';
import { usePropertyForm } from '@/stores/propertyStore';

export const PhotosStep: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>(formData.photos || []);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create preview URLs when photos change
  React.useEffect(() => {
    const urls = uploadedPhotos.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Update form data
    updateFormData({ photos: uploadedPhotos });

    // Cleanup URLs on unmount
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [uploadedPhotos, updateFormData]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image format. Please use JPG, PNG, or WebP.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too large. Please use images under 10MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setUploadedPhotos(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    setUploadedPhotos(prev => {
      const newPhotos = [...prev];
      const [movedPhoto] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, movedPhoto);
      return newPhotos;
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Photos</h2>
        <p className="text-gray-600">Add photos to showcase your property (optional but recommended)</p>
      </div>

      {/* Photo Upload Area */}
      <Card className="border-blue-100">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Property Photos</h3>
            <p className="text-gray-600 mb-6">
              Drag and drop photos here, or click to browse
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photos
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: JPG, PNG, WebP (max 10MB each)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo Preview Grid */}
      {uploadedPhotos.length > 0 && (
        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Uploaded Photos ({uploadedPhotos.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadedPhotos([])}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Photo Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = url;
                        link.target = '_blank';
                        link.click();
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Photo Number */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>

                  {/* Primary Photo Indicator */}
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-600 mt-4">
              <strong>Tip:</strong> The first photo will be used as the primary photo in your listing.
              You can reorder photos by removing and re-uploading them in your preferred order.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Photo Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-3">📸 Photo Tips</h3>
              <ul className="space-y-2 text-green-800">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Take multiple angles:</strong> Show the room from different perspectives</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Good lighting:</strong> Natural light makes spaces look more inviting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Clean and tidy:</strong> Make sure the space is clean before photographing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Include common areas:</strong> Show kitchen, living room, and bathroom if shared</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Exterior shots:</strong> Include building exterior and neighborhood views</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Categories */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recommended Photo Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700">Essential Photos:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bedroom (multiple angles)</li>
                <li>• Bathroom</li>
                <li>• Kitchen</li>
                <li>• Living room/common area</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700">Nice to Have:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Building exterior</li>
                <li>• Balcony/patio</li>
                <li>• Gym/amenities</li>
                <li>• Neighborhood views</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skip Option */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6 text-center">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Skip Photos for Now</h3>
          <p className="text-gray-600 mb-4">
            You can add photos later, but listings with photos get 5x more interest!
          </p>
          <p className="text-sm text-gray-500">
            You can always edit your listing and add photos after publishing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
