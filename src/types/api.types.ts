// Generic API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
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
    url: string;
    publicId: string;
    filename: string;
    size: number;
    mimeType: string;
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
    CHECK_STATUS: '/auth/status',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_PHOTO: '/users/upload-photo',
    DELETE_PHOTO: '/users/photo',
    GET_USER: '/users',
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
  
  // Spaces
  SPACES: {
    LIST: '/spaces',
    CREATE: '/spaces',
    GET: '/spaces',
    UPDATE: '/spaces',
    DELETE: '/spaces',
    APPLY: '/spaces',
  },
  
  // Messages
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    SEND: '/messages/conversations',
    MARK_READ: '/messages',
  },
  
  // Wishlist
  WISHLIST: {
    LIST: '/wishlist',
    ADD: '/wishlist',
    REMOVE: '/wishlist',
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
