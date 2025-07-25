// mobile/src/utils/constants.js
// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.0.0.2:8000/api/v1',
  LOCALHOST_URL: 'http://localhost:8000/api/v1',
  SIMULATOR_URL: 'http://127.0.0.1:8000/api/v1',
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
  
  // ADDED: Admin endpoints
  ADMIN_USERS: '/admin/users',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_DELETE_USER: '/admin/users',    // DELETE /admin/users/{user_id}
  ADMIN_DELETE_POST: '/admin/posts',    // DELETE /admin/posts/{post_id}
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me'
};

// Screen Names
export const SCREEN_NAMES = {
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  HOME: 'Home',
  FEED: 'Feed',
  PROFILE: 'Profile',
  SEARCH: 'Search',
  POST_CREATE: 'PostCreate',
  CREATE_POST: 'CreatePost',
  POST_DETAIL: 'PostDetail',
  EDIT_PROFILE: 'EditProfile',
  USER_PROFILE: 'UserProfile',
  ADMIN_DASHBOARD: 'AdminDashboard',
  USER_MANAGEMENT: 'UserManagement',
  AUTH_STACK: 'AuthStack',
  MAIN_STACK: 'MainStack',
  TAB_NAVIGATOR: 'TabNavigator'
};

// ADDED: User Types
export const USER_TYPES = {
  DOCTOR: 'doctor',
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Colors
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
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' }
};