/**
 * Validation utilities for IAP Connect mobile app
 * Common validation functions for forms and user input
 */

import { VALIDATION } from './constants';

/**
 * Validate email address format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  return password && password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

/**
 * Validate username format and length
 */
export const validateUsername = (username) => {
  if (!username) return false;
  if (username.length < 3 || username.length > VALIDATION.MAX_USERNAME_LENGTH) return false;
  
  // Username should contain only letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

/**
 * Validate full name
 */
export const validateName = (name) => {
  if (!name) return false;
  return name.trim().length >= 2;
};

/**
 * Validate bio length
 */
export const validateBio = (bio) => {
  if (!bio) return true; // Bio is optional
  return bio.length <= VALIDATION.MAX_BIO_LENGTH;
};

/**
 * Validate post content
 */
export const validatePostContent = (content) => {
  if (!content) return false;
  const trimmedContent = content.trim();
  return trimmedContent.length > 0 && trimmedContent.length <= VALIDATION.MAX_POST_LENGTH;
};

/**
 * Validate comment content
 */
export const validateCommentContent = (content) => {
  if (!content) return false;
  const trimmedContent = content.trim();
  return trimmedContent.length > 0 && trimmedContent.length <= VALIDATION.MAX_COMMENT_LENGTH;
};

/**
 * Validate specialty for doctors
 */
export const validateSpecialty = (specialty) => {
  if (!specialty) return false;
  return specialty.trim().length >= 2;
};

/**
 * Validate college for students
 */
export const validateCollege = (college) => {
  if (!college) return false;
  return college.trim().length >= 2;
};

/**
 * Validate phone number (optional field)
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return true; // Phone is optional
  
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL format
 */
export const validateUrl = (url) => {
  if (!url) return true; // URL is optional
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate image file type
 */
export const validateImageType = (fileName) => {
  if (!fileName) return false;
  
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  return allowedTypes.includes(fileExtension);
};

/**
 * Validate file size (in bytes)
 */
export const validateFileSize = (fileSize, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

/**
 * Comprehensive form validation
 */
export const validateLoginForm = (data) => {
  const errors = {};
  
  if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!validatePassword(data.password)) {
    errors.password = `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Signup form validation
 */
export const validateSignupForm = (data) => {
  const errors = {};
  
  if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-50 characters long and contain only letters, numbers, and underscores';
  }
  
  if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!validatePassword(data.password)) {
    errors.password = `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long`;
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (!validateName(data.fullName)) {
    errors.fullName = 'Please enter your full name';
  }
  
  if (!validateBio(data.bio)) {
    errors.bio = `Bio must be less than ${VALIDATION.MAX_BIO_LENGTH} characters`;
  }
  
  // User type specific validation
  if (data.userType === 'doctor' && !validateSpecialty(data.specialty)) {
    errors.specialty = 'Please enter your medical specialty';
  }
  
  if (data.userType === 'student' && !validateCollege(data.college)) {
    errors.college = 'Please enter your college or university name';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Post creation validation
 */
export const validatePostForm = (data) => {
  const errors = {};
  
  if (!validatePostContent(data.content)) {
    errors.content = `Post content is required and must be less than ${VALIDATION.MAX_POST_LENGTH} characters`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Comment validation
 */
export const validateCommentForm = (data) => {
  const errors = {};
  
  if (!validateCommentContent(data.content)) {
    errors.content = `Comment is required and must be less than ${VALIDATION.MAX_COMMENT_LENGTH} characters`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};