import { apiClient } from './api';
import { LoginCredentials, RegisterData, User } from '../types/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.auth.login(credentials);
      
      // Handle YOUR API response structure
      const responseData = response.data; // This is the outer response
      const userData = responseData.data; // This is the actual user data inside
      const token = userData.token;
      
      // Extract user without token
      const { token: _, ...user } = userData; // Remove token from user object
      
      // Store token and user in localStorage
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiClient.auth.register(data);
      
      // Handle YOUR API response structure
      const responseData = response.data;
      const userData = responseData.data;
      const token = userData.token;
      
      // Extract user without token
      const { token: _, ...user } = userData;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  async resetPassword(email: string, password: string): Promise<void> {
    try {
      await apiClient.auth.resetPassword({ email, password });
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};