/**
 * User service for IAP Connect mobile app
 * Handles API calls for user-related operations
 */

import api, { apiUtils } from './api';
import { ENDPOINTS } from '../utils/constants';

class UserService {
  /**
   * Search users
   */
  async searchUsers(query) {
    try {
      const response = await api.get(ENDPOINTS.USERS_SEARCH, {
        params: { q: query }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const response = await api.get(`${ENDPOINTS.USERS_PROFILE}/${userId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Follow user
   */
  async followUser(userId) {
    try {
      const response = await api.post(`${ENDPOINTS.USERS_FOLLOW}/${userId}`);
      
      return {
        success: true,
        message: 'User followed successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Unfollow user
   */
  async unfollowUser(userId) {
    try {
      const response = await api.delete(`${ENDPOINTS.USERS_FOLLOW}/${userId}`);
      
      return {
        success: true,
        message: 'User unfollowed successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(imageData) {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.fileName || 'avatar.jpg'
      });

      const response = await api.post(ENDPOINTS.USERS_UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Avatar updated successfully'
      };
    } catch (error) {
      throw new Error(apiUtils.getErrorMessage(error));
    }
  }
}

// Export singleton instance
export default new UserService();