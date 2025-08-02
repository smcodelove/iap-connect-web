// web/src/services/mediaService.js
/**
 * Media service for file uploads and management
 * Handles avatar uploads, post media, and document uploads
 */

import api from './api';

class MediaService {
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
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      const response = await api.post('/upload/avatar', formData, config);
      return response.data;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new Error(
        error.response?.data?.detail || 'Avatar upload failed'
      );
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
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        };
      }

      const response = await api.post('/upload/post-media', formData, config);
      return response.data;
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
      formData.append('folder', 'posts');

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
      console.error('Image upload failed:', error);
      throw new Error(
        error.response?.data?.detail || 'Image upload failed'
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
   * @param {string} filePath - File path or URL
   * @returns {Promise} Deletion result
   */
  async deleteFile(filePath) {
    try {
      const response = await api.delete('/upload/file', {
        params: { file_path: filePath },
      });
      return response.data;
    } catch (error) {
      console.error('File deletion failed:', error);
      throw new Error(
        error.response?.data?.detail || 'File deletion failed'
      );
    }
  }

  /**
   * Get file information
   * @param {string} filePath - File path or URL
   * @returns {Promise} File information
   */
  async getFileInfo(filePath) {
    try {
      const response = await api.get('/upload/file-info', {
        params: { file_path: filePath },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to get file information'
      );
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
   * Get upload configuration from server
   * @returns {Promise} Upload configuration
   */
  async getUploadConfig() {
    try {
      const response = await api.get('/upload/health');
      return response.data;
    } catch (error) {
      console.error('Failed to get upload config:', error);
      // Return default config
      return {
        max_file_size_mb: 10,
        supported_formats: {
          images: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          documents: ['pdf', 'doc', 'docx', 'txt'],
        },
      };
    }
  }
}

// Export singleton instance
const mediaService = new MediaService();
export default mediaService;