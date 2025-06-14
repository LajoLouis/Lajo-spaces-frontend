import { 
  Property, 
  PropertyFilters, 
  PropertySearchQuery, 
  PropertySearchResults, 
  PropertyInquiry, 
  PropertyFormData,
  PropertiesResponse,
  PropertyResponse,
  PropertyInquiryResponse
} from '@/types/property.types';

// Mock property data - this will be modified when new properties are added
let mockProperties: Property[] = [
  {
    id: 'prop_1',
    ownerId: 'owner_1',
    ownerProfile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      isVerified: true,
      responseRate: 95,
      responseTime: 'within 1 hour'
    },
    title: 'Spacious Private Room in Modern Downtown Apartment',
    description: 'Beautiful private room in a newly renovated 2-bedroom apartment in the heart of downtown. Perfect for young professionals. The apartment features modern amenities, high ceilings, and lots of natural light. You\'ll have access to a fully equipped kitchen, living room, and shared bathroom. Building amenities include a gym, rooftop deck, and 24/7 concierge.',
    propertyType: 'apartment',
    roomType: 'private-room',
    location: {
      address: '123 Market Street, Apt 4B',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102',
      country: 'United States',
      neighborhood: 'SOMA',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    pricing: {
      monthlyRent: 1800,
      securityDeposit: 1800,
      utilitiesIncluded: true,
      currency: 'USD',
      negotiable: false
    },
    availability: {
      availableFrom: '2024-02-01',
      minimumStay: 6,
      maximumStay: 12,
      isAvailable: true
    },
    details: {
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      furnished: 'partially',
      floor: 4,
      totalFloors: 15,
      yearBuilt: 2020,
      parkingSpaces: 0
    },
    amenities: {
      wifi: true,
      airConditioning: true,
      heating: true,
      laundry: 'in-building',
      kitchen: 'full',
      dishwasher: true,
      microwave: true,
      refrigerator: true,
      oven: true,
      washer: false,
      dryer: false,
      elevator: true,
      gym: true,
      pool: false,
      rooftop: true,
      doorman: true,
      concierge: true,
      balcony: false,
      patio: false,
      garden: false,
      yard: false,
      petFriendly: false,
      smokingAllowed: false,
      storage: true,
      bike_storage: true
    },
    rules: {
      petsAllowed: false,
      smokingAllowed: false,
      partiesAllowed: false,
      guestsAllowed: true,
      quietHours: { start: '22:00', end: '08:00' }
    },
    photos: [
      {
        id: 'photo_1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop',
        isPrimary: true,
        order: 0,
        room: 'bedroom',
        uploadedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'photo_2',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
        isPrimary: false,
        order: 1,
        room: 'living-room',
        uploadedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'photo_3',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
        isPrimary: false,
        order: 2,
        room: 'kitchen',
        uploadedAt: '2024-01-01T00:00:00Z'
      }
    ],
    roommatePreferences: {
      ageRange: { min: 22, max: 35 },
      gender: 'no-preference',
      lifestyle: {
        cleanliness: ['very-clean', 'moderately-clean'],
        socialLevel: ['moderately-social'],
        sleepSchedule: ['early-bird', 'flexible']
      },
      dealBreakers: {
        smoking: true,
        pets: true,
        parties: true,
        overnight_guests: false
      }
    },
    transportation: {
      walkScore: 95,
      transitScore: 88,
      bikeScore: 82,
      nearbyTransit: ['BART', 'Muni', 'Bus Lines'],
      commuteTimes: {
        downtown: 5,
        airport: 45,
        university: 25
      }
    },
    views: 156,
    favorites: 23,
    inquiries: 8,
    isPromoted: false,
    isFeatured: true,
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'prop_2',
    ownerId: 'owner_2',
    ownerProfile: {
      firstName: 'Michael',
      lastName: 'Chen',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      isVerified: true,
      responseRate: 88,
      responseTime: 'within 2 hours'
    },
    title: 'Cozy Studio in Mission District - Pet Friendly',
    description: 'Charming studio apartment in the vibrant Mission District. Perfect for students or young professionals. Features include hardwood floors, high ceilings, and a murphy bed to maximize space. Kitchen has been recently updated with stainless steel appliances. Pet-friendly building with a lovely courtyard garden.',
    propertyType: 'studio',
    roomType: 'entire-place',
    location: {
      address: '456 Valencia Street',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94110',
      country: 'United States',
      neighborhood: 'Mission',
      coordinates: { lat: 37.7599, lng: -122.4148 }
    },
    pricing: {
      monthlyRent: 2200,
      securityDeposit: 2200,
      utilitiesIncluded: false,
      utilitiesCost: 150,
      currency: 'USD',
      negotiable: true
    },
    availability: {
      availableFrom: '2024-01-20',
      minimumStay: 12,
      isAvailable: true
    },
    details: {
      bedrooms: 0,
      bathrooms: 1,
      squareFootage: 450,
      furnished: 'unfurnished',
      floor: 2,
      totalFloors: 3,
      yearBuilt: 1925,
      parkingSpaces: 0
    },
    amenities: {
      wifi: false,
      airConditioning: false,
      heating: true,
      laundry: 'in-building',
      kitchen: 'full',
      dishwasher: false,
      microwave: true,
      refrigerator: true,
      oven: true,
      washer: false,
      dryer: false,
      elevator: false,
      gym: false,
      pool: false,
      rooftop: false,
      doorman: false,
      concierge: false,
      balcony: false,
      patio: false,
      garden: true,
      yard: false,
      petFriendly: true,
      smokingAllowed: false,
      storage: false,
      bike_storage: false
    },
    rules: {
      petsAllowed: true,
      smokingAllowed: false,
      partiesAllowed: true,
      guestsAllowed: true
    },
    photos: [
      {
        id: 'photo_4',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop',
        isPrimary: true,
        order: 0,
        room: 'living-room',
        uploadedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'photo_5',
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop',
        isPrimary: false,
        order: 1,
        room: 'kitchen',
        uploadedAt: '2024-01-01T00:00:00Z'
      }
    ],
    transportation: {
      walkScore: 89,
      transitScore: 92,
      bikeScore: 95,
      nearbyTransit: ['BART', 'Muni', 'Bus Lines'],
      commuteTimes: {
        downtown: 15,
        airport: 35
      }
    },
    views: 89,
    favorites: 12,
    inquiries: 5,
    isPromoted: true,
    isFeatured: false,
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'prop_3',
    ownerId: 'owner_3',
    ownerProfile: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
      isVerified: false,
      responseRate: 72,
      responseTime: 'within 4 hours'
    },
    title: 'Shared Room in Castro - LGBTQ+ Friendly',
    description: 'Welcoming shared room in a 3-bedroom house in the heart of Castro. Perfect for someone looking for an inclusive, friendly environment. The house has a great community vibe with regular house dinners and movie nights. Shared spaces include a large kitchen, living room, and backyard garden.',
    propertyType: 'house',
    roomType: 'shared-room',
    location: {
      address: '789 Castro Street',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94114',
      country: 'United States',
      neighborhood: 'Castro',
      coordinates: { lat: 37.7609, lng: -122.4350 }
    },
    pricing: {
      monthlyRent: 1200,
      securityDeposit: 600,
      utilitiesIncluded: true,
      currency: 'USD',
      negotiable: false
    },
    availability: {
      availableFrom: '2024-02-15',
      minimumStay: 3,
      maximumStay: 24,
      isAvailable: true
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      furnished: 'fully',
      floor: 1,
      totalFloors: 2,
      yearBuilt: 1940,
      parkingSpaces: 1
    },
    amenities: {
      wifi: true,
      airConditioning: false,
      heating: true,
      laundry: 'in-unit',
      kitchen: 'shared',
      dishwasher: true,
      microwave: true,
      refrigerator: true,
      oven: true,
      washer: true,
      dryer: true,
      elevator: false,
      gym: false,
      pool: false,
      rooftop: false,
      doorman: false,
      concierge: false,
      balcony: false,
      patio: true,
      garden: true,
      yard: true,
      petFriendly: true,
      smokingAllowed: false,
      storage: true,
      bike_storage: true
    },
    rules: {
      petsAllowed: true,
      smokingAllowed: false,
      partiesAllowed: true,
      guestsAllowed: true,
      quietHours: { start: '23:00', end: '07:00' }
    },
    photos: [
      {
        id: 'photo_6',
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&h=200&fit=crop',
        isPrimary: true,
        order: 0,
        room: 'bedroom',
        uploadedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'photo_7',
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop',
        isPrimary: false,
        order: 1,
        room: 'exterior',
        uploadedAt: '2024-01-01T00:00:00Z'
      }
    ],
    transportation: {
      walkScore: 92,
      transitScore: 85,
      bikeScore: 88,
      nearbyTransit: ['Muni', 'Bus Lines'],
      commuteTimes: {
        downtown: 12,
        airport: 40
      }
    },
    views: 67,
    favorites: 8,
    inquiries: 3,
    isPromoted: false,
    isFeatured: false,
    status: 'active',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z'
  }
];

