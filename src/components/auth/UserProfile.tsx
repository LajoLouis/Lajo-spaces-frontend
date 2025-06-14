import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  Shield, 
  Mail, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LogoutMenuItem } from './LogoutButton';

interface UserProfileProps {
  variant?: 'card' | 'dropdown' | 'inline';
  showVerificationStatus?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  variant = 'dropdown',
  showVerificationStatus = true,
  className,
}) => {
  const { user, isAdmin, getFullName, getUserInitials } = useAuth();

  if (!user) {
    return null;
  }

  const fullName = getFullName();
  const initials = getUserInitials();

  // Card variant - full profile display
  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role badge */}
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <Badge variant={isAdmin() ? 'destructive' : 'secondary'}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>

          {/* Verification status */}
          {showVerificationStatus && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
                {user.isEmailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {user.isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>

              {user.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Phone</span>
                  {user.isPhoneVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {user.isPhoneVerified ? 'Verified' : 'Not verified'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline variant - simple display
  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{fullName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        {showVerificationStatus && (
          <div className="flex space-x-1">
            {user.isEmailVerified ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-orange-500" />
            )}
            {user.phone && (
              user.isPhoneVerified ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <AlertCircle className="h-3 w-3 text-orange-500" />
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant - compact with menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center space-x-2 ${className}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Verification status */}
        {showVerificationStatus && (
          <>
            <DropdownMenuItem disabled>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
                {user.isEmailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </DropdownMenuItem>
            
            {user.phone && (
              <DropdownMenuItem disabled>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                  {user.isPhoneVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Navigation items */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>

        {!user.isEmailVerified && (
          <DropdownMenuItem asChild>
            <Link to="/verify" className="flex items-center text-orange-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              Verify Account
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
