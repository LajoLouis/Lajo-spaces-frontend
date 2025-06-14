import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      )
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate 
        to="/dashboard" 
        state={{ 
          error: 'You do not have permission to access this page.',
          from: location.pathname 
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

// Specific role-based route components
export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRole'>> = (props) => (
  <ProtectedRoute {...props} requiredRole="admin" />
);

// Guest route (for login/register pages)
interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

// Verification required route
interface VerificationRequiredRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  redirectTo?: string;
}

export const VerificationRequiredRoute: React.FC<VerificationRequiredRouteProps> = ({
  children,
  requireEmailVerification = false,
  requirePhoneVerification = false,
  redirectTo = '/verify',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // First check if user is authenticated
  if (!isAuthenticated || isLoading) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  // Check verification requirements
  const needsEmailVerification = requireEmailVerification && !user?.isEmailVerified;
  const needsPhoneVerification = requirePhoneVerification && !user?.isPhoneVerified;

  if (needsEmailVerification || needsPhoneVerification) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          needsEmailVerification,
          needsPhoneVerification,
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};
