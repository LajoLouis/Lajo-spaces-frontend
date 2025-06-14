// Property Types
export interface Property {
  id: string;
  ownerId: string;
  ownerProfile: {
    firstName: string;
    lastName: string;
    photo?: string;
    isVerified: boolean;
    responseRate: number;
    responseTime: string; // e.g., "within 1 hour"
  };
  
  // Basic Information
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'studio' | 'townhouse' | 'loft' | 'other';
  roomType: 'private-room' | 'shared-room' | 'entire-place';
  
  // Location
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    neighborhood?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Pricing
  pricing: {
    monthlyRent: number;
    securityDeposit?: number;
    utilitiesIncluded: boolean;
    utilitiesCost?: number;
    currency: string;
    negotiable: boolean;
  };
  
  // Availability
  availability: {
    availableFrom: string;
    availableUntil?: string;
    minimumStay: number; // in months
    maximumStay?: number; // in months
    isAvailable: boolean;
  };
  
  // Property Details
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFootage?: number;
    furnished: 'fully' | 'partially' | 'unfurnished';
    floor?: number;
    totalFloors?: number;
    yearBuilt?: number;
    parkingSpaces?: number;
  };
  
  // Amenities
  amenities: {
    // Basic Amenities
    wifi: boolean;
    airConditioning: boolean;
    heating: boolean;
    laundry: 'in-unit' | 'in-building' | 'nearby' | 'none';
    kitchen: 'full' | 'partial' | 'shared' | 'none';
    
    // Appliances
    dishwasher: boolean;
    microwave: boolean;
    refrigerator: boolean;
    oven: boolean;
    washer: boolean;
    dryer: boolean;
    
    // Building Amenities
    elevator: boolean;
    gym: boolean;
    pool: boolean;
    rooftop: boolean;
    doorman: boolean;
    concierge: boolean;
    
    // Outdoor
    balcony: boolean;
    patio: boolean;
    garden: boolean;
    yard: boolean;
    
    // Other
    petFriendly: boolean;
    smokingAllowed: boolean;
    storage: boolean;
    bike_storage: boolean;
  };
  
  // House Rules
  rules: {
    petsAllowed: boolean;
    smokingAllowed: boolean;
    partiesAllowed: boolean;
    guestsAllowed: boolean;
    quietHours?: {
      start: string;
      end: string;
    };
    additionalRules?: string[];
  };
  
  // Photos
  photos: PropertyPhoto[];
  
  // Roommate Preferences (if looking for specific type of roommate)
  roommatePreferences?: {
    ageRange?: { min: number; max: number };
    gender?: 'male' | 'female' | 'non-binary' | 'no-preference';
    occupation?: string[];
    lifestyle?: {
      cleanliness: string[];
      socialLevel: string[];
      sleepSchedule: string[];
    };
    dealBreakers?: {
      smoking: boolean;
      pets: boolean;
      parties: boolean;
      overnight_guests: boolean;
    };
  };
  
  // Transportation
  transportation: {
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
    nearbyTransit: string[];
    commuteTimes?: {
      downtown: number;
      airport: number;
      university?: number;
    };
  };
  
  // Metadata
  views: number;
  favorites: number;
  inquiries: number;
  isPromoted: boolean;
  isFeatured: boolean;
  status: 'active' | 'pending' | 'rented' | 'inactive';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  room: 'bedroom' | 'bathroom' | 'kitchen' | 'living-room' | 'dining-room' | 'exterior' | 'other';
  uploadedAt: string;
}

// Property Listing Form Types
export interface PropertyFormData {
  // Basic Info
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood?: string;
  
  // Pricing
  monthlyRent: number;
  securityDeposit?: number;
  utilitiesIncluded: boolean;
  utilitiesCost?: number;
  negotiable: boolean;
  
  // Availability
  availableFrom: string;
  availableUntil?: string;
  minimumStay: number;
  maximumStay?: number;
  
  // Details
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  furnished: string;
  floor?: number;
  parkingSpaces?: number;
  
  // Amenities
  amenities: string[];
  
  // Rules
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  guestsAllowed: boolean;
  quietHours?: { start: string; end: string };
  additionalRules?: string[];
  
  // Photos
  photos: File[];
  
  // Roommate Preferences
  roommatePreferences?: {
    ageRange?: { min: number; max: number };
    gender?: string;
    lifestyle?: {
      cleanliness: string[];
      socialLevel: string[];
      sleepSchedule: string[];
    };
  };
}

