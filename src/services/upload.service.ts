import { apiService } from './api.service';
import { 
  FileUploadResponse, 
  ProfilePhotoUploadResponse, 
  PropertyPhotoUploadResponse,
  API_ENDPOINTS 
} from '@/types/api.types';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  timeout?: number;
  signal?: AbortSignal;
}

class UploadService {
  // Upload single image
  async uploadSingleImage(
    file: File, 
    options: UploadOptions = {}
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.uploadWithProgress(
      API_ENDPOINTS.UPLOADS.SINGLE_IMAGE,
      formData,
      options
    );

    return response;
  }

  // Upload avatar/profile photo
  async uploadAvatar(
    file: File, 
    options: UploadOptions = {}
  ): Promise<ProfilePhotoUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.uploadWithProgress(
      API_ENDPOINTS.UPLOADS.AVATAR,
      formData,
      options
    );

    return response;
  }

  // Upload profile photo (using photos endpoint)
  async uploadProfilePhoto(
    file: File, 
    options: UploadOptions = {}
  ): Promise<ProfilePhotoUploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await this.uploadWithProgress(
      API_ENDPOINTS.PHOTOS.UPLOAD,
      formData,
      options
    );

    return response;
  }

  // Upload property photos
  async uploadPropertyPhotos(
    propertyId: string,
    files: File[], 
    options: UploadOptions = {}
  ): Promise<PropertyPhotoUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    const response = await this.uploadWithProgress(
      `${API_ENDPOINTS.PROPERTY_PHOTOS.UPLOAD}/${propertyId}/photos`,
      formData,
      options
    );

    return response;
  }

  // Upload message attachment
  async uploadMessageAttachment(
    file: File, 
    options: UploadOptions = {}
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.uploadWithProgress(
      API_ENDPOINTS.UPLOADS.MESSAGE_ATTACHMENT,
      formData,
      options
    );

    return response;
  }

  // Bulk upload images
  async bulkUploadImages(
    files: File[], 
    folder?: string,
    options: UploadOptions = {}
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await this.uploadWithProgress(
      API_ENDPOINTS.UPLOADS.BULK_IMAGES,
      formData,
      options
    );

    return response;
  }

  // Delete uploaded image
  async deleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiService.delete(`${API_ENDPOINTS.UPLOADS.DELETE_IMAGE}/${publicId}`);
    
    return {
      success: response.success,
      message: response.message || 'Image deleted successfully',
    };
  }

  // Generate signed upload URL (for direct uploads)
  async generateUploadUrl(
    folder: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<{ success: boolean; data: { uploadUrl: string; publicId: string }; message: string }> {
    const response = await apiService.post(API_ENDPOINTS.UPLOADS.GENERATE_UPLOAD_URL, {
      folder,
      resourceType,
    });

    return response;
  }

  // Helper method to upload with progress tracking
  private async uploadWithProgress(
    endpoint: string,
    formData: FormData,
    options: UploadOptions = {}
  ): Promise<any> {
    const { onProgress, timeout = 60000, signal } = options;

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Handle progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(new Error(response.message || `HTTP ${xhr.status}`));
          }
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Setup request
      xhr.open('POST', `${apiService.getBaseURL()}${endpoint}`);
      xhr.timeout = timeout;

      // Add authorization header
      const token = localStorage.getItem('lajospaces_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      // Send request
      xhr.send(formData);
    });
  }

  // Validate file before upload
  validateFile(
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      maxWidth?: number;
      maxHeight?: number;
    } = {}
  ): { isValid: boolean; error?: string } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxWidth = 4000,
      maxHeight = 4000,
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    // For images, check dimensions (requires loading the image)
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width > maxWidth || img.height > maxHeight) {
            resolve({
              isValid: false,
              error: `Image dimensions must be less than ${maxWidth}x${maxHeight}px`,
            });
          } else {
            resolve({ isValid: true });
          }
        };
        img.onerror = () => {
          resolve({
            isValid: false,
            error: 'Invalid image file',
          });
        };
        img.src = URL.createObjectURL(file);
      }) as any;
    }

    return { isValid: true };
  }

  // Get upload guidelines
  async getUploadGuidelines(): Promise<{
    success: boolean;
    data: {
      maxFileSize: number;
      allowedTypes: string[];
      maxPhotos: number;
      recommendations: string[];
    };
    message: string;
  }> {
    const response = await apiService.get(API_ENDPOINTS.PHOTOS.GUIDELINES);
    return response;
  }
}

// Create and export singleton instance
export const uploadService = new UploadService();
export default uploadService;
