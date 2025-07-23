import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock providers for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const MockSocketProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MockThemeProvider>
          <MockAuthProvider>
            <MockSocketProvider>
              {children}
            </MockSocketProvider>
          </MockAuthProvider>
        </MockThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  isEmailVerified: true,
  isProfileComplete: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'profile-123',
  userId: 'user-123',
  bio: 'Test bio',
  occupation: 'Software Developer',
  education: 'Computer Science',
  location: {
    state: 'Lagos',
    city: 'Ikeja',
    address: '123 Test Street',
  },
  preferences: {
    ageRange: { min: 25, max: 35 },
    genderPreference: 'any',
    smokingPreference: 'no',
    drinkingPreference: 'socially',
    petPreference: 'no',
    lifestylePreferences: ['quiet', 'clean'],
  },
  photos: [],
  completionScore: 75,
  ...overrides,
});

export const createMockProperty = (overrides = {}) => ({
  id: 'property-123',
  ownerId: 'user-123',
  title: 'Beautiful 2BR Apartment',
  description: 'A lovely apartment in a great location',
  propertyType: 'apartment',
  listingType: 'rent',
  location: {
    state: 'Lagos',
    city: 'Ikeja',
    address: '456 Property Street',
    coordinates: { lat: 6.5244, lng: 3.3792 },
  },
  pricing: {
    rent: 150000,
    deposit: 300000,
    agentFee: 75000,
    utilityDeposit: 50000,
  },
  details: {
    bedrooms: 2,
    bathrooms: 2,
    totalRooms: 4,
    maximumOccupants: 2,
    furnishingStatus: 'furnished',
  },
  amenities: ['wifi', 'parking', 'security'],
  photos: [],
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  _id: 'message-123',
  conversationId: 'conversation-123',
  senderId: 'user-123',
  receiverId: 'user-456',
  messageType: 'text',
  content: 'Hello, this is a test message',
  status: 'sent',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  _id: 'conversation-123',
  participants: ['user-123', 'user-456'],
  conversationType: 'direct',
  lastMessage: createMockMessage(),
  unreadCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// Mock API responses
export const createMockApiResponse = (data: any, success = true) => ({
  success,
  data,
  message: success ? 'Operation successful' : 'Operation failed',
  timestamp: new Date().toISOString(),
});

// Mock fetch responses
export const mockFetch = (response: any, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

// Mock file for testing file uploads
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Mock FormData for testing
export const createMockFormData = () => {
  const formData = new FormData();
  const append = vi.fn();
  const get = vi.fn();
  const getAll = vi.fn();
  const has = vi.fn();
  const set = vi.fn();
  const delete_ = vi.fn();
  
  Object.defineProperty(formData, 'append', { value: append });
  Object.defineProperty(formData, 'get', { value: get });
  Object.defineProperty(formData, 'getAll', { value: getAll });
  Object.defineProperty(formData, 'has', { value: has });
  Object.defineProperty(formData, 'set', { value: set });
  Object.defineProperty(formData, 'delete', { value: delete_ });
  
  return { formData, append, get, getAll, has, set, delete: delete_ };
};

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock intersection observer entry
export const createMockIntersectionObserverEntry = (isIntersecting = true) => ({
  isIntersecting,
  intersectionRatio: isIntersecting ? 1 : 0,
  target: document.createElement('div'),
  boundingClientRect: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
  intersectionRect: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
  rootBounds: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
  time: Date.now(),
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
