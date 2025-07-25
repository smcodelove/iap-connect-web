// mobile/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration for different environments
const API_CONFIG = {
  // For iOS Simulator (using your Mac's IP)
  iOS_SIMULATOR: 'http://192.168.1.10:8000/api/v1',
  
  // For Android Emulator
  ANDROID_EMULATOR: 'http://10.0.2.2:8000/api/v1',
  
  // For Physical Device (using your Mac's IP)
  PHYSICAL_DEVICE: 'http://192.168.1.10:8000/api/v1',
  
  // For Web
  WEB: 'http://localhost:8000/api/v1'
};

// Auto-detect platform and set appropriate base URL
const getBaseURL = () => {
  const Platform = require('react-native').Platform;
  
  if (Platform.OS === 'ios') {
    return API_CONFIG.iOS_SIMULATOR; // Change to PHYSICAL_DEVICE if using real device
  } else if (Platform.OS === 'android') {
    return API_CONFIG.ANDROID_EMULATOR; // Change to PHYSICAL_DEVICE if using real device
  } else {
    return API_CONFIG.WEB;
  }
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error
    console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.message}`);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status } = error.response;
      
      if (status === 401 && !originalRequest._retry) {
        // Token expired, try to refresh or logout
        originalRequest._retry = true;
        
        try {
          // Clear invalid token
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          
          // Redirect to login (implement based on your navigation setup)
          // NavigationService.navigate('Login');
          
        } catch (tokenError) {
          console.error('Error clearing tokens:', tokenError);
        }
      }
      
      return Promise.reject(error);
    } else if (error.request) {
      // Network error
      console.error('Network Error - Check if backend server is running on:', getBaseURL());
      error.message = 'Network Error - Cannot connect to server';
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check API connectivity
export const checkAPIConnectivity = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ API connectivity check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API connectivity check failed:', error.message);
    console.error('Current API base URL:', getBaseURL());
    return false;
  }
};

// Export configured axios instance
export default api;