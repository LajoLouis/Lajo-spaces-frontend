import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ApiResponse,
  ApiRequestConfig,
  ApiClientConfig,
  HTTP_STATUS,
  TIMEOUT_CONFIG,
  API_ERROR_CODES,
  ApiErrorResponse,
  RetryConfig,
  DEFAULT_RETRY_CONFIG
} from '@/types/api.types';
import { AUTH_STORAGE_KEYS, ApiError } from '@/types/auth.types';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: TIMEOUT_CONFIG.DEFAULT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle common responses
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // Log error in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Handle token expiration
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          const errorCode = error.response?.data?.error?.code;
          
          if (errorCode === API_ERROR_CODES.TOKEN_EXPIRED && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              await this.refreshToken();
              const newToken = this.getStoredToken();
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.handleAuthFailure();
              return Promise.reject(refreshError);
            }
          } else {
            // Token invalid or other auth error
            this.handleAuthFailure();
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.baseURL}/auth/refresh`, {
      refreshToken,
    });

    const responseData = response.data.data;

    // Handle new backend token format
    if (responseData.tokens) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, responseData.tokens.accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, responseData.tokens.refreshToken);

      // Store token expiration info
      const expiresAt = new Date(Date.now() + responseData.tokens.expiresIn * 1000).toISOString();
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt);
    } else {
      // Fallback for legacy format
      const { token, refreshToken: newRefreshToken } = responseData;
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
      if (newRefreshToken) {
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      }
    }
  }

  private handleAuthFailure(): void {
    // Clear stored auth data
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
    sessionStorage.removeItem('auth_session_active');

    // Redirect to login page
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  }

  private normalizeError(error: any): ApiErrorResponse {
    // Handle backend error response format
    if (error.response?.data?.error) {
      return {
        success: false,
        error: {
          message: error.response.data.error.message || 'An error occurred',
          code: error.response.data.error.code,
          statusCode: error.response.status || 500,
          timestamp: error.response.data.error.timestamp || new Date().toISOString(),
          path: error.response.data.error.path || error.config?.url || '',
          method: error.response.data.error.method || error.config?.method?.toUpperCase() || '',
          details: error.response.data.error.details
        }
      };
    }

    // Handle legacy error format
    if (error.response?.data) {
      return {
        success: false,
        error: {
          message: error.response.data.message || 'An error occurred',
          code: error.response.data.code || 'UNKNOWN_ERROR',
          statusCode: error.response.status || 500,
          timestamp: new Date().toISOString(),
          path: error.config?.url || '',
          method: error.config?.method?.toUpperCase() || '',
          details: error.response.data.errors || error.response.data.details
        }
      };
    }

    // Network or other errors
    const isNetworkError = !error.response && error.request;
    const isTimeoutError = error.code === 'ECONNABORTED';

    return {
      success: false,
      error: {
        message: this.getErrorMessage(error, isNetworkError, isTimeoutError),
        code: this.getErrorCode(error, isNetworkError, isTimeoutError),
        statusCode: 0,
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
        method: error.config?.method?.toUpperCase() || ''
      }
    };
  }

  private getErrorMessage(error: any, isNetworkError: boolean, isTimeoutError: boolean): string {
    if (isTimeoutError) {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    return error.message || 'An unexpected error occurred';
  }

  private getErrorCode(error: any, isNetworkError: boolean, isTimeoutError: boolean): string {
    if (isTimeoutError) return 'TIMEOUT_ERROR';
    if (isNetworkError) return 'NETWORK_ERROR';
    return error.code || 'UNKNOWN_ERROR';
  }

  // Retry logic
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt
        if (attempt === retryConfig.maxRetries) {
          break;
        }

        // Check if error should be retried
        if (!retryConfig.retryCondition(error)) {
          break;
        }

        // Wait before retrying
        await this.delay(retryConfig.retryDelay * Math.pow(2, attempt)); // Exponential backoff

        if (import.meta.env.DEV) {
          console.log(`🔄 Retrying request (attempt ${attempt + 1}/${retryConfig.maxRetries})`);
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic request method with retry
  async request<T = any>(config: ApiRequestConfig & { retry?: RetryConfig }): Promise<ApiResponse<T>> {
    const retryConfig = config.retry || DEFAULT_RETRY_CONFIG;

    return this.retryRequest(async () => {
      try {
        const axiosConfig: AxiosRequestConfig = {
          method: config.method,
          url: config.url,
          data: config.data,
          params: config.params,
          headers: config.headers,
          timeout: config.timeout,
        };

        const response = await this.client.request<ApiResponse<T>>(axiosConfig);
        return response.data;
      } catch (error) {
        throw error; // Will be handled by response interceptor
      }
    }, retryConfig);
  }

  // Convenience methods with optional retry configuration
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    retry?: RetryConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params, retry });
  }

  async post<T = any>(
    url: string,
    data?: any,
    retry?: RetryConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, retry });
  }

  async put<T = any>(
    url: string,
    data?: any,
    retry?: RetryConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, retry });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    retry?: RetryConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, retry });
  }

  async delete<T = any>(
    url: string,
    retry?: RetryConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, retry });
  }

  // File upload method
  async uploadFile(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: TIMEOUT_CONFIG.UPLOAD,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Set auth token manually
  setAuthToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }

  // Clear auth token
  clearAuthToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // Update base URL
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  // Error handling utilities
  static isNetworkError(error: any): boolean {
    return !error.response && error.request;
  }

  static isTimeoutError(error: any): boolean {
    return error.code === 'ECONNABORTED';
  }

  static isServerError(error: any): boolean {
    return error.response?.status >= 500;
  }

  static isClientError(error: any): boolean {
    return error.response?.status >= 400 && error.response?.status < 500;
  }

  static isAuthError(error: any): boolean {
    return error.response?.status === 401 || error.response?.status === 403;
  }

  static getErrorMessage(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (ApiService.isTimeoutError(error)) {
      return 'Request timed out. Please try again.';
    }
    if (ApiService.isNetworkError(error)) {
      return 'Unable to connect. Please check your internet connection.';
    }
    return error.message || 'An unexpected error occurred';
  }

  static getUserFriendlyErrorMessage(error: any): string {
    const errorCode = error.response?.data?.error?.code || error.response?.data?.code;

    switch (errorCode) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'UNAUTHORIZED':
        return 'Please log in to continue.';
      case 'FORBIDDEN':
        return 'You don\'t have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'EMAIL_ALREADY_EXISTS':
        return 'An account with this email already exists.';
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password.';
      case 'TOKEN_EXPIRED':
        return 'Your session has expired. Please log in again.';
      default:
        return ApiService.getErrorMessage(error);
    }
  }

  // Validation error helpers
  static getValidationErrors(error: any): Record<string, string> {
    const errors: Record<string, string> = {};
    const details = error.response?.data?.error?.details;

    if (Array.isArray(details)) {
      details.forEach((detail: any) => {
        if (detail.field && detail.message) {
          errors[detail.field] = detail.message;
        }
      });
    }

    return errors;
  }

  static hasValidationErrors(error: any): boolean {
    return error.response?.data?.error?.code === 'VALIDATION_ERROR' ||
           error.response?.data?.code === 'VALIDATION_ERROR';
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;