// Property Search & Filter Types
export interface PropertyFilters {
  // Location
  city?: string;
  neighborhood?: string[];
  maxDistance?: number;
  
  // Pricing
  priceRange: {
    min: number;
    max: number;
  };
  utilitiesIncluded?: boolean;
  
  // Property Type
  propertyTypes: string[];
  roomTypes: string[];
  
  // Details
  minBedrooms?: number;
  minBathrooms?: number;
  furnished?: string[];
  
  // Availability
  availableFrom?: string;
  minimumStay?: number;
  maximumStay?: number;
  
  // Amenities
  requiredAmenities: string[];
  
  // Rules
  petFriendly?: boolean;
  smokingAllowed?: boolean;
  
  // Other
  hasPhotos?: boolean;
  verifiedOwners?: boolean;
  instantBook?: boolean;
}

export interface PropertySearchQuery {
  query?: string;
  filters: Partial<PropertyFilters>;
  sortBy: 'price' | 'date' | 'distance' | 'popularity';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PropertySearchResults {
  properties: Property[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  filters: PropertyFilters;
  suggestions?: string[];
}

// Property Inquiry Types
export interface PropertyInquiry {
  id: string;
  propertyId: string;
  inquirerId: string;
  inquirerProfile: {
    firstName: string;
    lastName: string;
    photo?: string;
    isVerified: boolean;
  };
  message: string;
  moveInDate?: string;
  stayDuration?: number;
  status: 'pending' | 'responded' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

// API Response Types
export interface PropertyResponse {
  success: boolean;
  data: Property;
  message: string;
}

export interface PropertiesResponse {
  success: boolean;
  data: {
    properties: Property[];
    totalCount: number;
    hasMore: boolean;
  };
  message: string;
}

export interface PropertyInquiryResponse {
  success: boolean;
  data: PropertyInquiry;
  message: string;
}

// Constants
export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'studio', label: 'Studio' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'loft', label: 'Loft' },
  { value: 'other', label: 'Other' },
] as const;

export const ROOM_TYPES = [
  { value: 'private-room', label: 'Private Room' },
  { value: 'shared-room', label: 'Shared Room' },
  { value: 'entire-place', label: 'Entire Place' },
] as const;

export const FURNISHED_OPTIONS = [
  { value: 'fully', label: 'Fully Furnished' },
  { value: 'partially', label: 'Partially Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
] as const;

export const AMENITIES_LIST = [
  // Basic
  { value: 'wifi', label: 'WiFi', category: 'basic' },
  { value: 'airConditioning', label: 'Air Conditioning', category: 'basic' },
  { value: 'heating', label: 'Heating', category: 'basic' },
  { value: 'laundry', label: 'Laundry', category: 'basic' },
  
  // Kitchen
  { value: 'dishwasher', label: 'Dishwasher', category: 'kitchen' },
  { value: 'microwave', label: 'Microwave', category: 'kitchen' },
  { value: 'refrigerator', label: 'Refrigerator', category: 'kitchen' },
  { value: 'oven', label: 'Oven', category: 'kitchen' },
  
  // Building
  { value: 'elevator', label: 'Elevator', category: 'building' },
  { value: 'gym', label: 'Gym', category: 'building' },
  { value: 'pool', label: 'Pool', category: 'building' },
  { value: 'rooftop', label: 'Rooftop Access', category: 'building' },
  { value: 'doorman', label: 'Doorman', category: 'building' },
  
  // Outdoor
  { value: 'balcony', label: 'Balcony', category: 'outdoor' },
  { value: 'patio', label: 'Patio', category: 'outdoor' },
  { value: 'garden', label: 'Garden', category: 'outdoor' },
  { value: 'yard', label: 'Yard', category: 'outdoor' },
  
  // Other
  { value: 'petFriendly', label: 'Pet Friendly', category: 'other' },
  { value: 'storage', label: 'Storage', category: 'other' },
  { value: 'bike_storage', label: 'Bike Storage', category: 'other' },
] as const;

export const SORT_OPTIONS = [
  { value: 'price', label: 'Price' },
  { value: 'date', label: 'Date Posted' },
  { value: 'distance', label: 'Distance' },
  { value: 'popularity', label: 'Popularity' },
] as const;

// Validation Types
export interface PropertyValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

// Analytics Types
export interface PropertyAnalytics {
  views: number;
  favorites: number;
  inquiries: number;
  responseRate: number;
  averageResponseTime: number;
  conversionRate: number;
}
