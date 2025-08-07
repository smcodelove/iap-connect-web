// web/src/services/api.js - ADD MISSING EXPORT

import axios from 'axios';

// FIXED: Get correct backend URL
const getBackendUrl = () => {
  let baseUrl = process.env.REACT_APP_API_URL || 'https://iap-connect.onrender.com';
  
  // Ensure it ends with /api/v1 for API calls
  if (!baseUrl.includes('/api/v1')) {
    baseUrl = baseUrl.replace(/\/$/, '') + '/api/v1';
  }
  
  return baseUrl;
};

const API_BASE_URL = getBackendUrl();

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', process.env.NODE_ENV);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request headers');
    }
    
    // Log API calls for debugging
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    // Log error responses
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';
    const status = error.response?.status || 'NETWORK';
    
    console.error(`❌ ${method} ${url} - ${status}`);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear tokens and redirect to login
        console.log('🔑 Unauthorized access - clearing tokens');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('🚫 Forbidden access');
      } else if (status === 404) {
        console.error('🔍 Resource not found');
      } else if (status >= 500) {
        console.error('🔥 Server error');
      }
      
      // Return error with response data
      return Promise.reject({
        ...error,
        message: data?.detail || data?.message || error.message,
        status,
        data
      });
    } else if (error.request) {
      // Network error
      console.error('🌐 Network error - no response received');
      return Promise.reject({
        ...error,
        message: 'Network error - please check your connection',
        status: 'NETWORK_ERROR'
      });
    } else {
      // Request setup error
      console.error('⚙️ Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

// FIXED: Add missing notificationService export
export const notificationService = {
  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return { unread_count: 0, count: 0 };
    }
  },

  // Get all notifications
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return {
        notifications: [],
        total: 0,
        unread_count: 0,
        page: 1,
        has_next: false
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false, updated_count: 0 };
    }
  }
};

// Export the configured axios instance
export default api;

// Helper function to get clean backend URL (without /api/v1)
export const getCleanBackendUrl = () => {
  let baseUrl = process.env.REACT_APP_API_URL || 'https://iap-connect.onrender.com';
  
  // Remove /api/v1 if it exists
  if (baseUrl.includes('/api/v1')) {
    baseUrl = baseUrl.replace('/api/v1', '');
  }
  
  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  return baseUrl;
};

// Helper function for S3 direct requests (without /api/v1 prefix)
export const createS3Request = (endpoint, options = {}) => {
  const cleanUrl = getCleanBackendUrl();
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  return fetch(`${cleanUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};