/**
 * API service configuration for IAP Connect mobile app
 * Centralized HTTP client with interceptors and error handling
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    
    // Log request for development
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response for development
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error for development
    console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.response?.status || 'Network Error'}`);
    
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear stored auth data
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.USER_DATA
        ]);
        
        // Redirect to login screen (you can dispatch a Redux action here)
        console.log('Token expired, redirecting to login...');
        
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API utility functions
export const apiUtils = {
  /**
   * Get error message from API response
   */
  getErrorMessage: (error) => {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  /**
   * Check if error is network related
   */
  isNetworkError: (error) => {
    return !error.response && error.code === 'NETWORK_ERROR';
  },

  /**
   * Check if error is timeout related
   */
  isTimeoutError: (error) => {
    return error.code === 'ECONNABORTED';
  },

  /**
   * Format URL with parameters
   */
  formatUrl: (url, params = {}) => {
    let formattedUrl = url;
    Object.keys(params).forEach(key => {
      formattedUrl = formattedUrl.replace(`:${key}`, params[key]);
    });
    return formattedUrl;
  }
};

// Export configured axios instance
export default api;