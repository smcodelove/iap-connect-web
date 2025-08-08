// web/src/services/mediaService.js - COMPLETE FIXED VERSION WITH CORRECT ENDPOINTS

import api from './api';

class MediaService {
  constructor() {
    // CRITICAL FIX: Get clean backend URL without /api/v1
    this.backendUrl = this.getCleanBackendUrl();
    this.useS3 = false;
    this.s3Config = null;
    this.s3Available = false;
    this.initialized = false;
    
    console.log('🔧 MediaService initialized with backend URL:', this.backendUrl);
  }

  /**
   * Get clean backend URL (without /api/v1) - CRITICAL FIX
   */
  getCleanBackendUrl() {
    // Start with environment URL or default
    let baseUrl = process.env.REACT_APP_API_URL || 'https://iap-connect.onrender.com';
    
    // CRITICAL: Remove /api/v1 completely if it exists
    if (baseUrl.includes('/api/v1')) {
      baseUrl = baseUrl.replace('/api/v1', '');
    }
    
    // Remove any trailing slash
    baseUrl = baseUrl.replace(/\/$/, '');
    
    console.log('🔧 Original URL:', process.env.REACT_APP_API_URL);
    console.log('🔧 Clean URL:', baseUrl);
    
    return baseUrl;
  }

  /**
   * Initialize S3 configuration - FIXED URL CONSTRUCTION
   */
  async initializeS3() {
    if (this.initialized) return this.s3Available;
    
    try {
      console.log('🔧 Checking S3 availability from:', this.backendUrl);
      
      // CRITICAL FIX: Use /api/v1/upload-s3/status (consistent with backend routing)
      const s3StatusUrl = `${this.backendUrl}/api/v1/upload-s3/status`;
      console.log('🔍 S3 Status URL:', s3StatusUrl);
      
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(s3StatusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 S3 Status Response Status:', response.status);
      
      if (!response.ok) {
        console.log('❌ S3 Status request failed:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const s3StatusResponse = await response.json();
      console.log('📋 S3 Status Response:', s3StatusResponse);
      
      if (s3StatusResponse?.s3_available) {
        console.log('✅ S3 detected as available, enabling S3 usage');
        this.s3Available = true;
        this.useS3 = true;
        this.initialized = true;
        
        // Get S3 config
        try {
          const s3ConfigUrl = `${this.backendUrl}/api/v1/upload-s3/config`;
          const configResponse = await fetch(s3ConfigUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (configResponse.ok) {
            const s3ConfigData = await configResponse.json();
            if (s3ConfigData?.success) {
              this.s3Config = s3ConfigData.data;
              console.log('✅ S3 config loaded successfully');
            }
          }
        } catch (configError) {
          console.warn('⚠️ S3 config failed, but S3 is available:', configError.message);
        }
        
        return true;
      } else {
        console.log('❌ S3 not available on backend');
        this.s3Available = false;
        this.useS3 = false;
        this.initialized = true;
        return false;
      }
    } catch (error) {
      console.error('❌ S3 initialization failed:', error);
      this.s3Available = false;
      this.useS3 = false;
      this.initialized = true;
      return false;
    }
  }

  /**
   * Upload user avatar - FIXED RESPONSE PARSING
   */
  async uploadAvatar(file, onProgress = null) {
    try {
      console.log('📤 Starting avatar upload...');
      
      // Initialize S3 first
      await this.initializeS3();
      
      console.log('📤 Upload details:', {
        fileName: file.name,
        size: file.size,
        s3Available: this.s3Available,
        backendUrl: this.backendUrl
      });
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (this.useS3 && this.s3Available) {
        console.log('📤 Uploading avatar to S3...');
        
        const response = await fetch(`${this.backendUrl}/api/v1/upload-s3/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
          },
          body: formData,
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          console.log('✅ Avatar uploaded to S3 successfully:', result);
          
          // CRITICAL FIX: Multiple ways to extract URL from S3 response
          let avatarUrl = result.file_url ||           // ✅ Primary key from backend
                         result.url ||                 // ✅ Backup key
                         result.data?.file_url ||      // ✅ Nested in data object
                         result.data?.url;             // ✅ Nested backup
          
          if (!avatarUrl) {
            console.error('❌ No avatar URL found in S3 response:', result);
            throw new Error('Upload completed but no URL was returned from server');
          }
          
          console.log('✅ Avatar URL extracted successfully:', avatarUrl);
          
          return {
            success: true,
            filename: result.filename || result.data?.filename,
            url: avatarUrl,
            storage: 's3',
            original_filename: file.name,
            size: file.size
          };
        } else {
          console.error('❌ S3 avatar upload failed:', result);
          throw new Error(result.detail || result.message || 'S3 upload failed');
        }
      } else {
        console.log('📤 Using local endpoint: /upload/avatar');
        
        // FIXED: Use api instance for proper error handling and headers
        try {
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
          
          console.log('✅ Local avatar upload successful:', response.data);
          
          // FIXED: Convert relative URL to absolute URL for display
          let avatarUrl = response.data.url || response.data.file_url;
          if (avatarUrl && avatarUrl.startsWith('/static/')) {
            avatarUrl = `${this.backendUrl}${avatarUrl}`;
          }
          
          return {
            success: true,
            filename: response.data.filename,
            url: avatarUrl,
            storage: 'local',
            original_filename: file.name,
            size: file.size
          };
        } catch (apiError) {
          console.error('❌ Local avatar upload API error:', apiError);
          console.error('❌ Response data:', apiError.response?.data);
          console.error('❌ Response status:', apiError.response?.status);
          
          // More detailed error message
          const errorMessage = apiError.response?.data?.detail || 
                              apiError.response?.data?.message || 
                              apiError.message || 
                              'Avatar upload failed';
          
          throw new Error(errorMessage);
        }
      }
      
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      throw new Error(error.message || 'Avatar upload failed');
    }
  }

  /**
   * Upload post media - FIXED WITH CORRECT S3 ENDPOINT LOGIC
   */
  async uploadPostMedia(files, onProgress = null) {
    try {
      console.log('📤 Starting post media upload...');
      
      await this.initializeS3();
      
      const formData = new FormData();
      
      // Handle single file or multiple files
      // FIXED: Handle single file or multiple files with correct parameter names
      if (Array.isArray(files)) {
        if (files.length === 1) {
          // Single file from array - use 'file' parameter for /image endpoint
          formData.append('file', files[0]);
          console.log(`📁 Uploading 1 file from array: ${files[0].name}`);
        } else {
          // Multiple files - use 'files' parameter for /images endpoint
          files.forEach(file => {
            formData.append('files', file);
          });
          console.log(`📁 Uploading ${files.length} files`);
        }
      } else {
        // Single file - use 'file' parameter
        formData.append('file', files);
        console.log(`📁 Uploading 1 file: ${files.name}`);
      }
      
      if (this.useS3 && this.s3Available) {
        console.log('📤 Uploading post media to S3...');
        
        let s3Response;
        let s3Url;
        
        // FIXED: Use correct endpoint based on single vs multiple files
        if (Array.isArray(files) && files.length > 1) {
          // Multiple files - use /images endpoint
          s3Url = `${this.backendUrl}/api/v1/upload-s3/images`;
          console.log('🔍 Using S3 multiple images endpoint:', s3Url);
        } else {
          // Single file - use /image endpoint (this was missing on backend!)
          s3Url = `${this.backendUrl}/api/v1/upload-s3/image`;
          console.log('🔍 Using S3 single image endpoint:', s3Url);
        }
        
        try {
          s3Response = await fetch(s3Url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
            },
            body: formData,
          });
          
          console.log('📡 S3 Response Status:', s3Response.status);
          
          if (!s3Response.ok) {
            const errorText = await s3Response.text();
            console.error('❌ S3 Response Error:', errorText);
            throw new Error(`S3 upload failed: ${s3Response.status} - ${errorText}`);
          }
          
          const result = await s3Response.json();
          console.log('✅ S3 Response Data:', result);
          
          if (result.success) {
            console.log('✅ Post media uploaded to S3 successfully:', result);
            
            // FIXED: Extract URLs from different possible response formats
            let mediaUrls = [];
            
            if (result.uploaded_files && Array.isArray(result.uploaded_files)) {
              // Multiple files response
              mediaUrls = result.uploaded_files.map(file => file.url || file.file_url).filter(Boolean);
            } else if (result.file_url) {
              // Single file response
              mediaUrls = [result.file_url];
            } else if (result.url) {
              // Alternative single file response
              mediaUrls = [result.url];
            } else if (result.data?.uploaded_files) {
              // Nested response format
              mediaUrls = result.data.uploaded_files.map(file => file.url || file.file_url).filter(Boolean);
            }
            
            console.log('✅ Media URLs extracted:', mediaUrls);
            
            return {
              success: true,
              storage: 's3',
              media_urls: mediaUrls,
              files: mediaUrls,
              uploaded_files: mediaUrls.map(url => ({ url }))
            };
          } else {
            throw new Error(result.detail || result.message || 'S3 upload failed');
          }
          
        } catch (fetchError) {
          console.error('❌ S3 fetch error:', fetchError);
          throw new Error(`S3 upload failed: ${fetchError.message}`);
        }
        
      } else {
        console.log('📤 Falling back to local upload...');
        
        // Use local upload endpoint
        const response = await api.post('/upload/post-media', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: onProgress ? (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
            console.log(`📊 Upload progress: ${percent}%`);
          } : undefined,
        });
        
        console.log('✅ Local post media upload successful:', response.data);
        
        // FIXED: Convert relative URLs to absolute URLs for display
        let mediaUrls = response.data.media_urls || 
                       response.data.files || 
                       response.data.uploaded_files || 
                       [];
        
        // Convert relative URLs to absolute
        mediaUrls = mediaUrls.map(url => {
          if (url && url.startsWith('/static/')) {
            return `${this.backendUrl}${url}`;
          }
          return url;
        });
        
        console.log('✅ Local media URLs converted:', mediaUrls);
        
        return {
          success: true,
          storage: 'local',
          media_urls: mediaUrls,
          files: mediaUrls,
          uploaded_files: mediaUrls.map(url => ({ url }))
        };
      }
      
    } catch (error) {
      console.error('❌ Post media upload failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw new Error(error.message || 'Post media upload failed');
    }
  }

  /**
   * Get upload configuration
   */
  async getUploadConfig() {
    try {
      await this.initializeS3();
      
      if (this.s3Config) {
        return this.s3Config;
      }
      
      // Fallback to local config
      const response = await api.get('/upload/config');
      return response.data.data;
      
    } catch (error) {
      console.error('❌ Failed to get upload config:', error);
      // Return default config
      return {
        max_file_size_mb: 10,
        max_avatar_size_mb: 2,
        allowed_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        max_files_per_upload: 5,
        storage_provider: "local",
        s3_available: false
      };
    }
  }

  /**
   * Validation methods - ADDED FOR COMPATIBILITY
   */
  validateFile(file, maxSize = 10) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file size (in MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return { valid: false, error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds limit of ${maxSize}MB` };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please use JPG, PNG, WebP, or GIF.' };
    }

    return { valid: true };
  }

  validateAvatar(file) {
    return this.validateFile(file, 2); // 2MB limit for avatars
  }

  validatePostMedia(files) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    
    for (let file of files) {
      const validation = this.validateFile(file, 10);
      if (!validation.valid) {
        return validation;
      }
    }
    
    return { valid: true };
  }

  /**
   * Helper methods for CreatePostPage compatibility
   */
  validateImage(file, type = 'image') {
    return this.validateFile(file, type === 'avatar' ? 2 : 10);
  }

  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  }

  /**
   * Check if S3 is available
   */
  isS3Available() {
    return this.s3Available;
  }

  /**
   * Get current storage method
   */
  getStorageMethod() {
    return this.useS3 ? 's3' : 'local';
  }

  /**
   * Convert relative URL to absolute URL - UTILITY METHOD
   */
  getAbsoluteUrl(url) {
    if (!url) return url;
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url; // Already absolute
    }
    
    if (url.startsWith('/static/')) {
      return `${this.backendUrl}${url}`;
    }
    
    return url;
  }

  /**
   * Get media URL with proper backend domain
   */
  getMediaUrl(url) {
    return this.getAbsoluteUrl(url);
  }
}

// Export singleton instance
export default new MediaService();