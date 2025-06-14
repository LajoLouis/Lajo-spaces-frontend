import { AttachmentType } from '@/types/message.types';

export interface FileUploadResult {
  id: string;
  url: string;
  name: string;
  size: number;
  type: AttachmentType;
  mimeType: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mpeg']
};

export const getAttachmentType = (mimeType: string): AttachmentType => {
  if (ALLOWED_FILE_TYPES.image.includes(mimeType)) {
    return AttachmentType.IMAGE;
  }
  if (ALLOWED_FILE_TYPES.video.includes(mimeType)) {
    return AttachmentType.VIDEO;
  }
  if (ALLOWED_FILE_TYPES.audio.includes(mimeType)) {
    return AttachmentType.AUDIO;
  }
  return AttachmentType.DOCUMENT;
};

export const validateFile = (file: File): FileValidationResult => {
  const attachmentType = getAttachmentType(file.type);
  
  // Check file type
  const allowedTypes = Object.values(ALLOWED_FILE_TYPES).flat();
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported. Please upload images, documents, videos, or audio files.`
    };
  }
  
  // Check file size
  const sizeLimit = FILE_SIZE_LIMITS[attachmentType];
  if (file.size > sizeLimit) {
    const sizeLimitMB = Math.round(sizeLimit / (1024 * 1024));
    return {
      isValid: false,
      error: `File size exceeds ${sizeLimitMB}MB limit for ${attachmentType} files.`
    };
  }
  
  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string): string => {
  const attachmentType = getAttachmentType(mimeType);
  
  switch (attachmentType) {
    case AttachmentType.IMAGE:
      return '🖼️';
    case AttachmentType.VIDEO:
      return '🎥';
    case AttachmentType.AUDIO:
      return '🎵';
    case AttachmentType.DOCUMENT:
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('word')) return '📝';
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
      return '📎';
    default:
      return '📎';
  }
};

// Mock file upload function (replace with actual API call)
export const uploadFile = async (file: File): Promise<FileUploadResult> => {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock successful upload
  const attachmentType = getAttachmentType(file.type);
  
  return {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url: URL.createObjectURL(file), // In production, this would be the uploaded file URL
    name: file.name,
    size: file.size,
    type: attachmentType,
    mimeType: file.type
  };
};

// Cleanup object URLs to prevent memory leaks
export const cleanupFileUrl = (url: string) => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
