import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  ApiRequestConfig, 
  ApiClientConfig,
  HTTP_STATUS,
  TIMEOUT_CONFIG,
  API_ERROR_CODES
} from '@/types/api.types';
import { AUTH_STORAGE_KEYS } from '@/types/auth.types';

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

    const { token, refreshToken: newRefreshToken } = response.data.data;
    
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    if (newRefreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    }
  }

  private handleAuthFailure(): void {
    // Clear stored auth data
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    
    // Redirect to login page
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  }

  private normalizeError(error: any): ApiResponse {
    if (error.response?.data) {
      return error.response.data;
    }

    // Network or other errors
    return {
      success: false,
      data: null,
      message: error.message || 'An unexpected error occurred',
      errors: [{
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      }],
    };
  }

  // Generic request method
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
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
  }

  // Convenience methods
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url });
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
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;
