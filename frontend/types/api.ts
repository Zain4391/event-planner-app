// User types based on your backend
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Admin' | 'Organizer' | 'Customer';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  // Auth types
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'Admin' | 'Organizer' | 'Customer';
  }
  
  // Event types
  export interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
  }
  
  export interface Event {
    id: string;
    title: string;
    description?: string;
    categoryId?: string;
    organizerId: string;
    venueName: string;
    venueAddress: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    totalCapacity: number;
    availableCapacity: number;
    status: 'Draft' | 'Published' | 'Cancelled' | 'Completed';
    bannerImageUrl?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Form states
  export interface FormState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  }