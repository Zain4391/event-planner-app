import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginCredentials, RegisterData, User, Event, Category } from '../types/api';

// Create event data type that matches backend CreateEventDto
export interface CreateEventData {
  title: string;
  description?: string;
  categoryId: string;
  venueName: string;
  venueAddress: string;
  eventDate: string; // YYYY-MM-DD format as expected by backend
  startTime: string; // HH:MM:SS format
  endTime: string;   // HH:MM:SS format
  totalCapacity: number;
  bannerImageUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const apiInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Extract error message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// API client with typed methods
export const apiClient = {
  // Auth endpoints
  auth: {
    login: (data: LoginCredentials) => apiInstance.post('/auth/login', data),
    register: (data: RegisterData) => apiInstance.post('/auth/register', data),
    resetPassword: (data: { email: string; password: string }) => apiInstance.post('/auth/reset-password', data),
  },

  // User endpoints
  users: {
    getAll: () => apiInstance.get('/users'),
    getProfile: () => apiInstance.get('/users/profile'),
    updateProfile: (data: Partial<User>) => apiInstance.put('/users/profile', data),
    deleteUser: (id: string) => apiInstance.delete(`/users/${id}`),
  },

  // Event endpoints
  events: {
    getAll: () => apiInstance.get('/events'),
    getById: (id: string) => apiInstance.get(`/events/${id}`),
    getAdminAll: () => apiInstance.get('/events/admin/all'),
    getMyEvents: () => apiInstance.get('/events/my-events'),
    create: (data: CreateEventData) => apiInstance.post('/events/create-event', data),
    update: (id: string, data: Partial<Event>) => apiInstance.patch(`/events/${id}/update-event`, data),
    publish: (id: string) => apiInstance.patch(`/events/${id}/publish-event`),
    delete: (id: string) => apiInstance.delete(`/events/${id}/remove-event`),
  },

  // Category endpoints
  categories: {
    getAll: () => apiInstance.get('/categories'),
    getById: (id: string) => apiInstance.get(`/categories/${id}`),
    create: (data: Omit<Category, 'id' | 'createdAt'>) => apiInstance.post('/categories', data),
    update: (id: string, data: Partial<Category>) => apiInstance.put(`/categories/${id}`, data),
    delete: (id: string) => apiInstance.delete(`/categories/${id}`),
  },

};

export default apiInstance;