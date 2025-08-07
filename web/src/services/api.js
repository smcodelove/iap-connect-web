// web/src/services/api.js - COMPLETE WITH ALL MISSING SERVICES

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

// NOTIFICATION SERVICE
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

// COMMENT SERVICE - FIXED ENDPOINTS
export const commentService = {
  // Get comments for a post - FIXED endpoint
  getComments: async (postId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get comments:', error);
      return {
        comments: [],
        total: 0,
        page: 1,
        has_next: false
      };
    }
  },

  // Create a new comment - FIXED endpoint to match backend
  createComment: async (postId, content, parentId = null) => {
    try {
      console.log(`💬 Creating comment for post ${postId}:`, { content, parentId });
      
      // ✅ FIXED: Use correct endpoint that matches backend routing
      const response = await api.post(`/posts/${postId}/comments`, {
        content: content,
        parent_id: parentId
      });
      
      console.log('✅ Comment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId, content) => {
    try {
      const response = await api.put(`/posts/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  },

  // Delete comment - FIXED endpoint
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/posts/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  },

  // Like comment - FIXED endpoint
  likeComment: async (commentId) => {
    try {
      console.log(`❤️ Liking comment ${commentId}`);
      const response = await api.post(`/posts/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to like comment:', error);
      throw error;
    }
  },

  // Unlike comment - FIXED endpoint  
  unlikeComment: async (commentId) => {
    try {
      console.log(`💔 Unliking comment ${commentId}`);
      const response = await api.delete(`/posts/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to unlike comment:', error);
      throw error;
    }
  },

  // Toggle like/unlike comment
  toggleLike: async (commentId) => {
    try {
      const response = await api.post(`/posts/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
      throw error;
    }
  }
};

// POST SERVICE
export const postService = {
  // Get all posts
  getPosts: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get posts:', error);
      return { posts: [], total: 0, page: 1, has_next: false };
    }
  },

  // Get feed posts
  getFeed: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get feed:', error);
      return { posts: [], total: 0, page: 1, has_next: false };
    }
  },

  // Get single post
  getPost: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get post:', error);
      throw error;
    }
  },

  // Create post
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  },

  // Update post
  updatePost: async (postId, postData) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  },

  // Like post
  likePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to like post:', error);
      throw error;
    }
  },

  // Unlike post 
  unlikePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to unlike post:', error);
      throw error;
    }
  },

  // Toggle like/unlike post
  toggleLike: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle post like:', error);
      throw error;
    }
  },

  // Bookmark/unbookmark post
  toggleBookmark: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/bookmark`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  },

  // Search posts
  searchPosts: async (query, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search posts:', error);
      return { posts: [], total: 0, page: 1, has_next: false };
    }
  }
};

// USER SERVICE
export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },

  // Get current user profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to get my profile:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (query, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      return { users: [], total: 0, page: 1, has_next: false };
    }
  },

  // Follow user
  followUser: async (userId) => {
    try {
      const response = await api.post(`/users/follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to follow user:', error);
      throw error;
    }
  },

  // Unfollow user
  unfollowUser: async (userId) => {
    try {
      const response = await api.delete(`/users/follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      throw error;
    }
  },

  // Get followers
  getFollowers: async (userId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/users/followers/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get followers:', error);
      return [];
    }
  },

  // Get following
  getFollowing: async (userId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/users/following/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get following:', error);
      return [];
    }
  }
};

// BOOKMARK SERVICE
export const bookmarkService = {
  // Get bookmarks
  getBookmarks: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/bookmarks?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      return { bookmarks: [], total: 0, page: 1, has_next: false };
    }
  },

  // Add bookmark
  addBookmark: async (postId) => {
    try {
      const response = await api.post('/bookmarks', { post_id: postId });
      return response.data;
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  },

  // Remove bookmark
  removeBookmark: async (bookmarkId) => {
    try {
      const response = await api.delete(`/bookmarks/${bookmarkId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  }
};

// UPLOAD SERVICE
export const uploadService = {
  // Upload avatar
  uploadAvatar: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        } : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  },

  // Upload post media
  uploadPostMedia: async (files, onProgress) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/upload/post-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        } : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload post media:', error);
      throw error;
    }
  },

  // Get upload config
  getConfig: async () => {
    try {
      const response = await api.get('/upload/config');
      return response.data;
    } catch (error) {
      console.error('Failed to get upload config:', error);
      return {
        success: true,
        data: {
          max_file_size_mb: 10,
          max_avatar_size_mb: 2,
          allowed_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          storage_provider: "local",
          s3_available: false
        }
      };
    }
  }
};

// S3 UPLOAD SERVICE - FIXED endpoints for S3
export const s3UploadService = {
  // Upload single image to S3
  uploadImage: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload-s3/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        } : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload image to S3:', error);
      throw error;
    }
  },

  // Upload avatar to S3
  uploadAvatar: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload-s3/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        } : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload avatar to S3:', error);
      throw error;
    }
  },

  // Upload multiple images to S3
  uploadMultipleImages: async (files, onProgress) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/upload-s3/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        } : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload multiple images to S3:', error);
      throw error;
    }
  },

  // Get S3 status
  getStatus: async () => {
    try {
      const response = await api.get('/upload-s3/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get S3 status:', error);
      return { success: false, s3_available: false };
    }
  },

  // Get S3 config
  getConfig: async () => {
    try {
      const response = await api.get('/upload-s3/config');
      return response.data;
    } catch (error) {
      console.error('Failed to get S3 config:', error);
      return {
        success: false,
        data: { s3_available: false }
      };
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