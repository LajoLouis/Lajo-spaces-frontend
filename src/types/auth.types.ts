// Authentication related types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: 'user' | 'admin';
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
  identifier: string; // email or phone
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
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
    token: string;
    refreshToken: string;
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
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
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
