// Generic API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  details?: ValidationError[] | any;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number; // Backend uses 'pages', not 'totalPages'
      hasNextPage?: boolean; // Backend format
      hasPrevPage?: boolean; // Backend format
    };
  };
  message?: string;
  timestamp?: string;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API request configuration
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// Request interceptor types
export interface RequestInterceptor {
  onFulfilled?: (config: any) => any;
  onRejected?: (error: any) => any;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: any) => any;
  onRejected?: (error: any) => any;
}

// File upload types
export interface FileUploadResponse {
  success: boolean;
  data: {
    upload: {
      public_id: string;
      secure_url: string;
      url: string;
      bytes: number;
      format: string;
      width?: number;
      height?: number;
      resource_type: string;
    };
    metadata?: {
      size: number;
      format: string;
      width?: number;
      height?: number;
      colorSpace?: string;
    };
    sizes?: {
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
    };
  };
  message: string;
}

// Profile photo upload response
export interface ProfilePhotoUploadResponse {
  success: boolean;
  data: {
    photo: {
      id: string;
      url: string;
      publicId: string;
      isPrimary: boolean;
      uploadedAt: string;
    };
    sizes: {
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
    };
    profile: {
      totalPhotos: number;
      completionScore: number;
    };
  };
  message: string;
}

// Property photo upload response
export interface PropertyPhotoUploadResponse {
  success: boolean;
  data: {
    photos: Array<{
      id: string;
      url: string;
      publicId: string;
      isPrimary: boolean;
      uploadedAt: string;
    }>;
    property: {
      id: string;
      totalPhotos: number;
    };
  };
  message: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Query parameters for API requests
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

// Common API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PHONE: '/auth/verify-phone',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHECK_STATUS: '/auth/profile',
  },
  
  // Users
  USERS: {
    PROFILE: '/profiles',
    UPDATE_PROFILE: '/profiles',
    UPLOAD_PHOTO: '/photos/upload',
    DELETE_PHOTO: '/photos',
    GET_USER: '/profiles',
    PREFERENCES: '/users/preferences',
  },
  
  // Roommates
  ROOMMATES: {
    DISCOVER: '/roommates/discover',
    LIKE: '/roommates/like',
    PASS: '/roommates/pass',
    MATCHES: '/roommates/matches',
    UNMATCH: '/roommates/unmatch',
  },
  
  // Properties
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    GET: '/properties',
    UPDATE: '/properties',
    DELETE: '/properties',
    SEARCH: '/properties/search',
  },
  
  // Messages
  MESSAGES: {
    CONVERSATIONS: '/conversations',
    SEND: '/messages',
    MARK_READ: '/messages',
  },
  
  // Wishlist
  WISHLIST: {
    LIST: '/wishlist',
    ADD: '/wishlist',
    REMOVE: '/wishlist',
  },

  // File Uploads
  UPLOADS: {
    SINGLE_IMAGE: '/uploads/image',
    AVATAR: '/uploads/avatar',
    PROPERTY_PHOTOS: '/uploads/property-photos',
    MESSAGE_ATTACHMENT: '/uploads/message-attachment',
    BULK_IMAGES: '/uploads/bulk',
    DELETE_IMAGE: '/uploads',
    GENERATE_UPLOAD_URL: '/uploads/generate-url',
  },

  // Photos (Profile Photos)
  PHOTOS: {
    UPLOAD: '/photos/upload',
    LIST: '/photos',
    DELETE: '/photos',
    SET_PRIMARY: '/photos',
    REORDER: '/photos/reorder',
    GUIDELINES: '/photos/guidelines',
  },

  // Property Photos
  PROPERTY_PHOTOS: {
    LIST: '/property-photos',
    UPLOAD: '/property-photos',
    DELETE: '/property-photos',
    SET_PRIMARY: '/property-photos',
    GUIDELINES: '/property-photos/guidelines',
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API error codes
export const API_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED: 'PHONE_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  PASSWORDS_DONT_MATCH: 'PASSWORDS_DONT_MATCH',
  
  // Resource errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  SPACE_NOT_FOUND: 'SPACE_NOT_FOUND',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  
  // Permission errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

// Environment configuration
export interface EnvironmentConfig {
  API_URL: string;
  SOCKET_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  DEBUG: boolean;
}

// Request timeout configurations
export const TIMEOUT_CONFIG = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 60000,  // 1 minute
  DOWNLOAD: 30000, // 30 seconds
} as const;

// Backend-specific response formats
export interface BackendPropertyResponse {
  success: boolean;
  message: string;
  data: {
    properties: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters?: {
      applied: number;
      available: {
        propertyTypes: string[];
        listingTypes: string[];
        amenities: string[];
      };
    };
  };
  timestamp: string;
}

export interface BackendConversationResponse {
  success: boolean;
  data: {
    conversations: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface BackendMatchResponse {
  success: boolean;
  data: {
    matches: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    summary: {
      totalMatches: number;
      roommateMatches: number;
      housingMatches: number;
      averageCompatibility: number;
    };
  };
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition: (error: any) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return error.status >= 500 || error.code === 'NETWORK_ERROR';
  }
};
