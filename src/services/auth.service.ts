import { apiService } from './api.service';
import { mockAuthService } from './mockAuth.service';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  VerificationData,
  ForgotPasswordData,
  ResetPasswordData,
  RefreshTokenResponse,
  User,
  AUTH_STORAGE_KEYS
} from '@/types/auth.types';
import { API_ENDPOINTS } from '@/types/api.types';

// Check if we should use mock service
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.DEV;

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK_AUTH) {
      const response = await mockAuthService.login(credentials);
      if (response.success) {
        this.storeAuthData(response.data, credentials.rememberMe);
      }
      return response;
    }

    const response = await apiService.post<AuthResponse['data']>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success) {
      this.storeAuthData(response.data, credentials.rememberMe);
    }

    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK_AUTH) {
      const response = await mockAuthService.register(data);
      if (response.success) {
        this.storeAuthData(response.data, false);
      }
      return response;
    }

    // Transform data for backend (remove confirmPassword, ensure required fields)
    const backendData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      accountType: data.accountType || 'seeker',
      location: data.location,
      agreeToTerms: data.agreeToTerms
    };

    const response = await apiService.post<AuthResponse['data']>(
      API_ENDPOINTS.AUTH.REGISTER,
      backendData
    );

    if (response.success) {
      this.storeAuthData(response.data, false);
    }

    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      if (USE_MOCK_AUTH) {
        await mockAuthService.logout();
      } else {
        await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Verify email
  async verifyEmail(data: VerificationData): Promise<void> {
    if (USE_MOCK_AUTH) {
      await mockAuthService.verifyEmail(data);
      // Update stored user data if verification was successful
      const storedUser = this.getStoredUser();
      if (storedUser) {
        storedUser.isEmailVerified = true;
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(storedUser));
      }
      return;
    }

    const response = await apiService.post(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      data
    );

    if (response.success) {
      // Update stored user data if verification was successful
      const storedUser = this.getStoredUser();
      if (storedUser) {
        storedUser.isEmailVerified = true;
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(storedUser));
      }
    }
  }

  // Verify phone
  async verifyPhone(data: VerificationData): Promise<void> {
    if (USE_MOCK_AUTH) {
      await mockAuthService.verifyPhone(data);
      // Update stored user data if verification was successful
      const storedUser = this.getStoredUser();
      if (storedUser) {
        storedUser.isPhoneVerified = true;
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(storedUser));
      }
      return;
    }

    const response = await apiService.post(
      API_ENDPOINTS.AUTH.VERIFY_PHONE,
      data
    );

    if (response.success) {
      // Update stored user data if verification was successful
      const storedUser = this.getStoredUser();
      if (storedUser) {
        storedUser.isPhoneVerified = true;
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(storedUser));
      }
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  // Refresh token
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<RefreshTokenResponse['data']>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    if (response.success) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
      }
    }

    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  }

  // Check authentication status
  async checkAuthStatus(): Promise<User | null> {
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
      if (!token) {
        return null;
      }

      if (USE_MOCK_AUTH) {
        const user = await mockAuthService.checkAuthStatus(token);
        if (user) {
          // Update stored user data
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
        }
        return user;
      }

      const response = await apiService.get<{user: User}>(API_ENDPOINTS.AUTH.CHECK_STATUS);

      if (response.success && response.data.user) {
        // Transform user data to ensure consistent ID field and role
        const transformedUser = {
          ...response.data.user,
          id: response.data.user._id || response.data.user.id,
          role: response.data.user.role || 'user' // Default role for compatibility
        };

        // Update stored user data
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(transformedUser));
        return transformedUser;
      }

      return null;
    } catch (error) {
      console.error('Auth status check failed:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Store authentication data
  private storeAuthData(data: AuthResponse['data'], rememberMe?: boolean): void {
    // Handle new backend token format
    if (data.tokens) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.tokens.accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);

      // Store token expiration info
      const expiresAt = new Date(Date.now() + data.tokens.expiresIn * 1000).toISOString();
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt);
    } else {
      // Fallback for legacy format
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token || '');
      if (data.refreshToken) {
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
    }

    // Transform user data to ensure consistent ID field and role
    const transformedUser = {
      ...data.user,
      id: data.user._id || data.user.id, // Ensure we have an id field for frontend compatibility
      role: data.user.role || 'user' // Default role for compatibility
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(transformedUser));

    if (rememberMe !== undefined) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
    }

    // Mark session as active
    sessionStorage.setItem('auth_session_active', 'true');
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  }

  // Get stored user
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = this.getStoredToken();
    if (!token) return true;

    try {
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.role || null;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Get remember me preference
  getRememberMePreference(): boolean {
    const rememberMe = localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
    return rememberMe === 'true';
  }

  // Update user data in storage
  updateStoredUser(userData: Partial<User>): void {
    const currentUser = this.getStoredUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  }

  // Initialize auth service (check for existing session)
  async initialize(): Promise<User | null> {
    const token = this.getStoredToken();
    const rememberMe = this.getRememberMePreference();
    
    if (!token) {
      return null;
    }

    // If remember me is false and we're in a new session, clear auth
    if (!rememberMe && !sessionStorage.getItem('auth_session_active')) {
      this.clearAuthData();
      return null;
    }

    // Mark session as active
    sessionStorage.setItem('auth_session_active', 'true');

    // Check if token is expired
    if (this.isTokenExpired()) {
      try {
        await this.refreshToken();
        return await this.checkAuthStatus();
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearAuthData();
        return null;
      }
    }

    // Verify current auth status
    return await this.checkAuthStatus();
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
