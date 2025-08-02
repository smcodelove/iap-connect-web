// web/src/utils/constants.js - PRODUCTION READY VERSION

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000, // 30 seconds for production
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
  USERS_FOLLOW: '/users/follow',
  USERS_UPLOAD_AVATAR: '/users/upload-avatar',
  
  // Post endpoints
  POSTS: '/posts',
  POSTS_FEED: '/posts/feed',
  POSTS_TRENDING: '/posts/trending',
  POSTS_SEARCH: '/posts/search',
  POSTS_LIKE: '/posts/{id}/like',
  POSTS_BOOKMARK: '/posts/{id}/bookmark',
  
  // Comments endpoints
  COMMENTS: '/comments',
  POST_COMMENTS: '/posts/{id}/comments',
  
  // Admin endpoints
  ADMIN_USERS: '/admin/users',
  ADMIN_DASHBOARD: '/admin/dashboard',
  
  // Notifications endpoints
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD: '/notifications/unread-count',
  NOTIFICATIONS_READ: '/notifications/{id}/read',
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  TOKEN: 'token', // Backup key
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  THEME: 'theme_preference'
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
  TRENDING: '/trending',
  BOOKMARKS: '/bookmarks',
  NOTIFICATIONS: '/notifications'
};

// User Types
export const USER_TYPES = {
  DOCTOR: 'doctor',
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Post Types
export const POST_TYPES = {
  DISCUSSION: 'discussion',
  ARTICLE: 'article',
  CASE_STUDY: 'case-study',
  QUESTION: 'question'
};

// Colors - Medical Theme (Enhanced)
export const colors = {
  // Primary Colors
  primary: '#0066CC',
  primaryLight: '#3385DB',
  primaryDark: '#004499',
  primaryHover: '#0052A3',
  
  // Accent Colors
  accent: '#FF6B35',
  accentLight: '#FF8A5B',
  accentDark: '#E55A2B',
  
  // Status Colors
  success: '#28A745',
  successLight: '#48C766',
  successDark: '#1E7E34',
  
  warning: '#FFC107',
  warningLight: '#FFD54F',
  warningDark: '#F57F17',
  
  danger: '#DC3545',
  dangerLight: '#F56565',
  dangerDark: '#C53030',
  
  info: '#17A2B8',
  infoLight: '#39C9DB',
  infoDark: '#138496',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray Scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#D1D5DB',
  
  // Background Colors
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',
  bgOverlay: 'rgba(0, 0, 0, 0.5)',
  
  // Border Colors
  borderLight: '#E5E7EB',
  borderMedium: '#D1D5DB',
  borderDark: '#9CA3AF',
  
  // Medical Specialty Colors
  cardiology: '#E91E63',
  neurology: '#9C27B0',
  orthopedics: '#FF9800',
  pediatrics: '#4CAF50',
  radiology: '#2196F3',
  surgery: '#F44336',
  internal: '#607D8B',
  emergency: '#FF5722'
};

// Typography (Enhanced)
export const typography = {
  // Font Families
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem'     // 48px
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  
  // Predefined Text Styles
  h1: { 
    fontSize: '2.25rem', 
    fontWeight: '700', 
    lineHeight: '1.25',
    letterSpacing: '-0.025em'
  },
  h2: { 
    fontSize: '1.875rem', 
    fontWeight: '700', 
    lineHeight: '1.25',
    letterSpacing: '-0.025em'
  },
  h3: { 
    fontSize: '1.5rem', 
    fontWeight: '600', 
    lineHeight: '1.25'
  },
  h4: { 
    fontSize: '1.25rem', 
    fontWeight: '600', 
    lineHeight: '1.25'
  },
  h5: { 
    fontSize: '1.125rem', 
    fontWeight: '600', 
    lineHeight: '1.25'
  },
  h6: { 
    fontSize: '1rem', 
    fontWeight: '600', 
    lineHeight: '1.25'
  },
  body: { 
    fontSize: '1rem', 
    fontWeight: '400', 
    lineHeight: '1.5'
  },
  bodyLarge: { 
    fontSize: '1.125rem', 
    fontWeight: '400', 
    lineHeight: '1.5'
  },
  bodySmall: { 
    fontSize: '0.875rem', 
    fontWeight: '400', 
    lineHeight: '1.5'
  },
  caption: { 
    fontSize: '0.875rem', 
    fontWeight: '400', 
    lineHeight: '1.25'
  },
  small: { 
    fontSize: '0.75rem', 
    fontWeight: '400', 
    lineHeight: '1.25'
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: '600',
    lineHeight: '1.25'
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  
  // Legacy support
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  large: '1200px'
};

// Spacing Scale
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem'
};

// Shadow Scale
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

// Border Radius Scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
};

// Animation Durations
export const durations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms'
};

// Z-Index Scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070'
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_MISMATCH: 'Passwords do not match',
  USERNAME_MIN_LENGTH: 'Username must be at least 3 characters long',
  PHONE_INVALID: 'Please enter a valid phone number'
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: process.env.REACT_APP_APP_NAME || 'IAP Connect',
  APP_DESCRIPTION: 'Medical Community Platform',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  POSTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  
  // Production URLs will be set via environment variables
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  
  // Feature flags
  FEATURES: {
    NOTIFICATIONS: true,
    BOOKMARKS: true,
    DARK_MODE: false, // Will be implemented later
    REAL_TIME_CHAT: false // Future feature
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  FOLLOW_SUCCESS: 'User followed successfully!',
  UNFOLLOW_SUCCESS: 'User unfollowed successfully!',
  BOOKMARK_ADDED: 'Post bookmarked!',
  BOOKMARK_REMOVED: 'Bookmark removed!'
};

// Theme Configuration for styled-components
export const theme = {
  colors,
  typography,
  breakpoints,
  spacing,
  shadows,
  borderRadius,
  durations,
  zIndex
};

export default theme;