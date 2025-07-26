// src/services/authService.js
import axios from 'axios';
import { API_CONFIG, ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

// Create dedicated auth axios instance
const authApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Request interceptor for auth API
authApi.interceptors.request.use(
  (config) => {
    // Add token to requests (except login/register)
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const isAuthEndpoint = [ENDPOINTS.LOGIN, ENDPOINTS.REGISTER].includes(config.url);
    
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`🔐 Auth API: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('🔐 Auth API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for auth API
authApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Auth API: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ Auth API: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.response?.data);
    
    // Handle auth errors
    if (error.response?.status === 401) {
      // Clear stored data on unauthorized
      authService.clearStoredData();
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth Service Implementation
const authService = {
  // ====================
  // AUTHENTICATION METHODS
  // ====================
  
  /**
   * Login user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} Response with success/error
   */
  // Updated login method in authService.js - WITH USER TYPE
    async login(credentials) {
    try {
        console.log('🔐 Attempting login for:', credentials.email, 'as', credentials.user_type);
        
        // Create FormData with user type
        const formData = new FormData();
        formData.append('username', credentials.email); // Backend expects 'username' field
        formData.append('password', credentials.password);
        
        // Add user_type if provided
        if (credentials.user_type) {
        formData.append('user_type', credentials.user_type);
        }
        
        // Debug: Log what we're sending
        console.log('📤 Sending login data:', {
        username: credentials.email,
        user_type: credentials.user_type,
        password: '***'
        });
        
        const response = await authApi.post(ENDPOINTS.LOGIN, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        });
        
        console.log('📥 Login response:', response.status, response.data);
        
        const { access_token, token_type } = response.data;
        
        if (access_token) {
        // Store token
        this.setToken(access_token);
        console.log('✅ Login successful, token stored');
        
        return {
            success: true,
            data: {
            access_token,
            token_type: token_type || 'bearer'
            }
        };
        } else {
        throw new Error('No access token received');
        }
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        
        let errorMessage = 'Login failed';
        
        if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
        } else if (errorData.detail && Array.isArray(errorData.detail)) {
            // Handle validation errors
            errorMessage = errorData.detail.map(err => err.msg || err.message).join(', ');
        } else if (errorData.message) {
            errorMessage = errorData.message;
        }
        } else if (error.message) {
        errorMessage = error.message;
        }
        
        // Common error messages translation
        if (errorMessage.includes('Incorrect username or password')) {
        errorMessage = 'Invalid email or password';
        } else if (errorMessage.includes('validation error')) {
        errorMessage = 'Please check your email and password format';
        } else if (errorMessage.includes('user_type')) {
        errorMessage = 'Please select a valid user role';
        }
        
        return {
        success: false,
        error: errorMessage
        };
    }
    },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with success/error
   */
  async register(userData) {
    try {
      console.log('🔐 Attempting registration for:', userData.email);
      
      // Validate required fields
      const requiredFields = ['email', 'password', 'full_name', 'username', 'user_type'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      const response = await authApi.post(ENDPOINTS.REGISTER, userData);
      
      console.log('✅ Registration successful');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (errorData.detail && Array.isArray(errorData.detail)) {
          // Handle validation errors
          errorMessage = errorData.detail.map(err => err.msg || err.message).join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Get current user information
   * @returns {Promise<Object>} Response with user data
   */
  async getCurrentUser() {
    try {
      console.log('🔐 Fetching current user...');
      
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await authApi.get(ENDPOINTS.ME);
      
      const userData = response.data;
      
      // Store user data
      this.setUserData(userData);
      
      console.log('✅ Current user fetched successfully:', userData.username);
      
      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('❌ Get current user failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to get user information';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Response with success/error
   */
  async logout() {
    try {
      console.log('🔐 Logging out user...');
      
      // Try to call logout endpoint
      try {
        await authApi.post(ENDPOINTS.LOGOUT);
        console.log('✅ Server logout successful');
      } catch (error) {
        console.warn('⚠️ Server logout failed, proceeding with local logout:', error.message);
      }
      
      // Clear local storage regardless of server response
      this.clearStoredData();
      
      console.log('✅ Local logout completed');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Still clear local data even if there's an error
      this.clearStoredData();
      
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Response with new token
   */
  async refreshToken() {
    try {
      console.log('🔐 Refreshing token...');
      
      const response = await authApi.post('/auth/refresh');
      
      const { access_token } = response.data;
      
      if (access_token) {
        this.setToken(access_token);
        console.log('✅ Token refreshed successfully');
        
        return {
          success: true,
          data: { access_token }
        };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      
      // Clear stored data on refresh failure
      this.clearStoredData();
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Token refresh failed'
      };
    }
  },

  // ====================
  // TOKEN MANAGEMENT
  // ====================
  
  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    // Store backup for compatibility
    localStorage.setItem('token', token);
    console.log('🔑 Token stored successfully');
  },

  /**
   * Get authentication token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || 
           localStorage.getItem('token');
  },

  /**
   * Remove authentication token
   */
  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem('token');
    console.log('🔑 Token removed');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('🔑 Token expired, removing...');
        this.removeToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔑 Invalid token format, removing...', error);
      this.removeToken();
      return false;
    }
  },

  // ====================
  // USER DATA MANAGEMENT
  // ====================
  
  /**
   * Set user data in localStorage
   * @param {Object} userData - User information
   */
  setUserData(userData) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    console.log('👤 User data stored');
  },

  /**
   * Get user data from localStorage
   * @returns {Object|null} User data
   */
  getUserData() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('👤 Error parsing user data:', error);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return null;
    }
  },

  /**
   * Remove user data from localStorage
   */
  removeUserData() {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    console.log('👤 User data removed');
  },

  /**
   * Update user data
   * @param {Object} updates - User data updates
   * @returns {Object} Updated user data
   */
  updateUserData(updates) {
    const currentData = this.getUserData();
    const updatedData = { ...currentData, ...updates };
    this.setUserData(updatedData);
    return updatedData;
  },

  // ====================
  // UTILITY METHODS
  // ====================
  
  /**
   * Clear all stored authentication data
   */
  clearStoredData() {
    this.removeToken();
    this.removeUserData();
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    console.log('🧹 All stored data cleared');
  },

  /**
   * Set remember me preference
   * @param {boolean} remember - Remember preference
   */
  setRememberMe(remember) {
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }
  },

  /**
   * Get remember me preference
   * @returns {boolean} Remember preference
   */
  getRememberMe() {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  },

  /**
   * Get authentication headers
   * @returns {Object} Headers object
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with score and feedback
   */
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let score = 0;
    const feedback = [];
    
    if (password.length >= minLength) score++;
    else feedback.push(`At least ${minLength} characters`);
    
    if (hasUpperCase && hasLowerCase) score++;
    else feedback.push('Both uppercase and lowercase letters');
    
    if (hasNumbers) score++;
    else feedback.push('At least one number');
    
    if (hasSpecialChar) score++;
    else feedback.push('At least one special character');
    
    return {
      score,
      isValid: score >= 3,
      strength: score === 0 ? 'Very Weak' : 
               score === 1 ? 'Weak' : 
               score === 2 ? 'Fair' : 
               score === 3 ? 'Good' : 'Strong',
      feedback
    };
  },

  // ====================
  // PASSWORD RECOVERY
  // ====================
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Response
   */
  async requestPasswordReset(email) {
    try {
      console.log('🔐 Requesting password reset for:', email);
      
      const response = await authApi.post('/auth/forgot-password', { email });
      
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      console.error('❌ Password reset request failed:', error);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to send reset instructions'
      };
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response
   */
  async resetPassword(token, newPassword) {
    try {
      console.log('🔐 Resetting password with token');
      
      const response = await authApi.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to reset password'
      };
    }
  }
};

export default authService;