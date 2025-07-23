import { apiService } from './api.service';
import { mockPropertyService } from './mockProperty.service';
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
import { API_ENDPOINTS } from '@/types/api.types';

// Check if we should use mock service
const USE_MOCK_PROPERTIES = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

class PropertyService {
  // Get all properties with filtering
  async getProperties(
    filters: Partial<PropertyFilters> = {},
    limit: number = 10,
    page: number = 1
  ): Promise<PropertiesResponse> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.getProperties(filters, limit, page);
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Add filters to query params
    if (filters.priceRange) {
      queryParams.append('minPrice', filters.priceRange.min.toString());
      queryParams.append('maxPrice', filters.priceRange.max.toString());
    }
    
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      filters.propertyTypes.forEach(type => queryParams.append('propertyType', type));
    }
    
    if (filters.bedrooms) {
      queryParams.append('bedrooms', filters.bedrooms.toString());
    }
    
    if (filters.bathrooms) {
      queryParams.append('bathrooms', filters.bathrooms.toString());
    }
    
    if (filters.location) {
      if (filters.location.city) queryParams.append('city', filters.location.city);
      if (filters.location.state) queryParams.append('state', filters.location.state);
    }

    const response = await apiService.get<{properties: any[], totalCount: number, hasMore: boolean}>(
      `${API_ENDPOINTS.PROPERTIES.LIST}?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      const transformedProperties = response.data.properties.map(this.transformBackendProperty);
      
      return {
        success: response.success,
        data: {
          properties: transformedProperties,
          totalCount: response.data.totalCount,
          hasMore: response.data.hasMore,
        },
        message: response.message || 'Properties retrieved successfully',
      };
    }

    throw new Error('Failed to fetch properties');
  }

  // Get single property by ID
  async getProperty(id: string): Promise<PropertyResponse> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.getProperty(id);
    }

    const response = await apiService.get<{property: any}>(`${API_ENDPOINTS.PROPERTIES.GET}/${id}`);

    if (response.success && response.data.property) {
      const transformedProperty = this.transformBackendProperty(response.data.property);
      
      return {
        success: response.success,
        data: transformedProperty,
        message: response.message || 'Property retrieved successfully',
      };
    }

    throw new Error('Property not found');
  }

  // Search properties
  async searchProperties(query: PropertySearchQuery): Promise<PropertySearchResults> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.searchProperties(query);
    }

    // Backend uses POST for search, not GET
    const searchData = {
      query: query.query,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      location: query.filters?.location ? {
        city: query.filters.location.city,
        state: query.filters.location.state,
        area: query.filters.location.area
      } : undefined,
      minPrice: query.filters?.priceRange?.min,
      maxPrice: query.filters?.priceRange?.max,
      propertyTypes: query.filters?.propertyTypes,
      bedrooms: query.filters?.bedrooms,
      bathrooms: query.filters?.bathrooms,
      amenities: query.filters?.amenities
    };

    const response = await apiService.post<{
      properties: any[],
      totalCount: number,
      hasMore: boolean,
      suggestions?: string[]
    }>(API_ENDPOINTS.PROPERTIES.SEARCH, searchData);

    if (response.success && response.data) {
      const transformedProperties = response.data.properties.map(this.transformBackendProperty);
      
      return {
        properties: transformedProperties,
        totalCount: response.data.totalCount,
        hasMore: response.data.hasMore,
        page: query.page,
        filters: query.filters as PropertyFilters,
        suggestions: response.data.suggestions,
      };
    }

    throw new Error('Search failed');
  }

  // Create property
  async createProperty(formData: Partial<PropertyFormData>): Promise<PropertyResponse> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.createProperty(formData);
    }

    // Transform frontend data to backend format
    const backendData = this.transformToBackendFormat(formData);

    const response = await apiService.post<{property: any}>(API_ENDPOINTS.PROPERTIES.CREATE, backendData);

    if (response.success && response.data.property) {
      const transformedProperty = this.transformBackendProperty(response.data.property);
      
      return {
        success: response.success,
        data: transformedProperty,
        message: response.message || 'Property created successfully',
      };
    }

    throw new Error('Failed to create property');
  }

  // Update property
  async updateProperty(id: string, updates: Partial<PropertyFormData>): Promise<PropertyResponse> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.updateProperty(id, updates);
    }

    const backendData = this.transformToBackendFormat(updates);

    const response = await apiService.put<{property: any}>(`${API_ENDPOINTS.PROPERTIES.UPDATE}/${id}`, backendData);

    if (response.success && response.data.property) {
      const transformedProperty = this.transformBackendProperty(response.data.property);
      
      return {
        success: response.success,
        data: transformedProperty,
        message: response.message || 'Property updated successfully',
      };
    }

    throw new Error('Failed to update property');
  }

  // Delete property
  async deleteProperty(id: string): Promise<{success: boolean, message: string}> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.deleteProperty(id);
    }

    const response = await apiService.delete(`${API_ENDPOINTS.PROPERTIES.DELETE}/${id}`);

    return {
      success: response.success,
      message: response.message || 'Property deleted successfully',
    };
  }

  // Send inquiry
  async sendInquiry(propertyId: string, inquiry: Partial<PropertyInquiry>): Promise<PropertyInquiryResponse> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.sendInquiry(propertyId, inquiry);
    }

    const response = await apiService.post<{inquiry: any}>(`${API_ENDPOINTS.PROPERTIES.GET}/${propertyId}/inquiries`, inquiry);

    return {
      success: response.success,
      data: response.data.inquiry,
      message: response.message || 'Inquiry sent successfully',
    };
  }

  // Get user's properties
  async getUserProperties(): Promise<PropertiesResponse> {
    if (USE_MOCK_PROPERTIES) {
      return mockPropertyService.getUserProperties();
    }

    const response = await apiService.get<{properties: any[], totalCount: number}>('/properties/owner');

    if (response.success && response.data) {
      const transformedProperties = response.data.properties.map(this.transformBackendProperty);
      
      return {
        success: response.success,
        data: {
          properties: transformedProperties,
          totalCount: response.data.totalCount,
          hasMore: false,
        },
        message: response.message || 'User properties retrieved successfully',
      };
    }

    throw new Error('Failed to fetch user properties');
  }

  // Transform backend property to frontend format
  private transformBackendProperty = (backendProperty: any): Property => {
    return {
      id: backendProperty._id || backendProperty.id,
      ownerId: backendProperty.ownerId?._id || backendProperty.ownerId,
      ownerProfile: {
        firstName: backendProperty.ownerId?.firstName || 'Unknown',
        lastName: backendProperty.ownerId?.lastName || 'User',
        photo: backendProperty.ownerId?.profilePhoto,
        isVerified: backendProperty.ownerId?.isEmailVerified || false,
        responseRate: 95, // Default value
        responseTime: 'within 24 hours', // Default value
      },
      
      // Basic Information
      title: backendProperty.title,
      description: backendProperty.description,
      propertyType: backendProperty.propertyType,
      roomType: this.mapListingTypeToRoomType(backendProperty.listingType),
      
      // Location
      location: {
        address: backendProperty.location?.address || '',
        city: backendProperty.location?.city || '',
        state: backendProperty.location?.state || '',
        zipCode: '', // Backend doesn't have zipCode
        country: backendProperty.location?.country || '',
        neighborhood: backendProperty.location?.area,
        coordinates: backendProperty.location?.coordinates ? {
          lat: backendProperty.location.coordinates.coordinates[1],
          lng: backendProperty.location.coordinates.coordinates[0],
        } : undefined,
      },
      
      // Property Details
      bedrooms: backendProperty.bedrooms || 0,
      bathrooms: backendProperty.bathrooms || 0,
      squareFootage: backendProperty.floorArea,
      furnished: backendProperty.furnishing?.furnished || false,
      
      // Pricing
      pricing: {
        monthlyRent: backendProperty.pricing?.rent || 0,
        securityDeposit: backendProperty.pricing?.securityDeposit || 0,
        utilitiesIncluded: backendProperty.pricing?.utilitiesIncluded || false,
        currency: 'NGN', // Nigerian Naira
      },
      
      // Photos
      photos: (backendProperty.photos || []).map((photo: any, index: number) => ({
        id: photo._id || `photo_${index}`,
        url: photo.url,
        caption: photo.caption || '',
        isPrimary: photo.isPrimary || index === 0,
        order: index,
      })),
      
      // Amenities
      amenities: backendProperty.amenities || [],
      
      // Availability
      availability: {
        isAvailable: backendProperty.status === 'active',
        availableFrom: backendProperty.availability?.availableFrom || new Date().toISOString(),
        leaseDuration: backendProperty.availability?.leaseDuration || 'flexible',
        moveInDate: backendProperty.availability?.moveInDate,
      },
      
      // Rules & Preferences
      rules: backendProperty.rules || {
        smokingAllowed: false,
        petsAllowed: false,
        partiesAllowed: false,
        guestsAllowed: true,
      },
      
      // Stats
      views: backendProperty.analytics?.views || 0,
      favorites: backendProperty.analytics?.favorites || 0,
      inquiries: backendProperty.analytics?.inquiries || 0,
      
      // Metadata
      isVerified: backendProperty.verification?.isVerified || false,
      isPremium: false, // Default value
      createdAt: backendProperty.createdAt || new Date().toISOString(),
      updatedAt: backendProperty.updatedAt || new Date().toISOString(),
    };
  };

  // Helper method to map backend listingType to frontend roomType
  private mapListingTypeToRoomType(listingType: string): 'private-room' | 'shared-room' | 'entire-place' {
    switch (listingType) {
      case 'rent':
        return 'entire-place';
      case 'roommate':
        return 'private-room';
      case 'sublet':
        return 'private-room';
      default:
        return 'private-room';
    }
  }

  // Transform frontend property data to backend format
  private transformToBackendFormat(frontendData: Partial<PropertyFormData>): any {
    return {
      title: frontendData.title,
      description: frontendData.description,
      propertyType: frontendData.propertyType,
      listingType: this.mapRoomTypeToListingType(frontendData.roomType),
      bedrooms: frontendData.bedrooms || 0,
      bathrooms: frontendData.bathrooms || 0,
      totalRooms: (frontendData.bedrooms || 0) + (frontendData.bathrooms || 0) + 2, // Required by backend
      floorArea: frontendData.squareFootage,

      // Location
      location: frontendData.address || frontendData.city || frontendData.state ? {
        address: frontendData.address || '',
        city: frontendData.city || '',
        state: frontendData.state || '',
        country: 'Nigeria',
        area: frontendData.neighborhood,
        coordinates: frontendData.coordinates ? {
          type: 'Point',
          coordinates: [frontendData.coordinates.lng, frontendData.coordinates.lat]
        } : undefined,
      } : undefined,

      // Pricing (backend expects 'rentPerMonth', not 'rent')
      pricing: frontendData.monthlyRent || frontendData.securityDeposit ? {
        rentPerMonth: frontendData.monthlyRent || 0,
        securityDeposit: frontendData.securityDeposit || 0,
        electricityIncluded: frontendData.electricityIncluded || false,
        waterIncluded: frontendData.waterIncluded || false,
        internetIncluded: frontendData.internetIncluded || false,
      } : undefined,

      // Furnishing
      furnishing: {
        furnished: frontendData.furnished || false,
      },

      // Amenities (backend expects object with boolean properties, not array)
      amenities: this.transformAmenitiesToBackendFormat(frontendData.amenities || []),

      // Backend expects availableFrom at root level, not in availability object
      availableFrom: frontendData.availableFrom || new Date().toISOString().split('T')[0],
      leaseDuration: frontendData.leaseDuration || 'long-term',

      // Rules (maximumOccupants is required by backend)
      rules: {
        smokingAllowed: frontendData.smokingAllowed || false,
        petsAllowed: frontendData.petsAllowed || false,
        partiesAllowed: frontendData.partiesAllowed || false,
        guestsAllowed: frontendData.guestsAllowed !== false,
        maximumOccupants: frontendData.maximumOccupants || (frontendData.bedrooms || 1) * 2, // Required by backend
      },
    };
  }

  // Transform amenities array to backend object format
  private transformAmenitiesToBackendFormat(amenities: string[]): Record<string, boolean> {
    const amenitiesMap: Record<string, boolean> = {};

    // Map common amenities to backend format
    const amenityMapping: Record<string, string> = {
      'Air Conditioning': 'airConditioning',
      'WiFi': 'wifi',
      'Parking': 'parking',
      'Security': 'security',
      'Generator': 'generator',
      'Gym': 'gym',
      'Pool': 'pool',
      'Laundry': 'laundry',
      'Kitchen': 'kitchen',
      'Balcony': 'balcony',
    };

    // Set all amenities to false by default
    Object.values(amenityMapping).forEach(key => {
      amenitiesMap[key] = false;
    });

    // Set selected amenities to true
    amenities.forEach(amenity => {
      const backendKey = amenityMapping[amenity];
      if (backendKey) {
        amenitiesMap[backendKey] = true;
      }
    });

    return amenitiesMap;
  }

  // Helper method to map frontend roomType to backend listingType
  private mapRoomTypeToListingType(roomType?: string): string {
    switch (roomType) {
      case 'entire-place':
        return 'rent';
      case 'private-room':
        return 'roommate';
      case 'shared-room':
        return 'roommate';
      default:
        return 'rent';
    }
  }
}

// Create and export singleton instance
export const propertyService = new PropertyService();
export default propertyService;
