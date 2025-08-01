// web/src/services/userService.js - UPDATED WITH TRENDING FUNCTIONALITY
/**
 * User Service for IAP Connect
 * Handles all user-related API calls including profiles, follow/unfollow, search
 * UPDATED: Added trending users and enhanced functionality while keeping existing code
 */

import api from './api';

class UserService {
  
  // ==================== PROFILE OPERATIONS ====================
  
  /**
   * Get user profile by ID with real-time stats
   * FIXED: Corrected API endpoint path
   */
  async getUserProfile(userId) {
    try {
      console.log(`👤 Fetching profile for user ${userId}`);
      
      // FIXED: Correct endpoint path - /users/{user_id} not /users/profile/{user_id}
      const response = await api.get(`/users/${userId}`);
      
      console.log(`✅ Profile fetched for ${response.data.full_name}:`, {
        followers: response.data.followers_count,
        following: response.data.following_count,
        posts: response.data.posts_count
      });
      
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      console.error(`❌ Error fetching profile for user ${userId}:`, error);
      
      // Log detailed error info for debugging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request made but no response received');
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch user profile'
      };
    }
  }

  /**
   * Get current user's own profile
   */
  async getMyProfile() {
    try {
      console.log('👤 Fetching my profile');
      
      const response = await api.get('/users/profile');
      
      console.log('✅ My profile fetched:', {
        username: response.data.username,
        followers: response.data.followers_count,
        following: response.data.following_count,
        posts: response.data.posts_count
      });
      
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      console.error('❌ Error fetching my profile:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch profile'
      };
    }
  }

  /**
   * Update current user's profile
   */
  async updateProfile(profileData) {
    try {
      console.log('✏️ Updating profile:', profileData);
      
      const response = await api.put('/users/profile', profileData);
      
      console.log('✅ Profile updated successfully');
      
      return {
        success: true,
        user: response.data
      };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update profile'
      };
    }
  }

  /**
   * Upload profile avatar
   */
  async uploadAvatar(file) {
    try {
      console.log('📷 Uploading avatar');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Avatar uploaded successfully');
      
      return {
        success: true,
        file_url: response.data.file_url
      };
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to upload avatar'
      };
    }
  }

  // ==================== FOLLOW OPERATIONS ====================
  
  /**
   * Follow a user
   */
  async followUser(userId) {
    try {
      console.log(`👥 Following user ${userId}`);
      
      const response = await api.post(`/users/follow/${userId}`);
      
      console.log(`✅ Successfully followed user. They now have ${response.data.followers_count} followers`);
      
      return {
        success: true,
        message: response.data.message,
        followers_count: response.data.followers_count
      };
    } catch (error) {
      console.error(`❌ Error following user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to follow user'
      };
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId) {
    try {
      console.log(`👥 Unfollowing user ${userId}`);
      
      const response = await api.delete(`/users/follow/${userId}`);
      
      console.log(`✅ Successfully unfollowed user. They now have ${response.data.followers_count} followers`);
      
      return {
        success: true,
        message: response.data.message,
        followers_count: response.data.followers_count
      };
    } catch (error) {
      console.error(`❌ Error unfollowing user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to unfollow user'
      };
    }
  }

  /**
   * Get followers list for a user
   */
  async getUserFollowers(userId, page = 1, perPage = 50) {
    try {
      console.log(`👥 Fetching followers for user ${userId}`);
      
      const response = await api.get(`/users/followers/${userId}`, {
        params: { page, per_page: perPage }
      });
      
      console.log(`✅ Found ${response.data.length} followers`);
      
      return {
        success: true,
        followers: response.data,
        page,
        per_page: perPage
      };
    } catch (error) {
      console.error(`❌ Error fetching followers for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch followers'
      };
    }
  }

  /**
   * Get following list for a user
   */
  async getUserFollowing(userId, page = 1, perPage = 50) {
    try {
      console.log(`👥 Fetching following for user ${userId}`);
      
      const response = await api.get(`/users/following/${userId}`, {
        params: { page, per_page: perPage }
      });
      
      console.log(`✅ Found ${response.data.length} following`);
      
      return {
        success: true,
        following: response.data,
        page,
        per_page: perPage
      };
    } catch (error) {
      console.error(`❌ Error fetching following for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch following'
      };
    }
  }

  // ==================== SEARCH OPERATIONS ====================
  
  /**
   * Search users with filters
   */
  async searchUsers(query, options = {}) {
    try {
      const {
        userType,
        page = 1,
        perPage = 20,
        per_page = 20  // Support both naming conventions
      } = options;

      console.log(`🔍 Searching users: "${query}"`);
      
      const params = {
        q: query,
        page,
        per_page: per_page || perPage
      };
      
      if (userType) {
        params.user_type = userType;
      }

      const response = await api.get('/users/search', { params });
      
      console.log(`✅ Found ${response.data.users.length} users out of ${response.data.total} total`);
      
      return {
        success: true,
        users: response.data.users,
        total: response.data.total,
        page: response.data.page,
        per_page: response.data.per_page,
        has_next: response.data.has_next,
        has_prev: response.data.has_prev
      };
    } catch (error) {
      console.error('❌ Error searching users:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to search users'
      };
    }
  }

  // ==================== TRENDING & POPULAR USERS (NEW) ====================
  
  /**
   * Get trending/popular users based on activity and followers
   * NEW: Enhanced method for trending users functionality
   */
  async getTrendingUsers(limit = 15, user_type = null) {
    try {
      console.log('🔥 Fetching trending users...');
      
      const params = {
        limit,
        ...(user_type && { user_type })
      };
      
      // Try to use dedicated trending endpoint if available
      try {
        const response = await api.get('/users/trending', { params });
        
        console.log(`✅ Fetched ${response.data.users.length} trending users via dedicated endpoint`);
        
        return {
          success: true,
          users: response.data.users,
          total: response.data.total
        };
      } catch (trendingError) {
        // Fallback: Use search endpoint with empty query to get popular users
        console.log('📋 Trending endpoint not available, falling back to search method...');
        
        const searchResponse = await this.searchUsers('', { per_page: limit * 2 }); // Get more to filter
        
        if (searchResponse.success) {
          // Sort users by a combination of followers and recent activity
          const sortedUsers = searchResponse.users
            .filter(user => user.followers_count > 0) // Only users with followers
            .sort((a, b) => {
              // Simple trending score: followers + posts activity
              const scoreA = (a.followers_count || 0) + (a.posts_count || 0) * 5;
              const scoreB = (b.followers_count || 0) + (b.posts_count || 0) * 5;
              return scoreB - scoreA;
            })
            .slice(0, limit);
          
          console.log(`✅ Processed ${sortedUsers.length} trending users via search fallback`);
          
          return {
            success: true,
            users: sortedUsers,
            total: sortedUsers.length
          };
        } else {
          throw new Error(searchResponse.error);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching trending users:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch trending users'
      };
    }
  }

  /**
   * Get most followed users (simple popularity ranking)
   * NEW: Popular users method
   */
  async getPopularUsers(limit = 10, user_type = null) {
    try {
      console.log('⭐ Fetching popular users...');
      
      const params = {
        limit,
        sort_by: 'followers',
        ...(user_type && { user_type })
      };
      
      // Try dedicated popular users endpoint
      try {
        const response = await api.get('/users/popular', { params });
        
        console.log(`✅ Fetched ${response.data.users.length} popular users`);
        
        return {
          success: true,
          users: response.data.users
        };
      } catch (popularError) {
        // Fallback: Use search and sort by followers
        console.log('📋 Popular endpoint not available, using search fallback...');
        
        const searchResponse = await this.searchUsers('', { per_page: limit * 2 });
        
        if (searchResponse.success) {
          const popularUsers = searchResponse.users
            .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
            .slice(0, limit);
          
          return {
            success: true,
            users: popularUsers
          };
        } else {
          throw new Error(searchResponse.error);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching popular users:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch popular users'
      };
    }
  }

  // ==================== STATISTICS ====================
  
  /**
   * Get real-time user statistics
   */
  async getUserStats(userId) {
    try {
      console.log(`📊 Fetching stats for user ${userId}`);
      
      // Use the profile endpoint which includes stats
      const profileResponse = await this.getUserProfile(userId);
      
      if (profileResponse.success) {
        const stats = {
          posts_count: profileResponse.user.posts_count || 0,
          followers_count: profileResponse.user.followers_count || 0,
          following_count: profileResponse.user.following_count || 0
        };
        
        console.log(`✅ Stats fetched:`, stats);
        
        return {
          success: true,
          stats
        };
      } else {
        return profileResponse;
      }
    } catch (error) {
      console.error(`❌ Error fetching stats for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch user stats'
      };
    }
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Check if current user is following another user
   */
  async checkFollowStatus(userId) {
    try {
      const profileResponse = await this.getUserProfile(userId);
      
      if (profileResponse.success) {
        return {
          success: true,
          is_following: profileResponse.user.is_following || false,
          is_follower: profileResponse.user.is_follower || false
        };
      }
      
      return { success: false, error: 'Failed to check follow status' };
    } catch (error) {
      console.error(`❌ Error checking follow status for user ${userId}:`, error);
      return {
        success: false,
        error: 'Failed to check follow status'
      };
    }
  }

  /**
   * Get user suggestions (enhanced version)
   * UPDATED: Enhanced with trending functionality
   */
  async getSuggestedUsers(limit = 10) {
    try {
      console.log('💡 Fetching suggested users');
      
      // Try dedicated suggestions endpoint first
      try {
        const response = await api.get(`/users/suggestions?limit=${limit}`);
        
        console.log(`✅ Fetched ${response.data.users.length} suggested users via dedicated endpoint`);
        
        return {
          success: true,
          users: response.data.users
        };
      } catch (suggestionsError) {
        // Fallback: Get a mix of popular and recent users
        console.log('📋 Suggestions endpoint not available, using mixed approach...');
        
        const [popularResponse, searchResponse] = await Promise.all([
          this.getPopularUsers(Math.ceil(limit / 2)),
          this.searchUsers('', { per_page: Math.ceil(limit / 2) })
        ]);
        
        const suggestedUsers = [
          ...(popularResponse.success ? popularResponse.users : []),
          ...(searchResponse.success ? searchResponse.users : [])
        ]
          .filter((user, index, array) => 
            array.findIndex(u => u.id === user.id) === index // Remove duplicates
          )
          .slice(0, limit);
        
        console.log(`✅ Found ${suggestedUsers.length} suggested users via fallback`);
        
        return {
          success: true,
          users: suggestedUsers
        };
      }
    } catch (error) {
      console.error('❌ Error fetching suggested users:', error);
      
      // Final fallback to search with empty query
      const response = await this.searchUsers('', { perPage: limit });
      
      if (response.success) {
        console.log(`✅ Found ${response.users.length} suggested users via search fallback`);
        return {
          success: true,
          users: response.users
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch suggested users'
      };
    }
  }

  /**
   * Batch fetch multiple user profiles
   */
  async getUsersProfiles(userIds) {
    try {
      console.log(`👥 Fetching profiles for ${userIds.length} users`);
      
      const promises = userIds.map(id => this.getUserProfile(id));
      const results = await Promise.allSettled(promises);
      
      const profiles = results.map((result, index) => ({
        userId: userIds[index],
        profile: result.status === 'fulfilled' && result.value.success ? result.value.user : null,
        error: result.status === 'rejected' || !result.value.success ? 
               (result.value?.error || result.reason) : null
      }));
      
      const successCount = profiles.filter(p => p.profile !== null).length;
      
      console.log(`✅ Successfully fetched ${successCount}/${userIds.length} profiles`);
      
      return {
        success: true,
        profiles
      };
    } catch (error) {
      console.error('❌ Error fetching batch user profiles:', error);
      return {
        success: false,
        error: 'Failed to fetch user profiles'
      };
    }
  }

  /**
   * Bulk check follow status for multiple users
   * NEW: Bulk operations support
   */
  async checkBulkFollowStatus(userIds) {
    try {
      console.log(`🔍 Checking follow status for ${userIds.length} users`);
      
      const response = await api.post('/users/follow/check-bulk', {
        user_ids: userIds
      });
      
      console.log('✅ Bulk follow status checked');
      
      return {
        success: true,
        follow_status: response.data.follow_status
      };
    } catch (error) {
      console.error('❌ Error in bulk follow status check:', error);
      
      // Fallback: Check individually (slower but works)
      try {
        const statusPromises = userIds.map(userId => 
          this.checkFollowStatus(userId).then(result => ({
            user_id: userId,
            is_following: result.success ? result.is_following : false
          }))
        );
        
        const results = await Promise.all(statusPromises);
        const followStatus = results.reduce((acc, result) => {
          acc[result.user_id] = result.is_following;
          return acc;
        }, {});
        
        return {
          success: true,
          follow_status: followStatus
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: 'Failed to check follow status'
        };
      }
    }
  }

  // ==================== HELPER METHODS ====================
  
  /**
   * Format user display name
   */
  formatUserDisplayName(user) {
    return user.full_name || user.username || 'Unknown User';
  }

  /**
   * Get user type display text
   */
  getUserTypeDisplay(userType) {
    switch (userType) {
      case 'doctor':
        return 'Medical Professional';
      case 'student':
        return 'Medical Student';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(user) {
    const name = user.full_name || user.username || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * Format user stats for display
   */
  formatUserStats(user) {
    return {
      posts: this.formatCount(user.posts_count || 0),
      followers: this.formatCount(user.followers_count || 0),
      following: this.formatCount(user.following_count || 0)
    };
  }

  /**
   * Format large numbers (1000 -> 1K)
   */
  formatCount(count) {
    if (count >= 1000000) {
      return Math.floor(count / 100000) / 10 + 'M';
    }
    if (count >= 1000) {
      return Math.floor(count / 100) / 10 + 'K';
    }
    return count.toString();
  }

  /**
   * Validate profile update data
   */
  validateProfileData(data) {
    const errors = [];

    if (data.full_name && data.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (data.full_name && data.full_name.length > 100) {
      errors.push('Full name cannot be longer than 100 characters');
    }

    if (data.bio && data.bio.length > 500) {
      errors.push('Bio cannot be longer than 500 characters');
    }

    if (data.specialty && data.specialty.length > 100) {
      errors.push('Specialty cannot be longer than 100 characters');
    }

    if (data.college && data.college.length > 100) {
      errors.push('College name cannot be longer than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if user can follow another user
   */
  canFollowUser(currentUser, targetUser) {
    // Can't follow yourself
    if (currentUser.id === targetUser.id) {
      return { canFollow: false, reason: 'Cannot follow yourself' };
    }

    // Can't follow if already following
    if (targetUser.is_following) {
      return { canFollow: false, reason: 'Already following this user' };
    }

    return { canFollow: true };
  }

  // ==================== ADVANCED OPERATIONS ====================
  
  /**
   * Get mutual connections between two users
   */
  async getMutualConnections(userId1, userId2) {
    try {
      console.log(`🤝 Finding mutual connections between ${userId1} and ${userId2}`);
      
      // Get followers for both users
      const [user1Followers, user2Followers] = await Promise.all([
        this.getUserFollowers(userId1, 1, 100),
        this.getUserFollowers(userId2, 1, 100)
      ]);
      
      if (!user1Followers.success || !user2Followers.success) {
        throw new Error('Failed to fetch followers');
      }
      
      // Find mutual followers
      const user1FollowerIds = user1Followers.followers.map(f => f.id);
      const user2FollowerIds = user2Followers.followers.map(f => f.id);
      
      const mutualIds = user1FollowerIds.filter(id => user2FollowerIds.includes(id));
      const mutualUsers = user1Followers.followers.filter(f => mutualIds.includes(f.id));
      
      console.log(`✅ Found ${mutualUsers.length} mutual connections`);
      
      return {
        success: true,
        mutual_connections: mutualUsers,
        count: mutualUsers.length
      };
    } catch (error) {
      console.error('❌ Error finding mutual connections:', error);
      return {
        success: false,
        error: 'Failed to find mutual connections'
      };
    }
  }

  /**
   * Report a user
   */
  async reportUser(userId, reason, description = '') {
    try {
      console.log(`🚩 Reporting user ${userId} for: ${reason}`);
      
      const response = await api.post('/users/report', {
        user_id: userId,
        reason,
        description
      });
      
      console.log('✅ User reported successfully');
      
      return {
        success: true,
        message: 'User reported successfully'
      };
    } catch (error) {
      console.error(`❌ Error reporting user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to report user'
      };
    }
  }

  /**
   * Block a user
   */
  async blockUser(userId) {
    try {
      console.log(`🚫 Blocking user ${userId}`);
      
      const response = await api.post(`/users/block/${userId}`);
      
      console.log('✅ User blocked successfully');
      
      return {
        success: true,
        message: 'User blocked successfully'
      };
    } catch (error) {
      console.error(`❌ Error blocking user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to block user'
      };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId) {
    try {
      console.log(`✅ Unblocking user ${userId}`);
      
      const response = await api.delete(`/users/block/${userId}`);
      
      console.log('✅ User unblocked successfully');
      
      return {
        success: true,
        message: 'User unblocked successfully'
      };
    } catch (error) {
      console.error(`❌ Error unblocking user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to unblock user'
      };
    }
  }

  /**
   * Get user activity metrics (for admin/analytics)
   * NEW: Analytics support
   */
  async getUserActivityMetrics(userId, days = 30) {
    try {
      console.log(`📈 Fetching activity metrics for user ${userId} (${days} days)`);
      
      const response = await api.get(`/users/${userId}/activity?days=${days}`);
      
      console.log('✅ Activity metrics fetched');
      
      return {
        success: true,
        metrics: response.data
      };
    } catch (error) {
      console.error(`❌ Error fetching activity metrics for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch activity metrics'
      };
    }
  }

  // ==================== DEBUGGING METHODS ====================
  
  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      console.log('🔧 Testing userService API connectivity...');
      
      const response = await api.get('/health');
      console.log('✅ UserService API connection successful');
      
      return {
        success: true,
        message: 'API connection successful'
      };
    } catch (error) {
      console.error('❌ UserService API connection failed:', error);
      return {
        success: false,
        error: 'API connection failed'
      };
    }
  }

  /**
   * Log current API configuration
   */
  logApiConfig() {
    console.log('🔧 UserService API Configuration:');
    console.log('Base URL:', api.defaults.baseURL);
    console.log('Timeout:', api.defaults.timeout);
    console.log('Headers:', api.defaults.headers);
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;