// web/src/utils/constants.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // User endpoints
  USERS_PROFILE: '/users/profile',
  USERS_SEARCH: '/users/search',
  
  // Post endpoints
  POSTS: '/posts',
  POSTS_FEED: '/posts/feed',
  POSTS_TRENDING: '/posts/trending',
  
  // Comments endpoints
  COMMENTS: '/comments',
  
  // Admin endpoints
  ADMIN_USERS: '/admin/users',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_DELETE_USER: '/admin/users',
  ADMIN_DELETE_POST: '/admin/posts',
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me'
};

// Route Names
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/',
  FEED: '/feed',
  PROFILE: '/profile',
  SEARCH: '/search',
  POST_CREATE: '/create-post',
  POST_DETAIL: '/post/:id',
  EDIT_PROFILE: '/edit-profile',
  USER_PROFILE: '/user/:id',
  ADMIN_DASHBOARD: '/admin',
  USER_MANAGEMENT: '/admin/users'
};

// User Types
export const USER_TYPES = {
  DOCTOR: 'doctor',
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Colors - Medical Theme
export const colors = {
  primary: '#0066CC',
  primaryLight: '#3385DB',
  primaryDark: '#004499',
  accent: '#FF6B35',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  white: '#FFFFFF',
  textPrimary: '#212529',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  black: '#000000'
};

// Typography
export const typography = {
  h1: { fontSize: '2rem', fontWeight: 'bold' },
  h2: { fontSize: '1.5rem', fontWeight: 'bold' },
  h3: { fontSize: '1.25rem', fontWeight: '600' },
  body: { fontSize: '1rem', fontWeight: '400' },
  caption: { fontSize: '0.875rem', fontWeight: '400' },
  small: { fontSize: '0.75rem', fontWeight: '400' }
};

// Breakpoints for responsive design
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  large: '1200px'
};