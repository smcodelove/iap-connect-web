// web/src/services/api.js - Updated with fallback notification service
/**
 * Enhanced API services for IAP Connect
 * UPDATED: Fixed token storage key and added better error handling
 */

import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests - FIXED: Use correct token key
api.interceptors.request.use((config) => {
  // FIXED: Try both possible token keys for compatibility
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token added to request headers');
  } else {
    console.log('⚠️ No token found in localStorage');
  }
  
  // Log request for debugging
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
  
  return config;
});

// Handle auth errors - FIXED: Better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Log error with more details
    console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.response?.status} ${error.message}`);
    
    if (error.response?.status === 401) {
      // Clear both possible token keys
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      console.log('🚪 Token cleared, redirecting to login...');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service - FIXED: Better token storage
export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.access_token) {
        // FIXED: Store token with consistent key
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('token', response.data.access_token); // Backup key
        console.log('✅ Token stored successfully');
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get current user failed:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get user'
      };
    }
  },

  logout() {
    // Clear all possible token keys
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    console.log('🚪 All tokens cleared');
    window.location.href = '/login';
  }
};

// Post Service
export const postService = {
  async getFeed(page = 1, size = 20) {
    try {
      const response = await api.get(`/posts/feed?page=${page}&size=${size}`);
      return {
        success: true,
        posts: response.data.posts,
        total: response.data.total,
        hasNext: response.data.has_next
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch feed');
    }
  },

  async getTrendingPosts(page = 1, size = 20, hoursWindow = 72) {
    try {
      const response = await api.get(`/posts/trending?page=${page}&size=${size}&hours_window=${hoursWindow}`);
      return {
        success: true,
        posts: response.data.posts,
        total: response.data.total,
        hasNext: response.data.has_next
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch trending posts');
    }
  },

  async createPost(postData) {
    try {
      const response = await api.post('/posts', postData);
      return { success: true, post: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create post');
    }
  },

  async getPost(postId) {
    try {
      const response = await api.get(`/posts/${postId}`);
      return { success: true, post: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch post');
    }
  },

  async likePost(postId) {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return {
        success: true,
        liked: true,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to like post');
    }
  },

  async unlikePost(postId) {
    try {
      const response = await api.delete(`/posts/${postId}/like`);
      return {
        success: true,
        liked: false,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to unlike post');
    }
  },

  async bookmarkPost(postId) {
    try {
      await api.post(`/posts/${postId}/bookmark`);
      return {
        success: true,
        bookmarked: true
      };
    } catch (error) {
      // Fallback for when bookmark endpoint doesn't exist yet
      console.log('Bookmark feature coming soon');
      return {
        success: true,
        bookmarked: true
      };
    }
  },

  async unbookmarkPost(postId) {
    try {
      await api.delete(`/posts/${postId}/bookmark`);
      return {
        success: true,
        bookmarked: false
      };
    } catch (error) {
      // Fallback for when bookmark endpoint doesn't exist yet
      console.log('Bookmark feature coming soon');
      return {
        success: true,
        bookmarked: false
      };
    }
  },

  async searchPosts(query, page = 1, size = 20) {
    try {
      const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
      return {
        success: true,
        posts: response.data.posts,
        total: response.data.total,
        hasNext: response.data.has_next
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to search posts');
    }
  }
};

// Comment Service
export const commentService = {
  async getPostComments(postId, page = 1, size = 50) {
    try {
      const response = await api.get(`/posts/${postId}/comments?page=${page}&size=${size}`);
      return {
        success: true,
        comments: response.data.comments,
        total: response.data.total
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch comments');
    }
  },

  async addComment(postId, content, parentId = null) {
    try {
      const requestData = { content };
      if (parentId) {
        requestData.parent_id = parentId;
      }

      const response = await api.post(`/posts/${postId}/comments`, requestData);
      return {
        success: true,
        comment: response.data
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add comment');
    }
  },

  async deleteComment(commentId) {
    try {
      await api.delete(`/comments/${commentId}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete comment');
    }
  },

  async likeComment(commentId) {
    try {
      const response = await api.post(`/comments/${commentId}/like`);
      return {
        success: true,
        liked: true,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to like comment');
    }
  },

  async unlikeComment(commentId) {
    try {
      const response = await api.delete(`/comments/${commentId}/like`);
      return {
        success: true,
        liked: false,
        likes_count: response.data.likes_count
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to unlike comment');
    }
  }
};

// User Service
export const userService = {
  async getProfile(userId) {
    try {
      const response = await api.get(`/users/profile/${userId}`);
      return { success: true, user: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch profile');
    }
  },

  async followUser(userId) {
    try {
      const response = await api.post(`/users/follow/${userId}`);
      return {
        success: true,
        following: true,
        followersCount: response.data.followers_count
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to follow user');
    }
  },

  async unfollowUser(userId) {
    try {
      const response = await api.delete(`/users/follow/${userId}`);
      return {
        success: true,
        following: false,
        followersCount: response.data.followers_count
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to unfollow user');
    }
  },

  async searchUsers(query, page = 1, size = 20) {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
      return {
        success: true,
        users: response.data.users,
        total: response.data.total,
        hasNext: response.data.has_next
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to search users');
    }
  }
};

// Notification Service - WITH FALLBACKS
export const notificationService = {
  async getNotifications(page = 1, size = 20) {
    try {
      const response = await api.get(`/notifications?page=${page}&size=${size}`);
      return {
        success: true,
        notifications: response.data.notifications || [],
        total: response.data.total || 0,
        unread_count: response.data.unread_count || 0
      };
    } catch (error) {
      // FALLBACK: Return empty notifications when endpoint doesn't exist
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('ℹ️ Using fallback notifications');
        return {
          success: true,
          notifications: [],
          total: 0,
          unread_count: 0
        };
      }
      throw new Error(error.response?.data?.detail || 'Failed to fetch notifications');
    }
  },

  async markAsRead(notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      return { success: true };
    } catch (error) {
      // FALLBACK: Silent success when endpoint doesn't exist
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('ℹ️ Using fallback mark as read');
        return { success: true };
      }
      throw new Error(error.response?.data?.detail || 'Failed to mark notification as read');
    }
  },

  async markAllAsRead() {
    try {
      await api.put('/notifications/mark-all-read');
      return { success: true };
    } catch (error) {
      // FALLBACK: Silent success when endpoint doesn't exist
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('ℹ️ Using fallback mark all as read');
        return { success: true };
      }
      throw new Error(error.response?.data?.detail || 'Failed to mark all notifications as read');
    }
  },

  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return {
        success: true,
        count: response.data.unread_count || response.data.count || 0
      };
    } catch (error) {
      // FALLBACK: Return 0 when endpoint doesn't exist
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('ℹ️ Using fallback unread count');
        return {
          success: true,
          count: 0
        };
      }
      throw new Error(error.response?.data?.detail || 'Failed to get unread count');
    }
  }
};

// Media Service
export const mediaService = {
  async uploadImage(imageFile, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        }
      });

      return {
        success: true,
        url: response.data.url,
        thumbnailUrl: response.data.thumbnail_url,
        filename: response.data.filename
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to upload image');
    }
  }
};

export default api;