// Mock inquiries
const mockInquiries: PropertyInquiry[] = [];

// Simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

class MockPropertyService {
  // Get all properties with filtering
  async getProperties(
    filters: Partial<PropertyFilters> = {},
    limit: number = 10,
    page: number = 1
  ): Promise<PropertiesResponse> {
    await delay(800);

    let filteredProperties = [...mockProperties];

    // Apply filters
    if (filters.priceRange) {
      filteredProperties = filteredProperties.filter(property => 
        property.pricing.monthlyRent >= filters.priceRange!.min &&
        property.pricing.monthlyRent <= filters.priceRange!.max
      );
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      filteredProperties = filteredProperties.filter(property =>
        filters.propertyTypes!.includes(property.propertyType)
      );
    }

    if (filters.roomTypes && filters.roomTypes.length > 0) {
      filteredProperties = filteredProperties.filter(property =>
        filters.roomTypes!.includes(property.roomType)
      );
    }

    if (filters.minBedrooms !== undefined) {
      filteredProperties = filteredProperties.filter(property =>
        property.details.bedrooms >= filters.minBedrooms!
      );
    }

    if (filters.minBathrooms !== undefined) {
      filteredProperties = filteredProperties.filter(property =>
        property.details.bathrooms >= filters.minBathrooms!
      );
    }

    if (filters.petFriendly) {
      filteredProperties = filteredProperties.filter(property =>
        property.amenities.petFriendly
      );
    }

    if (filters.hasPhotos) {
      filteredProperties = filteredProperties.filter(property =>
        property.photos && property.photos.length > 0
      );
    }

    if (filters.verifiedOwners) {
      filteredProperties = filteredProperties.filter(property =>
        property.ownerProfile.isVerified
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        properties: paginatedProperties,
        totalCount: filteredProperties.length,
        hasMore: endIndex < filteredProperties.length,
      },
      message: `Found ${paginatedProperties.length} properties`,
    };
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<PropertyResponse> {
    await delay(500);

    const property = mockProperties.find(p => p.id === id);
    
    if (!property) {
      return {
        success: false,
        data: {} as Property,
        message: 'Property not found',
      };
    }

    // Increment view count
    property.views += 1;

    return {
      success: true,
      data: property,
      message: 'Property retrieved successfully',
    };
  }

  // Search properties
  async searchProperties(query: PropertySearchQuery): Promise<PropertySearchResults> {
    await delay(600);

    const { query: searchText, filters = {}, sortBy = 'date', sortOrder = 'desc' } = query;
    
    let results = [...mockProperties];

    // Apply text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      results = results.filter(property => {
        return (
          property.title.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower) ||
          property.location.neighborhood?.toLowerCase().includes(searchLower) ||
          property.location.city.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply filters (simplified version)
    if (filters.priceRange) {
      results = results.filter(property => 
        property.pricing.monthlyRent >= filters.priceRange!.min &&
        property.pricing.monthlyRent <= filters.priceRange!.max
      );
    }

    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.pricing.monthlyRent - b.pricing.monthlyRent;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'popularity':
          comparison = a.views - b.views;
          break;
        case 'distance':
          // Mock distance calculation
          comparison = Math.random() - 0.5;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      properties: paginatedResults,
      totalCount: results.length,
      hasMore: endIndex < results.length,
      page: query.page,
      filters: filters as PropertyFilters,
      suggestions: searchText ? ['Downtown', 'Mission', 'Castro', 'SOMA'] : undefined,
    };
  }

