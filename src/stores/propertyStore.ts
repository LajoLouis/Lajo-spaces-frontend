import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Property, 
  PropertyFilters, 
  PropertySearchResults, 
  PropertyInquiry,
  PropertyFormData
} from '@/types/property.types';

interface PropertyState {
  // Properties
  properties: Property[];
  currentProperty: Property | null;
  userProperties: Property[];
  favoriteProperties: Property[];
  
  // Search & Filters
  searchResults: PropertySearchResults | null;
  filters: Partial<PropertyFilters>;
  searchQuery: string;
  
  // Inquiries
  inquiries: PropertyInquiry[];
  sentInquiries: PropertyInquiry[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Form State
  formData: Partial<PropertyFormData>;
  isSubmitting: boolean;
  formErrors: Record<string, string[]>;
}

interface PropertyStore extends PropertyState {
  // Property Actions
  setProperties: (properties: Property[]) => void;
  addProperties: (properties: Property[]) => void;
  setCurrentProperty: (property: Property | null) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  
  // User Properties
  setUserProperties: (properties: Property[]) => void;
  addUserProperty: (property: Property) => void;
  updateUserProperty: (id: string, updates: Partial<Property>) => void;
  deleteUserProperty: (id: string) => void;
  
  // Favorites
  addToFavorites: (propertyId: string) => void;
  removeFromFavorites: (propertyId: string) => void;
  setFavoriteProperties: (properties: Property[]) => void;
  isFavorite: (propertyId: string) => boolean;
  
  // Search & Filters
  setSearchResults: (results: PropertySearchResults | null) => void;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Inquiries
  setInquiries: (inquiries: PropertyInquiry[]) => void;
  addInquiry: (inquiry: PropertyInquiry) => void;
  updateInquiry: (id: string, updates: Partial<PropertyInquiry>) => void;
  setSentInquiries: (inquiries: PropertyInquiry[]) => void;
  addSentInquiry: (inquiry: PropertyInquiry) => void;
  
  // UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  
  // Form Actions
  setFormData: (data: Partial<PropertyFormData>) => void;
  updateFormData: (updates: Partial<PropertyFormData>) => void;
  resetFormData: () => void;
  setFormErrors: (errors: Record<string, string[]>) => void;
  setSubmitting: (submitting: boolean) => void;
  
  // Utility Actions
  getPropertyById: (id: string) => Promise<Property | null>;
  getPropertyByIdSync: (id: string) => Property | null;
  getUserPropertyById: (id: string) => Property | null;
  getUserProperties: () => Promise<void>;
  getInquiryById: (id: string) => PropertyInquiry | null;
  toggleFavorite: (propertyId: string) => Promise<void>;
  clearAllData: () => void;
}

const initialFilters: Partial<PropertyFilters> = {
  priceRange: { min: 0, max: 10000 },
  propertyTypes: [],
  roomTypes: [],
  requiredAmenities: [],
};

const initialFormData: Partial<PropertyFormData> = {
  propertyType: '',
  roomType: '',
  bedrooms: 1,
  bathrooms: 1,
  furnished: '',
  amenities: [],
  petsAllowed: false,
  smokingAllowed: false,
  partiesAllowed: false,
  guestsAllowed: true,
  utilitiesIncluded: false,
  negotiable: false,
  minimumStay: 1,
};

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  userProperties: [],
  favoriteProperties: [],
  searchResults: null,
  filters: initialFilters,
  searchQuery: '',
  inquiries: [],
  sentInquiries: [],
  isLoading: false,
  error: null,
  hasMore: true,
  formData: initialFormData,
  isSubmitting: false,
  formErrors: {},
};

