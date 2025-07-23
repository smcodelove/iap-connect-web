/**
 * App constants for IAP Connect mobile app
 * API configuration and app-wide constants
 */

import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // User endpoints
  USERS_PROFILE: '/users/profile',
  USERS_SEARCH: '/users/search',
  USERS_FOLLOW: '/users/follow',
  USERS_UPLOAD_AVATAR: '/users/upload-avatar',
  
  // Post endpoints
  POSTS_FEED: '/posts/feed',
  POSTS_TRENDING: '/posts/trending',
  POSTS: '/posts',
  POSTS_LIKE: '/posts/:id/like',
  POSTS_SEARCH: '/posts/search',
  
  // Comment endpoints
  COMMENTS: '/posts/:postId/comments',
  DELETE_COMMENT: '/comments/:id',
  
  // Admin endpoints
  ADMIN_USERS: '/admin/users',
  ADMIN_DELETE_USER: '/admin/users/:id',
  ADMIN_DELETE_POST: '/admin/posts/:id',
  ADMIN_DASHBOARD: '/admin/dashboard'
};

// User Types
export const USER_TYPES = {
  DOCTOR: 'doctor',
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@iap_connect_access_token',
  USER_DATA: '@iap_connect_user_data',
  REMEMBER_ME: '@iap_connect_remember_me'
};

// App Information
export const APP_INFO = {
  NAME: 'IAP Connect',
  VERSION: '1.0.0',
  DESCRIPTION: 'Social platform for medical professionals'
};

// Screen Names
export const SCREEN_NAMES = {
  // Auth Screens
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  
  // Tab Screens
  HOME: 'Home',
  TRENDING: 'Trending',
  SEARCH: 'Search',
  PROFILE: 'Profile',
  
  // Stack Screens
  POST_DETAIL: 'PostDetail',
  CREATE_POST: 'CreatePost',
  EDIT_PROFILE: 'EditProfile',
  USER_PROFILE: 'UserProfile'
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_USERNAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
  MAX_POST_LENGTH: 2000,
  MAX_COMMENT_LENGTH: 500
};

// Pagination
export const PAGINATION = {
  PAGE_SIZE: 20,
  INITIAL_PAGE: 1
};

// Animation Durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
};

// Device Dimensions (will be set dynamically)
export const DEVICE = {
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android'
};