  // Create property
  async createProperty(formData: Partial<PropertyFormData>): Promise<PropertyResponse> {
    await delay(1500);

    // Simulate validation
    if (!formData.title || !formData.description) {
      return {
        success: false,
        data: {} as Property,
        message: 'Title and description are required',
      };
    }

    // Create new property
    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      ownerId: 'current_user', // Would be actual user ID
      ownerProfile: {
        firstName: 'Current',
        lastName: 'User',
        isVerified: false,
        responseRate: 0,
        responseTime: 'new user'
      },
      title: formData.title,
      description: formData.description,
      propertyType: formData.propertyType as any,
      roomType: formData.roomType as any,
      location: {
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.zipCode || '',
        country: 'United States',
        neighborhood: formData.neighborhood
      },
      pricing: {
        monthlyRent: formData.monthlyRent || 0,
        securityDeposit: formData.securityDeposit,
        utilitiesIncluded: formData.utilitiesIncluded || false,
        utilitiesCost: formData.utilitiesCost,
        currency: 'USD',
        negotiable: formData.negotiable || false
      },
      availability: {
        availableFrom: formData.availableFrom || new Date().toISOString().split('T')[0],
        availableUntil: formData.availableUntil,
        minimumStay: formData.minimumStay || 1,
        maximumStay: formData.maximumStay,
        isAvailable: true
      },
      details: {
        bedrooms: formData.bedrooms || 1,
        bathrooms: formData.bathrooms || 1,
        squareFootage: formData.squareFootage,
        furnished: formData.furnished as any,
        floor: formData.floor,
        totalFloors: undefined,
        yearBuilt: undefined,
        parkingSpaces: formData.parkingSpaces
      },
      amenities: {
        wifi: formData.amenities?.includes('wifi') || false,
        airConditioning: formData.amenities?.includes('airConditioning') || false,
        heating: formData.amenities?.includes('heating') || false,
        laundry: 'none',
        kitchen: 'full',
        dishwasher: formData.amenities?.includes('dishwasher') || false,
        microwave: formData.amenities?.includes('microwave') || false,
        refrigerator: formData.amenities?.includes('refrigerator') || false,
        oven: formData.amenities?.includes('oven') || false,
        washer: formData.amenities?.includes('washer') || false,
        dryer: formData.amenities?.includes('dryer') || false,
        elevator: formData.amenities?.includes('elevator') || false,
        gym: formData.amenities?.includes('gym') || false,
        pool: formData.amenities?.includes('pool') || false,
        rooftop: formData.amenities?.includes('rooftop') || false,
        doorman: formData.amenities?.includes('doorman') || false,
        concierge: formData.amenities?.includes('concierge') || false,
        balcony: formData.amenities?.includes('balcony') || false,
        patio: formData.amenities?.includes('patio') || false,
        garden: formData.amenities?.includes('garden') || false,
        yard: formData.amenities?.includes('yard') || false,
        petFriendly: formData.petsAllowed || false,
        smokingAllowed: formData.smokingAllowed || false,
        storage: formData.amenities?.includes('storage') || false,
        bike_storage: formData.amenities?.includes('bike_storage') || false
      },
      rules: {
        petsAllowed: formData.petsAllowed || false,
        smokingAllowed: formData.smokingAllowed || false,
        partiesAllowed: formData.partiesAllowed || false,
        guestsAllowed: formData.guestsAllowed !== false,
        quietHours: formData.quietHours,
        additionalRules: formData.additionalRules
      },
      photos: [], // Would handle photo upload separately
      roommatePreferences: formData.roommatePreferences,
      transportation: {
        walkScore: Math.floor(Math.random() * 40) + 60,
        transitScore: Math.floor(Math.random() * 40) + 60,
        bikeScore: Math.floor(Math.random() * 40) + 60,
        nearbyTransit: ['Public Transit'],
        commuteTimes: {
          downtown: Math.floor(Math.random() * 30) + 10,
          airport: Math.floor(Math.random() * 30) + 30
        }
      },
      views: 0,
      favorites: 0,
      inquiries: 0,
      isPromoted: false,
      isFeatured: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data at the beginning (most recent first)
    mockProperties.unshift(newProperty);

    console.log(`✅ New property added: "${newProperty.title}" - Total properties: ${mockProperties.length}`);

    return {
      success: true,
      data: newProperty,
      message: 'Property created successfully',
    };
  }

