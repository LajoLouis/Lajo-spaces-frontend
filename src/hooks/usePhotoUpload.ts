import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { uploadService, UploadProgress } from '@/services/upload.service';
import { useErrorHandler } from './useErrorHandler';

export interface PhotoUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedPhotos: any[];
}

export interface PhotoUploadOptions {
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  onSuccess?: (photos: any[]) => void;
  onError?: (error: string) => void;
  showToasts?: boolean;
}

export const usePhotoUpload = (options: PhotoUploadOptions = {}) => {
  const {
    maxFiles = 6,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    onSuccess,
    onError,
    showToasts = true,
  } = options;

  const [state, setState] = useState<PhotoUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedPhotos: [],
  });

  const { handleError } = useErrorHandler();
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return { valid, errors };
    }

    files.forEach((file, index) => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`File ${index + 1}: Size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`);
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  }, [maxFiles, maxFileSize, allowedTypes]);

  const uploadSinglePhoto = useCallback(async (file: File): Promise<any> => {
    // Validate file
    const validation = uploadService.validateFile(file, {
      maxSize: maxFileSize,
      allowedTypes,
    });

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create abort controller
    abortControllerRef.current = new AbortController();

    // Upload with progress tracking
    const result = await uploadService.uploadProfilePhoto(file, {
      onProgress: (progress: UploadProgress) => {
        setState(prev => ({
          ...prev,
          progress: progress.percentage,
        }));
      },
      signal: abortControllerRef.current.signal,
    });

    return result;
  }, [maxFileSize, allowedTypes]);

  const uploadMultiplePhotos = useCallback(async (files: File[]): Promise<any[]> => {
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    const results = [];
    const totalFiles = valid.length;

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      
      try {
        // Update progress for current file
        setState(prev => ({
          ...prev,
          progress: Math.round(((i) / totalFiles) * 100),
        }));

        const result = await uploadSinglePhoto(file);
        results.push(result);

        if (showToasts) {
          toast.success(`Photo ${i + 1}/${totalFiles} uploaded successfully`);
        }
      } catch (error) {
        console.error(`Failed to upload file ${i + 1}:`, error);
        if (showToasts) {
          toast.error(`Failed to upload photo ${i + 1}`);
        }
        // Continue with other files
      }
    }

    return results;
  }, [validateFiles, uploadSinglePhoto, showToasts]);

  const uploadPhotos = useCallback(async (files: File[]): Promise<void> => {
    if (state.isUploading) {
      return;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      let results;

      if (files.length === 1) {
        // Single file upload
        const result = await uploadSinglePhoto(files[0]);
        results = [result];
      } else {
        // Multiple file upload
        results = await uploadMultiplePhotos(files);
      }

      // Update state with results
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedPhotos: [...prev.uploadedPhotos, ...results],
      }));

      if (showToasts) {
        toast.success(`${results.length} photo(s) uploaded successfully!`);
      }

      onSuccess?.(results);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload photos';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage,
      }));

      if (showToasts) {
        handleError(error, { showToast: true });
      }

      onError?.(errorMessage);
    }
  }, [state.isUploading, uploadSinglePhoto, uploadMultiplePhotos, showToasts, onSuccess, onError, handleError]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState(prev => ({
      ...prev,
      isUploading: false,
      progress: 0,
      error: 'Upload cancelled',
    }));

    if (showToasts) {
      toast.info('Upload cancelled');
    }
  }, [showToasts]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedPhotos: [],
    });
  }, []);

  const removeUploadedPhoto = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      uploadedPhotos: prev.uploadedPhotos.filter((_, i) => i !== index),
    }));
  }, []);

  return {
    ...state,
    uploadPhotos,
    cancelUpload,
    reset,
    removeUploadedPhoto,
    validateFiles,
  };
};

// Hook for property photo uploads
export const usePropertyPhotoUpload = (propertyId: string, options: PhotoUploadOptions = {}) => {
  const [state, setState] = useState<PhotoUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedPhotos: [],
  });

  const { handleError } = useErrorHandler();

  const uploadPropertyPhotos = useCallback(async (files: File[]): Promise<void> => {
    if (state.isUploading) {
      return;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const result = await uploadService.uploadPropertyPhotos(propertyId, files, {
        onProgress: (progress: UploadProgress) => {
          setState(prev => ({
            ...prev,
            progress: progress.percentage,
          }));
        },
      });

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedPhotos: result.data.photos,
      }));

      if (options.showToasts !== false) {
        toast.success(`${files.length} property photo(s) uploaded successfully!`);
      }

      options.onSuccess?.(result.data.photos);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload property photos';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage,
      }));

      if (options.showToasts !== false) {
        handleError(error, { showToast: true });
      }

      options.onError?.(errorMessage);
    }
  }, [propertyId, state.isUploading, options, handleError]);

  return {
    ...state,
    uploadPropertyPhotos,
  };
};

export default usePhotoUpload;
