// web/src/services/index.js - CENTRALIZED SERVICE EXPORTS
/**
 * Centralized service exports for easy importing
 * FIXED: Proper service exports and imports
 */

// Import all services
import api from './api';
import authService from './authService';
import postService from './postService';
import userService from './userService';
import commentService from './commentService';
import mediaService from './mediaService';

// Import individual services from api.js for backward compatibility
import { 
  commentService as apiCommentService,
  postService as apiPostService,
  userService as apiUserService,
  notificationService,
  bookmarkService,
  uploadService,
  s3UploadService
} from './api';

// Export all services
export {
  // Core services
  api,
  authService,
  postService,
  userService,
  commentService,
  mediaService,
  
  // API services (from api.js)
  apiCommentService,
  apiPostService,
  apiUserService,
  notificationService,
  bookmarkService,
  uploadService,
  s3UploadService
};

// Default export for convenience
export default {
  api,
  auth: authService,
  post: postService,
  user: userService,
  comment: commentService,
  media: mediaService,
  notification: notificationService,
  bookmark: bookmarkService,
  upload: uploadService,
  s3Upload: s3UploadService
};