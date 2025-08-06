// web/src/services/mediaService.js
/**
 * Media service for file uploads and management
 * Handles avatar uploads, post media, and document uploads
 * UPDATED: Added AWS S3 integration alongside existing local upload functionality
 */

import api from './api';

class MediaService {
  constructor() {
    this.useS3 = false; // Feature flag to switch between local and S3 uploads
    this.s3Config = null;
  }

  /**
   * Initialize S3 configuration (call this when S3 is ready)
   */
  async initializeS3() {
    try {
      const response = await api.get('/upload/config');
      if (response.data?.success && response.data?.data?.storage_provider === 'aws_s3') {
        this.s3Config = response.data.data;
        this.useS3 = true;
        console.log('✅ S3 upload enabled');
      }
    } catch (error) {
      console.log('💾 Using local upload (S3 not available)');
      this.useS3 = false;
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Image file
   * @param {Function} onProgress - Progress callback (progress) => void
   * @returns {Promise} Upload result
   */
  async uploadAvatar(file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute for image uploads
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      console.log('📤 Starting avatar upload...', { fileName: file.name, size: file.size });

      // Use S3 route if available, otherwise fallback to existing
      const endpoint = this.useS3 ? '/upload/avatar' : '/upload/avatar';
      const response = await api.post(endpoint, formData, config);
      
      console.log('📋 Raw response received:', response.data);
      
      // FIXED: Comprehensive response handling for all possible formats
      let result;
      
      if (response.data) {
        // Handle nested data structure
        if (response.data.data) {
          result = response.data.data;
        } else {
          result = response.data;
        }
      } else {
        throw new Error('Empty response from server');
      }
      
      console.log('🔍 Extracted result:', result);
      
      // FIXED: More comprehensive URL extraction with detailed logging
      const possibleUrls = [
        result?.url,
        result?.avatar_url, 
        result?.file_url,
        result?.data?.url,
        result?.data?.avatar_url,
        result?.data?.file_url
      ].filter(Boolean);
      
      console.log('🔗 Found possible URLs:', possibleUrls);
      
      const finalUrl = possibleUrls[0];
      
      if (!finalUrl) {
        console.error('❌ No URL found in response structure:', {
          responseData: response.data,
          result: result,
          possibleUrls: possibleUrls
        });
        throw new Error('No URL returned from server. Upload may have failed.');
      }
      
      console.log('✅ Using URL:', finalUrl);
      
      // FIXED: Return normalized response with comprehensive fallbacks
      return {
        success: true,
        url: finalUrl,
        avatar_url: finalUrl,
        thumbnail_url: result?.thumbnail_url || result?.data?.thumbnail_url,
        filename: result?.filename || result?.data?.filename,
        file_size: result?.file_size || result?.data?.file_size,
        original_filename: result?.original_filename || result?.data?.original_filename,
        ...result
      };
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      
      // FIXED: Better error message extraction
      let errorMessage = 'Avatar upload failed';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload multiple images for posts
   * @param {FileList|Array} files - Image files
   * @param {Function} onProgress - Progress callback (progress) => void
   * @returns {Promise} Upload result with array of URLs
   */
  async uploadPostMedia(files, onProgress = null) {
    try {
      const formData = new FormData();
      
      // Convert FileList to Array and validate
      const fileArray = Array.from(files);
      if (fileArray.length === 0) {
        throw new Error('No files selected');
      }
      
      if (fileArray.length > 5) {
        throw new Error('Maximum 5 files allowed per post');
      }

      // Append all files
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for multiple uploads
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      // Use S3 route if available, otherwise fallback
      const endpoint = this.useS3 ? '/upload/post-images' : '/upload/post-media';
      const response = await api.post(endpoint, formData, config);
      
      return this.useS3 ? response.data.data : response.data;
    } catch (error) {
      console.error('Post media upload failed:', error);
      throw new Error(
        error.response?.data?.detail || 'Media upload failed'
      );
    }
  }

  /**
   * Upload single image file
   * @param {File} file - Image file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload result
   */
  async uploadImage(file, onProgress = null) {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      // Add folder parameter for local uploads
      if (!this.useS3) {
        formData.append('folder', 'posts');
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      // FIXED: Use correct endpoint that exists in backend
      const endpoint = this.useS3 ? '/upload/image' : '/upload/image'; // Changed from '/upload/document'
      const response = await api.post(endpoint, formData, config);
      
      // FIXED: Better response handling
      const result = this.useS3 ? response.data.data : response.data;
      
      if (!result?.url) {
        throw new Error('No URL returned from server');
      }
      
      return {
        success: true,
        url: result.url,
        filename: result.filename,
        file_size: result.file_size,
        ...result
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error(
        error.response?.data?.detail || 'Image upload failed'
      );
    }
  }

  /**
   * Upload multiple individual images (S3 optimized)
   * @param {FileList|Array} files - Image files
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload results
   */
  async uploadMultipleImages(files, onProgress = null) {
    if (!this.useS3) {
      // Fallback to existing uploadPostMedia for local uploads
      return this.uploadPostMedia(files, onProgress);
    }

    try {
      const formData = new FormData();
      
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      const response = await api.post('/upload/images', formData, config);
      return response.data.data;
    } catch (error) {
      console.error('Multiple image upload failed:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to upload images'
      );
    }
  }

  /**
   * Upload document file
   * @param {File} file - Document file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload result
   */
  async uploadDocument(file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'documents');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      const response = await api.post('/upload/document', formData, config);
      return response.data;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw new Error(
        error.response?.data?.detail || 'Document upload failed'
      );
    }
  }

  /**
   * Delete uploaded file
   * @param {string} filePath - File path or URL (or S3 key)
   * @returns {Promise} Deletion result
   */
  async deleteFile(filePath) {
    try {
      let response;
      
      if (this.useS3) {
        // For S3, filePath should be the S3 key
        response = await api.delete(`/upload/file/${filePath}`);
      } else {
        // For local uploads, use query parameter
        response = await api.delete('/upload/file', {
          params: { file_path: filePath },
        });
      }
      
      return this.useS3 ? response.data : response.data;
    } catch (error) {
      console.error('File deletion failed:', error);
      throw new Error(
        error.response?.data?.detail || 'File deletion failed'
      );
    }
  }

  /**
   * Get file information
   * @param {string} filePath - File path or URL (or S3 key)
   * @returns {Promise} File information
   */
  async getFileInfo(filePath) {
    try {
      let response;
      
      if (this.useS3) {
        response = await api.get(`/upload/file-info/${filePath}`);
        return response.data.data;
      } else {
        response = await api.get('/upload/file-info', {
          params: { file_path: filePath },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to get file information'
      );
    }
  }

  /**
   * Get upload configuration from server
   * @returns {Promise} Upload configuration
   */
  async getUploadConfig() {
    try {
      // FIXED: Always use config endpoint consistently
      const response = await api.get('/upload/config');
      
      // FIXED: Better response validation
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid config response');
      }
    } catch (error) {
      console.error('Failed to get upload config:', error);
      // Return default config
      return {
        max_file_size_mb: 10,
        max_avatar_size_mb: 2,
        allowed_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        storage_provider: "local",
        supported_formats: {
          images: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          documents: ['pdf', 'doc', 'docx', 'txt'],
        },
      };
    }
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @param {string} type - File type ('image', 'document', 'avatar')
   * @returns {Object} Validation result
   */
  validateFile(file, type = 'image') {
    const errors = [];

    // Check if file exists
    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    // Size limits based on type
    const sizeLimits = {
      avatar: 2 * 1024 * 1024, // 2MB
      image: 10 * 1024 * 1024, // 10MB
      document: 5 * 1024 * 1024, // 5MB
    };

    const maxSize = sizeLimits[type] || sizeLimits.image;
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Type validation
    const allowedTypes = {
      avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
    };

    const allowed = allowedTypes[type] || allowedTypes.image;
    if (!allowed.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${allowed.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
      },
    };
  }

  /**
   * Validate image file (S3 specific)
   * @param {File} file - Image file to validate
   * @param {string} type - Validation type ('image', 'avatar')
   * @returns {Object} Validation result
   */
  validateImage(file, type = 'image') {
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    // Size limits
    const sizeLimits = {
      avatar: 2 * 1024 * 1024,   // 2MB
      image: 10 * 1024 * 1024,   // 10MB
    };

    const maxSize = sizeLimits[type] || sizeLimits.image;
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Type validation - only images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed: JPG, PNG, WebP, GIF`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        isImage: file.type.startsWith('image/')
      },
    };
  }

  /**
   * Create preview URL for file
   * @param {File} file - File object
   * @returns {string} Preview URL
   */
  createPreviewUrl(file) {
    if (!file) return null;
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL
   * @param {string} url - Preview URL to revoke
   */
  revokePreviewUrl(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Get file type icon based on extension
   * @param {string} filename - Filename
   * @returns {string} Icon name
   */
  getFileTypeIcon(filename) {
    if (!filename) return 'file';

    const extension = filename.split('.').pop()?.toLowerCase();

    const iconMap = {
      // Images
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      webp: 'image',

      // Documents
      pdf: 'file-text',
      doc: 'file-text',
      docx: 'file-text',
      txt: 'file-text',

      // Videos
      mp4: 'video',
      avi: 'video',
      mov: 'video',
      webm: 'video',
    };

    return iconMap[extension] || 'file';
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if URL is a valid image
   * @param {string} url - Image URL
   * @returns {Promise<boolean>} True if valid image
   */
  async isValidImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /**
   * Compress image before upload (client-side)
   * @param {File} file - Image file
   * @param {Object} options - Compression options
   * @returns {Promise<File>} Compressed file
   */
  async compressImage(file, options = {}) {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      outputFormat = 'image/jpeg',
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: outputFormat,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Batch upload files with progress tracking
   * @param {Array} files - Array of files
   * @param {Function} onProgress - Progress callback
   * @param {Function} onFileComplete - Individual file completion callback
   * @returns {Promise} Batch upload results
   */
  async batchUpload(files, onProgress = null, onFileComplete = null) {
    const results = [];
    const total = files.length;
    let completed = 0;

    for (const file of files) {
      try {
        const result = await this.uploadImage(file, (fileProgress) => {
          if (onProgress) {
            const overallProgress = Math.round(
              ((completed + fileProgress / 100) / total) * 100
            );
            onProgress(overallProgress);
          }
        });

        results.push({ success: true, file: file.name, result });
        completed++;

        if (onFileComplete) {
          onFileComplete(file.name, true, result);
        }
      } catch (error) {
        results.push({ success: false, file: file.name, error: error.message });
        completed++;

        if (onFileComplete) {
          onFileComplete(file.name, false, error.message);
        }
      }

      if (onProgress) {
        onProgress(Math.round((completed / total) * 100));
      }
    }

    return results;
  }

  /**
   * Check if S3 upload is enabled
   * @returns {boolean} True if S3 is enabled
   */
  isS3Enabled() {
    return this.useS3;
  }

  /**
   * Get storage provider info
   * @returns {Object} Storage provider information
   */
  getStorageInfo() {
    return {
      provider: this.useS3 ? 'aws_s3' : 'local',
      config: this.s3Config,
      features: {
        optimization: this.useS3,
        cdn: this.useS3,
        scalability: this.useS3 ? 'unlimited' : 'limited'
      }
    };
  }
}

// Export singleton instance
const mediaService = new MediaService();

// Initialize S3 on service creation (non-blocking)
mediaService.initializeS3().catch(() => {
  console.log('💾 Continuing with local upload support');
});

export default mediaService;