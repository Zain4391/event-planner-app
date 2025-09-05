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
    eventDate: string; // "2024-12-25"
    startTime: string; // "14:30:00"
    endTime: string;   // "18:00:00"
    totalCapacity: number;
    availableCapacity: number;
    status: 'Draft' | 'Published' | 'Cancelled' | 'Completed';
    bannerImageUrl?: string;
    createdAt: string;
    updatedAt: string;
  }

  // API Response types
  export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
  }

  export interface EventListResponse {
    data: Event[];
    message: string;
    statusCode: number;
  }

  export interface CategoryListResponse {
    data: Category[];
    message: string;
    statusCode: number;
  }
  
  // Form states
  export interface FormState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  }