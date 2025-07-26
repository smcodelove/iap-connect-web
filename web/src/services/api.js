// src/services/api.js - UPDATED WITH YOUR EXISTING CODE
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

// Auth Service - FIXED: Proper backend format
export const authService = {
  async login(credentials) {
    try {
      // FIXED: Backend expects form data for login
      const formData = new FormData();
      formData.append('username', credentials.email); // Backend expects 'username' field
      formData.append('password', credentials.password);
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (response.data.access_token) {
        // Store token with consistent key
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

// Post Service - FIXED: Match backend API exactly
export const postService = {
  async getFeed(page = 1, size = 20) {
    try {
      const response = await api.get('/posts/feed', {
        params: { page, size }
      });
      
      // Handle different response formats
      const data = response.data;
      
      return {
        success: true,
        posts: data.posts || data || [],
        total: data.total || 0,
        hasNext: data.has_next || false,
        pagination: data.pagination || { page, has_more: false }
      };
    } catch (error) {
      console.error('Feed error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Failed to fetch feed');
    }
  },

  async getTrendingPosts(page = 1, size = 20, hoursWindow = 72) {
    try {
      const response = await api.get('/posts/trending', {
        params: { page, size, hours_window: hoursWindow }
      });
      
      const data = response.data;
      return {
        success: true,
        posts: data.posts || data || [],
        total: data.total || 0,
        hasNext: data.has_next || false,
        pagination: data.pagination || { page, has_more: false }
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch trending posts');
    }
  },

  async createPost(postData) {
    try {
      // Handle both form data and JSON
      const config = {};
      if (postData instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      
      const response = await api.post('/posts', postData, config);
      return { success: true, post: response.data };
    } catch (error) {
      console.error('Create post error:', error.response?.data);
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
        likes_count: response.data.likes_count || 0
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
        likes_count: response.data.likes_count || 0
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to unlike post');
    }
  },

  async searchPosts(query, page = 1, size = 20) {
    try {
      const response = await api.get('/posts/search', {
        params: { q: query, page, size }
      });
      
      const data = response.data;
      return {
        success: true,
        posts: data.posts || data || [],
        total: data.total || 0,
        hasNext: data.has_next || false,
        query: query
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
      const response = await api.get(`/posts/${postId}/comments`, {
        params: { page, size }
      });
      
      return {
        success: true,
        comments: response.data.comments || response.data || [],
        total: response.data.total || 0
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
        likes_count: response.data.likes_count || 0
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
        likes_count: response.data.likes_count || 0
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
        followersCount: response.data.followers_count || 0
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
        followersCount: response.data.followers_count || 0
      };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to unfollow user');
    }
  },

  async searchUsers(query, page = 1, size = 20) {
    try {
      const response = await api.get('/users/search', {
        params: { q: query, page, size }
      });
      
      return {
        success: true,
        users: response.data.users || response.data || [],
        total: response.data.total || 0,
        hasNext: response.data.has_next || false
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
      const response = await api.get('/notifications', {
        params: { page, size }
      });
      
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

export default api;