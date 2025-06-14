import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  VerificationData,
  ForgotPasswordData,
  ResetPasswordData,
  User
} from '@/types/auth.types';

// Mock user database (in-memory for development)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@lajospaces.com',
    firstName: 'Demo',
    lastName: 'User',
    isEmailVerified: true,
    isPhoneVerified: false,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Mock JWT token generator
const generateMockToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId,
    email: mockUsers.find(u => u.id === userId)?.email,
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days (much longer)
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

class MockAuthService {
  // Mock login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1500); // Simulate network delay

    // Check if user exists
    const user = mockUsers.find(u => 
      u.email === credentials.identifier || u.phone === credentials.identifier
    );

    if (!user) {
      throw new Error('Invalid credentials. Try demo@lajospaces.com with any password.');
    }

    // For demo purposes, accept any password
    const token = generateMockToken(user.id);
    const refreshToken = generateMockToken(user.id);

    return {
      success: true,
      data: {
        user,
        token,
        refreshToken,
      },
      message: 'Login successful',
    };
  }

  // Mock register
  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(2000); // Simulate network delay

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      isEmailVerified: false,
      isPhoneVerified: false,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock database
    mockUsers.push(newUser);

    const token = generateMockToken(newUser.id);
    const refreshToken = generateMockToken(newUser.id);

    return {
      success: true,
      data: {
        user: newUser,
        token,
        refreshToken,
      },
      message: 'Registration successful',
    };
  }

  // Mock logout
  async logout(): Promise<void> {
    await delay(500);
    // In a real app, this would invalidate the token on the server
    console.log('Mock logout successful');
  }

  // Mock email verification
  async verifyEmail(data: VerificationData): Promise<void> {
    await delay(1000);

    if (data.verificationCode !== '123456') {
      throw new Error('Invalid verification code. Use 123456 for demo.');
    }

    // Update user verification status
    const user = mockUsers.find(u => u.email === data.email);
    if (user) {
      user.isEmailVerified = true;
      user.updatedAt = new Date().toISOString();
    }
  }

  // Mock phone verification
  async verifyPhone(data: VerificationData): Promise<void> {
    await delay(1000);

    if (data.verificationCode !== '123456') {
      throw new Error('Invalid verification code. Use 123456 for demo.');
    }

    // Update user verification status
    const user = mockUsers.find(u => u.phone === data.phone);
    if (user) {
      user.isPhoneVerified = true;
      user.updatedAt = new Date().toISOString();
    }
  }

  // Mock forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await delay(1000);

    const user = mockUsers.find(u => 
      u.email === data.identifier || u.phone === data.identifier
    );

    if (!user) {
      throw new Error('No user found with this email/phone');
    }

    // In a real app, this would send an email/SMS
    console.log('Mock password reset email sent');
  }

  // Mock reset password
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await delay(1000);

    if (data.resetToken !== 'mock-reset-token') {
      throw new Error('Invalid reset token');
    }

    // In a real app, this would update the password
    console.log('Mock password reset successful');
  }

  // Mock refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    await delay(500);

    // In a real app, this would validate the refresh token
    const newToken = generateMockToken('1');
    const newRefreshToken = generateMockToken('1');

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  // Mock check auth status
  async checkAuthStatus(token: string): Promise<User | null> {
    await delay(500);

    try {
      // Decode mock token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = mockUsers.find(u => u.id === payload.userId);
      
      if (!user) {
        return null;
      }

      // Check if token is expired
      if (payload.exp < Date.now() / 1000) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  // Get mock users (for development)
  getMockUsers(): User[] {
    return mockUsers;
  }

  // Reset mock data (for development)
  resetMockData(): void {
    mockUsers.length = 1; // Keep only the demo user
  }
}

// Create and export singleton instance
export const mockAuthService = new MockAuthService();
export default mockAuthService;
