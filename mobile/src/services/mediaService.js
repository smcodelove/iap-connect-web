// services/mediaService.js - Media Upload Service
/**
 * Media service for handling image/file uploads
 * Features: Image compression, upload progress, multiple formats support
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import api from './api';

class MediaService {
  // Request permissions for camera and gallery
  async requestPermissions() {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted'
      };
    } catch (error) {
      console.error('Permission request error:', error);
      return { camera: false, mediaLibrary: false };
    }
  }

  // Pick single image from gallery
  async pickImage(options = {}) {
    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [16, 9],
      quality: 0.8,
      ...options
    };

    try {
      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const compressedImage = await this.compressImage(asset);
        return { success: true, image: compressedImage };
      }
      
      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Pick image error:', error);
      return { success: false, error: error.message };
    }
  }

  // Pick multiple images from gallery
  async pickMultipleImages(maxImages = 4, options = {}) {
    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
      quality: 0.8,
      ...options
    };

    try {
      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const compressedImages = await Promise.all(
          result.assets.map(asset => this.compressImage(asset))
        );
        return { success: true, images: compressedImages };
      }
      
      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Pick multiple images error:', error);
      return { success: false, error: error.message };
    }
  }

  // Take photo with camera
  async takePhoto(options = {}) {
    const defaultOptions = {
      allowsEditing: false,
      aspect: [16, 9],
      quality: 0.8,
      ...options
    };

    try {
      const result = await ImagePicker.launchCameraAsync(defaultOptions);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const compressedImage = await this.compressImage(asset);
        return { success: true, image: compressedImage };
      }
      
      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Take photo error:', error);
      return { success: false, error: error.message };
    }
  }

  // Compress image to reduce file size
  async compressImage(imageAsset, maxWidth = 1080, quality = 0.8) {
    try {
      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(imageAsset.uri);
      
      // Skip compression if image is already small
      if (imageInfo.size < 500000) { // Less than 500KB
        return imageAsset;
      }

      // Compress image
      const compressedImage = await ImageManipulator.manipulateAsync(
        imageAsset.uri,
        [
          { resize: { width: maxWidth } }
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return {
        ...imageAsset,
        uri: compressedImage.uri,
        width: compressedImage.width,
        height: compressedImage.height
      };
    } catch (error) {
      console.error('Image compression error:', error);
      return imageAsset; // Return original if compression fails
    }
  }

  // Upload single image to server
  async uploadImage(imageUri, onProgress = null) {
    try {
      // Create form data
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      // Upload with progress tracking
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return {
        success: true,
        url: response.data.url,
        filename: response.data.filename
      };
    } catch (error) {
      console.error('Upload image error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to upload image'
      };
    }
  }

  // Upload multiple images
  async uploadMultipleImages(imageUris, onProgress = null) {
    try {
      const uploadPromises = imageUris.map((uri, index) => 
        this.uploadImage(uri, (progress) => {
          if (onProgress) {
            onProgress(index, progress);
          }
        })
      );

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      return {
        success: failedUploads.length === 0,
        urls: successfulUploads.map(result => result.url),
        failed: failedUploads.length,
        results: results
      };
    } catch (error) {
      console.error('Upload multiple images error:', error);
      return {
        success: false,
        error: 'Failed to upload images'
      };
    }
  }

  // Get image picker options
  showImagePickerOptions(onCamera, onGallery, onCancel) {
    return [
      {
        text: 'Camera',
        onPress: onCamera,
        icon: 'camera'
      },
      {
        text: 'Gallery',
        onPress: onGallery,
        icon: 'image'
      },
      {
        text: 'Cancel',
        onPress: onCancel,
        style: 'cancel'
      }
    ];
  }

  // Validate image file
  validateImage(imageAsset, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // Check file size
    if (imageAsset.fileSize && imageAsset.fileSize > maxSizeBytes) {
      return {
        valid: false,
        error: `Image size must be less than ${maxSizeMB}MB`
      };
    }

    // Check dimensions (optional)
    const maxDimension = 4096;
    if (imageAsset.width > maxDimension || imageAsset.height > maxDimension) {
      return {
        valid: false,
        error: `Image dimensions must be less than ${maxDimension}x${maxDimension}`
      };
    }

    return { valid: true };
  }

  // Generate thumbnail for preview
  async generateThumbnail(imageUri, size = 200) {
    try {
      const thumbnail = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: size, height: size } }
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return thumbnail.uri;
    } catch (error) {
      console.error('Generate thumbnail error:', error);
      return imageUri; // Return original if thumbnail generation fails
    }
  }
}

export default new MediaService();


// components/posts/ImagePicker.js - Enhanced Image Picker Component
/**
 * ImagePicker - Enhanced image picker with upload progress
 * Features: Multiple selection, compression, upload progress, preview
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Progress from 'react-native-progress';

import mediaService from '../../services/mediaService';
import LoadingSpinner from '../common/LoadingSpinner';

const { width: screenWidth } = Dimensions.get('window');

// Color constants
const colors = {
  primary: '#0066CC',
  accent: '#FF6B35',
  success: '#28A745',
  danger: '#DC3545',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
};

const ImagePickerComponent = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 4,
  allowCamera = true,
  allowGallery = true 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showFullImage, setShowFullImage] = useState(null);

  // Handle image selection
  const handleImagePicker = useCallback(async (type) => {
    try {
      const permissions = await mediaService.requestPermissions();
      
      if (type === 'camera' && !permissions.camera) {
        Alert.alert('Permission Required', 'Please grant camera permission to take photos');
        return;
      }
      
      if (type === 'gallery' && !permissions.mediaLibrary) {
        Alert.alert('Permission Required', 'Please grant gallery permission to select photos');
        return;
      }

      setUploading(true);
      let result;

      if (type === 'camera') {
        result = await mediaService.takePhoto();
      } else {
        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 1) {
          result = await mediaService.pickImage();
        } else {
          result = await mediaService.pickMultipleImages(remainingSlots);
        }
      }

      if (result.success) {
        const newImages = result.images || [result.image];
        const validImages = [];

        // Validate each image
        for (const image of newImages) {
          const validation = mediaService.validateImage(image);
          if (validation.valid) {
            validImages.push(image);
          } else {
            Alert.alert('Invalid Image', validation.error);
          }
        }

        if (validImages.length > 0) {
          const updatedImages = [...images, ...validImages].slice(0, maxImages);
          onImagesChange(updatedImages);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  // Show image picker options
  const showImagePickerOptions = useCallback(() => {
    const options = [];
    
    if (allowCamera) {
      options.push({
        text: 'Camera',
        onPress: () => handleImagePicker('camera')
      });
    }
    
    if (allowGallery) {
      options.push({
        text: 'Gallery',
        onPress: () => handleImagePicker('gallery')
      });
    }
    
    options.push({
      text: 'Cancel',
      style: 'cancel'
    });

    Alert.alert('Add Photo', 'Choose an option', options);
  }, [handleImagePicker, allowCamera, allowGallery]);

  // Remove image
  const removeImage = useCallback((index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  // Upload images to server
  const uploadImages = useCallback(async () => {
    if (images.length === 0) return [];

    try {
      setUploading(true);
      const imageUris = images.map(img => img.uri);
      
      const result = await mediaService.uploadMultipleImages(
        imageUris,
        (index, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [index]: progress
          }));
        }
      );

      if (result.success) {
        return result.urls;
      } else {
        Alert.alert('Upload Failed', 'Some images could not be uploaded');
        return [];
      }
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload images');
      return [];
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [images]);

  // Render image item
  const renderImageItem = (image, index) => (
    <View key={index} style={styles.imageItem}>
      <TouchableOpacity 
        onPress={() => setShowFullImage(image.uri)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
      </TouchableOpacity>
      
      {/* Upload Progress */}
      {uploading && uploadProgress[index] !== undefined && (
        <View style={styles.progressOverlay}>
          <Progress.Circle
            size={30}
            progress={uploadProgress[index] / 100}
            color={colors.primary}
            thickness={3}
            showsText={true}
            textStyle={styles.progressText}
          />
        </View>
      )}
      
      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(index)}
        disabled={uploading}
      >
        <Icon name="x" size={16} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Images Preview */}
      {images.length > 0 && (
        <View style={styles.imagesContainer}>
          <Text style={styles.imagesLabel}>
            Photos ({images.length}/{maxImages})
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
            contentContainerStyle={styles.imagesScrollContent}
          >
            {images.map((image, index) => renderImageItem(image, index))}
          </ScrollView>
        </View>
      )}

      {/* Add Photo Button */}
      {images.length < maxImages && (
        <TouchableOpacity 
          style={[
            styles.addButton,
            images.length === 0 && styles.addButtonFull,
            uploading && styles.addButtonDisabled
          ]}
          onPress={showImagePickerOptions}
          disabled={uploading}
        >
          {uploading ? (
            <LoadingSpinner size="small" color={colors.primary} />
          ) : (
            <Icon name="plus" size={20} color={colors.primary} />
          )}
          <Text style={styles.addButtonText}>
            {images.length === 0 ? 'Add Photos' : 'Add More'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Full Image Modal */}
      <Modal
        visible={showFullImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(null)}
      >
        <View style={styles.fullImageModal}>
          <TouchableOpacity 
            style={styles.fullImageBackdrop}
            onPress={() => setShowFullImage(null)}
          >
            <View style={styles.fullImageContainer}>
              <Image 
                source={{ uri: showFullImage }} 
                style={styles.fullImage}
                resizeMode="contain"
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFullImage(null)}
              >
                <Icon name="x" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imagesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  imagesScroll: {
    paddingLeft: 16,
  },
  imagesScrollContent: {
    paddingRight: 16,
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.gray200,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 10,
    color: colors.white,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
  },
  addButtonFull: {
    paddingVertical: 20,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  fullImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  fullImageBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImageContainer: {
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ImagePickerComponent;


// Updated backend/app/routers/upload.py - File Upload Endpoints
"""
File upload routes for IAP Connect application.
Handles image and document uploads with validation.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from pathlib import Path
from PIL import Image
import aiofiles

from ..config.database import get_db
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/upload", tags=["Upload"])

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png", 
    "image/gif": ".gif",
    "image/webp": ".webp"
}

ALLOWED_DOCUMENT_TYPES = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx"
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_image_file(file: UploadFile) -> bool:
    """Validate uploaded image file."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES.keys())}"
        )
    return True


def validate_file_size(file: UploadFile) -> bool:
    """Validate file size."""
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    return True


def generate_unique_filename(original_filename: str, content_type: str) -> str:
    """Generate unique filename."""
    extension = ALLOWED_IMAGE_TYPES.get(content_type) or ALLOWED_DOCUMENT_TYPES.get(content_type)
    if not extension:
        extension = Path(original_filename).suffix or ".jpg"
    
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{extension}"


async def save_uploaded_file(file: UploadFile, filename: str) -> str:
    """Save uploaded file to disk."""
    file_path = UPLOAD_DIR / filename
    
    async with aiofiles.open(file_path, 'wb') as buffer:
        content = await file.read()
        await buffer.write(content)
    
    return str(file_path)


def create_thumbnail(image_path: str, thumbnail_path: str, size: tuple = (300, 300)):
    """Create thumbnail for uploaded image."""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, optimize=True, quality=85)
        return True
    except Exception:
        return False


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload an image file.
    
    - **file**: Image file to upload (JPEG, PNG, GIF, WebP)
    - **max_size**: 10MB
    
    Returns the uploaded file URL and metadata.
    """
    # Validate file
    validate_image_file(file)
    validate_file_size(file)
    
    try:
        # Generate unique filename
        filename = generate_unique_filename(file.filename, file.content_type)
        
        # Save file
        file_path = await save_uploaded_file(file, filename)
        
        # Create thumbnail
        thumbnail_filename = f"thumb_{filename}"
        thumbnail_path = UPLOAD_DIR / thumbnail_filename
        create_thumbnail(file_path, str(thumbnail_path))
        
        # Generate URLs (replace with your actual domain)
        base_url = "http://localhost:8000"  # Replace with actual domain
        file_url = f"{base_url}/static/uploads/{filename}"
        thumbnail_url = f"{base_url}/static/uploads/{thumbnail_filename}"
        
        return {
            "success": True,
            "url": file_url,
            "thumbnail_url": thumbnail_url,
            "filename": filename,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size": os.path.getsize(file_path)
        }
        
    except Exception as e:
        # Clean up on error
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        if 'thumbnail_path' in locals() and os.path.exists(thumbnail_path):
            os.remove(thumbnail_path)
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )


@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document file.
    
    - **file**: Document file to upload (PDF, DOC, DOCX)
    - **max_size**: 10MB
    
    Returns the uploaded file URL and metadata.
    """
    # Validate file type
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_DOCUMENT_TYPES.keys())}"
        )
    
    # Validate file size
    validate_file_size(file)
    
    try:
        # Generate unique filename
        filename = generate_unique_filename(file.filename, file.content_type)
        
        # Save file
        file_path = await save_uploaded_file(file, filename)
        
        # Generate URL
        base_url = "http://localhost:8000"  # Replace with actual domain
        file_url = f"{base_url}/static/uploads/{filename}"
        
        return {
            "success": True,
            "url": file_url,
            "filename": filename,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size": os.path.getsize(file_path)
        }
        
    except Exception as e:
        # Clean up on error
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.delete("/file/{filename}")
async def delete_file(
    filename: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an uploaded file.
    
    - **filename**: Name of the file to delete
    
    Only the file owner or admin can delete files.
    """
    file_path = UPLOAD_DIR / filename
    thumbnail_path = UPLOAD_DIR / f"thumb_{filename}"
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        # Remove main file
        os.remove(file_path)
        
        # Remove thumbnail if exists
        if thumbnail_path.exists():
            os.remove(thumbnail_path)
        
        return {"success": True, "message": "File deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file"
        )