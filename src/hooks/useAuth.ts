import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';

// Main auth hook
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    verifyPhone,
    forgotPassword,
    resetPassword,
    clearError,
    checkAuthStatus,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    verifyEmail,
    verifyPhone,
    forgotPassword,
    resetPassword,
    clearError,
    checkAuthStatus,
    
    // Utility methods
    isAdmin: () => user?.role === 'admin',
    isEmailVerified: () => user?.isEmailVerified || false,
    isPhoneVerified: () => user?.isPhoneVerified || false,
    getFullName: () => user ? `${user.firstName} ${user.lastName}` : '',
    getUserInitials: () => user ? `${user.firstName[0]}${user.lastName[0]}` : '',
  };
};

// Hook for protected routes
export const useAuthGuard = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        await checkAuthStatus();
      }
    };

    initAuth();
  }, [isAuthenticated, isLoading, checkAuthStatus]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the attempted location for redirect after login
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, location.pathname]);

  return { isAuthenticated, isLoading };
};

// Hook for guest-only routes (login, register)
export const useGuestGuard = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check if there's a redirect location from login attempt
      const from = location.state?.from || redirectTo;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, location.state]);

  return { isAuthenticated, isLoading };
};

// Hook for role-based access
export const useRoleGuard = (requiredRole: string, redirectTo: string = '/dashboard') => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role !== requiredRole) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, requiredRole, navigate, redirectTo]);

  const hasRole = user?.role === requiredRole;
  
  return { hasRole, isLoading };
};

// Hook for admin access
export const useAdminGuard = (redirectTo: string = '/dashboard') => {
  return useRoleGuard('admin', redirectTo);
};

// Hook for verification status
export const useVerificationStatus = () => {
  const { user } = useAuth();

  return {
    isEmailVerified: user?.isEmailVerified || false,
    isPhoneVerified: user?.isPhoneVerified || false,
    isFullyVerified: (user?.isEmailVerified || false) && (user?.isPhoneVerified || false),
    needsEmailVerification: user && !user.isEmailVerified,
    needsPhoneVerification: user && !user.isPhoneVerified,
  };
};

// Hook for authentication initialization
export const useAuthInitialization = () => {
  const { checkAuthStatus, isLoading } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.initialize();
        if (user) {
          // Auth store will be updated by the service
          await checkAuthStatus();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  return { isLoading };
};

// Hook for logout with confirmation
export const useLogoutWithConfirmation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const logoutWithConfirmation = async (showConfirmation: boolean = true) => {
    if (showConfirmation) {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) return;
    }

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return { logoutWithConfirmation };
};

// Hook for token expiration handling
export const useTokenExpiration = () => {
  const { logout, checkAuthStatus, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      if (isAuthenticated && authService.isTokenExpired()) {
        console.log('🔒 Token expired, logging out...');
        logout();
      }
    };

    // Check token expiration every 10 minutes (less aggressive)
    const interval = setInterval(checkTokenExpiration, 10 * 60 * 1000);

    // Don't check immediately on mount to avoid logout loops
    // Only check after the first interval

    return () => clearInterval(interval);
  }, [logout, isAuthenticated]);

  // Manual token refresh
  const refreshToken = async () => {
    try {
      await authService.refreshToken();
      await checkAuthStatus();
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  return { refreshToken };
};

// Hook for session management
export const useSessionManagement = () => {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // Only check if session is still valid when user returns to tab
        // and they were previously authenticated
        if (authService.isTokenExpired()) {
          console.log('🔒 Session expired while tab was hidden, logging out...');
          logout();
        }
      }
    };

    const handleBeforeUnload = () => {
      // Clear session data if "remember me" is false
      if (!authService.getRememberMePreference()) {
        sessionStorage.removeItem('auth_session_active');
      }
    };

    // Only add listeners if user is authenticated
    if (isAuthenticated) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logout, isAuthenticated]);
};

// Re-export useAuthActions from the store for convenience
export { useAuthActions } from '@/stores/authStore';
