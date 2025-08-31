import axios, { AxiosInstance, AxiosResponse } from 'axios';

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
    login: (data: any) => apiInstance.post('/auth/login', data),
    register: (data: any) => apiInstance.post('/auth/register', data),
    resetPassword: (data: any) => apiInstance.post('/auth/reset-password', data),
  },

  // User endpoints
  users: {
    getAll: () => apiInstance.get('/users'),
    getProfile: () => apiInstance.get('/users/profile'),
    updateProfile: (data: any) => apiInstance.put('/users/profile', data),
    deleteUser: (id: string) => apiInstance.delete(`/users/${id}`),
  },

  // Event endpoints
  events: {
    getAll: () => apiInstance.get('/events'),
    getById: (id: string) => apiInstance.get(`/events/${id}`),
    create: (data: any) => apiInstance.post('/events', data),
    update: (id: string, data: any) => apiInstance.put(`/events/${id}`, data),
    delete: (id: string) => apiInstance.delete(`/events/${id}`),
  },

  // Category endpoints
  categories: {
    getAll: () => apiInstance.get('/categories'),
    getById: (id: string) => apiInstance.get(`/categories/${id}`),
    create: (data: any) => apiInstance.post('/categories', data),
    update: (id: string, data: any) => apiInstance.put(`/categories/${id}`, data),
    delete: (id: string) => apiInstance.delete(`/categories/${id}`),
  },

};

export default apiInstance;