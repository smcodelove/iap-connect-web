// services/userService.js
/**
 * User service for handling all user-related API calls
 * Includes profile management, follow/unfollow, search, and file uploads
 */

import api from './api';

class UserService {
  // Profile Management
  async getMyProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching my profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const response = await api.get(`/users/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user profile ${userId}:`, error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Profile Picture Upload
  async uploadAvatar(formData) {
    try {
      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout for file uploads
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // User Search
  async searchUsers(query, options = {}) {
    try {
      const params = {
        q: query,
        page: options.page || 1,
        per_page: options.per_page || 20,
        ...(options.user_type && { user_type: options.user_type })
      };

      const response = await api.get('/users/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Follow/Unfollow Users
  async followUser(userId) {
    try {
      const response = await api.post(`/users/follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error following user ${userId}:`, error);
      throw error;
    }
  }

  async unfollowUser(userId) {
    try {
      const response = await api.delete(`/users/follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error unfollowing user ${userId}:`, error);
      throw error;
    }
  }

  // Get Followers/Following Lists
  async getUserFollowers(userId, page = 1, perPage = 50) {
    try {
      const response = await api.get(`/users/followers/${userId}`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching followers for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserFollowing(userId, page = 1, perPage = 50) {
    try {
      const response = await api.get(`/users/following/${userId}`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching following for user ${userId}:`, error);
      throw error;
    }
  }

  // Batch operations for optimization
  async getUsersProfiles(userIds) {
    try {
      const promises = userIds.map(id => this.getUserProfile(id));
      const profiles = await Promise.allSettled(promises);
      
      return profiles.map((result, index) => ({
        userId: userIds[index],
        profile: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('Error fetching batch user profiles:', error);
      throw error;
    }
  }

  // Check follow status for multiple users
  async checkFollowStatus(userIds) {
    try {
      // This would require a batch endpoint on the backend
      // For now, we'll fetch individual profiles which include follow status
      const profiles = await this.getUsersProfiles(userIds);
      
      return profiles.reduce((acc, { userId, profile }) => {
        acc[userId] = profile ? profile.is_following : false;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  }

  // User suggestions (could be based on interests, mutual connections, etc.)
  async getSuggestedUsers(limit = 10) {
    try {
      // For now, we'll use search with empty query to get popular users
      const response = await this.searchUsers('', { 
        per_page: limit,
        user_type: undefined 
      });
      
      return response.users || [];
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      throw error;
    }
  }

  // Advanced search with filters
  async advancedUserSearch(filters) {
    try {
      const {
        query = '',
        userType,
        specialty,
        college,
        location,
        page = 1,
        perPage = 20
      } = filters;

      const params = {
        q: query,
        page,
        per_page: perPage,
        ...(userType && { user_type: userType }),
        ...(specialty && { specialty }),
        ...(college && { college }),
        ...(location && { location })
      };

      const response = await api.get('/users/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error in advanced user search:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      // This would typically be part of the profile endpoint
      // but could be a separate endpoint for detailed analytics
      const profile = await this.getUserProfile(userId);
      
      return {
        posts_count: profile.posts_count,
        followers_count: profile.followers_count,
        following_count: profile.following_count,
        // Additional stats could be added here
      };
    } catch (error) {
      console.error(`Error fetching stats for user ${userId}:`, error);
      throw error;
    }
  }

  // Report user (for moderation)
  async reportUser(userId, reason, description = '') {
    try {
      const response = await api.post('/users/report', {
        user_id: userId,
        reason,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  // Block/Unblock user
  async blockUser(userId) {
    try {
      const response = await api.post(`/users/block/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error blocking user ${userId}:`, error);
      throw error;
    }
  }

  async unblockUser(userId) {
    try {
      const response = await api.delete(`/users/block/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error unblocking user ${userId}:`, error);
      throw error;
    }
  }

  // Get blocked users list
  async getBlockedUsers() {
    try {
      const response = await api.get('/users/blocked');
      return response.data;
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      throw error;
    }
  }

  // Update user preferences/settings
  async updateUserSettings(settings) {
    try {
      const response = await api.put('/users/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Get user activity feed (for own profile)
  async getUserActivity(page = 1, perPage = 20) {
    try {
      const response = await api.get('/users/activity', {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  // Deactivate account
  async deactivateAccount(password) {
    try {
      const response = await api.post('/users/deactivate', { password });
      return response.data;
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  }

  // Helper method to format user data consistently
  formatUserData(userData) {
    return {
      id: userData.id,
      username: userData.username,
      full_name: userData.full_name,
      email: userData.email,
      bio: userData.bio,
      profile_picture_url: userData.profile_picture_url,
      user_type: userData.user_type,
      specialty: userData.specialty,
      college: userData.college,
      followers_count: userData.followers_count || 0,
      following_count: userData.following_count || 0,
      posts_count: userData.posts_count || 0,
      is_following: userData.is_following || false,
      is_follower: userData.is_follower || false,
      display_info: userData.display_info,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };
  }

  // Cache management for better performance
  _cache = new Map();
  
  async getCachedUserProfile(userId, forceRefresh = false) {
    const cacheKey = `profile_${userId}`;
    
    if (!forceRefresh && this._cache.has(cacheKey)) {
      const cached = this._cache.get(cacheKey);
      const now = Date.now();
      
      // Cache for 5 minutes
      if (now - cached.timestamp < 5 * 60 * 1000) {
        return cached.data;
      }
    }
    
    try {
      const profile = await this.getUserProfile(userId);
      this._cache.set(cacheKey, {
        data: profile,
        timestamp: Date.now()
      });
      
      return profile;
    } catch (error) {
      // Return cached data if available, even if expired
      if (this._cache.has(cacheKey)) {
        return this._cache.get(cacheKey).data;
      }
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this._cache.clear();
  }
}

// Export singleton instance
const userService = new UserService();
export { userService };