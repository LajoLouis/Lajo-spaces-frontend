// Authentication related types
export interface User {
  _id: string;
  id?: string; // For frontend compatibility
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  accountType: 'seeker' | 'owner' | 'both';
  role?: 'user' | 'admin'; // For admin functionality (defaults to 'user')
  profileCompletionScore: number;
  lastLoginAt?: string;
  lastActiveAt: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string; // Backend expects email field specifically
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword?: string; // Not sent to backend
  dateOfBirth: string; // ISO date string
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  accountType?: 'seeker' | 'owner' | 'both';
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  agreeToTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      refreshExpiresIn: number;
    };
  };
  message: string;
}

export interface VerificationData {
  email?: string;
  phone?: string;
  verificationCode: string;
}

export interface ForgotPasswordData {
  identifier: string; // email or phone
}

export interface ResetPasswordData {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      refreshExpiresIn: number;
    };
  };
  message: string;
}

// Auth store actions
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyEmail: (data: VerificationData) => Promise<void>;
  verifyPhone: (data: VerificationData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => Promise<void>;
}

// Combined auth store type
export interface AuthStore extends AuthState, AuthActions {}

// Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Local storage keys
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'lajospaces_token',
  REFRESH_TOKEN: 'lajospaces_refresh_token',
  USER: 'lajospaces_user',
  REMEMBER_ME: 'lajospaces_remember_me',
  TOKEN_EXPIRES_AT: 'lajospaces_token_expires_at',
} as const;

// Auth error types
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  accountType: 'seeker' | 'owner' | 'both';
  agreeToTerms: boolean;
}

export interface VerificationFormData {
  verificationCode: string;
}

export interface ForgotPasswordFormData {
  identifier: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

// Enhanced Error Types
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

// Generic API Response Types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth-specific error codes
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS = 'PHONE_ALREADY_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED = 'PHONE_NOT_VERIFIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

// Profile completion status
export interface ProfileCompletionStatus {
  score: number;
  missingFields: string[];
  completedSections: string[];
  nextSteps: string[];
}
