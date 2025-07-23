/**
 * Authentication service for IAP Connect mobile app
 * Handles API calls for user authentication
 */

import api, { apiUtils } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await api.post(ENDPOINTS.REGISTER, userData);
      return {
        success: true,
        data: response.data,
        message: 'Account created successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await api.post(ENDPOINTS.LOGIN, credentials);
      const { access_token, token_type } = response.data;

      // Store token in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      
      // Store remember me preference
      if (credentials.rememberMe) {
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      }

      // Get user profile
      const userProfile = await this.getCurrentUser();
      
      return {
        success: true,
        data: {
          token: access_token,
          tokenType: token_type,
          user: userProfile.data
        },
        message: 'Login successful'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint
      await api.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage
      await this.clearAuthData();
    }
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await api.get(ENDPOINTS.ME);
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(response.data)
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Get stored auth token
   */
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.REMEMBER_ME
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Refresh user session
   */
  async refreshSession() {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        throw new Error('No valid session found');
      }

      const userProfile = await this.getCurrentUser();
      return {
        success: true,
        data: userProfile.data
      };
    } catch (error) {
      // Clear invalid session data
      await this.clearAuthData();
      throw new Error('Session expired. Please login again.');
    }
  }

  /**
   * Check remember me preference
   */
  async shouldRememberUser() {
    try {
      const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return rememberMe === 'true';
    } catch (error) {
      console.error('Error checking remember me preference:', error);
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put(ENDPOINTS.USERS_PROFILE, profileData);
      
      // Update stored user data
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(response.data)
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }
}

// Export singleton instance
export default new AuthService();