export const usePropertyStore = create<PropertyStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,
        
        // Property Actions
        setProperties: (properties) => {
          set({ properties, error: null });
        },
        
        addProperties: (newProperties) => {
          set((state) => ({
            properties: [...state.properties, ...newProperties],
            error: null,
          }));
        },
        
        setCurrentProperty: (property) => {
          set({ currentProperty: property });
        },
        
        addProperty: (property) => {
          set((state) => ({
            properties: [property, ...state.properties],
            userProperties: [property, ...state.userProperties],
          }));
        },
        
        updateProperty: (id, updates) => {
          set((state) => ({
            properties: state.properties.map(p => 
              p.id === id ? { ...p, ...updates } : p
            ),
            currentProperty: state.currentProperty?.id === id 
              ? { ...state.currentProperty, ...updates }
              : state.currentProperty,
          }));
        },
        
        deleteProperty: (id) => {
          set((state) => ({
            properties: state.properties.filter(p => p.id !== id),
            userProperties: state.userProperties.filter(p => p.id !== id),
            favoriteProperties: state.favoriteProperties.filter(p => p.id !== id),
            currentProperty: state.currentProperty?.id === id ? null : state.currentProperty,
          }));
        },
        
        // User Properties
        setUserProperties: (properties) => {
          set({ userProperties: properties });
        },
        
        addUserProperty: (property) => {
          set((state) => ({
            userProperties: [property, ...state.userProperties],
          }));
        },
        
        updateUserProperty: (id, updates) => {
          set((state) => ({
            userProperties: state.userProperties.map(p => 
              p.id === id ? { ...p, ...updates } : p
            ),
          }));
        },
        
        deleteUserProperty: (id) => {
          set((state) => ({
            userProperties: state.userProperties.filter(p => p.id !== id),
          }));
        },
        
        // Favorites
        addToFavorites: (propertyId) => {
          const property = get().properties.find(p => p.id === propertyId);
          if (property) {
            set((state) => ({
              favoriteProperties: [property, ...state.favoriteProperties.filter(p => p.id !== propertyId)],
            }));
          }
        },
        
        removeFromFavorites: (propertyId) => {
          set((state) => ({
            favoriteProperties: state.favoriteProperties.filter(p => p.id !== propertyId),
          }));
        },
        
        setFavoriteProperties: (properties) => {
          set({ favoriteProperties: properties });
        },
        
        isFavorite: (propertyId) => {
          return get().favoriteProperties.some(p => p.id === propertyId);
        },
        
        // Search & Filters
        setSearchResults: (results) => {
          set({ searchResults: results });
        },
        
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          }));
        },
        
        resetFilters: () => {
          set({ filters: initialFilters });
        },
        
        setSearchQuery: (query) => {
          set({ searchQuery: query });
        },
        
        clearSearch: () => {
          set({ searchQuery: '', searchResults: null });
        },
        
        // Inquiries
        setInquiries: (inquiries) => {
          set({ inquiries });
        },
        
        addInquiry: (inquiry) => {
          set((state) => ({
            inquiries: [inquiry, ...state.inquiries],
          }));
        },
        
        updateInquiry: (id, updates) => {
          set((state) => ({
            inquiries: state.inquiries.map(i => 
              i.id === id ? { ...i, ...updates } : i
            ),
          }));
        },
        
        setSentInquiries: (inquiries) => {
          set({ sentInquiries: inquiries });
        },
        
        addSentInquiry: (inquiry) => {
          set((state) => ({
            sentInquiries: [inquiry, ...state.sentInquiries],
          }));
        },
        
        // UI State
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        
        setError: (error) => {
          set({ error, isLoading: false });
        },
        
        setHasMore: (hasMore) => {
          set({ hasMore });
        },
        
        // Form Actions
        setFormData: (data) => {
          set({ formData: data });
        },
        
        updateFormData: (updates) => {
          set((state) => ({
            formData: { ...state.formData, ...updates },
          }));
        },
        
        resetFormData: () => {
          set({ formData: initialFormData, formErrors: {} });
        },
        
        setFormErrors: (errors) => {
          set({ formErrors: errors });
        },
        
        setSubmitting: (submitting) => {
          set({ isSubmitting: submitting });
        },
        
        // Utility Actions
        getPropertyById: async (id) => {
          // First check local state
          const localProperty = get().properties.find(p => p.id === id);
          if (localProperty) {
            return localProperty;
          }

          // If not found locally, fetch from service
          try {
            const { mockPropertyService } = await import('@/services/mockProperty.service');
            const response = await mockPropertyService.getPropertyById(id);
            if (response.success && response.data) {
              // Add to local state
              set((state) => ({
                properties: [response.data, ...state.properties.filter(p => p.id !== id)]
              }));
              return response.data;
            }
          } catch (error) {
            console.error('Failed to fetch property:', error);
          }

          return null;
        },

        getPropertyByIdSync: (id) => {
          return get().properties.find(p => p.id === id) || null;
        },

        getUserPropertyById: (id) => {
          return get().userProperties.find(p => p.id === id) || null;
        },

        getUserProperties: async () => {
          try {
            set({ isLoading: true, error: null });

            // In a real app, this would fetch user's properties from the API
            // For now, we'll simulate this by filtering properties by current user
            const allProperties = get().properties;
            const userProps = allProperties.filter(p => p.ownerId === 'current_user');

            set({
              userProperties: userProps,
              isLoading: false
            });
          } catch (error: any) {
            set({
              error: error.message || 'Failed to fetch user properties',
              isLoading: false
            });
          }
        },

        getInquiryById: (id) => {
          return get().inquiries.find(i => i.id === id) || null;
        },

        toggleFavorite: async (propertyId) => {
          const state = get();
          const isFavorited = state.favoriteProperties.some(p => p.id === propertyId);

          if (isFavorited) {
            get().removeFromFavorites(propertyId);
          } else {
            get().addToFavorites(propertyId);
          }
        },

        clearAllData: () => {
          set(initialState);
        },
      }),
      {
        name: 'property-store',
        // Only persist filters and search query, not the actual data
        partialize: (state) => ({
          filters: state.filters,
          searchQuery: state.searchQuery,
          favoriteProperties: state.favoriteProperties,
        }),
      }
    ),
    {
      name: 'property-store',
    }
  )
);

// Selectors for common use cases
export const useProperties = () => {
  const store = usePropertyStore();
  return {
    properties: store.properties,
    currentProperty: store.currentProperty,
    isLoading: store.isLoading,
    error: store.error,
    hasMore: store.hasMore,
  };
};

export const useUserProperties = () => {
  const store = usePropertyStore();
  return {
    userProperties: store.userProperties,
    addUserProperty: store.addUserProperty,
    updateUserProperty: store.updateUserProperty,
    deleteUserProperty: store.deleteUserProperty,
  };
};

export const usePropertySearch = () => {
  const store = usePropertyStore();
  return {
    searchResults: store.searchResults,
    searchQuery: store.searchQuery,
    filters: store.filters,
    setSearchResults: store.setSearchResults,
    setSearchQuery: store.setSearchQuery,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
    clearSearch: store.clearSearch,
  };
};

export const usePropertyForm = () => {
  const store = usePropertyStore();
  return {
    formData: store.formData,
    formErrors: store.formErrors,
    isSubmitting: store.isSubmitting,
    setFormData: store.setFormData,
    updateFormData: store.updateFormData,
    resetFormData: store.resetFormData,
    setFormErrors: store.setFormErrors,
    setSubmitting: store.setSubmitting,
  };
};

export const useFavoriteProperties = () => {
  const store = usePropertyStore();
  return {
    favoriteProperties: store.favoriteProperties,
    addToFavorites: store.addToFavorites,
    removeFromFavorites: store.removeFromFavorites,
    isFavorite: store.isFavorite,
  };
};