  // Send inquiry
  async sendInquiry(
    propertyId: string, 
    message: string, 
    moveInDate?: string, 
    stayDuration?: number
  ): Promise<PropertyInquiryResponse> {
    await delay(800);

    const property = mockProperties.find(p => p.id === propertyId);
    if (!property) {
      return {
        success: false,
        data: {} as PropertyInquiry,
        message: 'Property not found',
      };
    }

    const inquiry: PropertyInquiry = {
      id: `inquiry_${Date.now()}`,
      propertyId,
      inquirerId: 'current_user',
      inquirerProfile: {
        firstName: 'Current',
        lastName: 'User',
        isVerified: false
      },
      message,
      moveInDate,
      stayDuration,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    mockInquiries.push(inquiry);
    property.inquiries += 1;

    return {
      success: true,
      data: inquiry,
      message: 'Inquiry sent successfully',
    };
  }

  // Get mock properties (for development)
  getMockProperties(): Property[] {
    return mockProperties;
  }

  // Get current property count (for debugging)
  getPropertyCount(): number {
    return mockProperties.length;
  }

  // Reset mock data (for development)
  resetMockData(): void {
    mockInquiries.length = 0;
    mockProperties.forEach(property => {
      property.views = Math.floor(Math.random() * 200);
      property.favorites = Math.floor(Math.random() * 50);
      property.inquiries = Math.floor(Math.random() * 20);
    });
  }
}

// Create and export singleton instance
export const mockPropertyService = new MockPropertyService();
export default mockPropertyService;
